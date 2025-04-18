import os
import pandas as pd
import numpy as np

# Global debug flag
DEBUG = True

def debug_print(*args, **kwargs):
    """Print debug messages only if DEBUG is True."""
    if DEBUG:
        import inspect
        frame = inspect.currentframe().f_back
        print(f"[DEBUG] {frame.f_code.co_name} (Line {frame.f_lineno}):", *args, **kwargs)

# ──────────────────────────────────────────────────────────────────────────────
# 1) LOAD & PREP BOTH TABLES  (once, at import time)
# ──────────────────────────────────────────────────────────────────────────────
BASE = os.path.dirname(__file__)

# merged static data
_df = pd.read_excel(
    os.path.join(BASE, "static/data/silver/merged_data.xlsx"),
    dtype={"fipscode": str}
)
debug_print("Loaded merged_data:", _df.shape)

# cost‑of‑living lookup
_COST = pd.read_excel(os.path.join(BASE, "static/data/silver/cost_of_living_data.xlsx"))
debug_print("Loaded cost_of_living_data:", _COST.shape)

# normalize casing & pad FIPS codes
_df["STATE"]    = _df["STATE"].str.upper()
_df["COUNTY"]   = _df["COUNTY"].str.upper()
_df["fipscode"] = _df["fipscode"].str.zfill(5)

# build index: state → slice
_STATE_INDEX = {s: g.reset_index(drop=True) for s, g in _df.groupby("STATE")}
debug_print("States available:", list(_STATE_INDEX.keys())[:5], "...")

# identify numeric features in the merged set
_NON_FEATURES = {"fipscode", "STATE", "STATEABBRV", "COUNTY", "COUNTY_Name"}
_NUMERIC_COLS = [
    c for c in _df.select_dtypes(include=[np.number]).columns
    if c not in _NON_FEATURES
]
debug_print("Numeric columns:", _NUMERIC_COLS[:5], "...")

# precompute global min/max for those numeric columns
_GLOBAL_MIN = _df[_NUMERIC_COLS].min()
_GLOBAL_MAX = _df[_NUMERIC_COLS].max()
debug_print("Global min/max ready.")

# ──────────────────────────────────────────────────────────────────────────────
def compute_ranking(user_input):
    """
    user_input expects:
      - 'states': list[str]
      - 'num_adults', 'num_children'
      - any feature f → user_input[f] & user_input[f + '_weight']
    Returns a DataFrame of the top 10 rows with columns:
      ['fipscode','STATE','COUNTY','rank'] + the features used for ranking.
    """
    try:
        debug_print("compute_ranking input:", user_input)

        # 1) state‑slice
        states = [s.upper() for s in user_input.get("states", []) if str(s).strip()]
        if states:
            debug_print("Filtering for states:", states)
            pieces = [ _STATE_INDEX[s] for s in states if s in _STATE_INDEX ]
            df = pd.concat(pieces, ignore_index=True) if pieces else pd.DataFrame(columns=_df.columns)
        else:
            debug_print("No state filter; using full dataset.")
            df = _df.copy()

        debug_print("After state slice:", df.shape)
        if df.empty:
            return pd.DataFrame(columns=["fipscode","STATE","COUNTY","rank"])

        # 2) merge cost‑of‑living for the specified family size
        na = int(user_input.get("num_adults") or 2)
        nc = int(user_input.get("num_children") or 0)
        fam = f"{na}p{nc}c"
        debug_print("Family size:", fam)

        cost_sub = _COST[_COST["Family"] == fam].drop(columns=["Family"], errors="ignore")
        if not cost_sub.empty:
            debug_print("Merging cost_of_living_data…")
            df = df.merge(
                cost_sub,
                on=["STATE","STATEABBRV","COUNTY"],
                how="left",
                suffixes=("","_cost")
            )
            cost_numeric_cols = cost_sub.select_dtypes(include=[np.number]).columns.tolist()
            # fill missing with 0
            df[cost_numeric_cols] = df[cost_numeric_cols].fillna(0)
            debug_print("Added cost cols:", cost_numeric_cols)
        else:
            cost_numeric_cols = []

        # 3) pick out features & weights from user_input
        feats, wts = [], []
        for k, v in user_input.items():
            if k.endswith("_weight"):
                feat = k[:-7]
                if feat in _NUMERIC_COLS + cost_numeric_cols:
                    try:
                        w = float(v)
                        _ = float(user_input.get(feat, np.nan))
                    except ValueError:
                        debug_print(f"Bad input for {feat}; skipping.")
                        continue
                    feats.append(feat)
                    wts.append(w)

        # fallback: use all numeric + cost features equally
        if not feats:
            debug_print("No sliders; falling back to equal‑weight on all features.")
            feats = _NUMERIC_COLS + cost_numeric_cols
            wts   = [1.0/len(feats)] * len(feats)

        debug_print("Final feature list:", feats)
        debug_print("Weights:", wts)

        # 4) build combined min/max for normalization
        min_all = _GLOBAL_MIN.copy()
        max_all = _GLOBAL_MAX.copy()
        if cost_numeric_cols:
            # compute min/max on this slice
            min_cost = df[cost_numeric_cols].min()
            max_cost = df[cost_numeric_cols].max()
            min_all = pd.concat([min_all, min_cost])
            max_all = pd.concat([max_all, max_cost])

        # normalize df[feats]
        mn    = min_all[feats]
        mx    = max_all[feats]
        denom = (mx - mn).replace(0, 1)
        norm_df = (df[feats] - mn) / denom

        # 5) similarity or raw normalized
        if any(k.endswith("_weight") for k in user_input):
            user_vals = pd.Series({f: float(user_input.get(f, np.nan)) for f in feats})
            user_norm = (user_vals - mn) / denom
            sim = 1.0 - norm_df.subtract(user_norm, axis=1).abs()
        else:
            sim = norm_df

        # 6) weighted sum and rank
        df["ranking_score"] = sim.values.dot(np.array(wts, dtype=float))
        df["rank"]          = df["ranking_score"].rank(ascending=False, method="dense")

        # 7) select top 10 **and include all feats**
        output_cols = ["fipscode","STATE","COUNTY","rank"] + feats
        top10 = (
            df[df["rank"] <= 10]
              .sort_values("rank")
              .loc[:, output_cols]
              .reset_index(drop=True)
        )

        if top10.empty:
            debug_print("No top10 results; returning empty frame.")
            return top10

        top10["rank"] = top10["rank"].astype(int)
        debug_print("Top10 computed:", top10.shape)
        return top10

    except Exception as e:
        debug_print("Error in compute_ranking:", str(e))
        raise

if __name__ == "__main__":

    # Example
    user_input = {
        'states':'',
        'num_adults': '',
        'num_children': '',
        'RISK_VALUE':'',
        'RISK_VALUE_weight':'',
        'RISK_SCORE':'',
        'RISK_SCORE_weight':'',
        'RISK_SPCTL':'',
        'RISK_SPCTL_weight':'',
        'RISK_RATNG':'',
        'RISK_RATNG_weight':'',
        'RESL_VALUE':'',
        'RESL_VALUE_weight':'',
        'RESL_SCORE':'',
        'RESL_SCORE_weight':'',
        'RESL_SPCTL':'',
        'RESL_SPCTL_weight':'',
        'RESL_RATNG':'',
        'RESL_RATNG_weight':'',
        'Monthly_Childcare':'',
        'Monthly_Childcare_weight':'',
        'Monthly_Food':'',
        'Monthly_Food_weight':'', 
        'Monthly_Healthcare':'',
        'Monthly_Healthcare_weight':'',
        'Monthly_Housing':'',
        'Monthly_Housing_weight':'',
        'Monthly_Other Necessities ' :'',
        'Monthly_Other Necessities _weight' :'',
        'Monthly_Taxes':'',
        'Monthly_Taxes_weight':'',
        'Monthly_Total':'',
        'Monthly_Total_weight':'',
        'Monthly_Transportation':'',
        'Monthly_Transportation_weight':'', 
        'Access to Exercise Opportunities':'',
        'Access to Exercise Opportunities_weight':'',
        'Food Environment Index':'',
        'Food Environment Index_weight':'',
        'Primary Care Physicians':'',
        'Primary Care Physicians_weight':'',
        'Air Pollution: Particulate Matter':'',
        'Air Pollution: Particulate Matter_weight':'',
        'Broadband Access':'',
        'Broadband Access_weight':'',
        'Life Expectancy':'',
        'Life Expectancy_weight':'',
        'Traffic Volume':'',
        'Traffic Volume_weight':'',
        'Homeownership':'',
        'Homeownership_weight':'',
        'Access to Parks':'',
        'Access to Parks_weight':'',
        'Average Temperature F':'',
        'Average Temperature F_weight':'',
        'Maximum Temperature F':'',
        'Maximum Temperature F_weight':'',
        'Minimum Temperature F':'',
        'Minimum Temperature F_weight':'',
        'Precipitation_inches':'',
        'Precipitation_inches_weight':'',
        'median_sale_price':'',
        'median_sale_price_weight':'',
        'median_list_price':'',
        'median_list_price_weight':'',
        'median_ppsf':'',
        'median_ppsf_weight':'',
        'homes_sold':'',
        'homes_sold_weight':'',
        'new_listings':'',
        'new_listings_weight':'',
        'inventory':'',
        'inventory_weight':'',
        'months_of_supply':'',
        'months_of_supply_weight':'',
        'median_dom_months':'',
        'median_dom_months_weight':'',
        'Unemployment_Rate':'',
        'Unemployment_Rate_weight':'',
        'crime_rate_per_100000':'',
        'crime_rate_per_100000_weight':''
    }


    # user_input = {
    #     'state' :'ohio',
    #     'median_sale_price' : 500000,
    #     'median_sale_price_weight' : 0.8,
    #     'unemployment_rate' : 0.04,
    #     'unemployment_rate_weight' : 0.2
    # }

    result_within_state = compute_ranking(user_input)

    print(result_within_state)
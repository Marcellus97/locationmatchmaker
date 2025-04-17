import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import MinMaxScaler

# Global debug flag
DEBUG = True

def debug_print(*args, **kwargs):
    """Print debug messages only if DEBUG is True."""
    if DEBUG:
        import inspect
        frame = inspect.currentframe().f_back
        line_number = frame.f_lineno
        function_name = frame.f_code.co_name
        print(f"[DEBUG] {function_name} (Line {line_number}):", *args, **kwargs)

script_dir = os.path.dirname(os.path.abspath(__file__))

static_merged_data = pd.read_excel(os.path.join(script_dir, "./static/data/silver/merged_data.xlsx"))
cost_of_living_data = pd.read_excel(os.path.join(script_dir, "./static/data/silver/cost_of_living_data.xlsx"))


def compute_ranking(static_merged_data, cost_of_living_data, user_input):
    debug_print("Starting compute_ranking with user_input:", user_input)

    # MERGE - Cost of living data with rest of the data to create the final dataset
    num_adults = int(user_input.get('num_adults') or 2)
    num_children = int(user_input.get('num_children') or 0)
    family_size = f"{num_adults}p{num_children}c"
    debug_print(f"Family size determined: {family_size}")

    cost_of_living_data = cost_of_living_data[cost_of_living_data['Family'] == family_size]

    if cost_of_living_data.empty:
        debug_print(f"No cost_of_living data found for family size {family_size}. Returning static_merged_data.")
        return static_merged_data  
    
    df = pd.merge(static_merged_data, cost_of_living_data, on=["STATE", "STATEABBRV", "COUNTY"], how='outer', suffixes=('', '_right'))
    debug_print("Merged data shape:", df.shape)

    df['COUNTY_Name'] = df['COUNTY_Name'].fillna(df['COUNTY_Name_right'])
    df.drop(columns=['COUNTY_Name_right'], inplace=True)
    df['COUNTY_Name'] = df['COUNTY_Name'].str.upper()
    
    try:
        # ---------- STATE FILTER ----------
        # state_single = str(user_input.get('state', '')).strip()
        state_list = [s.strip() for s in user_input.get('states', []) if s.strip()]

        # # Treat single state as a list for consistency
        # if state_single:
        #     state_list = [state_single]

        if state_list:
            
            up = [s.upper() for s in state_list]
            df = df[df['STATE'].str.upper().isin(up)]
            debug_print(f"Filtering by states: {state_list}")
            # state_list_upper = [s.upper() for s in state_list]
            # df = df[df['STATE'].str.upper().isin(state_list_upper)]
        else:
            debug_print("No state filter applied. Using all states.")

        debug_print("Data shape after state filter:", df.shape)

        if df.empty:
            raise ValueError("No data available for the provided state(s).")

        # DUPLICATES - Check
        dupes_only = (
            df.groupby(['STATE', "STATEABBRV", "COUNTY"])
            .size()
            .reset_index(name='count')
            .query('count > 1')
        )
        debug_print("Duplicate rows found:", dupes_only)

        # MISSING VALUES: Fill in the missing values
        def fill_missing_values(df, col, method='mean'):
            if method == 'mean':
                return df.groupby('STATE')[col].transform(lambda x: x.fillna(x.mean()))
            elif method == 'median':
                return df.groupby('STATE')[col].transform(lambda x: x.fillna(x.median()))
            elif method == 'mode':
                return df.groupby('STATE')[col].transform(lambda x: x.fillna(x.mode().iloc[0] if not x.mode().empty else x))
            else:
                raise ValueError("method must be 'mean', 'median', or 'mode'")

        # Analyze skewness
        check_skew_col = df.columns.difference(['STATE', "STATEABBRV", "COUNTY", 'COUNTY_Name', "RISK_RATNG", "RESL_RATNG", "Family"])
        skew_results = []
        for col in check_skew_col:
            skewness = df[col].skew()
            suggested_method = 'median' if abs(skewness) > 0.5 else 'mean'
            skew_results.append((col, round(skewness, 2), suggested_method))
        skew_df = pd.DataFrame(skew_results, columns=['Column', 'Skewness', 'Suggested Method'])
        debug_print("Skewness analysis results:\n", skew_df)

        # Fill missing values based on skewness analysis
        for col, _, method in skew_results:
            df[col] = fill_missing_values(df, col, method=method)

        debug_print("Data after filling missing values:\n", df.head())

        # Filter by state if provided
        state = user_input.get('state', '').strip()
        if state:
            debug_print(f"Filtering by state: {state}")
            filtered_df = df[df['STATE'].str.upper() == state.upper()].copy()
            if not filtered_df.empty:
                df = filtered_df
        
        print("Filtered data shape:", df.shape)

        # Extract features and weights from user input
        excluded_keys = ['states', 'num_adults', 'num_children', 'fipscode']
        debug_print("User input before cleaning:", user_input)
        cleaned_input = {
            k: v for k, v in user_input.items()
            if (
                k not in excluded_keys and
                pd.notna(v) and v != '' and
                not isinstance(v, (list, dict))   # keep only scalars
            )
        }

        debug_print("Cleaned user input for ranking:", cleaned_input)

        features = []
        values = {}
        weights = {}
        for key in cleaned_input:
            if 'weight' not in key:
                feature = key
                weight_key = f"{feature}_weight"
                val = user_input.get(key)
                weight = user_input.get(weight_key)

                if val not in ['', None] and weight not in ['', None]:
                    try:
                        val = float(val)
                        weight = float(weight)
                        features.append(feature)
                        values[feature] = val
                        weights[feature] = weight
                    except ValueError:
                        debug_print(f"Skipping invalid input for feature: {feature}")
                        continue

        debug_print("Features:", features)
        debug_print("Values:", values)
        debug_print("Weights:", weights)

        # RANKING LOGIC
        # Fix ambiguous truth value error
        if len(features) > 0:  # Explicitly check if features list is non-empty
            debug_print("Ranking based on user-provided features.")
            scaler = MinMaxScaler()
            df[features] = scaler.fit_transform(df[features])
            user_input_normalized = {
                col: (values[col] - scaler.data_min_[i]) / (scaler.data_max_[i] - scaler.data_min_[i])
                for i, col in enumerate(features)
            }

            for col in features:
                df[col + '_score'] = 1 - abs(df[col] - user_input_normalized[col])

            df['ranking_score'] = sum(
                df[col + '_score'] * weights[col] for col in features
            )
        else:
            debug_print("Fallback to equal weight ranking.")
            fallback_features = [
                col for col in df.select_dtypes(include=[np.number]).columns if col not in excluded_keys
            ]
            scaler = MinMaxScaler()
            df[fallback_features] = scaler.fit_transform(df[fallback_features])
            equal_weight = 1 / len(fallback_features)
            weights = {col: equal_weight for col in fallback_features}

            def calculate_rank_score(row):
                values = [row[col] * weights[col] for col in fallback_features if pd.notna(row[col])]
                return sum(values) / len(values) if len(values) > 0 else np.nan

            df['ranking_score'] = df.apply(calculate_rank_score, axis=1)

        # Ensure no ambiguous truth value errors
        if df['ranking_score'].isnull().all():  # Explicitly check if all values are NaN
            raise ValueError("All ranking scores are NaN. Check input data and weights.")

        df['rank'] = df['ranking_score'].rank(ascending=False, method='dense')
        debug_print("Final ranking results:\n", df[['STATE', 'COUNTY', 'rank']].head())

        # Return the top 10 counties
        cols = ['fipscode', 'STATE', 'COUNTY', 'rank', 'median_sale_price', 'Monthly_Housing', 'Life Expectancy', 'RISK_SCORE', 'RESL_SCORE']
        available_cols = [c for c in cols if c in df.columns]
        county_list = df[df['rank'] <= 10][available_cols]
        debug_print("Top 10 counties:\n", county_list)

        return county_list

    except Exception as e:
        debug_print("Error during ranking computation:", str(e))
        raise

if __name__ == "__main__":
    # Example
    user_input = {
        'state':'VIRGINIA',
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

    result_within_state = compute_ranking(static_merged_data, cost_of_living_data, user_input)

    print(result_within_state)
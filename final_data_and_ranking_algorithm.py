import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import MinMaxScaler

# Global debug flag
DEBUG = False

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
    static_merged_data['fipscode'] = static_merged_data['fipscode'].astype(str).str.zfill(5)

    # MERGE - Cost of living data with rest of the data to create the final dataset
    num_adults = int(user_input.get('num_adults') or 2)
    num_children = int(user_input.get('num_children') or 0)

    family_size = f"{num_adults}p{num_children}c"
    debug_print(f"Family size determined: {family_size}")

    cost_of_living_data = cost_of_living_data[cost_of_living_data['Family'] == family_size]

    if cost_of_living_data.empty:
        print(f"No cost_of_living data found for family size {family_size}.")
        return static_merged_data  
    
    df = pd.merge(static_merged_data, cost_of_living_data, on=["STATE","STATEABBRV", "COUNTY"], how='outer', suffixes=('', '_right'))
    debug_print("Merged data shape:", df.shape)
    
    df['COUNTY_Name'] = df['COUNTY_Name'].fillna(df['COUNTY_Name_right'])
    df.drop(columns=['COUNTY_Name_right'], inplace=True)
    df['COUNTY_Name'] = df['COUNTY_Name'].str.upper()
    
    def merge_duplicate_fipscode_rows(df):
        merged = (
            df.groupby('fipscode', as_index=False)
            .agg(lambda x: x.ffill().bfill().iloc[0] if x.isnull().any() else x.iloc[0])
        )
        return merged
    df = merge_duplicate_fipscode_rows(df)

    # DUPLICATES - Check
    dupes_only = (
        df.groupby(['STATE',"STATEABBRV", "COUNTY"])
        .size()
        .reset_index(name='count')
        .query('count > 1')
        )
    print(dupes_only)
    df.to_excel(os.path.join(script_dir,"./static/data/output.xlsx"), index=False)

    try:
        # ---------- STATE FILTER ----------
        # state_single = str(user_input.get('state', '')).strip()
        state_list = [s.strip() for s in user_input.get('states', []) if s.strip()]
        debug_print("states:", state_list)
        
        # # Treat single state as a list for consistency
        # if state_single:
        #     state_list = [state_single]

        if state_list:
            
            up = [s.upper() for s in state_list]
            df = df[df['STATE'].str.upper().isin(up)]  
            debug_print(f"Filtering by states: {state_list}")
        else:
            debug_print("No state filter applied. Using all states.")

        debug_print("Data shape after state filter:", df.shape)

        if df.empty:
            raise ValueError("No data available for the provided state(s).")

        # MISSING VALUES: Fill in the missing values by grouping by the STATE
        # - Use mean to fill in if  column is continuous and has a normal distribution
        # - Use median to fill in if column has outlier or is highly skewed
        # - Use mode to fill in if column is categorical

        # DO NOT fill missing value for STATE, STATEABBREV, COUNTY and COUNTY_name

        def fill_missing_values(df, col, method='mean'):
            if method == 'mean':
                return df.groupby('STATE')[col].transform(lambda x: x.fillna(x.mean()))
            elif method == 'median':
                return df.groupby('STATE')[col].transform(lambda x: x.fillna(x.median()))
            elif method == 'mode':
                return df.groupby('STATE')[col].transform(lambda x: x.fillna(x.mode().iloc[0] if not x.mode().empty else x))
            else:
                raise ValueError("method must be 'mean' or 'median'")

        # Analyze skewness
        check_skew_col = df.columns.difference(['STATE',"STATEABBRV", "COUNTY", 'COUNTY_Name', 'fipscode', "RISK_RATNG", "RESL_RATNG","Family"])
        
        skew_results = []
        for col in check_skew_col:
            skewness = df[col].skew()
            suggested_method = 'median' if abs(skewness) > 0.5 else 'mean'
            skew_results.append((col, round(skewness, 2), suggested_method))
        skew_df = pd.DataFrame(skew_results, columns=['Column', 'Skewness', 'Suggested Method'])
        debug_print("Skewness analysis results:\n", skew_df)

        # Fill missing values based on skewness analysis
        for col, _, method in skew_results:
            df.loc[:,col] = fill_missing_values(df, col, method=method)

        debug_print("Data after filling missing values:\n", df.head())
            # Define rating order for categorical columns
        
        # Define rating order for categorical columns
        rating_order = {
            'Very Low': 1,
            'Relatively Low ': 2,
            'Relatively Moderate': 3,
            'Relatively High ': 4,
            'Very High': 5
        }

        df['RISK_RATNG'] = df['RISK_RATNG'].apply(
        lambda x: rating_order.get(str(x).strip().title(), None) if pd.notna(x) else None)

        df['RESL_RATNG'] = df['RESL_RATNG'].apply(
            lambda x: rating_order.get(str(x).strip().title(), None) if pd.notna(x) else None)

        min_max = df[['RISK_VALUE','RISK_SCORE','RISK_SPCTL',
                    'RISK_RATNG','RESL_RATNG',
                    'RESL_VALUE','RESL_SCORE','RESL_SPCTL',
                    'Monthly_Childcare','Monthly_Food','Monthly_Healthcare',
                    'Monthly_Housing','Monthly_Other Necessities ','Monthly_Taxes',
                    'Monthly_Total','Monthly_Transportation','Access to Exercise Opportunities',
                    'Food Environment Index','Primary Care Physicians','Air Pollution: Particulate Matter',
                    'Broadband Access','Life Expectancy','Traffic Volume',
                    'Homeownership','Access to Parks','Average Temperature F',
                    'Maximum Temperature F','Minimum Temperature F','Precipitation_inches',
                    'median_sale_price','median_list_price','median_ppsf',
                    'homes_sold','new_listings','inventory',
                    'months_of_supply','median_dom_months','Unemployment_Rate',
                    'crime_rate_per_100000']].agg(['min', 'max']).transpose()
        
        print(min_max)
        # Comment this out for real use
        # df.to_excel(os.path.join(script_dir, "./static/data/gold/final_dataset.xlsx"))

        # # Filter by state if provided
        # state = user_input.get('state', '').strip()

        # # Only apply the filter if a valid state is entered and matches data
        # if state:
        #     filtered_df = df[df['STATE'].str.upper() == state.upper()].copy()
        #     if not filtered_df.empty:
        #         df = filtered_df
        # Remove these from user input as we have filtered by state and family
        # Keep only the feature that will be used to rank the county
        excluded_keys = ['state', 'num_adults', 'num_children', 'fipscode']
        debug_print("User input before cleaning:", user_input)

        cleaned_input = {}
        for k, v in user_input.items():
            if isinstance(v, list):
                # Keep if non-empty and doesn't contain only blanks
                if any(str(x).strip() != '' for x in v):
                    cleaned_input[k] = [str(x).strip() for x in v if str(x).strip() != '']
            else:
                if pd.notna(v) and str(v).strip() != '':
                    cleaned_input[k] = str(v).strip()   
        debug_print("Cleaned user input for ranking:", cleaned_input)

        # Convert categorical user inutss to numeric
        rating_keys = ['RISK_RATNG', 'RESL_RATNG']
        for key in rating_keys:
            try:
                val = str(user_input[key]).strip()
                user_input[key] = rating_order[val]
            except (KeyError, ValueError):
                pass 
        
        # Seperate the user input data to values and weights
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

        direction = {
            'RISK_VALUE':-1,
            'RISK_SCORE':-1,
            'RISK_SPCTL':-1,
            'RESL_VALUE':1,
            'RESL_SCORE':1,
            'RESL_SPCTL':1,
            'Monthly_Childcare':-1,
            'Monthly_Food':-1, 
            'Monthly_Healthcare':-1,
            'Monthly_Housing':-1,
            'Monthly_Other Necessities ' :-1,
            'Monthly_Taxes':-1,
            'Monthly_Total':-1,
            'Monthly_Transportation':-1, 
            'Access to Exercise Opportunities':1,
            'Food Environment Index':1,
            'Primary Care Physicians':1,
            'Air Pollution: Particulate Matter':-1,
            'Broadband Access':1,
            'Life Expectancy':1,
            'Traffic Volume':-1,
            'Homeownership':1,
            'Access to Parks':1,
            'Average Temperature F':1,
            'Maximum Temperature F':1,
            'Minimum Temperature F':1,
            'Precipitation_inches':1,
            'median_sale_price':1,
            'median_list_price':1,
            'median_ppsf':1,
            'homes_sold':1,
            'new_listings':1,
            'inventory':1,
            'months_of_supply':-1,
            'median_dom_months':-1,
            'Unemployment_Rate':-1,
            'crime_rate_per_100000':-1
        }
        # RANKING LOGIC
        # Drop rows if any of the features have a value of 0    
        df = df.copy()
        print(df)
        if num_children == 0:
                required_features = ['Life Expectancy', 'Homeownership', 'POPULATION', 'Average Temperature F', 'Maximum Temperature F',
                                    'Minimum Temperature F', 'median_sale_price', 'median_list_price', 'median_ppsf', 'Monthly_Housing',
                                    'Monthly_Food', 'Monthly_Transportation', 'Monthly_Healthcare', 'Monthly_Other Necessities ', 
                                    'Monthly_Taxes', 'Monthly_Total'] 
        else:
                required_features = ['Life Expectancy', 'Homeownership', 'POPULATION', 'Average Temperature F', 'Maximum Temperature F',
                                'Minimum Temperature F', 'median_sale_price', 'median_list_price', 'median_ppsf', 'Monthly_Housing',
                                'Monthly_Food', 'Monthly_Transportation', 'Monthly_Healthcare', 'Monthly_Other Necessities ', 
                                'Monthly_Childcare', 'Monthly_Taxes', 'Monthly_Total'] 
            
        df = df[(df[required_features] != 0).all(axis=1)]
        
        if len(features) > 0:     
            debug_print("Ranking based on user-provided features.")
            # Normalize numeric features
            scaler = MinMaxScaler()
            scale_features = df[features]
            df_scaled = scaler.fit_transform(scale_features)
            df_scaled = pd.DataFrame(df_scaled, columns=features, index=df.index)

            user_input_normalized = {}
            for i, col in enumerate(features):
                col_min = scaler.data_min_[i]
                col_max = scaler.data_max_[i]
                user_val = values[col]
                user_val = float(user_val)
                user_input_normalized[col] = (user_val - col_min) / (col_max - col_min)
            
            # Compute similarity scores
            for col in features:
                score = 1 - abs(df_scaled[col] - user_input_normalized[col])
                df[col + '_score'] = score

            # Compute ranking score
            df['ranking_score'] = sum(df[col + '_score'] * weights[col] for col in features)
        
            cols = ['fipscode', 'STATE', 'COUNTY', 'rank'] + features

        else:
            debug_print("Fallback to equal weight ranking.")
            fallback_features = [col for col in df.select_dtypes(include=[np.number]).columns if col not in excluded_keys]

            # Normalize the numeric features
            scaler = MinMaxScaler()
            scale_features = df[fallback_features]
            df_scaled = scaler.fit_transform(scale_features)
            df_scaled = pd.DataFrame(df_scaled, columns=fallback_features, index=df.index)
            
            for col in fallback_features:
                if direction.get(col, 1) == -1:
                    df_scaled[col] = 1 - df_scaled[col]
            
            # Assign equal weights
            equal_weight = 1 / len(fallback_features)
            weights = {col: equal_weight for col in fallback_features}

            def calculate_rank_score(row):
                values = []
                wts = []
                for col in fallback_features:
                    if pd.notna(row[col]):
                        values.append(row[col] * weights[col])
                        wts.append(weights[col])
                return sum(values) / sum(wts) if wts else np.nan
            
            # Compute ranking score
            df['ranking_score'] = df_scaled.apply(calculate_rank_score, axis=1)
            cols = ['fipscode', 'STATE', 'COUNTY', 'rank'] + fallback_features


        df['rank'] = df['ranking_score'].rank(ascending=False, method='dense')
        debug_print("Final ranking results:\n", df[['STATE', 'COUNTY', 'rank']].head())
        
        # Exports ranked data to excel     
        # Comment this out for real use
        # df.to_excel(os.path.join(script_dir, "./static/data/gold/final_data_rank.xlsx"))

        # Find the county that ranked no.1
        # county_list = df[df['rank'] <= 10][['fipscode','STATE','COUNTY', 'rank']].sort_values(by='rank').reset_index(drop=True)
        # keep only the columns that actually exist
        # cols = ['fipscode','STATE','COUNTY','rank',
        #     'median_sale_price','Monthly_Housing',
        #     'Life Expectancy','RISK_SCORE','RESL_SCORE',
        #     'num_adults','num_children']    
        #available_cols = [c for c in cols if c in df.columns]
        county_list     = df[df['rank'] <= 10][cols].sort_values(by='rank').reset_index(drop=True)
        county_list = county_list.copy()  # safe practice if modifying in place
        numeric_cols = county_list.select_dtypes(include='number').columns
        county_list[numeric_cols] = county_list[numeric_cols].round(0).astype('Int64')
        debug_print("Top 10 counties:\n", county_list)

        #Display the county/counties
        return county_list
    except Exception as e:
        debug_print("Error during ranking computation:", str(e))
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

    result_within_state = compute_ranking(static_merged_data, cost_of_living_data, user_input)

    print(result_within_state)
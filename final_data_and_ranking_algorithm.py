import pandas as pd
import numpy as np
import os
from sklearn.preprocessing import MinMaxScaler

script_dir = os.path.dirname(os.path.abspath(__file__))

static_merged_data = pd.read_excel(os.path.join(script_dir, "./static/data/silver/merged_data.xlsx"))
cost_of_living_data = pd.read_excel(os.path.join(script_dir, "./static/data/silver/cost_of_living_data.xlsx"))


def compute_ranking(static_merged_data, cost_of_living_data, user_input):
    # MERGE - Cost of living data with rest of the data to create the final dataset
    num_adults = int(user_input.get('num_adults') or 1)
    num_children = int(user_input.get('num_children') or 1)

    family_size = f"{num_adults}p{num_children}c"
    cost_of_living_data = cost_of_living_data[cost_of_living_data['Family'] == family_size]

    if cost_of_living_data.empty:
        print(f"No cost_of_living data found for family size {family_size}.")
        return static_merged_data  
    
    df = pd.merge(static_merged_data, cost_of_living_data, on=["STATE","STATEABBRV", "COUNTY"], how='outer', suffixes=('', '_right'))
    df['COUNTY_Name'] = df['COUNTY_Name'].fillna(df['COUNTY_Name_right'])
    df.drop(columns=['COUNTY_Name_right'], inplace=True)
    df['COUNTY_Name'] = df['COUNTY_Name'].str.upper()
    
    # DUPLICATES - Check
    dupes_only = (
        df.groupby(['STATE',"STATEABBRV", "COUNTY"])
        .size()
        .reset_index(name='count')
        .query('count > 1')
        )
    print(dupes_only)

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
    check_skew_col = df.columns.difference(['STATE',"STATEABBRV", "COUNTY", 'COUNTY_Name', "RISK_RATNG", "RESL_RATNG","Family"])

    skew_results = []
    for col in check_skew_col:
        skewness = df[col].skew()
        if abs(skewness) > 0.5:
            suggested_method = 'median'
        else:
            suggested_method = 'mean'
        skew_results.append((col, round(skewness, 2), suggested_method))

    skew_df = pd.DataFrame(skew_results, columns=['Column', 'Skewness', 'Suggested Method'])
    print(skew_df)

    # Use the approprirate method to fill in the missing values 
    df['RISK_VALUE'] = fill_missing_values(df, 'RISK_VALUE', method='median')
    df['RISK_SCORE'] = fill_missing_values(df, 'RISK_SCORE', method='mean')
    df['RISK_SPCTL'] = fill_missing_values(df, 'RISK_SPCTL', method='mean')
    df['RISK_RATNG'] = fill_missing_values(df, 'RISK_RATNG', method='mode')  
    df['RESL_VALUE'] = fill_missing_values(df, 'RESL_VALUE', method='mean')
    df['RESL_SCORE'] = fill_missing_values(df, 'RESL_SCORE', method='mean')
    df['RESL_SPCTL'] = fill_missing_values(df, 'RESL_SPCTL', method='mean')
    df['RESL_RATNG'] = fill_missing_values(df, 'RESL_RATNG', method='mode') 
    df['Monthly_Childcare'] = fill_missing_values(df, 'Monthly_Childcare', method='median') 
    df['Monthly_Food'] = fill_missing_values(df, 'Monthly_Food', method='median') 
    df['Monthly_Healthcare'] = fill_missing_values(df, 'Monthly_Healthcare', method='median') 
    df['Monthly_Housing'] = fill_missing_values(df, 'Monthly_Housing', method='median') 
    df['Monthly_Other Necessities '] = fill_missing_values(df, 'Monthly_Other Necessities ', method='median') 
    df['Monthly_Taxes'] = fill_missing_values(df, 'Monthly_Taxes', method='median') 
    df['Monthly_Total'] = fill_missing_values(df, 'Monthly_Total', method='median') 
    df['Monthly_Transportation'] = fill_missing_values(df, 'Monthly_Transportation', method='median') 
    df['Access to Exercise Opportunities'] = fill_missing_values(df, 'Access to Exercise Opportunities', method='median')
    df['Food Environment Index'] = fill_missing_values(df, 'Food Environment Index', method='median')
    df['Primary Care Physicians'] = fill_missing_values(df, 'Primary Care Physicians', method='mean')
    df['Air Pollution: Particulate Matter'] = fill_missing_values(df, 'Air Pollution: Particulate Matter', method='median')
    df['Broadband Access'] = fill_missing_values(df, 'Broadband Access', method='median')
    df['Life Expectancy'] = fill_missing_values(df, 'Life Expectancy', method='mean')
    df['Traffic Volume'] = fill_missing_values(df, 'Traffic Volume', method='median')
    df['Homeownership'] = fill_missing_values(df, 'Homeownership', method='median')
    df['Access to Parks'] = fill_missing_values(df, 'Access to Parks', method='median')
    df['Average Temperature F'] = fill_missing_values(df, 'Average Temperature F', method='mean')
    df['Maximum Temperature F'] = fill_missing_values(df, 'Maximum Temperature F', method='mean')
    df['Minimum Temperature F'] = fill_missing_values(df, 'Minimum Temperature F', method='mean')
    df['Precipitation_inches'] = fill_missing_values(df, 'Precipitation_inches', method='median')
    df['median_sale_price'] = fill_missing_values(df, 'median_sale_price', method='median')
    df['median_list_price'] = fill_missing_values(df, 'median_list_price', method='median')
    df['median_ppsf'] = fill_missing_values(df, 'median_ppsf', method='median')
    df['homes_sold'] = fill_missing_values(df, 'homes_sold', method='median')
    df['new_listings'] = fill_missing_values(df, 'new_listings', method='median')
    df['inventory'] = fill_missing_values(df, 'inventory', method='median')
    df['months_of_supply'] = fill_missing_values(df, 'months_of_supply', method='median')
    df['median_dom_months'] = fill_missing_values(df, 'median_dom_months', method='median')
    df['Unemployment_Rate'] = fill_missing_values(df, 'Unemployment_Rate', method='median')
    df['crime_rate_per_100000'] = fill_missing_values(df, 'crime_rate_per_100000', method='median')

    #If NAs were dropped values before and after
    before_drop = df['STATE'].value_counts().sort_index()
    df_cleaned = df.dropna()
    after_drop = df_cleaned['STATE'].value_counts().sort_index()
    state_counts = pd.DataFrame({
        'before_dropna': before_drop,
        'after_dropna': after_drop
    }).fillna(0).astype(int)

    print(state_counts)
    
    # Rows with NAs for some columns
    rows_with_na = df[df.isnull().any(axis=1)].copy()
    # Compute min-max of each variable in data - dynamic based on user input of state and family size
    
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
    # Exports ranked data to excel 
    df.to_excel(os.path.join(script_dir, "gold/final_data_rank.xlsx"))

    # Filter by state if provided
    state = user_input.get('state', '').strip()

    # Only apply the filter if a valid state is entered and matches data
    if state:
        filtered_df = df[df['STATE'].str.upper() == state.upper()].copy()
        if not filtered_df.empty:
            df = filtered_df
    # Remove these from user input as we have filtered by state and family
    # Keep only the feature that will be used to rank the county
    excluded_keys = ['state', 'num_adults', 'num_children', 'RISK_RATNG', 'RESL_RATNG']

    cleaned_input = {
        k: v for k, v in user_input.items()
        if pd.notna(v) and v != '' and k not in excluded_keys
    }
    features = list(cleaned_input.keys()) 
    
    # RANKING LOGIC

    # -1: Lower the better
    # 1: Higher the better
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

    if features:
    # Drop rows if any of the features are 0    
        df = df.copy()
        required_features = ['Life Expectancy', 'Homeownership', 'POPULATION', 'Average Temperature F', 'Maximum Temperature F',
                             'Minimum Temperature F', 'median_sale_price', 'median_list_price', 'median_ppsf', 'Monthly_Housing',
                             'Monthly_Food', 'Monthly_Transportation', 'Monthly_Healthcare', 'Monthly_Other Necessities ', 
                             'Monthly_Childcare', 'Monthly_Taxes', 'Monthly_Total'] 
        df = df[(df[required_features] != 0).all(axis=1)]
    # Normalize numeric features
        scaler = MinMaxScaler()
        df[features] = scaler.fit_transform(df[features])
        user_input_normalized = {}
        for i, col in enumerate(features):
            col_min = scaler.data_min_[i]
            col_max = scaler.data_max_[i]
            user_val = user_input[col]
            user_val = float(user_val)
            user_input_normalized[col] = (user_val - col_min) / (col_max - col_min)

        # Compute directional similarity scores
        for col in features:
            score = 1 - abs(df[col] - user_input_normalized[col])
            if direction.get(col, 1) == -1:
                score = 1 - score  # reverse if lower is better
            df[col + '_score'] = score

        # Weight by variance
        score_cols = [f + '_score' for f in features]
        variances = df[score_cols].var()
        total_var = variances.sum()
        weights = {col: variances[col + '_score'] / total_var for col in features}
        df['ranking_score'] = sum(df[col + '_score'] * weights[col] for col in features)
    else:
        # Fallback to equal weight on all numeric columns (with direction)
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        excluded = ['rank', 'ranking_score']
        fallback_features = [col for col in numeric_cols if col not in excluded]

        scaler = MinMaxScaler()
        df[fallback_features] = scaler.fit_transform(df[fallback_features])

        for col in fallback_features:
            if direction.get(col, 1) == -1:
                df[col] = 1 - df[col]

        variances = df[fallback_features].var()
        total_var = variances.sum()
        weights = {col: variances[col] / total_var for col in fallback_features}

        df['ranking_score'] = sum(df[col] * weights[col] for col in fallback_features)

    # Step 4: Add categorical scoring
    user_ratings = {
        k: v for k, v in user_input.items() if k in ['RISK_RATNG', 'RESL_RATNG']}
    
    for col, user_pref in user_ratings.items():
        if col in df.columns:
            user_val = rating_order.get(user_pref.upper(), 3)
            df[col + '_score'] = df[col].map(lambda x: 1 - abs(rating_order.get(str(x).upper(), 3) - user_val) / 4)

    # Step 5: Combine all scores
    cat_score_cols = [col + '_score' for col in user_ratings if col in df.columns]
    base_score_cols = [f + '_score' for f in features] if features else fallback_features
    all_score_cols = [col for col in base_score_cols if col in df.columns] + cat_score_cols

    df['ranking_score'] = df[all_score_cols].mean(axis=1)
    df['rank'] = df['ranking_score'].rank(ascending=False, method='dense')
   
    # Exports ranked data to excel 
    # df.to_excel('./gold/final_data_rank.xlsx')
    # print()
    df.to_excel(os.path.join(script_dir, "gold/final_data_rank.xlsx"))

    # Find the county that ranked no.1
    county_list = df[df['rank'] <= 10][['STATE','COUNTY', 'rank']].sort_values(by='rank').reset_index(drop=True)
    
    #Display the county/counties
    return county_list

# Example
user_input = {
    'state':'',
    'num_adults': '',
    'num_children': '',
    'RISK_VALUE':'',
    'RISK_SCORE':'',
    'RISK_SPCTL':'',
    'RISK_RATNG':'',
    'RESL_VALUE':'',
    'RESL_SCORE':'',
    'RESL_SPCTL':'',
    'RESL_RATNG':'',
    'Monthly_Childcare':'',
    'Monthly_Food':'1000', 
    'Monthly_Healthcare':'',
    'Monthly_Housing':'2000',
    'Monthly_Other Necessities ' :'',
    'Monthly_Taxes':'',
    'Monthly_Total':'',
    'Monthly_Transportation':'', 
    'Access to Exercise Opportunities':'',
    'Food Environment Index':'',
    'Primary Care Physicians':'',
    'Air Pollution: Particulate Matter':'',
    'Broadband Access':'',
    'Life Expectancy':'',
    'Traffic Volume':'',
    'Homeownership':'',
    'Access to Parks':'',
    'Average Temperature F':'',
    'Maximum Temperature F':'',
    'Minimum Temperature F':'',
    'Precipitation_inches':'',
    'median_sale_price':'300000',
    'median_list_price':'',
    'median_ppsf':'',
    'homes_sold':'',
    'new_listings':'',
    'inventory':'',
    'months_of_supply':'',
    'median_dom_months':'',
    'Unemployment_Rate':'',
    'crime_rate_per_100000':''
}


# result_within_state = compute_ranking(static_merged_data, cost_of_living_data, user_input)

# print(result_within_state)
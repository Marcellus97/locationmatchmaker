import pandas as pd
import openpyxl
import os
import re

# IMPORT DATA

script_dir = os.path.dirname(os.path.abspath(__file__))

nri = pd.read_csv(os.path.join(script_dir,"bronze/NRI_Table_Counties/NRI_Table_Counties.csv"))
chr = pd.read_csv(os.path.join(script_dir,"bronze/analytic_data2025.csv"), low_memory=False, header = 1)
walkability = pd.read_csv(os.path.join(script_dir,"bronze/walkability.csv"))
al_avg_temp = pd.read_csv(os.path.join(script_dir,"bronze/al_avgtemp.csv"),  header = 4)
al_max_temp = pd.read_csv(os.path.join(script_dir,"bronze/al_maxtemp.csv"),  header = 4)
al_min_temp = pd.read_csv(os.path.join(script_dir,"bronze/al_mintemp.csv"),  header = 4)
al_precipitation = pd.read_csv(os.path.join(script_dir,"bronze/al_precipitation.csv"),  header = 4)
avg_temp = pd.read_csv(os.path.join(script_dir,"bronze/avg_temp.csv"),  header = 4)
fbc = pd.read_excel(os.path.join(script_dir,"bronze/fbc_data_2025.xlsx"), sheet_name="County", header = 1)
max_temp = pd.read_csv(os.path.join(script_dir,"bronze/max_temp.csv"),  header = 4)
min_temp = pd.read_csv(os.path.join(script_dir,"bronze/min_temp.csv"),  header = 4)
precipitation = pd.read_csv(os.path.join(script_dir,"bronze/precipitation.csv"),  header = 4)
unemployment_data = pd.read_excel(os.path.join(script_dir,"bronze/unemployment_rate_usa.xlsx"))
crime = pd.read_csv(os.path.join(script_dir,"bronze/crime_data_w_population_and_crime_rate.csv"))
county_market = pd.read_csv(os.path.join(script_dir,"bronze/county_market_tracker.tsv000"), sep='\t', low_memory=True)
fipscode = pd.read_excel(os.path.join(script_dir,"bronze/fipscode.xlsx"))

# FIPSCODE
fipscode['fipscode'] = fipscode['fipscode'].astype(str).str.zfill(5)
fipscode['County'] = fipscode['County'].str.replace(' County', '', regex=True).str.strip()
fipscode = fipscode[fipscode['State'] != fipscode['County']]
fipscode = fipscode.rename(columns={'State': 'STATE','County': 'COUNTY'})

# HAZARD DATA
nri = nri[nri["COUNTYTYPE"] != "City"]
hazard_data = nri[["STATE", "STATEABBRV", "COUNTY", "POPULATION", "RISK_VALUE",	"RISK_SCORE", "RISK_RATNG", "RISK_SPCTL", "RESL_VALUE", "RESL_SCORE", "RESL_RATNG", "RESL_SPCTL"]]

# HEALTH DATA
state_names = [
    'ALABAMA', 'ALASKA', 'ARIZONA', 'ARKANSAS', 'CALIFORNIA', 'COLORADO', 'CONNECTICUT', 'DISTRICT OF COLUMBIA','DELAWARE',
    'FLORIDA', 'GEORGIA', 'HAWAII', 'IDAHO', 'ILLINOIS', 'INDIANA', 'IOWA', 'KANSAS', 'KENTUCKY',
    'LOUISIANA', 'MAINE', 'MARYLAND', 'MASSACHUSETTS', 'MICHIGAN', 'MINNESOTA', 'MISSISSIPPI',
    'MISSOURI', 'MONTANA', 'NEBRASKA', 'NEVADA', 'NEW HAMPSHIRE', 'NEW JERSEY', 'NEW MEXICO',
    'NEW YORK', 'NORTH CAROLINA', 'NORTH DAKOTA', 'OHIO', 'OKLAHOMA', 'OREGON', 'PENNSYLVANIA',
    'RHODE ISLAND', 'SOUTH CAROLINA', 'SOUTH DAKOTA', 'TENNESSEE', 'TEXAS', 'UTAH', 'VERMONT',
    'VIRGINIA', 'WASHINGTON', 'WEST VIRGINIA', 'WISCONSIN', 'WYOMING'
]

health = chr[["state", "county", "fipscode", "v132_rawvalue", "v133_rawvalue", "v004_rawvalue", 
              "v125_rawvalue", "v166_rawvalue", "v147_rawvalue", "v156_rawvalue",
              "v153_rawvalue", "v179_rawvalue"]]
health = health.rename(columns = {"state":"STATEABBRV",
                                  "county":"COUNTY",
                                  "v132_rawvalue": "Access to Exercise Opportunities", 
                                  "v133_rawvalue": "Food Environment Index",
                                  "v004_rawvalue": "Primary Care Physicians",
                                  "v125_rawvalue": "Air Pollution: Particulate Matter",
                                  "v166_rawvalue": "Broadband Access",
                                  "v147_rawvalue": "Life Expectancy",
                                  "v156_rawvalue": "Traffic Volume",
                                  "v153_rawvalue": "Homeownership",
                                  "v179_rawvalue": "Access to Parks"
                                  })
health['COUNTY'] = health['COUNTY'].str.replace(' County', '', regex=True).str.strip()

health['COUNTY'] = health['COUNTY'].str.upper().str.strip()
health = health[~health['COUNTY'].isin(state_names)]

health = health[~health['COUNTY'].str.contains('city', case=False, na=False)]
health['fipscode'] = health['fipscode'].astype(str).str.zfill(5)

# WALKABILITY
walkability = walkability[["STATEFP", "COUNTYFP", "NatWalkInd"]]
walkability = walkability[walkability['STATEFP'].astype(int) < 57]
walkability['fipscode'] = walkability['STATEFP'].astype(str).str.zfill(2) + walkability['COUNTYFP'].astype(str).str.zfill(3)
walkability = walkability.drop(columns = ["STATEFP", "COUNTYFP"])
walkability = walkability.groupby('fipscode').mean(numeric_only=True).reset_index()


# AVERAGE TEMPERATURE DATA
avg_temp = pd.concat([avg_temp, al_avg_temp], ignore_index=True)
avg_temp = avg_temp[["Name", "State", "Value"]]
avg_temp = avg_temp.rename(columns = {"State":"STATE",
                                  "Name":"COUNTY",
                                  "Value": "Average Temperature F"})
avg_temp['COUNTY'] = avg_temp['COUNTY'].str.replace(' County', '', regex=True).str.strip()
avg_temp = avg_temp[~avg_temp['COUNTY'].str.contains('city', case=False, na=False)]

# COST OF LIVING DATA
cost_of_living_data = fbc.iloc[:, [1]+[3]+[4]+list(range(5, 13))]
cost_of_living_data.columns = [f"Monthly_{col}" if i in range(3, 11) else col for i, col in enumerate(cost_of_living_data.columns)]
cost_of_living_data = cost_of_living_data.rename(columns = {"State abv.":"STATEABBRV",
                                                            "County":"COUNTY"})
cost_of_living_data['COUNTY'] = cost_of_living_data['COUNTY'].str.replace(' County', '', regex=True).str.strip()
cost_of_living_data = cost_of_living_data[~cost_of_living_data['COUNTY'].str.contains('city', case=False, na=False)]

# MAXIMUM TEMPERATURE
max_temp = pd.concat([max_temp, al_max_temp], ignore_index=True)
max_temp = max_temp[["Name", "State", "Value"]]
max_temp = max_temp.rename(columns = {"State":"STATE",
                                  "Name":"COUNTY",
                                  "Value": "Maximum Temperature F"})
max_temp['COUNTY'] = max_temp['COUNTY'].str.replace(' County', '', regex=True).str.strip()
max_temp = max_temp[~max_temp['COUNTY'].str.contains('city', case=False, na=False)]

# MINIMUM TEMPERATURE
min_temp = pd.concat([min_temp, al_min_temp], ignore_index=True)
min_temp = min_temp[["Name", "State", "Value"]]
min_temp = min_temp.rename(columns = {"State":"STATE",
                                  "Name":"COUNTY",
                                  "Value": "Minimum Temperature F"})
min_temp['COUNTY'] = min_temp['COUNTY'].str.replace(' County', '', regex=True).str.strip()
min_temp = min_temp[~min_temp['COUNTY'].str.contains('city', case=False, na=False)]

# PRECIPITATION
precipitation = pd.concat([precipitation, al_precipitation], ignore_index=True)
precipitation = precipitation[["Name", "State", "Value"]]
precipitation = precipitation.rename(columns = {"State":"STATE",
                                  "Name":"COUNTY",
                                  "Value": "Precipitation_inches"})
precipitation['COUNTY'] = precipitation['COUNTY'].str.replace(' County', '', regex=True).str.strip()
precipitation = precipitation[~precipitation['COUNTY'].str.contains('city', case=False, na=False)]

# UNEMPLOYMENT
unemployment_data = unemployment_data[["County", "State", "Unemployment_Rate"]]
unemployment_data = unemployment_data.rename(columns={'State': 'STATEABBRV',
                                                      'County': 'COUNTY'})
unemployment_data = unemployment_data[~unemployment_data['COUNTY'].str.contains('city', case=False, na=False)]

# CRIME
crime = crime[["county_name", "crime_rate_per_100000"]]
crime[["COUNTY", "STATEABBRV"]] = crime["county_name"].str.split(', ', expand=True)
crime['COUNTY'] = crime['COUNTY'].str.replace(' County', '', regex=True).str.strip()
crime['STATEABBRV'] = crime['STATEABBRV'].str.strip()
crime = crime.drop(columns = ["county_name"])
crime = crime[~crime['COUNTY'].str.contains('city', case=False, na=False)]

# COUNTY HOUSING MARKET
county_market = county_market[["period_begin", "region", "state", "state_code", "property_type", 
                               "median_sale_price", "median_list_price", "median_ppsf", "homes_sold", "new_listings", 
                               "inventory", "months_of_supply", "median_dom"]]
county_market = county_market[(county_market['property_type'] == 'All Residential')&
                                             (county_market['period_begin'] >= '2024-01-01') &
                                              (county_market['period_begin'] <= '2024-12-01')]
county_market[["COUNTY", "STATEABBRV"]] = county_market["region"].str.split(', ', expand=True)
county_market['COUNTY'] = county_market['COUNTY'].str.replace(' County', '', regex=True).str.strip()
county_market['STATEABBRV'] = county_market['STATEABBRV'].str.strip()
county_market = county_market.drop(columns = ["region", "state_code", "period_begin"])
county_market = county_market.groupby(['COUNTY', 'state', 'STATEABBRV']).agg({
    'median_sale_price': 'mean',
    'median_list_price': 'mean',
    'median_ppsf': 'mean',
    'homes_sold': 'sum',
    'new_listings': 'sum',
    'inventory': 'sum',
    'months_of_supply': 'mean',
    'median_dom': 'mean'
}).reset_index()
county_market[['median_dom_months']] = (county_market[['median_dom']]/30).round(2)
county_market = county_market.drop(columns='median_dom')
county_market[['median_ppsf']] = county_market[['median_ppsf']].round(2)
county_market[["median_sale_price", "median_list_price", "homes_sold", "new_listings", "inventory", "months_of_supply"]] = county_market[["median_sale_price", "median_list_price", "homes_sold", "new_listings", "inventory", "months_of_supply"]].round(0)
county_market = county_market.rename(columns = {"state":"STATE"})
county_market = county_market[~county_market['COUNTY'].str.contains('city', case=False, na=False)]

# JOIN ALL DATASETS
# List of all DataFrames
dfs = [hazard_data, health, fipscode, walkability, avg_temp, max_temp, min_temp, precipitation,cost_of_living_data,unemployment_data, crime, county_market]

state_abbrev_dict = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DC":"District of Columbia", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming"
}

# STANDARDIZE - Fill in State and State Abbrevation given it is present in one of the columns
def standardize_columns(df):
    # If 'state' column exists but 'stateabbrev' does not, create 'stateabbrev' from 'state'
    if 'STATE' in df.columns and 'STATEABBRV' not in df.columns:
        state_dict_reverse = {v: k for k, v in state_abbrev_dict.items()} 
        df['STATEABBRV'] = df['STATE'].map(state_dict_reverse)    
    # If 'stateabbrev' exists but 'state' does not, use the dictionary to map state abbreviation to state name
    if 'STATEABBRV' in df.columns and 'STATE' not in df.columns:
        df['STATE'] = df['STATEABBRV'].map(state_abbrev_dict)
    return df

# Apply the standardization function to each DataFrame
dfs = [standardize_columns(df) for df in dfs]
for i in range(len(dfs)):
    df = dfs[i]
    if 'COUNTY' in df.columns:
        df['COUNTY_Name'] = df['COUNTY']
    dfs[i] = df
# STANDARDIZE - Convert all values to uppercase 
for i in range(len(dfs)):
    df = dfs[i]
    if 'COUNTY' in df.columns:
        df.loc[:, 'COUNTY'] = df['COUNTY'].str.upper()
    if 'STATE' in df.columns:
        df.loc[:, 'STATE'] = df['STATE'].str.upper()
    if 'STATEABBRV' in df.columns:
        df.loc[:, 'STATEABBRV'] = df['STATEABBRV'].str.upper()

# STANDARDIZE - Keep only name of the county
remove_terms = ['parish', 'borough', 'city', '/city', 'and', 'census area', '/town', "/TOWN", 'planning region', 'municipality', "/"]

# Regular expression pattern to match any of those terms 
pattern = re.compile(r'\b(?:' + '|'.join(remove_terms) + r')\b', re.IGNORECASE)

# Function to clean county names
def clean_county_names(df):
    if 'COUNTY' in df.columns:
        # Clean the county column by removing the terms and trimming spaces
        df.loc[:, 'COUNTY'] = df['COUNTY'].str.replace(pattern, '', regex=True).str.strip()
        # Further clean any exra spaces, numbers or special characters that may remain after removal
        df.loc[:, 'COUNTY'] = (
            df['COUNTY']
            .str.upper()
            .str.replace(r'[^A-Z]', '', regex=True)  # removes anything not A-Z
        )
    return df

# Apply the cleaning function to each DataFrame
dfs = [clean_county_names(df) for df in dfs]

fipscode.loc[:, 'COUNTY'] = fipscode['COUNTY'].str.replace(pattern, '', regex=True).str.strip()
fipscode.loc[:, 'COUNTY'] = (fipscode['COUNTY'].str.upper().str.replace(r'[^A-Z]', '', regex=True))
fipscode_data = pd.merge(fipscode, walkability, on=["fipscode"], how="left")
fipscode_data = pd.merge(fipscode_data, health, on=["fipscode", "STATE", "STATEABBRV", "COUNTY"], how="outer", suffixes=('', '_right'))
fipscode_data['COUNTY_Name'] = fipscode_data['COUNTY_Name'].fillna(fipscode_data['COUNTY_Name_right'])
fipscode_data.drop(columns=['COUNTY_Name_right'], inplace=True)

# MERGE - Merge all datasets, remove duplicates and any rows where the STATE is not in the state_names list
merged = pd.merge(fipscode_data, hazard_data, on=["STATE","STATEABBRV", "COUNTY"], how="outer", suffixes=('', '_right'))
merged['COUNTY_Name'] = merged['COUNTY_Name'].fillna(merged['COUNTY_Name_right'])
merged.drop(columns=['COUNTY_Name_right'], inplace=True)
merged = pd.merge(merged, avg_temp, on=["STATE","STATEABBRV", "COUNTY"], how="outer", suffixes=('', '_right'))
merged['COUNTY_Name'] = merged['COUNTY_Name'].fillna(merged['COUNTY_Name_right'])
merged.drop(columns=['COUNTY_Name_right'], inplace=True)
merged = pd.merge(merged, max_temp, on=["STATE","STATEABBRV", "COUNTY"], how="outer", suffixes=('', '_right'))
merged['COUNTY_Name'] = merged['COUNTY_Name'].fillna(merged['COUNTY_Name_right'])
merged.drop(columns=['COUNTY_Name_right'], inplace=True)
merged = pd.merge(merged, min_temp, on=["STATE","STATEABBRV", "COUNTY"], how="outer", suffixes=('', '_right'))
merged['COUNTY_Name'] = merged['COUNTY_Name'].fillna(merged['COUNTY_Name_right'])
merged.drop(columns=['COUNTY_Name_right'], inplace=True)
merged = pd.merge(merged, precipitation, on=["STATE","STATEABBRV", "COUNTY"], how="outer", suffixes=('', '_right'))
merged['COUNTY_Name'] = merged['COUNTY_Name'].fillna(merged['COUNTY_Name_right'])
merged.drop(columns=['COUNTY_Name_right'], inplace=True)
merged = pd.merge(merged, county_market, on=["STATE","STATEABBRV", "COUNTY"], how="outer", suffixes=('', '_right'))
merged['COUNTY_Name'] = merged['COUNTY_Name'].fillna(merged['COUNTY_Name_right'])
merged.drop(columns=['COUNTY_Name_right'], inplace=True)
merged = pd.merge(merged, unemployment_data, on=["STATE","STATEABBRV", "COUNTY"], how="outer", suffixes=('', '_right'))
merged['COUNTY_Name'] = merged['COUNTY_Name'].fillna(merged['COUNTY_Name_right'])
merged.drop(columns=['COUNTY_Name_right'], inplace=True)
merged = pd.merge(merged, crime, on=["STATE","STATEABBRV", "COUNTY"], how="outer", suffixes=('', '_right'))
merged['COUNTY_Name'] = merged['COUNTY_Name'].fillna(merged['COUNTY_Name_right'])
merged.drop(columns=['COUNTY_Name_right'], inplace=True)
merged['COUNTY_Name'] = merged['COUNTY_Name'].str.upper()

# Combine elemen-wise when State is DC
DC_rows = merged[merged['STATE'] == 'DISTRICT OF COLUMBIA']
row1 = DC_rows.iloc[0].tolist()
row2 = DC_rows.iloc[1].tolist()
combined = [a if not pd.isna(a) else b for a, b in zip(row1, row2)]
merged.loc[(merged['STATE'] == 'DISTRICT OF COLUMBIA') & (merged['COUNTY'] == 'DISTRICTOFCOLUMBIA')] = combined
merged = merged[~((merged['STATE'] == 'DISTRICT OF COLUMBIA') & (merged['COUNTY'] == 'WASHINGTON'))].reset_index(drop=True)

# Ensure County is DONA ANA
merged.loc[merged['COUNTY'] == 'DOAANA', 'COUNTY'] = 'DONAANA'
merged.loc[merged['COUNTY'] == 'DONAANA', 'COUNTY_Name'] = 'DONA ANA'

# Fill in fipscode where its blank
fips_lookup_df = pd.DataFrame({
    'STATEABBRV': ['AK', 'AR', 'DC', 'HI', 'ID', 'IA', 'MA', 'NM', 'NY', 'OK','UT'],
    'COUNTY': ['WRANGELL', 'ARKANSAS', 'DISTRICTOFCOLUMBIA', 'HAWAII', 'IDAHO',	'IOWA',	'NANTUCKETTOWN', 'DONAANA', 'NEWYORK', 'OKLAHOMA', 'UTAH'],
    'fipscode': ['02280', '05000', '11001', '15000', '16000', '19000', '25019', '35013', '36000', '40000', '49000']
})
merged = merged.merge(
    fips_lookup_df[['STATEABBRV', 'COUNTY', 'fipscode']],
    on=['STATEABBRV', 'COUNTY'],
    how='left',
    suffixes=('', '_ref')
)

merged['fipscode'] = merged['fipscode'].fillna(merged['fipscode_ref'])
merged = merged.drop(columns=['fipscode_ref'])

merged = merged.drop_duplicates()
merged = merged[merged['STATE'].isin(state_names)]

# EXPORT TO EXCEL
merged.to_excel(os.path.join(script_dir,"silver/merged_data.xlsx"), index=False)
cost_of_living_data.to_excel(os.path.join(script_dir,"silver/cost_of_living_data.xlsx"), index=False)

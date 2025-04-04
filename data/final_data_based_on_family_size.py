import pandas as pd
cost_of_living_data = pd.read_excel("cost_of_living_data.xlsx")
merged_data = pd.read_excel("merged_data.xlsx")

def merge_expenses_by_family_size(static_merged_data, cost_of_living_data, num_adults, num_children):
    family_size = f"{num_adults}p{num_children}c"
    cost_of_living_data = cost_of_living_data[cost_of_living_data['Family'] == family_size]

    if cost_of_living_data.empty:
        print(f"No cost_of_living data found for family size {family_size}.")
        return static_merged_data  
    
    merged_df = pd.merge(static_merged_data, cost_of_living_data, on=["STATE","STATEABBRV", "COUNTY"], how='outer')
    
    return merged_df

#Example Input - Should change based on the user's family size
num_adults = 2
num_children = 1

final_dataset = merge_expenses_by_family_size(merged_data, cost_of_living_data, num_adults, num_children)

print(final_dataset)
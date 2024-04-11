import sys
import pandas as pd
import geopandas as gpd

def geodf_describe(gdf):
    print("Size: " + str(sys.getsizeof(gdf)/1024/1024)  + " MB")
    for column in gdf.columns:
        unique_values = gdf[column].unique()
        if len(unique_values) < 50:
            print(f'{column}:')
            print(unique_values)
    print(gdf.describe())

def geodfs_print_summary(gdf, feature, value):
    for year in gdf:
        sum_values, total_sum = geodf_summary(gdf[year], feature, value)
        print(f"Year: {year}")
        print("Sum values:\n", sum_values)
        print("Total sum:\n", total_sum)
        print("\n")

def geodf_summary(gdf, feature, value):
    sum_values = gdf.groupby(feature)[value].sum()
    sum_values = sum_values.sort_values(ascending=False)
    total_sum = gdf[value].sum()

    sum_values = sum_values.map('{:,.2f}'.format)
    total_sum = '{:,.2f}'.format(total_sum)

    return sum_values, total_sum

def geodfs_to_csv(gdfs, output_path, feature, value):
    csv = pd.DataFrame()

    for year in gdfs:
        for feature_value in gdfs[year][feature].unique():
            csv.loc[feature_value, year] = gdfs[year][gdfs[year][feature] == feature_value][value].sum()

    csv.index.name = feature
    csv.to_csv(output_path)
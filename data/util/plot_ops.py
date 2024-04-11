import matplotlib.pyplot as plt
import matplotlib.ticker as ticker
import ipywidgets as widgets

def plot_gdf_over_time(gdf, feature, value):
    unique_feature = list(set(val for df in gdf.values() for val in df[feature].unique()))
    features_selectmultiple = widgets.SelectMultiple(options=unique_feature)
    widgets.interact(plot_feature_values, gdf=widgets.fixed(gdf), start_year=widgets.fixed(2012), end_year=widgets.fixed(2022), ift_ioa_values=features_selectmultiple, value=value)

def plot_feature_values(gdf, start_year, end_year, feature_selector, value):
    years = list(range(start_year, end_year+1))

    fig, ax = plt.subplots(figsize=(10, 6))

    stats = {}
    for feature in feature_selector:
        sum_values = [gdf[year][gdf[year][feature]][value].sum() for year in years]
        ax.fill_between(years, sum_values, label=feature, alpha=0.5)
        stats[feature] = sum_values[-1]

    stats = {k: v for k, v in sorted(stats.items(), key=lambda item: item[1], reverse=True)}
    stats_text = f"Stats for {end_year}:\n"
    total_sum = 0
    for feature, sum_value in stats.items():
        stats_text += f"{feature}: {sum_value:,.2f} ha\n"
        total_sum += sum_value
    stats_text += f"\nTotal: {total_sum:,.2f} ha"

    ax.set_xlabel('Year')
    ax.set_ylabel('Hectare (HA)')
    ax.set_title('Woodland Types 2012 - 2022, NFI UK')
    ax.yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, pos: '{:,.2f}'.format(x)))
    ax.text(1.02, 1, stats_text, transform=ax.transAxes, verticalalignment='top')
    ax.legend()
    plt.show()

def plot_df(df, selected_features, feature_type, attribution):
    plt.figure(figsize=(10, 6))

    for i, row in df[df[f'type_{feature_type}'].isin(selected_features)].iterrows():
        plt.plot(df.columns[1:], row.values[1:], label=row[f'type_{feature_type}'])

    plt.xlabel('Year')
    plt.ylabel('Value')
    plt.title('Value over time')
    plt.legend()

    plt.text(1, -0.13, attribution, ha='right', va='center', wrap=True, transform=plt.gca().transAxes)

    # Format y-axis values
    plt.gca().yaxis.set_major_formatter(ticker.FuncFormatter(lambda x, pos: '{:,.2f}'.format(x)))

    plt.show()

def plot_df_over_time(df, feature_type, attribution):
    # Create a multiselect widget for the features
    features = df[f'type_{feature_type}'].unique()
    selected_features = widgets.SelectMultiple(
        options=features,
        value=list(features),
        description='Features',
        disabled=False
    )

    # Use widgets.interact to automatically update the plot when the selected features change
    widgets.interact(plot_df, df=widgets.fixed(df), selected_features=selected_features, feature_type=widgets.fixed(feature_type), attribution=widgets.fixed(attribution))
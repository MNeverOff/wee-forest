import os
import multiprocessing as mp
import glob
import geopandas as gpd
import pandas as pd
import inspect

from concurrent.futures import ProcessPoolExecutor

gpd.options.io_engine = 'pyogrio'

def read_gjson_concurrent(file_pattern, num_workers):
    files = glob.glob(file_pattern)

    with ProcessPoolExecutor(max_workers=num_workers, mp_context=mp.get_context('fork')) as executor:
        gdf = list(executor.map(gpd.read_file, files))

    return pd.concat(gdf, ignore_index=True)

def convert_shp_to_gjson(input_path, output_path=None):
    gdf = gpd.read_file(input_path)

    if output_path is None:
        root, _ = os.path.splitext(input_path)
        output_path = root + '.geojson'

    # Write the GeoJSON file
    gdf.to_file(output_path, driver='GeoJSON')

def write_gjson_split(input, max_features=10000, output_dir=None):
    if isinstance(input, str):
        gdf = gpd.read_file(input)
        root = os.path.dirname(input)
        filename = os.path.splitext(os.path.basename(input))[0]
        output_dir = output_dir or os.path.join(root, f'{filename}.partial')
    elif isinstance(input, gpd.GeoDataFrame):
        gdf = input
        root = os.getcwd()  # Use the current working directory as the root
        output_dir = output_dir or root

        frame = inspect.currentframe()
        varname = None
        for name, var in frame.f_back.f_locals.items():
            if var is input:
                varname = name
                break
        filename = varname if varname else 'output'  # Use the variable name as the filename, or 'output' if the variable name could not be found
    else:
        raise ValueError('input must be a file path or a GeoDataFrame')

    os.makedirs(output_dir, exist_ok=True)

    for i in range(0, len(gdf), max_features):
        gdf_part = gdf.iloc[i:i+max_features]
        gdf_part.to_file(os.path.join(output_dir, f'{filename}_part{i//max_features}.geojson'), driver='GeoJSON')

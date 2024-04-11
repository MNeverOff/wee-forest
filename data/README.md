# WeeForest Lens - Data Analysis

## Overview

Most data analysis within this project is done using Python and Jupyter Notebooks. Geopandas is the main tool of choice and I have been rather liberal with load order for convenience, therefore some notebooks can easily consume 30-40GB of RAM at any given moment. You might want to consider modifying them to run sequentially, year by year, or loading up files from parquet on disk directly.

Main workflows are:

- AWI Dataset preparation and analysis, consisting of three AWI datasets and the NWSS dataset.
- NFI Dataset preparation and analysis for aggregation and overlay with AWI.
- NFI x AWI Overlay calculation and dataset generation as well as the overlap error identification & handling.
- Area Calculation dataset generation for each year and dataset, reduced to a point to step away from geospatial bounding box calculations.
- MBTiles generation from temporary GeoJSON files for the Lens map.

There's also the [sandbox](./sandbox/) folder that contains various experiments, i.e. In-notebook flask server for area calculation, duckdb vs postgis benchmarks, statistical data and much more.

If you're interested in detailed rationale and justification for particular data source choices, aggregation methods and assumptions, please refer to the [Research](../research/README.md) section as well as relevant notebooks. Any notebook-related research and methodology would usually be contained within the notebook itself in the Markdown cells.

## Running the Notebooks

All three main notebooks contain Markdown cells with detailed instructions on running them, as well as justifications for certain approaches and expected runtimes.

In order to be able to run Lens you must finish running five main notebooks in order: [uk_gb_awi.ipynb](./uk_gb_awi.ipynb), [uk_gb_nfi.ipynb](./uk_gb_nfi.ipynb), [uk_gb_nfi_awi_overlay](./uk_gb_nfi_awi_overlay.ipynb), [uk_gb_area.ipynb](./uk_gb_area.ipynb) and finally [uk_gb_tiles.ipynb](./uk_gb_tiles.ipynb).

Once ran to completion you'll end up with 23 .mbtiles files in the `../data/tiles` folder, 23 parquet files in the `../data/area` folder totalling 5GB in size and 23 more point-based parquet files for area calculation totalling 400MB.

## Main Sources

This work presently utilises two main resources and their derivatives:

- National Forest Inventory (NFI) datasets, 2012 - 2021
- Ancient Woodland Inventory (AWI) datasets, particularly:
  - [Ancient Woodland Inventory for England](https://www.data.gov.uk/dataset/9461f463-c363-4309-ae77-fdcd7e9df7d3/ancient-woodland-england), 2023, [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). [Methodology](https://publications.naturalengland.org.uk/publication/4876500800634880).
  - [Ancient Woodland Inventory for Wales](https://www.data.gov.uk/dataset/1db7cbc0-2eef-4c3b-85be-73c7b87d4c87/ancient-woodland-inventory), 2023, [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). [Methodology](https://naturalresources.wales/guidance-and-advice/environmental-topics/woodlands-and-forests/identifying-ancient-woodlands/?lang=en).
  - [Native Woodland Survey of Scotland (NWSS)](https://www.data.gov.uk/dataset/da3f8548-a130-4a0d-8ddd-45019adcf1f3/native-woodland-survey-of-scotland-nwss) - 2006-2013, [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). [Methodology](https://forestry.gov.scot/publications/74-scotland-s-native-woodlands-results-from-the-native-woodland-survey-of-scotland/viewdocument/74).
  - [Ancient Woodland Inventory for Scotland](https://www.data.gov.uk/dataset/c2f57ed9-5601-4864-af5f-a6e73e977f54/ancient-woodland-inventory-scotland), supplementary, 2023, [Open Government Licence](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/). [Methodology](https://www.nature.scot/doc/guide-understanding-scottish-ancient-woodland-inventory-awi).

## Contributing

Contributions are encouraged and welcome. The project roadmap, ideas, bugs and issues are tracked in the [Project](https://github.com/users/MNeverOff/projects/4).

Areas where help would be most appreciated:

1. MBTiles generation. Presently there are a few issues with zoom levels and feature simplification due to rather simplistic `tippecanoe` parameters used. See [the issue](https://github.com/users/MNeverOff/projects/4/views/1?pane=issue&itemId=58543688) for details.
1. Generating [satellite basemaps](https://github.com/users/MNeverOff/projects/4/views/1?pane=issue&itemId=58537632) for each of the dataset years, allowing to add contextual satellite imagery to the map.
1. Processing the NFI dataset to [add country designation](https://github.com/users/MNeverOff/projects/4/views/3?pane=issue&itemId=58913242), potentially using spatial joins to mimic the 2022 dataset structure, enabling grouping and more versatile comparison.
1. Improving the Overlay dataset generation, especially around small fringe areas that are left over when large areas are overlayed and have negligible leftover area wrapping around.
1. Improving the IO and overall data handling practices, reducing RAM usage and improving the runtime of the notebooks.
1. Help ensuring correct licensing and attribution has been provided for all the datasets used in the project, as I'm still not entirely sure I've covered all the bases.

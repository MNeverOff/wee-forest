// Calculate the value that represents the 85th percentile of the canopy height
var target_percentile = canopy_height.reduceRegion({
    reducer: ee.Reducer.percentile([90]),
    geometry: geometry,
    scale: 16,  // Change this to the scale of your image
    maxPixels: 1e15,
    bestEffort: true
}).get('b1');

// Create a mask for the areas that are above the target percentile
var high_canopy_mask = canopy_height.gt(ee.Number(target_percentile));

// Apply the mask to the canopy height image
var high_canopy_areas = canopy_height.updateMask(high_canopy_mask);

// Calculate the area of high canopy areas
var high_canopy_area = ee.Image.pixelArea().updateMask(high_canopy_areas).reduceRegion({
    reducer: ee.Reducer.sum(),
    geometry: geometry,
    scale: 15,  // Change this to the scale of your image
    maxPixels: 1e15,
    bestEffort: true
});

// Convert the area to hectares
var high_canopy_area_hectares = ee.Number(high_canopy_area.get('area')).divide(1e4);

// Print the area of high canopy height
print('Area of canopy height above target percentile (hectares):', high_canopy_area_hectares);

// Add the masked image to the map with a flat color
Map.addLayer(high_canopy_areas, {palette: ['FF0000']}, 'Canopy height above target percentile');

// Results @ 90th percentile compared to 2022
// "Area of canopy height above target percentile (hectares):"
// 80	3,911,104.25
// 81	3,911,104.25
// 82	3,911,104.25
// 83	3,289,451.47
// 84	3,289,451.47
// 85	3,289,451.47
// 86	2,754,497.01
// 87	2,754,497.01
// 88	2,295,204.11
// 89	2,295,204.11
// 90	1,900,770.35
// 91	1,900,770.35
// 92	1,560,082.37
// 93	1,560,082.37
// 94	1,263,097.24
// 95	1,002,499.18
// 96	773,169.13
// 97	574,065.17
// 98	406,423.01
// 99	173,772.70
// 100	0
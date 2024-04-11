var gfc2014 = ee.Image('UMD/hansen/global_forest_change_2015');

var treecover2000 = gfc2014.select('treecover2000');
var gainImage = gfc2014.select(['gain']);
var lossImage = gfc2014.select(['loss']);

// Add the gain and subtract the loss from the treecover2000 image
var treecover2022 = treecover2000.add(gainImage).subtract(lossImage);

// Clip the resulting image with the geometry
var gfc2022_masked = treecover2022.clip(geometry);
var gfc2014_masked = treecover2000.clip(geometry)

var visParams = {
  min: 0,
  max: 100,
  palette: ['white', 'red']
};

Map.addLayer(gfc2022_masked, visParams, 'GFC2014 Masked');

// Calculate the total area of intersection
var totalArea_22 = gfc2022_masked.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: geometry,
  scale: 15,  // Change this to the scale of your image
  maxPixels: 1e12,
  bestEffort: true
});

// Convert the total area to hectares
var totalAreaHectares_22 = ee.Number(totalArea_22.get('treecover2000')).divide(1e4);
print('Total intersect area (hectares):', totalAreaHectares_22);

// Calculate the total area of intersection
var totalArea_00 = gfc2014_masked.reduceRegion({
  reducer: ee.Reducer.sum(),
  geometry: geometry,
  scale: 15,  // Change this to the scale of your image
  maxPixels: 1e12,
  bestEffort: true
});
var totalAreaHectares_00 = ee.Number(totalArea_00.get('treecover2000')).divide(1e4);
print('Total intersect area (hectares):', totalAreaHectares_00);

// Results compared to 2022
// "Intersecting area (hectares):"
// 1,900,770.35
/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 */
function maskS2clouds(image) {
    var qa = image.select('QA60');
  
    // Bits 10 and 11 are clouds and cirrus, respectively.
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;
  
    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  
    return image.updateMask(mask).divide(10000);
  }
  
  var dataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
                    .filterDate('2020-01-01', '2020-01-30')
                    // Pre-filter to get less cloudy granules.
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
                    .map(maskS2clouds);
  
  var visualization = {
    min: 0.0,
    max: 0.3,
    bands: ['B4', 'B3', 'B2'],
  };
  
  Map.setCenter(-2, 55, 12);
  
  Map.addLayer(dataset.mean(), visualization, 'RGB');
  
// Create a date slider
var dateSlider = ui.DateSlider({
    start: '2012-01-01',
    end: '2022-12-31',
    value: '2022-01-01',
    period: 365, // Set the period for date range selection in days
    onChange: function(range) {
        var start = ee.Date(range.start()).advance(5, 'month'); // June 1st
        var end = ee.Date(range.start()).advance(8, 'month'); // August 31st
        var filteredDataset = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
            .filterDate(start, end)
            .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE',20))
            .map(maskS2clouds)
            .sort('CLOUDY_PIXEL_PERCENTAGE');
        var leastCloudy = filteredDataset.first();
        var layer = ui.Map.Layer(leastCloudy, visualization, 'RGB');
        Map.layers().set(0, layer);
    }
});

// Add the date slider to the map
Map.add(dateSlider);
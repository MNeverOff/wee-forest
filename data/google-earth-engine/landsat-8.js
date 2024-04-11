function maskL8clouds(image) {
    var qa = image.select('QA_PIXEL');

    // Bits 4 and 5 are clouds and cirrus, respectively.
    var cloudBitMask = 1 << 4;
    var cirrusBitMask = 1 << 5;

    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

    return image.updateMask(mask);
}

function applyScaleFactors(image) {
    var opticalBands = image.select('SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B6', 'SR_B7');
    var thermalBand = image.select('ST_B10');

    // Scale the data to reflectance and temperature values
    var scaledImage = image.addBands(opticalBands.divide(10000), null, true)
                           .addBands(thermalBand.divide(10), null, true);

    return scaledImage;
}

var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterDate('2021-05-01', '2021-06-01')
    .map(applyScaleFactors)
    .map(maskL8clouds);

var visualization = {
    bands: ['SR_B4', 'SR_B3', 'SR_B2'],
    min: 0.0,
    max: 1.0,
};

Map.setCenter(-2, 55, 12);

Map.addLayer(dataset, visualization, 'True Color (432)');
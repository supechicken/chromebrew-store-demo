function getAverageRGB(imgEl) {
    
    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;
        
    if (!context) {
        return defaultRGB;
    }
    
    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
    
    context.drawImage(imgEl, 0, 0);
    
    data = context.getImageData(0, 0, width, height);
    
    length = data.data.length;
    
    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }
    
    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);
    
    return rgb;
    
}

function getImageBrightness(img) {
    var colorSum = 0;

    // create canvas
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0);

    var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
    var data = imageData.data;
    var r,g,b,avg;

    for(var x = 0, len = data.length; x < len; x+=4) {
        r = data[x];
        g = data[x+1];
        b = data[x+2];

        avg = Math.floor((r+g+b)/3);
        colorSum += avg;
    }

    var brightness = Math.floor(colorSum / (img.width*img.height));
    return brightness;
}
var reliefRatio = 734 / 1170;
var lonRotate = 100;
var latRotate = -45;
var lonCenter = -97.74;
var latTop = 51.75;
var scaleRatio = 1297 / 956.4032697547684;

var width, height;

// Data loading
var dataToLoad = {
    'at': 'at/',
    'at_buffer': null,
    'momdad': 'http://mannymarsha.wordpress.com/',
    'momdad_buffer': null,
    'transam': 'http://picasaweb.com/nathanbiketrip',
    'transam_buffer': null,
    'camino': 'http://blog.travelpod.com/travel-blog/aggiesontheway/2/tpod.html',
    'camino_buffer': null,
};
var dataReadyCount = 0;
var baseReady = false;

// Display variables
var defaultStrokeWidth = '3';
var mouseoverStrokeWidth = '5';
var transitionDuration = 300;
var blurRadius = 3;

var projection = d3.geo.azimuthalEqualArea();

var path = d3.geo.path()
    .projection(projection);

var map = d3.select('#map');
var svg = map.append('svg');
var defs = svg.append('defs');

//
// Load topjson data
// 
d3.json('../data/world.json', function (error, world) {

    defs.append('path')
        .attr('id', 'land')
        .datum(topojson.feature(world, world.objects.world));

    svg.append('use')
        .attr('xlink:href', '#land');

    baseReady = true;

    display();

});

function loadPathCallback(key) {
    return function (error, data) {
        defs.append('path')
            .attr('id', key)
            .datum(topojson.feature(data, eval('data.objects.' + key)));
        dataReadyCount++;
        display();
    };
}

for (var key in dataToLoad) {
    d3.json('../data/' + key + '.json', loadPathCallback(key));
}

function display() {
    if (baseReady && dataReadyCount === Object.keys(dataToLoad).length) {
        // Add paths to map
        // 
        function drawPath(pathName) {
            var g = svg.append('a')
                        .attr('xlink:href', dataToLoad[pathName])
                        .append('g')
                            .attr('class', 'path-group ' + pathName);

            var path = g.append('use')
                .attr('class', 'path')
                .style('stroke-width', defaultStrokeWidth)
                .attr('xlink:href', '#' + pathName);

            var link = d3.select('.copy .' + pathName);
            link.style('transition-duration', transitionDuration + 'ms');

            g.append('use')
                .attr('class', 'buffer')
                .attr('xlink:href', '#' + pathName + '_buffer');

            function setPathStroke(width) {
                path.transition().duration(transitionDuration).style('stroke-width', width);
            }

            function setTextShadow(width) {
                var textShadow = '0px 0px ' + width + 'px';
                if (width > 0) {
                    textShadow += ' ' + path.style('stroke');
                }
                link.style('text-shadow', textShadow);
            }

            function doMouseover() {
                setPathStroke(mouseoverStrokeWidth);
                setTextShadow(blurRadius);
            }

            function doMouseout() {
                setPathStroke(defaultStrokeWidth);
                setTextShadow(0);
            }

            g.on('mouseover', doMouseover);
            link.on('mouseover', doMouseover);

            g.on('mouseout', doMouseout);
            link.on('mouseout', doMouseout);
        }

        drawPath('momdad');
        drawPath('transam');
        drawPath('at');
        drawPath('camino');

        // Add resize event handler and run for the first time
        d3.select(window).on('resize', resize);
        resize();
    }
}

function resize() {

    width = parseInt(map.style('width'));
    height = Math.round(width * reliefRatio);

    // Ensure copy text below map is always visible
    var copyHeight = parseInt(d3.select('.copy').style('height'));
    if (height + copyHeight > window.innerHeight) {
        height = window.innerHeight - copyHeight;
        width = Math.round(height / reliefRatio);
    }

    projection
        .rotate([lonRotate, latRotate])
        .center([lonRotate + lonCenter, latRotate + latTop])
        .translate([width / 2, 0])
        .scale(width * scaleRatio)
        .precision(0.1);

    svg
        .attr('width', width)
        .attr('height', height);

    svg.select('.relief')
        .attr('width', width)
        .attr('height', height);

    d3.select(self.frameElement).style('height', height + 'px');

    svg.select('#land').attr('d', path);

    for (var key in dataToLoad) {
        svg.select('#' + key).attr('d', path);
    }
}

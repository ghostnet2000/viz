/**
 * MapVis
 * @param _parentElement -- the HTML or SVG element (D3 node) to which to attach the vis
 * @param _data -- the data array
 * @param _metaData -- the meta-data / data description object
 * @constructor
 */
MapVis = function(_parentElement, _stationData, _routeData, _eventHandler) {
	this.parentElement = _parentElement;
	this.stationData = _stationData;
	this.routeData = _routeData;
	this.eventHandler = _eventHandler;
	this.displayData = [];
	this.disp = 0;
	// Define all "constants" here
	this.margin = {
			top: 10,
			right: 10,
			bottom: 10,
			left: 100
		},
		this.width = this.parentElement.node().clientWidth - this.margin.left - this.margin.right,
		this.height = this.parentElement.node().clientWidth - this.margin.top - this.margin.bottom,
		this.header_height = 60 + this.margin.bottom;
	// set width of outer div to height of window
	$('#mapVis').height(window.innerHeight - this.header_height);
	// set up SVG
	this.initVis();
};
/**
 * Method that sets up the SVG and the variables
 */
MapVis.prototype.initVis = function() {
	that = this;


    // Define styles
    that.normalStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({
                color: 'rgba(20,150,200,0.3)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(20,130,150,0.8)',
                width: 1
            })
        })
    });
    that.selectedStyle = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 40,
            fill: new ol.style.Fill({
                color: 'rgba(150,150,200,0.6)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(20,30,100,0.8)',
                width: 3
            })
        })
    });
    that.selectedTextStyleFunction = function(name) {
        return new ol.style.Style({
            text: new ol.style.Text({
                font: '14px helvetica,sans-serif',
                text: name,
                fill: new ol.style.Fill({
                    color: '#000'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            })
        });
    };

    // Source and vector layer
    that.geojsonSource = new ol.source.Vector({
        url: 'data/output.geojson',
        projection: 'EPSG:3857',
        format: new ol.format.GeoJSON()
    });

    that.vectorLayer = new ol.layer.Vector({
        source: that.geojsonSource,
        style: that.normalStyle
    });

    // Map
    that.map = new ol.Map({
        target: 'mapVis',  // The DOM element that will contains the map
        renderer: 'canvas', // Force the renderer to be used
        layers: [
            // Add a new Tile layer getting tiles from OpenStreetMap source
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            that.vectorLayer
        ],
        // Create a view centered on the specified location and zoom level
        view: new ol.View({
            center: ol.proj.transform([2.1833, 41.3833], 'EPSG:4326', 'EPSG:3857'),
            zoom: 4
        })
    });

    that.selectedFeatures = [];

    // Unselect previous selected features
    function unselectPreviousFeatures() {
        var i;
        for(i=0; i< that.selectedFeatures.length; i++) {
            that.selectedFeatures[i].setStyle(null);
        }
        that.selectedFeatures = [];
    }

    // Handle pointer
    that.map.on('pointermove', function(event) {
        unselectPreviousFeatures();                
        that.map.forEachFeatureAtPixel(event.pixel, function(feature) {
            feature.setStyle([
                that.selectedStyle, 
                that.selectedTextStyleFunction(feature.get('CITY_NAME'))
            ]);
            that.selectedFeatures.push(feature);
        });
    });
};

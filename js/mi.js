var MI = {

	highlightedGridName: "Box",
	cartodbTiles : null,

    zoomToPoint: function(latlon,zoomScale){
        var map = eGV.getMap();
        var point = latlon.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
        map.zoomToScale(zoomScale);
        map.panTo(point);
    },

    setInitialView: function(initial_lat, initial_lon, initial_scale) {
        this.zoomToPoint(new OpenLayers.LonLat(initial_lon, initial_lat), initial_scale);
    },

    zoomToInfoResult: function(){
        var olExtent = new OpenLayers.Bounds(parseInt(this.extent[0]),parseInt(this.extent[1]),parseInt(this.extent[2]),parseInt(this.extent[3]));
        this.map.zoomToExtent(olExtent);
    },

    bringExtent2Center: function(minx, miny, maxx, maxy){
        var bounds = new OpenLayers.Bounds(minx, miny, maxx, maxy);
        bounds = bounds.transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913"));
        eGV.getMap().zoomToExtent(bounds,false);
    },

    zoomToDefaultExtent: function(defaultExtent){
        eGV.getMap().zoomToExtent(defaultExtent);
        //eGV.getMap().setCenter(defaultExtent.getCenterLonLat());
    },


    /**
     * Method: showHideLayer
     * Shows or hides the given layer accordingly
     *
     * Parameters:
     * layer_id - {String} the id of the layer
     * forceShow - {Boolean} whether to force the displaying of the layer,
     *              if true, the layer will be always displayed
     */
    showHideLayer: function(layer_id, forceShow){
        if(forceShow == 'undefined' || forceShow == null)
            forceShow = false;
        var map = eGV.getMap();
        for(var i=0, len=map.connections.length; i<len; i++){
            var layer = map.connections[i].getLayer(layer_id);
            if(layer != null){
                if(forceShow && layer.isVisible())
                    return layer.isVisible();
                else{
                    layer.changeDisplayed();
                    return layer.isVisible();
                }
            }
        }
        return null;
    },

    /**
     * Method: getLayerLegend
     * Returns the URL for the image of the layer's legend
     *
     * Parameters:
     * layer_id - {String} the id of the layer
     */
    getLayerLegend: function(layer_id){
        var map = eGV.getMap();
        for(var i=0, len=map.connections.length; i<len; i++){
            var layer = map.connections[i].getLayer(layer_id);
            if(layer != null){
                return layer.getLegendURL();
            }
        }
        return null;
    },



    formatScaleStatusBarOutput: function(latlon,scale) {
	
        var newHtml = "";
        if(latlon) {
			var point = latlon.clone().transform(new OpenLayers.Projection("EPSG:900913"),new OpenLayers.Projection("EPSG:4326"));
			newHtml += "<div>Lon: " + eGV.Util.formatNumber(point.lon.toFixed(2)) + "º" +
				" Lat: " + eGV.Util.formatNumber(point.lat.toFixed(2)) + "º</div><div>" + locStrings._generic_scale+ " &#126; 1 : " + 
				eGV.Util.formatNumber(scale.toPrecision(3) - 0) + "</div> ";
		}

        return newHtml;
    },

    getQuotes: function(bbox, format){

        var map = eGV.getMap();
		
		if(!format) format = "csv";
        
        var service = "php/geoservices/index.php?op=getquotes&level="+UI.active_taxon_level+"&id="+UI.active_taxon_id;
        if(bbox) {
            service += "&BBOX=" + bbox; // we include bbox
            service += "&GRID=";
            service += (map.getScale() > scale_change ? "" : "detail");
        }
        service += "&FORMAT=" + format;
        if(locale) service += "&LANG=" + locale;
		location.href = service;
    },

    getBoundsFromPosition: function(position) {
	
        var bounds;
        var map = eGV.getMap();
        
        if (position instanceof OpenLayers.Bounds) {
            var minXY = map.getLonLatFromPixel(
                        new OpenLayers.Pixel(position.left, position.bottom));
            var maxXY = map.getLonLatFromPixel(
                        new OpenLayers.Pixel(position.right, position.top));
            bounds = new OpenLayers.Bounds(minXY.lon, minXY.lat,
                                           maxXY.lon, maxXY.lat);
        // position is a pixel
        } else {
            var XY = map.getLonLatFromPixel(position);
            bounds = new OpenLayers.Bounds(XY.lon, XY.lat,
                                           XY.lon, XY.lat);
        }

        bounds.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
        return bounds;
    },
	
	showHighlightedGrid: function(extent) {
	
		if(!extent) return;
		
		var map = eGV.getMap();
		
		var ext = [extent.minx, extent.miny, extent.maxx, extent.maxy];
		var boxes  = new OpenLayers.Layer.Boxes(this.highlightedGridName);
		var bounds = OpenLayers.Bounds.fromArray(ext);
		bounds.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
		var box = new OpenLayers.Marker.Box(bounds,"#F00", 1);
		boxes.addMarker(box);

		this.hideHighlightedGrid();
		map.addLayer(boxes);		
	
	},
	
	hideHighlightedGrid: function() {
	
	    var map = eGV.getMap();
		var oldLayer = map.getLayersByName(this.highlightedGridName);
		if(oldLayer[0]) map.removeLayer(oldLayer[0]);
		
	},		

    getInfoZoomBox: function(div, position) {

        var map = eGV.getMap();

        // we want to keep extension
        UI.position_infobox = position;

        var bounds = this.getBoundsFromPosition(position);
        
        $.getJSON("php/geoservices/index.php?op=getinfobox",
            {
            LEVEL: UI.active_taxon_level,
            ID: UI.active_taxon_id,
            BBOX: bounds.toBBOX(3,false),
            GRID: (map.getScale() > scale_change ? "" : "detail")
            },
            function(data){
            // parse JSON data
			if(data) {
				if(data.status == "success") UI.drawInfoResults(div, data);
				else div.html(locStrings._infobox_notfound);
				//highlight grid
				MI.showHighlightedGrid(data.extent);
			}
        });
    },
    
    loadCartodbLayer: function(sql) {
        
        MI.cartodbTiles = cartodb.Tiles.getTiles({
            type: 'cartodb',
            user_name: 'marti',
            sublayers: [{
             sql: sql,
             cartocss: '#herbari_cartodb{marker-fill: #FFCC00;marker-width: 10;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-opacity: 0.9;marker-comp-op: multiply;marker-type: ellipse;marker-placement: point;marker-allow-overlap: true;marker-clip: false;marker-multi-policy: largest; }'
             //cartocss: "#herbari_cartodb{  marker-width: 10;  marker-fill: #FD8D3C;  marker-line-width: 1.5;  marker-opacity: 1;  marker-line-opacity: 1;  marker-line-color: #fff;  marker-allow-overlap: true;  marker-comp-op: dst-atop;  [src = 'bucketC'] {    marker-line-width: 5;    marker-width: 19;  }   [src = 'bucketB'] {    marker-line-width: 5;    marker-width: 36;  }   [src = 'bucketA'] {    marker-line-width: 5;    marker-width: 52;  } }#herbari_cartodb::labels {   text-size: 0;   text-fill: #fff;   text-opacity: 0.8;  text-name: [points_count];   text-face-name: 'DejaVu Sans Book';   text-halo-fill: #FFF;   text-halo-radius: 0;   [src = 'bucketC'] {    text-size: 12;    text-halo-radius: 0.5;  }  [src = 'bucketB'] {    text-size: 17;    text-halo-radius: 0.5;  }  [src = 'bucketA'] {    text-size: 22;    text-halo-radius: 0.5;  }  text-allow-overlap: true;  [zoom>11]{ text-size: 13; }  [points_count = 1]{ text-size: 0; }}"
             
            }]},                
            function(tileTemplate) {
            // update here the tilesUrl in openlayers layer
            var tilesUrl = [];
            for(var i = 0; i < 4; ++i) {
                tilesUrl.push(
                  tileTemplate.tiles[0]
                    .replace('{s}', 'abcd'[i])
                    .replace('{z}','${z}')
                    .replace('{x}','${x}')
                    .replace('{y}','${y}')
                );
              }
            var map = eGV.getMap();
            if(map == null) return;                
            var conn = map.getConnection("cartodbConn");
            
            if(!conn) {
                // create the openlayers layer
                var cartodbLayer = new OpenLayers.Layer.XYZ(
                        "cartodbLayer",
                        tilesUrl, {
                          attribution: "MCNB",
                          sphericalMercator: true,
                          isBaseLayer: false
                        });      
          
                //cartodb connection
                var egvConnCarto  = new eGV.Connection(
                      "cartodbConn",
                      cartodbLayer,
                          {
                          "id":"cartodbConn",
                          "title":"cartodb",
                          "visible": true     
                          }
                      );
                        
                // add to the map
                //map.addLayer(cartodbLayer);
                map.addConnection(egvConnCarto);
                
            } else {
                var cartodbLayer = map.getLayersByName("cartodbLayer")[0];                
                cartodbLayer.setUrl(tilesUrl);
                cartodbLayer.redraw();
            }
           });
    }

}
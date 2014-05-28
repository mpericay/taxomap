var MI = {

	highlightedGridName: "Box",
	infoboxBounds: null,
	infoboxPixels: 20,
	cartodbTiles : null,
	cartodbApi : "http://marti.cartodb.com/api/v2/sql?",
	cartodbTable: "https://marti.cartodb.com/tables/mcnb",

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

		if(!format) format = "csv";
        
        var query = "select * from mcnb where " + UI.taxon.levelsId[UI.taxon.level] + "='"+UI.taxon.id+"'";
        if(bbox) {
            bbox = this.getBoundsFromPosition(this.infoboxBounds);
            query += " and (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point("+bbox.left+","+bbox.bottom+"),ST_Point("+bbox.right+","+bbox.top+")),4326))"; // we include bbox
        }
        var service = MI.cartodbApi + "q=" + encodeURIComponent(query) + "&format=" + format;
        //if(locale) service += "&LANG=" + locale;
        location.href = service;
    },

    getBoundsFromPosition: function(position) {
	
        var bounds;
        var map = eGV.getMap();
        
        if (position instanceof OpenLayers.Bounds) {
            var minXY = map.getLonLatFromPixel(
                        new OpenLayers.Pixel(position.left, position.top));
            var maxXY = map.getLonLatFromPixel(
                        new OpenLayers.Pixel(position.right, position.bottom));
            
        // position is a pixel
        } else {
            //convert it to bbox
            var minXY = map.getLonLatFromPixel(
                    new OpenLayers.Pixel(position.x - this.infoboxPixels, position.y - this.infoboxPixels));
            var maxXY = map.getLonLatFromPixel(
                    new OpenLayers.Pixel(position.x + this.infoboxPixels, position.y + this.infoboxPixels));                
            
        }
        
        bounds = new OpenLayers.Bounds(minXY.lon, maxXY.lat, maxXY.lon, minXY.lat);

        bounds.transform(new OpenLayers.Projection("EPSG:900913"), new OpenLayers.Projection("EPSG:4326"));
        return bounds;
    },
	
    showHighlightedGridFromBounds: function(boundsLatLon) {

        var map = eGV.getMap();
        if(!map) return;
        
        var bounds = boundsLatLon.clone();
        bounds.transform(new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"));
        
        var boxes  = new OpenLayers.Layer.Boxes(this.highlightedGridName);
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
        this.infoboxBounds = position;

        var bounds = this.getBoundsFromPosition(position);
        
        $.getJSON(this.cartodbApi,
            {
            q: "select count(*)," + UI.taxon.levelsId[UI.taxon.level+1] + " as id," + UI.taxon.levels[UI.taxon.level+1] + " as name from mcnb where " + UI.taxon.levelsId[UI.taxon.level] +"='" + UI.taxon.id + "' and (the_geom && ST_SetSRID(ST_MakeBox2D(ST_Point("+bounds.left+","+bounds.bottom+"),ST_Point("+bounds.right+","+bounds.top+")),4326)) group by id, name order by count(*) desc"
            //BBOX: bounds.toBBOX(3,false)
            },
            function(data){
            // parse JSON data
			if(data) {
				if(data.total_rows) UI.drawInfoResults(div, data);
				else div.html(locStrings._infobox_notfound);
			}
        });
        
        // highlight grid
        this.showHighlightedGridFromBounds(bounds);
    },
    
    loadCartodbLayer: function(sql) {
        
        this.cartodbTiles = cartodb.Tiles.getTiles({
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
                          attribution: "(ODbL) Museu de Ciències Naturals de Barcelona",
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
                map.addConnection(egvConnCarto);
                
                // add transparency control (must be created after layer)
                var transControl = new eGV.Control.Transparency({
                    id:"controlTransparency",
                    minOpacity:0.2,
                    defaultOpacity:0.9,
                    connections: [egvConnCarto]
                });
                eGV.addControl(transControl);                
                
            } else {
                var cartodbLayer = map.getLayersByName("cartodbLayer")[0];                
                cartodbLayer.setUrl(tilesUrl);
                cartodbLayer.redraw();
            }
           });
    }

}
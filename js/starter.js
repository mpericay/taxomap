function initialize(){
	
	var defaultExtent = new OpenLayers.Bounds(-3392581.0628016, 1467590.9428124, 5804322.1788234, 8433755.9513624);
    var options = {
        "sphericalMercator": true,
        "maxExtent": new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
        "maxResolution": "auto",
        "units": "m",
        "projection": "EPSG:900913",
        "id":"eGVMapBioexplora",
        // for OpenLayers 2.13.1 compatibility
        "tileManager": null,		
        controls: [
        new OpenLayers.Control.Navigation(),
        //new OpenLayers.Control.PanPanel(),
        //new OpenLayers.Control.ZoomPanel() 
        new OpenLayers.Control.PanZoomBar({
            zoomStopHeight: 8,
            zoomWorldIcon: true
        }) 
        ]
    };

    var map = eGV.addMap(new eGV.Map("divMap",options));
    
    eGV.Lang.setCode(locale);
    eGV.includeStyle(eGV.scriptRoot + "egv/theme/default/style.css","csseGV");
    eGV.includeStyle("css/egv.css","cssmap");

    // avoid pink tiles
    OpenLayers.IMAGE_RELOAD_ATTEMPTS = 3;
    OpenLayers.Util.onImageLoadErrorColor = "transparent";


	/*********** START LAYERS **********/

	var arrayMapQuest = ["http://otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
				"http://otile2.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
				"http://otile3.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg",
				"http://otile4.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.jpg"];
	var arrayAerial = ["http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
					"http://otile2.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
					"http://otile3.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg",
					"http://otile4.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.jpg"];	
					
	var zoomOptions = {minZoomLevel: 3, numZoomLevels: 12};

	var baseMapQuest = new OpenLayers.Layer.OSM("MapQuest-OSM Tiles", arrayMapQuest, zoomOptions);
	var baseAerial = new OpenLayers.Layer.OSM("MapQuest Open Aerial Tiles", arrayAerial, zoomOptions);
	//var gbifLayer = new OpenLayers.Layer.OSM("GBIF Mammalia Tiles", ["http://api.gbif.org/v0.9/map/density/tile?x=${x}&y=${y}&z=${z}&type=PUBLISHER&key=e8eada63-4a33-44aa-b2fd-4f71efb222a0&layer=OBS_NO_YEAR&layer=SP_NO_YEAR&layer=OTH_NO_YEAR&layer=OBS_1900_1910&layer=SP_1900_1910&layer=OTH_1900_1910&layer=OBS_1910_1920&layer=SP_1910_1920&layer=OTH_1910_1920&layer=OBS_1920_1930&layer=SP_1920_1930&layer=OTH_1920_1930&layer=OBS_1930_1940&layer=SP_1930_1940&layer=OTH_1930_1940&layer=OBS_1940_1950&layer=SP_1940_1950&layer=OTH_1940_1950&layer=OBS_1950_1960&layer=SP_1950_1960&layer=OTH_1950_1960&layer=OBS_1960_1970&layer=SP_1960_1970&layer=OTH_1960_1970&layer=OBS_1970_1980&layer=SP_1970_1980&layer=OTH_1970_1980&layer=OBS_1980_1990&layer=SP_1980_1990&layer=OTH_1980_1990&layer=OBS_1990_2000&layer=SP_1990_2000&layer=OTH_1990_2000&layer=OBS_2000_2010&layer=SP_2000_2010&layer=OTH_2000_2010&layer=OBS_2010_2020&layer=SP_2010_2020&layer=OTH_2010_2020&layer=LIVING&layer=FOSSIL&palette=yellows_reds&resolution=8"], zoomOptions);
	
    var egvConnOSM = [

        egvConnOSM1 = new eGV.Connection(
            "OSM - Aerial",
            baseAerial,
                {
                "id":"OSMAerial",
                "title":locStrings._satellite,
    			"visible": true		
            }
            ),
    	
    	egvConnOSM2 = new eGV.Connection(
            "OSM Map",
            baseMapQuest,
                {
                "id":"OSMMap",
                "title":locStrings._map,
    			"visible": false
            }
            )/*,
            //GBIF LAYER TEST: delete this!
            egvConnGBIF = new eGV.Connection(
                    "GBIF-Mammalia",
                    gbifLayer,
                        {
                        "id":"GBIFLayer",
                        "title":"GBIFLayer",
                        "visible": true,
                        "isBaseLayer": false
                    }
                )*/            
    ];

    map.addConnections(egvConnOSM);

    // malla d'especies
    var egvConn1 = new eGV.Connection.WMS(
        "bioexplora",
        serverURL+"/wms56/mcnb/taxomap/malla",
        {
            "format":"image/png",
            "transparent":true,
            "exceptions":"application/vnd.ogc.se_xml"
        },
        {
            "singleTile":true,
            "ratio":1.0,
            "opacity":0.8
        },
        {
            "id":"bioexplora",
            printable:false
        }
        );

    var egvLayers1 = [
    egvLayerSpecie = new eGV.Layer({
        "id" : "specie",
        "name" : "specie",
        "title" : "Especie",
        "minScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),
    egvLayerSpecieDetail = new eGV.Layer({
        "id" : "specie_detail",
        "name" : "specie_detail",
        "title" : "Especie detall",
        "maxScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),egvLayerGenus = new eGV.Layer({
        "id" : "genus",
        "name" : "genus",
        "title" : "Genus",
        "minScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),
    egvLayerGenusDetail = new eGV.Layer({
        "id" : "genus_detail",
        "name" : "genus_detail",
        "title" : "Genus detall",
        "maxScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),egvLayerFamilia = new eGV.Layer({
        "id" : "familia",
        "name" : "familia",
        "title" : "Familia",
        "minScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),
    egvLayerFamiliaDetail = new eGV.Layer({
        "id" : "familia_detail",
        "name" : "familia_detail",
        "title" : "Familia detall",
        "maxScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),egvLayerOrdre = new eGV.Layer({
        "id" : "ordre",
        "name" : "ordre",
        "title" : "Ordre",
        "minScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),
    egvLayerOrdreDetail = new eGV.Layer({
        "id" : "ordre_detail",
        "name" : "ordre_detail",
        "title" : "Ordre detall",
        "maxScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),egvLayerClasse = new eGV.Layer({
        "id" : "classe",
        "name" : "classe",
        "title" : "Classe",
        "minScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),
    egvLayerClasseDetail = new eGV.Layer({
        "id" : "classe_detail",
        "name" : "classe_detail",
        "title" : "Classe detall",
        "maxScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),
    egvLayerPhylum = new eGV.Layer({
        "id" : "phylum",
        "name" : "phylum",
        "title" : "Phylum",
        "minScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),
    egvLayerPhylumDetail = new eGV.Layer({
        "id" : "phylum_detail",
        "name" : "phylum_detail",
        "title" : "Phylum detall",
        "maxScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),
    egvLayerAnimalia = new eGV.Layer({
        "id" : "kingdom",
        "name" : "kingdom",
        "title" : "Regne",
        "minScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),
    egvLayerAnimaliaDetail = new eGV.Layer({
        "id" : "kingdom_detail",
        "name" : "kingdom_detail",
        "title" : "Regne detall",
        "maxScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),
    egvLayerLife = new eGV.Layer({
        "id" : "domain",
        "name" : "domain",
        "title" : "Eukaryota",
        "minScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    }),
    egvLayerLifeDetail = new eGV.Layer({
        "id" : "domain_detail",
        "name" : "domain_detail",
        "title" : "Eukaryota detall",
        "maxScale": scale_change,
        "visible" : false,
        "queryable" : true,
        "showLegend" : false
    })
    ];
    egvConn1.map = map;
    egvConn1.addLayers(egvLayers1);
    //map.addConnection(egvConn1);
    
    // request cartodb layer
    cartodbTiles = cartodb.Tiles.getTiles({
      type: 'cartodb',
      user_name: 'marti',
      sublayers: [{
       sql: 'select * from herbari_cartodb',
       cartocss: '#herbari_cartodb{marker-fill: #FFCC00;marker-width: 10;marker-line-color: #FFF;marker-line-width: 1.5;marker-line-opacity: 1;marker-opacity: 0.9;marker-comp-op: multiply;marker-type: ellipse;marker-placement: point;marker-allow-overlap: true;marker-clip: false;marker-multi-policy: largest; }'
       //cartocss: "#herbari_cartodb{  marker-width: 10;  marker-fill: #FD8D3C;  marker-line-width: 1.5;  marker-opacity: 1;  marker-line-opacity: 1;  marker-line-color: #fff;  marker-allow-overlap: true;  marker-comp-op: dst-atop;  [src = 'bucketC'] {    marker-line-width: 5;    marker-width: 19;  }   [src = 'bucketB'] {    marker-line-width: 5;    marker-width: 36;  }   [src = 'bucketA'] {    marker-line-width: 5;    marker-width: 52;  } }#herbari_cartodb::labels {   text-size: 0;   text-fill: #fff;   text-opacity: 0.8;  text-name: [points_count];   text-face-name: 'DejaVu Sans Book';   text-halo-fill: #FFF;   text-halo-radius: 0;   [src = 'bucketC'] {    text-size: 12;    text-halo-radius: 0.5;  }  [src = 'bucketB'] {    text-size: 17;    text-halo-radius: 0.5;  }  [src = 'bucketA'] {    text-size: 22;    text-halo-radius: 0.5;  }  text-allow-overlap: true;  [zoom>11]{ text-size: 13; }  [points_count = 1]{ text-size: 0; }}"
       
      }]
    }, function(tileTemplate) {
      // generate urls for openlayers
      var tilesUrl = []
      for(var i = 0; i < 4; ++i) {
        tilesUrl.push(
          tileTemplate.tiles[0]
            .replace('{s}', 'abcd'[i])
            .replace('{z}','${z}')
            .replace('{x}','${x}')
            .replace('{y}','${y}')
            );
          }
    
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
    });    

/*********** END LAYERS **********/

    map.addControl(new OpenLayers.Control.Attribution({
        displayClass: "egvControlAttribution"
    }));
    eGV.addControl(new eGV.Control.ScaleStatusBar("divStatusBar",{
        "id":"stbar",
        "drawScale": true,
        "formatOutput": MI.formatScaleStatusBarOutput
    }));
    
    var toolBar = eGV.addControl(new eGV.Control.ToolBar("divToolbar",{
        "id":"toolBar"
    }));
    map.addControl(toolBar);
    
    var infoControl = new eGV.Control.InfoBox({
        id:"infoControl",
        title: locStrings._info_text
    });
	
	var panControl = new eGV.Control.InfoNavigation({
		id: "panControl",
        displayClass: "egvControlButton egvControlNavigation",
        title:locStrings._pan_text
    });
	
	var zoomboxControl = new OpenLayers.Control.ZoomBox({
        displayClass: "egvControlButton egvControlZoomBox",
        id:"zoomInControl",
        title:locStrings._zoomin_text
    }); 

    var controls = [
    infoControl,
	panControl,	
    zoomboxControl
    ];

    toolBar.addControls(controls);
    //toolBar.getControl("infoControl").events.register("actionend", UI, UI.displayInfoSectionDiv);
    
    var transparencyConnections = [
      map.getConnection("cartodb")
    ];

    /*var transControl = new eGV.Control.Transparency({
        id:"controlTransparency",
        minOpacity:0.2,
        defaultOpacity:0.8,
        connections:transparencyConnections
    });
    eGV.addControl(transControl);*/

    var baseLayers = egvConnOSM;

    eGV.addControl(new eGV.Control.BaseLayerSwitcherList("divBaseLayerSwitcher",{
        bases:baseLayers,
        id:"eGVBaseLayersSwitcher"
    }));


    eGV.addControl(new eGV.Control.LoadingPanel("divMapLoading"));

    eGV.addControl(new eGV.Control.OverviewMap("divOverviewMap",{
        staticMap:false,
        size:[150,100],
        layers: [new OpenLayers.Layer.OSM()],
        id:"eGVOverviewMap"
    }),"eGVOverviewMap");

    //default tool
	panControl.activate();

	map.zoomToExtent(defaultExtent);
    map.restrictedExtent = map.maxExtent;

    //sets view after loading components
    document.getElementById("divMainLoading").style.display = "none";
    document.getElementById("divMain").style.visibility = "visible";

}



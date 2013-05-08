function initialize(){
	
	var defaultExtent = new OpenLayers.Bounds(-3392581.0628016, 1467590.9428124, 5804322.1788234, 8433755.9513624);
    var options = {
        "sphericalMercator": true,
        "maxExtent": new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
        "maxResolution": "auto",
        "units": "m",
        "projection": "EPSG:900913",
        "id":"eGVMapBioexplora",
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
        )
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
            "ratio":1.5,
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
    })
    ];
    egvConn1.map = map;
    egvConn1.addLayers(egvLayers1);
    map.addConnection(egvConn1);

    //MI.addParamsSRS("EPSG:900913"); // WHAT FOR?

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
      map.getConnection("bioexplora")
    ];

    var transControl = new eGV.Control.Transparency({
        id:"controlTransparency",
        minOpacity:0.2,
        defaultOpacity:0.8,
        connections:transparencyConnections
    });
    eGV.addControl(transControl);

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



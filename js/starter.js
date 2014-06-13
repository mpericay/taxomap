function initialize(){
	
	var defaultExtent = new OpenLayers.Bounds(-11032207.5745,-1917652.1656,14719121.5067,11153691.1674);
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
					
	var zoomOptions = {minZoomLevel: 5, numZoomLevels: 12};

	var baseMapQuest = new OpenLayers.Layer.XYZ("MapQuest-OSM Tiles", arrayMapQuest, zoomOptions);
	var baseAerial = new OpenLayers.Layer.XYZ("MapQuest Open Aerial Tiles", arrayAerial, zoomOptions);
	//var gbifLayer = new OpenLayers.Layer.OSM("GBIF Mammalia Tiles", ["http://api.gbif.org/v0.9/map/density/tile?x=${x}&y=${y}&z=${z}&type=PUBLISHER&key=e8eada63-4a33-44aa-b2fd-4f71efb222a0&layer=OBS_NO_YEAR&layer=SP_NO_YEAR&layer=OTH_NO_YEAR&layer=OBS_1900_1910&layer=SP_1900_1910&layer=OTH_1900_1910&layer=OBS_1910_1920&layer=SP_1910_1920&layer=OTH_1910_1920&layer=OBS_1920_1930&layer=SP_1920_1930&layer=OTH_1920_1930&layer=OBS_1930_1940&layer=SP_1930_1940&layer=OTH_1930_1940&layer=OBS_1940_1950&layer=SP_1940_1950&layer=OTH_1940_1950&layer=OBS_1950_1960&layer=SP_1950_1960&layer=OTH_1950_1960&layer=OBS_1960_1970&layer=SP_1960_1970&layer=OTH_1960_1970&layer=OBS_1970_1980&layer=SP_1970_1980&layer=OTH_1970_1980&layer=OBS_1980_1990&layer=SP_1980_1990&layer=OTH_1980_1990&layer=OBS_1990_2000&layer=SP_1990_2000&layer=OTH_1990_2000&layer=OBS_2000_2010&layer=SP_2000_2010&layer=OTH_2000_2010&layer=OBS_2010_2020&layer=SP_2010_2020&layer=OTH_2010_2020&layer=LIVING&layer=FOSSIL&palette=yellows_reds&resolution=8"], zoomOptions);
	
    var egvConnOSM = [

        egvConnOSM1 = new eGV.Connection(
            "OSM Aerial",
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



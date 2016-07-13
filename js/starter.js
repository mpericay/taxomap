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

	var arrayOSM = ["http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
				"http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
				"http://a.tile.openstreetmap.org/${z}/${x}/${y}.png"];
	var arrayAerial = ["http://0.tile.openstreetmap.se/hydda/base/${z}/${x}/${y}.png",
					"http://1.tile.openstreetmap.se/hydda/base/${z}/${x}/${y}.png",
					"http://2.tile.openstreetmap.se/hydda/base/${z}/${x}/${y}.png",
					"http://3.tile.openstreetmap.se/hydda/base/${z}/${x}/${y}.png"];	
					
	var zoomOptions = {
	        minZoomLevel: 5, 
	        numZoomLevels: 12,
	        attribution: "&copy; <a href='http://www.openstreetmap.org/copyright' target='_blank'>OpenStreetMap</a> contributors",
            transitionEffect: "resize"
    };
	
	var zoomOptions2 = {
	        minZoomLevel: 5, 
	        numZoomLevels: 12,
	        attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            transitionEffect: "resize"
    };

	var baseOSM = new OpenLayers.Layer.XYZ("OSM Tiles", arrayOSM, zoomOptions);
	var baseAerial = new OpenLayers.Layer.XYZ("Hydda", arrayAerial, zoomOptions2);
	
    var egvConnOSM = [

        egvConnOSM2 = new eGV.Connection(
            "OSM Map",
            baseOSM,
                {
                "id":"OSMMap",
                "title":locStrings._map,
    			"visible": true
            }
            ),
		
		egvConnOSM1 = new eGV.Connection(
            "OSM Aerial",
            baseAerial,
                {
                "id":"OSMAerial",
                "title":locStrings._satellite,
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



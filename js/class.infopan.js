/* Copyright (c) 2006-2010 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control/ZoomBox.js
 * @requires OpenLayers/Control/DragPan.js
  * @requires OpenLayers/Control/Navigation.js
 * @requires OpenLayers/Handler/MouseWheel.js
 * @requires OpenLayers/Handler/Click.js
 */

/**
 * Class: OpenLayers.Control.InfoNavigation
 * The InfoPan control bahaves exactly like Navigation ('pan') except
 * the click event calls a showInfo function.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */

eGV.Control.InfoNavigation = OpenLayers.Class(OpenLayers.Control.Navigation,{

    /**
     * Method: defaultClick
     *
     * Parameters:
     * evt - {Event}
     */
    defaultClick: function (evt) {
        if (evt.lastTouches && evt.lastTouches.length == 2) {
            this.map.zoomOut();
        }
		UI.showInfo(new OpenLayers.Pixel(evt.xy.x, evt.xy.y));
    },

    CLASS_NAME: "OpenLayers.Control.InfoNavigation"
});



/* Copyright (c) 2006-2010 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the Clear BSD license.  
 * See http://svn.openlayers.org/trunk/openlayers/license.txt for the
 * full text of the license. */

/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Handler/Box.js
 * @requires OpenLayers/Control/ZoomBox.js
 */

/**
 * Class: OpenLayers.Control.InfoBox
 * The ZoomBox control enables zooming directly to a given extent, by drawing 
 * a box on the map. The box is drawn by holding down shift, whilst dragging 
 * the mouse. The InfoBox calls a showInfo function when drawn
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */

eGV.Control.InfoBox = OpenLayers.Class(OpenLayers.Control.ZoomBox,{

    /**
     * Method: draw
     
    draw: function() {
        this.handler = new OpenLayers.Handler.PersistentBox( this,
                            {done: this.zoomBox}, {keyMask: this.keyMask} );
    },*/

    /**
     * Method: zoomBox
     *
     * Parameters:
     * position - {<OpenLayers.Bounds>} or {<OpenLayers.Pixel>}
     */
    zoomBox: function (position) {
        UI.showInfo(position);

    },

    CLASS_NAME: "OpenLayers.Control.InfoBox"
});



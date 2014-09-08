<?php
/**
 * Configuration file of the Taxo&Map application
 *
 * @author     Marti Pericay <marti@pericay.com>
 * @copyright  (c) 2014 by Museu de Ciències Naturals de Barcelona
 * @license    http://www.gnu.org/licenses/gpl-3.0.html GNU General Public License
 * 
 * This program is free software. You can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License.
 */

/**
* Default taxon id
*/
	define("_DEFAULT_TAXON_ID","Eukaryota");

/**
* Default taxon level
*/
    define("_DEFAULT_TAXON_LEVEL","0");

/**
* Complete path to application root
*/
	define("_APP_ROOT","D:/autonom/MCNB/web/www/");

/**
* application url path
*/
    define("_APP_URL_PATH","/taxomap/");
	
/**
* Default locale
*/
	define("_DEFAULT_LOCALE","ca");

/**
* Available locales
*/
	define("_AVAILABLE_LOCALES","ca,en,es");


// must be the same than the one set in XML
    define("_COOKIENAME", "mcnbuser");

/**
* Strings defined in locale which must be transfered to client
*/
$exportLocale = array(
        "_HYBRID",
        "_SATELLITE",
        "_TERRAIN",
        "_MAP",
        "_ZOOMIN_TEXT",
        "_INFO_TEXT",
        "_PAN_TEXT",
        "_HELP_TEXT",
        "_TRANSPARENCY_TEXT",
        "_SECTION_HELP",
        "_SECTION_OVERVIEWMAP",
        "_ERROR_MSG",
        "_ERROR_BACK",
        "_INFOBOX_NOTFOUND",
        "_TAXON_PARENT",
        "_GENERIC_ACTIVATE",
        "_GENERIC_DOWNLOAD",
		"_GENERIC_SCALE",
		"_GENERIC_MOREINFO",
        "_DOWNLOAD_SELECTED_TITLE",
		"_DOWNLOAD_CSV_FORMAT",
		"_DOWNLOAD_KML_FORMAT",
		"_DOWNLOAD_SHP_FORMAT",
		"_DOWNLOAD_SVG_FORMAT",
		"_DOWNLOAD_GEOJSON_FORMAT",
        "_SECTION_INFODIALOG",
		"_SECTION_LEGEND",
		"_SECTION_OVERVIEWMAP",
		"_SECTION_LEGAL",
		"_SECTION_ABOUT",
		"_NO_RESULTS_FOUND",
		"_AT_WIKIPEDIA",
		"_SEE_SHEET",
		"_SEE_SHEET_TITLE",
		"_GENERIC_HERE",
		"_SHEET_SUBTITLE"
	);

?>
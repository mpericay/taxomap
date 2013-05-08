<?php
/**
* Configuration parameters
* @details &copy;2009 - Geodata Sistemas SL
* @file conf.php
* @version 1.0
*/

/**
* Default taxon id
*/
	define("_DEFAULT_TAXON_ID","Mammalia");

/**
* Default taxon level
*/
    define("_DEFAULT_TAXON_LEVEL","2");

/**
* Default taxon level
*/
    define("_SCALE_CHANGE","2000005");

/**
* Maximum number of quotes
*/
    define("_MAX_QUOTES","10000");

/**
* Complete path to application root
*/
	define("_APP_ROOT","/srv/www/apps/clients/mcnb/taxomap/www/");

/**
* application url path
*/
    define("_APP_URL_PATH","/taxomap/");

/**
* Database connection type
*/
	define("_DB_TYPE","pgsql");

/**
* Database host
*/
	define("_DB_HOST","pgsqlserver");

/**
* Database port
*/
	define("_DB_PORT",5432);

/**
* Database name
*/
	define("_DB_NAME","gdb_mcnb");

/**
* Database user
*/
	define("_DB_USER","user_mcnb");

/**
* Database password
*/
	define("_DB_PWD","mcnb");

/**
* Complete path to error log file
*/
	define("_LOG_FILE","/srv/www/apps/clients/mcnb/taxomap/log/model.servidor.error.log");

/**
* Complete path to ogr2ogr
*/
	define("_OGR2OGR","/usr/local/bin/ogr2ogr");
	
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
        "_DOWNLOAD_SELECTED_TITLE",
		"_DOWNLOAD_CSV_FORMAT",
		"_DOWNLOAD_KML_FORMAT",
		"_DOWNLOAD_SHP_FORMAT",
        "_SECTION_INFODIALOG",
		"_SECTION_LEGEND",
		"_SECTION_OVERVIEWMAP",
		"_SECTION_LEGAL",
		"_SECTION_ABOUT",
		"_SECTION_SHEET",
		"_NO_RESULTS_FOUND"
	);

/**
 * Geodatanode (geoservices)
 */

/**
* Complete path to application root
*/
	define("_GEODATANODE_APP_ROOT","/srv/www/apps/clients/mcnb/taxomap/www/php/geoservices/");


/**
* Directory for CSV temp files
*/
	define("_GEODATANODE_TEMP_DIR",_GEODATANODE_APP_ROOT."csv/");
	
/**
* Complete path to the profiles configuration directory
*/
	define("_GEODATANODE_CONFIG_DIR",_GEODATANODE_APP_ROOT."config/");

/**
* Complete path to the default configuration file
*/
	define("_GEODATANODE_DEFAULT_CONFIG_FILE",_GEODATANODE_CONFIG_DIR."default.ini");

/**
* Complete path to error log file
*/
	define("_GEODATANODE_LOG_FILE",_GEODATANODE_APP_ROOT."logs/geodatanode.error.log");

/**
* Default output format
*/
	define("_GEODATANODE_OUTPUT_FORMAT","application/json");

?>
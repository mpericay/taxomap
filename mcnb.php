<?php
/**
 * Main page
 * @details &copy;2011 - Geodata Sistemas SL
 * @file mcnb.php
 * @version 1.0
 */

require_once("php/functions.php");

$serverURL = "http://".$_SERVER['SERVER_NAME'];
if ($_SERVER['SERVER_PORT'] != "80") $serverURL .= ":".$_SERVER['SERVER_PORT'];

// get API parameters
$taxon_id = getParameter("id", _DEFAULT_TAXON_ID);
$taxon_level = getParameter("level", _DEFAULT_TAXON_LEVEL);

$initial_lat = getParameter("lat", "false");
$initial_lon = getParameter("lon", "false");
$initial_scale = getParameter("scale", "false");
$localize = isLocalizing($initial_lat, $initial_lon, $initial_scale);

//Set locale
$locale = setAppLocale();
//Build localized client strings
$locStrings = buildClientStrings();

?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="<?php echo _GENERIC_LANG_CODE; ?>" lang="<?php echo _GENERIC_LANG_CODE; ?>">
    <head>
        <title><?=_GENERIC_TITLE ?></title>

        <meta http-equiv="Content-Type" content="application/xhtml+xml; charset=UTF-8" />
        <meta http-equiv="Content-Style-Type" content="text/css" />
        <meta http-equiv="Content-Script-Type" content="text/javascript" />
        <meta http-equiv="X-UA-Compatible" content="IE=EmulateIE7"/>
        <meta name="keywords" lang="<?php echo _GENERIC_LANG_CODE; ?>" content="<?php echo _INDEX_META_KEYWORDS; ?>" />
        <meta name="description" lang="<?php echo _GENERIC_LANG_CODE; ?>" content="<?php echo _INDEX_META_DESCRIPTION; ?>" />
        <meta name="author" content="info@geodata.es" />
        <meta name="robots" content="noindex,nofollow" />
        <link type="text/css" href="css/default.css" rel="stylesheet" />
        <link type="text/css" href="css/blue/jquery-ui-1.8.16.custom.css" rel="stylesheet" />
        
		<!--<script type="text/javascript" src="http://maps.googleapis.com/maps/api/js?sensor=false&v=3.6"></script>-->
        <script type="text/javascript" src="js/openlayers-2.13.1/OpenLayers.js"></script>
        <script type="text/javascript" src="js/viewer-3.0/client/egv-init-c.js"></script>
        <script type="text/javascript" src="js/class.infobox.js"></script>
		<script type="text/javascript" src="js/class.infopan.js"></script>
        <script type="text/javascript" src="js/jquery/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="js/jquery/jquery-ui-1.8.16.slide.min.js"></script>
        <!-- we use MENU from jQuery-1.9 because we need to include links -->
        <script type="text/javascript" src="js/jquery/jquery.ui.menu-1.9.js"></script>
        
        <!-- include cartodb.core.js library -->
    	<script src="http://libs.cartocdn.com/cartodb.js/v3/cartodb.core.js"></script>        

        <script type="text/javascript">
            var locale = "<?php echo _GENERIC_LANG_CODE; ?>";
			var availableLocales = "<?php echo _AVAILABLE_LOCALES; ?>";
            var locStrings = <?php echo $locStrings; ?>;
            var serverURL = "<?= $serverURL ?>";

            var taxon_id = "<?= $taxon_id ?>";
            var taxon_level = "<?= $taxon_level ?>";

            <? if($localize) { ?>
                // API localization
                var initial_lat = <?=$initial_lat?>;
                var initial_lon = <?=$initial_lon?>;
                var initial_scale = <?=$initial_scale?>;
                var initial_view = true;
            <? } else { ?>
                var initial_view = false;
            <? } ?>
        </script>

        <script type="text/javascript" src="js/taxon.js"></script>
        <script type="text/javascript" src="js/ui.expo.js"></script>
        <script type="text/javascript" src="js/menu.expo.js"></script>
        <script type="text/javascript" src="js/starter.js"></script>
        <script type="text/javascript" src="js/mi.js"></script>

        <script type="text/javascript">

          var _gaq = _gaq || [];
          _gaq.push(['_setAccount', 'UA-19263423-18']);
          _gaq.push(['_trackPageview']);

          (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
          })();

        </script>

    </head>

    <body>
        
        <div id="divMain" style="visibility:hidden">
            <?php include "sections/section.header.expo.php" ?>
            <?php include "sections/section.top.expo.php" ?>
            <?php include "sections/section.left.php" ?>
            <?php include "sections/section.splitter.php" ?>
            <?php include "sections/section.right.php" ?>
            <?php //include "sections/section.modal.php" ?>
			<div id="divInfoDialog"></div>
        </div>

        <?php include "sections/section.loading.php" ?>
      
    </body>

</html>


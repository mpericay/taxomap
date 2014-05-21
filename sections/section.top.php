<?php

?>

<div id="divTop">
    
    <div id="divTopLeft">
            <div id="divMapSearch" class="search">
                <li>
                <label for="taxon" class="overlabel"><?php echo _TAXON_SEARCH;?></label>
                <input id="taxon" class="searchbox" />
                </li>
            </div>		
    </div>

    <div id="divTopCenter">	
        <!-- <button id="buttonSheet" title="<?php echo _SEE_SHEET_TITLE; ?>"><?php echo _SEE_SHEET; ?></button>-->
        <!--<button id="buttonQuotes" title="<?php echo _DOWNLOAD_ALL_TITLE; ?>"><?php echo _DOWNLOAD_QUOTES; ?></button>-->
		<div id="divButtonQuotes">
			<button id="buttonQuotes" title="<?php echo _DOWNLOAD_ALL_TITLE; ?>"><?php echo _DOWNLOAD_QUOTES; ?></button>
			<button id="buttonQuotesSelect">Triar format</button>
		</div>
		<ul>
			<li><a id="buttonQuotesCSV" href="#"><?php echo _DOWNLOAD_CSV_FORMAT; ?></a></li>
			<li><a id="buttonQuotesKML" href="#"><?php echo _DOWNLOAD_KML_FORMAT; ?></a></li>
			<li><a id="buttonQuotesSHP" href="#"><?php echo _DOWNLOAD_SHP_FORMAT; ?></a></li>
			<li><a id="buttonQuotesSVG" href="#"><?php echo _DOWNLOAD_SVG_FORMAT; ?></a></li>
			<li><a id="buttonQuotesGeoJSON" href="#"><?php echo _DOWNLOAD_GEOJSON_FORMAT; ?></a></li>
		</ul>			
    </div>
	

    <div id="divTopRight">
	        <a href="#" id="aAbout" title="<?php echo _SECTION_ABOUT; ?>"><?php echo _SECTION_ABOUT; ?></a>
			<a href="#" id="aHelp" title="<?php echo _SECTION_HELP; ?>"><?php echo _SECTION_HELP; ?></a>
            <a href="#" id="aLegal" title="<?php echo _SECTION_LEGAL; ?>"><?php echo _SECTION_LEGAL; ?></a>
    </div>

</div>

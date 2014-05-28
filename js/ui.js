var UI = {

    modalHelpWidth: 580,
	modalWidth: 600,
    taxon: null,
    position_infobox: null,
    dialogHeight: 153,
    dialogWidth: 180,
    dialogHeightMinimized: 30,

    initialize: function(){

        this.clearInputElements();

        this.displaySlideBar();

        this.createHelpDiv();

        this.createLegend(); 

        this.createOverview();

        this.createInfoDiv();

        this.createSheetDiv();

        this.createLegalDiv();
		
		this.createAboutDiv();

        // create taxo search
        //this.createTaxoSearch();

        //Register events
        this.registerEvents();

        //Resize elements
        this.resizeElements();
        
        initialize();

        this.createButtons();
		
		this.drawLanguages();

        // this global variables come from mcnb.php API
        this.setTaxon(taxon_id, taxon_level);
        if(initial_view) MI.setInitialView(initial_lat, initial_lon, initial_scale);

    },

    registerEvents: function(){
        
        $("#aHelp").bind("click", function() {
            UI.showModal("Help");
        });

        $("#aLegal").bind("click", function() {
            UI.showModal("Legal");
        });
		
        $("#aAbout").bind("click", function() {
            UI.showModal("About");
        });		

        /*$("#buttonSheet").click(function() {
            UI.showSheet($("#divSheetModal"));
        });*/

        $("#buttonQuotes").click(function() {
            //MI.getQuotes();
            window.open(MI.cartodbTable);
        });
		
		$("#buttonQuotesCSV").click(function() {
            MI.getQuotes(false, "csv");
        });
		
		$("#buttonQuotesKML").click(function() {
            MI.getQuotes(false, "kml");
        });
		
		$("#buttonQuotesSHP").click(function() {
            MI.getQuotes(false, "shp");
        });
		
		$("#buttonQuotesSVG").click(function() {
            MI.getQuotes(false, "svg");
        });
		
		$("#buttonQuotesGeoJSON").click(function() {
            MI.getQuotes(false, "geoJSON");
        });
		
        $('.searchbox').focusout(function () {
        //$(this).prev('label').css('color','#111');
        if ($(this).attr('value') == '') {
        $(this).prev('label').show();
        }
        });

        $('.searchbox').keydown(function () {
        if($(this).attr('value') == '') {
        $(this).prev('label').hide();
        }
        });

        $('.searchbox').keyup(function () {
        if ($(this).attr('value') == '') {
        $(this).prev('label').show();
        //$(this).prev('label').css('color','#999');
        }
        });

    },

    setTaxon: function(taxon_id, level){ 
        
        // make sure that taxon is changing
        if(UI.taxon) {
            if(taxon_id == UI.taxon.id && level == UI.taxon.level) return;
        }
        
        var newTaxon = new Taxon(taxon_id, level);

        //add/change the cartoDB taxon layer
        MI.loadCartodbLayer("select * from mcnb" + newTaxon.getSqlWhere());

        //loading while AJAX request
        Menu.loading();

        // get taxon parents and children
        $.getJSON(MI.cartodbApi,
        {
          q: "SELECT DISTINCT "+newTaxon.getSqlSelect()+" FROM mcnb " + newTaxon.getSqlWhere() + newTaxon.getSqlOrderBy()
        },
        function(data){
            if(data && data.total_rows) {
                if(data.error) {
                    Menu.error(data.msg);
                    return;
                } 
                
                // we must convert from cartodb JSON format (rows) to TaxoMap JSON format (children objects)
                newTaxon.convertFromCartodb(data);
               // update Menu
                Menu.update(newTaxon);
                //create breadcrumb
                $("#divBreadcrumb").html(UI.drawBreadcrumb(newTaxon.tree,0, newTaxon.level));
                //update taxon
                UI.taxon = newTaxon;

                if($("#divInfoDialog").dialog("isOpen") === true) UI.showInfo(MI.infoboxBounds);
                
            } else {
                Menu.error();
            }
        });

        // refresh legend? no need, they are all the same
        //this.refreshLegend();

    },
    
    refreshLegend: function() {
        // if we need different legends for different levels or detail
        $("#divLegend").html("<img src='"+serverURL+"/taxomap/img/legends/"+locale+".png' />");
    },

    drawBreadcrumb: function(childArray, level, maxlevel) {
        level = parseInt(level);// must be a number!
        var data = "";
        data += "<a href=\"javascript:UI.setTaxon('"+childArray['id']+"',"+level+")\"";
        if(level < maxlevel) data += "title=\""+locStrings._generic_activate+" "+childArray['name']+"\"";
        data += ">" + childArray['name'] + "</a>";
        //var data = "<a href='#'>" + childArray['name'] + "</a>";
        if(childArray['children'] && (level < maxlevel)) {
                data += " > ";
                for(var k=0; k<childArray['children'].length; k++) {
                    data += UI.drawBreadcrumb(childArray['children'][k], level+1, maxlevel);
                }
        }
        return data;
    },

     clearInputElements: function(){
        var inputs = document.getElementsByTagName("input");
        var elem;
        for(var i = 0, len=inputs.length; i<len; i++){
            elem = inputs[i];
            if(elem.type == "text" || elem.type == "password")
                elem.value = "";
        }

        var combos = document.getElementsByTagName("select");
        for(i = 0, len=combos.length; i<len; i++){
            combos[i].value = 0;
        }
    },

    resizeElements: function(){
	
        var divMainLeft = document.getElementById("divMainLeft");
        var hideMainLeft = divMainLeft.style.display == "none";
	
        var maxHeight = 900;
        var maxWidth = 1200;

        var hMargin = 10;
        var wMargin = 10;

        //var mapRatio = 0.75;
        var wMainLeft = 211;   // abans 252
        if(hideMainLeft) wMainLeft = 0;
        
        // parent container
        var wContainer = Math.floor($(window).width());
        var hContainer = Math.floor($(window).height());

        //if(hContainer > maxHeight) hContainer = maxHeight;
        //if(wContainer > maxWidth) wContainer = maxWidth;
        
        var tMain = $("#divHeader").height() + $("#divTop").height();
        var hMain = hContainer - tMain - hMargin;
        
        // if left frame is relative size we would have calculated it. But we put value on top
        //var wMainLeft = wContainer - Math.floor(wContainer * mapRatio);
        var wMainRight = wContainer - wMainLeft - $("#divSplitter").width();

        // positioning 3 main elements
        $( "#divMainLeft" ).width(wMainLeft).height(hMain);
        $( "#divMainRight" ).width(wMainRight).height(hMain);
        $( "#divSplitter" ).height(hMain);

        if(hideMainLeft) {
                $( "#divSplitter" ).position({
                of: $( "#divTop" ),
                my: "left top",
                at: "left bottom"
                });
        } else {
                $( "#divSplitter" ).position({
                of: $( "#divMainLeft" ),
                my: "left top",
                at: "right top"
                });
        }

        $( "#divMainRight" ).position({
        of: $( "#divSplitter" ),
        my: "left top",
        at: "right top"
        });

        // i també dels objectes que tenen mida relativa segons la finestra
        //var hMap = hMain - $("#divRightTools").outerHeight() - hMargin;
        $( "#divMap" ).width(wMainRight-wMargin).height(hMain);
        // trick to get margin and padding
        //var wExtra = $('#divRightTools').outerWidth() -  $('#divRightTools').width();
        //$( "#divRightTools" ).width(wMainRight-wMargin-wExtra);
        $( "#divRightTools" ).position({
                of: $( "#divMainRight" ),
                my: "left bottom",
                at: "left top"
        });
		
        $( "#divBaseLayerSwitcher" ).position({
                of: $( "#divMap" ),
                my: "right top",
                at: "right top",
                offset: "-18 10"
        });	

        $( "#divSlideBar" ).position({
                of: $( "#divMap" ),
                my: "right top",
                at: "right top",
                offset: "-15 45"
        });


        $( "#divMapLoading" ).position({
                of: $( "#divMap" ),
                my: "center",
                at: "center"
        });

        // always use PARENT of dialog to reposition
        $("#divHelpModal").parent().position({
           my: "center",
           at: "center",
           of: window
        });

        // IE8 is not repositioning correctly? Maybe will solve in future Jquery versions
        var bottom = $(window).height() - UI.dialogHeight - 30;
        var top = $(window).height() - UI.dialogHeight - 330;
        var right = $(window).width() - UI.dialogWidth - 30;
        var left = $("#divMainLeft").width() + 30;

        if(!$.browser.msie) $("#divOverviewMapContainer").dialog( "option", "position", [left, bottom] );
        // IE workaround
        else {
                $("#divOverviewMapContainer").parent().position({
                   my: "left bottom",
                   at: "left bottom",
                   of: $("#divMap"),
                   offset: "18 -18"
                });
        }

        if(!$.browser.msie) $("#divLegendContainer").dialog("option", "position",[right,bottom]);
        // IE workaround
        else {
                $("#divLegendContainer").parent().position({
                   my: "right bottom",
                   at: "right bottom",
                   of: $("#divMap"),
                   offset: "-18 -18"
                });
        }

        if(!$.browser.msie) $("#divInfoDialog").dialog("option", "position", [right-68,top]);
        // IE workaround
        else {
                $("#divInfoDialog").parent().position({
                   my: "right center",
                   at: "right center",
                   of: $("#divMap"),
                   offset: "-18 -18"
                });
        }

        return false;
    },

    toggleLeftDiv: function(){
        var divMainLeft =  document.getElementById("divMainLeft");
        var value = divMainLeft.style.display == "none";
        var newDisplay = (value) ? "block" : "none";
        divMainLeft.style.display = newDisplay;
        
        var divTopLeft =  document.getElementById("divTopLeft");
        divTopLeft.style.display = newDisplay;

        if(!value){
            document.getElementById("divSplitter").style.backgroundImage = "url('img/splitter/collapsed_s.gif')";
        }else{
            document.getElementById("divSplitter").style.backgroundImage = "url('img/splitter/collapsed_right.gif')";
        }
        var zoomLevel = eGV.getMap().getZoom();
        var center = eGV.getMap().getCenter();
        
	this.resizeElements();

        eGV.getMap().setCenter(center, zoomLevel);
        eGV.getMap().updateSize();

    },

    createHelpDiv: function(){

        $("#divHelpModal").dialog({
                autoOpen: false,
                modal: true,
                draggable: false,
                resizable: false,
                title: locStrings._section_help,
                width: UI.modalHelpWidth
        });

		$.get("sections/ajuda." + locale + ".html", function(data){
            $("#divHelpModal").html(data);
        });

     },

    createSheetDiv: function(){

        $("#divSheetModal").dialog({
                autoOpen: false,
                modal: true,
                draggable: true,
                resizable: true,
                title: locStrings._section_sheet,
                width: 850,
                height: 500,
                close: function() {
                    $("#divSheetModal #content").hide();
                    $("#divSheetModal #loading").show();
                }
        });
     },

     createLegalDiv: function(){

        $("#divLegalModal").dialog({
                autoOpen: false,
                modal: true,
                draggable: true,
                resizable: true,
                title: locStrings._section_legal,
                width: UI.modalWidth
                //height: 400
        });
     },
	 
     createAboutDiv: function(){

        $("#divAboutModal").dialog({
                autoOpen: false,
                modal: true,
                draggable: true,
                resizable: true,
                title: locStrings._section_about,
                width: UI.modalWidth
                //height: 400
        });
     },	 

    createTaxoSearch: function(){
		$( "#taxon" ).autocomplete({
                        b: 300,
			source: "php/geoservices/index.php?op=searchbyname",
			minLength: 3,
			select: function( event, ui ) {
                                // no results found
                                if(!ui.item.id) {
                                    // we prevent the value to be displayed on input
                                    event.preventDefault();
                                    return;
                                }
				if(ui.item) {
                                    UI.setTaxon(ui.item.id, ui.item.level);
                                }
                                else alert("Nothing selected, input was " + this.value);

                                // added
                                $( "#taxon" ).removeClass( "ui-autocomplete-loading" );
			},
			open: function() {
				$( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
			},
			close: function() {
				$( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
			}
		});

      },

      createButtons: function(){
            $("button").button(); // every button is a jquery button widget
	  
			// top dropdown menu
			this.buildDropdownMenu("buttonQuotes");


            $( "#divBaseLayerSwitcher" ).buttonset();
      },
	  
	  buildDropdownMenu: function(id){
	  
		$( "#" + id ).button().next()
				.button({
				text: false,
				icons: {
				primary: "ui-icon-triangle-1-s"
				}
				})
				.click(function() {
					var menu = $( this ).parent().next().show().position({
					my: "left top",
					at: "left bottom",
					of: this
				});
				$( document ).one( "click", function() {
					menu.hide();
				});
				return false;
				})
				.parent()
				.buttonset()
				.next()
				.hide()
				.menu();	

	},
	
    createOverview: function(){

       $("#divOverviewMapContainer").dialog({
            height: UI.dialogHeight,
            width: UI.dialogWidth,
            closeOnEscape: false,
            resizable: false,
            draggable: true,
            title: locStrings._section_overviewmap
        });

        $("#divOverviewMapContainer").prev("div").find(".ui-icon").removeClass("ui-icon-closethick");
        $("#divOverviewMapContainer").prev("div").find(".ui-icon").addClass("ui-icon-carat-1-s");


        $("#divOverviewMapContainer").dialog( { beforeclose: function(event) {

              //returning false prevents overviewMap closing (and we minimize/maximize it)
              if(event.originalEvent==undefined) {
                    // we clicked on "veure normativa", "textos" tab or in a document tree link
                    return true;
              }

              UI.toggleDialog($("#divOverviewMapContainer"), UI.dialogHeight);
              return false;

          }

        });

    },

    toggleDialog: function($dialog, $height) {

        $dialog.toggle();

        var dialogPosition = $dialog.dialog( "option", "position" );

        var overviewDialog = $dialog.parent();

        if( !$dialog.is(':visible') ) {
            dialogPosition[1]+=$dialog.height();
            overviewDialog.css("height", UI.dialogHeightMinimized);
            overviewDialog.find(".ui-icon").removeClass("ui-icon-carat-1-s");
            overviewDialog.find(".ui-icon").addClass("ui-icon-carat-1-n");
        } else {
            dialogPosition[1]-=$dialog.height();
            overviewDialog.css("height", $height);
            overviewDialog.find(".ui-icon").removeClass("ui-icon-carat-1-n");
            overviewDialog.find(".ui-icon").addClass("ui-icon-carat-1-s");
        }

        $dialog.dialog( "option", "position", dialogPosition );
    },

    createLegend: function(){

       $("#divLegendContainer").dialog({
            height: UI.dialogHeight,
            width: UI.dialogWidth,
            closeOnEscape: false,
            resizable: false,
            draggable: true,
            title: locStrings._section_legend
        });

        $("#divLegendContainer").prev("div").find(".ui-icon").removeClass("ui-icon-closethick");
        $("#divLegendContainer").prev("div").find(".ui-icon").addClass("ui-icon-carat-1-s");

        $("#divLegendContainer").dialog( { beforeclose: function(event) {

              //returning false prevents overviewMap closing (and we minimize/maximize it)
              if(event.originalEvent==undefined) {
                    // we clicked on a tab or in a document tree link
                    return true;
              }

              UI.toggleDialog($("#divLegendContainer"), UI.dialogHeight);
              return false;

          }

        });

        // we don't need to refresh the legend at every time, so we set the img here
        this.refreshLegend();

    },

      createInfoDiv: function(){

        $("#divInfoDialog").dialog({
                autoOpen: false,
                draggable: true,
                resizable: false,
                title: locStrings._section_infodialog,
                width: 250,
                height: 250,
				close: function(ev, ui)
                {
                    MI.hideHighlightedGrid();
                }
        });

     },

     showSheet: function(div){

         if(!div) var div = $("#divSheetModal");
         
         div.dialog("open");
         div.dialog("option", "title", this.taxon.getName());
         
         var wiki_url = "http://" + locale + ".wikipedia.org/w/api.php?action=parse&prop=text&section=0&format=json&page="+ this.taxon.getName() + "&contentformat=text%2Fx-wiki&redirects=";
         //var wiki_url = "http://" + locale + ".wikipedia.org/w/api.php?action=query&prop=text&section=0&format=json&page="+ this.taxon.getName() + "&contentformat=text%2Fx-wiki&redirects=";
             
         $.getJSON(wiki_url+"&callback=?", //for JSONP
            {
                //additional params
                //ID: UI.taxon.id
            },
            function(data){
            // parse JSON data
                if(data.parse) UI.drawWikiSheet(div, data);
                else {
                    div.find("#title").html(locStrings._no_results_found);
                    div.find("#desc").html(locStrings._no_results_found +" "+UI.taxon.getName()+ " " + locStrings._at_wikipedia);
                    div.find("#subtitle").hide();
                }
                div.find("#content").show();
                div.find("#loading").hide();
                UI.drawLinksSheet(div, UI.taxon.getName());
        });
             

     },

    showInfo: function(position){

        $("#divInfoDialog").dialog("open");

        MI.getInfoZoomBox($("#divInfoDialog"), position);

        $("#divInfoDialog").html('<img id="imgLoadingInfo" src="img/load_small.gif"/>');


     },
	 
	 drawLanguages: function(){

        // should be in locales or conf file
		var localeNames = {"en": "English", "ca": "Català", "es": "Castellano"};
		
		var arrayLocales = availableLocales.split(",");
		var data = "";
		for(var i=0; i<arrayLocales.length; i++) {
			if(arrayLocales[i] != locale) {
				var name = localeNames[arrayLocales[i]];
				data += '<a href="taxomap.php?lang=' + arrayLocales[i] + '" title="'+ name +'">'+ name +'</a>';
			}
		}
		
		$("#divHeaderLinks").html(data);
		
	 },
	 
	 drawWikiSheet: function(div, data){
	     
         var title = data.parse.title;
         div.find("#title").html(title);
         
         div.find("#subtitle").html(locStrings._sheet_subtitle + " <a href='http://" + locale + ".wikipedia.org/wiki/" + title + "' target='_blank'>"+locStrings._generic_here+"</a>").show();

         // get raw HTML text ... but we need to do a few hacks
         div.find("#desc").html(data.parse.text["*"]);
         
         //HACKS
         //remove links
         $('#desc a').replaceWith(function() {
             return this.childNodes;
         });
         //remove areas (with links)
         $('#desc area').remove();         
         //remove references
         $('#desc .reference ').remove();
         //remove references errors
         $('#desc .mw-ext-cite-error').remove();
         //remove disambiguations 
         //$('#desc .dablink').remove();

     },
     
     drawLinksSheet: function(div, title){
         div.find("#wikispecies").attr("href", "http://species.wikimedia.org/wiki/"+title);
         div.find("#gbif").attr("href", "http://www.gbif.org/species/search?q="+title);
         div.find("#eol").attr("href", "http://www.eol.org/search?q="+title.replace(" ","+"));
     },

    drawInfoResults: function(div, childArray){
        var level = parseInt(UI.taxon.level); // must be a number!
        
        var children= "";
        var totalCount= 0;

        if(childArray.rows) {
                for(var k=0; k<childArray.rows.length; k++) {
                    if(childArray.rows[k]['id'] && UI.taxon.levelsId[level+1]) {
                        children += "<li><a href=\"javascript:UI.setTaxon('"+childArray.rows[k]['id']+"','"+(level+1)+"')\"";
                        children += "title=\""+locStrings._generic_activate+" "+childArray.rows[k]['name']+"\"";
                        children +=">" + childArray.rows[k]['name'] + "</a>";
                        var count = childArray.rows[k]['count'];
                        if(count) {
                            children += ": " + count;
                            totalCount += parseInt(count);
                        }
                        children += "</li>";
                    }
                }
        }
        
        var data = "<ul><li";
        data += " class='main' id='mainInfoLine'";
        data += "><a href=\"javascript:UI.setTaxon('"+UI.taxon.id+"','"+level+"')\">" + this.taxon.getName() + "</a>";
        
        if(totalCount) {
          //there are children
            data += ": " + totalCount;
        } else {
            // no children (last level): first row gives count
            data += ": " + childArray.rows[0]['count'];
        }
        //data += "<a id='infoLink' title='"+locStrings._download_selected_title+"'><span>" + locStrings._generic_download + " <img src='img/fletxa.png' /></span></a>";
        data += "<div id='divInfoButton' class='infoLink'><button id='infoButton' title='"+locStrings._download_selected_title+"'>" + locStrings._generic_download + "</button><button id='infoQuotesSelect'>format</button></div>";
        data += "<ul class='infoLink'><li><a id='infoQuotesCSV' href='#'>"+locStrings._download_csv_format+"</a></li><li><a id='infoQuotesKML' href='#'>"+locStrings._download_kml_format+"</a></li><li><a id='infoQuotesSHP' href='#'>"+locStrings._download_shp_format+"</a></li></ul>";
        data += "</li>";
        
        data += children;
        
        data += "</ul>";
        div.html(data);
		
		$("#divInfoButton").position({
			my: "right top",
			at: "right top",
			of: $("#mainInfoLine")
		});		

        this.buildDropdownMenu("infoButton");
		
		$("#infoButton").click(function() {
            MI.getQuotes(true);
        });
		
		$("#infoQuotesCSV").click(function() {
		    MI.getQuotes(true,"csv");
        });
		
		$("#infoQuotesKML").click(function() {
		    MI.getQuotes(true,"kml");
        });		
		
		$("#infoQuotesSHP").click(function() {
		    MI.getQuotes(true,"shp");
        });			
    },
    
    displaySlideBar: function(){
        var divMain = document.getElementById('divSlideBar');
        if(!divMain) return;
        var spanSliderText = document.createElement("label");
        spanSliderText.setAttribute('class', 'slideLabel');
        var txtNode2 = document.createTextNode(locStrings._transparency_text);
        spanSliderText.appendChild(txtNode2);
        divMain.appendChild(spanSliderText);
        var spanSliderWrapper  = document.createElement("span");
        var divSlider = document.createElement("div");
        divSlider.setAttribute('id', 'idSlider');
        var divSliderInput = document.createElement("div");
        divSliderInput.setAttribute('id', 'idSliderInput');
        divSlider.appendChild(divSliderInput);
        divMain.className = "ui-corner-all";
        spanSliderWrapper.appendChild(divSlider);
        divMain.appendChild(spanSliderWrapper);


        $("#idSlider").slider({
            value: 80,
            slide: function(event, ui) {
                var newOpacity= ($("#idSlider").slider("option", "value"))/100;
                eGV.getControl("controlTransparency").changeOpacities(newOpacity);
            }
        });
    },
	
    showModal: function(id){
        $("#div"+id+"Modal").dialog("open");
    },
	
    showInfoModal: function(id){
        $("#divInfoDialog").dialog("open");
    }	

}

function initializeWrapper(){
    return UI.initialize();
}

//Ask IE
document.namespaces;

$(document).ready (function() {
    initializeWrapper();
});

$(window).bind('resize', function(){
    if (UI) UI.resizeElements();
});

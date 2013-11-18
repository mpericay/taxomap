var UI = {

    modalHelpWidth: 450,
    active_taxon_id: null,
    active_taxon_level: null,
    position_infobox: null,
    dialogHeight: 153,
    dialogWidth: 180,
    dialogHeightMinimized: 30,
    maxLevel: 7,

    initialize: function(){

        this.clearInputElements();

        this.displaySlideBar();

        //this.createHelpDiv();

        this.createLegend();

        this.createOverview();

        this.createInfoDiv();

        this.createSheetDiv();

        // create searchmap
        //this.createCountrySearch();

        // create taxo search
        this.createTaxoSearch();

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

    disableExternalLinks: function(){

		$(".egvControlAttribution").hide();
    },

    registerEvents: function(){

        setTimeout(this.disableExternalLinks, 2000);

        $("#buttonSheet").click(function() {
            $("#divSheetModal").dialog("open");
            //UI.showSheet($("#divSheetModal"));
        });

        $("#buttonQuotes").click(function() {
            MI.getQuotes();
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
        if(taxon_id == UI.active_taxon_id && level == UI.active_taxon_level) return;

        var map = eGV.getMap();
        if(map == null) return;

        // set visible and hidden layers basing on level
        var levels = new Array("domain","kingdom", "phylum", "classe", "ordre", "familia", "genus", "specie");
        var conn = map.getConnection("bioexplora");
        for (var i=0; i<levels.length; i++){
            var layer = conn.getLayerByName(levels[i]);
            // non-existant layers (animalia) are ignored
            if(layer) {
                // only selected level is visible
                if(i == level) {
                    conn.setVisible(layer.name,true);
                    conn.setVisible(layer.name+"_detail",true);
                }
                else {
                    conn.setVisible(layer.name,false);
                    conn.setVisible(layer.name+"_detail",false);
                }
            }
        }

        // set id param in layer
        conn.olLayer.params.id = taxon_id;

        // refresh map
        conn.redraw(true);

        //loading while AJAX request
        Menu.loading();

        // get taxon parents and children
        $.getJSON("php/geoservices/index.php?op=getbreadcrumb",
        {
          LEVEL: level,
          ID: taxon_id,
          CHILDREN: true
        },
        function(data){
            if(data) {
                if(data.error) {
                    Menu.error(data.msg);
                    return;
                }
                var parent = (level == "0") ? null : UI.getJSONValues(data, level-1);
                var child = (level == UI.maxLevel) ? null : UI.getJSONValues(data, level);
                var active_taxon = (child ? child['name'] : parent['children'][0]['name']);
                // update Menu
                Menu.update(parent, child, level);
                
                $("#divBreadcrumb").html(UI.drawBreadcrumb(data,0, level));

                // WHILE SHEET IS IN PROCESS --to be changed to UI.drawSheet
                UI.drawSheetInProcess($("#divSheetModal"), active_taxon);

                UI.active_taxon_id = taxon_id;
                UI.active_taxon_level = level;

                if($("#divInfoDialog").dialog("isOpen") === true) UI.showInfo(UI.position_infobox);

                // delete taxo search? no need
                //$("#taxon").val("");
                
            } else {
                Menu.error();
            }
        });

        // refresh legend? no need, they are all the same
        //this.refreshLegend();

    },
    
    getJSONValues: function (data, level, i) {
       if(!i) i = 0;
       if(level == i) return data;
       else return UI.getJSONValues(data['children'][0], level, i+1);
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

    createSheetDiv: function(){

        $("#divSheetModal").dialog({
                autoOpen: false,
                modal: true,
                draggable: true,
                resizable: true,
                title: locStrings._section_sheet,
                width: 770,
                height: 400
        });
     },

     createCreditsDiv: function(){

        $("#divCreditsModal").dialog({
                autoOpen: false,
                modal: true,
                draggable: true,
                resizable: true,
                title: "Crèdits",
                width: UI.modalHelpWidth
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

    createCountrySearch: function(){
		$( "#country" ).autocomplete({
                        delay: 300,
			source: "php/geoservices/index.php?op=searchcountry",
			minLength: 2,
			select: function( event, ui ) {
                                // no results found
                                if(!ui.item.id) {
                                    // we prevent the value to be displayed on input
                                    event.preventDefault();
                                    return;
                                }
				if(ui.item) {
                                    MI.bringExtent2Center(ui.item.minx, ui.item.miny, ui.item.maxx, ui.item.maxy);
                                }
                                else alert("Nothing selected, input was " + this.value);

                                // added
                                //$( "#country" ).removeClass( "ui-autocomplete-loading" );
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

            $( "#divBaseLayerSwitcher" ).buttonset();
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

        $.getJSON("php/geoservices/index.php?op=getsheet",
            {
            LEVEL: UI.active_taxon_level,
            ID: UI.active_taxon_id
            },
            function(data){
            // parse JSON data
                if(data) UI.drawSheet(div, data);
                else div.html(locStrings._no_results_found+" "+UI.active_taxon_id);
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
				data += '<a href="mcnb.php?lang=' + arrayLocales[i] + '" title="'+ name +'">'+ name +'</a>';
			}
		}
		
		$("#divHeaderLinks").html(data);
		
	 },	 

     drawSheet: function(div, data){
         if(data.name) {
             div.find("#title").html(data.name);
             div.find("#wikispecies").attr("href", "http://species.wikimedia.org/wiki/"+data.name);
             div.find("#gbif").attr("href", "http://secretariat.mirror.gbif.org/occurrences/search.htm?c[0].s=0&c[0].p=0&c[0].o="+data.name);
             div.find("#eol").attr("href", "http://eol.org/api/search/1.0/"+data.name);
         }
         if(data.subtitle) div.find("#subtitle").html(data.title);
         if(data.desc) div.find("#desc").html(data.desc);
         if(data.photo) div.find("#photo").html(data.photo);
         if(data.phototitle) div.find("#photoTitle").html(data.phototitle);
     },

     drawSheetInProcess: function(div, title){
         div.find("#title").html(title);
         div.find("#wikispecies").attr("href", "http://species.wikimedia.org/wiki/"+title);
         div.find("#gbif").attr("href", "http://secretariat.mirror.gbif.org/occurrences/search.htm?c[0].s=0&c[0].p=0&c[0].o="+title);
         div.find("#eol").attr("href", "http://eol.org/api/search/1.0/"+title);
     },

    drawInfoResults: function(div, childArray){
        var level = parseInt(childArray['level']); // must be a number!
        var data = "<ul><li";
        data += " class='main'";
        data += "><a href=\"javascript:UI.setTaxon('"+childArray['id']+"','"+level+"')\">" + childArray['name'] + "</a>";
        if(childArray['value']) data += ": " + childArray['value'];
        //data += "<a id='infoLink' title='"+locStrings._download_selected_title+"'><span>" + locStrings._generic_download + " <img src='img/fletxa.png' /></span></a>";
        data += "</li>";
        if(childArray['children']) {
                for(var k=0; k<childArray['children'].length; k++) {
                    data += "<li><a href=\"javascript:UI.setTaxon('"+childArray['children'][k]['id']+"','"+(level+1)+"')\"";
                    data += "title=\""+locStrings._generic_activate+" "+childArray['children'][k]['name']+"\"";
                    data +=">" + childArray['children'][k]['name'] + "</a>";
                    if(childArray['children'][k]['value']) data += ": " + childArray['children'][k]['value'];
                    data += "</li>";
                }
        }
        data += "</ul>";
        div.html(data);

        $("#infoLink").click(function() {
            MI.getQuotes(MI.getBoundsFromPosition(UI.position_infobox));
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
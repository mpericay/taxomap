var Menu = {

    effect: "slide",
    direction: "left",

    loading: function() {
        $("#taxon-list").html('<img id="imgLoadingStreets" src="img/load_small.gif"/>');
    },

    error: function(message) {
        var data = "<div class='error'>";
        data += locStrings._error_msg;
        if(message) data += ":<br>" + message;
        data += "<br><a href='mcnb.php'>" + locStrings._error_back + "</a>";
        data += "</div>";
        $("#taxon-list").html(data);
    },

    update: function(parent, child, level) {
        level = parseInt(level);// must be a number!
        Menu.direction = (level > UI.active_taxon_level) ? "right" : "left";
        $("#taxon-list ul").menu19("destroy");

        $("#taxon-list").html("<ul></ul>");
        if(level) $("#taxon-list ul").append(Menu.drawParent(parent, level));
        // title (active taxon): last level has no 'child' element, we use 'children of parent'
        var active_taxon = (child ? child['name'] : parent['children'][0]['name']);
        
        var data = "<li class='menuTitle'>";
        data += "<a href=\"javascript:UI.showSheet()\">" + active_taxon + "</a>";
        data += "</li>";
        
        data += "<div class='menuSubtitle'>";
        data += "<a href=\"javascript:UI.showSheet()\" title=\"" + locStrings._see_sheet_title + " " + active_taxon + "\">" + locStrings._see_sheet + "</a>";
        data += "</div>";
        $("#taxon-list ul").append(data);
        if(child && child["children"]) $("#taxon-list ul").append(Menu.drawChildren(child["children"], level));

        $("#taxon-list ul").menu19();
        $("#taxon-list ul").show( Menu.effect, { direction: Menu.direction}, 500);

    },

    drawChildren: function(childArray, parent_level) {
        var level = parseInt(parent_level) + 1;
        var data = "";

        for(var i=0; i<childArray.length; i++) {
            //if no id, we don't want to show the possibility to go further: there's no information
            if(childArray[i]['id']) {
                data += "<li>";
                data += "<a href=\"javascript:UI.setTaxon('"+childArray[i]['id']+"',"+level+")\" title=\""+locStrings._generic_activate+" "+childArray[i]['name']+"\">";
                data += childArray[i]['name'];
                data += '<span class="ui-menu-icon ui-icon ui-icon-carat-1-e"></span>';
                data+= "</a>";
                data += "</li>";
            }
        }

        return data;
    },
    drawParent: function(parent, level) {
        
        //var parent_id = (level) ? parent.id : "Vida";
        var data = "<li class='menuBack'>";
        data += "<a href=\"javascript:UI.setTaxon('"+parent.id+"',"+(level-1)+")\" title=\""+locStrings._generic_activate+" "+parent.name+"\">";
        data += "<span class=\"ui-menu-icon ui-icon ui-icon-carat-1-w\"></span> "+ locStrings._taxon_parent;
        data+= "</a>";
        data += "</li>";
        return data;
    }
};

function Taxon (id, level) {
    
    this.id = id;
    this.level = (parseInt(level));
    this.name = null;
    this.tree = null;
    this.levels = new Array("domain", "kingdom", "phylum", "class", "_order", "family", "genus", "canonicalname","scientificname");
    this.levelsId = new Array("domain", "kingdomid", "phylumid", "classid", "orderid", "familyid", "genusid", "speciesid","subspeciesid");
}

Taxon.prototype.getSqlSelect = function() {
    var sqlSelect = "";
    // we select only until parents and immediate children (if they exist)
    for(var i = 0; i <= this.level+1; i++) {
        if(this.levels[i]) {
            if(sqlSelect) sqlSelect += ",";
            //both levels and levels id
            sqlSelect += this.levels[i];
            sqlSelect += ","+this.levelsId[i];
        }
    }  
    
    return sqlSelect;
};

Taxon.prototype.getSqlWhere = function() {
    return " where " + this.levelsId[this.level] + "='" + this.id + "'";
};

Taxon.prototype.getSqlOrderBy = function() { 
    return " order by " + (this.levelsId[this.level+1] ? this.levelsId[this.level+1] : this.levelsId[this.level]); //order children (if not last level)
};

Taxon.prototype.convertFromCartodb = function(cartoResult) {
    var rows = cartoResult.rows;
    var children = new Array();
    
    //add children
    for(var i = 0; i < rows.length; i++) {
        children[i] = this.convertElement(rows[i], this.level + 1);
    }
    
    //add active taxon
    var taxon = this.convertElement(rows[0], this.level);
    taxon.children = children;
    
    //add parents recursively
    for(var j = this.level -1; j >= 0 ; j--) {
        taxon = this.addParent(taxon, j, rows);
    }         
    this.tree = taxon;
};

Taxon.prototype.convertElement = function(row, level) {
    var el = new Object();
    el.id = row[this.levelsId[level]];
    el.name = row[this.levels[level]];
    el.parent = row[this.levelsId[level-1]]; 
    return el;
};

Taxon.prototype.addParent = function(children, num, cartoResult) {
    var parent = this.convertElement(cartoResult[0], num);
    parent.children = new Array();
    parent.children[0] = children;
    return parent;
};
 
Taxon.prototype.getId = function() {
    return this.id;
};

Taxon.prototype.getJSONValues = function (data, level, i) {
    if(!i) i = 0;
    if(level == i) return data;
    else return this.getJSONValues(data['children'][0], level, i+1);
};


Taxon.prototype.getParent = function() {
    return (this.level == 0) ? null : this.getJSONValues(this.tree, this.level-1);
};

Taxon.prototype.getChild = function() {
    return (this.level == (this.levels.length -1)) ? null : this.getJSONValues(this.tree, this.level);
};

Taxon.prototype.getName = function() {
    var child = this.getChild();
    if(child) {
        return child['name'];
    } else {
        var parent = this.getParent();
        return parent['children'][0]['name'];
    }
};

Taxon.prototype.getSqlSearch = function(term) {
    var sqlSelect = "";
    // we select all levels except last
    var maxLevel = this.levels.length - 1;
    for(var i = 0; i < maxLevel; i++) {
        if(sqlSelect) sqlSelect += " UNION ";
        //both levels and levels id
        sqlSelect += "SELECT DISTINCT " + this.levels[i] + " AS label";
        sqlSelect += "," + this.levelsId[i] + " AS id,";
        sqlSelect += i + " AS level";
        sqlSelect += " FROM mcnb WHERE UPPER(" + this.levels[i] + ") LIKE UPPER('" + term + "%')";       
    }
    sqlSelect += " ORDER BY label"
    
    return sqlSelect;
};
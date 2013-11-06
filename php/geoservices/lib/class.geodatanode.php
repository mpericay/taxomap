<?php
require_once("lib/logger/class.logger.php");
require_once("lib/db/class.gdatabase.php");
require_once("lib/encodeco/class.encodeco.php");
require_once("../conf.php");

class geodatanode {

    public $ready = false;
    public $maxlevel = 7;
    private $profile = false;
    private $mode = false;
    private $format = false;
    private $result = false;
    private $debug = false;
    private $log = null;
    private $db = null;
    private $levels = false;
    private $operation = false;
    private $config = false;
	private $returnbox = true;


    /**
     * Street search object constructor
     * @constructor
     * @return boolean True if handlers were found, false otherwise
     */
    public function __construct($profile = false) {

        //Debug mode?
        $this->debug = (strtolower($this->getParameter("DEBUG")) == "true");

        //If no profile provided, get it from the request parameters
        $this->profile = $this->getParameter("PROFILE");
        if (!$this->profile) {
            //$this->logError("geodatanode::__construct - Parameter missing [PROFILE]");
            $this->profile = "mcnb";
        }

        //Set logger object
        $this->log = $this->setLoggerObject();

        //Get profile configuration
        $this->getConfig();
        if (!$this->config) {
            $this->logError("geodatanode::__construct - Could not get configuration for this profile [".$this->profile."]");
            return false;
        }

        //Get operation and mode
        $this->operation = $this->getParameter("OP");
        if (!$this->operation) {
            $this->logError("geodatanode::__construct - Parameter missing [OP]");
            return false;
        }

        //Set DB object
        $this->setDBObject();
        if (!$this->db) {
            $this->logError("geodatanode::__construct - Could not set DB connection");
            return false;
        }

        //Output format
        $this->format = $this->getParameter("FORMAT",_GEODATANODE_OUTPUT_FORMAT);
        $this->ready = true;
        return true;

    }

    /**
     * Street search object destroyer
     * @destructor
     * @return nothing
     */
    public function __destruct() {
        if ($this->db) $this->db->close();
    }

/**
 * Removes all the temporary files
 * @return boolean True if the file was succesfully updated, false if errors were found
 */

    function __clearCache($dir) {
        $limitHour = time() - 3 * 60 * 60;
		//die($dir);
        if (is_dir($dir)) {
            if(!$dh = @opendir($dir)) return false;
            while (false !== ($obj = readdir($dh))) {
                if($obj=='.' || $obj=='..') continue;
                if (is_dir($dir.$obj)) continue;
                $info = pathinfo($dir.$obj);
                // we want to remove CSV and KML (all file extensions)
				//if ($info["extension"] != "csv") continue; 
                if (filemtime($dir."/".$obj) < $limitHour) {
                    if (!@unlink($dir.'/'.$obj)) return false;
                }
            }
        }
        return true;
    }

    private function getConfig() {
        $file = _GEODATANODE_CONFIG_DIR.$this->profile.".ini";
        if (file_exists($file)) {
            $profileConf = parse_ini_file($file,true);
            $defaultConf = parse_ini_file(_GEODATANODE_DEFAULT_CONFIG_FILE,true);
            $this->config = $this->extend($profileConf,$defaultConf);
        } 
        else {
            return false;
        }
        return true;
    }


    private function setDBObject() {

        if (!$this->config) return false;
        $config = $this->config;
        $db = new gDatabase(
            $config["dbtype"],
            $config["dbhost"],
            $config["dbname"],
            $config["dbuser"],
            $config["dbpass"],
            $config["dbport"]
        );

        if (!$db->connect()) {
            return false;
        }
        $this->db = $db;

        //Return associative arrays only
        $this->db->set_fetcharraymode(1);

        return true;

    }


    private function setLoggerObject() {
        $log = new logger();
        if (!$log->init(_GEODATANODE_LOG_FILE)) {
            return false;
        }
        return $log;
    }


    private function logError($msg) {
        if ($this->log) {
            $this->log->add($msg);
        }
        if ($this->debug) {
            echo $msg;
        }

        $this->__destruct();
        $this->result = array("error" => 1, "msg" => $msg);
        $this->output = $this->getResultJSON();
        $this->outputResults();
        die();
    }


    private function getParameter($name, $default = false, $from = false) {
        if ($from === false) $from = $_REQUEST;
        reset($from);
        while (list($key, $value) = each($from)) {
            if (strcasecmp($key, $name) == 0) return $value;
        }
        return $default;
    }


    private function extend($array,$defArray) {
        foreach ($defArray as $key => $value) {
            if (isset($array[$key]) && gettype($array[$key]) == "array") {
                $array[$key] = $this->extend($array[$key],$defArray[$key]);
            } else if (!isset($array[$key]) || !$array[$key]) {
                    $array[$key] = $defArray[$key];
                }
        }
        return $array;
    }


    private function arraySearchRecursive($needle,$haystack) {
        foreach($haystack as $key => $value) {
            $current_key=$key;
            if($needle===$value || (is_array($value) && $this->arraySearchRecursive($needle,$value) !== false)) {
                return $current_key;
            }
        }
        return false;
    }


    private function executeSQL($sql,$getRecords) {
        if ($rs = $this->db->query($sql)) {
            if ($getRecords) {
                $records = array();
                while ($record = $this->db->fetch_array($rs)) {
                    $records[] = $record;
                }
                $out = (count($records)) ? $records : 0;
            } else {
                $out = true;
            }
            $this->db->free($rs);
        } else {
            $out = false;
        }
        return $out;
    }


    public function handle() {
        
        if (!$this->ready) {
            $this->logError("geodatanode::handle - Service not ready");
            return false;
        }

        switch ($this->operation) {

            case "getnodes":
                // was used to get whole recursive tree: not used anymore by client app (menu is AJAX, uses getbreadcrumb)
                $level = $this->getParameter("LEVEL");
                $depth = $this->getParameter("DEPTH");
                $id = $this->getParameter("ID");
                $this->result = $this->getNodes($level,$depth,$id);
                if ($this->result === false) {
                    $this->logError("geodatanode::handle - Error in getNodes [".$this->db->get_error_description()."]");
                    return false;
                }
                break;

            case "searchbyname":
                $name = $this->getParameter("TERM");
                $this->result = $this->searchByName($name);
                if ($this->result === false) {
                    $this->logError("geodatanode::handle - Error in searchByName [".$this->db->get_error_description()."]");
                    return false;
                }
                break;

            case "searchcountry":
                $name = $this->getParameter("TERM");
                $this->result = $this->searchCountry($name);
                if ($this->result === false) {
                    $this->logError("geodatanode::handle - Error in searchCountry [".$this->db->get_error_description()."]");
                    return false;
                }
                break;

            case "getinfobox":
                $level = $this->getParameter("LEVEL");
                $id = $this->getParameter("ID");
                $bbox = $this->getParameter("BBOX");
                $grid = $this->getParameter("GRID");
                //we need to get $level=0, $id = 0!!!
                /*
                if(!$level || !$id) {
                    $this->logError("geodatanode::handle - Error in getInfoBox [Required parameters id, level missing]");
                    return false;
                }
                 * */
                $this->result = $this->getInfoBox($level,$id,$bbox,$grid);
                if ($this->result === false) {
                    $this->logError("geodatanode::handle - Error in getInfoBox [".$this->db->get_error_description()."]");
                    return false;
                }
                break;
            case "getsheet":
                $level = $this->getParameter("LEVEL");
                $id = $this->getParameter("ID");
                if(!$level || !$id) {
                    $this->logError("geodatanode::handle - Error in getSheet [Required parameters id, level missing]");
                    return false;
                }
                $this->result = $this->getSheet($level,$id);
                if ($this->result === false) {
                    $this->logError("geodatanode::handle - Error in getSheet [".$this->db->get_error_description()."]");
                    return false;
                }
                break;

            case "getbreadcrumb":
                $level = $this->getParameter("LEVEL");
                $id = $this->getParameter("ID");
                $children = $this->getParameter("CHILDREN") != 'false';
                //we need to get $level=0, $id = 0!!!
                /*
                if(!$level || !$id) {
                    $this->logError("geodatanode::handle - Error in getBreadcrumb [Required parameters id, level missing]");
                    return false;
                }
                */
                $this->result = $this->getBreadcrumb($level,$id, $children);
                if ($this->result === false) {
                    $this->logError("geodatanode::handle - Error in getBreadcrumb [".$this->db->get_error_description()."]");
                    return false;
                }
                break;

            case "getquotes":
                $level = $this->getParameter("LEVEL");
                $id = $this->getParameter("ID");
                $bbox = $this->getParameter("BBOX");
                $grid = $this->getParameter("GRID");
				$format = $this->getParameter("FORMAT");
                //we need to get $level=0 (Animalia)!!!
                if(!$id) {
                    $this->logError("geodatanode::handle - Error in getQuotes [Required parameters id, level missing]");
                    return false;
                }
                $this->result = $this->getQuotes($level,$id,$bbox, $grid, $format);
                if ($this->result === false) {
                    $this->logError("geodatanode::handle - Error in getQuotes [".$this->db->get_error_description()."]");
                    return false;
                }
                // Return directly (don't process like JSON)
                else{
                    echo $this->result;
                    //return $this->result;
                    return true;
                }
                break;

        }
        return $this->getResult();
    }


    private function getLevels() {
        //Build SQL
        $sql = "";

        // get levels
        $sql = "SELECT table_name, level_id, parent_level_id, level_name FROM level ORDER BY id";
        $tables = $this->executeSQL($sql,true);

        return $tables;
    }


    private function getAllChildren($parent_id = false, $level = 1, $maxlevel = false) {

        // we assume we loaded the table info
        if(!$this->levels) $this->levels = $this->getLevels();
        $tables = $this->levels;

        if(!$maxlevel || $maxlevel > count($tables)-1) $maxlevel = count($tables)-1;

        // select children
        $sql = "SELECT ".$tables[$level]['level_id'].", ".$tables[$level]['level_name']." AS name FROM ".$tables[$level]['table_name'];
        if($parent_id) $sql .= " WHERE ".$tables[$level]['parent_level_id']."='".$parent_id."'";
        $sql .= " ORDER BY name";

        $result = $this->executeSQL($sql,true);

        if(!$result) return false;

        // go for grandchildren
        if($level < $maxlevel) {
            for($i=0; $i<count($result); $i++) {
                $result[$i]["children"] = $this->getAllChildren($result[$i]['id'], $level+1,$maxlevel);
            }
        }
        return $result;
    }


    public function getParent($child, $level) {

        if(!$this->levels) $this->levels = $this->getLevels();

        $id = $child['id'];
        $parent_id = $child['parent'];

        $sql = "SELECT ";
        if($this->levels[$level]['parent_level_id']) $sql .= $this->levels[$level]['parent_level_id']." AS parent,";
        $sql .= "id, ".$this->levels[$level]['level_name']." AS name FROM ".$this->levels[$level]['table_name']." WHERE ".$this->levels[$level]['level_id']."='".$parent_id."'";
        $lastchild = $this->executeSQL($sql,true);
        if(!$lastchild) $resultchild = $this->getGod(array($child));
        else $resultchild = array("id"=> $lastchild[0]['id'], "name"=>$lastchild[0]['id'], "parent" => $lastchild[0]['parent'], "children"=>array($child));

        return $resultchild;

    }


    public function getBreadcrumb($level = false, $id = false, $getchildren = false) {

        if (!$this->ready) {
            $this->logError("geodatanode::getBreadcrumb - Service not ready");
            return false;
        }

        if(!$this->levels) $this->levels = $this->getLevels();

        // add children?
        if($getchildren) $children = $this->getAllChildren($id, $level+1, $level+1);
        
        if(!$level) return $this->getGod($children);

        $sql = "SELECT ";
        if($this->levels[$level]['parent_level_id']) $sql .= $this->levels[$level]['parent_level_id']." AS parent,";
        $sql .= $this->levels[$level]['level_id']." AS id, ".$this->levels[$level]['level_name']." AS name FROM ".$this->levels[$level]['table_name']." WHERE id='".$id."'";
        $lastchild = $this->executeSQL($sql,true);
        // check for errors
        if(!$children && !$lastchild) $this->logError("geodatanode::getBreadcrumb - Taxon with id ".$id." and level ".$level." does not exist");
        $result = array("id"=> $lastchild[0]['id'], "name"=>$lastchild[0]['name'], "parent"=>$lastchild[0]['parent']);
        // add children?
        if($getchildren) $result["children"] = $children;

        //go for ancestors
        $level -= 1;
        while($level > -1) {
            $result = $this->getParent($result,$level);
            $level -= 1;
        }

        return $result;

    }
    
    public function getGod($children) {

        $god = $this->executeSQL("SELECT domain_id FROM kingdom",true);
    	$result = array("id"=> $god[0]["domain_id"], "name"=>$god[0]["domain_id"], "children"=>$children);
        return $result;

    }    

    public function getGridSelection($bbox, $grid_suffix) {

        $grid_table = "grid";
        if($grid_suffix) $grid_table .= "_".$grid_suffix;
        $coords = explode(",", $bbox);
        $leftbottom = $coords[0].",".$coords[1];
        $righttop = $coords[2].",".$coords[3];

        // why must I cast both to 4326???
        $sql = "SELECT gid AS id FROM ".$grid_table." WHERE ST_Intersects(ST_SetSRID(the_geom,4326), ST_SetSRID(ST_MakeBox2D(ST_Point(".$leftbottom."),ST_Point(".$righttop.")),4326))";
        $gridcodes = $this->executeSQL($sql,true);

        return $gridcodes;

    }
	
    public function getGridExtent($gridcodes, $grid_suffix) {

        $grid_table = "grid";
        if($grid_suffix) $grid_table .= "_".$grid_suffix;
		
        // concatenate gridcodes for 'in' statement
        for($i=0; $i<count($gridcodes); $i++) {
            $gridlist .= $gridlist ? ", ".$gridcodes[$i]['id'] : $gridcodes[$i]['id'];
        }		
		
		$sql = "SELECT 
            ST_XMin(ST_Extent(the_geom)) AS minx,
            ST_XMax(ST_Extent(the_geom)) AS maxx,
            ST_YMin(ST_Extent(the_geom)) AS miny,
            ST_YMax(ST_Extent(the_geom)) AS maxy		
			FROM ".$grid_table." WHERE gid IN (".$gridlist.")";
		$gridextent = $this->executeSQL($sql,true);
		
		return $gridextent[0];
	}		


    public function getInfoBox($level, $id, $bbox = false, $grid = "") {

        $depth = 1;

        if (!$this->ready) {
            $this->logError("geodatanode::getInfoBox - Service not ready");
            return array("status"=>"error");
        }

        if($bbox) $gridcodes = $this->getGridSelection($bbox, $grid);

        if(!$this->levels) $this->levels = $this->getLevels();

        // concatenate gridcodes for 'in' statement
        for($i=0; $i<count($gridcodes); $i++) {
            $gridlist .= $gridlist ? ", ".$gridcodes[$i]['id'] : $gridcodes[$i]['id'];
        }
        
        // get parent count (we could get it from sum of children totals on recordset but not for specie (has no children)
        $sql = "SELECT MAX(g.id) AS id";
        if($level == $this->maxlevel) $sql .= ", MAX(l.scientific_name) AS name";
        else $sql .= ", MAX(g.id) AS name";
        $sql .= ", SUM(g.ct) AS value";
        $sql .= " FROM v_".$this->levels[$level]['table_name']."_grid";
        //add grid suffix if needed (for querying grid_detail
        if($grid) $sql .= "_".$grid;
        $sql .= " g ";
        // we need an extra join for the name to get level 7 (level 6 children) name
        if($level == $this->maxlevel) $sql .= " INNER JOIN ".$this->levels[$level]['table_name']." l ON g.id = l.".$this->levels[$level]['level_id'];
        if($gridlist) $sql .= " WHERE g.gid IN (".$gridlist.")";
        if($level != 0) {
        	$sql .= " AND g.".$this->levels[$level]['level_id']." ='".$id."'";
        }
        $sql .= " GROUP BY g.".$this->levels[$level]['level_id'];

        $parent = $this->executeSQL($sql,true);

        // if there are children levels (not last level) and parent got results
        if($this->levels[$level+1]['table_name'] && $parent) {

            //$sql = "SELECT MAX(g.".$this->levels[$level+2]['parent_level_id'].") AS id, MAX(g.".$this->levels[$level+2]['parent_level_id'].") AS name, SUM(g.ct) AS value";
            $sql = "SELECT MAX(g.id) AS id";
            // we need an extra join for the name to get level 7 (level 6 children) name
            if($level == $this->maxlevel-1) $sql .= ", MAX(l.scientific_name) AS name";
            else $sql .= ", MAX(g.id) AS name";

            $sql.= ", SUM(g.ct) AS value";
            $sql .= " FROM v_".$this->levels[$level+1]['table_name']."_grid";
            //add grid suffix if needed (for querying grid_detail
            if($grid) $sql .= "_".$grid;
            $sql .= " g ";
            //join parent table
            $sql .= " INNER JOIN ".$this->levels[$level+1]['table_name']." t ON g.id = t.".$this->levels[$level+1]['level_id'];
            // we need an extra join for the name to get level 7 (level 6 children) name
            if($level == $this->maxlevel-1) $sql .= " INNER JOIN ".$this->levels[$level+1]['table_name']." l ON g.id = l.".$this->levels[$level]['level_id'];

            $sql .= " WHERE t.".$this->levels[$level+1]['parent_level_id']." ='".$id."'";
            if($gridlist) $sql .= " AND g.gid IN (".$gridlist.")";
            $sql .= " GROUP BY t.".$this->levels[$level+1]['level_id']." ORDER BY value DESC";

            $children = $this->executeSQL($sql,true);
         // end if children
         }

/*
        for($i=0; $i<count($children); $i++) {
            $total += $children[$i]['value'];
        }
 */

        if($parent[0]) {
			$result = array("status"=>"success", "id"=> $parent[0]['id'], "name"=>$parent[0]['name'], "level"=>$level, "value"=>$parent[0]['value'], "children"=> $children);
		} else {
			$result = array("status"=>"nothingfound");
		}

		if($this->returnbox) $result["extent"] = $this->getGridExtent($gridcodes, $grid);

        return $result;

    }


    public function getNodes($level = false, $depth = false, $id = false) {

        if (!$this->ready) {
            $this->logError("geodatanode::getNodes - Service not ready");
            return false;
        }

        if(!$this->levels) $this->levels = $this->getLevels();

        //get children
        if($depth) $maxlevel = $level + $depth;
        $children = $this->getAllChildren($id,$level+1,$maxlevel);

        //get daddy. COOL
        if($id) {
            $sql = "SELECT ".$this->levels[$level]['level_id'].", id AS name FROM ".$this->levels[$level]['table_name']." WHERE id='".$id."'";
            $currentlevel = $this->executeSQL($sql,true);
            $result = array("id"=> $currentlevel[0]['id'], "name"=>$currentlevel[0]['id'], "level"=>$level, "children"=> $children);
        } else {
            $result = $this->getGod($children);
        }

        return $result;
    }

    public function searchByName($name) {
         if (!$this->ready) {
            $this->logError("geodatanode::searchByName - Service not ready");
            return false;
        }

        if(!$this->levels) $this->levels = $this->getLevels();

        $result = array();

        // search on every level
        for($i = 0; $i < count($this->levels); $i++) {
            if($this->levels[$i]['table_name']) {
                $sql = "SELECT ".$i." AS level, ".$this->levels[$i]['level_id']." AS id, ".$this->levels[$i]['level_name']." AS label FROM ".$this->levels[$i]['table_name']." WHERE UPPER(".$this->levels[$i]['level_name'].") LIKE UPPER('".$name."%')";
                $currentlevel = $this->executeSQL($sql,true);
                if($currentlevel) {
                    for($j = 0; $j < count($currentlevel); $j++) {
                        array_push($result, $currentlevel[$j]);
                    }
                }
            }
        }

        if(!$result) $result = array(array("id"=>0, "label"=>"No s'ha trobat: ".$name));

        return $result;
    }

    public function searchCountry($name, $lang = "ca") {
         if (!$this->ready) {
            $this->logError("geodatanode::searchCountry - Service not ready");
            return false;
        }

        $result = array();

        $sql = "SELECT ".$lang." AS label, fips AS id, 
            ST_XMin(st_box3d(the_geom)) AS minx,
            ST_XMax(st_box3d(the_geom)) AS maxx,
            ST_YMin(st_box3d(the_geom)) AS miny,
            ST_YMax(st_box3d(the_geom)) AS maxy
            FROM countries WHERE UPPER(unaccent_string(".$lang.")) LIKE UPPER(unaccent_string('".$name."%'))";

        $countrieslist = $this->executeSQL($sql,true);
        if($countrieslist) {
            for($i = 0; $i < count($countrieslist); $i++) {
                array_push($result, $countrieslist[$i]);
            }
        }

        if(!$result) $result = array(array("id"=>0, "label"=>"No s'ha trobat: ".$name));

        return $result;
    }

    public function getSheet($level = false, $id = false) {

        if (!$this->ready) {
            $this->logError("geodatanode::getSheet - Service not ready");
            return false;
        }

        if (!$this->levels) $this->levels = $this->getLevels();

        //get title (provisional)
        if($id || $level) {
            $sql = "SELECT table_name, level_id FROM level WHERE id=".$level;
            $table = $this->executeSQL($sql,true);
            $sql = "SELECT ".$this->levels[$level]['level_name']." AS id FROM ".$table[0]['table_name']." WHERE ".$table[0]['level_id']."='".$id."'";
            $info = $this->executeSQL($sql,true);
            $result = array("name"=> $info[0]['id']);
        } else {
            return false;
        }

        return $result;
    }

    public function getQuotes($level = 0, $id = false, $bbox = false, $grid = '', $format = 'csv') {

        $this->__clearCache(_GEODATANODE_TEMP_DIR);

        if (!$this->ready) {
            $this->logError("geodatanode::getQuotes - Service not ready");
            return false;
        }

        if (!$this->levels) $this->levels = $this->getLevels();

        // why not in UTF-8????
        $sql = "SET NAMES 'LATIN1'";
        $species = $this->executeSQL($sql,false);

        // Get list of species, to search in quote table, looking view v_specie_tree
        $sql = "SELECT id FROM v_specie_tree ";
        if ($level == $this->maxlevel) $sql.= "WHERE ".$this->levels[$level]['level_id']." = ".$id;
        else if($level) $sql.= "WHERE ".$this->levels[$level+1]['parent_level_id']." = '".$id."'";
        $species = $this->executeSQL($sql,true);

        // concatenate list of species for 'in' statement
        for($i=0; $i<count($species); $i++) {
            $specieslist .= $specieslist ? ", ".$species[$i]['id'] : $species[$i]['id'];
        }

        if(!$specieslist) return false;
		
		// get quotes from this list of species
		$sql = "SELECT q.id,
					   s.scientific_name,
					   q.longitude,
					   q.latitude,
					   q.coordinate_precision AS precision,
					   q.country,
					   q.state_province,
					   q.county,
					   q.locality
					   FROM specie s ";
			
		// we need the specie name!
		$sql.= " LEFT JOIN quote q ON q.specie_id = s.id ";
		if ($level != 0) $sql.= "WHERE specie_id in (".$specieslist.")";
		else $sql.= "WHERE specie_id IS NOT NULL";
		
		if($bbox) {
			$gridcodes = $this->getGridSelection($bbox, $grid);
			// concatenate gridcodes for 'in' statement
			for($i=0; $i<count($gridcodes); $i++) {
				$gridlist .= $gridlist ? ", ".$gridcodes[$i]['id'] : $gridcodes[$i]['id'];
			}
			if($grid) $sql .= " AND grid_".$grid."_id";
			else $sql .= " AND grid_id";
			$sql .= " in (".$gridlist.")";
		}
		//limit number? or limit after querying, when building CSV?
		$sql .= " LIMIT "._MAX_QUOTES;
		
		switch($format) {
			case "kml":
				$quotes = $this->executeSQL($sql,true);
				$namefile = $this->buildKML($quotes);
				break;
			case "shp":
				$namefile = $this->buildSHP($sql);
				break;				
			case "csv":
			default:
				$quotes = $this->executeSQL($sql,true);
				$namefile = $this->buildCSV($quotes);
				break;
		}
		
        if (!$namefile) {
            $this->logError("geodatanode::getQuotes - Couldn't generate ".$format." file");
            return false;
        }		
        
        // Download file
        $buffer = $this->xget_file_contents(_GEODATANODE_TEMP_DIR.$namefile);
		
		//header("Content-type: application/vnd.google-earth.kmz");		
		header('Content-Type: application/x-zip');
        $header2 = "Content-Disposition: attachment; filename=".$namefile;
        header($header2);
		
        return $buffer;

    }
	
	private function buildSHP($sql) {
	
		
		$name = date ("YmdHis");
		$namefile = $name.".zip";

		$command = $this->buildOGR2OGR($name, $sql);

		exec($command, $output, $error);
		
		if ($error) {
            $this->logError("geodatanode::ogr2ogr error: ".$error);
            return false;
		}	
		
		// Build ZIP file
		$zip = new ZipArchive();
		
		if ($zip->open(_GEODATANODE_TEMP_DIR.$namefile, ZIPARCHIVE::CREATE)!==TRUE) {
		    exit("cannot open \n");
		}
		
		if(!($zip->addFile(_GEODATANODE_TEMP_DIR.$name.".shp", $name.".shp")
			&& $zip->addFile(_GEODATANODE_TEMP_DIR.$name.".shx", $name.".shx")
			&& $zip->addFile(_GEODATANODE_TEMP_DIR.$name.".dbf", $name.".dbf")
			&& $zip->addFile(_GEODATANODE_TEMP_DIR.$name.".prj", $name.".prj"))) return false;

		$zip->close();	
		
		return $namefile;
	}
	
	private function buildOGR2OGR($name, $sql) {
		
		$command = _OGR2OGR.' ';
		$command .= _GEODATANODE_TEMP_DIR.$name.".shp";
		$command .= ' PG:"host='._DB_HOST;
		$command .= ' user='._DB_USER;
		$command .= ' dbname='._DB_NAME;
		$command .= ' password='._DB_PWD.'"';
		
		//hack: falta geometria
		$sql = str_replace("SELECT", "SELECT q.the_geom, ", $sql);
		
		$command .= ' -sql "'.$sql.'"';
		
		return $command;
	}
	
	private function buildKML($quotes) {
	
		// Creates an array of strings to hold the lines of the KML file.
		$kml = array('<?xml version="1.0" encoding="ISO-8859-1"?>');
		$kml[] = '<kml xmlns="http://earth.google.com/kml/2.1">';
		$kml[] = ' <Document>';
		$kml[] = ' <Style id="greenStyle">';
		$kml[] = ' <IconStyle id="green">';
		$kml[] = ' <Icon>';
		$kml[] = ' <href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href>';
		$kml[] = ' </Icon>';
		$kml[] = ' </IconStyle>';
		$kml[] = ' </Style>';
		
		//print_r($quotes);die();

		// Iterates through the rows, printing a node for each row.
		for($i=0; $i<count($quotes); $i++) {
		  $lat = str_replace(",", ".", $quotes[$i]['latitude']);
		  $long = str_replace(",", ".", $quotes[$i]['longitude']);
		  
		  if($lat && $long) {
			  $desc = $quotes[$i]['locality'];
			  if($desc) $desc .= $quotes[$i]['country'] ? ' (' . $quotes[$i]['country'] . ')' : '';
			  
			  $kml[] = ' <Placemark id="' . $quotes[$i]['id'] . '">';
			  $kml[] = ' <name>' . htmlspecialchars($quotes[$i]['scientific_name']) . '</name>';
			  if($desc) $kml[] = ' <description>' . htmlspecialchars($desc) .  '</description>';
			  //$kml[] = ' <styleUrl>#' . ($row['type']) .'Style</styleUrl>';
			  $kml[] = ' <styleUrl>#greenStyle</styleUrl>';
			  $kml[] = ' <Point>';
			  $kml[] = ' <coordinates>' . $long . ','  . $lat . '</coordinates>';
			  $kml[] = ' </Point>';
			  $kml[] = ' </Placemark>';
		   }
		 
		} 

		// End XML file
		$kml[] = ' </Document>';
		$kml[] = '</kml>';
		$kmlOutput = join("\n", $kml);
		
		// Build KML file
		/*
		header('Content-type: application/vnd.google-earth.kml+xml');
		$name = date ("YmdHis");
		$namefile = $basedir.$name.".kml";
		$file = fopen($namefile, "w+");
		if (!$file) {
			die("Cannot open file ($namefile)");
			return false;
		}
		fwrite($file, $kmlOutput);
		fclose($file);*/

		// Build directly KMZ file
		$zip = new ZipArchive();
		$name = date ("YmdHis");
		$namefile = $name.".kmz";
		//	die($namefile);
		
		if ($zip->open(_GEODATANODE_TEMP_DIR.$namefile, ZIPARCHIVE::CREATE)!==TRUE) {
		    exit("cannot open \n");
		}
		
		$zip->addFromString($name.".kml", $kmlOutput);
		$zip->close();	
		
		return $namefile;		
	}
	
	private function buildCSV($quotes) {

		$result = '';
		$fieldlist = array(
			   "id" => "Specimen Id",
			   "scientific_name" => "Scientific Name",
			   "longitude" => "Longitude",
			   "latitude" => "Latitude",
			   "coordinate_precision" => "Coordinate Precision",
			   "country" => "Country",
			   "state_province" => "State Province",
			   "county" => "County",
			   "locality" => "Locality");
			   
		//draw fields
		foreach ($quotes[0] as $camp => $columna){
			//aliases
			if($fieldlist[$camp]) {
				$camp = $fieldlist[$camp];
			}
			$result.= $result ? ";".$camp : $camp;
		}

		for($i=0; $i<count($quotes); $i++) {
			$quote = '';
			foreach ($quotes[$i] as $camp => $columna){
				$quote.= $quote ? ";".$columna : $columna;
			}
			$result.= $result ? "\n".$quote : $quote;
		}
		if($i == _MAX_QUOTES) $result.= "\nEl nombre de registres excedeix el maxim. Es mostren els primers "._MAX_QUOTES." resultats";

		// Build CSV file
		$name = date ("YmdHis");
		$namefile = $name.".csv";
		$file = fopen(_GEODATANODE_TEMP_DIR.$namefile, "w+");
		if (!$file) {
			die("Cannot open file ($namefile)");
			return false;
		}
		fwrite($file, $result);
		fclose($file);
		
		return $namefile;
	}	


    private function xget_file_contents($file) {
        $pipe = @fopen($file, 'rb');
        if ($pipe) {
            while (!feof($pipe)) {
                $line = fgets($pipe, 2048);
                $buffer .= $line;
            }
            fclose($pipe);
            return $buffer;
        }
        return false;
    }


    private function getResult() {
        if ($this->result === false) {
            $this->logError("geodatanode::getResult - No results to output");
            return false;
        }
        if ($this->format == "application/json") {
            $this->output = $this->getResultJSON();
        } else {
            $this->logError("geodatanode::getResult - Unknown output format [".$this->format."]");
            return false;
        }
        $this->outputResults();
    }


    private function getResultJSON() {
        return json_encode($this->result);
    }


    private function outputResults() {
        if ($this->output === false) {
            $this->logError("geodatanode::outputResults - No output ready");
            return false;
        }

        $filename = "geodatanode.".$this->mode.".json";
        header("Content-Disposition: inline; filename=".$filename);
        header("Content-type: ".$this->format."; charset=UTF-8");
        header("Content-Length: ".strlen($this->output));

        // Output data
        echo $this->output;
    }

}
?>

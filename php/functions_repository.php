<?php

/**
 * General functions
 * @details &copy;2009 - Geodata Sistemas SL
 * @file functions.php
 * @version 1.0
 * @see class.gdatabase.php
 * @see conf.php
 */
require_once("common/db/class.gdatabase.php");
require_once("conf.php");

/**
 * Returns the value for the provided key in a collection
 * @param $name Key name
 * @param $default Default value if the key is not found, default is false
 * @param $from Collection where search for the key, default is $_REQUEST
 * @return variant Parameter value if found, default value otherwise
 */
function getParameter($name, $default = false, $from = false) {
    if ($from === false) $from = $_REQUEST;
    reset($from);
    while (list($key, $value) = each($from)) {
        if (strcasecmp($key, $name) == 0) return $value;
    }
    return $default;

}


/**
 * Returns a log object (logger).
 * @details Log file path is read from conf.php
 * @return object|boolean Logger object if was successfully created, false otherwise
 */
function getLoggerObject() {
    $log = new logger();
    if (!$log->init(_LOG_FILE)) {
        return false;
    }

    return $log;

}

/**
 * Returns a Database abstraction object (gDatabase).
 * @details Connection parameters are read from conf.php
 * @return object|boolean Database object if connection was successful, false otherwise
 */
function getDBObject() {

    $db = new gDatabase(_DB_TYPE, _DB_HOST, _DB_NAME, _DB_USER, _DB_PWD, _DB_PORT);
    if (!$db->connect()) {
        return false;
    }
    $db->set_fetcharraymode(1);
    return $db;

}


/**
 * Executes the SQL statement provided
 * @param object $db Database object
 * @param string $sql SQL query
 * @param boolean $getRecords Return records if found, default is false
 * @return array|boolean Array with data if requested, true if execution was succesful, false if no records or errors where found
 */
function executeSQL($db, $sql, $getRecords = false) {
    if ($rs = $db->query($sql)) {
        if ($getRecords) {
            $records = array();
            while ($record = $db->fetch_array($rs)) {
                $records[] = $record;
            }
            $out = (count($records)) ? $records : 0;
        }
        else {
            $out = true;
        }
        $db->free($rs);
    }
    else {
        $out = false;
    }
    return $out;

}


/**
 * 	Sets a cookie in the client's browser
 * @param string $name Cookie name
 * @param variant $value Cookie value. Can be none
 * @param integer $expires The time the cookie expires in days. If no one is provided, cookie expires at the end of the session
 * @param string $path The path on the server in which the cookie will be available on (false -> current directory, '/' -> entire domain)
 * @param string $domain The domain that the cookie is available (Important with subdomains!)
 * @param boolean $secure If true, cookie will be only be transmitted over a secure HTTPS connection
 * @return boolean True if sended, false otherwise
 */
function setUserCookie($name, $value = false, $expires = 0, $path = "/", $domain = false, $secure = false) {
    if (!$name) return false;

    $time = ($expires) ? time() + 60 * 60 * 24 * $expires : false;

    return setcookie($name, $value, $time, $path, $domain, $secure);

}


/**
 * Gets the application locale param for further callings
 * @see getParameter(),setUserCookie()
 * @return string locale
 */
function getAppLocale() {

    $locale = getParameter("lang", false);
    //Check cookie
    if (!$locale && isset($_COOKIE["mcnbLang"]) && strlen($_COOKIE["mcnbLang"])) {
        $locale = $_COOKIE["mcnbLang"];
        $setcookie = false;
    }

    if (!$locale || !in_array($locale, explode(",", _AVAILABLE_LOCALES))) {
        $locale = _DEFAULT_LOCALE;
    }

    return $locale;

}


/**
 * 	Sets the application locale and loads localized strings (if exist in locale directory)
 * @see getParameter(),setUserCookie()
 * @return string Locale set
 */
function setAppLocale($locale = false) {
    $setcookie = true;


    //Check request
    if (!$locale) $locale = getParameter("lang", false);

    //Check cookie
    if (!$locale && isset($_COOKIE["mcnbLang"]) && strlen($_COOKIE["mcnbLang"])) {
        $locale = $_COOKIE["mcnbLang"];
        $setcookie = false;
    }

    $locale = strtolower($locale);
    $locale = str_replace("_", "-", $locale);

    switch ($locale) {
        case "ca-es":
            $locale = "ca";
            break;
        case "es-es":
            $locale = "es";
            break;
    }

    if (!$locale || !in_array($locale, explode(",", _AVAILABLE_LOCALES))) {
        $locale = _DEFAULT_LOCALE;
    }

    //Require localized strings
    $file = _APP_ROOT."php/locale/".$locale.".inc.php";
    if (!file_exists($file)) {
        $file = _APP_ROOT."php/locale/"._DEFAULT_LOCALE.".inc.php";
    }

    require_once($file);

    //Build client strings file
    //buildClientStrings();
    //Set cookie if needed
    if ($setcookie) {
        setUserCookie("mcnbLang", $locale, 3650, _APP_URL_PATH);
    }

    return $locale;

}


/**
 * 	Gets the current locale code from cookie, or the default locale if it is not set
 * @return string Locale code
 */
function getCurrentLocale() {
    $locale = ($_COOKIE["mcnbLang"]) ? $_COOKIE["mcnbLang"] : _DEFAULT_LOCALE;
    return $locale;

}


/**
 * 	Builds a JSON object with the localized strings needed by the client, and writes it in locale.js
 * @return boolean True if the file was succesfully updated, false if errors were found
 */
function buildClientStrings() {

    global $exportLocale;

    if (!isset($exportLocale)) return false;
    $output = "{";
    //$output = "var locStrings = {";
    for ($i = 0; $i < count($exportLocale); $i++) {
        if ($i > 0) $output .= ",";
        $output .= "\"".strtolower($exportLocale[$i])."\":\"".constant($exportLocale[$i])."\"";
    }
    $output .= "}";
    /*
      $file = _APP_ROOT."js/locale.js";
      $put = file_put_contents($file,$output);

      return ($put !== false);
     */
    return $output;

}


/**
 * Returns a formatted string with the current date,according to the current locale
 * @return variant Parameter value if found, default value otherwise
 */
function getCurrentDate() {
    $time = time();
    $day = date("j", $time);
    $month = date("n", $time);
    $year = date("Y", $time);

    $monthLabels = explode(",", _MENU_MONTHS);
    $monthLabel = $monthLabels[$month - 1];

    $d = (_LOCALE == "ca" && (preg_match("/[aeiou]/i", substr($monthLabel, 0, 1)))) ? " d'" : " de ";

    $out = $day.$d.$monthLabel." del ".$year;

    return $out;

}


function get_ip() {
    if (isset($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    }
    elseif (isset($_SERVER['HTTP_CLIENT_IP'])) {
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    }
    else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;

}


function xget_file_contents($file) {
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


function get_contents($file) {

    // check file and download
    if (!$file_content = xget_file_contents($file)) return false;
    $file_content = preg_replace("/(<!--)(.*)(-->)/e", "", $file_content);

    // download and substitute includes
    $pattern = '/(<include([ ]+)file=([\'"]))(.+)(([\'"])([ ]*)\/>)/i';
    while (preg_match($pattern, $file_content, $content)) {
        $include_file = dirname($file).'/'.$content[4];
        $include_content = $this->get_contents($include_file);
        $file_content = str_replace($content[0], $include_content, $file_content);
    }

    // return contents
    return $file_content;

}


function get_node_value($parent, $name, $default = false) {
    $node = $parent->getElementsByPath($name, 1);
    if ($node) return $node->getText();
    return $default;

}


function get_attribute_value($parent, $name, $default = false) {
    if ($parent->hasAttribute($name)) return $parent->getAttribute($name);
    return $default;

}


function get_node_attribute_value($parent, $node, $name, $default = false) {
    $tmp = $parent->getElementsByPath($node, 1);
    if ($tmp) return get_attribute_value($tmp, $name, $default);
    return $default;

}


function removeApostrophe($input) {
    $string = utf8_decode($input);
    $string = str_replace("'", "&#39;", $string);
    return $string;

}


function str_contains($haystack, $needle, $ignoreCase = false) {
    if ($ignoreCase) {
        $haystack = strtolower($haystack);
        $needle = strtolower($needle);
    }
    $needlePos = strpos($haystack, $needle);
    return ($needlePos === false ? false : ($needlePos + 1));

}


function get_parameter($name, $default = null) {
    if (isset($_REQUEST[$name])) {
        return $_REQUEST[$name];
    }
    else {
        return $default;
    }

}


function get_url_parameter($url, $name, $default = null) {
    $parsed_url = parse_url($url);
    parse_str($parsed_url['query'], $parameters);
    if (isset($parameters[$name])) return $parameters[$name];
    return $default;

}


function set_url_parameter($url, $name, $value) {
    $parsed_url = parse_url($url);
    parse_str($parsed_url['query'], $parameters);
    $parameters[$name] = $value;
    $parsed_url['query'] = http_implode($parameters);
    $url = glue_url($parsed_url);
    return $url;

}


function http_implode($input) {
    if (!is_array($input)) return false;
    $url_query = "";
    foreach ($input as $key=>$value) {
        $url_query .= ( strlen($url_query) > 1) ? '&' : "";
        $url_query .= urlencode($key).'='.urlencode($value);
    }
    return $url_query;

}


function glue_url($parsed) {
    if (!is_array($parsed)) return false;
    $uri = $parsed['scheme'] ? $parsed['scheme'].':'.((strtolower($parsed['scheme']) == 'mailto') ? '' : '//') : '';
    $uri .= $parsed['user'] ? $parsed['user'].($parsed['pass'] ? ':'.$parsed['pass'] : '').'@' : '';
    $uri .= $parsed['host'] ? $parsed['host'] : '';
    $uri .= $parsed['port'] ? ':'.$parsed['port'] : '';
    $uri .= $parsed['path'] ? $parsed['path'] : '';
    $uri .= $parsed['query'] ? '?'.$parsed['query'] : '';
    $uri .= $parsed['fragment'] ? '#'.$parsed['fragment'] : '';
    return $uri;

}


function get_best_format($formats, $raster = false) {

    if ($raster) {
        $sorted = array('image/jpeg', 'image/png', 'image/gif', 'image/wbmp');
    }
    else {
        $sorted = array('image/png', 'image/gif', 'image/jpeg', 'image/wbmp');
    }
    for ($i = 0; $i < count($sorted); $i++) {
        if (in_array($sorted[$i], $formats)) return $sorted[$i];
    }
    return false;

}


function get_best_infoformat($formats) {

    $sorted = array('application/vnd.ogc.gml', 'text/plain', 'text/html', 'text/xml');
    for ($i = 0; $i < count($sorted); $i++) {
        if (in_array($sorted[$i], $formats)) return $sorted[$i];
    }
    return false;

}


function secure_tmpname($postfix = '.tmp', $prefix = 'tmp', $dir = null) {

    // validate arguments
    if (!(isset($postfix) && is_string($postfix))) return false;
    if (!(isset($prefix) && is_string($prefix))) return false;
    if (!(isset($dir))) $dir = getcwd();

    // find a temporary name
    $tries = 1;
    do {

        // get a known, unique temporary file name
        $sysFileName = tempnam($dir, $prefix);
        if ($sysFileName === false) return false;

        // tack on the extension
        $newFileName = $sysFileName.$postfix;
        if ($sysFileName == $newFileName) return $sysFileName;

        // move or point the created temporary file to the new filename
        // NOTE: these fail if the new file name exist
        $newFileCreated = (_isWindows() ? @rename($sysFileName, $newFileName) : @link($sysFileName, $newFileName));
        if ($newFileCreated) return $newFileName;

        @unlink($sysFileName);
        $tries++;
    } while ($tries <= 5);

    return false;

}


function check_coords($x, $y, $extent) {
    $extent = explode(",", $extent);
    return (($x >= $extent[0]) && ($x <= $extent[2]) && ($y <= $extent[1]) && ($y >= $extent[3]));

}


function _isWindows() {
    return (DIRECTORY_SEPARATOR == '\\' ? true : false);

}


function data_encode($text) {
    $output = urlencode($text);
    $output = str_replace("+", " ", $output);
    return $output;

}


/**
 * 	Encodes data to send it to the client
 * @param {string} $text Text to encode
 * @returns $output|false Encoded text, false if it is not a string
 * @type string|boolean
 */
function dataEncode($text) {
    $output = false;
    if (is_string($text)) {
        $output = urlencode($text);
        $output = str_replace("+", " ", $output);
    }
    return $output;

}


function dataEncodeArray($array) {
    for ($i = 0; $i < count($array); $i++) {
        $array[$i] = array_map(dataEncode, $array[$i]);
    }
    return $array;

}


function dataDecode($text) {
    $output = false;
    if (is_string($text)) {
        $output = urldecode($text);
    }
    return $output;

}


function dataDecodeArray($array) {
    for ($i = 0; $i < count($array); $i++) {
        if (gettype($array) == "array") {
            $array[$i] = array_map(dataDecode, $array[$i]);
        }
        else {
            $array[$i] = dataDecode($array[$i]);
        }
    }
    return $array;

}


function formatQuote($value) {
    $out = $value;
    if (strpos($out, "'")) {
        $out = str_replace("'", "''", $out);
    }
    return $out;

}


function formatArray($array) {
    for ($i = 0; $i < count($array); $i++) {
        if (gettype($array) == "array") {
            $array[$i] = array_map(formatQuote, $array[$i]);
        }
        else {
            $array[$i] = formatQuote($array[$i]);
        }
    }
    return $array;

}


/**
 * 	Checks user authentication
 * @param string $name User name
 * @param string $pwd Password
 * @param object $db Database object
 * @return boolean|integer True if user found and password is correct, 0 if user was not found, -1 if password is incorrect, false if errors were found
 */
function checkUser($name, $pwd, $db) {

    if (!$name || !$pwd) return false;

    $sql = "SELECT id FROM users WHERE username = '".$name."'";
    $select = executeSQL($db, $sql, true);
    if ($select === false) return false;
    if ($select === 0) return 0;

    //$sql = "SELECT id FROM user WHERE username = '".$name."' AND password = '".md5($pwd)."'";
    $sql = "SELECT id FROM users WHERE username = '".$name."' AND password = '".$pwd."'";
    $select = executeSQL($db, $sql, true);
    if ($select === false) return false;
    if ($select === 0) return -1;
    return true;

}


function getRealIpAddr() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) {   //check ip from share internet
        $ip = $_SERVER['HTTP_CLIENT_IP'];
    }
    elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {   //to check ip is pass from proxy
        $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
    }
    else {
        $ip = $_SERVER['REMOTE_ADDR'];
    }
    return $ip;

}


function formatString($value) {
    if (!$value) return "null";
    if ($value == "null") return $value;
    $out = $value;
    if (strpos($out, "'")) {
        $out = str_replace("'", "''", $out);
    }
    return "'".$out."'";
    ;

}


?>

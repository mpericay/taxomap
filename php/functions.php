<?php

/**
 * General functions
 * @details &copy;2011 - Geodata Sistemas SL
 * @file functions.php
 * @version 1.0
 * @see conf.php
 */

require_once("conf.php");

/**
 * Checks if all API parameters are correct so that we can make a Javascript call to change view
 * @param $lat Latitude
 * @param $lon Longitude
 * @param $scale Scale
 * @return boolean Must tell OpenLayers to set a non-default viewport or not
 */

function isLocalizing($lat, $lon, $scale) {
    if(! (float) $lat) return false;
    if(! (float) $lon) return false;
    if(! (float) $scale) return false;
    return true;
}

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
        case "ca":
            $locale = "ca";
            break;
        case "es":
            $locale = "es";
            break;
        case "en":
            $locale = "en";
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

?>

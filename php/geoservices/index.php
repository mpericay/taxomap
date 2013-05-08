<?php
require_once("lib/class.geodatanode.php");

$geodatanode = new geodatanode();
/*
if ($geodatanode->ready) {
    $geodatanode->handle();
} else {
    echo "Could not initialise geodatanode object";
}*/
// we make error management inside (logError function)
$geodatanode->handle();
?>

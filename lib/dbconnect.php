<?php
    $host = 'localhost';
    $db = 'dominoesdb';
    require_once "db_upass.php";
    $user = $DB_USER;
    $pass = $DB_PASS;
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    if(gethostname()=='users.iee.ihu.gr') {
        $mysqli = new mysqli($host, $user, $pass, $db,null,'/home/student/it/2018/it185173/mysql/run/mysql.sock');
    } else {
        $pass = null;
        $mysqli = new mysqli($host, $user, $pass, $db);
    }
    if ($mysqli->connect_errno) {
        echo "Failed to connect to MySQL: (" . 
        $mysqli->connect_errno . ") " . $mysqli->connect_error;
    }
?>
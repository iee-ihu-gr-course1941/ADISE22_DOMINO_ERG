<?php

    require_once "../lib/dbconnect.php";
    require_once "../lib/users.php";
    require_once "../lib/game.php";
    require_once "../lib/board.php";

    $method = $_SERVER['REQUEST_METHOD'];
    $request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
    $input = json_decode(file_get_contents('php://input'),true);
    if ($input==null) {
        $input = [];
    }
    if(check_cookies()) {
        $input['token']=$_COOKIE['token'];
    }
    else {
        if (!(count($request) == 1 && array_values($request)[0] == 'users' && $method != 'GET') && 
        !(count($request) == 2 && array_values($request)[0] == 'users' && array_values($request)[1] == 'authorized')) {
            header('Location: http://'. $_SERVER['HTTP_HOST'] . '/~it185173/ADISE22_dominoes_erg/login.html');
            exit();
        }
    }
    global $mysqli;
    $sql = 'SET GLOBAL event_scheduler = ON';
    $mysqli->query($sql);
    switch ($r=array_shift($request)) {
        case 'users':
            switch ($b=array_shift($request)) { 
                case '': handle_user($method,$input);
                    break;
                case 'authorized': check_authorized($method,$input);
                    break;
                case 'logout': handle_logout($method,$input);
                    break;
                case 'highscores': highscores($method,$input);
                    break;
                default: header('HTTP/1.1 404 Not Found');
                    break;
            }
            break;
        case 'game': handle_game($method,$input);
            break;
        case 'board': handle_board($method,$input);
            break;
        case 'status': handle_status($method,$input);
        default:  header("HTTP/1.1 404 Not Found");
            exit;
    }

    function check_cookies() {
        if (isset($_COOKIE['token'])) {
            global $mysqli;
            $sql = 'select * from players where token=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('s',$_COOKIE['token']);
            try {
                $st->execute();
                $res = $st->get_result();
                $r = $res->fetch_all(MYSQLI_ASSOC);
                if (!empty($r)) {
                    return true;
                }
            }
            catch (mysqli_sql_exception $e) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
                exit;
            }
        }
        return false;
    }

    function handle_user($method,$input) {
        if ($method == 'POST') {
            login($input);
        } 
        else if ($method == 'PUT') {
            register($input); 
        }
        else if ($method == 'GET') {
            get_user();
        }
        else {
            header('HTTP/1.1 405 Method Not Allowed');
        } 
    }

    function check_authorized($method,$input) {
        if (count($input)>1) {
            header("HTTP/1.1 404 Not Found");
            exit;
        }
        if ($method == 'GET') {
            authorized();
        }
        else {
            header('HTTP/1.1 405 Method Not Allowed');
        }
    }

    function handle_logout($method,$input) {
        if (count($input)>1) {
            header("HTTP/1.1 404 Not Found");
            exit;
        }
        if ($method == 'POST') {
            logout();
        }
        else {
            header('HTTP/1.1 405 Method Not Allowed');
        }
    }

    function highscores($method,$input) {
        if (count($input)>2) {
            header("HTTP/1.1 404 Not Found");
            exit;
        }
        if ($method == 'POST') {
            leaderboards($input);
        }
        else {
            header('HTTP/1.1 405 Method Not Allowed');
        }
    }

    function handle_game($method,$input) {
        if (count($input)>2) {
            header("HTTP/1.1 404 Not Found");
            exit;
        }
        if ($method == 'POST') {
            game($input);
        }
        else if ($method == 'GET') {
            get_game();
        }
        else if ($method == 'DELETE') {
            cancel($input);
        }
        else {
            header('HTTP/1.1 405 Method Not Allowed');
        }
    }

    function handle_status($method,$input) {
        if (count($input)>1) {
            header("HTTP/1.1 404 Not Found");
            exit;
        }
        if ($method == 'GET') {
            get_status();
        }
        else {
            header('HTTP/1.1 405 Method Not Allowed');
        }
    }

    function handle_board($method,$input) {
        if ($method == 'PUT') {
            move($input); 
        }
        else if ($method == 'GET') {
            get_board();
        }
        else {
            header('HTTP/1.1 405 Method Not Allowed');
        } 
    }
?>
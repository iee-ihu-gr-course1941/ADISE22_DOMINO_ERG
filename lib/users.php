<?php

    function authorized() {
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
                    header('Content-type: application/json');
                    print json_encode(['authorized'=>true]);
                    exit;
                }
            }
            catch (mysqli_sql_exception $e) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
                exit;
            }
        }
        header('Content-type: application/json');
        print json_encode(['authorized'=>false]);
    }

    function register($input) {
        if (!isset($input['username']) || $input['username']=='') {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"No username given."]);
            exit;
        }
        if (!isset($input['password']) || $input['password']=='') {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"No password given."]);
            exit;
        }
        $username = $input['username'];
        if (preg_match('/[^\p{L}0-9]/u', $username)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Username can only contain alphanumeric."]);
            exit;
        }
        $password = $input['password'];
        if (strlen($password) > 20) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Password needs to be shorter than 21 characters."]);
            exit;
        }
        if (strlen($password) < 8) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Password needs to be at least 8 characters long."]);
            exit;
        }
        if (!preg_match('@\p{Lu}@u', $password)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Password needs at least one uppercase character."]);
            exit;
        }
        if (!preg_match('@\p{Ll}@u', $password)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Password needs at least one lowercase character."]);
            exit;
        }
        if (!preg_match('@[0-9]@', $password)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Password needs at least one number."]);
            exit;
        }
        if (!preg_match('@[^\p{L}0-9]@u', $password)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Password needs at least one special character."]);
            exit;
        }
        if (preg_match('@(.)\1{2}@', $password)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Characters can not be repeated more than 2 times in a row."]);
            exit;
        }
        if (preg_match('/(.)(.*\1){5}/', $password)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Characters can not be used more than 5 times."]);
            exit;
        }
        if (preg_match('/(.{3})(.*\1)/', $password) || preg_match('/(.{2})(.*\1){2}/', $password)) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Pattern used too often."]);
            exit;
        }
        global $mysqli;
        $sql = 'insert into players(Name,PW) values(?,md5(?))';
        $st = $mysqli->prepare($sql);
        $st->bind_param('ss',$username,$password);
        try {
            $st->execute();
        }
        catch (mysqli_sql_exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
            exit;
        }
        header('Content-type: application/json');
        print json_encode(['errormesg'=>'User created.']);
    }

    function login($input) {
        if (!isset($input['username']) || $input['username']=='') {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"No username given."]);
            exit;
        }
        if (!isset($input['password']) || $input['password']=='') {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"No password given."]);
            exit;
        }
        $username = $input['username'];
        $password = $input['password'];
        global $mysqli;
        $sql = 'select * from players where Name=? and pw=md5(?)';
        $st = $mysqli->prepare($sql);
        $st->bind_param('ss',$username,$password);
        try {
            $st->execute();
            $res = $st->get_result();
	        $r = $res->fetch_all(MYSQLI_ASSOC);
            if (empty($r)) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=> 'User not found.']);
                exit;
            }
            else {
                $cookie_name = "token";
                do {
                    $sql = 'select * from players where token=?';
                    $st = $mysqli->prepare($sql);
                    $cookie_value = md5(uniqid(rand(), true));
                    $st->bind_param('s',$cookie_value);
                    $st->execute();
                    $res = $st->get_result();
                    $r = $res->fetch_all(MYSQLI_ASSOC);
                } while (!empty($r));
                $sql = 'update players set token=? where Name=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('ss',$cookie_value,$username);
                $st->execute();
                setcookie($cookie_name, $cookie_value, time() + (86400), "/");
            }
        }
        catch (mysqli_sql_exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
            exit;
        }
        header('Content-type: application/json');
        print json_encode(['errormesg'=>'Logging in.']);
    }

    function get_user() {
        if(isset($_COOKIE['token'])) {
            global $mysqli;
            $sql = 'select Name,W,L from players where token=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('s',$_COOKIE['token']);
            try {
                $st->execute();
                $res = $st->get_result();
                $r = $res->fetch_all(MYSQLI_ASSOC);
                header('Content-type: application/json');
                print json_encode($r);
            }
            catch (mysqli_sql_exception $e) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
                exit;
            }
        }
        else {
            header('Location: http://'. $_SERVER['HTTP_HOST'] . '/~it185173/login.html');
        }
    }

    function logout() {
        global $mysqli;
        $sql = 'select Name from players where token=?';
        $st = $mysqli->prepare($sql);
        $st->bind_param('s',$_COOKIE['token']);
        try {
            $st->execute();
            $res = $st->get_result();
	        $r = $res->fetch_all(MYSQLI_ASSOC);
            $sql = 'update players set token=null where Name=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('s',(array_values($r)[0])['Name']);
            $st->execute();
            header('Content-type: application/json');
            print json_encode(['errormesg'=>'Logging out.']);
        }
        catch (mysqli_sql_exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
            exit;
        }
    }

    function leaderboards($input) {
        if (!isset($input['offset']) || !is_int($input['offset'])) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>$input]);
            exit;
        }
        $offset = (string)$input['offset'];
        global $mysqli;
        $sql = 'select Name,W,L,round((W/if((W+L) = 0, 1, (W+L))*100),2) as WR from players order by W/if((W+L) = 0, 1, (W+L))*100 desc limit 10 OFFSET ?';
        $st = $mysqli->prepare($sql);
        $st->bind_param('s', $offset);
        try {
            $st->execute();
            $res = $st->get_result();
            $r = $res->fetch_all(MYSQLI_ASSOC);
            if (empty($r)) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=> 'Nothing found.']);
                exit;
            }
            header('Content-type: application/json');
            print json_encode($r);
        }
        catch (mysqli_sql_exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
            exit;
        }
    }
?>

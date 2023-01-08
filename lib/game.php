<?php
    function game($input) {
        if (!isset($input['pNum']) || $input['pNum']=='') {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=>"Number of players not given."]);
            exit;
        }
        if(isset($_COOKIE['token'])) {
            global $mysqli;
            $sql = 'select Name from players where token=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('s',$_COOKIE['token']);
            try {
                $st->execute();
                $res = $st->get_result();
                $Name = $res->fetch_all(MYSQLI_ASSOC);
                $sql = 'select * from game_status where pNum=? and g_status="initialized" order by last_change asc';
                $st = $mysqli->prepare($sql);
                $input['pNum']--;
                $st->bind_param('i',$input['pNum']);
                $st->execute();
                $res = $st->get_result();
                $r = $res->fetch_all(MYSQLI_ASSOC);
                if (!empty($r)) {
                    $i = 0;
                    do {
                        $check = true;
                        $sql = 'select count(*) as CP from games where Gid=?';
                        $st = $mysqli->prepare($sql);
                        $st->bind_param('i',(array_values($r)[$i])['Gid']);
                        $st->execute();
                        $res = $st->get_result();
                        $curPlayers = $res->fetch_all(MYSQLI_ASSOC);
                        if ((array_values($curPlayers)[0])['CP']==$input['pNum']) {
                            $sql = 'update game_status set g_status="creating board" where Gid=?';
                            $st = $mysqli->prepare($sql);
                            $st->bind_param('i',(array_values($r)[$i])['Gid']);
                            $st->execute();
                            $sql = 'insert into games(Gid,Pid,Turn) values(?,?,?)';
                            $st = $mysqli->prepare($sql);
                            $Turn = (array_values($curPlayers)[0])['CP']+1;
                            $st->bind_param('isi',(array_values($r)[$i])['Gid'],(array_values($Name)[0])['Name'],$Turn);
                            $st->execute();
                            $check = false;
                            create_board((array_values($r)[$i])['Gid']);
                        }
                        if ((array_values($curPlayers)[0])['CP']<$input['pNum']) {
                            $sql = 'insert into games(Gid,Pid,Turn) values(?,?,?)';
                            $st = $mysqli->prepare($sql);
                            $Turn = (array_values($curPlayers)[0])['CP']+1;
                            $st->bind_param('isi',(array_values($r)[$i])['Gid'],(array_values($Name)[0])['Name'],$Turn);
                            $st->execute();
                            $check = false;
                        }
                        $i++;
                    } while($check && i<count($r));
                }
                else {
                    $sql = 'insert into games(Pid) values(?)';
                    $st = $mysqli->prepare($sql);
                    $st->bind_param('s',(array_values($Name)[0])['Name']);
                    $st->execute();
                    $sql = 'select Gid from games where Pid=?';
                    $st = $mysqli->prepare($sql);
                    $st->bind_param('s',(array_values($Name)[0])['Name']);
                    $st->execute();
                    $res = $st->get_result();
                    $r = $res->fetch_all(MYSQLI_ASSOC);
                    $sql = 'insert into game_status(Gid,pNum) values(?,?)';
                    $st = $mysqli->prepare($sql);
                    $st->bind_param('ii',(array_values($r)[0])['Gid'],$input['pNum']);
                    $st->execute();
                }
                header('Content-type: application/json');
                print json_encode(['errormesg'=> 'Searching for game.']);
            }
            catch (mysqli_sql_exception $e) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
                exit;
            }
        }
        else {
            header('Location: http://'. $_SERVER['HTTP_HOST'] . '/~it185173/ADISE22_dominoes_erg/login.html');
        }
    }

    function get_game() {
        global $mysqli;
        if(isset($_COOKIE['token'])) {
            try {
                $sql = 'select Name from players where token=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('s',$_COOKIE['token']);
                $st->execute();
                $res = $st->get_result();
                $Name = $res->fetch_all(MYSQLI_ASSOC);
                $sql = 'select Pid,Score from games where Gid in(select Gid from games where Pid=?) and Pid!=? order by Turn asc';
                $st = $mysqli->prepare($sql);
                $st->bind_param('ss',(array_values($Name)[0])['Name'],(array_values($Name)[0])['Name']);
                $st->execute();
                $res = $st->get_result();
                $curPlayers = $res->fetch_all(MYSQLI_ASSOC);
                $sql = 'select count(*) as tiles
                    from hands h join games g on h.Pid=g.Pid
                    where g.Gid in(select Gid 
                        from games 
                        where Pid=?)
                    and h.Pid!=?
                    group by h.Pid
                    order by g.Turn asc';
                $st = $mysqli->prepare($sql);
                $st->bind_param('ss',(array_values($Name)[0])['Name'],(array_values($Name)[0])['Name']);
                $st->execute();
                $res = $st->get_result();
                $r = $res->fetch_all(MYSQLI_ASSOC);
                $sql = 'select Pid,Score from games where Pid=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('s',(array_values($Name)[0])['Name']);
                $st->execute();
                $res = $st->get_result();
                $player = $res->fetch_all(MYSQLI_ASSOC);
                $sql = 'select count(*) as boneyard
                    from dominoes 
                    where Did not in(select Domino
                        from hands
                        where Pid in(select Pid
                            from games
                            where Gid in(select Gid 
                                from games 
                                where Pid=?)))
                    and Did not in(select Domino
                        from board
                        where Gid in(select Gid 
                            from games 
                            where Pid=?))';
                $st = $mysqli->prepare($sql);
                $st->bind_param('ss',(array_values($Name)[0])['Name'],(array_values($Name)[0])['Name']);
                $st->execute();
                $res = $st->get_result();
                $boneyard = $res->fetch_all(MYSQLI_ASSOC);
                $sql = 'select H,T from hands join dominoes on Did=Domino where Pid=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('s',(array_values($Name)[0])['Name']);
                $st->execute();
                $res = $st->get_result();
                $hands = $res->fetch_all(MYSQLI_ASSOC);
                header('Content-type: application/json');
                print json_encode([$curPlayers,$r,$player,$boneyard,$hands]);
                exit;
            }
            catch (mysqli_sql_exception $e) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
                exit;
            }
        }
        else {
            header('Location: http://'. $_SERVER['HTTP_HOST'] . '/~it185173/ADISE22_dominoes_erg/login.html');
        }
    }

    function create_board($Gid) {
        global $mysqli;
        try {
            $sql = 'select Pid from games where Gid=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('i',$Gid);
            $st->execute();
            $res = $st->get_result();
            $curPlayers = $res->fetch_all(MYSQLI_ASSOC);
            $sql = 'select pNum from game_status where Gid=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('i',$Gid);
            $st->execute();
            $res = $st->get_result();
            $pNum = $res->fetch_all(MYSQLI_ASSOC);
            if ((array_values($pNum)[0])['pNum']==2) {
                $limit=7;
            }
            else {
                $limit=5;
            }
            for ($i=0;$i<count($curPlayers);$i++) {
                $sql = "insert into hands(Domino,Pid) 
                    select Did,? from dominoes where Did not in(
                        select Domino from hands where Pid in(
                            select Pid from games where Gid=?
                        ))
                    order by rand()
                    limit ?";
                $st = $mysqli->prepare($sql);
                $st->bind_param('sii',(array_values($curPlayers)[$i])['Pid'],$Gid,$limit);
                $st->execute();
            }
            $sql = 'select Pid,Domino
                from hands join dominoes on Domino=Did 
                where H=T and Pid in(select Pid from games where Gid=?)
                order by H+T desc
                limit 1';
            $st = $mysqli->prepare($sql);
            $st->bind_param('i',$Gid);
            $st->execute();
            $res = $st->get_result();
            $maxD = $res->fetch_all(MYSQLI_ASSOC);
            if (empty($maxD)) {
                $sql = 'select Pid,Domino
                    from hands join dominoes on Domino=Did 
                    where Pid in(select Pid from games where Gid=?)
                    order by H+T desc
                    limit 1';
                $st = $mysqli->prepare($sql);
                $st->bind_param('i',$Gid);
                $st->execute();
                $res = $st->get_result();
                $maxD = $res->fetch_all(MYSQLI_ASSOC);
            }
            $sql = 'delete from hands where Domino=? and Pid=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('is',(array_values($maxD)[0])['Domino'],(array_values($maxD)[0])['Pid']);
            $st->execute();
            $sql = 'insert into board(Domino,Gid) values(?,?)';
            $st = $mysqli->prepare($sql);
            $st->bind_param('ii',(array_values($maxD)[0])['Domino'],$Gid);
            $st->execute();
            $sql = 'select Turn from games where Pid=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('s',(array_values($maxD)[0])['Pid']);
            $st->execute();
            $res = $st->get_result();
            $r = $res->fetch_all(MYSQLI_ASSOC);
            if ((array_values($pNum)[0])['pNum']==(array_values($r)[0])['Turn']) {
                $turn = 1;
            }
            else {
                $turn = (array_values($r)[0])['Turn']+1;
            }
            $sql = 'select Pid from games where Turn=? and Gid=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('ii',$turn,$Gid);
            $st->execute();
            $res = $st->get_result();
            $r = $res->fetch_all(MYSQLI_ASSOC);
            do {
                $sql = 'select count(*) as boneyard
                    from dominoes 
                    where Did not in(select Domino
                        from hands
                        where Pid in(select Pid
                            from games
                            where Gid=?))
                    and Did not in(select Domino
                        from board
                        where Gid=?)';
                $st = $mysqli->prepare($sql);
                $st->bind_param('ii',$Gid,$Gid);
                $st->execute();
                $res = $st->get_result();
                $boneyard = $res->fetch_all(MYSQLI_ASSOC);
                if ((array_values($boneyard)[0])['boneyard']==0) {
                    if ((array_values($pNum)[0])['pNum']==$turn) {
                        $turn = 1;
                    }
                    else {
                        $turn = $turn + 1;
                    }
                    $sql = 'select Pid from games where Turn=? and Gid=?';
                    $st = $mysqli->prepare($sql);
                    $st->bind_param('ii',$turn,$Gid);
                    $st->execute();
                    $res = $st->get_result();
                    $r = $res->fetch_all(MYSQLI_ASSOC);
                }
                $sql = 'select H,T 
                    from hands join dominoes on Domino=Did
                    where Pid=?
                    and Domino in(select Did
                                from dominoes
                                where H in(select H from board join dominoes on Did=Domino)
                                    or H in(select T from board join dominoes on Did=Domino)
                                    or T in(select H from board join dominoes on Did=Domino)
                                    or T in(select T from board join dominoes on Did=Domino))';
                $st = $mysqli->prepare($sql);
                $st->bind_param('s',(array_values($r)[0])['Pid']);
                $st->execute();
                $res = $st->get_result();
                $checkToDraw = $res->fetch_all(MYSQLI_ASSOC);
                if (empty($checkToDraw)) {
                    $sql = "insert into hands(Domino,Pid) 
                    select Did,? from dominoes where Did not in(
                        select Domino from hands where Pid in(
                            select Pid from games where Gid=?
                        ))
                        and Did not in(select Domino from board where Gid=?)
                    order by rand()
                    limit 1";
                    $st = $mysqli->prepare($sql);
                    $st->bind_param('sii',(array_values($r)[0])['Pid'],$Gid,$Gid);
                    $st->execute();
                }
            }
            while(empty($checkToDraw));
            $sql = 'select H,T from dominoes where Did=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('i',(array_values($maxD)[0])['Domino']);
            $st->execute();
            $res = $st->get_result();
            $moves = $res->fetch_all(MYSQLI_ASSOC);
            $sql = 'update game_status set g_status="started",turn=?,move1=?,move2=? where Gid=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('siii',(array_values($r)[0])['Pid'],(array_values($moves)[0])['H'],(array_values($moves)[0])['T'],$Gid);
            $st->execute();
        }
        catch (mysqli_sql_exception $e) {
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
            exit;
        }
    }

    function cancel($input) {
        if(isset($_COOKIE['token'])) {
            global $mysqli;
            $sql = 'select Name from players where token=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('s',$_COOKIE['token']);
            try {
                $st->execute();
                $res = $st->get_result();
                $Name = $res->fetch_all(MYSQLI_ASSOC);
                $sql = 'select Gid,Turn from games where Pid=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('s',(array_values($Name)[0])['Name']);
                $st->execute();
                $res = $st->get_result();
                $Gid = $res->fetch_all(MYSQLI_ASSOC);
                $sql = 'select g_status from game_status where Gid=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('i',(array_values($Gid)[0])['Gid']);
                $st->execute();
                $res = $st->get_result();
                $g_status = $res->fetch_all(MYSQLI_ASSOC);
                if(!empty($g_status)) {
                    if ((array_values($g_status)[0])['g_status']=='started' ||
                    (array_values($g_status)[0])['g_status']=='creating board') {
                        header("HTTP/1.1 400 Bad Request");
                        print json_encode(['errormesg'=> 'Cannot cancel game.']);
                        exit;
                    }
                }
                $sql = 'delete from games where Pid=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('s',(array_values($Name)[0])['Name']);
                $st->execute();
                $sql = 'update games set Turn=Turn-1 where Gid=? and Turn>?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('ii',(array_values($Gid)[0])['Gid'],(array_values($Gid)[0])['Turn']);
                $st->execute();
                $sql = 'select * from games where Gid=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('i',(array_values($Gid)[0])['Gid']);
                $st->execute();
                $res = $st->get_result();
                $r = $res->fetch_all(MYSQLI_ASSOC);
                if (empty($r)) {
                    $sql = 'delete from game_status where Gid=?';
                    $st = $mysqli->prepare($sql);
                    $st->bind_param('i',(array_values($Gid)[0])['Gid']);
                    $st->execute();
                }
                header('Content-type: application/json');
                print json_encode(['errormesg'=> 'Canceled search.']);
            }
            catch (mysqli_sql_exception $e) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
                exit;
            }
        }
        else {
            header('Location: http://'. $_SERVER['HTTP_HOST'] . '/~it185173/ADISE22_dominoes_erg/login.html');
        }
    }

    function get_status() {
        if(isset($_COOKIE['token'])) {
            global $mysqli;
            $sql = 'select Name from players where token=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('s',$_COOKIE['token']);
            try {
                $st->execute();
                $res = $st->get_result();
                $Name = $res->fetch_all(MYSQLI_ASSOC);
                $sql = 'select Gid from games where Pid=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('s',(array_values($Name)[0])['Name']);
                $st->execute();
                $res = $st->get_result();
                $Gid = $res->fetch_all(MYSQLI_ASSOC);
                if (empty($Gid)) {
                    header('Content-type: application/json');
                    print json_encode(['in_game'=>false]);
                    exit;
                }
                $sql = 'select g_status,result from game_status where Gid=? AND (g_status="aborded" OR g_status="ended")';
                $st = $mysqli->prepare($sql);
                $st->bind_param('i',(array_values($Gid)[0])['Gid']);
                $st->execute();
                $res = $st->get_result();
                $r = $res->fetch_all(MYSQLI_ASSOC);
                if (!empty($r)) {
                    if ((array_values($r)[0])['g_status']=='aborded') {   
                        header('Content-type: application/json');
                        print json_encode(['in_game'=>false,$r,'errormesg'=>'Game aborted due to inactivity.']);
                        exit;
                    }
                    else {
                        header('Content-type: application/json');
                        print json_encode(['in_game'=>false,$r]);
                        exit;
                    }
                }
                $sql = 'select g_status,pNum,Turn from game_status where Gid=? AND (g_status="initialized" OR g_status="started" OR g_status="creating board")';
                $st = $mysqli->prepare($sql);
                $st->bind_param('i',(array_values($Gid)[0])['Gid']);
                $st->execute();
                $res = $st->get_result();
                $r = $res->fetch_all(MYSQLI_ASSOC);
                if (empty($r)) {
                    header('Content-type: application/json');
                    print json_encode(['in_game'=>false]);
                    exit;
                }
                header('Content-type: application/json');
                print json_encode(['in_game'=>true,$r]);
                exit;
            }
            catch (mysqli_sql_exception $e) {
                header("HTTP/1.1 400 Bad Request");
                print json_encode(['errormesg'=> $e->getMessage() . " " . $e->getCode()]);
                exit;
            }
        }
        else {
            header('Location: http://'. $_SERVER['HTTP_HOST'] . '/~it185173/ADISE22_dominoes_erg/login.html');
        }
    }
?>
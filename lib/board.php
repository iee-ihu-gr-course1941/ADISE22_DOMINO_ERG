<?php
    function move($input){
        global $mysqli;
        if (isset($_COOKIE['token'])) {
            try {
                $sql = 'select Name from players where token=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('s',$_COOKIE['token']);
                $st->execute();
                $res = $st->get_result();
                $Name = $res->fetch_all(MYSQLI_ASSOC);
                $sql = 'select Gid from games where Pid=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('s',(array_values($Name)[0])['Name']);
                $st->execute();
                $res = $st->get_result();
                $Gid = $res->fetch_all(MYSQLI_ASSOC);
                if (!empty($Gid)) {
                    $sql = 'select H,T,Did from dominoes where Did in (select Domino from hands where Pid=?) and H=? and T=?';
                    $st = $mysqli->prepare($sql);
                    $st->bind_param('sii',(array_values($Name)[0])['Name'],$input['H'],$input['T']);
                    $st->execute();
                    $res = $st->get_result();
                    $Domino = $res->fetch_all(MYSQLI_ASSOC);
                    if (!empty($Domino)) {
                        $sql = 'select max(Turn) as maxT from board where Gid=?';
                        $st = $mysqli->prepare($sql);
                        $st->bind_param('i',(array_values($Gid)[0])['Gid']);
                        $st->execute();
                        $res = $st->get_result();
                        $r = $res->fetch_all(MYSQLI_ASSOC);
                        $turn = (array_values($r)[0])['maxT']+1;
                        $sql = 'insert into board(Domino,Gid,Turn,Neighbor) 
                                select ?,?,?,Did
                                from dominoes 
                                where H=? and T=?';
                        $st = $mysqli->prepare($sql);
                        $st->bind_param('iiiii',(array_values($Domino)[0])['Did'],(array_values($Gid)[0])['Gid'],$turn,$input['NH'],$input['NT']);
                        $st->execute();
                        if ($turn==2) {
                            $sql = 'update board set status=? where Gid=? and Turn=2';
                            $st = $mysqli->prepare($sql);
                            $st->bind_param('si',$input['status'],(array_values($Gid)[0])['Gid']);
                            $st->execute();
                        }
                        $sql = 'select (case  When D.H=N.T or D.H=N.H Then D.T
                                    else D.H
                                    End) as move
                            from (select H,T,Neighbor 
                                from board join dominoes on Did=Domino
                                where Gid=? and Domino=?) as D
                                join 
                                (select H,T,Neighbor
                                from board join dominoes on Did=Neighbor
                                where Gid=? and Domino=?) as N
                                on N.Neighbor=D.Neighbor';
                        $st = $mysqli->prepare($sql);
                        $st->bind_param('iiii',(array_values($Gid)[0])['Gid'],(array_values($Domino)[0])['Did'],(array_values($Gid)[0])['Gid'],(array_values($Domino)[0])['Did']);
                        $st->execute();
                        $res = $st->get_result();
                        $moves = $res->fetch_all(MYSQLI_ASSOC);
                        if ($input['status']=='H') {
                            $sql = 'update game_status set move1=? where Gid=?';
                        }
                        else {
                            $sql = 'update game_status set move2=? where Gid=?';
                        }
                        $st = $mysqli->prepare($sql);
                        $st->bind_param('ii',(array_values($moves)[0])['move'],(array_values($Gid)[0])['Gid']);
                        $st->execute();
                        $sql = 'delete from hands where Domino=? and Pid=?';
                        $st = $mysqli->prepare($sql);
                        $st->bind_param('is',(array_values($Domino)[0])['Did'],(array_values($Name)[0])['Name']);
                        $st->execute();
                        $sql = 'select count(*) as hand from hands where Pid=?';
                        $st = $mysqli->prepare($sql);
                        $st->bind_param('s',(array_values($Name)[0])['Name']);
                        $st->execute();
                        $res = $st->get_result();
                        $hand = $res->fetch_all(MYSQLI_ASSOC);
                        $sql = 'select count(*) as playableDominoes
                            from dominoes
                            where Did not in(select Domino
                                            from board
                                            where Gid=?)
                            and (H in(select move1 from game_status where Gid=?)
                                or H in(select move2 from game_status where Gid=?)
                                or T in(select move1 from game_status where Gid=?)
                                or T in(select move2 from game_status where Gid=?))';
                        $st = $mysqli->prepare($sql);
                        $st->bind_param('iiiii',(array_values($Gid)[0])['Gid'],(array_values($Gid)[0])['Gid'],(array_values($Gid)[0])['Gid'],(array_values($Gid)[0])['Gid'],(array_values($Gid)[0])['Gid']);
                        $st->execute();
                        $res = $st->get_result();
                        $playableDominoes = $res->fetch_all(MYSQLI_ASSOC);
                        if ((array_values($hand)[0])['hand']==0 || (array_values($playableDominoes)[0])['playableDominoes']==0) {
                            if ((array_values($hand)[0])['hand']!=0) {
                                $sql = 'with
                                    p_points as (select Pid,sum(H)+sum(T) as points,H,T
                                                from hands join dominoes on Domino=Did
                                                where Pid in(select Pid
                                                            from games where
                                                            Gid=?)
                                                group by Pid),
                                    min_players as (select Pid,points,H,T
                                                    from p_points
                                                    where points=(select min(points)
                                                                from p_points)
                                                    group by Pid),
                                    min_number as (select Pid,(Case When H < T Then H
                                                            Else T
                                                            End) As TheMin,points
                                                from min_players)
                                    select Pid,TheMin,points 
                                    from min_number 
                                    where TheMin=(select min(TheMin)
                                                from min_number)';
                                $st = $mysqli->prepare($sql);
                                $st->bind_param('i',(array_values($Gid)[0])['Gid']);
                                $st->execute();
                                $res = $st->get_result();
                                $winner = $res->fetch_all(MYSQLI_ASSOC);
                            }
                            else {
                                $winner = [['Pid'=>(array_values($Name)[0])['Name'],'points'=>0]];
                            }
                            $sql = 'select sum(H)+sum(T) as score from dominoes where Did in(
                                        select Domino from hands where Pid in(
                                            select Pid from games where Gid=?
                                        )
                                    )';
                            $st = $mysqli->prepare($sql);
                            $st->bind_param('i',(array_values($Gid)[0])['Gid']);
                            $st->execute();
                            $res = $st->get_result();
                            $allpoints = $res->fetch_all(MYSQLI_ASSOC);
                            $winnerpoints = (array_values($allpoints)[0])['score']-(array_values($winner)[0])['points'];
                            $sql = 'update games set Score=Score+? where Pid=?';
                            $st = $mysqli->prepare($sql);
                            $st->bind_param('is',$winnerpoints,(array_values($winner)[0])['Pid']);
                            $st->execute();
                            $sql = 'select Score from games where Pid=?';
                            $st = $mysqli->prepare($sql);
                            $st->bind_param('s',(array_values($winner)[0])['Pid']);
                            $st->execute();
                            $res = $st->get_result();
                            $Score = $res->fetch_all(MYSQLI_ASSOC);
                            if ((array_values($Score)[0])['Score']<100) {
                                restart_board((array_values($Gid)[0])['Gid']);
                            }
                            else{
                                $sql = 'update players set W=W+1 where Name=?';
                                $st = $mysqli->prepare($sql);
                                $st->bind_param('s',(array_values($winner)[0])['Pid']);
                                $st->execute();
                                $sql = 'update players set L=L+1 where Name!=? and Name in(select Pid from games where Gid=?)';
                                $st = $mysqli->prepare($sql);
                                $st->bind_param('si',(array_values($winner)[0])['Pid'],(array_values($Gid)[0])['Gid']);
                                $st->execute();
                                $sql = 'update game_status set result=?,g_status="ended" where Gid=?';
                                $st = $mysqli->prepare($sql);
                                $st->bind_param('si',(array_values($winner)[0])['Pid'],(array_values($Gid)[0])['Gid']);
                                $st->execute();
                            }
                        }
                        else{
                            $sql = 'select pNum from game_status where Gid=?';
                            $st = $mysqli->prepare($sql);
                            $st->bind_param('i',(array_values($Gid)[0])['Gid']);
                            $st->execute();
                            $res = $st->get_result();
                            $pNum = $res->fetch_all(MYSQLI_ASSOC);
                            $sql = 'select Turn from games where Pid=?';
                            $st = $mysqli->prepare($sql);
                            $st->bind_param('s',(array_values($Name)[0])['Name']);
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
                            $st->bind_param('ii',$turn,(array_values($Gid)[0])['Gid']);
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
                                $st->bind_param('ii',(array_values($Gid)[0])['Gid'],(array_values($Gid)[0])['Gid']);
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
                                    $st->bind_param('ii',$turn,(array_values($Gid)[0])['Gid']);
                                    $st->execute();
                                    $res = $st->get_result();
                                    $r = $res->fetch_all(MYSQLI_ASSOC);
                                }
                                $sql = 'select H,T 
                                    from hands join dominoes on Domino=Did
                                    where Pid=?
                                    and Domino in(select Did
                                                from dominoes
                                                where H in(select move1 from game_status where Gid=?)
                                                    or H in(select move2 from game_status where Gid=?)
                                                    or T in(select move1 from game_status where Gid=?)
                                                    or T in(select move2 from game_status where Gid=?))';
                                $st = $mysqli->prepare($sql);
                                $st->bind_param('siiii',(array_values($r)[0])['Pid'],(array_values($Gid)[0])['Gid'],(array_values($Gid)[0])['Gid'],(array_values($Gid)[0])['Gid'],(array_values($Gid)[0])['Gid']);
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
                                    $st->bind_param('sii',(array_values($r)[0])['Pid'],(array_values($Gid)[0])['Gid'],(array_values($Gid)[0])['Gid']);
                                    $st->execute();
                                } 
                            }
                            while(empty($checkToDraw));
                            $sql = 'update game_status set turn=? where Gid=?';
                            $st = $mysqli->prepare($sql);
                            $st->bind_param('si',(array_values($r)[0])['Pid'],(array_values($Gid)[0])['Gid']);
                            $st->execute();
                        }
                    }
                }
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

    function restart_board($Gid) {
        global $mysqli;
        try {
            $sql = 'delete from hands where Pid in(select Pid from games where Gid=?)';
            $st = $mysqli->prepare($sql);
            $st->bind_param('i',$Gid);
            $st->execute();
            $sql = 'delete from board where Gid=?';
            $st = $mysqli->prepare($sql);
            $st->bind_param('i',$Gid);
            $st->execute();
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

    function get_board() {
        global $mysqli;
        if(isset($_COOKIE['token'])) {
            try {
                $sql = 'select Name from players where token=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('s',$_COOKIE['token']);
                $st->execute();
                $res = $st->get_result();
                $Name = $res->fetch_all(MYSQLI_ASSOC);
                $sql = 'select Gid from games where Pid=?';
                $st = $mysqli->prepare($sql);
                $st->bind_param('s',(array_values($Name)[0])['Name']);
                $st->execute();
                $res = $st->get_result();
                $Gid = $res->fetch_all(MYSQLI_ASSOC);
                if (!empty($Gid)) {
                    $sql = 'select * from board join dominoes on Did=Domino where Gid=? order by Turn asc';
                    $st = $mysqli->prepare($sql);
                    $st->bind_param('i',(array_values($Gid)[0])['Gid']);
                    $st->execute();
                    $res = $st->get_result();
                    $board = $res->fetch_all(MYSQLI_ASSOC);
                    $sql = 'select move1,move2 from game_status where Gid=?';
                    $st = $mysqli->prepare($sql);
                    $st->bind_param('i',(array_values($Gid)[0])['Gid']);
                    $st->execute();
                    $res = $st->get_result();
                    $moves = $res->fetch_all(MYSQLI_ASSOC);
                    header('Content-type: application/json');
                    print json_encode($board);
                    exit;
                }
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
?>
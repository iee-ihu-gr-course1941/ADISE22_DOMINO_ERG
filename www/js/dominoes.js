var search;
var game_div = '<div class="main_title" id="main_title">' +
    '<h1><img src="css/domino.png" class="main_title_image"> Dominoes</h1>' +
'</div>';
var canvas;
var c;
var st;
var sg;
var sgrs;
var target;
var domH;
var domT;
var temp;
var previousX1;
var previousY1;
var previousRot;
var H;
var T;
var dataURL;
var timer;
var bone1,bone2,bone3,bone4,bone5,bone6,bone7,bone8,bone9,bone10,bone11,
bone12,bone13,bone14,bone15,bone16,bone17,bone18,bone19,bone20,bone21;
var active_hand;
var resizer;
var scaler;
var count_hands;
$.ajax({ 
    url: "dominoes.php/users/authorized",
    method: 'GET',
    dataType: "json",
    contentType: 'application/json',
    success: (data) => {
        $(document).ready( () => {
            if (!data.authorized) {
                window.location.href = "login.html";
            }
            else {
                $.ajax({ 
                    url: "dominoes.php/users",
                    method: 'GET',
                    dataType: "json",
                    contentType: 'application/json',
                    success: (data) => {
                        $("#Name").text(data[0].Name);
                        $("#Wins").text("Wins=" + data[0].W);
                        $("#Losses").text("Losses=" + data[0].L);
                    },
                    async:false
                });
                $('#content').addClass('sidebar_transition');
                $('#sidebar').addClass('sidebar_transition');
                checkfirststatus();
            }
        })
    },
    error: () => {
        let toasts = new toast();
        toasts.show('Something went wrong.','error');
    },
    async:false
});

function checkfirststatus() {
    $.ajax({ 
        url: "dominoes.php/status",
        method: 'GET',
        dataType: "json",
        contentType: 'application/json',
        success: (data) => {
            if (data.in_game) {
                $("input[name='pNum']").attr("disabled",true);
                $("#p"+((data[0])[0]).pNum).attr("checked",true); 
                if (((data[0])[0]).g_status=='initialized') {
                    initialized(data);
                }
                else if (((data[0])[0]).g_status=='creating board') {
                    initialized(data);
                    creating_board();
                }
                else {
                    started(data);
                }
            }
            else {
                if (data[0]) {
                    if (((data[0])[0]).g_status=='aborded') {
                        aborded(data);
                    }
                    else {
                        ended(data);
                    }
                }
                else {
                    $("input[name='pNum']").attr("disabled",false);
                    $("#find").html('<i id="sIcon" class="fas fa-search"></i> Find Game');
                    $("#find").click((e) => {
                        e.preventDefault();
                        find_game();
                    });
                }
            }
        },
        async:false
    });
}

function initialized(data) {
    game_status = true;
    game_div = '<div class="searching">';
    var already_in = 1;
    $.ajax({ 
        url: "dominoes.php/game",
        method: 'GET',
        dataType: "json",
        contentType: 'application/json',
        success: (data) => {
            $.each (data[0], function(indexes) {
                game_div += '<div class="loading_players">' +
                    '<h1>' +
                        '<img src="css/domino.png" class="main_title_image"> ' +
                        (data[0])[indexes].Pid + 
                    '</h1>' +
                '</div>';
                already_in++;
            });
        },
        async:false
    });
    var i;
    for (i=already_in;i<((data[0])[0]).pNum;i++) {
        game_div += '<i class="fas fa-spinner fa-spin loading_players"></i>';
    }
    game_div += '</div>'
    $("#main").html(game_div);
    $("#wrapper").toggleClass('wrapper_title');
    $("#find").html('<i id="sIcon" class="fas fa-window-close"></i> Cancel search');
    timer=setInterval(() => {checkgame();}, 4000);
    $("#find").click(() => {
        $("#go_to_game").trigger('click');
        let toasts = new toast();
        clearInterval(timer);
        $.ajax({
            url: "dominoes.php/game",
            method: 'DELETE',
            dataType: "json",
            contentType: 'application/json',
            success: (data) => {
                game_status = false;
                $("#wrapper").toggleClass('wrapper_title');
                $("#main").fadeOut(600,() => {
                    game_div='<div class="main_title" id="main_title">' +
                        '<h1><img src="css/domino.png" class="main_title_image"> Dominoes</h1>' +
                    '</div>';
                    $("#main").html(game_div);
                    $("#main").fadeIn(600);
                });
                $("input[name='pNum']").attr("disabled",false);
                $("#find").html('<i id="sIcon" class="fas fa-search"></i> Find Game');
                toasts.show(data.errormesg,'error');
                $("#find").off('click');
                $("#find").click((e) => {
                    e.preventDefault();
                    find_game();
                });
            },
            error: (er) => {
                const msg = JSON.parse(er.responseText);
                toasts.show(msg.errormesg,'error');
            },
            async:false
        });
        setTimeout(() => {
            $("#go_to_game").trigger('click');
        },400);
    });
}

function creating_board() {
    var t =  '<a id="go_to_game">' +
    '<i class="fas fa-dice-two"></i>' +
        ' Game ' +
    '</a>';
    $("#game").html(t);
}

function started(data) {
    var currentPlayer = ((data[0])[0]).Turn;
    game_status = true;
    $("#wrapper").toggleClass('wrapper_title');
    $.ajax({ 
        url: "dominoes.php/game",
        method: 'GET',
        dataType: "json",
        contentType: 'application/json',
        success: (data) => {
            $("#main").addClass('main_min');
            game_div = '<div id="maingame">' +
                    '<div class="board">' +
                        '<canvas id="bone"></canvas>' +
                        '<div id="droph" class="droph"></div>' +
                        '<div id="dropt"></div>' +
                    '</div>' +
                    '<div id="player_info">' +
                        '<div id="boneyard">' +
                            '<div class="BoneyardDominoes">' +
                                '<h1 class="BoneyardDominoesNumber">' +
                                    (data[3])[0].boneyard +      
                                '</h1>' +
                            '</div>' +
                        '</div>' +
                        '<div id="hands">' +
                            '<div id="canvases">';
            var i = 1;
            $.each ((data[4]), function(indexes) {
                game_div += '<canvas id="bone' + i + '" class="handDominoes"></canvas>';
                i++;
            });
            game_div += '</div>' +
                        '</div>' +
                        '<div id="this_player">' +
                            '<h2 class="this_playerheader">' +
                                'Player: ' + (data[2])[0].Pid +
                            '</h2>' +
                            '<h2 class="this_playerheader">' +
                                'Score: ' + (data[2])[0].Score + '/100' +
                            '</h2>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            var players = '<div class="players">';
            $.each ((data[0]), function(indexes) {
                players += '<div class="player">' +
                        '<div class="playerdominoes">' +
                            '<h1 class="remainingDominoes">' +
                                (data[1])[indexes].tiles +
                            '</h1>' +
                        '</div>' +
                        '<div>' +
                            '<h2 class="playerheader';
                            if (currentPlayer==(data[0])[indexes].Pid) {
                                players += ' CurrentPlayer';
                            } 
                            players += '">' +
                                'Player: ' + (data[0])[indexes].Pid + 
                            '</h2>' +
                            '<h2 class="playerheader';
                            if (currentPlayer==(data[0])[indexes].Pid) {
                                players += ' CurrentPlayer';
                            } 
                            players += '">' +
                                'Score: ' + (data[0])[indexes].Score + '/100' +
                            '</h2>' +
                        '</div>' +
                    '</div>';
            });
            players += '</div>';
            $("#playerswrapper").html(players);
            $("#main").html(game_div);
            $('#droph').droppable({tolerance: "pointer",drop: function(e){newDomino(e)},over: paintDomino,out: function(e){removePaintedDomino(e)}});
            $('#dropt').droppable({tolerance: "pointer",drop: function(e){newDomino(e)},over: paintDomino,out: function(e){removePaintedDomino(e)}});
            $('#content').removeClass('sidebar_transition');
            $('#sidebar').removeClass('sidebar_transition');
            var ind = 1;
            canvas = document.getElementById("bone");
            c = canvas.getContext('2d');
            if (window.width>=768) {
                canvas.width = canvas.clientWidth-230;
            }
            else {
                canvas.width = canvas.clientWidth;
            }
            canvas.height = canvas.clientHeight;
            $.ajax({ 
                url: "dominoes.php/board",
                method: 'GET',
                dataType: "json",
                contentType: 'application/json',
                success: (board_bones) => {
                    var tile;
                    if (board_bones[0].H==board_bones[0].T) {
                        tile = new domino(0,0,board_bones[0].H,board_bones[0].T,1,canvas,false);
                        tile.draw();
                    }
                    else {
                        tile = new domino(0,0,board_bones[0].H,board_bones[0].T,4,canvas,false);
                        tile.draw();
                    }
                    st = true;
                    sg = true;
                    H = false;
                    T = false;
                    sgrs = tile.rot;
                    domH = tile;
                    domT = tile;
                    $.each (board_bones, function(indexes) {
                        if (indexes!=0) {
                            sg = false;
                            if (board_bones[indexes].status=='H') {
                                createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                domH = temp;
                            }
                            else if (board_bones[indexes].status=='T') {
                                createDomino('dropt',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                st = false;
                                domT = temp;
                            }
                            else {
                                var neighbor = board_bones.find(({Domino}) => Domino === board_bones[indexes].Neighbor);
                                if (neighbor.Turn==1) {
                                    if (st) {
                                        createDomino('dropt',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                        st = false;
                                        domT = temp;
                                    }
                                    else {
                                        createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                        domH = temp;
                                    }
                                }
                                else {
                                    var max;
                                    var min;
                                    if (domH.p2>domH.p1) {
                                        max = domH.p2;
                                        min = domH.p1;
                                    }
                                    else {
                                        max = domH.p1;
                                        min = domH.p2;
                                    }
                                    if (neighbor.H == max && neighbor.T == min) {
                                        createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                        domH = temp;
                                    }
                                    else {
                                        createDomino('dropT',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                        domT = temp;
                                    }
                                }
                            }
                        }
                    });
                    domH.droppableH();
                    if (st) {
                        domT.startdroppableT();
                    }
                    else {
                        domT.droppableT();
                    }
                    scaler =  75*Math.min(canvas.height,canvas.width)/1000*(Math.max(canvas.height,canvas.width)/(2.715*Math.min(canvas.height,canvas.width)))*1.5;
                    $.each ((data[4]), function(indexes) {
                        var temp_canvas = document.getElementById('bone' + ind);
                        temp_canvas.width = scaler;
                        temp_canvas.height = scaler*2;
                        window['bone' + ind] = new domino(0,0,(data[4])[indexes].H,(data[4])[indexes].T,1,temp_canvas,true);
                        var bone = window['bone' + ind];
                        bone.draw();
                        if ((data[2])[0].Pid==currentPlayer) {
                            if (sg) {
                                if (sgrs == 1) {
                                    if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                        bone.color = 'white';
                                        for (var i=0;i<5;i++){
                                            bone.draw();
                                        };
                                        $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                    }
                                    else{
                                        bone.color = 'black';
                                        for (var i=0;i<5;i++){
                                            bone.draw();
                                        }
                                        $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                        $('#bone' + ind).draggable('disable');
                                    }
                                }
                                else{
                                    if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p1 ||  bone.p2 == domT.p1) {
                                        bone.color = 'white';
                                        for (var i=0;i<5;i++){
                                            bone.draw();
                                        };
                                        $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                    }
                                    else{
                                        bone.color = 'black';
                                        for (var i=0;i<5;i++){
                                            bone.draw();
                                        }
                                        $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                        $('#bone' + ind).draggable('disable');
                                    }
                                }
                            }
                            else {
                                switch (sgrs) {
                                    case 1:
                                        if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                            bone.color = 'white';
                                            for (var i=0;i<5;i++){
                                                bone.draw();
                                            };
                                            $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                        }
                                        else{
                                            bone.color = 'black';
                                            for (var i=0;i<5;i++){
                                                bone.draw();
                                            }
                                            $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                            $('#bone' + ind).draggable('disable');
                                        }
                                        break;
                                    case 4:
                                        if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                            bone.color = 'white';
                                            for (var i=0;i<5;i++){
                                                bone.draw();
                                            };
                                            $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                        }
                                        else{
                                            bone.color = 'black';
                                            for (var i=0;i<5;i++){
                                                bone.draw();
                                            }
                                            $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                            $('#bone' + ind).draggable('disable');
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                        ind++;
                    });
                    count_hands = ind;
                    $('#content').addClass('sidebar_transition');
                    $('#sidebar').addClass('sidebar_transition');
                },
                async:false
            });
            $.ajax({ 
                url: "dominoes.php/board",
                method: 'GET',
                dataType: "json",
                contentType: 'application/json',
                success: (board_bones) => {
                    $( window ).resize( resizer = () => {
                        var transition = setInterval(() => {
                            var canvas = document.getElementById("bone");
                            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                            canvas.width = canvas.clientWidth;
                            canvas.height = canvas.clientHeight;
                            var tile;
                            if (board_bones[0].H==board_bones[0].T) {
                                tile = new domino(0,0,board_bones[0].H,board_bones[0].T,1,canvas,false);
                                tile.draw();
                            }
                            else {
                                tile = new domino(0,0,board_bones[0].H,board_bones[0].T,4,canvas,false);
                                tile.draw();
                            }
                            st = true;
                            sg = true;
                            H = false;
                            T = false;
                            sgrs = tile.rot;
                            domH = tile;
                            domT = tile;
                            $.each (board_bones, function(indexes) {
                                if (indexes!=0) {
                                    sg = false;
                                    if (board_bones[indexes].status=='H') {
                                        createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                        domH = temp;
                                    }
                                    else if (board_bones[indexes].status=='T') {
                                        createDomino('dropt',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                        st = false;
                                        domT = temp;
                                    }
                                    else {
                                        var neighbor = board_bones.find(({Domino}) => Domino === board_bones[indexes].Neighbor);
                                        if (neighbor.Turn==1) {
                                            if (st) {
                                                createDomino('dropt',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                st = false;
                                                domT = temp;
                                            }
                                            else {
                                                createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                domH = temp;
                                            }
                                        }
                                        else {
                                            var max;
                                            var min;
                                            if (domH.p2>domH.p1) {
                                                max = domH.p2;
                                                min = domH.p1;
                                            }
                                            else {
                                                max = domH.p1;
                                                min = domH.p2;
                                            }
                                            if (neighbor.H == max && neighbor.T == min) {
                                                createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                domH = temp;
                                            }
                                            else {
                                                createDomino('dropT',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                domT = temp;
                                            }
                                        }
                                    }
                                }
                            });
                            domH.droppableH();
                            if (st) {
                                domT.startdroppableT();
                            }
                            else {
                                domT.droppableT();
                            }
                            scaler =  75*Math.min(canvas.height,canvas.width)/1000*(Math.max(canvas.height,canvas.width)/(2.715*Math.min(canvas.height,canvas.width)))*1.5;
                            var i = 1;
                            $.each ((data[4]), function(indexes) {
                                var temp_canvas = document.getElementById('bone' + i);
                                temp_canvas.width = scaler;
                                temp_canvas.height = scaler*2;
                                temp_canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                                for (var colorizing=0;colorizing<5;colorizing++) {
                                    window['bone' + i].draw();
                                }
                                i++;

                            });        
                        },1);
                        setTimeout( () => {
                            clearInterval(transition);
                        },300);
                        $('#sidebarCollapse').on('click',resizer);
                    });
                },
                async:false
            });
        },
        async:false
    });
    var t =  '<a id="go_to_game">' +
    '<i class="fas fa-dice-two"></i>' +
        ' Game ' +
    '</a>';
    $("#game").html(t);
    start=false;
    timer=setInterval(() => {checkgame();}, 4000);
}

function checkDroppables(bone){
    if (sg) {
        if (sgrs == 1) {
            if ((bone.p1 == domH.p1 || bone.p2 == domH.p1) && (bone.p1 == domT.p2 || bone.p2 == domT.p2)){//en all
                $('#droph').droppable('enable');
                $('#dropt').droppable('enable');
            }
            else if (bone.p1 == domH.p1 || bone.p2 == domH.p1) {//dis T
                $('#droph').droppable('enable');
                $('#dropt').droppable('disable');
            }
            else if (bone.p1 == domT.p2 || bone.p2 == domT.p2) {//dis H
                $('#droph').droppable('disable');
                $('#dropt').droppable('enable');
            }
        }
        else {
            if ((bone.p1 == domH.p2 || bone.p2 == domH.p2) && (bone.p1 == domT.p1 || bone.p2 == domT.p1)){//en all
                $('#droph').droppable('enable');
                $('#dropt').droppable('enable');
            }
            else if (bone.p1 == domH.p2 || bone.p2 == domH.p2) {//dis T
                $('#droph').droppable('enable');
                $('#dropt').droppable('disable');
            }
            else if (bone.p1 == domT.p1 || bone.p2 == domT.p1) {//dis H
                $('#droph').droppable('disable');
                $('#dropt').droppable('enable');
            }
        }
    }
    else {
        switch (sgrs) {
            case 1:
                if ((bone.p1 == domH.p2 || bone.p2 == domH.p2) && (bone.p1 == domT.p2 || bone.p2 == domT.p2)){//en all
                    $('#droph').droppable('enable');
                    $('#dropt').droppable('enable');
                }
                else if (bone.p1 == domH.p2 || bone.p2 == domH.p2) {//dis T
                    $('#droph').droppable('enable');
                    $('#dropt').droppable('disable');
                }
                else if (bone.p1 == domT.p2 || bone.p2 == domT.p2) {//dis H
                    $('#droph').droppable('disable');
                    $('#dropt').droppable('enable');
                }
                break;
            case 4:
                if ((bone.p1 == domH.p2 || bone.p2 == domH.p2) && (bone.p1 == domT.p1 || bone.p2 == domT.p1)){//en all
                    $('#droph').droppable('enable');
                    $('#dropt').droppable('enable');
                }
                else if (bone.p1 == domH.p2 || bone.p2 == domH.p2) {//dis T
                    $('#droph').droppable('enable');
                    $('#dropt').droppable('disable');
                }
                else if (bone.p1 == domT.p1 || bone.p2 == domT.p1) {//dis H
                    $('#droph').droppable('disable');
                    $('#dropt').droppable('enable');
                }
                break;
            default:
                break;
        } 
    }
    
}

function startDraggable(e,bone){
    clearInterval(timer);
    $("#canvases").css('overflow','visible');
    target = "#" + e.target.id;
    active_hand = bone;
    if (sg){
        if (sgrs == 1) {
            if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 || bone.p2 == domT.p2){
                domH.color = 'white';
                for (var i=0;i<5;i++){
                    domH.draw();
                };
                H = true;
            }
        }
        else {
            if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p1 || bone.p2 == domT.p1){
                domH.color = 'white';
                for (var i=0;i<5;i++){
                    domH.draw();
                };
                H = true;
            }
        }
    }
    else {
        switch (sgrs) {
            case 1:
                if (bone.p1 == domH.p2 || bone.p2 == domH.p2){
                    domH.color = 'white';
                    for (var i=0;i<5;i++){
                        domH.draw();
                    };
                    H = true;
                }
                else {
                    domH.color = 'black';
                    for (var i=0;i<5;i++){
                        domH.draw();
                    };
                    H = false;
                }
                if (bone.p1 == domT.p2 || bone.p2 == domT.p2){
                    domT.color = 'white';
                    for (var i=0;i<5;i++){
                        domT.draw();
                    };
                    T = true;
                }
                else {
                    domT.color = 'black';
                    for (var i=0;i<5;i++){
                        domT.draw();
                    };
                    T = false;
                }
                break;
            case 4:
                if (bone.p1 == domH.p2 || bone.p2 == domH.p2){
                    domH.color = 'white';
                    for (var i=0;i<5;i++){
                        domH.draw();
                    };
                    H = true;
                }
                else {
                    console.log(1);
                    domH.color = 'black';
                    for (var i=0;i<5;i++){
                        domH.draw();
                    };
                    H = false;
                }
                if (bone.p1 == domT.p1 || bone.p2 == domT.p1){
                    domT.color = 'white';
                    for (var i=0;i<5;i++){
                        domT.draw();
                    };
                    T = true;
                }
                else {
                    domT.color = 'black';
                    for (var i=0;i<5;i++){
                        domT.draw();
                    };
                    T = false;
                }
                break;
            default:
                break;
        }
    }
    checkDroppables(bone);
}

function stopDraggable() {
    timer=setInterval(() => {checkgame();}, 4000);
    $("#canvases").css('overflow','auto');
    domH.color='black';
    domT.color='black';
    for (var i=0;i<5;i++){
        if (H && T){
            domH.draw();
            domT.draw();
        }
        else if (H){
            domH.draw();
        }
        else{
            domT.draw();
        }
    };
}

function paintDomino(e) {
    dataURL = canvas.toDataURL();
    $(target).height(0);
    if (e.target.id=='droph') {
        $('#dropt').droppable('disable');
        createDomino(e.target.id,domH,canvas,active_hand.p1,active_hand.p2);
    }
    else {
        $('#droph').droppable('disable');
        createDomino(e.target.id,domT,canvas,active_hand.p1,active_hand.p2);
    }
}

function removePaintedDomino(e) {
    c.clearRect(0,0,canvas.width,canvas.height);
    var image=new Image();
    image.onload=function(){
        c.drawImage(image,0,0);
        checkDroppables(window[$(target).attr('id')]);
        if (e.target.id=='droph') {
            domH.x1 = previousX1;
            domH.y1 = previousY1;
            domH.rot = previousRot;
            $(target).height(scaler*2);
            domH.droppableH();
        }
        else {
            if (st) {
                $(target).height(scaler*2);
                domT.startdroppableT();
            }
            else {
                domT.x1 = previousX1;
                domT.y1 = previousY1;
                domT.rot = previousRot;
                $(target).height(scaler*2);
                domT.droppableT();
            }
        }
    }
    image.src=dataURL;
    sg = false;
}
 
function newDomino(e) {
    var max;
    var min;
    var nmax;
    var nmin;
    var status;
    if (temp.p2>temp.p1) {
        max = temp.p2;
        min = temp.p1;
    }
    else {
        max = temp.p1
        min = temp.p2;
    }
    if (e.target.id=='droph'){
        status = "H";
        if (domH.p2>domH.p1) {
            nmax = domH.p2;
            nmin = domH.p1;
        }
        else {
            nmax = domH.p1
            nmin = domH.p2;
        }
    }
    else {
        status = "T";
        if (domT.p2>domT.p1) {
            nmax = domT.p2;
            nmin = domT.p1;
        }
        else {
            nmax = domT.p1
            nmin = domT.p2;
        }
    }
    $.ajax({ 
        url: "dominoes.php/board",
        method: 'PUT',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({
            status: status,
            NH: nmax,
            NT: nmin,
            H: max,
            T: min
        })
    });
    var canvasT;
    var i = 1;
    do {
        canvasT = document.getElementById('bone'+i);
        if (document.body.contains(canvasT)) {
            $('#bone'+i).draggable('disable');
            var ctx = canvasT.getContext('2d');
            ctx.clearRect(0,0,canvasT.width,canvasT.height);
            window['bone'+i].color = 'black';
            window['bone'+i].draw();
        }
        i++;
    }while(document.body.contains(canvasT));
    if (e.target.id=='droph'){
        domH.color='black';
        for (var i=0;i<5;i++) { 
            domH.draw();
        };
        domH = temp;
        domH.droppableH();
    }
    else {
        st = false;
        domT.color='black';
        for (var i=0;i<5;i++) { 
            domT.draw();
        };
        domT = temp;
        domT.droppableT();
    }
    count_hands--;
    sg = false;
    $(target).remove();
}

function createDomino(trigered_by,tile,canvas,na,nb) {
    previousX1 = tile.x1;
    previousY1 = tile.y1;
    previousRot = tile.rot;
    var tiletest;
    var x=0;
    var y=0;
    var orient;
    var parentOrient;
    parentOrient=tile.rot;
    if (trigered_by=='dropt') {
        if (st) {
            if (tile.rot+2>4) {
                parentOrient=tile.rot+2-4;
            }
            else {
                parentOrient=tile.rot+2;
            }
        }
    }
    if (tile.p1==tile.p2) {
        switch(parentOrient) {
            case 1:
                x += tile.actual_width/tile.scale/2-1;
                break;
            case 2:
                y -= tile.actual_height/tile.scale/2-1;
                break;
            case 3:
                x -= tile.actual_width/tile.scale/2-1;
                break;
            case 4:
                y += tile.actual_height/tile.scale/2-1;
                break;
            default:
                break;
        }   
        if (parentOrient-1==0) {
            parentOrient=4;
        }
        else {
            parentOrient--;
        }    
    }
    if (na==nb) {
        if (parentOrient==1&&Math.round(canvas.height/2-tile.y1*tile.scale-4*tile.actual_height-1,2)<=1) {
            tile.clear();
            if (parentOrient+1>4) {
                parentOrient=1;
            }
            else {
                parentOrient++;
            }
            if (tile.rot+1>4) {
                tile.rot=1;
            }
            else {
                tile.rot++;
            }
            tile.x1 += 1.5*tile.actual_width/tile.scale;
            tile.y1 -= 1.5*tile.actual_height/tile.scale;
        }
        else if (parentOrient==2&&Math.round(canvas.width-(canvas.width/2+tile.x1*tile.scale+4*tile.actual_width+1),2)<=1) {
            tile.clear();
            if (parentOrient+1>4) {
                parentOrient=1;
            }
            else {
                parentOrient++;
            }
            if (tile.rot+1>4) {
                tile.rot=1;
            }
            else {
                tile.rot++;
            }
            tile.x1 -= 1.5*tile.actual_width/tile.scale;
            tile.y1 -= 1.5*tile.actual_height/tile.scale;
        }
        else if (parentOrient==3&&Math.round(canvas.height-(canvas.height/2-tile.y1*tile.scale+4*tile.actual_height+1),2)<=1) {
            tile.clear();
            if (parentOrient+1>4) {
                parentOrient=1;
            }
            else {
                parentOrient++;
            }
            if (tile.rot+1>4) {
                tile.rot=1;
            }
            else {
                tile.rot++;
            }
            tile.x1 -= 1.5*tile.actual_width/tile.scale;
            tile.y1 += 1.5*tile.actual_height/tile.scale;
        }
        else if (parentOrient==4&&Math.round(canvas.width/2+tile.x1*tile.scale-4*tile.actual_width-1,2)<=1) {
            tile.clear();
            if (parentOrient+1>4) {
                parentOrient=1;
            }
            else {
                parentOrient++;
            }
            if (tile.rot+1>4) {
                tile.rot=1;
            }
            else {
                tile.rot++;
            }
            tile.x1 += 1.5*tile.actual_width/tile.scale;
            tile.y1 += 1.5*tile.actual_height/tile.scale;
        }
        if (parentOrient+1>4) {
            orient=1;
        }
        else {
            orient=parentOrient+1;
        }
        if (parentOrient==1) {
            y -= 1/2*tile.actual_height/tile.scale;
        }
        else if (parentOrient==2) {
            x -= 1/2*tile.actual_width/tile.scale;
        }
        else if (parentOrient==3) {
            y += 1/2*tile.actual_height/tile.scale;
        }
        else {
            x += 1/2*tile.actual_width/tile.scale;
        }
    }
    else {
        if (parentOrient==1&&Math.round(canvas.height/2-tile.y1*tile.scale-4*tile.actual_height,2)<=1) {
            if (parentOrient+1>4) {
                orient=1;
            }
            else {
                orient=parentOrient+1;
            }
            x += 3/2*tile.actual_width/tile.scale;
            y -= 3/2*tile.actual_height/tile.scale;
        }
        else if (parentOrient==2&&Math.round(canvas.width-(canvas.width/2+tile.x1*tile.scale+4*tile.actual_width),2)<=1) {
            if (parentOrient+1>4) {
                orient=1;
            }
            else {
                orient=parentOrient+1;
            }
            x -= 3/2*tile.actual_width/tile.scale;
            y -= 3/2*tile.actual_height/tile.scale;
        }
        else if (parentOrient==3&&Math.round(canvas.height-(canvas.height/2-tile.y1*tile.scale+4*tile.actual_height),2)<=1) {
            if (parentOrient+1>4) {
                orient=1;
            }
            else {
                orient=parentOrient+1;
            }
            x -= 3/2*tile.actual_width/tile.scale;
            y += 3/2*tile.actual_height/tile.scale;
        }
        else if (parentOrient==4&&Math.round(canvas.width/2+tile.x1*tile.scale-4*tile.actual_width,2)<=1) {
            if (parentOrient+1>4) {
                orient=1;
            }
            else {
                orient=parentOrient+1;
            }
            x += 3/2*tile.actual_width/tile.scale;
            y += 3/2*tile.actual_height/tile.scale;
        }
        else {
            orient=parentOrient;
        }
    }
    switch(parentOrient) {
        case 1:
            x += tile.x1;
            y += tile.y1+2*tile.actual_height/tile.scale+1;
            break;
        case 2:
            x += tile.x1+2*tile.actual_width/tile.scale+1;
            y += tile.y1;
            break;
        case 3:
            x += tile.x1;
            y += tile.y1-2*tile.actual_height/tile.scale-1;
            break;
        case 4:
            x += tile.x1-2*tile.actual_width/tile.scale-1;
            y += tile.y1;
            break;
        default:
            break;
    }
    var p1,p2;
    if (na==tile.p1||na==tile.p2) {
        p1 = na;
        p2 = nb;
    }
    else {
        p1 = nb;
        p2 = na;
    }
    tiletest = new domino(x,y,p1,p2,orient,canvas,false);
    tile.draw();
    tiletest.draw();
    temp = tiletest;
}

function aborded(data) {
    game_status = true;
    timer=setInterval(() => {checkgame();}, 20000);
    $("#wrapper").toggleClass('wrapper_title');
    var t =  '<a id="go_to_game">' +
    '<i class="fas fa-dice-two"></i>' +
        ' Game ' +
    '</a>';
    $("#game").html(t);
    game_div = '<div class="searching">' +
        '<div class="loading_players">' +
            '<h1>' +
                '<img src="css/domino.png" class="main_title_image">' +
                ' ' + data.errormesg +
            '</h1>' +
            '<button id="return" class="btn load_more"><span>Home</span></button>' +
        '</div>' +
    '</div>';
    $("#main").html(game_div);
    $("#return").click((e) => {
        e.preventDefault();
        let toasts = new toast();
        $.ajax({
            url: "dominoes.php/game",
            method: 'DELETE',
            dataType: "json",
            contentType: 'application/json',
            success: () => {
                clearInterval(timer);
                var t = '<a id="go_to_game" href="#gameSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">' +
                    '<i class="fas fa-dice-two"></i>' +
                        ' Game' +
                    '</a>' +
                    '<ul class="collapse list-unstyled content" id="gameSubmenu">' +
                        '<li>' +
                            '<a href="#playersSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">' +
                                '<i class="fas fa-cog"></i>' +
                                ' Mode' +
                            '</a>' +
                            '<ul class="collapse list-unstyled content" id="playersSubmenu">' +
                                '<li>' +
                                    '<a>' +
                                        '<input type="radio" id="p2" name="pNum" value="2" checked>' +
                                        '<label for="p2">2</label>' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a>' +
                                        '<input type="radio" id="p3" name="pNum" value="3">' +
                                        '<label for="p3">3</label>' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a>' +
                                        '<input type="radio" id="p4" name="pNum" value="4">' +
                                        '<label for="p4">4</label>' +
                                    '</a>' +
                                '</li>' +
                            '</ul>' +
                            '<a id="find">' +
                            '</a>' +
                        ' </li>' +
                    '</ul>';
                $("#game").html(t);
                $("#wrapper").toggleClass('wrapper_title');
                $("#main").fadeOut(600,() => {
                    game_div='<div class="main_title" id="main_title">' +
                        '<h1><img src="css/domino.png" class="main_title_image"> Dominoes</h1>' +
                    '</div>';
                    $("#main").html(game_div);
                    $("#main").fadeIn(600);
                });
                $("input[name='pNum']").attr("disabled",false);
                $("#find").html('<i id="sIcon" class="fas fa-search"></i> Find Game');
                $("#find").click((e) => {
                    e.preventDefault();
                    find_game();
                });  
            },
            error: (er) => {
                const msg = JSON.parse(er.responseText);
                toasts.show(msg.errormesg,'error');
            },
            async:false
        });
    }); 
}

function ended(data) {
    game_status = true;
    timer=setInterval(() => {checkgame();}, 20000);
    $("#wrapper").toggleClass('wrapper_title');
    var t =  '<a id="go_to_game">' +
    '<i class="fas fa-dice-two"></i>' +
        ' Game ' +
    '</a>';
    $("#game").html(t);
    game_div = '<div class="searching">' +
        '<div class="loading_players">' +
            '<h1>' +
                '<img src="css/domino.png" class="main_title_image">' +
                ' Winner: ' + (data[0])[0].result +
            '</h1>' +
            '<button id="return" class="btn load_more"><span>Home</span></button>' +
        '</div>' +
    '</div>';
    $("#main").html(game_div);
    $("#return").click((e) => {
        e.preventDefault();
        let toasts = new toast();
        $.ajax({
            url: "dominoes.php/game",
            method: 'DELETE',
            dataType: "json",
            contentType: 'application/json',
            success: () => {
                clearInterval(timer);
                var t = '<a id="go_to_game" href="#gameSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">' +
                    '<i class="fas fa-dice-two"></i>' +
                        ' Game' +
                    '</a>' +
                    '<ul class="collapse list-unstyled content" id="gameSubmenu">' +
                        '<li>' +
                            '<a href="#playersSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">' +
                                '<i class="fas fa-cog"></i>' +
                                ' Mode' +
                            '</a>' +
                            '<ul class="collapse list-unstyled content" id="playersSubmenu">' +
                                '<li>' +
                                    '<a>' +
                                        '<input type="radio" id="p2" name="pNum" value="2" checked>' +
                                        '<label for="p2">2</label>' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a>' +
                                        '<input type="radio" id="p3" name="pNum" value="3">' +
                                        '<label for="p3">3</label>' +
                                    '</a>' +
                                '</li>' +
                                '<li>' +
                                    '<a>' +
                                        '<input type="radio" id="p4" name="pNum" value="4">' +
                                        '<label for="p4">4</label>' +
                                    '</a>' +
                                '</li>' +
                            '</ul>' +
                            '<a id="find">' +
                            '</a>' +
                        ' </li>' +
                    '</ul>';
                $("#game").html(t);
                $("#wrapper").toggleClass('wrapper_title');
                $("#main").fadeOut(600,() => {
                    game_div='<div class="main_title" id="main_title">' +
                        '<h1><img src="css/domino.png" class="main_title_image"> Dominoes</h1>' +
                    '</div>';
                    $("#main").html(game_div);
                    $("#main").fadeIn(600);
                });
                $("input[name='pNum']").attr("disabled",false);
                $("#find").html('<i id="sIcon" class="fas fa-search"></i> Find Game');
                $("#find").click((e) => {
                    e.preventDefault();
                    find_game();
                });  
            },
            error: (er) => {
                const msg = JSON.parse(er.responseText);
                toasts.show(msg.errormesg,'error');
            },
            async:false
        });
    });
}

var index;

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    return decodeURI(dc.substring(begin + prefix.length, end));
} 

$(document).ready( () => {
    setInterval( () => {
        var myCookie = getCookie('token');
        if (myCookie == null) {
            window.location.href = "login.html";
        }
    },1000);
    $("#logout").click((e) => {
        e.preventDefault();
        let toasts = new toast();
        $.ajax({ 
            url: "dominoes.php/users/logout",
            method: 'POST',
            dataType: "json",
            contentType: 'application/json',
            success: (data) => {
                $("#logout").off('click');
                toasts.show(data.errormesg,'success');
                setInterval(function redirect() {
                    window.location.href = "login.html";
                }, 2000);
            },
            error: () => {
                toasts.show('Something went wrong.','error');
            }
        });
    });

    enable_click();
    $("#go_to_game").off('click');
})

function enable_click() {
    $("#go_to_game").off('click');
    $("#scoreboard").off('click');
    $("#scoreboard").click((e) => {
        clearInterval(timer);
        if ($("#go_to_game").attr("aria-expanded")=="true") {
            $("#go_to_game").trigger('click');
        }
        enable_click();
        $("#scoreboard").off('click');
        e.preventDefault();
        index = 0;
        $("#main").fadeOut(600,() => {
            $("#main").removeClass('main_min');
            $( window ).off("resize", resizer);
            $('#sidebarCollapse').off("click", resizer);
            draw_scoreboard();
        });
    });

    $("#go_to_game").click((e)=> {
        enable_click();
        $("#go_to_game").off('click');
        e.preventDefault();
        $("#main").fadeOut(600,() => {
            checkgame();
            $('#main').fadeIn(600);
            if (game_status) {
                timer=setInterval(() => {checkgame();}, 4000);
            }
        });
    });
}

function find_game() {
    $("#go_to_game").trigger('click');
    let toasts = new toast();
    $.ajax({ 
        url: "dominoes.php/game",
        method: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({pNum:$("input[name='pNum']:checked").val()}),
        success: (data) => { 
            game_status = true;
            toasts.show(data.errormesg,'success');
            $("#wrapper").toggleClass('wrapper_title');
            $("#main").fadeOut(600,() => {
                game_div = '<div class="searching">';
                var already_in = 1;
                $.ajax({ 
                    url: "dominoes.php/game",
                    method: 'GET',
                    dataType: "json",
                    contentType: 'application/json',
                    success: (data) => {
                        $.each ((data[0]), function(indexes) {
                            game_div += '<div class="loading_players">' +
                                '<h1>' +
                                    '<img src="css/domino.png" class="main_title_image"> ' +
                                    (data[0])[indexes].Pid + 
                                '</h1>' +
                            '</div>';
                            already_in++;
                        });
                        var i;
                        for (i=already_in;i<$("input[name='pNum']:checked").val();i++) {
                            game_div += '<i class="fas fa-spinner fa-spin loading_players"></i>';
                        }
                        game_div += '</div>'
                        $("#main").html(game_div);
                        $("#main").fadeIn(600);
                        setTimeout(() => {
                            $("#go_to_game").trigger('click');
                        },400);
                        $("input[name='pNum']").attr("disabled",true);
                        $("#find").html('<i id="sIcon" class="fas fa-window-close"></i> Cancel search');
                        $("#find").off('click');
                        timer=setInterval(() => {checkgame();}, 4000);
                        $("#find").click(() => {
                            $("#go_to_game").trigger('click');
                            clearInterval(timer);
                            $.ajax({ 
                                url: "dominoes.php/game",
                                method: 'DELETE',
                                dataType: "json",
                                contentType: 'application/json',
                                success: (data) => {
                                    game_status = false;
                                    $("#wrapper").toggleClass('wrapper_title');
                                    $("#main").fadeOut(600,() => {
                                        game_div='<div class="main_title" id="main_title">' +
                                            '<h1><img src="css/domino.png" class="main_title_image"> Dominoes</h1>' +
                                        '</div>';
                                        $("#main").html(game_div);
                                        $("#main").fadeIn(600);
                                    });
                                    $("input[name='pNum']").attr("disabled",false);
                                    $("#find").html('<i id="sIcon" class="fas fa-search"></i> Find Game');
                                    toasts.show(data.errormesg,'error');
                                    $("#find").off('click');
                                    $("#find").click((e) => {
                                        e.preventDefault();
                                        find_game();
                                    });
                                    setTimeout(() => {
                                        $("#go_to_game").trigger('click');
                                    },400);
                                },
                                error: (er) => {
                                    const msg = JSON.parse(er.responseText);
                                    toasts.show(msg.errormesg,'error');
                                },
                            });
                        });
                    },
                });
            });
        },
        error: (er) => {
            const msg = JSON.parse(er.responseText);
            toasts.show(msg.errormesg,'error');
        },
    });
}

var game_status = false;
var start = true;

function checkgame() {
    $.ajax({ 
        url: "dominoes.php/status",
        method: 'GET',
        dataType: "json",
        contentType: 'application/json',
        success: (data) => {
            if (data.in_game) {
                game_status = true;
                if (((data[0])[0]).g_status=='initialized') {
                    game_div = '<div class="searching">';
                    var already_in = 1;
                    $.ajax({ 
                        url: "dominoes.php/game",
                        method: 'GET',
                        dataType: "json",
                        contentType: 'application/json',
                        success: (data) => {
                            $.each ((data[0]), function(indexes) {
                                game_div += '<div class="loading_players">' +
                                    '<h1>' +
                                        '<img src="css/domino.png" class="main_title_image"> ' +
                                        (data[0])[indexes].Pid + 
                                    '</h1>' +
                                '</div>';
                                already_in++;
                            });
                        },
                        async:false
                    });
                    var i;
                    for (i=already_in;i<$("input[name='pNum']:checked").val();i++) {
                        game_div += '<i class="fas fa-spinner fa-spin loading_players"></i>';
                    }
                    game_div += '</div>'
                    $("#main").html(game_div);
                }
                else if (((data[0])[0]).g_status=='creating board') {
                    game_div = '<div class="searching">';
                    var already_in = 1;
                    $.ajax({ 
                        url: "dominoes.php/game",
                        method: 'GET',
                        dataType: "json",
                        contentType: 'application/json',
                        success: (data) => {
                            $.each ((data[0]), function(indexes) {
                                game_div += '<div class="loading_players">' +
                                    '<h1>' +
                                        '<img src="css/domino.png" class="main_title_image"> ' +
                                        (data[0])[indexes].Pid + 
                                    '</h1>' +
                                '</div>';
                                already_in++;
                            });
                        },
                        async:false
                    });
                    var i;
                    for (i=already_in;i<$("input[name='pNum']:checked").val();i++) {
                        game_div += '<i class="fas fa-spinner fa-spin loading_players"></i>';
                    }
                    game_div += '</div>'
                    $("#main").html(game_div);
                    var t =  '<a id="go_to_game">' +
                    '<i class="fas fa-dice-two"></i>' +
                        ' Game ' +
                    '</a>';
                    $("#game").html(t);
                }
                else {
                    var currentPlayer = ((data[0])[0]).Turn;
                    $.ajax({ 
                        url: "dominoes.php/game",
                        method: 'GET',
                        dataType: "json",
                        contentType: 'application/json',
                        success: (data) => {
                            var tile;
                            $("#main").addClass('main_min');
                            if (start) {
                                $("#playerswrapper").slideUp(0);
                            }
                            $("#main").addClass('main_min');
                            game_div = '<div id="maingame">' +
                                    '<div class="board">' +
                                        '<canvas id="bone"></canvas>' +
                                        '<div id="droph" class="droph"></div>' +
                                        '<div id="dropt"></div>' +
                                    '</div>' +
                                    '<div id="player_info">' +
                                        '<div id="boneyard">' +
                                            '<div class="BoneyardDominoes">' +
                                                '<h1 class="BoneyardDominoesNumber">' +
                                                    (data[3])[0].boneyard +      
                                                '</h1>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div id="hands">' +
                                            '<div id="canvases">';
                            var i = 1;
                            $.each ((data[4]), function(indexes) {
                                game_div += '<canvas id="bone' + i + '" class="handDominoes"></canvas>';
                                i++;
                            });
                            game_div += '</div>' +
                                        '</div>' +
                                        '<div id="this_player">' +
                                            '<h2 class="this_playerheader">' +
                                                'Player: ' + (data[2])[0].Pid +
                                            '</h2>' +
                                            '<h2 class="this_playerheader">' +
                                                'Score: ' + (data[2])[0].Score + '/100' +
                                            '</h2>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>'
                            var players = '<div class="players">';
                            $.each ((data[0]), function(indexes) {
                                players += '<div class="player">' +
                                        '<div class="playerdominoes">' +
                                            '<h1 class="remainingDominoes">' +
                                                (data[1])[indexes].tiles +
                                            '</h1>' +
                                        '</div>' +
                                        '<div>' +
                                            '<h2 class="playerheader';
                                            if (currentPlayer==(data[0])[indexes].Pid) {
                                                players += ' CurrentPlayer';
                                            } 
                                            players += '">' +
                                                'Player: ' + (data[0])[indexes].Pid + 
                                            '</h2>' +
                                            '<h2 class="playerheader';
                                            if (currentPlayer==(data[0])[indexes].Pid) {
                                                players += ' CurrentPlayer';
                                            } 
                                            players += '">' +
                                                'Score: ' + (data[0])[indexes].Score + '/100' +
                                            '</h2>' +
                                        '</div>' +
                                    '</div>';
                            });
                            players += '</div>';
                            $("#playerswrapper").html(players);
                            if (start) {
                                $("#playerswrapper").slideDown(600);
                            }
                            var t =  '<a id="go_to_game">' +
                            '<i class="fas fa-dice-two"></i>' +
                                ' Game ' +
                            '</a>';
                            $("#game").html(t);
                            if (start) {
                                $("#main").fadeOut(600,() => {
                                    var newinterval = setInterval( () => {
                                        $("#main").html(game_div);
                                        $('#droph').droppable({tolerance: "pointer",drop: function(e){newDomino(e)},over: paintDomino,out: function(e){removePaintedDomino(e)}});
                                        $('#dropt').droppable({tolerance: "pointer",drop: function(e){newDomino(e)},over: paintDomino,out: function(e){removePaintedDomino(e)}});
                                        var ind = 1;
                                        canvas = document.getElementById("bone");
                                        c = canvas.getContext('2d');
                                        if (window.width>=768) {
                                            canvas.width = canvas.clientWidth-230;
                                        }
                                        else {
                                            canvas.width = canvas.clientWidth;
                                        }
                                        canvas.height = canvas.clientHeight;
                                        $.ajax({ 
                                            url: "dominoes.php/board",
                                            method: 'GET',
                                            dataType: "json",
                                            contentType: 'application/json',
                                            success: (board_bones) => {
                                                var tile;
                                                if (board_bones[0].H==board_bones[0].T) {
                                                    tile = new domino(0,0,board_bones[0].H,board_bones[0].T,1,canvas,false);
                                                    tile.draw();
                                                }
                                                else {
                                                    tile = new domino(0,0,board_bones[0].H,board_bones[0].T,4,canvas,false);
                                                    tile.draw();
                                                }
                                                st = true;
                                                sg = true;
                                                H = false;
                                                T = false;
                                                sgrs = tile.rot;
                                                domH = tile;
                                                domT = tile;
                                                $.each (board_bones, function(indexes) {
                                                    if (indexes!=0) {
                                                        sg = false;
                                                        if (board_bones[indexes].status=='H') {
                                                            createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                            domH = temp;
                                                        }
                                                        else if (board_bones[indexes].status=='T') {
                                                            createDomino('dropt',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                            st = false;
                                                            domT = temp;
                                                        }
                                                        else {
                                                            var neighbor = board_bones.find(({Domino}) => Domino === board_bones[indexes].Neighbor);
                                                            if (neighbor.Turn==1) {
                                                                if (st) {
                                                                    createDomino('dropt',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                                    st = false;
                                                                    domT = temp;
                                                                }
                                                                else {
                                                                    createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                                    domH = temp;
                                                                }
                                                            }
                                                            else {
                                                                var max;
                                                                var min;
                                                                if (domH.p2>domH.p1) {
                                                                    max = domH.p2;
                                                                    min = domH.p1;
                                                                }
                                                                else {
                                                                    max = domH.p1;
                                                                    min = domH.p2;
                                                                }
                                                                if (neighbor.H == max && neighbor.T == min) {
                                                                    createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                                    domH = temp;
                                                                }
                                                                else {
                                                                    createDomino('dropT',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                                    domT = temp;
                                                                }
                                                            }
                                                        }
                                                    }
                                                });
                                                domH.droppableH();
                                                if (st) {
                                                    domT.startdroppableT();
                                                }
                                                else {
                                                    domT.droppableT();
                                                }
                                                scaler =  75*Math.min(canvas.height,canvas.width)/1000*(Math.max(canvas.height,canvas.width)/(2.715*Math.min(canvas.height,canvas.width)))*1.5;
                                                $.each ((data[4]), function(indexes) {
                                                    var temp_canvas = document.getElementById('bone' + ind);
                                                    temp_canvas.width = scaler;
                                                    temp_canvas.height = scaler*2;
                                                    window['bone' + ind] = new domino(0,0,(data[4])[indexes].H,(data[4])[indexes].T,1,temp_canvas,true);
                                                    var bone = window['bone' + ind];
                                                    bone.draw();
                                                    if ((data[2])[0].Pid==currentPlayer) {
                                                        if (sg) {
                                                            if (sgrs == 1) {
                                                                if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                                                    bone.color = 'white';
                                                                    for (var i=0;i<5;i++){
                                                                        bone.draw();
                                                                    };
                                                                    $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                }
                                                                else{
                                                                    bone.color = 'black';
                                                                    for (var i=0;i<5;i++){
                                                                        bone.draw();
                                                                    }
                                                                    $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                    $('#bone' + ind).draggable('disable');
                                                                }
                                                            }
                                                            else{
                                                                if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p1 ||  bone.p2 == domT.p1) {
                                                                    bone.color = 'white';
                                                                    for (var i=0;i<5;i++){
                                                                        bone.draw();
                                                                    };
                                                                    $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                }
                                                                else{
                                                                    bone.color = 'black';
                                                                    for (var i=0;i<5;i++){
                                                                        bone.draw();
                                                                    }
                                                                    $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                    $('#bone' + ind).draggable('disable');
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            switch (sgrs) {
                                                                case 1:
                                                                    if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                                                        bone.color = 'white';
                                                                        for (var i=0;i<5;i++){
                                                                            bone.draw();
                                                                        };
                                                                        $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                    }
                                                                    else{
                                                                        bone.color = 'black';
                                                                        for (var i=0;i<5;i++){
                                                                            bone.draw();
                                                                        }
                                                                        $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                        $('#bone' + ind).draggable('disable');
                                                                    }
                                                                    break;
                                                                case 4:
                                                                    if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                                                        bone.color = 'white';
                                                                        for (var i=0;i<5;i++){
                                                                            bone.draw();
                                                                        };
                                                                        $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                    }
                                                                    else{
                                                                        bone.color = 'black';
                                                                        for (var i=0;i<5;i++){
                                                                            bone.draw();
                                                                        }
                                                                        $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                        $('#bone' + ind).draggable('disable');
                                                                    }
                                                                    break;
                                                                default:
                                                                    break;
                                                            }
                                                        }
                                                    }
                                                    ind++;
                                                });
                                                count_hands = ind;
                                            },
                                            async:false
                                        });
                                    } ,1)
                                    $("#main").fadeIn(600, () =>{clearInterval(newinterval);});
                                    start=false;
                                });
                            }
                            else {
                                $("#main").html(game_div);
                                $('#droph').droppable({tolerance: "pointer",drop: function(e){newDomino(e)},over: paintDomino,out: function(e){removePaintedDomino(e)}});
                                $('#dropt').droppable({tolerance: "pointer",drop: function(e){newDomino(e)},over: paintDomino,out: function(e){removePaintedDomino(e)}});           
                                var ind = 1;
                                canvas = document.getElementById("bone");
                                c = canvas.getContext('2d');
                                if (window.width>=768) {
                                    canvas.width = canvas.clientWidth-230;
                                }
                                else {
                                    canvas.width = canvas.clientWidth;
                                }
                                canvas.height = canvas.clientHeight;
                                $.ajax({ 
                                    url: "dominoes.php/board",
                                    method: 'GET',
                                    dataType: "json",
                                    contentType: 'application/json',
                                    success: (board_bones) => {
                                        var tile;
                                        if (board_bones[0].H==board_bones[0].T) {
                                            tile = new domino(0,0,board_bones[0].H,board_bones[0].T,1,canvas,false);
                                            tile.draw();
                                        }
                                        else {
                                            tile = new domino(0,0,board_bones[0].H,board_bones[0].T,4,canvas,false);
                                            tile.draw();
                                        }
                                        st = true;
                                        sg = true;
                                        H = false;
                                        T = false;
                                        sgrs = tile.rot;
                                        domH = tile;
                                        domT = tile;
                                        $.each (board_bones, function(indexes) {
                                            if (indexes!=0) {
                                                sg = false;
                                                if (board_bones[indexes].status=='H') {
                                                    createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                    domH = temp;
                                                }
                                                else if (board_bones[indexes].status=='T') {
                                                    createDomino('dropt',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                    st = false;
                                                    domT = temp;
                                                }
                                                else {
                                                    var neighbor = board_bones.find(({Domino}) => Domino === board_bones[indexes].Neighbor);
                                                    if (neighbor.Turn==1) {
                                                        if (st) {
                                                            createDomino('dropt',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                            st = false;
                                                            domT = temp;
                                                        }
                                                        else {
                                                            createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                            domH = temp;
                                                        }
                                                    }
                                                    else {
                                                        var max;
                                                        var min;
                                                        if (domH.p2>domH.p1) {
                                                            max = domH.p2;
                                                            min = domH.p1;
                                                        }
                                                        else {
                                                            max = domH.p1;
                                                            min = domH.p2;
                                                        }
                                                        if (neighbor.H == max && neighbor.T == min) {
                                                            createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                            domH = temp;
                                                        }
                                                        else {
                                                            createDomino('dropT',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                            domT = temp;
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                        domH.droppableH();
                                        if (st) {
                                            domT.startdroppableT();
                                        }
                                        else {
                                            domT.droppableT();
                                        }
                                        scaler =  75*Math.min(canvas.height,canvas.width)/1000*(Math.max(canvas.height,canvas.width)/(2.715*Math.min(canvas.height,canvas.width)))*1.5;
                                        $.each ((data[4]), function(indexes) {
                                            var temp_canvas = document.getElementById('bone' + (indexes+1));
                                            temp_canvas.width = 0;
                                            temp_canvas.height = 0;
                                        });
                                        $.each ((data[4]), function(indexes) {
                                            if (count_hands<ind) {
                                                clearInterval(timer);
                                                var new_hand = setInterval( () => {
                                                    var temp_canvas = document.getElementById('bone' + count_hands);
                                                    temp_canvas.width = scaler;
                                                    temp_canvas.height = scaler*2;
                                                    window['bone' + count_hands] = new domino(0,0,(data[4])[count_hands-1].H,(data[4])[count_hands-1].T,1,temp_canvas,true);
                                                    var bone = window['bone' + count_hands];
                                                    bone.draw();
                                                    if ((data[2])[0].Pid==currentPlayer) {
                                                        if (sg) {
                                                            if (sgrs == 1) {
                                                                if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                                                    bone.color = 'white';
                                                                    for (var i=0;i<5;i++){
                                                                        bone.draw();
                                                                    };
                                                                    $('#bone' + count_hands).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                }
                                                                else{
                                                                    bone.color = 'black';
                                                                    for (var i=0;i<5;i++){
                                                                        bone.draw();
                                                                    }
                                                                    $('#bone' + count_hands).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                    $('#bone' + count_hands).draggable('disable');
                                                                }
                                                            }
                                                            else{
                                                                if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p1 ||  bone.p2 == domT.p1) {
                                                                    bone.color = 'white';
                                                                    for (var i=0;i<5;i++){
                                                                        bone.draw();
                                                                    };
                                                                    $('#bone' + count_hands).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                }
                                                                else{
                                                                    bone.color = 'black';
                                                                    for (var i=0;i<5;i++){
                                                                        bone.draw();
                                                                    }
                                                                    $('#bone' + count_hands).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                    $('#bone' + count_hands).draggable('disable');
                                                                }
                                                            }
                                                        }
                                                        else {
                                                            switch (sgrs) {
                                                                case 1:
                                                                    if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                                                        bone.color = 'white';
                                                                        for (var i=0;i<5;i++){
                                                                            bone.draw();
                                                                        };
                                                                        $('#bone' + count_hands).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                    }
                                                                    else{
                                                                        bone.color = 'black';
                                                                        for (var i=0;i<5;i++){
                                                                            bone.draw();
                                                                        }
                                                                        $('#bone' + count_hands).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                        $('#bone' + count_hands).draggable('disable');
                                                                    }
                                                                    break;
                                                                case 4:
                                                                    if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                                                        bone.color = 'white';
                                                                        for (var i=0;i<5;i++){
                                                                            bone.draw();
                                                                        };
                                                                        $('#bone' + count_hands).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                    }
                                                                    else{
                                                                        bone.color = 'black';
                                                                        for (var i=0;i<5;i++){
                                                                            bone.draw();
                                                                        }
                                                                        $('#bone' + count_hands).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                        $('#bone' + count_hands).draggable('disable');
                                                                    }
                                                                    break;
                                                                default:
                                                                    break;
                                                            }
                                                        }
                                                    }
                                                    count_hands++;
                                                    if (count_hands>(data[4]).length) {
                                                        timer=setInterval(() => {checkgame();}, 4000);
                                                        clearInterval(new_hand);
                                                    }
                                                }, 500);
                                                return false;
                                            }
                                            var temp_canvas = document.getElementById('bone' + ind);
                                            temp_canvas.width = scaler;
                                            temp_canvas.height = scaler*2;
                                            window['bone' + ind] = new domino(0,0,(data[4])[indexes].H,(data[4])[indexes].T,1,temp_canvas,true);
                                            var bone = window['bone' + ind];
                                            bone.draw();
                                            if ((data[2])[0].Pid==currentPlayer) {
                                                if (sg) {
                                                    if (sgrs == 1) {
                                                        if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                                            bone.color = 'white';
                                                            for (var i=0;i<5;i++){
                                                                bone.draw();
                                                            };
                                                            $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                        }
                                                        else{
                                                            bone.color = 'black';
                                                            for (var i=0;i<5;i++){
                                                                bone.draw();
                                                            }
                                                            $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                            $('#bone' + ind).draggable('disable');
                                                        }
                                                    }
                                                    else{
                                                        if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p1 ||  bone.p2 == domT.p1) {
                                                            bone.color = 'white';
                                                            for (var i=0;i<5;i++){
                                                                bone.draw();
                                                            };
                                                            $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                        }
                                                        else{
                                                            bone.color = 'black';
                                                            for (var i=0;i<5;i++){
                                                                bone.draw();
                                                            }
                                                            $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                            $('#bone' + ind).draggable('disable');
                                                        }
                                                    }
                                                }
                                                else {
                                                    switch (sgrs) {
                                                        case 1:
                                                            if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                                                bone.color = 'white';
                                                                for (var i=0;i<5;i++){
                                                                    bone.draw();
                                                                };
                                                                $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                            }
                                                            else{
                                                                bone.color = 'black';
                                                                for (var i=0;i<5;i++){
                                                                    bone.draw();
                                                                }
                                                                $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                $('#bone' + ind).draggable('disable');
                                                            }
                                                            break;
                                                        case 4:
                                                            if (bone.p1 == domH.p2 || bone.p2 == domH.p2 || bone.p1 == domT.p2 ||  bone.p2 == domT.p2) {
                                                                bone.color = 'white';
                                                                for (var i=0;i<5;i++){
                                                                    bone.draw();
                                                                };
                                                                $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                            }
                                                            else{
                                                                bone.color = 'black';
                                                                for (var i=0;i<5;i++){
                                                                    bone.draw();
                                                                }
                                                                $('#bone' + ind).draggable({revert:'invalid',start: function(e){startDraggable(e,bone);},stop: stopDraggable}).draggable('enable');
                                                                $('#bone' + ind).draggable('disable');
                                                            }
                                                            break;
                                                        default:
                                                            break;
                                                    }
                                                }
                                            }
                                            ind++;
                                        });
                                        count_hands = ind;
                                    },
                                    async:false
                                });
                                $( window ).off("resize", resizer);
                                $('#sidebarCollapse').off("click", resizer);
                            }
                            $.ajax({ 
                                url: "dominoes.php/board",
                                method: 'GET',
                                dataType: "json",
                                contentType: 'application/json',
                                success: (board_bones) => {
                                    $( window ).resize( resizer = () => {
                                        var transition = setInterval(() => {
                                            var canvas = document.getElementById("bone");
                                            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                                            canvas.width = canvas.clientWidth;
                                            canvas.height = canvas.clientHeight;
                                            var tile;
                                            if (board_bones[0].H==board_bones[0].T) {
                                                tile = new domino(0,0,board_bones[0].H,board_bones[0].T,1,canvas,false);
                                                tile.draw();
                                            }
                                            else {
                                                tile = new domino(0,0,board_bones[0].H,board_bones[0].T,4,canvas,false);
                                                tile.draw();
                                            }
                                            st = true;
                                            sg = true;
                                            H = false;
                                            T = false;
                                            sgrs = tile.rot;
                                            domH = tile;
                                            domT = tile;
                                            $.each (board_bones, function(indexes) {
                                                if (indexes!=0) {
                                                    sg = false;
                                                    if (board_bones[indexes].status=='H') {
                                                        createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                        domH = temp;
                                                    }
                                                    else if (board_bones[indexes].status=='T') {
                                                        createDomino('dropt',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                        st = false;
                                                        domT = temp;
                                                    }
                                                    else {
                                                        var neighbor = board_bones.find(({Domino}) => Domino === board_bones[indexes].Neighbor);
                                                        if (neighbor.Turn==1) {
                                                            if (st) {
                                                                createDomino('dropt',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                                st = false;
                                                                domT = temp;
                                                            }
                                                            else {
                                                                createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                                domH = temp;
                                                            }
                                                        }
                                                        else {
                                                            var max;
                                                            var min;
                                                            if (domH.p2>domH.p1) {
                                                                max = domH.p2;
                                                                min = domH.p1;
                                                            }
                                                            else {
                                                                max = domH.p1;
                                                                min = domH.p2;
                                                            }
                                                            if (neighbor.H == max && neighbor.T == min) {
                                                                createDomino('droph',domH,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                                domH = temp;
                                                            }
                                                            else {
                                                                createDomino('dropT',domT,canvas,board_bones[indexes].H,board_bones[indexes].T);
                                                                domT = temp;
                                                            }
                                                        }
                                                    }
                                                }
                                            });
                                            domH.droppableH();
                                            if (st) {
                                                domT.startdroppableT();
                                            }
                                            else {
                                                domT.droppableT();
                                            }
                                            scaler =  75*Math.min(canvas.height,canvas.width)/1000*(Math.max(canvas.height,canvas.width)/(2.715*Math.min(canvas.height,canvas.width)))*1.5;
                                            var i = 1;
                                            $.each ((data[4]), function(indexes) {
                                                var temp_canvas = document.getElementById('bone' + i);
                                                temp_canvas.width = scaler;
                                                temp_canvas.height = scaler*2;
                                                temp_canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
                                                for (var colorizing=0;colorizing<5;colorizing++) {
                                                    window['bone' + i].draw();
                                                }
                                                i++;
                
                                            });        
                                        },1);
                                        setTimeout( () => {
                                            clearInterval(transition);
                                        },300);
                                        $('#sidebarCollapse').on('click',resizer);
                                    });
                                },
                                async:false
                            });
                        }
                    });
                }
            }
            else {
                $.ajax({ 
                    url: "dominoes.php/users",
                    method: 'GET',
                    dataType: "json",
                    contentType: 'application/json',
                    success: (data) => {
                        $("#Name").text(data[0].Name);
                        $("#Wins").text("Wins=" + data[0].W);
                        $("#Losses").text("Losses=" + data[0].L);
                    },
                    async:false
                });
                $("#main").removeClass('main_min');
                $( window ).off("resize", resizer);
                $('#sidebarCollapse').off("click", resizer);
                start=true;
                game_status = true;
                if (data[0]) {
                    if (((data[0])[0]).g_status=='aborded') {
                        clearInterval(timer);
                        timer=setInterval(() => {checkgame();}, 20000);
                        var t =  '<a id="go_to_game">' +
                        '<i class="fas fa-dice-two"></i>' +
                            ' Game ' +
                        '</a>';
                        $("#game").html(t);
                        $("#main").fadeOut(600,() => {
                            let toasts = new toast();
                            toasts.show(data.errormesg,'info');
                            game_div = '<div class="searching">' +
                                '<div class="loading_players">' +
                                    '<h1>' +
                                        '<img src="css/domino.png" class="main_title_image">' +
                                        ' ' + data.errormesg +
                                    '</h1>' +
                                    '<button id="return" class="btn load_more"><span>Home</span></button>' +
                                '</div>' +
                            '</div>';
                            $("#main").html(game_div);
                            $("#main").fadeIn(600);
                            $("#return").click((e) => {
                                e.preventDefault();
                                let toasts = new toast();
                                $.ajax({
                                    url: "dominoes.php/game",
                                    method: 'DELETE',
                                    dataType: "json",
                                    contentType: 'application/json',
                                    success: () => {
                                        $("#playerswrapper").html("");
                                        game_status = false;
                                        clearInterval(timer);
                                        var t = '<a id="go_to_game" href="#gameSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">' +
                                            '<i class="fas fa-dice-two"></i>' +
                                                ' Game' +
                                            '</a>' +
                                            '<ul class="collapse list-unstyled content" id="gameSubmenu">' +
                                                '<li>' +
                                                    '<a href="#playersSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">' +
                                                        '<i class="fas fa-cog"></i>' +
                                                        ' Mode' +
                                                    '</a>' +
                                                    '<ul class="collapse list-unstyled content" id="playersSubmenu">' +
                                                        '<li>' +
                                                            '<a>' +
                                                                '<input type="radio" id="p2" name="pNum" value="2" checked>' +
                                                                '<label for="p2">2</label>' +
                                                            '</a>' +
                                                        '</li>' +
                                                        '<li>' +
                                                            '<a>' +
                                                                '<input type="radio" id="p3" name="pNum" value="3">' +
                                                                '<label for="p3">3</label>' +
                                                            '</a>' +
                                                        '</li>' +
                                                        '<li>' +
                                                            '<a>' +
                                                                '<input type="radio" id="p4" name="pNum" value="4">' +
                                                                '<label for="p4">4</label>' +
                                                            '</a>' +
                                                        '</li>' +
                                                    '</ul>' +
                                                    '<a id="find">' +
                                                    '</a>' +
                                                ' </li>' +
                                            '</ul>';
                                        $("#game").html(t);
                                        $("#wrapper").toggleClass('wrapper_title');
                                        $("#main").fadeOut(600,() => {
                                            game_div='<div class="main_title" id="main_title">' +
                                                '<h1><img src="css/domino.png" class="main_title_image"> Dominoes</h1>' +
                                            '</div>';
                                            $("#main").html(game_div);
                                            $("#main").fadeIn(600);
                                        });
                                        $("input[name='pNum']").attr("disabled",false);
                                        $("#find").html('<i id="sIcon" class="fas fa-search"></i> Find Game');
                                        $("#find").click((e) => {
                                            e.preventDefault();
                                            find_game();
                                        });  
                                    },
                                    error: (er) => {
                                        const msg = JSON.parse(er.responseText);
                                        toasts.show(msg.errormesg,'error');
                                    },
                                    async:false
                                });
                            }); 
                        });
                    }
                    else {
                        clearInterval(timer);
                        timer=setInterval(() => {checkgame();}, 20000);
                        var t =  '<a id="go_to_game">' +
                        '<i class="fas fa-dice-two"></i>' +
                            ' Game ' +
                        '</a>';
                        $("#game").html(t);
                        $("#main").fadeOut(600,() => {
                            game_div = '<div class="searching">' +
                                '<div class="loading_players">' +
                                    '<h1>' +
                                        '<img src="css/domino.png" class="main_title_image">' +
                                        ' Winner: ' + (data[0])[0].result +
                                    '</h1>' +
                                    '<button id="return" class="btn load_more"><span>Home</span></button>' +
                                '</div>' +
                            '</div>';
                            $("#main").html(game_div);
                            $("#main").fadeIn(600);
                            $("#return").click((e) => {
                                e.preventDefault();
                                let toasts = new toast();
                                $.ajax({
                                    url: "dominoes.php/game",
                                    method: 'DELETE',
                                    dataType: "json",
                                    contentType: 'application/json',
                                    success: () => {
                                        $("#playerswrapper").html("");
                                        game_status = false;
                                        clearInterval(timer);
                                        var t = '<a id="go_to_game" href="#gameSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">' +
                                            '<i class="fas fa-dice-two"></i>' +
                                                ' Game' +
                                            '</a>' +
                                            '<ul class="collapse list-unstyled content" id="gameSubmenu">' +
                                                '<li>' +
                                                    '<a href="#playersSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">' +
                                                        '<i class="fas fa-cog"></i>' +
                                                        ' Mode' +
                                                    '</a>' +
                                                    '<ul class="collapse list-unstyled content" id="playersSubmenu">' +
                                                        '<li>' +
                                                            '<a>' +
                                                                '<input type="radio" id="p2" name="pNum" value="2" checked>' +
                                                                '<label for="p2">2</label>' +
                                                            '</a>' +
                                                        '</li>' +
                                                        '<li>' +
                                                            '<a>' +
                                                                '<input type="radio" id="p3" name="pNum" value="3">' +
                                                                '<label for="p3">3</label>' +
                                                            '</a>' +
                                                        '</li>' +
                                                        '<li>' +
                                                            '<a>' +
                                                                '<input type="radio" id="p4" name="pNum" value="4">' +
                                                                '<label for="p4">4</label>' +
                                                            '</a>' +
                                                        '</li>' +
                                                    '</ul>' +
                                                    '<a id="find">' +
                                                    '</a>' +
                                                ' </li>' +
                                            '</ul>';
                                        $("#game").html(t);
                                        $("#wrapper").toggleClass('wrapper_title');
                                        $("#main").fadeOut(600,() => {
                                            game_div='<div class="main_title" id="main_title">' +
                                                '<h1><img src="css/domino.png" class="main_title_image"> Dominoes</h1>' +
                                            '</div>';
                                            $("#main").html(game_div);
                                            $("#main").fadeIn(600);
                                        });
                                        $("input[name='pNum']").attr("disabled",false);
                                        $("#find").html('<i id="sIcon" class="fas fa-search"></i> Find Game');
                                        $("#find").click((e) => {
                                            e.preventDefault();
                                            find_game();
                                        });  
                                    },
                                    error: (er) => {
                                        const msg = JSON.parse(er.responseText);
                                        toasts.show(msg.errormesg,'error');
                                    },
                                    async:false
                                });
                            });
                        });
                    }
                }
                else {
                    $("#playerswrapper").html("");
                    game_status = false;
                    clearInterval(timer);
                    var t = '<a id="go_to_game" href="#gameSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">' +
                        '<i class="fas fa-dice-two"></i>' +
                            ' Game' +
                        '</a>' +
                        '<ul class="collapse list-unstyled content" id="gameSubmenu">' +
                            '<li>' +
                                '<a href="#playersSubmenu" data-toggle="collapse" aria-expanded="false" class="dropdown-toggle">' +
                                    '<i class="fas fa-cog"></i>' +
                                    ' Mode' +
                                '</a>' +
                                '<ul class="collapse list-unstyled content" id="playersSubmenu">' +
                                    '<li>' +
                                        '<a>' +
                                            '<input type="radio" id="p2" name="pNum" value="2" checked>' +
                                            '<label for="p2">2</label>' +
                                        '</a>' +
                                    '</li>' +
                                    '<li>' +
                                        '<a>' +
                                            '<input type="radio" id="p3" name="pNum" value="3">' +
                                            '<label for="p3">3</label>' +
                                        '</a>' +
                                    '</li>' +
                                    '<li>' +
                                        '<a>' +
                                            '<input type="radio" id="p4" name="pNum" value="4">' +
                                            '<label for="p4">4</label>' +
                                        '</a>' +
                                    '</li>' +
                                '</ul>' +
                                '<a id="find">' +
                                '</a>' +
                            ' </li>' +
                        '</ul>';
                    $("#game").html(t);
                    $("#wrapper").toggleClass('wrapper_title');
                    $("#main").fadeOut(600,() => {
                        game_div='<div class="main_title" id="main_title">' +
                            '<h1><img src="css/domino.png" class="main_title_image"> Dominoes</h1>' +
                        '</div>';
                        $("#main").html(game_div);
                        $("#main").fadeIn(600);
                    });
                    $("input[name='pNum']").attr("disabled",false);
                    $("#find").html('<i id="sIcon" class="fas fa-search"></i> Find Game');
                    $("#find").click((e) => {
                        e.preventDefault();
                        find_game();
                    });  
                }
            }
        },
    });
}

function draw_scoreboard() {
	var t='<div id="scores_div">' +
    '<table id="score_table" class="table table-hover scores">' +
        '<thead>' +
            '<tr>' +
                '<th scope="col">#</th>' +
                '<th scope="col">User</th>' +
                '<th scope="col">Wins</th>' +
                '<th scope="col">Losses</th>' +
                '<th scope="col">Win rate</th>' +
                '</tr>' +
        '</thead>' +
        '<tbody>';
	$.ajax({ 
        url: "dominoes.php/users/highscores",
        method: 'POST',
        dataType: "json",
        contentType: 'application/json',
        data: JSON.stringify({offset: index}),
        success: (data) => {
            $.each (data, function( indexes) {
                index++;
                t += '<tr>' +
                    '<th scope="row">' + index + '</th>' +
                    '<td>' + data[indexes].Name + '</td>' +
                    '<td>' + data[indexes].W + '</td>' +
                    '<td>' + data[indexes].L + '</td>' +
                    '<td>' + data[indexes].WR + '</td>' +
                '</tr>';
            });
            t += '</tbody>' +
            '</table>';
            t += '<button id="lmbtn" class="btn load_more"><span>Load more</span></button></div>'
            $('#main').fadeOut(0);
            $('#main').html(t);
            $('#main').fadeIn(600);
            $("#lmbtn").click(() => {
                $.ajax({ 
                    url: "dominoes.php/users/highscores",
                    method: 'POST',
                    dataType: "json",
                    contentType: 'application/json',
                    data: JSON.stringify({offset: index}),
                    success: (data) => {
                        $.each (data, function(indexes) {
                            index++;
                            var newT;
                            newT += '<tr id="tr' + index + '"style="display: none;">' +
                                '<th scope="row">' + index + '</th>' +
                                '<td>' + data[indexes].Name + '</td>' +
                                '<td>' + data[indexes].W + '</td>' +
                                '<td>' + data[indexes].L + '</td>' +
                                '<td>' + data[indexes].WR + '</td>' +
                            '</tr>'; 
                            $('#score_table').append(newT);
                            $('#tr' + index).show(600);
                        });
                    },
                    error: (er) => {
                        let toasts = new toast();
                        const msg = JSON.parse(er.responseText);
                        toasts.show(msg.errormesg,'error');
                    }
                });
            });
        },
        error: (er) => {
            let toasts = new toast();
            const msg = JSON.parse(er.responseText);
            toasts.show(msg.errormesg,'error');
        }
    });
}
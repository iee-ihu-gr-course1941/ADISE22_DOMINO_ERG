class domino{
    canvas;
    c;
    scale;
    x;
    y;
    rot;
    x1;
    y1;
    p1;
    p2;
    actual_width;
    actual_height;
    inHand;
    color;
    
    constructor(x,y,p1,p2,rot,canvas,inHand) {
        this.canvas = canvas;
        this.c = canvas.getContext('2d');
        this.x1 = x;
        this.y1 = y;
        this.p1 = p1;
        this.p2 = p2;
        this.rot = rot;
        this.inHand = inHand;
        this.color = 'black';
    }

    #init(p1,p2) {
        if (this.inHand) {
            this.x = this.canvas.width/2;
            this.y = this.canvas.height/2;
        }
        else {
            this.x = this.canvas.width/2+p1*this.scale;
            this.y = this.canvas.height/2-p2*this.scale;
        }
    }
    
    //bone-numbers
    #n1() {
        this.c.strokeStyle = 'black';
        this.c.fillStyle = 'white';
        this.c.beginPath();
        this.c.arc(this.x+37.5*this.scale,this.y+37.5*this.scale,4.5*this.scale,0,Math.PI*3*this.scale,false);
        this.c.stroke();
        this.c.fill();
    }
    
    #n2(p1,p2,rot = 1) {
        this.c.strokeStyle = 'black';
        this.c.fillStyle = 'white';
        if(rot == 2 || rot == 4) {
            for (var i = 0; i < 2; i++){
                this.c.beginPath();
                this.c.arc(this.x+22.5*this.scale,this.y+22.5*this.scale,4.5*this.scale,0,Math.PI*3*this.scale,false);
                this.c.stroke();
                this.c.fill();
                this.x += p1;
                this.y -= p2;
            }
            this.y += p2 * 4;
        }
        else {
            for (var i = 0; i < 2; i++){
                this.c.beginPath();
                this.c.arc(this.x+22.5*this.scale,this.y+52.5*this.scale,4.5*this.scale,0,Math.PI*3*this.scale,false);
                this.c.stroke();
                this.c.fill();
                this.x += p1;
                this.y += p2;
            }
        }
    }
    
    #n3(p1,p2,rot = 1) {
        this.c.strokeStyle = 'black';
        this.c.fillStyle = 'white';
        if(rot == 2 || rot == 4) {
            for (var i = 0; i < 3; i++){
                this.c.beginPath();
                this.c.arc(this.x+22.5*this.scale,this.y+22.5*this.scale,4.5*this.scale,0,Math.PI*3*this.scale,false);
                this.c.stroke();
                this.c.fill();
                this.x += p1;
                this.y -= p2;
            }
            this.y += p2 * 6;
        }
        else {
            for (var i = 0; i < 3; i++){
                this.c.beginPath();
                this.c.arc(this.x+22.5*this.scale,this.y+52.5*this.scale,4.5*this.scale,0,Math.PI*3*this.scale,false);
                this.c.stroke();
                this.c.fill();
                this.x += p1;
                this.y += p2;
            }
        }
        
    }
    
    #n4() {
        this.c.strokeStyle = 'black';
        this.c.fillStyle = 'white';
        this.#n2(30*this.scale,-30*this.scale);
        this.x -= 60*this.scale;
        this.y += 30*this.scale;
        this.#n2(30*this.scale,30*this.scale);
    }
    
    #n5() {
        this.c.strokeStyle = 'black';
        this.c.fillStyle = 'white';
        this.#n2(30*this.scale,-30*this.scale);
        this.x -= 60*this.scale;
        this.y += 30*this.scale;
        this.#n3(15*this.scale,15*this.scale);
    }
    
    #n6(rot) {
        this.c.strokeStyle = 'black';
        this.c.fillStyle = 'white';
        if(rot == 2 || rot == 4) {
            this.#n3(15*this.scale,0);
            this.x -= 45*this.scale;
            this.y -= 30*this.scale;
            this.#n3(15*this.scale,0);
            this.x -= 15*this.scale;
            this.y -= 15*this.scale;
        }
        else {
            this.#n3(0,-15*this.scale);
            this.x += 30*this.scale;
            this.y += 45*this.scale;
            this.#n3(0,-15*this.scale);
        }
    }
    
    #number(p1,rot) {
        var xdis = 0;
        var ydis = 0;
        switch(p1) {
            case 0:
                switch(rot) {
                    case 1:
                        ydis = -75*this.scale;
                        break;
                    case 2:
                        xdis = 75*this.scale;
                        break;
                    case 3:
                        ydis = 75*this.scale;
                        break;
                    case 4:
                        xdis = -75*this.scale;
                        break;
                    default:
                        break; 
                }
                break;
            case 1:
                this.#n1();
                switch(rot) {
                    case 1:
                        ydis = -75*this.scale;
                        break;
                    case 2:
                        xdis = 75*this.scale;
                        break;
                    case 3:
                        ydis = 75*this.scale;
                        break;
                    case 4:
                        xdis = -75*this.scale;
                        break;
                    default:
                        break; 
                }
                break;
            case 2:
                this.#n2(30*this.scale,-30*this.scale,rot);
                switch(rot) {
                    case 1:
                        xdis = -60*this.scale;
                        ydis = -15*this.scale;
                        break;
                    case 2:
                        xdis = 15*this.scale;
                        ydis = 60*this.scale;
                        break;
                    case 3:
                        xdis = -60*this.scale;
                        ydis = 135*this.scale;
                        break;
                    case 4:
                        xdis = -135*this.scale;
                        ydis = 60*this.scale;
                        break;
                    default:
                        break; 
                }
                break;
            case 3:
                this.#n3(15*this.scale,-15*this.scale,rot);
                switch(rot) {
                    case 1:
                        xdis = -45*this.scale;
                        ydis = -30*this.scale;
                        break;
                    case 2:
                        xdis = 30*this.scale;
                        ydis = 45*this.scale;
                        break;
                    case 3:
                        xdis = -45*this.scale;
                        ydis = 120*this.scale;
                        break;
                    case 4:
                        xdis = -120*this.scale;
                        ydis = 45*this.scale;
                        break;
                    default:
                        break; 
                }
                break;
            case 4:
                this.#n4();
                switch(rot) {
                    case 1:
                        xdis = -60*this.scale;
                        ydis = -105*this.scale;
                        break;
                    case 2:
                        xdis = 15*this.scale;
                        ydis = -30*this.scale;
                        break;
                    case 3:
                        xdis = -60*this.scale;
                        ydis = 45*this.scale;
                        break;
                    case 4:
                        xdis = -135*this.scale;
                        ydis = -30*this.scale;
                        break;
                    default:
                        break; 
                }
                break;
            case 5:
                this.#n5();
                switch(rot) {
                    case 1:
                        xdis = -45*this.scale;
                        ydis = -90*this.scale;
                        break;
                    case 2:
                        xdis = 30*this.scale;
                        ydis = -15*this.scale;
                        break;
                    case 3:
                        xdis = -45*this.scale;
                        ydis = 60*this.scale;
                        break;
                    case 4:
                        xdis = -120*this.scale;
                        ydis = -15*this.scale;
                        break;
                    default:
                        break; 
                }
                break;
            case 6:
                this.#n6(rot);
                switch(rot) {
                    case 1:
                        xdis = -30*this.scale;
                        ydis = -30*this.scale;
                        break;
                    case 2:
                        xdis = 45*this.scale;
                        ydis = 45*this.scale;
                        break;
                    case 3:
                        xdis = -30*this.scale;
                        ydis = 120*this.scale;
                        break;
                    case 4:
                        xdis = -105*this.scale;
                        ydis = 45*this.scale;
                        break;
                    default:
                        break; 
                }
                break;
            default:
                break;
        }
        this.x += xdis;
        this.y += ydis;
    }
    
    //bone-tiles
    #tile(rot) {
        var width = 0;
        var height = 0;
        var xdis = 0;
        var ydis = 0;
        switch(rot) {
            case 1:
                width = 75*this.scale;
                height = 150*this.scale;
                ydis = -75*this.scale;
                this.x -= width/2;
                break;
            case 2:
                width = 150*this.scale;
                height = 75*this.scale;
                this.x -= width/2;
                this.y -= height/2;
                break;
            case 3:
                width = 75*this.scale;
                height = 150*this.scale;
                this.x -= width/2;
                this.y -= height/2;
                break;
            case 4:
                width = 150*this.scale;
                height = 75*this.scale;
                xdis = -75*this.scale;
                this.y -= height/2;
                break;
            default:
                break;
        }
        this.actual_height = 75*this.scale;
        this.actual_width = 75*this.scale;
        this.c.strokeStyle = this.color;
        if (this.inHand) {
            this.c.lineWidth = 2;
        }
        else {
            this.c.lineWidth = 1;
        }
        this.c.fillStyle = 'black';
        this.c.beginPath();
        this.c.roundRect(this.x+xdis,this.y+ydis,width,height,[12*this.scale]);
        this.c.stroke();
        this.c.fill();
    }
    
    //bone-line_separators
    #sline(rot) {
        var v1 = 0;
        var v2 = 0;
        var v3 = 0;
        var v4 = 0;
        switch(rot) {
            case 1:
                v1 = 7.5*this.scale;
                v3 = 67.5*this.scale;
                break;
            case 2:
                v1 = 75*this.scale;
                v2 = 7.5*this.scale;
                v3 = 75*this.scale;
                v4 = 67.5*this.scale;
                break;
            case 3:
                v1 = 7.5*this.scale;
                v2 = 75*this.scale;
                v3 = 67.5*this.scale;
                v4 = 75*this.scale;
                break;
            case 4:
                v2 = 7.5*this.scale;
                v4 = 67.5*this.scale;
                break;
            default:
                break;
        }
        this.c.strokeStyle = 'white';
        this.c.beginPath();
        this.c.moveTo(this.x+v1,this.y+v2);
        this.c.lineTo(this.x+v3,this.y+v4);
        this.c.stroke();
    }

    draw() {
        if (this.inHand) {
            this.scale = Math.min(this.canvas.height,this.canvas.width)/80;
        }
        else {
            this.scale = Math.min(this.canvas.height,this.canvas.width)/1000 *
            (Math.max(this.canvas.height,this.canvas.width)/(2.8*Math.min(this.canvas.height,this.canvas.width)));
        }
        this.#init(this.x1,this.y1);
        this.#tile(this.rot);
        this.#sline(this.rot);
        this.#number(this.p1,this.rot);
        this.#number(this.p2,this.rot);  
    }

    startdroppableT() {
        if (this.p1!=this.p2) {
            switch(this.rot) {
                case 1:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                case 2:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width*2});
                    break;
                case 3:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height*2,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                case 4:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale});
                    break;
                default:
                    break;
            }
        }
        else {
            switch(this.rot) {
                case 1:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale});
                    break;
                case 2:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                case 3:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale-2*this.actual_width});
                    break;
                case 4:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height*2,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                default:
                    break;
            }
        }
    }

    droppableT() {
        if (this.p1!=this.p2) {
            switch(this.rot) {
                case 1:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height*2,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                case 2:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale});
                    break;
                case 3:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                case 4:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width*2});
                    break;
                default:
                    break;
            }
        }
        else {
            switch(this.rot) {
                case 1:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width*2});
                    break;
                case 2:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height*2,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                case 3:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale});
                    break;
                case 4:
                    $('#dropt').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                default:
                    break;
            }
        }
    }

    droppableH() {
        if (this.p1!=this.p2) {
            switch(this.rot) {
                case 1:
                    $('#droph').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height*2,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                case 2:
                    $('#droph').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale});
                    break;
                case 3:
                    $('#droph').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                case 4:
                    $('#droph').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width*2});
                    break;
                default:
                    break;
            }
        }
        else {
            switch(this.rot) {
                case 1:
                    $('#droph').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width*2});
                    break;
                case 2:
                    $('#droph').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height*2,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                case 3:
                    $('#droph').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale-this.actual_height,
                        "left":this.canvas.width/2+this.x1*this.scale});
                    break;
                case 4:
                    $('#droph').css({"background-color":"transparent",
                        "width":this.actual_width*2,
                        "height":this.actual_height*2,
                        "position":"absolute",
                        "top":this.canvas.height/2-this.y1*this.scale,
                        "left":this.canvas.width/2+this.x1*this.scale-this.actual_width});
                    break;
                default:
                    break;
            }
        }
    }

    clear() {
        switch(this.rot) {
            case 1:
                this.c.clearRect(this.canvas.width/2+this.x1*this.scale-this.actual_width/2-1, this.canvas.height/2-this.y1*this.scale-this.actual_height-1,this.actual_width+2,this.actual_height*2+2);
                break;
            case 2:
                this.c.clearRect(this.canvas.width/2+this.x1*this.scale-this.actual_width-1, this.canvas.height/2-this.y1*this.scale-this.actual_height/2-1,this.actual_width*2+2,this.actual_height+2);
                break;
            case 3:
                this.c.clearRect(this.canvas.width/2+this.x1*this.scale-this.actual_width/2-1, this.canvas.height/2-this.y1*this.scale-this.actual_height-1,this.actual_width+2,this.actual_height*2+2);
                break;
            case 4:
                this.c.clearRect(this.canvas.width/2+this.x1*this.scale-this.actual_width-1, this.canvas.height/2-this.y1*this.scale-this.actual_height/2-1,this.actual_width*2+2,this.actual_height+2);
                break;
            default:
                break;
        }
    }
}
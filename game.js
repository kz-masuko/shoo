enchant();

var GW = 320, GH = 320;
var VMAX = 40;
var RDIFF = 30;

var TOUCH_R = 25;
var ROCKET_R = 80;
function rand(max){
    return Math.floor(max*Math.random());
}

function regulate180(value){
    if(value < -180){
        value += 360;
    }else if(180 < value){
        value -= 360;
    }
    return value;
}


        
        var rocket = new Sprite(32,64);
        fighter.image = game.assets['fighter.gif']
        fighter.frame = 0;
        fighter.x = (GW-32)/2;
        fighter.y = (GH-64)/2 + ROCKET_R;
        fighter.rotation_dst = rocket.rotation;

       

        fighter.changeRotation = function(){
            var rdiff = this.rotation_dst - this.rotation;
            var vr = 0;

            if(180 < rdiff){
                rdiff = 360 - rdiff;
                vr = -1 * RDIFF;
            }else if(rdiff < -180){
                rdiff = rdiff + 360;
                vr = RDIFF;
            }else if(0 < rdiff && rdiff < 180){
                vr = RDIFF;
            }else{
                vr = -1 * RDIFF;
            }

            if(Math.abs(rdiff) <= RDIFF){
                this.rotation = this.rotation_dst;
            }else{
                this.rotation = regulate180(this.rotation + vr);
            }
        };

        canvasGroup.addChild(rocket);


        var control = function(e){
            var dx = e.x - GW/2;
            var dy = e.y - GH/2;
            var d = Math.sqrt(dx*dx+dy*dy);

            if(d < TOUCH_R){
                return;
            }

            var trim = 0;
            var digree;

            if(dx != 0){
                digree = Math.atan(dy/dx);
                if(dx > 0){
                    trim = 180;
                }
            }else{
                if(dy > 0){
                    digree = Math.PI;
                }else{
                    digree = 0;
                }
            }

            fighter.rotation_dst = 180*digree/Math.PI - 90 + trim;
            fighter.rotation_dst = regulate180(rocket.rotation_dst)
        };

        game.rootScene.addEventListener("touchmove", control);
        game.rootScene.addEventListener("touchstart", function(e){
            control(e);
        });

        game.rootScene.addEventListener("touchend", function(e){
            control(e);
        });

        game.addEventListener("enterframe", function(){

            var prevrad = (rocket.rotation+90)/180*Math.PI;

            fighter.changeVelocity();
            fighter.changeRotation();
            
            var rad = (rocket.rotation+90)/180*Math.PI;

            fighter.x = (GW - 32) / 2 + ROCKET_R * Math.cos(rad);
            fighter.y = (GH - 64) / 2 + ROCKET_R * Math.sin(rad);

            var dx = ROCKET_R * (Math.cos(rad)-Math.cos(prevrad));
            var dy = ROCKET_R * (Math.sin(rad)-Math.sin(prevrad));

            
        });

        game.rootScene.addChild(canvasGroup);
        game.rootScene.backgroundColor = 'black';
    }
    game.start();
}


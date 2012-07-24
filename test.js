enchant();

var PI = 3.14159;
var GW = 300, GH = 300;
var VMAX = 10;
var RDIFF = 10;

function rand(max){
    return Math.floor(max*Math.random());
}

function regulate360(value){
    if(value < -180){
        value += 360;
    }else if(180 < value){
        value -= 360;
    }
    return value;
}



window.onload = function () {
    var game = new Game(GW, GH);
    game.preload('fighter.gif', 'effect0.gif', 'font2.png');
    game.onload = function () {

        game.keybind(90, 'a');

        var label;
        label = new Label("");
        game.rootScene.addChild(label);

        label.text = "<BR>SCORE<BR>"

        /* scoreLabel = MutableText(16, 16, game.width, "");
        scoreLabel.score = 0;

        //スコアを自動更新
        scoreLabel.addEventListener('enterflame', function(){
        this.text = "SCORE " + this.score;
        this.score += Math.floor((game.score - this.score) / 10);
        });

        game.rootScene.addchild(scoreLabel);
        */
        game.score = 0;

        var player = new Group();
        player.x = (GW - 32) / 2;
        player.y = (GH - 64) / 2;

        var asteroidGroup = new Group();

        var spaceObjects = [];

        for (var i = 0; i < 64; i++) {
            var z = 0.2 + 0.8 * Math.random();
            var asteroid = new Sprite(16, 16);
            asteroid.image = game.assets['font2.png'];
            asteroid.frame = rand(16 * 6);

            asteroid.x = rand(GW * 2) - GW;
            asteroid.y = rand(GH * 2) - GH;
            asteroid.scaleX = 0.3 * z;
            asteroid.scaleY = 0.3 * z;
            asteroid.dr = rand(8) - 4;
            asteroid.distance = z;

            spaceObjects.push(asteroid);
            asteroidGroup.addChild(asteroid);
        }



        spaceObjects.move = function (rad, translation) {
            var vx = Math.cos(rad) * translation;
            var vy = Math.sin(rad) * translation;

            for (var i = 0; i < this.length; i++) {
                var a = this[i];
                a.rotate(a.dr);
                a.x += vx * a.distance * a.distance;
                a.y += vy * a.distance * a.distance;
                //console.log(a.distance);
                if (a.x < -1 * GW) {
                    a.x += 2 * GW;
                } else if (2 * GW < a.x) {
                    a.x -= 3 * GW;
                }
                if (a.y < -1 * GH) {
                    a.y += 2 * GH;
                } else if (2 * GH < a.y) {
                    a.y -= 3 * GH;
                }
            }
        };

        /*
        var fire = new Sprite(16,16);
        fire.image = game.assets['effect0.gif'];
        fire.frame = 0;
        */

        var fighter = new Sprite(30, 30);
        fighter.image = game.assets['fighter.gif']
        fighter.frame = 0;
        fighter.boost = false;
        fighter.boostLevel = 0;
        fighter.accel = 0;
        fighter.rotation_dst = fighter.rotation;

        fighter.changeVelocity = function () {
            if (this.boost == true) {
                if (VMAX < this.boostLevel) {
                    this.boostLevel = VMAX;
                } else {
                    this.boostLevel += this.accel;
                }
            } else {
                if (1 < this.boostLevel) {
                    this.boostLevel -= 0.2;
                } else {
                    this.boostLevel = 0;
                }
            }
        };

        fighter.changeRotation = function () {
            var rdiff = this.rotation_dst - this.rotation;
            var vr = 0;
            if (180 < rdiff) {
                if (this.rotation_dst < this.rotation) {
                    vr = RDIFF;
                } else {
                    vr = -1 * RDIFF;
                }
            } else {
                if (this.rotation < this.rotation_dst || rdiff < -180) {
                    vr = RDIFF;
                } else {
                    vr = -1 * RDIFF;
                }
            }

            if (Math.abs(rdiff) <= RDIFF) {
                this.rotation = this.rotation_dst;
            } else {
                this.rotation = regulate360(this.rotation + vr);
            }
        };

        player.addChild(fighter);


        var control = function (e) {
            var dx = e.x - GW / 2;
            var dy = e.y - GH / 2;
            var trim = 0;
            var digree;
            if (dx != 0) {
                digree = Math.atan(dy / dx);
                if (dx > 0) {
                    trim = 180;
                }
            } else {
                if (dy > 0) {
                    digree = PI;
                } else {
                    digree = 0;
                }
            }

            fighter.rotation_dst = 180 * digree / PI - 90 + trim;
            fighter.rotation_dst = regulate360(fighter.rotation_dst);

            fighter.accel = Math.sqrt(dx * dx + dy * dy) / 200.0;
        };

        game.rootScene.addEventListener("touchmove", control);
        game.rootScene.addEventListener("touchstart", function (e) {
            fighter.boost = true;
            control(e);
        });

        game.rootScene.addEventListener("touchend", function (e) {
            rocket.boost = false;
            control(e);
        });

        game.addEventListener("enterframe", function () {

            fighter.changeVelocity();
            fighter.changeRotation();

            var rad = (fighter.rotation + 90) / 180 * PI;

            spaceObjects.move(rad, fighter.boostLevel);


        });

        game.rootScene.addChild(asteroidGroup);
        game.rootScene.addChild(player);
        game.rootScene.backgroundColor = 'black';
    }
    game.start();
}


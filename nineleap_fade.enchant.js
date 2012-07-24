/**
 * nineleap_fade.enchant.js v0.2.0
 *
 Copyright (c) 2010 Hiroya Kubo

 Permission is hereby granted, free of charge, to any person obtaining
 a copy of this software and associated documentation files (the
 "Software"), to deal in the Software without restriction, including
 without limitation the rights to use, copy, modify, merge, publish,
 distribute, sublicense, and/or sell copies of the Software, and to
 permit persons to whom the Software is furnished to do so, subject to
 the following conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 * @requires effect.enchant.js v0.1.0 or later

 */

/**
 * ローカル環境でのデバッグ時に、ゲームオーバー画面のクリックまたはキーダウンで
 * 「もう一度プレイする」を可能にするためには、この値をtrueにする。
 * nineleapに投稿する際にはtrueにしておく。
 */

(function () {

var START_IMAGE = 'start.png';
var END_IMAGE = 'end.png';

enchant.nineleap_fade = { assets: [START_IMAGE, END_IMAGE] };

enchant.nineleap_fade.Game = enchant.Class.create(enchant.nineleap.Game, {
    initialize: function(width, height) {
        enchant.nineleap.Game.call(this, width, height);
        this.sceneTransition = false;
        this.overwriteLoadEventListener();
    },

    // enchant.nineleap.Gameにおけるloadイベントリスナを解除・上書き
    overwriteLoadEventListener: function(){
        this._listeners['load'] = [];
        this.addEventListener('load', function() {
            this.startScene = new SplashScene();
            this.startScene.id = 'startScene';
            this.startScene.image = this.assets[START_IMAGE];

            this.pushScene(this.startScene);
            fadeIn(this.startScene, 10);

            this.endScene = new SplashScene();
            this.endScene.id = 'endScene';
            this.endScene.image = this.assets[END_IMAGE];

            this.addGameTransitionEventListeners();
        });
    },

    addGameTransitionEventListeners: function(){
        this.addTransitionEventListeners(game.startScene,
                                          function(){
                                              return game.started == false;
                                          },
                                          function(){
                                              if (game.onstart != null) game.onstart();
                                              game.onGameStartTouched();
                                          } );

        this.addTransitionEventListeners(game.endScene,
                                          function(){
                                              return true;
                                          },
                                          function(){
                                              game.onGameEndTouched();//fadeout endScnene and popScene
                                          } );
    },

    addSceneTransitionEventListeners: function(){
    },

    // トランジションのためのイベントリスナを登録
    addTransitionEventListeners: function(scene, callbackCondition, callback){
        var game = this;
        scene.addEventListener('touchend', function() {
            if(callbackCondition() && game.sceneTransition == false){
                game.sceneTransition = true;
                callback();
                game.sceneTransition = false;
                scene.removeEventListener('touchend', arguments.callee);
            }
        });

        this.addEventListener('keydown', function() {
            if (callbackCondition() && 
                game.currentScene == scene && game.sceneTransition == false){
                game.sceneTransition = true;
                callback();
                game.sceneTransition = false;
                game.removeEventListener('keydown', arguments.callee);
            }
        });

    },

/*
    // トランジションのためのイベントリスナを登録
    addTransitionEventListeners: function(){
        var game = this;
        this.startScene.addEventListener('touchend', function() {
            game.startScene.removeEventListener('touchend', arguments.callee);
            if (game.started == false && game.sceneTransition == false) {
                game.sceneTransition = true;
                if (game.onstart != null) game.onstart();
                game.onGameStartTouched();
            }
        });

        this.endScene.addEventListener('touchend', function(){
            if(game.sceneTransition == false){
                game.sceneTransition = true;
                game.endScene.removeEventListener('touched', arguments.callee);
                game.onGameEndTouched();//fadeout endScnene and popScene
            }
        });

        this.addEventListener('keydown', function() {
            if (game.currentScene == game.startScene && game.sceneTransition == false){
                game.sceneTransition = true;
                game.removeEventListener('keydown', arguments.callee);
                if (game.started == false) {
                    if(game.onstart != null) game.onstart();
                    game.onGameStartTouched();//fadeout startScnene and popScene
                }
            }
        });

        this.addEventListener('keydown', function() {
            if (game.currentScene == game.endScene && game.sceneTransition == false){
                game.sceneTransition = true;
                game.removeEventListener('keydown', arguments.callee);
                game.onGameEndTouched();//fadeout endScnene and popScene
            }
        });
    },
*/
    //ユーザによるゲーム開始画面のタッチ後に実行される関数,
    onGameStartTouched: function(callback){
        var game = this;
        game.started = true;
        gameStart = true;   // deprecated
        fadeOut(game.startScene, 10, function(){
            if(game.currentScene == game.startScene){
                game.popScene();
            }
            if(callback){
                callback();
            }
        });
    },

    //ゲームオーバーのときの終了処理を実行する
    end: function(score, message){
        game.started = false;
        enchant.nineleap.Game.prototype.end.call(this, score, message);
        fadeIn(this.endScene, 10);
    },

    //ユーザによるゲーム終了画面のタッチ後に実行される関数
    onGameEndTouched: function(callback){
        var game = this;

        gameStart = false;   // deprecated

        fadeOut(game.endScene, 10, function(){
            if(game.currentScene == game.endScene){
                game.popScene();
            }
        });

        if(NINELEAP_RELEASE_MODE){
            return;
        }

        fadeOut(game.getGameNode(), 10, function(){

            if(game.reset){
                game.reset();
            }

            fadeIn(game.getGameNode(), 10, function(){

                game.pushScene(game.startScene);

                fadeIn(game.startScene, 10, function(){
                    game.addGameTransitionEventListeners();
                    if(callback){
                        callback();
                    }
                    game.sceneTransition = false;
                });
            });
        });
    },

    /**
     * ゲーム終了・リセット再開時に、
     * フェイドイン・フェイドアウトされるゲーム画面のnodeを返す関数。
     * デフォルトではgame.rootSceneを返すので、開発者側で必要に応じて
     * game.getGameNode = function(){ return fooScene };のように定義して
     * おくことで内部的に呼び出される。
     */
    getGameNode: function(){
        return this.rootScene;
    },

    /**
     * NINELEAP_RELEASE_MODE==falseのときに、自前でゲームを再開するための、
     * 各種ゲーム状態(スコア・自機位置・敵位置など)の初期化処理を記述するための関数。
     * game.reset = function(){....}; のように定義しておくことで内部的に呼び出される。
     */
    reset: function(){
        alert("reset関数を実装してください");
    }

});

})();
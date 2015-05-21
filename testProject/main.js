/************
 Main
 Entry point
 ************/

// Initialize enchant.js 
enchant();

// Globalize these for testing purposes 
var game;
var scene;
var camera;
var thing;
var miku;
var mikuPhy;
var pad;

window.onload = function ()
{
    game = new Game(GAME_WIDTH, GAME_HEIGHT);
    game.fps = GAME_FPS;

    chengine.preloadGameAssets();
    
    game.onload = function ()
    {
        chengine.gameInit();
    }
    
    game.start();
};




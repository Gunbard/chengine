/************
 Main
 Entry point
 ************/

// Initialize enchant.js 
enchant();

// CONSTANTS
// Assets
MODEL_PATH = 'model/asuka/Asuka.pmd';
MODEL_REI_PATH = 'model/rei/Rei.pmd';
MOTION_PATH = 'motion/walk.vmd';
MOTION_JUMP_PATH = 'motion/jumpfix2.vmd';
MOTION_TEST = 'motion/everybody.vmd';
TEXTURE_SKYDOME = 'images/skydome.jpg';

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

    game.preload
    (
        MODEL_PATH, 
        MODEL_REI_PATH, 
        MOTION_PATH, 
        MOTION_JUMP_PATH,
        'images/tex.jpg',  
        'images/grass.gif', 
        'images/tex.png',
        'images/soccerball.png', 
        'sounds/tielaser.wav', 
        'sounds/explode.wav', 
        'images/cockpit.png',
        'images/crosshairs.png',
        //MOTION_TEST,
        TEXTURE_SKYDOME
        //TEST_AREA,
        //COLLADA_TEST
    );
    
    game.onload = function ()
    {
        chengine.gameInit(testRoom2);
    }
    
    game.start();
};




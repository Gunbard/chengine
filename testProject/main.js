/************
 Main
 Entry point
 ************/

// Initialize enchant.js 
enchant();

// CONSTANTS
// Assets
WORLD_BATTLEFIELD = 'model/battlefield/battlefield.dae';
WORLD_CASTLE = 'model/castle/castle.dae';
WORLD_HFIELD = 'model/hfield/hfield.dae';
MODEL_PATH = 'model/asuka/Asuka.pmd';
MODEL_REI_PATH = 'model/rei/Rei.pmd';
MOTION_PATH = 'motion/walk.vmd';
MOTION_JUMP_PATH = 'motion/jumpfix2.vmd';
MOTION_TEST = 'motion/everybody.vmd';
TEXTURE_SKYDOME = 'images/skydome.jpg';
MODEL_CHEN = 'model/chen/chenfix.pmd';
MODEL_HOLO = 'model/holo/holofix.pmd';
TEX_CROSSHAIRS = 'images/crosshairs.png';
TEX_GRASS = 'images/grass.jpg';

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
        MODEL_CHEN,
        MODEL_HOLO,
        MOTION_PATH, 
        MOTION_JUMP_PATH,
        'images/tex.jpg',  
        TEX_GRASS, 
        'images/tex.png',
        'images/soccerball.png', 
        'sounds/tielaser.wav', 
        'sounds/explode.wav', 
        'images/cockpit.png',
        TEX_CROSSHAIRS,
        TEXTURE_SKYDOME,
        WORLD_BATTLEFIELD,
        WORLD_HFIELD
    );
    
    game.onload = function ()
    {
        chengine.gameInit(testShoot);
    }
    
    game.start();
};




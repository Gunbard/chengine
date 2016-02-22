/**********************************************
 Main
 Entry point. Assets need to be preloaded here.
 **********************************************/

// Initialize enchant.js 
enchant();

// CONSTANTS
// Assets
WORLD_BATTLEFIELD = 'model/battlefield/battlefield.dae';
WORLD_CASTLE = 'model/castle/castle.dae';
WORLD_HFIELD = 'model/hfield/hfield.dae';
WORLD_GROUND3 = 'model/ground3/ground3.dae';
MODEL_PATH = 'model/asuka/Asuka.pmd';
MODEL_REI_PATH = 'model/rei/Rei.pmd';
MOTION_PATH = 'motion/walk.vmd';
MOTION_JUMP_PATH = 'motion/jumpfix2.vmd';
MOTION_TEST = 'motion/everybody.vmd';
TEXTURE_SKYDOME = 'images/skydome.jpg';
MODEL_CHEN = 'model/chen/chenfix.pmd';
MODEL_RAN = 'model/ran/ran.pmd';
MODEL_HOLO = 'model/holo/holofix.pmd';
MODEL_HONK = 'model/honk/honk.dae';
TEX_CROSSHAIRS = 'images/crosshairs.png';
TEX_CROSSHAIRS2 = 'images/crosshairs2.png';
TEX_CROSSHAIRS2RED = 'images/crosshairs2red.png';
TEX_GRASS = 'images/grass.jpg';
TEX_METAL = 'images/metal.jpg';
TEX_CIRCLE_WHITE = 'images/whitecircle.png';
TEX_HEALTH = 'images/health.png';
MUSIC_CORNERIA = 'sounds/corneria.mp3';
MUSIC_BOSS = 'sounds/boss.mp3';
MUSIC_VICTORY = 'sounds/victory.mp3';
SOUND_LASER = 'sounds/laser_single.mp3';
SOUND_EXPLODE = 'sounds/exp.mp3';
SOUND_BIGEXPLODE = 'sounds/bigexplode.mp3';
SOUND_HIT = 'sounds/expSm.wav';
SOUND_TARGET = 'sounds/target.mp3';
SOUND_TARGETLOCK = 'sounds/targetLock.mp3';
SOUND_CHARGELASER = 'sounds/chargeLaser.mp3';
SOUND_BEAM = 'sounds/beamRifle.wav';
SOUND_CHARGELASEREXPLODE = 'sounds/chargeLaserExplode.mp3';
SOUND_RADIOSTART = 'sounds/radioStart.mp3';
SOUND_RADIOEND = 'sounds/radioEnd.mp3';
SOUND_LOADHEALTH = 'sounds/loadhealth.mp3';
SOUND_HONK = 'sounds/honk.mp3';
MODEL_TEST = 'model/modeltest2.dae';
MODEL_YUKKURI = 'model/reimuyukkuri/reimuyukkuribig.pmd';
MODEL_TREE = 'model/tree/tree.dae';
SPRITE_RAN = 'images/ran.png';

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
        MODEL_RAN,
        MODEL_HONK,
        MOTION_PATH, 
        MOTION_JUMP_PATH,
        MOTION_TEST,
        'images/tex.jpg',  
        TEX_GRASS, 
        TEX_HEALTH, 
        'images/tex.png',
        'images/soccerball.png', 
        'sounds/tielaser.wav', 
        'sounds/explode.wav', 
        'images/cockpit.png',
        TEX_CROSSHAIRS,
        TEX_CROSSHAIRS2,
        TEX_CROSSHAIRS2RED,
        TEX_METAL,
        TEX_CIRCLE_WHITE,
        TEXTURE_SKYDOME,
        WORLD_BATTLEFIELD,
        WORLD_HFIELD,
        WORLD_CASTLE,
        WORLD_GROUND3,
        MUSIC_CORNERIA,
        MUSIC_BOSS,
        MUSIC_VICTORY,
        SOUND_LASER,
        SOUND_EXPLODE,
        SOUND_BIGEXPLODE,
        SOUND_HIT,
        SOUND_TARGET,
        SOUND_TARGETLOCK,
        SOUND_LOADHEALTH,
        SOUND_CHARGELASER,
        SOUND_CHARGELASEREXPLODE,
        SOUND_BEAM,
        SOUND_RADIOSTART,
        SOUND_RADIOEND,
        SOUND_HONK,
        MODEL_TEST,
        MODEL_YUKKURI,
        MODEL_TREE,
        SPRITE_RAN
    );
    
    game.onload = function ()
    {
        chengine.gameInit(testShoot);
    }
    
    game.start();
};




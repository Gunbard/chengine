/**********************************************
 Main
 Entry point. Assets need to be preloaded here.
 **********************************************/

// Initialize enchant.js 
enchant();

window.onload = function ()
{
    game = new Game(GAME_WIDTH, GAME_HEIGHT);
    game.fps = GAME_FPS;

    // ASSET_LIST is defined in assets.js
    game.preload(ASSET_LIST);
    
    game.onload = function ()
    {
        // Load the first room
        chengine.gameInit(testShoot);
    }
    
    game.start();
};




/************************
 Sound manager
 Manages sound and music
 ************************/
 
chengine.sound = {};

// Sound cache so we won't have to clone the assets each time
chengine.sound.loadedSounds = [];

// Keep track of sounds that should be looped
chengine.sound.loopedSounds = [];

// Keep track of sounds that should be faded
chengine.sound.fadingSounds = [];

/**
 Plays a sound with its volume based on its distance
 to the camera
 @param {game.asset} asset An enchant.js sound asset
 @param {vec3} point Sprite3D or anything with [x, y, z] properties
 */
chengine.sound.play = function (asset, point)
{
    var sound = game.assets[asset].clone();
    if (point)
    {        
        var distance = distanceToPoint(chengine.getScene().getCamera(), point);
        
        // Volume/gain appears broken on some machines...
        if ((chengine.SOUND_MAX_DISTANCE - distance) > 0)
        {
            sound.volume = (SOUND_MAX_DISTANCE - distance) / SOUND_MAX_DISTANCE;
        }
        else 
        {
            sound.volume = 0.01;
        }
    }
    
    sound.play();
};

/**
 Stops playback of all sounds of type asset
 @param {String} asset The sound asset to stop
 */
chengine.sound.stop = function (asset) 
{
    var cachedSound = chengine.sound._getCachedSound(asset);   
    if (cachedSound)
    {
        for (var i = 0; i < chengine.sound.loopedSounds.length; i++)
        {
            var sound = chengine.sound.loopedSounds[i];
            if (sound.assetId && sound.assetId == asset)
            {
                chengine.sound.loopedSounds.splice(i);
                break;
            }
        }
        cachedSound.stop();
    }
};

/**
 Loops a sound
 @param {String} asset The sound asset to loop. If start and end aren't
                 defined, then the sound will loop at the end of the clip.
 @param {Number} start The start position of the loop. Optional
 @param {Number} end The end position of the loop. Optional
 @param {Number} times The number of times to loop the sound
 */
chengine.sound.loop = function (asset, start, end, times)
{
    var cachedSound = chengine.sound._getCachedSound(asset);     
    cachedSound.play(true);
    
    var newLoopSound = 
    {
        asset: cachedSound,
        assetId: asset
    };
    
    chengine.sound.loopedSounds.push(newLoopSound);
};

/**
 
 */
chengine.sound.fade = function (asset, volume, amount, finished)
{
    var cachedSound = chengine.sound._getCachedSound(asset);     
    
    var newFadeSound = 
    {
        asset: cachedSound,
        assetId: asset,
        targetVolume: volume,
        fadeAmount: amount,
        callback: finished
    };
    
    chengine.sound.fadingSounds.push(newFadeSound);
};

/**
 Internal
 @param {String} asset The sound asset to get
 @return {sound asset} A cached sound
 */    
chengine.sound._getCachedSound = function (asset)
{
    for (var i = 0; i < chengine.sound.loadedSounds.length; i++)
    {
        var sound = chengine.sound.loadedSounds[i];
        if (sound.asset && sound.assetId && sound.assetId == asset)
        {
            return sound.asset;
        }
    }

    var newSound = game.assets[asset].clone();
    var newSoundContainer = 
    {
        asset: newSound,
        assetId: asset
    };
    
    chengine.sound.loadedSounds.push(newSoundContainer);
    return newSound;
};

/**
 Called on enterframe of 3D scene singleton.
 */
chengine.sound.enterframe = function (e)
{
    // Check status of looping sounds
    for (var i = 0; i < chengine.sound.loopedSounds.length; i++)
    {
        var sound = chengine.sound.loopedSounds[i];
        if (sound.asset && sound.asset.currentTime >= sound.asset.duration)
        {
            if (sound.times)
            {
                if (sound.times > 0)
                {
                    sound.times--;
                    sound.play(true);
                    break;
                }
                else
                {
                    chengine.sound.loopedSounds.splice(i);
                    break;
                }
            }
            sound.asset.play(true);
        }
    }
    
    // Handle fading
    for (var i = 0; i < chengine.sound.fadingSounds.length; i++)
    {
        var sound = chengine.sound.fadingSounds[i];
        if (!sound.asset)
        {
            continue;
        }
        
        if (sound.asset.volume > sound.targetVolume &&
           (sound.asset.volume - sound.fadeAmount) > 0)
        {   
            sound.asset.volume -= sound.fadeAmount;
        }
        else
        {
            sound.asset.stop();
            chengine.sound.fadingSounds.splice(i);
            
            if (sound.callback)
            {
                sound.callback();
            }
        }
    }
};

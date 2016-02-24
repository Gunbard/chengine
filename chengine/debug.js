/*********************
 Debug specific logic
 *********************/

chengine.debug = {};
 
/**
 Adds the debug panel
 */
chengine.debug.add = function ()
{ 
    var scene = chengine.getScene();
    chengine.debug.visible = true;
    chengine.debug.fps = 0;

    var offsetX = 4;
    var offsetY = 16;
  
    var debugFont = 'arial';
    var debugFontColor = '#BB0000';
    var debugFontShadowColor = '#111111';

    var labelDebugShadow = new Label();
    labelDebugShadow.color = debugFontShadowColor;
    labelDebugShadow.font = debugFont;
    labelDebugShadow.y = offsetY + 1;
    labelDebugShadow.x = offsetX - 1;
    scene.scene2D.insertBefore(labelDebugShadow, game.rootScene.firstChild);
    
    var labelDebug = new Label();
    labelDebug.color = debugFontColor;
    labelDebug.font = debugFont;
    labelDebug.x = offsetX;
    labelDebug.y = offsetY;
    scene.scene2D.addChild(labelDebug);
    
    chengine.debug.labels = [labelDebug, labelDebugShadow];

    var c = 0;
    setInterval(function () 
    {
        chengine.debug.fps = c;
        c = 0;
    }, 1000);
    
    scene.scene2D.addEventListener('enterframe', function (e) 
    {
        c++;
        
        var visible3DObjects = 0;
        for (var i = 0; i < scene.childNodes.length; i++)
        {
            var obj = scene.childNodes[i];
            if (obj.drawn)
            {
                visible3DObjects++;
            }
        }
        
        // Update every 16th frame since setting Label text is expensive due
        // to the getMetrics call. Ignore if no debug is visible.
        if (c % 16 != 0 || !chengine.debug.labels || chengine.debug.labels.length == 0)
        {
            return;
        }
        
        labelDebug.text = 
        'FPS: ' + chengine.debug.fps + '<br>' +        
        'Physics on: ' + scene.isPlaying + '<br>' +
        '3D Objects: ' + scene.childNodes.length + '<br>' +
        '3D Objects Visible: ' + visible3DObjects + '<br>' +
        '2D Objects: ' + scene.scene2D.childNodes.length + '<br>';                  
                          
        labelDebugShadow.text = labelDebug.text;
    });
};

/**
 Removes the debug panel
 */
chengine.debug.remove = function (scene)
{
    chengine.debug.visible = false;
    
    if (!chengine.debug.labels)
    {
        return;
    }
    
    for (var i = 0; i < chengine.debug.labels.length; i++)
    {
        var currentLabel = chengine.debug.labels[i];
        if (currentLabel instanceof Label)
        {
            scene.scene2D.removeChild(currentLabel);
        }
    }
    
    chengine.debug.labels = [];
}



chengine.debugCamera = function (scene, cam)
{
    if (chengine.input.keyPressed('r'))
    {
        if (scene.isPlaying)
        {
            scene.stop();
        }
        else
        {
            scene.play();
        }
    }
    
    if (chengine.input.keyPressed('p'))
    {
        if (chengine.debug.physicsModelsVisible)
        {
            chengine.debug.togglePhysicsModels(false);
        }
        else
        {
            chengine.debug.togglePhysicsModels(true);
        }
    }
    
    if (chengine.input.keyPressed('l'))
    {
        if (scene.postProcessingEnabled)
        {
            scene.postProcessingEnabled = false;
        }
        else
        {
            scene.postProcessingEnabled = true;
        }
    }
    
    var camMoveSpeed = 4;
    
    // Forward
    if (game.input.w)
    {
        cam.forward(camMoveSpeed);
    }
    
    // Backward
    if (game.input.s)
    {
        cam.forward(-camMoveSpeed);
    }
    
    // Side left
    if (game.input.a)
    {
        camera.rotateYaw(degToRad(-camMoveSpeed/2));
    }
    
    // Side right
    if (game.input.d)
    {
        camera.rotateYaw(degToRad(camMoveSpeed/2));
    }

    // Pan down
    if (game.input.z)
    {
        cam.altitude(-camMoveSpeed);
    }
    
    // Pan up
    if (game.input.x)
    {
        cam.altitude(camMoveSpeed);
    }
    
    // Tilt up
    if (game.input.n)
    {
        camera.rotatePitch(degToRad(camMoveSpeed));
    }
    
    // Tilt down
    if (game.input.m)
    {
        camera.rotatePitch(degToRad(-camMoveSpeed));
    }
    
    // Pan left
    if (game.input.q)
    {
        cam.sidestep(camMoveSpeed);
    }
    
    // Pan right
    if (game.input.e)
    {
        cam.sidestep(-camMoveSpeed);
    }
};

/**
 Displays or hides physics collision models
 @param visible {bool} Whether the models are visible or not
 */
chengine.debug.togglePhysicsModels = function (visible)
{
    chengine.debug.physicsModelsVisible = visible;
    
    for (var i = 0; i < scene.childNodes.length; i++)
    {
        if (scene.childNodes[i] instanceof PhySprite3D)
        {
            var model = scene.childNodes[i];
            
            // Ignore meshes that have an explicit texture
            if (model && model.mesh && !model.mesh.texture._image)
            {
                if (visible)
                {
                    model.mesh.setBaseColor('rgba(0, 255, 0, 0.6)');
                }
                else
                {
                    model.mesh.setBaseColor('rgba(255, 255, 255, 0.0)');
                }
            }
        }
    }
};

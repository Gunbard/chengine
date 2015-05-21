/*********************
 Debug specific logic
 *********************/

chengine.debug = {};
 
/**
 Adds the debug panel
 */
chengine.debug.add = function (scene)
{ 
    chengine.debug.visible = true;
    chengine.debug.fps = 0;
    
    var debugFont = 'arial';
    var debugFontColor = '#BB0000';
    var debugFontShadowColor = '#111111';

    var labelDebugShadow = new Label();
    labelDebugShadow.color = debugFontShadowColor;
    labelDebugShadow.font = debugFont;
    labelDebugShadow.y = 5;
    labelDebugShadow.x = 1;
    scene.scene2D.insertBefore(labelDebugShadow, game.rootScene.firstChild);
    
    var labelDebug = new Label();
    labelDebug.color = debugFontColor;
    labelDebug.font = debugFont;
    labelDebug.y = 4;
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
        
        // Update every 10th frame since setting Label text is expensive due
        // to the getMetrics call. Ignore if no debug is visible.
        if (c % 10 != 0 || !chengine.debug.labels || chengine.debug.labels.length == 0)
        {
            return;
        }

        /*var tr1 = new Ammo.btTransform();
        tr1.setIdentity();
        var or1 = new Ammo.btVector3(mikuPhy.x, mikuPhy.y, mikuPhy.z);
        tr1.setOrigin(or1);
        
        var tr2 = new Ammo.btTransform();
        tr2.setIdentity();
        var or2 = new Ammo.btVector3(mikuPhy.x, mikuPhy.y - 10, mikuPhy.z);
        tr2.setOrigin(or2);
        
        var sphere = new Ammo.btSphereShape(1);
        
        var convexCallback = new Ammo.ClosestConvexResultCallback(tr1, tr2);
        scene.world._dynamicsWorld.convexSweepTest(sphere, tr1, tr2, convexCallback, 0);
        */
        
        
        //var ray1 = new Ammo.btVector3(mikuPhy.x, mikuPhy.y, mikuPhy.z);
        //var ray2 = new Ammo.btVector3(mikuPhy.x, mikuPhy.y - 10, mikuPhy.z);
        
        //var rayCallback = new Ammo.ClosestRayResultCallback(ray1, ray2);
        //scene.world._dynamicsWorld.rayTest(ray1, ray2, rayCallback); 
        
        // var padAngle = 0;
        // if (pad.vx != 0 && pad.vy != 0)
        // {
            // padAngle = Math.atan2(pad.vy, pad.vx);
            // if (padAngle < 0) 
            // {
                // padAngle += 2 * Math.PI;
            // }
            
        // }
        //var heading = (mikuPhy.heading) ? getRot(mikuPhy.heading).y : 0;
        var falling = chengine.rigidIsFalling(mikuPhy.rigid.rigidBody);
        var groundTest = chengine.rayTest({x: mikuPhy.x, y: mikuPhy.y, z: mikuPhy.z}, {x: mikuPhy.x, y: mikuPhy.y - 10, z: mikuPhy.z});
        
        labelDebug.text = 
        'FPS: ' + chengine.debug.fps + '<br>' +
        'CharPos [' + 
        Math.round(mikuPhy.x) + ', ' + 
        Math.round(mikuPhy.y) + ', ' + 
        Math.round(mikuPhy.z) + ']' + '<br>' +
        
        'CamPos [' + 
        Math.round(camera.x) + ', ' + 
        Math.round(camera.y) + ', ' + 
        Math.round(camera.z) + ']' + '<br>' +
        
        'Apad [' + radToDeg(pad.rad) + ', ' + pad.dist + ']' + '<br>' +
        //'Apad angle: ' + radToDeg(padAngle) + '<br>' + 
        
        // 'CharRot [' + 
        // (getRotation(mikuPhy).x | 0) + ', ' + 
        // (getRotation(mikuPhy).y | 0) + ', ' + 
        // (getRotation(mikuPhy).z | 0) + ']<br>' +
        
        'Physics on: ' + scene.isPlaying + '<br>' +
        'Falling: ' + falling + '<br>' +
        'Ground: ' + groundTest + '<br>' +
        '3D Objects: ' + scene.childNodes.length + '<br>' +
        '2D Objects: ' + scene.scene2D.childNodes.length + '<br>';                  
                          
                          
        labelDebugShadow.text = labelDebug.text;
        
        /*Ammo.destroy(tr1);
        Ammo.destroy(tr2);
        Ammo.destroy(convexCallback);
        Ammo.destroy(sphere);
        */
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

    // Pan up
    if (game.input.z)
    {
        cam.altitude(-camMoveSpeed);
    }
    
    // Pan down
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

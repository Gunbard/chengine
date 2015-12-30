/**********************
 Engine helper methods
 **********************/
 
/**********
 CONSTANTS
 **********/
 
/**
 Distance until sound volume dissapates
 */
chengine.SOUND_MAX_DISTANCE = 1000;

// Logging levels
chengine.LOG_LEVEL =
{
    DEBUG: 0, // Expected
    WARN: 1, // Possibly expected
    ERROR: 2 // Unexpected
};

/**
 Whether or not a transition is in progress
 */
chengine.isTransitioning = false;

/**
 Used to generate unique IDs
 */
chengine.idCount = 0;
 
/**
 Logs a chengine-specific message
 @param message {string} Message to output
 @param level {string} Optional log level
 */
chengine.log = function (message, level)
{
    level = level || chengine.LOG_LEVEL.DEBUG;
    var messageLevel = '';
    switch (level)
    {
        case chengine.LOG_LEVEL.DEBUG:
            messageLevel = 'DEBUG';
            break;
        case chengine.LOG_LEVEL.WARN:
            messageLevel = 'WARN';
            break;
        case chengine.LOG_LEVEL.ERROR:
            messageLevel = 'ERROR';
            break;
    }
    
    console.log('[chengine] ' + messageLevel + ': ' + message);
};
 
/**
 Creates an instance of an object at the provided coordinates
 @param x {float} X-position
 @param y {float} Y-position
 @param z {float} Z-position
 @param obj {object} The object prototype to create
 @param scene {Scene3D} If not null, adds the created object
        immediately to this scene
 @returns {object} The instantiated object
 */
chengine.instanceCreate = function (x, y, z, obj, scene)
{
    var newObj = new obj();
    newObj.x = x;
    newObj.y = y;
    newObj.z = z;
    
    if (scene)
    {
        scene.addChild(newObj);
    }
    
    return newObj;
};

/**
 Removes an object from the scene
 @param obj {object} The object to remove
 */
chengine.instanceDestroy = function (obj)
{
    if (obj instanceof Sprite3D)
    {
        scene.removeChild(obj);
    }
    else
    {
        game.rootScene.removeChild(obj);
    }
};

/*********
 # WORLD
 *********/

/**
 DEPRECATED -- Avoid using Euler values
 */
function getRotation(sprite3d)
{
    var m_el = sprite3d.rigid._getTransform().getBasis();
    
    var rx = Math.atan2(m_el.getRow(2).y(), m_el.getRow(1).y());
    if (rx < 0) 
    {
        rx += 2 * Math.PI;
    }
    var ry = Math.atan2(m_el.getRow(0).z(), m_el.getRow(0).x());
    if (ry < 0) 
    {
        ry += 2 * Math.PI;
    }
    
    //var rz = Math.asin(-m_el.getRow(0).y());
    var rz = Math.atan2(m_el.getRow(0).x(), m_el.getRow(0).y()) - (Math.PI / 2);
    if (rz < 0) 
    {
        rz += 2 * Math.PI;
    }
    
    return {'x': radToDeg(rx), 'y': radToDeg(ry), 'z': radToDeg(rz)};
}

function getRot(rotation)
{    
    var rx = Math.atan2(rotation[9], rotation[5]);
    if (rx < 0) 
    {
        rx += 2 * Math.PI;
    }
    var ry = Math.atan2(rotation[2], rotation[0]);
    if (ry < 0) 
    {
        ry += 2 * Math.PI;
    }
    
    var rz = Math.atan2(rotation[0], rotation[1]) - (Math.PI / 2);
    if (rz < 0) 
    {
        rz += 2 * Math.PI;
    }
    
    return {'x': radToDeg(rx), 'y': radToDeg(ry), 'z': radToDeg(rz)};
}

/**
 Generates a picking vector to use as the 'to point' on a ray test
 @param x {float} The x value
 @param y {float} The y value
 @returns {x, y, z} A picking vector
 */
chengine.rayPick = function (x, y)
{   
    var farVector = vec3.create();
    var farPt = [x, GAME_HEIGHT - y, 1];
    var viewport = [0, 0, GAME_WIDTH, GAME_HEIGHT];
    
    vec3.unproject(farPt, camera.mat, camera.projMat, viewport, farVector);

    return {'x': farVector[0], 'y': farVector[1], 'z': farVector[2]};
};

/**
 Generates a picking vector to use as the 'to point' on a ray test
 @param x {float} The x value
 @param y {float} The y value
 @returns {x, y, z} A picking vector
 */
chengine.rayPickNear = function (x, y)
{   
    var nearVector = vec3.create();
    var nearPt = [x, GAME_HEIGHT - y, 0];
    var viewport = [0, 0, GAME_WIDTH, GAME_HEIGHT];
    
    vec3.unproject(nearPt, camera.mat, camera.projMat, viewport, nearVector);

    return {'x': nearVector[0], 'y': nearVector[1], 'z': nearVector[2]};
};

/**
 Generates a rotation matrix based on the camera's current rotation
 @returns {mat4} Camera's rotation matrix
 */
chengine.getCameraRotation = function ()
{
    var copyMat = mat4.create();
    mat4.set(camera.invMat, copyMat);
    return copyMat;
};

/**
 */
chengine.copyRotation = function (rotation, flip)
{
    var copyMat = mat4.create();
    mat4.set(rotation, copyMat);
    
    if (flip)
    {
        mat4.inverse(copyMat);
    }
    
    return copyMat;    
};

/**
 Generates a rotation matrix based on the camera's current rotation (ignoring tilt)
 @returns {mat4} Camera's rotation matrix
 */
chengine.getCameraLockedRotation = function ()
{
    var copyMat = mat4.create();
    mat4.set(camera.invMatY, copyMat);
    
    var quat = new enchant.gl.Quat(0, 1, 0, degToRad(180));
    var newMat = mat4.create();
    quat.toMat4(newMat);
    mat4.multiply(newMat, copyMat, copyMat);
    
    return copyMat;
};

/**
 Generates a rotaton matrix based on one object looking at another
 @param objFrom {x, y, z} Origin object or vector
 @param objTo {x, y, z} Target object or vector
 @param flip {bool} Whether or not to invert the resulting rotation
 @returns {mat4} A rotation matrix
 */
chengine.rotationTowards = function (objFrom, objTo, flip)
{
    objFrom.x = objFrom.x || 0;
    objFrom.y = objFrom.y || 0;
    objFrom.z = objFrom.z || 0;
    
    objTo.x = objTo.x || 0;
    objTo.y = objTo.y || 0;
    objTo.z = objTo.z || 0;
    
    var copyMat = mat4.create();
    
    mat4.lookAt
    (
        [0, 0, 0],
        [-objFrom.x + objTo.x,
        -objFrom.y + objTo.y,
        -objFrom.z + objTo.z],
        [0, 1, 0],
        copyMat
    );
    
    if (!flip)
    {
        mat4.inverse(copyMat);
    }
    
    return copyMat;
};

/**
 Sets the object to match a rotation. Needed to ensure physics objects
 are the same orientation as the Sprite3D
 @param targetObj {Sprite3D} Object to manipulate
 @param rotationToMatch {mat4} Rotation to set
 @param flip {bool} Whether or not to flip about the y-axis 
 */
chengine.matchRotation = function (targetObj, rotationToMatch, flip)
{
    var flipSign = (flip) ? 1 : -1;
    var rot = getRot(rotationToMatch);
    targetObj.rotationSet(new enchant.gl.Quat(0, 0, 0, degToRad(0)));
    targetObj.rotationApply(new enchant.gl.Quat(1, 0, 0, degToRad(rot.x)));
    targetObj.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(rot.y * flipSign)));
    targetObj.rotationApply(new enchant.gl.Quat(0, 0, 1, degToRad(rot.z)));
}

function updateMouse(e)
{
    var x = (e.pageX) ? e.pageX : e.x;
    var y = (e.pageY) ? e.pageY : e.y;
    
    var offset = document.getElementById('enchant-stage').getBoundingClientRect();
    x -= offset.left;
    y -= offset.top;
    
    e = new enchant.Event('touchmove');
    e.identifier = game._mousedownID;
    e._initPosition(x, y);
            
    mouseX = e.x; 
    mouseY = e.y;
}

/**
 Searches all objects in the scene for the owner of the rigidBody
 @param rigidBody {btRigidBody} The body to search for
 @returns {Sprite3D} The owner of the rigid body
 */
chengine.rigidBodyOwner = function (rigidBody)
{
    for (var i = 0; i < scene.childNodes.length; i++)
    {
        if (scene.childNodes[i].rigid && scene.childNodes[i].rigid.rigidBody &&
            scene.childNodes[i].rigid.rigidBody == rigidBody)
        {
            return scene.childNodes[i];
        }
    }
};

/**
 Searches all objects in the scene for the nearest object to the point
 @param point {x, y, z} The point or object to measure from
 @param targetClass {Class} The class to search for
 @returns {Sprite3D} The object nearest to the point of type targetClass
 */
chengine.nearestObject = function (point, targetClass)
{
    var nearest = null;
    var nearestDistance = -1;
    
    for (var i = 0; i < scene.childNodes.length; i++)
    {
        if (scene.childNodes[i] instanceof targetClass)
        {
            var distance = distanceToPoint(point, scene.childNodes[i]);
            if (distance < nearestDistance || nearestDistance == -1)
            {
                nearestDistance = distance;
                nearest = scene.childNodes[i];
            }
        }
    }
    
    return nearest;
};

/**
 Resets lighting for a mesh
 @param mesh {mesh} Mesh to set lighting
 */
chengine.unsetLighting = function (mesh)
{
    mesh.texture.shininess = 0;
    mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
    mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
    mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
    mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
};

/****************
 # MODEL/PHYSICS
 ****************/

/**
 Applies a central impulse on an object to make it move forward
 @param hittingObject {Sprite3D} The object that is "hitting" the body
 @param rigidBody {btRigidBody} The body to apply the impulse to
 @param speed {float} The speed of the impulse
 */
chengine.pushForward = function (hittingObject, rigidBody, speed)
{
    var impulseVector = new Ammo.btVector3(-hittingObject.rotation[8] * speed, 
                                           -hittingObject.rotation[9] * speed, 
                                           -hittingObject.rotation[10] * speed);
    
    rigidBody.activate();
    rigidBody.applyCentralImpulse(impulseVector);
    Ammo.destroy(impulseVector);
};

/**
 Applies a central impulse on an object to make it move upward
 @param rigidBody {btRigidBody} The body to apply the impulse to
 @param speed {float} The speed of the impulse
 */
chengine.pushUp = function (rigidBody, speed)
{
    var impulseVector = new Ammo.btVector3(0, speed, 0);
    
    rigidBody.activate();
    rigidBody.applyCentralImpulse(impulseVector);
    Ammo.destroy(impulseVector);
};
 
/**
 */
chengine.rigidIsFalling = function (rigidBody)
{
    var fallingVelocity = rigidBody.getLinearVelocity().y();
    return (fallingVelocity.toFixed(2) < 0);
};

/**
 */
chengine.rigidIsAscending = function (rigidBody)
{
    var fallingVelocity = rigidBody.getLinearVelocity().y();
    return (fallingVelocity.toFixed(2) > 0);
};

/**
 */
chengine.rigidStoppedFalling = function (rigidBody)
{
    var fallingVelocity = rigidBody.getLinearVelocity().y();
    return (fallingVelocity.toFixed(1) == 0);
};

/**
 Trigger causing an object to flash temporarily
 @param obj {Sprite3D} The object to flash
 */
chengine.flash = function (obj)
{
    obj.flash = 1.0;

    var timeoutCallback = function ()
    {
        obj.flash = 0.0;
    };
    
    setTimeout(timeoutCallback, 100);
};

/**
 "Attaches" an object to another such that their positions match
 @param objToAttach {Sprite3D} Object to attach
 @param objReceiver {Sprite3D} Object to receiving attachment
 @param offset {point} Offset of the attachment
 */
chengine.attach = function (objToAttach, objReceiver, offset, absolute)
{
    objToAttach.x = objReceiver.x;
    objToAttach.y = objReceiver.y;
    objToAttach.z = objReceiver.z;

    if (offset)
    {
        if (absolute)
        {
            objToAttach.setOffset(offset, objReceiver);
        }
        else
        {
            objToAttach.setRelativeOffset(offset, objReceiver);
        }
    } 
}

/**
 Shoots a ray to test for a collision
 @param startPoint {x, y, z} Beginning point of the ray
 @param endPoint {x, y, z} End point of the ray
 @returns {bool} Whether or not the ray hit something
 */
chengine.rayTest = function (startPoint, endPoint)
{
    var scene = enchant.Core.instance.GL.currentScene3D;
    var point1 = new Ammo.btVector3(startPoint.x, startPoint.y, startPoint.z);
    var point2 = new Ammo.btVector3(endPoint.x, endPoint.y, endPoint.z);
    
    var rayCallback = new Ammo.ClosestRayResultCallback(point1, point2);
    scene.world._dynamicsWorld.rayTest(point1, point2, rayCallback); 
    
    var hit = (rayCallback.hasHit() == 1) ? true : false;
    
    Ammo.destroy(point1);
    Ammo.destroy(point2);
    Ammo.destroy(rayCallback);
    
    return hit;
}


chengine.rayTestObj = function (startPoint, endPoint, targetableObjects)
{    
    var ray1 = new Ammo.btVector3(startPoint.x, startPoint.y, startPoint.z);
    var ray2 = new Ammo.btVector3(endPoint.x, endPoint.y, endPoint.z);
    
    var rayCallback = new Ammo.ClosestRayResultCallback(ray1, ray2);
    var scene = enchant.Core.instance.GL.currentScene3D;
    scene.world._dynamicsWorld.rayTest(ray1, ray2, rayCallback); 

    if (rayCallback.hasHit())
    {
        var collisionObj = rayCallback.get_m_collisionObject();
        var body = Ammo.btRigidBody.prototype.upcast(collisionObj);
        var owner = scene.rigidOwner(body);
        
        for (var i = 0; i < targetableObjects.length; i++)
        {
            var obj = targetableObjects[i];
            if (owner instanceof obj)
            {
                Ammo.destroy(ray1);
                Ammo.destroy(ray2);
                Ammo.destroy(rayCallback);
        
                return owner;
            }
        }
    }
    
    Ammo.destroy(ray1);
    Ammo.destroy(ray2);
    Ammo.destroy(rayCallback);
    
    return null;

}

/**
 Sets a uniform repeat for a mesh texture. The texture MUST BE a power
 of two in order to tile it, otherwise it will just clamp.
 @param mesh {enchant.gl.Mesh} A mesh to repeat
 @param repeat {int} The number of times to repeat
 */
chengine.tileMesh = function (mesh, repeat)
{
    var texCoords = mesh._texCoords._array;
    for (var i = 0; i < texCoords.length; i++)
    {
        texCoords[i] *= repeat;
    }
};

/**
 Immediately changes the current room after cleaning out the scene 
 and previous room
 @param newRoom {objRoom} The room to go to
 */
chengine.changeRoom = function (newRoom)
{
    // Clean out current room
    if (chengine.currentRoom)
    {
        chengine.currentRoom.clean();
    }
    
    // Prepare the scene3D for a new room
    scene.prepare();
    
    // Create a new room to go to
    var nextRoom = new newRoom(scene);
    nextRoom.prepare();
       
    chengine.currentRoom = nextRoom;
    
    scene.scene2D.addEventListener('enterframe', function (e) 
    {
        scene.enterframe(e);
        nextRoom.enterframe(e);
    });
    
    scene.scene2D.addEventListener('touchstart', function (e) 
    {
        nextRoom.touchstart(e);
    });
    
    scene.scene2D.addEventListener('touchend', function (e) 
    {
        nextRoom.touchend(e);
    });
    
    scene.scene2D.addEventListener('touchmove', function (e) 
    {
        nextRoom.touchmove(e);
    });
};

/**
 Performs a transition to change to a different room
 @param mextRoom {objRoom} The next room to go to
 @param transitionType {chengine.TRANSITION_TYPE} Type of transition to display
 @param transitionSpeed {chengine.TRANSITION_SPEED} Uniform execution speed of the transition
 @param callback {function} Callback called (usually) after the transition
 */
chengine.transitionRoom = function (nextRoom, transitionType, transitionSpeed, callback)
{
    if (chengine.isTransitioning)
    {
        chengine.log("Cannot transition while one is still in progress!");
        return;
    }
    
    chengine.isTransitioning = true;
    
    transitionType = transitionType || chengine.TRANSITION_TYPE.FADE;
    transitionSpeed = transitionSpeed || chengine.TRANSITION_SPEED.FAST;
    
    var scene = enchant.Core.instance.GL.currentScene3D;
    switch (transitionType)
    {
        case chengine.TRANSITION_TYPE.FADE:
        {
            var fadeIn = new objFade(chengine.TRANSITION_TYPE.FADE_IN, transitionSpeed, '#000000', function ()
            {
                scene.scene2D.removeChild(fadeIn);
                chengine.changeRoom(nextRoom);
                var fadeOut = new objFade(chengine.TRANSITION_TYPE.FADE_OUT, transitionSpeed, '#000000', function ()
                {
                    scene.scene2D.removeChild(fadeOut);
                    chengine.isTransitioning = false;
                    if (callback)
                    {
                        callback();
                    }
                });
                scene.scene2D.addChild(fadeOut);
            })
            scene.scene2D.addChild(fadeIn);
            break;
        }
        case chengine.TRANSITION_TYPE.CROSSFADE:
        {
            var crossfade = new objCrossfade(scene, null, transitionSpeed, null, function () 
            {
                chengine.isTransitioning = false;
                scene.scene2D.removeChild(crossfade);
            });

            chengine.changeRoom(nextRoom);
            scene.scene2D.addChild(crossfade);
            break;
        }
    }  
};

/**
 Smoothly interpolates a value
 @param currentValue The value to smooth out
 @param finalValue Target value
 @param speed Smoothing speed. Larger values increase smoothing.
 @returns An interpolated value
 */
chengine.smoothValue = function (currentValue, finalValue, speed)
{
    if (!speed || speed == 0)
    {
        speed = 8;
    }
    
    return ((finalValue - currentValue) / speed);
};

chengine.getScene = function () 
{
    return enchant.Core.instance.GL.currentScene3D;
};

chengine.getScene2D = function ()
{
    var scene = chengine.getScene();
    return scene.scene2D;
};

/**
 @return A unique identifier suitable for the life of the engine
 */
chengine.genId = function ()
{
    return chengine.idCount++;
};
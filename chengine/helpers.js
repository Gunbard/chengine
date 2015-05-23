/**********************
 Engine helper methods
 **********************/
 
/**********
 CONSTANTS
 **********/
 
/**
 Distance until sound volume dissapates
 */
SOUND_MAX_DISTANCE = 1000;
 
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
 @returns {mat4} A rotation matrix
 */
chengine.rotationTowards = function (objFrom, objTo)
{
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
    
    mat4.inverse(copyMat);
    return copyMat;
};

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
 Trigger causing an object to flash temporarily. This currently
 will not work on complex meshes (e.g. MSprite3D and colladas).
 TODO: Make this work with MSprite3Ds and colladas
 @param obj {Sprite3D} The object to flash
 */
chengine.flash = function (obj)
{
    obj.flash = 1.0;
    /*var savedColors = clone(obj.mesh.texture.ambient);
    var savedEm = clone(obj.mesh.texture.emission);
    var savedShiny = obj.mesh.texture.shininess;
    
    obj.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
    obj.mesh.texture.emission = [1.0, 1.0, 1.0, 1.0];
    obj.mesh.texture.shininess = 1000;
    */
    var timeoutCallback = function ()
    {
        /*obj.mesh.texture.ambient = savedColors;
        obj.mesh.texture.emission = savedEm;
        obj.mesh.texture.shininess = savedShiny;*/
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
chengine.attach = function (objToAttach, objReceiver, offset)
{
    if (!offset)
    {
        offset = {x: 0, y: 0, z: 0};
    }

    objToAttach.x = objReceiver.x + offset.x;
    objToAttach.y = objReceiver.y + offset.y;
    objToAttach.z = objReceiver.z + offset.z;
}

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

/**
 Plays a sound with its volume based on its distance
 to the camera
 @param asset {game.asset} An enchant.js sound asset
 @param point {vec3} Sprite3D or anything with [x, y, z] properties
 */
chengine.soundPlay = function (asset, point)
{
    var sound = asset.clone();
    var distance = distanceToPoint(camera, point);
    
    // Volume/gain appears broken on some machines...
    if ((SOUND_MAX_DISTANCE - distance) > 0)
    {
        //sound.volume = (SOUND_MAX_DISTANCE - distance) / SOUND_MAX_DISTANCE;
    }
    else 
    {
        //sound.volume = 0.01;
    }
    
    sound.play();
};

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
 */
chengine.changeRoom = function (currentRoom, newRoom)
{
    var scene = enchant.Core.instance.GL.currentScene3D;
    
    // Clean out current room
    if (currentRoom)
    {
        currentRoom.clean();
    }
    
    // Create a new scene to go to
    var nextRoom = new newRoom(scene);
    nextRoom.prepare();
 
    enchant.Core.instance.GL.currentRoom = nextRoom;
    
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

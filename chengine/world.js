/***************************************
 World classes
 Classes related to world space
 ***************************************/
 
/**
 Scene that supports 3D and physics. Manages cameras, lighting, objects, etc.
 This is a singleton.
 */
var objScene = Class.create(PhyScene3D,
{
    initialize: function ()
    {
        PhyScene3D.call(this);
        
        // Use objCamera instead of default Camera3D
        camera = new objCamera();
        this.setCamera(camera);
        
        // Id to key objects by
        this.id = 0;
        
        this.scene2D = new Scene();
        this.scene2D.parentScene = this;
        game.replaceScene(this.scene2D);
        game.rootScene = this.scene2D;
        
        chengine.input.setKeybindings();
    
        /**
         A hash table mapping rigidBodies to their owners. Since Ammo.js is a C++ port of Bullet,
         there isn't an easy way to obtain the owner of a btRigidBody. Used during collision 
         detection to increase performance by not having to search every object in the scene.
         This table is updated whenever the PhyScene3D invokes addChild() or removeChild().
         
         TODO: Turns out array lookups are usually faster than using hashes/objects.
               Update to use an array.
         */
        this.rigidTable = {};
        
        this.fpsCounter = 0;
        
        var that = this;
        this.counter = setInterval(function () 
        {
            document.title = 'FPS: ' + that.fpsCounter;
            that.fpsCounter = 0;
        }, 1000);
    },
    
    addChild: function (sprite)
    {
        PhyScene3D.prototype.addChild.call(this, sprite);
        
        sprite.objId = this.id;
        this.id++;
        
        if (sprite instanceof PhySprite3D && sprite.rigid && sprite.rigid.rigidBody) 
        {
            this.rigidTable[sprite.rigid.rigidBody.ptr] = sprite;
        }
    },
    
    removeChild: function (sprite)
    {
        PhyScene3D.prototype.removeChild.call(this, sprite);
        
        if (sprite instanceof PhySprite3D && sprite.rigid && sprite.rigid.rigidBody) 
        {
            delete this.rigidTable[sprite.rigid.rigidBody.ptr];
        }  
    },
    
    rigidOwner: function (rigidBody)
    {
        return this.rigidTable[rigidBody.ptr];
    },
    
    enterframe: function (e)
    {   
        this.fpsCounter++;
        this.getCamera().enterframe(e);
    },
    
    tearDown: function ()
    {
        var i = this.scene2D.childNodes.length;
        while (i--)
        {
            this.scene2D.removeChild(this.scene2D.childNodes[i]);
        }
        
        var i = this.childNodes.length;
        while (i--)
        {
            var child = this.childNodes[i];
            
            if (child instanceof objCharacter)
            {
                child.removeFromScene(this);
                continue;
            }
            
            this.removeChild(child);
        }
        
        this.rigidTable = {};
        
        this.scene2D.clearEventListener('enterframe');
        this.scene2D.clearEventListener('touchstart');
        this.scene2D.clearEventListener('touchend');
        this.scene2D.clearEventListener('touchmove');
        
        this.stop();
        this.isPlaying = false;
        
        // Reset camera
        camera = new objCamera();
        this.setCamera(camera);
    },
    
    prepare: function ()
    {
        // Default background color
        this.backgroundColor = '#000000';    
        
        // Default fog settings
        this.setFog(0.0);
        this.setFogColor(0.0, 0.0, 0.0, 1.0);
        this.setFogDistance(200.0, 5000.0);
        
        // Default gravity
        var gravVector = new Ammo.btVector3(0, -980, 0);
        this.world._dynamicsWorld.setGravity(gravVector);
        Ammo.destroy(gravVector);
        
        // Default light
        var light = new DirectionalLight();
        light.color = [1.0, 1.0, 1.0];
        light.directionX = 1;
        light.directionY = 1;
        light.directionZ = -1;
        this.setDirectionalLight(light);
    }
});

/**
 Since a Scene3D is essentially a singleton, objRooms serve as separate 
 "sub-scenes" to go between. When the system goes to a different room,
 the current scene is cleaned out before it is populated by stuff in the
 incoming room.
 */
var objRoom = Class.create(
{
    initialize: function (parentScene)
    {
        this.scene = parentScene;
        this.step = 0;
    },
    
    prepare: function ()
    {
    
    },
    
    clean: function ()
    {
        debugger;
        this.scene.tearDown();
    },
    
    enterframe: function (e)
    {
        this.step++;
        
        if (this.skybox)
        {
            chengine.attach(this.skybox, this.scene.getCamera());
        }
    },
    
    touchstart: function (e)
    {
    
    },
    
    touchend: function (e)
    {
    
    }, 
    
    touchmove: function (e)
    {
    
    },
    
    createSkybox: function (texture, radius)
    {
        radius = radius || 1500;
        this.skybox = new Sphere(radius);
        this.skybox.mesh.reverse();
        this.skybox.mesh.texture = new Texture(game.assets[texture]);
        this.skybox.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
        this.skybox.mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
        this.skybox.mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
        this.skybox.mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
        this.skybox.mesh.texture.shininess = 0;
        this.skybox.rotatePitch(degToRad(180));
        this.scene.addChild(this.skybox);
    }
});


/**
 Camera with several different modes
 */
var objCamera = Class.create(Camera3D,
{
    initialize: function ()
    {
        Camera3D.call(this);
        
        // Increase draw distance
        mat4.perspective(20, enchant.Core.instance.width / enchant.Core.instance.height, 1.0, chengine.draw_distance, this._projMat);
         
        //this.phyObj = new PhyCube(1);
        //chengine.attach(this.phyObj, this);
        
        this.tmpMat = [];
        
        this.allowRotate = true;
        
        // Camera's target object or vector
        this.target = null;
        
        // Minimum distance between camera and target
        this.distance = 100;
        
        // Camera's speed when moving
        this.speed = 0;
        
        // Camera's offset (e.g. Camera is to the up and left if x = -5, y = 5)
        this.offset = {x: 0, y: 0, z: 0};
        
        // Point on the target where the camera should be "looking"
        this.targetOffset = {x: 0, y: 0, z: 0};
        
        // Available camera modes. See mode methods.
        this.modes = 
        {
            CHASE: 0,
            FIXED: 1,
            FREE: 2,
            IN_VIEW: 3,
        };
        
        // Current camera mode
        this.mode = this.modes.FREE;
    },
    
    enterframe: function ()
    {
        this.act();
    },
    
    /**
     Invokes camera movement based on the current camera mode
     */
    act: function ()
    {   
        switch (this.mode)
        {
            case this.modes.CHASE:
                this.chase();
                break;
            case this.modes.FIXED:
                this.fixed();
                break;
            case this.modes.FREE:
                this.free();
                break;
        }
    },
    
    /**
     Chases a target
     */
    chase: function () 
    {
        if (!this.target)
        {
            return;
        }
        
        var vx = this.target.x + this.offset.x + (this.target.rotation[8] * this.distance);
        var vy = this.target.y + this.offset.y + (this.target.rotation[9] * this.distance);
        var vz = this.target.z + this.offset.z + (this.target.rotation[10] * this.distance);
        this._x += (vx - this._x) / this.speed;
        this._y += (vy - this._y) / this.speed;
        this._z += (vz - this._z) / this.speed;
        this._changedPosition = true;
        
        // LookAt
        this._centerX = this.target.x + this.targetOffset.x;
        this._centerY = this.target.y + this.targetOffset.y;
        this._centerZ = this.target.z + this.targetOffset.z;
        this._changedCenter = true;
        
        // Make this off-axis
        //this.sidestep(1);
    },
    
    /**
     Puts camera into chase mode
     @param target {Sprite3D} The target to chase
     @param distance {float} The distance between the camera and the target
     @param speed {float} Camera movement speed while chasing
     @param targetOffset {vec3} The positional offset on the target where the camera is "looking"
     @param offset {vec3} Camera offset from the target
     */
    setChase: function (target, distance, speed, targetOffset, offset)
    {
        this.target = target;
        this.distance = distance;
        this.speed = speed;
        this.targetOffset = targetOffset;
        this.offset = offset;
        this.mode = this.modes.CHASE;
    },
    
    /**
     Camera sits and looks at a vector
     */
    fixed: function ()
    {
        if (!this.target)
        {
            return;
        }
        
        this._centerX = this.target.x + this.targetOffset.x;
        this._centerY = this.target.y + this.targetOffset.y;
        this._centerZ = this.target.z + this.targetOffset.z;
        this._changedCenter = true;    
    },
    
    /**
     Camera can be moved freely (e.g. using debug controls)
     */
    free: function ()
    {
        this.target = null;
        
        var vec = this._getForwardVec();
        this._centerX = this.x + vec[0];
        this._centerY = this.y + vec[1];
        this._centerZ = this.z + vec[2];
        this._changedCenter = true;    
    },
    
    /**
     Puts camera into fixed mode
     Passing in an object would allow tracking of that object, while passing in
     a vector would make the camera constantly look at that point
     @param target {vector} A point or vector the camera should look at
     @param targetOffset {vec3} The positional offset on the target where the camera is "looking"
     */
    setFixed: function (target, targetOffset)
    {
        this.target = target;
        
        if (!targetOffset)
        {
            targetOffset = {x: 1, y: 0, z: 1};
        }
        
        this.targetOffset = targetOffset;
        this.mode = this.modes.FIXED;
    },
    
    setFree: function ()
    {
        this.mode = this.modes.FREE;
    },
    
    rotationSet: function(quat) 
    {
        quat.toMat4(this._projMat);
        this._changedRotation = true;
    },
    
    rotationApply: function(quat) 
    {
        quat.toMat4(this.tmpMat);
        mat4.multiply(this._projMat, this.tmpMat);
        this._changedRotation = true;
    }
});

/**
 It's a soccer ball
 */
var objTestBall = Class.create(PhySphere,
{
    initialize: function (radius)
    {
        PhySphere.call(this, radius);
        // Texture needs to be preloaded
        this.mesh.texture = new Texture(game.assets['images/soccerball.png']);
        chengine.tileMesh(this.mesh, 1);
        
        var newLife = new chengine.component.life(3);
        newLife.ondeath = function ()
        {
            var bigExp = new objBigExp(this, null);
            bigExp.x = this.x;
            bigExp.y = this.y;
            bigExp.z = this.z;
            scene.addChild(bigExp);
        };
        newLife.ondeath = newLife.ondeath.bind(this);
        chengine.component.add(this, newLife);   
    },
    
    onenterframe: function ()
    {
        if (this.x > 1000 || this.y > 1000 || this.z > 1000 || 
            this.x < -1000 || this.y < -1000 || this.z < -1000)
        {
            scene.removeChild(this);
        }
    }
});

var objTestEnemy = Class.create(PhyBox,
{
    initialize: function ()
    {
        PhyBox.call(this, 10, 10, 10, 0);
        this.mesh.setBaseColor('rgba(255, 255, 255, 1.0');
        this.mesh.texture = new Texture(game.assets['images/tex.jpg']);
        this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
        this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.shininess = 0;
        
        var that = this;
        var newLife = new chengine.component.life(5);
        newLife.ondeath = function ()
        {
            var bigExp = new objExp(40);
            bigExp.x = that.x;
            bigExp.y = that.y;
            bigExp.z = that.z;
            scene.addChild(bigExp);
            scene.removeChild(that);
        };
        newLife.ondeath = newLife.ondeath.bind(this);
        chengine.component.add(this, newLife); 
        this.deathTimer = 4000;
    },
    
    onenterframe: function ()
    {
        this.rotationApply(new enchant.gl.Quat(0, 1, 1, degToRad(5)));
        this.rigid.rotationApply(new enchant.gl.Quat(0, 1, 1, degToRad(5)));
        
        this.deathTimer--;
        
        if (this.deathTimer <= 0)
        {
            scene.removeChild(this);
        }
    }
});

var objScrollingFloor = Class.create(PhyBox,
{
    initialize: function ()
    {
        PhyBox.call(this, 1000, 1, 1000, 0);
        this.mesh.setBaseColor('rgba(255, 255, 255, 1.0');
        this.mesh.texture = new Texture(game.assets[TEX_GRASS]);
        this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
        this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.shininess = 0;

        this.deathTimer = 2000;
    },
    
    onenterframe: function ()
    {
        this.deathTimer--;
        
        if (this.deathTimer <= 0)
        {
            scene.removeChild(this);
        }
    }
});
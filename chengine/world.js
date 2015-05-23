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
        this.getCamera().enterframe();
    },
    
    tearDown: function ()
    {
        // Let's try destroying all meshes while cleaning Sprite3Ds
        
        /*for (var i = 0; i < this.scene2D.childNodes.length; i++)
        {
            this.scene2D.removeChild(this.scene2D.childNodes[i]);
        }
        
        this.scene2D.childNodes = [];*/
        
        /*for (var i = 0; i < this.childNodes.length; i++)
        {
            this.removeChild(this.childNodes[i]);
        }*/
        
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
        
        this.world = new enchant.gl.physics.World();
        this.stop();
        this.isPlaying = false;
    },
    
    prepare: function ()
    {
        // Default background color
        this.backgroundColor = '#000000';    
        
        // Default fog settings
        this.setFog(0.0);
        this.setFogColor(0.0, 0.0, 0.0, 1.0);
        
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

var objRoom = Class.create(
{
    initialize: function (parentScene)
    {
        this.scene = parentScene;
    },
    
    prepare: function ()
    {
    
    },
    
    clean: function ()
    {
        debugger;
        this.scene.tearDown();
        
        // Reset camera
        camera = new objCamera();
        this.scene.setCamera(camera);
    },
    
    enterframe: function (e)
    {
    
    },
    
    touchstart: function (e)
    {
    
    },
    
    touchend: function (e)
    {
    
    }, 
    
    touchmove: function (e)
    {
    
    }
});


/**
 Camera
 */
var objCamera = Class.create(Camera3D,
{
    initialize: function ()
    {
        Camera3D.call(this);
        
        // Increase draw distance
        mat4.perspective(20, enchant.Core.instance.width / enchant.Core.instance.height, 1.0, 5000.0, this._projMat);
         
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
            FIXED: 1
        };
        
        // Current camera mode
        this.mode = this.modes.CHASE;
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
    
    setPitch: function (rad)
    {
        var u = this._getUpVec();
        var f = this._getForwardVec();
        var s = this._getSideVec();
        var sx = s[0];
        var sy = s[1];
        var sz = s[2];
        var quat = new enchant.gl.Quat(sx, sy, sz, -rad);
        var vec = quat.multiplyVec3(f);
        this._centerX = vec[0];
        this._centerY = vec[1];
        this._centerZ = vec[2];
        vec = vec3.normalize(quat.multiplyVec3(u));
        this._upVectorX = vec[0];
        this._upVectorY = vec[1];
        this._upVectorZ = vec[2];
        this._changedCenter = true;
        this._changedUpVector = true;
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
    },
    
    
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

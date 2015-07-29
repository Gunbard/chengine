/**********************************************************
 Reusuable/common engine components
 
 These components should be used on an enchant.gl.Sprite3D
 subclass at minimum and must have initialize
 and enterframe methods. The enterframe method will be 
 added to the object's enterframe using addEventListener.
 
 Ex: 
 chengine.component.add(mikuPhy, 
    new chengine.component.controlCamWalk(1, game.input));
 
 NOTE: An object can have several components, but only one of
 each kind.
 
 NOTE: When overriding methods, if you use "this",
       you must bind whatever "this" is to that "this".
       Ex: 
       var newComponent = new chengine.component.somethingwithonsomething;
       newComponent.onsomething = function ()
       {
           this.asdf = 100;
       };
       newComponent.onsomething = newComponent.onsomething.bind(this);
       
 Methods to override:
 initialize - Default initializer
 enterframe - Called on frame enter
 added - Called when component is added. The component will have
         a reference to its object at this point (this.obj)
 
 **********************************************************/
 
chengine.component = {};

/**
 Adds a component to an object. Also sets the object property
 for the component.
 @param obj {Sprite3D} The object to add the component to
 @param component {chengine.component} The component to add
 */
chengine.component.add = function (obj, component)
{   
    if (!obj.components)
    {
        obj.components = [];
    }
    
    component.obj = obj;
    
    if (component.added)
    {
        component.added();
    }
    
    if (component.enterframe)
    {
        component.enterframe = component.enterframe.bind(component);
    }
    
    obj.components.push(component);
    
    if (component.enterframe)
    {
        chengine.scene.scene2D.addEventListener('enterframe', obj.components[obj.components.length - 1].enterframe);
    }
};
 
/**
 Removes a component from an object, if it exists
 @param obj {Sprite3D} The object to remove the component from
 @param component {chengine.component} The component to remove
 */
chengine.component.remove = function (obj, component)
{
    if (!obj.components)
    {
        return;
    }

    for (var i = 0; i < obj.components.length; i++)
    {
        if (obj.components[i] instanceof component)
        {
            obj.removeEventListener('enterframe',  obj.components[i].enterframe);
        }
    }
};


/**
 Gets an object's instance of a component
 @param obj {Sprite3D} The object to query
 @param component {chengine.component} The component to get
 @returns {chengine.component} The component instance, or null
 */
chengine.component.get = function (obj, component)
{
    if (obj.components)
    {
        for (var i = 0; i < obj.components.length; i++)
        {
            if (obj.components[i] instanceof component)
            {
                return obj.components[i];
            }
        }
    }
    
    return null;
};

chengine.component.controlInit = function (obj)
{
    alert(obj);
    obj.input = 
    {
        up: game.input.up,
        down: game.input.down,
        left: game.input.left,
        right: game.input.right
    };
};

/*********
 # INPUT #
 *********/
 
/**
 Generic component for handling arrow key movement
 @param speed {float} Movement speed
 */ 
chengine.component.controlWalk = Class.create
({
    initialize: function (speed)
    {
        this.speed = speed;
    },
    
    enterframe: function ()
    {
        if (game.input.k)
        {
            this.speed = 50;
        }
        else
        {
            this.speed = 1;
        }   
        
        if (game.input.up)
        {
            chengine.component.charWalk(this.obj, this.speed, DIRECTION_NORTH);
        }
        
        if (game.input.down)
        {
            chengine.component.charWalk(this.obj, this.speed, DIRECTION_SOUTH);
        }
        
        if (game.input.left)
        {
            chengine.component.charWalk(this.obj, this.speed, DIRECTION_WEST);
        }
        
        if (game.input.right)
        {
            chengine.component.charWalk(this.obj, this.speed, DIRECTION_EAST);
        }
    }
});

/**
 Controls an object such that movement is relative to the camera.
 This assumes the object is a physics object and it has a model
 property which is the visible model that will be manipulated.
 @param speed {float} Movement speed
 @param input {game.input} Input state object
 @param pad {APad} An optional virtual analog stick
 */
chengine.component.controlCameraMovable = Class.create
({    
    initialize: function (speed, input, pad)
    {
        this.speed = speed;
        this.input = input;
        this.pad = pad;
        
        // A quat that the object should be rotating towards
        this.heading = null;
        this.rotSpeed = 10;
        
        this.cameraMovementDelay = 1000;
    },
    
    enterframe: function ()
    {      
        if (game.input.k)
        {
            this.speed = 50;
        }
        else
        {
            this.speed = 1;
        }
    
        if (this.obj instanceof objCamera)
        {
            if (this.pad.isTouched)
            {    
                this.obj.forward(this.speed * -this.pad.vy * 4);
                this.obj.rotateYaw(degToRad(this.speed * this.pad.vx));
            }
            return;
        }
        
        this.obj.rotation = chengine.getCameraLockedRotation();

        var objRot = getRot(this.obj.rotation);
        var objRotDir = Math.round(objRot.y);
        
        var direction = 0;
        
        if (this.input.up)
        {   
            direction = DIRECTION_SOUTH;
            
            if (this.input.left)
            {
                direction += 45;
            }
            
            if (this.input.right)
            {
                direction -= 45;
            }
        }
        else if (this.input.down)
        {
            direction = DIRECTION_NORTH;
            
            if (this.input.left)
            {
                direction -= 45;
            }
            
            if (this.input.right)
            {
                direction += 45;
            }
        }
        else if (this.input.left)
        {   
            direction = DIRECTION_WEST;
        }
        else if (this.input.right)
        {
            direction = DIRECTION_EAST;
        }
        
        if (this.input.up || this.input.down || this.input.left || this.input.right)
        {
            this.obj.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(direction)));
            this.obj.forward(this.speed);
            
            this.heading = this.obj.rotation;
        }
        else
        {
            this.heading = null;
        }
        
        if (this.pad.isTouched)
        {
            this.obj.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(-90)));
            this.obj.rotationApply(new enchant.gl.Quat(0, 1, 0, -this.pad.rad));            
            this.obj.forward(this.speed * this.pad.dist);
            
            //this.obj.model.animationSpeed = Math.ceil(this.speed * pad.dist);
            
            var copyRot = mat4.create(this.obj.rotation);
            this.heading = copyRot;
        }
        
        if (chengine.input.getGamepadsConnected() > 0)
        {
            var inputData = chengine.input.getGamepadPolar(0);
            var rad = inputData.rad;
            var dist = inputData.dist;
            
            if (chengine.input.gamepadIsUsed(0))
            {
                this.obj.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(-90)));
                this.obj.rotationApply(new enchant.gl.Quat(0, 1, 0, -rad));            
                this.obj.forward(this.speed * dist);
                
                var copyRot = mat4.create(this.obj.rotation);
                this.heading = copyRot;
            }
        }
        
        if (this.heading && 
           (this.input.up || this.input.down || this.input.left || this.input.right || 
            this.pad.isTouched || chengine.input.gamepadIsUsed(0)))
        {   
            var targetRotation = getRot(this.heading);
            var targetRot = Math.round(targetRotation.y);
            var rot = getRot(this.obj.model.rotation);
            var yRotation = Math.round(rot.y);
            
            // Fix issue with "flip"
            if (yRotation > targetRot && this.input.right && !this.input.up)
            {
                yRotation -= 360 - this.rotSpeed;
            }
            
            if (yRotation < targetRot && this.input.left && !this.input.up)
            {
                yRotation += 360 + this.rotSpeed;
            }
            
            //alert(yRotation + ' / ' + targetRot);
            
            // Determine shortest rotation. 1: clockwise, -1: anti-clockwise
            var dir = -1;
            
            if (yRotation > targetRot)
            {
                dir = 1;
            }
            else if (yRotation < targetRot)
            {
                dir = -1;
            }
            else
            {
                this.heading = null;
            }
            
            // Flip if other direction is actually shorter
            if (Math.abs(yRotation - targetRot) > 180)
            {
                dir *= -1;
            }
            
            if (this.heading)
            {
                var amt = (Math.abs(targetRot - yRotation) / this.rotSpeed);
                this.obj.model.rotateYaw(degToRad(Math.min(amt, this.rotSpeed) * dir));
            }
        }
    }
});

/**
 Control an object as if the camera is behind the object
 @param speed {float} Movement speed
 @param input {game.input} Game input to use (optional)
 @param pad {APad} Virutal analog pad to use (optional)
 @param options {object} Extra parameters
 
 options 
 {
    upIsForward {bool} Whether or not the up direction means to 
        move forward. TODO: Use an up vector and forward vector
 }
 */
chengine.component.controlBehindMovable = Class.create
({    
    initialize: function (speed, input, pad, options)
    {
        this.speed = speed || 4;
        this.input = input;
        this.pad = pad;
        
        if (options)
        {
            this.upIsForward = options.upIsForward;
        }
        
        this.boundMaxX = 50;
        this.boundMaxY = 50 + 20;
        this.boundMinX = -50;
        this.boundMinY = 50 - 20;
        
        this.prevX = null;
        this.prevY = null; 
        
        this.dummyOrienter = new Sprite3D();
        this.rotSpeed = 0.25;
    },
    
    enterframe: function ()
    {    
        this.prevX = this.obj.x;
        this.prevY = this.obj.y;
    
        if (this.input.up)
        {
            this.obj.altitude(this.speed);
        }
        
        if (this.input.down)
        {
            this.obj.altitude(-this.speed);
        }
        
        if (this.input.left)
        {
            this.obj.sidestep(this.speed);
        }
        
        if (this.input.right)
        {
            this.obj.sidestep(-this.speed);
        }
        
        if (this.pad && this.pad.isTouched)
        {    
            var vSpeed = this.speed * -this.pad.vy;
            var hSpeed = this.speed * -this.pad.vx;
            
            if (this.upIsForward)
            {
                this.obj.forward(vSpeed);
            }
            else
            {
                this.obj.altitude(vSpeed);
            }
            
            this.obj.sidestep(hSpeed);
        }
        
        if (chengine.input.getGamepadsConnected() > 0)
        {
            var inputData = chengine.input.getGamepadAxesState(0);
            if (chengine.input.gamepadIsUsed(0))
            {    
                var vSpeed = this.speed * -inputData.vy;
                var hSpeed = this.speed * -inputData.vx;
                
                if (this.upIsForward)
                {
                    this.obj.forward(vSpeed);
                }
                else
                {
                    this.obj.altitude(-vSpeed);
                }
                
                this.obj.sidestep(hSpeed);
            }
        }
        
        
        // Pseudo-slerp model. Don't want to actually rotate the collision object, though.
        this.dummyOrienter.rotation = chengine.copyRotation(this.obj.model.rotation, false);
        var rotationSpeed = this.rotSpeed;
        
        var directionX = DIRECTION_NORTH;
        var directionY = DIRECTION_SOUTH + 1;
        
        if (this.input.left)
        {
            directionX += 20;
        }
        
        if (this.input.right)
        {
            directionX -= 20;
        }
        
        if (this.input.up)
        {
            directionY -= 20;
        }
        
        if (this.input.down)
        {
            directionY += 20;
        }
        
        if (this.pad && this.pad.isTouched)
        {
            var vSpeed = 20 * -this.pad.vy;
            var hSpeed = 20 * -this.pad.vx;
            directionX += hSpeed;
            directionY -= vSpeed;
        }
        
        if (chengine.input.getGamepadsConnected() > 0)
        {
            var inputData = chengine.input.getGamepadAxesState(0);
            if (chengine.input.gamepadIsUsed(0))
            {
                var vSpeed = 40 * -inputData.vy;
                var hSpeed = 40 * -inputData.vx;
                directionX += hSpeed;
                directionY += vSpeed;
            }
        }
        
        if (this.input.up || this.input.down || this.input.left || this.input.right ||
            (this.pad && this.pad.isTouched) || 
            chengine.input.gamepadIsUsed(0))
        {            
            if (this.prevX && this.obj.x <= this.boundMinX || this.obj.x >= this.boundMaxX)
            {
                this.obj.x = this.prevX;
            }
            
            if (this.prevY && this.obj.y <= this.boundMinY || this.obj.y >= this.boundMaxY)
            {
                this.obj.y = this.prevY;
            }
            
            this.dummyOrienter.rotationSet(new enchant.gl.Quat(0, 1, 0, degToRad(directionX)));
            this.dummyOrienter.rotationApply(new enchant.gl.Quat(1, 0, 0, degToRad(directionY)));
            this.heading = this.dummyOrienter.rotation;
        }
        else
        {
            directionX = DIRECTION_NORTH;
            directionY = DIRECTION_SOUTH + 1;
            
            this.dummyOrienter.rotationSet(new enchant.gl.Quat(0, 1, 0, degToRad(directionX)));
            this.dummyOrienter.rotationApply(new enchant.gl.Quat(1, 0, 0, degToRad(directionY)));
            this.heading = this.dummyOrienter.rotation;        
            rotationSpeed = this.rotSpeed;
        }
        
        if (this.heading)
        {   
            var finishedY = false;
            var finishedX = false;
            var targetRotation = getRot(this.heading);
            var targetRotY = Math.round(targetRotation.y);
            var targetRotX = Math.round(targetRotation.x);
            var rot = getRot(this.obj.model.rotation);
            var yRotation = Math.round(rot.y);
            var xRotation = Math.round(rot.x);
            
            if (game.input.down)
            {
                debugger;
            }
            
            if (xRotation >= 360)
            {
                xRotation -= 360;
            }
            else if (xRotation < 0)
            {
                xRotation += 360;
            }
            
            var dirY = -1;
            var dirX = -1;

            if (yRotation > targetRotY)
            {
                dirY = 1;
            }
            else if (yRotation < targetRotY)
            {
                dirY = -1;
            } 
            else
            {
                finishedY = true;
            }
            
            if (xRotation > targetRotX)
            {
                dirX = 1;
            }
            else if (xRotation < targetRotX)
            {
                dirX = -1;
            }
            else
            {
                finishedX = true;
            }
            
            if (finishedX && finishedY)
            {
                this.heading = null;
            }
            
            // Flip if other direction is actually shorter
            if (Math.abs(yRotation - targetRotY) > 180)
            {
                dirY *= -1;
            }
            
            if (Math.abs(xRotation - targetRotX) > 180)
            {
                dirX *= -1;
            }
            
            if (this.heading)
            {
                if (yRotation == 0)
                {
                    yRotation = 0.001;
                }
                
                if (xRotation == 0)
                {
                    xRotation = 0.001;
                }
                
                // Temp. compensate for flip
                var rotAmtX = Math.abs(targetRotX - xRotation);
                if (rotAmtX >= 180)
                {
                    rotAmtX = Math.abs(360 - targetRotX - xRotation);
                }
                
                var amtY = Math.abs(targetRotY - yRotation) / (yRotation * rotationSpeed);
                var amtX = rotAmtX / (1 / (rotationSpeed / 8));
                amtY *= dirY;
                amtX *= dirX;
                
                this.obj.model.rotateYaw(degToRad(amtY));
                this.obj.model.rotatePitch(degToRad(amtX));
                
                // Correct for roll drift
                var drift = getRot(this.obj.model.rotation);
                this.obj.model.rotateRoll(degToRad(180-drift.z));
            }
            else
            {
                this.obj.model.rotation = this.dummyOrienter.rotation;
            }
        }
    }
});

/**
 Generates bullets relative to the object
 @param options 
 {
    inputKey {string} Key to trigger the shot
    bullet {obj} An object that will serve as a bullet
    scene {objScene} Scene to add stuff to
    offset {x, y, z} Offset where the bullet will be created
    forwardOffset {int} Relative position forward where the bullet will be created
    cooldown {int} Time before another bullet can be fired, set to null to fire 
                   only when pressed
 }
 */
chengine.component.shoot = Class.create
({    
    initialize: function (options)
    {
        this.options = options || {};
        this.options.bullet = this.options.bullet || objShot;
        this.options.forwardOffset = this.options.forwardOffset || 0;
        this.options.offset = this.options.offset || {x: 0, y: 0, z: 0};
        this.cooldownMax = this.options.cooldown;
        this.cooldown = this.options.cooldown;
        this.bulletSpeed = this.options.bulletSpeed || 25;
        var that = this;
        this.fireAction = function ()
        {
            var bullet = new that.options.bullet();
            bullet.speed = that.bulletSpeed;
            bullet.x = that.obj.x + that.options.offset.x;
            bullet.y = that.obj.y + that.options.offset.y;
            bullet.z = that.obj.z + that.options.offset.z;
            bullet.rotation = chengine.copyRotation(that.obj.model.rotation, false);
            bullet.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(180)));
            bullet.forward(that.options.forwardOffset);
            that.options.scene.addChild(bullet);     
            
            if (that.options.sound)
            {
                chengine.sound.play(that.options.sound);
            }
        }
    },
    
    enterframe: function ()
    {      
        var chargeComp = chengine.component.get(this.obj, chengine.component.charge);
        if (chargeComp && (chargeComp.charge > 20 || chargeComp.cooldown > -1))
        {
            return;
        }
        
        var that = this;

        if (this.cooldownMax)
        {
            if (game.input[this.options.inputKey] || this.options.inputButton.pressed ||
               (chengine.input.getGamepadsConnected() > 0 && chengine.input.buttonHeld(0, 1)))
            {
                if (this.cooldown > 0)
                {
                    this.cooldown -= 1;
                }
                else
                {
                    this.fireAction();
                    this.cooldown = this.cooldownMax;
                }
            }
        }
        else
        {
            if (chengine.input.keyPressed(this.options.inputKey) ||
               (chengine.input.getGamepadsConnected() > 0 && chengine.input.buttonPressed(0, 1)))
            {
                this.fireAction();
            }
        }
    }
});

/**
 Generates bullets relative to the object
 @param options 
 {
    inputKey {string} Key to trigger the shot
    bullet {obj} An object that will serve as a bullet
    scene {objScene} Scene to add stuff to
    offset {x, y, z} Offset where the bullet will be created
    forwardOffset {int} Relative position forward where the bullet will be created
    cooldown {int} Time before another bullet can be fired, set to null to fire 
                   only when pressed
 }
 */
chengine.component.charge = Class.create
({    
    initialize: function (options)
    {
        this.options = options || {};
        this.options.bullet = this.options.bullet || objShot;
        this.options.forwardOffset = this.options.forwardOffset || 0;
        this.options.offset = this.options.offset || {x: 0, y: 0, z: 0};
        this.chargeDelay = 50;
        this.charge = 0;
        this.shootDelay = -1;
        this.shootDelayMax = 50;
        this.cooldown = -1;
        this.cooldownMax = this.options.cooldownMax || 20;
        this.target = null;
        this.bulletSpeed = this.options.bulletSpeed || 10;
        var that = this;
        this.fireAction = function ()
        {
            var bullet = new that.options.bullet(this.target);
            bullet.speed = that.bulletSpeed;
            bullet.x = that.obj.x;
            bullet.y = that.obj.y;
            bullet.z = that.obj.z;
            bullet.rotation = chengine.copyRotation(that.obj.model.rotation, false);
            bullet.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(180)));
            bullet.forward(that.options.forwardOffset);
            that.options.scene.addChild(bullet);     
            
            if (that.options.sound)
            {
                chengine.sound.play(that.options.sound);
            }
        }
    },
    
    onChargeStart : function ()
    {
    },
    
    onChargeLoss: function ()
    {
    },
    
    onCharged: function ()
    {
    },        
    
    onFire: function ()
    {
    },
    
    enterframe: function ()
    {      
        var scene = enchant.Core.instance.GL.currentScene3D;
        var that = this;
        
        if (this.cooldown > -1)
        {
            this.cooldown -= 1;
            return;
        }
        
        if (game.input[this.options.inputKey] || this.options.inputButton.pressed ||
           (chengine.input.getGamepadsConnected() > 0 && chengine.input.buttonHeld(0, 1)))
        {
            if (this.charge < this.chargeDelay)
            {
                if (this.charge == 0)
                {
                    this.onChargeStart();
                }
                
                this.charge += 1;
                
                if (this.shootDelay > 0)
                {
                    this.cooldown = this.cooldownMax;
                    this.shootDelay = -1;
                    this.onFire();
                    this.onChargeLoss();
                    this.fireAction();
                    if (this.targetGraphic)
                    {
                        scene.removeChild(this.targetGraphic);
                    }
                    this.target = null;
                }
            }
            else
            {
                if (this.shootDelay < this.shootDelayMax)
                {
                    this.shootDelay = this.shootDelayMax;
                    this.onCharged();
                    chengine.sound.play(SOUND_TARGET);
                }
                else
                {
                    // Create targeting ray
                    var targetingRange = 1000;
                    var startPos = 
                    {
                        x: that.obj.model.x + this.options.offset.x,
                        y: that.obj.model.y + this.options.offset.y,
                        z: that.obj.model.z + this.options.offset.z,
                    }
                    
                    var endPos =
                    {
                        x: startPos.x + that.obj.model.rotation[8] * targetingRange,
                        y: startPos.y + that.obj.model.rotation[9] * targetingRange,
                        z: startPos.z + that.obj.model.rotation[10] * targetingRange
                    }
                    
                    var hitObj = chengine.rayTestObj(startPos, endPos, objTestEnemy);
                    if (hitObj)
                    {
                        if (!this.target)
                        {
                            chengine.sound.play(SOUND_TARGETLOCK);
                            this.target = hitObj;
                            this.targetGraphic = new objTarget(30, hitObj);
                            
                            scene.addChild(this.targetGraphic);
                        }
                    }
                }
            }
        }
        else
        {
            if (this.shootDelay > 0)
            {
                this.shootDelay -= 1;
            }
            else if (this.shootDelay == 0)
            {
                this.onChargeLoss();
                this.shootDelay = -1;
            }
            
            this.charge = 0;
        }
    }
});

/**
 */
chengine.component.jumpable = Class.create
({
    initialize: function (jumpVelocity, groundOffset)
    {
        if (!jumpVelocity)
        {
            jumpVelocity = 200;
        }
        
        if (!groundOffset)
        {
            groundOffset = 10;
        }
        
        this.jumpVelocity = jumpVelocity;
        this.groundOffset = groundOffset;
    },
    
    onJump: null,
    onFall: null,
    onLand: null,
    
    changeState: function (state)
    {
    
    },
    
    enterframe: function ()
    {        
        if (chengine.input.keyPressed('space') && !this.obj.isJumping)
        {
            // Only allow jump if touching the ground
            var onGround = chengine.rayTest({x: this.obj.x, y: this.obj.y, z: this.obj.z}, {x: this.obj.x, y: this.obj.y - this.groundOffset, z: this.obj.z});
        
            if (onGround)
            {
                if (this.onJump)
                {
                    this.onJump();
                }
                
                this.obj.isJumping = true;
                this.obj.isFalling = false;
                chengine.pushUp(this.obj.rigid.rigidBody, this.jumpVelocity);
            }
        }
        
        if (this.obj.isJumping && chengine.rigidStoppedFalling(this.obj.rigid.rigidBody))
        {
            if (!this.obj.isFalling)
            {
                this.obj.isFalling = true;
                
                if (this.onFall)
                {
                    this.onFall();
                }
            }
            else
            {
                this.obj.isJumping = false;
                this.obj.isFalling = false;
                
                if (this.onLand)
                {
                    this.onLand();
                }
            }
        }
    }
});
 
/**
 Adds HP stuff
 */
chengine.component.life = Class.create
({
    initialize: function (maxHP)
    {
        if (!maxHP)
        {
            maxHP = 100;
        }
    
        this.HP = maxHP;
        this.maxHP = maxHP;
    },
    
    // EVENTS
    
    /**
     Called when damage is dealt
     */
    ondamage: function ()
    {
        chengine.flash(this.obj);
    },
    
    /**
     Called when HP reaches zero
     */
    ondeath: null,
    
    // ACTIONS
    
    /**
     Deals damage to object (lowers HP)
     */
    damage: function (amount)
    {
        if (this.HP <= 0)
        {
            return;
        }
    
        if (!amount)
        {
            amount = 1;
        }
        
        this.HP -= amount;
        
        this.ondamage();
        
        if (this.HP <= 0)
        {
            if (this.ondeath)
            {
                this.ondeath();
            }
            else
            {
                scene.removeChild(this.obj);
            }
        }
    }
}); 


/*********
 Helpers
*********/
 
/*************
 # Character #
 *************/ 
 
/**
 Moves and rotates (yaw) an object towards a direction
 @param obj {MSprite3D} Object to move
 @param speed {float} Movement speed
 @param direction {float} Direction in degrees
 */
chengine.component.charWalk = function (obj, speed, direction)
{
    var rad = degToRad(direction);
    obj.rotationSet(new enchant.gl.Quat(0, 1, 0, rad));
    obj.forward(speed);
};
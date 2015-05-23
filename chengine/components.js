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
        //this.obj.rotation = camera.invMatY;
        //this.obj.rotateYaw(degToRad(180));
        
        this.obj.rotation = chengine.getCameraLockedRotation();

        var objRot = getRot(this.obj.rotation);
        var objRotDir = Math.round(objRot.y);
        
        var direction = 0;
        
        /*if (this.input.up && this.input.left)
        {
            direction = DIRECTION_SOUTH + 45;
        }
        
        else if (this.input.up && this.input.right)
        {
            direction = DIRECTION_SOUTH - 45;
        }
        
        else if (this.input.down && this.input.left)
        {
            direction = DIRECTION_NORTH - 45;
        }
        
        else if (this.input.down && this.input.right)
        {
            direction = DIRECTION_NORTH + 45;
        }*/
        
        
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
            
            /*
            if (direction > 360)
            {
                direction -= 360;
            }
            else if (direction < 0)
            {
                direction += 360;
            }*/
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
            //var copyRot = mat4.create(this.obj.rotation);
            //this.obj.heading = copyRot;
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
                //this.obj.heading = copyRot;
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
                //this.obj.model.rotateYaw(degToRad(this.rotSpeed * dir));
                var amt = (Math.abs(targetRot - yRotation) / this.rotSpeed);
                this.obj.model.rotateYaw(degToRad(Math.min(amt, this.rotSpeed) * dir));
            }
            
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
            this.ondeath();
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
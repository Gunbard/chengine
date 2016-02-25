/****************************
 Character classes
 Player character, NPC, etc.
 ****************************/

/**
 A generic character, playable or non-playable using a capsule
 as a collision object.
 @param model {object} MMD model from the assets array used to represent the character
 @param radius {float} Radius of the capsule. Optional.
 @param height {float} Height of the capsule. Optional.
 @param mass {float} Mass of the capsule. Optional.
 @param hp {int} Initial HP amount. Optional. TODO: Update
 */ 
var objCharacter = Class.create(PhyCapsule,
{
    initialize: function (model, radius, height, mass, hp)
    {
        // Default attributes for the collision capsule
        radius = radius || 4;
        height = height || 12;
        mass = mass || 0;
    
        PhyCapsule.call(this, radius, height, mass);
        
        // The model will have the same orientation and position as the collsion capsule
        this.model = game.assets[model].clone();
        this.modelOffset = {x: 0, y: 10, z: 0};
        this.modelRotationOffset = {x: 0, y: 0, z: 0};
        
        this.targetPosition = null;
        this.moveSpeed = null;
        this.moveTime = 0;
        
        // Change the alpha to see the physics object
        this.mesh.setBaseColor('rgba(0, 255, 0, 0.0)');
        
        // Prevent tip over
        var ang = new Ammo.btVector3(0, 1, 0);
        this.rigid.rigidBody.setAngularFactor(ang);
        Ammo.destroy(ang);
        
        
        /*var newLife = new chengine.component.life(99999);
        newLife.ondeath = function ()
        {
            //alert('ded');
        };
        newLife.ondeath = newLife.ondeath.bind(this);
        chengine.component.add(this, newLife);  */ 
    },
    
    onaddedtoscene: function ()
    {
        chengine.getScene().addChild(this.model); 
    },
    
    onremovedfromscene: function ()
    {
        this.model.clearEventListener();
        var i = this.model.skeleton.childNodes.length;
        while (i--)
        {
            chengine.getScene().removeChild(this.model.skeleton.childNodes[i]);
        }
        chengine.getScene().removeChild(this.model);
    },
    
    onenterframe: function ()
    {
        chengine.attach(this.model, this, this.modelOffset);
        
        if (this.targetPosition && this.moveTime > 0) 
        {
            this.x += Math.floor(chengine.smoothValue(this.x, this.targetPosition.x, this.moveSpeed));
            this.y += Math.floor(chengine.smoothValue(this.y, this.targetPosition.y, this.moveSpeed));
            this.z += Math.floor(chengine.smoothValue(this.z, this.targetPosition.z, this.moveSpeed));
            
            this.moveTime -= 1;
            
            if (this.moveTime == 0)
            {
                this.targetPosition = null;
                if (this.moveCallback)
                {
                    this.moveCallback();
                    this.moveCallback = null;
                }
            }
        }    
    },
    
    /**
     Holds an object in place (turn it into a solid, immobile block) but will still be
     affected by gravity
     @param shouldHold {bool} Whether or not to hold it
     */
    hold: function (shouldHold)
    {
        if (!shouldHold)
        {
            shouldHold = true;
        }
    
        var gravityVector = new Ammo.btVector3(0, 1, 0); // Prevents tip over
        
        if (shouldHold)
        {
            var zeroVector = new Ammo.btVector3(0, 0, 0);
            this.rigid.rigidBody.setAngularFactor(zeroVector);
            this.rigid.rigidBody.setLinearFactor(gravityVector);
            Ammo.destroy(zeroVector);
        }
        else
        {
            var nonZeroVector = new Ammo.btVector3(1, 1, 1);
            this.rigid.rigidBody.setAngularFactor(gravityVector);
            this.rigid.rigidBody.setLinearFactorFactor(nonZeroVector);
        }
        
        this.isHolding = shouldHold;
        Ammo.destroy(gravityVector);
    },
    
    moveTo: function (position, speed) 
    {
        this.x += chengine.smoothValue(this.x, position.x, speed);
        this.y += chengine.smoothValue(this.y, position.y, speed);
        this.z += chengine.smoothValue(this.z, position.z, speed);
    },
    
    moveBy: function (position, speed, callback)
    {
        if (!this.targetPosition)
        {
            this.targetPosition = {x: this.x + position.x, y: this.y + position.y, z: this.z + position.z};
            this.moveSpeed = speed;
            this.moveTime = speed;
            this.moveCallback = callback;
        }
    }
});
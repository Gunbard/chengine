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
 */ 
var objCharacter = Class.create(PhyCapsule,
{
    initialize: function (model, radius, height, mass)
    {
        // Default attributes for the collision capsule
        radius = radius || 4;
        height = height || 12;
        mass = mass || 1;
    
        PhyCapsule.call(this, radius, height, mass);
        
        // The model will have the same orientation and position as the collsion capsule
        this.model = game.assets[model].clone();
        
        // Change the alpha to see the physics object
        this.mesh.setBaseColor('rgba(0, 255, 0, 0.0)');
        
        // Prevent tip over
        var ang = new Ammo.btVector3(0, 1, 0);
        this.rigid.rigidBody.setAngularFactor(ang);
        Ammo.destroy(ang);
        
        
        var newLife = new chengine.component.life(3);
        newLife.ondeath = function ()
        {
            alert('ded');
        };
        newLife.ondeath = newLife.ondeath.bind(this);
        chengine.component.add(this, newLife);   
    },
    
    addToScene: function (scene)
    {
        scene.addChild(this.model);
        scene.addChild(this);
    },
    
    removeFromScene: function (scene)
    {
        this.model.clearEventListener();
        var i = this.model.skeleton.childNodes.length;
        while (i--)
        {
            scene.removeChild(this.model.skeleton.childNodes[i]);
        }
        scene.removeChild(this.model);
        scene.removeChild(this);
    },
    
    onenterframe: function ()
    {
        chengine.attach(this.model, this, {x: 0, y: -10, z: 0});
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
    }
});
/*******************************************
 Projectile classes
 Mostly bullets that fly in a path
 *******************************************/
 
/**
 A basic bullet
 */
var objShot = Class.create(Cylinder, 
{
	initialize: function () 
    {
        //Sphere.call(this);
        Cylinder.call(this, 0.25, 25, 10);
        mat4.rotateX(this.matrix, degToRad(90));
        //this.mesh.setBaseColor('rgba(245, 240, 30, 0.8)');
        this.mesh.setBaseColor('rgba(0, 255, 0, 0.6)');
        this.speed = 25;
        this.timer = 100;
        this.bounding.threshold = 100;
        this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
        this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.shininess = 0;
     
        var snd = game.assets['sounds/tielaser.wav'].clone();
        snd.play();
	},
	
    onenterframe: function ()
    {
        // Add glow effect
        if (!this.glow)
        {
            this.glow = new Cylinder(0.5, 28, 10);
            mat4.rotateX(this.glow.matrix, degToRad(90));
            this.glow.mesh.setBaseColor('rgba(0, 255, 0, 0.2)');
            this.scene.addChild(this.glow);
        }
    
        this.glow.rotation = this.rotation;
        this.glow.x = this.x;
        this.glow.y = this.y;
        this.glow.z = this.z;
    
		this.forward(-this.speed);
        this.glow.forward(-this.speed);
        
        this.timer -= 1;
        
        if (this.timer <= 0)
        {
            scene.removeChild(this.glow);
            scene.removeChild(this);
        }
        
        var rx = this.rotation[8] * 30;
        var ry = this.rotation[9] * 30;
        var rz = this.rotation[10] * 30;
        
        var ray1 = new Ammo.btVector3(this.x, this.y, this.z);
        var ray2 = new Ammo.btVector3(this.x - rx, this.y - ry, this.z - rz);
        
        var rayCallback = new Ammo.ClosestRayResultCallback(ray1, ray2);
        scene.world._dynamicsWorld.rayTest(ray1, ray2, rayCallback); 

        if (rayCallback.hasHit())
        {
            var exp = new objExp(5);
            exp.x = this.x;
            exp.y = this.y;
            exp.z = this.z;
            scene.addChild(exp);
            
            var hitpoint = rayCallback.get_m_hitPointWorld();
            var collisionObj = rayCallback.get_m_collisionObject();
            var body = Ammo.btRigidBody.prototype.upcast(collisionObj);
            var owner = scene.rigidOwner(body);
            
            if (owner instanceof objTestBall)
            {                                
                var exp = new objExp(10);
                exp.x = hitpoint.x();
                exp.y = hitpoint.y();
                exp.z = hitpoint.z();
                scene.addChild(exp);
                
                chengine.pushForward(this, body, 20);
                
                var lifeComp = chengine.component.get(owner, chengine.component.life);
                if (lifeComp)
                {
                    lifeComp.damage(1);
                }
            }
            
            scene.removeChild(this.glow);
            scene.removeChild(this);
        }
        
        Ammo.destroy(ray1);
        Ammo.destroy(ray2);
        Ammo.destroy(rayCallback);
	}
});

/**
 A zero-velocity laser beam. Deals damage once max size is reached.
 */
var objBeam = Class.create(Beam,
{
    initialize: function (scene)
    {
        this.length = 1;
        this.size = 0.2;
        this.sizeMax = 1;
        this.sizeRate = 0.1;
        this.shrinking = false;
        this.scanLength = 1000;
        
        Beam.call(this, this.size, this.length, 8);
        mat4.rotateX(this.matrix, degToRad(90));
        mat4.rotateZ(this.matrix, degToRad(180));
        chengine.unsetLighting(this.mesh);
        this.mesh.setBaseColor('rgba(255, 0, 0, 0.8)');        
        this.timer = 30;
        this.hit = false;
    },
    
    onenterframe: function ()
    {   
        //this.length += 20;
        
        if (!this.shrinking && this.size < this.sizeMax)
        {
            this.size += this.sizeRate;
        }
        else
        {
            this.shrinking = true;
        }
        
        if (this.shrinking)
        {
            if (this.size > 0)
            {
                this.size -= this.sizeRate;
            }
            else
            {
                scene.removeChild(this);
            }
        }
        
        if (this.timer > 0)
        {
            this.timer -= 1;
        }
        else
        {
            scene.removeChild(this);
        }

        // This is inefficient as SHIT. FIX IT
        this.mesh = enchant.gl.Mesh.createBeam(this.size, this.length, 6);
        chengine.unsetLighting(this.mesh);
        this.mesh.setBaseColor('rgba(255, 0, 0, 0.8)');
        
        
        if (this.hit)
        {
            return;
        }
        
        // Collision detection
        var rx = this.rotation[8] * this.scanLength;
        var ry = this.rotation[9] * this.scanLength;
        var rz = this.rotation[10] * this.scanLength;
        
        var ray1 = new Ammo.btVector3(this.x, this.y, this.z);
        var ray2 = new Ammo.btVector3(this.x - rx, this.y - ry, this.z - rz);
        
        var rayCallback = new Ammo.ClosestRayResultCallback(ray1, ray2);
        scene.world._dynamicsWorld.rayTest(ray1, ray2, rayCallback); 

        if (rayCallback.hasHit())
        {
            var hitpoint = rayCallback.get_m_hitPointWorld();
        
            if (this.shrinking && !this.hit)
            {
                this.hit = true;

                var collisionObj = rayCallback.get_m_collisionObject();
                var body = Ammo.btRigidBody.prototype.upcast(collisionObj);
                var owner = scene.rigidOwner(body);
                
                if (owner instanceof objTestBall)
                {                                
                    var exp = new objExp(10);
                    exp.x = hitpoint.x();
                    exp.y = hitpoint.y();
                    exp.z = hitpoint.z();
                    scene.addChild(exp);
                    
                    chengine.pushForward(this, body, 20);
                    
                    var lifeComp = chengine.component.get(owner, chengine.component.life);
                    if (lifeComp)
                    {
                        lifeComp.damage(1);
                    }
                }
            }
            
            this.length = distanceToPoint(this, {x: hitpoint.x(), y: hitpoint.y(), z: hitpoint.z()});
            
            //scene.removeChild(this);
        }
        else
        {
            this.length = this.scanLength;
        }
        
        Ammo.destroy(ray1);
        Ammo.destroy(ray2);
        Ammo.destroy(rayCallback);

        
    }
});

/**
 A homing bullet
 */
var objHomingShot = Class.create(Sphere, 
{
	initialize: function (target) 
    {
        Sphere.call(this, 2);
        this.mesh.setBaseColor('rgba(245, 240, 30, 1.0)');
        this.speed = 8;
        this.timer = 100;
        this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
        this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.shininess = 0;
        this.target = target;
        this.homingDelay = 10;

        this.targetGraphic = new objTarget(10, target);
        scene.addChild(this.targetGraphic);
	},
	
    onenterframe: function ()
    {
        if (this.homingDelay > 0)
        {
            this.homingDelay -= 1;
        }
        else if (this.target)
        {
            this.speed = 15;
            this.rotation = chengine.rotationTowards(this, this.target);
        }
    
        // Add glow effect
        if (!this.glow)
        {
            this.glow = new Sphere(6);
            this.glow.mesh.setBaseColor('rgba(245, 240, 30, 0.2)');
            scene.addChild(this.glow);
        }
    
        this.glow.rotation = this.rotation;
        this.glow.x = this.x;
        this.glow.y = this.y;
        this.glow.z = this.z;
    
		this.forward(-this.speed);
        this.glow.forward(-this.speed);
        
        this.timer -= 1;
        
        if (this.timer <= 0)
        {
            scene.removeChild(this.glow);
            scene.removeChild(this);
        }
        
        var rx = this.rotation[8] * 10;
        var ry = this.rotation[9] * 10;
        var rz = this.rotation[10] * 10;
        
        var ray1 = new Ammo.btVector3(this.x, this.y, this.z);
        var ray2 = new Ammo.btVector3(this.x - rx, this.y - ry, this.z - rz);
        
        var rayCallback = new Ammo.ClosestRayResultCallback(ray1, ray2);
        scene.world._dynamicsWorld.rayTest(ray1, ray2, rayCallback); 

        if (rayCallback.hasHit())
        {
            var collisionObj = rayCallback.get_m_collisionObject();
            var body = Ammo.btRigidBody.prototype.upcast(collisionObj);
            var owner = scene.rigidOwner(body);
            
            if (owner instanceof objTestBall)
            {
                chengine.pushForward(this, body, 20);
                chengine.flash(owner);
                owner.HP -= 1;
            }
            
            var exp = new objExp(10);
            exp.x = this.x;
            exp.y = this.y;
            exp.z = this.z;
            scene.addChild(exp);
            scene.removeChild(this.glow);
            scene.removeChild(this.targetGraphic);
            scene.removeChild(this);
        }
        
        Ammo.destroy(ray1);
        Ammo.destroy(ray2);
        Ammo.destroy(rayCallback); 
	}
});

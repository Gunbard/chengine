/*******************************************
 Projectile classes
 Mostly bullets that fly in a path
 *******************************************/
 
/**
 A basic bullet
 */
var objShot = Class.create(PhyCylinder, 
{
	initialize: function () 
    {
        //Sphere.call(this);
        PhyCylinder.call(this, 2, 40, 0);
        mat4.rotateX(this.matrix, degToRad(90));
        //this.mesh.setBaseColor('rgba(245, 240, 30, 0.8)');
        this.mesh.setBaseColor('rgba(255, 200, 15, 0.6)');
        this.speed = 10;
        this.timer = 30;
        //this.bounding.threshold = 100;
        this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
        this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.shininess = 0;
     
        //this.removeEventListener('timestep');
        
        /*var transform = new Ammo.btTransform();
        transform.setIdentity();
        var quat = new enchant.gl.Quat(1, 0, 0, degToRad(90));
        var qq = quat._quat;
        var q = new Ammo.btQuaternion(qq[0], qq[1], qq[2], qq[3]);
        transform.setRotation(q);
        this.rigid.rigidBody.setCenterOfMassTransform(transform);*/
        
        //this.rigid.rotationApply(new enchant.gl.Quat(1, 0, 0, degToRad(90)));

        this.rigid.rigidBody.getCollisionShape().setMargin(2);
	},
	
    onenterframe: function ()
    {
        // Add glow effect
        if (!this.glow)
        {
            this.glow = new Cylinder(0.5, 28, 10);
            mat4.rotateX(this.glow.matrix, degToRad(90));
            this.glow.mesh.setBaseColor('rgba(0, 255, 0, 0.2)');
            //this.scene.addChild(this.glow);
        }
    
        this.glow.rotation = this.rotation;
        this.glow.x = this.x;
        this.glow.y = this.y;
        this.glow.z = this.z;
    
		this.forward(this.speed);
        this.glow.forward(-this.speed);
        
        this.timer -= 1;
        
        if (this.timer <= 0)
        {
            //scene.removeChild(this.glow);
            scene.removeChild(this);
        }
        
        var hitInfo = scene.world.contactTest(this.rigid);
        var hitObj = hitInfo.hitObject;
        if (hitObj)
        {
            if (hitObj instanceof objTestBall || hitObj instanceof PhyBox || (hitObj instanceof Sprite3D))
            {                                
                var exp = new objExp(10);
                exp.x = this.x;
                exp.y = this.y;
                exp.z = this.z;
                scene.addChild(exp);
                scene.removeChild(this);
                
                chengine.sound.play(SOUND_HIT);
                
                var lifeComp = chengine.component.get(hitObj, chengine.component.life);
                if (lifeComp)
                {
                    lifeComp.damage(1);
                }
            }
        }
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
        this.sizeMax = 5;
        this.sizeRate = 0.25;
        this.shrinking = false;
        this.scanLength = 1000;
        
        Beam.call(this, this.size, this.length, 8);
        mat4.rotateX(this.matrix, degToRad(90));
        //mat4.rotateZ(this.matrix, degToRad(180));

        this.mesh = enchant.gl.Mesh.createBeam(this.size, this.length, 6);
        chengine.unsetLighting(this.mesh);
        this.mesh.setBaseColor('rgba(255, 0, 0, 0.8)');
              
        this.timer = 30;
        this.hit = false;
    },
    
    onenterframe: function ()
    {   
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
            //scene.removeChild(this);
        }

        // This is inefficient as SHIT. FIX IT
        this.mesh = enchant.gl.Mesh.createBeam(this.size, this.length, 6);
        chengine.unsetLighting(this.mesh);
        this.mesh.setBaseColor('rgba(255, 0, 0, 0.8)');
        
        if (this.hit)
        {
            return;
        }
        
        /*var hitInfo = scene.world.contactTest(this.rigid);
        var hitObj = hitInfo.hitObject;
        if (hitObj)
        {
            var hitpoint = hitInfo.hitPointA;
        
            //if (this.shrinking && !this.hit)
            //{
                if (hitObj instanceof PhyBox) //|| hitObj instanceof objCharacter)
                {   
                    //this.hit = true;
                    
                    var exp = new objExp(10);
                    exp.x = hitpoint.x; //this.x;
                    exp.y = hitpoint.y; //this.y;
                    exp.z = hitpoint.z; //this.z;
                    scene.addChild(exp);
                    scene.removeChild(this);
                    
                    chengine.sound.play(SOUND_HIT);
            
                    var lifeComp = chengine.component.get(hitObj, chengine.component.life);
                    if (lifeComp)
                    {
                        lifeComp.damage(1);
                    }
                    
                    this.length = distanceToPoint(this, {x: hitpoint.x, y: hitpoint.y, z: hitpoint.z});
                }
                
            //}            
        }
        else
        {
            this.length = this.scanLength;
        }*/
        
        
        // Collision detection
        var rx = this.rotation[8] * this.scanLength;
        var ry = this.rotation[9] * this.scanLength;
        var rz = this.rotation[10] * this.scanLength;
        
        var ray1 = new Ammo.btVector3(this.x, this.y, this.z);
        var ray2 = new Ammo.btVector3(this.x + rx, this.y + ry, this.z + rz);
        
        var rayCallback = new Ammo.ClosestRayResultCallback(ray1, ray2);
        scene.world._dynamicsWorld.rayTest(ray1, ray2, rayCallback); 

        if (rayCallback.hasHit())
        {
            var hitpoint = rayCallback.get_m_hitPointWorld();
        
            if (this.shrinking && !this.hit)
            {
                var collisionObj = rayCallback.get_m_collisionObject();
                var body = Ammo.btRigidBody.prototype.upcast(collisionObj);
                var owner = scene.rigidOwner(body);
                
                if (owner instanceof objTestBall || owner instanceof PhyBox)
                {
                    this.hit = true;
                    
                    var exp = new objExp(10);
                    exp.x = hitpoint.x();
                    exp.y = hitpoint.y();
                    exp.z = hitpoint.z();
                    scene.addChild(exp);
                    
                    //chengine.pushForward(this, body, 20);
                    chengine.sound.play(SOUND_HIT);
                    
                    var lifeComp = chengine.component.get(owner, chengine.component.life);
                    if (lifeComp)
                    {
                        lifeComp.damage(1);
                    }
                    
                    this.length = distanceToPoint(this, {x: hitpoint.x(), y: hitpoint.y(), z: hitpoint.z()});
                }
            }
            else
            {
                this.length = this.scanLength;
            }
            
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
var objHomingShot = Class.create(PhySphere, 
{
	initialize: function (target) 
    {
        PhySphere.call(this, 2, 0);
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

        this.targetGraphic = new objTarget(30, target);
        
        var scene = enchant.Core.instance.GL.currentScene3D;
        //scene.addChild(this.targetGraphic);
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
            var rot = getRot(chengine.rotationTowards(this, this.target, true));
            this.rotationSet(new enchant.gl.Quat(1, 0, 0, degToRad(180)))
            this.rotationApply(new enchant.gl.Quat(1, 0, 0, degToRad(rot.x)));
            this.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(-rot.y)));
            this.rotationApply(new enchant.gl.Quat(0, 0, 1, degToRad(rot.z)));
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
    
		this.forward(this.speed);
        this.glow.forward(this.speed);
        
        this.timer -= 1;
        
        if (this.timer <= 0)
        {
            scene.removeChild(this.glow);
            scene.removeChild(this);
        }
        

        var hitInfo = scene.world.contactTest(this.rigid);
        var hitObj = hitInfo.hitObject;
        if (hitObj)
        {
            if (hitObj instanceof objTestBall || hitObj instanceof PhyBox || 
            (hitObj instanceof Sprite3D && 
            !(hitObj instanceof objCharacter) && !(hitObj instanceof objShot)))
            {                                
                var exp = new objExp(20);
                exp.x = this.x;
                exp.y = this.y;
                exp.z = this.z;
                scene.addChild(exp);
                scene.removeChild(this.glow);
                scene.removeChild(this);
                
                chengine.sound.play(SOUND_CHARGELASEREXPLODE);
                
                var lifeComp = chengine.component.get(hitObj, chengine.component.life);
                if (lifeComp)
                {
                    lifeComp.damage(10);
                }
            }
        }
        
        /*var rx = this.rotation[8] * 10;
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
        Ammo.destroy(rayCallback); */
	}
});

/**
 A basic missile
 */
var objMissile = Class.create(PhyCylinder, 
{
	initialize: function (target) 
    {
        PhyCylinder.call(this, 3, 5, 0);
        mat4.rotateX(this.matrix, degToRad(90));
        this.mesh.setBaseColor('rgba(100, 100, 100, 1.0)');
        this.speed = 10;
        this.timer = 999999;
        this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
        this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.shininess = 0;

        this.target = target;
        
        this.rigid.rigidBody.getCollisionShape().setMargin(2);
	},
	
    onenterframe: function ()
    {
        if (this.target)
        {
            this.speed = 5;
            var rot = getRot(chengine.rotationTowards(this, this.target, true));
            this.rotationSet(new enchant.gl.Quat(1, 0, 0, degToRad(180)))
            this.rotationApply(new enchant.gl.Quat(1, 0, 0, degToRad(rot.x)));
            this.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(-rot.y)));
            this.rotationApply(new enchant.gl.Quat(0, 0, 1, degToRad(rot.z)));
        }
        
		this.forward(this.speed);
        
        this.timer -= 1;
        
        if (this.timer <= 0)
        {
            scene.removeChild(this);
        }
        
        var hitInfo = scene.world.contactTest(this.rigid);
        var hitObj = hitInfo.hitObject;
        if (hitObj)
        {
            if (hitObj instanceof objTestBall || hitObj instanceof PhyBox)
            {                                
                var exp = new objExp(10);
                exp.x = this.x;
                exp.y = this.y;
                exp.z = this.z;
                scene.addChild(exp);
                scene.removeChild(this);
                
                chengine.sound.play(SOUND_HIT);
                
                var lifeComp = chengine.component.get(hitObj, chengine.component.life);
                if (lifeComp)
                {
                    lifeComp.damage(1);
                }
            }
        }
	}
});

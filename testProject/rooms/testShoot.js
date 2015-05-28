var testShoot = Class.create(objRoom, 
{
    initialize: function (parentScene)
    {
        objRoom.call(this, parentScene);
        this.name = "testShoot";
    }, 
    
    prepare: function ()
    {
        objRoom.prototype.prepare.call(this);
        
        var that = this;
        
        this.scene.getCamera().altitude(50);
        
        // Make a pad
        this.pad = new APad();
        this.pad.x = 20;
        this.pad.y = 220;
        
        this.createSkybox(TEXTURE_SKYDOME);
        this.scene.setFogDistance(200.0, 5000.0);

        this.chen = new objCharacter(MODEL_CHEN);
        chengine.attach(this.chen, this.scene.getCamera());
        this.chen.forward(-120);
        this.chen.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(180)));
        this.chen.model.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(180)));
        this.chen.addToScene(this.scene);

        chengine.component.add(this.chen, new chengine.component.controlBehindMovable(0.5, game.input, this.pad));
        this.chen.model.pushAnimation(game.assets[MOTION_PATH]);
        
        // Needs to be on top of everything to get touches
        this.scene.scene2D.addChild(this.pad);
    },
    
    enterframe: function (e) 
    {
        var that = this;
        objRoom.prototype.enterframe.call(this);
        
        chengine.debugCamera(this.scene, this.scene.getCamera());
        
        var cam = this.scene.getCamera();
        var camFront = 
        {
            x: cam._centerX,
            y: cam._centerY - 10,
            z: cam._centerZ + 200
        }

        this.chen.model.rotation = 
            chengine.rotationTowards(this.chen.model, camFront, true);
        
        if (chengine.input.keyPressed('i'))
        {   
            chengine.transitionRoom(testRoom2, chengine.TRANSITION_TYPE.CROSSFADE);
        }
        
        if (chengine.input.keyPressed('y'))
        {
            if (this.scene.getCamera().target == this.chen.model)
            {
                this.scene.getCamera().setFree();
            }
            else
            {
                this.scene.getCamera().setChase(this.chen.model, -100, 50, 
                                                {x: 0, y: 20, z: 0}, {x: 0, y: 30, z: 0});
            }
        }
        
        if (chengine.input.keyPressed('f'))
        {
            if (this.scene.getFog() == 0.0)
            {
                this.scene.setFog(1.0);
            }
            else
            {
                this.scene.setFog(0.0);
            }
        }
        
        if (chengine.input.keyPressed('g'))
        {
            var bullet = new objShot();
            bullet.x = this.chen.x;
            bullet.y = this.chen.y;
            bullet.z = this.chen.z;
            bullet.rotation = chengine.copyRotation(this.chen.model.rotation, true);
            bullet.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(180)));
            bullet.forward(-30);
            that.scene.addChild(bullet);        
        }
    }    
});
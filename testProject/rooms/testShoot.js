var testShoot = Class.create(objRoom, 
{
    initialize: function (parentScene)
    {
        objRoom.call(this, parentScene);
        this.name = "testShoot";
        this.railMovementSpeed = 2;
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
        
        this.createSkybox(TEXTURE_SKYDOME, 1500);
        this.scene.setFog(1.0);
        this.scene.setFogColor(0.1, 0.3, 0.5, 1.0);
        this.scene.setFogDistance(1200.0, 1550.0);
        
        // Make CHEN! HONK HONK
        this.chen = new objCharacter(MODEL_CHEN);
        chengine.attach(this.chen, this.scene.getCamera());
        this.chen.forward(-120);
        this.chen.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(180)));
        this.chen.model.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(180)));
        this.chen.addToScene(this.scene);

        chengine.component.add(this.chen, new chengine.component.controlBehindMovable(0.5, game.input, this.pad, {upIsForward: false}));
        this.chen.model.pushAnimation(game.assets[MOTION_PATH]);
        
        // Make some crosshairs
        this.target = new Plane(10);
        this.target.mesh.texture = new Texture(game.assets[TEX_CROSSHAIRS]);
        chengine.unsetLighting(this.target.mesh);
        this.scene.addChild(this.target);
        
        // Get some scrolling ground going
        var floor = new objScrollingFloor();
        floor.z = this.chen.z - 1000;
        this.scene.addChild(floor);        
        
        var floor2 = new objScrollingFloor();
        floor2.z = this.chen.z - 3000;
        this.scene.addChild(floor2);
        
        // Needs to be on top of everything to get touches
        this.scene.scene2D.addChild(this.pad);
        
        var shootOpts = 
        {
            inputKey: 'g',
            bullet: objShot,
            scene: this.scene,
            cooldown: 5,
            forwardOffset: -30,
            bulletSpeed: 50
        }
        chengine.component.add(this.chen, new chengine.component.shoot(shootOpts));
    },
    
    enterframe: function (e) 
    {
        var that = this;
        objRoom.prototype.enterframe.call(this);
        
        chengine.debugCamera(this.scene, this.scene.getCamera());
        
        var cam = this.scene.getCamera();
        var camFront = 
        {
            x: cam._x,
            y: cam._y - 10,
            z: cam._z + 500
        }

        chengine.attach(this.target, this.chen.model, {z:-200});
        this.target.rotation = chengine.rotationTowards(this.target, this.chen.model);
        
        //this.chen.model.rotation = 
            //chengine.rotationTowards(this.chen.model, camFront, true);

        this.chen.forward(this.railMovementSpeed);
        this.scene.getCamera().forward(this.railMovementSpeed);

        if (this.step % 100 == 0)
        {
            var newBox = new objTestEnemy();
            newBox.x = this.chen.x + Math.floor(Math.random() * 400) - 200;
            newBox.y = this.chen.y + Math.floor(Math.random() * 400) - 200;
            newBox.z = this.chen.z - 1500;
            scene.addChild(newBox);
        }
        
        if (this.step % 1000 == 0)
        {
            var floor = new objScrollingFloor();
            floor.z = this.chen.z - 1000;
            this.scene.addChild(floor);        
            
            var floor2 = new objScrollingFloor();
            floor2.z = this.chen.z - 3000;
            this.scene.addChild(floor2);
        }
        
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
    }    
});
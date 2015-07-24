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
        chengine.input.enableGamepads();
        
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
        this.chen.forward(-100);
        this.chen.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(180)));
        this.chen.model.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(180)));
        this.chen.addToScene(this.scene);

        chengine.component.add(this.chen, new chengine.component.controlBehindMovable(0.4, game.input, this.pad, {upIsForward: false}));
        this.chen.model.pushAnimation(game.assets[MOTION_PATH]);
        
        // Get some scrolling ground going
        var floor = new objScrollingFloor();
        floor.z = this.chen.z - 1000;
        this.scene.addChild(floor);        
        
        var floor2 = new objScrollingFloor();
        floor2.z = this.chen.z - 3000;
        this.scene.addChild(floor2);
        
        // Needs to be on top of everything to get touches
        this.scene.scene2D.addChild(this.pad);
        
        this.button = new Button("", "light");
        this.button.width = 50;
        this.button.height = 50;
        this.button.moveTo(560, 260);
        this.button.opacity = 0.6;
        scene.scene2D.addChild(this.button);
        
        var that = this;
        var shootOpts = 
        {
            inputKey: 'g',
            inputButton: that.button, 
            bullet: objShot,
            scene: that.scene,
            cooldown: 5,
            forwardOffset: -30,
            bulletSpeed: 50,
            sound: SOUND_LASER
        }
        chengine.component.add(this.chen, new chengine.component.shoot(shootOpts));
        //this.scene.getCamera().rotateYaw(degToRad(10));
        this.scene.getCamera().forward(500);
        this.scene.getCamera().sidestep(100);
        this.scene.getCamera().altitude(100);

        this.scene.getCamera().setFixed(this.chen.model, {x: 0, y: 20, z: 0});
        
        chengine.sound.loop(MUSIC_CORNERIA);
        
        // Make some crosshairs
        this.target = new Plane(10);
        this.target.mesh.texture = new Texture(game.assets[TEX_CROSSHAIRS2]);
        this.target.mesh.setBaseColor('rgba(255, 255, 255, 0.3)');
        chengine.unsetLighting(this.target.mesh);
        this.scene.addChild(this.target);
        
        this.targetFar = new Plane(10);
        this.targetFar.mesh.texture = new Texture(game.assets[TEX_CROSSHAIRS2]);
        this.targetFar.mesh.setBaseColor('rgba(255, 255, 255, 0.3)');
        chengine.unsetLighting(this.targetFar.mesh);
        this.scene.addChild(this.targetFar);
    },
    
    enterframe: function (e) 
    {  
        var that = this;
        objRoom.prototype.enterframe.call(this);
        chengine.debugCamera(this.scene, this.scene.getCamera());

        chengine.attach(this.target, this.chen.model, {y: -10, z: -200});
        this.target.rotation = chengine.rotationTowards(this.target, this.chen.model);        
        
        chengine.attach(this.targetFar, this.chen.model, {y: -10, z: -500});
        this.targetFar.rotation = chengine.rotationTowards(this.targetFar, this.chen.model);

        this.chen.forward(this.railMovementSpeed);

        if (this.step % 100 == 0)
        {
            var newBox = new objTestEnemy();
            newBox.x = this.chen.x + Math.floor(Math.random() * 200) - 100;
            newBox.y = this.chen.y + Math.floor(Math.random() * 200) - 100;
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
        
        if (this.step == 200)
        {
            this.scene.getCamera().x += 200;
            this.scene.getCamera().z -= 400;
            this.scene.getCamera().y -= 150;
        }
        else if (this.step == 500)
        {
            this.scene.getCamera().setInView(this.chen.model, {x: 0, y: 10, z: 0}, {x: 0, y: 0, z: 0});
        }
        else if (this.step > 600)
        {
            this.scene.getCamera().setFree();
            
            // Fake "elastic" character tracking
            var camX = this.scene.getCamera().x;
            var camY = this.scene.getCamera().y;
            var camZ = this.scene.getCamera().z;
            var camCenterX = this.scene.getCamera()._centerX;
            var camCenterY = this.scene.getCamera()._centerY;
            var camCenterZ = this.scene.getCamera()._centerZ;
            
            this.scene.getCamera().x += chengine.smoothValue(camX, this.chen.x, 60);
            this.scene.getCamera().y += chengine.smoothValue(camY, this.chen.y, 50);
            this.scene.getCamera().z += chengine.smoothValue(camZ, this.chen.z, 50);
            this.scene.getCamera()._centerX += chengine.smoothValue(camCenterX, this.chen.x, 60);
            this.scene.getCamera()._centerY += chengine.smoothValue(camCenterY, this.chen.y, 50);
            this.scene.getCamera()._centerZ += chengine.smoothValue(camCenterZ, this.chen.z, 50);

            this.scene.getCamera().x += chengine.smoothValue(camX, 0, 80);
            this.scene.getCamera().y += chengine.smoothValue(camY, 50, 50);
            this.scene.getCamera()._centerX += chengine.smoothValue(camCenterX, 0, 80);
            this.scene.getCamera()._centerY += chengine.smoothValue(camCenterY, 50, 50);
            
            
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
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
        
        var floor3 = new objScrollingFloor();
        floor3.z = this.chen.z + 1000;
        this.scene.addChild(floor3);
        
        // Needs to be on top of everything to get touches
        this.scene.scene2D.addChild(this.pad);
        
        this.button = new Button("", "light");
        this.button.width = 50;
        this.button.height = 50;
        this.button.moveTo(560, 260);
        this.button.opacity = 0.6;
        scene.scene2D.addChild(this.button);
        
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

        var chargeOpts = 
        {
            inputKey: 'g',
            inputButton: that.button, 
            bullet: objHomingShot,
            scene: that.scene,
            cooldown: 5,
            forwardOffset: -30,
            bulletSpeed: 10,
            offset: {x: 0, y: -10, z: 0},
            sound: SOUND_CHARGELASER
        }
        
        var chargeComp = new chengine.component.charge(chargeOpts);
        chargeComp.onCharged = function ()
        {
            that.targetFar.mesh.texture = new Texture(game.assets[TEX_CROSSHAIRS2RED]);
            chengine.unsetLighting(that.targetFar.mesh);
            that.targetFar.scale(2.0, 2.0, 2.0);
        };
        
        chargeComp.onChargeLoss = function ()
        {
            that.targetFar.mesh.texture = new Texture(game.assets[TEX_CROSSHAIRS2]);
            chengine.unsetLighting(that.targetFar.mesh);
            that.targetFar.scale(0.5, 0.5, 0.5);
        };
        
        chengine.component.add(this.chen, chargeComp);
        
        var cam = this.scene.getCamera();
        var chen = this.chen.model;
        this.timeline.cue
        ({
            200: function () 
            {
                cam.x += 200;
                cam.z -= 400;
                cam.y -= 100;
            },
            500: function () 
            {
                cam.setChase(chen, 100, 50, {x: 0, y: 10, z: 0}, {x: 0, y: 0, z: 100});
            },
            600: function ()
            {
                cam.setInView(chen);
            }
        });
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
            
            var testObj = game.assets[MODEL_TEST].colladaClone();
            testObj.scale(0.25, 0.25, 0.25);
            testObj.updateRigid(0, 0.25, testObj.getVertices());
            
            var newLife = new chengine.component.life(20);
            newLife.ondeath = function ()
            {
                var bigExp = new objBigExp(this, null);
                bigExp.x = this.x;
                bigExp.y = this.y;
                bigExp.z = this.z;
                scene.addChild(bigExp);
            };
            newLife.ondeath = newLife.ondeath.bind(testObj);
            chengine.component.add(testObj, newLife);   
            
            testObj.rotatePitch(degToRad(270));
            testObj.x -= 50 + rand(0, 300);
            testObj.z = this.chen.z - 2000;
            this.scene.addChild(testObj);
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
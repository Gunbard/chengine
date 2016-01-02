var testShoot = Class.create(objRoom, 
{
    initialize: function (parentScene)
    {
        objRoom.call(this, parentScene);
        this.name = "testShoot";
        this.railMovementSpeed = 2;
        this.moveBackCam = false;
    }, 
    
    prepare: function ()
    {
        objRoom.prototype.prepare.call(this);
        chengine.input.enableGamepads();
        
        var that = this;
        this.scrolling = true;
        this.scene.getCamera().altitude(50);
        
        // Fade from black
        var fadeOut = 
        new objFade(chengine.TRANSITION_TYPE.FADE_OUT, chengine.TRANSITION_SPEED.FAST, '#000000', function ()
        {
            scene.scene2D.removeChild(this);
        });
        
        this.scene.scene2D.addChild(fadeOut);
        
        // Make a pad
        this.pad = new APad();
        this.pad.x = viewportX(5);
        this.pad.y = viewportY(60);
        
        this.createSkybox(TEXTURE_SKYDOME, 1500);
        this.scene.setFog(1.0);
        this.scene.setFogColor(0.1, 0.3, 0.5, 1.0);
        this.scene.setFogDistance(1200.0, 1550.0);
        
        var floor = game.assets[WORLD_GROUND3].colladaClone(true);
        floor.updateRigid(0, 1, floor.getVertices());
        floor.y += 30;
        scene.addChild(floor);
        
        var floor2 = game.assets[WORLD_GROUND3].colladaClone(true);
        floor2.updateRigid(0, 1, floor2.getVertices());
        floor2.z -= 2000;
        floor2.y += 30;
        scene.addChild(floor2);        
        
        var floor3 = game.assets[WORLD_GROUND3].colladaClone(true);
        floor3.updateRigid(0, 1, floor3.getVertices());
        floor3.z -= 4000;
        floor3.y += 30;
        scene.addChild(floor3);
        
        // Make CHEN! HONK HONK
        this.chen = new objCharacter(MODEL_CHEN);
        chengine.attach(this.chen, this.scene.getCamera());
        this.chen.forward(-100);
        this.chen.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(180)));
        this.chen.model.rotationApply(new enchant.gl.Quat(0, 1, 0, degToRad(180)));
        this.chen.addToScene(this.scene);

        chengine.component.add(this.chen, new chengine.component.controlBehindMovable(0.5, game.input, this.pad, {upIsForward: false}));
        this.chen.model.pushAnimation(game.assets[MOTION_PATH]);
        
        // Needs to be on top of everything to get touches
        this.scene.scene2D.addChild(this.pad);
        
        this.button = new Button("", "light");
        this.button.width = GAME_WIDTH / 2;
        this.button.height = GAME_HEIGHT;
        this.button.moveTo(viewportX(50), viewportY(0));
        this.button.opacity = 0;
        scene.scene2D.addChild(this.button);
        
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
            forwardOffset: -50,
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
        
        var fireMissiles = function ()
        {
            for (var i = 0; i < 3; i++) 
            {
                var direction = i * 20;
                var missile = new objMissile(that.chen);
                chengine.attach(missile, that.yukkuri);
                missile.rotatePitch(degToRad(90));
                missile.rotateYaw(degToRad(90 + direction));
                that.scene.addChild(missile);
            }
            
            for (var i = 0; i < 3; i++) 
            {
                var direction = i * 20;
                var missile = new objMissile(that.chen);
                chengine.attach(missile, that.yukkuri);
                missile.rotatePitch(degToRad(90));
                missile.rotateYaw(degToRad(-90 - direction));
                that.scene.addChild(missile);
            }
        }    
        
        var cam = this.scene.getCamera();
        var chen = this.chen.model;
        
        // Victory timeline
        var victoryTimeline = new objTimeline();
        victoryTimeline.addTimedEvent(400, function () 
        {
            chengine.sound.stop(MUSIC_CORNERIA);
            that.scene.removeChild(that.target);
            that.scene.removeChild(that.targetFar);
            that.scene.scene2D.removeChild(that.camShaker);
            chen.clearAnimation();
            cam.z -= 500;
            cam.setChase(chen, 30, 50, {x: 0, y: 5, z: 0}, {x: 0, y: 20, z: -30});
            chen.pushAnimation(game.assets[MOTION_TEST]);
        });

        victoryTimeline.addTimedEvent(450, function () 
        {                
            var windowTest = new objWindow({text: 'Yay for Chen!<br>Will add score results here.'});
            that.scene.scene2D.addChild(windowTest);
        });
        
        victoryTimeline.addTimedEvent(850, function () 
        {                
            cam.setChase(chen, 30, 50, {x: 0, y: 5, z: 0}, {x: 40, y: 10, z: -30});
        });
        
        victoryTimeline.addTimedEvent(1450, function () 
        {                
            cam.setChase(chen, 10, 50, {x: 0, y: 5, z: 0}, {x: 0, y: 10, z: -10});
        });
        
        victoryTimeline.addTimedEvent(1850, function () 
        {                
            cam.setChase(chen, 10, 50, {x: 0, y: 5, z: 0}, {x: -30, y: 20, z: -10});
        });

        victoryTimeline.addTimedEvent(2200, function () 
        {                
            victoryTimeline.setFrame(500);
        });
        
        this.mainTimeline.addTimedEvent(100, function ()
        {
            var windowTest = new objWindow({text: 'Ran<br>"You can do it, Chen!"', image: SPRITE_RAN});
            that.scene.scene2D.addChild(windowTest);
        });
        
        this.mainTimeline.addTimedEvent(200, function () 
        {
            cam.x += 200;
            cam.z -= 400;
            cam.y -= 100;
        });
        
        this.mainTimeline.addTimedEvent(500, function () 
        {
            var windowTest = new objWindow({text: 'Ran<br>"Go, Chen, go!!"', image: SPRITE_RAN});
            that.scene.scene2D.addChild(windowTest);
            
            cam.setChase(chen, 100, 50, {x: 0, y: 10, z: 0}, {x: 0, y: 0, z: 100});
        });
        
        this.mainTimeline.addTimedEvent(600, function ()
        {
            cam.setInView(chen);
        });
        
        this.mainTimeline.addTimedEvent(700, function ()
        {
            that.yukkuri = new objCharacter(MODEL_YUKKURI, 100, 30);
            
            that.yukkuri.yukkuri = true;
            that.yukkuri.modelOffset = {x: 0, y: 60, z: 0};
            that.yukkuri.y += 60;
            that.yukkuri.z = that.chen.z - 2000;
            that.yukkuri.addToScene(that.scene);
            
            that.camShaker = new objCameraShaker();
            
            var hitEvent = function ()
            {
                var lifeComp = chengine.component.get(that.yukkuri, chengine.component.life);
                if (lifeComp)
                {
                    lifeComp.damage(1);
                }
            };
            
            var weakpoint = new objWeakPoint(20, that.yukkuri.model, {x: -45, y: -100, z: -80});
            weakpoint.onHit = hitEvent;
            that.scene.addChild(weakpoint);
            
            var weakpoint2 = new objWeakPoint(20, that.yukkuri.model, {x: 45, y: -100, z: -80});
            weakpoint2.onHit = hitEvent;
            that.scene.addChild(weakpoint2);
            
            var newLife = new chengine.component.life(10);
            newLife.ondeath = function ()
            {
                var other = this;
                var exp = new objBigExp(this, function () 
                {
                    other.removeFromScene(that.scene);
                });
                
                that.moveBackCam = false;
                that.scene.removeChild(weakpoint);
                that.scene.removeChild(weakpoint2);
                that.scene.addChild(exp);
                that.mainTimeline.destroy();
                that.addTimeline(victoryTimeline);
                that.healthBar.removeFromScene();
                that.scene.scene2D.addChild(that.camShaker);
            };
            newLife.ondeath = newLife.ondeath.bind(that.yukkuri);
            chengine.component.add(that.yukkuri, newLife);
            
            // Make a health bar
            var lifeComp = chengine.component.get(that.yukkuri, chengine.component.life);
            that.healthBar = new objHealthBar({lifeComponent: lifeComp, orientation: 'v'});
            that.healthBar.moveTo(20, 48);
            that.healthBar.addToScene(that.scene.scene2D);
        });
        
        this.mainTimeline.addTimedEvent(800, function ()
        {
            var windowTest = new objWindow({text: 'Ran<br>"Watch out! There\'s a huge stupid thing approaching fast!"', image: SPRITE_RAN});
            that.scene.scene2D.addChild(windowTest);
            
            return;
            var testObj = game.assets[MODEL_TEST].colladaClone();
            var objScale = 0.5;
            testObj.scale(objScale, objScale, objScale);
            testObj.updateRigid(0, objScale, testObj.getVertices());
            
            var newLife = new chengine.component.life(20);
            newLife.ondeath = function ()
            {
                var bigExp = new objBigExp(that, null);
                bigExp.x = that.x;
                bigExp.y = that.y;
                bigExp.z = that.z;
                scene.addChild(bigExp);
            };
            newLife.ondeath = newLife.ondeath.bind(testObj);
            chengine.component.add(testObj, newLife);   
            
            testObj.rotatePitch(degToRad(270));
            testObj.z = that.chen.z - 1000;
            that.scene.addChild(testObj);
        });
        
        this.mainTimeline.addTimedEvent(1000, function ()
        {
            cam.offset = {x: 0, y: 0, z: -100};
            that.scrolling = false;
            that.yukkuri.moveBy({x: 10, y: 10, z: 400}, 60);
        });
        
        this.mainTimeline.addTimedEvent(1200, function ()
        {
            that.yukkuri.moveBy({x: 50, y: 10, z: 400}, 60);
        });
        
        this.mainTimeline.addTimedEvent(1300, function ()
        {
            var beam = new objBeam(that.scene);
            chengine.attach(beam, that.yukkuri);
            beam.sidestep(-50);
            beam.altitude(50);
            beam.rotation = chengine.rotationTowards(beam, that.chen.model);
            beam.rotateYaw(degToRad(180));
            that.scene.addChild(beam);
            
            var beam2 = new objBeam(that.scene);
            chengine.attach(beam2, that.yukkuri);
            beam2.sidestep(50);
            beam2.altitude(50);
            beam2.rotation = chengine.rotationTowards(beam2, that.chen.model);
            beam2.rotateYaw(degToRad(180));
            that.scene.addChild(beam2);
            
            chengine.sound.play(SOUND_BEAM);
        });
        
        this.mainTimeline.addTimedEvent(1380, function ()
        {
            var beam = new objBeam(that.scene);
            chengine.attach(beam, that.yukkuri);
            beam.sidestep(-50);
            beam.altitude(50);
            beam.rotation = chengine.rotationTowards(beam, that.chen.model);
            beam.rotateYaw(degToRad(180));
            that.scene.addChild(beam);
            
            var beam2 = new objBeam(that.scene);
            chengine.attach(beam2, that.yukkuri);
            beam2.sidestep(50);
            beam2.altitude(50);
            beam2.rotation = chengine.rotationTowards(beam2, that.chen.model);
            beam2.rotateYaw(degToRad(180));
            that.scene.addChild(beam2);
            
            chengine.sound.play(SOUND_BEAM);
        });
        
        this.mainTimeline.addTimedEvent(1400, function ()
        {
            that.moveBackCam = true;
            that.yukkuri.moveBy({x: -100, y: 10, z: 400}, 60);
        });
        
        this.mainTimeline.addTimedEvent(1500, function ()
        {                
            fireMissiles();
        });
        
        this.mainTimeline.addTimedEvent(1600, function ()
        {
            that.yukkuri.moveBy({x: 200, y: 0, z: 0}, 60);
        });
        
        this.mainTimeline.addTimedEvent(1700, function ()
        {
            fireMissiles();
        });
        
        this.mainTimeline.addTimedEvent(1900, function ()
        {
            that.moveBackCam = false;
            that.mainTimeline.setFrame(1601);
        });

        
        
        this.scene.play();
    },
    
    enterframe: function (e) 
    {  
        var that = this;
        objRoom.prototype.enterframe.call(this);
        chengine.debugCamera(this.scene, this.scene.getCamera());

        if (this.moveBackCam)
        {
            this.scene.getCamera().forward(-1);
        }
        
        chengine.attach(this.target, this.chen.model, {y: -10, z: -200});
        this.target.rotation = chengine.rotationTowards(this.target, this.chen.model);        
        
        chengine.attach(this.targetFar, this.chen.model, {y: -10, z: -600});
        this.targetFar.rotation = chengine.rotationTowards(this.targetFar, this.chen.model);
        
        if (this.scrolling)
        {
            this.chen.forward(this.railMovementSpeed);
        }
        
        if (this.yukkuri)
        {
            this.yukkuri.model.rotation = chengine.rotationTowards(this.yukkuri, this.chen);
            this.yukkuri.model.rotateYaw(degToRad(180));
        }
        
        /*if (this.step % 100 == 0 && this.scrolling)
        {
            var newBox = new objTestEnemy();
            newBox.x = this.chen.x + Math.floor(Math.random() * 200) - 100;
            newBox.y = this.chen.y + Math.floor(Math.random() * 200) - 100;
            newBox.z = this.chen.z - 1500;
            scene.addChild(newBox);
        }*/
        
        if (this.step % 1000 == 0 && this.scrolling)
        {
            /**var floor = new objScrollingFloor();
            floor.z = this.chen.z - 2000;
            this.scene.addChild(floor);        
            
            var floor2 = new objScrollingFloor();
            floor2.z = this.chen.z - 4000;
            this.scene.addChild(floor2);*/
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
        
        if (chengine.input.keyPressed('h')) 
        {
            var beam = new objBeam(this.scene);
            chengine.attach(beam, this.chen);
            chengine.matchRotation(beam, this.chen.model.rotation);
            beam.forward(20);
            this.scene.addChild(beam);
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
        
        if (chengine.input.keyPressed('b'))
        {
            var missile = new objMissile(this.chen);
            chengine.attach(missile, this.yukkuri);
            this.scene.addChild(missile);
        }
    }    
});
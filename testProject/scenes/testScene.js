var testRoom = Class.create(objRoom,
{
    initialize: function (parentScene)
    {
        objRoom.call(this, parentScene);
        this.name = "testScene";
    },
    
    prepare: function ()
    {
        var that = this;
        
        objRoom.prototype.prepare.call(this);
        //chengine.input.enableGamepads();
     
        // Enable alpha blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        // Bind keys
        chengine.input.setKeybindings();
        
        // Make a pad
        pad = new APad();
        pad.x = 20;
        pad.y = 220;
        
        scene.backgroundColor = '#FFFFFF';    
        scene.setFog(1.0);
        
        // Create the main camera
        //camera = this.getCamera();
        camera.x = 80;
        camera.z = 80;
        
        // Add gravity
        var gravVector = new Ammo.btVector3(0, -980, 0);
        this.scene.world._dynamicsWorld.setGravity(gravVector);
        Ammo.destroy(gravVector);
        
        // Add a light
        var light = new DirectionalLight();
        light.color = [1.0, 1.0, 1.0];
        light.directionX = 1;
        light.directionY = 1;
        light.directionZ = -1;
        this.scene.setDirectionalLight(light);
        
        var ball = new objTestBall(5);
        ball.z = 70;
        ball.y = 30;
        
        var skybox = new Sphere(2000);
        skybox.mesh.reverse();
        skybox.mesh.texture = new Texture(game.assets[TEXTURE_SKYDOME]);
        skybox.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
        skybox.mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
        skybox.mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
        skybox.mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
        skybox.mesh.texture.shininess = 0;
        skybox.rotatePitch(degToRad(180));
                    
        var floor = new PhyBox(400, 1, 400, 0);
        floor.mesh.setBaseColor('rgba(255, 255, 255, 1.0');
        floor.mesh.texture = new Texture(game.assets['images/tex.jpg']);
        floor.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
        floor.mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
        floor.mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
        floor.mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
        floor.mesh.texture.shininess = 0;
             
        mikuPhy = new objCharacter(game.assets[MODEL_PATH]);
        reiPhy = new objCharacter(game.assets[MODEL_REI_PATH]);
        reiPhy.hold(true);
        
        //mikuPhy.rigid.rigidBody.getCollisionShape().setMargin(32);
        mikuPhy.y = 100;
        mikuPhy.z = 200;
        reiPhy.y = 100;
        reiPhy.z = -100;
        
        //chengine.component.add(mikuPhy, new chengine.component.controlWalk(mikuPhy, 1));
        chengine.component.add(mikuPhy, new chengine.component.controlCameraMovable(1, game.input));
        
        var jumpComponent = new chengine.component.jumpable();
        jumpComponent.onJump = function ()
        {
            this.obj.model.animationSpeed = 1;
            this.obj.model.loop = false;
            this.obj.model.clearAnimation();
            this.obj.model.startAnimating(0, game.assets[MOTION_JUMP_PATH]);
        };    
        
        jumpComponent.onLand = function ()
        {
            this.obj.model.animationSpeed = 1;
            this.obj.model.stopAnimating(0);
            this.obj.model.startAnimating(0, game.assets[MOTION_PATH]);
            //alert('land');
        };
        
        chengine.component.add(mikuPhy, jumpComponent);
        
        mikuPhy.model.animationSpeed = 1;
        mikuPhy.model.pushAnimation(game.assets[MOTION_PATH]);
        
        reiPhy.model.animationSpeed = 1;
        //reiPhy.model.pushAnimation(game.assets[MOTION_TEST]);
        
        //thing = game.assets[TEST_AREA].clone();
        thing = floor;
        console.log(thing);
        alert('READY');
        //thing.updateRigid(0, thing.getVertices());
        
        this.target = new Plane(10);
        this.target.mesh.texture = new Texture(game.assets['images/crosshairs.png']);
        chengine.unsetLighting(this.target.mesh);
        
        this.target2 = new Plane(10);
        this.target2.mesh.texture = new Texture(game.assets['images/crosshairs.png']);
        chengine.unsetLighting(this.target2.mesh);
        
        this.targetPost = new Cylinder(1, 100);
        this.targetPost.mesh.setBaseColor('rgba(0, 255, 0, 0.2)');
        chengine.unsetLighting(this.targetPost.mesh);
        
        this.scene.addChild(skybox);
        this.scene.addChild(thing);
        //this.scene.addChild(floor);
        this.scene.addChild(ball);
        //this.scene.addChild(colladatest);
        
        mikuPhy.addToScene(this.scene);
        //reiPhy.addToScene(this.scene);
        
        this.scene.addChild(this.target2);
        this.scene.addChild(this.target);
        this.scene.addChild(this.targetPost);
        
        var fade = new objFade(FADE_TYPES.FADE_OUT, null, null, function ()
        {
            that.scene.removeChild(this);
        });
        
        this.scene.scene2D.addChild(fade);
        
        var cross = new Sprite(256, 256);
        cross.image = game.assets['images/crosshairs.png'].clone();
        this.scene.scene2D.addChild(cross);
        
        var cockpit = new Sprite(640, 480);
        cockpit.image = game.assets['images/cockpit.png'].clone();
        cockpit.y -= 50;
        //game.rootScene.addChild(cockpit);
        
        var windowTest = new objWindow(100, 10, 320, 64, '???<br>What the crap is this?');
        this.scene.scene2D.addChild(windowTest);

        var line = new Sprite(GAME_WIDTH, GAME_HEIGHT);
        var lineSurface = new Surface(GAME_WIDTH, GAME_HEIGHT);
        line.image = lineSurface;     
        this.scene.scene2D.addChild(line);

        
        var oldX = 0;
        r = Math.PI / 2;
        this.scene.scene2D.addEventListener('touchstart', function (e) 
        {
            // Ignore touch if touching the virtual dpad
            //if (pad.isActive())
            if (pad.isTouched)
            {
                return;
            }
        
            //var snd = game.assets['sounds/tielaser.wav'].clone();
            //snd.play();
            
            //oldX = e.x;
            mouseOn = true;
            
            // var bullet = new objShot();
            // bullet.x = camera.x;
            // bullet.y = camera.y - 4;
            // bullet.z = camera.z;
            // bullet.rotation = chengine.rotationTowards(bullet, chengine.rayPick(e.x, e.y));
            // bullet.forward(-20);
            // bullet.sidestep(-4);
            // this.scene.addChild(bullet);

            // var bullet = new objShot();
            // bullet.x = camera.x;
            // bullet.y = camera.y - 4;
            // bullet.z = camera.z;
            // bullet.rotation = chengine.rotationTowards(bullet, chengine.rayPick(e.x, e.y));
            // bullet.forward(-20);
            // bullet.sidestep(4);
            // this.scene.addChild(bullet);
            
            // var crossfade = new objCrossfade(false, null, null, function ()
            // {
                // game.rootScene.removeChild(this);
            // });
            
            // game.rootScene.addChild(crossfade);
            
            
            var bullet = new objShot(this.scene);
            bullet.x = mikuPhy.x;
            bullet.y = mikuPhy.y + 8;
            bullet.z = mikuPhy.z;
            //var rot = chengine.rayPick(e.x, e.y);
            rot = that.target;
            bullet.rotation = chengine.rotationTowards(bullet, rot);
            bullet.forward(-30);
            bullet.sidestep(-2);
            that.scene.addChild(bullet);        
            
            var bullet = new objShot(this.scene);
            bullet.x = mikuPhy.x;
            bullet.y = mikuPhy.y + 8;
            bullet.z = mikuPhy.z;
            //var rot = chengine.rayPick(e.x, e.y);
            rot = that.target;
            bullet.rotation = chengine.rotationTowards(bullet, rot);
            bullet.forward(-30);
            bullet.sidestep(2);
            that.scene.addChild(bullet);
            
            // Testing line
            lineSurface.context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            lineSurface.context.beginPath();
            lineSurface.context.moveTo(GAME_WIDTH / 2, GAME_HEIGHT / 2);
            lineSurface.context.lineTo(e.x, e.y);
            lineSurface.context.stroke();
            
            var pick = chengine.rayPick(e.x, e.y);
            //alert('[' + pick.x + ', ' + pick.y + ', ' + pick.z + ']');
            
            var ray1 = new Ammo.btVector3(camera.x, camera.y, camera.z);
            var ray2 = new Ammo.btVector3(pick.x, pick.y, pick.z);
            
            var rayCallback = new Ammo.ClosestRayResultCallback(ray1, ray2);
            that.scene.world._dynamicsWorld.rayTest(ray1, ray2, rayCallback); 
            
            if (rayCallback.hasHit())
            {
                var collisionObj = rayCallback.get_m_collisionObject();
                var body = Ammo.btRigidBody.prototype.upcast(collisionObj);
                var colFlag = body.getCollisionFlags();
                
                //var owner = rigidBodyOwner(body);
                //alert(owner instanceof PhySphere);
                
                if (colFlag == 0)
                {
                    /*var powv = new Ammo.btVector3(10, 0, 0);
                    body.activate();
                    body.applyCentralImpulse(powv);
                    Ammo.destroy(powv);
                    */
                }
            }
            
            Ammo.destroy(ray1);
            Ammo.destroy(ray2);
            Ammo.destroy(rayCallback);
        });
        
        
        this.scene.scene2D.addEventListener('touchend', function (e) 
        {
            mouseOn = false;
            
            lineSurface.context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        });
        
        this.scene.scene2D.addEventListener('touchmove', function (e) 
        {
            /*r += (e.x - oldX) / 100;
            camera.x = Math.cos(r) * 80;
            camera.z = Math.sin(r) * 80;
            oldX = e.x;*/
            
            lineSurface.context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            lineSurface.context.beginPath();
            lineSurface.context.moveTo(GAME_WIDTH / 2, GAME_HEIGHT / 2);
            lineSurface.context.lineTo(e.x, e.y);
            lineSurface.context.stroke();
        });
        
        game._element.addEventListener('mousemove', function (e) 
        {        
            updateMouse(e);
            
            cross.x = mouseX - 128;
            cross.y = mouseY - 128;
        });
        
        //game.rootScene.addChild(pad);    
        
        /*var button = new Button("PHYS", "light");
        button.moveTo(540, 10);
        button.opacity = 0.6;
        button.ontouchstart = function() 
        {
            if (this.isPlaying)
            {
                this.stop();
            }
            else
            {
                this.play();
            }
        };
        game.rootScene.addChild(button);
        
        var debugButton = new Button("DEBUG", "light");
        debugButton.moveTo(540, 60);
        debugButton.opacity = 0.6;
        debugButton.ontouchstart = function() 
        {
            if (chengine.debug.visible)
            {
                chengine.debug.remove();
            }
            else
            {
                chengine.debug.add();
            }
        };
        game.rootScene.addChild(debugButton);
        
        var postButton = new Button("POSTP", "light");
        postButton.moveTo(540, 110);
        postButton.opacity = 0.6;
        postButton.ontouchstart = function() 
        {
            if (this.postProcessingEnabled)
            {
                this.postProcessingEnabled = false;
            }
            else
            {
                this.postProcessingEnabled = true;
            }
        };
        game.rootScene.addChild(postButton);
        */
        //chengine.debug.add();
        
        //this.play();
    },
    
    enterframe: function (e) 
    {
        objRoom.prototype.enterframe.call(this);
        
        var that = this;
        
        this.target.rotation = chengine.rotationTowards(mikuPhy, chengine.rayPick(mouseX, mouseY));
        this.target2.rotation = chengine.rotationTowards(mikuPhy, chengine.rayPick(mouseX, mouseY));
        
        if (!this.target.pos)
        {
            this.target.pos = 200;
        }
        
        var camRot = this.target.rotation;
        var camRX = camRot[8] * this.target.pos;
        var camRY = camRot[9] * this.target.pos;
        var camRZ = camRot[10] * this.target.pos;
        this.target.x = camera.x - camRX;
        this.target.y = camera.y - camRY;
        this.target.z = camera.z - camRZ;
    
        var camRot2 = this.target2.rotation;
        var camRX = camRot2[8] * 1000;
        var camRY = camRot2[9] * 1000;
        var camRZ = camRot2[10] * 1000;
        this.target2.x = camera.x - camRX;
        this.target2.y = camera.y - camRY;
        this.target2.z = camera.z - camRZ;
    
        chengine.attach(this.targetPost, this.target);
    
        //skybox.rotateYaw(degToRad(0.00001));
        chengine.debugCamera(this.scene, this.scene.getCamera());
        //thing.rotatePitch(degToRad(1));
        //thing.rotateYaw(degToRad(1));
        
        //camera.setChase(mikuPhy.model, -100, 50, {x: 0, y: 20, z: 0}, {x: 0, y: 30, z: 0});
        //camera.y = 40;
        //camera.setFixed(null, {x: 0, y: 0, z: 0});
        
        var vec = this.scene.getCamera()._getForwardVec();
        this.scene.getCamera().setFixed({x:this.scene.getCamera().x + vec[0], y:this.scene.getCamera().y + vec[1], z:this.scene.getCamera().z + vec[2]}, null);
        
        
        //miku.x = mikuPhy.x;
        //miku.y = mikuPhy.y - 10;
        //miku.z = mikuPhy.z;
        
        if (game.input.o)
        {
            chengine.component.remove(mikuPhy, chengine.component.controlCameraMovable);
        }
                
        if (!mikuPhy.isJumping)
        {
            if (!game.input.up && !game.input.down && !game.input.left && !game.input.right && 
                !pad.isTouched && !chengine.input.gamepadIsUsed(0))
            {
                mikuPhy.model.stopAnimating(mikuPhy.model.currentFrame);
            }
            else
            {
                mikuPhy.model.startAnimating(mikuPhy.model.currentFrame, game.assets[MOTION_PATH])
            }
        }
        
        if (chengine.input.keyPressed('t'))
        {
            var nearestBall = chengine.nearestObject({x: mikuPhy.model.x, y: mikuPhy.model.y, z: mikuPhy.model.z}, objTestBall);
            
            var bullet = new objHomingShot(nearestBall);
            bullet.x = mikuPhy.model.x;
            bullet.y = mikuPhy.model.y + 15;
            bullet.z = mikuPhy.model.z;
           
            bullet.rotation = chengine.rotationTowards(bullet, chengine.rayPick(mouseX, mouseY));
            
            this.scene.addChild(bullet);
        }
        
        if (chengine.input.y)
        {
            mikuPhy.y += 10;
            
            var rigidBody = mikuPhy.rigid.rigidBody;
            if (!chengine.rigidIsAscending(rigidBody) && !chengine.rigidIsFalling(rigidBody))
            {
                chengine.pushUp(mikuPhy.rigid.rigidBody, 60);
            }
        }
        
        if (chengine.input.keyPressed('u'))
        {
            var ball = new objTestBall(5);
            chengine.attach(ball, this.target);
            this.scene.addChild(ball);
        }
        
        if (chengine.input.keyPressed('zero'))
        {
            if (chengine.debug.visible)
            {
                chengine.debug.remove(this.scene);
            }
            else
            {
                chengine.debug.add(this.scene);
            }
        }
        
        if (chengine.input.keyPressed('r'))
        {
            var rigid = mikuPhy.rigid.rigidBody;
            console.log(rigid.getLinearVelocity().y());
            //alert('asdf');
        }
        
        if (game.input.v)
        {
            this.target.pos -= 2;
        }
        
        if (game.input.b)
        {
            this.target.pos += 2;
        }
        
        if (chengine.input.keyPressed('i'))
        {   
            var fade = new objFade(FADE_TYPES.FADE_IN, null, null, function ()
            {
                chengine.changeRoom(that, testRoom2);
            });
            
            this.scene.scene2D.addChild(fade);
        }        
        
        if (chengine.input.keyPressed('o'))
        {   
            var fade = new objCrossfade(this.scene.scene2D, FADE_TYPES.FADE_OUT, null, null, null);
            this.scene.scene2D.insertBefore(fade, this.scene.scene2D.firstChild);
        }
        
    }
});
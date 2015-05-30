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

        // Add some obstacle test thing
        this.box = new PhyBox(10, 10, 10, 0);
        this.box.mesh.setBaseColor('rgba(255, 255, 255, 1.0');
        this.box.mesh.texture = new Texture(game.assets['images/tex.jpg']);
        this.box.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
        this.box.mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
        this.box.mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
        this.box.mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
        this.box.mesh.texture.shininess = 0;
        this.box.x = -50;
        this.box.y = 50;
        this.box.z = -500;
        chengine.component.add(this.box, new chengine.component.life(10));   
        this.scene.addChild(this.box);
        
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
        
        // Needs to be on top of everything to get touches
        this.scene.scene2D.addChild(this.pad);
        
        var shootOpts = 
        {
            inputKey: 'g',
            bullet: objShot,
            scene: this.scene,
            cooldown: 5,
            forwardOffset: -30
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
            z: cam._z + 400
        }
        
        this.box.rotationApply(new enchant.gl.Quat(0, 1, 1, degToRad(5)));
        this.box.rigid.rotationApply(new enchant.gl.Quat(0, 1, 1, degToRad(5)));

        chengine.attach(this.target, this.chen.model, {y: 10, z: -200});
        this.target.rotation = chengine.rotationTowards(this.target, this.chen.model);
        
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
    }    
});
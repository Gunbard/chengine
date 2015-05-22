var testRoom2 = Class.create(objRoom, 
{
    initialize: function (parentScene)
    {
        objRoom.call(this, parentScene);
        this.name = "testScene2";
        //alert("scene2 " + this.scene.childNodes.length);   
    }, 
    
    prepare: function ()
    {
        objRoom.prototype.prepare.call(this);
        
        var that = this;
        
        // Make a pad
        pad = new APad();
        pad.x = 20;
        pad.y = 220;
    
        this.scene.scene2D.addChild(pad);
        
        this.scene.backgroundColor = '#FFFFFF';    
        this.scene.setFog(1.0);

        // Add gravity
        //var gravVector = new Ammo.btVector3(0, -980, 0);
        //this.world._dynamicsWorld.setGravity(gravVector);
        //Ammo.destroy(gravVector);
        
        // Add a light
        var light = new DirectionalLight();
        light.color = [1.0, 1.0, 1.0];
        light.directionX = 1;
        light.directionY = 1;
        light.directionZ = -1;
        this.scene.setDirectionalLight(light);
        
        var fade = new objFade(FADE_TYPES.FADE_OUT, null, null, function ()
        {
            that.scene.removeChild(this);
        });
        
        this.scene.scene2D.addChild(fade);
        
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
        
        this.scene.addChild(skybox);
        this.scene.addChild(floor);
        
        var ball = new objTestBall(5);
        ball.z = 70;
        ball.y = 40;
        this.scene.addChild(ball);
    },
    
    enterframe: function (e) 
    {
        var that = this;
        objRoom.prototype.enterframe.call(this);
        
        chengine.debugCamera(this.scene, this.scene.getCamera());
        //camera.setFixed(this.ball, null);
        
        var vec = this.scene.getCamera()._getForwardVec();
        this.scene.getCamera().setFixed({x:this.scene.getCamera().x + vec[0], y:this.scene.getCamera().y + vec[1], z:this.scene.getCamera().z + vec[2]}, null);
        
        if (chengine.input.keyPressed('i'))
        {   
            var fade = new objFade(FADE_TYPES.FADE_IN, null, null, function ()
            {
                chengine.changeRoom(that, testRoom);
            });
            
            this.scene.scene2D.addChild(fade);
        }
    }
    
});
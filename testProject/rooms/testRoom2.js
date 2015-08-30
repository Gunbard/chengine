var testRoom2 = Class.create(objRoom, 
{
    initialize: function (parentScene)
    {
        objRoom.call(this, parentScene);
        this.name = "testScene2";
    }, 
    
    prepare: function ()
    {
        objRoom.prototype.prepare.call(this);
        
        var that = this;
        
        // Make a pad
        this.pad = new APad();
        this.pad.x = 20;
        this.pad.y = 220;
        
        this.createSkybox(TEXTURE_SKYDOME);
        this.scene.setFogDistance(200.0, 1550.0);
        
        this.area = game.assets[WORLD_HFIELD].colladaClone();
        this.area.updateRigid(0, 1, this.area.getVertices());
        scene.addChild(this.area);
        
        this.ball = new objTestBall(5);
        this.ball.z = 70;
        this.ball.y = 40;
        this.scene.addChild(this.ball);
        
        // Needs to be on top of everything to get touches
        this.scene.scene2D.addChild(this.pad);
        
        chengine.component.add(scene.getCamera(), new chengine.component.controlCameraMovable(1, game.input, this.pad));
        
        this.chen = new objCharacter(MODEL_HOLO, null, null, 1);
        this.chen.y = 100;
        this.chen.z = 200;
        this.chen.addToScene(this.scene);
        
        this.yukkuri = new objCharacter(MODEL_YUKKURI, null, null, 1);
        this.yukkuri.y = 100;
        this.yukkuri.z = 400;
        this.yukkuri.addToScene(this.scene);
        
        chengine.component.add(this.chen, new chengine.component.controlCameraMovable(0.25, game.input, this.pad));
        this.chen.model.pushAnimation(game.assets[MOTION_PATH]);
    },
    
    enterframe: function (e) 
    {
        var that = this;
        objRoom.prototype.enterframe.call(this);
        
        chengine.debugCamera(this.scene, this.scene.getCamera());
        
        if (!game.input.up && !game.input.down && !game.input.left && !game.input.right && 
                !this.pad.isTouched && !chengine.input.gamepadIsUsed(0))
        {
            this.chen.model.stopAnimating(this.chen.model.currentFrame);
        }
        else
        {
            this.chen.model.startAnimating(this.chen.model.currentFrame, MOTION_PATH);
        }
        
        if (chengine.input.keyPressed('i'))
        {   
            chengine.transitionRoom(testRoom, chengine.TRANSITION_TYPE.CROSSFADE);
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
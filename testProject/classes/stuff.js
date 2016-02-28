/**
 * Stuff
 */
 
var objItemBox = Class.create(PhyBox,
{
    initialize: function ()
    {
        PhyBox.call(this, 10, 10, 10, 0);
        this.mesh.setBaseColor('rgba(255, 255, 255, 1.0');
        this.mesh.texture = new Texture(game.assets['images/tex.jpg']);
        this.mesh.texture.ambient = [1.0, 1.0, 1.0, 1.0];
        this.mesh.texture.diffuse = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.emission = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.specular = [0.0, 0.0, 0.0, 0.0];
        this.mesh.texture.shininess = 0;
        
        var that = this;
        var newLife = new chengine.component.life(1);
        newLife.ondeath = function ()
        {
            var testObj = new objItemHorn();
            chengine.attach(testObj, that);
            chengine.getScene().addChild(testObj);
            
            var bigExp = new objExp(40);
            bigExp.x = that.x;
            bigExp.y = that.y;
            bigExp.z = that.z;
            chengine.getScene().addChild(bigExp);
            chengine.getScene().removeChild(that);
            chengine.sound.play(SOUND_EXPLODE);
        };
        newLife.ondeath = newLife.ondeath.bind(this);
        chengine.component.add(this, newLife); 
        this.deathTimer = 4000;
    },
    
    onenterframe: function ()
    {
        this.rotationApply(new enchant.gl.Quat(0, 1, 1, degToRad(-5)));
        
        this.deathTimer--;
        
        if (this.deathTimer <= 0)
        {
            scene.removeChild(this);
        }
    }
});

/**
 A spinning honking horn
 */
var objItemHorn = Class.create(PhyBox,
{
    initialize: function ()
    {
        PhyBox.call(this, 10, 10, 10, 0);
        this.mesh.setBaseColor('rgba(255, 255, 255, 0.0');
        this.model = game.assets[MODEL_HONK].colladaClone(true); 
    },
    
    onenterframe: function ()
    {
        chengine.attach(this.model, this);
        this.model.rotationApply(new enchant.gl.Quat(0, 1, 1, degToRad(-5)));
        
        var hitInfo = chengine.getScene().world.contactTest(this.rigid);
        var hitObj = hitInfo.hitObject;
        if (hitObj)
        {
            if (hitObj instanceof objCharacter)
            {                                
                chengine.getScene().removeChild(this);
                chengine.sound.play(SOUND_HONK);
            }
        }
    },
    
    onaddedtoscene: function ()
    {
        chengine.getScene().addChild(this.model);
    },
    
    onremovedfromscene: function ()
    {
        chengine.getScene().removeChild(this.model);
        this.model = null;
    }
    
});
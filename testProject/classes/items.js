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
            var bigExp = new objExp(40);
            bigExp.x = that.x;
            bigExp.y = that.y;
            bigExp.z = that.z;
            scene.addChild(bigExp);
            scene.removeChild(that);
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
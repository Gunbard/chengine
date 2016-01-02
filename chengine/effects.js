/**********************************
 Effects classes
 Explosions, hits, eye candy, etc.
 **********************************/
 
/****************
 CONSTANTS/ENUMS
 ****************/
 
// Different types of transitions
chengine.TRANSITION_TYPE =
{
    FADE_IN: 1,
    FADE_OUT: 2,
    FADE: 3,
    CROSSFADE: 4
}
 
// Speed of transitions
chengine.TRANSITION_SPEED =
{
    SLOW: 0.01,
    NORMAL: 0.05,
    FAST: 0.1
}
 
/**************
 # Explosions #
 **************/
 
/**
 A basic sphere explosion. Grows and fades out.
 */
var objExp = Class.create(Sphere, 
{
	initialize: function (maxScale, growthRate) 
    {
        Sphere.call(this, 1, 7, 8);
        this.mesh.setBaseColor('rgba(245, 240, 30, 0.8)');
        this.scale = 1;
        this.maxScale = maxScale;
        this.alpha = 0.8;
        this.growthRate = growthRate || 1;
        
        this.mesh.texture.shininess = 0;
	},
	
    onenterframe: function ()
    {
        this.mesh.setBaseColor('rgba(245, 140, 30,' + this.alpha + ')');
    
        if (this.scale < this.maxScale)
        {
            this.scale += this.growthRate;
            this.scaleX = this.scale;
            this.scaleY = this.scale;
            this.scaleZ = this.scale;
        }
        else
        {
            this.alpha -= 0.1;
        }
        
        if (this.alpha <= 0)
        {
            scene.removeChild(this);
        }
	}
});

/**
 A light ray effect that rotates randomly around a point.
 @param target {point} Point to rotate about
 @param size {number} Outer radius
 @param length {number} Length of cone 
 */
var objRay = Class.create(Conic,
{
    initialize: function (target, size, length)
    {
        size = size || 10;
        length = length || 200;
        Conic.call(this, size, 0.1, length, 10);
        chengine.unsetLighting(this.mesh);
        
        this.alpha = 0.0;
        this.alphaMax = 0.5;
        this.alphaSpeed = 0.1;
        
        this.mesh.setBaseColor('rgba(255, 255, 255, 0.0)');
        this.mesh.shininess = 100;        
        this.target = target;
        
        this.timer = 100;
        
        this.rotateX = Math.round(Math.random());
        this.rotateY = Math.round(Math.random());
        this.rotateZ = Math.round(Math.random());
        this.rotationSpeed = rand(-4, 4);
    },
    
    onenterframe: function ()
    {
        if (this.alpha < this.alphaMax)
        {
            this.alpha += this.alphaSpeed;
        }
        
        this.mesh.setBaseColor('rgba(255, 255, 255, ' + this.alpha + ')');
    
        chengine.attach(this, this.target);
    
        this.rotationApply(new enchant.gl.Quat(this.rotateX, this.rotateY, this.rotateZ, degToRad(this.rotationSpeed)));
        
        this.timer -= 1;
        
        if (this.timer == 0)
        {
            scene.removeChild(this);
        }
    }
});

/**
 */
var objBigExp = Class.create(Sprite3D, 
{
    initialize: function (target, finishCallback)
    {
        Sprite3D.call(this);
        this.timer = 300;
        this.expTimer = 6;
        this.rayTimer = 30;
        this.range = 200;
        this.rays = [];
        this.target = target;
        this.finishCallback = finishCallback;
    },
    
    onenterframe: function ()
    {
        chengine.attach(this, this.target);
    
        if (this.timer > 0)
        {
            this.timer -= 1;

            if (this.expTimer > 0)
            {
                this.expTimer -= 1;
            }
            else
            {
                var exp = new objExp(10);
                exp.x = this.x - this.range + (Math.random() * (this.range * 2));
                exp.y = this.y - this.range + (Math.random() * (this.range * 2));
                exp.z = this.z - this.range + (Math.random() * (this.range * 2));
                scene.addChild(exp);
                
                chengine.sound.play(SOUND_EXPLODE);
                
                this.expTimer = 6;
            }
            
            if (this.rayTimer > 0)
            {
                this.rayTimer -= 1;
            }
            else
            {
                var ray = new objRay(this.target, 25, 500);
                chengine.attach(ray, this);
                
                var rotateX = Math.round(Math.random());
                var rotateY = Math.round(Math.random());
                var rotateZ = Math.round(Math.random());
                var rotate = Math.random() * 360;
                ray.rotationApply(new enchant.gl.Quat(rotateX, rotateY, rotateZ, degToRad(rotate)));
                
                scene.addChild(ray);
                this.rays.push(ray);
                
                this.rayTimer = 30;
            }
        }
        else
        {
            if (this.finishCallback)
            {
                this.finishCallback();
            }
            
            for (var i = 0; i < this.rays.length; i++)
            {
                scene.removeChild(this.rays[i]);
            }
            
            var bigExp = new objExp(200, 4);
            chengine.attach(bigExp, this.target);
            scene.addChild(bigExp);
            
            //var whiteFlash = new objWhiteFlashSlow();
            //chengine.attach(whiteFlash, this.target);
            //scene.addChild(whiteFlash);
            
            var fade = new objFade(chengine.TRANSITION_TYPE.FADE_IN, 0.02, '#FFFFFF', function ()
            {
                var fadeOut = new objFade(chengine.TRANSITION_TYPE.FADE_OUT, 0.02, '#FFFFFF', function ()
                {
                    scene.scene2D.removeChild(this);
                });
                
                scene.scene2D.addChild(fadeOut);
                scene.scene2D.removeChild(this);
            });
            
            scene.scene2D.addChild(fade);
            
            scene.removeChild(this.target);
            scene.removeChild(this);
        }
    }   
});


/**********
 # System #
 **********/

/**
 A text box that displays some text. Automatically breaks lines and stops when
 the window is full. Closes when text finishes.
 TODO: Lookahead for <br>. If found, add whole thing rather than typing it out
       and waiting for the actual break to happen

 @param params {obj} Parameters
    {
        x {float} X-position
        y {float} Y-position
        width {float} Width of window
        height {float} Height of window
        text {string} Text to display
        font {font family} Font to display text in
        color {string} Hex string representing text color
        bgColor {string} Hex string representing background color
        opacity {number} Alpha value between 0 and 1
        timer {number} Time (in game steps) before the window auto closes (after all the text is displayed)
        textSpeed {number} Number of chars to display per frame
    }
 */
var objWindow = Class.create(Label,
{
    initialize: function(params) 
    {
        Label.call(this);
        
        if (!params)
        {
            params = {};
        }
        
        this.widthMax = params.width || 320;
        this.heightMax = params.height || 64;
        this.backgroundColor = params.bgColor || '#000000';
        this.opacity = params.opacity || 0.5;
        this.autocloseTimer = params.timer || 200; // In game steps
        this.soundOpen = params.soundOpen;
        this.soundClose = params.soundClose;
        this.soundTick = params.soundTick;

        params.position = params.position || 'top';
        
        switch (params.position)
        {
            case 'top':
            default:
                this.x = (params.image) ? 200 : 140;
                this.y = 10;
                break;
        }
        
        // Current dimensions
        this.width = 1;
        this.height = 1;

        // Text color
        this.color = params.color || DEFAULT_MSGTEXT_COLOR;
        
        // Font to use
        this.font = params.font || DEFAULT_MSGTEXT_FONT;
        
        // Number of chars to type at a time
        this.textSpeed = params.textSpeed || 1;
        
        // The full text that will be typed out
        this.textData = params.text || '';
        
        // Current position of the cursor
        this.textPos = 0;
        
        // Index of the start of a new line of text
        this.newLinePosition = 0;
        
        // If waiting for user input to continue
        this.waiting = false;
        
        // Text finished showing
        this.finished = false;
        
        // If closing
        this.closing = false;
        
        if (params.image)
        {
            this.image = new Sprite(80, 80);
            this.image.x = this.x - 80 - 4;
            this.image.y = this.y;
            this.image.image = game.assets[params.image];
            var scene = enchant.Core.instance.GL.currentScene3D;
            scene.scene2D.addChild(this.image);
        }
        
        this.onOpen();
    },
    
    onOpen: function ()
    {
        if (!this.soundOpen)
        {
            chengine.sound.play(SOUND_RADIOSTART);
        }
    },
    
    onClose: function ()
    {
        if (!this.soundClose)
        {
            chengine.sound.play(SOUND_RADIOEND);
        }
    },
    
    onTick: function ()
    {
    },
    
    onenterframe: function()
    {   
        // Window is finished sizing
        if (this.width >= this.widthMax && this.height >= this.heightMax && !this.waiting)
        {   
            if (this.textPos < this.textData.length)
            {
                this.onTick();
                this.textPos += this.textSpeed;
                this.text = this.textData.substring(this.newLinePosition, this.textPos);
                
                // If the next 4 characters are '<br>', immediately break
                // Ignore previous '<br>'s by truncating already-processed text
                var truncatedText = this.textData.substring(this.textPos, this.textData.length);
                if (truncatedText.indexOf('<br>') === 0)
                {
                    this.textPos += 4; // Skip break tag
                }
            
                // If currently a space character, look ahead to see if next word fits. 
                // Otherwise, split the line.
                if (this.textData.charAt(this.textPos) === ' ')
                {
                    var line = this.textData.substring(this.newLinePosition, this.textPos + 1) + 
                               this.textData.nextWord(this.textPos + 1);
                               
                    if (this.getMetrics(line).width >= this.widthMax)
                    {
                        // Eat space
                        this.textData = this.textData.replaceAt('', this.textPos);
                        
                        // Add new line
                        this.textData = this.textData.insertAt('<br>', this.textPos);
                        this.textPos += 4; // Skip break tag
                    
                        // Check if window is full
                        var newLine = this.textData.substring(this.newLinePosition, this.textPos + 1) + 
                                      this.textData.nextWord(this.textPos + 1);
                                      
                        if (this.getMetrics(newLine).height >= this.heightMax)
                        {    
                            // WAIT FOR KEY INPUT
                            this.waiting = true;
                            
                            this.newLinePosition = this.textPos;
                        }
                    }
                }
            }
            else
            {
                this.finished = true;
            }
        }
        
        if (game.input.space)
        {
            if (this.waiting)
            {
                this.waiting = false;
            }
            
            if (this.textPos === this.textData.length && !this.closing)
            {
                this.text = '';
                this.closing = true;
                this.onClose();
            }
        }
        
        if (this.finished)
        {
            if (this.autocloseTimer > 0)
            {
                this.autocloseTimer -= 1;
            }
            else if (!this.closing)
            {
                this.text = '';
                this.closing = true;
                this.onClose();
            }
        }
            
        if (this.closing)
        {
            if (this.height > (0.2 * this.heightMax))
            {
                this.height -= (0.2 * this.heightMax);
            }
            else
            {
                if (this.image)
                {
                    var scene = enchant.Core.instance.GL.currentScene3D;
                    scene.scene2D.removeChild(this.image);
                }
                chengine.instanceDestroy(this);
            }
        }
        else
        {
            // Size window animation
            if (this.width < this.widthMax)
            {
                this.width += (0.1 * this.widthMax);
            }
            
            if (this.height < this.heightMax)
            {
                this.height += (0.1 * this.heightMax);
            }
        }
    }
});

/**
 A target graphic. Always faces the camera, always attached to target.
 @param scale {float} Scaling size of graphic
 @param targetObj {Sprite3D} Object to be attached to
 */
var objTarget = Class.create(Plane, 
{
    initialize: function (scale, target)
    {
        Plane.call(this, scale);
        this.mesh.texture = new Texture(game.assets[TEX_CROSSHAIRS2RED]);
        
        chengine.unsetLighting(this.mesh);
        
        this.mesh.setBaseColor('rgba(255, 0, 0, 0.9)');    
        
        this.rotation = scene._camera.invMat;
        this.target = target;
        
        if (this.target)
        {
            chengine.attach(this, this.target);
        }
    },
    
    onenterframe: function ()
    {
        if (this.target)
        {
            chengine.attach(this, this.target);
        }
        else
        {
            scene.removeChild(this);
        }
    }
});

/*************************************
 # Screen effects, transitions, etc. #
 *************************************/

/**
 */
var objWhiteFlashSlow = Class.create(Plane, 
{
    initialize: function (fadeSpeed)
    {
        Plane.call(this, 10000);        
        chengine.unsetLighting(this.mesh);
        
        this.rotation = scene._camera.invMat;

        this.fading = false;
        this.alpha = 0.0;
        this.alphaMax = 1.0;
        this.alphaSpeed = 0.05;        
    },
    
    onenterframe: function ()
    {
        if (!this.fading)
        {
            if (this.alpha < this.alphaMax)
            {
                this.alpha += this.alphaSpeed;
            }
            else
            {
                this.fading = true;
            }
        }
        else
        {
            if (this.alpha > 0)
            {
                this.alpha -= this.alphaSpeed;
            }
            else
            {
                scene.removeChild(this);
            }
        }
        
        this.mesh.setBaseColor('rgba(255, 255, 255, ' + this.alpha + ')');
    }
});


/**
 */
var objFade = Class.create(Sprite,
{
    initialize: function (fadeType, speed, color, callback)
    {   
        Sprite.call(this, GAME_WIDTH, GAME_HEIGHT);
        
        fadeType = fadeType || 0;
        
        this.fadeType = fadeType;
        this.speed = speed;
        this.color = color;
        
        if (!speed)
        {
            this.speed = 0.01;
        }
    
        if (!color)
        {
            this.color = '#000000';
        }
        
        if (fadeType == chengine.TRANSITION_TYPE.FADE_IN)
        {
            this.opacity = 0.0;
        }
        else
        {
            this.opacity = 1.0;
        }
        
        this.callback = callback;
        
        this.finish = function ()
        {            
            if (this.callback)
            {
                this.callback();
            }
        }
        
        // Create new surface as image
        this.image = new Surface(GAME_WIDTH, GAME_HEIGHT);
        this.image.context.fillStyle = this.color;
        this.image.context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    },
    
    onenterframe: function ()
    {          
        var that = this;
        var fadeIn = function ()
        {
            if (that.opacity < 1.0)
            {
                that.opacity += that.speed;
            }
            else
            {
                that.finish();
            }
        }
        
        var fadeOut = function ()
        {
            if (that.opacity > that.speed)
            {
                that.opacity -= that.speed;
            }
            else
            {
                that.finish();
            }
        }
        
        switch (this.fadeType)
        {
            case chengine.TRANSITION_TYPE.FADE_IN:
                fadeIn();
                break;
            case chengine.TRANSITION_TYPE.FADE_OUT:
                fadeOut();
                break;
        }
    }
});

/**
 */
var objCrossfade = Class.create(Sprite,
{
    initialize: function (scene2D, fadeType, speed, color, callback)
    {   
        Sprite.call(this, GAME_WIDTH, GAME_HEIGHT);
        
        this.fadeType = fadeType || chengine.TRANSITION_TYPE.FADE_OUT;
        this.speed = speed || 0.01;
        this.color = color || '#000000';
        
        if (fadeType == chengine.TRANSITION_TYPE.FADE_IN)
        {
            this.opacity = 0.0;
        }
        else
        {
            this.opacity = 1.0;
        }
        
        this.callback = callback;
        
        var that = this;
        this.finish = function ()
        {            
            if (that.callback)
            {
                that.callback();
            }
            else
            {
                scene2D.removeChild(that);
            }
        }
        
        // Create new surface as image
        this.image = new Surface(GAME_WIDTH, GAME_HEIGHT);
        var canvas3D = enchant.Core.instance.GL._canvas;
        //canvas3D.ink(0.25).update();
        
        //var canvas2D = game.rootScene._layers.Canvas._element;

        // Take a "snapshot" of the 3D canvas and use as the sprite
        this.image.context.drawImage(canvas3D, 0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        //this.image.context.fillStyle = this.color;
        //this.image.context.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    },
    
    onenterframe: function ()
    {          
        if (this.fadeType == chengine.TRANSITION_TYPE.FADE_IN)
        {
            if (this.opacity < 1.0)
            {
                this.opacity += this.speed;
            }
            else
            {
                this.finish();
            }
        }
        else
        {
            if (this.opacity > this.speed)
            {
                this.opacity -= this.speed;
            }
            else
            {
                this.finish();
            }
        }
    }
});


/**
 Shakes the camera up a bit.
 @param intensity {number} How strong the shake will be
 @param duration {number} How many frames before the shaker kills itself
 */
var objCameraShaker = Class.create(Sprite,
{
    initialize: function (intensity, duration)
    {   
        Sprite.call(this);
        this.step = 0;
        this.reset = false; // Will flip between frames and should help with drift
        this.intensity = intensity || 0.1;
        this.duration = duration;
    },
    
    onenterframe: function ()
    {          
        this.step++;
    
        if (this.duration && this.step == this.duration)
        {
            chengine.instanceDestroy(this);
            return;
        }
        
        
        var cam = chengine.getScene().getCamera();

        if (this.reset)
        {
            cam.x = this.prevPos.x;
            cam.y = this.prevPos.y;
            cam.z = this.prevPos.z;
            this.reset = false;
        }
        else
        {
            cam.x += rand(-this.intensity, (2 * this.intensity));
            cam.y += rand(-this.intensity, (2 * this.intensity));
            cam.z += rand(-this.intensity, (2 * this.intensity));
            this.reset = true;
        }
        
        this.prevPos = 
        {
            x: cam.x,
            y: cam.y,
            z: cam.z,
        };
    }
});

/**
 A traditional, rectangular health bar. Sprite will stretch as the watch value decreases.
 @param params {healthParams} Health bar attributes
 healthParams:
 {
    lifeComponent: {chengine.component.life} Contains HP and max HP values to watch
    max: {number} Maximum HP variable
    width: {number} Bar width
    height: {number} Bar height
    orientation: {char} 'h' for horizontal, 'v' for vertical 
    scene: {objScene} Reference to scene this is in
 }
 */
var objHealthBar = Class.create(Sprite,
{
    initialize: function (params)
    {   
        if (!params)
        {
            params = {};
        }
        
        params.max = params.max || 100;
        params.width = params.width || 200;
        params.height = params.height || 10;
        this.params = params;
        
        this.maxWidth = params.width;
        this.maxHeight = params.height;
        this.prevValue = params.max;
        
        Sprite.call(this, this.maxWidth, this.maxHeight);
        
        // TODO: Handle engine-level textures
        this.image = game.assets[TEX_HEALTH];
        
        this.background = new Sprite(this.maxWidth, this.maxHeight);
        this.background.backgroundColor = '#000000';
        this.background.opacity = 0.6;
        
        this.movingBackground = new Sprite(this.maxWidth, this.maxHeight);
        this.movingBackground.backgroundColor = '#FFFFFF';
        this.movingBackgroundDelay = 30;
        this.movingBackgroundSpeed = 1;
        
        if (this.params.orientation && this.params.orientation == 'v')
        {
            var rot = 90;
            this.originX = 0;
            this.originY = 0;
            this.background.originX = 0;
            this.background.originY = 0;
            this.movingBackground.originX = 0;
            this.movingBackground.originY = 0;
            this.rotation = rot;
            this.background.rotation = rot;
            this.movingBackground.rotation = rot;
        }
    },
    
    onenterframe: function ()
    {          
        chengine.attach(this.background, this);
        chengine.attach(this.movingBackground, this);
        
        this.width = (this.params.lifeComponent.HP / this.params.lifeComponent.maxHP) * this.maxWidth;
        
        if (this.prevValue != this.params.lifeComponent.HP)
        {
            this.movingBackgroundDelay = 30;
            this.prevValue = this.params.lifeComponent.HP;
        }
        
        if (this.movingBackgroundDelay > 0)
        {
            this.movingBackgroundDelay--;
        }
        else
        {
            if (this.movingBackground.width > this.width)
            {
                this.movingBackground.width -= this.movingBackgroundSpeed;
            }                
        }
    },
    
    addToScene: function (scene)
    {
        this.scene = scene;
        scene.addChild(this.background);
        scene.addChild(this.movingBackground);
        scene.addChild(this);
    },
    
    removeFromScene: function ()
    {
        this.scene.removeChild(this.background);
        this.scene.removeChild(this.movingBackground);
        this.scene.removeChild(this);
    }
});
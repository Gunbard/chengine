/**********************
 Enchant.js Extensions
 Monkey patches, etc.
 **********************/
 
/*********
 Sprite3D
 *********/
 
/**
 Inits Sprite3D as PhySprite3D and adds rigid bodies to nodes.
 This is necessary as collada files init as Sprite3Ds rather than PhySprite3Ds.
 */
enchant.gl.Sprite3D.prototype.colladaClone = function (world) 
{   
    if (!(this instanceof enchant.gl.collada.RootColladaSprite3D))
    {
        return;
    }
    
    //this.vertices = this.childNodes[0].lib.geometries['ID2_001-mesh'].Mesh.srcs['ID2_001-mesh-positions'];

    
    var scale = new Ammo.btVector3(this.scaleX, this.scaleY, this.scaleZ);
    shape = new Ammo.btBoxShape(scale);
    Ammo.destroy(scale);

    var rigid = new enchant.gl.physics.Rigid(shape, 0);
    var clone = new enchant.gl.physics.PhySprite3D(rigid);

    for (var prop in this) 
    {
        if (typeof this[prop] === 'number' ||
            typeof this[prop] === 'string') 
        {
            clone[prop] = this[prop];
        } 
        else if (this[prop] instanceof WebGLBuffer) 
        {
            clone[prop] = this[prop];
        } 
        else if (this[prop] instanceof Float32Array) 
        {
            clone[prop] = new Float32Array(this[prop]);
        } 
        else if (this[prop] instanceof Array &&
                 prop !== 'childNodes' &&
                 prop !== 'detectColor') 
        {
            clone[prop] = this[prop].slice(0);
        }
    }

    if (this.mesh !== null) 
    {
        clone.mesh = this.mesh;
    }
    
    if (this.childNodes) 
    {
        for (var i = 0, l = this.childNodes.length; i < l; i++) 
        {
            var childClone = this.childNodes[i].clone();
            childClone.isWorld = world;
            clone.addChild(childClone);
        }
    }
    
    clone.isWorld = world;
    
    return clone;
};

/**
 @returns All the vertices for a Sprite3D
 */
enchant.gl.Sprite3D.prototype.getVertices = function ()
{
    var vertices = [];
    if (!this.mesh && this.childNodes.length > 0)
    {
        var data = this.childNodes[0].childNodes;
        for (var i = 0; i < data.length; i++)
        {
            if (data[i].mesh && data[i].mesh._vertices._array.length > 0)
            {
                vertices = vertices.concat(data[i].mesh._vertices._array);
            }
        }
    }
    else
    {
        return this.mesh.vertices;
    }
    
    return vertices;
};

/**
 Updates the physics body of a Sprite3D
 @param mass {float} The mass for the body
 @param vertices {array} List of vertices to build the physics body with
 */
enchant.gl.Sprite3D.prototype.updateRigid = function (mass, scale, vertices)
{
    // var shape = new Ammo.btBoxShape(1);
    var shape;
    if (typeof vertices !== 'undefined')
    {   
        // Swap YZ and negate Z
        var triMesh = new Ammo.btTriangleMesh(true, false);
        for (var i = 0; i < vertices.length; i += 9)
        {
            var v1 = new Ammo.btVector3(vertices[i] * scale, vertices[i + 1] * scale, vertices[i + 2] * scale);
            var v2 = new Ammo.btVector3(vertices[i + 3] * scale, vertices[i + 4] * scale, vertices[i + 5] * scale);
            var v3 = new Ammo.btVector3(vertices[i + 6] * scale, vertices[i + 7] * scale, vertices[i + 8] * scale);
            
            triMesh.addTriangle(v1, v2, v3, true);
            
            // var ball1 = new Sphere(1);
            // ball1.x = v1.x();
            // ball1.y = v1.y();
            // ball1.z = v1.z();
            // scene.addChild(ball1);
            
            
            Ammo.destroy(v1);
            Ammo.destroy(v2);
            Ammo.destroy(v3);
        }

        shape = new Ammo.btBvhTriangleMeshShape(triMesh, true, true);
    }
    
    this.rigid = new enchant.gl.physics.Rigid(shape, mass);
};

enchant.gl.Sprite3D.prototype.setTranslation = function (x, y, z)
{
    this._x = x;
    this._y = y;
    this._z = z;
    this._changedTranslation = true;
};

enchant.gl.Sprite3D.prototype.setForward = function (distance, ref)
{
    var x = ref.x - ref._rotation[8] * distance;
    var y = ref.y - ref._rotation[9] * distance;
    var z = ref.z - ref._rotation[10] * distance;
    this.setTranslation(x, y, z);
};

enchant.gl.Sprite3D.prototype.setSidestep = function (distance, ref)
{   
    var x = ref.x - ref._rotation[0] * distance;
    var y = ref.y - ref._rotation[1] * distance;
    var z = ref.z - ref._rotation[2] * distance;
    this.setTranslation(x, y, z);
};

enchant.gl.Sprite3D.prototype.setAltitude = function (distance, ref)
{
    var x = ref.x - ref._rotation[4] * distance;
    var y = ref.y - ref._rotation[5] * distance;
    var z = ref.z - ref._rotation[6] * distance;
    this.setTranslation(x, y, z);
};

enchant.gl.Sprite3D.prototype.setRelativeOffset = function (offset, ref)
{   
    var x = ref.x;
    var y = ref.y;
    var z = ref.z;
    
    if (offset.x)
    {
        x -= ref._rotation[0] * offset.x;
        y -= ref._rotation[1] * offset.x;
        z -= ref._rotation[2] * offset.x;
    }
    
    if (offset.y)
    {
        x -= ref._rotation[4] * offset.y;
        y -= ref._rotation[5] * offset.y;
        z -= ref._rotation[6] * offset.y;
    }
    
    if (offset.z)
    {
        x -= ref._rotation[8] * offset.z;
        y -= ref._rotation[9] * offset.z;
        z -= ref._rotation[10] * offset.z;
    }
    
    this.setTranslation(x, y, z);
};

enchant.gl.Sprite3D.prototype.setOffset = function (offset, ref)
{   
    var x = ref.x;
    var y = ref.y;
    var z = ref.z;
    
    if (offset.x)
    {
        x = ref._rotation[0] * offset.x;
        y = ref._rotation[1] * offset.x;
        z = ref._rotation[2] * offset.x;
    }
    
    if (offset.y)
    {
        x = ref._rotation[4] * offset.y;
        y = ref._rotation[5] * offset.y;
        z = ref._rotation[6] * offset.y;
    }
    
    if (offset.z)
    {
        x = ref._rotation[8] * offset.z;
        y = ref._rotation[9] * offset.z;
        z = ref._rotation[10] * offset.z;
    }
    
    this.setTranslation(x, y, z);
};

/**********
 MSprite3D
 **********/

/**
 Add new properties and custom methods
 */
enchant.gl.mmd.MSprite3D.prototype.initialize = function (path, callback, onerror)
{
    enchant.gl.Sprite3D.call(this);
    this.program = enchant.gl.mmd.MMD_SHADER_PROGRAM;
    this.animation = [];
    this.uMVMatrix = mat4.create();
    this.uNMatrix = mat4.create();
    
    this.currentFrame = 0;
    this.animationSpeed = 1;
    this.loop = true;
    this.ticks = 0;
    
    /**
     Event when animation finishes
     */
    this.animationFinished = function (animation)
    {
        //this.clearAnimation();
    };
    
    this.addEventListener('enterframe', function () 
    {
        this.ticks++;
        var first;
        var skeleton = this.skeleton;
        var morph = this.morph;
        
        if (this.animation.length > 0) 
        {
            first = this.animation[0];
            var data = first.animation._tick(first.frame);
            first.frame += this.animationSpeed;
            
            // Improve performance by only applying new skeletion on certain frames
            // It'll appear choppier, but the framerate won't drop as low.
            if (this.ticks % 2 == 0)
            {
                this._skinning(data.poses);
                //this._morphing(data.morphs);
            }
            
            if (first.frame > first.animation.length) 
            {
                first = this.animation.shift();
                if (this.loop) 
                {
                    first.frame = 0;
                    this.animation.push(first);
                }
                
                this.animationFinished(this.animation[0]);
            }
            
            this.currentFrame = first.frame;
        }
    });
    
    if (arguments.length >= 2) 
    {
        this.loadPmd(path, callback, onerror);
    }
};

/**
 @returns {int} The total number of frames for the current animation
 */
enchant.gl.mmd.MSprite3D.prototype.frameLength = function ()
{
    var currentAnimation = this.animation[0];
    if (currentAnimation)
    {
        return currentAnimation.animation.length;
    }
};

/**
 Sets the current frame for the current animation
 @param {int} frameNumber The number of the frame to set
 */
enchant.gl.mmd.MSprite3D.prototype.setFrame = function (frameNumber)
{
    var currentAnimation = this.animation[0];
    if (currentAnimation)
    {
        var data = currentAnimation.animation._tick(frameNumber);
        this._skinning(data.poses);
        this._morphing(data.morphs);
        this.currentFrame = frameNumber;
    }
};

/**
 Begins animating MMD model
 @param startFrame {int} The frame number to start the animation from
 @param animation {string} The motion asset to load
 */
enchant.gl.mmd.MSprite3D.prototype.startAnimating = function (startFrame, animation)
{
    if (this.animation.length == 0)
    {
        var motion = game.assets[animation];
        this.animation.push({frame: startFrame, animation: motion});
    }
};

/**
 Stops animating MMD model
 @param endFrame {int} The frame number to stop on
 */
enchant.gl.mmd.MSprite3D.prototype.stopAnimating = function (endFrame)
{
    if (this.animation.length == 0)
    {
        return;
    }
    
    if (endFrame)
    {
        this.setFrame(endFrame);
    }

    this.clearAnimation();
};

/******
 World
 ******/

/**
 Override to fix deprecated customizeVTable method
 */
enchant.gl.physics.World.prototype.contactPairTest = function (rigid1, rigid2)
{
    var callback = new Ammo.ConcreteContactResultCallback();
    var result = false;
    
    callback.addSingleResult = function(cp, colObj0, partid0, index0, colObj1, partid1, index1) 
    {
        result = true;
    };
    
    this._dynamicsWorld.contactTest(rigid1.rigidBody, rigid2.rigidBody, callback);
    Ammo.destroy(callback);
    return result;
};


enchant.gl.physics.World.prototype.contactTest = function (rigid) 
{
    var callback = new Ammo.ConcreteContactResultCallback();
    var hitInfo = {};
    
    callback.addSingleResult = function(cp, colObj0, partid0, index0, colObj1, partid1, index1) 
    {
        var collisionPoint = Ammo.wrapPointer(cp, Ammo.btManifoldPoint);
        //console.log(collisionPoint);
        //alert(collisionPoint.get_m_positionWorldOnA().x() + ', ' + collisionPoint.get_m_positionWorldOnA().y() + ', ' + collisionPoint.get_m_positionWorldOnA().z());
        var collisionObj = Ammo.wrapPointer(colObj1, Ammo.btCollisionObjectWrapper);
        var body = Ammo.btRigidBody.prototype.upcast(collisionObj.getCollisionObject());
        var owner = scene.rigidOwner(body);
        hitInfo.hitObject = owner;
        hitInfo.hitPointA = {
                                x: collisionPoint.get_m_positionWorldOnA().x(), 
                                y: collisionPoint.get_m_positionWorldOnA().y(), 
                                z: collisionPoint.get_m_positionWorldOnA().z()
                            };
        hitInfo.hitPointB = {
                                x: collisionPoint.get_m_positionWorldOnB().x(), 
                                y: collisionPoint.get_m_positionWorldOnB().y(), 
                                z: collisionPoint.get_m_positionWorldOnB().z()
                            };
    };
    
    
    this._dynamicsWorld.contactTest(rigid.rigidBody, callback);
    Ammo.destroy(callback);
    return hitInfo;
};

/**
 Turns fog on or off
 @param boolFloat 0.0 for off, 1.0 for on
 */
enchant.gl.Scene3D.prototype.setFog = function (boolFloat)
{
    enchant.Core.instance.GL.currentScene3D.fogEnabled = boolFloat;
    enchant.Core.instance.GL.defaultProgram.setUniforms({uUseFog: boolFloat});
};

/**
 @returns {boolFloat} 0.0 for off, 1.0 for on
 */
enchant.gl.Scene3D.prototype.getFog = function ()
{
    return enchant.Core.instance.GL.currentScene3D.fogEnabled;
};

/**
 Sets the fog distance settings
 @param minDist {float} The minimum fog drawing distance
 @param maxDist {float} The maximum fog drawing distance
 */
enchant.gl.Scene3D.prototype.setFogDistance = function (minDist, maxDist)
{
    enchant.Core.instance.GL.currentScene3D.fogMinDistance = minDist;
    enchant.Core.instance.GL.currentScene3D.fogMaxDistance = maxDist;
    enchant.Core.instance.GL.defaultProgram.setUniforms({uFogDistance: [minDist, maxDist]});
};

/**
 @return [float, float] [Minimum distance, maximum distance]
 */
enchant.gl.Scene3D.prototype.getFogDistance = function ()
{
    var minDist = enchant.Core.instance.GL.currentScene3D.fogMinDistance;
    var maxDist = enchant.Core.instance.GL.currentScene3D.fogMaxDistance;
    return [minDist, maxDist];
};

/**
 Sets the fog color, if enabled. Values are between 0 and 1
 @param r {float} red value
 @param g {float} green value
 @param b {float} blue value
 @param a {float} alpha value
 */
enchant.gl.Scene3D.prototype.setFogColor = function (r, g, b, a)
{
    var colorValue = [r, g, b, a];
    enchant.Core.instance.GL.currentScene3D.fogColor = colorValue;
    enchant.Core.instance.GL.defaultProgram.setUniforms({uFogColor: colorValue});
};

/**
 @returns {[r, g, b, a]} Fog color of current scene
 */
enchant.gl.Scene3D.prototype.getFogColor = function ()
{
    return enchant.Core.instance.GL.currentScene3D.fogColor;
};

/****
 UI
 ****/

/**
 Determines if the on-screen dpad is in use
 @returns {bool} Whether or not the dpad is being touched at the moment
 */
enchant.ui.Pad.prototype.isActive = function ()
{
    return (this.input.left || this.input.right || this.input.up || this.input.down);
};

/***********
 Primitives
 ***********/
 
/**
 Creates a cone mesh
 @param r {float} Radius of beginning base
 @param r2 {float} Radius of ending base
 @param h {float} Length of cone
 @param v {int} Number of vertices that make up face
 @returns {Mesh} A cone mesh
 */
enchant.gl.Mesh.createConic = function(r, r2, h, v) 
{
    if (typeof r === 'undefined')  
    {
        r = 0.5;
    }    
    
    if (typeof r2 === 'undefined')  
    {
        r2 = 0.5;
    }
    
    if (typeof h === 'undefined') 
    {
        h = 1;
    }
    
    if (typeof v === 'undefined') 
    {
        v = 20;
    }
    
    var vertices = [];
    var indices = [];
    var texCoords = [];
    var normals = [];
    vertices[vertices.length] = 0;
    vertices[vertices.length] = h;
    vertices[vertices.length] = 0;
    normals[normals.length] = 0;
    normals[normals.length] = 1;
    normals[normals.length] = 0;
    texCoords[texCoords.length] = 0;
    texCoords[texCoords.length] = 1;
    vertices[vertices.length] = 0;
    vertices[vertices.length] = 0;//-h;
    vertices[vertices.length] = 0;
    normals[normals.length] = 0;
    normals[normals.length] = -1;
    normals[normals.length] = 0;
    texCoords[texCoords.length] = 0;
    texCoords[texCoords.length] = 0;
    var cos = 0;
    var sin = 0;
    for (var i = 0; i < v; i++) 
    {
        cos = Math.cos(Math.PI * 2 * i / (v - 1));
        sin = Math.sin(Math.PI * 2 * i / (v - 1));
        vertices[vertices.length] = cos * r;
        vertices[vertices.length] = h;
        vertices[vertices.length] = sin * r;
        normals[normals.length] = 0;
        normals[normals.length] = 1;
        normals[normals.length] = 0;
        texCoords[texCoords.length] = i / (v - 1);
        texCoords[texCoords.length] = 1;
        vertices[vertices.length] = cos * r2;
        vertices[vertices.length] = 0;//-h;
        vertices[vertices.length] = sin * r2;
        normals[normals.length] = 0;
        normals[normals.length] = -1;
        normals[normals.length] = 0;
        texCoords[texCoords.length] = i / (v - 1);
        texCoords[texCoords.length] = 0;
        vertices[vertices.length] = cos * r;
        vertices[vertices.length] = h;
        vertices[vertices.length] = sin * r;
        normals[normals.length] = cos;
        normals[normals.length] = 0;
        normals[normals.length] = sin;
        texCoords[texCoords.length] = i / (v - 1);
        texCoords[texCoords.length] = 1;
        vertices[vertices.length] = cos * r2;
        vertices[vertices.length] = 0;//-h;
        vertices[vertices.length] = sin * r2;
        normals[normals.length] = cos;
        normals[normals.length] = 0;
        normals[normals.length] = sin;
        texCoords[texCoords.length] = i / (v - 1);
        texCoords[texCoords.length] = 0;
    }
    for (i = 0; i < v - 1; i++) 
    {
        indices[indices.length] = 0;
        indices[indices.length] = 2 + i * 4 + 4;
        indices[indices.length] = 2 + i * 4 + 0;
        indices[indices.length] = 1;
        indices[indices.length] = 2 + i * 4 + 1;
        indices[indices.length] = 2 + i * 4 + 5;
        indices[indices.length] = 2 + i * 4 + 2;
        indices[indices.length] = 2 + i * 4 + 6;
        indices[indices.length] = 2 + i * 4 + 3;
        indices[indices.length] = 2 + i * 4 + 6;
        indices[indices.length] = 2 + i * 4 + 7;
        indices[indices.length] = 2 + i * 4 + 3;
    }
    
    var mesh = new enchant.gl.Mesh();
    mesh.vertices = vertices;
    mesh.indices = indices;
    mesh.texCoords = texCoords;
    mesh.normals = normals;
    mesh.setBaseColor('#ffffff');
    return mesh;
};

enchant.gl.Mesh.createBeam = function(r, h, v) 
{
    if (typeof r === 'undefined')  
    {
        r = 0.5;
    }    
    
    if (typeof h === 'undefined') 
    {
        h = 1;
    }
    
    if (typeof v === 'undefined') 
    {
        v = 8;
    }
    
    var vertices = [];
    var indices = [];
    var texCoords = [];
    var normals = [];
    vertices[vertices.length] = 0;
    vertices[vertices.length] = h;
    vertices[vertices.length] = 0;
    normals[normals.length] = 0;
    normals[normals.length] = 1;
    normals[normals.length] = 0;
    texCoords[texCoords.length] = 0;
    texCoords[texCoords.length] = 1;
    vertices[vertices.length] = 0;
    vertices[vertices.length] = 0;//-h;
    vertices[vertices.length] = 0;
    normals[normals.length] = 0;
    normals[normals.length] = -1;
    normals[normals.length] = 0;
    texCoords[texCoords.length] = 0;
    texCoords[texCoords.length] = 0;
    var cos = 0;
    var sin = 0;
    for (var i = 0; i < v; i++) 
    {
        cos = Math.cos(Math.PI * 2 * i / (v - 1));
        sin = Math.sin(Math.PI * 2 * i / (v - 1));
        vertices[vertices.length] = cos * r;
        vertices[vertices.length] = h;
        vertices[vertices.length] = sin * r;
        normals[normals.length] = 0;
        normals[normals.length] = 1;
        normals[normals.length] = 0;
        texCoords[texCoords.length] = i / (v - 1);
        texCoords[texCoords.length] = 1;
        vertices[vertices.length] = cos * r;
        vertices[vertices.length] = 0;//-h;
        vertices[vertices.length] = sin * r;
        normals[normals.length] = 0;
        normals[normals.length] = -1;
        normals[normals.length] = 0;
        texCoords[texCoords.length] = i / (v - 1);
        texCoords[texCoords.length] = 0;
        vertices[vertices.length] = cos * r;
        vertices[vertices.length] = h;
        vertices[vertices.length] = sin * r;
        normals[normals.length] = cos;
        normals[normals.length] = 0;
        normals[normals.length] = sin;
        texCoords[texCoords.length] = i / (v - 1);
        texCoords[texCoords.length] = 1;
        vertices[vertices.length] = cos * r;
        vertices[vertices.length] = 0;//-h;
        vertices[vertices.length] = sin * r;
        normals[normals.length] = cos;
        normals[normals.length] = 0;
        normals[normals.length] = sin;
        texCoords[texCoords.length] = i / (v - 1);
        texCoords[texCoords.length] = 0;
    }
    for (i = 0; i < v - 1; i++) 
    {
        indices[indices.length] = 0;
        indices[indices.length] = 2 + i * 4 + 4;
        indices[indices.length] = 2 + i * 4 + 0;
        indices[indices.length] = 1;
        indices[indices.length] = 2 + i * 4 + 1;
        indices[indices.length] = 2 + i * 4 + 5;
        indices[indices.length] = 2 + i * 4 + 2;
        indices[indices.length] = 2 + i * 4 + 6;
        indices[indices.length] = 2 + i * 4 + 3;
        indices[indices.length] = 2 + i * 4 + 6;
        indices[indices.length] = 2 + i * 4 + 7;
        indices[indices.length] = 2 + i * 4 + 3;
    }
    
    var mesh = new enchant.gl.Mesh();
    mesh.vertices = vertices;
    mesh.indices = indices;
    mesh.texCoords = texCoords;
    mesh.normals = normals;
    mesh.setBaseColor('#ffffff');
    return mesh;
};

/**
 A cone primitive.
 @param r {float} Radius of beginning base
 @param r2 {float} Radius of ending base
 @param h {float} Length of cone
 @param v {int} Number of vertices that make up face
 @returns {Sprite3D} A cone object
 */
enchant.gl.primitive.Conic = Class.create(enchant.gl.Sprite3D, 
{
    initialize: function(r, r2, h, v) 
    {
        Sprite3D.call(this);
        this.mesh = enchant.gl.Mesh.createConic(r, r2, h, v);
    }
});

enchant.gl.primitive.Beam = Class.create(enchant.gl.Sprite3D, 
{
    initialize: function(r, h, v) 
    {
        Sprite3D.call(this);
        this.mesh = enchant.gl.Mesh.createBeam(r, h, v);
    }
});
 
enchant.gl.physics.PhyBeam = Class.create(enchant.gl.physics.PhySprite3D, {
    initialize: function(r, h, v, mass) {
        var rigid = new enchant.gl.physics.RigidCylinder(r, h, mass);
        enchant.gl.physics.PhySprite3D.call(this, rigid);
        this.mesh = enchant.gl.Mesh.createBeam(r, h, v);
    }
});
 
enchant.gl.Quat.prototype.setFromRotationMatrix = function (mat)
{
    // Adapted from THREE.js which adapted from: http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
    function copySign(a, b) 
    {
        return b < 0 ? -Math.abs(a) : Math.abs(a);
    }
    
    var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
    a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
    a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
    a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
    
    var absQ = Math.pow(mat4.determinant(mat), 1.0 / 3.0);
    var w = Math.sqrt( Math.max( 0, absQ + a11 + a22 + a33 ) ) / 2;
    var x = Math.sqrt( Math.max( 0, absQ + a11 - a22 - a33 ) ) / 2;
    var y = Math.sqrt( Math.max( 0, absQ - a11 + a22 - a33 ) ) / 2;
    var z = Math.sqrt( Math.max( 0, absQ - a11 - a22 + a33 ) ) / 2;
    x = copySign( x, ( a32 - a23 ) );
    y = copySign( y, ( a13 - a31 ) );
    z = copySign( z, ( a21 - a12 ) );
    this._quat = quat4.create([x, y, z, w]);
    //quat4.normalize(this._quat);
    return this;
};

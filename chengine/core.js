/************************
 Core helper functions
 ************************/
 
/******
 MATH
 ******/
 
/**
 Converts degrees to radians
 @param deg {float} Value in degrees
 @returns {float} Value in radians
 */
function degToRad(deg)
{
    return deg * (Math.PI / 180.0);
}

/**
 Converts radians to degrees
 @param rad {float} Value in radians
 @returns {float} Value in degrees
 */
function radToDeg(rad)
{
    return rad * (180.0 / Math.PI);
}

/**
 Calculates the distance between two 3D points
 Assumes params have x, y, and z properties
 @param obj1 {something with x,y,z} Object with positional data
 @param obj2 {something with x,y,z} Other object with positional data
 @returns {float} The distance between the objects
 */
function distanceToPoint(obj1, obj2)
{
    var xVal = Math.pow(obj1.x - obj2.x, 2);
    var yVal = Math.pow(obj1.y - obj2.y, 2);
    var zVal = Math.pow(obj1.z - obj2.z, 2);
    return Math.sqrt(xVal + yVal + zVal);
}

/**
 Generates a random number
 @param min {float} Low end
 @param max {float} Top end
 @returns {float} A random value between min and max
 */
function rand(min, max)
{
    return (Math.random() * (max - min) + min);
}

/**
 Converts a bullet quaternion to euler coordinates
 @param btQuaternion {btQuaternion} The quat to convert
 @returns An object with axis rotation properties {x, y, z}
 */
function quatToEuler(btQuaternion)
{
    var qw = btQuaternion.getW();
    var qx = btQuaternion.getX();
    var qy = btQuaternion.getY();
    var qz = btQuaternion.getZ();

    var euler = {};

    euler.x = Math.atan2(2.0 * (qy * qz + qx * qw), -Math.pow(qx, 2) - Math.pow(qy, 2) + Math.pow(qz, 2) + Math.pow(qw, 2));
    euler.y = Math.asin(-2.0 * (qx * qz - qy * qw));
    euler.z = Math.atan2(2.0 * (qx * qy + qz * qw), Math.pow(qx, 2) - Math.pow(qy, 2) - Math.pow(qz, 2) + Math.pow(qw, 2));

    return euler;
}


/*******
 STRING
 *******/

/**
 Add an insert method to String
 @param string {string} String to insert
 @param index {number} Position to insert at
 @returns {string} String with inserted string
 */ 
String.prototype.insertAt = function (string, index) 
{ 
    return this.substr(0, index) + string + this.substr(index);
}
/**
 Add a replace method to String. Replaces the character at the 
 [index] with the [string]
 @param string {string} String to replace with
 @param index {number} Position to replace at
 @returns {string} String with replaced string
 */
String.prototype.replaceAt = function (string, index) 
{
    var length = (string.length > 0) ? string.length : 1;
    return this.substr(0, index) + string + this.substr(index + length);
}

/**
 Gets the next word starting from the [index] using a space as a delimiter
 @param index {number} Index to start from
 @returns The next word
 */
String.prototype.nextWord = function (index)
{
    var word = '';
    while (this.charAt(index) !== ' ' && index < this.length)
    {
        word += this.charAt(index);
        index += 1;
    }
    
    return word;
}

/**
 Attempts to create a clone of an object with properties intact
 @param {object} obj Object to clone
 @returns {object} A (hopefully) cloned object
 */
function clone(obj) 
{
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

/**
 Calculates an angle and magnitude
 @param x {float} x value
 @param y {float} y value
 @returns {rad {float}: angle in radians, dist {float}: magnitude}
 */
function calcPolar(x, y)
{
    var r = 1;
    var add = 0;
    var rad = 0;
    var dist = Math.sqrt(x * x + y * y);
    if (dist > r) 
    {
        dist = r;
    }
    
    dist /= r;
    dist *= dist;
    
    if (x >= 0 && y < 0) 
    {
        add = Math.PI / 2 * 3;
        rad = x / y;
    } 
    else if (x < 0 && y <= 0) 
    {
        add = Math.PI;
        rad = y / x;
    } 
    else if (x <= 0 && y > 0) 
    {
        add = Math.PI / 2;
        rad = x / y;
    } 
    else if (x > 0 && y >= 0) 
    {
        add = 0;
        rad = y / x;
    }
    
    if (x === 0 || y === 0) 
    {
        rad = 0;
    }
    
    var newRad = Math.abs(Math.atan(rad)) + add;
    var newDist = dist;
    
    return {rad: newRad, dist: newDist};
}

function toggle(watchCondition, trueCallback, falseCallback)
{
    if (watchCondition)
    {
        trueCallback();
        return;
    }
    else
    {
        falseCallback();
        return;
    }
}
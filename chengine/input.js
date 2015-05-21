/*********************************************
 Input manager
 Manages keyboard, mouse, and joystick inputs
 *********************************************/
 
chengine.input = {};


/************
 # Keyboard #
 ************/

/** 
 Currently pressed inputs.
 Used for detecting momentary presses.
 */
chengine.input.pressed = [];

/**
 Binds default keys to the input store
 TODO: Allow remap
 */
chengine.input.setKeybindings = function ()
{
    game.keybind(65, 'a');	
    game.keybind(66, 'b');	
    game.keybind(67, 'c');	
    game.keybind(68, 'd');
    game.keybind(69, 'e');
    game.keybind(70, 'f');
    game.keybind(71, 'g');
    game.keybind(72, 'h');
    game.keybind(73, 'i');
    game.keybind(74, 'j');
    game.keybind(75, 'k');
    game.keybind(76, 'l');
    game.keybind(77, 'm');
    game.keybind(78, 'n');
    game.keybind(79, 'o');
    game.keybind(80, 'p');
    game.keybind(81, 'q');
    game.keybind(82, 'r');
    game.keybind(83, 's');
    game.keybind(84, 't');
    game.keybind(85, 'u');
    game.keybind(86, 'v');
    game.keybind(87, 'w');
    game.keybind(88, 'x');
    game.keybind(89, 'y');
    game.keybind(90, 'z');
    game.keybind(48, 'zero');
    game.keybind(32, 'space');
};

/**
 Determines if a keyboard input was momentarily pressed 
 rather than currently pressed
 @param key {string} The key to get from the input store
 @returns {bool} Whether or not a key was pressed
 */
chengine.input.keyPressed = function (key)
{
    var keyIsPressed = (chengine.input.pressed.indexOf(key) > -1);
    var inputStore = game.input;
    
    if (inputStore[key] && !keyIsPressed)
    {
        chengine.input.pressed.push(key);
        return true;
    }
    else if (!inputStore[key] && keyIsPressed)
    {
        chengine.input.pressed.splice(chengine.input.pressed.indexOf(key), 1);
        return false;
    }
};


/***********
 # Gamepad #
 ***********/

/**
 Connected gamepads
 */
chengine.input.gamepads = [];

/**
 Currently pressed gamepad buttons.
 Used for detecting momentary presses.
 */
//chengine.input.buttonsPressed = [];
 
/**
 */
chengine.input.enableGamepads = function ()
{
    // Handle game pads
    var hasGamepadEvents = 'GamepadEvent' in window;

    if (hasGamepadEvents) 
    {
        window.addEventListener("gamepadconnected", chengine.input.gamepadAdd);
        window.addEventListener("gamepaddisconnected", chengine.input.gamepadRemove);
    } 
    else 
    {
        // Poll for game pads manually
        setInterval(chengine.input.gamepadScan, 500);
    }  
};

/**
 */
chengine.input.gamepadAdd = function (e) 
{
    chengine.input.gamepads.push(e.gamepad);
};

/**
 */
chengine.input.gamepadRemove = function (e) 
{
    gamepads.splice(chengine.input.gamepads.indexOf(e.gamepad), 1);
};

/**
 */
chengine.input.gamepadScan = function () 
{
    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
    
    for (var i = 0; i < gamepads.length; i++) 
    {
        if (chengine.input.gamepads.indexOf(gamepads[i]) == -1) 
        {
            chengine.input.gamepadAdd(gamepads[i]);
        }
    }
};

/**
 */
chengine.input.getGamepadsConnected = function ()
{
    return chengine.input.gamepads.length;
};

/**
 */
chengine.input.getGamepadPolar = function (gamepadIndex)
{
    if (chengine.input.getGamepadsConnected() == 0)
    {
        return;
    }

    var gamepad = chengine.input.gamepads[gamepadIndex];
    var polar = calcPolar(gamepad.axes[0], gamepad.axes[1]);
    var inputRad = polar.rad;
    var inputDist = polar.dist * 2; // Normalize me
    
    if (Math.floor((inputDist.toFixed(2) * 100)) > 0)
    {
        gamepad.inUse = true;
    }
    else
    {
        gamepad.inUse = false;
    }    
    
    return {rad: inputRad, dist: inputDist};
};

/**
 */
chengine.input.gamepadIsUsed = function (gamepadIndex)
{
    if (chengine.input.gamepads.length == 0 || 
        gamepadIndex > chengine.input.gamepads.length || gamepadIndex < 0)
    {
        return false;
    }
    
    var gamepad = chengine.input.gamepads[gamepadIndex];
    return (gamepad.inUse) ? true : false;
};

/**
 */
chengine.input.buttonPressed = function (gamepadIndex, buttonIndex)
{   
    var gamepad = chengine.input.gamepads[gamepadIndex];
    
    if (gamepad)
    {
        if (!gamepad.buttonsPressed)
        {
            gamepad.buttonsPressed = [];
        }
        
        var buttonState = gamepad.buttons[buttonIndex].pressed;
        var buttonIsPressed = (gamepad.input.buttonsPressed.indexOf(buttonIndex) > -1);
        
        if (buttonState && !buttonIsPressed)
        {
            gamepad.buttonsPressed.push(buttonIndex);
            return true;
        }
        else if (!buttonState && buttonIsPressed)
        {
            gamepad.buttonsPressed.splice(gamepad.buttonPressed.indexOf(buttonIndex), 1);
            return false;
        }
    }
};

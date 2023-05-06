let myCapture, myVida;

let Memorylayers, EN_M3_mldy1, EN_M3_stinger3,
  HOLO_B1, LEIS_MUSIC_pipe2, LEOF_SAAV_mldy3;

let sounds = [];

let canvasWidth = 640, canvasHeight = 480;

/// preload is called before setup to make sure smth is done before the program starts
function preload() {
  console.log('[preload] loading samples...');

  memorylayers     = loadSound('mp3/memorylayers.mp3');
  EN_M3_mldy1      = loadSound('mp3/EN_M3_mldy1.mp3');
  EN_M3_stinger3   = loadSound('mp3/EN_M3_stinger3.mp3');
  HOLO_B1          = loadSound('mp3/HOLO_B1.mp3');
  LEIS_MUSIC_pipe2 = loadSound('mp3/LEIS_MUSIC_pipe2.mp3');
  LEOF_SAAV_mldy3  = loadSound('mp3/LEOF_SAAV_mldy3.mp3');

    sounds = [
    memorylayers,
    EN_M3_mldy1,
    EN_M3_stinger3,
       HOLO_B1, 
    LEIS_MUSIC_pipe2,
    LEOF_SAAV_mldy3
  ]

  console.log('[preload] samples loaded');
}

function initCaptureDevice() {
  try {
    myCapture = createCapture(VIDEO);
    myCapture.size(canvasWidth, canvasHeight);
    myCapture.elt.setAttribute('playsinline', '');
    myCapture.hide();

    console.log(`[initCaptureDevice] capture ready. Resolution: ${myCapture.width}x${myCapture.height}`)
  } catch(_err) {
    console.log(`[initCaptureDevice] capture error: ${_err}`);
  }
}

function setup() {
  createCanvas(canvasWidth, canvasHeight); // we need some space...
  initCaptureDevice(); // and access to the camera

  /*
    VIDA stuff. One parameter - the current sketch - should be passed to the
    class constructor (thanks to this you can use Vida e.g. in the instance
    mode).
  */
  myVida = new Vida(this); // create the object
  /*
    Turn off the progressive background mode (we will use a static background
    image).
  */
  myVida.progressiveBackgroundFlag = true;
  /*
    The value of the threshold for the procedure that calculates the threshold
    image. The value should be in the range from 0.0 to 1.0 (float).
  */
  myVida.imageFilterThreshold = 0.2;
  /*
    You may need a horizontal image flip when working with the video camera.
    If you need a different kind of mirror, here are the possibilities:
      [your vida object].MIRROR_NONE
      [your vida object].MIRROR_VERTICAL
      [your vida object].MIRROR_HORIZONTAL
      [your vida object].MIRROR_BOTH
    The default value is MIRROR_NONE.
  */
  myVida.imageFilterInvert;
  
  myVida.mirror = myVida.MIRROR_HORIZONTAL;
  /*
    In order for VIDA to handle active zones (it doesn't by default), we set
    this flag.
  */
  myVida.handleActiveZonesFlag = true;
  /*
    If you want to change the default sensitivity of active zones, use this
    function. The value (floating point number in the range from 0.0 to 1.0)
    passed to the function determines the movement intensity threshold which
    must be exceeded to trigger the zone (so, higher the parameter value =
    lower the zone sensitivity).
  */
  myVida.setActiveZonesNormFillThreshold(0.5);
  /*
    Let's create several active zones. VIDA uses normalized (in the range from
    0.0 to 1.0) instead of pixel-based. Thanks to this, the position and size
    of the zones are independent of any eventual changes in the captured image
    resolution.
  */

  let numberOfActiveZones = sounds.length;
  let padding = 0.07;
  let zoneWidth = 0.1, zoneHeight = 0.5;
  let hOffset = (1.0 - (numberOfActiveZones * zoneWidth + (numberOfActiveZones - 1) * padding)) / 2.0;
  let vOffset = 0.25;
  
  for(let i = 0; i < numberOfActiveZones; i++) {
    /*
      addActiveZone function (which, of course, adds active zones to the VIDA
      object) requires the following parameters:
        [your vida object].addActiveZone(
          _id, // zone's identifier (integer or string)
          _normX, _normY, _normW, _normH, // normalized (!) rectangle
          _onChangeCallbackFunction // callback function (triggered on change)
        );
    */
    myVida.addActiveZone(
      i,
      hOffset + i * (zoneWidth + padding), vOffset, zoneWidth, zoneHeight,
      onActiveZoneChange
    );
  }

  frameRate(30); // set framerate
}

function draw() {
  if(myCapture !== null && myCapture !== undefined) { // safety first
    background(0, 0, 255);
    /*
      Call VIDA update function, to which we pass the current video frame as a
      parameter. Usually this function is called in the draw loop (once per
      repetition).
    */
    myVida.update(myCapture);

    /*
      Now we can display images: source video (mirrored) and subsequent stages
      of image transformations made by VIDA.
    */
    // image(myVida.currentImage, 0, 0);
    // image(myVida.backgroundImage, 320, 0);
    // image(myVida.differenceImage, 0, 240);
    image(myVida.thresholdImage, 0, 0)
    noStroke(); 
    fill(255, 255, 255);
    
    /*
      In this example, we use the built-in VIDA function for drawing zones. We
      use the version of the function with two parameters (given in pixels)
      which are the coordinates of the upper left corner of the graphic
      representation of zones. VIDA is also equipped with a version of this
      function with four parameters (the meaning of the first and second
      parameter does not change, and the third and fourth mean width and height
      respectively). For example, to draw the zones on the entire available
      surface, use the function in this way:
        [your vida object].drawActiveZones(0, 0, width, height);
    */
    myVida.drawActiveZones(0, 0, canvasWidth, canvasHeight);
  }
  else {
    /*
      If there are problems with the capture device (it's a simple mechanism so
      not every problem with the camera will be detected, but it's better than
      nothing) we will change the background color to alarmistically red.
    */
    background(255, 0, 0);
  }
}

/*
  This function is called by VIDA when one of the zones changes status (from
  triggered to free or vice versa). An object that stores zone data is passed
  as the parameter to the function.
*/
function onActiveZoneChange(_vidaActiveZone) {
  /*
    Having access directly to objects that store active zone data, we can read
    or modify the values of individual parameters. Here is a list of parameters
    to which we have access:
      normX, normY, normW, normH - normalized coordinates of the rectangle in
    which active zone is contained (bounding box); you can change these
    parameters if you want to move the zone or change it's size;
      isEnabledFlag - if you want to disable the processing of a given active
    zone without deleting it, this flag will definitely be useful to you; if
    it's value is "true", the zone will be tested, if the variable value is
    "false", the zone will not be tested;
      isMovementDetectedFlag - the value of this flag will be "true" if motion
    is detected within the zone; otherwise, the flag value will be "false";
      isChangedFlag - this flag will be set to "true" if the status (value of
    isMovementDetectedFlag) of the zone has changed in the current frame;
    otherwise, the flag value will be "false";
      changedTime, changedFrameCount - the moment - expressed in milliseconds
    and frames - in which the zone has recently changed it's status (value of
    isMovementDetectedFlag);
      normFillFactor - ratio of the area of the zone in which movement was
    detected to the whole surface of the zone
      normFillThreshold - ratio of the area of the zone in which movement
    was detected to the total area of the zone required to be considered that
    there was a movement detected in the zone; you can modify this parameter
    if you need to be able to set the threshold of the zone individually (as
    opposed to function
    [your vida object].setActiveZonesNormFillThreshold(normVal); 
    which sets the threshold value globally for all zones);
      id - zone identifier (integer or string);
      onChange - a function that will be called when the zone changes status
    (when value of this.isMovementDetectedFlag will be changed); the object
    describing the current zone will be passed to the function as a parameter.
  */
  // print zone id and status to console...
  console.log(`zone: ${_vidaActiveZone.id} status: ${_vidaActiveZone.isMovementDetectedFlag}`);
  playSample(sounds[_vidaActiveZone.id])
}

function playSample(_sample) {
  if(_sample === null) {console.log('[playSample] _sample === null'); return;}
  if(_sample === undefined) {console.log('[playSample] _sample === undefined'); return;}
  if(!_sample.isPlaying()) _sample.play();
}

/*
  Capture current video frame and put it into the VIDA's background buffer.
*/
function touchEnded() {
  if(myCapture !== null && myCapture !== undefined) {
    myVida.setBackgroundImage(myCapture);
    console.log('background set');
    backgroundCapturedFlag = true;
  }
}

var myCapture, // camera
    myVida;    // VIDA

/*
  We will set this flag when we grab the background image. We will use it to
  introduce additional control over the sound (to avoid unnecessary noise the
  sound will not be heard before the background image is captured).
*/
var backgroundCapturedFlag = false;

/*
  We will use the sound in this example (so remember to add the p5.Sound
  library to your project if you want to recreate this). This array will be
  used to store oscillators.
*/
var synth = [];

var sounds = [
  loadSound('mp3/EN_M1_mandolin1.mp3'),
  loadSound('mp3/EN_M1_mldy2.mp3'),
  loadSound('mp3/EN_M1_mldyB4.mp3'),
  loadSound('mp3/EN_M2_mldy3.mp3')
];

let size = {
  width: 640,
  height: 480
}

/*
  Here we are trying to get access to the camera.
*/
function initCaptureDevice() {
  try {
    myCapture = createCapture(VIDEO);
    myCapture.size(size.width, size.height);
    myCapture.elt.setAttribute('playsinline', '');
    myCapture.hide();
    console.log(
      '[initCaptureDevice] capture ready. Resolution: ' +
      myCapture.width + ' ' + myCapture.height
    );
  } catch(_err) {
    console.log('[initCaptureDevice] capture error: ' + _err);
  }
}

function setup() {
  createCanvas(size.width, size.height); // we need some space...
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
  myVida.progressiveBackgroundFlag = false;
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

  var padding = 0.07; var n = sounds.length;
  var zoneWidth = 0.1; var zoneHeight = 0.5;
  var hOffset = (1.0 - (n * zoneWidth + (n - 1) * padding)) / 2.0;
  var vOffset = 0.25;
  for(var i = 0; i < n; i++) {
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
    /*
      For each active zone, we will also create a separate oscillator that we
      will mute/unmute depending on the state of the zone. We use the standard
      features of the p5.Sound library here: the following code just creates an
      oscillator that generates a sinusoidal waveform and places the oscillator
      in the synth array.
    */
    // var osc = new p5.Oscillator();
    // osc.setType('sine');
    // /*
    //   Let's assume that each subsequent oscillator will play 4 halftones higher
    //   than the previous one (from the musical point of view, it does not make
    //   much sense, but it will be enough for the purposes of this example). If
    //   you do not take care of the music and the calculations below seem unclear
    //   to you, you can ignore this part or access additional information , e.g.
    //   here: https://en.wikipedia.org/wiki/MIDI_tuning_standard
    // */
    // osc.freq(440.0 * Math.pow(2.0, (60 + (i * 4) - 69.0) / 12.0));
    // osc.amp(0.0); osc.start();
    // synth[i] = osc;
  }

  frameRate(30); // set framerate
}

let executeOnlyOnce = false;

function draw() {
  if(myCapture !== null && myCapture !== undefined) { // safety first
    background(0, 0, 255);
    /*
      Call VIDA update function, to which we pass the current video frame as a
      parameter. Usually this function is called in the draw loop (once per
      repetition).
    */
    myVida.update(myCapture);
    // if(myCapture !== null && myCapture !== undefined && !executeOnlyOnce) { // safety first
    //   let emptyBackground = createImage(size.width, size.height);
    //   myVida.setBackgroundImage(emptyBackground);
    //   backgroundCapturedFlag = true;
    //   executeOnlyOnce = true
    //   console.log('background set');
    // }
    /*
      Now we can display images: source video (mirrored) and subsequent stages
      of image transformations made by VIDA.
    */
    // image(myVida.currentImage, 0, 0);
    // image(myVida.backgroundImage, 320, 0);
    // image(myVida.differenceImage, 0, 240);
    
    
    // image(myVida.backgroundImage, 0, 0);
    image(myVida.thresholdImage, 0, 0)


    // let's also describe the displayed images
    noStroke(); fill(255, 255, 255);
    // text('camera', 20, 20);
    // text('vida: static background image', 340, 20);
    // text('vida: difference image', 20, 260);
    // text('vida: threshold image', size.width, size.height);
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
    myVida.drawActiveZones(0, 0, size.width, size.height);
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
  console.log(
    'zone: ' + _vidaActiveZone.id + // 0, 1, 2, 3, 4, 5, 6...
    ' status: ' + _vidaActiveZone.isMovementDetectedFlag
  );
  // ... or do something else, e.g., use this information to control the sound:
  // synth[_vidaActiveZone.id].amp(
  //   0.1 * _vidaActiveZone.isMovementDetectedFlag * backgroundCapturedFlag
  // );
  playSample(sounds[_vidaActiveZone.id])
}

function playSample(_sample) { // to start palying mp3 file, instead of _sample we need to out the name of the file like var
  if(_sample === null) {console.log('[playSample] _sample === null'); return;}
  if(_sample === undefined) {console.log('[playSample] _sample === undefined'); return;}
  if(!_sample.isPlaying()) _sample.play();
}

/*
  Capture current video frame and put it into the VIDA's background buffer.
*/
function touchEnded() {
  if(myCapture !== null && myCapture !== undefined) { // safety first
    myVida.setBackgroundImage(myCapture);
    console.log('background set');
    backgroundCapturedFlag = true;
  }
}
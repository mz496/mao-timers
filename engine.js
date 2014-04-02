
var sounds = [
  "sounds/time.mp3",
  "sounds/fifteenseconds.mp3",
  "sounds/secondminute.mp3",
  "sounds/thirdminute.mp3",
  "sounds/fourthminute.mp3",
  "sounds/newminute.mp3",
  "sounds/fifteenminutes.mp3",
  "sounds/fiveminutes.mp3",
  "sounds/oneminute.mp3"
];
var context = null;

// AudioBuffer carriers for all the sounds
var timeBuffer;
var fifteensecondsBuffer;
var secondminuteBuffer;
var thirdminuteBuffer;
var fourthminuteBuffer;
var newminuteBuffer;
var fifteenminutesBuffer;
var fiveminutesBuffer;
var oneminuteBuffer;

window.onload = loadAll;

function loadAll() {
  makeAudioContext();
  loadSound(sounds[0], timeBuffer);
  loadSound(sounds[1], fifteensecondsBuffer);
  loadSound(sounds[2], secondminuteBuffer);
  loadSound(sounds[3], thirdminuteBuffer);
  loadSound(sounds[4], fourthminuteBuffer);
  loadSound(sounds[5], newminuteBuffer);
  loadSound(sounds[6], fifteenminutesBuffer);
  loadSound(sounds[7], fiveminutesBuffer);
  loadSound(sounds[8], oneminuteBuffer);
}

		function playSound(soundBuffer) {
  // argument is the sound carrier, loaded version we're storing
  if (!soundBuffer)
    return;
  var source = context.createBufferSource();
  source.buffer = soundBuffer;
  source.connect(context.destination);
  source.noteOn(0);
}
		
function addStatus(text)
{
  get("status").innerHTML += ("<br>" + text);
}

function makeAudioContext() {
  if (typeof AudioContext !== "undefined") {
      context = new AudioContext();
      addStatus("Created AudioContext");
  }
  else if (typeof webkitAudioContext !== "undefined") {
      context = new webkitAudioContext();
      addStatus("Created webkitAudioContext");
  }
  else
  {
    addStatus("Web Audio API does not appear to be supported");
    return;
  }
}

		function loadSound(soundURL, soundBuffer) {
  // first is the URL, second is the loaded version we're storing

  // AJAX request for the sound file
  var request = new XMLHttpRequest();
  request.open("GET", soundURL, true);
  request.responseType = "arraybuffer";
  request.onload = function () {
    addStatus(soundURL + " loaded, decoding...");
    context.decodeAudioData(request.response, function (buffer_)
    {
      addStatus("Finished decoding audio");
      soundBuffer = buffer_;
    },
    function() { addStatus("Failed to decode") });
  };
  request.send();
  
  playSound(soundBuffer); // test...
}


// filename: root/engine.js

get("BACK_BUTTON").onclick = backButton;
get("TEAM_OPEN").onclick = teamInterface;
get("START_BUTTON").onclick = startButton;
get("STOP_BUTTON").onclick = finish;
get("PAUSE_BUTTON").onclick = pauseButton;
get("REDO_BUTTON").onclick = redoButton;

var time;
var deltaT;
var ticking;

var teamqnum = 1;
var teamstate = "stopped";
// "stopped": the timer is not running at all
// "paused": the timer is on, we do not have the option to go to the next question, but it is not running
// "running": timer is running

/**
          +<--> paused (trigger via Pause or Back)
          |       |
running --+       |
   ^      |       v
   |      +---> stopped (trigger via OoT or Stop)
   |              |
   +--------------+
^ (trigger
via Start
or Resume...)
**/

function get(elem)
{ return document.getElementById(elem); }
/* function loadSound(sound)
{ get(sound).load(); }
function playSound(sound)
{ get(sound).play(); } */


function backButton()
{
  // since getElementByClassName doesn't play well with the code below it, we'll have to add each test style box individually...
  get("team-box").style.display = "none";
  // and pause all the timers unless they're stopped already
  if (teamstate !== "stopped")
    teamstate = "paused";
  get("button-box").style.display = "block";
  get("BACK_BUTTON").style.display = "none";
}

function teamInterface()
{
  get("button-box").style.display = "none";
  get("team-box").style.display = "block";
  get("BACK_BUTTON").style.display = "inline-block";
  // if teamstate happens to be paused already, that's because "back to menu" was pressed while running OR while paused by user
  // pretend we were running as usual and got paused by a mysterious force
  // under user-paused conditions, this doesn't produce any changes
  if (teamstate === "paused")
  {
    teamstate = "running";
    pauseButton();
  }
  // if teamstate happens to be stopped already, it was stopped before "back to menu" OR we have just started
  else
  {
    // initialize things
    time = 240; //240s = 4m
    deltaT = 1000; // actual time between increments of the time variable -- 1000 in normal situation
    // do NOT re-initialize teamqnum! or else redo button breaks!
  }
  
  // load sounds for mobile/iPad upon click
  /* loadSound("time");
  loadSound("fifteenseconds");
  loadSound("secondminute");
  loadSound("thirdminute");
  loadSound("fourthminute"); */
  // play the sound triggered by touchstart so we can enable sound forever
  //playSound("sounds/silence.mp3");
}

function startTimer()
{
  // initial values
  get("min-number").innerHTML = 1;
  get("sec-number").innerHTML = 60;
  get("min-box").style.background = "transparent";
  get("min-number").style.color = "inherit";
  get("sec-box").style.background = "transparent";
  get("sec-number").style.color = "inherit";

  teamstate = "running";
  ticking = setInterval(tick, deltaT);
}
  
function tick()
{
  // makes the timer go
  time--;
 
  // in case we want to switch to time ELAPSED?
  //var timeElapsed = 240 - time;

  // parse time remaining into the divs
  get("min-number").innerHTML = Math.ceil((240 - time)/60);
  get("sec-number").innerHTML = time % 60;
    
  // check if <15sec in the minute
  if (time % 60 <= 15 && time % 60 !== 0)
  {
    // make boxes yellow w/ white text for warning
    get("sec-box").style.background = "#f2c01b";
    get("sec-number").style.color = "#f9f6f2";
  }
  
   // however, secnumber should only read 0 at the end
  if (time % 60 === 0 && time !== 0)
  {
    get("sec-number").innerHTML = 60;
    // new minute starting, reset color
    // advance minute count at 60 (i.e. now) instead of at the 59
    get("min-number").innerHTML++;
    get("sec-box").style.background = "transparent";
    get("sec-number").style.color = "inherit";
  }

  // when time is 0, call finish() and set the seconds to 0
  if (time === 0)
  {
    get("sec-number").innerHTML = 0;
    finish();
  }
  
  // sound handler
  switch(time)
  {
    case 15:
      playSound(fifteensecondsBuffer);
      break;
    case 75:
      playSound(fifteensecondsBuffer);
      break;
    case 135:
      playSound(fifteensecondsBuffer);
      break;
    case 195:
      playSound(fifteensecondsBuffer);
      break;
    case 180:
      playSound(secondminuteBuffer);
      break;
    case 120:
      playSound(thirdminuteBuffer);
      break;
    case 60:
      playSound(fourthminuteBuffer);
      break;
    case 0:
      playSound(timeBuffer);
      break;
  }
}

function startButton()
{
  // remake the buttons
  get("START_BUTTON").style.display = "none";
  get("ghost-button").style.display = "inline-block";
  get("REDO_BUTTON").style.display = "none";
  // start the timer and let it goooo
  startTimer();
}

function pauseButton()
{
  // running --> paused section
  if (teamstate === "running")
  {
    teamstate = "paused";
    // remove interval for now, to be replaced
    clearInterval(ticking);
    get("PAUSE_BUTTON").innerHTML = "Resume...";
  }
  
  // paused --> running section
  else if (teamstate === "paused")
  {
    teamstate = "running";
    // remake interval
    ticking = setInterval(tick, deltaT);
    get("PAUSE_BUTTON").innerHTML = "Pause";
  }
}

function redoButton()
{
  // precondition: stopped position
  // postcondition: decrease teamqnum by 1 so we would start the previous question; can't go past 1
  if (teamqnum > 1)
  {
    teamqnum--;
    get("start-button-num").innerHTML = "Question " + teamqnum;
    get("team-current-num").innerHTML = "Question " + teamqnum;
  }
}

function finish()
{
  // can be user initiated stop, or out of time (OoT)
  clearInterval(ticking);
  // now only reset once
  if (teamstate === "running" || teamstate === "paused")
  {
    // make the boxes red so they're noticeable
    get("min-box").style.background = "#f72d23";
    get("sec-box").style.background = "#f72d23";
    get("min-number").style.color = "#f9f6f2";
    get("sec-number").style.color = "#f9f6f2";
    
    // let user advance, using the same parameters we've been using
    reset();
    teamstate = "stopped";
    // show the redo button
    get("REDO_BUTTON").style.display = "inline-block";
  }
}

function reset()
{
  // advance question number for the start button, reset time, reset pause button
  if (teamqnum < 15)
    teamqnum++;
  
  get("START_BUTTON").style.display = "inline-block";
  get("ghost-button").style.display = "none";
  get("start-button-num").innerHTML = "Question " + teamqnum;
  get("team-current-num").innerHTML = "Question " + teamqnum;
  get("PAUSE_BUTTON").innerHTML = "Pause";
  time = 240;
}

/***********************************************\
    INDIVIDUAL
\***********************************************/

function indivInterface()
{
  
}

/***********************************************\
    SOUND HANDLERS
\***********************************************/

///////////////////////////////////////////////
// Create sound buffers for each sound

/*(function () {
  var context = null;
  var buffer = null;
  
  function addStatus(msg)
  {
    jQuery("#status").append("<br/>" + msg);
  };
		
  window.onerror = function(errorMsg, url, lineNumber) {
    addStatus("JAVASCRIPT ERROR: " + errorMsg + " (" + url + ", line " + lineNumber + ")");
  };
  
  function decodeError() {
    addStatus("Error in decodeAudioData");
  };
  
  function playSound(soundBuffer) {
    if (!soundBuffer)
      return;
    
    var source = context.createBufferSource();			source.buffer = soundBuffer;			source.connect(context.destination);			source.noteOn(0);
  };
		
  jQuery(document).ready(function () {
    if (typeof AudioContext !== "undefined")
    {
      context = new AudioContext();
      addStatus("Created AudioContext");
    }
    else if (typeof webkitAudioContext !== "undefined")
    {
      context = new webkitAudioContext();				addStatus("Created webkitAudioContext");
    }
    else
    {
      addStatus("Web Audio API does not appear to be supported");
      return;
    }
		
    // AJAX request sound.m4a
    var request = new XMLHttpRequest();
    request.open("GET", "sound.m4a", true);			request.responseType = "arraybuffer";
    request.onload = function () {				
      addStatus("sound.m4a loaded, decoding...");
      context.decodeAudioData(request.response, function (buffer_) {
        addStatus("Finished decoding audio");
        buffer = buffer_;
      }, decodeError);
    };
    
    request.send();
  });
})();*/

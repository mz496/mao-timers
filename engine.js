// filename: root/engine.js

get("BACK_BUTTON").onclick = backButton;
get("TEAM_OPEN").onclick = teamInterface;
get("TEAM_OPEN").touchstart = teamInterface;
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
  playSound("sounds/silence.mp3");
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
      playSound("sounds/fifteenseconds.mp3");
      break;
    case 75:
      playSound("sounds/fifteenseconds.mp3");
      break;
    case 135:
      playSound("sounds/fifteenseconds.mp3");
      break;
    case 195:
      playSound("sounds/fifteenseconds.mp3");
      break;
    case 180:
      playSound("sounds/secondminute.mp3");
      break;
    case 120:
      playSound("sounds/thirdminute.mp3");
      break;
    case 60:
      playSound("sounds/fourthminute.mp3");
      break;
    case 0:
      playSound("sounds/time.mp3");
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

// BufferLoader class
function BufferLoader(context, urlList, callback) {
    this.context = context;
    this.urlList = urlList;
    this.onload = callback;
    this.bufferList = [];
    this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
    // Load buffer asynchronously
    var request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";

    var loader = this;

    request.onload = function() {
        // Asynchronously decode the audio file data in request.response
        loader.context.decodeAudioData(
            request.response,
            function(buffer) {
                if (!buffer) {
                    alert('error decoding file data: ' + url);
                    return;
                }
                loader.bufferList[index] = buffer;
                if (++loader.loadCount == loader.urlList.length)
                    loader.onload(loader.bufferList);
            }    
        );
    };

    request.onerror = function() {
        alert('BufferLoader: XHR error');        
    };

    request.send();
};

BufferLoader.prototype.load = function() {
    for (var i = 0; i < this.urlList.length; ++i)
        this.loadBuffer(this.urlList[i], i);
};
///////////////////////////////////////////////
// Create sound buffers for each sound

window.onload = init;
var context;
var bufferLoader;
var soundsloaded;

function init() {
  // Fix up prefixing
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  bufferLoader = new BufferLoader(
    context,
    [
      "sounds/silence.mp3",
      "sounds/time.mp3",
      "sounds/fifteenseconds.mp3",
      "sounds/secondminute.mp3",
      "sounds/thirdminute.mp3",
      "sounds/fourthminute.mp3",
      "sounds/newminute.mp3",
      "sounds/fifteenminutes.mp3",
      "sounds/fiveminutes.mp3",
      "sounds/oneminute.mp3"
    ],
    finishedLoading
    );

  bufferLoader.load();
}

// this function has no use yet since we don't need the sounds as soon as they load
function finishedLoading() { soundsloaded = true;  get("title").style.color = "red"; }

function playSound(soundBuffer) {
  // create a source with the sound's buffer (which is just the filename) and play it
  var source = context.createBufferSource();
  source.buffer = soundBuffer;
  source.connect(context.destination);
  source.noteOn(0);
}
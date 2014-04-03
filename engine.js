window.onerror = function(errorMsg, url, lineNumber) {
    get("status").innerHTML += ("<br> JAVASCRIPT ERROR: " + errorMsg + " (" + url + ", line " + lineNumber + ")");
};

function addStatus(msg) {
  get("status").innerHTML += "<br>" + msg;
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
    deltaT = 200; // actual time between increments of the time variable -- 1000 in normal situation
    // do NOT re-initialize teamqnum! or else redo button breaks!
  }
  
  // play the sound triggered by touchstart so we can enable sound forever
  if (WAAPIsupport === true)
    playAlert('silent', {});
  else
    insertAudios();
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
  
  // sound handler
  if (WAAPIsupport === true)
  {
    switch(time)
    {
      case 15:
        playAlert('fifteenseconds', {});
        break;
      case 75:
        playAlert('fifteenseconds', {});
        break;
      case 135:
        playAlert('fifteenseconds', {});
        break;
      case 195:
        playAlert('fifteenseconds', {});
        break;
      case 180:
        playAlert('secondminute', {});
        break;
      case 120:
        playAlert('thirdminute', {});
        break;
      case 60:
        playAlert('fourthminute', {});
        break;
      case 0:
        playAlert('time', {});
        break;
    }
  }
  else // does this work? each value for the keyed file-name is an Element
  {
    switch(time)
    {
      case 15:
        audioDict.audio.fifteenseconds.play();
        break;
      case 75:
        audioDict.audio.fifteenseconds.play();
        break;
      case 135:
        audioDict.audio.fifteenseconds.play();
        break;
      case 195:
        audioDict.audio.fifteenseconds.play();
        break;
      case 180:
        audioDict.audio.secondminute.play();
        break;
      case 120:
        audioDict.audio.thirdminute.play();
        break;
      case 60:
        audioDict.audio.fourthminute.play();
        break;
      case 0:
        audioDict.audio.time.play();
        break;
    }
  }
  
  // when time is 0, call finish() and set the seconds to 0
  if (time === 0)
  {
    get("sec-number").innerHTML = 0;
    finish();
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

var audioDict = {};
audioDict.audioBuffersByName = {};
audioDict.audio_src = {};

var audioURLsByName = {
  silent: 'sounds/silent.mp3',
  time: 'sounds/time.mp3',
  fifteenseconds: 'sounds/fifteenseconds.mp3',
  secondminute: 'sounds/secondminute.mp3',
  thirdminute: 'sounds/thirdminute.mp3',
  fourthminute: 'sounds/fourthminute.mp3',
  newminute: 'sounds/newminute.mp3',
  fifteenminutes: 'sounds/fifteenminutes.mp3',
  fiveminutes: 'sounds/fiveminutes.mp3',
  oneminute: 'sounds/oneminute.mp3'
};

// WAAPI supported section
var WAAPIsupport = false;

if (typeof webkitAudioContext !== 'undefined') {
  var audio_ctx = new webkitAudioContext();
  WAAPIsupport = true;
  addStatus("Created webkitAudioContext");
}
else if (typeof AudioContext !== "undefined") {
  var audio_ctx = new AudioContext();
  WAAPIsupport = true;
  addStatus("Created AudioContext");
}
else
  addStatus("No Web Audio support");
   
function loadMusic(url, cb) {
  var req = new XMLHttpRequest();
  req.open('GET', url, true);
  // XHR2
  req.responseType = 'arraybuffer';
 
  req.onload = function() {
    audio_ctx.decodeAudioData(req.response, cb);
  };
 
  req.send();
}

var loadAudioData = function(name, url) {
  // Async
  loadMusic(url, function(buffer) {
    audioDict.audioBuffersByName[name] = buffer;
  });
 
};

// audioURLsByName is the one storing the names vs urls
if (WAAPIsupport === true) {
  for (var name in audioURLsByName) {
    var url = audioURLsByName[name];
    loadAudioData(name, url);
    addStatus("Loaded " + name);
  }
}


function playSound (buffer, opt, cb) {
  if (!opt) cb = opt;
  opt = opt || {};
 
  var src = audio_ctx.createBufferSource();
  src.buffer = buffer;
  
  // for firefox -- make gain_node global w/in this function
  try { gain_node = audio_ctx.createGainNode(); }
  catch (e) {
    if (e instanceof TypeError)
      gain_node = audio_ctx.createGain();
  }
  src.connect(gain_node);
   
  gain_node.connect(audio_ctx.destination);
  //console.log(gain_node);
 
  if (typeof opt.sound !== 'undefined')
    gain_node.gain.value = opt.sound;
  else
    gain_node.gain.value = 1;
 
  // Options
  if (opt.loop)
    src.loop = true;
  
  // for the old browsers
  try { src.start(0); }
  catch (e) {
    if (e instanceof TypeError)
      src.noteOn(0);
  }
 
  cb(src);
}
 
function stopSound (src) {
try { src.stop(0); }
  catch (e) {
    if (e instanceof TypeError)
      src.noteOff(0);
  }
}

function playAlert(name, opt) {
  opt = opt || {};
 
  var cb = function(src) {
    audioDict.audio_src[name] = {};
    audioDict.audio_src[name] = src;
  };
  
  playSound( audioDict.audioBuffersByName[name], opt, cb );
  addStatus("Played " + name);
}

// stopSound(audioDict.audio_src[name]);

function insertAudios()
{
  for (var name in audioURLsByName) {
    var url = audioURLsByName[name];
    // Create an audio node
    var audio_el = document.createElement('audio');
    // Source nodes for mp3 and ogg
    var src1_el = document.createElement('source');
    //var src2_el = document.createElement('source');

    audio_el.id = name;
    src1_el.src = url;
    src1_el.type = 'audio/mp3';
    //src2_el.src = url.replace('.mp3', '.ogg');
    //src2_el.type = 'audio/ogg';

    // Append OGG first (else firefox cries)
    //audio_el.appendChild(src2_el);
    // Append MP3 second/next
    audio_el.appendChild(src1_el);

    document.body.appendChild(audio_el);

    audioDict.audioBuffersByName[name] = audio_el;
    addStatus("html5 fallback added " + name);
  }
}
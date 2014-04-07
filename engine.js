// filename: root/engine.js

/*window.onerror = function(errorMsg, url, lineNumber) {
    get("status").innerHTML += ("<br> JAVASCRIPT ERROR: " + errorMsg + " (" + url + ", line " + lineNumber + ")");
};*/

function addStatus(msg) {
  //get("status").innerHTML += "<br>" + msg;
}

// colors
var red = "#f72d23";
var orange = "#f4771f";
var yellow = "#f2c01b";
var gray = "#696969";
var whitish = "#f9f6f2";

/**
          +<--> paused (trigger via Pause or Back)
          |       |
running --+       |
   ^      |       v
   |      +---> stopped (trigger via OoT or Stop)
   |              |
   +---next q.----+
^ (trigger
via Start
or Resume)
**/

function get(elem)
{ return document.getElementById(elem); }

function back() {
  // revert title
  get("title").innerHTML = "MA&#920; Timers";
  // since getElementByClassName doesn't play well with the code below it, we'll have to add each test style box individually...
  get("team-box").style.display = "none";
  get("ciphering-box").style.display = "none";
  get("relay-box").style.display = "none";

  // and pause all the timers unless they're stopped already
  if (team.getState() !== "stopped")
    team.setState("paused");
  if (ciphering.getState() !== "stopped")
    ciphering.setState("paused");
  if (relay.getState() !== "stopped")
    relay.setState("paused");

  get("button-box").style.display = "block";
  get("back-button").style.display = "none";
}

// for "round-based" schemes -- team, ciphering, relay
function RoundTimer(title, secondsPerQuestion, secondsPerRound, numQuestions, timerContainer, roundBox, roundElement, secondsBox, secondsElement, startButton, startButtonElement, ghostButton, ghostButtonElement, pauseButton, stopButton, redoButtonWrapper, soundDict) {
  var currentState = "stopped";
  var HTML5SoundInserted = false;
  this.sounds = soundDict;

  this.numQuestions = numQuestions;
  var currentQnum = 1;

  var self = this; // very important for setInterval
  var ticking;
  var time = secondsPerQuestion;
  var deltaT = 200; // actual time (ms) between increments of the time variable -- 1000 in normal situation

  this.makeInterface = function() {
    // triggers upon click of the test type button
    get("title").innerHTML = title;
    get("button-box").style.display = "none";
    get(timerContainer).style.display = "block";
    get("back-button").style.display = "inline-block";
    // if currentState happens to be paused already, that's because "back to menu" was pressed while running OR while paused by user
    // pretend we were running as usual and got paused by a mysterious force
    // under user-paused conditions, this doesn't produce any changes
    if (currentState === "paused")
    {
      currentState = "running";
      self.pause();
    }
    // if currentState happens to be stopped already, it was stopped before "back to menu" OR we have just started
    
    if (WAAPIsupport === true)
      playSound('silent');
    else if (HTML5SoundInserted === false) {
      insertAudios();
      HTML5SoundInserted = true;
    }
  };

  function parseSeconds(currentTime) {
    // makes a permanent min:sec timer, so only call this when the starting time is over 60
    // returns the (min):(sec) string
    var currentTimeThisRound = currentTime % secondsPerRound;
    if (currentTimeThisRound === 0)
      currentTimeThisRound = secondsPerRound; // do not start at x:59 sec
    var minThisRound = Math.floor(currentTimeThisRound/60); // compare to the roundElement statement in tick
    var secThisRound = currentTimeThisRound - 60*minThisRound;
    if (secThisRound < 10)
      secThisRound = "0" + secThisRound;
    return minThisRound + ":" + secThisRound;
  };

  this.start = function() {
    // called upon clicking -- initialize appearances, start timer
    var roundNumSize = parseFloat(window.getComputedStyle(get(roundElement), null).getPropertyValue("font-size"));
    // making sizes relative for adaptation to mobile devices
    get(roundElement).innerHTML = 1;
    if (secondsPerRound <= 60) {
      get(secondsElement).innerHTML = secondsPerRound;
      get(secondsElement).style.fontSize = 0.6*roundNumSize + "px";
    }
    else {
      get(secondsElement).innerHTML = parseSeconds(secondsPerRound);
      get(secondsElement).style.fontSize = 0.375*roundNumSize + "px";
    }

    get(roundBox).style.background = "transparent";
    get(roundElement).style.color = "inherit";
    get(secondsBox).style.background = "transparent";
    get(secondsElement).style.color = "inherit";

    get(startButton).style.display = "none";
    get(ghostButton).style.display = "inline-block";
    get(redoButtonWrapper).style.display = "none"; // we use the wrapper so we can apply css to the CLASS of all redo wrappers but get the ID of the "button" here

    currentState = "running";
    ticking = setInterval(function() { self.tick() }, deltaT);
  };

  this.tick = function() {
    // timer's actual mechanism
    time--;

    // only check for time warn every 15 sec since all warnings occur at 15sec, 1min 2min, etc.
    if (time % 15 === 0) {
      console.log("running warn");
      this.warn();
    }
    // time warnings are handled inside children

    // parse time remaining into the divs
    get(roundElement).innerHTML = Math.ceil((secondsPerQuestion - time)/secondsPerRound);
    if (secondsPerRound <= 60)
      get(secondsElement).innerHTML = time % secondsPerRound;
    else
      get(secondsElement).innerHTML = parseSeconds(time);
    
    // 15 SECONDS!
    if (time % secondsPerRound <= 15 && time % secondsPerRound !== 0) {
      get(secondsBox).style.background = yellow;
      get(secondsElement).style.color = whitish;
    }
    
     // NEW ROUND!
    if (time % secondsPerRound === 0 && time !== 0) {
      // reset colors, advance minute at secondsPerRound not minus 1
      if (secondsPerRound <= 60)
        get(secondsElement).innerHTML = secondsPerRound;
      else
        get(secondsElement).innerHTML = parseSeconds(secondsPerRound);
      get(roundElement).innerHTML++;
      get(secondsBox).style.background = "transparent";
      get(secondsElement).style.color = "inherit";
    }
  
    // TIME!
    if (time === 0) {
      if (secondsPerRound <= 60)
        get(secondsElement).innerHTML = 0;
      else
        get(secondsElement).innerHTML = "0:00";
      this.finish();
    }
  };

  this.pause = function() {
    // running --> paused section
    if (currentState === "running") {
      currentState = "paused";
      // remove interval for now, to be replaced
      clearInterval(ticking);
      get(pauseButton).innerHTML = "Resume";
    }
    
    // paused --> running section
    else if (currentState === "paused") {
      currentState = "running";
      // remake interval
      ticking = setInterval(function() { self.tick() }, deltaT);
      get(pauseButton).innerHTML = "Pause";
    }
  };

  this.redo = function() {
    // precondition: stopped position
    // postcondition: decrease currentQnum by 1 so we would start the previous question; can't go past 1
    if (currentQnum > 1) {
      currentQnum--;
      get(startButtonElement).innerHTML = "Question " + currentQnum;
      get(ghostButtonElement).innerHTML = "Question " + currentQnum;
    }
  };

  this.finish = function() {
    // can be user initiated stop, or out of time (OoT)
    clearInterval(ticking);
    // now only reset once
    if (currentState === "running" || currentState === "paused") {
      get(roundBox).style.background = red;
      get(secondsBox).style.background = red;
      get(roundElement).style.color = whitish;
      get(secondsElement).style.color = whitish;
      
      // let user advance, using the same parameters we've been using
      currentState = "stopped";
      
      if (currentQnum < numQuestions)
      currentQnum++;

      // reset section
      get(startButton).style.display = "inline-block";
      get(ghostButton).style.display = "none";
      get(redoButtonWrapper).style.display = "inline-block";
      get(startButtonElement).innerHTML = "Question " + currentQnum;
      get(ghostButtonElement).innerHTML = "Question " + currentQnum;
      get(pauseButton).innerHTML = "Pause";
      time = secondsPerQuestion;
    }
  };

  this.warn = function() {
    // loop through keys to see if current time matches any; if so, play that sound
    for (var key in this.sounds) {
      if (key === this.getTime()) {
        if (WAAPIsupport === true) 
          playSound(this.sounds[key]);
        else
          playHTML5Sound(this.sounds[key]);
      }
    }
  };

  this.getTime = function() { return time; };
  this.getState = function() { return currentState; };
  this.setState = function(state) { currentState = state; };
}

function TeamTimer() {};
function CipheringTimer() {};
function RelayTimer() {};

teamSounds = {
  15: "fifteenseconds",
  75: "fifteenseconds",
  135: "fifteenseconds",
  195: "fifteenseconds",
  180: "secondminute",
  120: "thirdminute",
  60: "fourthminute",
  0: "time"
};

TeamTimer.prototype = new RoundTimer("Team Round", 240, 60, 15, "team-box", "team-min-box", "team-min-number", "team-sec-box", "team-sec-number", "team-start-button", "team-start-button-num", "team-ghost-button", "team-ghost-button-num", "team-pause-button", "team-stop-button", "team-redo-button-wrapper", teamSounds);
CipheringTimer.prototype = new RoundTimer("Ciphering Round", 180, 60, 10, "ciphering-box", "ciphering-min-box", "ciphering-min-number", "ciphering-sec-box", "ciphering-sec-number", "ciphering-start-button", "ciphering-start-button-num", "ciphering-ghost-button", "ciphering-ghost-button-num", "ciphering-pause-button", "ciphering-stop-button", "ciphering-redo-button-wrapper");
RelayTimer.prototype = new RoundTimer("Relay Test", 360, 120, 10, "relay-box", "relay-round-box", "relay-round-number", "relay-sec-box", "relay-sec-number", "relay-start-button", "relay-start-button-num", "relay-ghost-button", "relay-ghost-button-num", "relay-pause-button", "relay-stop-button", "relay-redo-button-wrapper");

team = new TeamTimer();
ciphering = new CipheringTimer();
relay = new RelayTimer();

get("back-button").onclick = back;

get("team-open").onclick = team.makeInterface;
get("team-start-button").onclick = team.start;
get("team-stop-button").onclick = team.finish;
get("team-pause-button").onclick = team.pause;
get("team-redo-button").onclick = team.redo;

get("ciphering-open").onclick = ciphering.makeInterface;
get("ciphering-start-button").onclick = ciphering.start;
get("ciphering-stop-button").onclick = ciphering.finish;
get("ciphering-pause-button").onclick = ciphering.pause;
get("ciphering-redo-button").onclick = ciphering.redo;

get("relay-open").onclick = relay.makeInterface;
get("relay-start-button").onclick = relay.start;
get("relay-stop-button").onclick = relay.finish;
get("relay-pause-button").onclick = relay.pause;
get("relay-redo-button").onclick = relay.redo;

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


function playBuffer (buffer, opt, cb) {
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

function playSound(name, opt) {
  opt = opt || {};
 
  var cb = function(src) {
    audioDict.audio_src[name] = {};
    audioDict.audio_src[name] = src;
  };
  
  playBuffer(audioDict.audioBuffersByName[name], opt, cb);
  addStatus("Played " + name);
}

// stopSound(audioDict.audio_src[name]);

function insertAudios() {
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

function playHTML5Sound(name) {
  audioDict.audioBuffersByName[name].play();
  addStatus("Played HTML5 " + name);
}
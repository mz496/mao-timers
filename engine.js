// filename: root/engine.js

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
  // since getElementByClassName doesn't play well with the code below it, we'll have to add each test style box individually... see makeInterface for behavior
  if (team.getState() !== "stopped")
    team.pause();
  if (ciphering.getState() !== "stopped")
    ciphering.pause();
  if (relay.getState() !== "stopped")
    relay.pause();
  if (indiv.getState() !== "stopped")
    indiv.startpause();
  if (hustle.getState() !== "stopped")
    hustle.startpause();
  if (continuous.getState() !== "stopped")
    continuous.startpause();

  get("team-box").style.display = "none";
  get("ciphering-box").style.display = "none";
  get("relay-box").style.display = "none";
  get("indiv-box").style.display = "none";
  get("hustle-box").style.display = "none";
  get("continuous-box").style.display = "none";

  get("button-box").style.display = "block";
  get("back-button").style.display = "none";
}

/******************************************************************\
      ROUND TIMER
      for "round-based" schemes -- team, ciphering, relay
\******************************************************************/

function RoundTimer(title, secondsPerQuestion, secondsPerRound, numQuestions, timerContainer, roundBox, roundElement, secondsBox, secondsElement, startButton, startButtonElement, ghostButton, ghostButtonElement, pauseButton, stopButton, redoButtonWrapper, soundDict) {
  var currentState = "stopped";
  var HTML5SoundInserted = false;
  this.sounds = soundDict;

  this.numQuestions = numQuestions;
  var currentQnum = 1;

  var self = this; // very important for setInterval
  var ticking;
  var time = secondsPerQuestion;
  var deltaT = 50; // actual time (ms) between increments of the time variable -- 1000 in normal situation

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
    // returns the (min):(sec) string for currentTime, or just the seconds in the minute for times less than 1 minute
    if (secondsPerRound <= 60) {
      var currentTimeThisRound = currentTime % secondsPerRound;
      if (currentTimeThisRound === 0)
        currentTimeThisRound = 60;
      return currentTimeThisRound;
    }
    else {
      var currentTimeThisRound = currentTime % secondsPerRound;
      if (currentTimeThisRound === 0)
        currentTimeThisRound = secondsPerRound; // do not start at x:59 sec
      var minThisRound = Math.floor(currentTimeThisRound/60); // compare to the roundElement statement in tick
      var secThisRound = currentTimeThisRound - 60*minThisRound;
      if (secThisRound < 10)
        secThisRound = "0" + secThisRound;
      return minThisRound + ":" + secThisRound;
    }
  };

  this.start = function() {
    // called upon clicking -- initialize appearances, start timer
    var roundNumSize = parseFloat(window.getComputedStyle(get(roundElement), null).getPropertyValue("font-size"));
    // making sizes relative for adaptation to mobile devices
    get(roundElement).innerHTML = 1;
    get(secondsElement).innerHTML = parseSeconds(secondsPerRound);
    if (secondsPerRound <= 60)
      get(secondsElement).style.fontSize = 0.6*roundNumSize + "px";
    else
      get(secondsElement).style.fontSize = 0.375*roundNumSize + "px";

    get(roundBox).style.background = "transparent";
    get(roundElement).style.color = "inherit";
    get(secondsBox).style.background = "transparent";
    get(secondsElement).style.color = "inherit";

    get(startButton).style.display = "none";
    get(ghostButton).style.display = "inline-block";
    get(redoButtonWrapper).style.display = "none"; // we use the wrapper so we can have css for the CLASS of all redo wrappers but get the "ID" here

    currentState = "running";
    ticking = setInterval(function() { self.tick() }, deltaT);
  };

  this.tick = function() {
    // timer's actual mechanism
    time--;

    // parse time remaining into the divs
    get(roundElement).innerHTML = Math.ceil((secondsPerQuestion - time)/secondsPerRound);
    get(secondsElement).innerHTML = parseSeconds(time);
    
    // 15 SECONDS!
    if (time % secondsPerRound === 15) {
      get(secondsBox).style.background = yellow;
      get(secondsElement).style.color = whitish;
    }
    
     // NEW ROUND!
    if (time % secondsPerRound === 0 && time !== 0) {
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

    // check warnings every 15 seconds to accommodate all test types
    if (time % 15 === 0)
      this.warn();
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
      get(roundBox).style.background = gray;
      get(secondsBox).style.background = gray;
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
    for (var key in self.sounds) {
      if (key == this.getTime()) {
        if (WAAPIsupport === true) 
          playSound(self.sounds[key]);
        else
          playHTML5Sound(self.sounds[key]);
      }
    }
  };

  this.getTime = function() { return time; };
  this.getState = function() { return currentState; };
  this.setState = function(state) { currentState = state; };
}

/******************************************************************\
      EXTENDED TIMER
      for extended/continuous schemes --
      individual, speed, mental, hustle, continuous
\******************************************************************/

function ExtendedTimer(title, secondsTotal, timerContainer, roundBox, roundElement, secondsPerRound, secondsBox, secondsElement, startPauseButton, resetButton, soundDict) {
  // roundBox and roundElement only apply to hustle and continuous, else those arguments are null
  // secondsPerRound is only taken into account if roundBox and roundElement are
  var currentState = "stopped";
  var HTML5SoundInserted = false;
  this.sounds = soundDict;

  var self = this; // very important for setInterval
  var ticking;
  var time = secondsTotal;
  var deltaT = 50; // actual time (ms) between increments of the time variable -- 1000 in normal situation

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
      self.startpause();
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
    // returns the (min):(sec) string for currentTime; for times over 10 minutes
    if (roundBox == null && roundElement == null) {
      var min = Math.floor(currentTime/60);
      var sec = currentTime % 60;
      if (min < 10)
        min = "0" + min;
      if (sec < 10)
        sec = "0" + sec;
      return min + ":" + sec;
    }
    else {
      // similar to parseSeconds from team timer
      if (secondsPerRound <= 60) {
        var currentTimeThisRound = currentTime % secondsPerRound;
        if (currentTimeThisRound === 0)
          currentTimeThisRound = 60;
        return currentTimeThisRound;
      }
      else {
        var currentTimeThisRound = currentTime % secondsPerRound;
        if (currentTimeThisRound === 0)
          currentTimeThisRound = secondsPerRound; // do not start at x:59 sec
        var minThisRound = Math.floor(currentTimeThisRound/60); // compare to the roundElement statement in tick
        var secThisRound = currentTimeThisRound - 60*minThisRound;
        if (secThisRound < 10)
          secThisRound = "0" + secThisRound;
        return minThisRound + ":" + secThisRound;
      }
    }
  }

  if (roundElement != null)
    var roundNumSize = parseFloat(window.getComputedStyle(get(roundElement), null).getPropertyValue("font-size"));

  this.tick = function() {
    // timer's actual mechanism
    time--;

    // parse time remaining into the divs
    if (roundBox == null && roundElement == null) {
      get(secondsElement).innerHTML = parseSeconds(time);

      // 15 MINUTES!
      if (time === 15*60) {
        get(secondsBox).style.background = yellow;
        get(secondsElement).style.color = whitish;
      }

      // 5 MINUTES!
      if (time === 5*60)
        get(secondsBox).style.background = orange;

      // 1 MINUTE!
      if (time === 60)
        get(secondsBox).style.background = red;

      // TIME!
      if (time === 0) {
        get(secondsElement).innerHTML = "00:00";
        this.finish();
      }
    }
    else {
      // similar to the team timer's parsing of time
      var roundNumber = Math.ceil((secondsTotal - time)/secondsPerRound);
      get(roundElement).innerHTML = roundNumber;
      if (roundNumber >= 10)
        get(roundElement).style.fontSize = 0.6*roundNumSize + "px";
      if (roundNumber >= 100)
        get(roundElement).style.fontSize = 0.375*roundNumSize + "px";
      get(secondsElement).innerHTML = parseSeconds(time);

      // 1 MINUTE!
      if (time % secondsPerRound === 60) {
        get(secondsBox).style.background = yellow;
        get(secondsElement).style.color = whitish;
      }

      // 15 SECONDS!
      if (time % secondsPerRound === 15)
        get(secondsBox).style.background = orange;

      // NEW ROUND!
      if (time % secondsPerRound === 0 && time !== 0) {
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
    }

    // check warnings every 15 seconds
    if (time % 15 === 0)
      this.warn();
  };

  this.startpause = function() {
    // called upon clicking -- initialize appearances, start timer
    // running --> paused section
    if (currentState === "running") {
      currentState = "paused";
      // remove interval for now, to be replaced
      clearInterval(ticking);
      get(startPauseButton).innerHTML = "Resume";
    }
    // paused --> running section
    else if (currentState === "paused") {
      currentState = "running";
      // remake interval
      ticking = setInterval(function() { self.tick() }, deltaT);
      get(startPauseButton).innerHTML = "Pause";
    }

    else {
      // standard start
      if (roundBox == null && roundElement == null) {
        get(startPauseButton).innerHTML = "Pause";

        currentState = "running";
        ticking = setInterval(function() { self.tick() }, deltaT);
      }
      else {
        //var roundNumSize = parseFloat(window.getComputedStyle(get(roundElement), null).getPropertyValue("font-size"));
        // making sizes relative for adaptation to mobile devices
        get(roundElement).innerHTML = 1;
        get(secondsElement).innerHTML = parseSeconds(secondsPerRound);

        if (secondsPerRound <= 60)
          get(secondsElement).style.fontSize = 0.6*roundNumSize + "px";
        else
          get(secondsElement).style.fontSize = 0.375*roundNumSize + "px";

        get(roundBox).style.background = "transparent";
        get(roundElement).style.color = "inherit";

        currentState = "running";
        ticking = setInterval(function() { self.tick() }, deltaT);
        get(startPauseButton).innerHTML = "Pause";
      }
    }
  };

  this.finish = function() {
    // only triggered upon running out of time (OoT)
    clearInterval(ticking);
    // now only reset once
    get(secondsBox).style.background = gray;
    get(secondsElement).style.color = whitish;
    if (roundBox != null) {
      get(roundBox).style.background = gray;
      get(roundElement).style.color = whitish;
    }
    get(startPauseButton).style.display = "none";

    currentState = "stopped";
  };

  this.reset = function() {
    // reset section formerly in finish()
    // simply make it look like it did when just opened
    clearInterval(ticking);
    get(startPauseButton).innerHTML = "Start";
    get(startPauseButton).style.display = "inline-block";
    get(secondsElement).innerHTML = parseSeconds(secondsTotal);
    time = secondsTotal;
    currentState = "stopped";
    get(secondsBox).style.background = "transparent";
    get(secondsElement).style.color = "inherit";
  }

  this.warn = function() {
    // loop through keys to see if current time matches any; if so, play that sound
    for (var key in self.sounds) {
      if (key == this.getTime()) {
        if (WAAPIsupport === true) 
          playSound(self.sounds[key]);
        else
          playHTML5Sound(self.sounds[key]);
      }
    }
  };

  this.getTime = function() { return time; };
  this.getState = function() { return currentState; };
  this.setState = function(state) { currentState = state; };
  // these methods are for inherited continuousTimer
  this.parseSeconds_ = function(currentTime) { return parseSeconds(currentTime); };
  this.clearTicking = function() { clearInterval(ticking); };
}

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
cipheringSounds = {
  15: "fifteenseconds",
  75: "fifteenseconds",
  135: "fifteenseconds",
  120: "secondminute",
  60: "thirdminute",
  0: "time"
};
relaySounds = {
  15: "fifteenseconds",
  135: "fifteenseconds",
  255: "fifteenseconds",
  240: "secondminute",
  120: "fourthminute",
  0: "time"
};

indivSounds = {
  900: "fifteenminutes",
  300: "fiveminutes",
  60: "oneminute",
  0: "time"
};
hustleSounds = {
  15: "fifteenseconds",
  315: "fifteenseconds",
  615: "fifteenseconds",
  915: "fifteenseconds",
  1215: "fifteenseconds",
  60: "oneminute",
  360: "oneminute",
  660: "oneminute",
  960: "oneminute",
  1260: "oneminute",
  1200: "secondround",
  900: "thirdround",
  600: "fourthround",
  300: "fifthround",
  0: "time"
};
continuousSounds = {
  15: "fifteenseconds",
  0: "newminute"
};


function ContinuousTimer(title, secondsTotal, timerContainer, roundBox, roundElement, secondsPerRound, secondsBox, secondsElement, startPauseButton, resetButton, soundDict) {
  ExtendedTimer.call(this, title, secondsTotal, timerContainer, roundBox, roundElement, secondsPerRound, secondsBox, secondsElement, startPauseButton, resetButton, soundDict);
  var time = this.getTime();
  var self = this;
  var roundNumSize = parseFloat(window.getComputedStyle(get(roundElement), null).getPropertyValue("font-size"));
  this.tick = function() {
    var roundNumber = get(roundElement).innerHTML; // set to 1 initially
    if (roundNumber >= 10)
      get(roundElement).style.fontSize = 0.6*roundNumSize + "px";
    if (roundNumber >= 100)
      get(roundElement).style.fontSize = 0.375*roundNumSize + "px";
    time--;
    get(secondsElement).innerHTML = this.parseSeconds_(time);

    // 15 SECONDS!
    if (time % 60 === 15) {
      get(secondsBox).style.background = yellow;
      get(secondsElement).style.color = whitish;
      this.warn();
    }

    // NEW ROUND!
    if (time % 60 === 0 && time !== 0) {
      get(roundElement).innerHTML++;
      get(secondsBox).style.background = "transparent";
      get(secondsElement).style.color = "inherit";
      this.warn();
    }

    if (time === 0) {
      get("title").innerHTML = msg;
      get(secondsElement).innerHTML = 0;
      this.warn();
      this.finish();
    }
  };

  this.reset = function() {
    // reset section formerly in finish()
    // simply make it look like it did when just opened
    self.clearTicking();
    get("title").innerHTML = "Continuous Timer";
    get(startPauseButton).innerHTML = "Start";
    get(startPauseButton).style.display = "inline-block";
    time = secondsTotal;
    self.setState("stopped");
    get(roundElement).innerHTML = 1;
    get(secondsElement).innerHTML = self.parseSeconds_(secondsTotal);
    get(roundBox).style.background = "transparent";
    get(roundElement).style.color = "inherit";
    get(secondsBox).style.background = "transparent";
    get(secondsElement).style.color = "inherit";
  };

  this.warn = function() {
    // loop through keys to see if current time matches any; if so, play that sound
    for (var key in self.sounds) {
      if (key == time%60) {
        if (WAAPIsupport === true) 
          playSound(self.sounds[key]);
        else
          playHTML5Sound(self.sounds[key]);
      }
    }
  };
};
ContinuousTimer.prototype = new ExtendedTimer();

var team = new RoundTimer("Team Round", 240, 60, 15, "team-box", "team-min-box", "team-min-number", "team-sec-box", "team-sec-number", "team-start-button", "team-start-button-num", "team-ghost-button", "team-ghost-button-num", "team-pause-button", "team-stop-button", "team-redo-button-wrapper", teamSounds);
var ciphering = new RoundTimer("Ciphering Round", 180, 60, 10, "ciphering-box", "ciphering-min-box", "ciphering-min-number", "ciphering-sec-box", "ciphering-sec-number", "ciphering-start-button", "ciphering-start-button-num", "ciphering-ghost-button", "ciphering-ghost-button-num", "ciphering-pause-button", "ciphering-stop-button", "ciphering-redo-button-wrapper", cipheringSounds);
var relay = new RoundTimer("Relay Test", 360, 120, 10, "relay-box", "relay-round-box", "relay-round-number", "relay-sec-box", "relay-sec-number", "relay-start-button", "relay-start-button-num", "relay-ghost-button", "relay-ghost-button-num", "relay-pause-button", "relay-stop-button", "relay-redo-button-wrapper", relaySounds);
var msg = "You either went AFK for a really long time or are super dedicated. Props. (y)"

var indiv = new ExtendedTimer("Individual Test", 910, "indiv-box", null, null, 0, "indiv-sec-box", "indiv-sec-number", "indiv-start-pause-button", "indiv-reset-button", indivSounds);
var hustle = new ExtendedTimer("Hustle Test", 1500, "hustle-box", "hustle-round-box", "hustle-round-number", 300, "hustle-sec-box", "hustle-sec-number", "hustle-start-pause-button", "hustle-reset-button", hustleSounds);
var continuous = new ContinuousTimer("Continuous Timer", 10800, "continuous-box", "continuous-min-box", "continuous-min-number", 60, "continuous-sec-box", "continuous-sec-number", "continuous-start-pause-button", "continuous-reset-button", continuousSounds);

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

get("indiv-open").onclick = indiv.makeInterface;
get("indiv-start-pause-button").onclick = indiv.startpause;
get("indiv-reset-button").onclick = indiv.reset;

get("hustle-open").onclick = hustle.makeInterface;
get("hustle-start-pause-button").onclick = hustle.startpause;
get("hustle-reset-button").onclick = hustle.reset;

get("continuous-open").onclick = continuous.makeInterface;
get("continuous-start-pause-button").onclick = continuous.startpause;
get("continuous-reset-button").onclick = continuous.reset;


/******************************************************************\
      SOUND HANDLERS
\******************************************************************/

var audioDict = {};
audioDict.audioBuffersByName = {};
audioDict.audio_src = {};

var audioURLsByName = {
  silent: "sounds/silent.mp3",
  time: "sounds/time.mp3",
  fifteenseconds: "sounds/fifteenseconds.mp3",
  secondminute: "sounds/secondminute.mp3",
  thirdminute: "sounds/thirdminute.mp3",
  fourthminute: "sounds/fourthminute.mp3",
  newminute: "sounds/newminute.mp3",
  fifteenminutes: "sounds/fifteenminutes.mp3",
  fiveminutes: "sounds/fiveminutes.mp3",
  oneminute: "sounds/oneminute.mp3",
  secondround: "sounds/secondround.mp3",
  thirdround: "sounds/thirdround.mp3",
  fourthround: "sounds/fourthround.mp3",
  fifthround: "sounds/fifthround.mp3"
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
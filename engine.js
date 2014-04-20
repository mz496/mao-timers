// filename: root/engine.js

/*window.onerror = function(errorMsg, url, lineNumber) {
    console.log("JS ERROR: " + errorMsg + " (" + url + ", line " + lineNumber + ")");
};*/

// colors
var red = "#f72d23";
var orange = "#f4771f";
var yellow = "#f2c01b";
var gray = "#696969";
var whitish = "#f9f6f2";

/*
basic structure of a round timer

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

*/

function get(elem)
{ return document.getElementById(elem); }

function back() {
  get("title").innerHTML = "MA&#920; Timers";

  if (team.getState() === "running")
    team.pause();
  if (ciphering.getState() === "running")
    ciphering.pause();
  if (relay.getState() === "running")
    relay.pause();
  if (indiv.getState() === "running")
    indiv.startpause();
  if (hustle.getState() === "running")
    hustle.startpause();
  if (continuous.getState() === "running")
    continuous.startpause();
  if (speed.getState() === "running")
    speed.startpause();
  if (mental.getState() === "running")
    mental.startpause();
  if (custom != null && custom.getState() === "running")
    custom.startpause();

  // find which one to hide
  boxes = ["team-box", "ciphering-box", "relay-box", "indiv-box", "hustle-box", "continuous-box", "speed-box", "mental-box", "custom-box"];
  for (var i in boxes) {
    if (get(boxes[i]).style.display == "block")
      get(boxes[i]).style.display = "none";
  }

  get("button-box").style.display = "block";
  get("back-button").style.display = "none";
}

/******************************************************************\
/******************************************************************
      ROUND TIMER
      for "round-based" schemes -- team, ciphering, relay
\******************************************************************
\******************************************************************/


function RoundTimer(title, secondsPerQuestion, secondsPerRound, numQuestions, timerContainer, roundBox, roundElement, secondsBox, secondsElement, startButton, startButtonElement, ghostButton, ghostButtonElement, pauseButton, stopButton, redoButtonWrapper, soundDict) {
  var currentState = "stopped";
  var HTML5SoundInserted = false;
  this.sounds = soundDict;

  this.numQuestions = numQuestions;
  var currentQnum = 1;

  var self = this;
  var ticking;
  var time = secondsPerQuestion;
  var deltaT = 1000; // actual time (ms) between increments of the time variable -- 1000 in normal situation

  this.makeInterface = function() {
    // triggers upon click of the test type button
    get("title").innerHTML = title;
    get("button-box").style.display = "none";
    get(timerContainer).style.display = "block";
    get("back-button").style.display = "inline-block";
    
    if (WAAPIsupport === true)
      playSound('silent');
    else if (HTML5SoundInserted === false) {
      insertAudios();
      HTML5SoundInserted = true;
    }
  };

  this.parseSeconds = function(currentTime) {
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
    get(secondsElement).innerHTML = self.parseSeconds(secondsPerRound);
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

    // check warnings every 15 seconds to accommodate all test types
    // placement of this line causes problems in offline mode, but whatever
    if (time % 15 === 0)
      this.warn();

    // parse time remaining into the divs
    get(roundElement).innerHTML = Math.ceil((secondsPerQuestion - time)/secondsPerRound);
    get(secondsElement).innerHTML = this.parseSeconds(time);
    
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
/******************************************************************
      EXTENDED TIMER
      for extended/continuous schemes --
      individual, speed, mental, hustle, continuous
\******************************************************************
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
  var deltaT = 1000; // actual time (ms) between increments of the time variable -- 1000 in normal situation

  this.makeInterface = function() {
    // triggers upon click of the test type button
    get("title").innerHTML = title;
    get("button-box").style.display = "none";
    get(timerContainer).style.display = "block";
    get("back-button").style.display = "inline-block";

    if (WAAPIsupport === true)
      playSound('silent');
    else if (HTML5SoundInserted === false) {
      insertAudios();
      HTML5SoundInserted = true;
    }
  };

  this.parseSeconds = function(currentTime) {
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

    // check warnings every 15 seconds
    // placement of this line causes problems in offline mode, but whatever
    if (time % 15 === 0)
      this.warn();

    // parse time remaining into the divs
    if (roundBox == null && roundElement == null) {
      get(secondsElement).innerHTML = this.parseSeconds(time);

      // normal indiv-like color changes -- different for speed/mental because shorter tests
      // 15 MINUTES!
      if (secondsTotal > 30*60) {
        if (time === 15*60) {
          get(secondsBox).style.background = yellow;
          get(secondsElement).style.color = whitish;
        }

        // 5 MINUTES!
        if (time === 5*60) {
          get(secondsBox).style.background = orange;
          get(secondsElement).style.color = whitish;
        }

        // 1 MINUTE!
        if (time === 60) {
          get(secondsBox).style.background = red;
          get(secondsElement).style.color = whitish;
        }
      }
      else {
        // 1 MINUTE!
        if (time === 60) {
          get(secondsBox).style.background = yellow;
          get(secondsElement).style.color = whitish;
        }

        // 15 SECONDS!
        if (time === 15) {
          get(secondsBox).style.background = red;
          get(secondsElement).style.color = whitish;
        }
      }

      // TIME!
      if (time === 0) {
        get(secondsElement).innerHTML = "00:00";
        this.finish();
      }
    }
    else {
      // similar to the team timer's parsing of time b/c we have an extended indiv backbone timer but we want to keep track of round numbers too
      var roundNumber = Math.ceil((secondsTotal - time)/secondsPerRound);
      get(roundElement).innerHTML = roundNumber;
      if (roundNumber >= 10)
        get(roundElement).style.fontSize = 0.6*roundNumSize + "px";
      if (roundNumber >= 100)
        get(roundElement).style.fontSize = 0.375*roundNumSize + "px";
      get(secondsElement).innerHTML = this.parseSeconds(time);

      // 1 MINUTE!
      if (time % secondsPerRound === 60) {
        get(secondsBox).style.background = yellow;
        get(secondsElement).style.color = whitish;
      }

      // 15 SECONDS!
      if (time % secondsPerRound === 15) {
        get(secondsBox).style.background = red;
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
    }
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
        // making sizes relative for adaptation to mobile devices
        get(roundElement).innerHTML = 1;
        get(secondsElement).innerHTML = self.parseSeconds(secondsPerRound);

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
    get(secondsElement).innerHTML = self.parseSeconds(secondsTotal);
    time = secondsTotal;
    currentState = "stopped";
    get(secondsBox).style.background = "transparent";
    get(secondsElement).style.color = "inherit";
    if (roundElement != null)
      get(roundElement).style.fontSize = roundNumSize;
  }

  this.warn = function() {
    // loop through keys to see if current time matches any; if so, play that sound
    for (var key in self.sounds) {
      if (this.getTime() == key) {
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
  // these methods are for inherited continuous and custom
  this.clearTicking = function() { clearInterval(ticking); };
  this.getHTML5SoundInserted = function() { return HTML5SoundInserted; };
  this.setHTML5SoundInserted = function(val) { HTML5SoundInserted = val; };
}

/******************************************************************\
/******************************************************************
      CONTINUOUS TIMER
      is-a ExtendedTimer
\******************************************************************
\******************************************************************/

function ContinuousTimer(title, secondsTotal, timerContainer, roundBox, roundElement, secondsPerRound, secondsBox, secondsElement, startPauseButton, resetButton, soundDict) {
  ExtendedTimer.call(this, title, secondsTotal, timerContainer, roundBox, roundElement, secondsPerRound, secondsBox, secondsElement, startPauseButton, resetButton, soundDict);
  var time = this.getTime();
  var self = this;
  var roundNumSize = parseFloat(window.getComputedStyle(get(roundElement), null).getPropertyValue("font-size"));
  this.tick = function() {
    // roundNumber set to 1 initially
    time--;
    get(secondsElement).innerHTML = this.parseSeconds(time);

    // 15 SECONDS!
    if (time % 60 === 15) {
      get(secondsBox).style.background = yellow;
      get(secondsElement).style.color = whitish;
      this.warn();
    }

    // NEW ROUND!
    if (time % 60 === 0 && time !== 0) {
      get(roundElement).innerHTML++;
      var roundNumber = get(roundElement).innerHTML;
      get(secondsBox).style.background = "transparent";
      get(secondsElement).style.color = "inherit";
      if (roundNumber >= 10)
        get(roundElement).style.fontSize = 0.6*roundNumSize + "px";
      if (roundNumber >= 100)
        get(roundElement).style.fontSize = 0.375*roundNumSize + "px";
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
    get(secondsElement).innerHTML = self.parseSeconds(secondsTotal);
    get(roundBox).style.background = "transparent";
    get(roundElement).style.color = "inherit";
    get(roundElement).style.fontSize = roundNumSize + "px";
    get(secondsBox).style.background = "transparent";
    get(secondsElement).style.color = "inherit";
  };

  this.warn = function() {
    // loop through keys to see if current time matches any; if so, play that sound
    for (var key in self.sounds) {
      if (time%60 == key) {
        if (WAAPIsupport === true) 
          playSound(self.sounds[key]);
        else
          playHTML5Sound(self.sounds[key]);
      }
    }
  };
};

ContinuousTimer.prototype = new ExtendedTimer();

/******************************************************************\
/******************************************************************
      CUSTOM TIMER
      is-a ExtendedTimer
\******************************************************************
\******************************************************************/

var custom = null;

var fourDigitSize = parseFloat(window.getComputedStyle(get("custom-sec-number"), null).getPropertyValue("font-size")); // should be a constant or otherwise it gets constantly overwritten when the custom object is updated #sorrynotsorryglobalscope #ggnore

function CustomTimer(title, data, timerContainer, secondsBox, secondsElement, startPauseButton, resetButton, soundDict) {
  // data is a list [secondsTotal, warnings, warningColors]
  var self = this;
  var secondsTotal = data[0]; // this is mostly so we can keep the previous syntax though we could have done var time = data[0]
  var time = secondsTotal;
  var warnings = data[1];
  var warningColors = data[2];

  ExtendedTimer.call(this, title, secondsTotal, timerContainer, null, null, 0, secondsBox, secondsElement, startPauseButton, resetButton, soundDict);
  this.sounds = soundDict;

  this.parseSeconds = function(currentTime) {
    var hr = Math.floor(currentTime/3600);
    var min = Math.floor((currentTime - 3600*hr)/60);
    var sec = currentTime % 60;
    if (min < 10)
      min = "0" + min;
    if (sec < 10)
      sec = "0" + sec;
    if (hr > 0) {
      get(secondsElement).style.fontSize = fourDigitSize*0.75 + "px";
      return hr + ":" + min + ":" + sec;
    }
    else {
      get(secondsElement).style.fontSize = fourDigitSize + "px";
      return min + ":" + sec;
    }
  }

  get(secondsElement).innerHTML = this.parseSeconds(secondsTotal);

  this.tick = function() {
    if (time > 0)
      time--;
    else
      time = 0; // noobproofing against anyone who tries to make a timer of 00:00:00... or failproofing against if time happens to go negative

    get(secondsElement).innerHTML = this.parseSeconds(time);

    // 15 MINUTES!
    if (warnings[0] === true && time === 15*60) {
      get(secondsBox).style.background = warningColors[0];
      get(secondsElement).style.color = whitish;
      this.warn();
    }

    // 5 MINUTES!
    if (warnings[1] === true && time === 5*60) {
      get(secondsBox).style.background = warningColors[1];
      get(secondsElement).style.color = whitish;
      this.warn();
    }

    // 1 MINUTE!
    if (warnings[2] === true && time === 60) {
      get(secondsBox).style.background = warningColors[2];
      get(secondsElement).style.color = whitish;
      this.warn();
    }

    // 15 SECONDS!
    if (warnings[3] === true && time === 15) {
      get(secondsBox).style.background = warningColors[3];
      get(secondsElement).style.color = whitish;
      this.warn();
    }

    // TIME!
    if (time === 0) {
      get(secondsElement).innerHTML = "00:00";
      this.warn();
      this.finish();
    }
  }

  this.reset = function() {
    // reset section formerly in finish()
    // simply make it look like it did when just opened
    self.clearTicking();
    get(startPauseButton).innerHTML = "Start";
    get(startPauseButton).style.display = "inline-block";
    get(secondsElement).innerHTML = self.parseSeconds(secondsTotal);
    time = secondsTotal;
    self.setState("stopped");
    get(secondsBox).style.background = "transparent";
    get(secondsElement).style.color = "inherit";
  }

  this.warn = function() {
    // loop through keys to see if current time matches any; if so, play that sound
    for (var key in self.sounds) {
      if (time == key) {
        if (WAAPIsupport === true) 
          playSound(self.sounds[key]);
        else
          playHTML5Sound(self.sounds[key]);
      }
    }
  };
}

CustomTimer.prototype = new ExtendedTimer();

function changeCustomSettings() {
  var timeParts = { h:0, m:0, s:0 };
  var warnings = [false, false, false, false];
  var warningColors = [null, null, null, null];
  var secondsTotal = 0;

  // fill timeParts
  timeParts.h = get("hour-field").value;
  timeParts.m = get("min-field").value;
  timeParts.s = get("sec-field").value;

  // fill warnings
  if (get("15-min-checkbox").checked === true)
    warnings[0] = true;
  if (get("5-min-checkbox").checked === true)
    warnings[1] = true;
  if (get("1-min-checkbox").checked === true)
    warnings[2] = true;
  if (get("15-sec-checkbox").checked === true)
    warnings[3] = true;

  // assign colors
  var colorsTaken = 0;
  colors = [yellow, orange, red];
  for (var i = 0; i<=3; i++) {
    if (warnings[i] === true) {
      warningColors[i] = colors[colorsTaken];
      if (colorsTaken < 2)
        colorsTaken++; // if all 4 marked, then the last 2 are both red
    }
  }
  // final pass: make the last warning red
  for (var j = 3; j>=0; j--) {
    if (warnings[j] === true) {
      warningColors[j] = red;
      break;
    }
  }
  // this should leave all the false ones with null colors since we don't use them, so it won't be a problem
  //console.log(timeParts);
  //console.log(warnings);
  //console.log(warningColors);

  secondsTotal = parseInt(timeParts.h*3600) + parseInt(timeParts.m*60) + parseInt(timeParts.s);
  
  // change interface
  get("custom-head").style.fontSize = "18px";
  get("custom-head").innerHTML = "Time remaining";
  get("custom-sec-box").style.display = "block";
  get("custom-start-pause-button").style.display = "inline-block";
  get("custom-reset-button").style.display = "inline-block";
  get("change-settings-button").style.display = "inline-block";
  get("settings-box").style.display = "none";
  get("done-button").style.display = "none";
  return [secondsTotal, warnings, warningColors];
}

function openCustomSettings() {
  // break everything down so it looks like when we started
  custom.reset();
  get("custom-head").style.fontSize = "26px";
  get("custom-head").innerHTML = "Change settings";
  get("custom-sec-box").style.display = "none";
  get("custom-start-pause-button").style.display = "none";
  get("custom-reset-button").style.display = "none";
  get("change-settings-button").style.display = "none";
  get("settings-box").style.display = "block";
  get("done-button").style.display = "inline-block";
}

function makeCustom() {
  custom = new CustomTimer("Custom", changeCustomSettings(), "custom-box", "custom-sec-box", "custom-sec-number", "custom-start-pause-button", "custom-reset-button", customSounds);
  get("custom-start-pause-button").onclick = custom.startpause;
  get("custom-reset-button").onclick = custom.reset;

  if (WAAPIsupport === true)
    playSound('silent');
  else if (custom.getHTML5SoundInserted() === false) {
    insertAudios();
    custom.setHTML5SoundInserted(true);
  }
}

// we need this global because we need to change custom interface before we make the object, and also changeCustomInterface can't be inside the object
get("done-button").onclick = makeCustom;
get("change-settings-button").onclick = openCustomSettings;
// manually code this because the custom object doesn't exist at the time of opening the settings panel the first time -- this is basically just makeInterface broken up, the rest is inside makeCuston
get("custom-open").onclick = function() {
  get("title").innerHTML = "Custom";
  get("button-box").style.display = "none";
  get("custom-box").style.display = "block";
  get("back-button").style.display = "inline-block";
};
var customSounds = {
  900: "fifteenminutes",
  300: "fiveminutes",
  60: "oneminute",
  15: "fifteenseconds",
  0: "time"
};

// and all the rest of the timers:

var teamSounds = {
  15: "fifteenseconds",
  75: "fifteenseconds",
  135: "fifteenseconds",
  195: "fifteenseconds",
  180: "secondminute",
  120: "thirdminute",
  60: "fourthminute",
  0: "time"
};
var cipheringSounds = {
  15: "fifteenseconds",
  75: "fifteenseconds",
  135: "fifteenseconds",
  120: "secondminute",
  60: "thirdminute",
  0: "time"
};
var relaySounds = {
  15: "fifteenseconds",
  135: "fifteenseconds",
  255: "fifteenseconds",
  240: "secondround",
  120: "thirdround",
  0: "time"
};

var indivSounds = {
  900: "fifteenminutes",
  300: "fiveminutes",
  60: "oneminute",
  0: "time"
};
var hustleSounds = {
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
var continuousSounds = {
  15: "fifteenseconds",
  0: "newminute"
};
var speedSounds = {
  60: "oneminute",
  15: "fifteenseconds",
  0: "time"
};
var mentalSounds = speedSounds;

var team = new RoundTimer("Team Round", 240, 60, 15, "team-box", "team-min-box", "team-min-number", "team-sec-box", "team-sec-number", "team-start-button", "team-start-button-num", "team-ghost-button", "team-ghost-button-num", "team-pause-button", "team-stop-button", "team-redo-button-wrapper", teamSounds);
var ciphering = new RoundTimer("Ciphering Round", 180, 60, 10, "ciphering-box", "ciphering-min-box", "ciphering-min-number", "ciphering-sec-box", "ciphering-sec-number", "ciphering-start-button", "ciphering-start-button-num", "ciphering-ghost-button", "ciphering-ghost-button-num", "ciphering-pause-button", "ciphering-stop-button", "ciphering-redo-button-wrapper", cipheringSounds);
var relay = new RoundTimer("Relay", 360, 120, 10, "relay-box", "relay-round-box", "relay-round-number", "relay-sec-box", "relay-sec-number", "relay-start-button", "relay-start-button-num", "relay-ghost-button", "relay-ghost-button-num", "relay-pause-button", "relay-stop-button", "relay-redo-button-wrapper", relaySounds);
var msg = "You either went AFK for a really long time or are super dedicated. Props. (y)"

var indiv = new ExtendedTimer("Individual Round", 60*60, "indiv-box", null, null, 0, "indiv-sec-box", "indiv-sec-number", "indiv-start-pause-button", "indiv-reset-button", indivSounds);
var hustle = new ExtendedTimer("Hustle Test", 60*25, "hustle-box", "hustle-round-box", "hustle-round-number", 300, "hustle-sec-box", "hustle-sec-number", "hustle-start-pause-button", "hustle-reset-button", hustleSounds);
var continuous = new ContinuousTimer("Continuous", 60*60*6, "continuous-box", "continuous-min-box", "continuous-min-number", 60, "continuous-sec-box", "continuous-sec-number", "continuous-start-pause-button", "continuous-reset-button", continuousSounds);
var speed = new ExtendedTimer("Speed Math", 60*15, "speed-box", null, null, 0, "speed-sec-box", "speed-sec-number", "speed-start-pause-button", "speed-reset-button", speedSounds);
var mental = new ExtendedTimer("Mental Math", 60*8, "mental-box", null, null, 0, "mental-sec-box", "mental-sec-number", "mental-start-pause-button", "mental-reset-button", mentalSounds);

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

get("speed-open").onclick = speed.makeInterface;
get("speed-start-pause-button").onclick = speed.startpause;
get("speed-reset-button").onclick = speed.reset;

get("mental-open").onclick = mental.makeInterface;
get("mental-start-pause-button").onclick = mental.startpause;
get("mental-reset-button").onclick = mental.reset;

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
  fifthround: "sounds/fifthround.mp3",
};

// WAAPI supported section
var WAAPIsupport = false;

if (typeof webkitAudioContext !== 'undefined') {
  var audio_ctx = new webkitAudioContext();
  WAAPIsupport = true;
}
else if (typeof AudioContext !== "undefined") {
  var audio_ctx = new AudioContext();
  WAAPIsupport = true;
}
else
  console.log("No Web Audio support");
   
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
  }
}

function playHTML5Sound(name) {
  audioDict.audioBuffersByName[name].play();
}
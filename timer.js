// filename: root/timer.js

/*window.onerror = function(errorMsg, url, lineNumber) {
    console.log("JS ERROR: " + errorMsg + " (" + url + ", line " + lineNumber + ")");
};*/

// FORMATTING THINGS
function getProperty(elem, prop) {
  return parseFloat(window.getComputedStyle(get(elem), null).getPropertyValue(prop));
}
function getButtonWidth(button) { // displayed width
  return getProperty(button, "width") + 2*getProperty(button, "margin-left") + 2*getProperty(button, "padding-left");
}
function setButtonWidth(button, displayedWidth) {
  var elemWidth = displayedWidth - 2*getProperty(button, "margin-left") - 2*getProperty(button, "padding-left");
  get(button).style.width = elemWidth + "px";
}

// detecting for mobile
var mobile = getProperty("title", "width") < 601;

var teamWidth = getButtonWidth("team-open");
var indivWidth = getButtonWidth("indiv-open");

var hustleWidth = getButtonWidth("hustle-open");
var cipheringWidth = getButtonWidth("ciphering-open");
var relayWidth = getButtonWidth("relay-open");

var speedWidth = getButtonWidth("speed-open");
var mentalWidth = getButtonWidth("mental-open");

var continuousWidth = getButtonWidth("continuous-open");
var customWidth = getButtonWidth("custom-open");

if (!mobile) {
  // find width of the largest (computed) row, distribute button sizes in the other rows to match
  var row1 = teamWidth+indivWidth;
  var row2 = hustleWidth+cipheringWidth+relayWidth;
  var row3 = speedWidth+mentalWidth;
  var row4 = continuousWidth+customWidth;
  // the addition is somewhat inaccurate (?) so give each row 15px breathing room
  // idk how sort is working here but w3schools says it does, so...
  var descending = [row1+15, row2+15, row3+15, row4+15].sort(function(a, b){return b-a});
  var largest = descending[0];

  // distribute according to largest (largest row does not change)
  setButtonWidth("team-open", teamWidth/row1 * largest);
  setButtonWidth("indiv-open", indivWidth/row1 * largest);

  setButtonWidth("hustle-open", hustleWidth/row2 * largest);
  setButtonWidth("ciphering-open", cipheringWidth/row2 * largest);
  setButtonWidth("relay-open", relayWidth/row2 * largest);

  setButtonWidth("speed-open", speedWidth/row3 * largest);
  setButtonWidth("mental-open", mentalWidth/row3 * largest);

  setButtonWidth("continuous-open", continuousWidth/row4 * largest);
  setButtonWidth("custom-open", customWidth/row4 * largest);
}
else {
  // if we are mobile, then make each button the same width according to the largest
  var widths = [teamWidth, indivWidth, hustleWidth, cipheringWidth, relayWidth, speedWidth, mentalWidth, continuousWidth, customWidth];
  for (var w = 0; w < widths.length; w++) {
    widths[w] += 5;
  }
  var descending = widths.sort(function(a, b){return b-a});
  var largest = descending[0];

  setButtonWidth("team-open", largest);
  setButtonWidth("indiv-open", largest);
  setButtonWidth("hustle-open", largest);
  setButtonWidth("ciphering-open", largest);
  setButtonWidth("relay-open", largest);
  setButtonWidth("speed-open", largest);
  setButtonWidth("mental-open", largest);
  setButtonWidth("continuous-open", largest);
  setButtonWidth("custom-open", largest);
}

// TIMER STARTS HERE

// colors
var red = "hsl(0, 90%, 52%)";
var orange = "hsl(25, 90%, 52%)";
var yellow = "hsl(50, 90%, 52%)";
var gray = "hsl(0, 0%, 40%)";
var whitish = "hsl(34, 37%, 96%)";

/*
basic structure of a round timer

           +<--> paused (trigger via Pause or Back)
           |       |
running ---+       |
   ^       |       v
countdown  +---> stopped (trigger via OoT or Stop)
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

  if (team.getState() !== ("stopped" || "paused"))
    team.pause();
  if (ciphering.getState() !== ("stopped" || "paused"))
    ciphering.pause();
  if (relay.getState() !== ("stopped" || "paused"))
    relay.pause();
  if (indiv.getState() !== ("stopped" || "paused"))
    indiv.startpause();
  if (hustle.getState() !== ("stopped" || "paused"))
    hustle.startpause();
  if (continuous.getState() !== ("stopped" || "paused"))
    continuous.startpause();
  if (speed.getState() !== ("stopped" || "paused"))
    speed.startpause();
  if (mental.getState() !== ("stopped" || "paused"))
    mental.startpause();
  if (custom != null && custom.getState() !== ("stopped" || "paused"))
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

// from stackoverflow: revised setInterval; use obj.cancel() instead of clearInterval(obj)
// this re-calibrates time at each tick
var accurateInterval = function(fn, time) {
  var cancel, nextAt, timeout, wrapper, _ref;
  nextAt = new Date().getTime() + time;
  timeout = null;
  if (typeof time === 'function') _ref = [time, fn], fn = _ref[0], time = _ref[1];
  wrapper = function() {
    nextAt += time;
    timeout = setTimeout(wrapper, nextAt - new Date().getTime());
    return fn();
  };
  cancel = function() {
    return clearTimeout(timeout);
  };
  timeout = setTimeout(wrapper, nextAt - new Date().getTime());
  return {
    cancel: cancel
  };
};

/******************************************************************\
/******************************************************************
      ROUND TIMER
      for "round-based" schemes -- team, ciphering, relay
\******************************************************************
\******************************************************************/

function RoundTimer(title, secondsPerQuestion, secondsPerRound, numQuestions, timerContainer, roundBox, roundElement, secondsBox, secondsElement, startButton, startButtonElement, ghostButton, ghostButtonElement, pauseButton, stopButton, redoButtonWrapper, soundDict) {
  var currentState = "stopped";
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
    get(redoButtonWrapper).style.display = "none"; // we use the wrapper so we can have css for the CLASS of all redo wrappers but get the "ID" for the specific elem here

    if (get("toggleUseCountdown").checked === true) {
      // COUNTDOWN
      currentState = "countdown";

      // "Question N. Begin!"
      // reverse chain of callbacks...

      get(roundElement).style.opacity = 0.5;
      get(secondsElement).style.opacity = 0.5;
      // making the starting values
      get(roundElement).innerHTML = 1;
      get(secondsElement).innerHTML = self.parseSeconds(time);
      var countdown = function() { playHowlCallback("question", N); };
      var N = function() { playHowlCallback(currentQnum, silence); };
      var silence = function() { playHowlCallback("silent", begin); };
      var begin = function() { playHowlCallback("begin", self.startTicking); };
      
      countdown();
    }
    else { self.startTicking(); }
  };

  this.startTicking = function() {
    get(roundElement).style.opacity = 1;
    get(secondsElement).style.opacity = 1;
    // if someone paused by clicking Pause or Back, do not run once the voice has finished counting down, instead pause at full time
    if (currentState !== "paused") {
      currentState = "running";
      ticking = accurateInterval(function() { self.tick() }, deltaT);
    }
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
    // countdown --> paused section
    // the interface changes are handled in startTicking()
    if (currentState === "countdown") {
      currentState = "paused";
      get(pauseButton).innerHTML = "Resume";
    }

    // running --> paused section
    else if (currentState === "running") {
      currentState = "paused";
      // remove interval for now, to be replaced
      ticking.cancel();
      get(pauseButton).innerHTML = "Resume";
    }
    
    // paused --> running section
    else if (currentState === "paused") {
      currentState = "running";
      // remake interval
      ticking = accurateInterval(function() { self.tick() }, deltaT);
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
    if (ticking != null) { // it can be null when trying to stop if user clicks during countdown
      ticking.cancel();
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
    }
  };

  this.warn = function() {
    // loop through keys to see if current time matches any; if so, play that sound
    for (var key in self.sounds) {
      if (key == this.getTime()) {
        playHowl(self.sounds[key]);
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
  this.sounds = soundDict;

  var self = this; // very important for accurateInterval
  var ticking;
  var time = secondsTotal;
  var deltaT = 1000; // actual time (ms) between increments of the time variable -- 1000 in normal situation

  this.makeInterface = function() {
    // triggers upon click of the test type button
    get("title").innerHTML = title;
    get("button-box").style.display = "none";
    get(timerContainer).style.display = "block";
    get("back-button").style.display = "inline-block";
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
  };

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

    // countdown --> paused section
    // the interface changes are handled in startTicking()
    if (currentState === "countdown") {
      currentState = "paused";
      get(startPauseButton).innerHTML = "Resume";
    }
    // running --> paused section
    else if (currentState === "running") {
      currentState = "paused";
      // remove interval for now, to be replaced
      ticking.cancel();
      get(startPauseButton).innerHTML = "Resume";
    }
    // paused --> running section
    else if (currentState === "paused") {
      currentState = "running";
      // remake interval
      ticking = accurateInterval(function() { self.tick() }, deltaT);
      get(startPauseButton).innerHTML = "Pause";
    }

    else {
      // standard start
      // indiv, speed, mental
      if (roundBox == null && roundElement == null) {
        get(startPauseButton).innerHTML = "Pause";
        
        if (get("toggleUseCountdown").checked === true)
          self.startCountdown();
        else
          self.startTicking();
      }
      // round-like start
      // hustle, continuous
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
        get(startPauseButton).innerHTML = "Pause";

        if (get("toggleUseCountdown").checked === true)
          self.startCountdown();
        else
          self.startTicking();
      }
    }
  };

  this.startCountdown = function() {
    // COUNTDOWN
    currentState = "countdown";

    // "Ready. Begin!"
    // reverse chain of callbacks...

    // making the starting values
    if (roundElement != null) {
      get(roundElement).style.opacity = 0.5;
      get(secondsElement).style.opacity = 0.5;
      get(roundElement).innerHTML = 1;
      get(secondsElement).innerHTML = self.parseSeconds(secondsPerRound);
    }
    else {
      get(secondsElement).style.opacity = 0.5;
      get(secondsElement).innerHTML = self.parseSeconds(secondsTotal);
    }
    var countdown = function() { playHowlCallback("ready", silence); };
    var silence = function() { playHowlCallback("silent", begin); };
    var begin = function() { playHowlCallback("begin", self.startTicking); };
    
    countdown();
  }

  this.startTicking = function() {
    if (roundElement != null)
      get(roundElement).style.opacity = 1;
    get(secondsElement).style.opacity = 1;
    // if someone paused by clicking Pause or Back, do not run once the voice has finished counting down, instead pause at full time
    if (currentState !== "paused") {
      currentState = "running";
      ticking = accurateInterval(function() { self.tick() }, deltaT);
    }
  };

  this.finish = function() {
    // only triggered upon running out of time (OoT)
    ticking.cancel();
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
    if (ticking != null) { // similar to round timer, it can be null if user tries to reset during countdown
      ticking.cancel();
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
  };

  this.warn = function() {
    // loop through keys to see if current time matches any; if so, play that sound
    for (var key in self.sounds) {
      if (this.getTime() == key) {
        playHowl(self.sounds[key]);
      }
    }
  };

  this.getTime = function() { return time; };
  this.getState = function() { return currentState; };
  this.setState = function(state) { currentState = state; };
  // these methods are for inherited continuous and custom
  this.tickingExists = function() { if (ticking != null) {return true;} };
  this.clearTicking = function() { ticking.cancel(); }
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
    if (self.tickingExists()) { // can be null if trying to reset during/before countdown
      self.clearTicking();
      get("title").innerHTML = "Continuous";
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
    }
  };

  this.warn = function() {
    // loop through keys to see if current time matches any; if so, play that sound
    for (var key in self.sounds) {
      if (time%60 == key) {
        playHowl(self.sounds[key]);
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
  };

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
  };

  this.reset = function() {
    // reset section formerly in finish()
    // simply make it look like it did when just opened
    if (self.tickingExists()) {
      self.clearTicking();
      get(startPauseButton).innerHTML = "Start";
      get(startPauseButton).style.display = "inline-block";
      get(secondsElement).innerHTML = self.parseSeconds(secondsTotal);
      time = secondsTotal;
      self.setState("stopped");
      get(secondsBox).style.background = "transparent";
      get(secondsElement).style.color = "inherit";
    }
  };

  this.warn = function() {
    // loop through keys to see if current time matches any; if so, play that sound
    for (var key in self.sounds) {
      if (time == key) {
        playHowl(self.sounds[key]);
      }
    }
  };
};

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
  secondsTotal = parseInt(timeParts.h*3600) + parseInt(timeParts.m*60) + parseInt(timeParts.s);

  // fill warnings
  if (get("15-min-checkbox").checked === true && secondsTotal > 15*60)
    warnings[0] = true;
  if (get("5-min-checkbox").checked === true && secondsTotal > 5*60)
    warnings[1] = true;
  if (get("1-min-checkbox").checked === true && secondsTotal > 60)
    warnings[2] = true;
  if (get("15-sec-checkbox").checked === true && secondsTotal > 15)
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
  console.log(timeParts);
  console.log(warnings);
  console.log(warningColors);
  
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
}

// we need this global because we need to change custom interface before we make the object, and also changeCustomInterface can't be inside the object
get("done-button").onclick = makeCustom;
get("change-settings-button").onclick = openCustomSettings;
// manually code this because the custom object doesn't exist at the time of opening the settings panel the first time -- this is basically just makeInterface broken up, the rest is inside makeCustom
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
var ciphering = new RoundTimer("Ciphering Round", 180, 60, 15, "ciphering-box", "ciphering-min-box", "ciphering-min-number", "ciphering-sec-box", "ciphering-sec-number", "ciphering-start-button", "ciphering-start-button-num", "ciphering-ghost-button", "ciphering-ghost-button-num", "ciphering-pause-button", "ciphering-stop-button", "ciphering-redo-button-wrapper", cipheringSounds);
var relay = new RoundTimer("Relay", 360, 120, 10, "relay-box", "relay-round-box", "relay-round-number", "relay-sec-box", "relay-sec-number", "relay-start-button", "relay-start-button-num", "relay-ghost-button", "relay-ghost-button-num", "relay-pause-button", "relay-stop-button", "relay-redo-button-wrapper", relaySounds);
var msg = "You either went AFK for a really long time or are super dedicated. Props. (y)"

var indiv = new ExtendedTimer("Individual Round", 60*60, "indiv-box", null, null, 0, "indiv-sec-box", "indiv-sec-number", "indiv-start-pause-button", "indiv-reset-button", indivSounds);
var hustle = new ExtendedTimer("Hustle", 60*25, "hustle-box", "hustle-round-box", "hustle-round-number", 300, "hustle-sec-box", "hustle-sec-number", "hustle-start-pause-button", "hustle-reset-button", hustleSounds);
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
  ready: "sounds/ready.mp3",
  begin: "sounds/begin.mp3",
  question: "sounds/question.mp3",
  1: "sounds/numbers/1.mp3",
  2: "sounds/numbers/2.mp3",
  3: "sounds/numbers/3.mp3",
  4: "sounds/numbers/4.mp3",
  5: "sounds/numbers/5.mp3",
  6: "sounds/numbers/6.mp3",
  7: "sounds/numbers/7.mp3",
  8: "sounds/numbers/8.mp3",
  9: "sounds/numbers/9.mp3",
  10: "sounds/numbers/10.mp3",
  11: "sounds/numbers/11.mp3",
  12: "sounds/numbers/12.mp3",
  13: "sounds/numbers/13.mp3",
  14: "sounds/numbers/14.mp3",
  15: "sounds/numbers/15.mp3"
};

// structure is: for each timer, check the time until we match to { time:mainDictKey } inside the subset dictionary, for reference in the master dictionary that has { mainDictKey:URLtoPlay }
// can also refer to other sounds by name e.g. "question", "begin"
var playHowl = function(mainDictKey) {
  var sound = new Howl({ urls: [audioURLsByName[mainDictKey]] });
  sound.play();
}

var playHowlCallback = function(mainDictKey, cb) {
  var sound = new Howl({
    urls: [audioURLsByName[mainDictKey]],
    onend: cb
  })
  sound.play();
}
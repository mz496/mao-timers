// filename: engine.js

var time;
var stoptime;
var buffer = 100;
var deltaT;
var ticking;
var timeout;
var qnum;
var minbox = document.getElementById("minbox");
var secbox = document.getElementById("secbox");
var minnumber = document.getElementById("minnumber");
var secnumber = document.getElementById("secnumber");
var teamstate = "stopped";
// "stopped": the timer is not running at all
// "paused": the timer is on, we do not have the option to go to the next question, but it is not running
// "running": timer is running

function teamInterface()
{
  document.getElementById("buttonbox").style.display = "none";
  document.getElementById("teambox").style.display = "block";  
  time = 240; //240s = 4m
  deltaT = 1000; // actual time between increments of the time variable -- 1000 in normal situation
  stoptime = time * deltaT; //ms
  buffer = 100; //ms
  qnum = 1;
}

function startTimer()
{
  // initial values
  minnumber.innerHTML = 1;
  secnumber.innerHTML = 60;
  minbox.style.background = "transparent";
  minnumber.style.color = "inherit";
  secbox.style.background = "transparent";
  secnumber.style.color = "inherit";
  document.getElementById("redobutton").style.display = "none";
  teamstate = "running";
  ticking = setInterval(tick, deltaT);
  timeout = setTimeout(finish, stoptime+buffer);
}
  
function tick()
{
  // makes the timer go
  time--;

  // parse time remaining into the divs
  minnumber.innerHTML = Math.ceil((240 - time)/60);
  secnumber.innerHTML = time % 60;
  // however, secnumber should only read 0 at the end
  if (time % 60 === 0 && time !== 0)
  {
    secnumber.innerHTML = 60;
    // new minute starting, reset color
    // advance minute count at 60 (i.e. now) instead of at the 59
    minnumber.innerHTML++;
    secbox.style.background = "transparent";
    secnumber.style.color = "inherit";
  }
  
  if (time === 0)
    secnumber.innerHTML = 0;

  // check if <15sec in the minute
  if (time % 60 <= 15 && time % 60 !== 0)
  {
    // make boxes yellow w/ white text for warning
    secbox.style.background = "#f2c01b";
    secnumber.style.color = "#f9f6f2";
  }
}
  
function finish()
{
  clearInterval(ticking);
  // timeout has already fired, so no need to clear it
  // only reset once
  if (teamstate === "running" || teamstate === "paused")
  {
    // make the boxes red so they're noticeable
    minbox.style.background = "#f72d23";
    secbox.style.background = "#f72d23";
    minnumber.style.color = "#f9f6f2";
    secnumber.style.color = "#f9f6f2";
    // let user advance
    reset();
    teamstate = "stopped";
    // show the redo button
    document.getElementById("redobutton").style.display = "inline-block";
  }
}

function startButton()
{
  // make the button into text that just says the question number
  document.getElementById("startbutton").style.display = "none";
  document.getElementById("teamcurrentnum").style.display = "inline-block";
  // start the timer and let it goooo
  startTimer();
}
  
function stopButton()
{
  // premature finish (clearInterval has already fired); clear timeout
  finish();
  clearTimeout(timeout);
}

function pauseButton()
{
  // running --> paused section
  if (teamstate === "running")
  {
    // freeze timer, don't change anything
    teamstate = "paused";
    // remove timeout
    clearInterval(ticking);
    clearTimeout(timeout);
    // change text to Resume
    document.getElementById("pausebutton").innerHTML = "Resume...";
  }
  
  // paused --> running section
  else if (teamstate === "paused")
  {
    teamstate = "running";
    // remake timeout
    ticking = setInterval(tick, deltaT);
    timeout = setTimeout(finish, time * 1000 + buffer); // timeout after time remaining finishes up
    document.getElementById("pausebutton").innerHTML = "Pause";
  }
}

function reset()
{
  // advance question number for the start button, reset time, reset pause button
  qnum++;
  document.getElementById("startbutton").style.display = "inline-block";
  document.getElementById("teamcurrentnum").style.display = "none";
  document.getElementById("startbuttonnum").innerHTML = "Question " + qnum;
  document.getElementById("teamcurrentnum").innerHTML = "Question " + qnum;
  document.getElementById("pausebutton").innerHTML = "Pause";
  time = 240;
}

function redo()
{
  // essentially from a paused position, decrease qnum by 1 so the start button reads something else, but can't go past 1
  if (qnum > 1)
    qnum--;
  document.getElementById("startbuttonnum").innerHTML = "Question " + qnum;
  document.getElementById("teamcurrentnum").innerHTML = "Question " + qnum;
  time = 240;
}

function indivInterface()
{
  
}

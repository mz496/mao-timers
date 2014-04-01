// filename: root/engine.js

document.getElementById("BACK_BUTTON").onclick = backButton;
document.getElementById("TEAM_OPEN").onclick = teamInterface;
document.getElementById("START_BUTTON").onclick = startButton;
document.getElementById("STOP_BUTTON").onclick = stopButton;
document.getElementById("PAUSE_BUTTON").onclick = pauseButton;
document.getElementById("REDO_BUTTON").onclick = redoButton;

var time;
var stoptime;
var buffer;
var deltaT;
var ticking;
var timeout;

var minbox = get("min-box");
var secbox = get("sec-box");
var minnumber = get("min-number");
var secnumber = get("sec-number");
var teamqnum = 1;
var teamstate = "stopped";
// "stopped": the timer is not running at all
// "paused": the timer is on, we do not have the option to go to the next question, but it is not running
// "running": timer is running

function get(elem)
{ return document.getElementById(elem); }
function playSound(sound)
{ get(sound).autoplay = true; get(sound).autostart = true; }


function backButton()
{
  // since getElementByClassName doesn't play well with the code below it, we'll have to add each test style box individually...
  get("team-box").style.display = "none";
  // and pause all the timers unless they're stopped already
  if (teamstate !== "stopped")
  {teamstate = "paused";}
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
    stoptime = time * deltaT; //ms
    buffer = 100; //ms
    // do NOT re-initialize teamqnum! or else redo button breaks!
  }
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

  teamstate = "running";
  ticking = setInterval(tick, deltaT);
  timeout = setTimeout(finish, stoptime+buffer);
}
  
function tick()
{
  // makes the timer go
  time--;
  // sound handler -- this is at the top to have minimum delays possible
  switch(time)
  {
    case 15:
      playSound("fifteenseconds");
      break;
    case 75:
      playSound("fifteenseconds");
      break;
    case 135:
      playSound("fifteenseconds");
      break;
    case 195:
      playSound("fifteenseconds");
      break;
    case 180:
      playSound("secondminute");
      break;
    case 120:
      playSound("thirdminute");
      break;
    case 60:
      playSound("fourthminute");
      break;
    case 0:
      playSound("time");
      break;
  }
  // in case we want to switch to time ELAPSED?
  //var timeElapsed = 240 - time;

  // parse time remaining into the divs
  minnumber.innerHTML = Math.ceil((240 - time)/60);
  secnumber.innerHTML = time % 60;
    
  // check if <15sec in the minute
  if (time % 60 <= 15 && time % 60 !== 0)
  {
    // make boxes yellow w/ white text for warning
    secbox.style.background = "#f2c01b";
    secnumber.style.color = "#f9f6f2";
  }
  
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

  // finish sets the time 0 at the end
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
  
function stopButton()
{
  // premature finish; clear timeout, interval is cleared in the first line of finish()
  clearTimeout(timeout);
  finish();
}

function pauseButton()
{
  // running --> paused section
  if (teamstate === "running")
  {
    // freeze timer, don't change anything
    teamstate = "paused";
    // remove timeout and interval for now, to be replaced
    clearInterval(ticking);
    clearTimeout(timeout);
    // change text to Resume...
    get("PAUSE_BUTTON").innerHTML = "Resume...";
  }
  
  // paused --> running section
  else if (teamstate === "paused")
  {
    teamstate = "running";
    // remake timeout and interval
    ticking = setInterval(tick, deltaT);
    timeout = setTimeout(finish, time*deltaT + buffer); // timeout for the time remaining to finish up
    // resembles definition of stoptime except that stoptime is a constant
    get("PAUSE_BUTTON").innerHTML = "Pause";
  }
}

function redoButton()
{
  // essentially from a paused position, decrease qnum by 1 so the start button reads something else, but can't go past 1
  if (teamqnum > 1)
  {
    teamqnum--;
    get("start-button-num").innerHTML = "Question " + teamqnum;
    get("team-current-num").innerHTML = "Question " + teamqnum;
  }
}

function finish()
{
  // this must be here in the case of non-user-initiated stop (OoT)
  // by definition the timeout has already cleared, since this is the function that the timeout triggers
  clearInterval(ticking);
  // now only reset once
  if (teamstate === "running" || teamstate === "paused")
  {
    // make the boxes red so they're noticeable
    minbox.style.background = "#f72d23";
    secbox.style.background = "#f72d23";
    minnumber.style.color = "#f9f6f2";
    secnumber.style.color = "#f9f6f2";
    // force the time to read 0 time is 0, since it doesn't seem to be working in tick()
    if (time === 0)
      secnumber.innerHTML = 0;
    // let user advance
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
  {
    teamqnum++;
  }
  get("START_BUTTON").style.display = "inline-block";
  get("ghost-button").style.display = "none";
  get("start-button-num").innerHTML = "Question " + teamqnum;
  get("team-current-num").innerHTML = "Question " + teamqnum;
  get("PAUSE_BUTTON").innerHTML = "Pause";
  time = 240;
}

////////////////////////////////////////////////////////

function indivInterface()
{
  
}

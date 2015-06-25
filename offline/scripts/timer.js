/*
MAO Timers
UPDATED 2015-06-25
Matthew Zhu
*/

function getProperty(t,e){return parseFloat(window.getComputedStyle(get(t),null).getPropertyValue(e))}function getButtonWidth(t){return getProperty(t,"width")+2*getProperty(t,"margin-left")+2*getProperty(t,"padding-left")}function setButtonWidth(t,e){var n=e-2*getProperty(t,"margin-left")-2*getProperty(t,"padding-left");get(t).style.width=n+"px"}function get(t){return document.getElementById(t)}function back(){get("title").innerHTML="MA&#920; Timers","running"===team.getState()&&team.pause(),"running"===ciphering.getState()&&ciphering.pause(),"running"===relay.getState()&&relay.pause(),"running"===indiv.getState()&&indiv.startpause(),"running"===hustle.getState()&&hustle.startpause(),"running"===continuous.getState()&&continuous.startpause(),"running"===speed.getState()&&speed.startpause(),"running"===mental.getState()&&mental.startpause(),null!=custom&&"running"===custom.getState()&&custom.startpause(),boxes=["team-box","ciphering-box","relay-box","indiv-box","hustle-box","continuous-box","speed-box","mental-box","custom-box"];for(var t in boxes)"block"==get(boxes[t]).style.display&&(get(boxes[t]).style.display="none");get("button-box").style.display="block",get("back-button").style.display="none"}function RoundTimer(t,e,n,s,o,i,u,r,a,l,c,d,g,p,h,m,y){var b="stopped";this.sounds=y,this.numQuestions=s;var f,k=1,w=this,T=e,v=roundDeltaT;this.makeInterface=function(){get("title").innerHTML=t,get("button-box").style.display="none",get(o).style.display="block",get("back-button").style.display="inline-block"},this.parseSeconds=function(t){if(60>=n){var e=t%n;return 0===e&&(e=60),e}var e=t%n;0===e&&(e=n);var s=Math.floor(e/60),o=e-60*s;return 10>o&&(o="0"+o),s+":"+o},this.start=function(){var t=parseFloat(window.getComputedStyle(get(u),null).getPropertyValue("font-size"));if(get(u).innerHTML=1,get(a).innerHTML=w.parseSeconds(n),get(a).style.fontSize=60>=n?.6*t+"px":.375*t+"px",get(i).style.background="transparent",get(u).style.color="inherit",get(r).style.background="transparent",get(a).style.color="inherit",get(l).style.display="none",get(d).style.display="inline-block",get(m).style.display="none",get("toggleUseCountdown").checked===!0){b="countdown",get(u).style.opacity=.5,get(a).style.opacity=.5,get(u).innerHTML=1,get(a).innerHTML=w.parseSeconds(T);var e=function(){playHowlCallback("question",s)},s=function(){playHowlCallback(k,o)},o=function(){playHowlCallback("silent",c)},c=function(){playHowlCallback("begin",w.startTicking)};e()}else w.startTicking()},this.startTicking=function(){get(u).style.opacity=1,get(a).style.opacity=1,"paused"!==b&&(b="running",f=accurateInterval(function(){w.tick()},v))},this.tick=function(){T--,T%15===0&&this.warn();var t=Math.ceil((e-T)/n);get(u).innerHTML=T%60===0&&0!==T?t+1:t,get(a).innerHTML=this.parseSeconds(T),T%n===15&&(get(r).style.background=yellow),T%n===0&&0!==T&&(get(r).style.background="transparent",get(a).style.color="inherit"),0===T&&(get(a).innerHTML=60>=n?0:"0:00",this.finish())},this.pause=function(){"countdown"===b?(b="paused",get(p).innerHTML="Resume"):"running"===b?(b="paused",f.cancel(),get(p).innerHTML="Resume"):"paused"===b&&(b="running",f=accurateInterval(function(){w.tick()},v),get(p).innerHTML="Pause")},this.redo=function(){k>1&&(k--,get(c).innerHTML="Question "+k,get(g).innerHTML="Question "+k)},this.finish=function(){null!=f&&(f.cancel(),("running"===b||"paused"===b)&&(get(i).style.background=gray,get(r).style.background=gray,get(u).style.color=whitish,get(a).style.color=whitish,b="stopped",s>k&&k++,get(l).style.display="inline-block",get(d).style.display="none",get(m).style.display="inline-block",get(c).innerHTML="Question "+k,get(g).innerHTML="Question "+k,get(p).innerHTML="Pause",T=e))},this.warn=function(){for(var t in w.sounds)t==this.getTime()&&playHowl(w.sounds[t])},this.getTime=function(){return T},this.getState=function(){return b},this.setState=function(t){b=t}}function ExtendedTimer(t,e,n,s,o,i,u,r,a,l,c){var d="stopped";this.sounds=c;var g,p=this,h=e,m=extendedDeltaT;if(this.makeInterface=function(){get("title").innerHTML=t,get("button-box").style.display="none",get(n).style.display="block",get("back-button").style.display="inline-block"},this.parseSeconds=function(t){if(null==s&&null==o){var e=Math.floor(t/60),n=t%60;return 10>e&&(e="0"+e),10>n&&(n="0"+n),e+":"+n}if(60>=i){var u=t%i;return 0===u&&(u=60),u}var u=t%i;0===u&&(u=i);var r=Math.floor(u/60),a=u-60*r;return 10>a&&(a="0"+a),r+":"+a},null!=o)var y=parseFloat(window.getComputedStyle(get(o),null).getPropertyValue("font-size"));this.tick=function(){if(h--,h%15===0&&this.warn(),null==s&&null==o)get(r).innerHTML=this.parseSeconds(h),e>1800?(900===h&&(get(u).style.background=yellow),300===h&&(get(u).style.background=orange,get(r).style.color=whitish),60===h&&(get(u).style.background=red,get(r).style.color=whitish)):(60===h&&(get(u).style.background=yellow),15===h&&(get(u).style.background=red,get(r).style.color=whitish)),0===h&&(get(r).innerHTML="00:00",this.finish());else{var t=Math.ceil((e-h)/i);get(o).innerHTML=t,t>=10&&(get(o).style.fontSize=.6*y+"px"),t>=100&&(get(o).style.fontSize=.375*y+"px"),get(r).innerHTML=this.parseSeconds(h),h%i===60&&(get(u).style.background=yellow),h%i===15&&(get(u).style.background=red,get(r).style.color=whitish),h%i===0&&0!==h&&(get(u).style.background="transparent",get(r).style.color="inherit"),0===h&&(get(r).innerHTML=60>=i?0:"0:00",this.finish())}},this.startpause=function(){"countdown"===d?(d="paused",get(a).innerHTML="Resume"):"running"===d?(d="paused",g.cancel(),get(a).innerHTML="Resume"):"paused"===d?(d="running",g=accurateInterval(function(){p.tick()},m),get(a).innerHTML="Pause"):null==s&&null==o?(get(a).innerHTML="Pause",get("toggleUseCountdown").checked===!0?p.startCountdown():p.startTicking()):(get(o).innerHTML=1,get(r).innerHTML=p.parseSeconds(i),get(r).style.fontSize=60>=i?.6*y+"px":.375*y+"px",get(s).style.background="transparent",get(o).style.color="inherit",get(a).innerHTML="Pause",get("toggleUseCountdown").checked===!0?p.startCountdown():p.startTicking())},this.startCountdown=function(){d="countdown",null!=o?(get(o).style.opacity=.5,get(r).style.opacity=.5,get(o).innerHTML=1,get(r).innerHTML=p.parseSeconds(i)):(get(r).style.opacity=.5,get(r).innerHTML=p.parseSeconds(e));var t=function(){playHowlCallback("ready",n)},n=function(){playHowlCallback("silent",s)},s=function(){playHowlCallback("begin",p.startTicking)};t()},this.startTicking=function(){null!=o&&(get(o).style.opacity=1),get(r).style.opacity=1,"paused"!==d&&(d="running",g=accurateInterval(function(){p.tick()},m))},this.finish=function(){g.cancel(),get(u).style.background=gray,get(r).style.color=whitish,null!=s&&(get(s).style.background=gray,get(o).style.color=whitish),get(a).style.display="none",d="stopped"},this.reset=function(){null!=g&&(g.cancel(),get(a).innerHTML="Start",get(a).style.display="inline-block",get(r).innerHTML=p.parseSeconds(e),h=e,d="stopped",get(u).style.background="transparent",get(r).style.color="inherit",null!=o&&(get(o).style.fontSize=y))},this.warn=function(){for(var t in p.sounds)this.getTime()==t&&playHowl(p.sounds[t])},this.getTime=function(){return h},this.getState=function(){return d},this.setState=function(t){d=t},this.tickingExists=function(){return null!=g?!0:void 0},this.clearTicking=function(){g.cancel()}}function ContinuousTimer(t,e,n,s,o,i,u,r,a,l,c){ExtendedTimer.call(this,t,e,n,s,o,i,u,r,a,l,c);var d=this.getTime(),g=this,p=parseFloat(window.getComputedStyle(get(o),null).getPropertyValue("font-size"));this.tick=function(){if(d--,get(r).innerHTML=this.parseSeconds(d),d%60===15&&(get(u).style.background=yellow,this.warn()),d%60===0&&0!==d){get(o).innerHTML++;var t=get(o).innerHTML;get(u).style.background="transparent",get(r).style.color="inherit",t>=10&&(get(o).style.fontSize=.6*p+"px"),t>=100&&(get(o).style.fontSize=.375*p+"px"),this.warn()}0===d&&(get("title").innerHTML=msg,get(r).innerHTML=0,this.warn(),this.finish())},this.reset=function(){g.tickingExists()&&(g.clearTicking(),get("title").innerHTML="Continuous",get(a).innerHTML="Start",get(a).style.display="inline-block",d=e,g.setState("stopped"),get(o).innerHTML=1,get(r).innerHTML=g.parseSeconds(e),get(s).style.background="transparent",get(o).style.color="inherit",get(o).style.fontSize=p+"px",get(u).style.background="transparent",get(r).style.color="inherit")},this.warn=function(){for(var t in g.sounds)d%60==t&&playHowl(g.sounds[t])}}function CustomTimer(t,e,n,s,o,i,u,r){var a=this,l=e[0],c=l,d=e[1],g=e[2];ExtendedTimer.call(this,t,l,n,null,null,0,s,o,i,u,r),this.sounds=r,this.parseSeconds=function(t){var e=Math.floor(t/3600),n=Math.floor((t-3600*e)/60),s=t%60;return 10>n&&(n="0"+n),10>s&&(s="0"+s),e>0?(get(o).style.fontSize=.75*fourDigitSize+"px",e+":"+n+":"+s):(get(o).style.fontSize=fourDigitSize+"px",n+":"+s)},get(o).innerHTML=this.parseSeconds(l),this.tick=function(){c>0?c--:c=0,get(o).innerHTML=this.parseSeconds(c),d[0]===!0&&900===c&&(get(s).style.background=g[0],get(o).style.color=whitish,this.warn()),d[1]===!0&&300===c&&(get(s).style.background=g[1],get(o).style.color=whitish,this.warn()),d[2]===!0&&60===c&&(get(s).style.background=g[2],get(o).style.color=whitish,this.warn()),d[3]===!0&&15===c&&(get(s).style.background=g[3],get(o).style.color=whitish,this.warn()),0===c&&(get(o).innerHTML="00:00",this.warn(),this.finish())},this.reset=function(){a.tickingExists()&&(a.clearTicking(),get(i).innerHTML="Start",get(i).style.display="inline-block",get(o).innerHTML=a.parseSeconds(l),c=l,a.setState("stopped"),get(s).style.background="transparent",get(o).style.color="inherit")},this.warn=function(){for(var t in a.sounds)c==t&&playHowl(a.sounds[t])}}function changeCustomSettings(){var t={h:0,m:0,s:0},e=[!1,!1,!1,!1],n=[null,null,null,null],s=0;t.h=get("hour-field").value,t.m=get("min-field").value,t.s=get("sec-field").value,s=parseInt(3600*t.h)+parseInt(60*t.m)+parseInt(t.s),get("15-min-checkbox").checked===!0&&s>900&&(e[0]=!0),get("5-min-checkbox").checked===!0&&s>300&&(e[1]=!0),get("1-min-checkbox").checked===!0&&s>60&&(e[2]=!0),get("15-sec-checkbox").checked===!0&&s>15&&(e[3]=!0);var o=0;colors=[yellow,orange,red];for(var i=0;3>=i;i++)e[i]===!0&&(n[i]=colors[o],2>o&&o++);for(var u=3;u>=0;u--)if(e[u]===!0){n[u]=red;break}return console.log(t),console.log(e),console.log(n),get("custom-head").style.fontSize="18px",get("custom-head").innerHTML="Time remaining",get("custom-sec-box").style.display="block",get("custom-start-pause-button").style.display="inline-block",get("custom-reset-button").style.display="inline-block",get("change-settings-button").style.display="inline-block",get("settings-box").style.display="none",get("done-button").style.display="none",[s,e,n]}function openCustomSettings(){custom.reset(),get("custom-head").style.fontSize="26px",get("custom-head").innerHTML="Change settings",get("custom-sec-box").style.display="none",get("custom-start-pause-button").style.display="none",get("custom-reset-button").style.display="none",get("change-settings-button").style.display="none",get("settings-box").style.display="block",get("done-button").style.display="inline-block"}function makeCustom(){custom=new CustomTimer("Custom",changeCustomSettings(),"custom-box","custom-sec-box","custom-sec-number","custom-start-pause-button","custom-reset-button",customSounds),get("custom-start-pause-button").onclick=custom.startpause,get("custom-reset-button").onclick=custom.reset}$("#continue-button").click(function(){$("#splash").fadeOut(400),$("#splashcover").fadeOut(400,function(){$("html").css("overflow","auto"),$("body").css("overflow","auto")})});var mobile=getProperty("title","width")<601,teamWidth=getButtonWidth("team-open"),indivWidth=getButtonWidth("indiv-open"),hustleWidth=getButtonWidth("hustle-open"),cipheringWidth=getButtonWidth("ciphering-open"),relayWidth=getButtonWidth("relay-open"),speedWidth=getButtonWidth("speed-open"),mentalWidth=getButtonWidth("mental-open"),continuousWidth=getButtonWidth("continuous-open"),customWidth=getButtonWidth("custom-open");if(mobile){for(var widths=[teamWidth,indivWidth,hustleWidth,cipheringWidth,relayWidth,speedWidth,mentalWidth,continuousWidth,customWidth],w=0;w<widths.length;w++)widths[w]+=5;var descending=widths.sort(function(t,e){return e-t}),largest=descending[0];setButtonWidth("team-open",largest),setButtonWidth("indiv-open",largest),setButtonWidth("hustle-open",largest),setButtonWidth("ciphering-open",largest),setButtonWidth("relay-open",largest),setButtonWidth("speed-open",largest),setButtonWidth("mental-open",largest),setButtonWidth("continuous-open",largest),setButtonWidth("custom-open",largest)}else{var row1=teamWidth+indivWidth,row2=hustleWidth+cipheringWidth+relayWidth,row3=speedWidth+mentalWidth,row4=continuousWidth+customWidth,descending=[row1+15,row2+15,row3+15,row4+15].sort(function(t,e){return e-t}),largest=descending[0];setButtonWidth("team-open",teamWidth/row1*largest),setButtonWidth("indiv-open",indivWidth/row1*largest),setButtonWidth("hustle-open",hustleWidth/row2*largest),setButtonWidth("ciphering-open",cipheringWidth/row2*largest),setButtonWidth("relay-open",relayWidth/row2*largest),setButtonWidth("speed-open",speedWidth/row3*largest),setButtonWidth("mental-open",mentalWidth/row3*largest),setButtonWidth("continuous-open",continuousWidth/row4*largest),setButtonWidth("custom-open",customWidth/row4*largest)}var roundDeltaT=1e3,extendedDeltaT=1e3,red="hsl(0, 90%, 52%)",orange="hsl(25, 90%, 52%)",yellow="hsl(50, 90%, 52%)",gray="hsl(0, 0%, 40%)",whitish="hsl(34, 37%, 96%)",accurateInterval=function(t,e){var n,s,o,i,u;return s=(new Date).getTime()+e,o=null,"function"==typeof e&&(u=[e,t],t=u[0],e=u[1]),i=function(){return s+=e,o=setTimeout(i,s-(new Date).getTime()),t()},n=function(){return clearTimeout(o)},o=setTimeout(i,s-(new Date).getTime()),{cancel:n}};ContinuousTimer.prototype=new ExtendedTimer;var custom=null,fourDigitSize=parseFloat(window.getComputedStyle(get("custom-sec-number"),null).getPropertyValue("font-size"));CustomTimer.prototype=new ExtendedTimer,get("done-button").onclick=makeCustom,get("change-settings-button").onclick=openCustomSettings,get("custom-open").onclick=function(){get("title").innerHTML="Custom",get("button-box").style.display="none",get("custom-box").style.display="block",get("back-button").style.display="inline-block"};var teamSounds={15:"fifteenseconds",75:"fifteenseconds",135:"fifteenseconds",195:"fifteenseconds",180:"secondminute",120:"thirdminute",60:"fourthminute",0:"time"},cipheringSounds={15:"fifteenseconds",75:"fifteenseconds",135:"fifteenseconds",120:"secondminute",60:"thirdminute",0:"time"},relaySounds={15:"fifteenseconds",135:"fifteenseconds",255:"fifteenseconds",240:"secondround",120:"thirdround",0:"time"},indivSounds={900:"fifteenminutes",300:"fiveminutes",60:"oneminute",0:"time"},hustleSounds={15:"fifteenseconds",315:"fifteenseconds",615:"fifteenseconds",915:"fifteenseconds",1215:"fifteenseconds",60:"oneminute",360:"oneminute",660:"oneminute",960:"oneminute",1260:"oneminute",1200:"secondround",900:"thirdround",600:"fourthround",300:"fifthround",0:"time"},continuousSounds={15:"fifteenseconds",0:"newminute"},speedSounds={60:"oneminute",15:"fifteenseconds",0:"time"},mentalSounds=speedSounds,customSounds={900:"fifteenminutes",300:"fiveminutes",60:"oneminute",15:"fifteenseconds",0:"time"},team=new RoundTimer("Team Round",240,60,15,"team-box","team-min-box","team-min-number","team-sec-box","team-sec-number","team-start-button","team-start-button-num","team-ghost-button","team-ghost-button-num","team-pause-button","team-stop-button","team-redo-button-wrapper",teamSounds),ciphering=new RoundTimer("Ciphering Round",180,60,15,"ciphering-box","ciphering-min-box","ciphering-min-number","ciphering-sec-box","ciphering-sec-number","ciphering-start-button","ciphering-start-button-num","ciphering-ghost-button","ciphering-ghost-button-num","ciphering-pause-button","ciphering-stop-button","ciphering-redo-button-wrapper",cipheringSounds),relay=new RoundTimer("Relay",360,120,10,"relay-box","relay-round-box","relay-round-number","relay-sec-box","relay-sec-number","relay-start-button","relay-start-button-num","relay-ghost-button","relay-ghost-button-num","relay-pause-button","relay-stop-button","relay-redo-button-wrapper",relaySounds),msg="You either went AFK for a really long time or are super dedicated. Props. (y)",indiv=new ExtendedTimer("Individual Round",3600,"indiv-box",null,null,0,"indiv-sec-box","indiv-sec-number","indiv-start-pause-button","indiv-reset-button",indivSounds),hustle=new ExtendedTimer("Hustle",1500,"hustle-box","hustle-round-box","hustle-round-number",300,"hustle-sec-box","hustle-sec-number","hustle-start-pause-button","hustle-reset-button",hustleSounds),continuous=new ContinuousTimer("Continuous",21600,"continuous-box","continuous-min-box","continuous-min-number",60,"continuous-sec-box","continuous-sec-number","continuous-start-pause-button","continuous-reset-button",continuousSounds),speed=new ExtendedTimer("Speed Math",900,"speed-box",null,null,0,"speed-sec-box","speed-sec-number","speed-start-pause-button","speed-reset-button",speedSounds),mental=new ExtendedTimer("Mental Math",480,"mental-box",null,null,0,"mental-sec-box","mental-sec-number","mental-start-pause-button","mental-reset-button",mentalSounds);get("back-button").onclick=back,get("team-open").onclick=team.makeInterface,get("team-start-button").onclick=team.start,get("team-stop-button").onclick=team.finish,get("team-pause-button").onclick=team.pause,get("team-redo-button").onclick=team.redo,get("ciphering-open").onclick=ciphering.makeInterface,get("ciphering-start-button").onclick=ciphering.start,get("ciphering-stop-button").onclick=ciphering.finish,get("ciphering-pause-button").onclick=ciphering.pause,get("ciphering-redo-button").onclick=ciphering.redo,get("relay-open").onclick=relay.makeInterface,get("relay-start-button").onclick=relay.start,get("relay-stop-button").onclick=relay.finish,get("relay-pause-button").onclick=relay.pause,get("relay-redo-button").onclick=relay.redo,get("indiv-open").onclick=indiv.makeInterface,get("indiv-start-pause-button").onclick=indiv.startpause,get("indiv-reset-button").onclick=indiv.reset,get("hustle-open").onclick=hustle.makeInterface,get("hustle-start-pause-button").onclick=hustle.startpause,get("hustle-reset-button").onclick=hustle.reset,get("continuous-open").onclick=continuous.makeInterface,get("continuous-start-pause-button").onclick=continuous.startpause,get("continuous-reset-button").onclick=continuous.reset,get("speed-open").onclick=speed.makeInterface,get("speed-start-pause-button").onclick=speed.startpause,get("speed-reset-button").onclick=speed.reset,get("mental-open").onclick=mental.makeInterface,get("mental-start-pause-button").onclick=mental.startpause,get("mental-reset-button").onclick=mental.reset;var audioDict={};audioDict.audioBuffersByName={},audioDict.audio_src={};var audioURLsByName={silent:"sounds/silent.mp3",time:"sounds/time.mp3",fifteenseconds:"sounds/fifteenseconds.mp3",secondminute:"sounds/secondminute.mp3",thirdminute:"sounds/thirdminute.mp3",fourthminute:"sounds/fourthminute.mp3",newminute:"sounds/newminute.mp3",fifteenminutes:"sounds/fifteenminutes.mp3",fiveminutes:"sounds/fiveminutes.mp3",oneminute:"sounds/oneminute.mp3",secondround:"sounds/secondround.mp3",thirdround:"sounds/thirdround.mp3",fourthround:"sounds/fourthround.mp3",fifthround:"sounds/fifthround.mp3",ready:"sounds/ready.mp3",begin:"sounds/begin.mp3",question:"sounds/question.mp3",1:"sounds/numbers/1.mp3",2:"sounds/numbers/2.mp3",3:"sounds/numbers/3.mp3",4:"sounds/numbers/4.mp3",5:"sounds/numbers/5.mp3",6:"sounds/numbers/6.mp3",7:"sounds/numbers/7.mp3",8:"sounds/numbers/8.mp3",9:"sounds/numbers/9.mp3",10:"sounds/numbers/10.mp3",11:"sounds/numbers/11.mp3",12:"sounds/numbers/12.mp3",13:"sounds/numbers/13.mp3",14:"sounds/numbers/14.mp3",15:"sounds/numbers/15.mp3"},playHowl=function(t){var e=new Howl({urls:[audioURLsByName[t]]});e.play()},playHowlCallback=function(t,e){var n=new Howl({urls:[audioURLsByName[t]],onend:e});n.play()};
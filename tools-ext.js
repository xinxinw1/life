/***** State *****/

var udfp = $.udfp;
var timer = $.timer;
var max = $.max;
var everyn = $.everyn;
var avgcol = $.avgcol;
var medcol = $.medcol;

/*function itr(f, n){
  if (udfp(n))n = 0;
  
  var runner;
  var intervalchanged = false;
  
  function run(){
    if (intervalchanged){
      clearTimeout(runner);
      intervalchanged = false;
      runner = setInterval(run, n);
    }
    f();
  }
  
  var onstart = function (){};
  var onstop = function (){};
  
  function started(){
    return !udfp(runner);
  }
  
  function start(){
    if (!started()){
      onstart();
      intervalchanged = false;
      run();
      runner = setInterval(run, n);
    }
  }
  
  function stop(){
    if (started()){
      clearTimeout(runner);
      runner = udf;
      onstop();
    }
  }
  
  function startstop(){
    if (!started())start();
    else stop();
  }
  
  function interval(n2){
    n = n2;
    intervalchanged = true;
  }
  
  function speed(s){
    interval(Math.round(1000/s));
  }
  
  return {
    start: start,
    stop: stop,
    startstop: startstop,
    started: started,
    set onstart(f){onstart = f},
    set onstop(f){onstop = f;},
    interval: interval,
    speed: speed,
    get runner(){return runner}
  }
}*/

function avgcoln(max){
  var arr = [];
  var avg = null;
  var n = 0;
  
  function add(a){
    if (n < max){
      if (avg === null)avg = a;
      else avg = n/(n+1)*avg + a/(n+1);
      n++;
    } else {
      var last = arr.shift();
      avg += (a-last)/n;
    }
    arr.push(a);
  }
  
  function get(){
    return avg;
  }
  
  function reset(){
    avg = null;
    n = 0;
    arr = [];
  }
  
  return {
    add: add,
    get: get,
    reset: reset,
    arr: arr
  };
}

function itr(f, n){
  if (udfp(n))n = 0;
  
  var runner;
  var needreset = true;
  var timr;
  var runs;
  
  function run(){
    if (needreset){
      runs = 0;
      timr = timer();
      onreset();
      needreset = false;
    }
    //console.log("behind: " + (timr.time()-(runs*n)));
    step();
    runs++;
    runner = setTimeout(run, max((runs*n)-timr.time(), 0));
  }
  
  function step(){
    f();
  }
  
  var onstart = function (){};
  var onstop = function (){};
  var onreset = function (){};
  
  function started(){
    return !udfp(runner);
  }
  
  function start(){
    if (!started()){
      onstart();
      run();
    }
  }
  
  function stop(){
    if (started()){
      clearTimeout(runner);
      runner = udf;
      needreset = true;
      onstop();
    }
  }
  
  function startstop(){
    if (!started())start();
    else stop();
  }
  
  function interval(n2){
    n = n2;
    needreset = true;
  }
  
  return {
    start: start,
    stop: stop,
    startstop: startstop,
    started: started,
    step: step,
    set onstart(f){onstart = f},
    set onstop(f){onstop = f;},
    set onreset(f){onreset = f;},
    interval: interval
  }
}

function itractual(f, n){
  var runner = itr(run, n);
  
  var evryn = everyn(10, function (){
    actualinterval(avgint.get());
  });
  
  var actinttimr;
  var avgint = avgcoln(100);
  function run(){
    if (!udfp(actinttimr)){
      avgint.add(actinttimr.time());
      evryn.check();
    }
    actinttimr = timer();
    step();
  }
  
  function step(){
    f();
  }
  
  var actualinterval = function (n){};
  
  runner.onreset = function (){
    avgint.reset();
    evryn.reset();
    actinttimr = udf;
  };
  
  function interval(n){
    runner.interval(n);
  }
  
  return {
    start: runner.start,
    stop: runner.stop,
    startstop: runner.startstop,
    started: runner.started,
    step: step,
    set onstart(f){runner.onstart = f},
    set onstop(f){runner.onstop = f;},
    set actualinterval(f){actualinterval = f;},
    interval: interval
  };
}

// n = runs/sec
function itrspeed(f, s){
  var runner = itractual(f);
  
  function speed(s){
    runner.interval(Math.round(1000/s));
  }
  
  if (!udfp(s))speed(s);
  
  var actualspeed = function (s){};
  
  // n = ms/run
  // s = runs/sec
  runner.actualinterval = function (n){
    console.log("actualinterval: " + n);
    actualspeed(1000/n);
  };
  
  return {
    start: runner.start,
    stop: runner.stop,
    startstop: runner.startstop,
    started: runner.started,
    step: runner.step,
    set onstart(f){runner.onstart = f},
    set onstop(f){runner.onstop = f;},
    speed: speed,
    set actualspeed(f){actualspeed = f;},
    runner: runner
  };
}

function itrrefresh(f, s){
  var runner = itrspeed(step);
  
  var onstart = function (){};
  var onstop = function (){};
  
  runner.onstart = function (){
    onstart();
  };
  
  runner.onstop = function (){
    refresher.reset();
    onstop();
  }
  
  function step(){
    f();
    refresher.check();
  }
  
  var refresher = everyn(0, refresh);
  
  var onrefresh = function (state){};
  
  function refresh(){
     onrefresh();
  }
  
  var refsPerSec;
  function setRefreshRate(r){
    refsPerSec = r;
  }
  
  setRefreshRate(1);
  
  function refreshRate(r){
    setRefreshRate(r);
    updateRuns(runsPerSec);
  }
  
  var runsPerSec;
  function speed(s){
    updateRuns(s);
    runner.speed(s);
  }
  
  function updateRuns(s){
    runsPerSec = s;
    var runsPerRef = Math.round(runsPerSec/refsPerSec);
    refresher.setn(runsPerRef);
    console.log("runsPerRef " + runsPerRef);
  }
  
  speed(50);
  
  runner.actualspeed = updateRuns;
  
  if (!udfp(s))speed(s);
  
  return {
    set onstart(f){onstart = f;},
    set onstop(f){onstop = f;},
    set onrefresh(f){onrefresh = f;},
    start: runner.start,
    stop: runner.stop,
    startstop: runner.startstop,
    started: runner.started,
    step: step,
    speed: speed,
    refresh: refresh,
    refreshRate: refreshRate,
    runner: runner
  };
}
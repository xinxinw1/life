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
  if (udfp(n))n = 0; // n = ms/run
  
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
    f();
    runs++;
    runner = setTimeout(run, max((runs*n)-timr.time(), 0));
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
    set onstart(f){onstart = f},
    set onstop(f){onstop = f;},
    set onreset(f){onreset = f;},
    interval: interval
  }
}

function itrspeed(f, s){
  if (udfp(s))s = 50; // s = runs/sec
  
  var runner = itr(f);
  
  function speed(s){
    runner.interval(Math.round(1000/s));
  }
  
  speed(s);
  
  return {
    start: runner.start,
    stop: runner.stop,
    startstop: runner.startstop,
    started: runner.started,
    set onstart(f){runner.onstart = f},
    set onstop(f){runner.onstop = f;},
    speed: speed,
    runner: runner
  };
}

function itrrefresh(f, s, r){
  if (udfp(s))s = 50; // s = runs/sec
  if (udfp(r))r = 1; // r = refs/sec
  
  var runner = itrspeed(run, s);
  
  var onstart = function (){};
  var onstop = function (){};
  
  runner.onstart = function (){
    onstart();
  };
  
  runner.onstop = function (){
    refresher.reset();
    onstop();
  }
  
  function run(){
    f();
    refresher.check();
  }
  
  var refresher = everyn(refresh);
  
  var onrefresh = function (state){};
  
  function refresh(){
     onrefresh();
  }
  
  function refspeed(r2){
    r = r2;
    updateRefresher();
  }
  
  function speed(s2){
    s = s2;
    updateRefresher();
    runner.speed(s2);
  }
  
  function updateRefresher(){
    var runsPerRef = Math.round(s/r);
    refresher.setn(runsPerRef);
    //console.log("runsPerRef " + runsPerRef);
  }
  
  updateRefresher();
  
  return {
    set onstart(f){onstart = f;},
    set onstop(f){onstop = f;},
    set onrefresh(f){onrefresh = f;},
    start: runner.start,
    stop: runner.stop,
    startstop: runner.startstop,
    started: runner.started,
    speed: speed,
    refresh: refresh,
    refspeed: refspeed,
    runner: runner
  };
}

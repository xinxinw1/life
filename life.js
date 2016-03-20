/***** Game of Life *****/

/* require tools */

////// Import //////

var udf = $.udf;
var udfp = $.udfp;
var apply = S.apply;
var fillemptysys = S.fillemptysys;
var makeGrid = G.makeGrid;
var makeSimpleState = S.makeSimpleState;
var makeLifeState = LS.makeLifeState;


function makeJointState(rows, cols){
  var state = makeSimpleState(rows, cols);
  
  var socket = udf;
  
  var fes = fillemptysys();
  
  var over = fes.over;
  
  over.fill = function (i, j){
    socket.emit('fill', i, j);
  };
  
  over.empty = function (i, j){
    socket.emit('empty', i, j);
  };
  
  var filled = function (){return false;};
  
  var fill = fes.fill;
  var empty = fes.empty;
  var set = fes.set;
  var setNum = fes.setNum;
  
  function fillObj(i, j, obj){
    socket.emit('fillobj', i, j, obj);
  }
  
  function start(){
    socket.emit('start');
  }
  
  function stop(){
    socket.emit('stop');
  }
  
  function step(){
    socket.emit('step');
  }
  
  function clear(){
    socket.emit('clear');
  }
  
  function refresh(){
    socket.emit('refresh');
  }
  
  var onfill, onempty, onsetstate, onstart, onstop;
  
  var isstarted = false;
  
  function startstop(){
    if (!isstarted)start();
    else stop();
  }
  
  function started(){
    return isstarted;
  }
  
  function getState(){
    return state;
  }
  
  function clearHandlers(){
    onfill = function (i, j){};
    onempty = function (i, j){};
    onsetstate = function (newstate){};
    onstart = function (){};
    onstop = function (){};
  }
  
  clearHandlers();
  
  function init(newstate){
    socket = io();
    socket.on('fill', function (i, j){
      console.log("received fill");
      state.fill(i, j);
      onfill(i, j);
    });
    
    socket.on('empty', function (i, j){
      console.log("received empty");
      state.empty(i, j);
      onempty(i, j);
    });
    
    socket.on('setstate', function (newstate){
      console.log("received setstate");
      state.setState(newstate);
      onsetstate(newstate);
    });
    
    socket.on('start', function (){
      console.log("received start");
      isstarted = true;
      onstart();
    });
    
    socket.on('stop', function (){
      console.log("received stop");
      onstop();
      isstarted = false;
    });
    
    socket.on('connect', function (){
      console.log("connected");
      socket.emit('checkstarted');
      refresh();
    });
    
    socket.on('disconnect', function (){
      console.log("disconnected");
    });
  }
  
  function deinit(){
    onstop();
    clearHandlers();
    socket.disconnect();
    socket.removeAllListeners();
    socket = udf;
    isstarted = false;
    return state.getState();
  }
  
  var speed = function (){};
  var refspeed = function (){};
  
  return {
    valid: state.valid,
    filled: state.filled,
    fill: fill,
    empty: empty,
    fillObj: fillObj,
    set: set,
    setNum: setNum,
    getState: state.getState,
    set onfill(f){onfill = f;},
    set onempty(f){onempty = f;},
    set onsetstate(f){onsetstate = f;},
    set onstart(f){onstart = f;},
    set onstop(f){onstop = f;},
    clearHandlers: clearHandlers,
    start: start,
    stop: stop,
    startstop: startstop,
    started: started,
    step: step,
    clear: clear,
    refresh: refresh,
    speed: speed,
    refspeed: refspeed,
    init: init,
    deinit: deinit
  };
}



var gliderSE = {
  arr: [
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1]
  ],
  center: [2, 2]
};

var gliderGunSE = {
  arr: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]
};

function clockwise(obj, n){
  if (udfp(n))n = 1;
  for (var i = n; i >= 1; i--){
    obj = clockwise1(obj);
  }
  return obj;
}

function clockwise1(obj){
  var arr = obj.arr;
  var origrows = arr.length;
  var origcols = arr[0].length;
  var o = {arr: clockwiseArr(obj.arr)};
  if (!udfp(obj.center)){
    var p = obj.center;
    // this is the reverse of the line in clockwiseArr because
    // it is [newi, newj] = [p[1], origrows-1-p[0]]
    // while the other one is [oldi, oldj] = [origrows-1-j, i];
    o.center = [p[1], origrows-1-p[0]];
  }
  return o;
}

function clockwiseArr(arr){
  var origrows = arr.length;
  var origcols = arr[0].length;
  var r = [];
  for (var i = 0; i < origcols; i++){
    r[i] = [];
    for (var j = 0; j < origrows; j++){
      r[i][j] = arr[origrows-1-j][i];
    }
  }
  return r;
}

var speeds = [1, 2, 4, 10, 20, 50, 100, 1000]; // runs/second
var currspeed = 6;
var currrefspeed = 0;

function speed(s){
  state.speed(s);
  $("currspeed").innerHTML = "" + s + " runs/sec";
}

function faster(){
  if (currspeed+1 < speeds.length)currspeed++;
  speed(speeds[currspeed]);
}

function slower(){
  if (currspeed-1 >= 0)currspeed--;
  speed(speeds[currspeed]);
}

function refspeed(s){
  state.refspeed(s);
  $("refspeed").innerHTML = "" + s + " refs/sec";
}

function reffaster(){
  if (currrefspeed+1 < speeds.length)currrefspeed++;
  refspeed(speeds[currrefspeed]);
}

function refslower(){
  if (currrefspeed-1 >= 0)currrefspeed--;
  refspeed(speeds[currrefspeed]);
}


function retFalseFn(f){
  return function aFalseFn(){
    f();
    return false;
  };
}

function pressedButton(elem){
  elem.className = "pressed";
}

function notPressedButton(elem){
  elem.className = "";
}

function enableButton(elem, fn){
  elem.onclick = fn;
  notPressedButton(elem);
}

function disableButton(elem){
  elem.onclick = udf;
  pressedButton(elem);
}

function enableLink(elem, fn){
  elem.setAttribute('href', "#");
  elem.onclick = retFalseFn(fn);
}

function disableLink(elem){
  elem.removeAttribute('href');
  elem.onclick = udf;
}

function clearMode(){
  grid.clearHandlers();
}

function insertMode(obj, n){
  if (!udfp(n))obj = clockwise(obj, n);
  clearMode();
  grid.onenter = function (i, j){
    grid.setOver(i, j, obj);
  };
  grid.onleavegrid = grid.clearOver;
  grid.onclick = function (i, j){
    state.fillObj(i, j, obj);
  };
}

function emptyMode(){
  resetButtons();
  clearMode();
}

function drawMode(){
  resetButtons();
  disableButton($("draw"));
  clearMode();
  grid.ondrag = function (i, j){
    state.fill(i, j);
  };
  grid.savedata = function (i, j){
    return state.filled(i, j);
  };
  grid.onclickone = function (i, j, origfill){
    state.set(!origfill, i, j);
  };
}

function resetDrawButtons(){
  enableButton($("draw"), drawMode);
}

function gliderMode(){
  gliderSEMode();
}

function gliderButtons(){
  resetButtons();
  disableButton($("glider"));
  $("glideropts").style.display = 'inline';
}

function resetGliderOptButtons(){
  enableLink($("gliderse"), gliderSEMode);
  enableLink($("glidersw"), gliderSWMode);
  enableLink($("glidernw"), gliderNWMode);
  enableLink($("gliderne"), gliderNEMode);
}

function gliderSEMode(){
  gliderButtons();
  disableLink($("gliderse"));
  insertMode(gliderSE, 0);
}

function gliderSWMode(){
  gliderButtons();
  disableLink($("glidersw"));
  insertMode(gliderSE, 1);
}

function gliderNWMode(){
  gliderButtons();
  disableLink($("glidernw"));
  insertMode(gliderSE, 2);
}

function gliderNEMode(){
  gliderButtons();
  disableLink($("gliderne"));
  insertMode(gliderSE, 3);
}

function resetGliderButtons(){
  enableButton($("glider"), gliderMode);
  $("glideropts").style.display = 'none';
  resetGliderOptButtons();
}

function gliderGunMode(){
  gliderGunSEMode();
}

function gliderGunButtons(){
  resetButtons();
  disableButton($("glidergun"));
  $("glidergunopts").style.display = 'inline';
}

function resetGliderGunOptButtons(){
  enableLink($("glidergunse"), gliderGunSEMode);
  enableLink($("glidergunsw"), gliderGunSWMode);
  enableLink($("glidergunnw"), gliderGunNWMode);
  enableLink($("glidergunne"), gliderGunNEMode);
}

function gliderGunSEMode(){
  gliderGunButtons();
  disableLink($("glidergunse"));
  insertMode(gliderGunSE, 0);
}

function gliderGunSWMode(){
  gliderGunButtons();
  disableLink($("glidergunsw"));
  insertMode(gliderGunSE, 1);
}

function gliderGunNWMode(){
  gliderGunButtons();
  disableLink($("glidergunnw"));
  insertMode(gliderGunSE, 2);
}

function gliderGunNEMode(){
  gliderGunButtons();
  disableLink($("glidergunne"));
  insertMode(gliderGunSE, 3);
}

function resetGliderGunButtons(){
  enableButton($("glidergun"), gliderGunMode);
  $("glidergunopts").style.display = 'none';
  resetGliderGunOptButtons();
}

function resetButtons(){
  resetDrawButtons();
  resetGliderButtons();
  resetGliderGunButtons();
}

var isjoint = false;

var jointstate, regstate;

function jointModeOn(){
  if (!isjoint){
    setState(jointstate);
    pressedButton($('joint'));
    isjoint = true;
  }
}

function jointModeOff(){
  if (isjoint){
    setState(regstate);
    notPressedButton($('joint'));
    isjoint = false;
  }
}

function jointModeToggle(){
  if (!isjoint)jointModeOn();
  else jointModeOff();
}

function setState(state){
  var oldstate = window.state;
  if (!udfp(oldstate))state.init(oldstate.deinit());
  else state.init();
  
  state.onstart = function (){
    $("startstop").innerHTML = "Stop";
  };
  
  state.onstop = function (){
    $("startstop").innerHTML = "Start";
  };
  
  state.onfill = grid.fill;
  state.onempty = grid.empty;
  state.onsetstate = grid.setState;
  
  window.start = state.start;
  window.stop = state.stop;
  window.step = state.step;
  window.startstop = state.startstop;
  window.clear = state.clear;
  
  $("startstop").onclick = startstop;
  $("step").onclick = step;
  $("clear").onclick = clear;
  
  window.state = state;
}

document.addEventListener("DOMContentLoaded", function (){
  window.grid = makeGrid($("grid"), 80, 170);
  window.jointstate = makeJointState(80, 170);
  window.regstate = makeLifeState(80, 170);
  setState(regstate);
  
  speed(speeds[currspeed]);
  refspeed(speeds[currrefspeed]);
  
  $("joint").onclick = jointModeToggle;
  $("faster").onclick = faster;
  $("slower").onclick = slower;
  $("reffaster").onclick = reffaster;
  $("refslower").onclick = refslower;
  
  drawMode(grid);
});

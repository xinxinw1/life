/***** Game of Life *****/

/* require tools */

////// Import //////

var udf = T.udf;
var udfp = T.udfp;
var rem = T.rem;
var att = T.att;
var elm = T.elm;
var txt = T.txt;
var clr = T.clr;
var itr = T.itr;
var stp = T.stp;

function makeGrid(elem, rows, cols, layers){
  if (udfp(layers))layers = 1;
  var states = [];
  var layarr = [];
  for (var k = 0; k < layers; k++){
    layarr[k] = [];
    states[k] = [];
  }
  
  var gridarr = [];
  for (var i = 0; i < rows; i++){
    gridarr[i] = [];
    var row = elm("div");
    for (var k = 0; k < layers; k++){
      layarr[k][i] = [];
      states[k][i] = [];
    }
    for (var j = 0; j < cols; j++){
      var col = elm("div");
      for (var k = 0; k < layers; k++){
        var lay = elm("div");
        att(col, lay);
        layarr[k][i][j] = lay;
        states[k][i][j] = false;
      }
      att(row, col);
      gridarr[i][j] = col;
    }
    att(elem, row);
  }
  
  function fill(i, j, l, cls){
    if (udfp(l))l = 0;
    if (udfp(cls))cls = "fill";
    if (udfp(layarr[l]))return;
    if (udfp(layarr[l][i]))return;
    if (udfp(layarr[l][i][j]))return;
    layarr[l][i][j].className = cls;
    states[l][i][j] = true;
  }
  
  function empty(i, j, l){
    if (udfp(l))l = 0;
    if (udfp(layarr[l]))return;
    if (udfp(layarr[l][i]))return;
    if (udfp(layarr[l][i][j]))return;
    layarr[l][i][j].className = "";
    states[l][i][j] = false;
  }
  
  function set(tf, i, j, l, cls){
    (tf?fill:empty)(i, j, l, cls);
  }
  
  function isFilled(i, j, l){
    if (udfp(l))l = 0;
    if (udfp(layarr[l]))return false;
    if (udfp(layarr[l][i]))return false;
    if (udfp(layarr[l][i][j]))return false;
    return layarr[l][i][j].className != "";
  }
  
  function toggle(i, j, l, cls){
    set(!isFilled(i, j, l), i, j, l, cls);
  }
  
  function fillArr(i, j, arr, ci, cj){
    if (udfp(ci))ci = Math.floor(arr.length/2);
    if (udfp(cj))cj = Math.floor(arr[0].length/2);
    for (var r = 0; r < arr.length; r++){
      for (var c = 0; c < arr[r].length; c++){
        if (arr[r][c] === 1)fill(i+r-ci, j+c-cj);
      }
    }
  }
  
  function clearLayer(l){
    for (var i = 0; i < layarr[l].length; i++){
      for (var j = 0; j < layarr[l][i].length; j++){
        empty(i, j, l);
      }
    }
  }
  
  function clear(l){
    if (!udfp(l))clearLayer(l);
    for (var k = 0; k < layarr.length; k++){
      clearLayer(k);
    }
  }
  
  function getStates(l){
    if (udfp(l))l = 0;
    return states[l];
  }
  
  function applyStates(newstates, l){
    if (udfp(l))l = 0;
    for (var i = 0; i < layarr[l].length; i++){
      for (var j = 0; j < layarr[l][i].length; j++){
        if (states[l][i][j] !== newstates[i][j]){
          set(newstates[i][j], i, j, l);
        }
      }
    }
  }
  
  var ondrag = function (grid, i, j){};
  var onclick = function (grid, i, j){};
  var onclickone = function (grid, i, j, origfill){};
  
  var origfill = udf;
  var hasPressedDown = false;
  var hasDragged = false;
  var isDragging = false;

  function mkDownFn(i, j){
    return function downHandle(e){
      if (e.which === 1){
        //console.log("mousedown i " + i + " j " + j);
        origfill = isFilled(i, j);
        hasPressedDown = true;
        hasDragged = false;
        ondrag(grid, i, j);
        return false;
      }
    };
  }
  
  function mkUpFn(i, j){
    return function upHandle(e){
      if (e.which === 1){
        //console.log("mouseup i " + i + " j " + j);
        if (hasPressedDown && !hasDragged){
          onclickone(grid, i, j, origfill);
        }
        onclick(grid, i, j);
      }
    };
  }
  
  function mkOverFn(i, j){
    return function overHandle(e){
      //console.log("mouseover i " + i + " j " + j);
      if (isDragging){
        ondrag(grid, i, j);
        hasDragged = true;
      }
    }
  }
  
  function setOnclick(fn){
    onclick = fn;
  }
  
  function setOndrag(fn){
    ondrag = fn;
  }
  
  function setOnclickone(fn){
    onclickone = fn;
  }
  
  function clearHandlers(){
    ondrag = function (grid, i, j){};
    onclick = function (grid, i, j){};
    onclickone = function (grid, i, j, origfill){};
  }
  
  elem.onmousedown = function gridDownHandle(e){
    if (e.which === 1){
      //console.log("grid mousedown");
      isDragging = true;
      return false;
    }
  };
  
  document.onmouseup = function docUpHandle(e){
    if (e.which === 1){
      //console.log("global mouseup");
      isDragging = false;
      hasPressedDown = false;
      hasDragged = false;
    }
  };
  
  for (var i = 0; i < gridarr.length; i++){
    for (var j = 0; j < gridarr[i].length; j++){
      $(gridarr[i][j]).on("mouseenter", mkOverFn(i, j));
      gridarr[i][j].onmousedown = mkDownFn(i, j);
      gridarr[i][j].onmouseup = mkUpFn(i, j);
    }
  }
  
  var grid = {
    isFilled: isFilled,
    fill: fill,
    fillArr: fillArr,
    empty: empty,
    set: set,
    toggle: toggle,
    clear: clear,
    clearLayer: clearLayer,
    getStates: getStates,
    applyStates: applyStates,
    states: states,
    layarr: layarr,
    gridarr: gridarr,
    setOnclick: setOnclick,
    setOndrag: setOndrag,
    setOnclickone: setOnclickone,
    clearHandlers: clearHandlers
  };
  
  return grid;
}

function makeEmptyStates(states){
  var newstates = [];
  for (var i = 0; i < states.length; i++){
    newstates[i] = [];
    for (var j = 0; j < states[i].length; j++){
      newstates[i][j] = false;
    }
  }
  return newstates;
}

function getNextStates(states){
  var newstates = makeEmptyStates(states);
  for (var i = 0; i < newstates.length; i++){
    for (var j = 0; j < newstates[i].length; j++){
      newstates[i][j] = getNext1(states, i, j);
    }
  }
  return newstates;
}

function isLive(states, i, j){
  if (i < 0 || j < 0)return false;
  if (i >= states.length || j >= states[i].length)return false;
  return states[i][j];
}

function liveNeighbors(states, i, j){
  var n = 0;
  if (isLive(states, i-1, j-1))n++;
  if (isLive(states, i-1, j))n++;
  if (isLive(states, i-1, j+1))n++;
  if (isLive(states, i, j-1))n++;
  if (isLive(states, i, j+1))n++;
  if (isLive(states, i+1, j-1))n++;
  if (isLive(states, i+1, j))n++;
  if (isLive(states, i+1, j+1))n++;
  return n;
}

function getNext1(states, i, j){
  var n = liveNeighbors(states, i, j);
  if (isLive(states, i, j)){
    return n == 2 || n == 3;
  } else {
    return n == 3;
  }
}

var grid;
var clear;

function life(){
  grid.applyStates(getNextStates(grid.getStates()));
}

var gliderSE = [
  [0, 0, 1],
  [1, 0, 1],
  [0, 1, 1]
];

function clockwise(arr, n){
  for (var i = n; i >= 1; i--){
    arr = clockwise1(arr);
  }
  return arr;
}

function clockwise1(arr){
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

function fillGliderSE(grid, i, j){
  grid.fillArr(i, j, gliderSE);
}

function fillGliderSW(grid, i, j){
  grid.fillArr(i, j, clockwise(gliderSE, 1));
}

function fillGliderNW(grid, i, j){
  grid.fillArr(i, j, clockwise(gliderSE, 2));
}

function fillGliderNE(grid, i, j){
  grid.fillArr(i, j, clockwise(gliderSE, 3));
}

var speeds = [1, 2, 4, 10, 20, 50, 100, 1000]; // runs/second
var currspeed = 7;
var runner = itr(function gridItrHandle(){life();});

runner.onstart(function runnerStart(){
  $("#startstop").text("Stop");
});

runner.onstop(function runnerStop(){
  $("#startstop").text("Start");
});

var start = runner.start;
var stop = runner.stop;
var startstop = runner.startstop;

function setspeed(n){
  runner.interval(1000/n);
  dispspeed(n);
}

function faster(){
  if (currspeed+1 < speeds.length)currspeed++;
  setspeed(speeds[currspeed]);
}

function slower(){
  if (currspeed-1 >= 0)currspeed--;
  setspeed(speeds[currspeed]);
}

function dispspeed(n){
  $("#currspeed").text("Speed: " + n + " runs/sec");
}

function retFalseFn(f){
  return function aFalseFn(){
    f();
    return false;
  };
}

function retFnCall(f){
  var args = T.sli(arguments, 1);
  return function (){
    return T.apl(f, args);
  };
}

function enableButton(elem, fn){
  elem.onclick = fn;
  elem.className = "";
}

function disableButton(elem){
  elem.onclick = udf;
  elem.className = "pressed";
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

function emptyMode(){
  resetButtons();
  clearMode();
}

function drawMode(){
  resetButtons();
  disableButton(T("draw"));
  clearMode();
  
  grid.setOndrag(function (grid, i, j){
    //console.log("ondrag");
    grid.fill(i, j);
  });
  
  grid.setOnclickone(function (grid, i, j, origfill){
    //console.log("onclickone");
    //console.log(origfill);
    grid.set(!origfill, i, j);
  });
}

function resetDrawButtons(){
  enableButton(T("draw"), drawMode);
}

function gliderMode(){
  gliderSEMode();
}

function gliderButtons(){
  resetButtons();
  disableButton(T("glider"));
  $("#glideropts").show();
}

function resetGliderOptButtons(){
  enableLink(T("gliderse"), gliderSEMode);
  enableLink(T("glidersw"), gliderSWMode);
  enableLink(T("glidernw"), gliderNWMode);
  enableLink(T("gliderne"), gliderNEMode);
}

function gliderSEMode(){
  gliderButtons();
  disableLink(T("gliderse"));
  clearMode();
  grid.setOnclick(fillGliderSE);
}

function gliderSWMode(){
  gliderButtons();
  disableLink(T("glidersw"));
  clearMode();
  grid.setOnclick(fillGliderSW);
}

function gliderNWMode(){
  gliderButtons();
  disableLink(T("glidernw"));
  clearMode();
  grid.setOnclick(fillGliderNW);
}

function gliderNEMode(){
  gliderButtons();
  disableLink(T("gliderne"));
  clearMode();
  grid.setOnclick(fillGliderNE);
}

function resetGliderButtons(){
  enableButton(T("glider"), gliderMode);
  $("#glideropts").hide();
  resetGliderOptButtons();
}

function resetButtons(){
  resetDrawButtons();
  resetGliderButtons();
}

$(function (){
  grid = makeGrid(T("grid"), 80, 170, 2);
  clear = grid.clear;
  
  setspeed(speeds[currspeed]);
  
  $("#startstop").click(startstop);
  $("#clear").click(function (){stop();clear();});
  $("#faster").click(faster);
  $("#slower").click(slower);
  
  drawMode(grid);
});

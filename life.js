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

var gsn = 0;

function gs(){
  return gsn++;
}

function stysheet(){
  att(document.body, elm('style'));
  return T.las(document.styleSheets);
}

function sty(){
  var style = stysheet();
  var rules = style.cssRules?style.cssRules:style.rules;
  
  var n = 0;
  
  function push(rule){
    style.insertRule(rule, 0);
    n++;
  }
  
  function get(i){
    return rules[n-1-i];
  }
  
  function has(i){
    return !udfp(get(i));
  }
  
  function set(i, rule){
    if (has(i))del(i);
    ins(i, rule);
  }
  
  function ins(i, rule){
    style.insertRule(rule, n-i);
    n++;
  }
  
  function del(i){
    style.deleteRule(n-1-i);
    n--;
  }
  
  function len(){
    return n;
  }
  
  return {
    push: push,
    get: get,
    has: has,
    set: set,
    ins: ins,
    del: del,
    style: style,
    get length(){return n;}
  };
}

function makeSimpleGrid(elem, rows, cols){
  var gridcls = 'sgrid' + gs();
  
  var borderstyle = sty();
  function setBorder(str){
    borderstyle.set(0, 'div.' + gridcls + ' {border-top: ' + str + '; border-left: ' + str + ';}');
    borderstyle.set(1, 'div.' + gridcls + ' > div > div {border-right: ' + str + '; border-bottom: ' + str + ';}');
  }
  
  setBorder("1px dotted #AAA");
  
  var fillcolorstyle = sty();
  function setFillColor(str){
    fillcolorstyle.set(0, 'div.' + gridcls + ' > div > div.fill {background-color: ' + str + ';}');
  }
  
  setFillColor("#000");
  
  var fillopacitystyle = sty();
  function setFillOpacity(str){
    fillopacitystyle.set(0, 'div.' + gridcls + ' > div > div.fill {opacity: ' + str + ';}');
  }
  
  var cellstyle = sty();
  function setCellSize(str){
    cellstyle.set(0, 'div.' + gridcls + ' > div > div {width: ' + str + '; height: ' + str + '; min-width: ' + str + '; min-height: ' + str + ';}');
  }
  
  setCellSize("10px");
  
  var grid;
  
  elem.classList.add('sgrid');
  elem.classList.add(gridcls);
  var gridarr = [];
  var state = [];
  for (var i = 0; i < rows; i++){
    gridarr[i] = [];
    state[i] = [];
    var row = elm("div");
    for (var j = 0; j < cols; j++){
      var col = elm("div");
      att(row, col);
      gridarr[i][j] = col;
      state[i][j] = 0;
    }
    att(elem, row);
  }
  
  function fill(i, j, cls){
    if (udfp(cls))cls = "fill";
    if (udfp(gridarr[i]))return;
    if (udfp(gridarr[i][j]))return;
    if (!state[i][j]){
      gridarr[i][j].classList.add(cls);
      state[i][j] = 1;
    }
  }
  
  function empty(i, j){
    if (udfp(gridarr[i]))return;
    if (udfp(gridarr[i][j]))return;
    if (state[i][j]){
      gridarr[i][j].classList.remove("fill");;
      state[i][j] = 0;
    }
  }
  
  function set(tf, i, j, cls){
    (tf?fill:empty)(i, j, cls);
  }
  
  function setNum(st, i, j, cls){
    set(st === 1, i, j, cls);
  }
  
  function isFilled(i, j){
    if (udfp(state[i]))return false;
    if (udfp(state[i][j]))return false;
    return state[i][j] === 1;
  }
  
  function toggle(i, j, cls){
    set(!isFilled(i, j), i, j, cls);
  }
  
  function clear(){
    for (var i = 0; i < state.length; i++){
      for (var j = 0; j < state[i].length; j++){
        empty(i, j);
      }
    }
  }
  
  function getState(){
    return state;
  }
  
  function applyState(newstate){
    for (var i = 0; i < state.length; i++){
      for (var j = 0; j < state[i].length; j++){
        if (state[i][j] !== newstate[i][j]){
          setNum(newstate[i][j], i, j);
        }
      }
    }
  }
  
  var ondrag = function (grid, i, j){};
  var onclick = function (grid, i, j){};
  var savedata = function (grid, i, j){};
  var onclickone = function (grid, i, j, data){};
  var onenter = function (grid, i, j){};
  var onleavegrid = function (grid){};
  
  function clearHandlers(){
    ondrag = function (grid, i, j){};
    onclick = function (grid, i, j){};
    onclickone = function (grid, i, j, data){};
    onenter = function (grid, i, j){};
    onleavegrid = function (grid){};
  }
  
  var data = udf;
  var hasPressedDown = false;
  var hasDragged = false;
  var isDragging = false;

  function mkDownFn(i, j){
    return function (e){
      if (e.which === 1){
        //console.log("mousedown i " + i + " j " + j);
        data = savedata(grid, i, j);
        hasPressedDown = true;
        hasDragged = false;
        ondrag(grid, i, j);
        return false;
      }
    };
  }
  
  function mkUpFn(i, j){
    return function (e){
      if (e.which === 1){
        //console.log("mouseup i " + i + " j " + j);
        if (hasPressedDown && !hasDragged){
          onclickone(grid, i, j, data);
        }
        onclick(grid, i, j);
      }
    };
  }
  
  function mkEnterFn(i, j){
    return function (e){
      //console.log("mouseover i " + i + " j " + j);
      if (isDragging){
        ondrag(grid, i, j);
        hasDragged = true;
      }
      onenter(grid, i, j);
    }
  }
  
  elem.onmousedown = function gridDownHandle(e){
    if (e.which === 1){
      //console.log("grid mousedown");
      isDragging = true;
      return false;
    }
  };
  
  elem.onmouseleave = function (e){
    onleavegrid(grid);
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
      gridarr[i][j].onmouseenter = mkEnterFn(i, j);
      gridarr[i][j].onmousedown = mkDownFn(i, j);
      gridarr[i][j].onmouseup = mkUpFn(i, j);
    }
  }
  
  grid = {
    setBorder: setBorder,
    setFillColor: setFillColor,
    setFillOpacity: setFillOpacity,
    setCellSize: setCellSize,
    isFilled: isFilled,
    fill: fill,
    empty: empty,
    set: set,
    setNum: setNum,
    toggle: toggle,
    clear: clear,
    getState: getState,
    applyState: applyState,
    gridarr: gridarr,
    set onclick(f){onclick = f},
    set ondrag(f){ondrag = f},
    set savedata(f){savedata = f},
    set onclickone(f){onclickone = f},
    set onenter(f){onenter = f},
    set onleavegrid(f){onleavegrid = f},
    clearHandlers: clearHandlers
  };
  
  return grid;
}

function makeGrid(elem, rows, cols){
  var under = elm("div");
  under.classList.add('under');
  var main = elm("div");
  main.classList.add('main');
  var over = elm("div");
  over.classList.add('over');
  
  var undergrid = makeSimpleGrid(under, rows, cols);
  var maingrid = makeSimpleGrid(main, rows, cols);
  var overgrid = makeSimpleGrid(over, rows, cols);
  
  elem.classList.add('grid');
  att(elem, under, main, over);
  
  function setBorder(str){
    undergrid.setBorder(str);
    maingrid.setBorder(str);
    overgrid.setBorder(str);
  };
  
  function setCellSize(str){
    undergrid.setCellSize(str);
    maingrid.setCellSize(str);
    overgrid.setCellSize(str);
  }
  
  var setMainFillColor = maingrid.setFillColor;
  var setOverFillColor = overgrid.setFillColor;
  var setUnderFillColor = undergrid.setFillColor;
  
  var setMainFillOpacity = maingrid.setFillOpacity;
  var setOverFillOpacity = overgrid.setFillOpacity;
  var setUnderFillOpacity = undergrid.setFillOpacity;
  
  setOverFillColor("#00FF00");
  setOverFillOpacity("0.5");
  
  var fill = maingrid.fill;
  var isFilled = maingrid.isFilled;
  var empty = maingrid.empty;
  var set = maingrid.set;
  
  var clear = maingrid.clear;
  
  var getState = maingrid.getState;
  var applyState = maingrid.applyState;
  
  var applyStateOver = overgrid.applyState;
  
  var fillOver = overgrid.fill;
  var emptyOver = overgrid.empty;
  
  var setOnclick = function (f){
    overgrid.onclick = function (overgrid, i, j){
      f(grid, i, j);
    };
  };
  
  var setOndrag = function (f){
    overgrid.ondrag = function (overgrid, i, j){
      f(grid, i, j);
    };
  };
  
  var setSavedata = function (f){
    overgrid.savedata = function (overgrid, i, j){
      return f(grid, i, j);
    };
  };
  
  var setOnclickone = function (f){
    overgrid.onclickone = function (overgrid, i, j, data){
      f(grid, i, j, data);
    };
  };
  
  var setOnenter = function (f){
    overgrid.onenter = function (overgrid, i, j, data){
      f(grid, i, j, data);
    };
  };
  
  var setOnleavegrid = function (f){
    overgrid.onleavegrid = function (overgrid){
      f(grid);
    };
  };
  
  var clearHandlers = overgrid.clearHandlers;
  
  
  var grid = {
    setBorder: setBorder,
    setCellSize: setCellSize,
    setUnderFillColor: setUnderFillColor,
    setMainFillColor: setMainFillColor,
    setOverFillColor: setOverFillColor,
    setUnderFillOpacity: setUnderFillOpacity,
    setMainFillOpacity: setMainFillOpacity,
    setOverFillOpacity: setOverFillOpacity,
    fill: fill,
    isFilled: isFilled,
    empty: empty,
    set: set,
    clear: clear,
    getState: getState,
    applyState: applyState,
    applyStateOver: applyStateOver,
    fillOver: fillOver,
    emptyOver: emptyOver,
    setOnclick: setOnclick,
    setOndrag: setOndrag,
    setSavedata: setSavedata,
    setOnclickone: setOnclickone,
    setOnenter: setOnenter,
    setOnleavegrid: setOnleavegrid,
    clearHandlers: clearHandlers
  };
  
  return grid;
}

function applyObj(fill, i, j, obj){
  var arr = obj.arr;
  if (udfp(obj.center)){
    ci = Math.floor(arr.length/2);
    cj = Math.floor(arr[0].length/2);
  } else {
    ci = obj.center[0];
    cj = obj.center[1];
  }
  for (var r = 0; r < arr.length; r++){
    for (var c = 0; c < arr[r].length; c++){
      if (arr[r][c] === 1)fill(i+r-ci, j+c-cj);
    }
  }
}

var prevOver = udf;

function setOver(grid, i, j, obj){
  if (!udfp(prevOver))applyObj(grid.emptyOver, prevOver.i, prevOver.j, prevOver.obj);
  applyObj(grid.fillOver, i, j, obj);
  prevOver = {
    obj: obj,
    i: i, 
    j: j
  };
}

function clearOver(grid){
  if (!udfp(prevOver))applyObj(grid.emptyOver, prevOver.i, prevOver.j, prevOver.obj);
  prevOver = udf;
}

var gliderSE = {
  arr: [
    [0, 0, 1],
    [1, 0, 1],
    [0, 1, 1]
  ],
  center: [2, 2]
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

function makeEmptyState(state){
  var newstate = [];
  for (var i = 0; i < state.length; i++){
    newstate[i] = [];
    for (var j = 0; j < state[i].length; j++){
      newstate[i][j] = -1;
    }
  }
  return newstate;
}

function getNextState(state){
  //console.log("here");
  var newstate = makeEmptyState(state);
  for (var i = 0; i < state.length; i++){
    for (var j = 0; j < state[i].length; j++){
      if (state[i][j] === 1){
        fillNewstateCircle(newstate, state, i, j);
      }
    }
  }
  return newstate;
}

function setState(state, i, j, v){
  if (i < 0 || j < 0 || i >= state.length || j >= state[i].length)return;
  state[i][j] = v;
}

function fillNewstateCircle(newstate, state, i, j){
  for (var k = i-1; k <= i+1; k++){
    if (k < 0 || k >= state.length)continue;
    for (var l = j-1; l <= j+1; l++){
      if (l < 0 || l >= state[k].length)continue;
      if (newstate[k][l] === -1){
        newstate[k][l] = getNext1(state, k, l);
      }
    }
  }
}

function isLive(state, i, j){
  if (i < 0 || j < 0 || i >= state.length || j >= state[i].length)return false;
  return state[i][j];
}

function liveNeighbors(state, i, j){
  var n = 0;
  if (isLive(state, i-1, j-1))n++;
  if (isLive(state, i-1, j))n++;
  if (isLive(state, i-1, j+1))n++;
  if (isLive(state, i, j-1))n++;
  if (isLive(state, i, j+1))n++;
  if (isLive(state, i+1, j-1))n++;
  if (isLive(state, i+1, j))n++;
  if (isLive(state, i+1, j+1))n++;
  return n;
}

function getNext1(state, i, j){
  var n = liveNeighbors(state, i, j);
  if (isLive(state, i, j)){
    return (n == 2 || n == 3)?1:0;
  } else {
    return (n == 3)?1:0;
  }
}

var grid;
var clear;

function step(){
  grid.applyState(getNextState(grid.getState()));
}

var speeds = [1, 2, 4, 10, 20, 50, 100, 1000]; // runs/second
var currspeed = 6;
var runner = itr(function gridItrHandle(){step();});

runner.onstart(function runnerStart(){
  T("startstop").innerHTML = "Stop";
});

runner.onstop(function runnerStop(){
  T("startstop").innerHTML = "Start";
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
  T("currspeed").innerHTML = "Speed: " + n + " runs/sec";
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

function insertMode(obj, n){
  if (!udfp(n))obj = clockwise(obj, n);
  clearMode();
  grid.setOnenter(function (grid, i, j){
    setOver(grid, i, j, obj);
  });
  grid.setOnleavegrid(function (grid){
    clearOver(grid);
  });
  grid.setOnclick(function (grid, i, j){
    applyObj(grid.fill, i, j, obj);
  });
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
  
  grid.setSavedata(function (grid, i, j){
    return {origfill: grid.isFilled(i, j)};
  });
  
  grid.setOnclickone(function (grid, i, j, data){
    //console.log("onclickone");
    //console.log(origfill);
    grid.set(!data.origfill, i, j);
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
  T("glideropts").style.display = 'inline';
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
  insertMode(gliderSE, 0);
}

function gliderSWMode(){
  gliderButtons();
  disableLink(T("glidersw"));
  insertMode(gliderSE, 1);
}

function gliderNWMode(){
  gliderButtons();
  disableLink(T("glidernw"));
  insertMode(gliderSE, 2);
}

function gliderNEMode(){
  gliderButtons();
  disableLink(T("gliderne"));
  insertMode(gliderSE, 3);
}

function resetGliderButtons(){
  enableButton(T("glider"), gliderMode);
  T("glideropts").style.display = 'none';
  resetGliderOptButtons();
}

function resetButtons(){
  resetDrawButtons();
  resetGliderButtons();
}

document.addEventListener("DOMContentLoaded", function (){
  grid = makeGrid(T("grid"), 80, 170, 2);
  clear = grid.clear;
  
  setspeed(speeds[currspeed]);
  
  T("startstop").onclick = startstop;
  T("step").onclick = step;
  T("clear").onclick = function (){stop();clear();};
  T("faster").onclick = faster;
  T("slower").onclick = slower;
  
  drawMode(grid);
});

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

var gs = T.gs;
var sty = T.sty;

function makeEmptyState(rows, cols){
  var state = [];
  for (var i = 0; i < rows; i++){
    state[i] = [];
    for (var j = 0; j < cols; j++){
      state[i][j] = -1;
    }
  }
  return state;
}

function makeEmptyStateFrom(state){
  var rows = state.length;
  var cols = (rows >= 1)?state[0].length:0;
  return makeEmptyState(rows, cols);
}

function isValidState(state, i, j){
  return !(i < 0 || j < 0 || i >= state.length || j >= state[i].length);
}

function isFilledState(state, i, j){
  if (!isValidState(state, i, j))return false;
  return state[i][j] === 1;
}

function makeSimpleState(rows, cols){
  var state = makeEmptyState(rows, cols);
  
  function justFill(i, j){
    state[i][j] = 1;
  }
  
  function justEmpty(i, j){
    state[i][j] = 0;
  }
  
  function justFilled(i, j){
    return state[i][j] === 1;
  }
  
  function valid(i, j){
    return i >= 0 && j >= 0 && i < state.length && j < state[i].length;
  }
  
  var fillFn = function fillFn(i, j){
    if (!valid(i, j))return;
    justFill(i, j);
  };
  
  var emptyFn = function emptyFn(i, j){
    if (!valid(i, j))return;
    justEmpty(i, j);
  };
  
  function fill(i, j){
    fillFn(i, j);
  }
  
  function empty(i, j){
    emptyFn(i, j);
  }
  
  function filled(i, j){
    if (!valid(i, j))return false;
    return justFilled(i, j);
  }
  
  function set(tf, i, j){
    (tf?fill:empty)(i, j);
  }
  
  function setNum(st, i, j){
    set(st === 1, i, j);
  }
  
  function toggle(i, j){
    set(!filled(i, j), i, j);
  }
  
  function getState(){
    return state;
  }
  
  var setStateFn = function setState(newstate){
    state = newstate;
  };
  
  function setState(newstate){
    setStateFn(newstate);
  }
  
  function clear(){
    setState(makeEmptyState(rows, cols));
  }
  
  return {
    justFill: justFill,
    justEmpty: justEmpty,
    justFilled: justFilled,
    valid: valid,
    fill: fill,
    setFill: function (f){fillFn = f;},
    empty: empty,
    setEmpty: function (f){emptyFn = f;},
    filled: filled,
    set: set,
    setNum: setNum,
    toggle: toggle,
    getState: getState,
    setState: setState,
    setSetState: function (f){setStateFn = f;},
    clear: clear
  };
}

function setGetter(o, k, f){
  Object.defineProperty(o, k, {get: f});
}

function setSetter(o, k, f){
  Object.defineProperty(o, k, {set: f});
}

function makeState(rows, cols){
  var state = makeSimpleState(rows, cols);
  
  var valid = state.valid;
  var justFilled = state.justFilled;
  var justFill = state.justFill;
  var justEmpty = state.justEmpty;
  
  state.setFill(function fill(i, j){
    if (!valid(i, j))return;
    if (!justFilled(i, j)){
      justFill(i, j);
      onfill(i, j);
    }
  });
  
  state.setEmpty(function empty(i, j){
    if (!valid(i, j))return;
    if (justFilled(i, j)){
      justEmpty(i, j);
      onempty(i, j);
    }
  });
  
  var onfill, onempty;
  
  setSetter(state, "onfill", function (f){onfill = f;});
  setSetter(state, "onempty", function (f){onempty = f;});
  
  function clearHandlers(){
    onfill = function (i, j){};
    onempty = function (i, j){};
  }
  
  state.clearHandlers = clearHandlers;
  
  clearHandlers();
  
  var setNum = state.setNum;
  
  state.setSetState(function setState(newstate){
    for (var i = 0; i < rows; i++){
      for (var j = 0; j < cols; j++){
        if (justFilled(i, j) !== (newstate[i][j] === 1)){
          setNum(newstate[i][j], i, j);
        }
      }
    }
  });
  
  return state;
}

function makeSimpleGrid(elem, rows, cols){
  var state = makeState(rows, cols);
  
  state.onfill = function (i, j){
    gridarr[i][j].classList.add("fill");
  };
  
  state.onempty = function (i, j){
    gridarr[i][j].classList.remove("fill");
  };
  
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
  
  var ondrag, onclick, savedata, onclickone, onenter, onleavegrid;
  
  function clearHandlers(){
    ondrag = function (i, j){};
    onclick = function (i, j){};
    onclickone = function (i, j, data){};
    onenter = function (i, j){};
    onleavegrid = function (){};
  }
  
  clearHandlers();
  
  var data = udf;
  var hasPressedDown = false;
  var hasDragged = false;
  var isDragging = false;

  function mkDownFn(i, j){
    return function (e){
      if (e.which === 1){
        //console.log("mousedown i " + i + " j " + j);
        data = savedata(i, j);
        hasPressedDown = true;
        hasDragged = false;
        ondrag(i, j);
        return false;
      }
    };
  }
  
  function mkUpFn(i, j){
    return function (e){
      if (e.which === 1){
        //console.log("mouseup i " + i + " j " + j);
        if (hasPressedDown && !hasDragged){
          onclickone(i, j, data);
        }
        onclick(i, j);
      }
    };
  }
  
  function mkEnterFn(i, j){
    return function (e){
      //console.log("mouseover i " + i + " j " + j);
      if (isDragging){
        ondrag(i, j);
        hasDragged = true;
      }
      onenter(i, j);
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
    onleavegrid();
  };
  
  document.onmouseup = function docUpHandle(e){
    if (e.which === 1){
      //console.log("global mouseup");
      isDragging = false;
      hasPressedDown = false;
      hasDragged = false;
    }
  };
  
  elem.classList.add('sgrid');
  elem.classList.add(gridcls);
  var gridarr = [];
  for (var i = 0; i < rows; i++){
    gridarr[i] = [];
    var row = elm("div");
    for (var j = 0; j < cols; j++){
      var col = elm("div");
      col.onmouseenter = mkEnterFn(i, j);
      col.onmousedown = mkDownFn(i, j);
      col.onmouseup = mkUpFn(i, j);
      att(row, col);
      gridarr[i][j] = col;
    }
    att(elem, row);
  }
  
  return {
    valid: state.valid,
    filled: state.filled,
    fill: state.fill,
    empty: state.empty,
    set: state.set,
    setNum: state.setNum,
    toggle: state.toggle,
    clear: state.clear,
    getState: state.getState,
    setState: state.setState,
    setBorder: setBorder,
    setFillColor: setFillColor,
    setFillOpacity: setFillOpacity,
    setCellSize: setCellSize,
    set onclick(f){onclick = f},
    set ondrag(f){ondrag = f},
    set savedata(f){savedata = f},
    set onclickone(f){onclickone = f},
    set onenter(f){onenter = f},
    set onleavegrid(f){onleavegrid = f},
    clearHandlers: clearHandlers,
    state: state,
    gridarr: gridarr
  };
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
  
  var setOverFillColor = overgrid.setFillColor;
  var setOverFillOpacity = overgrid.setFillOpacity;
  var setMainFillColor = maingrid.setFillColor;
  var setMainFillOpacity = maingrid.setFillOpacity;
  var setUnderFillColor = undergrid.setFillColor;
  var setUnderFillOpacity = undergrid.setFillOpacity;
  
  setOverFillColor("#00FF00");
  setOverFillOpacity("0.5");
  
  var prevOver = udf;

  function setOver(i, j, obj){
    if (!udfp(prevOver))clearOver();
    applyObj(overgrid.fill, i, j, obj);
    prevOver = {
      obj: obj,
      i: i, 
      j: j
    };
  }
  
  function clearOver(){
    if (!udfp(prevOver))applyObj(overgrid.empty, prevOver.i, prevOver.j, prevOver.obj);
    prevOver = udf;
  }
  
  var clearHandlers = overgrid.clearHandlers;
  
  return {
    setBorder: setBorder,
    setCellSize: setCellSize,
    setOverFillColor: setOverFillColor,
    setOverFillOpacity: setOverFillOpacity,
    setMainFillColor: setMainFillColor,
    setMainFillOpacity: setMainFillOpacity,
    setUnderFillColor: setUnderFillColor,
    setUnderFillOpacity: setUnderFillOpacity,
    valid: maingrid.valid,
    fill: maingrid.fill,
    filled: maingrid.filled,
    empty: maingrid.empty,
    set: maingrid.set,
    clear: maingrid.clear,
    getState: maingrid.getState,
    setState: maingrid.setState,
    setOver: setOver,
    clearOver: clearOver,
    set onclick(f){overgrid.onclick = f;},
    set ondrag(f){overgrid.ondrag = f;},
    set savedata(f){overgrid.savedata = f;},
    set onclickone(f){overgrid.onclickone = f;},
    set onenter(f){overgrid.onenter = f;},
    set onleavegrid(f){overgrid.onleavegrid = f;},
    clearHandlers: clearHandlers
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


function getNextState(state){
  //console.log("here");
  var newstate = makeEmptyStateFrom(state);
  for (var i = 0; i < state.length; i++){
    for (var j = 0; j < state[i].length; j++){
      if (state[i][j] === 1){
        fillNewstateCircle(newstate, state, i, j);
      }
    }
  }
  return newstate;
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

function getNext1(state, i, j){
  var n = liveNeighbors(state, i, j);
  if (isFilledState(state, i, j)){
    return (n == 2 || n == 3)?1:0;
  } else {
    return (n == 3)?1:0;
  }
}

function liveNeighbors(state, i, j){
  var n = 0;
  if (isFilledState(state, i-1, j-1))n++;
  if (isFilledState(state, i-1, j))n++;
  if (isFilledState(state, i-1, j+1))n++;
  if (isFilledState(state, i, j-1))n++;
  if (isFilledState(state, i, j+1))n++;
  if (isFilledState(state, i+1, j-1))n++;
  if (isFilledState(state, i+1, j))n++;
  if (isFilledState(state, i+1, j+1))n++;
  return n;
}

function makeLifeState(rows, cols){
  var state = makeSimpleState(rows, cols);
  
  var runner = itr(step);
  
  var onstart = function (){};
  var onstop = function (){};
  
  runner.onstart = function (){
    onstart();
  };
  
  runner.onstop = function (){
    n = 1;
    onstop();
  }
  
  var n = 1;
  var ref = 50;
  
  var onrefresh = function (state){};
  
  function step(){
    state.setState(getNextState(state.getState()));
    if (n >= ref){
      refresh();
      n = 1;
    } else {
      n++;
    }
  }
  
  function refresh(){
     onrefresh(state.getState());
  }
  
  function refreshRate(r){
    ref = r;
  }
  
  function clear(){
    // order of these two calls is backwards
    // need to separate runner onstop callback from the actual stop
    state.clear();
    runner.stop();
  }
  
  return {
    fill: state.fill,
    filled: state.filled,
    empty: state.empty,
    set: state.set,
    getState: state.getState,
    setState: state.setState,
    step: step,
    set onstart(f){onstart = f;},
    set onstop(f){onstop = f;},
    set onrefresh(f){onrefresh = f;},
    start: runner.start,
    stop: runner.stop,
    startstop: runner.startstop,
    started: runner.started,
    speed: runner.speed,
    refresh: refresh,
    refreshRate: refreshRate,
    clear: clear,
    runner: runner
  };
}

function makeLifeGrid(elem, rows, cols){
  var grid = makeGrid(elem, rows, cols);
  var state = makeLifeState(rows, cols);
  
  var curr = grid;
  
  var onstart = function (){};
  var onstop = function (){};
  
  state.onstart = function (){
    onstart();
    state.setState(grid.getState());
    curr = state;
    stepFn = state.step;
  };
  
  state.onstop = function (){
    grid.setState(state.getState());
    curr = grid;
    stepFn = stepGrid;
    onstop();
  };
  
  state.onrefresh = grid.setState;
  
  function valid(i, j){
    return curr.valid(i, j);
  }
  
  function fill(i, j){
    curr.fill(i, j);
  }
  
  function empty(i, j){
    curr.empty(i, j);
  }
  
  function set(tf, i, j){
    curr.set(tf, i, j);
  }
  
  function filled(i, j){
    return curr.filled(i, j);
  }
  
  function clear(){
    curr.clear();
  }
  
  function getState(){
    return curr.getState();
  }
  
  function setState(newstate){
    curr.setState(newstate);
  }
  
  function stepGrid(){
    grid.setState(getNextState(grid.getState()));
  }
  
  var stepFn = stepGrid;
  
  function step(){
    stepFn();
  }
  
  return {
    setBorder: grid.setBorder,
    setCellSize: grid.setCellSize,
    setOverFillColor: grid.setOverFillColor,
    setOverFillOpacity: grid.setOverFillOpacity,
    setMainFillColor: grid.setMainFillColor,
    setMainFillOpacity: grid.setMainFillOpacity,
    setUnderFillColor: grid.setUnderFillColor,
    setUnderFillOpacity: grid.setUnderFillOpacity,
    valid: valid,
    fill: fill,
    filled: filled,
    empty: empty,
    set: set,
    clear: clear,
    getState: getState,
    setState: setState,
    setOver: grid.setOver,
    clearOver: grid.clearOver,
    set onclick(f){grid.onclick = f;},
    set ondrag(f){grid.ondrag = f;},
    set savedata(f){grid.savedata = f;},
    set onclickone(f){grid.onclickone = f;},
    set onenter(f){grid.onenter = f;},
    set onleavegrid(f){grid.onleavegrid = f;},
    clearHandlers: grid.clearHandlers,
    set onstart(f){onstart = f;},
    set onstop(f){onstop = f;},
    start: state.start,
    stop: state.stop,
    startstop: state.startstop,
    started: state.started,
    step: step,
    speed: state.speed,
    refresh: state.refresh,
    refreshRate: state.refreshRate
  };
}

var speeds = [1, 2, 4, 10, 20, 50, 100, 1000]; // runs/second
var currspeed = 6;

function speed(s){
  grid.speed(s);
  T("currspeed").innerHTML = "Speed: " + s + " runs/sec";
}

function faster(){
  if (currspeed+1 < speeds.length)currspeed++;
  speed(speeds[currspeed]);
}

function slower(){
  if (currspeed-1 >= 0)currspeed--;
  speed(speeds[currspeed]);
}

function retFalseFn(f){
  return function aFalseFn(){
    f();
    return false;
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
  grid.onenter = function (i, j){
    grid.setOver(i, j, obj);
  };
  grid.onleavegrid = grid.clearOver;
  grid.onclick = function (i, j){
    applyObj(grid.fill, i, j, obj);
  };
}

function emptyMode(){
  resetButtons();
  clearMode();
}

function drawMode(){
  resetButtons();
  disableButton(T("draw"));
  clearMode();
  grid.ondrag = grid.fill;
  grid.savedata = grid.filled;
  grid.onclickone = function (i, j, origfill){
    grid.set(!origfill, i, j);
  };
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

function gliderGunMode(){
  gliderGunSEMode();
}

function gliderGunButtons(){
  resetButtons();
  disableButton(T("glidergun"));
  T("glidergunopts").style.display = 'inline';
}

function resetGliderGunOptButtons(){
  enableLink(T("glidergunse"), gliderGunSEMode);
  enableLink(T("glidergunsw"), gliderGunSWMode);
  enableLink(T("glidergunnw"), gliderGunNWMode);
  enableLink(T("glidergunne"), gliderGunNEMode);
}

function gliderGunSEMode(){
  gliderGunButtons();
  disableLink(T("glidergunse"));
  insertMode(gliderGunSE, 0);
}

function gliderGunSWMode(){
  gliderGunButtons();
  disableLink(T("glidergunsw"));
  insertMode(gliderGunSE, 1);
}

function gliderGunNWMode(){
  gliderGunButtons();
  disableLink(T("glidergunnw"));
  insertMode(gliderGunSE, 2);
}

function gliderGunNEMode(){
  gliderGunButtons();
  disableLink(T("glidergunne"));
  insertMode(gliderGunSE, 3);
}

function resetGliderGunButtons(){
  enableButton(T("glidergun"), gliderGunMode);
  T("glidergunopts").style.display = 'none';
  resetGliderGunOptButtons();
}

function resetButtons(){
  resetDrawButtons();
  resetGliderButtons();
  resetGliderGunButtons();
}

document.addEventListener("DOMContentLoaded", function (){
  window.grid = makeLifeGrid(T("grid"), 80, 170);
  
  grid.onstart = function (){
    T("startstop").innerHTML = "Stop";
  };
  
  grid.onstop = function (){
    T("startstop").innerHTML = "Start";
  };
  
  window.start = grid.start;
  window.stop = grid.stop;
  window.step = grid.step;
  window.startstop = grid.startstop;
  window.clear = grid.clear;
  
  speed(speeds[currspeed]);
  
  T("startstop").onclick = startstop;
  T("step").onclick = step;
  T("clear").onclick = clear;
  T("faster").onclick = faster;
  T("slower").onclick = slower;
  
  drawMode(grid);
});

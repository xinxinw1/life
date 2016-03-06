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

function makeGrid(elem, rows, cols){
  var rowarr = [];
  for (var i = rows; i >= 1; i--){
    var colarr = [];
    var row = elm("div");
    for (var j = cols; j >= 1; j--){
      var col = elm("div");
      att(row, col);
      colarr.push(col);
    }
    att(elem, row);
    rowarr.push(colarr);
  }
  return rowarr;
}

function fillCell(grid, row, col){
  if (udfp(grid[row]))return;
  if (udfp(grid[row][col]))return;
  grid[row][col].className = "fill";
}

function emptyCell(grid, row, col){
  if (udfp(grid[row]))return;
  if (udfp(grid[row][col]))return;
  grid[row][col].className = "";
}

function setFill(grid, row, col, fill){
  (fill?fillCell:emptyCell)(grid, row, col);
}

function isFilled(grid, i, j){
  if (udfp(grid[i]))return false;
  if (udfp(grid[i][j]))return false;
  return grid[i][j].className == "fill";
}

function toggleCell(grid, row, col){
  setFill(grid, row, col, !isFilled(grid, row, col));
}

function clearGrid(grid){
  for (var i = 0; i < grid.length; i++){
    for (var j = 0; j < grid[i].length; j++){
      setFill(grid, i, j, false);
    }
  }
}

function getStates(grid){
  var states = [];
  for (var i = 0; i < grid.length; i++){
    var row = [];
    for (var j = 0; j < grid[i].length; j++){
      row.push(isFilled(grid, i, j));
    }
    states.push(row);
  }
  return states;
}

function applyStates(grid, states){
  for (var i = 0; i < grid.length; i++){
    for (var j = 0; j < grid[i].length; j++){
      setFill(grid, i, j, states[i][j]);
    }
  }
}

function emptyStates(states){
  var newstates = [];
  for (var i = 0; i < states.length; i++){
    var row = [];
    for (var j = 0; j < states.length; j++){
      row[j] = false;
    }
    newstates[i] = row;
  }
  return newstates;
}

function getNextStates(states){
  var newstates = emptyStates(states);
  for (var i = 0; i < grid.length; i++){
    for (var j = 0; j < grid[i].length; j++){
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

function life(grid){
  applyStates(grid, getNextStates(getStates(grid)));
}


function fillGliderSE(grid, i, j){
  fillCell(grid, i-1, j+1);
  fillCell(grid, i, j-1);
  fillCell(grid, i, j+1);
  fillCell(grid, i+1, j);
  fillCell(grid, i+1, j+1);
}

function fillGliderNW(grid, i, j){
  fillCell(grid, i-1, j-1);
  fillCell(grid, i-1, j);
  fillCell(grid, i, j-1);
  fillCell(grid, i, j+1);
  fillCell(grid, i+1, j-1);
}

var grid;
var speeds = [1, 2, 4, 10, 20, 50, 100, 1000]; // runs/second
var currspeed = 1;
var runner = itr(function gridItrHandle(){life(grid);}, 1000/speeds[currspeed]);

runner.onstart(function runnerStart(){
  $("#startstop").text("Stop");
});

runner.onstop(function runnerStop(){
  $("#startstop").text("Start");
});

var startstop = runner.startstop;
var start = runner.start;
var stop = runner.stop;
var interval = runner.interval;

function faster(){
  if (currspeed+1 < speeds.length)currspeed++;
  setspeed(speeds[currspeed]);
}

function setspeed(n){
  interval(1000/n);
  dispspeed(n);
}

function slower(){
  if (currspeed-1 >= 0)currspeed--;
  setspeed(speeds[currspeed]);
}

function dispspeed(n){
  $("#currspeed").text("Speed: " + n + " runs/sec");
}

function clearMode(){
  T("grid").onmousedown = udf;
  document.onmouseup = udf;
  for (var i = 0; i < grid.length; i++){
    for (var j = 0; j < grid[i].length; j++){
      grid[i][j].onmouseover = udf;
      grid[i][j].onmousedown = udf;
      grid[i][j].onmouseup = udf;
      grid[i][j].onclick = udf;
    }
  }
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

function emptyMode(){
  resetButtons();
  clearMode();
}

function drawMode(){
  resetButtons();
  disableButton(T("draw"));
  clearMode();
  
  var origfill = udf;
  var hasPressedDown = false;
  var hasDragged = false;
  var isDragging = false;

  function mkDownFn(grid, i, j){
    return function downHandle(e){
      if (e.which === 1){
        //console.log("mousedown");
        origfill = isFilled(grid, i, j);
        hasPressedDown = true;
        hasDragged = false;
        fillCell(grid, i, j);
      }
    };
  }
  
  function mkUpFn(grid, i, j){
    return function upHandle(e){
      if (e.which === 1){
        //console.log("mouseup");
        if (hasPressedDown && !hasDragged){
          setFill(grid, i, j, !origfill);
        }
      }
    };
  }
  
  
  function mkEnterFn(grid, i, j){
    return function enterHandle(e){
      //console.log("mouseenter");
      if (isDragging){
        fillCell(grid, i, j);
        hasDragged = true;
      }
    }
  }

  
  T("grid").onmousedown = function gridDownHandle(e){
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
  
  for (var i = 0; i < grid.length; i++){
    for (var j = 0; j < grid[i].length; j++){
      grid[i][j].onmouseover = mkEnterFn(grid, i, j);
      grid[i][j].onmousedown = mkDownFn(grid, i, j);
      grid[i][j].onmouseup = mkUpFn(grid, i, j);
    }
  }
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
  enableLink(T("glidernw"), gliderNWMode);
}

function gliderSEMode(){
  gliderButtons();
  disableLink(T("gliderse"));
  clearMode();
  
  function mkClickFn(grid, i, j){
    return function clickHandle(e){
      fillGliderSE(grid, i, j);
    };
  }
  
  for (var i = 0; i < grid.length; i++){
    for (var j = 0; j < grid[i].length; j++){
      grid[i][j].onmouseup = mkClickFn(grid, i, j);
    }
  }
}

function gliderNWMode(){
  gliderButtons();
  disableLink(T("glidernw"));
  clearMode();
  
  function mkClickFn(grid, i, j){
    return function clickHandle(e){
      fillGliderNW(grid, i, j);
    };
  }
  
  for (var i = 0; i < grid.length; i++){
    for (var j = 0; j < grid[i].length; j++){
      grid[i][j].onmouseup = mkClickFn(grid, i, j);
    }
  }
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
  grid = makeGrid(T("grid"), 80, 170);
  
  setspeed(speeds[currspeed]);
  
  $("#startstop").click(startstop);
  $("#clear").click(function clearClickHandle(){stop();clearGrid(grid);});
  $("#faster").click(faster);
  $("#slower").click(slower);
  
  drawMode();
});

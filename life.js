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
  grid[row][col].className = "fill";
}

function emptyCell(grid, row, col){
  grid[row][col].className = "";
}

function setFill(grid, row, col, fill){
  (fill?fillCell:emptyCell)(grid, row, col);
}

function isFilled(grid, i, j){
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



function mkToggleFn(grid, i, j){
  return function (){
    toggleCell(grid, i, j);
  };
}

function mkFillFn(grid, i, j){
  return function (){
    fillCell(grid, i, j);
  };
}

function mkDragFn(grid, i, j){
  return function (e){
    if (isDragging)fillCell(grid, i, j);
  }
}


var grid;
var speeds = [1, 2, 4, 10, 20, 50, 100, 1000]; // runs/second
var currspeed = 1;
var runner = itr(function (){life(grid);}, 1000/speeds[currspeed]);

runner.onstart(function (){
  $("#startstop").text("Stop");
});

runner.onstop(function (){
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

var isDragging = false;

$(function (){
  grid = makeGrid(T("grid"), 40, 90);
  $("#grid").on("mousedown", function (e){
    //$("#debug").text("Mousedown");
    isDragging = true;
    return false;
  });
  $(document).mouseup(function (e){
    //$("#debug").text("Mouseup");
    isDragging = false;
  });
  for (var i = 0; i < grid.length; i++){
    for (var j = 0; j < grid[i].length; j++){
      $(grid[i][j]).on("mouseenter", mkDragFn(grid, i, j));
      $(grid[i][j]).on("mousedown", mkFillFn(grid, i, j));
    }
  }
  
  setspeed(speeds[currspeed]);
  
  $("#startstop").click(startstop);
  $("#clear").click(function (){stop();clearGrid(grid);});
  $("#faster").click(faster);
  $("#slower").click(slower);
});

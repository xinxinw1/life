/***** Game of Life *****/

/* require tools */

////// Import //////

var udf = $.udf;
var udfp = $.udfp;
var apply = S.apply;
var makeLifeGrid = LG.makeLifeGrid;

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

function speed(s){
  grid.speed(s);
  $("currspeed").innerHTML = "Speed: " + s + " runs/sec";
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
    apply(grid.fill, i, j, obj);
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
  grid.ondrag = grid.fill;
  grid.savedata = grid.filled;
  grid.onclickone = function (i, j, origfill){
    grid.set(!origfill, i, j);
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

document.addEventListener("DOMContentLoaded", function (){
  window.grid = makeLifeGrid($("grid"), 80, 170);
  
  grid.onstart = function (){
    $("startstop").innerHTML = "Stop";
  };
  
  grid.onstop = function (){
    $("startstop").innerHTML = "Start";
  };
  
  window.start = grid.start;
  window.stop = grid.stop;
  window.step = grid.step;
  window.startstop = grid.startstop;
  window.clear = grid.clear;
  
  speed(speeds[currspeed]);
  
  $("startstop").onclick = startstop;
  $("step").onclick = step;
  $("clear").onclick = clear;
  $("faster").onclick = faster;
  $("slower").onclick = slower;
  
  drawMode(grid);
});

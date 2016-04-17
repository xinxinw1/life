/***** Game of Life *****/

/* require tools */

////// Import //////

var udf = $.udf;
var udfp = $.udfp;
var apply = S.apply;
var makeGrid = G.makeGrid;
var makeColorState = LC.makeColorState;
var makeJointState = LJ.makeJointState;
var makeJointRoomState = LJ.makeJointRoomState;
var makeSwitchState = SS.makeSwitchState;
var applyTrans = LD.applyTrans;

var elm = $.elm;
var txt = $.txt;
var att = $.att;
var cpy = $.cpy;

var DEF_ROWS = 80;
var DEF_COLS = 170;
var DEF_SPEED = 10;
var DEF_REFSPEED = 10;

var statesMenu = {
  "local": {
    "text": "Local",
    "action": "local"
  },
  "joint": {
    "text": "Joint",
    "action": "joint"
  },
  "joint-room": {
    "text": "Joint Room",
    "action": "joint-room"
  }
};

var statesActions = {
  "local": localState,
  "joint": jointState,
  "joint-room": jointRoomState
};

var objectsMenu = {
  "draw": {
    "text": "Draw",
    "action": "draw"
  },
  "glider": {
    "text": "Glider",
    "default": "se",
    "children": {
      "se": {
        "text": "SE",
        "action": "insert",
        "obj": "glider-se"
      },
      "sw": {
        "text": "SW",
        "action": "insert",
        "obj": "glider-se",
        "trans": "clockwise_1"
      },
      "nw": {
        "text": "NW",
        "action": "insert",
        "obj": "glider-se",
        "trans": "clockwise_2"
      },
      "ne": {
        "text": "NE",
        "action": "insert",
        "obj": "glider-se",
        "trans": "clockwise_3"
      }
    }
  },
  "glider-gun-h": {
    "text": "Glider Gun H",
    "default": "se",
    "children": {
      "se": {
        "text": "SE",
        "action": "insert",
        "obj": "glider-gun-se"
      },
      "sw": {
        "text": "SW",
        "action": "insert",
        "obj": "glider-gun-se",
        "trans": "flip_h"
      },
      "nw": {
        "text": "NW",
        "action": "insert",
        "obj": "glider-gun-se",
        "trans": "flip_hv"
      },
      "ne": {
        "text": "NE",
        "action": "insert",
        "obj": "glider-gun-se",
        "trans": "flip_v"
      }
    }
  },
  "glider-gun-v": {
    "text": "Glider Gun V",
    "default": "se",
    "children": {
      "se": {
        "text": "SE",
        "action": "insert",
        "obj": "glider-gun-se",
        "trans": "clockwise_1|flip_h"
      },
      "sw": {
        "text": "SW",
        "action": "insert",
        "obj": "glider-gun-se",
        "trans": "clockwise_1"
      },
      "nw": {
        "text": "NW",
        "action": "insert",
        "obj": "glider-gun-se",
        "trans": "clockwise_1|flip_v"
      },
      "ne": {
        "text": "NE",
        "action": "insert",
        "obj": "glider-gun-se",
        "trans": "clockwise_1|flip_hv"
      }
    }
  }
};

var objectsActions = {
  "draw": drawMode,
  "insert": function (cb, o){
    insertMode(LD.getData()[o.obj], o.trans);
    cb();
  }
};

var colorsMenu = {
  "black": {
    "text": "Black",
    "action": "black"
  },
  "red": {
    "text": "Red",
    "action": "red"
  },
  "blue": {
    "text": "Blue",
    "action": "blue"
  }
};

var colorsActions = {
  "black": blackColor,
  "red": redColor,
  "blue": blueColor
};

function buildMenu(elem, menu, actions){
  var buttons = {};
  
  var attelem = attBtw(elem, function (){
    return txt(" ");
  });
  
  for (var i in menu){
    var item = menu[i];
    var but = elm("button", item['text']);
    if (!udfp(item['action'])){
      var butfn = makeButtonFn(but);
      var actionfn = makeActionFn(item['action'], makeParams(item), butfn);
      enableButton(but, actionfn);
      buttons[i] = {
        "elem": but,
        "fn": actionfn,
        "switch": butfn
      };
      attelem(but);
    } else if (!udfp(item['children'])){
      var childfns = [];
      var childs = item['children'];
      var opts = elm("span");
      var def = item['default'];
      buttons[i] = {
        "elem": but,
        "opts": opts
      };
      var attchild = attBtw(opts, function (){
        return txt(" | ");
      });
      for (var j in childs){
        var child = childs[j];
        var link = elm("a", child['text']);
        var linkfn = makeLinkFn(but, opts, link);
        var actionfn = makeActionFn(child['action'], makeParams(child), linkfn);
        enableLink(link, actionfn);
        if (j === def){
          enableButton(but, actionfn);
          buttons[i]['fn'] = actionfn;
          buttons[i]['switch'] = linkfn;
        }
        childfns[j] = {
          "elem": link,
          "fn": actionfn,
          "switch": linkfn
        };
        attchild(link);
      }
      attelem(but);
      attelem(opts);
      buttons[i]['children'] = childfns;
    }
  }
  
  function makeParams(item){
    var obj = cpy(item);
    delete obj['text'];
    delete obj['action'];
    return obj;
  }
  
  function attBtw(elem, btw){
    var first = true;
    
    function att(item){
      if (first){
        first = false;
      } else {
        $.att(elem, btw());
      }
      $.att(elem, item);
    }
    
    return att;
  }
  
  function makeActionFn(action, params, cb){
    if (udfp(action)){
      $.al("here");
    }
    return function (){
      actions[action](cb, params);
    };
  }
  
  function makeButtonFn(but, cb){
    return function (){
      resetButtons();
      disableButton(but);
      if (cb)cb();
    };
  }
  
  function makeLinkFn(but, opts, link, cb){
    return makeButtonFn(but, function (){
      opts.style.display = 'inline';
      disableLink(link);
      if (cb)cb();
    });
  }
  
  function resetButtons(){
    for (var i in buttons){
      var but = buttons[i];
      enableButton(but['elem'], but['fn']);
      if (!udfp(but['children'])){
        var opts = but['opts'];
        opts.style.display = 'none';
        var childs = but['children'];
        for (var i in childs){
          var child = childs[i];
          enableLink(child['elem'], child['fn']);
        }
      }
    }
  }
  
  function callButtonFn(but_tag, child_tag){
    var but = buttons[but_tag];
    if (udfp(child_tag)){
      but['fn']();
      return;
    }
    var child = but['children'][child_tag];
    child['fn']();
  }
  
  function callChangeFn(but_tag, child_tag){
    var but = buttons[but_tag];
    if (udfp(child_tag)){
      but['switch']();
      return;
    }
    var child = but['children'][child_tag];
    child['switch']();
  }
  
  return {
    call: callButtonFn,
    change: callChangeFn,
    buttons: buttons
  };
}

var speeds = [1, 2, 4, 10, 20, 50, 100, 1000]; // runs/second
var currspeed = 6;
var currrefspeed = 0;

function faster(){
  if (currspeed+1 < speeds.length)currspeed++;
  speed(speeds[currspeed]);
}

function slower(){
  if (currspeed-1 >= 0)currspeed--;
  speed(speeds[currspeed]);
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

function insertMode(obj, trans){
  if (!udfp(trans))obj = applyTrans(obj, trans);
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
  clearMode();
}

function drawMode(cb){
  clearMode();
  grid.ondrag = function (i, j){
    state.fill(i, j);
  };
  grid.savedata = function (i, j){
    return state.filled(i, j);
  };
  grid.onclickone = function (i, j, origfill){
    state.filltf(!origfill, i, j);
  };
  cb();
}

function localState(cb){
  state.switchState(makeColorState(DEF_ROWS, DEF_COLS));
  cb();
}

function jointState(cb){
  state.switchState(makeJointState());
  cb();
}

function jointRoomState(cb){
  state.switchState(makeJointRoomState());
  cb();
}

var colors = {
  "black": 1,
  "red": 2,
  "blue": 3
};

function blackColor(cb){
  state.color(colors['black']);
}

function redColor(){
  state.color(colors['red']);
}

function blueColor(){
  state.color(colors['blue']);
}

var stateMenu, objectsMenu;

document.addEventListener("DOMContentLoaded", function (){
  window.grid = makeGrid($("grid"));
  window.state = makeSwitchState();
  
  state.onstart = function (){
    $("startstop").innerHTML = "Stop";
  };
  
  state.onstop = function (){
    $("startstop").innerHTML = "Start";
  };
  
  state.onspeed = function (s){
    $("currspeed").innerHTML = "" + s + " runs/sec";
    currspeed = $.pos(s, speeds);
  };
  
  state.onrefspeed = function (r){
    $("refspeed").innerHTML = "" + r + " refs/sec";
    currrefspeed = $.pos(r, speeds);
  };
  
  state.onsize = function (r, c){
    grid.size(r, c);
  };
  
  state.onset = grid.set;
  state.onsetstate = grid.setState;
  
  state.oncolor = function (st){
    colorsMenu.change($.pos(st, colors));
  };
  
  window.start = state.start;
  window.stop = state.stop;
  window.step = state.step;
  window.startstop = state.startstop;
  window.clear = state.clear;
  window.speed = state.speed;
  window.refspeed = state.refspeed;
  
  $("startstop").onclick = startstop;
  $("step").onclick = step;
  $("clear").onclick = clear;
  
  $("faster").onclick = faster;
  $("slower").onclick = slower;
  $("reffaster").onclick = reffaster;
  $("refslower").onclick = refslower;
  
  objectsMenu = buildMenu($('objects'), objectsMenu, objectsActions);
  objectsMenu.call('draw');
  
  statesMenu = buildMenu($('states'), statesMenu, statesActions);
  statesMenu.call('local');
  
  colorsMenu = buildMenu($('colors'), colorsMenu, colorsActions);
  colorsMenu.call('black');
  
  speed(DEF_SPEED);
  refspeed(DEF_REFSPEED);
});

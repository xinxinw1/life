/***** Game of Life *****/

/* require tools */

(function (udf){
  var udfp = $.udfp;
  var fillemptysys = S.fillemptysys;
  var makeSimpleState = S.makeSimpleState;
  
  function makeJointState(room){
    if (udfp(room))room = "global";
    var state = makeSimpleState();
    
    var socket = udf;
    
    var fes = fillemptysys();
    
    var over = fes.over;
    
    over.set = function (st, i, j){
      socket.emit('set', st, i, j);
    };
    
    var set = fes.set;
    
    function setObj(st, i, j, obj){
      socket.emit('setobj', i, j, obj);
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
    
    function speed(s){
      socket.emit('speed', s);
    }
    
    function refspeed(r){
      socket.emit('refspeed', r);
    }
    
    function size(r, c){
      socket.emit('size', r, c);
    }
    
    var onset, onsetstate, onstart, onstop, onspeed, onrefspeed, onsize;
    
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
      onset = function (st, i, j){};
      onsetstate = function (newstate){};
      onstart = function (){};
      onstop = function (){};
      onspeed = function (s){};
      onrefspeed = function (r){};
      onsize = function (r, c){};
    }
    
    clearHandlers();
    
    var s = 0;
    var r = 0;
    
    function getSpeed(){
      return s;
    }
    
    function getRefspeed(){
      return r;
    }
    
    function init(o){
      socket = io("/states");
      
      socket.on('connect', function (){
        console.log("connected");
        socket.emit('join', room);
      });
      
      socket.on('joined', function (){
        console.log("joined", room);
        socket.emit('copystate');
      });
      
      var recfes = fillemptysys();
      
      recfes.over.set = function (st, i, j){
        state.set(st, i, j);
        onset(st, i, j);
      };
      
      socket.on('set', function (st, i, j){
        console.log("received set");
        recfes.set(st, i, j);
      });
      
      socket.on('setobj', function (st, i, j, obj){
        console.log("received setobj");
        recfes.setObj(st, i, j, obj);
      });
      
      socket.on('setstate', function (newstate){
        console.log("received setstate");
        recsetstate(newstate);
      });
      
      function recsetstate(newstate){
        state.setState(newstate);
        onsetstate(newstate);
      }
      
      function recstarted(tf){
        isstarted = tf;
        if (tf)onstart();
        else onstop();
      }
      
      function recspeed(s2){
        s = s2;
        onspeed(s);
      }
      
      function recrefspeed(r2){
        r = r2;
        onrefspeed(r);
      }
      
      function recsize(r, c){
        rows = r;
        cols = c;
        state.size(r, c);
        onsize(r, c);
      }
      
      socket.on('start', function (){
        console.log("received start");
        recstarted(true);
      });
      
      socket.on('stop', function (){
        console.log("received stop");
        recstarted(false);
      });
      
      socket.on('speed', function (s){
        console.log("received speed " + s);
        recspeed(s);
      });
      
      socket.on('refspeed', function (r){
        console.log("received refspeed " + r);
        recrefspeed(r);
      });
      
      socket.on('size', function (r, c){
        console.log("received size " + r + " " + c);
        recsize(r, c);
      });
      
      socket.on('copystate', function (o){
        console.log("received copystate");
        recsize(o.size[0], o.size[1]);
        recstarted(o.started);
        recsetstate(o.state);
        recspeed(o.speed);
        recrefspeed(o.refspeed);
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
      return {
        state: state.getState(),
        speed: getSpeed(),
        refspeed: getRefspeed(),
        size: state.getSize()
      };
    }
    
    return {
      valid: state.valid,
      filled: state.filled,
      set: set,
      setObj: setObj,
      getState: state.getState,
      set onset(f){onset = f;},
      set onsetstate(f){onsetstate = f;},
      set onstart(f){onstart = f;},
      set onstop(f){onstop = f;},
      set onspeed(f){onspeed = f;},
      set onrefspeed(f){onrefspeed = f;},
      set onsize(f){onsize = f;},
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
      getSpeed: getSpeed,
      getRefspeed: getRefspeed,
      size: size,
      init: init,
      deinit: deinit
    };
  }
  
  function makeJointRoomState(){
    return makeJointState(prompt("Which room?"));
  }

  var o = {
    makeJointState: makeJointState,
    makeJointRoomState: makeJointRoomState
  };
  
  window.LJ = o;
  
})();

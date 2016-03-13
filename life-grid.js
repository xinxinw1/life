/***** Game of Life Grid *****/

/* require state */
/* require life-state */
/* require grid */

(function (udf){
  var next = LS.next;
  var makeLifeState = LS.makeLifeState;
  var makeGrid = G.makeGrid;
    
  function makeLifeGrid(elem, rows, cols){
    var grid = makeGrid(elem, rows, cols);
    
    grid.step = function step(){
      grid.setState(next(grid.getState()));
    };
    
    var state = makeLifeState(rows, cols);
    
    var curr = grid;
    
    var onstart = function (){};
    var onstop = function (){};
    
    state.onstart = function (){
      onstart();
      state.setState(grid.getState());
      curr = state;
    };
    
    state.onstop = function (){
      grid.setState(state.getState());
      curr = grid;
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
    
    function step(){
      curr.step();
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
      refreshRate: state.refreshRate,
      grid: grid,
      state: state
    };
  }
  
  window.LG = {
    makeLifeGrid: makeLifeGrid
  };

})();

/***** State *****/

(function (udf){
  function create(rows, cols, v){
    var a = [];
    for (var i = 0; i < rows; i++){
      a[i] = [];
      for (var j = 0; j < cols; j++){
        a[i][j] = v;
      }
    }
    return a;
  }
  
  function createfrom(state, v){
    var rows = state.length;
    var cols = (rows >= 1)?state[0].length:0;
    return create(rows, cols, v);
  }
  
  function valid(state, i, j){
    return i >= 0 && j >= 0 && i < state.length && j < state[i].length;
  }
  
  function filled(state, i, j){
    if (!valid(state, i, j))return false;
    return state[i][j] === 1;
  }
  
  function apply(fill, i, j, obj){
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
  
  function makeSimpleState(rows, cols){
    var state = create(rows, cols, 0);
    
    function valid(i, j){
      return i >= 0 && j >= 0 && i < state.length && j < state[i].length;
    }
    
    function fill(i, j){
      if (!valid(i, j))return;
      state[i][j] = 1;
    }
    
    function empty(i, j){
      if (!valid(i, j))return;
      state[i][j] = 0;
    }
    
    function filled(i, j){
      if (!valid(i, j))return false;
      return state[i][j] === 1;
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
    
    function setState(newstate){
      state = newstate;
    }
    
    function clear(){
      setState(create(rows, cols, 0));
    }
    
    clear();
    
    return {
      valid: valid,
      fill: fill,
      empty: empty,
      filled: filled,
      set: set,
      setNum: setNum,
      toggle: toggle,
      getState: getState,
      setState: setState,
      clear: clear
    };
  }
  
  function makeState(rows, cols){
    var state = create(rows, cols, 0);
    
    function valid(i, j){
      return i >= 0 && j >= 0 && i < state.length && j < state[i].length;
    }
    
    function fill(i, j){
      if (!valid(i, j))return;
      if (state[i][j] !== 1){
        state[i][j] = 1;
        onfill(i, j);
      }
    }
    
    function empty(i, j){
      if (!valid(i, j))return;
      if (state[i][j] === 1){
        state[i][j] = 0;
        onempty(i, j);
      }
    }
    
    function filled(i, j){
      if (!valid(i, j))return false;
      return state[i][j] === 1;
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
    
    function setState(newstate){
      for (var i = 0; i < rows; i++){
        for (var j = 0; j < cols; j++){
          if ((state[i][j] === 1) !== (newstate[i][j] === 1)){
            setNum(newstate[i][j], i, j);
          }
        }
      }
    }
    
    function clear(){
      setState(create(rows, cols, 0));
    }
    
    var onfill, onempty;
    
    function clearHandlers(){
      onfill = function (i, j){};
      onempty = function (i, j){};
    }
    
    return {
      valid: valid,
      fill: fill,
      empty: empty,
      filled: filled,
      set: set,
      setNum: setNum,
      toggle: toggle,
      getState: getState,
      setState: setState,
      clear: clear,
      set onfill(f){onfill = f;},
      set onempty(f){onempty = f;},
      clearHandlers: clearHandlers
    };
  }
  
  window.S = {
    create: create,
    createfrom: createfrom,
    valid: valid,
    filled: filled,
    apply: apply,
    makeSimpleState: makeSimpleState,
    makeState: makeState
  };
  
})();

/***** Grid *****/

/* require tools */

(function (udf){
  var gs = $.gs;
  var udfp = $.udfp;
  var elm = $.elm;
  var sty = $.sty;
  var att = $.att;
  
  var apply = S.apply;
  var makeState = S.makeState;
  
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
      apply(overgrid.fill, i, j, obj);
      prevOver = {
        obj: obj,
        i: i, 
        j: j
      };
    }
    
    function clearOver(){
      if (!udfp(prevOver))apply(overgrid.empty, prevOver.i, prevOver.j, prevOver.obj);
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
  
  window.G = {
    makeSimpleGrid: makeSimpleGrid,
    makeGrid: makeGrid
  };
})();

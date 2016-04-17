/***** Grid *****/

/* require tools */

(function (udf){
  var gs = $.gs;
  var udfp = $.udfp;
  var elm = $.elm;
  var sty = $.sty;
  var att = $.att;
  var loop = $.loop;
  var repeat = $.repeat;
  var det = $.det;
  
  var apply = S.apply;
  var makeState = S.makeState;
  
  function makeSimpleGrid(elem, rows, cols){
    if (udfp(rows))rows = 0;
    if (udfp(cols))cols = 0;
    var state = makeState(rows, cols);
    
    function removeAllClasses(elem){
      var arr = elem.classList;
      while (arr.length > 0)arr.remove(arr[0]);
    }
    
    state.onset = function (st, i, j){
      removeAllClasses(gridarr[i][j]);
      if (st >= 1)gridarr[i][j].classList.add("fill" + st);
    };
    
    var gridcls = 'sgrid' + gs();
    
    var borderstyle = sty();
    function setBorder(str){
      borderstyle.set(0, 'div.' + gridcls + ' {border-top: ' + str + '; border-left: ' + str + ';}');
      borderstyle.set(1, 'div.' + gridcls + ' > div > div {border-right: ' + str + '; border-bottom: ' + str + ';}');
    }
    
    setBorder("1px dotted #AAA");
    
    var fillstyles = {};
    
    function getFillColorStyle(st){
      if (udfp(fillstyles[st]))fillstyles[st] = sty();
      return fillstyles[st];
    }
    
    function setFillColor(st, str){
      getFillColorStyle(st).set(0, 'div.' + gridcls + ' > div > div.fill' + st + ' {background-color: ' + str + ';}');
    }
    
    setFillColor(1, "#000");
    setFillColor(2, "red");
    setFillColor(3, "blue");
    
    var fillopacitystyles = {};
    
    function getFillOpacityStyle(st){
      if (udfp(fillopacitystyles[st]))fillopacitystyles[st] = sty();
      return fillopacitystyles[st];
    }
    
    function setFillOpacity(st, str){
      getFillOpacityStyle(st).set(0, 'div.' + gridcls + ' > div > div.fill' + st + ' {opacity: ' + str + ';}');
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
    var rowarr = [];
    
    function mkcol(i, j){
      var col = elm("div");
      col.onmouseenter = mkEnterFn(i, j);
      col.onmousedown = mkDownFn(i, j);
      col.onmouseup = mkUpFn(i, j);
      return col;
    }
    
    function addcol(i){
      // i is in gridarr
      var j = gridarr[i].length;
      var col = mkcol(i, j);
      att(rowarr[i], col);
      gridarr[i][j] = col;
    }
    
    function addrow(cols){
      var row = elm("div");
      att(elem, row);
      var i = rowarr.length;
      rowarr.push(row);
      gridarr.push([]);
      repeat(cols, function (){
        addcol(i);
      });
    }
    
    function remcol(i){
      var col = gridarr[i].pop();
      det(rowarr[i], col);
    }
    
    function remrow(){
      var row = rowarr.pop();
      det(elem, row);
      gridarr.pop();
    }
    
    function addremn(n, add, rem){
      if (n > 0){
        repeat(n, add);
      } else if (n < 0){
        repeat(-n, rem);
      }
    }
    
    function addremcols(i, n){
      addremn(n,
        function (){addcol(i);},
        function (){remcol(i);}
      );
    }
    
    function addremrows(cols, n){
      addremn(n, function (){addrow(cols)}, remrow);
    }
    
    function size(rows, cols){
      loop(0, gridarr.length, function (i){
        addremcols(i, cols-gridarr[i].length);
      });
      addremrows(cols, rows-gridarr.length);
      state.size(rows, cols);
    }
    
    size(rows, cols);
    
    return {
      valid: state.valid,
      filled: state.filled,
      set: state.set,
      setter: state.setter,
      clear: state.clear,
      getState: state.getState,
      setState: state.setState,
      setBorder: setBorder,
      setFillColor: setFillColor,
      setFillOpacity: setFillOpacity,
      setCellSize: setCellSize,
      size: size,
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
    
    setOverFillColor(1, "#00FF00");
    setOverFillOpacity(1, "0.5");
    
    var prevOver = udf;
  
    function setOver(i, j, obj){
      if (!udfp(prevOver))clearOver();
      apply(overgrid.setter(1), i, j, obj);
      prevOver = {
        obj: obj,
        i: i, 
        j: j
      };
    }
    
    function clearOver(){
      if (!udfp(prevOver))apply(overgrid.setter(0), prevOver.i, prevOver.j, prevOver.obj);
      prevOver = udf;
    }
    
    var clearHandlers = overgrid.clearHandlers;
    
    function size(rows, cols){
      undergrid.size(rows, cols);
      maingrid.size(rows, cols);
      overgrid.size(rows, cols);
    }
    
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
      set: maingrid.set,
      setter: maingrid.setter,
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
      clearHandlers: clearHandlers,
      size: size
    };
  }
  
  window.G = {
    makeSimpleGrid: makeSimpleGrid,
    makeGrid: makeGrid
  };
})();

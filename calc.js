/*
 *
 * Caveat Emptor: Javascript syntax in this format is a killer.
 * Meaning, adding or deleting without a full test suite is dangerous.
 * A small spelling mistake can be a disaster.
 *
 * Storage API: https://developer.mozilla.org/en-US/docs/Web/Guide/API/DOM/Storage
 * Caveat Emptor: The documentors are always moving this page.
 *
**/
var virtualPaperTape = {
    gMyKEY       : 'vpt',
    gLocalStore  : {},
    gMemStore    : {},
    gFormulaView : "",
    gResultView  : "",
    init : function(ls, ms, fv, rv) {
        this.gLocalStore  = ls;
        this.gMemStore    = ms;
        this.gFormulaView = fv;
        this.gResultView  = rv;
        //console.log("virtualPaperTape INIT");
    },
    getStore :  function (x) {
        //console.log("getStore() caller:" + x + "this.gLocalStore.length:" + this.gLocalStore.length);
        //vptape = {};
        for (i = 0 ; i < this.gLocalStore.length ; i ++) {
            this.gMemStore.push( this.gLocalStore.getItem(i) );
        }
        //console.log("getStore() after get. i=" + i);
        return Array(this.gMemStore);
    },
    setStore : function (data) {
        console.log("setStore:" + data + " data.length:" + data.length);
        for (i = 0; i < data.length; i++) {
            this.gLocalStore.setItem(i, data);
        }
        console.log("we saved locally. i=" + i);
    },
    lengthStore : function () {
        //console.log("got length");
        return this.gLocalStore.length;
    },
    nukeStore : function () {
        this.gLocalStore.clear();
        console.log("we nuked it");
    },
    clearView : function(){
        $(this.gFormulaView).html('');
        $(this.gResultView).html('');
        //console.log("cleared view");
    },
    appendView : function (d1, d2) {
        $(this.gFormulaView).append(d1);
        $(this.gResultView).append(d2);
        //console.log("append view");
    },
    setView : function(arr) {
        row_flip = 0 ;
        for (i = 0 ; i < arr.length ; i++) {
            rowClass = (row_flip == 0) ? "list_e" : "list_o";
            row_flip = (row_flip == 0) ? 1 : 0;
            operation = arr[i];
            result    = eval(arr[i]);
            v1 = '<li class="' + rowClass + '">' + operation + '</li>';
            v2 = '<li class="' + rowClass + '">' + result + '</li>';
            this.appendView(v1, v2);
        }
        //console.log("set view");
    }
}


/*
 *
 * Calculator Functions
 *
**/
$(function() {
  ///
  ///  Initializing 
  ///
  $('#formula').focus();
  // $('#minmax').html("Max:" + Number.MAX_VALUE + " - Min:" + Number.MIN_VALUE);

  ///
  ///  Hooking Storage Functions
  ///
  var row_flip       = 0;
  var vptape         = new Array();
  var vptape_max     = 4;
  var localStore     = {};
  if (window.localStorage) {
      console.log("we got storage.");
      localStore = window.localStorage;
      virtualPaperTape.init(localStore, vptape, '#postFormulas', '#postResults');
      virtualPaperTape.nukeStore();
      $('#debug3').text(virtualPaperTape.getStore());
      //virtualPaperTape.setView(virtualPaperTape.getStore());
  } else {
      console.log("no local storage. Not gonna work.");
      alert("no local storage. Not gonna work.");
  }
  ///
  ///  Hooking SUBMIT Functions
  ///
  /* Hook to submit function */
  $('#calculator').submit(function(e) {
    e.preventDefault();
    e.stopPropagation();


    var operation = $('#formula').val();
    console.log("operation:" + JSON.stringify(operation));
    
    var result = 0;
    var error = false;

    if (operation !== "") {
        try {
            result = eval( operation );
            $('#formula').val(''); //.focus();
        } catch (err) {
            // statements to handle EvalError exceptions
            console.log("err:" + err.message);
            error = true;
        } finally {
        }

        //console.log('post try/catch');
        if ( error ) {
            console.log("error: " + error.message);
            alert("I don't understand what you typed.");
        } else {
           vptape.push(operation);
           // Maintain no more than 'vptape_max' in memory (so also local storage).
           if (vptape.length > vptape_max) {
               vptape.shift();
           }
           //console.log("After push - vptape.length:" + vptape.length);
           // Deal with our local storage.
           //virtualPaperTape.nukeStore();       // Wipe storage clean.
           //virtualPaperTape.setStore(vptape); // Reinsert our data into storage.
           //
           virtualPaperTape.clearView();
           virtualPaperTape.setView(vptape);
           //
           $('#debug').text(vptape.length);
           $('#debug2').text(virtualPaperTape.lengthStore());
           $('#debug3').text(virtualPaperTape.getStore());
        }
    }

  });

  ///
  /// Hooking the VIRTUAL keyboard.
  ///
  /* For Concept and Notes SEE: http://therockncoder.blogspot.com/2014/03/phonegap-calculator.html */
  var action = 'default';
  $('button').click(function(event) {
      //console.log("Event Handler for button with value of "+ JSON.stringify(event.target.id) + JSON.stringify(event.target.value));
      // this is a performance boost
      event.preventDefault();
      event.stopPropagation();
      //
      //
      //
      switch (event.target.value) {
          case 'esc':
              action = 'clear';
          break;
          case 'Ent':
              action = 'submit';
          break;
          case 'bs':
              action = 'del_last';
          break;
          default:
              action = 'default';
      }
      switch (action) {
          // Clear all ('C' clear button)
          case 'clear':
              $('#formula').val('');
          break;
          // Remove last character ('bs' backspace button)
          case 'del_last':
              strstr = $('#formula').val();
              strlen = $('#formula').val().length;
              $('#formula').val( strstr.substring(0, strlen - 1));
          break;
          // Issue a submit ('Ent' enter button)
          case 'submit':
              $('#formula').submit();
          break;
          // Append to string
          case 'default':
          default:
              $('#formula').val( $('#formula').val() + event.target.value );
      }
      // 
      $('#formula').focus();
  });

  //
  // Hooking the HELP button.
  //
  $('button#help').click(function(e){
      //alert('help handler');
      location.assign("help.html");
      e.preventDefault();
  });

  $('#formula').on("showkeyboard", function() {
      // 
      SoftKeyboard.hide();
      $('#formula').val( $('#formula').val() + "trig caugth" );
  });


});





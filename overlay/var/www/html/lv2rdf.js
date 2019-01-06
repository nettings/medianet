/* 
  lv2rdf2html.js 
  (C) 2017 by Jörn Nettingsmeier. Usage rights are granted according to the
  3-Clause BSD License (see COPYING).

*/

const SLIDER_RESOLUTION=1000;
const NUMBOX_DECIMALS=4;
const CONTROLLER = "lv2rdf.php"

const LOG_TX = '#ajaxTX span';
const LOG_RX = '#ajaxRX span';

var nodeIDs = {};

var updating = false;

function init() {
  getPluginData();
}

function renderAJAXStatus(msg) {
  var result = msg['status'] + " " + msg['statusText'] + "\n"; 
  result += "readyState: ";
  switch (msg['readyState']) {
    case 1: result += "loading"; break;
    case 2: result += "loaded"; break;
    case 3: result += "interactive"; break;
    case 4: result += "complete"; break;
  }
  result += ".\nresponseText: " + msg['responseText'] + ".\n";
  return result;
}

function getPluginData() {
  const request = 'getPluginData';
  $( LOG_TX ).html(request);
  $.ajax({
    dataType: "json",
    url: CONTROLLER,
    data: request,
    error: function(msg) {
      alert('getPluginData() failed.\n' + renderAJAXStatus(msg));
    },
    success: function (pluginData) {
      $( LOG_RX ).html(JSON.stringify(pluginData));
      nodeIDs = pluginData;
      updateWidgets();
    }
  });
} 

function updateWidgets() {
  updating = true;
  //alert("updateWidgets(): " + JSON.stringify(nodeIDs));
  $.each( nodeIDs, function( nodeID, data ) {
    if (typeof(nodeID) != 'undefined') {
      $( '#' + nodeID).val(data.value);
    }
  });
  // take a second pass to avoid missed updates due to race condition 
  setTimeout( function() {
    $.each ( nodeIDs, function (nodeID ) {
      $( '#' + nodeID).change();
    });
    updating = false;
  }, 500);
}

function setPluginData(nodeID, value) {
  if (updating) return;
  var update = { nodeID : nodeID, value : value };
  $( LOG_TX ).html(JSON.stringify(update));
  $.ajax({
    url : CONTROLLER,
    type : 'POST',
    data: update,
    dataType: 'json',
    async: true,
    error: function(msg) {
      alert('setPluginData("'+ nodeID + '", ' + value + ') failed.\n' + renderAJAXStatus(msg));
    },
    success: function(msg) {
      $( LOG_RX ).html(JSON.stringify(msg));
    }
  });
}

function round(value, decimals) {
  var f = Math.pow(10, decimals);
  return Math.round(value * f)/f;
}
    
function lin2log(value, min, max) {
  var minval = Math.log(min);
  var maxval = Math.log(max);
  var ratio = (maxval - minval) / SLIDER_RESOLUTION;
  return Math.exp(ratio * value + minval);
}
   
function log2lin(value, min, max) {
  var minval = Math.log(min);
  var maxval = Math.log(max);
  var ratio = (maxval - minval) / SLIDER_RESOLUTION;
  return (Math.log(value) - minval) / ratio;
}

// execute the generated code below once the page DOM tree is ready: 

$( document ).ready(function() {


// http://gareus.org/oss/lv2/fil4#mono

  $( "#plugin1-genid20" ).data('default', 1);
  $( "#plugin1-genid20_" ).change(function () {
    us = $( "#plugin1-genid20_" );
    them = $( "#plugin1-genid20" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin1-genid20", value );
  });
  $( "#plugin1-genid20" ).change(function () {
    us = $( "#plugin1-genid20" );
    them = $( "#plugin1-genid20_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin1-genid20", value );
  });

  $( "label[for='plugin1-genid20']" ).dblclick(function() {
    $( "#plugin1-genid20" ).val($( "#plugin1-genid20" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid20" ).change();
  });

  $( "#plugin1-genid31" ).data('default', 0);
  
  $( "#plugin1-genid31_" ).slider({
    value: $( "#plugin1-genid31" ).data('default'),
    min:   -18,
    max:   18,
    step:  (18 - -18) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid31").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid31", value );
    }                       
  });
  $( "#plugin1-genid31" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid31_" ).slider("value", value);
    setPluginData( "plugin1-genid31", value );
  });

  $( "label[for='plugin1-genid31']" ).dblclick(function() {
    $( "#plugin1-genid31" ).val($( "#plugin1-genid31" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid31" ).change();
  });

  $( "#plugin1-genid38" ).data('default', 1);
  $( "#plugin1-genid38_" ).change(function () {
    us = $( "#plugin1-genid38_" );
    them = $( "#plugin1-genid38" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin1-genid38", value );
  });
  $( "#plugin1-genid38" ).change(function () {
    us = $( "#plugin1-genid38" );
    them = $( "#plugin1-genid38_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin1-genid38", value );
  });

  $( "label[for='plugin1-genid38']" ).dblclick(function() {
    $( "#plugin1-genid38" ).val($( "#plugin1-genid38" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid38" ).change();
  });

  $( "#plugin1-genid39" ).data('default', 0);
  $( "#plugin1-genid39_" ).change(function () {
    us = $( "#plugin1-genid39_" );
    them = $( "#plugin1-genid39" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin1-genid39", value );
  });
  $( "#plugin1-genid39" ).change(function () {
    us = $( "#plugin1-genid39" );
    them = $( "#plugin1-genid39_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin1-genid39", value );
  });

  $( "label[for='plugin1-genid39']" ).dblclick(function() {
    $( "#plugin1-genid39" ).val($( "#plugin1-genid39" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid39" ).change();
  });

  $( "#plugin1-genid40" ).data('default', 20);
  
  $( "#plugin1-genid40_" ).slider({
    value: log2lin($( "#plugin1-genid40" ).data('default'), 5, 1250),
    min: 0,
    max: SLIDER_RESOLUTION,
    step: 1,
    slide: function(event, ui) {
      var value = lin2log(ui.value, 5, 1250);
      $("#plugin1-genid40").val(value.toFixed(NUMBOX_DECIMALS));
      setPluginData( "plugin1-genid40", value );               
    }        
  });
  $( "#plugin1-genid40" ).change(function () {
    var value = this.value;
    $("#plugin1-genid40_").slider("value", log2lin(value, 5, 1250));
    setPluginData( "plugin1-genid40", value );
  });

  $( "label[for='plugin1-genid40']" ).dblclick(function() {
    $( "#plugin1-genid40" ).val($( "#plugin1-genid40" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid40" ).change();
  });

  $( "#plugin1-genid44" ).data('default', 0.7);
  
  $( "#plugin1-genid44_" ).slider({
    value: $( "#plugin1-genid44" ).data('default'),
    min:   0,
    max:   1.4,
    step:  (1.4 - 0) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid44").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid44", value );
    }                       
  });
  $( "#plugin1-genid44" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid44_" ).slider("value", value);
    setPluginData( "plugin1-genid44", value );
  });

  $( "label[for='plugin1-genid44']" ).dblclick(function() {
    $( "#plugin1-genid44" ).val($( "#plugin1-genid44" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid44" ).change();
  });

  $( "#plugin1-genid2" ).data('default', 0);
  $( "#plugin1-genid2_" ).change(function () {
    us = $( "#plugin1-genid2_" );
    them = $( "#plugin1-genid2" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin1-genid2", value );
  });
  $( "#plugin1-genid2" ).change(function () {
    us = $( "#plugin1-genid2" );
    them = $( "#plugin1-genid2_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin1-genid2", value );
  });

  $( "label[for='plugin1-genid2']" ).dblclick(function() {
    $( "#plugin1-genid2" ).val($( "#plugin1-genid2" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid2" ).change();
  });

  $( "#plugin1-genid3" ).data('default', 20000);
  
  $( "#plugin1-genid3_" ).slider({
    value: log2lin($( "#plugin1-genid3" ).data('default'), 500, 20000),
    min: 0,
    max: SLIDER_RESOLUTION,
    step: 1,
    slide: function(event, ui) {
      var value = lin2log(ui.value, 500, 20000);
      $("#plugin1-genid3").val(value.toFixed(NUMBOX_DECIMALS));
      setPluginData( "plugin1-genid3", value );               
    }        
  });
  $( "#plugin1-genid3" ).change(function () {
    var value = this.value;
    $("#plugin1-genid3_").slider("value", log2lin(value, 500, 20000));
    setPluginData( "plugin1-genid3", value );
  });

  $( "label[for='plugin1-genid3']" ).dblclick(function() {
    $( "#plugin1-genid3" ).val($( "#plugin1-genid3" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid3" ).change();
  });

  $( "#plugin1-genid7" ).data('default', 1);
  
  $( "#plugin1-genid7_" ).slider({
    value: $( "#plugin1-genid7" ).data('default'),
    min:   0,
    max:   1.4,
    step:  (1.4 - 0) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid7").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid7", value );
    }                       
  });
  $( "#plugin1-genid7" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid7_" ).slider("value", value);
    setPluginData( "plugin1-genid7", value );
  });

  $( "label[for='plugin1-genid7']" ).dblclick(function() {
    $( "#plugin1-genid7" ).val($( "#plugin1-genid7" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid7" ).change();
  });

  $( "#plugin1-genid8" ).data('default', 1);
  $( "#plugin1-genid8_" ).change(function () {
    us = $( "#plugin1-genid8_" );
    them = $( "#plugin1-genid8" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin1-genid8", value );
  });
  $( "#plugin1-genid8" ).change(function () {
    us = $( "#plugin1-genid8" );
    them = $( "#plugin1-genid8_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin1-genid8", value );
  });

  $( "label[for='plugin1-genid8']" ).dblclick(function() {
    $( "#plugin1-genid8" ).val($( "#plugin1-genid8" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid8" ).change();
  });

  $( "#plugin1-genid10" ).data('default', 80);
  
  $( "#plugin1-genid10_" ).slider({
    value: log2lin($( "#plugin1-genid10" ).data('default'), 25, 400),
    min: 0,
    max: SLIDER_RESOLUTION,
    step: 1,
    slide: function(event, ui) {
      var value = lin2log(ui.value, 25, 400);
      $("#plugin1-genid10").val(value.toFixed(NUMBOX_DECIMALS));
      setPluginData( "plugin1-genid10", value );               
    }        
  });
  $( "#plugin1-genid10" ).change(function () {
    var value = this.value;
    $("#plugin1-genid10_").slider("value", log2lin(value, 25, 400));
    setPluginData( "plugin1-genid10", value );
  });

  $( "label[for='plugin1-genid10']" ).dblclick(function() {
    $( "#plugin1-genid10" ).val($( "#plugin1-genid10" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid10" ).change();
  });

  $( "#plugin1-genid11" ).data('default', 1);
  
  $( "#plugin1-genid11_" ).slider({
    value: $( "#plugin1-genid11" ).data('default'),
    min:   0.0625,
    max:   4,
    step:  (4 - 0.0625) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid11").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid11", value );
    }                       
  });
  $( "#plugin1-genid11" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid11_" ).slider("value", value);
    setPluginData( "plugin1-genid11", value );
  });

  $( "label[for='plugin1-genid11']" ).dblclick(function() {
    $( "#plugin1-genid11" ).val($( "#plugin1-genid11" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid11" ).change();
  });

  $( "#plugin1-genid12" ).data('default', 0);
  
  $( "#plugin1-genid12_" ).slider({
    value: $( "#plugin1-genid12" ).data('default'),
    min:   -18,
    max:   18,
    step:  (18 - -18) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid12").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid12", value );
    }                       
  });
  $( "#plugin1-genid12" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid12_" ).slider("value", value);
    setPluginData( "plugin1-genid12", value );
  });

  $( "label[for='plugin1-genid12']" ).dblclick(function() {
    $( "#plugin1-genid12" ).val($( "#plugin1-genid12" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid12" ).change();
  });

  $( "#plugin1-genid13" ).data('default', 1);
  $( "#plugin1-genid13_" ).change(function () {
    us = $( "#plugin1-genid13_" );
    them = $( "#plugin1-genid13" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin1-genid13", value );
  });
  $( "#plugin1-genid13" ).change(function () {
    us = $( "#plugin1-genid13" );
    them = $( "#plugin1-genid13_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin1-genid13", value );
  });

  $( "label[for='plugin1-genid13']" ).dblclick(function() {
    $( "#plugin1-genid13" ).val($( "#plugin1-genid13" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid13" ).change();
  });

  $( "#plugin1-genid14" ).data('default', 160);
  
  $( "#plugin1-genid14_" ).slider({
    value: log2lin($( "#plugin1-genid14" ).data('default'), 20, 2000),
    min: 0,
    max: SLIDER_RESOLUTION,
    step: 1,
    slide: function(event, ui) {
      var value = lin2log(ui.value, 20, 2000);
      $("#plugin1-genid14").val(value.toFixed(NUMBOX_DECIMALS));
      setPluginData( "plugin1-genid14", value );               
    }        
  });
  $( "#plugin1-genid14" ).change(function () {
    var value = this.value;
    $("#plugin1-genid14_").slider("value", log2lin(value, 20, 2000));
    setPluginData( "plugin1-genid14", value );
  });

  $( "label[for='plugin1-genid14']" ).dblclick(function() {
    $( "#plugin1-genid14" ).val($( "#plugin1-genid14" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid14" ).change();
  });

  $( "#plugin1-genid15" ).data('default', 0.6);
  
  $( "#plugin1-genid15_" ).slider({
    value: $( "#plugin1-genid15" ).data('default'),
    min:   0.0625,
    max:   4,
    step:  (4 - 0.0625) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid15").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid15", value );
    }                       
  });
  $( "#plugin1-genid15" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid15_" ).slider("value", value);
    setPluginData( "plugin1-genid15", value );
  });

  $( "label[for='plugin1-genid15']" ).dblclick(function() {
    $( "#plugin1-genid15" ).val($( "#plugin1-genid15" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid15" ).change();
  });

  $( "#plugin1-genid16" ).data('default', 0);
  
  $( "#plugin1-genid16_" ).slider({
    value: $( "#plugin1-genid16" ).data('default'),
    min:   -18,
    max:   18,
    step:  (18 - -18) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid16").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid16", value );
    }                       
  });
  $( "#plugin1-genid16" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid16_" ).slider("value", value);
    setPluginData( "plugin1-genid16", value );
  });

  $( "label[for='plugin1-genid16']" ).dblclick(function() {
    $( "#plugin1-genid16" ).val($( "#plugin1-genid16" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid16" ).change();
  });

  $( "#plugin1-genid17" ).data('default', 1);
  $( "#plugin1-genid17_" ).change(function () {
    us = $( "#plugin1-genid17_" );
    them = $( "#plugin1-genid17" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin1-genid17", value );
  });
  $( "#plugin1-genid17" ).change(function () {
    us = $( "#plugin1-genid17" );
    them = $( "#plugin1-genid17_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin1-genid17", value );
  });

  $( "label[for='plugin1-genid17']" ).dblclick(function() {
    $( "#plugin1-genid17" ).val($( "#plugin1-genid17" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid17" ).change();
  });

  $( "#plugin1-genid18" ).data('default', 397);
  
  $( "#plugin1-genid18_" ).slider({
    value: log2lin($( "#plugin1-genid18" ).data('default'), 40, 4000),
    min: 0,
    max: SLIDER_RESOLUTION,
    step: 1,
    slide: function(event, ui) {
      var value = lin2log(ui.value, 40, 4000);
      $("#plugin1-genid18").val(value.toFixed(NUMBOX_DECIMALS));
      setPluginData( "plugin1-genid18", value );               
    }        
  });
  $( "#plugin1-genid18" ).change(function () {
    var value = this.value;
    $("#plugin1-genid18_").slider("value", log2lin(value, 40, 4000));
    setPluginData( "plugin1-genid18", value );
  });

  $( "label[for='plugin1-genid18']" ).dblclick(function() {
    $( "#plugin1-genid18" ).val($( "#plugin1-genid18" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid18" ).change();
  });

  $( "#plugin1-genid19" ).data('default', 0.6);
  
  $( "#plugin1-genid19_" ).slider({
    value: $( "#plugin1-genid19" ).data('default'),
    min:   0.0625,
    max:   4,
    step:  (4 - 0.0625) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid19").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid19", value );
    }                       
  });
  $( "#plugin1-genid19" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid19_" ).slider("value", value);
    setPluginData( "plugin1-genid19", value );
  });

  $( "label[for='plugin1-genid19']" ).dblclick(function() {
    $( "#plugin1-genid19" ).val($( "#plugin1-genid19" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid19" ).change();
  });

  $( "#plugin1-genid21" ).data('default', 0);
  
  $( "#plugin1-genid21_" ).slider({
    value: $( "#plugin1-genid21" ).data('default'),
    min:   -18,
    max:   18,
    step:  (18 - -18) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid21").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid21", value );
    }                       
  });
  $( "#plugin1-genid21" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid21_" ).slider("value", value);
    setPluginData( "plugin1-genid21", value );
  });

  $( "label[for='plugin1-genid21']" ).dblclick(function() {
    $( "#plugin1-genid21" ).val($( "#plugin1-genid21" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid21" ).change();
  });

  $( "#plugin1-genid22" ).data('default', 1);
  $( "#plugin1-genid22_" ).change(function () {
    us = $( "#plugin1-genid22_" );
    them = $( "#plugin1-genid22" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin1-genid22", value );
  });
  $( "#plugin1-genid22" ).change(function () {
    us = $( "#plugin1-genid22" );
    them = $( "#plugin1-genid22_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin1-genid22", value );
  });

  $( "label[for='plugin1-genid22']" ).dblclick(function() {
    $( "#plugin1-genid22" ).val($( "#plugin1-genid22" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid22" ).change();
  });

  $( "#plugin1-genid23" ).data('default', 1250);
  
  $( "#plugin1-genid23_" ).slider({
    value: log2lin($( "#plugin1-genid23" ).data('default'), 100, 10000),
    min: 0,
    max: SLIDER_RESOLUTION,
    step: 1,
    slide: function(event, ui) {
      var value = lin2log(ui.value, 100, 10000);
      $("#plugin1-genid23").val(value.toFixed(NUMBOX_DECIMALS));
      setPluginData( "plugin1-genid23", value );               
    }        
  });
  $( "#plugin1-genid23" ).change(function () {
    var value = this.value;
    $("#plugin1-genid23_").slider("value", log2lin(value, 100, 10000));
    setPluginData( "plugin1-genid23", value );
  });

  $( "label[for='plugin1-genid23']" ).dblclick(function() {
    $( "#plugin1-genid23" ).val($( "#plugin1-genid23" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid23" ).change();
  });

  $( "#plugin1-genid24" ).data('default', 0.6);
  
  $( "#plugin1-genid24_" ).slider({
    value: $( "#plugin1-genid24" ).data('default'),
    min:   0.0625,
    max:   4,
    step:  (4 - 0.0625) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid24").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid24", value );
    }                       
  });
  $( "#plugin1-genid24" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid24_" ).slider("value", value);
    setPluginData( "plugin1-genid24", value );
  });

  $( "label[for='plugin1-genid24']" ).dblclick(function() {
    $( "#plugin1-genid24" ).val($( "#plugin1-genid24" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid24" ).change();
  });

  $( "#plugin1-genid25" ).data('default', 0);
  
  $( "#plugin1-genid25_" ).slider({
    value: $( "#plugin1-genid25" ).data('default'),
    min:   -18,
    max:   18,
    step:  (18 - -18) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid25").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid25", value );
    }                       
  });
  $( "#plugin1-genid25" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid25_" ).slider("value", value);
    setPluginData( "plugin1-genid25", value );
  });

  $( "label[for='plugin1-genid25']" ).dblclick(function() {
    $( "#plugin1-genid25" ).val($( "#plugin1-genid25" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid25" ).change();
  });

  $( "#plugin1-genid26" ).data('default', 1);
  $( "#plugin1-genid26_" ).change(function () {
    us = $( "#plugin1-genid26_" );
    them = $( "#plugin1-genid26" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin1-genid26", value );
  });
  $( "#plugin1-genid26" ).change(function () {
    us = $( "#plugin1-genid26" );
    them = $( "#plugin1-genid26_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin1-genid26", value );
  });

  $( "label[for='plugin1-genid26']" ).dblclick(function() {
    $( "#plugin1-genid26" ).val($( "#plugin1-genid26" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid26" ).change();
  });

  $( "#plugin1-genid27" ).data('default', 2500);
  
  $( "#plugin1-genid27_" ).slider({
    value: log2lin($( "#plugin1-genid27" ).data('default'), 200, 20000),
    min: 0,
    max: SLIDER_RESOLUTION,
    step: 1,
    slide: function(event, ui) {
      var value = lin2log(ui.value, 200, 20000);
      $("#plugin1-genid27").val(value.toFixed(NUMBOX_DECIMALS));
      setPluginData( "plugin1-genid27", value );               
    }        
  });
  $( "#plugin1-genid27" ).change(function () {
    var value = this.value;
    $("#plugin1-genid27_").slider("value", log2lin(value, 200, 20000));
    setPluginData( "plugin1-genid27", value );
  });

  $( "label[for='plugin1-genid27']" ).dblclick(function() {
    $( "#plugin1-genid27" ).val($( "#plugin1-genid27" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid27" ).change();
  });

  $( "#plugin1-genid28" ).data('default', 0.6);
  
  $( "#plugin1-genid28_" ).slider({
    value: $( "#plugin1-genid28" ).data('default'),
    min:   0.0625,
    max:   4,
    step:  (4 - 0.0625) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid28").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid28", value );
    }                       
  });
  $( "#plugin1-genid28" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid28_" ).slider("value", value);
    setPluginData( "plugin1-genid28", value );
  });

  $( "label[for='plugin1-genid28']" ).dblclick(function() {
    $( "#plugin1-genid28" ).val($( "#plugin1-genid28" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid28" ).change();
  });

  $( "#plugin1-genid29" ).data('default', 0);
  
  $( "#plugin1-genid29_" ).slider({
    value: $( "#plugin1-genid29" ).data('default'),
    min:   -18,
    max:   18,
    step:  (18 - -18) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid29").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid29", value );
    }                       
  });
  $( "#plugin1-genid29" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid29_" ).slider("value", value);
    setPluginData( "plugin1-genid29", value );
  });

  $( "label[for='plugin1-genid29']" ).dblclick(function() {
    $( "#plugin1-genid29" ).val($( "#plugin1-genid29" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid29" ).change();
  });

  $( "#plugin1-genid30" ).data('default', 1);
  $( "#plugin1-genid30_" ).change(function () {
    us = $( "#plugin1-genid30_" );
    them = $( "#plugin1-genid30" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin1-genid30", value );
  });
  $( "#plugin1-genid30" ).change(function () {
    us = $( "#plugin1-genid30" );
    them = $( "#plugin1-genid30_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin1-genid30", value );
  });

  $( "label[for='plugin1-genid30']" ).dblclick(function() {
    $( "#plugin1-genid30" ).val($( "#plugin1-genid30" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid30" ).change();
  });

  $( "#plugin1-genid32" ).data('default', 8000);
  
  $( "#plugin1-genid32_" ).slider({
    value: log2lin($( "#plugin1-genid32" ).data('default'), 1000, 16000),
    min: 0,
    max: SLIDER_RESOLUTION,
    step: 1,
    slide: function(event, ui) {
      var value = lin2log(ui.value, 1000, 16000);
      $("#plugin1-genid32").val(value.toFixed(NUMBOX_DECIMALS));
      setPluginData( "plugin1-genid32", value );               
    }        
  });
  $( "#plugin1-genid32" ).change(function () {
    var value = this.value;
    $("#plugin1-genid32_").slider("value", log2lin(value, 1000, 16000));
    setPluginData( "plugin1-genid32", value );
  });

  $( "label[for='plugin1-genid32']" ).dblclick(function() {
    $( "#plugin1-genid32" ).val($( "#plugin1-genid32" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid32" ).change();
  });

  $( "#plugin1-genid33" ).data('default', 1);
  
  $( "#plugin1-genid33_" ).slider({
    value: $( "#plugin1-genid33" ).data('default'),
    min:   0.0625,
    max:   4,
    step:  (4 - 0.0625) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid33").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid33", value );
    }                       
  });
  $( "#plugin1-genid33" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid33_" ).slider("value", value);
    setPluginData( "plugin1-genid33", value );
  });

  $( "label[for='plugin1-genid33']" ).dblclick(function() {
    $( "#plugin1-genid33" ).val($( "#plugin1-genid33" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid33" ).change();
  });

  $( "#plugin1-genid34" ).data('default', 0);
  
  $( "#plugin1-genid34_" ).slider({
    value: $( "#plugin1-genid34" ).data('default'),
    min:   -18,
    max:   18,
    step:  (18 - -18) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin1-genid34").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin1-genid34", value );
    }                       
  });
  $( "#plugin1-genid34" ).change(function () {
    var value = this.value;
    $( "#plugin1-genid34_" ).slider("value", value);
    setPluginData( "plugin1-genid34", value );
  });

  $( "label[for='plugin1-genid34']" ).dblclick(function() {
    $( "#plugin1-genid34" ).val($( "#plugin1-genid34" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin1-genid34" ).change();
  });

// urn:zamaudio:ZamComp

  $( "#plugin2-genid11" ).data('default', 10);
  
  $( "#plugin2-genid11_" ).slider({
    value: $( "#plugin2-genid11" ).data('default'),
    min:   0.1,
    max:   100,
    step:  (100 - 0.1) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin2-genid11").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin2-genid11", value );
    }                       
  });
  $( "#plugin2-genid11" ).change(function () {
    var value = this.value;
    $( "#plugin2-genid11_" ).slider("value", value);
    setPluginData( "plugin2-genid11", value );
  });

  $( "label[for='plugin2-genid11']" ).dblclick(function() {
    $( "#plugin2-genid11" ).val($( "#plugin2-genid11" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin2-genid11" ).change();
  });

  $( "#plugin2-genid12" ).data('default', 80);
  
  $( "#plugin2-genid12_" ).slider({
    value: $( "#plugin2-genid12" ).data('default'),
    min:   1,
    max:   500,
    step:  (500 - 1) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin2-genid12").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin2-genid12", value );
    }                       
  });
  $( "#plugin2-genid12" ).change(function () {
    var value = this.value;
    $( "#plugin2-genid12_" ).slider("value", value);
    setPluginData( "plugin2-genid12", value );
  });

  $( "label[for='plugin2-genid12']" ).dblclick(function() {
    $( "#plugin2-genid12" ).val($( "#plugin2-genid12" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin2-genid12" ).change();
  });

  $( "#plugin2-genid13" ).data('default', 0);
  
  $( "#plugin2-genid13_" ).slider({
    value: $( "#plugin2-genid13" ).data('default'),
    min:   0,
    max:   8,
    step:  (8 - 0) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin2-genid13").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin2-genid13", value );
    }                       
  });
  $( "#plugin2-genid13" ).change(function () {
    var value = this.value;
    $( "#plugin2-genid13_" ).slider("value", value);
    setPluginData( "plugin2-genid13", value );
  });

  $( "label[for='plugin2-genid13']" ).dblclick(function() {
    $( "#plugin2-genid13" ).val($( "#plugin2-genid13" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin2-genid13" ).change();
  });

  $( "#plugin2-genid15" ).data('default', 4);
  
  $( "#plugin2-genid15_" ).slider({
    value: log2lin($( "#plugin2-genid15" ).data('default'), 1, 20),
    min: 0,
    max: SLIDER_RESOLUTION,
    step: 1,
    slide: function(event, ui) {
      var value = lin2log(ui.value, 1, 20);
      $("#plugin2-genid15").val(value.toFixed(NUMBOX_DECIMALS));
      setPluginData( "plugin2-genid15", value );               
    }        
  });
  $( "#plugin2-genid15" ).change(function () {
    var value = this.value;
    $("#plugin2-genid15_").slider("value", log2lin(value, 1, 20));
    setPluginData( "plugin2-genid15", value );
  });

  $( "label[for='plugin2-genid15']" ).dblclick(function() {
    $( "#plugin2-genid15" ).val($( "#plugin2-genid15" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin2-genid15" ).change();
  });

  $( "#plugin2-genid16" ).data('default', 0);
  
  $( "#plugin2-genid16_" ).slider({
    value: $( "#plugin2-genid16" ).data('default'),
    min:   -80,
    max:   0,
    step:  (0 - -80) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin2-genid16").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin2-genid16", value );
    }                       
  });
  $( "#plugin2-genid16" ).change(function () {
    var value = this.value;
    $( "#plugin2-genid16_" ).slider("value", value);
    setPluginData( "plugin2-genid16", value );
  });

  $( "label[for='plugin2-genid16']" ).dblclick(function() {
    $( "#plugin2-genid16" ).val($( "#plugin2-genid16" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin2-genid16" ).change();
  });

  $( "#plugin2-genid2" ).data('default', 0);
  
  $( "#plugin2-genid2_" ).slider({
    value: $( "#plugin2-genid2" ).data('default'),
    min:   0,
    max:   30,
    step:  (30 - 0) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin2-genid2").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin2-genid2", value );
    }                       
  });
  $( "#plugin2-genid2" ).change(function () {
    var value = this.value;
    $( "#plugin2-genid2_" ).slider("value", value);
    setPluginData( "plugin2-genid2", value );
  });

  $( "label[for='plugin2-genid2']" ).dblclick(function() {
    $( "#plugin2-genid2" ).val($( "#plugin2-genid2" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin2-genid2" ).change();
  });

  $( "#plugin2-genid4" ).data('default', 1);
  
  $( "#plugin2-genid4_" ).slider({
    value: $( "#plugin2-genid4" ).data('default'),
    min:   1,
    max:   150,
    step:  (150 - 1) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin2-genid4").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin2-genid4", value );
    }                       
  });
  $( "#plugin2-genid4" ).change(function () {
    var value = this.value;
    $( "#plugin2-genid4_" ).slider("value", value);
    setPluginData( "plugin2-genid4", value );
  });

  $( "label[for='plugin2-genid4']" ).dblclick(function() {
    $( "#plugin2-genid4" ).val($( "#plugin2-genid4" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin2-genid4" ).change();
  });

  $( "#plugin2-genid8" ).data('default', 0);
  
  $( "#plugin2-genid8_" ).slider({
    value: $( "#plugin2-genid8" ).data('default'),
    min:   0,
    max:   1,
    step:  (1 - 0) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin2-genid8").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin2-genid8", value );
    }                       
  });
  $( "#plugin2-genid8" ).change(function () {
    var value = this.value;
    $( "#plugin2-genid8_" ).slider("value", value);
    setPluginData( "plugin2-genid8", value );
  });

  $( "label[for='plugin2-genid8']" ).dblclick(function() {
    $( "#plugin2-genid8" ).val($( "#plugin2-genid8" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin2-genid8" ).change();
  });

// http://stackingdwarves.net/lv2/sm

  $( "#plugin10-genid19" ).data('default', 0);
  
  $( "#plugin10-genid19_" ).slider({
    value: $( "#plugin10-genid19" ).data('default'),
    min:   -90,
    max:   10,
    step:  (10 - -90) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin10-genid19").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin10-genid19", value );
    }                       
  });
  $( "#plugin10-genid19" ).change(function () {
    var value = this.value;
    $( "#plugin10-genid19_" ).slider("value", value);
    setPluginData( "plugin10-genid19", value );
  });

  $( "label[for='plugin10-genid19']" ).dblclick(function() {
    $( "#plugin10-genid19" ).val($( "#plugin10-genid19" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin10-genid19" ).change();
  });

  $( "#plugin10-genid9" ).data('default', 0);
  
  $( "#plugin10-genid9_" ).slider({
    value: $( "#plugin10-genid9" ).data('default'),
    min:   -12,
    max:   0,
    step:  (0 - -12) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin10-genid9").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin10-genid9", value );
    }                       
  });
  $( "#plugin10-genid9" ).change(function () {
    var value = this.value;
    $( "#plugin10-genid9_" ).slider("value", value);
    setPluginData( "plugin10-genid9", value );
  });

  $( "label[for='plugin10-genid9']" ).dblclick(function() {
    $( "#plugin10-genid9" ).val($( "#plugin10-genid9" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin10-genid9" ).change();
  });

  $( "#plugin10-genid20" ).data('default', 1.0);
  $( "#plugin10-genid20_" ).change(function () {
    us = $( "#plugin10-genid20_" );
    them = $( "#plugin10-genid20" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin10-genid20", value );
  });
  $( "#plugin10-genid20" ).change(function () {
    us = $( "#plugin10-genid20" );
    them = $( "#plugin10-genid20_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin10-genid20", value );
  });

  $( "label[for='plugin10-genid20']" ).dblclick(function() {
    $( "#plugin10-genid20" ).val($( "#plugin10-genid20" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin10-genid20" ).change();
  });

  $( "#plugin10-genid21" ).data('default', 0);
  
  $( "#plugin10-genid21_" ).slider({
    value: $( "#plugin10-genid21" ).data('default'),
    min:   0,
    max:   50,
    step:  (50 - 0) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin10-genid21").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin10-genid21", value );
    }                       
  });
  $( "#plugin10-genid21" ).change(function () {
    var value = this.value;
    $( "#plugin10-genid21_" ).slider("value", value);
    setPluginData( "plugin10-genid21", value );
  });

  $( "label[for='plugin10-genid21']" ).dblclick(function() {
    $( "#plugin10-genid21" ).val($( "#plugin10-genid21" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin10-genid21" ).change();
  });

  $( "#plugin10-genid22" ).data('default', 1.0);
  $( "#plugin10-genid22_" ).change(function () {
    us = $( "#plugin10-genid22_" );
    them = $( "#plugin10-genid22" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin10-genid22", value );
  });
  $( "#plugin10-genid22" ).change(function () {
    us = $( "#plugin10-genid22" );
    them = $( "#plugin10-genid22_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin10-genid22", value );
  });

  $( "label[for='plugin10-genid22']" ).dblclick(function() {
    $( "#plugin10-genid22" ).val($( "#plugin10-genid22" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin10-genid22" ).change();
  });

  $( "#plugin10-genid23" ).data('default', 1.0);
  $( "#plugin10-genid23_" ).change(function () {
    us = $( "#plugin10-genid23_" );
    them = $( "#plugin10-genid23" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin10-genid23", value );
  });
  $( "#plugin10-genid23" ).change(function () {
    us = $( "#plugin10-genid23" );
    them = $( "#plugin10-genid23_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin10-genid23", value );
  });

  $( "label[for='plugin10-genid23']" ).dblclick(function() {
    $( "#plugin10-genid23" ).val($( "#plugin10-genid23" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin10-genid23" ).change();
  });

  $( "#plugin10-genid32" ).data('default', 0);
  
  $( "#plugin10-genid32_" ).slider({
    value: $( "#plugin10-genid32" ).data('default'),
    min:   -12,
    max:   0,
    step:  (0 - -12) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin10-genid32").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin10-genid32", value );
    }                       
  });
  $( "#plugin10-genid32" ).change(function () {
    var value = this.value;
    $( "#plugin10-genid32_" ).slider("value", value);
    setPluginData( "plugin10-genid32", value );
  });

  $( "label[for='plugin10-genid32']" ).dblclick(function() {
    $( "#plugin10-genid32" ).val($( "#plugin10-genid32" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin10-genid32" ).change();
  });

  $( "#plugin10-genid33" ).data('default', 1.0);
  $( "#plugin10-genid33_" ).change(function () {
    us = $( "#plugin10-genid33_" );
    them = $( "#plugin10-genid33" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin10-genid33", value );
  });
  $( "#plugin10-genid33" ).change(function () {
    us = $( "#plugin10-genid33" );
    them = $( "#plugin10-genid33_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin10-genid33", value );
  });

  $( "label[for='plugin10-genid33']" ).dblclick(function() {
    $( "#plugin10-genid33" ).val($( "#plugin10-genid33" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin10-genid33" ).change();
  });

  $( "#plugin10-genid34" ).data('default', 0);
  
  $( "#plugin10-genid34_" ).slider({
    value: $( "#plugin10-genid34" ).data('default'),
    min:   0,
    max:   50,
    step:  (50 - 0) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin10-genid34").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin10-genid34", value );
    }                       
  });
  $( "#plugin10-genid34" ).change(function () {
    var value = this.value;
    $( "#plugin10-genid34_" ).slider("value", value);
    setPluginData( "plugin10-genid34", value );
  });

  $( "label[for='plugin10-genid34']" ).dblclick(function() {
    $( "#plugin10-genid34" ).val($( "#plugin10-genid34" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin10-genid34" ).change();
  });

  $( "#plugin10-genid35" ).data('default', 1.0);
  $( "#plugin10-genid35_" ).change(function () {
    us = $( "#plugin10-genid35_" );
    them = $( "#plugin10-genid35" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin10-genid35", value );
  });
  $( "#plugin10-genid35" ).change(function () {
    us = $( "#plugin10-genid35" );
    them = $( "#plugin10-genid35_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin10-genid35", value );
  });

  $( "label[for='plugin10-genid35']" ).dblclick(function() {
    $( "#plugin10-genid35" ).val($( "#plugin10-genid35" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin10-genid35" ).change();
  });

  $( "#plugin10-genid36" ).data('default', 1.0);
  $( "#plugin10-genid36_" ).change(function () {
    us = $( "#plugin10-genid36_" );
    them = $( "#plugin10-genid36" );
    if (us.prop("checked")) {
      them.val(1);
    } else {
      them.val(0);
    }
    var value = them.val();
    setPluginData( "plugin10-genid36", value );
  });
  $( "#plugin10-genid36" ).change(function () {
    us = $( "#plugin10-genid36" );
    them = $( "#plugin10-genid36_" );
    var value = us.val();
    if (value == 1) {
      them.prop('checked', true);
    } else {
      them.prop('checked', false);
    }
    setPluginData( "plugin10-genid36", value );
  });

  $( "label[for='plugin10-genid36']" ).dblclick(function() {
    $( "#plugin10-genid36" ).val($( "#plugin10-genid36" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin10-genid36" ).change();
  });

// http://plugin.org.uk/swh-plugins/lowpass_iir

  $( "#plugin11-genid1" ).data('default', 16201.2);
  
  $( "#plugin11-genid1_" ).slider({
    value: log2lin($( "#plugin11-genid1" ).data('default'), 4.8, 21600),
    min: 0,
    max: SLIDER_RESOLUTION,
    step: 1,
    slide: function(event, ui) {
      var value = lin2log(ui.value, 4.8, 21600);
      $("#plugin11-genid1").val(value.toFixed(NUMBOX_DECIMALS));
      setPluginData( "plugin11-genid1", value );               
    }        
  });
  $( "#plugin11-genid1" ).change(function () {
    var value = this.value;
    $("#plugin11-genid1_").slider("value", log2lin(value, 4.8, 21600));
    setPluginData( "plugin11-genid1", value );
  });

  $( "label[for='plugin11-genid1']" ).dblclick(function() {
    $( "#plugin11-genid1" ).val($( "#plugin11-genid1" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin11-genid1" ).change();
  });

  $( "#plugin11-genid2" ).data('default', 1);
  
  $( "#plugin11-genid2_" ).slider({
    value: $( "#plugin11-genid2" ).data('default'),
    min:   1,
    max:   10,
    step:  (10 - 1) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin11-genid2").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin11-genid2", value );
    }                       
  });
  $( "#plugin11-genid2" ).change(function () {
    var value = this.value;
    $( "#plugin11-genid2_" ).slider("value", value);
    setPluginData( "plugin11-genid2", value );
  });

  $( "label[for='plugin11-genid2']" ).dblclick(function() {
    $( "#plugin11-genid2" ).val($( "#plugin11-genid2" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin11-genid2" ).change();
  });

// urn:zamaudio:ZaMaximX2

  $( "#plugin12-genid7" ).data('default', 25);
  
  $( "#plugin12-genid7_" ).slider({
    value: log2lin($( "#plugin12-genid7" ).data('default'), 1, 100),
    min: 0,
    max: SLIDER_RESOLUTION,
    step: 1,
    slide: function(event, ui) {
      var value = lin2log(ui.value, 1, 100);
      $("#plugin12-genid7").val(value.toFixed(NUMBOX_DECIMALS));
      setPluginData( "plugin12-genid7", value );               
    }        
  });
  $( "#plugin12-genid7" ).change(function () {
    var value = this.value;
    $("#plugin12-genid7_").slider("value", log2lin(value, 1, 100));
    setPluginData( "plugin12-genid7", value );
  });

  $( "label[for='plugin12-genid7']" ).dblclick(function() {
    $( "#plugin12-genid7" ).val($( "#plugin12-genid7" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin12-genid7" ).change();
  });

  $( "#plugin12-genid8" ).data('default', 0);
  
  $( "#plugin12-genid8_" ).slider({
    value: $( "#plugin12-genid8" ).data('default'),
    min:   -30,
    max:   0,
    step:  (0 - -30) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin12-genid8").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin12-genid8", value );
    }                       
  });
  $( "#plugin12-genid8" ).change(function () {
    var value = this.value;
    $( "#plugin12-genid8_" ).slider("value", value);
    setPluginData( "plugin12-genid8", value );
  });

  $( "label[for='plugin12-genid8']" ).dblclick(function() {
    $( "#plugin12-genid8" ).val($( "#plugin12-genid8" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin12-genid8" ).change();
  });

  $( "#plugin12-genid9" ).data('default', 0);
  
  $( "#plugin12-genid9_" ).slider({
    value: $( "#plugin12-genid9" ).data('default'),
    min:   -30,
    max:   0,
    step:  (0 - -30) / SLIDER_RESOLUTION,
    slide: function(event, ui) {
      var value = ui.value;
      $("#plugin12-genid9").val(value.toFixed(NUMBOX_DECIMALS));
    setPluginData( "plugin12-genid9", value );
    }                       
  });
  $( "#plugin12-genid9" ).change(function () {
    var value = this.value;
    $( "#plugin12-genid9_" ).slider("value", value);
    setPluginData( "plugin12-genid9", value );
  });

  $( "label[for='plugin12-genid9']" ).dblclick(function() {
    $( "#plugin12-genid9" ).val($( "#plugin12-genid9" ).data('default').toFixed(NUMBOX_DECIMALS));
    $( "#plugin12-genid9" ).change();
  });


  $( document ).tooltip();
  $( "#pluginList" ).accordion({
    header: "section.pluginGUI h1",
    heightStyle: "content",
    collapsible: true,
    active: false
  });
  $( "#ajaxDebug" ).accordion({
    header: "h1",
    heightStyle: "content",
    collapsible: true,
    active: false
  }).draggable({
    appendTo: "body",
    containment: "window",
    scroll: false,
    stop: function(event, ui) {
      var top = ui.helper.offset(top) - $(window).scrollTop();
      ui.helper.css('position', 'fixed');
      ui.helper.css('top', top+"px");
    }
  });
  init();

});
 
  

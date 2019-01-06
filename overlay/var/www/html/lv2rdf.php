<?php 
define("HOST", 'localhost');
define("PORT", '5555');
$errno = 0;
$errstr = "";
@$fp = fsockopen(HOST, PORT, $errno, $errstr);
if (!$fp) {
  header('Could not connect to mod-host.', true, 503);
  echo 'Error No. ' . $errno . ': Could not connect to mod-host. Error message is "' . $errstr .'".';
  exit;
}
$req = "";
$res = "";
$nodeIDs = array(); 
$instance = 0;

  
$instance = 1;

  $nodeIDs['plugin1-genid20'] = array();
  $nodeIDs['plugin1-genid20']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid20']['symbol'] = "enable";
  $nodeIDs['plugin1-genid20']['value'] = "1";

  $nodeIDs['plugin1-genid31'] = array();
  $nodeIDs['plugin1-genid31']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid31']['symbol'] = "gain";
  $nodeIDs['plugin1-genid31']['value'] = "0.0";

  $nodeIDs['plugin1-genid38'] = array();
  $nodeIDs['plugin1-genid38']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid38']['symbol'] = "peakreset";
  $nodeIDs['plugin1-genid38']['value'] = "1";

  $nodeIDs['plugin1-genid39'] = array();
  $nodeIDs['plugin1-genid39']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid39']['symbol'] = "HighPass";
  $nodeIDs['plugin1-genid39']['value'] = "0";

  $nodeIDs['plugin1-genid40'] = array();
  $nodeIDs['plugin1-genid40']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid40']['symbol'] = "HPfreq";
  $nodeIDs['plugin1-genid40']['value'] = "20.0";

  $nodeIDs['plugin1-genid44'] = array();
  $nodeIDs['plugin1-genid44']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid44']['symbol'] = "HPQ";
  $nodeIDs['plugin1-genid44']['value'] = "0.7";

  $nodeIDs['plugin1-genid2'] = array();
  $nodeIDs['plugin1-genid2']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid2']['symbol'] = "LowPass";
  $nodeIDs['plugin1-genid2']['value'] = "0";

  $nodeIDs['plugin1-genid3'] = array();
  $nodeIDs['plugin1-genid3']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid3']['symbol'] = "LPfreq";
  $nodeIDs['plugin1-genid3']['value'] = "20000.0";

  $nodeIDs['plugin1-genid7'] = array();
  $nodeIDs['plugin1-genid7']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid7']['symbol'] = "LPQ";
  $nodeIDs['plugin1-genid7']['value'] = "1.0";

  $nodeIDs['plugin1-genid8'] = array();
  $nodeIDs['plugin1-genid8']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid8']['symbol'] = "LSsec";
  $nodeIDs['plugin1-genid8']['value'] = "1";

  $nodeIDs['plugin1-genid10'] = array();
  $nodeIDs['plugin1-genid10']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid10']['symbol'] = "LSfreq";
  $nodeIDs['plugin1-genid10']['value'] = "80.0";

  $nodeIDs['plugin1-genid11'] = array();
  $nodeIDs['plugin1-genid11']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid11']['symbol'] = "LSq";
  $nodeIDs['plugin1-genid11']['value'] = "1.0";

  $nodeIDs['plugin1-genid12'] = array();
  $nodeIDs['plugin1-genid12']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid12']['symbol'] = "LSgain";
  $nodeIDs['plugin1-genid12']['value'] = "0.0";

  $nodeIDs['plugin1-genid13'] = array();
  $nodeIDs['plugin1-genid13']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid13']['symbol'] = "sec1";
  $nodeIDs['plugin1-genid13']['value'] = "1";

  $nodeIDs['plugin1-genid14'] = array();
  $nodeIDs['plugin1-genid14']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid14']['symbol'] = "freq1";
  $nodeIDs['plugin1-genid14']['value'] = "160.0";

  $nodeIDs['plugin1-genid15'] = array();
  $nodeIDs['plugin1-genid15']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid15']['symbol'] = "q1";
  $nodeIDs['plugin1-genid15']['value'] = "0.6";

  $nodeIDs['plugin1-genid16'] = array();
  $nodeIDs['plugin1-genid16']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid16']['symbol'] = "gain1";
  $nodeIDs['plugin1-genid16']['value'] = "0.0";

  $nodeIDs['plugin1-genid17'] = array();
  $nodeIDs['plugin1-genid17']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid17']['symbol'] = "sec2";
  $nodeIDs['plugin1-genid17']['value'] = "1";

  $nodeIDs['plugin1-genid18'] = array();
  $nodeIDs['plugin1-genid18']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid18']['symbol'] = "freq2";
  $nodeIDs['plugin1-genid18']['value'] = "397.0";

  $nodeIDs['plugin1-genid19'] = array();
  $nodeIDs['plugin1-genid19']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid19']['symbol'] = "q2";
  $nodeIDs['plugin1-genid19']['value'] = "0.6";

  $nodeIDs['plugin1-genid21'] = array();
  $nodeIDs['plugin1-genid21']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid21']['symbol'] = "gain2";
  $nodeIDs['plugin1-genid21']['value'] = "0.0";

  $nodeIDs['plugin1-genid22'] = array();
  $nodeIDs['plugin1-genid22']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid22']['symbol'] = "sec3";
  $nodeIDs['plugin1-genid22']['value'] = "1";

  $nodeIDs['plugin1-genid23'] = array();
  $nodeIDs['plugin1-genid23']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid23']['symbol'] = "freq3";
  $nodeIDs['plugin1-genid23']['value'] = "1250.0";

  $nodeIDs['plugin1-genid24'] = array();
  $nodeIDs['plugin1-genid24']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid24']['symbol'] = "q3";
  $nodeIDs['plugin1-genid24']['value'] = "0.6";

  $nodeIDs['plugin1-genid25'] = array();
  $nodeIDs['plugin1-genid25']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid25']['symbol'] = "gain3";
  $nodeIDs['plugin1-genid25']['value'] = "0.0";

  $nodeIDs['plugin1-genid26'] = array();
  $nodeIDs['plugin1-genid26']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid26']['symbol'] = "sec4";
  $nodeIDs['plugin1-genid26']['value'] = "1";

  $nodeIDs['plugin1-genid27'] = array();
  $nodeIDs['plugin1-genid27']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid27']['symbol'] = "freq4";
  $nodeIDs['plugin1-genid27']['value'] = "2500.0";

  $nodeIDs['plugin1-genid28'] = array();
  $nodeIDs['plugin1-genid28']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid28']['symbol'] = "q4";
  $nodeIDs['plugin1-genid28']['value'] = "0.6";

  $nodeIDs['plugin1-genid29'] = array();
  $nodeIDs['plugin1-genid29']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid29']['symbol'] = "gain4";
  $nodeIDs['plugin1-genid29']['value'] = "0.0";

  $nodeIDs['plugin1-genid30'] = array();
  $nodeIDs['plugin1-genid30']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid30']['symbol'] = "HSsec";
  $nodeIDs['plugin1-genid30']['value'] = "1";

  $nodeIDs['plugin1-genid32'] = array();
  $nodeIDs['plugin1-genid32']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid32']['symbol'] = "HSfreq";
  $nodeIDs['plugin1-genid32']['value'] = "8000.0";

  $nodeIDs['plugin1-genid33'] = array();
  $nodeIDs['plugin1-genid33']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid33']['symbol'] = "HSq";
  $nodeIDs['plugin1-genid33']['value'] = "1.0";

  $nodeIDs['plugin1-genid34'] = array();
  $nodeIDs['plugin1-genid34']['instanceNo'] = $instance;
  $nodeIDs['plugin1-genid34']['symbol'] = "HSgain";
  $nodeIDs['plugin1-genid34']['value'] = "0.0";

$instance = 2;

  $nodeIDs['plugin2-genid11'] = array();
  $nodeIDs['plugin2-genid11']['instanceNo'] = $instance;
  $nodeIDs['plugin2-genid11']['symbol'] = "att";
  $nodeIDs['plugin2-genid11']['value'] = "10.000000";

  $nodeIDs['plugin2-genid12'] = array();
  $nodeIDs['plugin2-genid12']['instanceNo'] = $instance;
  $nodeIDs['plugin2-genid12']['symbol'] = "rel";
  $nodeIDs['plugin2-genid12']['value'] = "80.000000";

  $nodeIDs['plugin2-genid13'] = array();
  $nodeIDs['plugin2-genid13']['instanceNo'] = $instance;
  $nodeIDs['plugin2-genid13']['symbol'] = "kn";
  $nodeIDs['plugin2-genid13']['value'] = "0.000000";

  $nodeIDs['plugin2-genid15'] = array();
  $nodeIDs['plugin2-genid15']['instanceNo'] = $instance;
  $nodeIDs['plugin2-genid15']['symbol'] = "rat";
  $nodeIDs['plugin2-genid15']['value'] = "4.000000";

  $nodeIDs['plugin2-genid16'] = array();
  $nodeIDs['plugin2-genid16']['instanceNo'] = $instance;
  $nodeIDs['plugin2-genid16']['symbol'] = "thr";
  $nodeIDs['plugin2-genid16']['value'] = "0.000000";

  $nodeIDs['plugin2-genid2'] = array();
  $nodeIDs['plugin2-genid2']['instanceNo'] = $instance;
  $nodeIDs['plugin2-genid2']['symbol'] = "mak";
  $nodeIDs['plugin2-genid2']['value'] = "0.000000";

  $nodeIDs['plugin2-genid4'] = array();
  $nodeIDs['plugin2-genid4']['instanceNo'] = $instance;
  $nodeIDs['plugin2-genid4']['symbol'] = "slew";
  $nodeIDs['plugin2-genid4']['value'] = "1.000000";

  $nodeIDs['plugin2-genid8'] = array();
  $nodeIDs['plugin2-genid8']['instanceNo'] = $instance;
  $nodeIDs['plugin2-genid8']['symbol'] = "sidech";
  $nodeIDs['plugin2-genid8']['value'] = "0.000000";

$instance = 10;

  $nodeIDs['plugin10-genid19'] = array();
  $nodeIDs['plugin10-genid19']['instanceNo'] = $instance;
  $nodeIDs['plugin10-genid19']['symbol'] = "gain";
  $nodeIDs['plugin10-genid19']['value'] = "0.0";

  $nodeIDs['plugin10-genid9'] = array();
  $nodeIDs['plugin10-genid9']['instanceNo'] = $instance;
  $nodeIDs['plugin10-genid9']['symbol'] = "attL";
  $nodeIDs['plugin10-genid9']['value'] = "0.0";

  $nodeIDs['plugin10-genid20'] = array();
  $nodeIDs['plugin10-genid20']['instanceNo'] = $instance;
  $nodeIDs['plugin10-genid20']['symbol'] = "attOnL";
  $nodeIDs['plugin10-genid20']['value'] = "1.0";

  $nodeIDs['plugin10-genid21'] = array();
  $nodeIDs['plugin10-genid21']['instanceNo'] = $instance;
  $nodeIDs['plugin10-genid21']['symbol'] = "delayL";
  $nodeIDs['plugin10-genid21']['value'] = "0.0";

  $nodeIDs['plugin10-genid22'] = array();
  $nodeIDs['plugin10-genid22']['instanceNo'] = $instance;
  $nodeIDs['plugin10-genid22']['symbol'] = "delayLOn";
  $nodeIDs['plugin10-genid22']['value'] = "1.0";

  $nodeIDs['plugin10-genid23'] = array();
  $nodeIDs['plugin10-genid23']['instanceNo'] = $instance;
  $nodeIDs['plugin10-genid23']['symbol'] = "activeL";
  $nodeIDs['plugin10-genid23']['value'] = "1.0";

  $nodeIDs['plugin10-genid32'] = array();
  $nodeIDs['plugin10-genid32']['instanceNo'] = $instance;
  $nodeIDs['plugin10-genid32']['symbol'] = "attR";
  $nodeIDs['plugin10-genid32']['value'] = "0.0";

  $nodeIDs['plugin10-genid33'] = array();
  $nodeIDs['plugin10-genid33']['instanceNo'] = $instance;
  $nodeIDs['plugin10-genid33']['symbol'] = "attOnR";
  $nodeIDs['plugin10-genid33']['value'] = "1.0";

  $nodeIDs['plugin10-genid34'] = array();
  $nodeIDs['plugin10-genid34']['instanceNo'] = $instance;
  $nodeIDs['plugin10-genid34']['symbol'] = "delayR";
  $nodeIDs['plugin10-genid34']['value'] = "0.0";

  $nodeIDs['plugin10-genid35'] = array();
  $nodeIDs['plugin10-genid35']['instanceNo'] = $instance;
  $nodeIDs['plugin10-genid35']['symbol'] = "delayROn";
  $nodeIDs['plugin10-genid35']['value'] = "1.0";

  $nodeIDs['plugin10-genid36'] = array();
  $nodeIDs['plugin10-genid36']['instanceNo'] = $instance;
  $nodeIDs['plugin10-genid36']['symbol'] = "activeR";
  $nodeIDs['plugin10-genid36']['value'] = "1.0";

$instance = 11;

  $nodeIDs['plugin11-genid1'] = array();
  $nodeIDs['plugin11-genid1']['instanceNo'] = $instance;
  $nodeIDs['plugin11-genid1']['symbol'] = "cutoff";
  $nodeIDs['plugin11-genid1']['value'] = "0.337525";

  $nodeIDs['plugin11-genid2'] = array();
  $nodeIDs['plugin11-genid2']['instanceNo'] = $instance;
  $nodeIDs['plugin11-genid2']['symbol'] = "stages";
  $nodeIDs['plugin11-genid2']['value'] = "1.0";

$instance = 12;

  $nodeIDs['plugin12-genid7'] = array();
  $nodeIDs['plugin12-genid7']['instanceNo'] = $instance;
  $nodeIDs['plugin12-genid7']['symbol'] = "rel";
  $nodeIDs['plugin12-genid7']['value'] = "25.000000";

  $nodeIDs['plugin12-genid8'] = array();
  $nodeIDs['plugin12-genid8']['instanceNo'] = $instance;
  $nodeIDs['plugin12-genid8']['symbol'] = "ceil";
  $nodeIDs['plugin12-genid8']['value'] = "0.000000";

  $nodeIDs['plugin12-genid9'] = array();
  $nodeIDs['plugin12-genid9']['instanceNo'] = $instance;
  $nodeIDs['plugin12-genid9']['symbol'] = "thresh";
  $nodeIDs['plugin12-genid9']['value'] = "0.000000";


if (isset($_POST['nodeID'])) {
   // We are updating a single parameter.
   // Be sure to sanitize user-generated input. We assume using it as an array index is safe.
   // Strings used verbatim must be sanitized.
   $req = "param_set " 
   	. $nodeIDs[$_POST['nodeID']]['instanceNo'] . " " 
   	. $nodeIDs[$_POST['nodeID']]['symbol'] . " " 
   	. filter_var($_POST['value'], FILTER_SANITIZE_NUMBER_FLOAT, FILTER_FLAG_ALLOW_FRACTION);
   fwrite($fp, $req);
   $res = fread($fp, 256);
   $res = substr($res, 0, -1); // remove null termination
   $retval = substr($res, 5); // assume "resp N"
   if ($retval == 0) { 
     // default case, all is well
     header('Content-Type: application/json');
     echo json_encode($req . " completed successfully.");
   } else if ($retval > 0) {
     // only for newly instantiated plugins (not implemented yet in the frontend)
     header('Content-Type: application/json');
     echo json_encode($retval);
   } else if ($retval < 0) {
     header('mod-host command error ' . $retval, true, 503);
     echo 'mod-host command error ' . $retval;
   } else {
     header('Unknown mod-host command error: ' . $res, true, 503);
     echo 'Unknown mod-host command error: ' . $res;
   }
   exit; // Terminate processing, we're done.
}

// We are interested in all current parameters. Get them:

foreach ($nodeIDs as $nodeID => $data) {
  $req = "param_get " . $data['instanceNo'] . " " . $data['symbol'];
  //echo "$req... : ";
  fwrite($fp, $req);
  $res = fread($fp, 256);
  $res = substr($res,0,-1); // remove null termination
  //echo "$res";
  $res = preg_split('/ +/', $res, 3); // split along spaces
  $last = count($res) - 1; // we expect the payload as the last token
  $nodeIDs[$nodeID]['value'] = $res[$last];
} 

if (isset($_GET['dumpPersistenceCommands'])) {
  // System queries us for command list to restore current state.
  header('Content-Type: text/plain');
  foreach($nodeIDs as $nodeID) {
    echo "param_set ".$nodeID['instanceNo']." ".$nodeID['symbol']." ".$nodeID['value']."\n";
  }
  exit; // Terminate, we're done.
}

if (isset($_GET['getPluginData'])) {
  // Front-end wants to know all values.
  header('Content-Type: application/json');
  echo json_encode($nodeIDs);
  exit; // Terminate, we're done.
}
if (isset($_GET['DEBUG'])) {
  // Developer wants a human-readable dump:
?><html><head><title>DEBUG</title></head><body><div><pre><?php 
        var_dump($nodeIDs);
?></pre></div></body></html><?php      
} 
fclose($fp);
?>

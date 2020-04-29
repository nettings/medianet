<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

define('PREG_KEY',   '^([a-zA-Z][a-zA-Z0-9_-]+)=');
define('PREG_VALUE', '[\'\"]?(.*)[\'\"]?$');
define('ACTIVE',     '<span class="icon active">⊕</span>');
define('INACTIVE',   '<span class="icon inactive">⊘</span>');
define('TRANSITION', '<span class="icon transition">⊙</span>');
define('UNKNOWN',    '<span class="icon unknown">⊙</span>');

function parse_bash_config($fname) {
  $c = file($fname);
  foreach ($c as $line) {
    # save a few cycles by throwing away the easy ones before matching...
    $s = substr($line, 0, 1);
    if ($s == '#' || $s == '\n') continue;
    # match shell variables:
    if (preg_match('/' . PREG_KEY . PREG_VALUE . '/', $line, $match)) {
      $config[$match[1]] = $match[2];
    }
  }
  return $config;
}

$config = parse_bash_config(dirname(__FILE__).'/mn_tunnel.conf');
$daemon_status = UNKNOWN . ' Tunnelling service unknown'; 
$link_status = UNKNOWN . ' Tunnel link status unknown.';
$refresh = 300;
$req = 'none';
$reqtime = ''; 
$is_up = '';
$is_running = '';
$start_stop_active = true;
$check_active = false;
$rout = ''; 
$rval = '';   
$fingerprints = '';  
$cmd = ''; 

if (isset($_REQUEST['tunnel'])) {
  $req = $_REQUEST['tunnel'];
  switch ($req) {
    case 'start':
      exec('/bin/touch ' . escapeshellarg($config['TUNNEL_STATEFILE']));
      $daemon_status = TRANSITION . ' Tunnelling service activating...';
      $cmd = 'stop';
      $start_stop_active = false;
      $refresh = 2;
      break;
    case 'stop':
      exec('/bin/rm ' . escapeshellarg($config['TUNNEL_STATEFILE']));
      $daemon_status = TRANSITION . ' Tunnelling service stopping...';
      $cmd = 'start';
      $start_stop_active = false;
      $refresh = 2;
      break;
    case 'check':
      break;
    default:
      $req = '';
  }
}
if (!$cmd) {
  exec('/bin/systemctl is-active mn_tunnel', $rout, $rval);
  $is_running = $rval ? FALSE : TRUE;
  if ($is_running) {
    $daemon_status = ACTIVE . ' Tunnelling service is active.';
    $cmd = 'stop';
    $check_active = true;
  } else {
    $daemon_status = INACTIVE . ' Tunnelling service is inactive.';
    $cmd = 'start';
    $check_active = false;
  }
  
  unset($rout);
  exec('/usr/local/bin/mn_tunnel_check', $rout, $rval);
  $is_up = $rval ? FALSE : TRUE;
  if ($is_up) {
    $link_status = ACTIVE . ' Tunnel link is alive.';
    foreach ($rout as $line) {
      if (strpos($line, $config['TUNNEL_PORT_CHECK']) !== false) {
        if ($fingerprints) $fingerprints .= "</pre>\n</div>\n";
        $fingerprints .= "<div class='fingerprint'>\n<div>\n";
        $line = explode(' ', $line);
        $fingerprints .= "  <span>[host]:port (cipher): $line[2] $line[3]</span>\n";
        $fingerprints .= "  <span>$line[1]</span>\n";
        $fingerprints .= "</div>\n";
        $fingerprints .= "<pre>\n";
      } else {
        $fingerprints .= "$line\n";
      }
    }
    $fingerprints .= "</pre>\n</div>\n";
  } else {
    $link_status = INACTIVE . ' Tunnel link is dead.';
  }
}
$reqtime = date('H:i:s') ;

?>
<!DOCTYPE html>
<html>
  <head>
    <title>[mn] Medianet maintenance tunnel</title>
    <meta http-equiv="refresh" content="<?php print($refresh); ?>"/>
    <style type="text/css">
      .icon	{ font-size: 140%; }
      .active	{ color: #66cc66; }
      .inactive { color: #cc6666; }
      .transition { color: #cccc00; }
      .unknown	{ color: #9999aa; }
      span.request {
        font-weight: bold;
      }
      form#tunnel {
        display: table;
        border-collapse: collapse;
        width: 28em;
      }
      form#tunnel > fieldset > div  {
        display: table-row;
      }
      form#tunnel > fieldset > div > label,button {
        display: table-cell;
        width: 100%;
        margin: 0.5ex;
      }
      form#tunnel > fieldset > div > div,pre {
        border:5px dotted violet;
        display: table-cell;
        width: 100%;
      }
      form#tunnel > fieldset > div > div > span {
        border:4px solid white;
        display: table-row;
        width: 100%;
      }
      .fingerprint {
        font-size: 50%;
      }
    </style>
    <script type="text/javascript">
      function toggle() {
        var fp = document.getElementsByClassName('fingerprint');
        var vfp = document.getElementById('viewfp');
        if (!vfp.innerHTML || vfp.innerHTML == 'hide') {
          vfp.innerHTML = 'view';
          for (var i=0; i < fp.length; i++) {
            fp[i].style.display='none';
          }
        } else {
          vfp.innerHTML = 'hide';
          for (var i=0; i < fp.length; i++) {
            fp[i].style.display='table-row';
          }
        }
      }	

      document.addEventListener("DOMContentLoaded", toggle);
    </script> 
  </head>
  <body>
    <form id="tunnel" action="<?php print(basename(__FILE__)); ?>" method="post">
      <fieldset>
        <legend>[mn] media<strong>net</strong> maintenance tunnel</legend>
        <div>
          <label for="daemon"><?php print($daemon_status); ?></label>
          <button 
            id="daemon"
            name="tunnel"
            type="submit"
            value="<?php print($cmd); ?>"
            <?php print($start_stop_active ? '' : 'disabled'); ?>
          ><?php print($cmd); ?></button>
        </div>
        <div>
          <label for="link"><?php print($link_status); ?></label>
          <button
            id="link"
            name="tunnel"
            type="submit"
            value="check"
            <?php print($check_active ? '' : 'disabled'); ?>
          >check</button>
        </div>
        <div>
          <label for="viewfp">Last request: <?php print($req); ?> @ <?php print($reqtime); ?></label>
          <button
            id="viewfp"
            type="button"
            onclick="toggle();"
          ></button>
        </div>
        <?php echo($fingerprints); ?>
      </fieldset>
    </form>
  </body>
</html>


<?php
/*
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
*/
define('PREG_KEY',   '^([a-zA-Z][a-zA-Z0-9_-]+)=');
define('PREG_VALUE', '[\'\"]?(.*)[\'\"]?$');
define('ACTIVE',     '<span class="icon active">✔</span>');
define('INACTIVE',   '<span class="icon inactive">✘</span>');
define('TRANSITION', '<span class="icon transition">⊙</span>');
define('UNKNOWN',    '<span class="icon unknown"><strong>?</strong> </span>');
define('CONFIG_FILE', dirname(__FILE__).'/mn_tunnel.conf');

function parse_bash_config() {
  $c = file(CONFIG_FILE);
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

function check_daemon(&$up) {
  exec('/bin/systemctl is-active mn_tunnel', $rout, $rval);
  $up = $rval ? FALSE : TRUE;
}

function check_link(&$up) {
  exec('/usr/local/bin/mn_tunnel_check', $rout, $rval);
  $up = $rval ? FALSE : TRUE;
  return $rout;
}

function parse_fingerprints($rout) {
  global $config;
  $out = '';
  foreach ($rout as $line) {
    // check if the line contains the port
    if (strpos($line, $config['TUNNEL_PORT_CHECK']) !== false) {
      // it's the host key information
      if ($out) {
        $out .= "</pre>\n";
        $out .= "        </div>\n";
      }
      $out .= "        <div class='fingerprint'>\n";
      $out .= "          <div>\n";
      $line = explode(' ', $line);
      $out .= "            <span class='hfp'>$line[2] $line[3]</span>\n";
      $out .= "            <span class='fp'>$line[1]</span>\n";
      $out .= "          </div>\n";
      $out .= "<pre>\n";
    } else {
      // it's the key ascii art
      $out .= "$line\n";
    }
  }
  $out .= "</pre>\n";
  $out .= "        </div>\n";
  return $out;
}

function start_link() {
  global $config;
  exec('/bin/touch ' . escapeshellarg($config['TUNNEL_STATEFILE']));
}

function stop_link() {
  global $config;
  exec('/bin/rm ' . escapeshellarg($config['TUNNEL_STATEFILE']));
}

// main
$daemon_status = UNKNOWN . ' Tunnelling service unknown';
$link_status = UNKNOWN . ' Tunnel link status unknown';
$refresh = 300;
$req = 'none';
$reqtime = date('H:i.s') ;
$start_stop_active = true;
$start_stop = '';
$check_active = false;
$show_active = false;
$fingerprints = '';
$config = parse_bash_config();

if (isset($_REQUEST['tunnel'])) {
  // user wants something
  $req = $_REQUEST['tunnel'];
  switch ($req) {
    case 'start':
      start_link();
      $daemon_status = TRANSITION . ' Tunnelling service activating...';
      $start_stop = 'stop';
      $start_stop_active = false;
      $refresh = 2;
      break;
    case 'stop':
      stop_link();
      $daemon_status = TRANSITION . ' Tunnelling service stopping...';
      $start_stop = 'start';
      $start_stop_active = false;
      $refresh = 2;
      break;
    case 'check':
      // we'll do that anyways
      break;
    default:
      $req = '';
  }
}

if (!$start_stop) {
  $is_up = '';
  $rout = '';
  // we're halfway through a start-stop request and auto-refreshing
  check_daemon($is_up);
  if ($is_up) {
    $daemon_status = ACTIVE . ' Tunnelling service is active.';
    $start_stop = 'stop';
    $check_active = true;
  } else {
    $daemon_status = INACTIVE . ' Tunnelling service is inactive.';
    $start_stop = 'start';
    $check_active = false;
  }
  $rout = check_link($is_up);
  if ($is_up) {
    $link_status = ACTIVE . ' Tunnel link is up';
    $show_active = TRUE;
    $fingerprints = parse_fingerprints($rout);
  } else {
    $link_status = INACTIVE . ' Tunnel link is down';
  }
}

$link_status .= " as of $reqtime.";
?>
<!DOCTYPE html>
<html>
  <head>
    <title>[mn] <?php print(gethostname()); ?> maintenance tunnel</title>
    <meta http-equiv="refresh" content="<?php print($refresh); ?>"/>
    <link rel="stylesheet" href="mn_tunnel.css" type="text/css"/>
    <script src="mn_tunnel.js" type="text/javascript"></script>
  </head>
  <body>
    <form id="tunnel" method="post">
      <fieldset>
        <legend>
          [mn] media<strong>net</strong> maintenance tunnel
          <span class="endpoints">
            <?php print(gethostname()); ?>
            &#x21c4; <?php print($config['TUNNEL_HOST'] . ":" . $config['TUNNEL_PORT_ACCESS'])?>
          </span>
        </legend>
        <div>

          <label for="daemon"><?php print($daemon_status); ?></label>
          <button
            id="daemon"
            name="tunnel"
            type="submit"
            value="<?php print($start_stop); ?>"
          <?php print($start_stop_active ? '' : "  disabled\n          "); ?>><?php print($start_stop); ?></button>
        </div>
        <div>
          <label for="link"><?php print($link_status); ?></label>
          <button
            id="link"
            name="tunnel"
            type="submit"
            value="check"
          <?php print($check_active ? '' : "  disabled\n          "); ?>>check again</button>
        </div>
        <fieldset>
          <legend>Tunnel server fingerprints</legend>
          <button
            id="viewfp"
            type="button"
            onclick="toggle();"
          <?php print($show_active ? '' : "  disabled\n          "); ?>></button>
<?php echo($fingerprints); ?>
        </fieldset>
      </fieldset>
    </form>
  </body>
</html>

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <title>[mn] medianet Web</title>
  </head>
  <body>
    <h1>[mn] medianet Web</h1>
    <ul>
<?php
  error_reporting(E_ALL);
  define('FEATURES_DIR', __DIR__ . '/medianet_features.d');
  define('HOSTNAME_TAG', '%HOSTNAME%');
  define('EOL_CHARS', "\r\n");
  if ($feature_files = scandir(FEATURES_DIR)) {;
    foreach($feature_files as $file) {
      if ($file == '.' or $file == '..') continue;
      if ($fp = fopen(FEATURES_DIR . "/$file", 'r')) {
        $link = rtrim(
          str_replace(
            HOSTNAME_TAG,
            $_SERVER['SERVER_NAME'],
            fgets($fp)
          ),
          EOL_CHARS
        );
        $text = rtrim(
          fgets($fp),
          EOL_CHARS
        );
        fclose($fp);
        print("<li><a href=\"$link\">$text</a></li>\n");
      } else {
        print("<li><strong>ERROR:</strong> could not open file " . $file . "</li>\n");
      }
    }
  } else {
    print("<li><strong>ERROR:</strong> could not read directory " . FEATURES_DIR . "</li>\n");
  }
?>
    </ul>
  </body>
</html>


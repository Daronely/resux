<?php
/* Router for PHP built-in server: emulates .htaccess rewrite rules so tests match production. */
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

if (preg_match('#^/u/([a-z0-9]{6})/?$#i', $uri)) {
    $_SERVER['REQUEST_URI'] = $uri;
    require __DIR__ . '/u/index.php';
    return true;
}
if (preg_match('#^/resume/([a-z]+)\.html$#i', $uri)) {
    $_SERVER['REQUEST_URI'] = $uri;
    require __DIR__ . '/resume/index.php';
    return true;
}
if ($uri === '/resume' || $uri === '/resume/') {
    $_SERVER['REQUEST_URI'] = '/resume/developer.html';
    require __DIR__ . '/resume/index.php';
    return true;
}
if ($uri !== '/' && file_exists(__DIR__ . $uri) && !is_dir(__DIR__ . $uri)) {
    return false; // serve static file
}
if ($uri === '/') {
    require __DIR__ . '/index.html';
    return true;
}
http_response_code(404);
echo "404";
return true;

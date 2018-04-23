<?php
header('Content-Type: application/json');
echo( '{"result": "ok", "data": '. rand(100,1000) . ',"message":""}' );
?>
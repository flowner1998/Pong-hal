<?php
//Set the headers to allow CORS and set content type.
header('Content-Type: application/json;charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, HEAD, GET, OPTIONS, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type, Content-Range, Content-Disposition, Content-Description, X-Requested-With');
header('Access-Control-Max-Age: 1728000');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Credentials: true');

//Creating the file
$highscores = ['countries'=>[]];
$countries = [['name'=>'the netherlands', 'code'=>'nl', 'score'=>12],['name'=>'germany', 'code'=>'de', 'score'=>8],['name'=>'france', 'code'=>'fr', 'score'=>5],['name'=>'belgium', 'code'=>'be', 'score'=>2],['name'=>'Malta', 'code'=>'mt', 'score'=>1]];
$highscores['countries'] = $countries;
header("Content-Type: application/json");
//Parse the JSON file
echo json_encode($highscores);
exit;
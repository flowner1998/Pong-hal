<?php
//Set the headers to allow CORS and set content type.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token, Access-Control-Allow-Origin, X-Requested-With');
header("Content-Type: application/json");

//Creating the file
$highscores = ['countries'=>[]];
$countries = [['name'=>'the netherlands', 'code'=>'nl', 'score'=>12],['name'=>'germany', 'code'=>'de', 'score'=>8],['name'=>'france', 'code'=>'fr', 'score'=>5],['name'=>'belgium', 'code'=>'be', 'score'=>2],['name'=>'Malta', 'code'=>'mt', 'score'=>1]];
$highscores['countries'] = $countries;
header("Content-Type: application/json");
//Parse the JSON file
echo json_encode($highscores);
exit;
<?php
$server = "localhost";
$user = "root";
$pass = "admin123.";
// create database first
$database = "adminerp"; 
$con = mysqli_connect($server, $user, $pass);
if(!$con){
    echo 'Server not connected';
}
$db = mysqli_select_db($con, $database);
if(!$db){
    echo 'Database not connected';
}
?>
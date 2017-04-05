//script for the highscores

//Execute when doc is loaded
window.addEventListener('load', init);

//Global vars
var url = "http://localhost/sites/Pong-hal/webservice" + "/highscores.php";
var socket = io.connect();

function init(){
    getHighscores();
}

function getHighscores(){
    reqwest({
        url: url,
        contentType: 'application/json',
        success: getHighscoresSuccessHandler,
        error: getHighscoresErrorHandler
    });

}

function getHighscoresSuccessHandler(data){
    //Set the data
    var countries = data.countries;

    //Get the Tbody element
    var tbody = document.getElementById("tbody-highscores");

    for(var i = 0; i < countries.length; i++){
        //Create a row
        var tr = document.createElement("tr");

        //create rank column
        var rank = document.createElement("td");
        rank.classList.add("highscores");
        rank.classList.add("rank");
        rank.innerHTML = i+1;

        //Create flag column
        var flag = document.createElement("td");
        flag.classList.add("highscores");
        flag.classList.add("flag");

        //Create flag image
        var flagImage = document.createElement("img");
        flagImage.src = "http://www.geonames.org/flags/l/" + countries[i].code +".gif";
        flag.appendChild(flagImage);

        //Create country column
        var name = document.createElement("td");
        name.classList.add("highscores");
        name.classList.add("country");
        name.innerHTML = countries[i].name;

        //Create score column
        var score = document.createElement("td");
        score.classList.add("highscores");
        score.classList.add("score");
        score.innerHTML = countries[i].score;

        //Add to the row
        tr.appendChild(rank);
        tr.appendChild(flag);
        tr.appendChild(name);
        tr.appendChild(score);

        //Add row to the table
        tbody.appendChild(tr);
    }
}
function getHighscoresErrorHandler(data){
    console.error(data);
}

socket.on('start game', function(){

    var protocol = location.protocol;
    var port = location.port ? location.port : "";
    var host = protocol + "//" +  window.location.hostname + ":" + port;
    var page = "game";
    window.location = host + "/" + page;

});
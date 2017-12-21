var xmlDoc = '';
var xmlhttp  = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {

        xmlDoc = xmlhttp.responseText;
        myFunction();
    }
};
xmlhttp.open("GET","../text/billboard-top100.html" , true);
xmlhttp.send();


function myFunction() {
    var regex = new RegExp('<div class="chart-row__container">([\\S\\s]*?)</div>','g');
    var regex2 = new RegExp('<h2 class="chart-row__song">([\\S\\s]*?)</h2>','g');
    var regex3 = new RegExp('<span class="chart-row__artist">([\\S\\s]*?)</span>','g');
    //var regex = new RegExp(/<!-- OPTIONAL -->([\S\s]*?)<>,'g');
    //console.log(xmlDoc);
    //var testString = xmlDoc.match(/<div class="chart-row__container">(.*?)<\/div class="chart-row__container">/g);
    //var testString = xmlDoc.match(new RegExp('<div class="chart-row__container">(.+)((\s)+(.+))+<\/div class="chart-row__container">'));
    //var testString = xmlDoc.match(/<div class="chart-row__container">(.+?)((\s)+(.+))+<\/div>/g);
    var ChartString = xmlDoc.match(regex);
    //var testString = xmlDoc.match(/Ed/g);
    //console.log(ChartString[2]);
    //0-99 places , we need index and <h2 class="chart-row__song"> and <span class="chart-row__artist">
    for(var i=0; i< ChartString.length; i++){
    var songName = ChartString[i].match(regex2)+'';
    var songArtist = ChartString[i].match(regex3)+'';
   // console.log(songName + ": "+ songArtist);
        var newSongName = songName.replace('<h2 class="chart-row__song">','');
        var newSongName2 = newSongName.replace('</h2>','');
        var newSongArtist= songArtist.replace('<span class="chart-row__artist">','');
        var newSongArtist2= newSongArtist.replace('</span>','');

    document.getElementById("chart_place").innerHTML+='<div class = "billboard_chart_position" >'+'<span id="songNameSpan">'
        +(i+1)+'| '+newSongName2+'</span> '+newSongArtist2+'<br></div>';
    }

};

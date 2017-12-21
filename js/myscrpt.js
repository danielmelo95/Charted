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
    var songName = ChartString[i].match(regex2);
    var songArtist = ChartString[i].match(regex3);
    console.log(songName + ": "+ songArtist);
    document.getElementById("chart_place").innerHTML+='<div class = "billboard_chart_position" ><h2>'+(i+1)+'</h2>'+songArtist +songName+'<br></div>';
    }

};

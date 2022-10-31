/**
 * This page will contain the code controlling the entire single page application
 * If it ends up becoming too long, I may split it up into seperate sections
 */
 import songs from "./songs.json" assert { type: "json" };

 alert(songs[0]['artist']['name']);
// ========================================================== SONG SEARCH PAGE ============================================================== 


function loadSelectOptions(fieldName){
    console.log(fieldName);
    const selectionId = fieldName += '-select';
    let selectElement = document.getElementById(selectionId);
    if (selectElement.options.length === 0){ // This should only be run once, when clicked. 
        for (let currentSong of songs){
            let text = currentSong[fieldName.trim("-select")]["name"];
            let value = currentSong[fieldName.trim("-select")]["id"];
            const songOption = document.createElement("option", text, {value: value});
            selectElement.appendChild(songOption);
        }
    }
}

function searchDatabase(){
    
}
document.getElementById("artist-select").addEventListener("click", loadSelectOptions("artist"));
document.getElementById("genre-select").addEventListener("click", loadSelectOptions("genre"));

// ======================================================== SONG INFORMATION PAGE =========================================================== 

let ctx = document.getElementById("song-chart").getContext('2d');
let chart = new Chart(ctx, {
    type: 'radar',
    data:{
        labels: ['Danceability', 'Energy', 'Speechiness', 'Acousticness', 'Liveness', 'Valence'],
        datasets: [{
            data: [80, 55, 20, 90, 12, 25]
        }]
    }, 
    options: options
});


// ======================================================== PLAYLIST INFO PAGE ============================================================== 

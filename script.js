/**
 * This page will contain the code controlling the entire single page application
 * If it ends up becoming too long, I may split it up into seperate sections
 */
songs =  JSON.parse(songData);

// const api_url = "http://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php"; // The URL containing the JSON data that will be fetched
// async function getSongs(){
//     const response = await fetch(api_url);
//     const data = await response.json();
//     console.log(getSongs());
// }
// ========================================================== SONG SEARCH PAGE ============================================================== 
/**
 * This function loads the select inputs in the song search page. 
 * @param {*} fieldName the name of the field that we are looking for in the json file
 */
const songTitles = getSongTitles(); // Loads all the song titles into an array
const titleInput = document.getElementById('title-input');
const resultsBox = document.getElementById('autocomplete-results');
titleInput.addEventListener('input', autocompleteTitles);

// This function fills an array with the titles of every song in the json file and returns it
function getSongTitles(){
    const songTitles = [];
    for (let song of songs){
        songTitles.push(song['title']);
    }
    return songTitles;
}

function autocompleteTitles(){
    if (this.value.length >= 2){ // Starts using autocomplete after 2 characters
        const titleMatch = findMatches(this.value, songTitles);
        resultsBox.replaceChildren();
        titleMatch.forEach(songMatch => {
                let option = document.createElement('option');
                option.textContent = songMatch;
                resultsBox.appendChild(option);
            }
        )
    }
}
/* Simple function that checks to see if th*/
function findMatches(word, titles){
    const currentMatches = [];
    for(let title of titles){
        if (String(title).includes(word)){
            currentMatches.push(title);
        }
    }
    return currentMatches;
}

/* Add a event listener to every radio button */
const radioButtons = document.querySelectorAll("input[type='radio']");
const inputs = document.querySelectorAll("input, select");
// Adding an event listener for the radio button 
for (let currentRadioBtn of radioButtons){
    currentRadioBtn.addEventListener('change', disableInputs);
}
/* Disables all of the inputs that aren't associated with the currently selected radio button*/
function disableInputs(){
    if (this.checked){
        let radioType = String(this.id.replace("-radio", ''));
        for (let input of inputs){
            if (!input.id.includes(radioType) && input.type != "radio"){
                input.disabled = true;
            }
            else if(input.id.includes(radioType)){
                input.disabled = false;
            }
        }
    }
}
// This function is responsible for populating the select elements with options in the song search.
function loadSelectOptions(fieldName){
    const field = fieldName;
    const selectionId = fieldName += '-select';
    let selectElement = document.getElementById(selectionId);
    let fieldContainer = [];
    if (selectElement.options.length === 0){ // This should only be run once, when clicked. 
        for (let currentSong of songs){
            let optionText = currentSong[field]["name"];
            if (!fieldContainer.includes(optionText)){ // Ensures that there are no duplicates 
                fieldContainer.push(optionText);
                let optionValue = currentSong[field]["name"];
                const songOption = document.createElement("option");
                songOption.text = fieldContainer[fieldContainer.length - 1]; // adds the element that we just pushed into the array
                songOption.value = optionValue;
                selectElement.appendChild(songOption);
            }
        }
    }
}
// Load the select elements with data upon clicking.
document.getElementById("genre-select").addEventListener('click', loadSelectOptions("genre"));
document.getElementById("artist-select").addEventListener('click', loadSelectOptions("artist"));

    function populateRow(parentElement, attribute, songObj){
        const cellElement = document.createElement("td");
        if (attribute == 'artist' || attribute == 'genre'){
            subattribute = 'name';
            cellElement.textContent = songObj[attribute][subattribute];
        }
        else if (attribute == 'details'){
            cellElement.textContent = songObj[attribute]['popularity'] + "%";
        }
        else{
            cellElement.textContent = songObj[attribute];
        }
        parentElement.appendChild(cellElement);
    }
    function populateSongs(results){ // Should run in O(nlog(n)) time since the inner loop has a fixed length. Not great, but could be worse
        const labels = ['title', 'artist', 'year', 'genre', 'details'];
        let songRow;
        for(let song of results){
            songRow = document.createElement("tr");
            for (let i = 0; i < labels.length; i++){
                populateRow(songRow, labels[i], song);
            }
            document.getElementById('results-body').appendChild(songRow); // Appends the current row to the table body
        }
    }
    populateSongs(songs);
    document.getElementById("clear-btn").addEventListener("click", (e) => {
        for (let input of inputs){
            input.textContent = "";
        }
    });
    document.getElementById("submit-btn").addEventListener("click", (e) => {
            // retrieving data from the button
            let id = e.target.getAttribute('data-id');
            // get song object from the button
        }
    );

    // Form data handling section
    document.addEventListener("DOMContentLoaded", ()=> { // Populates the results table with all songs
        const songForm = document.getElementById('song-form');
        songForm.addEventListener('submit', formProcessing);
    });
    function pushInputValue(inputName, arr){
        console.log(inputName);
        const value = document.getElementById(inputName).value;
        arr.push(value);
    }
    /**
     * Searches for and returns the id value of the radio button that is checked.
     * @returns the id of the form radio button that is currently selected
     */
    function getSelectedRadioButtonId(){
        let selectedRadioId;
        for (let currentRadioButton of radioButtons){
            if (currentRadioButton.checked == true){
                selectedRadioId = currentRadioButton.id;
            }
        }
        return selectedRadioId;
    }
    // This function is responsible for processing the data sent through the form
    function formProcessing(){
        const selectedRadioId = getSelectedRadioButtonId();
        const searchParam = []; // Array containing the search parameters 
        let searchAttribute = "";
        switch(selectedRadioId){
            case "title-radio":
                pushInputValue("title-input", searchParam);
                searchAttribute = "title";
                break;
            case "artist-radio":
                pushInputValue("artist-select", searchParam);
                searchAttribute = "artist";
                break;
            case "genre-radio":
                pushInputValue("genre-select", searchParam);
                searchAttribute = "genre";
                break;
            case "year-radio":
                pushInputValue("year-less-input", searchParam);
                pushInputValue("year-greater-input", searchParam);
                searchAttribute = "year"
                break;
            case "popularity-radio":
                pushInputValue("popularity-less-input", searchParam);
                pushInputValue("popularity-greater-input", searchParam);
                searchAttribute = "popularity";
                break;
            default:
        }
        const searchResults = findResults(searchParam, searchAttribute, songs); // Returns the results of the search query
        populateSongs(searchResults);
    }

    function findResults(valuesArr, searchAttribute, songObj){
        const results = [];
        if (valuesArr.length == 1){
            let userValue = valuesArr[0];
            let subSearchAttribute = "name"; // Remains the same for all attributes with 
            for (let song of songObj){
                if (song[searchAttribute][subSearchAttribute].includes(userValue)){
                    results.push(song);
                }
            }
        }
        else if (valuesArr.length == 2){
            const upperBound = Number(valuesArr[1]); // The upper boundary of the two given values
            const lowerBound = Number(valuesArr[0]); // The lower bound of the two given values
            for (let song of songs){
                if (searchAttribute == "popularity"){ 
                    const songPopularity = Number(song["details"][searchAttribute]); // The current song's popularity
                    if (songPopularity >= lowerBound && songPopularity <= upperBound){
                        results.push(song); // push the song if the given constrains are met
                    }
                }
                else{ // Search attribute is year
                    const songYear = Number(song[searchAttribute]); // The current song's popularity
                    if (songYear >= lowerBound && songYear <= upperBound){
                        results.push(song); // push the song if the given constrains are met
                    }
                }
            }
        }
        else{
            console.log("Oops, you have no search parameters! No songs will be found");
        }
        return results;
    }



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

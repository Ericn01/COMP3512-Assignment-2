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
// Set the default song view
switchView("SONG_SEARCH_VIEW");
// Define a few global variables (will be refactored later)
const songTitles = getSongAttributeArray("title"); // Loads all the song titles into an array
const titleInput = document.querySelector('#title-input');
const resultsBox = document.querySelector('#autocomplete-results');
titleInput.addEventListener('input', autocompleteTitles);

// This function fills an array with the given attribute of a song in the json file and returns it.
// For the moment the supported attributes are 
function getSongAttributeArray(attributeName){
    const songAttributeArray = [];
    for (let song of songs){
        switch(attributeName){
            case "title":
            case "year":
                songAttributeArray.push(song[attributeName]);
                break;
            case "energy":
            case "valence":
            case "acousticness":
            case "speechiness":
            case "liveness":
            case "danceability":
                songAttributeArray.push(song['analytics'][attributeName]);
                break;
            case "artist":
            case "genre":
                songAttributeArray.push(song[attributeName]['name']); // Returns the name of the genre or artist
                break;
            case "popularity":
            case "bpm":
                songAttributeArray.push(song['details'][attributeName]);
                break;
            default:
        }
    }
    return songAttributeArray;
}

function autocompleteTitles(){
    if (this.value.length >= 2){ // Starts using autocomplete after 2 character have been typed
        const titleMatches = findMatches(this.value, songTitles);
        resultsBox.replaceChildren();
        for (let match of titleMatches){
                let option = document.createElement('option');
                option.textContent = match;
                resultsBox.appendChild(option);
        }
    }
}

/* Simple function that checks to see if the current user input string matches any of the song titles in the JSON file */
function findMatches(word, titles){
    const currentMatches = [];
    for(let title of titles){
        let stringTitle = String(title).toLowerCase(); // Includes function is casensitive so the word and string must have the same casing when compared
        if (stringTitle.includes(word.toLowerCase())){
            currentMatches.push(title);
        }
    }
    return currentMatches.sort(); // returns a sorted array of song matches
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

const numberInputs = document.querySelectorAll('input[type="number"]');
for (let input of numberInputs){
    input.addEventListener('click', numberHandling);
}
function enableDisableNumberInputs(disableInputIndex){
    for (let i = 0; i < numberInputs.length; i++){
        if (i == disableInputIndex){
            numberInputs[i].disabled = true;
        }
    }
}
function numberHandling(){
    const selectedInputId = this.id;
    switch(selectedInputId){
        case "year-less-input":
            enableDisableNumberInputs(1); // Disables the 'greater than' year input
            break;
        case "year-greater-input":
            enableDisableNumberInputs(0); // Disables the 'less than' year input
            break;
        case "popularity-less-input":
            enableDisableNumberInputs(3); // Disables the 'greater than' popularity input
            break;
        case "popularity-greater-input":
            enableDisableNumberInputs(2); // Disables the 'less than' popularit input
            break;
        default:
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
            if (attribute == 'title'){
                cellElement.value = songObj["song_id"];
            }
            cellElement.textContent = songObj[attribute];
        }
        cellElement != 'details' ? cellElement.className = attribute : cellElement.className = 'popularity'; // setting the class name of the cell element
        parentElement.appendChild(cellElement);
    }
    function populateSongs(results){ // Should run in O(nlog(n)) time since the inner loop has a fixed length. Not great, but could be worse
        const resultsBody = document.querySelector("#results-body")
        // Clears the table if elements are already present
        if (resultsBody.hasChildNodes()){
            resultsBody.innerHTML = "";
        }
        const labels = ['title', 'artist', 'year', 'genre', 'details'];
        let songRow;
        for(let song of results){
            songRow = document.createElement("tr");
            for (let i = 0; i < labels.length; i++){
                populateRow(songRow, labels[i], song);
            }
        resultsBody.appendChild(songRow); // Appends the current row to the table body
        }
        trackResults(); // This function adds an event listener to all the title elements from our search results
    }
populateSongs(songs);
    document.querySelector("#clear-btn").addEventListener("click", (e) => {
        for (let input of inputs){
            input.textContent = "";
        }
    });
    document.querySelector("#submit-btn").addEventListener("click", (e) => {
            // retrieving data from the button
            let id = e.target.getAttribute('data-id');
            // get song object from the button
        }
    );

    // Form data handling section
    // Populates the results table with all songs
    const submitBtn = document.querySelector('#submit-btn');
    submitBtn.addEventListener('click', formProcessing);
    
    // appends the given input value to the given array 
    function pushInputValue(inputName, arr){
        const value = document.querySelector(`#${inputName}`).value;
        arr.push(value);
    }
    /**
     * Searches for and returns the id value of the * radio button that is checked.
     * @returns the id of the form radio button that is * currently selected
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
        // Prevents a page reload when we submit the form.
        document.querySelector("#song-form").addEventListener('submit', e => e.preventDefault());        
        const selectedRadioId = getSelectedRadioButtonId();
        const searchParameters = []; // Array containing the search parameters 
        let searchAttribute = ""; // The attribute that the search is going by
        // Different logic will be applied depending on the selected radio button 
        switch(selectedRadioId){
            case "title-radio":
                pushInputValue("title-input", searchParameters);
                searchAttribute = "title";
                break;
            case "artist-radio":
                pushInputValue("artist-select", searchParameters);
                searchAttribute = "artist";
                break;
            case "genre-radio":
                pushInputValue("genre-select", searchParameters);
                searchAttribute = "genre";
                break;
            case "year-radio":
                if (numberInputs[0].disabled == false){
                    pushInputValue("year-less-input", searchParameters);
                }
                else{
                    pushInputValue("year-greater-input", searchParameters);
                }
                searchAttribute = "year"
                break;
            case "popularity-radio":
                if (numberInputs[2].disabled == false){
                    pushInputValue("popularity-less-input", searchParameters);
                }
                else{
                    pushInputValue("popularity-greater-input", searchParameters);
                }
                searchAttribute = "popularity";
                break;
            default:
        }
        const searchResults = findResults(searchParameters, searchAttribute, songs); // Returns the results of the search query
        populateSongs(searchResults);
    }
    function findResults(valuesArr, searchAttribute, songObj){
        const results = [];
        const userValue = valuesArr[0];
        // Loop through the song objects array
        for (song of songObj){
            if (searchAttribute == 'title' && String(song['title']).toLowerCase().includes(userValue.toLowerCase())){ // Includes function is case sensitive!
                        results.push(song);
                }
            else if ((searchAttribute =='artist' || searchAttribute == 'genre') && (song[searchAttribute]['name'].includes)(userValue)){
                results.push(song);
                }
            else if (searchAttribute == 'popularity' || searchAttribute == 'year'){
                if (searchAttribute == "popularity"){ 
                    const songPopularity = Number(song["details"][searchAttribute]); // The current song's popularity
                    if (numberInputs[0].disabled == false){ // Search was based on the 'less' parameter -> very fragile, code: should probably be refactored. Also quite unclear
                        if (Number(userValue) > songPopularity){
                            results.push(song);
                        }
                    }
                    else{ // search is based on greater than parameter
                        if (Number(userValue) < songPopularity){
                            results.push(song);
                        }
                    }
                }
                else{ // Search attribute is year
                    const songYear = Number(song[searchAttribute]); // The current song's popularity
                    if (numberInputs[2].disabled == false){ // Search was based on the 'less' parameter for the year
                        if (Number(userValue) < songYear){
                            results.push(song);
                        }
                    }
                    else{ // search is based on greater than parameter
                        if (Number(userValue) > songYear){
                            results.push(song);
                        }
                    }
                }
            }
            else if (searchAttribute == ""){
                console.log("No search attribute has been chosen");
        }
        }
        return results;
    }
    function getSongAttributes(id){
        let songId = id; // the value of the link element (song id)
        const songAttributes = [];
        for (song of songs){
            if (songId === song['song_id']){ // Linear search through the songs object to see if the link id is equal to the current song id
                songAttributes.push(song['analytics']); // Retrieves the analytics of the given song. 
                songAttributes.push(song['details']); // Retrieves addional details of the song.
                songAttributes.push(song['title']);
                songAttributes.push(song['artist']);
                songAttributes.push(song['genre']);
                break;
            }
        }
        return songAttributes;
    }

// ======================================================== SONG INFORMATION PAGE =========================================================== 
/**
 * This function is responsible for filling the song information view with the given information.
 */
function displaySongInformation(){
    const id = this.value; // the ID of the song element that was clicked
    const songData = getSongAttributes(id);
    switchView("SONG_INFORMATION_VIEW"); // Switches the view 
    makeChart(songData);
    makeSongInformation(songData);
}
/**
 * This function draws a radar chart that displays the song's analytics data.
 * @param {*} songData the required data of the song that the user is searching for
 */
function makeChart(songData){
    const accessIndex = 0; // The analytics object is wrapped in an array of length 1, hence index 0 to access it
    const labels = ['Danceability', 'Energy', 'Speechiness', 'Acousticness', 'Liveness', 'Valence'];
    const parentNode = document.querySelector('.chart');
    // To redraw on the canvas we must first destroy the old one. If this isn't done, JS throws an error
    const canvas = document.querySelector("#song-chart")
    parentNode.removeChild(canvas);
    // Create a new canvas to draw the chart on 
    const newCanvas = document.createElement("canvas");
    newCanvas.id = "song-chart";
    // Append the new canvas onto the chart container (parent node)
    parentNode.appendChild(newCanvas);
    const ctx = newCanvas.getContext('2d');
    const data = {
        labels: labels,
        datasets: [ {
        label: "Value",
        data: [songData[accessIndex].danceability, songData[accessIndex].energy, songData[accessIndex].speechiness, 
                songData[accessIndex].acousticness, songData[accessIndex].liveness, songData[accessIndex].valence],
        fill: true,
        tension: 0.20,
        backgroundColor: "rgba(25, 25, 255, 0.15)",
        borderColor: "white",
        pointBackgroundColor: "hotpink",
        pointHoverBackgroundColor: "white",
        pointHoverBorderColor: "black",
        pointRadius: 4
        }
    ]
    };
    const songChart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: {
        scales: {
            r: {
                ticks: {
                    color: "white",
                    backdropColor: "transparent",
                    textStrokeWidth: 5,
                    font:{
                        family: 'serif',
                        size: 13
                    }
                },
                pointLabels: {
                    color: 'white',
                    font:{
                        family: 'serif',
                        size: 14,
                        weight: 'bold'
                    }
                },
                grid: {
                    circular: true,
                    color: "white"
                },
                suggestedMin: 0,
                suggestedMax: 100
            }
        },
        responsive: true,
        elements: {
            line: {
                borderWidth: 2
            }
        }
    }
    }); 
    console.log(songChart);
}
function makeSongInformation(songData){
    const title = songData[2];
    const bpm = songData[1].bpm; const bpmRanking = findRanking(bpm,"bpm");
    const duration = secondsToMin(songData[1].duration);
    const popularity = songData[1].popularity; const popularityRanking = findRanking(popularity, "popularity");
    const energy = songData[0].energy; const energyRanking = findRanking(energy, "energy");
    const valence = songData[0].valence; const valenceRanking = findRanking(valence, "valence");
    const acousticness = songData[0].acousticness; const acousticnessRanking = findRanking(acousticness, "acousticness");
    const speechiness = songData[0].speechiness; const speechinessRanking = findRanking(speechiness, "speechiness");
    const liveness = songData[0].liveness; livenessRanking = findRanking(liveness, "liveness");
    const danceability = songData[0].danceability; danceabilityRanking = findRanking(danceability, "danceability");
    
    const detailsBox = document.querySelector(".song-details");
    const artistName = songData[3]['name'];
    const genreName = songData[4]['name']; 
    detailsBox.innerHTML = `<h1> ${title} <h1> <h3> Produced by ${artistName} </h3> <h3> Duration: ${duration} | Genre: ${genreName} ${getGenreEmoticon(genreName)}</h3>`;
    const headings = ["BPM 🏃", "Popularity 📈", "Energy 🔋", "Valence 😃", "Acousticness 🎶", 
    "Speechiness 🦜", "Liveness ✨", "Danceability 🕺"]
    const analytics = [bpmRanking, popularityRanking, energyRanking, 
    valenceRanking, acousticnessRanking, speechinessRanking, livenessRanking, danceabilityRanking];
    const dataBoxes = document.querySelectorAll(".analysis");
    for (let i = 0; i < dataBoxes.length; i++){
        makeAnalyticsBoxMarkup(headings[i], analytics[i], dataBoxes[i]);
    }
}
/** Associates an emoticon with the specified genre name and returns it. Simple function added for fun. */
function getGenreEmoticon(genreName){
    // There could have been many ways to do this, but I feel as though this is the clearest syntatictally
    const emotes = {
        "dance pop": "💃",
        "pop": "🥂",
        "canadian hip hop": "🇨🇦",
        "atl hip hop": "🧨",
        "indie pop": "",
        "modern rock": "🎸",
        "hip hop": "🔥",
        "emo rap": "😢",
        "dfw rap": "🎤",
        "r&b": "🎷",
        "cali rap": "🏖️",
        "melodic rap": "🎵",
        "art pop": "🎨",
        "brostep": "🏍️",
        "boy band": "🎢", 
        "alt z": "🤳",
        "contemporary country": "🐎",
        "latin": "🇲🇽",
        "afroswing": "🎢",
    };
    const emote = emotes[genreName];
    return emote;
}
/**
 * Converts a number of seconds into a formatted M:SS date
 * @param {} seconds the number of seconds to convert
 * @returns the formatted duration string
 */
function secondsToMin(seconds){
    minutesNum = seconds / 60
    secondsNum = Number(String(minutesNum).substring(1)) * 60;
    minutesFormatted = String(minutesNum).substring(0, 1);
    secondsFormatted = String(secondsNum).substring(0, 2);

    secondsFormatted.length == 1 ? secondsFormatted += "0" : secondsFormatted; // if the length of seconds formatted is one, that means it's missing a 0
    secondsFormatted.includes(".") ? secondsFormatted.replace(".", "0"): secondsFormatted; // if seconds formatted contains a period, replace it with a 0
    return `${minutesFormatted}:${secondsFormatted} minutes`;
}
function rankFormat(rank){
    return `Rank: #${rank}`;
}
function makeAnalyticsBoxMarkup(heading, data, dataBox){
    if (dataBox.hasChildNodes()){
        dataBox.textContent = "";
    }
    const headingMarkup = document.createElement("h2");
    headingMarkup.textContent = heading;
    dataBox.title = getSongAttributeContext(heading);
    const progressBar = makeAnalyticsProgressBar(data);
    const dataMarkup = document.createElement("h1");
    dataMarkup.textContent = rankFormat(data);
    dataBox.appendChild(headingMarkup);
    dataBox.appendChild(progressBar);
    dataBox.appendChild(dataMarkup);
}
function getSongAttributeContext(attribute){
    let attributeContext = ''
    let cleanedAttribute = attribute.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').toLowerCase().trim(); // removes the emoji from the given attribute. Regex taken from StackOverflow
    switch(cleanedAttribute){
        case 'bpm':
            attributeContext = 'BPM (Beats per minute) refers to the tempo of the song.';
            break;
        case 'popularity':
            attributeContext = 'Popularity refers to how popular this song is relative to others. ';
            break;
        case 'energy':
            attributeContext = 'Energy represents the amount of energy and activity in the song.';
            break;
        case 'danceability':
            attributeContext = 'Danceability describes the suitability of a track for dancing';
            break;
        case 'liveness':
            attributeContext = 'Liveness is an estimate of how much audience noise is in the recording.'
            break;
        case 'acousticness':
            attributeContext = 'Acousticness is a confidence measure of whether or not a song is acoustic';
            break;
        case 'speechiness':
            attributeContext = 'Speechiness detects the presence of spoken words in song.';
            break;
        case 'valence':
            attributeContext = 'Valence describes the musical positiveness conveyed by the song.'
        default:
    }
    return attributeContext;
}
/**
 * Returns a certain color based on the given progress bar value
 * @param {*} value 
 * @returns 
 */
function progressBarColor(value){
    let color = "#ff0d0d";
    if (value >= 260){
        color = "#69b34c";
    }
    else if (value >= 210 && value < 260){
        color = '#abc334';
    }
    else if (value >= 150 && value < 210){
        color = '#fab733';
    }
    else if (value >= 100 && value < 150){
        color = "#ff8e15";
    }
    else if (value >= 50 && value < 100){
        color = '#ff4e11';
    }
    return color;
}
/**
 * Draws a custom progress bar based on the given ranking
 * @param {} value the ranking of the specified attributed of the given song
 * @returns the progress bar element
 */
function makeAnalyticsProgressBar(value){
    const numSongs = 317;
    const pixelWidth = 175;
    const absoluteValue = Math.abs(Number(value) - numSongs);
    const progress = document.createElement('div');
    progress.dataset.label = "";
    progress.className = "progress";
    progress.max = numSongs;
    progress.value = absoluteValue; // Lower rankings end up higher on the progress bar
    const width = (absoluteValue / numSongs) * pixelWidth;
    const color = progressBarColor(absoluteValue);
    progress.style = `--width:${width}px; --inputted-color:${color}`;
    return progress;
}

// Table "link" click 
function trackResults(){
    let tableLinks = document.querySelectorAll(".title"); // NodeList of all titles
    for (let link of tableLinks){
        link.addEventListener('click', displaySongInformation);
    }
}

// Adding an event listener to the table sort buttons

// SORTING SONGS TO FIND THEIR RANKING 
function sortAttribute(attribute){
    const generalAttributeArray = getSongAttributeArray(attribute);
    switch(attribute){
        // === ANALYTICS & DETAILS ATTRIBUTES (NUMBERS) === 
        case "energy":
        case "valence":
        case "acousticness":
        case "speechiness":
        case "liveness":
        case "danceability":
        case "bpm":
        case "popularity":
            generalAttributeArray.sort((a,b) => a-b); // Sorts by ascending order for number values
            break;
        // === ARTIST, GENRE, Title ===
        case "artist":
        case "genre":
        case "title":
            generalAttributeArray.sort(); // Sorts alphabetically -> numbers and symbols will come first
            break;
        default:
    }
    return generalAttributeArray;
}
function findRanking(attributeValue, attributeName){
    const sortedAttributeArray = sortAttribute(attributeName).reverse(); // The ranking is based on the index of the song, so we want numerical values in descending order
    let ranking = 0;
    for (let i = 1; i <= sortedAttributeArray.length; i++){
        if (attributeValue === sortedAttributeArray[i]){
            ranking = i;
        }
    }
    return ranking;
}

function sortTableByAttribute(attribute){
    const attributeCellElements = document.querySelectorAll(attribute);
    const textContentArr = [];
    for (let cellElement of attributeCellElements){
        textContentArr.push(cellElement.textContent);
    }
    if (attribute == 'year' || attribute == 'popularity'){

    }
    else{
        textContentArr.sort();
    }
    for (let i =0; i < attributeCellElements.length; i++){
        attributeCellElements[i].textContent = textContentArr[i];
    }
}

// Adds a random placholder title to the title input space when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.querySelector("#title-input");
    const NUM_SONGS = songs.length;
    titleInput.placeholder = `${songTitles[Math.floor(Math.random() * NUM_SONGS)]}`;
})

// const sortButtons = document.querySelectorAll(".sort");
// for (let button of sortButtons){
//     button.addEventListener('click', sortTableByAttribute(this.value))
// }

// ======================================================== PLAYLIST INFO PAGE ============================================================== 


// ======================================================== SWITCH VIEW =====================================================================

function switchView(newView){
    const songSearchBody = document.querySelector(".song-search");
    const songInformationBody = document.querySelector(".song-info");
    const songPlaylistBody = document.querySelector(".song-playlists");
    if (newView == "SONG_SEARCH_VIEW"){
        setDisplay(songSearchBody, songInformationBody, songPlaylistBody);
    }
    else if (newView == "SONG_INFORMATION_VIEW"){
        setDisplay(songInformationBody, songSearchBody, songPlaylistBody);
    }
    else if (newView == "SONG_PLAYLIST_VIEW"){
        setDisplay(songPlaylistBody, songSearchBody, songInformationBody);
    }
    else {
        console.log("The given view attribute is not currently supported");
    }
}

function setDisplay(flexBody, noBodyOne, noBodyTwo){
    flexBody.style.display = 'flex';
    noBodyOne.style.display = 'none';
    noBodyTwo.style.display = 'none';
}
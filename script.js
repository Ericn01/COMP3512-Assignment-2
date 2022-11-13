/**
 * This page will contain the code controlling the entire single page application
 * If it ends up becoming too long, I may split it up into seperate sections
 */
songs = JSON.parse(songData);

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
const playlists = [] // empty array for now
titleInput.addEventListener('input', autocompleteTitles);

// Adding a way to switch to song search view from anywhere 
document.querySelector("#search-view-btn").addEventListener('click', songInfoToSearchPageViewSwitch);

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
                disableEnableInputBehavior(input, 'disabled');
            }
            else if(input.id.includes(radioType)){
                disableEnableInputBehavior(input, 'enabled');
            }
        }
    }
}

// Defines the behavior of the given input depending on the state that is passed (enabled or disabled)
function disableEnableInputBehavior(input, state){
    if (state == 'disabled'){
        input.style.color = 'gray';
        input.style.backgroundColor = 'rgba(0,0,0,0.025)';
        input.disabled = true;
    }
    else if (state == 'enabled'){
        input.style.color = 'white';
        input.style.backgroundColor = 'transparent';
        input.disabled = false;
    }
    else{
        console.log("Invalid state parameter passed");
    }
}
const numberInputs = document.querySelectorAll('input[type="number"]');
for (let input of numberInputs){
    input.addEventListener('click', numberHandling);
}
function numberHandling(){
    const yearLessInput = numberInputs[0];
    const yearGreaterInput = numberInputs[1];
    const popularityLessInput = numberInputs[2];
    const popularityGreaterInput = numberInputs[3];
    const selectedInputId = this.id;
    switch(selectedInputId){
        case "year-less-input":
            disableEnableInputBehavior(yearLessInput, 'enabled');
            disableEnableInputBehavior(yearGreaterInput, 'disabled'); // Disables the 'greater than' year input
            break;
        case "year-greater-input":
            disableEnableInputBehavior(yearLessInput, 'disabled');
            disableEnableInputBehavior(yearGreaterInput, 'enabled'); // Disables the 'less than' year input
            break;
        case "popularity-less-input":
            disableEnableInputBehavior(popularityLessInput, 'enabled');
            disableEnableInputBehavior(popularityGreaterInput, 'disabled'); // Disables the 'greater than' popularity input
            break;
        case "popularity-greater-input":
            disableEnableInputBehavior(popularityLessInput, 'disabled');
            disableEnableInputBehavior(popularityGreaterInput, 'enabled')  // Disables the 'less than' popularit input
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
            let optionText = upperCaseFirstChar(currentSong[field]["name"]);
            if (!fieldContainer.includes(optionText)){ // Ensures that there are no duplicates 
                fieldContainer.push(optionText);
                let optionValue = currentSong[field]["name"];
                const songOption = document.createElement("option");
                songOption.style.color = 'black'; // Able to see the select options
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
            cellElement.textContent = upperCaseFirstChar(songObj[attribute][subattribute]);
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
            if (input.id != 'genre-select' || input.id != 'artist-select'){
                input.textContent = "";
            }
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
    submitBtn.addEventListener('click', displayResults);
    
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
    function getSearchResults(){
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
                if (!numberInputs[0].disabled){
                    pushInputValue("year-less-input", searchParameters);
                }
                else{
                    pushInputValue("year-greater-input", searchParameters);
                }
                searchAttribute = "year"
                break;
            case "popularity-radio":
                if (!numberInputs[2].disabled){
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
        return searchResults;
    }
    function displayResults(){
        const searchResults = getSearchResults();
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
                if (searchAttribute == "year"){ 
                    const songYear = Number(song[searchAttribute]); // The current song's popularity
                    if (numberInputs[0].disabled){ // Search was based on the 'less' parameter for the year
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
                else{ // Search attribute is year
                    const songPopularity = Number(song["details"][searchAttribute]); // The current song's popularity
                    if (numberInputs[2].disabled){// Search is based on the 'less parameter' for for year attribute
                        if (Number(userValue) < songPopularity){
                            results.push(song);
                        }
                    }
                    else{ // search is based on greater than parameter
                        if (Number(userValue) > songPopularity){
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
    makeSongInformation(songData);
    makeChart(songData);   
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
        tension: 0.15,
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
        plugins: {
            title: {
                display: true,
                text: `'${songData[2]}'` + " Radar View",
                align: 'center',
                color: 'white',
                font:{
                    family: 'serif',
                    color: 'snow',
                    size: 18,
                    weight: 'bold'
                }
            }
        },
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
}
function makeSongInformation(songData){
    const bpm = songData[1].bpm; const bpmRanking = findRanking(bpm,"bpm");
    const popularity = songData[1].popularity; const popularityRanking = findRanking(popularity, "popularity");
    const energy = songData[0].energy; const energyRanking = findRanking(energy, "energy");
    const valence = songData[0].valence; const valenceRanking = findRanking(valence, "valence");
    const acousticness = songData[0].acousticness; const acousticnessRanking = findRanking(acousticness, "acousticness");
    const speechiness = songData[0].speechiness; const speechinessRanking = findRanking(speechiness, "speechiness");
    const liveness = songData[0].liveness; const livenessRanking = findRanking(liveness, "liveness");
    const danceability = songData[0].danceability; const danceabilityRanking = findRanking(danceability, "danceability");
    makeDetailsBox(songData)    
    const headings = ["BPM 🏃", "Popularity 📈", "Energy 🔋", "Valence 😃", "Acousticness 🎶", 
    "Speechiness 👄", "Liveness ✨", "Danceability 🕺"]
    const analytics = [bpm, popularity, energy, valence, acousticness, speechiness, liveness, danceability];
    const analyticsRanking = [bpmRanking, popularityRanking, energyRanking, valenceRanking, acousticnessRanking, speechinessRanking, livenessRanking, danceabilityRanking];
    const dataBoxes = document.querySelectorAll(".analysis");
    for (let i = 0; i < dataBoxes.length; i++){
        makeAnalyticsBoxMarkup(headings[i], analyticsRanking[i], analytics, dataBoxes[i]);
    }
}
function makeDetailsBox(songData){
    const detailsBox = document.querySelector(".song-details");
    detailsBox.id = 'details-box'
    if (detailsBox.hasChildNodes()){
        detailsBox.textContent = "";
    }
    // Song title heading setup
    const title = songData[2];
    const songTitleHeading = document.createElement("h1");
    songTitleHeading.className = 'song-title';
    songTitleHeading.textContent = title;
    // Artist name setup
    const artist = songData[3]['name'];
    const artistNameBox = document.createElement("h3");
    artistNameBox.textContent = `Produced by ${artist}`;
    // Genre name & duration setup
    const genre = songData[4]['name'];
    const duration = secondsToMin(songData[1].duration);
    // Creating the 'add to playlist button'
    const songPlaylistButton = document.createElement("button");
    songPlaylistButton.textContent = 'Add to Playlist';
    songPlaylistButton.id = 'playlist-add';
    songPlaylistButton.addEventListener('click', addSongToPlaylist);
    // Setting up the duration and genre data 
    const durationGenreBox = document.createElement("h3")
    durationGenreBox.textContent = `${duration} | ${upperCaseFirstChar(genre)} ${getGenreEmoticon(genre)}`
    // Appending all the child elements
    detailsBox.appendChild(songTitleHeading);
    detailsBox.appendChild(artistNameBox);
    detailsBox.appendChild(durationGenreBox);
    detailsBox.appendChild(songPlaylistButton);
}
/* Modifies the first character of every word in a string such that it is in uppercase form
*  Essentially has the same functionality as python's title() function.
*/
function upperCaseFirstChar(str){
    const stringArray = str.split(" ");
    let upperCaseFirstCharString = "";
    for (elem of stringArray){
        upperCaseFirstCharString += (elem[0].toUpperCase() + elem.substring(1)) + " ";
    }
    return upperCaseFirstCharString;
}
/** Associates an emoticon with the specified genre name and returns it. Simple function added for fun. */
function getGenreEmoticon(genreName){
    // There could have been many ways to do this, but I feel as though this is the clearest syntatictally
    const emotes = {
        "dance pop": "💃",
        "pop": "🥂",
        "canadian hip hop": "🇨🇦",
        "atl hip hop": "🧨",
        "indie pop": "🧑",
        "modern rock": "🎸",
        "hip hop": "🔥",
        "emo rap": "😢",
        "folk-pop": "🌿",
        "chicago rap": "💥",
        "grime": "🎹",
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
        "afroswing": "🦱",
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
    let secondsDecimalVal = String(secondsNum).substring(1)
    Number(secondsDecimalVal) > .5 ? Math.ceil(Number(secondsDecimalVal)) : Math.floor(Number(secondsDecimalVal));
    minutesFormatted = String(minutesNum).substring(0, 1);
    secondsFormatted = String(secondsNum).substring(0, 2);
    secondsFormatted.length == 1 ? secondsFormatted += "0" : secondsFormatted; // if the length of seconds formatted is one, that means it's missing a 0
    return `${minutesFormatted}:${secondsFormatted} minutes`;
}
function rankFormat(rank){
    return `Rank: #${rank + 1}`;
}
function makeAnalyticsBoxMarkup(heading, dataRankings, data, dataBox){
    if (dataBox.hasChildNodes()){
        dataBox.textContent = "";
    }
    // Create the header for the specified analytic
    const headingMarkup = document.createElement("h2");
    headingMarkup.textContent = heading;
    // Create the progress bar 
    const progressBar = makeAnalyticsProgressBar(dataRankings);
    // Create and display the ranking of the specified attribute 
    const dataMarkup = document.createElement("h1");
    dataMarkup.textContent = rankFormat(dataRankings);
    // Song attribute value and context 
    const context = document.createElement('p');
    context.textContent = getSongAttributeContext(heading, data)['attribute_context'];
    // Append children elements
    dataBox.appendChild(headingMarkup);
    dataBox.appendChild(context);
    dataBox.appendChild(progressBar);
    dataBox.appendChild(dataMarkup);
    dataBox.title = getSongAttributeContext(heading, data)['attribute_title']; // The first element that this function returns is 
}

function getSongAttributeContext(attribute, data){
    let attributeTitle = ''
    let attributeContext = ''
    let cleanedAttribute = attribute.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '').toLowerCase().trim(); // removes the emoji from the given attribute. Regex taken from StackOverflow
    switch(cleanedAttribute){
        case 'bpm':
            attributeTitle = 'BPM (Beats per minute) refers to the tempo of the song.';
            attributeContext = `Runs at ${data[0]} beats per minute.`;
            break;
        case 'popularity':
            attributeTitle = 'Popularity refers to how popular this song is relative to others. ';
            attributeContext = getAttributeContext(cleanedAttribute, data, 1);
            break;
        case 'energy':
            attributeTitle = 'Energy represents the amount of energy and activity in the song.';
            attributeContext = getAttributeContext(cleanedAttribute, data, 2);
            break;
        case 'valence':
            attributeTitle = 'Valence describes the musical positiveness conveyed by the song.'
            attributeContext =  getAttributeContext(cleanedAttribute, data, 3);
            break;
        case 'acousticness':
            attributeTitle = 'Acousticness is a confidence measure of whether or not a song is acoustic';
            attributeContext = getAttributeContext(cleanedAttribute, data, 4);
            break;
        case 'speechiness':
            attributeTitle = 'Speechiness detects the presence of spoken words in song.';
            attributeContext = getAttributeContext(cleanedAttribute, data, 5);
            break;
        case 'liveness':
            attributeTitle = 'Liveness is an estimate of how much audience noise is in the recording.'
            attributeContext = getAttributeContext(cleanedAttribute, data, 6);
            break;
        case 'danceability':
            attributeTitle = 'Danceability describes the suitability of a track for dancing';
            attributeContext = getAttributeContext(cleanedAttribute, data, 7);
            break;
        default:
    }
    return {"attribute_title": attributeTitle, "attribute_context": attributeContext};
}
function getAttributeContext(attribute, data, index){
    attributeValue = data[index];
    return `Has a ${attribute} value of ${attributeValue}%.`;
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
    const numSongs = songs.length;
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
// Receive all of the sort buttons, and add an event listener to sort them.
const sortButtons = document.querySelectorAll(".sort");
for (let i =0; i < sortButtons.length; i++){
    sortButtons[i].addEventListener('click', sortTableByAttribute);
}
// Sorts the table by the given attribute 
function sortTableByAttribute(){
    // The attribute that we are sorting by
    const attribute = this.id;
    // First and foremost we need to receive the search results.
    const results = getSearchResults();
    if (attribute != 'year-sort' || attribute != 'popularity-sort'){
        results.sort();
        console.log(results);
    }
    else {
        results.sort((a,b) => a-b);
        console.log(results);
    }
    populateSongs(results);
}

// Adds a random placholder title to the title input space when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const titleInput = document.querySelector("#title-input");
    const NUM_SONGS = songs.length;
    titleInput.placeholder = `${songTitles[Math.floor(Math.random() * NUM_SONGS)]}`; // Math random -> (0-1) * NUM_SONGS = [0-317] (decimals included) -> math.floor to make value an integer
})
// ======================================================== PLAYLIST INFO PAGE ============================================================== 

// TEMPORARY: ADD SWITCH TO PLAYLIST VIEW BUTTON
document.querySelector("#playlist-view-btn").addEventListener('click', displayPlaylists);
// Creating some template playlist objects for testing
makePlaylist("Default playlist", [songs[0], songs[1], songs[3], songs[100], songs[20], songs[15]]);
makePlaylist("Country Playlist", [songs[5], songs[100]]);
makePlaylist("EDM Playlist", [songs[150], songs[4], songs[180]]);
makePlaylist("Wow", [songs[115], songs[116], songs[150], songs[101], songs[6], songs[200]]);
// creates a playlist
function makePlaylist(name, songs){
    const playlist = {
        "name" : name,
        "songs": songs,
    };
    playlists.push(playlist);
}
// adds a song to the passed playlist
function addSongToPlaylist(playlist, song){
    playlist["songs"].push(song);
}
/* Returns an object that contains a collection of data about the given playlist */
function getPlaylistData(playlist){
    const averageDuration = getPlaylistAverageDuration(playlist)
    const mostPopularSong = getPlaylistMostPopularSong(playlist);
    const songList = getPlaylistSongNames(playlist);
    const numSongs = playlist['songs'].length;
    const mostCommonGenre = getMostCommonGenreInPlaylist(playlist);
    const playlistData = {
        "average_duration": averageDuration,
        "most_popular_song": mostPopularSong,
        "number_of_songs": numSongs,
        "song_list": songList,
        "most_common_genre": mostCommonGenre,
    };
    return playlistData;
}
/* Returns an unordered list that contains the markup for the song names in the given playlist. */
function getPlaylistSongNames(playlist){
    const songNames = document.createElement("div");
    songNames.className = 'playlist-songs-container';
    for (song of playlist['songs']){
        const listItem = document.createElement("p");
        listItem.value = song['song_id'];
        listItem.className = 'title'; // Same as those used in the search results table 
        listItem.addEventListener("click", displaySongInformation)
        listItem.textContent = song['title'];
        songNames.appendChild(listItem);
    }
    return songNames;
}
// calculates and returns the average song duration of a given playlist
function getPlaylistAverageDuration(playlist){
    const playlistSongs = playlist['songs'];
    let totalDuration = 0;
    for (let song of playlistSongs){
        totalDuration += song['details']['duration'];
        }
    const avgDuration = totalDuration / playlistSongs.length;
    return secondsToMin(avgDuration);
}
// finds and returns the most popular song in the given playlist
function getPlaylistMostPopularSong(playlist){
    const songs = playlist['songs'];
    let mostPopular = songs[0]; // to create a playlist you need at least one song so this won't raise an error
    for (let song of songs){
        if (song['details']['popularity'] > mostPopular['details']['popularity']){
            mostPopular = song;
        }
    }
    return mostPopular;
}
function getPlaylistAverages(playlist){
    const avgArray = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
    for (song of playlist){
        const analytics = song['analytics'];
        avgArray[0] += analytics['danceability'];
        avgArray[1] += analytics['energy'];
        avgArray[2] += analytics['speechiness'];
        avgArray[3] += analytics['acousticness'];
        avgArray[4] += analytics['liveness'];
        avgArray[5] += analytics['valence'];
        avgArray[6] += song['details']['popularity'];
    }
    for (let i = 0; i < avgArray.length;  i++){
        attributeAvgValue = avgArray[i] / playlist.length
        avgArray[i] = Math.ceil(attributeAvgValue);
    }
    return avgArray;
}
function setPlaylistListItems(){
    const listItems = document.querySelectorAll(".playlist-list li");
    for (let li of listItems){
        li.addEventListener("click", makePlaylistDetails)
    }
}
// Creates the playlist view markup -> Playlist list
function displayPlaylists(){
    switchView("SONG_PLAYLIST_VIEW");
    makePlaylistList(playlists);
    setPlaylistListItems();
}
// [playlist1, playlist2] => each playlist is an array of songs [[{Playlist 1: Song 1}, {Playlist 1: Song 2}], []]
/* Displays the list of playlists, along with their names, and the number of songs in the given playlist */
function makePlaylistList(){
    if (playlists.length == 0){return;} // exits the function if no playlists are present
    const listDiv = document.querySelector(".playlist-list");
    listDiv.innerHTML = ""; // clears whatever html was previously present 
    const outerList = document.createElement("ul");
    for (playlist of playlists){
        const numSongs = getPlaylistData(playlist)['number_of_songs'];
        const playlistName = playlist['name'];
        const playlistDataElement = document.createElement("li");
        playlistDataElement.id = playlistName;
        // Creating the header for the list item
        const header = document.createElement("h4");
        header.textContent = `${upperCaseFirstChar(playlistName)}`;
        // Creating a div for the number of songs
        const numSongsBox = document.createElement("p");
        numSongsBox.textContent = `Number of songs: ${numSongs}`;
        playlistDataElement.appendChild(header);
        playlistDataElement.appendChild(numSongsBox);
                outerList.appendChild(playlistDataElement);
    }
    listDiv.appendChild(makeHeading("Playlists"));
    listDiv.appendChild(outerList);
}
/* This function is responsible for filling the playlist details container with relevant data. 
* This also includes a polar area chart that contains information about the averages of each attribute of the given playlist 
*/
function makePlaylistDetails(){
    const playlist = findPlaylist(this.id); // find the playlist that the list element relates to based on the given id
    const playlistName = playlist['name'];
    const detailsContainer = document.querySelector(".details-container");
    if (detailsContainer.hasChildNodes()){
        detailsContainer.textContent = "";
    }
    detailsContainer.appendChild(makeHeading(`${playlistName} Details`));
    // Data that will be displayed in the details view
    const playlistData = getPlaylistData(playlist);
    // Creates and appends the most popular song div to the details container
    const mostPopularSongBox = getPlaylistDetailsDiv('Most Popular Song',  `'${playlistData['most_popular_song']['title']}' by ${playlistData['most_popular_song']['artist']['name']}, with a popularity score of ${playlistData['most_popular_song']['details']['popularity']}%`)
    detailsContainer.appendChild(mostPopularSongBox);
    // Same is done with the songs names list
    const songsList = getPlaylistDetailsDiv("Playlist Songs", "");
    songsList.appendChild(playlistData['song_list']);
    detailsContainer.appendChild(songsList);
    // Andddd with the average song duration
    const averageSongDuration = getPlaylistDetailsDiv('Average Song Duration', `The average song duration in this playlist is ${playlistData['average_duration']}`)
    detailsContainer.appendChild(averageSongDuration);
    // Finds the most common genre in the playlist, along with the number of occurences
    const mostCommonGenre = getPlaylistDetailsDiv('Most Common Genre', `${playlistData['most_common_genre']}`);
    detailsContainer.appendChild(mostCommonGenre);
    // Creates the playlist average chart
    const averagesData = getPlaylistAverages(playlist['songs']);
    makePlaylistAveragesChart(averagesData, playlistName);
    // The same is done with the most pronounced (max valued) average of a song analytic within the playlist.
    const attributeData = getPlaylistMostPronoucedAttribute(averagesData);
    const mostPronoucedAttribute = getPlaylistDetailsDiv('Most Pronouced Attribute', `${attributeData['max_attribute_name']}, with an average value of ${attributeData['max_val']}%`);
    detailsContainer.appendChild(mostPronoucedAttribute);
}

function getPlaylistMostPronoucedAttribute(averages){
    let maxValue = 0;
    let maxIndex = 0;
    let maxAttributeName = "";
    for (let i = 0; i < averages.length - 1; i++){ // The -1 is included so that we do not included popularity as an attribute (not an analytics attribute)
        if (averages[i] > maxValue){
            maxValue = averages[i];
            maxIndex = i;
        }
    }
    switch(maxIndex){
        case 0: 
            maxAttributeName = 'Danceability';
            break;
        case 1: 
            maxAttributeName = 'Energy';
            break;
        case 2:
            maxAttributeName = 'Speechiness';
            break;
        case 3:
            maxAttributeName = 'Acousticness';
            break;
        case 4:
            maxAttributeName = 'Liveness';
            break;
        case 5:
            maxAttributeName = 'Valence';
            break;

    }
    return {"max_val": maxValue, "max_attribute_name": maxAttributeName};
}

function getPlaylistDetailsDiv(boxHeading, text){
    const detailsDiv = document.createElement("div");
    detailsDiv.className = 'details-element';
    const boxHeadingDiv = document.createElement("h3");
    boxHeadingDiv.textContent = boxHeading;
    boxHeadingDiv.className = 'box-heading-div';
    detailsDiv.appendChild(boxHeadingDiv);
    if (!text == ""){
        const textBox = document.createElement("p")
        textBox.textContent = text;
        detailsDiv.appendChild(textBox);
    }
    return detailsDiv;
}

/* Find and return the given playlist based on the passed name parameter */
function findPlaylist(playlistName){
    for (playlist of playlists){
        if (playlist['name'] === playlistName){
            return playlist;
        }
    }
    return;
}
function makeHeading(text){
    const heading = document.createElement("h1");
    heading.textContent = upperCaseFirstChar(text);
    return heading;
}
function getMostCommonGenreInPlaylist(playlist){
    if (playlist.length == 1){return playlist["songs"][0]['genre']['name']};
    const genresList = [];
    const genresCount = [];
    for (song of playlist["songs"]){
        const currentSongGenre = song['genre']['name'];
        genresList.push(currentSongGenre);
    }
    // Counts the amount of duplicates and creates a key value pair for it (genreName: numOccurences)
    genresList.forEach(genre => {
        genresCount[genre] = (genresCount[genre] || 0) + 1;
    });
    const indexOfMostCommonGenre = 0;
    for (genreNum of genresCount){

    }
    console.log(genresCount[indexOfMostCommonGenre]);
    return genresCount;
}

function makePlaylistAveragesChart(averagesData, playlistName){
    // Draws, destroys, and redraws the canvas on which the chart is displated
    const parentNode = document.querySelector(".averages-container");
    const averagesCanvas = document.querySelector("#averages-chart");
    parentNode.removeChild(averagesCanvas);
    const newCanvas = document.createElement("canvas");
    parentNode.appendChild(newCanvas);
    newCanvas.id = "averages-chart";
    const ctx = newCanvas.getContext('2d');
    const data = {
        labels: ['Danceability','Energy','Speechiness','Acousticness','Liveness','Valence', 'Popularity'],
        datasets: [{
        label: 'Playlist Averages',
        data: averagesData,
        backgroundColor: [
            'rgba(255, 99, 132, 0.65)',
            'rgba(75, 192, 192, 0.65)',
            'rgba(255, 205, 86, 0.65)',
            'rgba(201, 203, 207, 0.65)',
            'rgba(54, 162, 235, 0.65)', 
            'rgba(128, 0, 128, 0.65)',
            'rgba(50, 205, 50, 0.65)'
            ]
        }]
    };
    const chart = new Chart(ctx, {
        type: 'polarArea',
        data: data,
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    color: "white",
                    text: `Average Values of ${playlistName}`,
                    align: "center",
                    position: "top",
                    font:{
                        size: 20,
                        family: "serif",
                        weight: "bold"
                    }
                },
                legend: {
                    align: "center",
                    position: "top",
                    labels: {
                            display: true,
                            color: "white",
                            font: {
                                family: "serif",
                                size: 14
                            }
                        }
                    },
                },
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
                    color: "white"
                },
                suggestedMin: 0,
                suggestedMax: 90
            }
        }
    });
}

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
/* Sets the display of different views as you're switching from one view to another */
function setDisplay(flexBody, noBodyOne, noBodyTwo){
    flexBody.style.display = ''; // Flex display is already set in css properties so nothing needs to be overriden here
    noBodyOne.style.display = 'none';
    noBodyTwo.style.display = 'none';
}
function songInfoToSearchPageViewSwitch(){
    switchView("SONG_SEARCH_VIEW");
}

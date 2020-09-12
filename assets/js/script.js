/****************** Global Variables *******************************/
// Get references to the #btn and input element
var btn = document.querySelector("#btn-search");
// get the reference to the div for the historic cities
var containerHistoricCities = document.querySelector("#historic-Cities");

//Array of Objects for localStores data
var dataStore = JSON.parse(localStorage.getItem('cities')) || [];

var apiFetch = "http://api.openweathermap.org/data/2.5/forecast?appid=942eb6d2b73870a577e74b590648d1f0&units=imperial&q="
var urlIcon = "http://openweathermap.org/img/wn/"
// look for UV index by latitude and longitude coordinates
var apiFetchUV = "http://api.openweathermap.org/data/2.5/uvi?appid=942eb6d2b73870a577e74b590648d1f0";     
var convertDeg  = 0; //(88°F − 32) × 5/9
var convertSpeed = 0; // speed * 1.609
// Objetc for Weather conditions for a city
var weatherCondition = [];


 //according to https://www.epa.gov/sites/production/files/documents/uviguide.pdf 
 // there is a clasification about UV index in the world, for the porpuse of the challenge it will be this values

 /* values
    
    1-2 Low         (1 - 2.99999)   Green
    3-5 Moderate    (3 - 5.99999)   Orange 
    6-7 High        (6 - 7.99999)   Red
    8-10 Very High  (8 - 10.9999)   Brown
    11+ Extreme     (11+ )          Black
 */
/*******************************************************************/

/************************* Functions *******************************/

/* Load the fisrt time when the page load  */
function start() {

    // load the localStore
    loadCity();

}

// function to retreive the information from localStore
var loadCity = function(){

    /*******************************************************************/
    /*  Acceptance Criteria #2.2                                       */
    /*  WHEN I search for a city                                       */
    /*  THEN that city is added to the search history                  */
    /*******************************************************************/
    containerHistoricCities.innerHTML = "";

        if(dataStore){
            // creating a unordered list to store the info
            var ulElement = document.createElement("ul");
            ulElement.classList.add("list-unstyled");
            ulElement.classList.add("w-100");
            
            //for loop to iterate through out the localStore
            for(var i = 0; i < dataStore.length; i++){
                
                var liElement = document.createElement("li");
                // append a button with bootstraps classes inside each item
                liElement.innerHTML = "<button type='button' class='list-group-item list-group-item-action' attr='"+dataStore[i]+"'>" + dataStore[i] + "</button>";
                // append the item into its container
                ulElement.appendChild(liElement);
                }
                
                containerHistoricCities.appendChild(ulElement); 
            }
};

// Store the city in localStore
var saveCity = function(city){

    var flag = false
    if(dataStore){
        for(var i = 0; i < dataStore.length; i++){
            if(dataStore[i] === city){
                flag = true;
            }
        }
        if(flag){
            displayAlertMessage("The City: "+city+" already exists")
            //return
        }
    }
    if(!flag){
        dataStore.push(city);
        localStorage.setItem("cities",JSON.stringify(dataStore));
    }
    
    loadCity();
}
var searchForDate9AM = function (str) {
    var hour = str.split(" ")[1].split(":")[0];
    var flag = false
   // alert(hour);
    console.log(hour);
    
    if(hour === "09"){
        flag = true
        //alert(flag);
    }        
    
    return flag;
        
};

// formating the date that object response provide from the format "YYYY-MM-DD HH:MM:SS" to "MM/DD/YYYY"
var formatDate = function(strDate){

    var newDate = strDate.split(" ")[0].split("-");

    return (newDate[1]+"/"+newDate[2]+"/"+newDate[0]);
};

var createDataObject = function(list, position){

    // the first data from the object is the current Weather information 
    var obj = {
        dateT : formatDate(list[0].dt_txt),
        humidity : list[0].main.humidity,
        speed: list[0].wind.speed,
        temp: list[0].main.temp,
        icon : urlIcon + list[0].weather[0].icon + "@2x.png",
        lat : position.lat,
        lon: position.lon
    };

    weatherCondition.push(obj);
    //console.log(weatherCondition);
    
    //alert(obj.dateT);
    //alert(list.length);
    //alert(list[1].dt_txt);

    for(var i=1; i<list.length; i++){
        // I decided to select the information of the following days when the time it would be 9 am
        // getting the index when the time will be 9 am
        
        //alert("i= "+i);
        if(searchForDate9AM(list[i].dt_txt)){
            obj.dateT = formatDate(list[i].dt_txt);
            obj.humidity = list[i].main.humidity;
            obj.speed = list[i].wind.speed;
            obj.temp = list[i].main.temp;
            obj.icon = urlIcon + list[i].weather[0].icon + ".png";
            obj.lat = position.lat;
            obj.lon = position.lon;
            weatherCondition.push(obj);
        }
    }
    console.log(weatherCondition);

};

var displayAlertMessage = function(msg) {
    alert(msg);
};

var callApiFetch = function(city){

    //var urlFetch = apiFetch+city;
    //console.log(urlFetch);
    fetch("http://api.openweathermap.org/data/2.5/forecast?appid=b262298fbe39ad30d243f31f6e1297bc&units=imperial&q="+city)
    .then(function(weatherResponse) {
        return weatherResponse.json();
     })
    .then(function(weatherResponse) {


        console.log(weatherResponse);
        if (weatherResponse.cod != "200") {
            displayAlertMessage("Unable to find "+ city +" in OpenWeathermap.org");
            //console.log("Unable to find "+ city +" in OpenWeathermap.org");
            return;
            } else {
        
            // sending te list array for the data about the forescast and the object 
            createDataObject(weatherResponse.list, weatherResponse.city.coord);
            console.log(weatherCondition[0].lat+" "+weatherCondition[0].lon)

            }

        fetch("http://api.openweathermap.org/data/2.5/uvi?appid=b262298fbe39ad30d243f31f6e1297bc&lat="+weatherCondition[0].lat+"&lon="+weatherCondition[0].lon)
    
        .then(function(uvResponse) {
          return uvResponse.json();
        })
        .then(function(uvResponse) {
            //console.log(uvResponse);
          if (!uvResponse) {   //verify the information to validate
            displayAlertMessage('OpenWeathermap.org could not find anything for latitude and Longitude');
            //console.log('OpenWeathermap.org could not find anything for latitude and Longitude');
            return;
          } else {
            //console.log(uvResponse);
            /* var responseContainerEl = document.querySelector('#response-container');
            responseContainerEl.innerHTML = '';
            var gifImg = document.createElement('img');
            gifImg.setAttribute('src', response.data[0].images.fixed_height.url);
            responseContainerEl.appendChild(gifImg); */
            saveCity(city);
          }
        })
    })
        .catch(function(error) {
            // if there is a problen to connect to OpenWeathermap.org
            displayAlertMessage("Unable to connect to OpenWeathermap.org");
          });
};

// function listener on click button
var search = function(event){
    event.preventDefault();
    var inputElement = document.querySelector("#searchCity");
    var textInput = inputElement.value.trim();
    //console.log(textInput);
    if(inputElement.value === ""){
        alert("Weather Dashbord\n   You must enter a City");
        return;
    }
    // if the value is a string 
    else{
        //console.log(textInput);
        // call function for api response
        callApiFetch(textInput);

    }

};
/*******************************************************************/

/************************* Execution *******************************/

// function that start everything  
start();
// Add event listener to Searching button 
btn.addEventListener("click", search);

/*******************************************************************/
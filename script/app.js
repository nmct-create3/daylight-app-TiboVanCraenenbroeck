let isLoaded = false;
let domSun, domBody;
let lati = 50.8027841,
  longi = 3.2097454;
// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
  //Get hours from milliseconds
  const date = new Date(timestamp * 1000);
  // Hours part from the timestamp
  const hours = "0" + date.getHours();
  // Minutes part from the timestamp
  const minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp (gebruiken we nu niet)
  // const seconds = '0' + date.getSeconds();

  // Will display time in 10:30(:23) format
  return hours.substr(-2) + ":" + minutes.substr(-2); //  + ':' + s
}
const getLocation = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    lati = 50.8027841;
    longi = 3.2097454;
    console.log("Locatie werkt niet");
  }
};
const showPosition = function(position) {
  lati = position.coords.latitude;
  longi = position.coords.longitude;
};
const getHeightOfSun = function(sunNow, resterendeMinuten, totalMinutes) {
  let date = new Date();
  date.setHours(12);
  date.setMinutes(40);
  const Minutes = date.getHours() * 60 + date.getMinutes();
  const sunNowMinutes = sunNow.getHours() * 60 + sunNow.getMinutes();
  console.log(`sunNow: ${sunNowMinutes} - Minutes: ${Minutes}`);
  if (sunNowMinutes <= Minutes) {
    return (sunNowMinutes * 100) / Minutes;
  } else {
    return (resterendeMinuten * 100) / totalMinutes;
  }
};
// 5 TODO: maak updateSun functie
const updateSun = function(
  zonAantalMinutenOp,
  totalMinutes,
  domSun,
  sunNow,
  resterendeMinuten
) {
  const sunPercentage = (zonAantalMinutenOp * 100) / totalMinutes;
  domSun.style.left = `${sunPercentage}%`;
  // Bereken de hoogte van de zon
  const percentage = getHeightOfSun(sunNow, resterendeMinuten, totalMinutes);
  domSun.style.bottom = `${percentage}%`;
  // Controleer of de zon onder is
  const domHTML = document.querySelector("html");
  if (resterendeMinuten <= 0) {
    domHTML.classList.remove("is-day");
    domHTML.classList.add("is-night");
  } else {
    domHTML.classList.add("is-day");
    domHTML.classList.remove("is-night");
  }
};
const setsun = function(domSun, totalMinutes) {
  console.log(totalMinutes);
  domSun.style.left = "0%";
  domSun.style.bottom = "0%";
};
// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (sunrise, sunset) => {
  // In de functie moeten we eerst wat zaken ophalen en berekenen.
  // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
  // Bepaal het aantal minuten dat de zon al op is.
  const sunrizeC = new Date(sunrise * 1000);
  const sunriseMinutes = sunrizeC.getHours() * 60 + sunrizeC.getMinutes();
  const sunsetC = new Date(sunset * 1000);
  const sunsetMinutes = sunsetC.getHours() * 60 + sunsetC.getMinutes();
  const sunNow = new Date();
  const sunNowMinutes = sunNow.getHours() * 60 + sunNow.getMinutes();
  let totalMinutes = sunsetMinutes - sunriseMinutes;
  let zonAantalMinutenOp = sunNowMinutes - sunriseMinutes;
  const resterendeMinuten = sunsetMinutes - sunNowMinutes;
  // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
  updateSun(
    zonAantalMinutenOp,
    totalMinutes,
    domSun,
    sunNow,
    resterendeMinuten
  );
  // We voegen ook de 'is-loaded' class toe aan de body-tag.
  domBody.classList.add("is-loaded");
  // Vergeet niet om het resterende aantal minuten in te vullen.
  domSun.dateTime = _parseMillisecondsIntoReadableTime(sunNow.getTime());
  // Bekijk of de zon niet nog onder of reeds onder is
  // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
  // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
  const domTimeLeft = document.querySelector(".js-time-left");
  if (resterendeMinuten >= 0) {
    domTimeLeft.innerHTML = resterendeMinuten;
  } else {
    domTimeLeft.innerHTML = 0;
  }
  // Nu maken we een functie die de zon elke minuut zal updaten
  setTimeout(() => {
    getAPI(lati, longi);
  }, 60000);
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = queryResponse => {
  if (isLoaded == false) {
    isLoaded = true;
    // We gaan eerst een paar onderdelen opvullen
    // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
    const domLocation = document.querySelector(".js-location");
    domLocation.innerHTML = `${queryResponse.city.name}, ${queryResponse.city.country}`;
    // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
    const domSunrise = document.querySelector(".js-sunrise");
    domSunrise.innerHTML = _parseMillisecondsIntoReadableTime(
      queryResponse.city.sunrise /*,
			queryResponse.city.sunset*/
    );
    const domSunset = document.querySelector(".js-sunset");
    domSunset.innerHTML = _parseMillisecondsIntoReadableTime(
      queryResponse.city.sunset
    );
  }
  // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
  placeSunAndStartMoving(queryResponse.city.sunrise, queryResponse.city.sunset);

  // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
};
const fetchaData = async function(lat, lon) {
  return fetch(
    `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=66654d8c2851633f35104f156f49ca9a&units=metric&lang=nl&cnt=1`
  )
    .then(r => r.json())
    .then(data => data);
};
// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = async function(lat, lon) {
  // Eerst bouwen we onze url op
  // Met de fetch API proberen we de data op te halen.
  // Als dat gelukt is, gaan we naar onze showResult functie.
  try {
    const data = await fetchaData(lat, lon);
    showResult(data);
    console.log(data);
  } catch (error) {
    console.log(error);
  }
};

document.addEventListener("DOMContentLoaded", function() {
  domSun = document.querySelector(".js-sun");
  domBody = document.querySelector("body");
  // 1 We will query the API with longitude and latitude.
  //getLocation();
  getAPI(lati, longi);
});

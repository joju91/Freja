document.addEventListener('DOMContentLoaded', function () {
  const startButton = document.getElementById('startButton');
  const startScreen = document.getElementById('startScreen');
  const scoreBar = document.getElementById('scoreBar');
  const gameContainer = document.getElementById('gameContainer');
  const guessButton = document.getElementById('guessButton');
  const roundInfo = document.getElementById('roundInfo');
  const scoreInfo = document.getElementById('scoreInfo');
  const highScoreInfo = document.getElementById('highScoreInfo');
  const messageBox = document.getElementById('messageBox');

  let round = 0;
  let score = 0;
  let highScore = 0;
  let nrRounds = 5;

  // Platser för enkel demo (latitude, longitude)
  const locations = [
    { name: "Stockholm", lat: 59.3293, lng: 18.0686 },
    { name: "Göteborg", lat: 57.7089, lng: 11.9746 },
    { name: "Malmö", lat: 55.6050, lng: 13.0038 },
    { name: "Kiruna", lat: 67.8558, lng: 20.2253 },
    { name: "Visby", lat: 57.6370, lng: 18.2948 }
  ];

  let currentLocation;

  // Initiera Leaflet-kartor
  let streetMap, guessMap, guessMarker;

  function show(element) {
    element.style.display = '';
  }
  function hide(element) {
    element.style.display = 'none';
  }

  startButton.addEventListener('click', function () {
    hide(startScreen);
    show(scoreBar);
    show(gameContainer);
    startGame();
  });

  function startGame() {
    round = 0;
    score = 0;
    roundInfo.textContent = `Runda: 1/${nrRounds}`;
    scoreInfo.textContent = `Poäng: 0`;
    highScoreInfo.textContent = `Högsta poäng: ${highScore}`;
    startRound();
    initMaps();
  }

  function startRound() {
    currentLocation = locations[round];
    if (streetMap) {
      streetMap.setView([currentLocation.lat, currentLocation.lng], 12);
      streetMap.eachLayer(function (layer) {
        if (layer instanceof L.Marker) streetMap.removeLayer(layer);
      });
      L.marker([currentLocation.lat, currentLocation.lng]).addTo(streetMap);
    }
    if (guessMarker) {
      guessMap.removeLayer(guessMarker);
      guessMarker = null;
    }
  }

  function initMaps() {
    if (!streetMap) {
      streetMap = L.map('streetMap').setView([60, 15], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap-bidragsgivare'
      }).addTo(streetMap);
    }
    if (!guessMap) {
      guessMap = L.map('guessMap').setView([60, 15], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap-bidragsgivare'
      }).addTo(guessMap);

      guessMap.on('click', function (e) {
        if (guessMarker) guessMap.removeLayer(guessMarker);
        guessMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(guessMap);
        guessMarker.lat = e.latlng.lat;
        guessMarker.lng = e.latlng.lng;
      });
    }
  }

  guessButton.addEventListener('click', function () {
    if (!guessMarker) {
      messageBox.textContent = "Klicka på gissningskartan för att placera din gissning!";
      return;
    }
    // Beräkna avstånd (enkel Pythagoras för demo, ej exakt)
    const R = 6371;
    function toRad(x) { return x * Math.PI / 180; }
    const dLat = toRad(guessMarker.lat - currentLocation.lat);
    const dLon = toRad(guessMarker.lng - currentLocation.lng);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(currentLocation.lat)) * Math.cos(toRad(guessMarker.lat)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    // Enkel poängsättning: ju närmare desto fler poäng
    let thisScore = Math.max(0, Math.round(5000 - distance * 100));
    score += thisScore;

    messageBox.textContent = `Du gissade ${distance.toFixed(1)} km bort (${thisScore} poäng)!`;

    round++;
    if (round >= nrRounds) {
      if (score > highScore) highScore = score;
      setTimeout(() => {
        showResult();
      }, 1200);
    } else {
      roundInfo.textContent = `Runda: ${round+1}/${nrRounds}`;
      scoreInfo.textContent = `Poäng: ${score}`;
      setTimeout(() => {
        startRound();
        messageBox.textContent = "";
      }, 1200);
    }
  });

  function showResult() {
    scoreInfo.textContent = `Poäng: ${score}`;
    highScoreInfo.textContent = `Högsta poäng: ${highScore}`;
    messageBox.textContent = `Game over! Slutpoäng: ${score}`;
    setTimeout(() => {
      // Göm spel, visa startskärmen igen
      show(startScreen);
      hide(scoreBar);
      hide(gameContainer);
      messageBox.textContent = "";
    }, 2500);
  }
});

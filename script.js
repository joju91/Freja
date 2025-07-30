/*
 * Mini GeoGuessr game
 *
 * This script implements a simple location guessing game inspired by
 * GeoGuessr. A user is placed somewhere on the map (displayed on the
 * "streetMap") and must guess their location by clicking on another
 * map ("guessMap"). Points are awarded based on how close the guess
 * is to the actual coordinates. After a set number of rounds, the
 * final score is displayed.
 */

// Predefined list of notable cities around the world with coordinates.
// Feel free to extend or modify this list for more variety. Coordinates
// are approximate and chosen to give interesting and recognizable
// locations for guessing.
const LOCATIONS = [
  { name: "New York, USA", lat: 40.7128, lon: -74.006 },
  { name: "Paris, Frankrike", lat: 48.8566, lon: 2.3522 },
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney, Australien", lat: -33.8688, lon: 151.2093 },
  { name: "Kairo, Egypten", lat: 30.0444, lon: 31.2357 },
  { name: "Rio de Janeiro, Brasilien", lat: -22.9068, lon: -43.1729 },
  { name: "Moskva, Ryssland", lat: 55.7558, lon: 37.6173 },
  { name: "Kapstaden, Sydafrika", lat: -33.9249, lon: 18.4241 },
  { name: "Delhi, Indien", lat: 28.7041, lon: 77.1025 },
  { name: "Toronto, Kanada", lat: 43.6532, lon: -79.3832 },
  { name: "Stockholm, Sverige", lat: 59.3293, lon: 18.0686 },
  { name: "London, Storbritannien", lat: 51.5074, lon: -0.1278 },
  { name: "Beijing, Kina", lat: 39.9042, lon: 116.4074 },
  { name: "Buenos Aires, Argentina", lat: -34.6037, lon: -58.3816 },
  { name: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792 },
  // Additional cities to provide more variety and reduce repetition
  { name: "Mexico City, Mexiko", lat: 19.4326, lon: -99.1332 },
  { name: "Berlin, Tyskland", lat: 52.52, lon: 13.405 },
  { name: "Madrid, Spanien", lat: 40.4168, lon: -3.7038 },
  { name: "Rom, Italien", lat: 41.9028, lon: 12.4964 },
  { name: "Aten, Grekland", lat: 37.9838, lon: 23.7275 },
  { name: "Nairobi, Kenya", lat: -1.286389, lon: 36.817223 },
  { name: "Johannesburg, Sydafrika", lat: -26.2041, lon: 28.0473 },
  { name: "Vancouver, Kanada", lat: 49.2827, lon: -123.1207 },
  { name: "Chicago, USA", lat: 41.8781, lon: -87.6298 },
  { name: "Los Angeles, USA", lat: 34.0522, lon: -118.2437 },
  { name: "San Francisco, USA", lat: 37.7749, lon: -122.4194 },
  { name: "Seattle, USA", lat: 47.6062, lon: -122.3321 },
  { name: "Miami, USA", lat: 25.7617, lon: -80.1918 },
  { name: "São Paulo, Brasilien", lat: -23.5505, lon: -46.6333 },
  { name: "Santiago, Chile", lat: -33.4489, lon: -70.6693 },
  { name: "Lima, Peru", lat: -12.0464, lon: -77.0428 },
  { name: "Bogotá, Colombia", lat: 4.711, lon: -74.0721 },
  { name: "Caracas, Venezuela", lat: 10.4806, lon: -66.9036 },
  { name: "Auckland, Nya Zeeland", lat: -36.8485, lon: 174.7633 },
  { name: "Dublin, Irland", lat: 53.3498, lon: -6.2603 },
  { name: "Reykjavik, Island", lat: 64.1466, lon: -21.9426 },
  { name: "Köpenhamn, Danmark", lat: 55.6761, lon: 12.5683 },
  { name: "Oslo, Norge", lat: 59.9139, lon: 10.7522 },
  { name: "Helsingfors, Finland", lat: 60.1699, lon: 24.9384 },
  { name: "Bryssel, Belgien", lat: 50.8503, lon: 4.3517 },
  { name: "Amsterdam, Nederländerna", lat: 52.3676, lon: 4.9041 },
  { name: "Wien, Österrike", lat: 48.2082, lon: 16.3738 },
  { name: "Prag, Tjeckien", lat: 50.0755, lon: 14.4378 },
  { name: "Budapest, Ungern", lat: 47.4979, lon: 19.0402 },
  { name: "Warszawa, Polen", lat: 52.2297, lon: 21.0122 },
  { name: "Zürich, Schweiz", lat: 47.3769, lon: 8.5417 },
  { name: "Istanbul, Turkiet", lat: 41.0082, lon: 28.9784 },
  { name: "Hongkong, Kina", lat: 22.3193, lon: 114.1694 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Kuala Lumpur, Malaysia", lat: 3.139, lon: 101.6869 },
  { name: "Bangkok, Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "Seoul, Sydkorea", lat: 37.5665, lon: 126.978 },
  { name: "Manila, Filippinerna", lat: 14.5995, lon: 120.9842 },
  { name: "Jakarta, Indonesien", lat: -6.2088, lon: 106.8456 },
  { name: "Taipei, Taiwan", lat: 25.032969, lon: 121.565418 },
  { name: "Karachi, Pakistan", lat: 24.8607, lon: 67.0011 },
  { name: "Casablanca, Marocko", lat: 33.5731, lon: -7.5898 },
  { name: "Marrakech, Marocko", lat: 31.6295, lon: -7.9811 },
  { name: "Tunis, Tunisien", lat: 36.8065, lon: 10.1815 },
  { name: "Dakar, Senegal", lat: 14.6928, lon: -17.4467 },
  { name: "Accra, Ghana", lat: 5.6037, lon: -0.187 },
  { name: "Alger, Algeriet", lat: 36.7538, lon: 3.0588 },
  { name: "Dubai, Förenade Arabemiraten", lat: 25.2048, lon: 55.2708 },
  { name: "Bagdad, Irak", lat: 33.3152, lon: 44.3661 },
  { name: "Teheran, Iran", lat: 35.6892, lon: 51.389 },
];

// Game settings
const TOTAL_ROUNDS = 5; // number of rounds per game

// Game state variables
let currentRound = 0;
let currentLocation = null;
let score = 0;
let usedLocations = [];
let hasGuessed = false;

// High score handling
const HIGH_SCORE_KEY = "miniGeoGuessrHighScore";
let highScore = 0;

// Leaflet map instances and markers
let streetMap, guessMap;
let guessMarker = null;
let actualMarker = null;
let connectingLine = null;

// DOM elements
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const scoreBar = document.getElementById("scoreBar");
const roundInfo = document.getElementById("roundInfo");
const scoreInfo = document.getElementById("scoreInfo");
const messageBox = document.getElementById("messageBox");

// Utility function: calculate distance between two lat/lon points in km.
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Load high score from localStorage
function loadHighScore() {
  const stored = localStorage.getItem(HIGH_SCORE_KEY);
  if (stored) {
    const val = parseInt(stored, 10);
    if (!isNaN(val)) {
      highScore = val;
    }
  }
  updateHighScoreDisplay();
}

// Update high score display on the score bar
function updateHighScoreDisplay() {
  const highDiv = document.getElementById("highScoreInfo");
  if (highDiv) {
    highDiv.textContent = `Högsta poäng: ${highScore}`;
  }
}

// Initialize the two maps
function initMaps() {
  // Map showing the actual location to explore
  streetMap = L.map("streetMap", {
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
  });
  // Use OpenStreetMap tiles
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
  }).addTo(streetMap);

  // Map used for making guesses
  guessMap = L.map("guessMap", {
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    boxZoom: true,
    keyboard: true,
  }).setView([20, 0], 2);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(guessMap);

  // Add click listener for the guess map
  guessMap.on("click", onGuess);
}

// Start a new game
function startGame() {
  currentRound = 0;
  score = 0;
  usedLocations = [];
  startScreen.style.display = "none";
  // Initialize the maps on first start to ensure the containers have
  // proper dimensions. Doing this here (instead of on page load)
  // avoids Leaflet creating maps with zero height when the start
  // overlay covers them.
  if (!streetMap || !guessMap) {
    initMaps();
  }
  // try to enter fullscreen for immersive experience
  if (document.fullscreenEnabled) {
    document.documentElement.requestFullscreen().catch(() => {
      /* ignore failures due to user gesture requirements */
    });
  }
  scoreBar.style.display = "flex";
  // Load the stored high score and update display
  loadHighScore();
  // After toggling visibility of DOM elements, force Leaflet to recalculate
  // map sizes. Without this call the maps may remain blank when the
  // container changes from hidden to visible.
  if (streetMap && guessMap) {
    setTimeout(() => {
      streetMap.invalidateSize();
      guessMap.invalidateSize();
    }, 0);
  }
  nextRound();
}

// Choose a random location that hasn't been used yet
function pickRandomLocation() {
  let available = LOCATIONS.filter((loc) => !usedLocations.includes(loc));
  if (available.length === 0) {
    // Reset used locations if we've run out
    usedLocations = [];
    available = LOCATIONS;
  }
  const index = Math.floor(Math.random() * available.length);
  const location = available[index];
  usedLocations.push(location);
  return location;
}

// Begin the next round
function nextRound() {
  if (currentRound >= TOTAL_ROUNDS) {
    endGame();
    return;
  }
  hasGuessed = false;
  currentRound++;
  currentLocation = pickRandomLocation();
  // Update round info
  roundInfo.textContent = `Runda: ${currentRound}/${TOTAL_ROUNDS}`;
  scoreInfo.textContent = `Poäng: ${score}`;
  // Show instruction for the new round
  messageBox.innerHTML =
    `Runda ${currentRound} av ${TOTAL_ROUNDS}: Utforska området på vänster karta och klicka på gissningskartan till höger när du vill gissa.`;
  messageBox.style.display = "block";

  // Clear any existing markers/lines from previous round
  if (guessMarker) {
    guessMap.removeLayer(guessMarker);
    guessMarker = null;
  }
  if (actualMarker) {
    guessMap.removeLayer(actualMarker);
    actualMarker = null;
  }
  if (connectingLine) {
    guessMap.removeLayer(connectingLine);
    connectingLine = null;
  }

  // Center the street map on the new location. Use a moderately high zoom
  streetMap.setView([currentLocation.lat, currentLocation.lon], 14);
}

// Handle guesses on the guess map
function onGuess(e) {
  // prevent multiple guesses per round
  if (hasGuessed) return;
  hasGuessed = true;
  const guessedLat = e.latlng.lat;
  const guessedLon = e.latlng.lng;
  const actualLat = currentLocation.lat;
  const actualLon = currentLocation.lon;

  // Place markers on guess map
  guessMarker = L.marker([guessedLat, guessedLon], {
    title: "Din gissning",
  }).addTo(guessMap);
  actualMarker = L.marker([actualLat, actualLon], {
    title: currentLocation.name,
  }).addTo(guessMap);
  // Draw line between guess and actual
  connectingLine = L.polyline(
    [
      [guessedLat, guessedLon],
      [actualLat, actualLon],
    ],
    { color: "#d9534f", weight: 2, dashArray: "4" }
  ).addTo(guessMap);

  // Calculate distance (in km)
  const distanceKm = haversineDistance(
    guessedLat,
    guessedLon,
    actualLat,
    actualLon
  );
  // Compute points: start at 5000, subtract 50 points per km, minimum 0
  const points = Math.max(0, Math.round(5000 - distanceKm * 50));
  score += points;
  scoreInfo.textContent = `Poäng: ${score}`;

  // Display a message with the result
  const distanceRounded = distanceKm.toFixed(1);
  messageBox.innerHTML =
    `<strong>${currentLocation.name}</strong><br/>` +
    `Du var ${distanceRounded} km bort och fick ${points} poäng.`;
  messageBox.style.display = "block";

  // After a delay, move to the next round
  setTimeout(nextRound, 3000);
}

// Finish the game and show final score
function endGame() {
  // Hide maps and show final message
  messageBox.innerHTML = `Spelet är slut! Din slutpoäng är ${score} av ${
    TOTAL_ROUNDS * 5000
  }.`;
  messageBox.style.display = "block";
  roundInfo.textContent = `Färdig!`;
  // Show restart button
  startScreen.style.display = "flex";
  startScreen.querySelector("h1").textContent = "Bra jobbat!";
  startScreen.querySelector(
    "p"
  ).textContent = `Din slutpoäng är ${score} poäng. Vill du spela igen?`;
  startButton.textContent = "Spela igen";

  // Update high score if this run is better
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
    updateHighScoreDisplay();
  }
}

// Attach event listeners
startButton.addEventListener("click", startGame);

// Hide the score bar until the game starts
window.addEventListener("load", () => {
  scoreBar.style.display = "none";
});
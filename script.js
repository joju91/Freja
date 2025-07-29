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
];

// Game settings
const TOTAL_ROUNDS = 5; // number of rounds per game

// Game state variables
let currentRound = 0;
let currentLocation = null;
let score = 0;
let usedLocations = [];
let hasGuessed = false;

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
  messageBox.style.display = "none";

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
}

// Attach event listeners
startButton.addEventListener("click", startGame);

// Hide the score bar until the game starts
window.addEventListener("load", () => {
  scoreBar.style.display = "none";
});
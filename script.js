// Predefined list of large world cities for "easy" mode (enhanced with 10 extra European cities)
const BIG_CITIES = [
  { name: "New York, USA", lat: 40.7128, lon: -74.0060 },
  { name: "London, Storbritannien", lat: 51.5074, lon: -0.1278 },
  { name: "Paris, Frankrike", lat: 48.8566, lon: 2.3522 },
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503 },
  { name: "Peking, Kina", lat: 39.9042, lon: 116.4074 },
  { name: "Mumbai, Indien", lat: 19.0760, lon: 72.8777 },
  { name: "Kairo, Egypten", lat: 30.0444, lon: 31.2357 },
  { name: "Sydney, Australien", lat: -33.8688, lon: 151.2093 },
  { name: "Moskva, Ryssland", lat: 55.7558, lon: 37.6173 },
  { name: "São Paulo, Brasilien", lat: -23.5505, lon: -46.6333 },
  { name: "Los Angeles, USA", lat: 34.0522, lon: -118.2437 },
  { name: "Mexico City, Mexiko", lat: 19.4326, lon: -99.1332 },
  { name: "Istanbul, Turkiet", lat: 41.0082, lon: 28.9784 },
  { name: "Buenos Aires, Argentina", lat: -34.6037, lon: -58.3816 },
  { name: "Lagos, Nigeria", lat: 6.5244, lon: 3.3792 },
  { name: "Karachi, Pakistan", lat: 24.8607, lon: 67.0011 },
  { name: "Rio de Janeiro, Brasilien", lat: -22.9068, lon: -43.1729 },
  { name: "Chongqing, Kina", lat: 29.4316, lon: 106.9123 },
  { name: "Guangzhou (Kanton), Kina", lat: 23.1291, lon: 113.2644 },
  { name: "Shenzhen, Kina", lat: 22.5431, lon: 114.0579 },

  // Extra 10 europeiska städer
  { name: "Barcelona, Spanien", lat: 41.3851, lon: 2.1734 },
  { name: "Milano, Italien", lat: 45.4642, lon: 9.19 },
  { name: "Madrid, Spanien", lat: 40.4168, lon: -3.7038 },
  { name: "Amsterdam, Nederländerna", lat: 52.3676, lon: 4.9041 },
  { name: "München, Tyskland", lat: 48.1351, lon: 11.5820 },
  { name: "Wien, Österrike", lat: 48.2082, lon: 16.3738 },
  { name: "Warszawa, Polen", lat: 52.2297, lon: 21.0122 },
  { name: "Prag, Tjeckien", lat: 50.0755, lon: 14.4378 },
  { name: "Budapest, Ungern", lat: 47.4979, lon: 19.0402 },
  { name: "Dublin, Irland", lat: 53.3498, lon: -6.2603 },
  { name: "Visby, Sverige", lat: 57.6348, lon: 18.2948 },
  { name: "Malmö, Sverige", lat: 55.6050, lon: 13.0038 },
  { name: "Stockholm, Sverige", lat: 59.3293, lon: 18.0686 },
  { name: "Oslo, Norge", lat: 59.9139, lon: 10.7522 },

  // Additional requested cities
  { name: "Rom, Italien", lat: 41.9028, lon: 12.4964 },
  { name: "Montreal, Kanada", lat: 45.5017, lon: -73.5673 },
  { name: "Vancouver, Kanada", lat: 49.2827, lon: -123.1207 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "Bangkok, Thailand", lat: 13.7563, lon: 100.5018 },
  { name: "Berlin, Tyskland", lat: 52.5200, lon: 13.4050 },
  { name: "Miami, USA", lat: 25.7617, lon: -80.1918 }
];

// Game settings
const TOTAL_ROUNDS = 5;

// State variables
let currentRound = 0;
let currentLocation = null;
let score = 0;
let hasGuessed = false;

// localStorage keys
const HIGH_SCORE_KEY = "miniGeoGuessrHighScore";
const HISTORY_KEY = "miniGeoGuessrHistory";
const BEST_GUESSES_KEY = "miniGeoGuessrBestGuesses";

// High score value
let highScore = 0;

// Map instances
let streetMap, guessMap;
let guessMarker, actualMarker, connectingLine;

// DOM elements
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const difficultySelect = document.getElementById("difficulty");
const difficultyDescription = document.getElementById("difficultyDescription");
const scoreBar = document.getElementById("scoreBar");
const roundInfo = document.getElementById("roundInfo");
const scoreInfo = document.getElementById("scoreInfo");
const highScoreInfo = document.getElementById("highScoreInfo");
const messageBox = document.getElementById("messageBox");
const historyContainer = document.getElementById("historyContainer");
const historyList = document.getElementById("historyList");
const highScoresContainer = document.getElementById("highScoresContainer");
const highScoresList = document.getElementById("highScoresList");
const bestGuessesContainer = document.getElementById("bestGuessesContainer");
const bestGuessesList = document.getElementById("bestGuessesList");

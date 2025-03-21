// js/main.js
import EventBus from './core/EventBus.js';
import { GameEvents } from './core/GameEvents.js';
import Game from './core/Game.js';
import CommandParser from './core/CommandParser.js';
import SaveManager from './core/SaveManager.js';

import UIManager from './ui/UIManager.js';
import RoomDisplay from './ui/RoomDisplay.js';
import CommandInput from './ui/CommandInput.js';

import Navigation from './features/Navigation.js';
import Inventory from './features/Inventory.js';
import ObjectInteraction from './features/ObjectInteraction.js';
import SpecialEvents from './features/SpecialEvents.js';

import ImageLoader from './utils/ImageLoader.js';

// Import data modules
import * as roomData from './data/rooms.js';
import * as objectData from './data/objects.js';
import * as textData from './data/text.js';

// Create event bus instance for module communication
const eventBus = new EventBus();

// Export event bus for modules to use
export default eventBus;

// Define image manifest
const imageManifest = {
  locations: {
    'default': '/images/locations/default.jpg',
    'hallway': '/images/locations/hallway.jpg',
    'bathroom': '/images/locations/bathroom.jpg',
    'bar': '/images/locations/bar.jpg',
    'street': '/images/locations/street.jpg',
    // other locations...
  },
  characters: {
    'default': '/images/characters/default.jpg',
    'char_15': '/images/characters/bartender.jpg',
    'char_17': '/images/characters/hooker.jpg',
    // other characters...
  },
  ui: {
    'default': '/images/ui/default.png',
    'title': '/images/ui/title.jpg',
    // other UI elements...
  }
};

// Game component instances
let game, commandParser, saveManager;
let uiManager, roomDisplay, commandInput;
let navigation, inventory, objectInteraction, specialEvents;
let imageLoader;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
  try {
    console.log("DOM Content Loaded - Initializing game components");
    
    // Set debug mode for development
    eventBus.setDebugMode(true);
    
    // Create image loader
    imageLoader = new ImageLoader();
    
    // Initialize components with proper order to avoid circular dependencies
    initializeComponents();
    
    // Set up start game button with explicit event handling
    const startButton = document.getElementById('start-game');
    if (startButton) {
      startButton.addEventListener('click', function() {
        console.log("Start Game button clicked");
        const introScreen = document.getElementById('intro-screen');
        if (introScreen) {
          introScreen.style.display = 'none';
        }
        
        if (game) {
          console.log("Starting game...");
          game.start();
        } else {
          console.error("Game instance not initialized");
        }
      });
      console.log("Start Game button event listener added");
    } else {
      console.error("Start Game button not found in the DOM");
    }
    
    // Handle "no load" button for saved games
    document.addEventListener('click', function(event) {
      if (event.target.id === 'no-load') {
        console.log("No Load button clicked");
        if (game) {
          game.initializeGame();
        }
      }
    });
    
    console.log('Softporn Adventure - 80s Neon Edition initialization complete!');
    
  } catch (error) {
    console.error('Error initializing game:', error);
    
    // Display error message to user
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerHTML = `
      <h2>Error Loading Game</h2>
      <p>There was a problem initializing the game. Please refresh and try again.</p>
      <p>Technical details: ${error.message}</p>
    `;
    document.body.appendChild(errorMessage);
  }
});

// Initialize all game components
function initializeComponents() {
  console.log("Initializing components...");
  
  // Create game instance first
  game = new Game();
  console.log("Game instance created");
  
  // Create core components
  commandParser = new CommandParser();
  saveManager = new SaveManager(game);
  
  // Create UI components
  roomDisplay = new RoomDisplay(eventBus, imageLoader, roomData, objectData);
  commandInput = new CommandInput(eventBus, {}, objectData);
  uiManager = new UIManager(eventBus, roomDisplay, commandInput, imageLoader);
  
  // Create feature modules
  navigation = new Navigation(game);
  inventory = new Inventory(game);
  objectInteraction = new ObjectInteraction(game);
  specialEvents = new SpecialEvents(game);
  
  // Initialize UI elements
  uiManager.setupUI();
  
  // Publish initialization event after all components are created
  console.log("Publishing game initialized event");
  eventBus.publish(GameEvents.GAME_INITIALIZED, {
    timestamp: new Date().toISOString()
  });
}

// Export key components for testing
export { 
  game, 
  eventBus, 
  commandParser, 
  saveManager, 
  uiManager, 
  navigation, 
  inventory, 
  objectInteraction, 
  specialEvents
};
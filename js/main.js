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

// FIX: Enable debug mode by default
eventBus.setDebugMode(true);

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
    
    // FIX: Add check for intro screen
    const introScreen = document.getElementById('intro-screen');
    if (introScreen) {
      console.log("Intro screen found, waiting for user to start game");
    } else {
      console.warn("Intro screen not found, game might start immediately");
    }
    
    // Initialize components with proper order to avoid circular dependencies
    initializeComponents();
    
    // Set up start game button with explicit event handling
    const startButton = document.getElementById('start-game');
    if (startButton) {
      startButton.addEventListener('click', function() {
        console.log("Start Game button clicked");
        
        // FIX: Better error handling for intro screen
        const introScreen = document.getElementById('intro-screen');
        if (introScreen) {
          introScreen.style.display = 'none';
          console.log("Intro screen hidden");
        } else {
          console.warn("Intro screen element not found");
        }
        
        if (game) {
          console.log("Starting game...");
          
          // FIX: Add error handling and timeout protection
          try {
            // Start the game
            game.start();
            
            // FIX: Check for start success after a short delay
            setTimeout(() => {
              // Verify the game display is showing content
              const gameDisplay = document.getElementById('game-display');
              if (gameDisplay && gameDisplay.children.length === 0) {
                console.warn("Game display appears empty after start, forcing initialization");
                game.initializeGame();
              }
            }, 1000);
            
          } catch (error) {
            console.error("Error during game start:", error);
            // Display error to user
            showFatalError("Game failed to start properly. Please refresh the page and try again.");
          }
        } else {
          console.error("Game instance not initialized");
          showFatalError("Game engine not initialized. Please refresh the page.");
        }
      });
      console.log("Start Game button event listener added");
    } else {
      console.error("Start Game button not found in the DOM");
    }
    
    // FIX: Add direct event listener for no-load button
    document.addEventListener('click', function(event) {
      if (event.target.id === 'no-load') {
        console.log("No Load button clicked - main.js handler");
        if (game) {
          game.initializeGame();
        }
      }
    });
    
    console.log('Softporn Adventure - 80s Neon Edition initialization complete!');
    
    // FIX: Add console commands for testing
    window.debugGame = {
      startGame: () => game.start(),
      initGame: () => game.initializeGame(),
      displayRoom: () => game.displayRoom()
    };
    console.log("Debug commands available via window.debugGame");
    
  } catch (error) {
    console.error('Error initializing game:', error);
    showFatalError(`There was a problem initializing the game. Please refresh and try again. (${error.message})`);
  }
});

// Display fatal error to user
function showFatalError(message) {
  console.error("FATAL ERROR:", message);
  
  const errorMessage = document.createElement('div');
  errorMessage.className = 'error-message';
  errorMessage.style.position = 'fixed';
  errorMessage.style.top = '50%';
  errorMessage.style.left = '50%';
  errorMessage.style.transform = 'translate(-50%, -50%)';
  errorMessage.style.background = 'rgba(0,0,0,0.9)';
  errorMessage.style.padding = '20px';
  errorMessage.style.border = '2px solid #ff71ce';
  errorMessage.style.color = 'white';
  errorMessage.style.zIndex = '9999';
  errorMessage.style.maxWidth = '80%';
  errorMessage.style.textAlign = 'center';
  
  errorMessage.innerHTML = `
    <h2 style="color: #ff71ce; margin-top: 0;">Error Loading Game</h2>
    <p>${message}</p>
    <button style="background: #01cdfe; border: none; color: white; padding: 10px 20px; margin-top: 15px; cursor: pointer;" 
            onclick="window.location.reload()">Reload Page</button>
  `;
  
  document.body.appendChild(errorMessage);
}

// Initialize all game components
function initializeComponents() {
  console.log("Initializing components...");
  
  try {
    // FIX: Initialize image loader first
    imageLoader = new ImageLoader();
    console.log("Image loader created");
    
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
    
    // Initialize UI elements (even though UIManager does this in constructor now)
    uiManager.setupUI();
    
    // Publish initialization event after all components are created
    console.log("Publishing game initialized event");
    eventBus.publish(GameEvents.GAME_INITIALIZED, {
      timestamp: new Date().toISOString()
    });
    
    // FIX: Verify DOM elements exist
    verifyDomElements();
    
  } catch (error) {
    console.error("Error during component initialization:", error);
    throw new Error(`Component initialization failed: ${error.message}`);
  }
}

// FIX: Add function to verify DOM elements
function verifyDomElements() {
  const critical = [
    'game-display',
    'location-image',
    'location-name',
    'command-input'
  ];
  
  const missing = critical.filter(id => !document.getElementById(id));
  
  if (missing.length > 0) {
    console.error(`Missing critical DOM elements: ${missing.join(', ')}`);
  } else {
    console.log("All critical DOM elements found");
  }
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
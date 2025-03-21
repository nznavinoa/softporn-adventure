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
import GameIntegration from './features/GameIntegration.js';

import SlotMachine from './minigames/SlotMachine.js';
import Blackjack from './minigames/Blackjack.js';

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
    'backroom': '/images/locations/backroom.jpg',
    'dumpster': '/images/locations/dumpster.jpg',
    'hotel_room': '/images/locations/hotel_room.jpg',
    'window_ledge': '/images/locations/window_ledge.jpg',
    'hooker_bedroom': '/images/locations/hooker_bedroom.jpg',
    'balcony': '/images/locations/balcony.jpg',
    'casino': '/images/locations/casino.jpg',
    'disco': '/images/locations/disco.jpg',
    'lobby': '/images/locations/lobby.jpg',
    'pharmacy': '/images/locations/pharmacy.jpg',
    'garden': '/images/locations/garden.jpg',
    'jacuzzi': '/images/locations/jacuzzi.jpg',
    'penthouse': '/images/locations/penthouse.jpg'
  },
  characters: {
    'default': '/images/characters/default.jpg',
    'char_15': '/images/characters/bartender.jpg',
    'char_16': '/images/characters/pimp.jpg',
    'char_17': '/images/characters/hooker.jpg',
    'char_19': '/images/characters/preacher.jpg',
    'char_25': '/images/characters/blonde.jpg',
    'char_27': '/images/characters/bum.jpg',
    'char_32': '/images/characters/waitress.jpg',
    'char_41': '/images/characters/dealer.jpg',
    'char_49': '/images/characters/girl.jpg'
  },
  ui: {
    'default': '/images/ui/default.png',
    'title': '/images/ui/title.jpg',
    'button': '/images/ui/button.png',
    'inventory': '/images/ui/inventory.png',
    'slots': '/images/ui/slots.png',
    'blackjack': '/images/ui/blackjack.png'
  }
};

// Game component instances
let game, commandParser, saveManager;
let uiManager, roomDisplay, commandInput;
let navigation, inventory, objectInteraction, specialEvents, gameIntegration;
let slotMachine, blackjack;
let imageLoader;

// Analytics tracking - simple for now
const analytics = {
  trackEvent: (category, action, label) => {
    if (window.debug) {
      console.log(`Analytics: ${category} - ${action} - ${label}`);
    }
    // In a real implementation, this would send to an analytics service
    eventBus.publish(GameEvents.ANALYTICS_EVENT, {
      category,
      action,
      label,
      timestamp: new Date().toISOString()
    });
  },
  
  trackScreenView: (screenName) => {
    if (window.debug) {
      console.log(`Screen View: ${screenName}`);
    }
    // In a real implementation, this would send to an analytics service
    eventBus.publish(GameEvents.ANALYTICS_SCREEN_VIEW, {
      screenName,
      timestamp: new Date().toISOString()
    });
  },
  
  trackError: (errorType, errorMessage) => {
    if (window.debug) {
      console.error(`Error: ${errorType} - ${errorMessage}`);
    }
    // In a real implementation, this would send to an analytics service
    eventBus.publish(GameEvents.ANALYTICS_ERROR, {
      errorType,
      errorMessage,
      timestamp: new Date().toISOString()
    });
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Set debug mode for development
    const debug = window.location.search.includes('debug=true');
    window.debug = debug;
    
    // Create event bus and enable debug mode if needed
    eventBus.setDebugMode(debug);
    
    // Display loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading-message';
    loadingMessage.textContent = 'LOADING GAME...';
    document.body.appendChild(loadingMessage);
    
    // Create image loader and preload images
    imageLoader = new ImageLoader();
    
    try {
      await imageLoader.preloadImages(imageManifest);
      eventBus.publish(GameEvents.IMAGE_LOADING_COMPLETE, {
        status: 'success',
        loadedImages: imageLoader.getLoadingStatus().loaded,
        totalImages: imageLoader.getLoadingStatus().total
      });
    } catch (error) {
      console.warn('Some images failed to load, but the game will continue', error);
      analytics.trackError('image_loading', error.message);
    }
    
    // Create core components
    initializeComponents();
    
    // Remove loading message
    loadingMessage.remove();
    
    // Initialize the game
    eventBus.publish(GameEvents.GAME_INITIALIZED, {
      timestamp: new Date().toISOString()
    });
    
    // Set up start game button
    document.getElementById('start-game')?.addEventListener('click', function() {
      document.getElementById('intro-screen').style.display = 'none';
      game.start();
      analytics.trackScreenView('game_started');
    });
    
    // Handle "no load" button for saved games
    document.addEventListener('click', function(event) {
      if (event.target.id === 'no-load') {
        game.initializeGame();
      }
    });
    
    // Log successful initialization
    console.log('Softporn Adventure - 80s Neon Edition initialized successfully!');
    analytics.trackEvent('system', 'initialization', 'success');
    
  } catch (error) {
    console.error('Error initializing game:', error);
    analytics.trackError('initialization', error.message);
    
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
  // Create game instance
  game = new Game();
  
  // Create core components
  commandParser = new CommandParser();
  saveManager = new SaveManager(game);
  
  // Create UI components
  roomDisplay = new RoomDisplay(imageLoader, roomData, objectData);
  commandInput = new CommandInput({}, objectData);
  uiManager = new UIManager(roomDisplay, commandInput, imageLoader);
  
  // Create feature modules
  navigation = new Navigation(game);
  inventory = new Inventory(game);
  objectInteraction = new ObjectInteraction(game);
  specialEvents = new SpecialEvents(game);
  gameIntegration = new GameIntegration(game);
  
  // Create mini-game modules
  slotMachine = new SlotMachine(game);
  blackjack = new Blackjack(game);
  
  // Set up global error handling for analytics
  window.addEventListener('error', (event) => {
    analytics.trackError('javascript', event.message);
  });
  
  // Set up performance monitoring (basic)
  if (window.debug && window.performance) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.log(`Performance: ${entry.name}: ${entry.duration}ms`);
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
  }
}

// Global helper method to measure performance (when debug is true)
window.measurePerformance = (name, fn) => {
  if (!window.debug || !window.performance) return fn();
  
  const start = `${name}-start`;
  const end = `${name}-end`;
  
  performance.mark(start);
  const result = fn();
  performance.mark(end);
  performance.measure(name, start, end);
  
  return result;
};

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
  specialEvents, 
  gameIntegration, 
  slotMachine, 
  blackjack 
};
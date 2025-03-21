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

import SlotMachine from './minigames/SlotMachine.js';
import Blackjack from './minigames/Blackjack.js';

import ImageLoader from './utils/ImageLoader.js';

// Import data modules
import roomData from './data/rooms.js';
import objectData from './data/objects.js';
import textData from './data/text.js';

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
    'inventory': '/images/ui/inventory.png'
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Create event bus
    const eventBus = new EventBus();
    
    // Set debug mode for development
    const debug = window.location.search.includes('debug=true');
    eventBus.setDebugMode(debug);
    
    // Create image loader and preload images
    const imageLoader = new ImageLoader();
    
    // Display loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'loading-message';
    loadingMessage.textContent = 'LOADING GAME...';
    document.body.appendChild(loadingMessage);
    
    // Preload images
    await imageLoader.preloadImages(imageManifest);
    
    // Create core components
    const game = new Game(eventBus, roomData, objectData, textData);
    const commandParser = new CommandParser(eventBus);
    const saveManager = new SaveManager(eventBus, game);
    
    // Create UI components
    const roomDisplay = new RoomDisplay(eventBus, imageLoader, roomData, objectData);
    const commandInput = new CommandInput(eventBus, {}, objectData);
    const uiManager = new UIManager(eventBus, roomDisplay, commandInput, imageLoader);
    
    // Create feature modules
    const navigation = new Navigation(eventBus, game);
    const inventory = new Inventory(eventBus, game);
    const objectInteraction = new ObjectInteraction(eventBus, game);
    const specialEvents = new SpecialEvents(eventBus, game);
    
    // Create mini-game modules
    const slotMachine = new SlotMachine(eventBus, game);
    const blackjack = new Blackjack(eventBus, game);
    
    // Remove loading message
    loadingMessage.remove();
    
    // Initialize the game
    eventBus.publish(GameEvents.GAME_INITIALIZED, {});
    
    // Set up start game button
    document.getElementById('start-game').addEventListener('click', function() {
      document.getElementById('intro-screen').style.display = 'none';
      game.start();
    });
    
    // Handle "no load" button for saved games (when game prompts if saved game should be loaded)
    document.addEventListener('click', function(event) {
      if (event.target.id === 'no-load') {
        game.initializeGame();
      }
    });
    
    console.log('Softporn Adventure - 80s Neon Edition initialized successfully!');
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
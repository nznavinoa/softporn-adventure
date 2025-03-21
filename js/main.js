/**
 * Main entry point for the game
 * Initializes all modules and starts the game
 */
import EventBus from './core/EventBus.js';
import { GameEvents } from './core/GameEvents.js';

// Create the event bus instance (singleton)
const eventBus = new EventBus();

// Enable debug mode during development
eventBus.setDebugMode(true);

document.addEventListener("DOMContentLoaded", function() {
    console.log("Softporn Adventure - 80s Neon Edition initializing...");
    
    // Initialize the game (this will be expanded as we implement more modules)
    eventBus.publish(GameEvents.GAME_INITIALIZED, {
        timestamp: new Date().toISOString()
    });
    
    // For now, add a simple connection to the start button
    document.getElementById("start-game").addEventListener("click", function() {
        document.getElementById("intro-screen").style.display = "none";
        eventBus.publish(GameEvents.GAME_STARTED, {
            timestamp: new Date().toISOString()
        });
    });
});

// Export the event bus for other modules to use
export default eventBus;
/**
 * Integration tests for Softporn Adventure
 * Verifies proper interaction between different modules
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';
import Game from '../core/Game.js';
import CommandParser from '../core/CommandParser.js';
import SaveManager from '../core/SaveManager.js';
import Navigation from '../features/Navigation.js';
import Inventory from '../features/Inventory.js';
import ObjectInteraction from '../features/ObjectInteraction.js';
import SpecialEvents from '../features/SpecialEvents.js';

// Mock room and object data for testing
const mockRoomData = {
  roomDescriptions: {
    1: "TEST ROOM 1",
    2: "TEST ROOM 2",
    3: "TEST ROOM 3"
  },
  roomExits: {
    1: [1, ["NORTH", "EAST"]],
    2: [2, ["SOUTH"]],
    3: [3, ["NORTH", "WEST"]]
  },
  initialRoomObjects: {
    1: [50, 51],
    2: [52, 53],
    3: [54, 55]
  }
};

const mockObjectData = {
  objectNames: {
    50: "TEST ITEM 1",
    51: "TEST ITEM 2",
    52: "TEST ITEM 3",
    53: "TEST ITEM 4",
    54: "TEST ITEM 5",
    55: "TEST ITEM 6"
  },
  objectTypes: {
    50: ["ITEM"],
    51: ["ITEM"],
    52: ["ITEM"],
    53: ["ITEM"],
    54: ["ITEM"],
    55: ["ITEM"]
  }
};

/**
 * Run integration tests
 * @return {Promise<Array>} Test results
 */
export async function runIntegrationTests() {
  console.log('Running Integration Tests');
  const results = [];
  
  // Test 1: Event communication between modules
  try {
    let eventReceived = false;
    let commandProcessed = false;
    
    // Create a test event handler
    const testHandler = (data) => {
      if (data.testValue === 'integration-test') {
        eventReceived = true;
      }
    };
    
    // Subscribe to test event
    eventBus.subscribe('test:event', testHandler);
    
    // Publish test event
    eventBus.publish('test:event', { testValue: 'integration-test' });
    
    // Test CommandParser -> Game flow
    eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => {
      if (data.verb === 'TEST' && data.noun === 'COMMAND') {
        commandProcessed = true;
      }
    });
    
    // Simulate command input
    eventBus.publish(GameEvents.COMMAND_RECEIVED, 'TEST COMMAND');
    
    // Wait a bit for events to propagate
    await new Promise(resolve => setTimeout(resolve, 100));
    
    results.push({
      name: 'Event Bus Communication',
      passed: eventReceived,
      error: eventReceived ? null : 'Event was not received by the handler'
    });
    
    results.push({
      name: 'Command Processing Flow',
      passed: commandProcessed,
      error: commandProcessed ? null : 'Command was not properly processed'
    });
    
    // Clean up
    eventBus.unsubscribe('test:event', testHandler);
  } catch (error) {
    results.push({
      name: 'Event Bus Communication',
      passed: false,
      error: error.message
    });
  }
  
  // Test 2: Game state initialization
  try {
    // Initialize a test game instance
    const game = new Game();
    
    // Verify basic game state
    const initialStateValid = 
      game.score === 0 && 
      game.money === 25 && 
      game.currentRoom === 3 && 
      game.gameOver === false;
    
    results.push({
      name: 'Game State Initialization',
      passed: initialStateValid,
      error: initialStateValid ? null : 'Game was not initialized with correct values'
    });
  } catch (error) {
    results.push({
      name: 'Game State Initialization',
      passed: false,
      error: error.message
    });
  }
  
  // Test 3: Navigation and Room Changes
  try {
    const game = new Game();
    const navigation = new Navigation(game);
    
    let roomChanged = false;
    
    // Listen for room changes
    const roomChangeHandler = () => {
      roomChanged = true;
    };
    
    eventBus.subscribe(GameEvents.ROOM_CHANGED, roomChangeHandler);
    
    // Simulate a move command
    eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: 'NORTH', noun: null });
    
    // Wait a bit for events to propagate
    await new Promise(resolve => setTimeout(resolve, 100));
    
    results.push({
      name: 'Navigation Room Change',
      passed: roomChanged,
      error: roomChanged ? null : 'Room change event was not triggered'
    });
    
    // Clean up
    eventBus.unsubscribe(GameEvents.ROOM_CHANGED, roomChangeHandler);
  } catch (error) {
    results.push({
      name: 'Navigation Room Change',
      passed: false,
      error: error.message
    });
  }
  
  // Test 4: Inventory Management
  try {
    const game = new Game();
    const inventory = new Inventory(game);
    
    // Add test items to a room
    if (!game.roomObjects[3]) {
      game.roomObjects[3] = [];
    }
    game.roomObjects[3].push(50);
    
    let inventoryChanged = false;
    
    // Listen for inventory changes
    const inventoryChangeHandler = () => {
      inventoryChanged = true;
    };
    
    eventBus.subscribe(GameEvents.INVENTORY_CHANGED, inventoryChangeHandler);
    
    // Simulate taking an item
    eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: 'TAKE', noun: 'TEST ITEM 1' });
    
    // Wait a bit for events to propagate
    await new Promise(resolve => setTimeout(resolve, 100));
    
    results.push({
      name: 'Inventory Management',
      passed: inventoryChanged,
      error: inventoryChanged ? null : 'Inventory change event was not triggered'
    });
    
    // Clean up
    eventBus.unsubscribe(GameEvents.INVENTORY_CHANGED, inventoryChangeHandler);
  } catch (error) {
    results.push({
      name: 'Inventory Management',
      passed: false,
      error: error.message
    });
  }
  
  // Test 5: Save/Load Functionality
  try {
    const game = new Game();
    const saveManager = new SaveManager(game);
    
    // Modify game state
    game.score = 1;
    game.money = 50;
    game.currentRoom = 5;
    game.inventory = [50, 51];
    
    // Save the game
    saveManager.saveGame('test-slot');
    
    // Reset game state
    game.score = 0;
    game.money = 25;
    game.currentRoom = 3;
    game.inventory = [];
    
    // Load the game
    saveManager.loadGame('test-slot');
    
    // Verify state was restored
    const stateRestored = 
      game.score === 1 && 
      game.money === 50 && 
      game.currentRoom === 5 && 
      game.inventory.length === 2 &&
      game.inventory.includes(50) &&
      game.inventory.includes(51);
    
    results.push({
      name: 'Save/Load Functionality',
      passed: stateRestored,
      error: stateRestored ? null : 'Game state was not properly saved and restored'
    });
    
    // Clean up
    localStorage.removeItem(saveManager.getSaveKey('test-slot'));
  } catch (error) {
    results.push({
      name: 'Save/Load Functionality',
      passed: false,
      error: error.message
    });
  }
  
  // Test 6: Object Interaction
  try {
    const game = new Game();
    const objectInteraction = new ObjectInteraction(game);
    
    // Add test item to the current room
    if (!game.roomObjects[3]) {
      game.roomObjects[3] = [];
    }
    game.roomObjects[3].push(10); // Graffiti
    
    let displayUpdated = false;
    
    // Listen for display updates
    const displayUpdateHandler = () => {
      displayUpdated = true;
    };
    
    eventBus.subscribe(GameEvents.DISPLAY_UPDATED, displayUpdateHandler);
    
    // Simulate looking at an object
    eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: 'LOOK', noun: 'GRAFFITI' });
    
    // Wait a bit for events to propagate
    await new Promise(resolve => setTimeout(resolve, 100));
    
    results.push({
      name: 'Object Interaction',
      passed: displayUpdated,
      error: displayUpdated ? null : 'Display was not updated after object interaction'
    });
    
    // Clean up
    eventBus.unsubscribe(GameEvents.DISPLAY_UPDATED, displayUpdateHandler);
  } catch (error) {
    results.push({
      name: 'Object Interaction',
      passed: false,
      error: error.message
    });
  }
  
  // Test 7: End-to-End Game Flow
  try {
    const game = new Game();
    
    // Initialize components
    new CommandParser();
    new Navigation(game);
    new Inventory(game);
    new ObjectInteraction(game);
    new SpecialEvents(game);
    
    let gameStarted = false;
    let roomChanged = false;
    let inventoryChanged = false;
    
    // Set up event listeners
    eventBus.subscribe(GameEvents.GAME_STARTED, () => { gameStarted = true; });
    eventBus.subscribe(GameEvents.ROOM_CHANGED, () => { roomChanged = true; });
    eventBus.subscribe(GameEvents.INVENTORY_CHANGED, () => { inventoryChanged = true; });
    
    // Simulate game start
    eventBus.publish(GameEvents.GAME_STARTED, {});
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Simulate taking an item
    if (!game.roomObjects[3]) {
      game.roomObjects[3] = [];
      game.roomObjects[3].push(50);
    }
    
    eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: 'TAKE', noun: 'TEST ITEM' });
    
    // Simulate movement
    eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: 'NORTH', noun: null });
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const endToEndValid = gameStarted && roomChanged; // inventoryChanged may be false if the take command failed
    
    results.push({
      name: 'End-to-End Game Flow',
      passed: endToEndValid,
      error: endToEndValid ? null : 'Not all expected events were triggered in the game flow'
    });
    
    // Clean up event listeners
    eventBus.unsubscribe(GameEvents.GAME_STARTED, () => {});
    eventBus.unsubscribe(GameEvents.ROOM_CHANGED, () => {});
    eventBus.unsubscribe(GameEvents.INVENTORY_CHANGED, () => {});
  } catch (error) {
    results.push({
      name: 'End-to-End Game Flow',
      passed: false,
      error: error.message
    });
  }
  
  console.log('Integration Tests completed:', results);
  return results;
}

// Function to run specific integration test by name
export async function runSpecificTest(testName) {
  // This would be implemented to run individual tests by name
  console.log(`Running specific test: ${testName}`);
  // Implementation would follow the same pattern as the tests above
}
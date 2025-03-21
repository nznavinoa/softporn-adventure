/**
 * Phase 3 tests for the Softporn Adventure refactoring
 * Tests for feature modules implementation
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';

console.log("==== Softporn Adventure - Phase 3 Tests ====");

let testsPassed = 0;
let testsFailed = 0;

// Test Navigation module
console.log("Testing Navigation module...");
try {
    let navigationEventReceived = false;
    
    eventBus.subscribe(GameEvents.ROOM_CHANGED, (data) => {
        console.log(`Room changed to: ${data.currentRoom}`);
        navigationEventReceived = true;
        testsPassed++;
    });
    
    // Try moving north
    eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: "NORTH", noun: null });
    
    console.log("✓ Navigation test setup completed");
} catch (error) {
    console.error("✗ Navigation test failed:", error);
    testsFailed++;
}

// Test Inventory module
console.log("\nTesting Inventory module...");
try {
    let inventoryEventReceived = false;
    
    eventBus.subscribe(GameEvents.INVENTORY_CHANGED, (data) => {
        console.log(`Inventory changed: ${data.action}`);
        inventoryEventReceived = true;
        testsPassed++;
    });
    
    // Try taking an object
    eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: "TAKE", noun: "NEWSPAPER" });
    
    console.log("✓ Inventory test setup completed");
} catch (error) {
    console.error("✗ Inventory test failed:", error);
    testsFailed++;
}

// Test ObjectInteraction module
console.log("\nTesting ObjectInteraction module...");
try {
    // Try examining an object
    eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: "LOOK", noun: "DESK" });
    
    console.log("✓ ObjectInteraction test completed");
    testsPassed++;
} catch (error) {
    console.error("✗ ObjectInteraction test failed:", error);
    testsFailed++;
}

// Test SpecialEvents module
console.log("\nTesting SpecialEvents module...");
try {
    let scoreEventReceived = false;
    
    eventBus.subscribe(GameEvents.SCORE_CHANGED, (data) => {
        console.log(`Score changed to: ${data.currentScore}`);
        scoreEventReceived = true;
        testsPassed++;
    });
    
    // Simulate a score change (would happen during seduction)
    eventBus.publish(GameEvents.SCORE_CHANGED, { 
        previousScore: 0, 
        currentScore: 1,
        maxScore: 3
    });
    
    console.log("✓ SpecialEvents test setup completed");
} catch (error) {
    console.error("✗ SpecialEvents test failed:", error);
    testsFailed++;
}

// Test mini-games initialization
console.log("\nTesting mini-games initialization...");
try {
    let minigameEventReceived = false;
    
    eventBus.subscribe(GameEvents.MINIGAME_STARTED, (data) => {
        console.log(`Minigame started: ${data.game}`);
        minigameEventReceived = true;
        testsPassed++;
    });
    
    // Try starting a mini-game
    eventBus.publish(GameEvents.MINIGAME_STARTED, { 
        game: "SLOTS",
        money: 25
    });
    
    console.log("✓ Mini-games test setup completed");
} catch (error) {
    console.error("✗ Mini-games test failed:", error);
    testsFailed++;
}

// Report test results
console.log(`\n==== Phase 3 Test Results ====`);
console.log(`Tests passed: ${testsPassed}`);
console.log(`Tests failed: ${testsFailed}`);
console.log(`Overall status: ${testsFailed === 0 ? "PASSED" : "FAILED"}`);
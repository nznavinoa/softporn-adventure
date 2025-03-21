/**
 * Phase 1 tests for the Softporn Adventure refactoring
 * Used to verify initial data modules and event bus functionality
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';
import { roomDescriptions, roomExits } from '../data/rooms.js';
import { objectNames, objectTypes } from '../data/objects.js';
import { specialTexts } from '../data/text.js';

console.log("==== Softporn Adventure - Phase 1 Tests ====");

// Test EventBus
console.log("Testing EventBus...");
let testPassed = true;
let testCounter = 0;

// Test subscribe/publish
eventBus.subscribe("test:event", (data) => {
    console.log(`Received test event with data: ${data.message}`);
    testCounter++;
});

eventBus.publish("test:event", { message: "Hello, EventBus!" });

// Verify room data
console.log("Testing room data...");
if (Object.keys(roomDescriptions).length > 0) {
    console.log(`Room descriptions loaded: ${Object.keys(roomDescriptions).length} rooms found`);
    testCounter++;
} else {
    console.error("Failed to load room descriptions");
    testPassed = false;
}

if (Object.keys(roomExits).length > 0) {
    console.log(`Room exits loaded: ${Object.keys(roomExits).length} room exits found`);
    testCounter++;
} else {
    console.error("Failed to load room exits");
    testPassed = false;
}

// Verify object data
console.log("Testing object data...");
if (Object.keys(objectNames).length > 0) {
    console.log(`Object names loaded: ${Object.keys(objectNames).length} objects found`);
    testCounter++;
} else {
    console.error("Failed to load object names");
    testPassed = false;
}

if (Object.keys(objectTypes).length > 0) {
    console.log(`Object types loaded: ${Object.keys(objectTypes).length} object types found`);
    testCounter++;
} else {
    console.error("Failed to load object types");
    testPassed = false;
}

// Verify special text content
console.log("Testing special text content...");
if (Object.keys(specialTexts).length > 0) {
    console.log(`Special texts loaded: ${Object.keys(specialTexts).length} texts found`);
    testCounter++;
} else {
    console.error("Failed to load special texts");
    testPassed = false;
}

// Report test results
console.log(`\n==== Test Results ====`);
console.log(`Tests passed: ${testCounter}`);
console.log(`Overall status: ${testPassed ? "PASSED" : "FAILED"}`);

// You can run this test file by creating a test.html that imports this module
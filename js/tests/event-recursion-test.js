/**
 * Special test for event recursion detection
 * Checks if there are infinite loops in the event system
 */

let eventBus;
let GameEvents;

// Try to import the real modules first
try {
  const mainModule = await import('../main.js');
  eventBus = mainModule.default;
  
  const eventsModule = await import('../core/GameEvents.js');
  GameEvents = eventsModule.GameEvents;
  
  console.log("Successfully imported actual modules for recursion test");
} catch (error) {
  console.warn("Falling back to mock modules for recursion test:", error);
  
  // Create a minimal mock if imports fail
  eventBus = {
    subscribers: {},
    subscribe(event, callback) {
      if (!this.subscribers[event]) {
        this.subscribers[event] = [];
      }
      this.subscribers[event].push(callback);
      return () => this.unsubscribe(event, callback);
    },
    publish(event, data) {
      if (!this.subscribers[event]) return;
      
      this.subscribers[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber for event ${event}:`, error);
        }
      });
    },
    unsubscribe(event, callback) {
      if (!this.subscribers[event]) return;
      this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
    }
  };
  
  GameEvents = {
    GAME_STARTED: 'game:started',
    GAME_INITIALIZED: 'game:initialized',
    TEST_RECURSION: 'test:recursion'
  };
}

/**
 * Test for event recursion
 * @returns {Object} Test result
 */
export function testEventRecursion() {
  console.log("Running event recursion test");
  
  try {
    // Counter to detect potential recursion
    let eventCount = 0;
    let maxAllowedEvents = 10; // Threshold for recursion detection
    let timedOut = false;
    
    // Set up a test event that could potentially recurse
    eventBus.subscribe(GameEvents.TEST_RECURSION, (data) => {
      eventCount++;
      console.log(`Test recursion event received (${eventCount}/${maxAllowedEvents})`);
      
      // Check if we've hit our recursion limit
      if (eventCount >= maxAllowedEvents) {
        console.warn("Potential recursion detected - stopping test");
        return;
      }
      
      // Re-publish the same event with the same data
      if (!data.stopRecursion) {
        console.log("Re-publishing recursion test event");
        eventBus.publish(GameEvents.TEST_RECURSION, data);
      }
    });
    
    // Set up a timeout to detect infinite loops
    const timeoutId = setTimeout(() => {
      timedOut = true;
      console.error("Recursion test timed out - potential infinite loop detected");
    }, 5000); // 5 second timeout
    
    // Start the recursion test
    eventBus.publish(GameEvents.TEST_RECURSION, { test: true });
    
    // Clean up the timeout
    clearTimeout(timeoutId);
    
    // Reset event bus by unsubscribing our test handler
    // This is important to prevent interference with other tests
    const subscribers = eventBus.subscribers[GameEvents.TEST_RECURSION] || [];
    subscribers.forEach(subscriber => {
      eventBus.unsubscribe(GameEvents.TEST_RECURSION, subscriber);
    });
    
    // Publish a final event to break any potential remaining loops
    eventBus.publish(GameEvents.TEST_RECURSION, { stopRecursion: true });
    
    // Check the results
    const recursionDetected = eventCount >= maxAllowedEvents || timedOut;
    
    return {
      name: 'Event Recursion Test',
      passed: !recursionDetected,
      error: recursionDetected ? 
        `Potential recursion detected: ${eventCount} events processed${timedOut ? ', test timed out' : ''}` : 
        null
    };
  } catch (error) {
    console.error("Error in recursion test:", error);
    return {
      name: 'Event Recursion Test',
      passed: false,
      error: `Test error: ${error.message}`
    };
  }
}

/**
 * Test game start event handling for recursion
 * @returns {Object} Test result
 */
export function testGameStartRecursion() {
  console.log("Testing game start event for recursion");
  
  try {
    let gameStartCount = 0;
    let maxAllowedStarts = 5;
    let startCompleted = false;
    
    // Test for recursion in Game.start()
    const Game = (await import('../core/Game.js')).default;
    const game = new Game();
    
    // Track game start events
    eventBus.subscribe(GameEvents.GAME_STARTED, () => {
      gameStartCount++;
      console.log(`Game start event received (${gameStartCount}/${maxAllowedStarts})`);
      
      if (gameStartCount >= maxAllowedStarts) {
        console.warn("Potential game start recursion detected");
      }
    });
    
    // Start the game
    console.log("Calling game.start()");
    game.start();
    startCompleted = true;
    
    // Check the results
    const recursionDetected = gameStartCount >= maxAllowedStarts;
    
    return {
      name: 'Game Start Recursion Test',
      passed: !recursionDetected && startCompleted,
      error: recursionDetected ? 
        `Game start recursion detected: ${gameStartCount} start events triggered` : 
        (!startCompleted ? "Game start failed to complete" : null)
    };
  } catch (error) {
    console.error("Error in game start recursion test:", error);
    return {
      name: 'Game Start Recursion Test',
      passed: false,
      error: `Test error: ${error.message}`
    };
  }
}

/**
 * Run all recursion tests
 * @returns {Array} Test results
 */
export async function runRecursionTests() {
  const results = [];
  
  // Basic event recursion test
  results.push(testEventRecursion());
  
  // Game start recursion test
  try {
    results.push(await testGameStartRecursion());
  } catch (error) {
    console.error("Error running game start recursion test:", error);
    results.push({
      name: 'Game Start Recursion Test',
      passed: false,
      error: `Failed to run test: ${error.message}`
    });
  }
  
  return results;
}

export default runRecursionTests;
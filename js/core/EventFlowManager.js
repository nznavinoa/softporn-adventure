/**
 * EventFlowManager - Monitors and validates event flow between modules
 * Used during development and testing to ensure proper communication
 */
import { GameEvents } from './GameEvents.js';

export default class EventFlowManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.eventLog = [];
    this.expectedFlows = this.defineExpectedFlows();
    this.isEnabled = false;
    
    // Set up event monitoring
    this.setupEventMonitoring();
  }
  
  /**
   * Enable event flow monitoring
   * @param {boolean} enabled - Whether monitoring is enabled
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`Event flow monitoring: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }
  
  /**
   * Set up monitoring of all game events
   */
  setupEventMonitoring() {
    // Create a wrapper around the eventBus.publish method to log all events
    const originalPublish = this.eventBus.publish;
    
    this.eventBus.publish = (event, data) => {
      // Call the original publish method
      const result = originalPublish.call(this.eventBus, event, data);
      
      // If monitoring is enabled, log the event
      if (this.isEnabled) {
        this.logEvent(event, data);
        this.validateEventFlow(event, data);
      }
      
      return result;
    };
  }
  
  /**
   * Log an event to the event history
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  logEvent(event, data) {
    this.eventLog.push({
      timestamp: Date.now(),
      event: event,
      data: JSON.parse(JSON.stringify(data || {}))
    });
    
    // Keep log size manageable
    if (this.eventLog.length > 1000) {
      this.eventLog.shift();
    }
    
    // Log to console in development mode
    console.log(`[EVENT] ${event}`, data);
  }
  
  /**
   * Define expected event flows for validation
   * @return {Object} Map of events to expected follow-up events
   */
  defineExpectedFlows() {
    // Define expected sequences of events
    return {
      // When a command is received, it should be processed
      [GameEvents.COMMAND_RECEIVED]: [
        GameEvents.COMMAND_PROCESSED
      ],
      
      // When a room changes, UI should be updated
      [GameEvents.ROOM_CHANGED]: [
        GameEvents.ROOM_DISPLAY_UPDATED,
        GameEvents.UI_REFRESH
      ],
      
      // When inventory changes, UI should be updated
      [GameEvents.INVENTORY_CHANGED]: [
        GameEvents.UI_REFRESH
      ],
      
      // Game over should lead to a dialog
      [GameEvents.GAME_OVER]: [
        GameEvents.UI_SHOW_DIALOG
      ],
      
      // Save game should be acknowledged
      [GameEvents.GAME_SAVE_REQUESTED]: [
        GameEvents.GAME_SAVED
      ],
      
      // Load game should be acknowledged
      [GameEvents.GAME_LOAD_REQUESTED]: [
        GameEvents.GAME_LOADED
      ]
      
      // Add more expected flows as needed
    };
  }
  
  /**
   * Validate that events follow expected flow
   * @param {string} event - Current event
   * @param {Object} data - Event data
   */
  validateEventFlow(event, data) {
    // Check if this event has expected follow-up events
    const expectedFollowUps = this.expectedFlows[event];
    if (!expectedFollowUps) return;
    
    // Set a timeout to check if the expected events occurred
    setTimeout(() => {
      // Get events that happened after this one
      const currentIndex = this.eventLog.findIndex(e => e.event === event);
      if (currentIndex === -1) return;
      
      const subsequentEvents = this.eventLog
        .slice(currentIndex + 1)
        .map(e => e.event);
      
      // Check if any expected events are missing
      const missingEvents = expectedFollowUps.filter(
        expectedEvent => !subsequentEvents.includes(expectedEvent)
      );
      
      if (missingEvents.length > 0) {
        console.warn(`[EVENT FLOW WARNING] After ${event}, expected events not found: ${missingEvents.join(', ')}`);
      }
    }, 500); // Wait 500ms for follow-up events
  }
  
  /**
   * Get recent event history
   * @param {number} count - Number of events to retrieve
   * @return {Array} Recent events
   */
  getRecentEvents(count = 10) {
    return this.eventLog.slice(-count);
  }
  
  /**
   * Clear the event log
   */
  clearEventLog() {
    this.eventLog = [];
    console.log('Event log cleared');
  }
  
  /**
   * Get events of a specific type
   * @param {string} eventType - Type of event to filter for
   * @return {Array} Matching events
   */
  getEventsByType(eventType) {
    return this.eventLog.filter(entry => entry.event === eventType);
  }
  
  /**
   * Analyze event flow for common patterns and issues
   * @return {Object} Analysis results
   */
  analyzeEventFlow() {
    const analysis = {
      totalEvents: this.eventLog.length,
      eventCounts: {},
      potentialIssues: []
    };
    
    // Count occurrences of each event type
    this.eventLog.forEach(entry => {
      if (!analysis.eventCounts[entry.event]) {
        analysis.eventCounts[entry.event] = 0;
      }
      analysis.eventCounts[entry.event]++;
    });
    
    // Look for potential issues
    
    // 1. Check for unpaired events (like GAME_SAVE_REQUESTED without GAME_SAVED)
    Object.entries(this.expectedFlows).forEach(([triggerEvent, expectedEvents]) => {
      const triggerCount = analysis.eventCounts[triggerEvent] || 0;
      
      expectedEvents.forEach(expectedEvent => {
        const followUpCount = analysis.eventCounts[expectedEvent] || 0;
        
        if (triggerCount > 0 && followUpCount < triggerCount) {
          analysis.potentialIssues.push({
            type: 'unpaired_events',
            message: `Event ${triggerEvent} (${triggerCount} times) not always followed by ${expectedEvent} (${followUpCount} times)`
          });
        }
      });
    });
    
    // 2. Check for excessive events that might indicate infinite loops
    Object.entries(analysis.eventCounts).forEach(([event, count]) => {
      // More than 100 of the same event might indicate a problem
      if (count > 100) {
        analysis.potentialIssues.push({
          type: 'excessive_events',
          message: `Excessive occurrence of event ${event} (${count} times)`
        });
      }
    });
    
    return analysis;
  }
}
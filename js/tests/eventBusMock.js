/**
 * Mock EventBus for testing
 * This provides a minimal implementation of the EventBus for testing purposes
 * when the actual EventBus cannot be imported.
 */

export default class EventBusMock {
    constructor() {
        this.subscribers = {};
        this.debugMode = false;
    }
    
    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {function} callback - Function to call when event occurs
     * @return {function} Unsubscribe function
     */
    subscribe(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
        
        // Return unsubscribe function
        return () => this.unsubscribe(event, callback);
    }
    
    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {function} callback - Function to remove
     */
    unsubscribe(event, callback) {
        if (!this.subscribers[event]) return;
        
        this.subscribers[event] = this.subscribers[event]
            .filter(subscriber => subscriber !== callback);
    }
    
    /**
     * Publish an event
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    publish(event, data) {
        if (this.debugMode) {
            console.log(`[EventBus Mock] Event: ${event}`, data);
        }
        
        if (!this.subscribers[event]) return;
        
        this.subscribers[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in subscriber for event ${event}:`, error);
            }
        });
    }
    
    /**
     * Toggle debug mode
     * @param {boolean} enabled - Whether debug mode is enabled
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}

// Create and export a singleton instance
const eventBusMock = new EventBusMock();
export { eventBusMock };

// Export mock GameEvents constants
export const GameEventsMock = {
    // Core game events
    GAME_INITIALIZED: 'game:initialized',
    GAME_STARTED: 'game:started',
    GAME_OVER: 'game:over',
    SCORE_CHANGED: 'game:score-changed',
    MONEY_CHANGED: 'game:money-changed',
    
    // Room events
    ROOM_CHANGED: 'room:changed',
    ROOM_OBJECTS_CHANGED: 'room:objects-changed',
    
    // Inventory events
    INVENTORY_CHANGED: 'inventory:changed',
    ITEM_ADDED: 'inventory:item-added',
    ITEM_REMOVED: 'inventory:item-removed',
    
    // Command events
    COMMAND_RECEIVED: 'command:received',
    COMMAND_PROCESSED: 'command:processed',
    COMMAND_ERROR: 'command:error',
    
    // Display events
    DISPLAY_TEXT: 'display:text',
    DISPLAY_ERROR: 'display:error',
    DISPLAY_UPDATED: 'display:updated',
    
    // UI events
    UI_REFRESH: 'ui:refresh',
    UI_SHOW_DIALOG: 'ui:show-dialog',
    UI_HIDE_DIALOG: 'ui:hide-dialog',
    
    // Error events
    SYSTEM_ERROR: 'error:system',
    
    // State events  
    STATE_VALIDATED: 'state:validated',
    STATE_VALIDATION_FAILED: 'state:validation-failed',
    
    // Performance events
    PERFORMANCE_WARNING: 'performance:warning'
};
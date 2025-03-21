/**
 * EventBus - Central communication system for the game
 * Enables modules to communicate without direct dependencies
 */
export default class EventBus {
    constructor() {
        console.log("EventBus constructor called");
        this.subscribers = {};
        this.debugMode = false;
        console.log("EventBus initialized");
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
        
        if (this.debugMode) {
            console.log(`[EventBus] Subscribed to: ${event}`);
        }
        
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
        
        if (this.debugMode) {
            console.log(`[EventBus] Unsubscribed from: ${event}`);
        }
    }

    /**
     * Publish an event
     * @param {string} event - Event name
     * @param {any} data - Event data
     * @return {any} Return value from the last event handler, if any
     */
    publish(event, data) {
        if (this.debugMode) {
            console.log(`[EventBus] Publishing: ${event}`, data);
        }
        
        if (!this.subscribers[event]) return null;
        
        let returnValue = null;
        
        this.subscribers[event].forEach(callback => {
            try {
                const result = callback(data);
                // Store the result from the last callback (useful for query events)
                returnValue = result;
            } catch (error) {
                console.error(`[EventBus] Error in subscriber for event ${event}:`, error);
                
                // If we're debugging, show the stack trace
                if (this.debugMode) {
                    console.error(error.stack);
                }
            }
        });
        
        return returnValue;
    }

    /**
     * Toggle debug mode
     * @param {boolean} enabled - Whether debug mode is enabled
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
        console.log(`[EventBus] Debug mode: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    }
}
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
        const maxIterations = 10; // Prevent potential infinite loops
        let iterationCount = 0;
        
        if (this.debugMode) {
            console.log(`[EventBus] Publishing event: ${event}`, data);
        }
        
        if (!this.subscribers[event]) {
            if (this.debugMode) {
                console.log(`[EventBus] No subscribers found for: ${event}`);
            }
            return null;
        }
        
        let returnValue = null;
        
        // Clone subscribers to prevent modification during iteration
        const subscribersCopy = [...this.subscribers[event]];
        
        for (const callback of subscribersCopy) {
            if (iterationCount >= maxIterations) {
                console.warn(`[EventBus] Maximum event iteration limit reached for ${event}`);
                break;
            }
            
            try {
                const result = callback(data);
                returnValue = result;
                iterationCount++;
                
                if (this.debugMode) {
                    console.log(`[EventBus] Callback ${iterationCount} executed for ${event}`);
                }
            } catch (error) {
                console.error(`[EventBus] Error in subscriber for event ${event}:`, error);
                
                if (this.debugMode) {
                    console.error(error.stack);
                }
            }
        }
        
        if (this.debugMode) {
            console.log(`[EventBus] Finished publishing ${event} (${iterationCount} callbacks)`);
        }
        
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
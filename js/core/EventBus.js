/**
 * EventBus - Central communication system for the game
 * Enables modules to communicate without direct dependencies
 */
export default class EventBus {
    constructor() {
        console.log("EventBus constructor called");
        this.subscribers = {};
        this.debugMode = false;
        
        // FIX: Add event tracking to detect recursion
        this.activeEvents = new Set();
        this.maxRecursionDepth = 10;
        this.eventCounts = {};
        
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
        // FIX: Add recursion detection
        if (this.activeEvents.has(event)) {
            if (!this.eventCounts[event]) {
                this.eventCounts[event] = 0;
            }
            this.eventCounts[event]++;
            
            if (this.eventCounts[event] > this.maxRecursionDepth) {
                console.error(`[EventBus] Maximum recursion depth reached for event: ${event}. Stopping recursion.`);
                return null;
            }
        } else {
            this.activeEvents.add(event);
            this.eventCounts[event] = 1;
        }
        
        const maxIterations = 10; // Prevent potential infinite loops
        let iterationCount = 0;
        
        if (this.debugMode) {
            console.log(`[EventBus] Publishing event: ${event}`, data);
        }
        
        if (!this.subscribers[event]) {
            if (this.debugMode) {
                console.log(`[EventBus] No subscribers found for: ${event}`);
            }
            this.activeEvents.delete(event);
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
        
        this.activeEvents.delete(event);
        
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
    
    /**
     * FIX: Reset event tracking
     */
    reset() {
        this.activeEvents.clear();
        this.eventCounts = {};
        console.log("[EventBus] Event tracking reset");
    }
    
    /**
     * FIX: Get event statistics
     * @return {Object} Event statistics
     */
    getEventStats() {
        return {
            subscriberCount: Object.keys(this.subscribers).reduce((total, event) => total + this.subscribers[event].length, 0),
            eventTypes: Object.keys(this.subscribers).length,
            eventCounts: { ...this.eventCounts }
        };
    }
}
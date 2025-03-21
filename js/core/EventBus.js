/**
 * EventBus - Central communication system for the game
 * Enables modules to communicate without direct dependencies
 */
export default class EventBus {
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
            console.log(`[EventBus] Event: ${event}`, data);
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
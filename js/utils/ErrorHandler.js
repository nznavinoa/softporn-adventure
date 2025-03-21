/**
 * ErrorHandler - Centralized error handling for the game
 * Provides consistent error reporting, logging, and recovery
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';

export default class ErrorHandler {
    constructor() {
        this.errorLog = [];
        this.maxLogLength = 50;
        this.debugMode = false;
        
        // Install global error handlers
        this.setupGlobalHandlers();
        
        // Subscribe to events
        this.setupEventListeners();
    }
    
    /**
     * Set up global error handlers
     */
    setupGlobalHandlers() {
        // Override console.error to capture errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            // Log to our internal system
            this.logError('CONSOLE', args.join(' '));
            
            // Call original console.error
            originalConsoleError.apply(console, args);
        };
        
        // Set up window error handler
        window.addEventListener('error', (event) => {
            this.logError('WINDOW', `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
            
            // Publish error event
            eventBus.publish(GameEvents.SYSTEM_ERROR, {
                source: 'window',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Set up unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.logError('PROMISE', event.reason?.message || 'Unhandled promise rejection');
            
            // Publish error event
            eventBus.publish(GameEvents.SYSTEM_ERROR, {
                source: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason
            });
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        eventBus.subscribe(GameEvents.COMMAND_ERROR, (data) => {
            this.handleCommandError(data);
        });
        
        eventBus.subscribe(GameEvents.SYSTEM_ERROR, (data) => {
            // System errors are already logged by the global handlers
            // But we can add additional handling here if needed
            this.displayErrorToUser(data);
        });
        
        eventBus.subscribe(GameEvents.SAVE_ERROR, (data) => {
            this.handleSaveError(data);
        });
        
        eventBus.subscribe(GameEvents.LOAD_ERROR, (data) => {
            this.handleLoadError(data);
        });
    }
    
    /**
     * Log an error to the internal log
     * @param {string} source - Error source
     * @param {string} message - Error message
     * @param {Object} details - Additional error details
     */
    logError(source, message, details = null) {
        const timestamp = new Date().toISOString();
        const error = {
            timestamp,
            source,
            message,
            details
        };
        
        // Add to log with limit
        this.errorLog.unshift(error);
        if (this.errorLog.length > this.maxLogLength) {
            this.errorLog.pop();
        }
        
        // Log to console in debug mode
        if (this.debugMode) {
            console.log(`[ERROR] ${source}: ${message}`);
            if (details) console.log(details);
        }
    }
    
    /**
     * Handle command parsing or execution errors
     * @param {Object} data - Error data
     */
    handleCommandError(data) {
        this.logError('COMMAND', data.message, data.details);
        
        // Display error message to user
        eventBus.publish(GameEvents.DISPLAY_ERROR, {
            message: data.message || 'Error processing command',
            command: data.command
        });
    }
    
    /**
     * Handle save errors
     * @param {Object} data - Error data
     */
    handleSaveError(data) {
        this.logError('SAVE', data.message, data.details);
        
        // Display error message to user
        eventBus.publish(GameEvents.DISPLAY_ERROR, {
            message: data.message || 'Error saving game',
            saveSlot: data.slot
        });
    }
    
    /**
     * Handle load errors
     * @param {Object} data - Error data
     */
    handleLoadError(data) {
        this.logError('LOAD', data.message, data.details);
        
        // Display error message to user
        eventBus.publish(GameEvents.DISPLAY_ERROR, {
            message: data.message || 'Error loading game',
            saveSlot: data.slot
        });
    }
    
    /**
     * Display an error message to the user
     * @param {Object} errorData - Error information
     */
    displayErrorToUser(errorData) {
        const message = errorData.message || 'An error occurred';
        
        // Publish display event
        eventBus.publish(GameEvents.DISPLAY_ERROR, {
            message: message,
            source: errorData.source,
            recoverable: errorData.recoverable || false
        });
        
        // Also show dialog for serious errors
        if (errorData.serious) {
            eventBus.publish(GameEvents.UI_SHOW_DIALOG, {
                title: 'Error',
                content: `A serious error has occurred: ${message}`,
                buttons: [
                    { 
                        text: 'Continue', 
                        id: 'error-continue',
                        callback: () => {
                            // Continue gameplay
                        } 
                    }
                ]
            });
        }
    }
    
    /**
     * Check if an error is recoverable and provide recovery options
     * @param {string} errorType - Type of error
     * @param {Object} errorData - Error information
     * @return {Object} Recovery options
     */
    getRecoveryOptions(errorType, errorData) {
        switch (errorType) {
            case 'COMMAND':
                return {
                    recoverable: true,
                    action: 'ignore',
                    message: 'You can try a different command.'
                };
                
            case 'SAVE':
                return {
                    recoverable: true,
                    action: 'retry',
                    message: 'Would you like to try saving again?'
                };
                
            case 'LOAD':
                return {
                    recoverable: true,
                    action: 'continue',
                    message: 'Continue playing without loading.'
                };
                
            case 'SYSTEM':
                // System errors might not be recoverable
                return {
                    recoverable: false,
                    action: 'refresh',
                    message: 'Please refresh the page to restart the game.'
                };
                
            default:
                return {
                    recoverable: false,
                    action: 'continue',
                    message: 'Try to continue playing.'
                };
        }
    }
    
    /**
     * Get the error log for debugging
     * @return {Array} Error log
     */
    getErrorLog() {
        return [...this.errorLog];
    }
    
    /**
     * Clear the error log
     */
    clearErrorLog() {
        this.errorLog = [];
    }
    
    /**
     * Enable or disable debug mode
     * @param {boolean} enabled - Whether debug mode is enabled
     */
    setDebugMode(enabled) {
        this.debugMode = enabled;
    }
}
/**
 * GameEvents - Constants for all game events
 * Using namespaced event names for better organization
 */
export const GameEvents = {
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
    
    // UI events
    UI_REFRESH: 'ui:refresh',
    DISPLAY_UPDATED: 'ui:display-updated',
    
    // Mini-game events
    MINIGAME_STARTED: 'minigame:started',
    MINIGAME_ENDED: 'minigame:ended',
    
    // Save/Load events
    GAME_SAVED: 'save:completed',
    GAME_LOADED: 'load:completed'
};
// js/core/GameEvents.js

/**
 * Constants for all game events
 * Using namespaced pattern: 'category:action'
 */
export const GameEvents = {
    // Core game events
    GAME_INITIALIZED: 'game:initialized',
    GAME_STARTED: 'game:started',
    GAME_OVER: 'game:over',
    GAME_COMPLETED: 'game:completed',
    SCORE_CHANGED: 'game:score-changed',
    MONEY_CHANGED: 'game:money-changed',
    
    // Room events
    ROOM_CHANGED: 'room:changed',
    ROOM_OBJECTS_CHANGED: 'room:objects-changed',
    ROOM_DISPLAY_UPDATED: 'room:display-updated',
    GET_ROOM_OBJECTS: 'room:get-objects',
    ROOM_OBJECT_ADD_REQUESTED: 'room:object-add-requested',
    ROOM_OBJECT_REMOVE_REQUESTED: 'room:object-remove-requested',
    GET_AVAILABLE_DIRECTIONS: 'room:get-directions',
    DIRECTION_AVAILABLE: 'room:direction-available',
    DIRECTION_UNAVAILABLE: 'room:direction-unavailable',
    
    // Inventory events
    INVENTORY_CHANGED: 'inventory:changed',
    ITEM_ADDED: 'inventory:item-added',
    ITEM_REMOVED: 'inventory:item-removed',
    GET_INVENTORY: 'inventory:get',
    IS_IN_INVENTORY: 'inventory:is-in',
    INVENTORY_ADD_REQUESTED: 'inventory:add-requested',
    INVENTORY_REMOVE_REQUESTED: 'inventory:remove-requested',
    INVENTORY_DISPLAYED: 'inventory:displayed',
    
    // Object events
    OBJECT_INTERACTION: 'object:interaction',
    OBJECT_EXAMINED: 'object:examined',
    OBJECT_USED: 'object:used',
    OBJECT_OPENED: 'object:opened',
    OBJECT_TAKEN: 'object:taken',
    OBJECT_DROPPED: 'object:dropped',
    ITEM_USAGE_RECORDED: 'object:usage-recorded',
    
    // Command events
    COMMAND_RECEIVED: 'command:received',
    COMMAND_PROCESSED: 'command:processed',
    COMMAND_ERROR: 'command:error',
    
    // Character events
    CHARACTER_INTERACTION: 'character:interaction',
    CHARACTER_STATE_CHANGED: 'character:state-changed',
    
    // Display events
    DISPLAY_TEXT: 'display:text',
    DISPLAY_ROOM: 'display:room',
    DISPLAY_ERROR: 'display:error',
    DISPLAY_SYSTEM: 'display:system',
    DISPLAY_UPDATED: 'display:updated',
    
    // UI events
    UI_REFRESH: 'ui:refresh',
    UI_SHOW_DIALOG: 'ui:show-dialog',
    UI_HIDE_DIALOG: 'ui:hide-dialog',
    UI_UPDATE_BUTTONS: 'ui:update-buttons',
    
    // Mini-game events
    MINIGAME_STARTED: 'minigame:started',
    MINIGAME_ENDED: 'minigame:ended',
    MINIGAME_STATE_CHANGED: 'minigame:state-changed',
    
    // Save/Load events
    GAME_SAVED: 'save:completed',
    GAME_LOADED: 'load:completed',
    GAME_SAVE_REQUESTED: 'save:requested',
    GAME_LOAD_REQUESTED: 'load:requested',
    SAVE_ERROR: 'save:error',
    LOAD_ERROR: 'save:load-error',
    SAVE_SLOTS_UPDATED: 'save:slots-updated'
};
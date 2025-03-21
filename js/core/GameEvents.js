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
    SCORE_CHANGED: 'game:score-changed',
    MONEY_CHANGED: 'game:money-changed',
    
    // Room events
    ROOM_CHANGED: 'room:changed',
    ROOM_OBJECTS_CHANGED: 'room:objects-changed',
    ROOM_DISPLAY_UPDATED: 'room:display-updated',
    GET_ROOM_OBJECTS: 'room:get-objects',
    
    // Inventory events
    INVENTORY_CHANGED: 'inventory:changed',
    ITEM_ADDED: 'inventory:item-added',
    ITEM_REMOVED: 'inventory:item-removed',
    GET_INVENTORY: 'inventory:get',
    IS_IN_INVENTORY: 'inventory:is-in',
    
    // Command events
    COMMAND_RECEIVED: 'command:received',
    COMMAND_PROCESSED: 'command:processed',
    COMMAND_ERROR: 'command:error',
    
    // Direction events
    DIRECTION_AVAILABLE: 'direction:available',
    DIRECTION_UNAVAILABLE: 'direction:unavailable',
    
    // Display events
    DISPLAY_TEXT: 'display:text',
    DISPLAY_ROOM: 'display:room',
    DISPLAY_ERROR: 'display:error',
    DISPLAY_SYSTEM: 'display:system',
    
    // UI events
    UI_REFRESH: 'ui:refresh',
    UI_SHOW_DIALOG: 'ui:show-dialog',
    UI_HIDE_DIALOG: 'ui:hide-dialog',
    UI_UPDATE_BUTTONS: 'ui:update-buttons',
    
    // Image events
    IMAGE_LOADED: 'image:loaded',
    IMAGE_ERROR: 'image:error',
    IMAGE_LOADING_COMPLETE: 'image:loading-complete',
    
    // Mini-game events
    MINIGAME_STARTED: 'minigame:started',
    MINIGAME_ENDED: 'minigame:ended',
    MINIGAME_STATE_CHANGED: 'minigame:state-changed',
    
    // Save/Load events
    GAME_SAVED: 'save:completed',
    GAME_LOADED: 'load:completed',
    SAVE_ERROR: 'save:error',
    LOAD_ERROR: 'load:error',
    
    // Animation events
    ANIMATION_STARTED: 'animation:started',
    ANIMATION_ENDED: 'animation:ended',
    
    // Special interaction events
    SPECIAL_EVENT_TRIGGERED: 'special:triggered',
    CHARACTER_INTERACTION: 'character:interaction',
    
    // Media events
    SOUND_PLAY: 'sound:play',
    SOUND_STOP: 'sound:stop',
    MUSIC_PLAY: 'music:play',
    MUSIC_STOP: 'music:stop'
  };
/**
 * SaveManager - Handles saving and loading game state
 * Uses localStorage for persistent game saves
 */
import eventBus from '../main.js';
import { GameEvents } from './GameEvents.js';

export default class SaveManager {
    constructor(game) {
        this.game = game;
        this.saveSlots = 5; // Number of available save slots
        this.autoSaveEnabled = true;
        this.savePrefix = 'softporn_adventure_';
        this.saveVersion = '1.0'; // Version for save compatibility
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventBus.subscribe(GameEvents.GAME_SAVE_REQUESTED, (data) => this.saveGame(data.slot));
        eventBus.subscribe(GameEvents.GAME_LOAD_REQUESTED, (data) => this.loadGame(data.slot));
    }
    
    // Save game to a specific slot
    saveGame(slot = 'auto') {
        try {
            // Get the current game state
            const gameState = this.getGameState();
            
            // Add metadata
            const saveData = {
                version: this.saveVersion,
                timestamp: new Date().toISOString(),
                slot: slot,
                state: gameState
            };
            
            // Serialize and save to localStorage
            const saveKey = this.getSaveKey(slot);
            localStorage.setItem(saveKey, JSON.stringify(saveData));
            
            // Update save slots info
            this.updateSaveSlotsInfo();
            
            // Notify success
            eventBus.publish(GameEvents.GAME_SAVED, {
                success: true,
                slot: slot,
                timestamp: saveData.timestamp
            });
            
            return true;
        } catch (error) {
            console.error("Error saving game:", error);
            
            // Notify failure
            eventBus.publish(GameEvents.GAME_SAVED, {
                success: false,
                error: error.message
            });
            
            return false;
        }
    }
    
    // Load game from a specific slot
    loadGame(slot = 'auto') {
        try {
            // Get the save data from localStorage
            const saveKey = this.getSaveKey(slot);
            const saveDataString = localStorage.getItem(saveKey);
            
            if (!saveDataString) {
                throw new Error(`No save found in slot ${slot}`);
            }
            
            // Parse the save data
            const saveData = JSON.parse(saveDataString);
            
            // Check version compatibility
            if (saveData.version !== this.saveVersion) {
                console.warn(`Save version mismatch. Expected ${this.saveVersion}, got ${saveData.version}`);
                // We could implement migration logic here if needed
            }
            
            // Apply the game state
            this.setGameState(saveData.state);
            
            // Notify success
            eventBus.publish(GameEvents.GAME_LOADED, {
                success: true,
                slot: slot,
                timestamp: saveData.timestamp
            });
            
            return true;
        } catch (error) {
            console.error("Error loading game:", error);
            
            // Notify failure
            eventBus.publish(GameEvents.GAME_LOADED, {
                success: false,
                error: error.message
            });
            
            return false;
        }
    }
    
    // Perform an automatic save
    autoSave() {
        if (this.autoSaveEnabled) {
            return this.saveGame('auto');
        }
        return false;
    }
    
    // Get the current game state
    getGameState() {
        // Extract relevant state from the game object
        return {
            score: this.game.score,
            money: this.game.money,
            currentRoom: this.game.currentRoom,
            gameOver: this.game.gameOver,
            flags: { ...this.game.flags },
            rubberProperties: { ...this.game.rubberProperties },
            inventory: [...this.game.inventory],
            roomObjects: JSON.parse(JSON.stringify(this.game.roomObjects))
        };
    }
    
    // Set the game state from loaded data
    setGameState(state) {
        // Apply the loaded state to the game object
        this.game.score = state.score;
        this.game.money = state.money;
        this.game.currentRoom = state.currentRoom;
        this.game.gameOver = state.gameOver;
        this.game.flags = { ...state.flags };
        this.game.rubberProperties = { ...state.rubberProperties };
        this.game.inventory = [...state.inventory];
        this.game.roomObjects = JSON.parse(JSON.stringify(state.roomObjects));
        
        // Refresh the game display after loading
        this.game.displayRoom();
    }
    
    // Get the save slot key
    getSaveKey(slot) {
        return `${this.savePrefix}${slot}`;
    }
    
    // Get information about all save slots
    getSaveSlotInfo() {
        const slotInfo = {};
        
        // Get auto save info
        const autoSaveKey = this.getSaveKey('auto');
        const autoSaveData = localStorage.getItem(autoSaveKey);
        if (autoSaveData) {
            try {
                const parsedData = JSON.parse(autoSaveData);
                slotInfo.auto = {
                    exists: true,
                    timestamp: parsedData.timestamp,
                    score: parsedData.state.score,
                    room: parsedData.state.currentRoom
                };
            } catch (e) {
                slotInfo.auto = { exists: false };
            }
        } else {
            slotInfo.auto = { exists: false };
        }
        
        // Get numbered slots info
        for (let i = 1; i <= this.saveSlots; i++) {
            const slotKey = this.getSaveKey(i);
            const slotData = localStorage.getItem(slotKey);
            
            if (slotData) {
                try {
                    const parsedData = JSON.parse(slotData);
                    slotInfo[i] = {
                        exists: true,
                        timestamp: parsedData.timestamp,
                        score: parsedData.state.score,
                        room: parsedData.state.currentRoom
                    };
                } catch (e) {
                    slotInfo[i] = { exists: false };
                }
            } else {
                slotInfo[i] = { exists: false };
            }
        }
        
        return slotInfo;
    }
    
    // Update save slots info and publish event
    updateSaveSlotsInfo() {
        const slotInfo = this.getSaveSlotInfo();
        
        eventBus.publish(GameEvents.SAVE_SLOTS_UPDATED, {
            slots: slotInfo
        });
    }
    
    // Clear all saves (useful for testing or reset)
    clearAllSaves() {
        try {
            // Clear auto save
            localStorage.removeItem(this.getSaveKey('auto'));
            
            // Clear numbered slots
            for (let i = 1; i <= this.saveSlots; i++) {
                localStorage.removeItem(this.getSaveKey(i));
            }
            
            // Update save slots info
            this.updateSaveSlotsInfo();
            
            return true;
        } catch (error) {
            console.error("Error clearing saves:", error);
            return false;
        }
    }
}
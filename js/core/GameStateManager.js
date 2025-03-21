/**
 * GameStateManager - Centralizes game state management
 * Handles state updates, provides access methods, and ensures state consistency
 */
import eventBus from '../main.js';
import { GameEvents } from './GameEvents.js';

export default class GameStateManager {
    constructor(game) {
        this.game = game;
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventBus.subscribe(GameEvents.GAME_INITIALIZED, () => {
            this.broadcastAllState();
        });
        
        eventBus.subscribe(GameEvents.GAME_STARTED, () => {
            this.broadcastAllState();
        });
        
        eventBus.subscribe(GameEvents.GAME_LOADED, () => {
            this.broadcastAllState();
        });
        
        // Listen for specific state query events
        eventBus.subscribe(GameEvents.GET_ROOM_OBJECTS, (data) => {
            // Get objects for the specified room or current room
            const roomId = data?.roomId || this.game.currentRoom;
            return this.game.roomObjects[roomId] || [];
        });
        
        eventBus.subscribe(GameEvents.GET_INVENTORY, () => {
            return [...this.game.inventory];
        });
        
        eventBus.subscribe(GameEvents.IS_IN_INVENTORY, (data) => {
            return this.game.isObjectInInventory(data.objectId);
        });
        
        eventBus.subscribe(GameEvents.GET_AVAILABLE_DIRECTIONS, () => {
            return this.game.getAvailableDirections();
        });
    }
    
    /**
     * Broadcast all game state to update UI and other modules
     */
    broadcastAllState() {
        // Score update
        eventBus.publish(GameEvents.SCORE_CHANGED, {
            currentScore: this.game.score,
            maxScore: 3
        });
        
        // Money update
        eventBus.publish(GameEvents.MONEY_CHANGED, {
            currentAmount: this.game.money
        });
        
        // Room update
        eventBus.publish(GameEvents.ROOM_CHANGED, {
            currentRoom: this.game.currentRoom,
            roomName: this.game.roomDescriptions[this.game.currentRoom] || `ROOM ${this.game.currentRoom}`,
            availableDirections: this.game.getAvailableDirections(),
            roomObjects: this.game.roomObjects[this.game.currentRoom] || []
        });
        
        // Inventory update
        eventBus.publish(GameEvents.INVENTORY_CHANGED, {
            action: 'refresh',
            inventory: [...this.game.inventory]
        });
        
        // Update UI elements
        eventBus.publish(GameEvents.UI_REFRESH, {
            type: 'allState',
            score: this.game.score,
            money: this.game.money,
            room: this.game.currentRoom,
            inventory: [...this.game.inventory]
        });
    }
    
    /**
     * Update the game score
     * @param {number} newScore - New score value
     */
    updateScore(newScore) {
        const oldScore = this.game.score;
        this.game.score = newScore;
        
        eventBus.publish(GameEvents.SCORE_CHANGED, {
            previousScore: oldScore,
            currentScore: newScore,
            maxScore: 3
        });
    }
    
    /**
     * Update money amount
     * @param {number} newAmount - New money value
     */
    updateMoney(newAmount) {
        const oldAmount = this.game.money;
        this.game.money = newAmount;
        
        eventBus.publish(GameEvents.MONEY_CHANGED, {
            previousAmount: oldAmount,
            currentAmount: newAmount
        });
    }
    
    /**
     * Update a game flag
     * @param {string} flagName - Name of the flag to update
     * @param {any} value - New value for the flag
     */
    updateFlag(flagName, value) {
        if (this.game.flags.hasOwnProperty(flagName)) {
            const oldValue = this.game.flags[flagName];
            this.game.flags[flagName] = value;
            
            eventBus.publish(GameEvents.GAME_FLAG_CHANGED, {
                flag: flagName,
                previousValue: oldValue,
                currentValue: value
            });
        }
    }
    
    /**
     * Get current state of all game flags
     * @return {Object} Current flags
     */
    getAllFlags() {
        return { ...this.game.flags };
    }
    
    /**
     * Get value of a specific flag
     * @param {string} flagName - Name of the flag
     * @return {any} Flag value
     */
    getFlag(flagName) {
        return this.game.flags[flagName];
    }
    
    /**
     * Get complete serializable game state
     * @return {Object} Full game state
     */
    getFullState() {
        return {
            score: this.game.score,
            money: this.game.money,
            currentRoom: this.game.currentRoom,
            gameOver: this.game.gameOver,
            flags: { ...this.game.flags },
            rubberProperties: { ...this.game.rubberProperties },
            inventory: [...this.game.inventory],
            roomObjects: JSON.parse(JSON.stringify(this.game.roomObjects)),
            phoneCallDetails: this.game.phoneCallDetails ? { ...this.game.phoneCallDetails } : null,
            telephoneRinging: this.game.telephoneRinging || false,
            phoneCallQA: this.game.phoneCallQA || false
        };
    }
    
    /**
     * Set complete game state (used during loading)
     * @param {Object} state - Complete game state
     */
    setFullState(state) {
        // Apply state to game object
        this.game.score = state.score;
        this.game.money = state.money;
        this.game.currentRoom = state.currentRoom;
        this.game.gameOver = state.gameOver;
        
        // Deep copy objects to avoid reference issues
        this.game.flags = { ...state.flags };
        this.game.rubberProperties = { ...state.rubberProperties };
        this.game.inventory = [...state.inventory];
        this.game.roomObjects = JSON.parse(JSON.stringify(state.roomObjects));
        
        // Optional properties
        if (state.phoneCallDetails) {
            this.game.phoneCallDetails = { ...state.phoneCallDetails };
        }
        this.game.telephoneRinging = state.telephoneRinging || false;
        this.game.phoneCallQA = state.phoneCallQA || false;
        
        // Broadcast the updated state
        this.broadcastAllState();
    }
    
    /**
     * Validate game state for consistency
     * @return {Object} Validation result with any issues found
     */
    validateState() {
        const issues = [];
        
        // Check for basic state validity
        if (typeof this.game.score !== 'number') {
            issues.push('Invalid score type');
        }
        
        if (typeof this.game.money !== 'number') {
            issues.push('Invalid money type');
        }
        
        if (typeof this.game.currentRoom !== 'number') {
            issues.push('Invalid current room type');
        }
        
        // Check inventory validity (should only contain numbers)
        if (!Array.isArray(this.game.inventory)) {
            issues.push('Inventory is not an array');
        } else {
            const invalidItems = this.game.inventory.filter(item => typeof item !== 'number');
            if (invalidItems.length > 0) {
                issues.push('Inventory contains invalid items');
            }
        }
        
        // Check room objects validity
        if (typeof this.game.roomObjects !== 'object') {
            issues.push('Room objects is not an object');
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }
}
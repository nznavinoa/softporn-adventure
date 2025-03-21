/**
 * GameIntegration - Handles integration between game modules
 * Coordinates interactions between navigation, inventory, objects, and special events
 * 
 * This module acts as a central coordinator to reduce direct dependencies
 * between individual feature modules
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';

export default class GameIntegration {
    constructor(game) {
        this.game = game;
        
        // Keep track of active mini-games
        this.activeMiniGame = null;
        
        // State for mini-games
        this.miniGameState = {
            lastBet: 1,
            totalWinnings: 0,
            totalLosses: 0,
            gamesPlayed: 0
        };
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Handle mini-game events
        eventBus.subscribe(GameEvents.MINIGAME_STARTED, (data) => {
            this.activeMiniGame = data.game;
            this.miniGameState.gamesPlayed++;
            
            // Ensure UI is updated to reflect mini-game state
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'minigameActive',
                game: data.game
            });
        });
        
        eventBus.subscribe(GameEvents.MINIGAME_ENDED, (data) => {
            // Track game stats
            if (data.winnings) {
                this.miniGameState.totalWinnings += data.winnings;
            }
            if (data.losses) {
                this.miniGameState.totalLosses += data.losses;
            }
            
            // Clear active mini-game
            this.activeMiniGame = null;
            
            // Update money in the main game state
            if (data.money !== undefined) {
                this.game.money = data.money;
                
                // Publish money changed event
                eventBus.publish(GameEvents.MONEY_CHANGED, {
                    newAmount: data.money
                });
            }
            
            // Refresh UI
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'minigameEnded',
                gameStats: { ...this.miniGameState }
            });
        });
        
        // Handle object interaction effects on navigation
        eventBus.subscribe(GameEvents.OBJECT_INTERACTION, (data) => {
            if (data.effect === 'unlockDoor') {
                this.handleDoorUnlock(data.roomId, data.direction);
            } else if (data.effect === 'revealPassage') {
                this.handleRevealPassage(data.roomId, data.direction);
            }
        });
        
        // Handle score changes
        eventBus.subscribe(GameEvents.SCORE_CHANGED, (data) => {
            // Check for game completion
            if (data.currentScore >= 3) {
                this.handleGameCompletion();
            }
        });
        
        // Handle special character interactions
        eventBus.subscribe(GameEvents.CHARACTER_INTERACTION, (data) => {
            this.updateCharacterState(data.characterId, data.state);
        });
    }
    
    // Handle unlocking doors for navigation
    handleDoorUnlock(roomId, direction) {
        // Ensure this is implemented in the Navigation module
        eventBus.publish(GameEvents.DIRECTION_AVAILABLE, {
            roomId: roomId,
            direction: direction
        });
    }
    
    // Handle revealing hidden passages
    handleRevealPassage(roomId, direction) {
        // Add a new direction to a room's available exits
        eventBus.publish(GameEvents.DIRECTION_AVAILABLE, {
            roomId: roomId,
            direction: direction
        });
        
        // Update room description to include new passage
        this.game.addToGameDisplay(`<div class="message">A PASSAGE APPEARS TO THE ${direction}!</div>`);
    }
    
    // Handle game completion
    handleGameCompletion() {
        // Show winning message
        this.game.addToGameDisplay(`<div class="message">CONGRATULATIONS! YOU HAVE COMPLETED THE GAME!</div>`);
        
        // Show game stats
        this.showGameStats();
        
        // Publish game completed event
        eventBus.publish(GameEvents.GAME_COMPLETED, {
            score: this.game.score,
            moneyRemaining: this.game.money,
            inventoryItems: [...this.game.inventory]
        });
    }
    
    // Show game statistics
    showGameStats() {
        this.game.addToGameDisplay(`<div class="message">
            GAME STATS:
            - SCORE: ${this.game.score}/3
            - MONEY REMAINING: $${this.game.money}00
            - MINI-GAMES PLAYED: ${this.miniGameState.gamesPlayed}
            - TOTAL WINNINGS: $${this.miniGameState.totalWinnings}00
            - TOTAL LOSSES: $${this.miniGameState.totalLosses}00
        </div>`);
    }
    
    // Update the state of characters in the game
    updateCharacterState(characterId, state) {
        // This allows characters to change state based on interactions
        // For example, a character might become friendly after receiving a gift
        
        // Update UI to reflect character state change
        eventBus.publish(GameEvents.UI_REFRESH, {
            type: 'characterStateChanged',
            characterId: characterId,
            state: state
        });
    }
    
    // Check if all requirements for a goal are met
    checkGoalRequirements(goalId) {
        switch(goalId) {
            case 'hooker':
                // Requirements for hooker goal
                return this.game.flags.wearingRubber && this.game.currentRoom === 9;
            case 'girl':
                // Requirements for girl goal
                return this.game.flags.girlPoints >= 5 && this.game.currentRoom === 16;
            case 'jacuzzi':
                // Requirements for jacuzzi goal
                return this.game.flags.jacuzziApple === 1 && this.game.currentRoom === 26;
            default:
                return false;
        }
    }
    
    // Reset mini-game state
    resetMiniGameState() {
        this.miniGameState = {
            lastBet: 1,
            totalWinnings: 0,
            totalLosses: 0,
            gamesPlayed: 0
        };
    }
}
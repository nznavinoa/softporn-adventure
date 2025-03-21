/**
 * SlotMachine - Implements the slot machine mini-game
 * Handles betting, spinning, and calculating winnings
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';

export default class SlotMachine {
    constructor(game) {
        this.game = game;
        this.active = false;
        
        // Slot machine state
        this.state = {
            bet: 1, // In hundreds of dollars
            symbols: [],
            result: null,
            winnings: 0
        };
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventBus.subscribe(GameEvents.MINIGAME_STARTED, (data) => {
            if (data.game === "SLOTS") {
                this.startGame();
            }
        });
        
        // Listen for UI events related to slots
        document.addEventListener('click', (event) => {
            if (event.target.id === 'play-slots-yes') {
                this.playSlotRound();
            } else if (event.target.id === 'play-slots-no') {
                this.endGame();
            }
        });
    }
    
    // Start the slot machine game
    startGame() {
        try {
            // Check if we're in the casino
            if (this.game.currentRoom !== 13) {
                this.game.addToGameDisplay(`<div class="message">THERE ARE NO SLOT MACHINES HERE</div>`);
                return;
            }
            
            // Check if we have money
            if (this.game.money < 1) {
                this.game.addToGameDisplay(`<div class="message">I'M BROKE!!!</div>`);
                return;
            }
            
            this.active = true;
            this.game.addToGameDisplay(`<div class="message">THIS WILL COST $100 EACH TIME</div>`);
            this.game.addToGameDisplay(`<div class="message">YOU HAVE $${this.game.money}00</div>`);
            
            this.game.addToGameDisplay(`<div class="system-message">
                WOULD YOU LIKE TO PLAY? 
                <button id="play-slots-yes">YES</button>
                <button id="play-slots-no">NO</button>
            </div>`);
            
            // Publish minigame state
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'minigameStarted',
                game: 'slots',
                money: this.game.money
            });
        } catch (error) {
            console.error("Error starting slot machine game:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR STARTING SLOT MACHINE.</div>`);
            this.active = false;
        }
    }
    
    // Play a round of slots
    playSlotRound() {
        try {
            if (!this.active) return;
            
            // Deduct money
            this.game.money -= 1;
            
            // Generate three random symbols (using numbers 33-42 as in the original game)
            this.state.symbols = [
                Math.floor(Math.random() * 10) + 33,
                Math.floor(Math.random() * 10) + 33,
                Math.floor(Math.random() * 10) + 33
            ];
            
            // Display result
            this.game.addToGameDisplay(`<div class="message">${String.fromCharCode(this.state.symbols[0])} ${String.fromCharCode(this.state.symbols[1])} ${String.fromCharCode(this.state.symbols[2])}</div>`);
            
            // Calculate and display winnings
            this.calculateWinnings();
            
            // Check if we're out of money
            if (this.game.money < 1) {
                this.game.addToGameDisplay(`<div class="message">I'M BROKE!!!- THAT MEANS DEATH!!!!!!!!</div>`);
                
                // Game over
                eventBus.publish(GameEvents.GAME_OVER, {
                    reason: "Out of money",
                    score: this.game.score
                });
                
                this.active = false;
                return;
            }
            
            this.game.addToGameDisplay(`<div class="message">YOU HAVE $${this.game.money}00</div>`);
            this.game.addToGameDisplay(`<div class="system-message">
                PLAY AGAIN? 
                <button id="play-slots-yes">YES</button>
                <button id="play-slots-no">NO</button>
            </div>`);
            
            // Publish money changed event
            eventBus.publish(GameEvents.MONEY_CHANGED, {
                newAmount: this.game.money
            });
        } catch (error) {
            console.error("Error playing slot round:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR PLAYING SLOTS.</div>`);
        }
    }
    
    // Calculate winnings
    calculateWinnings() {
        try {
            const [s1, s2, s3] = this.state.symbols;
            
            // Check for wins
            if (s1 === s2 && s2 === s3) {
                // Triples (jackpot)
                this.state.result = "triples";
                this.state.winnings = 15;
                this.game.money += 15;
                this.game.addToGameDisplay(`<div class="message">TRIPLES!!!!!! YOU WIN $1500</div>`);
            } else if (s1 === s2 || s2 === s3 || s1 === s3) {
                // Doubles (small win)
                this.state.result = "doubles";
                this.state.winnings = 3;
                this.game.money += 3;
                this.game.addToGameDisplay(`<div class="message">A PAIR! YOU WIN $300</div>`);
            } else {
                // Loss
                this.state.result = "loss";
                this.state.winnings = 0;
                this.game.addToGameDisplay(`<div class="message">YOU LOSE!</div>`);
            }
        } catch (error) {
            console.error("Error calculating winnings:", error);
            this.state.result = "error";
            this.state.winnings = 0;
        }
    }
    
    // End the game and return to main game
    endGame() {
        try {
            this.active = false;
            this.game.addToGameDisplay(`<div class="message">MAYBE LATER</div>`);
            
            // Publish minigame ended event
            eventBus.publish(GameEvents.MINIGAME_ENDED, {
                game: "SLOTS",
                money: this.game.money
            });
        } catch (error) {
            console.error("Error ending slot game:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR ENDING GAME.</div>`);
        }
    }
}
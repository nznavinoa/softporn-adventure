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
        
        // Enhanced slot machine state
        this.state = {
            bet: 1, // In hundreds of dollars
            symbols: [],
            result: null,
            winnings: 0,
            // Track session statistics
            sessionStats: {
                spins: 0,
                wins: 0,
                losses: 0,
                totalWinnings: 0,
                totalLosses: 0,
                bestWin: 0,
                longestLossStreak: 0,
                currentLossStreak: 0
            }
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
            if (!this.active) return;
            
            if (event.target.id === 'play-slots-yes') {
                this.playSlotRound();
            } else if (event.target.id === 'play-slots-no') {
                this.endGame();
            } else if (event.target.id === 'increase-bet' && this.game.money > this.state.bet) {
                this.increaseBet();
            } else if (event.target.id === 'decrease-bet' && this.state.bet > 1) {
                this.decreaseBet();
            } else if (event.target.id === 'max-bet') {
                this.maxBet();
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
            
            // Reset session stats if this is a new session
            if (this.state.sessionStats.spins === 0) {
                this.resetSessionStats();
            }
            
            this.game.addToGameDisplay(`<div class="message">THIS WILL COST $100 EACH TIME</div>`);
            this.game.addToGameDisplay(`<div class="message">YOU HAVE $${this.game.money}00</div>`);
            
            // Show enhanced betting UI
            this.game.addToGameDisplay(`<div class="system-message">
                CURRENT BET: $${this.state.bet}00
                <button id="decrease-bet">-</button>
                <button id="increase-bet">+</button>
                <button id="max-bet">MAX</button>
                <br><br>
                WOULD YOU LIKE TO PLAY? 
                <button id="play-slots-yes">YES</button>
                <button id="play-slots-no">NO</button>
            </div>`);
            
            // Publish minigame state
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'minigameStarted',
                game: 'slots',
                money: this.game.money,
                betOptions: {
                    current: this.state.bet,
                    min: 1,
                    max: Math.min(this.game.money, 10) // Cap at $1000
                }
            });
        } catch (error) {
            console.error("Error starting slot machine game:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR STARTING SLOT MACHINE.</div>`);
            this.active = false;
        }
    }
    
    // Reset session statistics
    resetSessionStats() {
        this.state.sessionStats = {
            spins: 0,
            wins: 0,
            losses: 0,
            totalWinnings: 0,
            totalLosses: 0,
            bestWin: 0,
            longestLossStreak: 0,
            currentLossStreak: 0
        };
    }
    
    // Increase bet amount
    increaseBet() {
        if (this.state.bet < this.game.money && this.state.bet < 10) { // Cap at $1000
            this.state.bet++;
            this.updateBetDisplay();
        }
    }
    
    // Decrease bet amount
    decreaseBet() {
        if (this.state.bet > 1) {
            this.state.bet--;
            this.updateBetDisplay();
        }
    }
    
    // Set maximum bet
    maxBet() {
        this.state.bet = Math.min(this.game.money, 10); // Cap at $1000
        this.updateBetDisplay();
    }
    
    // Update bet display
    updateBetDisplay() {
        this.game.addToGameDisplay(`<div class="system-message">
            CURRENT BET: $${this.state.bet}00
            <button id="decrease-bet">-</button>
            <button id="increase-bet">+</button>
            <button id="max-bet">MAX</button>
            <br><br>
            WOULD YOU LIKE TO PLAY? 
            <button id="play-slots-yes">YES</button>
            <button id="play-slots-no">NO</button>
        </div>`);
    }
    
    // Play a round of slots
    playSlotRound() {
        try {
            if (!this.active) return;
            
            // Deduct money
            this.game.money -= this.state.bet;
            
            // Update session stats
            this.state.sessionStats.spins++;
            this.state.sessionStats.totalLosses += this.state.bet;
            
            // Generate three random symbols (using numbers 33-42 as in the original game)
            this.state.symbols = [
                Math.floor(Math.random() * 10) + 33,
                Math.floor(Math.random() * 10) + 33,
                Math.floor(Math.random() * 10) + 33
            ];
            
            // Build suspenseful display
            this.game.addToGameDisplay(`<div class="message">SPINNING...</div>`);
            
            // Simulate spinning with a delay
            setTimeout(() => {
                this.showFirstSymbol();
            }, 500);
        } catch (error) {
            console.error("Error playing slot round:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR PLAYING SLOTS.</div>`);
        }
    }
    
    // Show first symbol with dramatic effect
    showFirstSymbol() {
        this.game.addToGameDisplay(`<div class="message">${String.fromCharCode(this.state.symbols[0])} ? ?</div>`);
        
        setTimeout(() => {
            this.showSecondSymbol();
        }, 500);
    }
    
    // Show second symbol
    showSecondSymbol() {
        this.game.addToGameDisplay(`<div class="message">${String.fromCharCode(this.state.symbols[0])} ${String.fromCharCode(this.state.symbols[1])} ?</div>`);
        
        setTimeout(() => {
            this.showFinalResult();
        }, 500);
    }
    
    // Show final result and calculate winnings
    showFinalResult() {
        this.game.addToGameDisplay(`<div class="message">${String.fromCharCode(this.state.symbols[0])} ${String.fromCharCode(this.state.symbols[1])} ${String.fromCharCode(this.state.symbols[2])}</div>`);
        
        // Calculate and display winnings
        this.calculateWinnings();
        
        // Check if we're out of money
        if (this.game.money < 1) {
            this.game.addToGameDisplay(`<div class="message">I'M BROKE!!!- THAT MEANS DEATH!!!!!!!!</div>`);
            
            // Show game over with stats
            this.showSessionStats();
            
            eventBus.publish(GameEvents.GAME_OVER, {
                reason: "Out of money",
                score: this.game.score,
                gameStats: { ...this.state.sessionStats }
            });
            
            this.active = false;
            return;
        }
        
        this.game.addToGameDisplay(`<div class="message">YOU HAVE $${this.game.money}00</div>`);
        
        // Update bet options if current bet is now too high
        if (this.state.bet > this.game.money) {
            this.state.bet = this.game.money;
        }
        
        // Show play again options with current bet
        this.game.addToGameDisplay(`<div class="system-message">
            CURRENT BET: $${this.state.bet}00
            <button id="decrease-bet">-</button>
            <button id="increase-bet">+</button>
            <button id="max-bet">MAX</button>
            <br><br>
            PLAY AGAIN? 
            <button id="play-slots-yes">YES</button>
            <button id="play-slots-no">NO</button>
        </div>`);
        
        // Publish money changed event
        eventBus.publish(GameEvents.MONEY_CHANGED, {
            newAmount: this.game.money
        });
    }
    
    // Calculate winnings
    calculateWinnings() {
        try {
            const [s1, s2, s3] = this.state.symbols;
            
            // Check for wins
            if (s1 === s2 && s2 === s3) {
                // Triples (jackpot)
                this.state.result = "triples";
                this.state.winnings = this.state.bet * 15;
                this.game.money += this.state.winnings;
                this.game.addToGameDisplay(`<div class="message">TRIPLES!!!!!! YOU WIN $${this.state.winnings * 100}</div>`);
                
                // Update session stats
                this.state.sessionStats.wins++;
                this.state.sessionStats.totalWinnings += this.state.winnings;
                this.state.sessionStats.bestWin = Math.max(this.state.sessionStats.bestWin, this.state.winnings);
                this.state.sessionStats.currentLossStreak = 0;
                
                // Jackpot animation effect
                this.game.addToGameDisplay(`<div class="jackpot-message">J A C K P O T ! ! !</div>`);
                
            } else if (s1 === s2 || s2 === s3 || s1 === s3) {
                // Doubles (small win)
                this.state.result = "doubles";
                this.state.winnings = this.state.bet * 3;
                this.game.money += this.state.winnings;
                this.game.addToGameDisplay(`<div class="message">A PAIR! YOU WIN $${this.state.winnings * 100}</div>`);
                
                // Update session stats
                this.state.sessionStats.wins++;
                this.state.sessionStats.totalWinnings += this.state.winnings;
                this.state.sessionStats.bestWin = Math.max(this.state.sessionStats.bestWin, this.state.winnings);
                this.state.sessionStats.currentLossStreak = 0;
                
            } else {
                // Loss
                this.state.result = "loss";
                this.state.winnings = 0;
                this.game.addToGameDisplay(`<div class="message">YOU LOSE!</div>`);
                
                // Update session stats
                this.state.sessionStats.losses++;
                this.state.sessionStats.currentLossStreak++;
                this.state.sessionStats.longestLossStreak = Math.max(
                    this.state.sessionStats.longestLossStreak,
                    this.state.sessionStats.currentLossStreak
                );
            }
            
            // Publish minigame state update
            eventBus.publish(GameEvents.MINIGAME_STATE_CHANGED, {
                game: "SLOTS",
                result: this.state.result,
                bet: this.state.bet,
                winnings: this.state.winnings,
                symbols: this.state.symbols.map(s => String.fromCharCode(s)),
                sessionStats: { ...this.state.sessionStats }
            });
        } catch (error) {
            console.error("Error calculating winnings:", error);
            this.state.result = "error";
            this.state.winnings = 0;
        }
    }
    
    // Show session statistics
    showSessionStats() {
        const stats = this.state.sessionStats;
        const netWinnings = stats.totalWinnings - stats.totalLosses;
        
        this.game.addToGameDisplay(`<div class="message">
            SLOT MACHINE SESSION SUMMARY:
            - TOTAL SPINS: ${stats.spins}
            - WINS: ${stats.wins}
            - LOSSES: ${stats.losses}
            - WIN RATE: ${Math.round((stats.wins / stats.spins) * 100)}%
            - TOTAL WINNINGS: $${stats.totalWinnings * 100}
            - TOTAL SPENT: $${stats.totalLosses * 100}
            - NET RESULT: ${netWinnings >= 0 ? '+' : ''}$${netWinnings * 100}
            - BEST WIN: $${stats.bestWin * 100}
            - LONGEST LOSING STREAK: ${stats.longestLossStreak}
        </div>`);
    }
    
    // End the game and return to main game
    endGame() {
        try {
            // Show session stats if played at least once
            if (this.state.sessionStats.spins > 0) {
                this.showSessionStats();
            }
            
            this.active = false;
            this.game.addToGameDisplay(`<div class="message">MAYBE LATER</div>`);
            
            // Publish minigame ended event
            eventBus.publish(GameEvents.MINIGAME_ENDED, {
                game: "SLOTS",
                money: this.game.money,
                winnings: this.state.sessionStats.totalWinnings,
                losses: this.state.sessionStats.totalLosses,
                sessionStats: { ...this.state.sessionStats }
            });
        } catch (error) {
            console.error("Error ending slot game:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR ENDING GAME.</div>`);
        }
    }
}
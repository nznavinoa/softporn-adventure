/**
 * Blackjack - Implements the blackjack (21) mini-game
 * Handles betting, dealing, player and dealer turns
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';

export default class Blackjack {
    constructor(game) {
        this.game = game;
        this.active = false;
        
        // Enhanced blackjack state
        this.state = {
            playerCards: [],
            dealerCards: [],
            playerTotal: 0,
            dealerTotal: 0,
            bet: 1,
            gamePhase: 'betting', // betting, player, dealer, result
            
            // Session statistics
            sessionStats: {
                handsPlayed: 0,
                wins: 0,
                losses: 0,
                pushes: 0,
                blackjacks: 0,
                totalWinnings: 0,
                totalLosses: 0,
                bestWin: 0,
                longestLossStreak: 0,
                currentLossStreak: 0,
                bestHand: 0
            }
        };
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventBus.subscribe(GameEvents.MINIGAME_STARTED, (data) => {
            if (data.game === "BLACKJACK") {
                this.startGame();
            }
        });
        
        // Listen for UI events related to blackjack
        document.addEventListener('click', (event) => {
            if (!this.active) return;
            
            if (event.target.id === 'place-bet') {
                const betInput = document.getElementById('blackjack-bet');
                if (betInput) {
                    this.placeBlackjackBet(betInput.value);
                }
            } else if (event.target.id === 'blackjack-hit') {
                this.blackjackHit();
            } else if (event.target.id === 'blackjack-stand') {
                this.blackjackStand();
            } else if (event.target.id === 'blackjack-double') {
                this.blackjackDouble();
            } else if (event.target.id === 'blackjack-play-again') {
                this.resetGame();
            } else if (event.target.id === 'blackjack-quit') {
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
    
    // Start the blackjack game
    startGame() {
        try {
            // Check if we're in the 21 room
            if (this.game.currentRoom !== 14) {
                this.game.addToGameDisplay(`<div class="message">THERE ARE NO CARD GAMES HERE</div>`);
                return;
            }
            
            // Reset blackjack state
            this.resetGameState();
            
            // Check if we have money
            if (this.game.money < 1) {
                this.game.addToGameDisplay(`<div class="message">I'M BROKE!!!</div>`);
                return;
            }
            
            this.active = true;
            this.game.addToGameDisplay(`<div class="message">YOU HAVE $${this.game.money}00</div>`);
            
            // Show enhanced betting UI
            this.game.addToGameDisplay(`<div class="system-message">
                CURRENT BET: $${this.state.bet}00
                <button id="decrease-bet">-</button>
                <button id="increase-bet">+</button>
                <button id="max-bet">MAX</button>
                <br><br>
                HOW MANY DOLLARS WOULD YOU LIKE TO BET? (IN $100 INCREMENTS)
                <input type="number" id="blackjack-bet" min="1" max="${this.game.money}" value="${this.state.bet}">
                <button id="place-bet">PLACE BET</button>
            </div>`);
            
            // Publish minigame state
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'minigameStarted',
                game: 'blackjack',
                money: this.game.money,
                betOptions: {
                    current: this.state.bet,
                    min: 1,
                    max: Math.min(this.game.money, 10) // Cap at $1000
                }
            });
        } catch (error) {
            console.error("Error starting blackjack game:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR STARTING BLACKJACK.</div>`);
            this.active = false;
        }
    }
    
    // Reset the game state for a new hand
    resetGameState() {
        this.state.playerCards = [];
        this.state.dealerCards = [];
        this.state.playerTotal = 0;
        this.state.dealerTotal = 0;
        this.state.gamePhase = 'betting';
        
        // Keep the same bet from last hand if possible
        if (this.state.bet > this.game.money) {
            this.state.bet = this.game.money;
        }
        
        // Initialize session statistics if this is a new session
        if (this.state.sessionStats.handsPlayed === 0) {
            this.resetSessionStats();
        }
    }
    
    // Reset session statistics
    resetSessionStats() {
        this.state.sessionStats = {
            handsPlayed: 0,
            wins: 0,
            losses: 0,
            pushes: 0,
            blackjacks: 0,
            totalWinnings: 0,
            totalLosses: 0,
            bestWin: 0,
            longestLossStreak: 0,
            currentLossStreak: 0,
            bestHand: 0
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
            HOW MANY DOLLARS WOULD YOU LIKE TO BET? (IN $100 INCREMENTS)
            <input type="number" id="blackjack-bet" min="1" max="${this.game.money}" value="${this.state.bet}">
            <button id="place-bet">PLACE BET</button>
        </div>`);
    }
    
    // Place a bet for blackjack
    placeBlackjackBet(bet) {
        try {
            if (!this.active || this.state.gamePhase !== 'betting') return;
            
            // Validate bet
            bet = parseInt(bet);
            if (isNaN(bet) || bet < 1 || bet > this.game.money) {
                this.game.addToGameDisplay(`<div class="message">INVALID BET</div>`);
                return;
            }
            
            // Update session stats
            this.state.sessionStats.handsPlayed++;
            this.state.sessionStats.totalLosses += bet;
            
            // Store bet
            this.state.bet = bet;
            this.state.gamePhase = 'player';
            
            // Deal initial cards
            this.state.playerCards = [this.dealBlackjackCard(), this.dealBlackjackCard()];
            this.state.dealerCards = [this.dealBlackjackCard(), this.dealBlackjackCard()];
            
            // Calculate totals
            this.state.playerTotal = this.calculateBlackjackTotal(this.state.playerCards);
            this.state.dealerTotal = this.calculateBlackjackTotal(this.state.dealerCards);
            
            // Update best hand if this is the best starting hand
            if (this.state.playerTotal > this.state.sessionStats.bestHand) {
                this.state.sessionStats.bestHand = this.state.playerTotal;
            }
            
            // Display cards with some timing for suspense
            this.game.addToGameDisplay(`<div class="message">DEALING...</div>`);
            
            setTimeout(() => {
                // Display player cards
                this.game.addToGameDisplay(`<div class="message">YOUR CARDS: ${this.state.playerCards.join(', ')}</div>`);
                this.game.addToGameDisplay(`<div class="message">YOUR TOTAL: ${this.state.playerTotal}</div>`);
                
                // Show dealer's up card
                this.game.addToGameDisplay(`<div class="message">DEALER'S UP CARD: ${this.state.dealerCards[1]}</div>`);
                
                // Check for blackjack
                if (this.state.playerTotal === 21) {
                    this.game.addToGameDisplay(`<div class="message">YOU'VE GOT ***BLACKJACK***</div>`);
                    
                    // Check if dealer also has blackjack
                    if (this.calculateBlackjackTotal([this.state.dealerCards[0], this.state.dealerCards[1]]) === 21) {
                        // Push (tie)
                        this.game.addToGameDisplay(`<div class="message">DEALER ALSO HAS BLACKJACK!</div>`);
                        this.game.addToGameDisplay(`<div class="message">PUSH - BET RETURNED</div>`);
                        
                        this.state.sessionStats.pushes++;
                        this.state.sessionStats.blackjacks++;
                        
                        // Refund bet
                        this.state.sessionStats.totalLosses -= this.state.bet;
                    } else {
                        // Player wins with blackjack (pays 3:2)
                        const winnings = Math.floor(this.state.bet * 1.5);
                        this.game.money += (this.state.bet + winnings);
                        this.game.addToGameDisplay(`<div class="message">YOU WIN $${winnings * 100}!</div>`);
                        
                        // Update stats
                        this.state.sessionStats.wins++;
                        this.state.sessionStats.blackjacks++;
                        this.state.sessionStats.totalWinnings += winnings;
                        this.state.sessionStats.bestWin = Math.max(this.state.sessionStats.bestWin, winnings);
                        this.state.sessionStats.currentLossStreak = 0;
                    }
                    
                    this.state.gamePhase = 'result';
                    this.blackjackGameEnd();
                    return;
                }
                
                // Player's turn - show options
                this.showPlayerOptions();
                
            }, 1000);
            
            // Publish game state update
            eventBus.publish(GameEvents.MINIGAME_STATE_CHANGED, {
                game: "BLACKJACK",
                phase: "player_turn",
                playerCards: [...this.state.playerCards],
                playerTotal: this.state.playerTotal,
                dealerUpCard: this.state.dealerCards[1],
                bet: this.state.bet
            });
            
        } catch (error) {
            console.error("Error placing blackjack bet:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR PLACING BET.</div>`);
        }
    }
    
    // Show player options based on current hand
    showPlayerOptions() {
        const canDouble = this.game.money >= this.state.bet;
        
        this.game.addToGameDisplay(`<div class="system-message">
            WHAT WOULD YOU LIKE TO DO?
            <button id="blackjack-hit">HIT</button>
            <button id="blackjack-stand">STAND</button>
            ${canDouble ? `<button id="blackjack-double">DOUBLE DOWN</button>` : ''}
        </div>`);
    }
    
    // Deal a card for blackjack
    dealBlackjackCard() {
        // Original game uses values 1-13 for cards
        const value = Math.floor(Math.random() * 13) + 1;
        
        if (value === 1) return 'A';
        if (value === 11) return 'J';
        if (value === 12) return 'Q';
        if (value === 13) return 'K';
        return value.toString();
    }
    
    // Calculate blackjack hand total
    calculateBlackjackTotal(cards) {
        let total = 0;
        let aces = 0;
        
        for (const card of cards) {
            if (card === 'A') {
                total += 11;
                aces += 1;
            } else if (card === 'J' || card === 'Q' || card === 'K') {
                total += 10;
            } else {
                total += parseInt(card);
            }
        }
        
        // Adjust for aces if needed
        while (total > 21 && aces > 0) {
            total -= 10;
            aces -= 1;
        }
        
        return total;
    }
    
    // Player hits in blackjack
    blackjackHit() {
        try {
            if (!this.active || this.state.gamePhase !== 'player') return;
            
            // Deal a card
            const card = this.dealBlackjackCard();
            this.state.playerCards.push(card);
            
            // Calculate new total
            this.state.playerTotal = this.calculateBlackjackTotal(this.state.playerCards);
            
            // Update best hand if this is better
            if (this.state.playerTotal <= 21 && this.state.playerTotal > this.state.sessionStats.bestHand) {
                this.state.sessionStats.bestHand = this.state.playerTotal;
            }
            
            // Display cards
            this.game.addToGameDisplay(`<div class="message">YOU GET A ${card}</div>`);
            this.game.addToGameDisplay(`<div class="message">YOUR TOTAL: ${this.state.playerTotal}</div>`);
            
            // Publish state update
            eventBus.publish(GameEvents.MINIGAME_STATE_CHANGED, {
                game: "BLACKJACK",
                phase: "player_hit",
                playerCards: [...this.state.playerCards],
                playerTotal: this.state.playerTotal,
                lastCard: card
            });
            
            // Check for bust
            if (this.state.playerTotal > 21) {
                this.game.addToGameDisplay(`<div class="message">BUSTED!</div>`);
                this.game.money -= this.state.bet;
                
                // Update stats
                this.state.sessionStats.losses++;
                this.state.sessionStats.currentLossStreak++;
                this.state.sessionStats.longestLossStreak = Math.max(
                    this.state.sessionStats.longestLossStreak,
                    this.state.sessionStats.currentLossStreak
                );
                
                this.state.gamePhase = 'result';
                this.blackjackGameEnd();
                return;
            }
            
            // Check for 21 (auto-stand)
            if (this.state.playerTotal === 21) {
                this.game.addToGameDisplay(`<div class="message">21! STANDING...</div>`);
                this.blackjackStand();
                return;
            }
            
            // Player's turn continues - show options
            this.showPlayerOptions();
            
        } catch (error) {
            console.error("Error in blackjack hit:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR DEALING CARD.</div>`);
        }
    }
    
    // Player doubles down
    blackjackDouble() {
        try {
            if (!this.active || this.state.gamePhase !== 'player') return;
            
            // Check if we have enough money
            if (this.game.money < this.state.bet) {
                this.game.addToGameDisplay(`<div class="message">NOT ENOUGH MONEY TO DOUBLE DOWN!</div>`);
                return;
            }
            
            this.game.addToGameDisplay(`<div class="message">DOUBLING DOWN...</div>`);
            
            // Increase bet
            this.state.sessionStats.totalLosses += this.state.bet;
            this.state.bet *= 2;
            
            // Deal only one card
            const card = this.dealBlackjackCard();
            this.state.playerCards.push(card);
            
            // Calculate new total
            this.state.playerTotal = this.calculateBlackjackTotal(this.state.playerCards);
            
            // Update best hand if this is better
            if (this.state.playerTotal <= 21 && this.state.playerTotal > this.state.sessionStats.bestHand) {
                this.state.sessionStats.bestHand = this.state.playerTotal;
            }
            
            // Display cards
            this.game.addToGameDisplay(`<div class="message">YOU GET A ${card}</div>`);
            this.game.addToGameDisplay(`<div class="message">YOUR TOTAL: ${this.state.playerTotal}</div>`);
            
            // Publish state update
            eventBus.publish(GameEvents.MINIGAME_STATE_CHANGED, {
                game: "BLACKJACK",
                phase: "player_double",
                playerCards: [...this.state.playerCards],
                playerTotal: this.state.playerTotal,
                lastCard: card,
                newBet: this.state.bet
            });
            
            // Check for bust
            if (this.state.playerTotal > 21) {
                this.game.addToGameDisplay(`<div class="message">BUSTED!</div>`);
                this.game.money -= this.state.bet;
                
                // Update stats
                this.state.sessionStats.losses++;
                this.state.sessionStats.currentLossStreak++;
                this.state.sessionStats.longestLossStreak = Math.max(
                    this.state.sessionStats.longestLossStreak,
                    this.state.sessionStats.currentLossStreak
                );
                
                this.state.gamePhase = 'result';
                this.blackjackGameEnd();
                return;
            }
            
            // Automatically stand after doubling
            this.blackjackStand();
            
        } catch (error) {
            console.error("Error in blackjack double:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR DOUBLING DOWN.</div>`);
        }
    }
    
    // Player stands in blackjack
    blackjackStand() {
        try {
            if (!this.active || this.state.gamePhase !== 'player') return;
            
            // Dealer's turn
            this.state.gamePhase = 'dealer';
            
            // Reveal dealer's cards
            this.game.addToGameDisplay(`<div class="message">DEALER'S CARDS: ${this.state.dealerCards.join(', ')}</div>`);
            this.game.addToGameDisplay(`<div class="message">DEALER'S TOTAL: ${this.state.dealerTotal}</div>`);
            
            // Add some suspense
            setTimeout(() => {
                this.dealerPlay();
            }, 1000);
            
        } catch (error) {
            console.error("Error in blackjack stand:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR DURING DEALER'S TURN.</div>`);
        }
    }
    
    // Dealer plays their hand
    dealerPlay() {
        // Dealer hits until 17 or higher
        let dealingInProgress = this.state.dealerTotal < 17;
        
        const dealNextCard = () => {
            if (this.state.dealerTotal < 17) {
                const card = this.dealBlackjackCard();
                this.state.dealerCards.push(card);
                this.state.dealerTotal = this.calculateBlackjackTotal(this.state.dealerCards);
                
                this.game.addToGameDisplay(`<div class="message">DEALER GETS A ${card}</div>`);
                this.game.addToGameDisplay(`<div class="message">DEALER'S TOTAL: ${this.state.dealerTotal}</div>`);
                
                // Publish state update
                eventBus.publish(GameEvents.MINIGAME_STATE_CHANGED, {
                    game: "BLACKJACK",
                    phase: "dealer_hit",
                    dealerCards: [...this.state.dealerCards],
                    dealerTotal: this.state.dealerTotal,
                    lastCard: card
                });
                
                if (this.state.dealerTotal < 17) {
                    // Deal another card with a delay
                    setTimeout(dealNextCard, 750);
                } else {
                    // Dealer is done, determine winner
                    setTimeout(() => {
                        this.determineWinner();
                    }, 1000);
                }
            } else {
                // Dealer is done, determine winner
                this.determineWinner();
            }
        };
        
        if (dealingInProgress) {
            dealNextCard();
        } else {
            this.determineWinner();
        }
    }
    
    // Determine the winner and update stats
    determineWinner() {
        // Check different outcomes
        
        // Case 1: Dealer busts
        if (this.state.dealerTotal > 21) {
            this.game.addToGameDisplay(`<div class="message">DEALER BUSTS! YOU WIN!</div>`);
            this.game.money += this.state.bet;
            
            // Update stats
            this.state.sessionStats.wins++;
            this.state.sessionStats.totalWinnings += this.state.bet;
            this.state.sessionStats.bestWin = Math.max(this.state.sessionStats.bestWin, this.state.bet);
            this.state.sessionStats.currentLossStreak = 0;
        } 
        // Case 2: Dealer beats player
        else if (this.state.dealerTotal > this.state.playerTotal) {
            this.game.addToGameDisplay(`<div class="message">DEALER WINS</div>`);
            this.game.money -= this.state.bet;
            
            // Update stats
            this.state.sessionStats.losses++;
            this.state.sessionStats.currentLossStreak++;
            this.state.sessionStats.longestLossStreak = Math.max(
                this.state.sessionStats.longestLossStreak,
                this.state.sessionStats.currentLossStreak
            );
        } 
        // Case 3: Player beats dealer
        else if (this.state.dealerTotal < this.state.playerTotal) {
            this.game.addToGameDisplay(`<div class="message">YOU WIN!</div>`);
            this.game.money += this.state.bet;
            
            // Update stats
            this.state.sessionStats.wins++;
            this.state.sessionStats.totalWinnings += this.state.bet;
            this.state.sessionStats.bestWin = Math.max(this.state.sessionStats.bestWin, this.state.bet);
            this.state.sessionStats.currentLossStreak = 0;
        } 
        // Case 4: Push (tie)
        else {
            this.game.addToGameDisplay(`<div class="message">TIE GAME - PUSH</div>`);
            
            // Refund bet
            this.state.sessionStats.totalLosses -= this.state.bet;
            
            // Update stats
            this.state.sessionStats.pushes++;
        }
        
        this.state.gamePhase = 'result';
        this.blackjackGameEnd();
    }
    
    // End blackjack game and ask to play again
    blackjackGameEnd() {
        try {
            // Publish final game state
            eventBus.publish(GameEvents.MINIGAME_STATE_CHANGED, {
                game: "BLACKJACK",
                phase: "game_over",
                playerCards: [...this.state.playerCards],
                playerTotal: this.state.playerTotal,
                dealerCards: [...this.state.dealerCards],
                dealerTotal: this.state.dealerTotal,
                result: this.determineResult(),
                bet: this.state.bet,
                sessionStats: { ...this.state.sessionStats }
            });
            
            // Check if out of money
            if (this.game.money < 1) {
                this.game.addToGameDisplay(`<div class="message">YOU'RE OUT OF MONEY!!</div>`);
                
                // Show session stats
                this.showSessionStats();
                
                // Game over
                eventBus.publish(GameEvents.GAME_OVER, {
                    reason: "Out of money",
                    score: this.game.score,
                    gameStats: { ...this.state.sessionStats }
                });
                
                this.active = false;
                return;
            }
            
            this.game.addToGameDisplay(`<div class="message">YOU HAVE $${this.game.money}00</div>`);
            
            // Update bet for next hand if current bet is too high
            if (this.state.bet > this.game.money) {
                this.state.bet = this.game.money;
            }
            
            // Offer to play again
            this.game.addToGameDisplay(`<div class="system-message">
                PLAY AGAIN? 
                <button id="blackjack-play-again">YES</button>
                <button id="blackjack-quit">NO</button>
            </div>`);
            
            // Publish money changed event
            eventBus.publish(GameEvents.MONEY_CHANGED, {
                newAmount: this.game.money
            });
        } catch (error) {
            console.error("Error ending blackjack game:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR ENDING GAME.</div>`);
        }
    }
    
    // Determine the result for stats tracking
    determineResult() {
        if (this.state.playerTotal > 21) {
            return 'player_bust';
        }
        if (this.state.dealerTotal > 21) {
            return 'dealer_bust';
        }
        if (this.state.playerTotal === 21 && this.state.playerCards.length === 2) {
            return 'blackjack';
        }
        if (this.state.playerTotal > this.state.dealerTotal) {
            return 'player_win';
        }
        if (this.state.playerTotal < this.state.dealerTotal) {
            return 'dealer_win';
        }
        return 'push';
    }
    
    // Show session statistics
    showSessionStats() {
        const stats = this.state.sessionStats;
        const netWinnings = stats.totalWinnings - stats.totalLosses;
        
        this.game.addToGameDisplay(`<div class="message">
            BLACKJACK SESSION SUMMARY:
            - HANDS PLAYED: ${stats.handsPlayed}
            - WINS: ${stats.wins}
            - LOSSES: ${stats.losses}
            - PUSHES: ${stats.pushes}
            - BLACKJACKS: ${stats.blackjacks}
            - WIN RATE: ${Math.round((stats.wins / stats.handsPlayed) * 100)}%
            - TOTAL WINNINGS: $${stats.totalWinnings * 100}
            - TOTAL BETS: $${stats.totalLosses * 100}
            - NET RESULT: ${netWinnings >= 0 ? '+' : ''}$${netWinnings * 100}
            - BEST WIN: $${stats.bestWin * 100}
            - BEST HAND: ${stats.bestHand}
            - LONGEST LOSING STREAK: ${stats.longestLossStreak}
        </div>`);
    }
    
    // Reset for a new game
    resetGame() {
        this.resetGameState();
        this.startGame();
    }
    
    // End the game and return to main game
    endGame() {
        try {
            // Show session stats if played at least one hand
            if (this.state.sessionStats.handsPlayed > 0) {
                this.showSessionStats();
            }
            
            this.active = false;
            this.game.addToGameDisplay(`<div class="message">THANKS FOR PLAYING</div>`);
            
            // Publish minigame ended event
            eventBus.publish(GameEvents.MINIGAME_ENDED, {
                game: "BLACKJACK",
                money: this.game.money,
                winnings: this.state.sessionStats.totalWinnings,
                losses: this.state.sessionStats.totalLosses,
                sessionStats: { ...this.state.sessionStats }
            });
        } catch (error) {
            console.error("Error ending blackjack game:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR ENDING GAME.</div>`);
        }
    }
}
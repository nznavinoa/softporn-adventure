/**
 * SpecialEvents - Handles special game events and character interactions
 * Manages game scoring, progression, and special scenes
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';
import { specialTexts } from '../data/text.js';

export default class SpecialEvents {
    constructor(game) {
        this.game = game;
        
        // Track quest progress
        this.quests = {
            girlDisco: { started: false, completed: false, step: 0 },
            hookerRescue: { started: false, completed: false, step: 0 },
            jacuzziGirl: { started: false, completed: false, step: 0 }
        };
        
        // Special event triggers
        this.eventTriggers = {};
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => {
            // Handle special event commands
            switch (data.verb) {
                case "MARRY":
                    this.marryObject(data.noun);
                    break;
                case "SEDUCE":
                case "FUCK":
                case "RAPE":
                    this.seduceObject(data.noun);
                    break;
                case "DANCE":
                    this.dance();
                    break;
                case "JUMP":
                    this.jump();
                    break;
                case "PLAY":
                    this.playGame(data.noun);
                    break;
                case "CALL":
                    this.callNumber(data.noun);
                    break;
                case "ANSWER":
                    this.answerCall();
                    break;
            }
        });
        
        // Listen for item drops (important for gifts)
        eventBus.subscribe(GameEvents.ITEM_REMOVED, (data) => {
            this.handleItemRemoved(data.itemId);
        });
        
        // Listen for room changes to trigger location-based events
        eventBus.subscribe(GameEvents.ROOM_CHANGED, (data) => {
            this.handleRoomChange(data.previousRoom, data.currentRoom);
        });
        
        // Listen for character interactions triggered by other modules
        eventBus.subscribe(GameEvents.CHARACTER_INTERACTION, (data) => {
            this.handleCharacterInteraction(data.characterId, data.action, data.itemId);
        });
    }
    
    // Seduce a character
    seduceObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">SEDUCE WHO?</div>`);
                return;
            }
            
            // Check if the object is in the room
            if (!this.game.isObjectInRoom(objectId)) {
                this.game.addToGameDisplay(`<div class="message">THEY'RE NOT HERE!</div>`);
                return;
            }
            
            // Handle specific characters
            switch(objectId) {
                case 17: // Hooker
                    if (this.game.currentRoom === 9) {
                        if (this.game.flags.hookerDone) {
                            this.game.addToGameDisplay(`<div class="message">SHE CAN'T TAKE IT ANY MORE!!!!!</div>`);
                        } else if (this.game.flags.wearingRubber === 0) {
                            this.game.addToGameDisplay(`<div class="message">OH NO!!!! I'VE GOT THE DREADED ATOMIC CLAP!!! I'M DEAD!!</div>`);
                            eventBus.publish(GameEvents.GAME_OVER, {
                                reason: "Atomic clap",
                                score: this.game.score
                            });
                        } else {
                            this.game.addToGameDisplay(`<div class="message">${specialTexts[8]}</div>`);
                            this.updateScore(1);
                            this.game.flags.hookerDone = true;
                            this.game.flags.tiedToBed = 1;
                            this.game.addToGameDisplay(`<div class="message">WELL- THE SCORE IS NOW '${this.game.score}' OUT OF A POSSIBLE '3'.........BUT I'M ALSO TIED TO THE BED AND CAN'T MOVE.</div>`);
                            
                            // Update quest status
                            this.quests.hookerRescue.completed = true;
                            
                            // Publish event for character state change
                            eventBus.publish(GameEvents.CHARACTER_INTERACTION, {
                                characterId: 17,
                                state: 'completed',
                                result: 'success'
                            });
                        }
                    } else {
                        this.game.addToGameDisplay(`<div class="message">SHE'S NOT INTERESTED HERE</div>`);
                    }
                    break;
                
                case 49: // Girl
                    if (this.game.currentRoom === 16 && this.game.flags.girlPoints >= 5) {
                        if (this.game.flags.wineBottle === 1 || this.game.isObjectInInventory(72)) {
                            this.game.addToGameDisplay(`<div class="message">${specialTexts[23]}</div>`);
                            this.updateScore(1);
                            this.game.flags.usingRope = 1; // Rope now available in room
                            this.game.addToGameDisplay(`<div class="message">THE SCORE IS NOW '${this.game.score}' OUT OF A POSSIBLE '3'</div>`);
                            
                            // Update quest status
                            this.quests.girlDisco.completed = true;
                            
                            // Publish character interaction event
                            eventBus.publish(GameEvents.CHARACTER_INTERACTION, {
                                characterId: 49,
                                state: 'seduced',
                                location: 'honeymoon'
                            });
                            
                            // Remove wine if in inventory
                            if (this.game.isObjectInInventory(72)) {
                                // Use EventBus to request inventory change
                                eventBus.publish(GameEvents.INVENTORY_REMOVE_REQUESTED, {
                                    itemId: 72
                                });
                            }
                        } else {
                            this.game.addToGameDisplay(`<div class="message">SHE SAYS 'GET ME WINE!!! I'M NERVOUS!!'</div>`);
                            
                            // Start wine quest if not already started
                            if (!this.quests.girlDisco.started) {
                                this.quests.girlDisco.started = true;
                                this.quests.girlDisco.step = 1;
                            }
                        }
                    } else if (this.game.currentRoom === 26 && this.game.flags.jacuzziApple === 1) {
                        this.game.addToGameDisplay(`<div class="message">${specialTexts[24]}</div>`);
                        this.updateScore(1);
                        
                        // Update quest status
                        this.quests.jacuzziGirl.completed = true;
                        
                        // Check for game completion
                        if (this.game.score >= 3) {
                            this.game.addToGameDisplay(`<div class="message">WELL......I GUESS THAT'S IT! AS YOUR PUPPET IN THIS GAME I THANK YOU FOR THE PLEASURE YOU HAVE BROUGHT ME.... SO LONG......I'VE GOT TO GET BACK TO MY NEW GIRL HERE! KEEP IT UP!</div>`);
                            this.game.addToGameDisplay(`<div class="system-message">CONGRATULATIONS! YOU'VE COMPLETED THE GAME!</div>`);
                            
                            // Publish game completed event
                            eventBus.publish(GameEvents.GAME_COMPLETED, {
                                score: this.game.score,
                                maxScore: 3,
                                completedQuests: Object.keys(this.quests).filter(q => this.quests[q].completed).length
                            });
                        } else {
                            this.game.addToGameDisplay(`<div class="message">THE SCORE IS NOW '${this.game.score}' OUT OF A POSSIBLE '3'</div>`);
                        }
                    } else {
                        this.game.addToGameDisplay(`<div class="message">SHE'S NOT INTERESTED</div>`);
                    }
                    break;
                
                case 74: // Inflatable doll
                    if (this.game.flags.idInflated === 1) {
                        this.game.addToGameDisplay(`<div class="message">OH BOY!!!!!- IT'S GOT 3 SPOTS TO TRY!!!</div>`);
                        this.game.addToGameDisplay(`<div class="message">I THRUST INTO THE DOLL- KINKY....EH???</div>`);
                        this.game.addToGameDisplay(`<div class="message">I START TO INCREASE MY TEMPO...FASTER AND FASTER I GO!!!!</div>`);
                        this.game.addToGameDisplay(`<div class="message">SUDDENLY THERE'S A FLATULENT NOISE AND THE DOLL BECOMES A POPPED BALLOON SOARING AROUND THE ROOM! IT FLIES OUT OF THE ROOM AND DISAPPEARS!</div>`);
                        
                        // Remove the doll (use EventBus to request removal)
                        if (this.game.isObjectInInventory(74)) {
                            eventBus.publish(GameEvents.INVENTORY_REMOVE_REQUESTED, {
                                itemId: 74
                            });
                        } else {
                            eventBus.publish(GameEvents.ROOM_OBJECT_REMOVE_REQUESTED, {
                                roomId: this.game.currentRoom,
                                objectId: 74
                            });
                        }
                        
                        this.game.flags.idInflated = 2; // Popped
                    } else if (this.game.flags.idInflated === 0) {
                        this.game.addToGameDisplay(`<div class="message">INFLATE IT FIRST- STUPID!!!</div>`);
                    } else {
                        this.game.addToGameDisplay(`<div class="message">THE DOLL IS GONE</div>`);
                    }
                    break;
                
                default:
                    this.game.addToGameDisplay(`<div class="message">PERVERT!</div>`);
            }
            
            // Update UI
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'characterInteraction',
                character: noun,
                score: this.game.score
            });
        } catch (error) {
            console.error("Error seducing object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR SEDUCING OBJECT.</div>`);
        }
    }
    
    // Marry the girl
    marryObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">MARRY WHO?</div>`);
                return;
            }
            
            if (objectId !== 49) { // Girl
                this.game.addToGameDisplay(`<div class="message">NO WAY, WIERDO!!</div>`);
                return;
            }
            
            // Check if we're in the marriage center
            if (this.game.currentRoom !== 12) {
                this.game.addToGameDisplay(`<div class="message">NOT POSSIBLE RIGHT NOW</div>`);
                return;
            }
            
            // Check if girl is present (girl counter should be 4)
            if (this.game.flags.girlPoints !== 4) {
                this.game.addToGameDisplay(`<div class="message">NO GIRL!!</div>`);
                return;
            }
            
            // Check if player has enough money
            if (this.game.money < 30) {
                this.game.addToGameDisplay(`<div class="message">THE GIRL SAYS 'BUT YOU'LL NEED $2000 FOR THE HONEYMOON SUITE!</div>`);
                if (this.game.money < 20) {
                    this.game.addToGameDisplay(`<div class="message">THE PREACHER SAYS 'I'LL NEED $1000 ALSO!'</div>`);
                }
                return;
            }
            
            // Perform marriage
            this.game.addToGameDisplay(`<div class="message">OK</div>`);
            setTimeout(() => {
                this.game.addToGameDisplay(`<div class="message">WHY AM I DOING THIS!?!?!</div>`);
                this.game.flags.girlPoints = 5;
                this.game.money -= 30;
                
                // Publish money changed event
                eventBus.publish(GameEvents.MONEY_CHANGED, {
                    previousAmount: this.game.money + 30,
                    currentAmount: this.game.money
                });
                
                this.game.addToGameDisplay(`<div class="message">THE PREACHER TAKES $1000 AND WINKS!</div>`);
                this.game.addToGameDisplay(`<div class="message">THE GIRL GRABS $2000 AND SAYS 'MEET ME AT THE HONEYMOON SUITE! I'VE GOT CONNECTIONS TO GET A ROOM THERE!!</div>`);
                
                // Update quest state
                this.quests.girlDisco.step = 2;
                
                // Move girl to honeymoon suite (use EventBus for room object management)
                eventBus.publish(GameEvents.ROOM_OBJECT_REMOVE_REQUESTED, {
                    roomId: 12,
                    objectId: 49
                });
                
                eventBus.publish(GameEvents.ROOM_OBJECT_ADD_REQUESTED, {
                    roomId: 16,
                    objectId: 49
                });
                
                // Publish character interaction event
                eventBus.publish(GameEvents.CHARACTER_INTERACTION, {
                    characterId: 49,
                    action: 'marry',
                    state: 'married',
                    newLocation: 16
                });
            }, 1000);
        } catch (error) {
            console.error("Error in marryObject:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR DURING MARRIAGE.</div>`);
        }
    }
    
    // Handler for when items are removed from inventory (dropped or otherwise)
    handleItemRemoved(itemId) {
        // Process special gift interactions based on context
        const currentRoom = this.game.currentRoom;
        
        if (currentRoom === 21) { // In disco
            // Handle disco girl gifts
            if ([60, 57, 51].includes(itemId) && this.game.flags.girlPoints < 3) {
                // Update quest progress
                if (!this.quests.girlDisco.started) {
                    this.quests.girlDisco.started = true;
                }
                
                this.quests.girlDisco.step++;
                
                // Check if all gifts have been given
                if (this.game.flags.girlPoints === 3) {
                    // Advance quest to next phase
                    eventBus.publish(GameEvents.QUEST_UPDATED, {
                        quest: 'girlDisco',
                        status: 'advancedToMarriage',
                        step: this.quests.girlDisco.step
                    });
                }
            }
        } else if (currentRoom === 26 && itemId === 75) { // Apple to jacuzzi girl
            // Start the jacuzzi quest if not already started
            if (!this.quests.jacuzziGirl.started) {
                this.quests.jacuzziGirl.started = true;
                this.quests.jacuzziGirl.step = 1;
                
                eventBus.publish(GameEvents.QUEST_UPDATED, {
                    quest: 'jacuzziGirl',
                    status: 'started',
                    step: 1
                });
            }
        }
    }
    
    // Handle room changes to trigger special events
    handleRoomChange(previousRoom, currentRoom) {
        // First entry to a room might trigger special events
        if (previousRoom !== currentRoom) {
            // Check for special room entry events
            this.checkSpecialRoomEntry(currentRoom, previousRoom);
        }
    }
    
    // Check for special events when entering a room
    checkSpecialRoomEntry(roomId, previousRoomId) {
        switch(roomId) {
            case 9: // Hooker's room
                if (!this.quests.hookerRescue.started) {
                    this.quests.hookerRescue.started = true;
                    eventBus.publish(GameEvents.QUEST_UPDATED, {
                        quest: 'hookerRescue',
                        status: 'started',
                        step: 1
                    });
                }
                break;
                
            case 16: // Honeymoon suite
                if (this.quests.girlDisco.step === 2 && !this.eventTriggers.honeymoonEntrance) {
                    this.game.addToGameDisplay(`<div class="message">THE GIRL IS WAITING FOR YOU ON THE BED...</div>`);
                    this.eventTriggers.honeymoonEntrance = true;
                }
                break;
                
            case 26: // Jacuzzi
                if (!this.quests.jacuzziGirl.started) {
                    this.game.addToGameDisplay(`<div class="message">THERE'S A BEAUTIFUL GIRL RELAXING IN THE JACUZZI...</div>`);
                }
                break;
        }
    }
    
    // Handle special character interactions
    handleCharacterInteraction(characterId, action, itemId) {
        // This method handles interactions triggered from other modules
        
        if (characterId === 49) { // Girl
            if (action === 'gift' && itemId === 72) { // Give wine
                if (this.game.currentRoom === 16 && this.game.flags.girlPoints >= 5) {
                    this.game.addToGameDisplay(`<div class="message">SHE TAKES THE WINE AND DRINKS NERVOUSLY...</div>`);
                    this.game.flags.wineBottle = 1;
                    
                    // Update quest state
                    if (this.quests.girlDisco.step === 2) {
                        this.quests.girlDisco.step = 3;
                    }
                }
            }
        }
    }
    
    // Dance in the disco
    dance() {
        try {
            // Check if we're in the disco
            if (this.game.currentRoom !== 21) {
                this.game.addToGameDisplay(`<div class="message">NO ROOM TO DANCE HERE</div>`);
                return;
            }
            
            this.game.addToGameDisplay(`<div class="message">I START DANCING!</div>`);
            
            // Improve dancing interaction to help with girl quest
            if (this.quests.girlDisco.started && !this.eventTriggers.danced) {
                this.game.addToGameDisplay(`<div class="message">THE GIRL WATCHES ME DANCE AND SEEMS IMPRESSED!</div>`);
                this.eventTriggers.danced = true;
                
                // Dancing helps with the girl quest
                eventBus.publish(GameEvents.CHARACTER_INTERACTION, {
                    characterId: 49,
                    action: 'dance',
                    reaction: 'positive'
                });
            }
            
            let danceCount = 0;
            const danceMoves = () => {
                if (danceCount >= 5) {
                    this.game.addToGameDisplay(`<div class="message">I GOT THE STEPS, MAN!!</div>`);
                    return;
                }
                
                this.game.addToGameDisplay(`<div class="message">BOOGIE WOOGIE!!!!</div>`);
                setTimeout(() => {
                    this.game.addToGameDisplay(`<div class="message">YEH YEH YEH!!!</div>`);
                    danceCount++;
                    setTimeout(danceMoves, 500);
                }, 500);
            };
            
            danceMoves();
        } catch (error) {
            console.error("Error dancing:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR DANCING.</div>`);
        }
    }
    
    // Jump (special case for window)
    jump() {
        try {
            if (this.game.currentRoom === 8) {
                this.game.addToGameDisplay(`<div class="message">AAAAAEEEEEIIIIIIII!!!!!!!!!</div>`);
                this.game.addToGameDisplay(`<div class="message">SPLAAATTTTT!!!!!</div>`);
                
                // Game over
                eventBus.publish(GameEvents.GAME_OVER, {
                    reason: "Jumped out window",
                    score: this.game.score
                });
            } else {
                this.game.addToGameDisplay(`<div class="message">WHOOOPEEEEE!!!</div>`);
            }
        } catch (error) {
            console.error("Error jumping:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR JUMPING.</div>`);
        }
    }
    
    // Play mini games (slots or blackjack)
    playGame(gameType) {
        try {
            if (gameType && gameType.toUpperCase() === "SLOTS") {
                // Check if we're in the casino
                if (this.game.currentRoom !== 13) {
                    this.game.addToGameDisplay(`<div class="message">THERE ARE NO SLOT MACHINES HERE</div>`);
                    return;
                }
                
                // Launch slots mini game
                eventBus.publish(GameEvents.MINIGAME_STARTED, {
                    game: "SLOTS",
                    money: this.game.money
                });
            } else if (gameType && gameType.toUpperCase() === "21") {
                // Check if we're in the 21 room
                if (this.game.currentRoom !== 14) {
                    this.game.addToGameDisplay(`<div class="message">THERE ARE NO CARD GAMES HERE</div>`);
                    return;
                }
                
                // Launch blackjack mini game
                eventBus.publish(GameEvents.MINIGAME_STARTED, {
                    game: "BLACKJACK",
                    money: this.game.money
                });
            } else {
                this.game.addToGameDisplay(`<div class="message">I DON'T KNOW HOW TO PLAY THAT</div>`);
            }
        } catch (error) {
            console.error("Error playing game:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR PLAYING GAME.</div>`);
        }
    }
    
    // Call a number
    callNumber(number) {
        try {
            // Check if we're near a phone
            if (this.game.currentRoom !== 20) {
                this.game.addToGameDisplay(`<div class="message">THERE'S NO PHONE HERE</div>`);
                return;
            }
            
            // Handle different numbers
            if (number === "555-6969") {
                // Adult service
                this.game.addToGameDisplay(`<div class="message">A VOICE SAYS 'HELLO, PLEASE ANSWER THE QUESTIONS WITH ONE WORD ANSWERS!</div>`);
                
                // Start the Q&A sequence
                this.game.phoneCallQA = true;
                this.game.phoneCallDetails = {};
                
                this.game.addToGameDisplay(`<div class="system-message">
                    WHAT'S YOUR FAVORITE GIRLS NAME?
                    <input type="text" id="phone-answer">
                    <button id="phone-submit">SUBMIT</button>
                </div>`);
                
                // Setup phone dialog event
                eventBus.publish(GameEvents.PHONE_DIALOG_STARTED, {
                    type: 'questionSequence',
                    questionCount: 5
                });
            } else if (number === "555-0987") {
                // Wine delivery service
                if (this.game.flags.girlPoints === 5) {
                    this.game.addToGameDisplay(`<div class="message">A VOICE ANSWERS AND SAYS 'WINE FOR THE NERVOUS NEWLYWEDS!! COMING RIGHT UP!!!!</div>`);
                    this.game.flags.girlPoints = 6;
                    
                    // Add wine to honeymoon suite
                    eventBus.publish(GameEvents.ROOM_OBJECT_ADD_REQUESTED, {
                        roomId: 16,
                        objectId: 72
                    });
                    
                    // Update quest
                    if (this.quests.girlDisco.step === 2) {
                        this.quests.girlDisco.step = 3;
                        
                        eventBus.publish(GameEvents.QUEST_UPDATED, {
                            quest: 'girlDisco',
                            status: 'wineOrdered',
                            step: 3
                        });
                    }
                } else {
                    this.game.addToGameDisplay(`<div class="message">SOMEBODY ANSWERS AND HANGS UP!!!!</div>`);
                }
            } else if (number === "555-0439") {
                // Easter egg
                this.game.addToGameDisplay(`<div class="message">HI THERE!!! THIS IS CHUCK (THE AUTHOR OF THIS ABSURD GAME). IF YOU'RE A VOLUPTOUS BLONDE WHO'S LOOKING FOR A GOOD TIME THEN CALL ME IMMEDIATELY!!!!</div>`);
            } else {
                this.game.addToGameDisplay(`<div class="message">NOBODY ANSWERS</div>`);
            }
        } catch (error) {
            console.error("Error calling number:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR DURING CALL.</div>`);
        }
    }
    
    // Answer a call
    answerCall() {
        try {
            // Check if we're near a phone
            if (!this.game.isObjectInRoom(34)) {
                this.game.addToGameDisplay(`<div class="message">NO PHONE HERE</div>`);
                return;
            }
            
            // Check if phone is ringing
            if (this.game.currentRoom === 30 && this.game.telephoneRinging) {
                this.game.telephoneRinging = false;
                this.game.addToGameDisplay(`<div class="message">A GIRL SAYS 'HI HONEY! THIS IS ${this.game.phoneCallDetails.name}.</div>`);
                this.game.addToGameDisplay(`<div class="message">DEAR, WHY DON'T YOU FORGET THIS GAME AND ${this.game.phoneCallDetails.activity} WITH ME???</div>`);
                this.game.addToGameDisplay(`<div class="message">AFTER ALL, YOUR ${this.game.phoneCallDetails.bodyPart} HAS ALWAYS TURNED ME ON!!!!'</div>`);
                this.game.addToGameDisplay(`<div class="message">SO BRING A ${this.game.phoneCallDetails.object} AND COME</div>`);
                this.game.addToGameDisplay(`<div class="message">PLAY WITH MY ${this.game.phoneCallDetails.herBodyPart} !!!!</div>`);
                this.game.addToGameDisplay(`<div class="message">SHE HANGS UP!!</div>`);
                
                // Publish phone call event
                eventBus.publish(GameEvents.PHONE_CALL_COMPLETED, {
                    callType: 'personal',
                    details: { ...this.game.phoneCallDetails }
                });
            } else {
                this.game.addToGameDisplay(`<div class="message">IT'S NOT RINGING!</div>`);
            }
        } catch (error) {
            console.error("Error answering call:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR ANSWERING CALL.</div>`);
        }
    }
    
    // Process phone call answer
    processPhoneAnswer(answer) {
        try {
            if (!this.game.phoneCallQA) return;
            
            if (!this.game.phoneCallDetails.name) {
                this.game.phoneCallDetails.name = answer;
                this.game.addToGameDisplay(`<div class="system-message">
                    NAME A NICE PART OF HER ANATOMY.
                    <input type="text" id="phone-answer">
                    <button id="phone-submit">SUBMIT</button>
                </div>`);
                
                // Update dialog progress
                eventBus.publish(GameEvents.PHONE_DIALOG_UPDATED, {
                    question: 2,
                    answer: answer
                });
            } else if (!this.game.phoneCallDetails.herBodyPart) {
                this.game.phoneCallDetails.herBodyPart = answer;
                this.game.addToGameDisplay(`<div class="system-message">
                    WHAT DO YOU LIKE TO DO WITH HER?
                    <input type="text" id="phone-answer">
                    <button id="phone-submit">SUBMIT</button>
                </div>`);
                
                // Update dialog progress
                eventBus.publish(GameEvents.PHONE_DIALOG_UPDATED, {
                    question: 3,
                    answer: answer
                });
            } else if (!this.game.phoneCallDetails.activity) {
                this.game.phoneCallDetails.activity = answer;
                this.game.addToGameDisplay(`<div class="system-message">
                    AND THE BEST PART OF YOUR BODY?!?
                    <input type="text" id="phone-answer">
                    <button id="phone-submit">SUBMIT</button>
                </div>`);
                
                // Update dialog progress
                eventBus.publish(GameEvents.PHONE_DIALOG_UPDATED, {
                    question: 4,
                    answer: answer
                });
            } else if (!this.game.phoneCallDetails.bodyPart) {
                this.game.phoneCallDetails.bodyPart = answer;
                this.game.addToGameDisplay(`<div class="system-message">
                    FINALLY, YOUR FAVORITE OBJECT?
                    <input type="text" id="phone-answer">
                    <button id="phone-submit">SUBMIT</button>
                </div>`);
                
                // Update dialog progress
                eventBus.publish(GameEvents.PHONE_DIALOG_UPDATED, {
                    question: 5,
                    answer: answer
                });
            } else if (!this.game.phoneCallDetails.object) {
                this.game.phoneCallDetails.object = answer;
                this.game.phoneCallQA = false;
                this.game.telephoneRinging = true;
                this.game.addToGameDisplay(`<div class="message">HE HANGS UP!!!!!</div>`);
                
                // Notify phone dialog completion
                eventBus.publish(GameEvents.PHONE_DIALOG_COMPLETED, {
                    answers: { ...this.game.phoneCallDetails }
                });
                
                // Set telephone ringing in penthouse
                eventBus.publish(GameEvents.PHONE_RINGING, {
                    roomId: 30,
                    callDetails: { ...this.game.phoneCallDetails }
                });
            }
        } catch (error) {
            console.error("Error processing phone answer:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR DURING CALL.</div>`);
        }
    }
    
    // Update score and publish score changed event
    updateScore(points) {
        const oldScore = this.game.score;
        this.game.score += points;
        
        // Publish score changed event
        eventBus.publish(GameEvents.SCORE_CHANGED, {
            previousScore: oldScore,
            currentScore: this.game.score,
            maxScore: 3
        });
    }
    
    // Get object ID from noun
    getObjectId(noun) {
        try {
            if (!noun) return null;
            
            noun = noun.toUpperCase();
            
            // Simple matching by the first 4 characters
            const nounPrefix = noun.length >= 4 ? noun.substring(0, 4) : noun;
            
            for (const [objId, name] of Object.entries(this.game.objectNames)) {
                if (name.toUpperCase().includes(nounPrefix)) {
                    return parseInt(objId);
                }
            }
            
            return null;
        } catch (error) {
            console.error("Error getting object ID:", error);
            return null;
        }
    }
}
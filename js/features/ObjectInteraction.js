/**
 * ObjectInteraction - Handles interactions with objects
 * Manages examining, using, opening, and other object actions
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';
import { objectNames, objectTypes } from '../data/objects.js';
import { specialTexts } from '../data/text.js';

export default class ObjectInteraction {
    constructor(game) {
        this.game = game;
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => {
            // Handle object interaction commands
            switch (data.verb) {
                case "LOOK":
                case "EXAMINE":
                case "READ":
                    this.lookAt(data.noun);
                    break;
                case "OPEN":
                    this.openObject(data.noun);
                    break;
                case "USE":
                case "WEAR":
                    this.useObject(data.noun);
                    break;
                case "PUSH":
                case "PRESS":
                    this.pushObject(data.noun);
                    break;
                case "BREAK":
                case "SMASH":
                    this.breakObject(data.noun);
                    break;
                case "CLIMB":
                    this.climbObject(data.noun);
                    break;
                case "FILL":
                    this.fillObject(data.noun);
                    break;
                case "INFLATE":
                    this.inflateObject(data.noun);
                    break;
                case "CUT":
                    this.cutObject(data.noun);
                    break;
                case "TV":
                    this.tvPower(data.noun);
                    break;
                case "WATER":
                    this.waterControl(data.noun);
                    break;
            }
        });
    }
    
    // Look at an object
    lookAt(noun) {
        try {
            if (!noun) {
                // Just display the room if no noun
                eventBus.publish(GameEvents.ROOM_CHANGED, {
                    previousRoom: this.game.currentRoom,
                    currentRoom: this.game.currentRoom,
                    roomName: this.game.roomDescriptions[this.game.currentRoom],
                    availableDirections: this.game.getAvailableDirections(),
                    roomObjects: this.game.getRoomObjects()
                });
                return;
            }
            
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!!</div>`);
                return;
            }
            
            // Check if the object is in the room or inventory
            if (!this.game.isObjectInRoom(objectId) && !this.game.isObjectInInventory(objectId)) {
                this.game.addToGameDisplay(`<div class="message">IT'S NOT HERE!!!!!</div>`);
                return;
            }
            
            // Handle special object examinations
            this.handleObjectExamination(objectId);
            
            // Update UI after examining objects (may reveal new items)
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'objectExamined',
                objectId: objectId,
                objectName: this.game.getItemName(objectId),
                roomObjects: this.game.roomObjects[this.game.currentRoom] || []
            });
        } catch (error) {
            console.error("Error looking at object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR EXAMINING OBJECT.</div>`);
        }
    }
    
    // Handle special object examinations
    handleObjectExamination(objectId) {
        switch (objectId) {
            case 8: // Desk
                if (this.game.flags.drawerOpened === 1 && this.game.flags.drawerExamined === 0) {
                    this.game.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                    this.game.flags.drawerExamined = 2;
                    this.addToRoom(50); // Add newspaper
                } else if (this.game.flags.drawerOpened === 0) {
                    this.game.addToGameDisplay(`<div class="message">IT'S DRAWER IS SHUT</div>`);
                } else {
                    this.game.addToGameDisplay(`<div class="message">JUST AN ORDINARY DESK</div>`);
                }
                break;
                
            case 9: // Washbasin
                if (this.game.flags.toiletExamined === 0) {
                    this.game.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                    this.game.flags.toiletExamined = 1;
                    this.addToRoom(51); // Add wedding ring
                } else {
                    this.game.addToGameDisplay(`<div class="message">DEAD COCKROACHES....</div>`);
                }
                break;
                
            case 10: // Graffiti
                this.showGraffiti();
                break;
                
            case 11: // Mirror
                this.game.addToGameDisplay(`<div class="message">THERE'S A PERVERT LOOKING BACK AT ME!!!</div>`);
                break;
                
            case 12: // Toilet
                this.game.addToGameDisplay(`<div class="message">HASN'T BEEN FLUSHED IN AGES! STINKS!!!!</div>`);
                break;
                
            case 17: // Hooker
                this.hookerLook();
                break;
                
            case 18: // Billboard
                this.lookBillboard();
                break;
                
            case 20: // TV
                if (this.game.flags.tvOn === 0) {
                    this.game.addToGameDisplay(`<div class="message">ONLY IF YOU TURN IT ON! SAY 'TV ON'</div>`);
                } else {
                    this.tvOnLook();
                }
                break;
                
            case 24: // Ashtray
                if (this.game.flags.ashtreyExamined === 0) {
                    this.game.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                    this.game.flags.ashtreyExamined = 1;
                    this.addToRoom(64); // Add passcard
                } else {
                    this.game.addToGameDisplay(`<div class="message">JUST CIGARETTE BUTTS</div>`);
                }
                break;
                
            case 25: // Blonde
                this.blondeLook();
                break;
                
            case 27: // Bum
                this.game.addToGameDisplay(`<div class="message">HE GRUMBLES- I'LL TELL YOU A STORY FOR A BOTTLE OF WINE.....</div>`);
                break;
                
            case 28: // Peephole
                this.peepholeLook();
                break;
                
            case 29: // Display rack
                if (this.game.flags.magazineFound === 0) {
                    this.game.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                    this.game.flags.magazineFound = 1;
                    this.addToRoom(68); // Add magazine
                } else {
                    this.game.addToGameDisplay(`<div class="message">JUST A DISPLAY RACK</div>`);
                }
                break;
                
            case 30: // Door
                if (this.game.currentRoom === 23) {
                    if (this.game.flags.doorUnlocked === 0) {
                        this.game.addToGameDisplay(`<div class="message">A SIGN SAYS 'ENTRY BY SHOWING PASSCARD- CLUB MEMBERS AND THEIR GUESTS ONLY!</div>`);
                    } else {
                        this.game.addToGameDisplay(`<div class="message">IT'S UNLOCKED</div>`);
                    }
                } else {
                    this.game.addToGameDisplay(`<div class="message">IT'S A DOOR</div>`);
                }
                break;
                
            case 34: // Telephone
                if (this.game.currentRoom === 20) {
                    this.game.addToGameDisplay(`<div class="message">A NUMBER IS THERE- 'CALL 555-6969 FOR A GOOD TIME!'</div>`);
                } else {
                    this.game.addToGameDisplay(`<div class="message">IT LOOKS LIKE A TELEPHONE</div>`);
                }
                break;
                
            case 35: // Closet
                if (this.game.flags.closetOpened === 0) {
                    this.game.addToGameDisplay(`<div class="message">IT'S CLOSED</div>`);
                } else {
                    if (this.game.flags.closetOpened === 1) {
                        this.game.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                        this.game.flags.closetOpened = 2;
                        this.addToRoom(74); // Add doll
                    } else {
                        this.game.addToGameDisplay(`<div class="message">IT'S OPEN</div>`);
                    }
                }
                break;
                
            case 42: // Cabinet
                if (this.game.flags.stoolUsed === 0) {
                    this.game.addToGameDisplay(`<div class="message">IT'S TOO HIGH!</div>`);
                } else if (this.game.flags.cabinetOpened === 1) {
                    this.game.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                    this.game.flags.cabinetOpened = 2;
                    this.addToRoom(76); // Add pitcher
                } else if (this.game.flags.cabinetOpened >= 2) {
                    this.game.addToGameDisplay(`<div class="message">IT'S EMPTY NOW</div>`);
                }
                break;
                
            case 45: // Tree
                this.game.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                this.addToRoom(75); // Add apple
                break;
                
            case 47: // Plant
                if (!this.game.flags.bushesFound) {
                    this.game.addToGameDisplay(`<div class="message">THERE'S A GROUP OF BUSHES BEHIND IT!!</div>`);
                    this.game.flags.bushesFound = 1;
                    this.addToRoom(44); // Add bushes
                } else {
                    this.game.addToGameDisplay(`<div class="message">IT'S A NICE PLANT.</div>`);
                }
                break;
                
            case 49: // Girl
                if (this.game.currentRoom === 26) {
                    this.girlLookRoom26();
                } else {
                    this.girlLook();
                }
                break;
                
            case 50: // Newspaper
                this.readNewspaper();
                break;
                
            case 56: // Garbage
                if (this.game.flags.dumpsterChecked === 0) {
                    this.game.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                    this.game.flags.dumpsterChecked = 1;
                    this.addToRoom(58); // Add apple core
                } else {
                    this.game.addToGameDisplay(`<div class="message">JUST TRASH</div>`);
                }
                break;
                
            case 58: // Apple core
                if (this.game.flags.appleCore === 0) {
                    this.game.addToGameDisplay(`<div class="message">I SEE SOMETHING!!</div>`);
                    this.game.flags.appleCore = 1;
                    this.addToRoom(59); // Add seeds
                } else {
                    this.game.addToGameDisplay(`<div class="message">JUST A CORE</div>`);
                }
                break;
                
            case 61: // Pills
                this.game.addToGameDisplay(`<div class="message">THE LABEL ON THE BOTTLE SAYS 'WANT TO DRIVE SOMEONE CRAZY WITH LUST?? TRY THIS!!!!</div>`);
                break;
                
            case 68: // Magazine
                this.readMagazine();
                break;
                
            case 69: // Rubber
                this.lookRubber();
                break;
                
            case 73: // Wallet
                this.game.addToGameDisplay(`<div class="message">IT CONTAINS $${this.game.money}00</div>`);
                break;
                
            case 74: // Inflatable doll
                if (this.game.flags.idInflated === 1) {
                    this.game.addToGameDisplay(`<div class="message">IT'S INFLATED</div>`);
                } else {
                    this.game.addToGameDisplay(`<div class="message">IT'S ROLLED UP IN A LITTLE BALL!</div>`);
                }
                break;
                
            case 76: // Pitcher
                if (this.game.flags.pitcherFull === 0) {
                    this.game.addToGameDisplay(`<div class="message">IT'S EMPTY</div>`);
                } else {
                    this.game.addToGameDisplay(`<div class="message">IT'S FULL</div>`);
                }
                break;
                
            default:
                this.game.addToGameDisplay(`<div class="message">I SEE NOTHING SPECIAL</div>`);
        }
    }
    
    // Open an object
    openObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">OPEN WHAT?</div>`);
                return;
            }
            
            // Check if the object is in the room
            if (!this.game.isObjectInRoom(objectId) && !this.game.isObjectInInventory(objectId)) {
                this.game.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!</div>`);
                return;
            }
            
            // Handle specific openable objects
            switch(objectId) {
                case 8: // Desk
                    if (this.game.currentRoom === 1) {
                        if (this.game.flags.drawerOpened === 0) {
                            this.game.addToGameDisplay(`<div class="message">OK</div>`);
                            this.game.flags.drawerOpened = 1;
                        } else {
                            this.game.addToGameDisplay(`<div class="message">IT'S ALREADY OPEN</div>`);
                        }
                    } else {
                        this.game.addToGameDisplay(`<div class="message">NOT POSSIBLE RIGHT NOW</div>`);
                    }
                    break;
                
                case 30: // Door
                    if (this.game.currentRoom === 23) {
                        // The door to the disco
                        // Check if player has the passcard
                        if (this.game.isObjectInInventory(64)) {
                            this.game.addToGameDisplay(`<div class="message">A VOICE ASKS 'PASSCARD??' I SEARCH IN MY POCKETS AND I HAVE IT! THE DOOR OPENS!</div>`);
                            this.game.flags.doorUnlocked = 1;
                            // Update the room exits to include WEST
                            // Note: In a full implementation, we would modify roomExits
                        } else {
                            this.game.addToGameDisplay(`<div class="message">A VOICE ASKS 'PASSCARD??' I DON'T HAVE ONE.</div>`);
                        }
                    } else {
                        this.game.addToGameDisplay(`<div class="message">IT WON'T OPEN</div>`);
                    }
                    break;
                
                case 35: // Closet
                    if (this.game.currentRoom === 29) {
                        if (this.game.flags.closetOpened === 0) {
                            this.game.addToGameDisplay(`<div class="message">OK</div>`);
                            this.game.flags.closetOpened = 1;
                        } else {
                            this.game.addToGameDisplay(`<div class="message">IT'S ALREADY OPEN</div>`);
                        }
                    } else {
                        this.game.addToGameDisplay(`<div class="message">NOT POSSIBLE RIGHT NOW</div>`);
                    }
                    break;
                
                case 42: // Cabinet
                    if (this.game.currentRoom === 27) {
                        if (this.game.flags.stoolUsed === 0) {
                            this.game.addToGameDisplay(`<div class="message">IT'S TOO HIGH TO REACH!</div>`);
                        } else if (this.game.flags.cabinetOpened === 0) {
                            this.game.addToGameDisplay(`<div class="message">OK</div>`);
                            this.game.flags.cabinetOpened = 1;
                        } else {
                            this.game.addToGameDisplay(`<div class="message">IT'S ALREADY OPEN</div>`);
                        }
                    } else {
                        this.game.addToGameDisplay(`<div class="message">NOT POSSIBLE RIGHT NOW</div>`);
                    }
                    break;
                
                default:
                    this.game.addToGameDisplay(`<div class="message">I CAN'T OPEN THAT</div>`);
            }
            
            // Update UI after opening objects (may reveal new items)
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'objectOpened',
                objectId: objectId,
                objectName: this.game.getItemName(objectId),
                roomObjects: this.game.roomObjects[this.game.currentRoom] || []
            });
        } catch (error) {
            console.error("Error opening object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR OPENING OBJECT.</div>`);
        }
    }
    
    // Use/wear an object
    useObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">USE WHAT?</div>`);
                return;
            }
            
            // Check if the object is in inventory
            if (!this.game.isObjectInInventory(objectId)) {
                this.game.addToGameDisplay(`<div class="message">I DON'T HAVE THAT</div>`);
                return;
            }
            
            // Handle specific usable objects
            switch(objectId) {
                case 69: // Rubber
                    if (this.game.flags.wearingRubber === 0) {
                        this.game.addToGameDisplay(`<div class="message">OK, I PUT IT ON</div>`);
                        this.game.flags.wearingRubber = 1;
                    } else {
                        this.game.addToGameDisplay(`<div class="message">I'M ALREADY WEARING IT</div>`);
                    }
                    break;
                
                case 81: // Rope
                    if (this.game.currentRoom === 7 || this.game.currentRoom === 10) {
                        if (this.game.flags.usingRope === 0) {
                            this.game.flags.usingRope = 1;
                            this.game.addToGameDisplay(`<div class="message">OK</div>`);
                        } else {
                            this.game.addToGameDisplay(`<div class="message">I'M ALREADY USING IT</div>`);
                        }
                    } else {
                        this.game.addToGameDisplay(`<div class="message">NO POINT USING THAT HERE</div>`);
                    }
                    break;
                
                case 74: // Inflatable doll
                    if (this.game.flags.idInflated === 0) {
                        this.game.addToGameDisplay(`<div class="message">I NEED TO INFLATE IT FIRST</div>`);
                    } else if (this.game.flags.idInflated === 1) {
                        this.game.addToGameDisplay(`<div class="message">OH BOY!!!!!- IT'S GOT 3 SPOTS TO TRY!!!</div>`);
                        this.game.addToGameDisplay(`<div class="message">I THRUST INTO THE DOLL- KINKY....EH???</div>`);
                        this.game.addToGameDisplay(`<div class="message">I START TO INCREASE MY TEMPO...FASTER AND FASTER I GO!!!!</div>`);
                        this.game.addToGameDisplay(`<div class="message">SUDDENLY THERE'S A FLATULENT NOISE AND THE DOLL BECOMES A POPPED BALLOON SOARING AROUND THE ROOM! IT FLIES OUT OF THE ROOM AND DISAPPEARS!</div>`);
                        
                        // Remove the doll from inventory
                        const inventory = new Inventory(this.game);
                        inventory.removeFromInventory(74);
                        
                        this.game.flags.idInflated = 2; // Popped
                    } else {
                        this.game.addToGameDisplay(`<div class="message">THE DOLL IS GONE</div>`);
                    }
                    break;
                
                case 76: // Pitcher
                    if (this.game.flags.pitcherFull === 1) {
                        if (this.game.currentRoom === 28 && this.game.isObjectInRoom(59)) { // Seeds in garden
                            this.game.flags.pitcherFull = 0;
                            this.game.addToGameDisplay(`<div class="message">A TREE SPROUTS!!</div>`);
                            
                            // Remove seeds
                            const inventory = new Inventory(this.game);
                            inventory.removeFromRoom(28, 59);
                            
                            // Add tree if not present
                            if (!this.game.isObjectInRoom(45)) {
                                inventory.addToRoom(45);
                            }
                        } else {
                            this.game.addToGameDisplay(`<div class="message">IT POURS INTO THE GROUND</div>`);
                            this.game.flags.pitcherFull = 0;
                        }
                    } else {
                        this.game.addToGameDisplay(`<div class="message">THE PITCHER IS EMPTY</div>`);
                    }
                    break;
                
                case 66: // Knife
                    if (this.game.flags.tiedToBed === 1) {
                        this.game.addToGameDisplay(`<div class="message">I DO AND IT WORKED! THANKS!</div>`);
                        this.game.flags.tiedToBed = 0;
                    } else {
                        this.game.addToGameDisplay(`<div class="message">I DON'T WANT TO!</div>`);
                    }
                    break;
                
                case 84: // Remote control
                    if (this.game.isObjectInRoom(20)) { // If there's a TV in the room
                        this.game.addToGameDisplay(`<div class="system-message">
                            WHAT DO YOU WANT TO DO?
                            <button id="tv-on">TURN ON TV</button>
                            <button id="tv-off">TURN OFF TV</button>
                        </div>`);
                    } else {
                        this.game.addToGameDisplay(`<div class="message">NO TV HERE!</div>`);
                    }
                    break;
                
                default:
                    this.game.addToGameDisplay(`<div class="message">I CAN'T USE THAT</div>`);
            }
            
            // Update UI
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'objectUsed',
                objectId: objectId,
                objectName: this.game.getItemName(objectId)
            });
        } catch (error) {
            console.error("Error using object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR USING OBJECT.</div>`);
        }
    }
    
    // Push/press an object
    pushObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">PUSH WHAT?</div>`);
                return;
            }
            
            // Check if the object is in the room
            if (!this.game.isObjectInRoom(objectId) && !this.game.isObjectInInventory(objectId)) {
                this.game.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!</div>`);
                return;
            }
            
            // Handle specific pushable objects
            switch(objectId) {
                case 14: // Button in hallway
                    if (this.game.currentRoom === 3) {
                        // Button in bar opens the curtain
                        this.game.addToGameDisplay(`<div class="message">A VOICE ASKS 'WHATS THE PASSWORD?' (ONE WORD)</div>`);
                        this.game.addToGameDisplay(`<div class="system-message">
                            ENTER PASSWORD:
                            <input type="text" id="password-input">
                            <button id="submit-password">SUBMIT</button>
                        </div>`);
                    } else {
                        this.game.addToGameDisplay(`<div class="message">NOTHING HAPPENS</div>`);
                    }
                    break;
                
                case 77: // Stool
                    if (this.game.currentRoom === 27) {
                        if (this.game.flags.stoolUsed === 0) {
                            this.game.addToGameDisplay(`<div class="message">OK</div>`);
                            this.game.flags.stoolUsed = 1;
                        } else {
                            this.game.addToGameDisplay(`<div class="message">IT'S ALREADY POSITIONED</div>`);
                        }
                    } else {
                        this.game.addToGameDisplay(`<div class="message">PUSHING DOESN'T HELP</div>`);
                    }
                    break;
                
                case 46: // Window
                    if (this.game.currentRoom === 8) {
                        this.game.addToGameDisplay(`<div class="message">WON'T BUDGE</div>`);
                    } else {
                        this.game.addToGameDisplay(`<div class="message">NO WINDOW HERE</div>`);
                    }
                    break;
                
                default:
                    this.game.addToGameDisplay(`<div class="message">PUSHING DOESN'T HELP</div>`);
            }
            
            // Update UI
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'objectPushed',
                objectId: objectId,
                objectName: this.game.getItemName(objectId)
            });
        } catch (error) {
            console.error("Error pushing object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR PUSHING OBJECT.</div>`);
        }
    }
    
    // Break an object
    breakObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">BREAK WHAT?</div>`);
                return;
            }
            
            // Only window can be broken
            if (objectId !== 46) { // Window
                this.game.addToGameDisplay(`<div class="message">I CAN'T BREAK THAT</div>`);
                return;
            }
            
            // Check if we're at the window
            if (this.game.currentRoom !== 8) {
                this.game.addToGameDisplay(`<div class="message">IT'S NOT HERE!</div>`);
                return;
            }
            
            // Check if we have a hammer
            if (!this.game.isObjectInInventory(55)) {
                this.game.addToGameDisplay(`<div class="message">LET ME SEE IF I HAVE A HAMMER</div>`);
                this.game.addToGameDisplay(`<div class="message">I DON'T HAVE ONE</div>`);
                return;
            }
            
            // Break the window
            this.game.addToGameDisplay(`<div class="message">THE WINDOW SMASHES TO PIECES!</div>`);
            
            // Update room exits
            // In a full implementation, we would add WEST to room 8's exits
            
            // Update UI
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'objectBroken',
                objectId: objectId,
                objectName: this.game.getItemName(objectId)
            });
        } catch (error) {
            console.error("Error breaking object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR BREAKING OBJECT.</div>`);
        }
    }
    
    // Climb an object
    climbObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">CLIMB WHAT?</div>`);
                return;
            }
            
            // Special cases for climbing
            if (objectId === 77) { // Stool
                this.game.addToGameDisplay(`<div class="message">OK</div>`);
                this.game.flags.stoolUsed = 1;
            } else if (objectId === 44 && this.game.currentRoom === 15 && this.game.flags.bushesFound === 1) {
                // Climbing bushes in hotel lobby leads to garden
                this.game.currentRoom = 28;
                
                // Publish room changed event
                eventBus.publish(GameEvents.ROOM_CHANGED, {
                    previousRoom: 15,
                    currentRoom: 28,
                    direction: "CLIMB",
                    roomName: this.game.roomDescriptions[28] || `ROOM 28`,
                    availableDirections: this.game.getAvailableDirections(),
                    roomObjects: this.game.getRoomObjects()
                });
                
                // Display the new room
                const navigation = new Navigation(this.game);
                navigation.displayRoom();
            } else {
                this.game.addToGameDisplay(`<div class="message">I CAN'T CLIMB THAT</div>`);
            }
        } catch (error) {
            console.error("Error climbing object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR CLIMBING OBJECT.</div>`);
        }
    }
    
    // Fill an object
    fillObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">FILL WHAT?</div>`);
                return;
            }
            
            if (objectId === 76) { // Pitcher
                // Check if we have the pitcher
                if (!this.game.isObjectInInventory(76)) {
                    this.game.addToGameDisplay(`<div class="message">GET ME THE PITCHER SO I DON'T SPILL IT!</div>`);
                    return;
                }
                
                // Check if we're in the kitchen with water on
                if (this.game.currentRoom === 27 && this.game.flags.waterOn === 1) {
                    this.game.flags.pitcherFull = 1;
                    this.game.addToGameDisplay(`<div class="message">OK</div>`);
                } else if (this.game.currentRoom === 27) {
                    this.game.addToGameDisplay(`<div class="message">NO WATER!!!</div>`);
                } else {
                    this.game.addToGameDisplay(`<div class="message">FIND A WORKING SINK</div>`);
                }
            } else if (objectId === 82) { // Water
                this.game.addToGameDisplay(`<div class="message">I NEED SOMETHING TO PUT IT IN</div>`);
            } else {
                this.game.addToGameDisplay(`<div class="message">I CAN'T FILL THAT</div>`);
            }
        } catch (error) {
            console.error("Error filling object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR FILLING OBJECT.</div>`);
        }
    }
    
    // Inflate an object
    inflateObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">INFLATE WHAT?</div>`);
                return;
            }
            
            if (objectId !== 74) { // Doll
                this.game.addToGameDisplay(`<div class="message">BUT THE PRIME RATE IS ALREADY 257%!!</div>`);
                return;
            }
            
            // Check if we have the doll
            if (!this.game.isObjectInInventory(74)) {
                this.game.addToGameDisplay(`<div class="message">I CAN'T UNLESS I'M HOLDING IT CLOSE!!</div>`);
                return;
            }
            
            // Inflate it
            this.game.flags.idInflated = 1;
            this.game.addToGameDisplay(`<div class="message">OK</div>`);
        } catch (error) {
            console.error("Error inflating object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR INFLATING OBJECT.</div>`);
        }
    }
    
    // Cut an object with knife
    cutObject(noun) {
        try {
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">CUT WHAT?</div>`);
                return;
            }
            
            // Check if we have the knife
            if (!this.game.isObjectInInventory(66)) {
                this.game.addToGameDisplay(`<div class="message">I NEED A KNIFE</div>`);
                return;
            }
            
            // Only rope can be cut
            if (objectId === 81) { // Rope
                if (this.game.flags.tiedToBed === 1) {
                    this.game.flags.tiedToBed = 2;
                    this.game.addToGameDisplay(`<div class="message">I DO AND IT WORKED! THANKS!</div>`);
                    
                    // Cutting rope makes it unusable
                    const inventory = new Inventory(this.game);
                    inventory.removeFromInventory(81);
                } else {
                    this.game.addToGameDisplay(`<div class="message">I DON'T WANT TO!</div>`);
                }
            } else {
                this.game.addToGameDisplay(`<div class="message">I CAN'T CUT THAT</div>`);
            }
        } catch (error) {
            console.error("Error cutting object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR CUTTING OBJECT.</div>`);
        }
    }
    
    // TV power control
    tvPower(state) {
        try {
            // Check if there's a TV in the room
            if (!this.game.isObjectInRoom(20)) {
                this.game.addToGameDisplay(`<div class="message">THERE'S NO TV HERE</div>`);
                return;
            }
            
            if (state === "ON") {
                // Special case for room 5 - the pimp gets distracted
                if (this.game.currentRoom === 5) {
                    this.game.flags.tvOn = 1;
                    this.game.addToGameDisplay(`<div class="message">THE TV IS NOW ON</div>`);
                    this.tvOnLook();
                    if (this.game.score === 0) {
                        this.game.addToGameDisplay(`<div class="message">THE PIMP IS DISTRACTED BY THE TV</div>`);
                        // Makes it easier to go upstairs
                        this.game.flags.blondeGirlDrugged = 1;
                    }
                } else {
                    this.game.flags.tvOn = 1;
                    this.game.addToGameDisplay(`<div class="message">THE TV IS NOW ON</div>`);
                    this.tvOnLook();
                }
            } else {
                this.game.flags.tvOn = 0;
                this.game.addToGameDisplay(`<div class="message">THE TV IS NOW OFF</div>`);
            }
        } catch (error) {
            console.error("Error controlling TV:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR CONTROLLING TV.</div>`);
        }
    }
    
    // Water control
    waterControl(state) {
        try {
            // Check if we're in the kitchen
            if (this.game.currentRoom !== 27) {
                this.game.addToGameDisplay(`<div class="message">THERE'S NO WATER CONTROL HERE</div>`);
                return;
            }
            
            if (state === "ON") {
                this.game.flags.waterOn = 1;
                this.game.addToGameDisplay(`<div class="message">OK</div>`);
            } else {
                this.game.flags.waterOn = 0;
                this.game.addToGameDisplay(`<div class="message">OK</div>`);
            }
        } catch (error) {
            console.error("Error controlling water:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR CONTROLLING WATER.</div>`);
        }
    }
    
    // Get object ID from noun
    getObjectId(noun) {
        try {
            if (!noun) return null;
            
            noun = noun.toUpperCase();
            
            // Simple matching by the first 4 characters
            const nounPrefix = noun.length >= 4 ? noun.substring(0, 4) : noun;
            
            for (const [objId, name] of Object.entries(objectNames)) {
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
    
    // Add an item to the current room
    addToRoom(itemId) {
        try {
            if (!this.game.roomObjects[this.game.currentRoom]) {
                this.game.roomObjects[this.game.currentRoom] = [];
            }
            if (!this.game.roomObjects[this.game.currentRoom].includes(itemId)) {
                this.game.roomObjects[this.game.currentRoom].push(itemId);
                
                // Publish event for room objects changed
                eventBus.publish(GameEvents.ROOM_OBJECTS_CHANGED, {
                    roomId: this.game.currentRoom,
                    objects: this.game.roomObjects[this.game.currentRoom]
                });
            }
        } catch (error) {
            console.error("Error adding item to room:", error);
        }
    }
    
    // Special object interaction methods
    
    // Look at TV when it's on
    tvOnLook() {
        try {
            const channels = [
                `A MASKED MAN RUNS ACROSS THE SCREEN.\nJUMPING UP HE LANDS ON HIS HORSE AND YELLS 'HI-HO PLUTONIUM!!!!!\nHE RIDES OFF INTO A GREEN SKY.......\nNOTHING LIKE A GOOD OLD WESTERN TO PASS THE TIME.......`,
                `IT'S 'THE PRICE IS FRIGHT!!!!!!\n'AND NOW FOR OUR FAVORITE HOST..........HAUNTY MAULE!!!!!!!!!!\nHAUNTY JUMPS UP ON THE STAGE- HE ASKS 'AND WHO'S OUR FIRST LUCKY CONTESTANT?'\nTHE ANNOUNCER POINTS OUT A LADY...THE CROWD SCREAMS IN ECSTACY AS SHE'S DRAGGED TO THE STAGE............`,
                `CAPTAIN JERK LOOKS AT THE DOOR FROM WHICH BEHIND THE NOISE IS COMING.\nTHROWING OPEN THE DOOR- HIS FACE TURNS A DEEP RED!!!!!!!!!\nHE SAYS 'SCOTTY! WHAT ARE YOU DOING?? SCOTTY REPLIES 'BUT CAPTAIN!?!? MY GIRL AND I- WE'RE ENGAGED!!!!\nJERK COMMANDS 'WELL THEN DISENGAGE!'....AS THE STARSHIP THRUSTED FORWARD........PENETRATING DEEPER INTO SPACE..........`,
                `MR. RODJERKS JUMPS UP WITH HIS BIG SNEAKERS AND SAYS IN HIS CHEERY VOICE..\nGUESS WHAT- BOYS AND GIRLS?????? TODAY WE'RE GOING TO LEARN ABOUT SUCKERS!!\nSUSIE...SEE THE LOLLY-POP???? CAN YOU STICK IT IN YOUR MOUTH??? THAT'S RIGHT!\nTHAT'S A NICE LOLLY-POP....NICE AND HARD RIGHT?!?!?!?.................`,
                `CABLE TV!!!!!!!!\nTHERE SHOWING THE KINKIEST X-RATED MOVIES!!!!!!! THIS ONE'S TITLED 'DEEP NOSTRIL'.\nTHE PIMP LIKES THIS ONE!!!!!!\nHE'S ENGROSSED IN THE ACTION HE SEES!!!! SEEMS DISTRACTED.................`,
                `IT'S HAPPY DAZE!!!!!!!!\nRICHIE TURNS TO GONZY AND SAYS 'BUT YOU ALWAYS HAD IT MADE WITH THE GIRLS.......WHAT'S YOUR SECRET???'\nTHE GONZ SAYS 'AAYYYYYY....I DIDN'T GET MY NAME FOR NUTHIN!'\nREACHING INTO HIS POCKET HE PULLS OUT A FUNNY LOOKING CIGARETTE............`,
                `MRS. SMITH AND MRS. JONES ARE COMPARING\nDETERGENTS.......SEE THIS BLOUSE? WE'RE MAKING IT THIS DIRTY TO SEE WHO'S WORKS BETTER.(A DOG IS THROWN ONTO THE BLOUSE. IN HIS EXCITEMENT HE DEFICATES ALL OVER IT......)\nDO YOU THINK YOURS WILL WORK- MRS. SMITH?? (THE CAMERA PANS TO MRS. SMITH. SHE THROWS UP.)\nMRS JONES????? (A SHOT SHOWS HER TAKING THE DOG AND...........)`
            ];
            
            const randomChannel = channels[Math.floor(Math.random() * channels.length)];
            this.game.addToGameDisplay(`<div class="message" style="white-space: pre-line;">${randomChannel}</div>`);
        } catch (error) {
            console.error("Error in tvOnLook:", error);
            this.game.addToGameDisplay(`<div class="message">THE TV SEEMS TO BE MALFUNCTIONING.</div>`);
        }
    }
    
    // Look at the hooker
    hookerLook() {
        try {
            this.game.addToGameDisplay(`<div class="message">${specialTexts[1]}</div>`);
        } catch (error) {
            console.error("Error in hookerLook:", error);
            this.game.addToGameDisplay(`<div class="message">SHE LOOKS IMPATIENT.</div>`);
        }
    }
    
    // Look at blonde
    blondeLook() {
        try {
            this.game.addToGameDisplay(`<div class="message">${specialTexts[10]}</div>`);
        } catch (error) {
            console.error("Error in blondeLook:", error);
            this.game.addToGameDisplay(`<div class="message">THE BLONDE LOOKS ATTRACTIVE.</div>`);
        }
    }
    
    // Look at girl
    girlLook() {
        try {
            if (this.game.flags.girlPoints > 3) {
                this.game.addToGameDisplay(`<div class="message">SHE SLAPS ME AND YELLS 'PERVERT!!!!!!'</div>`);
            } else {
                this.game.addToGameDisplay(`<div class="message">${specialTexts[4]}</div>`);
            }
        } catch (error) {
            console.error("Error in girlLook:", error);
            this.game.addToGameDisplay(`<div class="message">SHE LOOKS AWAY.</div>`);
        }
    }
    
    // Look at girl in jacuzzi
    girlLookRoom26() {
        try {
            this.game.addToGameDisplay(`<div class="message">${specialTexts[5]}</div>`);
        } catch (error) {
            console.error("Error in girlLookRoom26:", error);
            this.game.addToGameDisplay(`<div class="message">SHE LOOKS RELAXED IN THE JACUZZI.</div>`);
        }
    }
    
    // Look through peephole
    peepholeLook() {
        try {
            let output = `<div class="message" style="white-space: pre-line;">HMMMM..... THIS IS A PEEPING TOMS PARADISE!!!!
            ACROSS THE WAY IS ANOTHER HOTEL. AHAH! THE CURTAINS ARE OPEN AT ONE WINDOW!
            THE BATHROOM DOOR OPENS AND A GIRL WALKS OUT. HOLY COW! HER BOOBS ARE HUGE- AND LOOK AT THE WAY THEY SWAY AS SHE STRIDES ACROSS THE ROOM!
            NOW SHE'S TAKING A LARGE SAUSAGE SHAPED OBJECT AND LOOKING AT IT LONGINGLY! DAMN! SHE SHUTS THE CURTAIN!</div>`;
            
            this.game.addToGameDisplay(output);
        } catch (error) {
            console.error("Error in peepholeLook:", error);
            this.game.addToGameDisplay(`<div class="message">I CAN SEE INTO ANOTHER ROOM.</div>`);
        }
    }
    
    // Show graffiti
    showGraffiti() {
        try {
            let output = `<div class="message" style="white-space: pre-line;">
            ****************************************************
            AT MY APPLE IS WHERE I SIT,
            WHEN I FEEL LIKE FONDLING IT'S BITS!
            
            COMPUTER FREAKS PEEK BEFORE THEY POKE
            I'D LIKE TO NIBBLE HER FLOPPIES!
            
            ASCII, AND YE SHALL RECEIVE
            
            THE PASSWORD IS:
            BELLYBUTTON
            ****************************************************</div>`;
            
            this.game.addToGameDisplay(output);
        } catch (error) {
            console.error("Error in showGraffiti:", error);
            this.game.addToGameDisplay(`<div class="message">THE GRAFFITI IS ILLEGIBLE.</div>`);
        }
    }
    
    // Look at billboard
    lookBillboard() {
        try {
            let output = `<div class="message" style="white-space: pre-line;">
            ****************************************************
            FOR THOSE WHO DESIRE THE BEST:
            
            ANNOUNCING
            
            THE MOST EXCLUSIVE,
            
            THE EXCITING,
            
            THE HOTTEST SPOT IN TOWN,
            
            SWINGING SINGLE'S DISCO
            ****************************************************</div>`;
            
            this.game.addToGameDisplay(output);
        } catch (error) {
            console.error("Error in lookBillboard:", error);
            this.game.addToGameDisplay(`<div class="message">THE BILLBOARD HAS AN AD FOR A DISCO.</div>`);
        }
    }
    
    // Read newspaper
    readNewspaper() {
        try {
            let output = `<div class="message" style="white-space: pre-line;">THE NEWS!!!
            TODAY THE PRIME RATE WAS RAISED ONCE AGAIN...TO 257%! THIS DOES NOT COME NEAR THE RECORD SET IN 1996- WHEN IT BROKE 
            THE 1000% MARK.........................
            THE BIRTH RATE HAS TAKEN A DRAMATIC FALL....THIS IS DUE TO THE INCREASED USAGE OF COMPUTERS AS SEXUAL PARTNERS..
            HOWEVER....RAPES OF INNOCENT PEOPLE ARE ON THE INCREASE! AND WHO IS THE RAPIST?? COMPUTERIZED BANKING MACHINES LEAD THE LIST....FOLLOWED BY HOME COMPUTERS.....</div>`;
            
            this.game.addToGameDisplay(output);
        } catch (error) {
            console.error("Error in readNewspaper:", error);
            this.game.addToGameDisplay(`<div class="message">THE NEWSPAPER HAS SOME ECONOMIC NEWS.</div>`);
        }
    }
    
    // Read magazine
    readMagazine() {
        try {
            let output = `<div class="message" style="white-space: pre-line;">HMMMMM..... AN INTERESTING MAGAZINE WITH A NICE CENTERFOLD!
            THE FEATURE ARTICLE IS ABOUT HOW TO PICK UP AN INNOCENT GIRL AT A DISCO.
            IT SAYS- 'SHOWER HER WITH PRESENTS. DANCING WON'T HURT EITHER.
            AND WINE IS ALWAYS GOOD TO GET THINGS MOVING!'</div>`;
            
            this.game.addToGameDisplay(output);
        } catch (error) {
            console.error("Error in readMagazine:", error);
            this.game.addToGameDisplay(`<div class="message">THE MAGAZINE HAS DATING ADVICE.</div>`);
        }
    }
    
    // Look at rubber
    lookRubber() {
        try {
            const color = this.game.rubberProperties.color || "GENERIC";
            const flavor = this.game.rubberProperties.flavor || "UNFLAVORED";
            const lubricated = this.game.rubberProperties.lubricated ? "LUBRICATED" : "NON-LUBRICATED";
            const ribbed = this.game.rubberProperties.ribbed ? "RIBBED" : "SMOOTH";
            
            if (!this.game.rubberProperties.color) {
                this.game.addToGameDisplay(`<div class="message">IT'S A RUBBER.</div>`);
            } else {
                this.game.addToGameDisplay(`<div class="message">IT'S ${color}, ${flavor}-FLAVORED, ${lubricated}, AND ${ribbed}</div>`);
            }
        } catch (error) {
            console.error("Error in lookRubber:", error);
            this.game.addToGameDisplay(`<div class="message">IT'S A RUBBER.</div>`);
        }
    }
}
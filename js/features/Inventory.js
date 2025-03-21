/**
 * Inventory - Manages the player's inventory
 * Handles taking, dropping, and using objects
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';
import { objectNames, objectTypes } from '../data/objects.js';

export default class Inventory {
    constructor(game) {
        this.game = game;
        this.maxItems = 8; // Maximum inventory size
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => {
            // Handle inventory-related commands
            switch (data.verb) {
                case "TAKE":
                case "GET":
                    this.takeObject(data.noun);
                    break;
                case "DROP":
                case "GIVE":
                    this.dropObject(data.noun);
                    break;
                case "INVENTORY":
                    this.showInventory();
                    break;
            }
        });
    }
    
    // Add an item to inventory
    addToInventory(itemId) {
        try {
            if (!this.game.inventory.includes(itemId)) {
                this.game.inventory.push(itemId);
                
                // Publish inventory changed event
                eventBus.publish(GameEvents.INVENTORY_CHANGED, {
                    action: 'added',
                    itemId: itemId,
                    itemName: this.game.getItemName(itemId),
                    inventory: [...this.game.inventory]
                });
                
                // Publish specific item added event
                eventBus.publish(GameEvents.ITEM_ADDED, {
                    itemId: itemId,
                    itemName: this.game.getItemName(itemId)
                });
                
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error adding to inventory:", error);
            return false;
        }
    }
    
    // Remove an item from inventory
    removeFromInventory(itemId) {
        try {
            const index = this.game.inventory.indexOf(itemId);
            if (index !== -1) {
                this.game.inventory.splice(index, 1);
                
                // Publish inventory changed event
                eventBus.publish(GameEvents.INVENTORY_CHANGED, {
                    action: 'removed',
                    itemId: itemId,
                    itemName: this.game.getItemName(itemId),
                    inventory: [...this.game.inventory]
                });
                
                // Publish specific item removed event
                eventBus.publish(GameEvents.ITEM_REMOVED, {
                    itemId: itemId,
                    itemName: this.game.getItemName(itemId)
                });
                
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error removing from inventory:", error);
            return false;
        }
    }
    
    // Take an object from the current room
    takeObject(noun) {
        try {
            if (!noun) {
                this.game.addToGameDisplay(`<div class="message">TAKE WHAT?</div>`);
                return;
            }
            
            // Special case for inventory
            if (["INVENTORY", "INVE", "INV"].includes(noun.toUpperCase())) {
                this.showInventory();
                return;
            }
            
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">I DON'T SEE THAT HERE!!</div>`);
                return;
            }
            
            // Check if the object is in the room
            if (!this.game.isObjectInRoom(objectId)) {
                this.game.addToGameDisplay(`<div class="message">I DON'T SEE IT HERE!!</div>`);
                return;
            }
            
            // Check if we can take this object (some might be fixed in place)
            if (objectId < 50) {
                this.game.addToGameDisplay(`<div class="message">I CAN'T DO THAT</div>`);
                return;
            }
            
            // Check if we're in the pharmacy and trying to steal
            if (this.game.currentRoom === 24 && (objectId === 69 || objectId === 68)) {
                this.game.addToGameDisplay(`<div class="message">THE MAN SAYS SHOPLIFTER!! AND SHOOTS ME</div>`);
                eventBus.publish(GameEvents.GAME_OVER, {
                    reason: "Shot by shopkeeper",
                    score: this.game.score
                });
                return;
            }
            
            // Check if we're carrying too much
            if (this.game.inventory.length >= this.maxItems) {
                this.game.addToGameDisplay(`<div class="message">I'M CARRYING TOO MUCH!!!</div>`);
                return;
            }
            
            // Remove the object from the room
            this.removeFromRoom(this.game.currentRoom, objectId);
            
            // Add to inventory
            this.addToInventory(objectId);
            
            this.game.addToGameDisplay(`<div class="message">OK</div>`);
            
            // Update the room display
            eventBus.publish(GameEvents.ROOM_OBJECTS_CHANGED, {
                roomId: this.game.currentRoom,
                objects: this.game.roomObjects[this.game.currentRoom] || []
            });
        } catch (error) {
            console.error("Error taking object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR TAKING OBJECT.</div>`);
        }
    }
    
    // Drop an object into the current room
    dropObject(noun) {
        try {
            if (!noun) {
                this.game.addToGameDisplay(`<div class="message">DROP WHAT?</div>`);
                return;
            }
            
            // Convert noun to object ID
            const objectId = this.getObjectId(noun);
            
            if (!objectId) {
                this.game.addToGameDisplay(`<div class="message">I DON'T HAVE THAT!!</div>`);
                return;
            }
            
            // Check if the object is in inventory
            if (!this.game.isObjectInInventory(objectId)) {
                this.game.addToGameDisplay(`<div class="message">I DON'T HAVE IT!!</div>`);
                return;
            }
            
            // Remove from inventory and add to the room
            this.removeFromInventory(objectId);
            this.addToRoom(objectId);
            
            this.game.addToGameDisplay(`<div class="message">OK</div>`);
            
            // Process special drop interactions
            this.handleSpecialDrops(objectId);
            
            // Update the room display
            eventBus.publish(GameEvents.ROOM_OBJECTS_CHANGED, {
                roomId: this.game.currentRoom,
                objects: this.game.roomObjects[this.game.currentRoom] || []
            });
        } catch (error) {
            console.error("Error dropping object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR DROPPING OBJECT.</div>`);
        }
    }
    
    // Handle special drop interactions
    handleSpecialDrops(objectId) {
        // Special checks for giving items to characters
        if (this.game.currentRoom === 21) { // In the disco
            if (objectId === 60) { // Candy
                if (this.game.flags.candyGiven === 0 && this.game.flags.girlPoints < 3) {
                    this.game.flags.girlPoints += 1;
                    this.game.flags.candyGiven = 1;
                    this.game.addToGameDisplay(`<div class="message">SHE SMILES AND EATS A COUPLE!!</div>`);
                }
            } else if (objectId === 57) { // Flowers
                if (this.game.flags.girlPoints < 3) {
                    this.game.flags.girlPoints += 1;
                    this.game.addToGameDisplay(`<div class="message">SHE BLUSHES PROFUSELY AND PUTS THEM IN HER HAIR!</div>`);
                }
            } else if (objectId === 51) { // Wedding ring
                if (this.game.flags.girlPoints < 3) {
                    this.game.flags.girlPoints += 1;
                    this.game.addToGameDisplay(`<div class="message">SHE BLUSHES AND PUTS IT IN HER PURSE.</div>`);
                }
            }
            
            // Check if we've given all the gifts
            if (this.game.flags.girlPoints === 3) {
                this.game.addToGameDisplay(`<div class="message">SHE SAYS 'SEE YOU AT THE MARRIAGE CENTER!!</div>`);
                this.game.flags.girlPoints = 4;
                // Move the girl to the marriage center
                this.removeFromRoom(21, 49);
                this.addToRoomById(12, 49);
            }
        } else if (this.game.currentRoom === 22 && objectId === 72) { // Giving wine to bum
            if (this.game.flags.wineGiven === 0) {
                this.game.addToGameDisplay(`<div class="message">HE LOOKS AT ME AND STARTS TO SPEAK...</div>`);
                this.game.addToGameDisplay(`<div class="message">AFTER ALL YOU MAY GET IN A PROGRAM BUG</div>`);
                this.game.addToGameDisplay(`<div class="message">LIKE I DID!!!</div>`);
                this.game.addToGameDisplay(`<div class="message">HE THROWS UP AND GIVES ME BACK THE WINE</div>`);
                this.game.flags.wineGiven = 1;
                // Add a knife to the room
                this.addToRoom(66);
            }
        } else if (this.game.currentRoom === 26 && objectId === 75) { // Giving apple to girl in jacuzzi
            this.game.addToGameDisplay(`<div class="message">SHE TAKES THE APPLE AND RAISES IT TO HER MOUTH. WITH AN OUTRAGEOUSLY INNOCENT LOOK SHE TAKES A SMALL BITE OUT OF IT.</div>`);
            this.game.addToGameDisplay(`<div class="message">A SMILE COMES ACROSS HER FACE! SHE'S REALLY STARTING TO LOOK QUITE SEXY!!!!</div>`);
            this.game.addToGameDisplay(`<div class="message">SHE WINKS AND LAYS BACK INTO THE JACUZZI</div>`);
            this.game.flags.jacuzziApple = 1;
        } else if (this.game.currentRoom === 19 && objectId === 61 && this.game.flags.blondeGirlDrugged === 0) { // Giving pills to blonde
            this.game.addToGameDisplay(`<div class="message">THE BLONDE LOOKS AT THE PILLS AND SAYS 'THANKS!!! I LOVE THIS STUFF!'</div>`);
            this.game.addToGameDisplay(`<div class="message">SHE TAKES A PILL..........HER NIPPLES START TO STAND UP! WOW!!!!</div>`);
            this.game.addToGameDisplay(`<div class="message">SHE'S BREATHING HEAVILY....I HOPE SHE RAPES ME!!!!!</div>`);
            this.game.addToGameDisplay(`<div class="message">SHE SAYS 'SO LONG!!! I'M GOING TO GO SEE MY BOYFRIEND!' SHE DISAPPEARS DOWN THE STAIRS........</div>`);
            this.game.flags.blondeGirlDrugged = 1;
            // Remove blonde from the room
            this.removeFromRoom(19, 25);
        } else if (this.game.currentRoom === 1 && objectId === 52) { // Giving whiskey to guy in hallway
            this.game.addToGameDisplay(`<div class="message">THE GUY GIVES ME A TV CONTROLLER!!</div>`);
            this.removeFromInventory(52);
            this.addToRoom(84); // Add TV remote
        }
    }
    
    // Show inventory
    showInventory() {
        try {
            if (this.game.inventory.length === 0) {
                this.game.addToGameDisplay(`<div class="message">I'M CARRYING NOTHING!!</div>`);
                return;
            }
            
            let items = this.game.inventory.map(itemId => this.game.getItemName(itemId)).join(", ");
            this.game.addToGameDisplay(`<div class="message">I'M CARRYING THE FOLLOWING: ${items}</div>`);
        } catch (error) {
            console.error("Error showing inventory:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR VIEWING INVENTORY.</div>`);
        }
    }
    
    // Remove an item from a room
    removeFromRoom(roomId, itemId) {
        try {
            if (this.game.roomObjects[roomId] && this.game.roomObjects[roomId].includes(itemId)) {
                const index = this.game.roomObjects[roomId].indexOf(itemId);
                if (index !== -1) {
                    this.game.roomObjects[roomId].splice(index, 1);
                    
                    // Publish room objects changed event
                    eventBus.publish(GameEvents.ROOM_OBJECTS_CHANGED, {
                        roomId: roomId,
                        objects: this.game.roomObjects[roomId]
                    });
                    
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error("Error removing from room:", error);
            return false;
        }
    }
    
    // Add an item to the current room
    addToRoom(itemId) {
        try {
            if (!this.game.isObjectInRoom(itemId)) {
                if (!this.game.roomObjects[this.game.currentRoom]) {
                    this.game.roomObjects[this.game.currentRoom] = [];
                }
                this.game.roomObjects[this.game.currentRoom].push(itemId);
                
                // Publish room objects changed event
                eventBus.publish(GameEvents.ROOM_OBJECTS_CHANGED, {
                    roomId: this.game.currentRoom,
                    objects: this.game.roomObjects[this.game.currentRoom]
                });
                
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error adding to room:", error);
            return false;
        }
    }
    
    // Add an item to a specific room by ID
    addToRoomById(roomId, itemId) {
        try {
            if (!this.game.roomObjects[roomId]) {
                this.game.roomObjects[roomId] = [];
            }
            if (!this.game.roomObjects[roomId].includes(itemId)) {
                this.game.roomObjects[roomId].push(itemId);
                
                // Publish room objects changed event
                eventBus.publish(GameEvents.ROOM_OBJECTS_CHANGED, {
                    roomId: roomId,
                    objects: this.game.roomObjects[roomId]
                });
                
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error adding to room by ID:", error);
            return false;
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
}
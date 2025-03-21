/**
 * ObjectInteraction - Handles interactions with objects
 * Enhanced to properly handle the LOOK command
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';
import { objectNames, objectTypes } from '../data/objects.js';
import { roomDescriptions, roomExits, otherAreasDescriptions } from '../data/rooms.js';
import { specialTexts } from '../data/text.js';

export default class ObjectInteraction {
    constructor(game) {
        this.game = game;
        console.log("ObjectInteraction constructor called");
        
        // Store the room data for direct access
        this.roomData = {
            roomDescriptions,
            roomExits,
            otherAreasDescriptions
        };
        
        // Set up event subscriptions
        this.setupEventListeners();
        console.log("ObjectInteraction initialized");
    }
    
    setupEventListeners() {
        console.log("Setting up ObjectInteraction event listeners");
        
        eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => {
            console.log("ObjectInteraction received COMMAND_PROCESSED event:", data);
            
            // Handle object interaction commands
            switch (data.verb) {
                case "LOOK":
                case "EXAMINE":
                case "READ":
                    console.log("Processing LOOK/EXAMINE/READ command with noun:", data.noun);
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
    
    // Look at an object or display current room
    lookAt(noun) {
        try {
            console.log("ObjectInteraction.lookAt() called with noun:", noun);
            
            if (!noun) {
                // Just display the room if no noun
                console.log("No noun provided, displaying current room");
                this.displayRoom();
                // Also publish a UI refresh event to ensure the UI is updated
                eventBus.publish(GameEvents.UI_REFRESH, {
                    type: 'lookCommand',
                    roomId: this.game.currentRoom
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
    
    // Display the current room (for LOOK command with no noun)
    displayRoom() {
        try {
            console.log("Displaying room:", this.game.currentRoom);
            
            // Get room data
            const roomName = this.roomData.roomDescriptions[this.game.currentRoom] || `ROOM ${this.game.currentRoom}`;
            this.game.addToGameDisplay(`<div class="room-title">${roomName}</div>`);
            
            // Get exit description
            let exitDescription = "NOWHERE";
            const roomExitsInfo = this.roomData.roomExits[this.game.currentRoom];
            if (roomExitsInfo) {
                const exitType = roomExitsInfo[0];
                exitDescription = this.roomData.otherAreasDescriptions[exitType] || "NOWHERE";
            }
            
            // Display available exits
            this.game.addToGameDisplay(`<div class="directions">OTHER AREAS ARE: ${exitDescription}</div>`);
            
            // Display items in the room
            if (this.game.roomObjects[this.game.currentRoom] && this.game.roomObjects[this.game.currentRoom].length > 0) {
                const items = this.game.roomObjects[this.game.currentRoom]
                    .map(itemId => this.game.getItemName(itemId))
                    .join(", ");
                
                this.game.addToGameDisplay(`<div class="items">ITEMS IN SIGHT ARE: ${items}</div>`);
            } else {
                this.game.addToGameDisplay(`<div class="items">ITEMS IN SIGHT ARE: NOTHING AT ALL!!!!!</div>`);
            }
            
            // Force the game display to update
            if (typeof this.game.updateGameDisplay === 'function') {
                this.game.updateGameDisplay();
            }
            
            // Notify UI to update
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'roomDisplayed',
                roomId: this.game.currentRoom,
                roomName: roomName
            });
            
            console.log("Room display completed for room:", this.game.currentRoom);
        } catch (error) {
            console.error("Error displaying room:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR DISPLAYING ROOM.</div>`);
        }
    }
    
    // Handle special object examinations
    handleObjectExamination(objectId) {
        try {
            // Get the object name
            const objectName = this.game.getItemName(objectId);
            console.log(`Examining object: ${objectName} (ID: ${objectId})`);
            
            // Check for special objects with custom descriptions
            if (specialTexts[objectId]) {
                this.game.addToGameDisplay(`<div class="message">${specialTexts[objectId]}</div>`);
                return;
            }
            
            // Handle objects based on type
            const objectTypesList = objectTypes[objectId] || [];
            
            if (objectTypesList.includes("READABLE")) {
                // Special handling for readable objects
                if (objectId === 10) { // Graffiti
                    this.game.addToGameDisplay(`<div class="message">IT SAYS: 'FOR A GOOD LAY CALL 555-6969'</div>`);
                } else if (objectId === 18) { // Billboard
                    this.game.addToGameDisplay(`<div class="message">IT SAYS: 'DISCO FEVER - SHAKE YOUR BOOTY TONIGHT!'</div>`);
                } else if (objectId === 48) { // Sign
                    this.game.addToGameDisplay(`<div class="message">IT SAYS: 'NO LOITERING'</div>`);
                } else if (objectId === 50) { // Newspaper
                    this.game.addToGameDisplay(`<div class="message">${specialTexts[3] || "I SEE NOTHING SPECIAL"}</div>`);
                } else if (objectId === 68) { // Magazine
                    this.game.addToGameDisplay(`<div class="message">IT'S A GIRLIE MAGAZINE. VERY INTERESTING PICTURES!</div>`);
                } else {
                    this.game.addToGameDisplay(`<div class="message">IT'S READABLE, BUT I CAN'T MAKE OUT WHAT IT SAYS</div>`);
                }
                return;
            }
            
            if (objectTypesList.includes("CHARACTER")) {
                // Special handling for characters
                if (objectId === 15) { // Bartender
                    this.game.addToGameDisplay(`<div class="message">HE LOOKS LIKE A TOUGH GUY</div>`);
                } else if (objectId === 17) { // Hooker
                    this.game.addToGameDisplay(`<div class="message">SHE'S WEARING VERY REVEALING CLOTHING</div>`);
                } else if (objectId === 25) { // Voluptuous Blonde
                    this.game.addToGameDisplay(`<div class="message">${specialTexts[10] || "SHE'S VERY ATTRACTIVE"}</div>`);
                } else if (objectId === 49) { // Girl
                    this.game.addToGameDisplay(`<div class="message">${specialTexts[4] || "SHE LOOKS NICE"}</div>`);
                } else {
                    this.game.addToGameDisplay(`<div class="message">JUST A REGULAR PERSON</div>`);
                }
                return;
            }
            
            // For furniture
            if (objectTypesList.includes("FURNITURE")) {
                if (objectId === 8) { // Desk
                    this.game.addToGameDisplay(`<div class="message">IT'S A WOODEN DESK WITH A DRAWER</div>`);
                } else if (objectId === 9) { // Washbasin
                    this.game.addToGameDisplay(`<div class="message">A DIRTY WASHBASIN WITH A FAUCET</div>`);
                } else if (objectId === 12) { // Toilet
                    this.game.addToGameDisplay(`<div class="message">A FILTHY TOILET. DISGUSTING!</div>`);
                } else if (objectId === 26) { // Bed
                    this.game.addToGameDisplay(`<div class="message">IT'S A BED WITH DIRTY SHEETS</div>`);
                } else {
                    this.game.addToGameDisplay(`<div class="message">NOTHING SPECIAL ABOUT IT</div>`);
                }
                return;
            }
            
            // Default examination message
            this.game.addToGameDisplay(`<div class="message">I SEE NOTHING SPECIAL</div>`);
            
        } catch (error) {
            console.error("Error examining object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR EXAMINING OBJECT.</div>`);
        }
    }
    
    // Open an object
    openObject(noun) {
        try {
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
            
            // Check if object is openable
            const objectTypesList = objectTypes[objectId] || [];
            if (!objectTypesList.includes("OPENABLE")) {
                this.game.addToGameDisplay(`<div class="message">I CAN'T OPEN THAT</div>`);
                return;
            }
            
            // Handle specific openable objects
            if (objectId === 8) { // Desk
                if (this.game.flags.drawerOpened) {
                    this.game.addToGameDisplay(`<div class="message">IT'S ALREADY OPEN</div>`);
                } else {
                    this.game.addToGameDisplay(`<div class="message">I OPEN THE DRAWER</div>`);
                    this.game.flags.drawerOpened = 1;
                    // Maybe reveal an item
                    if (!this.game.isObjectInRoom(66)) { // If pocket knife isn't in room
                        this.game.addToGameDisplay(`<div class="message">THERE'S A POCKET KNIFE INSIDE!</div>`);
                        // Add knife to room
                        if (!this.game.roomObjects[this.game.currentRoom]) {
                            this.game.roomObjects[this.game.currentRoom] = [];
                        }
                        this.game.roomObjects[this.game.currentRoom].push(66);
                        
                        // Notify UI
                        eventBus.publish(GameEvents.ROOM_OBJECTS_CHANGED, {
                            roomId: this.game.currentRoom,
                            objects: this.game.roomObjects[this.game.currentRoom]
                        });
                    }
                }
            } else if (objectId === 30) { // Door
                this.game.addToGameDisplay(`<div class="message">I CAN'T OPEN IT - IT'S LOCKED</div>`);
            } else if (objectId === 35) { // Closet
                this.game.addToGameDisplay(`<div class="message">I OPEN THE CLOSET</div>`);
                this.game.flags.closetOpened = 1;
            } else if (objectId === 42) { // Cabinet
                this.game.addToGameDisplay(`<div class="message">I OPEN THE CABINET</div>`);
                this.game.flags.cabinetOpened = 1;
            } else {
                this.game.addToGameDisplay(`<div class="message">I CAN'T OPEN THAT</div>`);
            }
            
        } catch (error) {
            console.error("Error opening object:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR OPENING OBJECT.</div>`);
        }
    }
    
    // Use/wear an object
    useObject(noun) {
        this.game.addToGameDisplay(`<div class="message">I CAN'T USE THAT</div>`);
    }
    
    // Push/press an object
    pushObject(noun) {
        this.game.addToGameDisplay(`<div class="message">PUSHING DOESN'T HELP</div>`);
    }
    
    // Break an object
    breakObject(noun) {
        this.game.addToGameDisplay(`<div class="message">I CAN'T BREAK THAT</div>`);
    }
    
    // Climb an object
    climbObject(noun) {
        this.game.addToGameDisplay(`<div class="message">I CAN'T CLIMB THAT</div>`);
    }
    
    // Fill an object
    fillObject(noun) {
        this.game.addToGameDisplay(`<div class="message">I CAN'T FILL THAT</div>`);
    }
    
    // Inflate an object
    inflateObject(noun) {
        this.game.addToGameDisplay(`<div class="message">I CAN'T INFLATE THAT</div>`);
    }
    
    // Cut an object with knife
    cutObject(noun) {
        this.game.addToGameDisplay(`<div class="message">I CAN'T CUT THAT</div>`);
    }
    
    // TV power control
    tvPower(state) {
        this.game.addToGameDisplay(`<div class="message">THERE'S NO TV HERE</div>`);
    }
    
    // Water control
    waterControl(state) {
        this.game.addToGameDisplay(`<div class="message">THERE'S NO WATER CONTROL HERE</div>`);
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
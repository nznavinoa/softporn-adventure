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
            
            // Clear previous display content
            // Note: We're not clearing the game output here to avoid erasing previous messages
            
            // Display room name
            const roomName = roomDescriptions[this.game.currentRoom] || `ROOM ${this.game.currentRoom}`;
            this.game.addToGameDisplay(`<div class="room-title">${roomName}</div>`);
            
            // Get exit description
            let exitDescription = "NOWHERE";
            if (roomExits[this.game.currentRoom]) {
                const exitType = roomExits[this.game.currentRoom][0];
                exitDescription = otherAreasDescriptions[exitType] || "NOWHERE";
            }
            
            // Display available exits
            this.game.addToGameDisplay(`<div class="directions">OTHER AREAS ARE: ${exitDescription}</div>`);
            
            // Display items in the room
            if (this.game.roomObjects[this.game.currentRoom] && this.game.roomObjects[this.game.currentRoom].length > 0) {
                const items = this.game.roomObjects[this.game.currentRoom].map(
                    itemId => this.game.getItemName(itemId)
                ).join(", ");
                
                this.game.addToGameDisplay(`<div class="items">ITEMS IN SIGHT ARE: ${items}</div>`);
            } else {
                this.game.addToGameDisplay(`<div class="items">ITEMS IN SIGHT ARE: NOTHING AT ALL!!!!!</div>`);
            }
            
            // Notify UI to update (optional, as addToGameDisplay already triggers updates)
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'roomDisplayed',
                roomId: this.game.currentRoom,
                roomName: roomName
            });
        } catch (error) {
            console.error("Error displaying room:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR DISPLAYING ROOM.</div>`);
        }
    }
    
    // Handle special object examinations
    handleObjectExamination(objectId) {
        // For now, just display a generic message
        this.game.addToGameDisplay(`<div class="message">I SEE NOTHING SPECIAL</div>`);
        
        // Note: In a complete implementation, this would have special cases for each object
    }
    
    // Open an object
    openObject(noun) {
        this.game.addToGameDisplay(`<div class="message">I CAN'T OPEN THAT</div>`);
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
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
        
        // Item usage history
        this.itemUsageHistory = {};
        
        // Set up event subscriptions
        this.setupEventListeners();
        
        console.log("Inventory module initialized");
    }
    
    setupEventListeners() {
        console.log("Setting up Inventory event listeners");
        
        eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => {
            console.log("Inventory received COMMAND_PROCESSED event:", data);
            
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
                    console.log("Inventory command received, showing inventory");
                    this.showInventory();
                    break;
            }
        });
        
        // Listen for inventory modification requests from other modules
        eventBus.subscribe(GameEvents.INVENTORY_ADD_REQUESTED, (data) => {
            this.addToInventory(data.itemId);
        });
        
        eventBus.subscribe(GameEvents.INVENTORY_REMOVE_REQUESTED, (data) => {
            this.removeFromInventory(data.itemId);
        });
        
        // Listen for room object modification requests
        eventBus.subscribe(GameEvents.ROOM_OBJECT_ADD_REQUESTED, (data) => {
            this.addToRoomById(data.roomId, data.objectId);
        });
        
        eventBus.subscribe(GameEvents.ROOM_OBJECT_REMOVE_REQUESTED, (data) => {
            this.removeFromRoom(data.roomId, data.objectId);
        });
        
        // Handle inventory checking requests
        eventBus.subscribe(GameEvents.IS_IN_INVENTORY, (data) => {
            return this.game.isObjectInInventory(data.objectId);
        });
        
        eventBus.subscribe(GameEvents.GET_INVENTORY, () => {
            return [...this.game.inventory];
        });
    }
    
    // Add an item to inventory
    addToInventory(itemId) {
        try {
            if (!this.game.inventory.includes(itemId)) {
                this.game.inventory.push(itemId);
                
                // Add to usage history
                this.initItemUsageHistory(itemId);
                
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
    
    // Initialize usage history for an item
    initItemUsageHistory(itemId) {
        if (!this.itemUsageHistory[itemId]) {
            this.itemUsageHistory[itemId] = {
                timesTaken: 1,
                timesDropped: 0,
                timesUsed: 0,
                lastUsedRoom: null,
                lastUsedWith: null
            };
        } else {
            this.itemUsageHistory[itemId].timesTaken++;
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
            
            // Publish object taken event (for potential special interactions)
            eventBus.publish(GameEvents.OBJECT_TAKEN, {
                objectId: objectId,
                objectName: this.game.getItemName(objectId),
                roomId: this.game.currentRoom
            });
            
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
            
            // Remove from inventory
            this.removeFromInventory(objectId);
            
            // Add to the room
            this.addToRoom(objectId);
            
            // Update usage history
            if (this.itemUsageHistory[objectId]) {
                this.itemUsageHistory[objectId].timesDropped++;
            }
            
            this.game.addToGameDisplay(`<div class="message">OK</div>`);
            
            // Publish object dropped event (for special interactions)
            eventBus.publish(GameEvents.OBJECT_DROPPED, {
                objectId: objectId,
                objectName: this.game.getItemName(objectId),
                roomId: this.game.currentRoom
            });
            
            // Check for special item-character interactions (giving items to NPCs)
            this.checkCharacterInteractions(objectId);
            
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
    
    // Check for special character interactions when dropping items
    checkCharacterInteractions(objectId) {
        // Get characters in the current room
        const characters = this.game.roomObjects[this.game.currentRoom]?.filter(id => 
            id >= 13 && id <= 49 && this.isCharacter(id)) || [];
        
        if (characters.length > 0) {
            // For each character, check if they react to this item
            characters.forEach(charId => {
                eventBus.publish(GameEvents.CHARACTER_INTERACTION, {
                    characterId: charId,
                    action: 'gift',
                    itemId: objectId,
                    roomId: this.game.currentRoom
                });
            });
        }
    }
    
    // Check if an object ID is a character
    isCharacter(objectId) {
        const objTypes = objectTypes[objectId] || [];
        return objTypes.includes("CHARACTER");
    }
    
    // Show inventory
    showInventory() {
        try {
            console.log("Showing inventory with items:", this.game.inventory);
            
            if (this.game.inventory.length === 0) {
                this.game.addToGameDisplay(`<div class="message">I'M CARRYING NOTHING!!</div>`);
                return;
            }
            
            let items = this.game.inventory.map(itemId => this.game.getItemName(itemId)).join(", ");
            this.game.addToGameDisplay(`<div class="message">I'M CARRYING THE FOLLOWING: ${items}</div>`);
            
            // Publish inventory display event
            eventBus.publish(GameEvents.INVENTORY_DISPLAYED, {
                inventory: [...this.game.inventory]
            });
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
    
    // Track item usage
    recordItemUsage(itemId, usageType, context = {}) {
        if (this.itemUsageHistory[itemId]) {
            this.itemUsageHistory[itemId].timesUsed++;
            this.itemUsageHistory[itemId].lastUsedRoom = this.game.currentRoom;
            
            if (context.withItem) {
                this.itemUsageHistory[itemId].lastUsedWith = context.withItem;
            }
            
            // Publish item usage event for analytics
            eventBus.publish(GameEvents.ITEM_USAGE_RECORDED, {
                itemId: itemId,
                usageType: usageType,
                usageHistory: { ...this.itemUsageHistory[itemId] },
                context: context
            });
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
    
    // Get all items in inventory of a specific type
    getInventoryItemsByType(type) {
        return this.game.inventory.filter(itemId => {
            const itemTypes = objectTypes[itemId] || [];
            return itemTypes.includes(type);
        });
    }
}
/**
 * Navigation - Handles moving between rooms
 * Processes movement commands and room transitions
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';
import { roomDescriptions, roomExits, otherAreasDescriptions } from '../data/rooms.js';

export default class Navigation {
    constructor(game) {
        this.game = game;
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => {
            // Handle movement commands
            if (["NORTH", "SOUTH", "EAST", "WEST", "UP", "DOWN"].includes(data.verb)) {
                this.moveTo(data.verb);
            }
        });
    }
    
    // Move to a new room
    moveTo(direction) {
        try {
            // Check if player is tied to the bed
            if (this.game.flags.tiedToBed) {
                this.game.addToGameDisplay(`<div class="message">BUT I'M TIED TO THE BED!!!!!</div>`);
                return;
            }
            
            if (!direction) {
                this.game.addToGameDisplay(`<div class="message">WHICH DIRECTION?</div>`);
                return;
            }
            
            // Get available directions for the current room
            const availableDirs = this.getAvailableDirections();
            
            // Check if the direction is valid
            if (!availableDirs.includes(direction)) {
                this.game.addToGameDisplay(`<div class="message">I CAN'T GO IN THAT DIRECTION!!</div>`);
                return;
            }
            
            // Special case for room 9
            if (this.game.currentRoom === 9 && this.game.score === 0) {
                this.game.addToGameDisplay(`<div class="message">THE HOOKER SAYS 'DON'T GO THERE....DO ME FIRST!!!!'</div>`);
                return;
            }
            
            // Special case for room 17 (locked door)
            if (this.game.currentRoom === 17 && direction === "SOUTH" && this.game.flags.girlPoints < 5) {
                this.game.addToGameDisplay(`<div class="message">THE DOOR IS LOCKED SHUT!</div>`);
                return;
            }
            
            // Special case for room 23 (disco door)
            if (this.game.currentRoom === 23 && direction === "WEST" && this.game.flags.doorUnlocked === 0) {
                this.game.addToGameDisplay(`<div class="message">THE DOOR IS CLOSED!</div>`);
                return;
            }
            
            // Special case for room 5 (pimp room)
            if (this.game.currentRoom === 5 && direction === "UP") {
                if (this.game.score === 0) {
                    if (this.game.money < 10) {
                        this.game.addToGameDisplay(`<div class="message">THE PIMP SAYS I CAN'T UNTIL I GET $1000</div>`);
                        return;
                    }
                    this.game.money -= 10;
                    this.game.addToGameDisplay(`<div class="message">THE PIMP TAKES $1000 AND SAYS OK</div>`);
                    
                    // Publish money changed event
                    eventBus.publish(GameEvents.MONEY_CHANGED, {
                        previousAmount: this.game.money + 10,
                        currentAmount: this.game.money
                    });
                } else {
                    if (this.game.flags.blondeGirlDrugged === 0) {
                        this.game.addToGameDisplay(`<div class="message">THE PIMP SAYS 'NO WAY!!!! LEAVE MY GIRL ALONE!</div>`);
                        return;
                    }
                }
            }
            
            // Calculate the new room
            let newRoom = this.calculateNewRoom(direction);
            
            // Special case for room 10 and using rope
            if (this.game.currentRoom === 10 && direction === "WEST") {
                if (this.game.flags.usingRope !== 1) {
                    this.game.addToGameDisplay(`<div class="message">AAAAAEEEEEIIIIIIII!!!!!!!!!</div>`);
                    this.game.addToGameDisplay(`<div class="message">SPLAAATTTTT!!!!!</div>`);
                    this.game.addToGameDisplay(`<div class="message">I SHOULD HAVE USED SAFETY ROPE!!!!!!!!</div>`);
                    eventBus.publish(GameEvents.GAME_OVER, {
                        reason: "Fell to death",
                        score: this.game.score
                    });
                    return;
                }
            }
            
            // Store previous room for transition event
            const previousRoom = this.game.currentRoom;
            
            // Update the current room
            this.game.currentRoom = newRoom;
            
            // Turn off using_rope if going down from a balcony
            if (direction === "DOWN" && this.game.flags.usingRope === 1) {
                this.game.flags.usingRope = 0;
            }
            
            // Publish room changed event
            eventBus.publish(GameEvents.ROOM_CHANGED, {
                previousRoom: previousRoom,
                currentRoom: newRoom,
                direction: direction,
                roomName: roomDescriptions[newRoom] || `ROOM ${newRoom}`,
                availableDirections: this.getAvailableDirections(),
                roomObjects: this.game.getRoomObjects()
            });
            
            // Display the new room
            this.displayRoom();
        } catch (error) {
            console.error("Error moving to new room:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR MOVING.</div>`);
        }
    }
    
    // Calculate the new room based on direction
    calculateNewRoom(direction) {
        let newRoom = this.game.currentRoom;
        
        switch (direction) {
            case "NORTH":
                newRoom += 1;
                break;
            case "SOUTH":
                newRoom -= 1;
                break;
            case "EAST":
                newRoom += 2;
                break;
            case "WEST":
                newRoom -= 2;
                break;
            case "UP":
                newRoom += 4;
                break;
            case "DOWN":
                newRoom -= 4;
                break;
        }
        
        return newRoom;
    }
    
    // Get available directions for current room
    getAvailableDirections() {
        try {
            const roomId = this.game.currentRoom;
            if (roomExits[roomId] && roomExits[roomId][1]) {
                return roomExits[roomId][1];
            }
            return [];
        } catch (error) {
            console.error("Error getting available directions:", error);
            return [];
        }
    }
    
    // Display room after movement
    displayRoom() {
        try {
            // Clear previous display
            this.game.gameOutput = [];
            
            // Display room name
            const roomName = roomDescriptions[this.game.currentRoom] || `ROOM ${this.game.currentRoom}`;
            this.game.addToGameDisplay(`<div class="room-title">${roomName}</div>`);
            
            // Get exits description
            const roomIndex = roomExits[this.game.currentRoom]?.[0];
            const exitDescription = otherAreasDescriptions[roomIndex] || "NOWHERE";
            
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
            
            // Special room handling (will be expanded)
            this.handleSpecialRooms();
        } catch (error) {
            console.error("Error displaying room:", error);
            this.game.addToGameDisplay(`<div class="message">ERROR DISPLAYING ROOM.</div>`);
        }
    }
    
    // Handle special rooms with unique behavior
    handleSpecialRooms() {
        // This will be expanded with more special room handling
        const room = this.game.currentRoom;
        
        // Example special room handling
        if (room === 6) { // Dumpster
            this.game.addToGameDisplay(`<div class="message">THE SMELL HERE IS AWFUL!</div>`);
        }
        
        if (room === 9 && this.game.score === 0) { // Hooker's room before scoring
            this.game.addToGameDisplay(`<div class="message">THE HOOKER BECKONS YOU TO THE BED...</div>`);
        }
    }
}
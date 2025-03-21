/**
 * Game - Core game controller
 * Maintains the central game state and coordinates game actions
 */
import eventBus from '../main.js';
import { GameEvents } from './GameEvents.js';
import { roomDescriptions, roomExits, initialRoomObjects } from '../data/rooms.js';
import { objectNames, objectTypes } from '../data/objects.js';
import { specialTexts } from '../data/text.js';

export default class Game {
    constructor() {
        // Core game variables
        this.score = 0;
        this.money = 25; // $2500 in the original notation (hundreds)
        this.currentRoom = 3; // Start in the bar
        this.gameOver = false;
        
        // Game state flags
        this.flags = {
            drawerExamined: 0,
            toiletExamined: 0,
            drawerOpened: 0,
            closetOpened: 0,
            waterOn: 0,
            stoolUsed: 0,
            cabinetOpened: 0,
            idInflated: 0,
            tvOn: 0,
            girlPoints: 0,
            wineGiven: 0,
            wearingRubber: 0,
            usingRope: 0,
            blondeGirlDrugged: 0,
            wineBottle: 0,
            rescuedHooker: 0,
            dumpsterChecked: 0,
            appleCore: 0,
            appleSeeds: 0,
            tiedToBed: 0,
            doorUnlocked: 0,
            bushesFound: 0,
            pitcherFull: 0,
            jacuzziApple: 0,
            hookerDone: false,
            candyGiven: 0,
            whiskeybought: false,
            beerBought: false,
            magazineFound: 0,
            ashtreyExamined: 0
        };
        
        // Rubber properties
        this.rubberProperties = {
            color: null,
            flavor: null,
            lubricated: false,
            ribbed: false
        };
        
        // Blackjack game state
        this.blackjackState = {
            playerCards: [],
            dealerCards: [],
            playerTotal: 0,
            dealerTotal: 0,
            bet: 0,
            gamePhase: 'betting' // betting, player, dealer, result
        };
        
        // Initialize rooms, objects and inventory
        this.inventory = [];
        this.roomObjects = JSON.parse(JSON.stringify(initialRoomObjects)); // Deep copy
        
        // Game output history
        this.gameOutput = [];
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventBus.subscribe(GameEvents.GAME_STARTED, () => this.start());
        eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => this.processCommand(data));
    }
    
    // Start the game
    start() {
        try {
            // Display intro text
            this.addToGameDisplay(`<div class="message">
                SOFTPORN ADVENTURE
                WRITTEN BY CHUCK BENTON
                COPYRIGHT 1981
                BLUE SKY SOFTWARE
                
                80s NEON WEB EDITION
            </div>`);
            
            // Ask if a saved game should be loaded (for authenticity, though not implemented yet)
            this.addToGameDisplay(`<div class="system-message">SHOULD A SAVED GAME BE LOADED? <button id="no-load">N</button></div>`);
            
            // Publish an event to notify UI that the game has started
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'gameStarted',
                gameOutput: this.gameOutput
            });
        } catch (error) {
            console.error("Error starting game:", error);
            this.addToGameDisplay(`<div class="message">ERROR STARTING GAME. PLEASE REFRESH.</div>`);
        }
    }
    
    // Initialize game after intro
    initializeGame() {
        try {
            this.addToGameDisplay(`<div class="message">
                PLEASE WAIT
                INITIALIZATION PHASE
            </div>`);
            
            setTimeout(() => {
                // Display the starting room
                this.displayRoom();
                
                // Publish event to update UI
                eventBus.publish(GameEvents.UI_REFRESH, {
                    type: 'gameInitialized',
                    gameOutput: this.gameOutput,
                    currentRoom: this.currentRoom,
                    roomObjects: this.getRoomObjects(),
                    inventory: this.inventory
                });
            }, 1000);
        } catch (error) {
            console.error("Error initializing game:", error);
            this.addToGameDisplay(`<div class="message">ERROR INITIALIZING GAME. PLEASE REFRESH.</div>`);
        }
    }
    
    // Add content to the game display
    addToGameDisplay(content, className = "") {
        try {
            this.gameOutput.push({ content, className });
            
            // Notify UI to update
            eventBus.publish(GameEvents.DISPLAY_UPDATED, {
                newContent: { content, className },
                gameOutput: this.gameOutput
            });
        } catch (error) {
            console.error("Error adding to game display:", error);
        }
    }
    
    // Get available directions for current room
    getAvailableDirections() {
        try {
            const roomId = this.currentRoom;
            if (roomExits[roomId] && roomExits[roomId][1]) {
                return roomExits[roomId][1];
            }
            return [];
        } catch (error) {
            console.error("Error getting available directions:", error);
            return [];
        }
    }
    
    // Get room objects
    getRoomObjects() {
        return this.roomObjects[this.currentRoom] || [];
    }
    
    // Get item name by ID
    getItemName(itemId) {
        try {
            return objectNames[itemId] || `ITEM_${itemId}`;
        } catch (error) {
            console.error("Error getting item name:", error);
            return `ITEM_${itemId}`;
        }
    }
    
    // Check if an object is in the current room
    isObjectInRoom(objectId) {
        try {
            return this.roomObjects[this.currentRoom] && 
                   this.roomObjects[this.currentRoom].includes(objectId);
        } catch (error) {
            console.error("Error checking if object is in room:", error);
            return false;
        }
    }
    
    // Check if an object is in inventory
    isObjectInInventory(objectId) {
        try {
            return this.inventory.includes(objectId);
        } catch (error) {
            console.error("Error checking if object is in inventory:", error);
            return false;
        }
    }
    
    // Display current room
    displayRoom() {
        try {
            // Clear previous display
            this.gameOutput = [];
            
            // Display room name
            const roomName = roomDescriptions[this.currentRoom] || `ROOM ${this.currentRoom}`;
            this.addToGameDisplay(`<div class="room-title">${roomName}</div>`);
            
            // Get room description
            const exitType = roomExits[this.currentRoom]?.[0] || "";
            
            // Display available exits
            this.addToGameDisplay(`<div class="directions">OTHER AREAS ARE: ${exitType}</div>`);
            
            // Display items in the room
            if (this.roomObjects[this.currentRoom] && this.roomObjects[this.currentRoom].length > 0) {
                const items = this.roomObjects[this.currentRoom].map(
                    itemId => this.getItemName(itemId)
                ).join(", ");
                
                this.addToGameDisplay(`<div class="items">ITEMS IN SIGHT ARE: ${items}</div>`);
            } else {
                this.addToGameDisplay(`<div class="items">ITEMS IN SIGHT ARE: NOTHING AT ALL!!!!!</div>`);
            }
            
            // Notify UI to update
            eventBus.publish(GameEvents.ROOM_CHANGED, {
                previousRoom: null, // We don't track previous room yet
                currentRoom: this.currentRoom,
                roomName: roomName,
                availableDirections: this.getAvailableDirections(),
                roomObjects: this.getRoomObjects()
            });
        } catch (error) {
            console.error("Error displaying room:", error);
            this.addToGameDisplay(`<div class="message">ERROR DISPLAYING ROOM.</div>`);
        }
    }
    
    // Process a command (stub for now, will be expanded)
    processCommand(commandData) {
        try {
            const { verb, noun } = commandData;
            
            // Echo the command to the display
            this.addToGameDisplay(`<div class="message">> ${verb} ${noun || ''}</div>`);
            
            // For now, just acknowledge the command
            this.addToGameDisplay(`<div class="message">I UNDERSTOOD THE COMMAND '${verb}' ${noun ? `WITH NOUN '${noun}'` : 'WITH NO NOUN'}</div>`);
            
            // This will be expanded with actual command processing logic
            
        } catch (error) {
            console.error("Error processing command:", error);
            this.addToGameDisplay(`<div class="message">ERROR PROCESSING COMMAND.</div>`);
        }
    }
}
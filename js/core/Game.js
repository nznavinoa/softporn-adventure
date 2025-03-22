/**
 * Game - Core game controller
 * Maintains the central game state and coordinates game actions
 */
import eventBus from '../main.js';
import { GameEvents } from './GameEvents.js';
import { roomDescriptions, roomExits, initialRoomObjects } from '../data/rooms.js';
import { objectNames, objectTypes } from '../data/objects.js';
import { specialTexts, introText } from '../data/text.js';

export default class Game {
    constructor() {
        console.log("Game constructor called");
        
        // Core game variables
        this.score = 0;
        this.money = 25; // $2500 in the original notation (hundreds)
        this.currentRoom = 3; // Start in the bar
        this.gameOver = false;
        
        // State flag to prevent event recursion
        this.gameStarted = false;
        
        // Prevent duplicate initialization
        this.initializing = false;
        
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
        
        console.log("Game instance initialized");
    }
    
    setupEventListeners() {
        console.log("Setting up Game event listeners");
        
        // FIX: Prevent infinite recursion by checking gameStarted flag
        eventBus.subscribe(GameEvents.GAME_STARTED, () => {
            console.log("Game received GAME_STARTED event");
            
            // Prevent infinite recursion by checking if game is already started
            if (this.gameStarted) {
                console.log("Game already started, ignoring duplicate event");
                return;
            }
        });
        
        eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => {
            console.log("Game received COMMAND_PROCESSED event:", data);
            this.processCommand(data);
        });
    }
    
    // Start the game
    start() {
        console.log("Game.start() method called");
        
        try {
            // FIX: Set the flag to prevent infinite recursion
            if (this.gameStarted) {
                console.log("Game already started, ignoring duplicate call");
                return true;
            }
            
            this.gameStarted = true;
            
            // Clear any existing output
            this.gameOutput = [];
            
            // Display intro text
            this.addToGameDisplay(`<div class="message">
                ${introText}
            </div>`);
            
            // Use the dialog system instead of inline button
            setTimeout(() => {
                eventBus.publish(GameEvents.UI_SHOW_DIALOG, {
                    title: "Load Game",
                    content: "SHOULD A SAVED GAME BE LOADED?",
                    buttons: [
                        {
                            text: "NO",
                            id: "no-load-btn",
                            callback: () => {
                                console.log("No load button clicked in dialog");
                                this.initializeGame();
                            }
                        },
                        {
                            text: "YES",
                            id: "yes-load-btn",
                            callback: () => {
                                console.log("Yes load button clicked in dialog");
                                // For now, we just initialize a new game
                                this.initializeGame();
                            }
                        }
                    ]
                });
            }, 500);
            
            // Directly publish game started event
            console.log("Publishing GAME_STARTED event");
            eventBus.publish(GameEvents.GAME_STARTED, {
                timestamp: new Date().toISOString()
            });
            
            // Publish UI refresh event
            eventBus.publish(GameEvents.UI_REFRESH, {
                type: 'gameStarted',
                gameOutput: this.gameOutput
            });
            
            console.log("Game started successfully");
            return true;
        } catch (error) {
            console.error("Error starting game:", error);
            this.addToGameDisplay(`<div class="message">ERROR STARTING GAME. PLEASE REFRESH.</div>`);
            return false;
        }
    }
    
    // Initialize game after intro
    initializeGame() {
        console.log("Game.initializeGame() method called");
        
        try {
            // FIX: Prevent duplicate initialization
            if (this.initializing) {
                console.log("Game already initializing, ignoring duplicate call");
                return;
            }
            
            this.initializing = true;
            
            // Show initialization message in its own UI dialog so it's clearly visible
            eventBus.publish(GameEvents.UI_SHOW_DIALOG, {
                title: "Initializing Game",
                content: "PLEASE WAIT<br>INITIALIZATION PHASE",
                buttons: [] // No buttons - this dialog will auto-dismiss
            });
            
            // Clear game display but keep the initialization message visible in the dialog
            this.gameOutput = [];
            
            // Notify UI to update (clear the display)
            eventBus.publish(GameEvents.DISPLAY_UPDATED, {
                gameOutput: this.gameOutput
            });
            
            // After a delay, hide the dialog and show the room
            setTimeout(() => {
                // Hide the initialization dialog
                eventBus.publish(GameEvents.UI_HIDE_DIALOG, {});
                
                // Display the starting room - explicitly call with room ID 3 (bar)
                this.displayRoom(3);
                
                // FIX: Force UI update to ensure room is displayed
                eventBus.publish(GameEvents.DISPLAY_UPDATED, {
                    gameOutput: this.gameOutput
                });
                
                // Make sure the room data is also sent to update UI components
                eventBus.publish(GameEvents.ROOM_CHANGED, {
                    previousRoom: null,
                    currentRoom: this.currentRoom,
                    roomName: roomDescriptions[this.currentRoom] || `ROOM ${this.currentRoom}`,
                    availableDirections: this.getAvailableDirections(),
                    roomObjects: this.getRoomObjects()
                });
                
                // Publish event to update UI
                eventBus.publish(GameEvents.UI_REFRESH, {
                    type: 'gameInitialized',
                    gameOutput: this.gameOutput,
                    currentRoom: this.currentRoom,
                    roomObjects: this.getRoomObjects(),
                    inventory: this.inventory
                });
                
                // FIX: Reset initializing flag
                this.initializing = false;
                
                console.log("Game initialized successfully");
            }, 2000); // Longer delay to ensure the message is visible
        } catch (error) {
            // FIX: Reset initializing flag on error
            this.initializing = false;
            console.error("Error initializing game:", error);
            this.addToGameDisplay(`<div class="message">ERROR INITIALIZING GAME. PLEASE REFRESH.</div>`);
        }
    }
    
    // Add content to the game display
    addToGameDisplay(content, className = "") {
        try {
            console.log("Adding to game display:", content.substring(0, 50) + "...");
            
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
    displayRoom(roomId = null) {
        try {
            // If a room ID is provided, update current room
            if (roomId !== null) {
                this.currentRoom = roomId;
            }
            
            console.log("Displaying room:", this.currentRoom);
            
            // Always clear the game output before showing a room
            // This ensures we don't get duplicate room information
            this.gameOutput = [];
            
            // Display room name
            const roomName = roomDescriptions[this.currentRoom] || `ROOM ${this.currentRoom}`;
            console.log("Room name to display:", roomName);
            
            // Add room title with full HTML
            this.addToGameDisplay(`<div class="room-title">${roomName}</div>`);
            
            // Get room description and verify data
            const exitInfo = roomExits[this.currentRoom] || [this.currentRoom, []];
            console.log("Exit info:", exitInfo);
            
            let exitType = "NOWHERE";
            if (exitInfo && exitInfo[0]) {
                // Try to get the text description
                exitType = roomExits[this.currentRoom][0] || "NOWHERE";
            }
            
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
            
            // Log the current game output for debugging
            console.log("Current game output:", JSON.stringify(this.gameOutput));
            
            // FIX: Force a UI refresh to make sure the room info is displayed
            eventBus.publish(GameEvents.DISPLAY_UPDATED, {
                gameOutput: this.gameOutput
            });
        } catch (error) {
            console.error("Error displaying room:", error);
            this.addToGameDisplay(`<div class="message">ERROR DISPLAYING ROOM.</div>`);
        }
    }
    
    // Process a command
    processCommand(commandData) {
        try {
            const { verb, noun } = commandData;
            
            console.log("Processing command:", verb, noun || '');
            
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
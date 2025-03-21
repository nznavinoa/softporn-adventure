/**
 * Game - Core game controller
 * Maintains the central game state and coordinates game actions
 */
import eventBus from '../main.js';
import { GameEvents } from './GameEvents.js';
import { roomDescriptions, roomExits, initialRoomObjects, otherAreasDescriptions } from '../data/rooms.js';
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
            
            // Additional game initialization steps can go here if needed
        });
        
        eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => {
            console.log("Game received COMMAND_PROCESSED event:", data);
            this.processCommand(data);
        });

        // FIX: Handle the no-load button click directly in the Game class
        document.addEventListener('click', (event) => {
            if (event.target.id === 'no-load') {
                console.log("No Load button clicked - direct handler in Game.js");
                this.initializeGame();
            }
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
            
            // Display intro text
            this.addToGameDisplay(`<div class="message">
                ${introText}
            </div>`);
            
            // FIX: Force an update of the game display
            this.updateGameDisplay();
            
            // Ask if a saved game should be loaded
            this.addToGameDisplay(`<div class="system-message">SHOULD A SAVED GAME BE LOADED? <button id="no-load">N</button></div>`);
            
            // FIX: Force a direct update of the display again
            this.updateGameDisplay();
            
            // Directly publish game started event
            console.log("Publishing GAME_STARTED event");
            eventBus.publish(GameEvents.GAME_STARTED, {
                timestamp: new Date().toISOString()
            });
            
            // FIX: Add a direct check to see if the no-load button is created
            setTimeout(() => {
                const noLoadBtn = document.getElementById('no-load');
                console.log('No-load button exists after start:', !!noLoadBtn);
                
                if (!noLoadBtn) {
                    console.warn("No-load button not found, forcing game initialization");
                    this.initializeGame();
                }
            }, 500);
            
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
            this.addToGameDisplay(`<div class="message">
                PLEASE WAIT
                INITIALIZATION PHASE
            </div>`);
            
            // FIX: Force update the display immediately
            this.updateGameDisplay();
            
            // FIX: Reduced timeout to make game more responsive
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
                
                console.log("Game initialized successfully");
            }, 500);
        } catch (error) {
            console.error("Error initializing game:", error);
            this.addToGameDisplay(`<div class="message">ERROR INITIALIZING GAME. PLEASE REFRESH.</div>`);
        }
    }
    
    // Add content to the game display
    addToGameDisplay(content, className = "") {
        try {
            console.log("Adding to game display:", content.substring(0, 50) + "...");
            
            this.gameOutput.push({ content, className });
            
            // FIX: Directly update the DOM
            this.updateGameDisplay();
            
            // Notify UI to update
            eventBus.publish(GameEvents.DISPLAY_UPDATED, {
                newContent: { content, className },
                gameOutput: this.gameOutput
            });
        } catch (error) {
            console.error("Error adding to game display:", error);
        }
    }
    
    // FIX: Add method to directly update the game display
    updateGameDisplay() {
        try {
            const gameDisplay = document.getElementById('game-display');
            if (!gameDisplay) {
                console.error("Cannot update game display: Element not found");
                return;
            }
            
            // Clear previous content
            gameDisplay.innerHTML = "";
            
            // Add all output
            this.gameOutput.forEach(output => {
                const div = document.createElement("div");
                div.innerHTML = output.content;
                if (output.className) {
                    div.className = output.className;
                }
                gameDisplay.appendChild(div);
            });
            
            // Scroll to bottom
            gameDisplay.scrollTop = gameDisplay.scrollHeight;
            
            console.log("Game display updated directly");
        } catch (error) {
            console.error("Error updating game display:", error);
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
            console.log("Displaying room:", this.currentRoom);
            
            // FIX: Don't clear the game output completely, just add a separator
            this.addToGameDisplay(`<div style="border-top: 1px solid #01cdfe; margin: 10px 0;"></div>`);
            
            // Display room name
            const roomName = roomDescriptions[this.currentRoom] || `ROOM ${this.currentRoom}`;
            this.addToGameDisplay(`<div class="room-title">${roomName}</div>`);
            
            // Get room description
            const exitInfo = roomExits[this.currentRoom] || [this.currentRoom, []];
            const exitType = exitInfo[0] || "";
            const exitDesc = otherAreasDescriptions[exitType] || "NOWHERE";
            
            // Display available exits
            this.addToGameDisplay(`<div class="directions">OTHER AREAS ARE: ${exitDesc}</div>`);
            
            // Display items in the room
            if (this.roomObjects[this.currentRoom] && this.roomObjects[this.currentRoom].length > 0) {
                const items = this.roomObjects[this.currentRoom].map(
                    itemId => this.getItemName(itemId)
                ).join(", ");
                
                this.addToGameDisplay(`<div class="items">ITEMS IN SIGHT ARE: ${items}</div>`);
            } else {
                this.addToGameDisplay(`<div class="items">ITEMS IN SIGHT ARE: NOTHING AT ALL!!!!!</div>`);
            }
            
            // FIX: Force updating the display
            this.updateGameDisplay();
            
            // Notify UI to update
            eventBus.publish(GameEvents.ROOM_CHANGED, {
                previousRoom: null, // We don't track previous room yet
                currentRoom: this.currentRoom,
                roomName: roomName,
                availableDirections: this.getAvailableDirections(),
                roomObjects: this.getRoomObjects()
            });
            
            // FIX: Add debug log for verification
            console.log(`Room ${this.currentRoom} (${roomName}) displayed successfully`);
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
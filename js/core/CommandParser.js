/**
 * CommandParser - Parses user input and routes commands
 * Translates text commands into structured actions
 */
import eventBus from '../main.js';
import { GameEvents } from './GameEvents.js';

export default class CommandParser {
    constructor() {
        // Define command shortcuts and synonyms
        this.commandShortcuts = {
            "N": "NORTH",
            "S": "SOUTH",
            "E": "EAST",
            "W": "WEST",
            "U": "UP",
            "D": "DOWN",
            "I": "INVENTORY",
            "INV": "INVENTORY",
            "L": "LOOK",
            "GET": "TAKE",
            "EXAMINE": "LOOK",
            "READ": "LOOK",
            "X": "LOOK",
            "Q": "QUIT"
        };
        
        // Special commands that don't follow the verb-noun pattern
        this.specialCommands = [
            "NORTH", "SOUTH", "EAST", "WEST", "UP", "DOWN",
            "INVENTORY", "LOOK", "QUIT", "SAVE", "HELP",
            "DANCE", "JUMP"
        ];
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        eventBus.subscribe(GameEvents.COMMAND_RECEIVED, (command) => this.parseCommand(command));
    }
    
    // Parse a command string
    parseCommand(commandString) {
        try {
            // Trim and convert to uppercase
            const command = commandString.trim().toUpperCase();
            
            // Ignore empty commands
            if (!command) {
                return;
            }
            
            // Check for special two-word commands
            if (command === "TV ON") {
                eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: "TV", noun: "ON" });
                return;
            }
            
            if (command === "TV OFF") {
                eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: "TV", noun: "OFF" });
                return;
            }
            
            if (command === "WATER ON") {
                eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: "WATER", noun: "ON" });
                return;
            }
            
            if (command === "WATER OFF") {
                eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: "WATER", noun: "OFF" });
                return;
            }
            
            if (command.startsWith("PLAY ")) {
                const game = command.substring(5);
                eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: "PLAY", noun: game });
                return;
            }
            
            if (command.startsWith("CALL ")) {
                const number = command.substring(5);
                eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: "CALL", noun: number });
                return;
            }
            
            // Check for special commands (no noun)
            if (this.specialCommands.includes(command)) {
                eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: command, noun: null });
                return;
            }
            
            // Check for command shortcuts
            if (this.commandShortcuts[command]) {
                const expandedCommand = this.commandShortcuts[command];
                eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: expandedCommand, noun: null });
                return;
            }
            
            // Parse regular verb-noun command
            const parts = command.split(" ");
            const verb = parts[0];
            const noun = parts.length > 1 ? parts.slice(1).join(" ") : null;
            
            // Check if verb is a shortcut that needs expansion
            const expandedVerb = this.commandShortcuts[verb] || verb;
            
            // Publish the processed command
            eventBus.publish(GameEvents.COMMAND_PROCESSED, { verb: expandedVerb, noun: noun });
            
        } catch (error) {
            console.error("Error parsing command:", error);
            eventBus.publish(GameEvents.COMMAND_PROCESSED, { 
                error: true, 
                message: "ERROR PARSING COMMAND" 
            });
        }
    }
}
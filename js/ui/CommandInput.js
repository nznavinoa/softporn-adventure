// js/ui/CommandInput.js
import { GameEvents } from '../core/GameEvents.js';

/**
 * Handles user command input and command history
 */
export default class CommandInput {
  /**
   * @param {EventBus} eventBus - The event bus for communication
   * @param {Object} verbData - Data about available verbs
   * @param {Object} objectData - Game object data
   */
  constructor(eventBus, verbData, objectData) {
    this.eventBus = eventBus;
    this.verbData = verbData;
    this.objectData = objectData;
    
    // DOM elements (to be initialized when setupUI is called)
    this.inputField = null;
    this.verbButtons = null;
    this.nounButtons = null;
    this.directionButtons = null;
    this.actionButtons = null;
    
    // Command history
    this.commandHistory = [];
    this.historyIndex = -1;
    
    // Auto-complete state
    this.autoCompleteOptions = [];
    this.autoCompleteIndex = -1;
    
    // Currently selected verb (for two-part commands)
    this.selectedVerb = null;
    
    // Subscribe to events
    this.subscribeToEvents();
  }
  
  /**
   * Initialize UI elements and set up event listeners
   */
  setupUI() {
    this.inputField = document.getElementById('command-input');
    this.verbButtons = document.querySelector('.verb-buttons');
    this.nounButtons = document.getElementById('context-buttons');
    this.directionButtons = document.querySelector('.buttons');
    
    if (this.inputField) {
      this.setupCommandInput();
    }
    
    if (this.verbButtons) {
      this.setupVerbButtons();
    }
    
    if (this.directionButtons) {
      this.setupDirectionButtons();
    }
  }
  
  /**
   * Subscribe to relevant events
   */
  subscribeToEvents() {
    this.eventBus.subscribe(GameEvents.GAME_INITIALIZED, () => {
      this.setupUI();
    });
    
    this.eventBus.subscribe(GameEvents.ROOM_CHANGED, (data) => {
      this.updateContextButtons(data.currentRoom);
    });
    
    this.eventBus.subscribe(GameEvents.INVENTORY_CHANGED, () => {
      this.updateInventoryButtons();
    });
    
    this.eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => {
      // Add the command to history if it's not a duplicate of the last command
      if (this.commandHistory.length === 0 || 
          this.commandHistory[this.commandHistory.length - 1] !== data.command) {
        this.commandHistory.push(data.command);
        this.historyIndex = this.commandHistory.length;
      }
      
      // Clear selected verb after command is processed
      this.clearSelectedVerb();
    });
  }
  
  /**
   * Set up command input field
   */
  setupCommandInput() {
    this.inputField.addEventListener('keydown', (event) => {
      this.handleKeyPress(event);
    });
    
    this.inputField.addEventListener('input', () => {
      this.updateAutoComplete();
    });
    
    // Focus the input field when clicking anywhere in the game display
    document.getElementById('game-display').addEventListener('click', () => {
      this.inputField.focus();
    });
  }
  
  /**
   * Handle keyboard input
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyPress(event) {
    switch (event.key) {
      case 'Enter':
        this.submitCommand();
        break;
        
      case 'ArrowUp':
        // Navigate command history
        event.preventDefault();
        this.navigateHistory(-1);
        break;
        
      case 'ArrowDown':
        // Navigate command history
        event.preventDefault();
        this.navigateHistory(1);
        break;
        
      case 'Tab':
        // Auto-complete
        event.preventDefault();
        this.cycleAutoComplete();
        break;
        
      case 'Escape':
        // Clear input and selected verb
        this.inputField.value = '';
        this.clearSelectedVerb();
        break;
    }
  }
  
  /**
   * Submit the current command
   */
  submitCommand() {
    const command = this.inputField.value.trim();
    
    if (command) {
      // Display the command in the game output
      this.eventBus.publish(GameEvents.DISPLAY_TEXT, {
        text: `> ${command}`,
        className: 'command'
      });
      
      // Process the command
      this.eventBus.publish(GameEvents.COMMAND_RECEIVED, command);
      
      // Clear the input field
      this.inputField.value = '';
      
      // Reset auto-complete
      this.autoCompleteOptions = [];
      this.autoCompleteIndex = -1;
    }
  }
  
  /**
   * Navigate through command history
   * @param {number} direction - Direction to move (-1 for up, 1 for down)
   */
  navigateHistory(direction) {
    if (this.commandHistory.length === 0) return;
    
    const newIndex = this.historyIndex + direction;
    
    if (newIndex >= 0 && newIndex <= this.commandHistory.length) {
      this.historyIndex = newIndex;
      
      if (newIndex === this.commandHistory.length) {
        // At the end of history, show empty input
        this.inputField.value = '';
      } else {
        this.inputField.value = this.commandHistory[newIndex];
      }
      
      // Move cursor to end of input
      setTimeout(() => {
        this.inputField.selectionStart = this.inputField.selectionEnd = this.inputField.value.length;
      }, 0);
    }
  }
  
  /**
   * Update auto-complete options based on current input
   */
  updateAutoComplete() {
    const input = this.inputField.value.trim().toUpperCase();
    
    if (!input) {
      this.autoCompleteOptions = [];
      this.autoCompleteIndex = -1;
      return;
    }
    
    // If input has a space, it's a two-part command
    if (input.includes(' ')) {
      const [verb, partialNoun] = input.split(' ', 2);
      
      if (!partialNoun) {
        this.autoCompleteOptions = [];
        return;
      }
      
      // Find matching nouns based on the verb and partial noun
      this.autoCompleteOptions = this.getMatchingNouns(verb, partialNoun);
    } else {
      // Find matching verbs based on partial input
      this.autoCompleteOptions = this.getMatchingVerbs(input);
    }
    
    this.autoCompleteIndex = -1;
  }
  
  /**
   * Cycle through auto-complete options
   */
  cycleAutoComplete() {
    if (this.autoCompleteOptions.length === 0) return;
    
    this.autoCompleteIndex = (this.autoCompleteIndex + 1) % this.autoCompleteOptions.length;
    const option = this.autoCompleteOptions[this.autoCompleteIndex];
    
    // Apply the auto-complete option
    const input = this.inputField.value.trim().toUpperCase();
    
    if (input.includes(' ')) {
      // Two-part command
      const verb = input.split(' ', 1)[0];
      this.inputField.value = `${verb} ${option}`;
    } else {
      // Single verb command
      this.inputField.value = option;
    }
    
    // Move cursor to end of input
    setTimeout(() => {
      this.inputField.selectionStart = this.inputField.selectionEnd = this.inputField.value.length;
    }, 0);
  }
  
  /**
   * Get matching verbs based on partial input
   * @param {string} partial - Partial verb to match
   * @return {Array} Matching verbs
   */
  getMatchingVerbs(partial) {
    // Common verbs in the game
    const commonVerbs = [
      'LOOK', 'TAKE', 'DROP', 'USE', 'OPEN', 'PUSH', 'BUY', 'TALK',
      'EXAMINE', 'GO', 'INVENTORY', 'NORTH', 'SOUTH', 'EAST', 'WEST',
      'UP', 'DOWN', 'N', 'S', 'E', 'W', 'U', 'D'
    ];
    
    return commonVerbs.filter(verb => 
      verb.startsWith(partial) && verb !== partial
    );
  }
  
  /**
   * Get matching nouns based on verb and partial input
   * @param {string} verb - The verb being used
   * @param {string} partialNoun - Partial noun to match
   * @return {Array} Matching nouns
   */
  getMatchingNouns(verb, partialNoun) {
    // Get potential nouns based on the current verb, room, and inventory
    let potentialNouns = [];
    
    // Add room-specific nouns
    const roomObjects = this.eventBus.publish(GameEvents.GET_ROOM_OBJECTS, {});
    if (roomObjects && Array.isArray(roomObjects)) {
      potentialNouns = potentialNouns.concat(
        roomObjects.map(objId => this.objectData.objectNames[objId] || '')
      );
    }
    
    // Add inventory items
    const inventory = this.eventBus.publish(GameEvents.GET_INVENTORY, {});
    if (inventory && Array.isArray(inventory)) {
      potentialNouns = potentialNouns.concat(
        inventory.map(objId => this.objectData.objectNames[objId] || '')
      );
    }
    
    // Add common game nouns
    potentialNouns = potentialNouns.concat([
      'INVENTORY', 'I', 'ALL', 'SELF', 'ROOM'
    ]);
    
    // Filter based on partial input
    return potentialNouns.filter(noun => 
      noun && noun.startsWith(partialNoun) && noun !== partialNoun
    );
  }
  
  /**
   * Set up verb buttons
   */
  setupVerbButtons() {
    // Clear existing buttons
    this.verbButtons.innerHTML = '';
    
    // Common verbs to display as buttons
    const commonVerbs = [
      'LOOK', 'TAKE', 'DROP', 'USE', 'OPEN', 'PUSH'
    ];
    
    // Create a button for each verb
    commonVerbs.forEach(verb => {
      const button = document.createElement('button');
      button.textContent = verb;
      button.className = 'verb-btn';
      button.dataset.verb = verb;
      
      button.addEventListener('click', () => {
        this.handleVerbButtonClick(verb);
      });
      
      this.verbButtons.appendChild(button);
    });
  }
  
  /**
   * Handle verb button click
   * @param {string} verb - Verb that was clicked
   */
  handleVerbButtonClick(verb) {
    // If already selected, clear selection
    if (this.selectedVerb === verb) {
      this.clearSelectedVerb();
      return;
    }
    
    // Set as selected verb
    this.selectedVerb = verb;
    
    // Update button styling
    this.updateVerbButtonStyles();
    
    // Prefill command input
    this.inputField.value = `${verb} `;
    this.inputField.focus();
    
    // Update noun buttons based on the selected verb
    this.updateNounButtons(verb);
  }
  
  /**
   * Update verb button styles based on selection
   */
  updateVerbButtonStyles() {
    const buttons = this.verbButtons.querySelectorAll('.verb-btn');
    
    buttons.forEach(button => {
      if (button.dataset.verb === this.selectedVerb) {
        button.classList.add('selected-verb');
      } else {
        button.classList.remove('selected-verb');
      }
    });
  }
  
  /**
   * Clear selected verb
   */
  clearSelectedVerb() {
    this.selectedVerb = null;
    this.updateVerbButtonStyles();
  }
  
  /**
   * Set up direction buttons
   */
  setupDirectionButtons() {
    const buttons = this.directionButtons.querySelectorAll('button');
    
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        const command = button.dataset.command;
        
        if (command) {
          // Display the command
          this.eventBus.publish(GameEvents.DISPLAY_TEXT, {
            text: `> ${command}`,
            className: 'command'
          });
          
          // Process the command
          this.eventBus.publish(GameEvents.COMMAND_RECEIVED, command);
        }
      });
    });
  }
  
  /**
   * Update context-sensitive noun buttons
   * @param {number} roomId - Current room ID
   */
  updateContextButtons(roomId) {
    if (!this.nounButtons) return;
    
    // Clear existing buttons
    this.nounButtons.innerHTML = '';
    
    // Add room objects header
    const roomHeader = document.createElement('div');
    roomHeader.textContent = 'OBJECTS IN ROOM:';
    roomHeader.className = 'noun-header';
    this.nounButtons.appendChild(roomHeader);
    
    // Get room objects
    const roomObjects = this.eventBus.publish(GameEvents.GET_ROOM_OBJECTS, { roomId });
    
    // Add buttons for room objects
    if (roomObjects && roomObjects.length > 0) {
      roomObjects.forEach(objId => {
        const name = this.objectData.objectNames[objId] || `OBJECT_${objId}`;
        
        const button = document.createElement('button');
        button.textContent = name;
        button.className = 'noun-btn';
        button.dataset.objectId = objId;
        
        button.addEventListener('click', () => {
          this.handleNounButtonClick(objId, name);
        });
        
        this.nounButtons.appendChild(button);
      });
    } else {
      // No objects in the room
      const empty = document.createElement('div');
      empty.textContent = 'NOTHING!';
      empty.className = 'noun-empty';
      this.nounButtons.appendChild(empty);
    }
    
    // Update inventory buttons
    this.updateInventoryButtons();
  }
  
  /**
   * Update inventory buttons
   */
  updateInventoryButtons() {
    if (!this.nounButtons) return;
    
    // Remove any existing inventory section
    const existingHeader = this.nounButtons.querySelector('.inventory-header');
    if (existingHeader) {
      let current = existingHeader;
      while (current && current.nextElementSibling && 
             !current.nextElementSibling.classList.contains('noun-header')) {
        current.nextElementSibling.remove();
      }
      existingHeader.remove();
    }
    
    // Add inventory header
    const invHeader = document.createElement('div');
    invHeader.textContent = 'INVENTORY:';
    invHeader.className = 'noun-header inventory-header';
    this.nounButtons.appendChild(invHeader);
    
    // Get inventory
    const inventory = this.eventBus.publish(GameEvents.GET_INVENTORY, {});
    
    // Add buttons for inventory items
    if (inventory && inventory.length > 0) {
      inventory.forEach(objId => {
        const name = this.objectData.objectNames[objId] || `ITEM_${objId}`;
        
        const button = document.createElement('button');
        button.textContent = name;
        button.className = 'noun-btn inventory-item-btn';
        button.dataset.objectId = objId;
        
        button.addEventListener('click', () => {
          this.handleNounButtonClick(objId, name);
        });
        
        this.nounButtons.appendChild(button);
      });
    } else {
      // No items in inventory
      const empty = document.createElement('div');
      empty.textContent = 'NOTHING!';
      empty.className = 'noun-empty';
      this.nounButtons.appendChild(empty);
    }
  }
  
  /**
   * Update noun buttons based on selected verb
   * @param {string} verb - Selected verb
   */
  updateNounButtons(verb) {
    // This would filter the noun buttons to show only those applicable
    // to the selected verb. For example, only show items that can be taken
    // when the TAKE verb is selected.
    
    // For now, we'll just highlight the buttons based on verb compatibility
    if (!this.nounButtons) return;
    
    const buttons = this.nounButtons.querySelectorAll('.noun-btn');
    
    buttons.forEach(button => {
      const objId = parseInt(button.dataset.objectId);
      
      // Check if this object is compatible with the verb
      const isCompatible = this.isObjectCompatibleWithVerb(objId, verb);
      
      if (isCompatible) {
        button.classList.add('compatible-noun');
      } else {
        button.classList.remove('compatible-noun');
      }
    });
  }
  
  /**
   * Handle noun button click
   * @param {number} objId - Object ID
   * @param {string} name - Object name
   */
  handleNounButtonClick(objId, name) {
    if (this.selectedVerb) {
      // Use with selected verb
      const command = `${this.selectedVerb} ${name}`;
      this.inputField.value = command;
      this.submitCommand();
    } else {
      // Default to LOOK or USE based on item type
      const isInventoryItem = this.eventBus.publish(GameEvents.IS_IN_INVENTORY, { objectId: objId });
      const command = isInventoryItem ? `USE ${name}` : `LOOK ${name}`;
      this.inputField.value = command;
      this.submitCommand();
    }
  }
  
  /**
   * Check if an object is compatible with a verb
   * @param {number} objId - Object ID
   * @param {string} verb - Verb to check
   * @return {boolean} True if compatible
   */
  isObjectCompatibleWithVerb(objId, verb) {
    // This would check if the object can be used with the verb
    // based on object types and verb requirements
    
    // Example implementation:
    const objectTypes = this.objectData.objectTypes[objId] || [];
    const verbToObjectTypes = {
      "TAKE": ["ITEM"],
      "DROP": ["INVENTORY"],
      "USE": ["INVENTORY", "USABLE"],
      "OPEN": ["OPENABLE"],
      "EXAMINE": ["ALL"],
      "LOOK": ["ALL"],
      "BUY": ["BUYABLE"],
      "TALK": ["CHARACTER"],
      "PUSH": ["PUSHABLE"],
      "WEAR": ["WEARABLE"]
    };
    
    // Check if object is in inventory for inventory-only verbs
    if (verb === "DROP" || verb === "USE") {
      const isInInventory = this.eventBus.publish(GameEvents.IS_IN_INVENTORY, { objectId: objId });
      if (!isInInventory) return false;
    }
    
    // Check if object types match verb requirements
    const requiredTypes = verbToObjectTypes[verb] || [];
    
    // "ALL" matches any object
    if (requiredTypes.includes("ALL")) return true;
    
    // Check if any of the object's types match the required types
    return objectTypes.some(type => requiredTypes.includes(type));
  }
}
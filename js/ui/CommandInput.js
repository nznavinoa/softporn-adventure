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
    console.log("CommandInput constructor called");
    
    this.eventBus = eventBus;
    this.verbData = verbData;
    this.objectData = objectData;
    
    // DOM elements (to be initialized when setupUI is called)
    this.inputField = null;
    this.verbButtons = null;
    this.nounButtons = null;
    
    // Command history
    this.commandHistory = [];
    this.historyIndex = -1;
    
    // Currently selected verb (for two-part commands)
    this.selectedVerb = null;
    
    // Keep track of objects in the room and inventory
    this.currentRoomObjects = [];
    this.inventoryObjects = [];
    
    // Add debounce tracking
    this.lastCommandTime = 0;
    this.COMMAND_DEBOUNCE_INTERVAL = 300; // milliseconds
    
    // FIX: Flag to track if we've already set up handlers
    this.handlersInitialized = false;
    
    // Subscribe to events
    this.subscribeToEvents();
    
    console.log("CommandInput initialized");
  }
  
  /**
   * Initialize UI elements and set up event listeners
   */
  setupUI() {
    console.log("CommandInput.setupUI() called");
    
    // FIX: Check if we've already initialized to prevent duplicate handlers
    if (this.handlersInitialized) {
      console.log("CommandInput handlers already initialized, skipping setup");
      return;
    }
    
    this.inputField = document.getElementById('command-input');
    if (!this.inputField) {
      console.error("Command input field not found in the DOM");
    } else {
      console.log("Command input field found");
    }
    
    this.verbButtons = document.querySelector('.verb-buttons');
    this.nounButtons = document.getElementById('context-buttons');
    
    if (this.inputField) {
      this.setupCommandInput();
    }
    
    // Initialize with universal verbs at first
    if (this.verbButtons) {
      this.updateVerbButtons();
    }
    
    // FIX: Mark as initialized
    this.handlersInitialized = true;
    
    console.log("CommandInput setup complete");
  }
  
  /**
   * Subscribe to relevant events
   */
  subscribeToEvents() {
    console.log("Setting up CommandInput event listeners");
    
    this.eventBus.subscribe(GameEvents.GAME_INITIALIZED, () => {
      console.log("CommandInput received GAME_INITIALIZED event");
      this.setupUI();
    });
    
    this.eventBus.subscribe(GameEvents.ROOM_CHANGED, (data) => {
      console.log("CommandInput received ROOM_CHANGED event");
      
      // Store room objects
      this.currentRoomObjects = data.roomObjects || [];
      
      // Update both noun and verb buttons based on new room
      if (this.nounButtons) {
        this.updateContextButtons(data.currentRoom, data.roomObjects);
      }
      
      if (this.verbButtons) {
        this.updateVerbButtons();
      }
    });
    
    this.eventBus.subscribe(GameEvents.INVENTORY_CHANGED, (data) => {
      console.log("CommandInput received INVENTORY_CHANGED event");
      
      // Store inventory
      this.inventoryObjects = data.inventory || [];
      
      // Update buttons
      if (this.nounButtons) {
        this.updateInventoryButtons(data.inventory);
      }
      
      if (this.verbButtons) {
        this.updateVerbButtons();
      }
    });
    
    this.eventBus.subscribe(GameEvents.COMMAND_PROCESSED, (data) => {
      console.log("CommandInput received COMMAND_PROCESSED event");
      
      // Add the command to history if it's not a duplicate of the last command
      const commandStr = `${data.verb} ${data.noun || ''}`.trim();
      if (this.commandHistory.length === 0 || 
          this.commandHistory[this.commandHistory.length - 1] !== commandStr) {
        this.commandHistory.push(commandStr);
        this.historyIndex = this.commandHistory.length;
      }
      
      // Clear selected verb after command is processed
      this.clearSelectedVerb();
    });
    
    console.log("CommandInput event listeners set up");
  }
  
  /**
   * Set up command input field
   */
  setupCommandInput() {
    console.log("Setting up command input field");
    
    if (!this.inputField) return;
    
    // FIX: Check if we already added a keydown listener
    if (this.inputField.hasAttribute('data-has-keydown-listener')) {
      console.log("Command input already has keydown listener");
      return;
    }
    
    this.inputField.addEventListener('keydown', (event) => {
      this.handleKeyPress(event);
    });
    
    // Mark as having a listener
    this.inputField.setAttribute('data-has-keydown-listener', 'true');
    
    // Focus the input field when clicking anywhere in the game display
    const gameDisplay = document.getElementById('game-display');
    if (gameDisplay) {
      gameDisplay.addEventListener('click', () => {
        this.inputField.focus();
      });
    }
    
    console.log("Command input field event listeners set up");
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
      console.log("Submitting command:", command);
      
      // FIX: Debounce rapid submissions
      const now = Date.now();
      if (now - this.lastCommandTime < this.COMMAND_DEBOUNCE_INTERVAL) {
        console.log("Debounced command submission:", command);
        return;
      }
      this.lastCommandTime = now;
      
      // Display the command in the game output
      this.eventBus.publish(GameEvents.DISPLAY_TEXT, {
        text: `> ${command}`,
        className: 'command'
      });
      
      // Process the command
      this.eventBus.publish(GameEvents.COMMAND_RECEIVED, command);
      
      // Clear the input field
      this.inputField.value = '';
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
   * Update verb buttons based on available objects
   */
  updateVerbButtons() {
    console.log("Updating verb buttons");
    
    if (!this.verbButtons) return;
    
    // Clear existing buttons
    this.verbButtons.innerHTML = '';
    
    // Get all object types in the room and inventory
    const objectTypes = this.getAvailableObjectTypes();
    
    // Determine which verbs to show based on available object types
    const verbs = this.getContextualVerbs(objectTypes);
    
    // Create a button for each verb
    verbs.forEach(verb => {
      const button = document.createElement('button');
      button.textContent = verb;
      button.className = 'verb-btn';
      button.dataset.verb = verb;
      
      button.addEventListener('click', () => {
        this.handleVerbButtonClick(verb);
      });
      
      this.verbButtons.appendChild(button);
    });
    
    console.log("Verb buttons updated with contextual verbs:", verbs);
  }
  
  /**
   * Get all object types available in the current room and inventory
   * @return {Array} Array of unique object types
   */
  getAvailableObjectTypes() {
    const types = new Set();
    
    // Add universal types that are always present
    types.add('ALL');
    
    // Function to add types for an object
    const addTypesForObject = (objectId) => {
      if (!this.objectData || !this.objectData.objectTypes) return;
      
      const objectTypesList = this.objectData.objectTypes[objectId];
      if (objectTypesList && Array.isArray(objectTypesList)) {
        objectTypesList.forEach(type => types.add(type));
      }
    };
    
    // Add types for room objects
    this.currentRoomObjects.forEach(addTypesForObject);
    
    // Add types for inventory objects
    this.inventoryObjects.forEach(objectId => {
      addTypesForObject(objectId);
      
      // Also add the special INVENTORY type for all inventory items
      types.add('INVENTORY');
    });
    
    return Array.from(types);
  }
  
  /**
   * Get contextual verbs based on available object types
   * @param {Array} objectTypes - Available object types
   * @return {Array} Array of applicable verbs
   */
  getContextualVerbs(objectTypes) {
    // Always include these universal verbs
    const universalVerbs = ['LOOK', 'INVENTORY', 'HELP'];
    const verbs = new Set(universalVerbs);
    
    // Check if we have access to verb mapping data
    if (this.objectData && this.objectData.verbToObjectTypes) {
      const verbMap = this.objectData.verbToObjectTypes;
      
      // For each verb, check if it's applicable to any available object type
      Object.entries(verbMap).forEach(([verb, applicableTypes]) => {
        if (Array.isArray(applicableTypes)) {
          const isApplicable = applicableTypes.some(type => 
            objectTypes.includes(type) || type === 'ALL'
          );
          
          if (isApplicable) {
            verbs.add(verb);
          }
        }
      });
    } else {
      // Fallback if verb mapping isn't available - use a standard set
      ['TAKE', 'DROP', 'USE', 'OPEN', 'EXAMINE', 'PUSH'].forEach(verb => verbs.add(verb));
    }
    
    return Array.from(verbs);
  }
  
  /**
   * Handle verb button click
   * @param {string} verb - Verb that was clicked
   */
  handleVerbButtonClick(verb) {
    console.log("Verb button clicked:", verb);
    
    // FIX: Debounce rapid clicks
    const now = Date.now();
    if (now - this.lastCommandTime < this.COMMAND_DEBOUNCE_INTERVAL) {
      console.log("Debounced verb button click:", verb);
      return;
    }
    this.lastCommandTime = now;
    
    // Special handling for inventory command
    if (verb === 'INVENTORY') {
      this.eventBus.publish(GameEvents.COMMAND_RECEIVED, 'INVENTORY');
      return;
    }
    
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
    if (this.inputField) {
      this.inputField.value = `${verb} `;
      this.inputField.focus();
    }
    
    // Update noun buttons based on the selected verb
    if (this.nounButtons) {
      this.updateNounButtons(verb);
    }
  }
  
  /**
   * Update verb button styles based on selection
   */
  updateVerbButtonStyles() {
    if (!this.verbButtons) return;
    
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
   * Update context-sensitive noun buttons
   * @param {number} roomId - Current room ID
   * @param {Array} roomObjects - Objects in the room (optional)
   */
  updateContextButtons(roomId, roomObjects) {
    console.log("Updating context buttons for room:", roomId);
    
    if (!this.nounButtons) return;
    
    // Clear existing buttons first
    this.nounButtons.innerHTML = '';
    
    // If room objects were not provided, try to get them from the game
    if (!roomObjects || !Array.isArray(roomObjects)) {
      roomObjects = this.eventBus.publish(GameEvents.GET_ROOM_OBJECTS, { roomId });
    }
    
    if (!roomObjects || roomObjects.length === 0) {
      console.log("No objects in this room");
      return;
    }
    
    console.log(`Found ${roomObjects.length} objects in room:`, roomObjects);
    
    // Create a section header for room objects
    const roomHeader = document.createElement('div');
    roomHeader.className = 'room-objects-header';
    roomHeader.textContent = 'IN THIS ROOM:';
    this.nounButtons.appendChild(roomHeader);
    
    // Create a button for each object
    roomObjects.forEach(objectId => {
      // Get the object name
      const objectName = this.getObjectName(objectId);
      
      if (!objectName) return;
      
      // Create button
      const button = document.createElement('button');
      button.textContent = objectName;
      button.className = 'noun-btn';
      button.dataset.objectId = objectId;
      button.dataset.objectType = this.getObjectType(objectId);
      
      // Add event listener with debounce
      button.addEventListener('click', () => {
        // FIX: Debounce rapid clicks
        const now = Date.now();
        if (now - this.lastCommandTime < this.COMMAND_DEBOUNCE_INTERVAL) {
          console.log("Debounced noun button click:", objectName);
          return;
        }
        this.lastCommandTime = now;
        
        this.handleNounButtonClick(objectId, objectName);
      });
      
      // Add the button to the container
      this.nounButtons.appendChild(button);
    });
  }
  
  /**
   * Update inventory buttons
   * @param {Array} inventory - Inventory items (optional)
   */
  updateInventoryButtons(inventory) {
    console.log("Updating inventory buttons");
    
    if (!this.nounButtons) return;
    
    // If inventory was not provided, try to get it from the game
    if (!inventory || !Array.isArray(inventory)) {
      inventory = this.eventBus.publish(GameEvents.GET_INVENTORY, {}) || [];
    }
    
    if (inventory.length === 0) {
      console.log("Inventory is empty");
      return;
    }
    
    console.log(`Found ${inventory.length} items in inventory:`, inventory);
    
    // Add inventory header if not already present
    let header = this.nounButtons.querySelector('.inventory-header');
    if (!header) {
      header = document.createElement('div');
      header.className = 'inventory-header';
      header.textContent = 'INVENTORY:';
      this.nounButtons.appendChild(header);
    }
    
    // Create a button for each inventory item
    inventory.forEach(itemId => {
      // Get the item name
      const itemName = this.getObjectName(itemId);
      
      if (!itemName) return;
      
      // Create button
      const button = document.createElement('button');
      button.textContent = itemName;
      button.className = 'noun-btn inventory-item-btn';
      button.dataset.objectId = itemId;
      button.dataset.objectType = this.getObjectType(itemId);
      button.dataset.inInventory = "true";
      
      // Add event listener with debounce
      button.addEventListener('click', () => {
        // FIX: Debounce rapid clicks
        const now = Date.now();
        if (now - this.lastCommandTime < this.COMMAND_DEBOUNCE_INTERVAL) {
          console.log("Debounced inventory button click:", itemName);
          return;
        }
        this.lastCommandTime = now;
        
        this.handleNounButtonClick(itemId, itemName);
      });
      
      // Add the button to the container
      this.nounButtons.appendChild(button);
    });
  }
  
  /**
   * Handle noun button click
   * @param {number} objectId - Object ID
   * @param {string} objectName - Object name
   */
  handleNounButtonClick(objectId, objectName) {
    console.log(`Noun button clicked: ${objectName} (ID: ${objectId})`);
    
    // If a verb is already selected, complete the command
    if (this.selectedVerb) {
      const command = `${this.selectedVerb} ${objectName}`;
      
      // Set the command in the input field
      if (this.inputField) {
        this.inputField.value = command;
      }
      
      // Optionally auto-submit the command
      this.submitCommand();
    } else {
      // No verb selected, just pre-fill the noun
      if (this.inputField) {
        this.inputField.value = objectName;
        this.inputField.focus();
      }
    }
  }
  
  /**
   * Update noun buttons based on selected verb
   * @param {string} verb - Selected verb
   */
  updateNounButtons(verb) {
    console.log("Updating noun buttons for verb:", verb);
    
    if (!this.nounButtons) return;
    
    // Get all noun buttons
    const nounBtns = this.nounButtons.querySelectorAll('.noun-btn');
    
    // Reset all buttons first
    nounBtns.forEach(btn => {
      btn.classList.remove('compatible-noun');
    });
    
    // Check if we have verb mapping data
    if (this.objectData && this.objectData.verbToObjectTypes) {
      const applicableTypes = this.objectData.verbToObjectTypes[verb] || ['ALL'];
      
      // Highlight buttons that match the applicable types
      nounBtns.forEach(btn => {
        const objectType = btn.dataset.objectType || '';
        const types = objectType.split(',');
        const isInventory = btn.dataset.inInventory === "true";
        
        // Special case for the DROP verb - only inventory items can be dropped
        if (verb === 'DROP' && !isInventory) return;
        
        // Special case for the TAKE verb - only non-inventory items can be taken
        if (verb === 'TAKE' && isInventory) return;
        
        // Check if any of the object's types are compatible with this verb
        const isCompatible = 
          applicableTypes.includes('ALL') || 
          types.some(type => applicableTypes.includes(type));
        
        if (isCompatible) {
          btn.classList.add('compatible-noun');
        }
      });
    } else {
      // Without mapping data, just highlight all buttons
      nounBtns.forEach(btn => {
        btn.classList.add('compatible-noun');
      });
    }
  }
  
  /**
   * Get object name by ID
   * @param {number} objectId - Object ID
   * @return {string} Object name
   */
  getObjectName(objectId) {
    try {
      // Try getting the object name from the objectData
      if (this.objectData && this.objectData.objectNames) {
        return this.objectData.objectNames[objectId] || `OBJECT_${objectId}`;
      }
      
      // Fallback: try to get the name through the event bus
      return this.eventBus.publish(GameEvents.GET_OBJECT_NAME, { objectId }) || `OBJECT_${objectId}`;
    } catch (error) {
      console.error("Error getting object name:", error);
      return `OBJECT_${objectId}`;
    }
  }
  
  /**
   * Get object type by ID
   * @param {number} objectId - Object ID
   * @return {string} Object type(s) as comma-separated string
   */
  getObjectType(objectId) {
    try {
      // Try getting the object type from the objectData
      if (this.objectData && this.objectData.objectTypes) {
        const types = this.objectData.objectTypes[objectId];
        if (Array.isArray(types)) {
          return types.join(',');
        }
      }
      
      // Fallback: try to get the type through the event bus
      return this.eventBus.publish(GameEvents.GET_OBJECT_TYPE, { objectId }) || '';
    } catch (error) {
      console.error("Error getting object type:", error);
      return '';
    }
  }
}
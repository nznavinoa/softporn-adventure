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
    this.directionButtons = null;
    this.actionButtons = null;
    
    // Command history
    this.commandHistory = [];
    this.historyIndex = -1;
    
    // Currently selected verb (for two-part commands)
    this.selectedVerb = null;
    
    // Add debounce tracking
    this.lastCommandTime = 0;
    this.COMMAND_DEBOUNCE_INTERVAL = 300; // milliseconds
    
    // Subscribe to events
    this.subscribeToEvents();
    
    console.log("CommandInput initialized");
  }
  
  /**
   * Initialize UI elements and set up event listeners
   */
  setupUI() {
    console.log("CommandInput.setupUI() called");
    
    this.inputField = document.getElementById('command-input');
    if (!this.inputField) {
      console.error("Command input field not found in the DOM");
    } else {
      console.log("Command input field found");
    }
    
    this.verbButtons = document.querySelector('.verb-buttons');
    this.nounButtons = document.getElementById('context-buttons');
    this.directionButtons = document.querySelector('.buttons');
    
    if (this.inputField) {
      this.setupCommandInput();
    }
    
    if (this.verbButtons) {
      this.setupVerbButtons();
    }
    
    // Update direction buttons setup to use event delegation
    if (this.directionButtons) {
      this.directionButtons.addEventListener('click', this.handleDirectionButtonClick.bind(this));
      console.log("Direction buttons event delegation set up");
    }
    
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
      if (this.nounButtons) {
        this.updateContextButtons(data.currentRoom);
      }
    });
    
    this.eventBus.subscribe(GameEvents.INVENTORY_CHANGED, () => {
      console.log("CommandInput received INVENTORY_CHANGED event");
      if (this.nounButtons) {
        this.updateInventoryButtons();
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
    
    this.inputField.addEventListener('keydown', (event) => {
      this.handleKeyPress(event);
    });
    
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
   * Set up verb buttons
   */
  setupVerbButtons() {
    console.log("Setting up verb buttons");
    
    if (!this.verbButtons) return;
    
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
    
    console.log("Verb buttons created");
  }
  
  /**
   * Handle verb button click
   * @param {string} verb - Verb that was clicked
   */
  handleVerbButtonClick(verb) {
    console.log("Verb button clicked:", verb);
    
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
   * Handle direction button clicks with debounce
   * @param {Event} event - Click event
   */
  handleDirectionButtonClick(event) {
    const button = event.target.closest('.direction-btn');
    if (!button) return;
    
    const command = button.dataset.command;
    if (!command) return;
    
    // Debounce mechanism
    const currentTime = Date.now();
    if (currentTime - this.lastCommandTime < this.COMMAND_DEBOUNCE_INTERVAL) {
      console.log("Command debounced:", command);
      return;
    }
    
    this.lastCommandTime = currentTime;
    
    console.log("Direction button clicked:", command);
    
    // Display the command
    this.eventBus.publish(GameEvents.DISPLAY_TEXT, {
      text: `> ${command}`,
      className: 'command'
    });
    
    // Process the command
    this.eventBus.publish(GameEvents.COMMAND_RECEIVED, command);
  }
  
  /**
   * Update context-sensitive noun buttons
   * @param {number} roomId - Current room ID
   */
  updateContextButtons(roomId) {
    console.log("Updating context buttons for room:", roomId);
    
    if (!this.nounButtons) return;
    
    // This is a stub for now - in a real implementation, 
    // this would populate buttons based on room contents
    this.nounButtons.innerHTML = '<div>Room objects would appear here</div>';
  }
  
  /**
   * Update inventory buttons
   */
  updateInventoryButtons() {
    console.log("Updating inventory buttons");
    
    // This is a stub for now - in a real implementation,
    // this would populate buttons based on inventory contents
  }
  
  /**
   * Update noun buttons based on selected verb
   * @param {string} verb - Selected verb
   */
  updateNounButtons(verb) {
    console.log("Updating noun buttons for verb:", verb);
    
    // This is a stub for now - in a real implementation,
    // this would filter noun buttons based on verb compatibility
  }
}
// js/ui/UIManager.js
import { GameEvents } from '../core/GameEvents.js';

/**
 * Manages the overall UI and coordinates updates
 */
export default class UIManager {
  /**
   * @param {EventBus} eventBus - The event bus for communication
   * @param {RoomDisplay} roomDisplay - Room display component
   * @param {CommandInput} commandInput - Command input component
   * @param {ImageLoader} imageLoader - Image loader utility
   */
  constructor(eventBus, roomDisplay, commandInput, imageLoader) {
    console.log("UIManager constructor called");
    
    this.eventBus = eventBus;
    this.roomDisplay = roomDisplay;
    this.commandInput = commandInput;
    this.imageLoader = imageLoader;
    
    // DOM elements
    this.gameDisplay = null;
    this.loadingSpinner = null;
    this.directionButtons = null;
    
    // Game display content
    this.gameOutput = [];
    
    // UI state
    this.isLoading = false;
    this.showingDialog = false;
    
    // Available directions in current room
    this.availableDirections = [];
    
    // FIX: Flag to prevent duplicate updates
    this.isUpdating = false;
    
    // Subscribe to events
    this.subscribeToEvents();
    
    console.log("UIManager initialized");
  }
  
  /**
   * Initialize UI elements
   */
  setupUI() {
    console.log("UIManager.setupUI() called");
    
    this.gameDisplay = document.getElementById('game-display');
    if(!this.gameDisplay) {
      console.error("Game display element not found in the DOM");
    } else {
      console.log("Game display element found");
    }
    
    // Find the buttons container
    this.directionButtons = document.querySelector('.buttons');
    if(!this.directionButtons) {
      console.error("Direction buttons container not found in the DOM");
    } else {
      console.log("Direction buttons container found");
      // Set up direction and action buttons
      this.setupDirectionButtons();
    }
    
    // Create loading spinner
    this.loadingSpinner = document.createElement('div');
    this.loadingSpinner.className = 'loading-spinner';
    this.loadingSpinner.style.display = 'none';
    
    const container = document.querySelector('.container');
    if (container) {
      container.appendChild(this.loadingSpinner);
    } else {
      console.error("Container element not found in the DOM");
    }
    
    // Initialize tooltip container
    this.setupTooltips();
    
    // If command input exists, set it up
    if (this.commandInput) {
      this.commandInput.setupUI();
    }
    
    console.log("UIManager setup complete");
  }
  
  /**
   * Subscribe to relevant events
   */
  subscribeToEvents() {
    console.log("Setting up UIManager event listeners");
    
    this.eventBus.subscribe(GameEvents.GAME_INITIALIZED, () => {
      console.log("UIManager received GAME_INITIALIZED event");
      this.setupUI();
    });
    
    this.eventBus.subscribe(GameEvents.DISPLAY_TEXT, (data) => {
      console.log("UIManager received DISPLAY_TEXT event");
      this.addToGameDisplay(data.text, data.className || "");
    });
    
    this.eventBus.subscribe(GameEvents.UI_REFRESH, (data) => {
      console.log("UIManager received UI_REFRESH event:", data);
      // FIX: Prevent duplicate refresh operations
      if (!this.isUpdating) {
        this.refreshUI(data.type);
      }
    });
    
    this.eventBus.subscribe(GameEvents.UI_SHOW_DIALOG, (data) => {
      console.log("UIManager received UI_SHOW_DIALOG event");
      this.showDialog(data.title, data.content, data.buttons);
    });
    
    this.eventBus.subscribe(GameEvents.UI_HIDE_DIALOG, () => {
      console.log("UIManager received UI_HIDE_DIALOG event");
      this.hideDialog();
    });
    
    this.eventBus.subscribe(GameEvents.DISPLAY_UPDATED, (data) => {
      console.log("UIManager received DISPLAY_UPDATED event");
      if (data.newContent) {
        // FIX: Prevent duplicate update operations
        if (!this.isUpdating) {
          this.updateGameDisplay();
        }
      }
    });
    
    this.eventBus.subscribe(GameEvents.ROOM_CHANGED, (data) => {
      console.log("UIManager received ROOM_CHANGED event for room:", data.currentRoom);
      
      // Update available directions
      this.availableDirections = data.availableDirections || [];
      
      // Update direction buttons
      this.updateDirectionButtons();
    });
    
    console.log("UIManager event listeners set up");
  }
  
  /**
   * Add content to the game display
   * @param {string} content - HTML content to add
   * @param {string} className - Optional CSS class for styling
   */
  addToGameDisplay(content, className = "") {
    try {
      console.log("UIManager adding to game display");
      
      // Store in history
      this.gameOutput.push({ content, className });
      
      // Update the actual display
      this.updateGameDisplay();
    } catch (error) {
      console.error("Error adding to game display:", error);
    }
  }
  
  /**
   * Update the game display with all content
   */
  updateGameDisplay() {
    console.log("UIManager.updateGameDisplay() called");
    
    // FIX: Set updating flag to prevent duplicate updates
    if (this.isUpdating) {
      console.log("Already updating game display, skipping duplicate update");
      return;
    }
    
    this.isUpdating = true;
    
    if (!this.gameDisplay) {
      console.error("Game display element not available");
      this.gameDisplay = document.getElementById('game-display');
      if (!this.gameDisplay) {
        console.error("Game display element still not found");
        this.isUpdating = false;
        return;
      }
    }
    
    // Clear previous content
    this.gameDisplay.innerHTML = "";
    
    // Add all output
    this.gameOutput.forEach(output => {
      const div = document.createElement("div");
      div.innerHTML = output.content;
      if (output.className) {
        div.className = output.className;
      }
      this.gameDisplay.appendChild(div);
    });
    
    // Scroll to bottom
    this.gameDisplay.scrollTop = this.gameDisplay.scrollHeight;
    
    console.log("Game display updated");
    
    // FIX: Clear updating flag after a short delay
    setTimeout(() => {
      this.isUpdating = false;
    }, 50);
  }
  
  /**
   * Refresh specific UI components
   * @param {string} component - Component to refresh ('all' or specific component name)
   */
  refreshUI(component) {
    console.log("UIManager.refreshUI() called for:", component);
    
    // FIX: Set updating flag to prevent duplicate updates
    if (this.isUpdating) {
      console.log("Already updating UI, skipping duplicate refresh");
      return;
    }
    
    this.isUpdating = true;
    
    // Refresh specific component or all UI
    if (component === 'all' || component === 'gameDisplay') {
      this.updateGameDisplay();
    }
    
    if (component === 'all' || component === 'directions') {
      this.updateDirectionButtons();
    }
    
    if (component === 'all' || component === 'roomObjects') {
      // Room display will handle this
      if (this.roomDisplay) {
        this.roomDisplay.setupUI();
      }
    }
    
    // FIX: Clear updating flag after a short delay
    setTimeout(() => {
      this.isUpdating = false;
    }, 50);
  }
  
  /**
   * Set up direction buttons
   */
  setupDirectionButtons() {
    console.log("Setting up direction buttons");
    
    if (!this.directionButtons) {
      console.error("Direction buttons container not found");
      // Try to find it one more time
      this.directionButtons = document.querySelector('.buttons');
      if (!this.directionButtons) {
        console.error("Still cannot find direction buttons container");
        return;
      }
    }
    
    // Clear existing buttons
    this.directionButtons.innerHTML = '';
    
    // Create all possible direction buttons (will be shown/hidden based on availability)
    const directions = [
      { command: 'N', text: 'NORTH' },
      { command: 'S', text: 'SOUTH' },
      { command: 'E', text: 'EAST' },
      { command: 'W', text: 'WEST' },
      { command: 'U', text: 'UP' },
      { command: 'D', text: 'DOWN' }
    ];
    
    // Create each button
    directions.forEach(dir => {
      const button = document.createElement('button');
      button.textContent = dir.text;
      button.className = 'direction-btn';
      button.dataset.command = dir.command;
      button.dataset.direction = dir.text;
      
      // Initially hide all direction buttons
      button.style.display = 'none';
      
      this.directionButtons.appendChild(button);
    });
    
    // Create action buttons that are always available
    const actions = [
      { command: 'LOOK', text: 'LOOK' },
      { command: 'INVENTORY', text: 'INV' }
    ];
    
    // Create each action button
    actions.forEach(action => {
      const button = document.createElement('button');
      button.textContent = action.text;
      button.className = 'action-btn';
      button.dataset.command = action.command;
      
      this.directionButtons.appendChild(button);
    });
    
    // Set up event handling for all buttons using event delegation
    this.directionButtons.addEventListener('click', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      
      const command = button.dataset.command;
      if (!command) return;
      
      console.log("Direction/action button clicked:", command);
      
      // Display the command
      this.eventBus.publish(GameEvents.DISPLAY_TEXT, {
        text: `> ${command}`,
        className: 'command'
      });
      
      // Process the command
      this.eventBus.publish(GameEvents.COMMAND_RECEIVED, command);
    });
    
    console.log("Direction buttons setup complete");
  }
  
  /**
   * Update direction buttons based on available exits
   */
  updateDirectionButtons() {
    console.log("UIManager.updateDirectionButtons() called");
    console.log("Available directions:", this.availableDirections);
    
    if (!this.directionButtons) {
      console.error("Direction buttons container not found");
      return;
    }
    
    // Map of direction names to their abbreviated form
    const directionMap = {
      'NORTH': 'N',
      'SOUTH': 'S',
      'EAST': 'E',
      'WEST': 'W',
      'UP': 'U',
      'DOWN': 'D'
    };
    
    // Hide all direction buttons first
    const dirButtons = this.directionButtons.querySelectorAll('.direction-btn');
    dirButtons.forEach(button => {
      button.style.display = 'none';
      button.classList.remove('available-direction');
    });
    
    // Show only available directions
    if (this.availableDirections && this.availableDirections.length > 0) {
      this.availableDirections.forEach(direction => {
        // Find the button for this direction
        const dir = direction.toUpperCase();
        const abbr = directionMap[dir] || dir;
        
        const button = this.directionButtons.querySelector(`.direction-btn[data-command="${abbr}"]`);
        if (button) {
          button.style.display = 'inline-block';
          button.classList.add('available-direction');
          
          // Add tooltip to explain the direction
          button.setAttribute('title', `Go ${dir.toLowerCase()}`);
        }
      });
    }
    
    console.log("Direction buttons updated");
  }
  
  /**
   * Show a dialog box
   * @param {string} title - Dialog title
   * @param {string} content - Dialog content (can be HTML)
   * @param {Array} buttons - Array of button configurations {text, id, callback}
   */
  showDialog(title, content, buttons) {
    console.log("UIManager.showDialog() called");
    
    try {
      // Remove any existing dialog
      this.hideDialog();
      
      // Create dialog container
      const dialog = document.createElement('div');
      dialog.className = 'game-dialog';
      
      // Add title
      const titleElement = document.createElement('div');
      titleElement.className = 'dialog-title';
      titleElement.textContent = title;
      dialog.appendChild(titleElement);
      
      // Add content
      const contentElement = document.createElement('div');
      contentElement.className = 'dialog-content';
      contentElement.innerHTML = content;
      dialog.appendChild(contentElement);
      
      // Add buttons
      if (buttons && buttons.length > 0) {
        const buttonsElement = document.createElement('div');
        buttonsElement.className = 'dialog-buttons';
        
        buttons.forEach(button => {
          const buttonElement = document.createElement('button');
          buttonElement.textContent = button.text;
          buttonElement.id = button.id;
          buttonElement.addEventListener('click', () => {
            if (button.callback) button.callback();
            this.hideDialog();
          });
          buttonsElement.appendChild(buttonElement);
        });
        
        dialog.appendChild(buttonsElement);
      }
      
      // Add to DOM
      document.body.appendChild(dialog);
      this.showingDialog = true;
      
      // Add backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'dialog-backdrop';
      document.body.appendChild(backdrop);
      
      // Use setTimeout to trigger CSS transition
      setTimeout(() => {
        dialog.classList.add('visible');
        backdrop.classList.add('visible');
      }, 10);
    } catch (error) {
      console.error("Error showing dialog:", error);
    }
  }
  
  /**
   * Hide the dialog box
   */
  hideDialog() {
    if (!this.showingDialog) return;
    
    const dialog = document.querySelector('.game-dialog');
    const backdrop = document.querySelector('.dialog-backdrop');
    
    if (dialog) {
      dialog.classList.remove('visible');
      setTimeout(() => {
        dialog.remove();
      }, 300);
    }
    
    if (backdrop) {
      backdrop.classList.remove('visible');
      setTimeout(() => {
        backdrop.remove();
      }, 300);
    }
    
    this.showingDialog = false;
  }
  
  /**
   * Set up tooltips for buttons
   */
  setupTooltips() {
    // Create a tooltip element that will be reused
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    
    // Add tooltip functionality to buttons
    document.addEventListener('mouseover', (event) => {
      const button = event.target.closest('button');
      if (!button) return;
      
      const tooltipText = button.dataset.tooltip || button.getAttribute('title');
      if (!tooltipText) return;
      
      // Position tooltip
      const rect = button.getBoundingClientRect();
      tooltip.textContent = tooltipText;
      tooltip.style.display = 'block';
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
    });
    
    document.addEventListener('mouseout', () => {
      tooltip.style.display = 'none';
    });
  }
  
  /**
   * Clear the game display
   */
  clearGameDisplay() {
    this.gameOutput = [];
    this.updateGameDisplay();
  }
  
  /**
   * Add a stylized message to the game display
   * @param {string} message - Message to display
   * @param {string} type - Message type (success, error, system)
   */
  addStylizedMessage(message, type = 'normal') {
    let className = '';
    
    switch (type) {
      case 'error':
        className = 'error-message';
        break;
      case 'success':
        className = 'success-message';
        break;
      case 'system':
        className = 'system-message';
        break;
    }
    
    this.addToGameDisplay(message, className);
  }
}
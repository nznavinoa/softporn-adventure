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
    
    // Game display content
    this.gameOutput = [];
    
    // UI state
    this.isLoading = false;
    this.showingDialog = false;
    
    // Add initialization tracking
    this.isInitialized = false;
    
    // Subscribe to events
    this.subscribeToEvents();
    
    console.log("UIManager initialized");
  }
  
  /**
   * Initialize UI elements
   */
  setupUI() {
    console.log("UIManager.setupUI() called");
    
    // Wait for DOM to be ready
    if (!document.body) {
      console.error("Document body not ready");
      return;
    }

    // Get or create main container
    let container = document.querySelector('.container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'container';
      document.body.appendChild(container);
    }

    // Get or create game display
    this.gameDisplay = document.getElementById('game-display');
    if (!this.gameDisplay) {
      this.gameDisplay = document.createElement('div');
      this.gameDisplay.id = 'game-display';
      container.appendChild(this.gameDisplay);
    }

    // Create loading spinner
    if (!this.loadingSpinner) {
      this.loadingSpinner = document.createElement('div');
      this.loadingSpinner.className = 'loading-spinner';
      this.loadingSpinner.style.display = 'none';
      container.appendChild(this.loadingSpinner);
    }

    // Initialize tooltip container
    this.setupTooltips();
    
    // Set up command input if it exists
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
    
    // Game initialization events
    this.eventBus.subscribe(GameEvents.GAME_STARTED, (data) => {
      if (!this.isInitialized) {
        console.log("UIManager received GAME_STARTED event");
        this.setupUI();
        this.isInitialized = true;
      }
    });
    
    // UI refresh events
    this.eventBus.subscribe(GameEvents.UI_REFRESH, (data) => {
      if (this.isInitialized) {
        console.log("UIManager received UI_REFRESH event:", data);
        this.refreshUI(data.type);
      }
    });
    
    // Room change events
    this.eventBus.subscribe(GameEvents.ROOM_CHANGED, (data) => {
      if (this.isInitialized) {
        console.log("UIManager received ROOM_CHANGED event");
        this.updateDirectionButtons();
      }
    });
    
    // Display text events
    this.eventBus.subscribe(GameEvents.DISPLAY_TEXT, (data) => {
      if (this.isInitialized) {
        console.log("UIManager received DISPLAY_TEXT event");
        this.addToGameDisplay(data.text, data.className || "");
      }
    });
    
    // Dialog events
    this.eventBus.subscribe(GameEvents.UI_SHOW_DIALOG, (data) => {
      if (this.isInitialized) {
        console.log("UIManager received UI_SHOW_DIALOG event");
        this.showDialog(data.title, data.content, data.buttons);
      }
    });
    
    this.eventBus.subscribe(GameEvents.UI_HIDE_DIALOG, () => {
      if (this.isInitialized) {
        console.log("UIManager received UI_HIDE_DIALOG event");
        this.hideDialog();
      }
    });
    
    // Display update events
    this.eventBus.subscribe(GameEvents.DISPLAY_UPDATED, (data) => {
      if (this.isInitialized && data.newContent) {
        console.log("UIManager received DISPLAY_UPDATED event");
        this.updateGameDisplay();
      }
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
   * Update the game display with all content and enhanced error handling
   */
  updateGameDisplay() {
    console.log("UIManager.updateGameDisplay() called");
    console.log("Total game output items:", this.gameOutput.length);
    
    if (!this.gameDisplay) {
        console.error("Game display element not available");
        this.gameDisplay = document.getElementById('game-display');
        if (!this.gameDisplay) {
            console.error("Game display element still not found");
            return;
        }
    }
    
    try {
        // Clear previous content
        this.gameDisplay.innerHTML = "";
        
        // Add all output with enhanced error handling
        this.gameOutput.forEach((output, index) => {
            try {
                // Ensure output is an object with content
                const content = output.content || output;
                const className = output.className || '';
                
                const div = document.createElement("div");
                
                // Handle different content types
                if (typeof content === 'string') {
                    div.innerHTML = content;
                } else {
                    console.warn(`Unexpected content type at index ${index}:`, content);
                    div.textContent = JSON.stringify(content);
                }
                
                // Apply class if provided
                if (className) {
                    div.className = className;
                }
                
                // Add debugging attributes
                div.dataset.index = index;
                
                this.gameDisplay.appendChild(div);
            } catch (error) {
                console.error(`Error rendering output item at index ${index}:`, error);
                
                // Fallback error display
                const errorDiv = document.createElement("div");
                errorDiv.className = 'error-message';
                errorDiv.textContent = `Rendering error: ${error.message}`;
                this.gameDisplay.appendChild(errorDiv);
            }
        });
        
        // Scroll to bottom using requestAnimationFrame for smooth scrolling
        requestAnimationFrame(() => {
            this.gameDisplay.scrollTop = this.gameDisplay.scrollHeight;
        });
        
        console.log("Game display update complete");
    } catch (error) {
        console.error("Critical error updating game display:", error);
        this.showFallbackError(error);
    }
  }

  /**
   * Display fallback error message when critical error occurs
   * @param {Error} error - The error that occurred
   */
  showFallbackError(error) {
    try {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'critical-error';
        errorContainer.innerHTML = `
            <h3>Display Error</h3>
            <p>There was a problem updating the display.</p>
            <p class="error-details">${error.message}</p>
        `;
        document.body.appendChild(errorContainer);
    } catch (e) {
        // Last resort error handling
        alert('Critical display error: ' + error.message);
    }
  }
  
  /**
   * Refresh specific UI components
   * @param {string} component - Component to refresh ('all' or specific component name)
   */
  refreshUI(component) {
    console.log("UIManager.refreshUI() called for:", component);
    
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
  }
  
  /**
   * Update direction buttons based on available exits
   */
  updateDirectionButtons() {
    console.log("UIManager.updateDirectionButtons() called");
    
    try {
      // Retrieve available directions from the current room
      const directions = this.eventBus.publish(GameEvents.GET_AVAILABLE_DIRECTIONS, {});
      
      if (!directions || !Array.isArray(directions)) {
        console.log("No directions available or invalid format");
        return;
      }
      
      // Normalize directions to match button data-command attributes
      const normalizedDirections = directions.map(dir => {
        switch(dir.toUpperCase()) {
          case 'NORTH': return 'N';
          case 'SOUTH': return 'S';
          case 'EAST': return 'E';
          case 'WEST': return 'W';
          case 'UP': return 'U';
          case 'DOWN': return 'D';
          default: return dir;
        }
      });

      // Get all direction buttons
      const directionButtons = document.querySelectorAll('.direction-btn');
      
      directionButtons.forEach(btn => {
        const buttonDirection = btn.dataset.command;
        
        if (normalizedDirections.includes(buttonDirection)) {
          // Show and enable button if direction is available
          btn.style.display = 'inline-block';
          btn.disabled = false;
          btn.classList.add('available-direction');
        } else {
          // Hide and disable button if direction is not available
          btn.style.display = 'none';
          btn.disabled = true;
          btn.classList.remove('available-direction');
        }
      });

      console.log("Available directions:", normalizedDirections);
    } catch (error) {
      console.error("Error updating direction buttons:", error);
    }
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
      
      const tooltipText = button.dataset.tooltip;
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

  /**
   * Validate required DOM elements
   */
  validateDOMElements() {
    const elements = {
      gameDisplay: this.gameDisplay,
      container: document.querySelector('.container'),
      loadingSpinner: this.loadingSpinner
    };

    for (const [name, element] of Object.entries(elements)) {
      if (!element) {
        console.error(`Required DOM element '${name}' is missing`);
        return false;
      }
    }
    return true;
  }
}
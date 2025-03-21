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
    
    // Subscribe to events
    this.subscribeToEvents();
  }
  
  /**
   * Initialize UI elements
   */
  setupUI() {
    this.gameDisplay = document.getElementById('game-display');
    
    // Create loading spinner
    this.loadingSpinner = document.createElement('div');
    this.loadingSpinner.className = 'loading-spinner';
    this.loadingSpinner.style.display = 'none';
    document.querySelector('.container').appendChild(this.loadingSpinner);
    
    // Initialize tooltip container
    this.setupTooltips();
  }
  
  /**
   * Subscribe to relevant events
   */
  subscribeToEvents() {
    this.eventBus.subscribe(GameEvents.GAME_INITIALIZED, () => {
      this.setupUI();
    });
    
    this.eventBus.subscribe(GameEvents.DISPLAY_TEXT, (data) => {
      this.addToGameDisplay(data.text, data.className || "");
    });
    
    this.eventBus.subscribe(GameEvents.UI_REFRESH, (data) => {
      this.refreshUI(data.component);
    });
    
    this.eventBus.subscribe(GameEvents.UI_SHOW_DIALOG, (data) => {
      this.showDialog(data.title, data.content, data.buttons);
    });
    
    this.eventBus.subscribe(GameEvents.UI_HIDE_DIALOG, () => {
      this.hideDialog();
    });
    
    this.eventBus.subscribe(GameEvents.IMAGE_LOADING_COMPLETE, () => {
      this.setLoading(false);
    });
    
    this.eventBus.subscribe(GameEvents.ANIMATION_STARTED, () => {
      this.setLoading(true);
    });
    
    this.eventBus.subscribe(GameEvents.ANIMATION_ENDED, () => {
      this.setLoading(false);
    });
  }
  
  /**
   * Add content to the game display
   * @param {string} content - HTML content to add
   * @param {string} className - Optional CSS class for styling
   */
  addToGameDisplay(content, className = "") {
    try {
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
    if (!this.gameDisplay) return;
    
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
  }
  
  /**
   * Refresh specific UI components
   * @param {string} component - Component to refresh ('all' or specific component name)
   */
  refreshUI(component) {
    // Refresh specific component or all UI
    if (component === 'all' || component === 'gameDisplay') {
      this.updateGameDisplay();
    }
    
    if (component === 'all' || component === 'directions') {
      this.updateDirectionButtons();
    }
    
    if (component === 'all' || component === 'roomObjects') {
      // Room display will handle this
    }
  }
  
  /**
   * Update direction buttons based on available exits
   */
  updateDirectionButtons() {
    const directions = this.eventBus.publish(GameEvents.GET_AVAILABLE_DIRECTIONS, {});
    
    if (!directions || !Array.isArray(directions)) return;
    
    // Show/hide direction buttons
    document.querySelectorAll('.direction-btn').forEach(btn => {
      const dir = btn.dataset.command;
      if (directions.includes(dir)) {
        btn.style.display = 'inline-block';
        
        // Add subtle highlight effect for available directions
        btn.classList.add('available-direction');
      } else {
        btn.style.display = 'none';
        btn.classList.remove('available-direction');
      }
    });
  }
  
  /**
   * Show a dialog box
   * @param {string} title - Dialog title
   * @param {string} content - Dialog content (can be HTML)
   * @param {Array} buttons - Array of button configurations {text, id, callback}
   */
  showDialog(title, content, buttons) {
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
   * Show or hide loading indicator
   * @param {boolean} isLoading - Whether loading is in progress
   */
  setLoading(isLoading) {
    this.isLoading = isLoading;
    
    if (this.loadingSpinner) {
      this.loadingSpinner.style.display = isLoading ? 'block' : 'none';
    }
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
}
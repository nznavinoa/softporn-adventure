// js/ui/RoomDisplay.js
import { GameEvents } from '../core/GameEvents.js';

/**
 * Handles visualization of the current room
 */
export default class RoomDisplay {
  /**
   * @param {EventBus} eventBus - The event bus for communication
   * @param {ImageLoader} imageLoader - Image loader utility
   * @param {Object} roomData - Room descriptions and data
   * @param {Object} objectData - Game object data
   */
  constructor(eventBus, imageLoader, roomData, objectData) {
    this.eventBus = eventBus;
    this.imageLoader = imageLoader;
    this.roomData = roomData;
    this.objectData = objectData;
    
    // DOM elements (to be initialized when setupUI is called)
    this.locationImage = null;
    this.locationName = null;
    this.gameDisplay = null;
    
    // Current room state
    this.currentRoom = null;
    this.previousRoom = null;
    this.transitionInProgress = false;
    
    // Subscribe to events
    this.subscribeToEvents();
  }
  
  /**
   * Initialize UI elements
   */
  setupUI() {
    this.locationImage = document.getElementById('location-image');
    this.locationName = document.getElementById('location-name');
    this.gameDisplay = document.getElementById('game-display');
  }
  
  /**
   * Subscribe to relevant events
   */
  subscribeToEvents() {
    this.eventBus.subscribe(GameEvents.ROOM_CHANGED, (data) => {
      this.handleRoomChange(data.previousRoom, data.currentRoom, data.direction);
    });
    
    this.eventBus.subscribe(GameEvents.ROOM_OBJECTS_CHANGED, (data) => {
      this.updateRoomObjects(data.roomId, data.objects);
    });
    
    this.eventBus.subscribe(GameEvents.GAME_INITIALIZED, () => {
      this.setupUI();
    });
  }
  
  /**
   * Handle room change event
   * @param {number} previousRoom - ID of the room being left
   * @param {number} currentRoom - ID of the new room
   * @param {string} direction - Direction of movement
   */
  handleRoomChange(previousRoom, currentRoom, direction) {
    this.previousRoom = previousRoom;
    this.currentRoom = currentRoom;
    
    // Perform transition animation if direction is provided
    if (direction && !this.transitionInProgress) {
      this.transitionToRoom(direction);
    } else {
      this.displayRoom(currentRoom);
    }
  }
  
  /**
   * Display the specified room without transition
   * @param {number} roomId - Room ID to display
   */
  displayRoom(roomId) {
    if (!this.locationImage || !this.locationName) {
      this.setupUI();
    }
    
    // Get room data
    const roomDesc = this.roomData.roomDescriptions[roomId] || `ROOM ${roomId}`;
    
    // Update location name
    if (this.locationName) {
      this.locationName.textContent = roomDesc;
    }
    
    // Apply room image
    if (this.locationImage) {
      // Use room ID to determine image name (e.g., "hallway" for room 1)
      const roomImageName = this.getRoomImageName(roomId);
      this.imageLoader.applyImage(this.locationImage, 'locations', roomImageName);
    }
    
    // Notify that room display is complete
    this.eventBus.publish(GameEvents.ROOM_DISPLAY_UPDATED, {
      roomId: roomId
    });
  }
  
  /**
   * Get image name for a room
   * @param {number} roomId - Room ID
   * @return {string} Image name
   */
  getRoomImageName(roomId) {
    // Map room IDs to image names
    const roomImageMap = {
      1: 'hallway',
      2: 'bathroom',
      3: 'bar',
      4: 'street',
      5: 'backroom',
      6: 'dumpster',
      7: 'hotel_room',
      8: 'window_ledge',
      9: 'hooker_bedroom',
      10: 'balcony',
      // Add mappings for all rooms
    };
    
    return roomImageMap[roomId] || 'default';
  }
  
  /**
   * Animate transition to a new room
   * @param {string} direction - Direction of movement
   */
  transitionToRoom(direction) {
    if (!this.locationImage) return;
    
    this.transitionInProgress = true;
    
    // Add direction-specific transition class
    this.locationImage.classList.add('transition');
    this.locationImage.classList.add(`transition-${direction.toLowerCase()}`);
    
    // After a brief delay, update the image and remove transition classes
    setTimeout(() => {
      this.displayRoom(this.currentRoom);
      
      setTimeout(() => {
        this.locationImage.classList.remove('transition');
        this.locationImage.classList.remove(`transition-${direction.toLowerCase()}`);
        this.transitionInProgress = false;
      }, 300);
    }, 300);
  }
  
  /**
   * Update visualization of objects in the room
   * @param {number} roomId - Room ID
   * @param {Array} objects - Array of object IDs in the room
   */
  updateRoomObjects(roomId, objects) {
    if (roomId !== this.currentRoom) return;
    
    // This function could add visual indicators for objects in the room
    // For example, adding icons or highlighted areas to the room image
    
    // For now, we'll simply publish an event indicating room objects are updated
    this.eventBus.publish(GameEvents.UI_REFRESH, {
      component: 'roomObjects',
      roomId: roomId,
      objects: objects
    });
  }
  
  /**
   * Add a character to the room visualization
   * @param {number} charId - Character ID
   */
  addCharacterToRoom(charId) {
    // This would add a character visualization to the room
    // For a text adventure with simple graphics, this might be an overlay image
    
    // Example implementation:
    if (!this.locationImage) return;
    
    const characterElement = document.createElement('div');
    characterElement.classList.add('room-character');
    characterElement.dataset.characterId = charId;
    
    // Apply character image
    this.imageLoader.applyImage(characterElement, 'characters', `char_${charId}`);
    
    // Add to the location container
    this.locationImage.appendChild(characterElement);
  }
  
  /**
   * Remove a character from the room visualization
   * @param {number} charId - Character ID
   */
  removeCharacterFromRoom(charId) {
    if (!this.locationImage) return;
    
    const characterElement = this.locationImage.querySelector(`[data-character-id="${charId}"]`);
    if (characterElement) {
      characterElement.remove();
    }
  }
}
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
    console.log("RoomDisplay constructor called");
    
    this.eventBus = eventBus;
    this.imageLoader = imageLoader;
    this.roomData = roomData;
    this.objectData = objectData;
    
    // DOM elements (to be initialized when setupUI is called)
    this.locationImage = null;
    this.locationName = null;
    
    // Current room state
    this.currentRoom = null;
    this.previousRoom = null;
    this.transitionInProgress = false;
    
    // Subscribe to events
    this.subscribeToEvents();

    // FIX: Initialize UI elements right away
    this.setupUI();
    
    console.log("RoomDisplay initialized");
  }
  
  /**
   * Initialize UI elements
   */
  setupUI() {
    console.log("RoomDisplay.setupUI() called");
    
    this.locationImage = document.getElementById('location-image');
    if (!this.locationImage) {
      console.error("Location image element not found in the DOM");
    } else {
      console.log("Location image element found");
    }
    
    this.locationName = document.getElementById('location-name');
    if (!this.locationName) {
      console.error("Location name element not found in the DOM");
    } else {
      console.log("Location name element found");
    }
    
    console.log("RoomDisplay setup complete");
  }
  
  /**
   * Subscribe to relevant events
   */
  subscribeToEvents() {
    console.log("Setting up RoomDisplay event listeners");
    
    this.eventBus.subscribe(GameEvents.ROOM_CHANGED, (data) => {
      console.log("RoomDisplay received ROOM_CHANGED event:", data);
      this.handleRoomChange(data.previousRoom, data.currentRoom, data.direction);
    });
    
    this.eventBus.subscribe(GameEvents.ROOM_OBJECTS_CHANGED, (data) => {
      console.log("RoomDisplay received ROOM_OBJECTS_CHANGED event");
      this.updateRoomObjects(data.roomId, data.objects);
    });
    
    this.eventBus.subscribe(GameEvents.GAME_INITIALIZED, () => {
      console.log("RoomDisplay received GAME_INITIALIZED event");
      // FIX: We already set up in constructor
      console.log("Ensuring UI is initialized on game start");
      if (!this.locationImage || !this.locationName) {
        this.setupUI();
      }
    });
    
    console.log("RoomDisplay event listeners set up");
  }
  
  /**
   * Handle room change event
   * @param {number} previousRoom - ID of the room being left
   * @param {number} currentRoom - ID of the new room
   * @param {string} direction - Direction of movement
   */
  handleRoomChange(previousRoom, currentRoom, direction) {
    console.log("RoomDisplay.handleRoomChange() called");
    
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
    console.log("RoomDisplay.displayRoom() called for room:", roomId);
    
    if (!this.locationImage || !this.locationName) {
      console.log("Display elements not found, trying to initialize again");
      this.setupUI();
    }
    
    // Get room data
    const roomDesc = this.roomData.roomDescriptions[roomId] || `ROOM ${roomId}`;
    
    // Update location name
    if (this.locationName) {
      this.locationName.textContent = roomDesc;
      console.log("Updated location name:", roomDesc);
    } else {
      console.error("Location name element still not found");
    }
    
    // Apply room image
    if (this.locationImage && this.imageLoader) {
      // Use room ID to determine image name (e.g., "hallway" for room 1)
      const roomImageName = this.getRoomImageName(roomId);
      
      // FIX: Direct style application as fallback
      try {
        this.imageLoader.applyImage(this.locationImage, 'locations', roomImageName);
        console.log("Applied room image using imageLoader:", roomImageName);
      } catch (error) {
        console.error("Failed to apply image with imageLoader:", error);
        // Fallback to direct styling
        this.locationImage.style.backgroundImage = "url('/images/locations/default.jpg')";
        console.log("Applied fallback room image with direct styling");
      }
    } else {
      console.error("Cannot update location image: missing DOM element or imageLoader");
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
    console.log("RoomDisplay.transitionToRoom() called with direction:", direction);
    
    if (!this.locationImage) {
      console.error("Cannot perform transition: location image element not available");
      this.displayRoom(this.currentRoom);
      return;
    }
    
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
        console.log("Room transition completed");
      }, 300);
    }, 300);
  }
  
  /**
   * Update visualization of objects in the room
   * @param {number} roomId - Room ID
   * @param {Array} objects - Array of object IDs in the room
   */
  updateRoomObjects(roomId, objects) {
    console.log("RoomDisplay.updateRoomObjects() called for room:", roomId);
    
    if (roomId !== this.currentRoom) {
      console.log("Ignoring object update for different room");
      return;
    }
    
    // This function could add visual indicators for objects in the room
    // For example, adding icons or highlighted areas to the room image
    
    // For now, we'll simply publish an event indicating room objects are updated
    this.eventBus.publish(GameEvents.UI_REFRESH, {
      component: 'roomObjects',
      roomId: roomId,
      objects: objects
    });
  }
}
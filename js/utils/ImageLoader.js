// js/utils/ImageLoader.js
/**
 * Utility class for preloading and managing game images
 */
export default class ImageLoader {
    constructor() {
      this.images = {
        locations: {},
        characters: {},
        ui: {}
      };
      this.loadedImages = 0;
      this.totalImages = 0;
      this.defaultImages = {
        location: '/images/locations/default.jpg',
        character: '/images/characters/default.jpg',
        ui: '/images/ui/default.png'
      };
    }
  
    /**
     * Preload all game images
     * @param {Object} imageManifest - Object containing paths to all images
     * @return {Promise} Resolves when all images are loaded
     */
    preloadImages(imageManifest) {
      const locationImages = imageManifest.locations || {};
      const characterImages = imageManifest.characters || {};
      const uiImages = imageManifest.ui || {};
      
      this.totalImages = 
        Object.keys(locationImages).length + 
        Object.keys(characterImages).length + 
        Object.keys(uiImages).length;
      
      this.loadedImages = 0;
      
      return new Promise((resolve) => {
        // If no images to load, resolve immediately
        if (this.totalImages === 0) {
          resolve();
          return;
        }
        
        // Helper function to load a category of images
        const loadCategory = (category, images) => {
          Object.entries(images).forEach(([key, path]) => {
            const img = new Image();
            
            img.onload = () => {
              this.images[category][key] = img;
              this.loadedImages++;
              if (this.loadedImages === this.totalImages) {
                resolve();
              }
            };
            
            img.onerror = () => {
              console.warn(`Failed to load image: ${path}`);
              this.loadedImages++;
              // Use default image as fallback
              this.handleMissingImage(category, key);
              if (this.loadedImages === this.totalImages) {
                resolve();
              }
            };
            
            img.src = path;
          });
        };
        
        // Load each category of images
        loadCategory('locations', locationImages);
        loadCategory('characters', characterImages);
        loadCategory('ui', uiImages);
      });
    }
    
    /**
     * Get image URL for a specific type and name
     * @param {string} type - Type of image (location, character, ui)
     * @param {string} name - Name identifier for the image
     * @return {string} URL to the image
     */
    getImageUrl(type, name) {
      if (!this.images[type] || !this.images[type][name]) {
        return this.defaultImages[type] || '';
      }
      return this.images[type][name].src;
    }
    
    /**
     * Handle missing images by using a default placeholder
     * @param {string} category - Category of image
     * @param {string} key - Key identifier for the image
     */
    handleMissingImage(category, key) {
      const defaultImage = new Image();
      defaultImage.src = this.defaultImages[category] || '';
      this.images[category][key] = defaultImage;
    }
    
    /**
     * Get loading status information
     * @return {Object} Status object with loaded and total counts
     */
    getLoadingStatus() {
      return {
        loaded: this.loadedImages,
        total: this.totalImages,
        percentage: this.totalImages > 0 
          ? Math.floor((this.loadedImages / this.totalImages) * 100)
          : 100
      };
    }
    
    /**
     * Apply an image to a DOM element
     * @param {HTMLElement} element - Element to apply image to
     * @param {string} type - Type of image (location, character, ui)
     * @param {string} name - Name identifier for the image
     */
    applyImage(element, type, name) {
      const url = this.getImageUrl(type, name);
      if (element) {
        element.style.backgroundImage = `url('${url}')`;
      }
    }
  }
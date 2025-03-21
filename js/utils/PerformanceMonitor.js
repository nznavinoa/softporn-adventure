/**
 * PerformanceMonitor - Tracks and analyzes game performance
 * Helps identify bottlenecks and optimize performance
 */
import eventBus from '../main.js';
import { GameEvents } from '../core/GameEvents.js';

export default class PerformanceMonitor {
    constructor() {
        // Performance metrics storage
        this.metrics = {
            fps: [],
            eventTiming: {},
            renderTiming: [],
            memoryUsage: []
        };
        
        // Configuration
        this.config = {
            enabled: false,              // Whether monitoring is active
            sampleSize: 60,              // Number of samples to keep
            displayPanel: false,         // Whether to show the performance panel
            logToConsole: false,         // Whether to log to console
            fpsWarningThreshold: 30,     // FPS below this value triggers warning
            timingWarningThreshold: 16,  // Operations taking longer than this (ms) trigger warning
            trackMemory: true,           // Whether to track memory usage
            trackEvents: true            // Whether to track event timing
        };
        
        // Internal state
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.fpsUpdateInterval = null;
        this.memoryCheckInterval = null;
        this.activeTimers = new Map();
        
        // Set up event subscriptions
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Monitor UI updates
        eventBus.subscribe(GameEvents.UI_REFRESH, (data) => {
            this.startTimer('ui-refresh', data.type);
        });
        
        eventBus.subscribe(GameEvents.DISPLAY_UPDATED, () => {
            this.endTimer('ui-refresh');
        });
        
        // Monitor room changes
        eventBus.subscribe(GameEvents.ROOM_CHANGED, () => {
            this.startTimer('room-change');
        });
        
        eventBus.subscribe(GameEvents.ROOM_DISPLAY_UPDATED, () => {
            this.endTimer('room-change');
        });
        
        // Monitor command processing
        eventBus.subscribe(GameEvents.COMMAND_RECEIVED, (command) => {
            this.startTimer('command-processing', command);
        });
        
        eventBus.subscribe(GameEvents.COMMAND_PROCESSED, () => {
            this.endTimer('command-processing');
        });
        
        // Monitor save/load operations
        eventBus.subscribe(GameEvents.GAME_SAVE_REQUESTED, () => {
            this.startTimer('save-game');
        });
        
        eventBus.subscribe(GameEvents.GAME_SAVED, () => {
            this.endTimer('save-game');
        });
        
        eventBus.subscribe(GameEvents.GAME_LOAD_REQUESTED, () => {
            this.startTimer('load-game');
        });
        
        eventBus.subscribe(GameEvents.GAME_LOADED, () => {
            this.endTimer('load-game');
        });
    }
    
    /**
     * Start the performance monitor
     * @param {Object} config - Optional configuration options
     */
    start(config = {}) {
        // Apply config options
        this.config = { ...this.config, ...config };
        this.config.enabled = true;
        
        // Start FPS monitoring
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        
        this.fpsUpdateInterval = setInterval(() => {
            this.updateFPS();
        }, 1000);
        
        // Start memory monitoring if supported and enabled
        if (this.config.trackMemory && performance.memory) {
            this.memoryCheckInterval = setInterval(() => {
                this.checkMemoryUsage();
            }, 2000);
        }
        
        // Create performance display panel if enabled
        if (this.config.displayPanel) {
            this.createDisplayPanel();
        }
        
        // Add frame request callback for FPS calculation
        const measureFPS = () => {
            this.frameCount++;
            if (this.config.enabled) {
                requestAnimationFrame(measureFPS);
            }
        };
        requestAnimationFrame(measureFPS);
        
        console.log('Performance monitoring started');
    }
    
    /**
     * Stop the performance monitor
     */
    stop() {
        this.config.enabled = false;
        
        // Clear intervals
        if (this.fpsUpdateInterval) {
            clearInterval(this.fpsUpdateInterval);
            this.fpsUpdateInterval = null;
        }
        
        if (this.memoryCheckInterval) {
            clearInterval(this.memoryCheckInterval);
            this.memoryCheckInterval = null;
        }
        
        // Remove display panel if present
        if (this.displayPanel) {
            this.displayPanel.remove();
            this.displayPanel = null;
        }
        
        console.log('Performance monitoring stopped');
    }
    
    /**
     * Update FPS calculation
     */
    updateFPS() {
        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        
        // Calculate fps
        const currentFps = Math.round((this.frameCount * 1000) / elapsed);
        
        // Add to metrics
        this.metrics.fps.push(currentFps);
        
        // Keep only the last N samples
        if (this.metrics.fps.length > this.config.sampleSize) {
            this.metrics.fps.shift();
        }
        
        // Log warning if FPS is below threshold
        if (currentFps < this.config.fpsWarningThreshold) {
            console.warn(`Low FPS detected: ${currentFps}`);
        }
        
        // Reset for next update
        this.frameCount = 0;
        this.lastFrameTime = now;
        
        // Update display panel if present
        if (this.displayPanel) {
            this.updateDisplayPanel();
        }
        
        // Log to console if enabled
        if (this.config.logToConsole) {
            console.log(`FPS: ${currentFps}`);
        }
    }
    
    /**
     * Check memory usage if available
     */
    checkMemoryUsage() {
        if (!performance.memory) return;
        
        const memory = {
            timestamp: Date.now(),
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
        
        this.metrics.memoryUsage.push(memory);
        
        // Keep only the last N samples
        if (this.metrics.memoryUsage.length > this.config.sampleSize) {
            this.metrics.memoryUsage.shift();
        }
        
        // Log to console if enabled
        if (this.config.logToConsole) {
            console.log(`Memory usage: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB / ${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`);
        }
    }
    
    /**
     * Start a timer for an operation
     * @param {string} operation - Name of the operation
     * @param {any} details - Optional details about the operation
     */
    startTimer(operation, details = null) {
        if (!this.config.enabled || !this.config.trackEvents) return;
        
        this.activeTimers.set(operation, {
            startTime: performance.now(),
            details
        });
    }
    
    /**
     * End a timer for an operation and record metrics
     * @param {string} operation - Name of the operation
     */
    endTimer(operation) {
        if (!this.config.enabled || !this.config.trackEvents) return;
        
        const timer = this.activeTimers.get(operation);
        if (!timer) return;
        
        const endTime = performance.now();
        const duration = endTime - timer.startTime;
        
        // Initialize metric category if needed
        if (!this.metrics.eventTiming[operation]) {
            this.metrics.eventTiming[operation] = [];
        }
        
        // Record timing
        this.metrics.eventTiming[operation].push({
            timestamp: Date.now(),
            duration,
            details: timer.details
        });
        
        // Keep only the last N samples
        if (this.metrics.eventTiming[operation].length > this.config.sampleSize) {
            this.metrics.eventTiming[operation].shift();
        }
        
        // Log warning if operation took too long
        if (duration > this.config.timingWarningThreshold) {
            console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
            
            // Publish performance warning event
            eventBus.publish(GameEvents.PERFORMANCE_WARNING, {
                operation,
                duration,
                details: timer.details,
                threshold: this.config.timingWarningThreshold
            });
        }
        
        // Remove from active timers
        this.activeTimers.delete(operation);
        
        // Log to console if enabled
        if (this.config.logToConsole) {
            console.log(`${operation}: ${duration.toFixed(2)}ms`);
        }
    }
    
    /**
     * Create a display panel for performance metrics
     */
    createDisplayPanel() {
        // Check if panel already exists
        if (this.displayPanel) return;
        
        // Create panel element
        this.displayPanel = document.createElement('div');
        this.displayPanel.className = 'performance-panel';
        this.displayPanel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            border: 1px solid #0f0;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            min-width: 200px;
        `;
        
        // Add content
        this.displayPanel.innerHTML = `
            <div class="perf-title">Performance Metrics</div>
            <div class="perf-fps">FPS: --</div>
            <div class="perf-memory">Memory: --</div>
            <div class="perf-events">Events: --</div>
        `;
        
        // Add collapse/expand button
        const toggleButton = document.createElement('button');
        toggleButton.textContent = '-';
        toggleButton.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            width: 20px;
            height: 20px;
            background: none;
            border: none;
            color: white;
            cursor: pointer;
        `;
        
        let collapsed = false;
        toggleButton.addEventListener('click', () => {
            collapsed = !collapsed;
            toggleButton.textContent = collapsed ? '+' : '-';
            
            const elements = this.displayPanel.querySelectorAll('div:not(.perf-title)');
            elements.forEach(el => {
                el.style.display = collapsed ? 'none' : 'block';
            });
        });
        
        this.displayPanel.appendChild(toggleButton);
        document.body.appendChild(this.displayPanel);
    }
    
    /**
     * Update the display panel with current metrics
     */
    updateDisplayPanel() {
        if (!this.displayPanel) return;
        
        // Update FPS
        const fpsElement = this.displayPanel.querySelector('.perf-fps');
        if (fpsElement && this.metrics.fps.length > 0) {
            const currentFps = this.metrics.fps[this.metrics.fps.length - 1];
            const avgFps = this.getAverageFPS();
            
            fpsElement.textContent = `FPS: ${currentFps} (Avg: ${avgFps})`;
            fpsElement.style.color = currentFps < this.config.fpsWarningThreshold ? '#f00' : '#0f0';
        }
        
        // Update memory usage
        const memoryElement = this.displayPanel.querySelector('.perf-memory');
        if (memoryElement && this.metrics.memoryUsage.length > 0) {
            const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
            const usedMB = Math.round(latest.usedJSHeapSize / 1024 / 1024);
            const totalMB = Math.round(latest.jsHeapSizeLimit / 1024 / 1024);
            const percentage = Math.round((latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100);
            
            memoryElement.textContent = `Memory: ${usedMB}MB / ${totalMB}MB (${percentage}%)`;
            memoryElement.style.color = percentage > 80 ? '#f00' : '#0f0';
        }
        
        // Update event timing
        const eventsElement = this.displayPanel.querySelector('.perf-events');
        if (eventsElement) {
            let eventText = 'Events: ';
            
            // Get the last timing for each event type
            for (const [operation, timings] of Object.entries(this.metrics.eventTiming)) {
                if (timings.length > 0) {
                    const latest = timings[timings.length - 1];
                    eventText += `${operation}: ${latest.duration.toFixed(1)}ms, `;
                }
            }
            
            // Trim the trailing comma and space
            eventText = eventText.replace(/, $/, '');
            eventsElement.textContent = eventText;
        }
    }
    
    /**
     * Get average FPS
     * @return {number} Average FPS
     */
    getAverageFPS() {
        if (this.metrics.fps.length === 0) return 0;
        
        const sum = this.metrics.fps.reduce((total, fps) => total + fps, 0);
        return Math.round(sum / this.metrics.fps.length);
    }
    
    /**
     * Get average duration for an operation
     * @param {string} operation - Operation name
     * @return {number} Average duration in ms
     */
    getAverageDuration(operation) {
        if (!this.metrics.eventTiming[operation] || this.metrics.eventTiming[operation].length === 0) {
            return 0;
        }
        
        const sum = this.metrics.eventTiming[operation].reduce(
            (total, timing) => total + timing.duration, 0
        );
        return sum / this.metrics.eventTiming[operation].length;
    }
    
    /**
     * Get all metrics
     * @return {Object} All performance metrics
     */
    getAllMetrics() {
        return JSON.parse(JSON.stringify(this.metrics));
    }
    
    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.metrics = {
            fps: [],
            eventTiming: {},
            renderTiming: [],
            memoryUsage: []
        };
    }
    
    /**
     * Get performance report
     * @return {Object} Performance report with averages and warnings
     */
    getPerformanceReport() {
        const report = {
            fps: {
                current: this.metrics.fps.length > 0 ? this.metrics.fps[this.metrics.fps.length - 1] : 0,
                average: this.getAverageFPS(),
                min: Math.min(...this.metrics.fps) || 0,
                max: Math.max(...this.metrics.fps) || 0,
                warning: this.getAverageFPS() < this.config.fpsWarningThreshold
            },
            memory: {},
            events: {},
            warnings: []
        };
        
        // Memory metrics
        if (this.metrics.memoryUsage.length > 0) {
            const latest = this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1];
            report.memory = {
                used: latest.usedJSHeapSize,
                total: latest.jsHeapSizeLimit,
                percentage: (latest.usedJSHeapSize / latest.jsHeapSizeLimit) * 100
            };
            
            // Add warning if memory usage is high
            if (report.memory.percentage > 80) {
                report.warnings.push({
                    type: 'memory',
                    message: `High memory usage: ${Math.round(report.memory.percentage)}%`
                });
            }
        }
        
        // Event timing metrics
        for (const [operation, timings] of Object.entries(this.metrics.eventTiming)) {
            if (timings.length > 0) {
                const durations = timings.map(t => t.duration);
                
                report.events[operation] = {
                    average: durations.reduce((a, b) => a + b, 0) / durations.length,
                    min: Math.min(...durations),
                    max: Math.max(...durations),
                    count: durations.length
                };
                
                // Add warning if average duration is high
                if (report.events[operation].average > this.config.timingWarningThreshold) {
                    report.warnings.push({
                        type: 'event',
                        operation,
                        message: `Slow operation: ${operation} (avg ${report.events[operation].average.toFixed(2)}ms)`
                    });
                }
            }
        }
        
        return report;
    }
}
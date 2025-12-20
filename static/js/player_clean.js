/**
 * Servo TV Player Manager
 * Manages video playback, controls, and sidebar navigation
 */

class VideoPlayerManager {
    constructor() {
        // DOM Elements
        this.playerWrapper = document.getElementById('playerWrapper');
        this.videoPlayer = document.getElementById('videoPlayer');
        this.playerControls = document.getElementById('playerControls');
        this.channelSidebar = document.getElementById('channelSidebar');
        this.channelsList = document.getElementById('channelsList');

        // Control Buttons
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.rewindBtn = document.getElementById('rewindBtn');
        this.forwardBtn = document.getElementById('forwardBtn');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');

        // Progress Bar Elements
        this.progressBar = document.getElementById('progressBar');
        this.progressFill = document.getElementById('progressFill');
        this.progressSlider = document.getElementById('progressSlider');

        // Icons
        this.playIcon = document.getElementById('playIcon');
        this.pauseIcon = document.getElementById('pauseIcon');

        // Channel elements
        this.channelName = document.getElementById('channelName');
        this.channelInfo = document.getElementById('channelInfo');

        // State
        this.isPlaying = true;
        this.isSidebarOpen = false;
        this.controlsTimeout = null;
        this.isDragging = false;
        this.currentChannelIndex = 0;

        // Channel data
        this.channels = [
            { name: 'News 24/7', info: 'News • 1080p', number: 1 },
            { name: 'Sports Network', info: 'Sports • 1080p', number: 2 },
            { name: 'Movie Channel', info: 'Movies • 720p', number: 3 },
            { name: 'Documentary', info: 'Documentary • 1080p', number: 4 },
            { name: 'Music Mix', info: 'Music • 720p', number: 5 },
            { name: 'Comedy Central', info: 'Comedy • 1080p', number: 6 }
        ];

        this.init();
    }

    /**
     * Initialize the player
     */
    init() {
        this.setupEventListeners();
        this.renderChannels();
        this.updatePlayPauseIcon();
        this.loadSettings();
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Video player events
        this.videoPlayer.addEventListener('play', () => this.onPlay());
        this.videoPlayer.addEventListener('pause', () => this.onPause());
        this.videoPlayer.addEventListener('timeupdate', () => this.updateProgress());
        this.videoPlayer.addEventListener('ended', () => this.onVideoEnded());
        this.videoPlayer.addEventListener('fullscreenchange', () => this.onFullscreenChange());

        // Control button events
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.rewindBtn.addEventListener('click', () => this.rewind());
        this.forwardBtn.addEventListener('click', () => this.forward());
        this.volumeBtn.addEventListener('click', () => this.toggleMute());
        this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

        // Progress bar events
        this.progressBar.addEventListener('mousedown', (e) => this.startSeeking(e));
        this.progressBar.addEventListener('touchstart', (e) => this.startSeeking(e));
        document.addEventListener('mousemove', (e) => this.seek(e));
        document.addEventListener('touchmove', (e) => this.seek(e));
        document.addEventListener('mouseup', () => this.stopSeeking());
        document.addEventListener('touchend', () => this.stopSeeking());

        // Player wrapper interactions
        this.playerWrapper.addEventListener('mousemove', () => this.showControls());
        this.playerWrapper.addEventListener('mouseleave', () => this.startControlsHideTimer());
        this.playerWrapper.addEventListener('click', (e) => this.handlePlayerClick(e));
        this.playerWrapper.addEventListener('dblclick', () => this.toggleFullscreen());

        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyboardEvent(e));

        // Channels list event delegation
        this.channelsList.addEventListener('click', (e) => this.handleChannelClick(e));

        // Mobile/Touch events
        document.addEventListener('touchstart', () => this.showControls());
    }

    /**
     * Render channel list
     */
    renderChannels() {
        this.channelsList.innerHTML = '';
        this.channels.forEach((channel, index) => {
            const channelItem = document.createElement('button');
            channelItem.className = `channel-item ${index === this.currentChannelIndex ? 'active' : ''}`;
            channelItem.dataset.index = index;
            channelItem.innerHTML = `
                <span>${channel.name}</span>
                <span class="channel-number">${channel.number}</span>
            `;
            channelItem.addEventListener('focus', () => this.scrollChannelIntoView(index));
            this.channelsList.appendChild(channelItem);
        });
    }

    /**
     * Handle channel selection
     */
    handleChannelClick(e) {
        const channelItem = e.target.closest('.channel-item');
        if (channelItem) {
            const index = parseInt(channelItem.dataset.index);
            this.selectChannel(index);
        }
    }

    /**
     * Select a channel
     */
    selectChannel(index) {
        if (index >= 0 && index < this.channels.length) {
            this.currentChannelIndex = index;
            const channel = this.channels[index];

            // Update UI
            this.channelName.textContent = channel.name;
            this.channelInfo.textContent = channel.info;

            // Update active state
            document.querySelectorAll('.channel-item').forEach((item, i) => {
                item.classList.toggle('active', i === index);
            });

            // Reset video
            this.videoPlayer.currentTime = 0;
            this.videoPlayer.play();
            this.isPlaying = true;

            // Save selection
            localStorage.setItem('selectedChannel', index);
            localStorage.setItem('selectedChannelName', channel.name);

            // Auto-hide sidebar on selection
            setTimeout(() => this.toggleSidebar(), 300);
        }
    }

    /**
     * Scroll channel into view
     */
    scrollChannelIntoView(index) {
        const channelItem = this.channelsList.children[index];
        if (channelItem) {
            channelItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    /**
     * Play/Pause toggle
     */
    togglePlayPause() {
        if (this.isPlaying) {
            this.videoPlayer.pause();
            this.isPlaying = false;
        } else {
            this.videoPlayer.play();
            this.isPlaying = true;
        }
        this.updatePlayPauseIcon();
    }

    /**
     * Video play handler
     */
    onPlay() {
        this.isPlaying = true;
        this.updatePlayPauseIcon();
        this.startControlsHideTimer();
    }

    /**
     * Video pause handler
     */
    onPause() {
        this.isPlaying = false;
        this.updatePlayPauseIcon();
        this.showControls();
    }

    /**
     * Update play/pause icon
     */
    updatePlayPauseIcon() {
        if (this.isPlaying) {
            this.pauseIcon.style.display = 'block';
            this.playIcon.style.display = 'none';
        } else {
            this.pauseIcon.style.display = 'none';
            this.playIcon.style.display = 'block';
        }
    }

    /**
     * Rewind video (10 seconds)
     */
    rewind() {
        this.videoPlayer.currentTime = Math.max(0, this.videoPlayer.currentTime - 10);
        this.showControls();
    }

    /**
     * Forward video (10 seconds)
     */
    forward() {
        this.videoPlayer.currentTime = Math.min(
            this.videoPlayer.duration,
            this.videoPlayer.currentTime + 10
        );
        this.showControls();
    }

    /**
     * Toggle mute
     */
    toggleMute() {
        this.videoPlayer.muted = !this.videoPlayer.muted;
        this.volumeBtn.classList.toggle('muted', this.videoPlayer.muted);
        localStorage.setItem('playerMuted', this.videoPlayer.muted);
        this.showControls();
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (this.playerWrapper.requestFullscreen) {
                this.playerWrapper.requestFullscreen();
            } else if (this.playerWrapper.webkitRequestFullscreen) {
                this.playerWrapper.webkitRequestFullscreen();
            } else if (this.playerWrapper.mozRequestFullScreen) {
                this.playerWrapper.mozRequestFullScreen();
            } else if (this.playerWrapper.msRequestFullscreen) {
                this.playerWrapper.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    /**
     * Handle fullscreen change
     */
    onFullscreenChange() {
        this.showControls();
    }

    /**
     * Update progress bar
     */
    updateProgress() {
        if (!this.isDragging && this.videoPlayer.duration) {
            const percent = (this.videoPlayer.currentTime / this.videoPlayer.duration) * 100;
            this.progressFill.style.width = percent + '%';
            this.progressSlider.style.left = percent + '%';
        }
    }

    /**
     * Start seeking
     */
    startSeeking(e) {
        this.isDragging = true;
        this.seek(e);
    }

    /**
     * Seek to position
     */
    seek(e) {
        if (!this.isDragging || !this.videoPlayer.duration) return;

        const rect = this.progressBar.getBoundingClientRect();
        let x;

        if (e.touches) {
            x = e.touches[0].clientX - rect.left;
        } else {
            x = e.clientX - rect.left;
        }

        const percent = Math.max(0, Math.min(1, x / rect.width));
        const time = percent * this.videoPlayer.duration;

        this.videoPlayer.currentTime = time;
        this.progressFill.style.width = (percent * 100) + '%';
        this.progressSlider.style.left = (percent * 100) + '%';
    }

    /**
     * Stop seeking
     */
    stopSeeking() {
        this.isDragging = false;
    }

    /**
     * Show controls
     */
    showControls() {
        this.playerControls.classList.add('visible');
        this.startControlsHideTimer();
    }

    /**
     * Start timer to hide controls
     */
    startControlsHideTimer() {
        if (this.controlsTimeout) {
            clearTimeout(this.controlsTimeout);
        }

        if (this.isPlaying && !this.isDragging) {
            this.controlsTimeout = setTimeout(() => {
                if (this.isPlaying) {
                    this.playerControls.classList.remove('visible');
                }
            }, 3000);
        }
    }

    /**
     * Handle player click
     */
    handlePlayerClick(e) {
        // Prevent click handling if clicking on controls
        if (e.target.closest('.player-controls') || 
            e.target.closest('.channel-sidebar') ||
            e.target.closest('.control-btn')) {
            return;
        }
        
        // Click to play/pause
        this.togglePlayPause();
    }

    /**
     * Handle video ended
     */
    onVideoEnded() {
        // Restart video when ended
        this.videoPlayer.currentTime = 0;
        this.videoPlayer.play();
    }

    /**
     * Toggle sidebar
     */
    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        this.channelSidebar.classList.toggle('active', this.isSidebarOpen);
        
        if (this.isSidebarOpen) {
            // Focus first channel item
            setTimeout(() => {
                const firstChannel = this.channelsList.querySelector('.channel-item');
                if (firstChannel) firstChannel.focus();
            }, 100);
        }
    }

    /**
     * Handle keyboard events (TV remote compatibility)
     */
    handleKeyboardEvent(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'Up':
                e.preventDefault();
                if (!this.isSidebarOpen) {
                    this.toggleSidebar();
                } else {
                    this.focusPreviousChannel();
                }
                break;

            case 'ArrowDown':
            case 'Down':
                e.preventDefault();
                if (this.isSidebarOpen) {
                    this.focusNextChannel();
                }
                break;

            case 'ArrowLeft':
            case 'Left':
                e.preventDefault();
                this.rewind();
                break;

            case 'ArrowRight':
            case 'Right':
                e.preventDefault();
                this.forward();
                break;

            case 'Enter':
            case 'o':
            case 'O':
                e.preventDefault();
                if (this.isSidebarOpen) {
                    const activeChannel = this.channelsList.querySelector('.channel-item:focus');
                    if (activeChannel) {
                        const index = parseInt(activeChannel.dataset.index);
                        this.selectChannel(index);
                    }
                } else {
                    this.togglePlayPause();
                }
                break;

            case 'Escape':
            case 'Backspace':
                e.preventDefault();
                if (this.isSidebarOpen) {
                    this.toggleSidebar();
                }
                break;

            case ' ':
                e.preventDefault();
                this.togglePlayPause();
                break;

            case 'f':
            case 'F':
                e.preventDefault();
                this.toggleFullscreen();
                break;

            case 'm':
            case 'M':
                e.preventDefault();
                this.toggleMute();
                break;

            default:
                // Numeric keys for channel selection
                if (e.key >= '1' && e.key <= '6') {
                    e.preventDefault();
                    const channelIndex = parseInt(e.key) - 1;
                    this.selectChannel(channelIndex);
                }
                break;
        }
    }

    /**
     * Focus next channel in sidebar
     */
    focusNextChannel() {
        const channels = this.channelsList.querySelectorAll('.channel-item');
        let nextIndex = Array.from(channels).findIndex(el => el === document.activeElement) + 1;
        if (nextIndex < channels.length) {
            channels[nextIndex].focus();
        }
    }

    /**
     * Focus previous channel in sidebar
     */
    focusPreviousChannel() {
        const channels = this.channelsList.querySelectorAll('.channel-item');
        let prevIndex = Array.from(channels).findIndex(el => el === document.activeElement) - 1;
        if (prevIndex >= 0) {
            channels[prevIndex].focus();
        } else {
            this.toggleSidebar();
        }
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        // Load muted state
        const isMuted = localStorage.getItem('playerMuted') === 'true';
        this.videoPlayer.muted = isMuted;

        // Load selected channel
        const selectedChannel = localStorage.getItem('selectedChannel');
        if (selectedChannel) {
            this.selectChannel(parseInt(selectedChannel));
        }

        // Load playback position
        const lastPosition = localStorage.getItem('playerPosition');
        if (lastPosition && parseFloat(lastPosition) > 0) {
            this.videoPlayer.currentTime = parseFloat(lastPosition);
        }
    }

    /**
     * Save current playback position
     */
    savePlaybackPosition() {
        localStorage.setItem('playerPosition', this.videoPlayer.currentTime);
    }
}

// Initialize player when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Store instance globally for access
    window.videoPlayerInstance = new VideoPlayerManager();

    // Save playback position periodically
    setInterval(() => {
        const player = window.videoPlayerInstance;
        if (player) {
            player.savePlaybackPosition();
        }
    }, 5000);
});

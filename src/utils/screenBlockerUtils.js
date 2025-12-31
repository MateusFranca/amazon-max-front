class ScreenBlocker {
  constructor() {
    this.blockerElement = null;
    this.contentWrapperElement = null;
    this.isBlocking = false;
    this.lastAttemptTime = 0;
    this.attemptCount = 0;
    this.checkInterval = null;
    this.recentAttempt = false;
    this.isMobile = this.checkIfMobile();

    this.boundBlockScreenCapture = this.blockScreenCapture.bind(this);
    this.boundBlockContextMenu = this.blockContextMenu.bind(this);
    this.boundVisibilityChange = this.handleVisibilityChange.bind(this);
    this.boundOrientationChange = this.handleOrientationChange.bind(this);
    this.boundTouchStart = this.handleTouchStart.bind(this);
    this.boundTouchEnd = this.handleTouchEnd.bind(this);
  }

  checkIfMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  createOverlay() {
    this.blockerElement = document.createElement("div");
    this.blockerElement.id = "screen-blocker";
    this.blockerElement.classList.add("hidden");
    this.blockerElement.style.position = "fixed";
    this.blockerElement.style.top = "0";
    this.blockerElement.style.left = "0";
    this.blockerElement.style.width = "100%";
    this.blockerElement.style.height = "100%";
    this.blockerElement.style.backgroundColor = "#000000";
    this.blockerElement.style.zIndex = "9999";

    if (this.isMobile) {
      this.blockerElement.style.width = "100vw";
      this.blockerElement.style.height = "100vh";
      this.blockerElement.style.touchAction = "none";
    }

    this.contentWrapperElement = document.getElementById("content-wrapper");

    document.body.appendChild(this.blockerElement);
  }

  showBlocker() {
    if (!this.blockerElement) {
      this.createOverlay();
    }

    const now = Date.now();
    if (now - this.lastAttemptTime < 5000) {
      this.attemptCount++;
    } else {
      this.attemptCount = 1;
    }
    this.lastAttemptTime = now;
    this.recentAttempt = true;

    const blockTime = Math.max(2000, Math.min(10000, 2000 + (this.attemptCount * 500)));

    this.isBlocking = true;
    this.blockerElement.classList.remove("hidden");

    setTimeout(() => {
      this.blockerElement.classList.add("hidden");
      this.isBlocking = false;

      setTimeout(() => {
        this.recentAttempt = false;
      }, 5000);
    }, blockTime);
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      this.showBlocker();
    }
  }

  handleOrientationChange() {
    if (this.isMobile && !this.isBlocking) {
      this.showBlocker();
    }
  }

  handleTouchStart(event) {
    if (event.touches.length >= 3) {
      event.preventDefault();
      this.showBlocker();
    }
  }

  handleTouchEnd(event) {
    if (this.recentAttempt && !this.isBlocking) {
      this.showBlocker();
    }
  }

  blockScreenCapture(event) {
    if (
      event.key === "PrintScreen" ||
      (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "s") ||
      (event.metaKey && event.shiftKey && event.key.toLowerCase() === "s") ||
      (event.shiftKey && event.key === "S" && event.metaKey) ||
      (event.shiftKey && event.key === "S" && event.ctrlKey) ||
      (event.altKey && event.key === "PrintScreen")
    ) {
      event.preventDefault();
      event.stopPropagation();

      if (!this.isBlocking || this.recentAttempt) {
        this.showBlocker();
      }
    }
  }

  blockContextMenu(event) {
    event.preventDefault();
  }

  startPeriodicCheck() {
    this.checkInterval = setInterval(() => {
      if (this.recentAttempt) {
        if (!this.isBlocking && Date.now() - this.lastAttemptTime < 10000) {
          this.showBlocker();
        }
      }

      if (navigator.clipboard && typeof navigator.clipboard.read === 'function') {
        navigator.clipboard.read().then(items => {
          for (let item of items) {
            if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
              this.showBlocker();
              break;
            }
          }
        }).catch(() => {
        });
      }
    }, 1000);
  }

  init() {
    document.addEventListener("keydown", this.boundBlockScreenCapture, true);
    document.addEventListener("keyup", this.boundBlockScreenCapture, true);
    document.addEventListener("contextmenu", this.boundBlockContextMenu, true);
    document.addEventListener("visibilitychange", this.boundVisibilityChange, true);

    if (this.isMobile) {
      window.addEventListener("orientationchange", this.boundOrientationChange, true);
      document.addEventListener("touchstart", this.boundTouchStart, true);
      document.addEventListener("touchend", this.boundTouchEnd, true);
    }

    const style = document.createElement('style');
    style.id = 'screenshot-prevention-styles';
    style.textContent = `
      body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }

      img, video {
        pointer-events: none;
        -webkit-touch-callout: none;
      }
    `;
    document.head.appendChild(style);

    this.startPeriodicCheck();
  }

  cleanup() {
    document.removeEventListener("keydown", this.boundBlockScreenCapture, true);
    document.removeEventListener("keyup", this.boundBlockScreenCapture, true);
    document.removeEventListener("contextmenu", this.boundBlockContextMenu, true);
    document.removeEventListener("visibilitychange", this.boundVisibilityChange, true);

    if (this.isMobile) {
      window.removeEventListener("orientationchange", this.boundOrientationChange, true);
      document.removeEventListener("touchstart", this.boundTouchStart, true);
      document.removeEventListener("touchend", this.boundTouchEnd, true);
    }

    const style = document.getElementById('screenshot-prevention-styles');
    if (style) {
      style.remove();
    }

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }
}

export default new ScreenBlocker();

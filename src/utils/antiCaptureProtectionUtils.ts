export function enableAntiCaptureProtection() {
  const keysToBlock = [
    'PrintScreen', 'Snapshot', 'F13', 'F12',
    'Control+P', 'Ctrl+P',
    'Control+Shift+S', 'Ctrl+Shift+S',
    'Meta+Shift+3', 'Meta+Shift+4',
    'Cmd+Shift+3', 'Cmd+Shift+4',
  ];

  let overlay: HTMLElement | null = null;

  function toggleBlur(show: boolean) {
    if (show) {
      if (overlay) return;

      overlay = document.createElement('div');
      overlay.id = 'anti-capture-overlay';
      Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        pointerEvents: 'none',
      });
      overlay.textContent = 'Captura de tela detectada e bloqueada';
      document.body.appendChild(overlay);

      toggleCssProtection(true);

      setTimeout(() => {
        toggleBlur(false);
        toggleCssProtection(false);
      }, 1000);
    } else {
      overlay?.remove();
      overlay = null;
    }
  }

  function toggleCssProtection(enable: boolean) {
    document.body.classList.toggle('anti-capture', enable);
  }

  function detectCaptureAttempt(e: KeyboardEvent) {
    const printKeys = ['PrintScreen', 'Snapshot', 'F13'];
    const isPrintKey = printKeys.includes(e.key);
    const isModifiedPrint = e.altKey || e.ctrlKey || e.metaKey;

    if (isPrintKey || isModifiedPrint) {
      e.preventDefault();
      toggleBlur(true);
    }
  }

  window.addEventListener('keydown', (e) => {
    const keyCombo = [
      e.metaKey ? 'Meta' : '',
      e.ctrlKey ? 'Control' : '',
      e.shiftKey ? 'Shift' : '',
      e.key,
    ].filter(Boolean).join('+');

    if (keysToBlock.includes(keyCombo) || keysToBlock.includes(e.key)) {
      e.preventDefault();
      toggleBlur(true);
    }

    detectCaptureAttempt(e);
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen') {
      navigator.clipboard.writeText('');
      toggleBlur(true);
    }
  });

  window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    toggleBlur(true);
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      toggleBlur(true);
    }
  });

  const devToolsChecker = setInterval(() => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    if (widthThreshold || heightThreshold) {
      toggleBlur(true);
    }
  }, 1000);

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      toggleBlur(true);
    }
  });

  window.addEventListener('beforeunload', () => {
    clearInterval(devToolsChecker);
  });

  const style = document.createElement('style');
  style.innerHTML = `
    body.anti-capture * {
      -webkit-user-select: none !important;
      user-select: none !important;
      pointer-events: none !important;
    }

    #anti-capture-overlay {
      touch-action: none !important;
    }
  `;
  document.head.appendChild(style);

  function isMobileDevice() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  function requestFullscreen() {
    const el = document.documentElement;
    const request = el.requestFullscreen ||
                    (el as any).webkitRequestFullscreen ||
                    (el as any).msRequestFullscreen;
    if (request) request.call(el);
  }

  function preventGestureScreenshots() {
    document.addEventListener('touchstart', (e: TouchEvent) => {
      if (e.touches.length >= 3) {
        e.preventDefault();
        toggleBlur(true);
      }
    }, { passive: false });

    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
      toggleBlur(true);
    });
  }

  function enableMobileAntiCapture() {
    if (!isMobileDevice()) return;

    requestFullscreen();
    preventGestureScreenshots();

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        toggleBlur(true);
      }
    });

    document.addEventListener('resume', () => toggleBlur(false));
    document.addEventListener('pause', () => toggleBlur(true));
  }

  enableMobileAntiCapture();
}

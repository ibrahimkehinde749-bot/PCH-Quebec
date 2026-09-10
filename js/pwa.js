// Register service worker and handle beforeinstallprompt
let deferredPrompt;
let lastFocusedElement = null;
const addBtnId = 'downloadAppBtn';
const installPanelId = 'installInstructionsPanel';

function isPWAInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || window.matchMedia('(display-mode: minimal-ui)').matches
    || window.navigator.standalone === true;
}

function hideInstallButton() {
  const btn = document.getElementById(addBtnId);
  if (!btn) return;
  btn.style.display = 'none';
  btn.disabled = true;
}

function showInstallButton() {
  const btn = document.getElementById(addBtnId);
  if (!btn) return;
  btn.style.display = 'inline-flex';
  btn.disabled = false;
}

function updateInstallButtonState(btn, supported) {
  if (!btn) return;

  if (isPWAInstalled()) {
    btn.textContent = 'Application installée';
    btn.disabled = true;
    btn.setAttribute('aria-label', 'Application installée');
    btn.classList.remove('pwa-install-available');
    return;
  }

  btn.disabled = false;
  btn.textContent = supported ? "Installer l'application PCH+" : "Télécharger l'application PCH+";
  btn.setAttribute('aria-label', supported ? "Installer l'application PCH+" : "Télécharger l'application PCH+");
  btn.classList.toggle('pwa-install-available', supported);
}

function updateInstallUI() {
  if (isPWAInstalled()) {
    hideInstallInstructionsPanel();
    hideInstallButton();
    return;
  }

  const btn = document.getElementById(addBtnId);
  if (btn) {
    showInstallButton();
    updateInstallButtonState(btn, Boolean(deferredPrompt));
  }
}

function setupPWAInstallButton() {
  const btn = document.getElementById(addBtnId);
  if (!btn) return;

  if (isPWAInstalled()) {
    hideInstallButton();
    return;
  }

  btn.style.display = 'inline-flex';
  updateInstallButtonState(btn, Boolean(deferredPrompt));

  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        deferredPrompt = null;
        updateInstallUI();
      } else {
        console.log('User dismissed the install prompt');
        deferredPrompt = null;
        updateInstallUI();
      }
      return;
    }

    showInstallFallback(btn);
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  updateInstallUI();
});

window.addEventListener('appinstalled', () => {
  console.log('PWA was installed.');
  updateInstallUI();
  hideInstallInstructionsPanel();
});

function getInstallInstructionsPanel() {
  let panel = document.getElementById(installPanelId);
  if (panel) return panel;

  panel = document.createElement('div');
  panel.id = installPanelId;
  panel.className = 'install-instructions-panel hidden';
  panel.setAttribute('aria-live', 'polite');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-hidden', 'true');
  panel.setAttribute('aria-label', "Panneau des instructions d'installation, fermé");
  panel.setAttribute('aria-labelledby', 'installInstructionsHeading');
  panel.innerHTML = '<h2 id="installInstructionsHeading">Instructions d\'installation <span class="sr-only">(aide pour installer l\'application)</span></h2><button type="button" class="install-instructions-close" tabindex="0" aria-label="Fermer les instructions d\'installation">&times;</button><p id="installInstructionsText"></p>';
  document.body.appendChild(panel);
  panel.querySelector('.install-instructions-close').addEventListener('click', () => hideInstallInstructionsPanel());
  return panel;
}

function showInstallInstructionsPanel(message) {
  if (isPWAInstalled()) return;

  const panel = getInstallInstructionsPanel();
  const textEl = panel.querySelector('#installInstructionsText');
  const closeButton = panel.querySelector('.install-instructions-close');
  if (textEl) {
    textEl.textContent = message;
  }
  lastFocusedElement = document.activeElement;
  panel.classList.remove('hidden');
  panel.setAttribute('aria-hidden', 'false');
  panel.setAttribute('aria-label', "Panneau des instructions d'installation, ouvert");
  if (closeButton) {
    closeButton.focus();
  }
}

function hideInstallInstructionsPanel() {
  const panel = document.getElementById(installPanelId);
  if (panel) {
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('aria-label', "Panneau des instructions d'installation, fermé");
  }

  const btn = document.getElementById(addBtnId);
  if (btn) {
    updateInstallButtonState(btn, Boolean(deferredPrompt));
  }

  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus({ preventScroll: true });
    lastFocusedElement = null;
  }
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.key === 'Esc') {
    hideInstallInstructionsPanel();
  }
  trapFocusInPanel(e);
});

function trapFocusInPanel(e) {
  if (e.key !== 'Tab') return;
  const panel = document.getElementById(installPanelId);
  if (!panel || panel.classList.contains('hidden')) return;

  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  const focusableElements = Array.from(panel.querySelectorAll(focusableSelectors)).filter((el) => {
    return !el.hasAttribute('disabled') && el.tabIndex !== -1;
  });

  if (focusableElements.length === 0) return;

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];
  const active = document.activeElement;

  if (e.shiftKey) {
    if (active === first || active === panel) {
      last.focus();
      e.preventDefault();
    }
  } else {
    if (active === last) {
      first.focus();
      e.preventDefault();
    }
  }
}

function showInstallFallback(btn) {
  if (isPWAInstalled()) return;

  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua) && /safari/.test(ua);
  const isChromeAndroid = /android/.test(ua) && /chrome/.test(ua);
  const isFileProtocol = window.location.protocol === 'file:';
  const isHttpProtocol = window.location.protocol === 'http:';

  let message = '';
  if (isFileProtocol || (isHttpProtocol && !window.isSecureContext)) {
    message = "Les invites d'installation automatique nécessitent HTTPS ou localhost. Déployez le site sur Netlify et consultez-le en HTTPS pour activer l'installation dans le navigateur.";
  } else if (isIOS) {
    message = 'Pour installer sur Safari iOS: touchez le bouton Partager, puis choisissez « Ajouter à l’écran d’accueil ».';
  } else if (isChromeAndroid) {
    message = 'Si Chrome n’affiche pas d’invite d’installation, ouvrez le menu du navigateur et choisissez « Installer l’application » ou « Ajouter à l’écran d’accueil ». '; 
  } else {
    message = 'Ce navigateur ne prend pas en charge les invites d’installation automatique. Utilisez le menu du navigateur pour ajouter ce site à votre écran d’accueil ou l’installer comme application.';
  }

  if (btn) {
    btn.classList.remove('pwa-install-available');
    updateInstallButtonState(btn, false);
  }

  showInstallInstructionsPanel(message);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).then((reg) => {
      console.log('Service worker registered.', reg);
      return navigator.serviceWorker.ready;
    }).then((registration) => {
      console.log('Service worker ready.', registration);
    }).catch((err) => console.warn('Service worker registration failed:', err));
  });
}

function handleDisplayModeChange(event) {
  if (event.matches) {
    updateInstallUI();
  }
}

function addDisplayModeChangeListener() {
  const mql = window.matchMedia('(display-mode: standalone)');
  if (!mql) return;

  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', handleDisplayModeChange);
  } else if (typeof mql.addListener === 'function') {
    mql.addListener(handleDisplayModeChange);
  }
}

function initPWAInstall() {
  hideInstallInstructionsPanel();
  setupPWAInstallButton();
  addDisplayModeChangeListener();
  updateInstallUI();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWAInstall);
} else {
  initPWAInstall();
}

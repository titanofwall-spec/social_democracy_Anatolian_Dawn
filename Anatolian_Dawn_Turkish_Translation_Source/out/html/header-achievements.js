/* Native achievements overlay: displays the compiled game's own achievement page
   without navigating the player away from their current scene. */
(function (root) {
  'use strict';
  let returnFocus = null;

  function hide() {
    const overlay = document.getElementById('ad-achievements-overlay');
    if (overlay) overlay.style.display = 'none';
    if (returnFocus && returnFocus.isConnected) returnFocus.focus();
  }

  function show(event) {
    if (event && event.preventDefault) event.preventDefault();
    const ui = root.dendryUI;
    const scene = ui && ui.game && ui.game.scenes && ui.game.scenes['game_over.achievements'];
    const engine = ui && ui.dendryEngine;
    if (!scene || !engine || !ui.contentToHTML) {
      root.alert('Achievements are unavailable at this moment.');
      return;
    }
    returnFocus = document.activeElement;
    let overlay = document.getElementById('ad-achievements-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'ad-achievements-overlay';
      overlay.className = 'overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Achievements');

      const panel = document.createElement('section');
      panel.className = 'game-window ad-achievements-window';
      const controls = document.createElement('div');
      controls.className = 'ad-achievements-controls';
      const title = document.createElement('h2');
      title.textContent = 'Achievements';
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'tab_button';
      close.textContent = 'Close';
      close.addEventListener('click', hide);
      controls.append(title, close);
      const content = document.createElement('div');
      content.id = 'ad-achievements-content';
      panel.append(controls, content);
      overlay.appendChild(panel);
      overlay.addEventListener('click', (e) => { if (e.target === overlay) hide(); });
      document.body.appendChild(overlay);
    }

    // Render the existing Dendry content, never call goToScene here: the active
    // scene and save state must be preserved when checking achievements.
    let rendered;
    try {
      rendered = ui.contentToHTML.convert(engine._makeDisplayContent(scene.content, true));
    } catch (error) {
      root.alert('Could not display achievements: ' + error.message);
      return;
    }
    document.getElementById('ad-achievements-content').innerHTML = rendered;
    overlay.style.display = 'block';
    overlay.querySelector('button').focus();
  }

  document.addEventListener('keydown', function (event) {
    const overlay = document.getElementById('ad-achievements-overlay');
    if (event.key === 'Escape' && overlay && overlay.style.display === 'block') hide();
  });

  root.showAchievementsPanel = show;
  root.hideAchievementsPanel = hide;
})(typeof globalThis !== 'undefined' ? globalThis : window);

// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  window.i18n = new I18n();
  // Fetch the generated manifest, then mount the switcher. Runs in parallel
  // with the main translation load so the game doesn't wait on it.
  window.i18n.loadManifest(function () {
    window.i18n.mountSwitcher(document.getElementById("language-switcher"));
  });
  window.i18n.load(function () {
    new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
  });
});

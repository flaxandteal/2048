// Wait till the browser is ready to render the game (avoids glitches)
window.requestAnimationFrame(function () {
  window.i18n = new I18n();
  window.i18n.load(function () {
    new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
  });
});

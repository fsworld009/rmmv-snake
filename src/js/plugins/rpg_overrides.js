
/* eslint-disable spaced-comment */
/*:
 * @plugindesc Built-in RPG function overrides
 * @author fsworld009
 *
 * @help (No help).
 *
 *
 */
/* eslint-enable spaced-comment */

const alias = {
  'Scene_Map.prototype.updateScene': Scene_Map.prototype.updateScene,
  'Scene_Map.prototype.onMapLoaded': Scene_Map.prototype.onMapLoaded,
  'Scene_Title.prototype.create': Scene_Title.prototype.create,
};

/* eslint-disable func-names */
Scene_Map.prototype.updateScene = function () {
  alias['Scene_Map.prototype.updateScene'].call(this);
  $snakeGame.update();
};

Scene_Map.prototype.onMapLoaded = function () {
  alias['Scene_Map.prototype.onMapLoaded'].call(this);
  util.init();
  $snakeGame = new SnakeGame();
  $snakeGame.initGame();
};

// disable mouse / touch input
TouchInput.update = function () {};

Window_TitleCommand.prototype.makeCommandList = function () {
  this.addCommand(TextManager.newGame, 'newGame');
};

Window_TitleCommand.prototype.windowWidth = function () {
  return 400;
};

Scene_Title.prototype.create = function () {
  alias['Scene_Title.prototype.create'].call(this);
  const windowHelp = new Window_Help(5);
  Object.assign(windowHelp, {
    x: 8, y: 180, width: 800, height: 220,
  });
  windowHelp.setText('\\C[1]GAME RULE:\n'
                    + '\\C[0]Grab as many people as possible!\n'
                    + '\\C[1]CONTROL:\n'
                    + '\\C[0]↑↓←→: Change Direction\n'
                    + 'Space Key: Start Game / Confirm Choice');
  this.addWindow(windowHelp);
};

Scene_Title.prototype.drawGameTitle = function () {
  /* eslint-disable */
  // move title up, no way to override parameters so copy all from the original
  var x = 20;
  var y = 96;
  var maxWidth = Graphics.width - x * 2;
  var text = $dataSystem.gameTitle;
  this._gameTitleSprite.bitmap.outlineColor = 'black';
  this._gameTitleSprite.bitmap.outlineWidth = 8;
  this._gameTitleSprite.bitmap.fontSize = 72;
  this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, 48, 'center');
  /* eslint-enable */
};

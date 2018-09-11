/* eslint-disable spaced-comment, no-unused-vars */
/*:
* @plugindesc Snake Game Core
* @author fsworld009
*
* @help (No help).
*
*
*/
/* eslint-enable spaced-comment */

class SnakeGame {
  constructor() {
    this.state = C.GAME_STATE.CREATED;
    this.helperEventsData = {
      main: util.findEventDataByName(C.HELPER_EVENTS.MAIN),
      gun: util.findEventDataByName(C.HELPER_EVENTS.GUN),
      tail: util.findEventDataByName(C.HELPER_EVENTS.TAIL),
      obstacle: util.findEventDataByName(C.HELPER_EVENTS.OBSTACLE),
      cleanEffect: util.findEventDataByName(C.HELPER_EVENTS.CLEAN),
    };
  }

  initGame() {
    this.nextDirectionKey = null;
    this.score = 0;

    // clear created objects
    util.removeAllEvents();

    // remove hazard tiles
    const list = [];
    for (let i = 0; i < C.WIDTH * C.HEIGHT; i += 1) {
      list.push({ offset: i, id: C.DEFAULT_TILE_ID });
    }
    util.changeTiles(list);

    // reset player to center
    $gamePlayer.setPosition(
      parseInt(C.WIDTH / 2, 10),
      parseInt(C.HEIGHT / 2, 10),
    );
    $gamePlayer.setDirection(C.DOWN);
    util.randomizeEventImage($gamePlayer);

    this.tails = [];
    this.moveHistory = [];
    this.eventIdOffset = this.constructor.eventIdOffset;
    this.newTail = false;

    this.state = C.GAME_STATE.INIT;
    $gamePlayer._moveSpeed = 4;

    // switch main event, gun event back to init state
    let id = [util.mapId, this.helperEventsData.main.id, 'B'];
    $gameSelfSwitches.setValue(id, false);
    id = [util.mapId, this.helperEventsData.main.id, 'A'];
    $gameSelfSwitches.setValue(id, false);
    id = [util.mapId, this.helperEventsData.gun.id, 'A'];
    $gameSelfSwitches.setValue(id, false);
  }

  generateNextObjects() {
    const { score } = this;
    let event = util.copyEvent(
      this.helperEventsData.tail,
      util.getRandomLocation(),
    );
    util.randomizeEventImage(event);
    if (score > 2) {
      if (score % 3 === 0) {
        util.playSe(C.SE.NEW_OBSTACLE);
        event = util.copyEvent(
          this.helperEventsData.obstacle,
          util.getRandomLocation(),
        );
        util.randomizeEventImage(event, true);
      }
    }

    if (score >= 5 && score % 5 === 0) {
      // change a tile to hazard tile on a random location
      const { x, y } = util.getRandomLocation();
      const id = C.HAZARD_TILE_IDS[util.rand(3)];
      util.playSe(C.SE.NEW_HAZARD);
      util.changeTiles([{ x, y, id }]);
    }
  }

  startGame() {
    this.generateNextObjects();
    this.state = C.GAME_STATE.RUN;
  }

  getUserInput() {
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (Input.isTriggered(key)) {
        this.nextDirectionKey = key;
      }
    }
  }

  moveTails() {
    // record n+1 movements for tails to copy head movement
    this.moveHistory.unshift($gamePlayer.direction());
    if (this.moveHistory.length > this.tails.length + 1) {
      this.moveHistory.pop();
    }
    for (let i = 0; i < this.tails.length; i += 1) {
      const event = this.tails[i];
      if (!event.isMoving() && this.moveHistory[i + 1]) {
        event.moveStraight(this.moveHistory[i + 1]);
      }
    }
  }

  speedUp() {
    const { score } = this;
    if (score >= 4 && score % 4 === 0 && $gamePlayer._moveSpeed < 6) {
      [$gamePlayer].concat(this.tails).forEach((event) => {
        $gamePlayer.requestAnimation(1);
        event._moveSpeed += 0.5; // eslint-disable-line no-param-reassign
      });
    }
  }

  update() {
    if (this.state !== C.GAME_STATE.RUN) {
      return;
    }

    this.getUserInput();
    if (!SceneManager.isSceneChanging()) {
      if (!$gamePlayer.isMoving()) {
        const prevDirection = $gamePlayer.direction();
        if (this.nextDirectionKey) {
          $gamePlayer.setDirection(movements[this.nextDirectionKey]);
        }
        let x;
        let y;
        const direction = $gamePlayer.direction();
        switch (direction) {
          case C.UP:
            x = $gamePlayer._realX;
            y = $gamePlayer._realY - 1;
            break;
          case C.LEFT:
            x = $gamePlayer._realX - 1;
            y = $gamePlayer._realY;
            break;
          case C.DOWN:
            x = $gamePlayer._realX;
            y = $gamePlayer._realY + 1;
            break;
          case C.RIGHT:
            x = $gamePlayer._realX + 1;
            y = $gamePlayer._realY;
            break;
          default:
        }

        // if hit boundary, process game over
        if (!$gameMap.isValid(x, y)) {
          this.gameover();
          return;
        }
        // if has tail and turn 180 degree
        if (this.tails.length > 0 && (
          (direction === C.LEFT && prevDirection === C.RIGHT)
          || (direction === C.RIGHT && prevDirection === C.LEFT)
          || (direction === C.UP && prevDirection === C.DOWN)
          || (direction === C.DOWN && prevDirection === C.UP))
        ) {
          this.gameover();
          return;
        }
        // if stand on hazard tiles
        if ($gameMap.terrainTag($gamePlayer._realX, $gamePlayer._realY)) {
          this.gameover();
          return;
        }
        $gamePlayer.moveForward();
        this.moveTails();
      }
    }
  }

  processGameOver() {
    // stop current movement
    [$gamePlayer].concat(this.tails).forEach((event) => {
      event.setPosition(event._realX, event._realY);
    });

    // set player image to Damage
    const name = $gamePlayer._characterName;
    const index = $gamePlayer._characterIndex;

    const offsetMap = { Actor1: 0, Actor2: 2, Actor3: 4 };
    const directionMap = {
      /* eslint-disable object-property-newline */
      0: C.DOWN, 1: C.LEFT, 2: C.RIGHT, 3: C.UP,
      4: C.DOWN, 5: C.LEFT, 6: C.RIGHT, 7: C.UP,
      /* eslint-enable */
    };
    let offset = offsetMap[name];
    if (index > 3) {
      offset += 1;
    }

    $gamePlayer.setImage(C.IMAGE_NAMES.GAMEOVER, offset);
    $gamePlayer.setDirection(directionMap[index]);
    this.state = C.GAME_STATE.END;

    // move score to RPG variables\
    let isNewScore = false;
    if (this.score > highScore) {
      highScore = this.score;
      isNewScore = true;
    }
    $gameVariables.setValue(1, this.score);
    $gameVariables.setValue(2, highScore);
    $gameVariables.setValue(3, isNewScore ? 5 : 0);

    // enable game over menu
    const id = [util.mapId, this.helperEventsData.main.id, 'B'];
    $gameSelfSwitches.setValue(id, true);
  }

  growSnake(gameInterpreter) {
    this.score += 1;
    util.playSe(C.SE.GROW_TAIL);

    // get event that gameInterpreter is running against
    const eventId = gameInterpreter.eventId();
    const gameEvent = $gameMap.event(eventId);

    // clear hazards and obstacles around this tail ( within 2 steps)
    let x;
    let y;
    let clean = false;
    for (x = gameEvent.x - 2; x <= gameEvent.x + 2; x += 1) {
      for (y = gameEvent.y - 2; y <= gameEvent.y + 2; y += 1) {
        if (x === gameEvent.x && y === gameEvent.y) {
          continue;
        }
        if (Math.abs(x - gameEvent.x) + Math.abs(y - gameEvent.y) <= 2) {
          if ($gameMap.terrainTag(x, y) === 1) {
            util.changeTiles([{ x, y, id: C.DEFAULT_TILE_ID }]);
            clean = true;
          }
          const eid = $gameMap.eventIdXy(x, y);
          if (eid > util.eventIdOffset) {
            if ($dataMap.events[eid].name === C.HELPER_EVENTS.OBSTACLE) {
              util.removeEvents([eid]);
              clean = true;
            }
          }
        }
      }
    }
    if (clean) {
      util.copyEvent(
        this.helperEventsData.cleanEffect,
        { x: gameEvent.x, y: gameEvent.y },
      );
    }

    // change script to call game over ( when head hit tails )
    gameEvent.page().list[0].parameters = ['$snakeGame.gameover()'];

    // move new tail behind current last tail
    const lastTail = this.tails.length === 0
      ? $gamePlayer : this.tails[this.tails.length - 1];

    switch (lastTail.direction()) {
      case C.UP:
        x = lastTail._realX;
        y = lastTail._realY + 1;
        break;
      case C.LEFT:
        x = lastTail._realX + 1;
        y = lastTail._realY;
        break;
      case C.DOWN:
        x = lastTail._realX;
        y = lastTail._realY - 1;
        break;
      case C.RIGHT:
        x = lastTail._realX - 1;
        y = lastTail._realY;
        break;
      default:
    }

    // push this event to tail list
    this.tails.push(gameEvent);
    // adjust speed based on current score
    this.speedUp();

    // sync the last tail's (new tail's) speed
    gameEvent._moveSpeed = $gamePlayer._moveSpeed;
    // force new tail to move 1 step so it syncs with the rest
    gameEvent.setPosition(x, y);
    gameEvent.moveStraight(lastTail.direction());

    // create next objects on field
    this.generateNextObjects();
  }

  gameover() {
    util.playSe(C.SE.GAMEOVER);
    this.processGameOver();
    this.state = 'gameover';
  }
}

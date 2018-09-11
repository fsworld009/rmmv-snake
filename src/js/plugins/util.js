/* eslint-disable spaced-comment */
/*:
 * @plugindesc Common utilities
 * @author fsworld009
 *
 * @help (No help).
 *
 *
 */
/* eslint-enable spaced-comment */

const util = {
  // get a random number from offset to (offset + range -1)
  rand(range, offset) {
    offset = offset || 0;
    return Math.floor(Math.random() * range) + offset;
  },

  findEventDataByName(name) {
    return $dataMap.events.find(e => e && e.name === name);
  },

  findEventByName(name) {
    const eventData = this.findEventDataByName(name);
    return $gameMap.event(eventData.id);
  },

  randomizeEventImage(event, isObstacle) {
    const nameOffset = this.rand(3, 1);
    const index = this.rand(7, 1);
    const name = isObstacle ? C.IMAGE_NAMES.MONSTER
      : `${C.IMAGE_NAMES.ACTOR}${nameOffset}`;
    event.setImage(name, index);
  },

  getRandomLocation() {
    /**
     * randomize position, make sure it is at least 3 steps away from player
     * and no other object or terrain hazard is on that location
     */
    let x;
    let y;
    const playerX = $gamePlayer._realX;
    const playerY = $gamePlayer._realY;
    let retry = 0;
    while (retry < 100) {
      x = util.rand(C.WIDTH);
      y = util.rand(C.HEIGHT);
      if (Math.abs(x - playerX) + Math.abs(y - playerY) >= 3
        && $gameMap.eventIdXy(x, y) < this.eventIdOffset
        && $gameMap.terrainTag(x, y) === 0) {
        break;
      }
      /**
       * If retry > 100, the game is probably full of objects and
       * cannot find a proper location.
       * In this case, just continue the game
       */
      retry += 1;
    }
    return { x, y };
  },

  copyEvent(eventData, overrides) {
    const json = JSON.parse(JSON.stringify(eventData));
    // remove the placeholder empty page
    json.pages.pop();

    Object.assign(json, overrides);
    // find an empty id slot
    let id;
    for (id = this.eventIdOffset; id <= $dataMap.events.length; id += 1) {
      if (!$dataMap.events[id]) {
        break;
      }
    }
    json.id = id;
    // append event to map
    $dataMap.events[id] = json;
    $gameMap._events[id] = new Game_Event(util.mapId, id);

    // draw new event
    SceneManager._scene.children[0]._tilemap.addChild(
      new Sprite_Character($gameMap._events[id]),
    );
    return $gameMap.event(id);
  },

  removeAllEvents() {
    while ($dataMap.events.length > this.eventIdOffset) {
      const lastId = $dataMap.events.length - 1;
      if ($gameMap.event(lastId)) {
        $gameMap.eraseEvent(lastId);
      }
      $gameMap._events.pop();
      $dataMap.events.pop();
    }
  },

  removeEvents(idList) {
    idList.forEach((id) => {
      if ($gameMap.event(id)) {
        // only adjust length if the last one is deleted
        $gameMap.eraseEvent(id);
        if (id === $dataMap.events.length - 1) {
          $gameMap._events.pop();
          $dataMap.events.pop();
        } else {
          delete $gameMap._events[id];
          delete $dataMap.events[id];
        }
      }
    });
  },

  changeTiles(tileList) {
    const tileMap = SceneManager._scene.children[0]._tilemap;
    // options: {x, y, id} or {offset, id}
    tileList.forEach((options) => {
      const offset = typeof options.offset !== 'undefined'
        ? options.offset : (options.y * C.WIDTH + options.x);
      tileMap._mapData[offset] = options.id;
    });
    tileMap.refresh();
  },

  playSe(name) {
    AudioManager.playSe({ name, volume: 100, pitch: 100 });
  },

  eventIdOffset: 0,
  mapId: 0,

  init() {
    this.eventIdOffset = $dataMap.events.length;
    this.mapId = $gameMap.mapId();
  },
};

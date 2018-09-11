/* eslint-disable spaced-comment, no-unused-vars, prefer-const */
/*:
 * @plugindesc Define global variables and constants
 * @author fsworld009
 *
 * @help (No help).
 *
 *
 */
/* eslint-enable spaced-comment */

const movements = {
  up: 8,
  down: 2,
  left: 4,
  right: 6,
};

const keys = Object.keys(movements);

// constants
const C = {
  UP: 8,
  DOWN: 2,
  LEFT: 4,
  RIGHT: 6,
  WIDTH: 17,
  HEIGHT: 13,
  DEFAULT_TILE_ID: 2816,
  HAZARD_TILE_IDS: [2577, 2384, 2290],
  HELPER_EVENTS: {
    MAIN: 'Main',
    GUN: 'Gun',
    TAIL: 'Tail',
    OBSTACLE: 'Obstacle',
    CLEAN: 'CleanEffect',
  },
  IMAGE_NAMES: {
    ACTOR: 'Actor',
    MONSTER: 'Monster',
    GAMEOVER: 'Damage1',
  },
  GAME_STATE: {
    CREATED: 'created',
    INIT: 'init',
    RUN: 'run',
    END: 'end',
  },
  SE: {
    NEW_OBSTACLE: 'Attack2',
    NEW_HAZARD: 'Earth3',
    GROW_TAIL: 'Item3',
    GAMEOVER: 'Damage3',
  },
  ANIMATION_ID: {
    SPEED_UP: 1,
    CLEAR_SURROUND: 2,
  },
};

let highScore = 0;
let $snakeGame;

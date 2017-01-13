(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};



















var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};





















var slicedToArray = function () {
  function sliceIterator(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"]) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  return function (arr, i) {
    if (Array.isArray(arr)) {
      return arr;
    } else if (Symbol.iterator in Object(arr)) {
      return sliceIterator(arr, i);
    } else {
      throw new TypeError("Invalid attempt to destructure non-iterable instance");
    }
  };
}();













var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var RNG = create();
RNG.create = create;

function create(initialSeed) {

  if (isNaN(initialSeed)) initialSeed = Math.random() * 10000;

  var currentSeed = initialSeed;

  return { get: get$$1, choose: choose, seed: seed };

  function get$$1(min, max) {
    var a = arguments.length;
    if (a === 0) {
      var x = Math.sin(currentSeed++) * 10000;
      return x - Math.floor(x);
    } else if (a === 1) {
      if (!isNaN(min)) max = min, min = 0;else if (Array.isArray(min)) {
        
        var _min = min;

        var _min2 = slicedToArray(_min, 2);

        min = _min2[0];
        max = _min2[1];
      }
    }
    if (min > max) {
      
      var _ref = [max, min];
      min = _ref[0];
      max = _ref[1];
    }return Math.floor(get$$1() * (max - min)) + min;
  }

  function choose(array) {
    if (Array.isArray(array) && !array.length) return null;
    if (!isNaN(array)) return !get$$1(array);
    if (!array) array = [0, 1];
    return array[get$$1(array.length)];
  }

  function seed(newSeed) {
    if (!isNaN(newSeed)) initialSeed = currentSeed = newSeed;
    return currentSeed;
  }
}

var DIRECTIONS = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
var LEFT = DIRECTIONS[0];
var UP_LEFT = DIRECTIONS[1];
var UP = DIRECTIONS[2];
var UP_RIGHT = DIRECTIONS[3];
var RIGHT = DIRECTIONS[4];
var DOWN_RIGHT = DIRECTIONS[5];
var DOWN = DIRECTIONS[6];
var DOWN_LEFT = DIRECTIONS[7];

var DIRECTIONS_CARDINAL = [LEFT, UP, RIGHT, DOWN];

var constants = { LEFT: LEFT, RIGHT: RIGHT, UP: UP, DOWN: DOWN, UP_LEFT: UP_LEFT, UP_RIGHT: UP_RIGHT, DOWN_LEFT: DOWN_LEFT, DOWN_RIGHT: DOWN_RIGHT, DIRECTIONS: DIRECTIONS, DIRECTIONS_CARDINAL: DIRECTIONS_CARDINAL };
var methods = { toString: toString, fromString: fromString, toIndex: toIndex, fromIndex: fromIndex, isEqual: isEqual, isEdge: isEdge, isInside: isInside, getNeighbors: getNeighbors, getManhattan: getManhattan };

var Cell = Object.assign(constants, methods);

function toString(cell) {
  return cell.toString();
}

function fromString(string) {
  return string.split(',').map(Number);
}

function toIndex(cell, size) {
  var _cell = slicedToArray(cell, 2),
      x = _cell[0],
      y = _cell[1];

  return y * size + x;
}

function fromIndex(index, size) {
  var x = index % size;
  var y = (index - x) / size;
  return [x, y];
}

function isEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function isEdge(cell, size) {
  var _cell2 = slicedToArray(cell, 2),
      x = _cell2[0],
      y = _cell2[1];

  return x === 0 || y === 0 || x === size - 1 || y === size - 1;
}

function isInside(cell, size) {
  var _cell3 = slicedToArray(cell, 2),
      x = _cell3[0],
      y = _cell3[1];

  var rect = [0, 0, size, size];
  if (Array.isArray(size)) rect = size;

  var _rect = rect,
      _rect2 = slicedToArray(_rect, 4),
      rectX = _rect2[0],
      rectY = _rect2[1],
      rectWidth = _rect2[2],
      rectHeight = _rect2[3];

  return x >= rectX && y >= rectY && x < rectX + rectWidth && y < rectY + rectHeight;
}

function getNeighbors(cell, diagonals, step) {
  if (!cell) throw new TypeError('Cannot get neighbors of cell \'' + cell + '\'');
  step = step || 1;

  var _cell4 = slicedToArray(cell, 2),
      x = _cell4[0],
      y = _cell4[1];

  var neighbors = [];
  var directions = DIRECTIONS_CARDINAL;
  if (diagonals) directions = DIRECTIONS;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = directions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var direction = _step.value;

      var _direction = slicedToArray(direction, 2),
          dx = _direction[0],
          dy = _direction[1];

      var current = [x + dx * step, y + dy * step];
      var cx = current[0],
          cy = current[1];

      neighbors.push([cx, cy]);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return neighbors;
}

function getManhattan(a, b) {
  var _a = slicedToArray(a, 2),
      ax = _a[0],
      ay = _a[1];

  var _b = slicedToArray(b, 2),
      bx = _b[0],
      by = _b[1];

  return Math.abs(ax - bx) + Math.abs(ay - by);
}

var Rect = { toString: toString$1, fromString: fromString$1, isEqual: isEqual$1, isIntersecting: isIntersecting, getCorners: getCorners, getEdges: getEdges, getBorder: getBorder, getCenter: getCenter, getCells: getCells };

function toString$1(cell) {
  return cell.toString();
}

function fromString$1(string) {
  return string.split(',').map(Number);
}

function isEqual$1(a, b) {
  var i = a.length;
  while (i--) {
    if (a[i] !== b[i]) return false;
  }return true;
}

function isIntersecting(a, b, exclusive) {
  var _a = slicedToArray(a, 4),
      ax = _a[0],
      ay = _a[1],
      aw = _a[2],
      ah = _a[3];

  var _b = slicedToArray(b, 4),
      bx = _b[0],
      by = _b[1],
      bw = _b[2],
      bh = _b[3];

  if (exclusive) ax--, ay--, aw += 2, ah += 2, bx--, by--, bw += 2, bh += 2;
  return ax <= bx + bw && ay <= by + bh && ax + aw >= bx && ay + ah >= by;
}

function getCorners(rect, exclusive) {
  var _rect = slicedToArray(rect, 4),
      x = _rect[0],
      y = _rect[1],
      w = _rect[2],
      h = _rect[3];

  if (exclusive) x--, y--, w += 2, h += 2;
  return [[x, y], [x + w - 1, y], [x, y + h - 1], [x + w - 1, y + h - 1]];
}

function getEdges(rect, exclusive) {
  var edges = [];

  var _rect2 = slicedToArray(rect, 4),
      x = _rect2[0],
      y = _rect2[1],
      w = _rect2[2],
      h = _rect2[3];

  var r = x + w,
      b = y + h,
      i;
  if (exclusive) x--, y--, w += 2, h += 2;
  for (i = x + 1; i < r; i++) {
    edges.push([i, y], [i, b]);
  }for (i = y + 1; i < b; i++) {
    edges.push([x, i], [r, i]);
  }return edges;
}

function getBorder(rect, exclusive) {
  return getEdges(rect, exclusive).concat(getCorners(rect, exclusive));
}

function getCenter(rect) {
  var x, y, w, h;
  if (Array.isArray(rect)) {
    var _rect3 = slicedToArray(rect, 4);

    x = _rect3[0];
    y = _rect3[1];
    w = _rect3[2];
    h = _rect3[3];

    if (rect.length == 2) w = x, h = y, x = 0, y = 0;
  } else if (!isNaN(rect)) x = 0, y = 0, w = rect, h = rect;
  return [Math.floor(x + w / 2), Math.floor(y + h / 2)];
}

function getCells(rect) {
  var cells = [];

  var _rect4 = slicedToArray(rect, 4),
      rectX = _rect4[0],
      rectY = _rect4[1],
      rectWidth = _rect4[2],
      rectHeight = _rect4[3];

  var i = rectWidth * rectHeight;
  while (i--) {
    var x = i % rectWidth;
    var y = (i - x) / rectWidth;
    cells[i] = [x + rectX, y + rectY];
  }
  return cells;
}

var FLOOR$1 = 0;
var WALL$1 = 1;
var DOOR$1 = 2;
var DOOR_OPEN$1 = 3;
var DOOR_SECRET = 4;
var STAIRS$1 = 5;
var TRAP$1 = 6;

var tiles = [{
  name: 'floor',
  walkable: true
}, {
  name: 'wall',
  opaque: true
}, {
  name: 'door',
  opaque: true,
  door: true
}, {
  name: 'door_open',
  walkable: true,
  door: true
}, {
  name: 'door_secret',
  opaque: true,
  door: true,
  secret: true
}, {
  name: 'stairs',
  walkable: true,
  stairs: true
}, {
  name: 'trap',
  walkable: true,
  trap: true
}];

var costs = [];
var _iteratorNormalCompletion = true;
var _didIteratorError = false;
var _iteratorError = undefined;

try {
  for (var _iterator = tiles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
    var tile = _step.value;

    var cost = 0;
    if (!tile.walkable && !tile.door) cost = Infinity;
    if (tile.secret) cost = 1000;
    if (tile.door) {
      cost++;
      if (!tile.walkable) cost++;
    }
    costs.push(cost);
  }
} catch (err) {
  _didIteratorError = true;
  _iteratorError = err;
} finally {
  try {
    if (!_iteratorNormalCompletion && _iterator.return) {
      _iterator.return();
    }
  } finally {
    if (_didIteratorError) {
      throw _iteratorError;
    }
  }
}

var constants$1 = { FLOOR: FLOOR$1, WALL: WALL$1, DOOR: DOOR$1, DOOR_OPEN: DOOR_OPEN$1, DOOR_SECRET: DOOR_SECRET, STAIRS: STAIRS$1, TRAP: TRAP$1, tiles: tiles, costs: costs };
var methods$1 = { create: create$1, fill: fill, clear: clear, getAt: getAt, getTileAt: getTileAt, setAt: setAt, getSize: getSize, findPath: findPath };
var World$$1 = Object.assign({}, constants$1, methods$1);

var sqrt = function (cache) {

  cache = cache || {};

  return function sqrt(num) {
    var cached = cache[num];
    if (cached) return cached;
    var result = cache[num] = Math.sqrt(num);
    return result;
  };
}();

function create$1(size) {
  return new Uint8ClampedArray(size * size);
}

function fill(data, id, rect) {
  if (typeof id === 'undefined') id = WALL$1;
  var size = getSize(data);
  if (rect) {
    var cells = Rect.getCells(rect);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = cells[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var cell = _step2.value;

        setAt(data, cell, id);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  } else {
    var i = data.length;
    while (i--) {
      data[i] = id;
    }
  }
  return data;
}

function clear(data) {
  fill(data, FLOOR$1);
  return data;
}

function getAt(data, cell) {
  var size = getSize(data);
  if (!Cell.isInside(cell, size)) return null;
  var index = Cell.toIndex(cell, size);
  return data[index];
}

function getTileAt(data, cell) {
  return tiles[getAt(data, cell)];
}

function setAt(data, cell, value) {
  var size = getSize(data);
  if (!Cell.isInside(cell, size)) return null;
  var index = Cell.toIndex(cell, size);
  data[index] = value;
  return value;
}

function getSize(data) {
  return sqrt(data.length);
}

function findPath(data, start, goal, costs, diagonals) {

  if (!costs) costs = {
    tiles: World$$1.costs,
    cells: {}
  };

  if (!costs.tiles) costs = {
    tiles: costs,
    cells: {}
  };

  // if (costs.tiles[ World.getAt(data, goal) ] === Infinity)
  //   return null

  var path = [];

  var size = getSize(data);

  var startKey = start.toString();
  var goalKey = goal.toString();

  var opened = [startKey];
  var closed = {};

  var scores = { f: {}, g: {} };
  var parent = {};

  var cells = data.reduce(function (cells, id, index) {
    return cells.concat([Cell.fromIndex(index, size)]);
  }, []);
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = cells[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _cell2 = _step3.value;

      scores.g[_cell2] = Infinity;
      scores.f[_cell2] = Infinity;
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  scores.g[start] = 0;
  scores.f[start] = Cell.getManhattan(start, goal);

  while (opened.length) {
    if (opened.length > 1) opened = opened.sort(function (a, b) {
      return scores.f[b] - scores.f[a];
    });
    var cellKey = opened.pop();
    var cell = Cell.fromString(cellKey);
    if (cellKey === goalKey) {
      var _cell = goal;
      do {
        path.unshift(_cell);
        _cell = parent[_cell];
      } while (_cell);
      return path;
    }
    closed[cell] = true;
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = Cell.getNeighbors(cell, diagonals)[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var neighbor = _step4.value;

        if (!Cell.isInside(neighbor, size) || neighbor in closed) continue;
        var key = neighbor.toString();
        var tileCost = costs.tiles[getAt(data, neighbor)] || 0;
        var cellCost = costs.cells[neighbor] || 0;
        var cost = tileCost + cellCost;
        if (cost === Infinity && key !== goalKey) continue;
        var g = scores.g[cell] + 1 + cost;
        if (!opened.includes(key)) opened.push(key);else if (g >= scores.g[neighbor]) continue;
        parent[neighbor] = cell;
        scores.g[neighbor] = g;
        scores.f[neighbor] = g + Cell.getManhattan(neighbor, goal);
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4.return) {
          _iterator4.return();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }
  }

  return null;
}

var FOV$$1 = { get: get$1 };

function get$1(data, start, range) {
  var cells = [];
  var i = 8;
  while (i--) {
    cells = cells.concat(getOctant(data, start, range, i));
  }cells.push(start);
  return cells;
}

function getOctant(data, start, range, octant) {
  range = range || Infinity;
  var size = World$$1.getSize(data);

  var _start = slicedToArray(start, 2),
      x = _start[0],
      y = _start[1];

  var cells = [];
  var shadows = [];
  var fullShadow = false;
  for (var row = 1; row <= range; row++) {
    var _transformOctant = transformOctant(row, 0, octant),
        _transformOctant2 = slicedToArray(_transformOctant, 2),
        transformX = _transformOctant2[0],
        transformY = _transformOctant2[1];

    var cell = [x + transformX, y + transformY];
    if (!Cell.isInside(cell, size)) break;
    for (var col = 0; col <= row; col++) {
      var _transformOctant3 = transformOctant(row, col, octant),
          _transformOctant4 = slicedToArray(_transformOctant3, 2),
          _transformX = _transformOctant4[0],
          _transformY = _transformOctant4[1];

      var _cell = [x + _transformX, y + _transformY];
      if (!Cell.isInside(_cell, size) || _transformX * _transformX + _transformY * _transformY > range * range) break;
      if (!fullShadow) {
        (function () {
          var projection = getProjection(row, col);
          var visible = !shadows.find(function (shadow) {
            return shadow.start <= projection.start && shadow.end >= projection.end;
          });
          if (visible) {
            cells.push(_cell);
            var id = World$$1.getAt(data, _cell);
            if (World$$1.tiles[id].opaque) {
              var index = void 0;
              for (index = 0; index < shadows.length; index++) {
                if (shadows[index].start >= projection.start) break;
              }var prev = shadows[index - 1];
              var next = shadows[index];
              var overPrev = index > 0 && prev.end > projection.start;
              var overNext = index < shadows.length && next.start < projection.end;
              if (overNext) {
                if (overPrev) {
                  prev.end = next.end;
                  shadows.splice(index, 1);
                } else next.start = projection.start;
              } else if (overPrev) prev.end = projection.end;else shadows.splice(index, 0, projection);
              var shadow = shadows[0];
              fullShadow = shadows.length === 1 && shadow.start === 0 && shadow.end === 1;
            }
          }
        })();
      }
    }
  }
  return cells;
}

function getProjection(row, col) {
  var start = col / (row + 2);
  var end = (col + 1) / (row + 1);
  return { start: start, end: end };
}

function transformOctant(row, col, octant) {
  switch (octant) {
    case 0:
      return [col, -row];
    case 1:
      return [row, -col];
    case 2:
      return [row, col];
    case 3:
      return [col, row];
    case 4:
      return [-col, row];
    case 5:
      return [-row, col];
    case 6:
      return [-row, -col];
    case 7:
      return [-col, -row];
  }
}

var Entity$$1 = { create: create$2 };

function create$2(options) {

  var entity = {
    entityType: null,
    kind: null
  };

  var props = {
    type: 'entity',
    wandering: true,
    health: 1,
    seeing: {},
    known: {},
    world: null,
    cell: null
  };

  Object.assign(entity, options, props);

  var path = null;

  function look() {
    var cells = FOV$$1.get(entity.world.data, entity.cell, 7);
    entity.seeing = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var cell = _step.value;

        var kind = World$$1.tiles[entity.world.getAt(cell)].name;
        var other = entity.world.elementsAt(cell)[0];
        if (other) kind = other.kind;
        entity.known[cell] = kind;
        entity.seeing[cell] = true;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  }

  function move(direction) {
    var moved = false;
    var world = entity.world;

    var _entity$cell = slicedToArray(entity.cell, 2),
        cellX = _entity$cell[0],
        cellY = _entity$cell[1];

    var _direction = slicedToArray(direction, 2),
        distX = _direction[0],
        distY = _direction[1];

    var target = [cellX + distX, cellY + distY];
    var id = world.getAt(target);
    var tile = World$$1.tiles[id];
    var entities = world.entitiesAt(target);
    var items = world.itemsAt(target);
    if (entities.length) {
      var enemy = entities[0];
      attack(enemy);
    } else if (tile.walkable) {
      if (!entities.length) {
        entity.cell = target;
        if (items.length) {
          var item = items[0];
          entity.collect(item);
        }
        moved = true;
        look();
      }
    } else if (tile.door) {
      world.openDoor(target);
      look();
    }
    return moved;
  }

  function moveTo(target) {
    if (!path || path[path.length - 1] !== target) path = entity.world.findPath(entity, target);
    if (!path) return false;
    var next = void 0;
    path.some(function (cell, index) {
      if (!Cell.isEqual(entity.cell, cell)) return;
      next = path[index + 1];
      return true;
    });
    if (!next) return false;

    var _entity$cell2 = slicedToArray(entity.cell, 2),
        cellX = _entity$cell2[0],
        cellY = _entity$cell2[1];

    var _next = next,
        _next2 = slicedToArray(_next, 2),
        nextX = _next2[0],
        nextY = _next2[1];

    var dist = [nextX - cellX, nextY - cellY];
    return entity.move(dist);
  }

  function attack(other) {
    other.health--;
    if (other.health <= 0) {
      entity.world.kill(other);
      look();
    }
  }

  function collect(item) {
    if (Cell.isEqual(entity.cell, item.cell)) {
      if (item.itemType === 'money') console.log('Found ' + item.value + ' gold.');
      entity.world.kill(item);
    }
  }

  var methods = { look: look, move: move, moveTo: moveTo, attack: attack, collect: collect };
  return Object.assign(entity, methods);
}

var Item = { create: create$3 };

function create$3(options) {

  var item = {
    itemType: null,
    kind: null,
    value: null
  };

  var props = {
    type: 'item',
    world: null,
    cell: null
  };

  Object.assign(item, options, props);

  return item;
}

var FLOOR$2 = World$$1.FLOOR;
var WALL$2 = World$$1.WALL;
var DOOR$2 = World$$1.DOOR;
var DOOR_OPEN$2 = World$$1.DOOR_OPEN;
var DOOR_SECRET$1 = World$$1.DOOR_SECRET;


var Dungeon$$1 = { create: create$4 };

var rng$1 = RNG.create();

function findRoom(min, max, worldSize) {
  var w = rng$1.get((max - min) / 2 + 1) * 2 + min;
  var h = rng$1.get((max - min) / 2 + 1) * 2 + min;
  var x = rng$1.get((worldSize - w) / 2) * 2 + 1;
  var y = rng$1.get((worldSize - h) / 2) * 2 + 1;
  return [x, y, w, h];
}

var Diamond = function () {

  var cache = {};

  function cellsFromObject(obj) {
    return Object.keys(obj).map(function (key) {
      return key.split(',').map(Number);
    });
  }

  function cacheDiamond(diamond) {
    var _diamond = slicedToArray(diamond, 3),
        x = _diamond[0],
        y = _diamond[1],
        radius = _diamond[2];

    var start = [x, y];
    var stack = [start];
    var cells = defineProperty({}, start, 0);
    var edges = {};
    var doors = {};

    while (stack.length) {
      var node = stack.pop();
      var nexts = Cell.getNeighbors(node).filter(function (neighbor) {
        return !(neighbor.toString() in cells);
      });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = nexts[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var next = _step.value;

          var steps = cells[node] + 1;
          if (steps <= radius) {
            cells[next] = steps;
            stack.unshift(next);
          } else edges[next] = steps;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    cells = cellsFromObject(cells);
    edges = cellsFromObject(edges);

    return { cells: cells, edges: edges, center: start };
  }

  function getCached(diamond) {
    var cached = cache[diamond];
    if (!cached) cached = cache[diamond] = cacheDiamond(diamond);
    return cached;
  }

  function getCells(diamond) {
    return getCached(diamond).cells;
  }

  function getEdges(diamond) {
    return getCached(diamond).edges;
  }

  function getCenter(diamond) {
    return getCached(diamond).center;
  }

  return { getCells: getCells, getEdges: getEdges, getCenter: getCenter };
}();

function findDiamondRoom(min, max, worldSize) {
  var radius = rng$1.get((max - min) / 2 + 1) * 2 + min;
  var nodes = findNodes(worldSize, radius).map(Cell.fromString);
  var diamond = rng$1.choose(nodes);
  diamond.push(radius);
  return diamond;
}

function findRooms(data, maxRatio) {
  maxRatio = maxRatio || 0.33;
  var size = World$$1.getSize(data);
  var area = size * size;
  var valid = true;
  var rooms = { cells: {}, edges: {}, rects: {}, diamonds: {}, normal: new Set(), secret: new Set(), list: [] };
  var total = 0;
  var fails = 0;
  var cached = {};

  function validate(cells) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = cells[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var cell = _step2.value;

        if (rooms.cells[cell] || rooms.edges[cell]) return false;
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return true;
  }

  function getData(shape) {
    switch (shape) {
      case 'rect':
        {
          var matrix = findRoom(3, 9, size);
          return [matrix, Rect.getBorder(matrix, true)];
        }
      case 'diamond':
        {
          var _matrix = findDiamondRoom(2, 6, size);
          return [_matrix, Diamond.getEdges(_matrix)];
        }
    }
  }

  while (valid && total / area < maxRatio) {
    var shape = 'rect';
    var matrix = void 0;
    do {
      var cells = void 0;
      if (rng$1.choose(50)) {
        shape = 'diamond';
      }

      var _getData = getData(shape);

      var _getData2 = slicedToArray(_getData, 2);

      matrix = _getData2[0];
      cells = _getData2[1];

      if (matrix in cached) {
        valid = false;
        continue;
      }
      cached[matrix] = valid = validate(cells);
    } while (!valid && ++fails < area);
    if (valid) {
      var edges = void 0,
          room = { edges: {}, shape: shape, matrix: matrix, type: 'room' };
      if (shape === 'rect') {
        edges = Rect.getBorder(matrix, true);
        room.cells = Rect.getCells(matrix);
        room.center = Rect.getCenter(matrix);
        rooms.rects[matrix] = room;
      } else if (shape === 'diamond') {
        edges = Diamond.getEdges(matrix);
        room.cells = Diamond.getCells(matrix);
        room.center = Diamond.getCenter(matrix);
        rooms.diamonds[matrix] = room;
      }
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = room.cells[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var cell = _step3.value;

          rooms.cells[cell] = room;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = edges[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var edge = _step4.value;

          var sharedEdges = room.edges[edge] = rooms.edges[edge] = rooms.edges[edge] || [];
          sharedEdges.push(room);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      rooms.normal.add(room);
      rooms.list.push(room);
      total += room.cells.length;
    }
  }
  return rooms;
}

function findNodes(worldSize, offset) {
  offset = offset || 0;
  var data = null;
  if ((typeof worldSize === 'undefined' ? 'undefined' : _typeof(worldSize)) === 'object') {
    data = worldSize;
    worldSize = World$$1.getSize(data);
  }
  var nodes = [];
  var half = (worldSize - 1) / 2 - offset;
  var i = half * half;
  while (i--) {
    var _Cell$fromIndex = Cell.fromIndex(i, half),
        _Cell$fromIndex2 = slicedToArray(_Cell$fromIndex, 2),
        nodeX = _Cell$fromIndex2[0],
        nodeY = _Cell$fromIndex2[1];

    var node = [nodeX * 2 + 1 + offset, nodeY * 2 + 1 + offset];
    if (!data || World$$1.getAt(data, node) === WALL$2 && !Cell.getNeighbors(node, true).filter(function (neighbor) {
      return World$$1.getAt(data, neighbor) !== WALL$2;
    }).length) nodes.push(node.toString());
  }
  return nodes;
}

function findMazes(data) {
  var size = World$$1.getSize(data);
  var mazes = { cells: {}, ends: {}, list: [] };
  var nodes = new Set(findNodes(data).map(Cell.toString));
  while (nodes.size) {
    var maze = { cells: {}, ends: {}, type: 'maze' };
    var start = rng$1.choose([].concat(toConsumableArray(nodes)));
    var _id = Cell.fromString(start);
    var stack = [_id];
    var track = [_id];
    var end = true;
    mazes.ends[start] = maze.ends[start] = maze;
    while (stack.length) {
      var node = void 0,
          _node = node = stack.pop(),
          _node2 = slicedToArray(_node, 2),
          nodeX = _node2[0],
          nodeY = _node2[1];
      nodes.delete(node.toString());
      mazes.cells[node] = maze.cells[node] = maze;
      var neighbors = Cell.getNeighbors(node, false, 2).filter(function (neighbor) {
        if (World$$1.getAt(data, neighbor) !== WALL$2 || neighbor in mazes.cells) return false;
        var nonwalls = Cell.getNeighbors(neighbor, true).filter(function (neighbor) {
          return World$$1.getAt(data, neighbor) !== WALL$2;
        });
        return !nonwalls.length;
      });
      if (neighbors.length) {
        var neighbor = rng$1.choose(neighbors);

        var _neighbor = slicedToArray(neighbor, 2),
            neighborX = _neighbor[0],
            neighborY = _neighbor[1];

        var distX = neighborX - nodeX,
            distY = neighborY - nodeY;
        var stepX = distX / (Math.abs(distX) || 1),
            stepY = distY / (Math.abs(distY) || 1);

        var midpoint = [nodeX + stepX, nodeY + stepY];
        mazes.cells[midpoint] = maze.cells[midpoint] = maze;
        stack.push(neighbor);
        track.push(neighbor);
        end = false;
      } else {
        if (!end) {
          mazes.ends[node] = maze.ends[node] = maze;
          end = true;
        }
        if (track.length) stack.push(track.pop());
      }
    }
    mazes.list.push(maze);
  }
  return mazes;
}

function findConnectors(data, rooms, mazes) {
  var connectors = {};
  for (var _id2 in rooms.edges) {
    var cell = Cell.fromString(_id2);
    var neighbors = Cell.getNeighbors(cell);
    var regions = [];
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = neighbors[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var neighbor = _step5.value;

        var _neighbor2 = slicedToArray(neighbor, 2),
            x = _neighbor2[0],
            y = _neighbor2[1];

        if (x % 2 && y % 2 && World$$1.getAt(data, neighbor) === FLOOR$2) {
          var region = rooms.cells[neighbor] || mazes.cells[neighbor];
          if (region) regions.push(region);
        }
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }

    if (regions.length === 2) connectors[cell] = regions;
  }
  return connectors;
}

function findDoors(data, rooms, mazes) {

  var connectorRegions = findConnectors(data, rooms, mazes);
  var start = rng$1.choose(rooms.list);
  var stack = [start];
  var track = [start];
  var doorRegions = {};

  var disconnected = new Set(rooms.list);
  var connected = new Map();

  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = rooms.list[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var room = _step6.value;

      room.connections = new Set();
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }

  var _iteratorNormalCompletion7 = true;
  var _didIteratorError7 = false;
  var _iteratorError7 = undefined;

  try {
    for (var _iterator7 = mazes.list[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
      var maze = _step7.value;

      maze.connections = new Set();
    }
  } catch (err) {
    _didIteratorError7 = true;
    _iteratorError7 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion7 && _iterator7.return) {
        _iterator7.return();
      }
    } finally {
      if (_didIteratorError7) {
        throw _iteratorError7;
      }
    }
  }

  while (stack.length) {
    var node = stack.pop();
    if (rooms.list.includes(node) && disconnected.has(node)) disconnected.delete(node);
    var connectors = getConnectors(node);
    var connectorKeys = Object.keys(connectors);
    if (connectorKeys.length) {
      var connector = rng$1.choose(connectorKeys);
      var next = connectors[connector];
      if (next) {
        // Remove extraneous connectors
        for (var _id3 in next.cells) {
          var cell = Cell.fromString(_id3);
          var neighbors = Cell.getNeighbors(cell);
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = neighbors[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var neighbor = _step8.value;

              if (neighbor in connectorRegions && connectorRegions[neighbor].includes(node)) delete connectorRegions[neighbor];
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }
        }

        doorRegions[connector] = [node, next];

        stack.push(next);
        track.push(next);

        node.connections.add(next);
        next.connections.add(node);
      }
    } else {
      if (node.type === 'maze' && node.connections.length === 1) {
        var last = node.connections.entries().next().value;
        last.connections.delete(node);
        connected.delete(node);
      }
      while (track.length) {
        var _next = track.pop();
        if (_next && _next !== node) {
          stack.push(_next);
          track.push(_next);
          // console.log('Backtracking to', next.type)
          break;
        }
      }
    }
  }

  // for (let connector in connectorRegions)
  //   World.setAt(data, Cell.fromString(connector), DOOR_OPEN)

  return doorRegions;

  // Connectors store the `regions` they connect; get the one that's not `node`
  function getNext(regions, node) {
    var _iteratorNormalCompletion9 = true;
    var _didIteratorError9 = false;
    var _iteratorError9 = undefined;

    try {
      for (var _iterator9 = regions[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
        var region = _step9.value;

        if (region !== node) return region;
      }
    } catch (err) {
      _didIteratorError9 = true;
      _iteratorError9 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion9 && _iterator9.return) {
          _iterator9.return();
        }
      } finally {
        if (_didIteratorError9) {
          throw _iteratorError9;
        }
      }
    }

    return null;
  }

  // Get the valid connectors of the specified `node`
  function getConnectors(node) {
    var connectors = {};
    var prospects = [];
    // Normalize based on type
    if (node.type === 'room') {
      for (var _id4 in node.edges) {
        if (_id4 in connectorRegions) prospects.push(_id4);
      }
    } else if (node.type === 'maze') {
      for (var _id5 in node.cells) {
        var _cell = Cell.fromString(_id5);
        var _neighbors = Cell.getNeighbors(_cell);
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = _neighbors[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var _neighbor3 = _step10.value;

            if (_neighbor3 in connectorRegions) prospects.push(_neighbor3.toString());
          }
        } catch (err) {
          _didIteratorError10 = true;
          _iteratorError10 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion10 && _iterator10.return) {
              _iterator10.return();
            }
          } finally {
            if (_didIteratorError10) {
              throw _iteratorError10;
            }
          }
        }
      }
    }
    var _iteratorNormalCompletion11 = true;
    var _didIteratorError11 = false;
    var _iteratorError11 = undefined;

    try {
      for (var _iterator11 = prospects[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
        var _id6 = _step11.value;

        var _cell2 = Cell.fromString(_id6);
        var regions = connectorRegions[_id6];
        var _next2 = getNext(regions, node);
        if (_next2) {
          var lucky = rng$1.choose(5);
          var isIncluded = _id6 in doorRegions;
          var isConnected = node.connections.has(_next2);
          var isMain = connected.has(_next2) && !lucky;
          var nearby = !!Cell.getNeighbors(_cell2, true).filter(function (neighbor) {
            return neighbor in doorRegions;
          }).length;
          if (!isIncluded && !isConnected && !isMain && !nearby) connectors[_id6] = _next2;
        }
      }
    } catch (err) {
      _didIteratorError11 = true;
      _iteratorError11 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion11 && _iterator11.return) {
          _iterator11.return();
        }
      } finally {
        if (_didIteratorError11) {
          throw _iteratorError11;
        }
      }
    }

    return connectors;
  }
}

function fillEnds(data, mazes, doors) {
  var stack = Object.keys(mazes.ends).map(Cell.fromString);
  var ends = [];
  while (stack.length) {
    var cell = stack.pop();
    var escapes = Cell.getNeighbors(cell).filter(function (neighbor) {
      return World$$1.getTileAt(data, neighbor).walkable || neighbor in doors;
    });
    if (escapes.length <= 1) {
      delete mazes.cells[cell];
      World$$1.setAt(data, cell, WALL$2);
      if (escapes.length) stack.push(escapes[0]);
    } else {
      ends.push(cell);
    }
  }
  ends = ends.filter(function (end) {
    return World$$1.getAt(data, end) === FLOOR$2 && Cell.getNeighbors(end).filter(function (neighbor) {
      return World$$1.getTileAt(data, neighbor).walkable;
    }).length === 1;
  });
  return ends;
}

function generate$1(size, seed) {

  var data = World$$1.fill(World$$1.create(size));

  var rooms = findRooms(data);
  var _iteratorNormalCompletion12 = true;
  var _didIteratorError12 = false;
  var _iteratorError12 = undefined;

  try {
    for (var _iterator12 = rooms.list[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
      var _room = _step12.value;
      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = _room.cells[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var _cell3 = _step14.value;

          World$$1.setAt(data, _cell3, FLOOR$2);
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14.return) {
            _iterator14.return();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
          }
        }
      }
    }
  } catch (err) {
    _didIteratorError12 = true;
    _iteratorError12 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion12 && _iterator12.return) {
        _iterator12.return();
      }
    } finally {
      if (_didIteratorError12) {
        throw _iteratorError12;
      }
    }
  }

  var mazes = findMazes(data);
  var _iteratorNormalCompletion13 = true;
  var _didIteratorError13 = false;
  var _iteratorError13 = undefined;

  try {
    for (var _iterator13 = mazes.list[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
      var maze = _step13.value;

      for (var _id8 in maze.cells) {
        World$$1.setAt(data, Cell.fromString(_id8), FLOOR$2);
      }
    }
  } catch (err) {
    _didIteratorError13 = true;
    _iteratorError13 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion13 && _iterator13.return) {
        _iterator13.return();
      }
    } finally {
      if (_didIteratorError13) {
        throw _iteratorError13;
      }
    }
  }

  var doors = findDoors(data, rooms, mazes);

  var ends = fillEnds(data, mazes, doors);
  var endKeys = ends.map(Cell.toString);

  for (var _id7 in doors) {
    var cell = Cell.fromString(_id7);
    var regions = doors[_id7];
    var room = regions.filter(function (region) {
      return region.type !== 'maze';
    })[0];
    var type = DOOR$2;
    var neighbors = Cell.getNeighbors(cell).filter(function (neighbor) {
      return endKeys.includes(neighbor.toString());
    });
    if (!neighbors.length && rng$1.choose()) {
      type = DOOR_SECRET$1;
      rooms.normal.delete(room);
      rooms.secret.add(room);
    } else if (rng$1.choose(5)) type = FLOOR$2;
    World$$1.setAt(data, cell, type);
  }

  return { data: data, rooms: rooms };
}

function create$4(size, seed) {

  if (!size % 2) throw new RangeError('Cannot create dungeon of even size ' + size);

  if ((typeof seed === 'undefined' ? 'undefined' : _typeof(seed)) === 'object') {
    rng$1 = seed;
    seed = rng$1.seed();
  } else if (isNaN(seed)) {
    seed = rng$1.get();
    rng$1.seed(seed);
  }

  console.log('Seed:', seed);

  var _generate = generate$1(size, seed),
      data = _generate.data,
      rooms = _generate.rooms;

  function spawn(element, cell) {
    if (!world.rooms) return null;
    if ((typeof cell === 'undefined' ? 'undefined' : _typeof(cell)) !== 'object') {
      var valid = void 0;
      do {
        var room = rng$1.choose([].concat(toConsumableArray(world.rooms.normal)));
        if (cell !== 'center') cell = rng$1.choose(room.cells);else cell = room.center;
      } while (elementsAt(cell).length && getAt(cell) === FLOOR$2);
    }
    if (!isNaN(element)) setAt(cell, element);else if ((typeof element === 'undefined' ? 'undefined' : _typeof(element)) === 'object') {
      element.world = world;
      element.cell = cell;
      getList(element).push(element);
    }
    return cell;
  }

  function getList(element) {
    switch (element.type) {
      case 'entity':
        return world.entities;
      case 'item':
        return world.items;
      default:
        return null;
    }
  }

  function kill(element) {
    var list = getList(element);
    if (!list) return false;
    var index = list.indexOf(element);
    if (index < 0) return false;
    list.splice(index, 1);
    return true;
  }

  function elementsAt(cell) {
    return entitiesAt(cell).concat(itemsAt(cell));
  }

  function entitiesAt(cell) {
    return world.entities.filter(function (entity) {
      return Cell.isEqual(entity.cell, cell);
    });
  }

  function itemsAt(cell) {
    return world.items.filter(function (item) {
      return Cell.isEqual(item.cell, cell);
    });
  }

  function getAt(cell) {
    return World$$1.getAt(world.data, cell);
  }

  function getTileAt(cell) {
    return World$$1.tiles[getAt(cell)];
  }

  function setAt(cell, value) {
    return World$$1.setAt(world.data, cell, value);
  }

  function findPath(start, goal) {
    var entity = null;
    if (!Array.isArray(start) && (typeof start === 'undefined' ? 'undefined' : _typeof(start)) === 'object') {
      entity = start;
      start = entity.cell;
    }
    var cells = {};
    if (!entity) {
      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = world.entities[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var _entity = _step15.value;

          cells[_entity.cell] = Infinity;
        }
      } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion15 && _iterator15.return) {
            _iterator15.return();
          }
        } finally {
          if (_didIteratorError15) {
            throw _iteratorError15;
          }
        }
      }
    } else {
      (function () {
        var world = entity.world;
        world.data.forEach(function (id, index) {
          var cell = Cell.fromIndex(index, world.size);
          if (!entity.known[cell] || world.entitiesAt(cell).filter(function (entity) {
            return !entity.walkable;
          }).length) cells[cell] = Infinity;
        });
      })();
    }
    var costs = { tiles: World$$1.costs, cells: cells };
    var path = World$$1.findPath(world.data, start, goal, costs);
    return path;
  }

  function openDoor(cell) {
    var data = world.data.slice();
    var id = getAt(cell);
    if (World$$1.tiles[id].door) World$$1.setAt(data, cell, DOOR_OPEN$2);
    world.data = data;
    return world;
  }

  function closeDoor(cell) {
    var data = world.data.slice();
    var id = getAt(cell);
    if (World$$1.tiles[id].door) World$$1.setAt(data, cell, DOOR$2);
    world.data = data;
    return world;
  }

  function toggleDoor(cell) {
    var data = world.data.slice();
    var oldId = getAt(cell);
    var newId = DOOR_OPEN$2;
    var tile = World$$1.tiles[id];
    if (tile.door) {
      if (tile.walkable) newId = DOOR$2;
      World$$1.setAt(data, cell, newId);
    }
    world.data = data;
    return world;
  }

  var props = { size: size, data: data, rooms: rooms, entities: [], items: [] };
  var methods = { spawn: spawn, kill: kill, elementsAt: elementsAt, entitiesAt: entitiesAt, itemsAt: itemsAt, getAt: getAt, getTileAt: getTileAt, setAt: setAt, findPath: findPath, openDoor: openDoor, closeDoor: closeDoor, toggleDoor: toggleDoor };

  var world = Object.assign({}, props, methods);
  return world;
}

var _lighter;
var _darker;

// High-contrast shades
var RED$1 = [255, 0, 0];
var YELLOW$1 = [255, 255, 0];
var LIME$1 = [0, 255, 0];
var CYAN$1 = [0, 255, 255];
var BLUE$1 = [0, 0, 255];
var MAGENTA$1 = [255, 0, 255];

// Darker ones
var MAROON$1 = [128, 0, 0];
var OLIVE$1 = [128, 128, 0];
var GREEN$1 = [0, 128, 0];
var TEAL$1 = [0, 128, 128];
var NAVY$1 = [0, 0, 128];
var PURPLE$1 = [128, 0, 128];

// Monochromes
var WHITE$1 = [255, 255, 255];
var GRAY$1 = [128, 128, 128];
var BLACK$1 = [0, 0, 0];

var lighter = (_lighter = {}, defineProperty(_lighter, MAROON$1, RED$1), defineProperty(_lighter, OLIVE$1, YELLOW$1), defineProperty(_lighter, GREEN$1, LIME$1), defineProperty(_lighter, TEAL$1, CYAN$1), defineProperty(_lighter, NAVY$1, BLUE$1), defineProperty(_lighter, PURPLE$1, MAGENTA$1), defineProperty(_lighter, GRAY$1, WHITE$1), defineProperty(_lighter, BLACK$1, GRAY$1), _lighter);
var darker = (_darker = {}, defineProperty(_darker, RED$1, MAROON$1), defineProperty(_darker, YELLOW$1, OLIVE$1), defineProperty(_darker, LIME$1, GREEN$1), defineProperty(_darker, CYAN$1, TEAL$1), defineProperty(_darker, BLUE$1, NAVY$1), defineProperty(_darker, MAGENTA$1, PURPLE$1), defineProperty(_darker, WHITE$1, GRAY$1), defineProperty(_darker, GRAY$1, BLACK$1), _darker);

function lighten(color) {
  return lighter[color];
}

function darken(color) {
  return darker[color];
}

var constants$2 = { RED: RED$1, YELLOW: YELLOW$1, LIME: LIME$1, CYAN: CYAN$1, BLUE: BLUE$1, MAGENTA: MAGENTA$1, MAROON: MAROON$1, OLIVE: OLIVE$1, GREEN: GREEN$1, TEAL: TEAL$1, NAVY: NAVY$1, PURPLE: PURPLE$1, WHITE: WHITE$1, GRAY: GRAY$1, BLACK: BLACK$1 };
var methods$2 = { lighten: lighten, darken: darken };
var Colors = Object.assign({}, constants$2, methods$2);

var WORLD_SIZE = 25;
var STAIRS = World$$1.STAIRS;
var TRAP = World$$1.TRAP;
var MAROON = Colors.MAROON;
var YELLOW = Colors.YELLOW;
var OLIVE = Colors.OLIVE;
var LIME = Colors.LIME;
var TEAL = Colors.TEAL;
var BLUE = Colors.BLUE;
var MAGENTA = Colors.MAGENTA;
var WHITE = Colors.WHITE;
var GRAY = Colors.GRAY;


var sprites = {

  // Tiles
  floor: [String.fromCharCode(183), TEAL],
  wall: ['#', OLIVE],
  door: ['+', MAROON],
  door_open: ['/', MAROON],
  door_secret: ['#', OLIVE],
  stairs: ['>', WHITE],
  trap: ['^', MAGENTA],

  // Entities
  human: ['@', WHITE],
  wyrm: ['w', LIME],
  replica: ['J', BLUE],

  // Items
  gold: ['$', YELLOW],
  silver: ['$', WHITE],
  copper: ['$', MAROON]

};

// TODO: Change these to key/value pairs with data on each enemy
var enemies = ['wyrm', 'replica'];

// Use `RNG.create(seed)` to seed the RNG, where `seed` is some
// number like `9820.083045702477`. Seeding the RNG allows you
// to achieve the same dungeon multiple times for debugging.
//
// Leave empty for a random seed.
//
var rng = RNG.create();

function spawnEnemies(world) {
  var i = 10;
  while (i--) {
    var kind = rng.choose(enemies);
    var options = { entityType: 'enemy', kind: kind };
    var enemy = Entity$$1.create(options);
    world.spawn(enemy);
  }
}

var money = {
  copper: {
    range: [4, 16]
  },
  silver: {
    range: [32, 128],
    chance: 0.10
  },
  gold: {
    range: [256, 1024],
    chance: 0.01
  }
};
function spawnMoney(world) {

  var i = 10;

  while (i--) {

    var num = rng.get(100) + 1;
    var lowest = 1;
    var rarest = null;
    for (var _kind in money) {
      var _money$_kind = money[_kind],
          range = _money$_kind.range,
          chance = _money$_kind.chance;

      if (!chance) chance = 1;
      if (chance <= lowest && num <= chance * 100) {
        lowest = chance;
        rarest = _kind;
      }
    }

    var kind = rarest;
    var value = rng.get(money[kind].range);

    var options = { itemType: 'money', kind: kind, value: value };
    var item = Item.create(options);

    world.spawn(item);
  }
}

function generate() {
  var world = Dungeon$$1.create(WORLD_SIZE, rng);
  var hero = Entity$$1.create({ entityType: 'hero', kind: 'human' });
  world.spawn(hero);
  world.spawn(STAIRS, 'center');
  world.spawn(TRAP);
  spawnEnemies(world);
  spawnMoney(world);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = world.entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var entity = _step.value;

      entity.look();
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  return { world: world, hero: hero };
}

new Vue({
  el: '#app',
  data: function data() {
    return Object.assign(generate(), { log: [], debug: false });
  },
  methods: {
    onclick: function onclick(index) {
      var world = this.world,
          hero = this.hero,
          debug = this.debug;

      var cell = hero.cell;
      var targetX = index % WORLD_SIZE;
      var targetY = (index - targetX) / WORLD_SIZE;
      var target = [targetX, targetY];

      if (Cell.isEqual(cell, target)) {
        if (world.getAt(cell) === STAIRS) this.descend();
        return;
      }

      if (!hero.known[target] && !debug) return;

      function move() {
        var moved = hero.moveTo(target);
        if (moved) window.requestAnimationFrame(move);
      }
      move();
    },
    ascend: function ascend() {},
    descend: function descend() {
      var generation = generate();
      this.world = generation.world;
      this.hero = generation.hero;
    }
  },
  computed: {
    view: function view() {
      var world = this.world,
          hero = this.hero,
          debug = this.debug;

      var view = [];
      world.data.forEach(function (id, index) {
        var cell = Cell.fromIndex(index, WORLD_SIZE);
        var char = ' ',
            color = void 0;
        var type = hero.known[cell];
        if (!type && debug) type = World$$1.tiles[world.getAt(cell)].name;
        if (type) {
          var _sprites$type = slicedToArray(sprites[type], 2);

          char = _sprites$type[0];
          color = _sprites$type[1];

          if (!hero.seeing[cell]) color = GRAY;
          if (Array.isArray(color)) color = 'rgb(' + color.join(', ') + ')';
        }
        view.push({ char: char, color: color });
      });
      return view;
    }
  },
  mounted: function mounted() {
    var vue = this;
    vue.$el.style.fontSize = 'calc(100vmin / ' + WORLD_SIZE + ')';
    function handleKeys(event) {
      var flag = event.type === 'keydown';
      if (event.code === 'Space' && vue.debug !== flag) {
        vue.debug = flag;
      }
    }
    window.addEventListener('keydown', handleKeys);
    window.addEventListener('keyup', handleKeys);
  },
  components: {
    game: {
      template: '#game-template',
      props: ['view', 'onclick']
    }
  }
});

})));
//# sourceMappingURL=build.js.map

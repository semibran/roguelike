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

var Random = { get: get$$1, choose: choose };

function get$$1(min, max) {
  var a = arguments.length;
  if (a === 0) return Math.random();else if (a === 1) max = min, min = 0;
  if (min > max) {
    
    var _ref = [max, min];
    min = _ref[0];
    max = _ref[1];
  }return Math.floor(get$$1() * (max - min)) + min;
}

function choose(array) {
  if (Array.isArray(array) && !array.length) return null;
  if (!isNaN(array)) return !get$$1(array);
  if (!Array.isArray(array) && (typeof array === 'undefined' ? 'undefined' : _typeof(array)) === 'object') array = Object.keys(array);
  if (!array) array = [0, 1];
  return array[get$$1(array.length)];
}

var directions = [[-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1]];
var LEFT = directions[0];
var UP_LEFT = directions[1];
var UP = directions[2];
var UP_RIGHT = directions[3];
var RIGHT = directions[4];
var DOWN_RIGHT = directions[5];
var DOWN = directions[6];
var DOWN_LEFT = directions[7];

var adjacentDirections = [LEFT, UP, RIGHT, DOWN];

var constants = { LEFT: LEFT, RIGHT: RIGHT, UP: UP, DOWN: DOWN, UP_LEFT: UP_LEFT, UP_RIGHT: UP_RIGHT, DOWN_LEFT: DOWN_LEFT, DOWN_RIGHT: DOWN_RIGHT, directions: directions, adjacentDirections: adjacentDirections };
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

  return x >= 0 && y >= 0 && x < size && y < size;
}

function getNeighbors(cell, diagonals, step) {
  if (!cell) throw new TypeError('Cannot get neighbors of cell \'' + cell + '\'');
  step = step || 1;

  var _cell4 = slicedToArray(cell, 2),
      x = _cell4[0],
      y = _cell4[1];

  var neighbors = [];
  var directions = adjacentDirections;
  if (diagonals) directions = directions;
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
  return [[x, y], [x + w, y], [x, y + h], [x + w, y + h]];
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
var STAIRS$1 = 4;

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
  name: 'stairs',
  walkable: true,
  stairs: true
}];

var costs = [0, Infinity, 2, 1, 0];

var constants$1 = { FLOOR: FLOOR$1, WALL: WALL$1, DOOR: DOOR$1, DOOR_OPEN: DOOR_OPEN$1, STAIRS: STAIRS$1, tiles: tiles, costs: costs };
var methods$1 = { create: create, fill: fill, clear: clear, getAt: getAt, setAt: setAt, getSize: getSize, findPath: findPath, openDoor: openDoor, closeDoor: closeDoor, toggleDoor: toggleDoor };
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

function create(size) {
  return new Uint8ClampedArray(size * size);
}

function fill(data, id, rect) {
  if (typeof id === 'undefined') id = WALL$1;
  var size = getSize(data);
  if (rect) {
    var cells = Rect.getCells(rect);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var cell = _step.value;

        setAt(data, cell, id);
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

function findPath(data, start, goal, costs) {
  costs = costs || World$$1.costs;

  var path = [];

  var size = getSize(data);

  var startId = start.toString();
  var goalId = goal.toString();

  var opened = [startId];
  var closed = {};

  var scores = { f: {}, g: {} };
  var parent = {};

  var cells = data.reduce(function (cells, id, index) {
    return cells.concat([Cell.fromIndex(index, size)]);
  }, []);
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = cells[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _cell2 = _step2.value;

      scores.g[_cell2] = Infinity;
      scores.f[_cell2] = Infinity;
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

  scores.g[start] = 0;
  scores.f[start] = Cell.getManhattan(start, goal);

  while (opened.length) {
    if (opened.length > 1) opened = opened.sort(function (a, b) {
      return scores.f[b] - scores.f[a];
    });
    var cellId = opened.pop();
    var cell = Cell.fromString(cellId);
    if (cellId === goalId) {
      var _cell = goal;
      do {
        path.unshift(_cell);
        _cell = parent[_cell];
      } while (_cell);
      return path;
    }
    closed[cell] = true;
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = Cell.getNeighbors(cell)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var neighbor = _step3.value;

        if (!Cell.isInside(neighbor, size) || neighbor in closed) continue;
        var cost = costs[getAt(data, neighbor)] || 0;
        if (cost === Infinity) continue;
        var g = scores.g[cell] + 1 + cost;
        var id = neighbor.toString();
        if (!opened.includes(id)) opened.push(id);else if (g >= scores.g[neighbor]) continue;
        parent[neighbor] = cell;
        scores.g[neighbor] = g;
        scores.f[neighbor] = g + Cell.getManhattan(neighbor, goal);
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
  }

  return null;
}

function openDoor(data, cell) {
  data = data.slice();
  var id = World$$1.getAt(data, cell);
  if (id === DOOR$1 || id === DOOR_OPEN$1) World$$1.setAt(data, cell, DOOR_OPEN$1);
  return data;
}

function closeDoor(data, cell) {
  data = data.slice();
  var id = World$$1.getAt(data, cell);
  if (id === DOOR$1 || id === DOOR_OPEN$1) World$$1.setAt(data, cell, DOOR$1);
  return data;
}

function toggleDoor(data, cell) {
  data = data.slice();
  var id = World$$1.getAt(data, cell);
  if (id === DOOR$1) World$$1.setAt(data, cell, DOOR_OPEN$1);
  if (id === DOOR_OPEN$1) World$$1.setAt(data, cell, DOOR$1);
  return data;
}

var FOV$$1 = { get: get$2 };

function get$2(data, start, range) {
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
      if (!Cell.isInside(_cell, size)) break;
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

var Entity$$1 = { create: create$1 };

function create$1(sprite) {

  var path = null;

  function look() {
    var cells = FOV$$1.get(entity.world.data, entity.cell);
    entity.seeing = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var cell = _step.value;

        entity.known[cell] = World$$1.tiles[World$$1.getAt(entity.world.data, cell)].name;
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
    var id = World$$1.getAt(world.data, target);
    var tile = World$$1.tiles[id];
    if (tile.walkable) {
      entity.cell = target;
      moved = true;
      look();
    } else if (tile.door) {
      world.data = World$$1.openDoor(world.data, target);
      moved = false;
      look();
    }
    return moved;
  }

  function moveTo(target) {
    if (!path || path[path.length - 1] !== target) path = World$$1.findPath(entity.world.data, entity.cell, target);
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

  var props = { sprite: sprite, seeing: [], known: {}, world: null, cell: null };
  var methods = { look: look, move: move, moveTo: moveTo };
  var entity = Object.assign({}, props, methods);

  return entity;
}

var FLOOR$2 = World$$1.FLOOR;
var WALL$2 = World$$1.WALL;
var DOOR$2 = World$$1.DOOR;


var Generator$$1 = { createDungeon: createDungeon };

function findRoom(min, max, worldSize) {
  var w = Random.get((max - min) / 2 + 1) * 2 + min;
  var h = Random.get((max - min) / 2 + 1) * 2 + min;
  var x = Random.get((worldSize - w) / 2) * 2 + 1;
  var y = Random.get((worldSize - h) / 2) * 2 + 1;
  return [x, y, w, h];
}

function findRooms(data, maxRatio) {
  maxRatio = maxRatio || 0.33;
  var size = World$$1.getSize(data);
  var area = size * size;
  var min = Math.round(size / 5);
  var max = Math.round(size / 4);
  var rooms = { cells: {}, edges: {}, rects: {}, list: [] };
  var tries = 0;
  var total = 0;
  var valid = void 0;
  do {
    var room = { cells: {}, edges: {}, rect: null, type: 'room' };
    do {
      valid = true;
      room.rect = findRoom(min, max, size);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = rooms.list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var other = _step.value;

          if (Rect.isIntersecting(room.rect, other.rect)) {
            valid = false;
            break;
          }
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
    } while (!valid && ++tries < area);
    if (valid) {
      var rect = room.rect;
      var cells = Rect.getCells(rect);
      var edges = Rect.getEdges(rect, true);
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = cells[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var cell = _step2.value;

          rooms.cells[cell] = room.cells[cell] = room;
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

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = edges[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var edge = _step3.value;

          var sharedEdges = rooms.edges[edge] = room.edges[edge] = room.edges[edge] || [];
          sharedEdges.push(room);
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

      rooms.rects[rect] = room;
      rooms.list.push(room);
      total += cells.length;
    }
  } while (valid && total / area < maxRatio);
  return rooms;
}

function findNodes(data) {
  var size = World$$1.getSize(data);
  var nodes = new Set();
  var half = (size - 1) / 2;
  var i = half * half;
  while (i--) {
    var _Cell$fromIndex = Cell.fromIndex(i, half),
        _Cell$fromIndex2 = slicedToArray(_Cell$fromIndex, 2),
        nodeX = _Cell$fromIndex2[0],
        nodeY = _Cell$fromIndex2[1];

    var node = [nodeX * 2 + 1, nodeY * 2 + 1];
    if (World$$1.getAt(data, node) === WALL$2) nodes.add(node.toString());
  }
  return nodes;
}

function findMazes(data) {
  var size = World$$1.getSize(data);
  var mazes = { cells: {}, ends: {}, list: [] };
  var nodes = findNodes(data);

  var _loop = function _loop() {
    var maze = { cells: {}, ends: {}, type: 'maze' };
    var start = Random.choose([].concat(toConsumableArray(nodes)));
    var id = Cell.fromString(start);
    var stack = [id];
    var track = [id];
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
        return World$$1.getAt(data, neighbor) === WALL$2 && !(neighbor.toString() in maze.cells);
      });
      if (neighbors.length) {
        var neighbor = Random.choose(neighbors);

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
  };

  while (nodes.size) {
    _loop();
  }
  return mazes;
}

function findConnectors(data, rooms, mazes) {
  var connectors = {};
  for (var id in rooms.edges) {
    var cell = Cell.fromString(id);
    var neighbors = Cell.getNeighbors(cell);
    var regions = [];
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = neighbors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var neighbor = _step4.value;

        var _neighbor2 = slicedToArray(neighbor, 2),
            x = _neighbor2[0],
            y = _neighbor2[1];

        if (x % 2 && y % 2 && World$$1.getAt(data, neighbor) === FLOOR$2) {
          var region = rooms.cells[neighbor] || mazes.cells[neighbor];
          if (region) regions.push(region);
        }
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

    if (regions.length === 2) connectors[cell] = regions;
  }
  return connectors;
}

function findDoors(data, rooms, mazes) {

  var disconnected = new Set(rooms.list);

  var connectorRegions = findConnectors(data, rooms, mazes);
  var start = Random.choose(rooms.list);
  var stack = [start];
  var track = [start]; // Queue for backtracking
  var total = [start]; // Total list of regions
  var doors = []; // Resulting doors

  // Connectors store the `regions` they connect; get the one that's not `node`
  function getNext(regions, node) {
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = regions[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var region = _step5.value;

        if (region !== node) return region;
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

    return null;
  }

  // Get the valid connectors of the specified `node`
  function getConnectors(node) {
    var connectors = {};
    var prospects = [];
    // Normalize based on type
    if (node.type === 'room') {
      for (var id in node.edges) {
        if (id in connectorRegions) prospects.push(id);
      }
    } else if (node.type === 'maze') {
      for (var _id in node.ends) {
        var cell = Cell.fromString(_id);
        var neighbors = Cell.getNeighbors(cell).map(Cell.toString);
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = neighbors[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var neighbor = _step6.value;

            if (neighbor in connectorRegions) prospects.push(neighbor);
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
      }
    }
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = prospects[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var _id2 = _step7.value;

        var regions = connectorRegions[_id2];
        var next = getNext(regions, node);
        if (next) {
          var chance = Random.choose(25);
          if (chance || !total.includes(next)) connectors[_id2] = next;
        }
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

    return connectors;
  }

  while (stack.length) {
    var node = stack.pop();
    if (node.type === 'room' && disconnected.has(node)) disconnected.delete(node);
    var connectors = getConnectors(node);
    var connectorKeys = Object.keys(connectors);
    if (connectorKeys.length) {
      var connector = Random.choose(connectorKeys);
      // console.log(connector)
      var next = connectors[connector];
      if (next) {
        // Remove extraneous connectors
        for (var id in next.cells) {
          var cell = Cell.fromString(id);
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
        doors.push(connector);
        stack.push(next);
        track.push(next);
        total.push(next);
      }
    } else {
      if (track.length) stack.push(track.pop());
    }
  }

  var _iteratorNormalCompletion9 = true;
  var _didIteratorError9 = false;
  var _iteratorError9 = undefined;

  try {
    for (var _iterator9 = disconnected[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
      var room = _step9.value;

      var edges = Object.keys(room.edges).filter(function (edge) {
        return edge in connectorRegions;
      });
      if (edges.length) {
        var edge = Random.choose(edges);
        doors.push(edge);
      }
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

  return doors;
}

function fillEnds(data, ends) {
  var stack = Object.keys(ends).map(Cell.fromString);
  while (stack.length) {
    var cell = stack.pop();
    var neighbors = Cell.getNeighbors(cell);
    var escapes = [];
    var _iteratorNormalCompletion10 = true;
    var _didIteratorError10 = false;
    var _iteratorError10 = undefined;

    try {
      for (var _iterator10 = neighbors[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
        var neighbor = _step10.value;

        var id = World$$1.getAt(data, neighbor);
        if (id === FLOOR$2 || id === DOOR$2) escapes.push(neighbor);
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

    if (escapes.length === 1) {
      World$$1.setAt(data, cell, WALL$2);
      stack.push(escapes[0]);
    }
  }
}

function createDungeon(size) {

  if (!size % 2) throw new RangeError('Cannot create dungeon of even size ' + size);

  var data = World$$1.fill(World$$1.create(size));
  var entities = new Set();
  var spawns = [];

  var rooms = findRooms(data);
  var _iteratorNormalCompletion11 = true;
  var _didIteratorError11 = false;
  var _iteratorError11 = undefined;

  try {
    for (var _iterator11 = rooms.list[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
      var _room2 = _step11.value;

      for (var id in _room2.cells) {
        World$$1.setAt(data, Cell.fromString(id), FLOOR$2);
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

  var mazes = findMazes(data);
  var _iteratorNormalCompletion12 = true;
  var _didIteratorError12 = false;
  var _iteratorError12 = undefined;

  try {
    for (var _iterator12 = mazes.list[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
      var _maze = _step12.value;

      for (var _id3 in _maze.cells) {
        World$$1.setAt(data, Cell.fromString(_id3), FLOOR$2);
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

  var doors = findDoors(data, rooms, mazes);
  var _iteratorNormalCompletion13 = true;
  var _didIteratorError13 = false;
  var _iteratorError13 = undefined;

  try {
    for (var _iterator13 = doors[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
      var _id4 = _step13.value;

      World$$1.setAt(data, Cell.fromString(_id4), DOOR$2);
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

  fillEnds(data, mazes.ends);

  while (spawns.length < 10) {
    var room = Random.choose(rooms.list);
    var cell = Random.choose(room.cells);
    if (!spawns.includes(cell)) spawns.push(cell);
  }
  spawns = spawns.map(Cell.fromString);

  function spawn(item, cell) {
    if (!cell) {
      var _room = Random.choose(world.rooms.list);
      cell = Cell.fromString(Random.choose(_room.cells));
    }
    if (!isNaN(item)) {
      World$$1.setAt(world.data, cell, item);
    } else if ((typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
      item.world = world;
      item.cell = cell;
      item.look();
      entities.add(item);
    }
    return cell;
  }

  var props = { size: size, data: data, rooms: rooms, entities: entities, spawns: spawns };
  var methods = { spawn: spawn };

  var world = Object.assign({}, props, methods);
  return world;
}

var WORLD_SIZE = 25;
var STAIRS = World$$1.STAIRS;


var sprites = {
  none: {},
  floor: {
    char: String.fromCharCode(183),
    color: 'olive'
  },
  wall: {
    char: '#',
    color: 'darkslategray'
  },
  door: {
    char: '+',
    color: 'sienna'
  },
  door_open: {
    char: '/',
    color: 'sienna'
  },
  stairs: {
    char: '>',
    color: 'white'
  },
  hero: {
    char: '@',
    color: 'white'
  }
};

function generate() {
  var world = Generator$$1.createDungeon(WORLD_SIZE);
  var hero = Entity$$1.create(sprites.hero);
  world.spawn(hero);
  world.spawn(STAIRS);
  return { world: world, hero: hero };
}

new Vue({
  el: '#app',
  data: generate,
  methods: {
    onclick: function onclick(index) {
      var world = this.world,
          hero = this.hero;

      var cell = hero.cell;
      var targetX = index % WORLD_SIZE;
      var targetY = (index - targetX) / WORLD_SIZE;
      var target = [targetX, targetY];

      if (Cell.isEqual(cell, target)) {
        if (World$$1.getAt(world.data, cell) === STAIRS) {
          this.descend();
        }
        return;
      }

      if (!hero.known[target]) return;

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
          hero = this.hero;

      var view = [];
      world.data.forEach(function (id, index) {
        var cell = Cell.fromIndex(index, WORLD_SIZE);
        var char = ' ';
        var color = 'gray';
        var tile = hero.known[cell];
        if (tile) {
          var sprite = sprites[tile];
          char = sprite.char;
          if (hero.seeing[cell]) color = sprite.color;
        }
        view.push({ char: char, color: color });
      });
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = world.entities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var entity = _step.value;

          var index = Cell.toIndex(entity.cell, WORLD_SIZE);
          view[index] = entity.sprite;
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

      return view;
    }
  },
  mounted: function mounted() {
    this.$el.style.fontSize = 'calc(100vmin / ' + WORLD_SIZE + ')';
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

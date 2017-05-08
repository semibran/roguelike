(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

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











var toArray = function (arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
};

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var directions = {
  LEFT: [-1, 0],
  UP_LEFT: [-1, -1],
  UP: [0, -1],
  UP_RIGHT: [1, -1],
  RIGHT: [1, 0],
  DOWN_RIGHT: [1, 1],
  DOWN: [0, 1],
  DOWN_LEFT: [-1, 1]
};
var LEFT$1 = directions.LEFT;
var UP$1 = directions.UP;
var RIGHT$1 = directions.RIGHT;
var DOWN$1 = directions.DOWN;

var cardinalDirections = { LEFT: LEFT$1, UP: UP$1, RIGHT: RIGHT$1, DOWN: DOWN$1 };

var Cell = {
  directions: directions, cardinalDirections: cardinalDirections,
  isCell: isCell, isEqual: isEqual, isEdge: isEdge, isInside: isInside, isNeighbor: isNeighbor, toString: toString, fromString: fromString, toIndex: toIndex, fromIndex: fromIndex, getNeighbors: getNeighbors, getManhattan: getManhattan, getDistance: getDistance
};

function isCell(value) {
  return value && Array.isArray(value) && value.length === 2 && !value.filter(function (value) {
    return isNaN(value) || typeof value !== 'number';
  }).length;
}

function isEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1];
}

function isEdge(cell, size) {
  var _cell = slicedToArray(cell, 2),
      x = _cell[0],
      y = _cell[1];

  var rect = [0, 0, size, size];
  if (Array.isArray(size)) rect = size;

  var _rect = rect,
      _rect2 = slicedToArray(_rect, 4),
      rectX = _rect2[0],
      rectY = _rect2[1],
      rectWidth = _rect2[2],
      rectHeight = _rect2[3];

  return isInside(cell, size) && (x === rectX || x === rectX + rectWidth - 1 || y === rectY || y === rectY + rectHeight - 1);
}

function isInside(cell, size) {
  var _cell2 = slicedToArray(cell, 2),
      x = _cell2[0],
      y = _cell2[1];

  var rect = [0, 0, size, size];
  if (Array.isArray(size)) rect = size;

  var _rect3 = rect,
      _rect4 = slicedToArray(_rect3, 4),
      rectX = _rect4[0],
      rectY = _rect4[1],
      rectWidth = _rect4[2],
      rectHeight = _rect4[3];

  return x >= rectX && y >= rectY && x < rectX + rectWidth && y < rectY + rectHeight;
}

function isNeighbor(cell, other) {
  var _cell3 = slicedToArray(cell, 2),
      cx = _cell3[0],
      cy = _cell3[1];

  var _other = slicedToArray(other, 2),
      ox = _other[0],
      oy = _other[1];

  var dx = Math.abs(ox - cx);
  var dy = Math.abs(oy - cy);
  return (!dx || dx === 1) && (!dy || dy === 1);
}

function toString(cell) {
  return cell.toString();
}

function fromString(string) {
  return string.split(',').map(Number);
}

function toIndex(cell, size) {
  var _cell4 = slicedToArray(cell, 2),
      x = _cell4[0],
      y = _cell4[1];

  return y * size + x;
}

function fromIndex(index, size) {
  var x = index % size;
  var y = (index - x) / size;
  return [x, y];
}

function getNeighbors(cell, diagonals, step) {
  if (!isCell(cell)) throw new TypeError('Cannot get neighbors of cell \'' + cell + '\'');
  step = step || 1;

  var _cell5 = slicedToArray(cell, 2),
      x = _cell5[0],
      y = _cell5[1];

  var neighbors = [];
  var dirs = cardinalDirections;
  if (diagonals) dirs = directions;
  for (var key in dirs) {
    var _dirs$key = slicedToArray(dirs[key], 2),
        dx = _dirs$key[0],
        dy = _dirs$key[1];

    var current = [x + dx * step, y + dy * step];
    var cx = current[0],
        cy = current[1];

    neighbors.push([cx, cy]);
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

function getDistance(a, b, sqrt) {
  if (typeof sqrt === 'undefined') sqrt = true;

  var _a2 = slicedToArray(a, 2),
      ax = _a2[0],
      ay = _a2[1];

  var _b2 = slicedToArray(b, 2),
      bx = _b2[0],
      by = _b2[1];

  var dx = bx - ax,
      dy = by - ay;

  var squared = dx * dx + dy * dy;
  if (sqrt) return Math.sqrt(squared);
  return squared;
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

var cache = {};

var Diamond$$1 = { getCells: getCells$1, getEdges: getEdges$1, getCenter: getCenter$1 };

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

function getCells$1(diamond) {
  return getCached(diamond).cells;
}

function getEdges$1(diamond) {
  return getCached(diamond).edges;
}

function getCenter$1(diamond) {
  return getCached(diamond).center;
}

var cache$1 = {};

var Circle$$1 = { getCells: getCells$2, getEdges: getEdges$2, getCenter: getCenter$2 };

function parse(circle) {
  var _circle = slicedToArray(circle, 3),
      x = _circle[0],
      y = _circle[1],
      radius = _circle[2];

  var start = [x, y];

  var cells = {};
  var edges = {};

  var edgeRadius = radius + 1;
  var edgeMax = edgeRadius * edgeRadius;

  var max = radius * radius;
  var size = edgeRadius * 2 + 1;
  var area = size * size;
  var i = area;
  while (i--) {
    var _Cell$fromIndex = Cell.fromIndex(i, size),
        _Cell$fromIndex2 = slicedToArray(_Cell$fromIndex, 2),
        cx = _Cell$fromIndex2[0],
        cy = _Cell$fromIndex2[1];

    var cell = [cx + x - edgeRadius, cy + y - edgeRadius];
    var dist = Cell.getDistance(cell, start, false);
    if (dist > max) {
      if (dist > edgeMax && !(cell in cells)) continue;
      edges[cell] = true;
      continue;
    }
    cells[cell] = true;
  }

  cells = Object.keys(cells).map(Cell.fromString);
  edges = Object.keys(edges).map(Cell.fromString);

  return { cells: cells, edges: edges, center: start };
}

function getCached$1(circle) {
  var cached = cache$1[circle];
  if (!cached) cached = cache$1[circle] = parse(circle);
  return cached;
}

function getCells$2(circle) {
  return getCached$1(circle).cells;
}

function getEdges$2(circle) {
  return getCached$1(circle).edges;
}

function getCenter$2(circle) {
  return getCached$1(circle).center;
}

var tileData = ['floor walkable', 'wall opaque', 'door opaque door', 'doorOpen walkable door', 'doorSecret opaque door secret', 'entrance walkable stairs', 'exit walkable stairs'];

var tiles = function (tileData) {
  var tiles = [];
  var i = tileData.length;
  while (i--) {
    var tile = tiles[i] = { type: 'tile', id: i };

    var _tileData$i$split = tileData[i].split(' '),
        _tileData$i$split2 = toArray(_tileData$i$split),
        kind = _tileData$i$split2[0],
        props = _tileData$i$split2.slice(1);

    tile.kind = kind;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = props[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var prop = _step.value;

        tile[prop] = true;
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
  return tiles;
}(tileData);

var tileNames = Object.keys(tiles);

var tileIds = function (tiles) {
  var tileIds = {};
  var i = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = tiles[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var tile = _step2.value;

      var id = tile.kind.split('').reduce(function (result, char, index) {
        var CHAR = char.toUpperCase();
        if (char === CHAR || !index) result[result.length] = '';
        result[result.length - 1] += CHAR;
        return result;
      }, []).join('_');
      tileIds[id] = i;
      i++;
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

  return tileIds;
}(tiles);

var tileCosts = function (tiles) {
  var tileCosts = [];
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = tiles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var tile = _step3.value;

      var cost = 0;
      if (!tile.walkable && !tile.door) cost = Infinity;
      if (tile.secret) cost = 1000;
      if (tile.door) {
        cost++;
        if (!tile.walkable) cost++;
      }
      tileCosts.push(cost);
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

  return tileCosts;
}(tiles);

var WALL = tileIds.WALL;


var World$$1 = {
  tiles: tiles, tileNames: tileNames, tileIds: tileIds, tileCosts: tileCosts,
  create: create
};

function create(size) {

  var area = size * size;
  var data = new Uint8ClampedArray(area);

  var world = {
    size: size, data: data, elements: new Set(), entrance: null, exit: null,
    getAt: getAt, tileAt: tileAt, elementsAt: elementsAt, setAt: setAt, fill: fill, clear: clear, spawn: spawn, kill: kill, findPath: findPath, findStep: findStep
  };

  return world;

  function getAt(cell) {
    if (!Cell.isInside(cell, size)) return null;
    var index = Cell.toIndex(cell, size);
    return data[index];
  }

  function tileAt(cell) {
    return tiles[getAt(cell)];
  }

  function elementsAt(cell) {
    return [].concat(toConsumableArray(world.elements)).filter(function (element) {
      return Cell.isEqual(cell, element.cell);
    });
  }

  function setAt(cell, value) {
    if (!Cell.isInside(cell, size)) return null;
    var index = Cell.toIndex(cell, size);
    data[index] = value;
    return value;
  }

  function fill(rect, value) {

    if (!Array.isArray(rect)) rect = [0, 0, size, size];

    if (isNaN(value)) value = WALL;

    var _rect = rect,
        _rect2 = slicedToArray(_rect, 4),
        rectX = _rect2[0],
        rectY = _rect2[1],
        rectWidth = _rect2[2],
        rectHeight = _rect2[3];

    var area = rectWidth * rectHeight;

    var i = area;
    while (i--) {
      var _Cell$fromIndex = Cell.fromIndex(i, rectWidth),
          _Cell$fromIndex2 = slicedToArray(_Cell$fromIndex, 2),
          x = _Cell$fromIndex2[0],
          y = _Cell$fromIndex2[1];

      var index = Cell.toIndex([x + rectX, y + rectY], size);
      data[index] = value;
    }

    return world;
  }

  function clear(rect) {
    return world;
  }

  function spawn(element, cell) {
    element.world = world;
    element.cell = cell;
    world.elements.add(element);
  }

  function kill(element) {
    return world.elements.delete(element);
  }

  function findPath(start, goal, costs, diagonals) {

    if (!costs) costs = {};

    if (!costs.tiles) costs.tiles = tileCosts;

    if (!costs.cells) costs.cells = {};

    var path = [];

    var startKey = start.toString();
    var goalKey = goal.toString();

    var opened = [startKey];
    var closed = {};

    var scores = { f: {}, g: {} };
    var parent = {};

    var cells = data.map(function (id, index) {
      return Cell.fromIndex(index, size);
    });
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = cells[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var _cell2 = _step4.value;

        scores.g[_cell2] = Infinity;
        scores.f[_cell2] = Infinity;
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
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = Cell.getNeighbors(cell, diagonals)[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var neighbor = _step5.value;

          if (!Cell.isInside(neighbor, size) || neighbor in closed) continue;
          var key = neighbor.toString();
          var tileCost = costs.tiles[getAt(neighbor)] || 0;
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
    }

    return null;
  }

  function findStep(path, cell) {
    if (!path) return null;
    var next = void 0,
        index = 0;
    do {
      next = path[index++];
    } while (next && !Cell.isEqual(cell, next));
    next = path[index];
    if (!next) return null;

    var _cell3 = slicedToArray(cell, 2),
        cx = _cell3[0],
        cy = _cell3[1];

    var _next = next,
        _next2 = slicedToArray(_next, 2),
        nx = _next2[0],
        ny = _next2[1];

    var step = [nx - cx, ny - cy];
    return step;
  }
}

var _World$tileIds$1 = World$$1.tileIds;
var DOOR$1 = _World$tileIds$1.DOOR;
var DOOR_OPEN$1 = _World$tileIds$1.DOOR_OPEN;
var ENTRANCE$2 = _World$tileIds$1.ENTRANCE;
var EXIT$2 = _World$tileIds$1.EXIT;


var Actor$$1 = { create: create$1 };

function create$1(options) {

  var actor = {
    kind: null,
    faction: null,
    speed: 1 / 2,
    intel: 1 / 2,
    vision: 7
  };

  Object.assign(actor, options, {
    type: 'actor', world: null, cell: null, path: null, energy: 0, health: 1, known: {}, seeing: {},
    perform: perform, move: move, attack: attack, collect: collect, open: open, descend: descend, ascend: ascend, look: look
  });

  return actor;

  function perform(action) {
    var kind = action.kind,
        data = action.data;

    switch (kind) {
      case 'move':
        return move.apply(undefined, toConsumableArray(data));
      case 'attack':
        return attack.apply(undefined, toConsumableArray(data));
      case 'collect':
        return collect.apply(undefined, toConsumableArray(data));
      case 'open':
        return open.apply(undefined, toConsumableArray(data));
      case 'close':
        return close.apply(undefined, toConsumableArray(data));
      case 'descend':
        return descend.apply(undefined, toConsumableArray(data));
      case 'ascend':
        return ascend.apply(undefined, toConsumableArray(data));
      case 'wait':
        return true;
    }
    throw new TypeError('Unrecognized action kind: ' + kind);
    return null;
  }

  function move(direction) {
    if (!actor.cell) throw new TypeError('Cannot move actor ' + actor.kind + ' of cell ' + actor.cell);

    var _actor$cell = slicedToArray(actor.cell, 2),
        cx = _actor$cell[0],
        cy = _actor$cell[1];

    var _direction = slicedToArray(direction, 2),
        dx = _direction[0],
        dy = _direction[1];

    var target = [cx + dx, cy + dy];
    var tile = actor.world.tileAt(target);
    if (!tile.walkable) if (tile.door && actor.intel >= 1 / 2) return target; // Tile is a door
    else return false; // Can't move to that tile
    var elements = actor.world.elementsAt(target);
    var other = elements.find(function (element) {
      return element.type === 'actor';
    });
    if (other) return other; // There's another actor in the way (sort?)
    actor.cell = target;
    var item = elements.find(function (element) {
      return element.type === 'item';
    });
    if (item) return item; // There's an item on the ground.
    return true; // Successfully moved with no complications
  }

  function attack(target) {
    if (!target || target.type !== 'actor' || !Cell.isNeighbor(actor.cell, target.cell)) return false;
    target.health--;
    if (target.health <= 0) {
      target.health = 0;
      target.world.kill(target);
      target.world.spawn({
        type: 'sprite',
        kind: 'corpse',
        origin: target.kind
      }, target.cell);
    }
    return true; // This action cannot fail
  }

  function collect(target) {
    target.world.kill(target);
  }

  function open(target) {
    if (!Cell.isCell(target) || !Cell.isNeighbor(actor.cell, target)) return false;
    var tile = actor.world.tileAt(target);
    if (!tile.door) return false;
    actor.world.setAt(target, DOOR_OPEN$1);
    return true;
  }

  function close(target) {
    if (!target) {
      var neighbors = Cell.getNeighbors(actor.cell, true).filter(function (neighbor) {
        return actor.world.getAt(neighbor) === DOOR_OPEN$1;
      });
      if (!neighbors.length) return false;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = neighbors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var neighbor = _step.value;

          actor.world.setAt(neighbor, DOOR$1);
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

      return true;
    } else {
      if (!Cell.isCell(target) || !Cell.isNeighbor(actor.cell, target)) return false;
      var tile = actor.world.tileAt(target);
      if (!tile.door) return false;
      actor.world.setAt(target, DOOR$1);
      return true;
    }
  }

  function descend() {
    var id = actor.world.getAt(actor.cell);
    if (id === EXIT$2) return true;
    return false;
  }

  function ascend() {
    var id = actor.world.getAt(actor.cell);
    if (id === ENTRANCE$2) return true;
    return false;
  }

  function look() {
    var cells = FOV$$1.get(actor.world, actor.cell, actor.vision);
    actor.seeing = {};
    if (!actor.known[actor.worldId]) actor.known[actor.worldId] = {};
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = cells[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var cell = _step2.value;

        var kind = actor.world.tileAt(cell).kind;
        var other = actor.world.elementsAt(cell)[0];
        if (other) kind = other.kind;
        actor.known[actor.worldId][cell] = kind;
        actor.seeing[cell] = true;
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
  }
}

var Item = { create: create$2 };

function create$2(options) {

  var item = {
    kind: null,
    value: 0
  };

  Object.assign(item, options, {
    type: 'item'
  });

  return item;
}

var AI$$1 = { create: create$3 };

function create$3(rng) {

  return { getAction: getAction };

  function getAction(actor) {
    if (!actor.goal || Cell.isEqual(actor.cell, actor.goal)) {
      var cells = [].concat(toConsumableArray(actor.world.rooms.list)).filter(function (room) {
        return !room.secret;
      }).reduce(function (cells, room) {
        return cells.concat(room.cells);
      }, []).filter(function (cell) {
        return !Cell.isEqual(actor.cell, cell);
      });
      actor.goal = rng.choose(cells);
      actor.path = actor.world.findPath(actor.cell, actor.goal);
    }
    var step = actor.world.findStep(actor.path, actor.cell);
    if (!step) return null;
    return { type: 'action', kind: 'move', data: [step] };
  }
}

var RNG = create$4();
RNG.create = create$4;

function create$4(initialSeed) {

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

var rng = RNG.create();

var _World$tileIds$2 = World$$1.tileIds;
var FLOOR$1 = _World$tileIds$2.FLOOR;
var DOOR$2 = _World$tileIds$2.DOOR;
var DOOR_SECRET$1 = _World$tileIds$2.DOOR_SECRET;
var ENTRANCE$3 = _World$tileIds$2.ENTRANCE;
var EXIT$3 = _World$tileIds$2.EXIT;


var Dungeon$$1 = { create: create$5 };

function create$5(size, seed, hero) {

  if (size % 2 === 0) throw new RangeError('Cannot create dungeon of even size \'' + size + '\'');

  if (!isNaN(seed)) {
    rng.seed(seed);
  } else {
    rng = seed;
    seed = rng.seed();
  }

  var world = World$$1.create(size).fill();

  var cells = [];
  var rooms = findRooms(size);
  var mazes = findMazes(size, rooms);
  var doors = findDoors(rooms, mazes);
  fillEnds(mazes);

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = rooms.list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var _room = _step.value;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = _room.cells[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _cell = _step4.value;

          cells.push(_cell);
          world.setAt(_cell, FLOOR$1);
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

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = mazes.list[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var maze = _step2.value;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = maze.cells[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _cell2 = _step5.value;

          cells.push(_cell2);
          world.setAt(_cell2, FLOOR$1);
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

  for (var cellId in doors.regions) {
    var cell = Cell.fromString(cellId);
    var type = DOOR$2;
    var regions = doors.regions[cellId];
    var room = regions.sort(function (a, b) {
      return a.neighbors.size - b.neighbors.size;
    })[0];
    var neighbors = Cell.getNeighbors(cell).filter(function (neighbor) {
      return neighbor in mazes.ends;
    });
    if (!neighbors.length && room.neighbors.size === 1 && rng.choose()) {
      type = DOOR_SECRET$1;
      room.secret = true;
    } else if (rng.choose()) type = FLOOR$1;
    world.setAt(cell, type);
  }

  var entrance = spawn(ENTRANCE$3, 'center');
  var exit = spawn(EXIT$3, 'center');

  var enemies = rng.get(3, 5 + 1);
  while (enemies--) {
    spawn(Actor$$1.create({ kind: 'beast', faction: 'monsters', speed: 3 / 8 }));
  }var items = rng.get(6, 10 + 1);
  while (items--) {
    spawn(Item.create({ kind: 'item' }));
  }var secretRooms = rooms.list.filter(function (room) {
    return room.secret;
  });
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = secretRooms[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _room2 = _step3.value;

      var _cells2 = new Set(_room2.cells.filter(function (cell) {
        return world.getAt(cell) === FLOOR$1 && !world.elementsAt(cell).length;
      }).map(Cell.toString));
      if (!_cells2.size) continue;
      while (_cells2.size) {
        var _cellId = rng.choose([].concat(toConsumableArray(_cells2)));
        _cells2.delete(_cellId);
        if (rng.choose(3)) {
          var _cell3 = Cell.fromString(_cellId);
          var item = Item.create({ kind: 'item' });
          spawn(item, _cell3);
        }
      }
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

  Object.assign(world, { cells: cells, rooms: rooms, entrance: entrance, exit: exit });

  return world;

  function spawn(element, cell) {
    var center = void 0;
    if (cell === 'center') {
      cell = null;
      center = true;
    }
    if (!cell) {
      var valid = rooms.list.filter(function (room) {
        return !room.secret;
      });
      var _cells = void 0;
      if (center) _cells = valid.map(function (room) {
        return room.center;
      });else _cells = valid.reduce(function (cells, room) {
        return cells.concat(room.cells);
      }, []);
      _cells = _cells.filter(function (cell) {
        return world.getAt(cell) === FLOOR$1 && !world.elementsAt(cell).length;
      });
      cell = rng.choose(_cells);
    }
    if (element) {
      if (!isNaN(element)) world.setAt(cell, element);else world.spawn(element, cell);
    }
    return cell;
  }
}

function findNodes(size, invalid, cells) {

  var nodes = [];

  function isInvalid(cell) {
    return invalid && (cell in invalid || Cell.getNeighbors(cell, true).filter(function (neighbor) {
      return neighbor in invalid;
    }).length);
  }

  var i = size * size;

  var _loop = function _loop() {
    var cell = void 0,
        _cell4 = cell = Cell.fromIndex(i, size),
        _cell5 = slicedToArray(_cell4, 2),
        x = _cell5[0],
        y = _cell5[1];
    if (x % 2 === 0 || y % 2 === 0 || isInvalid(cell)) return 'continue';
    if (cells) {
      var translated = cells.map(function (cell) {
        return [cell[0] + x, cell[1] + y];
      });
      var intersecting = translated.filter(function (cell) {
        return !Cell.isInside(cell, size) || Cell.isEdge(cell, size) || isInvalid(cell);
      });
      if (intersecting.length) return 'continue';
    }
    nodes.push(cell);
  };

  while (i--) {
    var _ret = _loop();

    if (_ret === 'continue') continue;
  }

  return nodes;
}

function findRooms(size) {

  var area = size * size;

  var rooms = { cells: {}, edges: {}, list: [] };

  var min = 3,
      max = 7;
  var total = 0;
  var ratio = void 0;

  do {

    var kind = void 0,
        matrix = void 0,
        cells = void 0,
        edges = void 0,
        nodes = void 0;
    var fails = 0;
    var failsMax = size;

    do {

      kind = 'rect';
      if (rng.choose(10)) kind = 'diamond';else if (rng.choose(20)) kind = 'circle';

      if (kind === 'rect') {
        var _size = void 0,
            _size2 = _size = [rng.get((max - min) / 2 + 1) * 2 + min, rng.get((max - min) / 2 + 1) * 2 + min],
            _size3 = slicedToArray(_size2, 2),
            width = _size3[0],
            height = _size3[1];
        matrix = [0, 0].concat(toConsumableArray(_size));
        cells = Rect.getCells(matrix);
      } else if (kind === 'diamond') {
        var radius = rng.choose([2, 3, 4]);
        matrix = [radius, radius, radius];
        cells = Diamond$$1.getCells(matrix);
      } else if (kind === 'circle') {
        var _radius = rng.choose([3, 4]);
        matrix = [_radius, _radius, _radius];
        cells = Circle$$1.getCells(matrix);
      }

      nodes = findNodes(size, Object.assign({}, rooms.cells, rooms.edges), cells);

      if (nodes.length) break;

      fails++;
    } while (fails < failsMax);

    if (!nodes.length) break;

    var _rng$choose = rng.choose(nodes),
        _rng$choose2 = slicedToArray(_rng$choose, 2),
        _x = _rng$choose2[0],
        _y = _rng$choose2[1];

    matrix[0] += _x;
    matrix[1] += _y;

    var center = void 0;
    if (kind === 'rect') {
      cells = Rect.getCells(matrix);
      edges = Rect.getEdges(matrix, true);
      center = Rect.getCenter(matrix);
    } else if (kind === 'diamond') {
      var _matrix, _matrix2;

      cells = Diamond$$1.getCells(matrix);
      edges = Diamond$$1.getEdges(matrix);
      center = (_matrix = matrix, _matrix2 = slicedToArray(_matrix, 2), _x = _matrix2[0], _y = _matrix2[1], _matrix);
    } else if (kind === 'circle') {
      var _matrix3, _matrix4;

      cells = Circle$$1.getCells(matrix);
      edges = Circle$$1.getEdges(matrix);
      center = (_matrix3 = matrix, _matrix4 = slicedToArray(_matrix3, 2), _x = _matrix4[0], _y = _matrix4[1], _matrix3);
    }

    var room = { type: 'room', kind: kind, matrix: matrix, cells: cells, edges: edges, center: center };

    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = cells[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var cell = _step6.value;

        rooms.cells[cell] = room;
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
      for (var _iterator7 = edges[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var _cell6 = _step7.value;

        rooms.edges[_cell6] = room;
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

    rooms.list.push(room);

    total += cells.length;
    ratio = total / area;
  } while (ratio < 0.33);

  return rooms;
}

function findMazes(size, rooms) {

  var mazes = { cells: {}, ends: {}, list: [] };
  var nodes = new Set(findNodes(size, rooms.cells).map(Cell.toString));

  var step = 2;

  while (nodes.size) {

    var maze = { type: 'maze', cells: [], ends: [] };

    var start = Cell.fromString(rng.choose([].concat(toConsumableArray(nodes))));
    var stack = [start];
    var backtracking = false;

    while (stack.length) {

      var cell = stack[stack.length - 1];
      mazes.cells[cell] = maze;
      maze.cells.push(cell);
      nodes.delete(cell.toString());

      var neighbors = Cell.getNeighbors(cell, false, step).filter(function (neighbor) {
        return nodes.has(neighbor.toString());
      });

      if (neighbors.length) {
        var neighbor = rng.choose(neighbors);

        var _cell7 = slicedToArray(cell, 2),
            cx = _cell7[0],
            cy = _cell7[1];

        var _neighbor = slicedToArray(neighbor, 2),
            nx = _neighbor[0],
            ny = _neighbor[1];

        var midpoint = [cx + (nx - cx) / step, cy + (ny - cy) / step];
        mazes.cells[midpoint] = maze;
        maze.cells.push(midpoint);
        stack.push(neighbor);
        if (cell === start && !backtracking) {
          mazes.ends[cell] = maze;
          maze.ends.push(cell);
        }
        backtracking = false;
      } else {
        if (!backtracking) {
          mazes.ends[cell] = maze;
          maze.ends.push(cell);
        }
        backtracking = true;
        stack.pop();
      }
    }

    mazes.list.push(maze);
  }

  return mazes;
}

function findDoors(rooms, mazes) {
  var connectorRegions = getConnectors(rooms, mazes);

  var start = rng.choose(rooms.list);
  var stack = [start];
  var doors = {};
  var main = new Set();
  var dead = new Set();

  var regions = rooms.list.concat(mazes.list);
  var _iteratorNormalCompletion8 = true;
  var _didIteratorError8 = false;
  var _iteratorError8 = undefined;

  try {
    for (var _iterator8 = regions[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
      var region = _step8.value;

      region.neighbors = new Map();
      region.doors = {};
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

  var _loop2 = function _loop2() {
    var node = stack[stack.length - 1];
    main.add(node);

    var connectors = void 0;
    if (node.type === 'room') connectors = node.edges.filter(function (cell) {
      if (!(cell in connectorRegions)) return false;
      var next = connectorRegions[cell].find(function (region) {
        return region !== node;
      });
      return !dead.has(next) && next.cells.length > 1;
    });else if (node.type === 'maze') connectors = node.cells.reduce(function (result, cell) {
      return result.concat(Cell.getNeighbors(cell).filter(function (neighbor) {
        return neighbor in connectorRegions;
      }));
    }, []);

    connectors = connectors.filter(function (cell) {
      var next = connectorRegions[cell].find(function (region) {
        return region !== node;
      });
      var nearby = Cell.getNeighbors(cell, true).filter(function (neighbor) {
        return neighbor in doors;
      });
      return !(cell in doors) && !node.neighbors.has(next) && (!main.has(next) || rng.choose(3)) && !nearby.length;
    });

    var connectorIds = connectors.map(Cell.toString);

    if (connectors.length) {
      var door = rng.choose(connectors);
      var _regions = connectorRegions[door];
      var next = _regions.find(function (region) {
        return region !== node;
      });
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = next.cells[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var cell = _step9.value;

          Cell.getNeighbors(cell).forEach(function (neighbor) {
            if (connectorIds.includes(neighbor.toString())) {
              delete connectorRegions[neighbor];
            }
          });
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

      stack.push(next);
      doors[door] = _regions;
      main.add(node);
      connect(node, next, door);
    } else {
      stack.pop();
      if (node.type === 'maze' && node.neighbors.size === 1) {
        var _next = node.neighbors.entries().next().value[0];
        var _cell8 = node.neighbors.get(_next);
        delete doors[_cell8];
        disconnect(node, _next);
        main.delete(node);
        dead.add(node);
      }
    }
  };

  while (stack.length) {
    _loop2();
  }

  doors = {
    regions: doors,
    list: Object.keys(doors).map(Cell.fromString)
  };

  return doors;
}

function getConnectors(rooms, mazes) {
  var connectorRegions = {};
  Object.keys(rooms.edges).map(Cell.fromString).forEach(function (edge) {
    var regions = new Set(Cell.getNeighbors(edge).filter(function (neighbor) {
      return neighbor in rooms.cells || neighbor in mazes.cells;
    }).map(function (neighbor) {
      return rooms.cells[neighbor] || mazes.cells[neighbor];
    }));
    if (regions.size >= 2) connectorRegions[edge] = [].concat(toConsumableArray(regions));
  });
  return connectorRegions;
}

function connect(node, next, door) {
  connectOne(node, next, door);
  connectOne(next, node, door);
}

function connectOne(node, next, door) {
  node.neighbors.set(next, door);
  node.doors[door] = next;
}

function disconnect(node, next) {
  disconnectOne(node, next);
  disconnectOne(next, node);
}

function disconnectOne(node, next) {
  var connector = node.neighbors.get(next);
  delete node.doors[connector];
}

function fillEnds(mazes) {
  mazes.ends = {};
  var _iteratorNormalCompletion10 = true;
  var _didIteratorError10 = false;
  var _iteratorError10 = undefined;

  try {
    var _loop3 = function _loop3() {
      var maze = _step10.value;

      var cells = new Set(maze.cells.map(Cell.toString));
      var ends = [];
      var stack = maze.ends;
      while (stack.length) {
        var cell = stack.pop();
        var neighbors = Cell.getNeighbors(cell).filter(function (neighbor) {
          return neighbor in mazes.cells || neighbor in maze.doors;
        });
        if (neighbors.length > 1) {
          ends.push(cell);
          continue;
        }
        cells.delete(cell.toString());
        delete mazes.cells[cell];
        var next = neighbors[0];
        if (next) stack.unshift(next);
      }
      maze.cells = [].concat(toConsumableArray(cells)).map(Cell.fromString);
      maze.ends = ends = ends.filter(function (cell) {
        return cell in mazes.cells && Cell.getNeighbors(cell).filter(function (neighbor) {
          return neighbor in mazes.cells;
        }).length === 1;
      });
      ends.forEach(function (cell) {
        return mazes.ends[cell] = maze;
      });
    };

    for (var _iterator10 = mazes.list[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
      _loop3();
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

var FOV$$1 = { get: get$1 };

function get$1(world, start, range) {
  var cells = [];
  var i = 8;
  while (i--) {
    cells = cells.concat(getOctant(world, start, range, i));
  }cells.push(start);
  return cells;
}

function getOctant(world, start, range, octant) {
  range = range || Infinity;
  var size = world.size;

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
            if (world.tileAt(_cell).opaque) {
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

var eventCallbacks = {};

var SUCCESS = true;
var FAILURE = false;

var Game$$1 = { create: create$6 };

function create$6(size, seed) {

  var rng = RNG.create(seed);
  var ai = AI$$1.create(rng);

  var index = 0;

  var game = {
    rng: rng, world: {}, floor: null, hero: null,
    start: start, on: on, off: off, input: input
  };

  return game;

  function start() {
    game.world = {};
    game.floor = 0;
    game.hero = Actor$$1.create({ kind: 'human', faction: 'hero' });
    descend();
    output('start');
    return game;
  }

  function tick() {
    var actor = void 0,
        actors = [].concat(toConsumableArray(game.world[game.floor].elements)).filter(function (element) {
      return element.type === 'actor';
    });
    if (!actors.length) return null;
    while (game.hero.health) {
      index = index % actors.length;
      actor = actors[index];
      if (actor.health) {
        if (actor.energy < 1) actor.energy += actor.speed;
        while (actor.energy >= 1) {
          actor.look();
          var action = actor.action;
          if (!action) {
            if (actor === game.hero) return output('tick');
            action = ai.getAction(actor);
            if (!action) return output('tick');
          }
          var _action = action,
              kind = _action.kind,
              data = _action.data;

          var result = actor.perform(action);
          if (result !== SUCCESS) {
            if (!result || result === FAILURE) {
              if (actor === game.hero) return output.apply(undefined, [kind + '-fail', actor].concat(toConsumableArray(data)));
            }
            if (result.type === 'actor') {
              actor.attack(result);
              kind = 'attack';
              data = [result];
            } else if (result.type === 'item') {
              output.apply(undefined, [kind, actor].concat(toConsumableArray(data)));
              actor.collect(result);
              kind = 'item';
              data = [result];
            } else if (Cell.isCell(result)) {
              actor.open(result);
              kind = 'open';
              data = [result];
            }
          } else {
            if (kind === 'descend' || kind === 'ascend') {
              actor.action = null;
              if (kind === 'descend') result = descend();else if (kind === 'ascend') result = ascend();
              if (result === FAILURE) {
                output.apply(undefined, [kind + '-fail', actor].concat(toConsumableArray(data)));
                return;
              }
            }
          }
          actor.action = null;
          actor.energy--;
          if (result !== FAILURE) output.apply(undefined, [kind, actor].concat(toConsumableArray(data)));
        }
      }
      index++;
    }
    game.hero.look();
    return output('tick');
  }

  function descend() {
    if (game.hero.world) game.hero.world.kill(game.hero);
    game.floor++;
    var floor = void 0;
    if (game.world[game.floor]) floor = game.world[game.floor];else {
      floor = Dungeon$$1.create(size, rng);
      game.world[game.floor] = floor;
    }
    floor.spawn(game.hero, floor.entrance);
    game.hero.worldId = game.floor;
    tick();
    return true;
  }

  function ascend() {
    if (!game.world[game.floor - 1]) return false;
    game.hero.world.kill(game.hero);
    game.floor--;
    var floor = game.world[game.floor];
    floor.spawn(game.hero, floor.exit);
    game.hero.worldId = game.floor;
    tick();
    return true;
  }

  function on(event, callback) {
    var events = event;
    if (!Array.isArray(event)) events = [event];
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _event = _step.value;

        var callbacks = eventCallbacks[_event];
        if (!callbacks) callbacks = eventCallbacks[_event] = new Set();
        callbacks.add(callback);
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

    return game;
  }

  function off(event, callback) {
    var callbacks = eventCallbacks[event];
    if (!callbacks) return false;
    callbacks.delete(callback);
    return true;
  }

  function input(kind) {
    for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      data[_key - 1] = arguments[_key];
    }

    if (!game.hero.health) return false;
    game.hero.action = { type: 'action', kind: kind, data: data };
    tick();
    return true;
  }

  function output(event) {
    var callbacks = eventCallbacks[event];
    if (!callbacks) return false;

    for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      data[_key2 - 1] = arguments[_key2];
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = callbacks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var callback = _step2.value;

        callback.apply(undefined, data);
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
}

var Display$$1 = { create: create$7 };

function create$7(size) {

  var canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;

  var context = canvas.getContext('2d');

  var display = {
    size: size, context: context,
    mount: mount, render: render
  };

  return display;

  function mount(element) {

    if (typeof element === 'string') element = document.querySelector(element);

    if (!element) throw new TypeError('Cannot mount display on element \'' + element + '\'');

    element.appendChild(canvas);

    return display;
  }

  function render(worldData) {

    var cells = Object.keys(worldData).map(Cell.fromString);

    var imageData = context.createImageData(size, size);
    var data = imageData.data;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var cell = _step.value;

        var index = Cell.toIndex(cell, size);
        var i = index * 4;
        var color = worldData[cell];
        if (!color) continue;

        var _color = slicedToArray(color, 3),
            red = _color[0],
            green = _color[1],
            blue = _color[2];

        data[i] = red;
        data[i + 1] = green;
        data[i + 2] = blue;
        data[i + 3] = 255;
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

    context.putImageData(imageData, 0, 0);
  }
}

var WORLD_SIZE = 25;

var _Cell$directions = Cell.directions;
var LEFT = _Cell$directions.LEFT;
var UP = _Cell$directions.UP;
var RIGHT = _Cell$directions.RIGHT;
var DOWN = _Cell$directions.DOWN;
var _World$tileIds = World$$1.tileIds;
var ENTRANCE = _World$tileIds.ENTRANCE;
var EXIT = _World$tileIds.EXIT;


var BLACK = [0, 0, 0];
var GRAY = [128, 128, 128];
var SILVER = [192, 192, 192];
var WHITE = [255, 255, 255];

var RED = [255, 0, 0];
var MAROON = [128, 0, 0];

var YELLOW = [255, 255, 0];
var OLIVE = [128, 128, 0];

var LIME = [0, 255, 0];
var GREEN = [0, 128, 0];

var BLUE = [0, 0, 255];
var NAVY = [0, 0, 128];

function darken(color) {
  switch (color) {
    case BLACK:
      return BLACK;
    case GRAY:
      return GRAY;
    case SILVER:
      return GRAY;
    case WHITE:
      return GRAY;
    case RED:
      return MAROON;
    case MAROON:
      return MAROON;
    case YELLOW:
      return OLIVE;
    case OLIVE:
      return OLIVE;
    case LIME:
      return GREEN;
    case GREEN:
      return GREEN;
    case BLUE:
      return NAVY;
    case NAVY:
      return NAVY;
  }
  return null;
}

function lighten(color) {
  switch (color) {
    case BLACK:
      return GRAY;
    case GRAY:
      return SILVER;
    case SILVER:
      return WHITE;
    case WHITE:
      return WHITE;
    case RED:
      return RED;
    case MAROON:
      return RED;
    case YELLOW:
      return YELLOW;
    case OLIVE:
      return YELLOW;
    case LIME:
      return LIME;
    case GREEN:
      return LIME;
    case BLUE:
      return BLUE;
    case NAVY:
      return BLUE;
  }
  return null;
}

var sprites = {
  floor: BLACK,
  wall: WHITE,
  door: YELLOW,
  doorOpen: OLIVE,
  doorSecret: WHITE,
  entrance: GRAY,
  exit: GREEN,
  human: LIME,
  beast: RED,
  item: BLUE,
  corpse: MAROON
};

var game = Game$$1.create(WORLD_SIZE);
var display = Display$$1.create(WORLD_SIZE).mount('#app');

console.log(game.rng.seed());

game.on(['start', 'tick'], render).on('move', function (actor) {
  if (actor === game.hero) if (path) window.requestAnimationFrame(step);
}).on('move-fail', function (actor) {
  if (actor === game.hero) if (path) path = null;
}).on('open', function (actor) {
  if (actor === game.hero) interrupted = true, path = null;
}).start();

var inputDirections = {

  KeyW: UP,
  ArrowUp: UP,

  KeyA: LEFT,
  ArrowLeft: LEFT,

  KeyS: DOWN,
  ArrowDown: DOWN,

  KeyD: RIGHT,
  ArrowRight: RIGHT

};

var interrupted = false; // Door hack
window.addEventListener('keydown', function (event) {
  var key = event.key,
      code = event.code;

  if (!interrupted && !path) {
    var direction = inputDirections[code];
    if (direction) game.input('move', direction);else if (key === 'c') game.input('close');else if (code === 'Space') game.input('wait');else if (key === '>') game.input('descend');else if (key === '<') game.input('ascend');else if (key === 'r') game.start();
  }
});

window.addEventListener('keyup', function (event) {
  interrupted = false;
});

var canvas = display.context.canvas;
var mouse = null;
canvas.addEventListener('mousemove', function (event) {
  var _canvas$getBoundingCl = canvas.getBoundingClientRect(),
      width = _canvas$getBoundingCl.width,
      height = _canvas$getBoundingCl.height;

  var offsetX = event.offsetX,
      offsetY = event.offsetY;

  mouse = [offsetX / width * canvas.width, offsetY / height * canvas.height].map(Math.floor);
  render(mouse);
});

var path = null;
canvas.addEventListener('click', function (event) {
  if (!mouse) return;
  if (path) {
    path = null;
    return;
  }
  var _game$hero = game.hero,
      world = _game$hero.world,
      cell = _game$hero.cell,
      known = _game$hero.known;

  if (Cell.isEqual(cell, mouse)) {
    var id = world.getAt(cell);
    if (id === ENTRANCE) game.input('ascend');else if (id === EXIT) game.input('descend');
    return;
  }
  var cells = {};
  world.data.forEach(function (id, index) {
    var cell = Cell.fromIndex(index, world.size);
    if (!known[game.floor][cell]) cells[cell] = Infinity;
  });
  path = world.findPath(cell, mouse, { cells: cells });
  if (path) step();
});

canvas.addEventListener('mouseout', function (event) {
  mouse = null;
});

function getView(actor) {
  var view = {};
  var known = actor.known,
      seeing = actor.seeing;

  known = known[game.floor];
  var cells = Object.keys(known).map(Cell.fromString);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = cells[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var cell = _step.value;

      var name = known[cell];
      var color = sprites[name];
      if (!(cell in seeing)) color = darken(color);
      view[cell] = color;
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

function render() {
  var view = getView(game.hero);
  if (mouse) view[mouse] = lighten(view[mouse]);
  display.render(view);
}

function step() {
  var step = game.hero.world.findStep(path, game.hero.cell);
  if (!step) {
    path = null;
    return false;
  }
  game.input('move', step);
  return true;
}

})));
//# sourceMappingURL=build.js.map

module.exports = (function() {
  // Directions
  var LEFT  = [-1, 0]
  var RIGHT = [ 1, 0]
  var UP    = [ 0,-1]
  var DOWN  = [ 0, 1]
  var directions = [LEFT, RIGHT, UP, DOWN]

  var POS     = require('./pos')
  var PRESETS = require('./presets')
  var RANDOM  = require('./random')
  var RECT    = require('./rect')

  var MAP = {
    TYPE_DUNGEON: 'dungeon',
    TYPE_MAZE:    'maze',
    TYPE_CAVE:    'cave',
    get_at: function(pos, map, size) {
      return map[POS.to_index(pos, size)]
    },
    get_converted_map: function(map) {
      var result = []
      var i = map.length
      var row, char
      while (i --) {
        result[i] = PRESETS.get_by_char(map[i])
      }
      return result
    },
    get_flattened_map: function(map, size) {
      var result = []
      var i = 0, imax = map.length, pos
      var row
      while (i < imax) {
        pos = POS.to_pos(i, size)
        if (pos[0] === 0)
          row = ""
        row += map[i]
        if (pos[0] === size - 1) {
          result.push(row)
        }
        i++
      }
      return result
    },
    get_map_ratio: function(map) {
      var total  = map.length + 1
      var others = 0
      var i = map.length
      while (i --)
        others += map[i] != '#' ? 1 : 0
      return others / total
    },
    get_neighbors: function(pos, map, size, scale) {
      scale = scale || 1
      var result = []
      var i = directions.length
      var direction, neighbor
      while (i--) {
        direction = directions[i]
        neighbor = POS.add(pos, POS.scale(direction, scale))
        if (POS.is_inside(neighbor, size)) {
          result.push(neighbor)
        }
      }
      return result
    },
    create_pathfinder: function(map, map_size, tile_costs) {
      function cache_distances() {
        var distance_map = {}
        var i, j, l = map.length
        var here, there

        i = l
        while (i--) {                              // Loop through map
          here = POS.to_pos(i, map_size)    // Get position at current index
          distance_map[here] = {}                  // Create distance map for this tile
          j = l
          while (j--) {                            // Loop through map (again?)
            there = POS.to_pos(j, map_size) // Get position at other index
            distance_map[here][there] = POS.get_manhattan_distance(here, there) // Get manhattan distance between the two points
          }
        }
        return distance_map
      }

      function sort_by_f(open_set, f_of) {
        open_set.sort(function(a, b) {
          return f_of[a] - f_of[b]
        })
      }

      function reconstruct_path(start, goal, get_parent) {
        var path = []
        var current = goal
        // console.log('Whew, we made it!')
        // throw "Warning: Entered danger zone."
        while (1) {
          path.unshift(current)
          parent = get_parent[current]
          if (parent) {
            current = parent
          } else {
            break
          }
        }
        if (POS.is_equal(current, start)) {
          return path
        } else {
          return null
        }
      }

      function get_neighbors(pos) {
        return MAP.get_neighbors(pos, map, map_size)
      }

      function get_at(pos) {
        return MAP.get_at(pos, map, map_size)
      }

      function open_cell(pos, set, in_set) {
        in_set[pos] = true
        set.push(pos)
      }

      function close_cell(pos, set, in_set) {
        in_set[pos] = true
        set.push(pos)
      }

      var distance_map = cache_distances()

      return function get_path(start, goal) {
        // console.log('Finding path from', start,'to', goal)

        var open_set = [start]
        var closed_set = []
        var in_open_set = {start: true}
        var in_closed_set = {}
        var get_parent = {}
        var f_of = {}
        var g_of = {}
        var distance_to_goal_from = distance_map[goal]
        var current

        var i = map.length
        while (i --) {
          current = POS.to_pos(i, map_size)
          g_of[current] = Infinity
          f_of[current] = Infinity
        }

        g_of[start] = 0
        f_of[start] = distance_to_goal_from[start]

        iters = 0
        while (open_set.length) {
          if (open_set.length > 1)
            sort_by_f(open_set, f_of)
          current = open_set.shift()
          // console.log('-- Current cell is',current)
          if (POS.is_equal(current, goal)) {
            return reconstruct_path(start, goal, get_parent)
          }
          close_cell(current, closed_set, in_closed_set)
          neighbors = get_neighbors(current)
          neighbors.some(function(neighbor) {
            if (in_closed_set[neighbor])
              return
            var tile = get_at(neighbor)
            var terrain_cost = tile_costs[tile] || 0
            var pos_cost = tile_costs[neighbor] || 0
            var cost = terrain_cost + pos_cost
            var g = (g_of[current] + 1) + cost
            if (!in_open_set[neighbor]) {
              open_cell(neighbor, open_set, in_open_set)
            } else if (g >= g_of[neighbor])
              return
            get_parent[neighbor] = current
            g_of[neighbor] = g
            f_of[neighbor] = g + distance_to_goal_from[neighbor]
            // console.log('Evaluating',neighbor)
            // console.log('- sprite char:',tile)
            // console.log('- tile cost of',cost)
            // console.log('- `h` score of',distance_to_goal_from[neighbor])
            // console.log('- `g` score of',g)
            // console.log('- `f` score of',f_of[neighbor])
          })
        }
        return null
      }
    },
    create_room_generator: function(min_size, max_size, map_size) {
      function get_room_size() {
        return RANDOM.get((max_size - min_size) / 2 + 1) * 2 + min_size
      }
      function get_room_pos(room_size) {
        return RANDOM.get((map_size - 2 - room_size) / 2) * 2 + 1
      }
      return function get_room() {
        var w = get_room_size()
        var h = get_room_size()
        var x = get_room_pos(w)
        var y = get_room_pos(h)
        return [x, y, x + w - 1, y + h - 1]
      }
    },
    generate_blank_map: function(size) {
      var map = []
      var i = size * size
      while (i --)
        map.push('#')
      return map
    },
    generate_box: function(size) {
      var map = []
      var i = 0
      var pos
      var area = size * size
      var pillar
      var char
      while(i < area) { // Fill map with walls
        pos = POS.to_pos(i, size)
        pillar = !(x % 4) && !(y % 4)
        if (POS.is_edge(pos, size) || pillar)
          char = '#'
        else
          char = '.'
        map.push(char)
        i++
      }
      return map
    },
    // function generate_maze(size) -> Array
    // > Generates a perfect maze (1-D array) of `size`.
    //
    // Here's a step-by-step guide of how it works:
    //  1. Fill map with walls
    //  2. Select random tile and add to stack
    //  3. While stack still has tiles...
    //    a. Pop tile from stack and mark it as visited
    //    b. If tile has unvisited adjacent neighbors...
    //      i.  Select random neighbor
    //      ii. Dig (replace walls with floors) from tile to neighbor
    //    c. If we've hit a dead end...
    //      i.  Backtrack!
    //  4. Return map
    //
    generate_maze: function(size) {
      console.log('Generating maze of size',size)
      var map = []
      var i = 0
      var x, y
      var area = size * size
      var replica = []
      var node, nodes = []
      var center = Math.floor(size / 2)
      while(i < area) { // Fill map with walls
        var pos = POS.to_pos(i, size)
        var type, tile
        tile = '#'
        map.push(tile)
        replica.push(pos)
        if ((pos[0] - 1) % 2 == 0 && (pos[1] - 1) % 2 == 0)
          nodes.push(pos)
        i++
      }
      var start = RANDOM.choose(nodes)
      var stack = [start]
      var tower = [start]
      var is_visited = {}
      var current
      var dist, dig
      var unvisited, neighbors, neighbor
      var ends = []
      var steps = 0
      while (stack.length) {
        current = stack.pop()
        is_visited[current] = true // Mark the current tile
        neighbors = MAP.get_neighbors(current, replica, size, 2)  // Get adjacent tiles (with a step of 2)
        unvisited = _.filter(neighbors, function(neighbor) {   // Filter out visited tiles
          return !is_visited[neighbor]
        })
        if (unvisited.length) {                                // If unvisited neighbors exist...
          neighbor = RANDOM.choose(unvisited)              // Get random valid neighbor
          dist = [neighbor[0] - current[0], neighbor[1] - current[1]]  // Get initial distance
          dig = POS.normalize(dist)             // Get dig step
          while (!POS.is_equal(current, neighbor)) { // While current !== target...
            current[0] += dig[0]                         // Move towards target
            current[1] += dig[1]
            map[POS.to_index(current, size)] = '.'   // Change current pos to floor tile
          }
          stack.push(neighbor)
          tower.push(neighbor)
          steps ++
        } else {
          ends.push(current)
          var top = tower.pop() // Backtrack
          top && stack.push(top)
          steps --
        }
      }
      console.log('Maze successfully created from',start)
      map[start] = '.' // Dig at start
      return map
    },
    generate_dungeon: function(map_size) {
      var maze = MAP.generate_maze(map_size)
      var map = MAP.generate_blank_map(map_size)
      var tile_costs = {
        '.': 0,
        '#': 10000,
        edge: 10000,
        corner: Infinity
      }
      var find_path = null
      var room, rooms = []
      var i = 0
      var tile, index, ratio
      var linked = {}

      function link_rooms(room_a, room_b) {
        if (!linked[room_a]) linked[room_a] = {}
        if (!linked[room_b]) linked[room_b] = {}
        linked[room_a][room_b] = true
        linked[room_b][room_a] = true
        // function on_maze(pos) {
        //   return MAP.get_at(pos, maze, map_size) === '.'
        // }
        // var tile_costs = {
        //   '.': 0,
        //   '#': Infinity
        // }
        // var find_path = MAP.create_pathfinder(maze, map_size, tile_costs)
        //
        // var center_a = RECT.get_center(room_a)
        // var center_b = RECT.get_center(room_b)
        // var path = find_path(center_a, center_b)
        // if (path) {
        //   path.some(function(pos) {
        //     var index = POS.to_index(pos, map_size)
        //     var char = is_pos_edge[pos] ? '+' : '.'
        //     map[index] = char
        //   })
        // }

      }
      function dig_room(rect) {
        RECT.get_inside(rect).some(function(pos) {
          var index = POS.to_index(pos, map_size)
          map[index] = '.'
        })
      }
      function create_room(rects, rect) {
        var i, j, index
        var valid
        var other
        var attempts
        var get_room = MAP.create_room_generator(3, 7, map_size)
        if (!rects) {
          rects = []
        }
        attempts = []
        while (!rect && attempts < 3) {
          rect = get_room()
          if (rects.length) {
            i = rects.length
            valid = true
            while (i --) {
              other = rects[i]
              if (RECT.is_intersecting(rect, other)) {
                valid = false
                break
              }
            }
            if (!valid)
              rect = null
          }
          attempts ++
        }
        return rect
      }
      function create_rooms() {
        console.log('Creating rooms...')
        var ratio, room, rooms = []
        do {
          // ratio = MAP.get_map_ratio(map)
          if (room)
            rooms.push(room)
          if (!(rooms.length < map_size / 4 && /*ratio < .2 && */i < map_size))
            break
          room = create_room(rooms)
          i ++
        } while (1)
        return rooms
      }

      // i = maze.length
      // while (i--) {
      //   if (maze[i] === '.')
      //     map[i] = '!'
      // }

      rooms = create_rooms()
      rooms.some(function(room) {
        dig_room(room)
      })

      console.log('Created rooms',rooms)

      console.log('Caching room borders...')

      var room_edges    = {}
      var room_corners  = {}
      var room_centers  = {}
      var room_edge_list = []
      var room_corner_list = []
      var room_center_list = []
      var is_pos_edge   = {}
      var is_pos_corner = {}
      var is_pos_center = {}
      rooms.some(function(room) {
        var edges   = RECT.get_edges(room)
        var center  = RECT.get_center(room)
        var corners = RECT.get_corners(room)
        edges.some(function(tile) {
          is_pos_edge[tile] = true
          room_edge_list.push(tile)
          tile_costs[tile] = tile_costs.edge
        })
        corners.some(function(tile) {
          is_pos_corner[tile] = true
          room_corner_list.push(tile)
          tile_costs[tile] = tile_costs.corner
        })
        room_center_list.push(center)
        room_edges[room] = edges
        room_corners[room] = corners
        room_centers[room] = center
      })

      find_path = MAP.create_pathfinder(maze, map_size, tile_costs)

      console.log('Connecting rooms...')

      // var is_connected = {}
      // var connections = 0
      // var room_a, room_b
      // var i = 0
      // while (connections < rooms.length / 4) {
      //
      //   do {
      //     room_a = rooms[RANDOM.get(rooms.length)]
      //   } while (is_connected[room_a])
      //   is_connected[room_a] = true
      //
      //   do {
      //     room_b = rooms[RANDOM.get(rooms.length)]
      //     i ++
      //   } while (i < rooms.length && (RECT.is_equal(room_a, room_b) || is_connected[room_b]))
      //   is_connected[room_b] = true
      //
      //   connections++
      //
      //   link_rooms(room_a, room_b)
      // }

      var evaluated = {}
      rooms.some(function(room_a) {
        if (!evaluated[room_a])
          evaluated[room_a] = {}
        var edges_a = room_edges[room_a]
        rooms.some(function(room_b) {
          if (!evaluated[room_b])
            evaluated[room_b] = {}
          if (!RECT.is_equal(room_a, room_b) && !evaluated[room_a][room_b] && !evaluated[room_b][room_a]) {
            var edges_b = room_edges[room_b]
            var seen = {}
            var shared_edges = []
            edges_a.some(function(edge) {
              seen[edge] = true
            })
            edges_b.some(function(edge) {
              if (seen[edge]) {
                shared_edges.push(edge)
              }
            })
            var l = shared_edges.length
            if (l) {
              if (l == 1) {
                var index = POS.to_index(shared_edges[0], map_size)
                map[index] = '+'
                link_rooms(room_a, room_b)
              } else {
                // if (l === room_a[2] - room_a[0] + 1 ||
                //     l === room_a[3] - room_a[1] + 1 ||
                //     l === room_b[2] - room_b[0] + 1 ||
                //     l === room_b[3] - room_b[1] + 1 ) {
                //   shared_edges.some(function(edge) {
                //     var index = POS.to_index(edge, map_size)
                //     map[index] = '+'
                //   })
                // }
              }
            }
            evaluated[room_a][room_b] = true
            evaluated[room_b][room_a] = true
          }
        })
      })

      rooms.some(function(room) {
        if (!linked[room]) {
          console.log(room)
          var inside = RECT.get_inside(room)
          var center_a = room_centers[room]
          var center_b = null
          rooms.sort(function(room_a, room_b) {
            return POS.get_manhattan_distance(center_a, room_centers[room_a]) - POS.get_manhattan_distance(center_a, room_centers[room_b])
          })
          center_b = room_centers[rooms[1]]
          var path = find_path(center_a, center_b)
          if (path) {
           path.some(function(pos) {
             var index = POS.to_index(pos, map_size)
             var char = is_pos_edge[pos] ? '+' : '.'
             map[index] = char
           })
           var index = POS.to_index(center_a, map_size)
          //  map[index] = '!'
           link_rooms(room, rooms[1])
          }
        }
      })

      console.log('Identifying islands...')

      function get_islands() {
        var marked = {}
        var islands = []
        rooms.some(function(room) {
          var start = room_centers[room]
          var island, current, stack, index, char
          if (!marked[start]) {
            island = {
              room: room,
              contents: []
            }
            stack = [start]
            while (stack.length) {
              current = stack.pop()
              marked[current] = true
              island.contents.push(current)
              neighbors = MAP.get_neighbors(current, map, map_size)
              neighbors.some(function(neighbor) {
                index = POS.to_index(neighbor, map_size)
                char = map[index]
                if (char !== '#' && !marked[neighbor])
                  stack.push(neighbor)
              })
            }
            islands.push(island)
          }
        })
        return islands
      }
      var islands = get_islands()

      console.log('Found',islands.length,'islands. Linking...')

      islands.some(function(island) {
        var room = island.room
        // console.log(room)
        var inside = RECT.get_inside(room)
        var center_a = room_centers[room]
        var center_b = null
        var unrelated = _.filter(rooms, function(other) {
          return !linked[other] || !linked[other][room] || !linked[room][other]
        })
        unrelated.sort(function(room_a, room_b) {
          return POS.get_manhattan_distance(center_a, room_centers[room_a]) - POS.get_manhattan_distance(center_a, room_centers[room_b])
        })
        var other = unrelated[1]
        center_b = room_centers[other]
        var path = find_path(center_a, center_b)
        if (path) {
         path.some(function(pos) {
           var index = POS.to_index(pos, map_size)
           var char = is_pos_edge[pos] ? '+' : '.'
           map[index] = char
         })
         var index = POS.to_index(center_a, map_size)
        //  map[index] = '!'
         link_rooms(room, other)
        }
      })

      console.log('Generation complete!')

      var spawn = null
      var exit = null
      var centers = []
      if (rooms.length) {
        var spawn = RECT.get_center(rooms[0])

        rooms.some(function(room, index) {
          if (index) {
            var center = RECT.get_center(room)
            centers.push({
              pos: center,
              dist: POS.get_manhattan_distance(spawn, center)
            })
          }
        })

        centers.sort(function(a, b) {
          return b.dist - a.dist
        })
      }

      return {
        rooms: rooms,
        spawn: spawn,
        exit: centers.length ? centers[0].pos : null,
        map: map
      }
    },
    generate_map: function(type, size) {
      var method = {
        'dungeon': MAP.generate_dungeon,
        'maze':    MAP.generate_maze
      }[type] || null
      var result = method ? method(size) : null
      var map
      if (!result) {
        return null
      } else {
        var t = result.constructor.name
        if (t === 'Array') {
          result = {
            map: result
          }
        }
        result.map = MAP.get_converted_map(result.map)
        return result
      }

    }
  }

  return MAP

}())

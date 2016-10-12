// Collaboration with Dustin Dowell

var omniscient = false // ignore raycasting?
var scrolling  = true
var viewport_size = 9

var FOV     = require('./utils/fov')
var MAP     = require('./utils/map')
var PRESETS = require('./utils/presets')
var POS     = require('./utils/pos')
var RECT    = require('./utils/rect')
var RANDOM  = require('./utils/random')

new Vue({
  el: '#app',
  data: {
    map: null,
    map_size: 25,
    viewport_size: viewport_size,
    player_pos: [12, 12],
    player_vision: Math.floor(9 / 2),
    player_known: []
  },
  computed: {
    view: function () {
      var viewport_half = Math.floor(this.viewport_size / 2)
      var viewport_cntr = [viewport_half, viewport_half]
      var map_half = Math.floor(this.map_size / 2)
      var map_cntr = [map_half, map_half]
      var focus
      var player_tile

      if (!this.map) {
        this.map = this.create_map()
      }

      focus = scrolling ? this.player_pos : map_cntr

      if (!omniscient) {
        this.loop_through_tiles(this.player_known, function(tile) { // Clear previously visible tiles
          tile.visible = false
        })

        this.player_known = FOV.get(this.player_pos, this.player_vision, this.map, this.map_size) // Get new tiles

        this.loop_through_tiles(this.player_known, function(tile) { // Display visible tiles
          tile.visible = true
        })
      }

      // console.log(player_pos)
      // console.log(this.flatten_map(map, map_size))

      map = this.map_viewport(focus, this.map, this.map_size, this.viewport_size)

      map[POS.to_index(viewport_cntr, this.viewport_size)] = {
        sprite: '@',
        color: 'white',
        type: 'player'
      }

      return map
    }
  },
  methods: {
    create_map: function() {
      var data = MAP.generate_map('dungeon', this.map_size)
      var map = data.map
      if (data.spawn)
        this.player_pos = data.spawn
      if (data.exit) {
        map[POS.to_index(data.exit, this.map_size)] = PRESETS.get('exit')
      }
      return map
    },
    change_floor: function() {
      this.map = this.create_map()
    },
    move_player: function (direction) {
      var tgt_x = this.player_pos[0] + direction[0]
      var tgt_y = this.player_pos[1] + direction[1]
      var tgt_pos = [tgt_x, tgt_y]
      var tgt_index
      var tgt_tile

      if (POS.is_inside(tgt_pos, this.map_size)) {

        tgt_index = POS.to_index(tgt_pos, this.map_size)
        tgt_tile = this.map[tgt_index]
        if (tgt_tile.walkable) {
          this.player_pos = tgt_pos
          return true
        }
        if (tgt_tile.contact) {
          this.map[tgt_index] = PRESETS.get(tgt_tile.contact)
          this.player_pos = POS.clone(this.player_pos) // Force Vue refresh
        }
      }
      return false
    },
    loop_through_tiles: function(tiles, looper) {
      var pos, x, y, i, index, tile, tiles
      i = tiles.length
      while (i --) {
        pos = tiles[i]
        index = POS.to_index(pos, this.map_size)
        tile = this.map[index]
        if (tile)
          looper.call(this, tile)
        else
          throw pos
      }
    },
    // function map_viewport(pos, map, map_size, viewport_size) -> Array
    // > Cut `map` down to `viewport_size` with center `pos`
    map_viewport: function(center, map, map_size, viewport_size) {
      var viewport = []
      var i = 0, j
      var new_x, new_y, new_pos
      var index, tile, data
      var viewport_half = Math.floor(viewport_size / 2)
      var corner = [center[0] - viewport_half, center[1] - viewport_half]
      while(i < viewport_size) {
        j = 0
        while(j < viewport_size) {
          new_x = j + corner[0]
          new_y = i + corner[1]
          new_pos = [new_x, new_y]
          index = POS.to_index(new_pos, map_size)
          tile = null
          if (POS.is_inside(new_pos, map_size)) {

            tile = map[index]
          }
          if (!tile || !tile.visible && !omniscient) {
            data = {
              sprite: '&nbsp;',
              type: 'unknown'
            }
          } else {
            data = {
              sprite: tile.sprite,
              color: tile.color,
              type: tile.type
            }
          }
          // data.id = POS.to_index([new_x, new_y], map_size)
          viewport.push(data)
          j++
        }
        i++
      }

      return viewport
    }
  },
  mounted: function () {
    var that = this
    var key_pressed = {}
    var key_released = {}
    var movement_keys = ['KeyA', 'KeyW', 'KeyD', 'KeyS', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'Period']
    function handle_key(event) {
      var is_key_down = event.type === 'keydown'
      var code = event.code
      if (is_key_down) {
        if (!key_released[code]) {
          key_pressed[code] = true
          loop()
        }
      } else {
        key_pressed[code] = false
        key_released[code] = false
      }
    }
    function release_keys(keys) {
      keys.some(function(code) {
        key_pressed[code] = false
        key_released[code] = true
      })
    }
    window.addEventListener('keydown', handle_key)
    window.addEventListener('keyup',   handle_key)
    function loop() {
      var dir_x = 0
      var dir_y = 0
      var moved, code
      var keys = []
      movement_keys.some(function(code) {
        if (key_pressed[code]) {
          keys.push(code)
        }
      })
      if (key_pressed.KeyA || key_pressed.ArrowLeft)  dir_x--
      if (key_pressed.KeyW || key_pressed.ArrowUp)    dir_y--
      if (key_pressed.KeyD || key_pressed.ArrowRight) dir_x++
      if (key_pressed.KeyS || key_pressed.ArrowDown)  dir_y++
      if (key_pressed.Period) {
        var index = POS.to_index(that.player_pos, that.map_size)
        var tile = that.map[index]
        if (tile.exit) {
          release_keys(keys)
          that.change_floor()
          return
        }
      }
      if (dir_x !== 0 || dir_y !== 0) {
        moved = that.move_player([dir_x, dir_y])
        if (!moved) {
          release_keys(keys)
        }
      }
      // window.requestAnimationFrame(loop)
    }
  },
  components: {
    game: require('./components/game')(viewport_size)
  }
})

module.exports = (function() {
  var data = {
    'wall': {
      char: '#',//'&#x256c;',
      color: 'darkslategray',
      opaque: true
    },
    'floor': {
      char: '.',
      sprite: '&middot;',
      color: 'olive',
      walkable: true
    },
    'door': {
      char: '+',
      color: 'brown',
      opaque: true,
      contact: 'door-open'
    },
    'door-open': {
      char: '/',
      color: 'brown',
      walkable: true
    },
    'exit': {
      char: '>',
      color: 'white',
      walkable: true,
      exit: true
    },
    'debug': {
      char: '!',
      color: 'lime',
    }
  }
  var data_by_chars = {}
  var preset_name, preset
  for (preset_name in data) {
    preset = data[preset_name]
    preset.type = preset_name
    preset.sprite = preset.sprite || preset.char
    data_by_chars[preset.char] = preset
  }
  var PRESETS = {
    // function get_preset(type) -> Tile (Object)
    // > Gets a tile preset of `type`
    get: function(type) {
      var preset, result = {
        type: null,
        char: ' ',
        sprite: '&nbsp;',
        color: 'transparent',
        walkable: false,
        opaque: false,
        exit: false,
        visible: false,
        visited: false
      }
      if (!data.hasOwnProperty(type)) {
        console.log('Preset does not exist:',type)
      }
      preset = data[type]
      if (preset) {
        for (var attribute in preset) {
          result[attribute] = preset[attribute]
        }
      }
      return result
    },
    get_by_char: function(char) {
      var preset = data_by_chars[char]
      var result = PRESETS.get(preset.type)
      return result
    }
  }
  return PRESETS
}())

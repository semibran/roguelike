module.exports = (function(){
  var POS = require('./pos')

  function create(attributes) {
    var element = {
      visible: []
    }
    for (var attribute in attributes) {
      element[attribute] = attributes[attribute]
    }
    return function create(pos) {
      element.pos = pos
      return element
    }
  }

  function move(element, direction) {
    var tgt = POS.add(element.pos, direction)
  }

  return {
    create: create,
    move: move
  }
}())

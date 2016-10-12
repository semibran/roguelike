module.exports = (function(){
  function get(min, max) {
    var a = arguments.length
    if (a === 0) {
      return Math.random()
    } else if (a === 1) {
      max = min
      min = 0
    }
    if (min > max) {
      var $ = min
      min = max
      max = $
    }
    return Math.floor(get() * (max - min)) + min
  }

  function choose(array) {
    if (!array.length)
      return null
    return array[get(array.length)]
  }

  return {
    get: get,
    choose: choose
  }
}())

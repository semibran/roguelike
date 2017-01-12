export default { get, choose }

function get(min, max) {
  var a = arguments.length
  if (a === 0)
    return Math.random()
  else if (a === 1)
    max = min, min = 0
  if (min > max)
    [min, max] = [max, min]
  return Math.floor(get() * (max - min)) + min
}

function choose(array) {
  if ( Array.isArray(array) && !array.length )
    return null
  if ( !isNaN(array) )
    return !get(array)
  if ( !Array.isArray(array) && typeof array === 'object')
    array = Object.keys(array)
  if (!array)
    array = [0, 1]
  return array[get(array.length)]
}

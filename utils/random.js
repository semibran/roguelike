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
  if (!array || !array.length)
    array = [0, 1]
  return array[get(array.length)]
}

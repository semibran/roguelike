let RNG = create()
RNG.create = create

export default RNG

function create(initialSeed) {

  if (isNaN(initialSeed))
    initialSeed = Math.random() * 10000

  let currentSeed = initialSeed

  return { get, choose, seed }

  function get(min, max) {
    var a = arguments.length
    if (a === 0) {
      let x = Math.sin(currentSeed++) * 10000
      return x - Math.floor(x)
    } else if (a === 1) {
      if (!isNaN(min))
        max = min, min = 0
      else if (Array.isArray(min))
        [min, max] = min
    }
    if (min > max)
      [min, max] = [max, min]
    return Math.floor(get() * (max - min)) + min
  }

  function choose(array) {
    if (Array.isArray(array) && !array.length)
      return null
    if (!isNaN(array))
      return !get(array)
    if (!array)
      array = [0, 1]
    return array[get(array.length)]
  }

  function seed(newSeed) {
    if (!isNaN(newSeed))
      initialSeed = currentSeed = newSeed
    return currentSeed
  }

}

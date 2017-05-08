export default { create }

function create(options) {

  let item = {
    kind: null,
    value: 0
  }

  Object.assign(item, options, {
    type: 'item'
  })

  return item

}

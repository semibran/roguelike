export default { create }

function create(options) {

  let item = {
    itemType: null,
    kind: null,
    value: null,
  }

  let props = {
    type: 'item',
    world: null,
    cell: null
  }

  Object.assign(item, options, props)

  return item

}

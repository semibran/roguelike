import React, { Component } from 'react';
import { AppRegistry, StyleSheet, Text, View } from 'react-native';

import { Random, Vector, Pos, Rect, World, Entity } from './utils'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = require('Dimensions').get('window')

const WORLD_SIZE = 15

const TILE_SIZE = SCREEN_WIDTH / WORLD_SIZE

function getEqual(array, pos) {
  function isEqual(item) {
    return Vector.equals(pos, item.pos)
  }
  return array.filter(isEqual)
}

export default class App extends Component {
  constructor(props) {
    super(props)
    var world = World.create(WORLD_SIZE).generate()

    function spawn(sprite, centered) {
      var room = Random.choose(world.rooms)
      var pos
      if (centered)
        pos = Rect.getCenter(room)
      else {
        var inside = Rect.getInside(room)
        do pos = Random.choose(inside)
        while ( getEqual(world.entities, pos).length )
      }
      var entity = Entity.create(sprite)
      world.entities.push(entity)
      entity.spawn(world, pos)
      return entity
    }

    var i = WORLD_SIZE / 5
    while (i--)
      spawn(World.sprites.wyrm)
    var player = spawn(World.sprites.hero, true)

    this.state = {world, player}
  }
  render() {
    return (
      <View style={ styles.app }>
        { this.renderWorld(this.state.world, this.state.player) }
      </View>
    )
  }
  renderWorld(world, camera) {
    var result = []
    var known = camera.known
    for (var key in known) {
      var sprite = known[key]
      result.push( this.renderSprite( world, camera, sprite, key ) )
    }
    return result
  }
  renderSprite(world, camera, sprite, key) {
    var pos = Vector.create( key.split(',').map(Number) )
    var {color, char} = sprite
    if ( !camera.seeing.includes(key) )
      color = 'gray'
    var position = { left: pos.x * TILE_SIZE, top: pos.y * TILE_SIZE }
    return (
      <View key={key} style={ [styles.tile, position] } onStartShouldSetResponder={ () => true } onResponderGrant={ this.move.bind(this, world, pos) }>
        <Text style={ [ styles.char, {color} ] }>{char}</Text>
      </View>
    )
  }
  move(world, pos) {
    var tile = World.tiles[ world.get(pos) ]
    var player = this.state.player
    if (tile.walkable) {
      player.moveTo(pos)
      this.setState( {player} )
    }
    if (tile.door) {
      world.set(pos, World.DOOR_OPEN)
      player.look()
      this.setState( {player, world} )
    }
  }
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: 'black',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tile: {
    width:  TILE_SIZE,
    height: TILE_SIZE,
    backgroundColor: 'black',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  },
  char: {
    color: 'white',
    fontSize: TILE_SIZE
  }
});

AppRegistry.registerComponent('roguelike', () => App);

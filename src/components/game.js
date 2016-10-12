module.exports = function(viewport_size){
  return {
    template: "<div class='grid' :style='{ fontSize: \"calc(100vmin / " + viewport_size + ")\" }'>" +
                "<div class='overlay'></div>" +
                "<div class='tile' v-for='tile in view' v-html='tile.sprite' :class='{ [tile.type]: true }' :style='{ color: tile.color }'></div>" +
              "</div>",
    props: ['view']
  }
}

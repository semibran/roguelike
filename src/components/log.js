module.exports = {
  template: "<ul class='log'>" +
              "<li class='log-item' v-for='item in data'>{{ item }}</li>" +
            "</ul>",
  props: ['data']
}

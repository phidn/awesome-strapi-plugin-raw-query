'use strict';

module.exports = {
  index(ctx) {
    ctx.body = strapi
      .plugin('strapi-plugin-raw-query')
      .service('myService')
      .getWelcomeMessage();
  },
};

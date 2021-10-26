'use strict';

module.exports = function(app) {
  var repeats = require('../../app/controllers/repeats.server.controller');

  app.route('/repeats')
    .get(repeats.all)
    .delete(repeats.removeAll);

};

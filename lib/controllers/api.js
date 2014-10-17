(function() {
  'use strict';
  var fs;

  fs = require('fs');

  exports.taxonomy = function(req, res) {
    return fs.readFile('data/taxonomy.json', function(err, result) {
      if (err) {
        throw err;
      }
      res.type('application/json');
      return res.send(result);
    });
  };

}).call(this);

/*
//@ sourceMappingURL=api.js.map
*/
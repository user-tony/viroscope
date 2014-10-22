(function() {
  'use strict';
  var fs, request;

  fs = require('fs');

  request = require('request');

  exports.taxonomy = function(req, res) {
    return request('http://localhost:5000/common/interfaces/tags', function(err, response, body) {
      if (!err && response.statusCode === 200) {
        res.type('application/json');
        return res.send(body);
      }
    });
  };

}).call(this);

/*
//@ sourceMappingURL=api.js.map
*/
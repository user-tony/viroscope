(function() {
  'use strict';
  var data, should;

  should = require('should');

  data = require('../../../lib/controllers/data');

  describe('convert', function() {
    return it('should know how to add', function() {
      return data.add(3, 4).should.equal(7);
    });
  });

}).call(this);

/*
//@ sourceMappingURL=data.js.map
*/
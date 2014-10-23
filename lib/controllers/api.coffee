'use strict';

fs = require 'fs'
request = require 'request'
exports.taxonomy = (req, res) ->
  request 'http://www.qianfandu.com:5000/common/interfaces/tags', (err, response, body) ->
    if !err && response.statusCode == 200
      res.type 'application/json'
      res.send body

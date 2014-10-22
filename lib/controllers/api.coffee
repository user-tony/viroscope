'use strict';

fs = require 'fs'
request = require 'request'

exports.taxonomy = (req, res) ->
    # fs.readFile 'data/taxonomy.json', (err, result) ->
    #     if err
    #         throw err
    #     res.type 'application/json'
    #     res.send result
      
    request 'http://localhost:3000/common/interfaces/tags', (err, response, body) ->
      if !err && response.statusCode == 200
        res.type 'application/json'
        res.send body

'use strict';

var fs = require('fs')


exports.taxonomy = function(req, res){
	fs.readFile('data/taxonomy.json', function(err, result){
		if(err){throw(err)}
		res.type('application/json')
		res.send(result);
	});
}

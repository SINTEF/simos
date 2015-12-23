path = require('path');

exports.outPath = path.resolve(path.join(__dirname, '..', 'example'));
exports.modelsPaths = [path.resolve(path.join(__dirname, '..', 'example', 'models'))];

exports.codeGenerators = {'python': {'outPath': 'lang/python'},
				 		  'matlab': {'outPath': 'lang/matlab'},
				 		  'fortran': {'outPath': 'lang/fortran'}}
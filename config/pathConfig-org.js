path = require('path');

exports.outPath = path.resolve(path.join(__dirname, '..', 'example'));
exports.modelsPaths = [path.resolve(path.join(__dirname, '..', 'example', 'models'))];

exports.codeGenerators = {'python': {'outPath': 'lang/python/models'},
				 		  'matlab': {'outPath': 'lang/matlab/models'},
				 		  'fortran': {'outPath': 'lang/fortran/models'}}

var repl = require("repl");

/*start the server*/
var simosPath = require('./config.js').simosPath;

var config = require(simosPath + '/config.js');

var replServer = repl.start({
prompt: "simos > ",
useColors: true,
useGlobal: true,
ignoreUndefined: false});

/* load system packages */
replServer.context.fs =  require('fs');
replServer.context.path =  require('path');

/* load packages */
replServer.context.loadGenerators = function() {
	//replServer.context.pygen = '';
	//replServer.context.matgen = '';
	var Generator = replServer.context.require(replServer.context.path.join(simosPath, 'generator'));
	
	for (lang in config.langs) {
		var genName = config.langs[lang].id+'gen';
		replServer.context[genName] =  new Generator();
		replServer.context[genName].setSimosPath(simosPath);
		replServer.context[genName].setLang(lang);
		replServer.context[genName].setOutPath( 
			replServer.context.path.join(simosPath,config.langs[lang].interp, 'models')
												);
		
	}

};

replServer.context.loadGenerators();

/*basic functions */
replServer.context.print = function(str) { 
	console.log(str); 
	};
	
replServer.context.clearCache = function(str) { 
		replServer.context.require.cache = {}; 
		replServer.context.loadGenerators();
		};
		
 
replServer.context.reload = function() {
	var keys = [];
	for (key in replServer.context.require.cache) {
		if (key.search('simos.js') == -1)
			keys.push(key);
	}
	for (var i = 0, len = keys.length; i < len; i++) {
		delete replServer.context.require.cache[keys[i]];
		replServer.context.require(keys[i]);
	}
	replServer.context.loadGenerators();
	};

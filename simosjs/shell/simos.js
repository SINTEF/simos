var repl = require("repl");

/*start the server*/
var replServer = repl.start({
prompt: "simos > ",
useColors: true,
useGlobal: true,
ignoreUndefined: false,
});

/* load system packages */
replServer.context.fs =  require('fs');
replServer.context.path =  require('path');

/* load packages */
replServer.context.loadGenerators = function() {
	replServer.context.pygen = '';
	replServer.context.matgen = '';
	var Generator = replServer.context.require('../generator');
	
	replServer.context.pygen =  new Generator();
	replServer.context.pygen.setLang('python');
	replServer.context.pygen.outPath = 
		replServer.context.path.join(replServer.context.pygen.simosPath,'simospy','models','generated');
	
	replServer.context.matgen =  new Generator();
	replServer.context.matgen.setLang('matlab');
	
	replServer.context.matgen.outPath = 
		replServer.context.path.join(replServer.context.matgen.simosPath,'simosmat','models','generated');

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

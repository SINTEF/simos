var repl = require("repl");
var fs = require('fs');
path = require('path');

/*start the server*/
var config = '';
var relSimosPath = '../..'
    



var configFilePath = '';
try{
    configFilePath = process.argv[2];
    config = require(configFilePath);
    
}
catch (e) {
	console.log(e)
	try{
	    configFilePath = path.join(relSimosPath, 'pathConfig.js');
	    config = require(configFilePath);
	}
	catch (e) {
		console.log(e)
	    configFilePath = path.join(relSimosPath, 'config', 'pathConfig-org.js')
	    config = require(configFilePath);
	}
}
	
console.log('Starting SIMOS ...');
console.log('\treading config file: ' + configFilePath);

var langConfigFile = path.join(relSimosPath, 'config', 'langConfig.js');
console.log('\treading lang config file: ' + langConfigFile);
var langConfig = require(langConfigFile);
console.log('\tloaded langs : ' + Object.keys(langConfig.langs));


var simosPath 	= path.resolve(path.join(__dirname,relSimosPath));
var outPath 	= config.outPath;
var modelsPaths = config.modelsPaths;


var replServer = repl.start({
prompt: "simos > ",
useColors: true,
useGlobal: true,
ignoreUndefined: false});

/* load system packages */
replServer.context.fs =  fs;
replServer.context.path =  path;

/* load packages */
replServer.context.loadGenerators = function() {
	//replServer.context.pygen = '';
	//replServer.context.matgen = '';
	var Generator = replServer.context.require(replServer.context.path.join(simosPath, 'generator'));
	console.log('\tloading generator: ' +  JSON.stringify(config.codeGenerators));
	for (lang in config.codeGenerators) {
		var genName = langConfig.langs[lang].id+'gen';
		console.log('\tloading generator: ' + genName);
		replServer.context[genName] =  new Generator();
		replServer.context[genName].setSimosPath(simosPath);
		replServer.context[genName].setLang(lang);
		replServer.context[genName].setOutPath( path.resolve(
			replServer.context.path.join(config.outPath,config.codeGenerators[lang].outPath) )
												);
		replServer.context[genName].setModelsPaths( config.modelsPaths );
		replServer.context[genName].setModelsFormats( config.modelsFormat );

		console.log('\t\tDone.');

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
	
//reading script file for command line evaluation
	if (process.argv.length == 4){
		var scriptName = process.argv[3];
		fs.readFile(scriptName, 'utf8', function(err, data) {
			  if (err) throw err;
			  console.log('OK: ' + scriptName);
			  replServer.context.eval(data)
			});
	}

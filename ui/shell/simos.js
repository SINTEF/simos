var repl = require("repl");
var fs = require('fs');
path = require('path');

/*start the server*/
var config = '';
var relSimosPath = '../..'
    

console.log(process.argv);
console.log(process.argv.length);

var configFilePath = path.join(relSimosPath, 'pathConfig.js');
var scriptFilePath = '';

if (process.argv.length>2) {
	for (var inpind=2; inpind<process.argv.length; inpind++) {
		var arginps = process.argv[inpind].split('=');
		if (arginps[0] == '-p') {
			configFilePath = arginps[1];
		}
		if (arginps[0] == '-g') {
			scriptFilePath = arginps[1];
		}
	}
}

try {
	if (fs.existsSync(configFilePath)) {
		config = require(configFilePath);
	}
  } catch(err) {
	console.error(err)
  }

// var configFilePath = '';
// try{
//     configFilePath = process.argv[2];
//     //config = require(configFilePath);
// 	config = require(process.cwd()+'/'+configFilePath);
// }
// catch (e) {
// 	try{
// 	    configFilePath = path.join(relSimosPath, 'pathConfig.js');
// 	    config = require(configFilePath);
// 	}
// 	catch (e) {
// 	    configFilePath = path.join(relSimosPath, 'config', 'pathConfig-org.js')
// 	    config = require(configFilePath);
// 	}
// }
	
console.log('Starting SIMOS ...');
console.log('\treading config file: ' + configFilePath);

var langConfigFile = path.join(relSimosPath, 'config', 'langConfig.js');
var langConfig = require(langConfigFile);
console.log('\treading lang config file: ' + langConfigFile);

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
	
	for (lang in config.codeGenerators) {
		var genName = langConfig.langs[lang].id+'gen';
		replServer.context[genName] =  new Generator();
		replServer.context[genName].setSimosPath(simosPath);
		replServer.context[genName].setLang(lang);
		replServer.context[genName].setOutPath( path.resolve(
			replServer.context.path.join(config.outPath,config.codeGenerators[lang].outPath) )
												);
		replServer.context[genName].setModelsPaths( config.modelsPaths );
		
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
	if (scriptFilePath != ''){
		fs.readFile(scriptFilePath, 'utf8', function(err, data) {
			  if (err) throw err;
			  console.log('OK: ' + scriptFilePath);
			  replServer.context.eval(data)
			});
	}

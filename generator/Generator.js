
var fs = require('fs');
var path = require('path');
var njs = require('./njs')();

var simosPath = require('./config.js').simosPath;

var config = require(path.join(simosPath,'config.js'));

var ModelParser = require('./lang/ModelParser.js').ModelParser;


fs.mkdirPathSync = function(dirPath, mode) {
	  //Call the standard fs.mkdir
	try {
	  fs.mkdirSync(dirPath, mode);
	}
	catch (ex) {
	    //When it fail in this way, do the custom steps
	    if (ex && ex.errno === 34) {
	      //Create all the parents recursively
	      fs.mkdirPathSync(path.dirname(dirPath), mode);
	      //And then the directory
	      fs.mkdirPathSync(dirPath, mode);
	    }
	  };
	};
	
/*----------------------------------------------------------------------------*/
function Generator(lang){
	this.constructor(lang);
};
/*----------------------------------------------------------------------------*/
Generator.prototype.constructor = function(lang) {
	
	this.setSimosPath(simosPath)
	
	this.langs = config.langs;
			
	this.outPath = undefined;
	
	this.lang = undefined;
	
	if (lang != undefined)
		this.setLang(lang);
	
	this.versionFlag = '__versions__';
	this.packageFlag = '__package__';
	
	this.versions = null;
	
	this.flatModel = true;
};
/*----------------------------------------------------------------------------*/
Generator.prototype.setSimosPath = function(p) {
	this.simosPath = path.resolve(p);
	
	this.modelsPath = path.join(this.simosPath, 'models');
}
/*----------------------------------------------------------------------------*/
Generator.prototype.toString = function(){
	return "Generator";
};
/*----------------------------------------------------------------------------*/
Generator.prototype.isModelName = function(name) {
	if ((name[0] == '_') && (name[1] == '_'))
		return false;
	else
		return true;
};
/*----------------------------------------------------------------------------*/
Generator.prototype.getOutPath = function() {
	if (this.outPath != undefined) {
		return this.outPath;
	}
	else {
		throw(this.outpyPath + ' is not a valid path.');
	} 
};
/*----------------------------------------------------------------------------*/
Generator.prototype.setLang = function(lang) {
	
    var langName = lang.toLowerCase();
    
    if (this.langs[langName] != undefined){
		this.lang = require(path.join(this.simosPath, 'lang', langName, 'generator')).generator;
		//console.log("generator created");
    }
    else{
        throw(lang + ' language is not defined.');
    }

};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/* Package and model name and path manipulation */
/*----------------------------------------------------------------------------*/

/*----------------------------------------------------------------------------*/


/*----------------------------------------------------------------------------*/
Generator.prototype.sourcePackageIDtoPath = function(packageID) {
	 var packagePath = packageID.split(this.lang.packageSep).join('/');
	 return path.join(this.modelsPath, packagePath); 
};
/*----------------------------------------------------------------------------*/
Generator.prototype.targetPackageIDtoPath = function(packageID) {
	var packagePath = '';
	
	if (this.lang.name.toLowerCase() == 'python'){
		packagePath = packageID.split(this.lang.packageSep).join('/');
	}
	else if (this.lang.name.toLowerCase() == 'fortran'){
		packagePath = packageID.split(this.lang.packageSep).join('/');
	}
	else if (this.lang.name.toLowerCase() == 'matlab'){
		var packages = packageID.split(this.lang.packageSep);
		for (var i = 0, len = packages.length; i < len; i++) {
			packages[i] = '+' + packages[i];
		}
		packagePath = packages.join('/');
	}
	else {
		throw(this.lang.name + ' language is not defined.');
	} 

	return path.join(this.getOutPath(), packagePath);
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.generatedPackageIDtoPath = function(packageID) {
	var genPackageID = 'generated:' + packageID;
	return this.sourcePackageIDtoPath(genPackageID);
};
/*----------------------------------------------------------------------------*/
Generator.prototype.initPackagePath = function(packageID) {
	var outppath = this.targetPackageIDtoPath(packageID);
	
	this.createOutPath(outppath);
	
	if (this.lang.name.toLowerCase() == 'python'){
		var packages = packageID.split(this.lang.packageSep);
		for (var i = 0, len = packages.length; i < len; i++) {
			var pout = path.join(this.getOutPath(), packages.slice(0,i+1).join(path.sep));
			var initFilePath = path.join(pout, '__init__.py');
			if (!fs.exists(initFilePath))
				fs.writeFileSync( initFilePath,	'');
		}
	}
	
	return outppath;
};
/*----------------------------------------------------------------------------*/
Generator.prototype.createOutPath = function(outppath) {
	if (!fs.exists(outppath))
		fs.mkdirPathSync(outppath);
	
	return outppath;
};

/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/* model manipulation */
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
Generator.prototype.getModel = function(modelID) {
	
	var modelPath = this.sourcePackageIDtoPath(modelID);
	
	//console.log(path.resolve(modelPath) + '.' + this.modelExt);
	delete require.cache[path.resolve(modelPath+ '.' + this.modelExt)];
	
	var model = require(modelPath);
	
	return new ModelParser(model);
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.getLocalModelVersion = function(modelID) {
	
	var modelPath = this.sourcePackageIDtoPath(modelID);
	var dir = path.dirname(modelPath);
	var versionFile = path.join(dir, this.versionFlag);
	
	var versionFilePath = path.resolve(versionFile+ '.' + this.modelExt);

	if (fs.existsSync(versionFilePath)) {
		delete require.cache[versionFilePath];
		return require(versionFile);
	}
	else {
		return {};
	}
	
};

/*----------------------------------------------------------------------------*/
Generator.prototype.collectVersions = function(packageID, versions) {
	
	console.log("\t collecting versions for " + packageID);
	var packages = this.lang.versionedPackagesFromVersionedPackagedStr(packageID);
	var currentPackage = {"name": packages.names[packages.names.length-1],
						  "versions": packages.versions[packages.versions.length-1]};

	if (currentPackage.version != "")
		versions[currentPackage.name] = currentPackage.version;
    
	/* adding the explicitly defined versions for interfacing other packages*/
	var definedVersions = this.getLocalModelVersion(packageID);	
	for (var key in definedVersions) {
		versions[key] = definedVersions[key];
	}
};


/*----------------------------------------------------------------------------*/
Generator.prototype.flattenModel = function(pmodel) {
	if (!pmodel.isDerived()){
		return pmodel;
	}
	var superTypes = pmodel.superTypes();
	
	for(var i = 0, ilen = superTypes.length; i < ilen; i++){
		var type = superTypes[i];
		
		var supModelID = pmodel.makeVersionedPackagedTypeStr(type.packages,type.versions, type.name );
				
		var psupModel = this.initModel(supModelID);
		var props = psupModel.getProperties();
		for (var p = 0, plen = props.length; p < plen; p++){
			var prop = props[p];
			if (!pmodel.hasProperty(prop.name)){
				pmodel.model.properties.push(prop);
			}
		}
	}
	
	pmodel.model["__extendedFor__"] = model["extends"];
	pmodel.model["extends"] = undefined;
	
	return pmodel;
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.initModel = function(modelID) {
	
	var pmodel = this.getModel(modelID);
	
	
	var packageID = this.lang.removeTypeFromPackagedTypeStr(modelID);

	var version = this.getLocalModelVersion(modelID);
	
	/* mix the locally read versions with the global collected versions. */
	for (var key in this.versions){
		if (version[key] == undefined)
			version[key] = this.versions[key];
	}
	
	pmodel.updateFromVersionedPackagedTypeStr(modelID, version);
	
	
	if (this.flatModel) {
		pmodel = this.flattenModel(pmodel);
	}
	
	/* save new generated model */
	var modelStr = JSON.stringify(pmodel.model, undefined, 2);
	var genPackagePath = this.generatedPackageIDtoPath(packageID);
	this.createOutPath(genPackagePath);
		
	var outFileName = this.lang.getOutModelFileNameFromPackagedTypeStr(modelID);
	var outFilePath = path.join(genPackagePath, outFileName);
		
	fs.writeFileSync( outFilePath, modelStr);
	/*--------------------------*/
	
	
	return pmodel;
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/* Code generator */
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
Generator.prototype.generate = function(model) {
	
	return this.lang.generate(model);
	
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.generateModel = function(modelID) {
	console.log("\t generating Model " + modelID + ' !');
	var model = this.initModel(modelID).model;
		
	var packageID = this.lang.removeTypeFromPackagedTypeStr(modelID);
	
	var outppath = this.initPackagePath(packageID);
	
	var outFileName = this.lang.getOutCodeFileNameFromVersionedPackagedTypeStr(modelID);

	var outFilePath = path.join(outppath, outFileName);
	
	fs.writeFileSync( outFilePath, this.generate(model));
	
	console.log("\t writing " + outFileName + ' !');
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.generateOnePackage = function(packageID) {
	console.log(njs.sep1);
	
	console.log("creating package " + packageID);
	console.log("output directory " + this.targetPackageIDtoPath(packageID));
	
	var ppath = this.sourcePackageIDtoPath(packageID); 
	
	var files = fs.readdirSync(ppath);
			
	for (var i = 0, len = files.length; i < len; i++) {
		var file = files[i];
		var filePath = path.join(ppath, file);
		
		if (fs.statSync(filePath).isFile()){
			/* this is a json file, probably model is not __version__*/
			var modelNameParts = file.split('.');
			var modelName = modelNameParts.slice(0,modelNameParts.length-1).join('.');
		 
			if (this.isModelName(modelName)){
				console.log(njs.sep2);
				console.log("creating " + modelName);
				this.generateModel( packageID + this.lang.packageSep + modelName);
			}
		}

	}
	
	console.log(njs.sep1);
};
/*----------------------------------------------------------------------------*/
Generator.prototype.generatePackagesRecursively = function(packageID) {
	console.log(njs.sep1);
	
	console.log("creating package " + packageID);
	console.log("output directory " + this.targetPackageIDtoPath(packageID));
	console.log(njs.sep2);
	
	var ppath = this.sourcePackageIDtoPath(packageID); 
	
	var files = fs.readdirSync(ppath);
			
	for (var i = 0, len = files.length; i < len; i++) {
		var file = files[i];
		var filePath = path.join(ppath, file);
		
		if (fs.statSync(filePath).isFile()){
			/* this is a json file, probably model is not __version__*/
			var modelNameParts = file.split('.');
			var modelName = modelNameParts.slice(0,modelNameParts.length-1).join('.');
		 
			if (this.isModelName(modelName)){
				this.generateModel( packageID + this.lang.packageSep + modelName);
			}
		}
		else if (fs.statSync(filePath).isDirectory()){
			/* probably another package, try to generate it too!*/
			this.generatePackagesRecursively(packageID + this.lang.packageSep + file);
		}
	}
	
	console.log(njs.sep1);
};
/*----------------------------------------------------------------------------*/
Generator.prototype.generatePackage = function(packageID) {
	
	console.log(njs.sep1);
	console.log("collecting versions for " + packageID);
	var versions = {};
	this.collectVersions(packageID, versions);
	this.versions = versions;
	
	/* save new generated versions */
	var modelStr = JSON.stringify(this.versions, undefined, 2);
	var genPackagePath = this.generatedPackageIDtoPath(packageID);
	this.createOutPath(genPackagePath);
		
	var outFileName = '__versions__(gen).' + this.modelExt;
	var outFilePath = path.join(genPackagePath, outFileName);
		
	fs.writeFileSync( outFilePath, modelStr);

	console.log(njs.sep1);
	
	
	/* generating packages */
	this.generatePackagesRecursively(packageID);
	
	return 'Package generator finished!';
};
/*----------------------------------------------------------------------------*/
module.exports = function() { return new Generator(); };

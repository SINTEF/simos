
var fs = require('fs');
var path = require('path');
var njs = require('./njs')();

var simosPath = require('./config.js').simosPath;

var config = require(path.join(simosPath,'config.js'));

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
	
	this.modelExt = 'json';
	
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
Generator.prototype.splitPackageName = function(packageName) {
	if (packageName.indexOf(this.lang.versionSep) == -1)
		return {"name": packageName, "version":""};
		
	var parts = packageName.split(this.lang.versionSep);
	
	return {"name": parts.slice(0, parts.length-1).join(this.lang.versionSep),
			"version": parts[parts.length-1]};
};
/*----------------------------------------------------------------------------*/
Generator.prototype.packageIDFromModelID = function(modelID) {
	var parts = modelID.split(this.lang.packageSep);
	return parts.slice(0,parts.length-1).join(this.lang.packageSep);
};
/*----------------------------------------------------------------------------*/
Generator.prototype.modelNameFromID = function(modelID) {
	var parts = modelID.split(this.lang.packageSep);
	return parts[parts.length-1];
};
/*----------------------------------------------------------------------------*/
Generator.prototype.expandPackages = function(packageID) {
	var ps = packageID.split(this.lang.packageSep);
	
	var packages = [];
	
	for (var i = 0, len = ps.length; i < len; i++) {
		packages.push(this.splitPackageName(ps[i]));
	}
	
	return packages;
};

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
	
	return require(modelPath);
	
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
Generator.prototype.addVersionToModel = function(model, version, packages) {
	
	/* add package and version data to model*/
	if (model[this.versionFlag] == undefined){
		model[this.versionFlag] =  version;
		/* adding current package and versions */
		for (var i=0, len = packages.length; i< len; i++){
			model[this.versionFlag][packages[i].name] = packages[i].version;
		}
	}
	
	return model;
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.collectVersions = function(packageID, versions) {
	
	console.log("\t collecting versions for " + packageID);
	var packages = this.expandPackages(packageID);
	var currentPackage = packages[packages.length-1];

	if (currentPackage.version != "")
		versions[currentPackage.name] = currentPackage.version;
	
	var ppath = this.sourcePackageIDtoPath(packageID); 
	
	var files = fs.readdirSync(ppath);
			
	for (var i = 0, len = files.length; i < len; i++) {
		var file = files[i];
		var filePath = path.join(ppath, file);
		if (fs.statSync(filePath).isDirectory()){
			/* probably another package, try to generate it too!*/
			this.collectVersions(packageID + this.lang.packageSep + file, versions);
		}
	}
		
	/* adding the explicitly defined versions for interfacing other packages*/
	var definedVersions = this.getLocalModelVersion(packageID);	
	for (var key in definedVersions) {
		versions[key] = definedVersions[key];
	}
};
/*----------------------------------------------------------------------------*/
Generator.prototype.addPackageDataToModel = function(model, packages) {
	
	if (model["package"] == undefined) {
		var packageNames = [];
		for (var i=0, len = packages.length; i< len; i++){
			packageNames.push(packages[i].name);
		}
		model["package"] =  packageNames.join(this.lang.packageSep);
	}
	
	return model;
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.addPackagesToPropType = function(model) {
	for (var p = 0, plen = model.properties.length; p < plen; p++){
		var prop = model.properties[p];
		if (!this.lang.isAtomic(prop)) {
			var packages = this.lang.splitPackages(prop.type);
			if (packages.length == 1) {
				prop.type = model["package"] + this.lang.packageSep + prop.type;
			}
		}
	}
	
	return model;

};
/*----------------------------------------------------------------------------*/
Generator.prototype.addPackagesToSuperTypes = function(model) {
	if (this.lang.isDerived(model)) {
		var exts = model["extends"];
		for (var p = 0, plen = exts.length; p < plen; p++){
			var ext = model["extends"][p];
			var packages = this.lang.splitPackages(ext);
			if (packages.length == 1) {
				model["extends"][p] = model["package"] + this.lang.packageSep + ext;
			}
		}
	}
	return model;

};
/*----------------------------------------------------------------------------*/
Generator.prototype.flattenModel = function(model) {
	if (!this.lang.isDerived(model)){
		return model;
	}
	var superTypes = this.lang.superTypes(model);
	
	for(var i = 0, ilen = superTypes.length; i < ilen; i++){
		var type = superTypes[i];
		var ppath = [];
		for (var j = 0, jlen = type.packages.length; j < jlen; j++){
			ppath.push(this.lang.addVersion(type.packages[j], type.versions[j]));
		}
		ppath.push(type.name);
		
		var supModelID = ppath.join(this.lang.packageSep);
				
		var supModel = this.initModel(supModelID);
		for (var p = 0, plen = supModel.properties.length; p < plen; p++){
			var prop = supModel.properties[p];
			if (!this.lang.hasProperty(prop.name, model)){
				model.properties.push(prop);
			}
		}
	}
	
	model["__extendedFor__"] = model["extends"];
	model["extends"] = undefined;
	
	return model;
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.initModel = function(modelID) {
	
	var model = this.getModel(modelID);
	
	var packageID = this.packageIDFromModelID(modelID);
	var packages = this.expandPackages(packageID);
	
	model = this.addPackageDataToModel(model, packages);

	var version = this.getLocalModelVersion(modelID);
	
	/* mix the locally read versions with the global collected versions. */
	for (var key in this.versions){
		if (version[key] == undefined)
			version[key] = this.versions[key];
	}
	
	model = this.addVersionToModel(model, version, packages);
	
	model = this.addPackagesToPropType(model);
	model = this.addPackagesToSuperTypes(model);
	
	if (this.flatModel) {
		model = this.flattenModel(model);
	}
	
	/* save new generated model */
	var modelStr = JSON.stringify(model, undefined, 2);
	var genPackagePath = this.generatedPackageIDtoPath(packageID);
	this.createOutPath(genPackagePath);
		
	var outFileName = this.modelNameFromID(modelID) + '(gen).' + this.modelExt;
	var outFilePath = path.join(genPackagePath, outFileName);
		
	fs.writeFileSync( outFilePath, modelStr);
	/*--------------------------*/
	
	
	return model;
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
	
	var model = this.initModel(modelID);
		
	var packageID = this.packageIDFromModelID(modelID);
	
	var outppath = this.initPackagePath(packageID);
	
	var outFileName = this.modelNameFromID(modelID) + '.' + this.lang.ext;
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
};
/*----------------------------------------------------------------------------*/
module.exports = function() { return new Generator(); };

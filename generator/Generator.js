
var fs = require('fs');
var path = require('path');
var njs = require('./njs')();

//var simosPath = require('./config.js').simosPath;

var simosPath = "..";

var config = require(path.join(simosPath,'config','langConfig.js'));

var ModelParser = require('./lang/ModelParser.js').ModelParser;


fs.mkdirPathSync = function(dirPath, mode) {
	  //Call the standard fs.mkdir
	try {
	  fs.mkdirSync(dirPath, mode);
	}
	catch (ex) {
	    //When it fail in this way, do the custom steps
	    if (ex && ex.code === 'ENOENT') {
	      //Create all the parents recursively
	      fs.mkdirPathSync(path.dirname(dirPath), mode);
	      //And then the directory
	      fs.mkdirPathSync(dirPath, mode);
	    }
	 }
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
	this.modelExt = 'json';

	this.versions = null;
	
	this.flatModel = true;
	
	this.generatedPackages = [];
	this.externalPackageDependencies = [];
	
	this.modelsPaths = [];
};
/*----------------------------------------------------------------------------*/
Generator.prototype.setSimosPath = function(p) {
	this.simosPath = path.resolve(p);
		
	if (this.lang != undefined)
		if (this.lang.packaging != undefined){
			this.lang.packaging.outPath = this.outPath;
			this.lang.packaging.simosPath = this.simosPath;
		}
};
/*----------------------------------------------------------------------------*/
Generator.prototype.setModelsPaths = function(ps) {
	for (var i = 0; i<ps.length; i++) {
		this.modelsPaths.push(path.resolve(ps[i]));
	}
};
Generator.prototype.appendModelsPath = function(p) {
	this.modelsPaths.push(path.resolve(p));
};

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
Generator.prototype.setOutPath = function(outPath) {
	this.outPath = outPath;
	if (this.lang != undefined)
	    if (this.lang.packaging != undefined)
	        this.lang.packaging.outPath = outPath;
};
/*----------------------------------------------------------------------------*/
Generator.prototype.setLang = function(lang) {
	
    var langName = lang.toLowerCase();
    if (this.langs[langName] != undefined){
		this.lang = require(path.join(this.simosPath, 'lang', langName, 'generator')).generator;
		if (this.lang != undefined)
			if (this.lang.packaging != undefined){
				this.lang.packaging.outPath = this.outPath;
				this.lang.packaging.simosPath = this.simosPath;
			}
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
Generator.prototype.packagesIn = function(ppath) {
	
	var files = fs.readdirSync(ppath);

    subPackages = [];
    
	for (var i = 0, len = files.length; i < len; i++) {
		var file = files[i];
		var filePath = path.join(ppath, file);
		
		if (fs.statSync(filePath).isDirectory() && (file[0] != '.')){
			/* probably another package, try to generate it too!*/
			subPackages.push(file);
		}
		
	}
	
	return subPackages
};
/*----------------------------------------------------------------------------*/
Generator.prototype.packages = function(p) {
    if (p != undefined)
    	return this.getSubPackages(p);
	
    subPackages = [];
    
	for (var i = 0; i<this.modelsPaths.length; i++) {
		var ppath = this.modelsPaths[i]; 
		
		subPackages = subPackages.concat(this.packagesIn(ppath));
	}
	
	return subPackages
};
/*----------------------------------------------------------------------------*/
Generator.prototype.getSubPackages = function(packageID) {
    
	var ppath = this.sourcePackageIDtoPath(packageID); 
	
	return this.packagesIn(ppath);
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.getSubPackagesCompleteID = function(packageID) {
    
	var subPackages = this.getSubPackages(packageID); 
	var subPackIDs = [];
	
	for (var i = 0; i<subPackages.length; i++) {
		subPackIDs.push(packageID + this.lang.packageSep + subPackages[i]);
	}
	return subPackIDs;
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.models = function(packageID) {
	return this.getPackageModels(packageID);
	
};

/*----------------------------------------------------------------------------*/
Generator.prototype.getPackageModels = function(packageID) {
    console.log(packageID);
	var ppath = this.sourcePackageIDtoPath(packageID); 
	var files = fs.readdirSync(ppath);

    models = [];
    
	for (var i = 0, len = files.length; i < len; i++) {
		var file = files[i];
		var filePath = path.join(ppath, file);
		
		if (fs.statSync(filePath).isFile()){
			/* this is a json file, probably model is not __version__*/
			var modelNameParts = file.split('.');
		    //Check that it is a json file
		    if (modelNameParts[modelNameParts.length-1] == 'json'){
			    var modelName = modelNameParts.slice(0,modelNameParts.length-1).join('.');
		     
			    if (this.isModelName(modelName)){
			        models.push( packageID + this.lang.packageSep + modelName);
			    }
		    }
		}
		
	}
	
	return models

}

/*----------------------------------------------------------------------------*/
Generator.prototype.sourcePackageIDtoPath = function(packageID) {
	 var packagePath = packageID.split(this.lang.packageSep).join('/');
	 
	 for (var i = 0; i<this.modelsPaths.length; i++) {
		 var packPath = path.join(this.modelsPaths[i], packagePath)
		 //console.log(packPath);
		 if (fs.existsSync(packPath)) {
			 return packPath;
		 }
	 }
	 throw(packageID + " not found in models paths " + this.modelsPaths);
};
/*----------------------------------------------------------------------------*/
Generator.prototype.sourceModelIDtoPath = function(modelID) {
	 var modelPath = modelID.split(this.lang.packageSep).join('/');
	 
	 for (var i = 0; i<this.modelsPaths.length; i++) {
		 var mPath = path.join(this.modelsPaths[i], modelPath)
		 //console.log(mPath+ '.' + this.modelExt);
		 if (fs.existsSync(mPath+ '.' + this.modelExt)) {
			 return mPath;
		 }
	 }
	 throw(mPath + " not found in models paths " + this.modelsPaths);
};
/*----------------------------------------------------------------------------*/
Generator.prototype.targetPackageIDtoPath = function(packageID) {
	var packagePath = '';
	
	if (this.lang.name.toLowerCase() == 'python'){
		packagePath = packageID.split(this.lang.packageSep).join('/');
	}
	else if (this.lang.name.toLowerCase() == 'fortran'){
		packagePath = this.lang.makeGeneratedCodeOutPath(packageID);
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
	var packagePath = packageID.split(this.lang.packageSep).join('/');
	var genPackagePath = path.join(this.outPath, 'generatedModels', 
									packagePath);
	//console.log(genPackagePath)
	return genPackagePath;
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
	
	var modelPath = this.sourceModelIDtoPath(modelID);
	
	//console.log(path.resolve(modelPath) + '.' + this.modelExt);
	delete require.cache[path.resolve(modelPath+ '.' + this.modelExt)];
	
	var model = require(modelPath);
	
	return new ModelParser(model);
	
};

/*----------------------------------------------------------------------------*/
Generator.prototype.getLocalModelVersion = function(packageID) {

	var dir = this.sourcePackageIDtoPath(packageID);

	//var dir = path.dirname(modelPath);
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
	
	var packages = this.lang.versionedPackagesFromVersionedPackagedStr(packageID);

	var currentPackage = {"name": packages.names[0],
						  "versions": packages.versions[0]};

	if (currentPackage.version != "")
		versions[currentPackage.name] = currentPackage.version;
    
	/* adding the explicitly defined versions for interfacing other packages*/
	var definedVersions = this.getLocalModelVersion(packageID);	

	for (var key in definedVersions) {
		versions[key] = definedVersions[key];
	}

    console.log(JSON.stringify(versions));
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
	
	pmodel.setType(pmodel.getName());
	
	var packageID = this.lang.removeTypeFromPackagedTypeStr(modelID);

	var version = this.getLocalModelVersion(packageID);
	
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
Generator.prototype.generate = function(model, outFileContent) {
	
    if ('extractUserDefinedCode' in this.lang)
        this.lang.extractUserDefinedCode(outFileContent);
    
	return this.lang.generate(model);
	
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.generateModel = function(modelID, outppath) {
	console.log("\t generating Model " + modelID + ' !');
	var modelParser = this.initModel(modelID);
			
	//var packageID = this.lang.removeTypeFromPackagedTypeStr(modelID);
	
	//var outppath = this.initPackagePath(packageID);
	
	var outFileName = this.lang.getOutCodeFileNameFromVersionedPackagedTypeStr(modelID);

	var outFilePath = path.join(outppath, outFileName);
    var outFileContent = '';	
    try {
        if (fs.statSync(outFilePath).isFile())
            outFileContent = fs.readFileSync(outFilePath).toString();
    }
    catch (e) {};

	fs.writeFileSync( outFilePath, this.generate(modelParser.model, outFileContent));
	
	this.lang.packaging.appendPackageSourceFile(outFileName)
	
	  
	//get model custom types and added to libs
	
	console.log("\t writing " + outFileName + ' !');
	
	return modelParser;
};
/*----------------------------------------------------------------------------*/
Generator.prototype.generateOnePackage = function(packageID) {
	console.log(njs.sep1);
	
	console.log("creating package " + packageID);
	
	
	var modelIDs = this.getPackageModels(packageID);
	//console.log("    models " + modelIDs);
	
	if (! this.lang.packaging.isValidPackage(packageID, modelIDs.length))
	    return;

	//making folder sturucture and nessesary files
	var outppath = this.lang.packaging.initPackage(packageID);
	
	console.log("output directory " + outppath);
	
	console.log(njs.sep2);	
	
	var depPacks = [];
	
	for (var i = 0, len = modelIDs.length; i < len; i++) {
		var modelID = modelIDs[i];
	    var mParser = this.generateModel(modelID, outppath);
	    
	    //var mDepPacks = mParser.getModelDepVersionedPackages();
	    //var mDepPacks = mParser.getModelDepRootVersionedPackagesAndDepInternalPackages();
	    var mDepPacks = mParser.getModelExternalDepRootVersionedPackagesAndInternalDepPackages();
	    //console.log("mDepPacks: \n" + mDepPacks.join('\n'));
	    
	    for (var dpi = 0; dpi < mDepPacks.length; dpi++) {
	    	if (depPacks.indexOf(mDepPacks[dpi]) == -1)
	    		depPacks.push(mDepPacks[dpi]);
	    }
	}
	    
	//Change packageIDs to their representative path for each language
	for (var dpi = 0, len = depPacks.length; dpi < len; dpi++) {
		this.lang.packaging.appendDependencyPackage(this.lang.makeModulePath(depPacks[dpi]))
		
		if (this.externalPackageDependencies.indexOf(depPacks[i]) == -1)
			this.externalPackageDependencies.push(depPacks[i])
    }	
	
	//writing packing files, like cmake files.
	this.lang.packaging.finalizePackage(packageID);
	
	this.generatedPackages.push(packageID);
	
	console.log(njs.sep1);
};
/*----------------------------------------------------------------------------*/
Generator.prototype.generatePackagesRecursively = function(packageID) {	
	//Generate current package
	this.generateOnePackage(packageID);	

	//generate subpackages
	var subPackages = this.getSubPackagesCompleteID(packageID);
				
	if (subPackages.length > 0)
		console.log("sub-packages are : \n" + subPackages.join('\n'));
	
	for (var i = 0, len = subPackages.length; i < len; i++) {
		var subPackage = subPackages[i];
		this.generatePackagesRecursively(subPackage);
	}
	
	console.log(njs.sep1);
};
/*----------------------------------------------------------------------------*/
Generator.prototype.generatePackage = function(packageID) {
	
	//empty generated packages list
	this.generatedPackages = [];
	this.externalPackageDependencies = [];
	
	
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
	
	
	/*collecting generated packages info */
	var extPackages = []
	for (var dpi = 0, len = this.externalPackageDependencies.length; dpi < len; dpi++) {		
		if (this.generatedPackages.indexOf(this.externalPackageDependencies[dpi]) == -1)
			extPackages.push(this.externalPackageDependencies[dpi])
    }	
	this.externalPackageDependencies = extPackages.concat(this.lang.getGeneralModulesTypes());
	
	this.lang.packaging.writeExternalDependenciesList(this.externalPackageDependencies, this.getOutPath(), packageID);
	
	// for now it is assumed that all libraries are compiled under the root package name
	// Therefore, in case a subpackages only is generated we need to estract the root name
	rootPackageID = packageID.split(this.lang.packageSep)[0]
	this.lang.packaging.writeGeneratedPackagesList(this.generatedPackages, this.getOutPath(), rootPackageID);
	
	this.externalPackageDependencies
	return 'Package generator finished!';
};

/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/* Interactive use functions */
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
Generator.prototype.parseModel = function(modelID) {
	if (modelID==undefined) {
		throw("please provide modelID, example marmo_r1:basic:NamedEntity.")
	} 
	return new ModelParser(modelID);
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.getModelParser = function() {

	return new ModelParser();
	
};
/*----------------------------------------------------------------------------*/
Generator.prototype.ls = function(packageID) {
	if (packageID==undefined) {
		throw("please provide packageID, example marmo_r1.")
	} 
	
	var packages = this.packages(packageID)
	var models = this.models(packageID);
	
	console.log("Looking into " + packageID);
	console.log("Contained Sub-packages ...");
	console.log(packages)
	console.log("Contained Models ...");
	console.log(models)
	
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/* instantiate a generator */
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
module.exports = function() { return new Generator(); };

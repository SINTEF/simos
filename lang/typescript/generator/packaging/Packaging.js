var path = require('path');
var fs = require('fs');
var fsextra = require('fs-extra');

//var simosPath = require('../config.js').simosPath;

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
function Packaging(lang){
	this.constructor(lang);
};
exports.Packaging = Packaging;
// module.exports = function(model) { return new Packaging(model); };

/*----------------------------------------------------------------------------*/
//Packaging.prototype = Object.create();

/*----------------------------------------------------------------------------*/
Packaging.prototype.constructor = function(lang) {
	this.lang = lang;
    
	this.simosPath = '';
	
    this.outPath = '';
	
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.isValidPackage = function(packageStr, nModels) {
    return true;
}

/*----------------------------------------------------------------------------*/
Packaging.prototype.initPackage = function(packageStr) {
	
    var packagePath = this.getGeneratedPackageOutPath(packageStr);

    //console.log("initializing package " +packagePath );
    //console.log("initializing package " +this.getTemplatePath() );
    
    //create folders leading to the package
    if (! fs.existsSync(packagePath)) {
         fs.mkdirPathSync(packagePath);
    }

	//var initFilePath = path.join(packagePath, '__init__.py');
	//if (!fs.existsSync(initFilePath))
	//	fs.writeFileSync( initFilePath,	'');
	
    return packagePath;
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.finalizePackage = function(packageStr) {
    //nothing to be done
    
};


/*----------------------------------------------------------------------------*/
Packaging.prototype.getGeneratedPackageName = function(packageStr) {
    return packageStr.split(this.lang.packageSep).join(path.sep);
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.getGeneratedPackageOutPath = function(packageStr) {

	return (path.join(this.outPath, this.getGeneratedPackageName(packageStr)));

};
/*----------------------------------------------------------------------------*/

Packaging.prototype.appendPackageSourceFile = function(file) {
	//not keeping track of source files for now.
}
/*----------------------------------------------------------------------------*/

Packaging.prototype.appendDependencyPackage = function(file) {
	//not keeping track of dependency packages for now.

}
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*   writing packages dependencies and generated libs */
/*----------------------------------------------------------------------------*/
Packaging.prototype.writeExternalDependenciesList = function(packages,outPath, packName) {
	var outFilePath = path.join(outPath, packName + '_packExtDeps.txt');
	fs.writeFileSync( outFilePath, packages.join('\n'));
}

Packaging.prototype.writeGeneratedPackagesList = function(packages,outPath, packName) {
	var outFilePath = path.join(outPath, packName + '_packs.txt');
	fs.writeFileSync( outFilePath, packages.join('\n'));
}
/*----------------------------------------------------------------------------*/


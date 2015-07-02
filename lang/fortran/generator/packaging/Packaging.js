var path = require('path');
var fs = require('fs.extra');

var simosPath = require('../config.js').simosPath;

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
    
	this.templatePath = './template';

    this.mainOutPath = '';
    
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.initPackage = function(packageStr) {
    
    var packagePath = this.getGeneratedPackageOutPath(packageStr);

    //create folders leading to the package
    if (! fs.existsSync(packagePath)) {
        try {
          fs.mkdirpSync(packagePath);
        } catch(e) {
          throw e;
        }
    }

    var cmakePath = this.cmakePath(packageStr);
    
    if (! fs.existsSync(cmakePath)) {
        try {
          fs.mkdirSync(cmakePath);
        } catch(e) {
          throw e;
        }
    }    
    
    var srcPath = this.sourcePath(packageStr);
    
    if (! fs.existsSync(srcPath)) {
        try {
          fs.mkdirSync(srcPath);
        } catch(e) {
          throw e;
        }
    }  
    
    var testPath = this.testsPath(packageStr);
    
    if (! fs.existsSync(testPath)) {
        fs.copyRecursive(path.join('.',this.templatePath,'tests'), packagePath , function (err) {
          if (err) {
            throw err;
          }     
        }); 
    }  
    
    var cmakeListsPath = path.join(packagePath, 'CMakeLists.txt');
    
    if (! fs.existsSync(cmakeListsPath)) {
        fs.copy(path.join('.',this.templatePath,'CMakeLists.txt'), packagePath , function (err) {
          if (err) {
            throw err;
          }     
        }); 
    } 

};
/*----------------------------------------------------------------------------*/
Packaging.prototype.finalizePackage = function(packageStr, files, libs) {
    //put correct source files and libraries into cmake files
    var libs = this.libDepts;
    var files = this.srcFiles;
    
    
    libsources.cmake
    
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.writeLibVersion = function(packageStr) {
    var libName = this.getGeneratedPackageName(packageStr);
    //TODO: find version 
    var ver = '0.0.1';
    
    var cmds = [];
    
    cmds.push('# Sets:');
    cmds.push('#   - library name');
    cmds.push('#   - library version');
    cmds.push('#   - programming languages used (needed for the linking)');
    cmds.push('set (LIB ' + libName + ')');
    cmds.push('project (${LIB}');
    cmds.push('    VERSION ' + ver );
    cmds.push('    LANGUAGES Fortran C CXX)');

    var outFileName = 'libversion.cmake';
	var outFilePath = path.join(this.cmakePath(packageStr), outFileName);

	fs.writeFileSync( outFilePath, cmds.join('\n'));    
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.writeLibDeps = function(packageStr, libs) {

    var outFileName = 'libdependencies.cmake';
	var outFilePath = path.join(this.cmakePath(packageStr), outFileName);

    var outFileContent = '';	
    try {
        if (fs.statSync(outFilePath).isFile())
            outFileContent = fs.readFileSync(outFilePath).toString();
        else {
            fs.copy(path.join(this.templatePath,'cmake','outFileName'), this.cmakePath(packageStr) , function (err) {
                if (err) {
                throw err;
                }     
                }); 
        }
            
    }
    catch (e) {};
    
    //replace generated libs
	fs.writeFileSync( outFilePath, cmds.join('\n'));    
};

/*----------------------------------------------------------------------------*/
Packaging.prototype.getGeneratedPackageName = function(packageStr) {
    return packageStr.split(this.lang.packageSep).join('_');
}
/*----------------------------------------------------------------------------*/
Packaging.prototype.getGeneratedPackageOutPath = function(packageStr) {
    
	return (path.join(this.mainOutPath, this.getGeneratedPackageName(packageStr)));

};
/*----------------------------------------------------------------------------*/
Packaging.prototype.cmakePath = function(packageStr) {
    return path.join(this.getGeneratedPackageOutPath(packageStr), 'cmake');
}
/*----------------------------------------------------------------------------*/
Packaging.prototype.sourcePath = function(packageStr) {
    return path.join(this.getGeneratedPackageOutPath(packageStr), 'source');
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.testsPath = function(packageStr) {
    return path.join(this.getGeneratedPackageOutPath(packageStr), 'tests');
};
/*----------------------------------------------------------------------------*/

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
    
	this.templatePath = path.join('lang','fortran','generator','packaging','template');
	this.simosPath = '';
	
    this.outPath = '';

	this.packageFiles = { "src" : { "name" : "sources",
	                  			 "fileName" : "libsources.cmake",
				                  "start" : "#@@@@@ SIMOS GENERATED SOURCE FILES START @@@@@",
								  "end"   : "#@@@@@ SIMOS GENERATED SOURCE FILES END @@@@@",
								  "comment": "# SIMOS generated source files, DO NOT EDIT",
								  "varName" : "PUBLIC_SOURCES_FORTRAN_SIMOS",
								  "files" : []},
	
						"lib" : {  "name" : "libs",
								  "fileName" : "libdependencies.cmake",
				                  "start" : "#@@@@@ SIMOS GENERATED LIB DEPS START @@@@@",
								  "end"   : "#@@@@@ SIMOS GENERATED LIB DEPS END @@@@@",
								  "comment": "# SIMOS generated source files libs, DO NOT EDIT",
								  "varName" : "LIB_DEPENDENCIES_SIMOS",
								  "files" : []}
						};
	
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.isValidPackage = function(packageStr, nModels) {
    if (nModels == 0)
        return false;
    else
        return true;
}
/*----------------------------------------------------------------------------*/
Packaging.prototype.getTemplatePath = function() {
	return path.join(this.simosPath, this.templatePath);
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.initPackage = function(packageStr) {
	
	
    var packagePath = this.getGeneratedPackageOutPath(packageStr);

    //console.log("initializing package " +packagePath );
    //console.log("initializing package " +this.getTemplatePath() );
    
    //create folders leading to the package
    if (! fs.existsSync(packagePath)) {
         fs.mkdirPathSync(packagePath);
    }

    var cmakePath = this.cmakePath(packageStr);
    
    if (! fs.existsSync(cmakePath)) {
          fs.mkdirPathSync(cmakePath);
    }    
    
    var srcPath = this.sourcePath(packageStr);
    
    if (! fs.existsSync(srcPath)) {
          fs.mkdirPathSync(srcPath);
    }  
    
    var testPath = this.testsPath(packageStr);
    
    if (! fs.existsSync(testPath)) {
    	
        fsextra.copy(path.join(this.getTemplatePath(),'tests'), testPath , function (err) {
          if (err) {
            throw err;
          }     
        });
         
    }  
    
    var cmakeListsPath = path.join(packagePath, 'CMakeLists.txt');
    
    if (! fs.existsSync(cmakeListsPath)) {
        fsextra.copy(path.join(this.getTemplatePath(),'CMakeLists.txt'), cmakeListsPath , function (err) {
          if (err) {
            throw err;
          }     
        });
         
    } 

    
    //initializing the file lists
	for (key in this.packageFiles) {
	    var cmake = this.packageFiles[key];
	    cmake.files = [];
	}
	
    return srcPath;
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.finalizePackage = function(packageStr) {
    //put correct source files and libraries into cmake files
    this.writeLibVersion(packageStr);
    this.writeCMakeFiles(packageStr);
    
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
Packaging.prototype.writeCMakeFiles = function(packageStr) {

	for (key in this.packageFiles) {
	    var cmake = this.packageFiles[key];
	
	    var outFileName = cmake.fileName;
		var outFilePath = path.join(this.cmakePath(packageStr), outFileName);
	
		//console.log("src files make");
		//console.log(path.join(this.getTemplatePath(),'cmake',outFileName));
		
	    var outFileContent = '';	
        if (fs.existsSync(outFilePath))
            outFileContent = fs.readFileSync(outFilePath).toString();
        else {
        	outFileContent = fs.readFileSync(path.join(this.getTemplatePath(),'cmake',outFileName)).toString();
        }

	    
	    //make code
	    var cmds = [];
	    cmds.push(cmake.start);
	    cmds.push(cmake.comment);
	    cmds.push('set (' + cmake.varName );
	    
	    /*read and add general modules data types for lib dependency from lang*/
	    if (cmake.name == 'libs'){
	    	var genLibs = this.lang.getGeneralModulesLibs()
	    	if (genLibs.length > 0)
	    		cmds.push(genLibs.join('\n'))
	    }
	    
	    if (cmake.files.length > 0)
	    	cmds.push(cmake.files.join('\n'));
	    
	    cmds.push('    )');
	    cmds.push(cmake.end);
	    
	    outFileContent = this.addGeneratedCMakeCode(outFileContent, cmake, cmds.join('\n'));

	    //replace generated libs
		fs.writeFileSync( outFilePath, outFileContent);
	}
};


/*----------------------------------------------------------------------------*/
Packaging.prototype.getGeneratedPackageName = function(packageStr) {
	var packName = this.lang.removeVersionsFromVersionedPackagedStr(packageStr);
    return packName.split(this.lang.packageSep).join('_');
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.getGeneratedPackageOutPath = function(packageStr) {
	var rootPack = this.lang.getRootPackageFromPackageStr(packageStr);
	
	return (path.join(this.outPath, rootPack, this.getGeneratedPackageName(packageStr)));

};
/*----------------------------------------------------------------------------*/
Packaging.prototype.cmakePath = function(packageStr) {
    return path.join(this.getGeneratedPackageOutPath(packageStr), 'cmake');
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.sourcePath = function(packageStr) {
    return path.join(this.getGeneratedPackageOutPath(packageStr), 'source');
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.testsPath = function(packageStr) {
    return path.join(this.getGeneratedPackageOutPath(packageStr), 'tests');
};
/*----------------------------------------------------------------------------*/

Packaging.prototype.appendPackageSourceFile = function(file) {
	if (this.lang.packaging.packageFiles.src.files.indexOf(file) == -1)
	    this.lang.packaging.packageFiles.src.files.push(file)
}
/*----------------------------------------------------------------------------*/

Packaging.prototype.appendDependencyPackage = function(file) {
	//var file = this.lang.makeModulePath(packagedStr)
	if (this.lang.packaging.packageFiles.lib.files.indexOf(file) == -1)
		this.lang.packaging.packageFiles.lib.files.push(file);

}
/*----------------------------------------------------------------------------*/
/*   Handling simos geenrated cmake code */
/*----------------------------------------------------------------------------*/
Packaging.prototype.addGeneratedCMakeCode = function(code, part, addCode) {
    if ((code == undefined) || (code == ''))
        return;
    
    var lines = code.split('\n');
    var newCode = '';
    
    //var part = this.simosSrcs;
    var sind = lines.indexOf(part.start);
    if (sind != -1) {
        var eind = lines.indexOf(part.end);
        if ((eind - sind) > 1){
            console.log("            simos " + part.name + " in cmake betweeb lines : " + sind  + " and " + eind);
            
            var topPart = lines.slice(0,sind).join('\n');
            var botPart = lines.slice(eind+1,lines.length).join('\n');
            
            newCode = [topPart, addCode, botPart].join('\n');
        }
        else {
            throw("something is wrong with SIMOS generated " + part.name + " in cmake.")
        	newCode = lines.join('\n');
        }
    }
    else
    	newCode = [lines.join('\n'), addCode].join('\n');
    	
    return newCode;
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*   writing packages dependencies and generated libs */
/*----------------------------------------------------------------------------*/
Packaging.prototype.writeExternalDependenciesList = function(packages,outPath, packName) {
	var outFilePath = path.join(outPath, packName + '_packExtDeps.txt');
	fs.writeFileSync( outFilePath, packages.join('\n'));
}

Packaging.prototype.writeGeneratedPackagesList = function(packages,outPath, packName) {
	
	//write a dummy file
	var cmds = [];
	cmds.push('subroutine dummy()');
	cmds.push('    implicit none');
	cmds.push('    !Do nothing..');
	cmds.push('end subroutine dummy');

	var outFilePath = path.join(outPath, packName, 'dummy.f90');
	fs.writeFileSync( outFilePath, cmds.join('\n'));
	
	//write a CMAKE file for the libraary
	var packNames = [];
	for (var i=0; i<packages.length; i++){
		packNames.push(this.getGeneratedPackageName(packages[i]));
	}
	
	var cmds = [];
	cmds.push('# sub-packages');
	for (var i=0; i<packNames.length; i++){
		cmds.push('add_subdirectory (' + packNames[i] + ')');
	}
	cmds.push('# library');
	cmds.push('add_library (' + packName + ' dummy.f90)');
	cmds.push('# linking sub-packages');
	cmds.push('target_link_libraries (' + packName);
	cmds.push(packNames.join('\n'));
	cmds.push(')');
	
	var outFilePath = path.join(outPath, packName, 'CMakeLists.txt');
	fs.writeFileSync( outFilePath, cmds.join('\n'));
}
/*----------------------------------------------------------------------------*/


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
    
	this.templatePath = path.join('lang','latdoc','generator','packaging','template');
	this.simosPath = '';

    this.outPath = '';
	
};
/*----------------------------------------------------------------------------*/
Packaging.prototype.isValidPackage = function(packageStr, nModels) {
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
	
    return packagePath;
};
/*----------------------------------------------------------------------------*/

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
};
/*----------------------------------------------------------------------------*/

Packaging.prototype.appendDependencyPackage = function(file) {
	//not keeping track of dependency packages for now.

};
/*----------------------------------------------------------------------------*/
Packaging.prototype.getPackageVersion = function(packID) {	
    parts = packID.split(this.lang.packageSep);
    return parts[0].split("_")[1];
};
    
/*----------------------------------------------------------------------------*/
Packaging.prototype.getModelHeader = function(modelID) {	
	var cmd = [];
	
	var parts = modelID.split(this.lang.packageSep);
	
	cmd.push('	%------------------------------------------------------------------------------');	
	cmd.push('\\clearpage');
	cmd.push('	\\section{' + parts[parts.length-1] + '}');
	cmd.push('	\\label{sec:' + modelID.replace("_" + this.getPackageVersion(modelID), "") + '}');
	cmd.push('	%------------------------------------------------------------------------------');	
	cmd.push("		\\input{"+ parts.join("/")+".tex}");
	cmd.push('	%------------------------------------------------------------------------------');
	
	return cmd.join("\n");
};

/*----------------------------------------------------------------------------*/
Packaging.prototype.getPackageHeader = function(packagelID) {	
	var cmd = [];
	
	var packDeVer = packagelID.replace("_" + this.getPackageVersion(packagelID), "");
	    
    cmd.push('%***************************************************************************');
	cmd.push('\\clearpage');
	cmd.push('\\chapter{' + packDeVer + '}');
	cmd.push('\\label{chap:' + packDeVer + '}');
	cmd.push('%***************************************************************************');
	
	return cmd.join("\n");
}
/*----------------------------------------------------------------------------*/
Packaging.prototype.writeMainTexFile = function(models,packages, outPath, packName) {
	var outFilePath = path.join(outPath, packName + '_documentation.tex');
	
	var cmd = [];
	
	cmd.push("\\documentclass[a4]{report}");
	cmd.push("%-----------------------------------------------------------------------------");
	cmd.push("%page layouts");
	cmd.push("\\usepackage{lscape}");
	cmd.push("\\usepackage[margin=0.5in]{geometry}");
	cmd.push("%-----------------------------------------------------------------------------");
	cmd.push("%-----------------------------------------------------------------------------");
	cmd.push("%graphical ackages");
	cmd.push("\\usepackage{graphicx}");
	cmd.push("\\DeclareGraphicsExtensions{.pdf,.png,.jpg,.eps}");
	cmd.push("\\usepackage[singlelinecheck=false]{caption}");
	cmd.push("\\usepackage{epstopdf}");
	cmd.push("%-----------------------------------------------------------------------------");
	cmd.push("\\usepackage[bookmarks=true, hidelinks]{hyperref}");
	cmd.push("\\usepackage{xcolor}");
	cmd.push("\\hypersetup{");
    cmd.push("    colorlinks,");
    cmd.push("    linkcolor={blue!50!black},");
    cmd.push("    citecolor={blue!50!black},");
    cmd.push("    urlcolor={blue!80!black}");
    cmd.push("}	");
	cmd.push("\\usepackage{bookmark}");	
	cmd.push("%-----------------------------------------------------------------------------");
	cmd.push("%----Add Breakable char for tables -------------------------------------------");
	cmd.push("%-----------------------------------------------------------------------------");
	cmd.push("\\usepackage{hyphenat}");
	cmd.push("\\usepackage{xstring}");
	cmd.push("\\usepackage{forloop}");
	cmd.push("\\usepackage{collcell}");
	cmd.push("");
	cmd.push("\\newsavebox\\MyBreakChar%");
	cmd.push("\\sbox\\MyBreakChar{}% char to display the break after non char");
	cmd.push("\\newsavebox\\MySpaceBreakChar%");
	cmd.push("\\sbox\\MySpaceBreakChar{-}% char to display the break after space");
	cmd.push("\\makeatletter%");
	cmd.push("\\newcommand*{\\BreakableChar}[1][\\MyBreakChar]{%");
	cmd.push("  \\leavevmode%");
	cmd.push("  \\prw@zbreak%");
	cmd.push("  \\discretionary{\\usebox#1}{}{}%");
	cmd.push("  \\prw@zbreak%");
	cmd.push("}%");
	cmd.push("");
	cmd.push("\\newcounter{index}%");
	cmd.push("\\newcommand{\\AddBreakableChars}[1]{%");
	cmd.push("  \\StrLen{#1 }[\\stringLength]%");
	cmd.push("  \\forloop[1]{index}{1}{\\value{index}<\\stringLength}{%");
	cmd.push("    \\StrChar{#1}{\\value{index}}[\\currentLetter]%");
	cmd.push("    \\IfStrEq{\\currentLetter}{:}");
	cmd.push("        {\\currentLetter\\BreakableChar[\\MyBreakChar]}%");
	cmd.push("        {\\currentLetter}%");
	cmd.push("  }%");
	cmd.push("}%");
	cmd.push("");
	cmd.push("\\newcolumntype{P}[1]{>{\\collectcell\\AddBreakableChars}p{#1}<{\\endcollectcell}}");
	cmd.push("%-----------------------------------------------------------------------------");
	cmd.push("\\begin{document}");
	cmd.push("%-----------------------------------------------------------------------------");	
	cmd.push("\\begin{titlepage}");
	cmd.push("\\centering");
	cmd.push("\\includegraphics[width=0.30\\textwidth]{marintek_logo_blue.pdf}\\par\\vspace{1cm}");
	cmd.push("\\vfill");
	cmd.push("{\\scshape\\Large Auto-Generated Library Documentation by SIMOS \\par}");
	cmd.push("\\vspace{1cm}");
	cmd.push("");
    cmd.push("{\\huge\\bfseries MarMo Metaocean Library \\par}");
    cmd.push("\\vspace{2cm}");
    cmd.push("{\\Large\\itshape Babak Ommani \\par}");
    cmd.push("\\vfill");
    cmd.push("{\\large \\today\\par}");
    cmd.push("\\vfill");
    cmd.push("% Bottom of the page");
    cmd.push("{}");
    cmd.push("\\end{titlepage}");
	cmd.push("%-----------------------------------------------------------------------------");
	cmd.push("\\pdfbookmark{\\contentsname}{Contents}");
	cmd.push("\\tableofcontents");
	cmd.push("%-----------------------------------------------------------------------------");
	cmd.push("%-----------------------------------------------------------------------------");
	for (var i=0; i<packages.length; i++) {
	    var pack = packages[i];
	    if (models[pack].length > 0) {
	        cmd.push(this.getPackageHeader(pack))
	        for (var j=0; j<models[pack].length; j++){
	            cmd.push(this.getModelHeader(models[pack][j]))
	        }   
	    }	    
	}
	cmd.push("%-----------------------------------------------------------------------------");
	cmd.push("%-----------------------------------------------------------------------------");
	cmd.push("\\end{document}");
	
	fs.writeFileSync( outFilePath, cmd.join("\n"));
	
	var logoPath = path.join(outPath, 'marintek_logo_blue.pdf');
	
	if (! fs.existsSync(logoPath)) {
	    fsextra.copy(path.join(this.getTemplatePath(),'marintek_logo_blue.pdf'), logoPath , function (err) {
	      if (err) {
	        throw err;
	      }     
	    });
	     
	} 	
};
	
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*   writing packages dependencies and generated libs */
/*----------------------------------------------------------------------------*/
Packaging.prototype.writeExternalDependenciesList = function(packages,outPath, packName) {
	var outFilePath = path.join(outPath, packName + '_packExtDeps.txt');
	fs.writeFileSync( outFilePath, packages.join('\n'));
};

Packaging.prototype.writeGeneratedPackagesList = function(packages,outPath, packName) {
	var outFilePath = path.join(outPath, packName + '_packs.txt');
	fs.writeFileSync( outFilePath, packages.join('\n'));
};

Packaging.prototype.finalizeGeneratedModels = function(models,packages, outPath, packName) {
	this.writeMainTexFile(models,packages, outPath, packName);
};
/*----------------------------------------------------------------------------*/


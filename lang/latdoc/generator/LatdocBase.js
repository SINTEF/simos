var path = require('path');
var fs = require('fs');

var simosPath = require('./config.js').simosPath;
var CommonLangBase = require(path.join(simosPath, 'generator','lang','CommonLangBase.js')).CommonLangBase;

var Packaging = require('./packaging/Packaging.js').Packaging;

/*----------------------------------------------------------------------------*/
function LatdocBase(model){
	this.constructor(model);
};
exports.LatdocBase = LatdocBase;
// module.exports = function(model) { return new LatdocBase(model); };

/*----------------------------------------------------------------------------*/
LatdocBase.prototype = Object.create(CommonLangBase.prototype);
/*----------------------------------------------------------------------------*/

packageParts = [ ];

for (var ip=0, len = packageParts.length; ip<len; ip++) {
	var packPath = packageParts[ip];
	var packPathParts = packPath.split('/');
	var packName = packPathParts[packPathParts.length-1];
	var addPack = require(packPath);
	addPack = addPack[packName];
	for (key in addPack.prototype){
		LatdocBase.prototype[key] = addPack.prototype[key];
	}
}

/*----------------------------------------------------------------------------*/
LatdocBase.prototype.constructor = function(model) {
	CommonLangBase.prototype.constructor(model);
	
	this.targetType = {
	    "float"		:"float",
	    "double"	:"float",
	    "short"		:"int",
	    "integer"	:"int",
	    "boolean"	:"bool",
	    "string"	:"str",
	    "char"		:"str",
	    "tiny"		:"int",
	    "object"	:"object"
	};

	/*a list of modules/libs to be important for all files*/
	this.generalModules = [{'name': 'numpy', 'alias': 'np'},
	                       {'name': 'os'},
	                       {'name': 'warnings'},
	                       {'name': 'traceback'},
	                       {'name': 'collections'},
	                       {'name': 'uuid'},
	                       {'name': 'simos.storage', 'alias': 'pyds'},
	                       {'name': 'json', 'try': true},
	                       {'name': 'bson', 'try': true},
	                       {'name': 'h5py', 'try': true},
	                       {'name': 'pymongo', 'try': true}];
	
	this.name = 'latdoc';
	this.ext = 'tex';
	
	this.packagePathSep = '\\';
	
	this.blockSpace = '    ';
	
	this.sep1 = '%******************************************************************************';
	this.sep2 = '%---------------------------------------------------------------------------';
	
	//make packaging module
	this.packaging = new Packaging(this);
	
	this.userCodes = {  "import"  : {	"start" : "#@@@@@ USER DEFINED IMPORTS START @@@@@",
										"end"   : "#@@@@@ USER DEFINED IMPORTS End   @@@@@",
										"code"  : ""},
						"prop"    : {	"start" : "#@@@@@ USER DEFINED PROPERTIES START @@@@@",
										"end"   : "#@@@@@ USER DEFINED PROPERTIES End   @@@@@",
										"code"  : ""},
						"method"  : {	"start" : "#@@@@@ USER DEFINED METHODS START @@@@@",
										"end"   : "#@@@@@ USER DEFINED METHODS End   @@@@@",
										"code"  : ""} };
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.stringify = function(str) {
	return (JSON.stringify(str));
};

/*----------------------------------------------------------------------------*/
LatdocBase.prototype.makeModulePath = function(packagedTypeStr) {
	var type = '';
	
    if (typeof(packagedTypeStr) == 'object') {
        type = packagedTypeStr;
    }
    else{
    	type = this.parsePackagedTypeStr(packagedTypeStr);
    }
    
	var versionedPackages = this.makeVersionedPackages(type.packages, type.versions);

	return (versionedPackages.join(this.packagePathSep) + this.packagePathSep + type.name);

};

LatdocBase.prototype.getClassPathFromType = function(packagedTypeStr) {
	var parsed = this.parsePackagedTypeStr(packagedTypeStr);
	var modulePath = this.makeModulePath(parsed);
	
	return (modulePath + this.packagePathSep + parsed.name);
};

LatdocBase.prototype.getOutCodeFileNameFromVersionedPackagedTypeStr = function(modelID) {
	return this.getModelNameFromPackagedTypeStr(modelID) + '.' + this.ext;
	
};

/*----------------------------------------------------------------------------*/
LatdocBase.prototype.getClassName = function() {
	return this.getName();
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.superTypesList = function() {
	
    var list =  this.superTypes().map(function(superType) {
	return superType.name;
    }).join(" ,\n ");
    
    if (list == '') {
    	return 'object';
    }
    else {
    	return list;
    }
};

/*----------------------------------------------------------------------------*/
LatdocBase.prototype.getImportForCustomDataTypes = function() {
	
	var cmd = [];
	var props = this.getProperties();
	cmd.push('#importing referenced types');
	var importedTypes = [];
	for (var i = 0; i<props.length; i++){
		var prop =  props[i];
		if (this.isAtomicType(prop.type) == false) {
			var mpath = this.makeModulePath(prop.type);
			if (importedTypes.indexOf(mpath) == -1) {
				cmd.push('import ' + mpath );
				importedTypes.push(mpath);
			}
		}
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.lattxt = function(txt) {
	//make latex compatible text
	var ntxt = txt;
	
	if (txt == undefined)
		return "";
	
	ntxt = ntxt.split("\\").join("\textbackslash ");
	
	ntxt = ntxt.split("&").join("\\&");	
	ntxt = ntxt.split("%").join("\\%");
	ntxt = ntxt.split("$").join("\\$");
	ntxt = ntxt.split("#").join("\\#");
	ntxt = ntxt.split("_").join("\\_");
	ntxt = ntxt.split("{").join("\\{");
	ntxt = ntxt.split("}").join("\\}");
	ntxt = ntxt.split("~").join("\\textasciitilde ");
	ntxt = ntxt.split("^").join("\\textasciicircum ");
	

	return ntxt
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.nolattxt = function(txt) {
	//make latex compatible text
	var ntxt = txt;
	
	if (txt == undefined)
		return "";
	
	ntxt = ntxt.split("\\").join("");
	
	ntxt = ntxt.split("&").join("");	
	ntxt = ntxt.split("%").join("");
	ntxt = ntxt.split("$").join("");
	ntxt = ntxt.split("#").join("");
	ntxt = ntxt.split("_").join("");
	ntxt = ntxt.split("{").join("");
	ntxt = ntxt.split("}").join("");
	ntxt = ntxt.split("~").join("");
	ntxt = ntxt.split("^").join("");
	

	return ntxt
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.getTypeDescription = function() {
	
	var cmd = [];
	
	//cmd.push("The type is described in table \\ref{tab:" + this.getType() + "_desc}");
	
	cmd.push("\\begin{table}[h!]")
	//cmd.push("\\centering");
	cmd.push("\\caption{Class description.}");
	cmd.push("\\begin{tabular}{|l|l|}");
	cmd.push("\\hline");
	cmd.push("\\textbf{class name} 	&	" + this.lattxt(this.getName()) + " \\\\");
	cmd.push("\\textbf{package} 	&	" + this.lattxt(this.getPackageStr()) + " \\\\");
	cmd.push("\\textbf{description} 	&	" + this.lattxt(this.getDescription()) + " \\\\");
	cmd.push("\\hline");
	cmd.push("\\end{tabular}");
	cmd.push("\\label{tab:" +  this.getType()+ "_desc}");
	cmd.push("\\end{table}");
	
	return cmd.join("\n");
	
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.reportProperties = function() {
	var props = this.getProperties();
	
	var cmd = [];
	
	//cmd.push("The type properties are listed in \\ref{tab:" + this.getType() + "_prop}");
	
	cmd.push("\\begin{table}[h!]")
	//cmd.push("\\centering");
	cmd.push("\\caption{Member variables/arrays.}");
	cmd.push("\\begin{tabular}{|l|p{4cm}|c|p{5cm}|}");
	cmd.push("\\hline");
	cmd.push("\\textbf{name} 	&	\\textbf{type} & \\textbf{dimension} & \\textbf{description} \\\\");
	cmd.push("\\hline");

	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		if ((prop.name == "name") || (prop.name == "description")) {
				count += 1;
				cmd.push(this.lattxt(prop.name) + "	&	" + prop.type +"	&	-	&	" + this.lattxt(prop.description) +" \\\\");
				cmd.push("\\hline");
		}
	}
	
	var count = 0;
	//prop.type.split(":").join(": ")
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		if ((prop.name == "name") || (prop.name == "description")) {
			continue;
		}
		if (this.isSingle(prop) && this.isAtomic(prop)) {
			count += 1;
			cmd.push(this.lattxt(prop.name) + "	&	" + prop.type +"	&	-	&	" + this.lattxt(prop.description) +" \\\\");
			cmd.push("\\hline");
		}

		if (this.isArray(prop) && this.isAtomic(prop)) {
			count += 1;
			cmd.push(this.lattxt(prop.name) + "	&	" + prop.type +"	&	" + prop.dim + "	&	" + this.lattxt(prop.description) +" \\\\");
			cmd.push("\\hline");
		}

		if (this.isSingle(prop) && !this.isAtomic(prop)) {
			count += 1;
			
			cmd.push(this.lattxt(prop.name) + "	&	\\hyperref[sec:" + prop.type+ "]{\\AddBreakableChars{" + this.nolattxt(prop.type) +"} }	&	-	&  " + this.lattxt(prop.description) +" \\\\");
			cmd.push("\\hline");
		}

		if (this.isArray(prop) && !this.isAtomic(prop)) {
			count += 1;
			cmd.push(this.lattxt(prop.name) + "	&	\\hyperref[sec:" + prop.type+ "]{\\AddBreakableChars{" + this.nolattxt(prop.type) +"} }	&	"+ prop.dim + "	&	" + this.lattxt(prop.description) +" \\\\");
			cmd.push("\\hline");
		}
	}
	
	cmd.push("\\end{tabular}");
	cmd.push("\\label{tab:" +  this.getType()+ "_prop}");
	cmd.push("\\end{table}");
	
	if (count > 0)
		return cmd.join("\n");
	else
		return ""
	
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.getAtomicSingleProperties = function() {
	var props = this.getProperties();
	
	var cmd = [];
	
	cmd.push("The type has the simple-type properties listed in \\ref{tab:" + this.getType() + "_asprop}");
	
	cmd.push("\\begin{table}[h!]")
	cmd.push("\\centering");
	cmd.push("\\caption{Simple-type properties of the type " + this.getType() + " .}");
	cmd.push("\\begin{tabular}{|l|l|c|p{5cm}|}");
	cmd.push("\\hline");
	cmd.push("\\textbf{name} 	&	\\textbf{type} & \\textbf{default value} & \\textbf{description} \\\\");
	cmd.push("\\hline");

	var count = 0;
	
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		if (this.isSingle(prop) && this.isAtomic(prop)) {
			count += 1;
			cmd.push(prop.name + "	&	" + prop.type +"	&	" + prop.value + "	&	" + this.lattxt(prop.description) +" \\\\");
			cmd.push("\\hline");
		}
	}
	
	cmd.push("\\end{tabular}");
	cmd.push("\\label{tab:" +  this.getType()+ "_asprop}");
	cmd.push("\\end{table}");
	
	if (count > 0)
		return cmd.join("\n");
	else
		return ""
	
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.getAtomicArrayProperties = function() {
	var props = this.getProperties();
	
	var cmd = [];
	
	cmd.push("The type has arrays of simple-type as properties listed in \\ref{tab:" + this.getType() + "_aaprop}");
	
	cmd.push("\\begin{table}[h!]")
	cmd.push("\\centering");
	cmd.push("\\caption{Simple-type array properties of the type " + this.getType() + ". *: means arbitaty size, e.g. dimension=*,* means a rank two matrix with arbitary size.}");
	cmd.push("\\begin{tabular}{|l|l|c|p{5cm}|}");
	cmd.push("\\hline");
	cmd.push("\\textbf{name} 	&	\\textbf{type} & \\textbf{dimension} & \\textbf{description} \\\\");
	cmd.push("\\hline");

	var count = 0;
	
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		if (this.isArray(prop) && this.isAtomic(prop)) {
			count += 1;
			cmd.push(prop.name + "	&	" + prop.type +"	&	" + prop.dim + "	&	" + this.lattxt(prop.description) +" \\\\");
			cmd.push("\\hline");
		}
	}
	
	cmd.push("\\end{tabular}");
	cmd.push("\\label{tab:" +  this.getType()+ "_aaprop}");
	cmd.push("\\end{table}");
	
	if (count > 0)
		return cmd.join("\n");
	else
		return ""
	
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.getComplexSingleProperties = function() {
	var props = this.getProperties();
	
	var cmd = [];
	
	cmd.push("The type has complex-type properties listed in \\ref{tab:" + this.getType() + "_csprop}");
	
	cmd.push("\\begin{table}[h!]")
	cmd.push("\\centering");
	cmd.push("\\caption{Complex-type properties of the type " + this.getType() + " .}");
	cmd.push("\\begin{tabular}{|l|c|c|p{5cm}|}");
	cmd.push("\\hline");
	cmd.push("\\textbf{name} 	&	\\textbf{type}  & \\textbf{optional}  & \\textbf{description} \\\\");
	cmd.push("\\hline");

	var count = 0;
	
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		if (this.isSingle(prop) && !this.isAtomic(prop)) {
			count += 1;
			
			cmd.push(prop.name + "	&	\\hyperref[sec:" + prop.type+ "]{"+ prop.type+" }	&	"  + this.isOptional(prop)+ "	&  " + this.lattxt(prop.description) +" \\\\");
			cmd.push("\\hline");
		}
	}
	
	cmd.push("\\end{tabular}");
	cmd.push("\\label{tab:" +  this.getType()+ "_csprop}");
	cmd.push("\\end{table}");
	
	if (count > 0)
		return cmd.join("\n");
	else
		return ""
	
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.getComplexArrayProperties = function() {
	var props = this.getProperties();
	
	var cmd = [];
	
	cmd.push("The type has arrays of complex-type as properties listed in \\ref{tab:" + this.getType() + "_caprop}");
	
	cmd.push("\\begin{table}[h!]")
	cmd.push("\\centering");
	cmd.push("\\caption{Complex-type array properties of the type " + this.getType() + ". *: means arbitaty size, e.g. dimension=*,* means a rank two matrix with arbitary size.}");
	cmd.push("\\begin{tabular}{|l|c|c|p{5cm}|}");
	cmd.push("\\hline");
	cmd.push("\\textbf{name} 	&	\\textbf{type} & \\textbf{dimension} & \\textbf{description} \\\\");
	cmd.push("\\hline");

	var count = 0;
	
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		if (this.isArray(prop) && !this.isAtomic(prop)) {
			count += 1;
			cmd.push(prop.name + "	&	\\hyperref[sec:" + prop.type+ "]{"+ prop.type+" }	&	"+ prop.dim + "	&	" + this.lattxt(prop.description) +" \\\\");
			cmd.push("\\hline");
		}
	}
	
	cmd.push("\\end{tabular}");
	cmd.push("\\label{tab:" +  this.getType()+ "_caprop}");
	cmd.push("\\end{table}");
	
	if (count > 0)
		return cmd.join("\n");
	else
		return ""
	
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.getPythonMethods = function() {
	var props = this.getProperties();
	
	var cmd = [];
	
	cmd.push("A series of important member functions for this type in generated python-matlab library is listed in \\ref{tab:" + this.getType() + "_pyfunc}");
	
	cmd.push("\\begin{table}[h!]")
	cmd.push("\\centering");
	cmd.push("\\caption{Important generated python-matlab library methods for the type " + this.getType() + ".}");
	cmd.push("\\begin{tabular}{|l|c|c|p{3cm}|}");
	cmd.push("\\hline");
	cmd.push("\\textbf{method} 	&	\\textbf{input(type)} & \\textbf{return type} & \\textbf{description} \\\\");
	cmd.push("\\hline");

	var count = 0;

	cmd.push("clone &  -	&	\\hyperref[sec:" + this.getType() + "]{"+ this.getType()+" }	&	make a clone of the existing object and return it. \\\\");
	cmd.push("\\hline");
	cmd.push("save &  -	&	-	&	save the object to an hdf5 file. \\\\");
	cmd.push("\\hline");
	cmd.push("load &  filePath(string)	&	-	&	load the object from an hdf5 file. \\\\");
	cmd.push("\\hline");
			
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		if (!this.isArray(prop) && !this.isAtomic(prop)) {
			//cmd.push("makea" + this.firstToUpper(prop.name) + " &  name(string)	&	\\hyperref[sec:" + prop.type+ "]{"+ prop.type+" }	&	create an instance of the object and return it \\\\");
			//cmd.push("\\hline");
			//count += 1;
			
			if (this.isOptional(prop)) {
				count += 1;
				cmd.push("create" + this.firstToUpper(prop.name) + "	&  -  &	 -	&	create and initialize the optional property \\\\");
				cmd.push("\\hline");
				cmd.push("delete" + this.firstToUpper(prop.name) + "	&  -  &	 -	&	delete the optional property \\\\");
				cmd.push("\\hline");	
				cmd.push("renew" + this.firstToUpper(prop.name) + "	&  -  &	 -	&	renew the optional property \\\\");
				cmd.push("\\hline");				
			}
		}
	}
	
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		if (this.isArray(prop) && !this.isAtomic(prop)) {
			count += 1;
			cmd.push("append" + this.firstToUpper(prop.name) + " &  name(string)	&	\\hyperref[sec:" + prop.type+ "]{\\AddBreakableChars{"+ prop.type+"} }	&	create an instance of the object and return it after appending it to the array \\\\");
			cmd.push("\\hline");
		}
	}
	
	cmd.push("\\end{tabular}");
	cmd.push("\\label{tab:" +  this.getType()+ "_pyfunc}");
	cmd.push("\\end{table}");
	
	if (count > 0)
		return cmd.join("\n");
	else
		return ""
	
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.getPythonConst = function() {
	var props = this.getProperties();
	
	var cmd = [];

	cmd.push("\\begin{table}[h!]")
	//cmd.push("\\centering");
	cmd.push("\\caption{Constructor(s).}");
	cmd.push("\\begin{tabular}{|l|c|p{4cm}|p{5cm}|}");
	cmd.push("\\hline");
	cmd.push("\\textbf{method} 	&	\\textbf{input(type)} & \\textbf{return type} & \\textbf{description} \\\\");
	cmd.push("\\hline");
	
	parts = this.getType().split(":")
	
	cmd.push(this.lattxt(parts[parts.length-1]) + " &  name(string)	&	\\hyperref[sec:" + this.getType()+ "]{\\AddBreakableChars{"+ this.nolattxt(this.getType())+"} }	&	create an instance of the object and return it\\\\");
	cmd.push("\\hline");
	
	cmd.push("\\end{tabular}");
	cmd.push("\\label{tab:" +  this.getType()+ "_pyconst}");
	cmd.push("\\end{table}");
	
	return cmd.join("\n");

	
};
/*----------------------------------------------------------------------------*/
LatdocBase.prototype.getPythonMethodsMinimal = function() {
	var props = this.getProperties();
	
	var cmd = [];

	
	//cmd.push("A series of important member functions for this type in generated python-matlab library is listed in \\ref{tab:" + this.getType() + "_pyfunc}");
	
	cmd.push("\\begin{table}[h!]")
	//cmd.push("\\centering");
	cmd.push("\\caption{Member functions.}");
	cmd.push("\\begin{tabular}{|l|c|p{4cm}|p{5cm}|}");
	cmd.push("\\hline");
	cmd.push("\\textbf{method} 	&	\\textbf{input(type)} & \\textbf{return type} & \\textbf{description} \\\\");
	cmd.push("\\hline");

	var count = 0;

	//cmd.push("clone &  -	&	\\hyperref[sec:" + this.getType() + "]{"+ this.getType()+" }	&	make a clone of the existing object and return it. \\\\");
	//cmd.push("\\hline");
	//cmd.push("save &  -	&	-	&	save the object to an hdf5 file. \\\\");
	//cmd.push("\\hline");
	//cmd.push("load &  filePath(string)	&	-	&	load the object from an hdf5 file. \\\\");
	//cmd.push("\\hline");
			
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		if (!this.isArray(prop) && !this.isAtomic(prop)) {
			//cmd.push("makea" + this.firstToUpper(prop.name) + " &  name(string)	&	\\hyperref[sec:" + prop.type+ "]{"+ prop.type+" }	&	create an instance of the object and return it \\\\");
			//cmd.push("\\hline");
			//count += 1;
			
			if (this.isOptional(prop)) {
				count += 1;
				cmd.push("create" + this.lattxt(this.firstToUpper(prop.name)) + "	&  -  &	 -	&	create and initialize the optional property \\\\");
				cmd.push("\\hline");
				//cmd.push("delete" + this.firstToUpper(prop.name) + "	&  -  &	 -	&	delete the optional property \\\\");
				//cmd.push("\\hline");	
				//cmd.push("renew" + this.firstToUpper(prop.name) + "	&  -  &	 -	&	renew the optional property \\\\");
				//cmd.push("\\hline");				
			}
		}
	}
	
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		if (this.isArray(prop) && !this.isAtomic(prop)) {
			count += 1;
			cmd.push("append" + this.lattxt(this.firstToUpper(prop.name)) + " &  name(string)	&	\\hyperref[sec:" + prop.type+ "]{\\AddBreakableChars{"+ this.nolattxt(prop.type)+"} }	&	create an instance of the object and return it after appending it to the array \\\\");
			cmd.push("\\hline");
		}
	}
	
	cmd.push("\\end{tabular}");
	cmd.push("\\label{tab:" +  this.getType()+ "_pyfunc}");
	cmd.push("\\end{table}");
	
	if (count > 0)
		return cmd.join("\n");
	else
		return ""
	
};
/*----------------------------------------------------------------------------*/


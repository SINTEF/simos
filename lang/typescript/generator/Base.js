var path = require('path');
var fs = require('fs');

var simosPath = require('./config.js').simosPath;
var CommonLangBase = require(path.join(simosPath, 'generator','lang','CommonLangBase.js')).CommonLangBase;

var Packaging = require('./packaging/Packaging.js').Packaging;

/*----------------------------------------------------------------------------*/
function Base(model){
	this.constructor(model);
};
exports.Base = Base;
// module.exports = function(model) { return new Base(model); };

/*----------------------------------------------------------------------------*/
Base.prototype = Object.create(CommonLangBase.prototype);
/*----------------------------------------------------------------------------*/

packageParts = [	'./storage/SaveLoad',
					'./storage/DMTSave',
                    './storage/HDF5Load',
                    './storage/HDF5Save',
                    './storage/JSONLoad',
                    './storage/JSONSave',
                    './storage/MongoSave',
                    './storage/MongoLoad',
                    
                    './properties/Query',
                    './properties/Init',
                    './properties/Assign',
                    './properties/SetGet',
                    './properties/Representation'];

for (var ip=0, len = packageParts.length; ip<len; ip++) {
	var packPath = packageParts[ip];
	var packPathParts = packPath.split('/');
	var packName = packPathParts[packPathParts.length-1];
	var addPack = require(packPath);
	addPack = addPack[packName];
	for (key in addPack.prototype){
		Base.prototype[key] = addPack.prototype[key];
	}
}

/*----------------------------------------------------------------------------*/
Base.prototype.constructor = function(model) {
	CommonLangBase.prototype.constructor(model);
	
	this.targetType = {
	    "float"		:"number",
	    "double"	:"number",
	    "short"		:"number",
	    "integer"	:"number",
	    "boolean"	:"boolean",
	    "string"	:"string",
	    "char"		:"string",
	    "tiny"		:"number",
	    "object"	:"any"
	};

	/*a list of modules/libs to be important for all files*/
	//{'name': 'numpy', 'alias': 'np'}
	this.generalModules = [];
	
	this.name = 'typescript';
	this.ext = 'ts';
	
	this.packagePathSep = '/';
	
	this.blockSpace = '    ';
	
	this.sep1 = '#******************************************************************************';
	this.sep2 = '#---------------------------------------------------------------------------';
	
	//make packaging module
	this.packaging = new Packaging(this);
	
	this.userCodes = {  "import"  : {	"start" : "//@@@@@ USER DEFINED IMPORTS START @@@@@",
										"end"   : "//@@@@@ USER DEFINED IMPORTS End   @@@@@",
										"code"  : ""},
						"prop"    : {	"start" : "//@@@@@ USER DEFINED PROPERTIES START @@@@@",
										"end"   : "//@@@@@ USER DEFINED PROPERTIES End   @@@@@",
										"code"  : ""},
						"init"    : {	"start" : "//@@@@@ USER DEFINED CONSTRUCTOR START @@@@@",
										"end"   : "//@@@@@ USER DEFINED CONSTRUCTOR End   @@@@@",
										"code"  : ""},										
						"method"  : {	"start" : "//@@@@@ USER DEFINED METHODS START @@@@@",
										"end"   : "//@@@@@ USER DEFINED METHODS End   @@@@@",
										"code"  : ""} };
};
/*----------------------------------------------------------------------------*/
Base.prototype.stringify = function(str) {
	return (JSON.stringify(str));
};
/*----------------------------------------------------------------------------*/
Base.prototype.importModules = function() {
	 
	var cmd = [];
	
	cmd.push('#importing general modules');
	cmd.push('from fnmatch import fnmatch');
	
	for (var i = 0; i<this.generalModules.length; i++) {
	    var module = this.generalModules[i];
	    var imp = 'import ' + module.name;
	    if ((module.alias != undefined) && (module.alias != ''))
	        imp = imp + ' as ' + module.alias;
	
	    if (module['try'] == true) {
	    	cmd.push('try:');
	    	cmd.push(this.gbl() + imp);
	    	cmd.push('except:');
	    	cmd.push(this.gbl() + 'print("WARNING: ' + module.name +' is not installed.")');
	    }
	    else 
	    	cmd.push(imp);
	}
	
	
	
	cmd.push(this.getSuperTypesImport());
	
    return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
Base.prototype.makeModulePath = function(packagedTypeStr) {
	var type = '';
	
    if (typeof(packagedTypeStr) == 'object') {
        type = packagedTypeStr;
    }
    else{
    	type = this.parsePackagedTypeStr(packagedTypeStr);
    }
    
	var versionedPackages = this.makeVersionedPackages(type.packages, type.versions);

	return (versionedPackages.join(this.packagePathSep) );

};
/*----------------------------------------------------------------------------*/
Base.prototype.getRelativePath = function(path1, path2) {
	//get two array of packages
	//find relative path between them
	// how to get to path1 from path2



}
/*----------------------------------------------------------------------------*/
Base.prototype.makeRelativeModulePath = function(propPackagedTypeStr, modelPackagedTypeStr) {
	var prop_type = '';
	var model_type = '';
	

    if (typeof(propPackagedTypeStr) == 'object') {
        prop_type = propPackagedTypeStr;
    }
    else{
    	prop_type = this.parsePackagedTypeStr(propPackagedTypeStr);
    	model_type = this.parsePackagedTypeStr(modelPackagedTypeStr);
    }
    
	var prop_versionedPackages = this.makeVersionedPackages(prop_type.packages, prop_type.versions);
	var model_versionedPackages = this.makeVersionedPackages(model_type.packages, model_type.versions);


	prop_versionedPackages.push(prop_type.name);

	var relPath = path.posix.relative(model_versionedPackages.join(this.packagePathSep), prop_versionedPackages.join(this.packagePathSep));

	if (relPath[0] != '.')
		relPath = './'+relPath;

	return (relPath );

};
/*----------------------------------------------------------------------------*/
Base.prototype.getClassPathFromType = function(packagedTypeStr) {
	var parsed = this.parsePackagedTypeStr(packagedTypeStr);
	var modulePath = this.makeModulePath(parsed);
	
	return (modulePath + this.packagePathSep + parsed.name);
};

Base.prototype.getTypeID = function(packagedTypeStr) {
	var classPath = this.getClassPathFromType(packagedTypeStr);
	return classPath.split(this.packagePathSep).join('_');
};

Base.prototype.getOutCodeFileNameFromVersionedPackagedTypeStr = function(modelID) {
	return this.getModelNameFromPackagedTypeStr(modelID) + '.' + this.ext;
	
};
/*----------------------------------------------------------------------------*/
Base.prototype.getSuperTypesImport = function() {
	
	var cmd = [];

	var superTypes = this.superTypes();
	
	cmd.push('#importing extended types');
	for (var i = 0; i<superTypes.length; i++){
		var supType = superTypes[i];
		cmd.push('import ' + this.makeModulePath(supType) );
	}
	return cmd.join('\n');
	
    
};
/*----------------------------------------------------------------------------*/
Base.prototype.getClassName = function() {
	return this.getName();
};
/*----------------------------------------------------------------------------*/
Base.prototype.superTypesList = function() {
	
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
Base.prototype.getImportForCustomDataTypes = function() {
	
	var cmd = [];
	var props = this.getProperties();
	cmd.push('//importing referenced types');
	var importedTypes = [];
	for (var i = 0; i<props.length; i++){
		var prop =  props[i];		
		if (this.isAtomicType(prop.type) == false) {
			var mpath = this.makeRelativeModulePath(prop.type, this.getType());
			if (importedTypes.indexOf(mpath) == -1) {
				cmd.push('import {' + this.getTypeID(prop.type) + '} from ' + JSON.stringify(mpath)+ ';' );
				importedTypes.push(mpath);
			}
		}
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Base.prototype.getTSArrayDimList = function(prop) {
	
	if (this.isArray(prop)){
		var dimList = this.getDimensionList(prop);
		for (var i = 0; i<dimList.length; i++){
			/* check if the dimension is a number */
			if (!isNaN(parseFloat(dimList[i])) && isFinite(dimList[i])){
				dimList[i] = dimList[i];
			}
			else {
				if (dimList[i] == "*") {
					dimList[i] = "1";
				}
				else {
					dimList[i] = dimList[i];
				}
			}
		}
		return dimList;
	}
	else {
		throw ('Illigal non-array input.',prop);
	}
};
/*----------------------------------------------------------------------------*/
Base.prototype.getTSArrayShape = function(prop) {
	
	if (this.isArray(prop)){
		return '[' + this.getTSArrayDimList(prop).join() + ']';
	}
	else {
		throw ('Illigal non-array input.',prop);
	}
};

/*----------------------------------------------------------------------------*/
Base.prototype.sweepFunc = function(bl) {
	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def sweep(self, item, cmd=None):');

	cmd.push(this.gbl(bl+1) + 'l = []');	
	cmd.push(this.gbl(bl+1) + 'if (isinstance(item,(list,np.ndarray))):');		
	cmd.push(this.gbl(bl+2) + 	'for i in item:');
	cmd.push(this.gbl(bl+3) + 		'l += [sweep(i, cmd)]');	
	cmd.push(this.gbl(bl+1) + 'else:');
	cmd.push(this.gbl(bl+2) + 	'if (cmd == None):');
	cmd.push(this.gbl(bl+3) + 		'l = item');	
	cmd.push(this.gbl(bl+2) + 	'else:');
	cmd.push(this.gbl(bl+3) + 		'l = eval(cmd)');	
	cmd.push(this.gbl(bl+1) + 'return l');

	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
Base.prototype.isStringFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def isString(self, txt):');

	cmd.push(this.gbl(bl+1) + 'if (type(txt) == type("")) or (type(txt) == np.string_) or isinstance(txt, str):');	
	cmd.push(this.gbl(bl+2) + 	'return True');
	cmd.push(this.gbl(bl+1) + 'else :');
	cmd.push(this.gbl(bl+2) + 	'return False');

	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Base.prototype.isStringArrayFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def isStringArray(self, arr):');

	cmd.push(this.gbl(bl+1) + 'shape = self.getShape(arr)');
	cmd.push(this.gbl(bl+1) + 'item = arr');			
	cmd.push(this.gbl(bl+1) + 'if (len(shape) > 0):');	
	cmd.push(this.gbl(bl+2) + 	'for d in shape:');	
	cmd.push(this.gbl(bl+3) + 		'item = item[0]');		
	cmd.push(this.gbl(bl+1) + 'return self.isString(item)');	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Base.prototype.getShapeFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def getShape(self, arr):');

	cmd.push(this.gbl(bl+1) + 'shape = []');

	cmd.push(this.gbl(bl+1) + 'if (isinstance(arr,(list,np.ndarray))):');	
	cmd.push(this.gbl(bl+2) + 	'if (len(arr) == 0):');	
	cmd.push(this.gbl(bl+3) + 		'return shape');	
	cmd.push(this.gbl(bl+2) + 	'shape += [len(arr)]');	
	cmd.push(this.gbl(bl+2) + 	'shape += self.getShape(arr[0])');	
	cmd.push(this.gbl(bl+2) + 	'return shape');		
	cmd.push(this.gbl(bl+1) + 'else :');
	cmd.push(this.gbl(bl+2) + 	'return shape');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Base.prototype.isSetFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def isSet(self, varName):');

	cmd.push(this.gbl(bl+1) + 	'if (isinstance(getattr(self,varName),list) ):');
	cmd.push(this.gbl(bl+2) + 		'if (len(getattr(self,varName)) > 0 and not any([np.any(a==None) for a in getattr(self,varName)])  ):');
	cmd.push(this.gbl(bl+3) + 			'return True');
	cmd.push(this.gbl(bl+2) + 		'else :');
	cmd.push(this.gbl(bl+3) + 			'return False');
		
	cmd.push(this.gbl(bl+1) + 	'if (isinstance(getattr(self,varName),np.ndarray) ):');
	cmd.push(this.gbl(bl+2) +  		'if (len(getattr(self,varName)) > 0 and not any([np.any(a==None) for a in getattr(self,varName)])  ):');
	cmd.push(this.gbl(bl+3) + 			'return True');
	cmd.push(this.gbl(bl+2) + 		'else :');
	cmd.push(this.gbl(bl+3) + 			'return False');
	
	 /* single atomic type value */
	cmd.push(this.gbl(bl+1) +  	'if (getattr(self,varName) != None):');
	cmd.push(this.gbl(bl+2) + 		 'return True');
	
	cmd.push(this.gbl(bl+1) + 	'return False');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Base.prototype.isContainedFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def isContained(self, varName):');

	cmd.push(this.gbl(bl+1) + 
	 	'MODEL = self.getPropModel(varName)');
	
	cmd.push(this.gbl(bl+1) + 
 		'if ("containment" in list(MODEL.keys()) ):');
	cmd.push(this.gbl(bl+2) + 
			'if (MODEL["containment"] == "false"):');	
	cmd.push(this.gbl(bl+3) + 
 				'return False');

	cmd.push(this.gbl(bl+1) + 
		'return True');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Base.prototype.getPropModelFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def getPropModel(self, varName):');

	cmd.push(this.gbl(bl+1) + 
	 	'props = self.' + this.modelDesAtt() + '["properties"]');
	
	cmd.push(this.gbl(bl+1) + 
 		'for prop in props:');
	cmd.push(this.gbl(bl+2) + 
			'if (prop["name"] == varName):');	
	cmd.push(this.gbl(bl+3) + 
 				'return prop');
	
	if (this.isDerived()) {
		var superTypes = this.superTypes();
		
		cmd.push(this.gbl(bl) + 
				'#calling supers');
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +
				'return ' + supType.name +'().getPropModel(varName)');
				
		}
		cmd.push(this.gbl(bl+1) + '');
	}
	
	cmd.push(this.gbl(bl+1) + 
		'raise Exception("property " + varName + " was not found.")');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Base.prototype.makePrivate = function(propName) {
	
    return '' + propName ;
};
/*----------------------------------------------------------------------------*/
Base.prototype.getPropertyAttrsHolderName = function(prop) {
	
	return (prop.name + 'Attrs');
};

/*----------------------------------------------------------------------------*/
Base.prototype.getPropertyPrivateName = function(prop) {
	//Not checking for private variable for now
	//if (prop.set == 'false' && prop.get == 'false' && 
	//		this.access == 'public' ){
	//	return prop.name;
	//}
	//else {
	//	return this.makePrivate(prop.name);	
	//}

	return prop.name;
};
// exports.Base.prototype.getPropertyPrivateName =
// Base.prototype.getPropertyPrivateName;

/*----------------------------------------------------------------------------*/
Base.prototype.getPropertyName = function(i) {
	var prop = this.getProperties()[i];
	return prop.name;
};
// exports.Base.prototype.getPropertyName =
// Base.prototype.getPropertyName;
/*----------------------------------------------------------------------------*/
Base.prototype.getBlockSpace = function(blockLevel) {
	if (blockLevel == undefined) {
		blockLevel = 1;
	}
	
	var sp = '';
	for (var i = 0; i<blockLevel; i++){
		sp = sp + this.blockSpace; 
	}
	
	return sp;
};
/*----------------------------------------------------------------------------*/
Base.prototype.gbl = function(blockLevel) {
	
	return this.getBlockSpace(blockLevel);
};


/*----------------------------------------------------------------------------*/
Base.prototype.getLoopBlockForArray = function(bl, prop) {
	var cmd = [];
	
	var dimList = this.getTSArrayDimList(prop);
	var indNames = [];
	for (var di =dimList.length-1; di>=0; di--) {
		var indName = 'i' + di;
		indNames.push(indName);
		
		var levelInd = '';
		for (var level = 0; level < di; level++){
			levelInd = levelInd + '[0]';
		}
		cmd.push(this.gbl(bl+ (dimList.length-1)-di ) + 
				 'for ' + indName + ' in range(0,len(self.' + prop.name +levelInd +')):' );

	}
	var indList = '[' + indNames.reverse().join('][') + ']';
	var indArray = '[' + indNames.join(',') + ']';

	return {'cmd' : cmd.join('\n'),
			'indNames': indNames,
			'indList': indList,
			'indArray': indArray,
			'bl': bl+(dimList.length)-1};
};

/*----------------------------------------------------------------------------*/
Base.prototype.cloneFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def clone(self):');	
	cmd.push(this.gbl(bl+1) +	'newObj = ' + this.getClassName() + '()' );	     
	cmd.push(this.gbl(bl+1) + 	'return self._cloneTo(newObj)' );	     
	cmd.push(this.gbl(bl+1));
	
	
	cmd.push(this.gbl(bl) + 'def cloneTo(self, newObj):');	
	cmd.push(this.gbl(bl+1) + 	'self._cloneTo(newObj)' );	     
	cmd.push(this.gbl(bl+1));
	
	/* =============================================== */
	cmd.push(this.gbl(bl) +	'def _cloneTo(self,newObj):');	    

	if (this.isDerived()) {
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +
					supType.name + '._cloneTo(self,newObj)');			
		}
		cmd.push(this.gbl(bl+1) + '');
	}
	
	var props = this.getProperties();
	
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		cmd.push(this.gbl(bl+1) + 
				'if (self.isSet(' + this.stringify(prop.name) +')):' );	     

		if (this.isAtomicType(prop.type)) {
			if (this.isArray(prop)) {
				cmd.push(this.gbl(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = np.copy(self.' + this.makePrivate(prop.name) + ')' );	     
			}
			else {
				cmd.push(this.gbl(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = self.' + this.makePrivate(prop.name) );	     				
			}
		}
		else {
			if (this.isArray(prop)) {
				cmd.push(this.gbl(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = []' );	     	
				var loopBlock = this.getLoopBlockForArray(bl+2,prop);
				cmd.push(loopBlock.cmd);
					cmd.push(this.gbl(loopBlock.bl+1) + 
							'newObj.' + this.makePrivate(prop.name) + '.append(' +
							' self.' + this.makePrivate(prop.name) + loopBlock.indList + '.clone() )' );    
			}
			else {
				cmd.push(this.gbl(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = self.' + this.makePrivate(prop.name) + '.clone()');	     				
			}
			
		}
	}
	
	cmd.push(this.gbl(bl+1) + 'return newObj' );	     
	
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
Base.prototype.factoryFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
		
	cmd.push(this.gbl(bl) + 
	'create(): ' + this.getModel().name + '{');	
	cmd.push(this.gbl(bl+1) + 
		'return new ' + this.getModel().name + '();');
	cmd.push(this.gbl(bl) + 
	'}');

	var props = this.getProperties();
    for (var i = 0; i<props.length; i++) {
    	if (!(this.isAtomic(props[i]))) {
    		var prop = props[i];
			var propType = this.getTypeID(prop.type) ;
			
				cmd.push(this.gbl(bl) + 'makea_' + prop.name +'(): ' + propType + '{');					
				cmd.push(this.gbl(bl+1) +	'return new ' + propType + '();');
				cmd.push(this.gbl(bl) + '}');				
			
			if (this.isArray(prop)){
				cmd.push(this.gbl(bl) + 'append_' + prop.name +'(): ' + propType + '{');			
				cmd.push(this.gbl(bl+1) + 	'obj = new ' + propType + '();');			
				cmd.push(this.gbl(bl+1) + 	'this.' + prop.name + '.push(obj);');
				cmd.push(this.gbl(bl+1) + 	'return obj');
				cmd.push(this.gbl(bl) + '}');

				cmd.push(this.gbl(bl) + 'delete_' + prop.name +'(): void {');
				cmd.push(this.gbl(bl+1) +	'this.' + prop.name + ' = [];');
				cmd.push(this.gbl(bl) + '}');
			}
			else {
				cmd.push(this.gbl(bl) + 'create_' + prop.name +'(): void{');
				cmd.push(this.gbl(bl+1) + 	'this.' + prop.name + ' = new ' + propType + '();');
				cmd.push(this.gbl(bl) + '}');

				cmd.push(this.gbl(bl) + 'delete_' + prop.name +'(): void {');
				cmd.push(this.gbl(bl+1) +	'this.' + prop.name + ' = null;');
				cmd.push(this.gbl(bl) + '}');
				
				cmd.push(this.gbl(bl) + 'renew_' + prop.name +'(): void {');
				cmd.push(this.gbl(bl+1) + 	'this.' + prop.name + ' = this._init_value_' + prop.name + '();');
				cmd.push(this.gbl(bl) + '}');					
			}
			cmd.push(this.gbl(bl));
    	}
		
	}
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
/*   Handling user specified code in generator functions */
/*----------------------------------------------------------------------------*/

Base.prototype.findStrInLines = function(lines, str) {
    for (var i = 0; i<lines.length; i++) {
    	if (lines[i].indexOf(str) != -1)
    		return i;
    }
    return -1;
}

Base.prototype.extractUserDefinedCode = function(code) {
    if ((code == undefined) || (code == '')){
    	/*files does not exist, clean the existing code */
    	for (key in this.userCodes) {
    		var part = this.userCodes[key];
    		part.code = "";
    	}
        return;
    }
    
    var lines = code.split('\n');

    for (key in this.userCodes) {
        var part = this.userCodes[key];
        var sind = this.findStrInLines(lines,part.start);
        if (sind != -1) {
            var eind = this.findStrInLines(lines,part.end);
            if ((eind - sind) > 1){
                console.log("            user code for (" + key + ") betweeb lines : " + sind  + " and " + eind);
                part.code = lines.slice(sind+1,eind).join('\n');
            }
            else
                part.code = "";
        }
        else
            part.code = "";
    }
};

Base.prototype.getUserDefinedCode = function(flag) {
    if (this.userCodes[flag].code == "")
            return [this.userCodes[flag].start,this.userCodes[flag].end].join('\n'); 
    else
        return [this.userCodes[flag].start,this.userCodes[flag].code, this.userCodes[flag].end].join('\n'); 
};

/*----------------------------------------------------------------------------*/


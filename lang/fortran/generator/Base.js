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
/*
packageParts = ['./storage/SaveLoad',
                    './storage/HDF5Load',
                    './storage/HDF5Save',
                    './storage/JSONLoad',
                    './storage/JSONSave',
                    './storage/MongoSave',
                    './storage/MongoLoad',
                    
                    './properties/Query',
                    
                    './properties/Assign',
                    './properties/SetGet',
                    './properties/Representation'];
*/
packageParts = ['./properties/Init']

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
	    "float"		:"float",
	    "double"	:"double precision",
	    "short"		:"int",
	    "integer"	:"integer",
	    "boolean"	:"logical",
	    "string"	:"String",
	    "char"		:"character",
	    "char256"	:"character",
	    "tiny"		:"int",
	    "object"	:"object"
	};

	/*a list of modules/libs to be important for all files*/
	this.generalModules = [{'name': 'string_mod', 'lib': 'fcore'}];
	
	this.name = 'fortran';
	this.ext = 'f90';
	this.packagePathSep = '_';

	this.blockSpace = '    ';
	
	this.sep1 = '!******************************************************************************';
	this.sep2 = '!---------------------------------------------------------------------------';

	//make packaging module
	this.packaging = new Packaging(this);

    this.userCodes = {  "use"     : {"start" : "!@@@@@ USER DEFINED USE START @@@@@",
                                     "end"   : "!@@@@@ USER DEFINED USE End   @@@@@",
                                     "code"  : ""},
                        "prop"    : {"start" : "!@@@@@ USER DEFINED PROPERTIES START @@@@@",
                                     "end"   : "!@@@@@ USER DEFINED PROPERTIES End   @@@@@",
                                     "code"  : ""},
                        "funcSig" : {"start" : "!@@@@@ USER DEFINED PROCEDURE DECLARATIONS START @@@@@",
                                     "end"   : "!@@@@@ USER DEFINED PROCEDURE DECLARATIONS End   @@@@@",
                                     "code"  : ""},
                        "func"    : {"start" : "!@@@@@ USER DEFINED PROCEDURES START @@@@@",
                                     "end"   : "!@@@@@ USER DEFINED PROCEDURES End   @@@@@",
                                     "code"  : ""} };
};

Base.prototype.makeModulePath = function(packagedTypeStr) {
	var type = '';
	
    if (typeof(packagedTypeStr) == 'object') {
        type = packagedTypeStr;
    }
    else{
    	type = this.parsePackagedTypeStr(packagedTypeStr);
    }
    
	//var versionedPackages = this.makeVersionedPackages(type.packages, type.versions);

	return (type.packages.join(this.packagePathSep) + this.packagePathSep + type.name);

};

Base.prototype.makeLibPath = function(packagedTypeStr) {
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

Base.prototype.getClassPathFromType = function(packagedTypeStr) {
	return (this.makeModulePath(packagedTypeStr));
};

Base.prototype.getOutCodeFileNameFromVersionedPackagedTypeStr = function(modelID) {
    var type = this.parseVersionedPackagedTypeStr(modelID);
	return (this.makeModulePath(type) + '.' + this.ext);
};

Base.prototype.makeGeneratedCodeOutPath = function(packagedStr) {
	var packagePath = packagedStr.split(this.packageSep).join('_');
	packagePath = packagePath + '/' + 'source'
	return packagePath;

};
/*----------------------------------------------------------------------------*/
Base.prototype.makeClassName = function(type) {
    return 'class_'+ type;
};

Base.prototype.getClassName = function() {
    return this.makeClassName(this.getClassPathFromType(this.getType()));
};

Base.prototype.makeTypeName = function(type) {
    return this.getClassPathFromType(type);
};

Base.prototype.getTypeName = function() {
    return this.makeTypeName(this.getType());
};
/*----------------------------------------------------------------------------*/
Base.prototype.stringify = function(str) {
    return ('\'' + String(str).replace(/\'/g, '\'\'') + '\'');
};
/*----------------------------------------------------------------------------*/
Base.prototype.getFortDimensionList = function(prop) {
    return this.getDimensionList(prop).join(',').replace(/\*/g,':');
};
/*----------------------------------------------------------------------------*/
Base.prototype.getDimensionVarNames = function(prop) {
    var prefs = ['n', 'm', 'l', 'k'];
    var names = [];
    var dims = this.getDimensionList(prop);
    for (var di=0; di<dims.length; di++) {
        if (di < 4) 
            names.push(prefs[di] + this.firstToUpper(prop.name));
        else       
            names.push(prefs[0] + (di+1) + this.firstToUpper(prop.name));
    }
    return names;
};
/*----------------------------------------------------------------------------*/
Base.prototype.importModules = function(bl) {
	 
	var cmd = [];
	
	cmd.push(this.gbl(bl) + '!using general modules');
	cmd.push(this.gbl(bl) + this.sep1);
    cmd.push(this.getImportForGeneralDataTypes(bl));
	cmd.push(this.gbl(bl) + this.sep1);
    cmd.push(this.getImportForCustomDataTypes(bl));
    

	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Base.prototype.getGeneralModulesTypes = function() {
	
	var types = this.generalModules;
	
	var importedTypes = [];
	for (var i = 0; i<types.length; i++){
		var type = types[i].name;
		if (importedTypes.indexOf(type) == -1) {
			importedTypes.push(type);
		}
	}
	
	return importedTypes;
}
/*----------------------------------------------------------------------------*/
Base.prototype.getImportForGeneralDataTypes = function(bl) {
	
	var cmd = [];
	var types = this.getGeneralModulesTypes();
	
	cmd.push(this.gbl(bl) + '!using general modules');
	for (var i = 0; i<types.length; i++)
		cmd.push(this.gbl(bl) + 'use ' + types[i] );
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Base.prototype.getImportForCustomDataTypes = function(bl) {
	
	var cmd = [];
	var types = this.getCustomTypes();
	
	cmd.push(this.gbl(bl) + '!using custom modules');
	var importedTypes = [];
	for (var i = 0; i<types.length; i++){
		var type = this.makeModulePath(types[i]);
		if (importedTypes.indexOf(type) == -1) {
			cmd.push(this.gbl(bl) + 'use ' + this.makeClassName(type) );
			importedTypes.push(type);
		}
	}
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
Base.prototype.getModelDependencies = function() {
	//does not include dynamic inheritance
    
	
};
    
/*----------------------------------------------------------------------------*/
Base.prototype.getPythonArrayDimList = function(prop) {
	
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
					dimList[i] = 'self.' + this.makePrivate(dimList[i]);
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
Base.prototype.getPythonArrayShape = function(prop) {
	
	if (this.isArray(prop)){
		return '[' + this.getPythonArrayDimList(prop).join() + ']';
	}
	else {
		throw ('Illigal non-array input.',prop);
	}
};
/*----------------------------------------------------------------------------*/
Base.prototype.isSetFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def isSet(self, varName):');

	cmd.push(this.gbl(bl+1) + 	'if (isinstance(getattr(self,varName),list) ):');
	cmd.push(this.gbl(bl+2) + 		'if (len(getattr(self,varName)) > 0 and not any([a==None for a in getattr(self,varName)])  ):');
	cmd.push(this.gbl(bl+3) + 			'return True');
	cmd.push(this.gbl(bl+2) + 		'else :');
	cmd.push(this.gbl(bl+3) + 			'return False');
		
	cmd.push(this.gbl(bl+1) + 	'if (isinstance(getattr(self,varName),np.ndarray) ):');
	cmd.push(this.gbl(bl+2) +  		'if (len(getattr(self,varName)) > 0 and not any([a==None for a in getattr(self,varName)])  ):');
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
 		'if ("containment" in MODEL.keys()):');
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
	
    return '_' + propName ;
};
/*----------------------------------------------------------------------------*/
Base.prototype.getPropertyAttrsHolderName = function(prop) {
	
	return (prop.name + 'Attrs');
};

/*----------------------------------------------------------------------------*/
Base.prototype.getPropertyPrivateName = function(prop) {
	
	if (prop.set == 'false' && prop.get == 'false' && 
			this.access == 'public' ){
		return prop.name;
	}
	else {
		return this.makePrivate(prop.name);
		
	}
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
	
	var dimList = this.getPythonArrayDimList(prop);
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
	
	cmd.push(this.gbl(bl) + 
	'def clone(self):');	
	cmd.push(this.gbl(bl+1) + 
			'newObj = ' + this.getClassName() + '()' );	     
	cmd.push(this.gbl(bl+1) + 
			'return self._cloneTo(newObj)' );	     

	cmd.push(this.gbl(bl+1));
	/* =============================================== */
	cmd.push(this.gbl(bl) + 
	'def _cloneTo(self,newObj):');	    

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
	
	cmd.push(this.gbl(bl+1) + 
	'return newObj' );	     
	
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
Base.prototype.factoryFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
		
	cmd.push(this.gbl(bl) + 
	'def create(self,name):');	
	cmd.push(this.gbl(bl+1) + 
		'return ' + this.getModel().name + '(name)');

	var props = this.getProperties();
    for (var i = 0; i<props.length; i++) {
    	if (!(this.isAtomic(props[i]))) {
    		var prop = props[i];
			var propType = this.getClassPathFromType(prop.type) ;
			
				cmd.push(this.gbl(bl) + 
				'def makea' + this.firstToUpper(prop.name) +'(self,name):');	
				cmd.push(this.gbl(bl+1) + 
					'return ' + propType + '(name)');
			
			
			if (this.isArray(prop)){
				cmd.push(this.gbl(bl) + 
				'def append' + this.firstToUpper(prop.name) +'(self,name=None):');
				cmd.push(this.gbl(bl+1) + 
					'objs = [x for x in self.' + prop.name + ' if (x.name == name)]' );
				cmd.push(this.gbl(bl+1) + 
					'if len(objs) > 1:' );			
				cmd.push(this.gbl(bl+2) + 
						'raise Exception(" more than one " + name + " is found in ' + prop.name + '")' );
				cmd.push(this.gbl(bl+1) + 
					'elif len(objs) == 1:' );			
				cmd.push(this.gbl(bl+2) + 
						'print ("warning: object %s already exist."%(name))' );	
				cmd.push(this.gbl(bl+2) + 
						'return objs[0]' );	
				cmd.push(this.gbl(bl+1) + 
					'obj = ' + propType + '(name)');
				cmd.push(this.gbl(bl+1) + 
					'self.' + prop.name + '.append(obj)');
				if (this.hasAssignments(prop))
					cmd.push(
						this.assignPropertyValue(bl+1,	this.getAssignments(prop), 'obj')
						);
				if (this.hasDependencies(prop))
					cmd.push(
						this.setChildPropRefs(bl+1, prop, 'obj')
						);
				if (this.hasDependents(prop))
					throw "array can not have dependents.";
					
				cmd.push(this.gbl(bl+1) + 
						'return obj');
				
				cmd.push(this.gbl(bl) + 
					'def delete' + this.firstToUpper(prop.name) +'(self):');
				cmd.push(this.gbl(bl+1) + 
						'self.' + this.makePrivate(prop.name) + ' = [] ');
						
			}
			else {
				cmd.push(this.gbl(bl) + 
				'def create' + this.firstToUpper(prop.name) +'(self, name=None):');
				cmd.push(this.gbl(bl+1) + 
					'if (self.' + prop.name + ' != None): ');
				cmd.push(this.gbl(bl+2) + 
						'raise Exception("object ' + prop.name + 
						' already exist, use renew' + this.firstToUpper(prop.name) +
						' to get a new one.") ');
				cmd.push(this.gbl(bl+1) + 
					'return self.renew' + this.firstToUpper(prop.name) + '(name)');
				
				cmd.push(this.gbl(bl) + 
					'def delete' + this.firstToUpper(prop.name) +'(self):');
					cmd.push(this.gbl(bl+1) + 
						'self.' + this.makePrivate(prop.name) + ' = None ');
				
				cmd.push(this.gbl(bl) + 
				'def renew' + this.firstToUpper(prop.name) +'(self, name=None):');
				cmd.push(this.gbl(bl+1) + 
					'self.' + prop.name + ' = ' + propType 
							+ '('+ this.stringify(prop.name) +')');
				if (this.hasAssignments(prop))
					cmd.push(
					this.assignPropSinglesValues(bl+1,	prop)
					);
				cmd.push(this.gbl(bl+1) + 
					'if name != None:');
				cmd.push(this.gbl(bl+2) + 
						'self.' + prop.name + '.name = name' );
				if (this.hasDependencies(prop))
					cmd.push(
					this.setParentPropsRefs(bl+1,prop)
					);
				if (this.hasDependents(prop)){
					cmd.push(
					this.setChildPropsRefs(bl+1, prop)
					);
				}
				cmd.push(this.gbl(bl+1) + 
					'return self.' + prop.name);
			}
			cmd.push(this.gbl(bl));
    	}
		
	}
	
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*   Frtran specific model handling functions */
/*----------------------------------------------------------------------------*/
Base.prototype.isAllocatable = function(prop) {

    //if (this.isVariableDimArray(prop) || (prop.type == 'string'))
    if (this.isVariableDimArray(prop))
        return true;
    else
        return false;

};
/*----------------------------------------------------------------------------*/
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


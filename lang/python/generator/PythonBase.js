var path = require('path');
var fs = require('fs');

var simosPath = require('./config.js').simosPath;
var CommonLangBase = require(path.join(simosPath, 'generator','lang','CommonLangBase.js')).CommonLangBase;

var Packaging = require('./packaging/Packaging.js').Packaging;

/*----------------------------------------------------------------------------*/
function PythonBase(model){
	this.constructor(model);
};
exports.PythonBase = PythonBase;
// module.exports = function(model) { return new PythonBase(model); };

/*----------------------------------------------------------------------------*/
PythonBase.prototype = Object.create(CommonLangBase.prototype);
/*----------------------------------------------------------------------------*/

packageParts = ['./storage/SaveLoad',
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
		PythonBase.prototype[key] = addPack.prototype[key];
	}
}

/*----------------------------------------------------------------------------*/
PythonBase.prototype.constructor = function(model) {
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
	
	this.name = 'python';
	this.ext = 'py';
	
	this.packagePathSep = '.';
	
	this.blockSpace = '    ';
	
	this.sep1 = '#******************************************************************************';
	this.sep2 = '#---------------------------------------------------------------------------';
	
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
PythonBase.prototype.stringify = function(str) {
	return (JSON.stringify(str));
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.importModules = function() {
	 
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
	    	cmd.push(this.gbl() + 'print "WARNING: ' + module.name +' is not installed."');
	    }
	    else 
	    	cmd.push(imp);
	}
	
	
	
	cmd.push(this.getSuperTypesImport());
	
    return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
PythonBase.prototype.makeModulePath = function(packagedTypeStr) {
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

PythonBase.prototype.getClassPathFromType = function(packagedTypeStr) {
	var parsed = this.parsePackagedTypeStr(packagedTypeStr);
	var modulePath = this.makeModulePath(parsed);
	
	return (modulePath + this.packagePathSep + parsed.name);
};

PythonBase.prototype.getOutCodeFileNameFromVersionedPackagedTypeStr = function(modelID) {
	return this.getModelNameFromPackagedTypeStr(modelID) + '.' + this.ext;
	
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getSuperTypesImport = function() {
	
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
PythonBase.prototype.getClassName = function() {
	return this.getName();
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.superTypesList = function() {
	
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
PythonBase.prototype.getImportForCustomDataTypes = function() {
	
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
PythonBase.prototype.getPythonArrayDimList = function(prop) {
	
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
PythonBase.prototype.getPythonArrayShape = function(prop) {
	
	if (this.isArray(prop)){
		return '[' + this.getPythonArrayDimList(prop).join() + ']';
	}
	else {
		throw ('Illigal non-array input.',prop);
	}
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.isSetFunc = function(bl) {
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
PythonBase.prototype.isContainedFunc = function(bl) {
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
PythonBase.prototype.getPropModelFunc = function(bl) {
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
PythonBase.prototype.makePrivate = function(propName) {
	
    return '_' + propName ;
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getPropertyAttrsHolderName = function(prop) {
	
	return (prop.name + 'Attrs');
};

/*----------------------------------------------------------------------------*/
PythonBase.prototype.getPropertyPrivateName = function(prop) {
	
	if (prop.set == 'false' && prop.get == 'false' && 
			this.access == 'public' ){
		return prop.name;
	}
	else {
		return this.makePrivate(prop.name);
		
	}
};
// exports.PythonBase.prototype.getPropertyPrivateName =
// PythonBase.prototype.getPropertyPrivateName;

/*----------------------------------------------------------------------------*/
PythonBase.prototype.getPropertyName = function(i) {
	var prop = this.getProperties()[i];
	return prop.name;
};
// exports.PythonBase.prototype.getPropertyName =
// PythonBase.prototype.getPropertyName;
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getBlockSpace = function(blockLevel) {
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
PythonBase.prototype.gbl = function(blockLevel) {
	
	return this.getBlockSpace(blockLevel);
};


/*----------------------------------------------------------------------------*/
PythonBase.prototype.getLoopBlockForArray = function(bl, prop) {
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
PythonBase.prototype.cloneFunc = function(bl) {
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
PythonBase.prototype.factoryFunc = function(bl) {
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
/*   Handling user specified code in generator functions */
/*----------------------------------------------------------------------------*/

PythonBase.prototype.findStrInLines = function(lines, str) {
    for (var i = 0; i<lines.length; i++) {
    	if (lines[i].indexOf(str) != -1)
    		return i;
    }
    return -1;
}

PythonBase.prototype.extractUserDefinedCode = function(code) {
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

PythonBase.prototype.getUserDefinedCode = function(flag) {
    if (this.userCodes[flag].code == "")
            return [this.userCodes[flag].start,this.userCodes[flag].end].join('\n'); 
    else
        return [this.userCodes[flag].start,this.userCodes[flag].code, this.userCodes[flag].end].join('\n'); 
};

/*----------------------------------------------------------------------------*/


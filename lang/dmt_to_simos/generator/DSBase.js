var path = require('path');
var fs = require('fs');

var simosPath = require('./config.js').simosPath;
var CommonLangBase = require(path.join(simosPath, 'generator','lang','CommonLangBase.js')).CommonLangBase;

var Packaging = require('./packaging/Packaging.js').Packaging;

/*----------------------------------------------------------------------------*/
function DSBase(model){
	this.constructor(model);
};
exports.DSBase = DSBase;
// module.exports = function(model) { return new DSBase(model); };

/*----------------------------------------------------------------------------*/
DSBase.prototype = Object.create(CommonLangBase.prototype);
/*----------------------------------------------------------------------------*/

packageParts = [];

for (var ip=0, len = packageParts.length; ip<len; ip++) {
	var packPath = packageParts[ip];
	var packPathParts = packPath.split('/');
	var packName = packPathParts[packPathParts.length-1];
	var addPack = require(packPath);
	addPack = addPack[packName];
	for (key in addPack.prototype){
		DSBase.prototype[key] = addPack.prototype[key];
	}
}

/*----------------------------------------------------------------------------*/
DSBase.prototype.constructor = function(model) {
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
	this.generalModules = [];
	
	this.name = 'dmt';
	this.ext = 'json';
	
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
DSBase.prototype.stringify = function(str) {
	return (JSON.stringify(str));
};
/*----------------------------------------------------------------------------*/
DSBase.prototype.importModules = function() {
	 
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
DSBase.prototype.makeModulePath = function(packagedTypeStr) {
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

DSBase.prototype.getClassPathFromType = function(packagedTypeStr) {
	var parsed = this.parsePackagedTypeStr(packagedTypeStr);
	var modulePath = this.makeModulePath(parsed);
	
	return (modulePath + this.packagePathSep + parsed.name);
};

DSBase.prototype.getOutCodeFileNameFromVersionedPackagedTypeStr = function(modelID) {
	return this.getModelNameFromPackagedTypeStr(modelID) + '.' + this.ext;
	
};
/*----------------------------------------------------------------------------*/
DSBase.prototype.getSuperTypesImport = function() {
	
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
DSBase.prototype.getClassName = function() {
	return this.getName();
};
/*----------------------------------------------------------------------------*/
DSBase.prototype.superTypesList = function() {
	
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
DSBase.prototype.getImportForCustomDataTypes = function() {
	
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
DSBase.prototype.getPythonArrayDimList = function(prop) {
	
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
DSBase.prototype.getPythonArrayShape = function(prop) {
	
	if (this.isArray(prop)){
		return '[' + this.getPythonArrayDimList(prop).join() + ']';
	}
	else {
		throw ('Illigal non-array input.',prop);
	}
};

/*----------------------------------------------------------------------------*/
DSBase.prototype.sweepFunc = function(bl) {
	
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
DSBase.prototype.isStringFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def isString(self, txt):');

	cmd.push(this.gbl(bl+1) + 'if (type(txt) == type("")) or (type(txt) == np.string_) or isinstance(txt, str):');	
	cmd.push(this.gbl(bl+2) + 	'return True');
	cmd.push(this.gbl(bl+1) + 'else :');
	cmd.push(this.gbl(bl+2) + 	'return False');

	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
DSBase.prototype.isStringArrayFunc = function(bl) {
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
DSBase.prototype.getShapeFunc = function(bl) {
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
DSBase.prototype.isSetFunc = function(bl) {
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
DSBase.prototype.isContainedFunc = function(bl) {
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
DSBase.prototype.getPropModelFunc = function(bl) {
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
DSBase.prototype.makePrivate = function(propName) {
	
    return '_' + propName ;
};
/*----------------------------------------------------------------------------*/
DSBase.prototype.getPropertyAttrsHolderName = function(prop) {
	
	return (prop.name + 'Attrs');
};

/*----------------------------------------------------------------------------*/
DSBase.prototype.getPropertyPrivateName = function(prop) {
	
	if (prop.set == 'false' && prop.get == 'false' && 
			this.access == 'public' ){
		return prop.name;
	}
	else {
		return this.makePrivate(prop.name);
		
	}
};
// exports.DSBase.prototype.getPropertyPrivateName =
// DSBase.prototype.getPropertyPrivateName;

/*----------------------------------------------------------------------------*/
DSBase.prototype.getPropertyName = function(i) {
	var prop = this.getProperties()[i];
	return prop.name;
};
// exports.DSBase.prototype.getPropertyName =
// DSBase.prototype.getPropertyName;
/*----------------------------------------------------------------------------*/
DSBase.prototype.getBlockSpace = function(blockLevel) {
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
DSBase.prototype.gbl = function(blockLevel) {
	
	return this.getBlockSpace(blockLevel);
};


/*----------------------------------------------------------------------------*/
DSBase.prototype.getLoopBlockForArray = function(bl, prop) {
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
DSBase.prototype.isDMTArray = function(att) {
	if ( (att.dimensions === undefined) ||
		 (att.dimensions === "") ) {
			 return false;
		 }
	else 
		 return true
}
/*----------------------------------------------------------------------------*/
DSBase.prototype.makeSIMOSModel = function() {
    var dmtModel = this.dmtModel;
    var simosModel = this.model;
    
    simosModel['name'] = dmtModel.name;
    simosModel['description'] = dmtModel.description;    
    
    simosModel['properties'] = [];
    
    var attributes = dmtModel.attributes;
    var propNum = attributes.length;
    var props = [];
    
    for(var i = 0; i < propNum; i++) {
    	var att = attributes[i];  
    	var prop = {};
    	
    	prop["name"] = att.name;
    	if (this.isAtomicType(att.attributeType)){
    	    if (this.isNumericType(att.attributeType)){
    	        prop["type"] = "double"
    	    }
    	    else {    
    	    	prop["type"] = att.attributeType;
    	    }
    	}
    	else{
			prop["type"] = att.attributeType.replace(/\//g,":");
			//removing data source
			var typeParts = prop["type"].split(":");
			prop["type"] = typeParts.slice(1,typeParts.length).join(":")
  	    }
    	
    		
    	prop["description"] = att.description;
    	
		//dmtPtop["default"] = "";
		if (this.isAtomicType(att.attributeType) && 
			!this.isDMTArray(att) ){
				console.log(JSON.stringify(att));
			if (att.default != undefined){
				if (att.default != "") {
					prop["value"] = att.default;
					if ( (prop["value"] == true) ||
						(prop["value"] == false ) ) {
							prop["value"] = ""+(prop["value"])
						}
				}
			}
			else {
				if (this.isNumericType(att.attributeType)){
					prop["value"] = 0.0;
				}            
			}
		}
        
        if (att.name == 'name'){
            prop["value"] = dmtModel.name.charAt(0).toLowerCase() + dmtModel.name.slice(1);
        }
        

        //dmtProp["dimensions"] = "";
        if (att.dimensions != undefined){
			if (att.dimensions != "")
            	prop["dim"] = att.dimensions;
        }

        prop["contained"] = ""+(this.isContained(att));
        prop["optional"] = ""+(this.isOptional(att));
    	
        //dmtProp["enumType"] = "";

        if (['type'].indexOf(att.name) >= 0){ 
        	//simosModel.properties.push(dmtProp);
        }
        else {
            props.push(prop);
        }
	}
	
	
	for (var i =0; i<props.length; i++){
	    simosModel.properties.push(props[i]);
	    }
	
    
    return simosModel;
}


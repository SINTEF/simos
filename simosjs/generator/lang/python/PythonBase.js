//var njs = require('../../njs')();
var CommonLangBase = require('../CommonLangBase.js').CommonLangBase;

/*----------------------------------------------------------------------------*/
function PythonBase(model){
	this.constructor(model);
};
exports.PythonBase = PythonBase;
// module.exports = function(model) { return new PythonBase(model); };

/*----------------------------------------------------------------------------*/
PythonBase.prototype = Object.create(CommonLangBase.prototype);
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
	
	this.name = 'python';
	this.ext = 'py';
	
	this.blockSpace = '    ';
	
	this.sep1 = '#******************************************************************************';
	this.sep2 = '#---------------------------------------------------------------------------';
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.stringify = function(str) {
	return (JSON.stringify(str));
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.importModules = function() {
	 
	var cmd = [];
	
	cmd.push('#importing general modules');
	
	cmd.push('import numpy as np');
	cmd.push('import os');
	cmd.push('import h5py');
	cmd.push('import json');
	cmd.push('import collections');
	cmd.push('import uuid');
	cmd.push('import pyfoma.dataStorage as pyds');
	
	cmd.push(this.getSuperTypesImport());
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getSuperTypesImport = function() {
	
	var cmd = [];

	var superTypes = this.superTypes();
	
	cmd.push('#importing extended types');
	for (var i = 0; i<superTypes.length; i++){
		var supType = superTypes[i];
		cmd.push('from ' + supType.path + ' import ' + supType.name);
	}
	return cmd.join('\n');
	
    
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
			var typeData = this.parseFullTypeName(prop.type);
			if (importedTypes.indexOf(typeData.path) == -1) {
				cmd.push('import ' + typeData.path );
				importedTypes.push(typeData.path);
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
PythonBase.prototype.getInitObjectList = function(prop) {
	if ((this.isArray(prop)) && (! this.isAtomic(prop))){
		/* we have o use a list with the defined dimensions of the object */
		var classPath = this.getClassPathFromType(prop.type);
		var dimList = this.getDimensionList(prop);
		var leftBlock = '';
		var rightBlock = '';
		// var objName = JSON.stringify(className);
		var objName = this.stringify(prop.name);
		
		if (dimList.length > 1)
			throw "getInitObjectList is not implemented for more than one dimensional array.";
		
		for (var i = dimList.length-1; i>=0; i--){
			var indName = 'i' + i;
			
			leftBlock = leftBlock + '[';
			rightBlock = rightBlock + ' for ' + indName + ' in range(0,self.' + dimList[i] + ')]';
			objName = objName + ' + str(' + indName + ')';
		}
		return leftBlock + ' ' + classPath + '(' + objName  + ')' + rightBlock;
	}
	else {
		throw ('Array with non-atomic type was expected.', prop);
	}
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.assignPropertyValue = function(bl, assign, varName) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	for (a in assign) {
		cmd.push(this.getBlockSpace(bl) + 
		varName + '.' + a +	' = ' + JSON.stringify(assign[a]) );
	}		
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.assignPropSinglesValues = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	if (this.isSingle(prop)) {
		var assign = this.getAssignments(prop);
		if (Object.getOwnPropertyNames(assign).length > 0) {
			cmd.push(this.assignPropertyValue(bl, assign, 'self.' + prop.name));
		}
	}
	else
		throw "only single object can be handled here.";

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.assignPropArraysValues = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	if (this.isArray(prop)) {
		var assign = this.getAssignments(prop);
		if (Object.getOwnPropertyNames(assign).length > 0) {
			var loopBlock = this.getLoopBlockForArray(bl, prop);
			cmd.push(loopBlock.cmd);
			cmd.push(this.assignPropertyValue(loopBlock.bl+1, assign, 
				'self.' + this.getPropertyPrivateName(prop) + loopBlock.indList));
		}
	}
	else
		throw "only array object can be handled here.";

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.assignPropValues = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	if (this.isArray(prop))
		cmd.push(this.assignPropArraysValues(bl, prop));	
	else 
		cmd.push(this.assignPropSinglesValues(bl, prop));	

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.setPropertyRef = function(bl, varName, deptProp, varNameRef) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	cmd.push(this.getBlockSpace(bl) + 
			varName + '.' + deptProp + 
			' = ' + varNameRef );
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.setPropSinglesRefs = function(bl, childProp, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	if (this.isSingle(childProp)) {
		var deptProps = this.getDependentChildFor(childProp,prop);
		
		if (deptProps.length > 0) {
			for (var di = 0, dilen = deptProps.length; di < dilen; di++){
				var extraTab = 0;
				if (this.isOptional(childProp)) {
				cmd.push(this.getBlockSpace(bl) + 
				'if not(self.' + childProp.name + '==None):'
				);
				extraTab = 1;
				}
				cmd.push(
				this.setPropertyRef(bl+extraTab, 'self.' + childProp.name, deptProps[di], 'self.' + prop.name)
				);
			}	
		}
	}
	else
		throw "only single object can be handled here.";

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.setPropArraysRefs = function(bl, childProp, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	if (this.isArray(childProp)) {

		var deptProps = this.getDependentChildFor(childProp,prop);
		
		if (deptProps.length > 0) {
			var loopBlock = this.getLoopBlockForArray(bl, childProp);
			cmd.push(loopBlock.cmd);
	
			for (var di = 0, dilen = deptProps.length; di < dilen; di++){
				cmd.push(
						this.setPropertyRef(loopBlock.bl+1, 'self.' + childProp.name + loopBlock.indList, 
								deptProps[di], 
								'self.' + prop.name)
						);
			}	
		}
	}
	else
		throw "only array object can be handled here.";

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.setPropRefs = function(bl, childProps, parents) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/* make relations between child and parrent data sets */
	for (var j = 0; j<parents.length; j++) {
		var prop = parents[j];
		for (var i = 0; i<childProps.length; i++) {
			var childProp = childProps[i];
			
			if (this.isAtomic(childProp)) {
				throw ('Illigal type for dependicy.',childProp);
			}
			else if (this.isArray(childProp)) {
				cmd.push(this.setPropArraysRefs(bl, childProp, prop));
	
			}
			else {
				cmd.push(this.setPropSinglesRefs(bl, childProp, prop));
			}
		}
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.setChildPropsRefs = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/* make relations between child and parrent data sets */
	var childProps = this.getChildProps(prop);
	cmd.push(this.setPropRefs(bl, childProps, [prop]));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.setParentPropsRefs = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/* make relations between child and parrent data sets */
	var parentProps = this.getParentProps(prop);
	
	cmd.push(this.setPropRefs(bl, [prop], parentProps));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.setChildPropRefs = function(bl, childProp, objName) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	if (objName == undefined){
		objName = 'self.' + childProp.name;
	}
	
	var cmd = [];

	
	var dept = this.getPropDependencies(childProp);
	if (dept != undefined) {
		for (d in dept) {
			var prop = this.getProperty(dept[d]);
			cmd.push(
			this.setPropertyRef(bl, objName, d, 'self.' + prop.name)
				);
		}
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getAtomicInitValue = function(prop) {
	if (this.isString(prop))
		return this.stringify("");
	else if (prop.type == 'integer')
		return '0';
	else
		return '0.0';
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getPropertyInit = function(bl, prop) {
	/*
	 * return properties default value, if property is an object (complex type),
	 * it returns the command to instantiate that object.
	 */
	
	if(prop.value == undefined){
		if (this.isArray(prop)) {
			if (this.isAtomic(prop)){
				var cmds = [];
				cmds.push(this.getBlockSpace(bl) + 
					'self.' + this.getPropertyPrivateName(prop) + '=' + 'np.empty(shape=(' + 
						this.getPythonArrayDimList(prop).join() + 
						'), dtype=' + this.changeType(prop.type) + ')' );
				cmds.push(this.getBlockSpace(bl) + 
						'self.' + this.getPropertyPrivateName(prop) + 
							'.fill(' + this.getAtomicInitValue(prop)+ ')' );
				return cmds.join('\n');
			}
			else {
				if (this.isContained(prop)){
					// return this.getInitObjectList(prop);
					return (this.getBlockSpace(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '= []');
				}
				else {
					return (this.getBlockSpace(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '= []');
				}
				
			}
		}
		else if (!(this.isAtomic(prop)) && 
				  (this.isContained(prop)) && 
				 !(this.isOptional(prop))){
			return (this.getBlockSpace(bl) +
					'self.' + this.getPropertyPrivateName(prop) + '=' + 
						this.getClassPathFromType(prop.type) + '(' + JSON.stringify(prop.name) +')');
		}
		else {
			return (this.getBlockSpace(bl) +
					'self.' + this.getPropertyPrivateName(prop) + '= None' );
		}
	}
	else {
		if (this.isAtomic(prop)){
			if (this.isSingle(prop)) {
				if (prop.type == "boolean") {
					return (this.getBlockSpace(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '=' + 
								this.changeType(prop.type) + '(' + this.changeType("integer") + '(' + JSON.stringify(prop.value) + ')' + ')');
				}
				else {
					return (this.getBlockSpace(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '=' + 
								this.changeType(prop.type) + '(' + JSON.stringify(prop.value) + ')');
				}
			}
			else {
				/* array with predefined values and fixed dimension,
				 * check for dimensions
				 * cast value types, must be presented as an array in JSON
				 * with correct type*/
				
				if (prop.value instanceof Array)
					return (this.getBlockSpace(bl) + 
						'self.' + this.getPropertyPrivateName(prop) + '=' + 'np.array(' + this.stringify(prop.value) +
							', dtype=' + this.changeType(prop.type) + ')' );
				else{
					/*initialize all elements with a single value */
					var cmds = [];
					cmds.push(this.getBlockSpace(bl) + 
						'self.' + this.getPropertyPrivateName(prop) + '=' + 'np.empty(shape=(' + 
							this.getPythonArrayDimList(prop).join() + 
							'), dtype=' + this.changeType(prop.type) + ')' );
					cmds.push(this.getBlockSpace(bl) + 
							'self.' + this.getPropertyPrivateName(prop) + 
								'.fill(' + this.changeType(prop.type) +'(' + this.stringify(prop.value) + '))' );
					return cmds.join('\n');
				}

			}
		}
		else {
			if (this.isSingle(prop)) {
				if (!(this.isAtomic(prop)) && 
					 (this.isContained(prop)) && 
					!(this.isOptional(prop)) ){
					return (this.getBlockSpace(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '=' + 
								this.getClassPathFromType(prop.type) + '(' + JSON.stringify(prop.name) +')');
				}
				else {
					return (this.getBlockSpace(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '=' + 'None');
				}
			}
			else {
				/* array */
				throw "array of objects can not be predefined.";
			}

		}

		
	}
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.isSetFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def isSet(self, varName):');

	cmd.push(this.getBlockSpace(bl+1) + 
 		'if (isinstance(getattr(self,varName),list) ):');
	cmd.push(this.getBlockSpace(bl+2) + 
 			'if (len(getattr(self,varName)) > 0 and not any([a==None for a in getattr(self,varName)])  ):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'return True');
	cmd.push(this.getBlockSpace(bl+2) + 
			'else :');
	cmd.push(this.getBlockSpace(bl+3) + 
				'return False');
		
	cmd.push(this.getBlockSpace(bl+1) + 
	 	'if (isinstance(getattr(self,varName),np.ndarray) ):');
	cmd.push(this.getBlockSpace(bl+2) + 
	 		'if (len(getattr(self,varName)) > 0 and not any([a==None for a in getattr(self,varName)])  ):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'return True');
	cmd.push(this.getBlockSpace(bl+2) + 
			'else :');
	cmd.push(this.getBlockSpace(bl+3) + 
				'return False');
	
	 /* single atomic type value */
	cmd.push(this.getBlockSpace(bl+1) + 
	 	'if (getattr(self,varName) != None):');
	cmd.push(this.getBlockSpace(bl+2) + 
			 'return True');
	
	cmd.push(this.getBlockSpace(bl+1) + 
 		'return False');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.isContainedFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def isContained(self, varName):');

	cmd.push(this.getBlockSpace(bl+1) + 
	 	'MODEL = self.getPropModel(varName)');
	
	cmd.push(this.getBlockSpace(bl+1) + 
 		'if ("containment" in MODEL.keys()):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (MODEL["containment"] == "false"):');	
	cmd.push(this.getBlockSpace(bl+3) + 
 				'return False');

	cmd.push(this.getBlockSpace(bl+1) + 
		'return True');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getPropModelFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def getPropModel(self, varName):');

	cmd.push(this.getBlockSpace(bl+1) + 
	 	'props = self.' + this.modelDesAtt() + '["properties"]');
	
	cmd.push(this.getBlockSpace(bl+1) + 
 		'for prop in props:');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (prop["name"] == varName):');	
	cmd.push(this.getBlockSpace(bl+3) + 
 				'return prop');
	
	if (this.isDerived()) {
		var superTypes = this.superTypes();
		
		cmd.push(this.getBlockSpace(bl) + 
				'#calling supers');
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.getBlockSpace(bl+1) +
				'return ' + supType.name +'().getPropModel(varName)');
				
		}
		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'raise Exception("property " + varName + " was not found.")');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.classInit = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
			'def __init__(self,name=None):');

	/* call super class init function if any */
	if (this.isDerived()) {
		/* new class method */
		// cmd.push(this.getBlockSpace(bl+1) +
		// 'super(' + this.getClassName() + ', self).__init__()');
		// cmd.push(this.getBlockSpace(bl+1) + '');
		
		var superTypes = this.superTypes();
		
		cmd.push(this.getBlockSpace(bl) + 
				'#calling super inits');
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.getBlockSpace(bl+1) +
				supType.name +'.__init__(self, name)');
				
		}
		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	
	/* init main attributes */
	/*
	 * var attrs = this.getPropertyStorableAttrs(this.getModel());
	 * cmd.push(this.getBlockSpace(bl+1) + 'self.attrs = dict()'); for(var i =
	 * 0; i < attrs.length; i++) { var attr = attrs[i];
	 * cmd.push(this.getBlockSpace(bl+1) + 'self.attrs[' + JSON.stringify(attr) + '] = ' +
	 * JSON.stringify(this.getModel()[attr]) ); }
	 */
	
	// cmd.push(this.getBlockSpace(bl+1) +
	// 'self.' + this.modelDesAtt() + ' = ' +
	// JSON.stringify(this.getModelWithOutPtoperties()) );
	cmd.push(this.getBlockSpace(bl+1) + 
		'self.' + this.modelDesAtt() + ' = ' + this.stringify(this.getModel(),  null, '\t') );
	/*
	 * this is a dictionary which keep track of synchronizing the data in object
	 * with the back-end storage, it keep a list of properties, -- not in keys,
	 * or has a value of -1, means it is out of sync with data-storage and when
	 * the user asks for the data, it must load from storage first. -- not in
	 * keys, or value 1, means it is updated by the user and on save must be
	 * written to storage
	 */
	

	
	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		if (prop.name == "name") {
			/* initializing name */		
			cmd.push(this.getPropertyInit(bl+1, prop));			
			cmd.push(this.getBlockSpace(bl+1) + 
					'if not(name == None):');			
			cmd.push(this.getBlockSpace(bl+2) + 
						'self.' + this.getPropertyPrivateName(prop) + ' = name ');			
		}
		else {
			/* initializing other properties */
			cmd.push(this.getPropertyInit(bl+1, prop));
			
			if (!this.isAtomic(prop) 		&&  this.isContained(prop) && 
				 this.hasAssignments(prop)  && !this.isOptional(prop) ){
				cmd.push(this.assignPropValues(bl+1, prop));
			}
		}
		
		/* storing, storable property attributes */
		/*
		 * var propAttrs = this.getPropertyStorableAttrs(prop);
		 * cmd.push(this.getBlockSpace(bl+1) + 'self.' +
		 * this.getPropertyAttrsHolderName(prop) + ' = dict()'); for(var j = 0;
		 * j < propAttrs.length; j++) { cmd.push(this.getBlockSpace(bl+1) +
		 * 'self.' + this.getPropertyAttrsHolderName(prop) + '[' +
		 * JSON.stringify(propAttrs[j]) + '] = ' +
		 * JSON.stringify(prop[propAttrs[j]])); }
		 */
		
		cmd.push(this.getBlockSpace(bl+1) + 
				'self.' + this.modelDesAtt(prop) + ' = ' + JSON.stringify(prop) );
		cmd.push(this.getBlockSpace(bl+1));

	}
	cmd.push(this.getBlockSpace(bl+1) + 
		'self.ID = str(uuid.uuid4())');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'self._saved = {}');
	cmd.push(this.getBlockSpace(bl+1) + 
		'self.REF = None');
	
	/* storage */
	cmd.push(this.getBlockSpace(bl+1) + 
		'self._sync = {}');
	cmd.push(this.getBlockSpace(bl+1) + 
		'self._storageBackEndType = ' + JSON.stringify('hdf5') );
	cmd.push(this.getBlockSpace(bl+1) + 
		'self._storageBackEndServer = pyds.getDataStorageBackEndServer(self._storageBackEndType)');
	cmd.push(this.getBlockSpace(bl+1) + 
		'self._storageBackEndServer.filePath = str(name) + ".h5"');

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
PythonBase.prototype.propSet = function(prop, bl) {
	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + '@ ' + prop.name +'.setter' );	

	cmd.push(this.getBlockSpace(bl) + 'def ' + prop.name + '(self, val):');
	
	/* assign the value */
	if (this.isAtomic(prop)) {
		if (this.isArray(prop)) {
			/*
			 * no chekcs here, TODO: add casting or checks for atomic type
			 * arrays
			 */
			cmd.push(this.getBlockSpace(bl+1) + 'self.' + this.makePrivate(prop.name) +' = val');			
		}
		else {
			/* type casting between atomic types */
			if (prop.type == "boolean") {
				cmd.push(this.getBlockSpace(bl+1) + 'self.' + this.makePrivate(prop.name) +' = ' + 
						this.changeType(prop.type) +
						'(' + this.changeType("integer") + '(val)' + ')');
			}
			else {
				if (this.isLimited(prop)) {
					if (prop.from instanceof Array){ 
						cmd.push(this.getBlockSpace(bl+1) + 
						'if not(' + this.changeType(prop.type) + '(val) in ' + this.stringify(prop.from) + '): ' );
						cmd.push(this.getBlockSpace(bl+2) + 
							'raise Exception(str(val) + " must be in " + str(' + this.stringify(prop.from) + ') )');
					}
					else{
						cmd.push(this.getBlockSpace(bl+1) + 
						'if not(' + this.changeType(prop.type) + '(val) in self.' + this.makePrivate(prop.from) + '): ' );
						cmd.push(this.getBlockSpace(bl+2) + 
							'raise Exception(str(val) + " must be in " + str(self.' + this.makePrivate(prop.from) + ') )');
					}
				}
				cmd.push(this.getBlockSpace(bl+1) + 'self.' + this.makePrivate(prop.name) +' = ' + 
						this.changeType(prop.type) +'(val)');
				
			}

			

		}
	}
	else {
		/* non-atomic types */
		if (this.isArray(prop)) {
			/*
			 * cheks if all elements is array has the correct type TODO: add the
			 * check
			 */
		}
		else {
			/* check if it has the correct type */
			cmd.push(this.getBlockSpace(bl+1) + 
					'if not(isinstance(val, ' + this.getClassPathFromType(prop.type)  + ')):');
			cmd.push(this.getBlockSpace(bl+2) + 
					'raise Exception("variable type for ' + prop.name + ' must be an instance of ' + prop.type + ' while " + str(type(val)) + " is passed .")');

		}
		/* simple assignment */
		cmd.push(this.getBlockSpace(bl+1) + 'self.' + this.makePrivate(prop.name) +' = val');
	}

	/* change array sizes if prop is a dimension */
	if (this.isDimension(prop)){
		/* find out the array which has prop as a dimension */
		var arrays = this.getPropertiesWithDimension(prop);
		/* resize the array accordingly */
		for (var i = 0; i<arrays.length; i++){
			cmd.push(this.getBlockSpace(bl+1) + 'self.' + this.arrayUpdateSizeFuncName(arrays[i]) +'()' );
		};	
	}
	
	/* make relations between child and parrent data sets */
	if (this.hasDependencies(prop)) {
		cmd.push(this.setParentPropsRefs(bl+1, prop));
	}
	if (this.hasDependents(prop)){
		/*some other properties depend on this one */
		cmd.push(this.setChildPropsRefs(bl+1, prop));
	}
	
	
	cmd.push(this.getBlockSpace(bl+1) + 
			'if not(' + JSON.stringify(prop.name) + ' in self._sync.keys()):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'self._sync[' + JSON.stringify(prop.name) + '] = 1');
	
	/* return the commands */
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.arrayUpdateSize = function(prop, bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
			'def ' + this.arrayUpdateSizeFuncName(prop) + '(self):');
	var arrName = 'self.' + this.getPropertyNameInClass(prop);
	
	if (this.isAtomicType(prop.type)) {
		cmd.push(this.getBlockSpace(bl+1) + arrName + ' = np.resize(' + arrName + ',' + this.getPythonArrayShape(prop) + ')');
	}
	else {
		cmd.push(this.getBlockSpace(bl+1) + arrName + ' = ' + this.getInitObjectList(prop));
	}

    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.reprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.getBlockSpace(bl) + 
	'def __repr__(self):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'return ( json.dumps(self.dictRepr(short=True), ' + 
			'indent=4, separators=(\',\', \': \')) )' );

	cmd.push(this.getBlockSpace(bl+1));
		
	if (this.isDerived()) {
		throw "not implemented for dervied types.";
		
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.getBlockSpace(bl+1) +
			'outstr = outstr + ' + supType.name + '._represent(self)');
				
		}
		
		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	
	return cmd.join('\n');

};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.typeReprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.getBlockSpace(bl) + 
	'def typeRepr(self):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'rep = collections.OrderedDict()' );

	cmd.push(this.getBlockSpace(bl+1) + 
		'rep["__type__"] = ' + this.stringify(this.typePath(this.getModel())));
	cmd.push(this.getBlockSpace(bl+1) + 
		'rep["__ID__"] = self.ID' );
	cmd.push(this.getBlockSpace(bl+1) + 
		'rep["name"] = self.name');
	
	cmd.push(this.getBlockSpace(bl+1) + 
	'return rep');

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.dictReprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.getBlockSpace(bl) + 
	'def dictRepr(self, allItems=False, short=False):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'rep = collections.OrderedDict()' );
	cmd.push(this.getBlockSpace(bl+1) + 
		'rep["__type__"] = ' + this.stringify(this.fullTypeName()));
	cmd.push(this.getBlockSpace(bl+1) + 
		'if not(short):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'rep["__versions__"] = ' + this.getVersion() );
	cmd.push(this.getBlockSpace(bl+1) + 
		'rep["__ID__"] = self.ID' );
	cmd.push(this.getBlockSpace(bl+1) + 
		'rep["name"] = self.name');
	
	if (this.isDerived()) {
		throw "not implemented for dervied types.";
	}
	
	var props = this.getProperties();

	for (var i = 0; i<props.length; i++) {
		var prop = props[i];
		propCmd = '';
		
		if (this.isReferenced(prop))
			throw "not working for not contained elements.";
		
		if (this.isAtomic(prop)){
			if (this.isSingle(prop)){
				cmd.push(this.getBlockSpace(bl+1) + 
				'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.getBlockSpace(bl+2) + 
					'rep["'+ prop.name +'"] = self.' +  prop.name );
			}
			else if (this.isArray(prop)){
				cmd.push(this.getBlockSpace(bl+1) + 
				'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.getBlockSpace(bl+2) + 
					'if (short):');
				cmd.push(this.getBlockSpace(bl+3) + 
						'rep["'+ prop.name +'"] = str(self.' +  prop.name + '.shape)');
				cmd.push(this.getBlockSpace(bl+2) + 
					'else:');			
				cmd.push(this.getBlockSpace(bl+3) + 
						'rep["'+ prop.name +'"] = self.' +  prop.name + '.tolist()');

			}
			else
				throw "atomic data is not single nor array !!";
		}
		else {
			/*complex data type*/
			if (this.isSingle(prop)){
				cmd.push(this.getBlockSpace(bl+1) + 
				'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.getBlockSpace(bl+2) + 
					'if (short):');
				cmd.push(this.getBlockSpace(bl+3) + 
						'rep["'+ prop.name +'"] = (self.' +  prop.name + '.typeRepr())');
				cmd.push(this.getBlockSpace(bl+2) + 
					'else:');			
				cmd.push(this.getBlockSpace(bl+3) + 
						'rep["'+ prop.name +'"] = self.' +  prop.name + '.dictRepr()');
			}
			else if (this.isArray(prop)){
				cmd.push(this.getBlockSpace(bl+1) + 
				'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.getBlockSpace(bl+2) + 
					'rep["'+ prop.name +'"] = []');
				var loopBlock = this.getLoopBlockForArray(bl+2,prop);
				cmd.push(loopBlock.cmd);
					cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
						'if (short):');
					cmd.push(this.getBlockSpace(loopBlock.bl+2) + 
							'itemType = self.' + prop.name + loopBlock.indList + '.typeRepr()' );
					cmd.push(this.getBlockSpace(loopBlock.bl+2) + 
							'rep["'+ prop.name +'"].append( itemType )' );
					cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
						'else:');			
					cmd.push(this.getBlockSpace(loopBlock.bl+2) + 
							'rep["'+ prop.name +'"].append( self.' + prop.name + loopBlock.indList + '.dictRepr() )' );
				
			}
			else
				throw "complex data is not single nor array !!";
		}		
	} 
	cmd.push(this.getBlockSpace(bl+1) + 
			'return rep');
	
	return cmd.join('\n');

};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.jsonReprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.getBlockSpace(bl) + 
	'def jsonRepr(self):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'return ( json.dumps(self.dictRepr(short=False),' + 
			'indent=4, separators=(\',\', \': \')) )' );
	
	cmd.push(this.getBlockSpace(bl+1));

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.loadFromJSONDict = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def loadFromJSONDict(self, data):');

	cmd.push(this.getBlockSpace(bl+1) + 
		'self.ID = str(data["__ID__"])' );
	
	var properties = this.getProperties();
	
	for(var i = 0, ilen=properties.length; i < ilen; i++) {
		var prop = properties[i];  
		cmd.push(this.getBlockSpace(bl+1) + 
			'varName = ' + this.stringify(prop.name) );
		if (this.isAtomic(prop)) {
			if (this.isSingle(prop)) {
				cmd.push(this.getBlockSpace(bl+1) + 
				'try :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'setattr(self,varName, data[varName])' );
				cmd.push(this.getBlockSpace(bl+1) + 
				'except :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'pass ' );
			}
			else{
				cmd.push(this.getBlockSpace(bl+1) + 
				'try :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'setattr(self,varName, np.array(data[varName]))' );
				cmd.push(this.getBlockSpace(bl+1) + 
				'except :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'pass' );			
			}
		}
		else {
			if (this.isSingle(prop)) {
				cmd.push(this.getBlockSpace(bl+1) + 
				'try :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'createFunc = getattr(self,"createSet" + varName[0].capitalize()+varName[1:] )' );
				cmd.push(this.getBlockSpace(bl+2) + 
					'item = createFunc()' );
				cmd.push(this.getBlockSpace(bl+2) + 
					'item.loadFromJSONDict(data[varName])' );
				cmd.push(this.getBlockSpace(bl+1) + 
				'except :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'pass' );
			}
			else{
				cmd.push(this.getBlockSpace(bl+1) + 
				'try :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'createFunc = getattr(self,"createAppend" + varName[0].capitalize()+varName[1:])' );
				cmd.push(this.getBlockSpace(bl+2) + 
					'for i0 in range(0,len(data[varName])):' );
				cmd.push(this.getBlockSpace(bl+3) + 
						'item = createFunc()' );
				cmd.push(this.getBlockSpace(bl+3) + 
						'item.loadFromJSONDict(data[varName][i0])' );
				cmd.push(this.getBlockSpace(bl+1) + 
				'except :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'pass' );
			 }

		}

		cmd.push(this.getBlockSpace(bl+1));

	}

	
	cmd.push(this.getBlockSpace(bl+1) + 
	'pass');
	
	cmd.push(this.getBlockSpace(bl+1));
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
PythonBase.prototype.loadFromHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _loadFromHDF5Handle(self, handle):');

	cmd.push(this.getBlockSpace(bl+1) + 
		'self._loadDataFromHDF5Handle(handle)' );
	
	cmd.push(this.getBlockSpace(bl+1) + 
	'pass');
	
	cmd.push(this.getBlockSpace(bl+1));
	
	return cmd.join('\n');
};


/*----------------------------------------------------------------------------*/
PythonBase.prototype.loadDataFromHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	/* ================================================== */
	cmd.push(this.getBlockSpace(bl) + 'def _loadDataFromHDF5Handle(self, handle):');
	
	if (this.isDerived()) {
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.getBlockSpace(bl+1) +
					supType.name + '._loadDataFromHDF5Handle(self,handle)');
				
		}
		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	
	cmd.push(this.getBlockSpace(bl+1) + 
	'self.ID = str(handle.attrs["ID"])' );
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  


		/* writing the value */
		if (this.isAtomicType(prop.type)) {
			if(this.isArray(prop)){
				/* array of atomic type */
				cmd.push(this.getBlockSpace(bl+1) + 
						'self._loadFromHDF5HandleItem(handle, ' + JSON.stringify(prop.name) + ', "AtomicArray")' );
			 }
			 else{
				 /* single atomic type value */
				cmd.push(this.getBlockSpace(bl+1) + 
						'self._loadFromHDF5HandleItem(handle, ' + JSON.stringify(prop.name) + ', "AtomicSingle")' );
			 }
		}
		else {
			/*
			 * creating references and saving other complex types 'value' will
			 * be a or an array of references
			 */
			
			/* create a subgroup for the contained values */

			if(this.isArray(prop)){
				/* array non-atomic type reference */
				 cmd.push(this.getBlockSpace(bl+1) + 
					'self._loadFromHDF5HandleItem(handle, ' + JSON.stringify(prop.name) + ', "NonAtomicArray")' );
				 
			 }
			 else{
				 /* single non-atomic type reference */
				 cmd.push(this.getBlockSpace(bl+1) + 
					'self._loadFromHDF5HandleItem(handle, ' + JSON.stringify(prop.name) + ', "NonAtomicSingle")' );
			 }

		}

		cmd.push(this.getBlockSpace(bl+1));

	}
	cmd.push(this.getBlockSpace(bl+1) + 'pass');
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.loadFromHDF5HandleItem = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _loadFromHDF5HandleItem(self, handle, varName, myType):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'loadFlag = True');
		
	// cmd.push(this.getBlockSpace(bl+1) +
	// 'if (varName in self._sync.keys()):');
	// cmd.push(this.getBlockSpace(bl+2) +
	// 'if (self._sync[varName] == 1):');
	// cmd.push(this.getBlockSpace(bl+3) +
	// 'saveFlag = True');

	cmd.push(this.getBlockSpace(bl+1) + 
		'if (loadFlag):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (myType == "AtomicSingle"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._loadFromHDF5HandleItemAtomicSingle(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (myType == "AtomicArray"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._loadFromHDF5HandleItemAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (myType == "NonAtomicArray"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._loadFromHDF5HandleItemNonAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (myType == "NonAtomicSingle"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._loadFromHDF5HandleItemNonAtomicSingle(handle, varName)' );
	
	cmd.push(this.getBlockSpace(bl+2) + 
			'self._sync[varName] = -1' );
		
		 
	cmd.push(this.getBlockSpace(bl+1));

	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	
    return cmd.join('\n');
    

};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.loadFromHDF5HandleItemAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _loadFromHDF5HandleItemAtomicSingle(self, handle, varName):');

	 /* single atomic type value */
	cmd.push(this.getBlockSpace(bl+1) + 
		'try :');
	cmd.push(this.getBlockSpace(bl+2) + 
			'setattr(self,varName, handle[varName][...])' );
	cmd.push(this.getBlockSpace(bl+1) + 
		'except :');
	cmd.push(this.getBlockSpace(bl+2) + 
			'pass' );

	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.loadFromHDF5HandleItemAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _loadFromHDF5HandleItemAtomicArray(self, handle, varName):');

	/* array of atomic type */
	cmd.push(this.getBlockSpace(bl+1) + 
			'try :');
	cmd.push(this.getBlockSpace(bl+2) + 
				'setattr(self, "_"+varName, handle[varName].value)' );		
	cmd.push(this.getBlockSpace(bl+1) + 
			'except :');
	cmd.push(this.getBlockSpace(bl+2) + 
				'pass' );
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.loadFromHDF5HandleItemNonAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _loadFromHDF5HandleItemNonAtomicSingle(self, handle, varName):');

	 /* single atomic type value */
	 cmd.push(this.getBlockSpace(bl+1) + 
	 	'try :');

	 cmd.push(this.getBlockSpace(bl+2) + 
			 'getattr(self,"_"+varName)._loadFromHDF5Handle(handle[varName])');
	 cmd.push(this.getBlockSpace(bl+1) + 
		'except :');
	 cmd.push(this.getBlockSpace(bl+2) + 
			 'pass' );

	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
		
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.loadFromHDF5HandleItemNonAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _loadFromHDF5HandleItemNonAtomicArray(self, handle, varName):');

	/* array of non-atomic type */

	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i]; 
		if ( (!(this.isAtomicType(prop.type))) && (this.isArray(prop)) ) {
			cmd.push(this.getBlockSpace(bl+1) + 
			'if (varName == ' + this.stringify(prop.name) + '):' );
				
				cmd.push(this.getBlockSpace(bl+2) + 
				'try :');
				cmd.push(this.getBlockSpace(bl+3) + 
					'num = len(handle[' + this.stringify(prop.name) + '].attrs["order"])');
				cmd.push(this.getBlockSpace(bl+3) + 
					'self.' + this.makePrivate(prop.name) + ' = [' + this.getClassPathFromType(prop.type) + '() for a in range(num)]');
				cmd.push(this.getBlockSpace(bl+3) + 
					'index = 0');
				
				var loopBlock = this.getLoopBlockForArray(bl+3,prop);
				cmd.push(loopBlock.cmd);
				cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
					'refObject = handle[' + this.stringify(prop.name) + '].attrs["order"][index]' );
				
				cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
					'self.' + this.makePrivate(prop.name) + loopBlock.indList + '._loadFromHDF5Handle(handle[' + this.stringify(prop.name) + '][refObject])');
				cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
					'index = index + 1' );

				cmd.push(this.getBlockSpace(bl+2) + 
				'except :');
				cmd.push(this.getBlockSpace(bl+3) + 
					'pass' );
		}
	}
	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.saveVertionsToHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _saveVertionsToHDF5Handle(self, handle):');

	/* putting accessed package names into the main root attributes */
	var packages = this.getPackages();
	for(var i = 0, len = packages.length; i< len; i++) {
		var key = packages[i];
		cmd.push(this.getBlockSpace(bl+1) + 
		'handle.attrs[' + this.stringify(key) + '] = ' + this.stringify(this.getVersion(key)) );
	}
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.saveToHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _saveToHDF5Handle(self, handle):');

	
	cmd.push(this.getBlockSpace(bl+1) + 
		'#first pass to save all contained items' );	
	cmd.push(this.getBlockSpace(bl+1) + 
		'self._saveDataToHDF5Handle(handle)' );
	

	/*
	cmd.push(this.getBlockSpace(bl+1) + 
		'#second pass to link referenced  items' );	
	cmd.push(this.getBlockSpace(bl+1) + 
		'self._saveDataToHDF5Handle(handle)' );
	*/
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	cmd.push(this.getBlockSpace(bl+1));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.saveDataToHDF5Handle = function(bl) {
	
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	/* ================================================== */
	cmd.push(this.getBlockSpace(bl) + 
	'def _saveDataToHDF5Handle(self, handle):');
	
	if (this.isDerived()) {
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.getBlockSpace(bl+1) +
					supType.name + '._saveDataToHDF5Handle(self,handle)');
				
		}

		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'self.REF = handle.ref');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'handle.attrs["type"] = ' + this.stringify(this.typePath(this.getModel())) );

	cmd.push(this.getBlockSpace(bl+1) + 
		'handle.attrs["ID"] = self.ID' );

	/* writing properties */
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  

		
		/* writing the value */
		if (this.isAtomicType(prop.type)) {
			if(this.isArray(prop)){
				/* array of atomic type */
				cmd.push(this.getBlockSpace(bl+1) + 
						'self._saveToHDF5HandleItem(handle, ' + JSON.stringify(prop.name) + ', "AtomicArray")' );
			 }
			 else{
				 /* single atomic type value */
				cmd.push(this.getBlockSpace(bl+1) + 
						'self._saveToHDF5HandleItem(handle, ' + JSON.stringify(prop.name) + ', "AtomicSingle")' );
			 }
		}
		else {
			/*
			 * creating references and saving other complex types 'value' will
			 * be a or an array of references
			 */
			
			/* create a subgroup for the contained values */

			if(this.isArray(prop)){
				/* array non-atomic type reference */
				 cmd.push(this.getBlockSpace(bl+1) + 
					'self._saveToHDF5HandleItem(handle, ' + JSON.stringify(prop.name) + ', "NonAtomicArray")' );
				 
			 }
			 else{
				 /* single non-atomic type reference */
				 cmd.push(this.getBlockSpace(bl+1) + 
					'self._saveToHDF5HandleItem(handle, ' + JSON.stringify(prop.name) + ', "NonAtomicSingle")' );
			 }

		}
		 
		cmd.push(this.getBlockSpace(bl+1));

	}
	cmd.push(this.getBlockSpace(bl+1) + 
	'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.saveToHDF5HandleItem = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _saveToHDF5HandleItem(self, handle, varName, myType):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'saveFlag = True');

	cmd.push(this.getBlockSpace(bl+1) + 
		'if (saveFlag):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (myType == "AtomicSingle"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._saveToHDF5HandleItemAtomicSingle(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (myType == "AtomicArray"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._saveToHDF5HandleItemAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (myType == "NonAtomicArray"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._saveToHDF5HandleItemNonAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (myType == "NonAtomicSingle"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._saveToHDF5HandleItemNonAtomicSingle(handle, varName)' );
	
	cmd.push(this.getBlockSpace(bl+2) + 
			'self._sync[varName] = -1' );
		
		 
	cmd.push(this.getBlockSpace(bl+1));

	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.saveToHDF5HandleItemAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _saveToHDF5HandleItemAtomicSingle(self, handle, varName):');

	 /* single atomic type value */
	cmd.push(this.getBlockSpace(bl+1) + 
	 	'if (self.isSet(varName) and self.isContained(varName)):');
	cmd.push(this.getBlockSpace(bl+2) + 
 			'if (self.isContained(varName) and not(self._saved.has_key(varName))):');
	cmd.push(this.getBlockSpace(bl+3) + 
			 	'handle[varName] = getattr(self,varName)');
	cmd.push(this.getBlockSpace(bl+3) + 
	 		 	'self._saved[varName] = handle[varName].ref');

	cmd.push(this.getBlockSpace(bl+1) + 
	'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.saveToHDF5HandleItemAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _saveToHDF5HandleItemAtomicArray(self, handle, varName):');

	/* array of atomic type */
	cmd.push(this.getBlockSpace(bl+1) + 
 		'if (self.isSet(varName)):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (self.isContained(varName) and not(self._saved.has_key(varName))):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'handle[varName] = np.asarray(getattr(self,varName))' );
	cmd.push(this.getBlockSpace(bl+3) + 
	 			'self._saved[varName] = handle[varName].ref');	
	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.saveToHDF5HandleItemNonAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _saveToHDF5HandleItemNonAtomicSingle(self, handle, varName):');

	/* reference */
	cmd.push(this.getBlockSpace(bl+1) + 
		'ref_dtype = h5py.special_dtype(ref=h5py.Reference)' );

	 /* single non-atomic type value */
	cmd.push(this.getBlockSpace(bl+1) + 
	 	'if (self.isSet(varName)):');
	cmd.push(this.getBlockSpace(bl+2) + 
 			'if (self.isContained(varName)):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'dgrp = None' );
	cmd.push(this.getBlockSpace(bl+3) + 
				'if not(varName in handle.keys()):' );
	cmd.push(this.getBlockSpace(bl+4) + 
					'dgrp = handle.create_group(varName)' );
	cmd.push(this.getBlockSpace(bl+3) + 
				'else:' );
	cmd.push(this.getBlockSpace(bl+4) + 
					'dgrp = handle[varName]' );
	cmd.push(this.getBlockSpace(bl+3) + 
				'getattr(self, varName)._saveDataToHDF5Handle(dgrp)');
	cmd.push(this.getBlockSpace(bl+2) + 
			'elif not(getattr(self, varName).REF == None ):');
	cmd.push(this.getBlockSpace(bl+3) +
				'handle.create_dataset(varName,data=getattr(self, varName).REF, dtype=ref_dtype )' );
	/*
	 * cmd.push(this.getBlockSpace(bl+2) + 'dset =
	 * maindgrp.create_dataset("values"' + ',(len(getattr(self,varName)),),
	 * dtype=ref_dtype )' ); cmd.push(this.getBlockSpace(loopBlock.bl+1) +
	 * 'dset' + loopBlock.indArray + ' = dgrp.ref');
	 */
	cmd.push(this.getBlockSpace(bl+3) +
				'raise Exception("referenced single value is not implemented.")' );

	/* put the reference in place */ 
	/*
	 * cmd.push(this.getBlockSpace(bl+1) + 'handle[' + JSON.stringify(prop.name) + '] =
	 * dgrp.ref');
	 */

	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.saveToHDF5HandleItemNonAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _saveToHDF5HandleItemNonAtomicArray(self, handle, varName):');

	/* array of non-atomic type */
	cmd.push(this.getBlockSpace(bl+1) + 
		'ref_dtype = h5py.special_dtype(ref=h5py.Reference)' );
					

	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i]; 
		
		if ( (!(this.isAtomicType(prop.type))) && (this.isArray(prop)) ) {
		cmd.push(this.getBlockSpace(bl+1) + 
		'if ((varName == ' + this.stringify(prop.name) + ') and self.isSet(varName)):' );
		cmd.push(this.getBlockSpace(bl+2) + 
			'itemNames = []' );
		cmd.push(this.getBlockSpace(bl+2) + 
			'maindgrp = None' );
		cmd.push(this.getBlockSpace(bl+2) + 
			'if not(varName in handle.keys()):' );
		cmd.push(this.getBlockSpace(bl+3) + 
				'maindgrp = handle.create_group(varName)' );
		cmd.push(this.getBlockSpace(bl+2) + 
			'else:' );
		cmd.push(this.getBlockSpace(bl+3) + 
				'maindgrp = handle[varName]' );

		cmd.push(this.getBlockSpace(bl+2) + 
			'if (self.isContained(varName)):');

		var loopBlock = this.getLoopBlockForArray(bl+3,prop);
		cmd.push(loopBlock.cmd);
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				'item = self.' + prop.name + loopBlock.indList );
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				'itemNames.append(item.name)' );
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				'dgrp = None' );
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				'if not(item.name in maindgrp.keys()):' );
		cmd.push(this.getBlockSpace(loopBlock.bl+2) + 
					'dgrp = maindgrp.create_group(item.name)' );
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				'else:' );
		cmd.push(this.getBlockSpace(loopBlock.bl+2) + 
					'dgrp = maindgrp[item.name]' );
			
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				 'self.' + prop.name + loopBlock.indList + '._saveDataToHDF5Handle(dgrp)');

		cmd.push(this.getBlockSpace(bl+3) + 
			'maindgrp.attrs["order"] =  itemNames');

		cmd.push(this.getBlockSpace(bl+2) + 
			'else:');
		var loopBlock = this.getLoopBlockForArray(bl+3,prop);
		cmd.push(loopBlock.cmd);
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				'item = self.' + prop.name + loopBlock.indList );
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				'itemNames.append(item.name)' );
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				'if not(item.REF == None ):' );
		cmd.push(this.getBlockSpace(loopBlock.bl+2) +
					'handle.create_dataset(item.name,data=item.REF, dtype=ref_dtype )' );
		
		cmd.push(this.getBlockSpace(bl+3) + 
				'maindgrp.attrs["order"] =  itemNames');

		}
	}
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	
    return cmd.join('\n');
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
		cmd.push(this.getBlockSpace(bl+ (dimList.length-1)-di ) + 
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
PythonBase.prototype.propGet = function(prop, bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.getBlockSpace(bl) + 
	'@ property');	
	cmd.push(this.getBlockSpace(bl) + 
	'def ' + prop.name + '(self):');	
	
/*
 * cmd.push(this.getBlockSpace(bl+1) + 'if not(' + prop.name + ' in
 * self._sync.keys()):');
 * 
 * cmd.push(this.getBlockSpace(bl+2) + 'self._sync[' + JSON.stringify(prop.name) + '] =
 * -1'); cmd.push(this.getBlockSpace(bl+2) + 'self.' +
 * this.makePrivate(prop.name) + ' = self.fetch(' + JSON.stringify(prop.name) +
 * ')'); cmd.push(this.getBlockSpace(bl+2) + 'self.' +
 * this.getPropertyAttrsHolderName(prop) + ' = self.fetchAttrs(' +
 * JSON.stringify(prop.name) + ')');
 */
	
	cmd.push(this.getBlockSpace(bl+1) + 
			'return self.' + this.makePrivate(prop.name) );

			
	return cmd.join('\n');
};


/*----------------------------------------------------------------------------*/
PythonBase.prototype.cloneFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def clone(self):');	
	cmd.push(this.getBlockSpace(bl+1) + 
			'newObj = ' + this.getClassName() + '()' );	     
	cmd.push(this.getBlockSpace(bl+1) + 
			'return self._cloneTo(newObj)' );	     

	cmd.push(this.getBlockSpace(bl+1));
	/* =============================================== */
	cmd.push(this.getBlockSpace(bl) + 
	'def _cloneTo(self,newObj):');	    

	if (this.isDerived()) {
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.getBlockSpace(bl+1) +
					supType.name + '._cloneTo(self,newObj)');			
		}
		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	
	var props = this.getProperties();
	
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		cmd.push(this.getBlockSpace(bl+1) + 
				'if (self.isSet(' + this.stringify(prop.name) +')):' );	     

		if (this.isAtomicType(prop.type)) {
			if (this.isArray(prop)) {
				cmd.push(this.getBlockSpace(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = np.copy(self.' + this.makePrivate(prop.name) + ')' );	     
			}
			else {
				cmd.push(this.getBlockSpace(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = self.' + this.makePrivate(prop.name) );	     				
			}
		}
		else {
			if (this.isArray(prop)) {
				cmd.push(this.getBlockSpace(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = []' );	     	
				var loopBlock = this.getLoopBlockForArray(bl+2,prop);
				cmd.push(loopBlock.cmd);
					cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
							'newObj.' + this.makePrivate(prop.name) + '.append(' +
							' self.' + this.makePrivate(prop.name) + loopBlock.indList + '.clone() )' );    
			}
			else {
				cmd.push(this.getBlockSpace(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = self.' + this.makePrivate(prop.name) + '.clone()');	     				
			}
			
		}
	}
	
	cmd.push(this.getBlockSpace(bl+1) + 
	'return newObj' );	     
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.lookForEntityFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	var props = this.getNonAtomicArrayProperties();
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _lookForEntity(self,name):');	
	cmd.push(this.getBlockSpace(bl+1) + 
			'objs = []');	     
		
	var props = this.getNonAtomicArrayProperties();
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		cmd.push(this.getBlockSpace(bl+1) + 
			'objs = objs + [x for x in self.' + prop.name + ' if (x.name == name)] ');	     
	}

	var props = this.getNonAtomicSingleProperties();
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		cmd.push(this.getBlockSpace(bl+1) + 
			'if (self.' + prop.name + '.name == name ):');	     
		cmd.push(this.getBlockSpace(bl+2) + 
				'objs.append(self.' + prop.name + ')');	     
	}
	
	cmd.push(this.getBlockSpace(bl+1) + 
			'if (len(objs) > 1):');	     
	cmd.push(this.getBlockSpace(bl+2) + 
				'raise Exception("more than one Entity found with the name: %s"%name)');	  
	cmd.push(this.getBlockSpace(bl+1) + 
			'return objs' );	     
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.hasEntityFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
		
	cmd.push(this.getBlockSpace(bl) + 
	'def hasEntity(self,name):');	
	cmd.push(this.getBlockSpace(bl+1) + 
			'objs = self._lookForEntity(name)');	     
		
	cmd.push(this.getBlockSpace(bl+1) + 
			'if (len(objs) == 1):');	     
	cmd.push(this.getBlockSpace(bl+2) + 
				'return True');	  
	cmd.push(this.getBlockSpace(bl+1) + 
			'else:');	     
	cmd.push(this.getBlockSpace(bl+2) + 
				'return False');		     
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getEntityFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
		
	cmd.push(this.getBlockSpace(bl) + 
	'def getEntity(self,name):');	
	cmd.push(this.getBlockSpace(bl+1) + 
			'objs = self._lookForEntity(name)');	     
		
	cmd.push(this.getBlockSpace(bl+1) + 
			'if (len(objs) == 1):');	     
	cmd.push(this.getBlockSpace(bl+2) + 
				'return objs[0]');	  
	cmd.push(this.getBlockSpace(bl+1) + 
			'else:');	     
	cmd.push(this.getBlockSpace(bl+2) + 
				'raise Exception("did not find Entity: %s"%name)');		     
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.factoryFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
		
	cmd.push(this.getBlockSpace(bl) + 
	'def create(self,name):');	
	cmd.push(this.getBlockSpace(bl+1) + 
		'return ' + this.getModel().type + '(name)');

	var props = this.getProperties();
    for (var i = 0; i<props.length; i++) {
    	if (!(this.isAtomic(props[i]))) {
    		var prop = props[i];
			var propType = this.getClassPathFromType(prop.type) ;
			
				cmd.push(this.getBlockSpace(bl) + 
				'def makea' + this.firstToUpper(prop.name) +'(self,name):');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'return ' + propType + '(name)');
			
			
			if (this.isArray(prop)){
				cmd.push(this.getBlockSpace(bl) + 
				'def append' + this.firstToUpper(prop.name) +'(self,name=None):');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'obj = ' + propType + '(name)');
				cmd.push(this.getBlockSpace(bl+1) + 
					'if not(obj.name in [a.name for a in self.' + prop.name + ']):');
				cmd.push(this.getBlockSpace(bl+2) + 
						'self.' + prop.name + '.append(obj)');
				if (this.hasAssignments(prop))
					cmd.push(
						this.assignPropertyValue(bl+2,	this.getAssignments(prop), 'obj')
						);
				if (this.hasDependencies(prop))
					cmd.push(
						this.setChildPropRefs(bl+2, prop, 'obj')
						);
				if (this.hasDependents(prop))
					throw "array can not have dependents.";
					
				cmd.push(this.getBlockSpace(bl+2) + 
						'return obj');
				cmd.push(this.getBlockSpace(bl+1) + 
					'else:');
				cmd.push(this.getBlockSpace(bl+2) + 
						'print ("warning: object %s already exist."%(obj.name))');
				cmd.push(this.getBlockSpace(bl+2) + 
						'return None');
						
			}
			else {
				cmd.push(this.getBlockSpace(bl) + 
				'def create' + this.firstToUpper(prop.name) +'(self):');
				cmd.push(this.getBlockSpace(bl+1) + 
					'if (self.' + prop.name + ' != None): ');
				cmd.push(this.getBlockSpace(bl+2) + 
						'raise Exception("object ' + prop.name + 
						' already exist, use renew' + this.firstToUpper(prop.name) +
						' to get a new one.") ');
				cmd.push(this.getBlockSpace(bl+1) + 
					'return self.renew' + this.firstToUpper(prop.name) + '()');
				
				cmd.push(this.getBlockSpace(bl) + 
				'def renew' + this.firstToUpper(prop.name) +'(self):');
				cmd.push(this.getBlockSpace(bl+1) + 
					'self.' + prop.name + ' = ' + propType 
						+ '(' + this.stringify(prop.name)+ ')');
				if (this.hasAssignments(prop))
					cmd.push(
					this.assignPropSinglesValues(bl+1,	prop)
					);
				if (this.hasDependencies(prop))
					cmd.push(
					this.setParentPropsRefs(bl+1,prop)
					);
				if (this.hasDependents(prop)){
					cmd.push(
					this.setChildPropsRefs(bl+1, prop)
					);
				}
				cmd.push(this.getBlockSpace(bl+1) + 
					'return self.' + prop.name);
			}
			cmd.push(this.getBlockSpace(bl));
    	}
		
	}
	
	
	return cmd.join('\n');
};

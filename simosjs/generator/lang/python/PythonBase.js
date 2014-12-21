//var njs = require('../../njs')();
var CommonLangBase = require('../CommonLangBase.js').CommonLangBase;
var fs = require('fs');

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
	cmd.push('import json');
	cmd.push('import bson');
	cmd.push('import collections');
	cmd.push('import uuid');
	cmd.push('import pyfoma.dataStorage as pyds');
	
	cmd.push('try:');
	cmd.push(this.gbl() + 'import h5py');
	cmd.push('except:');
	cmd.push(this.gbl() + 'print "WARNING: h5py is not installed."');

	cmd.push('try:');
	cmd.push(this.gbl() + 'import pymongo');
	cmd.push('except:');
	cmd.push(this.gbl() + 'print "WARNING: pymongo is not installed."');

	
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
					'objs = [x for x in self.' + prop.name + ' if (x.name == name)]' );
				cmd.push(this.getBlockSpace(bl+1) + 
					'if len(objs) > 1:' );			
				cmd.push(this.getBlockSpace(bl+2) + 
						'raise Exception(" more than one " + name + " is found in ' + prop.name + '")' );
				cmd.push(this.getBlockSpace(bl+1) + 
					'elif len(objs) == 1:' );			
				cmd.push(this.getBlockSpace(bl+2) + 
						'print ("warning: object %s already exist."%(name))' );	
				cmd.push(this.getBlockSpace(bl+2) + 
						'return objs[0]' );	
				cmd.push(this.getBlockSpace(bl+1) + 
					'obj = ' + propType + '(name)');
				cmd.push(this.getBlockSpace(bl+1) + 
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
					
				cmd.push(this.getBlockSpace(bl+1) + 
						'return obj');
				
				cmd.push(this.getBlockSpace(bl) + 
					'def delete' + this.firstToUpper(prop.name) +'(self):');
				cmd.push(this.getBlockSpace(bl+1) + 
						'self.' + this.makePrivate(prop.name) + ' = [] ');
						
			}
			else {
				cmd.push(this.getBlockSpace(bl) + 
				'def create' + this.firstToUpper(prop.name) +'(self, name=None):');
				cmd.push(this.getBlockSpace(bl+1) + 
					'if (self.' + prop.name + ' != None): ');
				cmd.push(this.getBlockSpace(bl+2) + 
						'raise Exception("object ' + prop.name + 
						' already exist, use renew' + this.firstToUpper(prop.name) +
						' to get a new one.") ');
				cmd.push(this.getBlockSpace(bl+1) + 
					'return self.renew' + this.firstToUpper(prop.name) + '(name)');
				
				cmd.push(this.getBlockSpace(bl) + 
					'def delete' + this.firstToUpper(prop.name) +'(self):');
					cmd.push(this.getBlockSpace(bl+1) + 
						'self.' + this.makePrivate(prop.name) + ' = None ');
				
				cmd.push(this.getBlockSpace(bl) + 
				'def renew' + this.firstToUpper(prop.name) +'(self, name=None):');
				cmd.push(this.getBlockSpace(bl+1) + 
					'self.' + prop.name + ' = ' + propType 
							+ '('+ this.stringify(prop.name) +')');
				if (this.hasAssignments(prop))
					cmd.push(
					this.assignPropSinglesValues(bl+1,	prop)
					);
				cmd.push(this.getBlockSpace(bl+1) + 
					'if name != None:');
				cmd.push(this.getBlockSpace(bl+2) + 
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
				cmd.push(this.getBlockSpace(bl+1) + 
					'return self.' + prop.name);
			}
			cmd.push(this.getBlockSpace(bl));
    	}
		
	}
	
	
	return cmd.join('\n');
};

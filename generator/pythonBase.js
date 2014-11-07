expand = require(':/res/macro.js').expand;
CommonLangBase = require('generator.commonLangBase').CommonLangBase;

/*----------------------------------------------------------------------------*/
function PythonBase(model){
	this.constructor(model);
};
exports.PythonBase = PythonBase;
/*----------------------------------------------------------------------------*/
PythonBase.prototype = Object.create(CommonLangBase.prototype);
exports.PythonBase.prototype = PythonBase.prototype;
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
	cmd.push('import h5py');
	cmd.push('import json');
	cmd.push('import pyfoma.dataStorage as pyds');
	
	cmd.push(this.getSuperTypesImport());
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getSuperTypesImport = function() {
	
	var cmd = [];

	var superTypes = this.entitySuperTypes();
	
	cmd.push('#importing extended types');
	for (var i = 0; i<superTypes.length; i++){
		var supType = superTypes[i];
		//this.show(supType);
		var moduleName = this.addVersion(supType.type.name, supType.type.version);
		//print(supType['package'].version);
		if ((supType['package'] != '') && (supType['package'] != undefined)){
			moduleName =  supType['package'].path + '.' + moduleName;
		}
		cmd.push('from ' + moduleName + ' import ' + supType.type.name);
		//cmd.push('from ' + moduleName + ' import *');
	}
	return cmd.join('\n');
	
    
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
			var className = this.getClassNameFromType(prop.type);
			//var moduleName = this.addVersion(prop.type, prop.version);
			var moduleName = prop.type;
			if (importedTypes.indexOf(className) == -1) {
				this.show(prop);
				if ((prop['package'] != '') && (prop['package'] != undefined)){
					moduleName =  this.packagePath(prop['package']['name'],prop['package']['version'])  + '.' + moduleName;
				}
				if (this.getClassName() != className){
					cmd.push('from ' + moduleName + ' import ' + className);
					//cmd.push('from ' + moduleName + ' import *');
					importedTypes.push(className);
				}
			}
		}
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getSuperTypesList = function() {
	
    var list =  this.entitySuperTypes().map(function(o) {
	return expand( "@extra.type.name", o );
    }).join(" ,\n ");
    
    if (list == '') {
    	return 'object';
    }
    else {
    	return list;
    }
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getPropertyList = function() {
	
    return this.getModel().properties.map(function(o) {
	return expand( "@extra.name", o );
    }).join(" ,\n ");
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getPythonArrayDimList = function(prop) {
	
	if (this.isArray(prop)){
		var dimList = this.getDimensionList(prop);
		for (var i = 0; i<dimList.length; i++){
			/*check if the dimension is a number */
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
	if ((this.isArray(prop)) && (! this.isAtomicType(prop.type))){
		/* we have o use a list with the defined dimensions of the object*/
		var className = this.getClassNameFromType(prop.type);
		var dimList = this.getDimensionList(prop);
		var leftBlock = '';
		var rightBlock = '';
		//var objName = JSON.stringify(className);
		var objName = JSON.stringify(prop.name);
		
		for (var i = dimList.length-1; i>=0; i--){
			var indName = 'i' + i;
			
			leftBlock = leftBlock + '[';
			rightBlock = rightBlock + ' for ' + indName + ' in range(0,self.' + dimList[i] + ')]';
			objName = objName + ' + str(' + indName + ')';
		}
		return leftBlock + ' ' + className + '(' + objName  + ')' + rightBlock;
	}
	else {
		throw ('Array with non-atomic type was expected.', prop);
	}
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getInitObject = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var assign = this.getAssignments(prop);
	
	if (this.isArray(prop)) {
		for (a in assign) {
			var loopBlock = this.getLoopBlockForArray(bl+1, prop);
			cmd.push(loopBlock.cmd);
			cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
					'self.' + this.getPropertyPrivateName(prop) + loopBlock.indList + '.' + a +
					' = self.' + JSON.stringify(assign[a]) );
		}		
	}
	else {
		for (a in assign) {
			cmd.push(this.getBlockSpace(bl) + 
					'self.' + this.getPropertyPrivateName(prop) + '.' + a + ' = ' + JSON.stringify(assign[a]));
	
		}
	}

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getPropertyValue = function(prop) {
	/*return properties default value,
	 * if property is an object (complex type), it returns the command to 
	 * instantiate that object. */
	
	if(prop.value == undefined){
		if (this.isArray(prop)) {
			if (this.isAtomic(prop)){
				return 'np.zeros(' + this.getPythonArrayShape(prop) + ')';
			}
			else {
				if (this.isContained(prop)){
					//return this.getInitObjectList(prop);
					return '[]';
				}
				else {
					return '[]';
				}
				
			}
		}
		else if (!(this.isAtomic(prop)) && (this.isContained(prop))){
			return (this.getClassNameFromType(prop.type) + '(' + JSON.stringify(prop.name) +')');
		}
		else {
			return 'None';
		}
	}
	else {
		if (this.isAtomic(prop)){
			if (prop.type == "boolean") {
				return (this.changeType(prop.type) + '(' + this.changeType("integer") + '(' + JSON.stringify(prop.value) + ')' + ')');
			}
			else {
				return (this.changeType(prop.type) + '(' + JSON.stringify(prop.value) + ')');
			}
		}
		else {
			if (!(this.isAtomic(prop)) && (this.isContained(prop))){
				return (this.getClassNameFromType(prop.type) + '(' + JSON.stringify(prop.name) +')');
			}
			else {
				return 'None';
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
	 	'props = self.' + this.modelDesAtt() + '["properties"])');
	
	cmd.push(this.getBlockSpace(bl+1) + 
 		'for (prop in props):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (prop["name"] == varName):');	
	cmd.push(this.getBlockSpace(bl+3) + 
 				'return prop');

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

	/* call super class init function if any*/
	if (this.isDerived()) {
		/*new class method*/
		//cmd.push(this.getBlockSpace(bl+1) +
		//'super(' + this.getClassName() + ', self).__init__()');
		//cmd.push(this.getBlockSpace(bl+1) + '');
		
		var superTypes = this.entitySuperTypes();
		
		cmd.push(this.getBlockSpace(bl) + 
				'#calling super inits');
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.getBlockSpace(bl+1) +
				supType.type.name +'.__init__(self)');
				
		}
		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	
	/*init main attributes */
	/*
	var attrs = this.getPropertyStorableAttrs(this.getModel());
	cmd.push(this.getBlockSpace(bl+1) + 
			'self.attrs = dict()');
	for(var i = 0; i < attrs.length; i++) {
		var attr = attrs[i];  
		cmd.push(this.getBlockSpace(bl+1) + 
				'self.attrs[' + JSON.stringify(attr) + '] = ' + JSON.stringify(this.getModel()[attr]) );
	}
	*/
	
	//cmd.push(this.getBlockSpace(bl+1) + 
	//	'self.' + this.modelDesAtt() + ' = ' + JSON.stringify(this.getModelWithOutPtoperties()) );
	cmd.push(this.getBlockSpace(bl+1) + 
		'self.' + this.modelDesAtt() + ' = ' + JSON.stringify(this.getModel(),  null, '\t') );
	/* this is a dictionary which keep track of synchronizing the data in object 
	 * with the back-end storage, 
	 * it keep a list of properties, 
	 * -- not in keys, or has a value of -1, means it is out of sync with 
	 * data-storage and when the user asks for the data, it must load from 
	 * storage first.
	 * -- not in keys, or value 1, means it is updated by the user 
	 * and on save must be written to storage*/
	

	
	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		if (prop.name == "name") {
			/*initializing name */		
			cmd.push(this.getBlockSpace(bl+1) + 
						'self.' + this.getPropertyPrivateName(prop) + ' = ' + this.getPropertyValue(prop));			
			cmd.push(this.getBlockSpace(bl+1) + 
					'if not(name == None):');			
			cmd.push(this.getBlockSpace(bl+2) + 
						'self.' + this.getPropertyPrivateName(prop) + ' = name ');			
		}
		else {
			/*initializing other properties */
			cmd.push(this.getBlockSpace(bl+1) + 
				'self.' + this.getPropertyPrivateName(prop) + ' = ' + this.getPropertyValue(prop));
			
			if (!(this.isAtomic(prop)) && (this.isContained(prop)) ){
				cmd.push(this.getInitObject(bl+1, prop));
			}
		}
		
		/* storing, storable property attributes */
		/*
		var propAttrs = this.getPropertyStorableAttrs(prop);
		cmd.push(this.getBlockSpace(bl+1) + 
				'self.' + this.getPropertyAttrsHolderName(prop) + ' = dict()');
		for(var j = 0; j < propAttrs.length; j++) {
			cmd.push(this.getBlockSpace(bl+1) + 
				'self.' + this.getPropertyAttrsHolderName(prop) + '[' + JSON.stringify(propAttrs[j]) + '] = ' + JSON.stringify(prop[propAttrs[j]]));
		}
		*/
		
		cmd.push(this.getBlockSpace(bl+1) + 
				'self.' + this.modelDesAtt(prop.name ) + ' = ' + JSON.stringify(prop) );
		cmd.push(this.getBlockSpace(bl+1));

	}
	
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
//exports.PythonBase.prototype.getPropertyPrivateName = PythonBase.prototype.getPropertyPrivateName;

/*----------------------------------------------------------------------------*/
PythonBase.prototype.getPropertyName = function(i) {
	var prop = this.getProperties()[i];
	return prop.name;
};
//exports.PythonBase.prototype.getPropertyName = PythonBase.prototype.getPropertyName;
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
	
	/*assign the value*/
	if (this.isAtomicType(prop.type)) {
		if (this.isArray(prop)) {
			/* no chekcs here,
			 * TODO: add casting or checks for atomic type arrays*/
			cmd.push(this.getBlockSpace(bl+1) + 'self.' + this.makePrivate(prop.name) +' = val');			
		}
		else {
			/*type casting between atomic types */
			if (prop.type == "boolean") {
				cmd.push(this.getBlockSpace(bl+1) + 'self.' + this.makePrivate(prop.name) +' = ' + 
						this.changeType(prop.type) +
						'(' + this.changeType("integer") + '(val)' + ')');
			}
			else {
				cmd.push(this.getBlockSpace(bl+1) + 'self.' + this.makePrivate(prop.name) +' = ' + 
						this.changeType(prop.type) +'(val)');
			}

			

		}
	}
	else {
		/*non-atomic types */
		if (this.isArray(prop)) {
			/* cheks if all elements is array has the correct type 
			 * TODO: add the check*/
		}
		else {
			/* check if it has the correct type */
			cmd.push(this.getBlockSpace(bl+1) + 
					'if not(isinstance(val, ' + prop.type + ')):');
			cmd.push(this.getBlockSpace(bl+2) + 
					'raise Exception("variable type for ' + prop.name + ' must be an instance of ' + prop.type + ' while " + str(type(val)) + " is passed .")');

		}
		/*simple assignment */
		cmd.push(this.getBlockSpace(bl+1) + 'self.' + this.makePrivate(prop.name) +' = val');
	}

	/*change array sizes if prop is a dimension */
	if (this.isDimension(prop)){
		/* find out the array which has prop as a dimension*/
		var arrays = this.getPropertiesWithDimension(prop);
		/* resize the array accordingly */
		for (var i = 0; i<arrays.length; i++){
			cmd.push(this.getBlockSpace(bl+1) + 'self.' + this.arrayUpdateSizeFuncName(arrays[i]) +'()' );
		};	
	}
	
	/*make relations between child and parrent data sets */
	var childProps = this.getChildProps(prop);
	for (var i = 0; i<childProps.length; i++) {
		var childProp = childProps[i];
		
		if (this.isAtomicType(childProp.type)) {
			throw ('Illigal type for dependicy.',childProp);
		}
		else if (this.isArray(childProp)) {
			var loopBlock = this.getLoopBlockForArray(bl+1, childProp);
			cmd.push(loopBlock.cmd);
			cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
					'self.' + childProp.name + loopBlock.indList + '.' + this.getDependentChildFor(childProp,prop) 
					+ ' = self.' + prop.name );

		}
		else {
			cmd.push(this.getBlockSpace(bl+1) + 
					'self.' + childProp.name + '.' + this.getDependentChildFor(childProp,prop) 
					+ ' = self.' + prop.name );
		}
	}
	
	cmd.push(this.getBlockSpace(bl+1) + 
			'if not(' + JSON.stringify(prop.name) + ' in self._sync.keys()):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'self._sync[' + JSON.stringify(prop.name) + '] = 1');
	
	/*return the commands */
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
PythonBase.prototype.getReprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.getBlockSpace(bl) + 'def __repr__(self):');
	
	var props = this.getProperties();
	
	cmd.push(this.getBlockSpace(bl+1) + 
			'return (' );

	cmd.push(this.getBlockSpace(bl+2) + 'str(type(self)) +"\\n"');
	for (var i = 0; i<props.length; i++) {
		var prop = props[i];
		propCmd = '';
		if (this.isAtomicType(prop.type)){
			propCmd = JSON.stringify(prop.name) + ' + " : " + str(self.' +  prop.name + ') + "\\n"';
		}
		else {
			propCmd = JSON.stringify(prop.name) + ' + " : { " + "\\n    ".join(str(self.' +  prop.name + ').split("\\n")) + " }\\n"';
		}
		propCmd = '+ ' + propCmd;
		
		cmd.push(this.getBlockSpace(bl+2) + propCmd);
	} 
	cmd.push(this.getBlockSpace(bl+2) + ')');
	
	return cmd.join('\n');

};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.getCheckMainAttrsFunction = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 'def checkFileCompatibility(self, handle):');
	
	var attrs = this.getPropertyStorableAttrs(this.getModel());
	
	for (var i = 0; i<attrs.length; i++) {
		var attr = attrs[i];
		if ((attr != 'name') && ( attr != 'description' )) {
			cmd.push(this.getBlockSpace(bl+1) + 
				'if not(handle.attrs[' + JSON.stringify(attr) + '] == self.attrs[' +  JSON.stringify(attr) + ']):');
			cmd.push(this.getBlockSpace(bl+2) + 
				'raise Exception(\' ' + attr + ' mismatched. Reading data \' + handle.attrs[' + JSON.stringify(attr) + '] + \' using class \' + self.attrs[' +  JSON.stringify(attr) + '])');
		}
	} 
	
	return cmd.join('\n');

};

/*----------------------------------------------------------------------------*/
PythonBase.prototype.loadFromHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 'def _loadFromHDF5Handle(self, handle):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'self.checkFileCompatibility(handle)' );
	cmd.push(this.getBlockSpace(bl+1));


	/* general data-structure attributes */
	var attrs = this.getPropertyStorableAttrs(this.getModel());
	for(var i = 0; i < attrs.length; i++) {
		var attr = attrs[i];  
		cmd.push(this.getBlockSpace(bl+1) + 
				'self.attrs[' + JSON.stringify(attr) + '] = handle.attrs[' + JSON.stringify(attr) + ']' );
	}

	cmd.push(this.getBlockSpace(bl+1) + 
	'self._loadDataFromHDF5Handle(handle)' );
	cmd.push(this.getBlockSpace(bl+1) + 'pass');
	cmd.push(this.getBlockSpace(bl+1));
	/*==================================================*/
	cmd.push(this.getBlockSpace(bl) + 'def _loadDataFromHDF5Handle(self, handle):');
	
	if (this.isDerived()) {
		cmd.push(this.getBlockSpace(bl+1) +
		'super(' + this.getClassName() + ', self)._loadDataFromHDF5Handle(handle)');
		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	
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
			/*creating references and saving other complex types 
			 * 'value' will be a or an array of references */
			
			/*create a subgroup for the contained values */

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
	
	cmd.push(this.getBlockSpace(bl) + 'def _loadFromHDF5HandleItem(self, handle, varName, type):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
			'loadFlag = True');
		
	//cmd.push(this.getBlockSpace(bl+1) + 
	//		'if (varName in self._sync.keys()):');
	//cmd.push(this.getBlockSpace(bl+2) + 
	//			'if (self._sync[varName] == 1):');
	//cmd.push(this.getBlockSpace(bl+3) + 
	//			'saveFlag = True');	

	cmd.push(this.getBlockSpace(bl+1) + 
		'if (loadFlag):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (type == "AtomicSingle"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._loadFromHDF5HandleItemAtomicSingle(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (type == "AtomicArray"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._loadFromHDF5HandleItemAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (type == "NonAtomicArray"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._loadFromHDF5HandleItemNonAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (type == "NonAtomicSingle"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._loadFromHDF5HandleItemNonAtomicSingle(handle, varName)' );
			
	/*loading non-value attributes */
	//cmd.push(this.getBlockSpace(bl+2) + 
	//		'self.loadFromHDF5HandleItemAttrs(handle, varName)' );
	
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
	
	cmd.push(this.getBlockSpace(bl) + 'def _loadFromHDF5HandleItemAtomicSingle(self, handle, varName):');

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
	
	cmd.push(this.getBlockSpace(bl) + 'def _loadFromHDF5HandleItemAtomicArray(self, handle, varName):');

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
	
	cmd.push(this.getBlockSpace(bl) + 'def _loadFromHDF5HandleItemNonAtomicSingle(self, handle, varName):');

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
	
	cmd.push(this.getBlockSpace(bl) + 'def _loadFromHDF5HandleItemNonAtomicArray(self, handle, varName):');

	/* array of non-atomic type */

	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i]; 
		if ( (!(this.isAtomicType(prop.type))) && (this.isArray(prop)) ) {
			cmd.push(this.getBlockSpace(bl+1) + 
					'if (varName == ' + JSON.stringify(prop.name) + '):' );
						
						cmd.push(this.getBlockSpace(bl+2) + 
						'try :');
						cmd.push(this.getBlockSpace(bl+3) + 
							'num = len(handle[' + JSON.stringify(prop.name) + ']["values"])');
						cmd.push(this.getBlockSpace(bl+3) + 
							'self.' + this.makePrivate(prop.name) + ' = [' + this.getClassNameFromType(prop.type) + '() for a in range(num)]');
						
						var loopBlock = this.getLoopBlockForArray(bl+3,prop);
						cmd.push(loopBlock.cmd);
						cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
								'refObject = handle[' + JSON.stringify(prop.name) + ']["values"]' + loopBlock.indArray );
						
							cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
								 'self.' + this.makePrivate(prop.name) + loopBlock.indList + '._loadFromHDF5Handle(handle[refObject])');
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
PythonBase.prototype.loadFromHDF5HandleItemAttrs = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
		'def _loadFromHDF5HandleItemAttrs(self, handle, varName):');
	
	/*writing non-value attributes */
	cmd.push(this.getBlockSpace(bl+1) + 
			'for item in getattr(self,varName + "Attrs").keys():');
	cmd.push(this.getBlockSpace(bl+2) + 
				'try :');
	cmd.push(this.getBlockSpace(bl+3) + 
					'getattr(self,varName + "Attrs")[item] = handle[varName].attrs[item] '); 
	cmd.push(this.getBlockSpace(bl+2) + 
				'except :');
	cmd.push(this.getBlockSpace(bl+3) + 
		 			'pass ' );


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
	
	/* general data-structure attributes */
	var attrs = this.getPropertyStorableAttrs(this.getModel());
	for(var i = 0; i < attrs.length; i++) {
		var attr = attrs[i];  
		cmd.push(this.getBlockSpace(bl+1) + 
		'handle.attrs[' + JSON.stringify(attr) + '] = self.' + this.modelDesAtt() + '[' + JSON.stringify(attr) + ']' );
	}
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'handle.attrs["' + this.modelDesAtt() + '"] = str(self.' + this.modelDesAtt() + ')' );
			
	cmd.push(this.getBlockSpace(bl+1) + 
		'self._saveDataToHDF5Handle(handle)' );
	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	cmd.push(this.getBlockSpace(bl+1));
	
	/*==================================================*/
	cmd.push(this.getBlockSpace(bl) + 
	'def _saveDataToHDF5Handle(self, handle):');
	
	if (this.isDerived()) {
		cmd.push(this.getBlockSpace(bl+1) +
		'super(' + this.getClassName() + ', self)._saveDataToHDF5Handle(handle)');
		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	
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
			/*creating references and saving other complex types 
			 * 'value' will be a or an array of references */
			
			/*create a subgroup for the contained values */

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
	
	cmd.push(this.getBlockSpace(bl) + 'def _saveToHDF5HandleItem(self, handle, varName, type):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
			'saveFlag = True');
		
	//cmd.push(this.getBlockSpace(bl+1) + 
	//		'if (varName in self._sync.keys()):');
	//cmd.push(this.getBlockSpace(bl+2) + 
	//			'if (self._sync[varName] == 1):');
	//cmd.push(this.getBlockSpace(bl+3) + 
	//			'saveFlag = True');	

	cmd.push(this.getBlockSpace(bl+1) + 
		'if (saveFlag):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (type == "AtomicSingle"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._saveToHDF5HandleItemAtomicSingle(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (type == "AtomicArray"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._saveToHDF5HandleItemAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (type == "NonAtomicArray"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._saveToHDF5HandleItemNonAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (type == "NonAtomicSingle"):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'self._saveToHDF5HandleItemNonAtomicSingle(handle, varName)' );
			
	/*writing non-value attributes */
	//cmd.push(this.getBlockSpace(bl+2) + 
	//		'self._saveToHDF5HandleItemAttrs(handle, varName)' );
	
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
	 	'if (self.isSet(varName)):');
	cmd.push(this.getBlockSpace(bl+2) + 
			 'handle[varName] = getattr(self,varName)');

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
	
	cmd.push(this.getBlockSpace(bl) + 'def _saveToHDF5HandleItemAtomicArray(self, handle, varName):');

	/* array of atomic type */
	cmd.push(this.getBlockSpace(bl+1) + 
 		'if (self.isSet(varName)):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'handle[varName] = np.asarray(getattr(self,varName))' );
	
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

	 /* single non-atomic type value */
	cmd.push(this.getBlockSpace(bl+1) + 
	 	'if (self.isSet(varName)):');
	
	cmd.push(this.getBlockSpace(bl+2) + 
 			'if (self.isContained(varName)):');
	cmd.push(this.getBlockSpace(bl+3) + 
				'dgrp = handle.create_group(varName)' );
	cmd.push(this.getBlockSpace(bl+3) + 
				'getattr(self, varName)._saveToHDF5Handle(dgrp)');
	cmd.push(this.getBlockSpace(bl+2) + 
			'else:');
	/*
	cmd.push(this.getBlockSpace(bl+2) +
			'dset = maindgrp.create_dataset("values"' + ',(len(getattr(self,varName)),), dtype=ref_dtype )' );
	cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
			 'dset' + loopBlock.indArray + ' = dgrp.ref');
			 */
	cmd.push(this.getBlockSpace(bl+3) +
				'raise Exception("referenced single value is not implemented.")' );

	/* put the reference in place*/ 
	/*cmd.push(this.getBlockSpace(bl+1) + 
			 'handle[' + JSON.stringify(prop.name) + '] = dgrp.ref');
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
		'if ((varName == ' + JSON.stringify(prop.name) + ') and self.isSet(varName)):' );
		cmd.push(this.getBlockSpace(bl+2) + 
			'maindgrp = handle.create_group(' + JSON.stringify(prop.name) + ')');
		cmd.push(this.getBlockSpace(bl+2) +
			'dset = maindgrp.create_dataset("values"' + ',(len(getattr(self,varName)),), dtype=ref_dtype )' );

		var loopBlock = this.getLoopBlockForArray(bl+2,prop);
		cmd.push(loopBlock.cmd);
			cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				'dgrp = maindgrp.create_group(' + 'self.' + prop.name + loopBlock.indList + '.name)' );
			
			cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				 'self.' + prop.name + loopBlock.indList + '._saveToHDF5Handle(dgrp)');
		
			/* put the reference in place*/ 
			cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				 'dset' + loopBlock.indArray + ' = dgrp.ref');
			
		cmd.push(this.getBlockSpace(bl+2) + 
			'self._saveToHDF5HandleItemAttrs(handle, varName)' );

		}
	}
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
PythonBase.prototype.saveToHDF5HandleItemAttrs = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def _saveToHDF5HandleItemAttrs(self, handle, varName):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'if (varName in handle.keys()):');
	
	/*writing non-value attributes */
	//cmd.push(this.getBlockSpace(bl+2) + 
	//		'for item in getattr(self,varName + "Attrs").keys():');
	//cmd.push(this.getBlockSpace(bl+3) + 
	//			'handle[varName].attrs[item] = getattr(self,varName + "Attrs")[item]');

	cmd.push(this.getBlockSpace(bl+2) + 
			'itemM = getattr(self,' + JSON.stringify(this.modelDesAtt()) + '+varName)');
	cmd.push(this.getBlockSpace(bl+2) + 
			'for item in ' + JSON.stringify(this.getStorableAttrs()) + ':');
	cmd.push(this.getBlockSpace(bl+3) +
				'if item in itemM.keys():');
	cmd.push(this.getBlockSpace(bl+4) + 
					'handle[varName].attrs[item] = itemM[item]');

	cmd.push(this.getBlockSpace(bl+2) + 
			'handle[varName].attrs[' + JSON.stringify(this.modelDesAtt()) + 
					'] = str(getattr(self,' + JSON.stringify(this.modelDesAtt()) + '+varName))');

	cmd.push(this.getBlockSpace(bl+2) + 
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
	cmd.push(this.getBlockSpace(bl+1) + 
			'if not(' + prop.name + ' in self._sync.keys()):');
	
	cmd.push(this.getBlockSpace(bl+2) + 
				'self._sync[' + JSON.stringify(prop.name) + '] = -1');
	cmd.push(this.getBlockSpace(bl+2) + 
				'self.' + this.makePrivate(prop.name) + ' = self.fetch(' + JSON.stringify(prop.name) + ')');
	cmd.push(this.getBlockSpace(bl+2) + 
			'self.' + this.getPropertyAttrsHolderName(prop) + ' = self.fetchAttrs(' + JSON.stringify(prop.name) + ')');
	*/
	
	cmd.push(this.getBlockSpace(bl+1) + 
			'return self.' + this.makePrivate(prop.name) );

			
	return cmd.join('\n');
};


/*----------------------------------------------------------------------------*/
PythonBase.prototype.clone = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def clone(self):');	
	cmd.push(this.getBlockSpace(bl+1) + 
			'newObj = ' + this.getClassName() + '()' );	     
	cmd.push(this.getBlockSpace(bl+1) + 
			'self._cloneTo(newObj)' );	     

	cmd.push(this.getBlockSpace(bl+1));
	/*===============================================*/
	cmd.push(this.getBlockSpace(bl) + 
	'def _cloneTo(self,newObj):');	    

	if (this.isDerived()) {
		cmd.push(this.getBlockSpace(bl+1) +
		'super(' + this.getClassName() + ', self)._cloneTo(newObj)');
		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	
	var props = this.getProperties();
	
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		
		if (this.isAtomicType(prop.type)) {
			if (this.isArray(prop)) {
				cmd.push(this.getBlockSpace(bl+1) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = np.copy(self.' + this.makePrivate(prop.name) + ')' );	     
			}
			else {
				cmd.push(this.getBlockSpace(bl+1) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = self.' + this.makePrivate(prop.name) );	     				
			}
		}
		else {
			if (this.isArray(prop)) {
				cmd.push(this.getBlockSpace(bl+1) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = []' );	     	
				var loopBlock = this.getLoopBlockForArray(bl+1,prop);
				cmd.push(loopBlock.cmd);
					cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
							'newObj.' + this.makePrivate(prop.name) + '.append(' +
							' self.' + this.makePrivate(prop.name) + loopBlock.indList + '.clone() )' );    
			}
			else {
				cmd.push(this.getBlockSpace(bl+1) + 
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
PythonBase.prototype.factory = function(bl) {
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
    	if (!(this.isAtomicType(props[i].type))) {
    		var prop = props[i];
			
			
				cmd.push(this.getBlockSpace(bl) + 
				'def create' + this.firstToUpper(prop.name) +'(self,name):');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'return ' + prop.type + '(name)');
			
			
			if (this.isArray(prop)){
				cmd.push(this.getBlockSpace(bl) + 
				'def createAppend' + this.firstToUpper(prop.name) +'(self,name=None):');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'obj = ' + prop.type + '(name)');
				cmd.push(this.getBlockSpace(bl+1) + 
					'if not(obj.name in [a.name for a in self.' + prop.name + ']):');
				cmd.push(this.getBlockSpace(bl+2) + 
						'self.' + prop.name + '.append(obj)');
				cmd.push(this.getBlockSpace(bl+1) + 
					'else:');
				cmd.push(this.getBlockSpace(bl+2) + 
						'print ("warning: object %s already exist."%(obj.name))');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'return obj');
						
			}
			else {
				cmd.push(this.getBlockSpace(bl) + 
				'def createSet' + this.firstToUpper(prop.name) +'(self):');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'self.' + prop.name + ' = ' + prop.type 
						+ '(' + JSON.stringify(prop.name)+ ')');
				cmd.push(this.getBlockSpace(bl+1) + 
					'return self.' + prop.name);
			}
			cmd.push(this.getBlockSpace(bl));
    	}
		
	}
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/


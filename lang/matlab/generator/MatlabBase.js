var path = require('path');
var fs = require('fs');

var simosPath = require('./config.js').simosPath;
var CommonLangBase = require(path.join(simosPath, 'generator/lang/CommonLangBase.js')).CommonLangBase;

var Packaging = require('./packaging/Packaging.js').Packaging;

/*----------------------------------------------------------------------------*/
function MatlabBase(model){
	this.constructor(model);
};
exports.MatlabBase = MatlabBase;
/*----------------------------------------------------------------------------*/
MatlabBase.prototype = Object.create(CommonLangBase.prototype);
/*----------------------------------------------------------------------------*/
packageParts = ['./storage/SaveLoad',
                './storage/HDF5Load',
                './storage/HDF5Save',
                './storage/MatStrSave',
                //'./storage/JSONLoad',
                //'./storage/JSONSave',
                //'./storage/MongoSave',
                //'./storage/MongoLoad',
                
                './properties/Query',
                './properties/Init',
                './properties/Assign',
                './properties/SetGet',
                './properties/Groups'
                //'./properties/Representation'
                ];

for (var ip=0, len = packageParts.length; ip<len; ip++) {
	var packPath = packageParts[ip];
	var packPathParts = packPath.split('/');
	var packName = packPathParts[packPathParts.length-1];
	var addPack = require(packPath);
	addPack = addPack[packName];
	for (key in addPack.prototype){
		MatlabBase.prototype[key] = addPack.prototype[key];
	}
}

/*----------------------------------------------------------------------------*/
MatlabBase.prototype.constructor = function(model) {
	CommonLangBase.prototype.constructor(model);
	
	this.targetType = {
	    "float"		:"single",
	    "double"	:"double",
	    "short"		:"int16",
	    "integer"	:"int32",
	    "boolean"	:"logical",
	    "string"	:"char",
	    "char"		:"char",
	    "tiny"		:"int8"
	};
	
	

	this.name = 'matlab';
	this.ext = 'm';
	this.packagePathSep = '.';
	
	this.blockSpace = '    ';
	
	this.sep1 = '%******************************************************************************';
	this.sep2 = '%---------------------------------------------------------------------------';
	
	//make packaging module
	this.packaging = new Packaging(this);
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.stringify = function(str) {
	return ('\'' + String(str).replace(/\'/g, '\'\'') + '\'');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.makeInternal = function(str) {
	return ('INT' + str);	
};

/*----------------------------------------------------------------------------*/
MatlabBase.prototype.makeModulePath = function(packagedTypeStr) {
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

MatlabBase.prototype.getClassPathFromType = function(packagedTypeStr) {
	var parsed = this.parsePackagedTypeStr(packagedTypeStr);
	var modulePath = this.makeModulePath(parsed);
	
	return (modulePath);
};

MatlabBase.prototype.getOutCodeFileNameFromVersionedPackagedTypeStr = function(modelID) {
	return this.getModelNameFromPackagedTypeStr(modelID) + '.' + this.ext;
	
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.getClassName = function() {
	return this.getName();
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.getArrayDimList = function(prop) {
	
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
					dimList[i] = this.objName() + '.' + dimList[i];
				}
			}
		}
		/* treats all awways as two-dimensional */
		if (dimList.length == 1) {
			dimList.push('1');
		}
		return dimList;
	}
	else {
		throw ('Illigal non-array input.',prop);
	}
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.objName = function() {
	//return this.firstToLower(this.getModel().name);
	return 'OBJ';
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.getArrayShape = function(prop) {
	
	if (this.isArray(prop)){
		return '' + this.getArrayDimList(prop).join(',') + '';
	}
	else {
		throw ('Illigal non-array input.',prop);
	}
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.getImportForCustomDataTypes = function() {
	
	var cmd = [];
	var props = this.getProperties();
	
	for (var i = 0; i<props.length; i++){
		if (this.isAtomicType(props[i].type) == false) {
			var className = this.getClassNameFromType(props[i].type);
			cmd.push('from ' + className + ' import ' + className);
		}
	}
	
    return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
MatlabBase.prototype.getPropertyList = function() {
	
    return this.getModel().properties.map(function(o) {
	return expand( "@extra.name", o );
    }).join(" ,\n ");
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.getMatlabArrayDimList = function(prop) {
	
	if (this.isArray(prop)){
		var dimList = this.getDimensionList(prop);
		for (var i = 0; i<dimList.length; i++){
			dimList[i] = 'self.' + dimList[i];
		}
		return dimList;
	}
	else {
		throw ('Illigal non-array input.',prop);
	}
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.getMatlabArrayShape = function(prop) {
	
	if (this.isArray(prop)){
		return '[' + this.getMatlabArrayDimList(prop).join() + ']';
	}
	else {
		throw ('Illigal non-array input.',prop);
	}
};

/*----------------------------------------------------------------------------*/
MatlabBase.prototype.propertyValue = function(i) {
	var properties = this.getProperties();
	
	if(properties[i].value == undefined){
		if (this.isArray(properties[i])) {
			if (this.isAtomicType(properties[i].type)){
				return 'np.zeros(' + this.getMatlabArrayShape(properties[i]) + ')';
			}
			else {
				return this.getInitObjectList(properties[i]);
			}
		}
		else {
			return 'None';
		}
	}
	else {
		return JSON.stringify(properties[i].value);
	}
};

/*----------------------------------------------------------------------------*/
MatlabBase.prototype.makePrivate = function(propName) {
    return propName + 'Private' ;
};


/*----------------------------------------------------------------------------*/
MatlabBase.prototype.getBlockSpace = function(blockLevel) {
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
MatlabBase.prototype.gbl = function(blockLevel) {
	
	return this.getBlockSpace(blockLevel);
};

/*----------------------------------------------------------------------------*/
MatlabBase.prototype.codeSeparator = function(bl) {
	var bs = this.getBlockSpace(bl);
	
	if (bs.length == 0) {
		return this.sep1;
	} 
	else {
		return (bs + this.sep2.substr(0, this.sep2.length -1 - (bs.length - this.blockSpace)));
	}
	
};

/*----------------------------------------------------------------------------*/
MatlabBase.prototype.arrayUpdateSize = function(prop, bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function ' + this.arrayUpdateSizeFuncName(prop) + '(' + this.objName() + ')');
	
	var arrName =  this.objName() + '.' + this.getPropertyNameInClass(prop);
	
	if (this.isAtomicType(prop.type)) {
		cmd.push(this.getBlockSpace(bl+1) + 
		arrName + ' = zeros(' + this.getArrayShape(prop) + ');');
	}
	else {
		cmd.push(this.getBlockSpace(bl+1) + 
		arrName + ' = cell(' + this.getArrayShape(prop) + ');');
		cmd.push(this.initObjectList(prop, bl+1));
	}

	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
MatlabBase.prototype.modelFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function ' + this.modelDesAtt() + ' = get.' + this.modelDesAtt() + '(' + this.objName() +')');	

	cmd.push(this.getBlockSpace(bl+1) + 
		this.modelDesAtt() + ' = simos.external.jsonlab.loadjson(' + this.objName() + '.' + this.modelDesAtt() + 'str' + ');' );

	cmd.push(this.getBlockSpace(bl) + 
	'end');	

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.loopBlockForArray = function(bl, prop) {
	var cmd = [];
	var ends = [];
	
	var dimList = this.getArrayDimList(prop);
	var indNames = [];
	var strInds = [];
	
	var nameFlag = '';
	
	for (var di =(dimList.length-1); di>=0; di--) {
		var indName = 'i' + di;
		indNames.push(indName);
		
		strInds.push('num2str(' + indName + ')'); /* make string rep for matlab*/
		
		cmd.push(this.getBlockSpace(bl+ (dimList.length-1)-di ) + 
		'for ' + indName + ' = 1:size(' + this.objName() + '.' + prop.name + ',' + (di+1) + ')');

		ends.push(this.getBlockSpace(bl+ di ) +
				 'end');
		
		nameFlag = nameFlag + this.stringify(indName) + ' num2str(' + indName + ') ';
	}
	var indArray = indNames.reverse().join(',');
	var strIndArray = strInds.reverse().join(' \',\' ');
	
	return {'cmd' : cmd.join('\n'),
			'indNames': indNames,
			'indArray': indArray,
			'strIndArray': strIndArray,
			'nameFlag': '[' + nameFlag + ']',
			'ends': ends.join('\n'),
			'bl': bl+(dimList.length)-1};
};

/*----------------------------------------------------------------------------*/
MatlabBase.prototype.cloneFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function newObj = clone(' + this.objName() + ')');
	cmd.push(this.gbl(bl+1) + 	'newObj = ' + this.getClassPathFromType(this.getModel().type) + '(' + this.objName() + '.name);');
	cmd.push(this.gbl(bl+1) +   this.objName() + '.cloneTo(newObj);' );	     

	cmd.push(this.gbl(bl) +	'end');
			
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.cloneToFunc = function(bl) {
    
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	/* =============================================== */
	cmd.push(this.gbl(bl) + 'function cloneTo(' + this.objName() + ',newObj)');

	/*
	if (this.isDerived()) {
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +
					supType.name + '._cloneTo(self,newObj)');			
		}
		cmd.push(this.gbl(bl+1) + '');
	}
	*/
    
	var props = this.getProperties();
	
	for (var i=0; i<props.length; i++) {
		var prop = props[i];
		cmd.push(this.gbl(bl+1) + 
				'if (' + this.objName() + '.isSet(' + this.stringify(prop.name) +'))' );	     

		if (this.isAtomicType(prop.type)) {
			if (this.isArray(prop)) {
				cmd.push(this.gbl(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = ' + this.objName() + '.' + this.makePrivate(prop.name) + ';' );	     
			}
			else {
				cmd.push(this.gbl(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = ' + this.objName() + '.' + this.makePrivate(prop.name) + ';');	     				
			}
		}
		else {
			if (this.isArray(prop)) {
				cmd.push(this.gbl(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = {};' );	     	
				var loopBlock = this.loopBlockForArray(bl+2,prop);
				cmd.push(loopBlock.cmd);
					cmd.push(this.gbl(loopBlock.bl+1) + 
							'newObj.' + this.makePrivate(prop.name) + '{end+1} = ' +
							this.objName() + '.' + this.makePrivate(prop.name) + '{' +loopBlock.indArray + '}'  + '.clone();' );    
				cmd.push(loopBlock.ends);
			}
			else {
				cmd.push(this.gbl(bl+2) + 
						'newObj.' + this.makePrivate(prop.name) + 
						' = ' + this.objName() + '.' + this.makePrivate(prop.name) + '.clone();');	     				
			}
			
		}
		
		cmd.push(this.gbl(bl+1) +	'end');
	}
	
	cmd.push(this.gbl(bl) +	'end');   
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.getPrivateNameFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function pname = getPrivateName(~,name)');
	cmd.push(this.gbl(bl+1) +	'pname = [name \'Private\'];');
	cmd.push(this.gbl(bl) +	'end');   
	

return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.factoryFuncPublic = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function obj = create(~,name)');
	cmd.push(this.getBlockSpace(bl+1) + 
		'if ~(exist(\'name\',\'var\')) ');
	cmd.push(this.getBlockSpace(bl+2) + 
			'name = ' + this.stringify(this.objName()) + '; ');	
	cmd.push(this.getBlockSpace(bl+1) + 
		'end ');
	cmd.push(this.getBlockSpace(bl+1) + 
		'obj = ' + this.getClassPathFromType(this.getModel().type) + '(name);');
	cmd.push(this.getBlockSpace(bl) + 
	'end');	
	cmd.push(this.getCodeSeparator(bl));
	
	var props = this.getProperties();
    for (var i = 0; i<props.length; i++) {
    	if (!(this.isAtomicType(props[i].type))) {
    		var prop = props[i];
    		var propType = this.getClassPathFromType(prop.type);
					
				cmd.push(this.getBlockSpace(bl) + 
				'function obj = makea' + this.firstToUpper(prop.name) +'(~,name)');
				cmd.push(this.getBlockSpace(bl+1) + 
					'if ~(exist(\'name\',\'var\')) ');
				cmd.push(this.getBlockSpace(bl+2) + 
						'name = ' + this.stringify(prop.name) + '; ');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'end ');

				cmd.push(this.getBlockSpace(bl+1) + 
					'obj = ' + propType + '(name);');
				cmd.push(this.getBlockSpace(bl) + 
				'end');	
				cmd.push(this.getCodeSeparator(bl));
			
			if (this.isArray(prop) && !this.isGrouped(prop)){
				cmd.push(this.getBlockSpace(bl) + 
				'function obj = append' + this.firstToUpper(prop.name) +'(' + this.objName() + ',name)');
				cmd.push(this.getBlockSpace(bl+1) + 
					'if ~(exist(\'name\',\'var\')) ');
				cmd.push(this.getBlockSpace(bl+2) + 
						'name = [' + this.stringify(prop.name) + ' num2str(length(' + this.objName() + '.' + prop.name + '))]; ');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'end ');
				cmd.push(this.getBlockSpace(bl+1) + 
					'obj = ' + propType + '(name);');
				cmd.push(this.getBlockSpace(bl+1) + 
					'for i = 1:length(' + this.objName() + '.' + prop.name + ')');
				cmd.push(this.getBlockSpace(bl+2) + 
						'if (strcmp(' + this.objName() + '.' + prop.name + '{i}.name, name) == 1)');
				cmd.push(this.getBlockSpace(bl+3) + 
							'disp([\'warning:\' name \' already exist. \']);');
				cmd.push(this.getBlockSpace(bl+2) + 
						'end');		
				cmd.push(this.getBlockSpace(bl+1) + 
					'end');

				if (this.hasAssignments(prop))
					cmd.push(
						this.assignPropertyValue(bl+1,	this.getAssignments(prop), 'obj')
						);
				
				cmd.push(this.getBlockSpace(bl+1) + 
					this.objName() + '.' + prop.name + '{end+1} = obj;');
				
				/*
				 * TODO: Check if the name already exist
				cmd.push(this.getBlockSpace(bl+1) + 
					'if not(obj.name in [a.name for a in self.' + prop.name + ']):');
				cmd.push(this.getBlockSpace(bl+2) + 
						this.objName() + '.' + prop.name + '(end+1) = obj');
				cmd.push(this.getBlockSpace(bl+1) + 
					'else');
				cmd.push(this.getBlockSpace(bl+2) + 
						'print ("warning: object %s already exist."%(obj.name))');	
				cmd.push(this.getBlockSpace(bl) + 
					'end');	
				*/
				cmd.push(this.getBlockSpace(bl) + 
				'end');	
				cmd.push(this.getCodeSeparator(bl));
						
			}
			else if(this.isSingle(prop)) {
				if (this.isOptional(prop)) {
					cmd.push(this.getBlockSpace(bl) + 
					'function obj = create' + this.firstToUpper(prop.name) +'(' + this.objName() + ', name)');
					cmd.push(this.getBlockSpace(bl+1) + 
						'if ~(isempty(' + this.objName() + '.' + prop.name + ')) ');
					cmd.push(this.getBlockSpace(bl+2) + 
							'error(\'object ' + prop.name + 
							' already exist, use renew' + this.firstToUpper(prop.name) +
							' to get a new one.\'); ');
					cmd.push(this.getBlockSpace(bl+1) + 
						'end ');
					cmd.push(this.getBlockSpace(bl+1) + 
						'if ~(exist(\'name\',\'var\')) ');
					cmd.push(this.getBlockSpace(bl+2) + 
							'name = ' + this.stringify(prop.name) + '; ');
					cmd.push(this.getBlockSpace(bl+1) + 
						'end ');

					cmd.push(this.getBlockSpace(bl+1) + 
						'obj = ' + this.objName() + '.renew' + this.firstToUpper(prop.name) + '(name);');
					cmd.push(this.getBlockSpace(bl) + 
					'end ');
					
					cmd.push(this.getBlockSpace(bl) + 
					'function delete' + this.firstToUpper(prop.name) +'(' + this.objName() + ')');
					cmd.push(this.getBlockSpace(bl+1) + 
						this.objName() + '.' + this.makePrivate(prop.name) + ' = \'\'; ');
					cmd.push(this.getBlockSpace(bl) + 
					'end ');
				
				}
				
				cmd.push(this.getBlockSpace(bl) + 
				'function obj = renew' + this.firstToUpper(prop.name) +'(' + this.objName() + ', name)');
				cmd.push(this.getBlockSpace(bl+1) + 
					'if ~(exist(\'name\',\'var\')) ');
				cmd.push(this.getBlockSpace(bl+2) + 
						'name = ' + this.stringify(prop.name) + '; ');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'end ');
				cmd.push(this.getBlockSpace(bl+1) + 
					this.objName() + '.' + prop.name + ' = ' + propType + '(name);');

				cmd.push(this.getBlockSpace(bl+1) + 
					'obj = ' + this.objName() + '.' + prop.name + ';');

				if (this.hasAssignments(prop))
					cmd.push(
					this.assignPropSinglesValues(bl+1,	prop)
					);
				
				cmd.push(this.getBlockSpace(bl) + 
				'end');	
				cmd.push(this.getCodeSeparator(bl));
			}
			
    	}
	}
	
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
MatlabBase.prototype.factoryFuncPrivate = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
		
	var props = this.getProperties();
    for (var i = 0; i<props.length; i++) {
    	if (!(this.isAtomicType(props[i].type))) {
    		var prop = props[i];
    		var propType = this.getClassPathFromType(prop.type);
			
			if (this.isArray(prop) && this.isGrouped(prop)){
				cmd.push(this.getBlockSpace(bl) + 
				'function obj = append' + this.firstToUpper(prop.name) +'(' + this.objName() + ',name)');
				cmd.push(this.getBlockSpace(bl+1) + 
					'if ~(exist(\'name\',\'var\')) ');
				cmd.push(this.getBlockSpace(bl+2) + 
						'name = [' + this.stringify(prop.name) + ' num2str(length(' + this.objName() + '.' + prop.name + '))]; ');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'end ');
				cmd.push(this.getBlockSpace(bl+1) + 
					'obj = ' + propType + '(name);');
				cmd.push(this.getBlockSpace(bl+1) + 
					'for i = 1:length(' + this.objName() + '.' + prop.name + ')');
				cmd.push(this.getBlockSpace(bl+2) + 
						'if (strcmp(' + this.objName() + '.' + prop.name + '{i}.name, name) == 1)');
				cmd.push(this.getBlockSpace(bl+3) + 
							'disp([\'warning:\' name \' already exist. \']);');
				cmd.push(this.getBlockSpace(bl+2) + 
						'end');		
				cmd.push(this.getBlockSpace(bl+1) + 
					'end');

				if (this.hasAssignments(prop))
					cmd.push(
						this.assignPropertyValue(bl+1,	this.getAssignments(prop), 'obj')
						);
				
				cmd.push(this.getBlockSpace(bl+1) + 
					this.objName() + '.' + prop.name + '{end+1} = obj;');
				
				/*
				 * TODO: Check if the name already exist
				cmd.push(this.getBlockSpace(bl+1) + 
					'if not(obj.name in [a.name for a in self.' + prop.name + ']):');
				cmd.push(this.getBlockSpace(bl+2) + 
						this.objName() + '.' + prop.name + '(end+1) = obj');
				cmd.push(this.getBlockSpace(bl+1) + 
					'else');
				cmd.push(this.getBlockSpace(bl+2) + 
						'print ("warning: object %s already exist."%(obj.name))');	
				cmd.push(this.getBlockSpace(bl) + 
					'end');	
				*/
				cmd.push(this.getBlockSpace(bl) + 
				'end');	
				cmd.push(this.getCodeSeparator(bl));
						
			}
			
    	}
	}
	
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.getPropModelFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function out = getPropModel(' + this.objName() + ', varName)');

	cmd.push(this.getBlockSpace(bl+1) + 
	 	'props = ' + this.objName() + '.' + this.modelDesAtt() + '.properties;');

	cmd.push(this.getBlockSpace(bl+1) + 
		'out = 0;');
	
	cmd.push(this.getBlockSpace(bl+1) + 
 		'for i = 1: length(props)');
	cmd.push(this.getBlockSpace(bl+2) + 
			'prop = props{i};');	
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (strcmp(prop.name, varName))');	
	cmd.push(this.getBlockSpace(bl+3) + 
 				'out = prop;');
	cmd.push(this.getBlockSpace(bl+2) + 
			'end');
	cmd.push(this.getBlockSpace(bl+1) + 
		'end');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'if (isstruct(out) == 0)');	
	cmd.push(this.getBlockSpace(bl+2) + 
			'error([\'property \' varName \' was not found.\']);');
	cmd.push(this.getBlockSpace(bl+1) + 
		'end');
	
	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.hdf5DataType = function(bl) {
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function flag = hdf5DataType(' + this.objName() + ', varName)');

	cmd.push(this.getBlockSpace(bl+1) + 
 		'if (ischar(' + this.objName() + '.(varName)) )');
	cmd.push(this.getBlockSpace(bl+2) + 
			'flag = \'H5T_STRING\';');
	cmd.push(this.getBlockSpace(bl+1) + 
		'elseif (isinteger(' + this.objName() + '.(varName)))');
	cmd.push(this.getBlockSpace(bl+2) + 
			'flag = \'H5T_STRING\';');
	cmd.push(this.getBlockSpace(bl+1) + 
		'elseif (isfloat(' + this.objName() + '.(varName)))');
	cmd.push(this.getBlockSpace(bl+2) + 
			'flag = \'H5T_STRING\';');

	cmd.push(this.getBlockSpace(bl+1) + 
		'end');
	
	cmd.push(this.getBlockSpace(bl) + 
	'end');		
	return cmd.join('\n');
};


/*----------------------------------------------------------------------------*/
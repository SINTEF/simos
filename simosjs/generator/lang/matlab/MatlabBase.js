
var CommonLangBase = require('../CommonLangBase').CommonLangBase;

/*----------------------------------------------------------------------------*/
function MatlabBase(model){
	this.constructor(model);
};
exports.MatlabBase = MatlabBase;
/*----------------------------------------------------------------------------*/
MatlabBase.prototype = Object.create(CommonLangBase.prototype);
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

	this.blockSpace = '    ';
	
	this.sep1 = '%******************************************************************************';
	this.sep2 = '%---------------------------------------------------------------------------';
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.stringify = function(str) {
	return ('\'' + str + '\'');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.makeInternal = function(str) {
	return ('INT' + str);	
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.initPublicProperties = function(bl) {
	var cmd = [];

	cmd.push(this.getBlockSpace(bl) + 
		'storageBackEndType');	
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.initPublicConstantProperties = function(bl) {
	var cmd = [];
	/*
	cmd.push(this.getBlockSpace(bl) + 
		this.modelDesAtt() + 'str');	
	*/
	
	cmd.push(this.getBlockSpace(bl) + 
			this.modelDesAtt() + 'str = [' +
			this.stringify(JSON.stringify(this.getModel(),  null, '\t').split('\n').join('\' ...\n \'') ) + '];');

	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.initPublicDependentProperties = function(bl) {
	 
	var cmd = [];
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	cmd.push(this.getBlockSpace(bl) + 
			this.modelDesAtt() );
	cmd.push(this.getBlockSpace(bl));
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];

		/*initializing other properties */
		cmd.push(this.getBlockSpace(bl) + 
		prop.name + ' = ' + this.getPropertyValue(prop) + ';');
		
		/*
		if (!(this.isAtomic(prop)) && (this.isContained(prop)) ){
			cmd.push(this.getInitObject(bl+1, prop));
		}
		*/
		/*
		cmd.push(this.getBlockSpace(bl+1) + 
				'self.' + this.modelDesAtt(prop.name ) + ' = ' + JSON.stringify(prop) );
		*/
		

	}
	cmd.push(this.getBlockSpace(bl));
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.initPublicHiddenProperties = function(bl) {
	
	var cmd = [];

	/*add one property for the filepath */
	
	cmd.push(this.getBlockSpace(bl) + 
			this.makeInternal('FilePath') + ' = \'\';');

    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.initPrivateProperties = function(bl) {
	 
	var cmd = [];
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];

		/*initializing other properties */
		cmd.push(this.getBlockSpace(bl) + 
		this.makePrivate(prop.name) + ' = ' + this.getPropertyValue(prop) + ';');
		
		/*
		if (!(this.isAtomic(prop)) && (this.isContained(prop)) ){
			cmd.push(this.getInitObject(bl+1, prop));
		}
		*/
		/*
		cmd.push(this.getBlockSpace(bl+1) + 
				'self.' + this.modelDesAtt(prop.name ) + ' = ' + JSON.stringify(prop) );
		*/
		cmd.push(this.getBlockSpace(bl));

	}


    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.getPropertyValue = function(prop) {
	/*return properties default value,
	 * if property is an object (complex type), it returns the command to 
	 * instantiate that object. */
	
	if(prop.value == undefined){
		if (this.isArray(prop)) {
			if (this.isAtomic(prop)){				
				return '[]';
			}
			else {
				if (this.isContained(prop)){
					//return this.getInitObjectList(prop);
					return '{}';
				}
				else {
					return '{}';
				}
				
			}
		}
		else if (!(this.isAtomic(prop)) && (this.isContained(prop))){
			//return (this.getTypePath(prop) + '(' + this.stringify(prop.name) +')');
			return ('\'\'');
		}
		else {
			return '\'\'';
		}
	}
	else {
		if (this.isAtomic(prop)){
			if (prop.type == "boolean") {
				return (this.changeType(prop.type) + '(' + prop.value + ')' );
			}
			else if (this.isNumeric(prop)){
				return ('str2num(' + this.stringify(this.changeType(prop.type) + '(' + prop.value + ')') + ')');
			}
			else {
				return ( this.stringify( prop.value ) );
			}
		}
		else {
			if (!(this.isAtomic(prop)) && (this.isContained(prop))){
				//return (this.getTypePath(prop) + '(' + this.stringify(prop.name) +')');
				return ('\'\'');
			}
			else {
				return '\'\'';
			}

		}

		
	}
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
MatlabBase.prototype.constructorFunc = function(bl) {
	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function ' + this.objName() + ' = ' + this.getClassName() + '(name)');
	
	/*initializing other properties */
	cmd.push(this.getBlockSpace(bl+1) + 
		'if ~(exist(\'name\',\'var\')) ');
	cmd.push(this.getBlockSpace(bl+2) + 
			'name = ' + this.stringify(this.objName()) + '; ');	
	cmd.push(this.getBlockSpace(bl+1) + 
		'end ');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		this.objName() + '.name = name;');

	
	/*initialize properties*/
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		
		if (this.isArray(prop) && this.isAtomic(prop) ){
				cmd.push(this.getBlockSpace(bl+1) + 
				this.objName() + '.' + prop.name + ' = ' + 
				'zeros(' + this.getArrayShape(prop) + ');');				
		
		}
		
		if (this.isSingle(prop) && (!this.isAtomic(prop)) && 
			this.isContained(prop) && (!this.isOptional(prop)) ){
				cmd.push(this.getBlockSpace(bl+1) + 
				this.objName() + '.createSet' + this.firstToUpper(prop.name) + '();');				
		
		}
		
	}
	

	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
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
exports.MatlabBase.prototype.getPropertyList = MatlabBase.prototype.getPropertyList;
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
MatlabBase.prototype.initObjectList = function(prop, bl) {
	
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	

	if ((this.isArray(prop)) && (! this.isAtomic(prop))){
		/* we have o use a list with the defined dimensions of the object*/
		var className = this.getTypePath(prop);
		var dimList = this.getArrayDimList(prop);
		
		var loopBlock = this.loopBlockForArray(bl,prop);
		cmd.push(loopBlock.cmd);
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
			this.objName() + '.' + this.makePrivate(prop.name) + '{' +loopBlock.indArray + '} = ' +
			className + '(' + loopBlock.nameFlag + ');' );		
		cmd.push(loopBlock.ends);
		
		return cmd.join('\n');
	}
	else {
		throw ('Array with non-atomic type was expected.', prop);
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
MatlabBase.prototype.loadFromHDF5HandleFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	
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
		this.modelDesAtt() + ' = loadjson(' + this.objName() + '.' + this.modelDesAtt() + 'str' + ');' );

	cmd.push(this.getBlockSpace(bl) + 
	'end');	

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.propGet = function(prop, bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.getBlockSpace(bl) + 
	'function ' + prop.name + ' = get.' + prop.name + '(' + this.objName() +')');	

	cmd.push(this.getBlockSpace(bl+1) + 
		prop.name + ' = ' + this.objName() + '.' + this.makePrivate(prop.name) + ';' );

	cmd.push(this.getBlockSpace(bl) + 
	'end');	
			
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.propSet = function(prop, bl) {
	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function set.' + prop.name + '(' + this.objName() + ', val)');
	
	/*assign the value*/
	if (this.isAtomicType(prop.type)) {
		if (this.isArray(prop)) {
			/* no chekcs here,
			 * TODO: add casting or checks for atomic type arrays*/
			cmd.push(this.getBlockSpace(bl+1) + 
			this.objName() + '.' + this.makePrivate(prop.name) +' = val;');			
		}
		else {
			/*type casting between atomic types */
			if (prop.type == "boolean") {
				cmd.push(this.getBlockSpace(bl+1) + 
				this.objName() + '.' + this.makePrivate(prop.name) +' = ' + 
				this.changeType(prop.type) + '(val);');
			}
			else if (this.isNumeric(prop)){
				cmd.push(this.getBlockSpace(bl+1) + 
				this.objName() + '.' + this.makePrivate(prop.name) +' = ' + 
				'(val);');
			}
			else if (this.isString(prop)){
				cmd.push(this.getBlockSpace(bl+1) + 
				this.objName() + '.' + this.makePrivate(prop.name) +' = ' + 
				'char(val);');

			}
			else {
				cmd.push(this.getBlockSpace(bl+1) + 
				this.objName() + '.' + this.makePrivate(prop.name) +' = ' + 
				'(val);');
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
			/* cheks if the value has a correct type
			 * TODO: add the check*/
		}
		/*simple assignment */
		cmd.push(this.getBlockSpace(bl+1) + 
		this.objName() + '.' + this.makePrivate(prop.name) +' = val;');
	}

	/*change array sizes if prop is a dimension */
	if (this.isDimension(prop)){
		/* find out the array which has prop as a dimension*/
		var arrays = this.getPropertiesWithDimension(prop);
		/* resize the array accordingly */
		for (var i = 0; i<arrays.length; i++){
			cmd.push(this.getBlockSpace(bl+1) + 
					
			this.objName() + '.' + this.arrayUpdateSizeFuncName(arrays[i]) +'()' );
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
					this.objName() + '.' + childProp.name + '{' +loopBlock.indArray + '}' + '.' + this.getDependentChildFor(childProp,prop) 
					+ ' = ' + this.objName() + '.' + prop.name + ';');
			cmd.push(loopBlock.ends);

		}
		else {
			cmd.push(this.getBlockSpace(bl+1) + 
					this.objName() + '.' + childProp.name + '.' + this.getDependentChildFor(childProp,prop) 
					+ ' = ' + this.objName() + '.' + prop.name + ';');
		}
	}
	
	
	/*syncronization*/
	/*
	cmd.push(this.getBlockSpace(bl+1) + 
			'if not(' + JSON.stringify(prop.name) + ' in self._sync.keys()):');
	cmd.push(this.getBlockSpace(bl+2) + 
			'self._sync[' + JSON.stringify(prop.name) + '] = 1');
	*/
	
	cmd.push(this.getBlockSpace(bl) + 
	'end');	
	/*return the commands */
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.loopBlockForArray = function(bl, prop) {
	var cmd = [];
	var ends = [];
	
	var dimList = this.getArrayDimList(prop);
	var indNames = [];
	
	var nameFlag = '';
	
	for (var di =dimList.length-1; di>=0; di--) {
		var indName = 'i' + di;
		indNames.push(indName);
		
		cmd.push(this.getBlockSpace(bl+ (dimList.length-1)-di ) + 
		'for ' + indName + ' = 1:size(' + this.objName() + '.' + prop.name + ',' + (di+1) + ')');

		ends.push(this.getBlockSpace(bl+ di ) +
				 'end');
		
		nameFlag = nameFlag + this.stringify(indName) + ' num2str(' + indName + ') ';
	}
	var indArray = indNames.reverse().join(',');

	return {'cmd' : cmd.join('\n'),
			'indNames': indNames,
			'indArray': indArray,
			'nameFlag': '[' + nameFlag + ']',
			'ends': ends.join('\n'),
			'bl': bl+(dimList.length)-1};
};

/*----------------------------------------------------------------------------*/
MatlabBase.prototype.factoryFunc = function(bl) {
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
		'obj = ' + this.fullTypeName(this.getModel()) + '(name);');
	cmd.push(this.getBlockSpace(bl) + 
	'end');	
	cmd.push(this.getCodeSeparator(bl));
	
	var props = this.getProperties();
    for (var i = 0; i<props.length; i++) {
    	if (!(this.isAtomicType(props[i].type))) {
    		var prop = props[i];
    		var propType = this.parseFullTypeName(prop.type).path;
			
				cmd.push(this.getBlockSpace(bl) + 
				'function obj = create' + this.firstToUpper(prop.name) +'(~,name)');
				cmd.push(this.getBlockSpace(bl+1) + 
					'if ~(exist(\'name\',\'var\')) ');
				cmd.push(this.getBlockSpace(bl+2) + 
						'name = ' + this.stringify(this.objName()) + '; ');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'end ');

				cmd.push(this.getBlockSpace(bl+1) + 
					'obj = ' + propType + '(name);');
				cmd.push(this.getBlockSpace(bl) + 
				'end');	
				cmd.push(this.getCodeSeparator(bl));
			
			if (this.isArray(prop)){
				cmd.push(this.getBlockSpace(bl) + 
				'function obj = createAppend' + this.firstToUpper(prop.name) +'(' + this.objName() + ',name)');
				cmd.push(this.getBlockSpace(bl+1) + 
					'if ~(exist(\'name\',\'var\')) ');
				cmd.push(this.getBlockSpace(bl+2) + 
						'name = ' + this.stringify(this.objName()) + '; ');	
				cmd.push(this.getBlockSpace(bl+1) + 
					'end ');
				cmd.push(this.getBlockSpace(bl+1) + 
					'obj = ' + propType + '(name);');
				
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
			else {
				cmd.push(this.getBlockSpace(bl) + 
				'function obj = createSet' + this.firstToUpper(prop.name) +'(' + this.objName() + ')');	
				cmd.push(this.getBlockSpace(bl+1) + 
					this.objName() + '.' + prop.name + ' = ' + propType
						+ '(' + this.stringify(prop.name)+ ');');

				cmd.push(this.getBlockSpace(bl+1) + 
						'obj = ' + this.objName() + '.' + prop.name + ';');
				
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
MatlabBase.prototype.isSetFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function flag = isSet(' + this.objName() + ', varName)');

	cmd.push(this.getBlockSpace(bl+1) + 
 		'if (~isempty(' + this.objName() + '.(varName)) )');
	cmd.push(this.getBlockSpace(bl+2) + 
			'flag = true;');
	cmd.push(this.getBlockSpace(bl+1) + 
		'else');
	cmd.push(this.getBlockSpace(bl+2) + 
			'flag = false;');
	cmd.push(this.getBlockSpace(bl+1) + 
		'end');
		
	cmd.push(this.getBlockSpace(bl) + 
	'end');
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.isContainedFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function flag = isContained(' + this.objName() + ', varName)');

	cmd.push(this.getBlockSpace(bl+1) + 
		'flag = true;');
	
	cmd.push(this.getBlockSpace(bl+1) + 
	 	'MODEL = ' + this.objName() + '.getPropModel(varName);');
	
	cmd.push(this.getBlockSpace(bl+1) + 
 		'if (isfield(MODEL, \'containment\'))');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (strcmpi(MODEL.containment, \'false\'))');	
	cmd.push(this.getBlockSpace(bl+3) + 
 				'flag = false;');
	cmd.push(this.getBlockSpace(bl+2) + 
			'end');
	cmd.push(this.getBlockSpace(bl+1) + 
		'end');


	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
	return cmd.join('\n');
};
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
MatlabBase.prototype.saveToHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function saveToHDF5Handle(' + this.objName() + ', handle)');

	/* saving data */
	cmd.push(this.getBlockSpace(bl+1) + 
			this.objName() + '.saveDataToHDF5Handle(handle)' );

	cmd.push(this.getBlockSpace(bl+1));

	
	cmd.push(this.getBlockSpace(bl) + 
	'end');
		
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.saveDataToHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/*==================================================*/
	cmd.push(this.getBlockSpace(bl) + 
	'function saveDataToHDF5Handle(' + this.objName() + ', handle)');
	
	/*
	if (this.isDerived()) {
		cmd.push(this.getBlockSpace(bl+1) +
		'super(' + this.getClassName() + ', self)._saveDataToHDF5Handle(handle)');
		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	*/
	
	if (this.isDerived()) {
		throw "Derived models can not be used for code generation with matlab.";
	}
	

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
						this.objName() + '.saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', \'AtomicArray\')' );
			 }
			 else{
				 /* single atomic type value */
				cmd.push(this.getBlockSpace(bl+1) + 
						this.objName() + '.saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', \'AtomicSingle\')' );
			 }
		}
		else {
			/*creating references and saving other complex types 
			 * 'value' will be a or an array of references */
			
			/*create a subgroup for the contained values */

			if(this.isArray(prop)){
				/* array non-atomic type reference */
				 cmd.push(this.getBlockSpace(bl+1) + 
					this.objName() + '.saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', \'NonAtomicArray\')' );
				 
			 }
			 else{
				 /* single non-atomic type reference */
				 cmd.push(this.getBlockSpace(bl+1) + 
					this.objName() + '.saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', \'NonAtomicSingle\')' );
			 }

		}
		 
		cmd.push(this.getBlockSpace(bl+1));

	}
	
	/* saving root attributes */
	var filePath = this.objName() + '.' + this.makeInternal('FilePath');

	cmd.push(this.getBlockSpace(bl+1) + 
			'fileattrib(' + filePath + ',\'+w\');' );
	
	/* putting accessed package names into the main root attributes */
	var packages = this.getPackages();
	for(var i = 0, len = packages.length; i< len; i++) {
		var key = packages[i];
		cmd.push(this.getBlockSpace(bl+1) + 
				'h5writeatt(' + filePath + ',handle,' + 
					this.stringify(key) +',' + 
					this.stringify(this.getVersion(key)) + ');' 
					);

	}
	
	cmd.push(this.getBlockSpace(bl+1) + 
			'h5writeatt(' + filePath + ',handle,\'type\',' + 
				this.stringify(this.getModel()["package"] + this.packageSep + this.getModel().type) + ');' 
				);

	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.saveToHDF5HandleItem = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function saveToHDF5HandleItem(' + this.objName() + ', handle, varName, type)');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'saveFlag = true;');
		
	//cmd.push(this.getBlockSpace(bl+1) + 
	//		'if (varName in self._sync.keys()):');
	//cmd.push(this.getBlockSpace(bl+2) + 
	//			'if (self._sync[varName] == 1):');
	//cmd.push(this.getBlockSpace(bl+3) + 
	//			'saveFlag = True');	

	cmd.push(this.getBlockSpace(bl+1) + 
		'if (saveFlag)');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (strcmp(type, \'AtomicSingle\'))');
	cmd.push(this.getBlockSpace(bl+3) + 
				this.objName() + '.saveToHDF5HandleItemAtomicSingle(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'elseif (strcmp(type, \'AtomicArray\'))');
	cmd.push(this.getBlockSpace(bl+3) + 
				this.objName() + '.saveToHDF5HandleItemAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'elseif (strcmp(type, \'NonAtomicArray\'))');
	cmd.push(this.getBlockSpace(bl+3) + 
				this.objName() + '.saveToHDF5HandleItemNonAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'elseif (strcmp(type, \'NonAtomicSingle\'))');
	cmd.push(this.getBlockSpace(bl+3) + 
				this.objName() + '.saveToHDF5HandleItemNonAtomicSingle(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'end');
	cmd.push(this.getBlockSpace(bl+1) + 
		'end');			
	/*writing non-value attributes */
	//cmd.push(this.getBlockSpace(bl+2) + 
	//		'self._saveToHDF5HandleItemAttrs(handle, varName)' );
	
	/*
	cmd.push(this.getBlockSpace(bl+2) + 
			'self._sync[varName] = -1' );
	*/
		 
	cmd.push(this.getBlockSpace(bl+1));

	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.saveToHDF5HandleItemAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function saveToHDF5HandleItemAtomicSingle(' + this.objName() + ', handle, varName)');
	
	var filePath = this.objName() + '.' + this.makeInternal('FilePath');
	
	/*TODO: change hdf5write with h5write and learn how to write string. */
	
	 /* single atomic type value */
	cmd.push(this.getBlockSpace(bl+1) + 
	 	'if (' + this.objName() + '.isSet(varName))');
	cmd.push(this.getBlockSpace(bl+2) + 
		 	'if (exist(' + filePath + ',\'file\'))');	
	cmd.push(this.getBlockSpace(bl+3) + 
				'hdf5write(' + filePath + ',[handle varName] , ' + this.objName() + '.(varName)' +
						', \'WriteMode\', \'append\' );');
	cmd.push(this.getBlockSpace(bl+2) + 
		 	'else');	
	cmd.push(this.getBlockSpace(bl+3) + 
				'hdf5write(' + filePath + ',[handle varName] , ' + this.objName() + '.(varName)' +
						');');
	cmd.push(this.getBlockSpace(bl+2) + 
			'end');
	cmd.push(this.getBlockSpace(bl+1) + 
		'end');
	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.saveToHDF5HandleItemAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function saveToHDF5HandleItemAtomicArray(' + this.objName() + ', handle, varName)');

	 /* single atomic type value */
	cmd.push(this.getBlockSpace(bl+1) + 
	 	 this.objName() + '.saveToHDF5HandleItemAtomicSingle(handle,varName)');

	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.saveToHDF5HandleItemNonAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function saveToHDF5HandleItemNonAtomicSingle(' + this.objName() + ', handle, varName)');

	 /* single non-atomic type value */
	cmd.push(this.getBlockSpace(bl+1) + 
	 	'if (' + this.objName() + '.isSet(varName))');
	cmd.push(this.getBlockSpace(bl+2) + 
 			'if (' + this.objName() + '.isContained(varName))');
	cmd.push(this.getBlockSpace(bl+3) + 
			this.objName() + '.(varName).' + this.makeInternal("FilePath") + ' = ' + 
			this.objName() + '.' + this.makeInternal("FilePath") + ';');
	
	cmd.push(this.getBlockSpace(bl+3) + 
				this.objName() + '.(varName).saveToHDF5Handle([handle \'/\' varName \'/\']);');
	cmd.push(this.getBlockSpace(bl+2) + 
			'else');
	/*
	cmd.push(this.getBlockSpace(bl+2) +
			'dset = maindgrp.create_dataset("values"' + ',(len(getattr(self,varName)),), dtype=ref_dtype )' );
	cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
			 'dset' + loopBlock.indArray + ' = dgrp.ref');
			 */
	cmd.push(this.getBlockSpace(bl+3) +
				'error(\'referenced single value is not implemented.\')' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'end');
	cmd.push(this.getBlockSpace(bl+1) + 
		'end');
	/* put the reference in place*/ 
	/*cmd.push(this.getBlockSpace(bl+1) + 
			 'handle[' + JSON.stringify(prop.name) + '] = dgrp.ref');
			 */

	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.saveToHDF5HandleItemNonAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function saveToHDF5HandleItemNonAtomicArray(' + this.objName() + ', handle, varName)');

	/*
	cmd.push(this.getBlockSpace(bl+1) + 
		'ref_dtype = h5py.special_dtype(ref=h5py.Reference)' );
	*/			

	var properties = this.getProperties();
	var propNum = properties.length;
	
	var filePath = this.objName() + '.' + this.makeInternal('FilePath');
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i]; 
		
		if ( (!(this.isAtomicType(prop.type))) && (this.isArray(prop)) ) {
		cmd.push(this.getBlockSpace(bl+1) + 
		'if (strcmp(varName, ' + this.stringify(prop.name) + ') && ' + this.objName() + '.isSet(varName))' );
		/*
		cmd.push(this.getBlockSpace(bl+2) + 
			'maindgrp = handle.create_group(' + JSON.stringify(prop.name) + ')');
		cmd.push(this.getBlockSpace(bl+2) +
			'dset = maindgrp.create_dataset("values"' + ',(len(getattr(self,varName)),), dtype=ref_dtype )' );
		 */


		cmd.push(this.getBlockSpace(bl+2) + 
	 			'order = {};');

		cmd.push(this.getBlockSpace(bl+2) + 
	 			'if (' + this.objName() + '.isContained(varName))');
		
		var loopBlock = this.loopBlockForArray(bl+3,prop);
		cmd.push(loopBlock.cmd);
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
					'item = ' + this.objName() + '.' + this.makePrivate(prop.name) + 
						'{' +loopBlock.indArray + '};'	);	
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
					'item.' + this.makeInternal("FilePath") + ' = ' + 
					this.objName() + '.' + this.makeInternal("FilePath") + ';');
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
					'path = [handle \'/\' ' + this.stringify(prop.name) + ' \'/\' item.name ];');	
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
					'item.saveToHDF5Handle([path \'/\']);' );		
		cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
					'order{end+1} = item.name;' 
				);
		cmd.push(loopBlock.ends);

		/*
		cmd.push(this.getBlockSpace(bl+3) + 
				'hdf5write(' + filePath + ',[handle ' + this.stringify(prop.name) + ' \'/values\' ] , refs' +
				', \'WriteMode\', \'append\' );'
				);
		 */
		
		cmd.push(this.getBlockSpace(bl+3) + 
				'h5writeatt(' + filePath + ',handle,\'order\', order);'	);
		
		cmd.push(this.getBlockSpace(bl+2) + 
				'else');
		cmd.push(this.getBlockSpace(bl+3) +
					'error(\'referenced array is not implemented.\')' );
		cmd.push(this.getBlockSpace(bl+2) + 
				'end');

			/* put the reference in place*/ 
			/*
			cmd.push(this.getBlockSpace(loopBlock.bl+1) + 
				 'dset' + loopBlock.indArray + ' = dgrp.ref');
			*/
		/*	
		cmd.push(this.getBlockSpace(bl+2) + 
			'self._saveToHDF5HandleItemAttrs(handle, varName)' );
		*/

		cmd.push(this.getBlockSpace(bl+1) + 
		'end');
		}
	}
	
	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.saveToHDF5HandleItemAttrs = function(bl) {
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
			'itemMAP = getattr(self, this.modelDesAtt()+varName)');
	cmd.push(this.getBlockSpace(bl+2) + 
			'for item in ' + JSON.stringify(this.getStorableAttrs()) + ':');
	cmd.push(this.getBlockSpace(bl+3) +
				'if item in itemMAP.keys():');
	cmd.push(this.getBlockSpace(bl+4) + 
					'handle[varName].attrs[item] = itemMAP[item]');

	cmd.push(this.getBlockSpace(bl+2) + 
			'handle[varName].attrs["MAP"] = str(getattr(self,"MAP"+varName))');

	cmd.push(this.getBlockSpace(bl+2) + 
			'pass');

    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.loadFromHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function loadFromHDF5Handle(' + this.objName() + ', handle)');
	
	/*
	cmd.push(this.getBlockSpace(bl+1) + 
		'self.checkFileCompatibility(handle)' );
	cmd.push(this.getBlockSpace(bl+1));
	 */


	cmd.push(this.getBlockSpace(bl+1) + 
			this.objName() + '.loadDataFromHDF5Handle(handle);' );
	
	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
	cmd.push(this.getBlockSpace(bl+1));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.loadDataFromHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	/*==================================================*/
	cmd.push(this.getBlockSpace(bl) + 
	'function loadDataFromHDF5Handle(' + this.objName() + ', handle)');
	
	/*
	if (this.isDerived()) {
		cmd.push(this.getBlockSpace(bl+1) +
		'super(' + this.getClassName() + ', self)._loadDataFromHDF5Handle(handle)');
		cmd.push(this.getBlockSpace(bl+1) + '');
	}
	*/
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  

		/* reading the value */
		if (this.isAtomicType(prop.type)) {
			if(this.isArray(prop)){
				/* array of atomic type */
				cmd.push(this.getBlockSpace(bl+1) + 
						this.objName() + '.loadFromHDF5HandleItem(handle, ' + 
							this.stringify(prop.name) + ', \'AtomicArray\');' );
			 }
			 else{
				 /* single atomic type value */
				cmd.push(this.getBlockSpace(bl+1) + 
						this.objName() + '.loadFromHDF5HandleItem(handle, ' + 
							this.stringify(prop.name) + ', \'AtomicSingle\');' );
			 }
		}
		else {
			/*creating references and saving other complex types 
			 * 'value' will be a or an array of references */
			
			/*create a subgroup for the contained values */

			if(this.isArray(prop)){
				/* array non-atomic type reference */
				 cmd.push(this.getBlockSpace(bl+1) + 
						 this.objName() + '.loadFromHDF5HandleItem(handle, ' + 
						 	this.stringify(prop.name) + ', \'NonAtomicArray\');' );
				 
			 }
			 else{
				 /* single non-atomic type reference */
				 cmd.push(this.getBlockSpace(bl+1) + 
						 this.objName() + '.loadFromHDF5HandleItem(handle, ' + 
						 	this.stringify(prop.name) + ', \'NonAtomicSingle\');' );
			 }

		}

		cmd.push(this.getBlockSpace(bl+1));

	}
	
	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.loadFromHDF5HandleItem = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function loadFromHDF5HandleItem(' + this.objName() + ', handle, varName, type)');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'loadFlag = true;');
		
	//cmd.push(this.getBlockSpace(bl+1) + 
	//		'if (varName in self._sync.keys()):');
	//cmd.push(this.getBlockSpace(bl+2) + 
	//			'if (self._sync[varName] == 1):');
	//cmd.push(this.getBlockSpace(bl+3) + 
	//			'saveFlag = True');	

	cmd.push(this.getBlockSpace(bl+1) + 
		'if (loadFlag)');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (strcmp(type, \'AtomicSingle\'))');
	cmd.push(this.getBlockSpace(bl+3) + 
				this.objName() + '.loadFromHDF5HandleItemAtomicSingle(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'elseif (strcmp(type, \'AtomicArray\'))');
	cmd.push(this.getBlockSpace(bl+3) + 
				this.objName() + '.loadFromHDF5HandleItemAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'elseif (strcmp(type, \'NonAtomicArray\'))');
	cmd.push(this.getBlockSpace(bl+3) + 
				this.objName() + '.loadFromHDF5HandleItemNonAtomicArray(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'elseif (strcmp(type, \'NonAtomicSingle\'))');
	cmd.push(this.getBlockSpace(bl+3) + 
				this.objName() + '.loadFromHDF5HandleItemNonAtomicSingle(handle, varName)' );
	cmd.push(this.getBlockSpace(bl+2) + 
			'end');
	cmd.push(this.getBlockSpace(bl+1) + 
		'end');	
		
	/*loading non-value attributes */
	//cmd.push(this.getBlockSpace(bl+2) + 
	//		'self.loadFromHDF5HandleItemAttrs(handle, varName)' );
	
	/*
	cmd.push(this.getBlockSpace(bl+2) + 
			'self._sync[varName] = -1' );
	*/
		 
	cmd.push(this.getBlockSpace(bl+1));

	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
    

};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.loadFromHDF5HandleItemAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	var filePath = this.objName() + '.' + this.makeInternal('FilePath');
	
	cmd.push(this.getBlockSpace(bl) + 
	'function loadFromHDF5HandleItemAtomicSingle(' + this.objName() + ', handle, varName)');

	 /* single atomic type value */
	cmd.push(this.getBlockSpace(bl+1) + 
		'try');
	cmd.push(this.getBlockSpace(bl+2) + 
			this.objName() + '.(varName) = h5read(' + filePath + ', [handle \'/\' varName]);' );
	cmd.push(this.getBlockSpace(bl+1) + 
		'catch');
	cmd.push(this.getBlockSpace(bl+1) + 
		'end' );

	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.loadFromHDF5HandleItemAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function loadFromHDF5HandleItemAtomicArray(' + this.objName() + ', handle, varName)');

	/* array of atomic type */
	cmd.push(this.getBlockSpace(bl+1) + 
			this.objName() + '.loadFromHDF5HandleItemAtomicSingle(handle, varName);');
	
	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatlabBase.prototype.loadFromHDF5HandleItemNonAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function loadFromHDF5HandleItemNonAtomicSingle(' + this.objName() + ', handle, varName)');

	cmd.push(this.getBlockSpace(bl+1) + 
		this.objName() + '.(varName).' + this.makeInternal("FilePath") + ' = ' + 
		this.objName() + '.' + this.makeInternal("FilePath") + ';');
	
	 /* single atomic type value */
	 cmd.push(this.getBlockSpace(bl+1) + 
	 	'try');
	 cmd.push(this.getBlockSpace(bl+2) + 
			 this.objName() + '.(varName).loadFromHDF5Handle([handle varName \'/\'])');
	 cmd.push(this.getBlockSpace(bl+1) + 
		'catch');
	 cmd.push(this.getBlockSpace(bl+1) + 
		'end' );

	cmd.push(this.getBlockSpace(bl) + 
	'end');
		
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
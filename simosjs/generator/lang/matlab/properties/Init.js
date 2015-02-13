/*----------------------------------------------------------------------------*/
function Init(){
};
exports.Init = Init;
/*----------------------------------------------------------------------------*/
Init.prototype.initPublicProperties = function(bl) {
	var cmd = [];
	cmd.push(this.gbl(bl) +	'ID = UUIDGenerator.generate_guid()');
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.initPublicConstantProperties = function(bl) {
	var cmd = [];
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.initPublicConstantHiddenProperties = function(bl) {
	var cmd = [];
	/*
	cmd.push(this.gbl(bl) + 
		this.modelDesAtt() + 'str');	
	*/
	
	var modelStr = JSON.stringify(this.getModel(),  null, '\t');
	modelStr = modelStr.replace(/\'/g, '\'\'');
	modelStr = modelStr.split('\n').join('\' ...\n \'')
	
	cmd.push(this.gbl(bl) + 
			this.modelDesAtt() + 'str = [\'' +
			(modelStr) + '\'];');

	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.initPublicDependentProperties = function(bl) {
	 
	var cmd = [];
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	cmd.push(this.gbl(bl) + 
			this.modelDesAtt() );
	cmd.push(this.gbl(bl));
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];

		/*initializing other properties */
		cmd.push(this.gbl(bl) + 
		prop.name + ' = ' + this.getPropertyValue(prop) + ';');
		
		/*
		if (!(this.isAtomic(prop)) && (this.isContained(prop)) ){
			cmd.push(this.getInitObject(bl+1, prop));
		}
		*/
		/*
		cmd.push(this.gbl(bl+1) + 
				'self.' + this.modelDesAtt(prop.name ) + ' = ' + JSON.stringify(prop) );
		*/
		

	}
	cmd.push(this.gbl(bl));
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.initPublicHiddenProperties = function(bl) {
	
	var cmd = [];

	/*add one property for the filepath */

	cmd.push(this.gbl(bl) + 
		'storageBackEndType');	
	
	cmd.push(this.gbl(bl) + 
			this.makeInternal('FilePath') + ' = \'\';');

    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.initPrivateProperties = function(bl) {
	 
	var cmd = [];
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];

		/*initializing other properties */
		cmd.push(this.gbl(bl) + 
		this.makePrivate(prop.name) + ' = ' + this.getPropertyValue(prop) + ';');
		
		/*
		if (!(this.isAtomic(prop)) && (this.isContained(prop)) ){
			cmd.push(this.getInitObject(bl+1, prop));
		}
		*/
		/*
		cmd.push(this.gbl(bl+1) + 
				'self.' + this.modelDesAtt(prop.name ) + ' = ' + JSON.stringify(prop) );
		*/
		cmd.push(this.gbl(bl));

	}


    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.getPropertyValue = function(prop) {
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
Init.prototype.constructorFunc = function(bl) {
	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'function ' + this.objName() + ' = ' + this.getClassName() + '(name)');
	
	/*initializing other properties */
	cmd.push(this.gbl(bl+1) + 
		'if ~(exist(\'name\',\'var\')) ');
	cmd.push(this.gbl(bl+2) + 
			'name = ' + this.stringify(this.objName()) + '; ');	
	cmd.push(this.gbl(bl+1) + 
		'end ');
	
	cmd.push(this.gbl(bl+1) + 
		this.objName() + '.name = name;');

	
	/*initialize properties*/
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		
		if (this.isArray(prop) && this.isAtomic(prop) ){
				cmd.push(this.gbl(bl+1) + 
				this.objName() + '.' + prop.name + ' = ' + 
				'zeros(' + this.getArrayShape(prop) + ');');				
		
		}
		
		if (this.isSingle(prop) && (!this.isAtomic(prop)) && 
			this.isContained(prop) && (!this.isOptional(prop)) ){
				cmd.push(this.gbl(bl+1) + 
				this.objName() + '.renew' + this.firstToUpper(prop.name) + '();');				
		
		}
		
	}
	

	cmd.push(this.gbl(bl) + 
	'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.initObjectList = function(prop, bl) {
	
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
		cmd.push(this.gbl(loopBlock.bl+1) + 
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
/*----------------------------------------------------------------------------*/
function Init(){
};
exports.Init = Init;
/*----------------------------------------------------------------------------*/
Init.prototype.initPublicProperties = function(bl) {
	var cmd = [];
	cmd.push(this.gbl(bl) +	'ID = simos.external.UUIDGenerator.generate_guid()');
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
	
	cmd.push(this.gbl(bl) + this.modelDesAtt() );
	cmd.push(this.gbl(bl));
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];

		/*initializing other properties, present them only if they are not grouped */
		if (!this.isGrouped(prop))
			//cmd.push(this.gbl(bl) + prop.name + ' = ' + this.getPropertyValue(prop) + ';');
			cmd.push(this.gbl(bl) + prop.name + ';');
		
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

	cmd.push(this.gbl(bl) + 'storageBackEndType');	
	
	cmd.push(this.gbl(bl) + this.makeInternal('FilePath') + ' = \'\';');
	cmd.push(this.gbl(bl) + this.makeInternal('Handle') + ' = \'\';');

	
	var properties = this.getProperties();
	var propNum = properties.length;
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		/* initializing hidden grouped properties */
		if (this.isGrouped(prop))
			cmd.push(this.gbl(bl) + prop.name + ' = ' + this.getPropertyValue(prop) + ';');
	}
	cmd.push(this.gbl(bl));
    
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
			if (this.isAtomic(prop) && !this.isString(prop)){				
				//return '[]';
				return 'zeros(' + this.getArrayShape(prop) + ');';				
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
			if (this.isSingle(prop)) {
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
			else { //array
				if (prop.value instanceof Array) {
					var dimL = this.getDimensionList(prop);
					if (dimL.length == 1){
						if (this.isNumeric(prop))
							return ('[' + prop.value.join(", ") + ']' );
						else 
							return ('{' + "\'" + prop.value.join("\', \'") + "\'" + '}' );
					}
					else if (dimL.length == 2) {
						var arrStr = "";
						for (var dimi=0; dimi<prop.value.length; dimi++) {
							if (this.isNumeric(prop))
								arrStr += (prop.value[dimi].join(", ") + ';' );
							else
								arrStr += ( "\'" + prop.value[dimi].join("\', \'") + "\'" + ';' );								
						}	
						if (this.isNumeric(prop))
							return ('[' + arrStr + ']' );
						else
							return ('{' + arrStr + '}' );
					}
					else if (dimL.length > 2){
						throw "ERROR: iniialization for arrays with rank larger than 2 is not supported." 
					}		
					else
						return "";
				}
				else {
					if (this.isNumeric(prop))
						return ('[' + prop.value + ']' );
					else {	//string
						var cols = prop.value.split(";");
						var strCols = [];
						for (var coli=0; coli<cols.length; coli++) {
							var rows = cols[coli].split(",");
							var strRows = [];
							for (var rowi=0; rowi<rows.length; rowi++) {
								strRows.push(this.stringify( rows[rowi] ));
							}
							strCols.push(strRows.join(", "));
						}
						return ('{' + strCols.join("; ") + '}' );
					}
				}
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
		
		//if (this.isArray(prop) && this.isAtomic(prop) && !this.isString(prop) && (prop.value == undefined)){
		//		cmd.push(this.gbl(bl+1) + 
		//		this.objName() + '.' + prop.name + ' = ' + 
		//		'zeros(' + this.getArrayShape(prop) + ');');					
		//}
		
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

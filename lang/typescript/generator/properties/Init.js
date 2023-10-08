/*----------------------------------------------------------------------------*/
function Init(){
};
exports.Init = Init;
/*----------------------------------------------------------------------------*/
Init.prototype.getInitObjectList = function(prop) {
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
Init.prototype.getAtomicInitValue = function(prop) {
	if (this.isString(prop))
		return this.stringify("");
	else if (prop.type == 'number')
		return '0.0';
	else
		return '0.0';
};
/*----------------------------------------------------------------------------*/
Init.prototype.getPropertyInitValue = function(bl, prop) {
	/*
	 * return properties default value, if property is an object (complex type),
	 * it returns the command to instantiate that object.
	 */
	
	if (prop.name == 'type') {
		return (this.gbl(bl) + 
					'value = ' +  JSON.stringify(this.getClassPathFromType(this.getModel().type)) + ';' );
	}

	if(prop.value == undefined){
		if (this.isArray(prop)) {
			if (this.isAtomic(prop)){
				var cmds = [];

				var dimList = this.getTSArrayDimList(prop);
				var init_arr_head = '';
				var init_arr_foot = '';
				for (var dimi=0; dimi<dimList.length; dimi++){
					init_arr_head = init_arr_head + 'Array(' + dimList[dimi] + ').fill(false).map(() =>';
					init_arr_foot = init_arr_foot + ')';
				}	

				cmds.push(this.gbl(bl) + 
					'value = ' + init_arr_head + this.getAtomicInitValue(prop) + init_arr_foot + ';' );
						
				return cmds.join('\n');
			}
			else {
				if (this.isContained(prop)){
					// return this.getInitObjectList(prop);
					return (this.gbl(bl) +
							'value =  []');
				}
				else {
					return (this.gbl(bl) +
						'value =  []');
				}
				
			}
		}
		else if (!(this.isAtomic(prop)) && 
				  (this.isContained(prop)) && 
				 !(this.isOptional(prop))){
			return (this.gbl(bl) +
					'value = new ' + 
						this.getTypeID(prop.type) + '(' + JSON.stringify(prop.name) +')');
		}
		else {
			return (this.gbl(bl) +
					'value = ' + this.firstToUpper(this.changeType(prop.type)) + '(' + JSON.stringify(prop.value) + ')');
		}
	}
	else {
		if (this.isAtomic(prop)){
			if (this.isSingle(prop)) {
					return (this.gbl(bl) +
							'value = ' + this.firstToUpper(this.changeType(prop.type)) + '(' + JSON.stringify(prop.value) + ')');
			}
			else {
				/* array with predefined values and fixed dimension,
				 * check for dimensions
				 * cast value types, must be presented as an array in JSON
				 * with correct type*/
				
				if (prop.value instanceof Array)
					return (this.gbl(bl) + 
						'value ='+  this.stringify(prop.value) );
				else{
					/*initialize all elements with a single value */
					var cmds = [];

					var dimList = this.getTSArrayDimList(prop);
					var init_arr_head = '';
					var init_arr_foot = '';
					for (var dimi=0; dimi<dimList.length; dimi++){
						init_arr_head = init_arr_head + 'Array(' + dimList[dimi] + ').fill(false).map(() =>';
						init_arr_foot = init_arr_foot + ')';
					}	

					cmds.push(this.gbl(bl) + 
						'value = ' + init_arr_head + prop.value + init_arr_foot + ';' );
							
					return cmds.join('\n');
				}

			}
		}
		else {
			if (this.isSingle(prop)) {
				if (!(this.isAtomic(prop)) && 
					 (this.isContained(prop)) && 
					!(this.isOptional(prop)) ){
						
					return (this.gbl(bl) +
							'value = new ' + 
							this.getTypeID(prop.type) + '(' + JSON.stringify(prop.name) +')');
				}
				else {
					//return (this.gbl(bl) +
					//		'self.' + this.getPropertyPrivateName(prop) + '=' + 'None');
					return('');
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
Init.prototype.propInitValueFuncs = function(bl) {
	/*
	 * return properties default value, if property is an object (complex type),
	 * it returns the command to instantiate that object.
	 */
	
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	var properties = this.getProperties();
	
	for(var i = 0, len = properties.length; i < len; i++) {
		var prop = properties[i];
		
		var tsPropType = this.getTSPropType(prop);

		cmd.push(this.gbl(bl) + '_init_value_' + prop.name + '(): ' + tsPropType + '{');
		cmd.push(this.gbl(bl+1) + 'let value:any;');
		cmd.push(this.getPropertyInitValue(bl+1, prop));
		cmd.push(this.gbl(bl+1) + 'return value;');
		cmd.push(this.gbl(bl) + '}');

	}
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.classConstructor = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	if (this.hasProperty("name"))
		cmd.push(this.gbl(bl) + 	'constructor(name="name") {');
	else 
		cmd.push(this.gbl(bl) + 	'constructor() {');


	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		if (prop.name == "name") {
			/* initializing name */		
			cmd.push(this.gbl(bl+1) + 
					'this.' + this.getPropertyPrivateName(prop) + '= this._init_value_' + prop.name + '();');	
			cmd.push(this.gbl(bl+1) + 
					'if (!(name == "name"))');			
			cmd.push(this.gbl(bl+2) + 
						'this.' + this.getPropertyPrivateName(prop) + ' = name; ');			
		}
		else {
			/* initializing other properties */
			cmd.push(this.gbl(bl+1) + 
					'this.' + this.getPropertyPrivateName(prop) + '= this._init_value_' + prop.name + '();');
		}
		
		//cmd.push(this.gbl(bl+1) + 
		//		'self.' + this.modelDesAtt(prop) + ' = ' + strProp );

		//cmd.push(this.gbl(bl+1));

	}
	
	//cmd.push(this.gbl(bl+1) + 'self.OBJattrs = collections.OrderedDict()'); 

	//var ungroups = this.getUngroups();
	//var ungroupTypes = [];
	//for (var i = 0; i < ungroups.length; i++)
	//    ungroupTypes.push(ungroups[i].type);
	
	//cmd.push(this.gbl(bl+1) + 'self._ungroupTypes = ["' + ungroupTypes.join('", "') + '"]');
	
	cmd.push('//------------------------------------------------------------------------------');
	cmd.push(this.getUserDefinedCode("init"));
	cmd.push('//------------------------------------------------------------------------------');

	cmd.push(this.gbl(bl) + '}');

	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
Init.prototype.getTSPropType = function(prop) {
	var tsPropType = '';
	if (this.isAtomic(prop))
		tsPropType = this.changeType(prop.type);
	else 
		tsPropType = 'any';

	// if (this.isArray(prop)) {
	// 	var dimList = this.getDimensionList(prop);
	// 	var arrHeader = '';
	// 	var arrFooter = '';
		
	// 	for (var dimi=0; dimi<dimList.length; dimi++){
	// 		arrHeader = arrHeader + 'Array<';
	// 		arrFooter = arrFooter + '>';
	// 	}
		
	// 	tsPropType = arrHeader + tsPropType +arrFooter ; 
	// }				

	if (this.isArray(prop)) {
		var dimList = this.getDimensionList(prop);
		
		for (var dimi=0; dimi<dimList.length; dimi++){
			tsPropType = tsPropType + '[]';
		}		
	}
	return tsPropType;
}
/*----------------------------------------------------------------------------*/
Init.prototype.classPropTypes = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
		
	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var tsPropType = this.getTSPropType(prop);
		cmd.push(this.gbl(bl+1) + 	prop.name + ': ' + tsPropType + ';'); 			

	}
	
	cmd.push('//------------------------------------------------------------------------------');
	cmd.push(this.getUserDefinedCode("prop"));
	cmd.push('//------------------------------------------------------------------------------');


	return cmd.join('\n');
};

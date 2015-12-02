/*----------------------------------------------------------------------------*/
function Init(){
};
exports.Init = Init;

/*----------------------------------------------------------------------------*/
Init.prototype.defaultInitDeclaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "generic, public :: default_init => default_initFromSingle, default_initFromSingleWiName");
	cmd.push(this.gbl(bl) + "procedure :: default_initFromSingle");
	cmd.push(this.gbl(bl) + "procedure :: default_initFromSingleWiName");
	//cmd.push(this.gbl(bl) + "procedure,public :: default_initFromArray");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
Init.prototype.defaultInit = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine default_initFromSingleWiName(this, insName)");
	cmd.push(this.gbl(bl+1) + 	"class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + 	"character(*), intent(in) :: insName");
	cmd.push(this.gbl(bl+1) + 	"");
	cmd.push(this.gbl(bl+1) + 	"call this%default_initFromSingle()");
	cmd.push(this.gbl(bl+1) + 	"! Set the default name of the object");
	cmd.push(this.gbl(bl+1) + 	"call this%set_name(insName)");
	cmd.push(this.gbl(bl) + "end subroutine default_initFromSingleWiName");
	cmd.push(this.gbl(bl) + "");

	
	cmd.push(this.gbl(bl) + "subroutine default_initFromSingle(this)");
	cmd.push(this.gbl(bl+1) + 	"class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + 	"");
	cmd.push(this.gbl(bl+1) + 	"! Set the default name of the object");
	cmd.push(this.gbl(bl+1) + 	"call this%set_name('"  + this.getName() +  "')");
	
	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;

	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		if ( (this.isSingle(prop)) && (! this.isAtomic(prop)) && (! this.isOptional(prop)) ) {
		    cmd.push(this.gbl(bl+1) + 	"call this%"  + prop.name +  "%default_initFromSingleWiName('" + prop.name + "')");
		}
	}
	cmd.push(this.gbl(bl) + "end subroutine default_initFromSingle");
	cmd.push(this.gbl(bl) + "");

	/*
	cmd.push(this.gbl(bl) + "subroutine default_initFromArray(this,nameOfArray)");
	cmd.push(this.gbl(bl+1) + 	"class(" + this.getTypeName() + "), dimension(:)"+ " :: this");
	cmd.push(this.gbl(bl+1) + 	"type(String), intent(in) :: nameOfArray");
	cmd.push(this.gbl(bl+1) + 	"integer :: idx");
	cmd.push(this.gbl(bl+1) + 	"");
	cmd.push(this.gbl(bl+1) + 	"! Set the default name of the array components");
	cmd.push(this.gbl(bl+1) + 	"do idx=1,size(this,1)");
	cmd.push(this.gbl(bl+2) + 		"call this(idx)%set_name(nameOfArray + '_' + toString(idx))");
	cmd.push(this.gbl(bl+1) + 	"end do");
	cmd.push(this.gbl(bl) + "end subroutine default_initFromArray");
	 */
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.propertiesDeclaration = function(bl) {
	/*
	 * return properties declaration
	 */

	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;

	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var decStr = '';

		if ( (this.isSingle(prop)) && (this.isAtomic(prop) && prop.type != 'string') ){
			decStr = this.changeType(prop.type); 
		}
		else if ( (this.isSingle(prop)) && (prop.type == 'string') ){
			decStr = 'type(' + this.changeType(prop.type) + ')';
		}
		else if ( (this.isArray(prop)) && (this.isAtomic(prop) && prop.type != 'string') ) {
			decStr = this.changeType(prop.type) + ', dimension(' + this.getFortDimensionList(prop) +')';
		}
		else if ( (this.isArray(prop)) && (prop.type == 'string') ) {
			decStr = 'type(' + this.changeType(prop.type) + ')' + ', dimension(' + this.getFortDimensionList(prop) +')';
		}
		else if ( (this.isSingle(prop)) && (! this.isAtomic(prop)) ) {
			decStr = 'type(' + this.getClassPathFromType(prop.type) + ')';
		}
		else if ( (this.isArray(prop)) && (! this.isAtomic(prop)) ) {
			decStr = 'type(' + this.getClassPathFromType(prop.type) + ')' + ', dimension(' + this.getFortDimensionList(prop) +')';
		}
		else if ( (this.isArray(prop)) && (prop.type == 'dstring') ) {
			console.log("special treatment of array of dynamic strings");
		} 
		else
			throw("combination for property not found : " + JSON.stringify(prop) );

		if (this.isAllocatable(prop)) {
			decStr = decStr + ', allocatable';
		}
		if (this.isPublic(prop)) {
			decStr = decStr + ', public';
		}
		cmd.push(this.gbl(bl) + decStr + ' :: ' + prop.name + '    !' + prop.description); 

		/*
        if (this.isArray(prop) && this.isAllocatable(prop)) {
            //add dimension variables
            var dimNames = this.getDimensionVarNames(prop);
            for (var di=0; di<dimNames.length; di++) {
                var dimDesc = this.changeType("integer");
                if (this.isPublic(prop)) {
                    dimDesc = dimDesc + ', public';
                }
                cmd.push(this.gbl(bl) + dimDesc + ' :: ' + dimNames[di] + '    !' + di + " dimension of " + prop.name); 
            }
        }
		 */
	}

	return cmd.join('\n');
};

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
	else if (prop.type == 'integer')
		return '0';
	else
		return '0.0';
};
/*----------------------------------------------------------------------------*/
Init.prototype.getPropertyInit = function(bl, prop) {
	/*
	 * return properties default value, if property is an object (complex type),
	 * it returns the command to instantiate that object.
	 */

	if(prop.value == undefined){
		if (this.isArray(prop)) {
			if (this.isAtomic(prop)){
				var cmds = [];
				cmds.push(this.gbl(bl) + 
						'self.' + this.getPropertyPrivateName(prop) + '=' + 'np.empty(shape=(' + 
						this.getPythonArrayDimList(prop).join() + 
						'), dtype=' + this.changeType(prop.type) + ')' );
				cmds.push(this.gbl(bl) + 
						'self.' + this.getPropertyPrivateName(prop) + 
						'.fill(' + this.getAtomicInitValue(prop)+ ')' );
				return cmds.join('\n');
			}
			else {
				if (this.isContained(prop)){
					// return this.getInitObjectList(prop);
					return (this.gbl(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '= []');
				}
				else {
					return (this.gbl(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '= []');
				}

			}
		}
		else if (!(this.isAtomic(prop)) && 
				(this.isContained(prop)) && 
				!(this.isOptional(prop))){
			return (this.gbl(bl) +
					'self.' + this.getPropertyPrivateName(prop) + '=' + 
					this.getClassPathFromType(prop.type) + '(' + JSON.stringify(prop.name) +')');
		}
		else {
			return (this.gbl(bl) +
					'self.' + this.getPropertyPrivateName(prop) + '= None' );
		}
	}
	else {
		if (this.isAtomic(prop)){
			if (this.isSingle(prop)) {
				if (prop.type == "boolean") {
					return (this.gbl(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '=' + 
							this.changeType(prop.type) + '(' + this.changeType("integer") + '(' + JSON.stringify(prop.value) + ')' + ')');
				}
				else {
					return (this.gbl(bl) +
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
					return (this.gbl(bl) + 
							'self.' + this.getPropertyPrivateName(prop) + '=' + 'np.array(' + this.stringify(prop.value) +
							', dtype=' + this.changeType(prop.type) + ')' );
				else{
					/*initialize all elements with a single value */
					var cmds = [];
					cmds.push(this.gbl(bl) + 
							'self.' + this.getPropertyPrivateName(prop) + '=' + 'np.empty(shape=(' + 
							this.getPythonArrayDimList(prop).join() + 
							'), dtype=' + this.changeType(prop.type) + ')' );
					cmds.push(this.gbl(bl) + 
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
					return (this.gbl(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '=' + 
							this.getClassPathFromType(prop.type) + '(' + JSON.stringify(prop.name) +')');
				}
				else {
					return (this.gbl(bl) +
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
Init.prototype.propInitValueFuncs = function(bl, prop) {
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

		cmd.push(this.gbl(bl) + 'def _getInitValue' + this.firstToUpper(prop.name) + '(self):');

		if(prop.value == undefined){
			if (this.isArray(prop)) {
				if (this.isAtomic(prop)){

					cmd.push(this.gbl(bl+1) + 
							'val = np.empty(shape=(' + 
							this.getPythonArrayDimList(prop).join() + 
							'), dtype=' + this.changeType(prop.type) + ')' );
					cmd.push(this.gbl(bl+1) + 
							'val.fill(' + this.getAtomicInitValue(prop)+ ')' );

				}
				else {
					if (this.isContained(prop)){
						// return this.getInitObjectList(prop);
						cmd.push(this.gbl(bl+1) +
								'val = []');
					}
					else {
						cmd.push(this.gbl(bl+1) +
								'val = []');
					}

				}
			}
			else if (!(this.isAtomic(prop)) && 
					(this.isContained(prop)) && 
					!(this.isOptional(prop))){
				cmd.push(this.gbl(bl+1) +
						'val =' + 
						this.getClassPathFromType(prop.type) + '(' + this.stringify(prop.name) +')');
			}
			else {
				cmd.push(this.gbl(bl+1) +
						'val = None' );
			}
		}
		else {
			if (this.isAtomic(prop)){
				if (this.isSingle(prop)) {
					if (prop.type == "boolean") {
						cmd.push(this.gbl(bl+1) +
								'val =' + 
								this.changeType(prop.type) + '(' + this.changeType("integer") + '(' + this.stringify(prop.value) + ')' + ')');
					}
					else {
						cmd.push(this.gbl(bl+1) +
								'val =' + 
								this.changeType(prop.type) + '(' + this.stringify(prop.value) + ')');
					}
				}
				else {
					/* array with predefined values and fixed dimension,
					 * check for dimensions
					 * cast value types, must be presented as an array in JSON
					 * with correct type*/

					if (prop.value instanceof Array)
						cmd.push(this.gbl(bl+1) +
								'val = np.array(' + this.stringify(prop.value) +
								', dtype=' + this.changeType(prop.type) + ')' );
					else{
						/*initialize all elements with a single value */
						cmd.push(this.gbl(bl+1) +
								'val = np.empty(shape=(' + 
								this.getPythonArrayDimList(prop).join() + 
								'), dtype=' + this.changeType(prop.type) + ')' );
						cmd.push(this.gbl(bl+1) + 
								'val.fill(' + this.changeType(prop.type) +'(' + this.stringify(prop.value) + '))' );
					}

				}
			}
			else {
				if (this.isSingle(prop)) {
					if (!(this.isAtomic(prop)) && 
							(this.isContained(prop)) && 
							!(this.isOptional(prop)) ){
						cmd.push(this.gbl(bl+1) +
								'val =' + 
								this.getClassPathFromType(prop.type) + '(' + this.stringify(prop.name) +')');
					}
					else {
						cmd.push(this.gbl(bl+1) +
								'val = None');
					}
				}
				else {
					/* array */
					throw "array of objects can not be predefined.";
				}

			}


		}

		if (!this.isAtomic(prop) 		&&  this.isContained(prop) && 
				this.hasAssignments(prop)  && !this.isOptional(prop) && this.isSingle(prop)){
			var assign = this.getAssignments(prop);
			cmd.push(this.assignPropertyValue(bl+1, assign, 'val'));
		}

		cmd.push(this.gbl(bl+1) + 
				'return val' );

		cmd.push(this.gbl(bl));

	}

	return cmd.join('\n');
};

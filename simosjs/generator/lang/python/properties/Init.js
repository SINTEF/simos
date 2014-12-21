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
Init.prototype.classInit = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 	'def __init__(self,name=None):');

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
	
	cmd.push(this.getBlockSpace(bl+1) + 	'self.ID = str(uuid.uuid4())');
	cmd.push(this.getBlockSpace(bl+1) + 	'self._saved = {}');
	cmd.push(this.getBlockSpace(bl+1) + 	'self.REF = None');
	/* storage */
	cmd.push(this.getBlockSpace(bl+1) +		'self._sync = {}');
	cmd.push(this.getBlockSpace(bl+1) +		'self._STORAGE = None');
	//cmd.push(this.getBlockSpace(bl+1) +		'self._STORAGE = pyds.getDataStorageBackEndServer("hdf5")');
	//cmd.push(this.getBlockSpace(bl+1) +		'self._STORAGE.filePath = str(name) + ".h5"');

	cmd.push(this.getBlockSpace(bl+1) + 	'self._loadedItems = []');
	
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


	return cmd.join('\n');
};

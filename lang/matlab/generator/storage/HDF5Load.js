//var njs = require('../../njs')();

/*----------------------------------------------------------------------------*/
function HDF5Load(){
};
exports.HDF5Load = HDF5Load;
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadHDF5Func = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + 	'function loadHDF5(' + this.objName() + ',name, filePath, dsType,action)');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'filePath\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'filePath = strcat(' + this.objName() + '.name, \'.h5\'); ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'dsType\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'dsType = \'hdf5\'; ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'name\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'name = \'hdf5\'; ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'action\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'action = \'init\'; ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) +		this.objName() + '.storageBackEndType = \'hdf5\';');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 		this.objName() + '.' + this.makeInternal('FilePath') + ' = filePath;');
	cmd.push(this.gbl(bl+1) + 		'grpHandle = [\'/\' ' + this.objName() + '.name \'/\'];');
	cmd.push('		');
	cmd.push(this.gbl(bl+1) + 		'if (~exist(filePath,\'file\'))');
	cmd.push(this.gbl(bl+2) + 			'error([\'file \' filePath \' does not exist\']);');
	cmd.push(this.gbl(bl+1) + 		'end');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 		'if (strcmpi(' + this.objName() + '.storageBackEndType,\'hdf5\'))');
	cmd.push(this.gbl(bl+2) + 			this.objName() + '.loadFromHDF5Handle(grpHandle);');
	cmd.push(this.gbl(bl+1) + 		'else');
	cmd.push(this.gbl(bl+2) + 			'error([\'storage back-end \' ' + this.objName() + '.storageBackEndType \' is not defined.\']);');
	cmd.push(this.gbl(bl+1) + 		'end');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl) + 	'end');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function loadFromHDF5Handle(' + this.objName() + ', handle)');
	
	/*
	cmd.push(this.gbl(bl+1) + 
		'self.checkFileCompatibility(handle)' );
	cmd.push(this.gbl(bl+1));
	 */
	var filePath = this.objName() + '.' + this.makeInternal('FilePath');
	
	cmd.push(this.gbl(bl+1) + 	this.objName() + '.ID = h5readatt(' + filePath + ',handle,\'ID\');' );

	cmd.push(this.gbl(bl+1) + 	this.objName() + '.loadDataFromHDF5Handle(handle);' );
	
	cmd.push(this.gbl(bl) + 'end');
		
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadDataFromHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	/*==================================================*/
	cmd.push(this.gbl(bl) + 
	'function loadDataFromHDF5Handle(' + this.objName() + ', handle)');
	
	/*
	if (this.isDerived()) {
		cmd.push(this.gbl(bl+1) +
		'super(' + this.getClassName() + ', self)._loadDataFromHDF5Handle(handle)');
		cmd.push(this.gbl(bl+1) + '');
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
				cmd.push(this.gbl(bl+1) + 
						this.objName() + '.loadFromHDF5HandleItem(handle, ' + 
							this.stringify(prop.name) + ', \'AtomicArray\');' );
			 }
			 else{
				 /* single atomic type value */
				cmd.push(this.gbl(bl+1) + 
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
				 cmd.push(this.gbl(bl+1) + 
						 this.objName() + '.loadFromHDF5HandleItem(handle, ' + 
						 	this.stringify(prop.name) + ', \'NonAtomicArray\');' );
				 
			 }
			 else{
				 /* single non-atomic type reference */
				 cmd.push(this.gbl(bl+1) + 
						 this.objName() + '.loadFromHDF5HandleItem(handle, ' + 
						 	this.stringify(prop.name) + ', \'NonAtomicSingle\');' );
			 }

		}

		cmd.push(this.gbl(bl+1));

	}
	
	cmd.push(this.gbl(bl) + 
	'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5HandleItem = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'function loadFromHDF5HandleItem(' + this.objName() + ', handle, varName, type)');
	
	cmd.push(this.gbl(bl+1) + 
		'loadFlag = true;');
		
	//cmd.push(this.gbl(bl+1) + 
	//		'if (varName in self._sync.keys()):');
	//cmd.push(this.gbl(bl+2) + 
	//			'if (self._sync[varName] == 1):');
	//cmd.push(this.gbl(bl+3) + 
	//			'saveFlag = True');	

	cmd.push(this.gbl(bl+1) + 
		'if (loadFlag)');
	cmd.push(this.gbl(bl+2) + 
			'if (strcmp(type, \'AtomicSingle\'))');
	cmd.push(this.gbl(bl+3) + 
				this.objName() + '.loadFromHDF5HandleItemAtomicSingle(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 
			'elseif (strcmp(type, \'AtomicArray\'))');
	cmd.push(this.gbl(bl+3) + 
				this.objName() + '.loadFromHDF5HandleItemAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 
			'elseif (strcmp(type, \'NonAtomicArray\'))');
	cmd.push(this.gbl(bl+3) + 
				this.objName() + '.loadFromHDF5HandleItemNonAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 
			'elseif (strcmp(type, \'NonAtomicSingle\'))');
	cmd.push(this.gbl(bl+3) + 
				this.objName() + '.loadFromHDF5HandleItemNonAtomicSingle(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 
			'end');
	cmd.push(this.gbl(bl+1) + 
		'end');	
		
	/*loading non-value attributes */
	//cmd.push(this.gbl(bl+2) + 
	//		'self.loadFromHDF5HandleItemAttrs(handle, varName)' );
	
	/*
	cmd.push(this.gbl(bl+2) + 
			'self._sync[varName] = -1' );
	*/
		 
	cmd.push(this.gbl(bl+1));

	cmd.push(this.gbl(bl) + 
	'end');
	
    return cmd.join('\n');
    

};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5HandleItemAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	var filePath = this.objName() + '.' + this.makeInternal('FilePath');
	
	cmd.push(this.gbl(bl) + 'function loadFromHDF5HandleItemAtomicSingle(' + this.objName() + ', handle, varName)');

	 /* single atomic type value */
	cmd.push(this.gbl(bl+1) +	'try');
	cmd.push(this.gbl(bl+2) +		this.objName() + '.(varName) = h5read(' + filePath + ', [handle \'/\' varName]);' );
	cmd.push(this.gbl(bl+2) +		'if ischar(' + this.objName() + '.(varName))' );
	cmd.push(this.gbl(bl+3) +			'if ' + this.objName() + '.(varName)(end) == setstr(0)' );
	cmd.push(this.gbl(bl+4) +				'if length(' + this.objName() + '.(varName)) == 1' );
	cmd.push(this.gbl(bl+5) +					this.objName() + '.(varName) = \'\';' );
	cmd.push(this.gbl(bl+4) +				'else' );
	cmd.push(this.gbl(bl+5) +					this.objName() + '.(varName) = ' + this.objName() + '.(varName)(1:end-1);' );
	cmd.push(this.gbl(bl+4) +				'end');
	cmd.push(this.gbl(bl+3) +			'end');
	cmd.push(this.gbl(bl+2) +		'end');
	cmd.push(this.gbl(bl+1) +	'catch');
	cmd.push(this.gbl(bl+1) +	'end' );

	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5HandleItemAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function loadFromHDF5HandleItemAtomicArray(' + this.objName() + ', handle, varName)');
	cmd.push(this.gbl(bl+1) +	this.objName() + '.loadFromHDF5HandleItemAtomicSingle(handle, varName);');
	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5HandleItemNonAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function loadFromHDF5HandleItemNonAtomicSingle(' + this.objName() + ', handle, varName)');
	cmd.push(this.gbl(bl+1) + 	'try');
	cmd.push(this.gbl(bl+2) + 		'funcName = [\'renew\' upper(varName(1))  varName(2:end)];');
	cmd.push(this.gbl(bl+2) + 		this.objName() + '.(varName) = ' + this.objName() + '.(funcName)();');
	
	cmd.push(this.gbl(bl+2) + 		this.objName() + '.(varName).' + this.makeInternal("FilePath") + ' = ' + 
									this.objName() + '.' + this.makeInternal("FilePath") + ';');
	cmd.push(this.gbl(bl+2) + 		this.objName() + '.(varName).loadFromHDF5Handle([handle varName \'/\'])');
	cmd.push(this.gbl(bl+1) + 	'catch');
	cmd.push(this.gbl(bl+1) + 	'end' );


	cmd.push(this.gbl(bl) + 'end');
		
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5HandleItemNonAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	var filePath = this.objName() + '.' + this.makeInternal('FilePath');
	
	cmd.push(this.gbl(bl) + 'function loadFromHDF5HandleItemNonAtomicArray(' + this.objName() + ', handle, varName)');
	cmd.push(this.gbl(bl+1) + 	'order = h5readatt(' + filePath + ',[handle \'/\' varName],\'order\');' );
	cmd.push(this.gbl(bl+1) + 	'if (iscell(order) ~= 1)' );
	cmd.push(this.gbl(bl+2) + 		'order = strsplit(order, \',\');' );
	cmd.push(this.gbl(bl+1) + 	'end');
	cmd.push(this.gbl(bl+1) + 	this.objName() + '.(varName) = {};');

	cmd.push(this.gbl(bl+1) + 	'for i = 1:length(order)' );
	cmd.push(this.gbl(bl+2) + 		'funcName = [\'append\' upper(varName(1))  varName(2:end)];');
	cmd.push(this.gbl(bl+2) + 		'item = ' + this.objName() + '.(funcName)(order{i});');

	cmd.push(this.gbl(bl+2) + 		'item.' + this.makeInternal("FilePath") + ' = ' + 
									this.objName() + '.' + this.makeInternal("FilePath") + ';');
	cmd.push(this.gbl(bl+2) + 		'try');
	cmd.push(this.gbl(bl+3) + 		 	'item.loadFromHDF5Handle([handle varName \'/\' item.name \'/\'])');
	cmd.push(this.gbl(bl+2) + 		'catch');
	cmd.push(this.gbl(bl+2) + 		'end' );
	cmd.push(this.gbl(bl+1) + 	'end' );
	cmd.push(this.gbl(bl) + 'end');
		
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
function HDF5Save(){
};
exports.HDF5Save = HDF5Save;
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveHDF5Func = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];


	cmd.push(this.gbl(bl) + 	'function saveHDF5(' + this.objName() + ',filePath)');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'filePath\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'filePath = strcat(' + this.objName() + '.name, \'.h5\'); ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 		 this.objName() + '.storageBackEndType = \'hdf5\';');
	cmd.push(this.gbl(bl+1));
	//cmd.push('        %fcpl = H5P.create(\'H5P_FILE_CREATE\');');
	//cmd.push('        %fapl = H5P.create(\'H5P_FILE_ACCESS\');');
	//cmd.push('        %fid = H5F.create(filePath,\'H5F_ACC_TRUNC\',fcpl,fapl);');
	//cmd.push('        ');
	cmd.push(this.gbl(bl+1) + 		 this.objName() + '.' + this.makeInternal('FilePath') + ' = filePath;');
	cmd.push(this.gbl(bl+1) + 		'grpHandle = [\'/\' ' + this.objName() + '.name \'/\'];');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 		'if (exist(filePath,\'file\'))');
	cmd.push(this.gbl(bl+2) + 			'delete(filePath);');
	cmd.push(this.gbl(bl+1) + 		'end');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 		'if (strcmpi(' + this.objName() + '.storageBackEndType,\'hdf5\'))');
	cmd.push(this.gbl(bl+2) + 			 this.objName() + '.saveToHDF5Handle(grpHandle);');
	cmd.push(this.gbl(bl+1) + 		'else');
	cmd.push(this.gbl(bl+2) + 			'error([\'storage back-end \' ' + this.objName() + '.storageBackEndType \' is not defined.\']);');
	cmd.push(this.gbl(bl+1) + 		'end');
	//cmd.push('       ');
	//cmd.push('        %H5F.close(fid);');
	cmd.push(this.gbl(bl) + 	'end');

return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function saveToHDF5Handle(' + this.objName() + ', handle)');
	cmd.push(this.gbl(bl+1) +	this.objName() + '.saveDataToHDF5Handle(handle)' );
	cmd.push(this.gbl(bl) + 'end');
		
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveDataToHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/*==================================================*/
	cmd.push(this.gbl(bl) + 'function saveDataToHDF5Handle(' + this.objName() + ', handle)');
	
	/*
	if (this.isDerived()) {
		cmd.push(this.gbl(bl+1) +
		'super(' + this.getClassName() + ', self)._saveDataToHDF5Handle(handle)');
		cmd.push(this.gbl(bl+1) + '');
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
				cmd.push(this.gbl(bl+1) + 
						this.objName() + '.saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', \'AtomicArray\')' );
			 }
			 else{
				 /* single atomic type value */
				cmd.push(this.gbl(bl+1) + 
						this.objName() + '.saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', \'AtomicSingle\')' );
			 }
		}
		else {
			/*creating references and saving other complex types 
			 * 'value' will be a or an array of references */
			
			/*create a subgroup for the contained values */

			if(this.isArray(prop)){
				/* array non-atomic type reference */
				 cmd.push(this.gbl(bl+1) + 
					this.objName() + '.saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', \'NonAtomicArray\')' );
				 
			 }
			 else{
				 /* single non-atomic type reference */
				 cmd.push(this.gbl(bl+1) + 
					this.objName() + '.saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', \'NonAtomicSingle\')' );
			 }

		}
		 
		cmd.push(this.gbl(bl+1));

	}
	
	/* saving root attributes */
	var filePath = this.objName() + '.' + this.makeInternal('FilePath');

	cmd.push(this.gbl(bl+1) + 	'fileattrib(' + filePath + ',\'+w\');' );
	
	/* putting accessed package names into the main root attributes */
	var packages = this.getPackages();
	for(var i = 0, len = packages.length; i< len; i++) {
		var key = packages[i];
		cmd.push(this.gbl(bl+1) +'h5writeatt(' + filePath + ',\'/\',' + 
									this.stringify(key) +',' + 
									this.stringify(this.getVersion(key)) + ');' );

	}
	
	cmd.push(this.gbl(bl+1) + 	'h5writeatt(' + filePath + ',handle,\'type\',' + 
									this.stringify(this.getPackagedTypeStr()) + ');' );
	cmd.push(this.gbl(bl+1) + 	'h5writeatt(' + filePath + ',handle,\'ID\',' + 
									this.objName() + '.ID' +  ');' );
	
	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItem = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function saveToHDF5HandleItem(' + this.objName() + ', handle, varName, type)');
	
	cmd.push(this.gbl(bl+1) +	'saveFlag = true;');
		
	//cmd.push(this.gbl(bl+1) + 
	//		'if (varName in self._sync.keys()):');
	//cmd.push(this.gbl(bl+2) + 
	//			'if (self._sync[varName] == 1):');
	//cmd.push(this.gbl(bl+3) + 
	//			'saveFlag = True');	

	cmd.push(this.gbl(bl+1) +	'if (saveFlag)');
	cmd.push(this.gbl(bl+2) +		'if (strcmp(type, \'AtomicSingle\'))');
	cmd.push(this.gbl(bl+3) +			this.objName() + '.saveToHDF5HandleItemAtomicSingle(handle, varName)' );
	cmd.push(this.gbl(bl+2) +		'elseif (strcmp(type, \'AtomicArray\'))');
	cmd.push(this.gbl(bl+3) +			this.objName() + '.saveToHDF5HandleItemAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) +		'elseif (strcmp(type, \'NonAtomicArray\'))');
	cmd.push(this.gbl(bl+3) +			this.objName() + '.saveToHDF5HandleItemNonAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) +		'elseif (strcmp(type, \'NonAtomicSingle\'))');
	cmd.push(this.gbl(bl+3) +			this.objName() + '.saveToHDF5HandleItemNonAtomicSingle(handle, varName)' );
	cmd.push(this.gbl(bl+2) +		'end');
	cmd.push(this.gbl(bl+1) +	'end');			
	/*writing non-value attributes */
	//cmd.push(this.gbl(bl+2) + 
	//		'self._saveToHDF5HandleItemAttrs(handle, varName)' );
	
	/*
	cmd.push(this.gbl(bl+2) + 
			'self._sync[varName] = -1' );
	*/
		 
	cmd.push(this.gbl(bl+1));

	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItemAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var filePath = this.objName() + '.' + this.makeInternal('FilePath');
	
	/*TODO: change hdf5write with h5write and learn how to write string. */
    
	cmd.push(this.gbl(bl) + 'function saveToHDF5HandleItemAtomicSingle(' + this.objName() + ', handle, varName)');
	
	cmd.push(this.gbl(bl+1) + 	 'if (' + this.objName() + '.isSet(varName))');
	cmd.push(this.gbl(bl+2) + 	 	'if (exist(' + filePath + ',\'file\'))');	
	cmd.push(this.gbl(bl+3) + 			'hdf5write(' + filePath + ',[handle varName] , ' + this.objName() + '.(varName)' +
											', \'WriteMode\', \'append\' );');
	cmd.push(this.gbl(bl+2) + 	 	'else');	
	cmd.push(this.gbl(bl+3) + 			'hdf5write(' + filePath + ',[handle varName] , ' + this.objName() + '.(varName)' +
											');');
	cmd.push(this.gbl(bl+2) + 		'end');
	cmd.push(this.gbl(bl+1) + 	'end');
	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItemAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function saveToHDF5HandleItemAtomicArray(' + this.objName() + ', handle, varName)');
	cmd.push(this.gbl(bl+1) + 	 this.objName() + '.saveToHDF5HandleItemAtomicSingle(handle,varName)');
	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItemNonAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function saveToHDF5HandleItemNonAtomicSingle(' + this.objName() + ', handle, varName)');

	 /* single non-atomic type value */
	cmd.push(this.gbl(bl+1) + 	'if (' + this.objName() + '.isSet(varName))');
	cmd.push(this.gbl(bl+2) +		'if (' + this.objName() + '.isContained(varName))');
	cmd.push(this.gbl(bl+3) +			this.objName() + '.(varName).' + this.makeInternal("FilePath") + ' = ' + 
											this.objName() + '.' + this.makeInternal("FilePath") + ';');
	cmd.push(this.gbl(bl+3) + 			this.objName() + '.(varName).saveToHDF5Handle([handle \'/\' varName \'/\']);');
	cmd.push(this.gbl(bl+2) + 		'else');
	/*
	cmd.push(this.gbl(bl+2) +
			'dset = maindgrp.create_dataset("values"' + ',(len(getattr(self,varName)),), dtype=ref_dtype )' );
	cmd.push(this.gbl(loopBlock.bl+1) + 
			 'dset' + loopBlock.indArray + ' = dgrp.ref');
			 */
	cmd.push(this.gbl(bl+3) +			'error(\'referenced single value is not implemented.\')' );
	cmd.push(this.gbl(bl+2) +		'end');
	cmd.push(this.gbl(bl+1) +	'end');
	/* put the reference in place*/ 
	/*cmd.push(this.gbl(bl+1) + 
			 'handle[' + JSON.stringify(prop.name) + '] = dgrp.ref');
			 */

	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItemNonAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function saveToHDF5HandleItemNonAtomicArray(' + this.objName() + ', handle, varName)');

	/*
	cmd.push(this.gbl(bl+1) + 
		'ref_dtype = h5py.special_dtype(ref=h5py.Reference)' );
	*/			

	var properties = this.getProperties();
	var propNum = properties.length;
	
	var filePath = this.objName() + '.' + this.makeInternal('FilePath');
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i]; 
		
		if ( (!(this.isAtomicType(prop.type))) && (this.isArray(prop)) ) {
		cmd.push(this.gbl(bl+1) + 'if (strcmp(varName, ' + this.stringify(prop.name) + ') && ' + this.objName() + '.isSet(varName))' );
		/*
		cmd.push(this.gbl(bl+2) + 
			'maindgrp = handle.create_group(' + JSON.stringify(prop.name) + ')');
		cmd.push(this.gbl(bl+2) +
			'dset = maindgrp.create_dataset("values"' + ',(len(getattr(self,varName)),), dtype=ref_dtype )' );
		 */


		cmd.push(this.gbl(bl+2) + 	'order = {};');

		cmd.push(this.gbl(bl+2) + 	'if (' + this.objName() + '.isContained(varName))');
		
		var loopBlock = this.loopBlockForArray(bl+3,prop);
		cmd.push(loopBlock.cmd);
		cmd.push(this.gbl(loopBlock.bl+1) +	'item = ' + this.objName() + '.' + this.makePrivate(prop.name) + 
												'{' +loopBlock.indArray + '};'	);	
		cmd.push(this.gbl(loopBlock.bl+1) + 'item.' + this.makeInternal("FilePath") + ' = ' + 
												this.objName() + '.' + this.makeInternal("FilePath") + ';');
		cmd.push(this.gbl(loopBlock.bl+1) + 'path = [handle \'/\' ' + this.stringify(prop.name) + ' \'/\' item.name ];');	
		cmd.push(this.gbl(loopBlock.bl+1) + 'item.saveToHDF5Handle([path \'/\']);' );		
		cmd.push(this.gbl(loopBlock.bl+1) + 'order{end+1} = item.name;');
		cmd.push(loopBlock.ends);

		/*
		cmd.push(this.gbl(bl+3) + 
				'hdf5write(' + filePath + ',[handle ' + this.stringify(prop.name) + ' \'/values\' ] , refs' +
				', \'WriteMode\', \'append\' );'
				);
		 */
		
		cmd.push(this.gbl(bl+3) + 		'h5writeatt(' + filePath + ',[handle \'/\' varName],\'order\', strjoin(order,\',\') );'	);
		
		cmd.push(this.gbl(bl+2) + 	'else');
		cmd.push(this.gbl(bl+3) +		'error(\'referenced array is not implemented.\')' );
		cmd.push(this.gbl(bl+2) +	'end');

			/* put the reference in place*/ 
			/*
			cmd.push(this.gbl(loopBlock.bl+1) + 
				 'dset' + loopBlock.indArray + ' = dgrp.ref');
			*/
		/*	
		cmd.push(this.gbl(bl+2) + 
			'self._saveToHDF5HandleItemAttrs(handle, varName)' );
		*/

		cmd.push(this.gbl(bl+1) + 'end');
		
		}
	}
	
	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItemNonAtomicArrayUngroup = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function saveToHDF5HandleItemNonAtomicArrayUngroup(' + this.objName() + ', handle, varName, propType)');

	/*
	cmd.push(this.gbl(bl+1) + 
		'ref_dtype = h5py.special_dtype(ref=h5py.Reference)' );
	*/			

	var properties = this.getProperties();
	var propNum = properties.length;
	
	var filePath = this.objName() + '.' + this.makeInternal('FilePath');
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i]; 
		
		if ( (!(this.isAtomicType(prop.type))) && (this.isArray(prop)) ) {
		cmd.push(this.gbl(bl+1) + 'if (strcmp(varName, ' + this.stringify(prop.name) + ') && ' + this.objName() + '.isSet(varName))' );
		/*
		cmd.push(this.gbl(bl+2) + 
			'maindgrp = handle.create_group(' + JSON.stringify(prop.name) + ')');
		cmd.push(this.gbl(bl+2) +
			'dset = maindgrp.create_dataset("values"' + ',(len(getattr(self,varName)),), dtype=ref_dtype )' );
		 */


		cmd.push(this.gbl(bl+2) + 	'order = {};');

		cmd.push(this.gbl(bl+2) + 	'if (' + this.objName() + '.isContained(varName))');
		
		var loopBlock = this.loopBlockForArray(bl+3,prop);
		cmd.push(loopBlock.cmd);
		cmd.push(this.gbl(loopBlock.bl+1) +	'item = ' + this.objName() + '.' + this.makePrivate(prop.name) + 
												'{' +loopBlock.indArray + '};'	);	
		cmd.push(this.gbl(loopBlock.bl+1) + 'item.' + this.makeInternal("FilePath") + ' = ' + 
												this.objName() + '.' + this.makeInternal("FilePath") + ';');
		cmd.push(this.gbl(loopBlock.bl+1) + 'path = [handle \'/\' item.name ];');	
		cmd.push(this.gbl(loopBlock.bl+1) + 'item.saveToHDF5Handle([path \'/\']);' );		
		cmd.push(this.gbl(loopBlock.bl+1) + 'order{end+1} = item.name;');
		cmd.push(loopBlock.ends);

		/*
		cmd.push(this.gbl(bl+3) + 
				'hdf5write(' + filePath + ',[handle ' + this.stringify(prop.name) + ' \'/values\' ] , refs' +
				', \'WriteMode\', \'append\' );'
				);
		 */
		
		cmd.push(this.gbl(bl+3) + 		'h5writeatt(' + filePath + ',[handle \'/\' varName],\'order\', strjoin(order,\',\') );'	);
		
		cmd.push(this.gbl(bl+2) + 	'else');
		cmd.push(this.gbl(bl+3) +		'error(\'referenced array is not implemented.\')' );
		cmd.push(this.gbl(bl+2) +	'end');

			/* put the reference in place*/ 
			/*
			cmd.push(this.gbl(loopBlock.bl+1) + 
				 'dset' + loopBlock.indArray + ' = dgrp.ref');
			*/
		/*	
		cmd.push(this.gbl(bl+2) + 
			'self._saveToHDF5HandleItemAttrs(handle, varName)' );
		*/

		cmd.push(this.gbl(bl+1) + 'end');
		
		}
	}
	
	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
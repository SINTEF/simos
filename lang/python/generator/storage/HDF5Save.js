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
	cmd.push(this.gbl(bl) + 	'def saveHDF5(self,filePath=None, dsType = \'hdf5\'):');
	cmd.push(this.gbl(bl+1) + 		'if (filePath == None):');
	cmd.push(this.gbl(bl+2) + 			'if hasattr(self, \'name\'):');
	cmd.push(this.gbl(bl+3) + 				'filePath = self.name + \'.h5\'');
	cmd.push(this.gbl(bl+2) + 			'else:');
	cmd.push(this.gbl(bl+3) + 				'raise Exception("object needs name for saving.")');
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) + 		'print "\tSaving %s to %s ..."%(self.name, filePath)');
	cmd.push(this.gbl(bl));
	//cmd.push(this.gbl(bl+1) + 		'if (self.STORAGE.backEnd == \'hdf5\'):');
	//cmd.push(this.gbl(bl+2) + 			'if (filePath == self.STORAGE.filePath):');
	cmd.push(this.gbl(bl+1) + 		'if (self.STORAGE):');
	cmd.push(this.gbl(bl+2) + 			'if (self.STORAGE.backEnd == \'hdf5\'):');
	cmd.push(this.gbl(bl+3) + 				'self.loadFromHDF5Handle(action="detach")');
	cmd.push(this.gbl(bl+1) +		'storage = pyds.getDataStorageBackEndServer(dsType)');
	cmd.push(this.gbl(bl+1) +		'storage.filePath = filePath');
	cmd.push(this.gbl(bl+1) +		'storage.openWrite()');
	cmd.push(this.gbl(bl));    
	cmd.push(this.gbl(bl+1) +		'grpHandle = storage.handle');
	cmd.push(this.gbl(bl+1) +		'self._saveVertionsToHDF5Handle(grpHandle)');
	cmd.push(this.gbl(bl+1) +		'dgrp = grpHandle.create_group(self.name)' );
	cmd.push(this.gbl(bl));     
	cmd.push(this.gbl(bl+1) + 		'storage.appendPath(self.name)');
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) +		'self._saved = {}');
	cmd.push(this.gbl(bl+1) +		'if storage.backEnd == \'hdf5\':');
	cmd.push(this.gbl(bl+2) +			'self.saveToHDF5Handle(dgrp)');
	cmd.push(this.gbl(bl+1) +		'else:');
	cmd.push(this.gbl(bl+2) +			'raise Exception("storage back-end " + self._storageBackEndType + " is not defined.")');
	cmd.push(this.gbl(bl));       
	cmd.push(this.gbl(bl+1) + 		'if storage.isOpen():');
	cmd.push(this.gbl(bl+2) +			'storage.close()');
	cmd.push(this.gbl(bl+1) +		'return storage');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveVertionsToHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _saveVertionsToHDF5Handle(self, handle):');

	/* putting accessed package names into the main root attributes */
	var packages = this.getPackages();
	for(var i = 0, len = packages.length; i< len; i++) {
		var key = packages[i];
		cmd.push(this.gbl(bl+1) + 
		'handle.attrs[' + this.stringify(key) + '] = ' + this.stringify(this.getPackageVersion(key)) );
	}
	
	cmd.push(this.gbl(bl+1) + 
		'pass');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) +	'def saveToHDF5Handle(self, handle):');

	
	cmd.push(this.gbl(bl+1) +	'#first pass to save all contained items' );	
	cmd.push(this.gbl(bl+1) + 	'self._saveDataToHDF5Handle(handle)' );
	

	/*
	cmd.push(this.gbl(bl+1) + 
		'#second pass to link referenced  items' );	
	cmd.push(this.gbl(bl+1) + 
		'self._saveDataToHDF5Handle(handle)' );
	*/
	
	cmd.push(this.gbl(bl+1) + 	'pass');
	cmd.push(this.gbl(bl+1));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveDataToHDF5Handle = function(bl) {
	
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	/* ================================================== */
	cmd.push(this.gbl(bl) + 'def _saveDataToHDF5Handle(self, handle):');
	
	if (this.isDerived()) {
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +	supType.name + '._saveDataToHDF5Handle(self,handle)');
				
		}

		cmd.push(this.gbl(bl+1) + '');
	}
	
	cmd.push(this.gbl(bl+1) + 	'self.REF = handle.ref');
	
	cmd.push(this.gbl(bl+1) + 	'handle.attrs["type"] = ' + this.stringify(this.getPackagedTypeStr()) );

	cmd.push(this.gbl(bl+1) + 	'handle.attrs["ID"] = self.ID' );

	cmd.push(this.gbl(bl+1) + 			'if ("order" in handle.attrs.keys()):');
	cmd.push(this.gbl(bl+2) + 				'handle.attrs["order"] = []');
	
	var properties = this.getProperties();
	var propNum = properties.length;

	/* writing properties */
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  

		
		/* writing the value */
		if (this.isAtomicType(prop.type)) {
			if(this.isArray(prop)){
				/* array of atomic type */
				cmd.push(this.gbl(bl+1) + 'self._saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', "AtomicArray")' );
			 }
			 else{
				 /* single atomic type value */
				cmd.push(this.gbl(bl+1) + 'self._saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', "AtomicSingle")' );
			 }
		}
		else {
			/*
			 * creating references and saving other complex types 'value' will
			 * be a or an array of references
			 */
			
			/* create a subgroup for the contained values */

			if(this.isArray(prop) && this.isUngroup(prop)){
				/* array non-atomic type reference */
				 cmd.push(this.gbl(bl+1) + 'self._saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', "NonAtomicArray", ungroup=True)' );
			}	 
		    else if(this.isArray(prop) && !(this.isUngroup(prop))){
				/* array non-atomic type reference */
				 cmd.push(this.gbl(bl+1) + 'self._saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', "NonAtomicArray")' );
				 
			 }
			 else{
				 /* single non-atomic type reference */
				 cmd.push(this.gbl(bl+1) + 'self._saveToHDF5HandleItem(handle, ' + this.stringify(prop.name) + ', "NonAtomicSingle")' );
			 }

		}
		 
		cmd.push(this.gbl(bl+1));

	}


	cmd.push(this.gbl(bl+1) +  	'order = []');
    /* creating order attribute */
	for(var j = 0; j < propNum; j++) {
		var prop = properties[j];  

		if (!(this.isUngroup(prop))) {
			cmd.push(this.gbl(bl+1) +  	'if (self.isSet(' + this.stringify(prop.name) +')):');
			cmd.push(this.gbl(bl+2) +  		'order.append(' + this.stringify(prop.name) +')');
		}
		
	}

	cmd.push(this.gbl(bl+1) + 	'if ("order" in handle.attrs.keys()):');
	cmd.push(this.gbl(bl+2) + 		'curOrders = handle.attrs["order"]');	
	cmd.push(this.gbl(bl+2) + 		'if ( len(list(curOrders)) > 0 ):');	
	cmd.push(this.gbl(bl+3) + 			'order = list(curOrders) + order');
	cmd.push(this.gbl(bl+1) + 	'handle.attrs["order"] = order' );
	
	cmd.push(this.gbl(bl+1) + 	'for key,val in self.OBJattrs.iteritems():');
	cmd.push(this.gbl(bl+2) + 		'#type is exception and it will be overwriten');	
	cmd.push(this.gbl(bl+2) + 		'if (key == "type"):');
	cmd.push(this.gbl(bl+3) + 			'handle.attrs[key] = val');
	cmd.push(this.gbl(bl+2) + 		'#skip name and description');	
	cmd.push(this.gbl(bl+2) + 		'if (key == "name" or key == "description"):');
	cmd.push(this.gbl(bl+3) + 			'continue');	
	cmd.push(this.gbl(bl+2) + 		'if (not key in handle.attrs.keys()):');
	cmd.push(this.gbl(bl+3) + 			'handle.attrs[key] = val');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItem = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _saveToHDF5HandleItem(self, handle, varName, myType, ungroup=False):');
	cmd.push(this.gbl(bl+1) + 'saveFlag = True');
	cmd.push(this.gbl(bl+1) + 'if (saveFlag):');
	cmd.push(this.gbl(bl+2) + 	'if (myType == "AtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 		'self._saveToHDF5HandleItemAtomicSingle(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 	'if (myType == "AtomicArray"):');
	cmd.push(this.gbl(bl+3) + 		'self._saveToHDF5HandleItemAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 	'if (myType == "NonAtomicArray") and not(ungroup):');
	cmd.push(this.gbl(bl+3) + 		'self._saveToHDF5HandleItemNonAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 	'if (myType == "NonAtomicArray") and ungroup:');
	cmd.push(this.gbl(bl+3) + 		'self._saveToHDF5HandleItemNonAtomicArrayUngroup(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 	'if (myType == "NonAtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 		'self._saveToHDF5HandleItemNonAtomicSingle(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 		'self._sync[varName] = -1' );
	cmd.push(this.gbl(bl+1));
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItemAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _saveToHDF5HandleItemAtomicSingle(self, handle, varName):');

	 /* single atomic type value */
	cmd.push(this.gbl(bl+1) + 
	 	'if (self.isSet(varName)):');
	cmd.push(this.gbl(bl+2) + 
 			'if (self.isContained(varName) ):');
	cmd.push(this.gbl(bl+3) + 
			 	'handle[varName] = getattr(self,varName)');
	cmd.push(this.gbl(bl+3) + 
	 		 	'self._saved[varName] = handle[varName].ref');

	cmd.push(this.gbl(bl+1) + 
	'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItemAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _saveToHDF5HandleItemAtomicArray(self, handle, varName):');

	/* array of atomic type */
	cmd.push(this.gbl(bl+1) + 
 		'if (self.isSet(varName)):');
	cmd.push(this.gbl(bl+2) + 
			'if (self.isContained(varName) ):');
	cmd.push(this.gbl(bl+3) + 
				'handle[varName] = np.asarray(getattr(self,varName))' );
	cmd.push(this.gbl(bl+3) + 
	 			'self._saved[varName] = handle[varName].ref');	
	cmd.push(this.gbl(bl+1) + 
		'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItemNonAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _saveToHDF5HandleItemNonAtomicSingle(self, handle, varName):');

	/* reference */
	cmd.push(this.gbl(bl+1) +	'ref_dtype = h5py.special_dtype(ref=h5py.Reference)' );

	 /* single non-atomic type value */
	cmd.push(this.gbl(bl+1) +  	'if (self.isSet(varName)):');
	cmd.push(this.gbl(bl+2) + 		'if (self.isContained(varName)):');
	cmd.push(this.gbl(bl+3) + 			'dgrp = None' );
	cmd.push(this.gbl(bl+3) + 			'if not(varName in handle.keys()):' );
	cmd.push(this.gbl(bl+4) + 				'dgrp = handle.create_group(varName)' );
	cmd.push(this.gbl(bl+3) + 			'else:' );
	cmd.push(this.gbl(bl+4) + 				'dgrp = handle[varName]' );	
	//cmd.push(this.gbl(bl+3) + 			'if ("order" in dgrp.attrs.keys()):');
	//cmd.push(this.gbl(bl+4) + 				'dgrp.attrs["order"] = ""');
	cmd.push(this.gbl(bl+3) + 			'getattr(self, varName)._saveDataToHDF5Handle(dgrp)');

	
	cmd.push(this.gbl(bl+2) + 		'elif not(getattr(self, varName).REF == None ):');
	cmd.push(this.gbl(bl+3) +			'raise Exception("referenced single value is not implemented.")' );

	//cmd.push(this.gbl(bl+3) +			'handle.create_dataset(varName,data=getattr(self, varName).REF, dtype=ref_dtype )' );
	/*
	 * cmd.push(this.gbl(bl+2) + 'dset =
	 * maindgrp.create_dataset("values"' + ',(len(getattr(self,varName)),),
	 * dtype=ref_dtype )' ); cmd.push(this.gbl(loopBlock.bl+1) +
	 * 'dset' + loopBlock.indArray + ' = dgrp.ref');
	 */

	/* put the reference in place */ 
	/*
	 * cmd.push(this.gbl(bl+1) + 'handle[' + JSON.stringify(prop.name) + '] =
	 * dgrp.ref');
	 */

	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItemNonAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _saveToHDF5HandleItemNonAtomicArray(self, handle, varName):');

	/* array of non-atomic type */
	cmd.push(this.gbl(bl+1) + 
		'ref_dtype = h5py.special_dtype(ref=h5py.Reference)' );
					

	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i]; 
		
		if ( (!(this.isAtomicType(prop.type))) && (this.isArray(prop)) ) {
		cmd.push(this.gbl(bl+1) + 
		'if ((varName == ' + this.stringify(prop.name) + ') and self.isSet(varName)):' );
		cmd.push(this.gbl(bl+2) + 
			'itemNames = []' );
		cmd.push(this.gbl(bl+2) + 
			'maindgrp = None' );
		cmd.push(this.gbl(bl+2) + 
			'if not(varName in handle.keys()):' );
		cmd.push(this.gbl(bl+3) + 
				'maindgrp = handle.create_group(varName)' );
		cmd.push(this.gbl(bl+2) + 
			'else:' );
		cmd.push(this.gbl(bl+3) + 
				'maindgrp = handle[varName]' );

		cmd.push(this.gbl(bl+2) + 
			'if (self.isContained(varName)):');

		var loopBlock = this.getLoopBlockForArray(bl+3,prop);
		cmd.push(loopBlock.cmd);
		cmd.push(this.gbl(loopBlock.bl+1) + 
				'item = self.' + prop.name + loopBlock.indList );
		cmd.push(this.gbl(loopBlock.bl+1) + 
				'itemNames.append(item.name)' );
		cmd.push(this.gbl(loopBlock.bl+1) + 
				'dgrp = None' );
		cmd.push(this.gbl(loopBlock.bl+1) + 
				'if not(item.name in maindgrp.keys()):' );
		cmd.push(this.gbl(loopBlock.bl+2) + 
					'dgrp = maindgrp.create_group(item.name)' );
		cmd.push(this.gbl(loopBlock.bl+1) + 
				'else:' );
		cmd.push(this.gbl(loopBlock.bl+2) + 
					'dgrp = maindgrp[item.name]' );
			
		cmd.push(this.gbl(loopBlock.bl+1) + 
				 'self.' + prop.name + loopBlock.indList + '._saveDataToHDF5Handle(dgrp)');

		cmd.push(this.gbl(bl+3) + 
			'maindgrp.attrs["order"] =  itemNames');

		cmd.push(this.gbl(bl+2) + 
			'else:');
		var loopBlock = this.getLoopBlockForArray(bl+3,prop);
		cmd.push(loopBlock.cmd);
		cmd.push(this.gbl(loopBlock.bl+1) + 
				'item = self.' + prop.name + loopBlock.indList );
		cmd.push(this.gbl(loopBlock.bl+1) + 
				'itemNames.append(item.name)' );
		cmd.push(this.gbl(loopBlock.bl+1) + 
				'if not(item.REF == None ):' );
		cmd.push(this.gbl(loopBlock.bl+2) +
					'handle.create_dataset(item.name,data=item.REF, dtype=ref_dtype )' );
		
		cmd.push(this.gbl(bl+3) + 
				'maindgrp.attrs["order"] =  itemNames');

		}
	}
	
	cmd.push(this.gbl(bl+1) + 
		'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveToHDF5HandleItemNonAtomicArrayUngroup = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) +	'def _saveToHDF5HandleItemNonAtomicArrayUngroup(self, handle, varName):');
	cmd.push(this.gbl(bl+1) + 	'ref_dtype = h5py.special_dtype(ref=h5py.Reference)' );
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i]; 
		
		if ( (!(this.isAtomicType(prop.type))) && (this.isArray(prop)) ) {
		cmd.push(this.gbl(bl+1) + 'if ((varName == ' + this.stringify(prop.name) + ') and self.isSet(varName)):' );
		cmd.push(this.gbl(bl+2) + 	'itemNames = []' );
		cmd.push(this.gbl(bl+2) + 	'maindgrp = handle' );
		cmd.push(this.gbl(bl+2) + 	'if (self.isContained(varName)):');
		
		var loopBlock = this.getLoopBlockForArray(bl+3,prop);
		cmd.push(loopBlock.cmd);
		cmd.push(this.gbl(loopBlock.bl+1) +	'item = self.' + prop.name + loopBlock.indList );
		cmd.push(this.gbl(loopBlock.bl+1) + 'itemNames.append(item.name)' );
		cmd.push(this.gbl(loopBlock.bl+1) + 'dgrp = None' );
		cmd.push(this.gbl(loopBlock.bl+1) + 'if not(item.name in maindgrp.keys()):' );
		cmd.push(this.gbl(loopBlock.bl+2) + 	'dgrp = maindgrp.create_group(item.name)' );
		cmd.push(this.gbl(loopBlock.bl+1) + 'else:' );
		cmd.push(this.gbl(loopBlock.bl+2) + 	'dgrp = maindgrp[item.name]' );
		//cmd.push(this.gbl(loopBlock.bl+1) + 'dgrp.attrs["group"] = ' + this.stringify(prop.name) );		
		cmd.push(this.gbl(loopBlock.bl+1) + 'self.' + prop.name + loopBlock.indList + '._saveDataToHDF5Handle(dgrp)');

		cmd.push(this.gbl(bl+3) +		'existingOrder = None');				
		cmd.push(this.gbl(bl+3) +		'if ("order" in maindgrp.attrs.keys()):');
		cmd.push(this.gbl(bl+4) +			'existingOrder = maindgrp.attrs["order"]');		
		cmd.push(this.gbl(bl+4) + 			'if not(isinstance(existingOrder,np.ndarray)):');	
		cmd.push(this.gbl(bl+5) + 				'if not(existingOrder==""):');			
		cmd.push(this.gbl(bl+6) +	 				'existingOrder = np.array(existingOrder.split(","))');	
		
		cmd.push(this.gbl(bl+3) +		'if isinstance(existingOrder,np.ndarray):');
		cmd.push(this.gbl(bl+4) +			'itemNames =  list(existingOrder) + itemNames');

		cmd.push(this.gbl(bl+3) +		'maindgrp.attrs["order"] =  itemNames');
		cmd.push(this.gbl(bl+2) + 	'else:');
		cmd.push(this.gbl(bl+3) +		'raise Exception("referenced items are not supported yet")');
		/*
		var loopBlock = this.getLoopBlockForArray(bl+3,prop);
		cmd.push(loopBlock.cmd);
		cmd.push(this.gbl(loopBlock.bl+1) + 'item = self.' + prop.name + loopBlock.indList );
		cmd.push(this.gbl(loopBlock.bl+1) + 'itemNames.append(item.name)' );
		cmd.push(this.gbl(loopBlock.bl+1) + 'if not(item.REF == None ):' );
		cmd.push(this.gbl(loopBlock.bl+2) +		'handle.create_dataset(item.name,data=item.REF, dtype=ref_dtype )' );
		
		cmd.push(this.gbl(bl+3) +		'maindgrp.attrs["order"] =  itemNames');
		 */
		    
		}
	}
	
    return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
function MongoSave(){
};
exports.MongoSave = MongoSave;
/*----------------------------------------------------------------------------*/
MongoSave.prototype.saveVertionsToMongo = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _saveVertionsToMongo(self, handle):');

	/* putting accessed package names into the main root attributes */
	var packages = this.getPackages();
	for(var i = 0, len = packages.length; i< len; i++) {
		var key = packages[i];
		cmd.push(this.gbl(bl+1) + 
		'handle.attrs[' + this.stringify(key) + '] = ' + this.stringify(this.getVersion(key)) );
	}
	
	cmd.push(this.gbl(bl+1) + 
		'pass');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoSave.prototype.saveToMongo = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) +	'def saveToMongo(self, storage = None, parent = None):');

	
	cmd.push(this.gbl(bl+1) + 	'if storage == None:');
	cmd.push(this.gbl(bl+2) + 		'storage = self.STORAGE');
	cmd.push(this.gbl(bl+1) + 	'if not(storage.isConnected()):');
	cmd.push(this.gbl(bl+2) + 		'storage.connect()');

	cmd.push(this.gbl(bl+1) + 	'#first pass to save all contained items' );	
	cmd.push(this.gbl(bl+1) + 	'self._saveDataToMongo(storage, parent)' );
	
	/*
	cmd.push(this.gbl(bl+1) + 
		'#second pass to link referenced  items' );	
	cmd.push(this.gbl(bl+1) + 
		'self._saveDataToMongo(handle)' );
	*/

	cmd.push(this.gbl(bl+1) + 	'if storage.isConnected():');
	cmd.push(this.gbl(bl+2) + 		'storage.disconnect()');
	
	cmd.push(this.gbl(bl+1) + 	'pass');
	cmd.push(this.gbl(bl));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoSave.prototype.saveDataToMongo = function(bl) {
	
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	/* ================================================== */
	cmd.push(this.gbl(bl) + 'def _saveDataToMongo(self, storage = None, parent=None):');
	
	/* for derived classes.*/
	if (this.isDerived()) {
		throw "support for drived classes is susspended.";
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +
					supType.name + '._saveDataToMongo(self,storage, parent)');
				
		}

		cmd.push(this.gbl(bl+1) + '');
	}
		
	cmd.push(this.gbl(bl+1) + 	'if (storage.collection.find({"_id": self.ID}).count() == 0):');
	cmd.push(this.gbl(bl+2) + 		'print "pushing %s:%s to MongoDB ..."%(self.name, self.ID)');
	cmd.push(this.gbl(bl+2) + 		'storage.collection.insert(self.mongodbRepr(parent))');


	/* writing properties */
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  

		
		/* writing the value */
		if (this.isAtomic(prop)) {
		}
		else {
			/*
			 * creating references and saving other complex types 'value' will
			 * be a or an array of references
			 */
			
			/* create a subgroup for the contained values */

			if(this.isArray(prop)){
				/* array non-atomic type reference */
	var loopBlock = this.getLoopBlockForArray(bl+1,prop);
	cmd.push(loopBlock.cmd);
	cmd.push(this.gbl(loopBlock.bl+1) + 'item = self.' + prop.name + loopBlock.indList );
	cmd.push(this.gbl(loopBlock.bl+1) + 'newStorage = storage.clone()');
	cmd.push(this.gbl(loopBlock.bl+1) + 'item.saveToMongo(storage=newStorage, parent=self.ID)' );
			 }
			 else{
				 /* single non-atomic type reference */
	cmd.push(this.gbl(bl+1) + 	'if self.isSet(' + this.stringify(prop.name) + '):' );
	cmd.push(this.gbl(bl+2) + 		'newStorage = storage.clone()');
	cmd.push(this.gbl(bl+2) + 		'self.' + prop.name + '.saveToMongo(storage=newStorage, parent=self.ID)' );
			 }

		}
		 
		cmd.push(this.gbl(bl+1));

	}
	cmd.push(this.gbl(bl+1) + 
	'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoSave.prototype.saveToMongoItem = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _saveToMongoItem(self, handle, varName, myType):');
	
	cmd.push(this.gbl(bl+1) + 
		'saveFlag = True');

	cmd.push(this.gbl(bl+1) + 
		'if (saveFlag):');
	cmd.push(this.gbl(bl+2) + 
			'if (myType == "AtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 
				'self._saveToMongoItemAtomicSingle(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 
			'if (myType == "AtomicArray"):');
	cmd.push(this.gbl(bl+3) + 
				'self._saveToMongoItemAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 
			'if (myType == "NonAtomicArray"):');
	cmd.push(this.gbl(bl+3) + 
				'self._saveToMongoItemNonAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 
			'if (myType == "NonAtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 
				'self._saveToMongoItemNonAtomicSingle(handle, varName)' );
	
	cmd.push(this.gbl(bl+2) + 
			'self._sync[varName] = -1' );
		
		 
	cmd.push(this.gbl(bl+1));

	cmd.push(this.gbl(bl+1) + 
		'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoSave.prototype.saveToMongoItemAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _saveToMongoItemAtomicSingle(self, handle, varName):');

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
MongoSave.prototype.saveToMongoItemAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _saveToMongoItemAtomicArray(self, handle, varName):');

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
MongoSave.prototype.saveToMongoItemNonAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _saveToMongoItemNonAtomicSingle(self, handle, varName):');

	/* reference */
	cmd.push(this.gbl(bl+1) + 
		'ref_dtype = h5py.special_dtype(ref=h5py.Reference)' );

	 /* single non-atomic type value */
	cmd.push(this.gbl(bl+1) + 
	 	'if (self.isSet(varName)):');
	cmd.push(this.gbl(bl+2) + 
 			'if (self.isContained(varName)):');
	cmd.push(this.gbl(bl+3) + 
				'dgrp = None' );
	cmd.push(this.gbl(bl+3) + 
				'if not(varName in handle.keys()):' );
	cmd.push(this.gbl(bl+4) + 
					'dgrp = handle.create_group(varName)' );
	cmd.push(this.gbl(bl+3) + 
				'else:' );
	cmd.push(this.gbl(bl+4) + 
					'dgrp = handle[varName]' );
	cmd.push(this.gbl(bl+3) + 
				'getattr(self, varName)._saveDataToMongo(dgrp)');
	cmd.push(this.gbl(bl+2) + 
			'elif not(getattr(self, varName).REF == None ):');
	cmd.push(this.gbl(bl+3) +
				'handle.create_dataset(varName,data=getattr(self, varName).REF, dtype=ref_dtype )' );
	/*
	 * cmd.push(this.gbl(bl+2) + 'dset =
	 * maindgrp.create_dataset("values"' + ',(len(getattr(self,varName)),),
	 * dtype=ref_dtype )' ); cmd.push(this.gbl(loopBlock.bl+1) +
	 * 'dset' + loopBlock.indArray + ' = dgrp.ref');
	 */
	cmd.push(this.gbl(bl+3) +
				'raise Exception("referenced single value is not implemented.")' );

	/* put the reference in place */ 
	/*
	 * cmd.push(this.gbl(bl+1) + 'handle[' + JSON.stringify(prop.name) + '] =
	 * dgrp.ref');
	 */

	cmd.push(this.gbl(bl+1) + 
		'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoSave.prototype.saveToMongoItemNonAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _saveToMongoItemNonAtomicArray(self, handle, varName):');

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
				 'self.' + prop.name + loopBlock.indList + '._saveDataToMongo(dgrp)');

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

//var njs = require('../../njs')();

/*----------------------------------------------------------------------------*/
function HDF5Load(){
};
exports.HDF5Load = HDF5Load;
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def loadFromHDF5Handle(self, storage=None):');
	cmd.push(this.gbl(bl+1) + 	'self._loadedItems = []');
	cmd.push(this.gbl(bl+1) + 	'if storage != None:' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE = storage' );
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.isConnected() and not(self.STORAGE.isOpen()):' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE.openRead()' );
	
	cmd.push(this.gbl(bl+1) + 	'self._loadDataFromHDF5Handle()' );
	
	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.isOpen():' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE.close()' );
	
		
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadDataFromHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	/* ================================================== */
	cmd.push(this.gbl(bl) + 'def _loadDataFromHDF5Handle(self):');
	
	/* for inheritence */
	/*
	if (this.isDerived()) {
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +
					supType.name + '._loadDataFromHDF5Handle(self,handle)');
				
		}
		cmd.push(this.gbl(bl+1) + '');
	}
	*/
	
	cmd.push(this.gbl(bl+1) + 	'handle = self.STORAGE.data' );
	cmd.push(this.gbl(bl+1) + 	'self.ID = str(handle.attrs["ID"])' );
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  


		/* writing the value */
		if (this.isAtomic(prop)) {
			if (this.isSingle(prop)){
				 /* single atomic type value */
				cmd.push(this.gbl(bl+1) + 
						'self._loadFromHDF5HandleItem(' + this.stringify(prop.name) + ', "AtomicSingle")' );
			 }
		}
	}
	cmd.push(this.gbl(bl+1));
	
	cmd.push(this.gbl(bl+1) + 'pass');
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadDataItemFromHDF5 = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	/* ================================================== */
	cmd.push(this.gbl(bl) + 'def _loadDataItemFromHDF5(self, itemName):');
	
	/* for inheritence */
	/*
	if (this.isDerived()) {
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +
					supType.name + '._loadDataFromHDF5Handle(self,handle)');
				
		}
		cmd.push(this.gbl(bl+1) + '');
	}
	*/
	
	cmd.push(this.gbl(bl+1) + 'if self.STORAGE.isConnected() and not(self.STORAGE.isOpen()):');
	cmd.push(this.gbl(bl+2) + 	'self.STORAGE.openRead()');
        
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  

		cmd.push(this.gbl(bl+1) + 'if (itemName == ' + this.stringify(prop.name) + '):' );
		/* writing the value */
		if (this.isAtomic(prop)) {
			if(this.isArray(prop)){
				/* array of atomic type */
				
				cmd.push(this.gbl(bl+2) + 
						'self._loadFromHDF5HandleItem(' + this.stringify(prop.name) + ', "AtomicArray")' );
			 }
			 else{
				 /* single atomic type value */
				cmd.push(this.gbl(bl+2) + 
						'self._loadFromHDF5HandleItem(' + this.stringify(prop.name) + ', "AtomicSingle")' );
			 }
		}
		else {
			/*
			 * creating references and saving other complex types 'value' will
			 * be a or an array of references
			 */
			
			/* create a subgroup for the contained values */

			if(this.isArray(prop)){
				/* array non-atomic type reference */
				 cmd.push(this.gbl(bl+2) + 
					'self._loadFromHDF5HandleItem(' + this.stringify(prop.name) + ', "NonAtomicArray")' );
				 
			 }
			 else{
				 /* single non-atomic type reference */
				 cmd.push(this.gbl(bl+2) + 
					'self._loadFromHDF5HandleItem(' + this.stringify(prop.name) + ', "NonAtomicSingle")' );
			 }

		}

		

	}
	cmd.push(this.gbl(bl+1));
	
	cmd.push(this.gbl(bl+1) + 'if self.STORAGE.isOpen():');
	cmd.push(this.gbl(bl+2) + 	'self.STORAGE.close()');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5HandleItem = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _loadFromHDF5HandleItem(self, varName, myType):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'loadFlag = True');
		
	// cmd.push(this.getBlockSpace(bl+1) +
	// 'if (varName in self._sync.keys()):');
	// cmd.push(this.getBlockSpace(bl+2) +
	// 'if (self._sync[varName] == 1):');
	// cmd.push(this.getBlockSpace(bl+3) +
	// 'saveFlag = True');

	cmd.push(this.gbl(bl+1) + 	'handle = self.STORAGE.data');
	cmd.push(this.gbl(bl+1) + 	'if (loadFlag):');
	cmd.push(this.gbl(bl+2) + 		'if (myType == "AtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromHDF5HandleItemAtomicSingle(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "AtomicArray"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromHDF5HandleItemAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "NonAtomicArray"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromHDF5HandleItemNonAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "NonAtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromHDF5HandleItemNonAtomicSingle(handle, varName)' );
	
	cmd.push(this.gbl(bl+2) + 		'self._sync[varName] = -1' );
		
		 
	cmd.push(this.gbl(bl+1));

	cmd.push(this.gbl(bl+1) + 	'pass');
	
    return cmd.join('\n');
    

};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5HandleItemAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _loadFromHDF5HandleItemAtomicSingle(self, handle, varName):');

	 /* single atomic type value */
	cmd.push(this.gbl(bl+1) + 	'try :');
	cmd.push(this.gbl(bl+2) + 		'setattr(self,varName, handle[varName][...])' );
	cmd.push(this.gbl(bl+1) + 	'except :');
	cmd.push(this.gbl(bl+2) + 		'pass' );

	cmd.push(this.gbl(bl+1) + 	'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5HandleItemAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _loadFromHDF5HandleItemAtomicArray(self, handle, varName):');

	/* array of atomic type */
	cmd.push(this.gbl(bl+1) +	'try :');
	cmd.push(this.gbl(bl+2) +		'setattr(self, "_"+varName, handle[varName].value)' );		
	cmd.push(this.gbl(bl+1) +	'except :');
	cmd.push(this.gbl(bl+2) +		'pass' );
	
	cmd.push(this.gbl(bl+1) +	'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5HandleItemNonAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _loadFromHDF5HandleItemNonAtomicSingle(self, handle, varName):');

	/* single atomic type value */
	cmd.push(this.gbl(bl+1) + 	'try :');
	cmd.push(this.gbl(bl+2) + 		'if (varName in handle.keys()):');
	cmd.push(this.gbl(bl+3) +			'obj = getattr(self,varName)');
	cmd.push(this.gbl(bl+3) +			'if (obj == None):');
	cmd.push(this.gbl(bl+4) + 				'creFunc = getattr(self,"create"+varName[0].capitalize()+varName[1:])');
	cmd.push(this.gbl(bl+4) + 				'obj = creFunc()');
	cmd.push(this.gbl(bl+3) + 		 	'subStor = self.STORAGE.clone()');
	cmd.push(this.gbl(bl+3) + 		 	'subStor.appendPath(varName)');
	cmd.push(this.gbl(bl+3) + 		 	'obj.loadFromHDF5Handle(subStor)');
	cmd.push(this.gbl(bl+1) + 	'except :');
	cmd.push(this.gbl(bl+2) + 		 'print "Warning: %s was not loaded properly. "%varName' );
	/*cmd.push(this.getBlockSpace(bl+2) + 
	'raise Exception("was not possible to load " + varName)' );*/
	 
	cmd.push(this.gbl(bl+1) + 	'pass');
		
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5HandleItemNonAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _loadFromHDF5HandleItemNonAtomicArray(self, handle, varName):');

	/* array of non-atomic type */

					
	cmd.push(this.gbl(bl+1) +	'try :');
	cmd.push(this.gbl(bl+2) + 		'num = len(handle[varName].attrs["order"])');
	cmd.push(this.gbl(bl+2) + 		'setattr(self,varName,[])');
	cmd.push(this.gbl(bl+2) + 		'creFunc = getattr(self,"append"+varName[0].capitalize()+varName[1:])');
	cmd.push(this.gbl(bl+2) + 		'for i in range(num):');
	cmd.push(this.gbl(bl+3) + 			'refObject = handle[varName].attrs["order"][i]' );
	cmd.push(this.gbl(bl+3) + 			'obj = creFunc(refObject)');
	cmd.push(this.gbl(bl+3) + 			'subStor = self.STORAGE.clone()');
	cmd.push(this.gbl(bl+3) + 			'subStor.appendPath(varName)');
	cmd.push(this.gbl(bl+3) + 			'subStor.appendPath(refObject)');
	
	cmd.push(this.gbl(bl+3) + 			'obj.loadFromHDF5Handle(subStor)');

	cmd.push(this.gbl(bl+1) + 	'except :');
	cmd.push(this.gbl(bl+2) + 		'pass' );

	cmd.push(this.gbl(bl+1) + 'pass');
	
    return cmd.join('\n');
};

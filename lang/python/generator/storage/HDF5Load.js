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
	
	cmd.push(this.gbl(bl) + 	'def loadHDF5(self,name=None, filePath=None, dsType = \'hdf5\', action="init", hdfPath=None):');
	cmd.push(this.gbl(bl+1) + 	'if not(name == None):');
	cmd.push(this.gbl(bl+2) +		'self.name = name');
	cmd.push(this.gbl(bl+1) + 	'if (name == None) and not(filePath == None):');
	cmd.push(this.gbl(bl+2) + 		'self.name = \'.\'.join(filePath.split(os.path.sep)[-1].split(\'.\')[0:-1])');
	cmd.push(this.gbl(bl+1) + 	'if (filePath == None):');
	cmd.push(this.gbl(bl+2) + 		'if hasattr(self, \'name\'):');
	cmd.push(this.gbl(bl+3) + 			'filePath = self.name + \'.h5\'');
	cmd.push(this.gbl(bl+2) + 		'else:');
	cmd.push(this.gbl(bl+3) + 			'raise Exception("object needs name for loading.")');
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) + 	'if not(os.path.isfile(filePath)):');
	cmd.push(this.gbl(bl+2) + 		'raise Exception("file %s not found."%filePath)');
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) + 	'self.STORAGE = pyds.getDataStorageBackEndServer(dsType)');
	cmd.push(this.gbl(bl+1) + 	'self.STORAGE.filePath = filePath');
	cmd.push(this.gbl(bl));     
	cmd.push(this.gbl(bl+1) + 	'if hdfPath == None:');
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE.path = self.STORAGE.path + self.name');
	cmd.push(this.gbl(bl+1) + 	'else:');
	cmd.push(this.gbl(bl+2) + 	'self.STORAGE.path = hdfPath');
	cmd.push(this.gbl(bl));       
	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.backEnd == \'hdf5\':');
	cmd.push(this.gbl(bl+2) + 		'self.loadFromHDF5Handle(action = action)');
	cmd.push(this.gbl(bl+1) + 	'else:');
	cmd.push(this.gbl(bl+2) + 		'raise Exception("storage back-end " + self.STORAGE.backEnd + " is not defined.")');
	cmd.push(this.gbl(bl));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadFromHDF5Handle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def loadFromHDF5Handle(self, storage=None, action="init"):');
	cmd.push(this.gbl(bl+1) + 	'if (action == "init") or (action == "sync"):');
	cmd.push(this.gbl(bl+2) + 		'self._loadInit()');
	cmd.push(this.gbl(bl+1) + 	'if storage != None:' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE = storage' );
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.isConnected() and not(self.STORAGE.isOpen()):' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE.openRead()' );

	cmd.push(this.gbl(bl+2) +		'self._loadDataFromHDF5Handle(action=action)');
		
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
	cmd.push(this.gbl(bl) + 'def _loadDataFromHDF5Handle(self, action="init"):');
	
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
	
	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.isConnected() and not(self.STORAGE.isOpen()):' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE.openRead()' );
	
	cmd.push(this.gbl(bl+1) + 	'handle = self.STORAGE.data' );
	cmd.push(this.gbl(bl+1) + 	'if "ID" in handle.attrs.keys():' );
	cmd.push(this.gbl(bl+2) + 		'self.ID = str(handle.attrs["ID"])' );
	cmd.push(this.gbl(bl+1) + 	'else:' );
	cmd.push(this.gbl(bl+2) + 		'self.ID = str(uuid.uuid4())' );
	
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  

		/* writing the value */
		if (this.isAtomic(prop)) {			
			if(this.isArray(prop)){
				/* array of atomic type */
				
		cmd.push(this.gbl(bl+1) + 		'self._loadFromHDF5HandleItem(' + this.stringify(prop.name) + ', "AtomicArray", action=action)' );
			 }
			 else{
				 /* single atomic type value */
		cmd.push(this.gbl(bl+1) +		'self._loadFromHDF5HandleItem(' + this.stringify(prop.name) + ', "AtomicSingle", action=action)' );
			 }
		}
		else {
			/*
			 * creating references and saving other complex types 'value' will
			 * be a or an array of references
			 */
			
			/* create a subgroup for the contained values */
			
			cmd.push(this.gbl(bl+1) + 'if not(action == "init"):');
			if(this.isArray(prop)){
				/* array non-atomic type reference */
		cmd.push(this.gbl(bl+2) +		'self._loadFromHDF5HandleItem(' + this.stringify(prop.name) + ', "NonAtomicArray", action=action)' );
				 
			 }
			 else{
				 /* single non-atomic type reference */
		cmd.push(this.gbl(bl+2) +		'self._loadFromHDF5HandleItem(' + this.stringify(prop.name) + ', "NonAtomicSingle", action=action)' );
			 }

		}
	}
	cmd.push(this.gbl(bl+1));
	
	
	cmd.push(this.gbl(bl+1) + 'if self.STORAGE.isOpen():');
	cmd.push(this.gbl(bl+2) + 	'self.STORAGE.close()');
	
	
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
						'self._loadFromHDF5HandleItem(' + this.stringify(prop.name) + ', "AtomicArray", action="detach")' );
			 }
			 else{
				 /* single atomic type value */
				cmd.push(this.gbl(bl+2) + 
						'self._loadFromHDF5HandleItem(' + this.stringify(prop.name) + ', "AtomicSingle", action="detach")' );
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
	'def _loadFromHDF5HandleItem(self, varName, myType, action = "init"):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'loadFlag = True');
		
	// cmd.push(this.getBlockSpace(bl+1) +
	// 'if (varName in self._sync.keys()):');
	// cmd.push(this.getBlockSpace(bl+2) +
	// 'if (self._sync[varName] == 1):');
	// cmd.push(this.getBlockSpace(bl+3) +
	// 'saveFlag = True');

	cmd.push(this.gbl(bl+1) + 	'if not(self.STORAGE.isConnected()):');
	cmd.push(this.gbl(bl+1) + 	'    raise Exception("item is not connected to any HDF file.")');

	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.isConnected() and not(self.STORAGE.isOpen()):');
	cmd.push(this.gbl(bl+1) + 	'    self.STORAGE.openRead()');
	
	cmd.push(this.gbl(bl+1) + 	'handle = self.STORAGE.data');
	cmd.push(this.gbl(bl+1) + 	'if (loadFlag):');
	cmd.push(this.gbl(bl+2) + 		'if (myType == "AtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromHDF5HandleItemAtomicSingle(handle, varName, action)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "AtomicArray"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromHDF5HandleItemAtomicArray(handle, varName, action)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "NonAtomicArray"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromHDF5HandleItemNonAtomicArray(handle, varName, action)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "NonAtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromHDF5HandleItemNonAtomicSingle(handle, varName, action)' );
	
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
	
	cmd.push(this.gbl(bl) + 'def _loadFromHDF5HandleItemAtomicSingle(self, handle, varName, stat="init"):');

	/* single atomic type value */
	cmd.push(this.gbl(bl+1) + 	'try :');
	cmd.push(this.gbl(bl+2) + 		'if (stat == "init") or (stat == "sync"):');
	cmd.push(this.gbl(bl+3) + 			'if not(varName in  self._loadedItems):');
	cmd.push(this.gbl(bl+4) + 				'self._loadedItems.append(varName)');
	cmd.push(this.gbl(bl+3) + 			'if (varName in handle.keys()):');
	cmd.push(this.gbl(bl+4) + 				'val = handle[varName].value' );
	cmd.push(this.gbl(bl+4) + 				'if isinstance(val,np.ndarray):' );
	cmd.push(this.gbl(bl+5) + 					'val = val[0]' );
	cmd.push(this.gbl(bl+4) + 				'setattr(self,varName, val)' );
	cmd.push(this.gbl(bl+3) + 			'else:');
	cmd.push(this.gbl(bl+4) + 				'if varName == "name":' );
	cmd.push(this.gbl(bl+5) + 					'setattr(self,varName, handle.name.split("/")[-1])' );
	cmd.push(this.gbl(bl+4) + 				'else:' );
	cmd.push(this.gbl(bl+5) + 					'initFunc = getattr(self,"_getInitValue" + varName[0].capitalize() + varName[1:])' );
	cmd.push(this.gbl(bl+5) + 					'setattr(self,varName, initFunc())' );
	cmd.push(this.gbl(bl+2) + 		'elif (stat == "detach"):');
	cmd.push(this.gbl(bl+3) + 			'if (varName in handle.keys()) and not(varName in  self._loadedItems):');
	cmd.push(this.gbl(bl+4) + 				'self._loadedItems.append(varName)');
	cmd.push(this.gbl(bl+4) + 				'val = handle[varName].value' );
	cmd.push(this.gbl(bl+4) + 				'if isinstance(val,np.ndarray):' );
	cmd.push(this.gbl(bl+5) + 					'val = val[0]' );
	cmd.push(this.gbl(bl+4) + 				'setattr(self,varName, val)' );
	cmd.push(this.gbl(bl+2) + 		'else:');
	cmd.push(this.gbl(bl+3) + 			'raise Exception("action %s is not known."%stat)');

	cmd.push(this.gbl(bl+1) +	'except AttributeError:');
	cmd.push(this.gbl(bl+2) +		'print "Warning: %s was not loaded properly. "%varName');
	cmd.push(this.gbl(bl+2) +		'traceback.print_exc()');
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
	
	cmd.push(this.gbl(bl) + 'def _loadFromHDF5HandleItemAtomicArray(self, handle, varName, stat="init"):');

	/* array of atomic type */
	cmd.push(this.gbl(bl+1) +	'try :');
	cmd.push(this.gbl(bl+2) + 		'if (stat == "init"):');
	//cmd.push(this.gbl(bl+3) + 			'initFunc = getattr(self,"_getInitValue" + varName[0].capitalize() + varName[1:])' );
	//cmd.push(this.gbl(bl+3) + 			'setattr(self,"_"+varName, initFunc())' );
	cmd.push(this.gbl(bl+3) + 			'setattr(self,"_"+varName,  np.array([]))' );
	cmd.push(this.gbl(bl+3) + 			'if (varName in  self._loadedItems):');
	cmd.push(this.gbl(bl+4) + 				'self._loadedItems.pop(self._loadedItems.index(varName))');
		
	cmd.push(this.gbl(bl+2) + 		'elif (stat == "detach"):');
	cmd.push(this.gbl(bl+3) + 			'if not(varName in  self._loadedItems):');
	cmd.push(this.gbl(bl+4) +	 			'if (varName in handle.keys()):');
	cmd.push(this.gbl(bl+5) + 					'setattr(self,"_"+varName, handle[varName].value)' );
	cmd.push(this.gbl(bl+4) + 				'self._loadedItems.append(varName)');
	
	cmd.push(this.gbl(bl+2) + 		'elif (stat == "sync"):');
	cmd.push(this.gbl(bl+3) + 			'if (varName in handle.keys()):');
	cmd.push(this.gbl(bl+4) + 				'setattr(self,"_"+varName, handle[varName].value)' );
	cmd.push(this.gbl(bl+3) + 			'else:');
	cmd.push(this.gbl(bl+4) + 				'initFunc = getattr(self,"_getInitValue" + varName[0].capitalize() + varName[1:])' );
	cmd.push(this.gbl(bl+4) + 				'setattr(self,"_"+varName, initFunc())' );
	cmd.push(this.gbl(bl+3) + 			'if not(varName in  self._loadedItems):');
	cmd.push(this.gbl(bl+4) + 				'self._loadedItems.append(varName)');
	
	cmd.push(this.gbl(bl+2) + 		'else:');
	cmd.push(this.gbl(bl+3) + 			'raise Exception("action %s is not known."%stat)');
	
	cmd.push(this.gbl(bl+1) +	'except AttributeError:');
	cmd.push(this.gbl(bl+2) +		'print "Warning: %s was not loaded properly. "%varName');
	cmd.push(this.gbl(bl+2) +		'traceback.print_exc()');
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
	
	cmd.push(this.gbl(bl) + 'def _loadFromHDF5HandleItemNonAtomicSingle(self, handle, varName, stat="init"):');

	/* single atomic type value */
	cmd.push(this.gbl(bl+1) +	'obj = getattr(self,"_"+varName)');

	cmd.push(this.gbl(bl+1) + 	'try :');
	
	cmd.push(this.gbl(bl+2) + 		'if not(varName in self._loadedItems):');
	cmd.push(this.gbl(bl+3) + 			'self._loadedItems.append(varName)');
	
	cmd.push(this.gbl(bl+2) + 		'if (stat == "init") or (stat == "sync"):');
	cmd.push(this.gbl(bl+3) + 			'if (varName in handle.keys()):');
	cmd.push(this.gbl(bl+4) +				'if (obj == None):');
	cmd.push(this.gbl(bl+5) + 					'creFunc = getattr(self,"renew"+varName[0].capitalize()+varName[1:])');
	cmd.push(this.gbl(bl+5) + 					'obj = creFunc()');
	cmd.push(this.gbl(bl+4) + 		 		'subStor = self.STORAGE.clone()');
	cmd.push(this.gbl(bl+4) + 		 		'subStor.appendPath(varName)');
	cmd.push(this.gbl(bl+4) +	 			'obj.loadFromHDF5Handle(storage=subStor, action=stat)');
	
	cmd.push(this.gbl(bl+3) + 			'else:');
	cmd.push(this.gbl(bl+4) + 				'initFunc = getattr(self,"_getInitValue" + varName[0].capitalize() + varName[1:])' );
	cmd.push(this.gbl(bl+4) + 				'setattr(self,"_"+varName, initFunc())' );
	
	
	cmd.push(this.gbl(bl+2) + 		'elif (stat == "detach"):');
	cmd.push(this.gbl(bl+3) + 			'if (varName in handle.keys()):');
	cmd.push(this.gbl(bl+4) + 				'if (obj != None):');
	cmd.push(this.gbl(bl+5) + 					'if (obj.STORAGE != None):');
	cmd.push(this.gbl(bl+6) + 						'subStor = obj.STORAGE');
	cmd.push(this.gbl(bl+5) + 					'else:');
	cmd.push(this.gbl(bl+6) + 		 				'subStor = self.STORAGE.clone()');
	cmd.push(this.gbl(bl+6) + 		 				'subStor.appendPath(varName)');
	cmd.push(this.gbl(bl+5) +	 				'obj.loadFromHDF5Handle(storage=subStor,action=stat)');
	cmd.push(this.gbl(bl+4) + 				'else:');
	cmd.push(this.gbl(bl+5) + 					'creFunc = getattr(self,"renew"+varName[0].capitalize()+varName[1:])');
	cmd.push(this.gbl(bl+5) + 					'obj = creFunc()');
	cmd.push(this.gbl(bl+5) + 		 			'subStor = self.STORAGE.clone()');
	cmd.push(this.gbl(bl+5) + 		 			'subStor.appendPath(varName)');
	cmd.push(this.gbl(bl+5) +	 				'obj.loadFromHDF5Handle(storage=subStor, action="sync")');
	cmd.push(this.gbl(bl+2) + 		'else:');
	cmd.push(this.gbl(bl+3) + 			'raise Exception("action %s is not known."%stat)');
	

	

	cmd.push(this.gbl(bl+1) +	'except AttributeError:');
	cmd.push(this.gbl(bl+2) +		'print "Warning: %s was not loaded properly. "%varName');
	cmd.push(this.gbl(bl+2) +		'traceback.print_exc()');
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
	
	cmd.push(this.gbl(bl) + 'def _loadFromHDF5HandleItemNonAtomicArray(self, handle, varName, stat="init"):');

	/* array of non-atomic type */

					
	cmd.push(this.gbl(bl+1) +	'try :');
	cmd.push(this.gbl(bl+2) + 		'if not(varName in self._loadedItems):');
	cmd.push(this.gbl(bl+3) + 			'self._loadedItems.append(varName)');
	
	cmd.push(this.gbl(bl+2) + 		'if (stat == "init") or (stat == "sync") :');
	cmd.push(this.gbl(bl+3) + 			'if (varName in handle.keys()):');
	
	cmd.push(this.gbl(bl+4) + 				'order = handle[varName].attrs["order"]');	
	cmd.push(this.gbl(bl+4) + 				'if not(isinstance(order,np.ndarray)):');	
	cmd.push(this.gbl(bl+5) + 					'order = np.array(order.split(","))');	

	cmd.push(this.gbl(bl+4) + 				'num = len(order)');
	cmd.push(this.gbl(bl+4) + 				'setattr(self,"_"+varName,[])');
	cmd.push(this.gbl(bl+4) + 				'creFunc = getattr(self,"append"+varName[0].capitalize()+varName[1:])');
	cmd.push(this.gbl(bl+4) + 				'for i in range(num):');
	cmd.push(this.gbl(bl+5) + 					'refObject = order[i]' );
	cmd.push(this.gbl(bl+5) + 					'obj = creFunc(refObject)');
	cmd.push(this.gbl(bl+5) + 					'subStor = self.STORAGE.clone()');
	cmd.push(this.gbl(bl+5) + 					'subStor.appendPath(varName)');
	cmd.push(this.gbl(bl+5) + 					'subStor.appendPath(refObject)');
	
	cmd.push(this.gbl(bl+5) +	 				'obj.loadFromHDF5Handle(storage=subStor, action=stat)');
	
	cmd.push(this.gbl(bl+3) + 			'else:');
	cmd.push(this.gbl(bl+4) + 				'initFunc = getattr(self,"_getInitValue" + varName[0].capitalize() + varName[1:])' );
	cmd.push(this.gbl(bl+4) + 				'setattr(self,"_"+varName, initFunc())' );
	
	
	cmd.push(this.gbl(bl+2) + 		'elif (stat == "detach"):');
	cmd.push(this.gbl(bl+3) + 			'if (varName in handle.keys()):');
	cmd.push(this.gbl(bl+4) + 				'objs = getattr(self,"_"+varName)');
	
	cmd.push(this.gbl(bl+4) + 				'handles = handle[varName].attrs["order"]');	
	cmd.push(this.gbl(bl+4) + 				'if not(isinstance(handles,np.ndarray)):');	
	cmd.push(this.gbl(bl+5) + 					'handles = np.array(handles.split(","))');	

	cmd.push(this.gbl(bl+4) + 				'if (len(objs) == 0):');
	cmd.push(this.gbl(bl+5) + 					'#object are not created, first create then invoke the load command.');

	cmd.push(this.gbl(bl+5) + 					'num = len(handles)');
	cmd.push(this.gbl(bl+5) + 					'setattr(self,"_"+varName,[])');
	cmd.push(this.gbl(bl+5) + 					'creFunc = getattr(self,"append"+varName[0].capitalize()+varName[1:])');
	cmd.push(this.gbl(bl+5) + 					'for i in range(num):');
	cmd.push(this.gbl(bl+6) + 						'refObject = handles[i]' );
	cmd.push(this.gbl(bl+6) + 						'obj = creFunc(refObject)');
	cmd.push(this.gbl(bl+6) + 						'subStor = self.STORAGE.clone()');
	cmd.push(this.gbl(bl+6) + 						'subStor.appendPath(varName)');
	cmd.push(this.gbl(bl+6) + 						'subStor.appendPath(refObject)');
	
	cmd.push(this.gbl(bl+6) +	 					'obj.loadFromHDF5Handle(storage=subStor, action="sync")');

	cmd.push(this.gbl(bl+4) + 				'else:');
	cmd.push(this.gbl(bl+5) + 					'#object are alreasy created, just invoke the load command.');

	cmd.push(this.gbl(bl+5) + 					'for obj in objs:');
	cmd.push(this.gbl(bl+6) +	 					'if (obj.name in handles):');
	cmd.push(this.gbl(bl+7) + 							'if (obj.STORAGE != None):');
	cmd.push(this.gbl(bl+8) + 								'subStor = obj.STORAGE');
	cmd.push(this.gbl(bl+7) + 							'else:');
	cmd.push(this.gbl(bl+8) + 								'subStor = self.STORAGE.clone()');
	cmd.push(this.gbl(bl+8) + 								'subStor.appendPath(varName)');
	cmd.push(this.gbl(bl+8) + 								'subStor.appendPath(obj.name)');
	cmd.push(this.gbl(bl+7) +	 						'obj.loadFromHDF5Handle(storage=subStor,action=stat)');

	cmd.push(this.gbl(bl+2) + 		'else:');
	cmd.push(this.gbl(bl+3) + 			'raise Exception("action %s is not known."%stat)');
	

	
	cmd.push(this.gbl(bl+1) +	'except AttributeError:');
	cmd.push(this.gbl(bl+2) +		'print "Warning: %s was not loaded properly. "%varName');
	cmd.push(this.gbl(bl+2) +		'traceback.print_exc()');
	cmd.push(this.gbl(bl+2) + 		'pass' );

	cmd.push(this.gbl(bl+1) + 'pass');
	
    return cmd.join('\n');
};

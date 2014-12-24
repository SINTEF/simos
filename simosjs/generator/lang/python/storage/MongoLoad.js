//var njs = require('../../njs')();

/*----------------------------------------------------------------------------*/
function MongoLoad(){
};
exports.MongoLoad = MongoLoad;
/*----------------------------------------------------------------------------*/
MongoLoad.prototype.loadFromMongo = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def loadFromMongo(self, storage=None):');
	cmd.push(this.gbl(bl+1) + 	'self._loadInit()');
	cmd.push(this.gbl(bl+1) + 	'self._loadedItems = []');
	cmd.push(this.gbl(bl+1) + 	'if storage != None:' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE = storage' );
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) + 	'if not(self.STORAGE.isConnected()):' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE.connect()' );
	
	cmd.push(this.gbl(bl+1) + 	'self._loadDataFromMongo()' );
	
	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.isConnected():' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE.disconnect()' );
	
		
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
MongoLoad.prototype.loadDataFromMongo = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	/* ================================================== */
	cmd.push(this.gbl(bl) + 'def _loadDataFromMongo(self):');
	
	/* for inheritence */
	/*
	if (this.isDerived()) {
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +
					supType.name + '._loadDataFromMongo(self,handle)');
				
		}
		cmd.push(this.gbl(bl+1) + '');
	}
	*/

	cmd.push(this.gbl(bl+1) + 'if not(self.STORAGE.isConnected()):');
	cmd.push(this.gbl(bl+2) + 	'self.STORAGE.connect()');
	
	cmd.push(this.gbl(bl+1) + 	'data = self.STORAGE.data' );
	cmd.push(this.gbl(bl+1) + 	'self.ID = str(data["_id"])' );
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  


		/* writing the value */
		if (this.isAtomic(prop)) {
			if (this.isSingle(prop)){
				 /* single atomic type value */
	cmd.push(this.gbl(bl+1) + 	'self._loadFromMongoItem(data, ' + this.stringify(prop.name) + ', "AtomicSingle")' );
	cmd.push(this.gbl(bl+1) + 	'self._loadedItems.append(' + this.stringify(prop.name) + ')');
			 }
		}
	}
	cmd.push(this.gbl(bl+1));

	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.isConnected():' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE.disconnect()' );
	
	cmd.push(this.gbl(bl+1) + 'pass');
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoLoad.prototype.loadDataItemFromMongo = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	/* ================================================== */
	cmd.push(this.gbl(bl) + 'def _loadDataItemFromMongo(self, itemName):');
	
	/* for inheritence */
	/*
	if (this.isDerived()) {
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +
					supType.name + '._loadDataFromMongo(self,handle)');
				
		}
		cmd.push(this.gbl(bl+1) + '');
	}
	*/
	
	cmd.push(this.gbl(bl+1) + 'if not(self.STORAGE.isConnected()):');
	cmd.push(this.gbl(bl+2) + 	'self.STORAGE.connect()');
        
	cmd.push(this.gbl(bl+1) + 	'data = self.STORAGE.data' );
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  

		cmd.push(this.gbl(bl+1) + 'if (itemName == ' + this.stringify(prop.name) + '):' );
		/* writing the value */
		if (this.isAtomic(prop)) {
			if(this.isArray(prop)){
				/* array of atomic type */
				
		cmd.push(this.gbl(bl+2) +	'self._loadFromMongoItem(data, ' + this.stringify(prop.name) + ', "AtomicArray")' );
			 }
			 else{
				 /* single atomic type value */
		cmd.push(this.gbl(bl+2) +	'self._loadFromMongoItem(data, ' + this.stringify(prop.name) + ', "AtomicSingle")' );
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
		cmd.push(this.gbl(bl+2) +	'self._loadFromMongoItem(data, ' + this.stringify(prop.name) + ', "NonAtomicArray")' );
				 
			 }
			 else{
				 /* single non-atomic type reference */
		cmd.push(this.gbl(bl+2) +	'self._loadFromMongoItem(data, ' + this.stringify(prop.name) + ', "NonAtomicSingle")' );
			 }

		}

		

	}
	cmd.push(this.gbl(bl+1));
	
	cmd.push(this.gbl(bl+1) + 'if self.STORAGE.isConnected():');
	cmd.push(this.gbl(bl+2) + 	'self.STORAGE.disconnect()');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoLoad.prototype.loadFromMongoItem = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'def _loadFromMongoItem(self, handle, varName, myType):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'loadFlag = True');
		
	// cmd.push(this.getBlockSpace(bl+1) +
	// 'if (varName in self._sync.keys()):');
	// cmd.push(this.getBlockSpace(bl+2) +
	// 'if (self._sync[varName] == 1):');
	// cmd.push(this.getBlockSpace(bl+3) +
	// 'saveFlag = True');

	cmd.push(this.gbl(bl+1) + 	'if (loadFlag):');
	cmd.push(this.gbl(bl+2) + 		'if (myType == "AtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromMongoItemAtomicSingle(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "AtomicArray"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromMongoItemAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "NonAtomicArray"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromMongoItemNonAtomicArray(handle, varName)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "NonAtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromMongoItemNonAtomicSingle(handle, varName)' );
	
	cmd.push(this.gbl(bl+2) + 		'self._sync[varName] = -1' );
		
		 
	cmd.push(this.gbl(bl+1));

	cmd.push(this.gbl(bl+1) + 	'pass');
	
    return cmd.join('\n');
    

};
/*----------------------------------------------------------------------------*/
MongoLoad.prototype.loadFromMongoItemAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _loadFromMongoItemAtomicSingle(self, handle, varName):');

	 /* single atomic type value */
	cmd.push(this.gbl(bl+1) + 	'try :');
	cmd.push(this.gbl(bl+2) + 		'if (varName in handle.keys()):');
	cmd.push(this.gbl(bl+3) + 			'setattr(self,varName, handle[varName])' );
	cmd.push(this.gbl(bl+1) + 	'except :');
	cmd.push(this.gbl(bl+2) + 		'pass' );

	cmd.push(this.gbl(bl+1) + 	'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoLoad.prototype.loadFromMongoItemAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _loadFromMongoItemAtomicArray(self, handle, varName):');

	/* array of atomic type */
	cmd.push(this.gbl(bl+1) +	'try :');
	cmd.push(this.gbl(bl+2) + 		'if (varName in handle.keys()):');
	cmd.push(this.gbl(bl+3) +			'setattr(self, "_"+varName, np.array(handle[varName]))' );		
	cmd.push(this.gbl(bl+1) +	'except :');
	cmd.push(this.gbl(bl+2) +		'pass' );
	
	cmd.push(this.gbl(bl+1) +	'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoLoad.prototype.loadFromMongoItemNonAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _loadFromMongoItemNonAtomicSingle(self, handle, varName):');

	/* single atomic type value */
	cmd.push(this.gbl(bl+1) + 	'try :');
	cmd.push(this.gbl(bl+2) + 		'if (varName in handle.keys()):');
	cmd.push(this.gbl(bl+3) +			'obj = getattr(self,varName)');
	cmd.push(this.gbl(bl+3) +			'if (obj == None):');
	cmd.push(this.gbl(bl+4) + 				'creFunc = getattr(self,"create"+varName[0].capitalize()+varName[1:])');
	cmd.push(this.gbl(bl+4) + 				'obj = creFunc()');
	cmd.push(this.gbl(bl+3) + 		 	'subStor = self.STORAGE.clone()');
//	cmd.push(this.gbl(bl+3) + 		 	'subStor.id = handle[varName]');
	cmd.push(this.gbl(bl+3) + 		 	'subStor.path.append(varName)');
	cmd.push(this.gbl(bl+3) + 		 	'obj.loadFromMongo(subStor)');

	cmd.push(this.gbl(bl+2) + 		'else:');
	cmd.push(this.gbl(bl+3) + 			'setattr(self,\'_\'+varName, None)');
	
	cmd.push(this.gbl(bl+1) +	'except AttributeError:');
	cmd.push(this.gbl(bl+2) +		'print "Warning: %s was not loaded properly. "%varName');
	cmd.push(this.gbl(bl+2) +		'traceback.print_exc()');
	/*cmd.push(this.getBlockSpace(bl+2) + 
	'raise Exception("was not possible to load " + varName)' );*/
	 
	cmd.push(this.gbl(bl+1) + 	'pass');
		
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoLoad.prototype.loadFromMongoItemNonAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _loadFromMongoItemNonAtomicArray(self, handle, varName):');

	/* array of non-atomic type */

					
	cmd.push(this.gbl(bl+1) +	'try :');
	cmd.push(this.gbl(bl+2) + 		'if (varName in handle.keys()):');
	cmd.push(this.gbl(bl+3) + 			'num = len(handle[varName])');
	cmd.push(this.gbl(bl+3) + 			'setattr(self,varName,[])');
	cmd.push(this.gbl(bl+3) + 			'creFunc = getattr(self,"append"+varName[0].capitalize()+varName[1:])');
	cmd.push(this.gbl(bl+3) + 			'for i in range(num):');
	cmd.push(this.gbl(bl+4) + 				'refObject = handle[varName][i]' );
	cmd.push(this.gbl(bl+4) + 				'obj = creFunc(refObject)');
	cmd.push(this.gbl(bl+4) + 				'subStor = self.STORAGE.clone()');
	cmd.push(this.gbl(bl+4) + 				'subStor.id = refObject');
	
	cmd.push(this.gbl(bl+4) + 				'obj.loadFromMongo(subStor)');

	cmd.push(this.gbl(bl+2) + 		'else:');
	cmd.push(this.gbl(bl+3) + 			'setattr(self,\'_\'+varName, [])');
	
	cmd.push(this.gbl(bl+1) +	'except AttributeError:');
	cmd.push(this.gbl(bl+2) +		'print "Warning: %s was not loaded properly. "%varName');
	cmd.push(this.gbl(bl+2) +		'traceback.print_exc()');

	cmd.push(this.gbl(bl+1) + 'pass');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoLoad.prototype.loadAllDataFromMongo = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	/* ================================================== */
	cmd.push(this.gbl(bl) + 'def _loadAllDataFromMongo(self):');
	
	/* for inheritence */
	/*
	if (this.isDerived()) {
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +
					supType.name + '._loadDataFromMongoHandle(self,handle)');
				
		}
		cmd.push(this.gbl(bl+1) + '');
	}
	*/
	
	cmd.push(this.gbl(bl+1) + 'if not(self.STORAGE.isConnected()):');
	cmd.push(this.gbl(bl+2) + 	'self.STORAGE.connect()');
       
	cmd.push(this.gbl(bl+1) + 	'data = self.STORAGE.data' );
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  

		cmd.push(this.gbl(bl+1) + 	'if not(' + this.stringify(prop.name) + ' in self._loadedItems):');

		cmd.push(this.gbl(bl+2) + 		'self._loadedItems.append(data, ' + this.stringify(prop.name) + ')');

		/* writing the value */
		if (this.isAtomic(prop)) {
			if(this.isArray(prop)){
				/* array of atomic type */
				
		cmd.push(this.gbl(bl+2) + 		'self._loadFromMongoHandleItem(data, ' + this.stringify(prop.name) + ', "AtomicArray")' );
			 }
			 else{
				 /* single atomic type value */
		cmd.push(this.gbl(bl+2) +		'self._loadFromMongoHandleItem(data, ' + this.stringify(prop.name) + ', "AtomicSingle")' );
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
		cmd.push(this.gbl(bl+2) +		'self._loadFromMongoHandleItem(data, ' + this.stringify(prop.name) + ', "NonAtomicArray")' );
				 
			 }
			 else{
				 /* single non-atomic type reference */
		cmd.push(this.gbl(bl+2) +		'self._loadFromMongoHandleItem(data, ' + this.stringify(prop.name) + ', "NonAtomicSingle")' );
			 }

		}

		

	}
	cmd.push(this.gbl(bl+1));
	
	cmd.push(this.gbl(bl+1) + 'if self.STORAGE.isConnected():');
	cmd.push(this.gbl(bl+2) + 	'self.STORAGE.disconnect()');
	
    return cmd.join('\n');
};
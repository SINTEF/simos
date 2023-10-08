//var njs = require('../../njs')();

/*----------------------------------------------------------------------------*/
function MongoLoad(){
};
exports.MongoLoad = MongoLoad;
/*----------------------------------------------------------------------------*/
MongoLoad.prototype.loadMDBFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def loadMDB(self,id=None, storage=None, server="localhost", port = 27017, db = None, collection = None):');
	cmd.push(this.gbl(bl+1) + 	'if not(storage == None):');
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE = storage');
	cmd.push(this.gbl(bl+1) + 	'else:');
	cmd.push(this.gbl(bl+2) + 		'if (db == None) or (collection == None):');
	cmd.push(this.gbl(bl+3) + 			'raise Exception("storage, or, db and collection must be defined. ")');
	cmd.push(this.gbl(bl+2) + 		'else:');
	cmd.push(this.gbl(bl+3) + 			'self.STORAGE = pyds.getDataStorageBackEndServer("mongodb")');
	cmd.push(this.gbl(bl+3) + 			'self.STORAGE.dbName = db');
	cmd.push(this.gbl(bl+3) + 			'self.STORAGE.collectionName = collection');
	cmd.push(this.gbl(bl+1) + 	'if not(id == None):');
	cmd.push(this.gbl(bl+2) +		'self.ID = id');
	cmd.push(this.gbl(bl+1) +	'self.STORAGE.id = self.ID');
	cmd.push(this.gbl(bl));       
	cmd.push(this.gbl(bl+1) + 	'self.loadFromMongo()');
	cmd.push(this.gbl(bl));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MongoLoad.prototype.loadFromMongo = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def loadFromMongo(self, storage=None, action="init"):');
	cmd.push(this.gbl(bl+1) + 	'self._loadInit()');
	cmd.push(this.gbl(bl+1) + 	'self._loadedItems = []');
	cmd.push(this.gbl(bl+1) + 	'if storage != None:' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE = storage' );
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) + 	'if not(self.STORAGE.isConnected()):' );
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE.connect()' );
	
	cmd.push(this.gbl(bl+1) + 	'self._loadDataFromMongo(action=action)' );
	
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
	cmd.push(this.gbl(bl) + 'def _loadDataFromMongo(self, action="init"):');
	
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
	cmd.push(this.gbl(bl+1) + 	'self._loadFromMongoItem(data, ' + this.stringify(prop.name) + ', "AtomicSingle", action=action)' );
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
	'def _loadFromMongoItem(self, handle, varName, action):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'loadFlag = True');
		
	// cmd.push(this.getBlockSpace(bl+1) +
	// 'if (varName in list(self._sync.keys())):');
	// cmd.push(this.getBlockSpace(bl+2) +
	// 'if (self._sync[varName] == 1):');
	// cmd.push(this.getBlockSpace(bl+3) +
	// 'saveFlag = True');

	cmd.push(this.gbl(bl+1) + 	'if (loadFlag):');
	cmd.push(this.gbl(bl+2) + 		'if (myType == "AtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromMongoItemAtomicSingle(handle, varName, stat = action)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "AtomicArray"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromMongoItemAtomicArray(handle, varName, stat = action)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "NonAtomicArray"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromMongoItemNonAtomicArray(handle, varName, stat = action)' );
	cmd.push(this.gbl(bl+2) + 		'if (myType == "NonAtomicSingle"):');
	cmd.push(this.gbl(bl+3) + 			'self._loadFromMongoItemNonAtomicSingle(handle, varName, stat = action)' );
	
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
	
	cmd.push(this.gbl(bl) + 'def _loadFromMongoItemAtomicSingle(self, handle, varName, stat):');

	 /* single atomic type value */
	cmd.push(this.gbl(bl+1) + 	'try :');
	cmd.push(this.gbl(bl+2) + 		'if (varName in list(handle.keys())):');
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
	
	cmd.push(this.gbl(bl) + 'def _loadFromMongoItemAtomicArray(self, handle, varName, stat):');

	/* array of atomic type */
	cmd.push(this.gbl(bl+1) +	'try :');
	cmd.push(this.gbl(bl+2) + 		'if (varName in list(handle.keys())):');
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
	
	cmd.push(this.gbl(bl) + 'def _loadFromMongoItemNonAtomicSingle(self, handle, varName, stat):');

	/* single atomic type value */
	cmd.push(this.gbl(bl+1) + 	'try :');
	cmd.push(this.gbl(bl+2) + 		'if (varName in list(handle.keys())):');
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
	cmd.push(this.gbl(bl+2) +		'print("Warning: %s was not loaded properly. "%varName)');
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
	
	cmd.push(this.gbl(bl) + 'def _loadFromMongoItemNonAtomicArray(self, handle, varName, stat):');

	/* array of non-atomic type */

					
	cmd.push(this.gbl(bl+1) +	'try :');
	cmd.push(this.gbl(bl+2) + 		'if (varName in list(handle.keys())):');
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
	cmd.push(this.gbl(bl+2) +		'print("Warning: %s was not loaded properly. "%varName)');
	cmd.push(this.gbl(bl+2) +		'traceback.print_exc()');

	cmd.push(this.gbl(bl+1) + 'pass');
	
    return cmd.join('\n');
};

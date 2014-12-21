/*----------------------------------------------------------------------------*/
function SaveLoad(){
};
exports.SaveLoad = SaveLoad;
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
SaveLoad.prototype.saveFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	cmd.push(this.gbl(bl) + 	'def save(self,filePath=None, dsType = \'hdf5\'):');	
	cmd.push(this.gbl(bl+1) + 		'self.saveHDF5(filePath=filePath, dsType=dsType)');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SaveLoad.prototype.saveHDF5Func = function(bl) {
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
	cmd.push(this.gbl(bl+1) +		'storage = pyds.getDataStorageBackEndServer(dsType)');
	cmd.push(this.gbl(bl+1) +		'storage.filePath = filePath');
	cmd.push(this.gbl(bl+1) +		'storage.openWrite()');
	cmd.push(this.gbl(bl));    
	cmd.push(this.gbl(bl+1) +		'grpHandle = storage.handle');
	cmd.push(this.gbl(bl+1) +		'self._saveVertionsToHDF5Handle(grpHandle)');
	cmd.push(this.gbl(bl+1) +		'dgrp = grpHandle.create_group(self.name)' );
	cmd.push(this.gbl(bl));     
	cmd.push(this.gbl(bl+1) + 		'storage.path = self.STORAGE.path + self.name');
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
SaveLoad.prototype.saveMDBFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	cmd.push(this.gbl(bl) + 	'def saveMDB(self,server="localhost", port = 27017, db = None, collection = None):');
	cmd.push(this.gbl(bl+1) +		'storage = pyds.getDataStorageBackEndServer("mongodb")');
	cmd.push(this.gbl(bl+1) +		'if db == None:');
	cmd.push(this.gbl(bl+2) +			'if hasattr(self,"project"):');
	cmd.push(this.gbl(bl+3) +				'db = self.project.name');
	cmd.push(this.gbl(bl+2) +			'else:');
	cmd.push(this.gbl(bl+3) +				'raise Exception("db must be defined.")');
	cmd.push(this.gbl(bl+1) +		'if collection == None:');
	cmd.push(this.gbl(bl+3) +			'collection = self.name');
	cmd.push(this.gbl(bl+1) +		'storage.dbName = db');
	cmd.push(this.gbl(bl+1) +		'storage.collectionName = collection');
	cmd.push(this.gbl(bl+1) +		'storage.connect(server, port)');
	cmd.push(this.gbl(bl));    
	cmd.push(this.gbl(bl+1) +		'self._saved = {}');
	cmd.push(this.gbl(bl+1) +		'if storage.backEnd == \'mongodb\':');
	cmd.push(this.gbl(bl+2) +			'self.saveToMongo(storage)');
	cmd.push(this.gbl(bl+1) +		'else:');
	cmd.push(this.gbl(bl+2) +			'raise Exception("storage back-end " + self._storageBackEndType + " is not defined for MongoDB.")');
	cmd.push(this.gbl(bl));    
	cmd.push(this.gbl(bl+1) + 		'if storage.isConnected():');
	cmd.push(this.gbl(bl+2) +			'storage.disconnect()');
	cmd.push(this.gbl(bl+1) +		'return storage');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
SaveLoad.prototype.loadFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 	'def load(self,name=None, filePath=None, dsType = \'hdf5\'):');
	cmd.push(this.gbl(bl+1) + 		'loadHDF5(self,name, filePath, dsType)');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SaveLoad.prototype.loadHDF5Func = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 	'def loadHDF5(self,name=None, filePath=None, dsType = \'hdf5\'):');
	cmd.push(this.gbl(bl+1) + 	'if not(name == None):');
	cmd.push(this.gbl(bl+2) +			'self.name = name');
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
	cmd.push(this.gbl(bl+1) + 	'self._loadedItems = []');
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) + 	'self.STORAGE = pyds.getDataStorageBackEndServer(dsType)');
	cmd.push(this.gbl(bl+1) + 	'self.STORAGE.filePath = filePath');
	cmd.push(this.gbl(bl));     
	cmd.push(this.gbl(bl+1) + 	'self.STORAGE.path = self.STORAGE.path + self.name');
	cmd.push(this.gbl(bl));       
	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.backEnd == \'hdf5\':');
	cmd.push(this.gbl(bl+2) + 		'self.loadFromHDF5Handle()');
	cmd.push(this.gbl(bl+1) + 	'else:');
	cmd.push(this.gbl(bl+2) + 		'raise Exception("storage back-end " + self.STORAGE.backEnd + " is not defined.")');
	cmd.push(this.gbl(bl));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SaveLoad.prototype.loadMDBFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def loadMDB(self,id=None, storage=None, server="localhost", port = 27017, db = None, collection = None):');
	cmd.push(this.gbl(bl+1) + 	'if not(storage == None):');
	cmd.push(this.gbl(bl+2) + 		'self.STORAGE = storage');
	cmd.push(this.gbl(bl+1) + 	'else:');
	cmd.push(this.gbl(bl+2) + 		'if (db == None) or (collection == None):');
	cmd.push(this.gbl(bl+3) + 			'raise Excemption("storage, or, db and collection must be defined. ")');
	cmd.push(this.gbl(bl+2) + 		'else:');
	cmd.push(this.gbl(bl+3) + 			'self.STORAGE = pyds.getDataStorageBackEndServer("mongodb")');
	cmd.push(this.gbl(bl+3) + 			'self.STORAGE.dbName = db');
	cmd.push(this.gbl(bl+3) + 			'self.STORAGE.collectionName = collection');
	cmd.push(this.gbl(bl+1) + 	'if not(id == None):');
	cmd.push(this.gbl(bl+2) +		'self.ID = id');
	cmd.push(this.gbl(bl+1) +	'self.STORAGE.id = self.ID');
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) + 	'self._loadedItems = []');
	cmd.push(this.gbl(bl));       
	cmd.push(this.gbl(bl+1) + 	'self.loadFromMongo()');
	cmd.push(this.gbl(bl));
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
SaveLoad.prototype.loadAllFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def loadAll(self):');
	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.backEnd == \'hdf5\':');
	cmd.push(this.gbl(bl+2) + 		'self._loadAllDataFromHDF5()');
	cmd.push(this.gbl(bl+1) + 	'elif self.STORAGE.backEnd == \'mongodb\':');
	cmd.push(this.gbl(bl+2) + 		'self._loadAllDataFromMongo()');
	cmd.push(this.gbl(bl+1) + 	'else:');
	cmd.push(this.gbl(bl+2) + 		'raise Exception("storage back-end " + self.STORAGE.backEnd + " is not defined.")');
	

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SaveLoad.prototype.loadDataItemFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _loadDataItem(self,name):');
	cmd.push(this.gbl(bl+1) + 	'self._loadedItems.append(name)');
	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.backEnd == \'hdf5\':');
	cmd.push(this.gbl(bl+2) + 		'self._loadDataItemFromHDF5(name)');
	cmd.push(this.gbl(bl+1) + 	'elif self.STORAGE.backEnd == \'mongodb\':');
	cmd.push(this.gbl(bl+2) + 		'self._loadDataItemFromMongo(name)');
	cmd.push(this.gbl(bl+1) + 	'else:');
	cmd.push(this.gbl(bl+2) + 		'raise Exception("storage back-end " + self.STORAGE.backEnd + " is not defined.")');
	

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
SaveLoad.prototype.loadInitFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	/* ================================================== */
	cmd.push(this.gbl(bl) + 'def _loadInit(self):');
        
	var properties = this.getProperties();
	var propNum = properties.length;
	

	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  
		cmd.push(this.gbl(bl+2) + 		'self._loadedItems = []');
			
		if (this.isAtomic(prop)) {
			if(this.isArray(prop)){
		cmd.push(this.gbl(bl+2) + 		'self.' + this.makePrivate(prop.name) + ' = np.array([])' );
			}
			else{
				
			}
		}
		else {
			if(this.isArray(prop)){
		cmd.push(this.gbl(bl+2) + 		'self.' + this.makePrivate(prop.name) + ' = []' );
			}
			else{
		cmd.push(this.gbl(bl+2) + 		'self.' + this.makePrivate(prop.name) + ' = None' );
			 }

		}
		 
		cmd.push(this.gbl(bl+1));
		

	}
	cmd.push(this.gbl(bl+1));
	
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/

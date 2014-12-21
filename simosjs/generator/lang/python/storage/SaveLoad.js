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
	cmd.push(this.gbl(bl+1) + 		'if (filePath == None):');
	cmd.push(this.gbl(bl+2) + 			'if hasattr(self, \'name\'):');
	cmd.push(this.gbl(bl+3) + 				'filePath = self.name + \'.h5\'');
	cmd.push(this.gbl(bl+2) + 			'else:');
	cmd.push(this.gbl(bl+3) + 				'raise Exception("object needs name for saving.")');
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) +		'self.STORAGE = pyds.getDataStorageBackEndServer(dsType)');
	cmd.push(this.gbl(bl+1) +		'self.STORAGE.filePath = filePath');
	cmd.push(this.gbl(bl+1) +		'self.STORAGE.openWrite()');
	cmd.push(this.gbl(bl));    
	cmd.push(this.gbl(bl+1) +		'grpHandle = self.STORAGE.handle');
	cmd.push(this.gbl(bl+1) +		'self._saveVertionsToHDF5Handle(grpHandle)');
	cmd.push(this.gbl(bl+1) +		'dgrp = grpHandle.create_group(self.name)' );
	cmd.push(this.gbl(bl));     
	cmd.push(this.gbl(bl+1) + 	'self.STORAGE.path = self.STORAGE.path + self.name');
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) +		'self._saved = {}');
	cmd.push(this.gbl(bl+1) +		'if self.STORAGE.backEnd == \'hdf5\':');
	cmd.push(this.gbl(bl+2) +			'self.saveToHDF5Handle(dgrp)');
	cmd.push(this.gbl(bl+1) +		'else:');
	cmd.push(this.gbl(bl+2) +			'raise Exception("storage back-end " + self._storageBackEndType + " is not defined.")');
	cmd.push(this.gbl(bl));       
	cmd.push(this.gbl(bl+1) +		'self._STORAGE.close()');
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SaveLoad.prototype.loadFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 	'def load(self,name=None, filePath=None, dsType = \'hdf5\'):');
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
SaveLoad.prototype.loadDataItemFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _loadDataItem(self,name):');
	cmd.push(this.gbl(bl+1) + 	'self._loadedItems.append(name)');
	cmd.push(this.gbl(bl+1) + 	'if self.STORAGE.backEnd == \'hdf5\':');
	cmd.push(this.gbl(bl+2) + 		'self._loadDataItemFromHDF5(name)');
	cmd.push(this.gbl(bl+1) + 	'else:');
	cmd.push(this.gbl(bl+2) + 		'raise Exception("storage back-end " + self.STORAGE.backEnd + " is not defined.")');
	

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/


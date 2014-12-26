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
/*----------------------------------------------------------------------------*/
SaveLoad.prototype.loadFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 	'def load(self,name=None, filePath=None, dsType = \'hdf5\'):');
	cmd.push(this.gbl(bl+1) + 		'self.loadHDF5(name, filePath, dsType)');
	
	return cmd.join('\n');
};




/*----------------------------------------------------------------------------*/
SaveLoad.prototype.loadDataItemFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def _loadDataItem(self,name):');
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
	
	cmd.push(this.gbl(bl+2) + 		'self._loadedItems = []');
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];  
			
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

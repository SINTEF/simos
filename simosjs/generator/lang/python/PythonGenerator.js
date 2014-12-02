var PythonBase = require('./PythonBase.js').PythonBase;

/*----------------------------------------------------------------------------*/
function PythonGenerator(model){
	this.constructor(model);
};
/*----------------------------------------------------------------------------*/
PythonGenerator.prototype = Object.create(PythonBase.prototype);
/*----------------------------------------------------------------------------*/
PythonGenerator.prototype.constructor = function(model) {
	PythonBase.prototype.constructor(model);
};
/*----------------------------------------------------------------------------*/
PythonGenerator.prototype.toString = function() {
	return "PythonGenerator";
};
/*----------------------------------------------------------------------------*/
PythonGenerator.prototype.generate = function(model) {
	if (model != undefined)
		this.setModel(model);
	
	var entity =  this;
	
	var cmd = [];
	
	
	cmd.push('""" This an autogenerated file using simosjs.generator'); 
	cmd.push('    Please do not edit');
	cmd.push('    Babak Ommani, Offshore Hydrodynamic, MARINTEK """');
	cmd.push('');
	cmd.push('## ' + entity.getDescription());
	cmd.push('## Generated with ' + entity.getClassName() + ' version ' + entity.getVersion());
	cmd.push('');
	cmd.push('#------------------------------------------------------------------------------');
	cmd.push('#modules');
	cmd.push(entity.importModules());
	cmd.push('');
	cmd.push('#******************************************************************************');
	cmd.push('class ' + entity.getClassName() + '(' + entity.superTypesList() + '):');
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.classInit(1));	   
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push('    #creating set and gets');
	cmd.push(entity.propSetGet(1));
	cmd.push('');
	cmd.push('    #creating array functions for updating sizes');
	cmd.push(entity.arraysUpdateSize(1));
	cmd.push('');
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.reprFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.typeReprFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.dictReprFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.jsonReprFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.cloneFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.lookForEntityFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.hasEntityFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.getEntityFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.isSetFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.isContainedFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.getPropModelFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.factoryFunc(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push('    def save(self,filePath=None, dsType = \'hdf5\'):');
	cmd.push('        if (filePath == None):');
	cmd.push('            if hasattr(self, \'name\'):');
	cmd.push('                filePath = self.name + \'.h5\'');
	cmd.push('            else:');
	cmd.push('                raise Exception("object needs name for saving.")');
	cmd.push('');            
	cmd.push('        self._storageBackEndType = dsType');
	cmd.push('        self._storageBackEndServer = pyds.getDataStorageBackEndServer(self._storageBackEndType)');
	cmd.push('        self._storageBackEndServer.filePath = filePath');
	cmd.push('        self._storageBackEndServer.openWrite()');
	cmd.push('');        
	cmd.push('        grpHandle = self._storageBackEndServer.handle');
	cmd.push('        self._saveVertionsToHDF5Handle(grpHandle)');
	cmd.push('        dgrp = grpHandle.create_group(self.name)' );
	cmd.push('');
	cmd.push('        self._saved = {}');
	cmd.push('        if self._storageBackEndType == \'hdf5\':');
	cmd.push('            self.saveToHDF5Handle(dgrp)');
	cmd.push('        else:');
	cmd.push('            raise Exception("storage back-end " + self._storageBackEndType + " is not defined.")');
	cmd.push('');        
	cmd.push('        self._storageBackEndServer.close()');
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push('    def load(self,name=None, filePath=None, dsType = \'hdf5\'):');
	cmd.push('        if not(name == None):');
	cmd.push('            self.name = name');
	cmd.push('        if (name == None) and not(filePath == None):');
	cmd.push('            self.name = \'.\'.join(filePath.split(os.path.sep)[-1].split(\'.\')[0:-1])');
	cmd.push('        if (filePath == None):');
	cmd.push('            if hasattr(self, \'name\'):');
	cmd.push('                filePath = self.name + \'.h5\'');
	cmd.push('            else:');
	cmd.push('                raise Exception("object needs name for loading.")');
	cmd.push('');
	cmd.push('        self._storageBackEndType = dsType');
	cmd.push('        self._storageBackEndServer = pyds.getDataStorageBackEndServer(self._storageBackEndType)');
	cmd.push('        self._storageBackEndServer.filePath = filePath');
	cmd.push('');        
	cmd.push('        self._storageBackEndServer.openRead()');
	cmd.push('');        
	cmd.push('        grpHandle = self._storageBackEndServer.handle');
	cmd.push('');     
	cmd.push('        if self._storageBackEndType == \'hdf5\':');
	cmd.push('            self.loadFromHDF5Handle(grpHandle[self.name])');
	cmd.push('        else:');
	cmd.push('            raise Exception("storage back-end " + self._storageBackEndType + " is not defined.")');
	cmd.push('');
	cmd.push('        self._storageBackEndServer.close()');    
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.loadFromJSONDict(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.loadFromHDF5Handle(1));
	cmd.push(entity.loadDataFromHDF5Handle(1));
	cmd.push(entity.loadFromHDF5HandleItem(1));
	cmd.push(entity.loadFromHDF5HandleItemAtomicSingle(1));
	cmd.push(entity.loadFromHDF5HandleItemAtomicArray(1));
	cmd.push(entity.loadFromHDF5HandleItemNonAtomicSingle(1));
	cmd.push(entity.loadFromHDF5HandleItemNonAtomicArray(1));
	cmd.push('    #---------------------------------------------------------------------------');
	cmd.push(entity.saveVertionsToHDF5Handle(1));
	cmd.push(entity.saveToHDF5Handle(1));
	cmd.push(entity.saveDataToHDF5Handle(1));
	cmd.push(entity.saveToHDF5HandleItem(1));
	cmd.push(entity.saveToHDF5HandleItemAtomicSingle(1));
	cmd.push(entity.saveToHDF5HandleItemAtomicArray(1));
	cmd.push(entity.saveToHDF5HandleItemNonAtomicSingle(1));
	cmd.push(entity.saveToHDF5HandleItemNonAtomicArray(1));
	cmd.push('');
	cmd.push('#---------------------------------------------------------------------------');
	cmd.push('#modules');
	cmd.push(entity.getImportForCustomDataTypes());
	cmd.push('');      
	cmd.push('#******************************************************************************');
	
	return cmd.join('\n'); 
};

/*----------------------------------------------------------------------------*/
//module.exports = function(model) { return new PythonBase(model); };
exports.generator = new PythonGenerator();
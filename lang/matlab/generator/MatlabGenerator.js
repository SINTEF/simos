var MatlabBase = require('./MatlabBase.js').MatlabBase;

/*----------------------------------------------------------------------------*/
function MatlabGenerator(model){
	this.constructor(model);
};
/*----------------------------------------------------------------------------*/
MatlabGenerator.prototype = Object.create(MatlabBase.prototype);
/*----------------------------------------------------------------------------*/
MatlabGenerator.prototype.constructor = function(model) {
	MatlabBase.prototype.constructor(model);
};
/*----------------------------------------------------------------------------*/
MatlabGenerator.prototype.toString = function() {
	return "MatlabGenerator";
};
/*----------------------------------------------------------------------------*/
MatlabGenerator.prototype.generate = function(model) {
	if (model != undefined)
		this.setModel(model);
	
	var entity =  this;
	
	var cmd = [];
	
	cmd.push('% This an autogenerated file using simosjs.generator'); 
	cmd.push('% Please do not edit');
	cmd.push('');
	cmd.push('%**************************************************************************');
	cmd.push('%% ' + entity.getDescription());
	cmd.push('%% Generated with ' + entity.getClassName() + ' version ' + entity.getVersion());
	cmd.push('%**************************************************************************');
    cmd.push('');
	cmd.push('%**************************************************************************');
	cmd.push('classdef ' + entity.getClassName() + ' < handle');
	cmd.push('    %***********************************************************************');
    cmd.push('    properties');
	cmd.push('');
	cmd.push(entity.initPublicProperties(2));
    cmd.push('');
	cmd.push('    %----------------------------------------------------------------------');
	cmd.push(entity.getUserDefinedCode("prop_pub"));
	cmd.push('    %----------------------------------------------------------------------');    
	cmd.push('    end %properties');
	cmd.push('    %***********************************************************************');
	cmd.push('    properties (Constant)');
	cmd.push('');
	cmd.push(entity.initPublicConstantProperties(2));
    cmd.push('');
	cmd.push('    end %properties (Constant)');
	cmd.push('    %***********************************************************************');
	cmd.push('    properties (Constant, Hidden)');
	cmd.push('');
	cmd.push(entity.initPublicConstantHiddenProperties(2));
    cmd.push('');
	cmd.push('    end %properties (Constant, Hidden)');
	cmd.push('    %***********************************************************************');
	cmd.push('    properties (Dependent)');
	cmd.push('');
	cmd.push(entity.initPublicDependentProperties(2));
	cmd.push('');   
	cmd.push('    end %properties (Dependent)');
	cmd.push('    %***********************************************************************');
	cmd.push('    properties (SetAccess = protected)');
	cmd.push('');
	cmd.push('    end %properties (SetAccess = protected)');
	cmd.push('    %***********************************************************************');
	cmd.push('    properties ( Hidden)');
	cmd.push('');
	cmd.push(entity.initPublicHiddenProperties(2));
	cmd.push('');
	cmd.push('    %----------------------------------------------------------------------');
	cmd.push(entity.getUserDefinedCode("prop_hid"));
	cmd.push('    %----------------------------------------------------------------------');    	
	cmd.push('    end %properties ( Hidden)');
	cmd.push('    %***********************************************************************');
	cmd.push('    properties (SetAccess = private, Hidden)');
	cmd.push('');
	cmd.push(entity.initPrivateProperties(2));
	cmd.push('   ');
	cmd.push('    end %properties (SetAccess = private, Hidden)');
	cmd.push('    %***********************************************************************');
	cmd.push('    methods');
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push(entity.constructorFunc(1));
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    %Variables get and set functions');
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('');
	cmd.push( entity.modelFunc(1));
	cmd.push('');
	cmd.push( entity.propSetGet(1));
    cmd.push('');
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    %Group funcs ');
	cmd.push('    %-----------------------------------------------------------------------');
    cmd.push('');
	cmd.push( entity.getFromGroupFuncs(1));
    cmd.push('');
	cmd.push( entity.groupAppendFuncs(1));
    cmd.push('');
	cmd.push( entity.groupRemoveFuncs(1));
    cmd.push('');    
    cmd.push( entity.groupFactoryFuncs(1));
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    %Factory funcs ');
	cmd.push('    %-----------------------------------------------------------------------');
    cmd.push('');
	cmd.push( entity.factoryFuncPublic(1));
    cmd.push('');
	cmd.push( entity.cloneFunc(1));
    cmd.push('');
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    %check if field is set ');
	cmd.push('    %-----------------------------------------------------------------------');
    cmd.push('');
	cmd.push( entity.isSetFunc(1));
	cmd.push( entity.isContainedFunc(1));
	cmd.push( entity.getPropModelFunc(1));
	cmd.push( entity.hasEntityFunc(1));	
	cmd.push( entity.getEntityFunc(1));		
    cmd.push('');
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    % Struct text representation');
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push( entity.getMatStr(1));   
	cmd.push( entity.saveMatStr(1));    
	cmd.push( entity.saveMatStrWithName(1));    	
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    %file access');
	cmd.push('    %---------------------------------------------------------------------------');      
    cmd.push( entity.loadFunc(1));
	cmd.push( entity.loadHDF5Func(1));
	cmd.push( entity.loadFromHDF5Handle(1));
	cmd.push( entity.loadPartArrFromHDF5(1));
	cmd.push('    %---------------------------------------------------------------------------');
    cmd.push( entity.saveFunc(1));
	cmd.push( entity.saveHDF5Func(1));
	cmd.push( entity.saveToHDF5Handle(1));
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push( entity.hdf5DataType(1));
	
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push(entity.getUserDefinedCode("method_pub"));
	cmd.push('    %---------------------------------------------------------------------------');    	
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push('    end %methods ');
	cmd.push('    %***********************************************************************');
    cmd.push('');
	cmd.push('    %***********************************************************************');
	cmd.push('    methods (Access = protected, Hidden)');
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push(entity.getUserDefinedCode("method_hid"));
	cmd.push('    %---------------------------------------------------------------------------');	
    cmd.push('');
	cmd.push( entity.getPrivateNameFunc(1));
    cmd.push('');
	cmd.push( entity.cloneToFunc(1));
    cmd.push('');  
	cmd.push( entity.lookForEntityFunc(1));
    cmd.push('');    
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    %Array update size function');
	cmd.push('    %-----------------------------------------------------------------------');
    cmd.push('');
	cmd.push( entity.arraysUpdateSize(1));
    cmd.push('');
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    %Factory funcs ');
	cmd.push('    %-----------------------------------------------------------------------');
    cmd.push('');
	cmd.push( entity.factoryFuncPrivate(1));
    cmd.push('');    
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    %Group save and load preparations');
	cmd.push('    %-----------------------------------------------------------------------');
    cmd.push('');
    cmd.push( entity.getFromGroupMembersFuncs(1));
    cmd.push('');
	cmd.push( entity.prepareGroupsForSavingFuncs(1));
    cmd.push('');
    cmd.push( entity.initGroupsAfterLoadingFuncs(1));
    cmd.push('');
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    % Struct text representation');
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push( entity.getMatStrHandle(1));
	cmd.push( entity.getMatStrItem(1));
	cmd.push( entity.getMatStrItemAtomicSingle(1));
	cmd.push( entity.getMatStrItemAtomicArray(1));
	cmd.push( entity.getMatStrItemNonAtomicSingle(1));
	cmd.push( entity.getMatStrItemNonAtomicArray(1));
    
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    %file access, Load');
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push( entity.loadDataFromHDF5Handle(1));
	cmd.push( entity.loadFromHDF5HandleItem(1));
	cmd.push( entity.loadFromHDF5HandleItemAtomicSingle(1));
	cmd.push( entity.loadFromHDF5HandleItemAtomicArray(1));
	cmd.push( entity.loadFromHDF5HandleItemNonAtomicSingle(1));
	cmd.push( entity.loadFromHDF5HandleItemNonAtomicArray(1));
	cmd.push('    %-----------------------------------------------------------------------');
	cmd.push('    %file access, Save');
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push( entity.saveDataToHDF5Handle(1));
	cmd.push( entity.saveToHDF5HandleItem(1));
	cmd.push( entity.saveToHDF5HandleItemAtomicSingle(1));
	cmd.push( entity.saveToHDF5HandleItemAtomicArray(1));
	cmd.push( entity.saveToHDF5HandleItemNonAtomicSingle(1));
	cmd.push( entity.saveToHDF5HandleItemNonAtomicArray(1));
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push('    end %methods (Access = protected, Hidden)');
	cmd.push('    %***********************************************************************');
    cmd.push('');
	cmd.push('    %***********************************************************************');
	cmd.push('    methods (Static)');
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push(entity.getUserDefinedCode("method_static"));
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push('    end %methods (Static)');
	cmd.push('    %***********************************************************************');
	cmd.push('');
	cmd.push('    %***********************************************************************');
	cmd.push('    methods (Static, Access = protected, Hidden)');
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push(entity.getUserDefinedCode("method_static_hid"));	
	cmd.push('    %---------------------------------------------------------------------------');
	cmd.push('    end %methods (Static, Access = protected, Hidden)');
	cmd.push('    %***********************************************************************');
	cmd.push('end %end of class ' + entity.getClassName());
	cmd.push('%**************************************************************************');
    cmd.push('');
	cmd.push('');
	cmd.push('%******************************************************************************');
	
	return cmd.join('\n'); 
};

/*----------------------------------------------------------------------------*/
//module.exports = function(model) { return new PythonBase(model); };
exports.generator = new MatlabGenerator();

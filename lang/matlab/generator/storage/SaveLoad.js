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

	cmd.push(this.gbl(bl) + 	'function save(' + this.objName() + ',filePath, dsType)');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'filePath\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'filePath = strcat(' + this.objName() + '.name, \'.h5\'); ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'dsType\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'dsType = \'hdf5\'; ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 	this.objName() + '.saveHDF5(filePath);');
	cmd.push('    end');
	
	return cmd.join('\n');
};


/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
SaveLoad.prototype.loadFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + 	'function load(' + this.objName() + ',name,filePath, dsType,action)');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'filePath\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'filePath = strcat(' + this.objName() + '.name, \'.h5\'); ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'dsType\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'dsType = \'hdf5\'; ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'name\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'name = ' + this.objName() + '.name; ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'action\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'action = \'init\'; ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 	this.objName() + '.loadHDF5(name,filePath, dsType,action);');
	cmd.push('    end');
	
	return cmd.join('\n');
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/

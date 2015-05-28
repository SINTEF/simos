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

	cmd.push(this.gbl(bl) + 	'function load(' + this.objName() + ',varargin)');
	cmd.push(this.gbl(bl+1) + 		'allowedParams = {\'name\',\'filePath\', \'dsType\',\'action\'};');
	cmd.push(this.gbl(bl+1) + 		'options = simos.parseArgs(varargin,allowedParams);');
	cmd.push(this.gbl(bl+1) + 		'if ~(simos.hasField(options,\'filePath\'))'); 
	cmd.push(this.gbl(bl+2) + 			'options.filePath = strcat(' + this.objName() + '.name, \'.h5\'); ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) + 		'if ~(simos.hasField(options,\'dsType\'))'); 
	cmd.push(this.gbl(bl+2) + 			'options.dsType = \'hdf5\'; ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) + 		'if ~(simos.hasField(options,\'name\'))'); 
	cmd.push(this.gbl(bl+2) + 			'options.name = ' + this.objName() + '.name; ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) + 		'if ~(simos.hasField(options,\'action\'))'); 
	cmd.push(this.gbl(bl+2) + 			'options.action = \'init\'; ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 	this.objName() + '.loadHDF5(options.name,options.filePath, options.dsType,options.action);');
	cmd.push('    end');
	
	return cmd.join('\n');
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/

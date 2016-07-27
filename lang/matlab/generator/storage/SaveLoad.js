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

	cmd.push(this.gbl(bl) + 	'function save(' + this.objName() + ',varargin)');
	cmd.push(this.gbl(bl+1) + 		'allowedParams = {\'filePath\', \'dsType\'};');
	cmd.push(this.gbl(bl+1) + 		'options = simos.parseArgs(varargin,allowedParams);');
	cmd.push(this.gbl(bl+1) + 		'if ~(simos.hasField(options,\'filePath\'))'); 
	cmd.push(this.gbl(bl+2) + 			'options.filePath = strcat(' + this.objName() + '.name, \'.h5\'); ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1) + 		'if ~(simos.hasField(options,\'dsType\'))'); 
	cmd.push(this.gbl(bl+2) + 			'options.dsType = \'hdf5\'; ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 		'if (strcmp(options.dsType, \'hdf5\')==1)'); 
	cmd.push(this.gbl(bl+2) + 			this.objName() + '.saveHDF5(options.filePath);');
	cmd.push(this.gbl(bl+1) + 		'elseif (strcmp(options.dsType, \'matstr\')==1)'); 	
	cmd.push(this.gbl(bl+2) + 			this.objName() + '.saveMatStr(options.filePath);');
	cmd.push(this.gbl(bl+1) + 		'else'); 
	cmd.push(this.gbl(bl+2) + 			'error([\' Data Storage Type (dsType) \' options.dsType \' is not defined for saving.\']);');	
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl) +		'end');
	
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
	cmd.push(this.gbl(bl+1) + 		'if (strcmp(options.dsType, \'hdf5\')==1)'); 
	cmd.push(this.gbl(bl+2) + 			this.objName() + '.loadHDF5(options.name,options.filePath, options.dsType,options.action);');
	cmd.push(this.gbl(bl+1) + 		'else'); 
	cmd.push(this.gbl(bl+2) + 			'error([\' Data Storage Type (dsType) \' options.dsType \' is not defined for loading.\']);');	
	cmd.push(this.gbl(bl+1) + 		'end ');	
	cmd.push(this.gbl(bl) +		'end');
	
	return cmd.join('\n');
	};

/*----------------------------------------------------------------------------*/

/*----------------------------------------------------------------------------*/
function DMTLoad(){
};
exports.DMTLoad = DMTLoad;

/*----------------------------------------------------------------------------*/
DMTLoad.prototype.loadFromDMTDict = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def loadFromDMTDict(self, data):');

	//cmd.push(this.getBlockSpace(bl+1) + 
	//	'self.ID = str(data["__ID__"])' );
	
	var properties = this.getProperties();
	
	for(var i = 0, ilen=properties.length; i < ilen; i++) {
		var prop = properties[i];  
		cmd.push(this.getBlockSpace(bl+1) + 
			'varName = ' + this.stringify(prop.name) );
		if (this.isAtomic(prop)) {
			if (this.isSingle(prop)) {
				cmd.push(this.getBlockSpace(bl+1) + 
				'try :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'setattr(self,varName, data[varName])' );
				cmd.push(this.getBlockSpace(bl+1) + 
				'except :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'pass ' );
			}
			else{
				cmd.push(this.getBlockSpace(bl+1) + 
				'try :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'setattr(self,varName, np.array(data[varName]))' );
				cmd.push(this.getBlockSpace(bl+1) + 
				'except :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'pass' );			
			}
		}
		else {
			if (this.isSingle(prop)) {
				cmd.push(this.getBlockSpace(bl+1) + 
				'try :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'createFunc = getattr(self,"create" + varName[0].capitalize()+varName[1:] )' );
				cmd.push(this.getBlockSpace(bl+2) + 
					'item = createFunc()' );
				cmd.push(this.getBlockSpace(bl+2) + 
					'item.loadFromDMTDict(data[varName])' );
				cmd.push(this.getBlockSpace(bl+1) + 
				'except :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'pass' );
			}
			else{
				cmd.push(this.getBlockSpace(bl+1) + 
				'try :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'createFunc = getattr(self,"append" + varName[0].capitalize()+varName[1:])' );
				cmd.push(this.getBlockSpace(bl+2) + 
					'for i0 in range(0,len(data[varName])):' );
				cmd.push(this.getBlockSpace(bl+3) + 
						'item = createFunc()' );
				cmd.push(this.getBlockSpace(bl+3) + 
						'item.loadFromDMTDict(data[varName][i0])' );
				cmd.push(this.getBlockSpace(bl+1) + 
				'except :');
				cmd.push(this.getBlockSpace(bl+2) + 
					'pass' );
			 }

		}

		cmd.push(this.getBlockSpace(bl+1));

	}

	
	cmd.push(this.getBlockSpace(bl+1) + 
	'pass');
	
	cmd.push(this.getBlockSpace(bl+1));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
DMTLoad.prototype.loadDMTFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def loadDMT(self,name = None, filePath = None):');
	cmd.push(this.gbl(bl+1) + 	'if not(name == None):');
	cmd.push(this.gbl(bl+2) +			'self.name = name');
	cmd.push(this.gbl(bl+1) + 	'if (name == None) and not(filePath == None):');
	cmd.push(this.gbl(bl+2) + 		'self.name = \'.\'.join(filePath.split(os.path.sep)[-1].split(\'.\')[0:-1])');
	cmd.push(this.gbl(bl+1) + 	'if (filePath == None):');
	cmd.push(this.gbl(bl+2) + 		'if hasattr(self, \'name\'):');
	cmd.push(this.gbl(bl+3) + 			'filePath = self.name + \'.json\'');
	cmd.push(this.gbl(bl+2) + 		'else:');
	cmd.push(this.gbl(bl+3) + 			'raise Exception("object needs name for loading.")');
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) + 	'if not(os.path.isfile(filePath)):');
	cmd.push(this.gbl(bl+2) + 		'raise Exception("file %s not found."%filePath)');
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl+1) + 	'self._loadedItems = []');
	cmd.push(this.gbl(bl));       
	cmd.push(this.gbl(bl+1) + 	'f = open(filePath,\'r\')');
	cmd.push(this.gbl(bl+1) + 	'data = f.read()');
	cmd.push(this.gbl(bl+1) + 	'f.close()');
	cmd.push(this.gbl(bl+1) + 	'dd = json.loads(data)');
	cmd.push(this.gbl(bl+1) + 	'self.loadFromDMTDict(dd)');
	cmd.push(this.gbl(bl));
	
	return cmd.join('\n');
};
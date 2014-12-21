/*----------------------------------------------------------------------------*/
function JSONLoad(){
};
exports.JSONLoad = JSONLoad;
/*----------------------------------------------------------------------------*/
JSONLoad.prototype.jsonReprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.getBlockSpace(bl) + 
	'def jsonRepr(self, short=False, deep=True):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'return ( json.dumps(self.dictRepr(short=short, deep=deep),' + 
			'indent=4, separators=(\',\', \': \')) )' );
	
	cmd.push(this.getBlockSpace(bl+1));

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
JSONLoad.prototype.loadFromJSONDict = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'def loadFromJSONDict(self, data):');

	cmd.push(this.getBlockSpace(bl+1) + 
		'self.ID = str(data["__ID__"])' );
	
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
					'item.loadFromJSONDict(data[varName])' );
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
						'item.loadFromJSONDict(data[varName][i0])' );
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

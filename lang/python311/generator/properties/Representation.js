/*----------------------------------------------------------------------------*/
function Representation(){
};
exports.Representation = Representation;
/*----------------------------------------------------------------------------*/
Representation.prototype.reprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + 
	'def __repr__(self):');
	
	cmd.push(this.gbl(bl+1) + 
		'return ( json.dumps(self.dictRepr(short=True, deep=False), ' + 
			'indent=4, separators=(\',\', \': \')) )' );

	cmd.push(this.gbl(bl+1));
		
	if (this.isDerived()) {
		throw "not implemented for dervied types.";
		
		var superTypes = this.superTypes();
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +
			'outstr = outstr + ' + supType.name + '._represent(self)');
				
		}
		
		cmd.push(this.gbl(bl+1) + '');
	}
	
	return cmd.join('\n');

};
/*----------------------------------------------------------------------------*/
Representation.prototype.typeReprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + 'def typeRepr(self):');
	
	cmd.push(this.gbl(bl+1) +	'rep = collections.OrderedDict()' );

	cmd.push(this.gbl(bl+1) +	'rep["__type__"] = ' + this.stringify(this.getVersionedPackagedTypeStr()));
	cmd.push(this.gbl(bl+1) +	'rep["__ID__"] = self.ID' );
	cmd.push(this.gbl(bl+1) +	'rep["name"] = self.name');
	cmd.push(this.gbl(bl+1) +	'rep["description"] = self.description');
	
	cmd.push(this.gbl(bl+1) +	'return rep');

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Representation.prototype.dictReprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + 'def dictRepr(self, allItems=False, short=False, deep = True):');
	
	cmd.push(this.gbl(bl+1) +	'rep = collections.OrderedDict()' );
	cmd.push(this.gbl(bl+1) +	'rep["__type__"] = ' + this.stringify(this.getVersionedPackagedTypeStr()));
	cmd.push(this.gbl(bl+1) +	'if not(short):');
	cmd.push(this.gbl(bl+2) +		'rep["__versions__"] = ' + this.stringify(this.getVersion()) );
	cmd.push(this.gbl(bl+1) +	'rep["__ID__"] = self.ID' );
	cmd.push(this.gbl(bl+1) + 	'rep["name"] = self.name');
	cmd.push(this.gbl(bl+1) + 	'rep["description"] = self.description');
	
	if (this.isDerived()) {
		throw "not implemented for dervied types.";
	}
	
	var props = this.getProperties();

	for (var i = 0; i<props.length; i++) {
		var prop = props[i];
		propCmd = '';
		
		if (this.isReferenced(prop))
			throw "not working for not contained elements.";
		
		if (this.isAtomic(prop)){
			if (this.isSingle(prop)){
				cmd.push(this.gbl(bl+1) +	'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.gbl(bl+2) +		'rep["'+ prop.name +'"] = self.' +  prop.name );
			}
			else if (this.isArray(prop)){
				cmd.push(this.gbl(bl+1) +	'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.gbl(bl+2) +		'if (short):');
				cmd.push(this.gbl(bl+3) +			'rep["'+ prop.name +'"] = str(self.' +  prop.name + '.shape)');
				cmd.push(this.gbl(bl+2) +		'else:');			
				cmd.push(this.gbl(bl+3) +			'rep["'+ prop.name +'"] = self.' +  prop.name + '.tolist()');

			}
			else
				throw "atomic data is not single nor array !!";
		}
		else {
			/*complex data type*/
			if (this.isSingle(prop)){
				cmd.push(this.gbl(bl+1) +	'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.gbl(bl+2) +		'if (short and not(deep)):');
				cmd.push(this.gbl(bl+3) +			'rep["'+ prop.name +'"] = (self.' +  prop.name + '.typeRepr())');
				cmd.push(this.gbl(bl+2) +		'else:');			
				cmd.push(this.gbl(bl+3) +			'rep["'+ prop.name +'"] = self.' +  prop.name + '.dictRepr(allItems, short, deep)');
			}
			else if (this.isArray(prop)){
				cmd.push(this.gbl(bl+1) +	'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.gbl(bl+2) +		'rep["'+ prop.name +'"] = []');
				var loopBlock = this.getLoopBlockForArray(bl+2,prop);
				cmd.push(loopBlock.cmd);
					cmd.push(this.gbl(loopBlock.bl+1) + 
						'if (short and not(deep)):');
					cmd.push(this.gbl(loopBlock.bl+2) + 
							'itemType = self.' + prop.name + loopBlock.indList + '.typeRepr()' );
					cmd.push(this.gbl(loopBlock.bl+2) + 
							'rep["'+ prop.name +'"].append( itemType )' );
					cmd.push(this.gbl(loopBlock.bl+1) + 
						'else:');			
					cmd.push(this.gbl(loopBlock.bl+2) + 
							'rep["'+ prop.name +'"].append( self.' + prop.name + loopBlock.indList + '.dictRepr(allItems, short, deep) )' );
				
			}
			else
				throw "complex data is not single nor array !!";
		}		
	} 
	cmd.push(this.gbl(bl+1) + 
			'return rep');
	
	return cmd.join('\n');

};
/*----------------------------------------------------------------------------*/
Representation.prototype.dictDMTReprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + 'def dictDMTRepr(self, allItems=False, short=False, deep = True, bpDataSource=None):');
	
	cmd.push(this.gbl(bl+1) +	'rep = collections.OrderedDict()' );
	cmd.push(this.gbl(bl+1) +	'rep["type"] = ' + this.stringify(this.getVersionedPackagedTypeStr()).replace(/:/g,'/'));
	cmd.push(this.gbl(bl+1) +	'if not(bpDataSource == None):');
	cmd.push(this.gbl(bl+2) +		'rep["type"] = bpDataSource + "/" + rep["type"]');

	//cmd.push(this.gbl(bl+1) +	'if not(short):');
	//cmd.push(this.gbl(bl+2) +		'rep["__versions__"] = ' + this.stringify(this.getVersion()) );
	//cmd.push(this.gbl(bl+1) +	'rep["__ID__"] = self.ID' );
	cmd.push(this.gbl(bl+1) + 	'rep["name"] = self.name');
	cmd.push(this.gbl(bl+1) + 	'rep["description"] = self.description');
	
	if (this.isDerived()) {
		throw "not implemented for dervied types.";
	}
	
	var props = this.getProperties();

	for (var i = 0; i<props.length; i++) {
		var prop = props[i];
		propCmd = '';
		
		if (this.isReferenced(prop))
			throw "not working for not contained elements.";
		
		if (this.isAtomic(prop)){
			if (this.isSingle(prop)){
				cmd.push(this.gbl(bl+1) +	'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.gbl(bl+2) +		'rep["'+ prop.name +'"] = self.' +  prop.name );
			}
			else if (this.isArray(prop)){
				cmd.push(this.gbl(bl+1) +	'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.gbl(bl+2) +		'if (short):');
				cmd.push(this.gbl(bl+3) +			'rep["'+ prop.name +'"] = str(self.' +  prop.name + '.shape)');
				cmd.push(this.gbl(bl+2) +		'else:');			
				cmd.push(this.gbl(bl+3) +			'rep["'+ prop.name +'"] = self.' +  prop.name + '.tolist()');

			}
			else
				throw "atomic data is not single nor array !!";
		}
		else {
			/*complex data type*/
			if (this.isSingle(prop)){
				cmd.push(this.gbl(bl+1) +	'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.gbl(bl+2) +		'if (short and not(deep)):');
				cmd.push(this.gbl(bl+3) +			'rep["'+ prop.name +'"] = (self.' +  prop.name + '.typeRepr())');
				cmd.push(this.gbl(bl+2) +		'else:');			
				cmd.push(this.gbl(bl+3) +			'rep["'+ prop.name +'"] = self.' +  prop.name + '.dictDMTRepr(allItems=allItems, short=short, deep=deep, bpDataSource=bpDataSource)');
			}
			else if (this.isArray(prop)){
				cmd.push(this.gbl(bl+1) +	'if (allItems or self.isSet("'+ prop.name +'")):');
				cmd.push(this.gbl(bl+2) +		'rep["'+ prop.name +'"] = []');
				var loopBlock = this.getLoopBlockForArray(bl+2,prop);
				cmd.push(loopBlock.cmd);
					cmd.push(this.gbl(loopBlock.bl+1) + 
						'if (short and not(deep)):');
					cmd.push(this.gbl(loopBlock.bl+2) + 
							'itemType = self.' + prop.name + loopBlock.indList + '.typeRepr()' );
					cmd.push(this.gbl(loopBlock.bl+2) + 
							'rep["'+ prop.name +'"].append( itemType )' );
					cmd.push(this.gbl(loopBlock.bl+1) + 
						'else:');			
					cmd.push(this.gbl(loopBlock.bl+2) + 
							'rep["'+ prop.name +'"].append( self.' + prop.name + loopBlock.indList + '.dictDMTRepr(allItems=allItems, short=short, deep=deep, bpDataSource=bpDataSource) )' );
				
			}
			else
				throw "complex data is not single nor array !!";
		}		
	} 
	cmd.push(this.gbl(bl+1) + 
			'return rep');
	
	return cmd.join('\n');

};
/*----------------------------------------------------------------------------*/
Representation.prototype.mongodbReprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + 'def mongodbRepr(self, parent=None):');
	
	cmd.push(this.gbl(bl+1) +	'rep = collections.OrderedDict()' );
	cmd.push(this.gbl(bl+1) +	'rep["__type__"] = ' + this.stringify(this.getVersionedPackagedTypeStr()));
	cmd.push(this.gbl(bl+1) +	'rep["__versions__"] = ' + this.stringify(this.getVersion()) );
	cmd.push(this.gbl(bl+1) +	'rep["_id"] = self.ID' );
	cmd.push(this.gbl(bl+1) + 	'rep["name"] = self.name');
	cmd.push(this.gbl(bl+1) + 	'rep["description"] = self.description');
	
	cmd.push(this.gbl(bl+1) + 	'rep["__parents__"] = []');
	cmd.push(this.gbl(bl+1) + 	'if (parent != None):');
	cmd.push(this.gbl(bl+2) + 		'rep["__parents__"].append(parent)');
	
	if (this.isDerived()) {
		throw "not implemented for dervied types.";
	}
	
	var props = this.getProperties();

	for (var i = 0; i<props.length; i++) {
		var prop = props[i];
		propCmd = '';
		
		if (this.isReferenced(prop))
			throw "not working for not contained elements.";
		
		if (this.isAtomic(prop)){
			if (this.isSingle(prop)){
				cmd.push(this.gbl(bl+1) +	'if (self.isSet("'+ prop.name +'")):');
				cmd.push(this.gbl(bl+2) +		'rep["'+ prop.name +'"] = self.' +  prop.name );
			}
			else if (this.isArray(prop)){
				cmd.push(this.gbl(bl+1) +	'if (self.isSet("'+ prop.name +'")):');;			
				cmd.push(this.gbl(bl+2) +		'rep["'+ prop.name +'"] = self.' +  prop.name + '.tolist()');

			}
			else
				throw "atomic data is not single nor array !!";
		}
		else {
			/*complex data type*/
			if (this.isSingle(prop)){
				cmd.push(this.gbl(bl+1) +	'if (self.isSet("'+ prop.name +'")):');
				//cmd.push(this.gbl(bl+2) +		'rep["'+ prop.name +'"] = self.' +  prop.name + '.ID');
				cmd.push(this.gbl(bl+2) +		'rep["'+ prop.name +'"] = self.' +  prop.name + '.mongodbRepr(self.ID)');
			}
			else if (this.isArray(prop)){
				cmd.push(this.gbl(bl+1) +	'if (self.isSet("'+ prop.name +'")):');
				cmd.push(this.gbl(bl+2) +		'rep["'+ prop.name +'"] = []');
				var loopBlock = this.getLoopBlockForArray(bl+2,prop);
				cmd.push(loopBlock.cmd);
					cmd.push(this.gbl(loopBlock.bl+1) + 
							'itemType = self.' + prop.name + loopBlock.indList + '.ID' );
					cmd.push(this.gbl(loopBlock.bl+1) + 
							'rep["'+ prop.name +'"].append( itemType )' );
				
			}
			else
				throw "complex data is not single nor array !!";
		}		
	} 
	cmd.push(this.gbl(bl+1) + 	'return rep');
	
	return cmd.join('\n');

};
/*----------------------------------------------------------------------------*/
Representation.prototype.jsonReprFunc = function(bl) {
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
Representation.prototype.dmtReprFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.getBlockSpace(bl) + 
	'def dmtRepr(self, short=False, deep=True, bpDataSource=None):');
	
	cmd.push(this.getBlockSpace(bl+1) + 
		'return ( json.dumps(self.dictDMTRepr(short=short, deep=deep, bpDataSource=bpDataSource),' + 
			'indent=4, separators=(\',\', \': \')) )' );
	
	cmd.push(this.getBlockSpace(bl+1));

	return cmd.join('\n');
};
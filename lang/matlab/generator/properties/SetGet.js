/*----------------------------------------------------------------------------*/
function SetGet(){
};
exports.SetGet = SetGet;
/*----------------------------------------------------------------------------*/
SetGet.prototype.getFromGroupFuncs = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var props = this.getProperties();
	for (var i=0; i<props.length; i++ ) {
	    var prop = props[i];
		if (this.isGroup(prop)) {
			cmd.push(this.getFromGroup(prop, bl));	
			cmd.push(this.sep2);	
		}
	}
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.getFromGroup = function(prop, bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	
	if (this.isGroup(prop)) {
	    var props = this.getGroupedProps(prop.group);
	    
		cmd.push(this.gbl(bl) + 'function item = getFrom' + this.firstToUpper(prop.name) + '(' + this.objName() +', name)');
		
		for (var i=0; i<props.length; i++ ) {
	
		    /* find in the cell array */
			cmd.push(this.gbl(bl+1) + 	'for i = 1:length(' + this.objName() + '.' + prop.name + ')' );
			cmd.push(this.gbl(bl+2) + 		'if (strcmp(' + this.objName() + '.' + prop.name + '{i}.name, name)==1)');
			cmd.push(this.gbl(bl+3) + 			'item = ' + this.objName() + '.' + prop.name + '{i};');
			cmd.push(this.gbl(bl+3) + 			'return;');
			cmd.push(this.gbl(bl+2) +		'end');
			cmd.push(this.gbl(bl+1) +	'end');
		}
		
		cmd.push(this.gbl(bl) + 'end');	
			
	}
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
SetGet.prototype.propGet = function(prop, bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + 'function ' + prop.name + ' = get.' + prop.name + '(' + this.objName() +')');	

	cmd.push(this.gbl(bl+1) + 	prop.name + ' = ' + this.objName() + '.' + this.makePrivate(prop.name) + ';' );

	cmd.push(this.gbl(bl) + 'end');	
			
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.propSet = function(prop, bl) {
	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 
	'function set.' + prop.name + '(' + this.objName() + ', val)');
	
	/*assign the value*/
	if (this.isAtomicType(prop.type)) {
		if (this.isArray(prop)) {
			/* no chekcs here,
			 * TODO: add casting or checks for atomic type arrays*/
			cmd.push(this.gbl(bl+1) + 
			this.objName() + '.' + this.makePrivate(prop.name) +' = val;');			
		}
		else {
			/*type casting between atomic types */
			if (prop.type == "boolean") {
				cmd.push(this.gbl(bl+1) + 
				this.objName() + '.' + this.makePrivate(prop.name) +' = ' + 
				this.changeType(prop.type) + '(val);');
			}
			else if (this.isNumeric(prop)){
				cmd.push(this.gbl(bl+1) + 
				'if (ischar(val) == 1)');
				cmd.push(this.gbl(bl+2) + 
					'val = str2num(val);');
				cmd.push(this.gbl(bl+1) + 
				'end');
				
				cmd.push(this.gbl(bl+1) + 
				this.objName() + '.' + this.makePrivate(prop.name) +' = ' + 
				'val;');
			}
			else if (this.isString(prop)){
				cmd.push(this.gbl(bl+1) + 
				this.objName() + '.' + this.makePrivate(prop.name) +' = ' + 
				'char(val);');

			}
			else {
				cmd.push(this.gbl(bl+1) + 
				this.objName() + '.' + this.makePrivate(prop.name) +' = ' + 
				'(val);');
			}			

		}
	}
	else {
	    /* non-atomic types */
	    //if (this.isGroup(prop))
	    //    cmd.push(this.gbl(bl+1) + 'error(\'Error: can not directly set value to a group. Try using append...To' + prop.name + ' instead.\')');
        //if (this.isGrouped(prop))
        //    cmd.push(this.gbl(bl+1) + 'error(\'Error: can not directly set value to a grouped property. Try using append' + this.firstToUpper(prop.name) +'To' + prop.group + ' instead.\')'); 
	    
		/*non-atomic types */
		if (this.isArray(prop)) {
			/* cheks if all elements is array has the correct type 
			 * TODO: add the check*/
		}
		else {
			/* check if it has the correct type */
			/* cheks if the value has a correct type
			 * TODO: add the check*/
		}
		/*simple assignment */
		cmd.push(this.gbl(bl+1) + this.objName() + '.' + this.makePrivate(prop.name) +' = val;');
	}

	/*change array sizes if prop is a dimension */
	if (this.isDimension(prop)){
		/* find out the array which has prop as a dimension*/
		var arrays = this.getPropertiesWithDimension(prop);
		/* resize the array accordingly */
		for (var i = 0; i<arrays.length; i++){
			cmd.push(this.gbl(bl+1) + 
					
			this.objName() + '.' + this.arrayUpdateSizeFuncName(arrays[i]) +'()' );
		};	
	}
	
	/*make relations between child and parrent data sets */
	var childProps = this.getChildProps(prop);
	for (var i = 0; i<childProps.length; i++) {
		var childProp = childProps[i];
		
		if (this.isAtomicType(childProp.type)) {
			throw ('Illigal type for dependicy.',childProp);
		}
		else if (this.isArray(childProp)) {
			var loopBlock = this.loopBlockForArray(bl+1, childProp);
			cmd.push(loopBlock.cmd);
			cmd.push(this.gbl(loopBlock.bl+1) + 
					this.objName() + '.' + childProp.name + '{' +loopBlock.indArray + '}' + '.' + this.getDependentChildFor(childProp,prop) 
					+ ' = ' + this.objName() + '.' + prop.name + ';');
			cmd.push(loopBlock.ends);

		}
		else {
			var extraTab = 0;
			if (this.isOptional(childProp)) {
				cmd.push(this.gbl(bl+1) + 
				'if (' + this.objName() + '.isSet(' + this.stringify(childProp.name) + ' ) )'
				);
			extraTab = 1;
			}
			cmd.push(this.gbl(bl+1+extraTab) + 
					this.objName() + '.' + childProp.name + '.' + this.getDependentChildFor(childProp,prop) 
					+ ' = ' + this.objName() + '.' + prop.name + ';');
			if (extraTab == 1 ){
				cmd.push(this.gbl(bl+1) + 'end'); 
			}
		}
	}
	
	
	/*syncronization*/
	/*
	cmd.push(this.gbl(bl+1) + 
			'if not(' + JSON.stringify(prop.name) + ' in self._sync.keys()):');
	cmd.push(this.gbl(bl+2) + 
			'self._sync[' + JSON.stringify(prop.name) + '] = 1');
	*/
	
	cmd.push(this.gbl(bl) + 
	'end');	
	/*return the commands */
    return cmd.join('\n');
};

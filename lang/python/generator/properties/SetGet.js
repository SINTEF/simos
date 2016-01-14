/*----------------------------------------------------------------------------*/
function SetGet(){
};
exports.SetGet = SetGet;
/*----------------------------------------------------------------------------*/
SetGet.prototype.setPropertyRef = function(bl, varName, deptProp, varNameRef) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	cmd.push(this.gbl(bl) + 
			varName + '.' + deptProp + 
			' = ' + varNameRef );
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.setPropSinglesRefs = function(bl, childProp, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	if (this.isSingle(childProp)) {
		var deptProps = this.getDependentChildFor(childProp,prop);
		
		if (deptProps.length > 0) {
			for (var di = 0, dilen = deptProps.length; di < dilen; di++){
				var extraTab = 0;
				if (this.isOptional(childProp)) {
				cmd.push(this.gbl(bl) + 
				'if not(self.' + childProp.name + '==None):'
				);
				extraTab = 1;
				}
				cmd.push(
				this.setPropertyRef(bl+extraTab, 'self.' + childProp.name, deptProps[di], 'self.' + prop.name)
				);
			}	
		}
	}
	else
		throw "only single object can be handled here.";

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.setPropArraysRefs = function(bl, childProp, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	if (this.isArray(childProp)) {

		var deptProps = this.getDependentChildFor(childProp,prop);
		
		if (deptProps.length > 0) {
			var loopBlock = this.getLoopBlockForArray(bl, childProp);
			cmd.push(loopBlock.cmd);
	
			for (var di = 0, dilen = deptProps.length; di < dilen; di++){
				cmd.push(
						this.setPropertyRef(loopBlock.bl+1, 'self.' + childProp.name + loopBlock.indList, 
								deptProps[di], 
								'self.' + prop.name)
						);
			}	
		}
	}
	else
		throw "only array object can be handled here.";

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.setPropRefs = function(bl, childProps, parents) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/* make relations between child and parrent data sets */
	for (var j = 0; j<parents.length; j++) {
		var prop = parents[j];
		for (var i = 0; i<childProps.length; i++) {
			var childProp = childProps[i];
			
			if (this.isAtomic(childProp)) {
				throw ('Illigal type for dependicy.',childProp);
			}
			else if (this.isArray(childProp)) {
				cmd.push(this.setPropArraysRefs(bl, childProp, prop));
	
			}
			else {
				cmd.push(this.setPropSinglesRefs(bl, childProp, prop));
			}
		}
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.setChildPropsRefs = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/* make relations between child and parrent data sets */
	var childProps = this.getChildProps(prop);
	cmd.push(this.setPropRefs(bl, childProps, [prop]));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.setParentPropsRefs = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/* make relations between child and parrent data sets */
	var parentProps = this.getParentProps(prop);
	
	cmd.push(this.setPropRefs(bl, [prop], parentProps));
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.setChildPropRefs = function(bl, childProp, objName) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	if (objName == undefined){
		objName = 'self.' + childProp.name;
	}
	
	var cmd = [];

	
	var dept = this.getPropDependencies(childProp);
	if (dept != undefined) {
		for (d in dept) {
			var prop = this.getProperty(dept[d]);
			cmd.push(
			this.setPropertyRef(bl, objName, d, 'self.' + prop.name)
				);
		}
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.propSet = function(prop, bl) {
	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + '@ ' + prop.name +'.setter' );	

	cmd.push(this.gbl(bl) + 'def ' + prop.name + '(self, val):');
	
	/* SetGet the value */
	if (this.isAtomic(prop)) {
		if (this.isArray(prop)) {
			/*
			 * no chekcs here, TODO: add casting or checks for atomic type
			 * arrays
			 */
			cmd.push(this.gbl(bl+1) + 'self.' + this.makePrivate(prop.name) +' = np.array(val)');			
		}
		else {
			/* type casting between atomic types */
			if (prop.type == "boolean") {
				cmd.push(this.gbl(bl+1) + 'self.' + this.makePrivate(prop.name) +' = ' + 
						this.changeType(prop.type) +
						'(' + this.changeType("integer") + '(val)' + ')');
			}
			else {
				if (this.isLimited(prop)) {
					if (prop.from instanceof Array){ 
						cmd.push(this.gbl(bl+1) + 
						'if not(' + this.changeType(prop.type) + '(val) in ' + this.stringify(prop.from) + '): ' );
						cmd.push(this.gbl(bl+2) + 
							'raise Exception(str(val) + " must be in " + str(' + this.stringify(prop.from) + ') )');
					}
					else{
						cmd.push(this.gbl(bl+1) + 
						'if not(' + this.changeType(prop.type) + '(val) in self.' + this.makePrivate(prop.from) + '): ' );
						cmd.push(this.gbl(bl+2) + 
							'raise Exception(str(val) + " must be in " + str(self.' + this.makePrivate(prop.from) + ') )');
					}
				}
				cmd.push(this.gbl(bl+1) + 'self.' + this.makePrivate(prop.name) +' = ' + 
						this.changeType(prop.type) +'(val)');
				
			}

			

		}
	}
	else {
		/* non-atomic types */
		if (this.isArray(prop)) {
			/*
			 * cheks if all elements is array has the correct type TODO: add the
			 * check
			 */
			cmd.push(this.gbl(bl+1) + 'self.' + this.makePrivate(prop.name) +' = val');	
		}
		else {
			/* check if it has the correct type */
			cmd.push(this.gbl(bl+1) + 
					'if not(isinstance(val, ' + this.getClassPathFromType(prop.type)  + ')):');
//			cmd.push(this.gbl(bl+2) + 
//					'raise Exception("variable type for ' + prop.name + ' must be an instance of ' + prop.type + ' while " + str(type(val)) + " is passed .")');
			cmd.push(this.gbl(bl+2) + 
					'warnings.warn("variable type for ' + prop.name + ' must be an instance of ' + prop.type + ' while " + str(type(val)) + " is passed. Make sure they are compatible.", RuntimeWarning)');

		}
		/* simple assignment */
		cmd.push(this.gbl(bl+1) + 'self.' + this.makePrivate(prop.name) +' = val');
	}

	/* change array sizes if prop is a dimension */
	/*TODO: this functionality must be improved to work with automated data loading 
	 * and improve efficiency.*/
	if (this.isDimension(prop)){
		/* find out the array which has prop as a dimension */
		var arrays = this.getPropertiesWithDimension(prop);
		/* resize the array accordingly */
		/*
		for (var i = 0; i<arrays.length; i++){
			cmd.push(this.gbl(bl+1) + 'if not(len(self.' + this.makePrivate(arrays[i].name) + ') == self.' + this.makePrivate(prop.name) +'):');
			cmd.push(this.gbl(bl+2) + 		'self.' + this.arrayUpdateSizeFuncName(arrays[i]) +'()' );
		};
		*/	
	}
	
	/* make relations between child and parrent data sets */
	if (this.hasDependencies(prop)) {
		cmd.push(this.setParentPropsRefs(bl+1, prop));
	}
	if (this.hasDependents(prop)){
		/*some other properties depend on this one */
		cmd.push(this.setChildPropsRefs(bl+1, prop));
	}
	
	cmd.push(this.gbl(bl+1) +	'if not(' + this.stringify(prop.name) + ' in self._loadedItems):');
	cmd.push(this.gbl(bl+2) + 
			'self._loadedItems.append(' + this.stringify(prop.name) + ')');
	
	/* return the commands */
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.arrayUpdateSize = function(prop, bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def ' + this.arrayUpdateSizeFuncName(prop) + '(self):');
	var arrName = 'self.' + this.getPropertyNameInClass(prop);
			
	if (this.isAtomicType(prop.type)) {
		cmd.push(this.gbl(bl+1) + arrName + ' = np.resize(' + arrName + ',' + this.getPythonArrayShape(prop) + ')');
	}
	else {
		cmd.push(this.gbl(bl+1) + arrName + ' = ' + this.getInitObjectList(prop));
	}

    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.propGet = function(prop, bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
		
	cmd.push(this.gbl(bl) +		'@ property');	
	cmd.push(this.gbl(bl) + 	'def ' + prop.name + '(self):');	
	
	if (this.isAtomic(prop)) {
		if(this.isSingle(prop)){
	cmd.push(this.gbl(bl+1) +		'return self.' + this.makePrivate(prop.name) );
		}
		else {
	cmd.push(this.gbl(bl+1) + 		'name = ' + this.stringify(prop.name));
	cmd.push(this.gbl(bl+1) + 		'if  not(self.STORAGE ==None) and not(name in self._loadedItems) :');
	cmd.push(this.gbl(bl+2) + 			'self._loadDataItem(name)');
	//cmd.push(this.gbl(bl+2) + 			'self._loadedItems.append(name)');
	cmd.push(this.gbl(bl+1) +		'return self.' + this.makePrivate(prop.name) );			
		}
	}
	else {
		if(this.isArray(prop)){
	cmd.push(this.gbl(bl+1) + 		'name = ' + this.stringify(prop.name));
	cmd.push(this.gbl(bl+1) + 		'if  not(self.STORAGE ==None) and not(name in self._loadedItems) and (len(self.' + this.makePrivate(prop.name) + ') == 0):');
	cmd.push(this.gbl(bl+2) + 			'self._loadDataItem(name)');
	//cmd.push(this.gbl(bl+2) + 			'self._loadedItems.append(name)');
	cmd.push(this.gbl(bl+1) +		'return self.' + this.makePrivate(prop.name) );
		}
		else {
	cmd.push(this.gbl(bl+1) + 		'name = ' + this.stringify(prop.name));
	cmd.push(this.gbl(bl+1) + 		'if  not(self.STORAGE ==None) and not(name in self._loadedItems) and (self.' + this.makePrivate(prop.name) + ' == None):');
	cmd.push(this.gbl(bl+2) + 			'self._loadDataItem(name)');
	//cmd.push(this.gbl(bl+2) + 			'self._loadedItems.append(name)');
	cmd.push(this.gbl(bl+1) +		'return self.' + this.makePrivate(prop.name) );
		}
	}

			
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
SetGet.prototype.storageSetGet = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
		
	cmd.push(this.gbl(bl) +		'@ property');	
	cmd.push(this.gbl(bl) + 	'def STORAGE(self):');	
	cmd.push(this.gbl(bl+1) +		'return self._STORAGE');
	cmd.push(this.gbl(bl));
	cmd.push(this.gbl(bl) +		'@ STORAGE.setter');	
	cmd.push(this.gbl(bl) + 	'def STORAGE(self,val):');	
	cmd.push(this.gbl(bl+1) +		'if (val.backEnd == \'hdf5\') or (val.backEnd == \'mongodb\'):');
	cmd.push(this.gbl(bl+2) +			'self._STORAGE = val'); 
	cmd.push(this.gbl(bl+1) +		'else:');
	cmd.push(this.gbl(bl+2) +			'raise Exception("storage back-end " + val.backEnd + " is not defined.")');

			
	return cmd.join('\n');
};
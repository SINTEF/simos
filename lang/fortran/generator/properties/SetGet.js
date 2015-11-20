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
SetGet.prototype.propSetDeclaration = function(prop, bl) {
	if (prop.type == 'string'){
	    var cmd = [];
	    	    
	    cmd.push(this.gbl(bl) + 'generic, public :: set_' + prop.name + ' => set_' + prop.name + 'FromChar,set_' + prop.name +'FromString');
	    cmd.push(this.gbl(bl) + 'procedure :: set_' + prop.name + 'FromChar');
	    cmd.push(this.gbl(bl) + 'procedure :: set_' + prop.name + 'FromString');
	    
	    return cmd.join('\n');
    }
    else {
    	return '';
    }
    
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.propGetDeclaration = function(prop, bl) {
    return '';
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.propSet = function(prop, bl) {
	
	var cmd = [];
	
	if (prop.type == 'string'){
	    cmd.push(this.gbl(bl) + 'subroutine set_' + prop.name + 'FromChar(this,chbdy)');
	    cmd.push(this.gbl(bl+1) + 	'! External variables');
	    cmd.push(this.gbl(bl+1) + 	'! Inputs');
	    cmd.push(this.gbl(bl+1) + 	'class(' + this.getTypeName() + ') :: this');
	    cmd.push(this.gbl(bl+1) + 	'character(*) :: chbdy');
	    cmd.push(this.gbl(bl+1));
        cmd.push(this.gbl(bl+1) + 	'this%' + prop.name + '=trim(adjustL(chbdy))');
        cmd.push(this.gbl(bl+1));
        cmd.push(this.gbl(bl) + 'end subroutine set_' + prop.name + 'FromChar');
        cmd.push(this.gbl(bl));
        cmd.push(this.gbl(bl) + 'subroutine set_' + prop.name + 'FromString(this,chbdy)');
        cmd.push(this.gbl(bl+1) + 	'! External variables');
        cmd.push(this.gbl(bl+1) + 	'! Inputs');
        cmd.push(this.gbl(bl+1) + 	'class(' + this.getTypeName() + ') :: this');
        cmd.push(this.gbl(bl+1) + 	'type(String) :: chbdy');
        cmd.push(this.gbl(bl+1));
        cmd.push(this.gbl(bl+1) + 	'this%' + prop.name + '=chbdy%strip()');
        cmd.push(this.gbl(bl+1));
        cmd.push(this.gbl(bl) + 'end subroutine set_' + prop.name + 'FromString');	  

		return cmd.join('\n');
	 }
	 else {
		 return '';
	 }
	 
	
	    
	/* return the commands */
    
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
	return '';
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
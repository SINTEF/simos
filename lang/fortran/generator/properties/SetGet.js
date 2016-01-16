/*----------------------------------------------------------------------------*/
function SetGet(){
};
exports.SetGet = SetGet;
/*----------------------------------------------------------------------------*/
SetGet.prototype.setEqualToDeclaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "procedure, public :: setEqualTo");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.setEqualTo = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine setEqualTo(this, obj)");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "type(" + this.getTypeName() + "),intent(in)"+ " :: obj");
	
	/* internal variables */
	
	if (this.hasNonAtomicArray()) {
		cmd.push(this.indexVariablesForLooping(bl+1, this.maxRankOfNonAtomicArrays()) );
	}
		
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		if (this.isArray(prop) && this.isAllocatable(prop) && (this.isAtomic(prop) && prop.type != 'string')){
		    cmd.push(this.gbl(bl+1) + "integer,dimension(:),allocatable :: diml");
		    break
		}
	}
	
	    
	
    /* end of internal variables */
	
	cmd.push(this.gbl(bl+1) + "call this%destroy()");


	/* Loop over each property */
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var dimList = 0;
		var p=0

		if (this.isArray(prop) && this.isAllocatable(prop) && (this.isAtomic(prop) && prop.type != 'string')){			

			cmd.push(this.gbl(bl+1) + "if (allocated(obj%" + prop.name + ")) then");
			dimList = this.getDimensionList(prop);

			cmd.push(this.allocateBlock(bl+2, "diml(" + dimList.length + ")",
													"sv", "error", 
													"Error during setting equal "+ this.getTypeName() + ", error when trying to allocate diml array for " + prop.name));
			
			cmd.push(this.gbl(bl+2) + 	"diml=shape(obj%" + prop.name + ")");
			var sizeList=[];
			for(var k=0; k< dimList.length;k++) {
				sizeList.push("diml(" + k+1 + ")")
			}
			cmd.push(this.allocateBlock(bl+2, 	"this%" + prop.name + "(" + sizeList.join(',') + ")",
												"sv", "error", 
												"Error during setting equal "+ this.getTypeName() + ", error when trying to allocate array for " + prop.name));
			cmd.push(this.gbl(bl+2) + 	"this%" + prop.name + "=obj%" + prop.name);
			cmd.push(this.gbl(bl+2) + 	"deallocate(diml)");
			cmd.push(this.gbl(bl+1) + "end if");


		}
		else if (this.isArray(prop) && this.isAtomic(prop) && prop.type != 'string' && (! this.isAllocatable(prop))){
			cmd.push(this.gbl(bl+1) + "this%"+ prop.name + "=obj%" + prop.name); 
		}
		else if (this.isSingle(prop) && (this.isAtomic(prop))){
			cmd.push(this.gbl(bl+1) + "this%"+ prop.name + "=obj%" + prop.name); 
		}
		else if (this.isSingle(prop) && (! this.isAtomic(prop))){
			cmd.push(this.gbl(bl+1) + "call this%"+ prop.name + "%setEqualTo(obj%" + prop.name + ")"); 
		}
		else if ((this.isSingle(prop)) && (prop.type == 'string')){
			cmd.push(this.gbl(bl+1) + "this%"+ prop.name + "=obj%" + prop.name); 
		}
		else if ((this.isArray(prop)) && (prop.type == 'string')){
			throw "setEqualTo is not implemented for array of String instances.";
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop)) ){
			dimList = this.getDimensionList(prop);
			var addBL = 0;

			if ( this.isAllocatable(prop) ) {
				cmd.push(this.gbl(bl+1) + "if (allocated(obj%" + prop.name + ")) then");
				cmd.push(this.gbl(bl+2) + 	"allocate(this%" + prop.name + "(size(obj%" + prop.name + ",1)))");
				addBL = 1;
			}

			var loopBlock = this.getLoopBlockForProp(bl+addBL+1,prop);
			var nbl = loopBlock.bl;
			cmd.push(loopBlock.cmd);
				cmd.push(this.gbl(nbl+1) + 	"call this%"+ prop.name + loopBlock.indArray + "%setEqualTo(obj%" + prop.name + loopBlock.indArray +")");								
			cmd.push(loopBlock.endCmd);
			
			if ( this.isAllocatable(prop) ) {
				cmd.push(this.gbl(bl+1) + "end if");
			}
			
		}

	} /* end of property loop*/

	cmd.push(this.gbl(bl) + "end subroutine setEqualTo");


	return cmd.join('\n');

};
/*----------------------------------------------------------------------------*/
SetGet.prototype.atomicArrayResizeDeclaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;
	
	cmd.push(this.gbl(bl) + "!--- resize functions for single atomic arrays ----"	);
	    
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var dimList = 0;
		var p=0
	
		if (this.isArray(prop) && this.isAllocatable(prop) && (this.isAtomic(prop) && prop.type != 'string')){
			
			cmd.push(this.gbl(bl) + "procedure, public :: resize_" + prop.name );
		}
	}	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
SetGet.prototype.atomicArrayResize = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;
	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var dimList = 0;
		var p=0
	
		if (this.isArray(prop) && this.isAllocatable(prop) && (this.isAtomic(prop) && prop.type != 'string')){
		    dimList = this.getDimensionList(prop);
			var sizeList=[];
			for(var k=0; k< dimList.length;k++) {
				sizeList.push("n" + k)
			}
			
			cmd.push(this.gbl(bl) + "subroutine resize_" + prop.name + "(this, " + sizeList.join(', ') + ")");
			cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
			cmd.push(this.gbl(bl+1) + "integer,intent(in) :: " + sizeList.join(', ') );

			cmd.push(this.gbl(bl+1) + "if (allocated(this%" + prop.name + ")) then");
			cmd.push(this.gbl(bl+2) + 	"deallocate(this%" + prop.name + ")");
			cmd.push(this.gbl(bl+1) + "end if");

			cmd.push(this.gbl(bl+2) + "allocate(this%" + prop.name + "(" + sizeList + "))");
			
			cmd.push(this.gbl(bl) + "end subroutine resize_" + prop.name);

		}
	}	

	return cmd.join('\n');
};
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
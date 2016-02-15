/*----------------------------------------------------------------------------*/
function Destroy(){
};
exports.Destroy = Destroy;

/*----------------------------------------------------------------------------*/
Destroy.prototype.destroyDeclaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "procedure, public :: destroy");

	var properties = this.getProperties();
	var propNum = properties.length;

	/* Loop over each property */
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		
		if (this.isDestroyable(prop)) {
			cmd.push(this.gbl(bl) + "procedure, public :: destroy_" + prop.name);	
		}

	} /* end of property loop*/

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Destroy.prototype.destroyClass = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine destroy(this)");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	
	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;

	/* Loop over each property */
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		
		if (this.isDestroyable(prop)) {
			cmd.push(this.gbl(bl+1) + "call this%destroy_" + prop.name + "()");	
		}

	} /* end of property loop*/

	cmd.push(this.gbl(bl) + "end subroutine destroy");


	return cmd.join('\n');
}
/*----------------------------------------------------------------------------*/
Destroy.prototype.isDestroyable = function(prop) {
	if (this.isAllocatable(prop) && this.isArray(prop) && (this.isAtomic(prop) && prop.type != 'string')){
		return true; 
	}
	else if (this.isSingle(prop) && (! this.isAtomic(prop))){
		return true; 
	}
	else if ((this.isSingle(prop)) && (prop.type == 'string')){
		return true; 
	}
	else if ((this.isArray(prop)) && (prop.type == 'string')){
		return true; 
		throw "destroyClass is not implemented for array of String instances.";
	}
	else if (this.isArray(prop) && (! this.isAtomic(prop)) ){
		return true; 
	}

	return false;
}
/*----------------------------------------------------------------------------*/
Destroy.prototype.destroyProperties = function(bl) {
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
		
		if (this.isDestroyable(prop)) {
			cmd.push(this.gbl(bl) + this.sep2);
			cmd.push(this.gbl(bl) + "subroutine destroy_" + prop.name +"(this)");
			cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
			
			if (this.isAllocatable(prop) && this.isArray(prop) && (!this.isAtomic(prop)) ) { 
				dimList = this.getDimensionList(prop);
				cmd.push(this.gbl(bl+1) +"!Internal variables");
				cmd.push(this.indexVariablesForLoopingDec(bl+1, dimList.length ) );
			}
			
			if (this.isArray(prop) && (this.isAtomic(prop) && prop.type != 'string')){
				cmd.push(this.gbl(bl+1) + "if (allocated(this%" + prop.name + ")) " + "deallocate(this%" + prop.name + ")");	
			}
			else if (this.isSingle(prop) && (! this.isAtomic(prop))){
				cmd.push(this.gbl(bl+1) + "call this%"+ prop.name + "%destroy()"); 
			}
			else if ((this.isSingle(prop)) && (prop.type == 'string')){
				cmd.push(this.gbl(bl+1) + "call this%"+ prop.name + "%destroy()"); 
			}
			else if ((this.isArray(prop)) && (prop.type == 'string')){
				cmd.push(this.gbl(bl+1) + "call this%"+ prop.name + "%destroy()");
				throw "destroyClass is not implemented for array of String instances.";
			}
			else if (this.isArray(prop) && (! this.isAtomic(prop)) ){
				
				
				var addBL = 0;
				
				if ( this.isAllocatable(prop) ) {
					cmd.push(this.gbl(bl+1) + "if (allocated(this%" + prop.name + ")) then");
					addBL = 1;
				}
					
				var loopBlock = this.getLoopBlockForProp(bl+addBL+1,prop);
				var nbl = loopBlock.bl;
				cmd.push(loopBlock.cmd);
					cmd.push(this.gbl(nbl+1) + 	"call this%"+ prop.name + loopBlock.indArray + "%destroy()");
				cmd.push(loopBlock.endCmd);
							
				if ( this.isAllocatable(prop) ) {
					cmd.push(this.gbl(bl+2) + 	"deallocate(this%" + prop.name + ")");
					cmd.push(this.gbl(bl+1) + "end if");
				}
	
			}
	
			cmd.push(this.gbl(bl) + "end subroutine destroy_" + prop.name );
		}
	} /* end of property loop*/

	return cmd.join('\n');
}
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
Destroy.prototype.finalizeDeclaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "final :: final_s,final_arr");

	return cmd.join('\n');
}
/*----------------------------------------------------------------------------*/
Destroy.prototype.finalizeClassS = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine final_s(this)");
	cmd.push(this.gbl(bl+1) + "type(" + this.getTypeName() + ")"+ " :: this");
	/*cmd.push(this.gbl(bl+1) + "integer :: idx");^*/

	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;


	/* Loop over each property */
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var dimList = 0;

		if (this.isArray(prop) && this.isAllocatable(prop) && (this.isAtomic(prop) && prop.type != 'string')){
			cmd.push(this.gbl(bl+1) + "if (allocated(this%" + prop.name + ")) " + "deallocate(this%" + prop.name + ")");	
		}
		else if (this.isSingle(prop) && (! this.isAtomic(prop))){
			/*cmd.push(this.gbl(bl+1) + "call this%"+ prop.name + "%destroy()");*/ 
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop)) && (! this.isAllocatable(prop))){
			dimList = this.getDimensionList(prop);
			//if (dimList.length > 1)
			//	throw "destroyClass is not implemented for object array of more than one dimension.";
			/*cmd.push(this.gbl(bl+1) + "do " + "idx=1,size(this%" + prop.name + ",1)");
			/*cmd.push(this.gbl(bl+2) + "call this%"+ prop.name + "(idx)%destroy()");
			/*cmd.push(this.gbl(bl+1) + "end do");*/
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop)) && (this.isAllocatable(prop))){
			dimList = this.getDimensionList(prop);
			//if (dimList.length > 1)
			//	throw "destroyClass is not implemented for object array of more than one dimension.";
			cmd.push(this.gbl(bl+1) + "if (allocated(this%" + prop.name + ")) then");
			/*cmd.push(this.gbl(bl+2) + "do " + "idx=1,size(this%" + prop.name + ",1)");
			cmd.push(this.gbl(bl+3) + "call this%"+ prop.name + "(idx)%destroy()");
			cmd.push(this.gbl(bl+2) + "end do");*/
			cmd.push(this.gbl(bl+2) + "deallocate(this%" + prop.name + ")");	
			cmd.push(this.gbl(bl+1) + "end if");

		}




	} /* end of property loop*/

	cmd.push(this.gbl(bl) + "end subroutine final_s");


	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
Destroy.prototype.finalizeClassArr = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine final_arr(this)");
	cmd.push(this.gbl(bl+1) + "type(" + this.getTypeName() + "),dimension(:)"+ " :: this");
	cmd.push(this.gbl(bl+1) + "integer :: idx");

	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;

	cmd.push(this.gbl(bl+1) + "do idx=1,size(this,1)");
	bl=bl+1;


	/* Loop over each property */
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var dimList = 0;

		if (this.isArray(prop) && this.isAllocatable(prop) && (this.isAtomic(prop) && prop.type != 'string')){
			cmd.push(this.gbl(bl+1) + "if (allocated(this(idx)%" + prop.name + ")) " + "deallocate(this(idx)%" + prop.name + ")");	
		}
		else if (this.isSingle(prop) && (! this.isAtomic(prop))){
			/*cmd.push(this.gbl(bl+1) + "call this%"+ prop.name + "%destroy()");*/ 
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop)) && (! this.isAllocatable(prop))){
			dimList = this.getDimensionList(prop);
			//if (dimList.length > 1)
			//	throw "destroyClass is not implemented for object array of more than one dimension.";
			/*cmd.push(this.gbl(bl+1) + "do " + "idx=1,size(this%" + prop.name + ",1)");
			/*cmd.push(this.gbl(bl+2) + "call this%"+ prop.name + "(idx)%destroy()");
			/*cmd.push(this.gbl(bl+1) + "end do");*/
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop)) && (this.isAllocatable(prop))){
			dimList = this.getDimensionList(prop);
			//if (dimList.length > 1)
			//	throw "destroyClass is not implemented for object array of more than one dimension.";
			cmd.push(this.gbl(bl+1) + "if (allocated(this(idx)%" + prop.name + ")) then");
			/*cmd.push(this.gbl(bl+2) + "do " + "idx=1,size(this%" + prop.name + ",1)");
			cmd.push(this.gbl(bl+3) + "call this%"+ prop.name + "(idx)%destroy()");
			cmd.push(this.gbl(bl+2) + "end do");*/
			cmd.push(this.gbl(bl+2) + "deallocate(this(idx)%" + prop.name + ")");	
			cmd.push(this.gbl(bl+1) + "end if");

		}


	} /* end of property loop*/


	bl=bl-1;
	cmd.push(this.gbl(bl+1) + "end do");
	cmd.push(this.gbl(bl) + "end subroutine final_arr");


	return cmd.join('\n');
};

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
	cmd.push(this.gbl(bl+1) + "integer :: idx");

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
			cmd.push(this.gbl(bl+1) + "call this%"+ prop.name + "%destroy()"); 
		}
		else if ((this.isSingle(prop)) && (prop.type == 'string')){
			cmd.push(this.gbl(bl+1) + "call this%"+ prop.name + "%destroy()"); 
		}
		else if ((this.isArray(prop)) && (prop.type == 'string')){
			cmd.push(this.gbl(bl+1) + "call this%"+ prop.name + "%destroy()");
			throw "destroyClass is not implemented for array of String instances.";
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop)) && (! this.isAllocatable(prop))){
			dimList = this.getDimensionList(prop);
			if (dimList.length > 1)
				throw "destroyClass is not implemented for object array of more than one dimension.";
			cmd.push(this.gbl(bl+1) + "do " + "idx=1,size(this%" + prop.name + ",1)");
			cmd.push(this.gbl(bl+2) + "call this%"+ prop.name + "(idx)%destroy()");
			cmd.push(this.gbl(bl+1) + "end do");
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop)) && (this.isAllocatable(prop))){
			dimList = this.getDimensionList(prop);
			if (dimList.length > 1)
				throw "destroyClass is not implemented for object array of more than one dimension.";
			cmd.push(this.gbl(bl+1) + "if (allocated(this%" + prop.name + ")) then");
			cmd.push(this.gbl(bl+2) + "do " + "idx=1,size(this%" + prop.name + ",1)");
			cmd.push(this.gbl(bl+3) + "call this%"+ prop.name + "(idx)%destroy()");
			cmd.push(this.gbl(bl+2) + "end do");
			cmd.push(this.gbl(bl+2) + "deallocate(this%" + prop.name + ")");	
			cmd.push(this.gbl(bl+1) + "end if");

		}




	} /* end of property loop*/

	cmd.push(this.gbl(bl) + "end subroutine destroy");


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
			if (dimList.length > 1)
				throw "destroyClass is not implemented for object array of more than one dimension.";
			/*cmd.push(this.gbl(bl+1) + "do " + "idx=1,size(this%" + prop.name + ",1)");
			/*cmd.push(this.gbl(bl+2) + "call this%"+ prop.name + "(idx)%destroy()");
			/*cmd.push(this.gbl(bl+1) + "end do");*/
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop)) && (this.isAllocatable(prop))){
			dimList = this.getDimensionList(prop);
			if (dimList.length > 1)
				throw "destroyClass is not implemented for object array of more than one dimension.";
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
			if (dimList.length > 1)
				throw "destroyClass is not implemented for object array of more than one dimension.";
			/*cmd.push(this.gbl(bl+1) + "do " + "idx=1,size(this%" + prop.name + ",1)");
			/*cmd.push(this.gbl(bl+2) + "call this%"+ prop.name + "(idx)%destroy()");
			/*cmd.push(this.gbl(bl+1) + "end do");*/
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop)) && (this.isAllocatable(prop))){
			dimList = this.getDimensionList(prop);
			if (dimList.length > 1)
				throw "destroyClass is not implemented for object array of more than one dimension.";
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

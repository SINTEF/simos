/*----------------------------------------------------------------------------*/
function Init(){
};
exports.Init = Init;
/*----------------------------------------------------------------------------*/
Init.prototype.isValidDeclaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "procedure, public :: isValid");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.isValid = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "function isValid(this) result(content)");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "logical :: content");
	cmd.push(this.gbl(bl+1) + "if (this%name%isEmpty()) then");
	cmd.push(this.gbl(bl+2) + "content=.false.");
	cmd.push(this.gbl(bl+1) + "else");
	cmd.push(this.gbl(bl+2) + "content=.true.");
	cmd.push(this.gbl(bl+1) + "end if");
	cmd.push(this.gbl(bl) + "end function");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.defaultInitDeclaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "generic, public :: default_init => default_initFromSingle");
	cmd.push(this.gbl(bl) + "procedure :: default_initFromSingle");
	cmd.push(this.gbl(bl) + "procedure,public :: default_initFromArray");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
Init.prototype.defaultInit = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine default_initFromSingle(this)");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Set the default name of the object");
	cmd.push(this.gbl(bl+1) + "call this%set_name('"  + this.getTypeName() +  "')");
	cmd.push(this.gbl(bl) + "end subroutine default_initFromSingle");
	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl) + "subroutine default_initFromArray(this,nameOfArray)");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + "), dimension(:)"+ " :: this");
	cmd.push(this.gbl(bl+1) + "type(String), intent(in) :: nameOfArray");
	cmd.push(this.gbl(bl+1) + "integer :: idx");
	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Set the default name of the array components");
	cmd.push(this.gbl(bl+1) + "do idx=1,size(this,1)");
	cmd.push(this.gbl(bl+2) + "call this(idx)%set_name(nameOfArray + '_' + toString(idx))");
	cmd.push(this.gbl(bl+1) + "end do");
	cmd.push(this.gbl(bl) + "end subroutine default_initFromArray");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.loadH5Declaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "generic, public :: load_HDF5 => load_HDF5_fromFileNameAndEntityName, load_HDF5_fromGroupIndex");
	cmd.push(this.gbl(bl) + "procedure :: load_HDF5_fromFileNameAndEntityName");
	cmd.push(this.gbl(bl) + "procedure :: load_HDF5_fromGroupIndex");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.loadH5 = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine load_HDF5_fromFileNameAndEntityName(this,fileName,entityName,error)");
	cmd.push(this.gbl(bl+1) + "implicit none");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "type(String), intent(in) :: fileName");
	cmd.push(this.gbl(bl+1) + "type(String), intent(in) :: entityName");
	cmd.push(this.gbl(bl+1) + "integer, intent(out) :: error ! =0: ok, =1: error during the saving procedure");
	cmd.push(this.gbl(bl+1) + "! Internal variables");
	cmd.push(this.gbl(bl+1) + "logical :: there");
	cmd.push(this.gbl(bl+1) + "integer :: dataBaseID, groupID,errorj");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Initialization");
	cmd.push(this.gbl(bl+1) + "error=0");
	cmd.push(this.gbl(bl+1) + "errorj=0");
	cmd.push(this.gbl(bl+1) + "call h5a_initialize('no config required')");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Open database file if present");
	cmd.push(this.gbl(bl+1) + "inquire(file=fileName%toChars(),exist=there)");
	cmd.push(this.gbl(bl+1) + "if (there) then");
	cmd.push(this.gbl(bl+2) + "call this%destroy()");
	cmd.push(this.gbl(bl+2) + "dataBaseID = H5A_OpenOrCreateDatabase(fileName%toChars() // c_null_char)");
	cmd.push(this.gbl(bl+1) + "else");
	cmd.push(this.gbl(bl+2) + "error = error - 1");
	cmd.push(this.gbl(bl+2) + "write(*,*)  'Error from load_HDF5 functions. HDF5 file not found: ',fileName%toChars() ");
	cmd.push(this.gbl(bl+1) + "end if");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Get the first groupIndex and load the object");
	cmd.push(this.gbl(bl+1) + "groupID = H5A_OpenEntity(dataBaseID,entityName%toChars() // c_null_char)");
	cmd.push(this.gbl(bl+1) + "if (groupID.gt.0) then");
	cmd.push(this.gbl(bl+2) + "call this%load_HDF5_fromGroupIndex(groupID,errorj)");
	cmd.push(this.gbl(bl+2) + "error = error + errorj");
	cmd.push(this.gbl(bl+1) + "else");
	cmd.push(this.gbl(bl+2) + "error = error - 1");
	cmd.push(this.gbl(bl+2) + "write(*,*) 'Error during saving of "+ this.getTypeName() + ", group not found:'," + " entityName%toChars()");
	cmd.push(this.gbl(bl+1) + "end if");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Close the data base");
	cmd.push(this.gbl(bl+1) + "errorj = H5A_CloseDatabase(dataBaseID)");
	cmd.push(this.gbl(bl+1) + "error = error + errorj");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Error check");
	cmd.push(this.gbl(bl+1) + "if (H5A_IS_ERROR(error)) then");
	cmd.push(this.gbl(bl+2) + "write(*,*) 'Error during saving of "+ this.getTypeName() + ":'" + ",error");
	cmd.push(this.gbl(bl+1) + "end if");

	cmd.push(this.gbl(bl) + "end subroutine load_HDF5_fromFileNameAndEntityName");

	cmd.push(this.gbl(bl) + "");

	cmd.push(this.gbl(bl) + "subroutine load_HDF5_fromGroupIndex(this,groupIndex,error)");
	cmd.push(this.gbl(bl+1) + "implicit none");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "integer, intent(in) :: groupIndex");
	cmd.push(this.gbl(bl+1) + "integer, intent(out) :: error");
	cmd.push(this.gbl(bl+1) + "! Internal variables");
	cmd.push(this.gbl(bl+1) + "integer :: errorj, subGroupIndex, subGroupIndex2,logicalToIntSingle");
	cmd.push(this.gbl(bl+1) + "integer, dimension(:), allocatable :: diml,logicalToIntArray");
	cmd.push(this.gbl(bl+1) + "integer :: idx,orderSize,sv");
	cmd.push(this.gbl(bl+1) + "type(String) :: orderList");
	cmd.push(this.gbl(bl+1) + "character(kind=c_char, len=:), allocatable :: cc_a");
	cmd.push(this.gbl(bl+1) + "type(String), allocatable ::listOfNames(:)");

	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;
	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Some initializations");
	cmd.push(this.gbl(bl+1) + "error=0");
	cmd.push(this.gbl(bl+1) + "errorj=0");

	/* write type */
	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Check the class of the object (to be implemented later)");


	/* Loop over each property */
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var dimList = 0;
		var sizeList=[];
		var k=0

				cmd.push(this.gbl(bl+1) + "");
		cmd.push(this.gbl(bl+1) + "! Load property " + prop.name);

		if (this.isAtomic(prop) && this.isArray(prop)){
			dimList = this.getDimensionList(prop);
			if (this.isAllocatable(prop)){
				cmd.push(this.gbl(bl+1) + "allocate(diml(" + dimList.length + "))");
				cmd.push(this.gbl(bl+1) + "errorj = H5A_GetArrayDims(groupIndex,'" + prop.name + "' // c_null_char, diml)");
				cmd.push(this.gbl(bl+1) + "if (errorj.ge.0) then");
				sizeList=[];
				for(var k=0; k< dimList.length;k++) {
					p=k+1
							sizeList += ["diml(" + p + ")"]
									if (k<(dimList.length-1)){
										sizeList += [","]
									}

				}
				cmd.push(this.gbl(bl+2) + "allocate(this%" + prop.name + "(" + sizeList + "))");
				sizeList=[];
				if (prop.type=='double'){
					cmd.push(this.gbl(bl+2) + "errorj = H5A_ReadDoubleArray(groupIndex,'" + prop.name + "' // c_null_char, this%" +  prop.name  + ")");
					cmd.push(this.gbl(bl+2) + "error = error + errorj");
				}else if (prop.type=='integer'){
					cmd.push(this.gbl(bl+2) + "errorj = H5A_ReadIntArray(groupIndex,'" + prop.name + "' // c_null_char, this%" +  prop.name  + ")");	
					cmd.push(this.gbl(bl+2) + "error=error+errorj");
				}else if (prop.type=='boolean'){
					if (dimList.length > 1){
						throw "load_hdf5 is not implemented for logical array of more than one dimension.";
					}else{
						cmd.push(this.gbl(bl+2) + "allocate(IntArrayToLogical(diml(1)))");
						cmd.push(this.gbl(bl+2) + "errorj = H5A_ReadIntArray(groupIndex,'" + prop.name + "' // c_null_char, IntArrayToLogical)");
						cmd.push(this.gbl(bl+2) + "error=error+errorj");
						cmd.push(this.gbl(bl+2) + "do idx=1,diml(1)");
						cmd.push(this.gbl(bl+3) + "if (IntArrayToLogical(idx).eq.1) then ");
						cmd.push(this.gbl(bl+4) + "this%" + prop.name + "(idx)=.true.");
						cmd.push(this.gbl(bl+3) + "else");
						cmd.push(this.gbl(bl+4) + "this%" + prop.name + "(idx)=.false.");
						cmd.push(this.gbl(bl+3) + "end if");
						cmd.push(this.gbl(bl+2) + "end do");
						cmd.push(this.gbl(bl+2) + "deallocate(IntArrayToLogical)");
					}
				}else if (prop.type=='string'){
					throw "loadH5 does not support arrays of string yet.";	
				}
				cmd.push(this.gbl(bl+1) + "end if");
				cmd.push(this.gbl(bl+1) + "deallocate(diml)");
			}else{
				if (prop.type=='double'){
					cmd.push(this.gbl(bl+1) + "errorj = H5A_ReadDoubleArray(groupIndex,'" + prop.name + "' // c_null_char, this%" +  prop.name  + ")");
					cmd.push(this.gbl(bl+1) + "error = error + errorj");
				}else if (prop.type=='integer'){
					cmd.push(this.gbl(bl+1) + "errorj = H5A_ReadIntArray(groupIndex,'" + prop.name + "' // c_null_char, this%" +  prop.name  + ")");	
					cmd.push(this.gbl(bl+1) + "error=error+errorj");
				}else if (prop.type=='boolean'){
					if (dimList.length > 1){
						throw "load_hdf5 is not implemented for logical array of more than one dimension.";
					}else{
						cmd.push(this.gbl(bl+1) + "allocate(diml(" + dimList.length + "))");
						cmd.push(this.gbl(bl+1) + "diml=shape(this%" + prop.name + ")");
						cmd.push(this.gbl(bl+1) + "allocate(IntArrayToLogical(diml(1)))");
						cmd.push(this.gbl(bl+1) + "errorj = H5A_ReadIntArray(groupIndex,'" + prop.name + "' // c_null_char, IntArrayToLogical)");
						cmd.push(this.gbl(bl+1) + "error=error+errorj");
						cmd.push(this.gbl(bl+1) + "do idx=1,diml(1)");
						cmd.push(this.gbl(bl+2) + "if (IntArrayToLogical(idx).eq.1) then ");
						cmd.push(this.gbl(bl+3) + "this%" + prop.name + "(idx)=.true.");
						cmd.push(this.gbl(bl+2) + "else");
						cmd.push(this.gbl(bl+3) + "this%" + prop.name + "(idx)=.false.");
						cmd.push(this.gbl(bl+2) + "end if");
						cmd.push(this.gbl(bl+1) + "end do");
						cmd.push(this.gbl(bl+1) + "deallocate(IntArrayToLogical)");
						cmd.push(this.gbl(bl+1) + "deallocate(diml)");
					}
				}else if (prop.type=='string'){
					throw "saveH5 does not support arrays of string yet.";	
				}
			}
		}
		else if (this.isSingle(prop) && (this.isAtomic(prop))){
			if (prop.type=='double'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_ReadDouble(groupIndex, '" + prop.name + "' // c_null_char,this%" + prop.name + ")");
				cmd.push(this.gbl(bl+1) + "error=error+errorj");
			}else if (prop.type=='integer'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_ReadInt(groupIndex, '" + prop.name + "' // c_null_char,this%" + prop.name + ")");	
				cmd.push(this.gbl(bl+1) + "error=error+errorj");
			}else if (prop.type=='boolean'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_ReadInt(groupIndex, '" + prop.name + "' // c_null_char,logicalToIntSingle)");	
				cmd.push(this.gbl(bl+1) + "error=error+errorj");
				cmd.push(this.gbl(bl+1) + "if (logicalToIntSingle.eq.1) then ");
				cmd.push(this.gbl(bl+2) + "this%" + prop.name + "=.true.");
				cmd.push(this.gbl(bl+1) + "else");
				cmd.push(this.gbl(bl+2) + "this%" + prop.name + "=.false.");
				cmd.push(this.gbl(bl+1) + "end if");

			}else if (prop.type=='string'){
				cmd.push(this.gbl(bl+1) + "errorj= H5A_getStringLength(groupIndex, 'name' // c_null_char,orderSize)");
				cmd.push(this.gbl(bl+1) + "if (errorj.ge.0) then");
				cmd.push(this.gbl(bl+2) + "allocate(character(len=orderSize) :: cc_a)");
				cmd.push(this.gbl(bl+2) + "errorj = H5A_ReadStringWithLength(groupIndex, '" + prop.name + "' // c_null_char,cc_a)");		
				cmd.push(this.gbl(bl+2) + "this%" + prop.name + "=String(cc_a)");
				cmd.push(this.gbl(bl+2) + "this%name=this%name%trim()");
				cmd.push(this.gbl(bl+2) + "deallocate(cc_a)");
				cmd.push(this.gbl(bl+1) + "end if");
				
			}	
		}
		else if (this.isSingle(prop) && (! this.isAtomic(prop))){
			cmd.push(this.gbl(bl+1) + "subGroupIndex = H5A_OpenEntity(groupIndex,'"  + prop.name +  "' // c_null_char)");
			cmd.push(this.gbl(bl+1) + "if (subGroupIndex.gt.0) then");
			cmd.push(this.gbl(bl+2) + "call this%" + prop.name + "%load_HDF5_fromGroupIndex(subGroupIndex,errorj)");			
			cmd.push(this.gbl(bl+2) + "error=error+errorj");			
			cmd.push(this.gbl(bl+1) + "else");
			cmd.push(this.gbl(bl+2) + "error=error-1");
			cmd.push(this.gbl(bl+2) + "write(*,*) 'Error during saving of "+ this.getTypeName() + ", group not found: " + prop.name + "'");
			cmd.push(this.gbl(bl+1) + "end if");
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop))){
			dimList = this.getDimensionList(prop);
			if (dimList.length > 1)
				throw "savehdf5 is not implemented for object array of more than one dimension.";
			cmd.push(this.gbl(bl+1) + "call orderList%destroy()");
			if (this.isAllocatable(prop)){
				cmd.push(this.gbl(bl+1) + "! Open the array group");
				cmd.push(this.gbl(bl+1) + "subGroupIndex = H5A_OpenEntity(groupIndex,'"  + prop.name +  "' // c_null_char)");
				cmd.push(this.gbl(bl+1) + "if (subGroupIndex.gt.0) then");			
				cmd.push(this.gbl(bl+2) + "! Read the order attribute");
				cmd.push(this.gbl(bl+2) + "errorj = H5A_GetOrderSize(subGroupIndex,orderSize)");
				cmd.push(this.gbl(bl+2) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+3) + "write(*,*) 'Error during loading of "+ this.getTypeName() + ", order not found for array: " + prop.name + "'");
				cmd.push(this.gbl(bl+3) + "error = error + errorj");
				cmd.push(this.gbl(bl+2) + "end if");
				cmd.push(this.gbl(bl+2) + "allocate(character(len=orderSize) :: cc_a)");
				cmd.push(this.gbl(bl+2) + "errorj = H5A_GetOrder(subGroupIndex, cc_a)");
				cmd.push(this.gbl(bl+2) + "error = error + errorj");
				cmd.push(this.gbl(bl+2) + "orderList=String(cc_a)");
				cmd.push(this.gbl(bl+2) + "deallocate(cc_a)");
				cmd.push(this.gbl(bl+2) + "call orderList%split(',', listOfNames)");
				cmd.push(this.gbl(bl+2) + "! Allocate the array");
				cmd.push(this.gbl(bl+2) + "allocate(this%" + prop.name + "(size(listOfNames,1)),stat=sv)");
				cmd.push(this.gbl(bl+2) + "if (sv.ne.0) then");
				cmd.push(this.gbl(bl+3) + "error=error-1");
				cmd.push(this.gbl(bl+3) + "write(*,*) 'Error during saving of "+ this.getTypeName() + ", error when trying to allocate " + prop.name + "'");
				cmd.push(this.gbl(bl+2) + "end if");
				cmd.push(this.gbl(bl+2) + "! Read each component");
				cmd.push(this.gbl(bl+2) + "do idx=1,size(listOfNames)");
				cmd.push(this.gbl(bl+3) + "subGroupIndex2 = H5A_OpenEntity(subGroupIndex, listOfNames(idx)%toChars() // c_null_char)");
				cmd.push(this.gbl(bl+3) + "if (subGroupIndex2.gt.0) then");
				cmd.push(this.gbl(bl+4) + "call this%" + prop.name + "(idx)%load_HDF5_fromGroupIndex(subGroupIndex2,errorj)");			
				cmd.push(this.gbl(bl+4) + "error=error+errorj");			
				cmd.push(this.gbl(bl+3) + "else");
				cmd.push(this.gbl(bl+4) + "error=error-1");
				cmd.push(this.gbl(bl+4) + "write(*,*) 'Error during saving of "+ this.getTypeName() + ", group not found: ',listOfNames(idx)%toChars()");
				cmd.push(this.gbl(bl+3) + "end if");
				cmd.push(this.gbl(bl+2) + "end do");
				cmd.push(this.gbl(bl+1) + "end if");
				cmd.push(this.gbl(bl+1) + "call orderList%destroy()");
			}else{
				cmd.push(this.gbl(bl+1) + "! Open the array group");
				cmd.push(this.gbl(bl+1) + "subGroupIndex = H5A_OpenEntity(groupIndex,'"  + prop.name +  "' // c_null_char)");
				cmd.push(this.gbl(bl+1) + "if (subGroupIndex.gt.0) then");			
				cmd.push(this.gbl(bl+2) + "! Read the order attribute");
				cmd.push(this.gbl(bl+2) + "errorj = H5A_GetOrderSize(subGroupIndex,orderSize)");
				cmd.push(this.gbl(bl+2) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+3) + "write(*,*) 'Error during loading of "+ this.getTypeName() + ", order not found for array: " + prop.name + "'");
				cmd.push(this.gbl(bl+3) + "error = error + errorj");
				cmd.push(this.gbl(bl+2) + "end if");
				cmd.push(this.gbl(bl+2) + "allocate(character(len=orderSize) :: cc_a)");
				cmd.push(this.gbl(bl+2) + "errorj = H5A_GetOrder(subGroupIndex, cc_a)");
				cmd.push(this.gbl(bl+2) + "error = error + errorj");
				cmd.push(this.gbl(bl+2) + "orderList=String(cc_a)");
				cmd.push(this.gbl(bl+2) + "deallocate(cc_a)");
				cmd.push(this.gbl(bl+2) + "call orderList%split(',', listOfNames)");
				cmd.push(this.gbl(bl+2) + "! Read each component");
				cmd.push(this.gbl(bl+2) + "do idx=1,size(listOfNames)");
				cmd.push(this.gbl(bl+3) + "subGroupIndex2 = H5A_OpenEntity(subGroupIndex, listOfNames(idx)%toChars() // c_null_char)");
				cmd.push(this.gbl(bl+3) + "if (subGroupIndex2.gt.0) then");
				cmd.push(this.gbl(bl+4) + "call this%" + prop.name + "(idx)%load_HDF5_fromGroupIndex(subGroupIndex2,errorj)");			
				cmd.push(this.gbl(bl+4) + "error=error+errorj");			
				cmd.push(this.gbl(bl+3) + "else");
				cmd.push(this.gbl(bl+4) + "error=error-1");
				cmd.push(this.gbl(bl+4) + "write(*,*) 'Error during saving of "+ this.getTypeName() + ", group not found: ',listOfNames(idx)%toChars()");
				cmd.push(this.gbl(bl+3) + "end if");
				cmd.push(this.gbl(bl+2) + "end do");
				cmd.push(this.gbl(bl+1) + "end if");
				cmd.push(this.gbl(bl+1) + "call orderList%destroy()");
			}

		}

	} /* end of property loop*/
	cmd.push(this.gbl(bl+1) + "! Error check");
	cmd.push(this.gbl(bl+1) + "if (error.ne.0) then");
	cmd.push(this.gbl(bl+2) + "write(*,*) 'Error during loading of "+ this.getTypeName() + ":'" + ",error");
	cmd.push(this.gbl(bl+1) + "end if");
	cmd.push(this.gbl(bl) + "end subroutine load_HDF5_fromGroupIndex");

	return cmd.join('\n');
}
/*----------------------------------------------------------------------------*/
Init.prototype.saveH5Declaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "generic, public :: save_HDF5 => save_HDF5_toNewDataBase, save_HDF5_toExistingDataBase");
	cmd.push(this.gbl(bl) + "procedure :: save_HDF5_toNewDataBase");
	cmd.push(this.gbl(bl) + "procedure :: save_HDF5_toExistingDataBase");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.saveH5 = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine save_HDF5_toNewDataBase(this,fileName,error)");
	cmd.push(this.gbl(bl+1) + "implicit none");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "type(String), intent(in) :: fileName");
	cmd.push(this.gbl(bl+1) + "integer, intent(out) :: error ! =0: ok, =1: error during the saving procedure");
	cmd.push(this.gbl(bl+1) + "! Internal variables");
	cmd.push(this.gbl(bl+1) + "logical :: there");
	cmd.push(this.gbl(bl+1) + "integer :: dataBaseID, groupID,errorj");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Initialization");
	cmd.push(this.gbl(bl+1) + "error=0");
	cmd.push(this.gbl(bl+1) + "errorj=0");
	cmd.push(this.gbl(bl+1) + "call h5a_initialize('no config required')");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Destroy database if already present");
	cmd.push(this.gbl(bl+1) + "inquire(file=fileName%toChars(),exist=there)");
	cmd.push(this.gbl(bl+1) + "if (there) then");
	cmd.push(this.gbl(bl+2) + "errorj = H5A_RemoveDatabase( fileName%toChars() // c_null_char)");
	cmd.push(this.gbl(bl+2) + "error = error + errorj");
	cmd.push(this.gbl(bl+1) + "end if");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Create new database");
	cmd.push(this.gbl(bl+1) + "dataBaseID = H5A_OpenOrCreateDatabase(fileName%toChars() // c_null_char)");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Save the current object if it is valid");
	cmd.push(this.gbl(bl+1) + "if (this%isValid()) then");
	cmd.push(this.gbl(bl+2) + "groupID = H5A_OpenOrCreateEntity(dataBaseID,this%name%toChars() // c_null_char)");
	cmd.push(this.gbl(bl+2) + "call this%save_HDF5_toExistingDataBase(groupID,errorj)");
	cmd.push(this.gbl(bl+2) + "error = error + errorj");
	cmd.push(this.gbl(bl+1) + "end if");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Close the data base");
	cmd.push(this.gbl(bl+1) + "errorj = H5A_CloseDatabase(dataBaseID)");
	cmd.push(this.gbl(bl+1) + "error = error + errorj");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Error check");
	cmd.push(this.gbl(bl+1) + "if (H5A_IS_ERROR(error)) then");
	cmd.push(this.gbl(bl+2) + "write(*,*) 'Error during saving of "+ this.getTypeName() + ":'" + ",error");
	cmd.push(this.gbl(bl+1) + "end if");

	cmd.push(this.gbl(bl) + "end subroutine save_HDF5_toNewDataBase");

	cmd.push(this.gbl(bl) + "");

	cmd.push(this.gbl(bl) + "subroutine save_HDF5_toExistingDataBase(this,groupIndex,error)");
	cmd.push(this.gbl(bl+1) + "implicit none");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "integer, intent(in) :: groupIndex");
	cmd.push(this.gbl(bl+1) + "integer, intent(out) :: error");
	cmd.push(this.gbl(bl+1) + "! Internal variables");
	cmd.push(this.gbl(bl+1) + "integer :: errorj, subGroupIndex, subGroupIndex2");
	cmd.push(this.gbl(bl+1) + "integer, dimension(:), allocatable :: diml,logicalToIntArray");
	cmd.push(this.gbl(bl+1) + "integer :: logicalToIntSingle,idx");
	cmd.push(this.gbl(bl+1) + "type(String) :: orderList");

	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;
	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Some initializations");
	cmd.push(this.gbl(bl+1) + "error=0");
	cmd.push(this.gbl(bl+1) + "errorj=0");

	/* write type */
	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Save the class of the object");
	cmd.push(this.gbl(bl+1) + "errorj=h5a_setType(groupIndex,'" + this.getType() + "' // c_null_char)");
	cmd.push(this.gbl(bl+1) + "error=error+errorj");


	/* Loop over each property */
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var dimList = 0;

		cmd.push(this.gbl(bl+1) + "");
		cmd.push(this.gbl(bl+1) + "! Save property " + prop.name);

		if (this.isAtomic(prop) && this.isArray(prop)){
			dimList = this.getDimensionList(prop);
			if (this.isAllocatable(prop)){ 
				cmd.push(this.gbl(bl+1) + "if (allocated(this%" + prop.name + ")) then");
				cmd.push(this.gbl(bl+2) + "allocate(diml(" + dimList.length + "))");
				cmd.push(this.gbl(bl+2) + "diml=shape(this%" + prop.name + ")");
				if (prop.type=='double'){
					cmd.push(this.gbl(bl+2) + "errorj = H5A_WriteDoubleArray(groupIndex, '" + prop.name + "' // c_null_char," + dimList.length + ",diml,this%" + prop.name + ")");
					cmd.push(this.gbl(bl+2) + "error=error+errorj");
				}else if (prop.type=='integer'){
					cmd.push(this.gbl(bl+2) + "errorj = H5A_WriteIntArray(groupIndex, '" + prop.name + "' // c_null_char," + dimList.length + ",diml,this%" + prop.name + ")");	
					cmd.push(this.gbl(bl+2) + "error=error+errorj");
				}else if (prop.type=='boolean'){
					if (dimList.length > 1){
						throw "save_hdf5 is not implemented for logical array of more than one dimension.";
					}else{
						cmd.push(this.gbl(bl+2) + "allocate(logicalToIntArray(diml(1)))");
						cmd.push(this.gbl(bl+2) + "do idx=1,diml(1)");
						cmd.push(this.gbl(bl+3) + "if (this%" + prop.name + "(idx)) then ");
						cmd.push(this.gbl(bl+4) + "logicalToIntArray(idx)=1");
						cmd.push(this.gbl(bl+3) + "else");
						cmd.push(this.gbl(bl+4) + "logicalToIntArray(idx)=0");
						cmd.push(this.gbl(bl+3) + "end if");
						cmd.push(this.gbl(bl+2) + "end do");
						cmd.push(this.gbl(bl+2) + "errorj = H5A_WriteIntArray(groupIndex, '" + prop.name + "' // c_null_char," + dimList.length + ",diml,logicalToIntArray)");						
						cmd.push(this.gbl(bl+2) + "error=error+errorj");
						cmd.push(this.gbl(bl+2) + "deallocate(logicalToIntArray)");
					}
				}else if (prop.type=='string'){
					throw "saveH5 does not support arrays of string yet.";	
				}
				cmd.push(this.gbl(bl+2) + "deallocate(diml)");
				cmd.push(this.gbl(bl+1) + "end if");
			}else{
				cmd.push(this.gbl(bl+1) + "allocate(diml(" + dimList.length + "))");
				cmd.push(this.gbl(bl+1) + "diml=shape(this%" + prop.name + ")");
				if (prop.type=='double'){
					cmd.push(this.gbl(bl+1) + "errorj = H5A_WriteDoubleArray(groupIndex, '" + prop.name + "' // c_null_char," + dimList.length + ",diml,this%" + prop.name + ")");
					cmd.push(this.gbl(bl+1) + "error=error+errorj");
				}else if (prop.type=='integer'){
					cmd.push(this.gbl(bl+1) + "errorj = H5A_WriteIntArray(groupIndex, '" + prop.name + "' // c_null_char," + dimList.length + ",diml,this%" + prop.name + ")");	
					cmd.push(this.gbl(bl+1) + "error=error+errorj");
				}else if (prop.type=='boolean'){
					if (dimList.length > 1){
						throw "save_hdf5 is not implemented for logical array of more than one dimension.";
					}else{
						cmd.push(this.gbl(bl+1) + "allocate(logicalToIntArray(diml(1)))");
						cmd.push(this.gbl(bl+1) + "do idx=1,diml(1)");
						cmd.push(this.gbl(bl+2) + "if (this%" + prop.name + "(idx)) then ");
						cmd.push(this.gbl(bl+3) + "logicalToIntArray(idx)=1");
						cmd.push(this.gbl(bl+2) + "else");
						cmd.push(this.gbl(bl+3) + "logicalToIntArray(idx)=0");
						cmd.push(this.gbl(bl+2) + "end if");
						cmd.push(this.gbl(bl+1) + "end do");
						cmd.push(this.gbl(bl+1) + "errorj = H5A_WriteIntArray(groupIndex, '" + prop.name + "' // c_null_char," + dimList.length + ",diml,logicalToIntArray)");
						cmd.push(this.gbl(bl+1) + "error=error+errorj");
						cmd.push(this.gbl(bl+1) + "deallocate(logicalToIntArray)");
					}	
				}else if (prop.type=='string'){
					throw "saveH5 does not support arrays of string yet.";	
				}			
				cmd.push(this.gbl(bl+1) + "deallocate(diml)");
			}
		}
		else if (this.isSingle(prop) && (this.isAtomic(prop))){
			if (prop.type=='double'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_WriteDouble(groupIndex, '" + prop.name + "' // c_null_char,this%" + prop.name + ")");
				cmd.push(this.gbl(bl+1) + "error=error+errorj");
			}else if (prop.type=='integer'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_WriteInt(groupIndex, '" + prop.name + "' // c_null_char,this%" + prop.name + ")");	
				cmd.push(this.gbl(bl+1) + "error=error+errorj");
			}else if (prop.type=='boolean'){
				cmd.push(this.gbl(bl+1) + "if (this%" + prop.name + ") then ");
				cmd.push(this.gbl(bl+2) + "logicalToIntSingle=1");
				cmd.push(this.gbl(bl+1) + "else");
				cmd.push(this.gbl(bl+2) + "logicalToIntSingle=0");
				cmd.push(this.gbl(bl+1) + "end if");
				cmd.push(this.gbl(bl+1) + "errorj = H5A_WriteInt(groupIndex, '" + prop.name + "' // c_null_char,logicalToIntSingle)");	
				cmd.push(this.gbl(bl+1) + "error=error+errorj");
			}else if (prop.type=='string'){
				cmd.push(this.gbl(bl+1) + "if (.not.(this%" + prop.name + "%isEmpty())) then");
				cmd.push(this.gbl(bl+2) + "errorj = H5A_writeStringWithLength(groupIndex, '" + prop.name + "' // c_null_char,this%" + prop.name + "%toChars() // c_null_char)");		
				cmd.push(this.gbl(bl+2) + "error=error+errorj");
				cmd.push(this.gbl(bl+1) + "end if");
			}	
		}
		else if (this.isSingle(prop) && (! this.isAtomic(prop))){
			cmd.push(this.gbl(bl+1) + "if (this%" + prop.name + "%isValid()) then");
			cmd.push(this.gbl(bl+2) + "subGroupIndex = H5A_OpenOrCreateEntity(groupIndex,'"  + prop.name +  "' // c_null_char)");
			cmd.push(this.gbl(bl+2) + "call this%" + prop.name + "%save_HDF5_toExistingDataBase(subGroupIndex,errorj)");
			cmd.push(this.gbl(bl+2) + "error=error+errorj");
			cmd.push(this.gbl(bl+1) + "else");
			cmd.push(this.gbl(bl+2) + "errorj=-1");
			cmd.push(this.gbl(bl+2) + "error=error+errorj");
			cmd.push(this.gbl(bl+2) + "write(*,*) 'warning: error during saving to hdf5 file. An object is not valid (i.e. does not have a name):" + prop.name + "'");
			cmd.push(this.gbl(bl+1) + "end if");
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop))){
			dimList = this.getDimensionList(prop);
			if (dimList.length > 1)
				throw "savehdf5 is not implemented for object array of more than one dimension.";
			cmd.push(this.gbl(bl+1) + "call orderList%destroy()");
			if (this.isAllocatable(prop)){
				cmd.push(this.gbl(bl+1) + "if (allocated(this%" + prop.name + ")) then");
				cmd.push(this.gbl(bl+2) + "subGroupIndex = H5A_OpenOrCreateEntity(groupIndex, '"  + prop.name +  "' // c_null_char)");
				cmd.push(this.gbl(bl+2) + "do " + "idx=1,size(this%" + prop.name + ",1)");
				cmd.push(this.gbl(bl+3) + "if (this%"+ prop.name + "(idx)%isValid()) then");
				cmd.push(this.gbl(bl+4) + "subGroupIndex2 = H5A_OpenOrCreateEntity(subGroupIndex, this%"  + prop.name +  "(idx)%name%toChars() // c_null_char)");				
				cmd.push(this.gbl(bl+4) + "call this%"+ prop.name + "(idx)%save_hdf5(subGroupIndex2,errorj)");
				cmd.push(this.gbl(bl+4) + "error=error+errorj");
				cmd.push(this.gbl(bl+4) + "if (.not.(orderList%isEmpty())) then");
				cmd.push(this.gbl(bl+5) + "orderList=orderList+','");
				cmd.push(this.gbl(bl+4) + "end if");
				cmd.push(this.gbl(bl+4) + "orderList=orderList+this%" + prop.name + "(idx)%name%toChars()");
				cmd.push(this.gbl(bl+3) + "end if");
				cmd.push(this.gbl(bl+2) + "end do");	
				cmd.push(this.gbl(bl+1) + "end if");
				cmd.push(this.gbl(bl+1) + "if (.not.(orderList%isEmpty())) then");
				cmd.push(this.gbl(bl+2) + "errorj=h5a_setOrder(subGroupIndex,orderList%toChars() // c_null_char)");
				cmd.push(this.gbl(bl+2) + "error=error+errorj");
				cmd.push(this.gbl(bl+1) + "end if");
			}else{
				cmd.push(this.gbl(bl+1) + "subGroupIndex = H5A_OpenOrCreateEntity(groupIndex, '"  + prop.name +  "' // c_null_char)");
				cmd.push(this.gbl(bl+1) + "do " + "idx=1,size(this%" + prop.name + ",1)");
				cmd.push(this.gbl(bl+2) + "if (this%"+ prop.name + "(idx)%isValid()) then");
				cmd.push(this.gbl(bl+3) + "subGroupIndex2 = H5A_OpenOrCreateEntity(subGroupIndex, this%"  + prop.name +  "(idx)%name%toChars() // c_null_char)");				
				cmd.push(this.gbl(bl+3) + "call this%"+ prop.name + "(idx)%save_hdf5(subGroupIndex2,errorj)");
				cmd.push(this.gbl(bl+3) + "error=error+errorj");
				cmd.push(this.gbl(bl+3) + "if (.not.(orderList%isEmpty())) then");
				cmd.push(this.gbl(bl+4) + "orderList=orderList+','");
				cmd.push(this.gbl(bl+3) + "end if");
				cmd.push(this.gbl(bl+3) + "orderList=orderList+this%" + prop.name + "(idx)%name%toChars()");
				cmd.push(this.gbl(bl+2) + "end if");
				cmd.push(this.gbl(bl+1) + "end do");
				cmd.push(this.gbl(bl+1) + "if (.not.(orderList%isEmpty())) then");
				cmd.push(this.gbl(bl+2) + "errorj=h5a_setOrder(subGroupIndex,orderList%toChars() // c_null_char)");
				cmd.push(this.gbl(bl+2) + "error=error+errorj");
				cmd.push(this.gbl(bl+1) + "end if");
			}

		}




	} /* end of property loop*/
	cmd.push(this.gbl(bl+1) + "call orderList%destroy()");
	cmd.push(this.gbl(bl+1) + "! Error check");
	cmd.push(this.gbl(bl+1) + "if (error.ne.0) then");
	cmd.push(this.gbl(bl+2) + "write(*,*) 'Error during saving of "+ this.getTypeName() + ":'" + ",error");
	cmd.push(this.gbl(bl+1) + "end if");
	cmd.push(this.gbl(bl) + "end subroutine save_HDF5_toExistingDataBase");


	return cmd.join('\n');
}
/*----------------------------------------------------------------------------*/
Init.prototype.destroyDeclaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "procedure, public :: destroy");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.destroyClass = function(bl) {
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
Init.prototype.finalizeDeclaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "final :: final_s,final_arr");

	return cmd.join('\n');
}
/*----------------------------------------------------------------------------*/
Init.prototype.finalizeClassS = function(bl) {
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
Init.prototype.finalizeClassArr = function(bl) {
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
/*----------------------------------------------------------------------------*/
Init.prototype.propertiesDeclaration = function(bl) {
	/*
	 * return properties declaration
	 */

	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;

	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var decStr = '';

		if ( (this.isSingle(prop)) && (this.isAtomic(prop) && prop.type != 'string') ){
			decStr = this.changeType(prop.type); 
		}
		else if ( (this.isSingle(prop)) && (prop.type == 'string') ){
			decStr = 'type(' + this.changeType(prop.type) + ')';
		}
		else if ( (this.isArray(prop)) && (this.isAtomic(prop) && prop.type != 'string') ) {
			decStr = this.changeType(prop.type) + ', dimension(' + this.getFortDimensionList(prop) +')';
		}
		else if ( (this.isArray(prop)) && (prop.type == 'string') ) {
			decStr = 'type(' + this.changeType(prop.type) + ')' + ', dimension(' + this.getFortDimensionList(prop) +')';
		}
		else if ( (this.isSingle(prop)) && (! this.isAtomic(prop)) ) {
			decStr = 'type(' + this.getClassPathFromType(prop.type) + ')';
		}
		else if ( (this.isArray(prop)) && (! this.isAtomic(prop)) ) {
			decStr = 'type(' + this.getClassPathFromType(prop.type) + ')' + ', dimension(' + this.getFortDimensionList(prop) +')';
		}
		else if ( (this.isArray(prop)) && (prop.type == 'dstring') ) {
			console.log("special treatment of array of dynamic strings");
		} 
		else
			throw("combination for property not found : " + JSON.stringify(prop) );

		if (this.isAllocatable(prop)) {
			decStr = decStr + ', allocatable';
		}
		if (this.isPublic(prop)) {
			decStr = decStr + ', public';
		}
		cmd.push(this.gbl(bl) + decStr + ' :: ' + prop.name + '    !' + prop.description); 

		/*
        if (this.isArray(prop) && this.isAllocatable(prop)) {
            //add dimension variables
            var dimNames = this.getDimensionVarNames(prop);
            for (var di=0; di<dimNames.length; di++) {
                var dimDesc = this.changeType("integer");
                if (this.isPublic(prop)) {
                    dimDesc = dimDesc + ', public';
                }
                cmd.push(this.gbl(bl) + dimDesc + ' :: ' + dimNames[di] + '    !' + di + " dimension of " + prop.name); 
            }
        }
		 */
	}

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.setEqualToDeclaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "procedure, public :: setEqualTo");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Init.prototype.setEqualTo = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine setEqualTo(this, obj)");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "type(" + this.getTypeName() + "),intent(in)"+ " :: obj");
	cmd.push(this.gbl(bl+1) + "integer :: idx");
	cmd.push(this.gbl(bl+1) + "integer,dimension(:),allocatable :: diml");

	cmd.push(this.gbl(bl+1) + "call this%destroy()");

	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;


	/* Loop over each property */
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var dimList = 0;
		var p=0

				if (this.isArray(prop) && this.isAllocatable(prop) && (this.isAtomic(prop) && prop.type != 'string')){			

					cmd.push(this.gbl(bl+1) + "if (allocated(obj%" + prop.name + ")) then");
					dimList = this.getDimensionList(prop);

					cmd.push(this.gbl(bl+2) + "allocate(diml(" + dimList.length + "))");
					cmd.push(this.gbl(bl+2) + "diml=shape(obj%" + prop.name + ")");
					var sizeList=[];
					for(var k=0; k< dimList.length;k++) {
						p=k+1
								sizeList += ["diml(" + p + ")"]
										if (k<(dimList.length-1)){
											sizeList += [","]
										}

					}

					cmd.push(this.gbl(bl+2) + "allocate(this%" + prop.name + "(" + sizeList + "))");
					cmd.push(this.gbl(bl+2) + "this%" + prop.name + "=obj%" + prop.name);
					cmd.push(this.gbl(bl+2) + "deallocate(diml)");
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
				else if (this.isArray(prop) && (! this.isAtomic(prop)) && (! this.isAllocatable(prop))){
					dimList = this.getDimensionList(prop);
					if (dimList.length > 1)
						throw "destroyClass is not implemented for object array of more than one dimension.";
					cmd.push(this.gbl(bl+2) + "do " + "idx=1,size(obj%" + prop.name + ",1)");
					cmd.push(this.gbl(bl+3) + "call this%"+ prop.name + "(idx)%setEqualTo(obj%" + prop.name + "(idx))");
					cmd.push(this.gbl(bl+2) + "end do");
				}
				else if (this.isArray(prop) && (! this.isAtomic(prop)) && (this.isAllocatable(prop))){
					dimList = this.getDimensionList(prop);
					if (dimList.length > 1)
						throw "destroyClass is not implemented for object array of more than one dimension.";
					cmd.push(this.gbl(bl+1) + "if (allocated(obj%" + prop.name + ")) then");
					cmd.push(this.gbl(bl+2) + "allocate(this%" + prop.name + "(size(obj%" + prop.name + ",1)))");
					cmd.push(this.gbl(bl+2) + "do " + "idx=1,size(obj%" + prop.name + ",1)");
					cmd.push(this.gbl(bl+3) + "call this%"+ prop.name + "(idx)%setEqualTo(obj%" + prop.name + "(idx))");
					cmd.push(this.gbl(bl+2) + "end do");
					cmd.push(this.gbl(bl+1) + "end if");

				}




	} /* end of property loop*/

	cmd.push(this.gbl(bl) + "end subroutine setEqualTo");


	return cmd.join('\n');

};
/*----------------------------------------------------------------------------*/
Init.prototype.getInitObjectList = function(prop) {
	if ((this.isArray(prop)) && (! this.isAtomic(prop))){
		/* we have o use a list with the defined dimensions of the object */
		var classPath = this.getClassPathFromType(prop.type);
		var dimList = this.getDimensionList(prop);
		var leftBlock = '';
		var rightBlock = '';
		// var objName = JSON.stringify(className);
		var objName = this.stringify(prop.name);

		if (dimList.length > 1)
			throw "getInitObjectList is not implemented for more than one dimensional array.";

		for (var i = dimList.length-1; i>=0; i--){
			var indName = 'i' + i;

			leftBlock = leftBlock + '[';
			rightBlock = rightBlock + ' for ' + indName + ' in range(0,self.' + dimList[i] + ')]';
			objName = objName + ' + str(' + indName + ')';
		}
		return leftBlock + ' ' + classPath + '(' + objName  + ')' + rightBlock;
	}
	else {
		throw ('Array with non-atomic type was expected.', prop);
	}
};
/*----------------------------------------------------------------------------*/
Init.prototype.getAtomicInitValue = function(prop) {
	if (this.isString(prop))
		return this.stringify("");
	else if (prop.type == 'integer')
		return '0';
	else
		return '0.0';
};
/*----------------------------------------------------------------------------*/
Init.prototype.getPropertyInit = function(bl, prop) {
	/*
	 * return properties default value, if property is an object (complex type),
	 * it returns the command to instantiate that object.
	 */

	if(prop.value == undefined){
		if (this.isArray(prop)) {
			if (this.isAtomic(prop)){
				var cmds = [];
				cmds.push(this.gbl(bl) + 
						'self.' + this.getPropertyPrivateName(prop) + '=' + 'np.empty(shape=(' + 
						this.getPythonArrayDimList(prop).join() + 
						'), dtype=' + this.changeType(prop.type) + ')' );
				cmds.push(this.gbl(bl) + 
						'self.' + this.getPropertyPrivateName(prop) + 
						'.fill(' + this.getAtomicInitValue(prop)+ ')' );
				return cmds.join('\n');
			}
			else {
				if (this.isContained(prop)){
					// return this.getInitObjectList(prop);
					return (this.gbl(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '= []');
				}
				else {
					return (this.gbl(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '= []');
				}

			}
		}
		else if (!(this.isAtomic(prop)) && 
				(this.isContained(prop)) && 
				!(this.isOptional(prop))){
			return (this.gbl(bl) +
					'self.' + this.getPropertyPrivateName(prop) + '=' + 
					this.getClassPathFromType(prop.type) + '(' + JSON.stringify(prop.name) +')');
		}
		else {
			return (this.gbl(bl) +
					'self.' + this.getPropertyPrivateName(prop) + '= None' );
		}
	}
	else {
		if (this.isAtomic(prop)){
			if (this.isSingle(prop)) {
				if (prop.type == "boolean") {
					return (this.gbl(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '=' + 
							this.changeType(prop.type) + '(' + this.changeType("integer") + '(' + JSON.stringify(prop.value) + ')' + ')');
				}
				else {
					return (this.gbl(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '=' + 
							this.changeType(prop.type) + '(' + JSON.stringify(prop.value) + ')');
				}
			}
			else {
				/* array with predefined values and fixed dimension,
				 * check for dimensions
				 * cast value types, must be presented as an array in JSON
				 * with correct type*/

				if (prop.value instanceof Array)
					return (this.gbl(bl) + 
							'self.' + this.getPropertyPrivateName(prop) + '=' + 'np.array(' + this.stringify(prop.value) +
							', dtype=' + this.changeType(prop.type) + ')' );
				else{
					/*initialize all elements with a single value */
					var cmds = [];
					cmds.push(this.gbl(bl) + 
							'self.' + this.getPropertyPrivateName(prop) + '=' + 'np.empty(shape=(' + 
							this.getPythonArrayDimList(prop).join() + 
							'), dtype=' + this.changeType(prop.type) + ')' );
					cmds.push(this.gbl(bl) + 
							'self.' + this.getPropertyPrivateName(prop) + 
							'.fill(' + this.changeType(prop.type) +'(' + this.stringify(prop.value) + '))' );
					return cmds.join('\n');
				}

			}
		}
		else {
			if (this.isSingle(prop)) {
				if (!(this.isAtomic(prop)) && 
						(this.isContained(prop)) && 
						!(this.isOptional(prop)) ){
					return (this.gbl(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '=' + 
							this.getClassPathFromType(prop.type) + '(' + JSON.stringify(prop.name) +')');
				}
				else {
					return (this.gbl(bl) +
							'self.' + this.getPropertyPrivateName(prop) + '=' + 'None');
				}
			}
			else {
				/* array */
				throw "array of objects can not be predefined.";
			}

		}


	}
};
/*----------------------------------------------------------------------------*/
Init.prototype.propInitValueFuncs = function(bl, prop) {
	/*
	 * return properties default value, if property is an object (complex type),
	 * it returns the command to instantiate that object.
	 */

	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var properties = this.getProperties();

	for(var i = 0, len = properties.length; i < len; i++) {
		var prop = properties[i];

		cmd.push(this.gbl(bl) + 'def _getInitValue' + this.firstToUpper(prop.name) + '(self):');

		if(prop.value == undefined){
			if (this.isArray(prop)) {
				if (this.isAtomic(prop)){

					cmd.push(this.gbl(bl+1) + 
							'val = np.empty(shape=(' + 
							this.getPythonArrayDimList(prop).join() + 
							'), dtype=' + this.changeType(prop.type) + ')' );
					cmd.push(this.gbl(bl+1) + 
							'val.fill(' + this.getAtomicInitValue(prop)+ ')' );

				}
				else {
					if (this.isContained(prop)){
						// return this.getInitObjectList(prop);
						cmd.push(this.gbl(bl+1) +
								'val = []');
					}
					else {
						cmd.push(this.gbl(bl+1) +
								'val = []');
					}

				}
			}
			else if (!(this.isAtomic(prop)) && 
					(this.isContained(prop)) && 
					!(this.isOptional(prop))){
				cmd.push(this.gbl(bl+1) +
						'val =' + 
						this.getClassPathFromType(prop.type) + '(' + this.stringify(prop.name) +')');
			}
			else {
				cmd.push(this.gbl(bl+1) +
						'val = None' );
			}
		}
		else {
			if (this.isAtomic(prop)){
				if (this.isSingle(prop)) {
					if (prop.type == "boolean") {
						cmd.push(this.gbl(bl+1) +
								'val =' + 
								this.changeType(prop.type) + '(' + this.changeType("integer") + '(' + this.stringify(prop.value) + ')' + ')');
					}
					else {
						cmd.push(this.gbl(bl+1) +
								'val =' + 
								this.changeType(prop.type) + '(' + this.stringify(prop.value) + ')');
					}
				}
				else {
					/* array with predefined values and fixed dimension,
					 * check for dimensions
					 * cast value types, must be presented as an array in JSON
					 * with correct type*/

					if (prop.value instanceof Array)
						cmd.push(this.gbl(bl+1) +
								'val = np.array(' + this.stringify(prop.value) +
								', dtype=' + this.changeType(prop.type) + ')' );
					else{
						/*initialize all elements with a single value */
						cmd.push(this.gbl(bl+1) +
								'val = np.empty(shape=(' + 
								this.getPythonArrayDimList(prop).join() + 
								'), dtype=' + this.changeType(prop.type) + ')' );
						cmd.push(this.gbl(bl+1) + 
								'val.fill(' + this.changeType(prop.type) +'(' + this.stringify(prop.value) + '))' );
					}

				}
			}
			else {
				if (this.isSingle(prop)) {
					if (!(this.isAtomic(prop)) && 
							(this.isContained(prop)) && 
							!(this.isOptional(prop)) ){
						cmd.push(this.gbl(bl+1) +
								'val =' + 
								this.getClassPathFromType(prop.type) + '(' + this.stringify(prop.name) +')');
					}
					else {
						cmd.push(this.gbl(bl+1) +
								'val = None');
					}
				}
				else {
					/* array */
					throw "array of objects can not be predefined.";
				}

			}


		}

		if (!this.isAtomic(prop) 		&&  this.isContained(prop) && 
				this.hasAssignments(prop)  && !this.isOptional(prop) && this.isSingle(prop)){
			var assign = this.getAssignments(prop);
			cmd.push(this.assignPropertyValue(bl+1, assign, 'val'));
		}

		cmd.push(this.gbl(bl+1) + 
				'return val' );

		cmd.push(this.gbl(bl));

	}

	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
Init.prototype.classInit = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + 	'def __init__(self,name=None):');

	/* call super class init function if any */
	if (this.isDerived()) {
		/* new class method */
		// cmd.push(this.gbl(bl+1) +
		// 'super(' + this.getClassName() + ', self).__init__()');
		// cmd.push(this.gbl(bl+1) + '');

		var superTypes = this.superTypes();

		cmd.push(this.gbl(bl) + 
				'#calling super inits');
		for (var i = 0; i<superTypes.length; i++){
			var supType = superTypes[i];
			cmd.push(this.gbl(bl+1) +
					supType.name +'.__init__(self, name)');

		}
		cmd.push(this.gbl(bl+1) + '');
	}

	/* init main attributes */
	/*
	 * var attrs = this.getPropertyStorableAttrs(this.getModel());
	 * cmd.push(this.gbl(bl+1) + 'self.attrs = dict()'); for(var i =
	 * 0; i < attrs.length; i++) { var attr = attrs[i];
	 * cmd.push(this.gbl(bl+1) + 'self.attrs[' + JSON.stringify(attr) + '] = ' +
	 * JSON.stringify(this.getModel()[attr]) ); }
	 */

	// cmd.push(this.gbl(bl+1) +
	// 'self.' + this.modelDesAtt() + ' = ' +
	// JSON.stringify(this.getModelWithOutPtoperties()) );
	cmd.push(this.gbl(bl+1) + 
			'self.' + this.modelDesAtt() + ' = ' + this.stringify(this.getModel(),  null, '\t') );
	/*
	 * this is a dictionary which keep track of synchronizing the data in object
	 * with the back-end storage, it keep a list of properties, -- not in keys,
	 * or has a value of -1, means it is out of sync with data-storage and when
	 * the user asks for the data, it must load from storage first. -- not in
	 * keys, or value 1, means it is updated by the user and on save must be
	 * written to storage
	 */

	cmd.push(this.gbl(bl+1) + 	'self.ID = str(uuid.uuid4())');
	cmd.push(this.gbl(bl+1) + 	'self._saved = {}');
	cmd.push(this.gbl(bl+1) + 	'self.REF = None');
	/* storage */
	cmd.push(this.gbl(bl+1) +		'self._sync = {}');
	cmd.push(this.gbl(bl+1) +		'self._STORAGE = None');
	//cmd.push(this.gbl(bl+1) +		'self._STORAGE = pyds.getDataStorageBackEndServer("hdf5")');
	//cmd.push(this.gbl(bl+1) +		'self._STORAGE.filePath = str(name) + ".h5"');

	cmd.push(this.gbl(bl+1) + 	'self._loadedItems = []');

	/* initializing properties */
	var properties = this.getProperties();
	var propNum = properties.length;

	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		if (prop.name == "name") {
			/* initializing name */		
			cmd.push(this.getPropertyInit(bl+1, prop));			
			cmd.push(this.gbl(bl+1) + 
					'if not(name == None):');			
			cmd.push(this.gbl(bl+2) + 
					'self.' + this.getPropertyPrivateName(prop) + ' = name ');			
		}
		else {
			/* initializing other properties */
			cmd.push(this.gbl(bl+1) + 
					'self.' + this.getPropertyPrivateName(prop) + '= self._getInitValue' +
					this.firstToUpper(prop.name) + '()');


		}

		/* storing, storable property attributes */
		/*
		 * var propAttrs = this.getPropertyStorableAttrs(prop);
		 * cmd.push(this.gbl(bl+1) + 'self.' +
		 * this.getPropertyAttrsHolderName(prop) + ' = dict()'); for(var j = 0;
		 * j < propAttrs.length; j++) { cmd.push(this.gbl(bl+1) +
		 * 'self.' + this.getPropertyAttrsHolderName(prop) + '[' +
		 * JSON.stringify(propAttrs[j]) + '] = ' +
		 * JSON.stringify(prop[propAttrs[j]])); }
		 */

		cmd.push(this.gbl(bl+1) + 
				'self.' + this.modelDesAtt(prop) + ' = ' + this.stringify(prop) );

		cmd.push(this.gbl(bl+1));

	}


	return cmd.join('\n');
};

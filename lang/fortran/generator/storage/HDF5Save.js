/*----------------------------------------------------------------------------*/
function HDF5Save(){
};
exports.HDF5Save = HDF5Save;
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveH5Declaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "generic, public :: save_HDF5 => save_HDF5_toNewDataBaseWiDefaultName, save_HDF5_toNewDataBase, save_HDF5_toExistingDataBase");
	cmd.push(this.gbl(bl) + "procedure :: save_HDF5_toNewDataBaseWiDefaultName");
	cmd.push(this.gbl(bl) + "procedure :: save_HDF5_toNewDataBase");
	cmd.push(this.gbl(bl) + "procedure :: save_HDF5_toExistingDataBase");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.saveH5 = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.save_HDF5_toNewDataBaseWiDefaultName(bl));
	
	cmd.push(this.gbl(bl) + "");
	cmd.push(this.gbl(bl) + this.sep2);
	cmd.push(this.gbl(bl) + "");	

	cmd.push(this.save_HDF5_toNewDataBase(bl));

	cmd.push(this.gbl(bl) + "");
	cmd.push(this.gbl(bl) + this.sep2);
	cmd.push(this.gbl(bl) + "");
	
	cmd.push(this.save_HDF5_toExistingDataBase(bl));

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.save_HDF5_toNewDataBaseWiDefaultName = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine save_HDF5_toNewDataBaseWiDefaultName(this,error)");
	cmd.push(this.gbl(bl+1) + 	"implicit none");
	cmd.push(this.gbl(bl+1) + 	"class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + 	"integer, intent(out) :: error ! =0: ok, =1: error during the saving procedure");
	cmd.push(this.gbl(bl+1) + 	"call this%save_HDF5_toNewDataBase(this%name%toChars()+'.h5', error)");
	cmd.push(this.gbl(bl) + "end subroutine save_HDF5_toNewDataBaseWiDefaultName");
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
HDF5Save.prototype.save_HDF5_toNewDataBase = function(bl) {
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
	cmd.push(this.gbl(bl+2) + 	"errorj = H5A_RemoveDatabase( fileName%toChars() // c_null_char)");
	cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
	cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
	cmd.push(this.gbl(bl+2) + 	"end if");
	cmd.push(this.gbl(bl+1) + "end if");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Create new database");
	cmd.push(this.gbl(bl+1) + "dataBaseID = H5A_OpenOrCreateDatabase(fileName%toChars() // c_null_char)");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Save the current object if it is valid");
	cmd.push(this.gbl(bl+1) + "if (this%isValid()) then");
	cmd.push(this.gbl(bl+2) + 	"groupID = H5A_OpenOrCreateEntity(dataBaseID,this%name%toChars() // c_null_char)");
	cmd.push(this.gbl(bl+2) + 	"call this%save_HDF5_toExistingDataBase(groupID,errorj)");
	cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
	cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
	cmd.push(this.gbl(bl+2) + 	"end if");
	cmd.push(this.gbl(bl+1) + "end if");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Close the data base");
	cmd.push(this.gbl(bl+1) + "errorj = H5A_CloseDatabase(dataBaseID)");
	cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
	cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
	cmd.push(this.gbl(bl+1) + "end if");
	
	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Error check");
	cmd.push(this.gbl(bl+1) + "if (H5A_IS_ERROR(error)) then");
	cmd.push(this.gbl(bl+2) + 	"write(*,*) 'Error during saving of "+ this.getTypeName() + ":'" + ",error");
	cmd.push(this.gbl(bl+1) + "end if");

	cmd.push(this.gbl(bl) + "end subroutine save_HDF5_toNewDataBase");
	
	return cmd.join('\n');
};
    	
/*----------------------------------------------------------------------------*/
HDF5Save.prototype.save_HDF5_toExistingDataBase = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine save_HDF5_toExistingDataBase(this,groupIndex,error)");
	cmd.push(this.gbl(bl+1) + "implicit none");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "integer, intent(in) :: groupIndex");
	cmd.push(this.gbl(bl+1) + "integer, intent(out) :: error");
	cmd.push(this.gbl(bl+1) + "! Internal variables");
	cmd.push(this.gbl(bl+1) + "integer :: errorj");
	
	if (this.hasArray()){
		cmd.push(this.gbl(bl+1) + "integer :: sv");
		cmd.push(this.gbl(bl+1) + "integer, dimension(:), allocatable :: diml");
	}
	if (this.hasBoolean())
		cmd.push(this.tempVariablesForSavingAndLoadingLogicals(bl+1));
	
	if (this.hasBooleanArray() || this.hasNonAtomicArray())
		cmd.push(this.tempIndexVariablesForSavingAndLoading(bl+1));
	
	if (this.hasNonAtomic())
		cmd.push(this.gbl(bl+1) + "integer :: subGroupIndex");	    
	
	if (this.hasNonAtomicArray()){
		cmd.push(this.gbl(bl+1) + "integer :: subGroupIndex2"); 
		cmd.push(this.gbl(bl+1) + "type(String) :: orderList");
	}

	/* Only if complex properties exist in the class*/
    if (this.hasComplex()) {
    	cmd.push(this.gbl(bl+1) + "complex :: complexI=(0.0,1.0)");
    	cmd.push(this.tempVariablesForLoadingComplexVariables(bl+1))
    }
    
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
	cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
	cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
	cmd.push(this.gbl(bl+1) + "end if");

	/* Loop over each property */
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		var dimList = 0;

		cmd.push(this.gbl(bl+1) + "");
		cmd.push(this.gbl(bl+1) + "!-------------------------------------------------------------------------");
		cmd.push(this.gbl(bl+1) + "! Save property " + prop.name);
		cmd.push(this.gbl(bl+1) + "!-------------------------------------------------------------------------");

		if (this.isAtomic(prop) && this.isArray(prop)){
			dimList = this.getDimensionList(prop);
			var sizeList=[];
			for(var k=1; k<= dimList.length;k++) {
				sizeList.push("diml(" + k + ")")
			}
			var addBL = 0;
			if (this.isAllocatable(prop)){ 
				cmd.push(this.gbl(bl+1) + "if (allocated(this%" + prop.name + ")) then");
				addBL = 1;
			}
			cmd.push(this.allocateBlock(bl+addBL+1, "diml(" + dimList.length + ")", "diml",
													"sv", "error", 
													"Error during saving of "+ this.getTypeName() + ", error when trying to allocate diml array for " + prop.name));
			
			cmd.push(this.gbl(bl+addBL+1) + 	"diml=shape(this%" + prop.name + ")");
			if (prop.type=='double'){
				cmd.push(this.gbl(bl+addBL+1) + "errorj = H5A_WriteDoubleArray(groupIndex, '" + prop.name + "' // c_null_char," + dimList.length + ",diml,this%" + prop.name + ")");
				cmd.push(this.gbl(bl+addBL+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+addBL+2) + 	"call throw('Error during saving of " + prop.name + "')");
				cmd.push(this.gbl(bl+addBL+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+addBL+1) + "end if");
				}
			else if (prop.type=='complex'){
			    var realVarName = "realOfComplexArr"  + dimList.length;
			    var imagVarName = "imagOfComplexArr"  + dimList.length;
				cmd.push(this.allocateBlock(bl+addBL+1, 	realVarName + "(" + sizeList.join(',') + ")", realVarName,
													"sv", "error", 
													"Error during loading of "+ this.getTypeName() + ", error when trying to allocate real array for " + prop.name));
				cmd.push(this.allocateBlock(bl+addBL+1, 	imagVarName + "(" + sizeList.join(',') + ")", imagVarName,
													"sv", "error", 
													"Error during loading of "+ this.getTypeName() + ", error when trying to allocate imaginary array for " + prop.name));
			    
				cmd.push(this.gbl(bl+addBL+1) + realVarName + " = real(this%" + prop.name + ")");
				cmd.push(this.gbl(bl+addBL+1) + imagVarName + " = aimag(this%" + prop.name + ")");
				
				cmd.push(this.gbl(bl+addBL+1) + "errorj = H5A_WriteDoubleArray(groupIndex, '" + prop.name+"_RE" + "' // c_null_char," + dimList.length + ", diml, " + realVarName + " )");
				cmd.push(this.gbl(bl+addBL+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+addBL+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+addBL+2) + 	"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(bl+addBL+1) + "end if");
				cmd.push(this.gbl(bl+addBL+1) + "errorj = H5A_WriteDoubleArray(groupIndex, '" + prop.name+"_IM" + "' // c_null_char," + dimList.length + ", diml, " + imagVarName + " )");
				cmd.push(this.gbl(bl+addBL+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+addBL+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+addBL+2) + 	"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(bl+addBL+1) + "end if");
				
				cmd.push(this.gbl(bl+addBL+1) + "deallocate(" + realVarName + ")");
				cmd.push(this.gbl(bl+addBL+1) + "deallocate(" + imagVarName + ")");
			}
			else if (prop.type=='integer'){
				cmd.push(this.gbl(bl+addBL+1) + "errorj = H5A_WriteIntArray(groupIndex, '" + prop.name + "' // c_null_char," + dimList.length + ",diml,this%" + prop.name + ")");	
				cmd.push(this.gbl(bl+addBL+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+addBL+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+addBL+2) + 	"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(bl+addBL+1) + "end if");
				}
			else if (prop.type=='boolean'){
			    var ltoiVarName = "logicalToIntArray"  + dimList.length;
				cmd.push(this.allocateBlock(bl+addBL+1, ltoiVarName + "(" + sizeList.join(',') + ")", ltoiVarName,
														"sv", "error", 
														"Error during saving of "+ this.getTypeName() + ", error when trying to allocate " +ltoiVarName+ " array for " + prop.name));
			    
				var loopBlock = this.getLoopBlockForProp(bl+addBL+1,prop);
				var nbl = loopBlock.bl;
				cmd.push(loopBlock.cmd);
					cmd.push(this.gbl(nbl+1) + 	"if (this%" + prop.name + loopBlock.indArray + ") then ");
					cmd.push(this.gbl(nbl+2) + 		ltoiVarName + loopBlock.indArray + "=1");
					cmd.push(this.gbl(nbl+1) + 	"else");
					cmd.push(this.gbl(nbl+2) + 		ltoiVarName + loopBlock.indArray + "=0");
					cmd.push(this.gbl(nbl+1) + 	"end if");
				cmd.push(loopBlock.endCmd);
				cmd.push(this.gbl(bl+addBL+1) + "errorj = H5A_WriteIntArray(groupIndex, '" + prop.name + "' // c_null_char," + dimList.length + ",diml," + ltoiVarName + ")");						
				cmd.push(this.gbl(bl+addBL+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+addBL+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+addBL+2) + 	"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(bl+addBL+1) + "end if");
				cmd.push(this.gbl(bl+addBL+1) + "deallocate(" +ltoiVarName+")");
			    
			}
			else if (prop.type=='string'){
				throw "saveH5 does not support arrays of string yet.";	
			}
			
			cmd.push(this.gbl(bl+addBL+1) + "deallocate(diml)");
			
			if (this.isAllocatable(prop)){ 
				cmd.push(this.gbl(bl+1) + "end if");
			}			
		}
		else if (this.isSingle(prop) && (this.isAtomic(prop))){
			if (prop.type=='double'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_WriteDouble(groupIndex, '" + prop.name + "' // c_null_char,this%" + prop.name + ")");
				cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"call throw('Error during saving of " + prop.name + "')");
				cmd.push(this.gbl(bl+1) + "end if");
				}
			if (prop.type=='complex'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_WriteDouble(groupIndex, '" + prop.name+"_RE" + "' // c_null_char,real(this%" + prop.name + "))");
				cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(bl+1) + "end if");
				cmd.push(this.gbl(bl+1) + "errorj = H5A_WriteDouble(groupIndex, '" + prop.name+"_IM" + "' // c_null_char,aimag(this%" + prop.name + "))");
				cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(bl+1) + "end if");
				}
			else if (prop.type=='integer'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_WriteInt(groupIndex, '" + prop.name + "' // c_null_char,this%" + prop.name + ")");	
				cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(bl+1) + "end if");
				}
			else if (prop.type=='boolean'){
				cmd.push(this.gbl(bl+1) + "if (this%" + prop.name + ") then ");
				cmd.push(this.gbl(bl+2) + 	"logicalToIntSingle=1");
				cmd.push(this.gbl(bl+1) + "else");
				cmd.push(this.gbl(bl+2) + 	"logicalToIntSingle=0");
				cmd.push(this.gbl(bl+1) + "end if");
				cmd.push(this.gbl(bl+1) + "errorj = H5A_WriteInt(groupIndex, '" + prop.name + "' // c_null_char,logicalToIntSingle)");	
				cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(bl+1) + "end if");
				}
			else if (prop.type=='string'){
				cmd.push(this.gbl(bl+1) + "if (.not.(this%" + prop.name + "%isEmpty())) then");
				cmd.push(this.gbl(bl+2) + 	"errorj = H5A_writeStringWithLength(groupIndex, '" + prop.name + "' // c_null_char,this%" + prop.name + "%toChars() // c_null_char)");		
				cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(bl+2) + 	"end if");
				cmd.push(this.gbl(bl+1) + "end if");
			}	
		}
		else if (this.isSingle(prop) && (! this.isAtomic(prop))){
			if (this.isOptional(prop)) {
				cmd.push(this.gbl(bl+1) + "if (this%" + prop.name + "%isValid()) then");
				cmd.push(this.gbl(bl+2) + 	"subGroupIndex = H5A_OpenOrCreateEntity(groupIndex,'"  + prop.name +  "' // c_null_char)");
				cmd.push(this.gbl(bl+2) + 	"call this%" + prop.name + "%save_HDF5_toExistingDataBase(subGroupIndex,errorj)");
				cmd.push(this.gbl(bl+2) + 	this.errorBlock(bl+2, 'errorj', 'Error while saving ' + prop.name ) );
				cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(bl+2) + 	"end if");
				cmd.push(this.gbl(bl+1) + "end if");				
			}
			else {
				cmd.push(this.gbl(bl+1) + "if (this%" + prop.name + "%isValid()) then");
				cmd.push(this.gbl(bl+2) + 	"subGroupIndex = H5A_OpenOrCreateEntity(groupIndex,'"  + prop.name +  "' // c_null_char)");
				cmd.push(this.gbl(bl+2) + 	"call this%" + prop.name + "%save_HDF5_toExistingDataBase(subGroupIndex,errorj)");
				cmd.push(this.gbl(bl+2) + 	this.errorBlock(bl+2, 'errorj', 'Error while saving ' + prop.name ) );
				cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"call throw('Error during saving of " + prop.name + "')");
				cmd.push(this.gbl(bl+2) + 	"end if");
				cmd.push(this.gbl(bl+1) + "else");
				cmd.push(this.gbl(bl+2) + 	"errorj=-1");
				cmd.push(this.gbl(bl+2) + 	this.errorBlock(bl+2, 'errorj', 'error during saving to hdf5 file. A non-optional object is invalid (i.e. does not have a name):' + prop.name ) );
				cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
				cmd.push(this.gbl(bl+3) + 		"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(bl+2) + 	"end if");
				cmd.push(this.gbl(bl+1) + "end if");
			}
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop))){
			dimList = this.getDimensionList(prop);
			
			cmd.push(this.gbl(bl+1) + "call orderList%destroy()");

			var addBL = 0;
			
			if (this.isAllocatable(prop)){
				cmd.push(this.gbl(bl+1) + "if (allocated(this%" + prop.name + ")) then");
				addBL = 1;
			}
			
			cmd.push(this.allocateBlock(bl+addBL+1, "diml(" + dimList.length + ")", "diml",
													"sv", "error", 
													"Error during saving of "+ this.getTypeName() + ", error when trying to allocate diml array for " + prop.name));
			
			cmd.push(this.gbl(bl+addBL+1) + 	"diml=shape(this%" + prop.name + ")");
			cmd.push(this.gbl(bl+addBL+1) + 	"subGroupIndex = H5A_OpenOrCreateEntity(groupIndex, '"  + prop.name +  "' // c_null_char)");
			
			var loopBlock = this.getLoopBlockForProp(bl+addBL+1,prop);
			var nbl = loopBlock.bl;
			cmd.push(loopBlock.cmd);
				cmd.push(this.gbl(nbl+1) +	"if (this%"+ prop.name + loopBlock.indArray + "%isValid()) then");   
				cmd.push(this.gbl(nbl+2) + 		"subGroupIndex2 = H5A_OpenOrCreateEntity(subGroupIndex, this%"  + prop.name +  loopBlock.indArray + "%name%toChars() // c_null_char)");				
				cmd.push(this.gbl(nbl+2) + 		"call this%"+ prop.name + loopBlock.indArray + "%save_hdf5(subGroupIndex2,errorj)");
				cmd.push(this.gbl(nbl+2) + 	    "if (errorj.lt.0) then");
				cmd.push(this.gbl(nbl+3) + 			"error = error + errorj");
				cmd.push(this.gbl(nbl+3) + 			"call throw('Error during saving of " + prop.name + "')");				
				cmd.push(this.gbl(nbl+2) + 		"end if");
				cmd.push(this.gbl(nbl+2) + 		"if (.not.(orderList%isEmpty())) then");
				cmd.push(this.gbl(nbl+3) + 			"orderList=orderList+','");
				cmd.push(this.gbl(nbl+2) + 		"end if");
				cmd.push(this.gbl(nbl+2) + 		"orderList=orderList+this%" + prop.name + loopBlock.indArray + "%name%toChars()");
				cmd.push(this.gbl(nbl+1) + 	"end if");	
			cmd.push(loopBlock.endCmd);
				
			cmd.push(this.gbl(bl+addBL+1) + "error = error + H5A_SetDim(subGroupIndex,size(diml,1), diml)");
			cmd.push(this.gbl(bl+addBL+1) + "deallocate(diml)");

			if (this.isAllocatable(prop)){
			    cmd.push(this.gbl(bl+1) + "end if");
			}
			
			cmd.push(this.gbl(bl+1) + "if (.not.(orderList%isEmpty())) then");
			cmd.push(this.gbl(bl+2) + 	"errorj=h5a_setOrder(subGroupIndex,orderList%toChars() // c_null_char)");
			cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
			cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
			cmd.push(this.gbl(bl+3) + 		"call throw('Error during saving of " + prop.name + "')");			
			cmd.push(this.gbl(bl+2) + 	"end if");
			cmd.push(this.gbl(bl+1) + "end if");
			
			cmd.push(this.gbl(bl+1) + "call orderList%destroy()");

		}




	} /* end of property loop*/
	
	cmd.push(this.gbl(bl+1) + "! Error check");
	cmd.push(this.gbl(bl+1) + "if (error.ne.0) then");
	cmd.push(this.gbl(bl+2) + 	"write(*,*) 'Error during saving of "+ this.getTypeName() + ":'" + ",error");
	cmd.push(this.gbl(bl+1) + "end if");
	cmd.push(this.gbl(bl) + "end subroutine save_HDF5_toExistingDataBase");


	return cmd.join('\n');
}

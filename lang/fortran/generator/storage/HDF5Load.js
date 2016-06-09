//var njs = require('../../njs')();

/*----------------------------------------------------------------------------*/
function HDF5Load(){
};
exports.HDF5Load = HDF5Load;
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadH5Declaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "generic, public :: load_HDF5 => load_HDF5_fromDefaultFile, load_HDF5_fromFileNameAndEntityName, load_HDF5_fromGroupIndex");
	cmd.push(this.gbl(bl) + "procedure :: load_HDF5_fromDefaultFile");
	cmd.push(this.gbl(bl) + "procedure :: load_HDF5_fromFileNameAndEntityName");
	cmd.push(this.gbl(bl) + "procedure :: load_HDF5_fromGroupIndex");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.loadH5 = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.load_HDF5_fromDefaultFile(bl));
	
	cmd.push(this.gbl(bl) + "");
	cmd.push(this.gbl(bl) + this.sep2);
	cmd.push(this.gbl(bl) + "");	

	cmd.push(this.load_HDF5_fromFileNameAndEntityName(bl));
	
	cmd.push(this.gbl(bl) + "");
	cmd.push(this.gbl(bl) + this.sep2);
	cmd.push(this.gbl(bl) + "");	

	cmd.push(this.load_HDF5_fromGroupIndex(bl));

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.load_HDF5_fromDefaultFile = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine load_HDF5_fromDefaultFile(this,error)");
	cmd.push(this.gbl(bl+1) + "implicit none");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "integer, intent(out) :: error ! =0: ok, =1: error during the saving procedure");	
	
	cmd.push(this.gbl(bl+1) + "!Internal variables, for proper cloning ");
	cmd.push(this.gbl(bl+1) + "type(String) :: fileName");
	cmd.push(this.gbl(bl+1) + "type(String) :: name");
	cmd.push(this.gbl(bl+1))
	cmd.push(this.gbl(bl+1) + "fileName = this%name%toChars()+'.h5'");
	cmd.push(this.gbl(bl+1) + "name = this%name   !has to be cloned before loading");
	cmd.push(this.gbl(bl+1) + "call this%load_HDF5_fromFileNameAndEntityName(fileName, name,error)");

	cmd.push(this.gbl(bl) + "end subroutine load_HDF5_fromDefaultFile");
	return cmd.join('\n');
};	
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.load_HDF5_fromFileNameAndEntityName = function(bl) {
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
	cmd.push(this.gbl(bl+2) + 	"call this%destroy()");
	cmd.push(this.gbl(bl+2) + 	"dataBaseID = H5A_OpenOrCreateDatabase(fileName%toChars() // c_null_char)");
	cmd.push(this.gbl(bl+1) + "else");
	cmd.push(this.gbl(bl+2) + 	"error = error - 1");
	cmd.push(this.gbl(bl+2) + 	"write(*,*)  'Error from load_HDF5 functions. HDF5 file not found: ',fileName%toChars() ");
	cmd.push(this.gbl(bl+1) + "end if");

	cmd.push(this.gbl(bl+1) + "");
	cmd.push(this.gbl(bl+1) + "! Get the first groupIndex and load the object");
	cmd.push(this.gbl(bl+1) + "groupID = H5A_OpenEntity(dataBaseID,entityName%toChars() // c_null_char)");
	cmd.push(this.gbl(bl+1) + "if (groupID.gt.0) then");
	cmd.push(this.gbl(bl+2) + 	"call this%load_HDF5_fromGroupIndex(groupID,errorj)");
	cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
	cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
	cmd.push(this.gbl(bl+2) + 	"end if");
	cmd.push(this.gbl(bl+1) + "else");
	cmd.push(this.gbl(bl+2) + 	"error = error - 1");
	cmd.push(this.gbl(bl+2) + 	"write(*,*) 'Error during saving of "+ this.getTypeName() + ", group not found:'," + " entityName%toChars()");
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

	cmd.push(this.gbl(bl) + "end subroutine load_HDF5_fromFileNameAndEntityName");
	return cmd.join('\n');
};	
/*----------------------------------------------------------------------------*/
HDF5Load.prototype.load_HDF5_fromGroupIndex = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "subroutine load_HDF5_fromGroupIndex(this,groupIndex,error)");
	cmd.push(this.gbl(bl+1) + "implicit none");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "integer, intent(in) :: groupIndex");
	cmd.push(this.gbl(bl+1) + "integer, intent(out) :: error");
	cmd.push(this.gbl(bl+1) + "! Internal variables");
	cmd.push(this.gbl(bl+1) + "integer :: errorj");
	
	if (this.hasArray() || this.hasStringSingle())
		cmd.push(this.gbl(bl+1) + "integer :: sv");
	if (this.hasAtomicArray())
		cmd.push(this.gbl(bl+1) + "integer, dimension(:), allocatable :: diml");
	if (this.hasBoolean())
		cmd.push(this.tempVariablesForSavingAndLoadingLogicals(bl+1));
	/* for boolean arrays or object arrays */
	if (this.hasBooleanArray() || this.hasNonAtomicArray())
		cmd.push(this.tempIndexVariablesForSavingAndLoading(bl+1));
	
	if (this.hasStringSingle())
		cmd.push(this.gbl(bl+1) + "integer :: strSize");

	/* for object arrays */
	if (this.hasNonAtomicArray()) {
		cmd.push(this.gbl(bl+1) + "integer :: idx, idxMod");	
		cmd.push(this.gbl(bl+1) + "integer :: subGroupIndex2"); 
		cmd.push(this.gbl(bl+1) + "integer :: orderSize,arrDimSize");
		cmd.push(this.gbl(bl+1) + "integer, dimension(:), allocatable :: arrDim");		
		cmd.push(this.gbl(bl+1) + "type(String) :: orderList");
		cmd.push(this.gbl(bl+1) + "type(String), allocatable ::listOfNames(:)");
	}
	if (this.hasNonAtomicArray() || this.hasStringSingle()) {
		cmd.push(this.gbl(bl+1) + "character(kind=c_char, len=:), allocatable :: cc_a");
	}
	
	/* for objects */
	if (this.hasNonAtomic())
		cmd.push(this.gbl(bl+1) + "integer :: subGroupIndex");
	
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
			
			cmd.push(this.allocateBlock(bl+1, 	"diml(" + dimList.length + ")",
												"sv", "error", 
												"Error during loading of "+ this.getTypeName() + ", error when trying to allocate diml array for " + prop.name));
			
			cmd.push(this.gbl(bl+1) + "errorj = H5A_GetArrayDims(groupIndex,'" + prop.name + "' // c_null_char, diml)");
			var sizeList=[];
			for(var k=1; k<= dimList.length;k++) {
				sizeList.push("diml(" + k + ")")
			}
			var addBL = 0
			if (this.isAllocatable(prop)){
				cmd.push(this.gbl(bl+1) + "if (errorj.ge.0) then");
				cmd.push(this.allocateBlock(bl+2, 	"this%" + prop.name + "(" + sizeList.join(',') + ")",
													"sv", "error", 
													"Error during loading of "+ this.getTypeName() + ", error when trying to allocate array for " + prop.name));
				
				addBL = 1;
			}	
			if (prop.type=='double'){
				cmd.push(this.gbl(bl+addBL+1) + "errorj = H5A_ReadDoubleArray(groupIndex,'" + prop.name + "' // c_null_char, this%" +  prop.name  + ")");
				cmd.push(this.gbl(bl+addBL+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+addBL+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+addBL+1) + "end if");
				
			}
			else if (prop.type=='complex'){
			    var realVarName = "realOfComplexArr"  + dimList.length
			    var imagVarName = "imagOfComplexArr"  + dimList.length
				cmd.push(this.allocateBlock(bl+addBL+1, 	realVarName + "(" + sizeList.join(',') + ")",
													"sv", "error", 
													"Error during loading of "+ this.getTypeName() + ", error when trying to allocate real array for " + prop.name));
				cmd.push(this.allocateBlock(bl+addBL+1, 	imagVarName + "(" + sizeList.join(',') + ")",
													"sv", "error", 
													"Error during loading of "+ this.getTypeName() + ", error when trying to allocate imaginary array for " + prop.name));
			    
				cmd.push(this.gbl(bl+addBL+1) + "errorj = H5A_ReadDoubleArray(groupIndex,'" + prop.name+"_RE" + "' // c_null_char, " + realVarName + ")");
				cmd.push(this.gbl(bl+addBL+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+addBL+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+addBL+1) + "end if");
				
				cmd.push(this.gbl(bl+addBL+1) + "errorj = H5A_ReadDoubleArray(groupIndex,'" + prop.name+"_IM" + "' // c_null_char, " + imagVarName + ")");
				cmd.push(this.gbl(bl+addBL+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+addBL+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+addBL+1) + "end if");
				
				cmd.push(this.gbl(bl+addBL+1) + "this%" +  prop.name  + " = " + realVarName + " + complexI*" + imagVarName );
				cmd.push(this.gbl(bl+addBL+1) + "deallocate(" + realVarName + ")");
				cmd.push(this.gbl(bl+addBL+1) + "deallocate(" + imagVarName + ")");
				
			}
			else if (prop.type=='integer'){
				cmd.push(this.gbl(bl+addBL+1) + "errorj = H5A_ReadIntArray(groupIndex,'" + prop.name + "' // c_null_char, this%" +  prop.name  + ")");	
				cmd.push(this.gbl(bl+addBL+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+addBL+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+addBL+1) + "end if");
			}
			else if (prop.type=='boolean'){
			    var ltoiVarName = "logicalToIntArray"  + dimList.length;
				cmd.push(this.allocateBlock(bl+addBL+1, ltoiVarName + "(" + sizeList.join(',') + ")",
														"sv", "error", 
														"Error during loading of "+ this.getTypeName() + ", error when trying to allocate " +ltoiVarName+ " array for " + prop.name));
			    
				cmd.push(this.gbl(bl+addBL+1) + "errorj = H5A_ReadIntArray(groupIndex,'" + prop.name + "' // c_null_char, " +ltoiVarName+ ")");
				cmd.push(this.gbl(bl+addBL+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+addBL+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+addBL+1) + "end if");
				
				var loopBlock = this.getLoopBlockForProp(bl+addBL+1,prop);
				var nbl = loopBlock.bl;
				cmd.push(loopBlock.cmd);
					cmd.push(this.gbl(nbl+1) + 	"if (" +ltoiVarName + loopBlock.indArray + ".eq.1) then ");
					cmd.push(this.gbl(nbl+2) + 		"this%" + prop.name + loopBlock.indArray + "=.true.");
					cmd.push(this.gbl(nbl+1) + 	"else");
					cmd.push(this.gbl(nbl+2) + 		"this%" + prop.name + loopBlock.indArray + "=.false.");
					cmd.push(this.gbl(nbl+1) + 	"end if");
				cmd.push(loopBlock.endCmd);

				cmd.push(this.gbl(bl+addBL+1) + "deallocate(" +ltoiVarName+")");
			    
			}else if (prop.type=='string'){
				throw "loadH5 does not support arrays of string yet.";	
			}
			if (this.isAllocatable(prop)){
				cmd.push(this.gbl(bl+1) + "end if");
			}	
			cmd.push(this.gbl(bl+1) + "deallocate(diml)");
		}
		else if (this.isSingle(prop) && (this.isAtomic(prop))){
			if (prop.type=='double'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_ReadDouble(groupIndex, '" + prop.name + "' // c_null_char,this%" + prop.name + ")");
				cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+1) + "end if");
			}
			else if (prop.type=='complex'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_ReadDouble(groupIndex, '" + prop.name+"_RE" + "' // c_null_char, realOfComplexSingle)");
				cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+1) + "end if");
				cmd.push(this.gbl(bl+1) + "errorj = H5A_ReadDouble(groupIndex, '" + prop.name+"_IM" + "' // c_null_char, imagOfComplexSingle)");
				cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+1) + "end if");
				cmd.push(this.gbl(bl+1) + "this%" +  prop.name  + " = realOfComplexSingle + complexI*imagOfComplexSingle");
			}
			else if (prop.type=='integer'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_ReadInt(groupIndex, '" + prop.name + "' // c_null_char,this%" + prop.name + ")");	
				cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+1) + "end if");
			}
			else if (prop.type=='boolean'){
				cmd.push(this.gbl(bl+1) + "errorj = H5A_ReadInt(groupIndex, '" + prop.name + "' // c_null_char,logicalToIntSingle)");	
				cmd.push(this.gbl(bl+1) + "if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+1) + "end if");
				cmd.push(this.gbl(bl+1) + "if (logicalToIntSingle.eq.1) then ");
				cmd.push(this.gbl(bl+2) + 	"this%" + prop.name + "=.true.");
				cmd.push(this.gbl(bl+1) + "else");
				cmd.push(this.gbl(bl+2) + 	"this%" + prop.name + "=.false.");
				cmd.push(this.gbl(bl+1) + "end if");

			}else if (prop.type=='string'){
				cmd.push(this.gbl(bl+1) + "errorj= H5A_getStringLength(groupIndex, '" + prop.name + "' // c_null_char,strSize)");
				cmd.push(this.gbl(bl+1) + "if (errorj.ge.0) then");
				cmd.push(this.allocateBlock(bl+2, 	"character(len=strSize) :: cc_a",
													"sv", "error", 
													"Error during loading of "+ this.getTypeName() + ", error when trying to allocate name for " + prop.name));
				cmd.push(this.gbl(bl+2) + 	"errorj = H5A_ReadStringWithLength(groupIndex, '" + prop.name + "' // c_null_char,cc_a)");		
				cmd.push(this.gbl(bl+2) + 	"this%" + prop.name + "=String(cc_a)");
				cmd.push(this.gbl(bl+2) + 	"this%" + prop.name + "=this%" + prop.name +"%trim()");
				cmd.push(this.gbl(bl+2) + 	"deallocate(cc_a)");
				cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"end if");				
				cmd.push(this.gbl(bl+1) + "end if");
				
			}	
		}
		else if (this.isSingle(prop) && (! this.isAtomic(prop))){
			cmd.push(this.gbl(bl+1) + "subGroupIndex = H5A_OpenEntity(groupIndex,'"  + prop.name +  "' // c_null_char)");
			cmd.push(this.gbl(bl+1) + "if (subGroupIndex.gt.0) then");
			cmd.push(this.gbl(bl+2) + 	"call this%" + prop.name + "%load_HDF5_fromGroupIndex(subGroupIndex,errorj)");			
			cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
			cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
			cmd.push(this.gbl(bl+2) + 	"end if");			
			if (this.isOptional(prop)) {
				cmd.push(this.gbl(bl+1) + "end if");
			}
			else {
				cmd.push(this.gbl(bl+1) + "else");
				cmd.push(this.gbl(bl+2) + 	"error=error-1");
				cmd.push(this.gbl(bl+2) + 	"write(*,*) 'Error during saving of "+ this.getTypeName() + ", group not found: " + prop.name + "'");
				cmd.push(this.gbl(bl+1) + "end if");
			}
		}
		else if (this.isArray(prop) && (! this.isAtomic(prop))){
			dimList = this.getDimensionList(prop);
			//if (dimList.length > 1)
			//	throw "savehdf5 is not implemented for object array of more than one dimension.";
			cmd.push(this.gbl(bl+1) + "call orderList%destroy()");
			
			cmd.push(this.gbl(bl+1) + "! Open the array group");
			cmd.push(this.gbl(bl+1) + "subGroupIndex = H5A_OpenEntity(groupIndex,'"  + prop.name +  "' // c_null_char)");
			cmd.push(this.gbl(bl+1) + "if (subGroupIndex.gt.0) then");
			
			cmd.push(this.gbl(bl+2) + 	"! Read the order attribute");
			cmd.push(this.gbl(bl+2) + 	"errorj = H5A_GetOrderSize(subGroupIndex,orderSize)");
			cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
			cmd.push(this.gbl(bl+3) + 		"write(*,*) 'Error during loading of "+ this.getTypeName() + ", order not found for array: " + prop.name + "'");
			cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
			cmd.push(this.gbl(bl+2) + 	"end if");
			cmd.push(this.allocateBlock(bl+2, 	"character(len=orderSize) :: cc_a",
												"sv", "error", 
												"Error during loading of "+ this.getTypeName() + ", error when trying to allocate orderList for " + prop.name));			
			cmd.push(this.gbl(bl+2) + 	"errorj = H5A_GetOrder(subGroupIndex, cc_a)");
			cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
			cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
			cmd.push(this.gbl(bl+2) + 	"end if");			
			cmd.push(this.gbl(bl+2) + 	"orderList=String(cc_a)");
			cmd.push(this.gbl(bl+2) + 	"deallocate(cc_a)");
			cmd.push(this.gbl(bl+2) + 	"call orderList%split(',', listOfNames)");

			cmd.push(this.gbl(bl+2) + 	"! Read the arrDim attribute");
			cmd.push(this.gbl(bl+2) + 	"errorj = H5A_GetDimSize(subGroupIndex,arrDimSize)");
			cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
			cmd.push(this.gbl(bl+3) + 		"write(*,*) 'warning during loading of "+ this.getTypeName() + ", arrDim (rank) has not been found and is set to one for array: " + prop.name + "'");
			cmd.push(this.gbl(bl+3) + 		"arrDimSize = 1");
			cmd.push(this.gbl(bl+3) + 		"errorj = 0");
			cmd.push(this.gbl(bl+2) + 	"end if");			
			cmd.push(this.gbl(bl+2) + 	"if (arrDimSize.ne." + dimList.length + ") then");
			cmd.push(this.gbl(bl+3) + 		"write(*,*) 'Error during loading of "+ this.getTypeName() + ", arrDim length is not consistent with the data model for array: " + prop.name + "'");
			cmd.push(this.gbl(bl+3) + 		"error = -1");
			cmd.push(this.gbl(bl+2) + 	"end if");			
			cmd.push(this.allocateBlock(bl+2, 	"arrDim(arrDimSize)",
												"sv", "error", 
												"Error during loading of "+ this.getTypeName() + ", error when trying to allocate arrDim array for " + prop.name));
			cmd.push(this.gbl(bl+2) + 	"errorj = H5A_GetDim(subGroupIndex, arrDim)");
			cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
			cmd.push(this.gbl(bl+3) + 		"if (arrDimSize.eq.1) then ");
			cmd.push(this.gbl(bl+4) + 			"arrDim(1) = size(listOfNames)");
			cmd.push(this.gbl(bl+4) + 			"errorj = 0");
			cmd.push(this.gbl(bl+3) + 		"else");
			cmd.push(this.gbl(bl+4) + 			"write(*,*) 'Error during loading of "+ this.getTypeName() + ", arrDim has not been found for array: " + prop.name + "'");
			cmd.push(this.gbl(bl+3) + 		"end if");			
			cmd.push(this.gbl(bl+2) + 	"end if");
			
			cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
			cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
			cmd.push(this.gbl(bl+2) + 	"end if");
			
			var allocateSizeList = []
			for (var dimi=1; dimi<=dimList.length; dimi++) {
			    allocateSizeList.push("arrDim(" + dimi + ")");
			}
			var allocateSize = allocateSizeList.join(',');
			
			if (this.isAllocatable(prop)){
				cmd.push(this.gbl(bl+2) + 	"! Allocate the array");
				cmd.push(this.allocateBlock(bl+2, 	"this%" + prop.name + "(" + allocateSize + ")",
													"sv", "error", 
													"Error during loading of "+ this.getTypeName() + ", error when trying to allocate " + prop.name));
			}
			
			cmd.push(this.gbl(bl+2) + 	"! Read each component");
			cmd.push(this.gbl(bl+2) + 	"do idx=1,size(listOfNames)");
			cmd.push(this.gbl(bl+3) + 		"subGroupIndex2 = H5A_OpenEntity(subGroupIndex, listOfNames(idx)%toChars() // c_null_char)");
			cmd.push(this.gbl(bl+3) + 		"idxMod = idx");
			
			var dimListVarNames = [] 
			dimListVarNames.push("idx1")
			for (var dimi=1; dimi<dimList.length; dimi++) {					
				cmd.push(this.gbl(bl+3) + 		"idx" + dimi + " = idxMod/("+ allocateSizeList.slice(dimi).join('*') + ") + 1");
				cmd.push(this.gbl(bl+3) + 		"if (mod(idxMod, "+ allocateSizeList.slice(dimi).join('*') + ") .eq. 0 ) then");
				cmd.push(this.gbl(bl+4) + 			"idx" + dimi + " = idx" + dimi + " - 1");
				cmd.push(this.gbl(bl+3) + 		"end if");				
				cmd.push(this.gbl(bl+3) + 		"idxMod = idxMod - (idx" + dimi + "-1)*("+ allocateSizeList.slice(dimi).join('*') + ")" );
				dimListVarNames.push("idx" + (dimi+1))
			}
			cmd.push(this.gbl(bl+3) + 		"idx" + dimList.length + " = idxMod");

			cmd.push(this.gbl(bl+3) + 		"if (subGroupIndex2.gt.0) then");
			cmd.push(this.gbl(bl+4) + 			"call this%" + prop.name + "("+ dimListVarNames.join(',') +")%load_HDF5_fromGroupIndex(subGroupIndex2,errorj)");			
			cmd.push(this.gbl(bl+4) + 			"if (errorj.lt.0) then");
			cmd.push(this.gbl(bl+5) + 				"error = error + errorj");
			cmd.push(this.gbl(bl+4) + 			"end if");
			cmd.push(this.gbl(bl+3) + 		"else");
			cmd.push(this.gbl(bl+4) + 			"error=-1");
			cmd.push(this.gbl(bl+4) + 			"write(*,*) 'Error during loading of "+ this.getTypeName() + ", group not found: ',listOfNames(idx)%toChars()");
			cmd.push(this.gbl(bl+3) + 		"end if");
			cmd.push(this.gbl(bl+2) + 	"end do");
			cmd.push(this.gbl(bl+1) + "end if");
			cmd.push(this.gbl(bl+1) + "call orderList%destroy()");

		}

	} /* end of property loop*/
	cmd.push(this.gbl(bl+1) + "! Error check");
	cmd.push(this.gbl(bl+1) + "if (error.ne.0) then");
	cmd.push(this.gbl(bl+2) + "write(*,*) 'Error during loading of "+ this.getTypeName() + ":'" + ",error");
	cmd.push(this.gbl(bl+1) + "end if");
	cmd.push(this.gbl(bl) + "end subroutine load_HDF5_fromGroupIndex");

	return cmd.join('\n');
};
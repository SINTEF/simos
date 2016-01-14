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

	cmd.push(this.gbl(bl) + "generic, public :: load_HDF5 => load_HDF5_fromFileNameAndEntityName, load_HDF5_fromGroupIndex");
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
	cmd.push(this.gbl(bl+1) + "integer, dimension(:,:), allocatable :: logicalToIntArray2");	
	cmd.push(this.gbl(bl+1) + "integer :: idx,idy");
	cmd.push(this.gbl(bl+1) + "integer :: orderSize,sv");	
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
					if (dimList.length == 1){
						cmd.push(this.gbl(bl+2) + "allocate(IntArrayToLogical(diml(1)))");
						cmd.push(this.gbl(bl+2) + "errorj = H5A_ReadIntArray(groupIndex,'" + prop.name + "' // c_null_char, IntArrayToLogical)");
						cmd.push(this.gbl(bl+2) + "error=error+errorj");
						cmd.push(this.gbl(bl+2) + "do idx=1,diml(1)");
						cmd.push(this.gbl(bl+3) + 	"if (IntArrayToLogical(idx).eq.1) then ");
						cmd.push(this.gbl(bl+4) + 		"this%" + prop.name + "(idx)=.true.");
						cmd.push(this.gbl(bl+3) + 	"else");
						cmd.push(this.gbl(bl+4) + 		"this%" + prop.name + "(idx)=.false.");
						cmd.push(this.gbl(bl+3) + 	"end if");
						cmd.push(this.gbl(bl+2) + "end do");
						cmd.push(this.gbl(bl+2) + "deallocate(IntArrayToLogical)");
					}
					else if (dimList.length == 2){
						cmd.push(this.gbl(bl+2) + "allocate(IntArrayToLogical2(diml(1),diml(2)))");
						cmd.push(this.gbl(bl+2) + "errorj = H5A_ReadIntArray(groupIndex,'" + prop.name + "' // c_null_char, IntArrayToLogical2)");
						cmd.push(this.gbl(bl+2) + "error=error+errorj");
						cmd.push(this.gbl(bl+2) + "do idx=1,diml(1)");
						cmd.push(this.gbl(bl+3) + 	"do idy=1,diml(2)");						
						cmd.push(this.gbl(bl+4) + 		"if (IntArrayToLogical2(idx,idy).eq.1) then ");
						cmd.push(this.gbl(bl+5) + 			"this%" + prop.name + "(idx,idy)=.true.");
						cmd.push(this.gbl(bl+4) + 		"else");
						cmd.push(this.gbl(bl+5) + 			"this%" + prop.name + "(idx,idy)=.false.");
						cmd.push(this.gbl(bl+4) + 		"end if");
						cmd.push(this.gbl(bl+3) + 	"end do");
						cmd.push(this.gbl(bl+2) + "end do");						
						cmd.push(this.gbl(bl+2) + "deallocate(IntArrayToLogical2)");
					}					
					else {
						throw "load_hdf5 is not implemented for logical array of more than two dimension.";
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
				    cmd.push(this.gbl(bl+1) + "allocate(diml(" + dimList.length + "))");
					cmd.push(this.gbl(bl+1) + "diml=shape(this%" + prop.name + ")");
					if (dimList.length == 1){
						cmd.push(this.gbl(bl+2) + "allocate(IntArrayToLogical(diml(1)))");
						cmd.push(this.gbl(bl+2) + "errorj = H5A_ReadIntArray(groupIndex,'" + prop.name + "' // c_null_char, IntArrayToLogical)");
						cmd.push(this.gbl(bl+2) + "error=error+errorj");
						cmd.push(this.gbl(bl+2) + "do idx=1,diml(1)");
						cmd.push(this.gbl(bl+3) + 	"if (IntArrayToLogical(idx).eq.1) then ");
						cmd.push(this.gbl(bl+4) + 		"this%" + prop.name + "(idx)=.true.");
						cmd.push(this.gbl(bl+3) + 	"else");
						cmd.push(this.gbl(bl+4) + 		"this%" + prop.name + "(idx)=.false.");
						cmd.push(this.gbl(bl+3) + 	"end if");
						cmd.push(this.gbl(bl+2) + "end do");
						cmd.push(this.gbl(bl+2) + "deallocate(IntArrayToLogical)");
					}
					else if (dimList.length == 2){
						cmd.push(this.gbl(bl+2) + "allocate(IntArrayToLogical2(diml(1),diml(2)))");
						cmd.push(this.gbl(bl+2) + "errorj = H5A_ReadIntArray(groupIndex,'" + prop.name + "' // c_null_char, IntArrayToLogical2)");
						cmd.push(this.gbl(bl+2) + "error=error+errorj");
						cmd.push(this.gbl(bl+2) + "do idx=1,diml(1)");
						cmd.push(this.gbl(bl+3) + 	"do idy=1,diml(2)");						
						cmd.push(this.gbl(bl+4) + 		"if (IntArrayToLogical2(idx,idy).eq.1) then ");
						cmd.push(this.gbl(bl+5) + 			"this%" + prop.name + "(idx,idy)=.true.");
						cmd.push(this.gbl(bl+4) + 		"else");
						cmd.push(this.gbl(bl+5) + 			"this%" + prop.name + "(idx,idy)=.false.");
						cmd.push(this.gbl(bl+4) + 		"end if");
						cmd.push(this.gbl(bl+3) + 	"end do");
						cmd.push(this.gbl(bl+2) + "end do");						
						cmd.push(this.gbl(bl+2) + "deallocate(IntArrayToLogical2)");
					}		
					else {
						throw "load_hdf5 is not implemented for logical array of more than two dimensions.";
					}
					cmd.push(this.gbl(bl+1) + "deallocate(diml)");
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
				cmd.push(this.gbl(bl+2) + 	"! Read the order attribute");
				cmd.push(this.gbl(bl+2) + 	"errorj = H5A_GetOrderSize(subGroupIndex,orderSize)");
				cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+3) + 		"write(*,*) 'Error during loading of "+ this.getTypeName() + ", order not found for array: " + prop.name + "'");
				cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"end if");
				cmd.push(this.gbl(bl+2) + 	"allocate(character(len=orderSize) :: cc_a)");
				cmd.push(this.gbl(bl+2) + 	"errorj = H5A_GetOrder(subGroupIndex, cc_a)");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"orderList=String(cc_a)");
				cmd.push(this.gbl(bl+2) + 	"deallocate(cc_a)");
				cmd.push(this.gbl(bl+2) + 	"call orderList%split(',', listOfNames)");
				cmd.push(this.gbl(bl+2) + 	"! Allocate the array");
				cmd.push(this.gbl(bl+2) + 	"allocate(this%" + prop.name + "(size(listOfNames,1)),stat=sv)");
				cmd.push(this.gbl(bl+2) + 	"if (sv.ne.0) then");
				cmd.push(this.gbl(bl+3) + 		"error=error-1");
				cmd.push(this.gbl(bl+3) + 		"write(*,*) 'Error during saving of "+ this.getTypeName() + ", error when trying to allocate " + prop.name + "'");
				cmd.push(this.gbl(bl+2) + 	"end if");
				cmd.push(this.gbl(bl+2) + 	"! Read each component");
				cmd.push(this.gbl(bl+2) + 	"do idx=1,size(listOfNames)");
				cmd.push(this.gbl(bl+3) + 		"subGroupIndex2 = H5A_OpenEntity(subGroupIndex, listOfNames(idx)%toChars() // c_null_char)");
				cmd.push(this.gbl(bl+3) + 		"if (subGroupIndex2.gt.0) then");
				cmd.push(this.gbl(bl+4) + 			"call this%" + prop.name + "(idx)%load_HDF5_fromGroupIndex(subGroupIndex2,errorj)");			
				cmd.push(this.gbl(bl+4) + 			"error=error+errorj");			
				cmd.push(this.gbl(bl+3) + 		"else");
				cmd.push(this.gbl(bl+4) + 			"error=error-1");
				cmd.push(this.gbl(bl+4) + 			"write(*,*) 'Error during saving of "+ this.getTypeName() + ", group not found: ',listOfNames(idx)%toChars()");
				cmd.push(this.gbl(bl+3) + 		"end if");
				cmd.push(this.gbl(bl+2) + 	"end do");
				cmd.push(this.gbl(bl+1) + "end if");
				cmd.push(this.gbl(bl+1) + "call orderList%destroy()");
			}else{
				cmd.push(this.gbl(bl+1) + "! Open the array group");
				cmd.push(this.gbl(bl+1) + "subGroupIndex = H5A_OpenEntity(groupIndex,'"  + prop.name +  "' // c_null_char)");
				cmd.push(this.gbl(bl+1) + "if (subGroupIndex.gt.0) then");			
				cmd.push(this.gbl(bl+2) + 	"! Read the order attribute");
				cmd.push(this.gbl(bl+2) + 	"errorj = H5A_GetOrderSize(subGroupIndex,orderSize)");
				cmd.push(this.gbl(bl+2) + 	"if (errorj.lt.0) then");
				cmd.push(this.gbl(bl+3) + 		"write(*,*) 'Error during loading of "+ this.getTypeName() + ", order not found for array: " + prop.name + "'");
				cmd.push(this.gbl(bl+3) + 		"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"end if");
				cmd.push(this.gbl(bl+2) + 	"allocate(character(len=orderSize) :: cc_a)");
				cmd.push(this.gbl(bl+2) + 	"errorj = H5A_GetOrder(subGroupIndex, cc_a)");
				cmd.push(this.gbl(bl+2) + 	"error = error + errorj");
				cmd.push(this.gbl(bl+2) + 	"orderList=String(cc_a)");
				cmd.push(this.gbl(bl+2) + 	"deallocate(cc_a)");
				cmd.push(this.gbl(bl+2) + 	"call orderList%split(',', listOfNames)");
				cmd.push(this.gbl(bl+2) + 	"! Read each component");
				cmd.push(this.gbl(bl+2) + 	"do idx=1,size(listOfNames)");
				cmd.push(this.gbl(bl+3) + 		"subGroupIndex2 = H5A_OpenEntity(subGroupIndex, listOfNames(idx)%toChars() // c_null_char)");
				cmd.push(this.gbl(bl+3) + 		"if (subGroupIndex2.gt.0) then");
				cmd.push(this.gbl(bl+4) + 			"call this%" + prop.name + "(idx)%load_HDF5_fromGroupIndex(subGroupIndex2,errorj)");			
				cmd.push(this.gbl(bl+4) + 			"error=error+errorj");			
				cmd.push(this.gbl(bl+3) + 		"else");
				cmd.push(this.gbl(bl+4) + 			"error=error-1");
				cmd.push(this.gbl(bl+4) + 			"write(*,*) 'Error during saving of "+ this.getTypeName() + ", group not found: ',listOfNames(idx)%toChars()");
				cmd.push(this.gbl(bl+3) + 		"end if");
				cmd.push(this.gbl(bl+2) + 	"end do");
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
};
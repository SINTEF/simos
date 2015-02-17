/*----------------------------------------------------------------------------*/
function Assign(){
};
exports.Assign = Assign;
/*----------------------------------------------------------------------------*/
Assign.prototype.assignPropertyValue = function(bl, assign, varName) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	for (a in assign) {
		cmd.push(this.getBlockSpace(bl) + 
		varName + '.' + a +	' = ' + this.stringify(assign[a]) + ';');
	}		
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Assign.prototype.assignPropSinglesValues = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	if (this.isSingle(prop)) {
		var assign = this.getAssignments(prop);
		if (Object.getOwnPropertyNames(assign).length > 0) {
			cmd.push(this.assignPropertyValue(bl, assign, this.objName() + '.' + prop.name));
		}
	}
	else
		throw "only single object can be handled here.";

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/


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
		cmd.push(this.gbl(bl) + 
		varName + '.' + a +	' = ' + this.stringify(assign[a]) );
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
			cmd.push(this.assignPropertyValue(bl, assign, 'self.' + prop.name));
		}
	}
	else
		throw "only single object can be handled here.";

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Assign.prototype.assignPropArraysValues = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	
	var cmd = [];

	if (this.isArray(prop)) {
		var assign = this.getAssignments(prop);
		if (Object.getOwnPropertyNames(assign).length > 0) {
			var loopBlock = this.getLoopBlockForArray(bl, prop);
			cmd.push(loopBlock.cmd);
			cmd.push(this.assignPropertyValue(loopBlock.bl+1, assign, 
				'self.' + this.getPropertyPrivateName(prop) + loopBlock.indList));
		}
	}
	else
		throw "only array object can be handled here.";

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Assign.prototype.assignPropValues = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	if (this.isArray(prop))
		cmd.push(this.assignPropArraysValues(bl, prop));	
	else 
		cmd.push(this.assignPropSinglesValues(bl, prop));	

	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
function Query(){
};
exports.Query = Query;
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
Query.prototype.isSetFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function flag = isSet(' + this.objName() + ', varName)');

	cmd.push(this.getBlockSpace(bl+1) + 
 		'if (~isempty(' + this.objName() + '.(varName)) )');
	cmd.push(this.getBlockSpace(bl+2) + 
			'flag = true;');
	cmd.push(this.getBlockSpace(bl+1) + 
		'else');
	cmd.push(this.getBlockSpace(bl+2) + 
			'flag = false;');
	cmd.push(this.getBlockSpace(bl+1) + 
		'end');
		
	cmd.push(this.getBlockSpace(bl) + 
	'end');
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Query.prototype.isContainedFunc = function(bl) {
	var cmd = [];
	
	cmd.push(this.getBlockSpace(bl) + 
	'function flag = isContained(' + this.objName() + ', varName)');

	cmd.push(this.getBlockSpace(bl+1) + 
		'flag = true;');
	
	cmd.push(this.getBlockSpace(bl+1) + 
	 	'MODEL = ' + this.objName() + '.getPropModel(varName);');
	
	cmd.push(this.getBlockSpace(bl+1) + 
 		'if (isfield(MODEL, \'containment\'))');
	cmd.push(this.getBlockSpace(bl+2) + 
			'if (strcmpi(MODEL.containment, \'false\'))');	
	cmd.push(this.getBlockSpace(bl+3) + 
 				'flag = false;');
	cmd.push(this.getBlockSpace(bl+2) + 
			'end');
	cmd.push(this.getBlockSpace(bl+1) + 
		'end');


	cmd.push(this.getBlockSpace(bl) + 
	'end');
	
	return cmd.join('\n');
};

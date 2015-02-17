/*----------------------------------------------------------------------------*/
function JSONSave(){
};
exports.JSONSave = JSONSave;
/*----------------------------------------------------------------------------*/
JSONSave.prototype.saveJSONFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def saveJSON(self, fileName=None):');

	cmd.push(this.gbl(bl+1) + 	'if fileName==None:');
	cmd.push(this.gbl(bl+2) + 		'fileName=self.name + ".json"');

	cmd.push(this.gbl(bl+1) + 	'f = open(fileName, "w")');
	cmd.push(this.gbl(bl+1) + 	'f.write(self.jsonRepr())');
	cmd.push(this.gbl(bl+1) + 	'f.close()');
	
	cmd.push(this.gbl(bl+1) + 	'pass');
	
	cmd.push(this.gbl(bl+1));
	
	return cmd.join('\n');
};

/*----------------------------------------------------------------------------*/
function DMTSave(){
};
exports.DMTSave = DMTSave;
/*----------------------------------------------------------------------------*/
DMTSave.prototype.saveDMTFunc = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'def saveDMT(self, fileName=None, bpDataSource=None):');

	cmd.push(this.gbl(bl+1) + 	'if fileName==None:');
	cmd.push(this.gbl(bl+2) + 		'fileName=self.name + ".json"');

	cmd.push(this.gbl(bl+1) + 	'f = open(fileName, "w")');
	cmd.push(this.gbl(bl+1) + 	'f.write(self.dmtRepr(bpDataSource=bpDataSource))');
	cmd.push(this.gbl(bl+1) + 	'f.close()');
	
	cmd.push(this.gbl(bl+1) + 	'pass');
	
	cmd.push(this.gbl(bl+1));
	
	return cmd.join('\n');
};

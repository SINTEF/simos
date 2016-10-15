var LatdocBase = require('./LatdocBase.js').LatdocBase;

/*----------------------------------------------------------------------------*/
function LatdocGenerator(model){
	this.constructor(model);
};
/*----------------------------------------------------------------------------*/
LatdocGenerator.prototype = Object.create(LatdocBase.prototype);
/*----------------------------------------------------------------------------*/
LatdocGenerator.prototype.constructor = function(model) {
	LatdocBase.prototype.constructor(model);
};
/*----------------------------------------------------------------------------*/
LatdocGenerator.prototype.toString = function() {
	return "LatdocGenerator";
};
/*----------------------------------------------------------------------------*/
LatdocGenerator.prototype.generate = function(model) {
	if (model != undefined)
		this.setModel(model);
	
	var entity =  this;
	
	var cmd = [];
	

	cmd.push('% This an autogenerated file using simosjs.generator'); 
	cmd.push('%    Please do not edit');
	cmd.push('%    Babak Ommani, Offshore Hydrodynamic, MARINTEK """');
	cmd.push('% ');
	cmd.push('% ' + entity.getDescription());
	cmd.push('% Generated with ' + entity.getClassName() );
	cmd.push('');
	cmd.push('%***************************************************************************');
//	cmd.push('\\clearpage');
//	cmd.push('\\chapter{' + entity.getClassName() + '}');
//	cmd.push('\\label{chap:' + entity.type + '}');
//	cmd.push('%***************************************************************************');
	cmd.push('%------------------------------------------------------------------------------');
	cmd.push(entity.getTypeDescription());
	cmd.push('%------------------------------------------------------------------------------');
	cmd.push('%------------------------------------------------------------------------------');
	cmd.push(entity.getAtomicSingleProperties());
	cmd.push('%------------------------------------------------------------------------------');	
	cmd.push('%------------------------------------------------------------------------------');
	cmd.push(entity.getAtomicArrayProperties());
	cmd.push('%------------------------------------------------------------------------------');
	cmd.push('%------------------------------------------------------------------------------');
	cmd.push(entity.getComplexSingleProperties());
	cmd.push('%------------------------------------------------------------------------------');	
	cmd.push('%------------------------------------------------------------------------------');
	cmd.push(entity.getComplexArrayProperties());
	cmd.push('%------------------------------------------------------------------------------');	
	cmd.push('%------------------------------------------------------------------------------');
	cmd.push(entity.getPythonMethods());
	cmd.push('%------------------------------------------------------------------------------');		
	
//	cmd.push('%******************************************************************************');	
//	cmd.push('%end of Chapter');      
//	cmd.push('%******************************************************************************');
	
	return cmd.join('\n'); 
};

/*----------------------------------------------------------------------------*/
//module.exports = function(model) { return new LatdocBase(model); };
exports.generator = new LatdocGenerator();
var njs = require('../njs')();

var ModelParser = require('./ModelParser.js').ModelParser;

/*----------------------------------------------------------------------------*/

function CommonLangBase(model){
	this.constructor(model);
};
exports.CommonLangBase = CommonLangBase;
/*----------------------------------------------------------------------------*/

CommonLangBase.prototype = Object.create(ModelParser.prototype);
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.constructor = function(model) {
	ModelParser.prototype.constructor(model);	
	
	this.targetType = {
	    "float"		:"Float",
	    "double"	:"Double",
	    "short"		:"Short",
	    "integer"	:"Int",
	    "boolean"	:"Bool",
	    "string"	:"String",
	    "char"		:"Char",
	    "tiny"		:"Tiny"
	};
	
};


/*----------------------------------------------------------------------------*/

CommonLangBase.prototype.getTargetType = function(){
	if (typeof(this.targetType) === 'undefined') {
		throw ("Illigal targetType", this.targetType);
	}
	else {
		return this.targetType;
	}
};

/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.setTargetType = function(targetType){
	this.targetType = targetType;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.firstToUpper = function(name) {
    return( name[0].toUpperCase() + name.substr(1) );
};
/*----------------------------------------------------------------------------*/

CommonLangBase.prototype.firstToLower = function(name) {
    return( name[0].toLowerCase() + name.substr(1) );
};

/*----------------------------------------------------------------------------*/

CommonLangBase.prototype.getClassNameFromType = function(typeName) {
	
	return this.parsePackagedTypeStr(typeName).name;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getClassPathFromType = function(typeName) {
	//var parsed = this.parsePackagedTypeStr(typeName);
	//return (parsed.path + this.packagePathSep + parsed.name);
	throw ("getClassPathFromType must be implemented for each language.");
};


/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.changeType = function(type) {
    return this.getTargetType()[type];
};
//exports.CommonLangBase.prototype.changeType = CommonLangBase.prototype.changeType;

/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getCodeSeparator = function(bl) {
	var bs = this.getBlockSpace(bl);
	
	if (bs.length == 0) {
		return this.sep1;
	}
	else {
		return (bs + this.sep2.substr(0, this.sep2.length -1 - (bs.length - this.blockSpace)));
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.propSetGet = function(bl) {
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];   

	
	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		cmd.push(this.getCodeSeparator(bl));
		
		if(!(prop.get == 'false')){
			cmd.push( this.propGet(prop, bl) );
		}
		if(!(prop.set == 'false')){
			cmd.push(this.propSet(prop,bl));	
		}
	}
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.arrayUpdateSizeFuncName = function(prop) {
	return this.makePrivate(prop.name + 'UpdateSize');
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.arraysUpdateSize = function(bl) {
	
	var properties = this.getProperties();
	var propNum = properties.length;
	
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	for(var i = 0; i < propNum; i++) {
		var prop = properties[i];
		if(this.isArray(prop)){
			if (this.getDimensionList(prop).indexOf('*') == -1) {
				cmd.push(this.getCodeSeparator(bl));
				cmd.push(this.arrayUpdateSize(prop,bl));
			}
		}
	}	
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getPropertyNameInClass = function(prop) {
	
	if (prop.set == 'false' && prop.get == 'false' ){
		return prop.name;
	}
	else {
		return this.makePrivate(prop.name);
		
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.modelDesAtt = function(prop) {
	if (prop == undefined) {
		return 'MODEL';
	}
	else {
		return 'MODEL' + prop.name;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.depluralizeName = function(name) {
	if (name[name.length-1] == 's'){
		return name.slice(0, name.length-1);
	}
	else {
		return prop.name;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.factoryAppendFuncName = function(prop) {
	if (this.isArray(prop))
		return 'append' + this.depluralize(this.firstToUpper(prop.name));
	else
		throw prop.name + " prop is not an array.";
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.factoryCreateFuncName = function(prop) {
	if (this.isSingle(prop))
		return 'create' + this.firstToUpper(prop.name);
	else
		throw prop.name + " prop is not a single.";
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.factoryReNewFuncName = function(prop) {
	if (this.isSingle(prop))
		return 'renew' + this.firstToUpper(prop.name);
	else
		throw prop.name + " prop is not a single.";
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.factoryMakeFuncName = function(prop) {
	if (this.isArray(prop))
		return 'makea' + this.depluralize(this.firstToUpper(prop.name));
	if (this.isSingle(prop))
		return 'makea' + this.firstToUpper(prop.name);

};

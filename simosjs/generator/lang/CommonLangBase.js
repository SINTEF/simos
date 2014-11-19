var njs = require('../../njs')();

function CommonLangBase(model){
	this.constructor(model);
};
exports.CommonLangBase = CommonLangBase;
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.constructor = function(model) {
	
	this.model = undefined;
	
	this.setModel(model);
	
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
	
	this.dimensionType = "integer";
	
	this.packageSep = ':';
	this.versionSep = '_';
	
	this.packagePathSep = '.';
	
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.numericTypes = function(){
	return ["float", "double", "short", "integer", "tiny"];
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.stringTypes = function(){
	return ["string", "char"];
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.logicalTypes = function(){
	return ["boolean"];
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.objectToText = function(obj, text, block){
	t = text + '{\n';
	for (var k in obj){
		t = t + block + k + ': ';
		if (typeof(obj[k]) == 'object') {
			t = this.objectToText(obj[k], t, block+'   ');
		}
		else{
			t = t + obj[k] + "\n";
		}
	}
	t = t + block +  '}\n';
	return t;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.show = function(obj){
	njs.print(this.objectToText(obj, '', '   '));
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getModel = function(){
	if (typeof(this.model) === 'undefined') {
		throw ("Illigal model", this.model);
	}
	else {
		return this.model;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getModelWithOutPtoperties = function(){
	var model = this.getModel();
	var nmodel = {};
	
	for (a in model) {
		if (a != "properties"){
			nmodel[a] = model[a];
		} 
	}
	
	return nmodel;
};
/*----------------------------------------------------------------------------*/

CommonLangBase.prototype.setModel = function(model){
	this.model = model;
};
//exports.CommonLangBase.prototype.setModel = CommonLangBase.prototype.setModel;
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
CommonLangBase.prototype.isAtomicType = function(typeName) {
	if (this.getTargetType()[typeName] == undefined){
		return false;
	}
	else {
		return true;
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

CommonLangBase.prototype.getClassName = function() {
	var name = this.getName();
    return( this.firstToUpper(name) );
};
/*----------------------------------------------------------------------------*/

CommonLangBase.prototype.getClassNameFromType = function(typeName) {
	
	return this.parseFullTypeName(typeName).name;
};
CommonLangBase.prototype.getClassPathFromType = function(typeName) {
	var parsed = this.parseFullTypeName(typeName);
	return (parsed.path + this.packagePathSep + parsed.name);
};
/*----------------------------------------------------------------------------*/

CommonLangBase.prototype.addVersion = function(typeName, version) {

	if (version == undefined) {
		return typeName;
	}
	else {
		return typeName + this.versionSep + version;
	}
};
/*----------------------------------------------------------------------------*/

CommonLangBase.prototype.getType = function() {
    
	if (this.getModel().type==undefined){
		return( "T" + this.getClassName(this.getModel()) );
	}
	else {
		return this.getModel().type;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getNestedTypes = function() {
    
	var types = [];
	
	var props = this.getProperties();
    for (var i = 0; i<props.length; i++) {
    	if (!(this.isAtomicType(props[i].type))) {
    		//var newEntityName = this.addVersion(props[i].type, props[i].version);
    		var newEntityName = props[i].type;
    		if (types.indexOf(newEntityName) < 0) {
    			types.push(newEntityName);
    		}
    	}
    }
    
    return types;
};
/*----------------------------------------------------------------------------*/

CommonLangBase.prototype.getDescription = function(model) {
	var model = this.getModel();
    return( (model.description !== undefined ? model.description : '' ) );
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getName = function() {
    return this.getModel().name;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getVersion = function(p, model) {
	if (model == undefined) {
		model = this.getModel();
	}
	
	if (p == undefined)
		return JSON.stringify(model.__versions__);
	else
		return model.__versions__[p];
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getPackagesVersions = function(packages, model) {
	if (model == undefined) {
		model = this.getModel();
	}
	
	var versions = [];
	
	for (var j = 0, len = packages.length; j < len; j++){
		versions.push(this.getVersion(packages[j], model));
	}
	
	return versions;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getPackages = function() {
	var packages = [];
	for (var key in this.getModel().__versions__) {
		packages.push(key);
	} 
	return packages;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getAttrs = function() {
	var model = this.getModel();
	var attrs = [];
	
	for (k in model){
		if (k!='properties') {
			attrs.push(k);
		}
	}
	
    return attrs;

};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getStorableAttrs = function() {
	//attrs = ['name', 'description', 'type', 'dim', 'version',
	//         'simaObjectName', 'simaInterfaceVersion', 'simaAttr'];
	
	attrs = ['name', 'type', 'version', 'packageName', 'packageVersion'];
	
    return attrs;

};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isStorableAttr = function(attr) {
	if (this.getStorableAttrs().indexOf(attr) != -1) {
		return true;
	}
	else { 
		return false;
	}

};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isEmpty = function(obj) {
	if (obj == null) return true;
	if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    
    if (Object.getOwnPropertyNames(obj).length > 0) return false;

    return false;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.hasAssignments = function(prop) {
	return !(this.isEmpty(this.getAssignments));
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getAssignments = function(prop) {
	var assign = {};
    if (this.isAtomicType(prop.type)) {
    	return assign;
    }
    else {
    	if (prop.__assign != undefined) { 
    		assign = prop.__assign; 
    	}
    	
    	/* add default assignments 
    	 * name, description, unit, value, valid*/
    	
    	if (!(this.isArray(prop))) {
    		/*elements of array must have different names */
    		assign.name = prop.name;
    	}
    	if ((prop.description != undefined) && !(this.isArray(prop))) {
    		assign.description = prop.description;
    	}
    	if (prop.unit != undefined) {
    		assign.unit = prop.unit;
    	}
    	if ((prop.value != undefined) && !(this.isArray(prop))) {
    		assign.value = prop.value;
    	}
    	if ((prop.valid != undefined) && !(this.isArray(prop))) {
    		assign.valid = prop.valid;
    	}
    	
    	return assign;
    }
    
    
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.changeType = function(type) {
    return this.getTargetType()[type];
};
//exports.CommonLangBase.prototype.changeType = CommonLangBase.prototype.changeType;
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getDimensionType = function() {
    return this.dimensionType;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getProperties = function() {
    return this.getModel().properties;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getProperty = function(name, model) {
	if (model == undefined) {
		model = this.getModel();
	}

	if (this.hasProperty(name, model)){
		return model.properties[this.findProperty(name, model)];
	}
	else
		throw "property " + name + " does not exist.";
    
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getPublicProperties = function() {
	var propList = new Array();
	var props = this.getProperties();
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if (prop.access == undefined || prop.access == 'public') {
				propList.push(prop);
		} 
	}
	return propList;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getPrivateProperties = function() {
	var propList = new Array();
	var props = this.getProperties();
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if (prop.access == 'private') {
				propList.push(prop);
		} 
	}
	return propList;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getProtectedProperties = function() {
	var propList = new Array();
	var props = this.getProperties();
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if (prop.access == 'protected') {
				propList.push(prop);
		} 
	}
	return propList;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getPropertyValue = function(prop) {
	return prop.value;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getPropertyAttrs = function(prop) {
	var propKeys = [];
	
	for (k in prop){
		if (k!='value') {
			propKeys.push(k);
		}
	}
	
    return propKeys;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getPropertyStorableAttrs = function(prop) {
	var propKeys = [];
	
	for (k in prop){
		if (this.isStorableAttr(k)) {
			propKeys.push(k);
		}
	}
	
    return propKeys;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getDimensionList = function(prop) {
	if (this.isArray(prop)) {
		return prop.dim.split(/[\s,]+/);
	}
	else {
		throw ('Property is not an array.', prop);
	}
};
/*----------------------------------------------------------------------------*/
/* Functions to handle properties reporting and sorting based on type  */
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isArray = function(prop) {
	if (prop.dim == undefined ) {
		return false;
	}
	else {
		return true;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isSingle = function(attr) {
	return (!this.isArray(attr));
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isAtomic = function(prop) {
	if (prop.type == undefined) {
		throw "prop does nopt have a type. CommonLangBase.prototype.isAtomic";
	}
	if (this.isAtomicType(prop.type)){
		return true;
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isNumeric = function(prop) {
	if (prop.type == undefined) {
		throw "prop does not have a type. CommonLangBase.prototype.isNumeric";
	}
	if (this.numericTypes().indexOf(prop.type) >= 0){
		return true;
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isString = function(prop) {
	if (prop.type == undefined) {
		throw "prop does not have a type. CommonLangBase.prototype.isString";
	}
	if (this.stringTypes().indexOf(prop.type) >= 0){
		return true;
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.findProperty = function(name, model) {
	if (model == undefined) {
		model = this.model;
	}
	
	for (var i = 0, len = model.properties.length; i< len ; i++){
		if (model.properties[i].name == name)
			return i;
	}
	return -1;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.hasProperty = function(name, model) {
	if (model == undefined) {
		model = this.model;
	}
	
	var ind = this.findProperty(name, model);
	if (ind == -1){
		return false;
	}
	else {
		return true;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getPropDependencies = function(prop) {
	return prop.__dependencies;
};

/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.hasDependencies = function(prop) {
	var dept = this.getPropDependencies(prop);
	return !(this.isEmpty(dept));
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.hasDependents = function(prop) {
	var dept = this.getChildProps(prop);
	return !(this.isEmpty(dept));
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getDependentChildFor = function(child, prop) {
	var dependentProps = [];
	
	var dept = this.getPropDependencies(child);
	if (dept != undefined) {
		for (d in dept) {
			if (dept[d] == prop.name) {
				dependentProps.push(d);
			}
		}
	}

	return dependentProps;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getChildProps = function(prop) {
	/* for each property, find a list of dependent properties*/
	
	var props = this.getProperties();
	var childProps = [];
	
	for (var i = 0; i<props.length; i++) {
		var dept = this.getPropDependencies(props[i]);
		if (dept != undefined) {
			for (d in dept) {
				if (dept[d] == prop.name) {
					childProps.push(props[i]);
				}
			}
		}
	}
	
	return childProps;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getParentProps = function(childProp) {
	/* for each property, find a list of parent properties*/
	
	var props = this.getProperties();
	var parentProps = [];
	
	var dept = this.getPropDependencies(childProp);
	if (this.isEmpty(dept))
		return parentProps;
		
	for (var i = 0; i<props.length; i++) {
		for (d in dept) {
			if (dept[d] == props[i].name) {
				parentProps.push(props[i]);
			}
		}
	}
	
	return parentProps;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isParentProp = function(prop) {
	var props = this.getProperties();
	
	for (var i = 0; i<props.length; i++) {
		var dept = this.getPropDependencies(props[i]);
		for (d in dept) {
			if (dept[d] == prop.name) {
				return true;
			}
		}
	}
	
	return false;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isDimension = function(attr) {
	/* find out if attr is a dimension of any other properties,*/
	if (attr.type == this.getDimensionType()){
		//var propList = new Array();
		for (var i = 0; i<this.getProperties().length; i++){
			var prop = this.getProperties()[i];
			if (this.isArray(prop)) {
				/* looking at an array */
				if (this.getDimensionList(prop).indexOf(attr.name) != -1) {
					/*attr is a dimension in prop*/
					return true;
				}
			} 
		}
	}
	return false;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getNonAtomics = function(props) {
	var propList = [];
	
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if ( !(this.isAtomic(prop)) ) {
			propList.push(prop);
		} 
	}
	
	return propList;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getAtomics = function(props) {
	var propList = [];
	
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if ( this.isAtomic(prop) ) {
			propList.push(prop);
		} 
	}
	
	return propList;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getArrays = function(props) {
	var propList = [];
	
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if (this.isArray(prop)) {
			propList.push(prop);
		} 
	}
	
	return propList;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getSingles = function(props) {
	var propList = [];
	
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if ( !(this.isArray(prop)) ) {
			propList.push(prop);
		} 
	}
	
	return propList;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.packagePath = function(pnames,pvers) {
	/*two lists 
	 * pnames: name of packages in order
	 * pvers: vertion of packages in order*/
	
	var ppath = [];
	for (var i = 0, len = pnames.length; i< len; i++) {
		var pnv = '';
		if (pvers[i] != '')
			pnv = this.addVersion(pnames[i], pvers[i]);
		else
			pnv = pnames[i];
		
		ppath.push(pnv);
	}
	return ppath.join(this.packagePathSep);
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.typePath = function(model) {
	if (model == undefined){
		model = this.getModel();
	}
	
	var packages = this.splitPackages(model["package"]);
	var versions = this.getPackagesVersions(packages, model);
	var typeName = model.name;
	
	return this.makeTypePath(packages,versions,typeName);
	
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.fullTypeName = function(model) {
	if (model == undefined){
		model = this.getModel();
	}
	
	var packages = model["package"];
	var typeName = model.name;
	
	return (packages + this.packageSep + typeName);
	
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.makeTypePath = function(pnames,pvers, typeName) {
	/*two lists 
	 * pnames: name of packages in order
	 * pvers: vertion of packages in order*/
	
	return this.packagePath(pnames, pvers) + this.packagePathSep + typeName;
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.splitPackages = function(packages) {
	return packages.split(this.packageSep);
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.parseFullTypeName = function(type, model) {
	/* get a complex type package path,
	 * e.g. model:hydro:wamit:rao
	 * and extract path and versioning data*/
	if (model == undefined){
		model = this.getModel();
	}
	
	var packages = this.splitPackages(type);
	/* take out the typename */
	var typeName = packages[packages.length-1];
	packages = packages.slice(0,packages.length-1);
	var versions = this.getPackagesVersions(packages,model);
				
	
	return({	"packages": packages,
				"versions": versions,
				"name": typeName,
				"path": this.makeTypePath(packages, versions, typeName)});


	
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.superTypes = function(model) {
	if (model == undefined){
		model = this.getModel();
	}
	
	var exts = [];
	
	if (model['extends'] instanceof Array) {
		
		var types = model['extends'];
		for (var i = 0, len = types.length; i< len; i++){
			exts.push(this.parseFullTypeName(types[i], model));

		}
	}

	
	return exts;
	
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isDerived = function(model) {
	if (model == undefined){
		model = this.getModel();
	}

	
	var exts = this.superTypes(model);
	
	if (exts.length == 0){
		return false;
	}
	else {
		return true;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isContained = function(prop) {
	if ((prop.containment == undefined) ||
		(prop.containment == 'true')){
		return true;
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isLimited = function(prop) {
	return !(this.isEmpty(prop.from));
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isReferenced = function(prop) {
	return !this.isContained(prop);
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.isOptional = function(prop) {
	if ((prop.optional == undefined) ||
		(prop.optional == 'false')){
		return false;
	}
	else {
		return true;
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getAtomicSingleProperties = function() {
	
	return this.getAtomics(this.getSingles(this.getProperties()));
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getNonAtomicSingleProperties = function() {
	
	return this.getNonAtomics(this.getSingles(this.getProperties()));
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getAtomicArrayProperties = function() {
	
	return this.getAtomics(this.getArrays(this.getProperties()));
	
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getNonAtomicArrayProperties = function() {
	
	return this.getNonAtomics(this.getArrays(this.getProperties()));
	
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.getPropertiesWithDimension = function(attr) {
	/* returns a list of properties with dimension in attr*/
	
	if (this.isDimension(attr)) {
		var propList = new Array();
		for (var i = 0; i<this.getProperties().length; i++){
			var prop = this.getProperties()[i];
			if (this.isArray(prop)) {
				/* looking at an array */
				if (this.getDimensionList(prop).indexOf(attr.name) != -1) {
					/*attr is a dimension in prop*/
					propList.push(prop);
				}
			} 
		}
		return propList;
	}
	else {
		throw ('Illigal dimension',attr);	
	}
};

/*----------------------------------------------------------------------------*/
/* Functions to check the entries in a collection or entity */
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.validate = function() {
	
	this.validateMainAttributes();
	
	var props = this.getProperties();
	this.validatePropertyList(props);
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.validatePropertyList = function(props) {
	/* check if properties are correct in connection to each other,
	 * then check each property*/
	
	for (var i= 0; i<props.length; i++){
		var prop = props[i];
		this.validateProperty(prop);
	}
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.validateProperty = function(prop) {
	/*check if one property is all-right*/
};
/*----------------------------------------------------------------------------*/
CommonLangBase.prototype.validateMainAttributes = function() {
	/*check if main attributes are all right*/
};
/*----------------------------------------------------------------------------*/
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
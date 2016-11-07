var njs = require('../njs')();

function ModelParser(model){
	this.constructor(model);
};
exports.ModelParser = ModelParser;
/*----------------------------------------------------------------------------*/
ModelParser.prototype.constructor = function(model) {
	
	this.model = undefined;
	
	this.setModel(model);
	
	
	this.dimensionType = "integer";
	
	this.packageSep = ':';
	this.versionSep = '_';
	
	this.packagedTypePathSep = '.';
	
	this.packagePath = '';
	
	this.versionFlag = '__versions__';
	this.packageFlag = '__package__';
	
	this.modelExt = 'json';
	
	this.numericTypeList = ["float", "real", "double", "short", "integer", "tiny", "complex"];
	this.stringTypeList = ["string", "char"];
	this.logicalTypeList = ["boolean"];
};
/******************************************************************************/
/* Type Functions */
/*----------------------------------------------------------------------------*/
ModelParser.prototype.numericTypes = function(){
	return this.numericTypeList;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.stringTypes = function(){
	return this.stringTypeList;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.logicalTypes = function(){
	return this.logicalTypeList;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.allAtomicTypes = function(){
	return this.numericTypes().concat(this.stringTypes().concat(this.logicalTypes()));
};
/******************************************************************************/
/*get and set functions */
/*----------------------------------------------------------------------------*/
ModelParser.prototype.str = function(){
	return JSON.stringify(this, null, '\t');
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getDimensionType = function() {
    return this.dimensionType;
};
/*----------------------------------------------------------------------------*/
/* Model */
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getModel = function(){
	if (typeof(this.model) === 'undefined') {
		throw ("model is not defined : " + this.model);
	}
	else {
		return this.model;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getModelWithOutPtoperties = function(){
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
ModelParser.prototype.setModel = function(model){
	this.model = model;
};
/*----------------------------------------------------------------------------*/
/* name */
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getName = function(model) {
	if (model == undefined) 
		return this.getModel().name;
	else
		return this.model.name;
};

ModelParser.prototype.setName = function(name) {
    this.getModel().name = name;
};

ModelParser.prototype.getNameFromType = function(type) {
	//Assuming type and name are the same. 
	//Can be overloaded by language.
	return type
};

ModelParser.prototype.getModelNameFromPackagedTypeStr = function(modelID) {
	var parts = modelID.split(this.packageSep);
	return parts[parts.length-1];
	
};

ModelParser.prototype.getOutModelFileNameFromPackagedTypeStr = function(modelID) {
	return this.getModelNameFromPackagedTypeStr(modelID) + '(gen).' + this.modelExt;
	
};


/*----------------------------------------------------------------------------*/
/* description */
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getDescription = function() {
	var model = this.getModel();
    return( (model.description !== undefined ? model.description : '' ) );
};

ModelParser.prototype.setDescription = function(desc) {
	var model = this.getModel();
    model.description = desc;
};

/*----------------------------------------------------------------------------*/
/* type */
/*----------------------------------------------------------------------------*/

ModelParser.prototype.getType = function(model) {
    
	if (model == undefined) {
		if (this.getModel().type==undefined)
			return(this.getName() );
		else 
			return this.getModel().type;
	}
	else{
		if (model.type==undefined)
			return model.name;
		else
			return model.type;		
	}
};

ModelParser.prototype.setType = function(t) {
	this.getModel().type = t;
};

ModelParser.prototype.isAtomicType = function(typeName) {
	if (this.allAtomicTypes().indexOf(typeName) == -1){
		return false;
	}
	else {
		return true;
	}
};
/*----------------------------------------------------------------------------*/
/* version */
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getVersion = function() {
	return this.getVersions();
};
ModelParser.prototype.getVersions = function() {
	var model = this.getModel();
	return model.__versions__;
};

ModelParser.prototype.setVersions = function(ver) {
	var model = this.getModel();
	model.__versions__ = ver;
};

ModelParser.prototype.getPackageVersion = function(p) {
	var model = this.getModel();
	
	if (p == undefined)
		throw ('package must be defined.');
	else {
		var ver = model.__versions__[p];
		if (ver == undefined)
			return '';
		else
			return ver;
	}
};

ModelParser.prototype.getPackagesVersions = function(packages) {
	
	var versions = [];
	
	for (var j = 0, len = packages.length; j < len; j++){
		versions.push(this.getPackageVersion(packages[j]));
	}
	
	return versions;
};


ModelParser.prototype.addVersion = function(typeName, version) {

	if ((version == undefined) || (version == '')) {
		return typeName;
	}
	else {
		return typeName + this.versionSep + version.replace(/ /g,'');
	}
};

/*----------------------------------------------------------------------------*/
/* packages */
/*----------------------------------------------------------------------------*/

/* The model package and type */
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getPackageStr = function() {
	model = this.getModel();
	
	return model["package"];
};
ModelParser.prototype.getPackages = function() {	
	return this.splitPackageStr(this.getPackageStr());
};

ModelParser.prototype.setPackages = function(packages) {

	model = this.getModel();
	
	model["package"] =  packages.join(this.packageSep);
	
	for (var p = 0, plen = model.properties.length; p < plen; p++){
		var prop = model.properties[p];
		if (!this.isAtomic(prop)) {
			var packages = this.splitPackageStr(prop.type);
			if (packages.length == 1) {
				prop.type = model["package"] + this.packageSep + prop.type;
			}
		}
	}
	

	if (this.isDerived()) {
		var exts = model["extends"];
		for (var p = 0, plen = exts.length; p < plen; p++){
			var ext = model["extends"][p];
			var packages = this.splitPackageStr(ext);
			
			if (packages.length == 1) {
				model["extends"][p] = model["package"] + this.packageSep + ext;
			}
		}
	}
	
	var packages = this.splitPackageStr(this.getType(model));
	if (packages.length == 1) {
		model.type = model["package"] + this.packageSep + this.getType(model);
	}


};

ModelParser.prototype.updateFromVersionedPackagedTypeStr = function(str, localVersion) {
	
	var type = this.parseVersionedPackagedTypeStr(str);
	this.setPackages(type.packages);

	model[this.versionFlag] =  localVersion;
	/* adding current package and versions */
	for (var i=0, len = type.packages.length; i< len; i++){
		model[this.versionFlag][type.packages[i]] = type.versions[i];
	}

};

ModelParser.prototype.getVersionedPackages = function() {
	/*marmo_r1.cfd_r1.moonpool3d_r1.Domain*/
	
	var packages = this.getPackages();
	var versions = this.getPackagesVersions(packages);
	
	return (this.makeVersionedPackages(packages,versions));
	
};
ModelParser.prototype.getVersionedRootPackageStr = function() {
	/*marmo_r1.cfd_r1.moonpool3d_r1.Domain*/
	
	var rootPack = this.getPackages()[0];
	var version = this.getPackageVersion(rootPack);
	
	return (this.addVersion(rootPack,version));
	
};

ModelParser.prototype.getRootPackageFromPackageStr = function(packageStr) {
	/*marmo_r1.cfd_r1.moonpool3d_r1.Domain*/
	return this.splitPackageStr(packageStr)[0];
};


ModelParser.prototype.getVersionedPackagesStr = function() {
			
	return (this.getVersionedPackages().join(this.packageSep));
	
};

ModelParser.prototype.getVersionedPackagedTypeStr = function() {
	/*marmo_r1.cfd_r1.moonpool3d_r1.Domain*/
	model = this.getModel();
	
	var packages = this.getPackages();
	var versions = this.getPackagesVersions(packages);
	var typeName = this.getName();
	
	return (this.getVersionedPackagesStr() + this.packageSep + typeName);
	
};

ModelParser.prototype.getPackagedTypeStr = function() {
			
	return (this.getPackageStr() + this.packageSep + this.getName());
	
};

/* Referenced and used package and types */
/*----------------------------------------------------------------------------*/

ModelParser.prototype.getRefPackages = function() {
	var packages = [];
	for (var key in this.getModel().__versions__) {
		packages.push(key);
	} 
	return packages;
};


/*----------------------------------------------------------------------------*/
/* main attributes */
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getAttrs = function() {
	var model = this.getModel();
	var attrs = [];
	
	for (k in model){
		if (k!='properties') {
			attrs.push(k);
		}
	}
	
    return attrs;

};

ModelParser.prototype.getStorableAttrs = function() {
	//attrs = ['name', 'description', 'type', 'dim', 'version',
	//         'simaObjectName', 'simaInterfaceVersion', 'simaAttr'];
	
	attrs = ['name', 'type', 'version', 'packageName', 'packageVersion'];
	
    return attrs;

};
/*----------------------------------------------------------------------------*/
/* properties */
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getProperties = function() {
    return this.getModel().properties;

};
ModelParser.prototype.getProperty = function(name) {
	model = this.getModel();

	if (this.hasProperty(name, model)){
		return model.properties[this.findProperty(name, model)];
	}
	else
		throw "property " + name + " does not exist.";
    
};

ModelParser.prototype.getPublicProperties = function() {
	var propList = new Array();
	var props = this.getProperties();
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if (this.isPublic(prop)) {
				propList.push(prop);
		} 
	}
	return propList;
};

ModelParser.prototype.getPrivateProperties = function() {
	var propList = new Array();
	var props = this.getProperties();
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if (this.isPrivate(prop)) {
			propList.push(prop);
	}  
	}
	return propList;
};

ModelParser.prototype.getProtectedProperties = function() {
	var propList = new Array();
	var props = this.getProperties();
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if (this.isProtected(prop)) {
			propList.push(prop);
	} 
	}
	return propList;
};

ModelParser.prototype.getPropertyValue = function(prop) {
	return prop.value;
};

ModelParser.prototype.getPropertyAttrs = function(prop) {
	var propKeys = [];
	
	for (k in prop){
		if (k!='value') {
			propKeys.push(k);
		}
	}
	
    return propKeys;
};

ModelParser.prototype.getPropertyStorableAttrs = function(prop) {
	var propKeys = [];
	
	for (k in prop){
		if (this.isStorableAttr(k)) {
			propKeys.push(k);
		}
	}
	
    return propKeys;
};


/*----------------------------------------------------------------------------*/
ModelParser.prototype.getAtomicSingleProperties = function() {
	
	return this.getAtomics(this.getSingles(this.getProperties()));
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getNonAtomicSingleProperties = function() {
	
	return this.getNonAtomics(this.getSingles(this.getProperties()));
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getAtomicArrayProperties = function() {
	
	return this.getAtomics(this.getArrays(this.getProperties()));
	
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getNonAtomicArrayProperties = function() {
	
	return this.getNonAtomics(this.getArrays(this.getProperties()));
	
};
/*----------------------------------------------------------------------------*/
/* get grouped items */
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getGroups = function() {
	var propList = new Array();
	var props = this.getProperties();
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if (this.isGroup(prop)) {
				propList.push(prop);
		} 
	}
	return propList;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getGroupedProps = function(groupName) {
	var propList = new Array();
	var props = this.getProperties();
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		if (this.isGroupedIn(prop,groupName)) {
				propList.push(prop);
		} 
	}
	return propList;
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getDimensionList = function(prop) {
	if (this.isArray(prop)) {
		return prop.dim.split(/[\s,]+/);
	}
	else {
		throw ('Property is not an array.', prop);
	}
};

/*----------------------------------------------------------------------------*/
ModelParser.prototype.getNestedTypes = function() {
    
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


/*----------------------------------------------------------------------------*/
ModelParser.prototype.isStorableAttr = function(attr) {
	if (this.getStorableAttrs().indexOf(attr) != -1) {
		return true;
	}
	else { 
		return false;
	}

};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isEmpty = function(obj) {
	if (obj == null) return true;
	if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    
    if (Object.getOwnPropertyNames(obj).length > 0) return false;

    return false;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.hasAssignments = function(prop) {
	return !(this.isEmpty(this.getAssignments));
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getAssignments = function(prop) {
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
    	if ((prop.description != undefined) ) {
    		assign.description = prop.description;
    	}
    	if (prop.unit != undefined) {
    		assign.unit = prop.unit;
    	}
    	if (prop.value != undefined) {
    		assign.value = prop.value;
    	}
    	
    	return assign;
    }
    
    
};

/*----------------------------------------------------------------------------*/


/*----------------------------------------------------------------------------*/
/* Functions to handle properties reporting and sorting based on type  */
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isArray = function(prop) {
	if (prop.dim == undefined ) {
		return false;
	}
	else {
		return true;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isFixedDimArray = function(prop) {
	if (this.isArray(prop) ) {
        if (this.getDimensionList(prop).indexOf('*') == -1) {
            return true;
        }
        else {
		    return false;
        }
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isVariableDimArray = function(prop) {
	if (this.isArray(prop) ) {
        return (!(this.isFixedDimArray(prop)));
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isSingle = function(prop) {
	return (!this.isArray(prop));
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isAtomic = function(prop) {
	if (prop.type == undefined) {
		throw "prop does nopt have a type. ModelParser.prototype.isAtomic";
	}
	if (this.isAtomicType(prop.type)){
		return true;
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isNumeric = function(prop) {
	if (prop.type == undefined) {
		throw "prop does not have a type. ModelParser.prototype.isNumeric";
	}
	if (this.numericTypes().indexOf(prop.type) >= 0){
		return true;
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isString = function(prop) {
	if (prop.type == undefined) {
		throw "prop does not have a type. ModelParser.prototype.isString";
	}
	if (this.stringTypes().indexOf(prop.type) >= 0){
		return true;
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isPublic = function(prop) {
    if (prop.access == undefined || prop.access == 'public') {
		return true;
	} 
    else {
        return false;
    }
}
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isPrivate = function(prop) {
    if (prop.access == 'private') {
		return 'true';
	} 
    else {
        return false;
    }
}
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isProtected = function(prop) {
    if (prop.access == 'protected') {
		return 'true';
	} 
    else {
        return false;
    }
}
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isDerived = function() {

	model = this.getModel();
	
	if (model['extends'] instanceof Array) {
		if (model['extends'].length > 0) {
			return true;
		}
	}
	return false

};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isContained = function(prop) {
	if ((prop.containment == undefined) ||
		(prop.containment == 'true')){
		return true;
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isLimited = function(prop) {
	return !(this.isEmpty(prop.from));
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isReferenced = function(prop) {
	return !this.isContained(prop);
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isOptional = function(prop) {
	if ((prop.optional == undefined) ||
		(prop.optional == 'false')){
		return false;
	}
	else {
		return true;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isUngroup = function(prop) {
	if ((prop.ungroup == undefined) ||
		(prop.ungroup == 'false')){
		return false;
	}
	else {
		return true;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isRecursive = function(prop) {
	if ( prop.type == this.getType() ){
		return true;
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isGrouped = function(prop) {
	/* the property is in a group, but not the group itself */
	if ((prop.group == undefined ) || (prop.group == "") ||  this.isGroup(prop)) {
		return false;
	}
	else {
		return true;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isGroupedIn = function(prop, groupName) {
	/* the property is placed inside the group 'groupName', but it is not the group itself. */
	if (this.isGrouped(prop) && prop.group==groupName) {
		return true;
	}
	else {
		return false;
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isGroup = function(prop) {
	/* the property is the group */
	if ((prop.group == undefined ) || (prop.group == "")) {
		return false;
	}
	else {
		if (prop.name == prop.group) {
			/* this is a group, make sure the type is correct */
			if ((prop.type == "string") && (this.isArray(prop))) {
				return true;
			}
			else {
				throw "A group must be an array of type string." + this.str(prop);
			}
		}
		else{
			return false;
		}
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.isParentProp = function(prop) {
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
ModelParser.prototype.isDimension = function(attr) {
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
ModelParser.prototype.findProperty = function(name, model) {
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
ModelParser.prototype.hasProperty = function(name, model) {
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
ModelParser.prototype.hasDependencies = function(prop) {
	var dept = this.getPropDependencies(prop);
	return !(this.isEmpty(dept));
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.hasDependents = function(prop) {
	var dept = this.getChildProps(prop);
	return !(this.isEmpty(dept));
};

/*----------------------------------------------------------------------------*/
ModelParser.prototype.getPropDependencies = function(prop) {
	return prop.__dependencies;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getDependentChildFor = function(child, prop) {
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
ModelParser.prototype.getChildProps = function(prop) {
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
ModelParser.prototype.getParentProps = function(childProp) {
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
ModelParser.prototype.getModelDepPackages = function() {
	/* Get all packages which are referenced in the model and not the
	 * model package itself.*/
	
	var packstr = this.getPackageStr();
	var packs = this.getCustomTypesPackages();
	
	var depPacks = [];
	
	for (var i = 0; i<packs.length; i++){
		if (packstr != packs[i])
			depPacks.push(packs[i]);
	} 
	
	return depPacks;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getModelDepVersionedPackages = function() {
	/* Get all packages which are referenced in the model and not the
	 * model package itself, add version to the packages.*/
	
	var packstr = this.getVersionedPackagesStr();
	var packs = this.getCustomTypesVersionedPackages();
	
	//console.log("packstr : \n" + packstr);
	//console.log("packs : \n" + packs.join('\n'));
	
	var depPacks = [];
	
	for (var i = 0; i<packs.length; i++){
		if (packstr != packs[i])
			depPacks.push(packs[i]);
	} 
	
	return depPacks;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getModelDepRootVersionedPackages = function() {
	/* Get all external packages and list the root package with version.*/
	
	var packstr = this.getVersionedRootPackageStr();
	
	var depPacks = this.getModelDepPackages();

	//console.log("packstr : \n" + packstr);
	//console.log("depPacks : \n" + depPacks.join('\n'));
	
	var depRootPackages = [];
	
	for (var i = 0; i<depPacks.length; i++){
		var rootPack = this.splitPackageStr(depPacks[i])[0];
		var version = this.getPackageVersion(rootPack);
		var versionedRootPack = this.addVersion(rootPack, version);
		//console.log("versionedRootPack : \n" + versionedRootPack);
		if ((depRootPackages.indexOf(versionedRootPack) == -1) &&
				(packstr != versionedRootPack)){
			depRootPackages.push(versionedRootPack);
		}
	} 
	
	return depRootPackages;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getModelExternalDepRootVersionedPackagesAndInternalDepPackages = function() {
	/* Return a list of
	 * 		External versioned root packages
	 * 		Internal dep. packages complete path.*/
	
	var curVersionedRootPack = this.getVersionedRootPackageStr();
	
	/*this package str*/
	var packstr = this.getPackageStr();
	
	var depPacks = this.getModelDepPackages();

	//console.log("packstr : \n" + packstr);
	//console.log("depPacks : \n" + depPacks.join('\n'));
	
	var depRootPackages = [];
	
	for (var i = 0; i<depPacks.length; i++){
		/* Add external root packages */
		var rootPack = this.splitPackageStr(depPacks[i])[0];
		var version = this.getPackageVersion(rootPack);
		var versionedRootPack = this.addVersion(rootPack, version);
		//console.log("versionedRootPack : \n" + versionedRootPack);
		if ((depRootPackages.indexOf(versionedRootPack) == -1) &&
				(curVersionedRootPack != versionedRootPack)){
			depRootPackages.push(versionedRootPack);
		}
		
		/* Add internal dependency packages*/
		if ((depRootPackages.indexOf(depPacks[i]) == -1) &&
				(curVersionedRootPack == versionedRootPack)){
			depRootPackages.push(depPacks[i]);
		}		
	} 
	
	return depRootPackages;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getCustomTypesPackages = function(props) {
	/*remmember types are all expanded with packaging*/
	
	if (props == undefined)
		props = this.getProperties();
	
	var types = this.getCustomTypes(props);
	
	var packs = [];
	
	for (var i = 0; i<types.length; i++){
		packs.push(this.removeTypeFromPackagedTypeStr(types[i]));
	} 
	return packs;
	
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getCustomTypesVersionedPackages = function(props) {
	/*remmember types are all expanded with packaging*/
	if (props == undefined)
		props = this.getProperties();
	
	var packStrs = this.getCustomTypesPackages(props);
	//console.log("packStrs : \n" + packStrs.join('\n'));
	
	var verPacks = [];
	
	for (var i = 0; i<packStrs.length; i++){
		var packs = this.splitPackageStr(packStrs[i]);
		//console.log("packs : \n" + packs.join('\n'));
		
		var versions = this.getPackagesVersions(packs);
		var versionedPackageStr = this.makeVersionedPackageStr(packs, versions);
		if (verPacks.indexOf(versionedPackageStr) == -1)
			verPacks.push(versionedPackageStr);
	} 
	//console.log("verPacks : \n" + verPacks.join('\n'));
	return verPacks;
	
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getCustomTypes = function(props) {
	if (props == undefined)
		props = this.getProperties();
	
	var props = this.getNonAtomics(props);
	var types = [];
	
	for (var i = 0; i<props.length; i++){
		var prop = props[i];
		types.push(prop.type);
	}
	
	return types;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.getNonAtomics = function(props) {
	if (props == undefined)
		props = this.getProperties();
	
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
ModelParser.prototype.getAtomics = function(props) {
	if (props == undefined)
		props = this.getProperties();
	
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
ModelParser.prototype.getArrays = function(props) {
	if (props == undefined)
		props = this.getProperties();
	
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
ModelParser.prototype.getSingles = function(props) {
	if (props == undefined)
		props = this.getProperties();
	
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
ModelParser.prototype.makeVersionedPackages = function(pnames,pvers) {
	/*two lists 
	 * pnames: name of packages in order
	 * pvers: vertion of packages in order*/
	
	var ppath = [];
	for (var i = 0, len = pnames.length; i< len; i++) {
		ppath.push(this.addVersion(pnames[i], pvers[i]));
	}
	return ppath;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.makeVersionedPackageStr = function(pnames,pvers) {
	/*two lists 
	 * pnames: name of packages in order
	 * pvers: vertion of packages in order*/
	
	return this.makeVersionedPackages(pnames,pvers).join(this.packageSep);
};

/*----------------------------------------------------------------------------*/
ModelParser.prototype.makeVersionedPackagedTypeStr = function(pnames,pvers,type) {
	/*two lists 
	 * pnames: name of packages in order
	 * pvers: vertion of packages in order*/
	
	return this.makeVersionedPackages(pnames,pvers).join(this.packageSep) + 
				this.packageSep + type;
};

/*----------------------------------------------------------------------------*/
ModelParser.prototype.makePackageStr = function(pnames) {
	/*two lists 
	 * pnames: join
	 * marmo:basic:NamedEntity*/
	
	return pnames.join(this.packageSep);
};

/*----------------------------------------------------------------------------*/
ModelParser.prototype.makePackagedTypeStr = function(pnames,typeName) {
	/*two lists 
	 * pnames: name of packages in order
	 * pvers: vertion of packages in order*/
	
	return this.makePackageStr(pnames) + this.packageSep + typeName;
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.splitPackageStr = function(packages) {
	return packages.split(this.packageSep);
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.parsePackagedTypeStr = function(packagedTypeStr) {
	/* get a packagedTypeStr,
	 * e.g. model:hydro:wamit:rao
	 * and extract path and versioning data*/
	
	var packages = this.splitPackageStr(packagedTypeStr);
	/* take out the typename */
	var typeName = packages[packages.length-1];
	packages = packages.slice(0,packages.length-1);
	var versions = this.getPackagesVersions(packages);
				
	
	return({	"packages": packages,
				"versions": versions,
				"name": this.getNameFromType(typeName) });
	
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.splitVersionedPackageName = function(packageName) {
	if (packageName.indexOf(this.versionSep) == -1)
		return {"name": packageName, "version":""};
		
	var parts = packageName.split(this.versionSep);
	
	return {"name": parts.slice(0, parts.length-1).join(this.versionSep),
			"version": parts[parts.length-1]};
};

ModelParser.prototype.versionedPackagesFromVersionedPackagedTypeStr = function(verPackagedTypeStr) {
	var parts = verPackagedTypeStr.split(this.packageSep);
	return {"packageStr":parts.slice(0,parts.length-1).join(this.packageSep),
			"name": parts[parts.length-1] };
};

ModelParser.prototype.removeTypeFromPackagedTypeStr = function(modelID) {
	var parts = modelID.split(this.packageSep);
	return parts.slice(0,parts.length-1).join(this.packageSep);
};

ModelParser.prototype.removeVersionsFromVersionedPackagedStr = function(verPackStr) {
	var type = this.versionedPackagesFromVersionedPackagedStr(verPackStr);
	return (type.names.join(this.packageSep));
};


ModelParser.prototype.versionedPackagesFromVersionedPackagedStr = function(packageID) {
	var ps = packageID.split(this.packageSep);
	
	var packages = [];
	var versions = []
	
	for (var i = 0, len = ps.length; i < len; i++) {
		var splitPack = this.splitVersionedPackageName(ps[i])
		packages.push(splitPack.name);
		versions.push(splitPack.version);
	}
	
	return {"names": packages, "versions": versions};
};


ModelParser.prototype.parseVersionedPackagedTypeStr = function(verPackagedTypeStr) {
	/* get a packagedTypeStr,
	 * e.g. model:hydro:wamit:rao
	 * and extract path and versioning data*/

	var splitType = this.versionedPackagesFromVersionedPackagedTypeStr(verPackagedTypeStr);
	
	var verPack = this.versionedPackagesFromVersionedPackagedStr(splitType.packageStr);
				
	
	return({	"packages": verPack.names,
				"versions": verPack.versions,
				"name": splitType.name });
	
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.superTypes = function() {
	
	var exts = [];
	model = this.getModel();
	
	if (model['extends'] instanceof Array) {
		
		var types = model['extends'];
		for (var i = 0, len = types.length; i< len; i++){
			exts.push(this.parsePackagedTypeStr(types[i]));

		}
	}

	
	return exts;
	
};

/*----------------------------------------------------------------------------*/
ModelParser.prototype.getPropertiesWithDimension = function(attr) {
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
ModelParser.prototype.validate = function() {
	
	this.validateMainAttributes();
	
	var props = this.getProperties();
	this.validatePropertyList(props);
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.validatePropertyList = function(props) {
	/* check if properties are correct in connection to each other,
	 * then check each property*/
	
	for (var i= 0; i<props.length; i++){
		var prop = props[i];
		this.validateProperty(prop);
	}
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.validateProperty = function(prop) {
	/*check if one property is all-right*/
};
/*----------------------------------------------------------------------------*/
ModelParser.prototype.validateMainAttributes = function() {
	/*check if main attributes are all right*/
};
/*----------------------------------------------------------------------------*/


/*----------------------------------------------------------------------------*/
function Groups(){
};
exports.Groups = Groups;
/*----------------------------------------------------------------------------*/
Groups.prototype.getFromGroupFuncs = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var props = this.getProperties();
	for (var i=0; i<props.length; i++ ) {
	    var prop = props[i];
		if (this.isGroup(prop)) {
			cmd.push(this.getFromGroup(bl, prop));	
			cmd.push(this.gbl(bl) + this.sep2);	
		}
	}
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Groups.prototype.getFromGroup = function(bl, prop) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	
	if (this.isGroup(prop)) {
	    
		cmd.push(this.gbl(bl) + 'function item = getFrom' + this.firstToUpper(prop.name) + '(' + this.objName() +', name)');
			
	    /* find in the cell array */
		cmd.push(this.gbl(bl+1) + 	'for i = 1:length(' + this.objName() + '.' + this.makePrivate(prop.name) + ')' );
		cmd.push(this.gbl(bl+2) + 		'if (strcmp(' + this.objName() + '.' + this.makePrivate(prop.name) + '{i}.name, name)==1)');
		cmd.push(this.gbl(bl+3) + 			'item = ' + this.objName() + '.' + this.makePrivate(prop.name) + '{i};');
		cmd.push(this.gbl(bl+3) + 			'return;');
		cmd.push(this.gbl(bl+2) +		'end');
		cmd.push(this.gbl(bl+1) +	'end');
		cmd.push(this.gbl(bl+1) +	'error([\'Error: object with the name (\' name \') not found.\'])');
		cmd.push(this.gbl(bl) + 'end');	
			
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Groups.prototype.getFromGroupMembersFuncs = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var props = this.getProperties();
	for (var i=0; i<props.length; i++ ) {
	    var prop = props[i];
		if (this.isGroup(prop)) {
			cmd.push(this.getFromGroupMember(bl, prop));	
			cmd.push(this.gbl(bl) + this.sep2);	
		}
	}
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Groups.prototype.getFromGroupMember = function(bl, grp) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	var props = this.getGroupedProps(grp.name);
	
	cmd.push(this.gbl(bl) + 'function item = getFromMembersOf' + this.firstToUpper(grp.name) + '(' + this.objName() +', name)');

	for (var i = 0; i<props.length; i++) {
	    var prop = props[i];	    
			
	    /* find in the cell array */
		cmd.push(this.gbl(bl+1) + 	'for i = 1:length(' + this.objName() + '.' + this.makePrivate(prop.name) + ')' );
		cmd.push(this.gbl(bl+2) + 		'if (strcmp(' + this.objName() + '.' + this.makePrivate(prop.name) + '{i}.name, name)==1)');
		cmd.push(this.gbl(bl+3) + 			'item = ' + this.objName() + '.' + this.makePrivate(prop.name) + '{i};');
		cmd.push(this.gbl(bl+3) + 			'return;');
		cmd.push(this.gbl(bl+2) +		'end');
		cmd.push(this.gbl(bl+1) +	'end');
	}
	
	cmd.push(this.gbl(bl+1) +	'error([\'Error: object with the name (\' name \') not found in group members.\'])');			

	cmd.push(this.gbl(bl) + 'end');	

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Groups.prototype.groupAppendFuncs = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var props = this.getProperties();
	for (var i = 0; i<props.length; i++) {
	    var prop = props[i];
	
		if (this.isGroup(prop)) {

		    var propType = this.getClassPathFromType(prop.type);
		    
			cmd.push(this.gbl(bl) + 'function appendTo' + this.firstToUpper(prop.group) +'(' + this.objName() + ',newObj)');
			cmd.push(this.gbl(bl+1) +	'if ~(exist(\'newObj\',\'var\')) ');
			cmd.push(this.gbl(bl+2) + 		'error(\'ERROR: No input, an object must be given as input to be appended to the list.\'); ');	
			cmd.push(this.gbl(bl+1) +  	'end ');
			cmd.push(this.gbl(bl+1) + 'try' );
			cmd.push(this.gbl(bl+2) + 	'typeName = newObj.MODEL.type;' );
			cmd.push(this.gbl(bl+1) + 'catch ME' );
			cmd.push(this.gbl(bl+2) + 	'error(\'ERROR: The input must be a SIMOS generated object with MODEL.type property.\'); ');
			cmd.push(this.gbl(bl+1) + 'end');

			cmd.push(this.gbl(bl+1) + 	"switch newObj.MODEL.type"); 
			var gprops = this.getGroupedProps(prop.name);			
			for (var j = 0; j<gprops.length; j++) {
			    var gprop = gprops[j];	    
			    cmd.push(this.gbl(bl+2) + 	"case \'" + gprop.type + "\'"); 		
			}
			cmd.push(this.gbl(bl+2) + 		"otherwise"); 
			cmd.push(this.gbl(bl+3) + 			"error([\'Error: The object type (\' newObj.MODEL.type \') is not amoung the grouped types. \'])");
			cmd.push(this.gbl(bl+1) + 	'end');

			cmd.push(this.gbl(bl+1) + 	'for i = 1:length(' + this.objName() + '.' + this.makePrivate(prop.name) + ')');
			cmd.push(this.gbl(bl+2) + 		'if (strcmp(' + this.objName() + '.' + this.makePrivate(prop.name) + '{i}.name, newObj.name) == 1)');
			cmd.push(this.gbl(bl+3) + 			'error(\'ERROR: An object with the same name already exist in the list.\'); ');	
			cmd.push(this.gbl(bl+2) + 		'end');		
			cmd.push(this.gbl(bl+1) + 	'end');
			cmd.push(this.gbl(bl+1) + 	this.objName() + '.' + this.makePrivate(prop.name) + '{end+1} = newObj;');

			cmd.push(this.gbl(bl) + 'end');	
			cmd.push(this.getCodeSeparator(bl));
					
		}
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Groups.prototype.groupRemoveFuncs = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var props = this.getProperties();
	for (var i = 0; i<props.length; i++) {
	    var prop = props[i];
	
		if (this.isGroup(prop)) {

		    var propType = this.getClassPathFromType(prop.type);
		    
			cmd.push(this.gbl(bl) + 'function removeFrom' + this.firstToUpper(prop.group) +'(' + this.objName() + ',name)');
			cmd.push(this.gbl(bl+1) +	'if ~(exist(\'name\',\'var\')) ');
			cmd.push(this.gbl(bl+2) + 		'error(\'ERROR: No input, the name of the object to be deleted from the list must be given as input.\'); ');	
			cmd.push(this.gbl(bl+1) +  	'end ');
			
			cmd.push(this.gbl(bl+1) + 	"newList = {};"); 
			cmd.push(this.gbl(bl+1) + 	'for i = 1:length(' + this.objName() + '.' + this.makePrivate(prop.name) + ')');
			cmd.push(this.gbl(bl+2) + 		'if (strcmp(' + this.objName() + '.' + this.makePrivate(prop.name) + '{i}.name, name) ~= 1)');
			cmd.push(this.gbl(bl+3) + 			'newList{end+1} = ' + this.objName() + '.' + this.makePrivate(prop.name) + '{i}; ');	
			cmd.push(this.gbl(bl+2) + 		'end');		
			cmd.push(this.gbl(bl+1) + 	'end');
			cmd.push(this.gbl(bl+1) + 	this.objName() + '.' + this.makePrivate(prop.name) + ' = newList;');

			cmd.push(this.gbl(bl) + 'end');	
			cmd.push(this.getCodeSeparator(bl));
					
		}
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
/*----------------------------------------------------------------------------*/
Groups.prototype.groupFactoryFuncs = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var props = this.getProperties();
	for (var i = 0; i<props.length; i++) {
	    var prop = props[i];
	
		if (this.isGrouped(prop)) {
		    if (this.isSingle(prop) || this.isAtomic(prop))
		        throw "Single or Atomic types are not supported for groupping yet.\n" + JSON.stringify(prop);

		    var propType = this.getClassPathFromType(prop.type);
		    
			cmd.push(this.gbl(bl) + 'function obj = append' + this.firstToUpper(prop.name) + "To" + this.firstToUpper(prop.group) +'(' + this.objName() + ',name)');
			cmd.push(this.gbl(bl+1) +	'if ~(exist(\'name\',\'var\')) ');
			cmd.push(this.gbl(bl+2) + 		'name = [' + this.stringify(prop.name) + ' num2str(length(' + this.objName() + '.' + prop.name + ') +1)]; ');	
			cmd.push(this.gbl(bl+1) +  	'end ');
			cmd.push(this.gbl(bl+1) + 	'for i = 1:length(' + this.objName() + '.' + this.makePrivate(prop.group) + ')');
			cmd.push(this.gbl(bl+2) + 		'if (strcmp(' + this.objName() + '.' + this.makePrivate(prop.group) + '{i}.name, name) == 1)');
			cmd.push(this.gbl(bl+3) + 			'disp([\'warning:\' name \' already exist. Returning the existing object instead of adding a new one. \']);');
			cmd.push(this.gbl(bl+3) + 			'obj = ' + this.objName() + '.' + this.makePrivate(prop.group) + '{i};');
			cmd.push(this.gbl(bl+3) + 			'return;');
			cmd.push(this.gbl(bl+2) + 		'end');		
			cmd.push(this.gbl(bl+1) + 	'end');
			cmd.push(this.gbl(bl+1) + 	'obj = ' + propType + '(name);');

			if (this.hasAssignments(prop))
				cmd.push(
					this.assignPropertyValue(bl+1,	this.getAssignments(prop), 'obj')
					);
			
			//cmd.push(this.gbl(bl+1) + this.objName() + '.' + prop.name + '{end+1} = obj;');
			cmd.push(this.gbl(bl+1) + this.objName() + '.' + prop.group + '{end+1} = obj;');
			
			
			/*
			 * TODO: Check if the name already exist
			cmd.push(this.gbl(bl+1) + 
				'if not(obj.name in [a.name for a in self.' + prop.name + ']):');
			cmd.push(this.gbl(bl+2) + 
					this.objName() + '.' + prop.name + '(end+1) = obj');
			cmd.push(this.gbl(bl+1) + 
				'else');
			cmd.push(this.gbl(bl+2) + 
					'print ("warning: object %s already exist."%(obj.name))');	
			cmd.push(this.gbl(bl) + 
				'end');	
			*/
			cmd.push(this.gbl(bl) + 'end');	
			cmd.push(this.getCodeSeparator(bl));
					
		}
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Groups.prototype.prepareGroupsForSavingFuncs = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var props = this.getProperties();
	for (var i=0; i<props.length; i++ ) {
	    var prop = props[i];
		if (this.isGroup(prop)) {
			cmd.push(this.prepareGroupsForSaving(bl, prop));	
			cmd.push(this.gbl(bl) + this.sep2);	
		}
	}
	
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Groups.prototype.prepareGroupsForSaving = function(bl, grp) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var props = this.getGroupedProps(grp.name);
	
	cmd.push(this.gbl(bl) + 'function obj = prepare' + this.firstToUpper(grp.name) +'ForSaving(' + this.objName() + ')');

	for (var i = 0; i<props.length; i++) {
	    var prop = props[i];
	    cmd.push(this.gbl(bl+1) + this.objName() + "." + this.makePrivate(prop.name) + " = {};"); 
	}
	
	cmd.push(this.gbl(bl+1));
	
	cmd.push(this.gbl(bl+1) + 	'for i = 1:length(' + this.objName() + '.' + this.makePrivate(grp.name) + ')');
	
	cmd.push(this.gbl(bl+2) + 		"switch " + this.objName() + "." + this.makePrivate(grp.name) + "{i}.MODEL.type"); 
	for (var i = 0; i<props.length; i++) {
	    var prop = props[i];
	    cmd.push(this.gbl(bl+3) + 		"case \'" + prop.type + "\'"); 
	    cmd.push(this.gbl(bl+4) + 			this.objName() + '.' + this.makePrivate(prop.name) + "{end+1} = " + this.objName() + "." + this.makePrivate(grp.name) + "{i};"); 
	}
	
	cmd.push(this.gbl(bl+3) + 			"otherwise"); 
	cmd.push(this.gbl(bl+4) + 				"error([\'Error: the \' num2str(i) \' item in " + grp.name + " group is not of allowed type.\'])");
	cmd.push(this.gbl(bl+2) + 		'end');
	cmd.push(this.gbl(bl+2) + 		this.objName() + "." + this.makePrivate(grp.name) + "{i} = " + this.objName() + "." + this.makePrivate(grp.name) + "{i}.name;"); 
	cmd.push(this.gbl(bl+1) + 	'end');
	
	cmd.push(this.gbl(bl) + 'end');	
	cmd.push(this.getCodeSeparator(bl));
	
	return cmd.join('\n');
}	
/*----------------------------------------------------------------------------*/
Groups.prototype.initGroupsAfterLoadingFuncs = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var props = this.getProperties();
	for (var i=0; i<props.length; i++ ) {
	    var prop = props[i];
		if (this.isGroup(prop)) {
			cmd.push(this.initGroupsAfterLoading(bl, prop));	
			cmd.push(this.gbl(bl) + this.sep2);	
		}
	}
	
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Groups.prototype.initGroupsAfterLoading = function(bl, grp) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	var props = this.getGroupedProps(grp.name);
	
	cmd.push(this.gbl(bl) + 'function obj = init' + this.firstToUpper(grp.name) +'AfterLoading(' + this.objName() + ')');
	
	cmd.push(this.gbl(bl+1));
	
	cmd.push(this.gbl(bl+1) + 	'for i = 1:length(' + this.objName() + '.' + this.makePrivate(grp.name) + ')');
	cmd.push(this.gbl(bl+2) + 		"obj = " + this.objName() + ".getFromMembersOf" + this.firstToUpper(grp.name)+ "(" + this.objName() + "." + this.makePrivate(grp.name) + "{i});");
	cmd.push(this.gbl(bl+2) + 		this.objName() + "." + this.makePrivate(grp.name) + "{i} = obj; ");
	cmd.push(this.gbl(bl+1) + 	'end');	
	
	for (var i = 0; i<props.length; i++) {
	    var prop = props[i];
	    cmd.push(this.gbl(bl+1) + this.objName() + "." + this.makePrivate(prop.name) + " = {};"); 
	}
	
	cmd.push(this.gbl(bl) + 'end');	
	cmd.push(this.getCodeSeparator(bl));
	
	return cmd.join('\n');
}	
    	
	

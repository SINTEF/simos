/*----------------------------------------------------------------------------*/
function MatStrSave(){
};
exports.MatStrSave = MatStrSave;
/*----------------------------------------------------------------------------*/
MatStrSave.prototype.saveMatStr = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];


	cmd.push(this.gbl(bl) + 	'function saveMatStr(' + this.objName() + ',filePath)');
	cmd.push(this.gbl(bl+1) + 		'if ~(exist(\'filePath\',\'var\'))'); 
	cmd.push(this.gbl(bl+2) + 			'filePath = strcat(' + this.objName() + '.name, \'_stat.m\'); ');
	cmd.push(this.gbl(bl+1) + 		'end ');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 		 this.objName() + '.storageBackEndType = \'matstr\';');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 		'if (exist(filePath,\'file\'))');
	cmd.push(this.gbl(bl+2) + 			'delete(filePath);');
	cmd.push(this.gbl(bl+1) + 		'end');
	cmd.push(this.gbl(bl+1));
	cmd.push(this.gbl(bl+1) + 		'if (strcmpi(' + this.objName() + '.storageBackEndType,\'matstr\'))');
	cmd.push(this.gbl(bl+2) + 			 this.objName() + '.saveMatStrWithName(filePath, ' + this.objName() + '.name);');
	cmd.push(this.gbl(bl+1) + 		'else');
	cmd.push(this.gbl(bl+2) + 			'error([\'storage back-end \' ' + this.objName() + '.storageBackEndType \' is not defined.\']);');
	cmd.push(this.gbl(bl+1) + 		'end');
	cmd.push(this.gbl(bl) + 	'end');

return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatStrSave.prototype.saveMatStrWithName = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];


    cmd.push(this.gbl(bl) +     'function saveMatStrWithName(' + this.objName() + ',filePath, name)');
    cmd.push(this.gbl(bl+1) +       'matstr = ' + this.objName() + '.getMatStr(name);');
    //cmd.push(this.gbl(bl+1) +       'matstr = strrep(matstr, \'\\\',\'\\\\\')');
    //cmd.push(this.gbl(bl+1) +       'matstr = strrep(matstr, \'%\',\'%%\');');    
    cmd.push(this.gbl(bl+1) +       'fileID = fopen(filePath,\'w\');');
    cmd.push(this.gbl(bl+1) +       'fprintf(fileID, \'%s\', matstr);');
    cmd.push(this.gbl(bl+1) +       'fclose(fileID);');
    
    cmd.push(this.gbl(bl) +     'end');

return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatStrSave.prototype.getMatStr = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	var propType = this.getClassPathFromType(this.getType());

	cmd.push(this.gbl(bl) + 'function matstr = getMatStr(' + this.objName() + ', name)');
	cmd.push(this.gbl(bl+1) +   'matstr = {};');
    cmd.push(this.gbl(bl+1) +   'matstr{end+1} = [\'% \' ' + this.objName() + '.name ];');
	cmd.push(this.gbl(bl+1) +   'matstr{end+1} = [name \' = ' + propType + '(); \'];');
	cmd.push(this.gbl(bl+1) +	'matstr{end+1} = ' + this.objName() + '.getMatStrHandle(name);' );
    cmd.push(this.gbl(bl+1) +   'matstr = strjoin(matstr, \'\\n\');');
	cmd.push(this.gbl(bl) + 'end');
		
	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatStrSave.prototype.getMatStrHandle = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];

    /*==================================================*/
    cmd.push(this.gbl(bl) + 'function matstr = getMatStrHandle(' + this.objName() + ', head)');
    cmd.push(this.gbl(bl+1) +     'matstr = {};');
    
    /*
    if (this.isDerived()) {
        cmd.push(this.gbl(bl+1) +
        'super(' + this.getClassName() + ', self)._saveDataToHDF5Handle(handle)');
        cmd.push(this.gbl(bl+1) + '');
    }
    */
    
    if (this.isDerived()) {
        throw "Derived models can not be used for code generation with matlab.";
    }
    

    /* writing properties */
    
    var properties = this.getProperties();
    var propNum = properties.length;
    
    for(var i = 0; i < propNum; i++) {
        var prop = properties[i];  

        if (this.isGrouped(prop)) {
            continue;
        }
        
        if (this.isGroup(prop)) {
            cmd.push(this.gbl(bl+1) + 'matstr{end+1} = ' +
            this.objName() + '.getMatStrItem(head, ' + this.stringify(prop.name) + ', \'NonAtomicArray\');' );
            continue;
        }
            
            
        /* writing the value */
        if (this.isAtomicType(prop.type)) {
            if(this.isArray(prop)){
                /* array of atomic type */
                cmd.push(this.gbl(bl+1) + 'matstr{end+1} = ' + 
                        this.objName() + '.getMatStrItem(head, ' + this.stringify(prop.name) + ', \'AtomicArray\');' );
             }
             else{
                 /* single atomic type value */
                cmd.push(this.gbl(bl+1) + 'matstr{end+1} = ' +
                        this.objName() + '.getMatStrItem(head, ' + this.stringify(prop.name) + ', \'AtomicSingle\');' );
             }
        }
        else {
            /*creating references and saving other complex types 
             * 'value' will be a or an array of references */
            
            if(this.isArray(prop)){
                /*create a subgroup for the contained values */
                /* array non-atomic type reference */
                 cmd.push(this.gbl(bl+1) + 'matstr{end+1} = ' +
                    this.objName() + '.getMatStrItem(head, ' + this.stringify(prop.name) + ', \'NonAtomicArray\');' );
            }
             else{
                 /* single non-atomic type reference */
                 cmd.push(this.gbl(bl+1) + 'matstr{end+1} = ' +
                    this.objName() + '.getMatStrItem(head, ' + this.stringify(prop.name) + ', \'NonAtomicSingle\');' );
             }

        }
         
        cmd.push(this.gbl(bl+1));

    }
    
    cmd.push(this.gbl(bl+1) + 'matstr = matstr(~cellfun(\'isempty\', matstr));');
    cmd.push(this.gbl(bl+1) + 'matstr = strjoin(matstr, \'\\n\');');
    cmd.push(this.gbl(bl) + 'end');
    
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatStrSave.prototype.getMatStrItem = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function matstr = getMatStrItem(' + this.objName() + ', handle, varName, type)');
	
	cmd.push(this.gbl(bl+1) +	'if (strcmp(type, \'AtomicSingle\'))');
	cmd.push(this.gbl(bl+2) +		'matstr = ' + this.objName() + '.getMatStrItemAtomicSingle(handle, varName);' );
	cmd.push(this.gbl(bl+1) +	'elseif (strcmp(type, \'AtomicArray\'))');
	cmd.push(this.gbl(bl+2) +		'matstr = ' + this.objName() + '.getMatStrItemAtomicArray(handle, varName);' );
	cmd.push(this.gbl(bl+1) +	'elseif (strcmp(type, \'NonAtomicArray\'))');
	cmd.push(this.gbl(bl+2) +		'matstr = ' + this.objName() + '.getMatStrItemNonAtomicArray(handle, varName);' );
	cmd.push(this.gbl(bl+1) +	'elseif (strcmp(type, \'NonAtomicSingle\'))');
	cmd.push(this.gbl(bl+2) +		'matstr = ' + this.objName() + '.getMatStrItemNonAtomicSingle(handle, varName);' );
	cmd.push(this.gbl(bl+1) +	'end');

	cmd.push(this.gbl(bl+1));

	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatStrSave.prototype.getMatStrItemAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	    
	cmd.push(this.gbl(bl) + 'function str = getMatStrItemAtomicSingle(' + this.objName() + ', head, varName)');
	
	cmd.push(this.gbl(bl+1) +    'str = \'\';');
	cmd.push(this.gbl(bl+1) + 	 'if (' + this.objName() + '.isSet(varName))');
	cmd.push(this.gbl(bl+2) + 	 	'str = [head \'.\' varName \' = \' mat2str(' + this.objName() + '.(varName)) \';\' ];');	
	cmd.push(this.gbl(bl+1) + 	'end');
	
	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatStrSave.prototype.getMatStrItemAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function str = getMatStrItemAtomicArray(' + this.objName() + ', head, varName)');
	cmd.push(this.gbl(bl+1) +  'if (iscellstr(' +this.objName() + '.(varName)) == 1)');
    cmd.push(this.gbl(bl+2) +    'str = [head \'.\' varName \' = \' simos.tools.strcell2str(' + this.objName() + '.(varName)) \';\' ];');
    cmd.push(this.gbl(bl+1) +  'else');
    cmd.push(this.gbl(bl+2) +     'str = [head \'.\' varName \' = \' mat2str(' + this.objName() + '.(varName)) \';\' ];');
    cmd.push(this.gbl(bl+1) +   'end');
	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatStrSave.prototype.getMatStrItemNonAtomicSingle = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function str = getMatStrItemNonAtomicSingle(' + this.objName() + ', handle, varName)');
	cmd.push(this.gbl(bl+1) +  'str = {};');
	 /* single non-atomic type value */
	cmd.push(this.gbl(bl+1) + 	'if (' + this.objName() + '.isSet(varName))');
	cmd.push(this.gbl(bl+2) +		'if (' + this.objName() + '.isContained(varName))');
    cmd.push(this.gbl(bl+3) +           'funcName = [\'makea\' upper(varName(1))  varName(2:end)];');
	cmd.push(this.gbl(bl+3) +           'str{end+1} = [handle \'.\' varName \' = \' handle \'.\' funcName \'()\'];');
	cmd.push(this.gbl(bl+3) + 			'str{end+1} = ' + this.objName() + '.(varName).getMatStr([handle \'.\' varName]);');
	cmd.push(this.gbl(bl+2) + 		'else');
	/*
	cmd.push(this.gbl(bl+2) +
			'dset = maindgrp.create_dataset("values"' + ',(len(getattr(self,varName)),), dtype=ref_dtype )' );
	cmd.push(this.gbl(loopBlock.bl+1) + 
			 'dset' + loopBlock.indArray + ' = dgrp.ref');
			 */
	cmd.push(this.gbl(bl+3) +			'error(\'referenced single value is not implemented.\')' );
	cmd.push(this.gbl(bl+2) +		'end');
	cmd.push(this.gbl(bl+1) +	'end');
	/* put the reference in place*/ 
	/*cmd.push(this.gbl(bl+1) + 
			 'handle[' + JSON.stringify(prop.name) + '] = dgrp.ref');
			 */

	cmd.push(this.gbl(bl) + 'str = strjoin(str,\'\\n\');');
	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
MatStrSave.prototype.getMatStrItemNonAtomicArray = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];
	
	cmd.push(this.gbl(bl) + 'function str = getMatStrItemNonAtomicArray(' + this.objName() + ', handle, varName)');

	cmd.push(this.gbl(bl+1) + 'str = {};'); 


	var properties = this.getProperties();
	var propNum = properties.length;
		
	cmd.push(this.gbl(bl+1) + 'if (' + this.objName() + '.isSet(varName))' );	
	cmd.push(this.gbl(bl+2) +      'if (' + this.objName() + '.isContained(varName))');

	for(var i = 0; i < propNum; i++) {
		var prop = properties[i]; 
		
		if (  ( (!(this.isAtomic(prop))) && (this.isArray(prop)) ) || this.isGroup(prop) ) {
		cmd.push(this.gbl(bl+3) +     'if (strcmp(varName, ' + this.stringify(prop.name) + '))' );

		var loopBlock = this.loopBlockForArray(bl+4,prop);
		cmd.push(loopBlock.cmd);
		cmd.push(this.gbl(loopBlock.bl+1) +	'item = ' + this.objName() + '.(' + this.objName() + '.getPrivateName(varName))' + 
												'{' +loopBlock.indArray + '};'	);	
		cmd.push(this.gbl(loopBlock.bl+1) + 'path = [handle \'.\' varName \'{\' ' +loopBlock.strIndArray + ' \'}\' ];' );	
		cmd.push(this.gbl(loopBlock.bl+1) + 'str{end+1} = item.getMatStr(path);' );		
		cmd.push(loopBlock.ends);
		
		cmd.push(this.gbl(bl+3) +     'end');
		
		}
	}
	

	cmd.push(this.gbl(bl+2) +     'else');
	cmd.push(this.gbl(bl+3) +         'error(\'referenced array is not implemented.\')' );
	cmd.push(this.gbl(bl+2) +     'end');
	cmd.push(this.gbl(bl+1) +  'end');
	
	cmd.push(this.gbl(bl+1) +  'str = strjoin(str, \'\\n\');');
	cmd.push(this.gbl(bl) + 'end');
	
    return cmd.join('\n');
};

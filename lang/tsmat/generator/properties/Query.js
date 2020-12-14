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
/*----------------------------------------------------------------------------*/
Query.prototype.lookForEntityFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.gbl(bl) + 'function objs = lookForEntity(' + this.objName() + ',name)');  
    cmd.push(this.gbl(bl+1) + 'objs = {};');        
      
        
    var props = this.getNonAtomicArrayProperties();
    for (var i=0; i<props.length; i++) {
        var prop = props[i];
        cmd.push(this.gbl(bl+1) +'p = ' + this.objName() + '.' + prop.name + ';');                 
        cmd.push(this.gbl(bl+1) +'if (' + this.objName() + '.isSet(' + this.stringify(prop.name) + ') ) '); 
        cmd.push(this.gbl(bl+2) +	'for obji =1:length(p)');   
        cmd.push(this.gbl(bl+3) +		'if (strcmp(p{obji}.name, name)==1)');        
        cmd.push(this.gbl(bl+4) +			'objs{end+1} = p{obji}; '); 
        cmd.push(this.gbl(bl+3) +		'end');
        cmd.push(this.gbl(bl+2) +	'end');           
        cmd.push(this.gbl(bl+1) +'end');       
    }

    
    cmd.push(this.gbl(bl+1) + 'if (length(objs) > 1)');      
    cmd.push(this.gbl(bl+2) + 	'error([\'more than one Entity found with the name: \' + name])');      
    cmd.push(this.gbl(bl+1) + 'end'); 

    cmd.push(this.gbl(bl) +'end'); 

    
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Query.prototype.lookForEntityWithFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.gbl(bl) + 'function objs = lookForEntityWith(' + this.objName() + ',propName, propValue)');  
    cmd.push(this.gbl(bl+1) + 'objs = {};');        
        
    var props = this.getNonAtomicArrayProperties();
    for (var i=0; i<props.length; i++) {
        var prop = props[i];
        cmd.push(this.gbl(bl+1) +'p = ' + this.objName() + '.' + prop.name + ';');         
        cmd.push(this.gbl(bl+1) +'if (' + this.objName() + '.isSet(' +  this.stringify(prop.name) + ') ) '); 
        cmd.push(this.gbl(bl+2) +	'for obji =1:length(p)');   
        cmd.push(this.gbl(bl+3) +		'if isprop(p{obji},propName) ');
        cmd.push(this.gbl(bl+4) +			'if (p{obji}.(propName) == propValue)');        
        cmd.push(this.gbl(bl+5) +				'objs{end+1} = p{obji}; '); 
        cmd.push(this.gbl(bl+4) +			'end');        
        cmd.push(this.gbl(bl+3) +		'end');
        cmd.push(this.gbl(bl+2) +	'end');           
        cmd.push(this.gbl(bl+1) +'end'); 

    }    
    
    cmd.push(this.gbl(bl) +'end'); 
    
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Query.prototype.hasEntityFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.gbl(bl) + 'function flag = hasEntity(' + this.objName() + ', name)');   
    cmd.push(this.gbl(bl+1) + 'objs = ' + this.objName() + '.lookForEntity(name);');         
        
    cmd.push(this.gbl(bl+1) + 'if (length(objs) == 1)');         
    cmd.push(this.gbl(bl+2) + 	'flag = true;');   
    cmd.push(this.gbl(bl+1) + 'else');        
    cmd.push(this.gbl(bl+2) +   'flag = false;');             
    cmd.push(this.gbl(bl+1) + 'end'); 
    
    cmd.push(this.gbl(bl) +'end'); 

    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Query.prototype.getEntityFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.gbl(bl) + 'function obj = getEntity(' + this.objName() + ',name)');   
    cmd.push(this.gbl(bl+1) +	'objs = ' + this.objName() + '.lookForEntity(name);');         
    
    cmd.push(this.gbl(bl+1) +   'if (length(objs) == 1)');         
    cmd.push(this.gbl(bl+2) + 		'obj = objs{1};');    
    cmd.push(this.gbl(bl+1) +   'else');        
    cmd.push(this.gbl(bl+2) +       'error([\'did not find Entity: \' name]);');          
    cmd.push(this.gbl(bl+1) +   'end'); 
    
    cmd.push(this.gbl(bl) +'end');     
    
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
function Query(){
};
exports.Query = Query;
/*----------------------------------------------------------------------------*/
Query.prototype.isValidDeclaration = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "procedure, public :: isValid");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Query.prototype.isValid = function(bl) {
	if (bl == undefined) {
		bl = 0;
	}	
	var cmd = [];

	cmd.push(this.gbl(bl) + "function isValid(this) result(content)");
	cmd.push(this.gbl(bl+1) + "class(" + this.getTypeName() + ")"+ " :: this");
	cmd.push(this.gbl(bl+1) + "logical :: content");
	cmd.push(this.gbl(bl+1) + "if (this%name%isEmpty()) then");
	cmd.push(this.gbl(bl+2) + "content=.false.");
	cmd.push(this.gbl(bl+1) + "else");
	cmd.push(this.gbl(bl+2) + "content=.true.");
	cmd.push(this.gbl(bl+1) + "end if");
	cmd.push(this.gbl(bl) + "end function");

	return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
    /*
Query.prototype.lookForEntityFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.getBlockSpace(bl) + 
    'def _lookForEntity(self,name):');  
    cmd.push(this.getBlockSpace(bl+1) + 
        'objs = []');        
        
    var props = this.getNonAtomicArrayProperties();
    for (var i=0; i<props.length; i++) {
        var prop = props[i];
        cmd.push(this.getBlockSpace(bl+1) + 
        'if (self.' + prop.name + ' != None): ');        
        cmd.push(this.getBlockSpace(bl+2) + 
            'objs = objs + [x for x in self.' + prop.name + ' if (x.name == name)] ');       
    }

    var props = this.getNonAtomicSingleProperties();
    for (var i=0; i<props.length; i++) {
        var prop = props[i];
        cmd.push(this.getBlockSpace(bl+1) + 
            'if (self.' + prop.name + ' != None): ');
        cmd.push(this.getBlockSpace(bl+2) + 
                'if (self.' + prop.name + '.name == name ):');       
        cmd.push(this.getBlockSpace(bl+3) + 
                    'objs.append(self.' + prop.name + ')');      
    }
    
    cmd.push(this.getBlockSpace(bl+1) + 
            'if (len(objs) > 1):');      
    cmd.push(this.getBlockSpace(bl+2) + 
                'raise Exception("more than one Entity found with the name: %s"%name)');      
    cmd.push(this.getBlockSpace(bl+1) + 
            'return objs' );         
    
    
    return cmd.join('\n');
};
*/
/*----------------------------------------------------------------------------*/
/*    
Query.prototype.hasEntityFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.getBlockSpace(bl) + 
    'def hasEntity(self,name):');   
    cmd.push(this.getBlockSpace(bl+1) + 
            'objs = self._lookForEntity(name)');         
        
    cmd.push(this.getBlockSpace(bl+1) + 
            'if (len(objs) == 1):');         
    cmd.push(this.getBlockSpace(bl+2) + 
                'return True');   
    cmd.push(this.getBlockSpace(bl+1) + 
            'else:');        
    cmd.push(this.getBlockSpace(bl+2) + 
                'return False');             
    
    
    return cmd.join('\n');
};
*/
/*----------------------------------------------------------------------------*/
/*
Query.prototype.getEntityFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.getBlockSpace(bl) + 
    'def getEntity(self,name):');   
    cmd.push(this.getBlockSpace(bl+1) + 
            'objs = self._lookForEntity(name)');         
        
    cmd.push(this.getBlockSpace(bl+1) + 
            'if (len(objs) == 1):');         
    cmd.push(this.getBlockSpace(bl+2) + 
                'return objs[0]');    
    cmd.push(this.getBlockSpace(bl+1) + 
            'else:');        
    cmd.push(this.getBlockSpace(bl+2) + 
                'raise Exception("did not find Entity: %s"%name)');          
    
    
    return cmd.join('\n');
};
*/
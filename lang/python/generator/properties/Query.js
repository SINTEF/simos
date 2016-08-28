/*----------------------------------------------------------------------------*/
function Query(){
};
exports.Query = Query;
/*----------------------------------------------------------------------------*/
Query.prototype.lookForEntityFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.gbl(bl) + 
    'def _lookForEntity(self,name):');  
    cmd.push(this.gbl(bl+1) + 
        'objs = []');        
        
    var props = this.getNonAtomicArrayProperties();
    for (var i=0; i<props.length; i++) {
        var prop = props[i];
        cmd.push(this.gbl(bl+1) + 
        'if (self.' + prop.name + ' != None): ');        
        cmd.push(this.gbl(bl+2) + 
            'objs = objs + [x for x in self.' + prop.name + ' if (x.name == name)] ');       
    }

    var props = this.getNonAtomicSingleProperties();
    for (var i=0; i<props.length; i++) {
        var prop = props[i];
        cmd.push(this.gbl(bl+1) + 
            'if (self.' + prop.name + ' != None): ');
        cmd.push(this.gbl(bl+2) + 
                'if (self.' + prop.name + '.name == name ):');       
        cmd.push(this.gbl(bl+3) + 
                    'objs.append(self.' + prop.name + ')');      
    }
    
    cmd.push(this.gbl(bl+1) + 
            'if (len(objs) > 1):');      
    cmd.push(this.gbl(bl+2) + 
                'raise Exception("more than one Entity found with the name: %s"%name)');      
    cmd.push(this.gbl(bl+1) + 
            'return objs' );         
    
    
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Query.prototype.hasEntityFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.gbl(bl) + 
    'def hasEntity(self,name):');   
    cmd.push(this.gbl(bl+1) + 
            'objs = self._lookForEntity(name)');         
        
    cmd.push(this.gbl(bl+1) + 
            'if (len(objs) == 1):');         
    cmd.push(this.gbl(bl+2) + 
                'return True');   
    cmd.push(this.gbl(bl+1) + 
            'else:');        
    cmd.push(this.gbl(bl+2) + 
                'return False');             
    
    
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Query.prototype.getEntityFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.gbl(bl) + 
    'def getEntity(self,name):');   
    cmd.push(this.gbl(bl+1) + 
            'objs = self._lookForEntity(name)');         
        
    cmd.push(this.gbl(bl+1) + 
            'if (len(objs) == 1):');         
    cmd.push(this.gbl(bl+2) + 
                'return objs[0]');    
    cmd.push(this.gbl(bl+1) + 
            'else:');        
    cmd.push(this.gbl(bl+2) + 
                'raise Exception("did not find Entity: %s"%name)');          
    
    
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Query.prototype.getEntityWithFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.gbl(bl) + 'def getEntityWith(self,propName, propValue):');  
    cmd.push(this.gbl(bl+1) + 'objs = self._lookForEntityWith(propName, propValue)');        

    cmd.push(this.gbl(bl+1) + 'if (len(objs) == 0):');      
    cmd.push(this.gbl(bl+2) + 	'raise Exception( ("No Entity found with the property %s and value "%propName) + str(propValue) )');      
    cmd.push(this.gbl(bl+1) + 'if (len(objs) > 1):');      
    cmd.push(this.gbl(bl+2) + 	'raise Exception( ("more than one Entity found the property %s and value "%propName) + str(propValue) )');      
    cmd.push(this.gbl(bl+1) + 'return objs[0]' );         
    
    
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Query.prototype.getAllEntitiesWithFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.gbl(bl) + 'def getAllEntitiesWith(self,propName, propValue):');  
    cmd.push(this.gbl(bl+1) + 'objs = self._lookForEntityWith(propName, propValue)');        
      
    cmd.push(this.gbl(bl+1) + 'return objs' );         
    
    
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Query.prototype.hasEntityWithFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.gbl(bl) + 'def hasEntityWith(self,propName, propValue):');  
    cmd.push(this.gbl(bl+1) + 'objs = self._lookForEntityWith(propName, propValue)');        

    cmd.push(this.gbl(bl+1) + 'if (len(objs) == 0):');      
    cmd.push(this.gbl(bl+2) + 	'return False');            
    cmd.push(this.gbl(bl+1) + 'return True' );         
    
    
    return cmd.join('\n');
};
/*----------------------------------------------------------------------------*/
Query.prototype.lookForEntityWithFunc = function(bl) {
    if (bl == undefined) {
        bl = 0;
    }   
    var cmd = [];
        
    cmd.push(this.gbl(bl) + 'def _lookForEntityWith(self,propName, propValue):');  
    cmd.push(this.gbl(bl+1) + 'objs = []');        
        
    var props = this.getNonAtomicArrayProperties();
    for (var i=0; i<props.length; i++) {
        var prop = props[i];
        cmd.push(this.gbl(bl+1) +'if (self.' + prop.name + ' != None): '); 
        cmd.push(this.gbl(bl+2) +	'for obj in self.' + prop.name + ':');   
        cmd.push(this.gbl(bl+3) +		'try: ');        
        cmd.push(this.gbl(bl+4) +			'if (reduce(getattr,propName.split("."), obj) == propValue): ');
        cmd.push(this.gbl(bl+5) +				'objs += [obj] '); 
        cmd.push(this.gbl(bl+3) +		'except err: ');    
        cmd.push(this.gbl(bl+4) +			'pass');                

    }
  
    cmd.push(this.gbl(bl+1) + 'return objs' );         
    
    
    return cmd.join('\n');
};
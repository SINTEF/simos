function cpath = makeClassPath(typeID, vers)

    types = strsplit(typeID, ':');
    
    cpaths = {};
    
    for i = 1:length(types)
        type = types{i};
        
        if isfield(vers,type)
            v = vers.(type);
        else
            v = '';
        end
        
        if strcmp(v,'') || isempty(v)
            cpaths{end+1} = type;
        else
            cpaths{end+1} = strjoin({type '_' v},'');
        end
    end
    
    cpath = strjoin(cpaths, '.');
end
%***********************************************************************

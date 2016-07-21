function out = hasfield(s,name)
% s: struct
% name : field name

    if any( strcmp(fieldnames(s), name) )
        out = true;
    else
        out = false;
    end
    
end


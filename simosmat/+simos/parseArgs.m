function options = parseArgs(args, allowed)
% args: list of nput arguments
% allowed : list of allowed names

    options = struct();
    
    %# count arguments
    nArgs = length(args);
    if round(nArgs/2)~=nArgs/2
       error('input arguments must be propertyName/propertyValue pairs')
    end
    
    for pair = reshape(args,2,[])
        pname = pair{1};
        pval = pair{2};
        if any(strcmp(pname, allowed))
            options.(pname) = pval;
        else
            error(sprintf('input "%s" is not allowed.\nAllowed fields are : \n"%s"',pname, strjoin(allowed,', ')) );
        end
    end

    
end


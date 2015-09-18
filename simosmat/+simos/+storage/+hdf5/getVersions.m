function vers = getVersions(filePath)
    %Return vertions
    %***********************************************************************
    vers = struct();
    
    info = h5info(filePath);
    
    packages = struct2cell(info.Attributes);
    pnames = packages(1,:);
    vals = packages(4,:);
    
    for i = 1:length(pnames)
        pname = pnames{i};
        vers.(pname) = char(vals{i});
    end
    
%***********************************************************************
end

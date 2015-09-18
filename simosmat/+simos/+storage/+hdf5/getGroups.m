function names = getGroups(filePath, grppath)
    %Return group names of the path
    %grppath: the point in hdf5 file path
    %**********************************************************************    
    if ~(exist('grppath','var'))
        grppath = '/'; 
    end 
    info = h5info(filePath,grppath);
    
    groups = struct2cell(info.Groups);
    names = groups(1,:);
    
%***********************************************************************
end

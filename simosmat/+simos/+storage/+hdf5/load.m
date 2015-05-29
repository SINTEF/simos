function objs = load(filePath)
    %Load HDF5 file into proper objects
    %***********************************************************************
    vers = simos.storage.hdf5.getVersions(filePath);
    groups = simos.storage.hdf5.getGroups(filePath);
    
    objs = cell(length(groups),1);
    
    for i = 1:length(groups)
        grp = groups{i};
        typeID = char(h5readatt(filePath, grp, 'type'));
        
        cpath = simos.makeClassPath(typeID, vers);
        
        obj = eval(cpath);
        obj.load('name',grp, 'filePath', filePath);
        objs{i} = obj;
    end
%***********************************************************************
end
%***********************************************************************


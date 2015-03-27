classdef Server
    %SERVER Summary of this class goes here
    %   Detailed explanation goes here
    %***********************************************************************
    properties
        filePath = ''
        handle = ''
        path = ''
    end %properties
    %***********************************************************************
    %***********************************************************************
    methods
    %-----------------------------------------------------------------------
    function OBJ = Server(filePath)
        if ~exist('filePath','var')
            filePath = '';
        end
        OBJ.filePath = filePath;
    end
    %-----------------------------------------------------------------------
    function initFile(OBJ)
        if (exist(OBJ.filePath,'file'))
        	delete(OBJ.filePath);
        end
        OBJ.handle = '';
        OBJ.path = '/';
        
        fileattrib(OBJ.filePath,'+w');
    end
    %-----------------------------------------------------------------------
    function write(OBJ, p, val, vtype)
        if (exist(OBJ.filePath,'file'))
            hdf5write(OBJ.filePath,OBJ.joinPath(OBJ.path,p) , val, 'WriteMode', 'append' );
        else
            hdf5write(OBJ.filePath,OBJ.joinPath(OBJ.path,p) , val);
        end
    end

    %-----------------------------------------------------------------------
    function writeAtt(OBJ, name, val, vtype)
        if (exist(OBJ.filePath,'file'))
            error([OBJ.filePath ' does not exist']);
        end
        
        h5writeatt(OBJ.filePath,OBJ.path,name , val);
    end
    %-----------------------------------------------------------------------
    function res = load(OBJ, name, vtype)
        res = h5read(OBJ.filePath, OBJ.joinPath(OBJ.path, name));
    end

    %-----------------------------------------------------------------------
    function res = loadAtt(OBJ, name, vtype)
        res = h5readatt(OBJ.filePath, OBJ.joinPath(OBJ.path), name);
    end
    %-----------------------------------------------------------------------
    function p = joinPath(OBJ, p1, p2)
        p = [p1 '/' p2];
    end
    %-----------------------------------------------------------------------
    end
    %***********************************************************************
%***********************************************************************
end


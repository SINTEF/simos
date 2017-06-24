
function catmanToSimos(varargin)
%
% translate bin files to hdf file,
% options and inputs:
%
%    Input pairs:
%          commands {'reader', 'filePath', 'outPath', 'outName', 'prefix'};
%    default values {'catread',        '',        '',        '',       ''};
%
%       reader   : reading method, the default is valid for most cases
%       filePath : the path to bin file
%       outName  : specific name for out put, the default results in bin
%                  file name with .h5 as extension
%       preFix   : prefix for the output file, 
%                  example: inp = '2000.bin', prefix='MT', out = 'MT2000.bin'
%   
%    Input Options:
%       swtiches {'importDetails','expTime'};
%       
%           expTime       : save time as explicit signal with each channel
%           importDetails : import bin file details such as control
%                           parameters
%    Example
%
%    simos.io.catman.catmanToCollection('filePath','CE2001.bin', 'expTime')
%

    diary 'catmanToSimos.log'
    
    inp = readInput(varargin);
    
    [fpath,fname,fext] = fileparts(inp.filePath);
    
    if (exist(inp.filePath, 'file'))
      % Print to screen:
      fprintf(1,' Loading %s  ...', inp.filePath);
    else
      error(' Test file not found: %s', inp.filePath);
    end

    caseName = [inp.prefix fname];
    casePath = fullfile(inp.outPath, [caseName '.h5']);
    
    if inp.expTime
        test = marmo_r1.modelTest.ExpTimeChannelCollection(caseName);
    else
        test = marmo_r1.modelTest.ChannelCollection(caseName);
    end
    
    % load data
    if strcmpi(inp.reader, 'catman_read') == 1
        [a1, a2]   = simos.io.catman.catman_read(inp.filePath);
    else
        [a1, a2]   = simos.io.catman.catread(inp.filePath);        
    end
    
    % write header data
    strNames = {'filename', 'comment'};
    for i = 1:length(strNames)
        sname = strNames{i};
        str = test.appendStrings(sname);
        str.value = char(getfield(a1,sname));
    end
    numNames = {'fileid','noofchan','mcl','redufact'};
    for i = 1:length(numNames)
        nname = numNames{i};
        num = test.appendNumbers(nname);
        num.value = getfield(a1,nname);
    end
    
    % write channel data
    n = size(a2,2);
    
    if inp.expTime
        if isempty(strfind(lower(a2(1,1).ChannelName), 'time'))
            error('First channel is not time... for %s. File not saved', test.name);
        end

        chtime = a2(1,1);
        for i = 2:n
            inch = a2(1,i);
            ch = test.appendChannels(inch.ChannelName);
            
            
            ch.xvalue = chtime.data;
            ch.xunit = chtime.Unit;
            ch.xname = 'time';
            ch.xlabel = 'time';
            ch.xdescription = 'time';
            
            ch.value = inch.data;              
            ch.unit = inch.Unit;
            ch.label = ch.name;
            ch.description = inch.comment;
            
            ch.legend = ch.name;
        end
    else
        for i = 1:n
            inch = a2(1,i);
            ch = test.appendChannels(inch.ChannelName);
            
            
            ch.xdelta = 1.0;
            ch.xstart = 0.0;
            ch.xunit = '';
            ch.xname = 'index';
            ch.xlabel = 'I';
            ch.xdescription = 'array Index';
            
            ch.value = inch.data;
            ch.unit = inch.Unit;
            ch.label = ch.name;
            ch.legend = ch.name;
            ch.description = inch.comment;
        end
    end
    
    if inp.importDetails
        for i = 1:n
            inch = a2(1,i);
            dch = test.appendChannelSpecs(inch.ChannelName);
            dch.number  = inch.Channelnumber;
            dch.unit    = inch.Unit;
            dch.comment = inch.comment;
            dch.format  = inch.format;
            dch.datawidth = inch.datawidth;
            dch.datumzeit = inch.datumzeit;
            dch.header  = inch.header;
            dch.linmode = inch.linmode;
            dch.userscale = inch.userscale;
            dch.DBSensorInfo  = inch.DBSensorInfo;
        end
    end
        
    test.save('filePath',casePath);
    fprintf(1,' %s is saved to %s !\n', test.name,casePath)

end

function inp=readInput(vars)
    vpairs = {'reader', 'filePath', 'outPath', 'outName', 'prefix'};
    vpairVals = {'catread', '','','',''};
    
    inp = struct();
    
    for i=1:length(vpairs)
        vname = vpairs{i};
        ind = find(ismember(vars,vname));
        if ~isempty(ind)
            inp.(vname)=vars{ind+1};
        else
            inp.(vname)= vpairVals{i};
        end
    end
    
    swtiches = {'importDetails','expTime'};
    switchesVals = {false,false};
    
    for i=1:length(swtiches)
        vname = swtiches{i};
        ind = ismember(vname, vars);
        if ind
            inp.(vname)=true;
        else
            inp.(vname)= switchesVals{i};
        end
    end    
end

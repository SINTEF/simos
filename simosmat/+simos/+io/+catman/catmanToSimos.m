
function catmanToSimos(varargin)
%
% translate bin files to hdf file,
% options and inputs:
%
%    Input pairs:
%          commands {'reader', 'filePath', 'outPath', 'outName', 'prefix', 'scale'};
%    default values {'catread',        '',        '',        '',       '',     1};
%
%       reader   : reading method, the default is valid for most cases
%       filePath : the path to bin file
%       outName  : specific name for out put, the default results in bin
%                  file name with .h5 as extension
%       preFix   : prefix for the output file, 
%                  example: inp = '2000.bin', prefix='MT', out = 'MT2000.bin'
%       scale    : to scale chennels
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
    if inp.expTime
        appendNonESChannels(a2, test, inp)
    else
        appendESChannels(a2, test, inp)
    end
    
    n = size(a2,2);
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
%-------------------------------------------------------------------------%
function appendNonESChannels(a2, test, inp)
    if isempty(strfind(lower(a2(1,1).ChannelName), 'time'))
        error('First channel is not time... for %s. File not saved', test.name);
    end
    n = size(a2,2);
    chtime = a2(1,1);
    for i = 2:n
        inch = a2(1,i);
        ch = test.appendChannels(inch.ChannelName);

        chTimeData = chtime.data;
        chTimeUnit = chtime.Unit;

        %if any(ismember(fieldnames(inch), 'dt'))  
        %    chTimeData =  (0:1:length(inch.data)-1) * inch.dt;
        %    chTimeUnit = 's';          
        %end

        ch.xvalue = chTimeData;
        ch.xunit = chTimeUnit;
        ch.xname = 'time';
        ch.xlabel = 'time';
        ch.xdescription = 'time';

        ch.value = inch.data;              
        ch.unit = inch.Unit;
        ch.label = ch.name;
        ch.description = inch.comment;

        ch.legend = ch.name;
    end
end
%-------------------------------------------------------------------------%
function appendESChannels(a2, test, inp)
    if isempty(strfind(lower(a2(1,1).ChannelName), 'time'))
        error('First channel is not time... for %s. File not saved', test.name);
    end
    n = size(a2,2);
    for i = 1:n
        inch = a2(1,i);
        ch = test.appendChannels(inch.ChannelName);

        ch.xdelta = 1.0;
        ch.xstart = 0.0;
        ch.xunit = '';
        ch.xname = 'index';
        ch.xlabel = 'I';
        ch.xdescription = 'array Index';

        if any(ismember(fieldnames(inch), 'dt')) 
            if int8(inch.dt) == inch.dt
                ch.xdelta = inch.dt/1000;
            else
                ch.xdelta = inch.dt;
            end
            ch.xstart = 0.0;
            ch.xunit = 's';
            ch.xname = 'time';
            ch.xlabel = 'time';
            ch.xdescription = 'time';
        end

        ch.value = inch.data;
        ch.unit = inch.Unit;
        ch.label = ch.name;
        ch.legend = ch.name;
        ch.description = inch.comment;

        if inp.scale ~= 1.0
            scaleESChannel(ch, inp.scale)
        end
    end
end
%-------------------------------------------------------------------------%
function scaleESChannel(ch, scale)
    c = getScaleFactor(ch.xunit, scale);
    if (c == -1)
        disp([ch.name ': unknown xunit ' ch.xunit])
    else
        ch.xdelta = c * ch.xdelta;
        ch.xstart = c * ch.xstart;
    end
    
    c = getScaleFactor(ch.unit, scale);
    if (c == -1)
        disp([ch.name ': unknown xunit ' ch.unit])
    else
        ch.value = c * ch.value;
    end    
end
%-------------------------------------------------------------------------%
function c = getScaleFactor(unit, scale)
    if strcmpi('m',unit) == 1
        c = scale;
    elseif strcmpi('s',unit) == 1
        c = scale^0.5;
    elseif strcmpi('m/s',unit) == 1
        c = scale^0.5;    
    elseif strcmpi('N',unit) == 1
        c = scale^3.0;     
    elseif strcmpi('1/m',unit) == 1
        c = 1.0/scale;      
    elseif strcmpi('1/s',unit) == 1
        c = 1.0/scale^0.5;    
    elseif strcmpi('_',unit) == 1    
        c = 1.0;  
    else
        c = -1.0;
    end
end
%-------------------------------------------------------------------------%
function inp=readInput(vars)
    vpairs = {'reader', 'filePath', 'outPath', 'outName', 'prefix', 'scale'};
    vpairVals = {'catread', '','','','', '1.0'};
    
    inp = struct();
    
    for i=1:length(vpairs)
        vname = vpairs{i};
        ind = find(ismember(vars,vname));
        if ~isempty(ind)
            val =vars{ind+1};
        else
            val= vpairVals{i};
        end
        
        [valNum, valStat] = str2num(val);
        if valStat == 1
            val = valNum;
        end
        
        inp.(vname) = val;
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


function catmanToSimos(varargin)
%
% translate bin files to hdf file,
% options and inputs:tim
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
%       channels : a list of channels to be exported, if chname not found _chname
%                  is exported instead
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
    
    % read headers
    [a1, a2Head]   = eval([inp.reader '(inp.filePath,[])']);
    
    % write header data
    strNames = {'filename', 'comment'};
    for i = 1:length(strNames)
        sname = strNames{i};
        str = test.appendStrings(sname);
        str.value = char(getfield(a1,sname));
    end
    %numNames = {'fileid','noofchan','mcl','redufact'};
    %for i = 1:length(numNames)
    %    nname = numNames{i};
    %    num = test.appendNumbers(nname);
    %    num.value = getfield(a1,nname);
    %end
    
    %reading channels data
    [a2time, a2] = getChannels(inp, a2Head);

    % write channel data    
    if inp.expTime
        appendNonESChannels(a2, a2time, test, inp)
    else
        appendESChannels(a2, a2time, test, inp)
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
        
    test.save(casePath);
    fprintf(1,' %s is saved to %s !\n', test.name,casePath)

end
%-------------------------------------------------------------------------%
function appendNonESChannels(a2, a2time, test, inp)
    n = size(a2,2);
    
    for i = 2:n
        inch = a2(1,i);
        
        chName = strtrim(inch.ChannelName);
        
        ch = test.appendChannels(chName);
        
        chtime = a2time(1,inch.what_time);
        
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
function [a2time, a2] = getChannels(inp, a2Head)
    
    if strcmpi(inp.channels, 'all')
        [~, a2]   = eval([inp.reader '(inp.filePath)']);
    else
        a2 = selectChannels(a2Head,inp.channels,inp);      
    end
    
    try
        a2Head = timsas_r1.tools.a2whatTime(a2Head);
        timeSrc = 1;
    catch
        disp('No timsas_r1.tools.a2whatTime, using first channel as time.');
        if isempty(strfind(lower(a2Head(1,1).ChannelName), 'time'))
            error('First channel is not time... for %s. File not saved', test.name);
        end
        timeSrc = 0;
    end
    a2time = struct(a2Head(1));

    timeChInds = [];
    chNums = [a2Head.Channelnumber];
    if timeSrc == 1
        selChNums = [a2.Channelnumber];
        for schInd = 1:length(selChNums)
            schNum = selChNums(schInd);
            headCHInd = find(schNum == chNums);
            headCH = a2Head(headCHInd);
            
            
            %get the time channel for headCH, i.e. selCh
            if  (headCH.what_time ~= 0) && ~(isempty(headCH.what_time))
                chTime = a2Head(1, headCH.what_time);
                
                if length(timeChInds) == 0
                    a2time(1) = chTime;
                    timeChInds(end+1) = headCH.what_time;
                else
                    if isempty(find([a2time.Channelnumber] == chTime.Channelnumber))
                        a2time(end+1) = chTime;
                        timeChInds(end+1) = headCH.what_time;
                    end
                end
                
                a2(schInd).what_time = length(a2time);
                
            end
        end
        
        [~,a2timeAll] = eval([inp.reader '(inp.filePath,timeChInds)']);
        a2time = struct(a2timeAll(timeChInds(1)));
        for i = timeChInds(2:end)
            a2time(end+1) = a2timeAll(i);
        end
    
    elseif timeSrc == 0    
        error ('todo later');    
    end

end

%-------------------------------------------------------------------------%
function a2Sel = selectChannels(a2Head, channelNames, inp)
    
    N = length(a2Head);
    chnames = cell(1,N);
    chnums = [a2Head.Channelnumber];
    
    %inds = zeros(1,length(channelNames));
    inds = [];
    
    for i = 1:N
        chnames{i} = strtrim(a2Head(i).ChannelName);
    end
    
    renameChannels = 0;
    newChannelNames = {};
    if iscell(inp.newChannelNames)
        renameChannels = 1;
    end
        
    for chi = 1:length(channelNames)
        ch = channelNames{chi};
        res = find(strcmp(chnames,ch));
        if isempty(res)
            res = find(strcmp(chnames,['_' ch]));
        end
        
        if isempty(res)
            disp(['channel "', ch , '" not found.']);
            continue;
        end
        
        if length(res)>1
            res = res(1);
        end
        
        inds(end+1) = res;
        if (renameChannels==1)
            newChannelNames{end+1} = inp.newChannelNames{chi};
        end
        
    end


        
    [~,a2] = eval([inp.reader '(inp.filePath,inds)']);
        
    a2Sel = struct(a2(inds(1)));
    for i = inds(2:end)
        a2Sel(end+1) = a2(i);
    end
    
    if (renameChannels==1)
        for i = 1:length(a2Sel)
            a2Sel(i).ChannelName = newChannelNames{i};
        end
    end
end
%-------------------------------------------------------------------------%
function appendESChannels(a2, a2time, test, inp)
    
    n = size(a2,2);
    for i = 1:n
        inch = a2(1,i);
        
        chName = strtrim(inch.ChannelName);
        
        ch = test.appendChannels(chName);

        ch.xdelta = 1.0;
        ch.xstart = 0.0;
        ch.xunit = '';
        ch.xname = 'index';
        ch.xlabel = 'I';
        ch.xdescription = 'array Index';

        %if any(ismember(fieldnames(inch), 'dt')) 
        %    if int8(inch.dt) == inch.dt
        %        ch.xdelta = inch.dt/1000;
        %    else
        %        ch.xdelta = inch.dt;
        %    end
        %    ch.xstart = 0.0;
        %    ch.xunit = 's';
        %    ch.xname = 'time';
        %    ch.xlabel = 'time';
        %    ch.xdescription = 'time';
        %end

        tol = 10^-1;
        chtime = a2time(1,inch.what_time);
        sampling = 1.0/chtime.dt * 1000;
        if abs(round(sampling)- sampling)<tol
            ch.xdelta = chtime.dt/1000;
        else
            ch.xdelta = chtime.dt;
        end 

        ch.xstart = chtime.data(1);
        ch.xunit = 's';
        ch.xname = 'time';
        ch.xlabel = 'time';
        ch.xdescription = 'time';            
        
        ch.value = inch.data;
        ch.unit = strtrim(inch.Unit);
        ch.label = strtrim(ch.name);
        ch.legend = strtrim(ch.name);
        ch.description = strtrim(inch.comment);

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
        disp([ch.name ': unknown unit ' ch.unit])
    else
        ch.value = c * ch.value;
    end    
end
%-------------------------------------------------------------------------%
function c = getScaleFactor(unit, scale)
    if strcmpi('m',unit) == 1
        c = scale;
    elseif strcmpi('deg',unit) == 1
        c = 1.0;        
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
    vpairs = {'reader', 'filePath', 'outPath', 'outName', 'prefix', 'scale', 'channels', 'newChannelNames'};
    numsFlag =    [0,       0,          0,          0,        0,        1,        0,       0];
    vpairVals = {'simos.io.catman.catread', '','','','', '1.0', 'all', 'none'};
    
    inp = struct();
    
    for i=1:length(vpairs)
        vname = vpairs{i};
        ind = find(strcmp(vars,vname));
        if ~isempty(ind)
            val =vars{ind+1};
        else
            val= vpairVals{i};
        end
        
        if numsFlag(i) == 1
            val = str2num(val);
        end
        
        inp.(vname) = val;
    end
    
    swtiches = {'importDetails','expTime'};
    switchesVals = {false,false};
    
    for i=1:length(swtiches)
        vname = swtiches{i};
        ind = find(strcmp(vname, vars));
        if ind
            inp.(vname)=true;
        else
            inp.(vname)= switchesVals{i};
        end
    end    
end

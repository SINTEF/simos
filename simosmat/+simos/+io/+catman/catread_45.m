function [a1,a2]=catread_45(file,sdr,machinefmt)
% CATMAN_READ
%               [a1,a2]=catman_read([file,ot]);
%
%               OPTIONAL:
% 2009-02-11:   sdr  s_kip d_ata r_ead
%                    will give an offset table as output instead of the
%                    complete data-sets. For large files this can be
%                    time-saving. If omitted the complted data-sets will be
%                    given in addition to the offset-table.
%
%
%               The input argument file is optional. It contains the
%               complete filename of the binary catman data file.
%               If the input argument is missing, the File Open GUI
%               appears in order to load files with extension BIN.
%
%               ONLY CATMAN 4.5 and CATMAN 5.0 is supported !!!
%               The catman online data format is not supported.
%
%               The result of reading can be found in the structured
%               variables a1 and a2.
%
%               CATMAN is a software family for DAQ purposes. It is
%               optimized for DAQ with the amplifier systems MGCplus,
%               MGCsplit and Spider8 of the company HBM GmbH
%               (Hottinger Baldwin Messtechnik GmbH).
%               see also: http://www.hbm.com
%               Especially the software catman easy enables the fast and
%               easy measurement with HBM hardware like Spider8 and
%               MGCplus. Basis is TEDS based upon IEEE1451.4. Now you can
%               direct import catman datafiles into MatLab
%
%               Fields in a1 (Content of Global Section):
%               -----------------------------------------
%               filename
%               fileid          -   Must be greater than 5010 !
%               dataoffset      -   there, the raw data is contained
%               comment         -   The channel comment itself
%               ReservedSTR     -   the reserved strings      (catman 5.0)
%               noofchan        -   Number of channels
%               mcl:            -   max. channel length
%               redufact        -   reduction factor
%
%               Fields in a2 (Channel Header section + Data area)
%               -------------------------------------------------
%
%               Channelnumber   -   catman database channel
%               ChannelLength   -   no. of values in the DB channel
%               ChannelName     -   Name of the DB channel
%               Unit
%               comment
%               format          -   0=numeric, 1=String, 2=Binary Object
%               datawidth       -   numeric = 8, string >= 8
%               datumzeit       -   Date/Time of measurement
%               header          -   Traceability data, must be decoded
%               linmode         -   Linearization Mode
%               userscale
%               DBSensorInfo
%               T0              -   ACQ timestamp info (NOW format)
%               dt              -   ACQ delta t in ms
%               data            -   The REAL content of the database
%               CursorPos       -   Position in the binary-file (byte)
%                                   where the data-set starts
%
%       Questions ?
%       Dr. Andreas Geissler, HBM GmbH  (http://www.hbm.com)
%       andreas.geissler@hbm.com
%       BOB 2006-08-31: Added T0 and dt to a2 data structure
%       BOB 2007-10-30: Added extra info to data structure
%                       from datastructure.
%       CPa 2008-12-04: Added more extra info to data structure
%                       from datastructure.
%       CPa 2008-12-04: Do not read the whole data, instead set up a
%                       offset table which gives the position of the
%                       beginning of the file
%       BOB 2009-02-11: Read offset table as an option to the input,
%                       ensures backward compatibility
%       SSP 2011-03-30: variable dataoffset (line 111) is now used due to
%                       introduction of gap in bin file between header
%                       section and data section of bin file in Catman
%                       Enterprise 5.0R8. Backwards compatible with older
%                       versions.
%       LSA 2015-11-12: Now reads the entire channel extended header, so
%                       that catmanwrite can be used.
%       BOB 2018-05-03: New format from catmanwrite which adds dummy
%                       channels to the header with the purpose of adding
%                       dummy channels to the header so that new data can
%                       be added to the end of the file without re-writing
%                       the entire file. Number of dummy channels is stored
%                       in the mcl-property (maximum channel length) and
%                       added to the a1-structure as a1.noofdummychan, i.e.
%                       the a1.structure does not contain a1.mcl. Due to
%                       this new feature fseek is used to jump to data
%                       section to speed up reading.
%       BOB 2018-05-25: New format from catmanwrite which adds dummy is now
%                       backward compatible with earlier versions of
%                       catread.

a1=[]; a2=[];
if nargout==0,      % Return, if there is no output argument
    disp('[a1 a2] is required as output...')
    return;
end
if nargin==0,
    [fn,pn]=uigetfile('*.bin','Open catman binary file');
    if fn==0,
        return;
    else
        file=[pn,fn];
    end
end

if nargin<3
    
    machinefmt = 'l';
end

if nargin <2
    
    sdr = 'all';
    
end



if exist(file)==0,
    disp(['File "',file,'" does not exist !']);
    return;
end
fid=fopen(file,'rb');

% READING GLOBAL SECTION
% ----------------------

fileid=fread(fid,1,'short',machinefmt);
fileidIn=fileid;

madeByCatman=1;
if fileid == 1123 || fileid == 1124
    
    %disp(['you are reading a MARINTEK bin file,' ...
    %    'the ID will be changed to 5012 for reading it']);
    
    fileid = 5012; % 1123 is 5012 generated by catmanwrite
    madeByCatman=0;
end

if fileid<5010,
    disp('supported catman version: 4.5 or higher !');
    return
    
end
a1.filename=file;       % File Identifier: Must be greater equal
a1.fileid=fileid;       % 5010 to proceed on.

dataoffset=fread(fid,1,'long',machinefmt); % Offset in Byte from start of file for Data Area

Lcomment=fread(fid,1,'short',machinefmt);  % Length of file comment
a1.Lcomment = Lcomment;
a1.comment = fread(fid,[1,Lcomment],'*char',machinefmt);

% comment=fread(fid,[1,Lcomment],'char');
% a1.comment=setstr(comment);

if fileid==5010,
    noofchan=fread(fid,1,'short',machinefmt);  % no. of channels
    a1.noofchan=noofchan;
    
    mcl=fread(fid,1,'long',machinefmt);        % max. channel length, normally=0,
    a1.mcl=mcl;                     % used for special append mode
    
    offsetchannel=fread(fid,[1,noofchan],'long',machinefmt);
    %a1.offsetchannel=offsetchannel;
    
    redufact=fread(fid,1,'long',machinefmt); % Reduction factor, normally =0,
    a1.redufact=redufact;           % used for file compression
end
if fileid>=5011,                    % Read catman 5.0 format
    Lres=zeros(1,32);
    ReservedString=32 .*ones(32,256);
    
    for p=1:1:32,
        Lresakt=fread(fid,1,'short',machinefmt);
        Lres(p)=Lresakt;
        restring=setstr(fread(fid,[1,Lresakt],'char',machinefmt));
        if length(restring)>256,
            restring=restring(1:256);
            Lresakt=256;
        end
        ReservedString(p,1:Lresakt)=restring;
    end
    a1.ReservedSTR=setstr(ReservedString);
    
    noofchan=fread(fid,1,'short',machinefmt);  % no. of channels
    a1.noofchan=noofchan;

    noofdummychan=0;
    mcl=fread(fid,1,'long',machinefmt);        % max. channel length, normally=0,
    if madeByCatman
        a1.mcl=mcl;                     % used for special append mode
    else 
        % fileidIn>=1123
        noofdummychan=mcl;
        a1.noofdummychan=noofdummychan;
    end    
    
    if fileidIn==1123 && noofdummychan>0
        offsetchannel=fread(fid,[1,noofchan+noofdummychan],'long',machinefmt);
    else
        offsetchannel=fread(fid,[1,noofchan],'long',machinefmt);
    end
    %a1.offsetchannel=offsetchannel;
    
    redufact=fread(fid,1,'long');   % Reduction factor, normally =0,
    a1.redufact=redufact;           % used for file compression
end

if nargout==1,
    return;
end

% READ CHANNEL HEADER SECTION
% ---------------------------
CHINFO=[];
noOfChsToRead=noofchan-noofdummychan;
[~,fn]=fileparts(file);
if fileidIn==1123 && length(fn)>=7 && strcmpi(fn(1:7),'TestRun')
    noOfChsToRead=noofchan;
elseif noOfChsToRead<0 && fileidIn==1123
    noOfChsToRead=noofchan;
end
%Debug-print:
%fprintf('%-30s, Id: %d, nch: %5d, ndum: %5d, nchToRead %5d\n',file,fileidIn,noofchan,noofdummychan,noOfChsToRead)
for p=1:1:noOfChsToRead,
    
    chaninfo.Channelnumber=fread(fid,1,'short',machinefmt);    % Channel location in catman database
    chaninfo.ChannelLength=fread(fid,1,'long',machinefmt);
    LChanName=fread(fid,1,'short',machinefmt);                 % Length of channel name
    if LChanName>0,
        chaninfo.ChannelName=setstr(fread(fid,[1,LChanName],'char',machinefmt));
    else
        chaninfo.ChannelName='';
    end
    LunitName=fread(fid,1,'short',machinefmt);                 % Unit of the channel
    if LunitName>0,
        chaninfo.Unit=setstr(fread(fid,[1,LunitName],'char',machinefmt));
    else
        chaninfo.Unit='';
    end
    Lchcom=fread(fid,1,'short');                    % channel comment
    if Lchcom>0
        chaninfo.comment=setstr(fread(fid,[1,Lchcom],'char',machinefmt));
    else
        chaninfo.comment='';
    end
    
    chaninfo.format=fread(fid,1,'short',machinefmt);           % Channel format:
    % 0=numeric, 1=String, 2=Binary Object
    chaninfo.datawidth=fread(fid,1,'short',machinefmt);        % numeric = 8, string >= 8
    chaninfo.datumzeit=fread(fid,1,'double',machinefmt);      % Date and Time of measurement
    extendedsize=fread(fid,1,'long',machinefmt);              % Size of extended channel header
    p1 = ftell(fid);
    if extendedsize>0,
        %BOB:chaninfo.header=setstr(fread(fid,[1,extendedsize],'char'));
        %BOB: read T0 and dt
        %BOB: 2007-10-30 - add more info copy paste fra "catmanBinaryFormat.xls"
        %          T0 As Double                         'ACQ timestamp info (NOW format)
        %          dt As Double                         'ACQ delta t in ms
        %          SensorType As Integer                'IDS code of sensor type
        %          SupplyVoltage As Integer             'IDS code supply voltage
        %          FiltChar As Integer                  'IDS code of filter characteristics
        %          FiltFreq As Integer                  'IDS code of filter frequency
        %          TareVal As Single                    'Current value in tare buffer
        %          ZeroVal As Single                    'Current value in zero adjustment buffer
        %          MeasRange As Single                  'IDS code of measuring range
        %          InChar(3) As Single                  'Input characteristics (0=x1,1=y1,2=x2,3=y2)
        %          SerNo As String * 32                 'Amplifier serial number
        %          PhysUnit As String * 8               'Physical unit (if user scaling in effect, this is the user unit!)
        %          NativeUnit As String * 8             'Native unit
        %          Slot As Integer                      'Hardware slot number
        %          SubSlot As Integer                   'Sub-channel, 0 if single channel slot
        %          AmpType As Integer                   'IDS code of amplifier type
        %          APType As Integer                    'IDS code of AP connector type (MGCplus only)
        %          kFactor As Single                    'Gage factor used in strain gage measurements
        %          bFactor As Single                    'Bridge factor used in strain gage measurements
        %          MeasSig As Integer                   'IDS code of measurement signal (e.g. GROSS, NET) (MGCplus only)
        %          AmpInput As Integer                  'IDS code of amplifier input (ZERO,CAL,MEAS)
        %          HPFilt As Integer                    'IDS code of highpass filter
        %          OLImportInfo As Byte                 'Special information used in online export file headers
        %          ScaleType As Byte                    '0=Engineering units, 1=Electrical
        %          SoftwareTareVal As Single            'Software tare (zero) for channels carrying a user scale
        %          WriteProtected As Byte               'If true, write access is denied
        %          NominalRange As Single               'CAV value
        %          Reserve As String * 15
        nfloat32=0; bytefloat32=4;
        ndouble=0;  bytedouble=8;
        ninteger=0; byteinteger=2;
        %
        chaninfo.T0=fread(fid,1,'double',machinefmt);
        ndouble=ndouble+1;
        %
        chaninfo.dt=fread(fid,1,'double',machinefmt);
        ndouble=ndouble+1;
        %
        chaninfo.SensorType=fread(fid,1,'uint16',machinefmt);
        ninteger=ninteger+1;
        %
        chaninfo.SupplyVoltage=fread(fid,1,'uint16',machinefmt);
        ninteger=ninteger+1;
        %
        chaninfo.FiltChar=fread(fid,1,'uint16',machinefmt);
        ninteger=ninteger+1;
        %
        chaninfo.FiltFreq=fread(fid,1,'uint16',machinefmt);
        ninteger=ninteger+1;
        %
        chaninfo.TareVal=fread(fid,1,'float32',machinefmt);
        nfloat32=nfloat32+1;
        %
        chaninfo.ZeroVal=fread(fid,1,'float32',machinefmt);
        nfloat32=nfloat32+1;
        %
        chaninfo.MeasRange=fread(fid,1,'float32',machinefmt);
        nfloat32=nfloat32+1;
        %
        chaninfo.InChar=fread(fid,4,'float32',machinefmt);
        nfloat32=nfloat32+4;
        %
        % Skip the rest of the "extended channel header".
        %         skipsize=extendedsize-(nfloat32*bytefloat32)-...
        %             (ndouble*bytedouble)-(ninteger*byteinteger);
        %chaninfo.header=setstr(fread(fid,[1,skipsize],'char'));
        
        %char(fread(fid,[1,extendedsize],'char'))
        fseek(fid,p1,'bof');
        chaninfo.header=fread(fid,[1,extendedsize],'*char',machinefmt);
    else
        chaninfo.header='';
    end
    chaninfo.linmode=fread(fid,1,'uint8',machinefmt);           % Linearization Mode
    chaninfo.userscale=fread(fid,1,'uint8',machinefmt);
    npoi=fread(fid,1,'uint8',machinefmt);                      % Number of points for user scale lin.
    TP = fread(fid,[1,npoi],'double',machinefmt);                   % The points
    TT = fread(fid,1,'short',machinefmt);                           % Thermo Type
    Lf=fread(fid,1,'short',machinefmt);                        % Length of formula
    if Lf>0,
        formula=setstr(fread(fid,[1,Lf],'char',machinefmt));
    end
    if fileid>=5012,
        SoDBinfo=fread(fid,1,'long',machinefmt);  % Size of DBSensorInfo
        if SoDBinfo>0,
            chaninfo.DBSensorInfo=fread(fid,[1,SoDBinfo],'*char',machinefmt);
        end
    end
    
    CHINFO=[CHINFO,chaninfo];
end

%discard space between header section and data section
%p2 = ftell(fid);
%fread(fid,dataoffset-ftell(fid));
fseek(fid,dataoffset,'bof');
%p3 = ftell(fid);


if strcmpi('all',sdr)
    
    offset = ftell(fid);
    for p=1:1:noOfChsToRead,
        lakt=CHINFO(p).ChannelLength;
        if lakt>0,
            dataakt=fread(fid,[1,lakt],'double',machinefmt);
            CHINFO(p).CursorPos = offset;
            offset              = offset + lakt*bytedouble;
        else
            dataakt=[];
            CHINFO(p).CursorPos = [];
        end
        CHINFO(p).data=dataakt;
    end
    
elseif isempty(sdr)
    
    offset = ftell(fid);
    for p=1:1:noOfChsToRead,
        lakt=CHINFO(p).ChannelLength;
        if lakt>0,
            CHINFO(p).CursorPos = offset;
            offset              = offset + lakt*bytedouble;
        else
            CHINFO(p).CursorPos = [];
        end
        CHINFO(p).data=[];
    end
    
    
else
    
    offset = ftell(fid);
    for p=1:1:noOfChsToRead
        
        lakt=CHINFO(p).ChannelLength;
        fseek(fid,offset,'bof');
        if lakt>0
            if ~isempty(find(p==sdr, 1))
%                 disp(['reading channel ' num2str(p)]);
                dataakt=fread(fid,[1,lakt],'double',machinefmt);
            else
%                 disp(['skipping channel ' num2str(p)]);
                dataakt = [];
            end
            CHINFO(p).CursorPos = offset;
            offset              = offset + lakt*bytedouble;
        else
            dataakt=[];
            CHINFO(p).CursorPos = [];
        end
        CHINFO(p).data=dataakt;
    end
end
a2=CHINFO;
fclose(fid);
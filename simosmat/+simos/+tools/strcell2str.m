function out = strcell2str(c)
% Receievs a cell array os strings and create the string representation for
% that. 
% Only support up to two dimensions for now
% Does not support speacial characters

    str = '{';
    for i = 1:size(c,1)
        str = [str '''' strjoin(c(i,:),''',''') ''';'];
    end
    if (str(end) == ';')
        str(end) = '}';
    else
        str(end+1) = '}';
    end
    
    out = str;
end


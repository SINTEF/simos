function out = findEntity(list,name)
%FINDENTITY Summary of this function goes here
%   Detailed explanation goes here

    for i = 1:length(list)
        if strcmp(list{i}.name, name) == 1
            out = list{i};
            return;
        end
    end
    disp([name ' not found.']);
    out = -1;
    
end


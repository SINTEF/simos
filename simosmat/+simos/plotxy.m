function plotxy(varargin)
% plot xy arrays
    allowedParams = {'hold'};
    
    xy = varargin{1};
    
    
    varargin(1) = [];
    options = simos.parseArgs(varargin,allowedParams);
    
    if iscell(xy) == 1
        plotArrs(xy, options)
    else
        plotArr(xy, options)
    end
    
end
%%-----------------------------------------------------------------------%%
function plotArr(xy, options)
    if ~(simos.hasField(options,'hold')) 
        figure
    end
    
    hold on
    
    plot(xy.xvalue, xy.value);
    
    %title('2-D Line Plot')
    lab = makeXLabel(xy);
    h = xlabel(lab);
    if ~isempty(find(lab=='$',1))
        set(h,'Interpreter','latex')
    end
    
    lab = makeYLabel(xy);
    h = ylabel(lab);
    if ~isempty(find(lab=='$',1))
        set(h,'Interpreter','latex')
    end
        
    if ~strcmp(xy.legend, '')
        legend(xy.legend)
    end
    
    hold off
end

%%-----------------------------------------------------------------------%%
function lab = makeXLabel(xy)
    lab = xy.xlabel;
    if strcmp(lab, '')
        lab = xy.xname;
    end
    
    if ~strcmp(xy.xunit, '')
        lab = [lab ' [' xy.xunit ']' ];
    end
end
function lab = makeYLabel(xy)
    lab = xy.label;
    if strcmp(lab, '')
        lab = xy.name;
    end
    
    if ~strcmp(xy.unit, '')
        lab = [lab ' [' xy.unit ']' ];
    end
end
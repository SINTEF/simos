import h5py 
import collections

#-----------------------------------------------------------------------------#
def readHDF5PathsToFlatDict(fileName):
    f = h5py.File(fileName,'r')

    fileInfo = collections.OrderedDict()
    
    def visitAllObjects(group,path):
        for i in list(group.items()):
            if isinstance(i[1],h5py.Group):
                visitAllObjects(i[1],path + '/' + i[0])
            else:
                datasetName = path + '/' + i[0]
                fileInfo[datasetName] = (group[datasetName].shape, 
                                         group[datasetName].dtype)
                           
    visitAllObjects(f,'')
    f.close()
    return fileInfo
#-----------------------------------------------------------------------------#    
def mergeData(fileIn):
    data = readHDF5PathsToFlatDict(fileIn)
    f = h5py.File(fileIn,'r')
    
    labels = []
    for key in list(data.keys()):
        #print key + "   " + str(f[key].value)
        label = key.split('/')[-1]
        if not(label in labels):
            labels.append(label)
            
    arrays = []
    for label in labels:
        arrays.append([])
        for key in list(data.keys()):
            if (label == key.split('/')[-1]):
                arrays[-1].append(f[key].value[0])

    f.close()
    
    return labels,arrays
#-----------------------------------------------------------------------------#
def hdf5ToDict(fileName):
        
    f = h5py.File(fileName,'r')
    data = collections.OrderedDict()
    
    def loadHDF5(group,datain):
        for key,val in group.items():
            if isinstance(val,h5py.Group):
                datain[key] = collections.OrderedDict()
                loadHDF5(val,datain[key])
            else:
                #this is for current state of SIMA hdf files, maybe it will be changed later.
                if len(val.shape) == 1:
                    if val.shape[0] == 1:
                        datain[key] = val.value[0]
                    else:
                        datain[key] = val.value
                elif len(val.shape) == 2:
                    if val.shape[0] == 1 and val.shape[1] == 1:
                        datain[key] = val.value[0][0]
                    elif val.shape[0] == 1:
                        datain[key] = val.value[0]
                    else:
                        datain[key] = val.value
                else:
                    datain[key] = val.value

          
    loadHDF5(f,data)                 
    f.close()
    return data

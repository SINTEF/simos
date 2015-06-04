#loads data models
import os

from .hdf5 import load as loadHDF5
from .json import load as loadJSON
from .xml import load as loadXML


#-----------------------------------------------------------------------------#
def load(filePath, type=None):
    fileName = filePath.split(os.path.sep)[-1]
    
    if type == None:
        type = findDataType(fileName)
    
    if (type.lower() == 'h5'):
        return loadHDF5(filePath)
    elif (type.lower() == 'json'):
        return loadJSON(filePath)
    elif (type.lower() == 'xml'):
        return loadXML(filePath)
    else:
        raise Exception("file type %s is not known for %s."%(type, filePath))
    
#-----------------------------------------------------------------------------#
def findDataType(fileName):
    return fileName.split('.')[-1]

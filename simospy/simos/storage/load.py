#loads data models
import os

from .hdf5 import load as loadHDF5
from .json import load as loadJSON
from .xml import load as loadXML


#-----------------------------------------------------------------------------#
def load(filePath, rootPath=None, dataType=None, fileType=None):
    fileName = filePath.split(os.path.sep)[-1]
    
    if fileType == None:
        fileType = findDataType(fileName)
    
    if (fileType == 'h5'):
        return loadHDF5(filePath, rootPath=rootPath, dataType=dataType)
    elif (fileType == 'json'):
        return loadJSON(filePath, rootPath=rootPath, dataType=dataType)
    elif (fileType == 'xml'):
        return loadXML(filePath, rootPath=rootPath, dataType=dataType)
    else:
        print("fileName : %s"%fileName)
        raise Exception("file type %s is not known for %s."%(fileType, filePath))
    
#-----------------------------------------------------------------------------#
def findDataType(fileName):
    return fileName.split('.')[-1].lower()

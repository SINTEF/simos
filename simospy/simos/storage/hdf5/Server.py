import h5py
import os
import json
import collections

    
class Server(object):
    
    def __init__(self, filePath=None):
        self.filePath = filePath
        self._handle = None
        self._path = '/'
        
    def openWrite(self,filePath=None):
        if not(filePath == None):
            self.filePath = filePath
            
        if self.filePath == None:
            raise Exception("file path is not defined. ")
        
        """ read and write is exist, create otherwise"""
        self._handle = h5py.File(self.filePath,'w')
        
    def openRead(self,filePath=None):
        if not(filePath == None):
            self.filePath = filePath
            
        if self.filePath == None:
            raise Exception("file path is not defined. ")
        
        """ read and write is exist, create otherwise"""
        self._handle = h5py.File(self.filePath,'r')
    #--------------------------------------------------------------------------#
    def __repr__(self):
        rep = collections.OrderedDict()
        rep["__type__"] = str(type(self))
        rep["backEnd"] = self.backEnd
        rep["filePath"] = self.filePath
        rep["path"] = self.path
        rep["isConnected"] = self.isConnected()
        rep["isOpen"] = self.isOpen()
        
        return ( json.dumps(rep, indent=4, separators=(',', ': ')) )
    #--------------------------------------------------------------------------#
    @property
    def handle(self):
        return self._handle

    @handle.setter
    def handle(self, h):
        self._handle = h

    @property
    def path(self):
        return self._path

    @path.setter
    def path(self, h):
        self._path = h

    @property
    def data(self):
        try:
            item = self.handle[self.path]
        except:
            item = None
        return item

    @property
    def backEnd(self):
        return "hdf5"

    def isOpen(self):
        if (self.handle == None) or ("Closed HDF5 file" in str(self.handle)):
            return False
        else:
            return True

    def isConnected(self):
        if self.filePath == None:
            return False
        elif os.path.isfile(self.filePath):
            return True
        else:
            return False
        
    def appendPath(self, item):
        if self.path[-1] == '/':
            self._path = self._path + item
        else:
            self._path = self._path + '/' + item
                        
    def close(self):
        if self.isOpen():
            self._handle.close()
        self._handle = None
        
    
    def clone(self):
        n = Server(self.filePath)
        n.handle = None
        n.path = self.path
        n.filePath = self.filePath
        
        return n
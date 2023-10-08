""" This an autogenerated file using simosjs.generator
    Please do not edit
    Babak Ommani, Offshore Hydrodynamic, MARINTEK """

## platform for opc
## Generated with Platform

#------------------------------------------------------------------------------
#modules
#importing general modules
from fnmatch import fnmatch
import numpy as np
import os
import warnings
import traceback
import collections
import uuid
import simos.storage as pyds
try:
    import json
except:
    print("WARNING: json is not installed.")
try:
    import h5py
except:
    print("WARNING: h5py is not installed.")
#importing extended types
#------------------------------------------------------------------------------
#@@@@@ USER DEFINED IMPORTS START @@@@@
#@@@@@ USER DEFINED IMPORTS End   @@@@@
#------------------------------------------------------------------------------

#******************************************************************************
class Platform(object):
    #---------------------------------------------------------------------------
    def __init__(self,name=None):
        self.MODEL = {"name":"Platform","description":"platform for opc","extends":[],"properties":[{"name":"name","type":"string","description":"name of the platform","value":"platform","contained":True,"optional":False},{"name":"description","type":"string","description":"platform description","value":"","contained":True,"optional":False},{"name":"type","type":"string","contained":True,"optional":False},{"name":"tag_pi","type":"string","description":"tag in pi","value":"","contained":True,"optional":False},{"name":"tag_opc","type":"string","description":"tag in opc on board","value":"","contained":True,"optional":False},{"name":"signals","type":"myPack:Signal","description":"signals","dim":"*","contained":True,"optional":False}],"type":"myPack:Platform","package":"myPack","__versions__":{"myPack":""}}
        self.ID = str(uuid.uuid4())
        self._saved = {}
        self.REF = None
        self._sync = {}
        self._STORAGE = None
        self._loadedItems = []
        self._name=str("platform")
        if not(name == None):
            self._name = name 
        self.MODELname = {"name":"name","type":"string","description":"name of the platform","value":"platform","contained":True,"optional":False}
        
        self._description= self._getInitValueDescription()
        self.MODELdescription = {"name":"description","type":"string","description":"platform description","value":"","contained":True,"optional":False}
        
        self._type= self._getInitValueType()
        self.MODELtype = {"name":"type","type":"string","contained":True,"optional":False}
        
        self._tag_pi= self._getInitValueTag_pi()
        self.MODELtag_pi = {"name":"tag_pi","type":"string","description":"tag in pi","value":"","contained":True,"optional":False}
        
        self._tag_opc= self._getInitValueTag_opc()
        self.MODELtag_opc = {"name":"tag_opc","type":"string","description":"tag in opc on board","value":"","contained":True,"optional":False}
        
        self._signals= self._getInitValueSignals()
        self.MODELsignals = {"name":"signals","type":"myPack:Signal","description":"signals","dim":"*","contained":True,"optional":False}
        
        self.OBJattrs = collections.OrderedDict()
        self._ungroupTypes = [""]
#------------------------------------------------------------------------------
#@@@@@ USER DEFINED PROPERTIES START @@@@@
#@@@@@ USER DEFINED PROPERTIES End   @@@@@
#------------------------------------------------------------------------------
#------------------------------------------------------------------------------
#@@@@@ USER DEFINED METHODS START @@@@@
#@@@@@ USER DEFINED METHODS End   @@@@@
#------------------------------------------------------------------------------
    #---------------------------------------------------------------------------
    #creating set and gets
    #----------------------------------------------------------------------
    @ property
    def name(self):
        return self._name
    #----------------------------------------------------------------------
    @ name.setter
    def name(self, val):
        self._name = str(val)
        if not("name" in self._loadedItems):
            self._loadedItems.append("name")
    #----------------------------------------------------------------------
    @ property
    def description(self):
        return self._description
    #----------------------------------------------------------------------
    @ description.setter
    def description(self, val):
        self._description = str(val)
        if not("description" in self._loadedItems):
            self._loadedItems.append("description")
    #----------------------------------------------------------------------
    @ property
    def type(self):
        return self._type
    #----------------------------------------------------------------------
    @ type.setter
    def type(self, val):
        self._type = str(val)
        if not("type" in self._loadedItems):
            self._loadedItems.append("type")
    #----------------------------------------------------------------------
    @ property
    def tag_pi(self):
        return self._tag_pi
    #----------------------------------------------------------------------
    @ tag_pi.setter
    def tag_pi(self, val):
        self._tag_pi = str(val)
        if not("tag_pi" in self._loadedItems):
            self._loadedItems.append("tag_pi")
    #----------------------------------------------------------------------
    @ property
    def tag_opc(self):
        return self._tag_opc
    #----------------------------------------------------------------------
    @ tag_opc.setter
    def tag_opc(self, val):
        self._tag_opc = str(val)
        if not("tag_opc" in self._loadedItems):
            self._loadedItems.append("tag_opc")
    #----------------------------------------------------------------------
    @ property
    def signals(self):
        name = "signals"
        if  not(self.STORAGE ==None) and not(name in self._loadedItems) and (len(self._signals) == 0):
            self._loadDataItem(name)
        return self._signals
    #----------------------------------------------------------------------
    @ signals.setter
    def signals(self, val):
        self._signals = val
        self._signals = val
        if not("signals" in self._loadedItems):
            self._loadedItems.append("signals")

    @ property
    def STORAGE(self):
        return self._STORAGE
    
    @ STORAGE.setter
    def STORAGE(self,val):
        if (val.backEnd == 'hdf5') or (val.backEnd == 'mongodb'):
            self._STORAGE = val
        else:
            raise Exception("storage back-end " + val.backEnd + " is not defined.")

    #creating array functions for updating sizes


    #---------------------------------------------------------------------------
    def sweep(self, item, cmd=None):
        l = []
        if (isinstance(item,(list,np.ndarray))):
            for i in item:
                l += [sweep(i, cmd)]
        else:
            if (cmd == None):
                l = item
            else:
                l = eval(cmd)
        return l
    #---------------------------------------------------------------------------
    def isString(self, txt):
        if (type(txt) == type("")) or (type(txt) == np.string_) or isinstance(txt, str):
            return True
        else :
            return False
    #---------------------------------------------------------------------------
    def isStringArray(self, arr):
        shape = self.getShape(arr)
        item = arr
        if (len(shape) > 0):
            for d in shape:
                item = item[0]
        return self.isString(item)
    #---------------------------------------------------------------------------
    def getShape(self, arr):
        shape = []
        if (isinstance(arr,(list,np.ndarray))):
            if (len(arr) == 0):
                return shape
            shape += [len(arr)]
            shape += self.getShape(arr[0])
            return shape
        else :
            return shape
    #---------------------------------------------------------------------------
    def __repr__(self):
        return ( json.dumps(self.dictRepr(short=True, deep=False), indent=4, separators=(',', ': ')) )
        
    #---------------------------------------------------------------------------
    def typeRepr(self):
        rep = collections.OrderedDict()
        rep["__type__"] = "myPack:Platform"
        rep["__ID__"] = self.ID
        rep["name"] = self.name
        rep["description"] = self.description
        return rep
    #---------------------------------------------------------------------------
    def dictRepr(self, allItems=False, short=False, deep = True):
        rep = collections.OrderedDict()
        rep["__type__"] = "myPack:Platform"
        if not(short):
            rep["__versions__"] = {"myPack":""}
        rep["__ID__"] = self.ID
        rep["name"] = self.name
        rep["description"] = self.description
        if (allItems or self.isSet("name")):
            rep["name"] = self.name
        if (allItems or self.isSet("description")):
            rep["description"] = self.description
        if (allItems or self.isSet("type")):
            rep["type"] = self.type
        if (allItems or self.isSet("tag_pi")):
            rep["tag_pi"] = self.tag_pi
        if (allItems or self.isSet("tag_opc")):
            rep["tag_opc"] = self.tag_opc
        if (allItems or self.isSet("signals")):
            rep["signals"] = []
            for i0 in range(0,len(self.signals)):
                if (short and not(deep)):
                    itemType = self.signals[i0].typeRepr()
                    rep["signals"].append( itemType )
                else:
                    rep["signals"].append( self.signals[i0].dictRepr(allItems, short, deep) )
        return rep
    #---------------------------------------------------------------------------
    def dictDMTRepr(self, allItems=False, short=False, deep = True, bpDataSource=None):
        rep = collections.OrderedDict()
        rep["type"] = "/" + "myPack/Platform"
        if not(bpDataSource == None):
            rep["type"] = bpDataSource + "/" + rep["type"]
        rep["name"] = self.name
        rep["description"] = self.description
        if (allItems or self.isSet("name")):
            rep["name"] = self.name
        if (allItems or self.isSet("description")):
            rep["description"] = self.description
        if (allItems or self.isSet("type")):
            rep["type"] = self.type
        if (allItems or self.isSet("tag_pi")):
            rep["tag_pi"] = self.tag_pi
        if (allItems or self.isSet("tag_opc")):
            rep["tag_opc"] = self.tag_opc
        if (allItems or self.isSet("signals")):
            rep["signals"] = []
            for i0 in range(0,len(self.signals)):
                if (short and not(deep)):
                    itemType = self.signals[i0].typeRepr()
                    rep["signals"].append( itemType )
                else:
                    rep["signals"].append( self.signals[i0].dictDMTRepr(allItems=allItems, short=short, deep=deep, bpDataSource=bpDataSource) )
        return rep
    #---------------------------------------------------------------------------
    def jsonRepr(self, short=False, deep=True):
        return ( json.dumps(self.dictRepr(short=short, deep=deep),indent=4, separators=(',', ': ')) )
        
    #---------------------------------------------------------------------------
    def dmtRepr(self, short=False, deep=True, bpDataSource=None):
        return ( json.dumps(self.dictDMTRepr(short=short, deep=deep, bpDataSource=bpDataSource),indent=4, separators=(',', ': ')) )
        
    #---------------------------------------------------------------------------
    def clone(self):
        newObj = Platform()
        return self._cloneTo(newObj)
        
    def cloneTo(self, newObj):
        self._cloneTo(newObj)
        
    def _cloneTo(self,newObj):
        if (self.isSet("name")):
            newObj._name = self._name
        if (self.isSet("description")):
            newObj._description = self._description
        if (self.isSet("type")):
            newObj._type = self._type
        if (self.isSet("tag_pi")):
            newObj._tag_pi = self._tag_pi
        if (self.isSet("tag_opc")):
            newObj._tag_opc = self._tag_opc
        if (self.isSet("signals")):
            newObj._signals = []
            for i0 in range(0,len(self.signals)):
                newObj._signals.append( self._signals[i0].clone() )
        return newObj
    #---------------------------------------------------------------------------
    #---------------------Entity access functions ------------------------------
    #---------------------------------------------------------------------------
    def hasEntity(self,name):
        objs = self._lookForEntity(name)
        if (len(objs) == 1):
            return True
        else:
            return False
    #---------------------------------------------------------------------------
    def getEntity(self,name):
        objs = self._lookForEntity(name)
        if (len(objs) == 1):
            return objs[0]
        else:
            raise Exception("did not find Entity: %s"%name)
    #---------------------------------------------------------------------------
    def _lookForEntity(self,name):
        objs = []
        if (self.signals != None): 
            objs = objs + [x for x in self.signals if (x.name == name)] 
        if (len(objs) > 1):
            raise Exception("more than one Entity found with the name: %s"%name)
        return objs
    #---------------------------------------------------------------------------
    def getEntityWith(self,propName, propValue):
        objs = self._lookForEntityWith(propName, propValue)
        if (len(objs) == 0):
            raise Exception( ("No Entity found with the property %s and value "%propName) + str(propValue) )
        if (len(objs) > 1):
            raise Exception( ("more than one Entity found the property %s and value "%propName) + str(propValue) )
        return objs[0]
    #---------------------------------------------------------------------------
    def getAllEntitiesWith(self,propName, propValue):
        objs = self._lookForEntityWith(propName, propValue)
        return objs
    #---------------------------------------------------------------------------
    def hasEntityWith(self,propName, propValue):
        objs = self._lookForEntityWith(propName, propValue)
        if (len(objs) == 0):
            return False
        return True
    #---------------------------------------------------------------------------
    def _lookForEntityWith(self,propName, propValue):
        objs = []
        if (self.signals != None): 
            for obj in self.signals:
                try: 
                    if (reduce(getattr,propName.split("."), obj) == propValue): 
                        objs += [obj] 
                except err: 
                    pass
        return objs
    #---------------------------------------------------------------------------
    def find(self,name=None, path=None, namePath = "", accPath="", propType=None):
        objs = []
        accPaths = []
        namePaths = []
        typeMatch = True 
        if (propType != None): 
            if not(fnmatch("myPack:Signal", propType)): 
                typeMatch = False 
        if ( (self.signals != None) ): 
            for ind,obj in enumerate(self.signals):
                objPath = "%s.%s[%d]"%(accPath,"signals", ind)
                if (namePath != ""):
                    objNamePath = "%s.%s"%(namePath,obj.name)
                else:
                    objNamePath = "%s.%s"%(self.name, obj.name)
                isaMatch = False
                if (name != None and path == None):
                    if (fnmatch(obj.name,name) and typeMatch):
                        isaMatch = True
                elif (name == None and path != None):
                    if (fnmatch(objNamePath,path) and typeMatch):
                        isaMatch = True
                elif (name != None and path != None):
                    if (fnmatch(obj.name,name) and fnmatch(objNamePath,path) and typeMatch):
                        isaMatch = True
                if (isaMatch):
                    objs.append(obj)
                    accPaths.append(objPath)
                    namePaths.append(objNamePath)
                sobjs, spaths = obj.find(name=name, path=path, namePath=objNamePath, accPath=objPath, propType=propType) 
                objs += sobjs 
                accPaths += spaths 
        return objs, accPaths
    #---------------------------------------------------------------------------
    #---------------------------------------------------------------------------
    #---------------------check functions --------------------------------------
    #---------------------------------------------------------------------------
    def isSet(self, varName):
        if (isinstance(getattr(self,varName),list) ):
            if (len(getattr(self,varName)) > 0 and not any([np.any(a==None) for a in getattr(self,varName)])  ):
                return True
            else :
                return False
        if (isinstance(getattr(self,varName),np.ndarray) ):
            if (len(getattr(self,varName)) > 0 and not any([np.any(a==None) for a in getattr(self,varName)])  ):
                return True
            else :
                return False
        if (getattr(self,varName) != None):
            return True
        return False
    #---------------------------------------------------------------------------
    def isContained(self, varName):
        MODEL = self.getPropModel(varName)
        if ("containment" in list(MODEL.keys()) ):
            if (MODEL["containment"] == "false"):
                return False
        return True
    #---------------------------------------------------------------------------
    def getPropModel(self, varName):
        props = self.MODEL["properties"]
        for prop in props:
            if (prop["name"] == varName):
                return prop
        raise Exception("property " + varName + " was not found.")
    #---------------------------------------------------------------------------
    def _getInitValueName(self):
        val =str("platform")
        return val
    
    def _getInitValueDescription(self):
        val =str("")
        return val
    
    def _getInitValueType(self):
        val = None
        return val
    
    def _getInitValueTag_pi(self):
        val =str("")
        return val
    
    def _getInitValueTag_opc(self):
        val =str("")
        return val
    
    def _getInitValueSignals(self):
        val = []
        return val
    
    #---------------------------------------------------------------------------
    def create(self,name=None):
        if (name != None) and not(self.isString(name)):
            raise Exception("name should be string %s is given."%(type(name)))
        return Platform(name)
    def makeaSignals(self,name=None):
        if (name != None) and not(self.isString(name)):
            raise Exception("name should be string %s is given."%(type(name)))
        return myPack.Signal.Signal(name)
    def appendSignals(self,name=None, item=None):
        if (name != None) and not(self.isString(name)):
            raise Exception("name should be string %s is given."%(type(name)))
        if item != None:
            if not("myPack.Signal.Signal" == (type(item).__module__ + "." + type(item).__name__) ) :
                raise Exception("only items of type myPack.Signal.Signal could be added to this list.")
            name = item.name
        objs = [x for x in self.signals if (x.name == name)]
        if len(objs) > 1:
            raise Exception(" more than one " + name + " is found in signals")
        elif len(objs) == 1:
            print ("warning: object %s already exist."%(name))
            if item == None:
                return objs[0]
            else:
                if objs[0].STORAGE != None:
                    if objs[0].STORAGE.isConnected():
                        objs[0].loadFromStorage(action="detach")
                item.cloneTo(objs[0])
                return objs[0]
        if item == None:
            obj = myPack.Signal.Signal(name)
            obj.description = "signals"
        else:
            obj = item
        self.signals.append(obj)
        return obj
    def deleteSignals(self):
        self._signals = [] 
    
    #---------------------------------------------------------------------------
    def save(self,filePath=None, dsType = 'hdf5'):
        self.saveHDF5(filePath=filePath, dsType=dsType)
    #---------------------------------------------------------------------------
    def load(self,name=None, filePath=None, dsType = 'hdf5', action="init", hdfPath=None):
        self.loadHDF5(name, filePath=filePath, dsType=dsType, action=action, hdfPath=hdfPath)
    def _loadInit(self):
            self._loadedItems = []
        
        
        
        
        
            self._signals = []
        
        
    #---------------------------------------------------------------------------
    def _loadDataItem(self,name):
        if self.STORAGE.backEnd == 'hdf5':
            self._loadDataItemFromHDF5(name)
        elif self.STORAGE.backEnd == 'mongodb':
            self._loadDataItemFromMongo(name)
        else:
            raise Exception("storage back-end " + self.STORAGE.backEnd + " is not defined.")
    #---------------------------------------------------------------------------
    def loadJSON(self,name = None, filePath = None):
        if not(name == None):
            self.name = name
        if (name == None) and not(filePath == None):
            self.name = '.'.join(filePath.split(os.path.sep)[-1].split('.')[0:-1])
        if (filePath == None):
            if hasattr(self, 'name'):
                filePath = self.name + '.json'
            else:
                raise Exception("object needs name for loading.")
    
        if not(os.path.isfile(filePath)):
            raise Exception("file %s not found."%filePath)
    
        self._loadedItems = []
    
        f = open(filePath,'r')
        data = f.read()
        f.close()
        dd = json.loads(data)
        self.loadFromJSONDict(dd)
    
    def loadFromJSONDict(self, data):
        self.ID = str(data["__ID__"])
        varName = "name"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "description"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "type"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "tag_pi"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "tag_opc"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "signals"
        try :
            createFunc = getattr(self,"append" + varName[0].capitalize()+varName[1:])
            for i0 in range(0,len(data[varName])):
                item = createFunc()
                item.loadFromJSONDict(data[varName][i0])
        except :
            pass
        
        pass
        
    #---------------------------------------------------------------------------
    def saveJSON(self, fileName=None):
        if fileName==None:
            fileName=self.name + ".json"
        f = open(fileName, "w")
        f.write(self.jsonRepr())
        f.close()
        pass
        
    #---------------------------------------------------------------------------
    def saveDMT(self, fileName=None, bpDataSource=None):
        if fileName==None:
            fileName=self.name + ".json"
        f = open(fileName, "w")
        f.write(self.dmtRepr(bpDataSource=bpDataSource))
        f.close()
        pass
        
    def loadFromDMTDict(self, data):
        varName = "name"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "description"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "type"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "tag_pi"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "tag_opc"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "signals"
        try :
            createFunc = getattr(self,"append" + varName[0].capitalize()+varName[1:])
            for i0 in range(0,len(data[varName])):
                item = createFunc()
                item.loadFromDMTDict(data[varName][i0])
        except :
            pass
        
        pass
        
    def loadDMT(self,name = None, filePath = None):
        if not(name == None):
            self.name = name
        if (name == None) and not(filePath == None):
            self.name = '.'.join(filePath.split(os.path.sep)[-1].split('.')[0:-1])
        if (filePath == None):
            if hasattr(self, 'name'):
                filePath = self.name + '.json'
            else:
                raise Exception("object needs name for loading.")
    
        if not(os.path.isfile(filePath)):
            raise Exception("file %s not found."%filePath)
    
        self._loadedItems = []
    
        f = open(filePath,'r')
        data = f.read()
        f.close()
        dd = json.loads(data)
        self.loadFromDMTDict(dd)
    
    #---------------------------------------------------------------------------
    #---------------------Load HDF5 functions ----------------------------------
    #---------------------------------------------------------------------------
    def loadHDF5(self,name=None, filePath=None, dsType = 'hdf5', action="init", hdfPath=None):
        if not(name == None):
            self.name = name
        if (filePath == None):
            if hasattr(self, 'name'):
                filePath = self.name + '.h5'
            else:
                raise Exception("object needs name for loading.")
    
        if not(os.path.isfile(filePath)):
            raise Exception("file %s not found."%filePath)
        if (name == None and hdfPath==None):
            #get first item name in the file as the object name
            tempFile = h5py.File(filePath, "r")
            folders = list(tempFile.keys())
            if (len(folders) == 0):
                raise Exception("no object group in the file.")
            if (len(folders) > 1):
                warnings.warn("several objects exist in the file, %s . Loading of first object is tried. Please provide name in the input for others."%folders, RuntimeWarning)
            self.name = folders[0]
            tempFile.close()
    
        self.STORAGE = pyds.getDataStorageBackEndServer(dsType)
        self.STORAGE.filePath = filePath
    
        if hdfPath == None:
            self.STORAGE.path = self.STORAGE.path + self.name
        else:
            self.STORAGE.path = hdfPath
    
        if self.STORAGE.backEnd == 'hdf5':
            self.loadFromHDF5Handle(action = action)
        else:
            raise Exception("storage back-end " + self.STORAGE.backEnd + " is not defined.")
    
    def loadFromStorage(self, storage=None, dsType = 'hdf5', action="init"):
        if (dsType == 'hdf5') :
            self.loadFromHDF5Handle(storage=storage, action=action)
    def loadFromHDF5Handle(self, storage=None, action="init"):
        if (action == "init") or (action == "sync"):
            self._loadInit()
        if storage != None:
            self.STORAGE = storage
    
        if self.STORAGE.isConnected() and not(self.STORAGE.isOpen()):
            self.STORAGE.openRead()
            self._loadDataFromHDF5Handle(action=action)
        if self.STORAGE.isOpen():
            self.STORAGE.close()
    def _loadDataItemFromHDF5(self, itemName):
        if self.STORAGE.isConnected() and not(self.STORAGE.isOpen()):
            self.STORAGE.openRead()
        if (itemName == "name"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "name", "AtomicSingle", action="detach")
        if (itemName == "description"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "description", "AtomicSingle", action="detach")
        if (itemName == "type"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "type", "AtomicSingle", action="detach")
        if (itemName == "tag_pi"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "tag_pi", "AtomicSingle", action="detach")
        if (itemName == "tag_opc"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "tag_opc", "AtomicSingle", action="detach")
        if (itemName == "signals"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "signals", "NonAtomicArray")
        
        if self.STORAGE.isOpen():
            self.STORAGE.close()
    def _loadDataFromHDF5Handle(self, action="init"):
        if self.STORAGE.isConnected() and not(self.STORAGE.isOpen()):
            self.STORAGE.openRead()
        handle = self.STORAGE.data
        if "ID" in list(handle.attrs.keys()):
            self.ID = str(handle.attrs["ID"])
        else:
            self.ID = str(uuid.uuid4())
        self.OBJattrs = collections.OrderedDict()
        try:
            for key,val in handle.attrs.items():
                self.OBJattrs[key] = val
        except:
            pass
        pyds.hdf5.loadFromHDF5HandleItem(self, "name", "AtomicSingle", action=action)
        pyds.hdf5.loadFromHDF5HandleItem(self, "description", "AtomicSingle", action=action)
        pyds.hdf5.loadFromHDF5HandleItem(self, "type", "AtomicSingle", action=action)
        pyds.hdf5.loadFromHDF5HandleItem(self, "tag_pi", "AtomicSingle", action=action)
        pyds.hdf5.loadFromHDF5HandleItem(self, "tag_opc", "AtomicSingle", action=action)
        if not(action == "init"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "signals", "NonAtomicArray", action=action)
        
        try:
            for key,val in handle.items():
                if isinstance(val, h5py.Dataset):
                    if not(key in ["name","description","type","tag_pi","tag_opc"]):
                        self.OBJattrs[key] = val.value
        except:
            pass
        
        if self.STORAGE.isOpen():
            self.STORAGE.close()
        pass
    #---------------------------------------------------------------------------
    #---------------------Save HDF5 functions ----------------------------------
    #---------------------------------------------------------------------------
    def saveHDF5(self,filePath=None, dsType = 'hdf5'):
        if (filePath == None):
            if hasattr(self, 'name'):
                filePath = self.name + '.h5'
            else:
                raise Exception("object needs name for saving.")
    
        print("	Saving %s to %s ..."%(self.name, filePath))
    
        if (self.STORAGE):
            if (self.STORAGE.backEnd == 'hdf5'):
                self.loadFromHDF5Handle(action="detach")
        storage = pyds.getDataStorageBackEndServer(dsType)
        storage.filePath = filePath
        storage.openWrite()
    
        grpHandle = storage.handle
        self._saveVertionsToHDF5Handle(grpHandle)
        dgrp = grpHandle.create_group(self.name)
    
        storage.appendPath(self.name)
    
        self._saved = {}
        if storage.backEnd == 'hdf5':
            self.saveToHDF5Handle(dgrp)
        else:
            raise Exception("storage back-end " + self._storageBackEndType + " is not defined.")
    
        if storage.isOpen():
            storage.close()
        return storage
    def _saveVertionsToHDF5Handle(self, handle):
        handle.attrs["myPack"] = ""
        pass
    def saveToHDF5Handle(self, handle):
        #first pass to save all contained items
        self._saveDataToHDF5Handle(handle)
        pass
        
    def _saveDataToHDF5Handle(self, handle):
        self.REF = handle.ref
        handle.attrs["type"] = "myPack:Platform"
        handle.attrs["ID"] = self.ID
        if ("order" in list(handle.attrs.keys())):
            handle.attrs["order"] = []
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "name", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "description", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "type", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "tag_pi", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "tag_opc", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "signals", "NonAtomicArray")
        
        order = []
        if (self.isSet("name")):
            order.append("name")
        if (self.isSet("description")):
            order.append("description")
        if (self.isSet("type")):
            order.append("type")
        if (self.isSet("tag_pi")):
            order.append("tag_pi")
        if (self.isSet("tag_opc")):
            order.append("tag_opc")
        if (self.isSet("signals")):
            order.append("signals")
        if ("order" in list(handle.attrs.keys())):
            curOrders = [a.decode("ascii") for a in handle.attrs["order"]]
            if ( len(list(curOrders)) > 0 ):
                order = list(curOrders) + order
        handle.attrs["order"] = [a.encode("ascii") for a in order]
        for key,val in self.OBJattrs.items():
            #type is exception and it will be overwriten
            if (key == "type"):
                handle.attrs[key] = val
            #skip name and description
            if (key == "name" or key == "description"):
                continue
            if (not key in list(handle.attrs.keys())):
                handle.attrs[key] = val
#---------------------------------------------------------------------------
#modules
#importing referenced types
import myPack.Signal

#******************************************************************************
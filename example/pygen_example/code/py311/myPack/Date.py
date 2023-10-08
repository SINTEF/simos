""" This an autogenerated file using simosjs.generator
    Please do not edit
    Babak Ommani, Offshore Hydrodynamic, MARINTEK """

## date and time
## Generated with Date

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
class Date(object):
    #---------------------------------------------------------------------------
    def __init__(self,name=None):
        self.MODEL = {"name":"Date","description":"date and time","extends":[],"properties":[{"name":"name","type":"string","description":"signal name","value":"date","contained":True,"optional":False},{"name":"description","type":"string","description":"measurement description","value":"","contained":True,"optional":False},{"name":"type","type":"string","contained":True,"optional":False},{"name":"year","type":"float","description":"year","value":2022,"contained":True,"optional":False},{"name":"month","type":"float","description":"month number","value":8,"contained":True,"optional":False},{"name":"day","type":"float","description":"day","value":1,"contained":True,"optional":False},{"name":"hour","type":"float","description":"hour in 24h format, 00 to 23","value":1,"contained":True,"optional":False},{"name":"minute","type":"float","description":"minute 0 to 59","value":0,"contained":True,"optional":False},{"name":"second","type":"float","description":"second 0 to 60","value":0,"contained":True,"optional":False},{"name":"str_rep","type":"string","description":"string representation DD-MMM-YYYY HH:mm:ss","value":"01-Aug-2022 01:00:00","contained":True,"optional":False}],"type":"myPack:Date","package":"myPack","__versions__":{"myPack":""}}
        self.ID = str(uuid.uuid4())
        self._saved = {}
        self.REF = None
        self._sync = {}
        self._STORAGE = None
        self._loadedItems = []
        self._name=str("date")
        if not(name == None):
            self._name = name 
        self.MODELname = {"name":"name","type":"string","description":"signal name","value":"date","contained":True,"optional":False}
        
        self._description= self._getInitValueDescription()
        self.MODELdescription = {"name":"description","type":"string","description":"measurement description","value":"","contained":True,"optional":False}
        
        self._type= self._getInitValueType()
        self.MODELtype = {"name":"type","type":"string","contained":True,"optional":False}
        
        self._year= self._getInitValueYear()
        self.MODELyear = {"name":"year","type":"float","description":"year","value":2022,"contained":True,"optional":False}
        
        self._month= self._getInitValueMonth()
        self.MODELmonth = {"name":"month","type":"float","description":"month number","value":8,"contained":True,"optional":False}
        
        self._day= self._getInitValueDay()
        self.MODELday = {"name":"day","type":"float","description":"day","value":1,"contained":True,"optional":False}
        
        self._hour= self._getInitValueHour()
        self.MODELhour = {"name":"hour","type":"float","description":"hour in 24h format, 00 to 23","value":1,"contained":True,"optional":False}
        
        self._minute= self._getInitValueMinute()
        self.MODELminute = {"name":"minute","type":"float","description":"minute 0 to 59","value":0,"contained":True,"optional":False}
        
        self._second= self._getInitValueSecond()
        self.MODELsecond = {"name":"second","type":"float","description":"second 0 to 60","value":0,"contained":True,"optional":False}
        
        self._str_rep= self._getInitValueStr_rep()
        self.MODELstr_rep = {"name":"str_rep","type":"string","description":"string representation DD-MMM-YYYY HH:mm:ss","value":"01-Aug-2022 01:00:00","contained":True,"optional":False}
        
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
    def year(self):
        return self._year
    #----------------------------------------------------------------------
    @ year.setter
    def year(self, val):
        self._year = float(val)
        if not("year" in self._loadedItems):
            self._loadedItems.append("year")
    #----------------------------------------------------------------------
    @ property
    def month(self):
        return self._month
    #----------------------------------------------------------------------
    @ month.setter
    def month(self, val):
        self._month = float(val)
        if not("month" in self._loadedItems):
            self._loadedItems.append("month")
    #----------------------------------------------------------------------
    @ property
    def day(self):
        return self._day
    #----------------------------------------------------------------------
    @ day.setter
    def day(self, val):
        self._day = float(val)
        if not("day" in self._loadedItems):
            self._loadedItems.append("day")
    #----------------------------------------------------------------------
    @ property
    def hour(self):
        return self._hour
    #----------------------------------------------------------------------
    @ hour.setter
    def hour(self, val):
        self._hour = float(val)
        if not("hour" in self._loadedItems):
            self._loadedItems.append("hour")
    #----------------------------------------------------------------------
    @ property
    def minute(self):
        return self._minute
    #----------------------------------------------------------------------
    @ minute.setter
    def minute(self, val):
        self._minute = float(val)
        if not("minute" in self._loadedItems):
            self._loadedItems.append("minute")
    #----------------------------------------------------------------------
    @ property
    def second(self):
        return self._second
    #----------------------------------------------------------------------
    @ second.setter
    def second(self, val):
        self._second = float(val)
        if not("second" in self._loadedItems):
            self._loadedItems.append("second")
    #----------------------------------------------------------------------
    @ property
    def str_rep(self):
        return self._str_rep
    #----------------------------------------------------------------------
    @ str_rep.setter
    def str_rep(self, val):
        self._str_rep = str(val)
        if not("str_rep" in self._loadedItems):
            self._loadedItems.append("str_rep")

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
        rep["__type__"] = "myPack:Date"
        rep["__ID__"] = self.ID
        rep["name"] = self.name
        rep["description"] = self.description
        return rep
    #---------------------------------------------------------------------------
    def dictRepr(self, allItems=False, short=False, deep = True):
        rep = collections.OrderedDict()
        rep["__type__"] = "myPack:Date"
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
        if (allItems or self.isSet("year")):
            rep["year"] = self.year
        if (allItems or self.isSet("month")):
            rep["month"] = self.month
        if (allItems or self.isSet("day")):
            rep["day"] = self.day
        if (allItems or self.isSet("hour")):
            rep["hour"] = self.hour
        if (allItems or self.isSet("minute")):
            rep["minute"] = self.minute
        if (allItems or self.isSet("second")):
            rep["second"] = self.second
        if (allItems or self.isSet("str_rep")):
            rep["str_rep"] = self.str_rep
        return rep
    #---------------------------------------------------------------------------
    def dictDMTRepr(self, allItems=False, short=False, deep = True, bpDataSource=None):
        rep = collections.OrderedDict()
        rep["type"] = "/" + "myPack/Date"
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
        if (allItems or self.isSet("year")):
            rep["year"] = self.year
        if (allItems or self.isSet("month")):
            rep["month"] = self.month
        if (allItems or self.isSet("day")):
            rep["day"] = self.day
        if (allItems or self.isSet("hour")):
            rep["hour"] = self.hour
        if (allItems or self.isSet("minute")):
            rep["minute"] = self.minute
        if (allItems or self.isSet("second")):
            rep["second"] = self.second
        if (allItems or self.isSet("str_rep")):
            rep["str_rep"] = self.str_rep
        return rep
    #---------------------------------------------------------------------------
    def jsonRepr(self, short=False, deep=True):
        return ( json.dumps(self.dictRepr(short=short, deep=deep),indent=4, separators=(',', ': ')) )
        
    #---------------------------------------------------------------------------
    def dmtRepr(self, short=False, deep=True, bpDataSource=None):
        return ( json.dumps(self.dictDMTRepr(short=short, deep=deep, bpDataSource=bpDataSource),indent=4, separators=(',', ': ')) )
        
    #---------------------------------------------------------------------------
    def clone(self):
        newObj = Date()
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
        if (self.isSet("year")):
            newObj._year = self._year
        if (self.isSet("month")):
            newObj._month = self._month
        if (self.isSet("day")):
            newObj._day = self._day
        if (self.isSet("hour")):
            newObj._hour = self._hour
        if (self.isSet("minute")):
            newObj._minute = self._minute
        if (self.isSet("second")):
            newObj._second = self._second
        if (self.isSet("str_rep")):
            newObj._str_rep = self._str_rep
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
        return objs
    #---------------------------------------------------------------------------
    def find(self,name=None, path=None, namePath = "", accPath="", propType=None):
        objs = []
        accPaths = []
        namePaths = []
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
        val =str("date")
        return val
    
    def _getInitValueDescription(self):
        val =str("")
        return val
    
    def _getInitValueType(self):
        val = None
        return val
    
    def _getInitValueYear(self):
        val =float(2022)
        return val
    
    def _getInitValueMonth(self):
        val =float(8)
        return val
    
    def _getInitValueDay(self):
        val =float(1)
        return val
    
    def _getInitValueHour(self):
        val =float(1)
        return val
    
    def _getInitValueMinute(self):
        val =float(0)
        return val
    
    def _getInitValueSecond(self):
        val =float(0)
        return val
    
    def _getInitValueStr_rep(self):
        val =str("01-Aug-2022 01:00:00")
        return val
    
    #---------------------------------------------------------------------------
    def create(self,name=None):
        if (name != None) and not(self.isString(name)):
            raise Exception("name should be string %s is given."%(type(name)))
        return Date(name)
    #---------------------------------------------------------------------------
    def save(self,filePath=None, dsType = 'hdf5'):
        self.saveHDF5(filePath=filePath, dsType=dsType)
    #---------------------------------------------------------------------------
    def load(self,name=None, filePath=None, dsType = 'hdf5', action="init", hdfPath=None):
        self.loadHDF5(name, filePath=filePath, dsType=dsType, action=action, hdfPath=hdfPath)
    def _loadInit(self):
            self._loadedItems = []
        
        
        
        
        
        
        
        
        
        
        
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
        
        varName = "year"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "month"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "day"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "hour"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "minute"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "second"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "str_rep"
        try :
            setattr(self,varName, data[varName])
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
        
        varName = "year"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "month"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "day"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "hour"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "minute"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "second"
        try :
            setattr(self,varName, data[varName])
        except :
            pass 
        
        varName = "str_rep"
        try :
            setattr(self,varName, data[varName])
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
        if (itemName == "year"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "year", "AtomicSingle", action="detach")
        if (itemName == "month"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "month", "AtomicSingle", action="detach")
        if (itemName == "day"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "day", "AtomicSingle", action="detach")
        if (itemName == "hour"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "hour", "AtomicSingle", action="detach")
        if (itemName == "minute"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "minute", "AtomicSingle", action="detach")
        if (itemName == "second"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "second", "AtomicSingle", action="detach")
        if (itemName == "str_rep"):
            pyds.hdf5.loadFromHDF5HandleItem(self, "str_rep", "AtomicSingle", action="detach")
        
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
        pyds.hdf5.loadFromHDF5HandleItem(self, "year", "AtomicSingle", action=action)
        pyds.hdf5.loadFromHDF5HandleItem(self, "month", "AtomicSingle", action=action)
        pyds.hdf5.loadFromHDF5HandleItem(self, "day", "AtomicSingle", action=action)
        pyds.hdf5.loadFromHDF5HandleItem(self, "hour", "AtomicSingle", action=action)
        pyds.hdf5.loadFromHDF5HandleItem(self, "minute", "AtomicSingle", action=action)
        pyds.hdf5.loadFromHDF5HandleItem(self, "second", "AtomicSingle", action=action)
        pyds.hdf5.loadFromHDF5HandleItem(self, "str_rep", "AtomicSingle", action=action)
        
        try:
            for key,val in handle.items():
                if isinstance(val, h5py.Dataset):
                    if not(key in ["name","description","type","year","month","day","hour","minute","second","str_rep"]):
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
        handle.attrs["type"] = "myPack:Date"
        handle.attrs["ID"] = self.ID
        if ("order" in list(handle.attrs.keys())):
            handle.attrs["order"] = []
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "name", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "description", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "type", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "year", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "month", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "day", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "hour", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "minute", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "second", "AtomicSingle")
        
        pyds.hdf5.saveToHDF5HandleItem(self, handle, "str_rep", "AtomicSingle")
        
        order = []
        if (self.isSet("name")):
            order.append("name")
        if (self.isSet("description")):
            order.append("description")
        if (self.isSet("type")):
            order.append("type")
        if (self.isSet("year")):
            order.append("year")
        if (self.isSet("month")):
            order.append("month")
        if (self.isSet("day")):
            order.append("day")
        if (self.isSet("hour")):
            order.append("hour")
        if (self.isSet("minute")):
            order.append("minute")
        if (self.isSet("second")):
            order.append("second")
        if (self.isSet("str_rep")):
            order.append("str_rep")
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

#******************************************************************************
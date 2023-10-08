import h5py
import numpy as np
import simos.tools as stools
#---------------------------------------------------------------------------
#---------------------General Load functions ----------------------------------
#---------------------------------------------------------------------------
def load(filePath, rootPath=None, dataType=None):
    print(("loading hdf file %s"%filePath))
    
    f = h5py.File(filePath)
     
    if 'type' in list(f.attrs.keys()):
        return loadOldSimos(f)
    else:
        return loadNewSimos(f,  rootPath=rootPath, dataType=dataType)
    
    
def loadOldSimos(f): 
    from pyfoma.generatedEntities import fetchEntity
    
    Obj = fetchEntity(f.attrs['type'], f.attrs['version'])
    fileName = f.filename
    f.close()
    obj = Obj()
    obj.load(fileName)
    
    return [obj]

def loadNewSimos(f, rootPath=None, dataType=None): 
    versions = getVersions(f)
    objs = []
    
    fileName = f.filename
    for entityName,entity in f.items():
        
        if dataType == None:
            dataType = getType(entity)

        print(("\t loading a %s"%dataType))
        
        
        typePath, typeName = makeTypePath(dataType, versions)
        
        
        Obj = getattr(__import__(typePath, fromlist=[typeName]), typeName)
    
        obj = Obj(entityName)
    
        obj.load(name=rootPath, filePath = fileName)
    
        objs.append(obj)
        
    f.close()
    return objs
    
def getType(entity):
    fullTypeName = entity.attrs["type"]
    #print(type(fullTypeName))
    if isinstance(fullTypeName, list) or isinstance(fullTypeName, np.ndarray):
        if len(fullTypeName) > 1:
            raise Exception("only one element is expected, %d found."%len(fullTypeName))
        fullTypeName = fullTypeName[0]

    return fullTypeName

def makeTypePath(fullTypeName, versions):
        
    if ':' in fullTypeName:
        packages = fullTypeName.split(':')
    elif '.' in fullTypeName:
        packages = fullTypeName.split('.')
    else:
        raise Exception("package seperator is not found.")
        
    typeName = packages[-1]
    packages = packages[0:-1]
        
    type = ''
    for package in packages:
        if '_' in package:
            print(package.split('_')[0])
            if package.split('_')[0] in versions:
                type = type + package + '.'
            else:
                type = type + package.split('_')[0] + '.'
        else:
            if package in versions:
                if versions[package] == '':
                    type = type + package + '.'
                else:
                    type = type + package + '_' + versions[package] + '.'
            else:
                type = type + package + '.'
    
    return (type + typeName), typeName

def getVersions(f):
    versions = {}
    for package,ver in f.attrs.items():
        if isinstance(ver, list) or isinstance(ver, np.ndarray):
            if len(ver) > 1:
                raise Exception("only one element is expected, %d found."%len(ver))
            ver = ver[0]
        versions[package] = ver
        
    return versions   
    
#---------------------------------------------------------------------------
#---------------------Load HDF5 functions ----------------------------------
#-----------------------------------------------------------------------------#
def loadFromHDF5HandleItem(ent, varName, myType, action = "init", ungroup=False, propType="", isRecursive=False):
    loadFlag = True
    if not(ent.STORAGE.isConnected()):
        raise Exception("item is not connected to any HDF file.")
    if ent.STORAGE.isConnected() and not(ent.STORAGE.isOpen()):
        ent.STORAGE.openRead()
    handle = ent.STORAGE.data
    if (loadFlag):
        if (myType == "AtomicSingle"):
            _loadFromHDF5HandleItemAtomicSingle(ent, handle, varName, stat=action)
        if (myType == "AtomicArray"):
            _loadFromHDF5HandleItemAtomicArray(ent, handle, varName, stat=action)
        if (myType == "NonAtomicArray") and not(ungroup):
            _loadFromHDF5HandleItemNonAtomicArray(ent, handle, varName, stat=action)
        if (myType == "NonAtomicArray") and (ungroup):
            _loadFromHDF5HandleItemNonAtomicArrayUngroup(ent, handle, varName, stat=action, propType=propType, isRecursive=isRecursive)
        if (myType == "NonAtomicSingle"):
            _loadFromHDF5HandleItemNonAtomicSingle(ent, handle, varName, stat=action)
        ent._sync[varName] = -1
    
    pass
#-----------------------------------------------------------------------------#
def _loadFromHDF5HandleItemAtomicSingle(ent, handle, varName, stat="init"):
    try :
        if (stat == "init") or (stat == "sync"):
            if not(varName in  ent._loadedItems):
                ent._loadedItems.append(varName)
            if (varName in list(handle.keys())):
                val = handle[varName][()]
                if isinstance(val,np.ndarray):
                    val = val[0]
                if isinstance(val, bytes):
                    val = val.decode('ascii')
                    
                setattr(ent,varName, val)
            else:
                if varName == "name":
                    setattr(ent,varName, handle.name.split("/")[-1])
                else:
                    initFunc = getattr(ent,"_getInitValue" + varName[0].capitalize() + varName[1:])
                    setattr(ent,varName, initFunc())
        elif (stat == "detach"):
            if (varName in list(handle.keys())) and not(varName in  ent._loadedItems):
                ent._loadedItems.append(varName)
                val = handle[varName].value
                if isinstance(val,np.ndarray):
                    val = val[0]
                if isinstance(val, bytes):
                    val = val.decode('ascii')                    
                setattr(ent,varName, val)
        else:
            raise Exception("action %s is not known."%stat)
    except AttributeError:
        print ("Warning: %s was not loaded properly. "%varName)
        traceback.print_exc()
        pass
    pass
#-----------------------------------------------------------------------------#
def _loadFromHDF5HandleItemAtomicArray(ent, handle, varName, stat="init"):
    try :
        if (stat == "init"):
            setattr(ent,"_"+varName,  np.array([]))
            if (varName in  ent._loadedItems):
                ent._loadedItems.pop(ent._loadedItems.index(varName))
        elif (stat == "detach"):
            if not(varName in  ent._loadedItems):
                if (varName in list(handle.keys())):
                    val = handle[varName][()]
                    if stools.isByteArray(val):
                        val = stools.sweep(val, "item.decode('ascii')")
                    val = np.asarray(val)
                    setattr(ent,"_"+varName, val)
                ent._loadedItems.append(varName)
        elif (stat == "sync"):
            if (varName in list(handle.keys())):
                val = handle[varName][()]
                if stools.isByteArray(val):
                    val = stools.sweep(val, "item.decode('ascii')")
                val = np.asarray(val)
                setattr(ent,"_"+varName, val)                
            else:
                initFunc = getattr(ent,"_getInitValue" + varName[0].capitalize() + varName[1:])
                setattr(ent,"_"+varName, initFunc())
            if not(varName in  ent._loadedItems):
                ent._loadedItems.append(varName)
        else:
            raise Exception("action %s is not known."%stat)
    except AttributeError:
        print("Warning: %s was not loaded properly. "%varName)
        traceback.print_exc()
        pass
    pass
#-----------------------------------------------------------------------------#
def _loadFromHDF5HandleItemNonAtomicSingle(ent, handle, varName, stat="init"):
    obj = getattr(ent,"_"+varName)
    try :
        if not(varName in ent._loadedItems):
            ent._loadedItems.append(varName)
        if (stat == "init") or (stat == "sync"):
            if (varName in list(handle.keys())):
                if (obj == None):
                    creFunc = getattr(ent,"renew"+varName[0].capitalize()+varName[1:])
                    obj = creFunc()
                subStor = ent.STORAGE.clone()
                subStor.appendPath(varName)
                obj.loadFromHDF5Handle(storage=subStor, action=stat)
            else:
                initFunc = getattr(ent,"_getInitValue" + varName[0].capitalize() + varName[1:])
                setattr(ent,"_"+varName, initFunc())
        elif (stat == "detach"):
            if (varName in list(handle.keys())):
                if (obj != None):
                    if (obj.STORAGE != None):
                        subStor = obj.STORAGE
                    else:
                        subStor = ent.STORAGE.clone()
                        subStor.appendPath(varName)
                    obj.loadFromHDF5Handle(storage=subStor,action=stat)
                else:
                    creFunc = getattr(ent,"renew"+varName[0].capitalize()+varName[1:])
                    obj = creFunc()
                    subStor = ent.STORAGE.clone()
                    subStor.appendPath(varName)
                    obj.loadFromHDF5Handle(storage=subStor, action="sync")
        else:
            raise Exception("action %s is not known."%stat)
    except AttributeError:
        print("Warning: %s was not loaded properly. "%varName)
        traceback.print_exc()
    pass
#-----------------------------------------------------------------------------#
def _loadFromHDF5HandleItemNonAtomicArray(ent, handle, varName, stat="init"):
    try :
        if not(varName in ent._loadedItems):
            ent._loadedItems.append(varName)
        if (stat == "init") or (stat == "sync") :
            if (varName in list(handle.keys())):
                order = handle[varName].attrs["order"]
                if not(isinstance(order,np.ndarray)):
                    if isinstance(order, bytes):
                        order = np.array(order.split(",".encode('ascii')))
                    else:                        
                        order = np.array(order.split(","))
                    
                if stools.isByteArray(order):
                    order = stools.sweep(order, "item.decode('ascii')")

                num = len(order)
                setattr(ent,"_"+varName,[])
                creFunc = getattr(ent,"append"+varName[0].capitalize()+varName[1:])
                for i in range(num):
                    refObject = order[i]
                    obj = creFunc(refObject)
                    subStor = ent.STORAGE.clone()
                    subStor.appendPath(varName)
                    subStor.appendPath(refObject)
                    obj.loadFromHDF5Handle(storage=subStor, action=stat)
            else:
                initFunc = getattr(ent,"_getInitValue" + varName[0].capitalize() + varName[1:])
                setattr(ent,"_"+varName, initFunc())
        elif (stat == "detach"):
            if (varName in list(handle.keys())):
                objs = getattr(ent,"_"+varName)
                    
                order = handle[varName].attrs["order"]
                if not(isinstance(order,np.ndarray)):
                    if isinstance(order, bytes):
                        order = np.array(order.split(",".encode('ascii')))
                    else:                        
                        order = np.array(order.split(","))
                    
                if stools.isByteArray(order):
                    order = stools.sweep(order, "item.decode('ascii')")

                    
                handles = order
                
                if (len(objs) == 0):
                    #object are not created, first create then invoke the load command.
                    num = len(handles)
                    setattr(ent,"_"+varName,[])
                    creFunc = getattr(ent,"append"+varName[0].capitalize()+varName[1:])
                    for i in range(num):
                        refObject = handles[i]
                        obj = creFunc(refObject)
                        subStor = ent.STORAGE.clone()
                        subStor.appendPath(varName)
                        subStor.appendPath(refObject)
                        obj.loadFromHDF5Handle(storage=subStor, action="sync")
                else:
                    #object are alreasy created, just invoke the load command.
                    for obj in objs:
                        if (obj.name in handles):
                            if (obj.STORAGE != None):
                                subStor = obj.STORAGE
                            else:
                                subStor = ent.STORAGE.clone()
                                subStor.appendPath(varName)
                                subStor.appendPath(obj.name)
                            obj.loadFromHDF5Handle(storage=subStor,action=stat)
        else:
            raise Exception("action %s is not known."%stat)
    except AttributeError:
        print("Warning: %s was not loaded properly. "%varName)
        traceback.print_exc()
        pass
    pass
#-----------------------------------------------------------------------------#
def _loadFromHDF5HandleItemNonAtomicArrayUngroup(ent, handle, varName, stat="init", propType="", isRecursive=False):
    try :
        order=[]
        allOrders=[]
        if ("order" in list(handle.attrs.keys())):
            allOrders = handle.attrs["order"]
            if not(isinstance(allOrders,np.ndarray)):
                if isinstance(allOrders, bytes):   
                    if not(allOrders == "".encode('ascii')):                    
                        allOrders = np.array(allOrders.split(",".encode('ascii')))
                else:
                    if not(allOrders == ""):
                        allOrders = np.array(allOrders.split(","))

            if stools.isByteArray(allOrders):
                allOrders = stools.sweep(allOrders, "item.decode('ascii')")
                
        else:
            allItems = list(handle.keys())
            allOrders = [item for item in allItems if isinstance(handle[item], h5py.Group)]
        for anOrder in allOrders:
            if ("type" in list(handle[anOrder].attrs.keys())):
                if (handle[anOrder].attrs["type"] == propType):
                    order.append(anOrder)
                elif ( ("order" in list(handle[anOrder].attrs.keys())) and isRecursive and not(handle[anOrder].attrs["type"] in ent._ungroupTypes) ):    #this is a group without correct type
                    order.append(anOrder)
            elif ( ("order" in list(handle[anOrder].attrs.keys())) and isRecursive ):    #this is a group without correct type
                order.append(anOrder)
                
                
        if not(varName in ent._loadedItems):
            ent._loadedItems.append(varName)
        if (stat == "init") or (stat == "sync") :
            if (len(order) > 0):
                num = len(order)
                setattr(ent,"_"+varName,[])
                creFunc = getattr(ent,"append"+varName[0].capitalize()+varName[1:])
                for i in range(num):
                    refObject = order[i]
                    obj = creFunc(refObject)
                    subStor = ent.STORAGE.clone()
                    subStor.appendPath(refObject)
                    obj.loadFromHDF5Handle(storage=subStor, action=stat)
            else:
                initFunc = getattr(ent,"_getInitValue" + varName[0].capitalize() + varName[1:])
                setattr(ent,"_"+varName, initFunc())
        elif (stat == "detach"):
            if (len(order) > 0):
                objs = getattr(ent,"_"+varName)
                if (len(objs) == 0):
                    #object are not created, first create then invoke the load command.
                    num = len(order)
                    setattr(ent,"_"+varName,[])
                    creFunc = getattr(ent,"append"+varName[0].capitalize()+varName[1:])
                    for i in range(num):
                        refObject = order[i]
                        obj = creFunc(refObject)
                        subStor = ent.STORAGE.clone()
                        subStor.appendPath(refObject)
                        obj.loadFromHDF5Handle(storage=subStor, action="sync")
                else:
                    #object are alreasy created, just invoke the load command.
                    for obj in objs:
                        if (obj.name in order):
                            if (obj.STORAGE != None):
                                subStor = obj.STORAGE
                            else:
                                subStor = ent.STORAGE.clone()
                                subStor.appendPath(obj.name)
                            obj.loadFromHDF5Handle(storage=subStor,action=stat)
        else:
            raise Exception("action %s is not known."%stat)
    except AttributeError:
        print("Warning: %s was not loaded properly. "%varName)
        traceback.print_exc()
        pass
    pass
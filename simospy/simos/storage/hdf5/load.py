import h5py
import numpy as np

def load(filePath):
    print("loading hdf file %s"%filePath)
    
    f = h5py.File(filePath)
     
    if 'type' in f.attrs.keys():
        return loadOldSimos(f)
    else:
        return loadNewSimos(f)
    
    
def loadOldSimos(f): 
    from pyfoma.generatedEntities import fetchEntity
    
    Obj = fetchEntity(f.attrs['type'], f.attrs['version'])
    fileName = f.filename
    f.close()
    obj = Obj()
    obj.load(fileName)
    
    return [obj]

def loadNewSimos(f): 
    versions = getVersions(f)
    objs = [];
    
    fileName = f.filename
    for entityName,entity in f.iteritems():
        fullTypeName = entity.attrs["type"]
        print type(fullTypeName)
        if isinstance(fullTypeName, list) or isinstance(fullTypeName, np.ndarray):
            if len(fullTypeName) > 1:
                raise Exception("only one element is expected, %d found."%len(fullTypeName))
            fullTypeName = fullTypeName[0]
        
        print("\t loading a %s"%fullTypeName)
        
        
        typePath, typeName = makeTypePath(fullTypeName, versions)
        
        
        Obj = getattr(__import__(typePath, fromlist=[typeName]), typeName)
    
        obj = Obj(entityName)
    
        obj.load(filePath = fileName)
    
        objs.append(obj)
        
    f.close()
    return objs
    
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
            print package.split('_')[0]
            if versions.has_key(package.split('_')[0]):
                type = type + package + '.'
            else:
                type = type + package.split('_')[0] + '.'
        else:
            if versions.has_key(package):
                if versions[package] == '':
                    type = type + package + '.'
                else:
                    type = type + package + '_' + versions[package] + '.'
            else:
                type = type + package + '.'
    
    return (type + typeName), typeName

def getVersions(f):
    versions = {}
    for package,ver in f.attrs.iteritems():
        if isinstance(ver, list) or isinstance(ver, np.ndarray):
            if len(ver) > 1:
                raise Exception("only one element is expected, %d found."%len(ver))
            ver = ver[0]
        versions[package] = ver
        
    return versions   
    
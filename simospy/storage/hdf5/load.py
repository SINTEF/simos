import h5py

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
    
    for entityName,entity in f.iteritems():
        print("\t loading a %s"%entity.attrs["type"])
        
        typePath, typeName = makeTypePath(entity.attrs["type"], versions)

        Obj = getattr(__import__(typePath, fromlist=[typeName]), typeName)
    
        obj = Obj(entityName)
    
        obj.loadFromHDF5Handle(entity)
    
        objs.append(obj)
        
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
            if versions.has_key(package):
                type = type + package + '.'
            else:
                type = type + package.split('_')[0] + '.'
        else:
            if versions.has_key(package):
                type = type + package + '_' + versions[package] + '.'
            else:
                type = type + package + '.'
    
    return (type + typeName), typeName

def getVersions(f):
    versions = {}
    for package,ver in f.attrs.iteritems():
        versions[package] = ver
        
    return versions   
    
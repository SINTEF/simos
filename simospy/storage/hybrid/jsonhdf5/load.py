import json
#import imp

def load(filePath):
    print("loading json file %s"%filePath)
    
    f = open(filePath,'r')
    data = f.read()
    f.close()
    
    dd = json.loads(data)
    
    print dd["__type__"]
    
    typePath, typeName = makeTypePath(dd["__type__"], dd["__versions__"])
    
    Obj = getattr(__import__(typePath, fromlist=[typeName]), typeName)
    
    obj = Obj()
    
    obj.loadFromJSONDict(dd)
    
    return obj
    
def makeTypePath(fullTypeName, versionData):
    packages = fullTypeName.split(':')
    typeName = packages[-1]
    packages = packages[0:-1]
    
    versions = getVersions(packages, versionData)
    
    myType = ''
    for package,version in zip(packages,versions):
        myType = myType + package + '_' + version + '.'
    
    return (type + typeName), typeName

def getVersions(packages, versionData):
    versions = []
    for package in packages:
        versions.append(versionData[package])
        
    return versions
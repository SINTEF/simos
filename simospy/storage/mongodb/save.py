
def save(obj, filePath=None):
    if filePath == None:
        filePath = obj.name + '.json'
        
    print("saving json file %s"%filePath)
    
    f = open(filePath, 'w')
    f.write(obj.jsonRepr())
    f.close()
    
    
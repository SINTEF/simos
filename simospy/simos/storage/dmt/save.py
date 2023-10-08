
def save(obj, filePath=None, libs_alias=[]):
    if filePath == None:
        filePath = obj.name + '.json'
        
    print(("saving json file %s"%filePath))
    
    f = open(filePath, 'w')
    dmt_rep = obj.dmtRepr()

    for lib in libs_alias:
        dmt_rep = dmt_rep.replace(lib['source']+"/", lib['target']+":")

    f.write(dmt_rep)
    f.close()
    
    
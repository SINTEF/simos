import h5py
import numpy as np

#---------------------------------------------------------------------------
def sweep(item, cmd=None):
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
def isString(txt):
    if (type(txt) == type("")) or (type(txt) == np.string_) or isinstance(txt, str):
        return True
    else :
        return False


#---------------------------------------------------------------------------
def isStringArray(arr):
    shape = getShape(arr)
    item = arr
    if (len(shape) > 0):
        for d in shape:
            item = item[0]
    return isString(item)
#---------------------------------------------------------------------------
def isByteArray(arr):
    shape = getShape(arr)
    item = arr
    if (len(shape) > 0):
        for d in shape:
            item = item[0]
    return isinstance(item, bytes)
#---------------------------------------------------------------------------
def getShape(arr):
    shape = []
    if (isinstance(arr,(list,np.ndarray))):
        if (len(arr) == 0):
            return shape
        shape += [len(arr)]
        shape += getShape(arr[0])
        return shape
    else :
        return shape
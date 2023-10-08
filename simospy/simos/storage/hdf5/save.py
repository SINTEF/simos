import h5py
import numpy as np
import simos.tools as stools

#---------------------------------------------------------------------------
#---------------------Save HDF5 functions ----------------------------------
#---------------------------------------------------------------------------
def saveToHDF5HandleItem(ent, handle, varName, myType, ungroup=False):
    saveFlag = True
    if (saveFlag):
        if (myType == "AtomicSingle"):
            _saveToHDF5HandleItemAtomicSingle(ent, handle, varName)
        if (myType == "AtomicArray"):
            _saveToHDF5HandleItemAtomicArray(ent, handle, varName)
        if (myType == "NonAtomicArray") and not(ungroup):
            _saveToHDF5HandleItemNonAtomicArray(ent, handle, varName)
        if (myType == "NonAtomicArray") and ungroup:
            _saveToHDF5HandleItemNonAtomicArrayUngroup(ent, handle, varName)
        if (myType == "NonAtomicSingle"):
            _saveToHDF5HandleItemNonAtomicSingle(ent, handle, varName)
        ent._sync[varName] = -1
#-----------------------------------------------------------------------------#    
def _saveToHDF5HandleItemAtomicSingle(ent, handle, varName):
    if (ent.isSet(varName)):
        if (ent.isContained(varName) ):
            data = getattr(ent,varName)
            if (stools.isString(data)):
                data = data.encode('ascii')
            handle[varName] = data
            ent._saved[varName] = handle[varName].ref
    pass
#-----------------------------------------------------------------------------#
def _saveToHDF5HandleItemAtomicArray(ent, handle, varName):
    if (ent.isSet(varName)):
        if (ent.isContained(varName) ):
            data = getattr(ent,varName)
            if (stools.isStringArray(data)):
                data = stools.sweep(data, "item.encode('ascii')")
            handle[varName] = np.asarray(data)
            ent._saved[varName] = handle[varName].ref
    pass
#-----------------------------------------------------------------------------#
def _saveToHDF5HandleItemNonAtomicSingle(ent, handle, varName):
    ref_dtype = h5py.special_dtype(ref=h5py.Reference)
    if (ent.isSet(varName)):
        if (ent.isContained(varName)):
            dgrp = None
            if not(varName in list(handle.keys())):
                dgrp = handle.create_group(varName)
            else:
                dgrp = handle[varName]
            getattr(ent, varName)._saveDataToHDF5Handle(dgrp)
        elif not(getattr(ent, varName).REF == None ):
            raise Exception("referenced single value is not implemented.")
#-----------------------------------------------------------------------------#
def _saveToHDF5HandleItemNonAtomicArray(ent, handle, varName):
    ref_dtype = h5py.special_dtype(ref=h5py.Reference)
    if (ent.isSet(varName)):
        itemNames = []
        maindgrp = None
        if not(varName in list(handle.keys())):
            maindgrp = handle.create_group(varName)
        else:
            maindgrp = handle[varName]
        
        arr = getattr(ent, varName)
        shape = stools.getShape(arr)
        
        if len(shape) > 1:
            raise Exception("multi-dimensional array of non atomic type is not supported yet.")
        
        if (ent.isContained(varName)):
            for i0 in range(0,len(arr)):
                item = arr[i0]
                itemNames.append(item.name.encode('ascii'))
                dgrp = None
                if not(item.name in list(maindgrp.keys())):
                    dgrp = maindgrp.create_group(item.name)
                else:
                    dgrp = maindgrp[item.name]
                arr[i0]._saveDataToHDF5Handle(dgrp)
            maindgrp.attrs["order"] =  itemNames
        else:
            for i0 in range(0,len(arr)):
                item = arr[i0]
                itemNames.append(item.name.encode('ascii'))
                if not(item.REF == None ):
                    handle.create_dataset(item.name,data=item.REF, dtype=ref_dtype )
            maindgrp.attrs["order"] =  itemNames
#-----------------------------------------------------------------------------#
def _saveToHDF5HandleItemNonAtomicArrayUngroup(ent, handle, varName):
    ref_dtype = h5py.special_dtype(ref=h5py.Reference)
    if (ent.isSet(varName)):
        itemNames = []
        maindgrp = handle
        
        arr = getattr(ent, varName)
        shape = stools.getShape(arr)
                
        if (ent.isContained(varName)):
            for i0 in range(0,len(arr)):
                item = arr[i0]
                itemNames.append(item.name.encode('ascii'))
                dgrp = None
                if not(item.name in list(maindgrp.keys())):
                    dgrp = maindgrp.create_group(item.name)
                else:
                    dgrp = maindgrp[item.name]
                arr[i0]._saveDataToHDF5Handle(dgrp)
            existingOrder = None
            if ("order" in list(maindgrp.attrs.keys())):
                existingOrder = maindgrp.attrs["order"]
                if not(isinstance(existingOrder,np.ndarray)):
                    if not(existingOrder==""):
                        existingOrder = np.array([a.encode('ascii') for a in existingOrder.split(",")])
            if isinstance(existingOrder,np.ndarray):
                itemNames =  list(existingOrder) + itemNames
            maindgrp.attrs["order"] =  itemNames
        else:
            raise Exception("referenced items are not supported yet")

#---------------------------------------------------------------------------
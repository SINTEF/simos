

from .hdf5.Server import Server as h5Server
from .mongodb.Server import Server as mongoServer

def getDataStorageBackEndServer(type):
    if type == 'hdf5':
        return h5Server()
    elif type == 'mongodb':
        return mongoServer()
    else:
        raise Exception("Data storage back-end " + type + " is not defined yet.")
        
    
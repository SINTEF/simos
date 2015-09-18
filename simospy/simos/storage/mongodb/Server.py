try:
    import pymongo
except:
    print "***** please install pymongo. *****"
    
import os

class Server(object):
    
    def __init__(self,  url='localhost',    port=27017, 
                        username=None,      password=None):
        self.url = url
        self.port = port
        self.username = username
        self.password = password
        
        self._handle = None
        
        self.collectionName = None
        self.dbName = None
        
        self.path = []
        
        self.id = None
        
    def connect(self, url=None,    port=None, 
                        username=None,      password=None):
        if url != None:
            self.url = url
        if port != None:
            self.port = port
        if username != None:
            self.username = username
        if password != None:
            self.password = password            
 
        self._handle = pymongo.MongoClient(self.url, self.port)

    def disconnect(self):    
        if self.isConnected():
            self._handle.close()
        self._handle = None
            
    @property
    def handle(self):
        return self._handle

    @handle.setter
    def handle(self, h):
        self._handle = h

    @property
    def db(self):
        if self.dbName != None:
            return self._handle[self.dbName]
        else:
            return None
    @property
    def collection(self):
        if self.collectionName != None:
            return self.db[self.collectionName]
        else:
            return None

    @property
    def data(self):
        if self.id != None:
            doc = self.collection.find_one({"_id": self.id})
            
            if len(self.path) == 0:
                return doc
            else:
                lev = doc
                for p in self.path:
                    lev = lev[p]
                    
                return lev
        else:
            return None
        
    @property
    def backEnd(self):
        return "mongodb"

    def isConnected(self):
        if (self.handle == None) :
            return False
        elif (self.handle.alive() == False):
            return False
        elif self.db == None:
            return False
        elif self.collection == None:
            return False
        else:
            return True

        
    
    def clone(self):
        n = Server(self.url, self.port, self.username, self.password)
        n.handle = None
        n.path = list(self.path)
        n.dbName = self.dbName
        n.collectionName = self.collectionName
        n.id = self.id
        
        return n
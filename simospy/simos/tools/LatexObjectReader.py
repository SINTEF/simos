import h5py
import numpy as np

import os
import importlib
import pyparsing as pp
parser = pp.nestedExpr('{', '}')

#---------------------------------------------------------------------------
DDCommandSetFlags = ['name', 'command', 'nargs', 'desc', 'syntax', 'example']
DDCommandSet = [ 
                 ['package', r'\DDpackage', 1, 
                  'define the main package', 
                  r'\DDpackage{package name}', 
                  r'\DDpackage{maf_r1:process}'],
                
                 ['model',   r'\DDmodel',   1, 
                  'define the main model',   
                  r'\DDmodel{model name}', 
                  r'\DDmodel{marf_r1:process:Task}'],
                                
                 ['create', r'\DDcreate',     4, 
                  'create an object from a class, and set properties using a key-value pair, (notice double :: and ,, in the syntax)',  
                  r'\DDcreate{class path}{latex command}{title: latex command input}{key1::value1,, key2::value2} ',
                  r'\DDcreate{Reference}{\cite}{bib:book2000}{label::bib:book2000,, info::my important book}'],

                 ['set',   r'\DDset',   3, 
                  'set a property inside an object, to be used in the object block',  
                  r'\DDset{property name}{latex command}{value: latex commands input}',
                  r'\DDset{required}{\comment}{true}'],            
                
                 ['begin',   r'\DDbegin',   3, 
                  'open create block for an object from a class',  
                  r'\DDbegin{class path}{latex command}{title: latex commands input}',
                  r'\DDbegin{Task}{\chapter}{Chapter 1}'],
                
                 ['end',     r'\DDend',     2, 
                  'close create block for an object from a class',  
                  r'\DDend{class path(optional)}{title(optional)}',
                  r'\DDend{Task}{Chapter 1}'],
                
                 ['beginList', r'\DDbeginList',   3, 
                  'open a list block for a list of objects, used inside another object.',  
                  r'\DDbeginList{property name}{latex command}{name}',
                  r'\DDbeginList{tasks}{\comment}{my steps}'],
                
                 ['endList',   r'\DDendList',     2, 
                  'close a list block for a list of objects, used inside another object.',  
                  r'\DDendList{property name(optional)}{name(optional)}',
                  r'\DDendList{tasks}{my steps}'],
                
                ['include', r'\DDinclude', 1, 
                  'include a file in latex', 
                  r'\DDinclude{file name}', 
                  r'\DDinclude{chapter.tex}'],                
                 
                ]

CMDs = {}
nArgs = {}

for c in DDCommandSet:
    CMDs[c[0]] = c[1]
    nArgs[c[0]] = c[2]

#-----------------------------------------------------------------------------#
class FileLineWrapper(object):
    def __init__(self, f):
        self.f = f
        self.line = 0
    def close(self):
        return self.f.close()
    def readline(self):
        self.line += 1
        return self.f.readline()
    @property
    def closed(self):
        return self.f.closed    
    # to allow using in 'with' statements 
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()
#-----------------------------------------------------------------------------#
class LatexSource():
    def __init__(self, path):
        self._path = path
        self._package = None      
        self._model = None        
        self._file = None
                
    @ property
    def path(self):
        return self._path
    
    @ path.setter
    def path(self, path):
        self._path = path

    @ property
    def name(self):
        parts = self._path.split(os.pathsep)
        return parts[-1]

    @ property
    def folder(self):
        parts = self._path.split(os.pathsep)
        return os.pathsep.join(parts[0:-1])
    
    @property
    def package(self):
        if self._package != None:
            return self._package
        
        f = FileLineWrapper(open(self.path, 'r'))
        while True:
            line = f.readline()
            if line == "":
                #end of file
                self._closeFile()
                break            
            if CMDs['package'] in  line:
                line = line.replace(CMDs['package'], '').strip()
                self._package = line.replace('{','').replace('}','').strip().replace(':','.')
                break
                                
        f.close()
        if self._package == None:
            raise Exception("main package is not defined, e.g. \\DDpackage{marf_r1:process}.")
        
        return self._package

    @property
    def model(self):
        if self._model != None:
            return self._model
        
        f = FileLineWrapper(open(self.path, 'r'))
        while True:
            line = f.readline()
            if line == "":
                #end of file
                self._closeFile()
                break            
            if CMDs['model'] in  line:
                line = line.replace(CMDs['model'], '').strip()
                self._package = line.replace('{','').replace('}','').strip().replace(':','.')
                break
                                
        f.close()
        if self._package == None:
            raise Exception("main model is not defined, e.g. \\DDmodel{marf_r1:process:Task}.")
        
        return self._package
        

    @ property
    def line(self):
        return self._file.line
                
    def open(self):
        self._file = FileLineWrapper(open(self.path, 'r'))
        
    def close(self):
        if not self._file.closed:
            self._file.close()
              
    def readLine(self, val=None):
        if not self._file:
            self.open()
            
        if val != None:
            self._file.seek(val)
        line =  self._file.readline()
        
        if line =="":
            self.close()
            
        return line     

   
#-----------------------------------------------------------------------------#
class LatexObjectReader():
    def __init__(self, filePath=None, latexSource=None):
        if filePath != None and latexSource==None:
            self._file = LatexSource(filePath)
        elif filePath == None and latexSource != None:
            self._file = latexSource
        else:
            raise Exception("either filePath or latexSource object must be given.")
        
        self._obj = None
        self._objList = []
        
        self._readingList = False
        
        self._count = 0
        self._listCount = 0
        
    def _readCommand(self, line, commands=CMDs.keys()):
        for cmd in commands:
            if (CMDs[cmd]+'{' in line):
                line = line.replace(CMDs[cmd], '').strip()
                while True:
                    #counting nests
                    diffCount = line.count('{') - line.count('}')
                    #add more lines                        
                    if diffCount == 0:
                        break
                    else:
                        line += '\n' + self._file.readLine().rstrip()

                #print("running : %s"%('_run_'+cmd))
                
                if not hasattr(self, '_run_'+cmd):
                    raise Exception("%s is not defined as a command.")
                
                func = getattr(self, '_run_'+cmd)
                res = func(line)
                if self._readingList and res != []:
                    #check unique name 
                    if res[0].name in [a.name for a in self._objList]:
                        raise Exception("(%s : Line:%d) an object with this name already exist in the list. Please use unique names.\n%s"%(self._file.name, self._file.line, res))
                    
                    self._objList += res
                elif len(res)>0:
                    self._obj = res[0]
                
                #print("self._objList: %s"%self._objList)
                   
    def _getArgs(self, cmd, line):
        args = []
        for toks, start, end in parser.scanString(line):
            args.append(line[start+1:end-1])
        
        if len(args) != nArgs[cmd]:
            print(args)
            raise Exception("(Line:%d) %s command: (%d) arguments were expected, (%d) were read."%(self._file.line, cmd, nArgs[cmd], len(args)) )
                                
        return args

    def _parsePart(self, endFunc=None):
        #print(" ****** file = %s"%self._file.path)
        while True:
            line = self._file.readLine()
            #print(line)
            if line == "":
                #end of file
                break
            if line[0] != '%': #ignore comments
                self._readCommand(line)
                
            if endFunc != None:
                if endFunc(line):
                    break                
                        
    ############################################################################  
    def parse(self):
        self._file.open()
        
        self._parsePart()
        
        self._file.close()
        
        if self._readingList:
            res = self._objList
        else:
            res = [self._obj]
        return res
                 
    ############################################################################  
    def _run_package(self, line):
        return []     

    def _run_model(self, line):
        return []
        
    def _run_include(self, line):
        args = self._getArgs('include', line)
        filePath = os.path.join(self._file.folder, args[0]+'.tex')
        reader = LatexObjectReader(filePath=filePath)     
        reader._file._package = self._file._package
        reader._obj = self._obj
        reader._count = self._count
        reader._listCount = self._listCount
        reader._readingList = self._readingList
        
        txtind = ''.join((self._count+self._listCount)*['  '])
        print("%s **including file %s"%(txtind, reader._file.path))
        return reader.parse()
    
    def _run_begin(self, line):
        reader = LatexObjectReader(latexSource=self._file)        
        reader._count += 1
                
        args = self._getArgs('begin', line)
        model = args[0]
        mod = importlib.import_module(self._file.package+ '.' + model, package=model)
        reader._obj = getattr(mod, model)()
        
        reader._obj.label = args[2]
        reader._obj.name = reader._obj.label.replace(' ','_')
    
        txtind = ''.join((self._count+self._listCount)*['  '])
        print("%s reading object (%s): %s"%(txtind, model,reader._obj.label) )

        reader._parsePart(endFunc=reader._isEnd)
    
        return [reader._obj]
        
    def _isEnd(self, line):
        if self._count == 0:
            return True
        else:
            return False

    def _isEndList(self, line):
        if self._listCount == 0:
            return True
        else:
            return False
                
    def _run_end(self, line):
        #a block has ended
        self._count += -1
        return []
    
    def _run_create(self, line):
                
        args = self._getArgs('create', line)
        model = args[0]
        mod = importlib.import_module(self._file.package+ '.' + model, package=model)
        obj = getattr(mod, model)()
        
        obj.label = args[2]
        obj.name = obj.label.replace(' ','_')
        
        pairs = args[3].split(',,')
        for pair in pairs:
            [key, val] = pair.split("::")
            
            self._setObjProp(obj, key.strip(), val.strip())
                
        txtind = ''.join((self._count+self._listCount)*['  '])
        print("%s creating object (%s): %s"%(txtind, model,obj.label) )
        

        return [obj]
        
    def _run_set(self, line):
        args = self._getArgs('set', line)
        attName = args[0].strip()
        attVal = args[2]

        txtind = ''.join((self._count+self._listCount)*['  '])
        print("%s setting property (%s)"%(txtind, attName) )
            
        self._setObjProp(self._obj, attName, attVal)
        
        return []

    def _setObjProp(self, obj, attName, attVal):

        if not hasattr(obj, attName):
            raise Exception("%s, does not have the attribute %s."%(type(obj), attName))
                    
         
        attType = obj.getPropModel(attName)['type']
        if attType == 'boolean':
            if (attVal.strip().lower() == 'true') or (attVal.strip().lower() == 'yes'):
                attVal = True
            elif (attVal.strip().lower() == 'false') or (attVal.strip().lower() == 'no'):
                attVal = False
            else:
                raise Exception("input %s for boolean prop %s in %s is unacceptable."%(attVal, attName, type(obj)))
                
        if attName == 'name':
            attVal = attVal.replace(':','__')
            
        setattr(obj, attName, attVal)
        
        
    def _run_beginList(self, line):
        args = self._getArgs('begin', line)
        attName = args[0].strip()
        if not hasattr(self._obj, attName):
            raise Exception("%s, does not have the attribute %s."%(type(self._obj), attName))
        
        reader = LatexObjectReader(latexSource=self._file)
        reader._readingList = True
        
        reader._listCount += 1
        reader._parsePart(endFunc=reader._isEndList)
        
        #print("read list : %s"%(reader._objList))
        
        txtind = ''.join((self._count+self._listCount)*['  '])
        print("%s reading list: %s"%(txtind, attName) )
                
        setattr(self._obj, attName, reader._objList)
        
        return []
             
    def _run_endList(self, line):
        self._listCount -= 1

        return []          
    ############################################################################  
        
  
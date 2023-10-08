import h5py 

import numpy as np

def generalSOFTFormatToSIMA(infile, outfile=None):
   if outfile == None:
      nameParts = infile.split('.')
      outfile =  ''.join(nameParts[0:-1]) + '_SIMA.' + nameParts[-1]
      
   def getItemFor(inh, attr):
      for item in list(inh.keys()):
         if 'simaAttr' in inh[item].attrs:
            if inh[item].attrs['simaAttr'] == attr:
               return item
      return None
            
   def writeItems(inh, outh):
      #print inh
      if 'simaObjectName' in inh.attrs:
         objName = inh.attrs['simaObjectName']
         if objName == 'collection':
            print("exporting a collection:\t" + str(inh))
            dgrp = outh.create_group(inh["name"].value)
            for item in list(inh.keys()):
               writeItems(inh[item], dgrp)
         elif objName == 'equidistantData':
            print("exporting a equidistantData:\t" + str(inh))
            dataItem = getItemFor(inh, "data")
            #print dataItem
            if dataItem == None:
               raise Exception('sima attributes for data does not found.')
            else:
               outh[inh["name"].value] = inh[dataItem][...]
               
            attrsList = ['xunit', 'yunit', 'delta', 'start', 'body']
            for attr in attrsList:
               item = getItemFor(inh, attr)
               if item == None:
                  raise Exception('sima attributes for ' + item + ' does not found.')
               else:
                  outh[inh["name"].value].attrs[attr] = inh[item].value
         elif objName == 'nonEquidistantData':
            print("exporting a nonEquidistantData:\t" + str(inh))
            xdataItem = getItemFor(inh, "xdata")
            ydataItem = getItemFor(inh, "ydata")
            #print dataItem
            if ((xdataItem == None) or (ydataItem == None)) :
               raise Exception('sima attributes for data does not found.')
            else:
               outh[inh["name"].value] = np.asarray([inh[xdataItem][...], inh[ydataItem][...]])
               
            attrsList = ['xunit', 'yunit', 'body']
            for attr in attrsList:
               item = getItemFor(inh, attr)
               if item == None:
                  raise Exception('sima attributes for ' + item + ' does not found.')
               else:
                  outh[inh["name"].value].attrs[attr] = inh[item].value

         elif objName == 'scalar':
            print("exporting a scalar data:\t" + str(inh))
            dataItem = getItemFor(inh, "data")
            #print dataItem
            if dataItem == None:
               raise Exception('sima attributes for data does not found.')
            else:
               outh[inh["name"].value] = inh[dataItem].value
               
            attrsList = ['yunit']
            for attr in attrsList:
               item = getItemFor(inh, attr)
               if item == None:
                  raise Exception('sima attributes for ' + item + ' does not found.')
               else:
                  outh[inh["name"].value].attrs[item] = inh[item].value
         elif objName == 'scalar':
            print("exporting a scalar data:\t" + str(inh))
            dataItem = getItemFor(inh, "data")
            #print dataItem
            if dataItem == None:
               raise Exception('sima attributes for data does not found.')
            else:
               outh[inh["name"].value] = inh[dataItem].value
               
            attrsList = ['yunit']
            for attr in attrsList:
               item = getItemFor(inh, attr)
               if item == None:
                  raise Exception('sima attributes for ' + item + ' does not found.')
               else:
                  outh[inh["name"].value].attrs[item] = inh[item].value
            
         else:
            raise Exception('SIMAObjectName ' + objName + ' is not known.')
      else:
         print("not sima transformable data ...:\t" + str(inh))
      
   inf = h5py.File(infile,'r')
   outf =  h5py.File(outfile,'w')
   
   writeItems(inf,outf)
   
   outf.close()
   inf.close()
   
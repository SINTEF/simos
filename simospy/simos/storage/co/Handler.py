
# -*- coding: utf-8 -*-
"""
Created on Wed Oct 21 18:44:28 2009

@author: tken

Re-shaped by Babak Ommani, 11.08.2015
"""

import sys
import struct
import h5py
import numpy as np

from pyfoma.containers import XYArray as XYArr
from pyfoma.plotting import PlotYofXArray as XYPlot

def get_bits(x,p,n):
    """ Get 'n' bits from position 'p' of a 32-bits value 'x' """
    return(x >> (p+1-n)) & ~(~0 << n);

def hp_to_ieee(hp_real):
    """ This function converts HP1000 4 bytes floating
        numbers to IEEE format floating numbers.
        ieee = hp_to_ieee(hp_real) """
    signexp = get_bits(hp_real,0,1)
    # Fetch exponent from bits 1 to 7 
    exponent = get_bits(hp_real,7,7)
    # Fetch fraction from bits 8 to 30 */
    fraction = get_bits(hp_real,30,23)
    # Fetch sign bit for fraction in bit 31 */
    sign = get_bits(hp_real,31,1)
    # Check if the value is negative, if so
    # find it's two's complement of fraction's 23 bits
    if (sign == 1): fraction = (~(fraction) & 037777777) + 1
    x = fraction; # Value is positive
    # But don't forget the sign
    if (sign == 1): x = -(x)
    # Check for size of exponent
    if (signexp == 1): move_point = exponent - 0200
    else:              move_point = exponent
    # Move the decimal point up or down
    # depending on the  value of the exponent
    base = 2.0;
    y    = 23.0 - move_point;
    # Return the IEEE format real 
    return x / pow(base,y);


class COFile(object):
    """
        Class for COXXXX files (hydrolab)
    """
    #-------------------------------------------------------------------------#
    def __init__(self,filename="dummy", modelScale =1.0):
        self.filename=filename
        
        self.units = { \
                  'm':        {'scalefactor':1.0,         'scalepower':1.0, 'outunit':'m'},
                  'M':        {'scalefactor':1.0,         'scalepower':1.0, 'outunit':'m'},
                  'm/s':      {'scalefactor':1.0,         'scalepower':0.5, 'outunit':'m/s'},
                  'M/S':      {'scalefactor':1.0,         'scalepower':0.5, 'outunit':'m/s'},
                  'm/s**2':   {'scalefactor':1.0,         'scalepower':0.0, 'outunit':'m/s**2'},
                  'M/S**2':   {'scalefactor':1.0,         'scalepower':0.0, 'outunit':'m/s**2'},
                  'm/s^2' :   {'scalefactor':1.0,         'scalepower':0.0, 'outunit':'m/s**2'},
                  'M/S^2' :   {'scalefactor':1.0,         'scalepower':0.0, 'outunit':'m/s**2'},
                  'deg/s**2': {'scalefactor':1.0,         'scalepower':-1., 'outunit':'m/s**2'},
                  'DEG/S**2': {'scalefactor':1.0,         'scalepower':-1., 'outunit':'m/s**2'},
                  'deg/s^2' : {'scalefactor':1.0,         'scalepower':-1., 'outunit':'m/s**2'},
                  'DEG/S^2' : {'scalefactor':1.0,         'scalepower':-1., 'outunit':'m/s**2'},
                  'deg':      {'scalefactor':1.0,         'scalepower':0.0, 'outunit':'deg'},
                  'DEG':      {'scalefactor':1.0,         'scalepower':0.0, 'outunit':'deg'},
                  'DEG.':      {'scalefactor':1.0,         'scalepower':0.0, 'outunit':'deg'},
                  'N':        {'scalefactor':1.025/1000., 'scalepower':3.0, 'outunit':'kN'},
                  'Nm':       {'scalefactor':1.025/1000., 'scalepower':4.0, 'outunit':'kNm'},
              }
        
        self.modelScale = modelScale
        
        self.read_header()
        #self.print_summary()
    #-------------------------------------------------------------------------#
    def bread(self,loc,fmt,reclen):
        self.COXXXX.seek(loc)
        return struct.unpack(fmt,self.COXXXX.read(reclen))
    #-------------------------------------------------------------------------#
    def read_header(self):
        """ Reads header info of CO file """
        #print "Opening %s for reading" % self.filename
        self.COXXXX              = open(self.filename,'rb')
        self.SystemIdentifier,   = self.bread(0,"4s",4)
        self.fileno,             = self.bread(4,">h",2)
        self.CORA,               = self.bread(6,"2s",2)
        self.Testno,             = self.bread(8,'>h',2)
        self.TimeInfoString,     = self.bread(10,"30s",30)
        self.NcontrolChannels,   = self.bread(40,">h",2)
        self.NestimateChannels,  = self.bread(42,">h",2)
        self.TestIdString,       = self.bread(44,'40s',40)        
        self.NsamplesPerChannel, = self.bread(84,">h",2)
        if self.NsamplesPerChannel < 0: 
            self.NsamplesPerChannel, = self.bread(10040,">l",4)
        self.MaxNinputChannels,  = self.bread(86,">h",2)
        self.NordinaryChannels,  = self.bread(88,">h",2)
        self.NoctoposChannels,   = self.bread(90,">h",2)
        self.NderivedChannels,   = self.bread(92,">h",2)
        self.HeadSize,           = self.bread(96,">h",2)
        self.HeadSize            = 2*self.HeadSize #(2 bytes per word)
        
        # Get the sample interval time
        self.SampleIntervalTime, = self.bread(94,">h",2)
        if self.SampleIntervalTime < 0.:
            hp_real, = self.bread(10044,">l",4)
            self.SampleIntervalTime = hp_to_ieee(hp_real)
        else: # it is in integer msecs => convert to real seconds
            self.SampleIntervalTime = self.SampleIntervalTime / 1000.
        if (self.SystemIdentifier == 'SYS5'):
            self.SampleIntervalTime, = self.bread(13952,">d",8)
        
        # Get the Names and Units of the Derived Channels 
        # Also get remaining additional info related to SYS5
        self.NamesOfDerivedChannels = [None]*self.NderivedChannels
        self.UnitsOfDerivedChannels = [None]*self.NderivedChannels
        if (self.SystemIdentifier == 'SYS4'):
            for i in range(0,self.NderivedChannels):
                self.NamesOfDerivedChannels[i], = self.bread(3600+i*12,">12s",12)
            for i in range(0,self.NderivedChannels):
                self.UnitsOfDerivedChannels[i], = self.bread(5040+i*8,">8s",8)
        else: # self.SystemIdentifier == 'SYS5'
            for i in range(0,self.NderivedChannels):
                self.NamesOfDerivedChannels[i], = self.bread(10048+i*20,">20s",20)
            for i in range(0,self.NderivedChannels):
                self.UnitsOfDerivedChannels[i], = self.bread(12448+i*12,">12s",12)
            self.TestIdString, = self.bread(13888,"60s",60)
            if self.HeadSize > 6974*2 or self.Testno > 32767:
                self.Testno,       = self.bread(13948,">l",4)
        
        # Prepare additional info/arrays for reading time series
        self.Reclen    =   self.NderivedChannels*4
        self.Startloc  =  (self.HeadSize/self.Reclen+1)* self.Reclen
        if self.HeadSize % self.Reclen == 0: self.Startloc = self.HeadSize
        self.EndOfTime = self.NsamplesPerChannel*self.SampleIntervalTime
        
        # Close the COfile
        self.COXXXX.close()
    #-------------------------------------------------------------------------#
    def Hs(self):
       return float(self.TestIdString.split()[1][1:])
    def Tp(self):
       return float(self.TestIdString.split()[2][1:])
    def Vw(self):
       return float(self.TestIdString.split()[3][1:])
    def Vc(self):
       return float(self.TestIdString.split()[4][1:])
    def mtID(self):
       return str(self.Testno)
    #-------------------------------------------------------------------------#
    def print_summary(self):
        print '%10s: %d'   % ('Test no.', self.Testno)
        print '%10s: %40s' % ('Test Str', self.TestIdString)
        print '%10s: %30s' % ('Time Str', self.TimeInfoString)
        print '%10s: %d'   % ('NoChannels', self.NderivedChannels)
        print '%10s: %e'   % ('Time Step', self.SampleIntervalTime)
        self.listChannels()
        

    #-------------------------------------------------------------------------#
    def export(self, j,modelscale,scalefactor,scalepower,outunit=None,outdir=None,t_sample=None):
        if outunit is None:
            outunit = self.UnitsOfDerivedChannels[j]

        #print "Opening %s for reading" % self.filename
        self.COXXXX=open(self.filename,'rb')
        self.data = [None]*self.NsamplesPerChannel # for storage
        if self.SystemIdentifier == 'SYS4':
            for i in range(0,self.NsamplesPerChannel):
                loc = self.Startloc + j*4 + i*self.NderivedChannels*4
                hp_real, = self.bread(loc,">l",4)
                self.data[i] = hp_to_ieee(hp_real)
        else: # self.SystemIdentifier == 'SYS4'                    
            for i in range(0,self.NsamplesPerChannel):
                loc = self.Startloc + j*4 + i*self.NderivedChannels*4
                self.data[i], = self.bread(loc,">f",4)
        #filename = '%d_chn%03d_%s.dat' % (self.Testno,j+1,'_'.join(self.NamesOfDerivedChannels[j].split()))
        filename = 'chn%03d_%s.dat' % (j+1,'_'.join(self.NamesOfDerivedChannels[j].split()))
        filename_header = 'chn%03d_%s_info.dat' % (j+1,'_'.join(self.NamesOfDerivedChannels[j].split()))
        if outdir is not None:
            if not outdir.endswith('/'): outdir += '/'
            filename = outdir + filename
            filename_header = outdir + filename_header
        
        factor = scalefactor*modelscale**scalepower
        f = open(filename,'w')
        f_header = open(filename_header,'w')
        if t_sample is None:
            dt = self.SampleIntervalTime*modelscale**0.5
        else:
            dt = t_sample*modelscale**0.5
        #f.write('%10s: %d\n'   % ('Test no.',  self.Testno))
        #f.write('%10s: %40s\n' % ('Test Str',  self.TestIdString))
        #f.write('%10s: %30s\n' % ('Time Str',  self.TimeInfoString))
        #f.write('%10s: %e\n'   % ('Time Step', self.SampleIntervalTime))
        #f.write('%10s: %d\n'   % ('Nsamples',  self.NsamplesPerChannel))
        f_header.write('%s\t#Test identifier\n'   % self.TestIdString)
        f_header.write('%s\t#Channel name\n'   % self.NamesOfDerivedChannels[j])
        f_header.write('%d\t\t#Number of samples\n'   % self.NsamplesPerChannel)
        f_header.write('%e\t#Time step\n'  % dt)
        f_header.write('%f\t#Modelscale\n' % modelscale)
        f_header.write('%f\t#Numerical scaling factor\n' % factor)
        f_header.write('%s\t\t#Unit\n'   % outunit)
        f_header.close()
        #f.write('1.0\n')
        for d in self.data: f.write('%.4e\n' % (d*factor))
        f.close()
        # close CO FILE
        self.COXXXX.close()

    #-------------------------------------------------------------------------#
    def export2h5(self, j,modelscale,scalefactor,scalepower,outunit=None,outdir=None,t_sample=None):
        if outunit is None:
            outunit = self.UnitsOfDerivedChannels[j]


        print "Exporting to hdf5"
        self.COXXXX=open(self.filename,'rb')
        self.data = [None]*self.NsamplesPerChannel # for storage
        if self.SystemIdentifier == 'SYS4':
            for i in range(0,self.NsamplesPerChannel):
                loc = self.Startloc + j*4 + i*self.NderivedChannels*4
                hp_real, = self.bread(loc,">l",4)
                self.data[i] = hp_to_ieee(hp_real)
        else: # self.SystemIdentifier == 'SYS4'                    
            for i in range(0,self.NsamplesPerChannel):
                loc = self.Startloc + j*4 + i*self.NderivedChannels*4
                self.data[i], = self.bread(loc,">f",4)


        fout = h5py.File(outdir + '/test.h5' ,'w')

        g = fout.create_group('/%s' % self.Testno)
        
        factor = scalefactor*modelscale**scalepower
        
        g[self.NamesOfDerivedChannels[j]] = np.asarray(self.data)*factor

        fout.close()

        # close CO FILE
        self.COXXXX.close()

    #-------------------------------------------------------------------------#
    def getChannelXY(self, j, t_sample=None, arr=None):
        channelName = self.NamesOfDerivedChannels[j]
        name = channelName.strip().replace(' ','-')
        unit = self.UnitsOfDerivedChannels[j].strip()
        
        scalefactor = self.units[unit]['scalefactor']
        scalepower = self.units[unit]['scalepower']
        outunit = self.units[unit]['outunit']
        
        data,dt = self.get_data(j, self.modelScale, scalefactor,scalepower,outunit,t_sample)
        
        if arr == None:
            arr = XYArr()
        
        arr.name = name
        arr.description = 'channelName:%s, ModelScale:%1.2f, ScaleFactor:%1.1f, ScalePower:%1.1f,'%(channelName,self.modelScale, scalefactor, scalepower)
        arr.value = data
        arr.unit = outunit
        
        arr.xname = 'Time'
        arr.xunit = 's'
        arr.xvalue = np.array(range(len(data)))*dt
        
        return XYArr(data=arr)
    #-------------------------------------------------------------------------#
    def plotChannel(self, j, t_sample=None):
        ch = self.getChannelXY(j,t_sample)
        plotter = XYPlot()
        plotter.plot(ch)
    #-------------------------------------------------------------------------#
    def readToMarmo(self, test, t_sample=None):
        """
        reading the complete CO file into a ModelTest data model from marmo.
        test: marmo model test data mode.
        """
        
        test.name = 'Test%d'%(self.Testno)
        test.description = self.TestIdString
        
        var = test.appendStrings('date')
        var.value = self.TimeInfoString
        var.description = 'recorded date'
        
        var = test.appendScalars('MTSampleTime')
        var.value = self.SampleIntervalTime
        var.unit = 's'
        var.description = 'model test sample time.'
        
        var = test.appendScalars('MTEndTime')
        var.value = self.EndOfTime
        var.unit = 's'
        var.description = 'model test duration.' 
        
        var = test.appendScalars('MTScale')
        var.value = self.modelScale
        var.unit = ''
        var.description = 'model scale.'
                               
        for j,chName in enumerate(self.NamesOfDerivedChannels):
            arr = test.appendScalarArrays('arr')
            self.getChannelXY(j,t_sample, arr)
            
    #-------------------------------------------------------------------------#
    def get_data(self, j,modelscale,scalefactor,scalepower,outunit=None,t_sample=None):
        if outunit is None:
            outunit = self.UnitsOfDerivedChannels[j]

        #print "Opening %s for reading" % self.filename
        self.COXXXX=open(self.filename,'rb')
        self.data = [None]*self.NsamplesPerChannel # for storage
        if self.SystemIdentifier == 'SYS4':
            for i in range(0,self.NsamplesPerChannel):
                loc = self.Startloc + j*4 + i*self.NderivedChannels*4
                hp_real, = self.bread(loc,">l",4)
                self.data[i] = hp_to_ieee(hp_real)
        else: # self.SystemIdentifier == 'SYS4'                    
            for i in range(0,self.NsamplesPerChannel):
                loc = self.Startloc + j*4 + i*self.NderivedChannels*4
                self.data[i], = self.bread(loc,">f",4)
        
        factor = scalefactor*modelscale**scalepower
        if t_sample is None:
            dt = self.SampleIntervalTime*modelscale**0.5
        else:
            dt = t_sample*modelscale**0.5
        
        result = []
        for d in self.data: result.append(d*factor)
        
        # close CO FILE
        self.COXXXX.close()

        return np.array(result),dt
    #-------------------------------------------------------------------------#
    def listChannels(self):
        for i, chn in enumerate(self.NamesOfDerivedChannels):
            print "Chn %i\t %s" % (i, chn)
    #-------------------------------------------------------------------------#
def co2ascii(filename,channel,scalefactor=1.0,scalepower=1.0):
    CO = COFile(filename=filename)    
    CO.export(channel,scalefactor,scalepower)
        


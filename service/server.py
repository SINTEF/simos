import random
from flask import Flask, render_template
from flask import request, jsonify, Response, make_response
import json
import sys,os
import time
import subprocess
import h5py

from marmo_r1.containers.Collection import Collection as SimosCol

import logging
logging.basicConfig(level=logging.DEBUG)
"""
app = Flask(__name__, static_folder='../static/dist', template_folder='../static')

@app.route('/')
def index():
    return render_template('index.html')
"""

jobs = {}
simaProgPath = r'C:\work\equinor\00work\sima\sima'
simaVer = r'sima-3.8.0.v20190515-1839-development-win32.win32.x86_64'
simaExePath = os.path.join(simaProgPath, simaVer, "sima.exe")
casePath = r'C:\work\equinor\00work\sima\00ws\srs_r2'

app = Flask(__name__)

@app.route('/')
def index():
    return "SIMOS is ready..."

@app.route('/simos/<uuid>',  methods=['OPTIONS', 'GET', 'POST']) # take note of this decorator syntax, it's a common pattern
def simos(uuid):
    # It is good practice to only call a function in your route end-point,
    # rather than have actual implementation code here.
    # This allows for easier unit and integration testing of your functions.
    content = request.get_json(force=True)
    print('*******************************', file=sys.stdout)
    app.logger.info(request.args)
    app.logger.info(request.form)
    app.logger.info(request.data)
    #app.logger.info()
    app.logger.info(content)
    print('*******************************', file=sys.stdout)
    res = None
    app.logger.info(uuid)

    if uuid == "0000":
        res = content
    else:
        res = generate(content)
        

    print('*******************************', file=sys.stdout)
    resp = make_response(jsonify(content))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    return resp


@app.route('/progress/<uuid>',  methods=['OPTIONS', 'GET', 'POST']) # take note of this decorator syntax, it's a common pattern
def progress(uuid):
    if uuid in jobs.keys():
        pp = jobs[uuid]
    else:
        pp = 0

    content = {'id': uuid,
               'progress': pp}

    resp = make_response(jsonify(content))
    resp.headers['Access-Control-Allow-Origin'] = '*'

    return resp

def generate(data):

    """
    #writing out the input data
    srsInp = SimosCol('srs_input')

    for item in data.items():
        if (item[0] == 'name'):
            srsInp.name = item[1]
        else:
            try:
                print(item, file=sys.stdout)
                val = float(item[1])
                num = srsInp.appendNumbers(item[0])
                num.value = val
            except:
                num = srsInp.appendStrings(item[0])
                num.value = item[1]            


    srsInp.save(filePath=os.path.join(casePath,'ST_results','SRS', 'inputs','srs_input.h5'))

    print(simaExePath, file=sys.stdout)
    simaCmd = "%s -consoleLog -noSplash -data  \"%s\" -startupCommand no.marintek.sima.workflow.run.batch(task=SRS_Service,workflow=ULS_Intact,exit=true,saveOnExit=true)"%(simaExePath, casePath)
    print(simaCmd, file=sys.stdout)
    
    proc = subprocess.Popen(simaCmd, shell=True)   
    proc.communicate()
    proc.wait()

    jobs[data['id']] = 100

    """

    """
    pp = 0
    
    while (pp<100):
        pp += 1
        time.sleep(0.05)
        jobs[data['id']] = pp
    
    """

    """
    f = h5py.File(os.path.join(casePath,'ST_results','SRS','SRS_service_ULS.h5'),'r')
    SF =  f['lineSF'].value[0]
    f.close()

    data['SF'] = SF
    """
    
    return data

if __name__ == '__main__':
    app.run()

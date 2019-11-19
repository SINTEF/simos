#!/bin/bash

configFile="pathConfig.js"
simos_command="/c/git/simos/simos/runner/node.exe /c/git/simos/simos/ui/shell/simos.js ${configFile}"

echo "matgen.generatePackage('my_new_model_r1')" | $simos_command || exit 1
echo "pygen.generatePackage('my_new_model_r1')" | $simos_command || exit 1

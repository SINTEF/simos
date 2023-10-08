// Here the developer must add the path to the data model and the generated 
// code distination path. Use absolute paths to be able to run it from everywhere.
// Copy this file to pathConfig.js, do the modifications and save.
// Remmember to change also the run script ('shs' in Linux and 'shs.bat' in Windows)

path = require('path');

//Absolute paths
//remmeber entering paths with two path seperators if you want it in windows format: '\\'
//exports.outPath = "E:\\babako\\dev\\frevesBB\\git\\freves\\libraries";
//exports.modelsPaths = ["E:\\babako\\dev\\frevesBB\\git\\freves\\dataModel"];

//Relative paths
exports.outPath = path.resolve(path.join(__dirname, 'code'));
exports.modelsPaths = [path.resolve(path.join(__dirname, 'models'))];
exports.modelsFormat = ['dmt']
exports.codeGenerators = {'python311': {'outPath': 'py311'}}

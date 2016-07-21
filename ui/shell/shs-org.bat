:: Use this file to create dedicated run script for your project's code generator
:: 'shsimos.bar' 
::  	is SIMOS run script and must be already in the system path
:: 	you can give the absolute path as well.
:: 'pathConfig.js'
:: 	is the path configuration file, it is best to have it in absolute path 
::		so it would be possible to run from everywhere. 
:: 
:: Make a copy of the file and remove the 'org'. Then do and save the modifications.
:: The modified file is for your local computer, while the 'org' file stays on the repository.

SET pathConfigFile=E:\\babako\\dev\\frevesBB\\git\\freves\\dataModel\\pathConfig.js
SET simosPath=E:\\babako\\dev\\simos

%simosPath%\runner\node.exe %simosPath%\\ui\\shell\\simos.js %pathConfigFile%

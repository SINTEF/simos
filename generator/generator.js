// -----------------------------------------------------------------------------------------------
// Generator script for generating Fortran and Cpp code representing entities used in
// MEMW and Fates.
//
// This is meant to be run using the ecmash tool:
//    https://stash.code.sintef.no/projects/SOFT/repos/ecmash/browse
//
// Each entity is represented using a JSON structure. For an example, see 'test_entity.json'. This
// data description (or model) is then combined with a code template (or view). These templates are
// written in their original language embedded with JavaScript:
//    generator/entity.f90.js
//    generator/entity.cpp.js
//    generator/entity.h.js
//
// It is important that the entity descriptions (in JSON) are only describing data structure, not
// any logic. For example, default values, initial values and so forth should not be a part
// of the description. The rationale is the following:
//
// The data structure defines how the data types are generated and accessed, but the contents of
// each data type is the responsibility of each models. Although it would be possible to allow
// entities to define default values, models already do this. To prevent sharing responsibilities,
// we are disallowing anything but data _structure_ in json.
//
// Tests for the generated entities are located in
//    Fates/tests/GeneratedEntitiesFortranTests/
//    Fates/tests/GeneratedCppEntitiesTests/
//
// The tests are run on 'test_entity.json', which means that this entity should reflect the full
// set of features encountered in all entities.
//

// -----------------------------------------------------------------------------------------------
// Library include statements. For these to work properly, the environment variable ECMASH_MODULES
// must be set to both 1) the ecmash modules directory and 2) the Fates root folder.
// Example:
//    set ECMASH_MODULES=c:\git\ecmash\src\modules;c:\git\soft_starter_kit\
//
var _ = require('utils.underscore');
var mvc = require('soft.mvc');
var fortranbase = require('generator.fortranbase');

// -----------------------------------------------------------------------------------------------
// Output path, relative to the execution path. This should point at the folder
//    Fates/generated
var generator_output_directory = "../generated";

// -----------------------------------------------------------------------------------------------
// Generator function for Fortran. Returns a function that can be mapped to entity names.
generateEntityFortran = function(output_directory) {
   return function (entityname) {
      var outputFile = "" + output_directory + "/" + entityname + ".f90";

      print("Generating Fortran code for '" + entityname + "'. Generated file written to: " + outputFile);

      var fclass = mvc.create({
          model: "../entities/" + entityname + ".json",
          view:  "entity.f90.js"
      });

      var f90Res = fclass.generate();
      var outputFile = "" + output_directory + "/" + entityname + ".f90";
      writeFile(outputFile, f90Res);
   };
};
//-----------------------------------------------------------------------------------------------
//Generator function for Python. Returns a function that can be mapped to entity names.
collectAllEntities = function(entityname, entityNames, packageDirectory) {
	
	   print("collecting entities for '" + entityname);
	
	   var modelFile = "../entities/" + packageDirectory + "/" + entityname + ".json";
	   var pyclass = mvc.create({
	       model: modelFile,
	       view:  "entity.py.js"
	   });
	   print(pyclass);
	   /*-------------------------------------------*/
	   /*check for cyclic generation of nested types*/
	   var json = readFile(modelFile);
		if (json == undefined)
		    throw ("Illegal file", modelFile);
		
		var model = JSON.parse(json);
		
		PythonBase = require('generator.pythonBase').PythonBase;
	    var entity = new PythonBase(model);
	    var types = entity.getNestedTypes();
	    for (var i = 0; i<types.length; i++) {
	    	if (entityNames.indexOf(types[i]) < 0) {
	    		entityNames.push(types[i]);
	    		
	    		print(entityNames);
	    		
	    		entityNames = collectAllEntities(types[i],entityNames, packageDirectory);
    		}
	    	
	    }
	   /*-------------------------------------------*/
	   return entityNames;
	   
	   
};
//-----------------------------------------------------------------------------------------------
//Generator function for Python. Returns a function that can be mapped to entity names.
generateEntityPython = function(entityname,packageDirectory, output_directory) {
	   var outputFile = "" + output_directory + "/" + entityname + ".py";
	
	   print("Generating Python code for '" + entityname + "'. Generated file written to: " + outputFile);
	
	   var modelFile = "../entities/" + packageDirectory + "/" + entityname + ".json";
	   var pyclass = mvc.create({
	       model: modelFile,
	       view:  "entity.py.js"
	   });
	   print(pyclass);
	   /*-------------------------------------------*/
	   /*check for cyclic generation of nested types*/
	   var json = readFile(modelFile);
		if (json == undefined)
		    throw ("Illegal file", modelFile);
		
		var model = JSON.parse(json);
		
/*		PythonBase = require('generator.pythonBase').PythonBase;
	    var entity = new PythonBase(model);
	    var types = entity.getNestedTypes();
	    for (var i = 0; i<types.length; i++) {
	    	generateEntityPython(types[i],output_directory);
	    }
*/	   /*-------------------------------------------*/
	   var pythonCode = pyclass.generate();
	   var outputFile = "" + output_directory + "/" + packageDirectory + "/"+ 
	   					entityname + ".py";
	   writeFile(outputFile, pythonCode);
	   
	   
};
// -----------------------------------------------------------------------------------------------
// List of entities to generate code for. Each of these will be searched for as a .json file, such
// as 'test_entity.json', which in turn will generate corresponding Fortran or CPP files:
// 'test_entity.f90', 'test_entity.cpp' and 'test_entity.h'.
//
var packageName = 'modelTest';
var packageVersion = 'r1';
var packageTarget =  packageName + '_' + packageVersion;
sys.exec("mkdir " + generator_output_directory + "/" + packageTarget);
sys.exec("touch " + generator_output_directory + "/" + packageTarget + "/__init__.py");

var entities = [
   // Add entities to generate here:
   //'CFD2DShipForcedMotionStudy_V1',
   //'CFD3DShipMoonPoolForcedMotionStudy_V1',
   //'CFD3DShipMoonPoolForcedMotionStudy_V2',
   //'CFD3DShipMoonPoolDomainsArchive_V1',
   //'CFD2DShipForcedMotionStudy_V2',
   //'CFD2DShipDomainsArchive_V1',
   'ModelTestDataCollection'
   //'WAMITSStudy_V1'

   ];


// Generate all entities for Fortran.
//_.each(entities, generateEntityFortran(generator_output_directory))

//Generate all entities for Python.

var allEntities = [];

for (var i=0; i<entities.length; i++){
	allEntities.push(entities[i]);
	allEntities = collectAllEntities(entities[i], allEntities, packageTarget);
}

for (var i=0; i<allEntities.length; i++){
	generateEntityPython(allEntities[i],packageTarget, generator_output_directory);
}

//! @TODO Generate all entities for cpp.
// _.each(entities, generateEntityCpp(generator_output_directory))

print("Done.")

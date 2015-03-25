function NJS(){
	this.constructor();
};
module.exports = function() {return new NJS();};
/*----------------------------------------------------------------------------*/
NJS.prototype.constructor = function() {
	this.sep1 = "*******************************************************";
	this.sep2 = "-------------------------------------------------------";
	
};
/*----------------------------------------------------------------------------*/
NJS.prototype.print = function(str) {
	console.log(str);
};
/*----------------------------------------------------------------------------*/
NJS.prototype.println = function(str) {
	console.log(str);
};
/*----------------------------------------------------------------------------*/
NJS.prototype.exit = function() {
	process.exit();
};
/*----------------------------------------------------------------------------*/
NJS.prototype.printSepLine = function(){
	this.println("*******************************************************");
};
/*----------------------------------------------------------------------------*/
NJS.prototype.printSepLine2 = function(){
	this.println("-------------------------------------------------------");
};
/*----------------------------------------------------------------------------*/
NJS.prototype.createGenerator = function(lang){
	var generator = require('../generator')();
	generator.setLang(lang);
	
	return generator;
};
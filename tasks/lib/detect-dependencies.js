'use strict';
var $ = {
_: require('lodash'),
fs: require('fs'),
lodash: require('lodash'),
path: require('path'),
glob: require('glob')
};
/**
* Detect dependencies of the components from `bower.json`.
*
* @param {object} config the global configuration object.
* @return {object} config
*/
function detectDependencies(config) {
var allDependencies = {};

$._.assign(allDependencies, config.get('bower.json').dependencies);

if (config.get('dev-dependencies')) {
$._.assign(allDependencies, config.get('bower.json').devDependencies);
}


$._.each(allDependencies, gatherInfo(config));
var sorted={};
config.get('detectable-file-types').
forEach(function (fileType) {

sorted[fileType] = prioritizeDependencies(config, '.' + fileType);

});
config.set('global-dependencies-sorted',sorted);

return config;
}
/**
* Find the component's JSON configuration file.
*
* @param {object} config the global configuration object
* @param {string} component the name of the component to dig for
* @return {object} the component's config file
*/
function findComponentConfigFile(config, component) {
var componentConfigFile;
['bower.json', '.bower.json', 'component.json', 'package.json'].
forEach(function (configFile) {
configFile = $.path.join(config.get('bower-directory'), component, configFile);
if (!$._.isObject(componentConfigFile) && $.fs.existsSync(configFile)) {
componentConfigFile = JSON.parse($.fs.readFileSync(configFile));
}
});
return componentConfigFile;
}
/**
* Find the main file the component refers to. It's not always `main` :(
*
* @param {object} config the global configuration object
* @param {string} component the name of the component to dig for
* @param {componentConfigFile} the component's config file
* @return {array} the array of paths to the component's primary file(s)
*/
function findMainFiles(config, component, componentConfigFile) {
var filePaths = [];
var file = {};
var cwd = $.path.join(config.get('bower-directory'), component);


if ($._.isString(componentConfigFile.main)) {
// start by looking for what every component should have: config.main
filePaths = [componentConfigFile.main];
} else if ($._.isArray(componentConfigFile.main)) {
filePaths = componentConfigFile.main;
} else if ($._.isArray(componentConfigFile.scripts)) {
// still haven't found it. is it stored in config.scripts, then?
filePaths = componentConfigFile.scripts;
} else {
config.get('detectable-file-types')
.forEach(function (type) {
file[type] = $.path.join(config.get('bower-directory'), component, componentConfigFile.name + '.' + type);
if ($.fs.existsSync(file[type])) {
filePaths.push(componentConfigFile.name + '.' + type);
}
});
}
var ret= $._.unique(filePaths.reduce(function (acc, filePath) {
acc = acc.concat(
$.glob.sync(filePath, { cwd: cwd, root: '/' })
.map(function (path) {
return $.path.join(cwd, path);
})
);
return acc;
}, []));

return ret;
}
/**
* Store the information our prioritizer will need to determine rank.
*
* @param {object} config the global configuration object
* @return {function} the iterator function, called on every component
*/
function gatherInfo(config) {
/**
* The iterator function, which is called on each component.
*
* @param {string} version the version of the component
* @param {string} component the name of the component
* @return {undefined}
*/
return function (version, component) {
var dep = config.get('global-dependencies').get(component) || {
main: '',
type: '',
name: '',
dependencies: {}
};
	
	
var componentConfigFile = findComponentConfigFile(config, component);
if (!componentConfigFile) {
var error = new Error(component + ' is not installed. Try running `bower install` or remove the component from your bower.json file.');
error.code = 'PKG_NOT_INSTALLED';
throw error;

return;
}
var overrides = config.get('overrides');
if (overrides && overrides[component]) {
if (overrides[component].dependencies) {
componentConfigFile.dependencies = overrides[component].dependencies;
}
if (overrides[component].main) {
componentConfigFile.main = overrides[component].main;
}
}
var mains = findMainFiles(config, component, componentConfigFile);
var fileTypes = $._.chain(mains).map($.path.extname).unique().value();
dep.main = mains;
dep.type = fileTypes;
dep.name = componentConfigFile.name;
var depIsExcluded = $._.find(config.get('exclude'), function (pattern) {
return $.path.join(config.get('bower-directory'), component).match(pattern);
});
if (dep.main.length === 0 && !depIsExcluded) {
// can't find the main file. this config file is useless!
throw new Error("Can't find the main file for '"+dep.name+"'");
}
if (componentConfigFile.dependencies) {
dep.dependencies = componentConfigFile.dependencies;
$._.each(componentConfigFile.dependencies, gatherInfo(config));
}

config.get('global-dependencies').set(component, dep);
};
}

function reduceDepInfo(exclude,f,t,parentdep){
return {
	main:f.main.filter(function (main) {
var b1=$.path.extname(main) === t;

var isExcluded = $._.find(exclude, function (pattern) {
return main.replace(/\\/g, '/').match(pattern).match(pattern);
});
return b1;



}),
  dependencies:collectDependencies(parentdep,f.dependencies)
};}


function collectDependencies(pdeps,deps){
 for (var i in deps){
    if (pdeps[i]==undefined) pdeps[i]=deps[i];
 }
 return pdeps;
}

function collectDependencies(pdeps,deps){

 for (var i in deps){
	 var d=deps[i];
	 collectDependencies(pdeps,d.dependencies);
     var found=false;
     for(var j=0;j<pdeps.length;j++){if (pdeps[j].name!==i) {found= true; break;} }
     if (!found) pdeps.push({name:i,main:d.main});
    
 }
 return pdeps;
}

/**
* Sort the dependencies in the order we can best determine they're needed.
*
* @param {object} config the global configuration object
* @param {string} fileType the type of file to prioritize
* @return {array} the sorted items of 'path/to/main/files.ext' sorted by type
*/
function prioritizeDependencies(config, fileType) {
var dependencies = $._.toArray(config.get('global-dependencies').get()).
filter(function (dependency) {

return $._.contains(dependency.type, fileType);
});
var tdep={};
dependencies.forEach(function(f){	
tdep[f.name]=reduceDepInfo(config.get('exclude'),f,fileType,[]);	
});
return tdep;

}

module.exports = detectDependencies;

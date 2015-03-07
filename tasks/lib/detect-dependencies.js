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

var lo=config.get('local-dependencies');
for(var l in lo){
if (allDependencies[l]!==undefined) throw new Error('the package name '+l+' in le local dependencies is already defined in bower.json');
}

$._.assign(allDependencies, lo);


$._.each(allDependencies, gatherInfo(config));
var gdeps=config.get('global-dependencies');

var keys=gdeps.keys();
for(var e=0;e<keys.length;e++) {
	var k=keys[e];
	var d=gdeps.get(k);
	var name=d.name;
	if (k!==name){
	console.log('Warning: the package '+k+' has a package name['+name+'] not correct in its bower.json!');
	d.name=k;
	}
	
}


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
var packageHandler=config.get('package-handler'); 
if (packageHandler!=undefined) {
	var mains=[];
	var deps={};
	packageHandler(component,mains,deps);

	if (mains.length>0){
	  
	  var cwd = $.path.join(config.get('bower-directory'), component);
	  mains=$._.unique(mains.reduce(function (acc, filePath) {
		acc = acc.concat(
		$.glob.sync(filePath, { cwd: cwd, root: '/' })
		.map(function (path) {
		return $.path.join(cwd, path);
		})
		);
		return acc;
		}, []));
	   dep.main=mains.concat(dep.main);
	   dep.type = $._.chain(mains).map($.path.extname).unique().value();
	   
	}
	var keys=$._.unique(Object.keys(deps));
	if (keys.length>0) {
	   keys.forEach(function(k){dep.dependencies[k]=deps[k];});
	}
	
}
config.get('global-dependencies').set(component, dep);
};
}

function reduceDepInfo(gdeps,exclude,f,t,parentdep){
return {
	main:f.main.filter(function (main) {
var b1=$.path.extname(main) === t;

var isExcluded = $._.find(exclude, function (pattern) {
return main.replace(/\\/g, '/').match(pattern).match(pattern);
});
return b1&&!isExcluded;



}),
  dependencies:collectDependencies(gdeps,parentdep,f.dependencies)
};}


function collectDependencies(gdeps,pdeps,deps){
 for (var i in deps){
	 var d=deps[i];
	 collectDependencies(gdeps,pdeps,gdeps.get(i).dependencies);
     var found=false;
     for(var j=0;j<pdeps.length;j++){
		 
	   if (pdeps[j].name==i) {found= true; break;} 
	
	}
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
var deps=config.get('global-dependencies');



var dependencies = $._.toArray(deps.get()).
filter(function (dependency) {
return $._.contains(dependency.type, fileType);
});

var tdep={};


dependencies.forEach(function(f){	
	
tdep[f.name]=reduceDepInfo(deps,config.get('exclude'),f,fileType,[]);	
});


return tdep;

}

module.exports = detectDependencies;

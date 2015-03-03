
'use strict';
module.exports = function(grunt) {
// Internal lib.
var BLOCK=/[ \t]*<!--\s*embed:*(\S*)\s+(mapped|inline|collapsed)\s*(\s+(uglified|minified)\s*)?[\n\r]+((\n|\r|.)*)-->/gi;
var md5 = require('MD5');
var jsParser = require("uglify-js");
var cssParser = require('uglifycss');
grunt.registerMultiTask('embed', 'embedding files', function() {
// Merge task-specific and/or target-specific options with these defaults.

var options =extend({
separator: grunt.util.linefeed,
development: false, 
minifyHandlers:{
js:minifyJS,
css:minifyCSS
},  
exclude:[],  
templates:{target:'target/',sources:[]},
resources:{
js: {replacement:{link:'<script src="/js/{{file}}"></script>',inline:'<script>{{source}}</script>'},target:'js/'},
css:{replacement:{link:'<link rel="stylesheet" href="/css/{{file}}" />',inline:'<style><{{source}}<stype>'},target:'css/'}
},


},this.data);
grunt.log.writeln(JSON.stringify(options));
var $ = {
bowerConfig: require('bower-config'),
 _: require('lodash'),
fs: require('fs'),
path: require('path')
};
var helpers = require('./lib/helpers');
var config = module.exports.config = helpers.createStore();
var currentDir=process.cwd();
var cwd = options.cwd ? $.path.resolve(options.cwd) : currentDir;

config.set
('bower.json', options.bowerJson || JSON.parse($.fs.readFileSync($.path.join(cwd, './bower.json'))))
('bower-directory', options.directory || findBowerDirectory(cwd))
('cwd', cwd)
('dev-dependencies', options.development||false)
('detectable-file-types', Object.keys(options.resources))
('exclude', Array.isArray(options.exclude) ? options.exclude : [ options.exclude ])
('global-dependencies', helpers.createStore())
('ignore-path', options.ignorePath)
('overrides', $._.extend({}, config.get('bower.json').overrides, options.overrides));
require('./lib/detect-dependencies')(config);

function extend(source,target) {
	    if (target instanceof Array  ) return target;
        if (target instanceof Object  ){
			var s=source;
			for (var prop in target) {
				grunt.log.writeln(prop);
                s[prop] = extend( source[prop],target[prop]);
        }
        return s;
	} else return target;
    
}


function getSubConfig(){}

function findBowerDirectory(cwd) {
var directory = $.path.join(cwd, ($.bowerConfig.read(cwd).directory || 'bower_components'));
if (!$.fs.existsSync(directory)) {
var error = new Error('Cannot find where you keep your Bower packages.');
error.code = 'BOWER_COMPONENTS_MISSING';
throw error;
}
return directory;
}


function getContent(file){
if (!grunt.file.exists(file)) {
throw new Error('Source file "' + file + '" not found.');
}
return String($.fs.readFileSync(file));
}
function getCollapsedFile(filepath,index){
return removeExtension(getFileName(filepath))+'_'+index+".collapsed"
}

function renderLinkFile(depname,mimified,filetype){
return depname+"."+(mimified?'min.':'')+filetype;
} 

function getSourceReplacement(repl,source){
// the path of file is inside the replacement because front-end logic is unknow here
return repl.replace('{{source}}',source)+options.separator

}

function getLinkReplacement(repl,depname,mimified,filetype){
	// the path of file is inside the replacement because front-end logic is unknow here
return repl.replace('{{file}}',renderLinkFile(depname,mimified,filetype))+options.separator
}
function parseText(filepath,replacements,commands){
 var text = grunt.file.read(filepath);
 var gdeps={};
 var index=0;
 return text.replace(BLOCK, function(match, filetype,replacetype,minified,nop,files, offset, s)
    {   var atfiles=files.split(options.separator);
		var afiles=[],i,j;
		for(i=0;i<atfiles.length;i++) {
			var tmp=atfiles[i].trim();
			if (tmp!=='') {afiles.push(tmp);}
		}

		filetype=filetype.toLowerCase();
		minified=(minified===undefined)?undefined:minified.trim();
		var ismini=!options.development && minified!==undefined;
		var ftypedeps=config.get('global-dependencies-sorted')[filetype];
		var buffer='';
		var isinline=(replacetype==='inline');
	    if (replacetype==='collapsed'){
				var collapsedname=getCollapsedFile(filepath,index);
				var collapsedFiles=[];
	    }
	    var repl=replacements[filetype].replacement[(isinline)?'inline':'link'];
		var dest=replacements[filetype].target;	
		for(var ii=0;ii<afiles.length;ii++) {
            var depname=afiles[ii];
			var dep=ftypedeps[depname];
			if (dep==undefined) {
				var error = new Error('Cannot find where you keep your Bower dependecy '+depname);
				error.code = 'BOWER_DEPENDENCY_MISSING';
				throw error;
			}



			
			var subdeps=dep.dependencies;
			for(i=0;i<subdeps.length;i++){
			  var name=subdeps[i].name;
			  var depi=ftypedeps[name];
              if (gdeps[name]!==undefined) continue;   
               gdeps[name]=true;          		
               for(j=0;j<depi.main.length;j++){
			   var m=depi.main[j];    
			    var bf= removeExtension(getFileName(m));        		
			    if (replacetype==='mapped') {
			    buffer+=getLinkReplacement(repl,bf,ismini,filetype);
			    commands.push({command:'cp',source:m,dest:dest+renderLinkFile(bf,ismini,filetype),minified:minified});
			    } else   if (replacetype==='inline') {
				      if (ismini) buffer+=options.minifyHandlers[filetype](m,minified=='minified');
			    else buffer+=getContent(m);	    
			    }else   if (replacetype==='collapsed') {			 			     
			     collapsedFiles.push(m);
			    }
			   }
			 
              
			}
			if (gdeps[depname]===undefined) {for(i=0;i<dep.main.length;i++){
			  var m=dep.main[i];   
			  var bf= removeExtension(getFileName(m));    
			   if (replacetype==='mapped') { 		
			   buffer+=getLinkReplacement(repl,bf,ismini,filetype);
			   commands.push({command:'cp',source:m,dest:dest+renderLinkFile(bf,ismini,filetype),minified:minified});
		       } else if (replacetype==='inline') {
			      if (ismini) buffer+=options.minifyHandlers[filetype](m,minified=='minified');
			    else buffer+=getContent(m);	
				    
			    }else   if (replacetype==='collapsed') {				 
			     collapsedFiles.push(m);
			    }
			}
             gdeps[depname]=true;
		    }
			
		}
        if (replacetype==='collapsed'){
		 commands.push({command:'collapse',sources:collapsedFiles,dest:dest+renderLinkFile(collapsedname,ismini,filetype),minified:minified});
		 buffer=getLinkReplacement(isinline,repl,collapsedname,ismini,filetype);
		 index++;
        } else if (replacetype==='inline') {
		 buffer=getSourceReplacement(repl,buffer);
		}
	    return buffer;
		
		
  
    }
);	
	
}

function getFileType(filepath){
return $.path.extname(filepath).substr(1);
}

function purgeCommands(commands){
var map={};
return commands.filter(function(e){
var ch=md5(JSON.stringify(e));
if (map[ch]===undefined){
map[ch]=true;
return true;
} else return false;
});
}

function minifyJS(f,mangled){
var orig_code=stripComments(getContent(f),mangled);
return jsParser.minify(orig_code,{fromString: true,mangle:mangled}).code;
}

function minifyCSS(f,mangled){
return stripComments(cssParser.processFiles(
    [ f],
    { maxLineLen: 500, expandVars: true,uglyComments:mangled }),mangled);
}

function stripComments(src,b) {
var m = [];

// Strip // ... leading banners.
m.push('(?:.*\\/\\/.*\\r?\\n)+\\s*');

if (b) {
// Strips all /* ... */ block comment banners.
m.push('\\/\\*[\\s\\S]*?\\*\\/');
} else {
// Strips only /* ... */ block comment banners, excluding /*! ... */.
m.push('\\/\\*[^!][\\s\\S]*?\\*\\/');
}
var re = new RegExp('^\\s*(?:' + m.join('|') + ')\\s*', '');
return src.replace(re, '');
}

function executeCommand(c){
switch(c.command){
case "cp"	: {
var source;
if (c.minified!==undefined) {
source=options.minifyHandlers[getFileType(c.source)](c.source,c.minified!=='minified');
} else source=getContent(c.source);	
grunt.log.writeln('Saving file in ' + c.dest + '.');
grunt.file.write(c.dest, source);
break;
}
case "collapse":{
source='';
var isugly=c.minified!=='minified';
if (c.minified!==undefined) {
c.sources.forEach(function(s){
source+=options.minifyHandlers[getFileType(s)](s,isugly);
});
} else {
c.sources.forEach(function(s){
source+=getContent(s);	
});
}
grunt.log.writeln('Saving file in ' + c.dest + '.');
grunt.file.write(c.dest, source);	
break;
}
}
}

function getFileName(filepath){
return $.path.basename(filepath);
}

function removeExtension(f){
return f.substring(0,f.lastIndexOf('.'));
}

function processFiles(files,commands){
// Iterate over all src-dest file pairs.

for(var j=0;j<files.length;j++){

var mfiles=grunt.file.expand(files[j])	;


mfiles.filter(function(filepath) {

if (!grunt.file.exists(filepath)) {
grunt.log.warn('Source file "' + filepath + '" not found.');
return false;
} else {
return true;
}
}).map(function(filepath, i) {
if (grunt.file.isDir(filepath)) {
return;
}
// Read file source.

var type=getFileType(filepath);
var replacements=options.resources;
var dest=options.templates.target+filepath;

// Print a success message.
grunt.log.writeln('Processing ' + filepath + ': ');
var content=parseText(filepath,replacements,commands);
// Write the destination file.
grunt.log.writeln('Saving in ' + dest + '.');
grunt.file.write(dest, content);
});


}

}




var commands=[];
processFiles(options.templates.sources,commands);
commands=purgeCommands(commands);
//grunt.log.writeln(JSON.stringify(commands));
commands.forEach(function(c){
executeCommand(c);
});

});
};


'use strict';
module.exports = function(grunt) {
// Internal lib.
var BLOCK=/^bind:*(\S*)\s+(mapped|inline|collapsed)\s*(\s+(uglified|minified)\s*)?$/gi;
var DEPBLOCK=/\s*(\w+)\s*(\[([^\]]*)\])?\s*/gi;
var md5 = require('MD5');
var jsParser = require("uglify-js");
var cssParser = require('uglifycss');
grunt.registerMultiTask('resourcesbinder', 'embedding files', function() {
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
var $ = {
bowerConfig: require('bower-config'),
 _: require('lodash'),
fs: require('fs'),
path: require('path')
};
var helpers = require('./lib/helpers');
var config = module.exports.config = helpers.createStore();
var currentDir=process.cwd()+'/';
var cwd = options.cwd ? $.path.resolve(options.cwd)+'/' : currentDir;

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


function processBlock(text,callback){
var oldpos=0;
var pos=0;
var newtext='';
while (pos>=0) {
pos=text.indexOf('<!--',oldpos);
if (pos<0) break;

var pos1=text.indexOf('bind',pos+4);
if (pos1>0) {
var pos2=text.indexOf('\n',pos1);
if (pos2==-1) throw new Error('Expect a newline after a bind block at position '+pos);
var buf=text.substring(pos1,pos2);
var match=BLOCK.exec(buf);
if (match==null) throw new Error('Wrong block syntax ('+buf+') at position '+pos);
pos1=text.indexOf('-->',pos2);
if (pos1==-1) throw new Error('Expect the end block at position '+pos);
var buffer;
if (options.development) buffer=callback(match[1],match[2],match[4],text.substring(pos2,pos1),pos2);
else buffer=callback(match[1],'mapped',undefined,text.substring(pos2,pos1),pos2);

newtext+=text.substring(oldpos,pos)+buffer;
pos=pos1+3;
} else { 
pos+=4;
newtext+=text.substring(oldpos,pos);
}
oldpos=pos;

}
newtext+=text.substring(oldpos,text.length);
return newtext;
}
function extend(source,target) {
	    if (target instanceof Array  ) return target;
        if (target instanceof Object  ){
			var s=source;
			for (var prop in target) {
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
 function getAbsoluteDir(f){
if (f.indexOf($.path.sep)==0) return f;
return cwd+f;
}

function filterMains(mains,filter){
	
	
	
            if (filter!=null){
			    if (/^\/.+\/$/.test(filter)){
			   var regex=new RegExp(filter);
			    return mains.filter(function(m){
				return regex.test(m);  
			   });
			   }else {
			    return mains.filter(function(m){
				return m.indexOf(filter)>=0;  
			   });
			   }
			   
			   } else return mains;
}

function parseText(filepath,replacements,commands){
 var text = grunt.file.read(filepath);
 var gdeps={};
 var index=0;
 return processBlock(text, function(filetype,replacetype,minified,files,offset)
    {   
		grunt.log.writeln('\t-Detecting block type '+filetype+' at offset '+offset);
		if (config.get('detectable-file-types').indexOf(filetype)==-1){
		throw new Error("file type '"+filetype+"' present in a file '"+filepath+"' block  is not defined" );	
		}
		var atfiles=files.split(options.separator);
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
		var dest=getAbsoluteDir(replacements[filetype].target);	
		for(var ii=0;ii<afiles.length;ii++) {
			var match=DEPBLOCK.exec(afiles[ii]);
			
            var depname=match[1];
			var dep=ftypedeps[depname];
			var filter=match[3];
			if (dep==undefined) {
				var error = new Error('Cannot find where you keep your Bower dependecy '+depname);
				error.code = 'BOWER_DEPENDENCY_MISSING';
				throw error;
			}
            grunt.log.write('\t-Injecting dependency \''+depname+"'"+((filter==null)?':':(' filtered by \''+filter+"':")));
		    var resourcesInjected=0;
            var found=false;
			
			var subdeps=dep.dependencies;
			for(i=0;i<subdeps.length;i++){
			  var name=subdeps[i].name;
			  var depi=ftypedeps[name];
              if (gdeps[name]!==undefined) continue;   
               gdeps[name]=true;  
               var mains=filterMains(depi.main,filter); 
               resourcesInjected+=mains.length;
			   if (!found && resourcesInjected>0) {
			   found=true;
			   grunt.log.writeln();
			   }    		
               for(j=0;j<mains.length;j++){
			   var m=mains[j];   
			   grunt.log.write('\t\t-file  \''+m+"'");
		 
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
			if (gdeps[depname]===undefined) {
			  var mains=filterMains(dep.main,filter);
			  resourcesInjected+=mains.length;
			  if (!found && resourcesInjected>0) {
			   found=true;
			   grunt.log.writeln();
			   }   
			  for(i=0;i<mains.length;i++){
			  var m=mains[i]; 
			  grunt.log.writeln('\t\t-Resource  \''+m+"'");  
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
			if (resourcesInjected==0){
			   grunt.log.writeln("no resources found");
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
var res =files[j].match(/^[^**]*/);
var basename=res[0];
var mfiles=grunt.file.expandMapping(files[j], options.templates.target, {
rename: function(destBase, destPath) {
return destBase + destPath.replace(basename,'');
}}); 



mfiles.forEach(function(filemap) {
var filepath=currentDir+filemap.src;
if (!grunt.file.exists(filepath)) {
grunt.log.warn('Source file "' + filepath + '" not found.');
return;
} 
if (grunt.file.isDir(filepath)) {
return;
}
// Read file source.

var type=getFileType(filepath);
var replacements=options.resources;
var dest=filemap.dest;

// Print a success message.
grunt.log.writeln('* Processing ' + filepath+" => "+dest);
var content=parseText(filepath,replacements,commands);
grunt.file.write(dest, content);
});


}

}




var commands=[];
processFiles(options.templates.sources,commands);
commands=purgeCommands(commands);
//grunt.log.writeln(JSON.stringify(commands));
if (commands.length>0)grunt.log.writeln('* Saving resources ...');
commands.forEach(function(c){
executeCommand(c);
});

});
};

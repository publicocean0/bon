# ResourcesBinder
> Bind bower or local dependencies to your source code.


## Getting Started
Install the module with [npm](https://npmjs.org):

```bash
$ npm install --save grunt-resourcesbinder
```

Install your [bower](http://bower.io) dependencies (if you haven't already):

```bash
$ bower install --save jquery
```

Insert placeholders in your code where your dependencies will be injected:

```html
<html>
<head>
  <!-- @bind:css linked separated uglified 
       jquery

  -->

</head>
<body>
  <!-- @bind:js linked separated uglified 
       jquery

  -->
</body>
</html>
```
The complete syntax is 
```code
@binder:[<filetype>] <linked|inline>  <aggregated|separated>  [minified|uglified]
```
The options mean:
linked: it replace the link if the corrispondent dependency using the link replacement,
inline: it replace directly the all sources mentioned using source replament,
aggregated: it aggregate all dependencies,
separated : it handles each dependency separately.
In the following lines of this block you must insert all the top dependencies (one for every line) with this sintax:
```code

<package_name>[<[filter]>]
```
The sub dependencies of the package are automatically injected.
The filter is optional and permits to filter the resources of that package.


Set the the right options for your project :
```js
development : it adds dev-dependencies , force the setting of  every block as 'linked  separated'
localDependencies: you can add dependencies not deployed in bower system , but just locally in your project,
templates:{target:<path where to place the final html or frontend templates(like tpl,velocity,freemarker,...)>,sources:<array of html or frontend templates files>},

resources:{
<file extension>: {replacement:{link:<text to replace with {{file}} injection> ,inline:<text to replace with {{source}} injection>},target:<final directory where to place the resources>},
.......
}.
```
The default setting is :
```js
{
separator: grunt.util.linefeed,
development: false, 
localDependencies:{},
minifyHandlers:// internal handlers can be overriden
js:minifyJS,
css:minifyCSS
},
development:false,// if true the block will be forced to bindind in mapped way , disabling also the minification.
exclude:[],  
templates:{target:'target/',sources:[]},
resources:{
js: {replacement:{link:'<script src="/js/{{file}}"></script>',inline:'<script>{{source}}</script>'},target:'js/'},
css:{replacement:{link:'<link rel="stylesheet" href="/css/{{file}}" />',inline:'<style><{{source}}</style>'},target:'css/'}
},


}
```

Let `bind` work its magic:




```html
<html>
<head>
 <link href="/css/jquery.css">

</head>
<body>

  <script src="/js/jquery.js"></script>

</body>
</html>
```


## Build Chain Integration



### [Grunt](http://gruntjs.com)

See [`grunt-resourcesbinder`](https://github.com/publicocean0/grunt-resourcesbinder).




## Bower Overrides
To override a property, or lack of, in one of your dependency's `bower.json` file, you may specify an `overrides` object in your own `bower.json`.

## Maven
You can integrate this plugin with maven using [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin). A example of configuration is :
```xml
		<plugin>
						<groupId>com.github.eirslett</groupId>
						<artifactId>frontend-maven-plugin</artifactId>
						<version>0.0.23</version>
						<executions>
							<execution>
								<id>npm install</id>
								<goals>
									<goal>npm</goal>
								</goals>
								<configuration>
									<arguments>install</arguments>
								</configuration>
							</execution>
							<execution>
								<id>bower install</id>
								<goals>
									<goal>bower</goal>
								</goals>
								<configuration>
									<arguments>install</arguments>
								</configuration>
							</execution>
							<execution>
								<id>grunt build</id>
								<goals>
									<goal>grunt</goal>
								</goals>
								<configuration>
									<arguments>--no-color</arguments>
									<arguments>--project=${project.artifactId}</arguments>
									<arguments>--dev</arguments>
								</configuration>
							</execution>
						</executions>
					</plugin>
```
using this Gruntfile.js example:
```js
module.exports = function(grunt) {
var project=(grunt.option( "project" )==undefined)?'':grunt.option( "project" );
grunt.initConfig({
// Before generating any new files, remove any previously-created files.

resourcesbinder: {
default_options: {
templates:{target:'target/'+project+'/WEB-INF/ftl/',sources:['src/main/ftl/**/*.ftl']},
development:grunt.option( "dev" )!==undefined,
resources:{
js: {replacement:{link:'<script src="<@utils.url\'/js/{{file}}\'/>"></script>',inline:'<script>{{source}}</script>'},target:'target/'+project+'/WEB-INF/js/'},
css:{replacement:{link:'<link rel="stylesheet" href="<@utils.url\'/css/{{file}}\'/>" rel="stylesheet" media="screen" />',inline:'<style><{{source}}</style>'},target:'target/'+project+'/WEB-INF/css/'}
}

}



}
});
	grunt.loadNpmTasks('grunt-resourcesbinder');
	// Default task(s).
	grunt.registerTask('default', ['resourcesbinder' ]);

};
```

## Contributing
This package is used personally, but it might be extended for adding also npm command line.


## License
Copyright (c) 2015 Lorenzetto Cristian. Licensed under the MIT license.


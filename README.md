# ResourcesBinder
> Bind bower dependencies to your source code.


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
  <!-- bind:css mapped uglified 
       jquery

  -->

</head>
<body>
  <!-- bind:js mapped uglified 
       jquery

  -->
</body>
</html>
```
The complete sintax is binder:[<filetype>] mapped|inline|collapsed   [minified|uglified]
The options mean:
mapped: it replace the link if the corrispondent dependency using the link replacement,
inline: it replace directly the all sources mentioned using source replament,
collapsed: it replace the link of a generated file using the link replacement(this generated file contains all the sources merged in).
In the following lines of this block you must insert all the top dependencies (one for every line) with this sintax:
```code

<package_name>[<[filter]>]
```
The sub dependencies of the packages are automatically injected.
The filter is optional and permits to filter the resources of that package.


Set the the right options for your project :
```js
development : if you want add dev-dependencies and to force not minification 

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
minifyHandlers:{
js:minifyJS,
css:minifyCSS
},
development:false,// if true the block will be forced to bindind in mapped way , disabling also the minification.
exclude:[],  
templates:{target:'target/',sources:[]},
resources:{
js: {replacement:{link:'<script src="/js/{{file}}"></script>',inline:'<script>{{source}}</script>'},target:'js/'},
css:{replacement:{link:'<link rel="stylesheet" href="/css/{{file}}" />',inline:'<style><{{source}}<stype>'},target:'css/'}
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
You can integrate this plugin with maven using [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin).

## Contributing
This package is used personally, but it might be extended for adding also npm command line.


## License
Copyright (c) 2015 Lorenzetto Cristian. Licensed under the MIT license.


# resourcesbinder
> Embed dependencies to your source code.


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
  <!-- embed:css mapped uglified 
       jquery

  -->

</head>
<body>
  <!-- embed:js mapped uglified 
       jquery

  -->
</body>
</html>
```

Let `resourcesbinder` work its magic:




```html
<html>
<head>
 <link href="/css/jquery.css">
</head>
<body>

  <script src="js/jquery.js"></script>

</body>
</html>
```


## Build Chain Integration



### [Grunt](http://gruntjs.com)

See [`grunt-wiredep`](https://github.com/publicocean0/grunt-embed).




## Bower Overrides
To override a property, or lack of, in one of your dependency's `bower.json` file, you may specify an `overrides` object in your own `bower.json`.

As an example, this is what your `bower.json` may look like if you wanted to override `package-without-main`'s `main` file:

```js
{
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


}
```


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using `npm test`.


## License
Copyright (c) 2015 Lorenzetto Cristian. Licensed under the MIT license.


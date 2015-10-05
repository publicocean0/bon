# BON (Binary Object Notation)

BON is a binary notation for a fast conversion of object, defined for working in every programmaing languages.
There are 20 different of data type already defined, but you can extend the protocol with other custom serialization. 
The main data types are:

 * 0 null
 * 1 typed object
 * 2 untyped object
 * 3 typed array
 * 4 untyped array
 * 5 typed iterator
 * 6 untyped iterator
 * 7 entity id 
 * 8 bool
 * 9 utf
 * 10 uint8 
 * 11 int8
 * 12 uint16
 * 13 int16
 * 14 uint32
 * 15 int32
 * 16 uint64
 * 17 int64
 * 18 float32
 * 19 float64
 * 20 binary
 * 21 date
 * 22 regexp
 * 23 bitset
 
The numbers are serialized in big endian order. The properties names are encoded in a 6bit binary(accepted characters are [ a-z, A-Z,0-9, _ ,$] , maximum length is 255 ).

<b>Javascript library</b> 

This is a javascript library for serializing objects in BON notation.
javascript don't know natively integer with 8,16,32,64 bits. The just number known in this language is Number that is a 64-bit floating point. 
This library permits to handle all the data types known  in other languages ( for example C , java , C# ....). 
In addition it permits to serialize also a set of bits , dates, regular expressions, binary blobs. 
You can serialize objects in stripped version or unstripped version.
The first one permits to save data types in the stream , so the unserializer can rebuild the object correctly without write additional code. In this case the serialization and the unserialization are completely transparent. 
In the stripped mode, the serialization dont save data types of the object (in nested way). This permits to save space or permits to pass fastly data structure statically defined. 
You can also to imagine to use in a part stripped mode and in a part unstripped mode.  
Methods:
<pre>
serialize (object , stripped, with_checksum)
unserialize (binary ,with_checksum) /* to use in unstripped mode. */
</pre>

Example :  

<pre>
var bs = new BitSet();

for(var n = 0; n < 102; n++) {
  if (n%2) continue;
  bs.set(n);
}
console.log(bs.length());
var a=new TypedNumber(200,'uint64');
var b=[new Date(),{},null,{a:3,b:"ciao ",c:true,d:a,e:bs}];
console.log(JSON.stringify(b));
var r=BON.serialize(b,false,true);
console.log(r);
var t=BON.deserialize(r,true);
console.log(JSON.stringify(t));
</pre>


License

Copyright (c) 2015 Lorenzetto Cristian. Licensed under the MIT license.

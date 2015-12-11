# BON (Binary Object Notation)

BON is a binary notation for a fast conversion of object, defined for working in every programmaing languages.
There are 24 different of data type already defined, but you can extend the protocol with other custom serialization. 
The main data types are:

 * 0 null
 * 1 typed object (object with properties all of same type)
 * 2 untyped object (object with properties of different types)
 * 3 typed array (array with elements all of same type)
 * 4 untyped array (array with elements if different types)
 * 5 typed iterator ( a iterator of elements of specific type)
 * 6 untyped iterator ( a iterator of elements of not foreseeable type)
 * 7 entity id ( EID object is a 128bit universal identifier )
 * 8 reference (Reference object is a 32bit reference for other data , for example attachments )
 * 9 type ( type of data: used for defining schema )
 * 10 bool
 * 11 utf
 * 12 uint8 
 * 13 int8
 * 14 uint16
 * 15 int16
 * 16 uint32
 * 17 int32
 * 18 uint64
 * 19 int64
 * 20 float32
 * 21 float64
 * 22 binary
 * 23 date
 * 24 regexp
 * 25 bitset
 
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

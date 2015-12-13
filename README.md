# BON (Binary Object Notation)

BON is a binary notation for a fast conversion of object, defined for working in every programmaing languages.
There are 26 different of data type already defined, but you can extend the protocol with other custom serialization. 
The main data types are:

 * 0 null ( null or undefined value)
 * 1 typed object (object with properties all of same type)
 * 2 untyped object (object with properties of different types)
 * 3 typed array (array with elements all of same type)
 * 4 untyped array (array with elements if different types)
 * 5 typed iterator ( a iterator of elements of specific type but unforeseeable size. Usefull for a stream of objects)
 * 6 untyped iterator ( a iterator of elements of unforeseeable type and size.Usefull for a stream of objects)
 * 7 entity id ( EID object is a 128bit universal identifier: you can convert it in a alphanumeric string and vs )
 * 8 reference (Reference object is a 32bit reference for other data , for example attachments )
 * 9 type (Type object is used for defining data type when you want to keep just a schema of a object )
 * 10 bool (boolean data or Boolean object)
 * 11 utf8 (string data or String object)
 * 12 uint8 (TypedNumber )
 * 13 int8 (TypedNumber )
 * 14 uint16 (TypedNumber )
 * 15 int16 (TypedNumber )
 * 16 uint32 (TypedNumber )
 * 17 int32 (TypedNumber )
 * 18 uint64 (TypedNumber )
 * 19 int64 (TypedNumber )
 * 20 float32 (TypedNumber )
 * 21 float64 (TypedNumber or Number object or number data )
 * 22 binary (ArrayBuffer or  Blob object)
 * 23 date (Date object)
 * 24 regexp (RegExp object)
 * 25 bitset (BitSet is a object for handling a set of bits)
 * 26 property (Property is a object for handling a single couple name - value. It can be used in a iterator for a stream of properties)
 
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
serialize (object , stripped=false, with_checksum=false) /* serialize data ,you can strip data type, you can add checksum at the end of buffer*/
encode (object ,  with_checksum=false) /* serialize removing data type info and containers info*/
unserialize (binary ,with_checksum=false) /* to use in unstripped mode. */
</pre>

Example :  

<pre>
var bs = new BitSet();
for(var n = 0; n < 102; n++) {   if (n%2) continue;   bs.set(n); }
var b=[new Date(),{},null,{a:3,b:"ciao ",c:true,d:new TypedNumber(200,'uint64'),e:bs}];
console.log(JSON.stringify(b)); // you can see object before serialization
var r=BON.serialize(b);
console.log(r); // you can see the binary format of this object
var t=BON.deserialize(r);
console.log(JSON.stringify(t)); // you can see object after deserialization
</pre>

<b>Why you might use BON instead BSON?</b>

There are many resons: 
1) BON is a more performant protocol, it use less space for the object rappresentation. In addition is designed for being more general-purpose and not targetted to a specific application.  
2) BON is has a completely recursive definition: it this way you can use few memory for reading or writing object and using Binary class utility, you can embedded in the binary data also custom data structures.
3) BON is simply extendable adding other types for converting in automatic way custom structures.
4) BON permits to receive streams of objects by a server. 
5) using encode function and stripped mode  you can send binary packet for any specific protocol without to write code for binary conversion. 




License

Copyright (c) 2015 Lorenzetto Cristian. Licensed under the MIT license.

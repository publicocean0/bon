# BOP (Binary Object Protocol)

BOP is a binary protocol for a fast conversion of object, defined for working in every programmaing languages.
There are 20 different of data type already defined, but you can extend the protocol with other custom serialization. 
The main data types are:

 * 0 null
 * 1 typed object
 * 2 untyped object
 * 3 typed array
 * 4 untyped array
 * 5 bool
 * 6 utf
 * 7 uint8 
 * 8 int8
 * 9 uint16
 * 10 int16
 * 11 uint32
 * 12 int32
 * 13 uint64
 * 14 int64
 * 15 float32
 * 16 float64
 * 17 binary
 * 18 date
 * 19 regexp
 * 20 bitset
 
The numbers are serialized in big endian order. The properties names are encoded in a 6bit binary(accepted characters are [ a-z, A-Z,0-9, _ ,$] , maximum length is 255 ).

Javascript library 

This is a javascript library for serializing objects in BOP protocol.
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
var r=BOP.serialize(b,false,true);
console.log(r);
var t=BOP.deserialize(r,true);
console.log(JSON.stringify(t));
</pre>



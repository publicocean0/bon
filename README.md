# BOP (Binary Object Protocol)

This is a javascript library for serializing objects in BOP protocol.

BOP is a binary protocol for a fast conversion of object, defined in every programmaing languages.
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
 
The numbers are serialized in big endian order. 





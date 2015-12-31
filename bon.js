Object.getName = function (obj) {
        if (obj && obj.constructor && obj.constructor.toString()) {

                /*
                 *  for browsers which have name property in the constructor
                 *  of the object,such as chrome 
                 */
                if(obj.constructor.name) {
                    return obj.constructor.name;
                }
                var str = obj.constructor.toString();
                /*
                 * executed if the return of object.constructor.toString() is 
                 * "[object objectClass]"
                 */

                if(str.charAt(0) == '[')
                {
                        var arr = str.match(/\[\w+\s*(\w+)\]/);
                } else {
                        /*
                         * executed if the return of object.constructor.toString() is 
                         * "function objectClass () {}"
                         * for IE Firefox
                         */
                        var arr = str.match(/function\s*(\w+)/);
                }
                if (arr && arr.length == 2) {
                            return arr[1];
                        }
          }
          return undefined; 
    };
function typeInstance(obj){
if (obj instanceof Object) return Object.getName(obj).toLowerCase();
else return typeof(obj);
} 
if (typeof(Object.keys)=='undefined'){
 Object.keys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
};
 
 }
if (typeof(Object.isTyped)=='undefined'){
 Object.isTyped = function(obj){
   var type=null;
   var i=0;
   var o;
   for(var key in obj){
	   i++;
	   o=obj[key] ;
      if (type==null) type=(o instanceof TypedNumber)?"typednumber["+o.type+"]":typeInstance(o);
      else if (type!=typeInstance(o)) return false;
   }
   return (i==0)?false:true;
};
 
 }
 if (typeof(Array.isTyped)=='undefined'){
 Array.isTyped = function(obj){
   var type=null;var o;
   for(var i=0;i<obj.length;i++){
	   o=obj[i];
       if (type==null) type=(o instanceof TypedNumber)?"typednumber["+o.type+"]":typeInstance(o);
      else if (type!=typeInstance(o)) return false;
   }
   return (obj.length==0)?false:true;
};
 
 }
 
 
  if (typeof(Uint8Array.slice)=='undefined'){
    Uint8Array.prototype.slice = function(begin,end){
	return new Uint8Array((end==undefined)?this.subarray(begin):this.subarray(begin,end));	
	};
 
 }

function checkEndianess(){
    var a = new ArrayBuffer(4);
    var b = new Uint8Array(a);
    var c = new Uint32Array(a);
    b[0] = 0x12;
    b[1] = 0x34;
    b[2] = 0x56;
    b[3] = 0x78;
    if(c[0] == 0x78563412) return false;//"little endian";
    else if(c[0] == 0x12345678) return true;//"big endian";
    else throw new Error("invalid endianess"); 	
}

function swapBytes(buf, size){
 var bytes = Uint8Array(buf);
 var len = bytes.length;
 if(size == 'WORD'){
  var holder;
  for(var i =0; i<len; i+=2){
     holder = bytes[i];
     bytes[i] = bytes[i+1];
     bytes[i+1] = holder;
  }
}else if(size == 'DWORD'){
 var holder;
 for(var i =0; i<len; i+=4){
    holder = bytes[i];
    bytes[i] = bytes[i+3];
    bytes[i+3] = holder;
    holder = bytes[i+1];
    bytes[i+1] = bytes[i+2];
    bytes[i+2] = holder;
 }
}
}

var  ENDIANESS=checkEndianess();
var  TIMEZONEOFFSET=new Date().getTimezoneOffset();
 
function Binary (buffer) { // default big endian(network standard)
    if (buffer==undefined) this.dataview=new DataView(new ArrayBuffer(0));
    else if (buffer instanceof ArrayBuffer) this.dataview=new DataView(buffer,0);
    else  if (
    buffer instanceof Uint8Array ||
           buffer instanceof Int8Array ||
            buffer instanceof Uint8ClampedArray ||
            buffer instanceof Int16Array ||
            buffer instanceof Uint16Array || 
            buffer instanceof Int32Array ||
            buffer instanceof Uint32Array ||
            buffer instanceof Float32Array ||
            buffer instanceof Float64Array
        ) 
            this.dataview=new DataView(buffer.buffer,0);
    else if (buffer instanceof Array){
	var b=new Uint8Array(buffer);
		this.dataview=new DataView(b.buffer,0);
	} else throw "invalid buffer type";
    this.offset=0;

};

Binary.wordToByteArray=function(wordArray) {
      // Shortcuts
            var words = wordArray.words;
            var l = wordArray.sigBytes;
            var buf=new Uint8Array(l);
            for (var i = 0; i < l; i++) {
                buf[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
               
            }
    return buf;
};

Binary.base64ToArrayBuffer=function(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};
Binary.arrayBufferToBase64=function(arrayBuffer) {
var base64 = ''
var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
var bytes = new Uint8Array(arrayBuffer)
var byteLength = bytes.byteLength
var byteRemainder = byteLength % 3
var mainLength = byteLength - byteRemainder
var a, b, c, d
var chunk
// Main loop deals with bytes in chunks of 3
for (var i = 0; i < mainLength; i = i + 3) {
// Combine the three bytes into a single integer
chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
// Use bitmasks to extract 6-bit segments from the triplet
a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
b = (chunk & 258048) >> 12 // 258048 = (2^6 - 1) << 12
c = (chunk & 4032) >> 6 // 4032 = (2^6 - 1) << 6
d = chunk & 63 // 63 = 2^6 - 1
// Convert the raw binary segments to the appropriate ASCII encoding
base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
}
// Deal with the remaining bytes and padding
if (byteRemainder == 1) {
chunk = bytes[mainLength]
a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
// Set the 4 least significant bits to zero
b = (chunk & 3) << 4 // 3 = 2^2 - 1
base64 += encodings[a] + encodings[b] + '=='
} else if (byteRemainder == 2) {
chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
b = (chunk & 1008) >> 4 // 1008 = (2^6 - 1) << 4
// Set the 2 least significant bits to zero
c = (chunk & 15) << 2 // 15 = 2^4 - 1
base64 += encodings[a] + encodings[b] + encodings[c] + '='
}
return base64
};

Binary.arrayBufferToString=function(array) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = array.length;
    i = 0;
    while(i < len) {
    c = array[i++];
    switch(c >> 4)
    { 
      case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
        // 0xxxxxxx
        out += String.fromCharCode(c);
        break;
      case 12: case 13:
        // 110x xxxx   10xx xxxx
        char2 = array[i++];
        out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
        break;
      case 14:
        // 1110 xxxx  10xx xxxx  10xx xxxx
        char2 = array[i++];
        char3 = array[i++];
        out += String.fromCharCode(((c & 0x0F) << 12) |
                       ((char2 & 0x3F) << 6) |
                       ((char3 & 0x3F) << 0));
        break;
    }
    }

    return out;
};

Binary.stringToArrayBuffer=function(stringToEncode) {
              stringToEncode = stringToEncode.replace(/\r\n/g,"\n");
              var utftext = [];
              

              for (var n = 0; n < stringToEncode.length; n++) {

                  var c = stringToEncode.charCodeAt(n);

                  if (c < 128) {
                      utftext[utftext.length]= c;
                  }
                  else if((c > 127) && (c < 2048)) {
                      utftext[utftext.length]= (c >> 6) | 192;
                      utftext[utftext.length]= (c & 63) | 128;
                  }
                  else {
                      utftext[utftext.length]= (c >> 12) | 224;
                      utftext[utftext.length]= ((c >> 6) & 63) | 128;
                      utftext[utftext.length]= (c & 63) | 128;
                  }

              }
              return utftext;  
 };
 

Binary.binaryString =function(nMask) {
  // nMask must be between -2147483648 and 2147483647
  for (var nFlag = 0, nShifted = nMask, sMask = ""; nFlag < 32;
       nFlag++, sMask += String(nShifted >>> 31), nShifted <<= 1);
  return sMask;
};
Binary.utf16to8 =function utf16to8(str) {
    var out, i, len, c;

    out = "";
    len = str.length;
    for(i = 0; i < len; i++) {
	c = str.charCodeAt(i);
	if ((c >= 0x0001) && (c <= 0x007F)) {
	    out += str.charAt(i);
	} else if (c > 0x07FF) {
	    out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
	    out += String.fromCharCode(0x80 | ((c >>  6) & 0x3F));
	    out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
	} else {
	    out += String.fromCharCode(0xC0 | ((c >>  6) & 0x1F));
	    out += String.fromCharCode(0x80 | ((c >>  0) & 0x3F));
	}
    }
    return out;
}

Binary.utf8to16= function utf8to16(str) {
    var out, i, len, c;
    var char2, char3;

    out = "";
    len = str.length;
    i = 0;
    while(i < len) {
	c = str.charCodeAt(i++);
	switch(c >> 4)
	{ 
	  case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
	    // 0xxxxxxx
	    out += str.charAt(i-1);
	    break;
	  case 12: case 13:
	    // 110x xxxx   10xx xxxx
	    char2 = str.charCodeAt(i++);
	    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
	    break;
	  case 14:
	    // 1110 xxxx  10xx xxxx  10xx xxxx
	    char2 = str.charCodeAt(i++);
	    char3 = str.charCodeAt(i++);
	    out += String.fromCharCode(((c & 0x0F) << 12) |
					   ((char2 & 0x3F) << 6) |
					   ((char3 & 0x3F) << 0));
	    break;
	}
    }

    return out;
}


Binary.prototype.encodeInt   = function encodeInt(value,bit,signed){
switch(bit){
case 8:{
 
 if (signed) this.dataview.setInt8(this.offset,value); else this.dataview.setUint8(this.offset,value);	
 this.offset+=1;		
}break;
case 16:{
if (signed) this.dataview.setInt16(this.offset,value,false); else this.dataview.setUint16(this.offset,value,false);
this.offset+=2;	
}
break;
case 32:{
if (signed) this.dataview.setInt32(this.offset,value,false); else this.dataview.setUint32(this.offset,value,false);
this.offset+=4;	
}
break;
case 64:{
var t=typeInstance(value);
 if (t=='int64') {	
	this.dataview.setUint32(this.offset,value.upperInt(),false);
	this.dataview.setUint32(this.offset+4,value.lowerInt(),false);
} else if (t=='uint64') {	
	this.dataview.setUint32(this.offset,value.upperInt(),false);
	this.dataview.setUint32(this.offset+4,value.lowerInt(),false);
}
this.offset+=8; 		
}break;
default : throw new Exception("integer length not correct");	
}
	
};    
Binary.prototype.appendBuffer=function(buffer,cut){
if (cut==undefined) cut=true;
if (cut){
	var tmp = new Uint8Array( this.dataview.buffer ).slice(this.offset);
	this.dataview=new DataView(appendBuffer(tmp,buffer));
	this.offset=0;
} else {
this.dataview=new DataView(appendBuffer(this.dataview.buffer,buffer));
}	
};
Binary.prototype.toObject=function(check,t){
	var tmp = new Uint8Array( this.dataview.buffer );
	if (t==undefined) t=this.decodeInt(  8, false );
	var r=BON.deserialize(tmp.slice(this.offset),(typeof(check)==undefined)?false:check,t);
	this.offset+=r.binary.offset;
	return r.object;
}; 
Binary.prototype.fromObject=function(obj,check){
	var r=BON.serialize(obj,false,(typeof(check)==undefined)?false:check);
	this.appendBuffer(r.remainingBuffer());
}; 

Binary.prototype.toDate=function(){
	return new Date(this.toUint64().value.toNumber(true)-TIMEZONEOFFSET*60000);
}; 
Binary.prototype.fromDate=function(d){
	this.fromUint64(new UInt64(d.getTime() + d.getTimezoneOffset() * 60000));
}; 

Binary.prototype.toRegExp=function(){
	return new RegExp(this.toUTF8());
};

Binary.prototype.fromRegExp=function(obj){
	this.fromUTF8(obj.source);
};


Binary.prototype.toEID=function(){
	return new EID(this.toBinary(16));
};

Binary.prototype.fromEID=function(obj){
	this.fromBinary(obj.value,true);
};

Binary.prototype.toReference=function(){
	return new Reference(this.toUint32());
}; 

Binary.prototype.fromReference=function(obj){
	this.fromUint32(obj.value);
}; 

Binary.prototype.toProperty=function(){
	var name=this.decodeProperty();
	return new Property(name,this.toObject());
}; 
Binary.prototype.fromProperty=function(p,stripped){
	this.encodeProperty(p.name);	
	var r=BON.serialize(obj,stripped==undefined?false:stripped,false);
	this.appendBuffer(r.remainingBuffer());
}; 



Binary.prototype.toType=function(){
	return new Type(this.toUint8());
}; 

Binary.prototype.fromType=function(t){
	this.fromUint8(t.value);
}; 

Binary.prototype.toTypedIterator=function(callback){
var tt=this.decodeInt(8, false  );
var v;
var step=this.toBoolean();
while (step){
v=this.toObject(false,tt);	
step=this.toBoolean();
callback(v,step);
}	
}; 
Binary.prototype.toUntypedIterator=function(callback){
var tt,v;
var step=this.toBoolean();
while (step){
v=this.toObject();	
step=this.toBoolean();
callback(v,step);
}
		
}; 

Binary.prototype.eof =function(){
	return this.offset>=this.dataview.byteLength;
	}

Binary.prototype.decodeInt   = function decodeInt(bit,signed){
 
var a;
switch(bit){
case 8:{
a=(signed)?this.dataview.getInt8(this.offset,false):this.dataview.getUint8(this.offset,false);			
this.offset+=1;
}break;
case 16:{
a=(signed)?this.dataview.getInt16(this.offset,false):this.dataview.getUint16(this.offset,false);			
this.offset+=2;
}
break;
case 32:{
a=(signed)?this.dataview.getInt32(this.offset,false):this.dataview.getUint32(this.offset,false);			
this.offset+=4;
}break;
case 64:{
var hi=this.dataview.getUint32(this.offset,false);
var lo=this.dataview.getUint32(this.offset+4,false);
a=(signed)?new Int64(hi,lo):new UInt64(hi,lo);			
this.offset+=8;	
}break;
default : throw new Exception("integer length not correct");	
}

return a;	
}; 


Binary.prototype.encodeFloat   = function encodeFloat(value,isDouble){
if (isDouble)  this.dataview.setFloat64(this.offset,value,false); else this.dataview.setFloat32(this.offset,value,false);	
this.offset+=8;	
}; 
Binary.prototype.decodeFloat   = function decodeFloat(isDouble){			
var r= (isDouble)?this.dataview.getFloat64(this.offset,false):this.dataview.getFloat32(this.offset,false);	
this.offset+=8;	
return r;
};

Binary.prototype.toBoolean   = function(){
var a=this.dataview.getUint8(this.offset);
this.offset++;
return a==1;	
}; 
Binary.prototype.fromBoolean   = function(b){
this.dataview.setUint8(this.offset,b?1:0);
this.offset++;
};

Binary.prototype.fromBitSet   = function(b){
var l=b.length();
var bytes=Math.ceil(l/8);
var part=l%8;
this.dataview.setUint32(this.offset,l);
this.offset+=4;
var cell,k;
for(var j=0;j<bytes;j++){
if (j==bytes-1) k=part; else k=8;
cell=0;
for(var i=0;i<k;i++) {
	 cell=(b.get(j*8+i)<<(7-i)) | cell;
 }
this.dataview.setUint8(this.offset,cell);
this.offset++;
}
};

Binary.prototype.toBitSet   = function(b){
	

var l=this.dataview.getUint32(this.offset);
this.offset+=4;
var bytes=Math.ceil(l/8);
var part=l%8;
var b=new BitSet();
var cell,k;
for(var j=0;j<bytes;j++){
cell=this.dataview.getUint8(this.offset);
if (j==bytes-1) k=part; else k=8;
for(var i=0;i<k;i++) {
	if ((1 <<(7-i) & cell)!=0) b.set(i+8*j);
}
this.offset++;
}
return b;
};


Binary.getPropertySize=function(s){
	return Math.ceil(s.length/4*3)+1;
};
Binary.prototype.encodeProperty=function(s){
if (s.length>255) throw new Exception('invalid property length');
var count=Binary.getPropertySize(s)-1;

this.dataview.setUint8(this.offset,s.length,false);
var ci=this.offset;
for (var i=1;i<count;i++) this.dataview.setUint8(ci+i,0);
ci++;
var bi=8;
var ch;
var c,a=0,l=s.length;
var tmp;
for(var i=0;i<l;i++){
ch=s.charCodeAt(i);
if (ch>=48 && ch<=57) c=ch-48;
else if (ch>=65 &&ch<=90) c=ch-55;
else if (ch>=97 && ch<=122) c=ch-61;
else if (ch==95) c=62;
else if (ch==36)  c=63;
else  throw new Exception('invalid property character');	
tmp=bi-6;
if (tmp>=0){
	a = a | (c << tmp);
	bi = tmp;
	this.dataview.setUint8(ci,a);
} else {
	a = a | (c >> (6 - bi));
	this.dataview.setUint8(ci,a);ci++;
	bi = 8 + tmp;
	a = (c << bi) & 0xff;
	
}
	if (bi == 0 || (l - 1 == i)) {
				this.dataview.setUint8(ci,a);ci++;	
				a = 0;
				bi = 8;
			}

}
this.offset+=count+1;	
return a;
};

Binary.prototype.remainingBuffer=function(r){
return (r==undefined)?this.dataview.buffer.slice(this.offset):this.dataview.buffer.slice(this.offset,r);		
};

Binary.prototype.decodeProperty=function(a){
var count=this.dataview.getUint8(this.offset);
var s='';
var index=count;
var ci=this.offset+1;
var bi=8;
var ch;
var c,a=0;
var tmp;
do{

tmp=bi-6;
if (tmp>=0){


	c= (a & (0xff >> (8 - bi)))<<tmp;
				if (tmp>0){
				a= this.dataview.getUint8(ci);
				c = (c << tmp) | (a >> tmp);
				ci++;
				}
				bi = tmp;
				index--;
		
} else {
	c = (a & (0xff >> (8 - bi)));
				bi = 8 + tmp;
				c=c<< (-tmp);
				
				a=this.dataview.getUint8(ci);
				c = c | (a >> bi);
				index--;ci++;	
}
if (bi == 0) {
				a = 0;
				bi = 8;
			}
if (c<10) s+=String.fromCharCode(c+48);
else if (c>=10 &&c<36) s+=String.fromCharCode(55+c);
else if (c>=36 && c<62) s+=String.fromCharCode(c+61);
else if (c==62) s+=String.fromCharCode(95);
else if (c==63)  s+=String.fromCharCode(36);


}while(index>0);
this.offset+=ci-this.offset;	
return s;
};

Binary.prototype.toUTF8= function toUTF8(){
 var count=this.dataview.getUint16(this.offset,false);
 var i= 2+this.offset;
 var end=count+i;
 var result= "";
                  
                  var c=c1=c2=0;
                
                
                  while( i < end ) {
                      c= this.dataview.getUint8(i)&0xff;
                    
                      if( c < 128 ) {
                          result+= String.fromCharCode(c);
                          i++;
                      }
                      else if( (c > 191) && (c < 224) ) {
                          if( i+1 >= count )
                              throw "Un-expected encoding error, UTF-8 stream truncated, or incorrect";
                          c2= this.dataview.getUint8(i+1)&0xff;
                          result+= String.fromCharCode( ((c&31)<<6) | (c2&63) );
                          i+=2;
                      }
                      else {
                          if( i+2 >= count  || i+1 >= count )
                              throw "Un-expected encoding error, UTF-8 stream truncated, or incorrect";
                          c2= this.dataview.getUint8(i+1)&0xff;
                          c3= this.dataview.getUint8(i+2)&0xff;
                          result+= String.fromCharCode( ((c&15)<<12) | ((c2&63)<<6) | (c3&63) );
                          i+=3;
                      }          
                  }  
                  this.offset+=2+count;              
                  return result;		
};

Binary.prototype.fromUTF8= function fromUTF8(stringToEncode){
 stringToEncode = stringToEncode.replace(/\r\n/g,"\n");
              var utftext = [];
              
              for (var n = 0; n < stringToEncode.length; n++) {

                  var c = stringToEncode.charCodeAt(n);

                  if (c < 128) {
                      utftext[utftext.length]= c;
                  }
                  else if((c > 127) && (c < 2048)) {
                      utftext[utftext.length]= (c >> 6) | 192;
                      utftext[utftext.length]= (c & 63) | 128;
                  }
                  else {
                      utftext[utftext.length]= (c >> 12) | 224;
                      utftext[utftext.length]= ((c >> 6) & 63) | 128;
                      utftext[utftext.length]= (c & 63) | 128;
                  }

              }

this.dataview.setUint16(this.offset,utftext.length,false);
this.offset+=2;
for(var i=0;i<utftext.length;i++) this.dataview.setUint8(this.offset++,utftext[i]);


	
};

Binary.UTF8Length= function fromUTF8(stringToEncode){
 stringToEncode = stringToEncode.replace(/\r\n/g,"\n");
              var i=0
              
              for (var n = 0; n < stringToEncode.length; n++) {

                  var c = stringToEncode.charCodeAt(n);

                  if (c < 128) {
                      i++;
                  }
                  else if((c > 127) && (c < 2048)) {
                       i+=2;
                  }
                  else {
                      i+=3;
                  }

              }



return i+2;  
	
};

Binary.prototype.setOffset= function(a){
this.offset=a;
};

Binary.prototype.toBinary    = function(size){ 
if (size==undefined) {size=this.dataview.getUint32(this.offset);this.offset+=4;}	
var r=this.dataview.buffer.slice(this.offset,this.offset+size);	
this.offset+=size;
return r;
};

Binary.prototype.fromBinary    = function( data,fixed ){ 
if (fixed == undefined) fixed=false;
if (data instanceof Blob) {
var uint8ArrayNew  = null;
var arrayBufferNew = null;
var fileReader     = new FileReader();
fileReader.onload  = function(progressEvent) {
    arrayBufferNew = this.result;
    uint8ArrayNew  = new Uint8Array(arrayBufferNew);

    // warn if read values are not the same as the original values
    // arrayEqual from: http://stackoverflow.com/questions/3115982/how-to-check-javascript-array-equals
    function arrayEqual(a, b) { return !(a<b || b<a); };
    if (arrayBufferNew.byteLength !== arrayBuffer.byteLength) // should be 3
        console.warn("ArrayBuffer byteLength does not match");
    if (arrayEqual(uint8ArrayNew, uint8Array) !== true) // should be [1,2,3]
        console.warn("Uint8Array does not match");
};
fileReader.readAsArrayBuffer(blob);
data=fileReader.result; // also accessible this way once the blob has been read	
	
} else {
data =  new Uint8Array(data);	
}
if (!fixed){
this.dataview.setUint32(this.offset,data.byteLength,false);	
var j=this.offset+4;
for(var i=0;i<data.byteLength;i++)	this.dataview.setUint8(j++,data[i]);	
this.offset+=4+data.byteLength;
}else {
var j=this.offset;
for(var i=0;i<data.byteLength;i++)	this.dataview.setUint8(j++,data[i]);	
this.offset+=data.byteLength;
}
	
};
var BASE36='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';	

function Type(o){
this.value=	BON.getType(o);	
}
function Reference(o){
if (typeInstance(buffer)!='number') throw "invalid argument";
this.value=	o;	
}

function Property(s,o){
this.name=s;
this.value=o;
this.toString=function(){
return name+"="+o;	
};
}
function EID(buffer){

if (typeInstance(buffer)=='string'){
	var getSymbol=function(s,i){
		var ch = s.charCodeAt(i);
		if (ch >= 48 && ch <= 57)
			return ch -48;
		else if (ch >= 65 && ch <= 90)
			return ch -55;
		else
			throw "illegal character at position " + i;
	};
	this.value=new Uint8Array(16);
	buffer=buffer.toUpperCase();
	var q = 0;
		var r = 0;
		var i = 0;
		var p = 15;
		var len=buffer.length;
		do {
			if (q < 256 && i < len) {
	 			q = q * 36 + getSymbol(buffer, i++);
				continue;
			}
			r = q % 256;
			q = Math.floor(q / 256);

			this.value[p--] =  r;
			if (p==-1) break;

		} while ((i < len)||((i==len||p==15)&&q>0));
       for(;p>0;p--)this.value[p--]=0;

} else {
this.value=new Uint8Array(buffer);	

}
	
};


EID.prototype.toString=function(){
	var  q = 0;var sb='';
		var r = 0;
		var  i = 0;

		do {
			if (q < 36 && i <= 15) {
				q = q * 256 + (this.value[i++] & 0xFF);
				continue;
			}
			r = q % 36;
			q = Math.floor(q / 36);

			sb=BASE36[r]+sb

		} while (i <= 15 ||( i==16 &&q>0));
		if (sb.length==0) sb='0';
		return sb;
};

function UInt64(hi,lo){

this.toString=function(){

var b=new Uint32Array(this.buffer.buffer);
return "Ox"+b[0].toString(16)+b[1].toString(16);	
};

this.toJSON=function(){
return this.toString();	
};
 /**
* Set the value. Takes any of the following arguments:
*
* setValue(string) - A hexidecimal string
* setValue(number) - Number (throws if n is outside int64 range)
* setValue(hi, lo) - Raw bits as two 32-bit values
*/

this.setValue= function(hi, lo) {
if (lo==undefined) {
if (hi instanceof UInt64){
    this.buffer=hi.buffer.clone();	
} else if (typeInstance(hi) == 'number') {
hi = Math.abs(hi);
lo = hi % 0x100000000;
hi = hi / 0x100000000;
if (hi > 0x100000000) throw new RangeError(hi + ' is outside Int64 range');
hi = hi | 0;
} else if (typeof(hi) == 'string') {
hi = (hi + '').replace(/^0x/, '');
lo = hi.substr(-8);
hi = hi.length > 8 ? hi.substr(0, hi.length - 8) : '';
hi = parseInt(hi, 16);
lo = parseInt(lo, 16);

} else {
throw new Error(hi + ' must be a Number or String');
}
}
if (this.buffer==undefined) this.buffer=new Uint8Array(8);
var b=new Uint32Array(this.buffer.buffer);
if (!ENDIANESS) {
	var l=((lo >> 24) & 0x000000FF) | ((lo >> 8) & 0x0000FF00) | ((lo<< 8) & 0x00FF0000) | ((lo<< 24) & 0xFF000000);
	var h=((hi >> 24) & 0x000000FF) | ((hi >> 8) & 0x0000FF00) | ((hi<< 8) & 0x00FF0000) | ((hi<< 24) & 0xFF000000);
   	hi=h;
   	lo=l;
}
b[0]=hi;
b[1]=lo;

};

this.valueOf=function(){
return this.toNumber();	
};

this.toNumber= function(allowImprecise) {
var b = this.buffer;
// Running sum of octets, doing a 2's complement
var  x = 0,v=0;
if (allowImprecise) {
	for (var i = 7, m = 1; i >= 0; i--, m *= 256) x += b[i] * m;	
}
else {
	for (var i = 7, m = 1; i >= 0; i--, m *= 256) {
		v=b[i];
		if ((i==0 && v!=0)||(i==1 && ( v & 0x0F)!=0)) return Infinity;
		x += v*m;
	}
}
return  x;
};

this.fromNumberFormat=function(a){	
	var f;
	if (!ENDIANESS) {
		var b= new Uint32Array(this.buffer);
		f=new Float64Array(this.buffer);
		f[0]=a;	
		var b1=	((b[0] >> 24) & 0x000000FF) | ((b[0] >> 8) & 0x0000FF00) | ((b[0]<< 8) & 0x00FF0000) | ((b[0]<< 24) & 0xFF000000);
		var b0=	((b[1]>> 24) & 0x000000FF) | ((b[1] >> 8) & 0x0000FF00) | ((b[1]<< 8) & 0x00FF0000) | ((b[1] << 24) & 0xFF000000);
		b[0]=b0;
   	    b[1]=b1;
	} else {
		f=new Float64Array(this.buffer.buffer);
	    f[0]=a;	
	}
};
this.toNumberFormat=function(){
	var b=this.buffer;
	if (!ENDIANESS) {
	var o= new Uint32Array(this.buffer);
	b=new Uint32Array(2);
	var b1=((o[0] >> 24) & 0x000000FF) | ((o[0] >> 8) & 0x0000FF00) | ((o[0]<< 8) & 0x00FF0000) | ((o[0]<< 24) & 0xFF000000);
	var b0=((o[1] >> 24) & 0x000000FF) | ((o[1] >> 8) & 0x0000FF00) | ((o[1]<< 8) & 0x00FF0000) | ((o[1]<< 24) & 0xFF000000);
   	b[0]=b0;
   	b[1]=b1;
	}
	var f=new Float64Array(b.buffer);
	return f[0];	
};

this.lowerInt =function(){
var o=new Uint32Array(this.buffer.buffer);
	return (!ENDIANESS)?((o[1] >> 24) & 0x000000FF) | ((o[1] >> 8) & 0x0000FF00) | ((o[1]<< 8) & 0x00FF0000) | ((o[1]<< 24) & 0xFF000000):o[1];

};
this.upperInt =function(){
var o=new Uint32Array(this.buffer.buffer);
return (!ENDIANESS)?((o[0] >> 24) & 0x000000FF) | ((o[0] >> 8) & 0x0000FF00) | ((o[0]<< 8) & 0x00FF0000) | ((o[0]<< 24) & 0xFF000000):o[0];

};

this.toBuffer=function(){
	return this.buffer;	
};

if (hi==undefined) hi=0;
this.setValue(hi,lo);	
	
};

function Int64(hi,lo){



this.fromNumberFormat=function(a){	
	var f;
	if (!ENDIANESS) {
		var b= new Uint32Array(this.buffer);
		f=new Float64Array(this.buffer);
		f[0]=a;	
		var b1=	((b[0] >> 24) & 0x000000FF) | ((b[0] >> 8) & 0x0000FF00) | ((b[0]<< 8) & 0x00FF0000) | ((b[0]<< 24) & 0xFF000000);
		var b0=	((b[1]>> 24) & 0x000000FF) | ((b[1] >> 8) & 0x0000FF00) | ((b[1]<< 8) & 0x00FF0000) | ((b[1] << 24) & 0xFF000000);
		b[0]=b0;
     	b[1]=b1;
	} else {
		f=new Float64Array(this.buffer.buffer);
	    f[0]=a;	
	}
};
this.toNumberFormat=function(){
	var b=this.buffer;
	if (!ENDIANESS) {
	var o= new Uint32Array(this.buffer);
	b=new Uint32Array(2);
	var b1=((o[0] >> 24) & 0x000000FF) | ((o[0] >> 8) & 0x0000FF00) | ((o[0]<< 8) & 0x00FF0000) | ((o[0]<< 24) & 0xFF000000);
	var b0=((o[1] >> 24) & 0x000000FF) | ((o[1] >> 8) & 0x0000FF00) | ((o[1]<< 8) & 0x00FF0000) | ((o[1]<< 24) & 0xFF000000);
   	b[0]=b0;
   	b[1]=b1;	
   	}
	var f=new Float64Array(b.buffer);
	return f[0];	
};
this.lowerInt =function(){
var o=new Uint32Array(this.buffer.buffer);
	return (!ENDIANESS)?((o[1] >> 24) & 0x000000FF) | ((o[1] >> 8) & 0x0000FF00) | ((o[1]<< 8) & 0x00FF0000) | ((o[1]<< 24) & 0xFF000000):o[1];

};
this.upperInt =function(){
var o=new Uint32Array(this.buffer.buffer);
return (!ENDIANESS)?((o[0] >> 24) & 0x000000FF) | ((o[0] >> 8) & 0x0000FF00) | ((o[0]<< 8) & 0x00FF0000) | ((o[0]<< 24) & 0xFF000000):o[0];

};

var _2scomp= function(b) {
var   carry = 1;
for (var i =  7; i >= 0; i--) {
var v = (b[i] ^ 0xff) + carry;
b[i] = v & 0xff;
carry = v >> 8;
}
};

this.toNumber= function(allowImprecise) {
var b = this.buffer;
// Running sum of octets, doing a 2's complement
var negate = b[0] & 0x80, x = 0, carry = 1;
for (var i = 7, m = 1; i >= 0; i--, m *= 256) {
var v = b[i];
// 2's complement for negative numbers
if (negate) {
v = (v ^ 0xff) + carry;
carry = v >> 8;
v = v & 0xff;
}
x += v * m;
}
// Return Infinity if we've lost integer precision
if (!allowImprecise && x >= Int64.MAX_INT) {
return negate ? -Infinity : Infinity;
}
return negate ? -x : x;
};
 /**
* Set the value. Takes any of the following arguments:
*
* setValue(string) - A hexidecimal string
* setValue(number) - Number (throws if n is outside int64 range)
* setValue(hi, lo) - Raw bits as two 32-bit values
*/

this.setValue= function(hi, lo) {
var negate = false;
if (lo==undefined) {
	if (hi instanceof Int64){
    this.buffer=hi.buffer.clone();	
} else if (typeInstance(hi) == 'number') {
// Simplify bitfield retrieval by using abs() value. We restore sign
// later
negate = hi < 0;
hi = Math.abs(hi);
lo = hi % 0x100000000;
hi = hi / 0x100000000;
if (hi > 0x100000000) throw new RangeError(hi + ' is outside Int64 range');
hi = hi | 0;
} else if (typeof(hi) == 'string') {
hi = (hi + '').replace(/^0x/, '');
lo = hi.substr(-8);
hi = hi.length > 8 ? hi.substr(0, hi.length - 8) : '';
hi = parseInt(hi, 16);
lo = parseInt(lo, 16);
} else {
throw new Error(hi + ' must be a Number or String');
}
}
// Technically we should throw if hi or lo is outside int32 range here, but
// it's not worth the effort. Anything past the 32'nd bit is ignored.
// Copy bytes to buffer
if (this.buffer==undefined) this.buffer=new Uint8Array(8);
var b = this.buffer;
for (var i = 7; i >= 0; i--) {
b[i] = lo & 0xff;
lo = i == 4 ? hi : lo >>> 8;
}
// Restore sign of passed argument
if (negate) _2scomp(this.buffer);
};

this.toBuffer=function(){
	return this.buffer;	
};
this.toString=function(){

var b=new Uint32Array(this.buffer.buffer);
return "Ox"+b[0].toString(16)+b[1].toString(16);	
};

this.toJSON=function(){
return this.toString();	
};

if (hi==undefined) hi=0;
this.setValue(hi,lo);
	
	
};
function appendBuffer( buffer1, buffer2 ) {
  var tmp = new Uint8Array( buffer1.byteLength + buffer2.byteLength );
  tmp.set( new Uint8Array( buffer1 ), 0 );
  tmp.set( new Uint8Array( buffer2 ), buffer1.byteLength );
  return tmp.buffer;
}


Binary.prototype.fromBuffer=function(buffer){
	var data;
	if (buffer instanceof Blob) {
var uint8ArrayNew  = null;
var arrayBufferNew = null;
var fileReader     = new FileReader();
fileReader.onload  = function(progressEvent) {
    arrayBufferNew = this.result;
    uint8ArrayNew  = new Uint8Array(arrayBufferNew);

    // warn if read values are not the same as the original values
    // arrayEqual from: http://stackoverflow.com/questions/3115982/how-to-check-javascript-array-equals
    function arrayEqual(a, b) { return !(a<b || b<a); };
    if (arrayBufferNew.byteLength !== arrayBuffer.byteLength) // should be 3
        console.warn("ArrayBuffer byteLength does not match");
    if (arrayEqual(uint8ArrayNew, uint8Array) !== true) // should be [1,2,3]
        console.warn("Uint8Array does not match");
};
fileReader.readAsArrayBuffer(blob);
data=fileReader.result; // also accessible this way once the blob has been read	
	
} else {
data =  new Uint8Array(buffer);	
}


for(var i=0;i<data.byteLength;i++) this.dataview.setUint8(this.offset++,data[i]);	
};
Binary.prototype.toInt8    = function(){ return new TypedNumber(this.decodeInt( 8, true  ),'int8'); };
Binary.prototype.fromInt8  = function( data ){ return this.encodeInt( data,  8, false  ); };
Binary.prototype.toUint8     = function(){ return new TypedNumber(this.decodeInt(  8, false ),'uint8'); };
Binary.prototype.fromUint8   = function( data ){ return this.encodeInt( data,  8, false ); };
Binary.prototype.toInt16    = function( ){ return new TypedNumber(this.decodeInt( 16, true  ),'int16');  };
Binary.prototype.fromInt16  = function( data ){ return this.encodeInt( data, 16, true  ); };
Binary.prototype.toUint16     = function( ){ return new TypedNumber(this.decodeInt(  16, false ),'unt16');  };
Binary.prototype.fromUint16   = function( data ){ return this.encodeInt( data, 16, false ); };
Binary.prototype.toInt32      = function(  ){ return new TypedNumber(this.decodeInt( 32, true  ),'int32'); };
Binary.prototype.fromInt32    = function( data ){ return this.encodeInt( data, 32, true  ); };
Binary.prototype.toUint32      = function(  ){ return new TypedNumber(this.decodeInt( 32, false  ),'uint32');  };
Binary.prototype.fromUint32    = function( data ){ return this.encodeInt( data, 32, false ); };
Binary.prototype.toInt64     = function( ){ return new TypedNumber(this.decodeInt(  64, true  ),'int64'); };
Binary.prototype.fromInt64   = function( data ){ return this.encodeInt( data, 64, true  ); };
Binary.prototype.toUint64    = function(  ){ return new TypedNumber(this.decodeInt(  64, false ),'uint64');  };
Binary.prototype.fromUint64  = function( data ){ return this.encodeInt( data, 64, false ); };
Binary.prototype.toFloat32    = function(  ){ return new TypedNumber(this.decodeFloat(false   ),'float32');  };
Binary.prototype.fromFloat32  = function( data ){ return this.encodeFloat( data, false   ); };
Binary.prototype.toFloat64   = function(){ return new TypedNumber(this.decodeFloat( true ),'float64');  };
Binary.prototype.fromFloat64 = function( data ){ return this.encodeFloat( data, true ); };
Binary.prototype.toString = function(){
var s='';
var b=this.dataview.buffer;
for(var i=0;i<b.length;i++) s+=b[i].String(16);
return s;
 
};
Binary.crc32=function crc32 (buffer,len ) {
        fnv = 0;

        for(var i = 0; i < len; i++) {
            fnv = ((fnv + (((fnv << 1) + (fnv << 4) + (fnv << 7) + (fnv << 8) + (fnv << 24)) >>> 0)) ^ (buffer[i] & 0xff)) ;
         }

        return fnv >>> 0;

};
/* type 
 * 0 null
 * 1 typedobject
 * 2 untypedobject
 * 3 typedarray
 * 4 untypedarray
 * 5 typediterator
 * 6 untyped iterator
 * 7 eid
 * 8 reference 
 * 9 type
 * 10 bool
 * 11 utf8
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
 * 26 property
 * ... optional
 * */


function TypedNumber(a,type) {
    this.type=(type!=undefined)?type:'float64';
    this.checkAndSet=function(t,a){
    switch(t){
	case "int8":if (a<-128||a>127) throw 'invalid numeric range';this.value=new Number(a);return 1;	
	case "uint8":if (a<0||a>255) throw 'invalid numeric range';this.value=new Number(a);return 1;;	
	case "int16":if (a<-32768||a>32767) throw 'invalid numeric range';this.value=new Number(a);return 2;	
	case "uint16":if (a<0||a>65535) throw 'invalid numeric range';this.value=new Number(a);return 2;	
	case "int32":if (a<-2147483648||a>2147483647) throw 'invalid numeric range';this.value=new Number(a);return 4;	
	case "uint32":if (a<0||a>4294967295) throw 'invalid numeric range';this.value=new Number(a);return 4;	
	case "int64": if (typeInstance(a)=='number') a=new Int64(a);else  if (!(a instanceof Int64) ) throw 'invalid type object';this.value=a;return 8;	
	case "uint64":if (typeInstance(a)=='number') a=new UInt64(a);else if (!(a instanceof UInt64) ) throw 'invalid type object';this.value=a;return 8;
	case "float32":if (a<-1.40129846432481707e-45||a>3.40282346638528860e+38) throw 'invalid numeric range';this.value=new Number(a);return 4;
	case "float64":this.value=new Number(a);return 8;
	default :	throw 'invalid numeric type \''+t+'\'';
	}
    };
    this.size=this.checkAndSet(this.type,a);
   
}
TypedNumber.prototype.constructor = TypedNumber;
TypedNumber.prototype.valueOf=function(){ 
	return this.value.valueOf();
};
TypedNumber.prototype.toString=function(){ 
	return this.value.toString();
};
TypedNumber.prototype.toJSON=function(){ 
	return (this.value.toJSON)?this.value.toJSON():this.value;
};
TypedNumber.prototype.set=function(value){ 
if (value instanceof TypedNumber) value=value.valueOf();
this.size=this.checkRange(this.type,value);
this.value;
};




    function BitSet() {
	  this.size=0;
      this.store = [];
    }

    BitSet.prototype.wordIndex = function(pos) {
      return Math.floor(pos/32);
    };
    


    BitSet.prototype.set = function(pos) {
	  if (pos>=this.size) this.size=pos+1;
	  var index=this.wordIndex(pos);
      this.store[index]= this.store[index] | (1 << (pos % 32));
    };

    BitSet.prototype.clear = function(pos) {
		var index=this.wordIndex(pos);
      
      if (this.store[index]==0 && index==this.store.length-1) {
	     delete this.store[index];
	     this.size-= this.size%32;
	  } else {
		if (pos>=this.size) this.size=pos+1;
		this.store[index] = this.store[index]  & ( 0xFF ^ (1 << (pos%32)));  
	  }
    };

    BitSet.prototype.get = function(pos) {
      return (this.store[this.wordIndex(pos)] & (1 << (pos%32))) !== 0;
    };

    BitSet.prototype.length = function() {
     return this.size;
    };
	BitSet.prototype.toJSON=function(){
	return this.toString();	
	};

    BitSet.prototype.toString = function() {
      var lpad,
        _this = this;
      rpad = function(str, padString, length) {
        while (str.length < length) {
          str =  str + padString;
        }
        return str;
      };
      if (this.size > 0) {
		  var s='';
          if (this.store.length>1) for(var i=0;i<this.store.length-1;i++)
           s+=rpad(this.store[i].toString(2), '0', 32);
        s+=rpad(this.store[this.store.length-1].toString(2), '0', this.size%32);
        return s;
      } else {
        return lpad('', 0, 1);
      }
    };

    BitSet.prototype.or = function(set) {
      var pos, wordsInCommon, _i, _ref;
      if (this === set) {
        return;
      }
      wordsInCommon = Math.min(this.size, set.size);
      for (pos = _i = 0, _ref = wordsInCommon - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; pos = 0 <= _ref ? ++_i : --_i) {
        this.store[pos] |= set.store[pos];
      }
      if (wordsInCommon < set.size) {
        this.store = this.store.concat(set.store.slice(wordsInCommon, set.size));
      }
      return null;
    };

    BitSet.prototype.and = function(set) {
      var pos, _i, _j, _ref, _ref1, _ref2;
      if (this === set) {
        return;
      }
      for (pos = _i = _ref = this.size, _ref1 = set.size; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; pos = _ref <= _ref1 ? ++_i : --_i) {
        this.store[pos] = 0;
      }
      for (pos = _j = 0, _ref2 = this.size; 0 <= _ref2 ? _j <= _ref2 : _j >= _ref2; pos = 0 <= _ref2 ? ++_j : --_j) {
        this.store[pos] &= set.store[pos];
      }
      return null;
    };

    BitSet.prototype.andNot = function(set) {
      var pos, _i, _ref;
      for (pos = _i = 0, _ref = Math.min(this.size, set.size) - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; pos = 0 <= _ref ? ++_i : --_i) {
        this.store[pos] &= ~set.store[pos];
      }
      return null;
    };

    BitSet.prototype.xor = function(set) {
      var pos, _i, _ref;
      if (this === set) {
        return;
      }
      for (pos = _i = 0, _ref = this.size; 0 <= _ref ? _i <= _ref : _i >= _ref; pos = 0 <= _ref ? ++_i : --_i) {
        this.store[pos] ^= set.store[pos];
      }
      return null;
    };

  


 
function BON(){};

BON.getType=function(obj){
if (obj==null||obj==undefined) return 0;
else if (obj instanceof String) {
return 11;
} else if (obj instanceof Boolean) {
return 10;
}else if (obj instanceof RegExp) {
return 19;
}else if (obj instanceof Date) {
return 18;
}else if (obj instanceof Number) {
return 16;
}else if (obj instanceof BitSet) {
return 20;
}else if (obj instanceof EID) {
return 7;
}else if (obj instanceof Reference) {
return 8;}
else if (obj instanceof Type) {
return 9;
}else if (obj instanceof Property) {
return 26;
}else if (obj instanceof TypedNumber) {
switch(obj.type){
	case "int8":return 13;	
	case "uint8":return 12;	
	case "int16":return 15;	
	case "uint16":return 14;	
	case "int32":return 17;	
	case "uint32":return 16;	
	case "int64":return 19;	
	case "uint64":return 18;
	case "float32":return 20;
	case "float64":return 21;
}
} else if ((obj instanceof ArrayBuffer)||(obj instanceof Blob)||(obj instanceof Int8Array)
||(obj instanceof Uint8Array)||(obj instanceof Int16Array)||(obj instanceof Uint16Array)||(obj instanceof Int32Array)||(obj instanceof Uint32Array)||(obj instanceof Float32Array)||(obj instanceof Float64Array))	{
return 22;
} else if (Array.isArray(obj))	{
return (Array.isTyped(obj))?3:4;
}
else if (obj instanceof Object){
return  (Object.isTyped(obj))?1:2;
}	
else {
var type=typeof(obj);
switch(type){
case "string":return 11;
case "boolean":return 10;
case "number":return 21;	
}		
	
}
}


 

BON.calculateSize=function(enumerable,typed,stripped,obj,type){
if (type==undefined) type=this.getType(obj);
switch(type){
case 0:return (!typed)?0:1;// null is skipped
case 1:{
	var keys=Object.keys(obj);
	var size=(enumerable)?4:0;
	size+=(!typed)?0:1;
	if (!stripped) size++;
	for(var i=0;i<keys.length;i++) size+=Binary.getPropertySize(keys[i]);// fieldname props
	if (keys.length>0) size+=keys.length*BON.calculateSize(enumerable,false,stripped,obj[keys[0]]);
	return size;
	}
case 2:{
	var keys=Object.keys(obj);
	var size=(enumerable)?4:0;
	size+=(!typed)?0:1;
	for(var i=0;i<keys.length;i++) size+=Binary.getPropertySize(keys[i]);
	for(var i=0;i<keys.length;i++) size+=BON.calculateSize(enumerable,!stripped,stripped,obj[keys[i]]);
	return size;
	}
case 3:	{
	var size=(enumerable)?4:0;
	size+=(!typed)?0:1;
	if (!stripped) size++;
	if (obj.length>0) size+=obj.length*BON.calculateSize(enumerable,false,stripped,obj[0]);
	return size;
}
case 4:{
	var size=(enumerable)?4:0;
	size+=(!typed)?0:1;
	for(var i=0;i<obj.length;i++) size+=BON.calculateSize(enumerable,!stripped,stripped,obj[i]);
	return size;
}
case 5:	{
	size=(!typed)?0:1;
	
	if (obj.length>0) size+=obj.length*(BON.calculateSize(enumerable,false,stripped,obj[0])+1);
	return size+1;
}
case 6:{
	size=(!typed)?0:1;
	for(var i=0;i<obj.length;i++) size+=1+BON.calculateSize(enumerable,!stripped,stripped,obj[i]);
	return size+1;
}
case 7:return  (!typed)?16:17;
case 8:return  (!typed)?4:5;
case 9:return (!typed)?1:2;
case 10:return (!typed)?1:2;	
case 11:return ((!typed)?0:1)+Binary.UTF8Length(obj);
case 12:case 13: return (!typed)?1:2;	
case 14:case 15:return (!typed)?2:3;
case 16:case 17:return (!typed)?4:5;
case 18:case 19:return (!typed)?8:9;
case 20:return (!typed)?4:5;
case 21:return (!typed)?8:9;
case 22: {
	var c=(enumerable)?4:0;
	c+=(!typed)?0:1;
	if (obj instanceof Blob) c+=obj.size; 
	else if ((obj instanceof ArrayBuffer)||(obj instanceof Int8Array)||(obj instanceof Uint8Array)||(obj instanceof Int16Array)||(obj instanceof Uint16Array)||(obj instanceof Int32Array)||(obj instanceof Uint32Array)||(obj instanceof Float32Array)||(obj instanceof Float64Array)) c+=obj.byteLength;
	return c;
	}
case 23:return (!typed)?8:9;
case 24:return  ((!typed)?4:5)+obj.source.length;
case 25: return  ((!typed)?4:5)+Math.ceil(obj.length()/8);
case 26:return ((!typed)?0:1)+Binary.UTF8Length(obj.name)+BON.calculateSize(enumerable,!stripped,stripped,obj.value);
}	
};
  
BON.serialize=function(obj,stripped,checksum,t){
if (stripped==undefined) stripped=false;
if (checksum==undefined) checksum=false;
var size=this.calculateSize(true,!stripped,stripped,obj,t);
if (t!=undefined) size--;	
if (checksum) size+=4;
var buffer=(new Uint8Array(size));
data=new Binary(buffer.buffer);
var _serialize=function(typed,stripped,data,obj,t){
if (t==undefined) {
	t=BON.getType(obj);
    if (typed) data.fromUint8(t);
}	
switch(t){
case 0: break;
case 1:{keys=Object.keys(obj);
data.fromUint32(keys.length);
var k=keys[0],o=obj[k],tt=BON.getType(o);
if (!stripped) data.fromUint8(tt);	
for(var i=0;i<keys.length;i++){
k=keys[i];
data.encodeProperty(k);
_serialize(false,stripped,data,obj[k],tt);
}}break;
case 2: {
keys=Object.keys(obj);
data.fromUint32(keys.length);
var k,o;	
for(var i=0;i<keys.length;i++){
k=keys[i];o=obj[k];
data.encodeProperty(k);
_serialize(!stripped,stripped,data,o);
}
}break;
case 3:{
data.fromUint32(obj.length);
var o=obj[0],tt=BON.getType(o);	
if (!stripped) data.fromUint8(tt);
for(var i=0;i<obj.length;i++){
o=obj[i];
_serialize(false,stripped,data,o,tt);
}
}break;
case 4:{
data.fromUint32(obj.length);
var o;	
for(var i=0;i<obj.length;i++){
o=obj[i];
_serialize(!stripped,stripped,data,o);
}
}break;
case 7: data.fromEID(obj);break;
case 8: data.fromReference(obj);break;
case 9: data.fromType(obj);break;
case 10: data.fromBoolean(obj);break;
case 11: data.fromUTF8(obj);break;
case 12: data.fromUint8(obj);break;
case 13: data.fromInt8(obj);break;
case 14: data.fromUint16(obj);break;
case 15: data.fromInt16(obj);break;
case 16: data.fromUint32(obj);break;
case 17: data.fromInt32(obj);break;
case 18: data.fromUint64(obj.value);break;
case 19: data.fromInt64(obj.value);break; 
case 20: data.fromFloat32(obj);break;
case 21: data.fromFloat64(obj);break;
case 22: data.fromBinary(obj);break;
case 23: data.fromDate(obj);break;
case 24: data.fromRegExp(obj);break;
case 25: data.fromBitSet(obj);break;
case 26: data.fromProperty(obj,stripped);break;
}
};
if (t==undefined) _serialize(!stripped,stripped,data,obj); else _serialize(!stripped,stripped,data,obj,t);
if (checksum)	data.fromUint32(Binary.crc32(buffer,buffer.length-4));
return buffer;
};
 

BON.encode=function(obj,checksum){
if (checksum==undefined) checksum=false;
var size=this.calculateSize(false,false,true,obj);	
if (checksum) size+=4;
var buffer=(new Uint8Array(size));
data=new Binary(buffer.buffer);
var _serialize=function(data,obj){
var t=BON.getType(obj);
switch(t){
case 0: break;
case 1:case 2: {
keys=Object.keys(obj);
var k,o;	
for(var i=0;i<keys.length;i++){
k=keys[i];o=obj[k];
data.encodeProperty(k);
_serialize(data,o);
}
}break;
case 3:case 4:{
var o;	  
for(var i=0;i<obj.length;i++){
o=obj[i];
_serialize(data,o);
}
}break;
case 7: data.fromEID(obj);break;
case 8: data.fromReference(obj);break;
case 9: data.fromType(obj);break;
case 10: data.fromBoolean(obj);break;
case 11: data.fromUTF8(obj);break;
case 12: data.fromUint8(obj);break;
case 13: data.fromInt8(obj);break;
case 14: data.fromUint16(obj);break;
case 15: data.fromInt16(obj);break;
case 16: data.fromUint32(obj);break;
case 17: data.fromInt32(obj);break;
case 18: data.fromUint64(obj.value);break;
case 19: data.fromInt64(obj.value);break;
case 20: data.fromFloat32(obj);break;
case 21: data.fromFloat64(obj);break;
case 22: data.fromBinary(obj,true);break;
case 23: data.fromDate(obj);break;
case 24: data.fromRegExp(obj);break;
case 25: data.fromBitSet(obj);break;
case 26:data.fromProperty(obj,true);break;
}
};
_serialize(data,obj);
if (checksum)	data.fromUint32(Binary.crc32(buffer,buffer.length-4));
return buffer;
};

BON.deserialize=function(buffer,checksum,t){
if (checksum==undefined) checksum=false;
var ar;
if ((buffer instanceof Int8Array)||(buffer instanceof Uint8Array)||( buffer instanceof Int16Array) ||( buffer instanceof Uint16Array)
||( buffer instanceof Int32Array)||( buffer instanceof Uint32Array)||( buffer instanceof Float32Array)||( buffer instanceof Float64Array)) ar=buffer.buffer;
else if (buffer instanceof Array) ar=(new Int8Array(buffer)).buffer;
else ar=buffer;
var data=new Binary(ar);
if (checksum)	{
	var crc=Binary.crc32(buffer,buffer.length-4);
	data.setOffset(buffer.length-4);
	var oc=data.decodeInt(32, false  );
	data.setOffset(0); 
	if (crc!=oc) throw 'invalid checksum';
	
}
var _deserialize=function (data,t){
if (t==undefined||t==null) t=data.decodeInt(8, false  );
switch(t){
case 0: return null;
case 1:{ //typed
var o={};
var l=data.decodeInt(32, false  );
if (l>0){
	var tt=data.decodeInt(8, false  );
	for(var i=0;i<l;i++){
	k=data.decodeProperty();
	o[k]=_deserialize(data,tt);	
	}	
}
return o;	
}
case 2: { //untyped
var k,o={};
var l=data.decodeInt(32, false  );
for(var i=0;i<l;i++){
k=data.decodeProperty();
o[k]=_deserialize(data);	
}
return o;	
} 
case 3:{ //typed
var o=new Array();
var l=data.decodeInt(32, false);
if (l>0){
	var tt=data.decodeInt(8, false  );
	for(var i=0;i<l;i++){
	o.push(_deserialize(data,tt));	
	}	
}
return o;	
} 
case 4:{ //untyped
var o=new Array();
var l=data.decodeInt(32, false  );
for(var i=0;i<l;i++){
o.push(_deserialize(data));	
}		
return o;	
} 
case 5:{
var o=new Array();
data.toTypedIterator(function(v){
o.push(v);
});
return o;	
} 
case 6:{
var o=new Array();
data.toUntypedIterator(function(v){
o.push(v);
});
return o;	
}
case 7: return data.toEID();
case 8: return data.toReference();
case 9: return data.toType();
case 10: return data.toBoolean();
case 11: return data.toUTF8();
case 12: return data.toUint8();
case 13: return data.toInt8();
case 14: return data.toUint16();
case 15: return data.toInt16();
case 16: return data.toUint32();
case 17: return data.toInt32();
case 18: return data.toUint64();
case 19: return data.toUint64();
case 20: return data.toFloat32();
case 21: return data.toFloat64();
case 22: return data.toBinary();
case 23: return data.toDate();
case 24: return data.toRegExp();	
case 25: return data.toBitSet();
case 26: return data.toProperty();
default: throw "undefined data type with code "+t;
}	
	
};
var r= _deserialize(data,t); 
if (t==undefined && data.offset!=buffer.byteLength-(checksum?4:0)) throw "data doesn't cover all the buffer";
return (t!=undefined)?{'object':r,'binary':data}:r;
};






/*
var bs = new BitSet();

for(var n = 0; n < 102; n++) {
  if (n%2) continue;
  bs.set(n);
}

var a=new TypedNumber(200,'uint64');
var b=[new Date(Date.parse("2015-07-08T00:00:00")),{},null,{a:3,b:"ciao ",c:true,d:a,e:bs}];
console.log(JSON.stringify(b));
var r=BON.serialize(b,false,true);
console.log(r);
var t=BON.deserialize(r,true);
console.log(JSON.stringify(t));
*/




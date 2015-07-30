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
   for(var key in obj){
	   i++;
      if (type==null) type=typeInstance(obj[key]);
      else if (type!=typeInstance(obj[key])) return false;
   }
   return (i==0)?false:true;
};
 
 }
 if (typeof(Array.isTyped)=='undefined'){
 Array.isTyped = function(obj){
   var type=null;
   for(var i=0;i<obj.length;i++){
      if (type==null) type=typeInstance(obj[i]);
      else if (type!=typeInstance(obj[i])) return false;
   }
   return (obj.length==0)?false:true;
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
    this.dataview=new DataView(buffer,0);
    this.offset=0;

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
Binary.prototype.eof =function(){return this.offset>=this.dataview.dataview.byteLength;}
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
return this.dataview.buffer.slice(this.offset,r);		
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

Binary.prototype.toBuffer    = function(){ 
var size=this.dataview.getUint32(this.offset,!false);	
var r=this.dataview.buffer.slice(this.offset+4,this.offset+4+size);	
this.offset+=4+size;
return r;
};

Binary.prototype.fromBuffer    = function( data ){ 
this.dataview.setUint32(this.offset,data.length,false);	
var j=this.offset+4;
for(var i=0;i<data.length;i++)	this.dataview.setUint8(j++,data[i]);	
this.offset+=4+data.length;

	
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
 * 5 bool
 * 6 utf8
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
	case "int32":if (a<-2147483648||a>2147483647) throw 'invalid numeric range';return 4;	
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

  


 
function BOP(){};

BOP.getType=function(obj){
if (obj==null||obj==undefined) return 0;
else if (obj instanceof String) {
return 6;
} else if (obj instanceof Boolean) {
return 5;
}else if (obj instanceof RegExp) {
return 19;
}else if (obj instanceof Date) {
return 18;
}else if (obj instanceof Number) {
return 16;
}else if (obj instanceof BitSet) {
return 20;
}else if (obj instanceof TypedNumber) {
switch(obj.type){
	case "int8":return 8;	
	case "uint8":return 7;	
	case "int16":return 10;	
	case "uint16":return 9;	
	case "int32":return 12;	
	case "uint32":return 11;	
	case "int64":return 14;	
	case "uint64":return 13;
	case "float32":return 15;
	case "float64":return 16;
}
} else if (Array.isArray(obj))	{
return (Array.isTyped(obj))?3:4;
}
else if (obj instanceof Object){
return  (Object.isTyped(obj))?1:2;
}	
else {
var type=typeof(obj);
switch(type){
case "string":return 6;
case "boolean":return 5;
case "number":return 16;	
}		
	
}
}


 

BOP.calculateSize=function(enumerable,typed,stripped,obj){
var type=this.getType(obj);
switch(type){
case 0:return (!typed)?0:1;// null is skipped
case 1:{
	var keys=Object.keys(obj);
	var size=(enumerable)?4:0;
	size+=(!typed)?0:1;
	if (!stripped) size++;
	for(var i=0;i<keys.length;i++) size+=Binary.getPropertySize(keys[i]);// fieldname props
	if (keys.length>0) size+=keys.length*BOP.calculateSize(enumerable,false,stripped,obj[keys[0]]);
	return size;
	}
case 2:{
	var keys=Object.keys(obj);
	var size=(enumerable)?4:0;
	size+=(!typed)?0:1;
	for(var i=0;i<keys.length;i++) size+=Binary.getPropertySize(keys[i]);
	for(var i=0;i<keys.length;i++) size+=BOP.calculateSize(enumerable,!stripped,stripped,obj[keys[i]]);
	return size;
	}
case 3:	{
	var size=(enumerable)?4:0;
	size+=(!typed)?0:1;
	if (!stripped) size++;
	if (obj.length>0) size+=obj.length*BOP.calculateSize(enumerable,false,stripped,obj[0]);
	return size;
}
case 4:{
	var size=(enumerable)?4:0;
	size+=(!typed)?0:1;
	for(var i=0;i<obj.length;i++) size+=BOP.calculateSize(enumerable,!stripped,stripped,obj[i]);
	return size;
}
case 5:return (!typed)?1:2;	
case 6:return ((!typed)?0:1)+Binary.UTF8Length(obj);
case 7:case 8:return  (!typed)?1:2;
case 9:case 10:return (!typed)?2:3;
case 11:case 12:return (!typed)?4:5;
case 13:case 14:return (!typed)?8:9;
case 15:return (!typed)?4:5;
case 16:return (!typed)?8:9;
case 17:return  ((!typed)?4:5)+obj.length;
case 18:return (!typed)?8:9;
case 19:return  ((!typed)?4:5)+obj.source.length;
case 20: return  ((!typed)?4:5)+Math.ceil(obj.length()/8);
}	
};

BOP.serialize=function(obj,stripped,checksum){
var size=this.calculateSize(true,!stripped,stripped,obj);	
if (checksum) size+=4;
var buffer=(new Uint8Array(size));
data=new Binary(buffer.buffer);
var _serialize=function(typed,stripped,data,obj,t){
if (t==undefined) {
	t=BOP.getType(obj);
    if (typed) data.fromUint8(t);
}	
switch(t){
case 0: break;
case 1:{keys=Object.keys(obj);
data.fromUint32(keys.length);
var k=keys[0],o=obj[k],tt=BOP.getType(o);
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
var o=obj[0],tt=BOP.getType(o);	
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

case 5: data.fromBoolean(obj);break;
case 6: data.fromUTF8(obj);break;
case 7: data.fromUint8(obj);break;
case 8: data.fromInt8(obj);break;
case 9: data.fromUint16(obj);break;
case 10: data.fromInt16(obj);break;
case 11: data.fromUint32(obj);break;
case 12: data.fromInt32(obj);break;
case 13: data.fromUint64(obj.value);break;
case 14: data.fromInt64(obj.value);break;
case 15: data.fromFloat32(obj);break;
case 16: data.fromFloat64(obj);break;
case 17: data.fromBinary(obj);break;
case 18: data.fromUint64(new UInt64(obj.getTime() + obj.getTimezoneOffset() * 60000));break;
case 19: data.fromUTF8(obj.source);break;
case 20: data.fromBitSet(obj);break;
}
};
_serialize(!stripped,stripped,data,obj);
if (checksum)	data.fromUint32(Binary.crc32(buffer,buffer.length-4));
return buffer;
};


BOP.encode=function(obj,checksum){
var size=this.calculateSize(false,false,true,obj);	
if (checksum) size+=4;
var buffer=(new Uint8Array(size));
data=new Binary(buffer.buffer);
var _serialize=function(data,obj){
var t=BOP.getType(obj);
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

case 5: data.fromBoolean(obj);break;
case 6: data.fromUTF8(obj);break;
case 7: data.fromUint8(obj);break;
case 8: data.fromInt8(obj);break;
case 9: data.fromUint16(obj);break;
case 10: data.fromInt16(obj);break;
case 11: data.fromUint32(obj);break;
case 12: data.fromInt32(obj);break;
case 13: data.fromUint64(obj.value);break;
case 14: data.fromInt64(obj.value);break;
case 15: data.fromFloat32(obj);break;
case 16: data.fromFloat64(obj);break;
case 17: data.fromBinary(obj);break;
case 18: data.fromUint64(new UInt64(obj.getTime() + obj.getTimezoneOffset() * 60000));break;
case 19: data.fromUTF8(obj.source);break;
case 20: data.fromBitSet(obj);break;
}
};
_serialize(data,obj);
if (checksum)	data.fromUint32(Binary.crc32(buffer,buffer.length-4));
return buffer;
};

BOP.deserialize=function(buffer,checksum,t){
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
if (t==undefined) t=data.decodeInt(8, false  );
switch(t){
case 0: return null;
case 1:{
var o={};
var l=data.decodeInt(32, false  );
var tt=data.decodeInt(8, false  );
for(var i=0;i<l;i++){
k=data.decodeProperty();
o[k]=_deserialize(data,tt);	
}	
return o;	
}
case 2: {
var k,o={};
var l=data.decodeInt(32, false  );
for(var i=0;i<l;i++){
k=data.decodeProperty();
o[k]=_deserialize(data);	
}
return o;	
} 
case 3:{
var o=new Array();
var l=data.decodeInt(32, false);
var tt=data.decodeInt(8, false  );
for(var i=0;i<l;i++){
o.push(_deserialize(data,tt));	
}	
return o;	
} 
case 4:{
var o=new Array();
var l=data.decodeInt(32, false  );
for(var i=0;i<l;i++){
o.push(_deserialize(data));	
}		
return o;	
} 


case 5: return data.toBoolean();
case 6: return data.toUTF8();
case 7: return data.toUint8();
case 8: return data.toInt8();
case 9: return data.toUint16();
case 10: return data.toInt16();
case 11: return data.toUint32();
case 12: return data.toInt32();
case 13: return data.toUint64();
case 14: return data.toUint64();
case 15: return data.toFloat32();
case 16: return data.toFloat64();
case 17: return data.toBinary();
case 18: return new Date(data.toUint64().value.toNumber(true)-TIMEZONEOFFSET*60000);
case 19: return new RegExp(data.toUTF8());	
case 20: return data.toBitSet();
}	
	
};
var r= _deserialize(data,t); 
if (data.offset!=buffer.byteLength-(checksum?4:0)) throw "data doesn't cover all the buffer";
return r;
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
var r=BOP.serialize(b,false,true);
console.log(r);
var t=BOP.deserialize(r,true);
console.log(JSON.stringify(t));
*/




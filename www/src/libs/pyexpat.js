function DECLARATION(){
  this.expect = 'name'
  this.items = []
}

DECLARATION.prototype.feed = function(item){
  if(this.expect == 'name'){
    if(item instanceof Name){
      this.name = item.value
      this.is_prolog = this.name == '?xml'
      this.expect = 'any'
    }else{
      console.log('feed item', item)
      throw Error('expected name, got ' + Object.getPrototypeOf(item).name)
    }
  }else{
    if(item != END){
      this.items.push(item)
    }
  }
}

DECLARATION.prototype.toString = function(){
  var res = `<!${this.name}`
  if(this.items.length > 0){
    res += ' '
    var items = this.items.map(x => x.toString())
    res += items.join(' ')
  }
  return res + '>'
}

function ELEMENT() {
  this.expect = 'name'
  this.attrs = []
}

ELEMENT.prototype.feed = function(item){
  if(this.expect == 'name'){
    if(item instanceof Name){
      this.name = item.value
      this.is_prolog = this.name == '?xml'
      this.expect = 'attr_name'
    }else{
      console.log('feed item', item)
      throw Error('expected name, got ' + Object.getPrototypeOf(item).name)
    }
  }else if(this.expect == 'attr_name'){
    if(item instanceof Name){
      this.attrs.push(new ATTR(item.value))
    }else if(item.value == '?' && this.is_prolog){
      if(this.question_mark){
        throw Error('already ?')
      }
      this.question_mark = true
    }else if(item == END){
      if(this.is_prolog && ! this.question_mark){
        throw Error('missing ')
      }
    }else if(item instanceof Punctuation && item.value == '/'){
      this.no_end = true
      this.expect = END
    }else{
      throw Error('expected attribute name, got ' + item)
    }
  }else if(this.expect == 'attr_value'){
    this.attrs[this.attrs.length - 1].value = item
    this.expect = 'attr_name'
  }else if(this.expect == END){
    // after "/"
    if(item != END){
      throw Error('nothing after /')
    }
  }
}


ELEMENT.prototype.toString = function dogToString() {
  var res = `<`
  res += this.is_end ? '/' : ''
  res += this.name
  if(this.attrs.length > 0){
    res += ' '
  }
  var attrs = []
  for(var attr of this.attrs){
    attrs.push(attr.toString())
  }
  res += attrs.join(' ')
  if(this.no_end){
    res += '/'
  }
  return res + '>'
}

function ATTR(name){
  this.name = name
}

ATTR.prototype.toString = function(){
  var res = this.name
  if(this.hasOwnProperty('value')){
    res += '=' + this.value
  }
  return res
}

function TEXT(value) {
  this.value = value
}

TEXT.prototype.toString = function dogToString() {
  return `${this.value}`
}

var START = 'START'
var END = 'END'


function Name(value){
  this.value = value
}

Name.prototype.toString = function(){
  return this.value
}

function Punctuation(value){
  this.value = value
}

function String(quote, value){
  this.quote = quote
  this.value = value
}

String.prototype.toString = function(){
  return this.quote + this.value + this.quote
}

const punctuations = '!?/'


var xhr = new XMLHttpRequest()
xhr.open('GET', 'k525OMRshort.xml', false)
xhr.onreadystatechange = function(ev){
  if(this.readyState == 4){
    process(this.responseText)
  }
}
xhr.send()

function display(text){
  report.value += text + '\n'
}

function process(src){
  var indent = 0
  for(var token of xml_tokenizer(src)){
    if(indent > 50){
      break
    }
    var head = ' '.repeat(indent)
    if(token instanceof TEXT){
      display(head + ' ' + token.toString())
    }else if(token instanceof ELEMENT){
      if(token.is_end){
        indent--
      }
      head = ' '.repeat(indent)
      display(head + token.toString())
      if(token.is_end || token.no_end || token.is_prolog){
        //
      }else{
        indent++
      }
    }else if(token instanceof DECLARATION){
      display(head + token.toString())
    }else{
      console.log(head + 'token', token, token.toString())
    }
  }
}



function is_id_continue(char){
  return char.match(/\p{L}/u) || "-_".includes(char) || char.match(/\d/)
}

function is_whitespace(s){
  for(let char of s){
    if(! ' \n\r\t'.includes(char)){
      return false
    }
  }
  return true
}

function* xml_tokenizer(src){
  var pos = 0,
      state = 'data',
      start_data = pos,
      element
  while(pos < src.length){
    var char = src[pos]
    if(state == 'data' && char == '<'){
      var data = src.substring(start_data, pos)
      if(! is_whitespace(data)){
        yield new TEXT(data)
      }
      state = 'element'
      tag_state = 'tag_name'
      element = new ELEMENT()
      if(src.substr(pos + 1, 4) == '?xml'){
        // prolog
        element.feed(new Name('?xml'))
        pos += 5
      }else if(src[pos + 1] == '!'){
        if(src.substr(pos + 1, 3) == '!--'){
          console.log('COMMENT')
          var end = src.indexOf('--', pos + 4)
          if(end == -1){
            throw Error('unterminated comment')
          }
          yield new COMMENT(src.substring(pos + 4, ix))
          pos = ix + 1
        }else{
          element = new DECLARATION()
          pos += 2
        }
      }else if(src[pos + 1] == '/'){
        element.is_end = true
        pos += 2
      }else{
        pos++
      }
      continue
    }else if(state == 'element' && char == '>'){
      element.feed(END)
      yield element
      state = 'data'
      pos++
      start_data = pos
      continue
    }
    if(state == 'element'){
      if(punctuations.includes(char)){
        element.feed(new Punctuation(char))
        pos++
      }else if(char == '='){
        element.expect = 'attr_value'
        pos++
      }else if(char=='"' || char == "'"){
        var end = src.indexOf(char, pos + 1)
        element.feed(new String(char, src.substring(pos + 1, end)))
        pos = end + 1
      }else if(char.match(/\p{L}/u)){
        end = pos + 1
        while(end < src.length){
          if(is_id_continue(src[end])){
            end++
          }else{
            break
          }
        }
        element.feed(new Name(src.substring(pos, end)))
        pos = end
      }else if(is_whitespace(char)){
        pos++
      }else{
        console.log('unhandled', char)
        console.log(src.substr(pos, 30))
        alert()
        pos++
      }
    }else{
      pos++
    }
  }
  console.log('finit')
}

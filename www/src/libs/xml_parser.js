var rules = {
document: `[prolog, element, Misc*, <class 'xml_grammar_parser.End'>]`,
Char: `['\\t', '\\n', '\\r', [#x20-#xD7FF], [#xE000-#xFFFD], [#x10000-#x10FFFF]]`,
S: `[tmp_1+]`,
tmp_1: `[' ', '\\t', '\\r', '\\n']`,
Name: `[tmp_2, NameChar*]`,
tmp_2: `[Letter, '_', ':']`,
Names: `[Name, tmp_3*]`,
tmp_3: `[' ', Name]`,
Nmtoken: `[NameChar+]`,
Nmtokens: `[Nmtoken, tmp_4*]`,
tmp_4: `[' ', Nmtoken]`,
EntityValue: `[tmp_7, tmp_8]`,
tmp_5: `[[^%&'], PEReference, Reference]`,
tmp_6: `[[^%&"], PEReference, Reference]`,
tmp_7: `['"', tmp_6*, '"']`,
tmp_8: `["'", tmp_5*, "'"]`,
AttValue: `[tmp_11, tmp_12]`,
tmp_9: `[[^<&'], Reference]`,
tmp_10: `[[^<&"], Reference]`,
tmp_11: `['"', tmp_10*, '"']`,
tmp_12: `["'", tmp_9*, "'"]`,
SystemLiteral: `[tmp_14, tmp_13]`,
tmp_13: `["'", [^'], "'"]`,
tmp_14: `['"', [^"], '"']`,
PubidLiteral: `[tmp_15, tmp_16]`,
tmp_15: `['"', PubidChar*, '"']`,
tmp_16: `["'", PubidCharNoQuote*, "'"]`,
PubidChar: `[' ', '\\r', '\\n', [a-zA-Z0-9], [-'()+,./:=?;!*#@$_%]]`,
PubidCharNoQuote: `[' ', '\\r', '\\n', [a-zA-Z0-9], [-()+,./:=?;!*#@$_%]]`,
Comment: `['<!--', CommentText, '-->']`,
PI: `['<?', PITarget, tmp_17?, '?>']`,
tmp_17: `[S, PIText]`,
CDSect: `[CDStart, CData, CDEnd]`,
CDStart: `['<![CDATA[']`,
CDEnd: `[']]>']`,
prolog: `[XMLDecl?, Misc*, tmp_18?]`,
tmp_18: `[doctypedecl, Misc*]`,
XMLDecl: `['<?xml', VersionInfo, EncodingDecl?, SDDecl?, S?, '?>']`,
VersionInfo: `[S, 'version', Eq, tmp_19]`,
tmp_19: `[tmp_20, tmp_21]`,
tmp_20: `["'", VersionNum, "'"]`,
tmp_21: `['"', VersionNum, '"']`,
Eq: `[S?, '=', S?]`,
VersionNum: `['1.0']`,
Misc: `[Comment, PI, S]`,
doctypedecl: `['<!DOCTYPE', S, Name, tmp_23?, S?, tmp_22?, '>']`,
tmp_22: `['[', intSubset, ']', S?]`,
tmp_23: `[S, ExternalID]`,
DeclSep: `[PEReference, S]`,
intSubset: `[tmp_24*]`,
tmp_24: `[markupdecl, DeclSep]`,
markupdecl: `[elementdecl, AttlistDecl, EntityDecl, NotationDecl, PI, Comment]`,
extSubset: `[TextDecl?, extSubsetDecl]`,
extSubsetDecl: `[tmp_25*]`,
tmp_25: `[markupdecl, conditionalSect, DeclSep]`,
SDDecl: `[S, 'standalone', Eq, tmp_30]`,
tmp_26: `['yes', 'no']`,
tmp_27: `['yes', 'no']`,
tmp_28: `['"', tmp_26, '"']`,
tmp_29: `["'", tmp_27, "'"]`,
tmp_30: `[tmp_29, tmp_28]`,
element: `[EmptyElemTag, tmp_31]`,
tmp_31: `[STag, content, ETag]`,
STag: `['<', Name, tmp_32*, S?, '>']`,
tmp_32: `[S, Attribute]`,
Attribute: `[Name, Eq, AttValue]`,
ETag: `['</', Name, S?, '>']`,
content: `[CharData?, tmp_34*]`,
tmp_33: `[element, Reference, CDSect, PI, Comment]`,
tmp_34: `[tmp_33, CharData?]`,
EmptyElemTag: `['<', Name, tmp_35*, S?, '/>']`,
tmp_35: `[S, Attribute]`,
elementdecl: `['<!ELEMENT', S, Name, S, contentspec, S?, '>']`,
contentspec: `['EMPTY', 'ANY', Mixed, children]`,
children: `[tmp_37, tmp_36?]`,
tmp_36: `['?', '*', '+']`,
tmp_37: `[choice, seq]`,
cp: `[tmp_39, tmp_38?]`,
tmp_38: `['?', '*', '+']`,
tmp_39: `[Name, choice, seq]`,
choice: `['(', S?, cp, tmp_40+, S?, ')']`,
tmp_40: `[S?, '|', S?, cp]`,
seq: `['(', S?, cp, tmp_41*, S?, ')']`,
tmp_41: `[S?, ',', S?, cp]`,
Mixed: `[tmp_43, tmp_44]`,
tmp_42: `[S?, '|', S?, Name]`,
tmp_43: `['(', S?, '#PCDATA', tmp_42*, S?, ')*']`,
tmp_44: `['(', S?, '#PCDATA', S?, ')']`,
AttlistDecl: `['<!ATTLIST', S, Name, AttDef*, S?, '>']`,
AttDef: `[S, Name, S, AttType, S, DefaultDecl]`,
AttType: `[StringType, TokenizedType, EnumeratedType]`,
StringType: `['CDATA']`,
TokenizedType: `['ID', 'IDREF', 'IDREFS', 'ENTITY', 'ENTITIES', 'NMTOKEN', 'NMTOKENS']`,
EnumeratedType: `[NotationType, Enumeration]`,
NotationType: `['NOTATION', S, '(', S?, Name, tmp_45*, S?, ')']`,
tmp_45: `[S?, '|', S?, Name]`,
Enumeration: `['(', S?, Nmtoken, tmp_46*, S?, ')']`,
tmp_46: `[S?, '|', S?, Nmtoken]`,
DefaultDecl: `['#REQUIRED', '#IMPLIED', tmp_48]`,
tmp_47: `['#FIXED', S]`,
tmp_48: `[tmp_47?, AttValue]`,
conditionalSect: `[includeSect, ignoreSect]`,
includeSect: `['<![', S?, 'INCLUDE', S?, '[', extSubsetDecl, ']]>']`,
ignoreSect: `['<![', S?, 'IGNORE', S?, '[', ignoreSectContents*, ']]>']`,
ignoreSectContents: `[Ignore, tmp_49*]`,
tmp_49: `['<![', ignoreSectContents, ']]>', Ignore]`,
CharRef: `[tmp_50, tmp_51]`,
tmp_50: `['&#', [0-9], ';']`,
tmp_51: `['&#x', [0-9a-fA-F], ';']`,
Reference: `[EntityRef, CharRef]`,
EntityRef: `['&', Name, ';']`,
PEReference: `['%', Name, ';']`,
EntityDecl: `[GEDecl, PEDecl]`,
GEDecl: `['<!ENTITY', S, Name, S, EntityDef, S?, '>']`,
PEDecl: `['<!ENTITY', S, '%', S, Name, S, PEDef, S?, '>']`,
EntityDef: `[EntityValue, tmp_52]`,
tmp_52: `[ExternalID, NDataDecl?]`,
PEDef: `[EntityValue, ExternalID]`,
ExternalID: `[tmp_53, tmp_54]`,
tmp_53: `['SYSTEM', S, SystemLiteral]`,
tmp_54: `['PUBLIC', S, PubidLiteral, S, SystemLiteral]`,
NDataDecl: `[S, 'NDATA', S, Name]`,
TextDecl: `['<?xml', VersionInfo?, EncodingDecl, S?, '?>']`,
extParsedEnt: `[TextDecl?, content]`,
EncodingDecl: `[S, 'encoding', Eq, tmp_55]`,
tmp_55: `[tmp_56, tmp_57]`,
tmp_56: `['"', EncName, '"']`,
tmp_57: `["'", EncName, "'"]`,
EncName: `[[A-Za-z], tmp_58*]`,
tmp_58: `[[A-Za-z0-9._], '-']`,
NotationDecl: `['<!NOTATION', S, Name, S, tmp_59, S?, '>']`,
tmp_59: `[ExternalID, PublicID]`,
PublicID: `['PUBLIC', S, PubidLiteral]`,
}
function document_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // prolog
  this.items = ['prolog', 'element', 'Misc*', "<class 'xml_grammar_parser.End'>"]
  this.rules = []
  this.repeats = []
}

document_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // prolog
      if(! this.rules[0]){
        this.rules[0] = new prolog_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // element
      if(! this.rules[1]){
        this.rules[1] = new element_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // Misc*
      if(! this.rules[2]){
        this.rules[2] = new Misc_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 2, 3, rule, char)
    case -1:
    case 3:
      if(char == END){
        return DONE
      }
      return FAIL
  }
  return this
}

document_rule.prototype.reset = function(){
  this.expect = 0
}

function Char_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '\t'
  this.items = ["'\\t'", "'\\n'", "'\\r'", '[#x20-#xD7FF]', '[#xE000-#xFFFD]', '[#x10000-#x10FFFF]']
  this.rules = []
  this.repeats = []
}

Char_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '\t'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, String.fromCharCode(9))
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // '\n'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, String.fromCharCode(10))
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // '\r'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, String.fromCharCode(13))
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 3, rule, char)
    case 3: // [#x20-#xD7FF]
      if(! this.rules[3]){
        this.rules[3] = new CHARSET_rule(this, '#x20-#xD7FF')
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 4, rule, char)
    case 4: // [#xE000-#xFFFD]
      if(! this.rules[4]){
        this.rules[4] = new CHARSET_rule(this, '#xE000-#xFFFD')
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 5, rule, char)
    case 5: // [#x10000-#x10FFFF]
      if(! this.rules[5]){
        this.rules[5] = new CHARSET_rule(this, '#x10000-#x10FFFF')
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Char_rule.prototype.reset = function(){
  this.expect = 0
}

function S_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_1+
  this.items = ['tmp_1+']
  this.rules = []
  this.repeats = []
}

S_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_1+
      if(! this.rules[0]){
        this.rules[0] = new tmp_1_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_plus(this, 0,-1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

S_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_1_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // ' '
  this.items = ["' '", "'\\t'", "'\\r'", "'\\n'"]
  this.rules = []
  this.repeats = []
}

tmp_1_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // ' '
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, String.fromCharCode(32))
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // '\t'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, String.fromCharCode(9))
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // '\r'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, String.fromCharCode(13))
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 3, rule, char)
    case 3: // '\n'
      if(! this.rules[3]){
        this.rules[3] = new LITERAL(this, String.fromCharCode(10))
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_1_rule.prototype.reset = function(){
  this.expect = 0
}

function Name_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_2
  this.items = ['tmp_2', 'NameChar*']
  this.rules = []
  this.repeats = []
}

Name_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_2
      if(! this.rules[0]){
        this.rules[0] = new tmp_2_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // NameChar*
      if(! this.rules[1]){
        this.rules[1] = new NameChar_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Name_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_2_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // Letter
  this.items = ['Letter', "'_'", "':'"]
  this.rules = []
  this.repeats = []
}

tmp_2_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // Letter
      if(! this.rules[0]){
        this.rules[0] = new Letter_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // '_'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, '_')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // ':'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, ':')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_2_rule.prototype.reset = function(){
  this.expect = 0
}

function Names_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // Name
  this.items = ['Name', 'tmp_3*']
  this.rules = []
  this.repeats = []
}

Names_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // Name
      if(! this.rules[0]){
        this.rules[0] = new Name_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_3*
      if(! this.rules[1]){
        this.rules[1] = new tmp_3_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Names_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_3_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // ' '
  this.items = ["' '", 'Name']
  this.rules = []
  this.repeats = []
}

tmp_3_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // ' '
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, String.fromCharCode(32))
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Name
      if(! this.rules[1]){
        this.rules[1] = new Name_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_3_rule.prototype.reset = function(){
  this.expect = 0
}

function Nmtoken_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // NameChar+
  this.items = ['NameChar+']
  this.rules = []
  this.repeats = []
}

Nmtoken_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // NameChar+
      if(! this.rules[0]){
        this.rules[0] = new NameChar_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_plus(this, 0,-1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Nmtoken_rule.prototype.reset = function(){
  this.expect = 0
}

function Nmtokens_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // Nmtoken
  this.items = ['Nmtoken', 'tmp_4*']
  this.rules = []
  this.repeats = []
}

Nmtokens_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // Nmtoken
      if(! this.rules[0]){
        this.rules[0] = new Nmtoken_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_4*
      if(! this.rules[1]){
        this.rules[1] = new tmp_4_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Nmtokens_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_4_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // ' '
  this.items = ["' '", 'Nmtoken']
  this.rules = []
  this.repeats = []
}

tmp_4_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // ' '
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, String.fromCharCode(32))
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Nmtoken
      if(! this.rules[1]){
        this.rules[1] = new Nmtoken_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_4_rule.prototype.reset = function(){
  this.expect = 0
}

function EntityValue_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_7
  this.items = ['tmp_7', 'tmp_8']
  this.rules = []
  this.repeats = []
}

EntityValue_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_7
      if(! this.rules[0]){
        this.rules[0] = new tmp_7_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_8
      if(! this.rules[1]){
        this.rules[1] = new tmp_8_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

EntityValue_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_5_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // [^%&']
  this.items = ["[^%&']", 'PEReference', 'Reference']
  this.rules = []
  this.repeats = []
}

tmp_5_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // [^%&']
      if(! this.rules[0]){
        this.rules[0] = new CHARSET_rule(this, '^%&\'')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // PEReference
      if(! this.rules[1]){
        this.rules[1] = new PEReference_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // Reference
      if(! this.rules[2]){
        this.rules[2] = new Reference_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_5_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_6_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // [^%&"]
  this.items = ['[^%&"]', 'PEReference', 'Reference']
  this.rules = []
  this.repeats = []
}

tmp_6_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // [^%&"]
      if(! this.rules[0]){
        this.rules[0] = new CHARSET_rule(this, '^%&"')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // PEReference
      if(! this.rules[1]){
        this.rules[1] = new PEReference_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // Reference
      if(! this.rules[2]){
        this.rules[2] = new Reference_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_6_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_7_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '"'
  this.items = ['\'"\'', 'tmp_6*', '\'"\'']
  this.rules = []
  this.repeats = []
}

tmp_7_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '"'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '"')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_6*
      if(! this.rules[1]){
        this.rules[1] = new tmp_6_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, 2, rule, char)
    case 2: // '"'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '"')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_7_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_8_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // "'"
  this.items = ['"\'"', 'tmp_5*', '"\'"']
  this.rules = []
  this.repeats = []
}

tmp_8_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // "'"
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '\'')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_5*
      if(! this.rules[1]){
        this.rules[1] = new tmp_5_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, 2, rule, char)
    case 2: // "'"
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '\'')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_8_rule.prototype.reset = function(){
  this.expect = 0
}

function AttValue_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_11
  this.items = ['tmp_11', 'tmp_12']
  this.rules = []
  this.repeats = []
}

AttValue_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_11
      if(! this.rules[0]){
        this.rules[0] = new tmp_11_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_12
      if(! this.rules[1]){
        this.rules[1] = new tmp_12_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

AttValue_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_9_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // [^<&']
  this.items = ["[^<&']", 'Reference']
  this.rules = []
  this.repeats = []
}

tmp_9_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // [^<&']
      if(! this.rules[0]){
        this.rules[0] = new CHARSET_rule(this, '^<&\'')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // Reference
      if(! this.rules[1]){
        this.rules[1] = new Reference_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_9_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_10_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // [^<&"]
  this.items = ['[^<&"]', 'Reference']
  this.rules = []
  this.repeats = []
}

tmp_10_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // [^<&"]
      if(! this.rules[0]){
        this.rules[0] = new CHARSET_rule(this, '^<&"')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // Reference
      if(! this.rules[1]){
        this.rules[1] = new Reference_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_10_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_11_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '"'
  this.items = ['\'"\'', 'tmp_10*', '\'"\'']
  this.rules = []
  this.repeats = []
}

tmp_11_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '"'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '"')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_10*
      if(! this.rules[1]){
        this.rules[1] = new tmp_10_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, 2, rule, char)
    case 2: // '"'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '"')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_11_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_12_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // "'"
  this.items = ['"\'"', 'tmp_9*', '"\'"']
  this.rules = []
  this.repeats = []
}

tmp_12_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // "'"
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '\'')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_9*
      if(! this.rules[1]){
        this.rules[1] = new tmp_9_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, 2, rule, char)
    case 2: // "'"
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '\'')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_12_rule.prototype.reset = function(){
  this.expect = 0
}

function SystemLiteral_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_14
  this.items = ['tmp_14', 'tmp_13']
  this.rules = []
  this.repeats = []
}

SystemLiteral_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_14
      if(! this.rules[0]){
        this.rules[0] = new tmp_14_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_13
      if(! this.rules[1]){
        this.rules[1] = new tmp_13_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

SystemLiteral_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_13_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // "'"
  this.items = ['"\'"', "[^']", '"\'"']
  this.rules = []
  this.repeats = []
}

tmp_13_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // "'"
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '\'')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // [^']
      if(! this.rules[1]){
        this.rules[1] = new CHARSET_rule(this, '^\'')
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, 2, rule, char)
    case 2: // "'"
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '\'')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_13_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_14_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '"'
  this.items = ['\'"\'', '[^"]', '\'"\'']
  this.rules = []
  this.repeats = []
}

tmp_14_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '"'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '"')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // [^"]
      if(! this.rules[1]){
        this.rules[1] = new CHARSET_rule(this, '^"')
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, 2, rule, char)
    case 2: // '"'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '"')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_14_rule.prototype.reset = function(){
  this.expect = 0
}

function PubidLiteral_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_15
  this.items = ['tmp_15', 'tmp_16']
  this.rules = []
  this.repeats = []
}

PubidLiteral_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_15
      if(! this.rules[0]){
        this.rules[0] = new tmp_15_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_16
      if(! this.rules[1]){
        this.rules[1] = new tmp_16_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

PubidLiteral_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_15_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '"'
  this.items = ['\'"\'', 'PubidChar*', '\'"\'']
  this.rules = []
  this.repeats = []
}

tmp_15_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '"'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '"')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // PubidChar*
      if(! this.rules[1]){
        this.rules[1] = new PubidChar_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, 2, rule, char)
    case 2: // '"'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '"')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_15_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_16_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // "'"
  this.items = ['"\'"', 'PubidCharNoQuote*', '"\'"']
  this.rules = []
  this.repeats = []
}

tmp_16_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // "'"
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '\'')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // PubidCharNoQuote*
      if(! this.rules[1]){
        this.rules[1] = new PubidCharNoQuote_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, 2, rule, char)
    case 2: // "'"
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '\'')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_16_rule.prototype.reset = function(){
  this.expect = 0
}

function PubidChar_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // ' '
  this.items = ["' '", "'\\r'", "'\\n'", '[a-zA-Z0-9]', "[-'()+,./:=?;!*#@$_%]"]
  this.rules = []
  this.repeats = []
}

PubidChar_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // ' '
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, String.fromCharCode(32))
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // '\r'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, String.fromCharCode(13))
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // '\n'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, String.fromCharCode(10))
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 3, rule, char)
    case 3: // [a-zA-Z0-9]
      if(! this.rules[3]){
        this.rules[3] = new CHARSET_rule(this, 'a-zA-Z0-9')
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 4, rule, char)
    case 4: // [-'()+,./:=?;!*#@$_%]
      if(! this.rules[4]){
        this.rules[4] = new CHARSET_rule(this, '-\'()+,./:=?;!*#@$_%')
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

PubidChar_rule.prototype.reset = function(){
  this.expect = 0
}

function PubidCharNoQuote_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // ' '
  this.items = ["' '", "'\\r'", "'\\n'", '[a-zA-Z0-9]', '[-()+,./:=?;!*#@$_%]']
  this.rules = []
  this.repeats = []
}

PubidCharNoQuote_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // ' '
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, String.fromCharCode(32))
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // '\r'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, String.fromCharCode(13))
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // '\n'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, String.fromCharCode(10))
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 3, rule, char)
    case 3: // [a-zA-Z0-9]
      if(! this.rules[3]){
        this.rules[3] = new CHARSET_rule(this, 'a-zA-Z0-9')
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 4, rule, char)
    case 4: // [-()+,./:=?;!*#@$_%]
      if(! this.rules[4]){
        this.rules[4] = new CHARSET_rule(this, '-()+,./:=?;!*#@$_%')
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

PubidCharNoQuote_rule.prototype.reset = function(){
  this.expect = 0
}

function Comment_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<!--'
  this.items = ["'<!--'", 'CommentText', "'-->'"]
  this.rules = []
  this.repeats = []
}

Comment_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<!--'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<!--')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // CommentText
      if(! this.rules[1]){
        this.rules[1] = new CommentText_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // '-->'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '-->')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Comment_rule.prototype.reset = function(){
  this.expect = 0
}

function PI_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<?'
  this.items = ["'<?'", 'PITarget', 'tmp_17?', "'?>'"]
  this.rules = []
  this.repeats = []
}

PI_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<?'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<?')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // PITarget
      if(! this.rules[1]){
        this.rules[1] = new PITarget_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // tmp_17?
      if(! this.rules[2]){
        this.rules[2] = new tmp_17_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 2, 3, rule, char)
    case 3: // '?>'
      if(! this.rules[3]){
        this.rules[3] = new LITERAL(this, '?>')
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

PI_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_17_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', 'PIText']
  this.rules = []
  this.repeats = []
}

tmp_17_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // PIText
      if(! this.rules[1]){
        this.rules[1] = new PIText_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_17_rule.prototype.reset = function(){
  this.expect = 0
}

function CDSect_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // CDStart
  this.items = ['CDStart', 'CData', 'CDEnd']
  this.rules = []
  this.repeats = []
}

CDSect_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // CDStart
      if(! this.rules[0]){
        this.rules[0] = new CDStart_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // CData
      if(! this.rules[1]){
        this.rules[1] = new CData_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // CDEnd
      if(! this.rules[2]){
        this.rules[2] = new CDEnd_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

CDSect_rule.prototype.reset = function(){
  this.expect = 0
}

function CDStart_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<![CDATA['
  this.items = ["'<![CDATA['"]
  this.rules = []
  this.repeats = []
}

CDStart_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<![CDATA['
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<![CDATA[')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

CDStart_rule.prototype.reset = function(){
  this.expect = 0
}

function CDEnd_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // ']]>'
  this.items = ["']]>'"]
  this.rules = []
  this.repeats = []
}

CDEnd_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // ']]>'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, ']]>')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

CDEnd_rule.prototype.reset = function(){
  this.expect = 0
}

function prolog_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // XMLDecl?
  this.items = ['XMLDecl?', 'Misc*', 'tmp_18?']
  this.rules = []
  this.repeats = []
}

prolog_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // XMLDecl?
      if(! this.rules[0]){
        this.rules[0] = new XMLDecl_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 0, 1, rule, char)
    case 1: // Misc*
      if(! this.rules[1]){
        this.rules[1] = new Misc_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, 2, rule, char)
    case 2: // tmp_18?
      if(! this.rules[2]){
        this.rules[2] = new tmp_18_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 2, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

prolog_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_18_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // doctypedecl
  this.items = ['doctypedecl', 'Misc*']
  this.rules = []
  this.repeats = []
}

tmp_18_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // doctypedecl
      if(! this.rules[0]){
        this.rules[0] = new doctypedecl_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Misc*
      if(! this.rules[1]){
        this.rules[1] = new Misc_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_18_rule.prototype.reset = function(){
  this.expect = 0
}

function XMLDecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<?xml'
  this.items = ["'<?xml'", 'VersionInfo', 'EncodingDecl?', 'SDDecl?', 'S?', "'?>'"]
  this.rules = []
  this.repeats = []
}

XMLDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<?xml'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<?xml')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // VersionInfo
      if(! this.rules[1]){
        this.rules[1] = new VersionInfo_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // EncodingDecl?
      if(! this.rules[2]){
        this.rules[2] = new EncodingDecl_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 2, 3, rule, char)
    case 3: // SDDecl?
      if(! this.rules[3]){
        this.rules[3] = new SDDecl_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 3, 4, rule, char)
    case 4: // S?
      if(! this.rules[4]){
        this.rules[4] = new S_rule(this)
        this.repeats[4] = 0
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 4, 5, rule, char)
    case 5: // '?>'
      if(! this.rules[5]){
        this.rules[5] = new LITERAL(this, '?>')
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

XMLDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function VersionInfo_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', "'version'", 'Eq', 'tmp_19']
  this.rules = []
  this.repeats = []
}

VersionInfo_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // 'version'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, 'version')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // Eq
      if(! this.rules[2]){
        this.rules[2] = new Eq_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // tmp_19
      if(! this.rules[3]){
        this.rules[3] = new tmp_19_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

VersionInfo_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_19_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_20
  this.items = ['tmp_20', 'tmp_21']
  this.rules = []
  this.repeats = []
}

tmp_19_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_20
      if(! this.rules[0]){
        this.rules[0] = new tmp_20_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_21
      if(! this.rules[1]){
        this.rules[1] = new tmp_21_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_19_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_20_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // "'"
  this.items = ['"\'"', 'VersionNum', '"\'"']
  this.rules = []
  this.repeats = []
}

tmp_20_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // "'"
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '\'')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // VersionNum
      if(! this.rules[1]){
        this.rules[1] = new VersionNum_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // "'"
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '\'')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_20_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_21_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '"'
  this.items = ['\'"\'', 'VersionNum', '\'"\'']
  this.rules = []
  this.repeats = []
}

tmp_21_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '"'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '"')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // VersionNum
      if(! this.rules[1]){
        this.rules[1] = new VersionNum_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // '"'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '"')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_21_rule.prototype.reset = function(){
  this.expect = 0
}

function Eq_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S?
  this.items = ['S?', "'='", 'S?']
  this.rules = []
  this.repeats = []
}

Eq_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S?
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 0, 1, rule, char)
    case 1: // '='
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, '=')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // S?
      if(! this.rules[2]){
        this.rules[2] = new S_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 2, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Eq_rule.prototype.reset = function(){
  this.expect = 0
}

function VersionNum_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '1.0'
  this.items = ["'1.0'"]
  this.rules = []
  this.repeats = []
}

VersionNum_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '1.0'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '1.0')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

VersionNum_rule.prototype.reset = function(){
  this.expect = 0
}

function Misc_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // Comment
  this.items = ['Comment', 'PI', 'S']
  this.rules = []
  this.repeats = []
}

Misc_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // Comment
      if(! this.rules[0]){
        this.rules[0] = new Comment_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // PI
      if(! this.rules[1]){
        this.rules[1] = new PI_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // S
      if(! this.rules[2]){
        this.rules[2] = new S_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Misc_rule.prototype.reset = function(){
  this.expect = 0
}

function doctypedecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<!DOCTYPE'
  this.items = ["'<!DOCTYPE'", 'S', 'Name', 'tmp_23?', 'S?', 'tmp_22?', "'>'"]
  this.rules = []
  this.repeats = []
}

doctypedecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<!DOCTYPE'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<!DOCTYPE')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // Name
      if(! this.rules[2]){
        this.rules[2] = new Name_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // tmp_23?
      if(! this.rules[3]){
        this.rules[3] = new tmp_23_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 3, 4, rule, char)
    case 4: // S?
      if(! this.rules[4]){
        this.rules[4] = new S_rule(this)
        this.repeats[4] = 0
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 4, 5, rule, char)
    case 5: // tmp_22?
      if(! this.rules[5]){
        this.rules[5] = new tmp_22_rule(this)
        this.repeats[5] = 0
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 5, 6, rule, char)
    case 6: // '>'
      if(! this.rules[6]){
        this.rules[6] = new LITERAL(this, '>')
      }
      rule = this.rules[6]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

doctypedecl_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_22_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '['
  this.items = ["'['", 'intSubset', "']'", 'S?']
  this.rules = []
  this.repeats = []
}

tmp_22_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '['
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '[')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // intSubset
      if(! this.rules[1]){
        this.rules[1] = new intSubset_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // ']'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, ']')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // S?
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 3, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_22_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_23_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', 'ExternalID']
  this.rules = []
  this.repeats = []
}

tmp_23_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // ExternalID
      if(! this.rules[1]){
        this.rules[1] = new ExternalID_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_23_rule.prototype.reset = function(){
  this.expect = 0
}

function DeclSep_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // PEReference
  this.items = ['PEReference', 'S']
  this.rules = []
  this.repeats = []
}

DeclSep_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // PEReference
      if(! this.rules[0]){
        this.rules[0] = new PEReference_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

DeclSep_rule.prototype.reset = function(){
  this.expect = 0
}

function intSubset_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_24*
  this.items = ['tmp_24*']
  this.rules = []
  this.repeats = []
}

intSubset_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_24*
      if(! this.rules[0]){
        this.rules[0] = new tmp_24_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 0, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

intSubset_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_24_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // markupdecl
  this.items = ['markupdecl', 'DeclSep']
  this.rules = []
  this.repeats = []
}

tmp_24_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // markupdecl
      if(! this.rules[0]){
        this.rules[0] = new markupdecl_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // DeclSep
      if(! this.rules[1]){
        this.rules[1] = new DeclSep_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_24_rule.prototype.reset = function(){
  this.expect = 0
}

function markupdecl_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // elementdecl
  this.items = ['elementdecl', 'AttlistDecl', 'EntityDecl', 'NotationDecl', 'PI', 'Comment']
  this.rules = []
  this.repeats = []
}

markupdecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // elementdecl
      if(! this.rules[0]){
        this.rules[0] = new elementdecl_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // AttlistDecl
      if(! this.rules[1]){
        this.rules[1] = new AttlistDecl_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // EntityDecl
      if(! this.rules[2]){
        this.rules[2] = new EntityDecl_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 3, rule, char)
    case 3: // NotationDecl
      if(! this.rules[3]){
        this.rules[3] = new NotationDecl_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 4, rule, char)
    case 4: // PI
      if(! this.rules[4]){
        this.rules[4] = new PI_rule(this)
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 5, rule, char)
    case 5: // Comment
      if(! this.rules[5]){
        this.rules[5] = new Comment_rule(this)
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

markupdecl_rule.prototype.reset = function(){
  this.expect = 0
}

function extSubset_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // TextDecl?
  this.items = ['TextDecl?', 'extSubsetDecl']
  this.rules = []
  this.repeats = []
}

extSubset_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // TextDecl?
      if(! this.rules[0]){
        this.rules[0] = new TextDecl_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 0, 1, rule, char)
    case 1: // extSubsetDecl
      if(! this.rules[1]){
        this.rules[1] = new extSubsetDecl_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

extSubset_rule.prototype.reset = function(){
  this.expect = 0
}

function extSubsetDecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_25*
  this.items = ['tmp_25*']
  this.rules = []
  this.repeats = []
}

extSubsetDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_25*
      if(! this.rules[0]){
        this.rules[0] = new tmp_25_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 0, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

extSubsetDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_25_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // markupdecl
  this.items = ['markupdecl', 'conditionalSect', 'DeclSep']
  this.rules = []
  this.repeats = []
}

tmp_25_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // markupdecl
      if(! this.rules[0]){
        this.rules[0] = new markupdecl_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // conditionalSect
      if(! this.rules[1]){
        this.rules[1] = new conditionalSect_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // DeclSep
      if(! this.rules[2]){
        this.rules[2] = new DeclSep_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_25_rule.prototype.reset = function(){
  this.expect = 0
}

function SDDecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', "'standalone'", 'Eq', 'tmp_30']
  this.rules = []
  this.repeats = []
}

SDDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // 'standalone'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, 'standalone')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // Eq
      if(! this.rules[2]){
        this.rules[2] = new Eq_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // tmp_30
      if(! this.rules[3]){
        this.rules[3] = new tmp_30_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

SDDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_26_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // 'yes'
  this.items = ["'yes'", "'no'"]
  this.rules = []
  this.repeats = []
}

tmp_26_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // 'yes'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, 'yes')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // 'no'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, 'no')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_26_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_27_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // 'yes'
  this.items = ["'yes'", "'no'"]
  this.rules = []
  this.repeats = []
}

tmp_27_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // 'yes'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, 'yes')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // 'no'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, 'no')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_27_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_28_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '"'
  this.items = ['\'"\'', 'tmp_26', '\'"\'']
  this.rules = []
  this.repeats = []
}

tmp_28_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '"'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '"')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_26
      if(! this.rules[1]){
        this.rules[1] = new tmp_26_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // '"'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '"')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_28_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_29_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // "'"
  this.items = ['"\'"', 'tmp_27', '"\'"']
  this.rules = []
  this.repeats = []
}

tmp_29_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // "'"
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '\'')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_27
      if(! this.rules[1]){
        this.rules[1] = new tmp_27_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // "'"
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '\'')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_29_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_30_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_29
  this.items = ['tmp_29', 'tmp_28']
  this.rules = []
  this.repeats = []
}

tmp_30_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_29
      if(! this.rules[0]){
        this.rules[0] = new tmp_29_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_28
      if(! this.rules[1]){
        this.rules[1] = new tmp_28_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_30_rule.prototype.reset = function(){
  this.expect = 0
}

function element_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // EmptyElemTag
  this.items = ['EmptyElemTag', 'tmp_31']
  this.rules = []
  this.repeats = []
}

element_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // EmptyElemTag
      if(! this.rules[0]){
        this.rules[0] = new EmptyElemTag_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_31
      if(! this.rules[1]){
        this.rules[1] = new tmp_31_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

element_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_31_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // STag
  this.items = ['STag', 'content', 'ETag']
  this.rules = []
  this.repeats = []
}

tmp_31_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // STag
      if(! this.rules[0]){
        this.rules[0] = new STag_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // content
      if(! this.rules[1]){
        this.rules[1] = new content_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // ETag
      if(! this.rules[2]){
        this.rules[2] = new ETag_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_31_rule.prototype.reset = function(){
  this.expect = 0
}

function STag_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<'
  this.items = ["'<'", 'Name', 'tmp_32*', 'S?', "'>'"]
  this.rules = []
  this.repeats = []
}

STag_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Name
      if(! this.rules[1]){
        this.rules[1] = new Name_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // tmp_32*
      if(! this.rules[2]){
        this.rules[2] = new tmp_32_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 2, 3, rule, char)
    case 3: // S?
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 3, 4, rule, char)
    case 4: // '>'
      if(! this.rules[4]){
        this.rules[4] = new LITERAL(this, '>')
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

STag_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_32_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', 'Attribute']
  this.rules = []
  this.repeats = []
}

tmp_32_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Attribute
      if(! this.rules[1]){
        this.rules[1] = new Attribute_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_32_rule.prototype.reset = function(){
  this.expect = 0
}

function Attribute_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // Name
  this.items = ['Name', 'Eq', 'AttValue']
  this.rules = []
  this.repeats = []
}

Attribute_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // Name
      if(! this.rules[0]){
        this.rules[0] = new Name_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Eq
      if(! this.rules[1]){
        this.rules[1] = new Eq_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // AttValue
      if(! this.rules[2]){
        this.rules[2] = new AttValue_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Attribute_rule.prototype.reset = function(){
  this.expect = 0
}

function ETag_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '</'
  this.items = ["'</'", 'Name', 'S?', "'>'"]
  this.rules = []
  this.repeats = []
}

ETag_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '</'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '</')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Name
      if(! this.rules[1]){
        this.rules[1] = new Name_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // S?
      if(! this.rules[2]){
        this.rules[2] = new S_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 2, 3, rule, char)
    case 3: // '>'
      if(! this.rules[3]){
        this.rules[3] = new LITERAL(this, '>')
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

ETag_rule.prototype.reset = function(){
  this.expect = 0
}

function content_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // CharData?
  this.items = ['CharData?', 'tmp_34*']
  this.rules = []
  this.repeats = []
}

content_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // CharData?
      if(! this.rules[0]){
        this.rules[0] = new CharData_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 0, 1, rule, char)
    case 1: // tmp_34*
      if(! this.rules[1]){
        this.rules[1] = new tmp_34_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

content_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_33_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // element
  this.items = ['element', 'Reference', 'CDSect', 'PI', 'Comment']
  this.rules = []
  this.repeats = []
}

tmp_33_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // element
      if(! this.rules[0]){
        this.rules[0] = new element_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // Reference
      if(! this.rules[1]){
        this.rules[1] = new Reference_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // CDSect
      if(! this.rules[2]){
        this.rules[2] = new CDSect_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 3, rule, char)
    case 3: // PI
      if(! this.rules[3]){
        this.rules[3] = new PI_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 4, rule, char)
    case 4: // Comment
      if(! this.rules[4]){
        this.rules[4] = new Comment_rule(this)
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_33_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_34_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_33
  this.items = ['tmp_33', 'CharData?']
  this.rules = []
  this.repeats = []
}

tmp_34_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_33
      if(! this.rules[0]){
        this.rules[0] = new tmp_33_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // CharData?
      if(! this.rules[1]){
        this.rules[1] = new CharData_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_34_rule.prototype.reset = function(){
  this.expect = 0
}

function EmptyElemTag_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<'
  this.items = ["'<'", 'Name', 'tmp_35*', 'S?', "'/>'"]
  this.rules = []
  this.repeats = []
}

EmptyElemTag_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Name
      if(! this.rules[1]){
        this.rules[1] = new Name_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // tmp_35*
      if(! this.rules[2]){
        this.rules[2] = new tmp_35_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 2, 3, rule, char)
    case 3: // S?
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 3, 4, rule, char)
    case 4: // '/>'
      if(! this.rules[4]){
        this.rules[4] = new LITERAL(this, '/>')
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

EmptyElemTag_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_35_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', 'Attribute']
  this.rules = []
  this.repeats = []
}

tmp_35_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Attribute
      if(! this.rules[1]){
        this.rules[1] = new Attribute_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_35_rule.prototype.reset = function(){
  this.expect = 0
}

function elementdecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<!ELEMENT'
  this.items = ["'<!ELEMENT'", 'S', 'Name', 'S', 'contentspec', 'S?', "'>'"]
  this.rules = []
  this.repeats = []
}

elementdecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<!ELEMENT'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<!ELEMENT')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // Name
      if(! this.rules[2]){
        this.rules[2] = new Name_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // S
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 4, rule, char)
    case 4: // contentspec
      if(! this.rules[4]){
        this.rules[4] = new contentspec_rule(this)
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 5, rule, char)
    case 5: // S?
      if(! this.rules[5]){
        this.rules[5] = new S_rule(this)
        this.repeats[5] = 0
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 5, 6, rule, char)
    case 6: // '>'
      if(! this.rules[6]){
        this.rules[6] = new LITERAL(this, '>')
      }
      rule = this.rules[6]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

elementdecl_rule.prototype.reset = function(){
  this.expect = 0
}

function contentspec_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // 'EMPTY'
  this.items = ["'EMPTY'", "'ANY'", 'Mixed', 'children']
  this.rules = []
  this.repeats = []
}

contentspec_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // 'EMPTY'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, 'EMPTY')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // 'ANY'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, 'ANY')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // Mixed
      if(! this.rules[2]){
        this.rules[2] = new Mixed_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 3, rule, char)
    case 3: // children
      if(! this.rules[3]){
        this.rules[3] = new children_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

contentspec_rule.prototype.reset = function(){
  this.expect = 0
}

function children_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_37
  this.items = ['tmp_37', 'tmp_36?']
  this.rules = []
  this.repeats = []
}

children_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_37
      if(! this.rules[0]){
        this.rules[0] = new tmp_37_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_36?
      if(! this.rules[1]){
        this.rules[1] = new tmp_36_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

children_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_36_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '?'
  this.items = ["'?'", "'*'", "'+'"]
  this.rules = []
  this.repeats = []
}

tmp_36_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '?'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '?')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // '*'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, '*')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // '+'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '+')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_36_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_37_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // choice
  this.items = ['choice', 'seq']
  this.rules = []
  this.repeats = []
}

tmp_37_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // choice
      if(! this.rules[0]){
        this.rules[0] = new choice_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // seq
      if(! this.rules[1]){
        this.rules[1] = new seq_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_37_rule.prototype.reset = function(){
  this.expect = 0
}

function cp_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_39
  this.items = ['tmp_39', 'tmp_38?']
  this.rules = []
  this.repeats = []
}

cp_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_39
      if(! this.rules[0]){
        this.rules[0] = new tmp_39_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_38?
      if(! this.rules[1]){
        this.rules[1] = new tmp_38_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

cp_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_38_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '?'
  this.items = ["'?'", "'*'", "'+'"]
  this.rules = []
  this.repeats = []
}

tmp_38_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '?'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '?')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // '*'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, '*')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // '+'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '+')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_38_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_39_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // Name
  this.items = ['Name', 'choice', 'seq']
  this.rules = []
  this.repeats = []
}

tmp_39_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // Name
      if(! this.rules[0]){
        this.rules[0] = new Name_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // choice
      if(! this.rules[1]){
        this.rules[1] = new choice_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // seq
      if(! this.rules[2]){
        this.rules[2] = new seq_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_39_rule.prototype.reset = function(){
  this.expect = 0
}

function choice_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '('
  this.items = ["'('", 'S?', 'cp', 'tmp_40+', 'S?', "')'"]
  this.rules = []
  this.repeats = []
}

choice_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '('
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '(')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S?
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, 2, rule, char)
    case 2: // cp
      if(! this.rules[2]){
        this.rules[2] = new cp_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // tmp_40+
      if(! this.rules[3]){
        this.rules[3] = new tmp_40_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_plus(this, 3,4, rule, char)
    case 4: // S?
      if(! this.rules[4]){
        this.rules[4] = new S_rule(this)
        this.repeats[4] = 0
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 4, 5, rule, char)
    case 5: // ')'
      if(! this.rules[5]){
        this.rules[5] = new LITERAL(this, ')')
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

choice_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_40_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S?
  this.items = ['S?', "'|'", 'S?', 'cp']
  this.rules = []
  this.repeats = []
}

tmp_40_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S?
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 0, 1, rule, char)
    case 1: // '|'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, '|')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // S?
      if(! this.rules[2]){
        this.rules[2] = new S_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 2, 3, rule, char)
    case 3: // cp
      if(! this.rules[3]){
        this.rules[3] = new cp_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_40_rule.prototype.reset = function(){
  this.expect = 0
}

function seq_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '('
  this.items = ["'('", 'S?', 'cp', 'tmp_41*', 'S?', "')'"]
  this.rules = []
  this.repeats = []
}

seq_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '('
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '(')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S?
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, 2, rule, char)
    case 2: // cp
      if(! this.rules[2]){
        this.rules[2] = new cp_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // tmp_41*
      if(! this.rules[3]){
        this.rules[3] = new tmp_41_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 3, 4, rule, char)
    case 4: // S?
      if(! this.rules[4]){
        this.rules[4] = new S_rule(this)
        this.repeats[4] = 0
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 4, 5, rule, char)
    case 5: // ')'
      if(! this.rules[5]){
        this.rules[5] = new LITERAL(this, ')')
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

seq_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_41_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S?
  this.items = ['S?', "','", 'S?', 'cp']
  this.rules = []
  this.repeats = []
}

tmp_41_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S?
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 0, 1, rule, char)
    case 1: // ','
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, ',')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // S?
      if(! this.rules[2]){
        this.rules[2] = new S_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 2, 3, rule, char)
    case 3: // cp
      if(! this.rules[3]){
        this.rules[3] = new cp_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_41_rule.prototype.reset = function(){
  this.expect = 0
}

function Mixed_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_43
  this.items = ['tmp_43', 'tmp_44']
  this.rules = []
  this.repeats = []
}

Mixed_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_43
      if(! this.rules[0]){
        this.rules[0] = new tmp_43_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_44
      if(! this.rules[1]){
        this.rules[1] = new tmp_44_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Mixed_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_42_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S?
  this.items = ['S?', "'|'", 'S?', 'Name']
  this.rules = []
  this.repeats = []
}

tmp_42_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S?
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 0, 1, rule, char)
    case 1: // '|'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, '|')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // S?
      if(! this.rules[2]){
        this.rules[2] = new S_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 2, 3, rule, char)
    case 3: // Name
      if(! this.rules[3]){
        this.rules[3] = new Name_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_42_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_43_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '('
  this.items = ["'('", 'S?', "'#PCDATA'", 'tmp_42*', 'S?', "')*'"]
  this.rules = []
  this.repeats = []
}

tmp_43_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '('
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '(')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S?
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, 2, rule, char)
    case 2: // '#PCDATA'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '#PCDATA')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // tmp_42*
      if(! this.rules[3]){
        this.rules[3] = new tmp_42_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 3, 4, rule, char)
    case 4: // S?
      if(! this.rules[4]){
        this.rules[4] = new S_rule(this)
        this.repeats[4] = 0
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 4, 5, rule, char)
    case 5: // ')*'
      if(! this.rules[5]){
        this.rules[5] = new LITERAL(this, ')*')
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_43_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_44_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '('
  this.items = ["'('", 'S?', "'#PCDATA'", 'S?', "')'"]
  this.rules = []
  this.repeats = []
}

tmp_44_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '('
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '(')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S?
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, 2, rule, char)
    case 2: // '#PCDATA'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '#PCDATA')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // S?
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 3, 4, rule, char)
    case 4: // ')'
      if(! this.rules[4]){
        this.rules[4] = new LITERAL(this, ')')
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_44_rule.prototype.reset = function(){
  this.expect = 0
}

function AttlistDecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<!ATTLIST'
  this.items = ["'<!ATTLIST'", 'S', 'Name', 'AttDef*', 'S?', "'>'"]
  this.rules = []
  this.repeats = []
}

AttlistDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<!ATTLIST'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<!ATTLIST')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // Name
      if(! this.rules[2]){
        this.rules[2] = new Name_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // AttDef*
      if(! this.rules[3]){
        this.rules[3] = new AttDef_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 3, 4, rule, char)
    case 4: // S?
      if(! this.rules[4]){
        this.rules[4] = new S_rule(this)
        this.repeats[4] = 0
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 4, 5, rule, char)
    case 5: // '>'
      if(! this.rules[5]){
        this.rules[5] = new LITERAL(this, '>')
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

AttlistDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function AttDef_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', 'Name', 'S', 'AttType', 'S', 'DefaultDecl']
  this.rules = []
  this.repeats = []
}

AttDef_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Name
      if(! this.rules[1]){
        this.rules[1] = new Name_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // S
      if(! this.rules[2]){
        this.rules[2] = new S_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // AttType
      if(! this.rules[3]){
        this.rules[3] = new AttType_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 4, rule, char)
    case 4: // S
      if(! this.rules[4]){
        this.rules[4] = new S_rule(this)
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 5, rule, char)
    case 5: // DefaultDecl
      if(! this.rules[5]){
        this.rules[5] = new DefaultDecl_rule(this)
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

AttDef_rule.prototype.reset = function(){
  this.expect = 0
}

function AttType_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // StringType
  this.items = ['StringType', 'TokenizedType', 'EnumeratedType']
  this.rules = []
  this.repeats = []
}

AttType_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // StringType
      if(! this.rules[0]){
        this.rules[0] = new StringType_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // TokenizedType
      if(! this.rules[1]){
        this.rules[1] = new TokenizedType_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // EnumeratedType
      if(! this.rules[2]){
        this.rules[2] = new EnumeratedType_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

AttType_rule.prototype.reset = function(){
  this.expect = 0
}

function StringType_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // 'CDATA'
  this.items = ["'CDATA'"]
  this.rules = []
  this.repeats = []
}

StringType_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // 'CDATA'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, 'CDATA')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

StringType_rule.prototype.reset = function(){
  this.expect = 0
}

function TokenizedType_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // 'ID'
  this.items = ["'ID'", "'IDREF'", "'IDREFS'", "'ENTITY'", "'ENTITIES'", "'NMTOKEN'", "'NMTOKENS'"]
  this.rules = []
  this.repeats = []
}

TokenizedType_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // 'ID'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, 'ID')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // 'IDREF'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, 'IDREF')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // 'IDREFS'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, 'IDREFS')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 3, rule, char)
    case 3: // 'ENTITY'
      if(! this.rules[3]){
        this.rules[3] = new LITERAL(this, 'ENTITY')
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 4, rule, char)
    case 4: // 'ENTITIES'
      if(! this.rules[4]){
        this.rules[4] = new LITERAL(this, 'ENTITIES')
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 5, rule, char)
    case 5: // 'NMTOKEN'
      if(! this.rules[5]){
        this.rules[5] = new LITERAL(this, 'NMTOKEN')
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 6, rule, char)
    case 6: // 'NMTOKENS'
      if(! this.rules[6]){
        this.rules[6] = new LITERAL(this, 'NMTOKENS')
      }
      rule = this.rules[6]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

TokenizedType_rule.prototype.reset = function(){
  this.expect = 0
}

function EnumeratedType_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // NotationType
  this.items = ['NotationType', 'Enumeration']
  this.rules = []
  this.repeats = []
}

EnumeratedType_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // NotationType
      if(! this.rules[0]){
        this.rules[0] = new NotationType_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // Enumeration
      if(! this.rules[1]){
        this.rules[1] = new Enumeration_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

EnumeratedType_rule.prototype.reset = function(){
  this.expect = 0
}

function NotationType_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // 'NOTATION'
  this.items = ["'NOTATION'", 'S', "'('", 'S?', 'Name', 'tmp_45*', 'S?', "')'"]
  this.rules = []
  this.repeats = []
}

NotationType_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // 'NOTATION'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, 'NOTATION')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // '('
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '(')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // S?
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 3, 4, rule, char)
    case 4: // Name
      if(! this.rules[4]){
        this.rules[4] = new Name_rule(this)
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 5, rule, char)
    case 5: // tmp_45*
      if(! this.rules[5]){
        this.rules[5] = new tmp_45_rule(this)
        this.repeats[5] = 0
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 5, 6, rule, char)
    case 6: // S?
      if(! this.rules[6]){
        this.rules[6] = new S_rule(this)
        this.repeats[6] = 0
      }
      rule = this.rules[6]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 6, 7, rule, char)
    case 7: // ')'
      if(! this.rules[7]){
        this.rules[7] = new LITERAL(this, ')')
      }
      rule = this.rules[7]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

NotationType_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_45_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S?
  this.items = ['S?', "'|'", 'S?', 'Name']
  this.rules = []
  this.repeats = []
}

tmp_45_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S?
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 0, 1, rule, char)
    case 1: // '|'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, '|')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // S?
      if(! this.rules[2]){
        this.rules[2] = new S_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 2, 3, rule, char)
    case 3: // Name
      if(! this.rules[3]){
        this.rules[3] = new Name_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_45_rule.prototype.reset = function(){
  this.expect = 0
}

function Enumeration_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '('
  this.items = ["'('", 'S?', 'Nmtoken', 'tmp_46*', 'S?', "')'"]
  this.rules = []
  this.repeats = []
}

Enumeration_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '('
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '(')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S?
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, 2, rule, char)
    case 2: // Nmtoken
      if(! this.rules[2]){
        this.rules[2] = new Nmtoken_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // tmp_46*
      if(! this.rules[3]){
        this.rules[3] = new tmp_46_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 3, 4, rule, char)
    case 4: // S?
      if(! this.rules[4]){
        this.rules[4] = new S_rule(this)
        this.repeats[4] = 0
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 4, 5, rule, char)
    case 5: // ')'
      if(! this.rules[5]){
        this.rules[5] = new LITERAL(this, ')')
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Enumeration_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_46_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S?
  this.items = ['S?', "'|'", 'S?', 'Nmtoken']
  this.rules = []
  this.repeats = []
}

tmp_46_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S?
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 0, 1, rule, char)
    case 1: // '|'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, '|')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // S?
      if(! this.rules[2]){
        this.rules[2] = new S_rule(this)
        this.repeats[2] = 0
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 2, 3, rule, char)
    case 3: // Nmtoken
      if(! this.rules[3]){
        this.rules[3] = new Nmtoken_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_46_rule.prototype.reset = function(){
  this.expect = 0
}

function DefaultDecl_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '#REQUIRED'
  this.items = ["'#REQUIRED'", "'#IMPLIED'", 'tmp_48']
  this.rules = []
  this.repeats = []
}

DefaultDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '#REQUIRED'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '#REQUIRED')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // '#IMPLIED'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, '#IMPLIED')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 2, rule, char)
    case 2: // tmp_48
      if(! this.rules[2]){
        this.rules[2] = new tmp_48_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

DefaultDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_47_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '#FIXED'
  this.items = ["'#FIXED'", 'S']
  this.rules = []
  this.repeats = []
}

tmp_47_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '#FIXED'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '#FIXED')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_47_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_48_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_47?
  this.items = ['tmp_47?', 'AttValue']
  this.rules = []
  this.repeats = []
}

tmp_48_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_47?
      if(! this.rules[0]){
        this.rules[0] = new tmp_47_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 0, 1, rule, char)
    case 1: // AttValue
      if(! this.rules[1]){
        this.rules[1] = new AttValue_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_48_rule.prototype.reset = function(){
  this.expect = 0
}

function conditionalSect_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // includeSect
  this.items = ['includeSect', 'ignoreSect']
  this.rules = []
  this.repeats = []
}

conditionalSect_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // includeSect
      if(! this.rules[0]){
        this.rules[0] = new includeSect_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // ignoreSect
      if(! this.rules[1]){
        this.rules[1] = new ignoreSect_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

conditionalSect_rule.prototype.reset = function(){
  this.expect = 0
}

function includeSect_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<!['
  this.items = ["'<!['", 'S?', "'INCLUDE'", 'S?', "'['", 'extSubsetDecl', "']]>'"]
  this.rules = []
  this.repeats = []
}

includeSect_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<!['
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<![')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S?
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, 2, rule, char)
    case 2: // 'INCLUDE'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, 'INCLUDE')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // S?
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 3, 4, rule, char)
    case 4: // '['
      if(! this.rules[4]){
        this.rules[4] = new LITERAL(this, '[')
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 5, rule, char)
    case 5: // extSubsetDecl
      if(! this.rules[5]){
        this.rules[5] = new extSubsetDecl_rule(this)
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 6, rule, char)
    case 6: // ']]>'
      if(! this.rules[6]){
        this.rules[6] = new LITERAL(this, ']]>')
      }
      rule = this.rules[6]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

includeSect_rule.prototype.reset = function(){
  this.expect = 0
}

function ignoreSect_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<!['
  this.items = ["'<!['", 'S?', "'IGNORE'", 'S?', "'['", 'ignoreSectContents*', "']]>'"]
  this.rules = []
  this.repeats = []
}

ignoreSect_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<!['
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<![')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S?
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, 2, rule, char)
    case 2: // 'IGNORE'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, 'IGNORE')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // S?
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 3, 4, rule, char)
    case 4: // '['
      if(! this.rules[4]){
        this.rules[4] = new LITERAL(this, '[')
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 5, rule, char)
    case 5: // ignoreSectContents*
      if(! this.rules[5]){
        this.rules[5] = new ignoreSectContents_rule(this)
        this.repeats[5] = 0
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 5, 6, rule, char)
    case 6: // ']]>'
      if(! this.rules[6]){
        this.rules[6] = new LITERAL(this, ']]>')
      }
      rule = this.rules[6]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

ignoreSect_rule.prototype.reset = function(){
  this.expect = 0
}

function ignoreSectContents_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // Ignore
  this.items = ['Ignore', 'tmp_49*']
  this.rules = []
  this.repeats = []
}

ignoreSectContents_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // Ignore
      if(! this.rules[0]){
        this.rules[0] = new Ignore_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_49*
      if(! this.rules[1]){
        this.rules[1] = new tmp_49_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

ignoreSectContents_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_49_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<!['
  this.items = ["'<!['", 'ignoreSectContents', "']]>'", 'Ignore']
  this.rules = []
  this.repeats = []
}

tmp_49_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<!['
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<![')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // ignoreSectContents
      if(! this.rules[1]){
        this.rules[1] = new ignoreSectContents_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // ']]>'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, ']]>')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // Ignore
      if(! this.rules[3]){
        this.rules[3] = new Ignore_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_49_rule.prototype.reset = function(){
  this.expect = 0
}

function CharRef_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_50
  this.items = ['tmp_50', 'tmp_51']
  this.rules = []
  this.repeats = []
}

CharRef_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_50
      if(! this.rules[0]){
        this.rules[0] = new tmp_50_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_51
      if(! this.rules[1]){
        this.rules[1] = new tmp_51_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

CharRef_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_50_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '&#'
  this.items = ["'&#'", '[0-9]', "';'"]
  this.rules = []
  this.repeats = []
}

tmp_50_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '&#'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '&#')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // [0-9]
      if(! this.rules[1]){
        this.rules[1] = new CHARSET_rule(this, '0-9')
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_plus(this, 1,2, rule, char)
    case 2: // ';'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, ';')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_50_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_51_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '&#x'
  this.items = ["'&#x'", '[0-9a-fA-F]', "';'"]
  this.rules = []
  this.repeats = []
}

tmp_51_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '&#x'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '&#x')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // [0-9a-fA-F]
      if(! this.rules[1]){
        this.rules[1] = new CHARSET_rule(this, '0-9a-fA-F')
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_plus(this, 1,2, rule, char)
    case 2: // ';'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, ';')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_51_rule.prototype.reset = function(){
  this.expect = 0
}

function Reference_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // EntityRef
  this.items = ['EntityRef', 'CharRef']
  this.rules = []
  this.repeats = []
}

Reference_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // EntityRef
      if(! this.rules[0]){
        this.rules[0] = new EntityRef_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // CharRef
      if(! this.rules[1]){
        this.rules[1] = new CharRef_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

Reference_rule.prototype.reset = function(){
  this.expect = 0
}

function EntityRef_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '&'
  this.items = ["'&'", 'Name', "';'"]
  this.rules = []
  this.repeats = []
}

EntityRef_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '&'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '&')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Name
      if(! this.rules[1]){
        this.rules[1] = new Name_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // ';'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, ';')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

EntityRef_rule.prototype.reset = function(){
  this.expect = 0
}

function PEReference_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '%'
  this.items = ["'%'", 'Name', "';'"]
  this.rules = []
  this.repeats = []
}

PEReference_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '%'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '%')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // Name
      if(! this.rules[1]){
        this.rules[1] = new Name_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // ';'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, ';')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

PEReference_rule.prototype.reset = function(){
  this.expect = 0
}

function EntityDecl_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // GEDecl
  this.items = ['GEDecl', 'PEDecl']
  this.rules = []
  this.repeats = []
}

EntityDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // GEDecl
      if(! this.rules[0]){
        this.rules[0] = new GEDecl_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // PEDecl
      if(! this.rules[1]){
        this.rules[1] = new PEDecl_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

EntityDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function GEDecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<!ENTITY'
  this.items = ["'<!ENTITY'", 'S', 'Name', 'S', 'EntityDef', 'S?', "'>'"]
  this.rules = []
  this.repeats = []
}

GEDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<!ENTITY'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<!ENTITY')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // Name
      if(! this.rules[2]){
        this.rules[2] = new Name_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // S
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 4, rule, char)
    case 4: // EntityDef
      if(! this.rules[4]){
        this.rules[4] = new EntityDef_rule(this)
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 5, rule, char)
    case 5: // S?
      if(! this.rules[5]){
        this.rules[5] = new S_rule(this)
        this.repeats[5] = 0
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 5, 6, rule, char)
    case 6: // '>'
      if(! this.rules[6]){
        this.rules[6] = new LITERAL(this, '>')
      }
      rule = this.rules[6]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

GEDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function PEDecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<!ENTITY'
  this.items = ["'<!ENTITY'", 'S', "'%'", 'S', 'Name', 'S', 'PEDef', 'S?', "'>'"]
  this.rules = []
  this.repeats = []
}

PEDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<!ENTITY'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<!ENTITY')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // '%'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '%')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // S
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 4, rule, char)
    case 4: // Name
      if(! this.rules[4]){
        this.rules[4] = new Name_rule(this)
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 5, rule, char)
    case 5: // S
      if(! this.rules[5]){
        this.rules[5] = new S_rule(this)
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 6, rule, char)
    case 6: // PEDef
      if(! this.rules[6]){
        this.rules[6] = new PEDef_rule(this)
      }
      rule = this.rules[6]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 7, rule, char)
    case 7: // S?
      if(! this.rules[7]){
        this.rules[7] = new S_rule(this)
        this.repeats[7] = 0
      }
      rule = this.rules[7]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 7, 8, rule, char)
    case 8: // '>'
      if(! this.rules[8]){
        this.rules[8] = new LITERAL(this, '>')
      }
      rule = this.rules[8]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

PEDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function EntityDef_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // EntityValue
  this.items = ['EntityValue', 'tmp_52']
  this.rules = []
  this.repeats = []
}

EntityDef_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // EntityValue
      if(! this.rules[0]){
        this.rules[0] = new EntityValue_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_52
      if(! this.rules[1]){
        this.rules[1] = new tmp_52_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

EntityDef_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_52_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // ExternalID
  this.items = ['ExternalID', 'NDataDecl?']
  this.rules = []
  this.repeats = []
}

tmp_52_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // ExternalID
      if(! this.rules[0]){
        this.rules[0] = new ExternalID_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // NDataDecl?
      if(! this.rules[1]){
        this.rules[1] = new NDataDecl_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_52_rule.prototype.reset = function(){
  this.expect = 0
}

function PEDef_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // EntityValue
  this.items = ['EntityValue', 'ExternalID']
  this.rules = []
  this.repeats = []
}

PEDef_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // EntityValue
      if(! this.rules[0]){
        this.rules[0] = new EntityValue_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // ExternalID
      if(! this.rules[1]){
        this.rules[1] = new ExternalID_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

PEDef_rule.prototype.reset = function(){
  this.expect = 0
}

function ExternalID_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_53
  this.items = ['tmp_53', 'tmp_54']
  this.rules = []
  this.repeats = []
}

ExternalID_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_53
      if(! this.rules[0]){
        this.rules[0] = new tmp_53_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_54
      if(! this.rules[1]){
        this.rules[1] = new tmp_54_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

ExternalID_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_53_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // 'SYSTEM'
  this.items = ["'SYSTEM'", 'S', 'SystemLiteral']
  this.rules = []
  this.repeats = []
}

tmp_53_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // 'SYSTEM'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, 'SYSTEM')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // SystemLiteral
      if(! this.rules[2]){
        this.rules[2] = new SystemLiteral_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_53_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_54_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // 'PUBLIC'
  this.items = ["'PUBLIC'", 'S', 'PubidLiteral', 'S', 'SystemLiteral']
  this.rules = []
  this.repeats = []
}

tmp_54_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // 'PUBLIC'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, 'PUBLIC')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // PubidLiteral
      if(! this.rules[2]){
        this.rules[2] = new PubidLiteral_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // S
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 4, rule, char)
    case 4: // SystemLiteral
      if(! this.rules[4]){
        this.rules[4] = new SystemLiteral_rule(this)
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_54_rule.prototype.reset = function(){
  this.expect = 0
}

function NDataDecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', "'NDATA'", 'S', 'Name']
  this.rules = []
  this.repeats = []
}

NDataDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // 'NDATA'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, 'NDATA')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // S
      if(! this.rules[2]){
        this.rules[2] = new S_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // Name
      if(! this.rules[3]){
        this.rules[3] = new Name_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

NDataDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function TextDecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<?xml'
  this.items = ["'<?xml'", 'VersionInfo?', 'EncodingDecl', 'S?', "'?>'"]
  this.rules = []
  this.repeats = []
}

TextDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<?xml'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<?xml')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // VersionInfo?
      if(! this.rules[1]){
        this.rules[1] = new VersionInfo_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 1, 2, rule, char)
    case 2: // EncodingDecl
      if(! this.rules[2]){
        this.rules[2] = new EncodingDecl_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // S?
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
        this.repeats[3] = 0
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 3, 4, rule, char)
    case 4: // '?>'
      if(! this.rules[4]){
        this.rules[4] = new LITERAL(this, '?>')
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

TextDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function extParsedEnt_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // TextDecl?
  this.items = ['TextDecl?', 'content']
  this.rules = []
  this.repeats = []
}

extParsedEnt_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // TextDecl?
      if(! this.rules[0]){
        this.rules[0] = new TextDecl_rule(this)
        this.repeats[0] = 0
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 0, 1, rule, char)
    case 1: // content
      if(! this.rules[1]){
        this.rules[1] = new content_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

extParsedEnt_rule.prototype.reset = function(){
  this.expect = 0
}

function EncodingDecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // S
  this.items = ['S', "'encoding'", 'Eq', 'tmp_55']
  this.rules = []
  this.repeats = []
}

EncodingDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // S
      if(! this.rules[0]){
        this.rules[0] = new S_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // 'encoding'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, 'encoding')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // Eq
      if(! this.rules[2]){
        this.rules[2] = new Eq_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // tmp_55
      if(! this.rules[3]){
        this.rules[3] = new tmp_55_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

EncodingDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_55_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // tmp_56
  this.items = ['tmp_56', 'tmp_57']
  this.rules = []
  this.repeats = []
}

tmp_55_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // tmp_56
      if(! this.rules[0]){
        this.rules[0] = new tmp_56_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // tmp_57
      if(! this.rules[1]){
        this.rules[1] = new tmp_57_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_55_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_56_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '"'
  this.items = ['\'"\'', 'EncName', '\'"\'']
  this.rules = []
  this.repeats = []
}

tmp_56_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '"'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '"')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // EncName
      if(! this.rules[1]){
        this.rules[1] = new EncName_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // '"'
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '"')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_56_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_57_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // "'"
  this.items = ['"\'"', 'EncName', '"\'"']
  this.rules = []
  this.repeats = []
}

tmp_57_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // "'"
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '\'')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // EncName
      if(! this.rules[1]){
        this.rules[1] = new EncName_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // "'"
      if(! this.rules[2]){
        this.rules[2] = new LITERAL(this, '\'')
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_57_rule.prototype.reset = function(){
  this.expect = 0
}

function EncName_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // [A-Za-z]
  this.items = ['[A-Za-z]', 'tmp_58*']
  this.rules = []
  this.repeats = []
}

EncName_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // [A-Za-z]
      if(! this.rules[0]){
        this.rules[0] = new CHARSET_rule(this, 'A-Za-z')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // tmp_58*
      if(! this.rules[1]){
        this.rules[1] = new tmp_58_rule(this)
        this.repeats[1] = 0
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_star(this, 1, -1, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

EncName_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_58_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // [A-Za-z0-9._]
  this.items = ['[A-Za-z0-9._]', "'-'"]
  this.rules = []
  this.repeats = []
}

tmp_58_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // [A-Za-z0-9._]
      if(! this.rules[0]){
        this.rules[0] = new CHARSET_rule(this, 'A-Za-z0-9._')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // '-'
      if(! this.rules[1]){
        this.rules[1] = new LITERAL(this, '-')
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_58_rule.prototype.reset = function(){
  this.expect = 0
}

function NotationDecl_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // '<!NOTATION'
  this.items = ["'<!NOTATION'", 'S', 'Name', 'S', 'tmp_59', 'S?', "'>'"]
  this.rules = []
  this.repeats = []
}

NotationDecl_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // '<!NOTATION'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, '<!NOTATION')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // Name
      if(! this.rules[2]){
        this.rules[2] = new Name_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 3, rule, char)
    case 3: // S
      if(! this.rules[3]){
        this.rules[3] = new S_rule(this)
      }
      rule = this.rules[3]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 4, rule, char)
    case 4: // tmp_59
      if(! this.rules[4]){
        this.rules[4] = new tmp_59_rule(this)
      }
      rule = this.rules[4]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 5, rule, char)
    case 5: // S?
      if(! this.rules[5]){
        this.rules[5] = new S_rule(this)
        this.repeats[5] = 0
      }
      rule = this.rules[5]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_zero_or_one(this, 5, 6, rule, char)
    case 6: // '>'
      if(! this.rules[6]){
        this.rules[6] = new LITERAL(this, '>')
      }
      rule = this.rules[6]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

NotationDecl_rule.prototype.reset = function(){
  this.expect = 0
}

function tmp_59_rule(origin){
  this.alt = true
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // ExternalID
  this.items = ['ExternalID', 'PublicID']
  this.rules = []
  this.repeats = []
}

tmp_59_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // ExternalID
      if(! this.rules[0]){
        this.rules[0] = new ExternalID_rule(this)
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_alt(this, 1, rule, char)
    case 1: // PublicID
      if(! this.rules[1]){
        this.rules[1] = new PublicID_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

tmp_59_rule.prototype.reset = function(){
  this.expect = 0
}

function PublicID_rule(origin){
  this.origin = origin
  this.pos = get_pos(this)
  this.result_store = {}
  this.expect = 0 // 'PUBLIC'
  this.items = ["'PUBLIC'", 'S', 'PubidLiteral']
  this.rules = []
  this.repeats = []
}

PublicID_rule.prototype.feed = function(char){
  var res, rule
  switch(this.expect){
    case 0: // 'PUBLIC'
      if(! this.rules[0]){
        this.rules[0] = new LITERAL(this, 'PUBLIC')
      }
      rule = this.rules[0]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 1, rule, char)
    case 1: // S
      if(! this.rules[1]){
        this.rules[1] = new S_rule(this)
      }
      rule = this.rules[1]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_simple(this, 2, rule, char)
    case 2: // PubidLiteral
      if(! this.rules[2]){
        this.rules[2] = new PubidLiteral_rule(this)
      }
      rule = this.rules[2]
      rule.pos = rule.pos ?? get_pos(this)
      return handle_last(this, rule, char)
    case -1:
      return this.origin.feed(DONE)
  }
  return this
}

PublicID_rule.prototype.reset = function(){
  this.expect = 0
}


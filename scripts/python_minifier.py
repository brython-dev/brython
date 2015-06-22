"""Minifier for Python code

The module exposes a single function : minify(src), where src is
a string with the original Python code.

The function returns a string with a minified version of the original :
- indentation is reduced to the minimum (1 space for each level)
- comments are removed, except on the first 2 lines
- lines starting with a string are removed (considered as doc strings), except
  if the next line doesn't start with the same indent, like in
      # --------------------------------
      def f():
          'function with docstring only'      
      print('ok')
      # --------------------------------
"""

import os
import token
import tokenize
import re
import io

def minify(src):
    
    # tokenize expects method readline of file in binary mode
    file_obj = io.BytesIO(src.encode('utf-8'))
    token_generator = tokenize.tokenize(file_obj.readline)
    
    out = '' # minified source
    line = 0
    last_type = None
    indent = 0 # current indentation level
    brackets = [] # stack for brackets

    # first token is script encoding    
    encoding = next(token_generator).string
    
    file_obj = io.BytesIO(src.encode(encoding))
    token_generator = tokenize.tokenize(file_obj.readline)    

    for item in token_generator:

        # update brackets stack if necessary
        if token.tok_name[item.type]=='OP':
            if item.string in '([{':
                brackets.append(item.string)
            elif item.string in '}])':
                brackets.pop()

        sline = item.start[0] # start line
        if sline == 0: # encoding
            continue
        if item.type==tokenize.INDENT:
            indent += 1
        elif item.type==tokenize.DEDENT:
            indent -= 1
            continue
        if sline>line:
            if not brackets and item.type==tokenize.STRING:
                if last_type in [tokenize.NEWLINE, tokenize.INDENT, None]:
                    # Replace a string starting a line by the empty string
                    # It will be removed if the next line has the same
                    # indentation
                    out += ' '*indent+"''"
                    continue
            out += ' '*indent # start with current indentation
            if item.type not in [tokenize.INDENT, tokenize.COMMENT]:
                out += item.string
            elif item.type==tokenize.COMMENT and \
                line<=2 and item.line.startswith('#!'):
                # Ignore comments starting a line, except in one of the first
                # 2 lines, for interpreter path and/or encoding declaration
                out += item.string
        else:
            if item.type == tokenize.COMMENT:
                continue
            if not brackets and item.type == tokenize.STRING and \
                last_type in [tokenize.NEWLINE, tokenize.INDENT]:
                out += "''"
                continue
            if item.type in [tokenize.NAME, tokenize.NUMBER] and \
                last_type in [tokenize.NAME, tokenize.NUMBER]:
                # insert a space between names and numbers
                out += ' '
            elif item.type == tokenize.STRING and \
                item.string[0] in 'rbu' and \
                last_type in [tokenize.NAME, tokenize.NUMBER]:
                # for cases like "return b'x'"
                out += ' '
            out += item.string
        line = item.end[0]
        if item.type==tokenize.NL and last_type==tokenize.COMMENT:
            # NL after COMMENT is interpreted as NEWLINE
            last_type = tokenize.NEWLINE
        else:
            last_type = item.type

    # remove empty line at the start of the script (doc string)
    out = re.sub("^''\n", '', out)
        
    # remove consecutive empty lines
    out = re.sub('\n( *\n)+', '\n', out)

    # remove empty lines followed by a line that starts with the same indent
    def repl(mo):
        if mo.groups()[0]==mo.groups()[1]:
            return '\n'+mo.groups()[1]
        return mo.string[mo.start(): mo.end()]
    out = re.sub("\n( *)''\n( *)", repl, out)
    
    return out

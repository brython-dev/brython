(function($B){
var grammar = $B.grammar = {
file:
  {
    items: [
      {
        items: [
          {type: 'rule', name: 'statements'}
        ],
        repeat: '?', alias: 'a'
      },
      {type: 'ENDMARKER'}
    ], action: '$B._PyPegen.make_module(p, a)'
  },
interactive:
  {
    items: [
      {type: 'rule', name: 'statement_newline', alias: 'a'}
    ], action: '$B._PyAST.Interactive(a, p.arena)'
  },
eval:
  {
    items: [
      {type: 'rule', name: 'expressions', alias: 'a'},
      {type: 'NEWLINE', repeat: '*'},
      {type: 'ENDMARKER'}
    ], action: '$B._PyAST.Expression(a, p.arena)'
  },
func_type:
  {
    items: [
      {type: 'string', value: '('},
      {
        items: [
          {type: 'rule', name: 'type_expressions'}
        ],
        repeat: '?', alias: 'a'
      },
      {type: 'string', value: ')'},
      {type: 'string', value: '->'},
      {type: 'rule', name: 'expression', alias: 'b'},
      {type: 'NEWLINE', repeat: '*'},
      {type: 'ENDMARKER'}
    ], action: '$B._PyAST.FunctionType(a, b, p.arena)'
  },
fstring:
  {
    items: [
      {type: 'rule', name: 'star_expressions'}
    ]
  },
statements:
  {
    items: [
      {type: 'rule', name: 'statement', repeat: '+', alias: 'a'}
    ], action: '$B._PyPegen.seq_flatten(p, a)'
  },
statement:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'compound_stmt', alias: 'a'}
        ], action: '$B._PyPegen.singleton_seq(p, a)'
      },
      {
        items: [
          {type: 'rule', name: 'simple_stmts', alias: 'a'}
        ], action: 'a'
      }]
  },
statement_newline:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'compound_stmt', alias: 'a'},
          {type: 'NEWLINE'}
        ], action: '$B._PyPegen.singleton_seq(p, a)'
      },
      {
        items: [
          {type: 'rule', name: 'simple_stmts'}
        ]
      },
      {
        items: [
          {type: 'NEWLINE'}
        ], action: '$B._PyPegen.singleton_seq(p, CHECK($B.ast.stmt, $B._PyAST.Pass(EXTRA)))'
      },
      {
        items: [
          {type: 'ENDMARKER'}
        ], action: '$B._PyPegen.interactive_exit(p)'
      }]
  },
simple_stmts:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'simple_stmt', alias: 'a'},
          {type: 'string', value: ';', lookahead: 'negative'},
          {type: 'NEWLINE'}
        ], action: '$B._PyPegen.singleton_seq(p, a)'
      },
      {
        items: [
          {type: 'rule', name: 'simple_stmt', join: ';', alias: 'a', repeat: '+'},
          {
            items: [
              {type: 'string', value: ';'}
            ],
            repeat: '?'
          },
          {type: 'NEWLINE'}
        ], action: 'a'
      }]
  },
simple_stmt:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'assignment'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'star_expressions', alias: 'e'}
        ], action: '$B._PyAST.Expr(e, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'return', lookahead: 'positive'},
          {type: 'rule', name: 'return_stmt'}
        ]
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'string', value: 'import'}
                ]
              },
              {
                items: [
                  {type: 'string', value: 'from'}
                ]
              }], lookahead: 'positive'
          },
          {type: 'rule', name: 'import_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'raise', lookahead: 'positive'},
          {type: 'rule', name: 'raise_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'pass'}
        ], action: '$B._PyAST.Pass(EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'del', lookahead: 'positive'},
          {type: 'rule', name: 'del_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'yield', lookahead: 'positive'},
          {type: 'rule', name: 'yield_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'assert', lookahead: 'positive'},
          {type: 'rule', name: 'assert_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'break'}
        ], action: '$B._PyAST.Break(EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'continue'}
        ], action: '$B._PyAST.Continue(EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'global', lookahead: 'positive'},
          {type: 'rule', name: 'global_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'nonlocal', lookahead: 'positive'},
          {type: 'rule', name: 'nonlocal_stmt'}
        ]
      }]
  },
compound_stmt:
  {
   choices: [
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'string', value: 'def'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '@'}
                ]
              },
              {
                items: [
                  {type: 'ASYNC'}
                ]
              }], lookahead: 'positive'
          },
          {type: 'rule', name: 'function_def'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'if', lookahead: 'positive'},
          {type: 'rule', name: 'if_stmt'}
        ]
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'string', value: 'class'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '@'}
                ]
              }], lookahead: 'positive'
          },
          {type: 'rule', name: 'class_def'}
        ]
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'string', value: 'with'}
                ]
              },
              {
                items: [
                  {type: 'ASYNC'}
                ]
              }], lookahead: 'positive'
          },
          {type: 'rule', name: 'with_stmt'}
        ]
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'string', value: 'for'}
                ]
              },
              {
                items: [
                  {type: 'ASYNC'}
                ]
              }], lookahead: 'positive'
          },
          {type: 'rule', name: 'for_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'try', lookahead: 'positive'},
          {type: 'rule', name: 'try_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'while', lookahead: 'positive'},
          {type: 'rule', name: 'while_stmt'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'match_stmt'}
        ]
      }]
  },
assignment:
  {
   choices: [
      {
        items: [
          {type: 'NAME', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'expression', alias: 'b'},
          {
            items: [
              {type: 'string', value: '='},
              {type: 'rule', name: 'annotated_rhs', alias: 'd'}
            ],
            repeat: '?', alias: 'c', action: 'd'
          }
        ], action: 'CHECK_VERSION( $B.ast.stmt, 6, "Variable annotation syntax is", $B._PyAST.AnnAssign(CHECK($B.ast.expr, $B._PyPegen.set_expr_context(p, a, Store)), b, c, 1, EXTRA) )'
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '('},
                  {type: 'rule', name: 'single_target', alias: 'b'},
                  {type: 'string', value: ')'}
                ], action: 'b'
              },
              {
                items: [
                  {type: 'rule', name: 'single_subscript_attribute_target'}
                ]
              }], alias: 'a'
          },
          {type: 'string', value: ':'},
          {type: 'rule', name: 'expression', alias: 'b'},
          {
            items: [
              {type: 'string', value: '='},
              {type: 'rule', name: 'annotated_rhs', alias: 'd'}
            ],
            repeat: '?', alias: 'c', action: 'd'
          }
        ], action: 'CHECK_VERSION($B.ast.stmt, 6, "Variable annotations syntax is", $B._PyAST.AnnAssign(a, b, c, 0, EXTRA))'
      },
      {
        items: [
          {
            items: [
              {type: 'rule', name: 'star_targets', alias: 'z'},
              {type: 'string', value: '='}
            ],
            repeat: '+', alias: 'a', action: 'z'
          },
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'yield_expr'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'star_expressions'}
                ]
              }], alias: 'b'
          },
          {type: 'string', value: '=', lookahead: 'negative'},
          {
            items: [
              {type: 'TYPE_COMMENT'}
            ],
            repeat: '?', alias: 'tc'
          }
        ], action: '$B._PyAST.Assign(a, b, NEW_TYPE_COMMENT(p, tc), EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'single_target', alias: 'a'},
          {type: 'rule', name: 'augassign', alias: 'b'},
          {type: 'COMMIT_CHOICE'},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'yield_expr'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'star_expressions'}
                ]
              }], alias: 'c'
          }
        ], action: '$B._PyAST.AugAssign(a, b.kind, c, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_assignment'}
        ]
      }]
  },
annotated_rhs:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'yield_expr'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'star_expressions'}
        ]
      }]
  },
augassign:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '+='}
        ], action: '$B._PyPegen.augoperator(p, Add)'
      },
      {
        items: [
          {type: 'string', value: '-='}
        ], action: '$B._PyPegen.augoperator(p, Sub)'
      },
      {
        items: [
          {type: 'string', value: '*='}
        ], action: '$B._PyPegen.augoperator(p, Mult)'
      },
      {
        items: [
          {type: 'string', value: '@='}
        ], action: 'CHECK_VERSION(AugOperator, 5, "The \'@\' operator is", $B._PyPegen.augoperator(p, MatMult))'
      },
      {
        items: [
          {type: 'string', value: '/='}
        ], action: '$B._PyPegen.augoperator(p, Div)'
      },
      {
        items: [
          {type: 'string', value: '%='}
        ], action: '$B._PyPegen.augoperator(p, Mod)'
      },
      {
        items: [
          {type: 'string', value: '&='}
        ], action: '$B._PyPegen.augoperator(p, BitAnd)'
      },
      {
        items: [
          {type: 'string', value: '|='}
        ], action: '$B._PyPegen.augoperator(p, BitOr)'
      },
      {
        items: [
          {type: 'string', value: '^='}
        ], action: '$B._PyPegen.augoperator(p, BitXor)'
      },
      {
        items: [
          {type: 'string', value: '<<='}
        ], action: '$B._PyPegen.augoperator(p, LShift)'
      },
      {
        items: [
          {type: 'string', value: '>>='}
        ], action: '$B._PyPegen.augoperator(p, RShift)'
      },
      {
        items: [
          {type: 'string', value: '**='}
        ], action: '$B._PyPegen.augoperator(p, Pow)'
      },
      {
        items: [
          {type: 'string', value: '//='}
        ], action: '$B._PyPegen.augoperator(p, FloorDiv)'
      }]
  },
return_stmt:
  {
    items: [
      {type: 'string', value: 'return'},
      {
        items: [
          {type: 'rule', name: 'star_expressions'}
        ],
        repeat: '?', alias: 'a'
      }
    ], action: '$B._PyAST.Return(a, EXTRA)'
  },
raise_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'raise'},
          {type: 'rule', name: 'expression', alias: 'a'},
          {
            items: [
              {type: 'string', value: 'from'},
              {type: 'rule', name: 'expression', alias: 'z'}
            ],
            repeat: '?', alias: 'b', action: 'z'
          }
        ], action: '$B._PyAST.Raise(a, b, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'raise'}
        ], action: '$B._PyAST.Raise(NULL, NULL, EXTRA)'
      }]
  },
global_stmt:
  {
    items: [
      {type: 'string', value: 'global'},
      {type: 'NAME', join: ',', alias: 'a', repeat: '+'}
    ], action: '$B._PyAST.Global(CHECK(asdl_identifier_seq, $B._PyPegen.map_names_to_ids(p, a)), EXTRA)'
  },
nonlocal_stmt:
  {
    items: [
      {type: 'string', value: 'nonlocal'},
      {type: 'NAME', join: ',', alias: 'a', repeat: '+'}
    ], action: '$B._PyAST.Nonlocal(CHECK(asdl_identifier_seq, $B._PyPegen.map_names_to_ids(p, a)), EXTRA)'
  },
del_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'del'},
          {type: 'rule', name: 'del_targets', alias: 'a'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: ';'}
                ]
              },
              {
                items: [
                  {type: 'NEWLINE'}
                ]
              }], lookahead: 'positive'
          }
        ], action: '$B._PyAST.Delete(a, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_del_stmt'}
        ]
      }]
  },
yield_stmt:
  {
    items: [
      {type: 'rule', name: 'yield_expr', alias: 'y'}
    ], action: '$B._PyAST.Expr(y, EXTRA)'
  },
assert_stmt:
  {
    items: [
      {type: 'string', value: 'assert'},
      {type: 'rule', name: 'expression', alias: 'a'},
      {
        items: [
          {type: 'string', value: ','},
          {type: 'rule', name: 'expression', alias: 'z'}
        ],
        repeat: '?', alias: 'b', action: 'z'
      }
    ], action: '$B._PyAST.Assert(a, b, EXTRA)'
  },
import_stmt:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'import_name'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'import_from'}
        ]
      }]
  },
import_name:
  {
    items: [
      {type: 'string', value: 'import'},
      {type: 'rule', name: 'dotted_as_names', alias: 'a'}
    ], action: '$B._PyAST.Import(a, EXTRA)'
  },
import_from:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'from'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '.'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '...'}
                ]
              }],
            repeat: '*', alias: 'a'
          },
          {type: 'rule', name: 'dotted_name', alias: 'b'},
          {type: 'string', value: 'import'},
          {type: 'rule', name: 'import_from_targets', alias: 'c'}
        ], action: '$B._PyAST.ImportFrom(b.id, c, $B._PyPegen.seq_count_dots(a), EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'from'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '.'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '...'}
                ]
              }],
            repeat: '+', alias: 'a'
          },
          {type: 'string', value: 'import'},
          {type: 'rule', name: 'import_from_targets', alias: 'b'}
        ], action: '$B._PyAST.ImportFrom(NULL, b, $B._PyPegen.seq_count_dots(a), EXTRA)'
      }]
  },
import_from_targets:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'import_from_as_names', alias: 'a'},
          {
            items: [
              {type: 'string', value: ','}
            ],
            repeat: '?'
          },
          {type: 'string', value: ')'}
        ], action: 'a'
      },
      {
        items: [
          {type: 'rule', name: 'import_from_as_names'},
          {type: 'string', value: ',', lookahead: 'negative'}
        ]
      },
      {
        items: [
          {type: 'string', value: '*'}
        ], action: '$B._PyPegen.singleton_seq(p, CHECK($B.ast.alias, $B._PyPegen.alias_for_star(p, EXTRA)))'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_import_from_targets'}
        ]
      }]
  },
import_from_as_names:
  {
    items: [
      {type: 'rule', name: 'import_from_as_name', join: ',', alias: 'a', repeat: '+'}
    ], action: 'a'
  },
import_from_as_name:
  {
    items: [
      {type: 'NAME', alias: 'a'},
      {
        items: [
          {type: 'string', value: 'as'},
          {type: 'NAME', alias: 'z'}
        ],
        repeat: '?', alias: 'b', action: 'z'
      }
    ], action: '$B._PyAST.alias(a.id, (b) ? b.id : NULL, EXTRA)'
  },
dotted_as_names:
  {
    items: [
      {type: 'rule', name: 'dotted_as_name', join: ',', alias: 'a', repeat: '+'}
    ], action: 'a'
  },
dotted_as_name:
  {
    items: [
      {type: 'rule', name: 'dotted_name', alias: 'a'},
      {
        items: [
          {type: 'string', value: 'as'},
          {type: 'NAME', alias: 'z'}
        ],
        repeat: '?', alias: 'b', action: 'z'
      }
    ], action: '$B._PyAST.alias(a.id, (b) ? b.id : NULL, EXTRA)'
  },
dotted_name:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'dotted_name', alias: 'a'},
          {type: 'string', value: '.'},
          {type: 'NAME', alias: 'b'}
        ], action: '$B._PyPegen.join_names_with_dot(p, a, b)'
      },
      {
        items: [
          {type: 'NAME'}
        ]
      }]
  },
block:
  {
   choices: [
      {
        items: [
          {type: 'NEWLINE'},
          {type: 'INDENT'},
          {type: 'rule', name: 'statements', alias: 'a'},
          {type: 'DEDENT'}
        ], action: 'a'
      },
      {
        items: [
          {type: 'rule', name: 'simple_stmts'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'invalid_block'}
        ]
      }]
  },
decorators:
  {
    items: [
      {
        items: [
          {type: 'string', value: '@'},
          {type: 'rule', name: 'named_expression', alias: 'f'},
          {type: 'NEWLINE'}
        ],
        repeat: '+', alias: 'a', action: 'f'
      }
    ], action: 'a'
  },
class_def:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'decorators', alias: 'a'},
          {type: 'rule', name: 'class_def_raw', alias: 'b'}
        ], action: '$B._PyPegen.class_def_decorators(p, a, b)'
      },
      {
        items: [
          {type: 'rule', name: 'class_def_raw'}
        ]
      }]
  },
class_def_raw:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_class_def_raw'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'class'},
          {type: 'NAME', alias: 'a'},
          {
            items: [
              {type: 'string', value: '('},
              {
                items: [
                  {type: 'rule', name: 'arguments'}
                ],
                repeat: '?', alias: 'z'
              },
              {type: 'string', value: ')'}
            ],
            repeat: '?', alias: 'b', action: 'z'
          },
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'c'}
        ], action: '$B._PyAST.ClassDef(a.id, (b) ? b.args : NULL, (b) ? b.keywords : NULL, c, NULL, EXTRA)'
      }]
  },
function_def:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'decorators', alias: 'd'},
          {type: 'rule', name: 'function_def_raw', alias: 'f'}
        ], action: '$B._PyPegen.function_def_decorators(p, d, f)'
      },
      {
        items: [
          {type: 'rule', name: 'function_def_raw'}
        ]
      }]
  },
function_def_raw:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_def_raw'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'def'},
          {type: 'NAME', alias: 'n'},
          {type: 'string', value: '('},
          {
            items: [
              {type: 'rule', name: 'params'}
            ],
            repeat: '?', alias: 'params'
          },
          {type: 'string', value: ')'},
          {
            items: [
              {type: 'string', value: '->'},
              {type: 'rule', name: 'expression', alias: 'z'}
            ],
            repeat: '?', alias: 'a', action: 'z'
          },
          {type: 'string', value: ':'},
          {
            items: [
              {type: 'rule', name: 'func_type_comment'}
            ],
            repeat: '?', alias: 'tc'
          },
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: '$B._PyAST.FunctionDef(n.id, (params) ? params : CHECK($B.ast.arguments, $B._PyPegen.empty_arguments(p)), b, NULL, a, NEW_TYPE_COMMENT(p, tc), EXTRA)'
      },
      {
        items: [
          {type: 'ASYNC'},
          {type: 'string', value: 'def'},
          {type: 'NAME', alias: 'n'},
          {type: 'string', value: '('},
          {
            items: [
              {type: 'rule', name: 'params'}
            ],
            repeat: '?', alias: 'params'
          },
          {type: 'string', value: ')'},
          {
            items: [
              {type: 'string', value: '->'},
              {type: 'rule', name: 'expression', alias: 'z'}
            ],
            repeat: '?', alias: 'a', action: 'z'
          },
          {type: 'string', value: ':'},
          {
            items: [
              {type: 'rule', name: 'func_type_comment'}
            ],
            repeat: '?', alias: 'tc'
          },
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: 'CHECK_VERSION( $B.ast.stmt, 5, "Async functions are", $B._PyAST.AsyncFunctionDef(n.id, (params) ? params : CHECK($B.ast.arguments, $B._PyPegen.empty_arguments(p)), b, NULL, a, NEW_TYPE_COMMENT(p, tc), EXTRA) )'
      }]
  },
params:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_parameters'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'parameters'}
        ]
      }]
  },
parameters:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'slash_no_default', alias: 'a'},
          {type: 'rule', name: 'param_no_default', repeat: '*', alias: 'b'},
          {type: 'rule', name: 'param_with_default', repeat: '*', alias: 'c'},
          {
            items: [
              {type: 'rule', name: 'star_etc'}
            ],
            repeat: '?', alias: 'd'
          }
        ], action: 'CHECK_VERSION($B.ast.arguments, 8, "Positional-only parameters are", $B._PyPegen.make_arguments(p, a, NULL, b, c, d))'
      },
      {
        items: [
          {type: 'rule', name: 'slash_with_default', alias: 'a'},
          {type: 'rule', name: 'param_with_default', repeat: '*', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'star_etc'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: 'CHECK_VERSION($B.ast.arguments, 8, "Positional-only parameters are", $B._PyPegen.make_arguments(p, NULL, a, NULL, b, c))'
      },
      {
        items: [
          {type: 'rule', name: 'param_no_default', repeat: '+', alias: 'a'},
          {type: 'rule', name: 'param_with_default', repeat: '*', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'star_etc'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: '$B._PyPegen.make_arguments(p, NULL, NULL, a, b, c)'
      },
      {
        items: [
          {type: 'rule', name: 'param_with_default', repeat: '+', alias: 'a'},
          {
            items: [
              {type: 'rule', name: 'star_etc'}
            ],
            repeat: '?', alias: 'b'
          }
        ], action: '$B._PyPegen.make_arguments(p, NULL, NULL, NULL, a, b)'
      },
      {
        items: [
          {type: 'rule', name: 'star_etc', alias: 'a'}
        ], action: '$B._PyPegen.make_arguments(p, NULL, NULL, NULL, NULL, a)'
      }]
  },
slash_no_default:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'param_no_default', repeat: '+', alias: 'a'},
          {type: 'string', value: '/'},
          {type: 'string', value: ','}
        ], action: 'a'
      },
      {
        items: [
          {type: 'rule', name: 'param_no_default', repeat: '+', alias: 'a'},
          {type: 'string', value: '/'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: 'a'
      }]
  },
slash_with_default:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'param_no_default', repeat: '*', alias: 'a'},
          {type: 'rule', name: 'param_with_default', repeat: '+', alias: 'b'},
          {type: 'string', value: '/'},
          {type: 'string', value: ','}
        ], action: '$B._PyPegen.slash_with_default(p, a, b)'
      },
      {
        items: [
          {type: 'rule', name: 'param_no_default', repeat: '*', alias: 'a'},
          {type: 'rule', name: 'param_with_default', repeat: '+', alias: 'b'},
          {type: 'string', value: '/'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: '$B._PyPegen.slash_with_default(p, a, b)'
      }]
  },
star_etc:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_star_etc'}
        ]
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'param_no_default', alias: 'a'},
          {type: 'rule', name: 'param_maybe_default', repeat: '*', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'kwds'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: '$B._PyPegen.star_etc(p, a, b, c)'
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'param_no_default_star_annotation', alias: 'a'},
          {type: 'rule', name: 'param_maybe_default', repeat: '*', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'kwds'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: '$B._PyPegen.star_etc(p, a, b, c)'
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'param_maybe_default', repeat: '+', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'kwds'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: '$B._PyPegen.star_etc(p, NULL, b, c)'
      },
      {
        items: [
          {type: 'rule', name: 'kwds', alias: 'a'}
        ], action: '$B._PyPegen.star_etc(p, NULL, NULL, a)'
      }]
  },
kwds:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_kwds'}
        ]
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'param_no_default', alias: 'a'}
        ], action: 'a'
      }]
  },
param_no_default:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'param', alias: 'a'},
          {type: 'string', value: ','},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'}
        ], action: '$B._PyPegen.add_type_comment_to_arg(p, a, tc)'
      },
      {
        items: [
          {type: 'rule', name: 'param', alias: 'a'},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: '$B._PyPegen.add_type_comment_to_arg(p, a, tc)'
      }]
  },
param_no_default_star_annotation:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'param_star_annotation', alias: 'a'},
          {type: 'string', value: ','},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'}
        ], action: '$B._PyPegen.add_type_comment_to_arg(p, a, tc)'
      },
      {
        items: [
          {type: 'rule', name: 'param_star_annotation', alias: 'a'},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: '$B._PyPegen.add_type_comment_to_arg(p, a, tc)'
      }]
  },
param_with_default:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'param', alias: 'a'},
          {type: 'rule', name: 'default', alias: 'c'},
          {type: 'string', value: ','},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'}
        ], action: '$B._PyPegen.name_default_pair(p, a, c, tc)'
      },
      {
        items: [
          {type: 'rule', name: 'param', alias: 'a'},
          {type: 'rule', name: 'default', alias: 'c'},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: '$B._PyPegen.name_default_pair(p, a, c, tc)'
      }]
  },
param_maybe_default:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'param', alias: 'a'},
          {type: 'rule', name: 'default', repeat: '?', alias: 'c'},
          {type: 'string', value: ','},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'}
        ], action: '$B._PyPegen.name_default_pair(p, a, c, tc)'
      },
      {
        items: [
          {type: 'rule', name: 'param', alias: 'a'},
          {type: 'rule', name: 'default', repeat: '?', alias: 'c'},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: '$B._PyPegen.name_default_pair(p, a, c, tc)'
      }]
  },
param:
  {
    items: [
      {type: 'NAME', alias: 'a'},
      {type: 'rule', name: 'annotation', repeat: '?', alias: 'b'}
    ], action: '$B._PyAST.arg(a.id, b, NULL, EXTRA)'
  },
param_star_annotation:
  {
    items: [
      {type: 'NAME', alias: 'a'},
      {type: 'rule', name: 'star_annotation', alias: 'b'}
    ], action: '$B._PyAST.arg(a.id, b, NULL, EXTRA)'
  },
annotation:
  {
    items: [
      {type: 'string', value: ':'},
      {type: 'rule', name: 'expression', alias: 'a'}
    ], action: 'a'
  },
star_annotation:
  {
    items: [
      {type: 'string', value: ':'},
      {type: 'rule', name: 'star_expression', alias: 'a'}
    ], action: 'a'
  },
default:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '='},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: 'a'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_default'}
        ]
      }]
  },
if_stmt:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_if_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'if'},
          {type: 'rule', name: 'named_expression', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'},
          {type: 'rule', name: 'elif_stmt', alias: 'c'}
        ], action: '$B._PyAST.If(a, b, CHECK(asdl_stmt_seq, $B._PyPegen.singleton_seq(p, c)), EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'if'},
          {type: 'rule', name: 'named_expression', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'else_block'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: '$B._PyAST.If(a, b, c, EXTRA)'
      }]
  },
elif_stmt:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_elif_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'elif'},
          {type: 'rule', name: 'named_expression', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'},
          {type: 'rule', name: 'elif_stmt', alias: 'c'}
        ], action: '$B._PyAST.If(a, b, CHECK(asdl_stmt_seq, $B._PyPegen.singleton_seq(p, c)), EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'elif'},
          {type: 'rule', name: 'named_expression', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'else_block'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: '$B._PyAST.If(a, b, c, EXTRA)'
      }]
  },
else_block:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_else_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'else'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: 'b'
      }]
  },
while_stmt:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_while_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'while'},
          {type: 'rule', name: 'named_expression', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'else_block'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: '$B._PyAST.While(a, b, c, EXTRA)'
      }]
  },
for_stmt:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_for_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'for'},
          {type: 'rule', name: 'star_targets', alias: 't'},
          {type: 'string', value: 'in'},
          {type: 'COMMIT_CHOICE'},
          {type: 'rule', name: 'star_expressions', alias: 'ex'},
          {type: 'string', value: ':'},
          {
            items: [
              {type: 'TYPE_COMMENT'}
            ],
            repeat: '?', alias: 'tc'
          },
          {type: 'rule', name: 'block', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'else_block'}
            ],
            repeat: '?', alias: 'el'
          }
        ], action: '$B._PyAST.For(t, ex, b, el, NEW_TYPE_COMMENT(p, tc), EXTRA)'
      },
      {
        items: [
          {type: 'ASYNC'},
          {type: 'string', value: 'for'},
          {type: 'rule', name: 'star_targets', alias: 't'},
          {type: 'string', value: 'in'},
          {type: 'COMMIT_CHOICE'},
          {type: 'rule', name: 'star_expressions', alias: 'ex'},
          {type: 'string', value: ':'},
          {
            items: [
              {type: 'TYPE_COMMENT'}
            ],
            repeat: '?', alias: 'tc'
          },
          {type: 'rule', name: 'block', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'else_block'}
            ],
            repeat: '?', alias: 'el'
          }
        ], action: 'CHECK_VERSION($B.ast.stmt, 5, "Async for loops are", $B._PyAST.AsyncFor(t, ex, b, el, NEW_TYPE_COMMENT(p, tc), EXTRA))'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_for_target'}
        ]
      }]
  },
with_stmt:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_with_stmt_indent'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'with'},
          {type: 'string', value: '('},
          {type: 'rule', name: 'with_item', join: ',', alias: 'a', repeat: '+'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: 'CHECK_VERSION($B.ast.stmt, 9, "Parenthesized context managers are", $B._PyAST.With(a, b, NULL, EXTRA))'
      },
      {
        items: [
          {type: 'string', value: 'with'},
          {type: 'rule', name: 'with_item', join: ',', alias: 'a', repeat: '+'},
          {type: 'string', value: ':'},
          {
            items: [
              {type: 'TYPE_COMMENT'}
            ],
            repeat: '?', alias: 'tc'
          },
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: '$B._PyAST.With(a, b, NEW_TYPE_COMMENT(p, tc), EXTRA)'
      },
      {
        items: [
          {type: 'ASYNC'},
          {type: 'string', value: 'with'},
          {type: 'string', value: '('},
          {type: 'rule', name: 'with_item', join: ',', alias: 'a', repeat: '+'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: 'CHECK_VERSION($B.ast.stmt, 5, "Async with statements are", $B._PyAST.AsyncWith(a, b, NULL, EXTRA))'
      },
      {
        items: [
          {type: 'ASYNC'},
          {type: 'string', value: 'with'},
          {type: 'rule', name: 'with_item', join: ',', alias: 'a', repeat: '+'},
          {type: 'string', value: ':'},
          {
            items: [
              {type: 'TYPE_COMMENT'}
            ],
            repeat: '?', alias: 'tc'
          },
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: 'CHECK_VERSION($B.ast.stmt, 5, "Async with statements are", $B._PyAST.AsyncWith(a, b, NEW_TYPE_COMMENT(p, tc), EXTRA))'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_with_stmt'}
        ]
      }]
  },
with_item:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'expression', alias: 'e'},
          {type: 'string', value: 'as'},
          {type: 'rule', name: 'star_target', alias: 't'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: ','}
                ]
              },
              {
                items: [
                  {type: 'string', value: ')'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ':'}
                ]
              }], lookahead: 'positive'
          }
        ], action: '$B._PyAST.withitem(e, t, p.arena)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_with_item'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'expression', alias: 'e'}
        ], action: '$B._PyAST.withitem(e, NULL, p.arena)'
      }]
  },
try_stmt:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_try_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'try'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'},
          {type: 'rule', name: 'finally_block', alias: 'f'}
        ], action: '$B._PyAST.Try(b, NULL, NULL, f, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'try'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'},
          {type: 'rule', name: 'except_block', repeat: '+', alias: 'ex'},
          {
            items: [
              {type: 'rule', name: 'else_block'}
            ],
            repeat: '?', alias: 'el'
          },
          {
            items: [
              {type: 'rule', name: 'finally_block'}
            ],
            repeat: '?', alias: 'f'
          }
        ], action: '$B._PyAST.Try(b, ex, el, f, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'try'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'},
          {type: 'rule', name: 'except_star_block', repeat: '+', alias: 'ex'},
          {
            items: [
              {type: 'rule', name: 'else_block'}
            ],
            repeat: '?', alias: 'el'
          },
          {
            items: [
              {type: 'rule', name: 'finally_block'}
            ],
            repeat: '?', alias: 'f'
          }
        ], action: 'CHECK_VERSION($B.ast.stmt, 11, "Exception groups are", $B._PyAST.TryStar(b, ex, el, f, EXTRA))'
      }]
  },
except_block:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_except_stmt_indent'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'except'},
          {type: 'rule', name: 'expression', alias: 'e'},
          {
            items: [
              {type: 'string', value: 'as'},
              {type: 'NAME', alias: 'z'}
            ],
            repeat: '?', alias: 't', action: 'z'
          },
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: '$B._PyAST.ExceptHandler(e, (t) ? t.id : NULL, b, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'except'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: '$B._PyAST.ExceptHandler(NULL, NULL, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_except_stmt'}
        ]
      }]
  },
except_star_block:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_except_star_stmt_indent'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'except'},
          {type: 'string', value: '*'},
          {type: 'rule', name: 'expression', alias: 'e'},
          {
            items: [
              {type: 'string', value: 'as'},
              {type: 'NAME', alias: 'z'}
            ],
            repeat: '?', alias: 't', action: 'z'
          },
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: '$B._PyAST.ExceptHandler(e, (t) ? t.id : NULL, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_except_stmt'}
        ]
      }]
  },
finally_block:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_finally_stmt'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'finally'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'a'}
        ], action: 'a'
      }]
  },
match_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'match'},
          {type: 'rule', name: 'subject_expr', alias: 'subject'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT'},
          {type: 'rule', name: 'case_block', repeat: '+', alias: 'cases'},
          {type: 'DEDENT'}
        ], action: 'CHECK_VERSION($B.ast.stmt, 10, "Pattern matching is", $B._PyAST.Match(subject, cases, EXTRA))'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_match_stmt'}
        ]
      }]
  },
subject_expr:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'star_named_expression', alias: 'value'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'star_named_expressions', repeat: '?', alias: 'values'}
        ], action: '$B._PyAST.Tuple(CHECK(asdl_expr_seq, $B._PyPegen.seq_insert_in_front(p, value, values)), Load, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'named_expression'}
        ]
      }]
  },
case_block:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_case_block'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'case'},
          {type: 'rule', name: 'patterns', alias: 'pattern'},
          {type: 'rule', name: 'guard', repeat: '?', alias: 'guard'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'body'}
        ], action: '$B._PyAST.match_case(pattern, guard, body, p.arena)'
      }]
  },
guard:
  {
    items: [
      {type: 'string', value: 'if'},
      {type: 'rule', name: 'named_expression', alias: 'guard'}
    ], action: 'guard'
  },
patterns:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'open_sequence_pattern', alias: 'patterns'}
        ], action: '$B._PyAST.MatchSequence(patterns, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'pattern'}
        ]
      }]
  },
pattern:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'as_pattern'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'or_pattern'}
        ]
      }]
  },
as_pattern:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'or_pattern', alias: 'pattern'},
          {type: 'string', value: 'as'},
          {type: 'rule', name: 'pattern_capture_target', alias: 'target'}
        ], action: '$B._PyAST.MatchAs(pattern, target.id, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_as_pattern'}
        ]
      }]
  },
or_pattern:
  {
    items: [
      {type: 'rule', name: 'closed_pattern', join: '|', alias: 'patterns', repeat: '+'}
    ], action: 'asdl_seq_LEN(patterns) == 1 ? asdl_seq_GET(patterns, 0) : $B._PyAST.MatchOr(patterns, EXTRA)'
  },
closed_pattern:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'literal_pattern'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'capture_pattern'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'wildcard_pattern'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'value_pattern'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'group_pattern'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'sequence_pattern'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'mapping_pattern'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'class_pattern'}
        ]
      }]
  },
literal_pattern:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'signed_number', alias: 'value'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '+'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '-'}
                ]
              }], lookahead: 'negative'
          }
        ], action: '$B._PyAST.MatchValue(value, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'complex_number', alias: 'value'}
        ], action: '$B._PyAST.MatchValue(value, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'strings', alias: 'value'}
        ], action: '$B._PyAST.MatchValue(value, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'None'}
        ], action: '$B._PyAST.MatchSingleton(Py_None, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'True'}
        ], action: '$B._PyAST.MatchSingleton(Py_True, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'False'}
        ], action: '$B._PyAST.MatchSingleton(Py_False, EXTRA)'
      }]
  },
literal_expr:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'signed_number'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '+'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '-'}
                ]
              }], lookahead: 'negative'
          }
        ]
      },
      {
        items: [
          {type: 'rule', name: 'complex_number'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'strings'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'None'}
        ], action: '$B._PyAST.Constant(Py_None, NULL, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'True'}
        ], action: '$B._PyAST.Constant(Py_True, NULL, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'False'}
        ], action: '$B._PyAST.Constant(Py_False, NULL, EXTRA)'
      }]
  },
complex_number:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'signed_real_number', alias: 'real'},
          {type: 'string', value: '+'},
          {type: 'rule', name: 'imaginary_number', alias: 'imag'}
        ], action: '$B._PyAST.BinOp(real, Add, imag, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'signed_real_number', alias: 'real'},
          {type: 'string', value: '-'},
          {type: 'rule', name: 'imaginary_number', alias: 'imag'}
        ], action: '$B._PyAST.BinOp(real, Sub, imag, EXTRA)'
      }]
  },
signed_number:
  {
   choices: [
      {
        items: [
          {type: 'NUMBER'}
        ]
      },
      {
        items: [
          {type: 'string', value: '-'},
          {type: 'NUMBER', alias: 'number'}
        ], action: '$B._PyAST.UnaryOp(USub, number, EXTRA)'
      }]
  },
signed_real_number:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'real_number'}
        ]
      },
      {
        items: [
          {type: 'string', value: '-'},
          {type: 'rule', name: 'real_number', alias: 'real'}
        ], action: '$B._PyAST.UnaryOp(USub, real, EXTRA)'
      }]
  },
real_number:
  {
    items: [
      {type: 'NUMBER', alias: 'real'}
    ], action: '$B._PyPegen.ensure_real(p, real)'
  },
imaginary_number:
  {
    items: [
      {type: 'NUMBER', alias: 'imag'}
    ], action: '$B._PyPegen.ensure_imaginary(p, imag)'
  },
capture_pattern:
  {
    items: [
      {type: 'rule', name: 'pattern_capture_target', alias: 'target'}
    ], action: '$B._PyAST.MatchAs(NULL, target.id, EXTRA)'
  },
pattern_capture_target:
  {
    items: [
      {type: 'string', value: '_', lookahead: 'negative'},
      {type: 'NAME', alias: 'name'},
      {
       choices: [
          {
            items: [
              {type: 'string', value: '.'}
            ]
          },
          {
            items: [
              {type: 'string', value: '('}
            ]
          },
          {
            items: [
              {type: 'string', value: '='}
            ]
          }], lookahead: 'negative'
      }
    ], action: '$B._PyPegen.set_expr_context(p, name, Store)'
  },
wildcard_pattern:
  {
    items: [
      {type: 'string', value: '_'}
    ], action: '$B._PyAST.MatchAs(NULL, NULL, EXTRA)'
  },
value_pattern:
  {
    items: [
      {type: 'rule', name: 'attr', alias: 'attr'},
      {
       choices: [
          {
            items: [
              {type: 'string', value: '.'}
            ]
          },
          {
            items: [
              {type: 'string', value: '('}
            ]
          },
          {
            items: [
              {type: 'string', value: '='}
            ]
          }], lookahead: 'negative'
      }
    ], action: '$B._PyAST.MatchValue(attr, EXTRA)'
  },
attr:
  {
    items: [
      {type: 'rule', name: 'name_or_attr', alias: 'value'},
      {type: 'string', value: '.'},
      {type: 'NAME', alias: 'attr'}
    ], action: '$B._PyAST.Attribute(value, attr.id, Load, EXTRA)'
  },
name_or_attr:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'attr'}
        ]
      },
      {
        items: [
          {type: 'NAME'}
        ]
      }]
  },
group_pattern:
  {
    items: [
      {type: 'string', value: '('},
      {type: 'rule', name: 'pattern', alias: 'pattern'},
      {type: 'string', value: ')'}
    ], action: 'pattern'
  },
sequence_pattern:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '['},
          {type: 'rule', name: 'maybe_sequence_pattern', repeat: '?', alias: 'patterns'},
          {type: 'string', value: ']'}
        ], action: '$B._PyAST.MatchSequence(patterns, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'open_sequence_pattern', repeat: '?', alias: 'patterns'},
          {type: 'string', value: ')'}
        ], action: '$B._PyAST.MatchSequence(patterns, EXTRA)'
      }]
  },
open_sequence_pattern:
  {
    items: [
      {type: 'rule', name: 'maybe_star_pattern', alias: 'pattern'},
      {type: 'string', value: ','},
      {type: 'rule', name: 'maybe_sequence_pattern', repeat: '?', alias: 'patterns'}
    ], action: '$B._PyPegen.seq_insert_in_front(p, pattern, patterns)'
  },
maybe_sequence_pattern:
  {
    items: [
      {type: 'rule', name: 'maybe_star_pattern', join: ',', alias: 'patterns', repeat: '+'},
      {type: 'string', value: ',', repeat: '?'}
    ], action: 'patterns'
  },
maybe_star_pattern:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'star_pattern'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'pattern'}
        ]
      }]
  },
star_pattern:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'pattern_capture_target', alias: 'target'}
        ], action: '$B._PyAST.MatchStar(target.id, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'wildcard_pattern'}
        ], action: '$B._PyAST.MatchStar(NULL, EXTRA)'
      }]
  },
mapping_pattern:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'string', value: '}'}
        ], action: '$B._PyAST.MatchMapping(NULL, NULL, NULL, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'rule', name: 'double_star_pattern', alias: 'rest'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: '}'}
        ], action: '$B._PyAST.MatchMapping(NULL, NULL, rest.id, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'rule', name: 'items_pattern', alias: 'items'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'double_star_pattern', alias: 'rest'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: '}'}
        ], action: '$B._PyAST.MatchMapping( CHECK(asdl_expr_seq, $B._PyPegen.get_pattern_keys(p, items)), CHECK(asdl_pattern_seq, $B._PyPegen.get_patterns(p, items)), rest.id, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'rule', name: 'items_pattern', alias: 'items'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: '}'}
        ], action: '$B._PyAST.MatchMapping( CHECK(asdl_expr_seq, $B._PyPegen.get_pattern_keys(p, items)), CHECK(asdl_pattern_seq, $B._PyPegen.get_patterns(p, items)), NULL, EXTRA)'
      }]
  },
items_pattern:
  {
    items: [
      {type: 'rule', name: 'key_value_pattern', join: ',', repeat: '+'}
    ]
  },
key_value_pattern:
  {
    items: [
      {
       choices: [
          {
            items: [
              {type: 'rule', name: 'literal_expr'}
            ]
          },
          {
            items: [
              {type: 'rule', name: 'attr'}
            ]
          }], alias: 'key'
      },
      {type: 'string', value: ':'},
      {type: 'rule', name: 'pattern', alias: 'pattern'}
    ], action: '$B._PyPegen.key_pattern_pair(p, key, pattern)'
  },
double_star_pattern:
  {
    items: [
      {type: 'string', value: '**'},
      {type: 'rule', name: 'pattern_capture_target', alias: 'target'}
    ], action: 'target'
  },
class_pattern:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'name_or_attr', alias: 'cls'},
          {type: 'string', value: '('},
          {type: 'string', value: ')'}
        ], action: '$B._PyAST.MatchClass(cls, NULL, NULL, NULL, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'name_or_attr', alias: 'cls'},
          {type: 'string', value: '('},
          {type: 'rule', name: 'positional_patterns', alias: 'patterns'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')'}
        ], action: '$B._PyAST.MatchClass(cls, patterns, NULL, NULL, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'name_or_attr', alias: 'cls'},
          {type: 'string', value: '('},
          {type: 'rule', name: 'keyword_patterns', alias: 'keywords'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')'}
        ], action: '$B._PyAST.MatchClass( cls, NULL, CHECK(asdl_identifier_seq, $B._PyPegen.map_names_to_ids(p, CHECK(asdl_expr_seq, $B._PyPegen.get_pattern_keys(p, keywords)))), CHECK(asdl_pattern_seq, $B._PyPegen.get_patterns(p, keywords)), EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'name_or_attr', alias: 'cls'},
          {type: 'string', value: '('},
          {type: 'rule', name: 'positional_patterns', alias: 'patterns'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'keyword_patterns', alias: 'keywords'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')'}
        ], action: '$B._PyAST.MatchClass( cls, patterns, CHECK(asdl_identifier_seq, $B._PyPegen.map_names_to_ids(p, CHECK(asdl_expr_seq, $B._PyPegen.get_pattern_keys(p, keywords)))), CHECK(asdl_pattern_seq, $B._PyPegen.get_patterns(p, keywords)), EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_class_pattern'}
        ]
      }]
  },
positional_patterns:
  {
    items: [
      {type: 'rule', name: 'pattern', join: ',', alias: 'args', repeat: '+'}
    ], action: 'args'
  },
keyword_patterns:
  {
    items: [
      {type: 'rule', name: 'keyword_pattern', join: ',', repeat: '+'}
    ]
  },
keyword_pattern:
  {
    items: [
      {type: 'NAME', alias: 'arg'},
      {type: 'string', value: '='},
      {type: 'rule', name: 'pattern', alias: 'value'}
    ], action: '$B._PyPegen.key_pattern_pair(p, arg, value)'
  },
expressions:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'expression', alias: 'a'},
          {
            items: [
              {type: 'string', value: ','},
              {type: 'rule', name: 'expression', alias: 'c'}
            ],
            repeat: '+', alias: 'b', action: 'c'
          },
          {
            items: [
              {type: 'string', value: ','}
            ],
            repeat: '?'
          }
        ], action: '$B._PyAST.Tuple(CHECK(asdl_expr_seq, $B._PyPegen.seq_insert_in_front(p, a, b)), Load, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'string', value: ','}
        ], action: '$B._PyAST.Tuple(CHECK(asdl_expr_seq, $B._PyPegen.singleton_seq(p, a)), Load, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'expression'}
        ]
      }]
  },
expression:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_expression'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'invalid_legacy_expression'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'disjunction', alias: 'a'},
          {type: 'string', value: 'if'},
          {type: 'rule', name: 'disjunction', alias: 'b'},
          {type: 'string', value: 'else'},
          {type: 'rule', name: 'expression', alias: 'c'}
        ], action: '$B._PyAST.IfExp(b, a, c, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'disjunction'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'lambdef'}
        ]
      }]
  },
yield_expr:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'yield'},
          {type: 'string', value: 'from'},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: '$B._PyAST.YieldFrom(a, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'yield'},
          {
            items: [
              {type: 'rule', name: 'star_expressions'}
            ],
            repeat: '?', alias: 'a'
          }
        ], action: '$B._PyAST.Yield(a, EXTRA)'
      }]
  },
star_expressions:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'star_expression', alias: 'a'},
          {
            items: [
              {type: 'string', value: ','},
              {type: 'rule', name: 'star_expression', alias: 'c'}
            ],
            repeat: '+', alias: 'b', action: 'c'
          },
          {
            items: [
              {type: 'string', value: ','}
            ],
            repeat: '?'
          }
        ], action: '$B._PyAST.Tuple(CHECK(asdl_expr_seq, $B._PyPegen.seq_insert_in_front(p, a, b)), Load, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'star_expression', alias: 'a'},
          {type: 'string', value: ','}
        ], action: '$B._PyAST.Tuple(CHECK(asdl_expr_seq, $B._PyPegen.singleton_seq(p, a)), Load, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'star_expression'}
        ]
      }]
  },
star_expression:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'bitwise_or', alias: 'a'}
        ], action: '$B._PyAST.Starred(a, Load, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'expression'}
        ]
      }]
  },
star_named_expressions:
  {
    items: [
      {type: 'rule', name: 'star_named_expression', join: ',', alias: 'a', repeat: '+'},
      {
        items: [
          {type: 'string', value: ','}
        ],
        repeat: '?'
      }
    ], action: 'a'
  },
star_named_expression:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'bitwise_or', alias: 'a'}
        ], action: '$B._PyAST.Starred(a, Load, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'named_expression'}
        ]
      }]
  },
assignment_expression:
  {
    items: [
      {type: 'NAME', alias: 'a'},
      {type: 'string', value: ':='},
      {type: 'COMMIT_CHOICE'},
      {type: 'rule', name: 'expression', alias: 'b'}
    ], action: 'CHECK_VERSION($B.ast.expr, 8, "Assignment expressions are", $B._PyAST.NamedExpr(CHECK($B.ast.expr, $B._PyPegen.set_expr_context(p, a, Store)), b, EXTRA))'
  },
named_expression:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'assignment_expression'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'invalid_named_expression'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'expression'},
          {type: 'string', value: ':=', lookahead: 'negative'}
        ]
      }]
  },
disjunction:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'conjunction', alias: 'a'},
          {
            items: [
              {type: 'string', value: 'or'},
              {type: 'rule', name: 'conjunction', alias: 'c'}
            ],
            repeat: '+', alias: 'b', action: 'c'
          }
        ], action: '$B._PyAST.BoolOp( Or, CHECK(asdl_expr_seq, $B._PyPegen.seq_insert_in_front(p, a, b)), EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'conjunction'}
        ]
      }]
  },
conjunction:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'inversion', alias: 'a'},
          {
            items: [
              {type: 'string', value: 'and'},
              {type: 'rule', name: 'inversion', alias: 'c'}
            ],
            repeat: '+', alias: 'b', action: 'c'
          }
        ], action: '$B._PyAST.BoolOp( And, CHECK(asdl_expr_seq, $B._PyPegen.seq_insert_in_front(p, a, b)), EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'inversion'}
        ]
      }]
  },
inversion:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'not'},
          {type: 'rule', name: 'inversion', alias: 'a'}
        ], action: '$B._PyAST.UnaryOp(Not, a, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'comparison'}
        ]
      }]
  },
comparison:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'bitwise_or', alias: 'a'},
          {type: 'rule', name: 'compare_op_bitwise_or_pair', repeat: '+', alias: 'b'}
        ], action: '$B._PyAST.Compare( a, CHECK(asdl_int_seq, $B._PyPegen.get_cmpops(p, b)), CHECK(asdl_expr_seq, $B._PyPegen.get_exprs(p, b)), EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'bitwise_or'}
        ]
      }]
  },
compare_op_bitwise_or_pair:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'eq_bitwise_or'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'noteq_bitwise_or'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'lte_bitwise_or'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'lt_bitwise_or'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'gte_bitwise_or'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'gt_bitwise_or'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'notin_bitwise_or'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'in_bitwise_or'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'isnot_bitwise_or'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'is_bitwise_or'}
        ]
      }]
  },
eq_bitwise_or:
  {
    items: [
      {type: 'string', value: '=='},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: '$B._PyPegen.cmpop_expr_pair(p, Eq, a)'
  },
noteq_bitwise_or:
  {
    items: [
      {
        items: [
          {type: 'string', value: '!=', alias: 'tok'}
        ], action: '$B._PyPegen.check_barry_as_flufl(p, tok) ? NULL : tok'
      },
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: '$B._PyPegen.cmpop_expr_pair(p, NotEq, a)'
  },
lte_bitwise_or:
  {
    items: [
      {type: 'string', value: '<='},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: '$B._PyPegen.cmpop_expr_pair(p, LtE, a)'
  },
lt_bitwise_or:
  {
    items: [
      {type: 'string', value: '<'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: '$B._PyPegen.cmpop_expr_pair(p, Lt, a)'
  },
gte_bitwise_or:
  {
    items: [
      {type: 'string', value: '>='},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: '$B._PyPegen.cmpop_expr_pair(p, GtE, a)'
  },
gt_bitwise_or:
  {
    items: [
      {type: 'string', value: '>'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: '$B._PyPegen.cmpop_expr_pair(p, Gt, a)'
  },
notin_bitwise_or:
  {
    items: [
      {type: 'string', value: 'not'},
      {type: 'string', value: 'in'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: '$B._PyPegen.cmpop_expr_pair(p, NotIn, a)'
  },
in_bitwise_or:
  {
    items: [
      {type: 'string', value: 'in'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: '$B._PyPegen.cmpop_expr_pair(p, In, a)'
  },
isnot_bitwise_or:
  {
    items: [
      {type: 'string', value: 'is'},
      {type: 'string', value: 'not'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: '$B._PyPegen.cmpop_expr_pair(p, IsNot, a)'
  },
is_bitwise_or:
  {
    items: [
      {type: 'string', value: 'is'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: '$B._PyPegen.cmpop_expr_pair(p, Is, a)'
  },
bitwise_or:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'bitwise_or', alias: 'a'},
          {type: 'string', value: '|'},
          {type: 'rule', name: 'bitwise_xor', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, BitOr, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'bitwise_xor'}
        ]
      }]
  },
bitwise_xor:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'bitwise_xor', alias: 'a'},
          {type: 'string', value: '^'},
          {type: 'rule', name: 'bitwise_and', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, BitXor, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'bitwise_and'}
        ]
      }]
  },
bitwise_and:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'bitwise_and', alias: 'a'},
          {type: 'string', value: '&'},
          {type: 'rule', name: 'shift_expr', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, BitAnd, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'shift_expr'}
        ]
      }]
  },
shift_expr:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'shift_expr', alias: 'a'},
          {type: 'string', value: '<<'},
          {type: 'rule', name: 'sum', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, LShift, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'shift_expr', alias: 'a'},
          {type: 'string', value: '>>'},
          {type: 'rule', name: 'sum', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, RShift, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'sum'}
        ]
      }]
  },
sum:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'sum', alias: 'a'},
          {type: 'string', value: '+'},
          {type: 'rule', name: 'term', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, Add, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'sum', alias: 'a'},
          {type: 'string', value: '-'},
          {type: 'rule', name: 'term', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, Sub, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'term'}
        ]
      }]
  },
term:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'term', alias: 'a'},
          {type: 'string', value: '*'},
          {type: 'rule', name: 'factor', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, Mult, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'term', alias: 'a'},
          {type: 'string', value: '/'},
          {type: 'rule', name: 'factor', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, Div, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'term', alias: 'a'},
          {type: 'string', value: '//'},
          {type: 'rule', name: 'factor', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, FloorDiv, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'term', alias: 'a'},
          {type: 'string', value: '%'},
          {type: 'rule', name: 'factor', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, Mod, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'term', alias: 'a'},
          {type: 'string', value: '@'},
          {type: 'rule', name: 'factor', alias: 'b'}
        ], action: 'CHECK_VERSION($B.ast.expr, 5, "The \'@\' operator is", $B._PyAST.BinOp(a, MatMult, b, EXTRA))'
      },
      {
        items: [
          {type: 'rule', name: 'factor'}
        ]
      }]
  },
factor:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '+'},
          {type: 'rule', name: 'factor', alias: 'a'}
        ], action: '$B._PyAST.UnaryOp(UAdd, a, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: '-'},
          {type: 'rule', name: 'factor', alias: 'a'}
        ], action: '$B._PyAST.UnaryOp(USub, a, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: '~'},
          {type: 'rule', name: 'factor', alias: 'a'}
        ], action: '$B._PyAST.UnaryOp(Invert, a, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'power'}
        ]
      }]
  },
power:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'await_primary', alias: 'a'},
          {type: 'string', value: '**'},
          {type: 'rule', name: 'factor', alias: 'b'}
        ], action: '$B._PyAST.BinOp(a, Pow, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'await_primary'}
        ]
      }]
  },
await_primary:
  {
   choices: [
      {
        items: [
          {type: 'AWAIT'},
          {type: 'rule', name: 'primary', alias: 'a'}
        ], action: 'CHECK_VERSION($B.ast.expr, 5, "Await expressions are", $B._PyAST.Await(a, EXTRA))'
      },
      {
        items: [
          {type: 'rule', name: 'primary'}
        ]
      }]
  },
primary:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'primary', alias: 'a'},
          {type: 'string', value: '.'},
          {type: 'NAME', alias: 'b'}
        ], action: '$B._PyAST.Attribute(a, b.id, Load, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'primary', alias: 'a'},
          {type: 'rule', name: 'genexp', alias: 'b'}
        ], action: '$B._PyAST.Call(a, CHECK(asdl_expr_seq, $B._PyPegen.singleton_seq(p, b)), NULL, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'primary', alias: 'a'},
          {type: 'string', value: '('},
          {
            items: [
              {type: 'rule', name: 'arguments'}
            ],
            repeat: '?', alias: 'b'
          },
          {type: 'string', value: ')'}
        ], action: '$B._PyAST.Call(a, (b) ? b.args : NULL, (b) ? b.keywords : NULL, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'primary', alias: 'a'},
          {type: 'string', value: '['},
          {type: 'rule', name: 'slices', alias: 'b'},
          {type: 'string', value: ']'}
        ], action: '$B._PyAST.Subscript(a, b, Load, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'atom'}
        ]
      }]
  },
slices:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'slice', alias: 'a'},
          {type: 'string', value: ',', lookahead: 'negative'}
        ], action: 'a'
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'slice'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'starred_expression'}
                ]
              }], join: ',', alias: 'a',
            repeat: '+'
          },
          {
            items: [
              {type: 'string', value: ','}
            ],
            repeat: '?'
          }
        ], action: '$B._PyAST.Tuple(a, Load, EXTRA)'
      }]
  },
slice:
  {
   choices: [
      {
        items: [
          {
            items: [
              {type: 'rule', name: 'expression'}
            ],
            repeat: '?', alias: 'a'
          },
          {type: 'string', value: ':'},
          {
            items: [
              {type: 'rule', name: 'expression'}
            ],
            repeat: '?', alias: 'b'
          },
          {
            items: [
              {type: 'string', value: ':'},
              {
                items: [
                  {type: 'rule', name: 'expression'}
                ],
                repeat: '?', alias: 'd'
              }
            ],
            repeat: '?', alias: 'c', action: 'd'
          }
        ], action: '$B._PyAST.Slice(a, b, c, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'named_expression', alias: 'a'}
        ], action: 'a'
      }]
  },
atom:
  {
   choices: [
      {
        items: [
          {type: 'NAME'}
        ]
      },
      {
        items: [
          {type: 'string', value: 'True'}
        ], action: '$B._PyAST.Constant(Py_True, NULL, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'False'}
        ], action: '$B._PyAST.Constant(Py_False, NULL, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: 'None'}
        ], action: '$B._PyAST.Constant(Py_None, NULL, EXTRA)'
      },
      {
        items: [
          {type: 'STRING', lookahead: 'positive'},
          {type: 'rule', name: 'strings'}
        ]
      },
      {
        items: [
          {type: 'NUMBER'}
        ]
      },
      {
        items: [
          {type: 'string', value: '(', lookahead: 'positive'},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'tuple'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'group'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'genexp'}
                ]
              }]
          }
        ]
      },
      {
        items: [
          {type: 'string', value: '[', lookahead: 'positive'},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'list'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'listcomp'}
                ]
              }]
          }
        ]
      },
      {
        items: [
          {type: 'string', value: '{', lookahead: 'positive'},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'dict'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'set'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'dictcomp'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'setcomp'}
                ]
              }]
          }
        ]
      },
      {
        items: [
          {type: 'string', value: '...'}
        ], action: '$B._PyAST.Constant(Py_Ellipsis, NULL, EXTRA)'
      }]
  },
group:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '('},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'yield_expr'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'named_expression'}
                ]
              }], alias: 'a'
          },
          {type: 'string', value: ')'}
        ], action: 'a'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_group'}
        ]
      }]
  },
lambdef:
  {
    items: [
      {type: 'string', value: 'lambda'},
      {
        items: [
          {type: 'rule', name: 'lambda_params'}
        ],
        repeat: '?', alias: 'a'
      },
      {type: 'string', value: ':'},
      {type: 'rule', name: 'expression', alias: 'b'}
    ], action: '$B._PyAST.Lambda((a) ? a : CHECK($B.ast.arguments, $B._PyPegen.empty_arguments(p)), b, EXTRA)'
  },
lambda_params:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_lambda_parameters'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'lambda_parameters'}
        ]
      }]
  },
lambda_parameters:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'lambda_slash_no_default', alias: 'a'},
          {type: 'rule', name: 'lambda_param_no_default', repeat: '*', alias: 'b'},
          {type: 'rule', name: 'lambda_param_with_default', repeat: '*', alias: 'c'},
          {
            items: [
              {type: 'rule', name: 'lambda_star_etc'}
            ],
            repeat: '?', alias: 'd'
          }
        ], action: 'CHECK_VERSION($B.ast.arguments, 8, "Positional-only parameters are", $B._PyPegen.make_arguments(p, a, NULL, b, c, d))'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_slash_with_default', alias: 'a'},
          {type: 'rule', name: 'lambda_param_with_default', repeat: '*', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'lambda_star_etc'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: 'CHECK_VERSION($B.ast.arguments, 8, "Positional-only parameters are", $B._PyPegen.make_arguments(p, NULL, a, NULL, b, c))'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param_no_default', repeat: '+', alias: 'a'},
          {type: 'rule', name: 'lambda_param_with_default', repeat: '*', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'lambda_star_etc'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: '$B._PyPegen.make_arguments(p, NULL, NULL, a, b, c)'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param_with_default', repeat: '+', alias: 'a'},
          {
            items: [
              {type: 'rule', name: 'lambda_star_etc'}
            ],
            repeat: '?', alias: 'b'
          }
        ], action: '$B._PyPegen.make_arguments(p, NULL, NULL, NULL, a, b)'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_star_etc', alias: 'a'}
        ], action: '$B._PyPegen.make_arguments(p, NULL, NULL, NULL, NULL, a)'
      }]
  },
lambda_slash_no_default:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'lambda_param_no_default', repeat: '+', alias: 'a'},
          {type: 'string', value: '/'},
          {type: 'string', value: ','}
        ], action: 'a'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param_no_default', repeat: '+', alias: 'a'},
          {type: 'string', value: '/'},
          {type: 'string', value: ':', lookahead: 'positive'}
        ], action: 'a'
      }]
  },
lambda_slash_with_default:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'lambda_param_no_default', repeat: '*', alias: 'a'},
          {type: 'rule', name: 'lambda_param_with_default', repeat: '+', alias: 'b'},
          {type: 'string', value: '/'},
          {type: 'string', value: ','}
        ], action: '$B._PyPegen.slash_with_default(p, a, b)'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param_no_default', repeat: '*', alias: 'a'},
          {type: 'rule', name: 'lambda_param_with_default', repeat: '+', alias: 'b'},
          {type: 'string', value: '/'},
          {type: 'string', value: ':', lookahead: 'positive'}
        ], action: '$B._PyPegen.slash_with_default(p, a, b)'
      }]
  },
lambda_star_etc:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_lambda_star_etc'}
        ]
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'lambda_param_no_default', alias: 'a'},
          {type: 'rule', name: 'lambda_param_maybe_default', repeat: '*', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'lambda_kwds'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: '$B._PyPegen.star_etc(p, a, b, c)'
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'lambda_param_maybe_default', repeat: '+', alias: 'b'},
          {
            items: [
              {type: 'rule', name: 'lambda_kwds'}
            ],
            repeat: '?', alias: 'c'
          }
        ], action: '$B._PyPegen.star_etc(p, NULL, b, c)'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_kwds', alias: 'a'}
        ], action: '$B._PyPegen.star_etc(p, NULL, NULL, a)'
      }]
  },
lambda_kwds:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_lambda_kwds'}
        ]
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'lambda_param_no_default', alias: 'a'}
        ], action: 'a'
      }]
  },
lambda_param_no_default:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'lambda_param', alias: 'a'},
          {type: 'string', value: ','}
        ], action: 'a'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param', alias: 'a'},
          {type: 'string', value: ':', lookahead: 'positive'}
        ], action: 'a'
      }]
  },
lambda_param_with_default:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'lambda_param', alias: 'a'},
          {type: 'rule', name: 'default', alias: 'c'},
          {type: 'string', value: ','}
        ], action: '$B._PyPegen.name_default_pair(p, a, c, NULL)'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param', alias: 'a'},
          {type: 'rule', name: 'default', alias: 'c'},
          {type: 'string', value: ':', lookahead: 'positive'}
        ], action: '$B._PyPegen.name_default_pair(p, a, c, NULL)'
      }]
  },
lambda_param_maybe_default:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'lambda_param', alias: 'a'},
          {type: 'rule', name: 'default', repeat: '?', alias: 'c'},
          {type: 'string', value: ','}
        ], action: '$B._PyPegen.name_default_pair(p, a, c, NULL)'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param', alias: 'a'},
          {type: 'rule', name: 'default', repeat: '?', alias: 'c'},
          {type: 'string', value: ':', lookahead: 'positive'}
        ], action: '$B._PyPegen.name_default_pair(p, a, c, NULL)'
      }]
  },
lambda_param:
  {
    items: [
      {type: 'NAME', alias: 'a'}
    ], action: '$B._PyAST.arg(a.id, NULL, NULL, EXTRA)'
  },
strings:
  {
    items: [
      {type: 'STRING', repeat: '+', alias: 'a'}
    ], action: '$B._PyPegen.concatenate_strings(p, a)'
  },
list:
  {
    items: [
      {type: 'string', value: '['},
      {
        items: [
          {type: 'rule', name: 'star_named_expressions'}
        ],
        repeat: '?', alias: 'a'
      },
      {type: 'string', value: ']'}
    ], action: '$B._PyAST.List(a, Load, EXTRA)'
  },
tuple:
  {
    items: [
      {type: 'string', value: '('},
      {
        items: [
          {type: 'rule', name: 'star_named_expression', alias: 'y'},
          {type: 'string', value: ','},
          {
            items: [
              {type: 'rule', name: 'star_named_expressions'}
            ],
            repeat: '?', alias: 'z'
          }
        ],
        repeat: '?', alias: 'a', action: '$B._PyPegen.seq_insert_in_front(p, y, z)'
      },
      {type: 'string', value: ')'}
    ], action: '$B._PyAST.Tuple(a, Load, EXTRA)'
  },
set:
  {
    items: [
      {type: 'string', value: '{'},
      {type: 'rule', name: 'star_named_expressions', alias: 'a'},
      {type: 'string', value: '}'}
    ], action: '$B._PyAST.Set(a, EXTRA)'
  },
dict:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '{'},
          {
            items: [
              {type: 'rule', name: 'double_starred_kvpairs'}
            ],
            repeat: '?', alias: 'a'
          },
          {type: 'string', value: '}'}
        ], action: '$B._PyAST.Dict( CHECK(asdl_expr_seq, $B._PyPegen.get_keys(p, a)), CHECK(asdl_expr_seq, $B._PyPegen.get_values(p, a)), EXTRA)'
      },
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'rule', name: 'invalid_double_starred_kvpairs'},
          {type: 'string', value: '}'}
        ]
      }]
  },
double_starred_kvpairs:
  {
    items: [
      {type: 'rule', name: 'double_starred_kvpair', join: ',', alias: 'a', repeat: '+'},
      {
        items: [
          {type: 'string', value: ','}
        ],
        repeat: '?'
      }
    ], action: 'a'
  },
double_starred_kvpair:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'bitwise_or', alias: 'a'}
        ], action: '$B._PyPegen.key_value_pair(p, NULL, a)'
      },
      {
        items: [
          {type: 'rule', name: 'kvpair'}
        ]
      }]
  },
kvpair:
  {
    items: [
      {type: 'rule', name: 'expression', alias: 'a'},
      {type: 'string', value: ':'},
      {type: 'rule', name: 'expression', alias: 'b'}
    ], action: '$B._PyPegen.key_value_pair(p, a, b)'
  },
for_if_clauses:
  {
    items: [
      {type: 'rule', name: 'for_if_clause', repeat: '+', alias: 'a'}
    ], action: 'a'
  },
for_if_clause:
  {
   choices: [
      {
        items: [
          {type: 'ASYNC'},
          {type: 'string', value: 'for'},
          {type: 'rule', name: 'star_targets', alias: 'a'},
          {type: 'string', value: 'in'},
          {type: 'COMMIT_CHOICE'},
          {type: 'rule', name: 'disjunction', alias: 'b'},
          {
            items: [
              {type: 'string', value: 'if'},
              {type: 'rule', name: 'disjunction', alias: 'z'}
            ],
            repeat: '*', alias: 'c', action: 'z'
          }
        ], action: 'CHECK_VERSION($B.ast.comprehension, 6, "Async comprehensions are", $B._PyAST.comprehension(a, b, c, 1, p.arena))'
      },
      {
        items: [
          {type: 'string', value: 'for'},
          {type: 'rule', name: 'star_targets', alias: 'a'},
          {type: 'string', value: 'in'},
          {type: 'COMMIT_CHOICE'},
          {type: 'rule', name: 'disjunction', alias: 'b'},
          {
            items: [
              {type: 'string', value: 'if'},
              {type: 'rule', name: 'disjunction', alias: 'z'}
            ],
            repeat: '*', alias: 'c', action: 'z'
          }
        ], action: '$B._PyAST.comprehension(a, b, c, 0, p.arena)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_for_target'}
        ]
      }]
  },
listcomp:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '['},
          {type: 'rule', name: 'named_expression', alias: 'a'},
          {type: 'rule', name: 'for_if_clauses', alias: 'b'},
          {type: 'string', value: ']'}
        ], action: '$B._PyAST.ListComp(a, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_comprehension'}
        ]
      }]
  },
setcomp:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'rule', name: 'named_expression', alias: 'a'},
          {type: 'rule', name: 'for_if_clauses', alias: 'b'},
          {type: 'string', value: '}'}
        ], action: '$B._PyAST.SetComp(a, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_comprehension'}
        ]
      }]
  },
genexp:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '('},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'assignment_expression'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'expression'},
                  {type: 'string', value: ':=', lookahead: 'negative'}
                ]
              }], alias: 'a'
          },
          {type: 'rule', name: 'for_if_clauses', alias: 'b'},
          {type: 'string', value: ')'}
        ], action: '$B._PyAST.GeneratorExp(a, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_comprehension'}
        ]
      }]
  },
dictcomp:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'rule', name: 'kvpair', alias: 'a'},
          {type: 'rule', name: 'for_if_clauses', alias: 'b'},
          {type: 'string', value: '}'}
        ], action: '$B._PyAST.DictComp(a.key, a.value, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_dict_comprehension'}
        ]
      }]
  },
arguments:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'args', alias: 'a'},
          {
            items: [
              {type: 'string', value: ','}
            ],
            repeat: '?'
          },
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: 'a'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_arguments'}
        ]
      }]
  },
args:
  {
   choices: [
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'starred_expression'}
                ]
              },
              {
                items: [
                  {
                   choices: [
                      {
                        items: [
                          {type: 'rule', name: 'assignment_expression'}
                        ]
                      },
                      {
                        items: [
                          {type: 'rule', name: 'expression'},
                          {type: 'string', value: ':=', lookahead: 'negative'}
                        ]
                      }]
                  },
                  {type: 'string', value: '=', lookahead: 'negative'}
                ]
              }], join: ',', alias: 'a',
            repeat: '+'
          },
          {
            items: [
              {type: 'string', value: ','},
              {type: 'rule', name: 'kwargs', alias: 'k'}
            ],
            repeat: '?', alias: 'b', action: 'k'
          }
        ], action: '$B._PyPegen.collect_call_seqs(p, a, b, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'kwargs', alias: 'a'}
        ], action: '$B._PyAST.Call($B._PyPegen.dummy_name(p), CHECK_NULL_ALLOWED(asdl_expr_seq, $B._PyPegen.seq_extract_starred_exprs(p, a)), CHECK_NULL_ALLOWED(asdl_keyword_seq, $B._PyPegen.seq_delete_starred_exprs(p, a)), EXTRA)'
      }]
  },
kwargs:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'kwarg_or_starred', join: ',', alias: 'a', repeat: '+'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'kwarg_or_double_starred', join: ',', alias: 'b', repeat: '+'}
        ], action: '$B._PyPegen.join_sequences(p, a, b)'
      },
      {
        items: [
          {type: 'rule', name: 'kwarg_or_starred', join: ',', repeat: '+'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'kwarg_or_double_starred', join: ',', repeat: '+'}
        ]
      }]
  },
starred_expression:
  {
    items: [
      {type: 'string', value: '*'},
      {type: 'rule', name: 'expression', alias: 'a'}
    ], action: '$B._PyAST.Starred(a, Load, EXTRA)'
  },
kwarg_or_starred:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_kwarg'}
        ]
      },
      {
        items: [
          {type: 'NAME', alias: 'a'},
          {type: 'string', value: '='},
          {type: 'rule', name: 'expression', alias: 'b'}
        ], action: '$B._PyPegen.keyword_or_starred(p, CHECK($B.ast.keyword, $B._PyAST.keyword(a.id, b, EXTRA)), 1)'
      },
      {
        items: [
          {type: 'rule', name: 'starred_expression', alias: 'a'}
        ], action: '$B._PyPegen.keyword_or_starred(p, a, 0)'
      }]
  },
kwarg_or_double_starred:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_kwarg'}
        ]
      },
      {
        items: [
          {type: 'NAME', alias: 'a'},
          {type: 'string', value: '='},
          {type: 'rule', name: 'expression', alias: 'b'}
        ], action: '$B._PyPegen.keyword_or_starred(p, CHECK($B.ast.keyword, $B._PyAST.keyword(a.id, b, EXTRA)), 1)'
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: '$B._PyPegen.keyword_or_starred(p, CHECK($B.ast.keyword, $B._PyAST.keyword(NULL, a, EXTRA)), 1)'
      }]
  },
star_targets:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'star_target', alias: 'a'},
          {type: 'string', value: ',', lookahead: 'negative'}
        ], action: 'a'
      },
      {
        items: [
          {type: 'rule', name: 'star_target', alias: 'a'},
          {
            items: [
              {type: 'string', value: ','},
              {type: 'rule', name: 'star_target', alias: 'c'}
            ],
            repeat: '*', alias: 'b', action: 'c'
          },
          {
            items: [
              {type: 'string', value: ','}
            ],
            repeat: '?'
          }
        ], action: '$B._PyAST.Tuple(CHECK(asdl_expr_seq, $B._PyPegen.seq_insert_in_front(p, a, b)), Store, EXTRA)'
      }]
  },
star_targets_list_seq:
  {
    items: [
      {type: 'rule', name: 'star_target', join: ',', alias: 'a', repeat: '+'},
      {
        items: [
          {type: 'string', value: ','}
        ],
        repeat: '?'
      }
    ], action: 'a'
  },
star_targets_tuple_seq:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'star_target', alias: 'a'},
          {
            items: [
              {type: 'string', value: ','},
              {type: 'rule', name: 'star_target', alias: 'c'}
            ],
            repeat: '+', alias: 'b', action: 'c'
          },
          {
            items: [
              {type: 'string', value: ','}
            ],
            repeat: '?'
          }
        ], action: ' $B._PyPegen.seq_insert_in_front(p, a, b)'
      },
      {
        items: [
          {type: 'rule', name: 'star_target', alias: 'a'},
          {type: 'string', value: ','}
        ], action: ' $B._PyPegen.singleton_seq(p, a)'
      }]
  },
star_target:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '*'},
          {
            items: [
              {type: 'string', value: '*', lookahead: 'negative'},
              {type: 'rule', name: 'star_target'}
            ], alias: 'a'
          }
        ], action: '$B._PyAST.Starred(CHECK($B.ast.expr, $B._PyPegen.set_expr_context(p, a, Store)), Store, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'target_with_star_atom'}
        ]
      }]
  },
target_with_star_atom:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '.'},
          {type: 'NAME', alias: 'b'},
          {type: 'rule', name: 't_lookahead', lookahead: 'negative'}
        ], action: '$B._PyAST.Attribute(a, b.id, Store, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '['},
          {type: 'rule', name: 'slices', alias: 'b'},
          {type: 'string', value: ']'},
          {type: 'rule', name: 't_lookahead', lookahead: 'negative'}
        ], action: '$B._PyAST.Subscript(a, b, Store, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'star_atom'}
        ]
      }]
  },
star_atom:
  {
   choices: [
      {
        items: [
          {type: 'NAME', alias: 'a'}
        ], action: '$B._PyPegen.set_expr_context(p, a, Store)'
      },
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'target_with_star_atom', alias: 'a'},
          {type: 'string', value: ')'}
        ], action: '$B._PyPegen.set_expr_context(p, a, Store)'
      },
      {
        items: [
          {type: 'string', value: '('},
          {
            items: [
              {type: 'rule', name: 'star_targets_tuple_seq'}
            ],
            repeat: '?', alias: 'a'
          },
          {type: 'string', value: ')'}
        ], action: '$B._PyAST.Tuple(a, Store, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: '['},
          {
            items: [
              {type: 'rule', name: 'star_targets_list_seq'}
            ],
            repeat: '?', alias: 'a'
          },
          {type: 'string', value: ']'}
        ], action: '$B._PyAST.List(a, Store, EXTRA)'
      }]
  },
single_target:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'single_subscript_attribute_target'}
        ]
      },
      {
        items: [
          {type: 'NAME', alias: 'a'}
        ], action: '$B._PyPegen.set_expr_context(p, a, Store)'
      },
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'single_target', alias: 'a'},
          {type: 'string', value: ')'}
        ], action: 'a'
      }]
  },
single_subscript_attribute_target:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '.'},
          {type: 'NAME', alias: 'b'},
          {type: 'rule', name: 't_lookahead', lookahead: 'negative'}
        ], action: '$B._PyAST.Attribute(a, b.id, Store, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '['},
          {type: 'rule', name: 'slices', alias: 'b'},
          {type: 'string', value: ']'},
          {type: 'rule', name: 't_lookahead', lookahead: 'negative'}
        ], action: '$B._PyAST.Subscript(a, b, Store, EXTRA)'
      }]
  },
t_primary:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '.'},
          {type: 'NAME', alias: 'b'},
          {type: 'rule', name: 't_lookahead', lookahead: 'positive'}
        ], action: '$B._PyAST.Attribute(a, b.id, Load, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '['},
          {type: 'rule', name: 'slices', alias: 'b'},
          {type: 'string', value: ']'},
          {type: 'rule', name: 't_lookahead', lookahead: 'positive'}
        ], action: '$B._PyAST.Subscript(a, b, Load, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'rule', name: 'genexp', alias: 'b'},
          {type: 'rule', name: 't_lookahead', lookahead: 'positive'}
        ], action: '$B._PyAST.Call(a, CHECK(asdl_expr_seq, $B._PyPegen.singleton_seq(p, b)), NULL, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '('},
          {
            items: [
              {type: 'rule', name: 'arguments'}
            ],
            repeat: '?', alias: 'b'
          },
          {type: 'string', value: ')'},
          {type: 'rule', name: 't_lookahead', lookahead: 'positive'}
        ], action: '$B._PyAST.Call(a, (b) ? b.args : NULL, (b) ? b.keywords : NULL, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'atom', alias: 'a'},
          {type: 'rule', name: 't_lookahead', lookahead: 'positive'}
        ], action: 'a'
      }]
  },
t_lookahead:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '('}
        ]
      },
      {
        items: [
          {type: 'string', value: '['}
        ]
      },
      {
        items: [
          {type: 'string', value: '.'}
        ]
      }]
  },
del_targets:
  {
    items: [
      {type: 'rule', name: 'del_target', join: ',', alias: 'a', repeat: '+'},
      {
        items: [
          {type: 'string', value: ','}
        ],
        repeat: '?'
      }
    ], action: 'a'
  },
del_target:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '.'},
          {type: 'NAME', alias: 'b'},
          {type: 'rule', name: 't_lookahead', lookahead: 'negative'}
        ], action: '$B._PyAST.Attribute(a, b.id, Del, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '['},
          {type: 'rule', name: 'slices', alias: 'b'},
          {type: 'string', value: ']'},
          {type: 'rule', name: 't_lookahead', lookahead: 'negative'}
        ], action: '$B._PyAST.Subscript(a, b, Del, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'del_t_atom'}
        ]
      }]
  },
del_t_atom:
  {
   choices: [
      {
        items: [
          {type: 'NAME', alias: 'a'}
        ], action: '$B._PyPegen.set_expr_context(p, a, Del)'
      },
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'del_target', alias: 'a'},
          {type: 'string', value: ')'}
        ], action: '$B._PyPegen.set_expr_context(p, a, Del)'
      },
      {
        items: [
          {type: 'string', value: '('},
          {
            items: [
              {type: 'rule', name: 'del_targets'}
            ],
            repeat: '?', alias: 'a'
          },
          {type: 'string', value: ')'}
        ], action: '$B._PyAST.Tuple(a, Del, EXTRA)'
      },
      {
        items: [
          {type: 'string', value: '['},
          {
            items: [
              {type: 'rule', name: 'del_targets'}
            ],
            repeat: '?', alias: 'a'
          },
          {type: 'string', value: ']'}
        ], action: '$B._PyAST.List(a, Del, EXTRA)'
      }]
  },
type_expressions:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'expression', join: ',', alias: 'a', repeat: '+'},
          {type: 'string', value: ','},
          {type: 'string', value: '*'},
          {type: 'rule', name: 'expression', alias: 'b'},
          {type: 'string', value: ','},
          {type: 'string', value: '**'},
          {type: 'rule', name: 'expression', alias: 'c'}
        ], action: '$B._PyPegen.seq_append_to_end( p, CHECK(asdl_seq, $B._PyPegen.seq_append_to_end(p, a, b)), c)'
      },
      {
        items: [
          {type: 'rule', name: 'expression', join: ',', alias: 'a', repeat: '+'},
          {type: 'string', value: ','},
          {type: 'string', value: '*'},
          {type: 'rule', name: 'expression', alias: 'b'}
        ], action: '$B._PyPegen.seq_append_to_end(p, a, b)'
      },
      {
        items: [
          {type: 'rule', name: 'expression', join: ',', alias: 'a', repeat: '+'},
          {type: 'string', value: ','},
          {type: 'string', value: '**'},
          {type: 'rule', name: 'expression', alias: 'b'}
        ], action: '$B._PyPegen.seq_append_to_end(p, a, b)'
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'string', value: ','},
          {type: 'string', value: '**'},
          {type: 'rule', name: 'expression', alias: 'b'}
        ], action: '$B._PyPegen.seq_append_to_end( p, CHECK(asdl_seq, $B._PyPegen.singleton_seq(p, a)), b)'
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: '$B._PyPegen.singleton_seq(p, a)'
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: '$B._PyPegen.singleton_seq(p, a)'
      },
      {
        items: [
          {type: 'rule', name: 'expression', join: ',', alias: 'a', repeat: '+'}
        ], action: 'a'
      }]
  },
func_type_comment:
  {
   choices: [
      {
        items: [
          {type: 'NEWLINE'},
          {type: 'TYPE_COMMENT', alias: 't'},
          {
            items: [
              {type: 'NEWLINE'},
              {type: 'INDENT'}
            ], lookahead: 'positive'
          }
        ], action: 't'
      },
      {
        items: [
          {type: 'rule', name: 'invalid_double_type_comments'}
        ]
      },
      {
        items: [
          {type: 'TYPE_COMMENT'}
        ]
      }]
  },
invalid_arguments:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'args', alias: 'a'},
          {type: 'string', value: ','},
          {type: 'string', value: '*'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "iterable argument unpacking follows keyword argument unpacking")'
      },
      {
        items: [
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'rule', name: 'for_if_clauses', alias: 'b'},
          {type: 'string', value: ','},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'args'}
                ]
              }],
            repeat: '?'
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, $B._PyPegen.get_last_comprehension_item(PyPegen_last_item(b, $B.ast.comprehension)), "Generator expression must be parenthesized")'
      },
      {
        items: [
          {type: 'NAME', alias: 'a'},
          {type: 'string', value: '=', alias: 'b'},
          {type: 'rule', name: 'expression'},
          {type: 'rule', name: 'for_if_clauses'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, "invalid syntax. Maybe you meant \'==\' or \':=\' instead of \'=\'?")'
      },
      {
        items: [
          {type: 'rule', name: 'args', alias: 'a'},
          {type: 'rule', name: 'for_if_clauses', alias: 'b'}
        ], action: '$B._PyPegen.nonparen_genexp_in_call(p, a, b)'
      },
      {
        items: [
          {type: 'rule', name: 'args'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'rule', name: 'for_if_clauses', alias: 'b'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, $B._PyPegen.get_last_comprehension_item(PyPegen_last_item(b, $B.ast.comprehension)), "Generator expression must be parenthesized")'
      },
      {
        items: [
          {type: 'rule', name: 'args', alias: 'a'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'args'}
        ], action: '$B._PyPegen.arguments_parsing_error(p, a)'
      }]
  },
invalid_kwarg:
  {
   choices: [
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'string', value: 'True'}
                ]
              },
              {
                items: [
                  {type: 'string', value: 'False'}
                ]
              },
              {
                items: [
                  {type: 'string', value: 'None'}
                ]
              }], alias: 'a'
          },
          {type: 'string', value: '=', alias: 'b'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, "cannot assign to %s", PyBytes_AS_STRING(a.bytes))'
      },
      {
        items: [
          {type: 'NAME', alias: 'a'},
          {type: 'string', value: '=', alias: 'b'},
          {type: 'rule', name: 'expression'},
          {type: 'rule', name: 'for_if_clauses'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, "invalid syntax. Maybe you meant \'==\' or \':=\' instead of \'=\'?")'
      },
      {
        items: [
          {
            items: [
              {type: 'NAME'},
              {type: 'string', value: '='}
            ], lookahead: 'negative'
          },
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'string', value: '=', alias: 'b'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE( a, b, "expression cannot contain assignment, perhaps you meant \"==\"?")'
      }]
  },
expression_without_invalid:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'disjunction', alias: 'a'},
          {type: 'string', value: 'if'},
          {type: 'rule', name: 'disjunction', alias: 'b'},
          {type: 'string', value: 'else'},
          {type: 'rule', name: 'expression', alias: 'c'}
        ], action: '$B._PyAST.IfExp(b, a, c, EXTRA)'
      },
      {
        items: [
          {type: 'rule', name: 'disjunction'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'lambdef'}
        ]
      }]
  },
invalid_legacy_expression:
  {
    items: [
      {type: 'NAME', alias: 'a'},
      {type: 'string', value: '(', lookahead: 'negative'},
      {type: 'rule', name: 'star_expressions', alias: 'b'}
    ], action: '$B._PyPegen.check_legacy_stmt(p, a) ? RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, "Missing parentheses in call to \'%U\'. Did you mean %U(...)?", a.id, a.id) : NULL'
  },
invalid_expression:
  {
   choices: [
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'NAME'},
                  {type: 'STRING'}
                ]
              },
              {
                items: [
                  {type: 'SOFT_KEYWORD'}
                ]
              }], lookahead: 'negative'
          },
          {type: 'rule', name: 'disjunction', alias: 'a'},
          {type: 'rule', name: 'expression_without_invalid', alias: 'b'}
        ], action: '$B._PyPegen.check_legacy_stmt(p, a) ? NULL : p.tokens[p.mark-1].level == 0 ? NULL : RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, "invalid syntax. Perhaps you forgot a comma?")'
      },
      {
        items: [
          {type: 'rule', name: 'disjunction', alias: 'a'},
          {type: 'string', value: 'if'},
          {type: 'rule', name: 'disjunction', alias: 'b'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: 'else'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ':'}
                ]
              }], lookahead: 'negative'
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, "expected \'else\' after \'if\' expression")'
      }]
  },
invalid_named_expression:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'string', value: ':='},
          {type: 'rule', name: 'expression'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION( a, "cannot use assignment expressions with %s", $B._PyPegen.get_expr_name(a))'
      },
      {
        items: [
          {type: 'NAME', alias: 'a'},
          {type: 'string', value: '='},
          {type: 'rule', name: 'bitwise_or', alias: 'b'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '='}
                ]
              },
              {
                items: [
                  {type: 'string', value: ':='}
                ]
              }], lookahead: 'negative'
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, "invalid syntax. Maybe you meant \'==\' or \':=\' instead of \'=\'?")'
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'list'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'tuple'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'genexp'}
                ]
              },
              {
                items: [
                  {type: 'string', value: 'True'}
                ]
              },
              {
                items: [
                  {type: 'string', value: 'None'}
                ]
              },
              {
                items: [
                  {type: 'string', value: 'False'}
                ]
              }], lookahead: 'negative'
          },
          {type: 'rule', name: 'bitwise_or', alias: 'a'},
          {type: 'string', value: '=', alias: 'b'},
          {type: 'rule', name: 'bitwise_or'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '='}
                ]
              },
              {
                items: [
                  {type: 'string', value: ':='}
                ]
              }], lookahead: 'negative'
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "cannot assign to %s here. Maybe you meant \'==\' instead of \'=\'?", $B._PyPegen.get_expr_name(a))'
      }]
  },
invalid_assignment:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_ann_assign_target', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'expression'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION( a, "only single target (not %s) can be annotated", $B._PyPegen.get_expr_name(a) )'
      },
      {
        items: [
          {type: 'rule', name: 'star_named_expression', alias: 'a'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'star_named_expressions', repeat: '*'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'expression'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "only single target (not tuple) can be annotated")'
      },
      {
        items: [
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'expression'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "illegal target for annotation")'
      },
      {
        items: [
          {
            items: [
              {type: 'rule', name: 'star_targets'},
              {type: 'string', value: '='}
            ],
            repeat: '*'
          },
          {type: 'rule', name: 'star_expressions', alias: 'a'},
          {type: 'string', value: '='}
        ], action: 'RAISE_SYNTAX_ERROR_INVALID_TARGET(STAR_TARGETS, a)'
      },
      {
        items: [
          {
            items: [
              {type: 'rule', name: 'star_targets'},
              {type: 'string', value: '='}
            ],
            repeat: '*'
          },
          {type: 'rule', name: 'yield_expr', alias: 'a'},
          {type: 'string', value: '='}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "assignment to yield expression not possible")'
      },
      {
        items: [
          {type: 'rule', name: 'star_expressions', alias: 'a'},
          {type: 'rule', name: 'augassign'},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'yield_expr'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'star_expressions'}
                ]
              }]
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION( a, "\'%s\' is an illegal expression for augmented assignment", $B._PyPegen.get_expr_name(a) )'
      }]
  },
invalid_ann_assign_target:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'list'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'tuple'}
        ]
      },
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'invalid_ann_assign_target', alias: 'a'},
          {type: 'string', value: ')'}
        ], action: 'a'
      }]
  },
invalid_del_stmt:
  {
    items: [
      {type: 'string', value: 'del'},
      {type: 'rule', name: 'star_expressions', alias: 'a'}
    ], action: 'RAISE_SYNTAX_ERROR_INVALID_TARGET(DEL_TARGETS, a)'
  },
invalid_block:
  {
    items: [
      {type: 'NEWLINE'},
      {type: 'INDENT', lookahead: 'negative'}
    ], action: 'RAISE_INDENTATION_ERROR("expected an indented block")'
  },
invalid_comprehension:
  {
   choices: [
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '['}
                ]
              },
              {
                items: [
                  {type: 'string', value: '('}
                ]
              },
              {
                items: [
                  {type: 'string', value: '{'}
                ]
              }]
          },
          {type: 'rule', name: 'starred_expression', alias: 'a'},
          {type: 'rule', name: 'for_if_clauses'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "iterable unpacking cannot be used in comprehension")'
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '['}
                ]
              },
              {
                items: [
                  {type: 'string', value: '{'}
                ]
              }]
          },
          {type: 'rule', name: 'star_named_expression', alias: 'a'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'star_named_expressions', alias: 'b'},
          {type: 'rule', name: 'for_if_clauses'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, PyPegen_last_item(b, $B.ast.expr), "did you forget parentheses around the comprehension target?")'
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '['}
                ]
              },
              {
                items: [
                  {type: 'string', value: '{'}
                ]
              }]
          },
          {type: 'rule', name: 'star_named_expression', alias: 'a'},
          {type: 'string', value: ',', alias: 'b'},
          {type: 'rule', name: 'for_if_clauses'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, "did you forget parentheses around the comprehension target?")'
      }]
  },
invalid_dict_comprehension:
  {
    items: [
      {type: 'string', value: '{'},
      {type: 'string', value: '**', alias: 'a'},
      {type: 'rule', name: 'bitwise_or'},
      {type: 'rule', name: 'for_if_clauses'},
      {type: 'string', value: '}'}
    ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "dict unpacking cannot be used in dict comprehension")'
  },
invalid_parameters:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'param_no_default', repeat: '*'},
          {type: 'rule', name: 'invalid_parameters_helper'},
          {type: 'rule', name: 'param_no_default', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "non-default argument follows default argument")'
      },
      {
        items: [
          {type: 'rule', name: 'param_no_default', repeat: '*'},
          {type: 'string', value: '(', alias: 'a'},
          {type: 'rule', name: 'param_no_default', repeat: '+'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')', alias: 'b'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, "Function parameters cannot be parenthesized")'
      },
      {
        items: [
          {type: 'string', value: '/', alias: 'a'},
          {type: 'string', value: ','}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "at least one argument must precede /")'
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'slash_no_default'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'slash_with_default'}
                ]
              }]
          },
          {type: 'rule', name: 'param_maybe_default', repeat: '*'},
          {type: 'string', value: '/', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "/ may appear only once")'
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'slash_no_default'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'slash_with_default'}
                ]
              }],
            repeat: '?'
          },
          {type: 'rule', name: 'param_maybe_default', repeat: '*'},
          {type: 'string', value: '*'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: ','}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'param_no_default'}
                ]
              }]
          },
          {type: 'rule', name: 'param_maybe_default', repeat: '*'},
          {type: 'string', value: '/', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "/ must be ahead of *")'
      },
      {
        items: [
          {type: 'rule', name: 'param_maybe_default', repeat: '+'},
          {type: 'string', value: '/'},
          {type: 'string', value: '*', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "expected comma between / and *")'
      }]
  },
invalid_default:
  {
    items: [
      {type: 'string', value: '=', alias: 'a'},
      {
       choices: [
          {
            items: [
              {type: 'string', value: ')'}
            ]
          },
          {
            items: [
              {type: 'string', value: ','}
            ]
          }], lookahead: 'positive'
      }
    ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "expected default value expression")'
  },
invalid_star_etc:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '*', alias: 'a'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: ')'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ','},
                  {
                   choices: [
                      {
                        items: [
                          {type: 'string', value: ')'}
                        ]
                      },
                      {
                        items: [
                          {type: 'string', value: '**'}
                        ]
                      }]
                  }
                ]
              }]
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "named arguments must follow bare *")'
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'string', value: ','},
          {type: 'TYPE_COMMENT'}
        ], action: 'RAISE_SYNTAX_ERROR("bare * has associated type comment")'
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'param'},
          {type: 'string', value: '=', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "var-positional argument cannot have default value")'
      },
      {
        items: [
          {type: 'string', value: '*'},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'param_no_default'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ','}
                ]
              }]
          },
          {type: 'rule', name: 'param_maybe_default', repeat: '*'},
          {type: 'string', value: '*', alias: 'a'},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'param_no_default'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ','}
                ]
              }]
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "* argument may appear only once")'
      }]
  },
invalid_kwds:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'param'},
          {type: 'string', value: '=', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "var-keyword argument cannot have default value")'
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'param'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'param', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "arguments cannot follow var-keyword argument")'
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'param'},
          {type: 'string', value: ','},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '*'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '**'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '/'}
                ]
              }], alias: 'a'
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "arguments cannot follow var-keyword argument")'
      }]
  },
invalid_parameters_helper:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'slash_with_default', alias: 'a'}
        ], action: '$B._PyPegen.singleton_seq(p, a)'
      },
      {
        items: [
          {type: 'rule', name: 'param_with_default', repeat: '+'}
        ]
      }]
  },
invalid_lambda_parameters:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'lambda_param_no_default', repeat: '*'},
          {type: 'rule', name: 'invalid_lambda_parameters_helper'},
          {type: 'rule', name: 'lambda_param_no_default', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "non-default argument follows default argument")'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param_no_default', repeat: '*'},
          {type: 'string', value: '(', alias: 'a'},
          {type: 'rule', name: 'lambda_param', join: ',', repeat: '+'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')', alias: 'b'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE(a, b, "Lambda expression parameters cannot be parenthesized")'
      },
      {
        items: [
          {type: 'string', value: '/', alias: 'a'},
          {type: 'string', value: ','}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "at least one argument must precede /")'
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'lambda_slash_no_default'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'lambda_slash_with_default'}
                ]
              }]
          },
          {type: 'rule', name: 'lambda_param_maybe_default', repeat: '*'},
          {type: 'string', value: '/', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "/ may appear only once")'
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'lambda_slash_no_default'}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'lambda_slash_with_default'}
                ]
              }],
            repeat: '?'
          },
          {type: 'rule', name: 'lambda_param_maybe_default', repeat: '*'},
          {type: 'string', value: '*'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: ','}
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'lambda_param_no_default'}
                ]
              }]
          },
          {type: 'rule', name: 'lambda_param_maybe_default', repeat: '*'},
          {type: 'string', value: '/', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "/ must be ahead of *")'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param_maybe_default', repeat: '+'},
          {type: 'string', value: '/'},
          {type: 'string', value: '*', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "expected comma between / and *")'
      }]
  },
invalid_lambda_parameters_helper:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'lambda_slash_with_default', alias: 'a'}
        ], action: '$B._PyPegen.singleton_seq(p, a)'
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param_with_default', repeat: '+'}
        ]
      }]
  },
invalid_lambda_star_etc:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '*'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: ':'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ','},
                  {
                   choices: [
                      {
                        items: [
                          {type: 'string', value: ':'}
                        ]
                      },
                      {
                        items: [
                          {type: 'string', value: '**'}
                        ]
                      }]
                  }
                ]
              }]
          }
        ], action: 'RAISE_SYNTAX_ERROR("named arguments must follow bare *")'
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'lambda_param'},
          {type: 'string', value: '=', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "var-positional argument cannot have default value")'
      },
      {
        items: [
          {type: 'string', value: '*'},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'lambda_param_no_default'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ','}
                ]
              }]
          },
          {type: 'rule', name: 'lambda_param_maybe_default', repeat: '*'},
          {type: 'string', value: '*', alias: 'a'},
          {
           choices: [
              {
                items: [
                  {type: 'rule', name: 'lambda_param_no_default'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ','}
                ]
              }]
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "* argument may appear only once")'
      }]
  },
invalid_lambda_kwds:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'lambda_param'},
          {type: 'string', value: '=', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "var-keyword argument cannot have default value")'
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'lambda_param'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'lambda_param', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "arguments cannot follow var-keyword argument")'
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'lambda_param'},
          {type: 'string', value: ','},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '*'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '**'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '/'}
                ]
              }], alias: 'a'
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "arguments cannot follow var-keyword argument")'
      }]
  },
invalid_double_type_comments:
  {
    items: [
      {type: 'TYPE_COMMENT'},
      {type: 'NEWLINE'},
      {type: 'TYPE_COMMENT'},
      {type: 'NEWLINE'},
      {type: 'INDENT'}
    ], action: 'RAISE_SYNTAX_ERROR("Cannot have two type comments on def")'
  },
invalid_with_item:
  {
    items: [
      {type: 'rule', name: 'expression'},
      {type: 'string', value: 'as'},
      {type: 'rule', name: 'expression', alias: 'a'},
      {
       choices: [
          {
            items: [
              {type: 'string', value: ','}
            ]
          },
          {
            items: [
              {type: 'string', value: ')'}
            ]
          },
          {
            items: [
              {type: 'string', value: ':'}
            ]
          }], lookahead: 'positive'
      }
    ], action: 'RAISE_SYNTAX_ERROR_INVALID_TARGET(STAR_TARGETS, a)'
  },
invalid_for_target:
  {
    items: [
      {type: 'ASYNC', repeat: '?'},
      {type: 'string', value: 'for'},
      {type: 'rule', name: 'star_expressions', alias: 'a'}
    ], action: 'RAISE_SYNTAX_ERROR_INVALID_TARGET(FOR_TARGETS, a)'
  },
invalid_group:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'starred_expression', alias: 'a'},
          {type: 'string', value: ')'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "cannot use starred expression here")'
      },
      {
        items: [
          {type: 'string', value: '('},
          {type: 'string', value: '**', alias: 'a'},
          {type: 'rule', name: 'expression'},
          {type: 'string', value: ')'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "cannot use double starred expression here")'
      }]
  },
invalid_import_from_targets:
  {
    items: [
      {type: 'rule', name: 'import_from_as_names'},
      {type: 'string', value: ','},
      {type: 'NEWLINE'}
    ], action: 'RAISE_SYNTAX_ERROR("trailing comma not allowed without surrounding parentheses")'
  },
invalid_with_stmt:
  {
   choices: [
      {
        items: [
          {
            items: [
              {type: 'ASYNC'}
            ],
            repeat: '?'
          },
          {type: 'string', value: 'with'},
          {
            items: [
              {type: 'rule', name: 'expression'},
              {
                items: [
                  {type: 'string', value: 'as'},
                  {type: 'rule', name: 'star_target'}
                ],
                repeat: '?'
              }
            ], join: ',',
            repeat: '+'
          },
          {type: 'NEWLINE'}
        ], action: 'RAISE_SYNTAX_ERROR("expected \':\'")'
      },
      {
        items: [
          {
            items: [
              {type: 'ASYNC'}
            ],
            repeat: '?'
          },
          {type: 'string', value: 'with'},
          {type: 'string', value: '('},
          {
            items: [
              {type: 'rule', name: 'expressions'},
              {
                items: [
                  {type: 'string', value: 'as'},
                  {type: 'rule', name: 'star_target'}
                ],
                repeat: '?'
              }
            ], join: ',',
            repeat: '+'
          },
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')'},
          {type: 'NEWLINE'}
        ], action: 'RAISE_SYNTAX_ERROR("expected \':\'")'
      }]
  },
invalid_with_stmt_indent:
  {
   choices: [
      {
        items: [
          {
            items: [
              {type: 'ASYNC'}
            ],
            repeat: '?'
          },
          {type: 'string', value: 'with', alias: 'a'},
          {
            items: [
              {type: 'rule', name: 'expression'},
              {
                items: [
                  {type: 'string', value: 'as'},
                  {type: 'rule', name: 'star_target'}
                ],
                repeat: '?'
              }
            ], join: ',',
            repeat: '+'
          },
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'with\' statement on line %d", a.lineno)'
      },
      {
        items: [
          {
            items: [
              {type: 'ASYNC'}
            ],
            repeat: '?'
          },
          {type: 'string', value: 'with', alias: 'a'},
          {type: 'string', value: '('},
          {
            items: [
              {type: 'rule', name: 'expressions'},
              {
                items: [
                  {type: 'string', value: 'as'},
                  {type: 'rule', name: 'star_target'}
                ],
                repeat: '?'
              }
            ], join: ',',
            repeat: '+'
          },
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'with\' statement on line %d", a.lineno)'
      }]
  },
invalid_try_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'try', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'try\' statement on line %d", a.lineno)'
      },
      {
        items: [
          {type: 'string', value: 'try'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: 'except'}
                ]
              },
              {
                items: [
                  {type: 'string', value: 'finally'}
                ]
              }], lookahead: 'negative'
          }
        ], action: 'RAISE_SYNTAX_ERROR("expected \'except\' or \'finally\' block")'
      },
      {
        items: [
          {type: 'string', value: 'try', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', repeat: '*'},
          {
           choices: [
              {
                items: [
                  {
                    items: [
                      {type: 'rule', name: 'except_block', repeat: '+'},
                      {type: 'rule', name: 'except_star_block'}
                    ]
                  }
                ]
              },
              {
                items: [
                  {
                    items: [
                      {type: 'rule', name: 'except_star_block', repeat: '+'},
                      {type: 'rule', name: 'except_block'}
                    ]
                  }
                ]
              }]
          },
          {type: 'rule', name: 'block', repeat: '*'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "cannot have both \'except\' and \'except\' on the same \'try\'")'
      }]
  },
invalid_except_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'except'},
          {type: 'string', value: '*', repeat: '?'},
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'expressions'},
          {
            items: [
              {type: 'string', value: 'as'},
              {type: 'NAME'}
            ],
            repeat: '?'
          },
          {type: 'string', value: ':'}
        ], action: 'RAISE_SYNTAX_ERROR_STARTING_FROM(a, "multiple exception types must be parenthesized")'
      },
      {
        items: [
          {type: 'string', value: 'except', alias: 'a'},
          {type: 'string', value: '*', repeat: '?'},
          {type: 'rule', name: 'expression'},
          {
            items: [
              {type: 'string', value: 'as'},
              {type: 'NAME'}
            ],
            repeat: '?'
          },
          {type: 'NEWLINE'}
        ], action: 'RAISE_SYNTAX_ERROR("expected \':\'")'
      },
      {
        items: [
          {type: 'string', value: 'except', alias: 'a'},
          {type: 'NEWLINE'}
        ], action: 'RAISE_SYNTAX_ERROR("expected \':\'")'
      },
      {
        items: [
          {type: 'string', value: 'except', alias: 'a'},
          {type: 'string', value: '*'},
          {
           choices: [
              {
                items: [
                  {type: 'NEWLINE'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ':'}
                ]
              }]
          }
        ], action: 'RAISE_SYNTAX_ERROR("expected one or more exception types")'
      }]
  },
invalid_finally_stmt:
  {
    items: [
      {type: 'string', value: 'finally', alias: 'a'},
      {type: 'string', value: ':'},
      {type: 'NEWLINE'},
      {type: 'INDENT', lookahead: 'negative'}
    ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'finally\' statement on line %d", a.lineno)'
  },
invalid_except_stmt_indent:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'except', alias: 'a'},
          {type: 'rule', name: 'expression'},
          {
            items: [
              {type: 'string', value: 'as'},
              {type: 'NAME'}
            ],
            repeat: '?'
          },
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'except\' statement on line %d", a.lineno)'
      },
      {
        items: [
          {type: 'string', value: 'except', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'except\' statement on line %d", a.lineno)'
      }]
  },
invalid_except_star_stmt_indent:
  {
    items: [
      {type: 'string', value: 'except', alias: 'a'},
      {type: 'string', value: '*'},
      {type: 'rule', name: 'expression'},
      {
        items: [
          {type: 'string', value: 'as'},
          {type: 'NAME'}
        ],
        repeat: '?'
      },
      {type: 'string', value: ':'},
      {type: 'NEWLINE'},
      {type: 'INDENT', lookahead: 'negative'}
    ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'except\' statement on line %d", a.lineno)'
  },
invalid_match_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'match'},
          {type: 'rule', name: 'subject_expr'},
          {type: 'NEWLINE'}
        ], action: 'CHECK_VERSION(void, 10, "Pattern matching is", RAISE_SYNTAX_ERROR("expected \':\'") )'
      },
      {
        items: [
          {type: 'string', value: 'match', alias: 'a'},
          {type: 'rule', name: 'subject_expr', alias: 'subject'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'match\' statement on line %d", a.lineno)'
      }]
  },
invalid_case_block:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'case'},
          {type: 'rule', name: 'patterns'},
          {type: 'rule', name: 'guard', repeat: '?'},
          {type: 'NEWLINE'}
        ], action: 'RAISE_SYNTAX_ERROR("expected \':\'")'
      },
      {
        items: [
          {type: 'string', value: 'case', alias: 'a'},
          {type: 'rule', name: 'patterns'},
          {type: 'rule', name: 'guard', repeat: '?'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'case\' statement on line %d", a.lineno)'
      }]
  },
invalid_as_pattern:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'or_pattern'},
          {type: 'string', value: 'as'},
          {type: 'string', value: '_', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "cannot use \'_\' as a target")'
      },
      {
        items: [
          {type: 'rule', name: 'or_pattern'},
          {type: 'string', value: 'as'},
          {type: 'NAME', lookahead: 'negative'},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "invalid pattern target")'
      }]
  },
invalid_class_pattern:
  {
    items: [
      {type: 'rule', name: 'name_or_attr'},
      {type: 'string', value: '('},
      {type: 'rule', name: 'invalid_class_argument_pattern', alias: 'a'}
    ], action: 'RAISE_SYNTAX_ERROR_KNOWN_RANGE( PyPegen_first_item(a, $B.ast.pattern), PyPegen_last_item(a, $B.ast.pattern), "positional patterns follow keyword patterns")'
  },
invalid_class_argument_pattern:
  {
    items: [
      {
        items: [
          {type: 'rule', name: 'positional_patterns'},
          {type: 'string', value: ','}
        ],
        repeat: '?'
      },
      {type: 'rule', name: 'keyword_patterns'},
      {type: 'string', value: ','},
      {type: 'rule', name: 'positional_patterns', alias: 'a'}
    ], action: 'a'
  },
invalid_if_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'if'},
          {type: 'rule', name: 'named_expression'},
          {type: 'NEWLINE'}
        ], action: 'RAISE_SYNTAX_ERROR("expected \':\'")'
      },
      {
        items: [
          {type: 'string', value: 'if', alias: 'a'},
          {type: 'rule', name: 'named_expression', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'if\' statement on line %d", a.lineno)'
      }]
  },
invalid_elif_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'elif'},
          {type: 'rule', name: 'named_expression'},
          {type: 'NEWLINE'}
        ], action: 'RAISE_SYNTAX_ERROR("expected \':\'")'
      },
      {
        items: [
          {type: 'string', value: 'elif', alias: 'a'},
          {type: 'rule', name: 'named_expression'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'elif\' statement on line %d", a.lineno)'
      }]
  },
invalid_else_stmt:
  {
    items: [
      {type: 'string', value: 'else', alias: 'a'},
      {type: 'string', value: ':'},
      {type: 'NEWLINE'},
      {type: 'INDENT', lookahead: 'negative'}
    ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'else\' statement on line %d", a.lineno)'
  },
invalid_while_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'while'},
          {type: 'rule', name: 'named_expression'},
          {type: 'NEWLINE'}
        ], action: 'RAISE_SYNTAX_ERROR("expected \':\'")'
      },
      {
        items: [
          {type: 'string', value: 'while', alias: 'a'},
          {type: 'rule', name: 'named_expression'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'while\' statement on line %d", a.lineno)'
      }]
  },
invalid_for_stmt:
  {
   choices: [
      {
        items: [
          {
            items: [
              {type: 'ASYNC'}
            ],
            repeat: '?'
          },
          {type: 'string', value: 'for'},
          {type: 'rule', name: 'star_targets'},
          {type: 'string', value: 'in'},
          {type: 'rule', name: 'star_expressions'},
          {type: 'NEWLINE'}
        ], action: 'RAISE_SYNTAX_ERROR("expected \':\'")'
      },
      {
        items: [
          {
            items: [
              {type: 'ASYNC'}
            ],
            repeat: '?'
          },
          {type: 'string', value: 'for', alias: 'a'},
          {type: 'rule', name: 'star_targets'},
          {type: 'string', value: 'in'},
          {type: 'rule', name: 'star_expressions'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after \'for\' statement on line %d", a.lineno)'
      }]
  },
invalid_def_raw:
  {
    items: [
      {
        items: [
          {type: 'ASYNC'}
        ],
        repeat: '?'
      },
      {type: 'string', value: 'def', alias: 'a'},
      {type: 'NAME'},
      {type: 'string', value: '('},
      {
        items: [
          {type: 'rule', name: 'params'}
        ],
        repeat: '?'
      },
      {type: 'string', value: ')'},
      {
        items: [
          {type: 'string', value: '->'},
          {type: 'rule', name: 'expression'}
        ],
        repeat: '?'
      },
      {type: 'string', value: ':'},
      {type: 'NEWLINE'},
      {type: 'INDENT', lookahead: 'negative'}
    ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after function definition on line %d", a.lineno)'
  },
invalid_class_def_raw:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'class'},
          {type: 'NAME'},
          {
            items: [
              {type: 'string', value: '('},
              {
                items: [
                  {type: 'rule', name: 'arguments'}
                ],
                repeat: '?'
              },
              {type: 'string', value: ')'}
            ],
            repeat: '?'
          },
          {type: 'NEWLINE'}
        ], action: 'RAISE_SYNTAX_ERROR("expected \':\'")'
      },
      {
        items: [
          {type: 'string', value: 'class', alias: 'a'},
          {type: 'NAME'},
          {
            items: [
              {type: 'string', value: '('},
              {
                items: [
                  {type: 'rule', name: 'arguments'}
                ],
                repeat: '?'
              },
              {type: 'string', value: ')'}
            ],
            repeat: '?'
          },
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: 'RAISE_INDENTATION_ERROR("expected an indented block after class definition on line %d", a.lineno)'
      }]
  },
invalid_double_starred_kvpairs:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'double_starred_kvpair', join: ',', repeat: '+'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'invalid_kvpair'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'expression'},
          {type: 'string', value: ':'},
          {type: 'string', value: '*', alias: 'a'},
          {type: 'rule', name: 'bitwise_or'}
        ], action: 'RAISE_SYNTAX_ERROR_STARTING_FROM(a, "cannot use a starred expression in a dictionary value")'
      },
      {
        items: [
          {type: 'rule', name: 'expression'},
          {type: 'string', value: ':', alias: 'a'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '}'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ','}
                ]
              }], lookahead: 'positive'
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "expression expected after dictionary key and \':\'")'
      }]
  },
invalid_kvpair:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'expression', alias: 'a'},
          {
            items: [
              {type: 'string', value: ':'}
            ], lookahead: 'negative'
          }
        ], action: 'RAISE_ERROR_KNOWN_LOCATION(p, PyExc_SyntaxError, a.lineno, a.end_col_offset - 1, a.end_lineno, -1, "\':\' expected after dictionary key")'
      },
      {
        items: [
          {type: 'rule', name: 'expression'},
          {type: 'string', value: ':'},
          {type: 'string', value: '*', alias: 'a'},
          {type: 'rule', name: 'bitwise_or'}
        ], action: 'RAISE_SYNTAX_ERROR_STARTING_FROM(a, "cannot use a starred expression in a dictionary value")'
      },
      {
        items: [
          {type: 'rule', name: 'expression'},
          {type: 'string', value: ':', alias: 'a'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '}'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ','}
                ]
              }], lookahead: 'positive'
          }
        ], action: 'RAISE_SYNTAX_ERROR_KNOWN_LOCATION(a, "expression expected after dictionary key and \':\'")'
      }]
  },
}
for(var rule_name in grammar){
    grammar[rule_name].name = rule_name
    if(grammar[rule_name].choices){
        grammar[rule_name].choices.forEach(function(item, rank){
            item.parent_rule = rule_name
            item.rank = rank
        })
    }
}
})(__BRYTHON__)
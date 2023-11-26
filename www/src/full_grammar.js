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
    ], action: (L) => $B._PyPegen.make_module(L.p, L.a)
  },
interactive:
  {
    items: [
      {type: 'rule', name: 'statement_newline', alias: 'a'}
    ], action: (L) => $B._PyAST.Interactive(L.a, L.p.arena)
  },
eval:
  {
    items: [
      {type: 'rule', name: 'expressions', alias: 'a'},
      {type: 'NEWLINE', repeat: '*'},
      {type: 'ENDMARKER'}
    ], action: (L) => $B._PyAST.Expression(L.a, L.p.arena)
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
    ], action: (L) => $B._PyAST.FunctionType(L.a, L.b, L.p.arena)
  },
statements:
  {
    items: [
      {type: 'rule', name: 'statement', repeat: '+', alias: 'a'}
    ], action: (L) => $B._PyPegen.seq_flatten(L.p, L.a)
  },
statement:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'compound_stmt', alias: 'a'}
        ], action: (L) => $B._PyPegen.singleton_seq(L.p, L.a)
      },
      {
        items: [
          {type: 'rule', name: 'simple_stmts', alias: 'a'}
        ], action: (L) => L.a
      }]
  },
statement_newline:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'compound_stmt', alias: 'a'},
          {type: 'NEWLINE'}
        ], action: (L) => $B._PyPegen.singleton_seq(L.p, L.a)
      },
      {
        items: [
          {type: 'rule', name: 'simple_stmts'}
        ]
      },
      {
        items: [
          {type: 'NEWLINE'}
        ], action: (L) => $B._PyPegen.singleton_seq(L.p, $B.helper_functions.CHECK($B.ast.stmt, $B._PyAST.Pass(L.EXTRA)))
      },
      {
        items: [
          {type: 'ENDMARKER'}
        ], action: (L) => $B._PyPegen.interactive_exit(L.p)
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
        ], action: (L) => $B._PyPegen.singleton_seq(L.p, L.a)
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
        ], action: (L) => L.a
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
          {type: 'string', value: 'type', lookahead: 'positive'},
          {type: 'rule', name: 'type_alias'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'star_expressions', alias: 'e'}
        ], action: (L) => $B._PyAST.Expr(L.e, L.EXTRA)
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
        ], action: (L) => $B._PyAST.Pass(L.EXTRA)
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
        ], action: (L) => $B._PyAST.Break(L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: 'continue'}
        ], action: (L) => $B._PyAST.Continue(L.EXTRA)
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
            repeat: '?', alias: 'c', action: (L) => L.d
          }
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.ast.stmt, 6, "Variable annotation syntax is", $B._PyAST.AnnAssign($B.helper_functions.CHECK($B.parser_constants.expr_ty, $B._PyPegen.set_expr_context(L.p, L.a, $B.parser_constants.Store)), L.b, L.c, 1, L.EXTRA))
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
                ], action: (L) => L.b
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
            repeat: '?', alias: 'c', action: (L) => L.d
          }
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.ast.stmt, 6, "Variable annotations syntax is", $B._PyAST.AnnAssign(L.a, L.b, L.c, 0, L.EXTRA))
      },
      {
        items: [
          {
            items: [
              {type: 'rule', name: 'star_targets', alias: 'z'},
              {type: 'string', value: '='}
            ],
            repeat: '+', alias: 'a', action: (L) => L.z
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
        ], action: (L) => $B._PyAST.Assign(L.a, L.b, $B.helper_functions.NEW_TYPE_COMMENT(L.p, L.tc), L.EXTRA)
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
        ], action: (L) => $B._PyAST.AugAssign(L.a, L.b.kind, L.c, L.EXTRA)
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
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.Add)
      },
      {
        items: [
          {type: 'string', value: '-='}
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.Sub)
      },
      {
        items: [
          {type: 'string', value: '*='}
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.Mult)
      },
      {
        items: [
          {type: 'string', value: '@='}
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.parser_constants.AugOperator, 5, "The \'@\' operator is", $B._PyPegen.augoperator(L.p, $B.parser_constants.MatMult))
      },
      {
        items: [
          {type: 'string', value: '/='}
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.Div)
      },
      {
        items: [
          {type: 'string', value: '%='}
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.Mod)
      },
      {
        items: [
          {type: 'string', value: '&='}
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.BitAnd)
      },
      {
        items: [
          {type: 'string', value: '|='}
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.BitOr)
      },
      {
        items: [
          {type: 'string', value: '^='}
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.BitXor)
      },
      {
        items: [
          {type: 'string', value: '<<='}
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.LShift)
      },
      {
        items: [
          {type: 'string', value: '>>='}
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.RShift)
      },
      {
        items: [
          {type: 'string', value: '**='}
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.Pow)
      },
      {
        items: [
          {type: 'string', value: '//='}
        ], action: (L) => $B._PyPegen.augoperator(L.p, $B.parser_constants.FloorDiv)
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
    ], action: (L) => $B._PyAST.Return(L.a, L.EXTRA)
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
            repeat: '?', alias: 'b', action: (L) => L.z
          }
        ], action: (L) => $B._PyAST.Raise(L.a, L.b, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: 'raise'}
        ], action: (L) => $B._PyAST.Raise($B.parser_constants.NULL, $B.parser_constants.NULL, L.EXTRA)
      }]
  },
global_stmt:
  {
    items: [
      {type: 'string', value: 'global'},
      {type: 'NAME', join: ',', alias: 'a', repeat: '+'}
    ], action: (L) => $B._PyAST.Global($B.helper_functions.CHECK($B.parser_constants.asdl_identifier_seq, $B._PyPegen.map_names_to_ids(L.p, L.a)), L.EXTRA)
  },
nonlocal_stmt:
  {
    items: [
      {type: 'string', value: 'nonlocal'},
      {type: 'NAME', join: ',', alias: 'a', repeat: '+'}
    ], action: (L) => $B._PyAST.Nonlocal($B.helper_functions.CHECK($B.parser_constants.asdl_identifier_seq, $B._PyPegen.map_names_to_ids(L.p, L.a)), L.EXTRA)
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
        ], action: (L) => $B._PyAST.Delete(L.a, L.EXTRA)
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
    ], action: (L) => $B._PyAST.Expr(L.y, L.EXTRA)
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
        repeat: '?', alias: 'b', action: (L) => L.z
      }
    ], action: (L) => $B._PyAST.Assert(L.a, L.b, L.EXTRA)
  },
import_stmt:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_import'}
        ]
      },
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
    ], action: (L) => $B._PyAST.Import(L.a, L.EXTRA)
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
        ], action: (L) => $B._PyAST.ImportFrom(L.b.id, L.c, $B._PyPegen.seq_count_dots(L.a), L.EXTRA)
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
        ], action: (L) => $B._PyAST.ImportFrom($B.parser_constants.NULL, L.b, $B._PyPegen.seq_count_dots(L.a), L.EXTRA)
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
        ], action: (L) => L.a
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
        ], action: (L) => $B._PyPegen.singleton_seq(L.p, $B.helper_functions.CHECK($B.parser_constants.alias_ty, $B._PyPegen.alias_for_star(L.p, L.EXTRA)))
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
    ], action: (L) => L.a
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
        repeat: '?', alias: 'b', action: (L) => L.z
      }
    ], action: (L) => $B._PyAST.alias(L.a.id, (L.b)?(L.b).id:$B.parser_constants.NULL, L.EXTRA)
  },
dotted_as_names:
  {
    items: [
      {type: 'rule', name: 'dotted_as_name', join: ',', alias: 'a', repeat: '+'}
    ], action: (L) => L.a
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
        repeat: '?', alias: 'b', action: (L) => L.z
      }
    ], action: (L) => $B._PyAST.alias(L.a.id, (L.b)?(L.b).id:$B.parser_constants.NULL, L.EXTRA)
  },
dotted_name:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'dotted_name', alias: 'a'},
          {type: 'string', value: '.'},
          {type: 'NAME', alias: 'b'}
        ], action: (L) => $B._PyPegen.join_names_with_dot(L.p, L.a, L.b)
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
        ], action: (L) => L.a
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
        repeat: '+', alias: 'a', action: (L) => L.f
      }
    ], action: (L) => L.a
  },
class_def:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'decorators', alias: 'a'},
          {type: 'rule', name: 'class_def_raw', alias: 'b'}
        ], action: (L) => $B._PyPegen.class_def_decorators(L.p, L.a, L.b)
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
              {type: 'rule', name: 'type_params'}
            ],
            repeat: '?', alias: 't'
          },
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
            repeat: '?', alias: 'b', action: (L) => L.z
          },
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'c'}
        ], action: (L) => $B._PyAST.ClassDef(L.a.id, (L.b)?(L.b).args:$B.parser_constants.NULL, (L.b)?(L.b).keywords:$B.parser_constants.NULL, L.c, $B.parser_constants.NULL, L.t, L.EXTRA)
      }]
  },
function_def:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'decorators', alias: 'd'},
          {type: 'rule', name: 'function_def_raw', alias: 'f'}
        ], action: (L) => $B._PyPegen.function_def_decorators(L.p, L.d, L.f)
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
          {
            items: [
              {type: 'rule', name: 'type_params'}
            ],
            repeat: '?', alias: 't'
          },
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
            repeat: '?', alias: 'a', action: (L) => L.z
          },
          {type: 'string', value: ':'},
          {
            items: [
              {type: 'rule', name: 'func_type_comment'}
            ],
            repeat: '?', alias: 'tc'
          },
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: (L) => $B._PyAST.FunctionDef(L.n.id, (L.params)?L.params:$B.helper_functions.CHECK($B.parser_constants.arguments_ty, $B._PyPegen.empty_arguments(L.p)), L.b, $B.parser_constants.NULL, L.a, $B.helper_functions.NEW_TYPE_COMMENT(L.p, L.tc), L.t, L.EXTRA)
      },
      {
        items: [
          {type: 'ASYNC'},
          {type: 'string', value: 'def'},
          {type: 'NAME', alias: 'n'},
          {
            items: [
              {type: 'rule', name: 'type_params'}
            ],
            repeat: '?', alias: 't'
          },
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
            repeat: '?', alias: 'a', action: (L) => L.z
          },
          {type: 'string', value: ':'},
          {
            items: [
              {type: 'rule', name: 'func_type_comment'}
            ],
            repeat: '?', alias: 'tc'
          },
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.ast.stmt, 5, "Async functions are", $B._PyAST.AsyncFunctionDef(L.n.id, (L.params)?L.params:$B.helper_functions.CHECK($B.parser_constants.arguments_ty, $B._PyPegen.empty_arguments(L.p)), L.b, $B.parser_constants.NULL, L.a, $B.helper_functions.NEW_TYPE_COMMENT(L.p, L.tc), L.t, L.EXTRA))
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
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.parser_constants.arguments_ty, 8, "Positional-only parameters are", $B._PyPegen.make_arguments(L.p, L.a, $B.parser_constants.NULL, L.b, L.c, L.d))
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
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.parser_constants.arguments_ty, 8, "Positional-only parameters are", $B._PyPegen.make_arguments(L.p, $B.parser_constants.NULL, L.a, $B.parser_constants.NULL, L.b, L.c))
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
        ], action: (L) => $B._PyPegen.make_arguments(L.p, $B.parser_constants.NULL, $B.parser_constants.NULL, L.a, L.b, L.c)
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
        ], action: (L) => $B._PyPegen.make_arguments(L.p, $B.parser_constants.NULL, $B.parser_constants.NULL, $B.parser_constants.NULL, L.a, L.b)
      },
      {
        items: [
          {type: 'rule', name: 'star_etc', alias: 'a'}
        ], action: (L) => $B._PyPegen.make_arguments(L.p, $B.parser_constants.NULL, $B.parser_constants.NULL, $B.parser_constants.NULL, $B.parser_constants.NULL, L.a)
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
        ], action: (L) => L.a
      },
      {
        items: [
          {type: 'rule', name: 'param_no_default', repeat: '+', alias: 'a'},
          {type: 'string', value: '/'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: (L) => L.a
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
        ], action: (L) => $B._PyPegen.slash_with_default(L.p, L.a, L.b)
      },
      {
        items: [
          {type: 'rule', name: 'param_no_default', repeat: '*', alias: 'a'},
          {type: 'rule', name: 'param_with_default', repeat: '+', alias: 'b'},
          {type: 'string', value: '/'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: (L) => $B._PyPegen.slash_with_default(L.p, L.a, L.b)
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
        ], action: (L) => $B._PyPegen.star_etc(L.p, L.a, L.b, L.c)
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
        ], action: (L) => $B._PyPegen.star_etc(L.p, L.a, L.b, L.c)
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
        ], action: (L) => $B._PyPegen.star_etc(L.p, $B.parser_constants.NULL, L.b, L.c)
      },
      {
        items: [
          {type: 'rule', name: 'kwds', alias: 'a'}
        ], action: (L) => $B._PyPegen.star_etc(L.p, $B.parser_constants.NULL, $B.parser_constants.NULL, L.a)
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
        ], action: (L) => L.a
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
        ], action: (L) => $B._PyPegen.add_type_comment_to_arg(L.p, L.a, L.tc)
      },
      {
        items: [
          {type: 'rule', name: 'param', alias: 'a'},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: (L) => $B._PyPegen.add_type_comment_to_arg(L.p, L.a, L.tc)
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
        ], action: (L) => $B._PyPegen.add_type_comment_to_arg(L.p, L.a, L.tc)
      },
      {
        items: [
          {type: 'rule', name: 'param_star_annotation', alias: 'a'},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: (L) => $B._PyPegen.add_type_comment_to_arg(L.p, L.a, L.tc)
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
        ], action: (L) => $B._PyPegen.name_default_pair(L.p, L.a, L.c, L.tc)
      },
      {
        items: [
          {type: 'rule', name: 'param', alias: 'a'},
          {type: 'rule', name: 'default', alias: 'c'},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: (L) => $B._PyPegen.name_default_pair(L.p, L.a, L.c, L.tc)
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
        ], action: (L) => $B._PyPegen.name_default_pair(L.p, L.a, L.c, L.tc)
      },
      {
        items: [
          {type: 'rule', name: 'param', alias: 'a'},
          {type: 'rule', name: 'default', repeat: '?', alias: 'c'},
          {type: 'TYPE_COMMENT', repeat: '?', alias: 'tc'},
          {type: 'string', value: ')', lookahead: 'positive'}
        ], action: (L) => $B._PyPegen.name_default_pair(L.p, L.a, L.c, L.tc)
      }]
  },
param:
  {
    items: [
      {type: 'NAME', alias: 'a'},
      {type: 'rule', name: 'annotation', repeat: '?', alias: 'b'}
    ], action: (L) => $B._PyAST.arg(L.a.id, L.b, $B.parser_constants.NULL, L.EXTRA)
  },
param_star_annotation:
  {
    items: [
      {type: 'NAME', alias: 'a'},
      {type: 'rule', name: 'star_annotation', alias: 'b'}
    ], action: (L) => $B._PyAST.arg(L.a.id, L.b, $B.parser_constants.NULL, L.EXTRA)
  },
annotation:
  {
    items: [
      {type: 'string', value: ':'},
      {type: 'rule', name: 'expression', alias: 'a'}
    ], action: (L) => L.a
  },
star_annotation:
  {
    items: [
      {type: 'string', value: ':'},
      {type: 'rule', name: 'star_expression', alias: 'a'}
    ], action: (L) => L.a
  },
default:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '='},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: (L) => L.a
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
        ], action: (L) => $B._PyAST.If(L.a, L.b, $B.helper_functions.CHECK($B.parser_constants.asdl_stmt_seq, $B._PyPegen.singleton_seq(L.p, L.c)), L.EXTRA)
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
        ], action: (L) => $B._PyAST.If(L.a, L.b, L.c, L.EXTRA)
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
        ], action: (L) => $B._PyAST.If(L.a, L.b, $B.helper_functions.CHECK($B.parser_constants.asdl_stmt_seq, $B._PyPegen.singleton_seq(L.p, L.c)), L.EXTRA)
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
        ], action: (L) => $B._PyAST.If(L.a, L.b, L.c, L.EXTRA)
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
        ], action: (L) => L.b
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
        ], action: (L) => $B._PyAST.While(L.a, L.b, L.c, L.EXTRA)
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
        ], action: (L) => $B._PyAST.For(L.t, L.ex, L.b, L.el, $B.helper_functions.NEW_TYPE_COMMENT(L.p, L.tc), L.EXTRA)
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
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.ast.stmt, 5, "Async for loops are", $B._PyAST.AsyncFor(L.t, L.ex, L.b, L.el, $B.helper_functions.NEW_TYPE_COMMENT(L.p, L.tc), L.EXTRA))
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
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.ast.stmt, 9, "Parenthesized context managers are", $B._PyAST.With(L.a, L.b, $B.parser_constants.NULL, L.EXTRA))
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
        ], action: (L) => $B._PyAST.With(L.a, L.b, $B.helper_functions.NEW_TYPE_COMMENT(L.p, L.tc), L.EXTRA)
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
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.ast.stmt, 5, "Async with statements are", $B._PyAST.AsyncWith(L.a, L.b, $B.parser_constants.NULL, L.EXTRA))
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
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.ast.stmt, 5, "Async with statements are", $B._PyAST.AsyncWith(L.a, L.b, $B.helper_functions.NEW_TYPE_COMMENT(L.p, L.tc), L.EXTRA))
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
        ], action: (L) => $B._PyAST.withitem(L.e, L.t, L.p.arena)
      },
      {
        items: [
          {type: 'rule', name: 'invalid_with_item'}
        ]
      },
      {
        items: [
          {type: 'rule', name: 'expression', alias: 'e'}
        ], action: (L) => $B._PyAST.withitem(L.e, $B.parser_constants.NULL, L.p.arena)
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
        ], action: (L) => $B._PyAST.Try(L.b, $B.parser_constants.NULL, $B.parser_constants.NULL, L.f, L.EXTRA)
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
        ], action: (L) => $B._PyAST.Try(L.b, L.ex, L.el, L.f, L.EXTRA)
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
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.ast.stmt, 11, "Exception groups are", $B._PyAST.TryStar(L.b, L.ex, L.el, L.f, L.EXTRA))
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
            repeat: '?', alias: 't', action: (L) => L.z
          },
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: (L) => $B._PyAST.ExceptHandler(L.e, (L.t)?(L.t).id:$B.parser_constants.NULL, L.b, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: 'except'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: (L) => $B._PyAST.ExceptHandler($B.parser_constants.NULL, $B.parser_constants.NULL, L.b, L.EXTRA)
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
            repeat: '?', alias: 't', action: (L) => L.z
          },
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', alias: 'b'}
        ], action: (L) => $B._PyAST.ExceptHandler(L.e, (L.t)?(L.t).id:$B.parser_constants.NULL, L.b, L.EXTRA)
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
        ], action: (L) => L.a
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
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.ast.stmt, 10, "Pattern matching is", $B._PyAST.Match(L.subject, L.cases, L.EXTRA))
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
        ], action: (L) => $B._PyAST.Tuple($B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.seq_insert_in_front(L.p, L.value, L.values)), $B.parser_constants.Load, L.EXTRA)
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
        ], action: (L) => $B._PyAST.match_case(L.pattern, L.guard, L.body, L.p.arena)
      }]
  },
guard:
  {
    items: [
      {type: 'string', value: 'if'},
      {type: 'rule', name: 'named_expression', alias: 'guard'}
    ], action: (L) => L.guard
  },
patterns:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'open_sequence_pattern', alias: 'patterns'}
        ], action: (L) => $B._PyAST.MatchSequence(L.patterns, L.EXTRA)
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
        ], action: (L) => $B._PyAST.MatchAs(L.pattern, L.target.id, L.EXTRA)
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
    ], action: (L) => $B.helper_functions.asdl_seq_LEN(L.patterns)==1?$B.helper_functions.asdl_seq_GET(L.patterns, 0):$B._PyAST.MatchOr(L.patterns, L.EXTRA)
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
        ], action: (L) => $B._PyAST.MatchValue(L.value, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'complex_number', alias: 'value'}
        ], action: (L) => $B._PyAST.MatchValue(L.value, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'strings', alias: 'value'}
        ], action: (L) => $B._PyAST.MatchValue(L.value, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: 'None'}
        ], action: (L) => $B._PyAST.MatchSingleton($B.parser_constants.Py_None, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: 'True'}
        ], action: (L) => $B._PyAST.MatchSingleton($B.parser_constants.Py_True, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: 'False'}
        ], action: (L) => $B._PyAST.MatchSingleton($B.parser_constants.Py_False, L.EXTRA)
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
        ], action: (L) => $B._PyAST.Constant($B.parser_constants.Py_None, $B.parser_constants.NULL, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: 'True'}
        ], action: (L) => $B._PyAST.Constant($B.parser_constants.Py_True, $B.parser_constants.NULL, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: 'False'}
        ], action: (L) => $B._PyAST.Constant($B.parser_constants.Py_False, $B.parser_constants.NULL, L.EXTRA)
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
        ], action: (L) => $B._PyAST.BinOp(L.real, $B.parser_constants.Add, L.imag, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'signed_real_number', alias: 'real'},
          {type: 'string', value: '-'},
          {type: 'rule', name: 'imaginary_number', alias: 'imag'}
        ], action: (L) => $B._PyAST.BinOp(L.real, $B.parser_constants.Sub, L.imag, L.EXTRA)
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
        ], action: (L) => $B._PyAST.UnaryOp($B.parser_constants.USub, L.number, L.EXTRA)
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
        ], action: (L) => $B._PyAST.UnaryOp($B.parser_constants.USub, L.real, L.EXTRA)
      }]
  },
real_number:
  {
    items: [
      {type: 'NUMBER', alias: 'real'}
    ], action: (L) => $B._PyPegen.ensure_real(L.p, L.real)
  },
imaginary_number:
  {
    items: [
      {type: 'NUMBER', alias: 'imag'}
    ], action: (L) => $B._PyPegen.ensure_imaginary(L.p, L.imag)
  },
capture_pattern:
  {
    items: [
      {type: 'rule', name: 'pattern_capture_target', alias: 'target'}
    ], action: (L) => $B._PyAST.MatchAs($B.parser_constants.NULL, L.target.id, L.EXTRA)
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
    ], action: (L) => $B._PyPegen.set_expr_context(L.p, L.name, $B.parser_constants.Store)
  },
wildcard_pattern:
  {
    items: [
      {type: 'string', value: '_'}
    ], action: (L) => $B._PyAST.MatchAs($B.parser_constants.NULL, $B.parser_constants.NULL, L.EXTRA)
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
    ], action: (L) => $B._PyAST.MatchValue(L.attr, L.EXTRA)
  },
attr:
  {
    items: [
      {type: 'rule', name: 'name_or_attr', alias: 'value'},
      {type: 'string', value: '.'},
      {type: 'NAME', alias: 'attr'}
    ], action: (L) => $B._PyAST.Attribute(L.value, L.attr.id, $B.parser_constants.Load, L.EXTRA)
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
    ], action: (L) => L.pattern
  },
sequence_pattern:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '['},
          {type: 'rule', name: 'maybe_sequence_pattern', repeat: '?', alias: 'patterns'},
          {type: 'string', value: ']'}
        ], action: (L) => $B._PyAST.MatchSequence(L.patterns, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'open_sequence_pattern', repeat: '?', alias: 'patterns'},
          {type: 'string', value: ')'}
        ], action: (L) => $B._PyAST.MatchSequence(L.patterns, L.EXTRA)
      }]
  },
open_sequence_pattern:
  {
    items: [
      {type: 'rule', name: 'maybe_star_pattern', alias: 'pattern'},
      {type: 'string', value: ','},
      {type: 'rule', name: 'maybe_sequence_pattern', repeat: '?', alias: 'patterns'}
    ], action: (L) => $B._PyPegen.seq_insert_in_front(L.p, L.pattern, L.patterns)
  },
maybe_sequence_pattern:
  {
    items: [
      {type: 'rule', name: 'maybe_star_pattern', join: ',', alias: 'patterns', repeat: '+'},
      {type: 'string', value: ',', repeat: '?'}
    ], action: (L) => L.patterns
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
        ], action: (L) => $B._PyAST.MatchStar(L.target.id, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'wildcard_pattern'}
        ], action: (L) => $B._PyAST.MatchStar($B.parser_constants.NULL, L.EXTRA)
      }]
  },
mapping_pattern:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'string', value: '}'}
        ], action: (L) => $B._PyAST.MatchMapping($B.parser_constants.NULL, $B.parser_constants.NULL, $B.parser_constants.NULL, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'rule', name: 'double_star_pattern', alias: 'rest'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: '}'}
        ], action: (L) => $B._PyAST.MatchMapping($B.parser_constants.NULL, $B.parser_constants.NULL, L.rest.id, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'rule', name: 'items_pattern', alias: 'items'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'double_star_pattern', alias: 'rest'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: '}'}
        ], action: (L) => $B._PyAST.MatchMapping($B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.get_pattern_keys(L.p, L.items)), $B.helper_functions.CHECK($B.parser_constants.asdl_pattern_seq, $B._PyPegen.get_patterns(L.p, L.items)), L.rest.id, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'rule', name: 'items_pattern', alias: 'items'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: '}'}
        ], action: (L) => $B._PyAST.MatchMapping($B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.get_pattern_keys(L.p, L.items)), $B.helper_functions.CHECK($B.parser_constants.asdl_pattern_seq, $B._PyPegen.get_patterns(L.p, L.items)), $B.parser_constants.NULL, L.EXTRA)
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
    ], action: (L) => $B._PyPegen.key_pattern_pair(L.p, L.key, L.pattern)
  },
double_star_pattern:
  {
    items: [
      {type: 'string', value: '**'},
      {type: 'rule', name: 'pattern_capture_target', alias: 'target'}
    ], action: (L) => L.target
  },
class_pattern:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'name_or_attr', alias: 'cls'},
          {type: 'string', value: '('},
          {type: 'string', value: ')'}
        ], action: (L) => $B._PyAST.MatchClass(L.cls, $B.parser_constants.NULL, $B.parser_constants.NULL, $B.parser_constants.NULL, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'name_or_attr', alias: 'cls'},
          {type: 'string', value: '('},
          {type: 'rule', name: 'positional_patterns', alias: 'patterns'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')'}
        ], action: (L) => $B._PyAST.MatchClass(L.cls, L.patterns, $B.parser_constants.NULL, $B.parser_constants.NULL, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'name_or_attr', alias: 'cls'},
          {type: 'string', value: '('},
          {type: 'rule', name: 'keyword_patterns', alias: 'keywords'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')'}
        ], action: (L) => $B._PyAST.MatchClass(L.cls, $B.parser_constants.NULL, $B.helper_functions.CHECK($B.parser_constants.asdl_identifier_seq, $B._PyPegen.map_names_to_ids(L.p, $B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.get_pattern_keys(L.p, L.keywords)))), $B.helper_functions.CHECK($B.parser_constants.asdl_pattern_seq, $B._PyPegen.get_patterns(L.p, L.keywords)), L.EXTRA)
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
        ], action: (L) => $B._PyAST.MatchClass(L.cls, L.patterns, $B.helper_functions.CHECK($B.parser_constants.asdl_identifier_seq, $B._PyPegen.map_names_to_ids(L.p, $B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.get_pattern_keys(L.p, L.keywords)))), $B.helper_functions.CHECK($B.parser_constants.asdl_pattern_seq, $B._PyPegen.get_patterns(L.p, L.keywords)), L.EXTRA)
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
    ], action: (L) => L.args
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
    ], action: (L) => $B._PyPegen.key_pattern_pair(L.p, L.arg, L.value)
  },
type_alias:
  {
    items: [
      {type: 'string', value: 'type'},
      {type: 'NAME', alias: 'n'},
      {
        items: [
          {type: 'rule', name: 'type_params'}
        ],
        repeat: '?', alias: 't'
      },
      {type: 'string', value: '='},
      {type: 'rule', name: 'expression', alias: 'b'}
    ], action: (L) => $B.helper_functions.CHECK_VERSION($B.ast.stmt, 12, "Type statement is", $B._PyAST.TypeAlias($B.helper_functions.CHECK($B.parser_constants.expr_ty, $B._PyPegen.set_expr_context(L.p, L.n, $B.parser_constants.Store)), L.t, L.b, L.EXTRA))
  },
type_params:
  {
    items: [
      {type: 'string', value: '['},
      {type: 'rule', name: 'type_param_seq', alias: 't'},
      {type: 'string', value: ']'}
    ], action: (L) => $B.helper_functions.CHECK_VERSION($B.parser_constants.asdl_type_param_seq, 12, "Type parameter lists are", L.t)
  },
type_param_seq:
  {
    items: [
      {type: 'rule', name: 'type_param', join: ',', alias: 'a', repeat: '+'},
      {
        items: [
          {type: 'string', value: ','}
        ],
        repeat: '?'
      }
    ], action: (L) => L.a
  },
type_param:
  {
   choices: [
      {
        items: [
          {type: 'NAME', alias: 'a'},
          {
            items: [
              {type: 'rule', name: 'type_param_bound'}
            ],
            repeat: '?', alias: 'b'
          }
        ], action: (L) => $B._PyAST.TypeVar(L.a.id, L.b, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'NAME', alias: 'a'},
          {type: 'string', value: ':', alias: 'colon'},
          {type: 'rule', name: 'expression', alias: 'e'}
        ], action: (L) => RAISE_SYNTAX_ERROR_STARTING_FROM(L.colon, L.e.kind==Tuple_kind?"cannot use constraints with TypeVarTuple":"cannot use bound with TypeVarTuple")
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'NAME', alias: 'a'}
        ], action: (L) => $B._PyAST.TypeVarTuple(L.a.id, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'NAME', alias: 'a'},
          {type: 'string', value: ':', alias: 'colon'},
          {type: 'rule', name: 'expression', alias: 'e'}
        ], action: (L) => RAISE_SYNTAX_ERROR_STARTING_FROM(L.colon, L.e.kind==Tuple_kind?"cannot use constraints with ParamSpec":"cannot use bound with ParamSpec")
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'NAME', alias: 'a'}
        ], action: (L) => $B._PyAST.ParamSpec(L.a.id, L.EXTRA)
      }]
  },
type_param_bound:
  {
    items: [
      {type: 'string', value: ':'},
      {type: 'rule', name: 'expression', alias: 'e'}
    ], action: (L) => L.e
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
            repeat: '+', alias: 'b', action: (L) => L.c
          },
          {
            items: [
              {type: 'string', value: ','}
            ],
            repeat: '?'
          }
        ], action: (L) => $B._PyAST.Tuple($B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.seq_insert_in_front(L.p, L.a, L.b)), $B.parser_constants.Load, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'string', value: ','}
        ], action: (L) => $B._PyAST.Tuple($B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.singleton_seq(L.p, L.a)), $B.parser_constants.Load, L.EXTRA)
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
        ], action: (L) => $B._PyAST.IfExp(L.b, L.a, L.c, L.EXTRA)
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
        ], action: (L) => $B._PyAST.YieldFrom(L.a, L.EXTRA)
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
        ], action: (L) => $B._PyAST.Yield(L.a, L.EXTRA)
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
            repeat: '+', alias: 'b', action: (L) => L.c
          },
          {
            items: [
              {type: 'string', value: ','}
            ],
            repeat: '?'
          }
        ], action: (L) => $B._PyAST.Tuple($B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.seq_insert_in_front(L.p, L.a, L.b)), $B.parser_constants.Load, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'star_expression', alias: 'a'},
          {type: 'string', value: ','}
        ], action: (L) => $B._PyAST.Tuple($B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.singleton_seq(L.p, L.a)), $B.parser_constants.Load, L.EXTRA)
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
        ], action: (L) => $B._PyAST.Starred(L.a, $B.parser_constants.Load, L.EXTRA)
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
    ], action: (L) => L.a
  },
star_named_expression:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'bitwise_or', alias: 'a'}
        ], action: (L) => $B._PyAST.Starred(L.a, $B.parser_constants.Load, L.EXTRA)
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
    ], action: (L) => $B.helper_functions.CHECK_VERSION($B.parser_constants.expr_ty, 8, "Assignment expressions are", $B._PyAST.NamedExpr($B.helper_functions.CHECK($B.parser_constants.expr_ty, $B._PyPegen.set_expr_context(L.p, L.a, $B.parser_constants.Store)), L.b, L.EXTRA))
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
            repeat: '+', alias: 'b', action: (L) => L.c
          }
        ], action: (L) => $B._PyAST.BoolOp($B.parser_constants.Or, $B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.seq_insert_in_front(L.p, L.a, L.b)), L.EXTRA)
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
            repeat: '+', alias: 'b', action: (L) => L.c
          }
        ], action: (L) => $B._PyAST.BoolOp($B.parser_constants.And, $B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.seq_insert_in_front(L.p, L.a, L.b)), L.EXTRA)
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
        ], action: (L) => $B._PyAST.UnaryOp($B.parser_constants.Not, L.a, L.EXTRA)
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
        ], action: (L) => $B._PyAST.Compare(L.a, $B.helper_functions.CHECK($B.parser_constants.asdl_int_seq, $B._PyPegen.get_cmpops(L.p, L.b)), $B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.get_exprs(L.p, L.b)), L.EXTRA)
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
    ], action: (L) => $B._PyPegen.cmpop_expr_pair(L.p, $B.parser_constants.Eq, L.a)
  },
noteq_bitwise_or:
  {
    items: [
      {
        items: [
          {type: 'string', value: '!=', alias: 'tok'}
        ], action: (L) => $B._PyPegen.check_barry_as_flufl(L.p, L.tok)?$B.parser_constants.NULL:L.tok
      },
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: (L) => $B._PyPegen.cmpop_expr_pair(L.p, $B.parser_constants.NotEq, L.a)
  },
lte_bitwise_or:
  {
    items: [
      {type: 'string', value: '<='},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: (L) => $B._PyPegen.cmpop_expr_pair(L.p, $B.parser_constants.LtE, L.a)
  },
lt_bitwise_or:
  {
    items: [
      {type: 'string', value: '<'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: (L) => $B._PyPegen.cmpop_expr_pair(L.p, $B.parser_constants.Lt, L.a)
  },
gte_bitwise_or:
  {
    items: [
      {type: 'string', value: '>='},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: (L) => $B._PyPegen.cmpop_expr_pair(L.p, $B.parser_constants.GtE, L.a)
  },
gt_bitwise_or:
  {
    items: [
      {type: 'string', value: '>'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: (L) => $B._PyPegen.cmpop_expr_pair(L.p, $B.parser_constants.Gt, L.a)
  },
notin_bitwise_or:
  {
    items: [
      {type: 'string', value: 'not'},
      {type: 'string', value: 'in'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: (L) => $B._PyPegen.cmpop_expr_pair(L.p, $B.parser_constants.NotIn, L.a)
  },
in_bitwise_or:
  {
    items: [
      {type: 'string', value: 'in'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: (L) => $B._PyPegen.cmpop_expr_pair(L.p, $B.parser_constants.In, L.a)
  },
isnot_bitwise_or:
  {
    items: [
      {type: 'string', value: 'is'},
      {type: 'string', value: 'not'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: (L) => $B._PyPegen.cmpop_expr_pair(L.p, $B.parser_constants.IsNot, L.a)
  },
is_bitwise_or:
  {
    items: [
      {type: 'string', value: 'is'},
      {type: 'rule', name: 'bitwise_or', alias: 'a'}
    ], action: (L) => $B._PyPegen.cmpop_expr_pair(L.p, $B.parser_constants.Is, L.a)
  },
bitwise_or:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'bitwise_or', alias: 'a'},
          {type: 'string', value: '|'},
          {type: 'rule', name: 'bitwise_xor', alias: 'b'}
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.BitOr, L.b, L.EXTRA)
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
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.BitXor, L.b, L.EXTRA)
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
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.BitAnd, L.b, L.EXTRA)
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
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.LShift, L.b, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'shift_expr', alias: 'a'},
          {type: 'string', value: '>>'},
          {type: 'rule', name: 'sum', alias: 'b'}
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.RShift, L.b, L.EXTRA)
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
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.Add, L.b, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'sum', alias: 'a'},
          {type: 'string', value: '-'},
          {type: 'rule', name: 'term', alias: 'b'}
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.Sub, L.b, L.EXTRA)
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
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.Mult, L.b, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'term', alias: 'a'},
          {type: 'string', value: '/'},
          {type: 'rule', name: 'factor', alias: 'b'}
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.Div, L.b, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'term', alias: 'a'},
          {type: 'string', value: '//'},
          {type: 'rule', name: 'factor', alias: 'b'}
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.FloorDiv, L.b, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'term', alias: 'a'},
          {type: 'string', value: '%'},
          {type: 'rule', name: 'factor', alias: 'b'}
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.Mod, L.b, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'term', alias: 'a'},
          {type: 'string', value: '@'},
          {type: 'rule', name: 'factor', alias: 'b'}
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.parser_constants.expr_ty, 5, "The \'@\' operator is", $B._PyAST.BinOp(L.a, $B.parser_constants.MatMult, L.b, L.EXTRA))
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
        ], action: (L) => $B._PyAST.UnaryOp($B.parser_constants.UAdd, L.a, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: '-'},
          {type: 'rule', name: 'factor', alias: 'a'}
        ], action: (L) => $B._PyAST.UnaryOp($B.parser_constants.USub, L.a, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: '~'},
          {type: 'rule', name: 'factor', alias: 'a'}
        ], action: (L) => $B._PyAST.UnaryOp($B.parser_constants.Invert, L.a, L.EXTRA)
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
        ], action: (L) => $B._PyAST.BinOp(L.a, $B.parser_constants.Pow, L.b, L.EXTRA)
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
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.parser_constants.expr_ty, 5, "Await expressions are", $B._PyAST.Await(L.a, L.EXTRA))
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
        ], action: (L) => $B._PyAST.Attribute(L.a, L.b.id, $B.parser_constants.Load, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'primary', alias: 'a'},
          {type: 'rule', name: 'genexp', alias: 'b'}
        ], action: (L) => $B._PyAST.Call(L.a, $B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.singleton_seq(L.p, L.b)), $B.parser_constants.NULL, L.EXTRA)
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
        ], action: (L) => $B._PyAST.Call(L.a, (L.b)?(L.b).args:$B.parser_constants.NULL, (L.b)?(L.b).keywords:$B.parser_constants.NULL, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'primary', alias: 'a'},
          {type: 'string', value: '['},
          {type: 'rule', name: 'slices', alias: 'b'},
          {type: 'string', value: ']'}
        ], action: (L) => $B._PyAST.Subscript(L.a, L.b, $B.parser_constants.Load, L.EXTRA)
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
        ], action: (L) => L.a
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
        ], action: (L) => $B._PyAST.Tuple(L.a, $B.parser_constants.Load, L.EXTRA)
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
            repeat: '?', alias: 'c', action: (L) => L.d
          }
        ], action: (L) => $B._PyAST.Slice(L.a, L.b, L.c, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'named_expression', alias: 'a'}
        ], action: (L) => L.a
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
        ], action: (L) => $B._PyAST.Constant($B.parser_constants.Py_True, $B.parser_constants.NULL, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: 'False'}
        ], action: (L) => $B._PyAST.Constant($B.parser_constants.Py_False, $B.parser_constants.NULL, L.EXTRA)
      },
      {
        items: [
          {type: 'string', value: 'None'}
        ], action: (L) => $B._PyAST.Constant($B.parser_constants.Py_None, $B.parser_constants.NULL, L.EXTRA)
      },
      {
        items: [
          {
           choices: [
              {
                items: [
                  {type: 'STRING'}
                ]
              },
              {
                items: [
                  {type: 'FSTRING_START'}
                ]
              }], lookahead: 'positive'
          },
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
        ], action: (L) => $B._PyAST.Constant($B.parser_constants.Py_Ellipsis, $B.parser_constants.NULL, L.EXTRA)
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
        ], action: (L) => L.a
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
    ], action: (L) => $B._PyAST.Lambda((L.a)?L.a:$B.helper_functions.CHECK($B.parser_constants.arguments_ty, $B._PyPegen.empty_arguments(L.p)), L.b, L.EXTRA)
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
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.parser_constants.arguments_ty, 8, "Positional-only parameters are", $B._PyPegen.make_arguments(L.p, L.a, $B.parser_constants.NULL, L.b, L.c, L.d))
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
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.parser_constants.arguments_ty, 8, "Positional-only parameters are", $B._PyPegen.make_arguments(L.p, $B.parser_constants.NULL, L.a, $B.parser_constants.NULL, L.b, L.c))
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
        ], action: (L) => $B._PyPegen.make_arguments(L.p, $B.parser_constants.NULL, $B.parser_constants.NULL, L.a, L.b, L.c)
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
        ], action: (L) => $B._PyPegen.make_arguments(L.p, $B.parser_constants.NULL, $B.parser_constants.NULL, $B.parser_constants.NULL, L.a, L.b)
      },
      {
        items: [
          {type: 'rule', name: 'lambda_star_etc', alias: 'a'}
        ], action: (L) => $B._PyPegen.make_arguments(L.p, $B.parser_constants.NULL, $B.parser_constants.NULL, $B.parser_constants.NULL, $B.parser_constants.NULL, L.a)
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
        ], action: (L) => L.a
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param_no_default', repeat: '+', alias: 'a'},
          {type: 'string', value: '/'},
          {type: 'string', value: ':', lookahead: 'positive'}
        ], action: (L) => L.a
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
        ], action: (L) => $B._PyPegen.slash_with_default(L.p, L.a, L.b)
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param_no_default', repeat: '*', alias: 'a'},
          {type: 'rule', name: 'lambda_param_with_default', repeat: '+', alias: 'b'},
          {type: 'string', value: '/'},
          {type: 'string', value: ':', lookahead: 'positive'}
        ], action: (L) => $B._PyPegen.slash_with_default(L.p, L.a, L.b)
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
        ], action: (L) => $B._PyPegen.star_etc(L.p, L.a, L.b, L.c)
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
        ], action: (L) => $B._PyPegen.star_etc(L.p, $B.parser_constants.NULL, L.b, L.c)
      },
      {
        items: [
          {type: 'rule', name: 'lambda_kwds', alias: 'a'}
        ], action: (L) => $B._PyPegen.star_etc(L.p, $B.parser_constants.NULL, $B.parser_constants.NULL, L.a)
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
        ], action: (L) => L.a
      }]
  },
lambda_param_no_default:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'lambda_param', alias: 'a'},
          {type: 'string', value: ','}
        ], action: (L) => L.a
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param', alias: 'a'},
          {type: 'string', value: ':', lookahead: 'positive'}
        ], action: (L) => L.a
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
        ], action: (L) => $B._PyPegen.name_default_pair(L.p, L.a, L.c, $B.parser_constants.NULL)
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param', alias: 'a'},
          {type: 'rule', name: 'default', alias: 'c'},
          {type: 'string', value: ':', lookahead: 'positive'}
        ], action: (L) => $B._PyPegen.name_default_pair(L.p, L.a, L.c, $B.parser_constants.NULL)
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
        ], action: (L) => $B._PyPegen.name_default_pair(L.p, L.a, L.c, $B.parser_constants.NULL)
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param', alias: 'a'},
          {type: 'rule', name: 'default', repeat: '?', alias: 'c'},
          {type: 'string', value: ':', lookahead: 'positive'}
        ], action: (L) => $B._PyPegen.name_default_pair(L.p, L.a, L.c, $B.parser_constants.NULL)
      }]
  },
lambda_param:
  {
    items: [
      {type: 'NAME', alias: 'a'}
    ], action: (L) => $B._PyAST.arg(L.a.id, $B.parser_constants.NULL, $B.parser_constants.NULL, L.EXTRA)
  },
fstring_middle:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'fstring_replacement_field'}
        ]
      },
      {
        items: [
          {type: 'FSTRING_MIDDLE', alias: 't'}
        ], action: (L) => $B._PyPegen.constant_from_token(L.p, L.t)
      }]
  },
fstring_replacement_field:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '{'},
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
              }], alias: 'a'
          },
          {type: 'string', value: '=', repeat: '?', alias: 'debug_expr'},
          {
            items: [
              {type: 'rule', name: 'fstring_conversion'}
            ],
            repeat: '?', alias: 'conversion'
          },
          {
            items: [
              {type: 'rule', name: 'fstring_full_format_spec'}
            ],
            repeat: '?', alias: 'format'
          },
          {type: 'string', value: '}', alias: 'rbrace'}
        ], action: (L) => $B._PyPegen.formatted_value(L.p, L.a, L.debug_expr, L.conversion, L.format, L.rbrace, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'invalid_replacement_field'}
        ]
      }]
  },
fstring_conversion:
  {
    items: [
      {type: 'string', value: '!', alias: 'conv_token'},
      {type: 'NAME', alias: 'conv'}
    ], action: (L) => $B._PyPegen.check_fstring_conversion(L.p, L.conv_token, L.conv)
  },
fstring_full_format_spec:
  {
    items: [
      {type: 'string', value: ':', alias: 'colon'},
      {type: 'rule', name: 'fstring_format_spec', repeat: '*', alias: 'spec'}
    ], action: (L) => $B._PyPegen.setup_full_format_spec(L.p, L.colon, L.spec, L.EXTRA)
  },
fstring_format_spec:
  {
   choices: [
      {
        items: [
          {type: 'FSTRING_MIDDLE', alias: 't'}
        ], action: (L) => $B._PyPegen.decoded_constant_from_token(L.p, L.t)
      },
      {
        items: [
          {type: 'rule', name: 'fstring_replacement_field'}
        ]
      }]
  },
fstring:
  {
    items: [
      {type: 'FSTRING_START', alias: 'a'},
      {type: 'rule', name: 'fstring_middle', repeat: '*', alias: 'b'},
      {type: 'FSTRING_END', alias: 'c'}
    ], action: (L) => $B._PyPegen.joined_str(L.p, L.a, L.b, L.c)
  },
string:
  {
    items: [
      {type: 'STRING', alias: 's'}
    ], action: (L) => $B._PyPegen.constant_from_string(L.p, L.s)
  },
strings:
  {
    items: [
      {
       choices: [
          {
            items: [
              {type: 'rule', name: 'fstring'}
            ]
          },
          {
            items: [
              {type: 'rule', name: 'string'}
            ]
          }],
        repeat: '+', alias: 'a'
      }
    ], action: (L) => $B._PyPegen.concatenate_strings(L.p, L.a, L.EXTRA)
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
    ], action: (L) => $B._PyAST.List(L.a, $B.parser_constants.Load, L.EXTRA)
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
        repeat: '?', alias: 'a', action: (L) => $B._PyPegen.seq_insert_in_front(L.p, L.y, L.z)
      },
      {type: 'string', value: ')'}
    ], action: (L) => $B._PyAST.Tuple(L.a, $B.parser_constants.Load, L.EXTRA)
  },
set:
  {
    items: [
      {type: 'string', value: '{'},
      {type: 'rule', name: 'star_named_expressions', alias: 'a'},
      {type: 'string', value: '}'}
    ], action: (L) => $B._PyAST.Set(L.a, L.EXTRA)
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
        ], action: (L) => $B._PyAST.Dict($B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.get_keys(L.p, L.a)), $B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.get_values(L.p, L.a)), L.EXTRA)
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
    ], action: (L) => L.a
  },
double_starred_kvpair:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'bitwise_or', alias: 'a'}
        ], action: (L) => $B._PyPegen.key_value_pair(L.p, $B.parser_constants.NULL, L.a)
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
    ], action: (L) => $B._PyPegen.key_value_pair(L.p, L.a, L.b)
  },
for_if_clauses:
  {
    items: [
      {type: 'rule', name: 'for_if_clause', repeat: '+', alias: 'a'}
    ], action: (L) => L.a
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
            repeat: '*', alias: 'c', action: (L) => L.z
          }
        ], action: (L) => $B.helper_functions.CHECK_VERSION($B.ast.comprehension, 6, "Async comprehensions are", $B._PyAST.comprehension(L.a, L.b, L.c, 1, L.p.arena))
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
            repeat: '*', alias: 'c', action: (L) => L.z
          }
        ], action: (L) => $B._PyAST.comprehension(L.a, L.b, L.c, 0, L.p.arena)
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
        ], action: (L) => $B._PyAST.ListComp(L.a, L.b, L.EXTRA)
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
        ], action: (L) => $B._PyAST.SetComp(L.a, L.b, L.EXTRA)
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
        ], action: (L) => $B._PyAST.GeneratorExp(L.a, L.b, L.EXTRA)
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
        ], action: (L) => $B._PyAST.DictComp(L.a.key, L.a.value, L.b, L.EXTRA)
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
        ], action: (L) => L.a
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
            repeat: '?', alias: 'b', action: (L) => L.k
          }
        ], action: (L) => $B._PyPegen.collect_call_seqs(L.p, L.a, L.b, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'kwargs', alias: 'a'}
        ], action: (L) => $B._PyAST.Call($B._PyPegen.dummy_name(L.p), $B.helper_functions.CHECK_NULL_ALLOWED($B.parser_constants.asdl_expr_seq, $B._PyPegen.seq_extract_starred_exprs(L.p, L.a)), $B.helper_functions.CHECK_NULL_ALLOWED($B.parser_constants.asdl_keyword_seq, $B._PyPegen.seq_delete_starred_exprs(L.p, L.a)), L.EXTRA)
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
        ], action: (L) => $B._PyPegen.join_sequences(L.p, L.a, L.b)
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
   choices: [
      {
        items: [
          {type: 'rule', name: 'invalid_starred_expression'}
        ]
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: (L) => $B._PyAST.Starred(L.a, $B.parser_constants.Load, L.EXTRA)
      }]
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
        ], action: (L) => $B._PyPegen.keyword_or_starred(L.p, $B.helper_functions.CHECK($B.parser_constants.keyword_ty, $B._PyAST.keyword(L.a.id, L.b, L.EXTRA)), 1)
      },
      {
        items: [
          {type: 'rule', name: 'starred_expression', alias: 'a'}
        ], action: (L) => $B._PyPegen.keyword_or_starred(L.p, L.a, 0)
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
        ], action: (L) => $B._PyPegen.keyword_or_starred(L.p, $B.helper_functions.CHECK($B.parser_constants.keyword_ty, $B._PyAST.keyword(L.a.id, L.b, L.EXTRA)), 1)
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: (L) => $B._PyPegen.keyword_or_starred(L.p, $B.helper_functions.CHECK($B.parser_constants.keyword_ty, $B._PyAST.keyword($B.parser_constants.NULL, L.a, L.EXTRA)), 1)
      }]
  },
star_targets:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'star_target', alias: 'a'},
          {type: 'string', value: ',', lookahead: 'negative'}
        ], action: (L) => L.a
      },
      {
        items: [
          {type: 'rule', name: 'star_target', alias: 'a'},
          {
            items: [
              {type: 'string', value: ','},
              {type: 'rule', name: 'star_target', alias: 'c'}
            ],
            repeat: '*', alias: 'b', action: (L) => L.c
          },
          {
            items: [
              {type: 'string', value: ','}
            ],
            repeat: '?'
          }
        ], action: (L) => $B._PyAST.Tuple($B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.seq_insert_in_front(L.p, L.a, L.b)), $B.parser_constants.Store, L.EXTRA)
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
    ], action: (L) => L.a
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
            repeat: '+', alias: 'b', action: (L) => L.c
          },
          {
            items: [
              {type: 'string', value: ','}
            ],
            repeat: '?'
          }
        ], action: (L) => $B._PyPegen.seq_insert_in_front(L.p, L.a, L.b)
      },
      {
        items: [
          {type: 'rule', name: 'star_target', alias: 'a'},
          {type: 'string', value: ','}
        ], action: (L) => $B._PyPegen.singleton_seq(L.p, L.a)
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
        ], action: (L) => $B._PyAST.Starred($B.helper_functions.CHECK($B.parser_constants.expr_ty, $B._PyPegen.set_expr_context(L.p, L.a, $B.parser_constants.Store)), $B.parser_constants.Store, L.EXTRA)
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
        ], action: (L) => $B._PyAST.Attribute(L.a, L.b.id, $B.parser_constants.Store, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '['},
          {type: 'rule', name: 'slices', alias: 'b'},
          {type: 'string', value: ']'},
          {type: 'rule', name: 't_lookahead', lookahead: 'negative'}
        ], action: (L) => $B._PyAST.Subscript(L.a, L.b, $B.parser_constants.Store, L.EXTRA)
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
        ], action: (L) => $B._PyPegen.set_expr_context(L.p, L.a, $B.parser_constants.Store)
      },
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'target_with_star_atom', alias: 'a'},
          {type: 'string', value: ')'}
        ], action: (L) => $B._PyPegen.set_expr_context(L.p, L.a, $B.parser_constants.Store)
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
        ], action: (L) => $B._PyAST.Tuple(L.a, $B.parser_constants.Store, L.EXTRA)
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
        ], action: (L) => $B._PyAST.List(L.a, $B.parser_constants.Store, L.EXTRA)
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
        ], action: (L) => $B._PyPegen.set_expr_context(L.p, L.a, $B.parser_constants.Store)
      },
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'single_target', alias: 'a'},
          {type: 'string', value: ')'}
        ], action: (L) => L.a
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
        ], action: (L) => $B._PyAST.Attribute(L.a, L.b.id, $B.parser_constants.Store, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '['},
          {type: 'rule', name: 'slices', alias: 'b'},
          {type: 'string', value: ']'},
          {type: 'rule', name: 't_lookahead', lookahead: 'negative'}
        ], action: (L) => $B._PyAST.Subscript(L.a, L.b, $B.parser_constants.Store, L.EXTRA)
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
        ], action: (L) => $B._PyAST.Attribute(L.a, L.b.id, $B.parser_constants.Load, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '['},
          {type: 'rule', name: 'slices', alias: 'b'},
          {type: 'string', value: ']'},
          {type: 'rule', name: 't_lookahead', lookahead: 'positive'}
        ], action: (L) => $B._PyAST.Subscript(L.a, L.b, $B.parser_constants.Load, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'rule', name: 'genexp', alias: 'b'},
          {type: 'rule', name: 't_lookahead', lookahead: 'positive'}
        ], action: (L) => $B._PyAST.Call(L.a, $B.helper_functions.CHECK($B.parser_constants.asdl_expr_seq, $B._PyPegen.singleton_seq(L.p, L.b)), $B.parser_constants.NULL, L.EXTRA)
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
        ], action: (L) => $B._PyAST.Call(L.a, (L.b)?(L.b).args:$B.parser_constants.NULL, (L.b)?(L.b).keywords:$B.parser_constants.NULL, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 'atom', alias: 'a'},
          {type: 'rule', name: 't_lookahead', lookahead: 'positive'}
        ], action: (L) => L.a
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
    ], action: (L) => L.a
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
        ], action: (L) => $B._PyAST.Attribute(L.a, L.b.id, $B.parser_constants.Del, L.EXTRA)
      },
      {
        items: [
          {type: 'rule', name: 't_primary', alias: 'a'},
          {type: 'string', value: '['},
          {type: 'rule', name: 'slices', alias: 'b'},
          {type: 'string', value: ']'},
          {type: 'rule', name: 't_lookahead', lookahead: 'negative'}
        ], action: (L) => $B._PyAST.Subscript(L.a, L.b, $B.parser_constants.Del, L.EXTRA)
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
        ], action: (L) => $B._PyPegen.set_expr_context(L.p, L.a, $B.parser_constants.Del)
      },
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'del_target', alias: 'a'},
          {type: 'string', value: ')'}
        ], action: (L) => $B._PyPegen.set_expr_context(L.p, L.a, $B.parser_constants.Del)
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
        ], action: (L) => $B._PyAST.Tuple(L.a, $B.parser_constants.Del, L.EXTRA)
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
        ], action: (L) => $B._PyAST.List(L.a, $B.parser_constants.Del, L.EXTRA)
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
        ], action: (L) => $B._PyPegen.seq_append_to_end(L.p, $B.helper_functions.CHECK(asdl_seq, $B._PyPegen.seq_append_to_end(L.p, L.a, L.b)), L.c)
      },
      {
        items: [
          {type: 'rule', name: 'expression', join: ',', alias: 'a', repeat: '+'},
          {type: 'string', value: ','},
          {type: 'string', value: '*'},
          {type: 'rule', name: 'expression', alias: 'b'}
        ], action: (L) => $B._PyPegen.seq_append_to_end(L.p, L.a, L.b)
      },
      {
        items: [
          {type: 'rule', name: 'expression', join: ',', alias: 'a', repeat: '+'},
          {type: 'string', value: ','},
          {type: 'string', value: '**'},
          {type: 'rule', name: 'expression', alias: 'b'}
        ], action: (L) => $B._PyPegen.seq_append_to_end(L.p, L.a, L.b)
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'string', value: ','},
          {type: 'string', value: '**'},
          {type: 'rule', name: 'expression', alias: 'b'}
        ], action: (L) => $B._PyPegen.seq_append_to_end(L.p, $B.helper_functions.CHECK(asdl_seq, $B._PyPegen.singleton_seq(L.p, L.a)), L.b)
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: (L) => $B._PyPegen.singleton_seq(L.p, L.a)
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: (L) => $B._PyPegen.singleton_seq(L.p, L.a)
      },
      {
        items: [
          {type: 'rule', name: 'expression', join: ',', alias: 'a', repeat: '+'}
        ], action: (L) => L.a
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
        ], action: (L) => L.t
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
          {
           choices: [
              {
                items: [
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
                          }], join: ',',
                        repeat: '+'
                      },
                      {type: 'string', value: ','},
                      {type: 'rule', name: 'kwargs'}
                    ]
                  }
                ]
              },
              {
                items: [
                  {type: 'rule', name: 'kwargs'}
                ]
              }]
          },
          {type: 'string', value: ','},
          {type: 'string', value: '*', alias: 'b'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.b, "iterable argument unpacking follows keyword argument unpacking")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, $B._PyPegen.get_last_comprehension_item(PyPegen_last_item(L.b, $B.ast.comprehension)), "Generator expression must be parenthesized")
      },
      {
        items: [
          {type: 'NAME', alias: 'a'},
          {type: 'string', value: '=', alias: 'b'},
          {type: 'rule', name: 'expression'},
          {type: 'rule', name: 'for_if_clauses'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "invalid syntax. Maybe you meant \'==\' or \':=\' instead of \'=\'?")
      },
      {
        items: [
          {
            items: [
              {type: 'rule', name: 'args'},
              {type: 'string', value: ','}
            ],
            repeat: '?'
          },
          {type: 'NAME', alias: 'a'},
          {type: 'string', value: '=', alias: 'b'},
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
              }], lookahead: 'positive'
          }
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "expected argument value expression")
      },
      {
        items: [
          {type: 'rule', name: 'args', alias: 'a'},
          {type: 'rule', name: 'for_if_clauses', alias: 'b'}
        ], action: (L) => $B._PyPegen.nonparen_genexp_in_call(L.p, L.a, L.b)
      },
      {
        items: [
          {type: 'rule', name: 'args'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'rule', name: 'for_if_clauses', alias: 'b'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, $B._PyPegen.get_last_comprehension_item(PyPegen_last_item(L.b, $B.ast.comprehension)), "Generator expression must be parenthesized")
      },
      {
        items: [
          {type: 'rule', name: 'args', alias: 'a'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'args'}
        ], action: (L) => $B._PyPegen.arguments_parsing_error(L.p, L.a)
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "cannot assign to %s", PyBytes_AS_STRING(L.a.bytes))
      },
      {
        items: [
          {type: 'NAME', alias: 'a'},
          {type: 'string', value: '=', alias: 'b'},
          {type: 'rule', name: 'expression'},
          {type: 'rule', name: 'for_if_clauses'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "invalid syntax. Maybe you meant \'==\' or \':=\' instead of \'=\'?")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "expression cannot contain assignment, perhaps you meant \"==\"?")
      },
      {
        items: [
          {type: 'string', value: '**', alias: 'a'},
          {type: 'rule', name: 'expression'},
          {type: 'string', value: '='},
          {type: 'rule', name: 'expression', alias: 'b'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "cannot assign to keyword argument unpacking")
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
        ], action: (L) => $B._PyAST.IfExp(L.b, L.a, L.c, L.EXTRA)
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
    ], action: (L) => $B._PyPegen.check_legacy_stmt(L.p, L.a)?$B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "Missing parentheses in call to \'%U\'. Did you mean %U(...)?", L.a.id, L.a.id):$B.parser_constants.NULL
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
        ], action: (L) => $B._PyPegen.check_legacy_stmt(L.p, L.a)?$B.parser_constants.NULL:L.p.tokens.level==0?$B.parser_constants.NULL:$B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "invalid syntax. Perhaps you forgot a comma?")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "expected \'else\' after \'if\' expression")
      },
      {
        items: [
          {type: 'string', value: 'lambda', alias: 'a'},
          {
            items: [
              {type: 'rule', name: 'lambda_params'}
            ],
            repeat: '?'
          },
          {type: 'string', value: ':', alias: 'b'},
          {type: 'FSTRING_MIDDLE', lookahead: 'positive'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "f-string: lambda expressions are not allowed without parentheses")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "cannot use assignment expressions with %s", $B._PyPegen.get_expr_name(L.a))
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "invalid syntax. Maybe you meant \'==\' or \':=\' instead of \'=\'?")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "cannot assign to %s here. Maybe you meant \'==\' instead of \'=\'?", $B._PyPegen.get_expr_name(L.a))
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "only single target (not %s) can be annotated", $B._PyPegen.get_expr_name(L.a))
      },
      {
        items: [
          {type: 'rule', name: 'star_named_expression', alias: 'a'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'star_named_expressions', repeat: '*'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'expression'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "only single target (not tuple) can be annotated")
      },
      {
        items: [
          {type: 'rule', name: 'expression', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'expression'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "illegal target for annotation")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_INVALID_TARGET($B.parser_constants.STAR_TARGETS, L.a)
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "assignment to yield expression not possible")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "\'%s\' is an illegal expression for augmented assignment", $B._PyPegen.get_expr_name(L.a))
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
        ], action: (L) => L.a
      }]
  },
invalid_del_stmt:
  {
    items: [
      {type: 'string', value: 'del'},
      {type: 'rule', name: 'star_expressions', alias: 'a'}
    ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_INVALID_TARGET($B.parser_constants.DEL_TARGETS, L.a)
  },
invalid_block:
  {
    items: [
      {type: 'NEWLINE'},
      {type: 'INDENT', lookahead: 'negative'}
    ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "iterable unpacking cannot be used in comprehension")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, PyPegen_last_item(L.b, $B.parser_constants.expr_ty), "did you forget parentheses around the comprehension target?")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "did you forget parentheses around the comprehension target?")
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
    ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "dict unpacking cannot be used in dict comprehension")
  },
invalid_parameters:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '/', alias: 'a'},
          {type: 'string', value: ','}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "at least one argument must precede /")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "/ may appear only once")
      },
      {
        items: [
          {type: 'rule', name: 'slash_no_default', repeat: '?'},
          {type: 'rule', name: 'param_no_default', repeat: '*'},
          {type: 'rule', name: 'invalid_parameters_helper'},
          {type: 'rule', name: 'param_no_default', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "parameter without a default follows parameter with a default")
      },
      {
        items: [
          {type: 'rule', name: 'param_no_default', repeat: '*'},
          {type: 'string', value: '(', alias: 'a'},
          {type: 'rule', name: 'param_no_default', repeat: '+'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')', alias: 'b'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "Function parameters cannot be parenthesized")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "/ must be ahead of *")
      },
      {
        items: [
          {type: 'rule', name: 'param_maybe_default', repeat: '+'},
          {type: 'string', value: '/'},
          {type: 'string', value: '*', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "expected comma between / and *")
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
    ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "expected default value expression")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "named arguments must follow bare *")
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'string', value: ','},
          {type: 'TYPE_COMMENT'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("bare * has associated type comment")
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'param'},
          {type: 'string', value: '=', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "var-positional argument cannot have default value")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "* argument may appear only once")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "var-keyword argument cannot have default value")
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'param'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'param', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "arguments cannot follow var-keyword argument")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "arguments cannot follow var-keyword argument")
      }]
  },
invalid_parameters_helper:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'slash_with_default', alias: 'a'}
        ], action: (L) => $B._PyPegen.singleton_seq(L.p, L.a)
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
          {type: 'string', value: '/', alias: 'a'},
          {type: 'string', value: ','}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "at least one argument must precede /")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "/ may appear only once")
      },
      {
        items: [
          {type: 'rule', name: 'lambda_slash_no_default', repeat: '?'},
          {type: 'rule', name: 'lambda_param_no_default', repeat: '*'},
          {type: 'rule', name: 'invalid_lambda_parameters_helper'},
          {type: 'rule', name: 'lambda_param_no_default', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "parameter without a default follows parameter with a default")
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param_no_default', repeat: '*'},
          {type: 'string', value: '(', alias: 'a'},
          {type: 'rule', name: 'lambda_param', join: ',', repeat: '+'},
          {type: 'string', value: ',', repeat: '?'},
          {type: 'string', value: ')', alias: 'b'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "Lambda expression parameters cannot be parenthesized")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "/ must be ahead of *")
      },
      {
        items: [
          {type: 'rule', name: 'lambda_param_maybe_default', repeat: '+'},
          {type: 'string', value: '/'},
          {type: 'string', value: '*', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "expected comma between / and *")
      }]
  },
invalid_lambda_parameters_helper:
  {
   choices: [
      {
        items: [
          {type: 'rule', name: 'lambda_slash_with_default', alias: 'a'}
        ], action: (L) => $B._PyPegen.singleton_seq(L.p, L.a)
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("named arguments must follow bare *")
      },
      {
        items: [
          {type: 'string', value: '*'},
          {type: 'rule', name: 'lambda_param'},
          {type: 'string', value: '=', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "var-positional argument cannot have default value")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "* argument may appear only once")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "var-keyword argument cannot have default value")
      },
      {
        items: [
          {type: 'string', value: '**'},
          {type: 'rule', name: 'lambda_param'},
          {type: 'string', value: ','},
          {type: 'rule', name: 'lambda_param', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "arguments cannot follow var-keyword argument")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "arguments cannot follow var-keyword argument")
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
    ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("Cannot have two type comments on def")
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
    ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_INVALID_TARGET($B.parser_constants.STAR_TARGETS, L.a)
  },
invalid_for_target:
  {
    items: [
      {type: 'ASYNC', repeat: '?'},
      {type: 'string', value: 'for'},
      {type: 'rule', name: 'star_expressions', alias: 'a'}
    ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_INVALID_TARGET($B.parser_constants.FOR_TARGETS, L.a)
  },
invalid_group:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '('},
          {type: 'rule', name: 'starred_expression', alias: 'a'},
          {type: 'string', value: ')'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "cannot use starred expression here")
      },
      {
        items: [
          {type: 'string', value: '('},
          {type: 'string', value: '**', alias: 'a'},
          {type: 'rule', name: 'expression'},
          {type: 'string', value: ')'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "cannot use double starred expression here")
      }]
  },
invalid_import:
  {
    items: [
      {type: 'string', value: 'import', alias: 'a'},
      {type: 'rule', name: 'dotted_name', join: ',', repeat: '+'},
      {type: 'string', value: 'from'},
      {type: 'rule', name: 'dotted_name'}
    ], action: (L) => RAISE_SYNTAX_ERROR_STARTING_FROM(L.a, "Did you mean to use \'from ... import ...\' instead?")
  },
invalid_import_from_targets:
  {
    items: [
      {type: 'rule', name: 'import_from_as_names'},
      {type: 'string', value: ','},
      {type: 'NEWLINE'}
    ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("trailing comma not allowed without surrounding parentheses")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected \':\'")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected \':\'")
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
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'with\' statement on line %d", L.a.lineno)
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
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'with\' statement on line %d", L.a.lineno)
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
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'try\' statement on line %d", L.a.lineno)
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected \'except\' or \'finally\' block")
      },
      {
        items: [
          {type: 'string', value: 'try'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', repeat: '*'},
          {type: 'rule', name: 'except_block', repeat: '+'},
          {type: 'string', value: 'except', alias: 'a'},
          {type: 'string', value: '*', alias: 'b'},
          {type: 'rule', name: 'expression'},
          {
            items: [
              {type: 'string', value: 'as'},
              {type: 'NAME'}
            ],
            repeat: '?'
          },
          {type: 'string', value: ':'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "cannot have both \'except\' and \'except*\' on the same \'try\'")
      },
      {
        items: [
          {type: 'string', value: 'try'},
          {type: 'string', value: ':'},
          {type: 'rule', name: 'block', repeat: '*'},
          {type: 'rule', name: 'except_star_block', repeat: '+'},
          {type: 'string', value: 'except', alias: 'a'},
          {
            items: [
              {type: 'rule', name: 'expression'},
              {
                items: [
                  {type: 'string', value: 'as'},
                  {type: 'NAME'}
                ],
                repeat: '?'
              }
            ],
            repeat: '?'
          },
          {type: 'string', value: ':'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "cannot have both \'except\' and \'except*\' on the same \'try\'")
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
        ], action: (L) => RAISE_SYNTAX_ERROR_STARTING_FROM(L.a, "multiple exception types must be parenthesized")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected \':\'")
      },
      {
        items: [
          {type: 'string', value: 'except', alias: 'a'},
          {type: 'NEWLINE'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected \':\'")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected one or more exception types")
      }]
  },
invalid_finally_stmt:
  {
    items: [
      {type: 'string', value: 'finally', alias: 'a'},
      {type: 'string', value: ':'},
      {type: 'NEWLINE'},
      {type: 'INDENT', lookahead: 'negative'}
    ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'finally\' statement on line %d", L.a.lineno)
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
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'except\' statement on line %d", L.a.lineno)
      },
      {
        items: [
          {type: 'string', value: 'except', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'except\' statement on line %d", L.a.lineno)
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
    ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'except*\' statement on line %d", L.a.lineno)
  },
invalid_match_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'match'},
          {type: 'rule', name: 'subject_expr'},
          {type: 'NEWLINE'}
        ], action: (L) => $B.helper_functions.CHECK_VERSION("void", 10, "Pattern matching is", $B.helper_functions.RAISE_SYNTAX_ERROR("expected \':\'"))
      },
      {
        items: [
          {type: 'string', value: 'match', alias: 'a'},
          {type: 'rule', name: 'subject_expr', alias: 'subject'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'match\' statement on line %d", L.a.lineno)
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected \':\'")
      },
      {
        items: [
          {type: 'string', value: 'case', alias: 'a'},
          {type: 'rule', name: 'patterns'},
          {type: 'rule', name: 'guard', repeat: '?'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'case\' statement on line %d", L.a.lineno)
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "cannot use \'_\' as a target")
      },
      {
        items: [
          {type: 'rule', name: 'or_pattern'},
          {type: 'string', value: 'as'},
          {type: 'NAME', lookahead: 'negative'},
          {type: 'rule', name: 'expression', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "invalid pattern target")
      }]
  },
invalid_class_pattern:
  {
    items: [
      {type: 'rule', name: 'name_or_attr'},
      {type: 'string', value: '('},
      {type: 'rule', name: 'invalid_class_argument_pattern', alias: 'a'}
    ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(PyPegen_first_item(L.a, $B.ast.pattern), PyPegen_last_item(L.a, $B.ast.pattern), "positional patterns follow keyword patterns")
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
    ], action: (L) => L.a
  },
invalid_if_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'if'},
          {type: 'rule', name: 'named_expression'},
          {type: 'NEWLINE'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected \':\'")
      },
      {
        items: [
          {type: 'string', value: 'if', alias: 'a'},
          {type: 'rule', name: 'named_expression', alias: 'a'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'if\' statement on line %d", L.a.lineno)
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected \':\'")
      },
      {
        items: [
          {type: 'string', value: 'elif', alias: 'a'},
          {type: 'rule', name: 'named_expression'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'elif\' statement on line %d", L.a.lineno)
      }]
  },
invalid_else_stmt:
  {
    items: [
      {type: 'string', value: 'else', alias: 'a'},
      {type: 'string', value: ':'},
      {type: 'NEWLINE'},
      {type: 'INDENT', lookahead: 'negative'}
    ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'else\' statement on line %d", L.a.lineno)
  },
invalid_while_stmt:
  {
   choices: [
      {
        items: [
          {type: 'string', value: 'while'},
          {type: 'rule', name: 'named_expression'},
          {type: 'NEWLINE'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected \':\'")
      },
      {
        items: [
          {type: 'string', value: 'while', alias: 'a'},
          {type: 'rule', name: 'named_expression'},
          {type: 'string', value: ':'},
          {type: 'NEWLINE'},
          {type: 'INDENT', lookahead: 'negative'}
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'while\' statement on line %d", L.a.lineno)
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected \':\'")
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
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after \'for\' statement on line %d", L.a.lineno)
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
      {
        items: [
          {type: 'rule', name: 'type_params'}
        ],
        repeat: '?'
      },
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
    ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after function definition on line %d", L.a.lineno)
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
              {type: 'rule', name: 'type_params'}
            ],
            repeat: '?'
          },
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR("expected \':\'")
      },
      {
        items: [
          {type: 'string', value: 'class', alias: 'a'},
          {type: 'NAME'},
          {
            items: [
              {type: 'rule', name: 'type_params'}
            ],
            repeat: '?'
          },
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
        ], action: (L) => $B.helper_functions.RAISE_INDENTATION_ERROR("expected an indented block after class definition on line %d", L.a.lineno)
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
        ], action: (L) => RAISE_SYNTAX_ERROR_STARTING_FROM(L.a, "cannot use a starred expression in a dictionary value")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "expression expected after dictionary key and \':\'")
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
        ], action: (L) => $B.helper_functions.RAISE_ERROR_KNOWN_LOCATION(L.p, $B.parser_constants.PyExc_SyntaxError, L.a.lineno, L.a.end_col_offset-1, L.a.end_lineno, -1, "\':\' expected after dictionary key")
      },
      {
        items: [
          {type: 'rule', name: 'expression'},
          {type: 'string', value: ':'},
          {type: 'string', value: '*', alias: 'a'},
          {type: 'rule', name: 'bitwise_or'}
        ], action: (L) => RAISE_SYNTAX_ERROR_STARTING_FROM(L.a, "cannot use a starred expression in a dictionary value")
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
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "expression expected after dictionary key and \':\'")
      }]
  },
invalid_starred_expression:
  {
    items: [
      {type: 'string', value: '*', alias: 'a'},
      {type: 'rule', name: 'expression'},
      {type: 'string', value: '='},
      {type: 'rule', name: 'expression', alias: 'b'}
    ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_RANGE(L.a, L.b, "cannot assign to iterable argument unpacking")
  },
invalid_replacement_field:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'string', value: '=', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "f-string: valid expression required before \'=\'")
      },
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'string', value: '!', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "f-string: valid expression required before \'!\'")
      },
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'string', value: ':', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "f-string: valid expression required before \':\'")
      },
      {
        items: [
          {type: 'string', value: '{'},
          {type: 'string', value: '}', alias: 'a'}
        ], action: (L) => $B.helper_functions.RAISE_SYNTAX_ERROR_KNOWN_LOCATION(L.a, "f-string: valid expression required before \'}\'")
      },
      {
        items: [
          {type: 'string', value: '{'},
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
              }], lookahead: 'negative'
          }
        ], action: (L) => RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN("f-string: expecting a valid expression after \'{\'")
      },
      {
        items: [
          {type: 'string', value: '{'},
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
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '='}
                ]
              },
              {
                items: [
                  {type: 'string', value: '!'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ':'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '}'}
                ]
              }], lookahead: 'negative'
          }
        ], action: (L) => PyErr_Occurred()?$B.parser_constants.NULL:RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN("f-string: expecting \'=\', or \'!\', or \':\', or \'}\'")
      },
      {
        items: [
          {type: 'string', value: '{'},
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
          {type: 'string', value: '='},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: '!'}
                ]
              },
              {
                items: [
                  {type: 'string', value: ':'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '}'}
                ]
              }], lookahead: 'negative'
          }
        ], action: (L) => PyErr_Occurred()?$B.parser_constants.NULL:RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN("f-string: expecting \'!\', or \':\', or \'}\'")
      },
      {
        items: [
          {type: 'string', value: '{'},
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
          {type: 'string', value: '=', repeat: '?'},
          {type: 'rule', name: 'invalid_conversion_character'}
        ]
      },
      {
        items: [
          {type: 'string', value: '{'},
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
          {type: 'string', value: '=', repeat: '?'},
          {
            items: [
              {type: 'string', value: '!'},
              {type: 'NAME'}
            ],
            repeat: '?'
          },
          {
           choices: [
              {
                items: [
                  {type: 'string', value: ':'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '}'}
                ]
              }], lookahead: 'negative'
          }
        ], action: (L) => PyErr_Occurred()?$B.parser_constants.NULL:RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN("f-string: expecting \':\' or \'}\'")
      },
      {
        items: [
          {type: 'string', value: '{'},
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
          {type: 'string', value: '=', repeat: '?'},
          {
            items: [
              {type: 'string', value: '!'},
              {type: 'NAME'}
            ],
            repeat: '?'
          },
          {type: 'string', value: ':'},
          {type: 'rule', name: 'fstring_format_spec', repeat: '*'},
          {type: 'string', value: '}', lookahead: 'negative'}
        ], action: (L) => PyErr_Occurred()?$B.parser_constants.NULL:RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN("f-string: expecting \'}\', or format specs")
      },
      {
        items: [
          {type: 'string', value: '{'},
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
          {type: 'string', value: '=', repeat: '?'},
          {
            items: [
              {type: 'string', value: '!'},
              {type: 'NAME'}
            ],
            repeat: '?'
          },
          {type: 'string', value: '}', lookahead: 'negative'}
        ], action: (L) => PyErr_Occurred()?$B.parser_constants.NULL:RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN("f-string: expecting \'}\'")
      }]
  },
invalid_conversion_character:
  {
   choices: [
      {
        items: [
          {type: 'string', value: '!'},
          {
           choices: [
              {
                items: [
                  {type: 'string', value: ':'}
                ]
              },
              {
                items: [
                  {type: 'string', value: '}'}
                ]
              }], lookahead: 'positive'
          }
        ], action: (L) => RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN("f-string: missing conversion character")
      },
      {
        items: [
          {type: 'string', value: '!'},
          {type: 'NAME', lookahead: 'negative'}
        ], action: (L) => RAISE_SYNTAX_ERROR_ON_NEXT_TOKEN("f-string: invalid conversion character")
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
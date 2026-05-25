// This code implements the `-sMODULARIZE` settings by taking the generated
// JS program code (INNER_JS_CODE) and wrapping it in a factory function.

// When targeting node and ES6 we use `await import ..` in the generated code
// so the outer function needs to be marked as async.
async function _sre_init(moduleArg = {}) {
  var moduleRtn;

// include: shell.js
// include: minimum_runtime_check.js
// end include: minimum_runtime_check.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(moduleArg) => Promise<Module>
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = moduleArg;

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = !!globalThis.window;
var ENVIRONMENT_IS_WORKER = !!globalThis.WorkerGlobalScope;
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = globalThis.process?.versions?.node && globalThis.process?.type != 'renderer';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

if (ENVIRONMENT_IS_NODE) {
  // When building an ES module `require` is not normally available.
  // We need to use `createRequire()` to construct the require()` function.
  const { createRequire } = await import('node:module');
  /** @suppress{duplicate} */
  var require = createRequire(import.meta.url);

}

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
  throw toThrow;
};

var _scriptName = import.meta.url;

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var readAsync, readBinary;

if (ENVIRONMENT_IS_NODE) {

  // These modules will usually be used on Node.js. Load them eagerly to avoid
  // the complexity of lazy-loading.
  var fs = require('node:fs');

  if (_scriptName.startsWith('file:')) {
    scriptDirectory = require('node:path').dirname(require('node:url').fileURLToPath(_scriptName)) + '/';
  }

// include: node_shell_read.js
readBinary = (filename) => {
  // We need to re-wrap `file://` strings to URLs.
  filename = isFileURI(filename) ? new URL(filename) : filename;
  var ret = fs.readFileSync(filename);
  return ret;
};

readAsync = async (filename, binary = true) => {
  // See the comment in the `readBinary` function.
  filename = isFileURI(filename) ? new URL(filename) : filename;
  var ret = fs.readFileSync(filename, binary ? undefined : 'utf8');
  return ret;
};
// end include: node_shell_read.js
  if (process.argv.length > 1) {
    thisProgram = process.argv[1].replace(/\\/g, '/');
  }

  arguments_ = process.argv.slice(2);

  quit_ = (status, toThrow) => {
    process.exitCode = status;
    throw toThrow;
  };

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  try {
    scriptDirectory = new URL('.', _scriptName).href; // includes trailing slash
  } catch {
    // Must be a `blob:` or `data:` URL (e.g. `blob:http://site.com/etc/etc`), we cannot
    // infer anything from them.
  }

  {
// include: web_or_worker_shell_read.js
if (ENVIRONMENT_IS_WORKER) {
    readBinary = (url) => {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.responseType = 'arraybuffer';
      xhr.send(null);
      return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
    };
  }

  readAsync = async (url) => {
    // Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
    // See https://github.com/github/fetch/pull/92#issuecomment-140665932
    // Cordova or Electron apps are typically loaded from a file:// url.
    // So use XHR on webview if URL is a file URL.
    if (isFileURI(url)) {
      return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = () => {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            resolve(xhr.response);
            return;
          }
          reject(xhr.status);
        };
        xhr.onerror = reject;
        xhr.send(null);
      });
    }
    var response = await fetch(url, { credentials: 'same-origin' });
    if (response.ok) {
      return response.arrayBuffer();
    }
    throw new Error(response.status + ' : ' + response.url);
  };
// end include: web_or_worker_shell_read.js
  }
} else
{
}

var out = console.log.bind(console);
var err = console.error.bind(console);

// end include: shell.js

// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary;

// Wasm globals

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    // This build was created without ASSERTIONS defined.  `assert()` should not
    // ever be called in this configuration but in case there are callers in
    // the wild leave this simple abort() implementation here for now.
    abort(text);
  }
}

/**
 * Indicates whether filename is delivered via file protocol (as opposed to http/https)
 * @noinline
 */
var isFileURI = (filename) => filename.startsWith('file://');

// include: runtime_common.js
// include: runtime_stack_check.js
// end include: runtime_stack_check.js
// include: runtime_exceptions.js
// Base Emscripten EH error class
class EmscriptenEH {}

class EmscriptenSjLj extends EmscriptenEH {}

// end include: runtime_exceptions.js
// include: runtime_debug.js
// end include: runtime_debug.js
var readyPromiseResolve, readyPromiseReject;

// Memory management

var runtimeInitialized = false;



function updateMemoryViews() {
  var b = wasmMemory.buffer;
  HEAP8 = new Int8Array(b);
  Module['HEAP16'] = HEAP16 = new Int16Array(b);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
  HEAPU16 = new Uint16Array(b);
  Module['HEAP32'] = HEAP32 = new Int32Array(b);
  HEAPU32 = new Uint32Array(b);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
  HEAP64 = new BigInt64Array(b);
  HEAPU64 = new BigUint64Array(b);
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// end include: runtime_common.js
function preRun() {
  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }
  // Begin ATPRERUNS hooks
  callRuntimeCallbacks(onPreRuns);
  // End ATPRERUNS hooks
}

function initRuntime() {
  runtimeInitialized = true;

  // No ATINITS hooks

  wasmExports['__wasm_call_ctors']();

  // No ATPOSTCTORS hooks
}

function postRun() {
   // PThreads reuse the runtime from the main thread.

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  // Begin ATPOSTRUNS hooks
  callRuntimeCallbacks(onPostRuns);
  // End ATPOSTRUNS hooks
}

/**
 * @param {string|number=} what
 */
function abort(what) {
  Module['onAbort']?.(what);

  what = `Aborted(${what})`;
  // TODO(sbc): Should we remove printing and leave it up to whoever
  // catches the exception?
  err(what);

  ABORT = true;

  what += '. Build with -sASSERTIONS for more info.';

  // Use a wasm runtime error, because a JS error might be seen as a foreign
  // exception, which means we'd run destructors on it. We need the error to
  // simply make the program stop.
  // FIXME This approach does not work in Wasm EH because it currently does not assume
  // all RuntimeErrors are from traps; it decides whether a RuntimeError is from
  // a trap or not based on a hidden field within the object. So at the moment
  // we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
  // allows this in the wasm spec.

  // Suppress closure compiler warning here. Closure compiler's builtin extern
  // definition for WebAssembly.RuntimeError claims it takes no arguments even
  // though it can.
  // TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
  /** @suppress {checkTypes} */
  var e = new WebAssembly.RuntimeError(what);

  readyPromiseReject?.(e);
  // Throw the error whether or not MODULARIZE is set because abort is used
  // in code paths apart from instantiation where an exception is expected
  // to be thrown when abort is called.
  throw e;
}

var wasmBinaryFile;

function findWasmBinary() {

  if (Module['locateFile']) {
    return locateFile('_sre.wasm');
  }

  // Use bundler-friendly `new URL(..., import.meta.url)` pattern; works in browsers too.
  return new URL('_sre.wasm', import.meta.url).href;

}

function getBinarySync(file) {
  if (file == wasmBinaryFile && wasmBinary) {
    return new Uint8Array(wasmBinary);
  }
  if (readBinary) {
    return readBinary(file);
  }
  // Throwing a plain string here, even though it not normally advisable since
  // this gets turning into an `abort` in instantiateArrayBuffer.
  throw 'both async and sync fetching of the wasm failed';
}

async function getWasmBinary(binaryFile) {
  // If we don't have the binary yet, load it asynchronously using readAsync.
  if (!wasmBinary) {
    // Fetch the binary using readAsync
    try {
      var response = await readAsync(binaryFile);
      return new Uint8Array(response);
    } catch {
      // Fall back to getBinarySync below;
    }
  }

  // Otherwise, getBinarySync should be able to get it synchronously
  return getBinarySync(binaryFile);
}

async function instantiateArrayBuffer(binaryFile, imports) {
  try {
    var binary = await getWasmBinary(binaryFile);
    var instance = await WebAssembly.instantiate(binary, imports);
    return instance;
  } catch (reason) {
    err(`failed to asynchronously prepare wasm: ${reason}`);

    abort(reason);
  }
}

async function instantiateAsync(binary, binaryFile, imports) {
  if (!binary
      // Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
      && !isFileURI(binaryFile)
      // Avoid instantiateStreaming() on Node.js environment for now, as while
      // Node.js v18.1.0 implements it, it does not have a full fetch()
      // implementation yet.
      //
      // Reference:
      //   https://github.com/emscripten-core/emscripten/pull/16917
      && !ENVIRONMENT_IS_NODE
     ) {
    try {
      var response = fetch(binaryFile, { credentials: 'same-origin' });
      var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
      return instantiationResult;
    } catch (reason) {
      // We expect the most common failure cause to be a bad MIME type for the binary,
      // in which case falling back to ArrayBuffer instantiation should work.
      err(`wasm streaming compile failed: ${reason}`);
      err('falling back to ArrayBuffer instantiation');
      // fall back of instantiateArrayBuffer below
    };
  }
  return instantiateArrayBuffer(binaryFile, imports);
}

function getWasmImports() {
  // prepare imports
  var imports = {
    'env': wasmImports,
    'wasi_snapshot_preview1': wasmImports,
  };
  return imports;
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
async function createWasm() {
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  /** @param {WebAssembly.Module=} module*/
  function receiveInstance(instance, module) {
    wasmExports = instance.exports;

    assignWasmExports(wasmExports);

    updateMemoryViews();

    return wasmExports;
  }

  // Prefer streaming instantiation if available.
  function receiveInstantiationResult(result) {
    // 'result' is a ResultObject object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
    // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
    // When the regression is fixed, can restore the above PTHREADS-enabled path.
    return receiveInstance(result['instance']);
  }

  var info = getWasmImports();

  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to
  // run the instantiation parallel to any other async startup actions they are
  // performing.
  // Also pthreads and wasm workers initialize the wasm instance through this
  // path.
  if (Module['instantiateWasm']) {
    return new Promise((resolve, reject) => {
        Module['instantiateWasm'](info, (inst, mod) => {
          resolve(receiveInstance(inst, mod));
        });
    });
  }

  wasmBinaryFile ??= findWasmBinary();
  var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
  var exports = receiveInstantiationResult(result);
  return exports;
}

// end include: preamble.js

// Begin JS library code


  class ExitStatus {
      name = 'ExitStatus';
      constructor(status) {
        this.message = `Program terminated with exit(${status})`;
        this.status = status;
      }
    }

  /** @type {!Int16Array} */
  var HEAP16;

  /** @type {!Int32Array} */
  var HEAP32;

  /** not-@type {!BigInt64Array} */
  var HEAP64;

  /** @type {!Int8Array} */
  var HEAP8;

  /** @type {!Float32Array} */
  var HEAPF32;

  /** @type {!Float64Array} */
  var HEAPF64;

  /** @type {!Uint16Array} */
  var HEAPU16;

  /** @type {!Uint32Array} */
  var HEAPU32;

  /** not-@type {!BigUint64Array} */
  var HEAPU64;

  /** @type {!Uint8Array} */
  var HEAPU8;

  var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        // Pass the module as the first argument.
        callbacks.shift()(Module);
      }
    };
  var onPostRuns = [];
  var addOnPostRun = (cb) => onPostRuns.push(cb);

  var onPreRuns = [];
  var addOnPreRun = (cb) => onPreRuns.push(cb);


  
    /**
   * @param {number} ptr
   * @param {string} type
   */
  function getValue(ptr, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': return HEAP8[ptr];
      case 'i8': return HEAP8[ptr];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP64[((ptr)>>3)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      case '*': return HEAPU32[((ptr)>>2)];
      default: abort(`invalid type for getValue: ${type}`);
    }
  }

  var noExitRuntime = true;

  
    /**
   * @param {number} ptr
   * @param {number} value
   * @param {string} type
   */
  function setValue(ptr, value, type = 'i8') {
    if (type.endsWith('*')) type = '*';
    switch (type) {
      case 'i1': HEAP8[ptr] = value; break;
      case 'i8': HEAP8[ptr] = value; break;
      case 'i16': HEAP16[((ptr)>>1)] = value; break;
      case 'i32': HEAP32[((ptr)>>2)] = value; break;
      case 'i64': HEAP64[((ptr)>>3)] = BigInt(value); break;
      case 'float': HEAPF32[((ptr)>>2)] = value; break;
      case 'double': HEAPF64[((ptr)>>3)] = value; break;
      case '*': HEAPU32[((ptr)>>2)] = value; break;
      default: abort(`invalid type for setValue: ${type}`);
    }
  }

  var stackRestore = (val) => __emscripten_stack_restore(val);

  var stackSave = () => _emscripten_stack_get_current();

  

  var WasthonRT = {
  _b_:null,
  '$B':null,
  handles:null,
  nextHandleId:5,
  freeList:[],
  SLOT_NONE:1,
  SLOT_TRUE:2,
  SLOT_FALSE:3,
  SLOT_NOTIMPLEMENTED:4,
  pendingException:null,
  moduleDefs:null,
  modules:null,
  types:null,
  init:function() {
              var B = globalThis.__BRYTHON__;
              if (!B) {
                  throw new Error("Wasthon bridge: __BRYTHON__ global not found. " +
                      "Brython must be loaded before instantiating a Wasthon module.");
              }
              this.$B = B;
              this._b_ = B.builtins;
              this.handles = new Map();
              this.moduleDefs = new Map();
              this.modules = new Map();
              this.types = new Map();
  
              this.handles.set(this.SLOT_NONE,  this._b_.None);
              this.handles.set(this.SLOT_TRUE,  this._b_.True);
              this.handles.set(this.SLOT_FALSE, this._b_.False);
              this.handles.set(this.SLOT_NOTIMPLEMENTED, this._b_.NotImplemented);
          },
  _allocSentinelId:function() {
              if (this.freeList.length > 0) return this.freeList.pop();
              // Sentinel IDs and malloc-derived struct-pointer handles share
              // the same key space in `handles`. After ~tens of thousands of
              // allocations, nextHandleId can collide with a real type-struct
              // pointer (e.g. Dialect_Type = 73112) and overwrite the binding.
              // Skip past any in-use slot.
              while (this.handles.has(this.nextHandleId)) this.nextHandleId++;
              return this.nextHandleId++;
          },
  wrap:function(obj) {
              if (obj === undefined || obj === null) return 0;
              if (obj === this._b_.None)  return this.SLOT_NONE;
              if (obj === this._b_.True)  return this.SLOT_TRUE;
              if (obj === this._b_.False) return this.SLOT_FALSE;
              if (obj === this._b_.NotImplemented) return this.SLOT_NOTIMPLEMENTED;
              // Instances allocated by wasthon_object_gc_new carry their
              // C-side pointer as __wasthon_ptr__. The handle IS that pointer
              // so C-side `self->field` dereferences hit the right linear
              // memory. Round-tripping the same instance through wrap/unwrap
              // (e.g. when a dict caches a struct instance and another call
              // reads it back) must preserve this pointer-handle identity —
              // otherwise we get a fresh sentinel id, the C code casts it
              // as if it were a struct pointer, and dereferences garbage.
              if (obj.__wasthon_ptr__) {
                  if (!this.handles.has(obj.__wasthon_ptr__)) {
                      this.handles.set(obj.__wasthon_ptr__, obj);
                  }
                  return obj.__wasthon_ptr__;
              }
              var id = this._allocSentinelId();
              this.handles.set(id, obj);
              return id;
          },
  unwrap:function(handle) {
              // Treat handle 0 as Python NULL pointer; everything else looks
              // up the table by exact presence. Falsy *values* (0, "", false)
              // are valid Python objects — we must NOT coalesce them to null.
              if (handle === 0) return null;
              return this.handles.has(handle) ? this.handles.get(handle) : null;
          },
  bindInstance:function(ptr, brythonInstance) {
              this.handles.set(ptr, brythonInstance);
          },
  release:function(handle) {
              if (handle === 0) return;
              if (handle === this.SLOT_NONE ||
                  handle === this.SLOT_TRUE ||
                  handle === this.SLOT_FALSE ||
                  handle === this.SLOT_NOTIMPLEMENTED) return;
              this.handles.delete(handle);
              // Only sentinel-range IDs (small ints) are recycled; pointer
              // handles aren't (their memory is freed by the dealloc path).
              if (handle < 0x10000) this.freeList.push(handle);
          },
  lastCall:null,
  trace:function(name, info) {
              this.lastCall = name + (info ? '(' + info + ')' : '');
              // Uncomment for verbose: console.log('[wasthon trace]', this.lastCall);
              console.log('[wasthon trace]', this.lastCall);
          },
  ensureTypeStruct:function(cls) {
              if (!cls) return 0;
              if (cls.__wasthon_type_handle__) return cls.__wasthon_type_handle__;
              if (!this._defaultTpAlloc) this._defaultTpAlloc = _wasthon_get_default_tp_alloc();
              if (!this._builtinTpIter)  this._builtinTpIter  = _wasthon_get_builtin_tp_iter();
              var typeStructPtr = _malloc(60);
              HEAPU8.fill(0, typeStructPtr, typeStructPtr + 60);
              // tp_dict at offset 4: ensure the class has a dict, then wrap.
              var dictObj = this.$B.get_dict(cls);
              if (!dictObj) {
                  this.$B.init_dict(cls);
                  dictObj = this.$B.get_dict(cls);
              }
              HEAP32[(typeStructPtr +  4) >> 2] = this.wrap(dictObj);
              // tp_name (offset 8): use the class's tp_name if known.
              // Skip — leaving 0 (NULL) is fine for callers that don't read it.
              HEAP32[(typeStructPtr + 12) >> 2] = this._defaultTpAlloc;
              HEAP32[(typeStructPtr + 20) >> 2] = this._builtinTpIter;
              cls.__wasthon_type_handle__ = typeStructPtr;
              this.handles.set(typeStructPtr, cls);
              // Register a minimal types-map entry so callers that look up
              // via rt.types.get(handle) (PyModule_AddType, etc.) succeed.
              // The full PyType_FromModuleAndSpec entry would also have
              // basicsize/itemsize/flags/slots/methods/getset — for Brython-
              // originating classes those fields are inapplicable.
              /* tp_name is conventionally "module.qualname.LeafName" (dotted).
             * PyModule_AddType wants only the leaf name as the attribute,
             * so split on the last dot here. */
              var fullName = cls.tp_name || (cls.$infos && cls.$infos.__name__) || '<type>';
              var leafIdx = fullName.lastIndexOf('.');
              var shortName = leafIdx >= 0 ? fullName.slice(leafIdx + 1) : fullName;
              this.types.set(typeStructPtr, {
                  brythonClass: cls,
                  shortName: shortName,
                  fullName: fullName,
              });
              return typeStructPtr;
          },
  wrapMaybeType:function(obj) {
              if (obj && this.$B && this._b_ && this._b_.type) {
                  try {
                      if (this.$B.$isinstance(obj, this._b_.type)) {
                          return this.ensureTypeStruct(obj);
                      }
                  } catch (_) {}
              }
              return this.wrap(obj);
          },
  setError:function(excHandle, msg) {
              this.pendingException = { exc: excHandle, msg: msg };
          },
  coerceInt:function(obj) {
              if (typeof obj === 'number' || typeof obj === 'bigint') return obj;
              try {
                  var n = this._b_.int.$factory(obj);
                  if (typeof n === 'number' || typeof n === 'bigint') return n;
              } catch (_) {}
              return undefined;
          },
  forwardError:function(e, fallbackCls) {
              var rt = this;
              var cls = fallbackCls || rt._b_.RuntimeError;
              var msg;
              try {
                  if (e && (e.__class__ || (e.ob_type && e.args !== undefined))) {
                      cls = e.__class__ || rt.$B.get_class(e) || cls;
                      if (e.args && e.args.length > 0) {
                          msg = String(e.args[0]);
                      } else {
                          try { msg = rt.$B.class_name(e); } catch (_) { msg = ''; }
                      }
                  } else if (e && typeof e.message === 'string') {
                      msg = e.message;
                  } else {
                      msg = String(e);
                  }
              } catch (_) {
                  msg = 'error';
              }
              this.pendingException = { exc: rt.wrap(cls), msg: msg };
          },
  asJSStr:function(obj) {
              if (typeof obj === 'string') return obj;
              if (obj instanceof String) return obj.valueOf();
              // Brython str-like: has a __class__ of _b_.str and toString/valueOf.
              if (obj && obj.__class__ === this._b_.str) {
                  if (typeof obj.valueOf === 'function') {
                      var v = obj.valueOf();
                      if (typeof v === 'string') return v;
                  }
                  return String(obj);
              }
              // PyUnicode_New placeholder: linear-memory buffer waiting for
              // PyUnicode_1BYTE_DATA + memcpy to populate. Materialize once
              // and cache on the placeholder itself.
              if (obj && obj.__wasthon_unicode_buf__) {
                  if (obj.__wasthon_unicode_cached__ !== undefined) {
                      return obj.__wasthon_unicode_cached__;
                  }
                  var buf = obj.__wasthon_unicode_buf__;
                  var size = obj.__wasthon_unicode_size__;
                  var kind = obj.__wasthon_unicode_kind__;
                  var chars = new Array(size);
                  for (var i = 0; i < size; i++) {
                      if (kind === 4)      chars[i] = String.fromCodePoint(HEAPU32[(buf + i * 4) >> 2]);
                      else if (kind === 2) chars[i] = String.fromCodePoint(HEAPU16[(buf + i * 2) >> 1]);
                      else                 chars[i] = String.fromCharCode(HEAPU8[buf + i]);
                  }
                  obj.__wasthon_unicode_cached__ = chars.join('');
                  return obj.__wasthon_unicode_cached__;
              }
              return null;
          },
  };
  function _PyBool_FromLong(v) { return v ? WasthonRT.SLOT_TRUE : WasthonRT.SLOT_FALSE; }

  function _PyBytes_FromObject(handle) {
          var rt = WasthonRT;
          var obj = rt.unwrap(handle);
          if (obj === null) return 0;
          try {
              return rt.wrap(rt._b_.bytes.$factory(obj));
          } catch (e) {
              rt.setError(rt.wrap(rt._b_.TypeError),
                  "PyBytes_FromObject: cannot convert");
              return 0;
          }
      }

  function _PyBytes_FromStringAndSize(strPtr, size) {
          var rt = WasthonRT;
          if (strPtr === 0) {
              // Writable buffer path (decompressors, codec output, etc.).
              // Back the bytes object directly with linear memory so that
              // PyBytes_AsString returns its pointer without a malloc+copy,
              // and the producer (C) writes straight into the memory the
              // bytes object owns. _PyBytes_Resize materializes the final
              // source array from this buffer in one pass. Net cost on the
              // output path drops from 4 O(n) passes to 3.
              var ptr = _malloc((size | 0) + 1);
              if (ptr === 0) {
                  rt.setError(rt.wrap(rt._b_.MemoryError),
                      "PyBytes_FromStringAndSize");
                  return 0;
              }
              HEAPU8.fill(0, ptr, ptr + size + 1);
              var src = new Array(size);
              for (var i = 0; i < size; i++) src[i] = 0;
              var bytesObj = rt._b_.bytes.$factory(src);
              bytesObj.__wasthon_cstr__ = ptr;
              bytesObj.__wasthon_cstr_size__ = size;
              return rt.wrap(bytesObj);
          }
          // Initial-content path: copy from C buffer to JS Array in one pass
          // (skips the Uint8Array → Array.from intermediate).
          var arr = new Array(size);
          for (var i = 0; i < size; i++) arr[i] = HEAPU8[strPtr + i];
          return rt.wrap(rt._b_.bytes.$factory(arr));
      }

  function _PyBytes_Join(sepH, seqH) {
          var rt = WasthonRT;
          var sep = rt.unwrap(sepH);
          var seq = rt.unwrap(seqH);
          if (!sep || !seq) return 0;
          try {
              var out = sep.join ? sep.join(seq) :
                        rt.$B.$getattr(sep, 'join')(seq);
              return rt.wrap(out);
          } catch (e) {
              rt.forwardError(e, rt._b_.TypeError);
              return 0;
          }
      }

  function _PyBytes_Size(bytesHandle) {
          var obj = WasthonRT.unwrap(bytesHandle);
          if (obj === null) return 0;
          if (obj.source) return obj.source.length;
          if (obj.length !== undefined) return obj.length;
          return 0;
      }

  function _PyCallIter_New(callableH, sentinelH) {
          var rt = WasthonRT;
          var fn = rt.unwrap(callableH);
          var sentinel = rt.unwrap(sentinelH);
          if (!fn) return 0;
          // Brython's callable_iterator(fn, sentinel) — emulate with a generator.
          function* gen() {
              while (true) {
                  var v = rt.$B.$call(fn);
                  if (v === sentinel) return;
                  yield v;
              }
          }
          return rt.wrap(gen());
      }

  function _PyCallable_Check(handle) {
          var obj = WasthonRT.unwrap(handle);
          return (typeof obj === 'function' || (obj && obj.$is_func)) ? 1 : 0;
      }

  function _PyDictProxy_New(dictH) {
          // mappingproxy in Brython
          var rt = WasthonRT;
          var d = rt.unwrap(dictH);
          if (d === null) return 0;
          try { return rt.wrap(rt.$B.mappingproxy.tp_new(rt.$B.mappingproxy, [d])); }
          catch (e) { return 0; }
      }

  function _PyDict_GET_SIZE(handle) {
          var obj = WasthonRT.unwrap(handle);
          if (obj === null) return 0;
          // Brython dicts: prefer .__len__ if a Python dict; else JS object key count.
          if (obj && typeof obj.size === 'number') return obj.size;
          if (obj && obj.$jsobj) return Object.keys(obj.$jsobj).length;
          if (Array.isArray(obj)) return obj.length;
          // Symbol-keyed Brython dict: walk own keys.
          if (typeof obj === 'object') {
              var n = 0;
              for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) n++;
              return n;
          }
          return 0;
      }

  function _PyDict_GetItemWithError(dictH, keyH) {
          var rt = WasthonRT;
          var d = rt.unwrap(dictH);
          var k = rt.unwrap(keyH);
          if (!d) return 0;
          try {
              var v = rt._b_.dict.$getitem(d, k);
              return v === undefined ? 0 : rt.wrap(v);
          } catch (e) {
              // KeyError → return NULL with NO exception (per CPython contract).
              return 0;
          }
      }

  function _PyDict_New() {
          return WasthonRT.wrap(WasthonRT.$B.empty_dict());
      }

  function _PyErr_CheckSignals() { return 0; }

  function _PyErr_Clear() {
          WasthonRT.pendingException = null;
      }

  function _PyErr_ExceptionMatches(excHandle) {
          var rt = WasthonRT;
          if (!rt.pendingException) return 0;
          var current = rt.unwrap(rt.pendingException.exc);
          var target = rt.unwrap(excHandle);
          if (!current || !target) return 0;
          try {
              return rt.$B.$issubclass(current, target) ? 1 : 0;
          } catch (e) {
              return current === target ? 1 : 0;
          }
      }

  
  var UTF8Decoder = globalThis.TextDecoder && new TextDecoder();
  
  var findStringEnd = (heapOrArray, idx, maxBytesToRead, ignoreNul) => {
      var maxIdx = idx + maxBytesToRead;
      if (ignoreNul) return maxIdx;
      // TextDecoder needs to know the byte length in advance, it doesn't stop on
      // null terminator by itself.
      // As a tiny code save trick, compare idx against maxIdx using a negation,
      // so that maxBytesToRead=undefined/NaN means Infinity.
      while (heapOrArray[idx] && !(idx >= maxIdx)) ++idx;
      return idx;
    };
  
    /**
   * Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
   * array that contains uint8 values, returns a copy of that string as a
   * Javascript String object.
   * heapOrArray is either a regular array, or a JavaScript typed array view.
   * @param {number=} idx
   * @param {number=} maxBytesToRead
   * @param {boolean=} ignoreNul - If true, the function will not stop on a NUL character.
   * @return {string}
   */
  var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead, ignoreNul) => {
  
      var endPtr = findStringEnd(heapOrArray, idx, maxBytesToRead, ignoreNul);
  
      // When using conditional TextDecoder, skip it for short strings as the overhead of the native call is not worth it.
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = '';
      while (idx < endPtr) {
        // For UTF8 byte structure, see:
        // http://en.wikipedia.org/wiki/UTF-8#Description
        // https://www.ietf.org/rfc/rfc2279.txt
        // https://tools.ietf.org/html/rfc3629
        var u0 = heapOrArray[idx++];
        if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 0xF0) == 0xE0) {
          u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
        } else {
          u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
        }
  
        if (u0 < 0x10000) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 0x10000;
          str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
        }
      }
      return str;
    };
  
    /**
   * Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
   * emscripten HEAP, returns a copy of that string as a Javascript String object.
   *
   * @param {number} ptr
   * @param {number=} maxBytesToRead - An optional length that specifies the
   *   maximum number of bytes to read. You can omit this parameter to scan the
   *   string until the first 0 byte. If maxBytesToRead is passed, and the string
   *   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
   *   string will cut short at that byte index.
   * @param {boolean=} ignoreNul - If true, the function will not stop on a NUL character.
   * @return {string}
   */
  var UTF8ToString = (ptr, maxBytesToRead, ignoreNul) => {
      return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead, ignoreNul) : '';
    };
  function _PyErr_Format(excHandle, fmtPtr, varargs) {
          var rt = WasthonRT;
          var fmt = fmtPtr === 0 ? "" : UTF8ToString(fmtPtr);
          var out = "", p = varargs;
          for (var i = 0; i < fmt.length; i++) {
              if (fmt[i] !== '%') { out += fmt[i]; continue; }
              // Consume optional length modifiers (l, ll, z).
              var spec = "";
              while (i + 1 < fmt.length && "lhzj".indexOf(fmt[i+1]) !== -1) { spec += fmt[++i]; }
              var c = fmt[++i];
              if (c === 's') {
                  var sp = HEAP32[p >> 2]; p += 4;
                  out += (sp === 0) ? "(null)" : UTF8ToString(sp);
              } else if (c === 'd' || c === 'i') {
                  out += String(HEAP32[p >> 2] | 0); p += 4;
              } else if (c === 'u') {
                  out += String(HEAPU32[p >> 2] >>> 0); p += 4;
              } else if (c === 'p') {
                  out += "0x" + (HEAPU32[p >> 2] >>> 0).toString(16); p += 4;
              } else if (c === 'R' || c === 'S' || c === 'A') {
                  var h = HEAP32[p >> 2]; p += 4;
                  var obj = rt.unwrap(h);
                  try { out += String(obj); } catch (_) { out += "<obj>"; }
              } else if (c === '%') {
                  out += '%';
              } else {
                  out += '%' + spec + c;  // unknown — leave as-is
              }
          }
          rt.setError(excHandle, out);
          return 0;
      }

  function _PyErr_NoMemory() {
          var rt = WasthonRT;
          rt.setError(rt.wrap(rt._b_.MemoryError), "out of memory");
          return 0;  // NULL
      }

  function _PyErr_Occurred() {
          return WasthonRT.pendingException ? WasthonRT.pendingException.exc : 0;
      }

  
  function _PyErr_SetString(excHandle, msgPtr) {
          var msg = msgPtr === 0 ? "" : UTF8ToString(msgPtr);
          WasthonRT.setError(excHandle, msg);
      }

  
  function _PyImport_ImportModuleAttrString(modnamePtr, attrPtr) {
          var rt = WasthonRT;
          var modname = UTF8ToString(modnamePtr);
          var attr = UTF8ToString(attrPtr);
          try {
              var imp = rt._b_.__import__;
              var mod;
              if (modname.indexOf('.') !== -1) {
                  var parts = modname.split('.');
                  var leaf = parts[parts.length - 1];
                  mod = imp(modname, rt._b_.None, rt._b_.None,
                            rt._b_.tuple.$factory([leaf]));
                  if (mod && mod.__name__ !== modname) {
                      for (var i = 1; i < parts.length; i++) {
                          var sub = rt.$B.$getattr(mod, parts[i], rt._b_.None);
                          if (sub && sub !== rt._b_.None) mod = sub;
                      }
                  }
              } else {
                  mod = imp(modname);
              }
              return rt.wrap(rt.$B.$getattr(mod, attr));
          } catch (e) {
              rt.setError(rt.wrap(rt._b_.ImportError),
                  "wasthon: failed to import " + modname + "." + attr + ": " + (e.message || e));
              return 0;
          }
      }

  function _PyIndex_Check(handle) {
          var obj = WasthonRT.unwrap(handle);
          return (typeof obj === 'number' && Number.isInteger(obj)) ||
                 typeof obj === 'bigint' ? 1 : 0;
      }

  function _PyList_Append(listHandle, itemHandle) {
          var arr = WasthonRT.unwrap(listHandle);
          if (!Array.isArray(arr)) return -1;
          arr.push(WasthonRT.unwrap(itemHandle));
          return 0;
      }

  function _PyList_New(size) {
          var arr = new Array(size | 0);
          for (var i = 0; i < size; i++) arr[i] = WasthonRT._b_.None;
          // Tag as a Brython list so Brython routines accept it.
          arr.__class__ = WasthonRT._b_.list;
          return WasthonRT.wrap(arr);
      }

  function _PyList_Size(listHandle) {
          var arr = WasthonRT.unwrap(listHandle);
          return Array.isArray(arr) ? arr.length : 0;
      }

  function _PyLong_AsInt(handle) {
          var rt = WasthonRT;
          var n = rt.coerceInt(rt.unwrap(handle));
          if (n === undefined) {
              rt.setError(rt.wrap(rt._b_.TypeError), "an integer is required");
              return -1;
          }
          return (typeof n === 'bigint' ? Number(n) : n) | 0;
      }

  function _PyLong_AsSsize_t(handle) {
          var rt = WasthonRT;
          var n = rt.coerceInt(rt.unwrap(handle));
          if (n === undefined) {
              rt.setError(rt.wrap(rt._b_.TypeError), "an integer is required");
              return -1;
          }
          return (typeof n === 'bigint' ? Number(n) : n) | 0;
      }

  function _PyLong_AsUnsignedLong(handle) {
          var rt = WasthonRT;
          var n = rt.coerceInt(rt.unwrap(handle));
          if (n === undefined) {
              rt.setError(rt.wrap(rt._b_.TypeError), "an integer is required");
              return 0xFFFFFFFF;
          }
          return (typeof n === 'bigint' ? Number(n) : n) >>> 0;
      }

  function _PyLong_FromLong(v) {
          // Brython ints are JS numbers (or BigInt for long). For sha2-scale
          // values, plain JS number is correct.
          return WasthonRT.wrap(v | 0);
      }

  function _PyLong_FromSsize_t(v) { return WasthonRT.wrap(v | 0); }

  function _PyLong_FromUnsignedLong(v) { return WasthonRT.wrap(v >>> 0); }

  
  function _PyModuleDef_Init(defPtr) {
          var rt = WasthonRT;
          if (rt.moduleDefs.has(defPtr)) return defPtr;  // idempotent
          var namePtr = HEAP32[(defPtr +  4) >> 2];
          var docPtr  = HEAP32[(defPtr +  8) >> 2];
          var size    = HEAP32[(defPtr + 12) >> 2];
          var methods = HEAP32[(defPtr + 16) >> 2];
          var slots   = HEAP32[(defPtr + 20) >> 2];
          rt.moduleDefs.set(defPtr, {
              defPtr: defPtr,
              name:    namePtr ? UTF8ToString(namePtr) : "",
              doc:     docPtr  ? UTF8ToString(docPtr)  : "",
              size:    size,
              methods: methods,
              slots:   slots,
          });
          return defPtr;
      }

  
  function _PyModule_Add(moduleHandle, namePtr, valueHandle) {
          var rt = WasthonRT;
          var modObj = rt.unwrap(moduleHandle);
          if (!modObj || namePtr === 0) return -1;
          rt.$B.module_setattr(modObj, UTF8ToString(namePtr), rt.unwrap(valueHandle));
          return 0;
      }

  
  function _PyModule_AddIntConstant(moduleHandle, namePtr, value) {
          var rt = WasthonRT;
          var modObj = rt.unwrap(moduleHandle);
          if (!modObj || namePtr === 0) return -1;
          rt.$B.module_setattr(modObj, UTF8ToString(namePtr), value | 0);
          return 0;
      }

  
  function _PyModule_AddStringConstant(moduleHandle, namePtr, valuePtr) {
          var rt = WasthonRT;
          var modObj = rt.unwrap(moduleHandle);
          if (!modObj || namePtr === 0) return -1;
          var s = valuePtr === 0 ? "" : UTF8ToString(valuePtr);
          rt.$B.module_setattr(modObj, UTF8ToString(namePtr), s);
          return 0;
      }

  function _PyNumber_AsSsize_t(handle, excH) {
          var rt = WasthonRT;
          var obj = rt.unwrap(handle);
          if (typeof obj === 'number') return obj | 0;
          if (typeof obj === 'bigint') return Number(obj) | 0;
          if (excH) rt.setError(excH, "cannot convert to Py_ssize_t");
          return -1;
      }

  function _PyObject_CallOneArg(fnHandle, argHandle) {
          var rt = WasthonRT;
          var fn = rt.unwrap(fnHandle);
          var arg = rt.unwrap(argHandle);
          if (!fn) return 0;
          try { return rt.wrap(rt.$B.$call(fn, arg)); }
          catch (e) {
              rt.forwardError(e, rt._b_.RuntimeError);
              return 0;
          }
      }

  
  function _PyObject_GetAttrString(objHandle, namePtr) {
          var rt = WasthonRT;
          var obj = rt.unwrap(objHandle);
          if (namePtr === 0) {
              rt.setError(rt.wrap(rt._b_.SystemError), "PyObject_GetAttrString: NULL name");
              return 0;
          }
          var name = UTF8ToString(namePtr);
          rt.trace('PyObject_GetAttrString', name);
          if (!obj) {
              rt.setError(rt.wrap(rt._b_.SystemError),
                  "PyObject_GetAttrString: obj handle " + objHandle + " did not resolve (name=" + name + ")");
              return 0;
          }
          try {
              var v = rt.$B.$getattr(obj, name);
              if (v === undefined || v === null) {
                  rt.setError(rt.wrap(rt._b_.AttributeError), "no attribute '" + name + "'");
                  return 0;
              }
              return rt.wrapMaybeType(v);
          }
          catch (e) {
              rt.setError(rt.wrap(rt._b_.AttributeError),
                  "PyObject_GetAttrString: '" + name + "' (" + (e.message || e) + ")");
              return 0;
          }
      }

  function _PyObject_Hash(handle) {
          var rt = WasthonRT;
          var obj = rt.unwrap(handle);
          if (obj === null) return 0;
          try { return rt.$B.$hash(obj) | 0; } catch (e) { return -1; }
      }

  function _PyObject_RichCompareBool(o1H, o2H, op) {
          var rt = WasthonRT;
          var a = rt.unwrap(o1H);
          var b = rt.unwrap(o2H);
          var r;
          switch (op) {
              case 0: r = a <  b; break;
              case 1: r = a <= b; break;
              case 2: r = a === b || rt.$B.$eq(a, b); break;
              case 3: r = !(a === b || rt.$B.$eq(a, b)); break;
              case 4: r = a >  b; break;
              case 5: r = a >= b; break;
              default: return -1;
          }
          return r ? 1 : 0;
      }

  function _PyObject_Vectorcall(callableH, argsPtr, nargsf, kwnamesH) {
          var rt = WasthonRT;
          var fn = rt.unwrap(callableH);
          if (fn === null) return 0;
          var nargs = nargsf & 0x7FFFFFFF;  // PY_VECTORCALL_ARGUMENTS_OFFSET mask
          var args = [];
          for (var i = 0; i < nargs; i++) {
              args.push(rt.unwrap(HEAP32[(argsPtr + i * 4) >> 2]));
          }
          // kwnames support is rare in sre's call sites; skip for now.
          try {
              return rt.wrap(rt.$B.$call.apply(rt.$B, [fn].concat(args)));
          } catch (e) {
              rt.forwardError(e, rt._b_.RuntimeError);
              return 0;
          }
      }

  function _PyTuple_GET_SIZE(handle) {
          var obj = WasthonRT.unwrap(handle);
          if (obj === null) return 0;
          // Brython tuples are arrays with __class__ = _b_.tuple.
          return obj.length || 0;
      }

  function _PyTuple_GetItem(tupH, i) {
          var rt = WasthonRT;
          var t = rt.unwrap(tupH);
          if (!t) return 0;
          try {
              var v = rt.$B.$getitem(t, i);
              return rt.wrap(v);
          } catch (e) { return 0; }
      }

  function _PyTuple_New(size) {
          /* Brython tuples aren't bare tagged JS Arrays — they go through
         * tuple.$factory which sets up the right repr / equality / hash
         * machinery. Pre-fill with None placeholders that PyTuple_SetItem
         * will overwrite while the C-side builder populates the slots. */
          var rt = WasthonRT;
          var arr = new Array(size | 0);
          for (var i = 0; i < (size | 0); i++) arr[i] = rt._b_.None;
          return rt.wrap(rt._b_.tuple.$factory(arr));
      }

  function _PyTuple_SetItem(tupH, i, itemH) {
          var rt = WasthonRT;
          var t = rt.unwrap(tupH);
          if (!t) return -1;
          /* Brython tuples store items either directly as JS Array elements
         * (Array.isArray true with .__class__ === tuple) or via an
         * internal field — handle both. */
          var item = rt.unwrap(itemH);
          if (Array.isArray(t)) { t[i] = item; return 0; }
          if (t[i] !== undefined) { t[i] = item; return 0; }
          return -1;
      }

  
  var WasthonRT_module_state = {
  };
  
  
  
  var wasmTableMirror = [];
  
  
  var getWasmTableEntry = (funcPtr) => {
      var func = wasmTableMirror[funcPtr];
      if (!func) {
        /** @suppress {checkTypes} */
        wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr);
      }
      return func;
    };
  function __wasthon_make_trampoline(fnPtr, flags, moduleHandle, methName, moduleScope, classHandle) {
          var rt = WasthonRT;
          var FASTCALL = 0x0080, KEYWORDS = 0x0002, NOARGS = 0x0004, METH_O_ = 0x0008, METH_METHOD = 0x0200;
  
          return function() {
              // Collect args + kw the way Brython conveys them. Brython
              // method calls pass `self` as args[0] for instance methods,
              // and positional args follow. Module-scope functions don't
              // have a self.
              var jsArgs = Array.from(arguments);
              // Brython kwargs convention: last arg is sometimes a $kw object.
              // The $kw value can be:
              //   - a plain dict {name: value, ...}, or
              //   - an Array of two dicts [forced_positional_kw, kw_expansion]
              //     which Brython uses when the call site does `f(*args, **kw)`.
              // Without the Array handling, `Object.keys` returns numeric
              // indices ("0", "1") and they leak into the C function call as
              // bogus kwarg names — the actual bug Pierre's _sre integration
              // hit ("got an unexpected keyword argument '0'").
              var kw = null;
              if (jsArgs.length > 0) {
                  var last = jsArgs[jsArgs.length - 1];
                  if (last && (last.$kw || last.$nat === 'kw')) {
                      var kwRaw = last.$kw || last;
                      if (Array.isArray(kwRaw)) {
                          kw = {};
                          for (var ki = 0; ki < kwRaw.length; ki++) {
                              var part = kwRaw[ki];
                              if (part && typeof part === 'object') {
                                  for (var kk in part) {
                                      if (kk !== '$kw' && kk !== '$nat' &&
                                              Object.prototype.hasOwnProperty.call(part, kk)) {
                                          kw[kk] = part[kk];
                                      }
                                  }
                              }
                          }
                      } else {
                          kw = kwRaw;
                      }
                      jsArgs = jsArgs.slice(0, -1);
                  }
              }
  
              // selfHandle is moduleHandle for module-scope, or the instance
              // pointer for instance methods (first arg is self).
              var selfHandle, posArgs;
              if (moduleScope) {
                  selfHandle = moduleHandle;
                  posArgs = jsArgs;
              } else {
                  var self = jsArgs[0];
                  if (self && self.__wasthon_ptr__) {
                      selfHandle = self.__wasthon_ptr__;
                  } else {
                      selfHandle = rt.wrap(self);
                  }
                  posArgs = jsArgs.slice(1);
              }
  
              // Marshal positional + kw values into a flat args[] array of
              // PyObject* handles (per FASTCALL convention).
              var nargs = posArgs.length;
              var kwNames = kw ? Object.keys(kw).filter(function(k) { return k !== '$kw' && k !== '$nat'; }) : [];
              var totalArgs = nargs + kwNames.length;
              var argsBufPtr = totalArgs > 0 ? _malloc(totalArgs * 4) : 0;
              for (var i = 0; i < nargs; i++) {
                  HEAP32[(argsBufPtr + i*4) >> 2] = rt.wrap(posArgs[i]);
              }
              for (var i = 0; i < kwNames.length; i++) {
                  HEAP32[(argsBufPtr + (nargs + i)*4) >> 2] = rt.wrap(kw[kwNames[i]]);
              }
              // kwnames is a Python tuple of strings. We just expose the JS
              // array, marked as a tuple so unpacker reads its length.
              var kwnamesHandle = kwNames.length > 0 ? rt.wrap(kwNames) : 0;
  
              rt.pendingException = null;
              var resultHandle = 0;
              try {
                  var fn = getWasmTableEntry(fnPtr);
                  if ((flags & METH_METHOD) && (flags & FASTCALL) && (flags & KEYWORDS)) {
                      /* METH_METHOD: signature is (self, cls, args, nargs, kwnames).
                     * classHandle is the type's struct pointer captured at
                     * install time. */
                      resultHandle = fn(selfHandle, classHandle || 0, argsBufPtr, nargs, kwnamesHandle);
                  } else if ((flags & FASTCALL) && (flags & KEYWORDS)) {
                      resultHandle = fn(selfHandle, argsBufPtr, nargs, kwnamesHandle);
                  } else if (flags & FASTCALL) {
                      resultHandle = fn(selfHandle, argsBufPtr, nargs);
                  } else if (flags & NOARGS) {
                      resultHandle = fn(selfHandle, 0);
                  } else if (flags & METH_O_) {
                      resultHandle = fn(selfHandle, nargs > 0 ? rt.wrap(posArgs[0]) : 0);
                  } else if (flags & KEYWORDS) {
                      // METH_VARARGS | METH_KEYWORDS (legacy):
                      //   fn(self, args_tuple, kwargs_dict)
                      var argsTuple = rt._b_.tuple.$factory(posArgs);
                      var kwDict = null;
                      if (kwNames.length > 0) {
                          kwDict = rt._b_.dict.$factory();
                          for (var i = 0; i < kwNames.length; i++) {
                              rt._b_.dict.str_dict_set
                                  ? rt.$B.str_dict_set(kwDict, kwNames[i], kw[kwNames[i]])
                                  : (kwDict[kwNames[i]] = kw[kwNames[i]]);
                          }
                      }
                      resultHandle = fn(selfHandle, rt.wrap(argsTuple),
                                        kwDict ? rt.wrap(kwDict) : 0);
                  } else {
                      // METH_VARARGS plain — fn(self, args_tuple)
                      resultHandle = fn(selfHandle, rt.wrap(posArgs));
                  }
              } finally {
                  if (argsBufPtr !== 0) _free(argsBufPtr);
              }
  
              // Check exception flag; raise into Brython.
              if (rt.pendingException) {
                  var pe = rt.pendingException;
                  rt.pendingException = null;
                  var excClass = rt.unwrap(pe.exc) || rt._b_.RuntimeError;
                  var msg = typeof pe.msg === 'string' ? pe.msg : String(pe.msg);
                  throw rt.$B.$call(excClass, msg);
              }
              if (resultHandle === 0) {
                  // No exception set but NULL returned — generic error.
                  throw rt.$B.$call(rt._b_.RuntimeError, methName + ": call returned NULL");
              }
              var result = rt.unwrap(resultHandle);
              /* Sync bytes-like objects whose backing was a C-side linear-
             * memory buffer (e.g. zlib.compress output, pickle.loads bytes
             * written into __wasthon_cstr__). Walks recursively into
             * containers (tuple/list/dict) so bytes nested inside also
             * sync — pickle returns tuples that hold bytes written via
             * PyBytes_FromStringAndSize(NULL,n) + _Unpickler_ReadInto,
             * and without this descent the bytes still read as the
             * initial zero fill from .source. */
              (function syncBytes(v, seen) {
                  if (!v || typeof v !== 'object') return;
                  if (seen.has(v)) return;
                  seen.add(v);
                  if (v.__wasthon_cstr__ && v.source &&
                          typeof v.source.length === 'number') {
                      var src = v.source, ptr = v.__wasthon_cstr__;
                      for (var i = 0, len = src.length; i < len; i++) {
                          src[i] = HEAPU8[ptr + i];
                      }
                  }
                  /* tuple / list — iterable JS array-shaped object with
                 * .length, and Brython tuple/list expose elements at
                 * numeric indices. */
                  if (typeof v.length === 'number') {
                      for (var j = 0; j < v.length; j++) syncBytes(v[j], seen);
                  }
                  /* dict — walk values (keys are rarely bytes; if needed
                 * users hit a separate fix). Brython dicts store entries
                 * in a $version-keyed structure; len()+items() is the
                 * portable read. */
                  try {
                      if (v.__class__ === rt._b_.dict ||
                          (rt.$B.$isinstance && rt.$B.$isinstance(v, rt._b_.dict))) {
                          var items = rt.$B.$call(rt._b_.list,
                              rt.$B.$call(rt.$B.$getattr(v, 'values')));
                          for (var k = 0, n = rt._b_.len(items); k < n; k++) {
                              syncBytes(rt.$B.$getitem(items, k), seen);
                          }
                      }
                  } catch (_) {}
              })(result, new WeakSet());
              // Materialize PyUnicode_New placeholders into actual JS strings
              // and replace the handle's value so callers see a real str.
              if (result && result.__wasthon_unicode_buf__) {
                  var s = rt.asJSStr(result);
                  rt.handles.set(resultHandle, s);
                  result = s;
              }
              return result;
          };
      }
  
  function __wasthon_install_methods(target, methodsPtr, moduleHandle, moduleScope) {
          var rt = WasthonRT;
          /* For class methods, capture the class handle so trampoline can
         * pass it as the `cls` arg when METH_METHOD is set. */
          var classHandle = (!moduleScope && target.__wasthon_type_handle__)
              ? target.__wasthon_type_handle__ : 0;
          // Each entry is 16 bytes: name(4) + meth(4) + flags(4) + doc(4)
          for (var mp = methodsPtr; ; mp += 16) {
              var namePtr = HEAP32[ mp        >> 2];
              if (namePtr === 0) break;
              var fnPtr   = HEAP32[(mp +  4)  >> 2];
              var flags   = HEAP32[(mp +  8)  >> 2];
              var name    = UTF8ToString(namePtr);
  
              var trampoline = __wasthon_make_trampoline(fnPtr, flags, moduleHandle, name, moduleScope, classHandle);
              if (moduleScope) {
                  rt.$B.module_setattr(target, name, trampoline);
              } else {
                  target.tp_funcs = target.tp_funcs || {};
                  target.tp_funcs[name] = trampoline;
                  trampoline.ob_type = rt.$B.builtin_method;
              }
          }
      }
  
  
  
  function __wasthon_install_getsets(cls, getsetPtr) {
          if (!getsetPtr) return;
          var rt = WasthonRT;
          for (var gp = getsetPtr; ; gp += 20) {
              var namePtr   = HEAP32[ gp        >> 2];
              if (namePtr === 0) break;
              var getPtr    = HEAP32[(gp +  4)  >> 2];
              var setPtr    = HEAP32[(gp +  8)  >> 2];
              var closurePtr = HEAP32[(gp + 16) >> 2];
              var name      = UTF8ToString(namePtr);
  
              var capGet = getPtr, capSet = setPtr, capClosure = closurePtr;
  
              var fget = capGet ? (function(getP, closP) {
                  return function(self) {
                      var selfH = (self && self.__wasthon_ptr__) ? self.__wasthon_ptr__ : rt.wrap(self);
                      rt.pendingException = null;
                      var resH = getWasmTableEntry(getP)(selfH, closP);
                      if (rt.pendingException) {
                          var pe = rt.pendingException;
                          rt.pendingException = null;
                          var exc = rt.unwrap(pe.exc) || rt._b_.Exception;
                          throw rt.$B.$call(exc, typeof pe.msg === 'string' ? pe.msg : String(pe.msg));
                      }
                      return rt.unwrap(resH);
                  };
              })(capGet, capClosure) : rt._b_.None;
  
              var fset = capSet ? (function(setP, closP) {
                  return function(self, value) {
                      var selfH = (self && self.__wasthon_ptr__) ? self.__wasthon_ptr__ : rt.wrap(self);
                      var valH = rt.wrap(value);
                      rt.pendingException = null;
                      var rc = getWasmTableEntry(setP)(selfH, valH, closP);
                      if (rt.pendingException) {
                          var pe = rt.pendingException;
                          rt.pendingException = null;
                          var exc = rt.unwrap(pe.exc) || rt._b_.Exception;
                          throw rt.$B.$call(exc, typeof pe.msg === 'string' ? pe.msg : String(pe.msg));
                      }
                      return rc;
                  };
              })(capSet, capClosure) : rt._b_.None;
  
              try {
                  /* Create a Brython property descriptor. Brython's MRO walk
                 * for `instance.<name>` finds the property on the class and
                 * calls its __get__ to invoke our wrapped C getter. */
                  var prop = rt._b_.property.$factory(fget, fset);
                  /* Set as JS attribute on the class so MRO lookup sees it. */
                  cls[name] = prop;
                  /* Also set in the class's tp_dict (Brython exposes class
                 * attrs there for __dict__ inspection and some lookups). */
                  try {
                      var dictObj = rt.$B.get_dict(cls);
                      if (dictObj) rt.$B.str_dict_set(dictObj, name, prop);
                  } catch (_) {}
              } catch (e) {
                  /* Fall back to a plain getter function on the class. */
                  if (capGet) cls[name] = fget;
              }
          }
      }
  
  
  function __wasthon_install_members(cls, membersPtr) {
          if (!membersPtr) return;
          var rt = WasthonRT;
          /* PyMemberDef on wasm32 = 20 bytes:
         *   +0  char *name
         *   +4  int   type
         *   +8  Py_ssize_t offset
         *   +12 int   flags  (bit 0 = Py_READONLY)
         *   +16 char *doc */
          for (var mp = membersPtr; ; mp += 20) {
              var namePtr = HEAP32[mp >> 2];
              if (namePtr === 0) break;
              var type    = HEAP32[(mp +  4) >> 2];
              var offset  = HEAP32[(mp +  8) >> 2];
              var flags   = HEAP32[(mp + 12) >> 2];
              var name    = UTF8ToString(namePtr);
              var readonly = (flags & 1) !== 0;
  
              /* Capture loop vars into closure scope. */
              var T = type, O = offset, N = name;
  
              var fget = (function(t, off, n) {
                  return function(self) {
                      var instPtr = self && self.__wasthon_ptr__;
                      if (!instPtr) {
                          throw rt.$B.$call(rt._b_.AttributeError, n);
                      }
                      var addr = instPtr + off;
                      switch (t) {
                          case 1:  return HEAP32[addr >> 2] | 0;                 /* Py_T_INT */
                          case 2:  return HEAP32[addr >> 2] | 0;                 /* Py_T_PYSSIZET */
                          case 3:  return HEAPU8[addr] !== 0;                    /* Py_T_BOOL */
                          case 4: {                                              /* Py_T_OBJECT_EX */
                              var h = HEAP32[addr >> 2];
                              if (h === 0) {
                                  throw rt.$B.$call(rt._b_.AttributeError, n);
                              }
                              return rt.unwrap(h);
                          }
                          case 5: {                                              /* Py_T_STRING */
                              var sp = HEAP32[addr >> 2];
                              return sp === 0 ? rt._b_.None : UTF8ToString(sp);
                          }
                          case 6:  return HEAPU32[addr >> 2] >>> 0;              /* Py_T_UINT */
                          case 7:  return HEAP32[addr >> 2] | 0;                 /* Py_T_LONG */
                          case 8:  return HEAPU32[addr >> 2] >>> 0;              /* Py_T_ULONG */
                          case 9:  return (HEAP16[addr >> 1] << 16) >> 16;       /* Py_T_SHORT */
                          case 10: return HEAPU16[addr >> 1];                    /* Py_T_USHORT */
                          case 11: return (HEAP8[addr] << 24) >> 24;             /* Py_T_BYTE */
                          case 12: return HEAPU8[addr];                          /* Py_T_UBYTE */
                          default:
                              throw rt.$B.$call(rt._b_.SystemError,
                                  "unsupported PyMemberDef type: " + t);
                      }
                  };
              })(T, O, N);
  
              var fset = readonly ? rt._b_.None : (function(t, off, n) {
                  return function(self, value) {
                      var instPtr = self && self.__wasthon_ptr__;
                      if (!instPtr) {
                          throw rt.$B.$call(rt._b_.AttributeError, n);
                      }
                      var addr = instPtr + off;
                      var iv;  // coerced int value, used by integer cases
                      switch (t) {
                          case 1: case 2: case 7:
                              iv = rt.coerceInt(value);
                              HEAP32[addr >> 2] = (iv === undefined ? 0 : iv) | 0;
                              break;
                          case 6: case 8:
                              iv = rt.coerceInt(value);
                              HEAPU32[addr >> 2] = (iv === undefined ? 0 : iv) >>> 0;
                              break;
                          case 3:
                              HEAPU8[addr] = rt._b_.bool.$factory(value) ? 1 : 0;
                              break;
                          case 4:
                              HEAP32[addr >> 2] = rt.wrap(value);
                              break;
                          case 9:
                              iv = rt.coerceInt(value);
                              HEAP16[addr >> 1] = (iv === undefined ? 0 : iv) & 0xffff;
                              break;
                          case 10:
                              iv = rt.coerceInt(value);
                              HEAPU16[addr >> 1] = (iv === undefined ? 0 : iv) & 0xffff;
                              break;
                          case 11:
                              iv = rt.coerceInt(value);
                              HEAP8[addr] = (iv === undefined ? 0 : iv) & 0xff;
                              break;
                          case 12:
                              iv = rt.coerceInt(value);
                              HEAPU8[addr] = (iv === undefined ? 0 : iv) & 0xff;
                              break;
                          /* Py_T_STRING (5) is read-only in CPython too; no setter. */
                      }
                  };
              })(T, O, N);
  
              try {
                  var prop = rt._b_.property.$factory(fget, fset);
                  cls[name] = prop;
                  try {
                      var dictObj = rt.$B.get_dict(cls);
                      if (dictObj) rt.$B.str_dict_set(dictObj, name, prop);
                  } catch (_) {}
              } catch (e) {
                  cls[name] = fget;
              }
          }
      }
  
  
  function _PyType_FromModuleAndSpec(moduleHandle, specPtr, basesHandle) {
          var rt = WasthonRT;
          rt.trace('PyType_FromModuleAndSpec', 'specPtr=' + specPtr);
          var namePtr   = HEAP32[ specPtr        >> 2];
          var basicsize = HEAP32[(specPtr +  4)  >> 2];
          var itemsize  = HEAP32[(specPtr +  8)  >> 2];
          var flags     = HEAPU32[(specPtr + 12) >> 2];
          var slotsPtr  = HEAP32[(specPtr + 16)  >> 2];
  
          var fullName = namePtr ? UTF8ToString(namePtr) : "<wasthon type>";
          // Strip module prefix for the class name (CPython convention).
          var dotIdx = fullName.lastIndexOf('.');
          var shortName = (dotIdx >= 0) ? fullName.slice(dotIdx + 1) : fullName;
  
          // Walk slots, collecting them into a JS object keyed by slot ID.
          var slotMap = {};
          var methodsPtr = 0, getsetPtr = 0, membersPtr = 0;
          if (slotsPtr !== 0) {
              for (var sp = slotsPtr; ; sp += 8) {
                  var sid = HEAP32[sp >> 2];
                  if (sid === 0) break;
                  var pfunc = HEAP32[(sp + 4) >> 2];
                  slotMap[sid] = pfunc;
                  if (sid === 64 /* Py_tp_methods */) methodsPtr = pfunc;
                  if (sid === 66 /* Py_tp_getset  */) getsetPtr  = pfunc;
                  if (sid === 72 /* Py_tp_members */) membersPtr = pfunc;
              }
          }
  
          // Create a Brython class. make_builtin_class doesn't init_dict;
          // we do it explicitly so tp_dict has a real Brython dict that
          // PyDict_SetItemString (used by blake2module to install class-level
          // constants like SALT_SIZE) can write to.
          var cls = rt.$B.make_builtin_class(shortName);
          rt.$B.init_dict(cls);
          cls.__module__ = rt.unwrap(moduleHandle) ?
              rt.unwrap(moduleHandle).__name__ : "";
          /* make_builtin_class doesn't wire tp_setattro / tp_getattro to
         * object's defaults; without them, $B.$setattr finds undefined and
         * calls it as a function — boom. Inherit from object explicitly. */
          if (!cls.tp_setattro) cls.tp_setattro = rt._b_.object.tp_setattro;
          if (!cls.tp_getattro) cls.tp_getattro = rt._b_.object.tp_getattro;
          /* Brython 3.14's object_getattribute only engages the tp_funcs
         * fast path when `cls.$getattribute === object.tp_getattro`.
         * Without this, getattr() on instances misses C-installed methods
         * (e.g. pickle's `persistent_id` lookup on Pickler) and pickle
         * fails at dump-time with `AttributeError: persistent_id`. */
          if (!cls.$getattribute) cls.$getattribute = rt._b_.object.tp_getattro;
  
          // Allocate the C-side PyTypeObject. Layout (matches wasthon.h):
          //   +0   tp_free (no-op, NULL)
          //   +4   tp_dict (handle to the class dict)
          //   +8   tp_name (pointer to UTF-8 name; same as spec.name)
          //  +12   tp_alloc (function pointer for instance allocation)
          //  +16   tp_init (0; populated below if Py_tp_init slot present)
          //  +20   tp_iter (shared with built-in singletons — calls iter())
          //  +24   tp_as_number (NULL for custom types; built-in singletons
          //                       get a populated PyNumberMethods at init)
          //  +28   tp_methods (PyMethodDef* from spec, for _decimal which
          //                     reads it directly to enumerate methods)
          if (!rt._defaultTpAlloc) rt._defaultTpAlloc = _wasthon_get_default_tp_alloc();
          if (!rt._builtinTpIter)  rt._builtinTpIter  = _wasthon_get_builtin_tp_iter();
          var typeStructPtr = _malloc(60);
          HEAPU8.fill(0, typeStructPtr, typeStructPtr + 60);
          var dictObj = rt.$B.get_dict(cls);
          var dictHandle = rt.wrap(dictObj);
          HEAP32[(typeStructPtr +  4) >> 2] = dictHandle;
          HEAP32[(typeStructPtr +  8) >> 2] = namePtr;
          HEAP32[(typeStructPtr + 12) >> 2] = rt._defaultTpAlloc;
          HEAP32[(typeStructPtr + 20) >> 2] = rt._builtinTpIter;
          HEAP32[(typeStructPtr + 28) >> 2] = methodsPtr;
          // offsets 32 (tp_traverse), 36 (tp_dealloc) — left NULL (zeroed)
          var typeHandle = typeStructPtr;
          rt.bindInstance(typeHandle, cls);
          cls.__wasthon_type_handle__ = typeHandle;
          cls.__wasthon_type_token__  = specPtr;
          rt.types.set(typeHandle, {
              basicsize: basicsize,
              itemsize:  itemsize,
              flags:     flags,
              slots:     slotMap,
              methods:   methodsPtr,
              getset:    getsetPtr,
              brythonClass: cls,
              moduleHandle: moduleHandle,
              shortName: shortName,
              fullName: fullName,
          });
          // Reverse link for PyType_GetModule.
          cls.__wasthon_module__ = moduleHandle;
  
          // Install methods listed in PyMethodDef[].
          if (methodsPtr !== 0) {
              __wasthon_install_methods(cls, methodsPtr, moduleHandle, /*moduleScope=*/false);
          }
  
          // Install getset descriptors (typecode, itemsize, etc.).
          if (getsetPtr !== 0) {
              __wasthon_install_getsets(cls, getsetPtr);
          }
  
          // Install member descriptors — fields exposed by C struct offset
          // via PyMemberDef (re.Match.string, sqlite Connection.in_transaction,
          // etc.). Without this, instance attributes declared via tp_members
          // silently disappear.
          if (membersPtr !== 0) {
              __wasthon_install_members(cls, membersPtr);
          }
  
          // Wire Py_tp_new (slot id 65) so Brython can instantiate the type.
          // Brython's _b_.type.tp_call reads cls.tp_new and, if .$is_slot is
          // set, calls new_func(cls, args, kw) — exactly the CPython tp_new
          // ABI. The C function signature is:
          //   PyObject *tp_new(PyTypeObject *cls, PyObject *args, PyObject *kw);
          var tpNewPtr = slotMap[65 /* Py_tp_new */];
          if (tpNewPtr) {
              cls.tp_new = function(brythonCls, args, kw) {
                  var argsH = rt.wrap(args || []);
                  var kwH   = (kw && rt._b_.dict.mp_length(kw) > 0) ? rt.wrap(kw) : 0;
                  rt.pendingException = null;
                  var resultH = getWasmTableEntry(tpNewPtr)(typeHandle, argsH, kwH);
                  if (rt.pendingException) {
                      var pe = rt.pendingException;
                      rt.pendingException = null;
                      var exc = rt.unwrap(pe.exc) || rt._b_.Exception;
                      // Brython exception classes don't all expose $factory;
                      // $B.$call is the generic dispatch that handles both.
                      throw rt.$B.$call(exc, typeof pe.msg === 'string' ? pe.msg : String(pe.msg));
                  }
                  return rt.unwrap(resultH);
              };
              cls.tp_new.$is_slot = true;
          } else {
              // No Py_tp_new in spec. CPython falls back to object.__new__,
              // which allocates `type->tp_basicsize` raw bytes. We replicate
              // that so a C-style tp_init on the result sees a real struct,
              // not a sentinel. Subclasses created via type(name,bases,dict)
              // inherit through MRO walk — find the first ancestor with a
              // known basicsize and allocate that many bytes. Without this,
              // _decimal's SignalDict() (subclass of SignalDictMixin) ends
              // up with a sentinel handle that signaldict_init dereferences
              // as a garbage pointer.
              cls.tp_new = function(brythonCls /*, args, kw */) {
                  var size = 0;
                  var chain = [brythonCls];
                  // Brython exposes MRO as either tp_mro (built-in classes
                  // created via make_builtin_class) or __mro__ (Python-side).
                  if (brythonCls.tp_mro) chain = chain.concat(brythonCls.tp_mro);
                  else if (brythonCls.__mro__) chain = chain.concat(brythonCls.__mro__);
                  var typeStructForInst = 0;
                  for (var i = 0; i < chain.length; i++) {
                      var c = chain[i];
                      if (c && c.__wasthon_basicsize__ > 0) {
                          size = c.__wasthon_basicsize__;
                          typeStructForInst = c.__wasthon_type_handle__ || 0;
                          break;
                      }
                  }
                  if (size === 0) {
                      // No Wasthon ancestor — fall through to Brython default.
                      return rt._b_.object.tp_new(brythonCls);
                  }
                  var instancePtr = _malloc(size);
                  HEAPU8.fill(0, instancePtr, instancePtr + size);
                  var inst = {
                      __class__: brythonCls,
                      ob_type: brythonCls,
                      __wasthon_ptr__: instancePtr,
                      /* Without this, Py_TYPE(inst) (wasthon_get_type_of)
                     * can't return the type-struct pointer, so
                     * PyObject_TypeCheck(inst, &XxxType) — used by clinic
                     * __init__ guards like sqlite3 Cursor(connection) —
                     * always fails. Mirror what wasthon_object_gc_new does
                     * for types that DO have a Py_tp_new slot. */
                      __wasthon_type__: typeStructForInst || typeHandle,
                  };
                  rt.bindInstance(instancePtr, inst);
                  return inst;
              };
              cls.tp_new.$is_slot = true;
          }
          // Record basicsize on the class so the MRO walk in subclass tp_new
          // can find it. Type creations via type(name, bases, dict) don't
          // call our PyType_FromModuleAndSpec — they go through Brython's
          // make_class, which doesn't copy __wasthon_basicsize__. That's OK:
          // we look it up via __mro__.
          cls.__wasthon_basicsize__ = basicsize;
  
          // Wire number/repr/hash slots to Brython __dunder__ methods so
          // class-level ops resolve to the C slot. Maps slot ID → Brython
          // method name + dispatch shape (b=binary, t=ternary, u=unary,
          // i=inquiry returning int, r=unary returning PyObject*).
          // Brython uses C-slot-named methods on the class (nb_add, tp_repr, ...)
          // but Python user code accesses via __dunder__. We install BOTH names
          // pointing to the same dispatch function so either lookup path works.
          // Format: slotID → [brythonSlotName, [dunderNames], shape]
          // (b=binary, t=ternary, r=unary->obj, i=inquiry->int).
          var slotDispatch = {
              7:  ['nb_add',                    ['__add__'],           'b'],
              36: ['nb_subtract',               ['__sub__'],           'b'],
              29: ['nb_multiply',               ['__mul__'],           'b'],
              34: ['nb_remainder',              ['__mod__'],           'b'],
              10: ['nb_divmod',                 ['__divmod__'],        'b'],
              12: ['nb_floor_divide',           ['__floordiv__'],      'b'],
              37: ['nb_true_divide',            ['__truediv__'],       'b'],
              28: ['nb_lshift',                 ['__lshift__'],        'b'],
              35: ['nb_rshift',                 ['__rshift__'],        'b'],
              8:  ['nb_and',                    ['__and__'],           'b'],
              38: ['nb_xor',                    ['__xor__'],           'b'],
              31: ['nb_or',                     ['__or__'],            'b'],
              14: ['nb_inplace_add',            ['__iadd__'],          'b'],
              23: ['nb_inplace_subtract',       ['__isub__'],          'b'],
              18: ['nb_inplace_multiply',       ['__imul__'],          'b'],
              21: ['nb_inplace_remainder',      ['__imod__'],          'b'],
              16: ['nb_inplace_floor_divide',   ['__ifloordiv__'],     'b'],
              24: ['nb_inplace_true_divide',    ['__itruediv__'],      'b'],
              33: ['nb_power',                  ['__pow__'],           't'],
              30: ['nb_negative',               ['__neg__'],           'r'],
              32: ['nb_positive',               ['__pos__'],           'r'],
              6:  ['nb_absolute',               ['__abs__'],           'r'],
              27: ['nb_invert',                 ['__invert__'],        'r'],
              11: ['nb_float',                  ['__float__'],         'r'],
              26: ['nb_int',                    ['__int__'],           'r'],
              13: ['nb_index',                  ['__index__'],         'r'],
              /* tp_str / tp_repr / tp_hash — use OUR header's slot IDs
             * (wasthon.h), which differ from CPython canonical values. */
              51: ['tp_repr',                   ['__repr__'],          'r'],
              50: ['tp_str',                    ['__str__'],           'r'],
              58: ['tp_hash',                   ['__hash__'],          'i'],
              9:  ['nb_bool',                   ['__bool__'],          'i'],
              /* Iterator protocol — tp_iter returns iterator, tp_iternext
             * advances. NULL return from tp_iternext == StopIteration. */
              62: ['tp_iter',                   ['__iter__'],          'r'],
              63: ['tp_iternext',               ['__next__'],          'n'],
              /* richcompare: single C slot, 6 Python dunders. The 'c' shape
             * is handled specially below — one slotPtr → 6 dispatch funcs
             * each calling slot(self, other, op) with a different op. */
              60: ['tp_richcompare',            null,                  'c'],
              /* sequence protocol — slot IDs per Include/typeslots.h */
              45: ['sq_length',                 ['__len__'],           'i'],
              44: ['sq_item',                   ['__getitem__'],       'si'],
              39: ['sq_ass_item',               ['__setitem__'],       'sis'],
              40: ['sq_concat',                 ['__add__'],           'b'],
              41: ['sq_contains',               ['__contains__'],      'b'],
              46: ['sq_repeat',                 ['__mul__','__rmul__'], 'si'],
              42: ['sq_inplace_concat',         ['__iadd__'],          'b'],
              43: ['sq_inplace_repeat',         ['__imul__'],          'si'],
          };
          Object.keys(slotDispatch).forEach(function(sidStr) {
              var sid = sidStr | 0;
              var slotPtr = slotMap[sid];
              if (!slotPtr) return;
              var info = slotDispatch[sid];
              var brythonName = info[0], dunders = info[1], shape = info[2];
              var dispatch;
              if (shape === 'b') {
                  dispatch = function(self, other) {
                      var selfH  = self && self.__wasthon_ptr__ ? self.__wasthon_ptr__ : rt.wrap(self);
                      var otherH = other && other.__wasthon_ptr__ ? other.__wasthon_ptr__ : rt.wrap(other);
                      rt.pendingException = null;
                      var resH = getWasmTableEntry(slotPtr)(selfH, otherH);
                      if (resH === 0 || rt.pendingException) {
                          if (rt.pendingException) {
                              var pe = rt.pendingException; rt.pendingException = null;
                              throw rt.$B.$call(rt.unwrap(pe.exc) || rt._b_.Exception,
                                                typeof pe.msg === 'string' ? pe.msg : String(pe.msg));
                          }
                          return rt._b_.NotImplemented;
                      }
                      return rt.unwrap(resH);
                  };
              } else if (shape === 't') {
                  dispatch = function(self, other, modulo) {
                      var selfH = self && self.__wasthon_ptr__ ? self.__wasthon_ptr__ : rt.wrap(self);
                      var otherH = other && other.__wasthon_ptr__ ? other.__wasthon_ptr__ : rt.wrap(other);
                      var modH = (modulo === undefined || modulo === rt._b_.None) ?
                                 rt.SLOT_NONE :
                                 (modulo && modulo.__wasthon_ptr__ ? modulo.__wasthon_ptr__ : rt.wrap(modulo));
                      rt.pendingException = null;
                      var resH = getWasmTableEntry(slotPtr)(selfH, otherH, modH);
                      if (resH === 0 || rt.pendingException) {
                          if (rt.pendingException) {
                              var pe = rt.pendingException; rt.pendingException = null;
                              throw rt.$B.$call(rt.unwrap(pe.exc) || rt._b_.Exception,
                                                typeof pe.msg === 'string' ? pe.msg : String(pe.msg));
                          }
                          return rt._b_.NotImplemented;
                      }
                      return rt.unwrap(resH);
                  };
              } else if (shape === 'r') {
                  var isStringy = (brythonName === 'tp_str' || brythonName === 'tp_repr');
                  dispatch = function(self) {
                      var selfH = self && self.__wasthon_ptr__ ? self.__wasthon_ptr__ : rt.wrap(self);
                      rt.pendingException = null;
                      var resH = getWasmTableEntry(slotPtr)(selfH);
                      if (resH === 0 || rt.pendingException) {
                          if (rt.pendingException) {
                              var pe = rt.pendingException; rt.pendingException = null;
                              throw rt.$B.$call(rt.unwrap(pe.exc) || rt._b_.Exception,
                                                typeof pe.msg === 'string' ? pe.msg : String(pe.msg));
                          }
                          return rt._b_.None;
                      }
                      var obj = rt.unwrap(resH);
                      if (isStringy) {
                          // C side returns a PyUnicode_New placeholder; materialize.
                          var s = rt.asJSStr(obj);
                          if (s !== null) return s;
                      }
                      return obj;
                  };
              } else if (shape === 'i') {
                  dispatch = function(self) {
                      var selfH = self && self.__wasthon_ptr__ ? self.__wasthon_ptr__ : rt.wrap(self);
                      rt.pendingException = null;
                      var rc = getWasmTableEntry(slotPtr)(selfH);
                      if (rc < 0 && rt.pendingException) {
                          var pe = rt.pendingException; rt.pendingException = null;
                          throw rt.$B.$call(rt.unwrap(pe.exc) || rt._b_.Exception,
                                            typeof pe.msg === 'string' ? pe.msg : String(pe.msg));
                      }
                      /* Length-style slots (sq_length, mp_length) return the
                     * count directly; tp_hash and nb_bool return rc to be
                     * coerced. We can't distinguish here; if rc looks like
                     * a count (any value not -1), return it directly. */
                      if (brythonName === 'sq_length' || brythonName === 'mp_length' ||
                          brythonName === 'tp_hash') return rc | 0;
                      return rc ? true : false;
                  };
              } else if (shape === 'si') {
                  /* sq_item / sq_repeat: takes self + ssize_t. Returns PyObject*.
                 * Brython will call this as `instance[i]` or `instance * n`. */
                  dispatch = function(self, idx) {
                      var selfH = self && self.__wasthon_ptr__ ? self.__wasthon_ptr__ : rt.wrap(self);
                      var i = (typeof idx === 'number') ? (idx | 0) :
                              (typeof idx === 'bigint') ? Number(idx) :
                              Number(idx) | 0;
                      rt.pendingException = null;
                      var resH = getWasmTableEntry(slotPtr)(selfH, i);
                      if (rt.pendingException) {
                          var pe = rt.pendingException; rt.pendingException = null;
                          throw rt.$B.$call(rt.unwrap(pe.exc) || rt._b_.Exception,
                                            typeof pe.msg === 'string' ? pe.msg : String(pe.msg));
                      }
                      if (resH === 0) {
                          throw rt.$B.$call(rt._b_.IndexError, "index out of range");
                      }
                      return rt.unwrap(resH);
                  };
              } else if (shape === 'sis') {
                  /* sq_ass_item: self + ssize_t + value. Returns int rc. */
                  dispatch = function(self, idx, value) {
                      var selfH = self && self.__wasthon_ptr__ ? self.__wasthon_ptr__ : rt.wrap(self);
                      var i = (typeof idx === 'number') ? (idx | 0) :
                              (typeof idx === 'bigint') ? Number(idx) :
                              Number(idx) | 0;
                      var valH = (value === undefined || value === null) ? 0 :
                                 (value && value.__wasthon_ptr__ ? value.__wasthon_ptr__ : rt.wrap(value));
                      rt.pendingException = null;
                      var rc = getWasmTableEntry(slotPtr)(selfH, i, valH);
                      if (rt.pendingException) {
                          var pe = rt.pendingException; rt.pendingException = null;
                          throw rt.$B.$call(rt.unwrap(pe.exc) || rt._b_.Exception,
                                            typeof pe.msg === 'string' ? pe.msg : String(pe.msg));
                      }
                      return rc;
                  };
              } else if (shape === 'n') {
                  // tp_iternext: returns next value, or NULL (no exception)
                  // for StopIteration. Translate NULL → StopIteration throw
                  // so Brython's iterator protocol sees it.
                  dispatch = function(self) {
                      var selfH = self && self.__wasthon_ptr__ ? self.__wasthon_ptr__ : rt.wrap(self);
                      rt.pendingException = null;
                      var resH = getWasmTableEntry(slotPtr)(selfH);
                      if (rt.pendingException) {
                          var pe = rt.pendingException; rt.pendingException = null;
                          throw rt.$B.$call(rt.unwrap(pe.exc) || rt._b_.Exception,
                                            typeof pe.msg === 'string' ? pe.msg : String(pe.msg));
                      }
                      if (resH === 0) throw rt.$B.$call(rt._b_.StopIteration);
                      return rt.unwrap(resH);
                  };
              } else if (shape === 'c') {
                  // richcompare: install 6 dunder methods sharing one C slot.
                  var compares = [
                      ['__lt__', 0], ['__le__', 1], ['__eq__', 2],
                      ['__ne__', 3], ['__gt__', 4], ['__ge__', 5],
                  ];
                  var makeCmp = function(op) {
                      return function(self, other) {
                          var selfH  = self && self.__wasthon_ptr__ ? self.__wasthon_ptr__ : rt.wrap(self);
                          var otherH = other && other.__wasthon_ptr__ ? other.__wasthon_ptr__ : rt.wrap(other);
                          rt.pendingException = null;
                          var resH = getWasmTableEntry(slotPtr)(selfH, otherH, op);
                          if (resH === 0 || rt.pendingException) {
                              if (rt.pendingException) {
                                  var pe = rt.pendingException; rt.pendingException = null;
                                  throw rt.$B.$call(rt.unwrap(pe.exc) || rt._b_.Exception,
                                                    typeof pe.msg === 'string' ? pe.msg : String(pe.msg));
                              }
                              return rt._b_.NotImplemented;
                          }
                          return rt.unwrap(resH);
                      };
                  };
                  cls.tp_funcs = cls.tp_funcs || {};
                  for (var ci = 0; ci < compares.length; ci++) {
                      var name = compares[ci][0], op = compares[ci][1];
                      var fn = makeCmp(op);
                      cls[name] = fn;
                      cls.tp_funcs[name] = fn;
                      try { rt.$B.set_to_dict(cls, name, fn); } catch (_) {}
                  }
                  return;  // skip the generic install below
              }
              cls[brythonName] = dispatch;
              cls.tp_funcs = cls.tp_funcs || {};
              cls.tp_funcs[brythonName] = dispatch;
              for (var di = 0; di < dunders.length; di++) {
                  cls[dunders[di]] = dispatch;
                  cls.tp_funcs[dunders[di]] = dispatch;
                  // Also install in the class's __dict__ so search_in_mro
                  // (which Brython's rich_op1 uses via $getattr) finds it.
                  try { rt.$B.set_to_dict(cls, dunders[di], dispatch); }
                  catch (_) {}
              }
          });
  
          // Wire Py_tp_init (slot id 61) if the type defines one. The C
          // init slot has signature `int (*)(PyObject *self, PyObject *args,
          // PyObject *kw)` and returns 0 on success, -1 on error. Some
          // modules (_struct: Struct) put state initialization in tp_init,
          // not tp_new, so skipping it leaves the instance unusable.
          //
          // If the type does NOT define tp_init, we alias to object's default
          // so Brython's type.tp_call (which checks `init_func !== _b_.object.tp_init`)
          // skips the init step.
          var tpInitPtr = slotMap[61 /* Py_tp_init */];
          if (tpInitPtr) {
              cls.tp_init = function(self) {
                  // Brython call sig: tp_init(self, ...args, kwarg)
                  // CPython sig:      tp_init(self, args_tuple, kwargs_dict)
                  var jsArgs = Array.from(arguments).slice(1);
                  // Brython 3.14 packs keywords as a trailing {$kw:[ {name:
                  // value, ...}, ...starred ]} object — $kw is an Array of
                  // plain maps (ast_to_js.js emits `{$kw:[${kw}]}`). The
                  // bridge's own outbound convention (PyObject_VectorcallDict)
                  // is {$nat:'kw',$kw:obj}. Detect either shape; flatten the
                  // Array source into [name,value] pairs. The previous version
                  // only checked `.$nat === 'kw'`, so under Brython 3.14 it
                  // missed the marker entirely, leaving the `$kw` wrapper to
                  // leak as a positional — which PyArg_ParseTupleAndKeywords
                  // then tried to coerce as the first slot ("an integer is
                  // required" on _decimal.Context(prec=42)).
                  var kwPairs = null;
                  if (jsArgs.length > 0) {
                      var last = jsArgs[jsArgs.length - 1];
                      if (last && (last.$kw !== undefined || last.$nat === 'kw')) {
                          var src = last.$kw !== undefined ? last.$kw : last;
                          var maps = Array.isArray(src) ? src : [src];
                          kwPairs = [];
                          for (var mi = 0; mi < maps.length; mi++) {
                              var m = maps[mi];
                              if (!m) continue;
                              var ks = Object.keys(m);
                              for (var kj = 0; kj < ks.length; kj++) {
                                  var nm = ks[kj];
                                  if (nm === '$kw' || nm === '$nat') continue;
                                  kwPairs.push([nm, m[nm]]);
                              }
                          }
                          jsArgs.pop();
                      }
                  }
                  var selfH = self && self.__wasthon_ptr__ ? self.__wasthon_ptr__ : rt.wrap(self);
                  var argsH = rt.wrap(jsArgs);
                  // Build a real Brython dict (same primitives PyDict_SetItem
                  // uses) so PyArg_ParseTupleAndKeywords' dict.get / $getitem
                  // lookups land in real hash storage.
                  var kwH = 0;
                  if (kwPairs && kwPairs.length > 0) {
                      var kwDict = rt.$B.empty_dict();
                      for (var ki = 0; ki < kwPairs.length; ki++) {
                          rt._b_.dict.$setitem(kwDict, kwPairs[ki][0], kwPairs[ki][1]);
                      }
                      kwH = rt.wrap(kwDict);
                  }
                  rt.pendingException = null;
                  var rc = getWasmTableEntry(tpInitPtr)(selfH, argsH, kwH);
                  if (rc !== 0 || rt.pendingException) {
                      var pe = rt.pendingException;
                      rt.pendingException = null;
                      var exc = (pe && rt.unwrap(pe.exc)) || rt._b_.Exception;
                      var msg = pe ? pe.msg : "tp_init failed";
                      throw rt.$B.$call(exc, typeof msg === 'string' ? msg : String(msg));
                  }
              };
          } else if (tpNewPtr) {
              // tp_new fully initialised; alias to object so Brython skips init.
              cls.tp_init = rt._b_.object.tp_init;
          }
  
          // Wire Py_tp_call (slot 77, wasthon.h numbering) as cls.tp_call so
          // Brython's $call() treats instances as callable. CPython sig:
          //   PyObject *tp_call(PyObject *self, PyObject *args, PyObject *kw)
          // Brython invokes it as call_method(self, ...args[, $kw]).
          // sqlite3 relies on this: statement_cache = lru_cache(n)(connection)
          // then cache(sql) calls connection(sql) -> pysqlite_connection_call.
          var tpCallPtr = slotMap[77 /* Py_tp_call */];
          if (tpCallPtr) {
              cls.tp_call = function(self) {
                  var jsArgs = Array.from(arguments).slice(1);
                  var kw = null;
                  if (jsArgs.length > 0 && jsArgs[jsArgs.length - 1] &&
                          jsArgs[jsArgs.length - 1].$nat === 'kw') {
                      kw = jsArgs.pop();
                  }
                  var selfH = self && self.__wasthon_ptr__
                      ? self.__wasthon_ptr__ : rt.wrap(self);
                  var argsH = rt.wrap(jsArgs);
                  var kwH   = kw ? rt.wrap(kw) : 0;
                  rt.pendingException = null;
                  var resH = getWasmTableEntry(tpCallPtr)(selfH, argsH, kwH);
                  if (resH === 0 || rt.pendingException) {
                      var pe = rt.pendingException;
                      rt.pendingException = null;
                      if (pe) {
                          var exc = rt.unwrap(pe.exc) || rt._b_.Exception;
                          throw rt.$B.$call(exc, typeof pe.msg === 'string'
                              ? pe.msg : String(pe.msg));
                      }
                      throw rt.$B.$call(rt._b_.RuntimeError,
                          "tp_call returned NULL");
                  }
                  return rt.unwrap(resH);
              };
          }
  
          // Install dealloc hook so that when Brython GCs an instance we
          // free the WASM-side struct. We attach a finalizer registry to
          // each instance at GC_New time; see __wasthon_object_gc_new.
  
          return typeHandle;
      }

  function _PyUnicode_DATA(handle) {
          var rt = WasthonRT;
          var raw = rt.unwrap(handle);
          /* PyUnicode_New placeholder — return its buffer directly. */
          if (raw && raw.__wasthon_unicode_buf__) return raw.__wasthon_unicode_buf__;
  
          var obj = rt.asJSStr(raw);
          if (obj === null) return 0;
  
          /* Compute the kind PEP 393 would assign (must match PyUnicode_KIND). */
          var codepoints = [];
          var max = 0;
          for (var i = 0; i < obj.length;) {
              var c = obj.codePointAt(i);
              codepoints.push(c);
              if (c > max) max = c;
              i += c > 0xFFFF ? 2 : 1;
          }
          var kind = (max < 0x100) ? 1 : (max < 0x10000 ? 2 : 4);
          var len = codepoints.length;
  
          /* Cache buffer keyed by (string, kind). */
          if (!rt._ucsCache) rt._ucsCache = new Map();
          var perStr = rt._ucsCache.get(obj);
          if (!perStr) { perStr = new Map(); rt._ucsCache.set(obj, perStr); }
          var cached = perStr.get(kind);
          if (cached) return cached;
  
          var ptr = _malloc(Math.max(kind, len * kind));
          for (var j = 0; j < len; j++) {
              if (kind === 4)      HEAPU32[(ptr + j * 4) >> 2] = codepoints[j];
              else if (kind === 2) HEAPU16[(ptr + j * 2) >> 1] = codepoints[j];
              else                 HEAPU8[ptr + j] = codepoints[j];
          }
          perStr.set(kind, ptr);
          return ptr;
      }

  function _PyUnicode_FindChar(handle, ch, start, end, dir) {
          var rt = WasthonRT;
          var obj = rt.asJSStr(rt.unwrap(handle));
          if (obj === null) return -1;
          // Iterate codepoints between start and end (exclusive) looking for ch.
          var cps = [];
          for (var i = 0; i < obj.length;) {
              var c = obj.codePointAt(i);
              cps.push(c);
              i += c > 0xFFFF ? 2 : 1;
          }
          if (end > cps.length) end = cps.length;
          if (dir > 0) {
              for (var k = start; k < end; k++) if (cps[k] === ch) return k;
          } else {
              for (var k = end - 1; k >= start; k--) if (cps[k] === ch) return k;
          }
          return -1;
      }

  
  function _PyUnicode_FromFormat(fmtPtr, va) {
          var rt = WasthonRT;
          var fmt = fmtPtr ? UTF8ToString(fmtPtr) : "";
          var p = va | 0;
          function readInt32()   { var v = HEAP32[p >> 2] | 0; p += 4; return v; }
          function readUInt32()  { var v = HEAP32[p >> 2] >>> 0; p += 4; return v; }
          function readPtr()     { var v = HEAP32[p >> 2] >>> 0; p += 4; return v; }
          function readInt64()   {
              p = (p + 7) & ~7;
              var lo = HEAP32[p >> 2] >>> 0;
              var hi = HEAP32[(p+4) >> 2] | 0;
              p += 8;
              return BigInt(hi) * 0x100000000n + BigInt(lo);
          }
          function readUInt64()  {
              p = (p + 7) & ~7;
              var lo = HEAP32[p >> 2] >>> 0;
              var hi = HEAP32[(p+4) >> 2] >>> 0;
              p += 8;
              return BigInt(hi) * 0x100000000n + BigInt(lo);
          }
          function pad(s, width, leftAlign, zero) {
              if (width <= s.length) return s;
              var fill = zero ? '0' : ' ';
              var padding = fill.repeat(width - s.length);
              return leftAlign ? (s + padding) : (padding + s);
          }
          var out = '';
          var i = 0;
          while (i < fmt.length) {
              var c = fmt.charAt(i);
              if (c !== '%') { out += c; i++; continue; }
              i++; // consume %
              if (i >= fmt.length) { out += '%'; break; }
              // Parse flags
              var leftAlign = false, zero = false;
              while (i < fmt.length) {
                  var f = fmt.charAt(i);
                  if (f === '-') { leftAlign = true; i++; }
                  else if (f === '0') { zero = true; i++; }
                  else break;
              }
              // Parse width (digits or *)
              var width = 0;
              while (i < fmt.length && fmt.charAt(i) >= '0' && fmt.charAt(i) <= '9') {
                  width = width * 10 + (fmt.charCodeAt(i) - 48);
                  i++;
              }
              // Parse precision: . then digits or *
              var precision = -1;
              if (i < fmt.length && fmt.charAt(i) === '.') {
                  i++;
                  if (fmt.charAt(i) === '*') {
                      precision = readInt32();
                      i++;
                  } else {
                      precision = 0;
                      while (i < fmt.length && fmt.charAt(i) >= '0' && fmt.charAt(i) <= '9') {
                          precision = precision * 10 + (fmt.charCodeAt(i) - 48);
                          i++;
                      }
                  }
              }
              // Parse length modifier: l, ll, z
              var len = '';
              if (fmt.charAt(i) === 'l') {
                  len = 'l'; i++;
                  if (fmt.charAt(i) === 'l') { len = 'll'; i++; }
              } else if (fmt.charAt(i) === 'z') {
                  len = 'z'; i++;
              }
              // Conversion char
              var conv = fmt.charAt(i); i++;
              var piece = '';
              switch (conv) {
                  case '%': piece = '%'; break;
                  case 's': {
                      var sp = readPtr();
                      piece = sp === 0 ? '<NULL>' : UTF8ToString(sp);
                      if (precision >= 0 && piece.length > precision) {
                          piece = piece.substring(0, precision);
                      }
                      break;
                  }
                  case 'd': case 'i': {
                      var iv = (len === 'll') ? readInt64() : readInt32();
                      piece = iv.toString();
                      break;
                  }
                  case 'u': {
                      var uv = (len === 'll') ? readUInt64() : readUInt32();
                      piece = uv.toString();
                      break;
                  }
                  case 'x': {
                      var xv = (len === 'll') ? readUInt64() : readUInt32();
                      piece = xv.toString(16);
                      break;
                  }
                  case 'X': {
                      var xV = (len === 'll') ? readUInt64() : readUInt32();
                      piece = xV.toString(16).toUpperCase();
                      break;
                  }
                  case 'c': {
                      var cv = readInt32();
                      piece = String.fromCodePoint(cv & 0xFFFFFFFF);
                      break;
                  }
                  case 'p': {
                      var pv = readPtr();
                      piece = '0x' + pv.toString(16);
                      break;
                  }
                  case 'R': {
                      var oh = readPtr();
                      var obj = rt.unwrap(oh);
                      try { piece = String(rt._b_.repr(obj)); }
                      catch (e) { piece = '<repr-err>'; }
                      break;
                  }
                  case 'S': {
                      var oh2 = readPtr();
                      var obj2 = rt.unwrap(oh2);
                      try { piece = String(rt._b_.str.$factory(obj2)); }
                      catch (e) { piece = '<str-err>'; }
                      break;
                  }
                  case 'U': case 'V': {
                      var oh3 = readPtr();
                      var obj3 = rt.unwrap(oh3);
                      piece = (obj3 == null) ? '' : (typeof obj3 === 'string' ? obj3 : String(obj3));
                      break;
                  }
                  default:
                      // Unknown conversion: emit it raw so we notice in tests
                      piece = '%' + conv;
                      break;
              }
              // Apply width (padding) for short pieces. Don't truncate.
              if (width > piece.length) {
                  // For string types %s/%R/%S/%U we ignore the zero flag (CPython
                  // does too — zero only applies to numerics).
                  var useZero = zero && (conv === 'd' || conv === 'i' ||
                                         conv === 'u' || conv === 'x' ||
                                         conv === 'X');
                  piece = pad(piece, width, leftAlign, useZero);
              }
              out += piece;
          }
          return rt.wrap(out);
      }

  
  function _PyUnicode_FromString(uPtr) {
          if (uPtr === 0) return 0;
          return WasthonRT.wrap(UTF8ToString(uPtr));
      }

  function _PyUnicode_GET_LENGTH(handle) {
          var rt = WasthonRT;
          var obj = rt.asJSStr(rt.unwrap(handle));
          if (obj === null) return 0;
          // Count codepoints (not UTF-16 units). For BMP-only strings the
          // two coincide; astral chars (>U+FFFF) take 2 units but 1 codepoint.
          var n = 0;
          for (var i = 0; i < obj.length;) {
              var c = obj.codePointAt(i);
              i += c > 0xFFFF ? 2 : 1;
              n++;
          }
          return n;
      }

  function _PyUnicode_Join(sepH, seqH) {
          var rt = WasthonRT;
          var sep = rt.unwrap(sepH);
          var seq = rt.unwrap(seqH);
          if (typeof sep !== 'string' || !Array.isArray(seq)) return 0;
          try { return rt.wrap(seq.join(sep)); } catch (e) { return 0; }
      }

  function _PyUnicode_KIND(handle) {
          var rt = WasthonRT;
          var obj = rt.unwrap(handle);
          /* PyUnicode_New placeholder: return the kind the buffer was
         * allocated with. */
          if (obj && obj.__wasthon_unicode_kind__) return obj.__wasthon_unicode_kind__;
          /* Existing JS string: compute the minimum kind needed (CPython's
         * PEP 393 contract). This MUST match what PyUnicode_DATA returns
         * — readers expect (kind, data, i) to satisfy stride consistency
         * across input/output buffers. */
          var s = rt.asJSStr(obj);
          if (s === null) return 1;
          var max = 0;
          for (var i = 0; i < s.length;) {
              var c = s.codePointAt(i);
              if (c > max) max = c;
              i += c > 0xFFFF ? 2 : 1;
              if (max > 0xFFFF) break;
          }
          return (max < 0x100) ? 1 : (max < 0x10000 ? 2 : 4);
      }

  function _PyUnicode_Substring(handle, start, end) {
          var rt = WasthonRT;
          var obj = rt.asJSStr(rt.unwrap(handle));
          if (obj === null) return 0;
          // Codepoint-aware slice.
          var cps = [];
          for (var i = 0; i < obj.length;) {
              var c = obj.codePointAt(i);
              cps.push(c);
              i += c > 0xFFFF ? 2 : 1;
          }
          if (end > cps.length) end = cps.length;
          if (start < 0) start = 0;
          var chunk = cps.slice(start, end).map(function(c) {
              return String.fromCodePoint(c);
          }).join('');
          return rt.wrap(chunk);
      }

  
  function _Py_BuildValue(fmtPtr, va) {
          var rt = WasthonRT;
          var fmt = fmtPtr ? UTF8ToString(fmtPtr) : "";
          if (fmt === "" || fmt === "None") return rt.SLOT_NONE;
  
          var p = va;
          function readInt()    { var v = HEAP32[p >> 2] | 0; p += 4; return v; }
          function readUInt()   { var v = HEAPU8[p] | (HEAPU8[p+1] << 8) | (HEAPU8[p+2] << 16) | (HEAPU8[p+3] << 24); p += 4; return v >>> 0; }
          function readPtr()    { var v = HEAP32[p >> 2] >>> 0; p += 4; return v; }
          function readDouble() { p = (p + 7) & ~7; var v = HEAPF64[p >> 3]; p += 8; return v; }
          function readLong64() { p = (p + 7) & ~7; var lo = HEAP32[p >> 2] >>> 0; var hi = HEAP32[(p+4) >> 2] | 0; p += 8; return BigInt(hi) * 0x100000000n + BigInt(lo); }
  
          function readOne(i) {
              var c = fmt[i];
              switch (c) {
                  case 'O': case 'N': case 'S': {
                      var h = readPtr();
                      return [rt.unwrap(h), i+1];
                  }
                  case 's': case 'z': case 'U': {
                      var ptr = readPtr();
                      if (ptr === 0) return [rt._b_.None, i+1];
                      return [UTF8ToString(ptr), i+1];
                  }
                  case 'y': {
                      var ptr = readPtr();
                      if (ptr === 0) return [rt._b_.None, i+1];
                      return [rt._b_.bytes.$factory(UTF8ToString(ptr)), i+1];
                  }
                  case 'i': case 'h': case 'b': case 'l':
                      return [readInt(), i+1];
                  case 'I': case 'H': case 'B': case 'k':
                      return [readUInt(), i+1];
                  case 'L': case 'K': {
                      var big = readLong64();
                      if (big >= -2147483648n && big <= 2147483647n) return [Number(big), i+1];
                      return [big, i+1];
                  }
                  case 'n':
                      return [readInt(), i+1];
                  case 'd': case 'f':
                      return [readDouble(), i+1];
                  case '(': case '[': case '{': {
                      var close = c === '(' ? ')' : (c === '[' ? ']' : '}');
                      var items = [];
                      var j = i + 1;
                      while (j < fmt.length && fmt[j] !== close) {
                          var r = readOne(j);
                          items.push(r[0]); j = r[1];
                      }
                      var coll;
                      if (c === '(') coll = rt._b_.tuple.$factory(items);
                      else if (c === '[') coll = items;  /* JS array == Brython list */
                      else {
                          coll = rt.$B.empty_dict ? rt.$B.empty_dict() : rt._b_.dict.$factory();
                          for (var k = 0; k + 1 < items.length; k += 2) {
                              try {
                                  if (rt._b_.dict && rt._b_.dict.$setitem)
                                      rt._b_.dict.$setitem(coll, items[k], items[k+1]);
                                  else coll[items[k]] = items[k+1];
                              } catch (_) {}
                          }
                      }
                      return [coll, j+1];
                  }
                  case ',': case ' ': case ':':
                      return [null, i+1];  /* separator, ignored */
                  default:
                      throw new Error("Py_BuildValue: unsupported format '" + c + "'");
              }
          }
  
          try {
              var results = [];
              var i = 0;
              while (i < fmt.length) {
                  var r = readOne(i);
                  if (r[0] !== null) results.push(r[0]);
                  i = r[1];
              }
              if (results.length === 1) return rt.wrap(results[0]);
              return rt.wrap(rt._b_.tuple.$factory(results));
          } catch (e) {
              rt.setError(rt.wrap(rt._b_.SystemError),
                  "Py_BuildValue(\"" + fmt + "\"): " + (e.message || String(e)));
              return 0;
          }
      }

  function _Py_HashBuffer(ptr, len) {
          var h = 2166136261 >>> 0;
          for (var i = 0; i < len; i++) {
              h = Math.imul(h ^ HEAPU8[ptr + i], 16777619) >>> 0;
          }
          return h | 0;  // signed for Py_hash_t
      }

  
  function __PyArg_BadArgument(fnPtr, dispPtr, expPtr, argH) {
          var rt = WasthonRT;
          var fname = fnPtr ? UTF8ToString(fnPtr) : "function";
          var disp  = dispPtr ? UTF8ToString(dispPtr) : "argument";
          var exp   = expPtr ? UTF8ToString(expPtr) : "?";
          rt.setError(rt.wrap(rt._b_.TypeError),
              fname + "() " + disp + " must be " + exp);
          return 0;
      }

  
  function __PyArg_CheckPositional(fnamePtr, nargs, min, max) {
          var rt = WasthonRT;
          if (nargs < min || nargs > max) {
              var fname = fnamePtr ? UTF8ToString(fnamePtr) : "function";
              var expected = (min === max) ? min : (min + " to " + max);
              rt.setError(rt.wrap(rt._b_.TypeError),
                  fname + "() takes " + expected + " positional arguments but " + nargs + " were given");
              return 0;
          }
          return 1;
      }

  function __PyDict_Next(dictH, pposPtr, pkeyPtr, pvaluePtr, phashPtr) {
          var rt = WasthonRT;
          var d = rt.unwrap(dictH);
          if (d === null) return 0;
          /* Cache a snapshot of (key, value) pairs on the dict itself so
         * repeated calls iterate consistently. Built via keys+getitem
         * rather than items()-view of-iteration — the view format isn't
         * portable across Brython internals, and pickle's save_dict
         * uses PyDict_Next to walk every item: a bad snapshot means
         * dump-then-load of `{'a':1}` round-trips as `{}`. */
          /* Snapshot cache held in a WeakMap rather than as a property on
         * the dict — keeps the dict's own __dict__ clean so equality
         * comparisons (e.g. round-tripped pickle output) aren't perturbed
         * by leftover iteration state. */
          if (!rt._dictNextSnap) rt._dictNextSnap = new WeakMap();
          var snap = rt._dictNextSnap.get(d);
          if (!snap) {
              snap = [];
              try {
                  var items_view = rt.$B.$call(rt.$B.$getattr(d, 'items'));
                  var items_list = rt.$B.$call(rt._b_.list, items_view);
                  var n = rt._b_.len(items_list);
                  for (var i = 0; i < n; i++) {
                      var pair = rt.$B.$getitem(items_list, i);
                      var k = rt.$B.$getitem(pair, 0);
                      var v = rt.$B.$getitem(pair, 1);
                      snap.push([k, v]);
                  }
              } catch (e) { return 0; }
              rt._dictNextSnap.set(d, snap);
          }
          var pos = HEAP32[pposPtr >> 2];
          if (pos < 0 || pos >= snap.length) {
              rt._dictNextSnap.delete(d);
              return 0;
          }
          var pair = snap[pos];
          if (pkeyPtr)   HEAP32[pkeyPtr   >> 2] = rt.wrap(pair[0]);
          if (pvaluePtr) HEAP32[pvaluePtr >> 2] = rt.wrap(pair[1]);
          if (phashPtr)  HEAP32[phashPtr  >> 2] = 0;
          HEAP32[pposPtr >> 2] = pos + 1;
          return 1;
      }

  function __PyDict_SetItem_KnownHash(dictH, keyH, valueH, hash) {
          // Just delegate to regular SetItem — we don't use the hash hint.
          return _PyDict_SetItem(dictH, keyH, valueH);
      }

  function __PyLong_GetZero() { return WasthonRT.wrap(0); }

  function __PyNumber_Index(handle) {
          var rt = WasthonRT;
          var obj = rt.unwrap(handle);
          if (typeof obj === 'number' && Number.isInteger(obj)) return handle;
          if (typeof obj === 'bigint') return handle;
          try {
              var v = rt._b_.int.$factory(obj);
              return rt.wrap(v);
          } catch (e) {
              rt.setError(rt.wrap(rt._b_.TypeError),
                  "an integer is required");
              return 0;
          }
      }

  function __PyUnicode_Copy(handle) {
          var obj = WasthonRT.unwrap(handle);
          return (typeof obj === 'string') ? WasthonRT.wrap(obj) : 0;
      }

  function __PyUnicode_JoinArray(sepH, itemsPtr, count) {
          var rt = WasthonRT;
          var sep = rt.unwrap(sepH);
          // sep may be Py_None (our _Py_STR(empty) sentinel) → use ""
          if (sep === rt._b_.None || typeof sep !== 'string') sep = "";
          var parts = [];
          for (var i = 0; i < count; i++) {
              var h = HEAP32[(itemsPtr + i * 4) >> 2];
              var v = rt.unwrap(h);
              parts.push(typeof v === 'string' ? v : String(v));
          }
          return rt.wrap(parts.join(sep));
      }

  var ___assert_fail = (condition, filename, line, func) =>
      abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);

  function __wasthon_Py_SET_SIZE(op, size) {
          var obj = WasthonRT.unwrap(op);
          if (obj && obj.__wasthon_ptr__ === op) {
              HEAP32[op >> 2] = size | 0;
              return;
          }
          if (Array.isArray(obj) && size < obj.length) obj.length = size;
      }

  function __wasthon_Py_SIZE(handle) {
          var obj = WasthonRT.unwrap(handle);
          if (obj && obj.__wasthon_ptr__ === handle) {
              return HEAP32[handle >> 2] | 0;
          }
          if (obj === null) return 0;
          if (Array.isArray(obj)) return obj.length;
          if (obj.source) return obj.source.length;
          if (obj.length !== undefined) return obj.length;
          return 0;
      }

  var getHeapMax = () =>
      // Stay one Wasm page short of 4GB: while e.g. Chrome is able to allocate
      // full 4GB Wasm memories, the size will wrap back to 0 bytes in Wasm side
      // for any code that deals with heap sizes, which would require special
      // casing all heap size related code to treat 0 specially.
      2147483648;
  
  var alignMemory = (size, alignment) => {
      return Math.ceil(size / alignment) * alignment;
    };
  
  var growMemory = (size) => {
      var oldHeapSize = wasmMemory.buffer.byteLength;
      var pages = ((size - oldHeapSize + 65535) / 65536) | 0;
      try {
        // round size grow request up to wasm page size (fixed 64KB per spec)
        wasmMemory.grow(pages); // .grow() takes a delta compared to the previous size
        updateMemoryViews();
        return 1 /*success*/;
      } catch(e) {
      }
      // implicit 0 return to save code size (caller will cast "undefined" into 0
      // anyhow)
    };
  var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      // With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
      requestedSize >>>= 0;
      // With multithreaded builds, races can happen (another thread might increase the size
      // in between), so return a failure, and let the caller retry.
  
      // Memory resize rules:
      // 1.  Always increase heap size to at least the requested size, rounded up
      //     to next page multiple.
      // 2a. If MEMORY_GROWTH_LINEAR_STEP == -1, excessively resize the heap
      //     geometrically: increase the heap size according to
      //     MEMORY_GROWTH_GEOMETRIC_STEP factor (default +20%), At most
      //     overreserve by MEMORY_GROWTH_GEOMETRIC_CAP bytes (default 96MB).
      // 2b. If MEMORY_GROWTH_LINEAR_STEP != -1, excessively resize the heap
      //     linearly: increase the heap size by at least
      //     MEMORY_GROWTH_LINEAR_STEP bytes.
      // 3.  Max size for the heap is capped at 2048MB-WASM_PAGE_SIZE, or by
      //     MAXIMUM_MEMORY, or by ASAN limit, depending on which is smallest
      // 4.  If we were unable to allocate as much memory, it may be due to
      //     over-eager decision to excessively reserve due to (3) above.
      //     Hence if an allocation fails, cut down on the amount of excess
      //     growth, in an attempt to succeed to perform a smaller allocation.
  
      // A limit is set for how much we can grow. We should not exceed that
      // (the wasm binary specifies it, so if we tried, we'd fail anyhow).
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        return false;
      }
  
      // Loop through potential heap size increases. If we attempt a too eager
      // reservation that fails, cut down on the attempted size and reserve a
      // smaller bump instead. (max 3 times, chosen somewhat arbitrarily)
      for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown); // ensure geometric growth
        // but limit overreserving (default to capping at +96MB overgrowth at most)
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296 );
  
        var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
  
        var replacement = growMemory(newSize);
        if (replacement) {
  
          return true;
        }
      }
      return false;
    };

  var printCharBuffers = [null,[],[]];
  
  var printChar = (stream, curr) => {
      var buffer = printCharBuffers[stream];
      if (curr === 0 || curr === 10) {
        (stream === 1 ? out : err)(UTF8ArrayToString(buffer));
        buffer.length = 0;
      } else {
        buffer.push(curr);
      }
    };
  
  var flush_NO_FILESYSTEM = () => {
      // flush anything remaining in the buffers during shutdown
      if (printCharBuffers[1].length) printChar(1, 10);
      if (printCharBuffers[2].length) printChar(2, 10);
    };
  
  
  var SYSCALLS = {
  varargs:undefined,
  getStr(ptr) {
        var ret = UTF8ToString(ptr);
        return ret;
      },
  };
  var _fd_write = (fd, iov, iovcnt, pnum) => {
      // hack to support printf in SYSCALLS_REQUIRE_FILESYSTEM=0
      var num = 0;
      for (var i = 0; i < iovcnt; i++) {
        var ptr = HEAPU32[((iov)>>2)];
        var len = HEAPU32[(((iov)+(4))>>2)];
        iov += 8;
        for (var j = 0; j < len; j++) {
          printChar(fd, HEAPU8[ptr+j]);
        }
        num += len;
      }
      HEAPU32[((pnum)>>2)] = num;
      return 0;
    };

  function _wasthon_bind_builtin_type(tag, structPtr) {
          var rt = WasthonRT;
          var cls;
          switch (tag) {
              case 0: cls = rt._b_.type;   break;
              case 1: cls = rt._b_.tuple;  break;
              case 2: cls = rt._b_.dict;   break;
              case 3: cls = rt._b_.list;   break;
              case 4: cls = rt._b_.int;    break;
              case 5: cls = rt._b_.float;  break;
              case 6: cls = rt._b_.str;    break;
              case 7: cls = rt._b_.bytes;  break;
              case 8: cls = rt._b_.bool;   break;
              case 9: cls = rt._b_.bytearray; break;
              case 10: cls = rt._b_.set;       break;
              case 11: cls = rt._b_.frozenset; break;
              case 12: cls = rt._b_.function;  break;
              /* PickleBuffer has no Brython equivalent (protocol 5 only,
             * unsupported here). Bind to a sentinel object so the type
             * pointer is non-NULL but no instance ever matches. */
              case 13: cls = { __wasthon_picklebuffer__: true }; break;
              default: return;
          }
          rt.handles.set(structPtr, cls);
          rt.builtinTypeForClass = rt.builtinTypeForClass || new Map();
          rt.builtinTypeForClass.set(cls, structPtr);
      }

  function _wasthon_builtin_tp_iter(handle) {
          var rt = WasthonRT;
          var obj = rt.unwrap(handle);
          if (obj === null) return 0;
          try { return rt.wrap(rt._b_.iter(obj)); }
          catch (e) {
              rt.forwardError(e, rt._b_.TypeError);
              return 0;
          }
      }

  function _wasthon_float_as_integer_ratio(selfH, unusedH) {
          var rt = WasthonRT;
          try {
              var x = rt.unwrap(selfH);
              var asNum = typeof x === 'number' ? x : Number(x);
              if (!isFinite(asNum)) {
                  rt.setError(rt.wrap(rt._b_.OverflowError),
                      "cannot convert " + asNum + " to integer ratio");
                  return 0;
              }
              // Brython exposes float.as_integer_ratio via _b_.float
              var fn = rt.$B.$getattr(rt._b_.float, 'as_integer_ratio');
              return rt.wrap(rt.$B.$call(fn, asNum));
          } catch (e) {
              rt.forwardError(e, rt._b_.RuntimeError);
              return 0;
          }
      }

  function _wasthon_float_nb_absolute(handle) {
          var rt = WasthonRT;
          try {
              var x = rt.unwrap(handle);
              return rt.wrap(Math.abs(typeof x === 'number' ? x : Number(x)));
          } catch (e) {
              rt.forwardError(e, rt._b_.TypeError);
              return 0;
          }
      }

  function _wasthon_get_PyExc_ArithmeticError() { return WasthonRT.wrap(WasthonRT._b_.ArithmeticError); }

  function _wasthon_get_PyExc_AttributeError() { return WasthonRT.wrap(WasthonRT._b_.AttributeError); }

  function _wasthon_get_PyExc_BufferError() { return WasthonRT.wrap(WasthonRT._b_.BufferError); }

  function _wasthon_get_PyExc_DeprecationWarning() { return WasthonRT.wrap(WasthonRT._b_.DeprecationWarning); }

  function _wasthon_get_PyExc_EOFError() { return WasthonRT.wrap(WasthonRT._b_.EOFError); }

  function _wasthon_get_PyExc_Exception() { return WasthonRT.wrap(WasthonRT._b_.Exception); }

  function _wasthon_get_PyExc_ImportError() { return WasthonRT.wrap(WasthonRT._b_.ImportError); }

  function _wasthon_get_PyExc_IndexError() { return WasthonRT.wrap(WasthonRT._b_.IndexError); }

  function _wasthon_get_PyExc_KeyError() { return WasthonRT.wrap(WasthonRT._b_.KeyError); }

  function _wasthon_get_PyExc_LookupError() { return WasthonRT.wrap(WasthonRT._b_.LookupError); }

  function _wasthon_get_PyExc_MemoryError() { return WasthonRT.wrap(WasthonRT._b_.MemoryError); }

  function _wasthon_get_PyExc_NotImplementedError() { return WasthonRT.wrap(WasthonRT._b_.NotImplementedError); }

  function _wasthon_get_PyExc_OSError() { return WasthonRT.wrap(WasthonRT._b_.OSError); }

  function _wasthon_get_PyExc_OverflowError() { return WasthonRT.wrap(WasthonRT._b_.OverflowError); }

  function _wasthon_get_PyExc_RecursionError() { return WasthonRT.wrap(WasthonRT._b_.RecursionError); }

  function _wasthon_get_PyExc_RuntimeError() { return WasthonRT.wrap(WasthonRT._b_.RuntimeError); }

  function _wasthon_get_PyExc_StopIteration() { return WasthonRT.wrap(WasthonRT._b_.StopIteration); }

  function _wasthon_get_PyExc_SystemError() { return WasthonRT.wrap(WasthonRT._b_.SystemError); }

  function _wasthon_get_PyExc_TypeError() { return WasthonRT.wrap(WasthonRT._b_.TypeError); }

  function _wasthon_get_PyExc_UnicodeDecodeError() { return WasthonRT.wrap(WasthonRT._b_.UnicodeDecodeError); }

  function _wasthon_get_PyExc_UnicodeEncodeError() { return WasthonRT.wrap(WasthonRT._b_.UnicodeEncodeError); }

  function _wasthon_get_PyExc_UnicodeError() { return WasthonRT.wrap(WasthonRT._b_.UnicodeError); }

  function _wasthon_get_PyExc_ValueError() { return WasthonRT.wrap(WasthonRT._b_.ValueError); }

  function _wasthon_get_PyExc_Warning() { return WasthonRT.wrap(WasthonRT._b_.Warning); }

  function _wasthon_get_PyExc_ZeroDivisionError() { return WasthonRT.wrap(WasthonRT._b_.ZeroDivisionError); }

  function _wasthon_get_Py_Ellipsis() { return WasthonRT.wrap(WasthonRT._b_.Ellipsis); }

  function _wasthon_get_Py_False() { return WasthonRT.SLOT_FALSE; }

  function _wasthon_get_Py_None() { return WasthonRT.SLOT_NONE;  }

  function _wasthon_get_Py_NotImplemented() { return WasthonRT.SLOT_NOTIMPLEMENTED; }

  function _wasthon_get_Py_True() { return WasthonRT.SLOT_TRUE;  }

  function _wasthon_get_buffer_data(handle, outBufPtrPtr, outLenPtr) {
          var obj = WasthonRT.unwrap(handle);
          if (obj === null || obj === undefined) {
              WasthonRT.setError(WasthonRT.wrap(WasthonRT._b_.TypeError),
                  "a bytes-like object is required, not 'NoneType'");
              return -1;
          }
  
          // Source of bytes: Brython bytes/bytearray store an Array<int> in .source;
          // memoryview wraps another buffer-protocol object; raw Uint8Array is
          // accepted for completeness (e.g. when called from JS-side helpers).
          var src = null;
          if (obj.source !== undefined && obj.source !== null) {
              src = obj.source;
          } else if (obj instanceof Uint8Array) {
              src = obj;
          } else if (Array.isArray(obj)) {
              src = obj;
          } else {
              var className = WasthonRT.$B.class_name ? WasthonRT.$B.class_name(obj) : typeof obj;
              WasthonRT.setError(WasthonRT.wrap(WasthonRT._b_.TypeError),
                  "a bytes-like object is required, not '" + className + "'");
              return -1;
          }
  
          var len = src.length;
          var buf = _malloc(len);
          if (buf === 0 && len !== 0) {
              WasthonRT.setError(WasthonRT.wrap(WasthonRT._b_.MemoryError),
                  "buffer allocation failed");
              return -1;
          }
  
          // Copy into linear memory. TypedArray.set accepts both Uint8Array
          // (intrinsic memcpy) and Array<int> (engine-vectorized bulk copy).
          // Both vastly outperform a JS-level byte-by-byte loop, which is
          // the bottleneck for buffer marshalling on large payloads.
          HEAPU8.set(src, buf);
  
          // Write back: outBufPtrPtr points to a void*, outLenPtr to Py_ssize_t.
          // wasm32: pointer = 4 bytes, Py_ssize_t (intptr_t) = 4 bytes.
          HEAP32[outBufPtrPtr >> 2] = buf;
          HEAP32[outLenPtr >> 2] = len;
          return 0;
      }

  function _wasthon_get_type_of(handle) {
          var rt = WasthonRT;
          var obj = rt.unwrap(handle);
          if (obj === null) return 0;
          if (obj.__wasthon_type__) return obj.__wasthon_type__;
          var cls = obj.__class__ || (rt.$B.get_class && rt.$B.get_class(obj));
          /* Built-in types: return the singleton struct address so that
         * Py_TYPE(x) == &PyTuple_Type comparisons work (otherwise wrap()
         * allocates a fresh handle each call and the comparison fails). */
          if (rt.builtinTypeForClass && rt.builtinTypeForClass.has(cls)) {
              return rt.builtinTypeForClass.get(cls);
          }
          return rt.wrap(cls);
      }

  function _wasthon_isinstance_of_builtin(handle, tag) {
          var rt = WasthonRT;
          var obj = rt.unwrap(handle);
          if (obj === null) return 0;
          // tag values must match WT_TAG_* in wasthon.c
          var target;
          switch (tag) {
              case 1: target = rt._b_.str;   break;  // UNICODE
              case 2: target = rt._b_.bytes; break;  // BYTES
              case 3: target = rt._b_.dict;  break;  // DICT
              case 4: target = rt._b_.tuple; break;  // TUPLE
              case 5: target = rt._b_.list;  break;  // LIST
              case 6: target = rt._b_.int;   break;  // LONG
              case 7: target = rt._b_.float; break;  // FLOAT
              default: return 0;
          }
          // Direct match plus instanceof for primitives.
          if (obj.__class__ === target) return 1;
          if (target === rt._b_.str   && typeof obj === 'string')  return 1;
          if (target === rt._b_.int   && (typeof obj === 'number' && Number.isInteger(obj))) return 1;
          if (target === rt._b_.float && typeof obj === 'number')  return 1;
          if (target === rt._b_.tuple && Array.isArray(obj))       return 1;
          // Subclass check via Brython's $isinstance.
          try { return rt.$B.$isinstance(obj, target) ? 1 : 0; }
          catch (e) { return 0; }
      }

  function _wasthon_list_items(handle) {
          var rt = WasthonRT;
          var arr = rt.unwrap(handle);
          if (!Array.isArray(arr)) return 0;
          var n = arr.length;
          var ptr = _malloc(Math.max(4, n * 4));
          for (var i = 0; i < n; i++) {
              HEAP32[(ptr + i * 4) >> 2] = rt.wrap(arr[i]);
          }
          return ptr;
      }

  function _wasthon_long_bit_length(selfH, unusedH) {
          var rt = WasthonRT;
          var x = rt.unwrap(selfH);
          var n;
          if (typeof x === 'bigint') {
              n = x < 0n ? -x : x;
          } else if (typeof x === 'number') {
              n = BigInt(Math.abs(Math.trunc(x)));
          } else {
              try { n = BigInt(rt.$B.$call(rt._b_.int, x) | 0); } catch (e) { n = 0n; }
              if (n < 0n) n = -n;
          }
          var bits = 0;
          while (n > 0n) { bits++; n >>= 1n; }
          return rt.wrap(bits);
      }

  function _wasthon_long_nb_floor_divide(aH, bH) {
          var rt = WasthonRT;
          try {
              var a = rt.unwrap(aH), b = rt.unwrap(bH);
              return rt.wrap(rt.$B.$call(rt._b_.int.__floordiv__, a, b));
          } catch (e) {
              rt.forwardError(e, rt._b_.TypeError);
              return 0;
          }
      }

  function _wasthon_long_nb_multiply(aH, bH) {
          var rt = WasthonRT;
          try {
              var a = rt.unwrap(aH), b = rt.unwrap(bH);
              return rt.wrap(rt.$B.$call(rt._b_.int.__mul__, a, b));
          } catch (e) {
              rt.forwardError(e, rt._b_.TypeError);
              return 0;
          }
      }

  function _wasthon_long_nb_power(aH, bH, cH) {
          var rt = WasthonRT;
          try {
              var a = rt.unwrap(aH), b = rt.unwrap(bH), c = rt.unwrap(cH);
              if (c === null || c === rt._b_.None) {
                  return rt.wrap(rt.$B.$call(rt._b_.int.__pow__, a, b));
              }
              return rt.wrap(rt._b_.pow(a, b, c));
          } catch (e) {
              rt.forwardError(e, rt._b_.TypeError);
              return 0;
          }
      }

  
  function _wasthon_module_get_state(moduleHandle) {
          var entry = WasthonRT_module_state[moduleHandle];
          return entry ? entry.state : 0;
      }

  function _wasthon_object_check_buffer(handle) {
          var obj = WasthonRT.unwrap(handle);
          if (obj === null) return 0;
          if (obj.source !== undefined) return 1;          // bytes/bytearray
          if (obj instanceof Uint8Array) return 1;
          // Could check for memoryview / array.array via __class__ chain;
          // sha2module.c only feeds bytes-like, so this is sufficient.
          return 0;
      }

  function _wasthon_object_gc_new(typeHandle) {
          var rt = WasthonRT;
          var typeInfo = rt.types.get(typeHandle);
          if (!typeInfo) {
              rt.setError(rt.wrap(rt._b_.SystemError),
                  "PyObject_GC_New: unknown type");
              return 0;
          }
          var size = typeInfo.basicsize;
          var ptr = _malloc(size);
          if (ptr === 0) {
              rt.setError(rt.wrap(rt._b_.MemoryError), "PyObject_GC_New");
              return 0;
          }
          HEAPU8.fill(0, ptr, ptr + size);
          var instance = {
              ob_type: typeInfo.brythonClass,
              __class__: typeInfo.brythonClass,
              __wasthon_ptr__: ptr,
              __wasthon_type__: typeHandle,
          };
          rt.bindInstance(ptr, instance);
          return ptr;
      }

  function _wasthon_object_gc_new_var(typeHandle, n) {
          var rt = WasthonRT;
          var typeInfo = rt.types.get(typeHandle);
          if (!typeInfo) return 0;
          var size = typeInfo.basicsize + n * typeInfo.itemsize;
          var ptr = _malloc(size);
          if (ptr === 0) {
              rt.setError(rt.wrap(rt._b_.MemoryError), "PyObject_GC_NewVar");
              return 0;
          }
          HEAPU8.fill(0, ptr, ptr + size);
          var instance = {
              ob_type: typeInfo.brythonClass,
              __class__: typeInfo.brythonClass,
              __wasthon_ptr__: ptr,
              __wasthon_type__: typeHandle,
          };
          rt.bindInstance(ptr, instance);
          return ptr;
      }

  function _wasthon_type_get_module(typeHandle) {
          var t = WasthonRT.unwrap(typeHandle);
          if (!t || !t.__wasthon_module__) return 0;
          return t.__wasthon_module__;
      }

  function _wasthon_unicode_isalnum(ch) {
          return /[\p{L}\p{N}]/u.test(String.fromCodePoint(ch)) ? 1 : 0;
      }

  function _wasthon_unicode_isdecimal(ch) {
          return /\p{Nd}/u.test(String.fromCodePoint(ch)) ? 1 : 0;
      }

  function _wasthon_unicode_islinebreak(ch) {
          // Python's Py_UNICODE_ISLINEBREAK: \n \r \v \f \x1c-\x1e \x85 U+2028 U+2029
          return (ch === 0x0a || ch === 0x0b || ch === 0x0c || ch === 0x0d ||
                  ch === 0x1c || ch === 0x1d || ch === 0x1e || ch === 0x85 ||
                  ch === 0x2028 || ch === 0x2029) ? 1 : 0;
      }

  function _wasthon_unicode_isspace(ch) {
          return /\s/u.test(String.fromCodePoint(ch)) ? 1 : 0;
      }

  function _wasthon_unicode_tolower(ch) {
          return String.fromCodePoint(ch).toLowerCase().codePointAt(0);
      }

  function _wasthon_unicode_toupper(ch) {
          return String.fromCodePoint(ch).toUpperCase().codePointAt(0);
      }

  
  function _wasthon_unpack_keywords(argsPtr, nargs, kwargs, kwnames,
                                         parserPtr, minpos, maxpos,
                                         minkw, varpos, bufPtr) {
          // ---- Read parser fields ----
          var keywordsArrPtr = HEAP32[ parserPtr        >> 2];
          var fnamePtr       = HEAP32[(parserPtr +  4)  >> 2];
          var fname          = fnamePtr ? UTF8ToString(fnamePtr) : "function";
  
          // ---- Read keyword names from the NULL-terminated C array ----
          var keywords = [];
          for (var kp = keywordsArrPtr; ; kp += 4) {
              var sptr = HEAP32[kp >> 2];
              if (sptr === 0) break;
              keywords.push(UTF8ToString(sptr));
          }
          var totalKw = keywords.length;
  
          // ---- Validate positional count ----
          if (nargs < minpos) {
              WasthonRT.setError(
                  WasthonRT.wrap(WasthonRT._b_.TypeError),
                  fname + "() takes at least " + minpos +
                      " positional argument" + (minpos === 1 ? "" : "s") +
                      " (" + nargs + " given)");
              return 0;
          }
          if (nargs > maxpos && !varpos) {
              WasthonRT.setError(
                  WasthonRT.wrap(WasthonRT._b_.TypeError),
                  fname + "() takes at most " + maxpos +
                      " positional argument" + (maxpos === 1 ? "" : "s") +
                      " (" + nargs + " given)");
              return 0;
          }
  
          // ---- Initialize buf to NULL for every slot ----
          for (var i = 0; i < totalKw; i++) {
              HEAP32[(bufPtr + i*4) >> 2] = 0;
          }
  
          // ---- Place positional args into buf ----
          var nposCopy = Math.min(nargs, maxpos);
          for (var i = 0; i < nposCopy; i++) {
              HEAP32[(bufPtr + i*4) >> 2] = HEAP32[(argsPtr + i*4) >> 2];
          }
  
          // ---- Process keyword args (FASTCALL pattern: kwnames is a tuple,
          // values appended to args[]) ----
          if (kwnames !== 0) {
              var kwnamesObj = WasthonRT.unwrap(kwnames);
              var nkw = kwnamesObj ? (kwnamesObj.length || 0) : 0;
              for (var i = 0; i < nkw; i++) {
                  var nameObj = kwnamesObj[i];
                  // Brython str values are typically JS strings.
                  var name = (typeof nameObj === 'string') ? nameObj : String(nameObj);
  
                  // Find name in the keyword list (linear scan; the lists are
                  // tiny — sha2 has 3 entries — so a hash table would be overkill).
                  var foundIdx = -1;
                  for (var k = 0; k < totalKw; k++) {
                      if (keywords[k] === name) { foundIdx = k; break; }
                  }
                  if (foundIdx < 0) {
                      WasthonRT.setError(
                          WasthonRT.wrap(WasthonRT._b_.TypeError),
                          fname + "() got an unexpected keyword argument '" + name + "'");
                      return 0;
                  }
  
                  // Refuse if a positional already supplied this slot.
                  if (HEAP32[(bufPtr + foundIdx*4) >> 2] !== 0) {
                      WasthonRT.setError(
                          WasthonRT.wrap(WasthonRT._b_.TypeError),
                          fname + "() got multiple values for argument '" + name + "'");
                      return 0;
                  }
  
                  // Value lives at args[nargs + i].
                  var valuePtr = HEAP32[(argsPtr + (nargs + i)*4) >> 2];
                  HEAP32[(bufPtr + foundIdx*4) >> 2] = valuePtr;
              }
          }
  
          // ---- Process keyword args (legacy dict-style: kwargs is a dict) ----
          // Some clinic callers (e.g. _lzma's LZMADecompressor) still pass a
          // kwargs dict to _PyArg_UnpackKeywords. We can't iterate Brython
          // dicts directly (no `.items()` / `.keys()` on the class), but we
          // already know every legal keyword name from the parser's keywords
          // array — just probe each by string lookup.
          if (kwargs !== 0) {
              var rt = WasthonRT;
              var kw = rt.unwrap(kwargs);
              if (kw && kw !== rt._b_.None) {
                  for (var k = 0; k < totalKw; k++) {
                      var kname = keywords[k];
                      var found = false;
                      try { found = rt._b_.dict.$contains_string(kw, kname); }
                      catch (_) { found = false; }
                      if (!found) continue;
                      if (HEAP32[(bufPtr + k*4) >> 2] !== 0) {
                          rt.setError(rt.wrap(rt._b_.TypeError),
                              fname + "() got multiple values for argument '" + kname + "'");
                          return 0;
                      }
                      var value;
                      try { value = rt._b_.dict.$getitem(kw, kname); }
                      catch (_) { continue; }
                      HEAP32[(bufPtr + k*4) >> 2] = rt.wrap(value);
                  }
              }
          }
  
          // ---- Check that minkw kw-only args were supplied ----
          // kw-only slots are at indices [maxpos .. totalKw-1]; the first minkw
          // of them are required.
          if (minkw > 0) {
              var kwSuppliedRequired = 0;
              for (var k = maxpos; k < maxpos + minkw && k < totalKw; k++) {
                  if (HEAP32[(bufPtr + k*4) >> 2] !== 0) {
                      kwSuppliedRequired++;
                  }
              }
              if (kwSuppliedRequired < minkw) {
                  // Find the first missing required kw-only arg for a clear msg.
                  for (var k = maxpos; k < maxpos + minkw && k < totalKw; k++) {
                      if (HEAP32[(bufPtr + k*4) >> 2] === 0) {
                          WasthonRT.setError(
                              WasthonRT.wrap(WasthonRT._b_.TypeError),
                              fname + "() missing required keyword-only argument: '" +
                                  keywords[k] + "'");
                          return 0;
                      }
                  }
              }
          }
  
          return bufPtr;
      }







  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      // Parameter maxBytesToWrite is not optional. Negative values, 0, null,
      // undefined and false each don't write out any bytes.
      if (!(maxBytesToWrite > 0))
        return 0;
  
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
      for (var i = 0; i < str.length; ++i) {
        // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
        // and https://www.ietf.org/rfc/rfc2279.txt
        // and https://tools.ietf.org/html/rfc3629
        var u = str.codePointAt(i);
        if (u <= 0x7F) {
          if (outIdx >= endIdx) break;
          heap[outIdx++] = u;
        } else if (u <= 0x7FF) {
          if (outIdx + 1 >= endIdx) break;
          heap[outIdx++] = 0xC0 | (u >> 6);
          heap[outIdx++] = 0x80 | (u & 63);
        } else if (u <= 0xFFFF) {
          if (outIdx + 2 >= endIdx) break;
          heap[outIdx++] = 0xE0 | (u >> 12);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
        } else {
          if (outIdx + 3 >= endIdx) break;
          heap[outIdx++] = 0xF0 | (u >> 18);
          heap[outIdx++] = 0x80 | ((u >> 12) & 63);
          heap[outIdx++] = 0x80 | ((u >> 6) & 63);
          heap[outIdx++] = 0x80 | (u & 63);
          // Gotcha: if codePoint is over 0xFFFF, it is represented as a surrogate pair in UTF-16.
          // We need to manually skip over the second code unit for correct iteration.
          i++;
        }
      }
      // Null-terminate the pointer to the buffer.
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
      return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    };

  var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0; i < str.length; ++i) {
        // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
        // unit, not a Unicode code point of the character! So decode
        // UTF16->UTF32->UTF8.
        // See http://unicode.org/faq/utf_bom.html#utf16-3
        var c = str.charCodeAt(i); // possibly a lead surrogate
        if (c <= 0x7F) {
          len++;
        } else if (c <= 0x7FF) {
          len += 2;
        } else if (c >= 0xD800 && c <= 0xDFFF) {
          len += 4; ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };

  
  
  
  function _wasthon_module_create(defHandle) {
          var rt = WasthonRT;
          var defInfo = rt.moduleDefs.get(defHandle);
          if (!defInfo) {
              rt.setError(rt.wrap(rt._b_.SystemError),
                  "wasthon_module_create: unknown module def");
              return 0;
          }
  
          // Create a Brython module via canonical $B.module.tp_new + tp_init.
          // Using the official path ensures attribute access goes through the
          // module dict (otherwise getattr returns the raw JS value wrapped as
          // a JSObj, which breaks Python semantics).
          var modObj = rt.$B.module.tp_new(rt.$B.module);
          rt.$B.module.tp_init(modObj, defInfo.name,
                               defInfo.doc || rt._b_.None);
          var modHandle = rt.wrap(modObj);
  
          // Allocate per-module state (m_size bytes) and register it.
          var statePtr = 0;
          if (defInfo.size > 0) {
              statePtr = _malloc(defInfo.size);
              // Zero-init: callers expect calloc'd state.
              HEAPU8.fill(0, statePtr, statePtr + defInfo.size);
          }
          rt.modules.set(modHandle, {
              def: defInfo,
              statePtr: statePtr,
              name: defInfo.name,
              obj: modObj,
              types: [],
          });
          // Mirror to the tier-8 module_state map.
          WasthonRT_module_state[modHandle] = { state: statePtr, types: [] };
  
          // Register module-level methods (m_methods array).
          if (defInfo.methods !== 0) {
              __wasthon_install_methods(modObj, defInfo.methods, modHandle, /*moduleScope=*/true);
          }
  
          // Run Py_mod_exec slots in order. Some module init paths recurse
          // into Brython (PyImport_ImportModule, class registration via
          // numbers.Number.register, etc.) — Brython expects a current
          // frame on $B.frame_obj (for globals() etc.) and crashes if it's
          // null. We push a synthetic frame around the exec call:
          //   frame = [name, locals_dict, name, globals_dict]
          // and pop it after, even on error.
          if (defInfo.slots !== 0) {
              var modDict = rt.$B.get_dict(modObj);
              var modName = defInfo.name || '<wasthon>';
              var frame = [modName, modDict, modName, modDict];
              rt.$B.enter_frame(frame, '<wasthon>', 0);
              try {
                  for (var sp = defInfo.slots; ; sp += 8) {
                      var slot = HEAP32[sp >> 2];
                      if (slot === 0) break;
                      var value = HEAP32[(sp + 4) >> 2];
                      if (slot === 1 /* Py_mod_exec */) {
                          // Slot value is a function pointer with signature int(PyObject*).
                          var rc = getWasmTableEntry(value)(modHandle);
                          if (rc !== 0) {
                              if (!rt.pendingException) {
                                  rt.setError(rt.wrap(rt._b_.SystemError),
                                      "module exec slot returned " + rc + " without setting an exception");
                              }
                              return 0;
                          }
                      }
                      // Other slots (Py_mod_create, gil flags) are ignored for now.
                  }
              } finally {
                  rt.$B.leave_frame();
              }
          }
          return modHandle;
      }
WasthonRT.init(); Module["wasthon"] = WasthonRT;;
// End JS library code

// include: postlibrary.js
// This file is included after the automatically-generated JS library code
// but before the wasm module is created.

{

  // Begin ATMODULES hooks
  if (Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime'];
if (Module['print']) out = Module['print'];
if (Module['printErr']) err = Module['printErr'];
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
  // End ATMODULES hooks

  if (Module['arguments']) arguments_ = Module['arguments'];
  if (Module['thisProgram']) thisProgram = Module['thisProgram'];

  if (Module['preInit']) {
    if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
    while (Module['preInit'].length > 0) {
      Module['preInit'].shift()();
    }
  }
}

// Begin runtime exports
  Module['UTF8ToString'] = UTF8ToString;
  Module['stringToUTF8'] = stringToUTF8;
  Module['lengthBytesUTF8'] = lengthBytesUTF8;
  // End runtime exports
  // Begin JS library exports
  Module['_wasthon_module_create'] = _wasthon_module_create;
  // End JS library exports

// end include: postlibrary.js


// Imports from the Wasm binary.
var _PyInit__sre,
  _wasthon_init,
  _free,
  _malloc,
  _wasthon_get_default_tp_alloc,
  _wasthon_get_builtin_tp_iter,
  __emscripten_stack_restore,
  __emscripten_stack_alloc,
  _emscripten_stack_get_current,
  memory,
  __indirect_function_table,
  wasmMemory,
  wasmTable;


function assignWasmExports(wasmExports) {
  _PyInit__sre = Module['_PyInit__sre'] = wasmExports['PyInit__sre'];
  _wasthon_init = Module['_wasthon_init'] = wasmExports['wasthon_init'];
  _free = Module['_free'] = wasmExports['free'];
  _malloc = Module['_malloc'] = wasmExports['malloc'];
  _wasthon_get_default_tp_alloc = Module['_wasthon_get_default_tp_alloc'] = wasmExports['wasthon_get_default_tp_alloc'];
  _wasthon_get_builtin_tp_iter = Module['_wasthon_get_builtin_tp_iter'] = wasmExports['wasthon_get_builtin_tp_iter'];
  __emscripten_stack_restore = wasmExports['_emscripten_stack_restore'];
  __emscripten_stack_alloc = wasmExports['_emscripten_stack_alloc'];
  _emscripten_stack_get_current = wasmExports['emscripten_stack_get_current'];
  memory = wasmMemory = wasmExports['memory'];
  __indirect_function_table = wasmTable = wasmExports['__indirect_function_table'];
}

var wasmImports = {
  /** @export */
  PyBool_FromLong: _PyBool_FromLong,
  /** @export */
  PyBytes_FromObject: _PyBytes_FromObject,
  /** @export */
  PyBytes_FromStringAndSize: _PyBytes_FromStringAndSize,
  /** @export */
  PyBytes_Join: _PyBytes_Join,
  /** @export */
  PyBytes_Size: _PyBytes_Size,
  /** @export */
  PyCallIter_New: _PyCallIter_New,
  /** @export */
  PyCallable_Check: _PyCallable_Check,
  /** @export */
  PyDictProxy_New: _PyDictProxy_New,
  /** @export */
  PyDict_GET_SIZE: _PyDict_GET_SIZE,
  /** @export */
  PyDict_GetItemWithError: _PyDict_GetItemWithError,
  /** @export */
  PyDict_New: _PyDict_New,
  /** @export */
  PyErr_CheckSignals: _PyErr_CheckSignals,
  /** @export */
  PyErr_Clear: _PyErr_Clear,
  /** @export */
  PyErr_ExceptionMatches: _PyErr_ExceptionMatches,
  /** @export */
  PyErr_Format: _PyErr_Format,
  /** @export */
  PyErr_NoMemory: _PyErr_NoMemory,
  /** @export */
  PyErr_Occurred: _PyErr_Occurred,
  /** @export */
  PyErr_SetString: _PyErr_SetString,
  /** @export */
  PyImport_ImportModuleAttrString: _PyImport_ImportModuleAttrString,
  /** @export */
  PyIndex_Check: _PyIndex_Check,
  /** @export */
  PyList_Append: _PyList_Append,
  /** @export */
  PyList_New: _PyList_New,
  /** @export */
  PyList_Size: _PyList_Size,
  /** @export */
  PyLong_AsInt: _PyLong_AsInt,
  /** @export */
  PyLong_AsSsize_t: _PyLong_AsSsize_t,
  /** @export */
  PyLong_AsUnsignedLong: _PyLong_AsUnsignedLong,
  /** @export */
  PyLong_FromLong: _PyLong_FromLong,
  /** @export */
  PyLong_FromSsize_t: _PyLong_FromSsize_t,
  /** @export */
  PyLong_FromUnsignedLong: _PyLong_FromUnsignedLong,
  /** @export */
  PyModuleDef_Init: _PyModuleDef_Init,
  /** @export */
  PyModule_Add: _PyModule_Add,
  /** @export */
  PyModule_AddIntConstant: _PyModule_AddIntConstant,
  /** @export */
  PyModule_AddStringConstant: _PyModule_AddStringConstant,
  /** @export */
  PyNumber_AsSsize_t: _PyNumber_AsSsize_t,
  /** @export */
  PyObject_CallOneArg: _PyObject_CallOneArg,
  /** @export */
  PyObject_GetAttrString: _PyObject_GetAttrString,
  /** @export */
  PyObject_Hash: _PyObject_Hash,
  /** @export */
  PyObject_RichCompareBool: _PyObject_RichCompareBool,
  /** @export */
  PyObject_Vectorcall: _PyObject_Vectorcall,
  /** @export */
  PyTuple_GET_SIZE: _PyTuple_GET_SIZE,
  /** @export */
  PyTuple_GetItem: _PyTuple_GetItem,
  /** @export */
  PyTuple_New: _PyTuple_New,
  /** @export */
  PyTuple_SetItem: _PyTuple_SetItem,
  /** @export */
  PyType_FromModuleAndSpec: _PyType_FromModuleAndSpec,
  /** @export */
  PyUnicode_DATA: _PyUnicode_DATA,
  /** @export */
  PyUnicode_FindChar: _PyUnicode_FindChar,
  /** @export */
  PyUnicode_FromFormat: _PyUnicode_FromFormat,
  /** @export */
  PyUnicode_FromString: _PyUnicode_FromString,
  /** @export */
  PyUnicode_GET_LENGTH: _PyUnicode_GET_LENGTH,
  /** @export */
  PyUnicode_Join: _PyUnicode_Join,
  /** @export */
  PyUnicode_KIND: _PyUnicode_KIND,
  /** @export */
  PyUnicode_Substring: _PyUnicode_Substring,
  /** @export */
  Py_BuildValue: _Py_BuildValue,
  /** @export */
  Py_HashBuffer: _Py_HashBuffer,
  /** @export */
  _PyArg_BadArgument: __PyArg_BadArgument,
  /** @export */
  _PyArg_CheckPositional: __PyArg_CheckPositional,
  /** @export */
  _PyDict_Next: __PyDict_Next,
  /** @export */
  _PyDict_SetItem_KnownHash: __PyDict_SetItem_KnownHash,
  /** @export */
  _PyLong_GetZero: __PyLong_GetZero,
  /** @export */
  _PyNumber_Index: __PyNumber_Index,
  /** @export */
  _PyUnicode_Copy: __PyUnicode_Copy,
  /** @export */
  _PyUnicode_JoinArray: __PyUnicode_JoinArray,
  /** @export */
  __assert_fail: ___assert_fail,
  /** @export */
  _wasthon_Py_SET_SIZE: __wasthon_Py_SET_SIZE,
  /** @export */
  _wasthon_Py_SIZE: __wasthon_Py_SIZE,
  /** @export */
  emscripten_resize_heap: _emscripten_resize_heap,
  /** @export */
  fd_write: _fd_write,
  /** @export */
  wasthon_bind_builtin_type: _wasthon_bind_builtin_type,
  /** @export */
  wasthon_builtin_tp_iter: _wasthon_builtin_tp_iter,
  /** @export */
  wasthon_float_as_integer_ratio: _wasthon_float_as_integer_ratio,
  /** @export */
  wasthon_float_nb_absolute: _wasthon_float_nb_absolute,
  /** @export */
  wasthon_get_PyExc_ArithmeticError: _wasthon_get_PyExc_ArithmeticError,
  /** @export */
  wasthon_get_PyExc_AttributeError: _wasthon_get_PyExc_AttributeError,
  /** @export */
  wasthon_get_PyExc_BufferError: _wasthon_get_PyExc_BufferError,
  /** @export */
  wasthon_get_PyExc_DeprecationWarning: _wasthon_get_PyExc_DeprecationWarning,
  /** @export */
  wasthon_get_PyExc_EOFError: _wasthon_get_PyExc_EOFError,
  /** @export */
  wasthon_get_PyExc_Exception: _wasthon_get_PyExc_Exception,
  /** @export */
  wasthon_get_PyExc_ImportError: _wasthon_get_PyExc_ImportError,
  /** @export */
  wasthon_get_PyExc_IndexError: _wasthon_get_PyExc_IndexError,
  /** @export */
  wasthon_get_PyExc_KeyError: _wasthon_get_PyExc_KeyError,
  /** @export */
  wasthon_get_PyExc_LookupError: _wasthon_get_PyExc_LookupError,
  /** @export */
  wasthon_get_PyExc_MemoryError: _wasthon_get_PyExc_MemoryError,
  /** @export */
  wasthon_get_PyExc_NotImplementedError: _wasthon_get_PyExc_NotImplementedError,
  /** @export */
  wasthon_get_PyExc_OSError: _wasthon_get_PyExc_OSError,
  /** @export */
  wasthon_get_PyExc_OverflowError: _wasthon_get_PyExc_OverflowError,
  /** @export */
  wasthon_get_PyExc_RecursionError: _wasthon_get_PyExc_RecursionError,
  /** @export */
  wasthon_get_PyExc_RuntimeError: _wasthon_get_PyExc_RuntimeError,
  /** @export */
  wasthon_get_PyExc_StopIteration: _wasthon_get_PyExc_StopIteration,
  /** @export */
  wasthon_get_PyExc_SystemError: _wasthon_get_PyExc_SystemError,
  /** @export */
  wasthon_get_PyExc_TypeError: _wasthon_get_PyExc_TypeError,
  /** @export */
  wasthon_get_PyExc_UnicodeDecodeError: _wasthon_get_PyExc_UnicodeDecodeError,
  /** @export */
  wasthon_get_PyExc_UnicodeEncodeError: _wasthon_get_PyExc_UnicodeEncodeError,
  /** @export */
  wasthon_get_PyExc_UnicodeError: _wasthon_get_PyExc_UnicodeError,
  /** @export */
  wasthon_get_PyExc_ValueError: _wasthon_get_PyExc_ValueError,
  /** @export */
  wasthon_get_PyExc_Warning: _wasthon_get_PyExc_Warning,
  /** @export */
  wasthon_get_PyExc_ZeroDivisionError: _wasthon_get_PyExc_ZeroDivisionError,
  /** @export */
  wasthon_get_Py_Ellipsis: _wasthon_get_Py_Ellipsis,
  /** @export */
  wasthon_get_Py_False: _wasthon_get_Py_False,
  /** @export */
  wasthon_get_Py_None: _wasthon_get_Py_None,
  /** @export */
  wasthon_get_Py_NotImplemented: _wasthon_get_Py_NotImplemented,
  /** @export */
  wasthon_get_Py_True: _wasthon_get_Py_True,
  /** @export */
  wasthon_get_buffer_data: _wasthon_get_buffer_data,
  /** @export */
  wasthon_get_type_of: _wasthon_get_type_of,
  /** @export */
  wasthon_isinstance_of_builtin: _wasthon_isinstance_of_builtin,
  /** @export */
  wasthon_list_items: _wasthon_list_items,
  /** @export */
  wasthon_long_bit_length: _wasthon_long_bit_length,
  /** @export */
  wasthon_long_nb_floor_divide: _wasthon_long_nb_floor_divide,
  /** @export */
  wasthon_long_nb_multiply: _wasthon_long_nb_multiply,
  /** @export */
  wasthon_long_nb_power: _wasthon_long_nb_power,
  /** @export */
  wasthon_module_get_state: _wasthon_module_get_state,
  /** @export */
  wasthon_object_check_buffer: _wasthon_object_check_buffer,
  /** @export */
  wasthon_object_gc_new: _wasthon_object_gc_new,
  /** @export */
  wasthon_object_gc_new_var: _wasthon_object_gc_new_var,
  /** @export */
  wasthon_type_get_module: _wasthon_type_get_module,
  /** @export */
  wasthon_unicode_isalnum: _wasthon_unicode_isalnum,
  /** @export */
  wasthon_unicode_isdecimal: _wasthon_unicode_isdecimal,
  /** @export */
  wasthon_unicode_islinebreak: _wasthon_unicode_islinebreak,
  /** @export */
  wasthon_unicode_isspace: _wasthon_unicode_isspace,
  /** @export */
  wasthon_unicode_tolower: _wasthon_unicode_tolower,
  /** @export */
  wasthon_unicode_toupper: _wasthon_unicode_toupper,
  /** @export */
  wasthon_unpack_keywords: _wasthon_unpack_keywords
};


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

function run() {

  preRun();

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    Module['calledRun'] = true;

    if (ABORT) return;

    initRuntime();

    readyPromiseResolve?.(Module);
    Module['onRuntimeInitialized']?.();

    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(() => {
      setTimeout(() => Module['setStatus'](''), 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
}

var wasmExports;

// In modularize mode the generated code is within a factory function so we
// can use await here (since it's not top-level-await).
wasmExports = await (createWasm());

run();

// end include: postamble.js

// include: postamble_modularize.js
// In MODULARIZE mode we wrap the generated code in a factory function
// and return either the Module itself, or a promise of the module.
//
// We assign to the `moduleRtn` global here and configure closure to see
// this as an extern so it won't get minified.

if (runtimeInitialized)  {
  moduleRtn = Module;
} else {
  // Set up the promise that indicates the Module is initialized
  moduleRtn = new Promise((resolve, reject) => {
    readyPromiseResolve = resolve;
    readyPromiseReject = reject;
  });
}

// end include: postamble_modularize.js



  return moduleRtn;
}

// Export using a UMD style export, or ES6 exports if selected
export default _sre_init;


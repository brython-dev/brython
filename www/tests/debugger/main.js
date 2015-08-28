(function(win) {
    var Debugger = win.Brython_Debugger = {
        start_debugger: startDebugger,
        stop_debugger: stopDebugger,
        step_debugger: stepDebugger,
        step_back_debugger: stepBackRecording,
        can_step: canStep,
        set_step: setStep,
        set_editor: setEditor,
        is_debugging: isDebugging,
        is_executing: isExecuting,
        is_last_step: isLastStep,
        is_first_step: isFirstStep,
        get_current_step: getStep,
        get_current_frame: getCurrentFrame,
        get_recorded_frames: getRecordedFrames,
        on_debugging_started: setDebugStartedCallback,
        on_debugging_end: setDebugEndedCallback,
        on_step_update: setStepUpdateCallback,
        on_last_step: setStepUpdateCallback,
    };
    var LINE_RGX = /^([ ]*);\$locals\.\$line_info=\"(\d+),(.+)\";/m;
    var WHILE_RGX = /^( *)while/m;
    var FUNC_RGX = /^( *)\$locals.*\[\"(.+)\"\]=\(function\(\){/m;
    var $B = win.__BRYTHON__;
    var _b_ = $B.builtins;
    var traceWord = '__setTrace';
    win[traceWord] = setTrace;
    var editor;
    var debugging = false; // flag indecting debugger was started

    var linePause = true; // used inorder to stop interpreter on line
    var myInterpreter = null;

    var isRecorded = false;
    var recordedFrames = [];
    var recordedOut = [];
    var recordedErr = [];
    var currentStep = 0;
    var noop = function() {};

    var stepUpdate = noop;
    var debugStarted = noop;
    var debugEnded = noop;
    var debugLastStep = noop;

    function setDebugStartedCallback(cb) {
        debugStarted = cb;
    }

    function setDebugEndedCallback(cb) {
        debugEnded = cb;
    }

    function setStepUpdateCallback(cb) {
        stepUpdate = cb;
    }

    function lastStepCallback(cb) {
        debugLastStep = cb;
    }

    function isDebugging() {
        return debugging;
    }

    function isExecuting() {
        return debugging && !linePause;
    }

    function setEditor(ed) {
        editor = ed;
    }

    function getEditor() {
        return editor;
    }

    function getStep() {
        return currentStep;
    }

    function getRecordedFrames() {
        return recordedFrames;
    }

    function getLastRecordedFrame() {
        return recordedFrames[recordedFrames.length - 1];
    }

    function getCurrentFrame() {
        return currentFrame;
    }

    /**
     * check if a step can be made to this position
     * @param {Number} n The place to seek
     */
    function canStep(n) {
        return n < recordedFrames.length && n >= 0;
    }
    /**
     * Move to step n in recordedFrames
     * @param {Number} n The place to seek
     */
    function setStep(n) {
        if (!canStep(n)) {
            // throw new Error("You stepped out of bounds")
            return;
        }
        if (isLastStep()) {
            fireLastStepEvent();
        }
        currentStep = n;
        updateStep();
    }

    /**
     * Is this last step
     * @return {Boolean} [description]
     */
    function isLastStep() {
        return currentStep === recordedFrames.length - 1;
    }
    /**
     * Is this first step
     * @return {Boolean} [description]
     */
    function isFirstStep() {
        return currentStep === 0;
    }

    /**
     * reset all the way back to first step in recordedFrames
     * @return {[type]} [description]
     */
    function resetStep() {
        setStep(0);
    }

    /**
     * Fire event after debugger has been intialized and bebug mode started
     * @return {[type]} [description]
     */
    function debuggingStarted() {
        debugging = true;
        linePause = false;
        debugStarted();
    }

    /**
     * Set currntFrame to the one corresponding to the current step
     * Fire event when currentStep changes
     * In live mode currentStep is useually the last
     * @return {[type]} [description]
     */
    function updateStep() {
        currentFrame = recordedFrames[currentStep];
        stepUpdate(currentFrame);
    }


    /**
     * Fire when exiting debug mode
     * @return {[type]} [description]
     */
    function stopDebugger() {
        debugging = false;
        resetOutErr();
        debugEnded();
    }

    /**
     * Fire when exiting debug mode
     * @return {[type]} [description]
     */
    function fireLastStepEvent() {
        lastStepCallback();
    }

    /**
     * Trace Function constructs a list of states of the program after each trace call
     * @param {[type]} obj [description]
     */
    function setTrace(obj) {
        // console.log(obj);
        // replace by event
        switch (obj.event) {
            case 'line':
                if (!isRecorded) linePause = true;
                obj.printerr = obj.stderr = obj.stdout = obj.printout = "";
                if (getLastRecordedFrame()) {
                    obj.stdout = getLastRecordedFrame().stdout;
                    obj.stderr = getLastRecordedFrame().stderr;
                    obj.locals = obj.frame[1];
                    obj.globals = obj.frame[3];
                    obj.var_names = Object.keys(obj.locals).filter(function(key) {
                        return !/^(__|_|\$)/.test(key);
                    });

                    if (getLastRecordedFrame().type === 'endwhile' && getLastRecordedFrame().was_modified) {
                        getLastRecordedFrame().next_line_no = obj.line_no;
                    }
                }
                if (obj.type === 'endwhile') {
                    getLastRecordedFrame().next_line_no = obj.line_no;
                }
                if (obj.type === 'afterwhile' || obj.type === 'eof') {
                    getLastRecordedFrame().next_line_no = obj.line_no;
                    getLastRecordedFrame().was_modified = true;
                    break;
                }
                recordedFrames.push(obj);
                break;
            case 'stdout':
                // console.log(obj.data);
                recordedOut.push(obj);
                getLastRecordedFrame().printout = obj.data;
                getLastRecordedFrame().stdout += obj.data;
                break;
            case 'stderr':
                console.error(obj.data);
                recordedErr.push(obj);
                getLastRecordedFrame().printerr = obj.data;
                getLastRecordedFrame().stderr += obj.data;
                break;
        }
    }

    function resetDebugger() {
        isRecorded = false;
        recordedFrames = [];
        recordedOut = [];
        recordedErr = [];
        currentStep = 0;
    }

    /**
     * Steps through the debugger depending on the debugger mode
     */
    function stepDebugger() {
        if (isRecorded) {
            stepRecording();
        } else {
            stepInterpreter();
        }
    }

    /**
     * In recorded debugging mode this will move one step forward from the current frame
     * this triggers an debugger.update event for who ever is registered by calling setStep
     * @return {[type]} [description]
     */
    function stepRecording() {
        var step = getStep();
        setStep(step + 1);
    }

    /**
     * In recorded debugging mode this will move one step backeards from the current frame
     * this triggers an debugger.update event for who ever is registered by calling setStep
     * @return {[type]} [description]
     */
    function stepBackRecording() {
        var step = getStep();
        setStep(step - 1);
    }


    /**
     * In recorded debugging mode this will move one step forward from the current frame
     * this triggers an debugger.update event for who ever is registered by calling setStep
     * @return {[type]} [description]
     */
    function errorrWhileDebugging(err) {
        resetOutErr();
        resetDebugger();
    }
    /**
     * step through the interpreter using JS-Interpreter with acorn until linePause is true
     * linePause is set to true when the interpreter runs the tracefunction and a line event is triggered
     */
    function stepInterpreter() {
        var ok = false;
        try {
            ok = myInterpreter.step();
        } catch (e) {
            errorrWhileDebugging(e);
            console.error(e);
        } finally {
            if (!ok) {
                // Program complete, no more code to execute.
                stopDebugger();
                return;
            }
        }
        if (linePause) {
            // A block has been highlighted.  Pause execution here.
            linePause = false;
            currentStep = getRecordedFrames().length - 1;
        } else {
            // Keep executing until a highlight statement is reached.
            stepDebugger();
        }
    }

    /**
     * Initialises the debugger, setup code for debugging, and either run interpreter or record run
     * @param  {String} src optional code to be passed, if not passed will be read from the set editor
     * @param  {Boolean} whether to run recording then replay or step
     */
    function startDebugger(src, record) {
        var code = src || getEditor().getValue();
        resetDebugger();

        isRecorded = record;

        var obj = parseCode(code);

        setOutErr();

        if (record) {
            recordedFrames = [];
            var res = $run(obj);
            resetOutErr();
        } else {
            myInterpreter = interpretCode(obj);
        }
        debuggingStarted();
    }

    /**
     * Parsed python code converts it to brython then injects trac function calls inside to record debugging events
     * @param  {[type]} src [description]
     * @return {[type]}     [description]
     */
    function parseCode(src) {
        // Generate JavaScript code and parse it.
        var obj = pythonToBrythonJS(src);
        obj.code = injectTrace(obj.code);
        return obj;
    }

    /**
     * Convert python code to Brython JS
     * @param  {[type]} src [description]
     * @return {[type]}     [description]
     */
    function pythonToBrythonJS(src) {
        var obj = {
            code: ""
        };
        // Initialize global and local module scope
        var current_frame = $B.frames_stack[$B.frames_stack.length - 1];
        if (current_frame === undefined) {
            alert('current frame undef pour ' + src.substr(0, 30));
        }
        var current_locals_id = current_frame[0];
        var current_locals_name = current_locals_id.replace(/\./, '_');
        var current_globals_id = current_frame[2];
        var current_globals_name = current_globals_id.replace(/\./, '_');
        var module_name;
        _globals = _b_.dict([]);
        module_name = _b_.dict.$dict.get(_globals, '__name__', 'exec_' + $B.UUID());
        $B.$py_module_path[module_name] = $B.$py_module_path[current_globals_id];
        local_name = module_name;

        obj.module_name = module_name;
        if (!$B.async_enabled) obj[module_name] = {};

        // Add names/values defined in _globals
        var items = _b_.dict.$dict.items(_globals);
        var item;
        while (1) {
            try {
                item = next(items);
                obj[module_name][item[0]] = item[1];
            } catch (err) {
                break;
            }
        }

        // parse python into javascript
        try {
            var root = $B.py2js(src, module_name, [module_name], local_name);
            obj.code = root.to_js();
            if ($B.async_enabled) obj.code = $B.execution_object.source_conversion(obj.code);
            //js=js.replace("@@", "\'", 'g')
        } catch (err) {
            errorrWhileDebugging(err);
            $B.leave_frame();
            $B.leave_frame();
            if (err.$py_error === undefined) {
                throw $B.exception(err);
            }
            throw err;
        }
        return obj;
    }

    /**
     * Inject Trace Function into Brython code
     * The trace function is called every time a line, output
     * shoudl support function call, return later
     * @param  {String} code Brython Code to inject trace in
     * @return {String} trace injected code as string
     */
    function injectTrace(code) {
        // console.log('brython:\n\n' + code);
        var end = code.length;
        var newCode = "";
        var whileLine;
        var codearr = code.split('\n');
        codearr.splice(9, 0, traceWord + "({event:'line', type:'start', frame:$B.last($B.frames_stack), line_no: " + 0 + ", next_line_no: " + 1 + "});")
        code = codearr.join('\n');
        var line = getNextLine(code);
        var lastLineNo = 1;
        var largestLine = 1;
        var index = line.index;
        do {

            newCode += code.substr(0, index);
            newCode += line.indentString + traceWord + "({event:'line', frame:$B.last($B.frames_stack), line_no: " + line.line_no + ", next_line_no: " + (+line.line_no + 1) + "});\n";
            newCode += line.string;
            index += line.string.length;
            code = code.substr(index);

            lastLineNo = +line.line_no;
            largestLine = largestLine > lastLineNo ? largestLine : lastLineNo;
            line = getNextLine(code);
            if (line === null) {
                break;
            }
            whileLine = getNextWhile(code);
            if (whileLine && whileLine.index < line.index) { // then I'm about to enter a while loop
                code = injectWhileEndTrace(code, whileLine, lastLineNo); // add a trace at the end of the while block
            }
            index = line.index;
        } while (~index);
        var codesplit = code.split(/^\;\$B\.leave_frame\(/m)
        newCode += codesplit[0] + traceWord + "({event:'line', type:'eof', frame:$B.last($B.frames_stack), line_no: " + (++largestLine) + ", next_line_no: " + (largestLine) + "});\n";
        newCode += ';$B.leave_frame(' + codesplit[1];

        console.log('debugger:\n\n' + newCode);
        return newCode;

        function getNextLine(code) {
            var match = LINE_RGX.exec(code);
            if (!match) return null;
            return {
                indent: match[1].length,
                indentString: match[1],
                line_no: match[2],
                string: match[0],
                module: match[3],
                match: match,
                index: match.index
            };
        }

        function getNextWhile(code) {
            var match = WHILE_RGX.exec(code);
            if (!match) return null;
            return {
                indentString: match[1],
                match: match,
                index: match.index
            };
        }

        function getNextFunction(code) {
            var match = FUNC_RGX.exec(code);
            if (!match) return null;
            return {
                indent: match[1].length,
                name: match[2],
                match: match,
                index: match.index
            };
        }

        function injectWhileEndTrace(code, whileLine, lastLine) {
            var indent = whileLine.indentString + '}';
            var newCode = "";
            var re = new RegExp('^' + indent, 'm');
            var res = re.exec(code);
            newCode += code.substr(0, res.index);
            newCode += whileLine.indentString + traceWord + "({event:'line', type:'endwhile', frame:$B.last($B.frames_stack), line_no: " + lastLine + ", next_line_no: " + (lastLine + 1) + "});\n";
            newCode += indent;
            newCode += traceWord + "({event:'line', type:'afterwhile', frame:$B.last($B.frames_stack), line_no: " + (lastLine + 1) + ", next_line_no: " + (lastLine + 1) + "});\n";
            newCode += code.substr(res.index + indent.length);
            return newCode;
        }
    }

    /**
     * Run traced code, used in record mode by hidding 
     * @param  {[type]} obj object contianing code and module scope
     * @return {[type]} result of running code as if evaluated
     */
    function $run(obj) {
        var leave = false;
        var js = obj.code;
        // Initialise locals object
        try {
            eval('var $locals_' + obj.module_name + '= obj["' + obj.module_name + '"]');
            var getattr = _b_.getattr;
            var setattr = _b_.setattr;
            var res = eval(js);

            if (res === undefined) return _b_.None;
            return res;
        } catch (err) {
            errorrWhileDebugging(err);
            $B.leave_frame();
            $B.leave_frame();
            if (err.$py_error === undefined) {
                throw $B.exception(err);
            }
            throw err;
        } finally {
            if (leave) {
                $B.leave_frame();
            }
        }
    }

    /**
     * Interpret initialize interpreter when running debugger in live mode (not recorded)
     * @param  {Object} obj object containing trace injected code and module scope
     * @return {Interpreter} instence of Interpreter
     */
    function interpretCode(obj) {
        initAPI = defineAPIScope(obj);
        return new Interpreter(obj.code, initAPI);
    }


    /**
     * functions that returns the Interpreter scope function
     * @param  {Object} obj containing module scope
     * @return {[type]} Interpreter scope API function
     */
    function initAPI(obj) {

        return function(interpreter, scope) {
            // variables

            interpreter.setProperty(scope, '__BRYTHON__', __BRYTHON__, true);
            interpreter.setProperty(scope, '$locals_' + obj.module_name, obj[obj.module_name], true);
            interpreter.setProperty(scope, '_b_', _b_, true);
            interpreter.setProperty(scope, 'getattr', _b_.getattr, true);

            // wrapp functions before injection
            var wrapper;
            wrapper = function(obj) {
                return interpreter.createPrimitive(setTrace(obj));
            };
            interpreter.setProperty(scope, traceWord,
                interpreter.createNativeFunction(wrapper));

            wrapper = function(text) {
                text = text ? text.toString() : '';
                return interpreter.createPrimitive(alert(text));
            };
            interpreter.setProperty(scope, 'alert',
                interpreter.createNativeFunction(wrapper));

            wrapper = function(text) {
                text = text ? text.toString() : '';
                return interpreter.createPrimitive(prompt(text));
            };
            interpreter.setProperty(scope, 'prompt',
                interpreter.createNativeFunction(wrapper));

        };
    }

    var realStdOut = $B.stdout;
    var realStdErr = $B.stderr;

    function createOut(cname, std, next) {
        var cout = (function() {
            var obj = {};
            var $locals = obj;
            $locals["write"] = (function() {
                return function(data) {
                    var frame = getLastRecordedFrame();
                    setTrace({
                        event: std,
                        data: data,
                        frame: frame.frame,
                        line_no: frame.line_no
                    });
                    if (next) {
                        next.write(data);
                    }
                    return _b_.None;
                };
            })();
            $locals["write"].$infos = {
                __name__: cname + ".write",
                __defaults__: [],
                __module__: "__main__",
                __doc__: _b_.None,
                __code__: {
                    __class__: $B.$CodeDict,
                    co_argcount: 2,
                    co_filename: '',
                    co_firstlineno: 5,
                    co_flags: 67,
                    co_kwonlyargcount: 0,
                    co_name: "write",
                    co_nlocals: 2,
                    co_varnames: ["self", "data"]
                }
            };
            return obj;
        })();
        cout = $B.$class_constructor(cname, cout, _b_.tuple([]), [], []);
        cout.$dict.__doc__ = _b_.None;
        cout.$dict.__module__ = "__main__";
        return cout;
    }

    var outerr = {
        recordOut: createOut('dOut', 'stdout'),
        recordErr: createOut('dErr', 'stderr'),
        spyOut: createOut('dOut', 'stdout', realStdOut),
        spyErr: createOut('dErr', 'stderr', realStdErr)
    };


    /**
     * setStdout to debugger stdout capturing output stream
     */
    function setOutErr() {
        realStdOut = $B.stdout;
        realStdErr = $B.stderr;
        var type = isRecorded ? 'record' : 'spy';
        $B.stdout = outerr[type + 'Out'];
        $B.stderr = outerr[type + 'Err'];
    }
    /**
     * resetting back stdout to original stream before debugger ran
     */
    function resetOutErr() {
        $B.stdout = realStdOut;
        $B.stderr = realStdErr;
    }
})(window);

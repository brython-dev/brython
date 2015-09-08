(function(win) {
    var Debugger = win.Brython_Debugger = {
        run_no_debugger: runNoTrace,
        start_debugger: startDebugger,
        stop_debugger: stopDebugger,
        step_debugger: stepDebugger,
        step_back_debugger: stepBackRecording,
        can_step: canStep,
        set_step: setStep,
        set_trace: setTrace,
        set_trace_call: setTraceCall,
        set_step_limit: setStepLimit,
        is_debugging: isDebugging,
        is_recorded: wasRecorded,
        is_executing: isExecuting,
        is_last_step: isLastStep,
        is_first_step: isFirstStep,
        get_current_step: getStep,
        get_current_state: getCurrentState,
        get_recorded_states: getRecordedStates,
        on_debugging_started: eventCallbackSetter('debugStarted'),
        on_debugging_end: eventCallbackSetter('debugEnded'),
        on_debugging_error: eventCallbackSetter('debugError'),
        on_step_update: eventCallbackSetter('stepUpdate'),
    };
    var $B = win.__BRYTHON__;
    var _b_ = $B.builtins;
    var traceCall = 'Brython_Debugger.set_trace';
    var debugging = false; // flag indecting debugger was started
    var stepLimit = 10000; // Solving the halting problem by limiting the number of steps to run

    var linePause = true; // used inorder to stop interpreter on line
    var myInterpreter = null;

    var isRecorded = false;
    var weStopDebugOnRuntimeError = false;
    var parserReturn = null; // object returned when done parsing
    var recordedStates = [];
    var recordedInputs = {};
    var recordedOut = [];
    var recordedErr = [];
    var currentStep = 0;
    var noop = function() {};

    var events = ['stepUpdate', 'debugStarted', 'debugError', 'debugEnded'];
    var events_cb = {};
    events.forEach(function(key) {
        events_cb[key] = noop;
    });

    // used in trace injection
    var LINE_RGX = /^( *);\$locals\.\$line_info=\"(\d+),(.+)\";/m;
    var WHILE_RGX = /^( *)while/m;
    var FUNC_RGX = /^( *)\$locals.*\[\"(.+)\"\]=\(function\(\){/m;
    var INPUT_RGX = /getattr\(\$B.builtins\[\"input\"\],\"__call__\"\)\(((?:\"(.)*\")|\d*)\)/g; // only works for string params
    var HALT = "HALT";

    function eventCallbackSetter(key) {
        return function(cb) {
            events_cb[key] = cb;
        };
    }

    /**
     * Change the name of the traceCall Function that is injected in the brython generated javascript
     * The default is Brython_Debugger.set_trace
     * To change it you would still need to call this function
     * So be careful and generally you don't need to
     */
    function setTraceCall(name) {
        traceCall = name;
    }

    /**
     * is the debugger in record mode, exposed as is_recorded
     * @return {Boolean} whether the is recorded flag is on
     */
    function wasRecorded() {
        return isRecorded;
    }

    function isDebugging() {
        return debugging;
    }

    function isExecuting() {
        return debugging && !linePause;
    }

    function getStep() {
        return currentStep;
    }

    function getRecordedStates() {
        return recordedStates;
    }

    function getLastRecordedState() {
        return recordedStates[recordedStates.length - 1];
    }

    function getCurrentState() {
        return currentState;
    }

    /**
     * Set the limit of the number of steps that can be executed before thrwing an error
     * @param {Numebr} n limit default 100000
     */
    function setStepLimit(n) {
        stepLimit = (n===undefined)?10000:n;
    }

    /**
     * check if a step can be made to this position
     * @param {Number} n The place to seek
     */
    function canStep(n) {
        return n < recordedStates.length && n >= 0;
    }
    /**
     * return state at position n
     * @param {Number} n The place to seek
     */
    function getState(n) {
        return canStep(n) ? getRecordedStates()[n] : null;
    }
    /**
     * Move to step n in recordedStates
     * @param {Number} n The place to seek
     */
    function setStep(n) {
        var state = getState(n);
        if (!state) {
            // throw new Error("You stepped out of bounds")
            return;
        }
        if (state.type === 'input') {
            recordInput(state);
            rerunCode();
            n -= 1;
        }
        currentStep = n;
        updateStep();
    }

    function recordInput(state) {
        var inp = _b_.input(state.arg);
        recordedInputs[state.id] = inp;
        return recordedInputs[state.id];
    }

    /**
     * Is this last step
     * @return {Boolean} [description]
     */
    function isLastStep() {
        return currentStep === recordedStates.length - 1;
    }
    /**
     * Is this first step
     * @return {Boolean} [description]
     */
    function isFirstStep() {
        return currentStep === 0;
    }

    /**
     * Fire event after debugger has been intialized and bebug mode started
     */
    function debuggingStarted() {
        debugging = true;
        linePause = false;
        events_cb.debugStarted(Debugger);
    }

    /**
     * Set currntFrame to the one corresponding to the current step
     * Fire event when currentStep changes
     * In live mode currentStep is useually the last
     */
    function updateStep() {
        currentState = recordedStates[currentStep];
        events_cb.stepUpdate(currentState);
    }


    /**
     * Fire when exiting debug mode
     */
    function stopDebugger() {
        debugging = false;
        resetOutErr();
        events_cb.debugEnded(Debugger);
    }

    /**
     * Fire when an error occurrs while parsing or during runtime
     */
    function errorWhileDebugging(err) {
        var trace = {
            event: 'line',
            type: 'runtime_error',
            data: _b_.getattr(err, 'info') + '\n' + _b_.getattr(err, '__name__') + ": " +err.$message + '\n', 
            stack: err.$stack,
            message: err.$message,
            name: _b_.getattr(err, '__name__'),
            frame: $B.last(err.$stack),
            err: err,
            step: getRecordedStates().length -1,
            line_no: +($B.last(err.$stack)[1].$line_info.split(',')[0]),
            next_line_no: +($B.last(err.$stack)[1].$line_info.split(',')[0]),
            module_name: +($B.last(err.$stack)[1].$line_info.split(',')[1])
        };
        if (getRecordedStates().length > 0) {
            if(getRecordedStates().length>=stepLimit) {
                trace.type = 'infinit_loop';
                recordedStates.push(trace);
            } else {
                setTrace(trace);   
            }
        } else {
            trace.type = 'syntax_error';
        }
        events_cb.debugError(trace, Debugger);
    }

    /**
     * Trace Function constructs a list of states of the program after each trace call
     * @return {String} Value of input when setTrace is used for input
     */
    function setTrace(state) {
        // console.log(state);
        // replace by event

        if (recordedStates.length > stepLimit) {
            throw $B.exception("You have exceeded the amount of steps allowed by this debugger, you probably have an infinit loop or you're running a long program");
            // you can change the limit by using the setStepLimit method variable form the default
            // The debugger is not meant to debug long pieces of code so that should be taken into consideration
        }

        switch (state.event) {
            case 'line':
                return setLineTrace(state);
            case 'stdout':
                return setdStdOutTrace(state);
            case 'stderr':
                return setdStdErrTrace(state);
            case 'input':
                // state = {event, arg, id}
                return setInputTrace(state);
            default:
                // custom step to be handled by user
                recordedStates.push(state);
        }
    }

    /**
     * Inserts a line state trace in recorded states
     * makes sure that trace builds on old trace stdout and stderr
     * Update previous state next_line_no with the current state line_no for editor using debugger to highlight
     * Some states are disposable and are only inserted to insure proper next_line_no update and are thuse disposed of later
     */
    function setLineTrace(state) {
        if (!isRecorded) {
            linePause = true;
        }
        state.printerr = state.stderr = state.stdout = state.printout = "";
        if (getLastRecordedState()) {
            state.stdout = getLastRecordedState().stdout;
            state.stderr = getLastRecordedState().stderr;
            state.locals = state.frame[1];
            state.globals = state.frame[3];
            state.var_names = Object.keys(state.locals).filter(function(key) {
                return !/^(__|_|\$)/.test(key);
            });

            getLastRecordedState().next_line_no = state.line_no;
        }
        if (isDisposableState(state)) {
            return;
        }
        if (state.type === 'runtime_error') {
           setErrorState(state);
        }
        recordedStates.push(state);
    }

    function setErrorState(state) {
        recordedStates.pop();
        state.stdout += state.data;
    }

    function setdStdOutTrace(state) {
        recordedOut.push(state);
        getLastRecordedState().printout = state.data;
        getLastRecordedState().stdout += state.data;
    }

    function setdStdErrTrace(state) {
        console.error(state.data);
        recordedErr.push(state);
        if (!state.frame) {
            return;
        }
        getLastRecordedState().printerr = state.data;
        getLastRecordedState().stderr += state.data;
    }

    /**
     * Inserts a line of type input into the recordedStates such that during setStep it would prompt user for input
     * If an input trace of the same id was already set then return the value instead without inserting a line trace.
     * @param {Object} state state to record excpected to contina {id: unique idetifier, arg: argument for prompt}
     */
    function setInputTrace(state) {
        state.event = 'line';
        state.type = 'input';
        state.id = state.id + recordedStates.length;
        if (recordedInputs[state.id]!==undefined) {
            return recordedInputs[state.id];
        } else {
            state.line_no = getLastRecordedState().line_no;
            state.frame = getLastRecordedState().frame;

            setTrace(state);
            throw HALT;
        }
    }
    /**
     * These states are only there to update the previouse states of where they should point
     * they are not recorded
     * @param { Object} state state object to
     * @return {Boolean}     [The state is disposable]
     */
    function isDisposableState(state) {
        var disposable = ['afterwhile', 'eof'];
        return disposable[state.type]!==undefined;
    }

    function resetDebugger(rerun) {
        recordedStates = [];
        recordedOut = [];
        recordedErr = [];
        if (!rerun) {
            isRecorded = false;
            currentStep = 0;
            recordedInputs = {};
            parserReturn = null;
        }
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
     */
    function stepRecording() {
        var step = getStep();
        setStep(step + 1);
    }

    /**
     * In recorded debugging mode this will move one step backeards from the current frame
     * this triggers an debugger.update event for who ever is registered by calling setStep
     */
    function stepBackRecording() {
        var step = getStep();
        setStep(step - 1);
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
            errorWhileDebugging(e);
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
            currentStep = getRecordedStates().length - 1;
        } else {
            // Keep executing until a highlight statement is reached.
            stepDebugger();
        }
    }

    /**
     * Rerun already parsed brython js code
     */
    function rerunCode() {
        resetDebugger(true);
        try {
            setOutErr(true);
            runTrace(parserReturn);
        } catch (err) {
            handleDebugError(err);
        } finally {
            resetOutErr();
        }
    }

    /**
     * Initialises the debugger, setup code for debugging, and either run interpreter or record run
     * @param  {String} src optional code to be passed, if not passed will be read from the set editor
     * @param  {Boolean} whether to run recording then replay or step
     */
    function startDebugger(src, record) {
        var code = src || getEditor().getValue() || "";
        resetDebugger();

        isRecorded = record === undefined ? true : record;

        setOutErr(record);
        try {
            var obj = parserReturn = parseCode(code);

            if (record) {
                runTrace(obj);
            } else {
                myInterpreter = interpretCode(obj);
            }
        } catch (err) {
            handleDebugError(err);
        } finally {
            resetOutErr();
        }
        debuggingStarted();
    }

    function handleDebugError(err) {
        if (!err.$py_error) {
            throw err;
        }
        if (!wasHalted(err)) {
            errorWhileDebugging(err);
        }
        $B.leave_frame();
        $B.leave_frame();
        if (!wasHalted(err) && weStopDebugOnRuntimeError) {
            throw err;
        }
    }

    function wasHalted(err) {
        return err.$message === ('<' + HALT + '>');
    }

    /**
     * Parsed python code converts it to brython then injects trac function calls inside to record debugging events
     * @param { String} src python source to parse
     */
    function parseCode(src) {
        // Generate JavaScript code and parse it.
        var obj = pythonToBrythonJS(src);
        obj.code = injectTrace(obj.code);
        return obj;
    }

    /**
     * Convert python code to Brython JS
     * @param { String} src python source to parse
     */
    function pythonToBrythonJS(src) {
        var obj = {
            code: ""
        };
        // Initialize global and local module scope
        var current_frame = $B.frames_stack[$B.frames_stack.length - 1];
        var module_name;

        if (current_frame === undefined) {
            module_name = '__main__';
            $B.$py_module_path[module_name] = window.location.href;
            local_name = '__builtins__';
        } else {
            var current_locals_id = current_frame[0];
            var current_locals_name = current_locals_id.replace(/\./, '_');
            var current_globals_id = current_frame[2] || current_locals_id;
            var current_globals_name = current_globals_id.replace(/\./, '_');
            var _globals = _b_.dict([]);
            module_name = _b_.dict.$dict.get(_globals, '__name__', 'exec_' + $B.UUID());
            $B.$py_module_path[module_name] = $B.$py_module_path[current_globals_id];
            local_name = module_name;
        }

        obj.module_name = module_name;
        if (!$B.async_enabled) obj[module_name] = {};


        // parse python into javascript
        try {
            var root = $B.py2js(src, module_name, [module_name], local_name);
            obj.code = root.to_js();
            if ($B.async_enabled) obj.code = $B.execution_object.source_conversion(obj.code);
            //js=js.replace("@@", "\'", 'g')
        } catch (err) {
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
        codearr.splice(9, 0, traceCall + "({event:'line', type:'start', frame:$B.last($B.frames_stack), line_no: " + 0 + ", next_line_no: " + 1 + "});")
        code = codearr.join('\n');
        var line = getNextLine(code);
        if (line === null) { // in case empty code
            return code;
        }
        var lastLineNo = 1;
        var largestLine = 1;
        var index = line.index;
        do {

            newCode += code.substr(0, index);
            newCode += line.indentString + traceCall + "({event:'line', frame:$B.last($B.frames_stack), line_no: " + line.line_no + ", next_line_no: " + (+line.line_no + 1) + "});\n";
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
        } while (true);
        var codesplit = code.split(/^\;\$B\.leave_frame\(/m);
        newCode += codesplit[0] + traceCall + "({event:'line', type:'eof', frame:$B.last($B.frames_stack), line_no: " + (++largestLine) + ", next_line_no: " + (largestLine) + "});\n";
        newCode += ';$B.leave_frame(' + codesplit[1];

        //  inject input trace if applicable
        var re = new RegExp(INPUT_RGX.source, 'g');
        var inputLine = getNextInput(newCode, re);
        while (inputLine !== null) {
            code = newCode.substr(0, inputLine.index);
            var inJect = traceCall + "({event:'input', arg:" + inputLine.param + ", id:'" + inputLine.index + "'})";
            code += inJect;
            index = inputLine.index + inputLine.string.length;
            code += newCode.substr(index);
            newCode = code;
            inputLine = getNextInput(newCode, re);
        }

        // console.log('debugger:\n\n' + code);

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
                indent: match[1].length,
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
            var re = new RegExp('^ {' + Math.max(whileLine.indent - 4, 0) + ',' + whileLine.indent + '}\}', 'm');
            var res = re.exec(code);
            newCode += code.substr(0, res.index);
            newCode += whileLine.indentString + traceCall + "({event:'line', type:'endwhile', frame:$B.last($B.frames_stack), line_no: " + lastLine + ", next_line_no: " + (lastLine + 1) + "});\n";
            newCode += indent;
            newCode += traceCall + "({event:'line', type:'afterwhile', frame:$B.last($B.frames_stack), line_no: " + (lastLine + 1) + ", next_line_no: " + (lastLine + 1) + "});\n";
            newCode += code.substr(res.index + indent.length);
            return newCode;
        }

        function getNextInput(code, re) {
            var match = re.exec(code);
            if (!match) return null;
            return {
                param: match[1],
                string: match[0],
                index: match.index
            };
        }
    }

    /**
     * Run traced code, used in record mode by hidding 
     * @param  {Object} obj object contianing code and module scope
     * @return {Object} result of running code as if evaluated
     */
    function runTrace(obj) {
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
            if (err.$py_error === undefined) {
                throw $B.exception(err);
            }
            throw err;
        }
    }

    /**
     * Run Code without trace
     * @param  {[type]} code [description]
     * @return {[type]}      [description]
     */
    function runNoTrace (code) {
        var module_name = '__main__';
        $B.$py_module_path[module_name] = window.location.href;
        try {
            var root = $B.py2js(code, module_name, module_name, '__builtins__');
            
            var js = root.to_js();
            if ($B.debug > 1) {
                console.log(js);
            }

            var None = _b_.None;
            var getattr = _b_.getattr;
            var setattr = _b_.setattr;

            if ($B.async_enabled) {
                js = $B.execution_object.source_conversion(js);

                //console.log(js)
                eval(js);
            } else {
                // Run resulting Javascript
                eval(js);
            }
        } catch (exc) {
            $B.leave_frame();
            $B.leave_frame();
            if (exc.$py_error) {
                errorWhileDebugging(exc);
            } else {
                throw exc;
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
     */
    function defineAPIScope(obj) {

        return function initAPI(interpreter, scope) {
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
            interpreter.setProperty(scope, traceCall,
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
        var $io = {
            __class__: $B.$type,
            __name__: 'io'
        };
        $io.__mro__ = [$io, _b_.object.$dict];
        return {
            __class__: $io,
            write: function(data) {
                var frame = getLastRecordedState() || {
                    frame: undefined
                };
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
            },
            flush: function() {}
        };
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
    function setOutErr(record) {
        realStdOut = $B.stdout;
        realStdErr = $B.stderr;
        var type = record ? 'record' : 'spy';
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

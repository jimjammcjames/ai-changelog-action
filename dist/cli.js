#!/usr/bin/env node
require('./sourcemap-register.js');/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 236:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getExecOutput = exports.exec = void 0;
const string_decoder_1 = __nccwpck_require__(193);
const tr = __importStar(__nccwpck_require__(665));
/**
 * Exec a command.
 * Output will be streamed to the live console.
 * Returns promise with return code
 *
 * @param     commandLine        command to execute (can include additional args). Must be correctly escaped.
 * @param     args               optional arguments for tool. Escaping is handled by the lib.
 * @param     options            optional exec options.  See ExecOptions
 * @returns   Promise<number>    exit code
 */
function exec(commandLine, args, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const commandArgs = tr.argStringToArray(commandLine);
        if (commandArgs.length === 0) {
            throw new Error(`Parameter 'commandLine' cannot be null or empty.`);
        }
        // Path to tool to execute should be first arg
        const toolPath = commandArgs[0];
        args = commandArgs.slice(1).concat(args || []);
        const runner = new tr.ToolRunner(toolPath, args, options);
        return runner.exec();
    });
}
exports.exec = exec;
/**
 * Exec a command and get the output.
 * Output will be streamed to the live console.
 * Returns promise with the exit code and collected stdout and stderr
 *
 * @param     commandLine           command to execute (can include additional args). Must be correctly escaped.
 * @param     args                  optional arguments for tool. Escaping is handled by the lib.
 * @param     options               optional exec options.  See ExecOptions
 * @returns   Promise<ExecOutput>   exit code, stdout, and stderr
 */
function getExecOutput(commandLine, args, options) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let stdout = '';
        let stderr = '';
        //Using string decoder covers the case where a mult-byte character is split
        const stdoutDecoder = new string_decoder_1.StringDecoder('utf8');
        const stderrDecoder = new string_decoder_1.StringDecoder('utf8');
        const originalStdoutListener = (_a = options === null || options === void 0 ? void 0 : options.listeners) === null || _a === void 0 ? void 0 : _a.stdout;
        const originalStdErrListener = (_b = options === null || options === void 0 ? void 0 : options.listeners) === null || _b === void 0 ? void 0 : _b.stderr;
        const stdErrListener = (data) => {
            stderr += stderrDecoder.write(data);
            if (originalStdErrListener) {
                originalStdErrListener(data);
            }
        };
        const stdOutListener = (data) => {
            stdout += stdoutDecoder.write(data);
            if (originalStdoutListener) {
                originalStdoutListener(data);
            }
        };
        const listeners = Object.assign(Object.assign({}, options === null || options === void 0 ? void 0 : options.listeners), { stdout: stdOutListener, stderr: stdErrListener });
        const exitCode = yield exec(commandLine, args, Object.assign(Object.assign({}, options), { listeners }));
        //flush any remaining characters
        stdout += stdoutDecoder.end();
        stderr += stderrDecoder.end();
        return {
            exitCode,
            stdout,
            stderr
        };
    });
}
exports.getExecOutput = getExecOutput;
//# sourceMappingURL=exec.js.map

/***/ }),

/***/ 665:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.argStringToArray = exports.ToolRunner = void 0;
const os = __importStar(__nccwpck_require__(857));
const events = __importStar(__nccwpck_require__(434));
const child = __importStar(__nccwpck_require__(317));
const path = __importStar(__nccwpck_require__(928));
const io = __importStar(__nccwpck_require__(994));
const ioUtil = __importStar(__nccwpck_require__(207));
const timers_1 = __nccwpck_require__(557);
/* eslint-disable @typescript-eslint/unbound-method */
const IS_WINDOWS = process.platform === 'win32';
/*
 * Class for running command line tools. Handles quoting and arg parsing in a platform agnostic way.
 */
class ToolRunner extends events.EventEmitter {
    constructor(toolPath, args, options) {
        super();
        if (!toolPath) {
            throw new Error("Parameter 'toolPath' cannot be null or empty.");
        }
        this.toolPath = toolPath;
        this.args = args || [];
        this.options = options || {};
    }
    _debug(message) {
        if (this.options.listeners && this.options.listeners.debug) {
            this.options.listeners.debug(message);
        }
    }
    _getCommandString(options, noPrefix) {
        const toolPath = this._getSpawnFileName();
        const args = this._getSpawnArgs(options);
        let cmd = noPrefix ? '' : '[command]'; // omit prefix when piped to a second tool
        if (IS_WINDOWS) {
            // Windows + cmd file
            if (this._isCmdFile()) {
                cmd += toolPath;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows + verbatim
            else if (options.windowsVerbatimArguments) {
                cmd += `"${toolPath}"`;
                for (const a of args) {
                    cmd += ` ${a}`;
                }
            }
            // Windows (regular)
            else {
                cmd += this._windowsQuoteCmdArg(toolPath);
                for (const a of args) {
                    cmd += ` ${this._windowsQuoteCmdArg(a)}`;
                }
            }
        }
        else {
            // OSX/Linux - this can likely be improved with some form of quoting.
            // creating processes on Unix is fundamentally different than Windows.
            // on Unix, execvp() takes an arg array.
            cmd += toolPath;
            for (const a of args) {
                cmd += ` ${a}`;
            }
        }
        return cmd;
    }
    _processLineBuffer(data, strBuffer, onLine) {
        try {
            let s = strBuffer + data.toString();
            let n = s.indexOf(os.EOL);
            while (n > -1) {
                const line = s.substring(0, n);
                onLine(line);
                // the rest of the string ...
                s = s.substring(n + os.EOL.length);
                n = s.indexOf(os.EOL);
            }
            return s;
        }
        catch (err) {
            // streaming lines to console is best effort.  Don't fail a build.
            this._debug(`error processing line. Failed with error ${err}`);
            return '';
        }
    }
    _getSpawnFileName() {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                return process.env['COMSPEC'] || 'cmd.exe';
            }
        }
        return this.toolPath;
    }
    _getSpawnArgs(options) {
        if (IS_WINDOWS) {
            if (this._isCmdFile()) {
                let argline = `/D /S /C "${this._windowsQuoteCmdArg(this.toolPath)}`;
                for (const a of this.args) {
                    argline += ' ';
                    argline += options.windowsVerbatimArguments
                        ? a
                        : this._windowsQuoteCmdArg(a);
                }
                argline += '"';
                return [argline];
            }
        }
        return this.args;
    }
    _endsWith(str, end) {
        return str.endsWith(end);
    }
    _isCmdFile() {
        const upperToolPath = this.toolPath.toUpperCase();
        return (this._endsWith(upperToolPath, '.CMD') ||
            this._endsWith(upperToolPath, '.BAT'));
    }
    _windowsQuoteCmdArg(arg) {
        // for .exe, apply the normal quoting rules that libuv applies
        if (!this._isCmdFile()) {
            return this._uvQuoteCmdArg(arg);
        }
        // otherwise apply quoting rules specific to the cmd.exe command line parser.
        // the libuv rules are generic and are not designed specifically for cmd.exe
        // command line parser.
        //
        // for a detailed description of the cmd.exe command line parser, refer to
        // http://stackoverflow.com/questions/4094699/how-does-the-windows-command-interpreter-cmd-exe-parse-scripts/7970912#7970912
        // need quotes for empty arg
        if (!arg) {
            return '""';
        }
        // determine whether the arg needs to be quoted
        const cmdSpecialChars = [
            ' ',
            '\t',
            '&',
            '(',
            ')',
            '[',
            ']',
            '{',
            '}',
            '^',
            '=',
            ';',
            '!',
            "'",
            '+',
            ',',
            '`',
            '~',
            '|',
            '<',
            '>',
            '"'
        ];
        let needsQuotes = false;
        for (const char of arg) {
            if (cmdSpecialChars.some(x => x === char)) {
                needsQuotes = true;
                break;
            }
        }
        // short-circuit if quotes not needed
        if (!needsQuotes) {
            return arg;
        }
        // the following quoting rules are very similar to the rules that by libuv applies.
        //
        // 1) wrap the string in quotes
        //
        // 2) double-up quotes - i.e. " => ""
        //
        //    this is different from the libuv quoting rules. libuv replaces " with \", which unfortunately
        //    doesn't work well with a cmd.exe command line.
        //
        //    note, replacing " with "" also works well if the arg is passed to a downstream .NET console app.
        //    for example, the command line:
        //          foo.exe "myarg:""my val"""
        //    is parsed by a .NET console app into an arg array:
        //          [ "myarg:\"my val\"" ]
        //    which is the same end result when applying libuv quoting rules. although the actual
        //    command line from libuv quoting rules would look like:
        //          foo.exe "myarg:\"my val\""
        //
        // 3) double-up slashes that precede a quote,
        //    e.g.  hello \world    => "hello \world"
        //          hello\"world    => "hello\\""world"
        //          hello\\"world   => "hello\\\\""world"
        //          hello world\    => "hello world\\"
        //
        //    technically this is not required for a cmd.exe command line, or the batch argument parser.
        //    the reasons for including this as a .cmd quoting rule are:
        //
        //    a) this is optimized for the scenario where the argument is passed from the .cmd file to an
        //       external program. many programs (e.g. .NET console apps) rely on the slash-doubling rule.
        //
        //    b) it's what we've been doing previously (by deferring to node default behavior) and we
        //       haven't heard any complaints about that aspect.
        //
        // note, a weakness of the quoting rules chosen here, is that % is not escaped. in fact, % cannot be
        // escaped when used on the command line directly - even though within a .cmd file % can be escaped
        // by using %%.
        //
        // the saving grace is, on the command line, %var% is left as-is if var is not defined. this contrasts
        // the line parsing rules within a .cmd file, where if var is not defined it is replaced with nothing.
        //
        // one option that was explored was replacing % with ^% - i.e. %var% => ^%var^%. this hack would
        // often work, since it is unlikely that var^ would exist, and the ^ character is removed when the
        // variable is used. the problem, however, is that ^ is not removed when %* is used to pass the args
        // to an external program.
        //
        // an unexplored potential solution for the % escaping problem, is to create a wrapper .cmd file.
        // % can be escaped within a .cmd file.
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\'; // double the slash
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '"'; // double the quote
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _uvQuoteCmdArg(arg) {
        // Tool runner wraps child_process.spawn() and needs to apply the same quoting as
        // Node in certain cases where the undocumented spawn option windowsVerbatimArguments
        // is used.
        //
        // Since this function is a port of quote_cmd_arg from Node 4.x (technically, lib UV,
        // see https://github.com/nodejs/node/blob/v4.x/deps/uv/src/win/process.c for details),
        // pasting copyright notice from Node within this function:
        //
        //      Copyright Joyent, Inc. and other Node contributors. All rights reserved.
        //
        //      Permission is hereby granted, free of charge, to any person obtaining a copy
        //      of this software and associated documentation files (the "Software"), to
        //      deal in the Software without restriction, including without limitation the
        //      rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
        //      sell copies of the Software, and to permit persons to whom the Software is
        //      furnished to do so, subject to the following conditions:
        //
        //      The above copyright notice and this permission notice shall be included in
        //      all copies or substantial portions of the Software.
        //
        //      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
        //      IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
        //      FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
        //      AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
        //      LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
        //      FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
        //      IN THE SOFTWARE.
        if (!arg) {
            // Need double quotation for empty argument
            return '""';
        }
        if (!arg.includes(' ') && !arg.includes('\t') && !arg.includes('"')) {
            // No quotation needed
            return arg;
        }
        if (!arg.includes('"') && !arg.includes('\\')) {
            // No embedded double quotes or backslashes, so I can just wrap
            // quote marks around the whole thing.
            return `"${arg}"`;
        }
        // Expected input/output:
        //   input : hello"world
        //   output: "hello\"world"
        //   input : hello""world
        //   output: "hello\"\"world"
        //   input : hello\world
        //   output: hello\world
        //   input : hello\\world
        //   output: hello\\world
        //   input : hello\"world
        //   output: "hello\\\"world"
        //   input : hello\\"world
        //   output: "hello\\\\\"world"
        //   input : hello world\
        //   output: "hello world\\" - note the comment in libuv actually reads "hello world\"
        //                             but it appears the comment is wrong, it should be "hello world\\"
        let reverse = '"';
        let quoteHit = true;
        for (let i = arg.length; i > 0; i--) {
            // walk the string in reverse
            reverse += arg[i - 1];
            if (quoteHit && arg[i - 1] === '\\') {
                reverse += '\\';
            }
            else if (arg[i - 1] === '"') {
                quoteHit = true;
                reverse += '\\';
            }
            else {
                quoteHit = false;
            }
        }
        reverse += '"';
        return reverse
            .split('')
            .reverse()
            .join('');
    }
    _cloneExecOptions(options) {
        options = options || {};
        const result = {
            cwd: options.cwd || process.cwd(),
            env: options.env || process.env,
            silent: options.silent || false,
            windowsVerbatimArguments: options.windowsVerbatimArguments || false,
            failOnStdErr: options.failOnStdErr || false,
            ignoreReturnCode: options.ignoreReturnCode || false,
            delay: options.delay || 10000
        };
        result.outStream = options.outStream || process.stdout;
        result.errStream = options.errStream || process.stderr;
        return result;
    }
    _getSpawnOptions(options, toolPath) {
        options = options || {};
        const result = {};
        result.cwd = options.cwd;
        result.env = options.env;
        result['windowsVerbatimArguments'] =
            options.windowsVerbatimArguments || this._isCmdFile();
        if (options.windowsVerbatimArguments) {
            result.argv0 = `"${toolPath}"`;
        }
        return result;
    }
    /**
     * Exec a tool.
     * Output will be streamed to the live console.
     * Returns promise with return code
     *
     * @param     tool     path to tool to exec
     * @param     options  optional exec options.  See ExecOptions
     * @returns   number
     */
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            // root the tool path if it is unrooted and contains relative pathing
            if (!ioUtil.isRooted(this.toolPath) &&
                (this.toolPath.includes('/') ||
                    (IS_WINDOWS && this.toolPath.includes('\\')))) {
                // prefer options.cwd if it is specified, however options.cwd may also need to be rooted
                this.toolPath = path.resolve(process.cwd(), this.options.cwd || process.cwd(), this.toolPath);
            }
            // if the tool is only a file name, then resolve it from the PATH
            // otherwise verify it exists (add extension on Windows if necessary)
            this.toolPath = yield io.which(this.toolPath, true);
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                this._debug(`exec tool: ${this.toolPath}`);
                this._debug('arguments:');
                for (const arg of this.args) {
                    this._debug(`   ${arg}`);
                }
                const optionsNonNull = this._cloneExecOptions(this.options);
                if (!optionsNonNull.silent && optionsNonNull.outStream) {
                    optionsNonNull.outStream.write(this._getCommandString(optionsNonNull) + os.EOL);
                }
                const state = new ExecState(optionsNonNull, this.toolPath);
                state.on('debug', (message) => {
                    this._debug(message);
                });
                if (this.options.cwd && !(yield ioUtil.exists(this.options.cwd))) {
                    return reject(new Error(`The cwd: ${this.options.cwd} does not exist!`));
                }
                const fileName = this._getSpawnFileName();
                const cp = child.spawn(fileName, this._getSpawnArgs(optionsNonNull), this._getSpawnOptions(this.options, fileName));
                let stdbuffer = '';
                if (cp.stdout) {
                    cp.stdout.on('data', (data) => {
                        if (this.options.listeners && this.options.listeners.stdout) {
                            this.options.listeners.stdout(data);
                        }
                        if (!optionsNonNull.silent && optionsNonNull.outStream) {
                            optionsNonNull.outStream.write(data);
                        }
                        stdbuffer = this._processLineBuffer(data, stdbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.stdline) {
                                this.options.listeners.stdline(line);
                            }
                        });
                    });
                }
                let errbuffer = '';
                if (cp.stderr) {
                    cp.stderr.on('data', (data) => {
                        state.processStderr = true;
                        if (this.options.listeners && this.options.listeners.stderr) {
                            this.options.listeners.stderr(data);
                        }
                        if (!optionsNonNull.silent &&
                            optionsNonNull.errStream &&
                            optionsNonNull.outStream) {
                            const s = optionsNonNull.failOnStdErr
                                ? optionsNonNull.errStream
                                : optionsNonNull.outStream;
                            s.write(data);
                        }
                        errbuffer = this._processLineBuffer(data, errbuffer, (line) => {
                            if (this.options.listeners && this.options.listeners.errline) {
                                this.options.listeners.errline(line);
                            }
                        });
                    });
                }
                cp.on('error', (err) => {
                    state.processError = err.message;
                    state.processExited = true;
                    state.processClosed = true;
                    state.CheckComplete();
                });
                cp.on('exit', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    this._debug(`Exit code ${code} received from tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                cp.on('close', (code) => {
                    state.processExitCode = code;
                    state.processExited = true;
                    state.processClosed = true;
                    this._debug(`STDIO streams have closed for tool '${this.toolPath}'`);
                    state.CheckComplete();
                });
                state.on('done', (error, exitCode) => {
                    if (stdbuffer.length > 0) {
                        this.emit('stdline', stdbuffer);
                    }
                    if (errbuffer.length > 0) {
                        this.emit('errline', errbuffer);
                    }
                    cp.removeAllListeners();
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve(exitCode);
                    }
                });
                if (this.options.input) {
                    if (!cp.stdin) {
                        throw new Error('child process missing stdin');
                    }
                    cp.stdin.end(this.options.input);
                }
            }));
        });
    }
}
exports.ToolRunner = ToolRunner;
/**
 * Convert an arg string to an array of args. Handles escaping
 *
 * @param    argString   string of arguments
 * @returns  string[]    array of arguments
 */
function argStringToArray(argString) {
    const args = [];
    let inQuotes = false;
    let escaped = false;
    let arg = '';
    function append(c) {
        // we only escape double quotes.
        if (escaped && c !== '"') {
            arg += '\\';
        }
        arg += c;
        escaped = false;
    }
    for (let i = 0; i < argString.length; i++) {
        const c = argString.charAt(i);
        if (c === '"') {
            if (!escaped) {
                inQuotes = !inQuotes;
            }
            else {
                append(c);
            }
            continue;
        }
        if (c === '\\' && escaped) {
            append(c);
            continue;
        }
        if (c === '\\' && inQuotes) {
            escaped = true;
            continue;
        }
        if (c === ' ' && !inQuotes) {
            if (arg.length > 0) {
                args.push(arg);
                arg = '';
            }
            continue;
        }
        append(c);
    }
    if (arg.length > 0) {
        args.push(arg.trim());
    }
    return args;
}
exports.argStringToArray = argStringToArray;
class ExecState extends events.EventEmitter {
    constructor(options, toolPath) {
        super();
        this.processClosed = false; // tracks whether the process has exited and stdio is closed
        this.processError = '';
        this.processExitCode = 0;
        this.processExited = false; // tracks whether the process has exited
        this.processStderr = false; // tracks whether stderr was written to
        this.delay = 10000; // 10 seconds
        this.done = false;
        this.timeout = null;
        if (!toolPath) {
            throw new Error('toolPath must not be empty');
        }
        this.options = options;
        this.toolPath = toolPath;
        if (options.delay) {
            this.delay = options.delay;
        }
    }
    CheckComplete() {
        if (this.done) {
            return;
        }
        if (this.processClosed) {
            this._setResult();
        }
        else if (this.processExited) {
            this.timeout = timers_1.setTimeout(ExecState.HandleTimeout, this.delay, this);
        }
    }
    _debug(message) {
        this.emit('debug', message);
    }
    _setResult() {
        // determine whether there is an error
        let error;
        if (this.processExited) {
            if (this.processError) {
                error = new Error(`There was an error when attempting to execute the process '${this.toolPath}'. This may indicate the process failed to start. Error: ${this.processError}`);
            }
            else if (this.processExitCode !== 0 && !this.options.ignoreReturnCode) {
                error = new Error(`The process '${this.toolPath}' failed with exit code ${this.processExitCode}`);
            }
            else if (this.processStderr && this.options.failOnStdErr) {
                error = new Error(`The process '${this.toolPath}' failed because one or more lines were written to the STDERR stream`);
            }
        }
        // clear the timeout
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.done = true;
        this.emit('done', error, this.processExitCode);
    }
    static HandleTimeout(state) {
        if (state.done) {
            return;
        }
        if (!state.processClosed && state.processExited) {
            const message = `The STDIO streams did not close within ${state.delay /
                1000} seconds of the exit event from process '${state.toolPath}'. This may indicate a child process inherited the STDIO streams and has not yet exited.`;
            state._debug(message);
        }
        state._setResult();
    }
}
//# sourceMappingURL=toolrunner.js.map

/***/ }),

/***/ 207:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getCmdPath = exports.tryGetExecutablePath = exports.isRooted = exports.isDirectory = exports.exists = exports.READONLY = exports.UV_FS_O_EXLOCK = exports.IS_WINDOWS = exports.unlink = exports.symlink = exports.stat = exports.rmdir = exports.rm = exports.rename = exports.readlink = exports.readdir = exports.open = exports.mkdir = exports.lstat = exports.copyFile = exports.chmod = void 0;
const fs = __importStar(__nccwpck_require__(896));
const path = __importStar(__nccwpck_require__(928));
_a = fs.promises
// export const {open} = 'fs'
, exports.chmod = _a.chmod, exports.copyFile = _a.copyFile, exports.lstat = _a.lstat, exports.mkdir = _a.mkdir, exports.open = _a.open, exports.readdir = _a.readdir, exports.readlink = _a.readlink, exports.rename = _a.rename, exports.rm = _a.rm, exports.rmdir = _a.rmdir, exports.stat = _a.stat, exports.symlink = _a.symlink, exports.unlink = _a.unlink;
// export const {open} = 'fs'
exports.IS_WINDOWS = process.platform === 'win32';
// See https://github.com/nodejs/node/blob/d0153aee367422d0858105abec186da4dff0a0c5/deps/uv/include/uv/win.h#L691
exports.UV_FS_O_EXLOCK = 0x10000000;
exports.READONLY = fs.constants.O_RDONLY;
function exists(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.stat(fsPath);
        }
        catch (err) {
            if (err.code === 'ENOENT') {
                return false;
            }
            throw err;
        }
        return true;
    });
}
exports.exists = exists;
function isDirectory(fsPath, useStat = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = useStat ? yield exports.stat(fsPath) : yield exports.lstat(fsPath);
        return stats.isDirectory();
    });
}
exports.isDirectory = isDirectory;
/**
 * On OSX/Linux, true if path starts with '/'. On Windows, true for paths like:
 * \, \hello, \\hello\share, C:, and C:\hello (and corresponding alternate separator cases).
 */
function isRooted(p) {
    p = normalizeSeparators(p);
    if (!p) {
        throw new Error('isRooted() parameter "p" cannot be empty');
    }
    if (exports.IS_WINDOWS) {
        return (p.startsWith('\\') || /^[A-Z]:/i.test(p) // e.g. \ or \hello or \\hello
        ); // e.g. C: or C:\hello
    }
    return p.startsWith('/');
}
exports.isRooted = isRooted;
/**
 * Best effort attempt to determine whether a file exists and is executable.
 * @param filePath    file path to check
 * @param extensions  additional file extensions to try
 * @return if file exists and is executable, returns the file path. otherwise empty string.
 */
function tryGetExecutablePath(filePath, extensions) {
    return __awaiter(this, void 0, void 0, function* () {
        let stats = undefined;
        try {
            // test file exists
            stats = yield exports.stat(filePath);
        }
        catch (err) {
            if (err.code !== 'ENOENT') {
                // eslint-disable-next-line no-console
                console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
            }
        }
        if (stats && stats.isFile()) {
            if (exports.IS_WINDOWS) {
                // on Windows, test for valid extension
                const upperExt = path.extname(filePath).toUpperCase();
                if (extensions.some(validExt => validExt.toUpperCase() === upperExt)) {
                    return filePath;
                }
            }
            else {
                if (isUnixExecutable(stats)) {
                    return filePath;
                }
            }
        }
        // try each extension
        const originalFilePath = filePath;
        for (const extension of extensions) {
            filePath = originalFilePath + extension;
            stats = undefined;
            try {
                stats = yield exports.stat(filePath);
            }
            catch (err) {
                if (err.code !== 'ENOENT') {
                    // eslint-disable-next-line no-console
                    console.log(`Unexpected error attempting to determine if executable file exists '${filePath}': ${err}`);
                }
            }
            if (stats && stats.isFile()) {
                if (exports.IS_WINDOWS) {
                    // preserve the case of the actual file (since an extension was appended)
                    try {
                        const directory = path.dirname(filePath);
                        const upperName = path.basename(filePath).toUpperCase();
                        for (const actualName of yield exports.readdir(directory)) {
                            if (upperName === actualName.toUpperCase()) {
                                filePath = path.join(directory, actualName);
                                break;
                            }
                        }
                    }
                    catch (err) {
                        // eslint-disable-next-line no-console
                        console.log(`Unexpected error attempting to determine the actual case of the file '${filePath}': ${err}`);
                    }
                    return filePath;
                }
                else {
                    if (isUnixExecutable(stats)) {
                        return filePath;
                    }
                }
            }
        }
        return '';
    });
}
exports.tryGetExecutablePath = tryGetExecutablePath;
function normalizeSeparators(p) {
    p = p || '';
    if (exports.IS_WINDOWS) {
        // convert slashes on Windows
        p = p.replace(/\//g, '\\');
        // remove redundant slashes
        return p.replace(/\\\\+/g, '\\');
    }
    // remove redundant slashes
    return p.replace(/\/\/+/g, '/');
}
// on Mac/Linux, test the execute bit
//     R   W  X  R  W X R W X
//   256 128 64 32 16 8 4 2 1
function isUnixExecutable(stats) {
    return ((stats.mode & 1) > 0 ||
        ((stats.mode & 8) > 0 && stats.gid === process.getgid()) ||
        ((stats.mode & 64) > 0 && stats.uid === process.getuid()));
}
// Get the path of cmd.exe in windows
function getCmdPath() {
    var _a;
    return (_a = process.env['COMSPEC']) !== null && _a !== void 0 ? _a : `cmd.exe`;
}
exports.getCmdPath = getCmdPath;
//# sourceMappingURL=io-util.js.map

/***/ }),

/***/ 994:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.findInPath = exports.which = exports.mkdirP = exports.rmRF = exports.mv = exports.cp = void 0;
const assert_1 = __nccwpck_require__(613);
const path = __importStar(__nccwpck_require__(928));
const ioUtil = __importStar(__nccwpck_require__(207));
/**
 * Copies a file or folder.
 * Based off of shelljs - https://github.com/shelljs/shelljs/blob/9237f66c52e5daa40458f94f9565e18e8132f5a6/src/cp.js
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See CopyOptions.
 */
function cp(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { force, recursive, copySourceDirectory } = readCopyOptions(options);
        const destStat = (yield ioUtil.exists(dest)) ? yield ioUtil.stat(dest) : null;
        // Dest is an existing file, but not forcing
        if (destStat && destStat.isFile() && !force) {
            return;
        }
        // If dest is an existing directory, should copy inside.
        const newDest = destStat && destStat.isDirectory() && copySourceDirectory
            ? path.join(dest, path.basename(source))
            : dest;
        if (!(yield ioUtil.exists(source))) {
            throw new Error(`no such file or directory: ${source}`);
        }
        const sourceStat = yield ioUtil.stat(source);
        if (sourceStat.isDirectory()) {
            if (!recursive) {
                throw new Error(`Failed to copy. ${source} is a directory, but tried to copy without recursive flag.`);
            }
            else {
                yield cpDirRecursive(source, newDest, 0, force);
            }
        }
        else {
            if (path.relative(source, newDest) === '') {
                // a file cannot be copied to itself
                throw new Error(`'${newDest}' and '${source}' are the same file`);
            }
            yield copyFile(source, newDest, force);
        }
    });
}
exports.cp = cp;
/**
 * Moves a path.
 *
 * @param     source    source path
 * @param     dest      destination path
 * @param     options   optional. See MoveOptions.
 */
function mv(source, dest, options = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield ioUtil.exists(dest)) {
            let destExists = true;
            if (yield ioUtil.isDirectory(dest)) {
                // If dest is directory copy src into dest
                dest = path.join(dest, path.basename(source));
                destExists = yield ioUtil.exists(dest);
            }
            if (destExists) {
                if (options.force == null || options.force) {
                    yield rmRF(dest);
                }
                else {
                    throw new Error('Destination already exists');
                }
            }
        }
        yield mkdirP(path.dirname(dest));
        yield ioUtil.rename(source, dest);
    });
}
exports.mv = mv;
/**
 * Remove a path recursively with force
 *
 * @param inputPath path to remove
 */
function rmRF(inputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ioUtil.IS_WINDOWS) {
            // Check for invalid characters
            // https://docs.microsoft.com/en-us/windows/win32/fileio/naming-a-file
            if (/[*"<>|]/.test(inputPath)) {
                throw new Error('File path must not contain `*`, `"`, `<`, `>` or `|` on Windows');
            }
        }
        try {
            // note if path does not exist, error is silent
            yield ioUtil.rm(inputPath, {
                force: true,
                maxRetries: 3,
                recursive: true,
                retryDelay: 300
            });
        }
        catch (err) {
            throw new Error(`File was unable to be removed ${err}`);
        }
    });
}
exports.rmRF = rmRF;
/**
 * Make a directory.  Creates the full path with folders in between
 * Will throw if it fails
 *
 * @param   fsPath        path to create
 * @returns Promise<void>
 */
function mkdirP(fsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        assert_1.ok(fsPath, 'a path argument must be provided');
        yield ioUtil.mkdir(fsPath, { recursive: true });
    });
}
exports.mkdirP = mkdirP;
/**
 * Returns path of a tool had the tool actually been invoked.  Resolves via paths.
 * If you check and the tool does not exist, it will throw.
 *
 * @param     tool              name of the tool
 * @param     check             whether to check if tool exists
 * @returns   Promise<string>   path to tool
 */
function which(tool, check) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tool) {
            throw new Error("parameter 'tool' is required");
        }
        // recursive when check=true
        if (check) {
            const result = yield which(tool, false);
            if (!result) {
                if (ioUtil.IS_WINDOWS) {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also verify the file has a valid extension for an executable file.`);
                }
                else {
                    throw new Error(`Unable to locate executable file: ${tool}. Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable. Also check the file mode to verify the file is executable.`);
                }
            }
            return result;
        }
        const matches = yield findInPath(tool);
        if (matches && matches.length > 0) {
            return matches[0];
        }
        return '';
    });
}
exports.which = which;
/**
 * Returns a list of all occurrences of the given tool on the system path.
 *
 * @returns   Promise<string[]>  the paths of the tool
 */
function findInPath(tool) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tool) {
            throw new Error("parameter 'tool' is required");
        }
        // build the list of extensions to try
        const extensions = [];
        if (ioUtil.IS_WINDOWS && process.env['PATHEXT']) {
            for (const extension of process.env['PATHEXT'].split(path.delimiter)) {
                if (extension) {
                    extensions.push(extension);
                }
            }
        }
        // if it's rooted, return it if exists. otherwise return empty.
        if (ioUtil.isRooted(tool)) {
            const filePath = yield ioUtil.tryGetExecutablePath(tool, extensions);
            if (filePath) {
                return [filePath];
            }
            return [];
        }
        // if any path separators, return empty
        if (tool.includes(path.sep)) {
            return [];
        }
        // build the list of directories
        //
        // Note, technically "where" checks the current directory on Windows. From a toolkit perspective,
        // it feels like we should not do this. Checking the current directory seems like more of a use
        // case of a shell, and the which() function exposed by the toolkit should strive for consistency
        // across platforms.
        const directories = [];
        if (process.env.PATH) {
            for (const p of process.env.PATH.split(path.delimiter)) {
                if (p) {
                    directories.push(p);
                }
            }
        }
        // find all matches
        const matches = [];
        for (const directory of directories) {
            const filePath = yield ioUtil.tryGetExecutablePath(path.join(directory, tool), extensions);
            if (filePath) {
                matches.push(filePath);
            }
        }
        return matches;
    });
}
exports.findInPath = findInPath;
function readCopyOptions(options) {
    const force = options.force == null ? true : options.force;
    const recursive = Boolean(options.recursive);
    const copySourceDirectory = options.copySourceDirectory == null
        ? true
        : Boolean(options.copySourceDirectory);
    return { force, recursive, copySourceDirectory };
}
function cpDirRecursive(sourceDir, destDir, currentDepth, force) {
    return __awaiter(this, void 0, void 0, function* () {
        // Ensure there is not a run away recursive copy
        if (currentDepth >= 255)
            return;
        currentDepth++;
        yield mkdirP(destDir);
        const files = yield ioUtil.readdir(sourceDir);
        for (const fileName of files) {
            const srcFile = `${sourceDir}/${fileName}`;
            const destFile = `${destDir}/${fileName}`;
            const srcFileStat = yield ioUtil.lstat(srcFile);
            if (srcFileStat.isDirectory()) {
                // Recurse
                yield cpDirRecursive(srcFile, destFile, currentDepth, force);
            }
            else {
                yield copyFile(srcFile, destFile, force);
            }
        }
        // Change the mode for the newly created directory
        yield ioUtil.chmod(destDir, (yield ioUtil.stat(sourceDir)).mode);
    });
}
// Buffered file copy
function copyFile(srcFile, destFile, force) {
    return __awaiter(this, void 0, void 0, function* () {
        if ((yield ioUtil.lstat(srcFile)).isSymbolicLink()) {
            // unlink/re-link it
            try {
                yield ioUtil.lstat(destFile);
                yield ioUtil.unlink(destFile);
            }
            catch (e) {
                // Try to override file permission
                if (e.code === 'EPERM') {
                    yield ioUtil.chmod(destFile, '0666');
                    yield ioUtil.unlink(destFile);
                }
                // other errors = it doesn't exist, no work to do
            }
            // Copy over symlink
            const symlinkFull = yield ioUtil.readlink(srcFile);
            yield ioUtil.symlink(symlinkFull, destFile, ioUtil.IS_WINDOWS ? 'junction' : null);
        }
        else if (!(yield ioUtil.exists(destFile)) || force) {
            yield ioUtil.copyFile(srcFile, destFile);
        }
    });
}
//# sourceMappingURL=io.js.map

/***/ }),

/***/ 1:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.enhanceWithAI = enhanceWithAI;
const https = __importStar(__nccwpck_require__(692));
const http = __importStar(__nccwpck_require__(611));
function httpRequest(url, options, body) {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith('https') ? https : http;
        const req = lib.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk.toString(); });
            res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(data);
                }
                else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.write(body);
        req.end();
    });
}
function buildPrompt(commits) {
    const commitList = commits.map(c => `- ${c.hash.slice(0, 7)} | ${c.subject}${c.body ? ' | ' + c.body.slice(0, 200) : ''}`).join('\n');
    return `You are a changelog writer. Given the following git commits, produce a structured JSON changelog.

For each commit, determine:
1. "type": one of feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert, other
2. "scope": the component/area affected (empty string if unclear)
3. "description": a clear, user-friendly one-line description
4. "breaking": true/false

Return ONLY valid JSON array. Each object: {"hash","shortHash","type","scope","description","author","date","breaking","prNumber"}

Commits:
${commitList}

Respond with only the JSON array, no markdown fences or extra text.`;
}
async function enhanceWithAI(commits, provider, apiKey, model) {
    const prompt = buildPrompt(commits);
    let responseText;
    if (provider === 'openai') {
        const body = JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 4000,
        });
        responseText = await httpRequest('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
        }, body);
        const parsed = JSON.parse(responseText);
        const content = parsed.choices?.[0]?.message?.content || '[]';
        return JSON.parse(content);
    }
    else if (provider === 'anthropic') {
        const body = JSON.stringify({
            model,
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }],
        });
        responseText = await httpRequest('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
        }, body);
        const parsed = JSON.parse(responseText);
        const content = parsed.content?.[0]?.text || '[]';
        return JSON.parse(content);
    }
    else {
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
}


/***/ }),

/***/ 728:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.detectBreakingChanges = detectBreakingChanges;
const BREAKING_INDICATORS = [
    { pattern: /BREAKING[ -]CHANGE/i, reason: 'Conventional commit BREAKING CHANGE footer' },
    { pattern: /\bremove[ds]?\b.*\b(api|endpoint|method|function|class|interface|param|field|column)\b/i, reason: 'Removal of public API surface' },
    { pattern: /\b(api|endpoint|method|function|class|interface|param|field|column)\b.*\bremove[ds]?\b/i, reason: 'Removal of public API surface' },
    { pattern: /\brename[ds]?\b.*\b(api|endpoint|method|function|class|interface|param|field|column)\b/i, reason: 'Rename of public API surface' },
    { pattern: /\b(api|endpoint|method|function|class|interface|param|field|column)\b.*\brename[ds]?\b/i, reason: 'Rename of public API surface' },
    { pattern: /\bmigrat(e|ion|ing)\b/i, reason: 'Migration required' },
    { pattern: /\bdeprecate[ds]?\b/i, reason: 'Deprecation notice' },
    { pattern: /\bdrop(ped|s)?\s+(support|compatibility)\b/i, reason: 'Dropped compatibility' },
    { pattern: /\bbackward[s]?\s*(in)?compatible\b/i, reason: 'Backward compatibility change' },
    { pattern: /\bminimum\s+(version|requirement)\b/i, reason: 'Minimum version requirement change' },
];
function detectBreakingChanges(commits) {
    const changes = [];
    for (const commit of commits) {
        // Already flagged as breaking by conventional commit parser
        if (commit.breaking) {
            changes.push({
                hash: commit.hash,
                shortHash: commit.shortHash,
                author: commit.author,
                description: commit.description,
                scope: commit.scope,
                reason: commit.body.includes('BREAKING CHANGE') || commit.body.includes('BREAKING-CHANGE')
                    ? 'Conventional commit BREAKING CHANGE footer'
                    : 'Conventional commit breaking indicator (!)',
            });
            continue;
        }
        // Scan subject and body for breaking indicators
        const textToScan = `${commit.subject} ${commit.body}`;
        for (const indicator of BREAKING_INDICATORS) {
            if (indicator.pattern.test(textToScan)) {
                changes.push({
                    hash: commit.hash,
                    shortHash: commit.shortHash,
                    author: commit.author,
                    description: commit.description,
                    scope: commit.scope,
                    reason: indicator.reason,
                });
                break;
            }
        }
    }
    const summary = changes.length === 0
        ? 'No breaking changes detected.'
        : `Found ${changes.length} potential breaking change${changes.length > 1 ? 's' : ''}: ${changes.map(c => c.shortHash).join(', ')}`;
    return {
        hasBreakingChanges: changes.length > 0,
        changes,
        summary,
    };
}


/***/ }),

/***/ 270:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DEFAULT_CATEGORIES = void 0;
exports.categorizeCommits = categorizeCommits;
exports.getCategoryLabel = getCategoryLabel;
exports.groupByCategory = groupByCategory;
exports.groupByScope = groupByScope;
exports.groupByDate = groupByDate;
const DEFAULT_CATEGORIES = {
    feat: '✨ Features',
    fix: '🐛 Bug Fixes',
    docs: '📚 Documentation',
    style: '💅 Styling',
    refactor: '♻️ Refactoring',
    perf: '⚡ Performance',
    test: '✅ Tests',
    build: '📦 Build',
    ci: '🔧 CI/CD',
    chore: '🧹 Chores',
    revert: '⏪ Reverts',
    other: '📝 Other Changes',
};
exports.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
function categorizeCommits(commits, customCategories, excludeTypes) {
    const categories = { ...DEFAULT_CATEGORIES, ...customCategories };
    const excluded = new Set(excludeTypes.map(t => t.trim().toLowerCase()));
    return commits
        .filter(c => !excluded.has(c.type))
        .map(commit => ({
        type: commit.type,
        scope: commit.scope,
        description: commit.description,
        hash: commit.hash,
        shortHash: commit.shortHash,
        author: commit.author,
        date: commit.date,
        breaking: commit.breaking,
        prNumber: commit.prNumber,
    }));
}
function getCategoryLabel(type, customCategories) {
    const categories = { ...DEFAULT_CATEGORIES, ...customCategories };
    return categories[type] || categories['other'] || '📝 Other Changes';
}
function groupByCategory(entries) {
    const groups = new Map();
    // Breaking changes first
    const breaking = entries.filter(e => e.breaking);
    if (breaking.length > 0) {
        groups.set('💥 Breaking Changes', breaking);
    }
    // Then by type
    for (const entry of entries) {
        if (entry.breaking)
            continue; // already in breaking section
        const existing = groups.get(entry.type) || [];
        existing.push(entry);
        groups.set(entry.type, existing);
    }
    return groups;
}
function groupByScope(entries) {
    const groups = new Map();
    for (const entry of entries) {
        const key = entry.scope || 'general';
        const existing = groups.get(key) || [];
        existing.push(entry);
        groups.set(key, existing);
    }
    return groups;
}
function groupByDate(entries) {
    const groups = new Map();
    for (const entry of entries) {
        const date = entry.date.split('T')[0];
        const existing = groups.get(date) || [];
        existing.push(entry);
        groups.set(date, existing);
    }
    return groups;
}


/***/ }),

/***/ 581:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __nccwpck_require__(828);
const fs = __importStar(__nccwpck_require__(896));
const path = __importStar(__nccwpck_require__(928));
function printUsage() {
    console.log(`
ai-changelog - AI-powered changelog generator

Usage:
  ai-changelog [options]

Options:
  --mode <mode>           Generation mode: "conventional" (default) or "ai"
  --ai-provider <p>       AI provider: "openai" (default) or "anthropic"
  --ai-api-key <key>      API key for AI provider
  --ai-model <model>      AI model (default: gpt-4o-mini)
  --output <target>       Output target: "stdout" (default), "file", or "both"
  --changelog-path <path> Path for changelog file (default: CHANGELOG.md)
  --include-range <range> Git revision range (auto-detected if not set)
  --categories <json>     JSON map of custom category labels
  --group-by <method>     Grouping: "category" (default), "scope", "date"
  --include-authors       Show commit authors (default: true)
  --no-authors            Hide commit authors
  --include-pr-links      Link to pull requests (default: true)
  --no-pr-links           Disable PR links
  --include-compare-link  Add compare link (default: true)
  --no-compare-link       Disable compare link
  --version <ver>         Version label (auto-detected if not set)
  --header <header>       Custom header (default: "# Changelog")
  --exclude-types <types> Comma-separated types to exclude (e.g. "chore,ci")
  --max-commits <n>       Maximum commits to process (default: 500)
  --format <fmt>          Output format: "markdown" (default), "json", "html"
  --license-key <key>     Polar.sh license key for premium features
  --polar-org-id <id>     Polar.sh organization ID (optional)
  --help                  Show this help message

Premium Features (require --license-key):
  --breaking-report       Show detailed breaking change analysis
  --version-recommend     Show semantic version recommendation

Examples:
  ai-changelog
  ai-changelog --format json --output stdout
  ai-changelog --mode ai --ai-api-key sk-... --output file
  ai-changelog --license-key AICL-... --breaking-report --version-recommend
`);
}
function parseArgs(argv) {
    const args = argv.slice(2);
    let showBreaking = false;
    let showVersionRec = false;
    const opts = {};
    const flags = new Set();
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--help' || arg === '-h') {
            printUsage();
            process.exit(0);
        }
        if (arg === '--breaking-report') {
            showBreaking = true;
            continue;
        }
        if (arg === '--version-recommend') {
            showVersionRec = true;
            continue;
        }
        if (arg === '--no-authors') {
            flags.add('no-authors');
            continue;
        }
        if (arg === '--no-pr-links') {
            flags.add('no-pr-links');
            continue;
        }
        if (arg === '--no-compare-link') {
            flags.add('no-compare-link');
            continue;
        }
        if (arg === '--include-authors') {
            flags.add('include-authors');
            continue;
        }
        if (arg === '--include-pr-links') {
            flags.add('include-pr-links');
            continue;
        }
        if (arg === '--include-compare-link') {
            flags.add('include-compare-link');
            continue;
        }
        if (arg.startsWith('--') && i + 1 < args.length) {
            opts[arg.slice(2)] = args[++i];
        }
    }
    let categories = {};
    if (opts['categories']) {
        try {
            categories = JSON.parse(opts['categories']);
        }
        catch { /* use defaults */ }
    }
    const excludeRaw = opts['exclude-types'] || '';
    const excludeTypes = excludeRaw ? excludeRaw.split(',').map(s => s.trim()) : [];
    const inputs = {
        mode: (opts['mode'] || 'conventional'),
        aiProvider: (opts['ai-provider'] || 'openai'),
        aiApiKey: opts['ai-api-key'] || process.env.AI_API_KEY || '',
        aiModel: opts['ai-model'] || 'gpt-4o-mini',
        output: (opts['output'] || 'stdout'),
        changelogPath: opts['changelog-path'] || 'CHANGELOG.md',
        includeRange: opts['include-range'] || '',
        categories,
        groupBy: (opts['group-by'] || 'category'),
        includeAuthors: !flags.has('no-authors'),
        includePrLinks: !flags.has('no-pr-links'),
        includeCompareLink: !flags.has('no-compare-link'),
        version: opts['version'] || '',
        header: opts['header'] || '# Changelog',
        excludeTypes,
        maxCommits: parseInt(opts['max-commits'] || '500', 10),
        outputFormat: (opts['format'] || 'markdown'),
        licenseKey: opts['license-key'] || process.env.AI_CHANGELOG_LICENSE_KEY || '',
        polarOrgId: opts['polar-org-id'] || process.env.POLAR_ORG_ID || '',
    };
    return { inputs, showBreaking, showVersionRec };
}
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
async function main() {
    const { inputs, showBreaking, showVersionRec } = parseArgs(process.argv);
    try {
        const result = await (0, core_1.generateChangelog)(inputs, (msg) => process.stderr.write(`${msg}\n`), (msg) => process.stderr.write(`⚠ ${msg}\n`));
        // Write to file if requested
        if (inputs.output === 'file' || inputs.output === 'both') {
            const filePath = path.resolve(inputs.changelogPath);
            let existingContent = '';
            if (fs.existsSync(filePath)) {
                existingContent = fs.readFileSync(filePath, 'utf-8');
                const headerPattern = new RegExp(`^${escapeRegex(inputs.header)}\\n+`, 'm');
                existingContent = existingContent.replace(headerPattern, '');
            }
            const newContent = existingContent
                ? `${result.changelog.markdown}\n${existingContent}`
                : result.changelog.markdown;
            fs.writeFileSync(filePath, newContent, 'utf-8');
            process.stderr.write(`✅ Changelog written to ${inputs.changelogPath}\n`);
        }
        // Output to stdout
        if (inputs.output === 'stdout' || inputs.output === 'both') {
            const format = inputs.outputFormat || 'markdown';
            switch (format) {
                case 'json':
                    process.stdout.write(JSON.stringify(result.changelog.json, null, 2) + '\n');
                    break;
                case 'html':
                    process.stdout.write((result.changelog.html || '') + '\n');
                    break;
                default:
                    process.stdout.write(result.changelog.markdown + '\n');
            }
        }
        // Premium: breaking change report
        if (showBreaking) {
            if (!result.premiumActive) {
                process.stderr.write('⚠ Breaking change report requires a valid license key (--license-key)\n');
            }
            else if (result.breakingReport) {
                process.stderr.write('\n── Breaking Change Report ──\n');
                if (result.breakingReport.changes.length === 0) {
                    process.stderr.write('No breaking changes detected.\n');
                }
                else {
                    for (const bc of result.breakingReport.changes) {
                        process.stderr.write(`  ⚠ ${bc.shortHash} — ${bc.description}\n`);
                        process.stderr.write(`    Reason: ${bc.reason}\n`);
                        if (bc.scope)
                            process.stderr.write(`    Scope: ${bc.scope}\n`);
                    }
                }
            }
        }
        // Premium: version recommendation
        if (showVersionRec) {
            if (!result.premiumActive) {
                process.stderr.write('⚠ Version recommendation requires a valid license key (--license-key)\n');
            }
            else if (result.versionRecommendation) {
                const rec = result.versionRecommendation;
                process.stderr.write('\n── Version Recommendation ──\n');
                process.stderr.write(`  Bump: ${rec.bump}\n`);
                process.stderr.write(`  Reason: ${rec.reason}\n`);
                if (rec.recommendedVersion) {
                    process.stderr.write(`  Suggested: ${rec.currentVersion} → ${rec.recommendedVersion}\n`);
                }
            }
        }
        const summary = `🎉 ${result.changelog.commitCount} commits in ${result.changelog.categoriesFound.length} categories`;
        process.stderr.write(`${summary}\n`);
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        process.stderr.write(`Error: ${msg}\n`);
        process.exit(1);
    }
}
main();


/***/ }),

/***/ 828:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateChangelog = generateChangelog;
const git_1 = __nccwpck_require__(243);
const categorizer_1 = __nccwpck_require__(270);
const formatter_1 = __nccwpck_require__(845);
const ai_1 = __nccwpck_require__(1);
const license_1 = __nccwpck_require__(764);
const breaking_detect_1 = __nccwpck_require__(728);
const version_recommend_1 = __nccwpck_require__(600);
async function generateChangelog(inputs, log, warn) {
    const info = log || (() => { });
    const warning = warn || (() => { });
    info('🔍 Detecting commit range...');
    const range = inputs.includeRange || await (0, git_1.detectRange)();
    info(`📋 Range: ${range}`);
    info('📖 Reading git log...');
    const rawLog = await (0, git_1.getGitLog)(range, inputs.maxCommits);
    const commits = (0, git_1.parseCommits)(rawLog);
    info(`Found ${commits.length} commits`);
    if (commits.length === 0) {
        warning('No commits found in range. Generating empty changelog.');
    }
    const version = await (0, git_1.detectVersion)(range, inputs.version);
    const repoUrl = await (0, git_1.getRepoUrl)();
    info(`🏷️ Version: ${version}`);
    let entries;
    if (inputs.mode === 'ai' && inputs.aiApiKey) {
        info('🤖 Enhancing with AI...');
        try {
            entries = await (0, ai_1.enhanceWithAI)(commits, inputs.aiProvider, inputs.aiApiKey, inputs.aiModel);
        }
        catch (err) {
            warning(`AI enhancement failed, falling back to conventional: ${err}`);
            entries = (0, categorizer_1.categorizeCommits)(commits, inputs.categories, inputs.excludeTypes);
        }
    }
    else {
        if (inputs.mode === 'ai' && !inputs.aiApiKey) {
            warning('AI mode requested but no api-key provided. Falling back to conventional.');
        }
        entries = (0, categorizer_1.categorizeCommits)(commits, inputs.categories, inputs.excludeTypes);
    }
    // Check premium features via Polar.sh
    const licenseResult = await (0, license_1.validateLicense)(inputs.licenseKey, inputs.polarOrgId);
    const premiumActive = licenseResult.valid;
    if (licenseResult.error && inputs.licenseKey) {
        warning(`License validation: ${licenseResult.error}`);
    }
    let breakingReport;
    let versionRecommendation;
    if (premiumActive) {
        info('🔑 Premium features activated');
        breakingReport = (0, breaking_detect_1.detectBreakingChanges)(commits);
        if (breakingReport.hasBreakingChanges) {
            info(`⚠️ ${breakingReport.summary}`);
        }
        versionRecommendation = (0, version_recommend_1.recommendVersion)(entries, breakingReport, version);
        info(`📊 Recommended bump: ${versionRecommendation.bump} → ${versionRecommendation.recommendedVersion || 'N/A'}`);
    }
    info('📝 Formatting changelog...');
    const result = (0, formatter_1.formatChangelog)(entries, inputs, version, repoUrl, range);
    return {
        changelog: result,
        breakingReport,
        versionRecommendation,
        premiumActive,
    };
}


/***/ }),

/***/ 845:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.formatChangelog = formatChangelog;
exports.formatJSON = formatJSON;
exports.formatHTML = formatHTML;
const categorizer_1 = __nccwpck_require__(270);
function buildGroups(entries, inputs) {
    switch (inputs.groupBy) {
        case 'scope':
            return (0, categorizer_1.groupByScope)(entries);
        case 'date':
            return (0, categorizer_1.groupByDate)(entries);
        default:
            return (0, categorizer_1.groupByCategory)(entries);
    }
}
function resolveLabel(key, inputs) {
    return inputs.groupBy === 'category'
        ? (key === '💥 Breaking Changes' ? key : (0, categorizer_1.getCategoryLabel)(key, inputs.categories))
        : key;
}
function formatChangelog(entries, inputs, version, repoUrl, range) {
    const markdown = formatMarkdown(entries, inputs, version, repoUrl, range);
    const groups = buildGroups(entries, inputs);
    const categoriesFound = [...groups.keys()].map(k => resolveLabel(k, inputs));
    const result = {
        markdown,
        version,
        commitCount: entries.length,
        categoriesFound,
    };
    const format = inputs.outputFormat || 'markdown';
    if (format === 'json' || format === 'html') {
        result.json = formatJSON(entries, inputs, version, groups);
    }
    if (format === 'html') {
        result.html = formatHTML(entries, inputs, version, repoUrl, range, groups);
    }
    return result;
}
function formatMarkdown(entries, inputs, version, repoUrl, range) {
    const lines = [];
    lines.push(inputs.header);
    lines.push('');
    const date = new Date().toISOString().split('T')[0];
    lines.push(`## ${version} (${date})`);
    lines.push('');
    if (inputs.includeCompareLink && repoUrl && range.includes('..')) {
        const [from, to] = range.split('..');
        lines.push(`[Full diff](${repoUrl}/compare/${from}...${to || 'HEAD'})`);
        lines.push('');
    }
    if (entries.length === 0) {
        lines.push('_No notable changes in this release._');
        return lines.join('\n');
    }
    const groups = buildGroups(entries, inputs);
    for (const [key, groupEntries] of groups) {
        const label = resolveLabel(key, inputs);
        lines.push(`### ${label}`);
        lines.push('');
        for (const entry of groupEntries) {
            let line = '- ';
            if (entry.scope && inputs.groupBy !== 'scope') {
                line += `**${entry.scope}:** `;
            }
            line += entry.description;
            if (entry.prNumber && inputs.includePrLinks && repoUrl) {
                line += ` ([#${entry.prNumber}](${repoUrl}/pull/${entry.prNumber}))`;
            }
            if (repoUrl) {
                line += ` ([${entry.shortHash}](${repoUrl}/commit/${entry.hash}))`;
            }
            else {
                line += ` (${entry.shortHash})`;
            }
            if (inputs.includeAuthors) {
                line += ` — @${entry.author}`;
            }
            lines.push(line);
        }
        lines.push('');
    }
    return lines.join('\n');
}
function formatJSON(entries, inputs, version, groups) {
    const resolvedGroups = groups || buildGroups(entries, inputs);
    const date = new Date().toISOString().split('T')[0];
    const sections = [...resolvedGroups.entries()].map(([key, groupEntries]) => ({
        category: resolveLabel(key, inputs),
        entries: groupEntries,
    }));
    return {
        version,
        date,
        sections,
        commitCount: entries.length,
    };
}
function formatHTML(entries, inputs, version, repoUrl, range, groups) {
    const resolvedGroups = groups || buildGroups(entries, inputs);
    const date = new Date().toISOString().split('T')[0];
    const lines = [];
    lines.push('<!DOCTYPE html>');
    lines.push('<html lang="en"><head><meta charset="UTF-8">');
    lines.push(`<title>Changelog ${esc(version)}</title>`);
    lines.push('<style>body{font-family:system-ui,sans-serif;max-width:48rem;margin:2rem auto;padding:0 1rem;color:#1a1a1a}h1{border-bottom:2px solid #eee;padding-bottom:.5rem}h2{color:#333}h3{color:#555}ul{padding-left:1.5rem}li{margin:.25rem 0}a{color:#0969da}.scope{font-weight:700}.author{color:#666;font-size:.9em}.breaking{color:#d1242f;font-weight:700}</style>');
    lines.push('</head><body>');
    lines.push(`<h1>${esc(inputs.header.replace(/^#\s*/, ''))}</h1>`);
    lines.push(`<h2>${esc(version)} <small>(${esc(date)})</small></h2>`);
    if (inputs.includeCompareLink && repoUrl && range.includes('..')) {
        const [from, to] = range.split('..');
        lines.push(`<p><a href="${esc(repoUrl)}/compare/${esc(from)}...${esc(to || 'HEAD')}">Full diff</a></p>`);
    }
    if (entries.length === 0) {
        lines.push('<p><em>No notable changes in this release.</em></p>');
    }
    else {
        for (const [key, groupEntries] of resolvedGroups) {
            const label = resolveLabel(key, inputs);
            lines.push(`<h3>${esc(label)}</h3>`);
            lines.push('<ul>');
            for (const entry of groupEntries) {
                let li = '';
                if (entry.scope && inputs.groupBy !== 'scope') {
                    li += `<span class="scope">${esc(entry.scope)}:</span> `;
                }
                li += esc(entry.description);
                if (entry.prNumber && inputs.includePrLinks && repoUrl) {
                    li += ` (<a href="${esc(repoUrl)}/pull/${esc(entry.prNumber)}">#${esc(entry.prNumber)}</a>)`;
                }
                if (repoUrl) {
                    li += ` (<a href="${esc(repoUrl)}/commit/${esc(entry.hash)}">${esc(entry.shortHash)}</a>)`;
                }
                else {
                    li += ` (${esc(entry.shortHash)})`;
                }
                if (inputs.includeAuthors) {
                    li += ` <span class="author">— @${esc(entry.author)}</span>`;
                }
                lines.push(`<li>${li}</li>`);
            }
            lines.push('</ul>');
        }
    }
    lines.push('</body></html>');
    return lines.join('\n');
}
function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


/***/ }),

/***/ 243:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getGitLog = getGitLog;
exports.detectRange = detectRange;
exports.detectVersion = detectVersion;
exports.getRepoUrl = getRepoUrl;
exports.parseCommits = parseCommits;
const exec = __importStar(__nccwpck_require__(236));
const CONVENTIONAL_REGEX = /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?:\s*(?<description>.+)/;
const PR_REGEX = /\(#(?<pr>\d+)\)\s*$/;
async function getGitLog(range, maxCommits) {
    let output = '';
    const delimiter = '---COMMIT-DELIMITER---';
    const format = `${delimiter}%H|%h|%an|%aI|%s|%b`;
    await exec.exec('git', [
        'log',
        range,
        `--pretty=format:${format}`,
        `--max-count=${maxCommits}`,
    ], {
        listeners: {
            stdout: (data) => { output += data.toString(); },
        },
        silent: true,
    });
    return output;
}
async function detectRange() {
    let tags = '';
    try {
        await exec.exec('git', ['tag', '--sort=-version:refname', '--merged', 'HEAD'], {
            listeners: {
                stdout: (data) => { tags += data.toString(); },
            },
            silent: true,
        });
    }
    catch {
        // no tags — fall back to all commits
    }
    const tagList = tags.trim().split('\n').filter(Boolean);
    if (tagList.length >= 2) {
        return `${tagList[1]}..${tagList[0]}`;
    }
    else if (tagList.length === 1) {
        return `${tagList[0]}..HEAD`;
    }
    // No tags: use all commits
    let firstCommit = '';
    try {
        await exec.exec('git', ['rev-list', '--max-parents=0', 'HEAD'], {
            listeners: {
                stdout: (data) => { firstCommit += data.toString(); },
            },
            silent: true,
        });
    }
    catch {
        return 'HEAD';
    }
    const first = firstCommit.trim().split('\n')[0];
    return first ? `${first}..HEAD` : 'HEAD';
}
async function detectVersion(range, explicitVersion) {
    if (explicitVersion)
        return explicitVersion;
    let tags = '';
    try {
        await exec.exec('git', ['tag', '--sort=-version:refname', '--merged', 'HEAD', '--list', 'v*'], {
            listeners: {
                stdout: (data) => { tags += data.toString(); },
            },
            silent: true,
        });
    }
    catch {
        // ignore
    }
    const tagList = tags.trim().split('\n').filter(Boolean);
    if (tagList.length > 0)
        return tagList[0];
    const today = new Date().toISOString().split('T')[0];
    return `Unreleased (${today})`;
}
async function getRepoUrl() {
    let remote = '';
    try {
        await exec.exec('git', ['remote', 'get-url', 'origin'], {
            listeners: {
                stdout: (data) => { remote += data.toString(); },
            },
            silent: true,
        });
    }
    catch {
        return null;
    }
    remote = remote.trim();
    // Convert SSH to HTTPS
    if (remote.startsWith('git@')) {
        remote = remote.replace(':', '/').replace('git@', 'https://');
    }
    return remote.replace(/\.git$/, '');
}
function parseCommits(rawLog) {
    const delimiter = '---COMMIT-DELIMITER---';
    const chunks = rawLog.split(delimiter).filter(c => c.trim());
    return chunks.map(chunk => {
        const parts = chunk.split('|');
        const hash = parts[0]?.trim() || '';
        const shortHash = parts[1]?.trim() || '';
        const author = parts[2]?.trim() || '';
        const date = parts[3]?.trim() || '';
        const subject = parts[4]?.trim() || '';
        const body = parts.slice(5).join('|').trim();
        const conventionalMatch = subject.match(CONVENTIONAL_REGEX);
        const prMatch = subject.match(PR_REGEX);
        let type = 'other';
        let scope = '';
        let description = subject;
        let breaking = false;
        if (conventionalMatch?.groups) {
            type = conventionalMatch.groups.type.toLowerCase();
            scope = conventionalMatch.groups.scope || '';
            description = conventionalMatch.groups.description.trim();
            breaking = !!conventionalMatch.groups.breaking ||
                body.includes('BREAKING CHANGE') ||
                body.includes('BREAKING-CHANGE');
        }
        else {
            // Heuristic categorization for non-conventional commits
            const lowerSubject = subject.toLowerCase();
            if (lowerSubject.startsWith('fix') || lowerSubject.includes('bugfix') || lowerSubject.includes('hotfix')) {
                type = 'fix';
            }
            else if (lowerSubject.startsWith('add') || lowerSubject.startsWith('feat') || lowerSubject.includes('implement')) {
                type = 'feat';
            }
            else if (lowerSubject.startsWith('doc') || lowerSubject.includes('readme')) {
                type = 'docs';
            }
            else if (lowerSubject.startsWith('refactor') || lowerSubject.startsWith('clean')) {
                type = 'refactor';
            }
            else if (lowerSubject.startsWith('test')) {
                type = 'test';
            }
            else if (lowerSubject.includes('breaking')) {
                type = 'feat';
                breaking = true;
            }
        }
        return {
            hash,
            shortHash,
            subject,
            body,
            author,
            date,
            type,
            scope,
            description,
            breaking,
            prNumber: prMatch?.groups?.pr || null,
            raw: chunk,
        };
    });
}


/***/ }),

/***/ 764:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PREMIUM_FEATURES = void 0;
exports.validateLicense = validateLicense;
exports.hasFeatureAccess = hasFeatureAccess;
const https = __importStar(__nccwpck_require__(692));
const POLAR_API_BASE = 'https://api.polar.sh';
const VALIDATION_PATH = '/v1/customer-portal/license-keys/validate';
const TIER_PATTERNS = [
    { pattern: /\bteam\b/i, tier: 'team' },
    { pattern: /\bpro\b/i, tier: 'pro' },
];
function detectTier(benefit) {
    if (!benefit?.description)
        return 'pro';
    for (const { pattern, tier } of TIER_PATTERNS) {
        if (pattern.test(benefit.description))
            return tier;
    }
    return 'pro';
}
/**
 * Validate a Polar.sh-issued license key via the public customer-portal
 * endpoint (no server-side access token required — safe from CI runners).
 */
async function validateLicense(key, orgId) {
    if (!key || key.trim().length === 0) {
        return { valid: false, tier: 'free', error: 'No license key provided' };
    }
    const body = { key: key.trim() };
    if (orgId)
        body.organization_id = orgId;
    const payload = JSON.stringify(body);
    return new Promise((resolve) => {
        const req = https.request({
            hostname: new URL(POLAR_API_BASE).hostname,
            path: VALIDATION_PATH,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
            },
            timeout: 10_000,
        }, (res) => {
            let data = '';
            res.on('data', (chunk) => (data += chunk));
            res.on('end', () => {
                try {
                    if (res.statusCode === 200) {
                        const parsed = JSON.parse(data);
                        if (parsed.status === 'granted') {
                            resolve({
                                valid: true,
                                tier: detectTier(parsed.benefit),
                                customerId: parsed.customer_id,
                                expiresAt: parsed.expires_at ?? undefined,
                            });
                        }
                        else {
                            resolve({
                                valid: false,
                                tier: 'free',
                                error: `License key status: ${parsed.status}`,
                            });
                        }
                    }
                    else {
                        const msg = tryParseError(data) || `HTTP ${res.statusCode}`;
                        resolve({ valid: false, tier: 'free', error: msg });
                    }
                }
                catch {
                    resolve({ valid: false, tier: 'free', error: 'Invalid response from license server' });
                }
            });
        });
        req.on('error', (err) => {
            resolve({ valid: false, tier: 'free', error: `Network error: ${err.message}` });
        });
        req.on('timeout', () => {
            req.destroy();
            resolve({ valid: false, tier: 'free', error: 'License validation request timed out' });
        });
        req.write(payload);
        req.end();
    });
}
function tryParseError(body) {
    try {
        const parsed = JSON.parse(body);
        return parsed.detail ?? parsed.message ?? parsed.error ?? null;
    }
    catch {
        return null;
    }
}
exports.PREMIUM_FEATURES = ['ai', 'multi-format'];
/** Check whether a given license tier grants access to a premium feature. */
function hasFeatureAccess(tier, feature) {
    if (tier === 'team' || tier === 'pro')
        return true;
    return false;
}


/***/ }),

/***/ 600:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.parseSemver = parseSemver;
exports.bumpVersion = bumpVersion;
exports.recommendVersion = recommendVersion;
const SEMVER_REGEX = /^v?(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/;
function parseSemver(version) {
    const match = version.match(SEMVER_REGEX);
    if (!match)
        return null;
    return {
        major: parseInt(match[1], 10),
        minor: parseInt(match[2], 10),
        patch: parseInt(match[3], 10),
        prerelease: match[4] || '',
    };
}
function bumpVersion(version, bump) {
    const parsed = parseSemver(version);
    if (!parsed)
        return version;
    const prefix = version.startsWith('v') ? 'v' : '';
    switch (bump) {
        case 'major':
            return `${prefix}${parsed.major + 1}.0.0`;
        case 'minor':
            return `${prefix}${parsed.major}.${parsed.minor + 1}.0`;
        case 'patch':
            return `${prefix}${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    }
}
function recommendVersion(entries, breakingReport, currentVersion) {
    const parsed = parseSemver(currentVersion);
    if (breakingReport.hasBreakingChanges) {
        return {
            bump: 'major',
            reason: `Breaking changes detected: ${breakingReport.summary}`,
            currentVersion,
            recommendedVersion: parsed ? bumpVersion(currentVersion, 'major') : null,
        };
    }
    const hasFeatures = entries.some(e => e.type === 'feat');
    if (hasFeatures) {
        return {
            bump: 'minor',
            reason: 'New features added without breaking changes',
            currentVersion,
            recommendedVersion: parsed ? bumpVersion(currentVersion, 'minor') : null,
        };
    }
    return {
        bump: 'patch',
        reason: 'Bug fixes and maintenance changes only',
        currentVersion,
        recommendedVersion: parsed ? bumpVersion(currentVersion, 'patch') : null,
    };
}


/***/ }),

/***/ 613:
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ 317:
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),

/***/ 434:
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ 896:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 611:
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ 692:
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ 857:
/***/ ((module) => {

module.exports = require("os");

/***/ }),

/***/ 928:
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ 193:
/***/ ((module) => {

module.exports = require("string_decoder");

/***/ }),

/***/ 557:
/***/ ((module) => {

module.exports = require("timers");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(581);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=index.js.map
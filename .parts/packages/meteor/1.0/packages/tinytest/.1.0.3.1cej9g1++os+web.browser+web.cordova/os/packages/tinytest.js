(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/tinytest/tinytest.js                                                                   //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
var Future;                                                                                        // 1
if (Meteor.isServer)                                                                               // 2
  Future = Npm.require('fibers/future');                                                           // 3
                                                                                                   // 4
/******************************************************************************/                   // 5
/* TestCaseResults                                                            */                   // 6
/******************************************************************************/                   // 7
                                                                                                   // 8
TestCaseResults = function (test_case, onEvent, onException, stop_at_offset) {                     // 9
  var self = this;                                                                                 // 10
  self.test_case = test_case;                                                                      // 11
  self.onEvent = onEvent;                                                                          // 12
  self.expecting_failure = false;                                                                  // 13
  self.current_fail_count = 0;                                                                     // 14
  self.stop_at_offset = stop_at_offset;                                                            // 15
  self.onException = onException;                                                                  // 16
  self.id = Random.id();                                                                           // 17
  self.extraDetails = {};                                                                          // 18
};                                                                                                 // 19
                                                                                                   // 20
_.extend(TestCaseResults.prototype, {                                                              // 21
  ok: function (doc) {                                                                             // 22
    var self = this;                                                                               // 23
    var ok = {type: "ok"};                                                                         // 24
    if (doc)                                                                                       // 25
      ok.details = doc;                                                                            // 26
    if (self.expecting_failure) {                                                                  // 27
      ok.details = ok.details || {};                                                               // 28
      ok.details["was_expecting_failure"] = true;                                                  // 29
      self.expecting_failure = false;                                                              // 30
    }                                                                                              // 31
    self.onEvent(ok);                                                                              // 32
  },                                                                                               // 33
                                                                                                   // 34
  expect_fail: function () {                                                                       // 35
    var self = this;                                                                               // 36
    self.expecting_failure = true;                                                                 // 37
  },                                                                                               // 38
                                                                                                   // 39
  fail: function (doc) {                                                                           // 40
    var self = this;                                                                               // 41
                                                                                                   // 42
    if (typeof doc === "string") {                                                                 // 43
      // Some very old code still tries to call fail() with a                                      // 44
      // string. Don't do this!                                                                    // 45
      doc = { type: "fail", message: doc };                                                        // 46
    }                                                                                              // 47
                                                                                                   // 48
    doc = _.extend({}, doc, self.extraDetails);                                                    // 49
                                                                                                   // 50
    if (self.stop_at_offset === 0) {                                                               // 51
      if (Meteor.isClient) {                                                                       // 52
        // Only supported on the browser for now..                                                 // 53
        var now = (+new Date);                                                                     // 54
        debugger;                                                                                  // 55
        if ((+new Date) - now < 100)                                                               // 56
          alert("To use this feature, first enable your browser's debugger.");                     // 57
      }                                                                                            // 58
      self.stop_at_offset = null;                                                                  // 59
    }                                                                                              // 60
    if (self.stop_at_offset)                                                                       // 61
      self.stop_at_offset--;                                                                       // 62
                                                                                                   // 63
    // Get filename and line number of failure if we're using v8 (Chrome or                        // 64
    // Node).                                                                                      // 65
    if (Error.captureStackTrace) {                                                                 // 66
      var savedPrepareStackTrace = Error.prepareStackTrace;                                        // 67
      Error.prepareStackTrace = function(_, stack){ return stack; };                               // 68
      var err = new Error;                                                                         // 69
      Error.captureStackTrace(err);                                                                // 70
      var stack = err.stack;                                                                       // 71
      Error.prepareStackTrace = savedPrepareStackTrace;                                            // 72
      for (var i = stack.length - 1; i >= 0; --i) {                                                // 73
        var frame = stack[i];                                                                      // 74
        // Heuristic: use the OUTERMOST line which is in a :tests.js                               // 75
        // file (this is less likely to be a test helper function).                                // 76
        if (frame.getFileName().match(/:tests\.js/)) {                                             // 77
          doc.filename = frame.getFileName();                                                      // 78
          doc.line = frame.getLineNumber();                                                        // 79
          break;                                                                                   // 80
        }                                                                                          // 81
      }                                                                                            // 82
    }                                                                                              // 83
                                                                                                   // 84
    self.onEvent({                                                                                 // 85
        type: (self.expecting_failure ? "expected_fail" : "fail"),                                 // 86
        details: doc,                                                                              // 87
        cookie: {name: self.test_case.name, offset: self.current_fail_count,                       // 88
                 groupPath: self.test_case.groupPath,                                              // 89
                 shortName: self.test_case.shortName}                                              // 90
    });                                                                                            // 91
    self.expecting_failure = false;                                                                // 92
    self.current_fail_count++;                                                                     // 93
  },                                                                                               // 94
                                                                                                   // 95
  // Call this to fail the test with an exception. Use this to record                              // 96
  // exceptions that occur inside asynchronous callbacks in tests.                                 // 97
  //                                                                                               // 98
  // It should only be used with asynchronous tests, and if you call                               // 99
  // this function, you should make sure that (1) the test doesn't                                 // 100
  // call its callback (onComplete function); (2) the test function                                // 101
  // doesn't directly raise an exception.                                                          // 102
  exception: function (exception) {                                                                // 103
    this.onException(exception);                                                                   // 104
  },                                                                                               // 105
                                                                                                   // 106
  // returns a unique ID for this test run, for convenience use by                                 // 107
  // your tests                                                                                    // 108
  runId: function () {                                                                             // 109
    return this.id;                                                                                // 110
  },                                                                                               // 111
                                                                                                   // 112
  // === Following patterned after http://vowsjs.org/#reference ===                                // 113
                                                                                                   // 114
  // XXX eliminate 'message' and 'not' arguments                                                   // 115
  equal: function (actual, expected, message, not) {                                               // 116
                                                                                                   // 117
    if ((! not) && (typeof actual === 'string') &&                                                 // 118
        (typeof expected === 'string')) {                                                          // 119
      this._stringEqual(actual, expected, message);                                                // 120
      return;                                                                                      // 121
    }                                                                                              // 122
                                                                                                   // 123
    /* If expected is a DOM node, do a literal '===' comparison with                               // 124
     * actual. Otherwise do a deep comparison, as implemented by _.isEqual.                        // 125
     */                                                                                            // 126
                                                                                                   // 127
    var matched;                                                                                   // 128
    // XXX remove cruft specific to liverange                                                      // 129
    if (typeof expected === "object" && expected && expected.nodeType) {                           // 130
      matched = expected === actual;                                                               // 131
      expected = "[Node]";                                                                         // 132
      actual = "[Unknown]";                                                                        // 133
    } else if (typeof Uint8Array !== 'undefined' && expected instanceof Uint8Array) {              // 134
      // I have no idea why but _.isEqual on Chrome horks completely on Uint8Arrays.               // 135
      // and the symptom is the chrome renderer taking up an entire CPU and freezing               // 136
      // your web page, but not pausing anywhere in _.isEqual.  I don't understand it              // 137
      // but we fall back to a manual comparison                                                   // 138
      if (!(actual instanceof Uint8Array))                                                         // 139
        this.fail({type: "assert_equal", message: "found object is not a typed array",             // 140
                   expected: "A typed array", actual: actual.constructor.toString()});             // 141
      if (expected.length !== actual.length)                                                       // 142
        this.fail({type: "assert_equal", message: "lengths of typed arrays do not match",          // 143
                   expected: expected.length, actual: actual.length});                             // 144
      for (var i = 0; i < expected.length; i++) {                                                  // 145
        this.equal(actual[i], expected[i]);                                                        // 146
      }                                                                                            // 147
    } else {                                                                                       // 148
      matched = EJSON.equals(expected, actual);                                                    // 149
    }                                                                                              // 150
                                                                                                   // 151
    if (matched === !!not) {                                                                       // 152
      this.fail({type: "assert_equal", message: message,                                           // 153
                 expected: JSON.stringify(expected), actual: JSON.stringify(actual), not: !!not}); // 154
    } else                                                                                         // 155
      this.ok();                                                                                   // 156
  },                                                                                               // 157
                                                                                                   // 158
  notEqual: function (actual, expected, message) {                                                 // 159
    this.equal(actual, expected, message, true);                                                   // 160
  },                                                                                               // 161
                                                                                                   // 162
  instanceOf: function (obj, klass) {                                                              // 163
    if (obj instanceof klass)                                                                      // 164
      this.ok();                                                                                   // 165
    else                                                                                           // 166
      this.fail({type: "instanceOf"}); // XXX what other data?                                     // 167
  },                                                                                               // 168
                                                                                                   // 169
  matches: function (actual, regexp, message) {                                                    // 170
    if (regexp.test(actual))                                                                       // 171
      this.ok();                                                                                   // 172
    else                                                                                           // 173
      this.fail({type: "matches", message: message,                                                // 174
                 actual: actual, regexp: regexp.toString()});                                      // 175
  },                                                                                               // 176
                                                                                                   // 177
  // expected can be:                                                                              // 178
  //  undefined: accept any exception.                                                             // 179
  //  string: pass if the string is a substring of the exception message.                          // 180
  //  regexp: pass if the exception message passes the regexp.                                     // 181
  //  function: call the function as a predicate with the exception.                               // 182
  //                                                                                               // 183
  // Note: Node's assert.throws also accepts a constructor to test                                 // 184
  // whether the error is of the expected class.  But since                                        // 185
  // JavaScript can't distinguish between constructors and plain                                   // 186
  // functions and Node's assert.throws also accepts a predicate                                   // 187
  // function, if the error fails the instanceof test with the                                     // 188
  // constructor then the constructor is then treated as a predicate                               // 189
  // and called (!)                                                                                // 190
  //                                                                                               // 191
  // The upshot is, if you want to test whether an error is of a                                   // 192
  // particular class, use a predicate function.                                                   // 193
  //                                                                                               // 194
  throws: function (f, expected) {                                                                 // 195
    var actual, predicate;                                                                         // 196
                                                                                                   // 197
    if (expected === undefined)                                                                    // 198
      predicate = function (actual) {                                                              // 199
        return true;                                                                               // 200
      };                                                                                           // 201
    else if (_.isString(expected))                                                                 // 202
      predicate = function (actual) {                                                              // 203
        return _.isString(actual.message) &&                                                       // 204
               actual.message.indexOf(expected) !== -1;                                            // 205
      };                                                                                           // 206
    else if (expected instanceof RegExp)                                                           // 207
      predicate = function (actual) {                                                              // 208
        return expected.test(actual.message);                                                      // 209
      };                                                                                           // 210
    else if (typeof expected === 'function')                                                       // 211
      predicate = expected;                                                                        // 212
    else                                                                                           // 213
      throw new Error('expected should be a string, regexp, or predicate function');               // 214
                                                                                                   // 215
    try {                                                                                          // 216
      f();                                                                                         // 217
    } catch (exception) {                                                                          // 218
      actual = exception;                                                                          // 219
    }                                                                                              // 220
                                                                                                   // 221
    if (actual && predicate(actual))                                                               // 222
      this.ok();                                                                                   // 223
    else                                                                                           // 224
      this.fail({                                                                                  // 225
        type: "throws",                                                                            // 226
        message: actual ?                                                                          // 227
          "wrong error thrown: " + actual.message :                                                // 228
          "did not throw an error as expected"                                                     // 229
      });                                                                                          // 230
  },                                                                                               // 231
                                                                                                   // 232
  isTrue: function (v, msg) {                                                                      // 233
    if (v)                                                                                         // 234
      this.ok();                                                                                   // 235
    else                                                                                           // 236
      this.fail({type: "true", message: msg});                                                     // 237
  },                                                                                               // 238
                                                                                                   // 239
  isFalse: function (v, msg) {                                                                     // 240
    if (v)                                                                                         // 241
      this.fail({type: "true", message: msg});                                                     // 242
    else                                                                                           // 243
      this.ok();                                                                                   // 244
  },                                                                                               // 245
                                                                                                   // 246
  isNull: function (v, msg) {                                                                      // 247
    if (v === null)                                                                                // 248
      this.ok();                                                                                   // 249
    else                                                                                           // 250
      this.fail({type: "null", message: msg});                                                     // 251
  },                                                                                               // 252
                                                                                                   // 253
  isNotNull: function (v, msg) {                                                                   // 254
    if (v === null)                                                                                // 255
      this.fail({type: "true", message: msg});                                                     // 256
    else                                                                                           // 257
      this.ok();                                                                                   // 258
  },                                                                                               // 259
                                                                                                   // 260
  isUndefined: function (v, msg) {                                                                 // 261
    if (v === undefined)                                                                           // 262
      this.ok();                                                                                   // 263
    else                                                                                           // 264
      this.fail({type: "undefined", message: msg});                                                // 265
  },                                                                                               // 266
                                                                                                   // 267
  isNaN: function (v, msg) {                                                                       // 268
    if (isNaN(v))                                                                                  // 269
      this.ok();                                                                                   // 270
    else                                                                                           // 271
      this.fail({type: "NaN", message: msg});                                                      // 272
  },                                                                                               // 273
                                                                                                   // 274
  include: function (s, v) {                                                                       // 275
    var pass = false;                                                                              // 276
    if (s instanceof Array)                                                                        // 277
      pass = _.any(s, function(it) {return _.isEqual(v, it);});                                    // 278
    else if (typeof s === "object")                                                                // 279
      pass = v in s;                                                                               // 280
    else if (typeof s === "string")                                                                // 281
      if (s.indexOf(v) > -1) {                                                                     // 282
        pass = true;                                                                               // 283
      }                                                                                            // 284
    else                                                                                           // 285
      /* fail -- not something that contains other things */;                                      // 286
    if (pass)                                                                                      // 287
      this.ok();                                                                                   // 288
    else {                                                                                         // 289
      this.fail({type: "include", sequence: s, should_contain_value: v});                          // 290
    }                                                                                              // 291
  },                                                                                               // 292
                                                                                                   // 293
  // XXX should change to lengthOf to match vowsjs                                                 // 294
  length: function (obj, expected_length, msg) {                                                   // 295
    if (obj.length === expected_length)                                                            // 296
      this.ok();                                                                                   // 297
    else                                                                                           // 298
      this.fail({type: "length", expected: expected_length,                                        // 299
                 actual: obj.length, message: msg});                                               // 300
  },                                                                                               // 301
                                                                                                   // 302
  // EXPERIMENTAL way to compare two strings that results in                                       // 303
  // a nicer display in the test runner, e.g. for multiline                                        // 304
  // strings                                                                                       // 305
  _stringEqual: function (actual, expected, message) {                                             // 306
    if (actual !== expected) {                                                                     // 307
      this.fail({type: "string_equal",                                                             // 308
                 message: message,                                                                 // 309
                 expected: expected,                                                               // 310
                 actual: actual});                                                                 // 311
    } else {                                                                                       // 312
      this.ok();                                                                                   // 313
    }                                                                                              // 314
  }                                                                                                // 315
                                                                                                   // 316
                                                                                                   // 317
});                                                                                                // 318
                                                                                                   // 319
/******************************************************************************/                   // 320
/* TestCase                                                                   */                   // 321
/******************************************************************************/                   // 322
                                                                                                   // 323
TestCase = function (name, func) {                                                                 // 324
  var self = this;                                                                                 // 325
  self.name = name;                                                                                // 326
  self.func = func;                                                                                // 327
                                                                                                   // 328
  var nameParts = _.map(name.split(" - "), function(s) {                                           // 329
    return s.replace(/^\s*|\s*$/g, ""); // trim                                                    // 330
  });                                                                                              // 331
  self.shortName = nameParts.pop();                                                                // 332
  nameParts.unshift("tinytest");                                                                   // 333
  self.groupPath = nameParts;                                                                      // 334
};                                                                                                 // 335
                                                                                                   // 336
_.extend(TestCase.prototype, {                                                                     // 337
  // Run the test asynchronously, delivering results via onEvent;                                  // 338
  // then call onComplete() on success, or else onException(e) if the                              // 339
  // test raised (or voluntarily reported) an exception.                                           // 340
  run: function (onEvent, onComplete, onException, stop_at_offset) {                               // 341
    var self = this;                                                                               // 342
                                                                                                   // 343
    var completed = false;                                                                         // 344
    var markComplete = function () {                                                               // 345
      if (completed) {                                                                             // 346
        Meteor._debug("*** Test error -- test '" + self.name +                                     // 347
                      "' returned multiple times.");                                               // 348
        return false;                                                                              // 349
      }                                                                                            // 350
      completed = true;                                                                            // 351
      return true;                                                                                 // 352
    };                                                                                             // 353
                                                                                                   // 354
    var wrappedOnEvent = function (e) {                                                            // 355
      // If this trace prints, it means you ran some test.* function after the                     // 356
      // test finished! Another symptom will be that the test will display as                      // 357
      // "waiting" even when it counts as passed or failed.                                        // 358
      if (completed)                                                                               // 359
        console.trace("event after complete!");                                                    // 360
      return onEvent(e);                                                                           // 361
    };                                                                                             // 362
                                                                                                   // 363
    var results = new TestCaseResults(self, wrappedOnEvent,                                        // 364
                                      function (e) {                                               // 365
                                        if (markComplete())                                        // 366
                                          onException(e);                                          // 367
                                      }, stop_at_offset);                                          // 368
                                                                                                   // 369
    Meteor.defer(function () {                                                                     // 370
      try {                                                                                        // 371
        self.func(results, function () {                                                           // 372
          if (markComplete())                                                                      // 373
            onComplete();                                                                          // 374
        });                                                                                        // 375
      } catch (e) {                                                                                // 376
        if (markComplete())                                                                        // 377
          onException(e);                                                                          // 378
      }                                                                                            // 379
    });                                                                                            // 380
  }                                                                                                // 381
});                                                                                                // 382
                                                                                                   // 383
/******************************************************************************/                   // 384
/* TestManager                                                                */                   // 385
/******************************************************************************/                   // 386
                                                                                                   // 387
TestManager = function () {                                                                        // 388
  var self = this;                                                                                 // 389
  self.tests = {};                                                                                 // 390
  self.ordered_tests = [];                                                                         // 391
  self.testQueue = Meteor.isServer && new Meteor._SynchronousQueue();                              // 392
};                                                                                                 // 393
                                                                                                   // 394
_.extend(TestManager.prototype, {                                                                  // 395
  addCase: function (test) {                                                                       // 396
    var self = this;                                                                               // 397
    if (test.name in self.tests)                                                                   // 398
      throw new Error(                                                                             // 399
        "Every test needs a unique name, but there are two tests named '" +                        // 400
          test.name + "'");                                                                        // 401
    self.tests[test.name] = test;                                                                  // 402
    self.ordered_tests.push(test);                                                                 // 403
  },                                                                                               // 404
                                                                                                   // 405
  createRun: function (onReport, pathPrefix) {                                                     // 406
    var self = this;                                                                               // 407
    return new TestRun(self, onReport, pathPrefix);                                                // 408
  }                                                                                                // 409
});                                                                                                // 410
                                                                                                   // 411
// singleton                                                                                       // 412
TestManager = new TestManager;                                                                     // 413
                                                                                                   // 414
/******************************************************************************/                   // 415
/* TestRun                                                                    */                   // 416
/******************************************************************************/                   // 417
                                                                                                   // 418
TestRun = function (manager, onReport, pathPrefix) {                                               // 419
  var self = this;                                                                                 // 420
  self.manager = manager;                                                                          // 421
  self.onReport = onReport;                                                                        // 422
  self.next_sequence_number = 0;                                                                   // 423
  self._pathPrefix = pathPrefix || [];                                                             // 424
  _.each(self.manager.ordered_tests, function (test) {                                             // 425
    if (self._prefixMatch(test.groupPath))                                                         // 426
      self._report(test);                                                                          // 427
  });                                                                                              // 428
};                                                                                                 // 429
                                                                                                   // 430
_.extend(TestRun.prototype, {                                                                      // 431
                                                                                                   // 432
  _prefixMatch: function (testPath) {                                                              // 433
    var self = this;                                                                               // 434
    for (var i = 0; i < self._pathPrefix.length; i++) {                                            // 435
      if (!testPath[i] || self._pathPrefix[i] !== testPath[i]) {                                   // 436
        return false;                                                                              // 437
      }                                                                                            // 438
    }                                                                                              // 439
    return true;                                                                                   // 440
  },                                                                                               // 441
                                                                                                   // 442
  _runTest: function (test, onComplete, stop_at_offset) {                                          // 443
    var self = this;                                                                               // 444
                                                                                                   // 445
    var startTime = (+new Date);                                                                   // 446
                                                                                                   // 447
    test.run(function (event) {                                                                    // 448
      /* onEvent */                                                                                // 449
      // Ignore result callbacks if the test has already been reported                             // 450
      // as timed out.                                                                             // 451
      if (test.timedOut)                                                                           // 452
        return;                                                                                    // 453
      self._report(test, event);                                                                   // 454
    }, function () {                                                                               // 455
      /* onComplete */                                                                             // 456
      if (test.timedOut)                                                                           // 457
        return;                                                                                    // 458
      var totalTime = (+new Date) - startTime;                                                     // 459
      self._report(test, {type: "finish", timeMs: totalTime});                                     // 460
      onComplete();                                                                                // 461
    }, function (exception) {                                                                      // 462
      /* onException */                                                                            // 463
      if (test.timedOut)                                                                           // 464
        return;                                                                                    // 465
                                                                                                   // 466
      // XXX you want the "name" and "message" fields on the                                       // 467
      // exception, to start with..                                                                // 468
      self._report(test, {                                                                         // 469
        type: "exception",                                                                         // 470
        details: {                                                                                 // 471
          message: exception.message, // XXX empty???                                              // 472
          stack: exception.stack // XXX portability                                                // 473
        }                                                                                          // 474
      });                                                                                          // 475
                                                                                                   // 476
      onComplete();                                                                                // 477
    }, stop_at_offset);                                                                            // 478
  },                                                                                               // 479
                                                                                                   // 480
  // Run a single test.  On the server, ensure that only one test runs                             // 481
  // at a time, even with multiple clients submitting tests.  However,                             // 482
  // time out the test after three minutes to avoid locking up the                                 // 483
  // server if a test fails to complete.                                                           // 484
  //                                                                                               // 485
  _runOne: function (test, onComplete, stop_at_offset) {                                           // 486
    var self = this;                                                                               // 487
                                                                                                   // 488
    if (! self._prefixMatch(test.groupPath)) {                                                     // 489
      onComplete && onComplete();                                                                  // 490
      return;                                                                                      // 491
    }                                                                                              // 492
                                                                                                   // 493
    if (Meteor.isServer) {                                                                         // 494
      // On the server, ensure that only one test runs at a time, even                             // 495
      // with multiple clients.                                                                    // 496
      self.manager.testQueue.queueTask(function () {                                               // 497
        // The future resolves when the test completes or times out.                               // 498
        var future = new Future();                                                                 // 499
        Meteor.setTimeout(                                                                         // 500
          function () {                                                                            // 501
            if (future.isResolved())                                                               // 502
              // If the future has resolved the test has completed.                                // 503
              return;                                                                              // 504
            test.timedOut = true;                                                                  // 505
            self._report(test, {                                                                   // 506
              type: "exception",                                                                   // 507
              details: {                                                                           // 508
                message: "test timed out"                                                          // 509
              }                                                                                    // 510
            });                                                                                    // 511
            future['return']();                                                                    // 512
          },                                                                                       // 513
          3 * 60 * 1000  // 3 minutes                                                              // 514
        );                                                                                         // 515
        self._runTest(test, function () {                                                          // 516
          // The test can complete after it has timed out (it might                                // 517
          // just be slow), so only resolve the future if the test                                 // 518
          // hasn't timed out.                                                                     // 519
          if (! future.isResolved())                                                               // 520
            future['return']();                                                                    // 521
        }, stop_at_offset);                                                                        // 522
        // Wait for the test to complete or time out.                                              // 523
        future.wait();                                                                             // 524
        onComplete && onComplete();                                                                // 525
      });                                                                                          // 526
    } else {                                                                                       // 527
      // client                                                                                    // 528
      self._runTest(test, function () {                                                            // 529
        onComplete && onComplete();                                                                // 530
      }, stop_at_offset);                                                                          // 531
    }                                                                                              // 532
  },                                                                                               // 533
                                                                                                   // 534
  run: function (onComplete) {                                                                     // 535
    var self = this;                                                                               // 536
    var tests = _.clone(self.manager.ordered_tests);                                               // 537
    var reportCurrent = function (name) {                                                          // 538
      if (Meteor.isClient)                                                                         // 539
        Tinytest._onCurrentClientTest(name);                                                       // 540
    };                                                                                             // 541
                                                                                                   // 542
    var runNext = function () {                                                                    // 543
      if (tests.length) {                                                                          // 544
        var t = tests.shift();                                                                     // 545
        reportCurrent(t.name);                                                                     // 546
        self._runOne(t, runNext);                                                                  // 547
      } else {                                                                                     // 548
        reportCurrent(null);                                                                       // 549
        onComplete && onComplete();                                                                // 550
      }                                                                                            // 551
    };                                                                                             // 552
                                                                                                   // 553
    runNext();                                                                                     // 554
  },                                                                                               // 555
                                                                                                   // 556
  // An alternative to run(). Given the 'cookie' attribute of a                                    // 557
  // failure record, try to rerun that particular test up to that                                  // 558
  // failure, and then open the debugger.                                                          // 559
  debug: function (cookie, onComplete) {                                                           // 560
    var self = this;                                                                               // 561
    var test = self.manager.tests[cookie.name];                                                    // 562
    if (!test)                                                                                     // 563
      throw new Error("No such test '" + cookie.name + "'");                                       // 564
    self._runOne(test, onComplete, cookie.offset);                                                 // 565
  },                                                                                               // 566
                                                                                                   // 567
  _report: function (test, event) {                                                                // 568
    var self = this;                                                                               // 569
    if (event)                                                                                     // 570
      var events = [_.extend({sequence: self.next_sequence_number++}, event)];                     // 571
    else                                                                                           // 572
      var events = [];                                                                             // 573
    self.onReport({                                                                                // 574
      groupPath: test.groupPath,                                                                   // 575
      test: test.shortName,                                                                        // 576
      events: events                                                                               // 577
    });                                                                                            // 578
  }                                                                                                // 579
});                                                                                                // 580
                                                                                                   // 581
/******************************************************************************/                   // 582
/* Public API                                                                 */                   // 583
/******************************************************************************/                   // 584
                                                                                                   // 585
Tinytest = {};                                                                                     // 586
                                                                                                   // 587
Tinytest.addAsync = function (name, func) {                                                        // 588
  TestManager.addCase(new TestCase(name, func));                                                   // 589
};                                                                                                 // 590
                                                                                                   // 591
Tinytest.add = function (name, func) {                                                             // 592
  Tinytest.addAsync(name, function (test, onComplete) {                                            // 593
    func(test);                                                                                    // 594
    onComplete();                                                                                  // 595
  });                                                                                              // 596
};                                                                                                 // 597
                                                                                                   // 598
// Run every test, asynchronously. Runs the test in the current                                    // 599
// process only (if called on the server, runs the tests on the                                    // 600
// server, and likewise for the client.) Report results via                                        // 601
// onReport. Call onComplete when it's done.                                                       // 602
//                                                                                                 // 603
Tinytest._runTests = function (onReport, onComplete, pathPrefix) {                                 // 604
  var testRun = TestManager.createRun(onReport, pathPrefix);                                       // 605
  testRun.run(onComplete);                                                                         // 606
};                                                                                                 // 607
                                                                                                   // 608
// Run just one test case, and stop the debugger at a particular                                   // 609
// error, all as indicated by 'cookie', which will have come from a                                // 610
// failure event output by _runTests.                                                              // 611
//                                                                                                 // 612
Tinytest._debugTest = function (cookie, onReport, onComplete) {                                    // 613
  var testRun = TestManager.createRun(onReport);                                                   // 614
  testRun.debug(cookie, onComplete);                                                               // 615
};                                                                                                 // 616
                                                                                                   // 617
// Replace this callback to get called when we run a client test,                                  // 618
// and then called with `null` when the client tests are                                           // 619
// done.  This is used to provide a live display of the current                                    // 620
// running client test on the test results page.                                                   // 621
Tinytest._onCurrentClientTest = function (name) {};                                                // 622
                                                                                                   // 623
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/tinytest/model.js                                                                      //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
Meteor._ServerTestResultsSubscription = 'tinytest_results_subscription';                           // 1
Meteor._ServerTestResultsCollection = 'tinytest_results_collection';                               // 2
                                                                                                   // 3
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                 //
// packages/tinytest/tinytest_server.js                                                            //
//                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                   //
var Fiber = Npm.require('fibers');                                                                 // 1
var handlesForRun = {};                                                                            // 2
var reportsForRun = {};                                                                            // 3
                                                                                                   // 4
Meteor.publish(Meteor._ServerTestResultsSubscription, function (runId) {                           // 5
  check(runId, String);                                                                            // 6
  var self = this;                                                                                 // 7
  if (!_.has(handlesForRun, runId))                                                                // 8
    handlesForRun[runId] = [self];                                                                 // 9
  else                                                                                             // 10
    handlesForRun[runId].push(self);                                                               // 11
  self.onStop(function () {                                                                        // 12
    handlesForRun[runId] = _.without(handlesForRun[runId], self);                                  // 13
  });                                                                                              // 14
  if (_.has(reportsForRun, runId)) {                                                               // 15
    self.added(Meteor._ServerTestResultsCollection, runId,                                         // 16
               reportsForRun[runId]);                                                              // 17
  } else {                                                                                         // 18
    self.added(Meteor._ServerTestResultsCollection, runId, {});                                    // 19
  }                                                                                                // 20
  self.ready();                                                                                    // 21
});                                                                                                // 22
                                                                                                   // 23
Meteor.methods({                                                                                   // 24
  'tinytest/run': function (runId, pathPrefix) {                                                   // 25
    check(runId, String);                                                                          // 26
    check(pathPrefix, Match.Optional([String]));                                                   // 27
    this.unblock();                                                                                // 28
                                                                                                   // 29
    reportsForRun[runId] = {};                                                                     // 30
                                                                                                   // 31
    var addReport = function (key, report) {                                                       // 32
      var fields = {};                                                                             // 33
      fields[key] = report;                                                                        // 34
      _.each(handlesForRun[runId], function (handle) {                                             // 35
        handle.changed(Meteor._ServerTestResultsCollection, runId, fields);                        // 36
      });                                                                                          // 37
      // Save for future subscriptions.                                                            // 38
      reportsForRun[runId][key] = report;                                                          // 39
    };                                                                                             // 40
                                                                                                   // 41
    var onReport = function (report) {                                                             // 42
      if (! Fiber.current) {                                                                       // 43
        Meteor._debug("Trying to report a test not in a fiber! "+                                  // 44
                      "You probably forgot to wrap a callback in bindEnvironment.");               // 45
        console.trace();                                                                           // 46
      }                                                                                            // 47
      var dummyKey = Random.id();                                                                  // 48
      addReport(dummyKey, report);                                                                 // 49
    };                                                                                             // 50
                                                                                                   // 51
    var onComplete = function() {                                                                  // 52
      // We send an object for current and future compatibility,                                   // 53
      // though we could get away with just sending { complete: true }                             // 54
      var report = { done: true };                                                                 // 55
      var key = 'complete';                                                                        // 56
      addReport(key, report);                                                                      // 57
    };                                                                                             // 58
                                                                                                   // 59
    Tinytest._runTests(onReport, onComplete, pathPrefix);                                          // 60
  },                                                                                               // 61
  'tinytest/clearResults': function (runId) {                                                      // 62
    check(runId, String);                                                                          // 63
    _.each(handlesForRun[runId], function (handle) {                                               // 64
      // XXX this doesn't actually notify the client that it has been                              // 65
      // unsubscribed.                                                                             // 66
      handle.stop();                                                                               // 67
    });                                                                                            // 68
    delete handlesForRun[runId];                                                                   // 69
    delete reportsForRun[runId];                                                                   // 70
  }                                                                                                // 71
});                                                                                                // 72
                                                                                                   // 73
/////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

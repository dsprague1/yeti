(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jquery-history/history.adapter.jquery.js                                                                 //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/**                                                                                                                  // 1
 * History.js jQuery Adapter                                                                                         // 2
 * @author Benjamin Arthur Lupton <contact@balupton.com>                                                             // 3
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>                                                // 4
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>                                               // 5
 */                                                                                                                  // 6
                                                                                                                     // 7
// Closure                                                                                                           // 8
(function(window,undefined){                                                                                         // 9
	"use strict";                                                                                                       // 10
                                                                                                                     // 11
	// Localise Globals                                                                                                 // 12
	var                                                                                                                 // 13
		History = window.History = window.History||{},                                                                     // 14
		jQuery = window.jQuery;                                                                                            // 15
                                                                                                                     // 16
	// Check Existence                                                                                                  // 17
	if ( typeof History.Adapter !== 'undefined' ) {                                                                     // 18
		throw new Error('History.js Adapter has already been loaded...');                                                  // 19
	}                                                                                                                   // 20
                                                                                                                     // 21
	// Add the Adapter                                                                                                  // 22
	History.Adapter = {                                                                                                 // 23
		/**                                                                                                                // 24
		 * History.Adapter.bind(el,event,callback)                                                                         // 25
		 * @param {Element|string} el                                                                                      // 26
		 * @param {string} event - custom and standard events                                                              // 27
		 * @param {function} callback                                                                                      // 28
		 * @return {void}                                                                                                  // 29
		 */                                                                                                                // 30
		bind: function(el,event,callback){                                                                                 // 31
			jQuery(el).bind(event,callback);                                                                                  // 32
		},                                                                                                                 // 33
                                                                                                                     // 34
		/**                                                                                                                // 35
		 * History.Adapter.trigger(el,event)                                                                               // 36
		 * @param {Element|string} el                                                                                      // 37
		 * @param {string} event - custom and standard events                                                              // 38
		 * @param {Object=} extra - a object of extra event data (optional)                                                // 39
		 * @return {void}                                                                                                  // 40
		 */                                                                                                                // 41
		trigger: function(el,event,extra){                                                                                 // 42
			jQuery(el).trigger(event,extra);                                                                                  // 43
		},                                                                                                                 // 44
                                                                                                                     // 45
		/**                                                                                                                // 46
		 * History.Adapter.extractEventData(key,event,extra)                                                               // 47
		 * @param {string} key - key for the event data to extract                                                         // 48
		 * @param {string} event - custom and standard events                                                              // 49
		 * @param {Object=} extra - a object of extra event data (optional)                                                // 50
		 * @return {mixed}                                                                                                 // 51
		 */                                                                                                                // 52
		extractEventData: function(key,event,extra){                                                                       // 53
			// jQuery Native then jQuery Custom                                                                               // 54
			var result = (event && event.originalEvent && event.originalEvent[key]) || (extra && extra[key]) || undefined;    // 55
                                                                                                                     // 56
			// Return                                                                                                         // 57
			return result;                                                                                                    // 58
		},                                                                                                                 // 59
                                                                                                                     // 60
		/**                                                                                                                // 61
		 * History.Adapter.onDomLoad(callback)                                                                             // 62
		 * @param {function} callback                                                                                      // 63
		 * @return {void}                                                                                                  // 64
		 */                                                                                                                // 65
		onDomLoad: function(callback) {                                                                                    // 66
			jQuery(callback);                                                                                                 // 67
		}                                                                                                                  // 68
	};                                                                                                                  // 69
                                                                                                                     // 70
	// Try and Initialise History                                                                                       // 71
	if ( typeof History.init !== 'undefined' ) {                                                                        // 72
		History.init();                                                                                                    // 73
	}                                                                                                                   // 74
                                                                                                                     // 75
})(window);                                                                                                          // 76
                                                                                                                     // 77
                                                                                                                     // 78
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jquery-history/history.html4.js                                                                          //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/**                                                                                                                  // 1
 * History.js HTML4 Support                                                                                          // 2
 * Depends on the HTML5 Support                                                                                      // 3
 * @author Benjamin Arthur Lupton <contact@balupton.com>                                                             // 4
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>                                                // 5
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>                                               // 6
 */                                                                                                                  // 7
                                                                                                                     // 8
(function(window,undefined){                                                                                         // 9
	"use strict";                                                                                                       // 10
                                                                                                                     // 11
	// ========================================================================                                         // 12
	// Initialise                                                                                                       // 13
                                                                                                                     // 14
	// Localise Globals                                                                                                 // 15
	var                                                                                                                 // 16
		document = window.document, // Make sure we are using the correct document                                         // 17
		setTimeout = window.setTimeout||setTimeout,                                                                        // 18
		clearTimeout = window.clearTimeout||clearTimeout,                                                                  // 19
		setInterval = window.setInterval||setInterval,                                                                     // 20
		History = window.History = window.History||{}; // Public History Object                                            // 21
                                                                                                                     // 22
	// Check Existence                                                                                                  // 23
	if ( typeof History.initHtml4 !== 'undefined' ) {                                                                   // 24
		throw new Error('History.js HTML4 Support has already been loaded...');                                            // 25
	}                                                                                                                   // 26
                                                                                                                     // 27
                                                                                                                     // 28
	// ========================================================================                                         // 29
	// Initialise HTML4 Support                                                                                         // 30
                                                                                                                     // 31
	// Initialise HTML4 Support                                                                                         // 32
	History.initHtml4 = function(){                                                                                     // 33
		// Initialise                                                                                                      // 34
		if ( typeof History.initHtml4.initialized !== 'undefined' ) {                                                      // 35
			// Already Loaded                                                                                                 // 36
			return false;                                                                                                     // 37
		}                                                                                                                  // 38
		else {                                                                                                             // 39
			History.initHtml4.initialized = true;                                                                             // 40
		}                                                                                                                  // 41
                                                                                                                     // 42
                                                                                                                     // 43
		// ====================================================================                                            // 44
		// Properties                                                                                                      // 45
                                                                                                                     // 46
		/**                                                                                                                // 47
		 * History.enabled                                                                                                 // 48
		 * Is History enabled?                                                                                             // 49
		 */                                                                                                                // 50
		History.enabled = true;                                                                                            // 51
                                                                                                                     // 52
                                                                                                                     // 53
		// ====================================================================                                            // 54
		// Hash Storage                                                                                                    // 55
                                                                                                                     // 56
		/**                                                                                                                // 57
		 * History.savedHashes                                                                                             // 58
		 * Store the hashes in an array                                                                                    // 59
		 */                                                                                                                // 60
		History.savedHashes = [];                                                                                          // 61
                                                                                                                     // 62
		/**                                                                                                                // 63
		 * History.isLastHash(newHash)                                                                                     // 64
		 * Checks if the hash is the last hash                                                                             // 65
		 * @param {string} newHash                                                                                         // 66
		 * @return {boolean} true                                                                                          // 67
		 */                                                                                                                // 68
		History.isLastHash = function(newHash){                                                                            // 69
			// Prepare                                                                                                        // 70
			var oldHash = History.getHashByIndex(),                                                                           // 71
				isLast;                                                                                                          // 72
                                                                                                                     // 73
			// Check                                                                                                          // 74
			isLast = newHash === oldHash;                                                                                     // 75
                                                                                                                     // 76
			// Return isLast                                                                                                  // 77
			return isLast;                                                                                                    // 78
		};                                                                                                                 // 79
                                                                                                                     // 80
		/**                                                                                                                // 81
		 * History.saveHash(newHash)                                                                                       // 82
		 * Push a Hash                                                                                                     // 83
		 * @param {string} newHash                                                                                         // 84
		 * @return {boolean} true                                                                                          // 85
		 */                                                                                                                // 86
		History.saveHash = function(newHash){                                                                              // 87
			// Check Hash                                                                                                     // 88
			if ( History.isLastHash(newHash) ) {                                                                              // 89
				return false;                                                                                                    // 90
			}                                                                                                                 // 91
                                                                                                                     // 92
			// Push the Hash                                                                                                  // 93
			History.savedHashes.push(newHash);                                                                                // 94
                                                                                                                     // 95
			// Return true                                                                                                    // 96
			return true;                                                                                                      // 97
		};                                                                                                                 // 98
                                                                                                                     // 99
		/**                                                                                                                // 100
		 * History.getHashByIndex()                                                                                        // 101
		 * Gets a hash by the index                                                                                        // 102
		 * @param {integer} index                                                                                          // 103
		 * @return {string}                                                                                                // 104
		 */                                                                                                                // 105
		History.getHashByIndex = function(index){                                                                          // 106
			// Prepare                                                                                                        // 107
			var hash = null;                                                                                                  // 108
                                                                                                                     // 109
			// Handle                                                                                                         // 110
			if ( typeof index === 'undefined' ) {                                                                             // 111
				// Get the last inserted                                                                                         // 112
				hash = History.savedHashes[History.savedHashes.length-1];                                                        // 113
			}                                                                                                                 // 114
			else if ( index < 0 ) {                                                                                           // 115
				// Get from the end                                                                                              // 116
				hash = History.savedHashes[History.savedHashes.length+index];                                                    // 117
			}                                                                                                                 // 118
			else {                                                                                                            // 119
				// Get from the beginning                                                                                        // 120
				hash = History.savedHashes[index];                                                                               // 121
			}                                                                                                                 // 122
                                                                                                                     // 123
			// Return hash                                                                                                    // 124
			return hash;                                                                                                      // 125
		};                                                                                                                 // 126
                                                                                                                     // 127
                                                                                                                     // 128
		// ====================================================================                                            // 129
		// Discarded States                                                                                                // 130
                                                                                                                     // 131
		/**                                                                                                                // 132
		 * History.discardedHashes                                                                                         // 133
		 * A hashed array of discarded hashes                                                                              // 134
		 */                                                                                                                // 135
		History.discardedHashes = {};                                                                                      // 136
                                                                                                                     // 137
		/**                                                                                                                // 138
		 * History.discardedStates                                                                                         // 139
		 * A hashed array of discarded states                                                                              // 140
		 */                                                                                                                // 141
		History.discardedStates = {};                                                                                      // 142
                                                                                                                     // 143
		/**                                                                                                                // 144
		 * History.discardState(State)                                                                                     // 145
		 * Discards the state by ignoring it through History                                                               // 146
		 * @param {object} State                                                                                           // 147
		 * @return {true}                                                                                                  // 148
		 */                                                                                                                // 149
		History.discardState = function(discardedState,forwardState,backState){                                            // 150
			//History.debug('History.discardState', arguments);                                                               // 151
			// Prepare                                                                                                        // 152
			var discardedStateHash = History.getHashByState(discardedState),                                                  // 153
				discardObject;                                                                                                   // 154
                                                                                                                     // 155
			// Create Discard Object                                                                                          // 156
			discardObject = {                                                                                                 // 157
				'discardedState': discardedState,                                                                                // 158
				'backState': backState,                                                                                          // 159
				'forwardState': forwardState                                                                                     // 160
			};                                                                                                                // 161
                                                                                                                     // 162
			// Add to DiscardedStates                                                                                         // 163
			History.discardedStates[discardedStateHash] = discardObject;                                                      // 164
                                                                                                                     // 165
			// Return true                                                                                                    // 166
			return true;                                                                                                      // 167
		};                                                                                                                 // 168
                                                                                                                     // 169
		/**                                                                                                                // 170
		 * History.discardHash(hash)                                                                                       // 171
		 * Discards the hash by ignoring it through History                                                                // 172
		 * @param {string} hash                                                                                            // 173
		 * @return {true}                                                                                                  // 174
		 */                                                                                                                // 175
		History.discardHash = function(discardedHash,forwardState,backState){                                              // 176
			//History.debug('History.discardState', arguments);                                                               // 177
			// Create Discard Object                                                                                          // 178
			var discardObject = {                                                                                             // 179
				'discardedHash': discardedHash,                                                                                  // 180
				'backState': backState,                                                                                          // 181
				'forwardState': forwardState                                                                                     // 182
			};                                                                                                                // 183
                                                                                                                     // 184
			// Add to discardedHash                                                                                           // 185
			History.discardedHashes[discardedHash] = discardObject;                                                           // 186
                                                                                                                     // 187
			// Return true                                                                                                    // 188
			return true;                                                                                                      // 189
		};                                                                                                                 // 190
                                                                                                                     // 191
		/**                                                                                                                // 192
		 * History.discardState(State)                                                                                     // 193
		 * Checks to see if the state is discarded                                                                         // 194
		 * @param {object} State                                                                                           // 195
		 * @return {bool}                                                                                                  // 196
		 */                                                                                                                // 197
		History.discardedState = function(State){                                                                          // 198
			// Prepare                                                                                                        // 199
			var StateHash = History.getHashByState(State),                                                                    // 200
				discarded;                                                                                                       // 201
                                                                                                                     // 202
			// Check                                                                                                          // 203
			discarded = History.discardedStates[StateHash]||false;                                                            // 204
                                                                                                                     // 205
			// Return true                                                                                                    // 206
			return discarded;                                                                                                 // 207
		};                                                                                                                 // 208
                                                                                                                     // 209
		/**                                                                                                                // 210
		 * History.discardedHash(hash)                                                                                     // 211
		 * Checks to see if the state is discarded                                                                         // 212
		 * @param {string} State                                                                                           // 213
		 * @return {bool}                                                                                                  // 214
		 */                                                                                                                // 215
		History.discardedHash = function(hash){                                                                            // 216
			// Check                                                                                                          // 217
			var discarded = History.discardedHashes[hash]||false;                                                             // 218
                                                                                                                     // 219
			// Return true                                                                                                    // 220
			return discarded;                                                                                                 // 221
		};                                                                                                                 // 222
                                                                                                                     // 223
		/**                                                                                                                // 224
		 * History.recycleState(State)                                                                                     // 225
		 * Allows a discarded state to be used again                                                                       // 226
		 * @param {object} data                                                                                            // 227
		 * @param {string} title                                                                                           // 228
		 * @param {string} url                                                                                             // 229
		 * @return {true}                                                                                                  // 230
		 */                                                                                                                // 231
		History.recycleState = function(State){                                                                            // 232
			//History.debug('History.recycleState', arguments);                                                               // 233
			// Prepare                                                                                                        // 234
			var StateHash = History.getHashByState(State);                                                                    // 235
                                                                                                                     // 236
			// Remove from DiscardedStates                                                                                    // 237
			if ( History.discardedState(State) ) {                                                                            // 238
				delete History.discardedStates[StateHash];                                                                       // 239
			}                                                                                                                 // 240
                                                                                                                     // 241
			// Return true                                                                                                    // 242
			return true;                                                                                                      // 243
		};                                                                                                                 // 244
                                                                                                                     // 245
                                                                                                                     // 246
		// ====================================================================                                            // 247
		// HTML4 HashChange Support                                                                                        // 248
                                                                                                                     // 249
		if ( History.emulated.hashChange ) {                                                                               // 250
			/*                                                                                                                // 251
			 * We must emulate the HTML4 HashChange Support by manually checking for hash changes                             // 252
			 */                                                                                                               // 253
                                                                                                                     // 254
			/**                                                                                                               // 255
			 * History.hashChangeInit()                                                                                       // 256
			 * Init the HashChange Emulation                                                                                  // 257
			 */                                                                                                               // 258
			History.hashChangeInit = function(){                                                                              // 259
				// Define our Checker Function                                                                                   // 260
				History.checkerFunction = null;                                                                                  // 261
                                                                                                                     // 262
				// Define some variables that will help in our checker function                                                  // 263
				var lastDocumentHash = '',                                                                                       // 264
					iframeId, iframe,                                                                                               // 265
					lastIframeHash, checkerRunning;                                                                                 // 266
                                                                                                                     // 267
				// Handle depending on the browser                                                                               // 268
				if ( History.isInternetExplorer() ) {                                                                            // 269
					// IE6 and IE7                                                                                                  // 270
					// We need to use an iframe to emulate the back and forward buttons                                             // 271
                                                                                                                     // 272
					// Create iFrame                                                                                                // 273
					iframeId = 'historyjs-iframe';                                                                                  // 274
					iframe = document.createElement('iframe');                                                                      // 275
                                                                                                                     // 276
					// Adjust iFarme                                                                                                // 277
					iframe.setAttribute('id', iframeId);                                                                            // 278
					iframe.style.display = 'none';                                                                                  // 279
                                                                                                                     // 280
					// Append iFrame                                                                                                // 281
					document.body.appendChild(iframe);                                                                              // 282
                                                                                                                     // 283
					// Create initial history entry                                                                                 // 284
					iframe.contentWindow.document.open();                                                                           // 285
					iframe.contentWindow.document.close();                                                                          // 286
                                                                                                                     // 287
					// Define some variables that will help in our checker function                                                 // 288
					lastIframeHash = '';                                                                                            // 289
					checkerRunning = false;                                                                                         // 290
                                                                                                                     // 291
					// Define the checker function                                                                                  // 292
					History.checkerFunction = function(){                                                                           // 293
						// Check Running                                                                                               // 294
						if ( checkerRunning ) {                                                                                        // 295
							return false;                                                                                                 // 296
						}                                                                                                              // 297
                                                                                                                     // 298
						// Update Running                                                                                              // 299
						checkerRunning = true;                                                                                         // 300
                                                                                                                     // 301
						// Fetch                                                                                                       // 302
						var documentHash = History.getHash()||'',                                                                      // 303
							iframeHash = History.unescapeHash(iframe.contentWindow.document.location.hash)||'';                           // 304
                                                                                                                     // 305
						// The Document Hash has changed (application caused)                                                          // 306
						if ( documentHash !== lastDocumentHash ) {                                                                     // 307
							// Equalise                                                                                                   // 308
							lastDocumentHash = documentHash;                                                                              // 309
                                                                                                                     // 310
							// Create a history entry in the iframe                                                                       // 311
							if ( iframeHash !== documentHash ) {                                                                          // 312
								//History.debug('hashchange.checker: iframe hash change', 'documentHash (new):', documentHash, 'iframeHash (old):', iframeHash);
                                                                                                                     // 314
								// Equalise                                                                                                  // 315
								lastIframeHash = iframeHash = documentHash;                                                                  // 316
                                                                                                                     // 317
								// Create History Entry                                                                                      // 318
								iframe.contentWindow.document.open();                                                                        // 319
								iframe.contentWindow.document.close();                                                                       // 320
                                                                                                                     // 321
								// Update the iframe's hash                                                                                  // 322
								iframe.contentWindow.document.location.hash = History.escapeHash(documentHash);                              // 323
							}                                                                                                             // 324
                                                                                                                     // 325
							// Trigger Hashchange Event                                                                                   // 326
							History.Adapter.trigger(window,'hashchange');                                                                 // 327
						}                                                                                                              // 328
                                                                                                                     // 329
						// The iFrame Hash has changed (back button caused)                                                            // 330
						else if ( iframeHash !== lastIframeHash ) {                                                                    // 331
							//History.debug('hashchange.checker: iframe hash out of sync', 'iframeHash (new):', iframeHash, 'documentHash (old):', documentHash);
                                                                                                                     // 333
							// Equalise                                                                                                   // 334
							lastIframeHash = iframeHash;                                                                                  // 335
                                                                                                                     // 336
							// Update the Hash                                                                                            // 337
							History.setHash(iframeHash,false);                                                                            // 338
						}                                                                                                              // 339
                                                                                                                     // 340
						// Reset Running                                                                                               // 341
						checkerRunning = false;                                                                                        // 342
                                                                                                                     // 343
						// Return true                                                                                                 // 344
						return true;                                                                                                   // 345
					};                                                                                                              // 346
				}                                                                                                                // 347
				else {                                                                                                           // 348
					// We are not IE                                                                                                // 349
					// Firefox 1 or 2, Opera                                                                                        // 350
                                                                                                                     // 351
					// Define the checker function                                                                                  // 352
					History.checkerFunction = function(){                                                                           // 353
						// Prepare                                                                                                     // 354
						var documentHash = History.getHash();                                                                          // 355
                                                                                                                     // 356
						// The Document Hash has changed (application caused)                                                          // 357
						if ( documentHash !== lastDocumentHash ) {                                                                     // 358
							// Equalise                                                                                                   // 359
							lastDocumentHash = documentHash;                                                                              // 360
                                                                                                                     // 361
							// Trigger Hashchange Event                                                                                   // 362
							History.Adapter.trigger(window,'hashchange');                                                                 // 363
						}                                                                                                              // 364
                                                                                                                     // 365
						// Return true                                                                                                 // 366
						return true;                                                                                                   // 367
					};                                                                                                              // 368
				}                                                                                                                // 369
                                                                                                                     // 370
				// Apply the checker function                                                                                    // 371
				History.intervalList.push(setInterval(History.checkerFunction, History.options.hashChangeInterval));             // 372
                                                                                                                     // 373
				// Done                                                                                                          // 374
				return true;                                                                                                     // 375
			}; // History.hashChangeInit                                                                                      // 376
                                                                                                                     // 377
			// Bind hashChangeInit                                                                                            // 378
			History.Adapter.onDomLoad(History.hashChangeInit);                                                                // 379
                                                                                                                     // 380
		} // History.emulated.hashChange                                                                                   // 381
                                                                                                                     // 382
                                                                                                                     // 383
		// ====================================================================                                            // 384
		// HTML5 State Support                                                                                             // 385
                                                                                                                     // 386
		// Non-Native pushState Implementation                                                                             // 387
		if ( History.emulated.pushState ) {                                                                                // 388
			/*                                                                                                                // 389
			 * We must emulate the HTML5 State Management by using HTML4 HashChange                                           // 390
			 */                                                                                                               // 391
                                                                                                                     // 392
			/**                                                                                                               // 393
			 * History.onHashChange(event)                                                                                    // 394
			 * Trigger HTML5's window.onpopstate via HTML4 HashChange Support                                                 // 395
			 */                                                                                                               // 396
			History.onHashChange = function(event){                                                                           // 397
				//History.debug('History.onHashChange', arguments);                                                              // 398
                                                                                                                     // 399
				// Prepare                                                                                                       // 400
				var currentUrl = ((event && event.newURL) || document.location.href),                                            // 401
					currentHash = History.getHashByUrl(currentUrl),                                                                 // 402
					currentState = null,                                                                                            // 403
					currentStateHash = null,                                                                                        // 404
					currentStateHashExits = null,                                                                                   // 405
					discardObject;                                                                                                  // 406
                                                                                                                     // 407
				// Check if we are the same state                                                                                // 408
				if ( History.isLastHash(currentHash) ) {                                                                         // 409
					// There has been no change (just the page's hash has finally propagated)                                       // 410
					//History.debug('History.onHashChange: no change');                                                             // 411
					History.busy(false);                                                                                            // 412
					return false;                                                                                                   // 413
				}                                                                                                                // 414
                                                                                                                     // 415
				// Reset the double check                                                                                        // 416
				History.doubleCheckComplete();                                                                                   // 417
                                                                                                                     // 418
				// Store our location for use in detecting back/forward direction                                                // 419
				History.saveHash(currentHash);                                                                                   // 420
                                                                                                                     // 421
				// Expand Hash                                                                                                   // 422
				if ( currentHash && History.isTraditionalAnchor(currentHash) ) {                                                 // 423
					//History.debug('History.onHashChange: traditional anchor', currentHash);                                       // 424
					// Traditional Anchor Hash                                                                                      // 425
					History.Adapter.trigger(window,'anchorchange');                                                                 // 426
					History.busy(false);                                                                                            // 427
					return false;                                                                                                   // 428
				}                                                                                                                // 429
                                                                                                                     // 430
				// Create State                                                                                                  // 431
				currentState = History.extractState(History.getFullUrl(currentHash||document.location.href,false),true);         // 432
                                                                                                                     // 433
				// Check if we are the same state                                                                                // 434
				if ( History.isLastSavedState(currentState) ) {                                                                  // 435
					//History.debug('History.onHashChange: no change');                                                             // 436
					// There has been no change (just the page's hash has finally propagated)                                       // 437
					History.busy(false);                                                                                            // 438
					return false;                                                                                                   // 439
				}                                                                                                                // 440
                                                                                                                     // 441
				// Create the state Hash                                                                                         // 442
				currentStateHash = History.getHashByState(currentState);                                                         // 443
                                                                                                                     // 444
				// Check if we are DiscardedState                                                                                // 445
				discardObject = History.discardedState(currentState);                                                            // 446
				if ( discardObject ) {                                                                                           // 447
					// Ignore this state as it has been discarded and go back to the state before it                                // 448
					if ( History.getHashByIndex(-2) === History.getHashByState(discardObject.forwardState) ) {                      // 449
						// We are going backwards                                                                                      // 450
						//History.debug('History.onHashChange: go backwards');                                                         // 451
						History.back(false);                                                                                           // 452
					} else {                                                                                                        // 453
						// We are going forwards                                                                                       // 454
						//History.debug('History.onHashChange: go forwards');                                                          // 455
						History.forward(false);                                                                                        // 456
					}                                                                                                               // 457
					return false;                                                                                                   // 458
				}                                                                                                                // 459
                                                                                                                     // 460
				// Push the new HTML5 State                                                                                      // 461
				//History.debug('History.onHashChange: success hashchange');                                                     // 462
				History.pushState(currentState.data,currentState.title,currentState.url,false);                                  // 463
                                                                                                                     // 464
				// End onHashChange closure                                                                                      // 465
				return true;                                                                                                     // 466
			};                                                                                                                // 467
			History.Adapter.bind(window,'hashchange',History.onHashChange);                                                   // 468
                                                                                                                     // 469
			/**                                                                                                               // 470
			 * History.pushState(data,title,url)                                                                              // 471
			 * Add a new State to the history object, become it, and trigger onpopstate                                       // 472
			 * We have to trigger for HTML4 compatibility                                                                     // 473
			 * @param {object} data                                                                                           // 474
			 * @param {string} title                                                                                          // 475
			 * @param {string} url                                                                                            // 476
			 * @return {true}                                                                                                 // 477
			 */                                                                                                               // 478
			History.pushState = function(data,title,url,queue){                                                               // 479
				//History.debug('History.pushState: called', arguments);                                                         // 480
                                                                                                                     // 481
				// Check the State                                                                                               // 482
				if ( History.getHashByUrl(url) ) {                                                                               // 483
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');             // 484
				}                                                                                                                // 485
                                                                                                                     // 486
				// Handle Queueing                                                                                               // 487
				if ( queue !== false && History.busy() ) {                                                                       // 488
					// Wait + Push to Queue                                                                                         // 489
					//History.debug('History.pushState: we must wait', arguments);                                                  // 490
					History.pushQueue({                                                                                             // 491
						scope: History,                                                                                                // 492
						callback: History.pushState,                                                                                   // 493
						args: arguments,                                                                                               // 494
						queue: queue                                                                                                   // 495
					});                                                                                                             // 496
					return false;                                                                                                   // 497
				}                                                                                                                // 498
                                                                                                                     // 499
				// Make Busy                                                                                                     // 500
				History.busy(true);                                                                                              // 501
                                                                                                                     // 502
				// Fetch the State Object                                                                                        // 503
				var newState = History.createStateObject(data,title,url),                                                        // 504
					newStateHash = History.getHashByState(newState),                                                                // 505
					oldState = History.getState(false),                                                                             // 506
					oldStateHash = History.getHashByState(oldState),                                                                // 507
					html4Hash = History.getHash();                                                                                  // 508
                                                                                                                     // 509
				// Store the newState                                                                                            // 510
				History.storeState(newState);                                                                                    // 511
				History.expectedStateId = newState.id;                                                                           // 512
                                                                                                                     // 513
				// Recycle the State                                                                                             // 514
				History.recycleState(newState);                                                                                  // 515
                                                                                                                     // 516
				// Force update of the title                                                                                     // 517
				History.setTitle(newState);                                                                                      // 518
                                                                                                                     // 519
				// Check if we are the same State                                                                                // 520
				if ( newStateHash === oldStateHash ) {                                                                           // 521
					//History.debug('History.pushState: no change', newStateHash);                                                  // 522
					History.busy(false);                                                                                            // 523
					return false;                                                                                                   // 524
				}                                                                                                                // 525
                                                                                                                     // 526
				// Update HTML4 Hash                                                                                             // 527
				if ( newStateHash !== html4Hash && newStateHash !== History.getShortUrl(document.location.href) ) {              // 528
					//History.debug('History.pushState: update hash', newStateHash, html4Hash);                                     // 529
					History.setHash(newStateHash,false);                                                                            // 530
					return false;                                                                                                   // 531
				}                                                                                                                // 532
                                                                                                                     // 533
				// Update HTML5 State                                                                                            // 534
				History.saveState(newState);                                                                                     // 535
                                                                                                                     // 536
				// Fire HTML5 Event                                                                                              // 537
				//History.debug('History.pushState: trigger popstate');                                                          // 538
				History.Adapter.trigger(window,'statechange');                                                                   // 539
				History.busy(false);                                                                                             // 540
                                                                                                                     // 541
				// End pushState closure                                                                                         // 542
				return true;                                                                                                     // 543
			};                                                                                                                // 544
                                                                                                                     // 545
			/**                                                                                                               // 546
			 * History.replaceState(data,title,url)                                                                           // 547
			 * Replace the State and trigger onpopstate                                                                       // 548
			 * We have to trigger for HTML4 compatibility                                                                     // 549
			 * @param {object} data                                                                                           // 550
			 * @param {string} title                                                                                          // 551
			 * @param {string} url                                                                                            // 552
			 * @return {true}                                                                                                 // 553
			 */                                                                                                               // 554
			History.replaceState = function(data,title,url,queue){                                                            // 555
				//History.debug('History.replaceState: called', arguments);                                                      // 556
                                                                                                                     // 557
				// Check the State                                                                                               // 558
				if ( History.getHashByUrl(url) ) {                                                                               // 559
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');             // 560
				}                                                                                                                // 561
                                                                                                                     // 562
				// Handle Queueing                                                                                               // 563
				if ( queue !== false && History.busy() ) {                                                                       // 564
					// Wait + Push to Queue                                                                                         // 565
					//History.debug('History.replaceState: we must wait', arguments);                                               // 566
					History.pushQueue({                                                                                             // 567
						scope: History,                                                                                                // 568
						callback: History.replaceState,                                                                                // 569
						args: arguments,                                                                                               // 570
						queue: queue                                                                                                   // 571
					});                                                                                                             // 572
					return false;                                                                                                   // 573
				}                                                                                                                // 574
                                                                                                                     // 575
				// Make Busy                                                                                                     // 576
				History.busy(true);                                                                                              // 577
                                                                                                                     // 578
				// Fetch the State Objects                                                                                       // 579
				var newState        = History.createStateObject(data,title,url),                                                 // 580
					oldState        = History.getState(false),                                                                      // 581
					previousState   = History.getStateByIndex(-2);                                                                  // 582
                                                                                                                     // 583
				// Discard Old State                                                                                             // 584
				History.discardState(oldState,newState,previousState);                                                           // 585
                                                                                                                     // 586
				// Alias to PushState                                                                                            // 587
				History.pushState(newState.data,newState.title,newState.url,false);                                              // 588
                                                                                                                     // 589
				// End replaceState closure                                                                                      // 590
				return true;                                                                                                     // 591
			};                                                                                                                // 592
                                                                                                                     // 593
		} // History.emulated.pushState                                                                                    // 594
                                                                                                                     // 595
                                                                                                                     // 596
                                                                                                                     // 597
		// ====================================================================                                            // 598
		// Initialise                                                                                                      // 599
                                                                                                                     // 600
		// Non-Native pushState Implementation                                                                             // 601
		if ( History.emulated.pushState ) {                                                                                // 602
			/**                                                                                                               // 603
			 * Ensure initial state is handled correctly                                                                      // 604
			 */                                                                                                               // 605
			if ( History.getHash() && !History.emulated.hashChange ) {                                                        // 606
				History.Adapter.onDomLoad(function(){                                                                            // 607
					History.Adapter.trigger(window,'hashchange');                                                                   // 608
				});                                                                                                              // 609
			}                                                                                                                 // 610
                                                                                                                     // 611
		} // History.emulated.pushState                                                                                    // 612
                                                                                                                     // 613
	}; // History.initHtml4                                                                                             // 614
                                                                                                                     // 615
	// Try and Initialise History                                                                                       // 616
	if ( typeof History.init !== 'undefined' ) {                                                                        // 617
		History.init();                                                                                                    // 618
	}                                                                                                                   // 619
                                                                                                                     // 620
})(window);                                                                                                          // 621
                                                                                                                     // 622
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                   //
// packages/jquery-history/history.js                                                                                //
//                                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                     //
/**                                                                                                                  // 1
 * History.js Core                                                                                                   // 2
 * @author Benjamin Arthur Lupton <contact@balupton.com>                                                             // 3
 * @copyright 2010-2011 Benjamin Arthur Lupton <contact@balupton.com>                                                // 4
 * @license New BSD License <http://creativecommons.org/licenses/BSD/>                                               // 5
 */                                                                                                                  // 6
                                                                                                                     // 7
(function(window,undefined){                                                                                         // 8
	"use strict";                                                                                                       // 9
                                                                                                                     // 10
	// ========================================================================                                         // 11
	// Initialise                                                                                                       // 12
                                                                                                                     // 13
	// Localise Globals                                                                                                 // 14
	var                                                                                                                 // 15
		console = window.console||undefined, // Prevent a JSLint complain                                                  // 16
		document = window.document, // Make sure we are using the correct document                                         // 17
		navigator = window.navigator, // Make sure we are using the correct navigator                                      // 18
		sessionStorage = window.sessionStorage||false, // sessionStorage                                                   // 19
		setTimeout = window.setTimeout,                                                                                    // 20
		clearTimeout = window.clearTimeout,                                                                                // 21
		setInterval = window.setInterval,                                                                                  // 22
		clearInterval = window.clearInterval,                                                                              // 23
		JSON = window.JSON,                                                                                                // 24
		alert = window.alert,                                                                                              // 25
		History = window.History = window.History||{}, // Public History Object                                            // 26
		history = window.history; // Old History Object                                                                    // 27
                                                                                                                     // 28
	// MooTools Compatibility                                                                                           // 29
	JSON.stringify = JSON.stringify||JSON.encode;                                                                       // 30
	JSON.parse = JSON.parse||JSON.decode;                                                                               // 31
                                                                                                                     // 32
	// Check Existence                                                                                                  // 33
	if ( typeof History.init !== 'undefined' ) {                                                                        // 34
		throw new Error('History.js Core has already been loaded...');                                                     // 35
	}                                                                                                                   // 36
                                                                                                                     // 37
	// Initialise History                                                                                               // 38
	History.init = function(){                                                                                          // 39
		// Check Load Status of Adapter                                                                                    // 40
		if ( typeof History.Adapter === 'undefined' ) {                                                                    // 41
			return false;                                                                                                     // 42
		}                                                                                                                  // 43
                                                                                                                     // 44
		// Check Load Status of Core                                                                                       // 45
		if ( typeof History.initCore !== 'undefined' ) {                                                                   // 46
			History.initCore();                                                                                               // 47
		}                                                                                                                  // 48
                                                                                                                     // 49
		// Check Load Status of HTML4 Support                                                                              // 50
		if ( typeof History.initHtml4 !== 'undefined' ) {                                                                  // 51
			History.initHtml4();                                                                                              // 52
		}                                                                                                                  // 53
                                                                                                                     // 54
		// Return true                                                                                                     // 55
		return true;                                                                                                       // 56
	};                                                                                                                  // 57
                                                                                                                     // 58
                                                                                                                     // 59
	// ========================================================================                                         // 60
	// Initialise Core                                                                                                  // 61
                                                                                                                     // 62
	// Initialise Core                                                                                                  // 63
	History.initCore = function(){                                                                                      // 64
		// Initialise                                                                                                      // 65
		if ( typeof History.initCore.initialized !== 'undefined' ) {                                                       // 66
			// Already Loaded                                                                                                 // 67
			return false;                                                                                                     // 68
		}                                                                                                                  // 69
		else {                                                                                                             // 70
			History.initCore.initialized = true;                                                                              // 71
		}                                                                                                                  // 72
                                                                                                                     // 73
                                                                                                                     // 74
		// ====================================================================                                            // 75
		// Options                                                                                                         // 76
                                                                                                                     // 77
		/**                                                                                                                // 78
		 * History.options                                                                                                 // 79
		 * Configurable options                                                                                            // 80
		 */                                                                                                                // 81
		History.options = History.options||{};                                                                             // 82
                                                                                                                     // 83
		/**                                                                                                                // 84
		 * History.options.hashChangeInterval                                                                              // 85
		 * How long should the interval be before hashchange checks                                                        // 86
		 */                                                                                                                // 87
		History.options.hashChangeInterval = History.options.hashChangeInterval || 100;                                    // 88
                                                                                                                     // 89
		/**                                                                                                                // 90
		 * History.options.safariPollInterval                                                                              // 91
		 * How long should the interval be before safari poll checks                                                       // 92
		 */                                                                                                                // 93
		History.options.safariPollInterval = History.options.safariPollInterval || 500;                                    // 94
                                                                                                                     // 95
		/**                                                                                                                // 96
		 * History.options.doubleCheckInterval                                                                             // 97
		 * How long should the interval be before we perform a double check                                                // 98
		 */                                                                                                                // 99
		History.options.doubleCheckInterval = History.options.doubleCheckInterval || 500;                                  // 100
                                                                                                                     // 101
		/**                                                                                                                // 102
		 * History.options.storeInterval                                                                                   // 103
		 * How long should we wait between store calls                                                                     // 104
		 */                                                                                                                // 105
		History.options.storeInterval = History.options.storeInterval || 1000;                                             // 106
                                                                                                                     // 107
		/**                                                                                                                // 108
		 * History.options.busyDelay                                                                                       // 109
		 * How long should we wait between busy events                                                                     // 110
		 */                                                                                                                // 111
		History.options.busyDelay = History.options.busyDelay || 250;                                                      // 112
                                                                                                                     // 113
		/**                                                                                                                // 114
		 * History.options.debug                                                                                           // 115
		 * If true will enable debug messages to be logged                                                                 // 116
		 */                                                                                                                // 117
		History.options.debug = History.options.debug || false;                                                            // 118
                                                                                                                     // 119
		/**                                                                                                                // 120
		 * History.options.initialTitle                                                                                    // 121
		 * What is the title of the initial state                                                                          // 122
		 */                                                                                                                // 123
		History.options.initialTitle = History.options.initialTitle || document.title;                                     // 124
                                                                                                                     // 125
                                                                                                                     // 126
		// ====================================================================                                            // 127
		// Interval record                                                                                                 // 128
                                                                                                                     // 129
		/**                                                                                                                // 130
		 * History.intervalList                                                                                            // 131
		 * List of intervals set, to be cleared when document is unloaded.                                                 // 132
		 */                                                                                                                // 133
		History.intervalList = [];                                                                                         // 134
                                                                                                                     // 135
		/**                                                                                                                // 136
		 * History.clearAllIntervals                                                                                       // 137
		 * Clears all setInterval instances.                                                                               // 138
		 */                                                                                                                // 139
		History.clearAllIntervals = function(){                                                                            // 140
			var i, il = History.intervalList;                                                                                 // 141
			if (typeof il !== "undefined" && il !== null) {                                                                   // 142
				for (i = 0; i < il.length; i++) {                                                                                // 143
					clearInterval(il[i]);                                                                                           // 144
				}                                                                                                                // 145
				History.intervalList = null;                                                                                     // 146
			}                                                                                                                 // 147
		};                                                                                                                 // 148
                                                                                                                     // 149
                                                                                                                     // 150
		// ====================================================================                                            // 151
		// Debug                                                                                                           // 152
                                                                                                                     // 153
		/**                                                                                                                // 154
		 * History.debug(message,...)                                                                                      // 155
		 * Logs the passed arguments if debug enabled                                                                      // 156
		 */                                                                                                                // 157
		History.debug = function(){                                                                                        // 158
			if ( (History.options.debug||false) ) {                                                                           // 159
				History.log.apply(History,arguments);                                                                            // 160
			}                                                                                                                 // 161
		};                                                                                                                 // 162
                                                                                                                     // 163
		/**                                                                                                                // 164
		 * History.log(message,...)                                                                                        // 165
		 * Logs the passed arguments                                                                                       // 166
		 */                                                                                                                // 167
		History.log = function(){                                                                                          // 168
			// Prepare                                                                                                        // 169
			var                                                                                                               // 170
				consoleExists = !(typeof console === 'undefined' || typeof console.log === 'undefined' || typeof console.log.apply === 'undefined'),
				textarea = document.getElementById('log'),                                                                       // 172
				message,                                                                                                         // 173
				i,n,                                                                                                             // 174
				args,arg                                                                                                         // 175
				;                                                                                                                // 176
                                                                                                                     // 177
			// Write to Console                                                                                               // 178
			if ( consoleExists ) {                                                                                            // 179
				args = Array.prototype.slice.call(arguments);                                                                    // 180
				message = args.shift();                                                                                          // 181
				if ( typeof console.debug !== 'undefined' ) {                                                                    // 182
					console.debug.apply(console,[message,args]);                                                                    // 183
				}                                                                                                                // 184
				else {                                                                                                           // 185
					console.log.apply(console,[message,args]);                                                                      // 186
				}                                                                                                                // 187
			}                                                                                                                 // 188
			else {                                                                                                            // 189
				message = ("\n"+arguments[0]+"\n");                                                                              // 190
			}                                                                                                                 // 191
                                                                                                                     // 192
			// Write to log                                                                                                   // 193
			for ( i=1,n=arguments.length; i<n; ++i ) {                                                                        // 194
				arg = arguments[i];                                                                                              // 195
				if ( typeof arg === 'object' && typeof JSON !== 'undefined' ) {                                                  // 196
					try {                                                                                                           // 197
						arg = JSON.stringify(arg);                                                                                     // 198
					}                                                                                                               // 199
					catch ( Exception ) {                                                                                           // 200
						// Recursive Object                                                                                            // 201
					}                                                                                                               // 202
				}                                                                                                                // 203
				message += "\n"+arg+"\n";                                                                                        // 204
			}                                                                                                                 // 205
                                                                                                                     // 206
			// Textarea                                                                                                       // 207
			if ( textarea ) {                                                                                                 // 208
				textarea.value += message+"\n-----\n";                                                                           // 209
				textarea.scrollTop = textarea.scrollHeight - textarea.clientHeight;                                              // 210
			}                                                                                                                 // 211
			// No Textarea, No Console                                                                                        // 212
			else if ( !consoleExists ) {                                                                                      // 213
				alert(message);                                                                                                  // 214
			}                                                                                                                 // 215
                                                                                                                     // 216
			// Return true                                                                                                    // 217
			return true;                                                                                                      // 218
		};                                                                                                                 // 219
                                                                                                                     // 220
                                                                                                                     // 221
		// ====================================================================                                            // 222
		// Emulated Status                                                                                                 // 223
                                                                                                                     // 224
		/**                                                                                                                // 225
		 * History.getInternetExplorerMajorVersion()                                                                       // 226
		 * Get's the major version of Internet Explorer                                                                    // 227
		 * @return {integer}                                                                                               // 228
		 * @license Public Domain                                                                                          // 229
		 * @author Benjamin Arthur Lupton <contact@balupton.com>                                                           // 230
		 * @author James Padolsey <https://gist.github.com/527683>                                                         // 231
		 */                                                                                                                // 232
		History.getInternetExplorerMajorVersion = function(){                                                              // 233
			var result = History.getInternetExplorerMajorVersion.cached =                                                     // 234
					(typeof History.getInternetExplorerMajorVersion.cached !== 'undefined')                                         // 235
				?	History.getInternetExplorerMajorVersion.cached                                                                 // 236
				:	(function(){                                                                                                   // 237
						var v = 3,                                                                                                     // 238
								div = document.createElement('div'),                                                                         // 239
								all = div.getElementsByTagName('i');                                                                         // 240
						while ( (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->') && all[0] ) {}                    // 241
						return (v > 4) ? v : false;                                                                                    // 242
					})()                                                                                                            // 243
				;                                                                                                                // 244
			return result;                                                                                                    // 245
		};                                                                                                                 // 246
                                                                                                                     // 247
		/**                                                                                                                // 248
		 * History.isInternetExplorer()                                                                                    // 249
		 * Are we using Internet Explorer?                                                                                 // 250
		 * @return {boolean}                                                                                               // 251
		 * @license Public Domain                                                                                          // 252
		 * @author Benjamin Arthur Lupton <contact@balupton.com>                                                           // 253
		 */                                                                                                                // 254
		History.isInternetExplorer = function(){                                                                           // 255
			var result =                                                                                                      // 256
				History.isInternetExplorer.cached =                                                                              // 257
				(typeof History.isInternetExplorer.cached !== 'undefined')                                                       // 258
					?	History.isInternetExplorer.cached                                                                             // 259
					:	Boolean(History.getInternetExplorerMajorVersion())                                                            // 260
				;                                                                                                                // 261
			return result;                                                                                                    // 262
		};                                                                                                                 // 263
                                                                                                                     // 264
		/**                                                                                                                // 265
		 * History.emulated                                                                                                // 266
		 * Which features require emulating?                                                                               // 267
		 */                                                                                                                // 268
		History.emulated = {                                                                                               // 269
			pushState: !Boolean(                                                                                              // 270
				window.history && window.history.pushState && window.history.replaceState                                        // 271
				&& !(                                                                                                            // 272
					(/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(navigator.userAgent) /* disable for versions of iOS before version 4.3 (8F190) */
					|| (/AppleWebKit\/5([0-2]|3[0-2])/i).test(navigator.userAgent) /* disable for the mercury iOS browser, or at least older versions of the webkit engine */
				)                                                                                                                // 275
			),                                                                                                                // 276
			hashChange: Boolean(                                                                                              // 277
				!(('onhashchange' in window) || ('onhashchange' in document))                                                    // 278
				||                                                                                                               // 279
				(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8)                                  // 280
			)                                                                                                                 // 281
		};                                                                                                                 // 282
                                                                                                                     // 283
		/**                                                                                                                // 284
		 * History.enabled                                                                                                 // 285
		 * Is History enabled?                                                                                             // 286
		 */                                                                                                                // 287
		History.enabled = !History.emulated.pushState;                                                                     // 288
                                                                                                                     // 289
		/**                                                                                                                // 290
		 * History.bugs                                                                                                    // 291
		 * Which bugs are present                                                                                          // 292
		 */                                                                                                                // 293
		History.bugs = {                                                                                                   // 294
			/**                                                                                                               // 295
			 * Safari 5 and Safari iOS 4 fail to return to the correct state once a hash is replaced by a `replaceState` call // 296
			 * https://bugs.webkit.org/show_bug.cgi?id=56249                                                                  // 297
			 */                                                                                                               // 298
			setHash: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),
                                                                                                                     // 300
			/**                                                                                                               // 301
			 * Safari 5 and Safari iOS 4 sometimes fail to apply the state change under busy conditions                       // 302
			 * https://bugs.webkit.org/show_bug.cgi?id=42940                                                                  // 303
			 */                                                                                                               // 304
			safariPoll: Boolean(!History.emulated.pushState && navigator.vendor === 'Apple Computer, Inc.' && /AppleWebKit\/5([0-2]|3[0-3])/.test(navigator.userAgent)),
                                                                                                                     // 306
			/**                                                                                                               // 307
			 * MSIE 6 and 7 sometimes do not apply a hash even it was told to (requiring a second call to the apply function) // 308
			 */                                                                                                               // 309
			ieDoubleCheck: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 8),            // 310
                                                                                                                     // 311
			/**                                                                                                               // 312
			 * MSIE 6 requires the entire hash to be encoded for the hashes to trigger the onHashChange event                 // 313
			 */                                                                                                               // 314
			hashEscape: Boolean(History.isInternetExplorer() && History.getInternetExplorerMajorVersion() < 7)                // 315
		};                                                                                                                 // 316
                                                                                                                     // 317
		/**                                                                                                                // 318
		 * History.isEmptyObject(obj)                                                                                      // 319
		 * Checks to see if the Object is Empty                                                                            // 320
		 * @param {Object} obj                                                                                             // 321
		 * @return {boolean}                                                                                               // 322
		 */                                                                                                                // 323
		History.isEmptyObject = function(obj) {                                                                            // 324
			for ( var name in obj ) {                                                                                         // 325
				return false;                                                                                                    // 326
			}                                                                                                                 // 327
			return true;                                                                                                      // 328
		};                                                                                                                 // 329
                                                                                                                     // 330
		/**                                                                                                                // 331
		 * History.cloneObject(obj)                                                                                        // 332
		 * Clones a object and eliminate all references to the original contexts                                           // 333
		 * @param {Object} obj                                                                                             // 334
		 * @return {Object}                                                                                                // 335
		 */                                                                                                                // 336
		History.cloneObject = function(obj) {                                                                              // 337
			var hash,newObj;                                                                                                  // 338
			if ( obj ) {                                                                                                      // 339
				hash = JSON.stringify(obj);                                                                                      // 340
				newObj = JSON.parse(hash);                                                                                       // 341
			}                                                                                                                 // 342
			else {                                                                                                            // 343
				newObj = {};                                                                                                     // 344
			}                                                                                                                 // 345
			return newObj;                                                                                                    // 346
		};                                                                                                                 // 347
                                                                                                                     // 348
                                                                                                                     // 349
		// ====================================================================                                            // 350
		// URL Helpers                                                                                                     // 351
                                                                                                                     // 352
		/**                                                                                                                // 353
		 * History.getRootUrl()                                                                                            // 354
		 * Turns "http://mysite.com/dir/page.html?asd" into "http://mysite.com"                                            // 355
		 * @return {String} rootUrl                                                                                        // 356
		 */                                                                                                                // 357
		History.getRootUrl = function(){                                                                                   // 358
			// Create                                                                                                         // 359
			var rootUrl = document.location.protocol+'//'+(document.location.hostname||document.location.host);               // 360
			if ( document.location.port||false ) {                                                                            // 361
				rootUrl += ':'+document.location.port;                                                                           // 362
			}                                                                                                                 // 363
			rootUrl += '/';                                                                                                   // 364
                                                                                                                     // 365
			// Return                                                                                                         // 366
			return rootUrl;                                                                                                   // 367
		};                                                                                                                 // 368
                                                                                                                     // 369
		/**                                                                                                                // 370
		 * History.getBaseHref()                                                                                           // 371
		 * Fetches the `href` attribute of the `<base href="...">` element if it exists                                    // 372
		 * @return {String} baseHref                                                                                       // 373
		 */                                                                                                                // 374
		History.getBaseHref = function(){                                                                                  // 375
			// Create                                                                                                         // 376
			var                                                                                                               // 377
				baseElements = document.getElementsByTagName('base'),                                                            // 378
				baseElement = null,                                                                                              // 379
				baseHref = '';                                                                                                   // 380
                                                                                                                     // 381
			// Test for Base Element                                                                                          // 382
			if ( baseElements.length === 1 ) {                                                                                // 383
				// Prepare for Base Element                                                                                      // 384
				baseElement = baseElements[0];                                                                                   // 385
				baseHref = baseElement.href.replace(/[^\/]+$/,'');                                                               // 386
			}                                                                                                                 // 387
                                                                                                                     // 388
			// Adjust trailing slash                                                                                          // 389
			baseHref = baseHref.replace(/\/+$/,'');                                                                           // 390
			if ( baseHref ) baseHref += '/';                                                                                  // 391
                                                                                                                     // 392
			// Return                                                                                                         // 393
			return baseHref;                                                                                                  // 394
		};                                                                                                                 // 395
                                                                                                                     // 396
		/**                                                                                                                // 397
		 * History.getBaseUrl()                                                                                            // 398
		 * Fetches the baseHref or basePageUrl or rootUrl (whichever one exists first)                                     // 399
		 * @return {String} baseUrl                                                                                        // 400
		 */                                                                                                                // 401
		History.getBaseUrl = function(){                                                                                   // 402
			// Create                                                                                                         // 403
			var baseUrl = History.getBaseHref()||History.getBasePageUrl()||History.getRootUrl();                              // 404
                                                                                                                     // 405
			// Return                                                                                                         // 406
			return baseUrl;                                                                                                   // 407
		};                                                                                                                 // 408
                                                                                                                     // 409
		/**                                                                                                                // 410
		 * History.getPageUrl()                                                                                            // 411
		 * Fetches the URL of the current page                                                                             // 412
		 * @return {String} pageUrl                                                                                        // 413
		 */                                                                                                                // 414
		History.getPageUrl = function(){                                                                                   // 415
			// Fetch                                                                                                          // 416
			var                                                                                                               // 417
				State = History.getState(false,false),                                                                           // 418
				stateUrl = (State||{}).url||document.location.href,                                                              // 419
				pageUrl;                                                                                                         // 420
                                                                                                                     // 421
			// Create                                                                                                         // 422
			pageUrl = stateUrl.replace(/\/+$/,'').replace(/[^\/]+$/,function(part,index,string){                              // 423
				return (/\./).test(part) ? part : part+'/';                                                                      // 424
			});                                                                                                               // 425
                                                                                                                     // 426
			// Return                                                                                                         // 427
			return pageUrl;                                                                                                   // 428
		};                                                                                                                 // 429
                                                                                                                     // 430
		/**                                                                                                                // 431
		 * History.getBasePageUrl()                                                                                        // 432
		 * Fetches the Url of the directory of the current page                                                            // 433
		 * @return {String} basePageUrl                                                                                    // 434
		 */                                                                                                                // 435
		History.getBasePageUrl = function(){                                                                               // 436
			// Create                                                                                                         // 437
			var basePageUrl = document.location.href.replace(/[#\?].*/,'').replace(/[^\/]+$/,function(part,index,string){     // 438
				return (/[^\/]$/).test(part) ? '' : part;                                                                        // 439
			}).replace(/\/+$/,'')+'/';                                                                                        // 440
                                                                                                                     // 441
			// Return                                                                                                         // 442
			return basePageUrl;                                                                                               // 443
		};                                                                                                                 // 444
                                                                                                                     // 445
		/**                                                                                                                // 446
		 * History.getFullUrl(url)                                                                                         // 447
		 * Ensures that we have an absolute URL and not a relative URL                                                     // 448
		 * @param {string} url                                                                                             // 449
		 * @param {Boolean} allowBaseHref                                                                                  // 450
		 * @return {string} fullUrl                                                                                        // 451
		 */                                                                                                                // 452
		History.getFullUrl = function(url,allowBaseHref){                                                                  // 453
			// Prepare                                                                                                        // 454
			var fullUrl = url, firstChar = url.substring(0,1);                                                                // 455
			allowBaseHref = (typeof allowBaseHref === 'undefined') ? true : allowBaseHref;                                    // 456
                                                                                                                     // 457
			// Check                                                                                                          // 458
			if ( /[a-z]+\:\/\//.test(url) ) {                                                                                 // 459
				// Full URL                                                                                                      // 460
			}                                                                                                                 // 461
			else if ( firstChar === '/' ) {                                                                                   // 462
				// Root URL                                                                                                      // 463
				fullUrl = History.getRootUrl()+url.replace(/^\/+/,'');                                                           // 464
			}                                                                                                                 // 465
			else if ( firstChar === '#' ) {                                                                                   // 466
				// Anchor URL                                                                                                    // 467
				fullUrl = History.getPageUrl().replace(/#.*/,'')+url;                                                            // 468
			}                                                                                                                 // 469
			else if ( firstChar === '?' ) {                                                                                   // 470
				// Query URL                                                                                                     // 471
				fullUrl = History.getPageUrl().replace(/[\?#].*/,'')+url;                                                        // 472
			}                                                                                                                 // 473
			else {                                                                                                            // 474
				// Relative URL                                                                                                  // 475
				if ( allowBaseHref ) {                                                                                           // 476
					fullUrl = History.getBaseUrl()+url.replace(/^(\.\/)+/,'');                                                      // 477
				} else {                                                                                                         // 478
					fullUrl = History.getBasePageUrl()+url.replace(/^(\.\/)+/,'');                                                  // 479
				}                                                                                                                // 480
				// We have an if condition above as we do not want hashes                                                        // 481
				// which are relative to the baseHref in our URLs                                                                // 482
				// as if the baseHref changes, then all our bookmarks                                                            // 483
				// would now point to different locations                                                                        // 484
				// whereas the basePageUrl will always stay the same                                                             // 485
			}                                                                                                                 // 486
                                                                                                                     // 487
			// Return                                                                                                         // 488
			return fullUrl.replace(/\#$/,'');                                                                                 // 489
		};                                                                                                                 // 490
                                                                                                                     // 491
		/**                                                                                                                // 492
		 * History.getShortUrl(url)                                                                                        // 493
		 * Ensures that we have a relative URL and not a absolute URL                                                      // 494
		 * @param {string} url                                                                                             // 495
		 * @return {string} url                                                                                            // 496
		 */                                                                                                                // 497
		History.getShortUrl = function(url){                                                                               // 498
			// Prepare                                                                                                        // 499
			var shortUrl = url, baseUrl = History.getBaseUrl(), rootUrl = History.getRootUrl();                               // 500
                                                                                                                     // 501
			// Trim baseUrl                                                                                                   // 502
			if ( History.emulated.pushState ) {                                                                               // 503
				// We are in a if statement as when pushState is not emulated                                                    // 504
				// The actual url these short urls are relative to can change                                                    // 505
				// So within the same session, we the url may end up somewhere different                                         // 506
				shortUrl = shortUrl.replace(baseUrl,'');                                                                         // 507
			}                                                                                                                 // 508
                                                                                                                     // 509
			// Trim rootUrl                                                                                                   // 510
			shortUrl = shortUrl.replace(rootUrl,'/');                                                                         // 511
                                                                                                                     // 512
			// Ensure we can still detect it as a state                                                                       // 513
			if ( History.isTraditionalAnchor(shortUrl) ) {                                                                    // 514
				shortUrl = './'+shortUrl;                                                                                        // 515
			}                                                                                                                 // 516
                                                                                                                     // 517
			// Clean It                                                                                                       // 518
			shortUrl = shortUrl.replace(/^(\.\/)+/g,'./').replace(/\#$/,'');                                                  // 519
                                                                                                                     // 520
			// Return                                                                                                         // 521
			return shortUrl;                                                                                                  // 522
		};                                                                                                                 // 523
                                                                                                                     // 524
                                                                                                                     // 525
		// ====================================================================                                            // 526
		// State Storage                                                                                                   // 527
                                                                                                                     // 528
		/**                                                                                                                // 529
		 * History.store                                                                                                   // 530
		 * The store for all session specific data                                                                         // 531
		 */                                                                                                                // 532
		History.store = {};                                                                                                // 533
                                                                                                                     // 534
		/**                                                                                                                // 535
		 * History.idToState                                                                                               // 536
		 * 1-1: State ID to State Object                                                                                   // 537
		 */                                                                                                                // 538
		History.idToState = History.idToState||{};                                                                         // 539
                                                                                                                     // 540
		/**                                                                                                                // 541
		 * History.stateToId                                                                                               // 542
		 * 1-1: State String to State ID                                                                                   // 543
		 */                                                                                                                // 544
		History.stateToId = History.stateToId||{};                                                                         // 545
                                                                                                                     // 546
		/**                                                                                                                // 547
		 * History.urlToId                                                                                                 // 548
		 * 1-1: State URL to State ID                                                                                      // 549
		 */                                                                                                                // 550
		History.urlToId = History.urlToId||{};                                                                             // 551
                                                                                                                     // 552
		/**                                                                                                                // 553
		 * History.storedStates                                                                                            // 554
		 * Store the states in an array                                                                                    // 555
		 */                                                                                                                // 556
		History.storedStates = History.storedStates||[];                                                                   // 557
                                                                                                                     // 558
		/**                                                                                                                // 559
		 * History.savedStates                                                                                             // 560
		 * Saved the states in an array                                                                                    // 561
		 */                                                                                                                // 562
		History.savedStates = History.savedStates||[];                                                                     // 563
                                                                                                                     // 564
		/**                                                                                                                // 565
		 * History.noramlizeStore()                                                                                        // 566
		 * Noramlize the store by adding necessary values                                                                  // 567
		 */                                                                                                                // 568
		History.normalizeStore = function(){                                                                               // 569
			History.store.idToState = History.store.idToState||{};                                                            // 570
			History.store.urlToId = History.store.urlToId||{};                                                                // 571
			History.store.stateToId = History.store.stateToId||{};                                                            // 572
		};                                                                                                                 // 573
                                                                                                                     // 574
		/**                                                                                                                // 575
		 * History.getState()                                                                                              // 576
		 * Get an object containing the data, title and url of the current state                                           // 577
		 * @param {Boolean} friendly                                                                                       // 578
		 * @param {Boolean} create                                                                                         // 579
		 * @return {Object} State                                                                                          // 580
		 */                                                                                                                // 581
		History.getState = function(friendly,create){                                                                      // 582
			// Prepare                                                                                                        // 583
			if ( typeof friendly === 'undefined' ) { friendly = true; }                                                       // 584
			if ( typeof create === 'undefined' ) { create = true; }                                                           // 585
                                                                                                                     // 586
			// Fetch                                                                                                          // 587
			var State = History.getLastSavedState();                                                                          // 588
                                                                                                                     // 589
			// Create                                                                                                         // 590
			if ( !State && create ) {                                                                                         // 591
				State = History.createStateObject();                                                                             // 592
			}                                                                                                                 // 593
                                                                                                                     // 594
			// Adjust                                                                                                         // 595
			if ( friendly ) {                                                                                                 // 596
				State = History.cloneObject(State);                                                                              // 597
				State.url = State.cleanUrl||State.url;                                                                           // 598
			}                                                                                                                 // 599
                                                                                                                     // 600
			// Return                                                                                                         // 601
			return State;                                                                                                     // 602
		};                                                                                                                 // 603
                                                                                                                     // 604
		/**                                                                                                                // 605
		 * History.getIdByState(State)                                                                                     // 606
		 * Gets a ID for a State                                                                                           // 607
		 * @param {State} newState                                                                                         // 608
		 * @return {String} id                                                                                             // 609
		 */                                                                                                                // 610
		History.getIdByState = function(newState){                                                                         // 611
                                                                                                                     // 612
			// Fetch ID                                                                                                       // 613
			var id = History.extractId(newState.url),                                                                         // 614
				str;                                                                                                             // 615
			                                                                                                                  // 616
			if ( !id ) {                                                                                                      // 617
				// Find ID via State String                                                                                      // 618
				str = History.getStateString(newState);                                                                          // 619
				if ( typeof History.stateToId[str] !== 'undefined' ) {                                                           // 620
					id = History.stateToId[str];                                                                                    // 621
				}                                                                                                                // 622
				else if ( typeof History.store.stateToId[str] !== 'undefined' ) {                                                // 623
					id = History.store.stateToId[str];                                                                              // 624
				}                                                                                                                // 625
				else {                                                                                                           // 626
					// Generate a new ID                                                                                            // 627
					while ( true ) {                                                                                                // 628
						id = (new Date()).getTime() + String(Math.random()).replace(/\D/g,'');                                         // 629
						if ( typeof History.idToState[id] === 'undefined' && typeof History.store.idToState[id] === 'undefined' ) {    // 630
							break;                                                                                                        // 631
						}                                                                                                              // 632
					}                                                                                                               // 633
                                                                                                                     // 634
					// Apply the new State to the ID                                                                                // 635
					History.stateToId[str] = id;                                                                                    // 636
					History.idToState[id] = newState;                                                                               // 637
				}                                                                                                                // 638
			}                                                                                                                 // 639
                                                                                                                     // 640
			// Return ID                                                                                                      // 641
			return id;                                                                                                        // 642
		};                                                                                                                 // 643
                                                                                                                     // 644
		/**                                                                                                                // 645
		 * History.normalizeState(State)                                                                                   // 646
		 * Expands a State Object                                                                                          // 647
		 * @param {object} State                                                                                           // 648
		 * @return {object}                                                                                                // 649
		 */                                                                                                                // 650
		History.normalizeState = function(oldState){                                                                       // 651
			// Variables                                                                                                      // 652
			var newState, dataNotEmpty;                                                                                       // 653
                                                                                                                     // 654
			// Prepare                                                                                                        // 655
			if ( !oldState || (typeof oldState !== 'object') ) {                                                              // 656
				oldState = {};                                                                                                   // 657
			}                                                                                                                 // 658
                                                                                                                     // 659
			// Check                                                                                                          // 660
			if ( typeof oldState.normalized !== 'undefined' ) {                                                               // 661
				return oldState;                                                                                                 // 662
			}                                                                                                                 // 663
                                                                                                                     // 664
			// Adjust                                                                                                         // 665
			if ( !oldState.data || (typeof oldState.data !== 'object') ) {                                                    // 666
				oldState.data = {};                                                                                              // 667
			}                                                                                                                 // 668
                                                                                                                     // 669
			// ----------------------------------------------------------------                                               // 670
                                                                                                                     // 671
			// Create                                                                                                         // 672
			newState = {};                                                                                                    // 673
			newState.normalized = true;                                                                                       // 674
			newState.title = oldState.title||'';                                                                              // 675
			newState.url = History.getFullUrl(History.unescapeString(oldState.url||document.location.href));                  // 676
			newState.hash = History.getShortUrl(newState.url);                                                                // 677
			newState.data = History.cloneObject(oldState.data);                                                               // 678
                                                                                                                     // 679
			// Fetch ID                                                                                                       // 680
			newState.id = History.getIdByState(newState);                                                                     // 681
                                                                                                                     // 682
			// ----------------------------------------------------------------                                               // 683
                                                                                                                     // 684
			// Clean the URL                                                                                                  // 685
			newState.cleanUrl = newState.url.replace(/\??\&_suid.*/,'');                                                      // 686
			newState.url = newState.cleanUrl;                                                                                 // 687
                                                                                                                     // 688
			// Check to see if we have more than just a url                                                                   // 689
			dataNotEmpty = !History.isEmptyObject(newState.data);                                                             // 690
                                                                                                                     // 691
			// Apply                                                                                                          // 692
			if ( newState.title || dataNotEmpty ) {                                                                           // 693
				// Add ID to Hash                                                                                                // 694
				newState.hash = History.getShortUrl(newState.url).replace(/\??\&_suid.*/,'');                                    // 695
				if ( !/\?/.test(newState.hash) ) {                                                                               // 696
					newState.hash += '?';                                                                                           // 697
				}                                                                                                                // 698
				newState.hash += '&_suid='+newState.id;                                                                          // 699
			}                                                                                                                 // 700
                                                                                                                     // 701
			// Create the Hashed URL                                                                                          // 702
			newState.hashedUrl = History.getFullUrl(newState.hash);                                                           // 703
                                                                                                                     // 704
			// ----------------------------------------------------------------                                               // 705
                                                                                                                     // 706
			// Update the URL if we have a duplicate                                                                          // 707
			if ( (History.emulated.pushState || History.bugs.safariPoll) && History.hasUrlDuplicate(newState) ) {             // 708
				newState.url = newState.hashedUrl;                                                                               // 709
			}                                                                                                                 // 710
                                                                                                                     // 711
			// ----------------------------------------------------------------                                               // 712
                                                                                                                     // 713
			// Return                                                                                                         // 714
			return newState;                                                                                                  // 715
		};                                                                                                                 // 716
                                                                                                                     // 717
		/**                                                                                                                // 718
		 * History.createStateObject(data,title,url)                                                                       // 719
		 * Creates a object based on the data, title and url state params                                                  // 720
		 * @param {object} data                                                                                            // 721
		 * @param {string} title                                                                                           // 722
		 * @param {string} url                                                                                             // 723
		 * @return {object}                                                                                                // 724
		 */                                                                                                                // 725
		History.createStateObject = function(data,title,url){                                                              // 726
			// Hashify                                                                                                        // 727
			var State = {                                                                                                     // 728
				'data': data,                                                                                                    // 729
				'title': title,                                                                                                  // 730
				'url': url                                                                                                       // 731
			};                                                                                                                // 732
                                                                                                                     // 733
			// Expand the State                                                                                               // 734
			State = History.normalizeState(State);                                                                            // 735
                                                                                                                     // 736
			// Return object                                                                                                  // 737
			return State;                                                                                                     // 738
		};                                                                                                                 // 739
                                                                                                                     // 740
		/**                                                                                                                // 741
		 * History.getStateById(id)                                                                                        // 742
		 * Get a state by it's UID                                                                                         // 743
		 * @param {String} id                                                                                              // 744
		 */                                                                                                                // 745
		History.getStateById = function(id){                                                                               // 746
			// Prepare                                                                                                        // 747
			id = String(id);                                                                                                  // 748
                                                                                                                     // 749
			// Retrieve                                                                                                       // 750
			var State = History.idToState[id] || History.store.idToState[id] || undefined;                                    // 751
                                                                                                                     // 752
			// Return State                                                                                                   // 753
			return State;                                                                                                     // 754
		};                                                                                                                 // 755
                                                                                                                     // 756
		/**                                                                                                                // 757
		 * Get a State's String                                                                                            // 758
		 * @param {State} passedState                                                                                      // 759
		 */                                                                                                                // 760
		History.getStateString = function(passedState){                                                                    // 761
			// Prepare                                                                                                        // 762
			var State, cleanedState, str;                                                                                     // 763
                                                                                                                     // 764
			// Fetch                                                                                                          // 765
			State = History.normalizeState(passedState);                                                                      // 766
                                                                                                                     // 767
			// Clean                                                                                                          // 768
			cleanedState = {                                                                                                  // 769
				data: State.data,                                                                                                // 770
				title: passedState.title,                                                                                        // 771
				url: passedState.url                                                                                             // 772
			};                                                                                                                // 773
                                                                                                                     // 774
			// Fetch                                                                                                          // 775
			str = JSON.stringify(cleanedState);                                                                               // 776
                                                                                                                     // 777
			// Return                                                                                                         // 778
			return str;                                                                                                       // 779
		};                                                                                                                 // 780
                                                                                                                     // 781
		/**                                                                                                                // 782
		 * Get a State's ID                                                                                                // 783
		 * @param {State} passedState                                                                                      // 784
		 * @return {String} id                                                                                             // 785
		 */                                                                                                                // 786
		History.getStateId = function(passedState){                                                                        // 787
			// Prepare                                                                                                        // 788
			var State, id;                                                                                                    // 789
			                                                                                                                  // 790
			// Fetch                                                                                                          // 791
			State = History.normalizeState(passedState);                                                                      // 792
                                                                                                                     // 793
			// Fetch                                                                                                          // 794
			id = State.id;                                                                                                    // 795
                                                                                                                     // 796
			// Return                                                                                                         // 797
			return id;                                                                                                        // 798
		};                                                                                                                 // 799
                                                                                                                     // 800
		/**                                                                                                                // 801
		 * History.getHashByState(State)                                                                                   // 802
		 * Creates a Hash for the State Object                                                                             // 803
		 * @param {State} passedState                                                                                      // 804
		 * @return {String} hash                                                                                           // 805
		 */                                                                                                                // 806
		History.getHashByState = function(passedState){                                                                    // 807
			// Prepare                                                                                                        // 808
			var State, hash;                                                                                                  // 809
			                                                                                                                  // 810
			// Fetch                                                                                                          // 811
			State = History.normalizeState(passedState);                                                                      // 812
                                                                                                                     // 813
			// Hash                                                                                                           // 814
			hash = State.hash;                                                                                                // 815
                                                                                                                     // 816
			// Return                                                                                                         // 817
			return hash;                                                                                                      // 818
		};                                                                                                                 // 819
                                                                                                                     // 820
		/**                                                                                                                // 821
		 * History.extractId(url_or_hash)                                                                                  // 822
		 * Get a State ID by it's URL or Hash                                                                              // 823
		 * @param {string} url_or_hash                                                                                     // 824
		 * @return {string} id                                                                                             // 825
		 */                                                                                                                // 826
		History.extractId = function ( url_or_hash ) {                                                                     // 827
			// Prepare                                                                                                        // 828
			var id,parts,url;                                                                                                 // 829
                                                                                                                     // 830
			// Extract                                                                                                        // 831
			parts = /(.*)\&_suid=([0-9]+)$/.exec(url_or_hash);                                                                // 832
			url = parts ? (parts[1]||url_or_hash) : url_or_hash;                                                              // 833
			id = parts ? String(parts[2]||'') : '';                                                                           // 834
                                                                                                                     // 835
			// Return                                                                                                         // 836
			return id||false;                                                                                                 // 837
		};                                                                                                                 // 838
                                                                                                                     // 839
		/**                                                                                                                // 840
		 * History.isTraditionalAnchor                                                                                     // 841
		 * Checks to see if the url is a traditional anchor or not                                                         // 842
		 * @param {String} url_or_hash                                                                                     // 843
		 * @return {Boolean}                                                                                               // 844
		 */                                                                                                                // 845
		History.isTraditionalAnchor = function(url_or_hash){                                                               // 846
			// Check                                                                                                          // 847
			var isTraditional = !(/[\/\?\.]/.test(url_or_hash));                                                              // 848
                                                                                                                     // 849
			// Return                                                                                                         // 850
			return isTraditional;                                                                                             // 851
		};                                                                                                                 // 852
                                                                                                                     // 853
		/**                                                                                                                // 854
		 * History.extractState                                                                                            // 855
		 * Get a State by it's URL or Hash                                                                                 // 856
		 * @param {String} url_or_hash                                                                                     // 857
		 * @return {State|null}                                                                                            // 858
		 */                                                                                                                // 859
		History.extractState = function(url_or_hash,create){                                                               // 860
			// Prepare                                                                                                        // 861
			var State = null, id, url;                                                                                        // 862
			create = create||false;                                                                                           // 863
                                                                                                                     // 864
			// Fetch SUID                                                                                                     // 865
			id = History.extractId(url_or_hash);                                                                              // 866
			if ( id ) {                                                                                                       // 867
				State = History.getStateById(id);                                                                                // 868
			}                                                                                                                 // 869
                                                                                                                     // 870
			// Fetch SUID returned no State                                                                                   // 871
			if ( !State ) {                                                                                                   // 872
				// Fetch URL                                                                                                     // 873
				url = History.getFullUrl(url_or_hash);                                                                           // 874
                                                                                                                     // 875
				// Check URL                                                                                                     // 876
				id = History.getIdByUrl(url)||false;                                                                             // 877
				if ( id ) {                                                                                                      // 878
					State = History.getStateById(id);                                                                               // 879
				}                                                                                                                // 880
                                                                                                                     // 881
				// Create State                                                                                                  // 882
				if ( !State && create && !History.isTraditionalAnchor(url_or_hash) ) {                                           // 883
					State = History.createStateObject(null,null,url);                                                               // 884
				}                                                                                                                // 885
			}                                                                                                                 // 886
                                                                                                                     // 887
			// Return                                                                                                         // 888
			return State;                                                                                                     // 889
		};                                                                                                                 // 890
                                                                                                                     // 891
		/**                                                                                                                // 892
		 * History.getIdByUrl()                                                                                            // 893
		 * Get a State ID by a State URL                                                                                   // 894
		 */                                                                                                                // 895
		History.getIdByUrl = function(url){                                                                                // 896
			// Fetch                                                                                                          // 897
			var id = History.urlToId[url] || History.store.urlToId[url] || undefined;                                         // 898
                                                                                                                     // 899
			// Return                                                                                                         // 900
			return id;                                                                                                        // 901
		};                                                                                                                 // 902
                                                                                                                     // 903
		/**                                                                                                                // 904
		 * History.getLastSavedState()                                                                                     // 905
		 * Get an object containing the data, title and url of the current state                                           // 906
		 * @return {Object} State                                                                                          // 907
		 */                                                                                                                // 908
		History.getLastSavedState = function(){                                                                            // 909
			return History.savedStates[History.savedStates.length-1]||undefined;                                              // 910
		};                                                                                                                 // 911
                                                                                                                     // 912
		/**                                                                                                                // 913
		 * History.getLastStoredState()                                                                                    // 914
		 * Get an object containing the data, title and url of the current state                                           // 915
		 * @return {Object} State                                                                                          // 916
		 */                                                                                                                // 917
		History.getLastStoredState = function(){                                                                           // 918
			return History.storedStates[History.storedStates.length-1]||undefined;                                            // 919
		};                                                                                                                 // 920
                                                                                                                     // 921
		/**                                                                                                                // 922
		 * History.hasUrlDuplicate                                                                                         // 923
		 * Checks if a Url will have a url conflict                                                                        // 924
		 * @param {Object} newState                                                                                        // 925
		 * @return {Boolean} hasDuplicate                                                                                  // 926
		 */                                                                                                                // 927
		History.hasUrlDuplicate = function(newState) {                                                                     // 928
			// Prepare                                                                                                        // 929
			var hasDuplicate = false,                                                                                         // 930
				oldState;                                                                                                        // 931
                                                                                                                     // 932
			// Fetch                                                                                                          // 933
			oldState = History.extractState(newState.url);                                                                    // 934
                                                                                                                     // 935
			// Check                                                                                                          // 936
			hasDuplicate = oldState && oldState.id !== newState.id;                                                           // 937
                                                                                                                     // 938
			// Return                                                                                                         // 939
			return hasDuplicate;                                                                                              // 940
		};                                                                                                                 // 941
                                                                                                                     // 942
		/**                                                                                                                // 943
		 * History.storeState                                                                                              // 944
		 * Store a State                                                                                                   // 945
		 * @param {Object} newState                                                                                        // 946
		 * @return {Object} newState                                                                                       // 947
		 */                                                                                                                // 948
		History.storeState = function(newState){                                                                           // 949
			// Store the State                                                                                                // 950
			History.urlToId[newState.url] = newState.id;                                                                      // 951
                                                                                                                     // 952
			// Push the State                                                                                                 // 953
			History.storedStates.push(History.cloneObject(newState));                                                         // 954
                                                                                                                     // 955
			// Return newState                                                                                                // 956
			return newState;                                                                                                  // 957
		};                                                                                                                 // 958
                                                                                                                     // 959
		/**                                                                                                                // 960
		 * History.isLastSavedState(newState)                                                                              // 961
		 * Tests to see if the state is the last state                                                                     // 962
		 * @param {Object} newState                                                                                        // 963
		 * @return {boolean} isLast                                                                                        // 964
		 */                                                                                                                // 965
		History.isLastSavedState = function(newState){                                                                     // 966
			// Prepare                                                                                                        // 967
			var isLast = false,                                                                                               // 968
				newId, oldState, oldId;                                                                                          // 969
                                                                                                                     // 970
			// Check                                                                                                          // 971
			if ( History.savedStates.length ) {                                                                               // 972
				newId = newState.id;                                                                                             // 973
				oldState = History.getLastSavedState();                                                                          // 974
				oldId = oldState.id;                                                                                             // 975
                                                                                                                     // 976
				// Check                                                                                                         // 977
				isLast = (newId === oldId);                                                                                      // 978
			}                                                                                                                 // 979
                                                                                                                     // 980
			// Return                                                                                                         // 981
			return isLast;                                                                                                    // 982
		};                                                                                                                 // 983
                                                                                                                     // 984
		/**                                                                                                                // 985
		 * History.saveState                                                                                               // 986
		 * Push a State                                                                                                    // 987
		 * @param {Object} newState                                                                                        // 988
		 * @return {boolean} changed                                                                                       // 989
		 */                                                                                                                // 990
		History.saveState = function(newState){                                                                            // 991
			// Check Hash                                                                                                     // 992
			if ( History.isLastSavedState(newState) ) {                                                                       // 993
				return false;                                                                                                    // 994
			}                                                                                                                 // 995
                                                                                                                     // 996
			// Push the State                                                                                                 // 997
			History.savedStates.push(History.cloneObject(newState));                                                          // 998
                                                                                                                     // 999
			// Return true                                                                                                    // 1000
			return true;                                                                                                      // 1001
		};                                                                                                                 // 1002
                                                                                                                     // 1003
		/**                                                                                                                // 1004
		 * History.getStateByIndex()                                                                                       // 1005
		 * Gets a state by the index                                                                                       // 1006
		 * @param {integer} index                                                                                          // 1007
		 * @return {Object}                                                                                                // 1008
		 */                                                                                                                // 1009
		History.getStateByIndex = function(index){                                                                         // 1010
			// Prepare                                                                                                        // 1011
			var State = null;                                                                                                 // 1012
                                                                                                                     // 1013
			// Handle                                                                                                         // 1014
			if ( typeof index === 'undefined' ) {                                                                             // 1015
				// Get the last inserted                                                                                         // 1016
				State = History.savedStates[History.savedStates.length-1];                                                       // 1017
			}                                                                                                                 // 1018
			else if ( index < 0 ) {                                                                                           // 1019
				// Get from the end                                                                                              // 1020
				State = History.savedStates[History.savedStates.length+index];                                                   // 1021
			}                                                                                                                 // 1022
			else {                                                                                                            // 1023
				// Get from the beginning                                                                                        // 1024
				State = History.savedStates[index];                                                                              // 1025
			}                                                                                                                 // 1026
                                                                                                                     // 1027
			// Return State                                                                                                   // 1028
			return State;                                                                                                     // 1029
		};                                                                                                                 // 1030
                                                                                                                     // 1031
                                                                                                                     // 1032
		// ====================================================================                                            // 1033
		// Hash Helpers                                                                                                    // 1034
                                                                                                                     // 1035
		/**                                                                                                                // 1036
		 * History.getHash()                                                                                               // 1037
		 * Gets the current document hash                                                                                  // 1038
		 * @return {string}                                                                                                // 1039
		 */                                                                                                                // 1040
		History.getHash = function(){                                                                                      // 1041
			var hash = History.unescapeHash(document.location.hash);                                                          // 1042
			return hash;                                                                                                      // 1043
		};                                                                                                                 // 1044
                                                                                                                     // 1045
		/**                                                                                                                // 1046
		 * History.unescapeString()                                                                                        // 1047
		 * Unescape a string                                                                                               // 1048
		 * @param {String} str                                                                                             // 1049
		 * @return {string}                                                                                                // 1050
		 */                                                                                                                // 1051
		History.unescapeString = function(str){                                                                            // 1052
			// Prepare                                                                                                        // 1053
			var result = str,                                                                                                 // 1054
				tmp;                                                                                                             // 1055
                                                                                                                     // 1056
			// Unescape hash                                                                                                  // 1057
			while ( true ) {                                                                                                  // 1058
				tmp = window.unescape(result);                                                                                   // 1059
				if ( tmp === result ) {                                                                                          // 1060
					break;                                                                                                          // 1061
				}                                                                                                                // 1062
				result = tmp;                                                                                                    // 1063
			}                                                                                                                 // 1064
                                                                                                                     // 1065
			// Return result                                                                                                  // 1066
			return result;                                                                                                    // 1067
		};                                                                                                                 // 1068
                                                                                                                     // 1069
		/**                                                                                                                // 1070
		 * History.unescapeHash()                                                                                          // 1071
		 * normalize and Unescape a Hash                                                                                   // 1072
		 * @param {String} hash                                                                                            // 1073
		 * @return {string}                                                                                                // 1074
		 */                                                                                                                // 1075
		History.unescapeHash = function(hash){                                                                             // 1076
			// Prepare                                                                                                        // 1077
			var result = History.normalizeHash(hash);                                                                         // 1078
                                                                                                                     // 1079
			// Unescape hash                                                                                                  // 1080
			result = History.unescapeString(result);                                                                          // 1081
                                                                                                                     // 1082
			// Return result                                                                                                  // 1083
			return result;                                                                                                    // 1084
		};                                                                                                                 // 1085
                                                                                                                     // 1086
		/**                                                                                                                // 1087
		 * History.normalizeHash()                                                                                         // 1088
		 * normalize a hash across browsers                                                                                // 1089
		 * @return {string}                                                                                                // 1090
		 */                                                                                                                // 1091
		History.normalizeHash = function(hash){                                                                            // 1092
			// Prepare                                                                                                        // 1093
			var result = hash.replace(/[^#]*#/,'').replace(/#.*/, '');                                                        // 1094
                                                                                                                     // 1095
			// Return result                                                                                                  // 1096
			return result;                                                                                                    // 1097
		};                                                                                                                 // 1098
                                                                                                                     // 1099
		/**                                                                                                                // 1100
		 * History.setHash(hash)                                                                                           // 1101
		 * Sets the document hash                                                                                          // 1102
		 * @param {string} hash                                                                                            // 1103
		 * @return {History}                                                                                               // 1104
		 */                                                                                                                // 1105
		History.setHash = function(hash,queue){                                                                            // 1106
			// Prepare                                                                                                        // 1107
			var adjustedHash, State, pageUrl;                                                                                 // 1108
                                                                                                                     // 1109
			// Handle Queueing                                                                                                // 1110
			if ( queue !== false && History.busy() ) {                                                                        // 1111
				// Wait + Push to Queue                                                                                          // 1112
				//History.debug('History.setHash: we must wait', arguments);                                                     // 1113
				History.pushQueue({                                                                                              // 1114
					scope: History,                                                                                                 // 1115
					callback: History.setHash,                                                                                      // 1116
					args: arguments,                                                                                                // 1117
					queue: queue                                                                                                    // 1118
				});                                                                                                              // 1119
				return false;                                                                                                    // 1120
			}                                                                                                                 // 1121
                                                                                                                     // 1122
			// Log                                                                                                            // 1123
			//History.debug('History.setHash: called',hash);                                                                  // 1124
                                                                                                                     // 1125
			// Prepare                                                                                                        // 1126
			adjustedHash = History.escapeHash(hash);                                                                          // 1127
                                                                                                                     // 1128
			// Make Busy + Continue                                                                                           // 1129
			History.busy(true);                                                                                               // 1130
                                                                                                                     // 1131
			// Check if hash is a state                                                                                       // 1132
			State = History.extractState(hash,true);                                                                          // 1133
			if ( State && !History.emulated.pushState ) {                                                                     // 1134
				// Hash is a state so skip the setHash                                                                           // 1135
				//History.debug('History.setHash: Hash is a state so skipping the hash set with a direct pushState call',arguments);
                                                                                                                     // 1137
				// PushState                                                                                                     // 1138
				History.pushState(State.data,State.title,State.url,false);                                                       // 1139
			}                                                                                                                 // 1140
			else if ( document.location.hash !== adjustedHash ) {                                                             // 1141
				// Hash is a proper hash, so apply it                                                                            // 1142
                                                                                                                     // 1143
				// Handle browser bugs                                                                                           // 1144
				if ( History.bugs.setHash ) {                                                                                    // 1145
					// Fix Safari Bug https://bugs.webkit.org/show_bug.cgi?id=56249                                                 // 1146
                                                                                                                     // 1147
					// Fetch the base page                                                                                          // 1148
					pageUrl = History.getPageUrl();                                                                                 // 1149
                                                                                                                     // 1150
					// Safari hash apply                                                                                            // 1151
					History.pushState(null,null,pageUrl+'#'+adjustedHash,false);                                                    // 1152
				}                                                                                                                // 1153
				else {                                                                                                           // 1154
					// Normal hash apply                                                                                            // 1155
					document.location.hash = adjustedHash;                                                                          // 1156
				}                                                                                                                // 1157
			}                                                                                                                 // 1158
                                                                                                                     // 1159
			// Chain                                                                                                          // 1160
			return History;                                                                                                   // 1161
		};                                                                                                                 // 1162
                                                                                                                     // 1163
		/**                                                                                                                // 1164
		 * History.escape()                                                                                                // 1165
		 * normalize and Escape a Hash                                                                                     // 1166
		 * @return {string}                                                                                                // 1167
		 */                                                                                                                // 1168
		History.escapeHash = function(hash){                                                                               // 1169
			// Prepare                                                                                                        // 1170
			var result = History.normalizeHash(hash);                                                                         // 1171
                                                                                                                     // 1172
			// Escape hash                                                                                                    // 1173
			result = window.escape(result);                                                                                   // 1174
                                                                                                                     // 1175
			// IE6 Escape Bug                                                                                                 // 1176
			if ( !History.bugs.hashEscape ) {                                                                                 // 1177
				// Restore common parts                                                                                          // 1178
				result = result                                                                                                  // 1179
					.replace(/\%21/g,'!')                                                                                           // 1180
					.replace(/\%26/g,'&')                                                                                           // 1181
					.replace(/\%3D/g,'=')                                                                                           // 1182
					.replace(/\%3F/g,'?');                                                                                          // 1183
			}                                                                                                                 // 1184
                                                                                                                     // 1185
			// Return result                                                                                                  // 1186
			return result;                                                                                                    // 1187
		};                                                                                                                 // 1188
                                                                                                                     // 1189
		/**                                                                                                                // 1190
		 * History.getHashByUrl(url)                                                                                       // 1191
		 * Extracts the Hash from a URL                                                                                    // 1192
		 * @param {string} url                                                                                             // 1193
		 * @return {string} url                                                                                            // 1194
		 */                                                                                                                // 1195
		History.getHashByUrl = function(url){                                                                              // 1196
			// Extract the hash                                                                                               // 1197
			var hash = String(url)                                                                                            // 1198
				.replace(/([^#]*)#?([^#]*)#?(.*)/, '$2')                                                                         // 1199
				;                                                                                                                // 1200
                                                                                                                     // 1201
			// Unescape hash                                                                                                  // 1202
			hash = History.unescapeHash(hash);                                                                                // 1203
                                                                                                                     // 1204
			// Return hash                                                                                                    // 1205
			return hash;                                                                                                      // 1206
		};                                                                                                                 // 1207
                                                                                                                     // 1208
		/**                                                                                                                // 1209
		 * History.setTitle(title)                                                                                         // 1210
		 * Applies the title to the document                                                                               // 1211
		 * @param {State} newState                                                                                         // 1212
		 * @return {Boolean}                                                                                               // 1213
		 */                                                                                                                // 1214
		History.setTitle = function(newState){                                                                             // 1215
			// Prepare                                                                                                        // 1216
			var title = newState.title,                                                                                       // 1217
				firstState;                                                                                                      // 1218
                                                                                                                     // 1219
			// Initial                                                                                                        // 1220
			if ( !title ) {                                                                                                   // 1221
				firstState = History.getStateByIndex(0);                                                                         // 1222
				if ( firstState && firstState.url === newState.url ) {                                                           // 1223
					title = firstState.title||History.options.initialTitle;                                                         // 1224
				}                                                                                                                // 1225
			}                                                                                                                 // 1226
                                                                                                                     // 1227
			// Apply                                                                                                          // 1228
			try {                                                                                                             // 1229
				document.getElementsByTagName('title')[0].innerHTML = title.replace('<','&lt;').replace('>','&gt;').replace(' & ',' &amp; ');
			}                                                                                                                 // 1231
			catch ( Exception ) { }                                                                                           // 1232
			document.title = title;                                                                                           // 1233
                                                                                                                     // 1234
			// Chain                                                                                                          // 1235
			return History;                                                                                                   // 1236
		};                                                                                                                 // 1237
                                                                                                                     // 1238
                                                                                                                     // 1239
		// ====================================================================                                            // 1240
		// Queueing                                                                                                        // 1241
                                                                                                                     // 1242
		/**                                                                                                                // 1243
		 * History.queues                                                                                                  // 1244
		 * The list of queues to use                                                                                       // 1245
		 * First In, First Out                                                                                             // 1246
		 */                                                                                                                // 1247
		History.queues = [];                                                                                               // 1248
                                                                                                                     // 1249
		/**                                                                                                                // 1250
		 * History.busy(value)                                                                                             // 1251
		 * @param {boolean} value [optional]                                                                               // 1252
		 * @return {boolean} busy                                                                                          // 1253
		 */                                                                                                                // 1254
		History.busy = function(value){                                                                                    // 1255
			// Apply                                                                                                          // 1256
			if ( typeof value !== 'undefined' ) {                                                                             // 1257
				//History.debug('History.busy: changing ['+(History.busy.flag||false)+'] to ['+(value||false)+']', History.queues.length);
				History.busy.flag = value;                                                                                       // 1259
			}                                                                                                                 // 1260
			// Default                                                                                                        // 1261
			else if ( typeof History.busy.flag === 'undefined' ) {                                                            // 1262
				History.busy.flag = false;                                                                                       // 1263
			}                                                                                                                 // 1264
                                                                                                                     // 1265
			// Queue                                                                                                          // 1266
			if ( !History.busy.flag ) {                                                                                       // 1267
				// Execute the next item in the queue                                                                            // 1268
				clearTimeout(History.busy.timeout);                                                                              // 1269
				var fireNext = function(){                                                                                       // 1270
					var i, queue, item;                                                                                             // 1271
					if ( History.busy.flag ) return;                                                                                // 1272
					for ( i=History.queues.length-1; i >= 0; --i ) {                                                                // 1273
						queue = History.queues[i];                                                                                     // 1274
						if ( queue.length === 0 ) continue;                                                                            // 1275
						item = queue.shift();                                                                                          // 1276
						History.fireQueueItem(item);                                                                                   // 1277
						History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);                                         // 1278
					}                                                                                                               // 1279
				};                                                                                                               // 1280
				History.busy.timeout = setTimeout(fireNext,History.options.busyDelay);                                           // 1281
			}                                                                                                                 // 1282
                                                                                                                     // 1283
			// Return                                                                                                         // 1284
			return History.busy.flag;                                                                                         // 1285
		};                                                                                                                 // 1286
                                                                                                                     // 1287
		/**                                                                                                                // 1288
		 * History.busy.flag                                                                                               // 1289
		 */                                                                                                                // 1290
		History.busy.flag = false;                                                                                         // 1291
                                                                                                                     // 1292
		/**                                                                                                                // 1293
		 * History.fireQueueItem(item)                                                                                     // 1294
		 * Fire a Queue Item                                                                                               // 1295
		 * @param {Object} item                                                                                            // 1296
		 * @return {Mixed} result                                                                                          // 1297
		 */                                                                                                                // 1298
		History.fireQueueItem = function(item){                                                                            // 1299
			return item.callback.apply(item.scope||History,item.args||[]);                                                    // 1300
		};                                                                                                                 // 1301
                                                                                                                     // 1302
		/**                                                                                                                // 1303
		 * History.pushQueue(callback,args)                                                                                // 1304
		 * Add an item to the queue                                                                                        // 1305
		 * @param {Object} item [scope,callback,args,queue]                                                                // 1306
		 */                                                                                                                // 1307
		History.pushQueue = function(item){                                                                                // 1308
			// Prepare the queue                                                                                              // 1309
			History.queues[item.queue||0] = History.queues[item.queue||0]||[];                                                // 1310
                                                                                                                     // 1311
			// Add to the queue                                                                                               // 1312
			History.queues[item.queue||0].push(item);                                                                         // 1313
                                                                                                                     // 1314
			// Chain                                                                                                          // 1315
			return History;                                                                                                   // 1316
		};                                                                                                                 // 1317
                                                                                                                     // 1318
		/**                                                                                                                // 1319
		 * History.queue (item,queue), (func,queue), (func), (item)                                                        // 1320
		 * Either firs the item now if not busy, or adds it to the queue                                                   // 1321
		 */                                                                                                                // 1322
		History.queue = function(item,queue){                                                                              // 1323
			// Prepare                                                                                                        // 1324
			if ( typeof item === 'function' ) {                                                                               // 1325
				item = {                                                                                                         // 1326
					callback: item                                                                                                  // 1327
				};                                                                                                               // 1328
			}                                                                                                                 // 1329
			if ( typeof queue !== 'undefined' ) {                                                                             // 1330
				item.queue = queue;                                                                                              // 1331
			}                                                                                                                 // 1332
                                                                                                                     // 1333
			// Handle                                                                                                         // 1334
			if ( History.busy() ) {                                                                                           // 1335
				History.pushQueue(item);                                                                                         // 1336
			} else {                                                                                                          // 1337
				History.fireQueueItem(item);                                                                                     // 1338
			}                                                                                                                 // 1339
                                                                                                                     // 1340
			// Chain                                                                                                          // 1341
			return History;                                                                                                   // 1342
		};                                                                                                                 // 1343
                                                                                                                     // 1344
		/**                                                                                                                // 1345
		 * History.clearQueue()                                                                                            // 1346
		 * Clears the Queue                                                                                                // 1347
		 */                                                                                                                // 1348
		History.clearQueue = function(){                                                                                   // 1349
			History.busy.flag = false;                                                                                        // 1350
			History.queues = [];                                                                                              // 1351
			return History;                                                                                                   // 1352
		};                                                                                                                 // 1353
                                                                                                                     // 1354
                                                                                                                     // 1355
		// ====================================================================                                            // 1356
		// IE Bug Fix                                                                                                      // 1357
                                                                                                                     // 1358
		/**                                                                                                                // 1359
		 * History.stateChanged                                                                                            // 1360
		 * States whether or not the state has changed since the last double check was initialised                         // 1361
		 */                                                                                                                // 1362
		History.stateChanged = false;                                                                                      // 1363
                                                                                                                     // 1364
		/**                                                                                                                // 1365
		 * History.doubleChecker                                                                                           // 1366
		 * Contains the timeout used for the double checks                                                                 // 1367
		 */                                                                                                                // 1368
		History.doubleChecker = false;                                                                                     // 1369
                                                                                                                     // 1370
		/**                                                                                                                // 1371
		 * History.doubleCheckComplete()                                                                                   // 1372
		 * Complete a double check                                                                                         // 1373
		 * @return {History}                                                                                               // 1374
		 */                                                                                                                // 1375
		History.doubleCheckComplete = function(){                                                                          // 1376
			// Update                                                                                                         // 1377
			History.stateChanged = true;                                                                                      // 1378
                                                                                                                     // 1379
			// Clear                                                                                                          // 1380
			History.doubleCheckClear();                                                                                       // 1381
                                                                                                                     // 1382
			// Chain                                                                                                          // 1383
			return History;                                                                                                   // 1384
		};                                                                                                                 // 1385
                                                                                                                     // 1386
		/**                                                                                                                // 1387
		 * History.doubleCheckClear()                                                                                      // 1388
		 * Clear a double check                                                                                            // 1389
		 * @return {History}                                                                                               // 1390
		 */                                                                                                                // 1391
		History.doubleCheckClear = function(){                                                                             // 1392
			// Clear                                                                                                          // 1393
			if ( History.doubleChecker ) {                                                                                    // 1394
				clearTimeout(History.doubleChecker);                                                                             // 1395
				History.doubleChecker = false;                                                                                   // 1396
			}                                                                                                                 // 1397
                                                                                                                     // 1398
			// Chain                                                                                                          // 1399
			return History;                                                                                                   // 1400
		};                                                                                                                 // 1401
                                                                                                                     // 1402
		/**                                                                                                                // 1403
		 * History.doubleCheck()                                                                                           // 1404
		 * Create a double check                                                                                           // 1405
		 * @return {History}                                                                                               // 1406
		 */                                                                                                                // 1407
		History.doubleCheck = function(tryAgain){                                                                          // 1408
			// Reset                                                                                                          // 1409
			History.stateChanged = false;                                                                                     // 1410
			History.doubleCheckClear();                                                                                       // 1411
                                                                                                                     // 1412
			// Fix IE6,IE7 bug where calling history.back or history.forward does not actually change the hash (whereas doing it manually does)
			// Fix Safari 5 bug where sometimes the state does not change: https://bugs.webkit.org/show_bug.cgi?id=42940      // 1414
			if ( History.bugs.ieDoubleCheck ) {                                                                               // 1415
				// Apply Check                                                                                                   // 1416
				History.doubleChecker = setTimeout(                                                                              // 1417
					function(){                                                                                                     // 1418
						History.doubleCheckClear();                                                                                    // 1419
						if ( !History.stateChanged ) {                                                                                 // 1420
							//History.debug('History.doubleCheck: State has not yet changed, trying again', arguments);                   // 1421
							// Re-Attempt                                                                                                 // 1422
							tryAgain();                                                                                                   // 1423
						}                                                                                                              // 1424
						return true;                                                                                                   // 1425
					},                                                                                                              // 1426
					History.options.doubleCheckInterval                                                                             // 1427
				);                                                                                                               // 1428
			}                                                                                                                 // 1429
                                                                                                                     // 1430
			// Chain                                                                                                          // 1431
			return History;                                                                                                   // 1432
		};                                                                                                                 // 1433
                                                                                                                     // 1434
                                                                                                                     // 1435
		// ====================================================================                                            // 1436
		// Safari Bug Fix                                                                                                  // 1437
                                                                                                                     // 1438
		/**                                                                                                                // 1439
		 * History.safariStatePoll()                                                                                       // 1440
		 * Poll the current state                                                                                          // 1441
		 * @return {History}                                                                                               // 1442
		 */                                                                                                                // 1443
		History.safariStatePoll = function(){                                                                              // 1444
			// Poll the URL                                                                                                   // 1445
                                                                                                                     // 1446
			// Get the Last State which has the new URL                                                                       // 1447
			var                                                                                                               // 1448
				urlState = History.extractState(document.location.href),                                                         // 1449
				newState;                                                                                                        // 1450
                                                                                                                     // 1451
			// Check for a difference                                                                                         // 1452
			if ( !History.isLastSavedState(urlState) ) {                                                                      // 1453
				newState = urlState;                                                                                             // 1454
			}                                                                                                                 // 1455
			else {                                                                                                            // 1456
				return;                                                                                                          // 1457
			}                                                                                                                 // 1458
                                                                                                                     // 1459
			// Check if we have a state with that url                                                                         // 1460
			// If not create it                                                                                               // 1461
			if ( !newState ) {                                                                                                // 1462
				//History.debug('History.safariStatePoll: new');                                                                 // 1463
				newState = History.createStateObject();                                                                          // 1464
			}                                                                                                                 // 1465
                                                                                                                     // 1466
			// Apply the New State                                                                                            // 1467
			//History.debug('History.safariStatePoll: trigger');                                                              // 1468
			History.Adapter.trigger(window,'popstate');                                                                       // 1469
                                                                                                                     // 1470
			// Chain                                                                                                          // 1471
			return History;                                                                                                   // 1472
		};                                                                                                                 // 1473
                                                                                                                     // 1474
                                                                                                                     // 1475
		// ====================================================================                                            // 1476
		// State Aliases                                                                                                   // 1477
                                                                                                                     // 1478
		/**                                                                                                                // 1479
		 * History.back(queue)                                                                                             // 1480
		 * Send the browser history back one item                                                                          // 1481
		 * @param {Integer} queue [optional]                                                                               // 1482
		 */                                                                                                                // 1483
		History.back = function(queue){                                                                                    // 1484
			//History.debug('History.back: called', arguments);                                                               // 1485
                                                                                                                     // 1486
			// Handle Queueing                                                                                                // 1487
			if ( queue !== false && History.busy() ) {                                                                        // 1488
				// Wait + Push to Queue                                                                                          // 1489
				//History.debug('History.back: we must wait', arguments);                                                        // 1490
				History.pushQueue({                                                                                              // 1491
					scope: History,                                                                                                 // 1492
					callback: History.back,                                                                                         // 1493
					args: arguments,                                                                                                // 1494
					queue: queue                                                                                                    // 1495
				});                                                                                                              // 1496
				return false;                                                                                                    // 1497
			}                                                                                                                 // 1498
                                                                                                                     // 1499
			// Make Busy + Continue                                                                                           // 1500
			History.busy(true);                                                                                               // 1501
                                                                                                                     // 1502
			// Fix certain browser bugs that prevent the state from changing                                                  // 1503
			History.doubleCheck(function(){                                                                                   // 1504
				History.back(false);                                                                                             // 1505
			});                                                                                                               // 1506
                                                                                                                     // 1507
			// Go back                                                                                                        // 1508
			history.go(-1);                                                                                                   // 1509
                                                                                                                     // 1510
			// End back closure                                                                                               // 1511
			return true;                                                                                                      // 1512
		};                                                                                                                 // 1513
                                                                                                                     // 1514
		/**                                                                                                                // 1515
		 * History.forward(queue)                                                                                          // 1516
		 * Send the browser history forward one item                                                                       // 1517
		 * @param {Integer} queue [optional]                                                                               // 1518
		 */                                                                                                                // 1519
		History.forward = function(queue){                                                                                 // 1520
			//History.debug('History.forward: called', arguments);                                                            // 1521
                                                                                                                     // 1522
			// Handle Queueing                                                                                                // 1523
			if ( queue !== false && History.busy() ) {                                                                        // 1524
				// Wait + Push to Queue                                                                                          // 1525
				//History.debug('History.forward: we must wait', arguments);                                                     // 1526
				History.pushQueue({                                                                                              // 1527
					scope: History,                                                                                                 // 1528
					callback: History.forward,                                                                                      // 1529
					args: arguments,                                                                                                // 1530
					queue: queue                                                                                                    // 1531
				});                                                                                                              // 1532
				return false;                                                                                                    // 1533
			}                                                                                                                 // 1534
                                                                                                                     // 1535
			// Make Busy + Continue                                                                                           // 1536
			History.busy(true);                                                                                               // 1537
                                                                                                                     // 1538
			// Fix certain browser bugs that prevent the state from changing                                                  // 1539
			History.doubleCheck(function(){                                                                                   // 1540
				History.forward(false);                                                                                          // 1541
			});                                                                                                               // 1542
                                                                                                                     // 1543
			// Go forward                                                                                                     // 1544
			history.go(1);                                                                                                    // 1545
                                                                                                                     // 1546
			// End forward closure                                                                                            // 1547
			return true;                                                                                                      // 1548
		};                                                                                                                 // 1549
                                                                                                                     // 1550
		/**                                                                                                                // 1551
		 * History.go(index,queue)                                                                                         // 1552
		 * Send the browser history back or forward index times                                                            // 1553
		 * @param {Integer} queue [optional]                                                                               // 1554
		 */                                                                                                                // 1555
		History.go = function(index,queue){                                                                                // 1556
			//History.debug('History.go: called', arguments);                                                                 // 1557
                                                                                                                     // 1558
			// Prepare                                                                                                        // 1559
			var i;                                                                                                            // 1560
                                                                                                                     // 1561
			// Handle                                                                                                         // 1562
			if ( index > 0 ) {                                                                                                // 1563
				// Forward                                                                                                       // 1564
				for ( i=1; i<=index; ++i ) {                                                                                     // 1565
					History.forward(queue);                                                                                         // 1566
				}                                                                                                                // 1567
			}                                                                                                                 // 1568
			else if ( index < 0 ) {                                                                                           // 1569
				// Backward                                                                                                      // 1570
				for ( i=-1; i>=index; --i ) {                                                                                    // 1571
					History.back(queue);                                                                                            // 1572
				}                                                                                                                // 1573
			}                                                                                                                 // 1574
			else {                                                                                                            // 1575
				throw new Error('History.go: History.go requires a positive or negative integer passed.');                       // 1576
			}                                                                                                                 // 1577
                                                                                                                     // 1578
			// Chain                                                                                                          // 1579
			return History;                                                                                                   // 1580
		};                                                                                                                 // 1581
                                                                                                                     // 1582
                                                                                                                     // 1583
		// ====================================================================                                            // 1584
		// HTML5 State Support                                                                                             // 1585
                                                                                                                     // 1586
		// Non-Native pushState Implementation                                                                             // 1587
		if ( History.emulated.pushState ) {                                                                                // 1588
			/*                                                                                                                // 1589
			 * Provide Skeleton for HTML4 Browsers                                                                            // 1590
			 */                                                                                                               // 1591
                                                                                                                     // 1592
			// Prepare                                                                                                        // 1593
			var emptyFunction = function(){};                                                                                 // 1594
			History.pushState = History.pushState||emptyFunction;                                                             // 1595
			History.replaceState = History.replaceState||emptyFunction;                                                       // 1596
		} // History.emulated.pushState                                                                                    // 1597
                                                                                                                     // 1598
		// Native pushState Implementation                                                                                 // 1599
		else {                                                                                                             // 1600
			/*                                                                                                                // 1601
			 * Use native HTML5 History API Implementation                                                                    // 1602
			 */                                                                                                               // 1603
                                                                                                                     // 1604
			/**                                                                                                               // 1605
			 * History.onPopState(event,extra)                                                                                // 1606
			 * Refresh the Current State                                                                                      // 1607
			 */                                                                                                               // 1608
			History.onPopState = function(event,extra){                                                                       // 1609
				// Prepare                                                                                                       // 1610
				var stateId = false, newState = false, currentHash, currentState;                                                // 1611
                                                                                                                     // 1612
				// Reset the double check                                                                                        // 1613
				History.doubleCheckComplete();                                                                                   // 1614
                                                                                                                     // 1615
				// Check for a Hash, and handle apporiatly                                                                       // 1616
				currentHash	= History.getHash();                                                                                 // 1617
				if ( currentHash ) {                                                                                             // 1618
					// Expand Hash                                                                                                  // 1619
					currentState = History.extractState(currentHash||document.location.href,true);                                  // 1620
					if ( currentState ) {                                                                                           // 1621
						// We were able to parse it, it must be a State!                                                               // 1622
						// Let's forward to replaceState                                                                               // 1623
						//History.debug('History.onPopState: state anchor', currentHash, currentState);                                // 1624
						History.replaceState(currentState.data, currentState.title, currentState.url, false);                          // 1625
					}                                                                                                               // 1626
					else {                                                                                                          // 1627
						// Traditional Anchor                                                                                          // 1628
						//History.debug('History.onPopState: traditional anchor', currentHash);                                        // 1629
						History.Adapter.trigger(window,'anchorchange');                                                                // 1630
						History.busy(false);                                                                                           // 1631
					}                                                                                                               // 1632
                                                                                                                     // 1633
					// We don't care for hashes                                                                                     // 1634
					History.expectedStateId = false;                                                                                // 1635
					return false;                                                                                                   // 1636
				}                                                                                                                // 1637
                                                                                                                     // 1638
				// Ensure                                                                                                        // 1639
				stateId = History.Adapter.extractEventData('state',event,extra) || false;                                        // 1640
                                                                                                                     // 1641
				// Fetch State                                                                                                   // 1642
				if ( stateId ) {                                                                                                 // 1643
					// Vanilla: Back/forward button was used                                                                        // 1644
					newState = History.getStateById(stateId);                                                                       // 1645
				}                                                                                                                // 1646
				else if ( History.expectedStateId ) {                                                                            // 1647
					// Vanilla: A new state was pushed, and popstate was called manually                                            // 1648
					newState = History.getStateById(History.expectedStateId);                                                       // 1649
				}                                                                                                                // 1650
				else {                                                                                                           // 1651
					// Initial State                                                                                                // 1652
					newState = History.extractState(document.location.href);                                                        // 1653
				}                                                                                                                // 1654
                                                                                                                     // 1655
				// The State did not exist in our store                                                                          // 1656
				if ( !newState ) {                                                                                               // 1657
					// Regenerate the State                                                                                         // 1658
					newState = History.createStateObject(null,null,document.location.href);                                         // 1659
				}                                                                                                                // 1660
                                                                                                                     // 1661
				// Clean                                                                                                         // 1662
				History.expectedStateId = false;                                                                                 // 1663
                                                                                                                     // 1664
				// Check if we are the same state                                                                                // 1665
				if ( History.isLastSavedState(newState) ) {                                                                      // 1666
					// There has been no change (just the page's hash has finally propagated)                                       // 1667
					//History.debug('History.onPopState: no change', newState, History.savedStates);                                // 1668
					History.busy(false);                                                                                            // 1669
					return false;                                                                                                   // 1670
				}                                                                                                                // 1671
                                                                                                                     // 1672
				// Store the State                                                                                               // 1673
				History.storeState(newState);                                                                                    // 1674
				History.saveState(newState);                                                                                     // 1675
                                                                                                                     // 1676
				// Force update of the title                                                                                     // 1677
				History.setTitle(newState);                                                                                      // 1678
                                                                                                                     // 1679
				// Fire Our Event                                                                                                // 1680
				History.Adapter.trigger(window,'statechange');                                                                   // 1681
				History.busy(false);                                                                                             // 1682
                                                                                                                     // 1683
				// Return true                                                                                                   // 1684
				return true;                                                                                                     // 1685
			};                                                                                                                // 1686
			History.Adapter.bind(window,'popstate',History.onPopState);                                                       // 1687
                                                                                                                     // 1688
			/**                                                                                                               // 1689
			 * History.pushState(data,title,url)                                                                              // 1690
			 * Add a new State to the history object, become it, and trigger onpopstate                                       // 1691
			 * We have to trigger for HTML4 compatibility                                                                     // 1692
			 * @param {object} data                                                                                           // 1693
			 * @param {string} title                                                                                          // 1694
			 * @param {string} url                                                                                            // 1695
			 * @return {true}                                                                                                 // 1696
			 */                                                                                                               // 1697
			History.pushState = function(data,title,url,queue){                                                               // 1698
				//History.debug('History.pushState: called', arguments);                                                         // 1699
                                                                                                                     // 1700
				// Check the State                                                                                               // 1701
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {                                                 // 1702
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');             // 1703
				}                                                                                                                // 1704
                                                                                                                     // 1705
				// Handle Queueing                                                                                               // 1706
				if ( queue !== false && History.busy() ) {                                                                       // 1707
					// Wait + Push to Queue                                                                                         // 1708
					//History.debug('History.pushState: we must wait', arguments);                                                  // 1709
					History.pushQueue({                                                                                             // 1710
						scope: History,                                                                                                // 1711
						callback: History.pushState,                                                                                   // 1712
						args: arguments,                                                                                               // 1713
						queue: queue                                                                                                   // 1714
					});                                                                                                             // 1715
					return false;                                                                                                   // 1716
				}                                                                                                                // 1717
                                                                                                                     // 1718
				// Make Busy + Continue                                                                                          // 1719
				History.busy(true);                                                                                              // 1720
                                                                                                                     // 1721
				// Create the newState                                                                                           // 1722
				var newState = History.createStateObject(data,title,url);                                                        // 1723
                                                                                                                     // 1724
				// Check it                                                                                                      // 1725
				if ( History.isLastSavedState(newState) ) {                                                                      // 1726
					// Won't be a change                                                                                            // 1727
					History.busy(false);                                                                                            // 1728
				}                                                                                                                // 1729
				else {                                                                                                           // 1730
					// Store the newState                                                                                           // 1731
					History.storeState(newState);                                                                                   // 1732
					History.expectedStateId = newState.id;                                                                          // 1733
                                                                                                                     // 1734
					// Push the newState                                                                                            // 1735
					history.pushState(newState.id,newState.title,newState.url);                                                     // 1736
                                                                                                                     // 1737
					// Fire HTML5 Event                                                                                             // 1738
					History.Adapter.trigger(window,'popstate');                                                                     // 1739
				}                                                                                                                // 1740
                                                                                                                     // 1741
				// End pushState closure                                                                                         // 1742
				return true;                                                                                                     // 1743
			};                                                                                                                // 1744
                                                                                                                     // 1745
			/**                                                                                                               // 1746
			 * History.replaceState(data,title,url)                                                                           // 1747
			 * Replace the State and trigger onpopstate                                                                       // 1748
			 * We have to trigger for HTML4 compatibility                                                                     // 1749
			 * @param {object} data                                                                                           // 1750
			 * @param {string} title                                                                                          // 1751
			 * @param {string} url                                                                                            // 1752
			 * @return {true}                                                                                                 // 1753
			 */                                                                                                               // 1754
			History.replaceState = function(data,title,url,queue){                                                            // 1755
				//History.debug('History.replaceState: called', arguments);                                                      // 1756
                                                                                                                     // 1757
				// Check the State                                                                                               // 1758
				if ( History.getHashByUrl(url) && History.emulated.pushState ) {                                                 // 1759
					throw new Error('History.js does not support states with fragement-identifiers (hashes/anchors).');             // 1760
				}                                                                                                                // 1761
                                                                                                                     // 1762
				// Handle Queueing                                                                                               // 1763
				if ( queue !== false && History.busy() ) {                                                                       // 1764
					// Wait + Push to Queue                                                                                         // 1765
					//History.debug('History.replaceState: we must wait', arguments);                                               // 1766
					History.pushQueue({                                                                                             // 1767
						scope: History,                                                                                                // 1768
						callback: History.replaceState,                                                                                // 1769
						args: arguments,                                                                                               // 1770
						queue: queue                                                                                                   // 1771
					});                                                                                                             // 1772
					return false;                                                                                                   // 1773
				}                                                                                                                // 1774
                                                                                                                     // 1775
				// Make Busy + Continue                                                                                          // 1776
				History.busy(true);                                                                                              // 1777
                                                                                                                     // 1778
				// Create the newState                                                                                           // 1779
				var newState = History.createStateObject(data,title,url);                                                        // 1780
                                                                                                                     // 1781
				// Check it                                                                                                      // 1782
				if ( History.isLastSavedState(newState) ) {                                                                      // 1783
					// Won't be a change                                                                                            // 1784
					History.busy(false);                                                                                            // 1785
				}                                                                                                                // 1786
				else {                                                                                                           // 1787
					// Store the newState                                                                                           // 1788
					History.storeState(newState);                                                                                   // 1789
					History.expectedStateId = newState.id;                                                                          // 1790
                                                                                                                     // 1791
					// Push the newState                                                                                            // 1792
					history.replaceState(newState.id,newState.title,newState.url);                                                  // 1793
                                                                                                                     // 1794
					// Fire HTML5 Event                                                                                             // 1795
					History.Adapter.trigger(window,'popstate');                                                                     // 1796
				}                                                                                                                // 1797
                                                                                                                     // 1798
				// End replaceState closure                                                                                      // 1799
				return true;                                                                                                     // 1800
			};                                                                                                                // 1801
                                                                                                                     // 1802
		} // !History.emulated.pushState                                                                                   // 1803
                                                                                                                     // 1804
                                                                                                                     // 1805
		// ====================================================================                                            // 1806
		// Initialise                                                                                                      // 1807
                                                                                                                     // 1808
		/**                                                                                                                // 1809
		 * Load the Store                                                                                                  // 1810
		 */                                                                                                                // 1811
		if ( sessionStorage ) {                                                                                            // 1812
			// Fetch                                                                                                          // 1813
			try {                                                                                                             // 1814
				History.store = JSON.parse(sessionStorage.getItem('History.store'))||{};                                         // 1815
			}                                                                                                                 // 1816
			catch ( err ) {                                                                                                   // 1817
				History.store = {};                                                                                              // 1818
			}                                                                                                                 // 1819
                                                                                                                     // 1820
			// Normalize                                                                                                      // 1821
			History.normalizeStore();                                                                                         // 1822
		}                                                                                                                  // 1823
		else {                                                                                                             // 1824
			// Default Load                                                                                                   // 1825
			History.store = {};                                                                                               // 1826
			History.normalizeStore();                                                                                         // 1827
		}                                                                                                                  // 1828
                                                                                                                     // 1829
		/**                                                                                                                // 1830
		 * Clear Intervals on exit to prevent memory leaks                                                                 // 1831
		 */                                                                                                                // 1832
		History.Adapter.bind(window,"beforeunload",History.clearAllIntervals);                                             // 1833
		History.Adapter.bind(window,"unload",History.clearAllIntervals);                                                   // 1834
                                                                                                                     // 1835
		/**                                                                                                                // 1836
		 * Create the initial State                                                                                        // 1837
		 */                                                                                                                // 1838
		History.saveState(History.storeState(History.extractState(document.location.href,true)));                          // 1839
                                                                                                                     // 1840
		/**                                                                                                                // 1841
		 * Bind for Saving Store                                                                                           // 1842
		 */                                                                                                                // 1843
		if ( sessionStorage ) {                                                                                            // 1844
			// When the page is closed                                                                                        // 1845
			History.onUnload = function(){                                                                                    // 1846
				// Prepare                                                                                                       // 1847
				var	currentStore, item;                                                                                          // 1848
                                                                                                                     // 1849
				// Fetch                                                                                                         // 1850
				try {                                                                                                            // 1851
					currentStore = JSON.parse(sessionStorage.getItem('History.store'))||{};                                         // 1852
				}                                                                                                                // 1853
				catch ( err ) {                                                                                                  // 1854
					currentStore = {};                                                                                              // 1855
				}                                                                                                                // 1856
                                                                                                                     // 1857
				// Ensure                                                                                                        // 1858
				currentStore.idToState = currentStore.idToState || {};                                                           // 1859
				currentStore.urlToId = currentStore.urlToId || {};                                                               // 1860
				currentStore.stateToId = currentStore.stateToId || {};                                                           // 1861
                                                                                                                     // 1862
				// Sync                                                                                                          // 1863
				for ( item in History.idToState ) {                                                                              // 1864
					if ( !History.idToState.hasOwnProperty(item) ) {                                                                // 1865
						continue;                                                                                                      // 1866
					}                                                                                                               // 1867
					currentStore.idToState[item] = History.idToState[item];                                                         // 1868
				}                                                                                                                // 1869
				for ( item in History.urlToId ) {                                                                                // 1870
					if ( !History.urlToId.hasOwnProperty(item) ) {                                                                  // 1871
						continue;                                                                                                      // 1872
					}                                                                                                               // 1873
					currentStore.urlToId[item] = History.urlToId[item];                                                             // 1874
				}                                                                                                                // 1875
				for ( item in History.stateToId ) {                                                                              // 1876
					if ( !History.stateToId.hasOwnProperty(item) ) {                                                                // 1877
						continue;                                                                                                      // 1878
					}                                                                                                               // 1879
					currentStore.stateToId[item] = History.stateToId[item];                                                         // 1880
				}                                                                                                                // 1881
                                                                                                                     // 1882
				// Update                                                                                                        // 1883
				History.store = currentStore;                                                                                    // 1884
				History.normalizeStore();                                                                                        // 1885
                                                                                                                     // 1886
				// Store                                                                                                         // 1887
				sessionStorage.setItem('History.store',JSON.stringify(currentStore));                                            // 1888
			};                                                                                                                // 1889
                                                                                                                     // 1890
			// For Internet Explorer                                                                                          // 1891
			History.intervalList.push(setInterval(History.onUnload,History.options.storeInterval));                           // 1892
			                                                                                                                  // 1893
			// For Other Browsers                                                                                             // 1894
			History.Adapter.bind(window,'beforeunload',History.onUnload);                                                     // 1895
			History.Adapter.bind(window,'unload',History.onUnload);                                                           // 1896
			                                                                                                                  // 1897
			// Both are enabled for consistency                                                                               // 1898
		}                                                                                                                  // 1899
                                                                                                                     // 1900
		// Non-Native pushState Implementation                                                                             // 1901
		if ( !History.emulated.pushState ) {                                                                               // 1902
			// Be aware, the following is only for native pushState implementations                                           // 1903
			// If you are wanting to include something for all browsers                                                       // 1904
			// Then include it above this if block                                                                            // 1905
                                                                                                                     // 1906
			/**                                                                                                               // 1907
			 * Setup Safari Fix                                                                                               // 1908
			 */                                                                                                               // 1909
			if ( History.bugs.safariPoll ) {                                                                                  // 1910
				History.intervalList.push(setInterval(History.safariStatePoll, History.options.safariPollInterval));             // 1911
			}                                                                                                                 // 1912
                                                                                                                     // 1913
			/**                                                                                                               // 1914
			 * Ensure Cross Browser Compatibility                                                                             // 1915
			 */                                                                                                               // 1916
			if ( navigator.vendor === 'Apple Computer, Inc.' || (navigator.appCodeName||'') === 'Mozilla' ) {                 // 1917
				/**                                                                                                              // 1918
				 * Fix Safari HashChange Issue                                                                                   // 1919
				 */                                                                                                              // 1920
                                                                                                                     // 1921
				// Setup Alias                                                                                                   // 1922
				History.Adapter.bind(window,'hashchange',function(){                                                             // 1923
					History.Adapter.trigger(window,'popstate');                                                                     // 1924
				});                                                                                                              // 1925
                                                                                                                     // 1926
				// Initialise Alias                                                                                              // 1927
				if ( History.getHash() ) {                                                                                       // 1928
					History.Adapter.onDomLoad(function(){                                                                           // 1929
						History.Adapter.trigger(window,'hashchange');                                                                  // 1930
					});                                                                                                             // 1931
				}                                                                                                                // 1932
			}                                                                                                                 // 1933
                                                                                                                     // 1934
		} // !History.emulated.pushState                                                                                   // 1935
                                                                                                                     // 1936
                                                                                                                     // 1937
	}; // History.initCore                                                                                              // 1938
                                                                                                                     // 1939
	// Try and Initialise History                                                                                       // 1940
	History.init();                                                                                                     // 1941
                                                                                                                     // 1942
})(window);                                                                                                          // 1943
                                                                                                                     // 1944
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

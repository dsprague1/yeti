(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/jquery-layout/jquery.layout.js                                                                             //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
/**                                                                                                                   // 1
 * @preserve                                                                                                          // 2
 * jquery.layout 1.3.0 - Release Candidate 30.79                                                                      // 3
 * $Date: 2013-01-12 08:00:00 (Sat, 12 Jan 2013) $                                                                    // 4
 * $Rev: 303007 $                                                                                                     // 5
 *                                                                                                                    // 6
 * Copyright (c) 2012                                                                                                 // 7
 *   Fabrizio Balliano (http://www.fabrizioballiano.net)                                                              // 8
 *   Kevin Dalman (http://allpro.net)                                                                                 // 9
 *                                                                                                                    // 10
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)                                                 // 11
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.                                             // 12
 *                                                                                                                    // 13
 * Changelog: http://layout.jquery-dev.net/changelog.cfm#1.3.0.rc30.79                                                // 14
 *                                                                                                                    // 15
 * Docs: http://layout.jquery-dev.net/documentation.html                                                              // 16
 * Tips: http://layout.jquery-dev.net/tips.html                                                                       // 17
 * Help: http://groups.google.com/group/jquery-ui-layout                                                              // 18
 */                                                                                                                   // 19
                                                                                                                      // 20
/* JavaDoc Info: http://code.google.com/closure/compiler/docs/js-for-compiler.html                                    // 21
 * {!Object}	non-nullable type (never NULL)                                                                           // 22
 * {?string}	nullable type (sometimes NULL) - default for {Object}                                                    // 23
 * {number=}	optional parameter                                                                                       // 24
 * {*}			ALL types                                                                                                    // 25
 */                                                                                                                   // 26
/*	TODO for jQ 2.0                                                                                                    // 27
 *	change .andSelf() to .addBack()                                                                                    // 28
 *	$.fn.disableSelection won't work                                                                                   // 29
 */                                                                                                                   // 30
                                                                                                                      // 31
// NOTE: For best readability, view with a fixed-width font and tabs equal to 4-chars                                 // 32
                                                                                                                      // 33
;(function ($) {                                                                                                      // 34
                                                                                                                      // 35
// alias Math methods - used a lot!                                                                                   // 36
var	min		= Math.min                                                                                                   // 37
,	max		= Math.max                                                                                                     // 38
,	round	= Math.floor                                                                                                  // 39
                                                                                                                      // 40
,	isStr	=  function (v) { return $.type(v) === "string"; }                                                            // 41
                                                                                                                      // 42
	/**                                                                                                                  // 43
	* @param {!Object}			Instance                                                                                        // 44
	* @param {Array.<string>}	a_fn                                                                                       // 45
	*/                                                                                                                   // 46
,	runPluginCallbacks = function (Instance, a_fn) {                                                                    // 47
		if ($.isArray(a_fn))                                                                                                // 48
			for (var i=0, c=a_fn.length; i<c; i++) {                                                                           // 49
				var fn = a_fn[i];                                                                                                 // 50
				try {                                                                                                             // 51
					if (isStr(fn)) // 'name' of a function                                                                           // 52
						fn = eval(fn);                                                                                                  // 53
					if ($.isFunction(fn))                                                                                            // 54
						g(fn)( Instance );                                                                                              // 55
				} catch (ex) {}                                                                                                   // 56
			}                                                                                                                  // 57
		function g (f) { return f; }; // compiler hack                                                                      // 58
	}                                                                                                                    // 59
;                                                                                                                     // 60
                                                                                                                      // 61
/*                                                                                                                    // 62
 *	GENERIC $.layout METHODS - used by all layouts                                                                     // 63
 */                                                                                                                   // 64
$.layout = {                                                                                                          // 65
                                                                                                                      // 66
	version:	"1.3.rc30.79"                                                                                               // 67
,	revision:	0.033007 // 1.3.0 final = 1.0300 - major(n+).minor(nn)+patch(nn+)                                         // 68
                                                                                                                      // 69
	// $.layout.browser REPLACES $.browser                                                                               // 70
,	browser:	{} // set below                                                                                            // 71
                                                                                                                      // 72
	// *PREDEFINED* EFFECTS & DEFAULTS                                                                                   // 73
	// MUST list effect here - OR MUST set an fxSettings option (can be an empty hash: {})                               // 74
,	effects: {                                                                                                          // 75
                                                                                                                      // 76
	//	Pane Open/Close Animations                                                                                        // 77
		slide: {                                                                                                            // 78
			all:	{ duration:  "fast"	} // eg: duration: 1000, easing: "easeOutBounce"                                          // 79
		,	north:	{ direction: "up"	}                                                                                        // 80
		,	south:	{ direction: "down"	}                                                                                      // 81
		,	east:	{ direction: "right"}                                                                                       // 82
		,	west:	{ direction: "left"	}                                                                                       // 83
		}                                                                                                                   // 84
	,	drop: {                                                                                                            // 85
			all:	{ duration:  "slow"	}                                                                                         // 86
		,	north:	{ direction: "up"	}                                                                                        // 87
		,	south:	{ direction: "down"	}                                                                                      // 88
		,	east:	{ direction: "right"}                                                                                       // 89
		,	west:	{ direction: "left"	}                                                                                       // 90
		}                                                                                                                   // 91
	,	scale: {                                                                                                           // 92
			all:	{ duration:	"fast"	}                                                                                          // 93
		}                                                                                                                   // 94
	//	these are not recommended, but can be used                                                                        // 95
	,	blind:		{}                                                                                                         // 96
	,	clip:		{}                                                                                                          // 97
	,	explode:	{}                                                                                                        // 98
	,	fade:		{}                                                                                                          // 99
	,	fold:		{}                                                                                                          // 100
	,	puff:		{}                                                                                                          // 101
                                                                                                                      // 102
	//	Pane Resize Animations                                                                                            // 103
	,	size: {                                                                                                            // 104
			all:	{ easing:	"swing"	}                                                                                           // 105
		}                                                                                                                   // 106
	}                                                                                                                    // 107
                                                                                                                      // 108
	// INTERNAL CONFIG DATA - DO NOT CHANGE THIS!                                                                        // 109
,	config: {                                                                                                           // 110
		optionRootKeys:	"effects,panes,north,south,west,east,center".split(",")                                             // 111
	,	allPanes:		"north,south,west,east,center".split(",")                                                               // 112
	,	borderPanes:	"north,south,west,east".split(",")                                                                    // 113
	,	oppositeEdge: {                                                                                                    // 114
			north:	"south"                                                                                                     // 115
		,	south:	"north"                                                                                                    // 116
		,	east: 	"west"                                                                                                     // 117
		,	west: 	"east"                                                                                                     // 118
		}                                                                                                                   // 119
	//	offscreen data                                                                                                    // 120
	,	offscreenCSS:	{ left: "-99999px", right: "auto" } // used by hide/close if useOffscreenClose=true                  // 121
	,	offscreenReset:	"offscreenReset" // key used for data                                                              // 122
	//	CSS used in multiple places                                                                                       // 123
	,	hidden:		{ visibility: "hidden" }                                                                                  // 124
	,	visible:	{ visibility: "visible" }                                                                                 // 125
	//	layout element settings                                                                                           // 126
	,	resizers: {                                                                                                        // 127
			cssReq: {                                                                                                          // 128
				position: 	"absolute"                                                                                             // 129
			,	padding: 	0                                                                                                      // 130
			,	margin: 	0                                                                                                       // 131
			,	fontSize:	"1px"                                                                                                  // 132
			,	textAlign:	"left"	// to counter-act "center" alignment!                                                          // 133
			,	overflow: 	"hidden" // prevent toggler-button from overflowing                                                   // 134
			//	SEE $.layout.defaults.zIndexes.resizer_normal                                                                   // 135
			}                                                                                                                  // 136
		,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true                                            // 137
				background: "#DDD"                                                                                                // 138
			,	border:		"none"                                                                                                  // 139
			}                                                                                                                  // 140
		}                                                                                                                   // 141
	,	togglers: {                                                                                                        // 142
			cssReq: {                                                                                                          // 143
				position: 	"absolute"                                                                                             // 144
			,	display: 	"block"                                                                                                // 145
			,	padding: 	0                                                                                                      // 146
			,	margin: 	0                                                                                                       // 147
			,	overflow:	"hidden"                                                                                               // 148
			,	textAlign:	"center"                                                                                              // 149
			,	fontSize:	"1px"                                                                                                  // 150
			,	cursor: 	"pointer"                                                                                               // 151
			,	zIndex: 	1                                                                                                       // 152
			}                                                                                                                  // 153
		,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true                                            // 154
				background: "#AAA"                                                                                                // 155
			}                                                                                                                  // 156
		}                                                                                                                   // 157
	,	content: {                                                                                                         // 158
			cssReq: {                                                                                                          // 159
				position:	"relative" /* contain floated or positioned elements */                                                 // 160
			}                                                                                                                  // 161
		,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true                                            // 162
				overflow:	"auto"                                                                                                  // 163
			,	padding:	"10px"                                                                                                  // 164
			}                                                                                                                  // 165
		,	cssDemoPane: { // DEMO CSS - REMOVE scrolling from 'pane' when it has a content-div                               // 166
				overflow:	"hidden"                                                                                                // 167
			,	padding:	0                                                                                                       // 168
			}                                                                                                                  // 169
		}                                                                                                                   // 170
	,	panes: { // defaults for ALL panes - overridden by 'per-pane settings' below                                       // 171
			cssReq: {                                                                                                          // 172
				position: 	"absolute"                                                                                             // 173
			,	margin:		0                                                                                                       // 174
			//	$.layout.defaults.zIndexes.pane_normal                                                                          // 175
			}                                                                                                                  // 176
		,	cssDemo: { // DEMO CSS - applied if: options.PANE.applyDemoStyles=true                                            // 177
				padding:	"10px"                                                                                                   // 178
			,	background:	"#FFF"                                                                                               // 179
			,	border:		"1px solid #BBB"                                                                                        // 180
			,	overflow:	"auto"                                                                                                 // 181
			}                                                                                                                  // 182
		}                                                                                                                   // 183
	,	north: {                                                                                                           // 184
			side:			"top"                                                                                                      // 185
		,	sizeType:		"Height"                                                                                               // 186
		,	dir:			"horz"                                                                                                     // 187
		,	cssReq: {                                                                                                         // 188
				top: 		0                                                                                                          // 189
			,	bottom: 	"auto"                                                                                                  // 190
			,	left: 		0                                                                                                        // 191
			,	right: 		0                                                                                                       // 192
			,	width: 		"auto"                                                                                                  // 193
			//	height: 	DYNAMIC                                                                                                // 194
			}                                                                                                                  // 195
		}                                                                                                                   // 196
	,	south: {                                                                                                           // 197
			side:			"bottom"                                                                                                   // 198
		,	sizeType:		"Height"                                                                                               // 199
		,	dir:			"horz"                                                                                                     // 200
		,	cssReq: {                                                                                                         // 201
				top: 		"auto"                                                                                                     // 202
			,	bottom: 	0                                                                                                       // 203
			,	left: 		0                                                                                                        // 204
			,	right: 		0                                                                                                       // 205
			,	width: 		"auto"                                                                                                  // 206
			//	height: 	DYNAMIC                                                                                                // 207
			}                                                                                                                  // 208
		}                                                                                                                   // 209
	,	east: {                                                                                                            // 210
			side:			"right"                                                                                                    // 211
		,	sizeType:		"Width"                                                                                                // 212
		,	dir:			"vert"                                                                                                     // 213
		,	cssReq: {                                                                                                         // 214
				left: 		"auto"                                                                                                    // 215
			,	right: 		0                                                                                                       // 216
			,	top: 		"auto" // DYNAMIC                                                                                         // 217
			,	bottom: 	"auto" // DYNAMIC                                                                                       // 218
			,	height: 	"auto"                                                                                                  // 219
			//	width: 		DYNAMIC                                                                                                // 220
			}                                                                                                                  // 221
		}                                                                                                                   // 222
	,	west: {                                                                                                            // 223
			side:			"left"                                                                                                     // 224
		,	sizeType:		"Width"                                                                                                // 225
		,	dir:			"vert"                                                                                                     // 226
		,	cssReq: {                                                                                                         // 227
				left: 		0                                                                                                         // 228
			,	right: 		"auto"                                                                                                  // 229
			,	top: 		"auto" // DYNAMIC                                                                                         // 230
			,	bottom: 	"auto" // DYNAMIC                                                                                       // 231
			,	height: 	"auto"                                                                                                  // 232
			//	width: 		DYNAMIC                                                                                                // 233
			}                                                                                                                  // 234
		}                                                                                                                   // 235
	,	center: {                                                                                                          // 236
			dir:			"center"                                                                                                    // 237
		,	cssReq: {                                                                                                         // 238
				left: 		"auto" // DYNAMIC                                                                                         // 239
			,	right: 		"auto" // DYNAMIC                                                                                       // 240
			,	top: 		"auto" // DYNAMIC                                                                                         // 241
			,	bottom: 	"auto" // DYNAMIC                                                                                       // 242
			,	height: 	"auto"                                                                                                  // 243
			,	width: 		"auto"                                                                                                  // 244
			}                                                                                                                  // 245
		}                                                                                                                   // 246
	}                                                                                                                    // 247
                                                                                                                      // 248
	// CALLBACK FUNCTION NAMESPACE - used to store reusable callback functions                                           // 249
,	callbacks: {}                                                                                                       // 250
                                                                                                                      // 251
,	getParentPaneElem: function (el) {                                                                                  // 252
		// must pass either a container or pane element                                                                     // 253
		var $el = $(el)                                                                                                     // 254
		,	layout = $el.data("layout") || $el.data("parentLayout");                                                          // 255
		if (layout) {                                                                                                       // 256
			var $cont = layout.container;                                                                                      // 257
			// see if this container is directly-nested inside an outer-pane                                                   // 258
			if ($cont.data("layoutPane")) return $cont;                                                                        // 259
			var $pane = $cont.closest("."+ $.layout.defaults.panes.paneClass);                                                 // 260
			// if a pane was found, return it                                                                                  // 261
			if ($pane.data("layoutPane")) return $pane;                                                                        // 262
		}                                                                                                                   // 263
		return null;                                                                                                        // 264
	}                                                                                                                    // 265
                                                                                                                      // 266
,	getParentPaneInstance: function (el) {                                                                              // 267
		// must pass either a container or pane element                                                                     // 268
		var $pane = $.layout.getParentPaneElem(el);                                                                         // 269
		return $pane ? $pane.data("layoutPane") : null;                                                                     // 270
	}                                                                                                                    // 271
                                                                                                                      // 272
,	getParentLayoutInstance: function (el) {                                                                            // 273
		// must pass either a container or pane element                                                                     // 274
		var $pane = $.layout.getParentPaneElem(el);                                                                         // 275
		return $pane ? $pane.data("parentLayout") : null;                                                                   // 276
	}                                                                                                                    // 277
                                                                                                                      // 278
,	getEventObject: function (evt) {                                                                                    // 279
		return typeof evt === "object" && evt.stopPropagation ? evt : null;                                                 // 280
	}                                                                                                                    // 281
,	parsePaneName: function (evt_or_pane) {                                                                             // 282
		var evt = $.layout.getEventObject( evt_or_pane )                                                                    // 283
		,	pane = evt_or_pane;                                                                                               // 284
		if (evt) {                                                                                                          // 285
			// ALWAYS stop propagation of events triggered in Layout!                                                          // 286
			evt.stopPropagation();                                                                                             // 287
			pane = $(this).data("layoutEdge");                                                                                 // 288
		}                                                                                                                   // 289
		if (pane && !/^(west|east|north|south|center)$/.test(pane)) {                                                       // 290
			$.layout.msg('LAYOUT ERROR - Invalid pane-name: "'+ pane +'"');                                                    // 291
			pane = "error";                                                                                                    // 292
		}                                                                                                                   // 293
		return pane;                                                                                                        // 294
	}                                                                                                                    // 295
                                                                                                                      // 296
                                                                                                                      // 297
	// LAYOUT-PLUGIN REGISTRATION                                                                                        // 298
	// more plugins can added beyond this default list                                                                   // 299
,	plugins: {                                                                                                          // 300
		draggable:		!!$.fn.draggable // resizing                                                                            // 301
	,	effects: {                                                                                                         // 302
			core:		!!$.effects		// animimations (specific effects tested by initOptions)                                       // 303
		,	slide:		$.effects && ($.effects.slide || ($.effects.effect && $.effects.effect.slide)) // default effect          // 304
		}                                                                                                                   // 305
	}                                                                                                                    // 306
                                                                                                                      // 307
//	arrays of plugin or other methods to be triggered for events in *each layout* - will be passed 'Instance'          // 308
,	onCreate:	[]	// runs when layout is just starting to be created - right after options are set                       // 309
,	onLoad:		[]	// runs after layout container and global events init, but before initPanes is called                   // 310
,	onReady:	[]	// runs after initialization *completes* - ie, after initPanes completes successfully                   // 311
,	onDestroy:	[]	// runs after layout is destroyed                                                                     // 312
,	onUnload:	[]	// runs after layout is destroyed OR when page unloads                                                 // 313
,	afterOpen:	[]	// runs after setAsOpen() completes                                                                   // 314
,	afterClose:	[]	// runs after setAsClosed() completes                                                                // 315
                                                                                                                      // 316
	/*                                                                                                                   // 317
	*	GENERIC UTILITY METHODS                                                                                            // 318
	*/                                                                                                                   // 319
                                                                                                                      // 320
	// calculate and return the scrollbar width, as an integer                                                           // 321
,	scrollbarWidth:		function () { return window.scrollbarWidth  || $.layout.getScrollbarSize('width'); }               // 322
,	scrollbarHeight:	function () { return window.scrollbarHeight || $.layout.getScrollbarSize('height'); }              // 323
,	getScrollbarSize:	function (dim) {                                                                                  // 324
		var $c	= $('<div style="position: absolute; top: -10000px; left: -10000px; width: 100px; height: 100px; overflow: scroll;"></div>').appendTo("body");
		var d	= { width: $c.css("width") - $c[0].clientWidth, height: $c.height() - $c[0].clientHeight };                   // 326
		$c.remove();                                                                                                        // 327
		window.scrollbarWidth	= d.width;                                                                                    // 328
		window.scrollbarHeight	= d.height;                                                                                  // 329
		return dim.match(/^(width|height)$/) ? d[dim] : d;                                                                  // 330
	}                                                                                                                    // 331
                                                                                                                      // 332
                                                                                                                      // 333
	/**                                                                                                                  // 334
	* Returns hash container 'display' and 'visibility'                                                                  // 335
	*                                                                                                                    // 336
	* @see	$.swap() - swaps CSS, runs callback, resets CSS                                                               // 337
	* @param  {!Object}		$E				jQuery element                                                                            // 338
	* @param  {boolean=}	[force=false]	Run even if display != none                                                       // 339
	* @return {!Object}						Returns current style props, if applicable                                                  // 340
	*/                                                                                                                   // 341
,	showInvisibly: function ($E, force) {                                                                               // 342
		if ($E && $E.length && (force || $E.css("display") === "none")) { // only if not *already hidden*                   // 343
			var s = $E[0].style                                                                                                // 344
				// save ONLY the 'style' props because that is what we must restore                                               // 345
			,	CSS = { display: s.display || '', visibility: s.visibility || '' };                                              // 346
			// show element 'invisibly' so can be measured                                                                     // 347
			$E.css({ display: "block", visibility: "hidden" });                                                                // 348
			return CSS;                                                                                                        // 349
		}                                                                                                                   // 350
		return {};                                                                                                          // 351
	}                                                                                                                    // 352
                                                                                                                      // 353
	/**                                                                                                                  // 354
	* Returns data for setting size of an element (container or a pane).                                                 // 355
	*                                                                                                                    // 356
	* @see  _create(), onWindowResize() for container, plus others for pane                                              // 357
	* @return JSON  Returns a hash of all dimensions: top, bottom, left, right, outerWidth, innerHeight, etc             // 358
	*/                                                                                                                   // 359
,	getElementDimensions: function ($E, inset) {                                                                        // 360
		var                                                                                                                 // 361
		//	dimensions hash - start with current data IF passed                                                              // 362
			d	= { css: {}, inset: {} }                                                                                         // 363
		,	x	= d.css			// CSS hash                                                                                           // 364
		,	i	= { bottom: 0 }	// TEMP insets (bottom = complier hack)                                                         // 365
		,	N	= $.layout.cssNum                                                                                               // 366
		,	off = $E.offset()                                                                                                 // 367
		,	b, p, ei			// TEMP border, padding                                                                                // 368
		;                                                                                                                   // 369
		d.offsetLeft = off.left;                                                                                            // 370
		d.offsetTop  = off.top;                                                                                             // 371
                                                                                                                      // 372
		if (!inset) inset = {}; // simplify logic below                                                                     // 373
                                                                                                                      // 374
		$.each("Left,Right,Top,Bottom".split(","), function (idx, e) { // e = edge                                          // 375
			b = x["border" + e] = $.layout.borderWidth($E, e);                                                                 // 376
			p = x["padding"+ e] = $.layout.cssNum($E, "padding"+e);                                                            // 377
			ei = e.toLowerCase();                                                                                              // 378
			d.inset[ei] = inset[ei] >= 0 ? inset[ei] : p; // any missing insetX value = paddingX                               // 379
			i[ei] = d.inset[ei] + b; // total offset of content from outer side                                                // 380
		});                                                                                                                 // 381
                                                                                                                      // 382
		x.width		= $E.width();                                                                                              // 383
		x.height	= $E.height();                                                                                             // 384
		x.top		= N($E,"top",true);                                                                                          // 385
		x.bottom	= N($E,"bottom",true);                                                                                     // 386
		x.left		= N($E,"left",true);                                                                                        // 387
		x.right		= N($E,"right",true);                                                                                      // 388
                                                                                                                      // 389
		d.outerWidth	= $E.outerWidth();                                                                                     // 390
		d.outerHeight	= $E.outerHeight();                                                                                   // 391
		// calc the TRUE inner-dimensions, even in quirks-mode!                                                             // 392
		d.innerWidth	= max(0, d.outerWidth  - i.left - i.right);                                                            // 393
		d.innerHeight	= max(0, d.outerHeight - i.top  - i.bottom);                                                          // 394
		// layoutWidth/Height is used in calcs for manual resizing                                                          // 395
		// layoutW/H only differs from innerW/H when in quirks-mode - then is like outerW/H                                 // 396
		d.layoutWidth	= $E.innerWidth();                                                                                    // 397
		d.layoutHeight	= $E.innerHeight();                                                                                  // 398
                                                                                                                      // 399
		//if ($E.prop('tagName') === 'BODY') { debugData( d, $E.prop('tagName') ); } // DEBUG                               // 400
                                                                                                                      // 401
		//d.visible	= $E.is(":visible");// && x.width > 0 && x.height > 0;                                                  // 402
                                                                                                                      // 403
		return d;                                                                                                           // 404
	}                                                                                                                    // 405
                                                                                                                      // 406
,	getElementStyles: function ($E, list) {                                                                             // 407
		var                                                                                                                 // 408
			CSS	= {}                                                                                                           // 409
		,	style	= $E[0].style                                                                                               // 410
		,	props	= list.split(",")                                                                                           // 411
		,	sides	= "Top,Bottom,Left,Right".split(",")                                                                        // 412
		,	attrs	= "Color,Style,Width".split(",")                                                                            // 413
		,	p, s, a, i, j, k                                                                                                  // 414
		;                                                                                                                   // 415
		for (i=0; i < props.length; i++) {                                                                                  // 416
			p = props[i];                                                                                                      // 417
			if (p.match(/(border|padding|margin)$/))                                                                           // 418
				for (j=0; j < 4; j++) {                                                                                           // 419
					s = sides[j];                                                                                                    // 420
					if (p === "border")                                                                                              // 421
						for (k=0; k < 3; k++) {                                                                                         // 422
							a = attrs[k];                                                                                                  // 423
							CSS[p+s+a] = style[p+s+a];                                                                                     // 424
						}                                                                                                               // 425
					else                                                                                                             // 426
						CSS[p+s] = style[p+s];                                                                                          // 427
				}                                                                                                                 // 428
			else                                                                                                               // 429
				CSS[p] = style[p];                                                                                                // 430
		};                                                                                                                  // 431
		return CSS                                                                                                          // 432
	}                                                                                                                    // 433
                                                                                                                      // 434
	/**                                                                                                                  // 435
	* Return the innerWidth for the current browser/doctype                                                              // 436
	*                                                                                                                    // 437
	* @see  initPanes(), sizeMidPanes(), initHandles(), sizeHandles()                                                    // 438
	* @param  {Array.<Object>}	$E  Must pass a jQuery object - first element is processed                                // 439
	* @param  {number=}			outerWidth (optional) Can pass a width, allowing calculations BEFORE element is resized        // 440
	* @return {number}			Returns the innerWidth of the elem by subtracting padding and borders                           // 441
	*/                                                                                                                   // 442
,	cssWidth: function ($E, outerWidth) {                                                                               // 443
		// a 'calculated' outerHeight can be passed so borders and/or padding are removed if needed                         // 444
		if (outerWidth <= 0) return 0;                                                                                      // 445
                                                                                                                      // 446
		var bs	= !$.layout.browser.boxModel ? "border-box" : $.support.boxSizing ? $E.css("boxSizing") : "content-box"      // 447
		,	b	= $.layout.borderWidth                                                                                          // 448
		,	n	= $.layout.cssNum                                                                                               // 449
		,	W	= outerWidth                                                                                                    // 450
		;                                                                                                                   // 451
		// strip border and/or padding from outerWidth to get CSS Width                                                     // 452
		if (bs !== "border-box")                                                                                            // 453
			W -= (b($E, "Left") + b($E, "Right"));                                                                             // 454
		if (bs === "content-box")                                                                                           // 455
			W -= (n($E, "paddingLeft") + n($E, "paddingRight"));                                                               // 456
		return max(0,W);                                                                                                    // 457
	}                                                                                                                    // 458
                                                                                                                      // 459
	/**                                                                                                                  // 460
	* Return the innerHeight for the current browser/doctype                                                             // 461
	*                                                                                                                    // 462
	* @see  initPanes(), sizeMidPanes(), initHandles(), sizeHandles()                                                    // 463
	* @param  {Array.<Object>}	$E  Must pass a jQuery object - first element is processed                                // 464
	* @param  {number=}			outerHeight  (optional) Can pass a width, allowing calculations BEFORE element is resized      // 465
	* @return {number}			Returns the innerHeight of the elem by subtracting padding and borders                          // 466
	*/                                                                                                                   // 467
,	cssHeight: function ($E, outerHeight) {                                                                             // 468
		// a 'calculated' outerHeight can be passed so borders and/or padding are removed if needed                         // 469
		if (outerHeight <= 0) return 0;                                                                                     // 470
                                                                                                                      // 471
		var bs	= !$.layout.browser.boxModel ? "border-box" : $.support.boxSizing ? $E.css("boxSizing") : "content-box"      // 472
		,	b	= $.layout.borderWidth                                                                                          // 473
		,	n	= $.layout.cssNum                                                                                               // 474
		,	H	= outerHeight                                                                                                   // 475
		;                                                                                                                   // 476
		// strip border and/or padding from outerHeight to get CSS Height                                                   // 477
		if (bs !== "border-box")                                                                                            // 478
			H -= (b($E, "Top") + b($E, "Bottom"));                                                                             // 479
		if (bs === "content-box")                                                                                           // 480
			H -= (n($E, "paddingTop") + n($E, "paddingBottom"));                                                               // 481
		return max(0,H);                                                                                                    // 482
	}                                                                                                                    // 483
                                                                                                                      // 484
	/**                                                                                                                  // 485
	* Returns the 'current CSS numeric value' for a CSS property - 0 if property does not exist                          // 486
	*                                                                                                                    // 487
	* @see  Called by many methods                                                                                       // 488
	* @param {Array.<Object>}	$E					Must pass a jQuery object - first element is processed                              // 489
	* @param {string}			prop				The name of the CSS property, eg: top, width, etc.                                       // 490
	* @param {boolean=}			[allowAuto=false]	true = return 'auto' if that is value; false = return 0                      // 491
	* @return {(string|number)}						Usually used to get an integer value for position (top, left) or size (height, width)
	*/                                                                                                                   // 493
,	cssNum: function ($E, prop, allowAuto) {                                                                            // 494
		if (!$E.jquery) $E = $($E);                                                                                         // 495
		var CSS = $.layout.showInvisibly($E)                                                                                // 496
		,	p	= $.css($E[0], prop, true)                                                                                      // 497
		,	v	= allowAuto && p=="auto" ? p : Math.round(parseFloat(p) || 0);                                                  // 498
		$E.css( CSS ); // RESET                                                                                             // 499
		return v;                                                                                                           // 500
	}                                                                                                                    // 501
                                                                                                                      // 502
,	borderWidth: function (el, side) {                                                                                  // 503
		if (el.jquery) el = el[0];                                                                                          // 504
		var b = "border"+ side.substr(0,1).toUpperCase() + side.substr(1); // left => Left                                  // 505
		return $.css(el, b+"Style", true) === "none" ? 0 : Math.round(parseFloat($.css(el, b+"Width", true)) || 0);         // 506
	}                                                                                                                    // 507
                                                                                                                      // 508
	/**                                                                                                                  // 509
	* Mouse-tracking utility - FUTURE REFERENCE                                                                          // 510
	*                                                                                                                    // 511
	* init: if (!window.mouse) {                                                                                         // 512
	*			window.mouse = { x: 0, y: 0 };                                                                                   // 513
	*			$(document).mousemove( $.layout.trackMouse );                                                                    // 514
	*		}                                                                                                                 // 515
	*                                                                                                                    // 516
	* @param {Object}		evt                                                                                               // 517
	*                                                                                                                    // 518
,	trackMouse: function (evt) {                                                                                        // 519
		window.mouse = { x: evt.clientX, y: evt.clientY };                                                                  // 520
	}                                                                                                                    // 521
	*/                                                                                                                   // 522
                                                                                                                      // 523
	/**                                                                                                                  // 524
	* SUBROUTINE for preventPrematureSlideClose option                                                                   // 525
	*                                                                                                                    // 526
	* @param {Object}		evt                                                                                               // 527
	* @param {Object=}		el                                                                                               // 528
	*/                                                                                                                   // 529
,	isMouseOverElem: function (evt, el) {                                                                               // 530
		var                                                                                                                 // 531
			$E	= $(el || this)                                                                                                 // 532
		,	d	= $E.offset()                                                                                                   // 533
		,	T	= d.top                                                                                                         // 534
		,	L	= d.left                                                                                                        // 535
		,	R	= L + $E.outerWidth()                                                                                           // 536
		,	B	= T + $E.outerHeight()                                                                                          // 537
		,	x	= evt.pageX	// evt.clientX ?                                                                                    // 538
		,	y	= evt.pageY	// evt.clientY ?                                                                                    // 539
		;                                                                                                                   // 540
		// if X & Y are < 0, probably means is over an open SELECT                                                          // 541
		return ($.layout.browser.msie && x < 0 && y < 0) || ((x >= L && x <= R) && (y >= T && y <= B));                     // 542
	}                                                                                                                    // 543
                                                                                                                      // 544
	/**                                                                                                                  // 545
	* Message/Logging Utility                                                                                            // 546
	*                                                                                                                    // 547
	* @example $.layout.msg("My message");				// log text                                                                // 548
	* @example $.layout.msg("My message", true);		// alert text                                                          // 549
	* @example $.layout.msg({ foo: "bar" }, "Title");	// log hash-data, with custom title                                // 550
	* @example $.layout.msg({ foo: "bar" }, true, "Title", { sort: false }); -OR-                                        // 551
	* @example $.layout.msg({ foo: "bar" }, "Title", { sort: false, display: true }); // alert hash-data                 // 552
	*                                                                                                                    // 553
	* @param {(Object|string)}			info			String message OR Hash/Array                                                     // 554
	* @param {(Boolean|string|Object)=}	[popup=false]	True means alert-box - can be skipped                              // 555
	* @param {(Object|string)=}			[debugTitle=""]	Title for Hash data - can be skipped                                   // 556
	* @param {Object=}					[debugOpts]		Extra options for debug output                                                   // 557
	*/                                                                                                                   // 558
,	msg: function (info, popup, debugTitle, debugOpts) {                                                                // 559
		if ($.isPlainObject(info) && window.debugData) {                                                                    // 560
			if (typeof popup === "string") {                                                                                   // 561
				debugOpts	= debugTitle;                                                                                           // 562
				debugTitle	= popup;                                                                                               // 563
			}                                                                                                                  // 564
			else if (typeof debugTitle === "object") {                                                                         // 565
				debugOpts	= debugTitle;                                                                                           // 566
				debugTitle	= null;                                                                                                // 567
			}                                                                                                                  // 568
			var t = debugTitle || "log( <object> )"                                                                            // 569
			,	o = $.extend({ sort: false, returnHTML: false, display: false }, debugOpts);                                     // 570
			if (popup === true || o.display)                                                                                   // 571
				debugData( info, t, o );                                                                                          // 572
			else if (window.console)                                                                                           // 573
				console.log(debugData( info, t, o ));                                                                             // 574
		}                                                                                                                   // 575
		else if (popup)                                                                                                     // 576
			alert(info);                                                                                                       // 577
		else if (window.console)                                                                                            // 578
			console.log(info);                                                                                                 // 579
		else {                                                                                                              // 580
			var id	= "#layoutLogger"                                                                                           // 581
			,	$l = $(id);                                                                                                      // 582
			if (!$l.length)                                                                                                    // 583
				$l = createLog();                                                                                                 // 584
			$l.children("ul").append('<li style="padding: 4px 10px; margin: 0; border-top: 1px solid #CCC;">'+ info.replace(/\</g,"&lt;").replace(/\>/g,"&gt;") +'</li>');
		}                                                                                                                   // 586
                                                                                                                      // 587
		function createLog () {                                                                                             // 588
			var pos = $.support.fixedPosition ? 'fixed' : 'absolute'                                                           // 589
			,	$e = $('<div id="layoutLogger" style="position: '+ pos +'; top: 5px; z-index: 999999; max-width: 25%; overflow: hidden; border: 1px solid #000; border-radius: 5px; background: #FBFBFB; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">'
				+	'<div style="font-size: 13px; font-weight: bold; padding: 5px 10px; background: #F6F6F6; border-radius: 5px 5px 0 0; cursor: move;">'
				+	'<span style="float: right; padding-left: 7px; cursor: pointer;" title="Remove Console" onclick="$(this).closest(\'#layoutLogger\').remove()">X</span>Layout console.log</div>'
				+	'<ul style="font-size: 13px; font-weight: none; list-style: none; margin: 0; padding: 0 0 2px;"></ul>'          // 593
				+ '</div>'                                                                                                        // 594
				).appendTo("body");                                                                                               // 595
			$e.css('left', $(window).width() - $e.outerWidth() - 5)                                                            // 596
			if ($.ui.draggable) $e.draggable({ handle: ':first-child' });                                                      // 597
			return $e;                                                                                                         // 598
		};                                                                                                                  // 599
	}                                                                                                                    // 600
                                                                                                                      // 601
};                                                                                                                    // 602
                                                                                                                      // 603
                                                                                                                      // 604
/*                                                                                                                    // 605
 *	$.layout.browser REPLACES removed $.browser, with extra data                                                       // 606
 *	Parsing code here adapted from jQuery 1.8 $.browse                                                                 // 607
 */                                                                                                                   // 608
var u = navigator.userAgent.toLowerCase()                                                                             // 609
,	m = /(chrome)[ \/]([\w.]+)/.exec( u )                                                                               // 610
	||	/(webkit)[ \/]([\w.]+)/.exec( u )                                                                                 // 611
	||	/(opera)(?:.*version|)[ \/]([\w.]+)/.exec( u )                                                                    // 612
	||	/(msie) ([\w.]+)/.exec( u )                                                                                       // 613
	||	u.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec( u )                                          // 614
	||	[]                                                                                                                // 615
,	b = m[1] || ""                                                                                                      // 616
,	v = m[2] || 0                                                                                                       // 617
,	ie = b === "msie"                                                                                                   // 618
;                                                                                                                     // 619
$.layout.browser = {                                                                                                  // 620
	version:	v                                                                                                           // 621
,	safari:		b === "webkit"	// webkit (NOT chrome) = safari                                                             // 622
,	webkit:		b === "chrome"	// chrome = webkit                                                                          // 623
,	msie:		ie                                                                                                           // 624
,	isIE6:		ie && v == 6                                                                                                // 625
	// ONLY IE reverts to old box-model - update for older jQ onReady                                                    // 626
,	boxModel:	!ie || $.support.boxModel !== false                                                                       // 627
};                                                                                                                    // 628
if (b) $.layout.browser[b] = true; // set CURRENT browser                                                             // 629
/*	OLD versions of jQuery only set $.support.boxModel after page is loaded                                            // 630
 *	so if this is IE, use support.boxModel to test for quirks-mode (ONLY IE changes boxModel) */                       // 631
if (ie) $(function(){ $.layout.browser.boxModel = $.support.boxModel; });                                             // 632
                                                                                                                      // 633
                                                                                                                      // 634
// DEFAULT OPTIONS                                                                                                    // 635
$.layout.defaults = {                                                                                                 // 636
/*                                                                                                                    // 637
 *	LAYOUT & LAYOUT-CONTAINER OPTIONS                                                                                  // 638
 *	- none of these options are applicable to individual panes                                                         // 639
 */                                                                                                                   // 640
	name:						""			// Not required, but useful for buttons and used for the state-cookie                                // 641
,	containerClass:				"ui-layout-container" // layout-container element                                                // 642
,	inset:						null		// custom container-inset values (override padding)                                               // 643
,	scrollToBookmarkOnLoad:		true		// after creating a layout, scroll to bookmark in URL (.../page.htm#myBookmark)      // 644
,	resizeWithWindow:			true		// bind thisLayout.resizeAll() to the window.resize event                                 // 645
,	resizeWithWindowDelay:		200			// delay calling resizeAll because makes window resizing very jerky                   // 646
,	resizeWithWindowMaxDelay:	0			// 0 = none - force resize every XX ms while window is being resized                  // 647
,	maskPanesEarly:				false		// true = create pane-masks on resizer.mouseDown instead of waiting for resizer.dragstart // 648
,	onresizeall_start:			null		// CALLBACK when resizeAll() STARTS	- NOT pane-specific                                  // 649
,	onresizeall_end:			null		// CALLBACK when resizeAll() ENDS	- NOT pane-specific                                      // 650
,	onload_start:				null		// CALLBACK when Layout inits - after options initialized, but before elements               // 651
,	onload_end:					null		// CALLBACK when Layout inits - after EVERYTHING has been initialized                         // 652
,	onunload_start:				null		// CALLBACK when Layout is destroyed OR onWindowUnload                                     // 653
,	onunload_end:				null		// CALLBACK when Layout is destroyed OR onWindowUnload                                       // 654
,	initPanes:					true		// false = DO NOT initialize the panes onLoad - will init later                                // 655
,	showErrorMessages:			true		// enables fatal error messages to warn developers of common errors                      // 656
,	showDebugMessages:			false		// display console-and-alert debug msgs - IF this Layout version _has_ debugging code!  // 657
//	Changing this zIndex value will cause other zIndex values to automatically change                                  // 658
,	zIndex:						null		// the PANE zIndex - resizers and masks will be +1                                               // 659
//	DO NOT CHANGE the zIndex values below unless you clearly understand their relationships                            // 660
,	zIndexes: {								// set _default_ z-index values here...                                                          // 661
		pane_normal:			0			// normal z-index for panes                                                                      // 662
	,	content_mask:			1			// applied to overlays used to mask content INSIDE panes during resizing                       // 663
	,	resizer_normal:			2			// normal z-index for resizer-bars                                                           // 664
	,	pane_sliding:			100			// applied to *BOTH* the pane and its resizer when a pane is 'slid open'                     // 665
	,	pane_animate:			1000		// applied to the pane when being animated - not applied to the resizer                      // 666
	,	resizer_drag:			10000		// applied to the CLONED resizer-bar when being 'dragged'                                   // 667
	}                                                                                                                    // 668
,	errors: {                                                                                                           // 669
		pane:					"pane"		// description of "layout pane element" - used only in error messages                             // 670
	,	selector:				"selector"	// description of "jQuery-selector" - used only in error messages                          // 671
	,	addButtonError:			"Error Adding Button\nInvalid "                                                                  // 672
	,	containerMissing:		"UI Layout Initialization Error\nThe specified layout-container does not exist."                // 673
	,	centerPaneMissing:		"UI Layout Initialization Error\nThe center-pane element does not exist.\nThe center-pane is a required element."
	,	noContainerHeight:		"UI Layout Initialization Warning\nThe layout-container \"CONTAINER\" has no height.\nTherefore the layout is 0-height and hence 'invisible'!"
	,	callbackError:			"UI Layout Callback Error\nThe EVENT callback is not a valid function."                           // 676
	}                                                                                                                    // 677
/*                                                                                                                    // 678
 *	PANE DEFAULT SETTINGS                                                                                              // 679
 *	- settings under the 'panes' key become the default settings for *all panes*                                       // 680
 *	- ALL pane-options can also be set specifically for each panes, which will override these 'default values'         // 681
 */                                                                                                                   // 682
,	panes: { // default options for 'all panes' - will be overridden by 'per-pane settings'                             // 683
		applyDemoStyles: 		false		// NOTE: renamed from applyDefaultStyles for clarity                                      // 684
	,	closable:				true		// pane can open & close                                                                        // 685
	,	resizable:				true		// when open, pane can be resized                                                              // 686
	,	slidable:				true		// when closed, pane can 'slide open' over other panes - closes on mouse-out                    // 687
	,	initClosed:				false		// true = init pane as 'closed'                                                              // 688
	,	initHidden: 			false 		// true = init pane as 'hidden' - no resizer-bar/spacing                                    // 689
	//	SELECTORS                                                                                                         // 690
	//,	paneSelector:			""			// MUST be pane-specific - jQuery selector for pane                                         // 691
	,	contentSelector:		".ui-layout-content" // INNER div/element to auto-size so only it scrolls, not the entire pane!  // 692
	,	contentIgnoreSelector:	".ui-layout-ignore"	// element(s) to 'ignore' when measuring 'content'                      // 693
	,	findNestedContent:		false		// true = $P.find(contentSelector), false = $P.children(contentSelector)                // 694
	//	GENERIC ROOT-CLASSES - for auto-generated classNames                                                              // 695
	,	paneClass:				"ui-layout-pane"	// Layout Pane                                                                      // 696
	,	resizerClass:			"ui-layout-resizer"	// Resizer Bar                                                                 // 697
	,	togglerClass:			"ui-layout-toggler"	// Toggler Button                                                              // 698
	,	buttonClass:			"ui-layout-button"	// CUSTOM Buttons	- eg: '[ui-layout-button]-toggle/-open/-close/-pin'            // 699
	//	ELEMENT SIZE & SPACING                                                                                            // 700
	//,	size:					100			// MUST be pane-specific -initial size of pane                                                   // 701
	,	minSize:				0			// when manually resizing a pane                                                                   // 702
	,	maxSize:				0			// ditto, 0 = no limit                                                                             // 703
	,	spacing_open:			6			// space between pane and adjacent panes - when pane is 'open'                                 // 704
	,	spacing_closed:			6			// ditto - when pane is 'closed'                                                             // 705
	,	togglerLength_open:		50			// Length = WIDTH of toggler button on north/south sides - HEIGHT on east/west sides     // 706
	,	togglerLength_closed: 	50			// 100% OR -1 means 'full height/width of resizer bar' - 0 means 'hidden'              // 707
	,	togglerAlign_open:		"center"	// top/left, bottom/right, center, OR...                                              // 708
	,	togglerAlign_closed:	"center"	// 1 => nn = offset from top/left, -1 => -nn == offset from bottom/right             // 709
	,	togglerContent_open:	""			// text or HTML to put INSIDE the toggler                                                // 710
	,	togglerContent_closed:	""			// ditto                                                                               // 711
	//	RESIZING OPTIONS                                                                                                  // 712
	,	resizerDblClickToggle:	true		//                                                                                    // 713
	,	autoResize:				true		// IF size is 'auto' or a percentage, then recalc 'pixel size' whenever the layout resizes    // 714
	,	autoReopen:				true		// IF a pane was auto-closed due to noRoom, reopen it when there is room? False = leave it closed
	,	resizerDragOpacity:		1			// option for ui.draggable                                                                // 716
	//,	resizerCursor:			""			// MUST be pane-specific - cursor when over resizer-bar                                    // 717
	,	maskContents:			false		// true = add DIV-mask over-or-inside this pane so can 'drag' over IFRAMES                  // 718
	,	maskObjects:			false		// true = add IFRAME-mask over-or-inside this pane to cover objects/applets - content-mask will overlay this mask
	,	maskZindex:				null		// will override zIndexes.content_mask if specified - not applicable to iframe-panes          // 720
	,	resizingGrid:			false		// grid size that the resizers will snap-to during resizing, eg: [20,20]                    // 721
	,	livePaneResizing:		false		// true = LIVE Resizing as resizer is dragged                                            // 722
	,	liveContentResizing:	false		// true = re-measure header/footer heights as resizer is dragged                       // 723
	,	liveResizingTolerance:	1			// how many px change before pane resizes, to control performance                       // 724
	//	SLIDING OPTIONS                                                                                                   // 725
	,	sliderCursor:			"pointer"	// cursor when resizer-bar will trigger 'sliding'                                        // 726
	,	slideTrigger_open:		"click"		// click, dblclick, mouseenter                                                        // 727
	,	slideTrigger_close:		"mouseleave"// click, mouseleave                                                              // 728
	,	slideDelay_open:		300			// applies only for mouseenter event - 0 = instant open                                    // 729
	,	slideDelay_close:		300			// applies only for mouseleave event (300ms is the minimum!)                              // 730
	,	hideTogglerOnSlide:		false		// when pane is slid-open, should the toggler show?                                    // 731
	,	preventQuickSlideClose:	$.layout.browser.webkit // Chrome triggers slideClosed as it is opening                    // 732
	,	preventPrematureSlideClose: false	// handle incorrect mouseleave trigger, like when over a SELECT-list in IE       // 733
	//	PANE-SPECIFIC TIPS & MESSAGES                                                                                     // 734
	,	tips: {                                                                                                            // 735
			Open:				"Open"		// eg: "Open Pane"                                                                                // 736
		,	Close:				"Close"                                                                                                 // 737
		,	Resize:				"Resize"                                                                                               // 738
		,	Slide:				"Slide Open"                                                                                            // 739
		,	Pin:				"Pin"                                                                                                     // 740
		,	Unpin:				"Un-Pin"                                                                                                // 741
		,	noRoomToOpen:		"Not enough room to show this panel."	// alert if user tries to open a pane that cannot            // 742
		,	minSizeWarning:		"Panel has reached its minimum size"	// displays in browser statusbar                            // 743
		,	maxSizeWarning:		"Panel has reached its maximum size"	// ditto                                                    // 744
		}                                                                                                                   // 745
	//	HOT-KEYS & MISC                                                                                                   // 746
	,	showOverflowOnHover:	false		// will bind allowOverflow() utility to pane.onMouseOver                               // 747
	,	enableCursorHotkey:		true		// enabled 'cursor' hotkeys                                                             // 748
	//,	customHotkey:			""			// MUST be pane-specific - EITHER a charCode OR a character                                 // 749
	,	customHotkeyModifier:	"SHIFT"		// either 'SHIFT', 'CTRL' or 'CTRL+SHIFT' - NOT 'ALT'                               // 750
	//	PANE ANIMATION                                                                                                    // 751
	//	NOTE: fxSss_open, fxSss_close & fxSss_size options (eg: fxName_open) are auto-generated if not passed             // 752
	,	fxName:					"slide" 	// ('none' or blank), slide, drop, scale -- only relevant to 'open' & 'close', NOT 'size'     // 753
	,	fxSpeed:				null		// slow, normal, fast, 200, nnn - if passed, will OVERRIDE fxSettings.duration                   // 754
	,	fxSettings:				{}			// can be passed, eg: { easing: "easeOutBounce", duration: 1500 }                              // 755
	,	fxOpacityFix:			true		// tries to fix opacity in IE to restore anti-aliasing after animation                       // 756
	,	animatePaneSizing:		false		// true = animate resizing after dragging resizer-bar OR sizePane() is called           // 757
	/*  NOTE: Action-specific FX options are auto-generated from the options above if not specifically set:              // 758
		fxName_open:			"slide"		// 'Open' pane animation                                                                    // 759
		fnName_close:			"slide"		// 'Close' pane animation                                                                  // 760
		fxName_size:			"slide"		// 'Size' pane animation - when animatePaneSizing = true                                    // 761
		fxSpeed_open:			null                                                                                                // 762
		fxSpeed_close:			null                                                                                               // 763
		fxSpeed_size:			null                                                                                                // 764
		fxSettings_open:		{}                                                                                                // 765
		fxSettings_close:		{}                                                                                               // 766
		fxSettings_size:		{}                                                                                                // 767
	*/                                                                                                                   // 768
	//	CHILD/NESTED LAYOUTS                                                                                              // 769
	,	children:				null		// Layout-options for nested/child layout - even {} is valid as options                         // 770
	,	containerSelector:		''			// if child is NOT 'directly nested', a selector to find it/them (can have more than one child layout!)
	,	initChildren:			true		// true = child layout will be created as soon as _this_ layout completes initialization     // 772
	,	destroyChildren:		true		// true = destroy child-layout if this pane is destroyed                                   // 773
	,	resizeChildren:			true		// true = trigger child-layout.resizeAll() when this pane is resized                       // 774
	//	EVENT TRIGGERING                                                                                                  // 775
	,	triggerEventsOnLoad:	false		// true = trigger onopen OR onclose callbacks when layout initializes                  // 776
	,	triggerEventsDuringLiveResize: true	// true = trigger onresize callback REPEATEDLY if livePaneResizing==true       // 777
	//	PANE CALLBACKS                                                                                                    // 778
	,	onshow_start:			null		// CALLBACK when pane STARTS to Show	- BEFORE onopen/onhide_start                            // 779
	,	onshow_end:				null		// CALLBACK when pane ENDS being Shown	- AFTER  onopen/onhide_end                             // 780
	,	onhide_start:			null		// CALLBACK when pane STARTS to Close	- BEFORE onclose_start                                 // 781
	,	onhide_end:				null		// CALLBACK when pane ENDS being Closed	- AFTER  onclose_end                                  // 782
	,	onopen_start:			null		// CALLBACK when pane STARTS to Open                                                         // 783
	,	onopen_end:				null		// CALLBACK when pane ENDS being Opened                                                       // 784
	,	onclose_start:			null		// CALLBACK when pane STARTS to Close                                                       // 785
	,	onclose_end:			null		// CALLBACK when pane ENDS being Closed                                                       // 786
	,	onresize_start:			null		// CALLBACK when pane STARTS being Resized ***FOR ANY REASON***                            // 787
	,	onresize_end:			null		// CALLBACK when pane ENDS being Resized ***FOR ANY REASON***                                // 788
	,	onsizecontent_start:	null		// CALLBACK when sizing of content-element STARTS                                       // 789
	,	onsizecontent_end:		null		// CALLBACK when sizing of content-element ENDS                                          // 790
	,	onswap_start:			null		// CALLBACK when pane STARTS to Swap                                                         // 791
	,	onswap_end:				null		// CALLBACK when pane ENDS being Swapped                                                      // 792
	,	ondrag_start:			null		// CALLBACK when pane STARTS being ***MANUALLY*** Resized                                    // 793
	,	ondrag_end:				null		// CALLBACK when pane ENDS being ***MANUALLY*** Resized                                       // 794
	}                                                                                                                    // 795
/*                                                                                                                    // 796
 *	PANE-SPECIFIC SETTINGS                                                                                             // 797
 *	- options listed below MUST be specified per-pane - they CANNOT be set under 'panes'                               // 798
 *	- all options under the 'panes' key can also be set specifically for any pane                                      // 799
 *	- most options under the 'panes' key apply only to 'border-panes' - NOT the the center-pane                        // 800
 */                                                                                                                   // 801
,	north: {                                                                                                            // 802
		paneSelector:			".ui-layout-north"                                                                                  // 803
	,	size:					"auto"		// eg: "auto", "30%", .30, 200                                                                   // 804
	,	resizerCursor:			"n-resize"	// custom = url(myCursor.cur)                                                          // 805
	,	customHotkey:			""			// EITHER a charCode (43) OR a character ("o")                                                // 806
	}                                                                                                                    // 807
,	south: {                                                                                                            // 808
		paneSelector:			".ui-layout-south"                                                                                  // 809
	,	size:					"auto"                                                                                                   // 810
	,	resizerCursor:			"s-resize"                                                                                        // 811
	,	customHotkey:			""                                                                                                 // 812
	}                                                                                                                    // 813
,	east: {                                                                                                             // 814
		paneSelector:			".ui-layout-east"                                                                                   // 815
	,	size:					200                                                                                                      // 816
	,	resizerCursor:			"e-resize"                                                                                        // 817
	,	customHotkey:			""                                                                                                 // 818
	}                                                                                                                    // 819
,	west: {                                                                                                             // 820
		paneSelector:			".ui-layout-west"                                                                                   // 821
	,	size:					200                                                                                                      // 822
	,	resizerCursor:			"w-resize"                                                                                        // 823
	,	customHotkey:			""                                                                                                 // 824
	}                                                                                                                    // 825
,	center: {                                                                                                           // 826
		paneSelector:			".ui-layout-center"                                                                                 // 827
	,	minWidth:				0                                                                                                     // 828
	,	minHeight:				0                                                                                                    // 829
	}                                                                                                                    // 830
};                                                                                                                    // 831
                                                                                                                      // 832
$.layout.optionsMap = {                                                                                               // 833
	// layout/global options - NOT pane-options                                                                          // 834
	layout: ("name,instanceKey,stateManagement,effects,inset,zIndexes,errors,"                                           // 835
	+	"zIndex,scrollToBookmarkOnLoad,showErrorMessages,maskPanesEarly,"                                                  // 836
	+	"outset,resizeWithWindow,resizeWithWindowDelay,resizeWithWindowMaxDelay,"                                          // 837
	+	"onresizeall,onresizeall_start,onresizeall_end,onload,onload_start,onload_end,onunload,onunload_start,onunload_end").split(",")
//	borderPanes: [ ALL options that are NOT specified as 'layout' ]                                                    // 839
	// default.panes options that apply to the center-pane (most options apply _only_ to border-panes)                   // 840
,	center: ("paneClass,contentSelector,contentIgnoreSelector,findNestedContent,applyDemoStyles,triggerEventsOnLoad,"   // 841
	+	"showOverflowOnHover,maskContents,maskObjects,liveContentResizing,"                                                // 842
	+	"containerSelector,children,initChildren,resizeChildren,destroyChildren,"                                          // 843
	+	"onresize,onresize_start,onresize_end,onsizecontent,onsizecontent_start,onsizecontent_end").split(",")             // 844
	// options that MUST be specifically set 'per-pane' - CANNOT set in the panes (defaults) key                         // 845
,	noDefault: ("paneSelector,resizerCursor,customHotkey").split(",")                                                   // 846
};                                                                                                                    // 847
                                                                                                                      // 848
/**                                                                                                                   // 849
 * Processes options passed in converts flat-format data into subkey (JSON) format                                    // 850
 * In flat-format, subkeys are _currently_ separated with 2 underscores, like north__optName                          // 851
 * Plugins may also call this method so they can transform their own data                                             // 852
 *                                                                                                                    // 853
 * @param  {!Object}	hash			Data/options passed by user - may be a single level or nested levels                      // 854
 * @param  {boolean=}	[addKeys=false]	Should the primary layout.options keys be added if they do not exist?           // 855
 * @return {Object}						Returns hash of minWidth & minHeight                                                         // 856
 */                                                                                                                   // 857
$.layout.transformData = function (hash, addKeys) {                                                                   // 858
	var	json = addKeys ? { panes: {}, center: {} } : {} // init return object                                            // 859
	,	branch, optKey, keys, key, val, i, c;                                                                              // 860
                                                                                                                      // 861
	if (typeof hash !== "object") return json; // no options passed                                                      // 862
                                                                                                                      // 863
	// convert all 'flat-keys' to 'sub-key' format                                                                       // 864
	for (optKey in hash) {                                                                                               // 865
		branch	= json;                                                                                                      // 866
		val		= hash[ optKey ];                                                                                              // 867
		keys	= optKey.split("__"); // eg: west__size or north__fxSettings__duration                                         // 868
		c		= keys.length - 1;                                                                                               // 869
		// convert underscore-delimited to subkeys                                                                          // 870
		for (i=0; i <= c; i++) {                                                                                            // 871
			key = keys[i];                                                                                                     // 872
			if (i === c) {	// last key = value                                                                                 // 873
				if ($.isPlainObject( val ))                                                                                       // 874
					branch[key] = $.layout.transformData( val ); // RECURSE                                                          // 875
				else                                                                                                              // 876
					branch[key] = val;                                                                                               // 877
			}                                                                                                                  // 878
			else {                                                                                                             // 879
				if (!branch[key])                                                                                                 // 880
					branch[key] = {}; // create the subkey                                                                           // 881
				// recurse to sub-key for next loop - if not done                                                                 // 882
				branch = branch[key];                                                                                             // 883
			}                                                                                                                  // 884
		}                                                                                                                   // 885
	}                                                                                                                    // 886
	return json;                                                                                                         // 887
};                                                                                                                    // 888
                                                                                                                      // 889
// INTERNAL CONFIG DATA - DO NOT CHANGE THIS!                                                                         // 890
$.layout.backwardCompatibility = {                                                                                    // 891
	// data used by renameOldOptions()                                                                                   // 892
	map: {                                                                                                               // 893
	//	OLD Option Name:			NEW Option Name                                                                                // 894
		applyDefaultStyles:			"applyDemoStyles"                                                                             // 895
	//	CHILD/NESTED LAYOUTS                                                                                              // 896
	,	childOptions:				"children"                                                                                        // 897
	,	initChildLayout:			"initChildren"                                                                                  // 898
	,	destroyChildLayout:			"destroyChildren"                                                                            // 899
	,	resizeChildLayout:			"resizeChildren"                                                                              // 900
	,	resizeNestedLayout:			"resizeChildren"                                                                             // 901
	//	MISC Options                                                                                                      // 902
	,	resizeWhileDragging:		"livePaneResizing"                                                                           // 903
	,	resizeContentWhileDragging:	"liveContentResizing"                                                                  // 904
	,	triggerEventsWhileDragging:	"triggerEventsDuringLiveResize"                                                        // 905
	,	maskIframesOnResize:		"maskContents"                                                                               // 906
	//	STATE MANAGEMENT                                                                                                  // 907
	,	useStateCookie:				"stateManagement.enabled"                                                                       // 908
	,	"cookie.autoLoad":			"stateManagement.autoLoad"                                                                    // 909
	,	"cookie.autoSave":			"stateManagement.autoSave"                                                                    // 910
	,	"cookie.keys":				"stateManagement.stateKeys"                                                                      // 911
	,	"cookie.name":				"stateManagement.cookie.name"                                                                    // 912
	,	"cookie.domain":			"stateManagement.cookie.domain"                                                                 // 913
	,	"cookie.path":				"stateManagement.cookie.path"                                                                    // 914
	,	"cookie.expires":			"stateManagement.cookie.expires"                                                               // 915
	,	"cookie.secure":			"stateManagement.cookie.secure"                                                                 // 916
	//	OLD Language options                                                                                              // 917
	,	noRoomToOpenTip:			"tips.noRoomToOpen"                                                                             // 918
	,	togglerTip_open:			"tips.Close"	// open   = Close                                                                  // 919
	,	togglerTip_closed:			"tips.Open"		// closed = Open                                                                 // 920
	,	resizerTip:					"tips.Resize"                                                                                      // 921
	,	sliderTip:					"tips.Slide"                                                                                        // 922
	}                                                                                                                    // 923
                                                                                                                      // 924
/**                                                                                                                   // 925
* @param {Object}	opts                                                                                                // 926
*/                                                                                                                    // 927
,	renameOptions: function (opts) {                                                                                    // 928
		var map = $.layout.backwardCompatibility.map                                                                        // 929
		,	oldData, newData, value                                                                                           // 930
		;                                                                                                                   // 931
		for (var itemPath in map) {                                                                                         // 932
			oldData	= getBranch( itemPath );                                                                                   // 933
			value	= oldData.branch[ oldData.key ];                                                                             // 934
			if (value !== undefined) {                                                                                         // 935
				newData = getBranch( map[itemPath], true );                                                                       // 936
				newData.branch[ newData.key ] = value;                                                                            // 937
				delete oldData.branch[ oldData.key ];                                                                             // 938
			}                                                                                                                  // 939
		}                                                                                                                   // 940
                                                                                                                      // 941
		/**                                                                                                                 // 942
		* @param {string}	path                                                                                              // 943
		* @param {boolean=}	[create=false]	Create path if does not exist                                                    // 944
		*/                                                                                                                  // 945
		function getBranch (path, create) {                                                                                 // 946
			var a = path.split(".") // split keys into array                                                                   // 947
			,	c = a.length - 1                                                                                                 // 948
			,	D = { branch: opts, key: a[c] } // init branch at top & set key (last item)                                      // 949
			,	i = 0, k, undef;                                                                                                 // 950
			for (; i<c; i++) { // skip the last key (data)                                                                     // 951
				k = a[i];                                                                                                         // 952
				if (D.branch[ k ] == undefined) { // child-key does not exist                                                     // 953
					if (create) {                                                                                                    // 954
						D.branch = D.branch[ k ] = {}; // create child-branch                                                           // 955
					}                                                                                                                // 956
					else // can't go any farther                                                                                     // 957
						D.branch = {}; // branch is undefined                                                                           // 958
				}                                                                                                                 // 959
				else                                                                                                              // 960
					D.branch = D.branch[ k ]; // get child-branch                                                                    // 961
			}                                                                                                                  // 962
			return D;                                                                                                          // 963
		};                                                                                                                  // 964
	}                                                                                                                    // 965
                                                                                                                      // 966
/**                                                                                                                   // 967
* @param {Object}	opts                                                                                                // 968
*/                                                                                                                    // 969
,	renameAllOptions: function (opts) {                                                                                 // 970
		var ren = $.layout.backwardCompatibility.renameOptions;                                                             // 971
		// rename root (layout) options                                                                                     // 972
		ren( opts );                                                                                                        // 973
		// rename 'defaults' to 'panes'                                                                                     // 974
		if (opts.defaults) {                                                                                                // 975
			if (typeof opts.panes !== "object")                                                                                // 976
				opts.panes = {};                                                                                                  // 977
			$.extend(true, opts.panes, opts.defaults);                                                                         // 978
			delete opts.defaults;                                                                                              // 979
		}                                                                                                                   // 980
		// rename options in the the options.panes key                                                                      // 981
		if (opts.panes) ren( opts.panes );                                                                                  // 982
		// rename options inside *each pane key*, eg: options.west                                                          // 983
		$.each($.layout.config.allPanes, function (i, pane) {                                                               // 984
			if (opts[pane]) ren( opts[pane] );                                                                                 // 985
		});	                                                                                                                // 986
		return opts;                                                                                                        // 987
	}                                                                                                                    // 988
};                                                                                                                    // 989
                                                                                                                      // 990
                                                                                                                      // 991
                                                                                                                      // 992
                                                                                                                      // 993
/*	============================================================                                                       // 994
 *	BEGIN WIDGET: $( selector ).layout( {options} );                                                                   // 995
 *	============================================================                                                       // 996
 */                                                                                                                   // 997
$.fn.layout = function (opts) {                                                                                       // 998
	var                                                                                                                  // 999
                                                                                                                      // 1000
	// local aliases to global data                                                                                      // 1001
	browser	= $.layout.browser                                                                                           // 1002
,	_c		= $.layout.config                                                                                               // 1003
                                                                                                                      // 1004
	// local aliases to utlity methods                                                                                   // 1005
,	cssW	= $.layout.cssWidth                                                                                            // 1006
,	cssH	= $.layout.cssHeight                                                                                           // 1007
,	elDims	= $.layout.getElementDimensions                                                                              // 1008
,	styles	= $.layout.getElementStyles                                                                                  // 1009
,	evtObj	= $.layout.getEventObject                                                                                    // 1010
,	evtPane	= $.layout.parsePaneName                                                                                    // 1011
                                                                                                                      // 1012
/**                                                                                                                   // 1013
 * options - populated by initOptions()                                                                               // 1014
 */                                                                                                                   // 1015
,	options = $.extend(true, {}, $.layout.defaults)                                                                     // 1016
,	effects	= options.effects = $.extend(true, {}, $.layout.effects)                                                    // 1017
                                                                                                                      // 1018
/**                                                                                                                   // 1019
 * layout-state object                                                                                                // 1020
 */                                                                                                                   // 1021
,	state = {                                                                                                           // 1022
		// generate unique ID to use for event.namespace so can unbind only events added by 'this layout'                   // 1023
		id:				"layout"+ $.now()	// code uses alias: sID                                                                    // 1024
	,	initialized:	false                                                                                                 // 1025
	,	paneResizing:	false                                                                                                // 1026
	,	panesSliding:	{}                                                                                                   // 1027
	,	container:	{ 	// list all keys referenced in code to avoid compiler error msgs                                     // 1028
			innerWidth:		0                                                                                                     // 1029
		,	innerHeight:	0                                                                                                    // 1030
		,	outerWidth:		0                                                                                                    // 1031
		,	outerHeight:	0                                                                                                    // 1032
		,	layoutWidth:	0                                                                                                    // 1033
		,	layoutHeight:	0                                                                                                   // 1034
		}                                                                                                                   // 1035
	,	north:		{ childIdx: 0 }                                                                                            // 1036
	,	south:		{ childIdx: 0 }                                                                                            // 1037
	,	east:		{ childIdx: 0 }                                                                                             // 1038
	,	west:		{ childIdx: 0 }                                                                                             // 1039
	,	center:		{ childIdx: 0 }                                                                                           // 1040
	}                                                                                                                    // 1041
                                                                                                                      // 1042
/**                                                                                                                   // 1043
 * parent/child-layout pointers                                                                                       // 1044
 */                                                                                                                   // 1045
//,	hasParentLayout	= false	- exists ONLY inside Instance so can be set externally                                    // 1046
,	children = {                                                                                                        // 1047
		north:		null                                                                                                        // 1048
	,	south:		null                                                                                                       // 1049
	,	east:		null                                                                                                        // 1050
	,	west:		null                                                                                                        // 1051
	,	center:		null                                                                                                      // 1052
	}                                                                                                                    // 1053
                                                                                                                      // 1054
/*                                                                                                                    // 1055
 * ###########################                                                                                        // 1056
 *  INTERNAL HELPER FUNCTIONS                                                                                         // 1057
 * ###########################                                                                                        // 1058
 */                                                                                                                   // 1059
                                                                                                                      // 1060
	/**                                                                                                                  // 1061
	* Manages all internal timers                                                                                        // 1062
	*/                                                                                                                   // 1063
,	timer = {                                                                                                           // 1064
		data:	{}                                                                                                            // 1065
	,	set:	function (s, fn, ms) { timer.clear(s); timer.data[s] = setTimeout(fn, ms); }                                  // 1066
	,	clear:	function (s) { var t=timer.data; if (t[s]) {clearTimeout(t[s]); delete t[s];} }                             // 1067
	}                                                                                                                    // 1068
                                                                                                                      // 1069
	/**                                                                                                                  // 1070
	* Alert or console.log a message - IF option is enabled.                                                             // 1071
	*                                                                                                                    // 1072
	* @param {(string|!Object)}	msg				Message (or debug-data) to display                                                // 1073
	* @param {boolean=}			[popup=false]	True by default, means 'alert', false means use console.log                      // 1074
	* @param {boolean=}			[debug=false]	True means is a widget debugging message                                         // 1075
	*/                                                                                                                   // 1076
,	_log = function (msg, popup, debug) {                                                                               // 1077
		var o = options;                                                                                                    // 1078
		if ((o.showErrorMessages && !debug) || (debug && o.showDebugMessages))                                              // 1079
			$.layout.msg( o.name +' / '+ msg, (popup !== false) );                                                             // 1080
		return false;                                                                                                       // 1081
	}                                                                                                                    // 1082
                                                                                                                      // 1083
	/**                                                                                                                  // 1084
	* Executes a Callback function after a trigger event, like resize, open or close                                     // 1085
	*                                                                                                                    // 1086
	* @param {string}				evtName					Name of the layout callback, eg "onresize_start"                                    // 1087
	* @param {(string|boolean)=}	[pane=""]				This is passed only so we can pass the 'pane object' to the callback       // 1088
	* @param {(string|boolean)=}	[skipBoundEvents=false]	True = do not run events bound to the elements - only the callbacks set in options
	*/                                                                                                                   // 1090
,	_runCallbacks = function (evtName, pane, skipBoundEvents) {                                                         // 1091
		var	hasPane	= pane && isStr(pane)                                                                                   // 1092
		,	s		= hasPane ? state[pane] : state                                                                                // 1093
		,	o		= hasPane ? options[pane] : options                                                                            // 1094
		,	lName	= options.name                                                                                              // 1095
			// names like onopen and onopen_end separate are interchangeable in options...                                     // 1096
		,	lng		= evtName + (evtName.match(/_/) ? "" : "_end")                                                               // 1097
		,	shrt	= lng.match(/_end$/) ? lng.substr(0, lng.length - 4) : ""                                                    // 1098
		,	fn		= o[lng] || o[shrt]                                                                                           // 1099
		,	retVal	= "NC" // NC = No Callback                                                                                 // 1100
		,	args	= []                                                                                                         // 1101
		,	$P                                                                                                                // 1102
		;                                                                                                                   // 1103
		if ( !hasPane && $.type(pane) === 'boolean' ) {                                                                     // 1104
			skipBoundEvents = pane; // allow pane param to be skipped for Layout callback                                      // 1105
			pane = "";                                                                                                         // 1106
		}                                                                                                                   // 1107
                                                                                                                      // 1108
		// first trigger the callback set in the options                                                                    // 1109
		if (fn) {                                                                                                           // 1110
			try {                                                                                                              // 1111
				// convert function name (string) to function object                                                              // 1112
				if (isStr( fn )) {                                                                                                // 1113
					if (fn.match(/,/)) {                                                                                             // 1114
						// function name cannot contain a comma,                                                                        // 1115
						// so must be a function name AND a parameter to pass                                                           // 1116
						args = fn.split(",")                                                                                            // 1117
						,	fn = eval(args[0]);                                                                                           // 1118
					}                                                                                                                // 1119
					else // just the name of an external function?                                                                   // 1120
						fn = eval(fn);                                                                                                  // 1121
				}                                                                                                                 // 1122
				// execute the callback, if exists                                                                                // 1123
				if ($.isFunction( fn )) {                                                                                         // 1124
					if (args.length)                                                                                                 // 1125
						retVal = g(fn)(args[1]); // pass the argument parsed from 'list'                                                // 1126
					else if ( hasPane )                                                                                              // 1127
						// pass data: pane-name, pane-element, pane-state, pane-options, and layout-name                                // 1128
						retVal = g(fn)( pane, $Ps[pane], s, o, lName );                                                                 // 1129
					else // must be a layout/container callback - pass suitable info                                                 // 1130
						retVal = g(fn)( Instance, s, o, lName );                                                                        // 1131
				}                                                                                                                 // 1132
			}                                                                                                                  // 1133
			catch (ex) {                                                                                                       // 1134
				_log( options.errors.callbackError.replace(/EVENT/, $.trim((pane || "") +" "+ lng)), false );                     // 1135
				if ($.type(ex) === 'string' && string.length)                                                                     // 1136
					_log('Exception:  '+ ex, false );                                                                                // 1137
			}                                                                                                                  // 1138
		}                                                                                                                   // 1139
                                                                                                                      // 1140
		// trigger additional events bound directly to the pane                                                             // 1141
		if (!skipBoundEvents && retVal !== false) {                                                                         // 1142
			if ( hasPane ) { // PANE events can be bound to each pane-elements                                                 // 1143
				$P	= $Ps[pane];                                                                                                   // 1144
				o	= options[pane];                                                                                                // 1145
				s	= state[pane];                                                                                                  // 1146
				$P.triggerHandler('layoutpane'+ lng, [ pane, $P, s, o, lName ]);                                                  // 1147
				if (shrt)                                                                                                         // 1148
					$P.triggerHandler('layoutpane'+ shrt, [ pane, $P, s, o, lName ]);                                                // 1149
			}                                                                                                                  // 1150
			else { // LAYOUT events can be bound to the container-element                                                      // 1151
				$N.triggerHandler('layout'+ lng, [ Instance, s, o, lName ]);                                                      // 1152
				if (shrt)                                                                                                         // 1153
					$N.triggerHandler('layout'+ shrt, [ Instance, s, o, lName ]);                                                    // 1154
			}                                                                                                                  // 1155
		}                                                                                                                   // 1156
                                                                                                                      // 1157
		// ALWAYS resizeChildren after an onresize_end event - even during initialization                                   // 1158
		// IGNORE onsizecontent_end event because causes child-layouts to resize TWICE                                      // 1159
		if (hasPane && evtName === "onresize_end") // BAD: || evtName === "onsizecontent_end"                               // 1160
			resizeChildren(pane+"", true); // compiler hack -force string                                                      // 1161
                                                                                                                      // 1162
		return retVal;                                                                                                      // 1163
                                                                                                                      // 1164
		function g (f) { return f; }; // compiler hack                                                                      // 1165
	}                                                                                                                    // 1166
                                                                                                                      // 1167
                                                                                                                      // 1168
	/**                                                                                                                  // 1169
	* cure iframe display issues in IE & other browsers                                                                  // 1170
	*/                                                                                                                   // 1171
,	_fixIframe = function (pane) {                                                                                      // 1172
		if (browser.mozilla) return; // skip FireFox - it auto-refreshes iframes onShow                                     // 1173
		var $P = $Ps[pane];                                                                                                 // 1174
		// if the 'pane' is an iframe, do it                                                                                // 1175
		if (state[pane].tagName === "IFRAME")                                                                               // 1176
			$P.css(_c.hidden).css(_c.visible);                                                                                 // 1177
		else // ditto for any iframes INSIDE the pane                                                                       // 1178
			$P.find('IFRAME').css(_c.hidden).css(_c.visible);                                                                  // 1179
	}                                                                                                                    // 1180
                                                                                                                      // 1181
	/**                                                                                                                  // 1182
	* @param  {string}		pane		Can accept ONLY a 'pane' (east, west, etc)                                                 // 1183
	* @param  {number=}		outerSize	(optional) Can pass a width, allowing calculations BEFORE element is resized          // 1184
	* @return {number}		Returns the innerHeight/Width of el by subtracting padding and borders                           // 1185
	*/                                                                                                                   // 1186
,	cssSize = function (pane, outerSize) {                                                                              // 1187
		var fn = _c[pane].dir=="horz" ? cssH : cssW;                                                                        // 1188
		return fn($Ps[pane], outerSize);                                                                                    // 1189
	}                                                                                                                    // 1190
                                                                                                                      // 1191
	/**                                                                                                                  // 1192
	* @param  {string}		pane		Can accept ONLY a 'pane' (east, west, etc)                                                 // 1193
	* @return {Object}		Returns hash of minWidth & minHeight                                                             // 1194
	*/                                                                                                                   // 1195
,	cssMinDims = function (pane) {                                                                                      // 1196
		// minWidth/Height means CSS width/height = 1px                                                                     // 1197
		var	$P	= $Ps[pane]                                                                                                  // 1198
		,	dir	= _c[pane].dir                                                                                                // 1199
		,	d	= {                                                                                                             // 1200
				minWidth:	1001 - cssW($P, 1000)                                                                                   // 1201
			,	minHeight:	1001 - cssH($P, 1000)                                                                                 // 1202
			}                                                                                                                  // 1203
		;                                                                                                                   // 1204
		if (dir === "horz") d.minSize = d.minHeight;                                                                        // 1205
		if (dir === "vert") d.minSize = d.minWidth;                                                                         // 1206
		return d;                                                                                                           // 1207
	}                                                                                                                    // 1208
                                                                                                                      // 1209
	// TODO: see if these methods can be made more useful...                                                             // 1210
	// TODO: *maybe* return cssW/H from these so caller can use this info                                                // 1211
                                                                                                                      // 1212
	/**                                                                                                                  // 1213
	* @param {(string|!Object)}		el                                                                                      // 1214
	* @param {number=}				outerWidth                                                                                     // 1215
	* @param {boolean=}				[autoHide=false]                                                                              // 1216
	*/                                                                                                                   // 1217
,	setOuterWidth = function (el, outerWidth, autoHide) {                                                               // 1218
		var $E = el, w;                                                                                                     // 1219
		if (isStr(el)) $E = $Ps[el]; // west                                                                                // 1220
		else if (!el.jquery) $E = $(el);                                                                                    // 1221
		w = cssW($E, outerWidth);                                                                                           // 1222
		$E.css({ width: w });                                                                                               // 1223
		if (w > 0) {                                                                                                        // 1224
			if (autoHide && $E.data('autoHidden') && $E.innerHeight() > 0) {                                                   // 1225
				$E.show().data('autoHidden', false);                                                                              // 1226
				if (!browser.mozilla) // FireFox refreshes iframes - IE does not                                                  // 1227
					// make hidden, then visible to 'refresh' display after animation                                                // 1228
					$E.css(_c.hidden).css(_c.visible);                                                                               // 1229
			}                                                                                                                  // 1230
		}                                                                                                                   // 1231
		else if (autoHide && !$E.data('autoHidden'))                                                                        // 1232
			$E.hide().data('autoHidden', true);                                                                                // 1233
	}                                                                                                                    // 1234
                                                                                                                      // 1235
	/**                                                                                                                  // 1236
	* @param {(string|!Object)}		el                                                                                      // 1237
	* @param {number=}				outerHeight                                                                                    // 1238
	* @param {boolean=}				[autoHide=false]                                                                              // 1239
	*/                                                                                                                   // 1240
,	setOuterHeight = function (el, outerHeight, autoHide) {                                                             // 1241
		var $E = el, h;                                                                                                     // 1242
		if (isStr(el)) $E = $Ps[el]; // west                                                                                // 1243
		else if (!el.jquery) $E = $(el);                                                                                    // 1244
		h = cssH($E, outerHeight);                                                                                          // 1245
		$E.css({ height: h, visibility: "visible" }); // may have been 'hidden' by sizeContent                              // 1246
		if (h > 0 && $E.innerWidth() > 0) {                                                                                 // 1247
			if (autoHide && $E.data('autoHidden')) {                                                                           // 1248
				$E.show().data('autoHidden', false);                                                                              // 1249
				if (!browser.mozilla) // FireFox refreshes iframes - IE does not                                                  // 1250
					$E.css(_c.hidden).css(_c.visible);                                                                               // 1251
			}                                                                                                                  // 1252
		}                                                                                                                   // 1253
		else if (autoHide && !$E.data('autoHidden'))                                                                        // 1254
			$E.hide().data('autoHidden', true);                                                                                // 1255
	}                                                                                                                    // 1256
                                                                                                                      // 1257
                                                                                                                      // 1258
	/**                                                                                                                  // 1259
	* Converts any 'size' params to a pixel/integer size, if not already                                                 // 1260
	* If 'auto' or a decimal/percentage is passed as 'size', a pixel-size is calculated                                  // 1261
	*                                                                                                                    // 1262
	/**                                                                                                                  // 1263
	* @param  {string}				pane                                                                                           // 1264
	* @param  {(string|number)=}	size                                                                                    // 1265
	* @param  {string=}				[dir]                                                                                         // 1266
	* @return {number}                                                                                                   // 1267
	*/                                                                                                                   // 1268
,	_parseSize = function (pane, size, dir) {                                                                           // 1269
		if (!dir) dir = _c[pane].dir;                                                                                       // 1270
                                                                                                                      // 1271
		if (isStr(size) && size.match(/%/))                                                                                 // 1272
			size = (size === '100%') ? -1 : parseInt(size, 10) / 100; // convert % to decimal                                  // 1273
                                                                                                                      // 1274
		if (size === 0)                                                                                                     // 1275
			return 0;                                                                                                          // 1276
		else if (size >= 1)                                                                                                 // 1277
			return parseInt(size, 10);                                                                                         // 1278
                                                                                                                      // 1279
		var o = options, avail = 0;                                                                                         // 1280
		if (dir=="horz") // north or south or center.minHeight                                                              // 1281
			avail = sC.innerHeight - ($Ps.north ? o.north.spacing_open : 0) - ($Ps.south ? o.south.spacing_open : 0);          // 1282
		else if (dir=="vert") // east or west or center.minWidth                                                            // 1283
			avail = sC.innerWidth - ($Ps.west ? o.west.spacing_open : 0) - ($Ps.east ? o.east.spacing_open : 0);               // 1284
                                                                                                                      // 1285
		if (size === -1) // -1 == 100%                                                                                      // 1286
			return avail;                                                                                                      // 1287
		else if (size > 0) // percentage, eg: .25                                                                           // 1288
			return round(avail * size);                                                                                        // 1289
		else if (pane=="center")                                                                                            // 1290
			return 0;                                                                                                          // 1291
		else { // size < 0 || size=='auto' || size==Missing || size==Invalid                                                // 1292
			// auto-size the pane                                                                                              // 1293
			var	dim	= (dir === "horz" ? "height" : "width")                                                                    // 1294
			,	$P	= $Ps[pane]                                                                                                   // 1295
			,	$C	= dim === 'height' ? $Cs[pane] : false                                                                        // 1296
			,	vis	= $.layout.showInvisibly($P) // show pane invisibly if hidden                                                // 1297
			,	szP	= $P.css(dim) // SAVE current pane size                                                                      // 1298
			,	szC	= $C ? $C.css(dim) : 0 // SAVE current content size                                                          // 1299
			;                                                                                                                  // 1300
			$P.css(dim, "auto");                                                                                               // 1301
			if ($C) $C.css(dim, "auto");                                                                                       // 1302
			size = (dim === "height") ? $P.outerHeight() : $P.outerWidth(); // MEASURE                                         // 1303
			$P.css(dim, szP).css(vis); // RESET size & visibility                                                              // 1304
			if ($C) $C.css(dim, szC);                                                                                          // 1305
			return size;                                                                                                       // 1306
		}                                                                                                                   // 1307
	}                                                                                                                    // 1308
                                                                                                                      // 1309
	/**                                                                                                                  // 1310
	* Calculates current 'size' (outer-width or outer-height) of a border-pane - optionally with 'pane-spacing' added    // 1311
	*                                                                                                                    // 1312
	* @param  {(string|!Object)}	pane                                                                                    // 1313
	* @param  {boolean=}			[inclSpace=false]                                                                             // 1314
	* @return {number}				Returns EITHER Width for east/west panes OR Height for north/south panes                       // 1315
	*/                                                                                                                   // 1316
,	getPaneSize = function (pane, inclSpace) {                                                                          // 1317
		var                                                                                                                 // 1318
			$P	= $Ps[pane]                                                                                                     // 1319
		,	o	= options[pane]                                                                                                 // 1320
		,	s	= state[pane]                                                                                                   // 1321
		,	oSp	= (inclSpace ? o.spacing_open : 0)                                                                            // 1322
		,	cSp	= (inclSpace ? o.spacing_closed : 0)                                                                          // 1323
		;                                                                                                                   // 1324
		if (!$P || s.isHidden)                                                                                              // 1325
			return 0;                                                                                                          // 1326
		else if (s.isClosed || (s.isSliding && inclSpace))                                                                  // 1327
			return cSp;                                                                                                        // 1328
		else if (_c[pane].dir === "horz")                                                                                   // 1329
			return $P.outerHeight() + oSp;                                                                                     // 1330
		else // dir === "vert"                                                                                              // 1331
			return $P.outerWidth() + oSp;                                                                                      // 1332
	}                                                                                                                    // 1333
                                                                                                                      // 1334
	/**                                                                                                                  // 1335
	* Calculate min/max pane dimensions and limits for resizing                                                          // 1336
	*                                                                                                                    // 1337
	* @param  {string}		pane                                                                                             // 1338
	* @param  {boolean=}	[slide=false]                                                                                   // 1339
	*/                                                                                                                   // 1340
,	setSizeLimits = function (pane, slide) {                                                                            // 1341
		if (!isInitialized()) return;                                                                                       // 1342
		var                                                                                                                 // 1343
			o				= options[pane]                                                                                               // 1344
		,	s				= state[pane]                                                                                                // 1345
		,	c				= _c[pane]                                                                                                   // 1346
		,	dir				= c.dir                                                                                                    // 1347
		,	type			= c.sizeType.toLowerCase()                                                                                 // 1348
		,	isSliding		= (slide != undefined ? slide : s.isSliding) // only open() passes 'slide' param                       // 1349
		,	$P				= $Ps[pane]                                                                                                 // 1350
		,	paneSpacing		= o.spacing_open                                                                                     // 1351
		//	measure the pane on the *opposite side* from this pane                                                           // 1352
		,	altPane			= _c.oppositeEdge[pane]                                                                                 // 1353
		,	altS			= state[altPane]                                                                                           // 1354
		,	$altP			= $Ps[altPane]                                                                                            // 1355
		,	altPaneSize		= (!$altP || altS.isVisible===false || altS.isSliding ? 0 : (dir=="horz" ? $altP.outerHeight() : $altP.outerWidth()))
		,	altPaneSpacing	= ((!$altP || altS.isHidden ? 0 : options[altPane][ altS.isClosed !== false ? "spacing_closed" : "spacing_open" ]) || 0)
		//	limitSize prevents this pane from 'overlapping' opposite pane                                                    // 1358
		,	containerSize	= (dir=="horz" ? sC.innerHeight : sC.innerWidth)                                                    // 1359
		,	minCenterDims	= cssMinDims("center")                                                                              // 1360
		,	minCenterSize	= dir=="horz" ? max(options.center.minHeight, minCenterDims.minHeight) : max(options.center.minWidth, minCenterDims.minWidth)
		//	if pane is 'sliding', then ignore center and alt-pane sizes - because 'overlays' them                            // 1362
		,	limitSize		= (containerSize - paneSpacing - (isSliding ? 0 : (_parseSize("center", minCenterSize, dir) + altPaneSize + altPaneSpacing)))
		,	minSize			= s.minSize = max( _parseSize(pane, o.minSize), cssMinDims(pane).minSize )                              // 1364
		,	maxSize			= s.maxSize = min( (o.maxSize ? _parseSize(pane, o.maxSize) : 100000), limitSize )                      // 1365
		,	r				= s.resizerPosition = {} // used to set resizing limits                                                      // 1366
		,	top				= sC.inset.top                                                                                             // 1367
		,	left			= sC.inset.left                                                                                            // 1368
		,	W				= sC.innerWidth                                                                                              // 1369
		,	H				= sC.innerHeight                                                                                             // 1370
		,	rW				= o.spacing_open // subtract resizer-width to get top/left position for south/east                          // 1371
		;                                                                                                                   // 1372
		switch (pane) {                                                                                                     // 1373
			case "north":	r.min = top + minSize;                                                                               // 1374
							r.max = top + maxSize;                                                                                         // 1375
							break;                                                                                                         // 1376
			case "west":	r.min = left + minSize;                                                                               // 1377
							r.max = left + maxSize;                                                                                        // 1378
							break;                                                                                                         // 1379
			case "south":	r.min = top + H - maxSize - rW;                                                                      // 1380
							r.max = top + H - minSize - rW;                                                                                // 1381
							break;                                                                                                         // 1382
			case "east":	r.min = left + W - maxSize - rW;                                                                      // 1383
							r.max = left + W - minSize - rW;                                                                               // 1384
							break;                                                                                                         // 1385
		};                                                                                                                  // 1386
	}                                                                                                                    // 1387
                                                                                                                      // 1388
	/**                                                                                                                  // 1389
	* Returns data for setting the size/position of center pane. Also used to set Height for east/west panes             // 1390
	*                                                                                                                    // 1391
	* @return JSON  Returns a hash of all dimensions: top, bottom, left, right, (outer) width and (outer) height         // 1392
	*/                                                                                                                   // 1393
,	calcNewCenterPaneDims = function () {                                                                               // 1394
		var d = {                                                                                                           // 1395
			top:	getPaneSize("north", true) // true = include 'spacing' value for pane                                         // 1396
		,	bottom:	getPaneSize("south", true)                                                                                // 1397
		,	left:	getPaneSize("west", true)                                                                                   // 1398
		,	right:	getPaneSize("east", true)                                                                                  // 1399
		,	width:	0                                                                                                          // 1400
		,	height:	0                                                                                                         // 1401
		};                                                                                                                  // 1402
                                                                                                                      // 1403
		// NOTE: sC = state.container                                                                                       // 1404
		// calc center-pane outer dimensions                                                                                // 1405
		d.width		= sC.innerWidth - d.left - d.right;  // outerWidth                                                         // 1406
		d.height	= sC.innerHeight - d.bottom - d.top; // outerHeight                                                        // 1407
		// add the 'container border/padding' to get final positions relative to the container                              // 1408
		d.top		+= sC.inset.top;                                                                                             // 1409
		d.bottom	+= sC.inset.bottom;                                                                                        // 1410
		d.left		+= sC.inset.left;                                                                                           // 1411
		d.right		+= sC.inset.right;                                                                                         // 1412
                                                                                                                      // 1413
		return d;                                                                                                           // 1414
	}                                                                                                                    // 1415
                                                                                                                      // 1416
                                                                                                                      // 1417
	/**                                                                                                                  // 1418
	* @param {!Object}		el                                                                                               // 1419
	* @param {boolean=}		[allStates=false]                                                                               // 1420
	*/                                                                                                                   // 1421
,	getHoverClasses = function (el, allStates) {                                                                        // 1422
		var                                                                                                                 // 1423
			$El		= $(el)                                                                                                       // 1424
		,	type	= $El.data("layoutRole")                                                                                     // 1425
		,	pane	= $El.data("layoutEdge")                                                                                     // 1426
		,	o		= options[pane]                                                                                                // 1427
		,	root	= o[type +"Class"]                                                                                           // 1428
		,	_pane	= "-"+ pane // eg: "-west"                                                                                  // 1429
		,	_open	= "-open"                                                                                                   // 1430
		,	_closed	= "-closed"                                                                                               // 1431
		,	_slide	= "-sliding"                                                                                               // 1432
		,	_hover	= "-hover " // NOTE the trailing space                                                                     // 1433
		,	_state	= $El.hasClass(root+_closed) ? _closed : _open                                                             // 1434
		,	_alt	= _state === _closed ? _open : _closed                                                                       // 1435
		,	classes = (root+_hover) + (root+_pane+_hover) + (root+_state+_hover) + (root+_pane+_state+_hover)                 // 1436
		;                                                                                                                   // 1437
		if (allStates) // when 'removing' classes, also remove alternate-state classes                                      // 1438
			classes += (root+_alt+_hover) + (root+_pane+_alt+_hover);                                                          // 1439
                                                                                                                      // 1440
		if (type=="resizer" && $El.hasClass(root+_slide))                                                                   // 1441
			classes += (root+_slide+_hover) + (root+_pane+_slide+_hover);                                                      // 1442
                                                                                                                      // 1443
		return $.trim(classes);                                                                                             // 1444
	}                                                                                                                    // 1445
,	addHover	= function (evt, el) {                                                                                     // 1446
		var $E = $(el || this);                                                                                             // 1447
		if (evt && $E.data("layoutRole") === "toggler")                                                                     // 1448
			evt.stopPropagation(); // prevent triggering 'slide' on Resizer-bar                                                // 1449
		$E.addClass( getHoverClasses($E) );                                                                                 // 1450
	}                                                                                                                    // 1451
,	removeHover	= function (evt, el) {                                                                                  // 1452
		var $E = $(el || this);                                                                                             // 1453
		$E.removeClass( getHoverClasses($E, true) );                                                                        // 1454
	}                                                                                                                    // 1455
                                                                                                                      // 1456
,	onResizerEnter	= function (evt) { // ALSO called by toggler.mouseenter                                              // 1457
		var pane	= $(this).data("layoutEdge")                                                                               // 1458
		,	s		= state[pane]                                                                                                  // 1459
		;                                                                                                                   // 1460
		// ignore closed-panes and mouse moving back & forth over resizer!                                                  // 1461
		// also ignore if ANY pane is currently resizing                                                                    // 1462
		if ( s.isClosed || s.isResizing || state.paneResizing ) return;                                                     // 1463
                                                                                                                      // 1464
		if ($.fn.disableSelection)                                                                                          // 1465
			$("body").disableSelection();                                                                                      // 1466
		if (options.maskPanesEarly)                                                                                         // 1467
			showMasks( pane, { resizing: true });                                                                              // 1468
	}                                                                                                                    // 1469
,	onResizerLeave	= function (evt, el) {                                                                               // 1470
		var	e		= el || this // el is only passed when called by the timer                                                   // 1471
		,	pane	= $(e).data("layoutEdge")                                                                                    // 1472
		,	name	= pane +"ResizerLeave"                                                                                       // 1473
		;                                                                                                                   // 1474
		timer.clear(pane+"_openSlider"); // cancel slideOpen timer, if set                                                  // 1475
		timer.clear(name); // cancel enableSelection timer - may re/set below                                               // 1476
		// this method calls itself on a timer because it needs to allow                                                    // 1477
		// enough time for dragging to kick-in and set the isResizing flag                                                  // 1478
		// dragging has a 100ms delay set, so this delay must be >100                                                       // 1479
		if (!el) // 1st call - mouseleave event                                                                             // 1480
			timer.set(name, function(){ onResizerLeave(evt, e); }, 200);                                                       // 1481
		// if user is resizing, then dragStop will enableSelection(), so can skip it here                                   // 1482
		else if ( !state.paneResizing ) { // 2nd call - by timer                                                            // 1483
			if ($.fn.enableSelection)                                                                                          // 1484
				$("body").enableSelection();                                                                                      // 1485
			if (options.maskPanesEarly)                                                                                        // 1486
				hideMasks();                                                                                                      // 1487
		}                                                                                                                   // 1488
	}                                                                                                                    // 1489
                                                                                                                      // 1490
/*                                                                                                                    // 1491
 * ###########################                                                                                        // 1492
 *   INITIALIZATION METHODS                                                                                           // 1493
 * ###########################                                                                                        // 1494
 */                                                                                                                   // 1495
                                                                                                                      // 1496
	/**                                                                                                                  // 1497
	* Initialize the layout - called automatically whenever an instance of layout is created                             // 1498
	*                                                                                                                    // 1499
	* @see  none - triggered onInit                                                                                      // 1500
	* @return  mixed	true = fully initialized | false = panes not initialized (yet) | 'cancel' = abort                   // 1501
	*/                                                                                                                   // 1502
,	_create = function () {                                                                                             // 1503
		// initialize config/options                                                                                        // 1504
		initOptions();                                                                                                      // 1505
		var o = options                                                                                                     // 1506
		,	s = state;                                                                                                        // 1507
                                                                                                                      // 1508
		// TEMP state so isInitialized returns true during init process                                                     // 1509
		s.creatingLayout = true;                                                                                            // 1510
                                                                                                                      // 1511
		// init plugins for this layout, if there are any (eg: stateManagement)                                             // 1512
		runPluginCallbacks( Instance, $.layout.onCreate );                                                                  // 1513
                                                                                                                      // 1514
		// options & state have been initialized, so now run beforeLoad callback                                            // 1515
		// onload will CANCEL layout creation if it returns false                                                           // 1516
		if (false === _runCallbacks("onload_start"))                                                                        // 1517
			return 'cancel';                                                                                                   // 1518
                                                                                                                      // 1519
		// initialize the container element                                                                                 // 1520
		_initContainer();                                                                                                   // 1521
                                                                                                                      // 1522
		// bind hotkey function - keyDown - if required                                                                     // 1523
		initHotkeys();                                                                                                      // 1524
                                                                                                                      // 1525
		// bind window.onunload                                                                                             // 1526
		$(window).bind("unload."+ sID, unload);                                                                             // 1527
                                                                                                                      // 1528
		// init plugins for this layout, if there are any (eg: customButtons)                                               // 1529
		runPluginCallbacks( Instance, $.layout.onLoad );                                                                    // 1530
                                                                                                                      // 1531
		// if layout elements are hidden, then layout WILL NOT complete initialization!                                     // 1532
		// initLayoutElements will set initialized=true and run the onload callback IF successful                           // 1533
		if (o.initPanes) _initLayoutElements();                                                                             // 1534
                                                                                                                      // 1535
		delete s.creatingLayout;                                                                                            // 1536
                                                                                                                      // 1537
		return state.initialized;                                                                                           // 1538
	}                                                                                                                    // 1539
                                                                                                                      // 1540
	/**                                                                                                                  // 1541
	* Initialize the layout IF not already                                                                               // 1542
	*                                                                                                                    // 1543
	* @see  All methods in Instance run this test                                                                        // 1544
	* @return  boolean	true = layoutElements have been initialized | false = panes are not initialized (yet)             // 1545
	*/                                                                                                                   // 1546
,	isInitialized = function () {                                                                                       // 1547
		if (state.initialized || state.creatingLayout) return true;	// already initialized                                  // 1548
		else return _initLayoutElements();	// try to init panes NOW                                                         // 1549
	}                                                                                                                    // 1550
                                                                                                                      // 1551
	/**                                                                                                                  // 1552
	* Initialize the layout - called automatically whenever an instance of layout is created                             // 1553
	*                                                                                                                    // 1554
	* @see  _create() & isInitialized                                                                                    // 1555
	* @param {boolean=}		[retry=false]	// indicates this is a 2nd try                                                    // 1556
	* @return  An object pointer to the instance created                                                                 // 1557
	*/                                                                                                                   // 1558
,	_initLayoutElements = function (retry) {                                                                            // 1559
		// initialize config/options                                                                                        // 1560
		var o = options;                                                                                                    // 1561
		// CANNOT init panes inside a hidden container!                                                                     // 1562
		if (!$N.is(":visible")) {                                                                                           // 1563
			// handle Chrome bug where popup window 'has no height'                                                            // 1564
			// if layout is BODY element, try again in 50ms                                                                    // 1565
			// SEE: http://layout.jquery-dev.net/samples/test_popup_window.html                                                // 1566
			if ( !retry && browser.webkit && $N[0].tagName === "BODY" )                                                        // 1567
				setTimeout(function(){ _initLayoutElements(true); }, 50);                                                         // 1568
			return false;                                                                                                      // 1569
		}                                                                                                                   // 1570
                                                                                                                      // 1571
		// a center pane is required, so make sure it exists                                                                // 1572
		if (!getPane("center").length) {                                                                                    // 1573
			return _log( o.errors.centerPaneMissing );                                                                         // 1574
		}                                                                                                                   // 1575
                                                                                                                      // 1576
		// TEMP state so isInitialized returns true during init process                                                     // 1577
		state.creatingLayout = true;                                                                                        // 1578
                                                                                                                      // 1579
		// update Container dims                                                                                            // 1580
		$.extend(sC, elDims( $N, o.inset )); // passing inset means DO NOT include insetX values                            // 1581
                                                                                                                      // 1582
		// initialize all layout elements                                                                                   // 1583
		initPanes();	// size & position panes - calls initHandles() - which calls initResizable()                           // 1584
                                                                                                                      // 1585
		if (o.scrollToBookmarkOnLoad) {                                                                                     // 1586
			var l = self.location;                                                                                             // 1587
			if (l.hash) l.replace( l.hash ); // scrollTo Bookmark                                                              // 1588
		}                                                                                                                   // 1589
                                                                                                                      // 1590
		// check to see if this layout 'nested' inside a pane                                                               // 1591
		if (Instance.hasParentLayout)                                                                                       // 1592
			o.resizeWithWindow = false;                                                                                        // 1593
		// bind resizeAll() for 'this layout instance' to window.resize event                                               // 1594
		else if (o.resizeWithWindow)                                                                                        // 1595
			$(window).bind("resize."+ sID, windowResize);                                                                      // 1596
                                                                                                                      // 1597
		delete state.creatingLayout;                                                                                        // 1598
		state.initialized = true;                                                                                           // 1599
                                                                                                                      // 1600
		// init plugins for this layout, if there are any                                                                   // 1601
		runPluginCallbacks( Instance, $.layout.onReady );                                                                   // 1602
                                                                                                                      // 1603
		// now run the onload callback, if exists                                                                           // 1604
		_runCallbacks("onload_end");                                                                                        // 1605
                                                                                                                      // 1606
		return true; // elements initialized successfully                                                                   // 1607
	}                                                                                                                    // 1608
                                                                                                                      // 1609
	/**                                                                                                                  // 1610
	* Initialize nested layouts for a specific pane - can optionally pass layout-options                                 // 1611
	*                                                                                                                    // 1612
	* @param {(string|Object)}	evt_or_pane	The pane being opened, ie: north, south, east, or west                        // 1613
	* @param {Object=}			[opts]		Layout-options - if passed, will OVERRRIDE options[pane].children                       // 1614
	* @return  An object pointer to the layout instance created - or null                                                // 1615
	*/                                                                                                                   // 1616
,	createChildren = function (evt_or_pane, opts) {                                                                     // 1617
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 1618
		,	$P	= $Ps[pane]                                                                                                    // 1619
		;                                                                                                                   // 1620
		if (!$P) return;                                                                                                    // 1621
		var	$C	= $Cs[pane]                                                                                                  // 1622
		,	s	= state[pane]                                                                                                   // 1623
		,	o	= options[pane]                                                                                                 // 1624
		,	sm	= options.stateManagement || {}                                                                                // 1625
		,	cos = opts ? (o.children = opts) : o.children                                                                     // 1626
		;                                                                                                                   // 1627
		if ( $.isPlainObject( cos ) )                                                                                       // 1628
			cos = [ cos ]; // convert a hash to a 1-elem array                                                                 // 1629
		else if (!cos || !$.isArray( cos ))                                                                                 // 1630
			return;                                                                                                            // 1631
                                                                                                                      // 1632
		$.each( cos, function (idx, co) {                                                                                   // 1633
			if ( !$.isPlainObject( co ) ) return;                                                                              // 1634
                                                                                                                      // 1635
			// determine which element is supposed to be the 'child container'                                                 // 1636
			// if pane has a 'containerSelector' OR a 'content-div', use those instead of the pane                             // 1637
			var $containers = co.containerSelector ? $P.find( co.containerSelector ) : ($C || $P);                             // 1638
                                                                                                                      // 1639
			$containers.each(function(){                                                                                       // 1640
				var $cont	= $(this)                                                                                               // 1641
				,	child	= $cont.data("layout") //	see if a child-layout ALREADY exists on this element                            // 1642
				;                                                                                                                 // 1643
				// if no layout exists, but children are set, try to create the layout now                                        // 1644
				if (!child) {                                                                                                     // 1645
					// TODO: see about moving this to the stateManagement plugin, as a method                                        // 1646
					// set a unique child-instance key for this layout, if not already set                                           // 1647
					setInstanceKey({ container: $cont, options: co }, s );                                                           // 1648
					// If THIS layout has a hash in stateManagement.autoLoad,                                                        // 1649
					// then see if it also contains state-data for this child-layout                                                 // 1650
					// If so, copy the stateData to child.options.stateManagement.autoLoad                                           // 1651
					if ( sm.includeChildren && state.stateData[pane] ) {                                                             // 1652
						//	THIS layout's state was cached when its state was loaded                                                     // 1653
						var	paneChildren = state.stateData[pane].children || {}                                                         // 1654
						,	childState	= paneChildren[ co.instanceKey ]                                                                   // 1655
						,	co_sm		= co.stateManagement || (co.stateManagement = { autoLoad: true })                                      // 1656
						;                                                                                                               // 1657
						// COPY the stateData into the autoLoad key                                                                     // 1658
						if ( co_sm.autoLoad === true && childState ) {                                                                  // 1659
							co_sm.autoSave			= false; // disable autoSave because saving handled by parent-layout                          // 1660
							co_sm.includeChildren	= true;  // cascade option - FOR NOW                                                     // 1661
							co_sm.autoLoad = $.extend(true, {}, childState); // COPY the state-hash                                        // 1662
						}                                                                                                               // 1663
					}                                                                                                                // 1664
                                                                                                                      // 1665
					// create the layout                                                                                             // 1666
					child = $cont.layout( co );                                                                                      // 1667
                                                                                                                      // 1668
					// if successful, update data                                                                                    // 1669
					if (child) {                                                                                                     // 1670
						// add the child and update all layout-pointers                                                                 // 1671
						// MAY have already been done by child-layout calling parent.refreshChildren()                                  // 1672
						refreshChildren( pane, child );                                                                                 // 1673
					}                                                                                                                // 1674
				}                                                                                                                 // 1675
			});                                                                                                                // 1676
		});                                                                                                                 // 1677
	}                                                                                                                    // 1678
                                                                                                                      // 1679
,	setInstanceKey = function (child, parentPaneState) {                                                                // 1680
		// create a named key for use in state and instance branches                                                        // 1681
		var	$c	= child.container                                                                                            // 1682
		,	o	= child.options                                                                                                 // 1683
		,	sm	= o.stateManagement                                                                                            // 1684
		,	key	= o.instanceKey || $c.data("layoutInstanceKey")                                                               // 1685
		;                                                                                                                   // 1686
		if (!key) key = (sm && sm.cookie ? sm.cookie.name : '') || o.name; // look for a name/key                           // 1687
		if (!key) key = "layout"+ (++parentPaneState.childIdx);	// if no name/key found, generate one                       // 1688
		else key = key.replace(/[^\w-]/gi, '_').replace(/_{2,}/g, '_');	 // ensure is valid as a hash key                   // 1689
		o.instanceKey = key;                                                                                                // 1690
		$c.data("layoutInstanceKey", key); // useful if layout is destroyed and then recreated                              // 1691
		return key;                                                                                                         // 1692
	}                                                                                                                    // 1693
                                                                                                                      // 1694
	/**                                                                                                                  // 1695
	* @param {string}		pane		The pane being opened, ie: north, south, east, or west                                      // 1696
	* @param {Object=}		newChild	New child-layout Instance to add to this pane                                           // 1697
	*/                                                                                                                   // 1698
,	refreshChildren = function (pane, newChild) {                                                                       // 1699
		var	$P	= $Ps[pane]                                                                                                  // 1700
		,	pC	= children[pane]                                                                                               // 1701
		,	s	= state[pane]                                                                                                   // 1702
		,	o                                                                                                                 // 1703
		;                                                                                                                   // 1704
		// check for destroy()ed layouts and update the child pointers & arrays                                             // 1705
		if ($.isPlainObject( pC )) {                                                                                        // 1706
			$.each( pC, function (key, child) {                                                                                // 1707
				if (child.destroyed) delete pC[key]                                                                               // 1708
			});                                                                                                                // 1709
			// if no more children, remove the children hash                                                                   // 1710
			if ($.isEmptyObject( pC ))                                                                                         // 1711
				pC = children[pane] = null; // clear children hash                                                                // 1712
		}                                                                                                                   // 1713
                                                                                                                      // 1714
		// see if there is a directly-nested layout inside this pane                                                        // 1715
		// if there is, then there can be only ONE child-layout, so check that...                                           // 1716
		if (!newChild && !pC) {                                                                                             // 1717
			newChild = $P.data("layout");                                                                                      // 1718
		}                                                                                                                   // 1719
                                                                                                                      // 1720
		// if a newChild instance was passed, add it to children[pane]                                                      // 1721
		if (newChild) {                                                                                                     // 1722
			// update child.state                                                                                              // 1723
			newChild.hasParentLayout = true; // set parent-flag in child                                                       // 1724
			// instanceKey is a key-name used in both state and children                                                       // 1725
			o = newChild.options;                                                                                              // 1726
			// set a unique child-instance key for this layout, if not already set                                             // 1727
			setInstanceKey( newChild, s );                                                                                     // 1728
			// add pointer to pane.children hash                                                                               // 1729
			if (!pC) pC = children[pane] = {}; // create an empty children hash                                                // 1730
			pC[ o.instanceKey ] = newChild.container.data("layout"); // add childLayout instance                               // 1731
		}                                                                                                                   // 1732
                                                                                                                      // 1733
		// ALWAYS refresh the pane.children alias, even if null                                                             // 1734
		Instance[pane].children = children[pane];                                                                           // 1735
                                                                                                                      // 1736
		// if newChild was NOT passed - see if there is a child layout NOW                                                  // 1737
		if (!newChild) {                                                                                                    // 1738
			createChildren(pane); // MAY create a child and re-call this method                                                // 1739
		}                                                                                                                   // 1740
	}                                                                                                                    // 1741
                                                                                                                      // 1742
,	windowResize = function () {                                                                                        // 1743
		var	o = options                                                                                                     // 1744
		,	delay = Number(o.resizeWithWindowDelay);                                                                          // 1745
		if (delay < 10) delay = 100; // MUST have a delay!                                                                  // 1746
		// resizing uses a delay-loop because the resize event fires repeatly - except in FF, but delay anyway              // 1747
		timer.clear("winResize"); // if already running                                                                     // 1748
		timer.set("winResize", function(){                                                                                  // 1749
			timer.clear("winResize");                                                                                          // 1750
			timer.clear("winResizeRepeater");                                                                                  // 1751
			var dims = elDims( $N, o.inset );                                                                                  // 1752
			// only trigger resizeAll() if container has changed size                                                          // 1753
			if (dims.innerWidth !== sC.innerWidth || dims.innerHeight !== sC.innerHeight)                                      // 1754
				resizeAll();                                                                                                      // 1755
		}, delay);                                                                                                          // 1756
		// ALSO set fixed-delay timer, if not already running                                                               // 1757
		if (!timer.data["winResizeRepeater"]) setWindowResizeRepeater();                                                    // 1758
	}                                                                                                                    // 1759
                                                                                                                      // 1760
,	setWindowResizeRepeater = function () {                                                                             // 1761
		var delay = Number(options.resizeWithWindowMaxDelay);                                                               // 1762
		if (delay > 0)                                                                                                      // 1763
			timer.set("winResizeRepeater", function(){ setWindowResizeRepeater(); resizeAll(); }, delay);                      // 1764
	}                                                                                                                    // 1765
                                                                                                                      // 1766
,	unload = function () {                                                                                              // 1767
		var o = options;                                                                                                    // 1768
                                                                                                                      // 1769
		_runCallbacks("onunload_start");                                                                                    // 1770
                                                                                                                      // 1771
		// trigger plugin callabacks for this layout (eg: stateManagement)                                                  // 1772
		runPluginCallbacks( Instance, $.layout.onUnload );                                                                  // 1773
                                                                                                                      // 1774
		_runCallbacks("onunload_end");                                                                                      // 1775
	}                                                                                                                    // 1776
                                                                                                                      // 1777
	/**                                                                                                                  // 1778
	* Validate and initialize container CSS and events                                                                   // 1779
	*                                                                                                                    // 1780
	* @see  _create()                                                                                                    // 1781
	*/                                                                                                                   // 1782
,	_initContainer = function () {                                                                                      // 1783
		var                                                                                                                 // 1784
			N		= $N[0]	                                                                                                        // 1785
		,	$H		= $("html")                                                                                                   // 1786
		,	tag		= sC.tagName = N.tagName                                                                                     // 1787
		,	id		= sC.id = N.id                                                                                                // 1788
		,	cls		= sC.className = N.className                                                                                 // 1789
		,	o		= options                                                                                                      // 1790
		,	name	= o.name                                                                                                     // 1791
		,	props	= "position,margin,padding,border"                                                                          // 1792
		,	css		= "layoutCSS"                                                                                                // 1793
		,	CSS		= {}                                                                                                         // 1794
		,	hid		= "hidden" // used A LOT!                                                                                    // 1795
		//	see if this container is a 'pane' inside an outer-layout                                                         // 1796
		,	parent	= $N.data("parentLayout")	// parent-layout Instance                                                        // 1797
		,	pane	= $N.data("layoutEdge")		// pane-name in parent-layout                                                       // 1798
		,	isChild	= parent && pane                                                                                          // 1799
		,	num		= $.layout.cssNum                                                                                            // 1800
		,	$parent, n                                                                                                        // 1801
		;                                                                                                                   // 1802
		// sC = state.container                                                                                             // 1803
		sC.selector = $N.selector.split(".slice")[0];                                                                       // 1804
		sC.ref		= (o.name ? o.name +' layout / ' : '') + tag + (id ? "#"+id : cls ? '.['+cls+']' : ''); // used in messages // 1805
		sC.isBody	= (tag === "BODY");                                                                                       // 1806
                                                                                                                      // 1807
		// try to find a parent-layout                                                                                      // 1808
		if (!isChild && !sC.isBody) {                                                                                       // 1809
			$parent = $N.closest("."+ $.layout.defaults.panes.paneClass);                                                      // 1810
			parent	= $parent.data("parentLayout");                                                                             // 1811
			pane	= $parent.data("layoutEdge");                                                                                 // 1812
			isChild	= parent && pane;                                                                                          // 1813
		}                                                                                                                   // 1814
                                                                                                                      // 1815
		$N	.data({                                                                                                          // 1816
				layout: Instance                                                                                                  // 1817
			,	layoutContainer: sID // FLAG to indicate this is a layout-container - contains unique internal ID                // 1818
			})                                                                                                                 // 1819
			.addClass(o.containerClass)                                                                                        // 1820
		;                                                                                                                   // 1821
		var layoutMethods = {                                                                                               // 1822
			destroy:	''                                                                                                        // 1823
		,	initPanes:	''                                                                                                     // 1824
		,	resizeAll:	'resizeAll'                                                                                            // 1825
		,	resize:		'resizeAll'                                                                                              // 1826
		};                                                                                                                  // 1827
		// loop hash and bind all methods - include layoutID namespacing                                                    // 1828
		for (name in layoutMethods) {                                                                                       // 1829
			$N.bind("layout"+ name.toLowerCase() +"."+ sID, Instance[ layoutMethods[name] || name ]);                          // 1830
		}                                                                                                                   // 1831
                                                                                                                      // 1832
		// if this container is another layout's 'pane', then set child/parent pointers                                     // 1833
		if (isChild) {                                                                                                      // 1834
			// update parent flag                                                                                              // 1835
			Instance.hasParentLayout = true;                                                                                   // 1836
			// set pointers to THIS child-layout (Instance) in parent-layout                                                   // 1837
			parent.refreshChildren( pane, Instance );                                                                          // 1838
		}                                                                                                                   // 1839
                                                                                                                      // 1840
		// SAVE original container CSS for use in destroy()                                                                 // 1841
		if (!$N.data(css)) {                                                                                                // 1842
			// handle props like overflow different for BODY & HTML - has 'system default' values                              // 1843
			if (sC.isBody) {                                                                                                   // 1844
				// SAVE <BODY> CSS                                                                                                // 1845
				$N.data(css, $.extend( styles($N, props), {                                                                       // 1846
					height:		$N.css("height")                                                                                        // 1847
				,	overflow:	$N.css("overflow")                                                                                    // 1848
				,	overflowX:	$N.css("overflowX")                                                                                  // 1849
				,	overflowY:	$N.css("overflowY")                                                                                  // 1850
				}));                                                                                                              // 1851
				// ALSO SAVE <HTML> CSS                                                                                           // 1852
				$H.data(css, $.extend( styles($H, 'padding'), {                                                                   // 1853
					height:		"auto" // FF would return a fixed px-size!                                                              // 1854
				,	overflow:	$H.css("overflow")                                                                                    // 1855
				,	overflowX:	$H.css("overflowX")                                                                                  // 1856
				,	overflowY:	$H.css("overflowY")                                                                                  // 1857
				}));                                                                                                              // 1858
			}                                                                                                                  // 1859
			else // handle props normally for non-body elements                                                                // 1860
				$N.data(css, styles($N, props+",top,bottom,left,right,width,height,overflow,overflowX,overflowY") );              // 1861
		}                                                                                                                   // 1862
                                                                                                                      // 1863
		try {                                                                                                               // 1864
			// common container CSS                                                                                            // 1865
			CSS = {                                                                                                            // 1866
				overflow:	hid                                                                                                     // 1867
			,	overflowX:	hid                                                                                                   // 1868
			,	overflowY:	hid                                                                                                   // 1869
			};                                                                                                                 // 1870
			$N.css( CSS );                                                                                                     // 1871
                                                                                                                      // 1872
			if (o.inset && !$.isPlainObject(o.inset)) {                                                                        // 1873
				// can specify a single number for equal outset all-around                                                        // 1874
				n = parseInt(o.inset, 10) || 0                                                                                    // 1875
				o.inset = {                                                                                                       // 1876
					top:	n                                                                                                           // 1877
				,	bottom:	n                                                                                                       // 1878
				,	left:	n                                                                                                         // 1879
				,	right:	n                                                                                                        // 1880
				};                                                                                                                // 1881
			}                                                                                                                  // 1882
                                                                                                                      // 1883
			// format html & body if this is a full page layout                                                                // 1884
			if (sC.isBody) {                                                                                                   // 1885
				// if HTML has padding, use this as an outer-spacing around BODY                                                  // 1886
				if (!o.outset) {                                                                                                  // 1887
					// use padding from parent-elem (HTML) as outset                                                                 // 1888
					o.outset = {                                                                                                     // 1889
						top:	num($H, "paddingTop")                                                                                      // 1890
					,	bottom:	num($H, "paddingBottom")                                                                               // 1891
					,	left:	num($H, "paddingLeft")                                                                                   // 1892
					,	right:	num($H, "paddingRight")                                                                                 // 1893
					};                                                                                                               // 1894
				}                                                                                                                 // 1895
				else if (!$.isPlainObject(o.outset)) {                                                                            // 1896
					// can specify a single number for equal outset all-around                                                       // 1897
					n = parseInt(o.outset, 10) || 0                                                                                  // 1898
					o.outset = {                                                                                                     // 1899
						top:	n                                                                                                          // 1900
					,	bottom:	n                                                                                                      // 1901
					,	left:	n                                                                                                        // 1902
					,	right:	n                                                                                                       // 1903
					};                                                                                                               // 1904
				}                                                                                                                 // 1905
				// HTML                                                                                                           // 1906
				$H.css( CSS ).css({                                                                                               // 1907
					height:		"100%"                                                                                                  // 1908
				,	border:		"none"	// no border or padding allowed when using height = 100%                                        // 1909
				,	padding:	0		// ditto                                                                                            // 1910
				,	margin:		0                                                                                                      // 1911
				});                                                                                                               // 1912
				// BODY                                                                                                           // 1913
				if (browser.isIE6) {                                                                                              // 1914
					// IE6 CANNOT use the trick of setting absolute positioning on all 4 sides - must have 'height'                  // 1915
					$N.css({                                                                                                         // 1916
						width:		"100%"                                                                                                  // 1917
					,	height:		"100%"                                                                                                // 1918
					,	border:		"none"	// no border or padding allowed when using height = 100%                                       // 1919
					,	padding:	0		// ditto                                                                                           // 1920
					,	margin:		0                                                                                                     // 1921
					,	position:	"relative"                                                                                           // 1922
					});                                                                                                              // 1923
					// convert body padding to an inset option - the border cannot be measured in IE6!                               // 1924
					if (!o.inset) o.inset = elDims( $N ).inset;                                                                      // 1925
				}                                                                                                                 // 1926
				else { // use absolute positioning for BODY to allow borders & padding without overflow                           // 1927
					$N.css({                                                                                                         // 1928
						width:		"auto"                                                                                                  // 1929
					,	height:		"auto"                                                                                                // 1930
					,	margin:		0                                                                                                     // 1931
					,	position:	"absolute"	// allows for border and padding on BODY                                                  // 1932
					});                                                                                                              // 1933
					// apply edge-positioning created above                                                                          // 1934
					$N.css( o.outset );                                                                                              // 1935
				}                                                                                                                 // 1936
				// set current layout-container dimensions                                                                        // 1937
				$.extend(sC, elDims( $N, o.inset )); // passing inset means DO NOT include insetX values                          // 1938
			}                                                                                                                  // 1939
			else {                                                                                                             // 1940
				// container MUST have 'position'                                                                                 // 1941
				var	p = $N.css("position");                                                                                       // 1942
				if (!p || !p.match(/(fixed|absolute|relative)/))                                                                  // 1943
					$N.css("position","relative");                                                                                   // 1944
                                                                                                                      // 1945
				// set current layout-container dimensions                                                                        // 1946
				if ( $N.is(":visible") ) {                                                                                        // 1947
					$.extend(sC, elDims( $N, o.inset )); // passing inset means DO NOT change insetX (padding) values                // 1948
					if (sC.innerHeight < 1) // container has no 'height' - warn developer                                            // 1949
						_log( o.errors.noContainerHeight.replace(/CONTAINER/, sC.ref) );                                                // 1950
				}                                                                                                                 // 1951
			}                                                                                                                  // 1952
                                                                                                                      // 1953
			// if container has min-width/height, then enable scrollbar(s)                                                     // 1954
			if ( num($N, "minWidth")  ) $N.parent().css("overflowX","auto");                                                   // 1955
			if ( num($N, "minHeight") ) $N.parent().css("overflowY","auto");                                                   // 1956
                                                                                                                      // 1957
		} catch (ex) {}                                                                                                     // 1958
	}                                                                                                                    // 1959
                                                                                                                      // 1960
	/**                                                                                                                  // 1961
	* Bind layout hotkeys - if options enabled                                                                           // 1962
	*                                                                                                                    // 1963
	* @see  _create() and addPane()                                                                                      // 1964
	* @param {string=}	[panes=""]	The edge(s) to process                                                                 // 1965
	*/                                                                                                                   // 1966
,	initHotkeys = function (panes) {                                                                                    // 1967
		panes = panes ? panes.split(",") : _c.borderPanes;                                                                  // 1968
		// bind keyDown to capture hotkeys, if option enabled for ANY pane                                                  // 1969
		$.each(panes, function (i, pane) {                                                                                  // 1970
			var o = options[pane];                                                                                             // 1971
			if (o.enableCursorHotkey || o.customHotkey) {                                                                      // 1972
				$(document).bind("keydown."+ sID, keyDown); // only need to bind this ONCE                                        // 1973
				return false; // BREAK - binding was done                                                                         // 1974
			}                                                                                                                  // 1975
		});                                                                                                                 // 1976
	}                                                                                                                    // 1977
                                                                                                                      // 1978
	/**                                                                                                                  // 1979
	* Build final OPTIONS data                                                                                           // 1980
	*                                                                                                                    // 1981
	* @see  _create()                                                                                                    // 1982
	*/                                                                                                                   // 1983
,	initOptions = function () {                                                                                         // 1984
		var data, d, pane, key, val, i, c, o;                                                                               // 1985
                                                                                                                      // 1986
		// reprocess user's layout-options to have correct options sub-key structure                                        // 1987
		opts = $.layout.transformData( opts, true ); // panes = default subkey                                              // 1988
                                                                                                                      // 1989
		// auto-rename old options for backward compatibility                                                               // 1990
		opts = $.layout.backwardCompatibility.renameAllOptions( opts );                                                     // 1991
                                                                                                                      // 1992
		// if user-options has 'panes' key (pane-defaults), clean it...                                                     // 1993
		if (!$.isEmptyObject(opts.panes)) {                                                                                 // 1994
			// REMOVE any pane-defaults that MUST be set per-pane                                                              // 1995
			data = $.layout.optionsMap.noDefault;                                                                              // 1996
			for (i=0, c=data.length; i<c; i++) {                                                                               // 1997
				key = data[i];                                                                                                    // 1998
				delete opts.panes[key]; // OK if does not exist                                                                   // 1999
			}                                                                                                                  // 2000
			// REMOVE any layout-options specified under opts.panes                                                            // 2001
			data = $.layout.optionsMap.layout;                                                                                 // 2002
			for (i=0, c=data.length; i<c; i++) {                                                                               // 2003
				key = data[i];                                                                                                    // 2004
				delete opts.panes[key]; // OK if does not exist                                                                   // 2005
			}                                                                                                                  // 2006
		}                                                                                                                   // 2007
                                                                                                                      // 2008
		// MOVE any NON-layout-options from opts-root to opts.panes                                                         // 2009
		data = $.layout.optionsMap.layout;                                                                                  // 2010
		var rootKeys = $.layout.config.optionRootKeys;                                                                      // 2011
		for (key in opts) {                                                                                                 // 2012
			val = opts[key];                                                                                                   // 2013
			if ($.inArray(key, rootKeys) < 0 && $.inArray(key, data) < 0) {                                                    // 2014
				if (!opts.panes[key])                                                                                             // 2015
					opts.panes[key] = $.isPlainObject(val) ? $.extend(true, {}, val) : val;                                          // 2016
				delete opts[key]                                                                                                  // 2017
			}                                                                                                                  // 2018
		}                                                                                                                   // 2019
                                                                                                                      // 2020
		// START by updating ALL options from opts                                                                          // 2021
		$.extend(true, options, opts);                                                                                      // 2022
                                                                                                                      // 2023
		// CREATE final options (and config) for EACH pane                                                                  // 2024
		$.each(_c.allPanes, function (i, pane) {                                                                            // 2025
                                                                                                                      // 2026
			// apply 'pane-defaults' to CONFIG.[PANE]                                                                          // 2027
			_c[pane] = $.extend(true, {}, _c.panes, _c[pane]);                                                                 // 2028
                                                                                                                      // 2029
			d = options.panes;                                                                                                 // 2030
			o = options[pane];                                                                                                 // 2031
                                                                                                                      // 2032
			// center-pane uses SOME keys in defaults.panes branch                                                             // 2033
			if (pane === 'center') {                                                                                           // 2034
				// ONLY copy keys from opts.panes listed in: $.layout.optionsMap.center                                           // 2035
				data = $.layout.optionsMap.center;		// list of 'center-pane keys'                                                 // 2036
				for (i=0, c=data.length; i<c; i++) {	// loop the list...                                                          // 2037
					key = data[i];                                                                                                   // 2038
					// only need to use pane-default if pane-specific value not set                                                  // 2039
					if (!opts.center[key] && (opts.panes[key] || !o[key]))                                                           // 2040
						o[key] = d[key]; // pane-default                                                                                // 2041
				}                                                                                                                 // 2042
			}                                                                                                                  // 2043
			else {                                                                                                             // 2044
				// border-panes use ALL keys in defaults.panes branch                                                             // 2045
				o = options[pane] = $.extend(true, {}, d, o); // re-apply pane-specific opts AFTER pane-defaults                  // 2046
				createFxOptions( pane );                                                                                          // 2047
				// ensure all border-pane-specific base-classes exist                                                             // 2048
				if (!o.resizerClass)	o.resizerClass	= "ui-layout-resizer";                                                        // 2049
				if (!o.togglerClass)	o.togglerClass	= "ui-layout-toggler";                                                        // 2050
			}                                                                                                                  // 2051
			// ensure we have base pane-class (ALL panes)                                                                      // 2052
			if (!o.paneClass) o.paneClass = "ui-layout-pane";                                                                  // 2053
		});                                                                                                                 // 2054
                                                                                                                      // 2055
		// update options.zIndexes if a zIndex-option specified                                                             // 2056
		var zo	= opts.zIndex                                                                                                // 2057
		,	z	= options.zIndexes;                                                                                             // 2058
		if (zo > 0) {                                                                                                       // 2059
			z.pane_normal		= zo;                                                                                               // 2060
			z.content_mask		= max(zo+1, z.content_mask);	// MIN = +1                                                           // 2061
			z.resizer_normal	= max(zo+2, z.resizer_normal);	// MIN = +2                                                        // 2062
		}                                                                                                                   // 2063
                                                                                                                      // 2064
		// DELETE 'panes' key now that we are done - values were copied to EACH pane                                        // 2065
		delete options.panes;                                                                                               // 2066
                                                                                                                      // 2067
                                                                                                                      // 2068
		function createFxOptions ( pane ) {                                                                                 // 2069
			var	o = options[pane]                                                                                              // 2070
			,	d = options.panes;                                                                                               // 2071
			// ensure fxSettings key to avoid errors                                                                           // 2072
			if (!o.fxSettings) o.fxSettings = {};                                                                              // 2073
			if (!d.fxSettings) d.fxSettings = {};                                                                              // 2074
                                                                                                                      // 2075
			$.each(["_open","_close","_size"], function (i,n) {                                                                // 2076
				var                                                                                                               // 2077
					sName		= "fxName"+ n                                                                                             // 2078
				,	sSpeed		= "fxSpeed"+ n                                                                                          // 2079
				,	sSettings	= "fxSettings"+ n                                                                                     // 2080
					// recalculate fxName according to specificity rules                                                             // 2081
				,	fxName = o[sName] =                                                                                             // 2082
						o[sName]	// options.west.fxName_open                                                                            // 2083
					||	d[sName]	// options.panes.fxName_open                                                                         // 2084
					||	o.fxName	// options.west.fxName                                                                               // 2085
					||	d.fxName	// options.panes.fxName                                                                              // 2086
					||	"none"		// MEANS $.layout.defaults.panes.fxName == "" || false || null || 0                                   // 2087
				,	fxExists	= $.effects && ($.effects[fxName] || ($.effects.effect && $.effects.effect[fxName]))                   // 2088
				;                                                                                                                 // 2089
				// validate fxName to ensure is valid effect - MUST have effect-config data in options.effects                    // 2090
				if (fxName === "none" || !options.effects[fxName] || !fxExists)                                                   // 2091
					fxName = o[sName] = "none"; // effect not loaded OR unrecognized fxName                                          // 2092
                                                                                                                      // 2093
				// set vars for effects subkeys to simplify logic                                                                 // 2094
				var	fx		= options.effects[fxName] || {}	// effects.slide                                                          // 2095
				,	fx_all	= fx.all	|| null				// effects.slide.all                                                                 // 2096
				,	fx_pane	= fx[pane]	|| null				// effects.slide.west                                                             // 2097
				;                                                                                                                 // 2098
				// create fxSpeed[_open|_close|_size]                                                                             // 2099
				o[sSpeed] =                                                                                                       // 2100
					o[sSpeed]				// options.west.fxSpeed_open                                                                        // 2101
				||	d[sSpeed]				// options.west.fxSpeed_open                                                                      // 2102
				||	o.fxSpeed				// options.west.fxSpeed                                                                           // 2103
				||	d.fxSpeed				// options.panes.fxSpeed                                                                          // 2104
				||	null					// DEFAULT - let fxSetting.duration control speed                                                     // 2105
				;                                                                                                                 // 2106
				// create fxSettings[_open|_close|_size]                                                                          // 2107
				o[sSettings] = $.extend(                                                                                          // 2108
					true                                                                                                             // 2109
				,	{}                                                                                                              // 2110
				,	fx_all					// effects.slide.all                                                                                 // 2111
				,	fx_pane					// effects.slide.west                                                                               // 2112
				,	d.fxSettings			// options.panes.fxSettings                                                                      // 2113
				,	o.fxSettings			// options.west.fxSettings                                                                       // 2114
				,	d[sSettings]			// options.panes.fxSettings_open                                                                 // 2115
				,	o[sSettings]			// options.west.fxSettings_open                                                                  // 2116
				);                                                                                                                // 2117
			});                                                                                                                // 2118
                                                                                                                      // 2119
			// DONE creating action-specific-settings for this pane,                                                           // 2120
			// so DELETE generic options - are no longer meaningful                                                            // 2121
			delete o.fxName;                                                                                                   // 2122
			delete o.fxSpeed;                                                                                                  // 2123
			delete o.fxSettings;                                                                                               // 2124
		}                                                                                                                   // 2125
	}                                                                                                                    // 2126
                                                                                                                      // 2127
	/**                                                                                                                  // 2128
	* Initialize module objects, styling, size and position for all panes                                                // 2129
	*                                                                                                                    // 2130
	* @see  _initElements()                                                                                              // 2131
	* @param {string}	pane		The pane to process                                                                          // 2132
	*/                                                                                                                   // 2133
,	getPane = function (pane) {                                                                                         // 2134
		var sel = options[pane].paneSelector                                                                                // 2135
		if (sel.substr(0,1)==="#") // ID selector                                                                           // 2136
			// NOTE: elements selected 'by ID' DO NOT have to be 'children'                                                    // 2137
			return $N.find(sel).eq(0);                                                                                         // 2138
		else { // class or other selector                                                                                   // 2139
			var $P = $N.children(sel).eq(0);                                                                                   // 2140
			// look for the pane nested inside a 'form' element                                                                // 2141
			return $P.length ? $P : $N.children("form:first").children(sel).eq(0);                                             // 2142
		}                                                                                                                   // 2143
	}                                                                                                                    // 2144
                                                                                                                      // 2145
	/**                                                                                                                  // 2146
	* @param {Object=}		evt                                                                                              // 2147
	*/                                                                                                                   // 2148
,	initPanes = function (evt) {                                                                                        // 2149
		// stopPropagation if called by trigger("layoutinitpanes") - use evtPane utility                                    // 2150
		evtPane(evt);                                                                                                       // 2151
                                                                                                                      // 2152
		// NOTE: do north & south FIRST so we can measure their height - do center LAST                                     // 2153
		$.each(_c.allPanes, function (idx, pane) {                                                                          // 2154
			addPane( pane, true );                                                                                             // 2155
		});                                                                                                                 // 2156
                                                                                                                      // 2157
		// init the pane-handles NOW in case we have to hide or close the pane below                                        // 2158
		initHandles();                                                                                                      // 2159
                                                                                                                      // 2160
		// now that all panes have been initialized and initially-sized,                                                    // 2161
		// make sure there is really enough space available for each pane                                                   // 2162
		$.each(_c.borderPanes, function (i, pane) {                                                                         // 2163
			if ($Ps[pane] && state[pane].isVisible) { // pane is OPEN                                                          // 2164
				setSizeLimits(pane);                                                                                              // 2165
				makePaneFit(pane); // pane may be Closed, Hidden or Resized by makePaneFit()                                      // 2166
			}                                                                                                                  // 2167
		});                                                                                                                 // 2168
		// size center-pane AGAIN in case we 'closed' a border-pane in loop above                                           // 2169
		sizeMidPanes("center");                                                                                             // 2170
                                                                                                                      // 2171
		//	Chrome/Webkit sometimes fires callbacks BEFORE it completes resizing!                                            // 2172
		//	Before RC30.3, there was a 10ms delay here, but that caused layout                                               // 2173
		//	to load asynchrously, which is BAD, so try skipping delay for now                                                // 2174
                                                                                                                      // 2175
		// process pane contents and callbacks, and init/resize child-layout if exists                                      // 2176
		$.each(_c.allPanes, function (idx, pane) {                                                                          // 2177
			afterInitPane(pane);                                                                                               // 2178
		});                                                                                                                 // 2179
	}                                                                                                                    // 2180
                                                                                                                      // 2181
	/**                                                                                                                  // 2182
	* Add a pane to the layout - subroutine of initPanes()                                                               // 2183
	*                                                                                                                    // 2184
	* @see  initPanes()                                                                                                  // 2185
	* @param {string}	pane			The pane to process                                                                         // 2186
	* @param {boolean=}	[force=false]	Size content after init                                                            // 2187
	*/                                                                                                                   // 2188
,	addPane = function (pane, force) {                                                                                  // 2189
		if (!force && !isInitialized()) return;                                                                             // 2190
		var                                                                                                                 // 2191
			o		= options[pane]                                                                                                 // 2192
		,	s		= state[pane]                                                                                                  // 2193
		,	c		= _c[pane]                                                                                                     // 2194
		,	dir		= c.dir                                                                                                      // 2195
		,	fx		= s.fx                                                                                                        // 2196
		,	spacing	= o.spacing_open || 0                                                                                     // 2197
		,	isCenter = (pane === "center")                                                                                    // 2198
		,	CSS		= {}                                                                                                         // 2199
		,	$P		= $Ps[pane]                                                                                                   // 2200
		,	size, minSize, maxSize, child                                                                                     // 2201
		;                                                                                                                   // 2202
		// if pane-pointer already exists, remove the old one first                                                         // 2203
		if ($P)                                                                                                             // 2204
			removePane( pane, false, true, false );                                                                            // 2205
		else                                                                                                                // 2206
			$Cs[pane] = false; // init                                                                                         // 2207
                                                                                                                      // 2208
		$P = $Ps[pane] = getPane(pane);                                                                                     // 2209
		if (!$P.length) {                                                                                                   // 2210
			$Ps[pane] = false; // logic                                                                                        // 2211
			return;                                                                                                            // 2212
		}                                                                                                                   // 2213
                                                                                                                      // 2214
		// SAVE original Pane CSS                                                                                           // 2215
		if (!$P.data("layoutCSS")) {                                                                                        // 2216
			var props = "position,top,left,bottom,right,width,height,overflow,zIndex,display,backgroundColor,padding,margin,border";
			$P.data("layoutCSS", styles($P, props));                                                                           // 2218
		}                                                                                                                   // 2219
                                                                                                                      // 2220
		// create alias for pane data in Instance - initHandles will add more                                               // 2221
		Instance[pane] = {                                                                                                  // 2222
			name:		pane                                                                                                        // 2223
		,	pane:		$Ps[pane]                                                                                                  // 2224
		,	content:	$Cs[pane]                                                                                                // 2225
		,	options:	options[pane]                                                                                            // 2226
		,	state:		state[pane]                                                                                               // 2227
		,	children:	children[pane]                                                                                          // 2228
		};                                                                                                                  // 2229
                                                                                                                      // 2230
		// add classes, attributes & events                                                                                 // 2231
		$P	.data({                                                                                                          // 2232
				parentLayout:	Instance		// pointer to Layout Instance                                                             // 2233
			,	layoutPane:		Instance[pane]	// NEW pointer to pane-alias-object                                                  // 2234
			,	layoutEdge:		pane                                                                                                // 2235
			,	layoutRole:		"pane"                                                                                              // 2236
			})                                                                                                                 // 2237
			.css(c.cssReq).css("zIndex", options.zIndexes.pane_normal)                                                         // 2238
			.css(o.applyDemoStyles ? c.cssDemo : {}) // demo styles                                                            // 2239
			.addClass( o.paneClass +" "+ o.paneClass+"-"+pane ) // default = "ui-layout-pane ui-layout-pane-west" - may be a dupe of 'paneSelector'
			.bind("mouseenter."+ sID, addHover )                                                                               // 2241
			.bind("mouseleave."+ sID, removeHover )                                                                            // 2242
			;                                                                                                                  // 2243
		var paneMethods = {                                                                                                 // 2244
				hide:				''                                                                                                       // 2245
			,	show:				''                                                                                                      // 2246
			,	toggle:				''                                                                                                    // 2247
			,	close:				''                                                                                                     // 2248
			,	open:				''                                                                                                      // 2249
			,	slideOpen:			''                                                                                                  // 2250
			,	slideClose:			''                                                                                                 // 2251
			,	slideToggle:		''                                                                                                 // 2252
			,	size:				'sizePane'                                                                                              // 2253
			,	sizePane:			'sizePane'                                                                                           // 2254
			,	sizeContent:		''                                                                                                 // 2255
			,	sizeHandles:		''                                                                                                 // 2256
			,	enableClosable:		''                                                                                              // 2257
			,	disableClosable:	''                                                                                              // 2258
			,	enableSlideable:	''                                                                                              // 2259
			,	disableSlideable:	''                                                                                             // 2260
			,	enableResizable:	''                                                                                              // 2261
			,	disableResizable:	''                                                                                             // 2262
			,	swapPanes:			'swapPanes'                                                                                         // 2263
			,	swap:				'swapPanes'                                                                                             // 2264
			,	move:				'swapPanes'                                                                                             // 2265
			,	removePane:			'removePane'                                                                                       // 2266
			,	remove:				'removePane'                                                                                          // 2267
			,	createChildren:		''                                                                                              // 2268
			,	resizeChildren:		''                                                                                              // 2269
			,	resizeAll:			'resizeAll'                                                                                         // 2270
			,	resizeLayout:		'resizeAll'                                                                                       // 2271
			}                                                                                                                  // 2272
		,	name;                                                                                                             // 2273
		// loop hash and bind all methods - include layoutID namespacing                                                    // 2274
		for (name in paneMethods) {                                                                                         // 2275
			$P.bind("layoutpane"+ name.toLowerCase() +"."+ sID, Instance[ paneMethods[name] || name ]);                        // 2276
		}                                                                                                                   // 2277
                                                                                                                      // 2278
		// see if this pane has a 'scrolling-content element'                                                               // 2279
		initContent(pane, false); // false = do NOT sizeContent() - called later                                            // 2280
                                                                                                                      // 2281
		if (!isCenter) {                                                                                                    // 2282
			// call _parseSize AFTER applying pane classes & styles - but before making visible (if hidden)                    // 2283
			// if o.size is auto or not valid, then MEASURE the pane and use that as its 'size'                                // 2284
			size	= s.size = _parseSize(pane, o.size);                                                                          // 2285
			minSize	= _parseSize(pane,o.minSize) || 1;                                                                         // 2286
			maxSize	= _parseSize(pane,o.maxSize) || 100000;                                                                    // 2287
			if (size > 0) size = max(min(size, maxSize), minSize);                                                             // 2288
			s.autoResize = o.autoResize; // used with percentage sizes                                                         // 2289
                                                                                                                      // 2290
			// state for border-panes                                                                                          // 2291
			s.isClosed  = false; // true = pane is closed                                                                      // 2292
			s.isSliding = false; // true = pane is currently open by 'sliding' over adjacent panes                             // 2293
			s.isResizing= false; // true = pane is in process of being resized                                                 // 2294
			s.isHidden	= false; // true = pane is hidden - no spacing, resizer or toggler is visible!                          // 2295
                                                                                                                      // 2296
			// array for 'pin buttons' whose classNames are auto-updated on pane-open/-close                                   // 2297
			if (!s.pins) s.pins = [];                                                                                          // 2298
		}                                                                                                                   // 2299
		//	states common to ALL panes                                                                                       // 2300
		s.tagName	= $P[0].tagName;                                                                                          // 2301
		s.edge		= pane;		// useful if pane is (or about to be) 'swapped' - easy find out where it is (or is going)          // 2302
		s.noRoom	= false;	// true = pane 'automatically' hidden due to insufficient room - will unhide automatically        // 2303
		s.isVisible	= true;		// false = pane is invisible - closed OR hidden - simplify logic                               // 2304
                                                                                                                      // 2305
		// init pane positioning                                                                                            // 2306
		setPanePosition( pane );                                                                                            // 2307
                                                                                                                      // 2308
		// if pane is not visible,                                                                                          // 2309
		if (dir === "horz") // north or south pane                                                                          // 2310
			CSS.height = cssH($P, size);                                                                                       // 2311
		else if (dir === "vert") // east or west pane                                                                       // 2312
			CSS.width = cssW($P, size);                                                                                        // 2313
		//else if (isCenter) {}                                                                                             // 2314
                                                                                                                      // 2315
		$P.css(CSS); // apply size -- top, bottom & height will be set by sizeMidPanes                                      // 2316
		if (dir != "horz") sizeMidPanes(pane, true); // true = skipCallback                                                 // 2317
                                                                                                                      // 2318
		// if manually adding a pane AFTER layout initialization, then...                                                   // 2319
		if (state.initialized) {                                                                                            // 2320
			initHandles( pane );                                                                                               // 2321
			initHotkeys( pane );                                                                                               // 2322
		}                                                                                                                   // 2323
                                                                                                                      // 2324
		// close or hide the pane if specified in settings                                                                  // 2325
		if (o.initClosed && o.closable && !o.initHidden)                                                                    // 2326
			close(pane, true, true); // true, true = force, noAnimation                                                        // 2327
		else if (o.initHidden || o.initClosed)                                                                              // 2328
			hide(pane); // will be completely invisible - no resizer or spacing                                                // 2329
		else if (!s.noRoom)                                                                                                 // 2330
			// make the pane visible - in case was initially hidden                                                            // 2331
			$P.css("display","block");                                                                                         // 2332
		// ELSE setAsOpen() - called later by initHandles()                                                                 // 2333
                                                                                                                      // 2334
		// RESET visibility now - pane will appear IF display:block                                                         // 2335
		$P.css("visibility","visible");                                                                                     // 2336
                                                                                                                      // 2337
		// check option for auto-handling of pop-ups & drop-downs                                                           // 2338
		if (o.showOverflowOnHover)                                                                                          // 2339
			$P.hover( allowOverflow, resetOverflow );                                                                          // 2340
                                                                                                                      // 2341
		// if manually adding a pane AFTER layout initialization, then...                                                   // 2342
		if (state.initialized) {                                                                                            // 2343
			afterInitPane( pane );                                                                                             // 2344
		}                                                                                                                   // 2345
	}                                                                                                                    // 2346
                                                                                                                      // 2347
,	afterInitPane = function (pane) {                                                                                   // 2348
		var	$P	= $Ps[pane]                                                                                                  // 2349
		,	s	= state[pane]                                                                                                   // 2350
		,	o	= options[pane]                                                                                                 // 2351
		;                                                                                                                   // 2352
		if (!$P) return;                                                                                                    // 2353
                                                                                                                      // 2354
		// see if there is a directly-nested layout inside this pane                                                        // 2355
		if ($P.data("layout"))                                                                                              // 2356
			refreshChildren( pane, $P.data("layout") );                                                                        // 2357
                                                                                                                      // 2358
		// process pane contents and callbacks, and init/resize child-layout if exists                                      // 2359
		if (s.isVisible) { // pane is OPEN                                                                                  // 2360
			if (state.initialized) // this pane was added AFTER layout was created                                             // 2361
				resizeAll(); // will also sizeContent                                                                             // 2362
			else                                                                                                               // 2363
				sizeContent(pane);                                                                                                // 2364
                                                                                                                      // 2365
			if (o.triggerEventsOnLoad)                                                                                         // 2366
				_runCallbacks("onresize_end", pane);                                                                              // 2367
			else // automatic if onresize called, otherwise call it specifically                                               // 2368
				// resize child - IF inner-layout already exists (created before this layout)                                     // 2369
				resizeChildren(pane, true); // a previously existing childLayout                                                  // 2370
		}                                                                                                                   // 2371
                                                                                                                      // 2372
		// init childLayouts - even if pane is not visible                                                                  // 2373
		if (o.initChildren && o.children)                                                                                   // 2374
			createChildren(pane);                                                                                              // 2375
	}                                                                                                                    // 2376
                                                                                                                      // 2377
	/**                                                                                                                  // 2378
	* @param {string=}	panes		The pane(s) to process                                                                     // 2379
	*/                                                                                                                   // 2380
,	setPanePosition = function (panes) {                                                                                // 2381
		panes = panes ? panes.split(",") : _c.borderPanes;                                                                  // 2382
                                                                                                                      // 2383
		// create toggler DIVs for each pane, and set object pointers for them, eg: $R.north = north toggler DIV            // 2384
		$.each(panes, function (i, pane) {                                                                                  // 2385
			var $P	= $Ps[pane]                                                                                                 // 2386
			,	$R	= $Rs[pane]                                                                                                   // 2387
			,	o	= options[pane]                                                                                                // 2388
			,	s	= state[pane]                                                                                                  // 2389
			,	side =  _c[pane].side                                                                                            // 2390
			,	CSS	= {}                                                                                                         // 2391
			;                                                                                                                  // 2392
			if (!$P) return; // pane does not exist - skip                                                                     // 2393
                                                                                                                      // 2394
			// set css-position to account for container borders & padding                                                     // 2395
			switch (pane) {                                                                                                    // 2396
				case "north": 	CSS.top 	= sC.inset.top;                                                                           // 2397
								CSS.left 	= sC.inset.left;                                                                                    // 2398
								CSS.right	= sC.inset.right;                                                                                   // 2399
								break;                                                                                                        // 2400
				case "south": 	CSS.bottom	= sC.inset.bottom;                                                                      // 2401
								CSS.left 	= sC.inset.left;                                                                                    // 2402
								CSS.right 	= sC.inset.right;                                                                                  // 2403
								break;                                                                                                        // 2404
				case "west": 	CSS.left 	= sC.inset.left; // top, bottom & height set by sizeMidPanes()                            // 2405
								break;                                                                                                        // 2406
				case "east": 	CSS.right 	= sC.inset.right; // ditto                                                               // 2407
								break;                                                                                                        // 2408
				case "center":	// top, left, width & height set by sizeMidPanes()                                                 // 2409
			}                                                                                                                  // 2410
			// apply position                                                                                                  // 2411
			$P.css(CSS);                                                                                                       // 2412
                                                                                                                      // 2413
			// update resizer position                                                                                         // 2414
			if ($R && s.isClosed)                                                                                              // 2415
				$R.css(side, sC.inset[side]);                                                                                     // 2416
			else if ($R && !s.isHidden)                                                                                        // 2417
				$R.css(side, sC.inset[side] + getPaneSize(pane));                                                                 // 2418
		});                                                                                                                 // 2419
	}                                                                                                                    // 2420
                                                                                                                      // 2421
	/**                                                                                                                  // 2422
	* Initialize module objects, styling, size and position for all resize bars and toggler buttons                      // 2423
	*                                                                                                                    // 2424
	* @see  _create()                                                                                                    // 2425
	* @param {string=}	[panes=""]	The edge(s) to process                                                                 // 2426
	*/                                                                                                                   // 2427
,	initHandles = function (panes) {                                                                                    // 2428
		panes = panes ? panes.split(",") : _c.borderPanes;                                                                  // 2429
                                                                                                                      // 2430
		// create toggler DIVs for each pane, and set object pointers for them, eg: $R.north = north toggler DIV            // 2431
		$.each(panes, function (i, pane) {                                                                                  // 2432
			var $P		= $Ps[pane];                                                                                               // 2433
			$Rs[pane]	= false; // INIT                                                                                         // 2434
			$Ts[pane]	= false;                                                                                                 // 2435
			if (!$P) return; // pane does not exist - skip                                                                     // 2436
                                                                                                                      // 2437
			var	o		= options[pane]                                                                                             // 2438
			,	s		= state[pane]                                                                                                 // 2439
			,	c		= _c[pane]                                                                                                    // 2440
			,	paneId	= o.paneSelector.substr(0,1) === "#" ? o.paneSelector.substr(1) : ""                                      // 2441
			,	rClass	= o.resizerClass                                                                                          // 2442
			,	tClass	= o.togglerClass                                                                                          // 2443
			,	spacing	= (s.isVisible ? o.spacing_open : o.spacing_closed)                                                      // 2444
			,	_pane	= "-"+ pane // used for classNames                                                                         // 2445
			,	_state	= (s.isVisible ? "-open" : "-closed") // used for classNames                                              // 2446
			,	I		= Instance[pane]                                                                                              // 2447
				// INIT RESIZER BAR                                                                                               // 2448
			,	$R		= I.resizer = $Rs[pane] = $("<div></div>")                                                                   // 2449
				// INIT TOGGLER BUTTON                                                                                            // 2450
			,	$T		= I.toggler = (o.closable ? $Ts[pane] = $("<div></div>") : false)                                            // 2451
			;                                                                                                                  // 2452
                                                                                                                      // 2453
			//if (s.isVisible && o.resizable) ... handled by initResizable                                                     // 2454
			if (!s.isVisible && o.slidable)                                                                                    // 2455
				$R.attr("title", o.tips.Slide).css("cursor", o.sliderCursor);                                                     // 2456
                                                                                                                      // 2457
			$R	// if paneSelector is an ID, then create a matching ID for the resizer, eg: "#paneLeft" => "paneLeft-resizer"   // 2458
				.attr("id", paneId ? paneId +"-resizer" : "" )                                                                    // 2459
				.data({                                                                                                           // 2460
					parentLayout:	Instance                                                                                           // 2461
				,	layoutPane:		Instance[pane]	// NEW pointer to pane-alias-object                                                 // 2462
				,	layoutEdge:		pane                                                                                               // 2463
				,	layoutRole:		"resizer"                                                                                          // 2464
				})                                                                                                                // 2465
				.css(_c.resizers.cssReq).css("zIndex", options.zIndexes.resizer_normal)                                           // 2466
				.css(o.applyDemoStyles ? _c.resizers.cssDemo : {}) // add demo styles                                             // 2467
				.addClass(rClass +" "+ rClass+_pane)                                                                              // 2468
				.hover(addHover, removeHover) // ALWAYS add hover-classes, even if resizing is not enabled - handle with CSS instead
				.hover(onResizerEnter, onResizerLeave) // ALWAYS NEED resizer.mouseleave to balance toggler.mouseenter            // 2470
				.appendTo($N) // append DIV to container                                                                          // 2471
			;                                                                                                                  // 2472
			if (o.resizerDblClickToggle)                                                                                       // 2473
				$R.bind("dblclick."+ sID, toggle );                                                                               // 2474
                                                                                                                      // 2475
			if ($T) {                                                                                                          // 2476
				$T	// if paneSelector is an ID, then create a matching ID for the resizer, eg: "#paneLeft" => "#paneLeft-toggler" // 2477
					.attr("id", paneId ? paneId +"-toggler" : "" )                                                                   // 2478
					.data({                                                                                                          // 2479
						parentLayout:	Instance                                                                                          // 2480
					,	layoutPane:		Instance[pane]	// NEW pointer to pane-alias-object                                                // 2481
					,	layoutEdge:		pane                                                                                              // 2482
					,	layoutRole:		"toggler"                                                                                         // 2483
					})                                                                                                               // 2484
					.css(_c.togglers.cssReq) // add base/required styles                                                             // 2485
					.css(o.applyDemoStyles ? _c.togglers.cssDemo : {}) // add demo styles                                            // 2486
					.addClass(tClass +" "+ tClass+_pane)                                                                             // 2487
					.hover(addHover, removeHover) // ALWAYS add hover-classes, even if toggling is not enabled - handle with CSS instead
					.bind("mouseenter", onResizerEnter) // NEED toggler.mouseenter because mouseenter MAY NOT fire on resizer        // 2489
					.appendTo($R) // append SPAN to resizer DIV                                                                      // 2490
				;                                                                                                                 // 2491
				// ADD INNER-SPANS TO TOGGLER                                                                                     // 2492
				if (o.togglerContent_open) // ui-layout-open                                                                      // 2493
					$("<span>"+ o.togglerContent_open +"</span>")                                                                    // 2494
						.data({                                                                                                         // 2495
							layoutEdge:		pane                                                                                              // 2496
						,	layoutRole:		"togglerContent"                                                                                 // 2497
						})                                                                                                              // 2498
						.data("layoutRole", "togglerContent")                                                                           // 2499
						.data("layoutEdge", pane)                                                                                       // 2500
						.addClass("content content-open")                                                                               // 2501
						.css("display","none")                                                                                          // 2502
						.appendTo( $T )                                                                                                 // 2503
						//.hover( addHover, removeHover ) // use ui-layout-toggler-west-hover .content-open instead!                    // 2504
					;                                                                                                                // 2505
				if (o.togglerContent_closed) // ui-layout-closed                                                                  // 2506
					$("<span>"+ o.togglerContent_closed +"</span>")                                                                  // 2507
						.data({                                                                                                         // 2508
							layoutEdge:		pane                                                                                              // 2509
						,	layoutRole:		"togglerContent"                                                                                 // 2510
						})                                                                                                              // 2511
						.addClass("content content-closed")                                                                             // 2512
						.css("display","none")                                                                                          // 2513
						.appendTo( $T )                                                                                                 // 2514
						//.hover( addHover, removeHover ) // use ui-layout-toggler-west-hover .content-closed instead!                  // 2515
					;                                                                                                                // 2516
				// ADD TOGGLER.click/.hover                                                                                       // 2517
				enableClosable(pane);                                                                                             // 2518
			}                                                                                                                  // 2519
                                                                                                                      // 2520
			// add Draggable events                                                                                            // 2521
			initResizable(pane);                                                                                               // 2522
                                                                                                                      // 2523
			// ADD CLASSNAMES & SLIDE-BINDINGS - eg: class="resizer resizer-west resizer-open"                                 // 2524
			if (s.isVisible)                                                                                                   // 2525
				setAsOpen(pane);	// onOpen will be called, but NOT onResize                                                       // 2526
			else {                                                                                                             // 2527
				setAsClosed(pane);	// onClose will be called                                                                      // 2528
				bindStartSlidingEvents(pane, true); // will enable events IF option is set                                        // 2529
			}                                                                                                                  // 2530
                                                                                                                      // 2531
		});                                                                                                                 // 2532
                                                                                                                      // 2533
		// SET ALL HANDLE DIMENSIONS                                                                                        // 2534
		sizeHandles();                                                                                                      // 2535
	}                                                                                                                    // 2536
                                                                                                                      // 2537
                                                                                                                      // 2538
	/**                                                                                                                  // 2539
	* Initialize scrolling ui-layout-content div - if exists                                                             // 2540
	*                                                                                                                    // 2541
	* @see  initPane() - or externally after an Ajax injection                                                           // 2542
	* @param {string}	pane			The pane to process                                                                         // 2543
	* @param {boolean=}	[resize=true]	Size content after init                                                            // 2544
	*/                                                                                                                   // 2545
,	initContent = function (pane, resize) {                                                                             // 2546
		if (!isInitialized()) return;                                                                                       // 2547
		var                                                                                                                 // 2548
			o	= options[pane]                                                                                                  // 2549
		,	sel	= o.contentSelector                                                                                           // 2550
		,	I	= Instance[pane]                                                                                                // 2551
		,	$P	= $Ps[pane]                                                                                                    // 2552
		,	$C                                                                                                                // 2553
		;                                                                                                                   // 2554
		if (sel) $C = I.content = $Cs[pane] = (o.findNestedContent)                                                         // 2555
			? $P.find(sel).eq(0) // match 1-element only                                                                       // 2556
			: $P.children(sel).eq(0)                                                                                           // 2557
		;                                                                                                                   // 2558
		if ($C && $C.length) {                                                                                              // 2559
			$C.data("layoutRole", "content");                                                                                  // 2560
			// SAVE original Content CSS                                                                                       // 2561
			if (!$C.data("layoutCSS"))                                                                                         // 2562
				$C.data("layoutCSS", styles($C, "height"));                                                                       // 2563
			$C.css( _c.content.cssReq );                                                                                       // 2564
			if (o.applyDemoStyles) {                                                                                           // 2565
				$C.css( _c.content.cssDemo ); // add padding & overflow: auto to content-div                                      // 2566
				$P.css( _c.content.cssDemoPane ); // REMOVE padding/scrolling from pane                                           // 2567
			}                                                                                                                  // 2568
			// ensure no vertical scrollbar on pane - will mess up measurements                                                // 2569
			if ($P.css("overflowX").match(/(scroll|auto)/)) {                                                                  // 2570
				$P.css("overflow", "hidden");                                                                                     // 2571
			}                                                                                                                  // 2572
			state[pane].content = {}; // init content state                                                                    // 2573
			if (resize !== false) sizeContent(pane);                                                                           // 2574
			// sizeContent() is called AFTER init of all elements                                                              // 2575
		}                                                                                                                   // 2576
		else                                                                                                                // 2577
			I.content = $Cs[pane] = false;                                                                                     // 2578
	}                                                                                                                    // 2579
                                                                                                                      // 2580
                                                                                                                      // 2581
	/**                                                                                                                  // 2582
	* Add resize-bars to all panes that specify it in options                                                            // 2583
	* -dependancy: $.fn.resizable - will skip if not found                                                               // 2584
	*                                                                                                                    // 2585
	* @see  _create()                                                                                                    // 2586
	* @param {string=}	[panes=""]	The edge(s) to process                                                                 // 2587
	*/                                                                                                                   // 2588
,	initResizable = function (panes) {                                                                                  // 2589
		var	draggingAvailable = $.layout.plugins.draggable                                                                  // 2590
		,	side // set in start()                                                                                            // 2591
		;                                                                                                                   // 2592
		panes = panes ? panes.split(",") : _c.borderPanes;                                                                  // 2593
                                                                                                                      // 2594
		$.each(panes, function (idx, pane) {                                                                                // 2595
			var o = options[pane];                                                                                             // 2596
			if (!draggingAvailable || !$Ps[pane] || !o.resizable) {                                                            // 2597
				o.resizable = false;                                                                                              // 2598
				return true; // skip to next                                                                                      // 2599
			}                                                                                                                  // 2600
                                                                                                                      // 2601
			var s		= state[pane]                                                                                               // 2602
			,	z		= options.zIndexes                                                                                            // 2603
			,	c		= _c[pane]                                                                                                    // 2604
			,	side	= c.dir=="horz" ? "top" : "left"                                                                            // 2605
			,	$P 		= $Ps[pane]                                                                                                 // 2606
			,	$R		= $Rs[pane]                                                                                                  // 2607
			,	base	= o.resizerClass                                                                                            // 2608
			,	lastPos	= 0 // used when live-resizing                                                                           // 2609
			,	r, live // set in start because may change                                                                       // 2610
			//	'drag' classes are applied to the ORIGINAL resizer-bar while dragging is in process                             // 2611
			,	resizerClass		= base+"-drag"				// resizer-drag                                                                  // 2612
			,	resizerPaneClass	= base+"-"+pane+"-drag"		// resizer-north-drag                                                  // 2613
			//	'helper' class is applied to the CLONED resizer-bar while it is being dragged                                   // 2614
			,	helperClass			= base+"-dragging"			// resizer-dragging                                                           // 2615
			,	helperPaneClass		= base+"-"+pane+"-dragging" // resizer-north-dragging                                           // 2616
			,	helperLimitClass	= base+"-dragging-limit"	// resizer-drag                                                        // 2617
			,	helperPaneLimitClass = base+"-"+pane+"-dragging-limit"	// resizer-north-drag                                     // 2618
			,	helperClassesSet	= false 					// logic var                                                                       // 2619
			;                                                                                                                  // 2620
                                                                                                                      // 2621
			if (!s.isClosed)                                                                                                   // 2622
				$R.attr("title", o.tips.Resize)                                                                                   // 2623
				  .css("cursor", o.resizerCursor); // n-resize, s-resize, etc                                                     // 2624
                                                                                                                      // 2625
			$R.draggable({                                                                                                     // 2626
				containment:	$N[0] // limit resizing to layout container                                                          // 2627
			,	axis:			(c.dir=="horz" ? "y" : "x") // limit resizing to horz or vert axis                                       // 2628
			,	delay:			0                                                                                                       // 2629
			,	distance:		1                                                                                                     // 2630
			,	grid:			o.resizingGrid                                                                                           // 2631
			//	basic format for helper - style it using class: .ui-draggable-dragging                                          // 2632
			,	helper:			"clone"                                                                                                // 2633
			,	opacity:		o.resizerDragOpacity                                                                                   // 2634
			,	addClasses:		false // avoid ui-state-disabled class when disabled                                                // 2635
			//,	iframeFix:		o.draggableIframeFix // TODO: consider using when bug is fixed                                     // 2636
			,	zIndex:			z.resizer_drag                                                                                         // 2637
                                                                                                                      // 2638
			,	start: function (e, ui) {                                                                                        // 2639
					// REFRESH options & state pointers in case we used swapPanes                                                    // 2640
					o = options[pane];                                                                                               // 2641
					s = state[pane];                                                                                                 // 2642
					// re-read options                                                                                               // 2643
					live = o.livePaneResizing;                                                                                       // 2644
                                                                                                                      // 2645
					// ondrag_start callback - will CANCEL hide if returns false                                                     // 2646
					// TODO: dragging CANNOT be cancelled like this, so see if there is a way?                                       // 2647
					if (false === _runCallbacks("ondrag_start", pane)) return false;                                                 // 2648
                                                                                                                      // 2649
					s.isResizing		= true; // prevent pane from closing while resizing                                                // 2650
					state.paneResizing	= pane; // easy to see if ANY pane is resizing                                                // 2651
					timer.clear(pane+"_closeSlider"); // just in case already triggered                                              // 2652
                                                                                                                      // 2653
					// SET RESIZER LIMITS - used in drag()                                                                           // 2654
					setSizeLimits(pane); // update pane/resizer state                                                                // 2655
					r = s.resizerPosition;                                                                                           // 2656
					lastPos = ui.position[ side ]                                                                                    // 2657
                                                                                                                      // 2658
					$R.addClass( resizerClass +" "+ resizerPaneClass ); // add drag classes                                          // 2659
					helperClassesSet = false; // reset logic var - see drag()                                                        // 2660
                                                                                                                      // 2661
					// DISABLE TEXT SELECTION (probably already done by resizer.mouseOver)                                           // 2662
					$('body').disableSelection();                                                                                    // 2663
                                                                                                                      // 2664
					// MASK PANES CONTAINING IFRAMES, APPLETS OR OTHER TROUBLESOME ELEMENTS                                          // 2665
					showMasks( pane, { resizing: true });                                                                            // 2666
				}                                                                                                                 // 2667
                                                                                                                      // 2668
			,	drag: function (e, ui) {                                                                                         // 2669
					if (!helperClassesSet) { // can only add classes after clone has been added to the DOM                           // 2670
						//$(".ui-draggable-dragging")                                                                                   // 2671
						ui.helper                                                                                                       // 2672
							.addClass( helperClass +" "+ helperPaneClass ) // add helper classes                                           // 2673
							.css({ right: "auto", bottom: "auto" })	// fix dir="rtl" issue                                                 // 2674
							.children().css("visibility","hidden")	// hide toggler inside dragged resizer-bar                              // 2675
						;                                                                                                               // 2676
						helperClassesSet = true;                                                                                        // 2677
						// draggable bug!? RE-SET zIndex to prevent E/W resize-bar showing through N/S pane!                            // 2678
						if (s.isSliding) $Ps[pane].css("zIndex", z.pane_sliding);                                                       // 2679
					}                                                                                                                // 2680
					// CONTAIN RESIZER-BAR TO RESIZING LIMITS                                                                        // 2681
					var limit = 0;                                                                                                   // 2682
					if (ui.position[side] < r.min) {                                                                                 // 2683
						ui.position[side] = r.min;                                                                                      // 2684
						limit = -1;                                                                                                     // 2685
					}                                                                                                                // 2686
					else if (ui.position[side] > r.max) {                                                                            // 2687
						ui.position[side] = r.max;                                                                                      // 2688
						limit = 1;                                                                                                      // 2689
					}                                                                                                                // 2690
					// ADD/REMOVE dragging-limit CLASS                                                                               // 2691
					if (limit) {                                                                                                     // 2692
						ui.helper.addClass( helperLimitClass +" "+ helperPaneLimitClass ); // at dragging-limit                         // 2693
						window.defaultStatus = (limit>0 && pane.match(/(north|west)/)) || (limit<0 && pane.match(/(south|east)/)) ? o.tips.maxSizeWarning : o.tips.minSizeWarning;
					}                                                                                                                // 2695
					else {                                                                                                           // 2696
						ui.helper.removeClass( helperLimitClass +" "+ helperPaneLimitClass ); // not at dragging-limit                  // 2697
						window.defaultStatus = "";                                                                                      // 2698
					}                                                                                                                // 2699
					// DYNAMICALLY RESIZE PANES IF OPTION ENABLED                                                                    // 2700
					// won't trigger unless resizer has actually moved!                                                              // 2701
					if (live && Math.abs(ui.position[side] - lastPos) >= o.liveResizingTolerance) {                                  // 2702
						lastPos = ui.position[side];                                                                                    // 2703
						resizePanes(e, ui, pane)                                                                                        // 2704
					}                                                                                                                // 2705
				}                                                                                                                 // 2706
                                                                                                                      // 2707
			,	stop: function (e, ui) {                                                                                         // 2708
					$('body').enableSelection(); // RE-ENABLE TEXT SELECTION                                                         // 2709
					window.defaultStatus = ""; // clear 'resizing limit' message from statusbar                                      // 2710
					$R.removeClass( resizerClass +" "+ resizerPaneClass ); // remove drag classes from Resizer                       // 2711
					s.isResizing		= false;                                                                                           // 2712
					state.paneResizing	= false; // easy to see if ANY pane is resizing                                               // 2713
					resizePanes(e, ui, pane, true); // true = resizingDone                                                           // 2714
				}                                                                                                                 // 2715
                                                                                                                      // 2716
			});                                                                                                                // 2717
		});                                                                                                                 // 2718
                                                                                                                      // 2719
		/**                                                                                                                 // 2720
		* resizePanes                                                                                                       // 2721
		*                                                                                                                   // 2722
		* Sub-routine called from stop() - and drag() if livePaneResizing                                                   // 2723
		*                                                                                                                   // 2724
		* @param {!Object}		evt                                                                                             // 2725
		* @param {!Object}		ui                                                                                              // 2726
		* @param {string}		pane                                                                                             // 2727
		* @param {boolean=}		[resizingDone=false]                                                                           // 2728
		*/                                                                                                                  // 2729
		var resizePanes = function (evt, ui, pane, resizingDone) {                                                          // 2730
			var	dragPos	= ui.position                                                                                          // 2731
			,	c		= _c[pane]                                                                                                    // 2732
			,	o		= options[pane]                                                                                               // 2733
			,	s		= state[pane]                                                                                                 // 2734
			,	resizerPos                                                                                                       // 2735
			;                                                                                                                  // 2736
			switch (pane) {                                                                                                    // 2737
				case "north":	resizerPos = dragPos.top; break;                                                                    // 2738
				case "west":	resizerPos = dragPos.left; break;                                                                    // 2739
				case "south":	resizerPos = sC.layoutHeight - dragPos.top  - o.spacing_open; break;                                // 2740
				case "east":	resizerPos = sC.layoutWidth  - dragPos.left - o.spacing_open; break;                                 // 2741
			};                                                                                                                 // 2742
			// remove container margin from resizer position to get the pane size                                              // 2743
			var newSize = resizerPos - sC.inset[c.side];                                                                       // 2744
                                                                                                                      // 2745
			// Disable OR Resize Mask(s) created in drag.start                                                                 // 2746
			if (!resizingDone) {                                                                                               // 2747
				// ensure we meet liveResizingTolerance criteria                                                                  // 2748
				if (Math.abs(newSize - s.size) < o.liveResizingTolerance)                                                         // 2749
					return; // SKIP resize this time                                                                                 // 2750
				// resize the pane                                                                                                // 2751
				manualSizePane(pane, newSize, false, true); // true = noAnimation                                                 // 2752
				sizeMasks(); // resize all visible masks                                                                          // 2753
			}                                                                                                                  // 2754
			else { // resizingDone                                                                                             // 2755
				// ondrag_end callback                                                                                            // 2756
				if (false !== _runCallbacks("ondrag_end", pane))                                                                  // 2757
					manualSizePane(pane, newSize, false, true); // true = noAnimation                                                // 2758
				hideMasks(true); // true = force hiding all masks even if one is 'sliding'                                        // 2759
				if (s.isSliding) // RE-SHOW 'object-masks' so objects won't show through sliding pane                             // 2760
					showMasks( pane, { resizing: true });                                                                            // 2761
			}                                                                                                                  // 2762
		};                                                                                                                  // 2763
	}                                                                                                                    // 2764
                                                                                                                      // 2765
	/**                                                                                                                  // 2766
	*	sizeMask                                                                                                           // 2767
	*                                                                                                                    // 2768
	*	Needed to overlay a DIV over an IFRAME-pane because mask CANNOT be *inside* the pane                               // 2769
	*	Called when mask created, and during livePaneResizing                                                              // 2770
	*/                                                                                                                   // 2771
,	sizeMask = function () {                                                                                            // 2772
		var $M		= $(this)                                                                                                   // 2773
		,	pane	= $M.data("layoutMask") // eg: "west"                                                                        // 2774
		,	s		= state[pane]                                                                                                  // 2775
		;                                                                                                                   // 2776
		// only masks over an IFRAME-pane need manual resizing                                                              // 2777
		if (s.tagName == "IFRAME" && s.isVisible) // no need to mask closed/hidden panes                                    // 2778
			$M.css({                                                                                                           // 2779
				top:	s.offsetTop                                                                                                  // 2780
			,	left:	s.offsetLeft                                                                                               // 2781
			,	width:	s.outerWidth                                                                                              // 2782
			,	height:	s.outerHeight                                                                                            // 2783
			});                                                                                                                // 2784
		/* ALT Method...                                                                                                    // 2785
		var $P = $Ps[pane];                                                                                                 // 2786
		$M.css( $P.position() ).css({ width: $P[0].offsetWidth, height: $P[0].offsetHeight });                              // 2787
		*/                                                                                                                  // 2788
	}                                                                                                                    // 2789
,	sizeMasks = function () {                                                                                           // 2790
		$Ms.each( sizeMask ); // resize all 'visible' masks                                                                 // 2791
	}                                                                                                                    // 2792
                                                                                                                      // 2793
	/**                                                                                                                  // 2794
	* @param {string}	pane		The pane being resized, animated or isSliding                                                // 2795
	* @param {Object=}	[args]		(optional) Options: which masks to apply, and to which panes                              // 2796
	*/                                                                                                                   // 2797
,	showMasks = function (pane, args) {                                                                                 // 2798
		var	c		= _c[pane]                                                                                                   // 2799
		,	panes	=  ["center"]                                                                                               // 2800
		,	z		= options.zIndexes                                                                                             // 2801
		,	a		= $.extend({                                                                                                   // 2802
						objectsOnly:	false                                                                                              // 2803
					,	animation:		false                                                                                              // 2804
					,	resizing:		true                                                                                                // 2805
					,	sliding:		state[pane].isSliding                                                                                // 2806
					},	args )                                                                                                        // 2807
		,	o, s                                                                                                              // 2808
		;                                                                                                                   // 2809
		if (a.resizing)                                                                                                     // 2810
			panes.push( pane );                                                                                                // 2811
		if (a.sliding)                                                                                                      // 2812
			panes.push( _c.oppositeEdge[pane] ); // ADD the oppositeEdge-pane                                                  // 2813
                                                                                                                      // 2814
		if (c.dir === "horz") {                                                                                             // 2815
			panes.push("west");                                                                                                // 2816
			panes.push("east");                                                                                                // 2817
		}                                                                                                                   // 2818
                                                                                                                      // 2819
		$.each(panes, function(i,p){                                                                                        // 2820
			s = state[p];                                                                                                      // 2821
			o = options[p];                                                                                                    // 2822
			if (s.isVisible && ( o.maskObjects || (!a.objectsOnly && o.maskContents) )) {                                      // 2823
				getMasks(p).each(function(){                                                                                      // 2824
					sizeMask.call(this);                                                                                             // 2825
					this.style.zIndex = s.isSliding ? z.pane_sliding+1 : z.pane_normal+1                                             // 2826
					this.style.display = "block";                                                                                    // 2827
				});                                                                                                               // 2828
			}                                                                                                                  // 2829
		});                                                                                                                 // 2830
	}                                                                                                                    // 2831
                                                                                                                      // 2832
	/**                                                                                                                  // 2833
	* @param {boolean=}	force		Hide masks even if a pane is sliding                                                      // 2834
	*/                                                                                                                   // 2835
,	hideMasks = function (force) {                                                                                      // 2836
		// ensure no pane is resizing - could be a timing issue                                                             // 2837
		if (force || !state.paneResizing) {                                                                                 // 2838
			$Ms.hide(); // hide ALL masks                                                                                      // 2839
		}                                                                                                                   // 2840
		// if ANY pane is sliding, then DO NOT remove masks from panes with maskObjects enabled                             // 2841
		else if (!force && !$.isEmptyObject( state.panesSliding )) {                                                        // 2842
			var	i = $Ms.length - 1                                                                                             // 2843
			,	p, $M;                                                                                                           // 2844
			for (; i >= 0; i--) {                                                                                              // 2845
				$M	= $Ms.eq(i);                                                                                                   // 2846
				p	= $M.data("layoutMask");                                                                                        // 2847
				if (!options[p].maskObjects) {                                                                                    // 2848
					$M.hide();                                                                                                       // 2849
				}                                                                                                                 // 2850
			}                                                                                                                  // 2851
		}                                                                                                                   // 2852
	}                                                                                                                    // 2853
                                                                                                                      // 2854
	/**                                                                                                                  // 2855
	* @param {string}	pane                                                                                               // 2856
	*/                                                                                                                   // 2857
,	getMasks = function (pane) {                                                                                        // 2858
		var $Masks	= $([])                                                                                                  // 2859
		,	$M, i = 0, c = $Ms.length                                                                                         // 2860
		;                                                                                                                   // 2861
		for (; i<c; i++) {                                                                                                  // 2862
			$M = $Ms.eq(i);                                                                                                    // 2863
			if ($M.data("layoutMask") === pane)                                                                                // 2864
				$Masks = $Masks.add( $M );                                                                                        // 2865
		}                                                                                                                   // 2866
		if ($Masks.length)                                                                                                  // 2867
			return $Masks;                                                                                                     // 2868
		else                                                                                                                // 2869
			return createMasks(pane);                                                                                          // 2870
	}                                                                                                                    // 2871
                                                                                                                      // 2872
	/**                                                                                                                  // 2873
	* createMasks                                                                                                        // 2874
	*                                                                                                                    // 2875
	* Generates both DIV (ALWAYS used) and IFRAME (optional) elements as masks                                           // 2876
	* An IFRAME mask is created *under* the DIV when maskObjects=true, because a DIV cannot mask an applet               // 2877
	*                                                                                                                    // 2878
	* @param {string}	pane                                                                                               // 2879
	*/                                                                                                                   // 2880
,	createMasks = function (pane) {                                                                                     // 2881
		var                                                                                                                 // 2882
			$P		= $Ps[pane]                                                                                                    // 2883
		,	s		= state[pane]                                                                                                  // 2884
		,	o		= options[pane]                                                                                                // 2885
		,	z		= options.zIndexes                                                                                             // 2886
		//,	objMask	= o.maskObjects && s.tagName != "IFRAME" // check for option                                            // 2887
		,	$Masks	= $([])                                                                                                    // 2888
		,	isIframe, el, $M, css, i                                                                                          // 2889
		;                                                                                                                   // 2890
		if (!o.maskContents && !o.maskObjects) return $Masks;                                                               // 2891
		// if o.maskObjects=true, then loop TWICE to create BOTH kinds of mask, else only create a DIV                      // 2892
		for (i=0; i < (o.maskObjects ? 2 : 1); i++) {                                                                       // 2893
			isIframe = o.maskObjects && i==0;                                                                                  // 2894
			el = document.createElement( isIframe ? "iframe" : "div" );                                                        // 2895
			$M = $(el).data("layoutMask", pane); // add data to relate mask to pane                                            // 2896
			el.className = "ui-layout-mask ui-layout-mask-"+ pane; // for user styling                                         // 2897
			css = el.style;                                                                                                    // 2898
			// styles common to both DIVs and IFRAMES                                                                          // 2899
			css.display		= "block";                                                                                            // 2900
			css.position	= "absolute";                                                                                         // 2901
			css.background	= "#FFF";                                                                                           // 2902
			if (isIframe) { // IFRAME-only props                                                                               // 2903
				el.frameborder = 0;                                                                                               // 2904
				el.src		= "about:blank";                                                                                          // 2905
				//el.allowTransparency = true; - for IE, but breaks masking ability!                                              // 2906
				css.opacity	= 0;                                                                                                  // 2907
				css.filter	= "Alpha(Opacity='0')";                                                                                // 2908
				css.border	= 0;                                                                                                   // 2909
			}                                                                                                                  // 2910
			// if pane is an IFRAME, then must mask the pane itself                                                            // 2911
			if (s.tagName == "IFRAME") {                                                                                       // 2912
				// NOTE sizing done by a subroutine so can be called during live-resizing                                         // 2913
				css.zIndex	= z.pane_normal+1; // 1-higher than pane                                                               // 2914
				$N.append( el ); // append to LAYOUT CONTAINER                                                                    // 2915
			}                                                                                                                  // 2916
			// otherwise put masks *inside the pane* to mask its contents                                                      // 2917
			else {                                                                                                             // 2918
				$M.addClass("ui-layout-mask-inside-pane");                                                                        // 2919
				css.zIndex	= o.maskZindex || z.content_mask; // usually 1, but customizable                                       // 2920
				css.top		= 0;                                                                                                     // 2921
				css.left	= 0;                                                                                                     // 2922
				css.width	= "100%";                                                                                               // 2923
				css.height	= "100%";                                                                                              // 2924
				$P.append( el ); // append INSIDE pane element                                                                    // 2925
			}                                                                                                                  // 2926
			// add to return object                                                                                            // 2927
			$Masks = $Masks.add( el );                                                                                         // 2928
			// add Mask to cached array so can be resized & reused                                                             // 2929
			$Ms = $Ms.add( el );                                                                                               // 2930
		}                                                                                                                   // 2931
		return $Masks;                                                                                                      // 2932
	}                                                                                                                    // 2933
                                                                                                                      // 2934
                                                                                                                      // 2935
	/**                                                                                                                  // 2936
	* Destroy this layout and reset all elements                                                                         // 2937
	*                                                                                                                    // 2938
	* @param {boolean=}	[destroyChildren=false]		Destory Child-Layouts first?                                            // 2939
	*/                                                                                                                   // 2940
,	destroy = function (evt_or_destroyChildren, destroyChildren) {                                                      // 2941
		// UNBIND layout events and remove global object                                                                    // 2942
		$(window).unbind("."+ sID);		// resize & unload                                                                     // 2943
		$(document).unbind("."+ sID);	// keyDown (hotkeys)                                                                  // 2944
                                                                                                                      // 2945
		if (typeof evt_or_destroyChildren === "object")                                                                     // 2946
			// stopPropagation if called by trigger("layoutdestroy") - use evtPane utility                                     // 2947
			evtPane(evt_or_destroyChildren);                                                                                   // 2948
		else // no event, so transfer 1st param to destroyChildren param                                                    // 2949
			destroyChildren = evt_or_destroyChildren;                                                                          // 2950
                                                                                                                      // 2951
		// need to look for parent layout BEFORE we remove the container data, else skips a level                           // 2952
		//var parentPane = Instance.hasParentLayout ? $.layout.getParentPaneInstance( $N ) : null;                          // 2953
                                                                                                                      // 2954
		// reset layout-container                                                                                           // 2955
		$N	.clearQueue()                                                                                                    // 2956
			.removeData("layout")                                                                                              // 2957
			.removeData("layoutContainer")                                                                                     // 2958
			.removeClass(options.containerClass)                                                                               // 2959
			.unbind("."+ sID) // remove ALL Layout events                                                                      // 2960
		;                                                                                                                   // 2961
                                                                                                                      // 2962
		// remove all mask elements that have been created                                                                  // 2963
		$Ms.remove();                                                                                                       // 2964
                                                                                                                      // 2965
		// loop all panes to remove layout classes, attributes and bindings                                                 // 2966
		$.each(_c.allPanes, function (i, pane) {                                                                            // 2967
			removePane( pane, false, true, destroyChildren ); // true = skipResize                                             // 2968
		});                                                                                                                 // 2969
                                                                                                                      // 2970
		// do NOT reset container CSS if is a 'pane' (or 'content') in an outer-layout - ie, THIS layout is 'nested'        // 2971
		var css = "layoutCSS";                                                                                              // 2972
		if ($N.data(css) && !$N.data("layoutRole")) // RESET CSS                                                            // 2973
			$N.css( $N.data(css) ).removeData(css);                                                                            // 2974
                                                                                                                      // 2975
		// for full-page layouts, also reset the <HTML> CSS                                                                 // 2976
		if (sC.tagName === "BODY" && ($N = $("html")).data(css)) // RESET <HTML> CSS                                        // 2977
			$N.css( $N.data(css) ).removeData(css);                                                                            // 2978
                                                                                                                      // 2979
		// trigger plugins for this layout, if there are any                                                                // 2980
		runPluginCallbacks( Instance, $.layout.onDestroy );                                                                 // 2981
                                                                                                                      // 2982
		// trigger state-management and onunload callback                                                                   // 2983
		unload();                                                                                                           // 2984
                                                                                                                      // 2985
		// clear the Instance of everything except for container & options (so could recreate)                              // 2986
		// RE-CREATE: myLayout = myLayout.container.layout( myLayout.options );                                             // 2987
		for (var n in Instance)                                                                                             // 2988
			if (!n.match(/^(container|options)$/)) delete Instance[ n ];                                                       // 2989
		// add a 'destroyed' flag to make it easy to check                                                                  // 2990
		Instance.destroyed = true;                                                                                          // 2991
                                                                                                                      // 2992
		// if this is a child layout, CLEAR the child-pointer in the parent                                                 // 2993
		/* for now the pointer REMAINS, but with only container, options and destroyed keys                                 // 2994
		if (parentPane) {                                                                                                   // 2995
			var layout	= parentPane.pane.data("parentLayout")                                                                  // 2996
			,	key		= layout.options.instanceKey || 'error';                                                                    // 2997
			// THIS SYNTAX MAY BE WRONG!                                                                                       // 2998
			parentPane.children[key] = layout.children[ parentPane.name ].children[key] = null;                                // 2999
		}                                                                                                                   // 3000
		*/                                                                                                                  // 3001
                                                                                                                      // 3002
		return Instance; // for coding convenience                                                                          // 3003
	}                                                                                                                    // 3004
                                                                                                                      // 3005
	/**                                                                                                                  // 3006
	* Remove a pane from the layout - subroutine of destroy()                                                            // 3007
	*                                                                                                                    // 3008
	* @see  destroy()                                                                                                    // 3009
	* @param {(string|Object)}	evt_or_pane			The pane to process                                                         // 3010
	* @param {boolean=}			[remove=false]		Remove the DOM element?                                                        // 3011
	* @param {boolean=}			[skipResize=false]	Skip calling resizeAll()?                                                   // 3012
	* @param {boolean=}			[destroyChild=true]	Destroy Child-layouts? If not passed, obeys options setting                // 3013
	*/                                                                                                                   // 3014
,	removePane = function (evt_or_pane, remove, skipResize, destroyChild) {                                             // 3015
		if (!isInitialized()) return;                                                                                       // 3016
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 3017
		,	$P	= $Ps[pane]                                                                                                    // 3018
		,	$C	= $Cs[pane]                                                                                                    // 3019
		,	$R	= $Rs[pane]                                                                                                    // 3020
		,	$T	= $Ts[pane]                                                                                                    // 3021
		;                                                                                                                   // 3022
		// NOTE: elements can still exist even after remove()                                                               // 3023
		//		so check for missing data(), which is cleared by removed()                                                      // 3024
		if ($P && $.isEmptyObject( $P.data() )) $P = false;                                                                 // 3025
		if ($C && $.isEmptyObject( $C.data() )) $C = false;                                                                 // 3026
		if ($R && $.isEmptyObject( $R.data() )) $R = false;                                                                 // 3027
		if ($T && $.isEmptyObject( $T.data() )) $T = false;                                                                 // 3028
                                                                                                                      // 3029
		if ($P) $P.stop(true, true);                                                                                        // 3030
                                                                                                                      // 3031
		var	o	= options[pane]                                                                                               // 3032
		,	s	= state[pane]                                                                                                   // 3033
		,	d	= "layout"                                                                                                      // 3034
		,	css	= "layoutCSS"                                                                                                 // 3035
		,	pC	= children[pane]                                                                                               // 3036
		,	hasChildren	= $.isPlainObject( pC ) && !$.isEmptyObject( pC )                                                     // 3037
		,	destroy		= destroyChild !== undefined ? destroyChild : o.destroyChildren                                          // 3038
		;                                                                                                                   // 3039
		// FIRST destroy the child-layout(s)                                                                                // 3040
		if (hasChildren && destroy) {                                                                                       // 3041
			$.each( pC, function (key, child) {                                                                                // 3042
				if (!child.destroyed)                                                                                             // 3043
					child.destroy(true);// tell child-layout to destroy ALL its child-layouts too                                    // 3044
				if (child.destroyed)	// destroy was successful                                                                    // 3045
					delete pC[key];                                                                                                  // 3046
			});                                                                                                                // 3047
			// if no more children, remove the children hash                                                                   // 3048
			if ($.isEmptyObject( pC )) {                                                                                       // 3049
				pC = children[pane] = null; // clear children hash                                                                // 3050
				hasChildren = false;                                                                                              // 3051
			}                                                                                                                  // 3052
		}                                                                                                                   // 3053
                                                                                                                      // 3054
		// Note: can't 'remove' a pane element with non-destroyed children                                                  // 3055
		if ($P && remove && !hasChildren)                                                                                   // 3056
			$P.remove(); // remove the pane-element and everything inside it                                                   // 3057
		else if ($P && $P[0]) {                                                                                             // 3058
			//	create list of ALL pane-classes that need to be removed                                                         // 3059
			var	root	= o.paneClass // default="ui-layout-pane"                                                                 // 3060
			,	pRoot	= root +"-"+ pane // eg: "ui-layout-pane-west"                                                             // 3061
			,	_open	= "-open"                                                                                                  // 3062
			,	_sliding= "-sliding"                                                                                             // 3063
			,	_closed	= "-closed"                                                                                              // 3064
			,	classes	= [	root, root+_open, root+_closed, root+_sliding,		// generic classes                                   // 3065
							pRoot, pRoot+_open, pRoot+_closed, pRoot+_sliding ]	// pane-specific classes                                   // 3066
			;                                                                                                                  // 3067
			$.merge(classes, getHoverClasses($P, true)); // ADD hover-classes                                                  // 3068
			// remove all Layout classes from pane-element                                                                     // 3069
			$P	.removeClass( classes.join(" ") ) // remove ALL pane-classes                                                    // 3070
				.removeData("parentLayout")                                                                                       // 3071
				.removeData("layoutPane")                                                                                         // 3072
				.removeData("layoutRole")                                                                                         // 3073
				.removeData("layoutEdge")                                                                                         // 3074
				.removeData("autoHidden")	// in case set                                                                          // 3075
				.unbind("."+ sID) // remove ALL Layout events                                                                     // 3076
				// TODO: remove these extra unbind commands when jQuery is fixed                                                  // 3077
				//.unbind("mouseenter"+ sID)                                                                                      // 3078
				//.unbind("mouseleave"+ sID)                                                                                      // 3079
			;                                                                                                                  // 3080
			// do NOT reset CSS if this pane/content is STILL the container of a nested layout!                                // 3081
			// the nested layout will reset its 'container' CSS when/if it is destroyed                                        // 3082
			if (hasChildren && $C) {                                                                                           // 3083
				// a content-div may not have a specific width, so give it one to contain the Layout                              // 3084
				$C.width( $C.width() );                                                                                           // 3085
				$.each( pC, function (key, child) {                                                                               // 3086
					child.resizeAll(); // resize the Layout                                                                          // 3087
				});                                                                                                               // 3088
			}                                                                                                                  // 3089
			else if ($C)                                                                                                       // 3090
				$C.css( $C.data(css) ).removeData(css).removeData("layoutRole");                                                  // 3091
			// remove pane AFTER content in case there was a nested layout                                                     // 3092
			if (!$P.data(d))                                                                                                   // 3093
				$P.css( $P.data(css) ).removeData(css);                                                                           // 3094
		}                                                                                                                   // 3095
                                                                                                                      // 3096
		// REMOVE pane resizer and toggler elements                                                                         // 3097
		if ($T) $T.remove();                                                                                                // 3098
		if ($R) $R.remove();                                                                                                // 3099
                                                                                                                      // 3100
		// CLEAR all pointers and state data                                                                                // 3101
		Instance[pane] = $Ps[pane] = $Cs[pane] = $Rs[pane] = $Ts[pane] = false;                                             // 3102
		s = { removed: true };                                                                                              // 3103
                                                                                                                      // 3104
		if (!skipResize)                                                                                                    // 3105
			resizeAll();                                                                                                       // 3106
	}                                                                                                                    // 3107
                                                                                                                      // 3108
                                                                                                                      // 3109
/*                                                                                                                    // 3110
 * ###########################                                                                                        // 3111
 *	   ACTION METHODS                                                                                                  // 3112
 * ###########################                                                                                        // 3113
 */                                                                                                                   // 3114
                                                                                                                      // 3115
	/**                                                                                                                  // 3116
	* @param {string}	pane                                                                                               // 3117
	*/                                                                                                                   // 3118
,	_hidePane = function (pane) {                                                                                       // 3119
		var $P	= $Ps[pane]                                                                                                  // 3120
		,	o	= options[pane]                                                                                                 // 3121
		,	s	= $P[0].style                                                                                                   // 3122
		;                                                                                                                   // 3123
		if (o.useOffscreenClose) {                                                                                          // 3124
			if (!$P.data(_c.offscreenReset))                                                                                   // 3125
				$P.data(_c.offscreenReset, { left: s.left, right: s.right });                                                     // 3126
			$P.css( _c.offscreenCSS );                                                                                         // 3127
		}                                                                                                                   // 3128
		else                                                                                                                // 3129
			$P.hide().removeData(_c.offscreenReset);                                                                           // 3130
	}                                                                                                                    // 3131
                                                                                                                      // 3132
	/**                                                                                                                  // 3133
	* @param {string}	pane                                                                                               // 3134
	*/                                                                                                                   // 3135
,	_showPane = function (pane) {                                                                                       // 3136
		var $P	= $Ps[pane]                                                                                                  // 3137
		,	o	= options[pane]                                                                                                 // 3138
		,	off	= _c.offscreenCSS                                                                                             // 3139
		,	old	= $P.data(_c.offscreenReset)                                                                                  // 3140
		,	s	= $P[0].style                                                                                                   // 3141
		;                                                                                                                   // 3142
		$P	.show() // ALWAYS show, just in case                                                                             // 3143
			.removeData(_c.offscreenReset);                                                                                    // 3144
		if (o.useOffscreenClose && old) {                                                                                   // 3145
			if (s.left == off.left)                                                                                            // 3146
				s.left = old.left;                                                                                                // 3147
			if (s.right == off.right)                                                                                          // 3148
				s.right = old.right;                                                                                              // 3149
		}                                                                                                                   // 3150
	}                                                                                                                    // 3151
                                                                                                                      // 3152
                                                                                                                      // 3153
	/**                                                                                                                  // 3154
	* Completely 'hides' a pane, including its spacing - as if it does not exist                                         // 3155
	* The pane is not actually 'removed' from the source, so can use 'show' to un-hide it                                // 3156
	*                                                                                                                    // 3157
	* @param {(string|Object)}	evt_or_pane			The pane being hidden, ie: north, south, east, or west                      // 3158
	* @param {boolean=}			[noAnimation=false]	                                                                           // 3159
	*/                                                                                                                   // 3160
,	hide = function (evt_or_pane, noAnimation) {                                                                        // 3161
		if (!isInitialized()) return;                                                                                       // 3162
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 3163
		,	o	= options[pane]                                                                                                 // 3164
		,	s	= state[pane]                                                                                                   // 3165
		,	$P	= $Ps[pane]                                                                                                    // 3166
		,	$R	= $Rs[pane]                                                                                                    // 3167
		;                                                                                                                   // 3168
		if (!$P || s.isHidden) return; // pane does not exist OR is already hidden                                          // 3169
                                                                                                                      // 3170
		// onhide_start callback - will CANCEL hide if returns false                                                        // 3171
		if (state.initialized && false === _runCallbacks("onhide_start", pane)) return;                                     // 3172
                                                                                                                      // 3173
		s.isSliding = false; // just in case                                                                                // 3174
		delete state.panesSliding[pane];                                                                                    // 3175
                                                                                                                      // 3176
		// now hide the elements                                                                                            // 3177
		if ($R) $R.hide(); // hide resizer-bar                                                                              // 3178
		if (!state.initialized || s.isClosed) {                                                                             // 3179
			s.isClosed = true; // to trigger open-animation on show()                                                          // 3180
			s.isHidden  = true;                                                                                                // 3181
			s.isVisible = false;                                                                                               // 3182
			if (!state.initialized)                                                                                            // 3183
				_hidePane(pane); // no animation when loading page                                                                // 3184
			sizeMidPanes(_c[pane].dir === "horz" ? "" : "center");                                                             // 3185
			if (state.initialized || o.triggerEventsOnLoad)                                                                    // 3186
				_runCallbacks("onhide_end", pane);                                                                                // 3187
		}                                                                                                                   // 3188
		else {                                                                                                              // 3189
			s.isHiding = true; // used by onclose                                                                              // 3190
			close(pane, false, noAnimation); // adjust all panes to fit                                                        // 3191
		}                                                                                                                   // 3192
	}                                                                                                                    // 3193
                                                                                                                      // 3194
	/**                                                                                                                  // 3195
	* Show a hidden pane - show as 'closed' by default unless openPane = true                                            // 3196
	*                                                                                                                    // 3197
	* @param {(string|Object)}	evt_or_pane			The pane being opened, ie: north, south, east, or west                      // 3198
	* @param {boolean=}			[openPane=false]                                                                               // 3199
	* @param {boolean=}			[noAnimation=false]                                                                            // 3200
	* @param {boolean=}			[noAlert=false]                                                                                // 3201
	*/                                                                                                                   // 3202
,	show = function (evt_or_pane, openPane, noAnimation, noAlert) {                                                     // 3203
		if (!isInitialized()) return;                                                                                       // 3204
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 3205
		,	o	= options[pane]                                                                                                 // 3206
		,	s	= state[pane]                                                                                                   // 3207
		,	$P	= $Ps[pane]                                                                                                    // 3208
		,	$R	= $Rs[pane]                                                                                                    // 3209
		;                                                                                                                   // 3210
		if (!$P || !s.isHidden) return; // pane does not exist OR is not hidden                                             // 3211
                                                                                                                      // 3212
		// onshow_start callback - will CANCEL show if returns false                                                        // 3213
		if (false === _runCallbacks("onshow_start", pane)) return;                                                          // 3214
                                                                                                                      // 3215
		s.isShowing = true; // used by onopen/onclose                                                                       // 3216
		//s.isHidden  = false; - will be set by open/close - if not cancelled                                               // 3217
		s.isSliding = false; // just in case                                                                                // 3218
		delete state.panesSliding[pane];                                                                                    // 3219
                                                                                                                      // 3220
		// now show the elements                                                                                            // 3221
		//if ($R) $R.show(); - will be shown by open/close                                                                  // 3222
		if (openPane === false)                                                                                             // 3223
			close(pane, true); // true = force                                                                                 // 3224
		else                                                                                                                // 3225
			open(pane, false, noAnimation, noAlert); // adjust all panes to fit                                                // 3226
	}                                                                                                                    // 3227
                                                                                                                      // 3228
                                                                                                                      // 3229
	/**                                                                                                                  // 3230
	* Toggles a pane open/closed by calling either open or close                                                         // 3231
	*                                                                                                                    // 3232
	* @param {(string|Object)}	evt_or_pane		The pane being toggled, ie: north, south, east, or west                      // 3233
	* @param {boolean=}			[slide=false]                                                                                  // 3234
	*/                                                                                                                   // 3235
,	toggle = function (evt_or_pane, slide) {                                                                            // 3236
		if (!isInitialized()) return;                                                                                       // 3237
		var	evt		= evtObj(evt_or_pane)                                                                                      // 3238
		,	pane	= evtPane.call(this, evt_or_pane)                                                                            // 3239
		,	s		= state[pane]                                                                                                  // 3240
		;                                                                                                                   // 3241
		if (evt) // called from to $R.dblclick OR triggerPaneEvent                                                          // 3242
			evt.stopImmediatePropagation();                                                                                    // 3243
		if (s.isHidden)                                                                                                     // 3244
			show(pane); // will call 'open' after unhiding it                                                                  // 3245
		else if (s.isClosed)                                                                                                // 3246
			open(pane, !!slide);                                                                                               // 3247
		else                                                                                                                // 3248
			close(pane);                                                                                                       // 3249
	}                                                                                                                    // 3250
                                                                                                                      // 3251
                                                                                                                      // 3252
	/**                                                                                                                  // 3253
	* Utility method used during init or other auto-processes                                                            // 3254
	*                                                                                                                    // 3255
	* @param {string}	pane   The pane being closed                                                                       // 3256
	* @param {boolean=}	[setHandles=false]                                                                               // 3257
	*/                                                                                                                   // 3258
,	_closePane = function (pane, setHandles) {                                                                          // 3259
		var                                                                                                                 // 3260
			$P	= $Ps[pane]                                                                                                     // 3261
		,	s	= state[pane]                                                                                                   // 3262
		;                                                                                                                   // 3263
		_hidePane(pane);                                                                                                    // 3264
		s.isClosed = true;                                                                                                  // 3265
		s.isVisible = false;                                                                                                // 3266
		if (setHandles) setAsClosed(pane);                                                                                  // 3267
	}                                                                                                                    // 3268
                                                                                                                      // 3269
	/**                                                                                                                  // 3270
	* Close the specified pane (animation optional), and resize all other panes as needed                                // 3271
	*                                                                                                                    // 3272
	* @param {(string|Object)}	evt_or_pane			The pane being closed, ie: north, south, east, or west                      // 3273
	* @param {boolean=}			[force=false]                                                                                  // 3274
	* @param {boolean=}			[noAnimation=false]                                                                            // 3275
	* @param {boolean=}			[skipCallback=false]                                                                           // 3276
	*/                                                                                                                   // 3277
,	close = function (evt_or_pane, force, noAnimation, skipCallback) {                                                  // 3278
		var	pane = evtPane.call(this, evt_or_pane);                                                                         // 3279
		// if pane has been initialized, but NOT the complete layout, close pane instantly                                  // 3280
		if (!state.initialized && $Ps[pane]) {                                                                              // 3281
			_closePane(pane, true); // INIT pane as closed                                                                     // 3282
			return;                                                                                                            // 3283
		}                                                                                                                   // 3284
		if (!isInitialized()) return;                                                                                       // 3285
                                                                                                                      // 3286
		var                                                                                                                 // 3287
			$P	= $Ps[pane]                                                                                                     // 3288
		,	$R	= $Rs[pane]                                                                                                    // 3289
		,	$T	= $Ts[pane]                                                                                                    // 3290
		,	o	= options[pane]                                                                                                 // 3291
		,	s	= state[pane]                                                                                                   // 3292
		,	c	= _c[pane]                                                                                                      // 3293
		,	doFX, isShowing, isHiding, wasSliding;                                                                            // 3294
                                                                                                                      // 3295
		// QUEUE in case another action/animation is in progress                                                            // 3296
		$N.queue(function( queueNext ){                                                                                     // 3297
                                                                                                                      // 3298
			if ( !$P                                                                                                           // 3299
			||	(!o.closable && !s.isShowing && !s.isHiding)	// invalid request // (!o.resizable && !o.closable) ???            // 3300
			||	(!force && s.isClosed && !s.isShowing)			// already closed                                                      // 3301
			) return queueNext();                                                                                              // 3302
                                                                                                                      // 3303
			// onclose_start callback - will CANCEL hide if returns false                                                      // 3304
			// SKIP if just 'showing' a hidden pane as 'closed'                                                                // 3305
			var abort = !s.isShowing && false === _runCallbacks("onclose_start", pane);                                        // 3306
                                                                                                                      // 3307
			// transfer logic vars to temp vars                                                                                // 3308
			isShowing	= s.isShowing;                                                                                           // 3309
			isHiding	= s.isHiding;                                                                                             // 3310
			wasSliding	= s.isSliding;                                                                                          // 3311
			// now clear the logic vars (REQUIRED before aborting)                                                             // 3312
			delete s.isShowing;                                                                                                // 3313
			delete s.isHiding;                                                                                                 // 3314
                                                                                                                      // 3315
			if (abort) return queueNext();                                                                                     // 3316
                                                                                                                      // 3317
			doFX		= !noAnimation && !s.isClosed && (o.fxName_close != "none");                                                 // 3318
			s.isMoving	= true;                                                                                                 // 3319
			s.isClosed	= true;                                                                                                 // 3320
			s.isVisible	= false;                                                                                               // 3321
			// update isHidden BEFORE sizing panes                                                                             // 3322
			if (isHiding) s.isHidden = true;                                                                                   // 3323
			else if (isShowing) s.isHidden = false;                                                                            // 3324
                                                                                                                      // 3325
			if (s.isSliding) // pane is being closed, so UNBIND trigger events                                                 // 3326
				bindStopSlidingEvents(pane, false); // will set isSliding=false                                                   // 3327
			else // resize panes adjacent to this one                                                                          // 3328
				sizeMidPanes(_c[pane].dir === "horz" ? "" : "center", false); // false = NOT skipCallback                         // 3329
                                                                                                                      // 3330
			// if this pane has a resizer bar, move it NOW - before animation                                                  // 3331
			setAsClosed(pane);                                                                                                 // 3332
                                                                                                                      // 3333
			// CLOSE THE PANE                                                                                                  // 3334
			if (doFX) { // animate the close                                                                                   // 3335
				lockPaneForFX(pane, true);	// need to set left/top so animation will work                                         // 3336
				$P.hide( o.fxName_close, o.fxSettings_close, o.fxSpeed_close, function () {                                       // 3337
					lockPaneForFX(pane, false); // undo                                                                              // 3338
					if (s.isClosed) close_2();                                                                                       // 3339
					queueNext();                                                                                                     // 3340
				});                                                                                                               // 3341
			}                                                                                                                  // 3342
			else { // hide the pane without animation                                                                          // 3343
				_hidePane(pane);                                                                                                  // 3344
				close_2();                                                                                                        // 3345
				queueNext();                                                                                                      // 3346
			};                                                                                                                 // 3347
		});                                                                                                                 // 3348
                                                                                                                      // 3349
		// SUBROUTINE                                                                                                       // 3350
		function close_2 () {                                                                                               // 3351
			s.isMoving	= false;                                                                                                // 3352
			bindStartSlidingEvents(pane, true); // will enable if o.slidable = true                                            // 3353
                                                                                                                      // 3354
			// if opposite-pane was autoClosed, see if it can be autoOpened now                                                // 3355
			var altPane = _c.oppositeEdge[pane];                                                                               // 3356
			if (state[ altPane ].noRoom) {                                                                                     // 3357
				setSizeLimits( altPane );                                                                                         // 3358
				makePaneFit( altPane );                                                                                           // 3359
			}                                                                                                                  // 3360
                                                                                                                      // 3361
			if (!skipCallback && (state.initialized || o.triggerEventsOnLoad)) {                                               // 3362
				// onclose callback - UNLESS just 'showing' a hidden pane as 'closed'                                             // 3363
				if (!isShowing)	_runCallbacks("onclose_end", pane);                                                               // 3364
				// onhide OR onshow callback                                                                                      // 3365
				if (isShowing)	_runCallbacks("onshow_end", pane);                                                                 // 3366
				if (isHiding)	_runCallbacks("onhide_end", pane);                                                                  // 3367
			}                                                                                                                  // 3368
		}                                                                                                                   // 3369
	}                                                                                                                    // 3370
                                                                                                                      // 3371
	/**                                                                                                                  // 3372
	* @param {string}	pane	The pane just closed, ie: north, south, east, or west                                         // 3373
	*/                                                                                                                   // 3374
,	setAsClosed = function (pane) {                                                                                     // 3375
		if (!$Rs[pane]) return; // handles not initialized yet!                                                             // 3376
		var                                                                                                                 // 3377
			$P		= $Ps[pane]                                                                                                    // 3378
		,	$R		= $Rs[pane]                                                                                                   // 3379
		,	$T		= $Ts[pane]                                                                                                   // 3380
		,	o		= options[pane]                                                                                                // 3381
		,	s		= state[pane]                                                                                                  // 3382
		,	side	= _c[pane].side                                                                                              // 3383
		,	rClass	= o.resizerClass                                                                                           // 3384
		,	tClass	= o.togglerClass                                                                                           // 3385
		,	_pane	= "-"+ pane // used for classNames                                                                          // 3386
		,	_open	= "-open"                                                                                                   // 3387
		,	_sliding= "-sliding"                                                                                              // 3388
		,	_closed	= "-closed"                                                                                               // 3389
		;                                                                                                                   // 3390
		$R                                                                                                                  // 3391
			.css(side, sC.inset[side]) // move the resizer                                                                     // 3392
			.removeClass( rClass+_open +" "+ rClass+_pane+_open )                                                              // 3393
			.removeClass( rClass+_sliding +" "+ rClass+_pane+_sliding )                                                        // 3394
			.addClass( rClass+_closed +" "+ rClass+_pane+_closed )                                                             // 3395
		;                                                                                                                   // 3396
		// DISABLE 'resizing' when closed - do this BEFORE bindStartSlidingEvents?                                          // 3397
		if (o.resizable && $.layout.plugins.draggable)                                                                      // 3398
			$R                                                                                                                 // 3399
				.draggable("disable")                                                                                             // 3400
				.removeClass("ui-state-disabled") // do NOT apply disabled styling - not suitable here                            // 3401
				.css("cursor", "default")                                                                                         // 3402
				.attr("title","")                                                                                                 // 3403
			;                                                                                                                  // 3404
                                                                                                                      // 3405
		// if pane has a toggler button, adjust that too                                                                    // 3406
		if ($T) {                                                                                                           // 3407
			$T                                                                                                                 // 3408
				.removeClass( tClass+_open +" "+ tClass+_pane+_open )                                                             // 3409
				.addClass( tClass+_closed +" "+ tClass+_pane+_closed )                                                            // 3410
				.attr("title", o.tips.Open) // may be blank                                                                       // 3411
			;                                                                                                                  // 3412
			// toggler-content - if exists                                                                                     // 3413
			$T.children(".content-open").hide();                                                                               // 3414
			$T.children(".content-closed").css("display","block");                                                             // 3415
		}                                                                                                                   // 3416
                                                                                                                      // 3417
		// sync any 'pin buttons'                                                                                           // 3418
		syncPinBtns(pane, false);                                                                                           // 3419
                                                                                                                      // 3420
		if (state.initialized) {                                                                                            // 3421
			// resize 'length' and position togglers for adjacent panes                                                        // 3422
			sizeHandles();                                                                                                     // 3423
		}                                                                                                                   // 3424
	}                                                                                                                    // 3425
                                                                                                                      // 3426
	/**                                                                                                                  // 3427
	* Open the specified pane (animation optional), and resize all other panes as needed                                 // 3428
	*                                                                                                                    // 3429
	* @param {(string|Object)}	evt_or_pane			The pane being opened, ie: north, south, east, or west                      // 3430
	* @param {boolean=}			[slide=false]                                                                                  // 3431
	* @param {boolean=}			[noAnimation=false]                                                                            // 3432
	* @param {boolean=}			[noAlert=false]                                                                                // 3433
	*/                                                                                                                   // 3434
,	open = function (evt_or_pane, slide, noAnimation, noAlert) {                                                        // 3435
		if (!isInitialized()) return;                                                                                       // 3436
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 3437
		,	$P	= $Ps[pane]                                                                                                    // 3438
		,	$R	= $Rs[pane]                                                                                                    // 3439
		,	$T	= $Ts[pane]                                                                                                    // 3440
		,	o	= options[pane]                                                                                                 // 3441
		,	s	= state[pane]                                                                                                   // 3442
		,	c	= _c[pane]                                                                                                      // 3443
		,	doFX, isShowing                                                                                                   // 3444
		;                                                                                                                   // 3445
		// QUEUE in case another action/animation is in progress                                                            // 3446
		$N.queue(function( queueNext ){                                                                                     // 3447
                                                                                                                      // 3448
			if ( !$P                                                                                                           // 3449
			||	(!o.resizable && !o.closable && !s.isShowing)	// invalid request                                                // 3450
			||	(s.isVisible && !s.isSliding)					// already open                                                               // 3451
			) return queueNext();                                                                                              // 3452
                                                                                                                      // 3453
			// pane can ALSO be unhidden by just calling show(), so handle this scenario                                       // 3454
			if (s.isHidden && !s.isShowing) {                                                                                  // 3455
				queueNext(); // call before show() because it needs the queue free                                                // 3456
				show(pane, true);                                                                                                 // 3457
				return;                                                                                                           // 3458
			}                                                                                                                  // 3459
                                                                                                                      // 3460
			if (s.autoResize && s.size != o.size) // resize pane to original size set in options                               // 3461
				sizePane(pane, o.size, true, true, true); // true=skipCallback/noAnimation/forceResize                            // 3462
			else                                                                                                               // 3463
				// make sure there is enough space available to open the pane                                                     // 3464
				setSizeLimits(pane, slide);                                                                                       // 3465
                                                                                                                      // 3466
			// onopen_start callback - will CANCEL open if returns false                                                       // 3467
			var cbReturn = _runCallbacks("onopen_start", pane);                                                                // 3468
                                                                                                                      // 3469
			if (cbReturn === "abort")                                                                                          // 3470
				return queueNext();                                                                                               // 3471
                                                                                                                      // 3472
			// update pane-state again in case options were changed in onopen_start                                            // 3473
			if (cbReturn !== "NC") // NC = "No Callback"                                                                       // 3474
				setSizeLimits(pane, slide);                                                                                       // 3475
                                                                                                                      // 3476
			if (s.minSize > s.maxSize) { // INSUFFICIENT ROOM FOR PANE TO OPEN!                                                // 3477
				syncPinBtns(pane, false); // make sure pin-buttons are reset                                                      // 3478
				if (!noAlert && o.tips.noRoomToOpen)                                                                              // 3479
					alert(o.tips.noRoomToOpen);                                                                                      // 3480
				return queueNext(); // ABORT                                                                                      // 3481
			}                                                                                                                  // 3482
                                                                                                                      // 3483
			if (slide) // START Sliding - will set isSliding=true                                                              // 3484
				bindStopSlidingEvents(pane, true); // BIND trigger events to close sliding-pane                                   // 3485
			else if (s.isSliding) // PIN PANE (stop sliding) - open pane 'normally' instead                                    // 3486
				bindStopSlidingEvents(pane, false); // UNBIND trigger events - will set isSliding=false                           // 3487
			else if (o.slidable)                                                                                               // 3488
				bindStartSlidingEvents(pane, false); // UNBIND trigger events                                                     // 3489
                                                                                                                      // 3490
			s.noRoom = false; // will be reset by makePaneFit if 'noRoom'                                                      // 3491
			makePaneFit(pane);                                                                                                 // 3492
                                                                                                                      // 3493
			// transfer logic var to temp var                                                                                  // 3494
			isShowing = s.isShowing;                                                                                           // 3495
			// now clear the logic var                                                                                         // 3496
			delete s.isShowing;                                                                                                // 3497
                                                                                                                      // 3498
			doFX		= !noAnimation && s.isClosed && (o.fxName_open != "none");                                                   // 3499
			s.isMoving	= true;                                                                                                 // 3500
			s.isVisible	= true;                                                                                                // 3501
			s.isClosed	= false;                                                                                                // 3502
			// update isHidden BEFORE sizing panes - WHY??? Old?                                                               // 3503
			if (isShowing) s.isHidden = false;                                                                                 // 3504
                                                                                                                      // 3505
			if (doFX) { // ANIMATE                                                                                             // 3506
				// mask adjacent panes with objects                                                                               // 3507
				lockPaneForFX(pane, true);	// need to set left/top so animation will work                                         // 3508
					$P.show( o.fxName_open, o.fxSettings_open, o.fxSpeed_open, function() {                                          // 3509
					lockPaneForFX(pane, false); // undo                                                                              // 3510
					if (s.isVisible) open_2(); // continue                                                                           // 3511
					queueNext();                                                                                                     // 3512
				});                                                                                                               // 3513
			}                                                                                                                  // 3514
			else { // no animation                                                                                             // 3515
				_showPane(pane);// just show pane and...                                                                          // 3516
				open_2();		// continue                                                                                            // 3517
				queueNext();                                                                                                      // 3518
			};                                                                                                                 // 3519
		});                                                                                                                 // 3520
                                                                                                                      // 3521
		// SUBROUTINE                                                                                                       // 3522
		function open_2 () {                                                                                                // 3523
			s.isMoving	= false;                                                                                                // 3524
                                                                                                                      // 3525
			// cure iframe display issues                                                                                      // 3526
			_fixIframe(pane);                                                                                                  // 3527
                                                                                                                      // 3528
			// NOTE: if isSliding, then other panes are NOT 'resized'                                                          // 3529
			if (!s.isSliding) { // resize all panes adjacent to this one                                                       // 3530
				sizeMidPanes(_c[pane].dir=="vert" ? "center" : "", false); // false = NOT skipCallback                            // 3531
			}                                                                                                                  // 3532
                                                                                                                      // 3533
			// set classes, position handles and execute callbacks...                                                          // 3534
			setAsOpen(pane);                                                                                                   // 3535
		};                                                                                                                  // 3536
	                                                                                                                     // 3537
	}                                                                                                                    // 3538
                                                                                                                      // 3539
	/**                                                                                                                  // 3540
	* @param {string}	pane		The pane just opened, ie: north, south, east, or west                                        // 3541
	* @param {boolean=}	[skipCallback=false]                                                                             // 3542
	*/                                                                                                                   // 3543
,	setAsOpen = function (pane, skipCallback) {                                                                         // 3544
		var                                                                                                                 // 3545
			$P		= $Ps[pane]                                                                                                    // 3546
		,	$R		= $Rs[pane]                                                                                                   // 3547
		,	$T		= $Ts[pane]                                                                                                   // 3548
		,	o		= options[pane]                                                                                                // 3549
		,	s		= state[pane]                                                                                                  // 3550
		,	side	= _c[pane].side                                                                                              // 3551
		,	rClass	= o.resizerClass                                                                                           // 3552
		,	tClass	= o.togglerClass                                                                                           // 3553
		,	_pane	= "-"+ pane // used for classNames                                                                          // 3554
		,	_open	= "-open"                                                                                                   // 3555
		,	_closed	= "-closed"                                                                                               // 3556
		,	_sliding= "-sliding"                                                                                              // 3557
		;                                                                                                                   // 3558
		$R                                                                                                                  // 3559
			.css(side, sC.inset[side] + getPaneSize(pane)) // move the resizer                                                 // 3560
			.removeClass( rClass+_closed +" "+ rClass+_pane+_closed )                                                          // 3561
			.addClass( rClass+_open +" "+ rClass+_pane+_open )                                                                 // 3562
		;                                                                                                                   // 3563
		if (s.isSliding)                                                                                                    // 3564
			$R.addClass( rClass+_sliding +" "+ rClass+_pane+_sliding )                                                         // 3565
		else // in case 'was sliding'                                                                                       // 3566
			$R.removeClass( rClass+_sliding +" "+ rClass+_pane+_sliding )                                                      // 3567
                                                                                                                      // 3568
		removeHover( 0, $R ); // remove hover classes                                                                       // 3569
		if (o.resizable && $.layout.plugins.draggable)                                                                      // 3570
			$R	.draggable("enable")                                                                                            // 3571
				.css("cursor", o.resizerCursor)                                                                                   // 3572
				.attr("title", o.tips.Resize);                                                                                    // 3573
		else if (!s.isSliding)                                                                                              // 3574
			$R.css("cursor", "default"); // n-resize, s-resize, etc                                                            // 3575
                                                                                                                      // 3576
		// if pane also has a toggler button, adjust that too                                                               // 3577
		if ($T) {                                                                                                           // 3578
			$T	.removeClass( tClass+_closed +" "+ tClass+_pane+_closed )                                                       // 3579
				.addClass( tClass+_open +" "+ tClass+_pane+_open )                                                                // 3580
				.attr("title", o.tips.Close); // may be blank                                                                     // 3581
			removeHover( 0, $T ); // remove hover classes                                                                      // 3582
			// toggler-content - if exists                                                                                     // 3583
			$T.children(".content-closed").hide();                                                                             // 3584
			$T.children(".content-open").css("display","block");                                                               // 3585
		}                                                                                                                   // 3586
                                                                                                                      // 3587
		// sync any 'pin buttons'                                                                                           // 3588
		syncPinBtns(pane, !s.isSliding);                                                                                    // 3589
                                                                                                                      // 3590
		// update pane-state dimensions - BEFORE resizing content                                                           // 3591
		$.extend(s, elDims($P));                                                                                            // 3592
                                                                                                                      // 3593
		if (state.initialized) {                                                                                            // 3594
			// resize resizer & toggler sizes for all panes                                                                    // 3595
			sizeHandles();                                                                                                     // 3596
			// resize content every time pane opens - to be sure                                                               // 3597
			sizeContent(pane, true); // true = remeasure headers/footers, even if 'pane.isMoving'                              // 3598
		}                                                                                                                   // 3599
                                                                                                                      // 3600
		if (!skipCallback && (state.initialized || o.triggerEventsOnLoad) && $P.is(":visible")) {                           // 3601
			// onopen callback                                                                                                 // 3602
			_runCallbacks("onopen_end", pane);                                                                                 // 3603
			// onshow callback - TODO: should this be here?                                                                    // 3604
			if (s.isShowing) _runCallbacks("onshow_end", pane);                                                                // 3605
                                                                                                                      // 3606
			// ALSO call onresize because layout-size *may* have changed while pane was closed                                 // 3607
			if (state.initialized)                                                                                             // 3608
				_runCallbacks("onresize_end", pane);                                                                              // 3609
		}                                                                                                                   // 3610
                                                                                                                      // 3611
		// TODO: Somehow sizePane("north") is being called after this point???                                              // 3612
	}                                                                                                                    // 3613
                                                                                                                      // 3614
                                                                                                                      // 3615
	/**                                                                                                                  // 3616
	* slideOpen / slideClose / slideToggle                                                                               // 3617
	*                                                                                                                    // 3618
	* Pass-though methods for sliding                                                                                    // 3619
	*/                                                                                                                   // 3620
,	slideOpen = function (evt_or_pane) {                                                                                // 3621
		if (!isInitialized()) return;                                                                                       // 3622
		var	evt		= evtObj(evt_or_pane)                                                                                      // 3623
		,	pane	= evtPane.call(this, evt_or_pane)                                                                            // 3624
		,	s		= state[pane]                                                                                                  // 3625
		,	delay	= options[pane].slideDelay_open                                                                             // 3626
		;                                                                                                                   // 3627
		// prevent event from triggering on NEW resizer binding created below                                               // 3628
		if (evt) evt.stopImmediatePropagation();                                                                            // 3629
                                                                                                                      // 3630
		if (s.isClosed && evt && evt.type === "mouseenter" && delay > 0)                                                    // 3631
			// trigger = mouseenter - use a delay                                                                              // 3632
			timer.set(pane+"_openSlider", open_NOW, delay);                                                                    // 3633
		else                                                                                                                // 3634
			open_NOW(); // will unbind events if is already open                                                               // 3635
                                                                                                                      // 3636
		/**                                                                                                                 // 3637
		* SUBROUTINE for timed open                                                                                         // 3638
		*/                                                                                                                  // 3639
		function open_NOW () {                                                                                              // 3640
			if (!s.isClosed) // skip if no longer closed!                                                                      // 3641
				bindStopSlidingEvents(pane, true); // BIND trigger events to close sliding-pane                                   // 3642
			else if (!s.isMoving)                                                                                              // 3643
				open(pane, true); // true = slide - open() will handle binding                                                    // 3644
		};                                                                                                                  // 3645
	}                                                                                                                    // 3646
                                                                                                                      // 3647
,	slideClose = function (evt_or_pane) {                                                                               // 3648
		if (!isInitialized()) return;                                                                                       // 3649
		var	evt		= evtObj(evt_or_pane)                                                                                      // 3650
		,	pane	= evtPane.call(this, evt_or_pane)                                                                            // 3651
		,	o		= options[pane]                                                                                                // 3652
		,	s		= state[pane]                                                                                                  // 3653
		,	delay	= s.isMoving ? 1000 : 300 // MINIMUM delay - option may override                                            // 3654
		;                                                                                                                   // 3655
		if (s.isClosed || s.isResizing)                                                                                     // 3656
			return; // skip if already closed OR in process of resizing                                                        // 3657
		else if (o.slideTrigger_close === "click")                                                                          // 3658
			close_NOW(); // close immediately onClick                                                                          // 3659
		else if (o.preventQuickSlideClose && s.isMoving)                                                                    // 3660
			return; // handle Chrome quick-close on slide-open                                                                 // 3661
		else if (o.preventPrematureSlideClose && evt && $.layout.isMouseOverElem(evt, $Ps[pane]))                           // 3662
			return; // handle incorrect mouseleave trigger, like when over a SELECT-list in IE                                 // 3663
		else if (evt) // trigger = mouseleave - use a delay                                                                 // 3664
			// 1 sec delay if 'opening', else .3 sec                                                                           // 3665
			timer.set(pane+"_closeSlider", close_NOW, max(o.slideDelay_close, delay));                                         // 3666
		else // called programically                                                                                        // 3667
			close_NOW();                                                                                                       // 3668
                                                                                                                      // 3669
		/**                                                                                                                 // 3670
		* SUBROUTINE for timed close                                                                                        // 3671
		*/                                                                                                                  // 3672
		function close_NOW () {                                                                                             // 3673
			if (s.isClosed) // skip 'close' if already closed!                                                                 // 3674
				bindStopSlidingEvents(pane, false); // UNBIND trigger events - TODO: is this needed here?                         // 3675
			else if (!s.isMoving)                                                                                              // 3676
				close(pane); // close will handle unbinding                                                                       // 3677
		};                                                                                                                  // 3678
	}                                                                                                                    // 3679
                                                                                                                      // 3680
	/**                                                                                                                  // 3681
	* @param {(string|Object)}	evt_or_pane		The pane being opened, ie: north, south, east, or west                       // 3682
	*/                                                                                                                   // 3683
,	slideToggle = function (evt_or_pane) {                                                                              // 3684
		var pane = evtPane.call(this, evt_or_pane);                                                                         // 3685
		toggle(pane, true);                                                                                                 // 3686
	}                                                                                                                    // 3687
                                                                                                                      // 3688
                                                                                                                      // 3689
	/**                                                                                                                  // 3690
	* Must set left/top on East/South panes so animation will work properly                                              // 3691
	*                                                                                                                    // 3692
	* @param {string}	pane	The pane to lock, 'east' or 'south' - any other is ignored!                                   // 3693
	* @param {boolean}	doLock  true = set left/top, false = remove                                                       // 3694
	*/                                                                                                                   // 3695
,	lockPaneForFX = function (pane, doLock) {                                                                           // 3696
		var $P	= $Ps[pane]                                                                                                  // 3697
		,	s	= state[pane]                                                                                                   // 3698
		,	o	= options[pane]                                                                                                 // 3699
		,	z	= options.zIndexes                                                                                              // 3700
		;                                                                                                                   // 3701
		if (doLock) {                                                                                                       // 3702
			showMasks( pane, { animation: true, objectsOnly: true });                                                          // 3703
			$P.css({ zIndex: z.pane_animate }); // overlay all elements during animation                                       // 3704
			if (pane=="south")                                                                                                 // 3705
				$P.css({ top: sC.inset.top + sC.innerHeight - $P.outerHeight() });                                                // 3706
			else if (pane=="east")                                                                                             // 3707
				$P.css({ left: sC.inset.left + sC.innerWidth - $P.outerWidth() });                                                // 3708
		}                                                                                                                   // 3709
		else { // animation DONE - RESET CSS                                                                                // 3710
			hideMasks();                                                                                                       // 3711
			$P.css({ zIndex: (s.isSliding ? z.pane_sliding : z.pane_normal) });                                                // 3712
			if (pane=="south")                                                                                                 // 3713
				$P.css({ top: "auto" });                                                                                          // 3714
			// if pane is positioned 'off-screen', then DO NOT screw with it!                                                  // 3715
			else if (pane=="east" && !$P.css("left").match(/\-99999/))                                                         // 3716
				$P.css({ left: "auto" });                                                                                         // 3717
			// fix anti-aliasing in IE - only needed for animations that change opacity                                        // 3718
			if (browser.msie && o.fxOpacityFix && o.fxName_open != "slide" && $P.css("filter") && $P.css("opacity") == 1)      // 3719
				$P[0].style.removeAttribute('filter');                                                                            // 3720
		}                                                                                                                   // 3721
	}                                                                                                                    // 3722
                                                                                                                      // 3723
                                                                                                                      // 3724
	/**                                                                                                                  // 3725
	* Toggle sliding functionality of a specific pane on/off by adding removing 'slide open' trigger                     // 3726
	*                                                                                                                    // 3727
	* @see  open(), close()                                                                                              // 3728
	* @param {string}	pane	The pane to enable/disable, 'north', 'south', etc.                                            // 3729
	* @param {boolean}	enable	Enable or Disable sliding?                                                                 // 3730
	*/                                                                                                                   // 3731
,	bindStartSlidingEvents = function (pane, enable) {                                                                  // 3732
		var o		= options[pane]                                                                                              // 3733
		,	$P		= $Ps[pane]                                                                                                   // 3734
		,	$R		= $Rs[pane]                                                                                                   // 3735
		,	evtName	= o.slideTrigger_open.toLowerCase()                                                                       // 3736
		;                                                                                                                   // 3737
		if (!$R || (enable && !o.slidable)) return;                                                                         // 3738
                                                                                                                      // 3739
		// make sure we have a valid event                                                                                  // 3740
		if (evtName.match(/mouseover/))                                                                                     // 3741
			evtName = o.slideTrigger_open = "mouseenter";                                                                      // 3742
		else if (!evtName.match(/(click|dblclick|mouseenter)/))                                                             // 3743
			evtName = o.slideTrigger_open = "click";                                                                           // 3744
                                                                                                                      // 3745
		// must remove double-click-toggle when using dblclick-slide                                                        // 3746
		if (o.resizerDblClickToggle && evtName.match(/click/)) {                                                            // 3747
			$R[enable ? "unbind" : "bind"]('dblclick.'+ sID, toggle)                                                           // 3748
		}                                                                                                                   // 3749
                                                                                                                      // 3750
		$R                                                                                                                  // 3751
			// add or remove event                                                                                             // 3752
			[enable ? "bind" : "unbind"](evtName +'.'+ sID, slideOpen)                                                         // 3753
			// set the appropriate cursor & title/tip                                                                          // 3754
			.css("cursor", enable ? o.sliderCursor : "default")                                                                // 3755
			.attr("title", enable ? o.tips.Slide : "")                                                                         // 3756
		;                                                                                                                   // 3757
	}                                                                                                                    // 3758
                                                                                                                      // 3759
	/**                                                                                                                  // 3760
	* Add or remove 'mouseleave' events to 'slide close' when pane is 'sliding' open or closed                           // 3761
	* Also increases zIndex when pane is sliding open                                                                    // 3762
	* See bindStartSlidingEvents for code to control 'slide open'                                                        // 3763
	*                                                                                                                    // 3764
	* @see  slideOpen(), slideClose()                                                                                    // 3765
	* @param {string}	pane	The pane to process, 'north', 'south', etc.                                                   // 3766
	* @param {boolean}	enable	Enable or Disable events?                                                                  // 3767
	*/                                                                                                                   // 3768
,	bindStopSlidingEvents = function (pane, enable) {                                                                   // 3769
		var	o		= options[pane]                                                                                              // 3770
		,	s		= state[pane]                                                                                                  // 3771
		,	c		= _c[pane]                                                                                                     // 3772
		,	z		= options.zIndexes                                                                                             // 3773
		,	evtName	= o.slideTrigger_close.toLowerCase()                                                                      // 3774
		,	action	= (enable ? "bind" : "unbind")                                                                             // 3775
		,	$P		= $Ps[pane]                                                                                                   // 3776
		,	$R		= $Rs[pane]                                                                                                   // 3777
		;                                                                                                                   // 3778
		timer.clear(pane+"_closeSlider"); // just in case                                                                   // 3779
                                                                                                                      // 3780
		if (enable) {                                                                                                       // 3781
			s.isSliding = true;                                                                                                // 3782
			state.panesSliding[pane] = true;                                                                                   // 3783
			// remove 'slideOpen' event from resizer                                                                           // 3784
			// ALSO will raise the zIndex of the pane & resizer                                                                // 3785
			bindStartSlidingEvents(pane, false);                                                                               // 3786
		}                                                                                                                   // 3787
		else {                                                                                                              // 3788
			s.isSliding = false;                                                                                               // 3789
			delete state.panesSliding[pane];                                                                                   // 3790
		}                                                                                                                   // 3791
                                                                                                                      // 3792
		// RE/SET zIndex - increases when pane is sliding-open, resets to normal when not                                   // 3793
		$P.css("zIndex", enable ? z.pane_sliding : z.pane_normal);                                                          // 3794
		$R.css("zIndex", enable ? z.pane_sliding+2 : z.resizer_normal); // NOTE: mask = pane_sliding+1                      // 3795
                                                                                                                      // 3796
		// make sure we have a valid event                                                                                  // 3797
		if (!evtName.match(/(click|mouseleave)/))                                                                           // 3798
			evtName = o.slideTrigger_close = "mouseleave"; // also catches 'mouseout'                                          // 3799
                                                                                                                      // 3800
		// add/remove slide triggers                                                                                        // 3801
		$R[action](evtName, slideClose); // base event on resize                                                            // 3802
		// need extra events for mouseleave                                                                                 // 3803
		if (evtName === "mouseleave") {                                                                                     // 3804
			// also close on pane.mouseleave                                                                                   // 3805
			$P[action]("mouseleave."+ sID, slideClose);                                                                        // 3806
			// cancel timer when mouse moves between 'pane' and 'resizer'                                                      // 3807
			$R[action]("mouseenter."+ sID, cancelMouseOut);                                                                    // 3808
			$P[action]("mouseenter."+ sID, cancelMouseOut);                                                                    // 3809
		}                                                                                                                   // 3810
                                                                                                                      // 3811
		if (!enable)                                                                                                        // 3812
			timer.clear(pane+"_closeSlider");                                                                                  // 3813
		else if (evtName === "click" && !o.resizable) {                                                                     // 3814
			// IF pane is not resizable (which already has a cursor and tip)                                                   // 3815
			// then set the a cursor & title/tip on resizer when sliding                                                       // 3816
			$R.css("cursor", enable ? o.sliderCursor : "default");                                                             // 3817
			$R.attr("title", enable ? o.tips.Close : ""); // use Toggler-tip, eg: "Close Pane"                                 // 3818
		}                                                                                                                   // 3819
                                                                                                                      // 3820
		// SUBROUTINE for mouseleave timer clearing                                                                         // 3821
		function cancelMouseOut (evt) {                                                                                     // 3822
			timer.clear(pane+"_closeSlider");                                                                                  // 3823
			evt.stopPropagation();                                                                                             // 3824
		}                                                                                                                   // 3825
	}                                                                                                                    // 3826
                                                                                                                      // 3827
                                                                                                                      // 3828
	/**                                                                                                                  // 3829
	* Hides/closes a pane if there is insufficient room - reverses this when there is room again                         // 3830
	* MUST have already called setSizeLimits() before calling this method                                                // 3831
	*                                                                                                                    // 3832
	* @param {string}	pane					The pane being resized                                                                    // 3833
	* @param {boolean=}	[isOpening=false]		Called from onOpen?                                                           // 3834
	* @param {boolean=}	[skipCallback=false]	Should the onresize callback be run?                                        // 3835
	* @param {boolean=}	[force=false]                                                                                    // 3836
	*/                                                                                                                   // 3837
,	makePaneFit = function (pane, isOpening, skipCallback, force) {                                                     // 3838
		var	o	= options[pane]                                                                                               // 3839
		,	s	= state[pane]                                                                                                   // 3840
		,	c	= _c[pane]                                                                                                      // 3841
		,	$P	= $Ps[pane]                                                                                                    // 3842
		,	$R	= $Rs[pane]                                                                                                    // 3843
		,	isSidePane 	= c.dir==="vert"                                                                                      // 3844
		,	hasRoom		= false                                                                                                  // 3845
		;                                                                                                                   // 3846
		// special handling for center & east/west panes                                                                    // 3847
		if (pane === "center" || (isSidePane && s.noVerticalRoom)) {                                                        // 3848
			// see if there is enough room to display the pane                                                                 // 3849
			// ERROR: hasRoom = s.minHeight <= s.maxHeight && (isSidePane || s.minWidth <= s.maxWidth);                        // 3850
			hasRoom = (s.maxHeight >= 0);                                                                                      // 3851
			if (hasRoom && s.noRoom) { // previously hidden due to noRoom, so show now                                         // 3852
				_showPane(pane);                                                                                                  // 3853
				if ($R) $R.show();                                                                                                // 3854
				s.isVisible = true;                                                                                               // 3855
				s.noRoom = false;                                                                                                 // 3856
				if (isSidePane) s.noVerticalRoom = false;                                                                         // 3857
				_fixIframe(pane);                                                                                                 // 3858
			}                                                                                                                  // 3859
			else if (!hasRoom && !s.noRoom) { // not currently hidden, so hide now                                             // 3860
				_hidePane(pane);                                                                                                  // 3861
				if ($R) $R.hide();                                                                                                // 3862
				s.isVisible = false;                                                                                              // 3863
				s.noRoom = true;                                                                                                  // 3864
			}                                                                                                                  // 3865
		}                                                                                                                   // 3866
                                                                                                                      // 3867
		// see if there is enough room to fit the border-pane                                                               // 3868
		if (pane === "center") {                                                                                            // 3869
			// ignore center in this block                                                                                     // 3870
		}                                                                                                                   // 3871
		else if (s.minSize <= s.maxSize) { // pane CAN fit                                                                  // 3872
			hasRoom = true;                                                                                                    // 3873
			if (s.size > s.maxSize) // pane is too big - shrink it                                                             // 3874
				sizePane(pane, s.maxSize, skipCallback, true, force); // true = noAnimation                                       // 3875
			else if (s.size < s.minSize) // pane is too small - enlarge it                                                     // 3876
				sizePane(pane, s.minSize, skipCallback, true, force); // true = noAnimation                                       // 3877
			// need s.isVisible because new pseudoClose method keeps pane visible, but off-screen                              // 3878
			else if ($R && s.isVisible && $P.is(":visible")) {                                                                 // 3879
				// make sure resizer-bar is positioned correctly                                                                  // 3880
				// handles situation where nested layout was 'hidden' when initialized                                            // 3881
				var	pos = s.size + sC.inset[c.side];                                                                              // 3882
				if ($.layout.cssNum( $R, c.side ) != pos) $R.css( c.side, pos );                                                  // 3883
			}                                                                                                                  // 3884
                                                                                                                      // 3885
			// if was previously hidden due to noRoom, then RESET because NOW there is room                                    // 3886
			if (s.noRoom) {                                                                                                    // 3887
				// s.noRoom state will be set by open or show                                                                     // 3888
				if (s.wasOpen && o.closable) {                                                                                    // 3889
					if (o.autoReopen)                                                                                                // 3890
						open(pane, false, true, true); // true = noAnimation, true = noAlert                                            // 3891
					else // leave the pane closed, so just update state                                                              // 3892
						s.noRoom = false;                                                                                               // 3893
				}                                                                                                                 // 3894
				else                                                                                                              // 3895
					show(pane, s.wasOpen, true, true); // true = noAnimation, true = noAlert                                         // 3896
			}                                                                                                                  // 3897
		}                                                                                                                   // 3898
		else { // !hasRoom - pane CANNOT fit                                                                                // 3899
			if (!s.noRoom) { // pane not set as noRoom yet, so hide or close it now...                                         // 3900
				s.noRoom = true; // update state                                                                                  // 3901
				s.wasOpen = !s.isClosed && !s.isSliding;                                                                          // 3902
				if (s.isClosed){} // SKIP                                                                                         // 3903
				else if (o.closable) // 'close' if possible                                                                       // 3904
					close(pane, true, true); // true = force, true = noAnimation                                                     // 3905
				else // 'hide' pane if cannot just be closed                                                                      // 3906
					hide(pane, true); // true = noAnimation                                                                          // 3907
			}                                                                                                                  // 3908
		}                                                                                                                   // 3909
	}                                                                                                                    // 3910
                                                                                                                      // 3911
                                                                                                                      // 3912
	/**                                                                                                                  // 3913
	* manualSizePane is an exposed flow-through method allowing extra code when pane is 'manually resized'               // 3914
	*                                                                                                                    // 3915
	* @param {(string|Object)}	evt_or_pane				The pane being resized                                                     // 3916
	* @param {number}			size					The *desired* new size for this pane - will be validated                                // 3917
	* @param {boolean=}			[skipCallback=false]	Should the onresize callback be run?                                      // 3918
	* @param {boolean=}			[noAnimation=false]                                                                            // 3919
	* @param {boolean=}			[force=false]			Force resizing even if does not seem necessary                                 // 3920
	*/                                                                                                                   // 3921
,	manualSizePane = function (evt_or_pane, size, skipCallback, noAnimation, force) {                                   // 3922
		if (!isInitialized()) return;                                                                                       // 3923
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 3924
		,	o	= options[pane]                                                                                                 // 3925
		,	s	= state[pane]                                                                                                   // 3926
		//	if resizing callbacks have been delayed and resizing is now DONE, force resizing to complete...                  // 3927
		,	forceResize = force || (o.livePaneResizing && !s.isResizing)                                                      // 3928
		;                                                                                                                   // 3929
		// ANY call to manualSizePane disables autoResize - ie, percentage sizing                                           // 3930
		s.autoResize = false;                                                                                               // 3931
		// flow-through...                                                                                                  // 3932
		sizePane(pane, size, skipCallback, noAnimation, forceResize); // will animate resize if option enabled              // 3933
	}                                                                                                                    // 3934
                                                                                                                      // 3935
	/**                                                                                                                  // 3936
	* sizePane is called only by internal methods whenever a pane needs to be resized                                    // 3937
	*                                                                                                                    // 3938
	* @param {(string|Object)}	evt_or_pane				The pane being resized                                                     // 3939
	* @param {number}			size					The *desired* new size for this pane - will be validated                                // 3940
	* @param {boolean=}			[skipCallback=false]	Should the onresize callback be run?                                      // 3941
	* @param {boolean=}			[noAnimation=false]                                                                            // 3942
	* @param {boolean=}			[force=false]			Force resizing even if does not seem necessary                                 // 3943
	*/                                                                                                                   // 3944
,	sizePane = function (evt_or_pane, size, skipCallback, noAnimation, force) {                                         // 3945
		if (!isInitialized()) return;                                                                                       // 3946
		var	pane	= evtPane.call(this, evt_or_pane) // probably NEVER called from event?                                     // 3947
		,	o		= options[pane]                                                                                                // 3948
		,	s		= state[pane]                                                                                                  // 3949
		,	$P		= $Ps[pane]                                                                                                   // 3950
		,	$R		= $Rs[pane]                                                                                                   // 3951
		,	side	= _c[pane].side                                                                                              // 3952
		,	dimName	= _c[pane].sizeType.toLowerCase()                                                                         // 3953
		,	skipResizeWhileDragging = s.isResizing && !o.triggerEventsDuringLiveResize                                        // 3954
		,	doFX	= noAnimation !== true && o.animatePaneSizing                                                                // 3955
		,	oldSize, newSize                                                                                                  // 3956
		;                                                                                                                   // 3957
		// QUEUE in case another action/animation is in progress                                                            // 3958
		$N.queue(function( queueNext ){                                                                                     // 3959
			// calculate 'current' min/max sizes                                                                               // 3960
			setSizeLimits(pane); // update pane-state                                                                          // 3961
			oldSize = s.size;                                                                                                  // 3962
			size = _parseSize(pane, size); // handle percentages & auto                                                        // 3963
			size = max(size, _parseSize(pane, o.minSize));                                                                     // 3964
			size = min(size, s.maxSize);                                                                                       // 3965
			if (size < s.minSize) { // not enough room for pane!                                                               // 3966
				queueNext(); // call before makePaneFit() because it needs the queue free                                         // 3967
				makePaneFit(pane, false, skipCallback);	// will hide or close pane                                                // 3968
				return;                                                                                                           // 3969
			}                                                                                                                  // 3970
                                                                                                                      // 3971
			// IF newSize is same as oldSize, then nothing to do - abort                                                       // 3972
			if (!force && size === oldSize)                                                                                    // 3973
				return queueNext();                                                                                               // 3974
                                                                                                                      // 3975
			s.newSize = size;                                                                                                  // 3976
                                                                                                                      // 3977
			// onresize_start callback CANNOT cancel resizing because this would break the layout!                             // 3978
			if (!skipCallback && state.initialized && s.isVisible)                                                             // 3979
				_runCallbacks("onresize_start", pane);                                                                            // 3980
                                                                                                                      // 3981
			// resize the pane, and make sure its visible                                                                      // 3982
			newSize = cssSize(pane, size);                                                                                     // 3983
                                                                                                                      // 3984
			if (doFX && $P.is(":visible")) { // ANIMATE                                                                        // 3985
				var fx		= $.layout.effects.size[pane] || $.layout.effects.size.all                                                // 3986
				,	easing	= o.fxSettings_size.easing || fx.easing                                                                  // 3987
				,	z		= options.zIndexes                                                                                           // 3988
				,	props	= {};                                                                                                     // 3989
				props[ dimName ] = newSize +'px';                                                                                 // 3990
				s.isMoving = true;                                                                                                // 3991
				// overlay all elements during animation                                                                          // 3992
				$P.css({ zIndex: z.pane_animate })                                                                                // 3993
				  .show().animate( props, o.fxSpeed_size, easing, function(){                                                     // 3994
					// reset zIndex after animation                                                                                  // 3995
					$P.css({ zIndex: (s.isSliding ? z.pane_sliding : z.pane_normal) });                                              // 3996
					s.isMoving = false;                                                                                              // 3997
					delete s.newSize;                                                                                                // 3998
					sizePane_2(); // continue                                                                                        // 3999
					queueNext();                                                                                                     // 4000
				});                                                                                                               // 4001
			}                                                                                                                  // 4002
			else { // no animation                                                                                             // 4003
				$P.css( dimName, newSize );	// resize pane                                                                        // 4004
				delete s.newSize;                                                                                                 // 4005
				// if pane is visible, then                                                                                       // 4006
				if ($P.is(":visible"))                                                                                            // 4007
					sizePane_2(); // continue                                                                                        // 4008
				else {                                                                                                            // 4009
					// pane is NOT VISIBLE, so just update state data...                                                             // 4010
					// when pane is *next opened*, it will have the new size                                                         // 4011
					s.size = size;				// update state.size                                                                           // 4012
					$.extend(s, elDims($P));	// update state dimensions                                                              // 4013
				}                                                                                                                 // 4014
				queueNext();                                                                                                      // 4015
			};                                                                                                                 // 4016
                                                                                                                      // 4017
		});                                                                                                                 // 4018
                                                                                                                      // 4019
		// SUBROUTINE                                                                                                       // 4020
		function sizePane_2 () {                                                                                            // 4021
			/*	Panes are sometimes not sized precisely in some browsers!?                                                      // 4022
			 *	This code will resize the pane up to 3 times to nudge the pane to the correct size                              // 4023
			 */                                                                                                                // 4024
			var	actual	= dimName==='width' ? $P.outerWidth() : $P.outerHeight()                                                // 4025
			,	tries	= [{                                                                                                       // 4026
						   	pane:		pane                                                                                                 // 4027
						,	count:		1                                                                                                     // 4028
						,	target:		size                                                                                                 // 4029
						,	actual:		actual                                                                                               // 4030
						,	correct:	(size === actual)                                                                                    // 4031
						,	attempt:	size                                                                                                 // 4032
						,	cssSize:	newSize                                                                                              // 4033
						}]                                                                                                              // 4034
			,	lastTry = tries[0]                                                                                               // 4035
			,	thisTry	= {}                                                                                                     // 4036
			,	msg		= 'Inaccurate size after resizing the '+ pane +'-pane.'                                                     // 4037
			;                                                                                                                  // 4038
			while ( !lastTry.correct ) {                                                                                       // 4039
				thisTry = { pane: pane, count: lastTry.count+1, target: size };                                                   // 4040
                                                                                                                      // 4041
				if (lastTry.actual > size)                                                                                        // 4042
					thisTry.attempt = max(0, lastTry.attempt - (lastTry.actual - size));                                             // 4043
				else // lastTry.actual < size                                                                                     // 4044
					thisTry.attempt = max(0, lastTry.attempt + (size - lastTry.actual));                                             // 4045
                                                                                                                      // 4046
				thisTry.cssSize = cssSize(pane, thisTry.attempt);                                                                 // 4047
				$P.css( dimName, thisTry.cssSize );                                                                               // 4048
                                                                                                                      // 4049
				thisTry.actual	= dimName=='width' ? $P.outerWidth() : $P.outerHeight();                                           // 4050
				thisTry.correct	= (size === thisTry.actual);                                                                      // 4051
                                                                                                                      // 4052
				// log attempts and alert the user of this *non-fatal error* (if showDebugMessages)                               // 4053
				if ( tries.length === 1) {                                                                                        // 4054
					_log(msg, false, true);                                                                                          // 4055
					_log(lastTry, false, true);                                                                                      // 4056
				}                                                                                                                 // 4057
				_log(thisTry, false, true);                                                                                       // 4058
				// after 4 tries, is as close as its gonna get!                                                                   // 4059
				if (tries.length > 3) break;                                                                                      // 4060
                                                                                                                      // 4061
				tries.push( thisTry );                                                                                            // 4062
				lastTry = tries[ tries.length - 1 ];                                                                              // 4063
			}                                                                                                                  // 4064
			// END TESTING CODE                                                                                                // 4065
                                                                                                                      // 4066
			// update pane-state dimensions                                                                                    // 4067
			s.size	= size;                                                                                                     // 4068
			$.extend(s, elDims($P));                                                                                           // 4069
                                                                                                                      // 4070
			if (s.isVisible && $P.is(":visible")) {                                                                            // 4071
				// reposition the resizer-bar                                                                                     // 4072
				if ($R) $R.css( side, size + sC.inset[side] );                                                                    // 4073
				// resize the content-div                                                                                         // 4074
				sizeContent(pane);                                                                                                // 4075
			}                                                                                                                  // 4076
                                                                                                                      // 4077
			if (!skipCallback && !skipResizeWhileDragging && state.initialized && s.isVisible)                                 // 4078
				_runCallbacks("onresize_end", pane);                                                                              // 4079
                                                                                                                      // 4080
			// resize all the adjacent panes, and adjust their toggler buttons                                                 // 4081
			// when skipCallback passed, it means the controlling method will handle 'other panes'                             // 4082
			if (!skipCallback) {                                                                                               // 4083
				// also no callback if live-resize is in progress and NOT triggerEventsDuringLiveResize                           // 4084
				if (!s.isSliding) sizeMidPanes(_c[pane].dir=="horz" ? "" : "center", skipResizeWhileDragging, force);             // 4085
				sizeHandles();                                                                                                    // 4086
			}                                                                                                                  // 4087
                                                                                                                      // 4088
			// if opposite-pane was autoClosed, see if it can be autoOpened now                                                // 4089
			var altPane = _c.oppositeEdge[pane];                                                                               // 4090
			if (size < oldSize && state[ altPane ].noRoom) {                                                                   // 4091
				setSizeLimits( altPane );                                                                                         // 4092
				makePaneFit( altPane, false, skipCallback );                                                                      // 4093
			}                                                                                                                  // 4094
                                                                                                                      // 4095
			// DEBUG - ALERT user/developer so they know there was a sizing problem                                            // 4096
			if (tries.length > 1)                                                                                              // 4097
				_log(msg +'\nSee the Error Console for details.', true, true);                                                    // 4098
		}                                                                                                                   // 4099
	}                                                                                                                    // 4100
                                                                                                                      // 4101
	/**                                                                                                                  // 4102
	* @see  initPanes(), sizePane(), 	resizeAll(), open(), close(), hide()                                               // 4103
	* @param {(Array.<string>|string)}	panes					The pane(s) being resized, comma-delmited string                        // 4104
	* @param {boolean=}					[skipCallback=false]	Should the onresize callback be run?                                    // 4105
	* @param {boolean=}					[force=false]                                                                                // 4106
	*/                                                                                                                   // 4107
,	sizeMidPanes = function (panes, skipCallback, force) {                                                              // 4108
		panes = (panes ? panes : "east,west,center").split(",");                                                            // 4109
                                                                                                                      // 4110
		$.each(panes, function (i, pane) {                                                                                  // 4111
			if (!$Ps[pane]) return; // NO PANE - skip                                                                          // 4112
			var                                                                                                                // 4113
				o		= options[pane]                                                                                                // 4114
			,	s		= state[pane]                                                                                                 // 4115
			,	$P		= $Ps[pane]                                                                                                  // 4116
			,	$R		= $Rs[pane]                                                                                                  // 4117
			,	isCenter= (pane=="center")                                                                                       // 4118
			,	hasRoom	= true                                                                                                   // 4119
			,	CSS		= {}                                                                                                        // 4120
			//	if pane is not visible, show it invisibly NOW rather than for *each call* in this script                        // 4121
			,	visCSS	= $.layout.showInvisibly($P)                                                                              // 4122
                                                                                                                      // 4123
			,	newCenter	= calcNewCenterPaneDims()                                                                              // 4124
			;                                                                                                                  // 4125
                                                                                                                      // 4126
			// update pane-state dimensions                                                                                    // 4127
			$.extend(s, elDims($P));                                                                                           // 4128
                                                                                                                      // 4129
			if (pane === "center") {                                                                                           // 4130
				if (!force && s.isVisible && newCenter.width === s.outerWidth && newCenter.height === s.outerHeight) {            // 4131
					$P.css(visCSS);                                                                                                  // 4132
					return true; // SKIP - pane already the correct size                                                             // 4133
				}                                                                                                                 // 4134
				// set state for makePaneFit() logic                                                                              // 4135
				$.extend(s, cssMinDims(pane), {                                                                                   // 4136
					maxWidth:	newCenter.width                                                                                        // 4137
				,	maxHeight:	newCenter.height                                                                                     // 4138
				});                                                                                                               // 4139
				CSS = newCenter;                                                                                                  // 4140
				s.newWidth	= CSS.width;                                                                                           // 4141
				s.newHeight	= CSS.height;                                                                                         // 4142
				// convert OUTER width/height to CSS width/height                                                                 // 4143
				CSS.width	= cssW($P, CSS.width);                                                                                  // 4144
				// NEW - allow pane to extend 'below' visible area rather than hide it                                            // 4145
				CSS.height	= cssH($P, CSS.height);                                                                                // 4146
				hasRoom		= CSS.width >= 0 && CSS.height >= 0; // height >= 0 = ALWAYS TRUE NOW                                    // 4147
                                                                                                                      // 4148
				// during layout init, try to shrink east/west panes to make room for center                                      // 4149
				if (!state.initialized && o.minWidth > newCenter.width) {                                                         // 4150
					var                                                                                                              // 4151
						reqPx	= o.minWidth - s.outerWidth                                                                               // 4152
					,	minE	= options.east.minSize || 0                                                                               // 4153
					,	minW	= options.west.minSize || 0                                                                               // 4154
					,	sizeE	= state.east.size                                                                                        // 4155
					,	sizeW	= state.west.size                                                                                        // 4156
					,	newE	= sizeE                                                                                                   // 4157
					,	newW	= sizeW                                                                                                   // 4158
					;                                                                                                                // 4159
					if (reqPx > 0 && state.east.isVisible && sizeE > minE) {                                                         // 4160
						newE = max( sizeE-minE, sizeE-reqPx );                                                                          // 4161
						reqPx -= sizeE-newE;                                                                                            // 4162
					}                                                                                                                // 4163
					if (reqPx > 0 && state.west.isVisible && sizeW > minW) {                                                         // 4164
						newW = max( sizeW-minW, sizeW-reqPx );                                                                          // 4165
						reqPx -= sizeW-newW;                                                                                            // 4166
					}                                                                                                                // 4167
					// IF we found enough extra space, then resize the border panes as calculated                                    // 4168
					if (reqPx === 0) {                                                                                               // 4169
						if (sizeE && sizeE != minE)                                                                                     // 4170
							sizePane('east', newE, true, true, force); // true = skipCallback/noAnimation - initPanes will handle when done
						if (sizeW && sizeW != minW)                                                                                     // 4172
							sizePane('west', newW, true, true, force); // true = skipCallback/noAnimation                                  // 4173
						// now start over!                                                                                              // 4174
						sizeMidPanes('center', skipCallback, force);                                                                    // 4175
						$P.css(visCSS);                                                                                                 // 4176
						return; // abort this loop                                                                                      // 4177
					}                                                                                                                // 4178
				}                                                                                                                 // 4179
			}                                                                                                                  // 4180
			else { // for east and west, set only the height, which is same as center height                                   // 4181
				// set state.min/maxWidth/Height for makePaneFit() logic                                                          // 4182
				if (s.isVisible && !s.noVerticalRoom)                                                                             // 4183
					$.extend(s, elDims($P), cssMinDims(pane))                                                                        // 4184
				if (!force && !s.noVerticalRoom && newCenter.height === s.outerHeight) {                                          // 4185
					$P.css(visCSS);                                                                                                  // 4186
					return true; // SKIP - pane already the correct size                                                             // 4187
				}                                                                                                                 // 4188
				// east/west have same top, bottom & height as center                                                             // 4189
				CSS.top		= newCenter.top;                                                                                         // 4190
				CSS.bottom	= newCenter.bottom;                                                                                    // 4191
				s.newSize	= newCenter.height                                                                                      // 4192
				// NEW - allow pane to extend 'below' visible area rather than hide it                                            // 4193
				CSS.height	= cssH($P, newCenter.height);                                                                          // 4194
				s.maxHeight	= CSS.height;                                                                                         // 4195
				hasRoom		= (s.maxHeight >= 0); // ALWAYS TRUE NOW                                                                 // 4196
				if (!hasRoom) s.noVerticalRoom = true; // makePaneFit() logic                                                     // 4197
			}                                                                                                                  // 4198
                                                                                                                      // 4199
			if (hasRoom) {                                                                                                     // 4200
				// resizeAll passes skipCallback because it triggers callbacks after ALL panes are resized                        // 4201
				if (!skipCallback && state.initialized)                                                                           // 4202
					_runCallbacks("onresize_start", pane);                                                                           // 4203
                                                                                                                      // 4204
				$P.css(CSS); // apply the CSS to pane                                                                             // 4205
				if (pane !== "center")                                                                                            // 4206
					sizeHandles(pane); // also update resizer length                                                                 // 4207
				if (s.noRoom && !s.isClosed && !s.isHidden)                                                                       // 4208
					makePaneFit(pane); // will re-open/show auto-closed/hidden pane                                                  // 4209
				if (s.isVisible) {                                                                                                // 4210
					$.extend(s, elDims($P)); // update pane dimensions                                                               // 4211
					if (state.initialized) sizeContent(pane); // also resize the contents, if exists                                 // 4212
				}                                                                                                                 // 4213
			}                                                                                                                  // 4214
			else if (!s.noRoom && s.isVisible) // no room for pane                                                             // 4215
				makePaneFit(pane); // will hide or close pane                                                                     // 4216
                                                                                                                      // 4217
			// reset visibility, if necessary                                                                                  // 4218
			$P.css(visCSS);                                                                                                    // 4219
                                                                                                                      // 4220
			delete s.newSize;                                                                                                  // 4221
			delete s.newWidth;                                                                                                 // 4222
			delete s.newHeight;                                                                                                // 4223
                                                                                                                      // 4224
			if (!s.isVisible)                                                                                                  // 4225
				return true; // DONE - next pane                                                                                  // 4226
                                                                                                                      // 4227
			/*                                                                                                                 // 4228
			* Extra CSS for IE6 or IE7 in Quirks-mode - add 'width' to NORTH/SOUTH panes                                       // 4229
			* Normally these panes have only 'left' & 'right' positions so pane auto-sizes                                     // 4230
			* ALSO required when pane is an IFRAME because will NOT default to 'full width'                                    // 4231
			*	TODO: Can I use width:100% for a north/south iframe?                                                             // 4232
			*	TODO: Sounds like a job for $P.outerWidth( sC.innerWidth ) SETTER METHOD                                         // 4233
			*/                                                                                                                 // 4234
			if (pane === "center") { // finished processing midPanes                                                           // 4235
				var fix = browser.isIE6 || !browser.boxModel;                                                                     // 4236
				if ($Ps.north && (fix || state.north.tagName=="IFRAME"))                                                          // 4237
					$Ps.north.css("width", cssW($Ps.north, sC.innerWidth));                                                          // 4238
				if ($Ps.south && (fix || state.south.tagName=="IFRAME"))                                                          // 4239
					$Ps.south.css("width", cssW($Ps.south, sC.innerWidth));                                                          // 4240
			}                                                                                                                  // 4241
                                                                                                                      // 4242
			// resizeAll passes skipCallback because it triggers callbacks after ALL panes are resized                         // 4243
			if (!skipCallback && state.initialized)                                                                            // 4244
				_runCallbacks("onresize_end", pane);                                                                              // 4245
		});                                                                                                                 // 4246
	}                                                                                                                    // 4247
                                                                                                                      // 4248
                                                                                                                      // 4249
	/**                                                                                                                  // 4250
	* @see  window.onresize(), callbacks or custom code                                                                  // 4251
	* @param {(Object|boolean)=}	evt_or_refresh	If 'true', then also reset pane-positioning                              // 4252
	*/                                                                                                                   // 4253
,	resizeAll = function (evt_or_refresh) {                                                                             // 4254
		var	oldW	= sC.innerWidth                                                                                            // 4255
		,	oldH	= sC.innerHeight                                                                                             // 4256
		;                                                                                                                   // 4257
		// stopPropagation if called by trigger("layoutdestroy") - use evtPane utility                                      // 4258
		evtPane(evt_or_refresh);                                                                                            // 4259
                                                                                                                      // 4260
		// cannot size layout when 'container' is hidden or collapsed                                                       // 4261
		if (!$N.is(":visible")) return;                                                                                     // 4262
                                                                                                                      // 4263
		if (!state.initialized) {                                                                                           // 4264
			_initLayoutElements();                                                                                             // 4265
			return; // no need to resize since we just initialized!                                                            // 4266
		}                                                                                                                   // 4267
                                                                                                                      // 4268
		if (evt_or_refresh === true && $.isPlainObject(options.outset)) {                                                   // 4269
			// update container CSS in case outset option has changed                                                          // 4270
			$N.css( options.outset );                                                                                          // 4271
		}                                                                                                                   // 4272
		// UPDATE container dimensions                                                                                      // 4273
		$.extend(sC, elDims( $N, options.inset ));                                                                          // 4274
		if (!sC.outerHeight) return;                                                                                        // 4275
                                                                                                                      // 4276
		// if 'true' passed, refresh pane & handle positioning too                                                          // 4277
		if (evt_or_refresh === true) {                                                                                      // 4278
			setPanePosition();                                                                                                 // 4279
		}                                                                                                                   // 4280
                                                                                                                      // 4281
		// onresizeall_start will CANCEL resizing if returns false                                                          // 4282
		// state.container has already been set, so user can access this info for calcuations                               // 4283
		if (false === _runCallbacks("onresizeall_start")) return false;                                                     // 4284
                                                                                                                      // 4285
		var	// see if container is now 'smaller' than before                                                                // 4286
			shrunkH	= (sC.innerHeight < oldH)                                                                                  // 4287
		,	shrunkW	= (sC.innerWidth < oldW)                                                                                  // 4288
		,	$P, o, s                                                                                                          // 4289
		;                                                                                                                   // 4290
		// NOTE special order for sizing: S-N-E-W                                                                           // 4291
		$.each(["south","north","east","west"], function (i, pane) {                                                        // 4292
			if (!$Ps[pane]) return; // no pane - SKIP                                                                          // 4293
			o = options[pane];                                                                                                 // 4294
			s = state[pane];                                                                                                   // 4295
			if (s.autoResize && s.size != o.size) // resize pane to original size set in options                               // 4296
				sizePane(pane, o.size, true, true, true); // true=skipCallback/noAnimation/forceResize                            // 4297
			else {                                                                                                             // 4298
				setSizeLimits(pane);                                                                                              // 4299
				makePaneFit(pane, false, true, true); // true=skipCallback/forceResize                                            // 4300
			}                                                                                                                  // 4301
		});                                                                                                                 // 4302
                                                                                                                      // 4303
		sizeMidPanes("", true, true); // true=skipCallback/forceResize                                                      // 4304
		sizeHandles(); // reposition the toggler elements                                                                   // 4305
                                                                                                                      // 4306
		// trigger all individual pane callbacks AFTER layout has finished resizing                                         // 4307
		$.each(_c.allPanes, function (i, pane) {                                                                            // 4308
			$P = $Ps[pane];                                                                                                    // 4309
			if (!$P) return; // SKIP                                                                                           // 4310
			if (state[pane].isVisible) // undefined for non-existent panes                                                     // 4311
				_runCallbacks("onresize_end", pane); // callback - if exists                                                      // 4312
		});                                                                                                                 // 4313
                                                                                                                      // 4314
		_runCallbacks("onresizeall_end");                                                                                   // 4315
		//_triggerLayoutEvent(pane, 'resizeall');                                                                           // 4316
	}                                                                                                                    // 4317
                                                                                                                      // 4318
	/**                                                                                                                  // 4319
	* Whenever a pane resizes or opens that has a nested layout, trigger resizeAll                                       // 4320
	*                                                                                                                    // 4321
	* @param {(string|Object)}	evt_or_pane		The pane just resized or opened                                              // 4322
	*/                                                                                                                   // 4323
,	resizeChildren = function (evt_or_pane, skipRefresh) {                                                              // 4324
		var	pane = evtPane.call(this, evt_or_pane);                                                                         // 4325
                                                                                                                      // 4326
		if (!options[pane].resizeChildren) return;                                                                          // 4327
                                                                                                                      // 4328
		// ensure the pane-children are up-to-date                                                                          // 4329
		if (!skipRefresh) refreshChildren( pane );                                                                          // 4330
		var pC = children[pane];                                                                                            // 4331
		if ($.isPlainObject( pC )) {                                                                                        // 4332
			// resize one or more children                                                                                     // 4333
			$.each( pC, function (key, child) {                                                                                // 4334
				if (!child.destroyed) child.resizeAll();                                                                          // 4335
			});                                                                                                                // 4336
		}                                                                                                                   // 4337
	}                                                                                                                    // 4338
                                                                                                                      // 4339
	/**                                                                                                                  // 4340
	* IF pane has a content-div, then resize all elements inside pane to fit pane-height                                 // 4341
	*                                                                                                                    // 4342
	* @param {(string|Object)}	evt_or_panes		The pane(s) being resized                                                   // 4343
	* @param {boolean=}			[remeasure=false]	Should the content (header/footer) be remeasured?                            // 4344
	*/                                                                                                                   // 4345
,	sizeContent = function (evt_or_panes, remeasure) {                                                                  // 4346
		if (!isInitialized()) return;                                                                                       // 4347
                                                                                                                      // 4348
		var panes = evtPane.call(this, evt_or_panes);                                                                       // 4349
		panes = panes ? panes.split(",") : _c.allPanes;                                                                     // 4350
                                                                                                                      // 4351
		$.each(panes, function (idx, pane) {                                                                                // 4352
			var                                                                                                                // 4353
				$P	= $Ps[pane]                                                                                                    // 4354
			,	$C	= $Cs[pane]                                                                                                   // 4355
			,	o	= options[pane]                                                                                                // 4356
			,	s	= state[pane]                                                                                                  // 4357
			,	m	= s.content // m = measurements                                                                                // 4358
			;                                                                                                                  // 4359
			if (!$P || !$C || !$P.is(":visible")) return true; // NOT VISIBLE - skip                                           // 4360
                                                                                                                      // 4361
			// if content-element was REMOVED, update OR remove the pointer                                                    // 4362
			if (!$C.length) {                                                                                                  // 4363
				initContent(pane, false);	// false = do NOT sizeContent() - already there!                                        // 4364
				if (!$C) return;			// no replacement element found - pointer have been removed                                    // 4365
			}                                                                                                                  // 4366
                                                                                                                      // 4367
			// onsizecontent_start will CANCEL resizing if returns false                                                       // 4368
			if (false === _runCallbacks("onsizecontent_start", pane)) return;                                                  // 4369
                                                                                                                      // 4370
			// skip re-measuring offsets if live-resizing                                                                      // 4371
			if ((!s.isMoving && !s.isResizing) || o.liveContentResizing || remeasure || m.top == undefined) {                  // 4372
				_measure();                                                                                                       // 4373
				// if any footers are below pane-bottom, they may not measure correctly,                                          // 4374
				// so allow pane overflow and re-measure                                                                          // 4375
				if (m.hiddenFooters > 0 && $P.css("overflow") === "hidden") {                                                     // 4376
					$P.css("overflow", "visible");                                                                                   // 4377
					_measure(); // remeasure while overflowing                                                                       // 4378
					$P.css("overflow", "hidden");                                                                                    // 4379
				}                                                                                                                 // 4380
			}                                                                                                                  // 4381
			// NOTE: spaceAbove/Below *includes* the pane paddingTop/Bottom, but not pane.borders                              // 4382
			var newH = s.innerHeight - (m.spaceAbove - s.css.paddingTop) - (m.spaceBelow - s.css.paddingBottom);               // 4383
                                                                                                                      // 4384
			if (!$C.is(":visible") || m.height != newH) {                                                                      // 4385
				// size the Content element to fit new pane-size - will autoHide if not enough room                               // 4386
				setOuterHeight($C, newH, true); // true=autoHide                                                                  // 4387
				m.height = newH; // save new height                                                                               // 4388
			};                                                                                                                 // 4389
                                                                                                                      // 4390
			if (state.initialized)                                                                                             // 4391
				_runCallbacks("onsizecontent_end", pane);                                                                         // 4392
                                                                                                                      // 4393
			function _below ($E) {                                                                                             // 4394
				return max(s.css.paddingBottom, (parseInt($E.css("marginBottom"), 10) || 0));                                     // 4395
			};                                                                                                                 // 4396
                                                                                                                      // 4397
			function _measure () {                                                                                             // 4398
				var                                                                                                               // 4399
					ignore	= options[pane].contentIgnoreSelector                                                                     // 4400
				,	$Fs		= $C.nextAll().not(".ui-layout-mask").not(ignore || ":lt(0)") // not :lt(0) = ALL                          // 4401
				,	$Fs_vis	= $Fs.filter(':visible')                                                                                // 4402
				,	$F		= $Fs_vis.filter(':last')                                                                                   // 4403
				;                                                                                                                 // 4404
				m = {                                                                                                             // 4405
					top:			$C[0].offsetTop                                                                                           // 4406
				,	height:			$C.outerHeight()                                                                                      // 4407
				,	numFooters:		$Fs.length                                                                                         // 4408
				,	hiddenFooters:	$Fs.length - $Fs_vis.length                                                                      // 4409
				,	spaceBelow:		0 // correct if no content footer ($E)                                                             // 4410
				}                                                                                                                 // 4411
					m.spaceAbove	= m.top; // just for state - not used in calc                                                       // 4412
					m.bottom		= m.top + m.height;                                                                                    // 4413
				if ($F.length)                                                                                                    // 4414
					//spaceBelow = (LastFooter.top + LastFooter.height) [footerBottom] - Content.bottom + max(LastFooter.marginBottom, pane.paddingBotom)
					m.spaceBelow = ($F[0].offsetTop + $F.outerHeight()) - m.bottom + _below($F);                                     // 4416
				else // no footer - check marginBottom on Content element itself                                                  // 4417
					m.spaceBelow = _below($C);                                                                                       // 4418
			};                                                                                                                 // 4419
		});                                                                                                                 // 4420
	}                                                                                                                    // 4421
                                                                                                                      // 4422
                                                                                                                      // 4423
	/**                                                                                                                  // 4424
	* Called every time a pane is opened, closed, or resized to slide the togglers to 'center' and adjust their length if necessary
	*                                                                                                                    // 4426
	* @see  initHandles(), open(), close(), resizeAll()                                                                  // 4427
	* @param {(string|Object)=}		evt_or_panes	The pane(s) being resized                                                  // 4428
	*/                                                                                                                   // 4429
,	sizeHandles = function (evt_or_panes) {                                                                             // 4430
		var panes = evtPane.call(this, evt_or_panes)                                                                        // 4431
		panes = panes ? panes.split(",") : _c.borderPanes;                                                                  // 4432
                                                                                                                      // 4433
		$.each(panes, function (i, pane) {                                                                                  // 4434
			var                                                                                                                // 4435
				o	= options[pane]                                                                                                 // 4436
			,	s	= state[pane]                                                                                                  // 4437
			,	$P	= $Ps[pane]                                                                                                   // 4438
			,	$R	= $Rs[pane]                                                                                                   // 4439
			,	$T	= $Ts[pane]                                                                                                   // 4440
			,	$TC                                                                                                              // 4441
			;                                                                                                                  // 4442
			if (!$P || !$R) return;                                                                                            // 4443
                                                                                                                      // 4444
			var                                                                                                                // 4445
				dir			= _c[pane].dir                                                                                              // 4446
			,	_state		= (s.isClosed ? "_closed" : "_open")                                                                     // 4447
			,	spacing		= o["spacing"+ _state]                                                                                  // 4448
			,	togAlign	= o["togglerAlign"+ _state]                                                                             // 4449
			,	togLen		= o["togglerLength"+ _state]                                                                             // 4450
			,	paneLen                                                                                                          // 4451
			,	left                                                                                                             // 4452
			,	offset                                                                                                           // 4453
			,	CSS = {}                                                                                                         // 4454
			;                                                                                                                  // 4455
                                                                                                                      // 4456
			if (spacing === 0) {                                                                                               // 4457
				$R.hide();                                                                                                        // 4458
				return;                                                                                                           // 4459
			}                                                                                                                  // 4460
			else if (!s.noRoom && !s.isHidden) // skip if resizer was hidden for any reason                                    // 4461
				$R.show(); // in case was previously hidden                                                                       // 4462
                                                                                                                      // 4463
			// Resizer Bar is ALWAYS same width/height of pane it is attached to                                               // 4464
			if (dir === "horz") { // north/south                                                                               // 4465
				//paneLen = $P.outerWidth(); // s.outerWidth ||                                                                   // 4466
				paneLen = sC.innerWidth; // handle offscreen-panes                                                                // 4467
				s.resizerLength = paneLen;                                                                                        // 4468
				left = $.layout.cssNum($P, "left")                                                                                // 4469
				$R.css({                                                                                                          // 4470
					width:	cssW($R, paneLen) // account for borders & padding                                                        // 4471
				,	height:	cssH($R, spacing) // ditto                                                                              // 4472
				,	left:	left > -9999 ? left : sC.inset.left // handle offscreen-panes                                             // 4473
				});                                                                                                               // 4474
			}                                                                                                                  // 4475
			else { // east/west                                                                                                // 4476
				paneLen = $P.outerHeight(); // s.outerHeight ||                                                                   // 4477
				s.resizerLength = paneLen;                                                                                        // 4478
				$R.css({                                                                                                          // 4479
					height:	cssH($R, paneLen) // account for borders & padding                                                       // 4480
				,	width:	cssW($R, spacing) // ditto                                                                               // 4481
				,	top:	sC.inset.top + getPaneSize("north", true) // TODO: what if no North pane?                                  // 4482
				//,	top:	$.layout.cssNum($Ps["center"], "top")                                                                    // 4483
				});                                                                                                               // 4484
			}                                                                                                                  // 4485
                                                                                                                      // 4486
			// remove hover classes                                                                                            // 4487
			removeHover( o, $R );                                                                                              // 4488
                                                                                                                      // 4489
			if ($T) {                                                                                                          // 4490
				if (togLen === 0 || (s.isSliding && o.hideTogglerOnSlide)) {                                                      // 4491
					$T.hide(); // always HIDE the toggler when 'sliding'                                                             // 4492
					return;                                                                                                          // 4493
				}                                                                                                                 // 4494
				else                                                                                                              // 4495
					$T.show(); // in case was previously hidden                                                                      // 4496
                                                                                                                      // 4497
				if (!(togLen > 0) || togLen === "100%" || togLen > paneLen) {                                                     // 4498
					togLen = paneLen;                                                                                                // 4499
					offset = 0;                                                                                                      // 4500
				}                                                                                                                 // 4501
				else { // calculate 'offset' based on options.PANE.togglerAlign_open/closed                                       // 4502
					if (isStr(togAlign)) {                                                                                           // 4503
						switch (togAlign) {                                                                                             // 4504
							case "top":                                                                                                    // 4505
							case "left":	offset = 0;                                                                                       // 4506
											break;                                                                                                     // 4507
							case "bottom":                                                                                                 // 4508
							case "right":	offset = paneLen - togLen;                                                                       // 4509
											break;                                                                                                     // 4510
							case "middle":                                                                                                 // 4511
							case "center":                                                                                                 // 4512
							default:		offset = round((paneLen - togLen) / 2); // 'default' catches typos                                   // 4513
						}                                                                                                               // 4514
					}                                                                                                                // 4515
					else { // togAlign = number                                                                                      // 4516
						var x = parseInt(togAlign, 10); //                                                                              // 4517
						if (togAlign >= 0) offset = x;                                                                                  // 4518
						else offset = paneLen - togLen + x; // NOTE: x is negative!                                                     // 4519
					}                                                                                                                // 4520
				}                                                                                                                 // 4521
                                                                                                                      // 4522
				if (dir === "horz") { // north/south                                                                              // 4523
					var width = cssW($T, togLen);                                                                                    // 4524
					$T.css({                                                                                                         // 4525
						width:	width  // account for borders & padding                                                                  // 4526
					,	height:	cssH($T, spacing) // ditto                                                                             // 4527
					,	left:	offset // TODO: VERIFY that toggler  positions correctly for ALL values                                  // 4528
					,	top:	0                                                                                                         // 4529
					});                                                                                                              // 4530
					// CENTER the toggler content SPAN                                                                               // 4531
					$T.children(".content").each(function(){                                                                         // 4532
						$TC = $(this);                                                                                                  // 4533
						$TC.css("marginLeft", round((width-$TC.outerWidth())/2)); // could be negative                                  // 4534
					});                                                                                                              // 4535
				}                                                                                                                 // 4536
				else { // east/west                                                                                               // 4537
					var height = cssH($T, togLen);                                                                                   // 4538
					$T.css({                                                                                                         // 4539
						height:	height // account for borders & padding                                                                 // 4540
					,	width:	cssW($T, spacing) // ditto                                                                              // 4541
					,	top:	offset // POSITION the toggler                                                                            // 4542
					,	left:	0                                                                                                        // 4543
					});                                                                                                              // 4544
					// CENTER the toggler content SPAN                                                                               // 4545
					$T.children(".content").each(function(){                                                                         // 4546
						$TC = $(this);                                                                                                  // 4547
						$TC.css("marginTop", round((height-$TC.outerHeight())/2)); // could be negative                                 // 4548
					});                                                                                                              // 4549
				}                                                                                                                 // 4550
                                                                                                                      // 4551
				// remove ALL hover classes                                                                                       // 4552
				removeHover( 0, $T );                                                                                             // 4553
			}                                                                                                                  // 4554
                                                                                                                      // 4555
			// DONE measuring and sizing this resizer/toggler, so can be 'hidden' now                                          // 4556
			if (!state.initialized && (o.initHidden || s.isHidden)) {                                                          // 4557
				$R.hide();                                                                                                        // 4558
				if ($T) $T.hide();                                                                                                // 4559
			}                                                                                                                  // 4560
		});                                                                                                                 // 4561
	}                                                                                                                    // 4562
                                                                                                                      // 4563
                                                                                                                      // 4564
	/**                                                                                                                  // 4565
	* @param {(string|Object)}	evt_or_pane                                                                               // 4566
	*/                                                                                                                   // 4567
,	enableClosable = function (evt_or_pane) {                                                                           // 4568
		if (!isInitialized()) return;                                                                                       // 4569
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 4570
		,	$T	= $Ts[pane]                                                                                                    // 4571
		,	o	= options[pane]                                                                                                 // 4572
		;                                                                                                                   // 4573
		if (!$T) return;                                                                                                    // 4574
		o.closable = true;                                                                                                  // 4575
		$T	.bind("click."+ sID, function(evt){ evt.stopPropagation(); toggle(pane); })                                      // 4576
			.css("visibility", "visible")                                                                                      // 4577
			.css("cursor", "pointer")                                                                                          // 4578
			.attr("title", state[pane].isClosed ? o.tips.Open : o.tips.Close) // may be blank                                  // 4579
			.show();                                                                                                           // 4580
	}                                                                                                                    // 4581
	/**                                                                                                                  // 4582
	* @param {(string|Object)}	evt_or_pane                                                                               // 4583
	* @param {boolean=}			[hide=false]                                                                                   // 4584
	*/                                                                                                                   // 4585
,	disableClosable = function (evt_or_pane, hide) {                                                                    // 4586
		if (!isInitialized()) return;                                                                                       // 4587
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 4588
		,	$T	= $Ts[pane]                                                                                                    // 4589
		;                                                                                                                   // 4590
		if (!$T) return;                                                                                                    // 4591
		options[pane].closable = false;                                                                                     // 4592
		// is closable is disable, then pane MUST be open!                                                                  // 4593
		if (state[pane].isClosed) open(pane, false, true);                                                                  // 4594
		$T	.unbind("."+ sID)                                                                                                // 4595
			.css("visibility", hide ? "hidden" : "visible") // instead of hide(), which creates logic issues                   // 4596
			.css("cursor", "default")                                                                                          // 4597
			.attr("title", "");                                                                                                // 4598
	}                                                                                                                    // 4599
                                                                                                                      // 4600
                                                                                                                      // 4601
	/**                                                                                                                  // 4602
	* @param {(string|Object)}	evt_or_pane                                                                               // 4603
	*/                                                                                                                   // 4604
,	enableSlidable = function (evt_or_pane) {                                                                           // 4605
		if (!isInitialized()) return;                                                                                       // 4606
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 4607
		,	$R	= $Rs[pane]                                                                                                    // 4608
		;                                                                                                                   // 4609
		if (!$R || !$R.data('draggable')) return;                                                                           // 4610
		options[pane].slidable = true;                                                                                      // 4611
		if (state[pane].isClosed)                                                                                           // 4612
			bindStartSlidingEvents(pane, true);                                                                                // 4613
	}                                                                                                                    // 4614
	/**                                                                                                                  // 4615
	* @param {(string|Object)}	evt_or_pane                                                                               // 4616
	*/                                                                                                                   // 4617
,	disableSlidable = function (evt_or_pane) {                                                                          // 4618
		if (!isInitialized()) return;                                                                                       // 4619
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 4620
		,	$R	= $Rs[pane]                                                                                                    // 4621
		;                                                                                                                   // 4622
		if (!$R) return;                                                                                                    // 4623
		options[pane].slidable = false;                                                                                     // 4624
		if (state[pane].isSliding)                                                                                          // 4625
			close(pane, false, true);                                                                                          // 4626
		else {                                                                                                              // 4627
			bindStartSlidingEvents(pane, false);                                                                               // 4628
			$R	.css("cursor", "default")                                                                                       // 4629
				.attr("title", "");                                                                                               // 4630
			removeHover(null, $R[0]); // in case currently hovered                                                             // 4631
		}                                                                                                                   // 4632
	}                                                                                                                    // 4633
                                                                                                                      // 4634
                                                                                                                      // 4635
	/**                                                                                                                  // 4636
	* @param {(string|Object)}	evt_or_pane                                                                               // 4637
	*/                                                                                                                   // 4638
,	enableResizable = function (evt_or_pane) {                                                                          // 4639
		if (!isInitialized()) return;                                                                                       // 4640
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 4641
		,	$R	= $Rs[pane]                                                                                                    // 4642
		,	o	= options[pane]                                                                                                 // 4643
		;                                                                                                                   // 4644
		if (!$R || !$R.data('draggable')) return;                                                                           // 4645
		o.resizable = true;                                                                                                 // 4646
		$R.draggable("enable");                                                                                             // 4647
		if (!state[pane].isClosed)                                                                                          // 4648
			$R	.css("cursor", o.resizerCursor)                                                                                 // 4649
			 	.attr("title", o.tips.Resize);                                                                                   // 4650
	}                                                                                                                    // 4651
	/**                                                                                                                  // 4652
	* @param {(string|Object)}	evt_or_pane                                                                               // 4653
	*/                                                                                                                   // 4654
,	disableResizable = function (evt_or_pane) {                                                                         // 4655
		if (!isInitialized()) return;                                                                                       // 4656
		var	pane = evtPane.call(this, evt_or_pane)                                                                          // 4657
		,	$R	= $Rs[pane]                                                                                                    // 4658
		;                                                                                                                   // 4659
		if (!$R || !$R.data('draggable')) return;                                                                           // 4660
		options[pane].resizable = false;                                                                                    // 4661
		$R	.draggable("disable")                                                                                            // 4662
			.css("cursor", "default")                                                                                          // 4663
			.attr("title", "");                                                                                                // 4664
		removeHover(null, $R[0]); // in case currently hovered                                                              // 4665
	}                                                                                                                    // 4666
                                                                                                                      // 4667
                                                                                                                      // 4668
	/**                                                                                                                  // 4669
	* Move a pane from source-side (eg, west) to target-side (eg, east)                                                  // 4670
	* If pane exists on target-side, move that to source-side, ie, 'swap' the panes                                      // 4671
	*                                                                                                                    // 4672
	* @param {(string|Object)}	evt_or_pane1	The pane/edge being swapped                                                  // 4673
	* @param {string}			pane2			ditto                                                                                    // 4674
	*/                                                                                                                   // 4675
,	swapPanes = function (evt_or_pane1, pane2) {                                                                        // 4676
		if (!isInitialized()) return;                                                                                       // 4677
		var pane1 = evtPane.call(this, evt_or_pane1);                                                                       // 4678
		// change state.edge NOW so callbacks can know where pane is headed...                                              // 4679
		state[pane1].edge = pane2;                                                                                          // 4680
		state[pane2].edge = pane1;                                                                                          // 4681
		// run these even if NOT state.initialized                                                                          // 4682
		if (false === _runCallbacks("onswap_start", pane1)                                                                  // 4683
		 ||	false === _runCallbacks("onswap_start", pane2)                                                                  // 4684
		) {                                                                                                                 // 4685
			state[pane1].edge = pane1; // reset                                                                                // 4686
			state[pane2].edge = pane2;                                                                                         // 4687
			return;                                                                                                            // 4688
		}                                                                                                                   // 4689
                                                                                                                      // 4690
		var                                                                                                                 // 4691
			oPane1	= copy( pane1 )                                                                                             // 4692
		,	oPane2	= copy( pane2 )                                                                                            // 4693
		,	sizes	= {}                                                                                                        // 4694
		;                                                                                                                   // 4695
		sizes[pane1] = oPane1 ? oPane1.state.size : 0;                                                                      // 4696
		sizes[pane2] = oPane2 ? oPane2.state.size : 0;                                                                      // 4697
                                                                                                                      // 4698
		// clear pointers & state                                                                                           // 4699
		$Ps[pane1] = false;                                                                                                 // 4700
		$Ps[pane2] = false;                                                                                                 // 4701
		state[pane1] = {};                                                                                                  // 4702
		state[pane2] = {};                                                                                                  // 4703
		                                                                                                                    // 4704
		// ALWAYS remove the resizer & toggler elements                                                                     // 4705
		if ($Ts[pane1]) $Ts[pane1].remove();                                                                                // 4706
		if ($Ts[pane2]) $Ts[pane2].remove();                                                                                // 4707
		if ($Rs[pane1]) $Rs[pane1].remove();                                                                                // 4708
		if ($Rs[pane2]) $Rs[pane2].remove();                                                                                // 4709
		$Rs[pane1] = $Rs[pane2] = $Ts[pane1] = $Ts[pane2] = false;                                                          // 4710
                                                                                                                      // 4711
		// transfer element pointers and data to NEW Layout keys                                                            // 4712
		move( oPane1, pane2 );                                                                                              // 4713
		move( oPane2, pane1 );                                                                                              // 4714
                                                                                                                      // 4715
		// cleanup objects                                                                                                  // 4716
		oPane1 = oPane2 = sizes = null;                                                                                     // 4717
                                                                                                                      // 4718
		// make panes 'visible' again                                                                                       // 4719
		if ($Ps[pane1]) $Ps[pane1].css(_c.visible);                                                                         // 4720
		if ($Ps[pane2]) $Ps[pane2].css(_c.visible);                                                                         // 4721
                                                                                                                      // 4722
		// fix any size discrepancies caused by swap                                                                        // 4723
		resizeAll();                                                                                                        // 4724
                                                                                                                      // 4725
		// run these even if NOT state.initialized                                                                          // 4726
		_runCallbacks("onswap_end", pane1);                                                                                 // 4727
		_runCallbacks("onswap_end", pane2);                                                                                 // 4728
                                                                                                                      // 4729
		return;                                                                                                             // 4730
                                                                                                                      // 4731
		function copy (n) { // n = pane                                                                                     // 4732
			var                                                                                                                // 4733
				$P	= $Ps[n]                                                                                                       // 4734
			,	$C	= $Cs[n]                                                                                                      // 4735
			;                                                                                                                  // 4736
			return !$P ? false : {                                                                                             // 4737
				pane:		n                                                                                                          // 4738
			,	P:			$P ? $P[0] : false                                                                                          // 4739
			,	C:			$C ? $C[0] : false                                                                                          // 4740
			,	state:		$.extend(true, {}, state[n])                                                                             // 4741
			,	options:	$.extend(true, {}, options[n])                                                                          // 4742
			}                                                                                                                  // 4743
		};                                                                                                                  // 4744
                                                                                                                      // 4745
		function move (oPane, pane) {                                                                                       // 4746
			if (!oPane) return;                                                                                                // 4747
			var                                                                                                                // 4748
				P		= oPane.P                                                                                                      // 4749
			,	C		= oPane.C                                                                                                     // 4750
			,	oldPane = oPane.pane                                                                                             // 4751
			,	c		= _c[pane]                                                                                                    // 4752
			//	save pane-options that should be retained                                                                       // 4753
			,	s		= $.extend(true, {}, state[pane])                                                                             // 4754
			,	o		= options[pane]                                                                                               // 4755
			//	RETAIN side-specific FX Settings - more below                                                                   // 4756
			,	fx		= { resizerCursor: o.resizerCursor }                                                                         // 4757
			,	re, size, pos                                                                                                    // 4758
			;                                                                                                                  // 4759
			$.each("fxName,fxSpeed,fxSettings".split(","), function (i, k) {                                                   // 4760
				fx[k +"_open"]  = o[k +"_open"];                                                                                  // 4761
				fx[k +"_close"] = o[k +"_close"];                                                                                 // 4762
				fx[k +"_size"]  = o[k +"_size"];                                                                                  // 4763
			});                                                                                                                // 4764
                                                                                                                      // 4765
			// update object pointers and attributes                                                                           // 4766
			$Ps[pane] = $(P)                                                                                                   // 4767
				.data({                                                                                                           // 4768
					layoutPane:		Instance[pane]	// NEW pointer to pane-alias-object                                                  // 4769
				,	layoutEdge:		pane                                                                                               // 4770
				})                                                                                                                // 4771
				.css(_c.hidden)                                                                                                   // 4772
				.css(c.cssReq)                                                                                                    // 4773
			;                                                                                                                  // 4774
			$Cs[pane] = C ? $(C) : false;                                                                                      // 4775
                                                                                                                      // 4776
			// set options and state                                                                                           // 4777
			options[pane]	= $.extend(true, {}, oPane.options, fx);                                                             // 4778
			state[pane]		= $.extend(true, {}, oPane.state);                                                                    // 4779
                                                                                                                      // 4780
			// change classNames on the pane, eg: ui-layout-pane-east ==> ui-layout-pane-west                                  // 4781
			re = new RegExp(o.paneClass +"-"+ oldPane, "g");                                                                   // 4782
			P.className = P.className.replace(re, o.paneClass +"-"+ pane);                                                     // 4783
                                                                                                                      // 4784
			// ALWAYS regenerate the resizer & toggler elements                                                                // 4785
			initHandles(pane); // create the required resizer & toggler                                                        // 4786
                                                                                                                      // 4787
			// if moving to different orientation, then keep 'target' pane size                                                // 4788
			if (c.dir != _c[oldPane].dir) {                                                                                    // 4789
				size = sizes[pane] || 0;                                                                                          // 4790
				setSizeLimits(pane); // update pane-state                                                                         // 4791
				size = max(size, state[pane].minSize);                                                                            // 4792
				// use manualSizePane to disable autoResize - not useful after panes are swapped                                  // 4793
				manualSizePane(pane, size, true, true); // true/true = skipCallback/noAnimation                                   // 4794
			}                                                                                                                  // 4795
			else // move the resizer here                                                                                      // 4796
				$Rs[pane].css(c.side, sC.inset[c.side] + (state[pane].isVisible ? getPaneSize(pane) : 0));                        // 4797
                                                                                                                      // 4798
                                                                                                                      // 4799
			// ADD CLASSNAMES & SLIDE-BINDINGS                                                                                 // 4800
			if (oPane.state.isVisible && !s.isVisible)                                                                         // 4801
				setAsOpen(pane, true); // true = skipCallback                                                                     // 4802
			else {                                                                                                             // 4803
				setAsClosed(pane);                                                                                                // 4804
				bindStartSlidingEvents(pane, true); // will enable events IF option is set                                        // 4805
			}                                                                                                                  // 4806
                                                                                                                      // 4807
			// DESTROY the object                                                                                              // 4808
			oPane = null;                                                                                                      // 4809
		};                                                                                                                  // 4810
	}                                                                                                                    // 4811
                                                                                                                      // 4812
                                                                                                                      // 4813
	/**                                                                                                                  // 4814
	* INTERNAL method to sync pin-buttons when pane is opened or closed                                                  // 4815
	* Unpinned means the pane is 'sliding' - ie, over-top of the adjacent panes                                          // 4816
	*                                                                                                                    // 4817
	* @see  open(), setAsOpen(), setAsClosed()                                                                           // 4818
	* @param {string}	pane   These are the params returned to callbacks by layout()                                      // 4819
	* @param {boolean}	doPin  True means set the pin 'down', False means 'up'                                            // 4820
	*/                                                                                                                   // 4821
,	syncPinBtns = function (pane, doPin) {                                                                              // 4822
		if ($.layout.plugins.buttons)                                                                                       // 4823
			$.each(state[pane].pins, function (i, selector) {                                                                  // 4824
				$.layout.buttons.setPinState(Instance, $(selector), pane, doPin);                                                 // 4825
			});                                                                                                                // 4826
	}                                                                                                                    // 4827
                                                                                                                      // 4828
;	// END var DECLARATIONS                                                                                             // 4829
                                                                                                                      // 4830
	/**                                                                                                                  // 4831
	* Capture keys when enableCursorHotkey - toggle pane if hotkey pressed                                               // 4832
	*                                                                                                                    // 4833
	* @see  document.keydown()                                                                                           // 4834
	*/                                                                                                                   // 4835
	function keyDown (evt) {                                                                                             // 4836
		if (!evt) return true;                                                                                              // 4837
		var code = evt.keyCode;                                                                                             // 4838
		if (code < 33) return true; // ignore special keys: ENTER, TAB, etc                                                 // 4839
                                                                                                                      // 4840
		var                                                                                                                 // 4841
			PANE = {                                                                                                           // 4842
				38: "north" // Up Cursor	- $.ui.keyCode.UP                                                                        // 4843
			,	40: "south" // Down Cursor	- $.ui.keyCode.DOWN                                                                   // 4844
			,	37: "west"  // Left Cursor	- $.ui.keyCode.LEFT                                                                   // 4845
			,	39: "east"  // Right Cursor	- $.ui.keyCode.RIGHT                                                                 // 4846
			}                                                                                                                  // 4847
		,	ALT		= evt.altKey // no worky!                                                                                    // 4848
		,	SHIFT	= evt.shiftKey                                                                                              // 4849
		,	CTRL	= evt.ctrlKey                                                                                                // 4850
		,	CURSOR	= (CTRL && code >= 37 && code <= 40)                                                                       // 4851
		,	o, k, m, pane                                                                                                     // 4852
		;                                                                                                                   // 4853
                                                                                                                      // 4854
		if (CURSOR && options[PANE[code]].enableCursorHotkey) // valid cursor-hotkey                                        // 4855
			pane = PANE[code];                                                                                                 // 4856
		else if (CTRL || SHIFT) // check to see if this matches a custom-hotkey                                             // 4857
			$.each(_c.borderPanes, function (i, p) { // loop each pane to check its hotkey                                     // 4858
				o = options[p];                                                                                                   // 4859
				k = o.customHotkey;                                                                                               // 4860
				m = o.customHotkeyModifier; // if missing or invalid, treated as "CTRL+SHIFT"                                     // 4861
				if ((SHIFT && m=="SHIFT") || (CTRL && m=="CTRL") || (CTRL && SHIFT)) { // Modifier matches                        // 4862
					if (k && code === (isNaN(k) || k <= 9 ? k.toUpperCase().charCodeAt(0) : k)) { // Key matches                     // 4863
						pane = p;                                                                                                       // 4864
						return false; // BREAK                                                                                          // 4865
					}                                                                                                                // 4866
				}                                                                                                                 // 4867
			});                                                                                                                // 4868
                                                                                                                      // 4869
		// validate pane                                                                                                    // 4870
		if (!pane || !$Ps[pane] || !options[pane].closable || state[pane].isHidden)                                         // 4871
			return true;                                                                                                       // 4872
                                                                                                                      // 4873
		toggle(pane);                                                                                                       // 4874
                                                                                                                      // 4875
		evt.stopPropagation();                                                                                              // 4876
		evt.returnValue = false; // CANCEL key                                                                              // 4877
		return false;                                                                                                       // 4878
	};                                                                                                                   // 4879
                                                                                                                      // 4880
                                                                                                                      // 4881
/*                                                                                                                    // 4882
 * ######################################                                                                             // 4883
 *	UTILITY METHODS                                                                                                    // 4884
 *	called externally or by initButtons                                                                                // 4885
 * ######################################                                                                             // 4886
 */                                                                                                                   // 4887
                                                                                                                      // 4888
	/**                                                                                                                  // 4889
	* Change/reset a pane overflow setting & zIndex to allow popups/drop-downs to work                                   // 4890
	*                                                                                                                    // 4891
	* @param {Object=}   [el]	(optional) Can also be 'bound' to a click, mouseOver, or other event                       // 4892
	*/                                                                                                                   // 4893
	function allowOverflow (el) {                                                                                        // 4894
		if (!isInitialized()) return;                                                                                       // 4895
		if (this && this.tagName) el = this; // BOUND to element                                                            // 4896
		var $P;                                                                                                             // 4897
		if (isStr(el))                                                                                                      // 4898
			$P = $Ps[el];                                                                                                      // 4899
		else if ($(el).data("layoutRole"))                                                                                  // 4900
			$P = $(el);                                                                                                        // 4901
		else                                                                                                                // 4902
			$(el).parents().each(function(){                                                                                   // 4903
				if ($(this).data("layoutRole")) {                                                                                 // 4904
					$P = $(this);                                                                                                    // 4905
					return false; // BREAK                                                                                           // 4906
				}                                                                                                                 // 4907
			});                                                                                                                // 4908
		if (!$P || !$P.length) return; // INVALID                                                                           // 4909
                                                                                                                      // 4910
		var                                                                                                                 // 4911
			pane	= $P.data("layoutEdge")                                                                                       // 4912
		,	s		= state[pane]                                                                                                  // 4913
		;                                                                                                                   // 4914
                                                                                                                      // 4915
		// if pane is already raised, then reset it before doing it again!                                                  // 4916
		// this would happen if allowOverflow is attached to BOTH the pane and an element                                   // 4917
		if (s.cssSaved)                                                                                                     // 4918
			resetOverflow(pane); // reset previous CSS before continuing                                                       // 4919
                                                                                                                      // 4920
		// if pane is raised by sliding or resizing, or its closed, then abort                                              // 4921
		if (s.isSliding || s.isResizing || s.isClosed) {                                                                    // 4922
			s.cssSaved = false;                                                                                                // 4923
			return;                                                                                                            // 4924
		}                                                                                                                   // 4925
                                                                                                                      // 4926
		var                                                                                                                 // 4927
			newCSS	= { zIndex: (options.zIndexes.resizer_normal + 1) }                                                         // 4928
		,	curCSS	= {}                                                                                                       // 4929
		,	of		= $P.css("overflow")                                                                                          // 4930
		,	ofX		= $P.css("overflowX")                                                                                        // 4931
		,	ofY		= $P.css("overflowY")                                                                                        // 4932
		;                                                                                                                   // 4933
		// determine which, if any, overflow settings need to be changed                                                    // 4934
		if (of != "visible") {                                                                                              // 4935
			curCSS.overflow = of;                                                                                              // 4936
			newCSS.overflow = "visible";                                                                                       // 4937
		}                                                                                                                   // 4938
		if (ofX && !ofX.match(/(visible|auto)/)) {                                                                          // 4939
			curCSS.overflowX = ofX;                                                                                            // 4940
			newCSS.overflowX = "visible";                                                                                      // 4941
		}                                                                                                                   // 4942
		if (ofY && !ofY.match(/(visible|auto)/)) {                                                                          // 4943
			curCSS.overflowY = ofX;                                                                                            // 4944
			newCSS.overflowY = "visible";                                                                                      // 4945
		}                                                                                                                   // 4946
                                                                                                                      // 4947
		// save the current overflow settings - even if blank!                                                              // 4948
		s.cssSaved = curCSS;                                                                                                // 4949
                                                                                                                      // 4950
		// apply new CSS to raise zIndex and, if necessary, make overflow 'visible'                                         // 4951
		$P.css( newCSS );                                                                                                   // 4952
                                                                                                                      // 4953
		// make sure the zIndex of all other panes is normal                                                                // 4954
		$.each(_c.allPanes, function(i, p) {                                                                                // 4955
			if (p != pane) resetOverflow(p);                                                                                   // 4956
		});                                                                                                                 // 4957
                                                                                                                      // 4958
	};                                                                                                                   // 4959
	/**                                                                                                                  // 4960
	* @param {Object=}   [el]	(optional) Can also be 'bound' to a click, mouseOver, or other event                       // 4961
	*/                                                                                                                   // 4962
	function resetOverflow (el) {                                                                                        // 4963
		if (!isInitialized()) return;                                                                                       // 4964
		if (this && this.tagName) el = this; // BOUND to element                                                            // 4965
		var $P;                                                                                                             // 4966
		if (isStr(el))                                                                                                      // 4967
			$P = $Ps[el];                                                                                                      // 4968
		else if ($(el).data("layoutRole"))                                                                                  // 4969
			$P = $(el);                                                                                                        // 4970
		else                                                                                                                // 4971
			$(el).parents().each(function(){                                                                                   // 4972
				if ($(this).data("layoutRole")) {                                                                                 // 4973
					$P = $(this);                                                                                                    // 4974
					return false; // BREAK                                                                                           // 4975
				}                                                                                                                 // 4976
			});                                                                                                                // 4977
		if (!$P || !$P.length) return; // INVALID                                                                           // 4978
                                                                                                                      // 4979
		var                                                                                                                 // 4980
			pane	= $P.data("layoutEdge")                                                                                       // 4981
		,	s		= state[pane]                                                                                                  // 4982
		,	CSS		= s.cssSaved || {}                                                                                           // 4983
		;                                                                                                                   // 4984
		// reset the zIndex                                                                                                 // 4985
		if (!s.isSliding && !s.isResizing)                                                                                  // 4986
			$P.css("zIndex", options.zIndexes.pane_normal);                                                                    // 4987
                                                                                                                      // 4988
		// reset Overflow - if necessary                                                                                    // 4989
		$P.css( CSS );                                                                                                      // 4990
                                                                                                                      // 4991
		// clear var                                                                                                        // 4992
		s.cssSaved = false;                                                                                                 // 4993
	};                                                                                                                   // 4994
                                                                                                                      // 4995
/*                                                                                                                    // 4996
 * #####################                                                                                              // 4997
 * CREATE/RETURN LAYOUT                                                                                               // 4998
 * #####################                                                                                              // 4999
 */                                                                                                                   // 5000
                                                                                                                      // 5001
	// validate that container exists                                                                                    // 5002
	var $N = $(this).eq(0); // FIRST matching Container element                                                          // 5003
	if (!$N.length) {                                                                                                    // 5004
		return _log( options.errors.containerMissing );                                                                     // 5005
	};                                                                                                                   // 5006
                                                                                                                      // 5007
	// Users retrieve Instance of a layout with: $N.layout() OR $N.data("layout")                                        // 5008
	// return the Instance-pointer if layout has already been initialized                                                // 5009
	if ($N.data("layoutContainer") && $N.data("layout"))                                                                 // 5010
		return $N.data("layout"); // cached pointer                                                                         // 5011
                                                                                                                      // 5012
	// init global vars                                                                                                  // 5013
	var                                                                                                                  // 5014
		$Ps	= {}	// Panes x5		- set in initPanes()                                                                          // 5015
	,	$Cs	= {}	// Content x5	- set in initPanes()                                                                        // 5016
	,	$Rs	= {}	// Resizers x4	- set in initHandles()                                                                     // 5017
	,	$Ts	= {}	// Togglers x4	- set in initHandles()                                                                     // 5018
	,	$Ms	= $([])	// Masks - up to 2 masks per pane (IFRAME + DIV)                                                       // 5019
	//	aliases for code brevity                                                                                          // 5020
	,	sC	= state.container // alias for easy access to 'container dimensions'                                            // 5021
	,	sID	= state.id // alias for unique layout ID/namespace - eg: "layout435"                                           // 5022
	;                                                                                                                    // 5023
                                                                                                                      // 5024
	// create Instance object to expose data & option Properties, and primary action Methods                             // 5025
	var Instance = {                                                                                                     // 5026
	//	layout data                                                                                                       // 5027
		options:			options			// property - options hash                                                                     // 5028
	,	state:				state			// property - dimensions hash                                                                    // 5029
	//	object pointers                                                                                                   // 5030
	,	container:			$N				// property - object pointers for layout container                                              // 5031
	,	panes:				$Ps				// property - object pointers for ALL Panes: panes.north, panes.center                            // 5032
	,	contents:			$Cs				// property - object pointers for ALL Content: contents.north, contents.center                  // 5033
	,	resizers:			$Rs				// property - object pointers for ALL Resizers, eg: resizers.north                              // 5034
	,	togglers:			$Ts				// property - object pointers for ALL Togglers, eg: togglers.north                              // 5035
	//	border-pane open/close                                                                                            // 5036
	,	hide:				hide			// method - ditto                                                                                  // 5037
	,	show:				show			// method - ditto                                                                                  // 5038
	,	toggle:				toggle			// method - pass a 'pane' ("north", "west", etc)                                               // 5039
	,	open:				open			// method - ditto                                                                                  // 5040
	,	close:				close			// method - ditto                                                                                // 5041
	,	slideOpen:			slideOpen		// method - ditto                                                                          // 5042
	,	slideClose:			slideClose		// method - ditto                                                                        // 5043
	,	slideToggle:		slideToggle		// method - ditto                                                                       // 5044
	//	pane actions                                                                                                      // 5045
	,	setSizeLimits:		setSizeLimits	// method - pass a 'pane' - update state min/max data                                // 5046
	,	_sizePane:			sizePane		// method -intended for user by plugins only!                                               // 5047
	,	sizePane:			manualSizePane	// method - pass a 'pane' AND an 'outer-size' in pixels or percent, or 'auto'           // 5048
	,	sizeContent:		sizeContent		// method - pass a 'pane'                                                               // 5049
	,	swapPanes:			swapPanes		// method - pass TWO 'panes' - will swap them                                              // 5050
	,	showMasks:			showMasks		// method - pass a 'pane' OR list of panes - default = all panes with mask option set      // 5051
	,	hideMasks:			hideMasks		// method - ditto'                                                                         // 5052
	//	pane element methods                                                                                              // 5053
	,	initContent:		initContent		// method - ditto                                                                       // 5054
	,	addPane:			addPane			// method - pass a 'pane'                                                                     // 5055
	,	removePane:			removePane		// method - pass a 'pane' to remove from layout, add 'true' to delete the pane-elem      // 5056
	,	createChildren:		createChildren	// method - pass a 'pane' and (optional) layout-options (OVERRIDES options[pane].children
	,	refreshChildren:	refreshChildren	// method - pass a 'pane' and a layout-instance                                   // 5058
	//	special pane option setting                                                                                       // 5059
	,	enableClosable:		enableClosable	// method - pass a 'pane'                                                          // 5060
	,	disableClosable:	disableClosable	// method - ditto                                                                 // 5061
	,	enableSlidable:		enableSlidable	// method - ditto                                                                  // 5062
	,	disableSlidable:	disableSlidable	// method - ditto                                                                 // 5063
	,	enableResizable:	enableResizable	// method - ditto                                                                 // 5064
	,	disableResizable:	disableResizable// method - ditto                                                                // 5065
	//	utility methods for panes                                                                                         // 5066
	,	allowOverflow:		allowOverflow	// utility - pass calling element (this)                                             // 5067
	,	resetOverflow:		resetOverflow	// utility - ditto                                                                   // 5068
	//	layout control                                                                                                    // 5069
	,	destroy:			destroy			// method - no parameters                                                                     // 5070
	,	initPanes:			isInitialized	// method - no parameters                                                               // 5071
	,	resizeAll:			resizeAll		// method - no parameters                                                                  // 5072
	//	callback triggering                                                                                               // 5073
	,	runCallbacks:		_runCallbacks	// method - pass evtName & pane (if a pane-event), eg: trigger("onopen", "west")      // 5074
	//	alias collections of options, state and children - created in addPane and extended elsewhere                      // 5075
	,	hasParentLayout:	false			// set by initContainer()                                                                 // 5076
	,	children:			children		// pointers to child-layouts, eg: Instance.children.west.layoutName                          // 5077
	,	north:				false			// alias group: { name: pane, pane: $Ps[pane], options: options[pane], state: state[pane], children: children[pane] }
	,	south:				false			// ditto                                                                                         // 5079
	,	west:				false			// ditto                                                                                          // 5080
	,	east:				false			// ditto                                                                                          // 5081
	,	center:				false			// ditto                                                                                        // 5082
	};                                                                                                                   // 5083
                                                                                                                      // 5084
	// create the border layout NOW                                                                                      // 5085
	if (_create() === 'cancel') // onload_start callback returned false to CANCEL layout creation                        // 5086
		return null;                                                                                                        // 5087
	else // true OR false -- if layout-elements did NOT init (hidden or do not exist), can auto-init later               // 5088
		return Instance; // return the Instance object                                                                      // 5089
                                                                                                                      // 5090
}                                                                                                                     // 5091
                                                                                                                      // 5092
                                                                                                                      // 5093
})( jQuery );                                                                                                         // 5094
// END Layout - keep internal vars internal!                                                                          // 5095
                                                                                                                      // 5096
                                                                                                                      // 5097
                                                                                                                      // 5098
// START Plugins - shared wrapper, no global vars                                                                     // 5099
(function ($) {                                                                                                       // 5100
                                                                                                                      // 5101
                                                                                                                      // 5102
/**                                                                                                                   // 5103
 * jquery.layout.state 1.0                                                                                            // 5104
 * $Date: 2011-07-16 08:00:00 (Sat, 16 July 2011) $                                                                   // 5105
 *                                                                                                                    // 5106
 * Copyright (c) 2012                                                                                                 // 5107
 *   Kevin Dalman (http://allpro.net)                                                                                 // 5108
 *                                                                                                                    // 5109
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)                                                 // 5110
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.                                             // 5111
 *                                                                                                                    // 5112
 * @requires: UI Layout 1.3.0.rc30.1 or higher                                                                        // 5113
 * @requires: $.ui.cookie (above)                                                                                     // 5114
 *                                                                                                                    // 5115
 * @see: http://groups.google.com/group/jquery-ui-layout                                                              // 5116
 */                                                                                                                   // 5117
/*                                                                                                                    // 5118
 *	State-management options stored in options.stateManagement, which includes a .cookie hash                          // 5119
 *	Default options saves ALL KEYS for ALL PANES, ie: pane.size, pane.isClosed, pane.isHidden                          // 5120
 *                                                                                                                    // 5121
 *	// STATE/COOKIE OPTIONS                                                                                            // 5122
 *	@example $(el).layout({                                                                                            // 5123
				stateManagement: {                                                                                                // 5124
					enabled:	true                                                                                                    // 5125
				,	stateKeys:	"east.size,west.size,east.isClosed,west.isClosed"                                                    // 5126
				,	cookie:		{ name: "appLayout", path: "/" }                                                                       // 5127
				}                                                                                                                 // 5128
			})                                                                                                                 // 5129
 *	@example $(el).layout({ stateManagement__enabled: true }) // enable auto-state-management using cookies            // 5130
 *	@example $(el).layout({ stateManagement__cookie: { name: "appLayout", path: "/" } })                               // 5131
 *	@example $(el).layout({ stateManagement__cookie__name: "appLayout", stateManagement__cookie__path: "/" })          // 5132
 *                                                                                                                    // 5133
 *	// STATE/COOKIE METHODS                                                                                            // 5134
 *	@example myLayout.saveCookie( "west.isClosed,north.size,south.isHidden", {expires: 7} );                           // 5135
 *	@example myLayout.loadCookie();                                                                                    // 5136
 *	@example myLayout.deleteCookie();                                                                                  // 5137
 *	@example var JSON = myLayout.readState();	// CURRENT Layout State                                                  // 5138
 *	@example var JSON = myLayout.readCookie();	// SAVED Layout State (from cookie)                                     // 5139
 *	@example var JSON = myLayout.state.stateData;	// LAST LOADED Layout State (cookie saved in layout.state hash)      // 5140
 *                                                                                                                    // 5141
 *	CUSTOM STATE-MANAGEMENT (eg, saved in a database)                                                                  // 5142
 *	@example var JSON = myLayout.readState( "west.isClosed,north.size,south.isHidden" );                               // 5143
 *	@example myLayout.loadState( JSON );                                                                               // 5144
 */                                                                                                                   // 5145
                                                                                                                      // 5146
/**                                                                                                                   // 5147
 *	UI COOKIE UTILITY                                                                                                  // 5148
 *                                                                                                                    // 5149
 *	A $.cookie OR $.ui.cookie namespace *should be standard*, but until then...                                        // 5150
 *	This creates $.ui.cookie so Layout does not need the cookie.jquery.js plugin                                       // 5151
 *	NOTE: This utility is REQUIRED by the layout.state plugin                                                          // 5152
 *                                                                                                                    // 5153
 *	Cookie methods in Layout are created as part of State Management                                                   // 5154
 */                                                                                                                   // 5155
if (!$.ui) $.ui = {};                                                                                                 // 5156
$.ui.cookie = {                                                                                                       // 5157
                                                                                                                      // 5158
	// cookieEnabled is not in DOM specs, but DOES works in all browsers,including IE6                                   // 5159
	acceptsCookies: !!navigator.cookieEnabled                                                                            // 5160
                                                                                                                      // 5161
,	read: function (name) {                                                                                             // 5162
		var	c		= document.cookie                                                                                            // 5163
		,	cs		= c ? c.split(';') : []                                                                                       // 5164
		,	pair	// loop var                                                                                                  // 5165
		;                                                                                                                   // 5166
		for (var i=0, n=cs.length; i < n; i++) {                                                                            // 5167
			pair = $.trim(cs[i]).split('='); // name=value pair                                                                // 5168
			if (pair[0] == name) // found the layout cookie                                                                    // 5169
				return decodeURIComponent(pair[1]);                                                                               // 5170
		}                                                                                                                   // 5171
		return null;                                                                                                        // 5172
	}                                                                                                                    // 5173
                                                                                                                      // 5174
,	write: function (name, val, cookieOpts) {                                                                           // 5175
		var	params	= ""                                                                                                     // 5176
		,	date	= ""                                                                                                         // 5177
		,	clear	= false                                                                                                     // 5178
		,	o		= cookieOpts || {}                                                                                             // 5179
		,	x		= o.expires  || null                                                                                           // 5180
		,	t		= $.type(x)                                                                                                    // 5181
		;                                                                                                                   // 5182
		if (t === "date")                                                                                                   // 5183
			date = x;                                                                                                          // 5184
		else if (t === "string" && x > 0) {                                                                                 // 5185
			x = parseInt(x,10);                                                                                                // 5186
			t = "number";                                                                                                      // 5187
		}                                                                                                                   // 5188
		if (t === "number") {                                                                                               // 5189
			date = new Date();                                                                                                 // 5190
			if (x > 0)                                                                                                         // 5191
				date.setDate(date.getDate() + x);                                                                                 // 5192
			else {                                                                                                             // 5193
				date.setFullYear(1970);                                                                                           // 5194
				clear = true;                                                                                                     // 5195
			}                                                                                                                  // 5196
		}                                                                                                                   // 5197
		if (date)		params += ";expires="+ date.toUTCString();                                                               // 5198
		if (o.path)		params += ";path="+ o.path;                                                                            // 5199
		if (o.domain)	params += ";domain="+ o.domain;                                                                       // 5200
		if (o.secure)	params += ";secure";                                                                                  // 5201
		document.cookie = name +"="+ (clear ? "" : encodeURIComponent( val )) + params; // write or clear cookie            // 5202
	}                                                                                                                    // 5203
                                                                                                                      // 5204
,	clear: function (name) {                                                                                            // 5205
		$.ui.cookie.write(name, "", {expires: -1});                                                                         // 5206
	}                                                                                                                    // 5207
                                                                                                                      // 5208
};                                                                                                                    // 5209
// if cookie.jquery.js is not loaded, create an alias to replicate it                                                 // 5210
// this may be useful to other plugins or code dependent on that plugin                                               // 5211
if (!$.cookie) $.cookie = function (k, v, o) {                                                                        // 5212
	var C = $.ui.cookie;                                                                                                 // 5213
	if (v === null)                                                                                                      // 5214
		C.clear(k);                                                                                                         // 5215
	else if (v === undefined)                                                                                            // 5216
		return C.read(k);                                                                                                   // 5217
	else                                                                                                                 // 5218
		C.write(k, v, o);                                                                                                   // 5219
};                                                                                                                    // 5220
                                                                                                                      // 5221
                                                                                                                      // 5222
// tell Layout that the state plugin is available                                                                     // 5223
$.layout.plugins.stateManagement = true;                                                                              // 5224
                                                                                                                      // 5225
//	Add State-Management options to layout.defaults                                                                    // 5226
$.layout.config.optionRootKeys.push("stateManagement");                                                               // 5227
$.layout.defaults.stateManagement = {                                                                                 // 5228
	enabled:		false	// true = enable state-management, even if not using cookies                                         // 5229
,	autoSave:		true	// Save a state-cookie when page exits?                                                             // 5230
,	autoLoad:		true	// Load the state-cookie when Layout inits?                                                         // 5231
,	animateLoad:	true	// animate panes when loading state into an active layout                                         // 5232
,	includeChildren: true	// recurse into child layouts to include their state as well                                  // 5233
	// List state-data to save - must be pane-specific                                                                   // 5234
,	stateKeys:	"north.size,south.size,east.size,west.size,"+                                                            // 5235
				"north.isClosed,south.isClosed,east.isClosed,west.isClosed,"+                                                     // 5236
				"north.isHidden,south.isHidden,east.isHidden,west.isHidden"                                                       // 5237
,	cookie: {                                                                                                           // 5238
		name:	""	// If not specified, will use Layout.name, else just "Layout"                                              // 5239
	,	domain:	""	// blank = current domain                                                                               // 5240
	,	path:	""	// blank = current page, "/" = entire website                                                             // 5241
	,	expires: ""	// 'days' to keep cookie - leave blank for 'session cookie'                                            // 5242
	,	secure:	false                                                                                                      // 5243
	}                                                                                                                    // 5244
};                                                                                                                    // 5245
// Set stateManagement as a layout-option, NOT a pane-option                                                          // 5246
$.layout.optionsMap.layout.push("stateManagement");                                                                   // 5247
                                                                                                                      // 5248
/*                                                                                                                    // 5249
 *	State Management methods                                                                                           // 5250
 */                                                                                                                   // 5251
$.layout.state = {                                                                                                    // 5252
                                                                                                                      // 5253
	/**                                                                                                                  // 5254
	 * Get the current layout state and save it to a cookie                                                              // 5255
	 *                                                                                                                   // 5256
	 * myLayout.saveCookie( keys, cookieOpts )                                                                           // 5257
	 *                                                                                                                   // 5258
	 * @param {Object}			inst                                                                                            // 5259
	 * @param {(string|Array)=}	keys                                                                                     // 5260
	 * @param {Object=}			cookieOpts                                                                                     // 5261
	 */                                                                                                                  // 5262
	saveCookie: function (inst, keys, cookieOpts) {                                                                      // 5263
		var o	= inst.options                                                                                                // 5264
		,	sm	= o.stateManagement                                                                                            // 5265
		,	oC	= $.extend(true, {}, sm.cookie, cookieOpts || null)                                                            // 5266
		,	data = inst.state.stateData = inst.readState( keys || sm.stateKeys ) // read current panes-state                  // 5267
		;                                                                                                                   // 5268
		$.ui.cookie.write( oC.name || o.name || "Layout", $.layout.state.encodeJSON(data), oC );                            // 5269
		return $.extend(true, {}, data); // return COPY of state.stateData data                                             // 5270
	}                                                                                                                    // 5271
                                                                                                                      // 5272
	/**                                                                                                                  // 5273
	 * Remove the state cookie                                                                                           // 5274
	 *                                                                                                                   // 5275
	 * @param {Object}	inst                                                                                              // 5276
	 */                                                                                                                  // 5277
,	deleteCookie: function (inst) {                                                                                     // 5278
		var o = inst.options;                                                                                               // 5279
		$.ui.cookie.clear( o.stateManagement.cookie.name || o.name || "Layout" );                                           // 5280
	}                                                                                                                    // 5281
                                                                                                                      // 5282
	/**                                                                                                                  // 5283
	 * Read & return data from the cookie - as JSON                                                                      // 5284
	 *                                                                                                                   // 5285
	 * @param {Object}	inst                                                                                              // 5286
	 */                                                                                                                  // 5287
,	readCookie: function (inst) {                                                                                       // 5288
		var o = inst.options;                                                                                               // 5289
		var c = $.ui.cookie.read( o.stateManagement.cookie.name || o.name || "Layout" );                                    // 5290
		// convert cookie string back to a hash and return it                                                               // 5291
		return c ? $.layout.state.decodeJSON(c) : {};                                                                       // 5292
	}                                                                                                                    // 5293
                                                                                                                      // 5294
	/**                                                                                                                  // 5295
	 * Get data from the cookie and USE IT to loadState                                                                  // 5296
	 *                                                                                                                   // 5297
	 * @param {Object}	inst                                                                                              // 5298
	 */                                                                                                                  // 5299
,	loadCookie: function (inst) {                                                                                       // 5300
		var c = $.layout.state.readCookie(inst); // READ the cookie                                                         // 5301
		if (c) {                                                                                                            // 5302
			inst.state.stateData = $.extend(true, {}, c); // SET state.stateData                                               // 5303
			inst.loadState(c); // LOAD the retrieved state                                                                     // 5304
		}                                                                                                                   // 5305
		return c;                                                                                                           // 5306
	}                                                                                                                    // 5307
                                                                                                                      // 5308
	/**                                                                                                                  // 5309
	 * Update layout options from the cookie, if one exists                                                              // 5310
	 *                                                                                                                   // 5311
	 * @param {Object}		inst                                                                                             // 5312
	 * @param {Object=}		stateData                                                                                       // 5313
	 * @param {boolean=}	animate                                                                                         // 5314
	 */                                                                                                                  // 5315
,	loadState: function (inst, data, opts) {                                                                            // 5316
		if (!$.isPlainObject( data ) || $.isEmptyObject( data )) return;                                                    // 5317
                                                                                                                      // 5318
		// normalize data & cache in the state object                                                                       // 5319
		data = inst.state.stateData = $.layout.transformData( data ); // panes = default subkey                             // 5320
                                                                                                                      // 5321
		// add missing/default state-restore options                                                                        // 5322
		var smo = inst.options.stateManagement;                                                                             // 5323
		opts = $.extend({                                                                                                   // 5324
			animateLoad:		false //smo.animateLoad                                                                              // 5325
		,	includeChildren:	smo.includeChildren                                                                              // 5326
		}, opts );                                                                                                          // 5327
                                                                                                                      // 5328
		if (!inst.state.initialized) {                                                                                      // 5329
			/*                                                                                                                 // 5330
			 *	layout NOT initialized, so just update its options                                                              // 5331
			 */                                                                                                                // 5332
			// MUST remove pane.children keys before applying to options                                                       // 5333
			// use a copy so we don't remove keys from original data                                                           // 5334
			var o = $.extend(true, {}, data);                                                                                  // 5335
			//delete o.center; // center has no state-data - only children                                                     // 5336
			$.each($.layout.config.allPanes, function (idx, pane) {                                                            // 5337
				if (o[pane]) delete o[pane].children;		                                                                           // 5338
			 });                                                                                                               // 5339
			// update CURRENT layout-options with saved state data                                                             // 5340
			$.extend(true, inst.options, o);                                                                                   // 5341
		}                                                                                                                   // 5342
		else {                                                                                                              // 5343
			/*                                                                                                                 // 5344
			 *	layout already initialized, so modify layout's configuration                                                    // 5345
			 */                                                                                                                // 5346
			var noAnimate = !opts.animateLoad                                                                                  // 5347
			,	o, c, h, state, open                                                                                             // 5348
			;                                                                                                                  // 5349
			$.each($.layout.config.borderPanes, function (idx, pane) {                                                         // 5350
				o = data[ pane ];                                                                                                 // 5351
				if (!$.isPlainObject( o )) return; // no key, skip pane                                                           // 5352
                                                                                                                      // 5353
				s	= o.size;                                                                                                       // 5354
				c	= o.initClosed;                                                                                                 // 5355
				h	= o.initHidden;                                                                                                 // 5356
				ar	= o.autoResize                                                                                                 // 5357
				state	= inst.state[pane];                                                                                         // 5358
				open	= state.isVisible;                                                                                           // 5359
                                                                                                                      // 5360
				// reset autoResize                                                                                               // 5361
				if (ar)                                                                                                           // 5362
					state.autoResize = ar;                                                                                           // 5363
				// resize BEFORE opening                                                                                          // 5364
				if (!open)                                                                                                        // 5365
					inst._sizePane(pane, s, false, false, false); // false=skipCallback/noAnimation/forceResize                      // 5366
				// open/close as necessary - DO NOT CHANGE THIS ORDER!                                                            // 5367
				if (h === true)			inst.hide(pane, noAnimate);                                                                     // 5368
				else if (c === true)	inst.close(pane, false, noAnimate);                                                          // 5369
				else if (c === false)	inst.open (pane, false, noAnimate);                                                         // 5370
				else if (h === false)	inst.show (pane, false, noAnimate);                                                         // 5371
				// resize AFTER any other actions                                                                                 // 5372
				if (open)                                                                                                         // 5373
					inst._sizePane(pane, s, false, false, noAnimate); // animate resize if option passed                             // 5374
			});                                                                                                                // 5375
                                                                                                                      // 5376
			/*                                                                                                                 // 5377
			 *	RECURSE INTO CHILD-LAYOUTS                                                                                      // 5378
			 */                                                                                                                // 5379
			if (opts.includeChildren) {                                                                                        // 5380
				var paneStateChildren, childState;                                                                                // 5381
				$.each(inst.children, function (pane, paneChildren) {                                                             // 5382
					paneStateChildren = data[pane] ? data[pane].children : 0;                                                        // 5383
					if (paneStateChildren && paneChildren) {                                                                         // 5384
						$.each(paneChildren, function (stateKey, child) {                                                               // 5385
							childState = paneStateChildren[stateKey];                                                                      // 5386
							if (child && childState)                                                                                       // 5387
								child.loadState( childState );                                                                                // 5388
						});                                                                                                             // 5389
					}                                                                                                                // 5390
				});                                                                                                               // 5391
			}                                                                                                                  // 5392
		}                                                                                                                   // 5393
	}                                                                                                                    // 5394
                                                                                                                      // 5395
	/**                                                                                                                  // 5396
	 * Get the *current layout state* and return it as a hash                                                            // 5397
	 *                                                                                                                   // 5398
	 * @param {Object=}		inst	// Layout instance to get state for                                                        // 5399
	 * @param {object=}		[opts]	// State-Managements override options                                                    // 5400
	 */                                                                                                                  // 5401
,	readState: function (inst, opts) {                                                                                  // 5402
		// backward compatility                                                                                             // 5403
		if ($.type(opts) === 'string') opts = { keys: opts };                                                               // 5404
		if (!opts) opts = {};                                                                                               // 5405
		var	sm		= inst.options.stateManagement                                                                              // 5406
		,	ic		= opts.includeChildren                                                                                        // 5407
		,	recurse	= ic !== undefined ? ic : sm.includeChildren                                                              // 5408
		,	keys	= opts.stateKeys || sm.stateKeys                                                                             // 5409
		,	alt		= { isClosed: 'initClosed', isHidden: 'initHidden' }                                                         // 5410
		,	state	= inst.state                                                                                                // 5411
		,	panes	= $.layout.config.allPanes                                                                                  // 5412
		,	data	= {}                                                                                                         // 5413
		,	pair, pane, key, val                                                                                              // 5414
		,	ps, pC, child, array, count, branch                                                                               // 5415
		;                                                                                                                   // 5416
		if ($.isArray(keys)) keys = keys.join(",");                                                                         // 5417
		// convert keys to an array and change delimiters from '__' to '.'                                                  // 5418
		keys = keys.replace(/__/g, ".").split(',');                                                                         // 5419
		// loop keys and create a data hash                                                                                 // 5420
		for (var i=0, n=keys.length; i < n; i++) {                                                                          // 5421
			pair = keys[i].split(".");                                                                                         // 5422
			pane = pair[0];                                                                                                    // 5423
			key  = pair[1];                                                                                                    // 5424
			if ($.inArray(pane, panes) < 0) continue; // bad pane!                                                             // 5425
			val = state[ pane ][ key ];                                                                                        // 5426
			if (val == undefined) continue;                                                                                    // 5427
			if (key=="isClosed" && state[pane]["isSliding"])                                                                   // 5428
				val = true; // if sliding, then *really* isClosed                                                                 // 5429
			( data[pane] || (data[pane]={}) )[ alt[key] ? alt[key] : key ] = val;                                              // 5430
		}                                                                                                                   // 5431
                                                                                                                      // 5432
		// recurse into the child-layouts for each pane                                                                     // 5433
		if (recurse) {                                                                                                      // 5434
			$.each(panes, function (idx, pane) {                                                                               // 5435
				pC = inst.children[pane];                                                                                         // 5436
				ps = state.stateData[pane];                                                                                       // 5437
				if ($.isPlainObject( pC ) && !$.isEmptyObject( pC )) {                                                            // 5438
					// ensure a key exists for this 'pane', eg: branch = data.center                                                 // 5439
					branch = data[pane] || (data[pane] = {});                                                                        // 5440
					if (!branch.children) branch.children = {};                                                                      // 5441
					$.each( pC, function (key, child) {                                                                              // 5442
						// ONLY read state from an initialize layout                                                                    // 5443
						if ( child.state.initialized )                                                                                  // 5444
							branch.children[ key ] = $.layout.state.readState( child );                                                    // 5445
						// if we have PREVIOUS (onLoad) state for this child-layout, KEEP IT!                                           // 5446
						else if ( ps && ps.children && ps.children[ key ] ) {                                                           // 5447
							branch.children[ key ] = $.extend(true, {}, ps.children[ key ] );                                              // 5448
						}                                                                                                               // 5449
					});                                                                                                              // 5450
				}                                                                                                                 // 5451
			});                                                                                                                // 5452
		}                                                                                                                   // 5453
                                                                                                                      // 5454
		return data;                                                                                                        // 5455
	}                                                                                                                    // 5456
                                                                                                                      // 5457
	/**                                                                                                                  // 5458
	 *	Stringify a JSON hash so can save in a cookie or db-field                                                         // 5459
	 */                                                                                                                  // 5460
,	encodeJSON: function (JSON) {                                                                                       // 5461
		return parse(JSON);                                                                                                 // 5462
		function parse (h) {                                                                                                // 5463
			var D=[], i=0, k, v, t // k = key, v = value                                                                       // 5464
			,	a = $.isArray(h)                                                                                                 // 5465
			;                                                                                                                  // 5466
			for (k in h) {                                                                                                     // 5467
				v = h[k];                                                                                                         // 5468
				t = typeof v;                                                                                                     // 5469
				if (t == 'string')		// STRING - add quotes                                                                        // 5470
					v = '"'+ v +'"';                                                                                                 // 5471
				else if (t == 'object')	// SUB-KEY - recurse into it                                                              // 5472
					v = parse(v);                                                                                                    // 5473
				D[i++] = (!a ? '"'+ k +'":' : '') + v;                                                                            // 5474
			}                                                                                                                  // 5475
			return (a ? '[' : '{') + D.join(',') + (a ? ']' : '}');                                                            // 5476
		};                                                                                                                  // 5477
	}                                                                                                                    // 5478
                                                                                                                      // 5479
	/**                                                                                                                  // 5480
	 *	Convert stringified JSON back to a hash object                                                                    // 5481
	 *	@see		$.parseJSON(), adding in jQuery 1.4.1                                                                       // 5482
	 */                                                                                                                  // 5483
,	decodeJSON: function (str) {                                                                                        // 5484
		try { return $.parseJSON ? $.parseJSON(str) : window["eval"]("("+ str +")") || {}; }                                // 5485
		catch (e) { return {}; }                                                                                            // 5486
	}                                                                                                                    // 5487
                                                                                                                      // 5488
                                                                                                                      // 5489
,	_create: function (inst) {                                                                                          // 5490
		var _	= $.layout.state                                                                                              // 5491
		,	o	= inst.options                                                                                                  // 5492
		,	sm	= o.stateManagement                                                                                            // 5493
		;                                                                                                                   // 5494
		//	ADD State-Management plugin methods to inst                                                                      // 5495
		 $.extend( inst, {                                                                                                  // 5496
		//	readCookie - update options from cookie - returns hash of cookie data                                            // 5497
			readCookie:		function () { return _.readCookie(inst); }                                                            // 5498
		//	deleteCookie                                                                                                     // 5499
		,	deleteCookie:	function () { _.deleteCookie(inst); }                                                               // 5500
		//	saveCookie - optionally pass keys-list and cookie-options (hash)                                                 // 5501
		,	saveCookie:		function (keys, cookieOpts) { return _.saveCookie(inst, keys, cookieOpts); }                         // 5502
		//	loadCookie - readCookie and use to loadState() - returns hash of cookie data                                     // 5503
		,	loadCookie:		function () { return _.loadCookie(inst); }                                                           // 5504
		//	loadState - pass a hash of state to use to update options                                                        // 5505
		,	loadState:		function (stateData, opts) { _.loadState(inst, stateData, opts); }                                    // 5506
		//	readState - returns hash of current layout-state                                                                 // 5507
		,	readState:		function (keys) { return _.readState(inst, keys); }                                                   // 5508
		//	add JSON utility methods too...                                                                                  // 5509
		,	encodeJSON:		_.encodeJSON                                                                                         // 5510
		,	decodeJSON:		_.decodeJSON                                                                                         // 5511
		});                                                                                                                 // 5512
                                                                                                                      // 5513
		// init state.stateData key, even if plugin is initially disabled                                                   // 5514
		inst.state.stateData = {};                                                                                          // 5515
                                                                                                                      // 5516
		// autoLoad MUST BE one of: data-array, data-hash, callback-function, or TRUE                                       // 5517
		if ( !sm.autoLoad ) return;                                                                                         // 5518
                                                                                                                      // 5519
		//	When state-data exists in the autoLoad key USE IT,                                                               // 5520
		//	even if stateManagement.enabled == false                                                                         // 5521
		if ($.isPlainObject( sm.autoLoad )) {                                                                               // 5522
			if (!$.isEmptyObject( sm.autoLoad )) {                                                                             // 5523
				inst.loadState( sm.autoLoad );                                                                                    // 5524
			}                                                                                                                  // 5525
		}                                                                                                                   // 5526
		else if ( sm.enabled ) {                                                                                            // 5527
			// update the options from cookie or callback                                                                      // 5528
			// if options is a function, call it to get stateData                                                              // 5529
			if ($.isFunction( sm.autoLoad )) {                                                                                 // 5530
				var d = {};                                                                                                       // 5531
				try {                                                                                                             // 5532
					d = sm.autoLoad( inst, inst.state, inst.options, inst.options.name || '' ); // try to get data from fn           // 5533
				} catch (e) {}                                                                                                    // 5534
				if (d && $.isPlainObject( d ) && !$.isEmptyObject( d ))                                                           // 5535
					inst.loadState(d);                                                                                               // 5536
			}                                                                                                                  // 5537
			else // any other truthy value will trigger loadCookie                                                             // 5538
				inst.loadCookie();                                                                                                // 5539
		}                                                                                                                   // 5540
	}                                                                                                                    // 5541
                                                                                                                      // 5542
,	_unload: function (inst) {                                                                                          // 5543
		var sm = inst.options.stateManagement;                                                                              // 5544
		if (sm.enabled && sm.autoSave) {                                                                                    // 5545
			// if options is a function, call it to save the stateData                                                         // 5546
			if ($.isFunction( sm.autoSave )) {                                                                                 // 5547
				try {                                                                                                             // 5548
					sm.autoSave( inst, inst.state, inst.options, inst.options.name || '' ); // try to get data from fn               // 5549
				} catch (e) {}                                                                                                    // 5550
			}                                                                                                                  // 5551
			else // any truthy value will trigger saveCookie                                                                   // 5552
				inst.saveCookie();                                                                                                // 5553
		}                                                                                                                   // 5554
	}                                                                                                                    // 5555
                                                                                                                      // 5556
};                                                                                                                    // 5557
                                                                                                                      // 5558
// add state initialization method to Layout's onCreate array of functions                                            // 5559
$.layout.onCreate.push( $.layout.state._create );                                                                     // 5560
$.layout.onUnload.push( $.layout.state._unload );                                                                     // 5561
                                                                                                                      // 5562
                                                                                                                      // 5563
                                                                                                                      // 5564
                                                                                                                      // 5565
/**                                                                                                                   // 5566
 * jquery.layout.buttons 1.0                                                                                          // 5567
 * $Date: 2011-07-16 08:00:00 (Sat, 16 July 2011) $                                                                   // 5568
 *                                                                                                                    // 5569
 * Copyright (c) 2012                                                                                                 // 5570
 *   Kevin Dalman (http://allpro.net)                                                                                 // 5571
 *                                                                                                                    // 5572
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)                                                 // 5573
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.                                             // 5574
 *                                                                                                                    // 5575
 * @requires: UI Layout 1.3.0.rc30.1 or higher                                                                        // 5576
 *                                                                                                                    // 5577
 * @see: http://groups.google.com/group/jquery-ui-layout                                                              // 5578
 *                                                                                                                    // 5579
 * Docs: [ to come ]                                                                                                  // 5580
 * Tips: [ to come ]                                                                                                  // 5581
 */                                                                                                                   // 5582
                                                                                                                      // 5583
// tell Layout that the state plugin is available                                                                     // 5584
$.layout.plugins.buttons = true;                                                                                      // 5585
                                                                                                                      // 5586
//	Add buttons options to layout.defaults                                                                             // 5587
$.layout.defaults.autoBindCustomButtons = false;                                                                      // 5588
// Specify autoBindCustomButtons as a layout-option, NOT a pane-option                                                // 5589
$.layout.optionsMap.layout.push("autoBindCustomButtons");                                                             // 5590
                                                                                                                      // 5591
/*                                                                                                                    // 5592
 *	Button methods                                                                                                     // 5593
 */                                                                                                                   // 5594
$.layout.buttons = {                                                                                                  // 5595
                                                                                                                      // 5596
	/**                                                                                                                  // 5597
	* Searches for .ui-layout-button-xxx elements and auto-binds them as layout-buttons                                  // 5598
	*                                                                                                                    // 5599
	* @see  _create()                                                                                                    // 5600
	*                                                                                                                    // 5601
	* @param  {Object}		inst	Layout Instance object                                                                      // 5602
	*/                                                                                                                   // 5603
	init: function (inst) {                                                                                              // 5604
		var pre		= "ui-layout-button-"                                                                                      // 5605
		,	layout	= inst.options.name || ""                                                                                  // 5606
		,	name;                                                                                                             // 5607
		$.each("toggle,open,close,pin,toggle-slide,open-slide".split(","), function (i, action) {                           // 5608
			$.each($.layout.config.borderPanes, function (ii, pane) {                                                          // 5609
				$("."+pre+action+"-"+pane).each(function(){                                                                       // 5610
					// if button was previously 'bound', data.layoutName was set, but is blank if layout has no 'name'               // 5611
					name = $(this).data("layoutName") || $(this).attr("layoutName");                                                 // 5612
					if (name == undefined || name === layout)                                                                        // 5613
						inst.bindButton(this, action, pane);                                                                            // 5614
				});                                                                                                               // 5615
			});                                                                                                                // 5616
		});                                                                                                                 // 5617
	}                                                                                                                    // 5618
                                                                                                                      // 5619
	/**                                                                                                                  // 5620
	* Helper function to validate params received by addButton utilities                                                 // 5621
	*                                                                                                                    // 5622
	* Two classes are added to the element, based on the buttonClass...                                                  // 5623
	* The type of button is appended to create the 2nd className:                                                        // 5624
	*  - ui-layout-button-pin		// action btnClass                                                                        // 5625
	*  - ui-layout-button-pin-west	// action btnClass + pane                                                             // 5626
	*  - ui-layout-button-toggle                                                                                         // 5627
	*  - ui-layout-button-open                                                                                           // 5628
	*  - ui-layout-button-close                                                                                          // 5629
	*                                                                                                                    // 5630
	* @param {Object}			inst		Layout Instance object                                                                     // 5631
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"  // 5632
	* @param {string}   		pane 		Name of the pane the button is for: 'north', 'south', etc.                              // 5633
	*                                                                                                                    // 5634
	* @return {Array.<Object>}	If both params valid, the element matching 'selector' in a jQuery wrapper - otherwise returns null
	*/                                                                                                                   // 5636
,	get: function (inst, selector, pane, action) {                                                                      // 5637
		var $E	= $(selector)                                                                                                // 5638
		,	o	= inst.options                                                                                                  // 5639
		,	err	= o.errors.addButtonError                                                                                     // 5640
		;                                                                                                                   // 5641
		if (!$E.length) { // element not found                                                                              // 5642
			$.layout.msg(err +" "+ o.errors.selector +": "+ selector, true);                                                   // 5643
		}                                                                                                                   // 5644
		else if ($.inArray(pane, $.layout.config.borderPanes) < 0) { // invalid 'pane' sepecified                           // 5645
			$.layout.msg(err +" "+ o.errors.pane +": "+ pane, true);                                                           // 5646
			$E = $("");  // NO BUTTON                                                                                          // 5647
		}                                                                                                                   // 5648
		else { // VALID                                                                                                     // 5649
			var btn = o[pane].buttonClass +"-"+ action;                                                                        // 5650
			$E	.addClass( btn +" "+ btn +"-"+ pane )                                                                           // 5651
				.data("layoutName", o.name); // add layout identifier - even if blank!                                            // 5652
		}                                                                                                                   // 5653
		return $E;                                                                                                          // 5654
	}                                                                                                                    // 5655
                                                                                                                      // 5656
                                                                                                                      // 5657
	/**                                                                                                                  // 5658
	* NEW syntax for binding layout-buttons - will eventually replace addToggle, addOpen, etc.                           // 5659
	*                                                                                                                    // 5660
	* @param {Object}			inst		Layout Instance object                                                                     // 5661
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"  // 5662
	* @param {string}			action                                                                                           // 5663
	* @param {string}			pane                                                                                             // 5664
	*/                                                                                                                   // 5665
,	bind: function (inst, selector, action, pane) {                                                                     // 5666
		var _ = $.layout.buttons;                                                                                           // 5667
		switch (action.toLowerCase()) {                                                                                     // 5668
			case "toggle":			_.addToggle	(inst, selector, pane); break;	                                                       // 5669
			case "open":			_.addOpen	(inst, selector, pane); break;                                                            // 5670
			case "close":			_.addClose	(inst, selector, pane); break;                                                          // 5671
			case "pin":				_.addPin	(inst, selector, pane); break;                                                             // 5672
			case "toggle-slide":	_.addToggle	(inst, selector, pane, true); break;	                                             // 5673
			case "open-slide":		_.addOpen	(inst, selector, pane, true); break;                                                 // 5674
		}                                                                                                                   // 5675
		return inst;                                                                                                        // 5676
	}                                                                                                                    // 5677
                                                                                                                      // 5678
	/**                                                                                                                  // 5679
	* Add a custom Toggler button for a pane                                                                             // 5680
	*                                                                                                                    // 5681
	* @param {Object}			inst		Layout Instance object                                                                     // 5682
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"  // 5683
	* @param {string}  			pane 		Name of the pane the button is for: 'north', 'south', etc.                              // 5684
	* @param {boolean=}			slide 		true = slide-open, false = pin-open                                                    // 5685
	*/                                                                                                                   // 5686
,	addToggle: function (inst, selector, pane, slide) {                                                                 // 5687
		$.layout.buttons.get(inst, selector, pane, "toggle")                                                                // 5688
			.click(function(evt){                                                                                              // 5689
				inst.toggle(pane, !!slide);                                                                                       // 5690
				evt.stopPropagation();                                                                                            // 5691
			});                                                                                                                // 5692
		return inst;                                                                                                        // 5693
	}                                                                                                                    // 5694
                                                                                                                      // 5695
	/**                                                                                                                  // 5696
	* Add a custom Open button for a pane                                                                                // 5697
	*                                                                                                                    // 5698
	* @param {Object}			inst		Layout Instance object                                                                     // 5699
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"  // 5700
	* @param {string}			pane 		Name of the pane the button is for: 'north', 'south', etc.                                // 5701
	* @param {boolean=}			slide 		true = slide-open, false = pin-open                                                    // 5702
	*/                                                                                                                   // 5703
,	addOpen: function (inst, selector, pane, slide) {                                                                   // 5704
		$.layout.buttons.get(inst, selector, pane, "open")                                                                  // 5705
			.attr("title", inst.options[pane].tips.Open)                                                                       // 5706
			.click(function (evt) {                                                                                            // 5707
				inst.open(pane, !!slide);                                                                                         // 5708
				evt.stopPropagation();                                                                                            // 5709
			});                                                                                                                // 5710
		return inst;                                                                                                        // 5711
	}                                                                                                                    // 5712
                                                                                                                      // 5713
	/**                                                                                                                  // 5714
	* Add a custom Close button for a pane                                                                               // 5715
	*                                                                                                                    // 5716
	* @param {Object}			inst		Layout Instance object                                                                     // 5717
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"  // 5718
	* @param {string}   		pane 		Name of the pane the button is for: 'north', 'south', etc.                              // 5719
	*/                                                                                                                   // 5720
,	addClose: function (inst, selector, pane) {                                                                         // 5721
		$.layout.buttons.get(inst, selector, pane, "close")                                                                 // 5722
			.attr("title", inst.options[pane].tips.Close)                                                                      // 5723
			.click(function (evt) {                                                                                            // 5724
				inst.close(pane);                                                                                                 // 5725
				evt.stopPropagation();                                                                                            // 5726
			});                                                                                                                // 5727
		return inst;                                                                                                        // 5728
	}                                                                                                                    // 5729
                                                                                                                      // 5730
	/**                                                                                                                  // 5731
	* Add a custom Pin button for a pane                                                                                 // 5732
	*                                                                                                                    // 5733
	* Four classes are added to the element, based on the paneClass for the associated pane...                           // 5734
	* Assuming the default paneClass and the pin is 'up', these classes are added for a west-pane pin:                   // 5735
	*  - ui-layout-pane-pin                                                                                              // 5736
	*  - ui-layout-pane-west-pin                                                                                         // 5737
	*  - ui-layout-pane-pin-up                                                                                           // 5738
	*  - ui-layout-pane-west-pin-up                                                                                      // 5739
	*                                                                                                                    // 5740
	* @param {Object}			inst		Layout Instance object                                                                     // 5741
	* @param {(string|!Object)}	selector	jQuery selector (or element) for button, eg: ".ui-layout-north .toggle-button"  // 5742
	* @param {string}   		pane 		Name of the pane the pin is for: 'north', 'south', etc.                                 // 5743
	*/                                                                                                                   // 5744
,	addPin: function (inst, selector, pane) {                                                                           // 5745
		var	_	= $.layout.buttons                                                                                            // 5746
		,	$E	= _.get(inst, selector, pane, "pin");                                                                          // 5747
		if ($E.length) {                                                                                                    // 5748
			var s = inst.state[pane];                                                                                          // 5749
			$E.click(function (evt) {                                                                                          // 5750
				_.setPinState(inst, $(this), pane, (s.isSliding || s.isClosed));                                                  // 5751
				if (s.isSliding || s.isClosed) inst.open( pane ); // change from sliding to open                                  // 5752
				else inst.close( pane ); // slide-closed                                                                          // 5753
				evt.stopPropagation();                                                                                            // 5754
			});                                                                                                                // 5755
			// add up/down pin attributes and classes                                                                          // 5756
			_.setPinState(inst, $E, pane, (!s.isClosed && !s.isSliding));                                                      // 5757
			// add this pin to the pane data so we can 'sync it' automatically                                                 // 5758
			// PANE.pins key is an array so we can store multiple pins for each pane                                           // 5759
			s.pins.push( selector ); // just save the selector string                                                          // 5760
		}                                                                                                                   // 5761
		return inst;                                                                                                        // 5762
	}                                                                                                                    // 5763
                                                                                                                      // 5764
	/**                                                                                                                  // 5765
	* Change the class of the pin button to make it look 'up' or 'down'                                                  // 5766
	*                                                                                                                    // 5767
	* @see  addPin(), syncPins()                                                                                         // 5768
	*                                                                                                                    // 5769
	* @param {Object}			inst	Layout Instance object                                                                      // 5770
	* @param {Array.<Object>}	$Pin	The pin-span element in a jQuery wrapper                                              // 5771
	* @param {string}			pane	These are the params returned to callbacks by layout()                                      // 5772
	* @param {boolean}			doPin	true = set the pin 'down', false = set it 'up'                                            // 5773
	*/                                                                                                                   // 5774
,	setPinState: function (inst, $Pin, pane, doPin) {                                                                   // 5775
		var updown = $Pin.attr("pin");                                                                                      // 5776
		if (updown && doPin === (updown=="down")) return; // already in correct state                                       // 5777
		var                                                                                                                 // 5778
			o		= inst.options[pane]                                                                                            // 5779
		,	pin		= o.buttonClass +"-pin"                                                                                      // 5780
		,	side	= pin +"-"+ pane                                                                                             // 5781
		,	UP		= pin +"-up "+	side +"-up"                                                                                    // 5782
		,	DN		= pin +"-down "+side +"-down"                                                                                 // 5783
		;                                                                                                                   // 5784
		$Pin                                                                                                                // 5785
			.attr("pin", doPin ? "down" : "up") // logic                                                                       // 5786
			.attr("title", doPin ? o.tips.Unpin : o.tips.Pin)                                                                  // 5787
			.removeClass( doPin ? UP : DN )                                                                                    // 5788
			.addClass( doPin ? DN : UP )                                                                                       // 5789
		;                                                                                                                   // 5790
	}                                                                                                                    // 5791
                                                                                                                      // 5792
	/**                                                                                                                  // 5793
	* INTERNAL function to sync 'pin buttons' when pane is opened or closed                                              // 5794
	* Unpinned means the pane is 'sliding' - ie, over-top of the adjacent panes                                          // 5795
	*                                                                                                                    // 5796
	* @see  open(), close()                                                                                              // 5797
	*                                                                                                                    // 5798
	* @param {Object}			inst	Layout Instance object                                                                      // 5799
	* @param {string}	pane	These are the params returned to callbacks by layout()                                        // 5800
	* @param {boolean}	doPin	True means set the pin 'down', False means 'up'                                             // 5801
	*/                                                                                                                   // 5802
,	syncPinBtns: function (inst, pane, doPin) {                                                                         // 5803
		// REAL METHOD IS _INSIDE_ LAYOUT - THIS IS HERE JUST FOR REFERENCE                                                 // 5804
		$.each(inst.state[pane].pins, function (i, selector) {                                                              // 5805
			$.layout.buttons.setPinState(inst, $(selector), pane, doPin);                                                      // 5806
		});                                                                                                                 // 5807
	}                                                                                                                    // 5808
                                                                                                                      // 5809
                                                                                                                      // 5810
,	_load: function (inst) {                                                                                            // 5811
		var	_	= $.layout.buttons;                                                                                           // 5812
		// ADD Button methods to Layout Instance                                                                            // 5813
		// Note: sel = jQuery Selector string                                                                               // 5814
		$.extend( inst, {                                                                                                   // 5815
			bindButton:		function (sel, action, pane) { return _.bind(inst, sel, action, pane); }                              // 5816
		//	DEPRECATED METHODS                                                                                               // 5817
		,	addToggleBtn:	function (sel, pane, slide) { return _.addToggle(inst, sel, pane, slide); }                         // 5818
		,	addOpenBtn:		function (sel, pane, slide) { return _.addOpen(inst, sel, pane, slide); }                            // 5819
		,	addCloseBtn:	function (sel, pane) { return _.addClose(inst, sel, pane); }                                         // 5820
		,	addPinBtn:		function (sel, pane) { return _.addPin(inst, sel, pane); }                                            // 5821
		});                                                                                                                 // 5822
                                                                                                                      // 5823
		// init state array to hold pin-buttons                                                                             // 5824
		for (var i=0; i<4; i++) {                                                                                           // 5825
			var pane = $.layout.config.borderPanes[i];                                                                         // 5826
			inst.state[pane].pins = [];                                                                                        // 5827
		}                                                                                                                   // 5828
                                                                                                                      // 5829
		// auto-init buttons onLoad if option is enabled                                                                    // 5830
		if ( inst.options.autoBindCustomButtons )                                                                           // 5831
			_.init(inst);                                                                                                      // 5832
	}                                                                                                                    // 5833
                                                                                                                      // 5834
,	_unload: function (inst) {                                                                                          // 5835
		// TODO: unbind all buttons???                                                                                      // 5836
	}                                                                                                                    // 5837
                                                                                                                      // 5838
};                                                                                                                    // 5839
                                                                                                                      // 5840
// add initialization method to Layout's onLoad array of functions                                                    // 5841
$.layout.onLoad.push(  $.layout.buttons._load );                                                                      // 5842
//$.layout.onUnload.push( $.layout.buttons._unload );                                                                 // 5843
                                                                                                                      // 5844
                                                                                                                      // 5845
                                                                                                                      // 5846
/**                                                                                                                   // 5847
 * jquery.layout.browserZoom 1.0                                                                                      // 5848
 * $Date: 2011-12-29 08:00:00 (Thu, 29 Dec 2011) $                                                                    // 5849
 *                                                                                                                    // 5850
 * Copyright (c) 2012                                                                                                 // 5851
 *   Kevin Dalman (http://allpro.net)                                                                                 // 5852
 *                                                                                                                    // 5853
 * Dual licensed under the GPL (http://www.gnu.org/licenses/gpl.html)                                                 // 5854
 * and MIT (http://www.opensource.org/licenses/mit-license.php) licenses.                                             // 5855
 *                                                                                                                    // 5856
 * @requires: UI Layout 1.3.0.rc30.1 or higher                                                                        // 5857
 *                                                                                                                    // 5858
 * @see: http://groups.google.com/group/jquery-ui-layout                                                              // 5859
 *                                                                                                                    // 5860
 * TODO: Extend logic to handle other problematic zooming in browsers                                                 // 5861
 * TODO: Add hotkey/mousewheel bindings to _instantly_ respond to these zoom event                                    // 5862
 */                                                                                                                   // 5863
                                                                                                                      // 5864
// tell Layout that the plugin is available                                                                           // 5865
$.layout.plugins.browserZoom = true;                                                                                  // 5866
                                                                                                                      // 5867
$.layout.defaults.browserZoomCheckInterval = 1000;                                                                    // 5868
$.layout.optionsMap.layout.push("browserZoomCheckInterval");                                                          // 5869
                                                                                                                      // 5870
/*                                                                                                                    // 5871
 *	browserZoom methods                                                                                                // 5872
 */                                                                                                                   // 5873
$.layout.browserZoom = {                                                                                              // 5874
                                                                                                                      // 5875
	_init: function (inst) {                                                                                             // 5876
		// abort if browser does not need this check                                                                        // 5877
		if ($.layout.browserZoom.ratio() !== false)                                                                         // 5878
			$.layout.browserZoom._setTimer(inst);                                                                              // 5879
	}                                                                                                                    // 5880
                                                                                                                      // 5881
,	_setTimer: function (inst) {                                                                                        // 5882
		// abort if layout destroyed or browser does not need this check                                                    // 5883
		if (inst.destroyed) return;                                                                                         // 5884
		var o	= inst.options                                                                                                // 5885
		,	s	= inst.state                                                                                                    // 5886
		//	don't need check if inst has parentLayout, but check occassionally in case parent destroyed!                     // 5887
		//	MINIMUM 100ms interval, for performance                                                                          // 5888
		,	ms	= inst.hasParentLayout ?  5000 : Math.max( o.browserZoomCheckInterval, 100 )                                   // 5889
		;                                                                                                                   // 5890
		// set the timer                                                                                                    // 5891
		setTimeout(function(){                                                                                              // 5892
			if (inst.destroyed || !o.resizeWithWindow) return;                                                                 // 5893
			var d = $.layout.browserZoom.ratio();                                                                              // 5894
			if (d !== s.browserZoom) {                                                                                         // 5895
				s.browserZoom = d;                                                                                                // 5896
				inst.resizeAll();                                                                                                 // 5897
			}                                                                                                                  // 5898
			// set a NEW timeout                                                                                               // 5899
			$.layout.browserZoom._setTimer(inst);                                                                              // 5900
		}                                                                                                                   // 5901
		,	ms );                                                                                                             // 5902
	}                                                                                                                    // 5903
                                                                                                                      // 5904
,	ratio: function () {                                                                                                // 5905
		var w	= window                                                                                                      // 5906
		,	s	= screen                                                                                                        // 5907
		,	d	= document                                                                                                      // 5908
		,	dE	= d.documentElement || d.body                                                                                  // 5909
		,	b	= $.layout.browser                                                                                              // 5910
		,	v	= b.version                                                                                                     // 5911
		,	r, sW, cW                                                                                                         // 5912
		;                                                                                                                   // 5913
		// we can ignore all browsers that fire window.resize event onZoom                                                  // 5914
		if ((b.msie && v > 8)                                                                                               // 5915
		||	!b.msie                                                                                                          // 5916
		) return false; // don't need to track zoom                                                                         // 5917
                                                                                                                      // 5918
		if (s.deviceXDPI && s.systemXDPI) // syntax compiler hack                                                           // 5919
			return calc(s.deviceXDPI, s.systemXDPI);                                                                           // 5920
		// everything below is just for future reference!                                                                   // 5921
		if (b.webkit && (r = d.body.getBoundingClientRect))                                                                 // 5922
			return calc((r.left - r.right), d.body.offsetWidth);                                                               // 5923
		if (b.webkit && (sW = w.outerWidth))                                                                                // 5924
			return calc(sW, w.innerWidth);                                                                                     // 5925
		if ((sW = s.width) && (cW = dE.clientWidth))                                                                        // 5926
			return calc(sW, cW);                                                                                               // 5927
		return false; // no match, so cannot - or don't need to - track zoom                                                // 5928
                                                                                                                      // 5929
		function calc (x,y) { return (parseInt(x,10) / parseInt(y,10) * 100).toFixed(); }                                   // 5930
	}                                                                                                                    // 5931
                                                                                                                      // 5932
};                                                                                                                    // 5933
// add initialization method to Layout's onLoad array of functions                                                    // 5934
$.layout.onReady.push( $.layout.browserZoom._init );                                                                  // 5935
                                                                                                                      // 5936
                                                                                                                      // 5937
})( jQuery );                                                                                                          // 5938
                                                                                                                       // 5939
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

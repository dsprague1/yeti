(function () {

/* Imports */
var SpacebarsCompiler = Package['spacebars-compiler'].SpacebarsCompiler;

/* Package-scope variables */
var html_scanner;

(function () {

////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// plugin/html_scanner.js                                                         //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
                                                                                  //
html_scanner = {                                                                  // 1
  // Scan a template file for <head>, <body>, and <template>                      // 2
  // tags and extract their contents.                                             // 3
  //                                                                              // 4
  // This is a primitive, regex-based scanner.  It scans                          // 5
  // top-level tags, which are allowed to have attributes,                        // 6
  // and ignores top-level HTML comments.                                         // 7
                                                                                  // 8
  // Has fields 'message', 'line', 'file'                                         // 9
  ParseError: function () {                                                       // 10
  },                                                                              // 11
                                                                                  // 12
  scan: function (contents, source_name) {                                        // 13
    var rest = contents;                                                          // 14
    var index = 0;                                                                // 15
                                                                                  // 16
    var advance = function(amount) {                                              // 17
      rest = rest.substring(amount);                                              // 18
      index += amount;                                                            // 19
    };                                                                            // 20
                                                                                  // 21
    var throwParseError = function (msg, overrideIndex) {                         // 22
      var ret = new html_scanner.ParseError;                                      // 23
      ret.message = msg || "bad formatting in HTML template";                     // 24
      ret.file = source_name;                                                     // 25
      var theIndex = (typeof overrideIndex === 'number' ? overrideIndex : index); // 26
      ret.line = contents.substring(0, theIndex).split('\n').length;              // 27
      throw ret;                                                                  // 28
    };                                                                            // 29
                                                                                  // 30
    var results = html_scanner._initResults();                                    // 31
    var rOpenTag = /^((<(template|head|body)\b)|(<!--)|(<!DOCTYPE|{{!)|$)/i;      // 32
                                                                                  // 33
    while (rest) {                                                                // 34
      // skip whitespace first (for better line numbers)                          // 35
      advance(rest.match(/^\s*/)[0].length);                                      // 36
                                                                                  // 37
      var match = rOpenTag.exec(rest);                                            // 38
      if (! match)                                                                // 39
        throwParseError(); // unknown text encountered                            // 40
                                                                                  // 41
      var matchToken = match[1];                                                  // 42
      var matchTokenTagName =  match[3];                                          // 43
      var matchTokenComment = match[4];                                           // 44
      var matchTokenUnsupported = match[5];                                       // 45
                                                                                  // 46
      var tagStartIndex = index;                                                  // 47
      advance(match.index + match[0].length);                                     // 48
                                                                                  // 49
      if (! matchToken)                                                           // 50
        break; // matched $ (end of file)                                         // 51
      if (matchTokenComment === '<!--') {                                         // 52
        // top-level HTML comment                                                 // 53
        var commentEnd = /--\s*>/.exec(rest);                                     // 54
        if (! commentEnd)                                                         // 55
          throwParseError("unclosed HTML comment");                               // 56
        advance(commentEnd.index + commentEnd[0].length);                         // 57
        continue;                                                                 // 58
      }                                                                           // 59
      if (matchTokenUnsupported) {                                                // 60
        switch (matchTokenUnsupported.toLowerCase()) {                            // 61
        case '<!doctype':                                                         // 62
          throwParseError(                                                        // 63
            "Can't set DOCTYPE here.  (Meteor sets <!DOCTYPE html> for you)");    // 64
        case '{{!':                                                               // 65
          throwParseError(                                                        // 66
            "Can't use '{{! }}' outside a template.  Use '<!-- -->'.");           // 67
        }                                                                         // 68
        throwParseError();                                                        // 69
      }                                                                           // 70
                                                                                  // 71
      // otherwise, a <tag>                                                       // 72
      var tagName = matchTokenTagName.toLowerCase();                              // 73
      var tagAttribs = {}; // bare name -> value dict                             // 74
      var rTagPart = /^\s*((([a-zA-Z0-9:_-]+)\s*=\s*(["'])(.*?)\4)|(>))/;         // 75
      var attr;                                                                   // 76
      // read attributes                                                          // 77
      while ((attr = rTagPart.exec(rest))) {                                      // 78
        var attrToken = attr[1];                                                  // 79
        var attrKey = attr[3];                                                    // 80
        var attrValue = attr[5];                                                  // 81
        advance(attr.index + attr[0].length);                                     // 82
        if (attrToken === '>')                                                    // 83
          break;                                                                  // 84
        // XXX we don't HTML unescape the attribute value                         // 85
        // (e.g. to allow "abcd&quot;efg") or protect against                     // 86
        // collisions with methods of tagAttribs (e.g. for                        // 87
        // a property named toString)                                             // 88
        attrValue = attrValue.match(/^\s*([\s\S]*?)\s*$/)[1]; // trim             // 89
        tagAttribs[attrKey] = attrValue;                                          // 90
      }                                                                           // 91
      if (! attr) // didn't end on '>'                                            // 92
        throwParseError("Parse error in tag");                                    // 93
      // find </tag>                                                              // 94
      var end = (new RegExp('</'+tagName+'\\s*>', 'i')).exec(rest);               // 95
      if (! end)                                                                  // 96
        throwParseError("unclosed <"+tagName+">");                                // 97
      var tagContents = rest.slice(0, end.index);                                 // 98
      var contentsStartIndex = index;                                             // 99
                                                                                  // 100
      // act on the tag                                                           // 101
      html_scanner._handleTag(results, tagName, tagAttribs, tagContents,          // 102
                              throwParseError, contentsStartIndex,                // 103
                              tagStartIndex);                                     // 104
                                                                                  // 105
      // advance afterwards, so that line numbers in errors are correct           // 106
      advance(end.index + end[0].length);                                         // 107
    }                                                                             // 108
                                                                                  // 109
    return results;                                                               // 110
  },                                                                              // 111
                                                                                  // 112
  _initResults: function() {                                                      // 113
    var results = {};                                                             // 114
    results.head = '';                                                            // 115
    results.body = '';                                                            // 116
    results.js = '';                                                              // 117
    return results;                                                               // 118
  },                                                                              // 119
                                                                                  // 120
  _handleTag: function (results, tag, attribs, contents, throwParseError,         // 121
                        contentsStartIndex, tagStartIndex) {                      // 122
                                                                                  // 123
    // trim the tag contents.                                                     // 124
    // this is a courtesy and is also relied on by some unit tests.               // 125
    var m = contents.match(/^([ \t\r\n]*)([\s\S]*?)[ \t\r\n]*$/);                 // 126
    contentsStartIndex += m[1].length;                                            // 127
    contents = m[2];                                                              // 128
                                                                                  // 129
    // do we have 1 or more attribs?                                              // 130
    var hasAttribs = false;                                                       // 131
    for(var k in attribs) {                                                       // 132
      if (attribs.hasOwnProperty(k)) {                                            // 133
        hasAttribs = true;                                                        // 134
        break;                                                                    // 135
      }                                                                           // 136
    }                                                                             // 137
                                                                                  // 138
    if (tag === "head") {                                                         // 139
      if (hasAttribs)                                                             // 140
        throwParseError("Attributes on <head> not supported");                    // 141
      results.head += contents;                                                   // 142
      return;                                                                     // 143
    }                                                                             // 144
                                                                                  // 145
                                                                                  // 146
    // <body> or <template>                                                       // 147
                                                                                  // 148
    try {                                                                         // 149
      if (tag === "template") {                                                   // 150
        var name = attribs.name;                                                  // 151
        if (! name)                                                               // 152
          throwParseError("Template has no 'name' attribute");                    // 153
                                                                                  // 154
        if (SpacebarsCompiler.isReservedName(name))                               // 155
          throwParseError("Template can't be named \"" + name + "\"");            // 156
                                                                                  // 157
        var renderFuncCode = SpacebarsCompiler.compile(                           // 158
          contents, {                                                             // 159
            isTemplate: true,                                                     // 160
            sourceName: 'Template "' + name + '"'                                 // 161
          });                                                                     // 162
                                                                                  // 163
        var nameLiteral = JSON.stringify(name);                                   // 164
        var templateDotNameLiteral = JSON.stringify("Template." + name);          // 165
                                                                                  // 166
        results.js += "\nTemplate.__checkName(" + nameLiteral + ");\n" +          // 167
          "Template[" + nameLiteral + "] = new Template(" +                       // 168
          templateDotNameLiteral + ", " + renderFuncCode + ");\n";                // 169
      } else {                                                                    // 170
        // <body>                                                                 // 171
        if (hasAttribs)                                                           // 172
          throwParseError("Attributes on <body> not supported");                  // 173
                                                                                  // 174
        var renderFuncCode = SpacebarsCompiler.compile(                           // 175
          contents, {                                                             // 176
            isBody: true,                                                         // 177
            sourceName: "<body>"                                                  // 178
          });                                                                     // 179
                                                                                  // 180
        // We may be one of many `<body>` tags.                                   // 181
        results.js += "\nTemplate.body.addContent(" + renderFuncCode + ");\nMeteor.startup(Template.body.renderToDocument);\n";
      }                                                                           // 183
    } catch (e) {                                                                 // 184
      if (e.scanner) {                                                            // 185
        // The error came from Spacebars                                          // 186
        throwParseError(e.message, contentsStartIndex + e.offset);                // 187
      } else {                                                                    // 188
        throw e;                                                                  // 189
      }                                                                           // 190
    }                                                                             // 191
  }                                                                               // 192
};                                                                                // 193
                                                                                  // 194
////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// plugin/compile-templates.js                                                    //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
                                                                                  //
var path = Npm.require('path');                                                   // 1
                                                                                  // 2
var doHTMLScanning = function (compileStep, htmlScanner) {                        // 3
  // XXX the way we deal with encodings here is sloppy .. should get              // 4
  // religion on that                                                             // 5
  var contents = compileStep.read().toString('utf8');                             // 6
  try {                                                                           // 7
    var results = htmlScanner.scan(contents, compileStep.inputPath);              // 8
  } catch (e) {                                                                   // 9
    if (e instanceof htmlScanner.ParseError) {                                    // 10
      compileStep.error({                                                         // 11
        message: e.message,                                                       // 12
        sourcePath: compileStep.inputPath,                                        // 13
        line: e.line                                                              // 14
      });                                                                         // 15
      return;                                                                     // 16
    } else                                                                        // 17
      throw e;                                                                    // 18
  }                                                                               // 19
                                                                                  // 20
  if (results.head)                                                               // 21
    compileStep.appendDocument({ section: "head", data: results.head });          // 22
                                                                                  // 23
  if (results.body)                                                               // 24
    compileStep.appendDocument({ section: "body", data: results.body });          // 25
                                                                                  // 26
  if (results.js) {                                                               // 27
    var path_part = path.dirname(compileStep.inputPath);                          // 28
    if (path_part === '.')                                                        // 29
      path_part = '';                                                             // 30
    if (path_part.length && path_part !== path.sep)                               // 31
      path_part = path_part + path.sep;                                           // 32
    var ext = path.extname(compileStep.inputPath);                                // 33
    var basename = path.basename(compileStep.inputPath, ext);                     // 34
                                                                                  // 35
    // XXX generate a source map                                                  // 36
                                                                                  // 37
    compileStep.addJavaScript({                                                   // 38
      path: path.join(path_part, "template." + basename + ".js"),                 // 39
      sourcePath: compileStep.inputPath,                                          // 40
      data: results.js                                                            // 41
    });                                                                           // 42
  }                                                                               // 43
};                                                                                // 44
                                                                                  // 45
Plugin.registerSourceHandler(                                                     // 46
  "html", {isTemplate: true, archMatching: 'web'},                                // 47
  function (compileStep) {                                                        // 48
    doHTMLScanning(compileStep, html_scanner);                                    // 49
  }                                                                               // 50
);                                                                                // 51
                                                                                  // 52
////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package.compileTemplates = {};

})();

//# sourceMappingURL=compileTemplates_plugin.js.map

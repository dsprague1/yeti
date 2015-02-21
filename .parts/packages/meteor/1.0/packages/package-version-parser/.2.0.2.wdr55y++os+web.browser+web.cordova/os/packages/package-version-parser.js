(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                   //
// packages/package-version-parser/package-version-parser.js                                         //
//                                                                                                   //
///////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                     //
// This file is in tools/package-version-parser.js and is symlinked into                             // 1
// packages/package-version-parser/package-version-parser.js. It's part                              // 2
// of both the tool and the package!  We don't use uniload for it because                            // 3
// it needs to be used as part of initializing the uniload catalog.                                  // 4
var inTool = typeof Package === 'undefined';                                                         // 5
                                                                                                     // 6
var PV;                                                                                              // 7
if (inTool) {                                                                                        // 8
  PV = exports;                                                                                      // 9
} else {                                                                                             // 10
  PackageVersion = PV = {};                                                                          // 11
}                                                                                                    // 12
                                                                                                     // 13
var semver = inTool ? require ('semver') : Npm.require('semver');                                    // 14
var __ = inTool ? require('underscore') : _;                                                         // 15
                                                                                                     // 16
// Takes in a meteor version, for example 1.2.3-rc5_1+12345.                                         // 17
//                                                                                                   // 18
// Returns an object composed of the following:                                                      // 19
//   semver: (ex: 1.2.3)                                                                             // 20
//   wrapNum: 0 or a valid wrap number.                                                              // 21
//                                                                                                   // 22
// Throws if the wrapNumber is invalid, or if the version cannot be split                            // 23
// reasonably.                                                                                       // 24
var extractSemverPart = function (versionString) {                                                   // 25
  if (!versionString) return { semver: "", wrapNum: -1 };                                            // 26
  var noBuild = versionString.split('+');                                                            // 27
  var splitVersion = noBuild[0].split('_');                                                          // 28
  var wrapNum = 0;                                                                                   // 29
  // If we find two +s, or two _, that's super invalid.                                              // 30
  if (noBuild.length > 2 || splitVersion.length > 2) {                                               // 31
    throwVersionParserError(                                                                         // 32
      "Version string must look like semver (eg '1.2.3'), not '"                                     // 33
        + versionString + "'.");                                                                     // 34
  } else if (splitVersion.length > 1) {                                                              // 35
    wrapNum = splitVersion[1];                                                                       // 36
    if (!/^\d+$/.test(wrapNum)) {                                                                    // 37
      throwVersionParserError(                                                                       // 38
        "The wrap number (after _) must contain only digits, so " +                                  // 39
          versionString + " is invalid.");                                                           // 40
    } else if (wrapNum[0] === "0") {                                                                 // 41
      throwVersionParserError(                                                                       // 42
        "The wrap number (after _) must not have a leading zero, so " +                              // 43
          versionString + " is invalid.");                                                           // 44
    }                                                                                                // 45
  }                                                                                                  // 46
  return {                                                                                           // 47
    semver: (noBuild.length > 1) ?                                                                   // 48
      splitVersion[0] + "+" + noBuild[1] :                                                           // 49
      splitVersion[0],                                                                               // 50
    wrapNum: parseInt(wrapNum, 10)                                                                   // 51
  };                                                                                                 // 52
};                                                                                                   // 53
                                                                                                     // 54
// Converts a meteor version into a large floating point number, which                               // 55
// is (more or less [*]) unique to that version. Satisfies the                                       // 56
// following guarantee: If PV.lessThan(v1, v2) then                                                  // 57
// PV.versionMagnitude(v1) < PV.versionMagnitude(v2) [*]                                             // 58
//                                                                                                   // 59
// [* XXX!] We don't quite satisfy the uniqueness and comparison properties in                       // 60
// these cases:                                                                                      // 61
// 1. If any of the version parts are greater than 100 (pretty unlikely?)                            // 62
// 2. If we're dealing with a prerelease version, we only look at the                                // 63
//    first two characters of each prerelease part. So, "1.0.0-beta" and                             // 64
//    "1.0.0-bear" will have the same magnitude.                                                     // 65
// 3. If we're dealing with a prerelease version with more than two parts, eg                        // 66
//    "1.0.0-rc.0.1". In this comparison may fail since we'd get to the limit                        // 67
//    of JavaScript floating point precision.                                                        // 68
//                                                                                                   // 69
// If we wanted to fix this, we'd make this function return a BigFloat                               // 70
// instead of a vanilla JavaScript number. That will make the                                        // 71
// constraint solver slower (by how much?), and would require some                                   // 72
// careful thought.                                                                                  // 73
PV.versionMagnitude = function (versionString) {                                                     // 74
  var version = extractSemverPart(versionString);                                                    // 75
  var v = semver.parse(version.semver);                                                              // 76
                                                                                                     // 77
  return v.major * 100 * 100 +                                                                       // 78
    v.minor * 100 +                                                                                  // 79
    v.patch +                                                                                        // 80
    version.wrapNum / 100 +                                                                          // 81
    prereleaseIdentifierToFraction(v.prerelease) / 100 / 100;                                        // 82
};                                                                                                   // 83
                                                                                                     // 84
// Accepts an array, eg ["rc", 2, 3]. Returns a number in the range                                  // 85
// (-1, 0].  An empty array returns 0. A non-empty string returns a                                  // 86
// number that is "as large" as the its precedence.                                                  // 87
var prereleaseIdentifierToFraction = function (prerelease) {                                         // 88
  if (prerelease.length === 0)                                                                       // 89
    return 0;                                                                                        // 90
                                                                                                     // 91
  return _.reduce(prerelease, function (memo, part, index) {                                         // 92
    var digit;                                                                                       // 93
    if (typeof part === 'number') {                                                                  // 94
      digit = part+1;                                                                                // 95
    } else if (typeof part === 'string') {                                                           // 96
      var VALID_CHARACTERS = "-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";                // 97
                                                                                                     // 98
      var validCharToNumber = function (ch) {                                                        // 99
        var result = VALID_CHARACTERS.indexOf(ch);                                                   // 100
        if (result === -1)                                                                           // 101
          throw new Error("Unexpected character in prerelease identifier: " + ch);                   // 102
        else                                                                                         // 103
          return result;                                                                             // 104
      };                                                                                             // 105
                                                                                                     // 106
      digit = 101 + // Numeric parts always have lower precedence than non-numeric parts.            // 107
        validCharToNumber(part[0]) * VALID_CHARACTERS.length +                                       // 108
        (part[1] ? validCharToNumber(part[1]) : 0);                                                  // 109
    } else {                                                                                         // 110
      throw new Error("Unexpected prerelease identifier part: " + part + " of type " + typeof part); // 111
    }                                                                                                // 112
                                                                                                     // 113
    // 3000 > 101 + VALID_CHARACTERS.length *                                                        // 114
    // VALID_CHARACTERS.length. And there's a test to verify this                                    // 115
    // ("test the edges of `versionMagnitude`")                                                      // 116
    return memo + digit / Math.pow(3000, index+1);                                                   // 117
  }, -1);                                                                                            // 118
};                                                                                                   // 119
                                                                                                     // 120
// Takes in two meteor versions. Returns true if the first one is less than the second.              // 121
PV.lessThan = function (versionOne, versionTwo) {                                                    // 122
  return PV.compare(versionOne, versionTwo) < 0;                                                     // 123
};                                                                                                   // 124
                                                                                                     // 125
// Given a string version, computes its default ECV (not counting any overrides).                    // 126
//                                                                                                   // 127
// versionString: valid meteor version string.                                                       // 128
PV.defaultECV = function (versionString) {                                                           // 129
  var version = extractSemverPart(versionString).semver;                                             // 130
  var parsed = semver.parse(version);                                                                // 131
  if (! parsed)                                                                                      // 132
     throwVersionParserError("not a valid version: " + version);                                     // 133
  return parsed.major + ".0.0";                                                                      // 134
}                                                                                                    // 135
                                                                                                     // 136
// Takes in two meteor versions. Returns 0 if equal, 1 if v1 is greater, -1 if                       // 137
// v2 is greater.                                                                                    // 138
PV.compare = function (versionOne, versionTwo) {                                                     // 139
  var meteorVOne = extractSemverPart(versionOne);                                                    // 140
  var meteorVTwo = extractSemverPart(versionTwo);                                                    // 141
                                                                                                     // 142
  // Wrap numbers only matter if the semver is equal, so if they don't even have                     // 143
  // wrap numbers, or if their semver is not equal, then we should let the                           // 144
  // semver library resolve this one.                                                                // 145
  if (meteorVOne.semver !== meteorVTwo.semver) {                                                     // 146
    return semver.compare(meteorVOne.semver, meteorVTwo.semver);                                     // 147
  }                                                                                                  // 148
                                                                                                     // 149
  // If their semver components are equal, then the one with the smaller wrap                        // 150
  // numbers is smaller.                                                                             // 151
  return meteorVOne.wrapNum - meteorVTwo.wrapNum;                                                    // 152
};                                                                                                   // 153
                                                                                                     // 154
// Conceptually we have three types of constraints:                                                  // 155
// 1. "compatible-with" - A@x.y.z - constraints package A to version x.y.z or                        // 156
//    higher, as long as the version is backwards compatible with x.y.z.                             // 157
//    "pick A compatible with x.y.z"                                                                 // 158
//    It is the default type.                                                                        // 159
// 2. "exactly" - A@=x.y.z - constraints package A only to version x.y.z and                         // 160
//    nothing else.                                                                                  // 161
//    "pick A exactly at x.y.z"                                                                      // 162
// 3. "any-reasonable" - "A"                                                                         // 163
//    Basically, this means any version of A ... other than ones that have                           // 164
//    dashes in the version (ie, are prerelease) ... unless the prerelease                           // 165
//    version has been explicitly selected (which at this stage in the game                          // 166
//    means they are mentioned in a top-level constraint in the top-level                            // 167
//    call to the resolver).                                                                         // 168
//                                                                                                   // 169
// Options:                                                                                          // 170
//    removeBuildIDs:  Remove the build ID at the end of the version.                                // 171
PV.parseVersionConstraint = function (versionString, options) {                                      // 172
  options = options || {};                                                                           // 173
  var versionDesc = { version: null, type: "any-reasonable" };                                       // 174
                                                                                                     // 175
  if (!versionString) {                                                                              // 176
    return versionDesc;                                                                              // 177
  }                                                                                                  // 178
                                                                                                     // 179
  if (versionString.charAt(0) === '=') {                                                             // 180
    versionDesc.type = "exactly";                                                                    // 181
    versionString = versionString.substr(1);                                                         // 182
  } else {                                                                                           // 183
    versionDesc.type = "compatible-with";                                                            // 184
  }                                                                                                  // 185
                                                                                                     // 186
  // This will throw if the version string is invalid.                                               // 187
  PV.getValidServerVersion(versionString);                                                           // 188
                                                                                                     // 189
  if (options.removeBuildIDs) {                                                                      // 190
    versionString = PV.removeBuildID(versionString);                                                 // 191
  }                                                                                                  // 192
                                                                                                     // 193
  versionDesc.version = versionString;                                                               // 194
                                                                                                     // 195
  return versionDesc;                                                                                // 196
};                                                                                                   // 197
                                                                                                     // 198
                                                                                                     // 199
// Check to see if the versionString that we pass in is a valid meteor version.                      // 200
//                                                                                                   // 201
// Returns a valid meteor version string that can be included in the                                 // 202
// server. That means that it has everything EXCEPT the build id. Throws if the                      // 203
// entered string was invalid.                                                                       // 204
PV.getValidServerVersion = function (meteorVersionString) {                                          // 205
                                                                                                     // 206
  // Strip out the wrapper num, if present and check that it is valid.                               // 207
  var version = extractSemverPart(meteorVersionString);                                              // 208
                                                                                                     // 209
  var versionString = version.semver;                                                                // 210
  // NPM's semver spec supports things like 'v1.0.0' and considers them valid,                       // 211
  // but we don't. Everything before the + or - should be of the x.x.x form.                         // 212
  var mainVersion = versionString.split('+')[0].split('-')[0];                                       // 213
  if (! /^\d+\.\d+\.\d+$/.test(mainVersion)) {                                                       // 214
      throwVersionParserError(                                                                       // 215
        "Version string must look like semver (eg '1.2.3'), not '"                                   // 216
          + versionString + "'.");                                                                   // 217
  };                                                                                                 // 218
                                                                                                     // 219
  var cleanVersion = semver.valid(versionString);                                                    // 220
  if (! cleanVersion ) {                                                                             // 221
    throwVersionParserError(                                                                         // 222
      "Version string must look like semver (eg '1.2.3'), not '"                                     // 223
        + versionString + "'.");                                                                     // 224
  }                                                                                                  // 225
                                                                                                     // 226
  if (version.wrapNum) {                                                                             // 227
    cleanVersion = cleanVersion + "_" + version.wrapNum;                                             // 228
  }                                                                                                  // 229
                                                                                                     // 230
  return cleanVersion;                                                                               // 231
};                                                                                                   // 232
                                                                                                     // 233
                                                                                                     // 234
PV.parseConstraint = function (constraintString, options) {                                          // 235
  if (typeof constraintString !== "string")                                                          // 236
    throw new TypeError("constraintString must be a string");                                        // 237
  options = options || {};                                                                           // 238
                                                                                                     // 239
  var splitted = constraintString.split('@');                                                        // 240
                                                                                                     // 241
  var name = splitted[0];                                                                            // 242
  var versionString = splitted[1];                                                                   // 243
                                                                                                     // 244
  if (splitted.length > 2) {                                                                         // 245
    // throw error complaining about @                                                               // 246
    PV.validatePackageName('a@');                                                                    // 247
  }                                                                                                  // 248
                                                                                                     // 249
  if (options.archesOK) {                                                                            // 250
    var newNames = name.split('#');                                                                  // 251
    if (newNames.length > 2) {                                                                       // 252
      // It is invalid and should register as such. This will throw.                                 // 253
      PV.validatePackageName(name);                                                                  // 254
    }                                                                                                // 255
    PV.validatePackageName(newNames[0]);                                                             // 256
  } else {                                                                                           // 257
    PV.validatePackageName(name);                                                                    // 258
  }                                                                                                  // 259
                                                                                                     // 260
  if (splitted.length === 2 && !versionString) {                                                     // 261
    throwVersionParserError(                                                                         // 262
      "Version constraint for package '" + name +                                                    // 263
        "' cannot be empty; leave off the @ if you don't want to constrain " +                       // 264
        "the version.");                                                                             // 265
  }                                                                                                  // 266
                                                                                                     // 267
  var constraint = {                                                                                 // 268
    name: name                                                                                       // 269
  };                                                                                                 // 270
                                                                                                     // 271
  // Before we parse through versionString, we save it for future output.                            // 272
  constraint.constraintString = versionString;                                                       // 273
                                                                                                     // 274
  // If we did not specify a version string, then our only constraint is                             // 275
  // any-reasonable, so we are going to return that.                                                 // 276
  if (!versionString) {                                                                              // 277
    constraint.constraints =                                                                         // 278
      [ { version: null, type: "any-reasonable" } ];                                                 // 279
    return constraint;                                                                               // 280
  }                                                                                                  // 281
                                                                                                     // 282
  // Let's parse out the versionString.                                                              // 283
  var versionConstraints = versionString.split(/ *\|\| */);                                          // 284
  constraint.constraints = [];                                                                       // 285
  __.each(versionConstraints, function (versionCon) {                                                // 286
    constraint.constraints.push(                                                                     // 287
      PV.parseVersionConstraint(versionCon, options));                                               // 288
  });                                                                                                // 289
                                                                                                     // 290
  return constraint;                                                                                 // 291
};                                                                                                   // 292
                                                                                                     // 293
PV.validatePackageName = function (packageName, options) {                                           // 294
  options = options || {};                                                                           // 295
                                                                                                     // 296
  var badChar = packageName.match(/[^a-z0-9:.\-]/);                                                  // 297
  if (badChar) {                                                                                     // 298
    if (options.detailedColonExplanation) {                                                          // 299
      throwVersionParserError(                                                                       // 300
        "Bad character in package name: " + JSON.stringify(badChar[0]) +                             // 301
          ".\n\nPackage names can only contain lowercase ASCII alphanumerics, " +                    // 302
          "dash, or dot.\nIf you plan to publish a package, it must be " +                           // 303
          "prefixed with your\nMeteor Developer Account username and a colon.");                     // 304
    }                                                                                                // 305
    throwVersionParserError(                                                                         // 306
      "Package names can only contain lowercase ASCII alphanumerics, dash, " +                       // 307
        "dot, or colon, not " + JSON.stringify(badChar[0]) + ".");                                   // 308
  }                                                                                                  // 309
  if (!/[a-z]/.test(packageName)) {                                                                  // 310
    throwVersionParserError("Package names must contain a lowercase ASCII letter.");                 // 311
  }                                                                                                  // 312
  if (packageName[0] === '.') {                                                                      // 313
    throwVersionParserError("Package names may not begin with a dot.");                              // 314
  }                                                                                                  // 315
};                                                                                                   // 316
                                                                                                     // 317
var throwVersionParserError = function (message) {                                                   // 318
  var e = new Error(message);                                                                        // 319
  e.versionParserError = true;                                                                       // 320
  throw e;                                                                                           // 321
};                                                                                                   // 322
                                                                                                     // 323
PV.constraintToFullString = function (parsedConstraint) {                                            // 324
  return parsedConstraint.name + "@" + parsedConstraint.constraintString;                            // 325
};                                                                                                   // 326
                                                                                                     // 327
                                                                                                     // 328
// Return true if the version constraint was invalid prior to 0.9.3                                  // 329
// (adding _ and || support)                                                                         // 330
//                                                                                                   // 331
// NOTE: this is not used on the client yet. This package is used by the                             // 332
// package server to determine what is valid.                                                        // 333
PV.invalidFirstFormatConstraint = function (validConstraint) {                                       // 334
  if (!validConstraint) return false;                                                                // 335
  // We can check this easily right now, because we introduced some new                              // 336
  // characters. Anything with those characters is invalid prior to                                  // 337
  // 0.9.3. XXX: If we ever have to go through these, we should write a more                         // 338
  // complicated regex.                                                                              // 339
  return (/_/.test(validConstraint) ||                                                               // 340
          /\|/.test(validConstraint));                                                               // 341
};                                                                                                   // 342
                                                                                                     // 343
// Remove a suffix like "+local" if present.                                                         // 344
PV.removeBuildID = function (versionString) {                                                        // 345
  return versionString.replace(/\+.*$/, '');                                                         // 346
};                                                                                                   // 347
                                                                                                     // 348
///////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

(function () {

///////////////////////////////////////////////////////////////////////////////////
//                                                                               //
// packages/star-translate/translator.js                                         //
//                                                                               //
///////////////////////////////////////////////////////////////////////////////////
                                                                                 //
var fs = Npm.require('fs');                                                      // 1
var path = Npm.require('path');                                                  // 2
var ncp = Npm.require('ncp').ncp;                                                // 3
                                                                                 // 4
StarTranslator = {};                                                             // 5
                                                                                 // 6
// Produces a star version of bundlePath in translatedPath, where bundlePath can // 7
// point to either an old Meteor bundle or a star. Returns the star's manifest.  // 8
// bundlePath can equal translatedPath, in which case bundlePath is converted    // 9
// directly into a star.                                                         // 10
StarTranslator.maybeTranslate = function (bundlePath, translatedPath) {          // 11
  var self = this;                                                               // 12
  if (path.resolve(bundlePath) !== path.resolve(translatedPath)) {               // 13
    var _ncp = Meteor.wrapAsync(ncp);                                            // 14
    _ncp(bundlePath, translatedPath);                                            // 15
  }                                                                              // 16
                                                                                 // 17
  try {                                                                          // 18
    // If the directory contains a star.json file with JSON inside it, then we   // 19
    // consider it a star. Otherwise we translate it into a star.                // 20
    var manifest = JSON.parse(fs.readFileSync(path.join(translatedPath,          // 21
                                                        "star.json"),            // 22
                                              'utf8'));                          // 23
    return manifest;                                                             // 24
  } catch (e) {                                                                  // 25
    return self._translate(translatedPath);                                      // 26
  }                                                                              // 27
};                                                                               // 28
                                                                                 // 29
StarTranslator._translate = function (bundlePath) {                              // 30
  var self = this;                                                               // 31
  var clientProgPath = path.join(bundlePath, 'client.json');                     // 32
  var serverProgPath = path.join(bundlePath, 'server.sh');                       // 33
  var starPath = path.join(bundlePath, 'star.json');                             // 34
                                                                                 // 35
  // Format defined in meteor/tools/bundler.js                                   // 36
  var manifest = {                                                               // 37
    "format": "site-archive-pre1",                                               // 38
    "builtBy": "Star translator",                                                // 39
    "programs": [                                                                // 40
      {                                                                          // 41
        "name": "web.browser",                                                   // 42
        "arch": "web.browser",                                                   // 43
        "path": "client.json"                                                    // 44
      },                                                                         // 45
      {                                                                          // 46
        "name": "server",                                                        // 47
        "arch": self._getArch(),                                                 // 48
        "path": "server.sh"                                                      // 49
      }                                                                          // 50
    ]                                                                            // 51
  };                                                                             // 52
                                                                                 // 53
  self._writeServerProg(bundlePath, serverProgPath);                             // 54
  self._writeClientProg(bundlePath, clientProgPath);                             // 55
                                                                                 // 56
  fs.writeFileSync(starPath, JSON.stringify(manifest, null, 2));                 // 57
  return manifest;                                                               // 58
};                                                                               // 59
                                                                                 // 60
StarTranslator._writeServerProg = function (bundlePath, serverProgPath) {        // 61
  var platform = this._getPlatform();                                            // 62
  var bundleVersion = this._getBundleVersion(bundlePath);                        // 63
  var runFile = 'main.js';                                                       // 64
  var serverScript = DevBundleFetcher.script();                                  // 65
  // Duplicated from meteor/tools/bundler.js                                     // 66
  serverScript = serverScript.replace(/##PLATFORM##/g, platform);                // 67
  serverScript = serverScript.replace(/##BUNDLE_VERSION##/g, bundleVersion);     // 68
  serverScript = serverScript.replace(/##RUN_FILE##/g, runFile);                 // 69
  serverScript = serverScript.replace(/##IMAGE##/g, '');                         // 70
  fs.writeFileSync(serverProgPath, serverScript);                                // 71
  fs.chmodSync(serverProgPath, '744');                                           // 72
};                                                                               // 73
                                                                                 // 74
StarTranslator._getArch = function () {                                          // 75
  return Meteor.settings.arch;                                                   // 76
};                                                                               // 77
                                                                                 // 78
StarTranslator._getPlatform = function () {                                      // 79
  var self = this;                                                               // 80
  // Duplicated from meteor/tools/bundler.js                                     // 81
  var archToPlatform = {                                                         // 82
    'os.linux.x86_32': 'Linux_i686',                                             // 83
    'os.linux.x86_64': 'Linux_x86_64',                                           // 84
    'os.osx.x86_64': 'Darwin_x86_64'                                             // 85
  };                                                                             // 86
  return archToPlatform[self._getArch()];                                        // 87
};                                                                               // 88
                                                                                 // 89
StarTranslator._getBundleVersion = function (bundlePath) {                       // 90
  var version = fs.readFileSync(path.join(bundlePath,                            // 91
                                          "server", ".bundle_version.txt"),      // 92
                                'utf8');                                         // 93
  return version.trim();                                                         // 94
};                                                                               // 95
                                                                                 // 96
StarTranslator._writeClientProg = function (bundlePath, clientProgPath) {        // 97
  var origClientManifest = JSON.parse(fs.readFileSync(path.join(bundlePath,      // 98
                                                                "app.json"),     // 99
                                                      'utf8'));                  // 100
  var clientManifest = {                                                         // 101
    "format": "web-program-pre1",                                                // 102
    "manifest": origClientManifest.manifest,                                     // 103
    // XXX Haven't updated this for the app.html -> head/body change, but        // 104
    //     surely we don't need to because code in pre-star apps doesn't         // 105
    //     even read this file?                                                  // 106
    "page": "app.html",                                                          // 107
    "static": "static",                                                          // 108
    "staticCacheable": "static_cacheable"                                        // 109
  };                                                                             // 110
  fs.writeFileSync(clientProgPath, JSON.stringify(clientManifest, null, 2));     // 111
};                                                                               // 112
                                                                                 // 113
///////////////////////////////////////////////////////////////////////////////////

}).call(this);

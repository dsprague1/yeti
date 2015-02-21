(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/constraint-solver/constraint-solver.js                                                                 //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
// Copied from archinfo.matches() in tools/                                                                        // 1
var archMatches = function (arch, baseArch) {                                                                      // 2
  return arch.substr(0, baseArch.length) === baseArch &&                                                           // 3
    (arch.length === baseArch.length ||                                                                            // 4
     arch.substr(baseArch.length, 1) === ".");                                                                     // 5
};                                                                                                                 // 6
                                                                                                                   // 7
ConstraintSolver = {};                                                                                             // 8
                                                                                                                   // 9
// catalog is a catalog.Catalog object. We have to pass this in because                                            // 10
// we're in a package and can't require('release.js'). If this code                                                // 11
// moves to the tool, or if all of the tool code moves to a star, we                                               // 12
// should get cat from release.current.catalog rather than passing it                                              // 13
// in.                                                                                                             // 14
ConstraintSolver.PackagesResolver = function (catalog, options) {                                                  // 15
  var self = this;                                                                                                 // 16
                                                                                                                   // 17
  options = options || {};                                                                                         // 18
                                                                                                                   // 19
  self.catalog = catalog;                                                                                          // 20
                                                                                                                   // 21
  // The main resolver                                                                                             // 22
  self.resolver = new ConstraintSolver.Resolver({                                                                  // 23
    nudge: options.nudge                                                                                           // 24
  });                                                                                                              // 25
                                                                                                                   // 26
  self._packageInfoLoadQueue = [];                                                                                 // 27
  self._packagesEverEnqueued = {};                                                                                 // 28
  self._loadingPackageInfo = false;                                                                                // 29
};                                                                                                                 // 30
                                                                                                                   // 31
ConstraintSolver.PackagesResolver.prototype._ensurePackageInfoLoaded = function (                                  // 32
    packageName) {                                                                                                 // 33
  var self = this;                                                                                                 // 34
  if (_.has(self._packagesEverEnqueued, packageName))                                                              // 35
    return;                                                                                                        // 36
  self._packagesEverEnqueued[packageName] = true;                                                                  // 37
  self._packageInfoLoadQueue.push(packageName);                                                                    // 38
                                                                                                                   // 39
  // Is there already an instance of _ensurePackageInfoLoaded up the stack?                                        // 40
  // Great, it'll get this.                                                                                        // 41
  // XXX does this work correctly with multiple fibers?                                                            // 42
  if (self._loadingPackageInfo)                                                                                    // 43
    return;                                                                                                        // 44
                                                                                                                   // 45
  self._loadingPackageInfo = true;                                                                                 // 46
  try {                                                                                                            // 47
    while (self._packageInfoLoadQueue.length) {                                                                    // 48
      var nextPackageName = self._packageInfoLoadQueue.shift();                                                    // 49
      self._loadPackageInfo(nextPackageName);                                                                      // 50
    }                                                                                                              // 51
  } finally {                                                                                                      // 52
    self._loadingPackageInfo = false;                                                                              // 53
  }                                                                                                                // 54
};                                                                                                                 // 55
                                                                                                                   // 56
ConstraintSolver.PackagesResolver.prototype._loadPackageInfo = function (                                          // 57
    packageName) {                                                                                                 // 58
  var self = this;                                                                                                 // 59
                                                                                                                   // 60
  // XXX in theory there might be different archs but in practice they are                                         // 61
  // always "os", "web.browser" and "web.cordova". Fix this once we                                                // 62
  // actually have different archs used.                                                                           // 63
  var allArchs = ["os", "web.browser", "web.cordova"];                                                             // 64
                                                                                                                   // 65
  // We rely on sortedness in the constraint solver, since one of the cost                                         // 66
  // functions wants to be able to quickly find the earliest or latest version.                                    // 67
  var sortedVersions = self.catalog.getSortedVersions(packageName);                                                // 68
  _.each(sortedVersions, function (version) {                                                                      // 69
    var versionDef = self.catalog.getVersion(packageName, version);                                                // 70
                                                                                                                   // 71
    var unibuilds = {};                                                                                            // 72
                                                                                                                   // 73
    _.each(allArchs, function (arch) {                                                                             // 74
      var unitName = packageName + "#" + arch;                                                                     // 75
      unibuilds[unitName] = new ConstraintSolver.UnitVersion(                                                      // 76
        unitName, version, versionDef.earliestCompatibleVersion);                                                  // 77
      self.resolver.addUnitVersion(unibuilds[unitName]);                                                           // 78
    });                                                                                                            // 79
                                                                                                                   // 80
    _.each(versionDef.dependencies, function (dep, depName) {                                                      // 81
      self._ensurePackageInfoLoaded(depName);                                                                      // 82
                                                                                                                   // 83
      _.each(dep.references, function (ref) {                                                                      // 84
        _.each(allArchs, function (arch) {                                                                         // 85
          if (archMatches(arch, ref.arch)) {                                                                       // 86
            var unitName = packageName + "#" + arch;                                                               // 87
            var unitVersion = unibuilds[unitName];                                                                 // 88
                                                                                                                   // 89
            if (! unitVersion)                                                                                     // 90
              throw new Error("A non-standard arch " + arch + " for package " + packageName);                      // 91
                                                                                                                   // 92
            var targetUnitName = depName + "#" + arch;                                                             // 93
                                                                                                                   // 94
            // Add the dependency if needed                                                                        // 95
            if (! ref.weak)                                                                                        // 96
              unitVersion.addDependency(targetUnitName);                                                           // 97
                                                                                                                   // 98
            // Add a constraint if such exists                                                                     // 99
            if (dep.constraint && dep.constraint !== "none") {                                                     // 100
              var constraint =                                                                                     // 101
                self.resolver.getConstraint(targetUnitName, dep.constraint);                                       // 102
              unitVersion.addConstraint(constraint);                                                               // 103
            }                                                                                                      // 104
          }                                                                                                        // 105
        });                                                                                                        // 106
      });                                                                                                          // 107
    });                                                                                                            // 108
                                                                                                                   // 109
    // Every unibuild implies that if it is picked, other unibuilds are                                            // 110
    // constrained to the same version.                                                                            // 111
    _.each(unibuilds, function (unibuild, unibuildName) {                                                          // 112
      _.each(unibuilds, function (other, otherUnibuildName) {                                                      // 113
        if (unibuild === other)                                                                                    // 114
          return;                                                                                                  // 115
                                                                                                                   // 116
        // Constraint is the exact same version of a unibuild                                                      // 117
        var constraintStr = "=" + version;                                                                         // 118
        var constraint =                                                                                           // 119
          self.resolver.getConstraint(otherUnibuildName, constraintStr);                                           // 120
        unibuild.addConstraint(constraint);                                                                        // 121
      });                                                                                                          // 122
    });                                                                                                            // 123
  });                                                                                                              // 124
                                                                                                                   // 125
  // We need to be aware of the earliestCompatibleVersion values for any                                           // 126
  // packages that are overridden by local packages, in order to evaluate                                          // 127
  // 'compatible-with' constraints that name that version.                                                         // 128
  // (Some of the test fixtures don't bother to implement this method.)                                            // 129
  if (self.catalog.getForgottenECVs) {                                                                             // 130
    _.each(self.catalog.getForgottenECVs(packageName), function (ecv, version) {                                   // 131
      _.each(allArchs, function (arch) {                                                                           // 132
        var unitName = packageName + '#' + arch;                                                                   // 133
        self.resolver.addExtraECV(unitName, version, ecv);                                                         // 134
      });                                                                                                          // 135
    });                                                                                                            // 136
  }                                                                                                                // 137
};                                                                                                                 // 138
                                                                                                                   // 139
// dependencies - an array of string names of packages (not slices)                                                // 140
// constraints - an array of objects:                                                                              // 141
//  (almost, but not quite, what PackageVersion.parseConstraint returns)                                           // 142
//  - packageName - string name                                                                                    // 143
//  - version - string constraint                                                                                  // 144
//  - type - constraint type                                                                                       // 145
// options:                                                                                                        // 146
//  - upgrade - list of dependencies for which upgrade is prioritized higher                                       // 147
//  than keeping the old version                                                                                   // 148
//  - previousSolution - mapping from package name to a version that was used in                                   // 149
//  the previous constraint solver run                                                                             // 150
ConstraintSolver.PackagesResolver.prototype.resolve = function (                                                   // 151
    dependencies, constraints, options) {                                                                          // 152
  var self = this;                                                                                                 // 153
  // clone because we mutate options                                                                               // 154
  options = _.extend({                                                                                             // 155
    _testing: false,                                                                                               // 156
    upgrade: []                                                                                                    // 157
  }, options || {});                                                                                               // 158
                                                                                                                   // 159
  check(dependencies, [String]);                                                                                   // 160
                                                                                                                   // 161
  check(constraints, [{                                                                                            // 162
    name: String,                                                                                                  // 163
    constraintString: Match.Optional(Match.OneOf(String, undefined)),                                              // 164
    constraints: [{                                                                                                // 165
      version: Match.OneOf(String, null),                                                                          // 166
      type: String }]                                                                                              // 167
  }]);                                                                                                             // 168
                                                                                                                   // 169
  check(options, {                                                                                                 // 170
    _testing: Match.Optional(Boolean),                                                                             // 171
    upgrade: [String],                                                                                             // 172
    previousSolution: Match.Optional(Object)                                                                       // 173
  });                                                                                                              // 174
                                                                                                                   // 175
  _.each(dependencies, function (packageName) {                                                                    // 176
    self._ensurePackageInfoLoaded(packageName);                                                                    // 177
  });                                                                                                              // 178
  _.each(constraints, function (constraint) {                                                                      // 179
    self._ensurePackageInfoLoaded(constraint.name);                                                                // 180
  });                                                                                                              // 181
  _.each(options.previousSolution, function (version, packageName) {                                               // 182
    self._ensurePackageInfoLoaded(packageName);                                                                    // 183
  });                                                                                                              // 184
                                                                                                                   // 185
  // XXX glasser and ekate added this filter to strip some undefineds that                                         // 186
  // were causing crashes, but maybe the real answer is that there shouldn't                                       // 187
  // have been undefineds?                                                                                         // 188
  if (options.previousSolution) {                                                                                  // 189
    options.previousSolution =                                                                                     // 190
      _.filter(_.flatten(                                                                                          // 191
        _.map(options.previousSolution, function (version, packageName) {                                          // 192
      return _.map(self._unibuildsForPackage(packageName), function (unitName) {                                   // 193
        return self.resolver._unitsVersionsMap[unitName + "@" + version];                                          // 194
      });                                                                                                          // 195
    })), _.identity);                                                                                              // 196
  }                                                                                                                // 197
                                                                                                                   // 198
  // split every package name to one or more archs belonging to that package                                       // 199
  // (["foobar"] => ["foobar#os", "foobar#web.browser", ...])                                                      // 200
  // XXX for now just hardcode in all of the known architectures                                                   // 201
  var upgradeUnibuilds = {};                                                                                       // 202
  _.each(options.upgrade, function (packageName) {                                                                 // 203
    _.each(self._unibuildsForPackage(packageName), function (unibuildName) {                                       // 204
      upgradeUnibuilds[unibuildName] = true;                                                                       // 205
    });                                                                                                            // 206
  });                                                                                                              // 207
  options.upgrade = upgradeUnibuilds;                                                                              // 208
                                                                                                                   // 209
  var dc = self._splitDepsToConstraints(dependencies, constraints);                                                // 210
                                                                                                                   // 211
  options.rootDependencies = dc.dependencies;                                                                      // 212
  var resolverOptions = self._getResolverOptions(options);                                                         // 213
  var res = null;                                                                                                  // 214
  // If a previous solution existed, try resolving with additional (weak)                                          // 215
  // equality constraints on all the versions from the previous solution (except                                   // 216
  // those we've explicitly been asked to update). If it's possible to solve the                                   // 217
  // constraints without changing any of the previous versions (though we may                                      // 218
  // add more choices in addition, or remove some now-unnecessary choices) then                                    // 219
  // that's our first try.                                                                                         // 220
  //                                                                                                               // 221
  // If we're intentionally trying to upgrade some or all packages, we just skip                                   // 222
  // this step. We used to try to do this step but just leaving off pins from                                      // 223
  // the packages we're trying to upgrade, but this tended to not lead to actual                                   // 224
  // upgrades since we were still pinning things that the to-upgrade package                                       // 225
  // depended on.  (We still use the specific contents of options.upgrade to                                       // 226
  // guide which things are encouraged to be upgraded vs stay the same in the                                      // 227
  // heuristic.)                                                                                                   // 228
  if (!_.isEmpty(options.previousSolution) && _.isEmpty(options.upgrade)) {                                        // 229
    var constraintsWithPreviousSolutionLock = _.clone(dc.constraints);                                             // 230
    _.each(options.previousSolution, function (uv) {                                                               // 231
      constraintsWithPreviousSolutionLock.push(                                                                    // 232
        self.resolver.getConstraint(uv.name, '=' + uv.version));                                                   // 233
    });                                                                                                            // 234
    try {                                                                                                          // 235
      // Try running the resolver. If it fails to resolve, that's OK, we'll keep                                   // 236
      // working.                                                                                                  // 237
      res = self.resolver.resolve(                                                                                 // 238
        dc.dependencies, constraintsWithPreviousSolutionLock, resolverOptions);                                    // 239
    } catch (e) {                                                                                                  // 240
      if (!(e.constraintSolverError))                                                                              // 241
        throw e;                                                                                                   // 242
    }                                                                                                              // 243
  }                                                                                                                // 244
                                                                                                                   // 245
  // Either we didn't have a previous solution, or it doesn't work. Try again                                      // 246
  // without locking in the previous solution as strict equality.                                                  // 247
  if (!res) {                                                                                                      // 248
    try {                                                                                                          // 249
      res = self.resolver.resolve(                                                                                 // 250
        dc.dependencies, dc.constraints, resolverOptions);                                                         // 251
    } catch (e) {                                                                                                  // 252
      if (!(e.constraintSolverError))                                                                              // 253
        throw e;                                                                                                   // 254
    }                                                                                                              // 255
  }                                                                                                                // 256
                                                                                                                   // 257
  // As a last-ditch effort, let's take a look at all the prerelease                                               // 258
  // versions. Is it possible that a pre-release version will satisfy our                                          // 259
  // constraints?                                                                                                  // 260
  if (!res) {                                                                                                      // 261
    resolverOptions["useRCs"] = true;                                                                              // 262
    res = self.resolver.resolve(                                                                                   // 263
      dc.dependencies, dc.constraints, resolverOptions);                                                           // 264
  }                                                                                                                // 265
  var ret = { answer:  resolverResultToPackageMap(res) };                                                          // 266
  if (resolverOptions.useRCs)                                                                                      // 267
    ret.usedRCs = true;                                                                                            // 268
  return ret;                                                                                                      // 269
};                                                                                                                 // 270
                                                                                                                   // 271
var removeUnibuild = function (unitName) {                                                                         // 272
  return unitName.split('#')[0];                                                                                   // 273
};                                                                                                                 // 274
                                                                                                                   // 275
var resolverResultToPackageMap = function (choices) {                                                              // 276
  var packageMap = {};                                                                                             // 277
  mori.each(choices, function (nameAndUv) {                                                                        // 278
    var name = mori.first(nameAndUv);                                                                              // 279
    var uv = mori.last(nameAndUv);                                                                                 // 280
    // Since we don't yet define the interface for a an app to depend only on                                      // 281
    // certain unibuilds of the packages (like only web unibuilds) and we know                                     // 282
    // that each unibuild weakly depends on other sibling unibuilds of the same                                    // 283
    // version, we can safely output the whole package for each unibuild in the                                    // 284
    // result.                                                                                                     // 285
    packageMap[removeUnibuild(name)] = uv.version;                                                                 // 286
  });                                                                                                              // 287
  return packageMap;                                                                                               // 288
};                                                                                                                 // 289
                                                                                                                   // 290
                                                                                                                   // 291
// takes dependencies and constraints and rewrites the names from "foo" to                                         // 292
// "foo#os" and "foo#web.browser" and "foo#web.cordova"                                                            // 293
// XXX right now creates a dependency for every unibuild it can find                                               // 294
ConstraintSolver.PackagesResolver.prototype._splitDepsToConstraints =                                              // 295
  function (inputDeps, inputConstraints) {                                                                         // 296
  var self = this;                                                                                                 // 297
  var dependencies = [];                                                                                           // 298
  var constraints = [];                                                                                            // 299
                                                                                                                   // 300
  _.each(inputDeps, function (packageName) {                                                                       // 301
    _.each(self._unibuildsForPackage(packageName), function (unibuildName) {                                       // 302
      dependencies.push(unibuildName);                                                                             // 303
    });                                                                                                            // 304
  });                                                                                                              // 305
                                                                                                                   // 306
  _.each(inputConstraints, function (constraint) {                                                                 // 307
    _.each(self._unibuildsForPackage(constraint.name), function (unibuildName) {                                   // 308
      //XXX: This is kind of dumb -- we make this up, so we can reparse it                                         // 309
      //later. Todo: clean this up a bit.                                                                          // 310
      if (!constraint.constraintString) {                                                                          // 311
        var constraintArray = [];                                                                                  // 312
        _.each(constraint.constraints, function (c) {                                                              // 313
          if (c.type == "exact") {                                                                                 // 314
            constraintArray.push("+" + c.version);                                                                 // 315
          } else if (c.version) {                                                                                  // 316
            constraintArray.push(c.version)                                                                        // 317
          }                                                                                                        // 318
         });                                                                                                       // 319
        if (!_.isEmpty(constraintArray)) {                                                                         // 320
         constraint.constraintString =                                                                             // 321
           _.reduce(constraintArray,                                                                               // 322
            function(x, y) {                                                                                       // 323
              return x + " || " + y;                                                                               // 324
           });                                                                                                     // 325
         } else {                                                                                                  // 326
           constraint.constraintString = "";                                                                       // 327
         }                                                                                                         // 328
        }                                                                                                          // 329
      constraints.push(                                                                                            // 330
        self.resolver.getConstraint(unibuildName, constraint.constraintString));                                   // 331
    });                                                                                                            // 332
  });                                                                                                              // 333
                                                                                                                   // 334
 return { dependencies: dependencies, constraints: constraints };                                                  // 335
};                                                                                                                 // 336
                                                                                                                   // 337
ConstraintSolver.PackagesResolver.prototype._unibuildsForPackage =                                                 // 338
  function (packageName) {                                                                                         // 339
  var self = this;                                                                                                 // 340
  var unibuildPrefix = packageName + "#";                                                                          // 341
  var unibuilds = [];                                                                                              // 342
  // XXX hardcode all common architectures assuming that every package has the                                     // 343
  // same set of architectures.                                                                                    // 344
  _.each(["os", "web.browser", "web.cordova"], function (arch) {                                                   // 345
    unibuilds.push(unibuildPrefix + arch);                                                                         // 346
  });                                                                                                              // 347
                                                                                                                   // 348
  return unibuilds;                                                                                                // 349
};                                                                                                                 // 350
                                                                                                                   // 351
ConstraintSolver.PackagesResolver.prototype._getResolverOptions =                                                  // 352
  function (options) {                                                                                             // 353
  var self = this;                                                                                                 // 354
                                                                                                                   // 355
  var resolverOptions = {};                                                                                        // 356
                                                                                                                   // 357
  if (options._testing) {                                                                                          // 358
    resolverOptions.costFunction = function (state) {                                                              // 359
      return mori.reduce(mori.sum, 0, mori.map(function (nameAndUv) {                                              // 360
        return PackageVersion.versionMagnitude(mori.last(nameAndUv).version);                                      // 361
      }, state.choices));                                                                                          // 362
    };                                                                                                             // 363
  } else {                                                                                                         // 364
    // Poorman's enum                                                                                              // 365
    var VMAJOR = 0, MAJOR = 1, MEDIUM = 2, MINOR = 3;                                                              // 366
    var rootDeps = options.rootDependencies || [];                                                                 // 367
    var prevSol = options.previousSolution || [];                                                                  // 368
                                                                                                                   // 369
    var isRootDep = {};                                                                                            // 370
    var prevSolMapping = {};                                                                                       // 371
                                                                                                                   // 372
    _.each(rootDeps, function (dep) { isRootDep[dep] = true; });                                                   // 373
                                                                                                                   // 374
    // if the upgrade is preferred over preserving previous solution, pretend                                      // 375
    // there are no previous solution                                                                              // 376
    _.each(prevSol, function (uv) {                                                                                // 377
      if (! _.has(options.upgrade, uv.name))                                                                       // 378
        prevSolMapping[uv.name] = uv;                                                                              // 379
    });                                                                                                            // 380
                                                                                                                   // 381
    resolverOptions.costFunction = function (state, options) {                                                     // 382
      options = options || {};                                                                                     // 383
      // very major, major, medium, minor costs                                                                    // 384
      // XXX maybe these can be calculated lazily?                                                                 // 385
      var cost = [0, 0, 0, 0];                                                                                     // 386
                                                                                                                   // 387
      mori.each(state.choices, function (nameAndUv) {                                                              // 388
        var uv = mori.last(nameAndUv);                                                                             // 389
        if (_.has(prevSolMapping, uv.name)) {                                                                      // 390
          // The package was present in the previous solution                                                      // 391
          var prev = prevSolMapping[uv.name];                                                                      // 392
          var versionsDistance =                                                                                   // 393
            PackageVersion.versionMagnitude(uv.version) -                                                          // 394
            PackageVersion.versionMagnitude(prev.version);                                                         // 395
                                                                                                                   // 396
          var isCompatible =                                                                                       // 397
                prev.earliestCompatibleVersion === uv.earliestCompatibleVersion;                                   // 398
                                                                                                                   // 399
          if (isRootDep[uv.name]) {                                                                                // 400
            // root dependency                                                                                     // 401
            if (versionsDistance < 0 || ! isCompatible) {                                                          // 402
              // the new pick is older or is incompatible with the prev. solution                                  // 403
              // i.e. can have breaking changes, prefer not to do this                                             // 404
              // XXX in fact we want to avoid downgrades to the direct                                             // 405
              // dependencies at all cost.                                                                         // 406
              cost[VMAJOR]++;                                                                                      // 407
              options.debug && console.log("root & *not* compatible: ", uv.name, prev.version, "=>", uv.version)   // 408
            } else {                                                                                               // 409
              // compatible but possibly newer                                                                     // 410
              // prefer the version closest to the older solution                                                  // 411
              cost[MAJOR] += versionsDistance;                                                                     // 412
              options.debug && console.log("root & compatible: ", uv.name, prev.version, "=>", uv.version)         // 413
            }                                                                                                      // 414
          } else {                                                                                                 // 415
            // transitive dependency                                                                               // 416
            // prefer to have less changed transitive dependencies                                                 // 417
            cost[MINOR] += versionsDistance === 0 ? 0 : 1;                                                         // 418
            options.debug && console.log("transitive: ", uv.name, prev.version, "=>", uv.version)                  // 419
          }                                                                                                        // 420
        } else {                                                                                                   // 421
          var latestDistance =                                                                                     // 422
            PackageVersion.versionMagnitude(_.last(self.resolver.unitsVersions[uv.name]).version) -                // 423
            PackageVersion.versionMagnitude(uv.version);                                                           // 424
                                                                                                                   // 425
          if (isRootDep[uv.name]) {                                                                                // 426
            // root dependency                                                                                     // 427
            // preferably latest                                                                                   // 428
            cost[MEDIUM] += latestDistance;                                                                        // 429
            options.debug && console.log("root: ", uv.name, "=>", uv.version)                                      // 430
          } else {                                                                                                 // 431
            // transitive dependency                                                                               // 432
            // prefarable earliest possible to be conservative                                                     // 433
            // How far is our choice from the most conservative version that                                       // 434
            // also matches our constraints?                                                                       // 435
            var minimal = state.constraints.getMinimalVersion(uv.name) || '0.0.0';                                 // 436
            cost[MINOR] += PackageVersion.versionMagnitude(uv.version) - PackageVersion.versionMagnitude(minimal); // 437
            options.debug && console.log("transitive: ", uv.name, "=>", uv.version)                                // 438
          }                                                                                                        // 439
        }                                                                                                          // 440
      });                                                                                                          // 441
                                                                                                                   // 442
      return cost;                                                                                                 // 443
    };                                                                                                             // 444
                                                                                                                   // 445
    resolverOptions.estimateCostFunction = function (state, options) {                                             // 446
      options = options || {};                                                                                     // 447
                                                                                                                   // 448
      var cost = [0, 0, 0, 0];                                                                                     // 449
                                                                                                                   // 450
      state.eachDependency(function (dep, alternatives) {                                                          // 451
        // XXX don't try to estimate transitive dependencies                                                       // 452
        if (! isRootDep[dep]) {                                                                                    // 453
          cost[MINOR] += 10000000;                                                                                 // 454
          return;                                                                                                  // 455
        }                                                                                                          // 456
                                                                                                                   // 457
        if (_.has(prevSolMapping, dep)) {                                                                          // 458
          var prev = prevSolMapping[dep];                                                                          // 459
          var prevVersionMatches = state.isSatisfied(prev);                                                        // 460
                                                                                                                   // 461
          // if it matches, assume we would pick it and the cost doesn't                                           // 462
          // increase                                                                                              // 463
          if (prevVersionMatches)                                                                                  // 464
            return;                                                                                                // 465
                                                                                                                   // 466
          // Get earliest matching version.                                                                        // 467
          var earliestMatching = mori.first(alternatives);                                                         // 468
                                                                                                                   // 469
          var isCompatible =                                                                                       // 470
                prev.earliestCompatibleVersion === earliestMatching.earliestCompatibleVersion;                     // 471
          if (! isCompatible) {                                                                                    // 472
            cost[VMAJOR]++;                                                                                        // 473
            return;                                                                                                // 474
          }                                                                                                        // 475
                                                                                                                   // 476
          var versionsDistance =                                                                                   // 477
            PackageVersion.versionMagnitude(earliestMatching.version) -                                            // 478
            PackageVersion.versionMagnitude(prev.version);                                                         // 479
          if (versionsDistance < 0) {                                                                              // 480
            cost[VMAJOR]++;                                                                                        // 481
            return;                                                                                                // 482
          }                                                                                                        // 483
                                                                                                                   // 484
          cost[MAJOR] += versionsDistance;                                                                         // 485
        } else {                                                                                                   // 486
          var versions = self.resolver.unitsVersions[dep];                                                         // 487
          var latestMatching = mori.last(alternatives);                                                            // 488
                                                                                                                   // 489
          var latestDistance =                                                                                     // 490
            PackageVersion.versionMagnitude(                                                                       // 491
              _.last(self.resolver.unitsVersions[dep]).version) -                                                  // 492
            PackageVersion.versionMagnitude(latestMatching.version);                                               // 493
                                                                                                                   // 494
          cost[MEDIUM] += latestDistance;                                                                          // 495
        }                                                                                                          // 496
      });                                                                                                          // 497
                                                                                                                   // 498
      return cost;                                                                                                 // 499
    };                                                                                                             // 500
                                                                                                                   // 501
    resolverOptions.combineCostFunction = function (costA, costB) {                                                // 502
      if (costA.length !== costB.length)                                                                           // 503
        throw new Error("Different cost types");                                                                   // 504
                                                                                                                   // 505
      var arr = [];                                                                                                // 506
      _.each(costA, function (l, i) {                                                                              // 507
        arr.push(l + costB[i]);                                                                                    // 508
      });                                                                                                          // 509
                                                                                                                   // 510
      return arr;                                                                                                  // 511
    };                                                                                                             // 512
  }                                                                                                                // 513
                                                                                                                   // 514
  return resolverOptions;                                                                                          // 515
};                                                                                                                 // 516
                                                                                                                   // 517
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/constraint-solver/resolver.js                                                                          //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
mori = Npm.require('mori');                                                                                        // 1
                                                                                                                   // 2
BREAK = {};  // used by our 'each' functions                                                                       // 3
                                                                                                                   // 4
////////////////////////////////////////////////////////////////////////////////                                   // 5
// Resolver                                                                                                        // 6
////////////////////////////////////////////////////////////////////////////////                                   // 7
                                                                                                                   // 8
// XXX the whole resolver heavily relies on these statements to be true:                                           // 9
// - every unit version ever used was added to the resolver with addUnitVersion                                    // 10
// - every constraint ever used was instantiated with getConstraint                                                // 11
// - every constraint was added exactly once                                                                       // 12
// - every unit version was added exactly once                                                                     // 13
// - if two unit versions are the same, their refs point at the same object                                        // 14
// - if two constraints are the same, their refs point at the same object                                          // 15
ConstraintSolver.Resolver = function (options) {                                                                   // 16
  var self = this;                                                                                                 // 17
  options = options || {};                                                                                         // 18
                                                                                                                   // 19
  self._nudge = options.nudge;                                                                                     // 20
                                                                                                                   // 21
  // Maps unit name string to a sorted array of version definitions                                                // 22
  self.unitsVersions = {};                                                                                         // 23
  // Maps name@version string to a unit version                                                                    // 24
  self._unitsVersionsMap = {};                                                                                     // 25
                                                                                                                   // 26
  // Refs to all constraints. Mapping String -> instance                                                           // 27
  self._constraints = {};                                                                                          // 28
                                                                                                                   // 29
  // Let's say that we that package P is available from source at version X.Y.Z.                                   // 30
  // Then that's the only version that can actually be chosen by the resolver,                                     // 31
  // and so it's the only version included as a UnitVersion.  But let's say                                        // 32
  // another unit depends on it with a 'compatible-with' dependency "@A.B.C". We                                   // 33
  // need to be able to figure out the earliestCompatibleVersion of A.B.C, even                                    // 34
  // though A.B.C is not a valid (selectable) UnitVersion. We store them here.                                     // 35
  //                                                                                                               // 36
  // Maps String unitName -> String version -> String earliestCompatibleVersion                                    // 37
  self._extraECVs = {};                                                                                            // 38
};                                                                                                                 // 39
                                                                                                                   // 40
ConstraintSolver.Resolver.prototype.addUnitVersion = function (unitVersion) {                                      // 41
  var self = this;                                                                                                 // 42
                                                                                                                   // 43
  check(unitVersion, ConstraintSolver.UnitVersion);                                                                // 44
                                                                                                                   // 45
  if (_.has(self._unitsVersionsMap, unitVersion.toString())) {                                                     // 46
    throw Error("duplicate uv " + unitVersion.toString() + "?");                                                   // 47
  }                                                                                                                // 48
                                                                                                                   // 49
  if (! _.has(self.unitsVersions, unitVersion.name)) {                                                             // 50
    self.unitsVersions[unitVersion.name] = [];                                                                     // 51
  } else {                                                                                                         // 52
    var latest = _.last(self.unitsVersions[unitVersion.name]).version;                                             // 53
    if (!PackageVersion.lessThan(latest, unitVersion.version)) {                                                   // 54
      throw Error("adding uv out of order: " + latest + " vs "                                                     // 55
                  + unitVersion.version);                                                                          // 56
    }                                                                                                              // 57
  }                                                                                                                // 58
                                                                                                                   // 59
  self.unitsVersions[unitVersion.name].push(unitVersion);                                                          // 60
  self._unitsVersionsMap[unitVersion.toString()] = unitVersion;                                                    // 61
};                                                                                                                 // 62
                                                                                                                   // 63
                                                                                                                   // 64
                                                                                                                   // 65
ConstraintSolver.Resolver.prototype.getUnitVersion = function (unitName, version) {                                // 66
  var self = this;                                                                                                 // 67
  return self._unitsVersionsMap[unitName + "@" + version];                                                         // 68
};                                                                                                                 // 69
                                                                                                                   // 70
// name - String - "someUnit"                                                                                      // 71
// versionConstraint - String - "=1.2.3" or "2.1.0"                                                                // 72
ConstraintSolver.Resolver.prototype.getConstraint =                                                                // 73
  function (name, versionConstraint) {                                                                             // 74
  var self = this;                                                                                                 // 75
                                                                                                                   // 76
  check(name, String);                                                                                             // 77
  check(versionConstraint, String);                                                                                // 78
                                                                                                                   // 79
  var idString = JSON.stringify([name, versionConstraint]);                                                        // 80
                                                                                                                   // 81
  if (_.has(self._constraints, idString))                                                                          // 82
    return self._constraints[idString];                                                                            // 83
                                                                                                                   // 84
  return self._constraints[idString] =                                                                             // 85
    new ConstraintSolver.Constraint(name, versionConstraint);                                                      // 86
};                                                                                                                 // 87
                                                                                                                   // 88
ConstraintSolver.Resolver.prototype.addExtraECV = function (                                                       // 89
    unitName, version, earliestCompatibleVersion) {                                                                // 90
  var self = this;                                                                                                 // 91
  check(unitName, String);                                                                                         // 92
  check(version, String);                                                                                          // 93
  check(earliestCompatibleVersion, String);                                                                        // 94
                                                                                                                   // 95
  if (!_.has(self._extraECVs, unitName)) {                                                                         // 96
    self._extraECVs[unitName] = {};                                                                                // 97
  }                                                                                                                // 98
  self._extraECVs[unitName][version] = earliestCompatibleVersion;                                                  // 99
};                                                                                                                 // 100
                                                                                                                   // 101
ConstraintSolver.Resolver.prototype.getEarliestCompatibleVersion = function (                                      // 102
    unitName, version) {                                                                                           // 103
  var self = this;                                                                                                 // 104
                                                                                                                   // 105
  var uv = self.getUnitVersion(unitName, version);                                                                 // 106
  if (uv) {                                                                                                        // 107
    return uv.earliestCompatibleVersion;                                                                           // 108
  }                                                                                                                // 109
  if (!_.has(self._extraECVs, unitName)) {                                                                         // 110
    return null;                                                                                                   // 111
  }                                                                                                                // 112
  if (!_.has(self._extraECVs[unitName], version)) {                                                                // 113
    return null;                                                                                                   // 114
  }                                                                                                                // 115
  return self._extraECVs[unitName][version];                                                                       // 116
};                                                                                                                 // 117
                                                                                                                   // 118
// options: Object:                                                                                                // 119
// - costFunction: function (state, options) - given a state evaluates its cost                                    // 120
// - estimateCostFunction: function (state) - given a state, evaluates the                                         // 121
// estimated cost of the best path from state to a final state                                                     // 122
// - combineCostFunction: function (cost, cost) - given two costs (obtained by                                     // 123
// evaluating states with costFunction and estimateCostFunction)                                                   // 124
ConstraintSolver.Resolver.prototype.resolve = function (                                                           // 125
    dependencies, constraints, options) {                                                                          // 126
  var self = this;                                                                                                 // 127
  constraints = constraints || [];                                                                                 // 128
  var choices = mori.hash_map();  // uv.name -> uv                                                                 // 129
  options = _.extend({                                                                                             // 130
    costFunction: function (state) { return 0; },                                                                  // 131
    estimateCostFunction: function (state) {                                                                       // 132
      return 0;                                                                                                    // 133
    },                                                                                                             // 134
    combineCostFunction: function (cost, anotherCost) {                                                            // 135
      return cost + anotherCost;                                                                                   // 136
    }                                                                                                              // 137
  }, options);                                                                                                     // 138
                                                                                                                   // 139
  var resolveContext = new ResolveContext;                                                                         // 140
                                                                                                                   // 141
  // Mapping that assigns every package an integer priority. We compute this                                       // 142
  // dynamically and in the process of resolution we try to resolve packages                                       // 143
  // with higher priority first. This helps the resolver a lot because if some                                     // 144
  // package has a higher weight to the solution (like a direct dependency) or                                     // 145
  // is more likely to break our solution in the future than others, it would be                                   // 146
  // great to try out and evaluate all versions early in the decision tree.                                        // 147
  // XXX this could go on ResolveContext                                                                           // 148
  var resolutionPriority = {};                                                                                     // 149
                                                                                                                   // 150
  var startState = new ResolverState(self, resolveContext);                                                        // 151
                                                                                                                   // 152
  if (options.useRCs) {                                                                                            // 153
    resolveContext.useRCsOK = true;                                                                                // 154
  }                                                                                                                // 155
                                                                                                                   // 156
  _.each(constraints, function (constraint) {                                                                      // 157
    startState = startState.addConstraint(constraint, mori.list());                                                // 158
                                                                                                                   // 159
    // Keep track of any top-level constraints that mention a pre-release.                                         // 160
    // These will be the only pre-release versions that count as "reasonable"                                      // 161
    // for "any-reasonable" (ie, unconstrained) constraints.                                                       // 162
    //                                                                                                             // 163
    // Why only top-level mentions, and not mentions we find while walking the                                     // 164
    // graph? The constraint solver assumes that adding a constraint to the                                        // 165
    // resolver state can't make previously impossible choices now possible.  If                                   // 166
    // pre-releases mentioned anywhere worked, then applying the constraints                                       // 167
    // "any reasonable" followed by "1.2.3-rc1" would result in "1.2.3-rc1"                                        // 168
    // ruled first impossible and then possible again. That's no good, so we                                       // 169
    // have to fix the meaning based on something at the start.  (We could try                                     // 170
    // to apply our prerelease-avoidance tactics solely in the cost functions,                                     // 171
    // but then it becomes a much less strict rule.)                                                               // 172
    if (constraint.version && /-/.test(constraint.version)) {                                                      // 173
      if (!_.has(resolveContext.topLevelPrereleases, constraint.name)) {                                           // 174
        resolveContext.topLevelPrereleases[constraint.name] = {};                                                  // 175
      }                                                                                                            // 176
      resolveContext.topLevelPrereleases[constraint.name][constraint.version]                                      // 177
        = true;                                                                                                    // 178
    }                                                                                                              // 179
  });                                                                                                              // 180
                                                                                                                   // 181
  _.each(dependencies, function (unitName) {                                                                       // 182
    startState = startState.addDependency(unitName, mori.list());                                                  // 183
    // Direct dependencies start on higher priority                                                                // 184
    resolutionPriority[unitName] = 100;                                                                            // 185
  });                                                                                                              // 186
                                                                                                                   // 187
  if (startState.success()) {                                                                                      // 188
    return startState.choices;                                                                                     // 189
  }                                                                                                                // 190
                                                                                                                   // 191
  if (startState.error) {                                                                                          // 192
    throwConstraintSolverError(startState.error);                                                                  // 193
  }                                                                                                                // 194
                                                                                                                   // 195
  var pq = new PriorityQueue();                                                                                    // 196
  var overallCostFunction = function (state) {                                                                     // 197
    return [                                                                                                       // 198
      options.combineCostFunction(                                                                                 // 199
        options.costFunction(state),                                                                               // 200
        options.estimateCostFunction(state)),                                                                      // 201
      -mori.count(state.choices)                                                                                   // 202
    ];                                                                                                             // 203
  };                                                                                                               // 204
                                                                                                                   // 205
  pq.push(startState, overallCostFunction(startState));                                                            // 206
                                                                                                                   // 207
  var someError = null;                                                                                            // 208
  var anySucceeded = false;                                                                                        // 209
  while (! pq.empty()) {                                                                                           // 210
    // Since we're in a CPU-bound loop, allow yielding or printing a message or                                    // 211
    // something.                                                                                                  // 212
    self._nudge && self._nudge();                                                                                  // 213
                                                                                                                   // 214
    var currentState = pq.pop();                                                                                   // 215
                                                                                                                   // 216
    if (currentState.success()) {                                                                                  // 217
      return currentState.choices;                                                                                 // 218
    }                                                                                                              // 219
                                                                                                                   // 220
    var neighborsObj = self._stateNeighbors(currentState, resolutionPriority);                                     // 221
                                                                                                                   // 222
    if (! neighborsObj.success) {                                                                                  // 223
      someError = someError || neighborsObj.failureMsg;                                                            // 224
      resolutionPriority[neighborsObj.conflictingUnit] =                                                           // 225
        (resolutionPriority[neighborsObj.conflictingUnit] || 0) + 1;                                               // 226
    } else {                                                                                                       // 227
      _.each(neighborsObj.neighbors, function (state) {                                                            // 228
        // We don't just return the first successful one we find, in case there                                    // 229
        // are multiple successful states (we want to sort by cost function in                                     // 230
        // that case).                                                                                             // 231
        pq.push(state, overallCostFunction(state));                                                                // 232
      });                                                                                                          // 233
    }                                                                                                              // 234
  }                                                                                                                // 235
                                                                                                                   // 236
  // XXX should be much much better                                                                                // 237
  if (someError) {                                                                                                 // 238
    throwConstraintSolverError(someError);                                                                         // 239
  }                                                                                                                // 240
                                                                                                                   // 241
  throw new Error("ran out of states without error?");                                                             // 242
};                                                                                                                 // 243
                                                                                                                   // 244
var throwConstraintSolverError = function (message) {                                                              // 245
  var e = new Error(message);                                                                                      // 246
  e.constraintSolverError = true;                                                                                  // 247
  throw e;                                                                                                         // 248
};                                                                                                                 // 249
                                                                                                                   // 250
// returns {                                                                                                       // 251
//   success: Boolean,                                                                                             // 252
//   failureMsg: String,                                                                                           // 253
//   neighbors: [state]                                                                                            // 254
// }                                                                                                               // 255
ConstraintSolver.Resolver.prototype._stateNeighbors = function (                                                   // 256
    state, resolutionPriority) {                                                                                   // 257
  var self = this;                                                                                                 // 258
                                                                                                                   // 259
  var candidateName = null;                                                                                        // 260
  var candidateVersions = null;                                                                                    // 261
  var currentNaughtiness = -1;                                                                                     // 262
                                                                                                                   // 263
  state.eachDependency(function (unitName, versions) {                                                             // 264
    var r = resolutionPriority[unitName] || 0;                                                                     // 265
    if (r > currentNaughtiness) {                                                                                  // 266
      currentNaughtiness = r;                                                                                      // 267
      candidateName = unitName;                                                                                    // 268
      candidateVersions = versions;                                                                                // 269
    }                                                                                                              // 270
  });                                                                                                              // 271
                                                                                                                   // 272
  if (mori.is_empty(candidateVersions))                                                                            // 273
    throw Error("empty candidate set? should have detected earlier");                                              // 274
                                                                                                                   // 275
  var pathway = state.somePathwayForUnitName(candidateName);                                                       // 276
                                                                                                                   // 277
  var neighbors = [];                                                                                              // 278
  var firstError = null;                                                                                           // 279
  mori.each(candidateVersions, function (unitVersion) {                                                            // 280
    var neighborState = state.addChoice(unitVersion, pathway);                                                     // 281
    if (!neighborState.error) {                                                                                    // 282
      neighbors.push(neighborState);                                                                               // 283
    } else if (!firstError) {                                                                                      // 284
      firstError = neighborState.error;                                                                            // 285
    }                                                                                                              // 286
  });                                                                                                              // 287
                                                                                                                   // 288
  if (neighbors.length) {                                                                                          // 289
    return { success: true, neighbors: neighbors };                                                                // 290
  }                                                                                                                // 291
  return {                                                                                                         // 292
    success: false,                                                                                                // 293
    failureMsg: firstError,                                                                                        // 294
    conflictingUnit: candidateName                                                                                 // 295
  };                                                                                                               // 296
};                                                                                                                 // 297
                                                                                                                   // 298
////////////////////////////////////////////////////////////////////////////////                                   // 299
// UnitVersion                                                                                                     // 300
////////////////////////////////////////////////////////////////////////////////                                   // 301
                                                                                                                   // 302
ConstraintSolver.UnitVersion = function (name, unitVersion, ecv) {                                                 // 303
  var self = this;                                                                                                 // 304
                                                                                                                   // 305
  check(name, String);                                                                                             // 306
  check(unitVersion, String);                                                                                      // 307
  check(ecv, String);                                                                                              // 308
  check(self, ConstraintSolver.UnitVersion);                                                                       // 309
                                                                                                                   // 310
  self.name = name;                                                                                                // 311
  // Things with different build IDs should represent the same code, so ignore                                     // 312
  // them. (Notably: depending on @=1.3.1 should allow 1.3.1+local!)                                               // 313
  self.version = PackageVersion.removeBuildID(unitVersion);                                                        // 314
  self.dependencies = [];                                                                                          // 315
  self.constraints = new ConstraintSolver.ConstraintsList();                                                       // 316
  // a string in a form of "1.2.0"                                                                                 // 317
  self.earliestCompatibleVersion = ecv;                                                                            // 318
};                                                                                                                 // 319
                                                                                                                   // 320
_.extend(ConstraintSolver.UnitVersion.prototype, {                                                                 // 321
  addDependency: function (name) {                                                                                 // 322
    var self = this;                                                                                               // 323
                                                                                                                   // 324
    check(name, String);                                                                                           // 325
    if (_.contains(self.dependencies, name)) {                                                                     // 326
      return;                                                                                                      // 327
    }                                                                                                              // 328
    self.dependencies.push(name);                                                                                  // 329
  },                                                                                                               // 330
  addConstraint: function (constraint) {                                                                           // 331
    var self = this;                                                                                               // 332
                                                                                                                   // 333
    check(constraint, ConstraintSolver.Constraint);                                                                // 334
    if (self.constraints.contains(constraint)) {                                                                   // 335
      return;                                                                                                      // 336
      // XXX may also throw if it is unexpected                                                                    // 337
      throw new Error("Constraint already exists -- " + constraint.toString());                                    // 338
    }                                                                                                              // 339
                                                                                                                   // 340
    self.constraints = self.constraints.push(constraint);                                                          // 341
  },                                                                                                               // 342
                                                                                                                   // 343
  toString: function (options) {                                                                                   // 344
    var self = this;                                                                                               // 345
    options = options || {};                                                                                       // 346
    var name = options.removeUnibuild ? removeUnibuild(self.name) : self.name;                                     // 347
    return name + "@" + self.version;                                                                              // 348
  }                                                                                                                // 349
});                                                                                                                // 350
                                                                                                                   // 351
////////////////////////////////////////////////////////////////////////////////                                   // 352
// Constraint                                                                                                      // 353
////////////////////////////////////////////////////////////////////////////////                                   // 354
                                                                                                                   // 355
// Can be called either:                                                                                           // 356
//    new PackageVersion.Constraint("packageA", "=2.1.0")                                                          // 357
// or:                                                                                                             // 358
//    new PackageVersion.Constraint("pacakgeA@=2.1.0")                                                             // 359
ConstraintSolver.Constraint = function (name, versionString) {                                                     // 360
  var self = this;                                                                                                 // 361
  if (versionString) {                                                                                             // 362
    name = name + "@" + versionString;                                                                             // 363
  }                                                                                                                // 364
                                                                                                                   // 365
  // See comment in UnitVersion constructor. We want to strip out build IDs                                        // 366
  // because the code they represent is considered equivalent.                                                     // 367
  _.extend(self, PackageVersion.parseConstraint(name, {                                                            // 368
    removeBuildIDs: true,                                                                                          // 369
    archesOK: true                                                                                                 // 370
  }));                                                                                                             // 371
                                                                                                                   // 372
};                                                                                                                 // 373
                                                                                                                   // 374
ConstraintSolver.Constraint.prototype.toString = function (options) {                                              // 375
  var self = this;                                                                                                 // 376
  options = options || {};                                                                                         // 377
  var name = options.removeUnibuild ? removeUnibuild(self.name) : self.name;                                       // 378
  return name + "@" + self.constraintString;                                                                       // 379
};                                                                                                                 // 380
                                                                                                                   // 381
                                                                                                                   // 382
ConstraintSolver.Constraint.prototype.isSatisfied = function (                                                     // 383
  candidateUV, resolver, resolveContext) {                                                                         // 384
  var self = this;                                                                                                 // 385
  check(candidateUV, ConstraintSolver.UnitVersion);                                                                // 386
                                                                                                                   // 387
  if (self.name !== candidateUV.name) {                                                                            // 388
    throw Error("asking constraint on " + self.name + " about " +                                                  // 389
                candidateUV.name);                                                                                 // 390
  }                                                                                                                // 391
                                                                                                                   // 392
  return _.some(self.constraints, function (currConstraint) {                                                      // 393
     if (currConstraint.type === "any-reasonable") {                                                               // 394
      // Non-prerelease versions are always reasonable, and if we are OK with                                      // 395
      // using RCs all the time, then they are reasonable too.                                                     // 396
      if (!/-/.test(candidateUV.version) ||                                                                        // 397
          resolveContext.useRCsOK)                                                                                 // 398
        return true;                                                                                               // 399
                                                                                                                   // 400
      // Is it a pre-release version that was explicitly mentioned at the top                                      // 401
      // level?                                                                                                    // 402
      if (_.has(resolveContext.topLevelPrereleases, self.name) &&                                                  // 403
          _.has(resolveContext.topLevelPrereleases[self.name],                                                     // 404
                candidateUV.version)) {                                                                            // 405
        return true;                                                                                               // 406
      }                                                                                                            // 407
                                                                                                                   // 408
      // Otherwise, not this pre-release!                                                                          // 409
      return false;                                                                                                // 410
    }                                                                                                              // 411
                                                                                                                   // 412
    if (currConstraint.type === "exactly") {                                                                       // 413
      return currConstraint.version === candidateUV.version;                                                       // 414
    }                                                                                                              // 415
                                                                                                                   // 416
    if (currConstraint.type !== "compatible-with") {                                                               // 417
      throw Error("Unknown constraint type: " + currConstraint.type);                                              // 418
    }                                                                                                              // 419
                                                                                                                   // 420
    // If you're not asking for a pre-release (and you are not in pre-releases-OK                                  // 421
    // mode), you'll only get it if it was a top level explicit mention (eg, in                                    // 422
    // the release).                                                                                               // 423
    if (!/-/.test(currConstraint.version) &&                                                                       // 424
        /-/.test(candidateUV.version) && !resolveContext.useRCsOK) {                                               // 425
      if (currConstraint.version === candidateUV.version)                                                          // 426
        return true;                                                                                               // 427
      if (!_.has(resolveContext.topLevelPrereleases, self.name) ||                                                 // 428
          !_.has(resolveContext.topLevelPrereleases[self.name],                                                    // 429
                 candidateUV.version)) {                                                                           // 430
        return false;                                                                                              // 431
      }                                                                                                            // 432
    }                                                                                                              // 433
                                                                                                                   // 434
    // If the candidate version is less than the version named in the constraint,                                  // 435
    // we are not satisfied.                                                                                       // 436
    if (PackageVersion.lessThan(candidateUV.version, currConstraint.version))                                      // 437
      return false;                                                                                                // 438
                                                                                                                   // 439
    var myECV = resolver.getEarliestCompatibleVersion(                                                             // 440
      self.name, currConstraint.version);                                                                          // 441
    // If the constraint is "@1.2.3" and 1.2.3 doesn't exist, then nothing can                                     // 442
    // match. This is because we don't know the ECV (compatibility class) of                                       // 443
    // 1.2.3!                                                                                                      // 444
    if (!myECV)                                                                                                    // 445
      return false;                                                                                                // 446
                                                                                                                   // 447
    // To be compatible, the two versions must have the same                                                       // 448
    // earliestCompatibleVersion. If the earliestCompatibleVersions haven't been                                   // 449
    // overridden from their default, this means that the two versions have the                                    // 450
    // same major version number.                                                                                  // 451
    return myECV === candidateUV.earliestCompatibleVersion;                                                        // 452
  });                                                                                                              // 453
                                                                                                                   // 454
};                                                                                                                 // 455
                                                                                                                   // 456
// An object that records the general context of a resolve call. It can be                                         // 457
// different for different resolve calls on the same Resolver, but is the same                                     // 458
// for every ResolverState in a given call.                                                                        // 459
var ResolveContext = function () {                                                                                 // 460
  var self = this;                                                                                                 // 461
  // unitName -> version string -> true                                                                            // 462
  self.topLevelPrereleases = {};                                                                                   // 463
  self.useRCsOK = false;                                                                                           // 464
};                                                                                                                 // 465
                                                                                                                   // 466
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/constraint-solver/constraints-list.js                                                                  //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
////////////////////////////////////////////////////////////////////////////////                                   // 1
// ConstraintsList                                                                                                 // 2
////////////////////////////////////////////////////////////////////////////////                                   // 3
// A persistent data-structure that keeps references to Constraint objects                                         // 4
// arranged by the "name" field of Constraint and exactness of the constraint.                                     // 5
//                                                                                                                 // 6
// Internal structure has two maps, 'exact' and 'inexact'; they each map                                           // 7
// unit name -> mori.set(Constraint).  (This relies on the fact that Constraints                                   // 8
// are interned, so that mori.set can use reference identity.)                                                     // 9
//                                                                                                                 // 10
// We separate the constraints by exactness so that the iteration functions                                        // 11
// (forPackage and each) can easily provide exact constraints before inexact                                       // 12
// constraints, because exact constraints generally help the consumer pare down                                    // 13
// their possibilities faster.                                                                                     // 14
// XXX This is just a theory, and it's not clear that we have benchmarks that                                      // 15
//     prove it.                                                                                                   // 16
ConstraintSolver.ConstraintsList = function (prev) {                                                               // 17
  var self = this;                                                                                                 // 18
                                                                                                                   // 19
  if (prev) {                                                                                                      // 20
    self.exact = prev.exact;                                                                                       // 21
    self.inexact = prev.inexact;                                                                                   // 22
    self.minimalVersion = prev.minimalVersion;                                                                     // 23
  } else {                                                                                                         // 24
    self.exact = mori.hash_map();                                                                                  // 25
    self.inexact = mori.hash_map();                                                                                // 26
    self.minimalVersion = mori.hash_map();                                                                         // 27
  }                                                                                                                // 28
};                                                                                                                 // 29
                                                                                                                   // 30
ConstraintSolver.ConstraintsList.prototype.contains = function (c) {                                               // 31
  var self = this;                                                                                                 // 32
  var map = c.type === 'exactly' ? self.exact : self.inexact;                                                      // 33
  return !!mori.get_in(map, [c.name, c]);                                                                          // 34
};                                                                                                                 // 35
                                                                                                                   // 36
ConstraintSolver.ConstraintsList.prototype.getMinimalVersion = function (name) {                                   // 37
  var self = this;                                                                                                 // 38
  return mori.get(self.minimalVersion, name);                                                                      // 39
};                                                                                                                 // 40
                                                                                                                   // 41
// returns a new version containing passed constraint                                                              // 42
ConstraintSolver.ConstraintsList.prototype.push = function (c) {                                                   // 43
  var self = this;                                                                                                 // 44
                                                                                                                   // 45
  if (self.contains(c)) {                                                                                          // 46
    return self;                                                                                                   // 47
  }                                                                                                                // 48
                                                                                                                   // 49
  var newList = new ConstraintSolver.ConstraintsList(self);                                                        // 50
  var mapField = c.type === 'exactly' ? 'exact' : 'inexact';                                                       // 51
  // Get the current constraints on this package of the exactness, or an empty                                     // 52
  // set.                                                                                                          // 53
  var currentConstraints = mori.get(newList[mapField], c.name, mori.set());                                        // 54
  // Add this one.                                                                                                 // 55
  newList[mapField] = mori.assoc(newList[mapField],                                                                // 56
                                 c.name,                                                                           // 57
                                 mori.conj(currentConstraints, c));                                                // 58
                                                                                                                   // 59
  // Maintain the "minimal version" that can satisfy these constraints.                                            // 60
  // Note that this is one of the only pieces of the constraint solver that                                        // 61
  // actually does logic on constraints (and thus relies on the restricted set                                     // 62
  // of constraints that we support).                                                                              // 63
  if (c.type !== 'any-reasonable') {                                                                               // 64
    var minimal = mori.get(newList.minimalVersion, c.name);                                                        // 65
    if (!minimal || PackageVersion.lessThan(c.version, minimal)) {                                                 // 66
      newList.minimalVersion = mori.assoc(                                                                         // 67
        newList.minimalVersion, c.name, c.version);                                                                // 68
    }                                                                                                              // 69
  }                                                                                                                // 70
  return newList;                                                                                                  // 71
};                                                                                                                 // 72
                                                                                                                   // 73
ConstraintSolver.ConstraintsList.prototype.forPackage = function (name, iter) {                                    // 74
  var self = this;                                                                                                 // 75
  var exact = mori.get(self.exact, name);                                                                          // 76
  var inexact = mori.get(self.inexact, name);                                                                      // 77
                                                                                                                   // 78
  var breaked = false;                                                                                             // 79
  var niter = function (constraint) {                                                                              // 80
    if (iter(constraint) === BREAK) {                                                                              // 81
      breaked = true;                                                                                              // 82
      return true;                                                                                                 // 83
    }                                                                                                              // 84
  };                                                                                                               // 85
                                                                                                                   // 86
  exact && mori.some(niter, exact);                                                                                // 87
  if (breaked)                                                                                                     // 88
    return;                                                                                                        // 89
  inexact && mori.some(niter, inexact);                                                                            // 90
};                                                                                                                 // 91
                                                                                                                   // 92
// doesn't break on the false return value                                                                         // 93
ConstraintSolver.ConstraintsList.prototype.each = function (iter) {                                                // 94
  var self = this;                                                                                                 // 95
  _.each([self.exact, self.inexact], function (map) {                                                              // 96
    mori.each(map, function (nameAndConstraints) {                                                                 // 97
      mori.each(mori.last(nameAndConstraints), iter);                                                              // 98
    });                                                                                                            // 99
  });                                                                                                              // 100
};                                                                                                                 // 101
                                                                                                                   // 102
// Checks if the passed unit version satisfies all of the constraints.                                             // 103
ConstraintSolver.ConstraintsList.prototype.isSatisfied = function (                                                // 104
    uv, resolver, resolveContext) {                                                                                // 105
  var self = this;                                                                                                 // 106
                                                                                                                   // 107
  var satisfied = true;                                                                                            // 108
                                                                                                                   // 109
  self.forPackage(uv.name, function (c) {                                                                          // 110
    if (! c.isSatisfied(uv, resolver, resolveContext)) {                                                           // 111
      satisfied = false;                                                                                           // 112
      return BREAK;                                                                                                // 113
    }                                                                                                              // 114
  });                                                                                                              // 115
                                                                                                                   // 116
  return satisfied;                                                                                                // 117
};                                                                                                                 // 118
                                                                                                                   // 119
ConstraintSolver.ConstraintsList.prototype.toString = function (options) {                                         // 120
  var self = this;                                                                                                 // 121
  options = options || {};                                                                                         // 122
                                                                                                                   // 123
  var strs = [];                                                                                                   // 124
                                                                                                                   // 125
  self.each(function (c) {                                                                                         // 126
    strs.push(c.toString({removeUnibuild: options.removeUnibuild}));                                               // 127
  });                                                                                                              // 128
                                                                                                                   // 129
  strs.sort();                                                                                                     // 130
                                                                                                                   // 131
  return "<constraints list: " + strs.join(", ") + ">";                                                            // 132
};                                                                                                                 // 133
                                                                                                                   // 134
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/constraint-solver/resolver-state.js                                                                    //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
var util = Npm.require('util');                                                                                    // 1
                                                                                                                   // 2
ResolverState = function (resolver, resolveContext) {                                                              // 3
  var self = this;                                                                                                 // 4
  self._resolver = resolver;                                                                                       // 5
  self._resolveContext = resolveContext;                                                                           // 6
  // The versions we've already chosen.                                                                            // 7
  // unitName -> UnitVersion                                                                                       // 8
  self.choices = mori.hash_map();                                                                                  // 9
  // Units we need, but haven't chosen yet.                                                                        // 10
  // unitName -> sorted vector of (UnitVersions)                                                                   // 11
  self._dependencies = mori.hash_map();                                                                            // 12
  // Constraints that apply.                                                                                       // 13
  self.constraints = new ConstraintSolver.ConstraintsList;                                                         // 14
  // How we've decided things about units.                                                                         // 15
  // unitName -> set(list (reversed) of UVs that led us here).                                                     // 16
  self._unitPathways = mori.hash_map();                                                                            // 17
  // If we've already hit a contradiction.                                                                         // 18
  self.error = null;                                                                                               // 19
};                                                                                                                 // 20
                                                                                                                   // 21
_.extend(ResolverState.prototype, {                                                                                // 22
  addConstraint: function (constraint, pathway) {                                                                  // 23
    var self = this;                                                                                               // 24
    if (self.error)                                                                                                // 25
      return self;                                                                                                 // 26
                                                                                                                   // 27
    // Add the constraint.                                                                                         // 28
    var newConstraints = self.constraints.push(constraint);                                                        // 29
    // If we already had the constraint, we're done.                                                               // 30
    if (self.constraints === newConstraints)                                                                       // 31
      return self;                                                                                                 // 32
                                                                                                                   // 33
    self = self._clone();                                                                                          // 34
    self.constraints = newConstraints;                                                                             // 35
    self._addPathway(constraint.name, pathway);                                                                    // 36
                                                                                                                   // 37
    var chosen = mori.get(self.choices, constraint.name);                                                          // 38
    if (chosen &&                                                                                                  // 39
        !constraint.isSatisfied(chosen, self._resolver, self._resolveContext)) {                                   // 40
      // This constraint conflicts with a choice we've already made!                                               // 41
      self.error = util.format(                                                                                    // 42
        "conflict: constraint %s is not satisfied by %s.\n" +                                                      // 43
        "Constraints on %s come from:\n%s",                                                                        // 44
        constraint.toString({removeUnibuild: true}),                                                               // 45
        chosen.version,                                                                                            // 46
        removeUnibuild(constraint.name),                                                                           // 47
        self._shownPathwaysForConstraintsIndented(constraint.name));                                               // 48
      return self;                                                                                                 // 49
    }                                                                                                              // 50
                                                                                                                   // 51
    var alternatives = mori.get(self._dependencies, constraint.name);                                              // 52
    if (alternatives) {                                                                                            // 53
      // Note: filter preserves order, which is important.                                                         // 54
      var newAlternatives = filter(alternatives, function (unitVersion) {                                          // 55
        return constraint.isSatisfied(                                                                             // 56
          unitVersion, self._resolver, self._resolveContext);                                                      // 57
      });                                                                                                          // 58
      if (mori.is_empty(newAlternatives)) {                                                                        // 59
        self.error = util.format(                                                                                  // 60
          "conflict: constraints on %s cannot all be satisfied.\n" +                                               // 61
            "Constraints come from:\n%s",                                                                          // 62
          removeUnibuild(constraint.name),                                                                         // 63
          self._shownPathwaysForConstraintsIndented(constraint.name));                                             // 64
      } else if (mori.count(newAlternatives) === 1) {                                                              // 65
        // There's only one choice, so we can immediately choose it.                                               // 66
        self = self.addChoice(mori.first(newAlternatives), pathway);                                               // 67
      } else if (mori.count(newAlternatives) !== mori.count(alternatives)) {                                       // 68
        self._dependencies = mori.assoc(                                                                           // 69
          self._dependencies, constraint.name, newAlternatives);                                                   // 70
      }                                                                                                            // 71
    }                                                                                                              // 72
    return self;                                                                                                   // 73
  },                                                                                                               // 74
  addDependency: function (unitName, pathway) {                                                                    // 75
    var self = this;                                                                                               // 76
                                                                                                                   // 77
    if (self.error || mori.has_key(self.choices, unitName)                                                         // 78
        || mori.has_key(self._dependencies, unitName)) {                                                           // 79
      return self;                                                                                                 // 80
    }                                                                                                              // 81
                                                                                                                   // 82
    self = self._clone();                                                                                          // 83
                                                                                                                   // 84
    if (!_.has(self._resolver.unitsVersions, unitName)) {                                                          // 85
      self.error = "unknown package: " + removeUnibuild(unitName);                                                 // 86
      return self;                                                                                                 // 87
    }                                                                                                              // 88
                                                                                                                   // 89
    // Note: relying on sortedness of unitsVersions so that alternatives is                                        // 90
    // sorted too (the estimation function uses this).                                                             // 91
    var alternatives = filter(self._resolver.unitsVersions[unitName], function (uv) {                              // 92
      return self.isSatisfied(uv);                                                                                 // 93
      // XXX hang on to list of violated constraints and use it in error                                           // 94
      // message                                                                                                   // 95
    });                                                                                                            // 96
                                                                                                                   // 97
    if (mori.is_empty(alternatives)) {                                                                             // 98
      self.error = util.format(                                                                                    // 99
        "conflict: constraints on %s cannot be satisfied.\n" +                                                     // 100
          "Constraints come from:\n%s",                                                                            // 101
        removeUnibuild(unitName),                                                                                  // 102
        self._shownPathwaysForConstraintsIndented(unitName));                                                      // 103
      return self;                                                                                                 // 104
    } else if (mori.count(alternatives) === 1) {                                                                   // 105
      // There's only one choice, so we can immediately choose it.                                                 // 106
      self = self.addChoice(mori.first(alternatives), pathway);                                                    // 107
    } else {                                                                                                       // 108
      self._dependencies = mori.assoc(                                                                             // 109
        self._dependencies, unitName, alternatives);                                                               // 110
      self._addPathway(unitName, pathway);                                                                         // 111
    }                                                                                                              // 112
                                                                                                                   // 113
    return self;                                                                                                   // 114
  },                                                                                                               // 115
  addChoice: function (uv, pathway) {                                                                              // 116
    var self = this;                                                                                               // 117
                                                                                                                   // 118
    if (self.error)                                                                                                // 119
      return self;                                                                                                 // 120
    if (mori.has_key(self.choices, uv.name))                                                                       // 121
      throw Error("Already chose " + uv.name);                                                                     // 122
                                                                                                                   // 123
    self = self._clone();                                                                                          // 124
                                                                                                                   // 125
    // Does adding this choice break some constraints we already have?                                             // 126
    if (!self.isSatisfied(uv)) {                                                                                   // 127
      // This shouldn't happen: all calls to addChoice should occur based on                                       // 128
      // choosing it from a list of satisfied alternatives.                                                        // 129
      throw new Error("try to choose an unsatisfied version?");                                                    // 130
    }                                                                                                              // 131
                                                                                                                   // 132
    // Great, move it from dependencies to choices.                                                                // 133
    self.choices = mori.assoc(self.choices, uv.name, uv);                                                          // 134
    self._dependencies = mori.dissoc(self._dependencies, uv.name);                                                 // 135
    self._addPathway(uv.name, pathway);                                                                            // 136
                                                                                                                   // 137
    // Since we're committing to this version, we're committing to all it                                          // 138
    // implies.                                                                                                    // 139
    var pathwayIncludingUv = mori.cons(uv, pathway);                                                               // 140
    uv.constraints.each(function (constraint) {                                                                    // 141
      self = self.addConstraint(constraint, pathwayIncludingUv);                                                   // 142
    });                                                                                                            // 143
    _.each(uv.dependencies, function (unitName) {                                                                  // 144
      self = self.addDependency(unitName, pathwayIncludingUv);                                                     // 145
    });                                                                                                            // 146
                                                                                                                   // 147
    return self;                                                                                                   // 148
  },                                                                                                               // 149
  // this mutates self, so only call on a newly _clone'd and not yet returned                                      // 150
  // object.                                                                                                       // 151
  _addPathway: function (unitName, pathway) {                                                                      // 152
    var self = this;                                                                                               // 153
    self._unitPathways = mori.assoc(                                                                               // 154
      self._unitPathways, unitName,                                                                                // 155
      mori.conj(mori.get(self._unitPathways, unitName, mori.set()),                                                // 156
                pathway));                                                                                         // 157
  },                                                                                                               // 158
  success: function () {                                                                                           // 159
    var self = this;                                                                                               // 160
    return !self.error && mori.is_empty(self._dependencies);                                                       // 161
  },                                                                                                               // 162
  eachDependency: function (iter) {                                                                                // 163
    var self = this;                                                                                               // 164
    mori.some(function (nameAndAlternatives) {                                                                     // 165
      return BREAK == iter(mori.first(nameAndAlternatives),                                                        // 166
                           mori.last(nameAndAlternatives));                                                        // 167
    }, self._dependencies);                                                                                        // 168
  },                                                                                                               // 169
  isSatisfied: function (uv) {                                                                                     // 170
    var self = this;                                                                                               // 171
    return self.constraints.isSatisfied(uv, self._resolver, self._resolveContext);                                 // 172
  },                                                                                                               // 173
  somePathwayForUnitName: function (unitName) {                                                                    // 174
    var self = this;                                                                                               // 175
    var pathways = mori.get(self._unitPathways, unitName);                                                         // 176
    if (!pathways)                                                                                                 // 177
      return mori.list();                                                                                          // 178
    return mori.first(pathways);                                                                                   // 179
  },                                                                                                               // 180
  _clone: function () {                                                                                            // 181
    var self = this;                                                                                               // 182
    var clone = new ResolverState(self._resolver, self._resolveContext);                                           // 183
    _.each(['choices', '_dependencies', 'constraints', 'error', '_unitPathways'], function (field) {               // 184
      clone[field] = self[field];                                                                                  // 185
    });                                                                                                            // 186
    return clone;                                                                                                  // 187
  },                                                                                                               // 188
  _shownPathwaysForConstraints: function (unitName) {                                                              // 189
    var self = this;                                                                                               // 190
    var pathways = mori.into_array(mori.map(function (pathway) {                                                   // 191
      return showPathway(pathway, unitName);                                                                       // 192
    }, mori.get(self._unitPathways, unitName)));                                                                   // 193
    pathways.sort();                                                                                               // 194
    pathways = _.uniq(pathways, true);                                                                             // 195
    return pathways;                                                                                               // 196
  },                                                                                                               // 197
  _shownPathwaysForConstraintsIndented: function (unitName) {                                                      // 198
    var self = this;                                                                                               // 199
    return _.map(self._shownPathwaysForConstraints(unitName), function (pathway) {                                 // 200
      return "  " + (pathway ? pathway : "<top level>");                                                           // 201
    }).join("\n");                                                                                                 // 202
  }                                                                                                                // 203
});                                                                                                                // 204
                                                                                                                   // 205
// Helper for filtering a vector in mori. mori.filter returns a lazy sequence,                                     // 206
// which is cool, but we actually do want to coerce to a vector since we (eg the                                   // 207
// estimation function) runs mori.last on it a bunch and we'd like to only                                         // 208
// do the O(n) work once.                                                                                          // 209
var filter = function (v, pred) {                                                                                  // 210
  return mori.into(mori.vector(), mori.filter(pred, v));                                                           // 211
};                                                                                                                 // 212
                                                                                                                   // 213
// Users are mostly confused by seeing "package#web.browser" instead of just                                       // 214
// "package". Remove it for error messages.                                                                        // 215
removeUnibuild = function (unitName) {                                                                             // 216
  // For debugging constraint solver issues.                                                                       // 217
  if (process.env.METEOR_SHOW_UNIBUILDS)                                                                           // 218
    return unitName;                                                                                               // 219
  return unitName.split('#')[0];                                                                                   // 220
};                                                                                                                 // 221
                                                                                                                   // 222
// XXX from Underscore.String (http://epeli.github.com/underscore.string/)                                         // 223
// XXX how many copies of this do we have in Meteor?                                                               // 224
var startsWith = function(str, starts) {                                                                           // 225
  return str.length >= starts.length &&                                                                            // 226
    str.substring(0, starts.length) === starts;                                                                    // 227
};                                                                                                                 // 228
                                                                                                                   // 229
var showPathway = function (pathway, dropIfFinal) {                                                                // 230
  var pathUnits = mori.into_array(mori.map(function (uv) {                                                         // 231
    return uv.toString({removeUnibuild: true});                                                                    // 232
  }, mori.reverse(pathway)));                                                                                      // 233
                                                                                                                   // 234
  var dropPrefix = removeUnibuild(dropIfFinal) + '@';                                                              // 235
  while (pathUnits.length && startsWith(_.last(pathUnits), dropPrefix)) {                                          // 236
    pathUnits.pop();                                                                                               // 237
  }                                                                                                                // 238
                                                                                                                   // 239
  // This is a bit of a hack: we're using _.uniq in "it's sorted" mode, whose                                      // 240
  // implementation is "drop adjacent duplicates". This is what we want (we're                                     // 241
  // trying to avoid seeing "foo -> foo" which represents "foo#os ->                                               // 242
  // foo#web.browser") even though it's not actually sorted.                                                       // 243
  pathUnits = _.uniq(pathUnits, true);                                                                             // 244
  return pathUnits.join(' -> ');                                                                                   // 245
};                                                                                                                 // 246
                                                                                                                   // 247
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                 //
// packages/constraint-solver/priority-queue.js                                                                    //
//                                                                                                                 //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                   //
PriorityQueue = function () {                                                                                      // 1
  var self = this;                                                                                                 // 2
  var compareArrays = function (a, b) {                                                                            // 3
    for (var i = 0; i < a.length; i++)                                                                             // 4
      if (a[i] !== b[i])                                                                                           // 5
        if (a[i] instanceof Array)                                                                                 // 6
          return compareArrays(a[i], b[i]);                                                                        // 7
        else                                                                                                       // 8
          return a[i] - b[i];                                                                                      // 9
                                                                                                                   // 10
    return 0;                                                                                                      // 11
  };                                                                                                               // 12
  // id -> cost                                                                                                    // 13
  self._heap = new MinHeap(function (a, b) {                                                                       // 14
    return compareArrays(a, b);                                                                                    // 15
  });                                                                                                              // 16
                                                                                                                   // 17
  // id -> reference to item                                                                                       // 18
  self._items = {};                                                                                                // 19
};                                                                                                                 // 20
                                                                                                                   // 21
_.extend(PriorityQueue.prototype, {                                                                                // 22
  push: function (item, cost) {                                                                                    // 23
    var self = this;                                                                                               // 24
    var id = Random.id();                                                                                          // 25
    self._heap.set(id, cost);                                                                                      // 26
    self._items[id] = item;                                                                                        // 27
  },                                                                                                               // 28
  top: function () {                                                                                               // 29
    var self = this;                                                                                               // 30
                                                                                                                   // 31
    if (self.empty())                                                                                              // 32
      throw new Error("The queue is empty");                                                                       // 33
                                                                                                                   // 34
    var id = self._heap.minElementId();                                                                            // 35
    return self._items[id];                                                                                        // 36
  },                                                                                                               // 37
  pop: function () {                                                                                               // 38
    var self = this;                                                                                               // 39
                                                                                                                   // 40
    if (self.empty())                                                                                              // 41
      throw new Error("The queue is empty");                                                                       // 42
                                                                                                                   // 43
    var id = self._heap.minElementId();                                                                            // 44
    var item = self._items[id];                                                                                    // 45
                                                                                                                   // 46
    delete self._items[id];                                                                                        // 47
    self._heap.remove(id);                                                                                         // 48
                                                                                                                   // 49
    return item;                                                                                                   // 50
  },                                                                                                               // 51
  empty: function () {                                                                                             // 52
    var self = this;                                                                                               // 53
    return self._heap.empty();                                                                                     // 54
  },                                                                                                               // 55
  size: function () {                                                                                              // 56
    var self = this;                                                                                               // 57
    return self._heap.size();                                                                                      // 58
  }                                                                                                                // 59
});                                                                                                                // 60
                                                                                                                   // 61
                                                                                                                   // 62
                                                                                                                   // 63
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

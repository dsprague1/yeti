(function () {

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/constraint-solver/datatypes.js                                     //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
ConstraintSolver = {};                                                         // 1
                                                                               // 2
var PV = PackageVersion;                                                       // 3
var CS = ConstraintSolver;                                                     // 4
                                                                               // 5
////////// PackageAndVersion                                                   // 6
                                                                               // 7
// An ordered pair of (package, version).                                      // 8
CS.PackageAndVersion = function (package, version) {                           // 9
  check(package, String);                                                      // 10
  check(version, String);                                                      // 11
                                                                               // 12
  this.package = package;                                                      // 13
  this.version = version;                                                      // 14
};                                                                             // 15
                                                                               // 16
// The string form of a PackageAndVersion is "package version",                // 17
// for example "foo 1.0.1".  The reason we don't use an "@" is                 // 18
// it would look too much like a PackageConstraint.                            // 19
CS.PackageAndVersion.prototype.toString = function () {                        // 20
  return this.package + " " + this.version;                                    // 21
};                                                                             // 22
                                                                               // 23
CS.PackageAndVersion.fromString = function (str) {                             // 24
  var parts = str.split(' ');                                                  // 25
  if (parts.length === 2 && parts[0] && parts[1]) {                            // 26
    return new CS.PackageAndVersion(parts[0], parts[1]);                       // 27
  } else {                                                                     // 28
    throw new Error("Malformed PackageAndVersion: " + str);                    // 29
  }                                                                            // 30
};                                                                             // 31
                                                                               // 32
////////// Dependency                                                          // 33
                                                                               // 34
// A Dependency consists of a PackageConstraint (like "foo@=1.2.3")            // 35
// and flags, like "isWeak".                                                   // 36
                                                                               // 37
CS.Dependency = function (packageConstraint, flags) {                          // 38
  check(packageConstraint, Match.OneOf(PV.PackageConstraint, String));         // 39
  if (typeof packageConstraint === 'string') {                                 // 40
    packageConstraint = PV.parseConstraint(packageConstraint);                 // 41
  }                                                                            // 42
  if (flags) {                                                                 // 43
    check(flags, Object);                                                      // 44
  }                                                                            // 45
                                                                               // 46
  this.pConstraint = packageConstraint;                                        // 47
  this.isWeak = false;                                                         // 48
                                                                               // 49
  if (flags) {                                                                 // 50
    if (flags.isWeak) {                                                        // 51
      this.isWeak = true;                                                      // 52
    }                                                                          // 53
  }                                                                            // 54
};                                                                             // 55
                                                                               // 56
// The string form of a Dependency is `?foo@1.0.0` for a weak                  // 57
// reference to package "foo" with VersionConstraint "1.0.0".                  // 58
CS.Dependency.prototype.toString = function () {                               // 59
  var ret = this.pConstraint.toString();                                       // 60
  if (this.isWeak) {                                                           // 61
    ret = '?' + ret;                                                           // 62
  }                                                                            // 63
  return ret;                                                                  // 64
};                                                                             // 65
                                                                               // 66
CS.Dependency.fromString = function (str) {                                    // 67
  var isWeak = false;                                                          // 68
                                                                               // 69
  if (str.charAt(0) === '?') {                                                 // 70
    isWeak = true;                                                             // 71
    str = str.slice(1);                                                        // 72
  }                                                                            // 73
                                                                               // 74
  var flags = isWeak ? { isWeak: true } : null;                                // 75
                                                                               // 76
  return new CS.Dependency(str, flags);                                        // 77
};                                                                             // 78
                                                                               // 79
/////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/constraint-solver/catalog-cache.js                                 //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
var CS = ConstraintSolver;                                                     // 1
                                                                               // 2
var pvkey = function (package, version) {                                      // 3
  return package + " " + version;                                              // 4
};                                                                             // 5
                                                                               // 6
// Stores the Dependencies for each known PackageAndVersion.                   // 7
CS.CatalogCache = function () {                                                // 8
  // String(PackageAndVersion) -> String -> Dependency.                        // 9
  // For example, "foo 1.0.0" -> "bar" -> Dependency.fromString("?bar@1.0.2"). // 10
  this._dependencies = {};                                                     // 11
  // A map derived from the keys of _dependencies, for ease of iteration.      // 12
  // "package" -> ["versions", ...]                                            // 13
  // Versions in the array are unique but not sorted.                          // 14
  this._versions = {};                                                         // 15
};                                                                             // 16
                                                                               // 17
CS.CatalogCache.prototype.hasPackageVersion = function (package, version) {    // 18
  return _.has(this._dependencies, pvkey(package, version));                   // 19
};                                                                             // 20
                                                                               // 21
CS.CatalogCache.prototype.addPackageVersion = function (p, v, deps) {          // 22
  check(p, String);                                                            // 23
  check(v, String);                                                            // 24
  // `deps` must not have any duplicate values of `.pConstraint.name`          // 25
  check(deps, [CS.Dependency]);                                                // 26
                                                                               // 27
  var key = pvkey(p, v);                                                       // 28
  if (_.has(this._dependencies, key)) {                                        // 29
    throw new Error("Already have an entry for " + key);                       // 30
  }                                                                            // 31
                                                                               // 32
  if (! _.has(this._versions, p)) {                                            // 33
    this._versions[p] = [];                                                    // 34
  }                                                                            // 35
  this._versions[p].push(v);                                                   // 36
                                                                               // 37
  var depsByPackage = {};                                                      // 38
  this._dependencies[key] = depsByPackage;                                     // 39
  _.each(deps, function (d) {                                                  // 40
    var p2 = d.pConstraint.name;                                               // 41
    if (_.has(depsByPackage, p2)) {                                            // 42
      throw new Error("Can't have two dependencies on " + p2 +                 // 43
                      " in " + key);                                           // 44
    }                                                                          // 45
    depsByPackage[p2] = d;                                                     // 46
  });                                                                          // 47
};                                                                             // 48
                                                                               // 49
// Returns the dependencies of a (package, version), stored in a map.          // 50
// The values are Dependency objects; the key for `d` is                       // 51
// `d.pConstraint.name`.  (Don't mutate the map.)                              // 52
CS.CatalogCache.prototype.getDependencyMap = function (p, v) {                 // 53
  var key = pvkey(p, v);                                                       // 54
  if (! _.has(this._dependencies, key)) {                                      // 55
    throw new Error("No entry for " + key);                                    // 56
  }                                                                            // 57
  return this._dependencies[key];                                              // 58
};                                                                             // 59
                                                                               // 60
// Returns an array of version strings, unsorted, possibly empty.              // 61
// (Don't mutate the result.)                                                  // 62
CS.CatalogCache.prototype.getPackageVersions = function (package) {            // 63
  return (_.has(this._versions, package) ?                                     // 64
          this._versions[package] : []);                                       // 65
};                                                                             // 66
                                                                               // 67
CS.CatalogCache.prototype.toJSONable = function () {                           // 68
  var self = this;                                                             // 69
  var data = {};                                                               // 70
  _.each(self._dependencies, function (depsByPackage, key) {                   // 71
    // depsByPackage is a map of String -> Dependency.                         // 72
    // Map over the values to get an array of String.                          // 73
    data[key] = _.map(depsByPackage, function (dep) {                          // 74
      return dep.toString();                                                   // 75
    });                                                                        // 76
  });                                                                          // 77
  return { data: data };                                                       // 78
};                                                                             // 79
                                                                               // 80
CS.CatalogCache.fromJSONable = function (obj) {                                // 81
  check(obj, { data: Object });                                                // 82
                                                                               // 83
  var cache = new CS.CatalogCache();                                           // 84
  _.each(obj.data, function (depsArray, pv) {                                  // 85
    check(depsArray, [String]);                                                // 86
    pv = CS.PackageAndVersion.fromString(pv);                                  // 87
    cache.addPackageVersion(                                                   // 88
      pv.package, pv.version,                                                  // 89
      _.map(depsArray, function (str) {                                        // 90
        return CS.Dependency.fromString(str);                                  // 91
      }));                                                                     // 92
  });                                                                          // 93
  return cache;                                                                // 94
};                                                                             // 95
                                                                               // 96
// Calls `iter` on each PackageAndVersion, with the second argument being      // 97
// a map from package name to Dependency.  If `iter` returns true,             // 98
// iteration is stopped.                                                       // 99
CS.CatalogCache.prototype.eachPackageVersion = function (iter) {               // 100
  var self = this;                                                             // 101
  for (var key in self._dependencies) {                                        // 102
    var stop = iter(CS.PackageAndVersion.fromString(key),                      // 103
                    self._dependencies[key]);                                  // 104
    if (stop) {                                                                // 105
      break;                                                                   // 106
    }                                                                          // 107
  }                                                                            // 108
};                                                                             // 109
                                                                               // 110
// Calls `iter` on each package name, with the second argument being           // 111
// a list of versions present for that package (unique but not sorted).        // 112
// If `iter` returns true, iteration is stopped.                               // 113
ConstraintSolver.CatalogCache.prototype.eachPackage = function (iter) {        // 114
  var self = this;                                                             // 115
  for (var key in self._versions) {                                            // 116
    var stop = iter(key, self.getPackageVersions(key));                        // 117
    if (stop) {                                                                // 118
      break;                                                                   // 119
    }                                                                          // 120
  }                                                                            // 121
};                                                                             // 122
                                                                               // 123
/////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/constraint-solver/catalog-loader.js                                //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
var PV = PackageVersion;                                                       // 1
var CS = ConstraintSolver;                                                     // 2
                                                                               // 3
// A CatalogLoader populates the CatalogCache from the Catalog.  When          // 4
// running unit tests with no Catalog and canned data for the                  // 5
// CatalogCache, there will be no CatalogLoader.                               // 6
//                                                                             // 7
// Fine-grained Loading: While we don't currently support loading only         // 8
// some versions of a package, CatalogLoader is meant to be extended           // 9
// to support incrementally loading individual package versions.  It           // 10
// has no concept of a "loaded package," for example, just a loaded            // 11
// package version.  CatalogLoader's job, in principle, is to load             // 12
// package versions efficiently, no matter the access pattern, by              // 13
// making the right catalog calls and doing the right caching.                 // 14
// Calling a catalog method generally means running a SQLite query,            // 15
// which could be time-consuming.                                              // 16
                                                                               // 17
CS.CatalogLoader = function (fromCatalog, toCatalogCache) {                    // 18
  var self = this;                                                             // 19
                                                                               // 20
  self.catalog = fromCatalog;                                                  // 21
  self.catalogCache = toCatalogCache;                                          // 22
                                                                               // 23
  self._sortedVersionRecordsCache = {};                                        // 24
};                                                                             // 25
                                                                               // 26
// We rely on the following `catalog` methods:                                 // 27
//                                                                             // 28
// * getSortedVersionRecords(packageName) ->                                   // 29
//     [{packageName, version, dependencies}]                                  // 30
//                                                                             // 31
//   Where `dependencies` is a map from packageName to                         // 32
//   an object of the form `{ constraint: String|null,                         // 33
//   references: [{arch: String, optional "weak": true}] }`.                   // 34
                                                                               // 35
var convertDeps = function (catalogDeps) {                                     // 36
  return _.map(catalogDeps, function (dep, package) {                          // 37
    // The dependency is strong if any of its "references"                     // 38
    // (for different architectures) are strong.                               // 39
    var isStrong = _.any(dep.references, function (ref) {                      // 40
      return !ref.weak;                                                        // 41
    });                                                                        // 42
                                                                               // 43
    var constraint = (dep.constraint || null);                                 // 44
    if (constraint === 'none') { // not sure where this comes from             // 45
      constraint = null;                                                       // 46
    }                                                                          // 47
                                                                               // 48
    return new CS.Dependency(new PV.PackageConstraint(package, constraint),    // 49
                             isStrong ? null : {isWeak: true});                // 50
  });                                                                          // 51
};                                                                             // 52
                                                                               // 53
// Since we don't fetch different versions of a package independently          // 54
// at the moment, this helper is where we get our data.                        // 55
CS.CatalogLoader.prototype._getSortedVersionRecords = function (package) {     // 56
  if (! _.has(this._sortedVersionRecordsCache, package)) {                     // 57
    this._sortedVersionRecordsCache[package] =                                 // 58
      this.catalog.getSortedVersionRecords(package);                           // 59
  }                                                                            // 60
                                                                               // 61
  return this._sortedVersionRecordsCache[package];                             // 62
};                                                                             // 63
                                                                               // 64
CS.CatalogLoader.prototype.loadAllVersions = function (package) {              // 65
  var self = this;                                                             // 66
  var cache = self.catalogCache;                                               // 67
  var versionRecs = self._getSortedVersionRecords(package);                    // 68
  _.each(versionRecs, function (rec) {                                         // 69
    var version = rec.version;                                                 // 70
    if (! cache.hasPackageVersion(package, version)) {                         // 71
      var deps = convertDeps(rec.dependencies);                                // 72
      cache.addPackageVersion(package, version, deps);                         // 73
    }                                                                          // 74
  });                                                                          // 75
};                                                                             // 76
                                                                               // 77
// Takes an array of package names.  Loads all versions of them and their      // 78
// (strong) dependencies.                                                      // 79
CS.CatalogLoader.prototype.loadAllVersionsRecursive = function (packageList) { // 80
  var self = this;                                                             // 81
                                                                               // 82
  // Within a call to loadAllVersionsRecursive, we only visit each package     // 83
  // at most once.  If we visit a package we've already loaded, it will        // 84
  // lead to a quick scan through the versions in our cache to make sure       // 85
  // they have been loaded into the CatalogCache.                              // 86
  var loadQueue = [];                                                          // 87
  var packagesEverEnqueued = {};                                               // 88
                                                                               // 89
  var enqueue = function (package) {                                           // 90
    if (! _.has(packagesEverEnqueued, package)) {                              // 91
      packagesEverEnqueued[package] = true;                                    // 92
      loadQueue.push(package);                                                 // 93
    }                                                                          // 94
  };                                                                           // 95
                                                                               // 96
  _.each(packageList, enqueue);                                                // 97
                                                                               // 98
  while (loadQueue.length) {                                                   // 99
    var package = loadQueue.pop();                                             // 100
    self.loadAllVersions(package);                                             // 101
    _.each(self.catalogCache.getPackageVersions(package), function (v) {       // 102
      var depMap = self.catalogCache.getDependencyMap(package, v);             // 103
      _.each(depMap, function (dep, package2) {                                // 104
        enqueue(package2);                                                     // 105
      });                                                                      // 106
    });                                                                        // 107
  }                                                                            // 108
};                                                                             // 109
                                                                               // 110
/////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
// packages/constraint-solver/constraint-solver-input.js                       //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////
                                                                               //
var PV = PackageVersion;                                                       // 1
var CS = ConstraintSolver;                                                     // 2
                                                                               // 3
// The "Input" object completely specifies the input to the resolver,          // 4
// and it holds the data loaded from the Catalog as well.  It can be           // 5
// serialized to JSON and read back in for testing purposes.                   // 6
CS.Input = function (dependencies, constraints, catalogCache, options) {       // 7
  options = options || {};                                                     // 8
                                                                               // 9
  this.dependencies = dependencies;                                            // 10
  this.constraints = constraints;                                              // 11
  this.upgrade = options.upgrade || [];                                        // 12
  this.anticipatedPrereleases = options.anticipatedPrereleases || {};          // 13
  this.previousSolution = options.previousSolution || null;                    // 14
                                                                               // 15
  check(this.dependencies, [String]);                                          // 16
  check(this.constraints, [PackageConstraintType]);                            // 17
  check(this.upgrade, [String]);                                               // 18
  check(this.anticipatedPrereleases,                                           // 19
        Match.ObjectWithValues(Match.ObjectWithValues(Boolean)));              // 20
  check(this.previousSolution, Match.OneOf(Object, null));                     // 21
                                                                               // 22
  this.catalogCache = catalogCache;                                            // 23
};                                                                             // 24
                                                                               // 25
CS.Input.prototype.loadFromCatalog = function (catalogLoader) {                // 26
  var self = this;                                                             // 27
                                                                               // 28
  var packagesToLoad = {}; // package -> true                                  // 29
                                                                               // 30
  _.each(self.dependencies, function (package) {                               // 31
    packagesToLoad[package] = true;                                            // 32
  });                                                                          // 33
  _.each(self.constraints, function (constraint) {                             // 34
    packagesToLoad[constraint.name] = true;                                    // 35
  });                                                                          // 36
  _.each(self.previousSolution, function (version, package) {                  // 37
    packagesToLoad[package] = true;                                            // 38
  });                                                                          // 39
                                                                               // 40
  // Load packages into the cache (if they aren't loaded already).             // 41
  catalogLoader.loadAllVersionsRecursive(_.keys(packagesToLoad));              // 42
};                                                                             // 43
                                                                               // 44
CS.Input.prototype.toJSONable = function () {                                  // 45
  var self = this;                                                             // 46
  var obj = {                                                                  // 47
    dependencies: self.dependencies,                                           // 48
    constraints: _.map(self.constraints, function (c) {                        // 49
      return c.toString();                                                     // 50
    }),                                                                        // 51
    catalogCache: self.catalogCache.toJSONable()                               // 52
  };                                                                           // 53
  // For readability of the resulting JSON, only include optional              // 54
  // properties that aren't the default.                                       // 55
  if (self.upgrade.length) {                                                   // 56
    obj.upgrade = self.upgrade;                                                // 57
  }                                                                            // 58
  if (! _.isEmpty(self.anticipatedPrereleases)) {                              // 59
    obj.anticipatedPrereleases = self.anticipatedPrereleases;                  // 60
  }                                                                            // 61
  if (self.previousSolution !== null) {                                        // 62
    obj.previousSolution = self.previousSolution;                              // 63
  };                                                                           // 64
  return obj;                                                                  // 65
};                                                                             // 66
                                                                               // 67
CS.Input.fromJSONable = function (obj) {                                       // 68
  check(obj, {                                                                 // 69
    dependencies: [String],                                                    // 70
    constraints: [String],                                                     // 71
    catalogCache: Object,                                                      // 72
    anticipatedPrereleases: Match.Optional(                                    // 73
      Match.ObjectWithValues(Match.ObjectWithValues(Boolean))),                // 74
    previousSolution: Match.Optional(Match.OneOf(Object, null)),               // 75
    upgrade: Match.Optional([String])                                          // 76
  });                                                                          // 77
                                                                               // 78
  return new CS.Input(                                                         // 79
    obj.dependencies,                                                          // 80
    _.map(obj.constraints, function (cstr) {                                   // 81
      return PV.parseConstraint(cstr);                                         // 82
    }),                                                                        // 83
    CS.CatalogCache.fromJSONable(obj.catalogCache),                            // 84
    {                                                                          // 85
      upgrade: obj.upgrade,                                                    // 86
      anticipatedPrereleases: obj.anticipatedPrereleases,                      // 87
      previousSolution: obj.previousSolution                                   // 88
    });                                                                        // 89
};                                                                             // 90
                                                                               // 91
// PackageConstraints and VersionConstraints passed in from the tool           // 92
// to us (where we are a uniloaded package) will have constructors             // 93
// that we don't recognize because they come from a different copy of          // 94
// package-version-parser!  In addition, objects with constructors             // 95
// can't be checked by "check" in the same way as plain objects, so we         // 96
// have to resort to examining the fields explicitly.                          // 97
var VersionConstraintType = Match.OneOf(                                       // 98
  PV.VersionConstraint,                                                        // 99
  Match.Where(function (vc) {                                                  // 100
    check(vc.raw, String);                                                     // 101
    check(vc.alternatives, [{                                                  // 102
      versionString: Match.OneOf(String, null),                                // 103
      type: String                                                             // 104
    }]);                                                                       // 105
    return vc.constructor !== Object;                                          // 106
  }));                                                                         // 107
                                                                               // 108
var PackageConstraintType = Match.OneOf(                                       // 109
  PV.PackageConstraint,                                                        // 110
  Match.Where(function (c) {                                                   // 111
    check(c.name, String);                                                     // 112
    check(c.constraintString, String);                                         // 113
    check(c.vConstraint, VersionConstraintType);                               // 114
    return c.constructor !== Object;                                           // 115
  }));                                                                         // 116
                                                                               // 117
/////////////////////////////////////////////////////////////////////////////////

}).call(this);

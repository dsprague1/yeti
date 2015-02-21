(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;

/* Package-scope variables */
var DevBundleFetcher;

(function () {

///////////////////////////////////////////////////////////////////////
//                                                                   //
// packages/dev-bundle-fetcher/dev-bundle.js                         //
//                                                                   //
///////////////////////////////////////////////////////////////////////
                                                                     //
DevBundleFetcher = {
  script: function () {
    return Assets.getText("dev-bundle");
  }
};

///////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
if (typeof Package === 'undefined') Package = {};
Package['dev-bundle-fetcher'] = {
  DevBundleFetcher: DevBundleFetcher
};

})();

//# sourceMappingURL=dev-bundle-fetcher.js.map

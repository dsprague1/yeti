(function () {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                              //
// packages/templating/templating.js                                                                            //
//                                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                //
                                                                                                                // 1
// Packages and apps add templates on to this object.                                                           // 2
                                                                                                                // 3
/**                                                                                                             // 4
 * @summary The class for defining templates                                                                    // 5
 * @class                                                                                                       // 6
 * @instanceName Template.myTemplate                                                                            // 7
 */                                                                                                             // 8
Template = Blaze.Template;                                                                                      // 9
                                                                                                                // 10
var RESERVED_TEMPLATE_NAMES = "__proto__ name".split(" ");                                                      // 11
                                                                                                                // 12
// Check for duplicate template names and illegal names that won't work.                                        // 13
Template.__checkName = function (name) {                                                                        // 14
  // Some names can't be used for Templates. These include:                                                     // 15
  //  - Properties Blaze sets on the Template object.                                                           // 16
  //  - Properties that some browsers don't let the code to set.                                                // 17
  //    These are specified in RESERVED_TEMPLATE_NAMES.                                                         // 18
  if (name in Template || _.contains(RESERVED_TEMPLATE_NAMES, name)) {                                          // 19
    if ((Template[name] instanceof Template) && name !== "body")                                                // 20
      throw new Error("There are multiple templates named '" + name + "'. Each template needs a unique name."); // 21
    throw new Error("This template name is reserved: " + name);                                                 // 22
  }                                                                                                             // 23
};                                                                                                              // 24
                                                                                                                // 25
// XXX COMPAT WITH 0.8.3                                                                                        // 26
Template.__define__ = function (name, renderFunc) {                                                             // 27
  Template.__checkName(name);                                                                                   // 28
  Template[name] = new Template("Template." + name, renderFunc);                                                // 29
  // Exempt packages built pre-0.9.0 from warnings about using old                                              // 30
  // helper syntax, because we can.  It's not very useful to get a                                              // 31
  // warning about someone else's code (like a package on Atmosphere),                                          // 32
  // and this should at least put a bit of a dent in number of warnings                                         // 33
  // that come from packages that haven't been updated lately.                                                  // 34
  Template[name]._NOWARN_OLDSTYLE_HELPERS = true;                                                               // 35
};                                                                                                              // 36
                                                                                                                // 37
// Define a template `Template.body` that renders its                                                           // 38
// `contentViews`.  `<body>` tags (of which there may be                                                        // 39
// multiple) will have their contents added to it.                                                              // 40
                                                                                                                // 41
/**                                                                                                             // 42
 * @summary The [template object](#templates_api) representing your `<body>` tag.                               // 43
 * @locus Client                                                                                                // 44
 */                                                                                                             // 45
Template.body = new Template('body', function () {                                                              // 46
  var parts = Template.body.contentViews;                                                                       // 47
  // enable lookup by setting `view.template`                                                                   // 48
  for (var i = 0; i < parts.length; i++)                                                                        // 49
    parts[i].template = Template.body;                                                                          // 50
  return parts;                                                                                                 // 51
});                                                                                                             // 52
Template.body.contentViews = []; // array of Blaze.Views                                                        // 53
Template.body.view = null;                                                                                      // 54
                                                                                                                // 55
Template.body.addContent = function (renderFunc) {                                                              // 56
  var kind = 'body_content_' + Template.body.contentViews.length;                                               // 57
                                                                                                                // 58
  Template.body.contentViews.push(Blaze.View(kind, renderFunc));                                                // 59
};                                                                                                              // 60
                                                                                                                // 61
// This function does not use `this` and so it may be called                                                    // 62
// as `Meteor.startup(Template.body.renderIntoDocument)`.                                                       // 63
Template.body.renderToDocument = function () {                                                                  // 64
  // Only do it once.                                                                                           // 65
  if (Template.body.view)                                                                                       // 66
    return;                                                                                                     // 67
                                                                                                                // 68
  var view = Blaze.render(Template.body, document.body);                                                        // 69
  Template.body.view = view;                                                                                    // 70
};                                                                                                              // 71
                                                                                                                // 72
// XXX COMPAT WITH 0.9.0                                                                                        // 73
UI.body = Template.body;                                                                                        // 74
                                                                                                                // 75
// XXX COMPAT WITH 0.9.0                                                                                        // 76
// (<body> tags in packages built with 0.9.0)                                                                   // 77
Template.__body__ = Template.body;                                                                              // 78
Template.__body__.__contentParts = Template.body.contentViews;                                                  // 79
Template.__body__.__instantiate = Template.body.renderToDocument;                                               // 80
                                                                                                                // 81
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
require('aurelia-polyfills');
var gulp = require('gulp');
var typedoc = require('gulp-typedoc');
var through = require('through2');
var fs = require('fs');
var binding = require('aurelia-binding');
var ParserImplementation  = binding.ParserImplementation;
var Lexer  = binding.Lexer;
var jsdom = require('jsdom');


// extract typedoc information from the class
// makes it easy to find which properties exist a the view-model
var tsDoc = new Promise(function (resolve) {
  gulp.src(["./test.ts"])
    .pipe(typedoc({
      json: './temp/test.json',
      module: "commonjs"
    }))
    .on('end', function () {
      getFileContent('./temp/test.json')
      .then(data => resolve(JSON.parse(data)));
    });
});

tsDoc.then(function (json) {
  var propertiesInClass = getProperties(json);
  getHTML("test.html")
  .then(function (window) {
    // expressions are "username" or "someOtherProperty" in test.html
    return extractExpressions(window);
  })
  .then(function (expressions) {
    for(var i = 0; i < expressions.length; i++) {
      var expr = expressions[i];
      console.log(expr);
      var found = false;
      for(var x = 0; x < propertiesInClass.length; x++) {
        var propInClass = propertiesInClass[x];
        // check if the property in the binding expression has also been extracted from typedoc
        if(propInClass === expr.name) {
          found = true;
        }
      }

      if(!found) {
        console.log("ERROR: Did not find property '" + expr.name + "' on the view-model");
      } else {
        console.log("Found property '" + expr.name + "' on the view-model");
      }
    }
  });
})


function extractExpressions(window) {
  return new Promise(function (resolve) {
    resolve(_extractExpression(window, []));
  });
}

function _extractExpression(elem, expressions) {
  if (elem.content) {
    expressions = _extractExpression(elem.content, expressions);
  }

  if(elem.childNodes.length > 0) {
    for(var i = 0; i < elem.childNodes.length; i++) {
      expressions = _extractExpression(elem.childNodes[i], expressions);
    }
  } else {
    // get all expressions from the element
    // i'd love to use aurelia to get all binding expressions from a particalar view, but I think we need to have some browser capabilities for that
    // for now, just extract value.bind expressions and parse that into a binding expression via aurelia-binding
    if (elem.getAttribute && elem.getAttribute("value.bind")) {
      var expr = elem.getAttribute("value.bind");
      var parser = new ParserImplementation(new Lexer(), expr);
      var expr = parser.parseExpression();
      expressions.push(expr);
    }
  }
  return expressions;
}

function getHTML(file) {
  return getFileContent(file)
  .then(data => {
    return parseHTML(data);
  })
}

function parseHTML(htmlStr) {
  return new Promise(function (resolve) {
    // parse the html string via jsdom
    jsdom.env(htmlStr, function (err, window) {
      resolve(window.document.head.getElementsByTagName("template")[0]);
    });
  });
}

function getFileContent(path) {
  return new Promise(function (resolve) {
    fs.readFile(path, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }

      resolve(data);
    });
  });
}



// goes through typedoc and extracts all properties of the first class in a file
function getProperties(doc) {
  var props = [];
  var _module = doc.children[0];
  var _class = _module.children[0];
  _class.children.forEach(c => {
    if (c.kindString === "Property") {
      props.push(c.name);
    }
  })
  return props;
}
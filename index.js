require('aurelia-polyfills');
var gulp = require('gulp');
var typedoc = require('gulp-typedoc');
var through = require('through2');
var fs = require('fs');
var binding = require('aurelia-binding');
var jsdom = require('jsdom');


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
    return extractExpressions(window);
  })
  .then(function (expressions) {
    console.log(expressions);
  })
  // var expression = getExpression(elem);
})


function extractExpressions(window) {
  return new Promise(function (resolve) {
    console.log(_extractExpression(window.document));
    resolve(['abcd']);
  });
}

function _extractExpression(elem, expressions) {
  if (!expressions) expressions = [];

  if(elem.childNodes.length > 0) {
    for(var i = 0; i < elem.childNodes.length; i++) {
      _extractExpression(elem.childNodes[i], expressions);
    }
  }

  // getExpression()
}

function getHTML(file) {
  return getFileContent(file)
  .then(data => {
    return parseHTML(data);
  })
}

function parseHTML(htmlStr) {
  return new Promise(function (resolve) {
    jsdom.env(htmlStr, function (err, window) {
      resolve(window);
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

function getExpression() {
  var expr = "username";

  var parser = new binding.ParserImplementation(new binding.Lexer(), expr)

  var expression = parser.parseExpression();

  console.log(expression);
}




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
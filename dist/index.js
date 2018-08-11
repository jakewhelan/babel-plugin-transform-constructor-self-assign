"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var _require = require('@babel/helper-plugin-utils'),
    declare = _require.declare;

var _require2 = require('@babel/core'),
    t = _require2.types;

var _default = declare(function (api) {
  api.assertVersion(7);
  return {
    visitor: {
      Class: function Class(path) {
        var body = path.get('body');

        var constructor = function () {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = body.get('body')[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var _path = _step.value;

              if (_path.isClassMethod({
                kind: 'constructor'
              })) {
                return _path;
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }();

        if (!constructor) return;

        var bindings = _toConsumableArray(Object.keys(constructor.scope.bindings));

        var assignmentExpressionStatements = bindings.map(function (binding) {
          var self = t.identifier('this');
          var name = t.identifier(binding);
          var thisDotBindingName = t.memberExpression(self, name);
          var bindingName = t.identifier(binding);
          var assignmentExpression = t.assignmentExpression('=', thisDotBindingName, bindingName);
          return t.expressionStatement(assignmentExpression);
        });
        constructor.node.body.body = _toConsumableArray(assignmentExpressionStatements).concat(_toConsumableArray(constructor.node.body.body));
      }
    }
  };
});

exports.default = _default;

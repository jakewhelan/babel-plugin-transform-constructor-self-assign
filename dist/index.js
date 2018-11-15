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

var isAssignmentExpressionDuplicate = function isAssignmentExpressionDuplicate(body, assignmentExpression) {
  var masterObjectType = 'ThisExpression';
  var masterType = assignmentExpression.type,
      masterOperator = assignmentExpression.operator,
      masterPropertyName = assignmentExpression.left.property.name,
      masterRightName = assignmentExpression.right.name;
  var match = body.filter(function (_ref) {
    var type = _ref.type,
        expression = _ref.expression;
    return type === 'ExpressionStatement' && expression.type === 'AssignmentExpression';
  }).map(function (_ref2) {
    var expression = _ref2.expression;
    return expression;
  }).find(function (expression) {
    var _expression$type = expression.type,
        type = _expression$type === void 0 ? null : _expression$type,
        _expression$operator = expression.operator,
        operator = _expression$operator === void 0 ? null : _expression$operator,
        _expression$left = expression.left;
    _expression$left = _expression$left === void 0 ? {} : _expression$left;
    var _expression$left$obje = _expression$left.object;
    _expression$left$obje = _expression$left$obje === void 0 ? {} : _expression$left$obje;
    var _expression$left$obje2 = _expression$left$obje.type,
        objectType = _expression$left$obje2 === void 0 ? null : _expression$left$obje2,
        _expression$left$prop = _expression$left.property;
    _expression$left$prop = _expression$left$prop === void 0 ? {} : _expression$left$prop;
    var _expression$left$prop2 = _expression$left$prop.name,
        propertyName = _expression$left$prop2 === void 0 ? null : _expression$left$prop2,
        _expression$right = expression.right;
    _expression$right = _expression$right === void 0 ? {} : _expression$right;
    var _expression$right$nam = _expression$right.name,
        rightName = _expression$right$nam === void 0 ? null : _expression$right$nam;
    if (masterType !== type) return false;
    if (masterOperator !== operator) return false;
    if (masterObjectType !== objectType) return false;
    if (masterPropertyName !== propertyName) return false;
    if (masterRightName !== rightName) return false;
    console.log(masterType, masterOperator, masterObjectType, masterPropertyName, masterRightName);
    console.log(type, operator, objectType, propertyName, rightName);
    console.log('hey, thats pretty good');
    return true;
  });
  var isMatch = Boolean(match);
  return isMatch;
};

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
        console.log(constructor.scope.block.params);
        var params = constructor.scope.block.params.map(function (param) {
          return param.name;
        });
        console.log(params);
        var assignmentExpressionStatements = params.map(function (binding) {
          var self = t.identifier('this');
          var name = t.identifier(binding);
          var thisDotBindingName = t.memberExpression(self, name);
          var bindingName = t.identifier(binding);
          var assignmentExpression = t.assignmentExpression('=', thisDotBindingName, bindingName);
          var isDuplicate = isAssignmentExpressionDuplicate(constructor.node.body.body, assignmentExpression);
          if (!isDuplicate) return t.expressionStatement(assignmentExpression);
        });
        constructor.node.body.body = _toConsumableArray(assignmentExpressionStatements).concat(_toConsumableArray(constructor.node.body.body));
      }
    }
  };
});

exports.default = _default;

const { declare } = require('@babel/helper-plugin-utils');
const { types: t } = require('@babel/core');

/**
 * Determines if the constructor body already has a matching AssignmentExpression
 * statement
 * @method isAssignmentExpressionDuplicate
 * @param {Object[]} body constructor.node.body.body - constructor body
 * @param {BabelAssignmentExpression} assignmentExpression newly created assignmentExpression
 */
const isAssignmentExpressionDuplicate = (body = null, assignmentExpression = null) => {
  if (!body || !body.length || !assignmentExpression) return false;

  const masterObjectType = 'ThisExpression';
  const {
    type: masterType,
    operator: masterOperator,
    left: {
      property: { name: masterPropertyName }
    },
    right: { name: masterRightName }
  } = assignmentExpression;

  const match = body
    .filter(({ 
      type = null, 
      expression = { 
        type = null 
      } = {} 
    } = {}) => type === 'ExpressionStatement' && expression.type === 'AssignmentExpression')
    .map(({ expression }) => expression)
    .find(expression => {
      const {
        type = null,
        operator = null,
        left: {
          object: { type: objectType = null } = {},
          property: { name: propertyName = null } = {}
        } = {},
        right: { name: rightName = null } = {}
      } = expression;

      if (masterType !== type) return false;
      if (masterOperator !== operator) return false;
      if (masterObjectType !== objectType) return false;
      if (masterPropertyName !== propertyName) return false;
      if (masterRightName !== rightName) return false;

      return true
    })

    const isMatch = Boolean(match);

  return isMatch;
}

/**
 * Returns provided array, sans the provided index
 * @method getArrayWithoutIndex
 * @param {Object[]} array array to remove index from
 * @param {Number} index index to remove from array
 */
const getArrayWithoutIndex = (array, index = null) => {
  if (!Number.isInteger(index) || !array) throw new Error('Error: getArrayWithoutIndex must be called with all arguments present.')
  return array
    .slice(0, index)
    .concat(array.slice(index === array.length ? index : index + 1, array.length))
}

export default declare(api => {
  api.assertVersion(7);
  
  return {
    visitor: {
      Class (path) {
        const body = path.get('body')
        const constructor = (() => {
          for (const path of body.get('body')) {
            if (path.isClassMethod({ kind: 'constructor' })) {
              return path;
            }
          }
        })();

        if (!constructor) return

        const params = constructor.scope.block.params
          .map(({ name }) => name)

        const assignmentExpressionStatements = params.map(binding => {
          const self = t.identifier('this')
          const name = t.identifier(binding);
          const thisDotBindingName = t.memberExpression(self, name)
          const bindingName = t.identifier(binding)
          const assignmentExpression = t.assignmentExpression('=', thisDotBindingName, bindingName)

          const isDuplicate = isAssignmentExpressionDuplicate(constructor.node.body.body, assignmentExpression)
          if (!isDuplicate) return t.expressionStatement(assignmentExpression)
        });

        const superIndex = constructor.node.body.body
          .filter(node => node && node.type === 'ExpressionStatement' && node.expression && node.expression.type === 'CallExpression')
          .findIndex(({ expression: { callee: { type = null } = {} } = {} } = {}) => type === 'Super');

        const isSuperPresent = superIndex !== -1;

        const superCallExpression = isSuperPresent
          ? [constructor.node.body.body[superIndex]]
          : []

        const constructorBodyWithoutSuper = isSuperPresent
          ? getArrayWithoutIndex(constructor.node.body.body, superIndex)
          : constructor.node.body.body

        constructor.node.body.body = [
          ...superCallExpression,
          ...assignmentExpressionStatements,
          ...constructorBodyWithoutSuper
        ]
      }
    }
  }
})

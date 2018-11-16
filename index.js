const { declare } = require('@babel/helper-plugin-utils');
const { types: t } = require('@babel/core');

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

        constructor.node.body.body = [
          ...assignmentExpressionStatements,
          ...constructor.node.body.body
        ]
      }
    }
  }
})

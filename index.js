const { declare } = require('@babel/helper-plugin-utils');
const { types: t } = require('@babel/core');

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

        const bindings = [
          ...Object.keys(constructor.scope.bindings)
        ]

        const assignmentExpressionStatements = bindings.map(binding => {
          const self = t.identifier('this')
          const name = t.identifier(binding);
          const thisDotBindingName = t.memberExpression(self, name)
          const bindingName = t.identifier(binding)
          const assignmentExpression = t.assignmentExpression('=', thisDotBindingName, bindingName)
          return t.expressionStatement(assignmentExpression)
        });

        constructor.node.body.body = [
          ...assignmentExpressionStatements,
          ...constructor.node.body.body
        ]
      }
    }
  }
})

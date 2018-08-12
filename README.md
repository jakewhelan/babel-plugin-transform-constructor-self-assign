# @jakewhelan/babel-plugin-transform-constructor-self-assign

Babel plugin to automagically assign ES2015 class constructor arguments to `this`, as seen in Typescript

## Usage

```
$ npm i -D @jakewhelan/babel-plugin-transform-constructor-self-assign
```
```js
// babelrc.js

module.exports = {
  plugins: [
    require('@jakewhelan/babel-plugin-transform-constructor-self-assign')
  ]
}
```

## Example

Before:
```js
class Sample {
  constructor(a, $scope, bigLongName, SomeOtherWIerDCrAp) {
  }
}
```

After:
```js
class Sample {
  constructor(a, $scope, bigLongName, SomeOtherWIerDCrAp) {
    this.a = a;
    this.$scope = $scope;
    this.bigLongName = bigLongName;
    this.SomeOtherWIerDCrAp = SomeOtherWIerDCrAp;
  }
}
```

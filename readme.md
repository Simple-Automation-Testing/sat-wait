# SAT WAITING LIBRARY

![npm downloads](https://img.shields.io/npm/dm/sat-wait.svg?style=flat-square)

## Content

- [waitForCondition](#waitforcondition)

## waitForCondition

```js
	const {waitForCondition} = require('sat-utils')

	waitForCondition.setDefaultOpts({
  	timeout: 2500, // default waiting time is 2500 ms
  	interval: 250,	// default re-check condition interval time is 250 ms
  	message: 'Failed',	// default error message is "Failed"
  	waiterError: TypeError,	// default error is TypeError
	});

	test()
	async function test() {
  	await waitForCondition(async () => {
  		const result = await someAsyncLogic()
  		return result;
  	})
	}

	test1()
	async function test1() {
  await waitForCondition(async () => {
  	const result = await someAsyncLogic()
  	return result;
  }, {
  	analyseResult: (result) => result.status === 200;
  	timeout: 25000,
  	interval: 250,
  	message: (time) => throw new Error(`My custom error throw function with time ${time}`)
  })
	}
```

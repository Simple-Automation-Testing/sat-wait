/* eslint-disable sonarjs/cognitive-complexity */
import { isObject, getType, isNumber, isString, isFunction, isAsyncFunction } from 'sat-utils';

/**
 * Asynchronously sleeps for the specified number of milliseconds.
 *
 * @param {number} [millisecond=5000] - The number of milliseconds to sleep. Defaults to 5 seconds (5000 milliseconds).
 * @returns {Promise<void>} A Promise that resolves after the specified sleep duration.
 */
async function sleep(millisecond = 5 * 1000) {
  return new Promise(resolve => setTimeout(resolve, millisecond));
}

export type IWaiterOpts = {
  timeout?: number;
  interval?: number;
  dontThrow?: boolean;
  falseIfError?: boolean;
  stopIfNoError?: boolean;

  message?: string | ((timeout: number, callbackError?: any) => Promise<string> | string);
  waiterError?: new (...args: any[]) => any;
  analyseResult?: (...args: any[]) => boolean | Promise<boolean>;
  before?: () => Promise<void> | any;
  after?: () => Promise<void> | any;
  callEveryCycle?: (callCycleCounter: number, executionTime: number, err?: any) => Promise<void> | any;
};

const defaultOptions = {};

/**
 * @example
 * const {waitFor} = require('sat-utils');
 *
 * waitResult();
 * async function waitResult() {
 *  await waitFor(async () => new Promise(res => setTimeout(res, 2500)), {
 *    timeout: 5000,
 *    interval: 500
 *  })
 * }
 *
 * @param {Function} callback
 * @param {!Object} options execution options
 * @param {number} [options.timeout] execution time
 * @param {number} [options.interval] call interval
 * @param {boolean} [options.dontThrow] if during waiting cylce result was not achived - last call back execution result will be returned as a waiting cycle result
 * @param {boolean} [options.falseIfError] if call back throws an error - counted as negative result
 * @param {boolean} [options.stopIfNoError] if callback did not throw error - counted as successful result
 * @param {Error|new (...args: any[]) => any} [options.waiterError] error which will be thrown if result will not achieved
 * @param {Function} [options.analyseResult] custom analyser of the call back result
 * @param {Function} [options.before] call before waiting cycle
 * @param {Function} [options.after] call after waiting cycle, even if result was not achived, if result achived - also will be executed
 * @param {Function} [options.callEveryCycle] call every time after main call back execution if result was not achived
 * @returns {any} any result that call back will return
 */
async function waitFor<Tresult = any>(
  callback: (callCycleCounter?: number) => any,
  options: IWaiterOpts = {},
): Promise<Tresult> {
  if (!isObject(options)) {
    throw new TypeError(`waitFor(): second argument should be an object, current arg is ${getType(options)}`);
  }

  let callCycleCounter = 1;
  let callbackError;
  const mergedOpts = { ...defaultOptions, ...options };
  const {
    message,
    timeout = 5000,
    interval = 250,
    dontThrow = false,
    analyseResult,
    falseIfError = true,
    stopIfNoError,
    waiterError = Error,
    callEveryCycle = () => {},
    before = () => {},
    after = () => {},
  } = mergedOpts;

  if (!isFunction(callback) && !isAsyncFunction(callback)) {
    throw new TypeError(
      `waitFor(): first argument should be a function, async function or arrow function current arg is ${getType(
        callback,
      )}`,
    );
  }

  if (!isNumber(interval)) {
    throw new TypeError(
      `waitFor(): second argument property "interval" should be a number, current arg is ${getType(interval)}`,
    );
  }

  if (!isNumber(interval)) {
    throw new TypeError(
      `waitFor(): second argument property "interval" should be a number, current arg is ${getType(interval)}`,
    );
  }

  if (!isNumber(timeout)) {
    throw new TypeError(
      `waitFor(): second argument property "timeout" should be a number, current arg is ${getType(timeout)}`,
    );
  }

  if (!isFunction(before) && !isAsyncFunction(before)) {
    throw new TypeError(
      `waitFor(): second argument property "before" should be a function, async function or arrow function, current arg is ${getType(
        before,
      )}`,
    );
  }

  if (!isFunction(after) && !isAsyncFunction(after)) {
    throw new TypeError(
      `waitFor(): second argument property "after" should be a function, async function or arrow function, current arg is ${getType(
        before,
      )}`,
    );
  }

  if (!isFunction(callEveryCycle) && !isAsyncFunction(callEveryCycle)) {
    throw new TypeError(
      `waitFor(): second argument property "callEveryCycle" should be a function, async function or arrow function, current arg is ${getType(
        callEveryCycle,
      )}`,
    );
  }

  if (analyseResult && !isFunction(analyseResult) && !isAsyncFunction(analyseResult)) {
    throw new TypeError(
      `waitFor(): second argument property "analyseResult" should be a function, async function or arrow function, current arg is ${getType(
        analyseResult,
      )}`,
    );
  }

  const start = Date.now();
  let result;

  await before();

  while (Date.now() - start < timeout) {
    callCycleCounter++;
    if (falseIfError) {
      try {
        result = await callback();

        if (stopIfNoError) return result;
      } catch (error) {
        callbackError = error;
        result = false;
      }
    } else {
      result = await callback(callCycleCounter);
    }

    if (analyseResult && (await analyseResult(result))) {
      await after();
      return result;
    }

    if (result) {
      await after();

      return result;
    }

    try {
      await callEveryCycle(callCycleCounter, Date.now() - start, callbackError);
    } catch (error) {
      callbackError = error;
    }

    await sleep(interval);
  }

  await after();

  if (dontThrow) {
    return result;
  }

  if (!result) {
    const callbackErrorMessagePart = callbackError || '';
    let errorMessage = `Required condition was not achieved during ${timeout} ms. ${callbackErrorMessagePart}`;

    if (isString(message)) {
      errorMessage = message as string;
    } else if (isFunction(message) || isAsyncFunction(message)) {
      errorMessage = await (message as (timeout: number, callbackError?: any) => Promise<string> | string)(
        timeout,
        callbackError,
      );
    }

    throw new waiterError(errorMessage);
  }
}

waitFor.setDefaultOpts = function (opts: IWaiterOpts) {
  Object.keys(defaultOptions).forEach(key => {
    delete defaultOptions[key];
  });
  Object.assign(defaultOptions, opts);
};

export { waitFor, sleep };

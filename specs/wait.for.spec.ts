/* eslint-disable unicorn/consistent-function-scoping */
import { deepStrictEqual } from 'assert';
import { waitFor } from '../lib';

describe('SPEC', function () {
  const noop = () => true;

  it('[P] waitFor falseIfError', async function () {
    const throwFunction = () => {
      throw new Error('TEST');
    };

    const result = await waitFor(throwFunction, { dontThrow: true, timeout: 1500, interval: 50 });

    deepStrictEqual(result, false);
  });

  it('[N] waitFor falseIfError', async function () {
    const throwError = new Error('TEST');
    const throwFunction = () => {
      throw throwError;
    };

    try {
      await waitFor(throwFunction, { falseIfError: false, timeout: 1500, interval: 50 });
    } catch (error) {
      deepStrictEqual(throwError, error);
    }
  });

  it('[P] waitFor before/after', async function () {
    let callBefore = 0;
    let callAfter = 0;

    const before = () => (callBefore += 1);
    const after = () => (callAfter += 1);

    await waitFor(noop, { before, after });

    deepStrictEqual(callAfter, 1);
    deepStrictEqual(callBefore, 1);
  });

  it('[N] waitFor before/after', async function () {
    let callBefore = 0;
    let callAfter = 0;

    const before = () => (callBefore += 1);
    const after = () => (callAfter += 1);

    await waitFor(
      () => {
        throw new Error('!');
      },
      { before, after, dontThrow: true, timeout: 250, interval: 100 },
    );

    deepStrictEqual(callAfter, 1);
    deepStrictEqual(callBefore, 1);
  });

  it('[P] waitFor falseIfError', async function () {
    const throwFunction = () => {
      throw new Error('TEST');
    };

    const result = await waitFor(throwFunction, { dontThrow: true, timeout: 1500, interval: 50 });

    deepStrictEqual(result, false);
  });

  it('[P] waitFor stopIfNoError', async function () {
    const returnFalse = () => Promise.resolve(false);
    const result = await waitFor(returnFalse, { stopIfNoError: true });

    deepStrictEqual(result, false);
  });

  it('[N] waitFor stopIfNoError', async function () {
    const returnFalse = async () => {
      throw new Error('AAAA');
    };
    const result = await waitFor(returnFalse, { stopIfNoError: true, dontThrow: true });

    deepStrictEqual(result, false);
  });

  it('[N] waitFor falseIfError', async function () {
    const throwError = new Error('TEST');
    const throwFunction = () => {
      throw throwError;
    };

    try {
      await waitFor(throwFunction, { falseIfError: false, timeout: 1500, interval: 50 });
    } catch (error) {
      deepStrictEqual(throwError, error);
    }
  });
});

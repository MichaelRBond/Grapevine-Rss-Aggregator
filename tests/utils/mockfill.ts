import * as assert from "assert";

/**
 * Creates a mock based on the provided instance and options.
 *
 * @param instance {any} - The instance to mock. Any properties or methods on the provided instance
 *                         will also be available on the mock. If not provided an empty object will be mocked.
 * @param options {MockOptions} - Options used when building the mock. See {MockOptions} for more details.
 *                                If not provided, default options will be used.
 * @returns {any} - A mock instance.
 */
export function mock<T>(instance: any = {}, options: MockOptions = defaultOptions): Mock<T> {
  const handler = new CountingProxyHandler(options);
  const proxy = new Proxy(instance, handler);
  proxy.captures = (property: string): any[][] => {
    return !handler.captures.has(property) ? [] : handler.captures.get(property);
  };
  return proxy;
}

export function verify(fn: Fn) {
  return new Verification(fn);
}

export type Mock<T> = T;

type Fn = (...args: any[]) => any;

export function whatever() {
  return "Peishohs3xaezi2zaicu";
}

class Verification {
  private getInvocations: () => any[][];

  constructor(fn: Fn) {
    const proxy = fn as ProxyMethod;
    this.getInvocations = proxy.getInvocations;
  }

  public calledWith(...args: any[]): void {
    const matches = this.getInvocations().filter((invocationArgs: any[]) => {
      return invocationArgs.every((val, i) => {
        return args.length > i && (args[i] === val || args[i] === whatever);
      });
    });
    const msg = `No invocations matched: ${args}.  Invocations found are: ${this.getInvocations()}`;
    assert.equal(matches.length > 0, true, msg);
  }

  public inspectCall(num: number, compare: (...args: any[]) => void): void {
    const invokes = this.getInvocations();
    if (invokes.length < num) {
      throw new Error(`Invocation ${num} not available. ${invokes.length} invocations were found`);
    }
    compare(...invokes[num]);
  }

  public inspectCalls(compare: (...args: any[]) => void): void {
    const invokes = this.getInvocations();
    if (!invokes || invokes.length === 0) {
      throw new Error("No invocations to inspect");
    }
    invokes.forEach((i) => compare(...i));
  }

  public calledWithArgsLike(compare: (...args: any[]) => boolean): void {
    const matches = this.getInvocations().filter(compare);
    const msg = `No invocations matched provided comparison function.  Invocations found are: ${this.getInvocations()}`;
    assert.equal(matches.length > 0, true, msg);
  }

  public calledNTimesWithArgsLike(count: number, compare: (...args: any[]) => boolean): void {
    const matches = this.getInvocations().filter((i) => {
      return compare(...i);
    });
    assert.equal(matches.length, count, `${matches.length} invocations matched provided comparison function.  ` +
      `Invocations found are: ${this.getInvocations()}`);
  }

  public calledWithInvocation(invocationNum: number, ...args: any[]): void {
    const invocation = this.getInvocations()[invocationNum];
    assert.equal(invocation, args);
  }

  public notCalled(): void {
    assert.equal(this.getInvocations().length, 0, "Expected method to not be called");
  }

  public calledOnce(): void {
    assert.equal(this.getInvocations().length, 1, "Expected method to be called exactly once");
  }

  public called(count: number): void {
    const msg = `Expected method to be called ${count} times. Was called ${this.getInvocations().length} times`;
    assert.equal(this.getInvocations().length, count, msg);
  }
}
/**
 * Options used when creating a mock.
 */
export interface MockOptions {

  /**
   * The value to return when a property does not exist on an instance.
   */
  defaultValue: any;
}

const defaultOptions = {
  defaultValue: (): number => void 0,
};

interface ProxyMethod {
  (...args: any[]): any;
  getInvocations(): any[][];
}

class CountingProxyHandler<T extends object> implements ProxyHandler<T> {
  public captures = new Map<string, any[][]>();

  constructor(private options: MockOptions) { }

  public get(target: any, property: string) {
    if (!this.captures.has(property)) {
      this.captures.set(property, []);
    }

    // When using await, the runtime appears to inspect objects to see if they're "Promise-like" in an attempt to
    // unfurl all the promises. Since the default value the proxy returns is a function, the proxy will be treated like
    // a promise and attempt to be unfurled. We need to convince the runtime the proxy isn't a promise and return a
    // non-function for "then".
    if (property === "then" && this.options.defaultValue instanceof Function) {
      return {};
    }

    const propValue = (property in target) ? target[property] : this.options.defaultValue;
    if (!(propValue instanceof Function)) {
      return propValue;
    }

    const captures = this.captures;
    const proxy = function(...args: any[]) { // tslint:disable-line only-arrow-functions
      captures.get(property).push(args);
      return propValue(...args);
    } as ProxyMethod;
    proxy.getInvocations = () => captures.get(property);
    return proxy;
  }
}

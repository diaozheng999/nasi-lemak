/**
 * RuntimeUtilities.ts
 * @author Diao Zheng
 * @file Utilities to be able to include partial test scripts at runtime.
 * @barrel ignore
 *
 * This can't really be automatically tested by jest.
 * @ignore_test
 */

import { ReactElement } from "react";
import { ReactTestRenderer, TestRendererOptions } from "react-test-renderer";

/**
 * Provides a type-safe wrapper around creating a React renderer instance.
 *
 * This is due to the introduction of `renderer.act()` calls that is needed to
 * simulate the stateful effects that happens between render calls that React
 * does. This wraps the following function:
 *
 * ```
 * let tree: ReactTestRenderer;
 * act(() => {
 *   tree = create(<View />);
 * });
 * ```
 *
 * The function has the following assumptions:
 * 1. The `renderer.act` calls are guaranteed to be executed synchronously.
 * 2. Any module shenanigans were not performed, i.e. by `jest.resetModules` or
 *    `jest.isolateModules`. This is due to internally we use the `require`
 *    function provided by node to get the renderer module, and this module
 *    should be the same renderer module as that which exists in the test file
 *    if module registry hasn't been tempered with. If the module registry has
 *    been tempered with, use the third parameter to pass in the actual module
 *    to render with. We need to do this because we don't want to include the
 *    `react-test-renderer` module at runtime.
 *
 * This function is useful when used with hooks since `useEffect` will not
 * execute unless the update is wrapped in an `act()` call.
 *
 * See https://reactjs.org/docs/test-utils.html#act
 *
 * @param element The first argument to `renderer.create`
 * @param options The second argument to `renderer.create`
 * @param renderWithModule If truthy, this is assumed to be the module that
 * `react-test-renderer` is. This is exposed as an escape hatch should functions
 * that alter the module registry (such as `jest.resetModules` or
 * `jest.isolateModules`) are being used.
 */
export function createRenderer(
  element: ReactElement,
  options?: TestRendererOptions,
  renderWithModule?: any,
): ReactTestRenderer {
  const renderer = renderWithModule || require("react-test-renderer");
  let tree: ReactTestRenderer = null as any;
  renderer.act(() => {
    tree = renderer.create(element, options);
  });
  return tree;
}

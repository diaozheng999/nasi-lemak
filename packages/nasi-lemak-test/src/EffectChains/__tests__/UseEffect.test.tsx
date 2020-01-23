/**
 * UseEffect.test.tsx
 * @author Diao Zheng
 * @file Testing UseEffect effect chains
 */

import { MockReact } from "../../MockReact";
import renderer from "react-test-renderer";

jest.doMock("react", MockReact);

import React, { useEffect } from "react";
import { RootEffectChain } from "../RootEffectChain";

function TestComponent(props: {}) {
  useEffect(() => {
    console.warn("hallo");
    return () => {
      console.warn("hallo2");
    }
  }, []);
  return React.createElement("TestRender", props);
}

test("hello", () => {

  const tree = renderer.create(<TestComponent />);

  console.warn(RootEffectChain.current.describe(""));
  RootEffectChain.current.execute();
  console.warn(RootEffectChain.current.describe(""));

  tree.unmount();
  console.warn(RootEffectChain.current.describe(""));
  RootEffectChain.current.execute();

});

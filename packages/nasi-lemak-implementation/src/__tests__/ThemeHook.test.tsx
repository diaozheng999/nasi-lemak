/**
 * Template.test.tsx
 * @author Diao Zheng
 * @file Test cases for useTemplate hook
 */

import React from "react";
import renderer from "react-test-renderer";
import * as Theme from "../DONOTUSEInternalTheme";
import * as RuntimeUtilities from "../RuntimeUtilities";


const useTemplate = Theme.useTemplate;

const Template = Theme.createTemplate("abracadabra", {
  key1: {
    borderWidth: 0,
  },
  key2: {
    borderWidth: 1,
  },
});

Template.register("DEFAULT", { key1: { borderWidth: 1 } });
Template.register("ELECTABUZZ", {
  key1: { borderWidth: 2 },
  key2: { borderWidth: 2 },
});

function TemplateTestComponent() {
  const styles = useTemplate(Template);
  return React.createElement("TemplateTestComponent", styles);
}

test("default", () => {

  const tree = RuntimeUtilities.createRenderer(
    <Theme.Context.Provider value={Theme.registeredTheme("DEFAULT")}>
      <TemplateTestComponent />
    </Theme.Context.Provider>,
  );

  const element = tree.root.findByType("TemplateTestComponent" as any);
  expect(element.props).toStrictEqual({
    key1: { borderWidth: 1 },
    key2: { borderWidth: 1 },
  });
});

test("electabuzz", () => {

  const tree = RuntimeUtilities.createRenderer(
    <Theme.Context.Provider value={Theme.registeredTheme("ELECTABUZZ")}>
      <TemplateTestComponent />
    </Theme.Context.Provider>,
  );

  const element = tree.root.findByType("TemplateTestComponent" as any);
  expect(element.props).toStrictEqual({
    key1: { borderWidth: 2 },
    key2: { borderWidth: 2 },
  });
});

test("default -> electabuzz", () => {

  const tree = RuntimeUtilities.createRenderer(
    <Theme.Context.Provider value={Theme.registeredTheme("DEFAULT")}>
      <TemplateTestComponent />
    </Theme.Context.Provider>,
  );
  const element = tree.root.findByType("TemplateTestComponent" as any);
  expect(element.props).toStrictEqual({
    key1: { borderWidth: 1 },
    key2: { borderWidth: 1 },
  });

  renderer.act(() => {
    tree.update(
      <Theme.Context.Provider value={Theme.registeredTheme("ELECTABUZZ")}>
        <TemplateTestComponent />
      </Theme.Context.Provider>,
    );
  });

  expect(element.props).toStrictEqual({
    key1: { borderWidth: 2 },
    key2: { borderWidth: 2 },
  });
});

test("electabuzz -> default", () => {

  const tree = RuntimeUtilities.createRenderer(
    <Theme.Context.Provider value={Theme.registeredTheme("ELECTABUZZ")}>
      <TemplateTestComponent />
    </Theme.Context.Provider>,
  );
  const element = tree.root.findByType("TemplateTestComponent" as any);
  expect(element.props).toStrictEqual({
    key1: { borderWidth: 2 },
    key2: { borderWidth: 2 },
  });

  renderer.act(() => {
    tree.update(
      <Theme.Context.Provider value={Theme.registeredTheme("DEFAULT")}>
        <TemplateTestComponent />
      </Theme.Context.Provider>,
    );
  });

  expect(element.props).toStrictEqual({
    key1: { borderWidth: 1 },
    key2: { borderWidth: 1 },
  });
});

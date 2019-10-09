/**
 * Component.test.ts
 * @author Diao Zheng
 * @file Test cases for Component.ts
 */

import React from "react";
import renderer from "react-test-renderer";
import { Intent } from "..";

jest.useFakeTimers();

interface IProp {
  resolver(): () => void;
}

interface IState {
  key: string;
}

import { Component } from "../Component";

function View(props: any) {
  const { children, ...otherProps } = props;
  return React.createElement("RCTView", otherProps, children);
}

let promiseResolver: () => void = () => { return; };

const getPromiseResolver = () => promiseResolver;

class TestComponent extends Component<
  IProp, IState, Intent.Type<IState>,  Intent.Type<IState>
> {
  public mockRender = jest.fn();
  public awaiter: Promise<{}> = Promise.reject();

  constructor(props: IProp) {
    super(props);
    this.state = {
      key: "initial value",
    };
  }

  public render() {
    this.mockRender();
    return <View />;
  }

  public componentDidUpdate() {
    this.props.resolver()();
  }

  protected reducer(
    _: IState,
    action: Intent.Type<IState>,
  ): Intent.Type<IState> {

    return action;
  }
}

it("component noupdate", async () => {
  const ref = React.createRef<TestComponent>();
  renderer.create(<TestComponent ref={ref} resolver={getPromiseResolver} />);

  if (ref.current) {
    ref.current.mockRender.mockReset();
    ref.current.sendAction(Intent.NoUpdate());
    expect(ref.current.mockRender).not.toBeCalled();
  } else {
    expect(false).toBe(true);
  }

});

it("component update", async () => {
  const update = {key: "1"};

  const ref = React.createRef<TestComponent>();
  renderer.create(<TestComponent ref={ref} resolver={getPromiseResolver} />);

  if (ref.current) {
    const awaiter = new Promise((res, _) => promiseResolver = res);
    ref.current.mockRender.mockReset();
    ref.current.sendAction(Intent.Update(update));
    expect(ref.current.mockRender).toBeCalled();
    await awaiter;
    expect(ref.current.state.key).toBe("1");
  } else {
    expect(false).toBe(true);
  }

});

it("component side effect", async () => {
  const effect = jest.fn();

  const ref = React.createRef<TestComponent>();
  renderer.create(<TestComponent ref={ref} resolver={getPromiseResolver} />);

  if (ref.current) {
    ref.current.mockRender.mockReset();
    ref.current.sendAction(Intent.SideEffects(effect));
    jest.runAllTicks();
    expect(ref.current.mockRender).not.toBeCalled();
    expect(effect).toBeCalled();
  } else {
    expect(false).toBe(true);
  }

});

it("component update with side effect", async () => {
  const update = {key: "1"};
  const effect = jest.fn();

  const ref = React.createRef<TestComponent>();
  renderer.create(<TestComponent ref={ref} resolver={getPromiseResolver} />);

  if (ref.current) {
    const awaiter = new Promise((res, _) => promiseResolver = res);
    ref.current.mockRender.mockReset();
    ref.current.sendAction(Intent.UpdateWithSideEffects(update, effect));
    jest.runAllTicks();
    expect(ref.current.mockRender).toBeCalled();
    await awaiter;
    expect(ref.current.state.key).toBe("1");
    expect(effect).toBeCalled();
  } else {
    expect(false).toBe(true);
  }
});

test("component disable set state", () => {
  const ref = React.createRef<TestComponent>();
  renderer.create(<TestComponent ref={ref} resolver={getPromiseResolver} />);
  expect(() => {
    if (ref.current) {
      ref.current.setState({key: "1"});
    }
  }).toThrowError();
});

test("component action after did mount", () => {
  const ref = React.createRef<TestComponent>();
  renderer.create(<TestComponent ref={ref} resolver={getPromiseResolver} />);
  if (ref.current) {
    ref.current.componentWillUnmount();
    ref.current.sendAction(Intent.Update({key: "1"}));
    expect(ref.current.state.key).toBe("initial value");
  } else {
    expect(false).toBe(true);
  }
});

it("component side effect after did mount", async () => {
  const ref = React.createRef<TestComponent>();
  const effect = jest.fn();
  renderer.create(<TestComponent ref={ref} resolver={getPromiseResolver} />);

  if (ref.current) {
    ref.current.mockRender.mockReset();
    ref.current.componentWillUnmount();
    ref.current.sendAction(Intent.SideEffects(effect));
    jest.runAllTicks();
    expect(ref.current.mockRender).not.toBeCalled();
  } else {
    expect(false).toBe(true);
  }
});

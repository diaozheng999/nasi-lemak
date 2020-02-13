/**
 * PersistentCache.test.ts
 * @author Diao Zheng
 * @file Test cases for persistent cache
 */

import { Option, Semaphore, Types } from "nasi-lemak";
// FIXME: import from nasi-lemak-test when released
import { MockDate } from "../Mocks";
import { PersistentCache } from "../PersistentCache";

/////////////////////////////////////////////////////////
// __          __     _____  _   _ _____ _   _  _____  //
// \ \        / /\   |  __ \| \ | |_   _| \ | |/ ____| //
//  \ \  /\  / /  \  | |__) |  \| | | | |  \| | |  __  //
//   \ \/  \/ / /\ \ |  _  /| . ` | | | | . ` | | |_ | //
//    \  /\  / ____ \| | \ \| |\  |_| |_| |\  | |__| | //
//     \/  \/_/    \_\_|  \_\_| \_|_____|_| \_|\_____| //
//                                                     //
/////////////////////////////////////////////////////////
//                                                     //
// This test case assumes persistence and utilises the //
// synchronous nature regarding how jest runs test     //
// cases. Focusing (.only) or skipping some tests may  //
// cause the tests to fail.                            //
//                                                     //
/////////////////////////////////////////////////////////

jest.mock("@react-native-community/async-storage");
MockDate.useMockDate();
MockDate.advanceJestTimers = false;

PersistentCache.useActualImplementationAtTestTime = true;

let generatedHash: any;

test("simple check", async () => {
  const pcache = new PersistentCache();
  await pcache.set("hallo", "world");
  const result = Option.assertSome(await pcache.get<string>("hallo"));
  expect(result.value).toBe("world");
  generatedHash = result.hash;
});

test("get persistence", async () => {
  const pcache = new PersistentCache();
  await pcache.getInitialisationAwaiter();
  const result = Option.assertSome(await pcache.get<string>("hallo"));
  expect(result.value).toBe("world");
  expect(result.hash).toStrictEqual(generatedHash);
});

test("get/set mutex", async () => {
  const pcache = new PersistentCache();
  await pcache.getInitialisationAwaiter();

  const setter = pcache.set("hullo", "werld");
  const getter = pcache.get<string>("hallo");

  const result1 = await Promise.all<
    Types.Awaited<typeof getter>,
    Types.Awaited<typeof setter>
  >([ getter, setter ]);
  const result2 = await pcache.get<string>("hullo");

  expect(Option.assertSome(result1[0]).value).toBe("world");
  expect(Option.assertSome(result2).value).toBe("werld");
});

test("random test to check for race conditions", async () => {
  const pcache = new PersistentCache();
  await pcache.getInitialisationAwaiter();

  const result = await Promise.all([
    pcache.get("hallo"),
    pcache.get("hullo"),
  ]);
  expect(Option.assertSome(result[0]).value).toBe("world");
  expect(Option.assertSome(result[1]).value).toBe("werld");

  const setters: Array<Promise<void>> = [];
  for (let i = 0; i < 1000; ++i) {
    setters.push((async () => {
      await Semaphore.sleep(Math.random() * 1000);
      await pcache.set(`concurrent_${i}`, i);
    })());
  }

  await Promise.all(setters);

  const getters: Array<Promise<any>> = [];
  for (let i = 0; i < 1000; ++i) {
    getters.push((async () => {
      await Semaphore.sleep(Math.random() * 1000);
      return pcache.get(`concurrent_${i}`);
    })());
  }
  const results = await Promise.all(getters);

  for (let i = 0; i < 1000; ++i) {
    expect(results[i]).not.toBeUndefined();
    expect(results[i].value).toBe(i);
  }
});

describe("expiry handling", () => {
  beforeEach(() => {
    MockDate.reset();
  });

  test("add key with expiry", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    await pcache.set("shouldExpire", "value", MockDate.now() + 1000);
    const result: any = await pcache.get("shouldExpire");
    expect(result.value).toBe("value");
  });

  test("reinitialise", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    const result: any = await pcache.get("shouldExpire");
    expect(result.value).toBe("value");
    MockDate.advanceTimeBy(2000);
    const result2 = await pcache.get("shouldExpire");
    expect(result2).toBeUndefined();
    MockDate.reset();
    await pcache.set("shouldExpire", "value", MockDate.now() + 1000);
  });

  test("reinitialise after some time", async () => {
    MockDate.advanceTimeBy(2000);
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    const result = await pcache.get("shouldExpire");
    expect(result).toBeUndefined();
  });

  test("query after expiry", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    await pcache.set("shouldExpire", "value", MockDate.now() + 1000);
    MockDate.advanceTimeBy(2000);
    const result = await pcache.get("shouldExpire");
    expect(result).toBeUndefined();
  });

  test("set immediately expired cache", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    await pcache.set("shouldExpire", "value", -2208988800000); // 0 AD
    const result = await pcache.get("shouldExpire");
    expect(result).toBeUndefined();
  });

  test("set expiring cache", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    const setter = pcache.set("shouldExpire", "value", MockDate.now() + 1000);
    // Dr. Emmett Brown: [running out of the room] 1.21 gigawatts!
    MockDate.advanceTimeBy(88888888);
    await setter;
    const result = await pcache.get("shouldExpire");
    expect(result).toBeUndefined();
  });

  test("updating existing key", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    await pcache.set("shouldExpire", "value", MockDate.now() + 1000);
    MockDate.advanceTimeBy(500);
    await pcache.set("shouldExpire", "value", MockDate.now() + 1000);
    const result = Option.assertSome(await pcache.get("shouldExpire"));
    expect(result.value).toBe("value");
  });

  test("updating expiring to permanent", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    await pcache.set("shouldExpire", "value", MockDate.now() + 1000);
    MockDate.advanceTimeBy(500);
    await pcache.set("shouldExpire", "value");
    // Dr. Emmett Brown: Marty! I need you to go back with me!
    // Marty McFly: Where?
    // Dr. Emmett Brown: Back to the Future!
    MockDate.advanceTimeBy(8888888888888);
    const result: any = await pcache.get("shouldExpire");
    expect(result.value).toBe("value");
  });
});

describe("hashes", () => {
  test("internal hash", async () => {
    const pcache = new PersistentCache();
    const result = Option.assertSome(
      await pcache.get<string>("shouldExpire"), // doesn't expire anymore
    );

    await pcache.set("shouldExpire", "value");

    const result2 = await pcache.getHash("shouldExpire");
    expect(result2).toBe(result.hash);
  });

  test("internal hash", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    await pcache.set("shouldExpire", "value", undefined, "hashbrown");

    const result = await pcache.getHash("shouldExpire");
    expect(result).toBe("hashbrown");

    const result2 = await pcache.getHash("huh?");
    expect(result2).toBeUndefined();
  });

  test("generated hash", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    const result = await pcache.getHash("hallo");
    expect(result).toBe(generatedHash);
  });
});

describe("custom serialisers and deserialisers", () => {
  const serialiser = jest.fn((obj: any) => {
    return JSON.stringify(["__serialised", obj]);
  });
  const deserialiser = jest.fn((s: string) => {
    const [token, obj] = JSON.parse(s);
    if (token === "__serialised") {
      return obj;
    }
    return;
  });

  beforeEach(() => {
    serialiser.mockClear();
    deserialiser.mockClear();
  });

  test("get unknown", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    const result = await pcache.get("hallo", deserialiser);
    expect(result).toBeUndefined();
    expect(deserialiser).toBeCalledTimes(1);
  });

  test("set something known", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    await pcache.set(
      "custom_serialiser",
      "value2",
      undefined,
      undefined,
      serialiser,
    );
    const result = Option.assertSome(
      await pcache.get("custom_serialiser", deserialiser),
    );
    expect(result.value).toBe("value2");
    expect(serialiser).toBeCalledTimes(1);
    expect(serialiser).toBeCalledWith("value2");
    expect(deserialiser).toBeCalledTimes(1);
  });

  test("get something known", async () => {
    const pcache = new PersistentCache();
    await pcache.getInitialisationAwaiter();
    const result = Option.assertSome(
      await pcache.get("custom_serialiser", deserialiser),
    );
    expect(result.value).toBe("value2");
    expect(deserialiser).toBeCalledTimes(1);
  });
});

describe("setAsync", () => {

  test("never call key() before initialization is completed", () => {
    const pcache = new PersistentCache();
    const mockKey = jest.fn(() => `${pcache.hash("key")}`);
    pcache.setAsync(mockKey, "value");
    expect(mockKey).not.toBeCalled();
  });

  test("never set value before initialization is completed", async () => {
    const pcache = new PersistentCache();
    const mockKey = jest.fn(() => `${pcache.hash("key")}`);
    const result: any = await pcache.getAsync(mockKey);
    expect(result).toBeUndefined();
  });

  test("call key() after initialization is completed", async () => {
    const pcache = new PersistentCache();
    const mockKey = jest.fn(() => `${pcache.hash("key")}`);
    await pcache.setAsync(mockKey, "value");
    expect(mockKey).toBeCalledTimes(1);
  });

  test("set value after initialization is completed", async () => {
    const pcache = new PersistentCache();
    const mockKey = jest.fn(() => `${pcache.hash("key")}`);
    await pcache.setAsync(mockKey, "value");
    const result: any = await pcache.getAsync(mockKey);
    expect(result.value).toBe("value");
  });

});

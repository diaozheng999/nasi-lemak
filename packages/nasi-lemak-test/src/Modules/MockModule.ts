/**
 * MockModule.ts
 * @author Diao Zheng
 * @file creating a cached module mocker
 */

// @barrel ignore

export function MockModule<Module>(implementation: () => Module): () => Module {
  let memoised: Module | undefined;

  return () => {
    if (!memoised) {
      memoised = implementation();
    }
    return memoised;
  };

}

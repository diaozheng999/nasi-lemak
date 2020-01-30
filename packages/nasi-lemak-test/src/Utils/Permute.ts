/**
 * permute.ts
 * @author Diao Zheng
 * @file generate permutation from a list of permutations
 */

// @barrel export all
// @barrel export permute

class ExceptIterator<T> implements Iterable<T> {
  protected root: Iterable<T>;
  protected except: number;

  constructor(iterator: Iterable<T>, except: number) {
    this.root = iterator;
    this.except = except;
  }

  public [Symbol.iterator] = function*(this: ExceptIterator<T>) {

    const iterator: Iterable<T> = (
      this.root instanceof ExceptIterator ?
        new ExceptIterator(this.root.root, this.root.except)
      :
        this.root
    );

    let i = 0;

    for (const item of iterator) {
      if (i++ !== this.except) {
        yield item;
      }
    }
  };

}

export function *permute<T>(
  list: Iterable<T>,
): Iterable<T[]> {
  let i = 0;
  for (const item of list) {
    let yielded = false;
    for (const rest of permute(new ExceptIterator(list, i))) {
      yield [item, ...rest];
      if (!yielded) {
        yielded = true;
      }
    }
    if (!yielded) {
      yield [item];
    }
    ++i;
  }
}

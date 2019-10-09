/**
 * Observable.ts
 * @author Diao Zheng
 * @file A hook to subscribe to an RxJS observable
 * @barrel hook
 */

import { useEffect, useState } from "react";
import { Observable } from "rxjs";

export function useObservable<T>(
  source$: Observable<T>,
  initialValue: T | (() => T),
): [ T ] {
  const [ response, setResponse ] = useState(initialValue);
  useEffect(() => {
    const subscription = source$.subscribe({
      next: setResponse,
    });
    return () => {
      subscription.unsubscribe();
    };
  }, [ source$ ]);
  return [ response ];
}

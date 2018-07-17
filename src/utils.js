import watch from 'redux-watch';
import isEqual from 'is-equal';

export function createReducer(initialState, handlers) {
  return function reducer(state = initialState, action) {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    }
    return state;

  };
}

export function createWatcher(store, path, callback) {
  const watcher = watch(store.getState, path, isEqual);
  store.subscribe(watcher(callback));
}

export function shuffle(a) {
  let j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

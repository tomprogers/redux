/**
 * Creates a Mutatex store that holds the state tree.
 * The only way to change the data in the store is to call `mutate()` on it.
 *
 * There should only be a single store in your app.
 *
 * @param {any} [initialState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 *
 * @returns {Store} A Mutatex store that lets you read the state, mutate the store,
 * and subscribe to changes.
 */
export default function createStore(initialState) {
  var currentState = initialState
  var listeners = []

  /**
   * Reads the state tree managed by the store.
   *
   * @returns {any} The current state tree of your application.
   */
  function getState() {
    return currentState
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    listeners.push(listener)
    var isSubscribed = true

    return function unsubscribe() {
      if (!isSubscribed) {
        return
      }

      isSubscribed = false
      var index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }

  /**
   * Performs one or more mutations on the store. It is the only way to trigger
   * state changes.
   *
   * Each argument must be a reducer function, used to compute the whole new
   * state. Reducers are run in sequence, one after the other, synchronously.
   * The first reducer receives as its argument the whole current state, and
   * its return value becomes the next whole state. If a second reducer
   * function was provided, it receives as its argument the first reducer's
   * return value, and whatever its return value becomes the next whole state.
   * This repeats for every reducer provided to mutate. Subscribers are
   * notified only after the entire set of reducers has been executed,
   * yielding the final state for the current action.
   *
   * @param {Function} reducer A synchronous function that computes the next
   * state based on the old state.
   *
   * @returns {Object} The final state after all the reducers have executed.
   *
   */
  function mutate(...mutations) {
    mutations = Array.from(mutations)
    if(mutations.some(mutation => typeof mutation !== 'function')) {
      throw new Error(
        'Mutations must be one or more functions.'
      )
    }

    currentState = mutations.reduce(
      ( nextState, mutation ) => mutation(nextState),
      getState()
    )

    listeners.slice().forEach(listener => listener())
    return currentState
  }

  return {
    mutate,
    subscribe,
    getState
  }
}

import {assign, createMachine} from 'xstate'

const increment = (context: any) => context.count + 1
const decrement = (context: any) => context.count - 1

export const viewMachine = createMachine({
  initial: 'loading',
  context: {
    count: 0
  },
  states: {
    off: {
      on: {
        START: {
          actions: () => {
            //
          }
        }
      }
    },
    initializing: {
      on: {}
    },
    loading: {
      on: {
        INC: {actions: assign({count: increment})},
        DEC: {actions: assign({count: decrement})}
      }
    },
    idle: {
      on: {
        START: {
          target: 'loading',
          actions: () => {
            //
          }
        }
      }
    },
    sleep: {
      states: {
        loading: {},
        idle: {}
      },
      on: {}
    },
    correctionValue: {
      states: {
        loading: {},
        editing: {},
        idle: {}
      }
    },
    sss: {},
    shadow: {},
    lights: {},
    env: {
      on: {}
    }
  }
})

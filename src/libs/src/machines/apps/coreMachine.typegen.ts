// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true
  internalEvents: {
    'xstate.init': {type: 'xstate.init'}
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    initViewer: 'INIT'
    offViewer: 'DISPOSE'
    setData: 'START'
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {}
  matchesStates:
    | 'animation'
    | 'animation.end'
    | 'animation.ing'
    | 'idle'
    | 'initializing'
    | 'loading'
    | 'off'
    | 'sleep'
    | {animation?: 'end' | 'ing'}
  tags: never
}

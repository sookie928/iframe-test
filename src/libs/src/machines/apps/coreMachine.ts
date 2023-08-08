import {assign, createMachine} from 'xstate'
import {DataType, ModelDataType, OptionsType, Viewer} from '../../apps/Viewer'

interface IContext {
  viewer: Viewer | null
  url?: string
  data?: any
  modelData?: any
}

export const coreMachine = createMachine(
  {
    predictableActionArguments: true,
    tsTypes: {} as import('./coreMachine.typegen').Typegen0,
    schema: {
      context: {} as IContext,
      events: {} as
        | {type: 'START'; url: string; data: DataType; modelData: ModelDataType}
        | {
            type: 'INIT'
            container: HTMLDivElement
            data: DataType
            options: OptionsType
            doms: HTMLDivElement[] | undefined
            loadingCallback: any
          }
        | {type: 'DISPOSE'}
    },
    initial: 'off',
    context: {
      viewer: null
    },
    states: {
      off: {
        on: {
          INIT: {
            target: 'initializing',
            actions: 'initViewer'
          }
        }
      },
      initializing: {
        invoke: {
          src: async (ctx: IContext) => await (ctx.viewer as Viewer).init(),
          onDone: {
            target: 'idle'
          },
          onError: {
            target: 'sleep'
          }
        }
      },
      loading: {
        invoke: {
          src: async ({viewer, url, data, modelData}) =>
            await (viewer as Viewer).start(url, modelData, data),
          onDone: {
            target: 'idle'
          },
          onError: {
            target: 'sleep'
          }
        }
      },
      idle: {
        on: {
          START: {
            target: 'loading',
            actions: 'setData'
          }
        }
      },
      animation: {
        states: {
          ing: {},
          end: {
            entry: '.idle'
          }
        }
      },
      sleep: {
        on: {
          START: {
            target: 'loading',
            actions: ['setData']
          }
        }
      }
    },
    on: {
      DISPOSE: {
        target: 'sleep',
        actions: 'offViewer'
      }
    }
  },
  {
    actions: {
      initViewer: assign(
        (_, {container, data, options, doms, loadingCallback}) => ({
          viewer: new Viewer(container, data, options, doms, loadingCallback)
        })
      ),
      setData: assign((ctx, {data, modelData, url}) => ({
        ...ctx,
        url,
        data,
        modelData
      })),
      offViewer: (ctx) => {
        const {viewer} = ctx
        if (viewer) {
          viewer.abortLoading()
          viewer.deallocate()
        }
      }
    },
    guards: {
      /* ... */
    },
    services: {}
  }
)

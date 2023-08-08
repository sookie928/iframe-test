import { Editor } from '@/libs/src/apps/Editor';
import { assign, createMachine } from 'xstate';

export const mixerMachine = (viewer: Editor, ref: any) =>
  createMachine({
    predictableActionArguments: true,
    id: 'mixerMachine',
    entry: () => console.log('created'),
    initial: 'paused',
    context: {
      ref,
      viewer,
      elapsed: 0,
      duration: 0,
      interval: 0.03,
      itv: null,
    },
    states: {
      running: {
        invoke: {
          src: (context) => (cb) => {
            const interval = setInterval(() => {
              cb('TICK');
              console.log('tick', interval);
            }, 1000 * context.interval);
            cb({ type: 'TOCK', value: interval });
            return () => {
              clearInterval(interval);
            };
          },
        },
        always: {
          target: 'paused',
          cond: (context) => !context.viewer.onAnimation,
        },
        on: {
          TICK: {
            actions: [
              (context) => {
                context.ref.current = context.viewer.getTimeStamp();
              },
              assign({
                elapsed: (context) => context.viewer.getTimeStamp() as number,
              }),
            ],
          },
          TOCK: {
            actions: [
              assign({
                itv: (evt) => (evt as any).value,
              }),
            ],
          },
          PAUSE: {
            target: 'paused',
            actions: [
              (ctx) => {
                ctx.viewer.pauseAnimation();
              },
            ],
          },
        },
      },
      paused: {
        entry: [
          () => console.log('enter PAUSED'),
          assign({
            itv: (ctx) => {
              if (ctx.itv) clearInterval(ctx.itv);
              return null;
            },
          }),
        ],
        on: {
          START: {
            actions: [() => console.log('inEvent')],
            target: 'running',
            //  cond: (context) => context.elapsed < context.duration
          },
        },
      },
    },
    on: {
      'DURATION.UPDATE': {
        actions: assign({
          duration: (_, event) => event.value,
        }),
      },
      'GET.DURATION': {
        actions: [
          assign({
            duration: (ctx) => ctx.viewer.getDuration() as number,
          }),
          () => {
            console.log('getDuration');
          },
        ],
      },
      RESET: {
        actions: assign({
          elapsed: 0,
        }),
      },
    },
  });

import { useLoadingStore } from '@/libs/stores/useLoadingStore';
import { twclsx } from '@/libs/utils';
import { debounce } from 'lodash';
import { FC, memo, useCallback, useEffect, useRef, useState } from 'react';
import { MENU_ENUM } from './GUI';
import Loading from './Loading';
import Timeline from './Timeline';
import Viewport from './Viewport';

const Model: FC<any> = memo(({ uri, current, data, modelData, send, selectedMenu }) => {
  const { setPerc, perc } = useLoadingStore();
  const viewRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (ref.current && !current.context.viewer) {
      send('INIT', {
        container: ref.current,
        data: data,
        options: {
          width: ref.current?.offsetWidth,
          height: ref.current?.offsetHeight,
          stats: true,
          resize: { debounce: { scroll: 50, resize: 0 } },
          performance: {
            current: 1,
            min: 0.5,
            max: 1,
            debounce: 200,
          },
        },
        loadingCallback: (e: any) => {
          if (e.type && e.type === 'download') {
            let tmp = 0;
            tmp = e.loaded / e.total;
            if (tmp >= 1) {
              setPerc(95);
            } else {
              setPerc(Number((tmp * 0.95 * 100).toFixed(2)));
            }
          } else if (e.type && e.type === 'render') {
            let tmp = 0;
            tmp = e.loaded / e.total;
            const per = Number((tmp * 100 + 80).toFixed(2));
            if (tmp >= 1 || per > 100) {
              setPerc(100);
            } else {
              setPerc(per);
            }
          }
        },
      });
    }
  }, [ref]);

  useEffect(() => {
    if (current.context.viewer && modelData && current.matches('idle') && uri) {
      send('START', {
        url: uri,
        data: data,
        modelData: modelData,
      });
    }
  }, [uri, current.value]);

  // Window Resize Debounce Start
  const onDocumentWindowResize = useCallback(
    debounce(() => {
      if (current.context.viewer && ref.current && viewRef.current) {
        const width = ref.current.clientWidth;
        const height = ref.current.clientHeight
        if (current.context.viewer) current.context.viewer.onWindowResize(width, height);
      }
    }, 300),
    [current, ref, viewRef]
  );

  // TODO: Turn off
  useEffect(() => {
    if (ref && ref.current) {
      window.addEventListener('resize', onDocumentWindowResize);
    }

    return () => {
      if (ref && ref.current) {
        window.removeEventListener('resize', onDocumentWindowResize);
      }
    };
  }, [onDocumentWindowResize]);

  useEffect(() => {
    if (selectedMenu) {
      switch (selectedMenu) {
        case MENU_ENUM.WIREFRAME:
          send('WIREFRAME');
          break;
        case MENU_ENUM.COLOR:
          send('COLOR');
          break;
        case MENU_ENUM.VIEW:
          send('VIEW');
          break;
      }
    }
  }, [selectedMenu]);

  const time = useRef<number>(null);
  const [play, setPlay] = useState(false);

  useEffect(() => {
    if (current.context.viewer?.animations?.length > 0 && send && perc >= 100) {
      send('SET.MIXER', {
        //TODO :EXECUTE ORDER
        value: {
          ref: time,
          callback: () => {
            // when finished
            setPlay(false);
          },
        },
      });
    }
  }, [current.context.viewer?.animations, send, perc]);

  useEffect(() => {
    onDocumentWindowResize();
  }, [ref.current]);

  return (
    <div className={twclsx('flex h-full w-full flex-col bg-blue-500')}>
      <div
        ref={viewRef}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
        className={twclsx('relative flex w-full h-full bg-black')}
      >
        <Viewport ref={ref} />
        <Loading />

        {current.context.viewer?.animations?.length > 0 && current.context.mixerRef && (
          <Timeline
            className={hover ? 'opacity-100' : 'opacity-0'}
            send={send}
            intro={current.context.viewer?.intro}
            actions={current.context.viewer?.animations}
            mixer={current.context.viewer?.mixer}
            current={current.context.mixerRef}
            play={play}
            setPlay={setPlay}
          />
        )}
      </div>
    </div>
  );
});

export default Model;

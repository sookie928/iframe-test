import PauseSmall from '@/assets/icons/PauseSmall'
import Play from '@/assets/icons/Play'
import { twclsx } from '@/libs/utils'
import { useActor } from '@xstate/react'
import { Dispatch, FC, useEffect, useRef } from 'react'

interface ITimelineProps {
  send: any
  intro: any
  actions: any
  mixer: any
  current: any
  play: boolean
  className?: string
  setPlay: Dispatch<boolean>
}
const Timeline: FC<ITimelineProps> = ({
  intro,
  actions,
  send,
  current,
  play,
  className,
  setPlay
}) => {
  const [state, sendTo]: any[] = useActor(current)
  const track = useRef<HTMLDivElement>(null)
  const thumb = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (play) {
      if (
        Math.ceil(state.context.elapsed * 10) / 10 >=
        state.context.duration
      ) {
        send('STOP.ALL') // TODO : ORDER
        send('PLAY.ALL')
      } else
        send('PLAY.AT', {
          value: state.context.elapsed
        })
    } // TODO: MOVE TO MIXER MACHINE
    else sendTo('PAUSE')
  }, [play])

  useEffect(() => {
    if (intro) {
      //
    }
  }, [intro])

  const onMouseClick = (e: any) => {
    const parentNode = e.target.parentNode
    const clientRect = parentNode.getBoundingClientRect()
    const gap = e.clientX - clientRect.left
    const at = (state as any).context.duration
      ? ((state as any).context.duration * gap) / parentNode.offsetWidth
      : 0

    send('PLAY.AT', {value: at})
    sendTo('TICK')
    setPlay(true)
  }

  useEffect(() => {
    if (current)
      current.subscribe((state: any) => {
        const {duration, elapsed} = state.context
        const perc = `${(elapsed / duration) * 100}%`
        if (track.current) track.current.style.width = perc
        if (thumb.current) thumb.current.style.left = perc
      })
  }, [current, track, thumb])

  useEffect(() => {
    if (current) {
      send('PLAY.ALL')
      setPlay(true) // TODO : viewer.onAnimation
    }
  }, [current])

  return (
    <div
      className={twclsx(
        'flex transition hover:ease-in ease-out absolute bottom-0 items-start pt-47 w-full h-72 bg-gradient-to-b from-[rgba(0,0,0,0)] from-0% to-[rgba(0,0,0,2)]  px-8',
        className
      )}
    >
      <div
        onClick={() => {
          console.log('hi')
          setPlay(!play)
        }}
        className="flex h-24 w-24 items-center -translate-y-1/4 justify-center rounded-sm text-white outline-none data-[focus]:ring-4 data-[focus]:ring-blue-400"
      >
        {play ? <PauseSmall /> : <Play />}
      </div>
      <div className="group relative flex h-12 mx-2.5 flex-1 items-center">
        <div
          onMouseDown={onMouseClick}
          className="absolute top-1/2 left-0 z-0 cursor-pointer h-4 rounded-sm w-full opacity-30 -translate-y-1/2 bg-white outline-none group-data-[focus]:ring-4 group-data-[focus]:ring-blue-400"
        />
        <div
          ref={track}
          onMouseDown={onMouseClick}
          className="absolute top-1/2 left-0 z-20 h-4 rounded-sm -translate-y-1/2 bg-primary cursor-pointer"
        />
        <div
          ref={thumb}
          className="absolute top-0 z-20 h-full w-5 -translate-x-1/2"
        >
          <div className="absolute top-1/2 left-0 h-12 w-12 -translate-y-1/2 rounded-full bg-white opacity-100 transition-opacity duration-150 ease-in" />
        </div>
      </div>
    </div>
  )
}

export default Timeline

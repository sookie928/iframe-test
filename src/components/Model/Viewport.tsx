import {twclsx} from '@/libs/utils'
import {FC, ForwardedRef, ReactNode, forwardRef, memo} from 'react'

const Viewport: FC<{ref: ForwardedRef<HTMLDivElement>; children?: ReactNode}> =
  memo(
    forwardRef(({children}, ref: ForwardedRef<HTMLDivElement> | undefined) => {
      return (
        <div ref={ref} className={twclsx('w-full h-full')}>
          {children}
        </div>
      )
    }),
    (prev, next) => prev.children === next.children
  )

export default Viewport

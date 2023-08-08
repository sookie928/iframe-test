import {twclsx} from '@/libs/utils'
import {FC, ForwardedRef, ReactNode, forwardRef, memo} from 'react'

const ProgressText: FC<{ref: ForwardedRef<HTMLDivElement>}> = memo(
  forwardRef((_, ref: ForwardedRef<HTMLDivElement> | undefined) => {
    return <div ref={ref} className={twclsx('text-white text-[14px]')} />
  })
)

export default ProgressText

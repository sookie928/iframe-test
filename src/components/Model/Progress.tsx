import {twclsx} from '@/libs/utils'
import {FC, ForwardedRef, forwardRef, memo} from 'react'

const Progress: FC<{ref: ForwardedRef<HTMLDivElement>}> = memo(
  forwardRef((_, ref: ForwardedRef<HTMLDivElement> | undefined) => {
    return (
      <div
        className={twclsx('w-[198px] h-[10px] bg-white mt-[21px] mb-[14px] rounded-[8px]')}
      >
        <div
          ref={ref}
          className="h-full bg-blue-500 rounded-[8px] text-right"
          style={{
            width: 0
          }}
        />
      </div>
    )
  })
)

export default Progress

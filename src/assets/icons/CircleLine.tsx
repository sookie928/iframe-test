import {twclsx} from '@/libs/utils'
import  {FC} from 'react'

const CircleLine: FC<{style?: string; onClick?: any; [key: string]: any}> = ({
  style,
  onClick,
  ...props
}) => {
  return (
    <svg
      className={twclsx('', style)}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="8"
      fill="none"
      viewBox="0 0 8 8"
      {...props}
    >
      <circle
        cx="4"
        cy="4"
        r="3.5"
        stroke="#2E2D31"
        transform="rotate(90 4 4)"
      ></circle>
    </svg>
  )
}

export default CircleLine

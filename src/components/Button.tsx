import {twclsx} from '@/libs/utils'
import {FC, MouseEvent, ReactNode} from 'react'

export interface IBtnProps {
  className: string
  content: ReactNode | string
  style?: any
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset' | undefined
}

const Button: FC<IBtnProps> = ({className, type, style, content, onClick}) => {
  return (
    <button
      type={type}
      className={twclsx(
        'flex items-stretch justify-center rounded-lg text-white text-[14px] cursor-pointer',
        className
      )}
      style={style}
      onClick={onClick}
    >
      {content}
    </button>
  )
}

export default Button

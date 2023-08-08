import {twclsx} from '@/libs/utils'
import  {FC} from 'react'

const Menu: FC<{style?: string; onClick?: any; [key: string]: any}> = ({
  style,
  onClick,
}) => {
  return (
    <svg
      className={twclsx('', style)}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 18 18"
    >
      <rect
        width="7.5"
        height="7.5"
        x="0.75"
        y="0.75"
        fill="#fff"
        rx="2"
      ></rect>
      <rect
        width="7.5"
        height="7.5"
        x="9.75"
        y="0.75"
        fill="#fff"
        rx="2"
      ></rect>
      <rect
        width="7.5"
        height="7.5"
        x="9.75"
        y="9.75"
        fill="#fff"
        rx="2"
      ></rect>
      <rect
        width="7.5"
        height="7.5"
        x="0.75"
        y="9.75"
        fill="#fff"
        rx="2"
      ></rect>
    </svg>
  )
}

export default Menu

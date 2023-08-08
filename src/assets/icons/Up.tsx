import React, {FC} from 'react'

const Up: FC<{style?: string; onClick?: any; [key: string]: any}> = ({
  style,
  onClick,
  ...props
}) => {
  return (
    <svg
      className={style}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 22 22"
    >
      <path stroke="#fff" strokeLinecap="round" d="M6 14l5-5 5 5"></path>
    </svg>
  )
}

export default Up

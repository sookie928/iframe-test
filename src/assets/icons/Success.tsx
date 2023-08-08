import React, {FC} from 'react'

const Success: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick, ...props}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        fill="#fff"
        fillOpacity="0.2"
        d="M10 19a9 9 0 100-18 9 9 0 000 18z"
      ></path>
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.125 7.75L8.625 13l-2.75-2.625"
      ></path>
    </svg>
  )
}

export default Success

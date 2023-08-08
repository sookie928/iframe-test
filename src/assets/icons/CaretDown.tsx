import React, {FC} from 'react'

const CaretDown: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick, ...props}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="15"
      fill="none"
      viewBox="0 0 14 15"
      className={className}
      style={style}
    >
      <path
        stroke="#BDC6CB"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.375 5.75L7 10.125 2.625 5.75"
      ></path>
    </svg>
  )
}

export default CaretDown

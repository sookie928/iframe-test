import React, {FC} from 'react'

const CaretUp: FC<{
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
        d="M2.625 10.125L7 5.75l4.375 4.375"
      ></path>
    </svg>
  )
}

export default CaretUp

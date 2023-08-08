import React, {FC} from 'react'

const Close: FC<{className?: string; onClick?: any; [key: string]: any}> = ({
  className,
  onClick,
  ...props
}) => {
  return (
    <svg
      fill="none"
      stroke="#fff"
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      viewBox="0 0 40 40"
      className={className}
      onClick={onClick}
    >
      <path
        stroke="inherit"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M31.25 8.75l-22.5 22.5M31.25 31.25L8.75 8.75"
      ></path>
    </svg>
  )
}

export default Close

import React, {FC} from 'react'

const PauseSmall: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick, ...props}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      <rect width="5" height="15" x="5.5" y="4.5" fill="#fff" rx="2"></rect>
      <rect width="5" height="15" x="13.5" y="4.5" fill="#fff" rx="2"></rect>
    </svg>
  )
}

export default PauseSmall

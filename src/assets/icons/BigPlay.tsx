import React, {FC} from 'react'

const BigPlay: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick, ...props}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="80"
      height="80"
      fill="none"
      viewBox="0 0 80 80"
      className={className}
      style={style}
    >
      <circle cx="40" cy="40" r="40" fill="#000" fillOpacity="0.3"></circle>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M33.572 25.025C31.573 23.795 29 25.233 29 27.58v24.842c0 2.347 2.573 3.785 4.572 2.555l20.184-12.421c1.904-1.172 1.904-3.939 0-5.11L33.572 25.025z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default BigPlay

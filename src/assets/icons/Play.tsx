import React, {FC} from 'react'

const Play: FC<{
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
      <g>
        <path
          fill="#fff"
          fillRule="evenodd"
          d="M10.572 5.024C8.573 3.794 6 5.232 6 7.579v8.842c0 2.347 2.573 3.785 4.572 2.555l7.184-4.421c1.904-1.172 1.904-3.939 0-5.11l-7.184-4.421z"
          clipRule="evenodd"
        ></path>
      </g>
    </svg>
  )
}

export default Play

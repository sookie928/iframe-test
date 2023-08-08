import React, {FC} from 'react'

const Capture: FC<{
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
        fill="#FFC700"
        fillRule="evenodd"
        d="M3.333 17h13.334c.353 0 .692-.13.942-.364a1.2 1.2 0 00.391-.878V6.104a1.2 1.2 0 00-.39-.878 1.385 1.385 0 00-.943-.364h-2.668L12.666 3H7.333L5.999 4.862H3.333c-.353 0-.692.131-.943.364a1.2 1.2 0 00-.39.878v9.654c0 .33.14.646.39.878.25.233.59.364.943.364zm10.034-6.3c0 1.657-1.425 3-3.183 3C8.425 13.7 7 12.357 7 10.7s1.425-3 3.184-3c1.758 0 3.183 1.343 3.183 3z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default Capture

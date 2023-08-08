import React, {FC} from 'react'

const CircleFill: FC<{style?: string; onClick?: any; [key: string]: any}> = ({
  style,
  onClick,
  ...props
}) => {
  return (
    <svg
      className={style}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      fill="none"
      viewBox="0 0 12 12"
      {...props}
    >
      <circle
        cx="6"
        cy="6"
        r="6"
        fill="#2E2D31"
        transform="rotate(90 6 6)"
      ></circle>
    </svg>
  )
}

export default CircleFill

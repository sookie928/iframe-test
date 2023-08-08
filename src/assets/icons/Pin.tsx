import { FC } from 'react'

const Pin: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 22 22"
      className={className}
      style={style}
    >
      <path
        fill="#9DA2A8"
        d="M17.692 9.787l-3.845 3.85c.299.833.423 2.228-.867 3.944a1.05 1.05 0 01-1.583.11l-3.166-3.169-2.257 2.259a.526.526 0 11-.743-.744l2.256-2.259-3.18-3.182a1.054 1.054 0 01.085-1.565c1.67-1.349 3.27-1.083 3.97-.863l3.856-3.86a1.052 1.052 0 011.487 0l3.987 3.99a1.054 1.054 0 010 1.489z"
      ></path>
    </svg>
  )
}

export default Pin

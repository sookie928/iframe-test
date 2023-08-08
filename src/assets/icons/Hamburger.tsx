import  {FC} from 'react'

const Hamburger: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="none"
      viewBox="0 0 32 32"
      style={style}
      className={className}
    >
      <path
        stroke="#2E2D31"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M8 10h16M8 16h16M8 22h16"
      ></path>
    </svg>
  )
}

export default Hamburger

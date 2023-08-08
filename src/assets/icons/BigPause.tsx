import  {FC} from 'react'

const BigPause: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
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
      <rect width="10" height="30" x="27" y="25" fill="#fff" rx="2"></rect>
      <rect width="10" height="30" x="43" y="25" fill="#fff" rx="2"></rect>
    </svg>
  )
}

export default BigPause

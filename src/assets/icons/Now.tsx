import  {FC} from 'react'

const Now: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
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
        fill="#fff"
        d="M7 .5a7 7 0 107 7 7.008 7.008 0 00-7-7zm3.334 5.774l-3.95 3.77a.54.54 0 01-.744 0L3.666 8.159a.539.539 0 01.745-.78l1.601 1.53L9.59 5.495a.539.539 0 01.745.78z"
      ></path>
    </svg>
  )
}

export default Now

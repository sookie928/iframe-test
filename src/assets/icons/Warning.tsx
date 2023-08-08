import  {FC} from 'react'

const Warning: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
      className={className}
      style={style}
    >
      <path
        fill="#fff"
        fillOpacity="0.2"
        d="M8.801 2.694L1.186 15.912a1.396 1.396 0 00.506 1.901c.21.123.45.187.693.187h15.23a1.38 1.38 0 001.2-.696 1.397 1.397 0 00-.001-1.392L11.199 2.694A1.388 1.388 0 0010 2a1.38 1.38 0 00-1.199.694z"
      ></path>
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10 8v3.75M10 14v.2"
      ></path>
    </svg>
  )
}

export default Warning

import  {FC} from 'react'

const ElVid: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
      width="24"
      height="18"
      fill="none"
      viewBox="0 0 24 18"
    >
      <path
        fill="#fff"
        fillOpacity="0.5"
        d="M20 0H4a4 4 0 00-4 4v10a4 4 0 004 4h16a4 4 0 004-4V4a4 4 0 00-4-4z"
      ></path>
      <path
        fill="#2E2D31"
        fillRule="evenodd"
        d="M6.5 4A1.5 1.5 0 005 5.5v7A1.5 1.5 0 006.5 14h11a1.5 1.5 0 001.5-1.5v-7A1.5 1.5 0 0017.5 4h-11zm7.75 5.433a.5.5 0 000-.866l-3-1.732a.5.5 0 00-.75.433v3.464a.5.5 0 00.75.433l3-1.732z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default ElVid

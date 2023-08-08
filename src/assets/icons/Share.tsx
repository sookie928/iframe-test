import  {FC} from 'react'

const Share: FC<{
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
      stroke="#2E2D31"
      className={className}
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="inherit"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M6.77 14.77a2.77 2.77 0 100-5.54 2.77 2.77 0 000 5.54zM16.462 21a2.77 2.77 0 100-5.538 2.77 2.77 0 000 5.538zM16.462 8.538a2.77 2.77 0 100-5.538 2.77 2.77 0 000 5.538zM14.132 7.267l-5.034 3.236M9.098 13.497l5.034 3.236"
      ></path>
    </svg>
  )
}

export default Share

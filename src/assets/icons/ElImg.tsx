import  {FC} from 'react'

const ElImg: FC<{
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
        d="M5 5.5A1.5 1.5 0 016.5 4h11A1.5 1.5 0 0119 5.5v7a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 015 12.5v-7zm3.624 4.798L6.692 11.81a.5.5 0 00-.192.394v.295h11v-.833a.5.5 0 00-.192-.394l-2.61-2.044a.5.5 0 00-.596-.015l-2.856 2.014a.5.5 0 01-.561.01l-1.479-.965a.5.5 0 00-.582.025zM12 7.25a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default ElImg

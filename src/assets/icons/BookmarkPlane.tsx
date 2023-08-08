import  {FC} from 'react'

const BookmarkPlane: FC<{
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
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <path
        stroke="#0073FF"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.389 17.627c0 .983-1.09 1.588-1.942 1.077l-3.783-2.272a1.293 1.293 0 00-1.33 0l-3.78 2.271c-.852.512-1.943-.093-1.943-1.076V2.99c0-.204.084-.399.234-.543a.815.815 0 01.565-.224h11.18c.212 0 .415.08.565.224.15.144.234.34.234.543v14.637z"
      ></path>
    </svg>
  )
}

export default BookmarkPlane

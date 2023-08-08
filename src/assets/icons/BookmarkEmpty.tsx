import  {FC} from 'react'

const BookmarkEmpty: FC<{
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
      height="24"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="#DDDFE3"
        d="M2 .5h20A1.5 1.5 0 0123.5 2v20a1.5 1.5 0 01-1.5 1.5H2A1.5 1.5 0 01.5 22V2A1.5 1.5 0 012 .5z"
      ></path>
      <path
        fill="#2E2D31"
        fillRule="evenodd"
        d="M8.023 6.414a.121.121 0 00-.085.033.092.092 0 00-.029.066v10.614c0 .356.388.575.691.39l2.69-1.647a1.357 1.357 0 011.419 0l2.691 1.647a.454.454 0 00.69-.39V6.513a.093.093 0 00-.028-.066.121.121 0 00-.085-.033H8.023zm-.72-.621c.193-.19.452-.293.72-.293h7.954c.268 0 .526.104.72.293.192.189.303.448.303.72v10.614c0 1.07-1.164 1.727-2.073 1.171l-2.691-1.647a.453.453 0 00-.473 0l-2.69 1.647C8.164 18.854 7 18.196 7 17.127V6.513c0-.272.11-.531.304-.72z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default BookmarkEmpty

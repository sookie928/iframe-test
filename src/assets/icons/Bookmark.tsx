import  {FC} from 'react'

const Bookmark: FC<{
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
        fill="#0073FF"
        d="M17 17.515c0 .767-.854 1.239-1.52.84l-2.96-1.771a1.015 1.015 0 00-1.04 0l-2.96 1.77c-.666.4-1.52-.072-1.52-.839V6.098c0-.158.066-.31.183-.423a.64.64 0 01.442-.175h8.75a.64.64 0 01.442.175.586.586 0 01.183.423v11.417z"
      ></path>
    </svg>
  )
}

export default Bookmark

import  {FC} from 'react'

const Note: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 22 22"
      className={className}
      style={style}
    >
      <path
        fill="#9DA2A8"
        d="M16.833 4H5.167A1.168 1.168 0 004 5.167v11.666A1.168 1.168 0 005.167 18h11.666A1.168 1.168 0 0018 16.833V5.167A1.168 1.168 0 0016.833 4zM7.5 16.833H5.167V5.167H7.5v11.666zm7-4.083H9.833a.583.583 0 010-1.167H14.5a.583.583 0 010 1.167zm0-2.333H9.833a.583.583 0 010-1.167H14.5a.583.583 0 010 1.167z"
      ></path>
    </svg>
  )
}

export default Note

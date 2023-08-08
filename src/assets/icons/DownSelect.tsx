import  {FC} from 'react'

const DownSelect: FC<{
  className?: string
  onClick?: any
  [key: string]: any
}> = ({className, onClick}) => {
  return (
    <svg
      className={className}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="6"
      fill="none"
      viewBox="0 0 8 6"
    >
      <path fill="#2E2D31" d="M4 6l3.464-6H.536L4 6z"></path>
    </svg>
  )
}

export default DownSelect

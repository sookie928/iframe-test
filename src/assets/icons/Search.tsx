import  {FC} from 'react'

const Search: FC<{
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
      stroke="inherit"
      viewBox="0 0 20 20"
      className={className}
      style={style}
    >
      <path
        stroke="inherit"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M18 18l-3.86-3.86m0 0A7.111 7.111 0 104.083 4.082 7.111 7.111 0 0014.14 14.139z"
      ></path>
    </svg>
  )
}

export default Search

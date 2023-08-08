import  {FC} from 'react'

const Globe: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      style={style}
      className={className}
    >
      <path
        stroke="#3A393E"
        strokeMiterlimit="10"
        strokeWidth="1.5"
        d="M12 21a9 9 0 100-18 9 9 0 000 18z"
      ></path>
      <path
        stroke="#3A393E"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M3.512 9h16.975M3.513 15h16.975"
      ></path>
      <path
        stroke="#3A393E"
        strokeMiterlimit="10"
        strokeWidth="1.5"
        d="M12 20.759c2.071 0 3.75-3.922 3.75-8.759S14.071 3.242 12 3.242c-2.071 0-3.75 3.921-3.75 8.758S9.929 20.76 12 20.76z"
      ></path>
    </svg>
  )
}

export default Globe

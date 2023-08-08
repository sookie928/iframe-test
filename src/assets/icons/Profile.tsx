import React, {FC} from 'react'

const Profile: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick, ...props}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="40"
      height="40"
      fill="none"
      viewBox="0 0 40 40"
      style={style}
      className={className}
    >
      <rect width="40" height="40" fill="#DDDFE3" rx="20"></rect>
      <path
        fill="#fff"
        d="M20 28a1.714 1.714 0 100-3.429A1.714 1.714 0 0020 28z"
      ></path>
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        d="M20 21.143V20a4 4 0 10-4-4"
      ></path>
    </svg>
  )
}

export default Profile

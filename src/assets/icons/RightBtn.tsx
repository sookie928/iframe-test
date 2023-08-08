import React, {FC} from 'react'

const RightBtn: FC<{style?: string; onClick?: any; [key: string]: any}> = ({
  style,
  onClick,
  ...props
}) => {
  return (
    <svg
      fill="#2E2D31"
      className={style}
      onClick={onClick}
      width="36"
      height="36"
      viewBox="0 0 36 36"
      {...props}
    >
      <path
        fill="inherit"
        fillRule="evenodd"
        d="M0 18c0 9.941 8.059 18 18 18s18-8.059 18-18S27.941 0 18 0 0 8.059 0 18zm14.498-6.193a.75.75 0 111.004-1.114l7.5 6.75a.75.75 0 010 1.114l-7.5 6.75a.75.75 0 11-1.004-1.114L21.378 18l-6.88-6.193z"
        clipRule="evenodd"
      ></path>
    </svg>
  )
}

export default RightBtn

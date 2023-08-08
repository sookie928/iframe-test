import React, {FC} from 'react'

const CheckboxActive: FC<{className?: string}> = ({className}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <rect width="20" height="20" fill="#0073FF" rx="4"></rect>
      <path stroke="#fff" d="M5.5 9.727L8.676 13 14.5 7"></path>
    </svg>
  )
}

export default CheckboxActive

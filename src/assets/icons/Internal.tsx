import React, {FC} from 'react'

const Internal: FC<{style?: string}> = ({style}) => {
  return (
    <svg
      stroke="#2E2D31"
      className={style}
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
    >
      <path
        stroke="inherit"
        strokeLinecap="round"
        strokeWidth="1.4"
        d="M8 13v1a4 4 0 004 4v0a4 4 0 004-4v-3M5.5 4H5a1 1 0 00-1 1v3.5a4 4 0 004 4v0a4 4 0 004-4V5a1 1 0 00-1-1h-.5"
      ></path>
      <circle cx="16" cy="9.25" r="1.75" fill="inherit"></circle>
    </svg>
  )
}

export default Internal

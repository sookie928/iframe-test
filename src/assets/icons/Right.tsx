import  {FC} from 'react'

const Right: FC<{style?: string}> = ({style}) => {
  return (
    <svg
      className={style}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="14"
      fill="none"
      viewBox="0 0 16 14"
    >
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.875 13L15 7m0 0L8.875 1M15 7H1"
      ></path>
    </svg>
  )
}

export default Right

import  {FC} from 'react'

const CaretRight: FC<{
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
      width="36"
      height="36"
      fill="none"
      viewBox="0 0 36 36"
    >
      <path
        stroke="#DDDFE3"
        strokeMiterlimit="10"
        d="M18 31.5c-7.456 0-13.5-6.044-13.5-13.5S10.544 4.5 18 4.5 31.5 10.544 31.5 18 25.456 31.5 18 31.5z"
      ></path>
      <path
        stroke="#525158"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 12.938L21.375 18l-5.625 5.063"
      ></path>
    </svg>
  )
}

export default CaretRight

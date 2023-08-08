import  {FC} from 'react'

const Checkbox: FC<{className?: string}> = ({className}) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
    >
      <rect
        width="19"
        height="19"
        x="0.5"
        y="0.5"
        fill="#fff"
        stroke="#9DA2A8"
        rx="3.5"
      ></rect>
    </svg>
  )
}

export default Checkbox

import React, {FC} from 'react'

const ToggleOff: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick, ...props}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="36"
      height="22"
      fill="none"
      viewBox="0 0 36 22"
      className={className}
      style={style}
    >
      <rect width="36" height="20" fill="#798085" rx="10"></rect>
      <g filter="url(#filter0_d_2338_23920)">
        <circle cx="10" cy="10" r="8" fill="#fff"></circle>
      </g>
      <defs>
        <filter
          id="filter0_d_2338_23920"
          width="20"
          height="20"
          x="0"
          y="2"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          ></feColorMatrix>
          <feOffset dy="2"></feOffset>
          <feGaussianBlur stdDeviation="1"></feGaussianBlur>
          <feComposite in2="hardAlpha" operator="out"></feComposite>
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"></feColorMatrix>
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_2338_23920"
          ></feBlend>
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_2338_23920"
            result="shape"
          ></feBlend>
        </filter>
      </defs>
    </svg>
  )
}

export default ToggleOff

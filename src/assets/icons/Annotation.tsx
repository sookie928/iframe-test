import React, {FC} from 'react'

const Annotation: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick, ...props}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      <g filter="url(#filter0_b_1291_20451)">
        <circle cx="12" cy="12" r="12" fill="#fff" fillOpacity="0.5"></circle>
      </g>
      <path
        fill="#0073FF"
        d="M12 5.5a6.5 6.5 0 106.5 6.5A6.507 6.507 0 0012 5.5zm2.5 7h-2v2a.5.5 0 01-1 0v-2h-2a.5.5 0 010-1h2v-2a.5.5 0 011 0v2h2a.5.5 0 010 1z"
      ></path>
      <defs>
        <filter
          id="filter0_b_1291_20451"
          width="32"
          height="32"
          x="-4"
          y="-4"
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feGaussianBlur
            in="BackgroundImageFix"
            stdDeviation="2"
          ></feGaussianBlur>
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_1291_20451"
          ></feComposite>
          <feBlend
            in="SourceGraphic"
            in2="effect1_backgroundBlur_1291_20451"
            result="shape"
          ></feBlend>
        </filter>
      </defs>
    </svg>
  )
}

export default Annotation

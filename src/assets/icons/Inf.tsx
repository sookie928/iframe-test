import React, {FC} from 'react'

const Inf: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick, ...props}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      fill="none"
      viewBox="0 0 48 48"
      className={className}
      style={style}
    >
      <path
        fill="inherit"
        fillRule="evenodd"
        d="M25.665 12.466a1.667 1.667 0 11-3.333 0 1.667 1.667 0 013.333 0zm.03 7.15a.793.793 0 00.57-.243l.006-.007a.839.839 0 00.229-.577v-2.101c0-.173-.025-.34-.071-.498a1.683 1.683 0 00-1.605-1.224h-1.648c-.752 0-1.389.509-1.6 1.21a1.762 1.762 0 00-.076.512v2.101c0 .212.08.416.222.57l.014.014c.15.155.355.242.568.242v3.691c0 .22.085.43.236.584a.47.47 0 00.122.084l.006.003c.127.064.294.11.383.134l.058.017c.008.003.008.005 0 .005h1.782a.793.793 0 00.569-.243.838.838 0 00.236-.584v-3.69z"
        clipRule="evenodd"
      ></path>
      <rect
        width="1.25"
        height="16.67"
        x="15.5"
        y="8.8"
        fill="#9DA2A8"
        rx="0.625"
        transform="rotate(-90 15.5 8.8)"
      ></rect>
      <path
        fill="inherit"
        d="M19.286 30.516V39h-1.055v-8.484h1.055zm2.634 4.664V39h-1.008v-6.363h.973v.996h.082c.299-.65.896-1.078 1.863-1.078 1.29 0 2.15.785 2.145 2.402V39h-1.008v-3.973c0-.984-.54-1.57-1.442-1.57-.925 0-1.605.621-1.605 1.723zm8.4-2.543v.843h-1.407V39h-1.02v-5.52h-1.019v-.843h1.02v-.867c.006-1.032.691-1.653 1.816-1.653.246 0 .54.03.75.07v.903a3.385 3.385 0 00-.527-.047c-.71 0-1.026.293-1.02.95v.644h1.407z"
      ></path>
    </svg>
  )
}

export default Inf

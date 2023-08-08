import  {FC} from 'react'

const Pause: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      // width="24"
      // height="24"
      // fill="none"
      // viewBox="0 0 24 24"
      className={className}
      style={style}
      width="44"
      height="44"
      fill="none"
      viewBox="0 0 44 44"
    >
      <path
        fill="#2E2D31"
        d="M30 14.5v15c0 .398-.154.779-.427 1.06-.272.281-.642.44-1.027.44h-3.273c-.386 0-.756-.159-1.028-.44a1.526 1.526 0 01-.427-1.06v-15c0-.398.154-.779.427-1.06.272-.281.642-.44 1.028-.44h3.273c.385 0 .755.159 1.027.44.273.281.427.662.427 1.06zM18.727 13h-3.273c-.385 0-.755.159-1.027.44A1.526 1.526 0 0014 14.5v15c0 .398.154.779.427 1.06.272.281.642.44 1.027.44h3.273c.386 0 .756-.159 1.028-.44.273-.281.426-.662.427-1.06v-15c0-.398-.154-.779-.427-1.06a1.434 1.434 0 00-1.028-.44z"
      ></path>
    </svg>
  )
}

export default Pause

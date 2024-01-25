import  {FC} from 'react'

const Ant: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
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
      <rect
        width="1.25"
        height="16.667"
        x="23.375"
        y="7.5"
        fill="#9DA2A8"
        rx="0.625"
      ></rect>
      <path
        fill="inherit"
        fillRule="evenodd"
        d="M25.665 10.833a1.667 1.667 0 11-3.333 0 1.667 1.667 0 013.333 0zm.03 7.149a.793.793 0 00.57-.242l.006-.007a.838.838 0 00.229-.578v-2.101c0-.173-.025-.34-.071-.498a1.683 1.683 0 00-1.605-1.224h-1.648c-.752 0-1.389.51-1.6 1.21a1.761 1.761 0 00-.076.512v2.101c0 .213.08.417.222.57l.014.015c.15.155.355.242.568.242v3.69c0 .22.085.43.236.585.03.03.073.058.122.084l.006.002c.127.064.294.11.383.135l.058.016c.008.003.008.005 0 .005h1.782a.793.793 0 00.569-.242.838.838 0 00.236-.585v-3.69z"
        clipRule="evenodd"
      ></path>
      <path
        fill="#inherit"
        d="M16.18 39H15.08l3.105-8.484h1.114L22.403 39H21.29l-.85-2.39h-3.41L16.18 39zm1.172-3.316h2.766l-1.348-3.797h-.07l-1.348 3.797zm6.959-.504V39h-1.008v-6.363h.972v.996h.082c.3-.65.897-1.078 1.864-1.078 1.289 0 2.15.785 2.144 2.402V39h-1.008v-3.973c0-.984-.539-1.57-1.441-1.57-.926 0-1.605.621-1.605 1.723zm8.329-2.543v.843h-1.336v3.692c-.006.814.404.95.832.95.181 0 .451-.019.597-.024v.937a4.96 4.96 0 01-.703.047c-.85 0-1.74-.527-1.746-1.652v-3.95h-.96v-.843h.96v-1.524h1.02v1.524h1.336z"
      ></path>
    </svg>
  )
}

export default Ant
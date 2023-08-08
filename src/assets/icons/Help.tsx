import React, {FC} from 'react'

const Help: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick, ...props}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      fill="none"
      viewBox="0 0 20 20"
      className={className}
      style={style}
    >
      <circle
        cx="10"
        cy="10"
        r="9.75"
        stroke="#DDDFE3"
        strokeWidth="0.5"
      ></circle>
      <path
        fill="#525158"
        d="M9.438 11.188c.003-.368.046-.674.128-.92.086-.247.213-.46.381-.64.168-.183.4-.374.698-.573.351-.235.605-.471.761-.71a1.5 1.5 0 00.246-.825 1.513 1.513 0 00-.832-1.383 1.792 1.792 0 00-.843-.2 1.711 1.711 0 00-.856.206 1.585 1.585 0 00-.621.591 1.87 1.87 0 00-.246.903h-.61c.008-.438.114-.826.317-1.166.207-.34.486-.604.838-.791a2.463 2.463 0 011.178-.282c.433 0 .822.092 1.166.276.347.183.619.44.814.767.195.325.293.692.293 1.102-.004.394-.102.74-.293 1.037-.188.297-.492.588-.914.873a3.12 3.12 0 00-.603.504c-.141.156-.243.33-.305.521a2.418 2.418 0 00-.1.71v.351h-.598v-.351zm-.176 2.367a.453.453 0 01.14-.346.48.48 0 01.352-.146c.14 0 .26.048.357.146a.46.46 0 01.147.346c0 .14-.049.26-.147.357a.486.486 0 01-.357.147.48.48 0 01-.352-.147.467.467 0 01-.14-.357z"
      ></path>
    </svg>
  )
}

export default Help

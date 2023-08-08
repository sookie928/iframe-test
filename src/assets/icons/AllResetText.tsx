import  {FC} from 'react'

const AllResetText: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="72"
      height="32"
      fill="none"
      viewBox="0 0 72 32"
      className={className}
      style={style}
    >
      <path
        stroke="#BDC6CB"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.625 14.266H2V11.64"
      ></path>
      <path
        stroke="#BDC6CB"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.856 19.215a4.813 4.813 0 100-6.805L2 14.266"
      ></path>
      <path
        fill="#BDC6CB"
        d="M19.531 21.5h-1.285l3.623-9.898h1.299l3.623 9.898h-1.299l-.991-2.79h-3.979l-.99 2.79zm1.367-3.87h3.227l-1.572-4.429h-.082l-1.573 4.43zm8.118-6.028V21.5h-1.175v-9.898h1.175zm2.91 0V21.5h-1.177v-9.898h1.176zm5.256 9.898v-9.898h3.363c2.318 0 3.377 1.285 3.377 3.048 0 1.313-.587 2.338-1.845 2.776l2.228 4.074H42.87l-2.072-3.849c-.075.007-.157.007-.239.007h-2.146V21.5h-1.23zm1.23-4.963h2.093c1.579 0 2.194-.71 2.2-1.887-.006-1.182-.621-1.955-2.214-1.955h-2.078v3.842zm10.032 5.113c-2.146.007-3.472-1.524-3.472-3.8 0-2.284 1.347-3.87 3.363-3.87 1.559 0 3.206.957 3.2 3.706v.492h-5.387c.061 1.572.977 2.433 2.296 2.433.89 0 1.45-.39 1.723-.847h1.258c-.349 1.128-1.45 1.893-2.98 1.886zm-2.29-4.47h4.19c-.006-1.238-.785-2.16-2.009-2.16-1.285 0-2.099 1.011-2.18 2.16zm10.9-1.176c-.163-.615-.635-1.019-1.503-1.026-.916.007-1.566.5-1.573 1.122.007.492.404.827 1.272 1.039l1.107.273c1.326.315 1.976.978 1.983 2.01-.007 1.285-1.053 2.235-2.912 2.228-1.668.007-2.66-.738-2.858-2.091h1.23c.137.724.664 1.073 1.6 1.066 1.06.007 1.723-.438 1.723-1.135 0-.526-.376-.868-1.217-1.066l-1.121-.26c-1.292-.3-1.982-1.005-1.982-1.996 0-1.271 1.114-2.188 2.748-2.188 1.538 0 2.502.82 2.652 2.024h-1.149zm5.794 5.646c-2.146.007-3.472-1.524-3.472-3.8 0-2.284 1.346-3.87 3.363-3.87 1.558 0 3.206.957 3.199 3.706v.492h-5.387c.062 1.572.978 2.433 2.297 2.433.889 0 1.45-.39 1.723-.847h1.258c-.349 1.128-1.45 1.893-2.98 1.886zm-2.29-4.47h4.19c-.006-1.238-.786-2.16-2.01-2.16-1.284 0-2.098 1.011-2.18 2.16zm10.012-3.104v.984h-1.56v4.307c-.006.95.472 1.108.972 1.108.212 0 .526-.02.697-.028v1.094a5.768 5.768 0 01-.82.055c-.992 0-2.03-.616-2.038-1.928v-4.607h-1.12v-.985h1.12V12.3h1.19v1.777h1.559z"
      ></path>
    </svg>
  )
}

export default AllResetText

import  {FC} from 'react'

const Heart: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 22 22"
      className={className}
      style={style}
    >
      <path
        d="M11.3333 6.43891e-06C10.6866 -0.00115996 10.0485 0.156158 9.46982 0.459447C8.89115 0.762736 8.38786 1.20363 8 1.74705C7.4747 1.01318 6.7429 0.471334 5.90817 0.198196C5.07344 -0.0749421 4.17804 -0.0655443 3.34868 0.22506C2.51931 0.515664 1.79798 1.07276 1.28676 1.81751C0.77553 2.56226 0.500295 3.45696 0.5 4.375C0.504424 5.07089 0.620147 5.76104 0.84234 6.41667H3.8138L4.75998 4.92644C4.81071 4.84653 4.87945 4.78101 4.96008 4.7357C5.04072 4.69038 5.13076 4.66667 5.22222 4.66667C5.31368 4.66667 5.40373 4.69038 5.48436 4.7357C5.565 4.78101 5.63373 4.84653 5.68446 4.92644L7.44444 7.69837L8.09332 6.67644C8.14404 6.59653 8.21278 6.53101 8.29342 6.48569C8.37405 6.44038 8.4641 6.41667 8.55556 6.41667H10.2222C10.3696 6.41667 10.5109 6.47813 10.6151 6.58752C10.7192 6.69692 10.7778 6.84529 10.7778 7C10.7778 7.15471 10.7192 7.30309 10.6151 7.41248C10.5109 7.52188 10.3696 7.58334 10.2222 7.58334H8.85287L7.90668 9.07357C7.85596 9.15348 7.78722 9.21899 7.70658 9.26431C7.62595 9.30962 7.5359 9.33333 7.44444 9.33333C7.35299 9.33333 7.26294 9.30962 7.1823 9.26431C7.10167 9.21899 7.03293 9.15348 6.98221 9.07357L5.22222 6.30163L4.57335 7.32357C4.52262 7.40348 4.45389 7.469 4.37325 7.51431C4.29262 7.55963 4.20257 7.58334 4.11111 7.58334H1.33221C3.18297 11.2153 7.49707 13.7895 7.72853 13.9256C7.81147 13.9744 7.90494 14 8 14C8.09506 14 8.18853 13.9744 8.27147 13.9256C9.54665 13.1414 10.7435 12.2245 11.8439 11.1888C14.2699 8.89619 15.5 6.6037 15.5 4.375C15.4987 3.21509 15.0594 2.10305 14.2782 1.28287C13.4971 0.462679 12.438 0.00132109 11.3333 6.43891e-06Z"
        fill="#9DA2A8"
      />
    </svg>
  )
}

export default Heart

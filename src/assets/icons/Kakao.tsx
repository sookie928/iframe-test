import React, {FC} from 'react'

const Kakao: FC<{style?: string}> = ({style}) => {
  return (
    <svg
      className={style}
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="16"
      fill="none"
      viewBox="0 0 18 16"
    >
      <path
        fill="#BDC6CB"
        d="M6.96 5.849l-.583 1.665h1.186L6.979 5.85 6.96 5.85z"
      ></path>
      <path
        fill="#BDC6CB"
        d="M8.707 0C3.899 0 0 3.082 0 6.884c0 2.475 1.652 4.643 4.13 5.857-.18.68-.656 2.462-.754 2.845-.118.474.173.468.364.34.15-.1 2.387-1.62 3.352-2.276.534.079 1.074.119 1.615.119 4.809 0 8.706-3.083 8.706-6.885C17.413 3.083 13.517 0 8.707 0zM4.42 8.773a.424.424 0 01-.422.423h-.09a.424.424 0 01-.422-.423v-3.05h-.83a.433.433 0 010-.866h2.547a.433.433 0 110 .866H4.42v3.05zm4.169.4a.421.421 0 01-.537-.257L7.838 8.3H6.101l-.216.616a.421.421 0 11-.794-.279l1.248-3.347a.466.466 0 01.025-.057c.05-.248.306-.437.616-.437.28 0 .514.154.595.366l.004.003L8.85 8.64a.421.421 0 01-.258.534H8.59zm2.733-.005h-1.73a.393.393 0 01-.386-.469.458.458 0 01-.007-.075V5.266a.47.47 0 11.94 0V8.38h1.183a.393.393 0 010 .787zm3.7-.055a.42.42 0 01-.587-.084l-1.248-1.638-.269.268v1.068a.472.472 0 01-.653.447.47.47 0 01-.287-.447V5.266a.472.472 0 01.654-.448.47.47 0 01.286.448v1.223l1.476-1.475a.415.415 0 11.587.586l-1.193 1.193 1.319 1.733a.42.42 0 01-.086.587z"
      ></path>
    </svg>
  )
}

export default Kakao

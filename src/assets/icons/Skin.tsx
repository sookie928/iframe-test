import React, {FC} from 'react'

const Skin: FC<{style?: string}> = ({style}) => {
  return (
    <svg
      className={style}
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      fill="none"
      viewBox="0 0 22 22"
    >
      <path
        fill="inherit"
        d="M16.965 5.503a.499.499 0 00-.468-.468C11.74 4.755 7.933 6.189 6.309 8.87a5.442 5.442 0 00-.797 3.062c.035.995.325 1.999.861 2.99l6.252-6.252a.499.499 0 01.705.705l-6.252 6.252c.991.536 1.995.826 2.99.861a5.434 5.434 0 003.062-.797c2.681-1.624 4.115-5.432 3.835-10.188z"
      ></path>
      <path
        fill="inherit"
        d="M6.567 15.262a8.77 8.77 0 01-.194-.34l-1.227 1.227a.499.499 0 00.705.705l1.228-1.227a8.765 8.765 0 01-.341-.194.498.498 0 01-.171-.171z"
      ></path>
    </svg>
  )
}

export default Skin

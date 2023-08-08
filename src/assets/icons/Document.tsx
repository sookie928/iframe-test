import React, {FC} from 'react'

const Document: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick, ...props}) => {
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
        d="M12.8333 0H1.16667C0.857311 0.000208797 0.560686 0.123192 0.341939 0.341939C0.123192 0.560686 0.000208797 0.857311 0 1.16667V12.8333C0.000208797 13.1427 0.123192 13.4393 0.341939 13.6581C0.560686 13.8768 0.857311 13.9998 1.16667 14H9.0918C9.24504 14.0003 9.39683 13.9702 9.5384 13.9116C9.67997 13.8529 9.80853 13.7668 9.91667 13.6582L13.6582 9.91667C13.7668 9.80853 13.8529 9.67997 13.9116 9.5384C13.9702 9.39683 14.0003 9.24504 14 9.0918V1.16667C13.9998 0.857311 13.8768 0.560686 13.6581 0.341939C13.4393 0.123192 13.1427 0.000208797 12.8333 0ZM4.66667 4.08333H9.33333C9.48804 4.08333 9.63642 4.14479 9.74581 4.25419C9.85521 4.36358 9.91667 4.51196 9.91667 4.66667C9.91667 4.82138 9.85521 4.96975 9.74581 5.07914C9.63642 5.18854 9.48804 5.25 9.33333 5.25H4.66667C4.51196 5.25 4.36358 5.18854 4.25419 5.07914C4.14479 4.96975 4.08333 4.82138 4.08333 4.66667C4.08333 4.51196 4.14479 4.36358 4.25419 4.25419C4.36358 4.14479 4.51196 4.08333 4.66667 4.08333ZM7 9.91667H4.66667C4.51196 9.91667 4.36358 9.85521 4.25419 9.74581C4.14479 9.63642 4.08333 9.48804 4.08333 9.33333C4.08333 9.17862 4.14479 9.03025 4.25419 8.92085C4.36358 8.81146 4.51196 8.75 4.66667 8.75H7C7.15471 8.75 7.30308 8.81146 7.41248 8.92085C7.52187 9.03025 7.58333 9.17862 7.58333 9.33333C7.58333 9.48804 7.52187 9.63642 7.41248 9.74581C7.30308 9.85521 7.15471 9.91667 7 9.91667ZM4.66667 7.58333C4.51196 7.58333 4.36358 7.52187 4.25419 7.41248C4.14479 7.30308 4.08333 7.15471 4.08333 7C4.08333 6.84529 4.14479 6.69692 4.25419 6.58752C4.36358 6.47812 4.51196 6.41667 4.66667 6.41667H9.33333C9.48804 6.41667 9.63642 6.47812 9.74581 6.58752C9.85521 6.69692 9.91667 6.84529 9.91667 7C9.91667 7.15471 9.85521 7.30308 9.74581 7.41248C9.63642 7.52187 9.48804 7.58333 9.33333 7.58333H4.66667ZM9.33333 12.5918V9.33219H12.5929L9.33333 12.5918Z"
        fill="#9DA2A8"
      />
    </svg>
  )
}

export default Document

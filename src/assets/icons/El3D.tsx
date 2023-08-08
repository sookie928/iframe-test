import React, {FC} from 'react'

const El3D: FC<{
  className?: string
  style?: any
  onClick?: any
  [key: string]: any
}> = ({className, style, onClick, ...props}) => {
  return (
    <svg
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      style={style}
      className={className}
      width="24"
      height="18"
      fill="none"
      viewBox="0 0 24 18"
    >
      <path
        fill="#fff"
        fillOpacity="0.5"
        d="M20 0H4a4 4 0 00-4 4v10a4 4 0 004 4h16a4 4 0 004-4V4a4 4 0 00-4-4z"
      ></path>
      <path
        fill="#2E2D31"
        d="M8.241 13c-.58 0-1.077-.075-1.49-.225-.412-.15-.744-.338-.996-.564a2.48 2.48 0 01-.566-.743A1.937 1.937 0 015 10.735c0-.067.021-.124.063-.169a.224.224 0 01.168-.079h1.741c.091 0 .161.02.21.057.049.03.094.079.136.146a.78.78 0 00.2.237c.084.06.185.105.304.135.119.023.262.034.43.034.3 0 .528-.072.682-.214a.782.782 0 00.23-.586c0-.24-.076-.413-.23-.519-.154-.112-.374-.169-.661-.169H7.035a.263.263 0 01-.2-.09.313.313 0 01-.073-.203v-.777c0-.105.018-.192.053-.26a.419.419 0 01.136-.157l1.584-1.206H5.703a.263.263 0 01-.2-.09.313.313 0 01-.073-.202v-1.33c0-.083.025-.15.074-.203A.263.263 0 015.703 5H10.8c.077 0 .14.03.189.09.056.053.084.12.084.203v1.194a.607.607 0 01-.053.26.359.359 0 01-.126.146L9.48 8.133l.042.022c.37.075.707.203 1.007.383.301.173.539.417.714.732.174.316.262.714.262 1.195 0 .51-.143.957-.43 1.34-.28.376-.665.67-1.154.88-.483.21-1.042.315-1.679.315zM12.706 12.887a.27.27 0 01-.189-.079.304.304 0 01-.084-.214V5.293c0-.083.028-.15.084-.203a.253.253 0 01.189-.09h2.874c.679 0 1.266.12 1.763.36.496.233.888.579 1.174 1.037.287.458.441 1.022.462 1.69.014.323.021.609.021.857s-.007.53-.021.845c-.028.706-.178 1.288-.451 1.746-.266.458-.643.8-1.133 1.026-.49.217-1.077.326-1.762.326h-2.927zm1.983-1.915h.891c.231 0 .427-.041.588-.124a.874.874 0 00.377-.383c.091-.18.14-.41.147-.688.007-.217.01-.413.01-.585a6.399 6.399 0 000-.519c0-.173-.003-.364-.01-.574-.014-.414-.126-.714-.335-.902-.203-.188-.48-.282-.83-.282h-.838v4.057z"
      ></path>
    </svg>
  )
}

export default El3D
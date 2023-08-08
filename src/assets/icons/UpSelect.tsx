import { FC } from 'react';

const UpSelect: FC<{ className?: string; onClick?: any; [key: string]: any }> = ({ className, onClick }) => {
  return (
    <svg
      className={className}
      onClick={onClick}
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="6"
      fill="none"
      viewBox="0 0 8 6"
    >
      <path fill="#525158" d="M4 0L.536 6h6.928L4 0z"></path>
    </svg>
  );
};

export default UpSelect;

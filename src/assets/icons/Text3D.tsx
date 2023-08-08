import  {FC} from 'react'

const Text3D: FC<{style?: string}> = ({style}) => {
  return (
    <svg
      className={style}
      xmlns="http://www.w3.org/2000/svg"
      width="113"
      height="56"
      fill="none"
      viewBox="0 0 113 56"
    >
      <path
        fill="#2E2D31"
        d="M38.732 22.089c9.845 2.333 14.767 7.7 14.767 16.1 0 3.526-1.16 6.637-3.48 9.333-2.267 2.697-5.437 4.797-9.508 6.3C36.438 55.274 31.825 56 26.672 56c-6.133 0-11.21-.855-15.23-2.567-3.969-1.763-6.88-3.889-8.736-6.377C.902 44.566 0 42.156 0 39.822c0-.518.155-.933.464-1.244A1.84 1.84 0 011.7 38.11h16.93c.568 0 1.16.311 1.779.934.721.673 1.443 1.166 2.165 1.477.721.26 2.113.39 4.174.39 1.959 0 3.428-.39 4.407-1.167.98-.778 1.469-1.764 1.469-2.956 0-2.282-1.985-3.422-5.953-3.422H16.39a2.001 2.001 0 01-1.47-.622 2.025 2.025 0 01-.618-1.478v-6.3c0-.726.155-1.348.464-1.867.31-.57.696-.985 1.16-1.244l11.364-5.912H5.644a2 2 0 01-1.47-.622 2.025 2.025 0 01-.618-1.477V2.877c0-.57.206-1.063.619-1.478A2 2 0 015.644.778h42.21a2 2 0 011.47.622c.412.415.618.907.618 1.478v9.878c0 1.192-.54 2.23-1.623 3.11l-9.587 6.223zM84.16.778c8.71 0 15.669 1.892 20.874 5.678 5.257 3.785 7.886 9.644 7.886 17.577v7.934c0 8.089-2.603 14-7.809 17.733-5.154 3.681-12.137 5.522-20.95 5.522H59.497a2.001 2.001 0 01-1.468-.622 2.025 2.025 0 01-.619-1.478V2.878c0-.57.206-1.063.619-1.478a2.001 2.001 0 011.468-.622H84.16zm.387 39.278c2.422 0 4.33-.57 5.72-1.712 1.444-1.192 2.166-2.851 2.166-4.977V22.633c0-2.126-.722-3.759-2.165-4.9-1.392-1.192-3.299-1.789-5.721-1.789h-7.035v24.112h7.035z"
      ></path>
    </svg>
  )
}

export default Text3D

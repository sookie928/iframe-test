import {FC} from 'react'

export const MENU_ENUM = {
  VIEW: 'view',
  WIREFRAME: 'wireframe',
  COLOR: 'color'
}

interface IGUIProps {
  [key: string]: any
}

const GUI: FC<IGUIProps> = () => {
  return <div></div>
}

export default GUI

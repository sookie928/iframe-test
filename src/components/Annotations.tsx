import { Html } from '@react-three/drei';
import { MouseEvent, ReactNode } from 'react';

function Annotations({
  onClick,
  children,
  ...props
}: {
  onClick: (e: MouseEvent) => void;
  children: ReactNode;
  name: string;
  [key: string]: any;
}) {
  return (
    <Html
      {...props}
      center
      zIndexRange={[0, 40]}
      // occlude="blending"
    >
      <div onClick={onClick} className="cursor-pointer" data-name={props.name}>
        {children}
      </div>
    </Html>
  );
}
export default Annotations;

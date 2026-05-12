import * as React from 'react';
import { Grow } from '@mui/material';
import { useInView } from './useInView';

export function Reveal({ children, delay = 0 }: React.PropsWithChildren<{ delay?: number }>) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref}>
      <Grow in={inView} timeout={700} style={{ transformOrigin: '0 0 0', transitionDelay: `${delay}ms` }}>
        <div style={{ transform: inView ? 'translateY(0px)' : 'translateY(18px)', transition: 'transform 700ms cubic-bezier(.2,.7,.2,1)' }}>{children}</div>
      </Grow>
    </div>
  );
}

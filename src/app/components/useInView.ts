import * as React from 'react';

export function useInView<T extends HTMLElement>(threshold = 0.18) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    if (!ref.current) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold }
    );

    io.observe(ref.current);
    return () => io.disconnect();
  }, [threshold]);

  return { ref, inView };
}

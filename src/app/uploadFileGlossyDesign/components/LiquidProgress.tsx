'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  progress: number;
}

const LiquidProgress: React.FC<Props> = ({ progress }) => {
  return (
    <div
      style={{
        width: 150,
        height: 150,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '3px solid #6c63ff',
        position: 'relative',
        margin: '0 auto',
      }}>
      <motion.div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          background: 'linear-gradient(180deg, #6c63ff, #9a8cff)',
        }}
        animate={{ height: `${progress}%` }}
        transition={{ ease: 'easeInOut', duration: 0.8 }}
      />
      <div
        style={{
          position: 'absolute',
          top: '40%',
          width: '100%',
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: 20,
        }}>
        {progress}%
      </div>
    </div>
  );
};

export default LiquidProgress;

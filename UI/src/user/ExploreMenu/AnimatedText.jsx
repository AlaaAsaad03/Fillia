import React from 'react';
import { motion } from 'framer-motion';

const AnimatedText = ({ text, className }) => {
    return (
        <div className={className}>
            {text.split('').map((letter, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                    {letter}
                </motion.span>
            ))}
        </div>
    );
};

export default AnimatedText;
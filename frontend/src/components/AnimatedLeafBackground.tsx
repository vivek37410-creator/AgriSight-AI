import { motion } from 'framer-motion'
import { Leaf, Sprout, CloudRain, Sun } from 'lucide-react'

const leaves = [
  { Icon: Leaf, color: 'text-nature-400', size: 24, left: '10%', top: '20%' },
  { Icon: Sprout, color: 'text-leaf-400', size: 20, left: '80%', top: '15%' },
  { Icon: Leaf, color: 'text-nature-300', size: 28, left: '70%', top: '60%' },
  { Icon: CloudRain, color: 'text-sky-300', size: 22, left: '20%', top: '70%' },
  { Icon: Sun, color: 'text-amber-300', size: 26, left: '50%', top: '10%' },
  { Icon: Leaf, color: 'text-leaf-300', size: 18, left: '30%', top: '40%' },
  { Icon: Sprout, color: 'text-nature-500', size: 22, left: '85%', top: '80%' },
  { Icon: Leaf, color: 'text-nature-400', size: 20, left: '5%', top: '55%' },
]

export default function AnimatedLeafBackground() {
  return (
    <motion.div
      className="fixed inset-0 -z-10 bg-gradient-to-br from-nature-50 via-nature-100 to-leaf-50 dark:from-nature-950 dark:via-nature-900 dark:to-leaf-950"
      animate={{
        backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'linear',
      }}
      style={{ backgroundSize: '400% 400%' }}
    >
      {leaves.map((leaf, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: leaf.left, top: leaf.top }}
          animate={{
            y: [0, -30 - i * 5, 0],
            x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 3), 0],
            rotate: [0, (i % 2 === 0 ? 1 : -1) * 15, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 6 + i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        >
          <leaf.Icon className={`${leaf.color}`} style={{ width: leaf.size, height: leaf.size }} />
        </motion.div>
      ))}
    </motion.div>
  )
}

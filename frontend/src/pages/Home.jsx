import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Upload, MessageSquare, FileText, GitCompareArrows, ArrowRight, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Upload,
    title: 'Upload Papers',
    desc: 'Drag & drop your research PDFs. We extract, chunk, and index them instantly.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: MessageSquare,
    title: 'Q&A with Citations',
    desc: 'Ask questions and get precise answers grounded in the paper — with page citations.',
    color: 'from-primary-500 to-purple-500',
  },
  {
    icon: FileText,
    title: 'Smart Summaries',
    desc: 'Generate structured summaries: Abstract, Methodology, and Results — in one click.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: GitCompareArrows,
    title: 'Compare Papers',
    desc: 'Compare two papers side-by-side across objectives, methods, results, and more.',
    color: 'from-amber-500 to-orange-500',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-primary-500/30 mb-8"
        >
          <Brain className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4"
        >
          <span className="gradient-text">PaperMind</span>{' '}
          <span className="text-white">AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="text-lg md:text-xl text-gray-400 max-w-2xl mb-8 leading-relaxed"
        >
          Your AI-powered research paper assistant. Upload papers, ask questions with
          <span className="text-primary-400 font-medium"> cited answers</span>, generate
          summaries, and compare papers — all in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-4"
        >
          <Link to="/dashboard" className="btn-primary flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5" />
            Get Started
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pb-24 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {features.map((f) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                variants={itemVariants}
                className="card glass-hover group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-100 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </section>
    </div>
  )
}

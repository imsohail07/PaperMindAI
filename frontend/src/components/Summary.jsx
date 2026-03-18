import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { summarizePaper } from '../services/api'

const sectionMeta = {
  abstract:    { label: 'Abstract',    color: 'from-blue-500 to-cyan-500',   bg: 'bg-blue-500/10' },
  methodology: { label: 'Methodology', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10' },
  results:     { label: 'Results',     color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10' },
}

function SectionCard({ sectionKey, text }) {
  const [open, setOpen] = useState(true)
  const meta = sectionMeta[sectionKey] || sectionMeta.abstract

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${meta.bg} flex items-center justify-center`}>
            <FileText className="w-4 h-4 text-white/80" />
          </div>
          <span className={`font-bold text-lg bg-gradient-to-r ${meta.color} bg-clip-text text-transparent`}>
            {meta.label}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-gray-300 leading-relaxed mt-4 pl-12">{text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function Summary({ papers }) {
  const [selectedPaper, setSelectedPaper] = useState('')
  const [summaries, setSummaries] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSummarize = async () => {
    if (!selectedPaper) return
    setLoading(true)
    setSummaries(null)

    try {
      const data = await summarizePaper(selectedPaper)
      setSummaries(data.summaries)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Summarization failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-1">Paper Summary</h2>
        <p className="text-gray-400 text-sm">Generate section-wise summaries of your paper.</p>
      </div>

      <div className="flex gap-3">
        <select
          id="summary-paper-select"
          value={selectedPaper}
          onChange={(e) => setSelectedPaper(e.target.value)}
          className="input-field flex-1"
        >
          <option value="">Select a paper…</option>
          {papers.map((p) => (
            <option key={p.filename} value={p.filename.replace('.pdf', '')}>
              {p.filename}
            </option>
          ))}
        </select>

        <button
          id="summarize-btn"
          onClick={handleSummarize}
          disabled={!selectedPaper || loading}
          className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Summarize
        </button>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {/* Section cards */}
      {summaries && (
        <div className="space-y-4">
          {Object.entries(sectionMeta).map(([key]) => (
            <SectionCard key={key} sectionKey={key} text={summaries[key] || 'Not available.'} />
          ))}
        </div>
      )}
    </div>
  )
}

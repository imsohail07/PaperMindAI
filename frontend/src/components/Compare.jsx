import { useState } from 'react'
import { motion } from 'framer-motion'
import { GitCompareArrows, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { comparePapers } from '../services/api'

const featureLabels = {
  objective:   'Objective',
  methodology: 'Methodology',
  dataset:     'Dataset',
  results:     'Results',
  advantages:  'Advantages',
  limitations: 'Limitations',
}

export default function Compare({ papers }) {
  const [paper1, setPaper1] = useState('')
  const [paper2, setPaper2] = useState('')
  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCompare = async () => {
    if (!paper1 || !paper2) return
    if (paper1 === paper2) {
      toast.error('Please select two different papers.')
      return
    }
    setLoading(true)
    setComparison(null)

    try {
      const data = await comparePapers(paper1, paper2)
      setComparison(data.comparison)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Comparison failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-1">Compare Papers</h2>
        <p className="text-gray-400 text-sm">Select two papers to see a structured comparison.</p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Paper 1</label>
          <select
            id="compare-paper1"
            value={paper1}
            onChange={(e) => setPaper1(e.target.value)}
            className="input-field"
          >
            <option value="">Select paper…</option>
            {papers.map((p) => (
              <option key={p.filename} value={p.filename.replace('.pdf', '')}>
                {p.filename}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Paper 2</label>
          <select
            id="compare-paper2"
            value={paper2}
            onChange={(e) => setPaper2(e.target.value)}
            className="input-field"
          >
            <option value="">Select paper…</option>
            {papers.map((p) => (
              <option key={p.filename} value={p.filename.replace('.pdf', '')}>
                {p.filename}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        id="compare-btn"
        onClick={handleCompare}
        disabled={!paper1 || !paper2 || loading}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitCompareArrows className="w-4 h-4" />}
        Compare
      </button>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="skeleton h-14 rounded-xl" />
          ))}
        </div>
      )}

      {/* Comparison table */}
      {comparison && !comparison.raw_comparison && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden p-0"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-4 font-semibold text-gray-400 uppercase text-xs tracking-wide">
                    Feature
                  </th>
                  <th className="text-left px-5 py-4 font-semibold text-primary-400 uppercase text-xs tracking-wide">
                    Paper 1
                  </th>
                  <th className="text-left px-5 py-4 font-semibold text-purple-400 uppercase text-xs tracking-wide">
                    Paper 2
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(featureLabels).map(([key, label], idx) => (
                  <tr
                    key={key}
                    className={`border-b border-white/5 ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                  >
                    <td className="px-5 py-4 font-medium text-gray-300">{label}</td>
                    <td className="px-5 py-4 text-gray-400 leading-relaxed">
                      {comparison[key]?.paper1 || 'N/A'}
                    </td>
                    <td className="px-5 py-4 text-gray-400 leading-relaxed">
                      {comparison[key]?.paper2 || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Raw fallback */}
      {comparison?.raw_comparison && (
        <div className="card">
          <p className="text-sm text-gray-300 whitespace-pre-wrap">{comparison.raw_comparison}</p>
        </div>
      )}
    </div>
  )
}

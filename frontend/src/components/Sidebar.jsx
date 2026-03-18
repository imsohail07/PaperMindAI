import { motion } from 'framer-motion'
import { Upload, MessageSquare, FileText, GitCompareArrows } from 'lucide-react'

const tabs = [
  { id: 'upload',  label: 'Upload',  icon: Upload },
  { id: 'chat',    label: 'Chat',    icon: MessageSquare },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'compare', label: 'Compare', icon: GitCompareArrows },
]

export default function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="w-64 shrink-0 glass rounded-2xl p-4 flex flex-col gap-2 h-fit sticky top-24">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 px-3">
        Tools
      </h2>
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <motion.button
            key={tab.id}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-primary-500/20 text-primary-300 shadow-md shadow-primary-500/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"
              />
            )}
          </motion.button>
        )
      })}
    </aside>
  )
}

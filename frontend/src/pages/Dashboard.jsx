import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Sidebar from '../components/Sidebar'
import Upload from '../components/Upload'
import Chat from '../components/Chat'
import Summary from '../components/Summary'
import Compare from '../components/Compare'
import { listPapers } from '../services/api'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('upload')
  const [papers, setPapers] = useState([])

  const fetchPapers = useCallback(async () => {
    try {
      const list = await listPapers()
      setPapers(list)
    } catch {
      // silently fail — papers list will be empty
    }
  }, [])

  useEffect(() => {
    fetchPapers()
  }, [fetchPapers])

  const handleUploadSuccess = () => {
    fetchPapers()
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <Upload onUploadSuccess={handleUploadSuccess} />
      case 'chat':
        return <Chat papers={papers} />
      case 'summary':
        return <Summary papers={papers} />
      case 'compare':
        return <Compare papers={papers} />
      default:
        return <Upload onUploadSuccess={handleUploadSuccess} />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex gap-6">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 min-w-0"
        >
          {renderContent()}
        </motion.main>
      </div>
    </div>
  )
}

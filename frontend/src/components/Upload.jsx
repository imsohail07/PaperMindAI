import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudUpload, FileText, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadPDF } from '../services/api'

export default function Upload({ onUploadSuccess }) {
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [result, setResult] = useState(null)

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) {
      toast.error('Only PDF files are allowed.')
      return
    }
    if (accepted.length > 0) {
      setFile(accepted[0])
      setStatus('idle')
      setProgress(0)
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    multiple: false,
  })

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(0)

    try {
      const data = await uploadPDF(file, setProgress)
      setStatus('success')
      setResult(data)
      toast.success(data.message || 'Paper uploaded and indexed!')
      if (onUploadSuccess) onUploadSuccess()
    } catch (err) {
      setStatus('error')
      const msg = err.response?.data?.detail || err.message || 'Upload failed.'
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold gradient-text mb-1">Upload Paper</h2>
        <p className="text-gray-400 text-sm">Upload a research paper PDF to analyze, summarize, and explore.</p>
      </div>

      {/* Drop Zone */}
      <motion.div
        {...getRootProps()}
        whileHover={{ scale: 1.01 }}
        className={`card cursor-pointer border-2 border-dashed transition-all duration-300 text-center py-16 ${
          isDragActive
            ? 'border-primary-400 bg-primary-500/10'
            : 'border-white/10 hover:border-primary-500/40'
        }`}
      >
        <input {...getInputProps()} id="pdf-upload-input" />
        <CloudUpload className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-primary-400' : 'text-gray-500'}`} />
        <p className="text-gray-300 font-medium">
          {isDragActive ? 'Drop your PDF here…' : 'Drag & drop a PDF, or click to select'}
        </p>
        <p className="text-gray-500 text-xs mt-2">Max file size: 50 MB</p>
      </motion.div>

      {/* File preview */}
      <AnimatePresence>
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {status === 'success' && <CheckCircle2 className="w-5 h-5 text-green-400" />}
            {status === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      {status === 'uploading' && (
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Upload button */}
      <button
        id="upload-btn"
        onClick={handleUpload}
        disabled={!file || status === 'uploading'}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === 'uploading' ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <CloudUpload className="w-4 h-4" />
            Upload & Index
          </>
        )}
      </button>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-green-500/5 border-green-500/20"
          >
            <p className="text-green-300 text-sm font-medium mb-2">✓ Indexed successfully</p>
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
              <div>Pages: <span className="text-gray-200 font-medium">{result.pages}</span></div>
              <div>Chunks: <span className="text-gray-200 font-medium">{result.chunks}</span></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

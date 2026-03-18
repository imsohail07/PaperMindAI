import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, AlertCircle, FileText } from 'lucide-react'
import { useChat } from '../hooks/useChat'

export default function Chat({ papers }) {
  const [selectedPaper, setSelectedPaper] = useState('')
  const [input, setInput] = useState('')
  const { messages, isLoading, sendMessage, clearChat } = useChat()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim() || !selectedPaper || isLoading) return
    sendMessage(selectedPaper, input.trim())
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-1">Chat with Paper</h2>
          <p className="text-gray-400 text-sm">Ask questions — get answers with citations.</p>
        </div>
        <button onClick={clearChat} className="btn-secondary text-xs py-2 px-4">
          Clear
        </button>
      </div>

      {/* Paper selector */}
      <select
        id="paper-select"
        value={selectedPaper}
        onChange={(e) => setSelectedPaper(e.target.value)}
        className="input-field mb-4"
      >
        <option value="">Select a paper…</option>
        {papers.map((p) => (
          <option key={p.filename} value={p.filename.replace('.pdf', '')}>
            {p.filename}
          </option>
        ))}
      </select>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Select a paper and ask a question to begin.</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary-400" />
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary-500/20 text-gray-100'
                    : msg.isError
                      ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                      : 'glass text-gray-200'
                }`}
              >
                {msg.isError && <AlertCircle className="w-4 h-4 inline mr-1 text-red-400" />}
                <span className="whitespace-pre-wrap">{msg.content}</span>

                {/* Citations */}
                {msg.citations?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-1">
                    <p className="text-xs font-semibold text-primary-400 mb-1">Citations:</p>
                    {msg.citations.map((c, j) => (
                      <div key={j} className="flex items-center gap-1.5 text-xs text-gray-400">
                        <FileText className="w-3 h-3" />
                        {c.source} — Page {c.page}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-400" />
            </div>
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          id="chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={selectedPaper ? 'Ask a question…' : 'Select a paper first'}
          disabled={!selectedPaper || isLoading}
          className="input-field flex-1"
        />
        <button
          id="chat-send-btn"
          type="submit"
          disabled={!input.trim() || !selectedPaper || isLoading}
          className="btn-primary px-5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

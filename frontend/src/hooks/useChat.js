import { useState, useCallback } from 'react'
import { askQuestion } from '../services/api'

export function useChat() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (paperName, question) => {
    // Add user message
    const userMsg = { role: 'user', content: question, timestamp: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setIsLoading(true)

    try {
      const result = await askQuestion(paperName, question)
      const aiMsg = {
        role: 'assistant',
        content: result.answer,
        citations: result.citations || [],
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `Error: ${err.response?.data?.detail || err.message || 'Something went wrong.'}`,
        isError: true,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearChat = useCallback(() => setMessages([]), [])

  return { messages, isLoading, sendMessage, clearChat }
}

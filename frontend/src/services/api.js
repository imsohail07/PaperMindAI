import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120_000, // 2 min for LLM calls
  headers: { 'Content-Type': 'application/json' },
})

// ── Upload ──────────────────────────────────────────────────────────────────
export async function uploadPDF(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
  return data
}

// ── Query ───────────────────────────────────────────────────────────────────
export async function askQuestion(paperName, question) {
  const { data } = await api.post('/query', {
    paper_name: paperName,
    question,
  })
  return data
}

// ── Summarize ───────────────────────────────────────────────────────────────
export async function summarizePaper(paperName) {
  const { data } = await api.post('/summarize', {
    paper_name: paperName,
  })
  return data
}

// ── Compare ─────────────────────────────────────────────────────────────────
export async function comparePapers(paper1, paper2) {
  const { data } = await api.post('/compare', {
    paper1,
    paper2,
  })
  return data
}

// ── List papers ─────────────────────────────────────────────────────────────
export async function listPapers() {
  const { data } = await api.get('/papers')
  return data.papers
}

export default api

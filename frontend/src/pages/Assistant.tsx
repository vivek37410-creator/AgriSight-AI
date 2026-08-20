import { useState, useEffect, useRef } from 'react'
import { Send, Loader2, Leaf, FlaskConical, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { queryAssistant } from '../services/assistant'
import { useAuth } from '../lib/auth'
import { useFarms } from '../hooks/useFarms'
import { useLeafAnalyses } from '../hooks/useLeafAnalyses'
import { ChatMessage, AssistantResponse, AlternativeMatch } from '../types/assistant'
import { formatDate } from '../utils/formatters'

export default function Assistant() {
  const { user } = useAuth()
  const { data: farms } = useFarms()
  const { t } = useTranslation()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: "Hello! I'm the AgriSight Assistant. Ask me anything about crops, diseases, irrigation, soil, fertilizers, or pests. I'll search the AgriSight knowledge base for the best answer.", timestamp: new Date().toISOString() }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedFarm, setSelectedFarm] = useState<number | ''>('')
  const [selectedCrop, setSelectedCrop] = useState<string>('')
  const [lastAlternatives, setLastAlternatives] = useState<AssistantResponse['alternatives']>(null)
  const [showAlternatives, setShowAlternatives] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { data: leafAnalyses } = useLeafAnalyses(selectedFarm ? Number(selectedFarm) : undefined)

  const latestLeaf = leafAnalyses?.[0]
  const detectedCrop = latestLeaf?.crop || selectedCrop

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date().toISOString() }
    setMessages((m) => [...m, userMsg])
    setLoading(true)
    setLastAlternatives(null)
    setShowAlternatives(false)
    try {
      const res = await queryAssistant(input, selectedFarm ? Number(selectedFarm) : undefined, detectedCrop || undefined)
      let content = res.answer || "I couldn't find a reliable answer in the AgriSight knowledge base."
      if (res.recommendation) {
        content += `\n\n💡 Recommendation\n${res.recommendation}`
      }
      if (res.severity && res.severity !== 'Low') {
        content += `\n\n⚠️ Severity: ${res.severity}`
      }
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content, timestamp: new Date().toISOString() }
      setMessages((m) => [...m, assistantMsg])
      setLastAlternatives(res.alternatives)
    } catch {
      const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: "I couldn't connect to the knowledge base. Please try again.", timestamp: new Date().toISOString() }
      setMessages((m) => [...m, assistantMsg])
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  const handleAlternativeSelect = (alt: AlternativeMatch) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: `Show me more about: ${alt.topic} (${alt.crop})`, timestamp: new Date().toISOString() }
    setMessages((m) => [...m, userMsg])
    setLoading(true)
    setShowAlternatives(false)
    queryAssistant(alt.topic, selectedFarm ? Number(selectedFarm) : undefined, alt.crop)
      .then((res) => {
        let content = res.answer || "No additional details found."
        if (res.recommendation) {
          content += `\n\n💡 Recommendation\n${res.recommendation}`
        }
        if (res.severity && res.severity !== 'Low') {
          content += `\n\n⚠️ Severity: ${res.severity}`
        }
        const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content, timestamp: new Date().toISOString() }
        setMessages((m) => [...m, assistantMsg])
      })
      .catch(() => {
        const assistantMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: "I couldn't load that alternative. Please try again.", timestamp: new Date().toISOString() }
        setMessages((m) => [...m, assistantMsg])
      })
      .finally(() => setLoading(false))
  }

  const quickQuestions = [
    "How often should I irrigate?",
    "What are common pests?",
    "What fertilizer should I use?",
    "How do I improve soil health?",
    "What are signs of nutrient deficiency?",
    "How does weather affect my crop?",
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Leaf className="h-6 w-6 text-green-600" />
          AgriSight Assistant
        </h1>
        <Badge variant="success" className="text-xs">Excel Knowledge Base</Badge>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-sm text-gray-600 dark:text-gray-300">{t('Select Farm:')}</label>
        <select className="rounded-lg border border-gray-300 dark:border-gray-600 p-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100" value={selectedFarm} onChange={(e) => setSelectedFarm(e.target.value ? Number(e.target.value) : '')}>
          <option value="">{t('Select a farm')}</option>
          {farms?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        {detectedCrop && (
          <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-lg">
            <FlaskConical className="h-3 w-3" />
            {detectedCrop}
          </div>
        )}
      </div>

      {latestLeaf && (
        <Card className="border-green-100 bg-green-50/60 dark:border-green-900 dark:bg-green-900/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Leaf className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">{t('Latest Leaf Analysis')}</p>
              <p className="text-xs text-green-700 dark:text-green-300">{latestLeaf.condition?.replace(/_/g, ' ')} — {latestLeaf.health_status} — {latestLeaf.risk_level} {t('Risk')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5 space-y-4 h-[420px] overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 ${msg.role === 'user' ? 'bg-green-700 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'}`}>
                <p className="text-sm whitespace-pre-line">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-green-100' : 'text-gray-500 dark:text-gray-400'}`}>{formatDate(msg.timestamp)}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-gray-600 dark:text-gray-300" />
                <span className="text-xs text-gray-600 dark:text-gray-300">Searching knowledge base...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {lastAlternatives && lastAlternatives.length > 0 && (
        <Card className="border-blue-100 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <button onClick={() => setShowAlternatives(!showAlternatives)} className="flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-100 w-full">
              {showAlternatives ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Other possible matches ({lastAlternatives.length})
            </button>
            {showAlternatives && (
              <div className="mt-3 space-y-2">
                {lastAlternatives.map((alt) => (
                  <button key={alt.id} onClick={() => handleAlternativeSelect(alt)} className="w-full text-left rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 p-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{alt.crop} → {alt.topic}</span>
                      <Badge variant="primary" className="text-xs">{Math.round(alt.confidence * 100)}%</Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {quickQuestions.map((q) => (
          <button key={q} onClick={() => setInput(q)} className="text-xs rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-gray-700 dark:text-gray-300 hover:border-green-300 dark:hover:border-green-700 hover:text-green-700 dark:hover:text-green-300 transition-colors">
            {q}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={t('Ask about crops, diseases, irrigation...')} disabled={loading} className="flex-1" />
        <Button onClick={handleSend} disabled={!input.trim() || loading}><Send className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

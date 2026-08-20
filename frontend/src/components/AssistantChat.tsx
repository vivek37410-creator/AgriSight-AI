import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'
import { ChatMessage } from '../types'
import { cn } from '../lib/utils'

interface AssistantChatProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  loading?: boolean
  farmSelector?: React.ReactNode
  className?: string
}

export default function AssistantChat({ messages, onSendMessage, loading = false, farmSelector, className }: AssistantChatProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onSendMessage(input.trim())
    setInput('')
  }

  const predefinedQuestions = [
    'What is the current health status of my farm?',
    'When should I irrigate next?',
    'Are there any pest risks detected?',
    'What are the recent weather forecasts?',
  ]

  return (
    <Card className={cn('flex h-[600px] flex-col', className)}>
      <div className="border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-deep-green">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal">AgriSight Assistant</h3>
              <p className="text-sm text-gray-500">Ask anything about your farm</p>
            </div>
          </div>
          {farmSelector && <div>{farmSelector}</div>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => onSendMessage(q)}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:border-deep-green hover:text-deep-green"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            {message.role === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-deep-green">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                message.role === 'user'
                  ? 'bg-deep-green text-white'
                  : 'bg-gray-100 text-charcoal'
              )}
            >
              {message.content}
            </div>
            {message.role === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-deep-green">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-lg bg-gray-100 px-4 py-2">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="border-t border-gray-100 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your farm..."
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  )
}


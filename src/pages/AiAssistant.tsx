import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Olá! Sou o Assistente Clínico IA da Poseidon. Fui treinado nos protocolos internacionais de triagem (como Manchester) e diretrizes de telemedicina offshore. Como posso ajudar no plantão hoje?',
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      let replyContent =
        'De acordo com os protocolos de saúde ocupacional marítima, recomendo avaliar os sinais vitais completos e manter o tripulante em observação. Se houver piora no quadro, classifique como Urgente (Amarelo) e solicite teleconsulta.'

      const lower = userMsg.content.toLowerCase()
      if (lower.includes('dor no peito') || lower.includes('infarto')) {
        replyContent =
          '🚨 ALERTA: Sintomas sugestivos de Síndrome Coronariana Aguda. Classificação sugerida: EMERGÊNCIA (Vermelho). Ações imediatas: \n\n1. Monitoramento contínuo (ECG, O2, PA).\n2. Administrar AAS (se não houver contraindicação e conforme protocolo médico da embarcação).\n3. Acionar telemedicina/médico em terra IMEDIATAMENTE.\n4. Preparar para possível MEDEVAC.'
      } else if (lower.includes('corte') || lower.includes('sangramento')) {
        replyContent =
          'Classificação sugerida: URGENTE (Amarelo) ou MUITO URGENTE (Laranja), dependendo do volume de sangramento.\n\nAções: \n1. Aplique pressão direta sobre o ferimento com gaze estéril.\n2. Eleve o membro afetado.\n3. Avalie a necessidade de sutura ou curativo compressivo.\n4. Verifique a validade da vacina antitetânica do tripulante no módulo de "Certificações" do prontuário.'
      }

      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: replyContent },
      ])
      setIsTyping(false)
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0 max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suporte Médico IA</h1>
          <p className="text-muted-foreground text-sm">
            Apoio à decisão clínica baseado em protocolos offshore.
          </p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col shadow-sm border-blue-100 overflow-hidden">
        <CardHeader className="border-b bg-blue-50/50 py-3">
          <CardTitle className="text-base flex items-center gap-2 text-blue-900">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Sessão Ativa - Confidencial
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'ml-auto bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-800',
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'assistant' ? (
                  <Bot className="w-4 h-4 text-blue-600" />
                ) : (
                  <User className="w-4 h-4 opacity-70" />
                )}
                <span className="font-semibold text-xs opacity-70">
                  {msg.role === 'assistant' ? 'IA Poseidon' : 'Enfermeiro(a)'}
                </span>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
          ))}
          {isTyping && (
            <div className="flex w-max max-w-[85%] flex-col gap-2 rounded-lg px-4 py-3 text-sm bg-slate-100 text-slate-800">
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs font-medium">Analisando protocolos...</span>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t p-3 bg-slate-50">
          <form
            className="flex w-full items-center space-x-2"
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
          >
            <Input
              placeholder="Descreva o caso clínico, ex: 'Paciente relata dor no peito irradiando para o braço esquerdo...'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white"
              disabled={isTyping}
            />
            <Button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </CardFooter>
      </Card>

      <p className="text-center text-xs text-muted-foreground mt-2">
        A IA serve como apoio à decisão. Casos graves devem seguir o fluxo estabelecido pelo médico
        responsável em terra.
      </p>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QrCode, ScanLine, Link as LinkIcon } from 'lucide-react'

export default function Scanner() {
  const [simulatedUrl, setSimulatedUrl] = useState('')
  const navigate = useNavigate()

  const handleSimulateScan = () => {
    if (!simulatedUrl) return
    try {
      const url = new URL(simulatedUrl)
      navigate(url.pathname + url.search)
    } catch {
      alert('URL inválida. Simule colando o link do QR Code gerado nas etiquetas dos Kits.')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto w-full h-full flex flex-col items-center justify-center">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-4 tracking-tight">
          <ScanLine className="h-10 w-10 text-primary" />
          Scanner Inteligente
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Aponte a câmera para a etiqueta QR do Kit para abrir a ficha técnica imediatamente.
        </p>
      </div>

      <Card className="w-full max-w-md shadow-lg border-primary/20">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto bg-primary/10 p-5 rounded-2xl mb-6 shadow-inner">
            <QrCode className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-2xl">Leitura Dinâmica</CardTitle>
          <CardDescription className="text-base mt-2">
            Centralize o QR Code no visor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 p-8">
          <div className="aspect-square bg-slate-900 rounded-xl border-2 border-dashed border-slate-600 flex items-center justify-center relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/30 to-transparent translate-y-[-100%] animate-[scan_2.5s_ease-in-out_infinite]" />
            <span className="text-slate-400 font-medium tracking-widest uppercase text-sm">
              Câmera Ativa
            </span>

            {/* Corner markers */}
            <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
            <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
            <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
            <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
          </div>

          <div className="pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3 font-medium flex items-center gap-2">
              <LinkIcon className="h-4 w-4" /> Simulador de Escaneamento
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Cole a URL embutida no QR Code..."
                value={simulatedUrl}
                onChange={(e) => setSimulatedUrl(e.target.value)}
                className="bg-muted/50"
              />
              <Button onClick={handleSimulateScan} className="px-6">
                Ler
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  )
}

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainProvider } from '@/stores/useMainStore'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/hooks/use-auth'
import { AuthGuard } from '@/components/AuthGuard'
import Layout from '@/components/Layout'
import Index from '@/pages/Index'
import Login from '@/pages/Login'
import Crew from '@/pages/Crew'
import Consultations from '@/pages/Consultations'
import Inventory from '@/pages/Inventory'
import Equipments from '@/pages/Equipments'
import Occurrences from '@/pages/Occurrences'
import Audits from '@/pages/Audits'
import Reports from '@/pages/Reports'
import Scanner from '@/pages/Scanner'
import BI from '@/pages/BI'
import AiAssistant from '@/pages/AiAssistant'
import MedicalChest from '@/pages/MedicalChest/index'
import MedicalChestNew from '@/pages/MedicalChest/NewCertificate'
import MedicalChestPrint from '@/pages/MedicalChest/CertificatePrint'
import NotFound from '@/pages/NotFound'

function App() {
  return (
    <AuthProvider>
      <MainProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<AuthGuard />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="crew" element={<Crew />} />
                  <Route path="consultations" element={<Consultations />} />
                  <Route path="inventory" element={<Inventory />} />
                  <Route path="equipments" element={<Equipments />} />
                  <Route path="audits" element={<Audits />} />
                  <Route path="occurrences" element={<Occurrences />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="scanner" element={<Scanner />} />
                  <Route path="bi" element={<BI />} />
                  <Route path="ai-assistant" element={<AiAssistant />} />
                  <Route path="medical-chest" element={<MedicalChest />} />
                  <Route path="medical-chest/new" element={<MedicalChestNew />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="print/certificate/:id" element={<MedicalChestPrint />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </MainProvider>
    </AuthProvider>
  )
}
export default App

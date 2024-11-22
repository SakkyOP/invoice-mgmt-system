import { ThemeProvider } from "next-themes"
import InvoiceTable from './components/InvoiceTable'

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto py-10">
          <InvoiceTable />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App

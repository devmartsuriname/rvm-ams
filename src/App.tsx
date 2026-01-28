import AppProvidersWrapper from './components/wrapper/AppProvidersWrapper'
import AppRouter from './routes/router'
import '@/assets/scss/style.scss'

// Phase 2: Fake backend disabled - using Supabase auth

function App() {
  return (
    <>
      <AppProvidersWrapper>
        <AppRouter />
      </AppProvidersWrapper>
    </>
  )
}

export default App
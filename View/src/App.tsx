// import './index.css'
import { Editor } from './components'
import Main from './components/Main';
import { ThemeProvider } from '@mui/material';
import theme from './theme';

//uvicorn main:app --host 0.0.0.0 --port 8000

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Main />
    </ThemeProvider>
  )
}

export default App

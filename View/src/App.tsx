// import './index.css'
import { Editor } from './components'
import Main from './components/Main';
import { ThemeProvider } from '@mui/material';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Main />
    </ThemeProvider>
  )
}

export default App

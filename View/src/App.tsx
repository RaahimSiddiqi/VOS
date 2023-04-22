// import './index.css'
import { Editor } from './components'

import { ThemeProvider } from '@mui/material';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Editor/>
    </ThemeProvider>
  )
}

export default App

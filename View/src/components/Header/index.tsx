import {AppBar, Toolbar, Typography, Button } from '@mui/material';

const Header = () => {
    return ( 
        <AppBar position='static' sx={{m: 0, bgcolor:'#0093AB'}}>
            <Toolbar>       
                <Typography variant="h5" component='div' sx={{flexGrow:1}}>Seer</Typography>
                <Button variant="outlined" color="inherit" >Login</Button>
            </Toolbar>
        </AppBar>
     );
}
 
export default Header;
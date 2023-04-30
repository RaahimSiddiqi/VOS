import {AppBar, Toolbar, Typography, Button, CssBaseline } from '@mui/material';
import { Auth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../firebase-config';
const Header = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            setIsAuthenticated(!!user);
        });
    }, [])

    const SignOut = (auth: Auth) => {
        signOut(auth);
        navigate("/");
    }

    return ( 
        <>
            <CssBaseline />
            <AppBar position='static'>
                <Toolbar>       
                    <Typography component={Link} to="/" variant="h5" sx={{color:"white", textDecoration:"None", flexGrow:1}}>Seer</Typography>
                    {isAuthenticated ?
                    <>
                    <Typography paddingRight={1}>Welcome, {auth.currentUser?.email}</Typography>
                    <Button variant="outlined" color="inherit" onClick={() => SignOut(auth)}>Logout</Button>
                    </>
                    :
                    <Button variant="outlined" color="inherit" onClick={() => navigate("/login")}>Login</Button>
                    }
                    </Toolbar>
            </AppBar>
        </>
     );
}
 
export default Header;
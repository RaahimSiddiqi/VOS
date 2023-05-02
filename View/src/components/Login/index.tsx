import React , { useState }  from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Paper, Avatar, TextField, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import * as yup from "yup";
import { auth } from '../../firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import GoogleButton from 'react-google-button';

const validationSchema = yup.object({
    firstName: yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('This field is required'),
   lastName: yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('This field is required'),
    dateOfBirth: yup.string()
        .required('This field is required'),
    email: yup
      .string()
      .email('Enter a valid email')
      .required('This field is required'),
    password: yup
      .string()
      .min(8, 'Must have a minimum of 8 characters')
      .required('This field is required'),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), undefined], 'Passwords do not match')
      .required('This field is required'),
  });




const Login = (props) => {
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
              firstName : '',
              lastName : '',
              dateOfBirth : '',
              email: '',
              password: '',
              confirmPassword: ''
          },
          validationSchema: validationSchema,
          onSubmit: (values) => {
              //do something
          },
      });


    const SignUp = () => 
    {
        formik.handleSubmit();
        createUserWithEmailAndPassword(auth, formik.values.email, formik.values.password).then((response)=>{
            console.log("sign up successful");
            console.log(auth);
            navigate("/");
        })
        .catch((err) => {
            console.log(err);
        })
    }

    const SignIn = () =>
    {
        formik.handleSubmit();
        signInWithEmailAndPassword(auth, formik.values.email, formik.values.password).then((response)=>{
            if (response) {
                console.log("sign in successful");
                console.log(auth)
                navigate("/");
            }
        })
        .catch((err) => {
            console.log(err.code);
            if (err.code == "auth/wrong-password")
                formik.setErrors({"password": "Incorrect password"})
            else if (err.code == "auth/user-not-found")
                formik.setErrors({"email": "User not found"})
        })
    }

    const GoogleSignIn = () => {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
        navigate("/")
    }

    
    return ( 
        <Grid>
            <Paper 
                elevation = {10} 
                color = "primary"
                className="paper-style" 
                sx={{
                    padding: '20px',
                    height: 'auto',
                    width: '340px',
                    margin: '40px auto',
                    borderRadius: 5,
                    marginTop: 5
                }}
            >
            <Grid align="center" sx={{marginBottom: 2}}>
                <Avatar style = {{margin: 10}}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography variant="h4" >
                    {isRegister ? "Sign Up" : "Sign In"}
                </Typography>
            </Grid>
            {
                isRegister &&
                    <>
                        <TextField
                            {...formik.getFieldProps('firstName')}
                            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                            helperText={formik.touched.firstName && formik.errors.firstName} 
                            id="firstName"
                            name="firstName"
                            label="First Name" 
                            type="text"
                            variant="outlined" 
                            placeholder="First name"
                            autoComplete='off'
                            sx={{marginBottom: 1, marginTop: 1, maxWidth: '48%', marginRight: '2%'}}
                        />
                        <TextField
                            {...formik.getFieldProps('lastName')}
                            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                            helperText={formik.touched.lastName && formik.errors.lastName} 
                            id="lastName"
                            name="lastName"
                            label="Last Name" 
                            type="text"
                            variant="outlined" 
                            placeholder="Last name"
                            autoComplete='off'
                            sx={{marginBottom: 1, marginTop: 1, maxWidth: '48%', marginLeft: '2%'}}
                        />
                        <TextField
                            {...formik.getFieldProps('dateOfBirth')}
                            id="dob"
                            type="date"
                            defaultValue=""
                            sx={{ width: '48%', marginTop: 1, marginBottom: 1 }}
                        />    
                    </>
            }
     
                    <TextField
                        {...formik.getFieldProps('email')}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email} 
                        id="email"
                        name="email"
                        label="Email" 
                        type="email"
                        variant="outlined" 
                        placeholder="Enter your email"
                        fullWidth
                        autoComplete='off'
                        required
                        sx={{marginBottom: 1, marginTop: 1}}
                    />

                    <TextField
                        {...formik.getFieldProps('password')}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password} 
                        id="password"
                        name="password"
                        label="Password" 
                        type="password"
                        variant="outlined" 
                        placeholder="Enter your password"
                        fullWidth
                        autoComplete='off'
                        required
                        sx={{marginBottom: 1, marginTop: 1}}
                        />
                    { 
                        isRegister && 
                        <TextField
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm Password" 
                        type="password"
                        placeholder="Enter your email"
                        variant="outlined" 
                        fullWidth
                        autoComplete='off'
                        required
                            sx={{marginBottom: 1, marginTop: 1}}
                        /> 
                    }

                        
                        <Button id="register" onClick={isRegister ? SignUp : SignIn}>
                            {isRegister ? "Sign Up" : "Sign In"}
                        </Button>

                        <Box>
                            <Typography variant='subtitle1' sx={{marginTop: 1}}>
                                {isRegister ? "Already have an account?" : "Don't have an account?"} <br></br>
                                <Button variant="text" onClick={() => {setIsRegister(!isRegister)}}>{isRegister ? "Sign In" : "Create One"}</Button>
                            </Typography>
                        </Box>
            </Paper>
            <Box textAlign="center" m="auto" maxWidth={240}>
                <GoogleButton onClick={() => GoogleSignIn()}></GoogleButton>
            </Box>
        </Grid>
     );
}
 
export default Login;
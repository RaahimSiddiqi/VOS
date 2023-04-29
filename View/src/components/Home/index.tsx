import { Box, Grid, Typography, Button} from "@mui/material";
import bus_pipeline_graphic from '../../assets/bus_pipeline_graphic.png';
import { useNavigate } from "react-router-dom"
import React, { useState, useEffect, useCallback } from 'react';
import Particles from "react-particles";
import type { Container, Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import './index.css'; 


const Home = () => {
    const navigate = useNavigate();
    
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        await console.log(container);
    }, []);


    return ( 
        <Grid container>
            <Grid container >
                <Grid item xs={12} md={12} style={{ height:'calc(100vh - 65px)', display: "flex", flexDirection:"column", justifyContent: "flex-end" }}>
                    <Particles
                        id="tsparticles-custom"
                        init={particlesInit}
                        loaded={particlesLoaded}
                        options={{
                            fullScreen: {
                                enable: false,
                                zIndex: 0,
                            },
                            background: {
                            },
                            fpsLimit: 60,
                            interactivity: {
                                events: {
                                    onClick: {
                                        enable: true,
                                        mode: "push",
                                    },
                                    onHover: {
                                        enable: true,
                                        mode: "repulse",
                                    },
                                    resize: true,
                                },
                                modes: {
                                    push: {
                                        quantity: 1,
                                    },
                                    repulse: {
                                        distance: 100,
                                        duration: 0.4,
                                    },
                                },
                            },
                            particles: {
                                color: {
                                    value: "#0093AB",
                                },
                                links: {
                                    color: "#0093AB",
                                    distance: 150,
                                    enable: true,
                                    opacity: 0.5,
                                    width: 1,
                                },
                                collisions: {
                                    enable: true,
                                },
                                move: {
                                    direction: "none",
                                    enable: true,
                                    outModes: {
                                        default: "bounce",
                                    },
                                    random: false,
                                    speed: 2,
                                    straight: false,
                                },
                                number: {
                                    density: {
                                        enable: true,
                                        area: 800,
                                    },
                                    value: 60,
                                },
                                opacity: {
                                    value: 0.5,
                                },
                                shape: {
                                    type: "circle",
                                },
                                size: {
                                    value: { min: 1, max: 5 },
                                },
                            },
                            detectRetina: true,
                        }}
                    />
                   <Box textAlign='center' sx={{margin:"auto"}}>
                        <Typography m = {0} align="center" fontSize={32}>Unleash the power of visual intelligence with Seer</Typography>
                        <Typography align="center" fontSize={26}>The Ultimate VOS Application</Typography>
                        <Box sx={{p: 1}}>
                            <Button variant="contained" onClick={() => navigate("/editor")}>Try Now!</Button>
                        </Box>
                    </Box>
                </Grid>   
                <Grid item xs={12} md={12}>
                    <Box>
                        <img src={bus_pipeline_graphic}></img>
                    </Box>
                </Grid>   
            </Grid>
        </Grid>
     );
}
 
export default Home;
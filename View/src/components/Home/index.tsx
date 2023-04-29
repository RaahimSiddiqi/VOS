import { Box, Grid, Typography, Button} from "@mui/material";
import bus_pipeline_graphic from '../../assets/bus_pipeline_graphic.png';
import bus_image from '../../assets/bus.png';
import seg_bus_image from '../../assets/seg_bus.png';
import extract_bus_image from '../../assets/extract_bus.jpg';
import filtered_bus_image from '../../assets/filtered_bus.png';
import replaced_bus_image from '../../assets/replaced_bus.png';
import { useNavigate } from "react-router-dom"
import React, { useState, useEffect, useCallback } from 'react';
import Particles from "react-particles";
import type { Container, Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import { ImgComparisonSlider } from '@img-comparison-slider/react';
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
                        <Typography variant="h1" fontSize={40} m={0} align="center">Unleash the power of visual intelligence with Seer</Typography>
                        <Typography variant="h2" fontSize={30} align="center" paddingTop={1}>The Ultimate VOS Application</Typography>
                        <Box sx={{p: 1}}>
                            <Button sx={{width:150, height:40}} variant="contained" onClick={() => navigate("/editor")}><Typography fontSize={18}>Try Now!</Typography></Button>
                        </Box>
                    </Box>
                </Grid>   
                <Grid paddingTop={5} item xs={12} md={12} style={{ height:'calc(100vh - 65px)'}}>
                    <Box textAlign='center' sx={{margin:"auto"}}>
                        <Typography variant="h3">Object Detection and Segmentation</Typography>
                        <ImgComparisonSlider>
                            <img slot="second" src={bus_image}/>
                            <img slot="first" src={seg_bus_image} />
                        </ImgComparisonSlider>
                    </Box>
                </Grid>   
                <Grid paddingTop={5} item xs={12} md={12} style={{ height:'calc(100vh - 65px)'}}>
                    <Box textAlign='center' sx={{margin:"auto"}}>
                        <Typography variant="h3">Filtering by Object Class</Typography>
                        <ImgComparisonSlider>
                            <img slot="second" src={seg_bus_image}/>
                            <img slot="first" src={filtered_bus_image} />
                        </ImgComparisonSlider>
                    </Box>
                </Grid>   
                <Grid paddingTop={5} item xs={12} md={12} style={{ height:'calc(100vh - 65px)'}}>
                    <Box textAlign='center' sx={{margin:"auto"}}>
                        <Typography variant="h3">Background Removal</Typography>
                        <ImgComparisonSlider>
                            <img slot="first" src={bus_image}/>
                            <img slot="second" src={extract_bus_image} />
                        </ImgComparisonSlider>
                    </Box>
                </Grid>   
                <Grid paddingTop={5} item xs={12} md={12} style={{ height:'calc(100vh - 65px)'}}>
                    <Box textAlign='center' sx={{margin:"auto"}}>
                        <Typography variant="h3">Background Replacement</Typography>
                        <ImgComparisonSlider>
                            <img slot="first" src={bus_image}/>
                            <img slot="second" src={replaced_bus_image} />
                        </ImgComparisonSlider>
                    </Box>
                </Grid>   
            </Grid>
        </Grid>
     );
}
 
export default Home;
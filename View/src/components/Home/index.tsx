import { Box, Grid, Typography, Button} from "@mui/material";
import bus_pipeline_graphic from '../../assets/bus_pipeline_graphic.png';
import bus_image from '../../assets/bus.png';
import seg_bus_image from '../../assets/seg_bus.png';
import extract_bus_image from '../../assets/extract_bus.png';
import filtered_bus_image from '../../assets/filtered_bus.png';
import replaced_bus_image from '../../assets/replaced_bus.png';
import { useNavigate } from "react-router-dom"
import React, { useState, useEffect, useCallback } from 'react';
import Particles from "react-particles";
import type { Container, Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import { ImgComparisonSlider } from '@img-comparison-slider/react';

import './index.css'; 
import { useTheme } from "@mui/material"

const sliders = [
  {
    srcBefore: bus_image,
    srcAfter: seg_bus_image,
    title: 'Object Detection and Segmentation',
    desc : "Fast, precise and easy to train, YOLOv5 has a long and successful history of real time object detection. Treat YOLOv5 as a university where you'll feed your model information for it to learn from and grow into one integrated tool. With YOLOv5 and its  Pytorch implementation, you can get started with less than 6 lines of code."
  },
  {
    srcBefore: seg_bus_image,
    srcAfter: filtered_bus_image,
    title: 'Filtering by Object Class',
    desc : "Fast, precise and easy to train, YOLOv5 has a long and successful history of real time object detection. Treat YOLOv5 as a university where you'll feed your model information for it to learn from and grow into one integrated tool. With YOLOv5 and its  Pytorch implementation, you can get started with less than 6 lines of code."
  },
  {
    srcBefore: bus_image,
    srcAfter: extract_bus_image,
    title: 'Background Removal',
    desc : "Fast, precise and easy to train, YOLOv5 has a long and successful history of real time object detection. Treat YOLOv5 as a university where you'll feed your model information for it to learn from and grow into one integrated tool. With YOLOv5 and its  Pytorch implementation, you can get started with less than 6 lines of code."
  },
  {
    srcBefore: bus_image,
    srcAfter: replaced_bus_image,
    title: 'Background Replacement',
    desc : "Fast, precise and easy to train, YOLOv5 has a long and successful history of real time object detection. Treat YOLOv5 as a university where you'll feed your model information for it to learn from and grow into one integrated tool. With YOLOv5 and its  Pytorch implementation, you can get started with less than 6 lines of code."
  }
];

const Home = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const particlesInit = useCallback(async (engine: Engine) => {
        await loadFull(engine);
    }, []);

    const particlesLoaded = useCallback(async (container: Container | undefined) => {
        await console.log(container);
    }, []);


    return ( 
        <Grid container>
            <Grid container >
                <Grid item xs={12} md={12} style={{ height:'calc(100vh - 65px)', display: "flex", flexDirection:"column" }}>
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
                                        mode: "grab",
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
                                    value: "#808080",
                                },
                                links: {
                                    color: "#808080",
                                    distance: 150,
                                    enable: true,
                                    opacity: 0.3,
                                    width: 1,
                                },
                                collisions: {
                                    enable: false,
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
                                    value: 100,
                                },
                                opacity: {
                                    value: 0.5,
                                },
                                shape: {
                                    type: "square",
                                },
                                size: {
                                    value: { min: 1, max: 5 },
                                },
                            },
                            detectRetina: true,
                        }}
                    />
                   <Box p={2} maxWidth={1000} mx='auto' mt='auto' mb='auto'>

                        <Typography variant="h2" gutterBottom>Seer, The Ultimate VOS Application</Typography>
                        <Typography variant='h5' gutterBottom>Fast, precise and easy to train, YOLOv5 has a long and successful history of real time object detection. Treat YOLOv5 as a university where you'll feed your model information for it to learn from and grow into one integrated tool. With YOLOv5 and its  Pytorch implementation, you can get started with less than 6 lines of code.</Typography>
                        <Button sx={{p:2, mt:1}} variant="contained" onClick={() => navigate("/editor")}><Typography fontSize={18}>Try Now!</Typography></Button>
                    </Box>
                </Grid>   
                {
                    sliders.map(slide => 
                        <Grid pt={5} item xs={12} md={12} sx={{height : '100vh'}}>
                            <Box textAlign='center' sx={{margin:"auto"}}>
                                <Typography variant="h3" gutterBottom>{slide.title}</Typography>
                                <Typography variant="body1" mb={4} width={500} mx='auto'>{slide.desc}</Typography>
                                <ImgComparisonSlider>
                                    <img slot="second" src={slide.srcBefore} style={{ objectFit: "contain", maxWidth : '100%'}}/>
                                    <img slot="first" src={slide.srcAfter} style={{ objectFit: "contain", maxWidth : '100%'}}/>
                                </ImgComparisonSlider>
                            </Box>
                        </Grid>
                    )
                }
            </Grid>
        </Grid>
     );
}
 
export default Home;
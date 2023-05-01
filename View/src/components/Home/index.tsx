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
    desc : "Gain the ability to detect significant objects in a video or image, and segment the occupied area of that object. Our models can detect over 80 different types of Objects!"
  },
  {
    srcBefore: seg_bus_image,
    srcAfter: filtered_bus_image,
    title: 'Filtering by Object Class',
    desc : "Images and Videos can often be cluttered with too many objects which may not be relevant. With our application, you can gain the ability to use smart-detection to segment only the relevant objects which you desire."
  },
  {
    srcBefore: extract_bus_image,
    srcAfter: bus_image,
    title: 'Background Removal',
    desc : "Our application uses image processing techniques to extract the desired object(s) from the rest of the image or video."
  },
  {
    srcBefore: bus_image,
    srcAfter: replaced_bus_image,
    title: 'Background Replacement',
    desc : "As an add-on to background removal, we also offer background replacement in both videos and images."
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
                        <Typography variant='h5' gutterBottom>Fast, precise and easy to train, YOLO has a long and successful history of real time object detection and segmentation. Our application builds upon YOLO, making it easier for end-users to perform tasks like object segmentation, background removal, and background replacement in just a few clicks.</Typography>
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
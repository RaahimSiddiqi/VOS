import { Box, Grid, Typography, Button} from "@mui/material";
import bus_pipeline_graphic from '../../assets/bus_pipeline_graphic.png';
import { useNavigate } from "react-router-dom"

const Home = () => {
    const navigate = useNavigate();

    return ( 
        <Grid container paddingTop={2}>
            <Grid container >
                <Grid item xs={12} md={6} style={{ display: "flex", flexDirection:"column", justifyContent: "flex-end" }}>
                    <Box textAlign='center' sx={{margin:"auto"}}>
                        <Typography m = {0} align="center" fontSize={32}>Unleash the power of visual intelligence with Seer</Typography>
                        <Typography align="center" fontSize={26}>The Ultimate VOS Application</Typography>
                        <Box sx={{p: 1}}>
                            <Button variant="contained" onClick={() => navigate("/editor")}>Try Now!</Button>
                        </Box>
                    </Box>
                </Grid>   
                <Grid item xs={12} md={6}>
                    <Box>
                        <img src={bus_pipeline_graphic}></img>
                    </Box>
                </Grid>   
            </Grid>
        </Grid>
     );
}
 
export default Home;
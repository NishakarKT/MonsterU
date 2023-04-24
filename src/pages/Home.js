import React from "react";
import { useNavigate } from "react-router-dom";
// mui
import { Grid, Card, CardActions, CardContent, Button, Typography, CardMedia, Stack } from "@mui/material";
import { CatchingPokemon } from "@mui/icons-material";
// constants
import { BATTLE_ROUTE } from "../constants/routes";
// data
import trainerdex from "../data/trainerdex.json";

const Home = ({ setFoeTrainer }) => {
  const navigate = useNavigate();
  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h4" component="h2" gutterBottom>
          Choose a Trainer!
        </Typography>
        <Grid container>
          {trainerdex.map((trainer) => (
            <Grid item xs={12} sm={6} md={4} lg={3} p={1}>
              <Card key={"trainer" + trainer.id}>
                <CardMedia sx={{ height: 200 }} image={trainer.photo} />
                <CardContent>
                  <Typography variant="h5" component="div">
                    {trainer.name}
                  </Typography>
                  <Typography gutterBottom variant="body1" component="div">
                    {trainer.position}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {trainer.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    fullWidth
                    onClick={() => {
                      if (trainer.team.length > 0) setFoeTrainer(trainer);
                      navigate(BATTLE_ROUTE);
                    }}
                    startIcon={<CatchingPokemon />}
                    variant="contained"
                  >
                    Battle
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Grid>
      <Grid item xs={12}></Grid>
    </Grid>
  );
};

export default Home;

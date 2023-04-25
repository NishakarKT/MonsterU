import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// mui
import { Grid, Typography, List, ListItem, ListItemAvatar, ListItemText, ListItemButton, Avatar, Button } from "@mui/material";
// constants
import { BATTLE_ROUTE } from "../constants/routes";
// mui
import { CatchingPokemon } from "@mui/icons-material";
// data
import trainerdex from "../data/trainerdex.json";

const Home = ({ foeTrainer, setFoeTrainer }) => {
  const navigate = useNavigate();
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    setTrainers(trainerdex);
  }, []);

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h4" component="h2" gutterBottom>
          Choose your Opponent!
        </Typography>
        <List sx={{ width: "100%", bgcolor: "background.paper" }}>
          {trainers.map((trainer) => (
            <ListItemButton
              onClick={() => {
                setFoeTrainer(trainer);
                navigate(BATTLE_ROUTE);
              }}
            >
              <ListItemAvatar>
                <Avatar src={trainer.photo} alt="" />
              </ListItemAvatar>
              <ListItemText primary={trainer.name} secondary={trainer.position} />
              <Button
                onClick={() => {
                  setFoeTrainer(trainer);
                  navigate(BATTLE_ROUTE);
                }}
                startIcon={<CatchingPokemon />}
                variant="contained"
              >
                Battle
              </Button>
            </ListItemButton>
          ))}
        </List>
      </Grid>
    </Grid>
  );
};

export default Home;

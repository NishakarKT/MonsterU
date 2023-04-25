import React, { Fragment, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
// data
import pokedex from "../data/pokedex.json";
import movedex from "../data/movedex.json";
import typeDex from "../data/typedex.json";
// mui
import { Paper, Grid, CardMedia, Stack, Slider, Menu, MenuItem, ListItemAvatar, ListItemText, Typography, Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, Avatar, Tooltip } from "@mui/material";
import { Home } from "@mui/icons-material";
// utils
import { getSprite, capitalize, shuffle } from "../utils";
import { CatchingPokemon } from "@mui/icons-material";
// constants
import { HOME_ROUTE } from "../constants/routes";
// vars
const TURN_DELAY = 750;
const TYPE_FACTOR = 1;
const POWER_FACTOR = 0.5;
const STATS_FACTOR = 0.5;

const Battle = ({ trainer, foeTrainer }) => {
  const navigate = useNavigate();
  const myPkmnRef = useRef(null);
  const foePkmnRef = useRef(null);
  const pkmns = pokedex.slice(0, 493);
  const moves = movedex;
  const types = typeDex;
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [myPkmns, setMyPkmns] = useState([]);
  const [foePkmns, setFoePkmns] = useState([]);
  const [myPkmn, setMyPkmn] = useState({});
  const [myPkmnMove, setMyPkmnMove] = useState(null);
  const [foePkmn, setFoePkmn] = useState({});
  const [foePkmnMove, setFoePkmnMove] = useState(null);
  const [isBattleOn, setIsBattleOn] = useState(false);
  const [log, setLog] = useState("");
  const [gameOver, setGameOver] = useState("");

  const handleLog = (log) => {
    setLog("");
    for (let i = 0; i < log.length; i++) {
      setTimeout(() => setLog((l) => l + log[i]), (i / log.length) * (0.5 * TURN_DELAY));
    }
  };

  const handleMyPkmn = (pkmn) => {
    setTimeout(() => setMyPkmn(pkmn), 100);
  };

  const handleFoePkmn = (pkmn) => {
    setTimeout(() => setFoePkmn(pkmn), 100);
  };

  const createMyTeam = () => {
    const myPkmns = [];
    while (myPkmns.length < 6) {
      const id = Math.floor(Math.random() * pkmns.length);
      if (!myPkmns.find((myPkmn) => myPkmn.id === id)) {
        const availableMoves = moves.filter((move) => Number(move.power) && pkmns[id].type.includes(move.type));
        shuffle(availableMoves);
        myPkmns.push({ data: pkmns[id], stats: pkmns[id].base, moves: availableMoves.slice(0, 4) });
      }
    }
    setMyPkmn(myPkmns[0]);
    setMyPkmns(myPkmns);
  };

  const createFoeTeam = () => {
    const foePkmns = [];
    if (!foeTrainer || !foeTrainer.team?.length) {
      while (foePkmns.length < 6) {
        const id = Math.floor(Math.random() * pkmns.length);
        if (!foePkmns.find((foePkmn) => foePkmn.id === id)) {
          const availableMoves = moves.filter((move) => Number(move.power) && pkmns[id].type.includes(move.type));
          shuffle(availableMoves);
          foePkmns.push({ data: pkmns[id], stats: pkmns[id].base, moves: availableMoves.slice(0, 4) });
        }
      }
    } else {
      foeTrainer.team.map((id) => {
        const availableMoves = moves.filter((move) => Number(move.power) && pkmns[id].type.includes(move.type));
        shuffle(availableMoves);
        foePkmns.push({ data: pkmns[id], stats: pkmns[id].base, moves: availableMoves.slice(0, 4) });
      });
    }
    setFoePkmn(foePkmns[0]);
    setFoePkmns(foePkmns);
  };

  const reset = () => {
    setGameOver("");
    createMyTeam();
    createFoeTeam();
  };

  useEffect(() => {
    reset();
  }, []);

  // battle
  useEffect(() => {
    // computer generated move
    let foePkmnMove;
    if (foePkmn.moves && !foePkmnMove) foePkmnMove = foePkmn.moves[Math.floor(Math.random() * foePkmn.moves.length)];
    // battle init
    if (myPkmnMove && foePkmnMove) {
      setIsBattleOn(true);
      setTimeout(() => setIsBattleOn(false), 6 * TURN_DELAY);
      if (Number(myPkmn.stats.Speed) >= Number(foePkmn.stats.Speed)) {
        attackFoePkmn(myPkmnMove, foePkmnMove);
        setFoePkmnMove(null);
        setMyPkmnMove(null);
      } else {
        attackMyPkmn(foePkmnMove, myPkmnMove);
        setMyPkmnMove(null);
        setFoePkmnMove(null);
      }
    }
  }, [myPkmnMove, foePkmnMove]);

  const handleMyPkmnStats = (newStats) => {
    setMyPkmn((myPkmn) => ({ ...myPkmn, stats: { ...myPkmn.stats, ...newStats } }));
    setMyPkmns((myPkmns) => myPkmns.map((pkmn) => (pkmn.data.id === myPkmn.data.id ? { ...pkmn, stats: { ...pkmn.stats, ...newStats } } : pkmn)));
  };

  const handleFoePkmnStats = (newStats) => {
    setFoePkmn((foePkmn) => ({ ...foePkmn, stats: { ...foePkmn.stats, ...newStats } }));
    setFoePkmns((foePkmns) => foePkmns.map((pkmn) => (pkmn.data.id === foePkmn.data.id ? { ...pkmn, stats: { ...pkmn.stats, ...newStats } } : pkmn)));
  };

  const attackMyPkmn = (move, myMove = null) => {
    // update log
    setTimeout(() => handleLog(foePkmn.data.name.english + " used " + move.ename + "!"), 0 * TURN_DELAY);

    // calculate damage
    let damage = POWER_FACTOR * Number(move.power);

    // stats effect
    if (move.category === "Physical") damage *= (STATS_FACTOR * Number(foePkmn.stats.Attack)) / Number(myPkmn.stats.Defense);
    else damage *= (STATS_FACTOR * Number(foePkmn.stats["Sp. Attack"])) / Number(myPkmn.stats["Sp. Defense"]);

    // type effect
    const myPkmnTypes = types.filter((type) => myPkmn.data.type.includes(capitalize(type.english)));
    let typeDamage = 1;
    myPkmnTypes.map((type) => {
      if (type.effective.includes(capitalize(move.type))) typeDamage /= 2;
      else if (type.ineffective.includes(capitalize(move.type))) typeDamage *= 2;
      else if (type.no_effect.includes(capitalize(move.type))) typeDamage *= 0;
    });
    damage *= typeDamage * TYPE_FACTOR;

    // update damage
    damage = Math.min(Math.floor(damage), Number(myPkmn.stats.HP));
    if (damage) setTimeout(() => handleLog(myPkmn.data.name.english + " lost " + damage + " HP!"), 1 * TURN_DELAY);
    else setTimeout(() => handleLog(myPkmn.data.name.english + " lost " + damage + " HP!"), 1 * TURN_DELAY);
    setTimeout(() => handleLog(myPkmn.data.name.english + " is left with " + (Number(myPkmn.stats.HP) - damage) + " HP!"), 2 * TURN_DELAY);
    setTimeout(() => handleLog(""), 3 * TURN_DELAY);

    if (Number(myPkmn.stats.HP) - damage === 0) {
      let newPkmn;
      // check if game over
      let cnt = 0;
      myPkmns.forEach((pkmn) => {
        if (pkmn.data.id !== myPkmn.data.id && Number(pkmn.stats.HP) !== 0) {
          newPkmn = pkmn;
          setTimeout(() => handleMyPkmn(pkmn), 5 * TURN_DELAY);
        } else if (Number(pkmn.stats.HP) === 0) cnt++;
      });
      if (cnt === myPkmns.length - 1) setTimeout(() => setGameOver("You Lost! All your pokemon have fainted!"), TURN_DELAY);
      else {
        // update logs
        setTimeout(() => handleLog(myPkmn.data.name.english + " lost to " + foePkmn.data.name.english + "!"), 3 * TURN_DELAY);
        setTimeout(() => handleLog((trainer?.name || "I") + " called back " + myPkmn.data.name.english + "!"), 4 * TURN_DELAY);
        setTimeout(() => handleLog((trainer?.name || "I") + " sent " + newPkmn.data.name.english + "!"), 5 * TURN_DELAY);
        setTimeout(() => handleLog(""), 6 * TURN_DELAY);
      }
    } else if (myMove) setTimeout(() => attackFoePkmn(myMove), 3 * TURN_DELAY);

    // update stats
    handleMyPkmnStats({ HP: Number(myPkmn.stats.HP) - damage });

    // damage effect
    if (myPkmnRef.current) {
      for (let i = 0; i <= 9; i++) setTimeout(() => (myPkmnRef.current.style.opacity = i % 2), 50 * i);
    }
  };

  const attackFoePkmn = (move, foeMove) => {
    // update log
    setTimeout(() => handleLog(myPkmn.data.name.english + " used " + move.ename + "!"), 0 * TURN_DELAY);

    // calculate damage
    let damage = POWER_FACTOR * Number(move.power);

    // stats effect
    if (move.category === "Physical") damage *= (STATS_FACTOR * Number(myPkmn.stats.Attack)) / Number(foePkmn.stats.Defense);
    else damage *= (STATS_FACTOR * Number(myPkmn.stats["Sp. Attack"])) / Number(foePkmn.stats["Sp. Defense"]);

    // type effect
    const foePkmnTypes = types.filter((type) => foePkmn.data.type.includes(capitalize(type.english)));
    let typeDamage = 1;
    foePkmnTypes.map((type) => {
      if (type.effective.includes(capitalize(move.type))) typeDamage /= 2;
      else if (type.ineffective.includes(capitalize(move.type))) typeDamage *= 2;
      else if (type.no_effect.includes(capitalize(move.type))) typeDamage *= 0;
    });
    damage *= typeDamage * TYPE_FACTOR;

    // update damage
    damage = Math.min(Math.floor(damage), foePkmn.stats.HP);
    if (damage) setTimeout(() => handleLog(foePkmn.data.name.english + " lost " + damage + " HP!"), 1 * TURN_DELAY);
    else setTimeout(() => handleLog(foePkmn.data.name.english + " lost " + damage + " HP!"), 1 * TURN_DELAY);
    setTimeout(() => handleLog(foePkmn.data.name.english + " is left with " + (Number(foePkmn.stats.HP) - damage) + " HP!"), 2 * TURN_DELAY);
    setTimeout(() => handleLog(""), 3 * TURN_DELAY);

    if (Number(foePkmn.stats.HP) - damage === 0) {
      let newPkmn;
      // check if game over
      let cnt = 0;
      foePkmns.forEach((pkmn) => {
        if (pkmn.data.id !== foePkmn.data.id && Number(pkmn.stats.HP) !== 0) {
          newPkmn = pkmn;
          setTimeout(() => handleFoePkmn(pkmn), 5 * TURN_DELAY);
        } else if (Number(pkmn.stats.HP) === 0) cnt++;
      });
      if (cnt === foePkmns.length - 1) setTimeout(() => setGameOver("You Won! All your foe's pokemons have fainted!"), TURN_DELAY);
      else {
        // update logs
        setTimeout(() => handleLog(foePkmn.data.name.english + " lost to " + myPkmn.data.name.english + "!"), 3 * TURN_DELAY);
        setTimeout(() => handleLog((foeTrainer?.name || "Foe Trainer") + " called back " + foePkmn.data.name.english + "!"), 4 * TURN_DELAY);
        setTimeout(() => handleLog((foeTrainer?.name || "Foe Trainer") + " sent " + newPkmn.data.name.english + "!"), 5 * TURN_DELAY);
        setTimeout(() => handleLog(""), 6 * TURN_DELAY);
      }
    } else if (foeMove) setTimeout(() => attackMyPkmn(foeMove), 3 * TURN_DELAY);
    // if (Number(foePkmn.stats.HP) - damage === 0) {
    //   // check if game over
    //   let cnt = 0;
    //   foePkmns.forEach((pkmn) => {
    //     if (pkmn.data.id !== foePkmn.data.id && Number(pkmn.stats.HP) !== 0) handleFoePkmn(pkmn);
    //     else if (Number(pkmn.stats.HP) === 0) cnt++;
    //   });
    //   if (cnt === foePkmns.length - 1) setTimeout(() => setGameOver("You Won! All of your opponent's pokemons have fainted!"), TURN_DELAY);
    // } else if (foeMove) setTimeout(() => attackMyPkmn(foeMove), 3 * TURN_DELAY);

    // update stats
    handleFoePkmnStats({ HP: Number(foePkmn.stats.HP) - damage });

    // damage effect
    if (foePkmnRef.current) {
      for (let i = 0; i <= 9; i++) setTimeout(() => (foePkmnRef.current.style.opacity = i % 2), 50 * i);
    }
  };

  return (
    <Fragment>
      <Dialog open={Boolean(gameOver)} onClose={() => setGameOver("")}>
        <DialogTitle id="alert-dialog-title">{gameOver}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">If you wish to rebattle, please click on "Rematch"!</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGameOver("")}>Quit</Button>
          <Button
            onClick={() => {
              setGameOver("");
              reset();
            }}
            autoFocus
          >
            Rematch
          </Button>
        </DialogActions>
      </Dialog>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ position: "relative", p: 2, height: "calc(100vh - 200px)", minHeight: "400px", maxHeight: "600px" }}>
            <CardMedia sx={{ width: `100%`, height: "100%", position: "absolute", top: "0", left: "0", objectFit: "cover", zIndex: 0 }} component="img" src={"/fields/0.jpg"} alt="" />
            <CardMedia sx={{ width: `30px`, position: "absolute", bottom: "25%", right: "10%", objectFit: "contain", zIndex: 1 }} component="img" src={"/images/trainer1.png"} alt="" />
            <CardMedia sx={{ width: `75px`, position: "absolute", bottom: "25%", right: "40%", objectFit: "contain", zIndex: 0, display: { xs: "none", sm: "inline" } }} component="img" src={"/images/trainer1.gif"} alt="" />
            <CardMedia sx={{ width: `75px`, position: "absolute", bottom: "25%", right: "35%", objectFit: "contain", zIndex: 0, display: { xs: "none", sm: "inline" } }} component="img" src={"/images/trainer2.gif"} alt="" />
            {myPkmn && myPkmn.data && myPkmn.stats ? (
              <Stack spacing={1} sx={{ position: "absolute", bottom: "15%", left: "30%", zIndex: 5 }}>
                <Stack>
                  {/* <Typography variant="h6" color="white" whiteSpace="nowrap">
                    {"#" + myPkmn.data.id + " | " + myPkmn.data.name.english}
                  </Typography> */}
                  {/* <Slider value={Number(myPkmn.stats.HP)} onChange={() => {}} color={Number(myPkmn.stats.HP) > 0.25 * Number(myPkmn.data.base.HP) ? "success" : "error"} max={Number(myPkmn.data.base.HP)} valueLabelDisplay="auto" /> */}
                  <Slider value={Number(myPkmn.stats.HP)} onChange={() => {}} sx={{ "& .MuiSlider-thumb": { display: "none", color: Number(myPkmn.stats.HP) > 0.25 * Number(myPkmn.data.base.HP) ? "white" : "red" }, "& .MuiSlider-track": { color: Number(myPkmn.stats.HP) > 0.25 * Number(myPkmn.data.base.HP) ? "white" : "red" }, "& .MuiSlider-rail": { color: Number(myPkmn.stats.HP) > 0.25 * Number(myPkmn.data.base.HP) ? "white" : "red" }, "& .MuiSlider-active": { color: Number(myPkmn.stats.HP) > 0.25 * Number(myPkmn.data.base.HP) ? "white" : "red" } }} max={Number(myPkmn.data.base.HP)} valueLabelDisplay="auto" />
                </Stack>
                <CardMedia ref={myPkmnRef} sx={{ width: `${Math.min(Math.max(Number(myPkmn.data.profile.height.split(" ")[0]) * 150, 100), 100)}px`, objectFit: "contain", opacity: Number(myPkmn.stats.HP) === 0 ? "0.5" : "1" }} component="img" src={getSprite(myPkmn.data.id, "b")} alt="" />
              </Stack>
            ) : null}
            {foePkmn && foePkmn.data && foePkmn.stats ? (
              <Stack spacing={1} sx={{ position: "absolute", bottom: "20%", right: "20%", zIndex: 4 }}>
                <Stack>
                  {/* <Typography variant="h6" color="white" whiteSpace="nowrap">
                    {"#" + foePkmn.data.id + " | " + foePkmn.data.name.english}
                  </Typography> */}
                  <Slider value={Number(foePkmn.stats.HP)} onChange={() => {}} sx={{ "& .MuiSlider-thumb": { display: "none", color: Number(foePkmn.stats.HP) > 0.25 * Number(foePkmn.data.base.HP) ? "white" : "red" }, "& .MuiSlider-track": { color: Number(foePkmn.stats.HP) > 0.25 * Number(foePkmn.data.base.HP) ? "white" : "red" }, "& .MuiSlider-rail": { color: Number(foePkmn.stats.HP) > 0.25 * Number(foePkmn.data.base.HP) ? "white" : "red" }, "& .MuiSlider-active": { color: Number(foePkmn.stats.HP) > 0.25 * Number(foePkmn.data.base.HP) ? "white" : "red" } }} max={Number(foePkmn.data.base.HP)} valueLabelDisplay="auto" />
                </Stack>
                <CardMedia ref={foePkmnRef} sx={{ width: `${Math.min(Math.max(Number(foePkmn.data.profile.height.split(" ")[0]) * 150, 100), 100)}px`, objectFit: "contain", opacity: Number(foePkmn.stats.HP) === 0 ? "0.5" : "1" }} component="img" src={getSprite(foePkmn.data.id)} alt="" />
              </Stack>
            ) : null}
            {foePkmns.map((foePkmn, index) => (
              <CardMedia sx={{ position: "absolute", bottom: "25%", right: `${15 * ((index + 1) / foePkmns.length)}%`, zIndex: 1, width: `${Math.min(Math.max(Number(foePkmn.data.profile.height.split(" ")[0]) * 150, 30), 30)}px`, objectFit: "contain", opacity: Number(foePkmn.stats.HP) === 0 ? "0.5" : "1" }} component="img" src={getSprite(foePkmn.data.id)} alt="" />
            ))}
            {myPkmn && myPkmn.data && myPkmn.stats && !isBattleOn ? (
              <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={1} sx={{ width: "100%", position: "absolute", bottom: "0", left: "0", zIndex: 7 }}>
                <Grid container xs={12} spacing={1} p={2} pt={0}>
                  <Grid item xs={12}>
                    <Typography variant="h6" whiteSpace="nowrap" color="white">
                      What should {myPkmn.data.name.english} do?
                    </Typography>
                  </Grid>
                  {myPkmn.moves.map((move) => (
                    <Grid item xs={6} md={3}>
                      <Button fullWidth disabled={isBattleOn || gameOver || Number(myPkmn.stats.HP) === 0} variant={myPkmnMove?.id === move.id ? "contained" : "outlined"} sx={{ color: "white", borderColor: "white !important" }} onClick={() => setMyPkmnMove(move)} key={move.id}>
                        {move.ename}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            ) : (
              <Typography variant="h6" whiteSpace="nowrap" color="white" sx={{ position: "absolute", bottom: "0", left: "0", zIndex: 7, p: 2 }}>
                {log}
              </Typography>
            )}
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} sx={{ width: "100%", position: "absolute", top: "0", left: "0", zIndex: 7 }}>
              <Grid container xs={12}>
                <Stack direction={{ xs: "column", sm: "row" }} p={1} alignItems={{ xs: "flex-start", sm: "center" }} flexWrap="wrap" sx={{ width: "100%" }}>
                  <Tooltip title={trainer?.name || "Me"}>
                    <Avatar sx={{ m: 1 }} alt={trainer?.name || "Me"} src={trainer?.photo} onClick={(e) => setAnchorEl(e.currentTarget)} />
                  </Tooltip>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                    <Typography variant="h6" sx={{ px: 1 }}>
                      Switch?
                    </Typography>
                    {myPkmns.map((myPkmn) => (
                      <MenuItem
                        onClick={() => {
                          handleMyPkmn(myPkmn);
                          setAnchorEl(null);
                        }}
                        key={"my_pokemons" + myPkmn.data.id}
                      >
                        <ListItemAvatar>
                          <Avatar src={myPkmn.data.image.hires} sty />
                        </ListItemAvatar>
                        <ListItemText primary={myPkmn.data.name.english} secondary={"HP - " + myPkmn.stats.HP + "/" + myPkmn.data.base.HP} />
                      </MenuItem>
                    ))}
                  </Menu>
                  {myPkmns.map((myPkmn) => (
                    <CatchingPokemon sx={{ color: myPkmn.stats.HP === "0" ? "black" : "white" }} />
                  ))}
                </Stack>
              </Grid>
              <Grid container xs={12}>
                <Stack direction={{ xs: "column", sm: "row-reverse" }} p={1} alignItems={{ xs: "flex-end", sm: "center" }} flexWrap="wrap" sx={{ width: "100%" }}>
                  <Tooltip title={foeTrainer?.name || "Foe"}>
                    <Avatar sx={{ m: 1 }} alt={foeTrainer?.name || "Me"} src={foeTrainer?.photo} onClick={(e) => setAnchorEl2(e.currentTarget)} />
                  </Tooltip>
                  <Menu anchorEl={anchorEl2} open={Boolean(anchorEl2)} onClose={() => setAnchorEl2(null)}>
                    <Typography variant="h6" sx={{ px: 1 }}>
                      Enemy Team
                    </Typography>
                    {foePkmns.map((foePkmn) => (
                      <MenuItem
                        onClick={() => {
                          setAnchorEl2(null);
                        }}
                        key={"foe_pokemons" + foePkmn.data.id}
                      >
                        <ListItemAvatar>
                          <Avatar src={foePkmn.data.image.hires} sty />
                        </ListItemAvatar>
                        <ListItemText primary={foePkmn.data.name.english} secondary={"HP - " + foePkmn.stats.HP + "/" + foePkmn.data.base.HP} />
                      </MenuItem>
                    ))}
                  </Menu>
                  {myPkmns.map((myPkmn) => (
                    <CatchingPokemon sx={{ color: myPkmn.stats.HP === "0" ? "black" : "white" }} />
                  ))}
                </Stack>
              </Grid>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <Button onClick={() => navigate(HOME_ROUTE)} color="error" variant="contained" sx={{ mt: 2 }} startIcon={<Home />}>
        Back to Home
      </Button>
    </Fragment>
  );
};

export default Battle;

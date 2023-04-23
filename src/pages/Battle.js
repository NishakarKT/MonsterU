import React, { Fragment, useState, useEffect, useRef } from "react";
// data
import pokedex from "../data/pokedex.json";
import movedex from "../data/movedex.json";
import typeDex from "../data/typedex.json";
// mui
import { Paper, Grid, CardMedia, Stack, Slider, Typography, Button, Dialog, DialogTitle, DialogActions, DialogContent, DialogContentText, Chip, Card, CardActionArea, CardContent } from "@mui/material";
// utils
import { getSprite, capitalize, shuffle } from "../utils";
// vars
const TYPE_FACTOR = 0.75;
const POWER_FACTOR = 1;
const STATS_FACTOR = 0.5;

const Duel = ({ boxRef }) => {
  const myPkmnRef = useRef(null);
  const foePkmnRef = useRef(null);
  const logsRef = useRef(null);
  const recentLogsRef = useRef(null);
  const pkmns = pokedex.slice(0, 493);
  const moves = movedex;
  const types = typeDex;
  const [isBattleOn, setIsBattleOn] = useState(false);
  const [myPkmns, setMyPkmns] = useState([]);
  const [foePkmns, setFoePkmns] = useState([]);
  const [myPkmn, setMyPkmn] = useState({});
  const [myPkmnMove, setMyPkmnMove] = useState(null);
  const [foePkmn, setFoePkmn] = useState({});
  const [foePkmnMove, setFoePkmnMove] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [gameOver, setGameOver] = useState("");

  const handleMyPkmn = (pkmn) => {
    setTimeout(() => setMyPkmn(pkmn), 100);
    if (boxRef.current) setTimeout(() => boxRef.current.scrollTo(0, 0), 100);
  };

  const handleFoePkmn = (pkmn) => {
    setTimeout(() => setFoePkmn(pkmn), 1500);
    if (boxRef.current) setTimeout(() => boxRef.current.scrollTo(0, 0), 100);
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
    while (foePkmns.length < 6) {
      const id = Math.floor(Math.random() * pkmns.length);
      if (!foePkmns.find((foePkmn) => foePkmn.id === id)) {
        const availableMoves = moves.filter((move) => Number(move.power) && pkmns[id].type.includes(move.type));
        shuffle(availableMoves);
        foePkmns.push({ data: pkmns[id], stats: pkmns[id].base, moves: availableMoves.slice(0, 4) });
      }
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

    // battkle init
    if (myPkmnMove && foePkmnMove) {
      setIsBattleOn(true);
      setTimeout(() => setIsBattleOn(false), 3000);
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

  const handleRecentLogs = (newLogs) => {
    if (newLogs.length) {
      newLogs.map((log, idx) => setTimeout(() => setRecentLogs((logs) => [...logs, log]), 500 * idx));
      if (recentLogsRef.current) setTimeout(() => (recentLogsRef.current.scrollTop = recentLogsRef.current.scrollHeight), newLogs.length * 500);
    } else setRecentLogs([]);
  };

  const handleLogs = (newLogs) => {
    if (newLogs.length) {
      newLogs.map((log, idx) => setTimeout(() => setLogs((logs) => [...logs, log]), 500 * idx));
      if (logsRef.current) setTimeout(() => (logsRef.current.scrollTop = logsRef.current.scrollHeight), newLogs.length * 500);
    } else setLogs([]);
  };

  const handleMyPkmnStats = (newStats) => {
    setMyPkmn((myPkmn) => ({ ...myPkmn, stats: { ...myPkmn.stats, ...newStats } }));
    setMyPkmns((myPkmns) => myPkmns.map((pkmn) => (pkmn.data.id === myPkmn.data.id ? { ...pkmn, stats: { ...pkmn.stats, ...newStats } } : pkmn)));
  };

  const handleFoePkmnStats = (newStats) => {
    setFoePkmn((foePkmn) => ({ ...foePkmn, stats: { ...foePkmn.stats, ...newStats } }));
    setFoePkmns((foePkmns) => foePkmns.map((pkmn) => (pkmn.data.id === foePkmn.data.id ? { ...pkmn, stats: { ...pkmn.stats, ...newStats } } : pkmn)));
  };

  const attackMyPkmn = (move, myMove = null) => {
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

    // check if game over
    if (Number(myPkmn.stats.HP) - damage === 0) {
      let cnt = 0;
      myPkmns.forEach((pkmn) => (cnt += Number(Number(pkmn.stats.HP) === 0)));
      if (cnt === myPkmns.length - 1) setTimeout(() => setGameOver("You Lost! All your pokemon have fainted!"), 1500);
    } else if (myMove) setTimeout(() => attackFoePkmn(myMove), 1500);

    // update stats
    handleMyPkmnStats({ HP: Number(myPkmn.stats.HP) - damage });

    // damage effect
    if (myPkmnRef.current) {
      for (let i = 0; i <= 9; i++) setTimeout(() => (myPkmnRef.current.style.opacity = i % 2), 50 * i);
    }

    // set logs
    const newLogs = [
      { date: new Date().toLocaleString(), message: `${foePkmn.data.name.english} used ${move.ename}!` },
      { date: new Date().toLocaleString(), message: `${myPkmn.data.name.english} lost ${damage} HP!` },
      { date: new Date().toLocaleString(), message: `${myPkmn.data.name.english} is left with ${Math.max(0, Number(myPkmn.stats.HP) - damage)} HP!` },
    ];
    handleRecentLogs([]);
    handleRecentLogs(newLogs);
    handleLogs(newLogs);
  };

  const attackFoePkmn = (move, foeMove) => {
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

    // check if game over
    if (Number(foePkmn.stats.HP) - damage === 0) {
      let cnt = 0;
      foePkmns.forEach((pkmn) => {
        if (pkmn.data.id !== foePkmn.data.id && Number(pkmn.stats.HP) !== 0) handleFoePkmn(pkmn);
        else if (Number(pkmn.stats.HP) === 0) cnt++;
      });
      if (cnt === foePkmns.length - 1) setTimeout(() => setGameOver("You Won! All of your opponent's pokemons have fainted!"), 1500);
    } else if (foeMove) setTimeout(() => attackMyPkmn(foeMove), 1500);

    // update stats
    handleFoePkmnStats({ HP: Number(foePkmn.stats.HP) - damage });

    // damage effect
    if (foePkmnRef.current) {
      for (let i = 0; i <= 9; i++) setTimeout(() => (foePkmnRef.current.style.opacity = i % 2), 50 * i);
    }

    // set logs
    const newLogs = [
      { date: new Date().toLocaleString(), message: `${myPkmn.data.name.english} used ${move.ename}!` },
      { date: new Date().toLocaleString(), message: `${foePkmn.data.name.english} lost ${damage} HP!` },
      { date: new Date().toLocaleString(), message: `${foePkmn.data.name.english} is left with ${Math.max(0, Number(foePkmn.stats.HP) - damage)} HP!` },
    ];
    handleRecentLogs([]);
    handleRecentLogs(newLogs);
    handleLogs(newLogs);
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
        <Grid item xs={12} md={8}>
          <Paper sx={{ position: "relative", p: 2, height: "100%", background: `url(fields/1.jpg) no-repeat center center / cover` }}>
            {myPkmn.data && myPkmn.stats ? <CardMedia ref={myPkmnRef} sx={{ width: `${Math.min(Math.max(Number(myPkmn.data.profile.height.split(" ")[0]) * 150, 100), 100)}px`, position: "absolute", bottom: "30%", left: "30%", objectFit: "contain", zIndex: 2, opacity: Number(myPkmn.stats.HP) === 0 ? "0.5" : "1" }} component="img" src={getSprite(myPkmn.data.id, "b")} alt="" /> : null}
            {foePkmn?.data ? <CardMedia ref={foePkmnRef} sx={{ width: `${Math.min(Math.max(Number(foePkmn.data.profile.height.split(" ")[0]) * 75, 50), 100)}px`, position: "absolute", bottom: "40%", right: "20%", objectFit: "contain", zIndex: 1, opacity: Number(foePkmn.stats.HP) === 0 ? "0.5" : "1" }} component="img" src={getSprite(foePkmn.data.id, "")} alt="" /> : null}
            {myPkmn?.data ? (
              <Stack direction="row" alignItems="flex-end" justifyContent="space-between" spacing={1} sx={{ width: "100%", position: "absolute", bottom: "0", left: "0", zIndex: 3 }}>
                <Stack direction="row" spacing={1} p={1} pr={4} sx={{ bgcolor: "rgba(255, 255, 255, 0.5)", borderTopRightRadius: "50px" }}>
                  <CardMedia component="img" sx={{ width: "50px", objectFit: "contain" }} src={myPkmn.data.image.hires} />
                  <Stack>
                    <Typography variant="h6" whiteSpace="nowrap">
                      {myPkmn.data.id + " | " + myPkmn.data.name.english}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      {myPkmn.data.type.map((type) => (
                        <Chip key={myPkmn.data.id + type} sx={{ color: "white", bgcolor: types.find((t) => t.english === type).color }} label={type} />
                      ))}
                    </Stack>
                    <Slider
                      value={Number(myPkmn.stats.HP)}
                      onChange={() => {}}
                      color={Number(myPkmn.stats.HP) > 0.25 * Number(myPkmn.data.base.HP) ? "success" : "error"}
                      max={Number(myPkmn.data.base.HP)}
                      marks={[
                        { value: 0, label: 0 },
                        { value: Math.floor(0.25 * Number(myPkmn.data.base.HP)), label: Math.floor(0.25 * Number(myPkmn.data.base.HP)) },
                        // { value: Math.floor(0.5 * Number(myPkmn.data.base.HP)), label: Math.floor(0.5 * Number(myPkmn.data.base.HP)) },
                        { value: Math.floor(1 * Number(myPkmn.data.base.HP)), label: Math.floor(1 * Number(myPkmn.data.base.HP)) },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Stack>
                </Stack>
                <Grid container xs={12}>
                  {myPkmn.moves.map((move) => (
                    <Grid item xs={12} sm={6} p={1}>
                      <Button fullWidth disabled={isBattleOn || gameOver || Number(myPkmn.stats.HP) === 0} variant={myPkmnMove?.id === move.id ? "contained" : "outlined"} onClick={() => setMyPkmnMove(move)} key={move.id}>
                        {move.ename}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            ) : null}
            {foePkmn.data && foePkmn.stats ? (
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} sx={{ width: "100%", position: "absolute", top: "0", left: "0", zIndex: 3 }}>
                {/* <Grid container xs={12}>
                  {foePkmn.moves.map((move) => (
                    <Grid item xs={12} sm={6} p={1}>
                      <Button fullWidth disabled={isBattleOn || gameOver || Number(foePkmn.stats.HP) === 0} variant={foePkmnMove?.id === move.id ? "contained" : "outlined"} onClick={() => setFoePkmnMove(move)} key={move.id}>
                        {move.ename}
                      </Button>
                    </Grid>
                  ))}
                </Grid> */}
                <Grid container xs={12}>
                  <Stack direction="row" p={2}>
                    {foePkmns.map((foePkmn) => (
                      <CardMedia component="img" sx={{ width: "50px", objectFit: "contain", filter: Number(foePkmn.stats.HP) === 0 ? "brightness(0)" : "brightness(1)" }} src={foePkmn.data.image.hires} />
                    ))}
                  </Stack>
                </Grid>
                <Stack direction="row" spacing={1} p={1} pr={4} sx={{ bgcolor: "rgba(255, 255, 255, 0.5)", borderBottomLeftRadius: "50px" }}>
                  <CardMedia component="img" sx={{ width: "50px", objectFit: "contain" }} src={foePkmn.data.image.hires} />
                  <Stack>
                    <Typography variant="h6" whiteSpace="nowrap">
                      {foePkmn.data.id + " | " + foePkmn.data.name.english}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={1}>
                      {foePkmn.data.type.map((type) => (
                        <Chip key={foePkmn.data.id + type} sx={{ color: "white", bgcolor: types.find((t) => t.english === type).color }} label={type} />
                      ))}
                    </Stack>
                    <Slider
                      value={Number(foePkmn.stats.HP)}
                      onChange={() => {}}
                      color={Number(foePkmn.stats.HP) > 0.25 * Number(foePkmn.data.base.HP) ? "success" : "error"}
                      max={Number(foePkmn.data.base.HP)}
                      marks={[
                        { value: 0, label: 0 },
                        { value: Math.floor(0.25 * Number(foePkmn.data.base.HP)), label: Math.floor(0.25 * Number(foePkmn.data.base.HP)) },
                        // { value: Math.floor(0.5 * Number(foePkmn.data.base.HP)), label: Math.floor(0.5 * Number(foePkmn.data.base.HP)) },
                        { value: Math.floor(1 * Number(foePkmn.data.base.HP)), label: Math.floor(1 * Number(foePkmn.data.base.HP)) },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Stack>
                </Stack>
              </Stack>
            ) : null}
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2 }}>
              <Typography gutterBottom variant="h6">
                Recent Logs
              </Typography>
              <Stack sx={{ height: "40vh", maxHeight: "150px", overflowY: "auto" }} ref={recentLogsRef}>
                {recentLogs.map((log) => (
                  <Stack sx={{ mb: 2 }}>
                    <Typography variant="body1">{log.message}</Typography>
                    <Typography variant="body2">{log.date}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
            <Paper sx={{ p: 2 }}>
              <Typography gutterBottom variant="h6">
                Past Logs
              </Typography>
              <Stack sx={{ height: "40vh", maxHeight: "150px", overflowY: "auto" }} ref={logsRef}>
                {logs.map((log) => (
                  <Stack sx={{ mb: 2 }}>
                    <Typography variant="body1">{log.message}</Typography>
                    <Typography variant="body2">{log.date}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            {myPkmns.length > 0 ? (
              <Stack spacing={2}>
                <Typography gutterBottom variant="h6">
                  My Team
                </Typography>
                <Grid container>
                  {myPkmns.map((pkmn) => (
                    pkmn.data && pkmn.stats ? <Grid item xs={12} sm={6} md={2}>
                      <Card sx={{ height: "100%" }}>
                        <CardActionArea onClick={() => handleMyPkmn(pkmn)}>
                          <CardMedia component="img" sx={{ height: "75px", objectFit: "contain", mt: 2 }} src={getSprite(pkmn.data.id)} />
                          <CardContent>
                            <Typography gutterBottom variant="body2">
                              {pkmn.data.id + " | " + pkmn.data.name.english}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              {pkmn.data.type.map((type) => (
                                <Chip key={pkmn.data.id + type} sx={{ color: "white", bgcolor: types.find((t) => t.english === type).color }} label={type} />
                              ))}
                            </Stack>
                            <Slider
                              value={Number(pkmn.stats.HP)}
                              onChange={() => {}}
                              color={Number(pkmn.stats.HP) > 0.25 * Number(pkmn.data.base.HP) ? "success" : "error"}
                              max={Number(pkmn.data.base.HP)}
                              marks={[
                                { value: 0, label: 0 },
                                { value: Math.floor(0.25 * Number(pkmn.data.base.HP)), label: Math.floor(0.25 * Number(pkmn.data.base.HP)) },
                                // { value: Math.floor(0.5 * Number(pkmn.data.base.HP)), label: Math.floor(0.5 * Number(pkmn.data.base.HP)) },
                                { value: Math.floor(1 * Number(pkmn.data.base.HP)), label: Math.floor(1 * Number(pkmn.data.base.HP)) },
                              ]}
                              valueLabelDisplay="auto"
                            />
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid> : null
                  ))}
                </Grid>
              </Stack>
            ) : null}
          </Paper>
        </Grid>
        {/* <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            {foePkmns.length > 0 ? (
              <Stack spacing={2}>
                <Typography gutterBottom variant="h6">
                  Enemy Team
                </Typography>
                <Grid container>
                  {foePkmns.map((pkmn) => (
                    <Grid item xs={12} sm={6} md={2}>
                      <Card sx={{ height: "100%" }}>
                        <CardMedia component="img" sx={{ height: "75px", objectFit: "contain", mt: 2 }} src={getSprite(pkmn.data.id)} />
                        <CardContent>
                          <Typography gutterBottom variant="body2">
                            {pkmn.data.id + " | " + pkmn.data.name.english}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            {pkmn.data.type.map((type) => (
                              <Chip key={pkmn.data.id + type} sx={{ color: "white", bgcolor: types.find((t) => t.english === type).color }} label={type} />
                            ))}
                          </Stack>
                          <Slider
                            value={Number(pkmn.stats.HP)}
                            color={Number(pkmn.stats.HP) > 0.25 * Number(pkmn.data.base.HP) ? "success" : "error"}
                            max={Number(pkmn.data.base.HP)}
                            marks={[
                              { value: 0, label: 0 },
                              { value: Math.floor(0.25 * Number(pkmn.data.base.HP)), label: Math.floor(0.25 * Number(pkmn.data.base.HP)) },
                              // { value: Math.floor(0.5 * Number(pkmn.data.base.HP)), label: Math.floor(0.5 * Number(pkmn.data.base.HP)) },
                              { value: Math.floor(1 * Number(pkmn.data.base.HP)), label: Math.floor(1 * Number(pkmn.data.base.HP)) },
                            ]}
                            valueLabelDisplay="auto"
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Stack>
            ) : null}
          </Paper>
        </Grid> */}
      </Grid>
    </Fragment>
  );
};

export default Duel;

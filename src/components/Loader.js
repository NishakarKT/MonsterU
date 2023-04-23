import React from "react";
// mui
import { Box } from "@mui/material";
import { CircularProgress } from "@mui/material";

const Loader = () => {
  return (
    <Box sx={{ position: "fixed", display: "grid", placeItems: "center", width: "100vw", height: "100vh", zIndex: 9999, backgroundColor: "rgba(0,0,0,0.5)" }}>
      <CircularProgress color="white" />
    </Box>
  );
};

export default Loader;

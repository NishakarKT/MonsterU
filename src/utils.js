export const getSprite = (id, sfx = "") => {
  return "https://raw.githubusercontent.com/NishakarKT/3D-Pokedex/main/public/images/sprites/" + (Math.floor(Number(id) / 100) % 10) + (Math.floor(Number(id) / 10) % 10) + Math.floor(Number(id) % 10) + sfx + ".gif";
};

export const capitalize = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const shuffle = array => {
  array.sort(() => Math.random() - 0.5);
};

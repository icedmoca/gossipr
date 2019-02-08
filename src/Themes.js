import {createMuiTheme} from "@material-ui/core";
import red from "@material-ui/core/colors/red"; 

export default {
  light: createMuiTheme({
    typography: { useNextVariants: true },
    palette: {
        primary: { main: '#795548' },
        secondary: { main: '#795548' },
        error: red
    }
  }),
  dark: createMuiTheme({
    typography: { useNextVariants: true },
    palette: {
      primary: { main: '#291d16' },
      secondary: { main: '#795548' },
        error: red,
        type: 'dark',
        background: {
          paper: '#171717',
          default: "#171717"
        },
    }
  })
};
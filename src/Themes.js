import {createMuiTheme} from "@material-ui/core";
import red from "@material-ui/core/colors/red"; 

export default {
  light: createMuiTheme({
    typography: { useNextVariants: true },
    palette: {
      primary: { main: '#ffffff'  },
      secondary: { main: '#f5f5f5' },
      error: red,
      background: {
        paper: '#ffffff',
        default: "#ffffff"
      },
    }
  }),
  choco: createMuiTheme({
    typography: { useNextVariants: true },
    palette: {
      primary: { main: '#4e342e' },
      secondary: { main: '#5d4037' },
      error: red, 
      type: 'dark',
      background: {
        paper: '#4e342e',
        default: "#4e342e"
      },
    },
  }),
  dark: createMuiTheme({
      typography: { useNextVariants: true },
      palette: {
        primary: { main: '#212121' },
        secondary: { main: '#1b1b1b' },
        error: red,
        type: 'dark',
        background: {
          paper: '#212121',
          default: "#212121"
        },
      },
  }),
  navy: createMuiTheme({
    typography: { useNextVariants: true },
    palette: {
      primary: { main: '#263238'  },
      secondary: { main: '#37474f' },
      error: red,
      type: 'dark',
      background: {
        paper: '#263238',
        default: "#263238"
      },
    }
  }),
  red: createMuiTheme({
    typography: { useNextVariant: true },
    palette: {
      primary: { main: '#b71c1c' },
      secondary: { main: '#c62828'},
      error: red,
      type: 'dark',
      background: {
        paper: '#b71c1c',
        default: '#b71c1c'
      }
    }
  })
};
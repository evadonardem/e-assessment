import { createTheme, alpha } from "@mui/material";

const maroon = '#4B0015';

const theme = createTheme({
    palette: {
        primary: {
            light: '#7B2D40',
            main: maroon,
            dark: '#2E000D',
            contrastText: '#FFFFFF',
        },
        secondary: {
            light: '#C8A165',
            main: '#A67C44',
            dark: '#7A5A2E',
            contrastText: '#FFFFFF',
        },
        error: {
            main: '#D32F2F',
        },
        warning: {
            main: '#ED6C02',
        },
        info: {
            main: '#0288D1',
        },
        success: {
            main: '#2E7D32',
        },
        background: {
            default: '#F9F5F5',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1A1A1A',
            secondary: '#5C5C5C',
            disabled: '#9E9E9E',
        },
        action: {
            hover: alpha(maroon, 0.08),
            selected: alpha(maroon, 0.16),
            focus: alpha(maroon, 0.12),
            activatedOpacity: 0.24,
            selectedOpacity: 0.16,
            hoverOpacity: 0.08,
            disabledOpacity: 0.38,
        },
        divider: alpha(maroon, 0.12),
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 500 },
        h6: { fontWeight: 500 },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: maroon,
                    boxShadow: 'none',
                    borderBottom: `1px solid ${alpha(maroon, 0.2)}`,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: maroon,
                    color: '#FFFFFF',
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    color: 'inherit',
                },
            },
        },
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    color: 'inherit',
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: alpha('#FFFFFF', 0.12),
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                    borderRadius: 12,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
                elevation1: {
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: alpha(maroon, 0.08),
                    '& .MuiTableCell-head': {
                        fontWeight: 700,
                        color: maroon,
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: alpha(maroon, 0.04),
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 500,
                    '&.Mui-selected': {
                        fontWeight: 700,
                    },
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#2E000D',
                    fontSize: '0.75rem',
                },
                arrow: {
                    color: '#2E000D',
                },
            },
        },
        MuiBadge: {
            styleOverrides: {
                badge: {
                    fontWeight: 700,
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 12,
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontWeight: 700,
                    color: maroon,
                },
            },
        },
    },
});

export default theme;

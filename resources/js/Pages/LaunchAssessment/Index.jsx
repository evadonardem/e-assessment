import { Head, usePage } from '@inertiajs/react';
import { Download, HighlightOffTwoTone, InfoOutlined, PsychologyTwoTone, RocketLaunch, SchoolTwoTone, TimerTwoTone, VisibilityTwoTone } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    ButtonGroup,
    Container,
    Grid,
    List,
    ListItem,
    ListItemText,
    Paper,
    Stack,
    ThemeProvider,
    Typography
} from '@mui/material';
import React, { } from 'react';
import theme from '../../Settings/Theme';

const Index = () => {
    const page = usePage();
    const { seb } = page.props;

    return <ThemeProvider theme={theme}>
        <Container>
            <Head>
                <title>Launcher</title>
            </Head>
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="90vh"
            >
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <Box textAlign="center" alignItems="center">
                            <Alert icon={<VisibilityTwoTone fontSize="large" />} severity="info" sx={{ mb: 1 }}>
                                Direct your attention solely to the exam interface or application that is open.
                            </Alert>
                            <Alert icon={<HighlightOffTwoTone fontSize="large" />} severity="info" sx={{ mb: 1 }}>
                                Refrain from clicking or interacting with any elements outside the exam window.
                            </Alert>
                            <Alert icon={<TimerTwoTone fontSize="large" />} severity="info" sx={{ mb: 1 }}>
                                Make the most of the allocated time by concentrating on answering questions rather than switching windows.
                            </Alert>
                            <Alert icon={<PsychologyTwoTone fontSize="large" />} severity="info" sx={{ mb: 1 }}>
                                Understand that switching windows during the exam could be interpreted as cheating and may have serious consequences.
                            </Alert>
                            <Alert icon={<SchoolTwoTone fontSize="large" />} severity="info" sx={{ mb: 1 }}>
                                Consider the importance of academic integrity and how adhering to the rule of not switching windows contributes to maintaining it.
                            </Alert>
                        </Box>
                    </Grid>
                    <Grid size={6}>
                        <Paper elevation={1} sx={{ padding: 2 }}>
                            <Stack spacing={2} sx={{ mx: 'auto' }}>

                                {/* Title */}
                                <Box display="flex" alignItems="center" gap={1}>
                                    <InfoOutlined color="action" size="small" />
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Instructions for Accessing Your Secure Assessment
                                    </Typography>
                                </Box>

                                {/* Main Intro */}
                                <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                                    Before starting your test, you must choose one of the options below depending on whether you have the secure testing software installed on your device:
                                </Typography>

                                {/* Bulleted Breakdowns */}
                                <List disablePadding>
                                    <ListItem disableGutters alignItems="flex-start" sx={{ pb: 1.5 }}>
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" component="span" color="text.primary">
                                                    <strong>Download Safe Exam Browser:</strong> Click this option if you have <strong>not</strong> installed Safe Exam Browser on this computer yet. This will download the setup file needed to secure your device for the test. You must run the installer completely before trying to open the assessment.
                                                </Typography>
                                            }
                                        />
                                    </ListItem>

                                    <ListItem disableGutters alignItems="flex-start">
                                        <ListItemText
                                            primary={
                                                <Typography variant="body2" component="span" color="text.primary">
                                                    <strong>Launch Assessment:</strong> Click this option only if Safe Exam Browser is <strong>already installed</strong> on your computer. Clicking this will automatically open the software and instantly log you into your secure testing environment.
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                </List>
                            </Stack>

                            <ButtonGroup fullWidth>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    startIcon={<Download />}
                                    href="https://safeexambrowser.org/download_en.html"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Download Safe Exam Browser
                                </Button>
                                <Button variant="contained" startIcon={<RocketLaunch />} href={seb}>
                                    Launch Assessment
                                </Button>
                            </ButtonGroup>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    </ThemeProvider>;
}

export default Index;

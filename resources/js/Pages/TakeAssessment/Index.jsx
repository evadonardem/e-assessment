import { Head, router, usePage } from '@inertiajs/react';
import {
    AccountCircleTwoTone,
    AlarmTwoTone,
    Block,
    CenterFocusStrong,
    CheckBox,
    CheckBoxOutlineBlank,
    HighlightOffTwoTone,
    Monitor,
    PsychologyTwoTone,
    SchoolTwoTone,
    SendSharp,
    TimerTwoTone,
    TopicSharp,
    VisibilityTwoTone,
} from '@mui/icons-material';
import {
    Alert,
    AppBar,
    Avatar,
    Box,
    Button,
    ButtonGroup,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    Fab,
    IconButton,
    Paper,
    Skeleton,
    Snackbar,
    Stack,
    TextField,
    ThemeProvider,
    Toolbar,
    Typography
} from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import { useTimer } from 'react-timer-hook';
import PropTypes from 'prop-types';
import theme from '../../Settings/Theme';

const ALLOWED_BASE_SCREEN_SIZE_RATIO = {
    width: 0.98,
    height: 0.80,
};

const ScreenSizeTooSmallDialog = () => <Dialog open fullScreen>
    <DialogContent>
        <Box textAlign="center">
            <Monitor sx={{ fontSize: 175 }} />
            <Typography variant="h5">Screen Size Adjustment Needed</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Alert severity="warning" sx={{ mb: 2 }}>
            Your current browser window size is not optimal for this platform.
            For the best experience, please resize or maximize your browser window.
        </Alert>
        <Alert severity="info">
            As you adjust your screen, remember that academic integrity is fundamental
            to your educational success. A properly sized display can help you engage fully
            with the material and ensures that all work submitted is a true reflection of
            your own understanding and efforts. Upholding these standards not only helps
            you learn but also fosters a culture of trust and respect
            in the academic community.
        </Alert>
    </DialogContent>
</Dialog>;

const StayFocusedDialog = ({ onContinue }) => <Dialog open fullScreen>
    <DialogContent>
        <Box textAlign="center">
            <CenterFocusStrong sx={{ fontSize: 175 }} />
            <Typography variant="h5">Stay Focused</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Alert icon={<VisibilityTwoTone />} severity="info" sx={{ mb: 1 }}>
            Direct your attention solely to the exam interface or application that is open.
        </Alert>
        <Alert icon={<HighlightOffTwoTone />} severity="info" sx={{ mb: 1 }}>
            Refrain from clicking or interacting with any elements outside the exam window.
        </Alert>
        <Alert icon={<TimerTwoTone />} severity="info" sx={{ mb: 1 }}>
            Make the most of the allocated time by concentrating on answering questions rather than switching windows.
        </Alert>
        <Alert icon={<PsychologyTwoTone />} severity="info" sx={{ mb: 1 }}>
            Understand that switching windows during the exam could be interpreted as cheating and may have serious consequences.
        </Alert>
        <Alert icon={<SchoolTwoTone />} severity="info" sx={{ mb: 1 }}>
            Consider the importance of academic integrity and how adhering to the rule of not switching windows contributes to maintaining it.
        </Alert>
        <Divider sx={{ my: 2 }} />
        <Alert severity="warning" sx={{ mb: 1 }}>
            Auto-submit will trigger once detected continous attempts.
        </Alert>
    </DialogContent>
    <DialogActions>
        <Button type="submit" variant="contained" onClick={onContinue}>Continue</Button>
    </DialogActions>
</Dialog>;

StayFocusedDialog.propTypes = {
    onContinue: PropTypes.func.isRequired,
};

const SectionQuestion = ({ assessment, section, question, i, answers }) => {
    const [obscured, setObscured] = useState(true);

    const handleAnswer = (option) => (e) => {
        e.preventDefault();
        router.post('/answers', {
            code: assessment.code,
            questionnaire_section_id: section.id,
            question_id: question.id,
            option_id: option.id,
        }, {
            preserveScroll: true,
        });
    };

    const handleAnswerAlternateResponseQuestion = (section, question, ans) => (e) => {
        e.preventDefault();
        router.post('/answers', {
            code: assessment.code,
            questionnaire_section_id: section.id,
            question_id: question.id,
            is_true: ans,
        }, {
            preserveScroll: true,
        });
    };

    const QuestionOption = ({ option, j }) => {
        const [optionObscured, setOptionObscured] = useState(true);
        const handleOptionObscured = useCallback((isObscured) => {
            setOptionObscured(isObscured);
        }, []);

        return <Stack
            alignItems="flex-start"
            direction="row"
            spacing={2}
            marginBottom={1}
            onMouseEnter={() => handleOptionObscured(false)}
            onMouseLeave={() => handleOptionObscured(true)}
        >
            <Button
                disableElevation
                color={answers.find((ans) => ans.questionnaire_section_id == section.id &&
                    ans.question_id == question.id &&
                    ans.option_id == option.id) ? "primary" : "inherit"}
                onClick={handleAnswer(option)}
                size="small"
                variant="contained">
                {`${String.fromCharCode(65 + j)}`}
            </Button>

            {optionObscured ? <Skeleton animation={false} variant="rectangular" height={30} width="100%" />
                : <Typography sx={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", KhtmlUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", userSelect: "none" }}>
                    <div dangerouslySetInnerHTML={{ __html: option.description }}></div>
                </Typography>}
        </Stack>;
    };

    QuestionOption.propTypes = {
        option: PropTypes.object.isRequired,
        j: PropTypes.number.isRequired,
    };

    return <Paper
        key={`section-${section.id}-question-${question.id}`}
        variant="outlined"
        elevation={0}
        onMouseEnter={useCallback(() => setObscured(false), [])}
        onMouseLeave={useCallback(() => setObscured(true), [])}
        sx={{ p: 1 }}
        square
    >
        <Stack alignItems="flex-start" direction="row" spacing={1}>
            <Button
                color="inherit"
                startIcon={answers.find((ans) => ans.questionnaire_section_id == section.id &&
                    ans.question_id == question.id) ? <CheckBox color="primary" /> : <CheckBoxOutlineBlank />}
                variant="text"
                size="large"
                sx={{ p: 0 }}
            >
                {`${i + 1}`}.
            </Button>
            <Box
                width="95%"
                sx={{
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    KhtmlUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    userSelect: "none"
                }}
            >
                {obscured ? <Skeleton animation={false} variant="rectangular" height={40} width="100%" /> : <Box>
                    <Typography>
                        <div dangerouslySetInnerHTML={{ __html: question.description }}></div>
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Stack>
                        {question.type.code.toLowerCase() === 'mcq' && question.options.map((option, j) => (
                            <QuestionOption
                                key={`section-${section.id}-question-${question.id}-option-${j}`}
                                option={option} j={j} />
                        ))}
                        {question.type.code.toLowerCase() === 'arq' && <ButtonGroup
                            fullWidth
                            sx={{ width: "25%" }}
                            variant="contained">
                            <Button
                                color={answers.find((ans) => ans.questionnaire_section_id == section.id &&
                                    ans.question_id == question.id &&
                                    ans.is_true !== null &&
                                    !!ans.is_true) ? "primary" : "inherit"}
                                onClick={handleAnswerAlternateResponseQuestion(section, question, true)}
                                size="small">
                                True
                            </Button>
                            <Button
                                color={answers.find((ans) => ans.questionnaire_section_id == section.id &&
                                    ans.question_id == question.id &&
                                    ans.is_true !== null &&
                                    !ans.is_true) ? "primary" : "inherit"}
                                onClick={handleAnswerAlternateResponseQuestion(section, question, false)}
                                size="small">
                                False
                            </Button>
                        </ButtonGroup>}
                    </Stack>
                </Box>}
            </Box>
        </Stack>
    </Paper>;
};

SectionQuestion.propTypes = {
    assessment: PropTypes.object.isRequired,
    section: PropTypes.object.isRequired,
    question: PropTypes.object.isRequired,
    i: PropTypes.number.isRequired,
    answers: PropTypes.array.isRequired,
};

const AsssementTimer = ({ assessment, questionnaire, timer }) => {
    const expiryTimestamp = new Date();
    const { hours, minutes, seconds } = useTimer({
        expiryTimestamp,
        autoStart: !!questionnaire && !!timer,
        onExpire: () => {
            router.post('/submit-assessment', {
                code: assessment.code,
                timeExpired: 1,
            });
        },
    });
    expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + (timer?.remaining_time_in_seconds ?? 0));

    if (!timer) {
        return null;
    }

    return <Stack direction="row" alignContent="center" alignItems="center">
        <IconButton color="inherit">
            <AlarmTwoTone />
        </IconButton>
        <Typography variant="h4">
            {`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}
        </Typography>
    </Stack>;
};

AsssementTimer.propTypes = {
    assessment: PropTypes.object.isRequired,
    questionnaire: PropTypes.object.isRequired,
    timer: PropTypes.object.isRequired,
}

const Index = ({ attempts }) => {

    const [isScreenSizeTooSmall, setIsScreenSizeTooSmall] = useState(
        window.devicePixelRatio === 1 && (
            window.innerWidth / screen.availWidth < ALLOWED_BASE_SCREEN_SIZE_RATIO.width ||
            window.innerHeight / screen.availHeight < ALLOWED_BASE_SCREEN_SIZE_RATIO.height
        ) || window.devicePixelRatio < 0.85 || window.devicePixelRatio > 1.25
    );

    const { assessment, errors, flashMessage, timer } = usePage().props;
    const { submit: flashMessageSubmit } = flashMessage;
    const [openFlashMessageSubmit, setOpenFlashMessageSubmit] = React.useState(true);

    const {
        name,
        questionnaire,
        answers,
    } = assessment || {};

    const {
        sections,
        title: questionnaireTitle,
    } = questionnaire || {};

    const maxAssessmentBlurAttempts = attempts?.max;
    const [showReminder, setShowReminder] = React.useState(false);

    const handleSubmitAssessment = (e) => {
        e.preventDefault();
        router.post('/submit-assessment', {
            code: assessment.code,
        });
    };

    const handleTakeAssessment = (e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const requestPayload = {
            code: data.get('code'),
        };
        router.get('/take-assessment', requestPayload, {
            preserveScroll: true,
        });
    };

    const handleVisibilityChangeAssessment = useCallback(() => {
        if (isScreenSizeTooSmall) {
            return;
        }
        if (maxAssessmentBlurAttempts !== null && document.hidden) {
            router.post('/window-switch', {
                code: assessment.code,
            }, {
                preserveScroll: true,
            });
        }
        setShowReminder(true);
    }, [assessment, isScreenSizeTooSmall, maxAssessmentBlurAttempts]);

    const [dimScreen, setDimScreen] = useState(false);
    useEffect(() => {
        // disable text selection, cut, copy and paste
        document.body.style.WebkitTouchCallout = 'none';
        document.body.style.WebkitUserSelect = 'none';
        document.body.style.KhtmlUserSelect = 'none';
        document.body.style.MozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
        document.body.style.userSelect = 'none';
        document.body.oncontextmenu = () => false;
        document.body.oncopy = () => false;
        document.body.oncut = () => false;
        document.body.onpaste = () => false;

        const eventTypes = ['keydown', 'wheel'];
        eventTypes.forEach((eventType) => {
            document.addEventListener(eventType, (event) => {
                if (
                    event.altKey === true ||
                    event.ctrlKey === true ||
                    // event.metaKey === true ||
                    event.shiftKey === true
                    // || (event.keyCode >= 112 && event.keyCode <= 123)
                ) {
                    event.preventDefault();
                    assessment && setDimScreen(true);
                }
            }, { passive: false });
        });

        // check screen size
        window.onresize = () => {
            const isScreenSizeTooSmall =
                window.devicePixelRatio === 1 && (
                    window.innerWidth / screen.availWidth < ALLOWED_BASE_SCREEN_SIZE_RATIO.width ||
                    window.innerHeight / screen.availHeight < ALLOWED_BASE_SCREEN_SIZE_RATIO.height
                ) || window.devicePixelRatio < 0.80 || window.devicePixelRatio > 1.5;
            setIsScreenSizeTooSmall(isScreenSizeTooSmall);
            if (isScreenSizeTooSmall) {
                setShowReminder(false);
            }
        };
    }, [assessment, dimScreen]);

    useEffect(() => {
        document.onmouseleave = () => {
            if (assessment && !isScreenSizeTooSmall && !showReminder) {
                if (maxAssessmentBlurAttempts !== null) {
                    router.post('/window-switch', {
                        code: assessment.code,
                    }, {
                        preserveScroll: true,
                    });
                }
                setShowReminder(true);
            }
        };
    }, [assessment, isScreenSizeTooSmall, maxAssessmentBlurAttempts, showReminder]);

    React.useEffect(() => {
        if (assessment) {
            window.addEventListener("visibilitychange", handleVisibilityChangeAssessment);
        } else {
            window.removeEventListener("visibilitychange", handleVisibilityChangeAssessment);
        }
        return () => window.removeEventListener("visibilitychange", handleVisibilityChangeAssessment);
    }, [assessment, handleVisibilityChangeAssessment])

    if (dimScreen) {
        return <ThemeProvider theme={theme}>
            <Box
                position="fixed"
                top={0}
                left={0}
                width="100vw"
                height="100vh"
                bgcolor="maroon"
                color="white"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                zIndex={1300}
            >
                <Block sx={{ fontSize: 175 }} />
                <Typography width="80%" variant="h5" align="center">
                    Keyboard shortcuts and function keys are disabled during the assessment.
                    Please refrain from using them to ensure a smooth and uninterrupted experience.
                    If you need to use these functions, please exit the assessment first.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => {
                        router.reload({
                            preserveScroll: true,
                            onSuccess: () => setDimScreen(false),
                        });
                    }}
                >
                    Return to Assessment
                </Button>
            </Box>
        </ThemeProvider>;
    }

    return (
        <ThemeProvider theme={theme}>
            <Container
                maxWidth="lg"
            >
                {!assessment && <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="90vh"
                >
                    <Head>
                        <title>Start</title>
                    </Head>
                    <Box
                        component="form"
                        textAlign="center"
                        onSubmit={handleTakeAssessment}
                        noValidate sx={{ mt: 1 }}
                    >
                        <Avatar sx={{ m: "auto", bgcolor: 'secondary.main' }}>
                            <TopicSharp />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Take Assessment
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <TextField
                            error={!!errors.code}
                            helperText={errors?.code}
                            margin="normal"
                            required
                            fullWidth
                            label="Code"
                            name="code"
                            autoComplete={false}
                            autoFocus
                        />
                        <Divider sx={{ my: 2 }} />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Start
                        </Button>
                    </Box>

                    {!!flashMessageSubmit && <Snackbar
                        open={openFlashMessageSubmit}
                        autoHideDuration={5000}
                        anchorOrigin={{ horizontal: "center", vertical: "top" }}
                        onClose={() => setOpenFlashMessageSubmit(false)}>
                        <Alert
                            severity={flashMessageSubmit.severity}>
                            {flashMessageSubmit.message}
                        </Alert>
                    </Snackbar>}

                </Box>}

                {questionnaire && <>
                    <Head>
                        <title>{`${name} (${assessment.code})`}</title>
                    </Head>
                    <React.Fragment>
                        <AppBar position="fixed">
                            <Toolbar>
                                <Stack sx={{ flexGrow: 1 }}>
                                    <Stack direction="row" alignContent="center" alignItems="center">
                                        <IconButton color="inherit">
                                            <AccountCircleTwoTone />
                                        </IconButton>
                                        <Typography sx={{ flexGrow: 1 }} variant="h5">{name}</Typography>
                                    </Stack>
                                    <Stack direction="row" alignContent="center" alignItems="center">
                                        <IconButton color="inherit">
                                            <TopicSharp />
                                        </IconButton>
                                        <Typography sx={{ flexGrow: 1 }} variant="subtitle1">{questionnaireTitle}</Typography>
                                    </Stack>
                                </Stack>
                                <AsssementTimer assessment={assessment} questionnaire={questionnaire} timer={timer} />
                            </Toolbar>
                        </AppBar>
                        <Toolbar />
                    </React.Fragment>
                </>}

                {questionnaire && <Paper elevation={10} sx={{ mt: 5, mb: 5, p: 5 }}>
                    <Paper elevation={2} sx={{ mb: 2, p: 2 }}>
                        <Typography>
                            <div dangerouslySetInnerHTML={{ __html: questionnaire.description }}></div>
                        </Typography>
                    </Paper>
                    <Stack spacing={2} sx={{ mb: 2 }}>
                        {sections.map((section) => (<Box key={`section-${section.id}`}>
                            <Paper elevation={2} sx={{ mb: 2, p: 2 }}>
                                <Typography>
                                    <div dangerouslySetInnerHTML={{ __html: section.description }}></div>
                                </Typography>
                            </Paper>
                            <Stack spacing={2}>
                                {section.questions.map((question, i) => (
                                    <SectionQuestion
                                        key={`section-${section.id}-question-${question.id}`}
                                        assessment={assessment}
                                        section={section}
                                        question={question}
                                        i={i}
                                        answers={answers} />
                                ))}
                            </Stack>
                        </Box>))}
                    </Stack>
                    <Fab
                        color="primary"
                        onClick={handleSubmitAssessment}
                        sx={{
                            position: 'fixed',
                            bottom: 16,
                            right: 16,
                        }}
                        variant="extended"
                    >
                        <SendSharp sx={{ mr: 1 }} />
                        Submit
                    </Fab>
                </Paper>}

                {showReminder && <StayFocusedDialog onContinue={() => {
                    setShowReminder(false);
                }} />}

                {isScreenSizeTooSmall && !showReminder && <ScreenSizeTooSmallDialog />}
            </Container>
        </ThemeProvider>
    );
};

Index.propTypes = {
    assessment: PropTypes.object,
    answers: PropTypes.array,
    errors: PropTypes.object,
    timer: PropTypes.object,
    attempts: PropTypes.object,
};

export default Index;

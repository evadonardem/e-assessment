import { Head, router, usePage } from '@inertiajs/react';
import {
  AccountBoxSharp,
  AccountCircleTwoTone,
  AlarmTwoTone,
  HighlightOffTwoTone,
  InfoTwoTone,
  PsychologyTwoTone,
  SchoolTwoTone,
  SendSharp,
  TimerTwoTone,
  TopicSharp,
  VisibilityTwoTone,
  WarningTwoTone
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
  DialogTitle,
  Divider,
  Icon,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Typography
} from '@mui/material';
import React from 'react';
import { useTimer } from 'react-timer-hook';

const Index = ({ assessment, answers, errors, timer, attempts }) => {
  const { flashMessage } = usePage().props;
  const { submit: flashMessageSubmit } = flashMessage;
  const [openFlashMessageSubmit, setOpenFlashMessageSubmit] = React.useState(true);

  const questionnaire = assessment ? assessment.questionnaire : null;
  const name = assessment ? assessment.name : null;
  const questionnaireTitle = questionnaire ? questionnaire.title : null;
  const sections = questionnaire ? questionnaire.sections : null;

  const maxAssessmentBlurAttempts = attempts?.max;
  const [showReminder, setShowReminder] = React.useState(false);

  const { hours, minutes, seconds } = useTimer({
    autoStart: !!questionnaire && !!timer,
    expiryTimestamp: (new Date()).setSeconds((new Date()).getSeconds() + (timer?.remaining_time_in_seconds ?? 0)),
    onExpire: () => {
      router.post('/submit-assessment', {
        code: assessment.code,
        timeExpired: 1,
      });
    },
  });

  const handleAnswer = (section, option) => (e) => {
    e.preventDefault();
    router.post('/answers', {
      code: assessment.code,
      questionnaire_section_id: section.id,
      question_id: option.question_id,
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
    router.get('/', requestPayload, {
      preserveScroll: true,
    });
  };

  const handleBlurAssessment = React.useCallback(() => {
    if (maxAssessmentBlurAttempts !== null) {
      router.post('/window-switch', {
        code: assessment.code,
      }, {
        preserveScroll: true,
      });
    }
    setShowReminder(true);
  }, [setShowReminder]);

  React.useEffect(() => {
    if (assessment) {
      window.addEventListener("blur", handleBlurAssessment)
    } else {
      window.removeEventListener("blur", handleBlurAssessment)
    }

    return () => window.removeEventListener("blur", handleBlurAssessment)
  }, [assessment, handleBlurAssessment])

  return (
    <Container>
      {!assessment && <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Head>
          <title>Start</title>
        </Head>
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <TopicSharp />
        </Avatar>
        <Typography component="h1" variant="h5">
          Take Assessment
        </Typography>
        <Box component="form" onSubmit={handleTakeAssessment} noValidate sx={{ mt: 1 }}>
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
              {timer &&
                <Stack direction="row" alignContent="center" alignItems="center">
                  <IconButton color="inherit">
                    <AlarmTwoTone />
                  </IconButton>
                  <Typography variant="h4">
                    {`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}
                  </Typography>
                </Stack>}
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
                <Box key={`section-${section.id}-question-${question.id}`}>
                  <Stack direction="row">
                    <Button
                      disabled
                      size="large"
                      variant="text">
                      {`${i + 1}`}
                    </Button>
                    <Typography sx={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", KhtmlUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", userSelect: "none" }}>
                      <div dangerouslySetInnerHTML={{ __html: question.description }}></div>
                    </Typography>
                  </Stack>
                  <Stack sx={{ ml: 8 }}>
                    {question.type.code.toLowerCase() === 'mcq' && question.options.map((option, j) => (
                      <Stack key={`section-${section.id}-question-${question.id}-option-${option.id}`} direction="row" spacing={2}>
                        <Button
                          color={!!answers.find((ans) => ans.questionnaire_section_id == section.id &&
                            ans.question_id == question.id &&
                            ans.option_id == option.id) ? "primary" : "inherit"}
                          onClick={handleAnswer(section, option)}
                          size="small"
                          variant="contained">
                          {`${String.fromCharCode(65 + j)}`}
                        </Button>
                        <Typography sx={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", KhtmlUserSelect: "none", MozUserSelect: "none", msUserSelect: "none", userSelect: "none" }}>
                          <div dangerouslySetInnerHTML={{ __html: option.description }}></div>
                        </Typography>
                      </Stack>
                    ))}
                    {question.type.code.toLowerCase() === 'arq' && <ButtonGroup
                      fullWidth
                      sx={{ width: "25%" }}
                      variant="contained">
                      <Button
                        color={!!answers.find((ans) => ans.questionnaire_section_id == section.id &&
                          ans.question_id == question.id &&
                          ans.is_true !== null &&
                          !!ans.is_true) ? "primary" : "inherit"}
                        onClick={handleAnswerAlternateResponseQuestion(section, question, true)}
                        size="small">
                        True
                      </Button>
                      <Button
                        color={!!answers.find((ans) => ans.questionnaire_section_id == section.id &&
                          ans.question_id == question.id &&
                          ans.is_true !== null &&
                          !!!ans.is_true) ? "primary" : "inherit"}
                        onClick={handleAnswerAlternateResponseQuestion(section, question, false)}
                        size="small">
                        False
                      </Button>
                    </ButtonGroup>}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>))}
        </Stack>
        <Button
          color="primary"
          fullWidth
          onClick={handleSubmitAssessment}
          startIcon={<SendSharp />}
          variant="contained">Submit</Button>
      </Paper>}

      {questionnaire && <Dialog
        fullWidth
        open={showReminder}
        PaperProps={{
          component: 'form',
          onSubmit: (e) => {
            e.preventDefault();
            setShowReminder(false);
          },
        }}>
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Icon><InfoTwoTone /></Icon>
            <Typography variant="h5">Reminders</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Divider />
          <Stack direction="row" alignItems="center" spacing={2}>
            <Icon><VisibilityTwoTone /></Icon>
            <Typography>
              Direct your attention solely to the exam interface or application that is open.
            </Typography>
          </Stack>
          <Divider />
          <Stack direction="row" alignItems="center" spacing={2}>
            <Icon><HighlightOffTwoTone /></Icon>
            <Typography>
              Refrain from clicking or interacting with any elements outside the exam window.
            </Typography>
          </Stack>
          <Divider />
          <Stack direction="row" alignItems="center" spacing={2}>
            <Icon><TimerTwoTone /></Icon>
            <Typography>
              Make the most of the allocated time by concentrating on answering questions rather than switching windows.
            </Typography>
          </Stack>
          <Divider />
          <Stack direction="row" alignItems="center" spacing={2}>
            <Icon><PsychologyTwoTone /></Icon>
            <Typography>
              Understand that switching windows during the exam could be interpreted as cheating and may have serious consequences.
            </Typography>
          </Stack>
          <Divider />
          <Stack direction="row" alignItems="center" spacing={2}>
            <Icon><SchoolTwoTone /></Icon>
            <Typography>
              Consider the importance of academic integrity and how adhering to the rule of not switching windows contributes to maintaining it.
            </Typography>
          </Stack>
          <Divider />
          <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
            Auto-submit will trigger once detected continous attempts.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button type="submit">Continue</Button>
        </DialogActions>
      </Dialog>}

    </Container>
  );
};

export default Index;
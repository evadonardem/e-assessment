import { router } from '@inertiajs/react';
import {
  AccountBoxSharp,
  SendSharp,
  TopicSharp
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  ButtonGroup,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import React from 'react';

const Index = ({ assessment, answers, errors }) => {
  const questionnaire = assessment ? assessment.questionnaire : null;
  const name = assessment ? assessment.name : null;
  const questionnaireTitle = questionnaire ? questionnaire.title : null;
  const sections = questionnaire ? questionnaire.sections : null;

  const [isActive, setIsActive] = React.useState(true);
  const countAssesmentBlurAttempts = React.useRef(0);

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

  const handleBlurAssessment = () => {
    if (assessment) {
      ++countAssesmentBlurAttempts.current;
      setIsActive(false);
    }
  };

  React.useEffect(() => {
    window.addEventListener("blur", handleBlurAssessment);
  }, []);

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
      </Box>}

      {questionnaire && <Paper elevation={1} sx={{ m: 2, p: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Box sx={{flexGrow: 1}}>
            <Stack direction="row" spacing={2}>
              <AccountBoxSharp />
              <Typography variant='h5'>{name}</Typography>
            </Stack>
          </Box>
          <Box sx={{flexGrow: 1}}>
            <Stack direction="row" spacing={2}>
              <TopicSharp />
              <Typography variant='h5'>{questionnaireTitle}</Typography>
            </Stack>
          </Box>
        </Stack>

        <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
          <Typography>
            <div dangerouslySetInnerHTML={{ __html: questionnaire.description }}></div>
          </Typography>
        </Paper>

        <Stack spacing={2} sx={{ mb: 2 }}>
          {sections.map((section) => (<Box key={`section-${section.id}`}>
            <Paper elevation={1} sx={{ mb: 2, p: 2 }}>
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

      <Dialog
        id={`dialog-assessment-blur-${countAssesmentBlurAttempts.current}`}
        fullWidth
        maxWidth='sm'
        open={!isActive}
        PaperProps={{
          component: 'form',
          onSubmit: (e) => {
            e.preventDefault();
            setIsActive(true);
          },
        }}>
          <DialogTitle>Reminders</DialogTitle>
          <DialogContent>
            <Typography>Your not allowed to switch windows in the duration of your assessment.</Typography>
            <Typography>Attempts: {countAssesmentBlurAttempts.current}</Typography>
          </DialogContent>
          <DialogActions>
            <Button type="submit">Continue</Button>
          </DialogActions>
      </Dialog>

    </Container>
  );
};

export default Index;
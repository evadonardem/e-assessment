import { Box, Button, Divider, Stack, Typography } from '@mui/material';
import TakeAssessmentLayout from '../TakeAssessmentLayout';
import { AccountBoxSharp, TopicSharp } from '@mui/icons-material';
import { router } from '@inertiajs/react';

const Show = ({ assessment }) => {
  const { questionnaire, name } = assessment;
  const { description, sections } = questionnaire;

  const handleAnswer = (option) => (e) => {
    e.preventDefault();
    router.post('/answers', {
      code: assessment.code,
      question_id: option.question_id,
      option_id: option.id,
    }, {
      onSuccess: () => alert('greatness'),
      only: false,
    });
  };

  return (
    <>
      {questionnaire && <Box>
        <Stack direction="row" spacing={2}>
          <TopicSharp />
          <Typography variant='h5'>{description}</Typography>
        </Stack>
        <Stack direction="row" spacing={2}>
          <AccountBoxSharp />
          <Typography>{name}</Typography>
        </Stack>
        <Divider />
        <Stack spacing={2}>
          {sections.map((section) => (<Box>
            <Typography>
              <div dangerouslySetInnerHTML={{ __html: section.description }}></div>
            </Typography>

            <Stack spacing={2}>
              {section.questions.map((question, i) => (
                <Box>
                  <Stack direction="row">
                    <Button
                      color="info"
                      disabled
                      size="large"
                      variant="text">
                      {`${i + 1}`}
                    </Button>
                    <Typography>
                      <div dangerouslySetInnerHTML={{ __html: question.description }}></div>
                    </Typography>
                  </Stack>
                  <Stack sx={{ ml: 8 }}>
                    {question.question_type_id === 1 && question.options.map((option, j) => (
                      <Stack direction="row" spacing={2}>
                        <Button
                          onClick={handleAnswer(option)}
                          size="small"
                          variant="contained">
                          {`${String.fromCharCode(65 + j)}`}
                        </Button>
                        <Typography>
                          <div dangerouslySetInnerHTML={{ __html: option.description }}></div>
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>

          </Box>))}
        </Stack>
      </Box>}
    </>
  );
};

Show.layout = page => <TakeAssessmentLayout children={page} title="Take Assessment" />

export default Show;
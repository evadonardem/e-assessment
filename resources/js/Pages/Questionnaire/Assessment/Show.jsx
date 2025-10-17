import { keyBy } from 'lodash';
import { Box, Divider, Grid, Paper, Stack, Typography } from '@mui/material';
import Layout from '../../Layout';
import React from 'react';
import { CheckBox, DisabledByDefault, Password, Person, Quiz, Receipt, Score } from '@mui/icons-material';

const Show = ({ assessment, result }) => {
  const {
    data: {
      name,
      code,
      questionnaire,
      answers,
    },
  } = assessment;

  const {
    sections,
    title,
  } = questionnaire;

  const {
    totalScore,
    totalItems,
  } = result;

  const answersKeySectionAndQuestionId = keyBy(answers, (ans) => `${ans.section_id}-${ans.question_id}`);

  return <React.Fragment>
      <Box alignItems="flex-start" display="flex" marginBottom={1} gap={1}>
        <Person/>
        <Typography>{name}</Typography>
      </Box>
      <Box alignItems="flex-start" display="flex" marginBottom={1} gap={1}>
        <Password/>
        <Typography>{code}</Typography>
      </Box>
      <Box alignItems="flex-start" display="flex" marginBottom={1} gap={1}>
        <Receipt/>
        <Typography>{totalScore} / {totalItems}</Typography>
      </Box>
      <Box alignItems="flex-start" display="flex" marginBottom={1} gap={1}>
        <Quiz/>
        <Typography>{title}</Typography>
      </Box>
      <Divider/>
      <Box>
        <div dangerouslySetInnerHTML={{ __html: questionnaire.description }} />
      </Box>
      {sections.map((section) => {
        return <Box key={`section-${section.id}`}>
          <div dangerouslySetInnerHTML={{ __html: section.description }} />
          {section.questions.map((question, index) => {

            const ansARQ = answersKeySectionAndQuestionId[`${section.id}-${question.id}`]?.is_true ?? null;
            const ansMCQ = answersKeySectionAndQuestionId[`${section.id}-${question.id}`]?.option ?? null;

            return <Box key={`question-${question.id}`} marginBottom={2}>
              <Grid container marginBottom={2}>
                <Grid>
                  {
                    (question.type.code === 'ARQ' && ansARQ === question.is_true) ||
                    (question.type.code === 'MCQ' && ansMCQ && ansMCQ.is_correct)
                      ? <CheckBox htmlColor="green" fontSize="small" />
                      : <DisabledByDefault htmlColor="red" fontSize="small" />
                  }
                </Grid>
                <Grid>
                  {`${index + 1}.`}
                </Grid>
                <Grid flex={1}>
                  <div dangerouslySetInnerHTML={{ __html: question.description }} />
                </Grid>
              </Grid>

              {question.type.code === 'ARQ' &&
                <Box>
                  <Typography variant="subtitle1">The given statement is {question.is_true ? 'true' : 'false'}.</Typography>
                  <Typography variant="subtitle2">Your answer: 
                    {answersKeySectionAndQuestionId[`${section.id}-${question.id}`]
                      ? (answersKeySectionAndQuestionId[`${section.id}-${question.id}`].is_true ? 'true' : 'false')
                      : 'No response' }</Typography>
                </Box>}

              {question.type.code === 'MCQ' && <Stack spacing={1}>
                {question.options.map((option, index) => {
                  let selectedOptionBgColor;
                  if (option.id === ansMCQ?.id) {
                    selectedOptionBgColor = option.is_correct ? "yellowgreen" : "orange";
                  }
                  return <Grid key={`option-${option.id}`} container paddingLeft={3} bgcolor={
                      selectedOptionBgColor ?? (option.is_correct ? "lightgreen" : "inherit")
                    }>
                    <Grid>{String.fromCharCode(65 + index)}.</Grid>
                    <Grid flex={1}>
                      <div dangerouslySetInnerHTML={{ __html: option.description }} />
                    </Grid>
                  </Grid>;
                })}
              </Stack>}
              
            </Box>;
          })}
        </Box>
      })}
  </React.Fragment>;
};

Show.layout = page => <Layout children={page} title="Assessment Result" />

export default Show;
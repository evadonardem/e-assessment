import { router } from '@inertiajs/react';
import { Settings } from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Typography
} from '@mui/material';
import Editor from 'jodit-react';
import Layout from '../Layout';
import React from 'react';

const Create = ({ question_types: questionTypes }) => {
  const [selectedQuestionType, setSelectedQuestionType] = React.useState(questionTypes[0]);
  const [isSaveAndPublish, setIsSaveAndPublish] = React.useState(false);

  const handleChangeEditor = (ref) => (newContent) => {
    const value = newContent;
    const isEmpty = value.replace(/(<([^>]+)>)/ig, "").trim() === '';
    const currQuestion = question;
    const { options: currOptions } = currQuestion;

    if (ref === 'question-stem') {
      currQuestion.description = value;
      currQuestion.isEmpty = isEmpty;
      setQuestion((question) => ({
        ...question,
        description: value,
        isEmpty,
      }));
    }

    if (ref.startsWith('question-option-description-')) {
      const optionIndex = ref.replace('question-option-description-', '');
      currOptions[optionIndex] = {
        ...currOptions[optionIndex],
        description: value,
        isEmpty,
      };
      setQuestion((question) => ({
        ...question,
        options: currOptions,
      }));
    }

    let ableToSave = !currQuestion.isEmpty;

    if (selectedQuestionType.code === 'mcq') {
      currQuestion.options.forEach((option) => {
        ableToSave = ableToSave && !option.isEmpty;
      });
    }

    setCanSave(ableToSave);
  };

  const handleClickCheckbox = (e) => {
    e.stopPropagation();
    const ref = e.target.id;
    const checked = e.target.checked;
    const currQuestion = question;

    if (ref.startsWith('question-option-is-correct-')) {
      const optionIndex = ref.replace('question-option-is-correct-', '');
      const { options: currOptions } = currQuestion;
      currOptions[optionIndex] = {
        ...currOptions[optionIndex],
        isCorrect: checked,
      };
      setQuestion((question) => ({
        ...question,
        options: currOptions,
      }));
    }

    if (ref.startsWith('question-randomized-options')) {
      currQuestion.isRandomOptions = checked;
      setQuestion((question) => ({
        ...question,
        isRandomOptions: checked,
      }));
    }
  };

  const handleClickRadioButton = (e) => {
    e.preventDefault();
    const currQuestion = question;
    currQuestion.isTrue = +e.target.value === 1;
    setQuestion((question) => ({
      ...question,
      ...currQuestion,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const options = question.options.map((option) => ({
      description: option.description,
      is_correct: option.isCorrect,
    }));
    const data = {
      description: question.description,
      question_type_id: selectedQuestionType.id,
      is_random_options: question.isRandomOptions,
      is_published: isSaveAndPublish,
    };

    if (selectedQuestionType.code.toLowerCase() === 'mcq') {
      data.options = options;
    } else if (selectedQuestionType.code.toLowerCase() === 'arq') {
      data.is_true = question.isTrue;
    }

    router.post('/questions', data);
  };

  const questionInitialState = {
    description: '',
    isEmpty: true,
    isRandomOptions: false,
    isTrue: null,
    options: [],
  };

  let options = [];
  for (let i = 0; i < 4; i++) {
    options.push(<Accordion key={`option${i}`}>
      <AccordionSummary>
        <FormControlLabel
          control={<Checkbox id={`question-option-is-correct-${i}`} onClick={handleClickCheckbox} />}
          label={`Option ${i + 1}`}
          onClick={(e) => e.stopPropagation()} />
      </AccordionSummary>
      <AccordionDetails>
        <Editor onChange={handleChangeEditor(`question-option-description-${i}`)} value="" />
      </AccordionDetails>
    </Accordion>);
    questionInitialState.options.push({
      description: '',
      isCorrect: false,
      isEmpty: true,
    });
  }

  const [canSave, setCanSave] = React.useState(false);
  const [question, setQuestion] = React.useState(questionInitialState);

  const handleChangeQuestionType = (e) => {
    e.preventDefault();
    const newSelectedQuestionType = questionTypes.find((type) => type.id === e.target.value);
    const currQuestion = question;
    let ableToSave = !currQuestion.isEmpty;
    setSelectedQuestionType(newSelectedQuestionType);
    if (newSelectedQuestionType.code.toLowerCase() === 'mcq') {
      currQuestion.options.forEach((option) => {
        ableToSave = ableToSave && !option.isEmpty;
      });
      currQuestion.isTrue = null;
    } else if (newSelectedQuestionType.code.toLowerCase() === 'arq') {
      currQuestion.isTrue = true;
    }
    setCanSave(ableToSave);
    setQuestion((question) => ({
      ...question,
      ...currQuestion,
    }));
  };

  return (
    <>
      <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
        <Link underline='hover' color='inherit' href='/'>Home</Link>
        <Link underline='hover' color='inherit' href='/questions'>Questions</Link>
        <Typography color="text.primary">Add New</Typography>
      </Breadcrumbs>

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <Editor onChange={handleChangeEditor('question-stem')} value="" />
        </Box>
        <Accordion defaultExpanded={true} expanded={true}>
          <AccordionSummary>
            <Stack alignItems='center' direction='row' gap={1}>
              <Settings />
              <Typography>General Settings</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth>
              <InputLabel id="question-type-label">Type</InputLabel>
              <Select
                label="Question Type"
                labelId="question-type-label"
                name=""
                value={selectedQuestionType.id}
                onChange={handleChangeQuestionType}>
                {questionTypes.map((type) => <MenuItem value={type.id}>
                  {type.description}
                </MenuItem>)}
              </Select>
            </FormControl>
            {selectedQuestionType.code.toLowerCase() === 'mcq' && <FormControlLabel
              control={<Checkbox
                id={`question-randomized-options`}
                defaultChecked={question.isRandomOptions}
                checked={question.isRandomOptions}
                onClick={handleClickCheckbox} />}
              label='Random Options'
              onClick={(e) => e.stopPropagation()} />}
          </AccordionDetails>
        </Accordion>
        {selectedQuestionType.code.toLowerCase() === 'mcq' ? options : <Paper elevation={1} sx={{ p: 2 }}>
          <FormControl>
            <FormLabel id="alternate-response-question-radio-buttons-group-label">Answer</FormLabel>
            <RadioGroup
              aria-labelledby="alternate-response-question-radio-buttons-group-label"
              value={question.isTrue || question.isTrue === null ? 1 : 0}
              name='xxxx'
            >
              <FormControlLabel value={1} control={<Radio onClick={handleClickRadioButton} />} label="True" />
              <FormControlLabel value={0} control={<Radio onClick={handleClickRadioButton} />} label="False" />
            </RadioGroup>
          </FormControl>
        </Paper>}
        <ButtonGroup sx={{ mt: 2 }} disabled={!canSave}>
          <Button
            type='submit'
            color='secondary'
            onClick={() => setIsSaveAndPublish(false)}>Save</Button>
          <Button
            type='submit'
            color='primary'
            onClick={() => setIsSaveAndPublish(true)}>Save and Publish</Button>
        </ButtonGroup>
      </form>
    </>
  );
};

Create.layout = page => <Layout children={page} title="Create Question" />

export default Create;
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
import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const Create = ({ question_types: questionTypes }) => {
    const [selectedQuestionType, setSelectedQuestionType] = React.useState(questionTypes[0]);
    const [isSaveAndPublish, setIsSaveAndPublish] = React.useState(false);
    const [canSave, setCanSave] = React.useState(false);

    const questionInitialState = {
        description: '',
        isEmpty: true,
        isRandomOptions: false,
        isTrue: null,
        options: [],
    };
    const [question, setQuestion] = React.useState(questionInitialState);

    const handleChangeEditor = useCallback((ref) => (newContent) => {
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

        if (selectedQuestionType.code.toLowerCase() === 'mcq') {
            currOptions.forEach((option) => {
                ableToSave = ableToSave && !option.isEmpty;
            });
        }

        setCanSave(ableToSave);
    }, [question, selectedQuestionType]);

    const handleClickCheckbox = useCallback((e) => {
        e.stopPropagation();
        const ref = e.target.id;
        const checked = e.target.checked;
        const currQuestion = question;

        if (ref.startsWith('question-option-is-correct-')) {
            const optionIndex = +ref.replace('question-option-is-correct-', '');
            const { options: currOptions } = currQuestion;
            const updatedOptions = currOptions.map((option, index) =>
                index === optionIndex
                    ? { ...option, isCorrect: checked }
                    : option
            );

            setQuestion((question) => ({
                ...question,
                options: updatedOptions,
            }));
        }

        if (ref.startsWith('question-randomized-options')) {
            setQuestion((question) => ({
                ...question,
                isRandomOptions: checked,
            }));
        }
    }, [question]);

    const handleClickRadioButton = (e) => {
        e.preventDefault();
        setQuestion((question) => ({
            ...question,
            isTrue: +e.target.value === 1,
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

    const handleChangeQuestionType = (e) => {
        e.preventDefault();
        const newSelectedQuestionType = questionTypes.find((type) => type.id === e.target.value);
        let ableToSave = !question.isEmpty;
        let isTrue = null;
        setSelectedQuestionType(newSelectedQuestionType);
        if (newSelectedQuestionType.code.toLowerCase() === 'mcq') {
            question.options.forEach((option) => {
                ableToSave = ableToSave && !option.isEmpty;
            });
            isTrue = null;
        } else if (newSelectedQuestionType.code.toLowerCase() === 'arq') {
            isTrue = true;
        }
        setCanSave(ableToSave);
        setQuestion((question) => ({
            ...question,
            isTrue,
        }));
    };

    const initOptions = useCallback(() => {
        let questionOptions = [];
        for (let i = 0; i < 4; i++) {
            questionOptions.push({
                description: '',
                isCorrect: false,
                isEmpty: true,
            });
        }
        setQuestion((question) => ({
            ...question,
            options: questionOptions,
        }));
    }, []);

    useEffect(() => {
        if (question.options.length === 0 && selectedQuestionType.code.toLowerCase() === 'mcq') {
            (() => initOptions())();
        }
    }, [question, selectedQuestionType, initOptions]);

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
                                {questionTypes.map((type) => <MenuItem key={`question-type-${type.id}`} value={type.id}>
                                    {type.description}
                                </MenuItem>)}
                            </Select>
                        </FormControl>
                        {selectedQuestionType.code.toLowerCase() === 'mcq' && <FormControlLabel
                            control={<Checkbox
                                id={`question-randomized-options`}
                                checked={question.isRandomOptions}
                                onClick={handleClickCheckbox} />}
                            label='Random Options'
                            onClick={(e) => e.stopPropagation()} />}
                    </AccordionDetails>
                </Accordion>
                {selectedQuestionType.code.toLowerCase() === 'mcq' ? question.options.map((_option, i) => <Accordion key={`option${i}`}>
                    <AccordionSummary>
                        <FormControlLabel
                            control={<Checkbox id={`question-option-is-correct-${i}`} onClick={handleClickCheckbox} />}
                            label={`Option ${i + 1}`}
                            onClick={(e) => e.stopPropagation()} />
                    </AccordionSummary>
                    <AccordionDetails>
                        <Editor onChange={handleChangeEditor(`question-option-description-${i}`)} value="" />
                    </AccordionDetails>
                </Accordion>)
                    : <Paper elevation={1} sx={{ p: 2 }}>
                        <FormControl>
                            <FormLabel id="alternate-response-question-radio-buttons-group-label">Answer</FormLabel>
                            <RadioGroup
                                aria-labelledby="alternate-response-question-radio-buttons-group-label"
                                value={question.isTrue || question.isTrue === null ? 1 : 0}
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

Create.layout = page => (
    <Layout title="Create Question">
        {page}
    </Layout>
)

Create.propTypes = {
    question_types: PropTypes.array.isRequired,
};

export default Create;

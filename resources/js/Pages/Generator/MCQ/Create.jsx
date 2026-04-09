import { router, useForm, usePage } from '@inertiajs/react';
import {
    Alert,
    Autocomplete,
    Breadcrumbs,
    Button,
    ButtonGroup,
    Checkbox,
    createFilterOptions,
    Divider,
    FormControlLabel,
    FormGroup,
    Grid,
    Link,
    Paper,
    Snackbar,
    TextField,
    Typography
} from '@mui/material';
import Layout from '../../Layout';
import PropTypes from 'prop-types';
import { useState } from 'react';

const filter = createFilterOptions();

const AutoHideSnackbar = ({ message, severity = 'info' }) => {
    const [open, setOpen] = useState(true);
    const handleClose = (_event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return <Snackbar open={open}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        autoHideDuration={5000}
        onClose={handleClose}
    >
        <Alert
            onClose={handleClose}
            severity={severity}
            variant="filled"
            sx={{ width: '100%' }}
        >
            {message}
        </Alert>
    </Snackbar>;
};

AutoHideSnackbar.propTypes = {
    message: PropTypes.string.isRequired,
    severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
};

const Create = () => {
    const { generator: { mcq_generated_questions } } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        'topic': '',
        'items_count': 5,
        'complexity_levels': []
    });

    const [tags, setTags] = useState([]);

    const handleQuestionComplexityChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setData('complexity_levels', [...data.complexity_levels, value]);
        } else {
            setData('complexity_levels', data.complexity_levels.filter((v) => v !== value));
        }
    };

    const handleGenerateQuestions = (e) => {
        e.preventDefault();
        post('/generator/mcq/generate');
    };
    const questions = mcq_generated_questions || null;

    return (
        <>
            <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
                <Link underline='hover' color='inherit' href='/'>Home</Link>
                <Typography color="text.primary">MCQ Generator</Typography>
            </Breadcrumbs>

            {!processing && errors.api_service && (
                <AutoHideSnackbar message={errors.api_service} severity="error" />
            )}

            <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
                {!questions && (
                    <form onSubmit={handleGenerateQuestions}>
                        <TextField
                            multiline
                            rows={5}
                            label='Topic'
                            variant='outlined'
                            fullWidth
                            margin='normal'
                            size='small'
                            error={!!errors.topic}
                            helperText={errors.topic}
                            value={data.topic}
                            onChange={(e) => setData('topic', e.target.value)}
                        />

                        <Grid container spacing={2} alignItems='center'>
                            <Grid item>
                                <TextField
                                    label='Number of Items'
                                    variant='outlined'
                                    fullWidth
                                    margin='normal'
                                    type='number'
                                    size='small'
                                    slotProps={{
                                        input: { min: 1, max: 50 }
                                    }}
                                    error={!!errors.items_count}
                                    helperText={errors.items_count}
                                    value={data.items_count}
                                    onChange={(e) => setData('items_count', e.target.value ?? 0)}
                                />
                            </Grid>
                            <Grid item>
                                <FormGroup row sx={{ mt: 1 }}>
                                    <FormControlLabel
                                        control={<Checkbox
                                            value="easy"
                                            checked={data.complexity_levels.includes('easy')}
                                            onChange={handleQuestionComplexityChange} />}
                                        label="Easy" />
                                    <FormControlLabel
                                        control={<Checkbox
                                            value="medium"
                                            checked={data.complexity_levels.includes('medium')}
                                            onChange={handleQuestionComplexityChange} />}
                                        label="Medium" />
                                    <FormControlLabel
                                        control={<Checkbox
                                            value="hard"
                                            checked={data.complexity_levels.includes('hard')}
                                            onChange={handleQuestionComplexityChange} />}
                                        label="Hard" />
                                </FormGroup>
                                {!!errors.complexity_levels && (
                                    <Typography color='error' variant='caption'>{errors.complexity_levels}</Typography>
                                )}
                            </Grid>
                        </Grid>

                        <ButtonGroup sx={{ mt: 2 }}>
                            <Button
                                loading={processing}
                                type='submit'
                                color='primary'
                                variant='contained'
                            >Generate</Button>
                        </ButtonGroup>
                    </form>
                )}

                {questions && (
                    <>
                        <Autocomplete
                            multiple
                            value={tags}
                            onChange={(_event, newValue) => {
                                setTags(newValue);
                            }}
                            filterOptions={(options, params) => {
                                const filtered = filter(options, params);
                                const { inputValue } = params;
                                const isExisting = options.some((option) => inputValue === option.title);
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({
                                        inputValue,
                                        title: `Add "${inputValue}"`,
                                    });
                                }
                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            options={[]}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') {
                                    return option;
                                }
                                if (option.inputValue) {
                                    return option.inputValue;
                                }
                                return option.title;
                            }}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    {option.title}
                                </li>
                            )}
                            freeSolo
                            renderInput={(params) => (
                                <TextField {...params} label="Tags" />
                            )}
                        />
                        <Typography variant='h6' sx={{ mt: 2 }}>Generated Questions:</Typography>
                        <Typography variant='body1' sx={{ mt: 1 }}>
                            {questions.map((question, index) => (
                                <div key={`questtion-${index}`} style={{ marginBottom: '16px' }}>
                                    <strong>Q{index + 1}:</strong>
                                    <div dangerouslySetInnerHTML={{ __html: question.description }} />
                                    <ol type='A'>
                                        {question.options.map((option, optIndex) => (
                                            <li key={optIndex}>
                                                <div dangerouslySetInnerHTML={{ __html: option }} />
                                            </li>
                                        ))}
                                    </ol>
                                    <em>Answer: {String.fromCharCode(65 + question.answer)}</em>
                                </div>
                            ))}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <ButtonGroup>
                            <Button type='button' onClick={() => router.reload()}>Cancel</Button>
                            <Button variant='contained' color='primary' onClick={() => router.post('/generator/mcq/store', {
                                tags,
                                questions
                            })}>Save Copy</Button>
                        </ButtonGroup>
                    </>
                )}
            </Paper>
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

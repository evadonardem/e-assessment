import { router, usePage } from '@inertiajs/react';
import {
  Breadcrumbs,
  Button,
  ButtonGroup,
  Checkbox,
  Divider,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Link,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import Layout from '../../Layout';
import React from 'react';
import PropTypes from 'prop-types';

const Create = () => {
  const { generator: { mcq_generated_questions } } = usePage().props;
  const handleGenerateQuestions = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    data['complexity_levels'] = [];
    if (formData.get('easy')) data['complexity_levels'].push('easy');
    if (formData.get('medium')) data['complexity_levels'].push('medium');
    if (formData.get('hard')) data['complexity_levels'].push('hard');
    delete data['easy'];
    delete data['medium'];
    delete data['hard'];
    router.post('/generator/mcq/generate', data);
  };
  const questions = JSON.parse(mcq_generated_questions || null);

  return (
    <>
      <Breadcrumbs aria-label='breadcrumb' sx={{ mb: 2 }}>
        <Link underline='hover' color='inherit' href='/'>Home</Link>
        <Typography color="text.primary">MCQ Generator</Typography>
      </Breadcrumbs>

      {!questions && (
        <>
          <form onSubmit={handleGenerateQuestions}>
            <TextField
              name='topic'
              label='Topic'
              variant='outlined'
              fullWidth
              margin='normal'
            />

            <FormLabel sx={{ mr: 2 }}>Complexity Levels:</FormLabel>
            <FormGroup row>
              <FormControlLabel name='easy' control={<Checkbox />} label="Easy" />
              <FormControlLabel name='medium' control={<Checkbox />} label="Medium" />
              <FormControlLabel name='hard' control={<Checkbox />} label="Hard" />
            </FormGroup>


            <ButtonGroup sx={{ mt: 2 }}>
              <Button
                type='submit'
                color='primary'
                variant='contained'
              >Generate</Button>
            </ButtonGroup>
          </form>
        </>
      )}

      {questions && (
        <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
          <Typography variant='h6' sx={{ mt: 2 }}>Generated Questions:</Typography>
          <Typography variant='body1' sx={{ mt: 1 }}>
            {questions.map((question, index) => (
              <div key={`questtion-${index}`} style={{ marginBottom: '16px' }}>
                <strong>Q{index + 1}:</strong>
                <div dangerouslySetInnerHTML={{ __html: question.description }}></div>
                <ol type='A'>
                  {question.options.map((option, optIndex) => (
                    <li key={optIndex}>
                      <div dangerouslySetInnerHTML={{ __html: option }}></div>
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
              questions: mcq_generated_questions
            })}>Save Copy</Button>
          </ButtonGroup>
        </Paper>
      )}

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
import { router } from '@inertiajs/react';
import {
  AddCardSharp,
  DeleteTwoTone,
  PlaylistAddSharp,
  Send
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ButtonGroup,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Editor from 'jodit-react';
import Layout from '../Layout';
import React from 'react';
import { BarChart, Gauge, PieChart } from '@mui/x-charts';

const Show = ({ filters, questionnaire, questions, questionTypes, stats }) => {
  const { section_id: sectionId, question_type_code: questionTypeCode, tags } = filters;
  const { sections } = questionnaire;

  const [filteredSectionId, setFilteredSectionId] = React.useState(sectionId);
  const [filteredQuestionTypeCode, setFilteredQuestionTypeCode] = React.useState(questionTypeCode);
  const [filteredTags, setFilteredTags] = React.useState(tags ?? []);

  const handleAddQuestionToSection = (questionId, toSectionId) => (e) => {
    e.preventDefault();
    router.post(`/questionnaires/${questionnaire.id}/sections/${toSectionId}/questions`, {
      question_id: questionId,
    }, {
      preserveScroll: true,
    });
  };

  const handleAddFilterTag = (e) => {
    if (e.keyCode === 13) {
      const newFilteredTags = filteredTags;
      newFilteredTags.push(e.target.value);
      setFilteredTags(newFilteredTags);
      router.get(`/questionnaires/${questionnaire.id}`, {
        filters: {
          ...filters,
          tags: newFilteredTags,
        }
      }, {
        preserveScroll: true,
      });
    }
  };

  const handleAddSection = (e) => {
    e.preventDefault();
    router.post(
      `/questionnaires/${questionnaire.id}/sections`,
      {},
      {
        preserveScroll: true,
      }
    );
  };

  const handleChangeFilteredSectionId = (e) => {
    const newFilteredSectionId = e.target.value;
    setFilteredSectionId(newFilteredSectionId);
    router.get(`/questionnaires/${questionnaire.id}`, {
      filters: {
        section_id: newFilteredSectionId,
      }
    }, {
      preserveScroll: true,
    });
  };

  const handleChangeFilteredQuestionTypeCode = (e) => {
    const newFilteredQuestionTypeCode = e.target.value;
    setFilteredQuestionTypeCode(newFilteredQuestionTypeCode);
    router.get(`/questionnaires/${questionnaire.id}`, {
      filters: {
        ...filters,
        question_type_code: newFilteredQuestionTypeCode,
      }
    }, {
      preserveScroll: true,
    });
  };

  const handleChangeSectionDescription = (sectionId) => (e) => {
    const value = e;
    router.post(`/questionnaires/${questionnaire.id}/sections/${sectionId}`, {
      description: value,
    });
  };

  const handleChangeQuestionnaireDescription = (newContent) => {
    router.patch(`/questionnaires/${questionnaire.id}`, {
      description: newContent,
    });
  };

  const handleDeleteFilterTag = (tag) => () => {
    const updatedFilteredTags = filteredTags;
    const index = updatedFilteredTags.indexOf(tag);

    if (index !== -1) {
      updatedFilteredTags.splice(index, 1);
      setFilteredTags(updatedFilteredTags);
      router.get(`/questionnaires/${questionnaire.id}`, {
        filters: {
          ...filters,
          tags: updatedFilteredTags,
        }
      }, {
        preserveScroll: true,
      });
    }
  };

  const handleDeleteSection = (id) => (e) => {
    e.stopPropagation();
    router.delete(`/questionnaires/${questionnaire.id}/sections/${id}`, {
      onSuccess: () => {
        setFilteredSectionId(null);
        router.get(`/questionnaires/${questionnaire.id}`);
      },
    });
  };

  const handlePublish = (e) => {
    e.preventDefault();
    router.patch(`/questionnaires/${questionnaire.id}`, {
      is_published: true,
    });
  };

  return (
    <>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography variant='h5'>{questionnaire.title}</Typography>
        {!!!questionnaire.is_published ? <Editor
          onBlur={handleChangeQuestionnaireDescription}
          value={questionnaire.description} /> : <Typography>
          <div dangerouslySetInnerHTML={{ __html: questionnaire.description }}></div>
        </Typography>}
        {!!!questionnaire.is_published && <ButtonGroup fullWidth variant="contained">
          <Button
            color="secondary"
            onClick={handleAddSection}
            startIcon={<AddCardSharp />}>
            Add Section
          </Button>
          <Button
            color="primary"
            onClick={handlePublish}
            startIcon={<Send />}>
            Publish
          </Button>
        </ButtonGroup>}
      </Stack>
      <Stack direction="row" spacing={2}>
        {/* Questionnaire Sections */}
        <Box width={!!questionnaire.is_published ? '100%' : '50%'}>
          {sections.map((section, i) => (<Accordion key={`section-${section.id}`}>
            <AccordionSummary>
              <Typography sx={{ flexGrow: 1 }}>
                {`Section ${i + 1}`}
              </Typography>
              {!!!questionnaire.is_published && <IconButton onClick={handleDeleteSection(section.id)}>
                <DeleteTwoTone />
              </IconButton>}
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
                {!!!questionnaire.is_published ? <Editor
                  key={`section-description-${section.id}`}
                  onBlur={handleChangeSectionDescription(section.id)}
                  value={section.description} /> : <Typography>
                  <div dangerouslySetInnerHTML={{ __html: section.description }}></div>
                </Typography>}
              </Paper>
              <Stack spacing={1}>
                {section.questions.map((question, i) => (
                  <Box>
                    <Stack direction="row" spacing={2}>
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
                    <Stack sx={{ ml: 10 }}>
                      <Grid container spacing={2}>
                        <Grid item md={8}>
                          {question.type.code.toLowerCase() === 'mcq' && question.options.map((option, j) => (
                            <Box sx={{ mb: 2 }}>
                              <Stack direction="row" spacing={2}>
                                <Button
                                  color={!!option.is_correct ? "success" : "inherit"}
                                  size="small"
                                  variant="contained">
                                  {`${String.fromCharCode(65 + j)}`}
                                </Button>
                                <Typography>
                                  <div dangerouslySetInnerHTML={{ __html: option.description }}></div>
                                </Typography>
                              </Stack>
                            </Box>
                          ))}
                          {question.type.code.toLowerCase() === 'arq' && <Stack direction="row" spacing={2}>
                            <ButtonGroup variant="contained">
                              <Button
                                color={!!question.is_true ? "success" : "inherit"}
                                size="small">True</Button>
                              <Button
                                color={!!!question.is_true ? "success" : "inherit"}
                                size="small">False</Button>
                            </ButtonGroup>
                          </Stack>}
                        </Grid>
                        <Grid item md={4}>
                          
                        </Grid>
                      </Grid>
                    </Stack>
                    {!!questionnaire.is_published && !!stats && <Stack direction="row" spacing={2}>
                      <Gauge
                        value={stats[`section-${section.id}`][`question-${question.id}`].gauge}
                        height={200}
                        sx={{ flexGrow: 1, width: "100%" }}/>
                      <BarChart
                        dataset={stats[`section-${section.id}`][`question-${question.id}`].barChart.dataset}
                        xAxis={stats[`section-${section.id}`][`question-${question.id}`].barChart.xAxis}
                        yAxis={stats[`section-${section.id}`][`question-${question.id}`].barChart.yAxis}
                        series={stats[`section-${section.id}`][`question-${question.id}`].barChart.series}
                        height={200}
                        sx={{ flexGrow: 1, width: "100%" }}/>
                    </Stack>}
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>))}
        </Box>
        {/* Questions Bucket */}
        {!!!questionnaire.is_published && <Box width="50%">
          <Paper elevation={1} sx={{ p: 2 }}>
            {!!!questionnaire.is_published && !!sections.length && <Box sx={{ mt: 2, mb: 2 }}>
              <Typography>Allocate Questions</Typography>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel id="questionnaire-section-select-label">Section</InputLabel>
                  <Select
                    id='questionnaire-section-select'
                    labelId='questionnaire-section-select-label'
                    label='Section'
                    onChange={handleChangeFilteredSectionId}
                    value={filteredSectionId}>
                    {sections.map((section, i) => (<MenuItem value={section.id}>
                      {`Section ${i + 1}`}
                    </MenuItem>))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="question-type-select-label">Question Type</InputLabel>
                  <Select
                    id='question-type-select'
                    labelId='question-type-select-label'
                    label='Question Type'
                    onChange={handleChangeFilteredQuestionTypeCode}
                    value={filteredQuestionTypeCode}>
                    {questionTypes.map((type, i) => (<MenuItem key={i} value={type.code}>
                      {type.description}
                    </MenuItem>))}
                  </Select>
                </FormControl>
              </Stack>
              <Box sx={{ mb: 2 }}>
                <Stack spacing={2} sx={{ mb: 2 }}>
                  {filteredTags.map((tag) => (<Chip label={tag} onDelete={handleDeleteFilterTag(tag)} />))}
                </Stack>
                <TextField fullWidth label="Add tag filter" variant="outlined" onKeyDown={handleAddFilterTag} />
              </Box>
              <Stack>
                {!!questions.length && questions.map((question) => (<Paper sx={{ mb: 2, p: 2 }}>
                  <Stack spacing={1}>
                    <Typography>
                      <div dangerouslySetInnerHTML={{ __html: question.description }}></div>
                    </Typography>
                    {question.type.code.toLowerCase() === 'mcq' && question.options.map((option, i) => (<Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={2}>
                        <Button color={!!option.is_correct ? "success" : "inherit"} variant="contained">
                          {String.fromCharCode(65 + i)}
                        </Button>
                        <Typography>
                          <div dangerouslySetInnerHTML={{ __html: option.description }}></div>
                        </Typography>
                      </Stack>
                    </Box>))}
                    {question.type.code.toLowerCase() === 'arq' && <ButtonGroup>
                      <Button
                        color={!!question.is_true ? "success" : "inherit"}
                        variant="contained">
                        True
                      </Button>
                      <Button
                        color={!!!question.is_true ? "success" : "inherit"}
                        variant="contained">
                        False
                      </Button>
                    </ButtonGroup>}
                    <Button
                      fullWidth
                      onClick={handleAddQuestionToSection(question.id, filteredSectionId)}
                      startIcon={<PlaylistAddSharp />}
                      variant="contained">
                      Add
                    </Button>
                  </Stack>
                </Paper>))}
              </Stack>
            </Box>}
          </Paper>
        </Box>}
      </Stack>
    </>
  );
};

Show.layout = page => <Layout children={page} title="Questionnaires" />

export default Show;
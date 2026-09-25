import { router } from '@inertiajs/react';
import {
  AddCardSharp,
  Close,
  DeleteTwoTone,
  ListAltTwoTone,
  MenuOpen,
  PlaylistAddSharp,
  Print,
  Send,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Editor from 'jodit-react';
import Layout from '../Layout';
import React, { useRef, useState } from 'react';
import { BarChart, Gauge } from '@mui/x-charts';
import PropTypes from 'prop-types';
import { useReactToPrint } from 'react-to-print';
import slugify from 'slugify';

const Show = ({ filters, questionnaire, questions, questionTypes, stats, questionTags }) => {
  const { section_id: sectionId, question_type_code: questionTypeCode, tags } = filters;
  const { sections, title: questionnaireTitle } = questionnaire;

  const [filteredSectionId, setFilteredSectionId] = React.useState(sectionId);
  const [filteredQuestionTypeCode, setFilteredQuestionTypeCode] = React.useState(questionTypeCode);
  const [filteredTags, setFilteredTags] = React.useState(tags ?? []);

  const { meta: questionsMeta } = questions;

  const [showItemAnalysis, setShowItemAnalysis] = useState(true);
  const [showAnswers, setShowAnswers] = useState(true);

  const handleShowItemAnalysis = () => {
    setShowItemAnalysis(toggle => {
      const updatedToggle = !toggle;
      if (updatedToggle) {
        setShowAnswers(true);
      }
      return updatedToggle;
    });
  };
  const handleShowAnswers = () => setShowAnswers(toggle => !toggle);

  const contentRef = useRef();
  const reactToPrint = useReactToPrint({
    contentRef,
    documentTitle: () => slugify(questionnaireTitle, { lower: true }),
  });

  const handleAddQuestionToSection = (questionId, toSectionId) => (e) => {
    e.preventDefault();
    router.post(`/questionnaires/${questionnaire.id}/sections/${toSectionId}/questions`, {
      question_id: questionId,
    }, {
      preserveScroll: true,
    });
  };

  const handleRemoveQuestionFromSection = (questionId, fromSectionId) => (e) => {
    e.preventDefault();
    router.delete(`/questionnaires/${questionnaire.id}/sections/${fromSectionId}/questions/${questionId}`, {
      preserveScroll: true,
    });
  };

  const handleChangeTags = (_e, value) => {
    setFilteredTags(value);
    router.get(`/questionnaires/${questionnaire.id}`, {
      filters: {
        ...filters,
        tags: value,
      }
    }, {
      preserveScroll: true,
    });
  };

  const handlePaginationChange = (_e, page) => {
    router.get(`/questionnaires/${questionnaire.id}`, {
      filters: {
        ...filters,
        tags: filteredTags,
      },
      page
    }, {
      preserveScroll: true,
      preserveState: true,
    });
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
    router.post(
      `/questionnaires/${questionnaire.id}/sections/${sectionId}`,
      {
        description: value,
      },
      {
        preserveScroll: true,
      }
    );
  };

  const handleChangeQuestionnaireDescription = (newContent) => {
    router.patch(`/questionnaires/${questionnaire.id}`, {
      description: newContent,
    });
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

  const actions = [
    {
      icon: !showItemAnalysis ? <Visibility /> : <VisibilityOff />,
      name: `${!showItemAnalysis ? "Show" : "Hide"} Item Analyis`,
      onClick: handleShowItemAnalysis
    },
    {
      icon: !showAnswers ? <Visibility /> : <VisibilityOff />,
      name: `${!showAnswers ? "Show" : "Hide"} Answers`,
      hidden: showItemAnalysis,
      onClick: handleShowAnswers
    },
    { icon: <Print />, name: 'Print', onClick: reactToPrint },
  ];

  return (<React.Fragment>

    {!!questionnaire.is_published && <SpeedDial
      ariaLabel="SpeedDial basic example"
      sx={{ position: 'fixed', bottom: 16, right: 16 }}
      icon={<SpeedDialIcon icon={<MenuOpen />} openIcon={<Close />} />}
    >
      {actions.filter(a => !a.hidden).map((action) => (
        <SpeedDialAction
          key={action.name}
          icon={action.icon}
          slotProps={{
            tooltip: {
              title: action.name,
            },
          }}
          onClick={action.onClick}
        />
      ))}
    </SpeedDial>}

    <Box ref={contentRef} id={`questionnaire-${questionnaire.id}`}>
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography textAlign="center" variant='h5'>{questionnaireTitle}</Typography>
        {!questionnaire.is_published ? <Editor
          onBlur={handleChangeQuestionnaireDescription}
          value={questionnaire.description} /> : <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
          <div dangerouslySetInnerHTML={{ __html: questionnaire.description }} />
        </Paper>}
        {!questionnaire.is_published && <ButtonGroup fullWidth variant="contained">
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
        <Box width={questionnaire.is_published ? '100%' : '50%'}>
          {sections.map((section, i) => (<Accordion key={`section-${section.id}`} defaultExpanded={!!questionnaire.is_published}>
            <AccordionSummary>
              <Typography variant="caption" sx={{ flexGrow: 1 }}>
                {`Section ${i + 1}`}
              </Typography>
              <Badge badgeContent={section.questions.length} color='primary' sx={{ mt: 1 }}>
                <ListAltTwoTone />
              </Badge>
              {!questionnaire.is_published && <IconButton onClick={handleDeleteSection(section.id)}>
                <DeleteTwoTone />
              </IconButton>}
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={{ mb: 2, p: 2 }} elevation={2}>
                {!questionnaire.is_published ? <Editor
                  key={`section-description-${section.id}`}
                  onBlur={handleChangeSectionDescription(section.id)}
                  value={section.description} /> : <Typography>
                  <div dangerouslySetInnerHTML={{ __html: section.description }} />
                </Typography>}
              </Paper>
              <Stack spacing={1}>
                {section.questions.map((question, i) => (
                  <Box key={`section-${section.id}-question-${question.id}`}>
                    {!questionnaire.is_published && <Box textAlign="right">
                      <IconButton
                        onClick={handleRemoveQuestionFromSection(question.id, section.id)}>
                        <DeleteTwoTone />
                      </IconButton>
                    </Box>}
                    <Stack direction="row" spacing={2}>
                      <Button
                        color="info"
                        disabled
                        size="large"
                        variant="text">
                        {`${i + 1}`}
                      </Button>
                      <Box><div dangerouslySetInnerHTML={{ __html: question.description }} /></Box>
                    </Stack>
                    <Stack sx={{ ml: 10 }}>
                      <Grid container spacing={2}>
                        <Grid size={12}>
                          {question.type.code.toLowerCase() === 'mcq' && question.options.map((option, j) => (
                            <Box key={`section-${section.id}-question-${question.id}-option-${option.id}`} sx={{ mb: 1 }}>
                              <Stack direction="row" spacing={2}>
                                <Button
                                  color={showAnswers && option.is_correct ? "success" : "inherit"}
                                  size="small"
                                  variant="contained">
                                  {`${String.fromCharCode(65 + j)}`}
                                </Button>
                                <Box>
                                  <div dangerouslySetInnerHTML={{ __html: option.description }} />
                                </Box>
                              </Stack>
                            </Box>
                          ))}
                          {question.type.code.toLowerCase() === 'arq' && <Stack direction="row" spacing={2}>
                            <ButtonGroup variant="contained">
                              <Button
                                color={showAnswers && question.is_true ? "success" : "inherit"}
                                size="small">True</Button>
                              <Button
                                color={showAnswers && !question.is_true ? "success" : "inherit"}
                                size="small">False</Button>
                            </ButtonGroup>
                          </Stack>}
                        </Grid>
                      </Grid>
                    </Stack>
                    {!!questionnaire.is_published && !!stats && showItemAnalysis && <Grid container spacing={2}>
                      <Grid size={6}>
                        <Gauge
                          value={stats[`section-${section.id}`][`question-${question.id}`].gauge}
                          height={200}
                          sx={{ width: "100%" }} />
                      </Grid>
                      <Grid size={6}>
                        <BarChart
                          dataset={stats[`section-${section.id}`][`question-${question.id}`].barChart.dataset}
                          xAxis={stats[`section-${section.id}`][`question-${question.id}`].barChart.xAxis}
                          yAxis={stats[`section-${section.id}`][`question-${question.id}`].barChart.yAxis}
                          series={stats[`section-${section.id}`][`question-${question.id}`].barChart.series}
                          height={200}
                          sx={{ width: "100%" }} />
                      </Grid>
                    </Grid>}
                    <Divider sx={{ my: 1 }} />
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>))}
        </Box>
        {/* Questions Bucket */}
        {!questionnaire.is_published && <Box width="50%">
          <Paper elevation={1} sx={{ p: 2 }}>
            {!questionnaire.is_published && !!sections.length && <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body1">Allocate Questions</Typography>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="questionnaire-section-select-label">Section</InputLabel>
                  <Select
                    id='questionnaire-section-select'
                    labelId='questionnaire-section-select-label'
                    label='Section'
                    onChange={handleChangeFilteredSectionId}
                    value={filteredSectionId}>
                    {sections.map((section, i) => <MenuItem key={`questionnaire-section-${section.id}`} value={section.id}>
                      {`Section ${i + 1}`}
                    </MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
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
                <Autocomplete
                  disableCloseOnSelect
                  fullWidth
                  multiple
                  size="small"
                  options={questionTags}
                  value={filteredTags}
                  onChange={handleChangeTags}
                  renderInput={(params) => <TextField {...params} label="Search Tags" />}
                />
              </Box>

              {questionsMeta && <Box sx={{ mb: 2 }}>
                <Pagination
                  onChange={handlePaginationChange}
                  count={questionsMeta.last_page}
                  page={questionsMeta.current_page} />
              </Box>}

              <Stack>
                {!!questions.data.length && questions.data.map((question) => (<Paper key={`available-question-${question.id}`} sx={{ mb: 2, p: 2 }}>
                  <Stack spacing={1}>
                    <TableContainer>
                      <Table size="small">
                        <TableBody>
                          <TableRow>
                            <TableCell colSpan={2}>
                              <div dangerouslySetInnerHTML={{ __html: question.description }} />
                            </TableCell>
                          </TableRow>
                          {question.type.code.toLowerCase() === 'mcq' && question.options.map((option, i) => <TableRow
                            key={`available-question-${question.id}-option-${option.id}`}>
                            <TableCell width={1}>
                              <Button color={option.is_correct ? "success" : "inherit"} size="small" variant="contained">
                                {String.fromCharCode(65 + i)}
                              </Button>
                            </TableCell>
                            <TableCell>
                              <div dangerouslySetInnerHTML={{ __html: option.description }} />
                            </TableCell>
                          </TableRow>)}
                          {question.type.code.toLowerCase() === 'arq' && <TableRow>
                            <TableCell colSpan={2}>
                              <ButtonGroup size="small">
                                <Button
                                  color={question.is_true ? "success" : "inherit"}
                                  variant="contained">
                                  True
                                </Button>
                                <Button
                                  color={!question.is_true ? "success" : "inherit"}
                                  variant="contained">
                                  False
                                </Button>
                              </ButtonGroup>
                            </TableCell>
                          </TableRow>}
                        </TableBody>
                        <TableFooter>
                          <TableRow>
                            <TableCell colSpan={2}>
                              <Stack direction="row" spacing={1}>
                                <Chip label={`Usages: ${question.usages_count}`} color="secondary" />
                                <Chip label={`Total Responses: ${question.answers_count}`} color="secondary" />
                                {question.answers_count > 0 && <>
                                  <Chip label={`Correct Responses: ${question.correct_answers_count}`} color="secondary" />
                                  <Chip
                                    label={`Accuracy: ${(question.correct_answers_count / question.answers_count * 100).toFixed(1)}%`}
                                    color="secondary" />
                                </>}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        </TableFooter>
                      </Table>
                    </TableContainer>

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

              {questionsMeta && <Box sx={{ mb: 2 }}>
                <Pagination
                  onChange={handlePaginationChange}
                  count={questionsMeta.last_page}
                  page={questionsMeta.current_page} />
              </Box>}

            </Box>}
          </Paper>
        </Box>}
      </Stack>
    </Box>
  </React.Fragment>);
};

Show.layout = page => <Layout title="Questionnaires">{page}</Layout>

Show.propTypes = {
  filters: PropTypes.object.isRequired,
  questionnaire: PropTypes.object.isRequired,
  questions: PropTypes.object.isRequired,
  questionTypes: PropTypes.array.isRequired,
  stats: PropTypes.object,
  questionTags: PropTypes.array.isRequired,
};

export default Show;

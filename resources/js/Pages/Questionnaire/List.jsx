import DataTable from 'react-data-table-component';
import Layout from '../Layout'
import { router } from '@inertiajs/react';
import { Box, Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, Icon, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { AddTwoTone, Check, DeleteForever, Edit, PreviewSharp } from '@mui/icons-material';
import React from 'react';
import generatePDF, { Margin, Resolution } from 'react-to-pdf';
const List = ({ questionnaires }) => {
  const [createQuestionnaireModelOpen, setCreateQuestionnaireModelOpen] = React.useState(false);
  const handleCreateQuestionnaire = () => {
    setCreateQuestionnaireModelOpen(true);
  };

  const handleCreateQuestionnaireModalClose = () => {
    setCreateQuestionnaireModelOpen(false);
  };

  const handleDeleteQuestionnaire = (question) => () => {
    router.delete(`/questionnaires/${question.id}`);
  };

  const handleEditQuestionnaire = (question) => () => {
    router.get(`/questionnaires/${question.id}`);
  };

  const columns = [
    {
      name: 'ID',
      selector: row => row.id,
    },
    {
      name: 'Title',
      selector: row => row.title,
    },
    {
      name: 'Published',
      cell: row => (
        <>
          {!!row.is_published && <Icon>
            <Check />
          </Icon>}
        </>
      ),
    },
    {
      name: '',
      button: true,
      cell: row => (
        <ButtonGroup
          color="primary"
          size="small"
          variant="text">
          <Button onClick={handleEditQuestionnaire(row)}>
            {!!!row.is_published ? <Edit /> : <PreviewSharp />}
          </Button>
          <Button onClick={handleDeleteQuestionnaire(row)}>
            <DeleteForever />
          </Button>
        </ButtonGroup>
      ),
    }
  ];

  const data = questionnaires.data;
  const currentPage = questionnaires.current_page;
  const lastPage = questionnaires.last_page;
  const perPage = questionnaires.per_page ?? 10;

  if (currentPage > lastPage) {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('page', lastPage);
    history.pushState(null, null, `?${queryParams}`);
    router.reload({ only: ['questionnaires'] });
  }

  const handlePageChange = page => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('page', page);
    history.pushState(null, null, `?${queryParams}`);
    router.reload({ only: ['questionnaires'] });
  };

  const handleRowsPerPageChange = currentRowsPerPage => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('per_page', currentRowsPerPage);
    history.pushState(null, null, `?${queryParams}`);
    router.reload({ only: ['questionnaires'] });
  };

  const handleCreateAssessment = (questionnaire) => (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const requestPayload = {
      duration_in_seconds: data.get('duration_in_seconds'),
      names: data.get('names').split('\n'),
    };
    router.post(
      `/questionnaires/${questionnaire.id}/assessments`,
      requestPayload,
      { preserveScroll: true }
    );
  };

  const openPDF = (questionnaire) => {
    const options = {
      filename: `${questionnaire.title}.pdf`,
      method: 'open',
      page: {
        margin: Margin.MEDIUM,
      }
    };
    generatePDF(() => document.getElementById(`questionnaire-${questionnaire.id}`), options);
  };

  const QuestionDetails = ({ data: questionnaire }) => {
    return (<Paper sx={{ m: 2, p: 2 }} elevation={3}>
      {!!questionnaire.is_published && <>
        <Button onClick={() => openPDF(questionnaire)} sx={{ mb: 2 }} variant='contained'>Download PDF</Button>
        <TableContainer component={Paper} id={`questionnaire-${questionnaire.id}`} sx={{ mb: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Started At</TableCell>
                <TableCell>Submitted At</TableCell>
                <TableCell>Score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questionnaire.assessments.map((assessment) => (
                <TableRow
                  key={assessment.code}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {assessment.name}
                  </TableCell>
                  <TableCell>{assessment.code}</TableCell>
                  <TableCell>{assessment.started_at}</TableCell>
                  <TableCell>{assessment.submitted_at}</TableCell>
                  <TableCell>{assessment.submitted_at
                    ? `${assessment.total_score}/${questionnaire.total_points}` : null}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box
          autoComplete="off"
          component="form"
          noValidate sx={{ mb: 2 }}
          onSubmit={handleCreateAssessment(questionnaire)}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Duration in seconds"
              type="number"
              name="duration_in_seconds"
              sx={{ width: "50%" }}/>
            <TextField
              fullWidth
              label="Enter names"
              multiline
              maxRows={50}
              name="names"
            />
            <Button type="submit" variant="contained">Create Assessment</Button>
          </Stack>
        </Box>
      </>}
      {!!!questionnaire.is_published && <Typography>
        Publish questionnaire to create assessments.
      </Typography>}
    </Paper>);
  };

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        expandableRowsComponent={QuestionDetails}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handleRowsPerPageChange}
        paginationTotalRows={questionnaires.total}
        paginationDefaultPage={currentPage}
        paginationPerPage={perPage}
        expandableRows
        pagination
        paginationServer />

      <ButtonGroup>
        <Button onClick={handleCreateQuestionnaire}>
          <AddTwoTone /> Create Questionnaire
        </Button>
      </ButtonGroup>
      <Dialog
        fullWidth
        maxWidth='md'
        open={createQuestionnaireModelOpen}
        onClose={handleCreateQuestionnaireModalClose}
        PaperProps={{
          component: 'form',
          onSubmit: (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const formJson = Object.fromEntries(formData.entries());
            router.post(`/questionnaires`, formJson);
            handleCreateQuestionnaireModalClose();
          },
        }}>
        <DialogTitle>Create Questionnaire</DialogTitle>
        <DialogContent>
          <TextField
            label='Title'
            margin='dense'
            name='title'
            variant='standard'
            autoFocus
            fullWidth
            required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCreateQuestionnaireModalClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

List.layout = page => <Layout children={page} title="Questionnaires" />

export default List;
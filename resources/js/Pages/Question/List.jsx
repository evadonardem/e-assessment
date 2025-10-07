import DataTable from 'react-data-table-component';
import Layout from '../Layout'
import { router } from '@inertiajs/react';
import { Box, Button, ButtonGroup, Chip, Icon, Paper, Table, TableBody, TableCell, TableContainer, TableRow, TextField } from '@mui/material';
import { AddTwoTone, Check, CheckTwoTone, DeleteForever, Edit } from '@mui/icons-material';
import React from 'react';
import PropTypes from 'prop-types';

const List = ({ questions }) => {
  const columns = [
    {
      name: 'ID',
      width: "5%",
      selector: row => row.id,
    },
    {
      name: 'Description',
      width: "25%",
      selector: row => <div dangerouslySetInnerHTML={{ __html: row.description_preview }}></div>,
    },
    {
      name: 'Type',
      selector: row => row.type.code,
    },
    {
      name: 'Correct Responses',
      selector: row => row.correct_answers_count,
    },
    {
      name: 'Responses',
      selector: row => row.answers_count,
    },
    {
      name: 'Tags',
      width: "10%",
      wrap: true,
      cell: row => <Box sx={{ p: 2 }}>
        {!!row.tags && row.tags.map((tag, tagIndex) => (<Chip key={`tag-${tagIndex}`} label={tag} onDelete={handleDeleteTag(row.id, row.tags, tag)} sx={{ mb: 1, mr: 1 }}/>))}
      </Box>,
    },
    {
      name: 'Random Options',
      cell: row => (row.is_random_options ? <Icon><Check /></Icon> : null),
    },
    {
      name: 'Published',
      cell: row => (row.is_published ? <Icon><Check /></Icon> : null),
    },
    {
      name: '',
      button: true,
      cell: row => <ButtonGroup
        color="primary"
        size="small"
        variant="text">
        <Button
          onClick={handleShowQuestion(row)}>
          <Edit />
        </Button>
        <Button
          onClick={handleDeleteQuestion(row)}>
          <DeleteForever />
        </Button>
      </ButtonGroup>,
    }
  ];

  const data = questions.data;
  const currentPage = questions.current_page;
  const lastPage = questions.last_page;
  const perPage = questions.per_page ?? 10;

  if (currentPage > lastPage) {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('page', lastPage);
    history.pushState(null, null, `?${queryParams}`);
    router.reload({ only: ['questions'] });
  }

  const handlePageChange = page => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('page', page);
    history.pushState(null, null, `?${queryParams}`);
    router.reload({ only: ['questions'] });
  };

  const handleRowsPerPageChange = currentRowsPerPage => {
    const queryParams = new URLSearchParams(window.location.search);
    queryParams.set('per_page', currentRowsPerPage);
    history.pushState(null, null, `?${queryParams}`);
    router.reload({ only: ['questions'] });
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    router.get(`/questions/create`);
  };
  
  const handleAddTag = (questionId, currentTags) => (e) => {
    if (e.keyCode === 13) {
      currentTags.push(e.target.value);
      router.patch(`/questions/${questionId}`, {
        tags: currentTags,
      }, {
        preserveScroll: true,
      });
    }
  };
  
  const handleDeleteQuestion = (question) => (e) => {
    e.preventDefault();
    router.delete(`/questions/${question.id}`);
  };
  
  const handleDeleteTag = (questionId, currentTags, deleteTag) => (e) => {
    e.preventDefault();
    const index = currentTags.indexOf(deleteTag);
    if (index !== -1) {
      currentTags.splice(index, 1);
      router.patch(`/questions/${questionId}`, {
        tags: currentTags,
      }, {
        preserveScroll: true,
      });
    }
  };
  
  const handleShowQuestion = (question) => (e) => {
    e.preventDefault();
    router.get(`/questions/${question.id}`);
  };

  const QuestionDetails = ({ data: question }) => {
    return (<Paper sx={{ m: 2, ml: 8, p: 2 }} elevation={1}>
      <TextField
          fullWidth
          label="Add tag"
          variant="outlined"
          onKeyDown={handleAddTag(question.id, question.tags ?? [])}/>
      <div dangerouslySetInnerHTML={{ __html: question.description }}></div>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {question.options.map((option, i) => (<TableRow key={`option-${option.id}`}>
              <TableCell>
                {String.fromCharCode(65 + i)}
              </TableCell>
              <TableCell>
                {option.is_correct ? <CheckTwoTone color='success' /> : null}
              </TableCell>
              <TableCell>
                <div dangerouslySetInnerHTML={{ __html: option.description }}></div>
              </TableCell>
            </TableRow>))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>);
  };

  QuestionDetails.propTypes = {
    data: PropTypes.object.isRequired,
  };

  return (
    <React.Fragment>
      <ButtonGroup>
        <Button onClick={handleAddQuestion}>
          <AddTwoTone /> Add Question
        </Button>
      </ButtonGroup>
      <DataTable
        columns={columns}
        data={data}
        expandableRowsComponent={QuestionDetails}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handleRowsPerPageChange}
        paginationTotalRows={questions.total}
        paginationDefaultPage={currentPage}
        paginationPerPage={perPage}
        expandableRows
        pagination
        paginationServer />
    </React.Fragment>
  );
};

List.layout = page => (
  <Layout title="Questions Bucket">
    {page}
  </Layout>
)

List.propTypes = {
  questions: PropTypes.shape({
    data: PropTypes.array.isRequired,
    current_page: PropTypes.number.isRequired,
    last_page: PropTypes.number.isRequired,
    per_page: PropTypes.number,
    total: PropTypes.number.isRequired,
  }).isRequired,
};

export default List;
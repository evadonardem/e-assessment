import DataTable from 'react-data-table-component';
import Layout from '../Layout'
import { router } from '@inertiajs/react';
import { Button, ButtonGroup, Icon, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { AddTwoTone, Check, CheckTwoTone, DeleteForever, Edit } from '@mui/icons-material';

const handleAddQuestion = (e) => {
  e.preventDefault();
  router.get(`/questions/create`);
};

const handleDeleteQuestion = (question) => (e) => {
  e.preventDefault();
  router.delete(`/questions/${question.id}`);
};

const handleShowQuestion = (question) => (e) => {
  e.preventDefault();
  router.get(`/questions/${question.id}`);
};

const List = ({ questions }) => {

  const columns = [
    {
      name: 'ID',
      selector: row => row.id,
    },
    {
      name: 'Description',
      selector: row => <div dangerouslySetInnerHTML={{ __html: row.description_preview }}></div>,
    },
    {
      name: 'Type',
      selector: row => row.type.code,
    },
    {
      name: 'Tags',
      selector: row => row.tags,
    },
    {
      name: 'Random Options',
      cell: row => (!!row.is_random_options ? <Icon><Check /></Icon> : null),
    },
    {
      name: 'Published',
      cell: row => (!!row.is_published ? <Icon><Check /></Icon> : null),
    },
    {
      name: '',
      button: true,
      cell: row => (<>
        {!!!row.is_published && <ButtonGroup
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
        </ButtonGroup>}
      </>),
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

  const QuestionDetails = ({ data: question }) => {
    return (<Paper sx={{ m: 2, ml: 8, p: 2 }} elevation={1}>
      <div dangerouslySetInnerHTML={{ __html: question.description }}></div>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            {question.options.map((option, i) => (<TableRow key={`option-${option.id}`}>
              <TableCell>
                {String.fromCharCode(65 + i)}
              </TableCell>
              <TableCell>
                {!!option.is_correct ? <CheckTwoTone color='success' /> : null}
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

  return (
    <>
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

      <ButtonGroup>
        <Button onClick={handleAddQuestion}>
          <AddTwoTone /> Add Question
        </Button>
      </ButtonGroup>
    </>
  );
};

List.layout = page => <Layout children={page} title="Questions Bucket" />

export default List;
import DataTable from 'react-data-table-component';
import Layout from '../Layout'
import { router } from '@inertiajs/react';
import { Badge, Box, Button, ButtonGroup, Chip, Divider, Fab, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableRow, TextField } from '@mui/material';
import { Abc, Bookmark, Check, Create, DeleteForever, Edit } from '@mui/icons-material';
import PropTypes from 'prop-types';
import { Gauge } from '@mui/x-charts';

const QuestionDetails = ({ data: question, onAddTag, onDeleteTag }) => (<Paper sx={{ m: 2, ml: 8, p: 2 }} elevation={1}>
    <Stack direction="row" useFlexGap flexWrap="wrap" spacing={1}>
        {question.tags.map((tag, tagIndex) => <Chip
            key={`tag-${tagIndex}`}
            label={tag}
            sx={{ mb: 1, mr: 1 }}
            onDelete={onDeleteTag(question.id, question.tags, tag)}/>)}
        <TextField
            size="small"
            label="Add tag"
            variant="outlined"
            onKeyDown={onAddTag(question.id, question.tags ?? [])} />
    </Stack>
    <Divider sx={{ my: 2 }} />
    <div dangerouslySetInnerHTML={{ __html: question.description }} />
    <Divider sx={{ my: 2 }} />
    <TableContainer component={Paper}>
        <Table>
            <TableBody>
                {question.options.map((option, i) => (<TableRow key={`option-${option.id}`}>
                    <TableCell width={1}>
                        <Button color={option.is_correct ? "success" : "inherit"} size="small" variant="contained">
                            {String.fromCharCode(65 + i)}
                        </Button>
                    </TableCell>
                    <TableCell>
                        <div dangerouslySetInnerHTML={{ __html: option.description }} />
                    </TableCell>
                </TableRow>))}
            </TableBody>
        </Table>
    </TableContainer>
</Paper>);

QuestionDetails.propTypes = {
    data: PropTypes.object.isRequired,
    onAddTag: PropTypes.func.isRequired,
    onDeleteTag: PropTypes.func.isRequired,
};

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
            selector: row => <div dangerouslySetInnerHTML={{ __html: row.description_preview }} />,
        },
        {
            name: 'Type',
            center: true,
            selector: row => row.type.code,
        },
        {
            name: 'Correct Responses',
            right: true,
            selector: row => row.correct_answers_count,
        },
        {
            name: 'Responses',
            right: true,
            selector: row => row.answers_count,
        },
        {
            name: 'Accuracy',
            center: true,
            cell: row => row.answers_count > 0 && <Gauge height={100} value={(row.correct_answers_count / row.answers_count * 100).toFixed(1)} />,
        },
        {
            name: 'Tags',
            width: "10%",
            center: true,
            cell: row => <Box sx={{ p: 2 }}>
                <Badge
                    badgeContent={row.tags.length ?? 0}
                    color="secondary"
                >
                    <Bookmark/>
                </Badge>
            </Box>,
        },
        {
            name: 'Actively Used',
            center: true,
            cell: row => (row.sections_count > 0 ? <Check color="success" /> : null),
        },
        {
            name: 'Random Options',
            center: true,
            cell: row => (row.is_random_options ? <Check color="success" /> : null),
        },
        {
            name: 'Published',
            center: true,
            cell: row => (row.is_published ? <Check color="success" /> : null),
        },
        {
            name: '',
            button: true,
            cell: row => <ButtonGroup
                size="small"
                variant="contained">
                <Button
                    color="primary"
                    onClick={handleShowQuestion(row)}>
                    <Edit />
                </Button>
                {(row.sections_count === 0 && row.answers_count === 0) && <Button
                    color="error"
                    onClick={handleDeleteQuestion(row)}>
                    <DeleteForever />
                </Button>}
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

    const handleGenerateQuestions = (e) => {
        e.preventDefault();
        router.get(`/generator/mcq/create`);
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

    return (
        <Box sx={{ mb: 8 }}>
            <DataTable
                columns={columns}
                data={data}
                expandableRowsComponent={({ data: question }) => <QuestionDetails data={question} onAddTag={handleAddTag} onDeleteTag={handleDeleteTag} />}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handleRowsPerPageChange}
                paginationTotalRows={questions.total}
                paginationDefaultPage={currentPage}
                paginationPerPage={perPage}
                expandableRows
                pagination
                paginationServer />

            <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
                <Stack direction="row" spacing={1}>
                    <Fab color="primary" title="Generate MCQs" onClick={handleGenerateQuestions}><Abc /></Fab>
                    <Fab color="secondary" title="Manual Entry" onClick={handleAddQuestion}><Create /></Fab>
                </Stack>
            </Box>
        </Box>
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

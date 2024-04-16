import { Head } from '@inertiajs/react';
import { Container, Paper } from '@mui/material';
import React from 'react';

export default function TakeAssessmentLayout({ children, title }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>
      <Container sx={{ flexGrow: 1 }}>
        <Paper maxWidth={false} elevation={1} sx={{ p: 2, minHeight: "100%" }}>{children}</Paper>
      </Container>
    </>
  );
};
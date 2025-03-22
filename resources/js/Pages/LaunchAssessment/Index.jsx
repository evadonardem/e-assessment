import { HighlightOffTwoTone, PsychologyTwoTone, RocketLaunch, SchoolTwoTone, TimerTwoTone, VisibilityTwoTone } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Typography
} from '@mui/material';
import React, { } from 'react';

const Index = () => {
  return <Container>
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="90vh"
    >
      <Box textAlign="center" alignItems="center">
        <Typography variant="h5">General Instructions</Typography>
        <Divider sx={{ my: 2 }} />
        <Alert icon={<VisibilityTwoTone />} severity="info" sx={{ mb: 1 }}>
          Direct your attention solely to the exam interface or application that is open.
        </Alert>
        <Alert icon={<HighlightOffTwoTone />} severity="info" sx={{ mb: 1 }}>
          Refrain from clicking or interacting with any elements outside the exam window.
        </Alert>
        <Alert icon={<TimerTwoTone />} severity="info" sx={{ mb: 1 }}>
          Make the most of the allocated time by concentrating on answering questions rather than switching windows.
        </Alert>
        <Alert icon={<PsychologyTwoTone />} severity="info" sx={{ mb: 1 }}>
          Understand that switching windows during the exam could be interpreted as cheating and may have serious consequences.
        </Alert>
        <Alert icon={<SchoolTwoTone />} severity="info" sx={{ mb: 1 }}>
          Consider the importance of academic integrity and how adhering to the rule of not switching windows contributes to maintaining it.
        </Alert>
        <Divider sx={{ my: 2 }} />
        <Button variant="contained" startIcon={<RocketLaunch />} onClick={() => {
          // Calculate the width and height of the screen
          const width = window.screen.availWidth;
          const height = window.screen.availHeight;

          // Open a new window with the specified dimensions, removing toolbar and address bar
          const newWindow = window.open(
            '/take-assessment',
            'TakeAssessment',
            `width=${width},height=${height},top=0,left=0,toolbar=no,menubar=no,location=no,resizable=no,scrollbars=yes`
          );

          if (newWindow) {
            newWindow.focus();
          }
        }}>
          Launch Assessment
        </Button>
      </Box>
    </Box>
  </Container>;
};

export default Index;
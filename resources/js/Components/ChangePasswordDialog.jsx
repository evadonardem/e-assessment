import { useForm } from "@inertiajs/react";
import { Button, ButtonGroup, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import PropTypes from 'prop-types';

function ChangePasswordDialog({onClose}) {
    const { data, setData, post, processing, errors } = useForm({
        currPassword: '',
        newPassword: '',
        confNewPassword:'',
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        post('/profile/change-password', {
            onSuccess: () => onClose()
        });
    };

    return <Dialog
        open
        onClose={onClose}
    >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
            <form onSubmit={handleSubmit} id="change-password-form">
                <TextField
                    autoFocus
                    margin="dense"
                    label="Current password"
                    type="password"
                    fullWidth
                    variant="standard"
                    value={data.currPassword}
                    onChange={(e) => setData('currPassword', e.target.value)}
                    error={!!errors.currPassword}
                    helperText={errors.currPassword ?? ''}
                />
                <TextField
                    margin="dense"
                    label="New password"
                    type="password"
                    fullWidth
                    variant="standard"
                    value={data.newPassword}
                    onChange={(e) => setData('newPassword', e.target.value)}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword ?? ''}
                />
                <TextField
                    margin="dense"
                    label="Confirm New password"
                    type="password"
                    fullWidth
                    variant="standard"
                    value={data.confNewPassword}
                    onChange={(e) => setData('confNewPassword', e.target.value)}
                    error={!!errors.confNewPassword}
                    helperText={errors.confNewPassword ?? ''}
                />
            </form>
        </DialogContent>
        <DialogActions>
            <ButtonGroup>
                <Button onClick={onClose} color="secondary" variant="contained">Cancel</Button>
                <Button type="submit" form="change-password-form" color="primary" variant="contained">
                    {processing ? "Updating..." : "Update"}
                </Button>
            </ButtonGroup>
        </DialogActions>
    </Dialog>;
}

ChangePasswordDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
};

export default ChangePasswordDialog;
import { clearCurrentAdmin, findAdminByCredentials, setCurrentAdmin } from '../utils/adminAuth';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';

export function receiveLogin() {
    return {
        type: LOGIN_SUCCESS
    };
}

function loginError(payload) {
    return {
        type: LOGIN_FAILURE,
        payload,
    };
}

function requestLogout() {
    return {
        type: LOGOUT_REQUEST,
    };
}

export function receiveLogout() {
    return {
        type: LOGOUT_SUCCESS,
    };
}

// Logs the user out
export function logoutUser() {
    return (dispatch) => {
        dispatch(requestLogout());
        localStorage.removeItem('authenticated');
        clearCurrentAdmin();
        dispatch(receiveLogout());
    };
}

export function loginUser(creds) {
    return (dispatch) => {
        const admin = findAdminByCredentials(creds.email, creds.password);
        if (admin) {
            localStorage.setItem('authenticated', true);
            setCurrentAdmin(admin);
            dispatch(receiveLogin());
        } else {
            dispatch(loginError('Only registered admins can access the dashboard.'));
        }
    }
}

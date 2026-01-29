import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Cookies from "js-cookie";
import { userLoggedIn } from "@/redux/features/auth/authSlice";

export default function useAuthCheck() {
    const dispatch = useDispatch();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        try {
            const localAuth = Cookies.get('userInfo');
            if (!localAuth) return;

            let auth;
            try {
                auth = JSON.parse(localAuth);
            } catch {
                Cookies.remove('userInfo');
                return;
            }

            if (auth?.accessToken && auth?.user) {
                dispatch(
                    userLoggedIn({
                        accessToken: auth.accessToken,
                        user: auth.user,
                    })
                );
            }
        } finally {
            setAuthChecked(true);
        }
    }, [dispatch]);

    return authChecked;
}

import { Outlet, useNavigation } from "react-router-dom";
import MainNavigation from "../components/MainNavigation";

function RootLayout() {
    // const navigation = useNavigation();

    return (
        <div>
            <header>
                <MainNavigation />
            </header>
            <main>
                {/* {navigation.state === 'loading' && <p>Loading...</p>} */}
                <Outlet />
            </main>
        </div>
    );
}

export default RootLayout;

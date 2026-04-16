import { Link } from "react-router-dom";
import UserForm from "../../components/UserForm";

function NewUserPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-6">New admin</h1>
            <Link to="/users" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors mb-4 inline-block">
                ← Back to Users
            </Link>
            <UserForm />
        </div>
    );
}

export default NewUserPage;

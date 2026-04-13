import { Link, useRouteLoaderData } from "react-router-dom";
import PaymentForm from "../../components/PaymentForm";

function EditPaymentPage() {
  const data = useRouteLoaderData("payment-detail");
  const payment = data?.data || data;

  if (!payment || !payment._id) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-4">
          Payment Not Found
        </h1>
        <Link to="/payments" className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors">
          Back to Payments
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-6">Edit payment</h1>
      <PaymentForm payment={payment} />
    </div>
  );
}

export default EditPaymentPage;

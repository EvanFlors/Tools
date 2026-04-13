import { useSearchParams } from "react-router-dom";
import PaymentForm from "../../components/PaymentForm";

function NewPaymentPage() {
  const [searchParams] = useSearchParams();
  const saleId = searchParams.get("saleId");

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight mb-6">
        Record new payment
      </h1>
      <PaymentForm saleId={saleId} />
    </div>
  );
}

export default NewPaymentPage;

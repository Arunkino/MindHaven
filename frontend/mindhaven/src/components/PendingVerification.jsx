import { Clock } from "lucide-react";

const PendingVerificationMessage = () => (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Account Verification Pending</h2>
        <p className="text-gray-600 mb-6">
          Thank you for signing up as a mentor. Your profile is currently under review. 
          This process may take up to 2 days. We'll notify you once your account is verified.
        </p>
        <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
          <Clock className="text-yellow-500" size={32} />
        </div>
        <p className="text-sm text-gray-500">
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  );

  export default PendingVerificationMessage;
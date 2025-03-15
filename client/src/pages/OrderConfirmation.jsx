import React from "react";
import { Link } from "react-router-dom";

const OrderConfirmation = () => {
  return (
    <div className="mx-auto px-4 md:px-48 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-green-100 text-green-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Custom Order Submitted!
          </h1>
          <p className="text-gray-600">
            Thank you for your custom order request.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="space-y-4">
            <p className="text-gray-700">
              Your custom order request has been successfully submitted. Our
              team will review your requirements and get back to you soon with
              pricing and further details.
            </p>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">
                What happens next?
              </h3>
              <ul className="list-disc list-inside space-y-2 text-blue-700">
                <li>Our team will review your custom order requirements</li>
                <li>We'll assess the feasibility and pricing</li>
                <li>You'll receive a notification with the approved price</li>
                <li>Once approved, we'll begin processing your order</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <Link
            to="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-300"
          >
            View My Orders
          </Link>
          <p>
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Return to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

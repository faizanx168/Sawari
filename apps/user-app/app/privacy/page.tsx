import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy & Terms of Service</h1>
          <p className="text-xl text-gray-600 mb-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-12">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600">
              Sawari is a community-driven ride-sharing platform that connects drivers with passengers. 
              This Privacy Policy and Terms of Service document outlines our commitment to protecting 
              your privacy and the terms under which you use our service.
            </p>
          </section>

          {/* Disclaimer of Liability */}
          <section className="bg-yellow-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer of Liability</h2>
            <p className="text-gray-700">
              Sawari operates as a platform that facilitates connections between drivers and passengers. 
              We are not a transportation provider, and we do not provide transportation services. 
              We are not responsible for any accidents, injuries, or damages that may occur during 
              rides arranged through our platform.
            </p>
            <p className="text-gray-700 mt-4">
              Users of our platform acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>All rides are arranged at the sole risk of the participants</li>
              <li>We do not guarantee the safety, reliability, or quality of any rides</li>
              <li>We are not responsible for the conduct of any users on our platform</li>
              <li>Users should exercise their own judgment and caution when using our service</li>
            </ul>
          </section>

          {/* Data Collection */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4">We collect the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Personal information (name, email, phone number)</li>
                <li>Profile information (profile picture, vehicle details)</li>
                <li>Location data (pickup and dropoff locations)</li>
                <li>Payment information (processed securely through our payment providers)</li>
                <li>Communication data (messages between users)</li>
                <li>Usage data (app interactions, ride history)</li>
              </ul>
            </div>
          </section>

          {/* Data Usage */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Facilitate ride connections between users</li>
                <li>Process payments and transactions</li>
                <li>Send important notifications about your rides</li>
                <li>Improve our platform and user experience</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and ensure platform safety</li>
              </ul>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600 mb-4">As a user of our platform, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the security of your account</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Treat other users with respect and courtesy</li>
                <li>Report any safety concerns or incidents</li>
                <li>Not use the platform for any illegal purposes</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="bg-red-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700">
              To the maximum extent permitted by law, Sawari shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use of or 
              inability to use the service. This includes but is not limited to:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>Personal injury or property damage during rides</li>
              <li>Loss of profits or data</li>
              <li>Service interruptions or technical issues</li>
              <li>User disputes or conflicts</li>
              <li>Third-party actions or content</li>
            </ul>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy or Terms of Service, please contact us at{' '}
                <a href="mailto:faizanx168@gmail.com" className="text-blue-600 hover:text-blue-800">
                  legal@sawari.com
                </a>
              </p>
            </div>
          </section>

          {/* Back to Home */}
          <div className="text-center">
            <Link 
              href="/" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
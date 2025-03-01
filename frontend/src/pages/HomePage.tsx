import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/common';
import { MainLayout } from '../components/layout';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Generate Code',
      description: 'Create code from descriptions in a variety of programming languages',
      icon: (
        <svg className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      path: '/code/generate',
    },
    {
      title: 'Optimize Code',
      description: 'Improve the performance and readability of your existing code',
      icon: (
        <svg className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      path: '/code/optimize',
    },
    {
      title: 'Translate Code',
      description: 'Convert code from one programming language to another',
      icon: (
        <svg className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      path: '/code/translate',
    },
    {
      title: 'Explain Code',
      description: 'Get detailed explanations of complex code snippets',
      icon: (
        <svg className="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      path: '/code/explain',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                Your Intelligent Coding Assistant
              </h1>
              <p className="mt-4 text-lg md:text-xl max-w-3xl">
                CodeAgent helps you generate, optimize, translate, and explain code with AI-powered assistance.
                Streamline your development workflow and focus on what matters most.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white text-primary-700 hover:bg-gray-100 border-0"
                  onClick={() => navigate('/code')}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-white hover:bg-primary-700 border border-white"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="hidden md:block md:w-1/2">
              <img
                src="/hero-image.svg"
                alt="CodeAgent"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Powerful Code Tools
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Discover our suite of AI-powered tools designed to help you code more efficiently
            </p>
          </div>

          <div className="mt-12 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                hoverable
                onClick={() => navigate(feature.path)}
                className="border border-gray-200 hover:border-primary-500 transition-all"
              >
                <div className="flex flex-col items-center text-center p-4">
                  <div className="p-3 bg-primary-100 rounded-full">{feature.icon}</div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 max-w-3xl text-lg text-gray-600 lg:mx-auto">
              Getting started with CodeAgent is easy and straightforward
            </p>
          </div>

          <div className="mt-12">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <span className="text-lg font-bold">1</span>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Choose Your Task</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Select from generating new code, optimizing existing code, translating between languages, or explaining complex code.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <span className="text-lg font-bold">2</span>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Provide Details</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Enter your requirements, paste your code, or describe what you need in natural language.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <span className="text-lg font-bold">3</span>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Get Results</h3>
                  <p className="mt-2 text-base text-gray-600">
                    Receive high-quality code or explanations that you can use immediately in your projects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-700 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold">
              Ready to Supercharge Your Coding?
            </h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto">
              Join thousands of developers who use CodeAgent to streamline their workflow
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-primary-700 hover:bg-gray-100 border-0"
                onClick={() => navigate('/register')}
              >
                Get Started for Free
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};
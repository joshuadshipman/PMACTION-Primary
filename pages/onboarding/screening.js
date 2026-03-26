// pages/onboarding/screening.js
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useApp } from '../../lib/context';
import { db } from '../../lib/firebaseClient';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const ScreeningPage = () => {
  const router = useRouter();
  const { user } = useApp();

  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const questions = [
    {
      id: 'q1',
      text: 'Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'q2',
      text: 'Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'q3',
      text: 'Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep, or sleeping too much?',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
  ];

  useEffect(() => {
    let totalScore = 0;
    Object.keys(answers).forEach(key => {
      const answerIndex = answers[key];
      if (answerIndex !== undefined) {
        totalScore += answerIndex;
      }
    });
    setScore(totalScore);
  }, [answers]);

  const handleAnswerChange = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleFinish = async () => {
    try {
      if (!user) {
        router.push('/login');
        return;
      }

      // Save screening results to Firestore
      const userAssessmentsRef = collection(db, 'user_assessments');
      await addDoc(userAssessmentsRef, {
        userId: user.uid,
        assessmentName: 'Initial Screening',
        score: score,
        answers: answers,
        completedAt: serverTimestamp(),
        totalScore: score // Aligning with the history query in assessments.js
      });

      console.log('Screening Results saved to Firestore');
      router.push('/dashboard');
    } catch (err) {
      console.error('Error saving screening results:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Screening Tool | PMAction</title>
        <meta name="description" content="Complete a brief screening" />
      </Head>

      <div className="w-full max-w-3xl space-y-8">
        {/* Progress Steps */}
        <div className="flex justify-center space-x-4 mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 4
                ? 'bg-teal-600 text-white'
                : step < 4
                  ? 'bg-teal-200 text-teal-800'
                  : 'bg-gray-200 text-gray-500'
                }`}
            >
              {step}
            </div>
          ))}
        </div>

        <div className="bg-white shadow sm:rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Quick Screening Tool</h1>
            <p className="mt-2 text-gray-600">This short questionnaire helps us tailor your experience.</p>
          </div>

          {!isCompleted ? (
            <div className="space-y-8">
              <div>
                <span className="text-sm font-medium text-teal-600 uppercase tracking-wide">
                  Question {currentQuestion + 1} of {questions.length}
                </span>
                <h2 className="mt-2 text-xl font-medium text-gray-900">
                  {questions[currentQuestion].text}
                </h2>
              </div>

              <div className="space-y-4">
                {questions[currentQuestion].options.map((option, index) => (
                  <label
                    key={index}
                    className={`relative block rounded-lg border p-4 cursor-pointer hover:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-colors ${answers[questions[currentQuestion].id] === index
                      ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                      : 'border-gray-300'
                      }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${questions[currentQuestion].id}`}
                        value={index}
                        checked={answers[questions[currentQuestion].id] === index}
                        onChange={() => handleAnswerChange(questions[currentQuestion].id, index)}
                        className="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                      />
                      <span className="ml-3 text-gray-900 font-medium">{option}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentQuestion === 0}
                  className={`px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                  Previous
                </button>
                <button
                  onClick={handleNextQuestion}
                  disabled={answers[questions[currentQuestion].id] === undefined}
                  className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
              <p className="text-gray-600">
                Your screening is complete. Your estimated score is <strong className="text-teal-600">{score}</strong>.
              </p>
              <p className="text-gray-500 text-sm">
                Based on this score, we will provide personalized recommendations.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleFinish}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                >
                  Proceed to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreeningPage;
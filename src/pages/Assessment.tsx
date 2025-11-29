import { useState } from 'react';
import { AlertTriangle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analyzeAssessment, isGroqAvailable } from '../services/groqService';

interface Question {
  id: number;
  text: string;
  weight: number;
}

const questions: Question[] = [
  { id: 1, text: 'Does your partner ever hit, slap, push, kick, or physically hurt you?', weight: 4 },
  { id: 2, text: 'Does your partner threaten to hurt you, your children, or themselves?', weight: 4 },
  { id: 3, text: 'Are you afraid of your partner or do you feel you must be careful about what you say or do?', weight: 3 },
  { id: 4, text: 'Does your partner control where you go, who you see, or what you wear?', weight: 3 },
  { id: 5, text: 'Does your partner insult, humiliate, or put you down regularly?', weight: 2 },
  { id: 6, text: 'Does your partner control all the money and prevent you from having access to it?', weight: 2 },
  { id: 7, text: 'Does your partner pressure or force you into sexual activities you don\'t want?', weight: 4 },
  { id: 8, text: 'Does your partner isolate you from family and friends?', weight: 2 },
];

export function Assessment() {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResult, setShowResult] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleAnswer = (questionId: number, answer: boolean) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach(q => {
      if (answers[q.id] === true) {
        totalScore += q.weight;
      }
    });
    return totalScore;
  };

  const getRiskLevel = (score: number) => {
    if (score >= 10) return { level: 'High Risk', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800', borderColor: 'border-red-500' };
    if (score >= 5) return { level: 'Moderate Risk', color: 'amber', bgColor: 'bg-amber-100', textColor: 'text-amber-800', borderColor: 'border-amber-500' };
    return { level: 'Low Risk', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800', borderColor: 'border-green-500' };
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === questions.length) {
      setShowResult(true);

      // Get AI recommendations if Groq is available
      if (isGroqAvailable()) {
        setIsLoadingAI(true);
        try {
          const recommendations = await analyzeAssessment(answers, questions);
          setAiRecommendations(recommendations);
        } catch (error) {
          console.error('Error getting AI recommendations:', error);
        } finally {
          setIsLoadingAI(false);
        }
      }
    }
  };

  const resetAssessment = () => {
    setAnswers({});
    setShowResult(false);
    setAiRecommendations('');
    setIsLoadingAI(false);
  };

  const score = calculateScore();
  const risk = getRiskLevel(score);
  const allAnswered = Object.keys(answers).length === questions.length;

  if (showResult) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className={`bg-white rounded-lg shadow-lg p-8 border-l-4 ${risk.borderColor}`}>
          <div className="flex items-center gap-4 mb-6">
            {risk.level === 'High Risk' ? (
              <AlertTriangle size={48} className="text-red-600" />
            ) : risk.level === 'Moderate Risk' ? (
              <AlertCircle size={48} className="text-amber-600" />
            ) : (
              <CheckCircle size={48} className="text-green-600" />
            )}
            <div>
              <h2 className="text-3xl font-bold text-[#1E6A8C]">Assessment Result</h2>
              <p className={`text-2xl font-semibold ${risk.textColor}`}>{risk.level}</p>
            </div>
          </div>

          <div className={`${risk.bgColor} rounded-lg p-6 mb-6`}>
            {risk.level === 'High Risk' && (
              <div>
                <p className="text-lg font-semibold mb-3">Your answers indicate you may be in a dangerous situation.</p>
                <p className="mb-3">Please know:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li>You are not alone and help is available</li>
                  <li>What is happening to you is NOT your fault</li>
                  <li>You deserve to be safe</li>
                  <li>There are people who want to help you</li>
                </ul>
                <p className="mt-4 font-semibold">We strongly encourage you to:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                  <li>Call an emergency helpline (numbers at bottom of page)</li>
                  <li>Create a safety plan immediately</li>
                  <li>Tell someone you trust about your situation</li>
                  <li>If in immediate danger, call emergency services</li>
                </ul>
              </div>
            )}

            {risk.level === 'Moderate Risk' && (
              <div>
                <p className="text-lg font-semibold mb-3">Your answers suggest some concerning patterns in your relationship.</p>
                <p className="mb-3">What you're experiencing may be warning signs of abuse. Even if it hasn't escalated to physical violence, emotional abuse and controlling behavior are serious.</p>
                <p className="mt-4 font-semibold">We recommend:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                  <li>Talk to someone you trust about your concerns</li>
                  <li>Create a safety plan to prepare for different scenarios</li>
                  <li>Contact a helpline to discuss your situation</li>
                  <li>Document incidents (keep a journal in a safe place)</li>
                  <li>Trust your instincts - if something feels wrong, it probably is</li>
                </ul>
              </div>
            )}

            {risk.level === 'Low Risk' && (
              <div>
                <p className="text-lg font-semibold mb-3">Your answers suggest your relationship doesn't show major signs of abuse at this time.</p>
                <p className="mb-3">However, if you're concerned about your relationship or feeling uneasy, trust those feelings. You know your situation best.</p>
                <p className="mt-4">Remember:</p>
                <ul className="list-disc ml-6 space-y-2 mt-2">
                  <li>Healthy relationships are built on respect, trust, and equality</li>
                  <li>You have the right to feel safe and valued</li>
                  <li>If something doesn't feel right, it's okay to seek support</li>
                  <li>Resources are available if your situation changes</li>
                </ul>
              </div>
            )}
          </div>

          {/* AI-Powered Personalized Recommendations */}
          {isGroqAvailable() && (
            <div className="mt-6">
              <h3 className="text-xl font-bold text-[#1E6A8C] mb-3">Personalized Recommendations</h3>
              {isLoadingAI ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-[#2B9EB3]" size={24} />
                  <span className="text-gray-700">Generating personalized guidance...</span>
                </div>
              ) : aiRecommendations ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{aiRecommendations}</p>
                </div>
              ) : null}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Link
              to="/safety-plan"
              className="flex-1 bg-[#2B9EB3] hover:bg-[#1E6A8C] text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Create Safety Plan
            </Link>
            <Link
              to="/resources"
              className="flex-1 bg-[#FF6B35] hover:bg-[#e55a2b] text-white text-center py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              View Resources
            </Link>
            <button
              onClick={resetAssessment}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Retake Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#1E6A8C] mb-4">Safety Assessment</h1>
        <p className="text-gray-700 mb-6">
          This confidential assessment helps you understand your situation better. Answer honestly - no one will see your responses.
        </p>

        <div className="space-y-6">
          {questions.map((question) => (
            <div key={question.id} className="border-l-4 border-[#2B9EB3] bg-gray-50 rounded-lg p-6">
              <p className="text-lg font-medium text-gray-800 mb-4">
                {question.id}. {question.text}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => handleAnswer(question.id, true)}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                    answers[question.id] === true
                      ? 'bg-red-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-600'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => handleAnswer(question.id, false)}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                    answers[question.id] === false
                      ? 'bg-green-600 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-green-600'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={`py-4 px-12 rounded-lg font-bold text-lg transition-colors ${
              allAnswered
                ? 'bg-[#2B9EB3] hover:bg-[#1E6A8C] text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {allAnswered ? 'See Results' : `Answer All Questions (${Object.keys(answers).length}/${questions.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}

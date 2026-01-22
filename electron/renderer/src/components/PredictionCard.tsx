import React from 'react';

interface PredictionCardProps {
  homeTeam: string;
  awayTeam: string;
  homeProb: number;
  drawProb: number;
  awayProb: number;
  predictedScore: string;
  confidence: number;
  explanation: string;
  matchDate: string;
}

const PredictionCard: React.FC<PredictionCardProps> = ({
  homeTeam,
  awayTeam,
  homeProb,
  drawProb,
  awayProb,
  predictedScore,
  confidence,
  explanation,
  matchDate
}) => {
  const getProbColor = (prob: number) => {
    if (prob > 0.5) return 'text-green-600 font-bold';
    if (prob > 0.35) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{homeTeam} vs {awayTeam}</h3>
          <p className="text-sm text-gray-500">{new Date(matchDate).toLocaleDateString()}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{predictedScore}</p>
          <p className="text-sm text-gray-600">Confidence: {(confidence * 100).toFixed(1)}%</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">{homeTeam} Win</p>
          <p className={`text-xl font-bold ${getProbColor(homeProb)}`}>
            {(homeProb * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">Draw</p>
          <p className={`text-xl font-bold ${getProbColor(drawProb)}`}>
            {(drawProb * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-600">{awayTeam} Win</p>
          <p className={`text-xl font-bold ${getProbColor(awayProb)}`}>
            {(awayProb * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded mb-2">
        <p className="text-sm font-semibold text-gray-700 mb-1">Prediction Insight:</p>
        <p className="text-sm text-gray-600">{explanation}</p>
      </div>
    </div>
  );
};

export default PredictionCard;

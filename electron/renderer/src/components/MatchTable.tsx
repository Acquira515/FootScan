import React from 'react';

interface MatchTableProps {
  matches: any[];
  onSelectMatch?: (matchId: number) => void;
  loading?: boolean;
}

const MatchTable: React.FC<MatchTableProps> = ({ matches, onSelectMatch, loading }) => {
  if (loading) {
    return <div className="text-center py-8">Loading matches...</div>;
  }

  if (!matches || matches.length === 0) {
    return <div className="text-center py-8 text-gray-500">No matches found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Home Team</th>
            <th className="px-4 py-2 text-left">Away Team</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              <td className="px-4 py-2 text-sm">
                {new Date(match.match_date).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 text-sm font-semibold">{match.home_team_name}</td>
              <td className="px-4 py-2 text-sm">{match.away_team_name}</td>
              <td className="px-4 py-2 text-sm">
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  {match.status}
                </span>
              </td>
              <td className="px-4 py-2 text-center">
                {onSelectMatch && (
                  <button
                    onClick={() => onSelectMatch(match.id)}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Predict
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MatchTable;

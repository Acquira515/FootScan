import React from 'react';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  models?: string[];
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  models = ['poisson', 'negative_binomial', 'hawkes', 'hmm', 'ensemble']
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <label className="block text-sm font-semibold mb-3">Select Model:</label>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {models.map(model => (
          <button
            key={model}
            onClick={() => onModelChange(model)}
            className={`px-3 py-2 rounded font-medium text-sm transition ${
              selectedModel === model
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {model.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelector;
